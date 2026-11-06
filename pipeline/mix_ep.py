"""Episode mix: voice + common stings + episode SFX + music -> EP/audio/mix.wav   usage: mix_ep.py EPDIR"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly, butter, sosfilt

EP = os.path.abspath(sys.argv[1])
SR = 48000
TL = json.load(open(os.path.join(EP, "timeline.json")))
Q = TL.get("meta", {}).get("q", 0)
TOTAL = TL["total"]; N = int((TOTAL + 0.5) * SR)
voice = np.zeros(N); sfx = np.zeros(N); music = np.zeros(N)
rng = np.random.default_rng(Q + 1)
S = lambda s: TL["segs"][s]
def WT(seg, word, k=0):
    ws = [w for w in TL["segs"][seg]["words"] if w["w"].lower().strip(".,!?:;'").replace("'", "").startswith(word.lower().replace("'", ""))]
    return ws[min(k, len(ws) - 1)]["s"] if ws else TL["segs"][seg]["start"]
tRew0, tRew1 = S("wrong4")["end"] + 0.05, S("right1")["start"]

def add(buf, t, sig, g=1.0):
    i = int(max(0, t) * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]; buf[i:i + len(sig)] += sig * g
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=None):
    x = tt(d); e = np.minimum(1, x / max(a, 1e-4))
    if r: e *= np.exp(-x / r)
    return e
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
def tone(f, d, wave="sine", a=0.005, r=0.3):
    x = tt(d); ph = 2*np.pi*f*x
    w = np.sin(ph) if wave == "sine" else (2*(f*x % 1) - 1 if wave == "saw" else np.sign(np.sin(ph)))
    return w * env(d, a, r)
def click(d=0.06, f=2500): return bp(rng.standard_normal(int(d*SR)), 300, f) * env(d, 0.001, 0.012)
def whoosh(d=0.9, up=True):
    n = rng.standard_normal(int(d*SR)); x = tt(d); e = np.sin(np.pi * x / d) ** 2; out = np.zeros_like(n); seg = 2048
    for k in range(0, len(n), seg):
        u = k / len(n); f = 300 + (3000 * u if up else 3000 * (1 - u)); out[k:k+seg] = bp(n[k:k+seg], max(100, f*0.5), min(f*1.5, 20000))
    return out * e
def chord(fs, d, r=0.35): return sum(tone(f, d, "sine", r=r) + 0.3*tone(f*2, d, "sine", r=r*0.6) for f in fs) / len(fs)
def thud():
    d = 0.35; x = tt(d); return np.sin(2*np.pi*(90 - 50*x/d)*x) * env(d, 0.002, 0.08) + 0.3*lp(rng.standard_normal(len(x)), 900) * env(d, 0.001, 0.03)
def pop():
    d = 0.12; x = tt(d); return np.sin(2*np.pi*(500 + 900*x/d)*x) * env(d, 0.002, 0.03)
def plink(f):
    d = 0.18; x = tt(d); return np.sin(2*np.pi*f*(1 + 0.4*x)*x) * env(d, 0.001, 0.04)
def buzzer(): return lp(tone(140, 0.22, "square", r=1), 1800) * 0.6
def squeak(f0=None):
    d = 0.16 + rng.random()*0.12; x = tt(d); f0 = f0 or (1500 + rng.random()*900)
    f = f0 * (1 + 0.35*np.sin(np.pi * x / d)); s = np.sin(2*np.pi*np.cumsum(f)/SR) + 0.3*np.sin(4*np.pi*np.cumsum(f)/SR)
    return bp(s, 900, 5000) * np.sin(np.pi * x / d) ** 0.6
def quack():
    d = 0.32; x = tt(d); f = 520 - 260 * x / d; s = 2*((np.cumsum(f)/SR) % 1) - 1
    return (bp(s, 700, 1800) + 0.5*bp(s, 2200, 3200)) * env(d, 0.01, 0.12) * 2.2
def engine(d, f0, f1, cut=500):
    x = tt(d); f = np.linspace(f0, f1, len(x)); ph = np.cumsum(f) / SR
    return lp(2*(ph % 1) - 1 + 0.3*np.sin(2*np.pi*ph*0.5), cut) * np.minimum(1, x/0.3) * np.minimum(1, (d - x)/0.4)
def ticker(a, b, g=0.22, rate=2.6):
    t = a
    while t < b: add(sfx, t, click(0.025, 4000), g); add(sfx, t + 1/(2*rate), click(0.025, 2500), g*0.7); t += 1/rate

# ---------------- voice ----------------
for sid, s in TL["segs"].items():
    sr, a = wavfile.read(os.path.join(EP, "audio", sid + ".wav"))
    add(voice, s["start"], resample_poly(a.astype(np.float64), SR, sr))
voice = voice / (np.abs(voice).max() + 1e-9) * 0.89

# ---------------- common stings ----------------
add(sfx, S("hook2")["start"] - 0.1, whoosh(0.9), 0.15)
add(sfx, WT("hook2", "What"), pop(), 0.3)
add(sfx, S("wrong1")["start"], buzzer(), 0.5); add(sfx, S("wrong1")["start"] + 0.27, buzzer(), 0.5)
add(sfx, WT("wrong4", "Exam"), thud(), 0.9); add(sfx, WT("wrong4", "Exam") + 0.05, lp(tone(110, 0.9, "saw", r=0.5), 900), 0.35)
add(sfx, tRew0, whoosh(0.95, up=False), 0.35)
for k in range(14): add(sfx, tRew0 + 0.05 + k*0.06, click(0.03, 5000), 0.2)
add(sfx, S("right1")["start"], chord([523.25, 659.25], 0.6), 0.35); add(sfx, S("right1")["start"] + 0.14, chord([783.99, 1046.5], 0.7), 0.3)
ep = WT("right7", "Exam"); add(sfx, ep, thud(), 0.8)
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]): add(sfx, ep + 0.05 + k*0.09, chord([f], 0.9, r=0.45), 0.35)
for k in range(30): add(sfx, ep + 0.05 + rng.random()*1.5, plink(2000 + rng.random()*2500), 0.05)
add(sfx, S("outro")["start"] - 0.2, whoosh(0.9), 0.22)
add(sfx, WT("outro", "Follow"), pop(), 0.3)

# ---------------- episode SFX ----------------
if Q == 2:
    # tank convoy: diesel rumble + track clatter, all the time
    x = np.arange(N) / SR
    rumble = lp(2*((38*x + 3*np.sin(2*np.pi*0.3*x)) % 1) - 1, 160) * 0.5 + lp(rng.standard_normal(N), 120) * 1.5
    sfx += rumble * 0.22
    t = 0.2
    while t < TOTAL - 0.3: add(sfx, t, click(0.03, 1800), 0.10); t += 0.085 + rng.random() * 0.02
    # hero engine in the hook
    add(sfx, 0.0, engine(S("wrong1")["start"] - 0.5, 70, 40), 0.16)
    add(sfx, WT("wrong1", "stop") - 0.3, bp(rng.standard_normal(int(0.8*SR)), 1500, 5000) * env(0.8, 0.02, 0.4), 0.18)  # brakes
    t = S("wrong2")["start"]
    while t < S("wrong3")["start"]: add(sfx, t, click(0.03, 6000), 0.25); t += 0.25
    hb = WT("wrong3", "patience")
    for k, f in enumerate([98, 123.5, 147]): add(sfx, hb - 0.1, lp(tone(f, 0.9, "square", a=0.02, r=2), 1200) * env(0.9, 0.02) * np.minimum(1, (0.9 - tt(0.9)) / 0.1), 0.18)
    ta = WT("wrong3", "aims")
    add(sfx, ta - 0.1, bp(tone(180, 0.7, "saw", r=3), 200, 2000) * np.sin(np.pi*tt(0.7)/0.7), 0.2)   # turret servo
    for k in range(3): add(sfx, ta + 0.1 + k*0.12, tone(1800, 0.06), 0.12)                            # lock-on beeps
    tb = WT("wrong3", "Boom") + 0.05
    d = 2.5; xx = tt(d); boom = lp(rng.standard_normal(len(xx)), 250) * np.exp(-xx/0.6) * 4 + np.sin(2*np.pi*(55 - 20*xx/d)*xx) * np.exp(-xx/0.5) * 1.5 + bp(rng.standard_normal(len(xx)), 800, 6000) * np.exp(-xx/0.15)
    add(sfx, tb, boom, 0.55)
    add(sfx, tb + 0.15, whoosh(1.6), 0.3)
    add(sfx, tb + 2.3, thud(), 0.8); add(sfx, tb + 2.35, click(0.3, 3000), 0.5)
    for k in range(6): add(sfx, tb + 2.5 + k*0.2, click(0.05, 4000), 0.12*(1 - k/6))
    ticker(WT("right3", "Indicate") - 0.1, WT("right5", "Slot") + 1.2)
    fl = WT("right3", "flag")
    for k in range(10): add(sfx, fl - 0.2 + k*0.11, bp(rng.standard_normal(int(0.08*SR)), 300, 1500) * env(0.08, 0.005, 0.03), 0.18)
    add(sfx, fl - 0.1, pop(), 0.3)
    bu = WT("right4", "bushes")
    for k in range(6): add(sfx, bu - 0.2 + k*0.12, bp(rng.standard_normal(int(0.25*SR)), 1500, 7000) * env(0.25, 0.01, 0.08), 0.18); add(sfx, bu - 0.2 + k*0.12, pop(), 0.12)
    add(sfx, WT("right2", "zipper"), whoosh(0.35), 0.25)
    for k in range(5): add(sfx, WT("right5", "One") - 0.2 + k*0.18, pop(), 0.28)
    add(sfx, WT("right6", "braking"), whoosh(0.7), 0.15); add(sfx, WT("right6", "Very"), whoosh(1.0), 0.25)
    add(sfx, WT("right6", "thank") + 0.2, chord([659.25, 830.6], 0.6), 0.25)
    sa = WT("right6", "confetti") - 0.1
    add(sfx, sa, thud(), 0.6); add(sfx, sa, click(0.15, 6000), 0.6)
    pt = tt(0.9); horn = bp(2*((np.cumsum(np.linspace(420, 520, len(pt)))/SR) % 1) - 1, 300, 3000) * np.minimum(1, pt/0.05) * np.minimum(1, (0.9 - pt)/0.1)
    add(sfx, sa + 0.15, horn, 0.18)
    for k in range(25): add(sfx, sa + rng.random()*1.2, plink(2000 + rng.random()*2500), 0.05)
    for tp in [WT("hook1", "ends"), WT("hook1", "merge"), WT("hook2", "looking")]: add(sfx, tp, pop(), 0.28)
elif Q == 3:
    add(sfx, 0.0, engine(S("wrong1")["start"], 55, 45, 400), 0.2)
    to = WT("hook1", "flies") - 0.05
    add(sfx, to, thud(), 0.9); add(sfx, to + 0.05, click(0.2, 3000), 0.6)
    t = to + 0.1
    while t < to + 3.6: add(sfx, t, squeak(), 0.12 + 0.1*rng.random()); t += 0.02 + rng.random()*0.05
    for k in range(40): add(sfx, to + 0.2 + rng.random()*3.4, plink(600 + rng.random()*600), 0.08)
    vi = WT("hook2", "very") - 0.2
    d = 1.4; xx = tt(d); hiss = bp(rng.standard_normal(len(xx)), 2000, 9000) * np.minimum(1, xx/0.2) * np.minimum(1, (d - xx)/0.2)
    add(sfx, vi, hiss, 0.25); add(sfx, vi + 1.2, squeak(700), 0.5)
    ts = WT("wrong1", "slam")
    d = 1.6; xx = tt(d); scr = bp(rng.standard_normal(len(xx)), 1800, 4200) * (0.6 + 0.4*np.sin(2*np.pi*14*xx)) * env(d, 0.01) * np.minimum(1, (d - xx)/0.3)
    add(sfx, ts - 0.05, scr, 0.35)
    add(sfx, WT("wrong2", "spins"), whoosh(0.6), 0.25)
    t = ts + 0.3; th = WT("wrong2", "hits") + 0.1
    while t < th: add(sfx, t, squeak(), 0.12); t += 0.08 + rng.random()*0.12
    xx = tt(0.8); boing = np.sin(2*np.pi*np.cumsum(180 + 120*np.sin(2*np.pi*9*xx)*np.exp(-xx/0.3))/SR) * env(0.8, 0.005, 0.35)
    add(sfx, th, boing, 0.6); add(sfx, th, thud(), 0.6); add(sfx, th, squeak(600), 0.6)
    add(sfx, th + 0.2, whoosh(2.5), 0.3)
    tl = WT("wrong3", "lands") + 0.05
    add(sfx, tl, thud(), 0.9)
    for k in range(80): add(sfx, tl + rng.random()*0.8, squeak(), 0.13)
    add(sfx, WT("wrong3", "squeaks") + 0.2, squeak(2100), 0.5)
    ticker(WT("right2", "Hazard") - 0.1, S("right7")["end"] + 0.5, 0.2)
    add(sfx, S("right1")["start"] + 0.5, engine(WT("right3", "Small") - S("right1")["start"], 60, 35, 350), 0.15)
    rw = WT("right2", "wipers") - 0.7
    for k in range(45): tq = rw + 1.2 + rng.random()*3.2; add(sfx, tq, thud(), 0.05); add(sfx, tq, squeak(), 0.11)
    xs = tt(0.35); wsq = np.sin(2*np.pi*np.cumsum(900 + 400*np.sin(2*np.pi*3*xs))/SR) * np.sin(np.pi*xs/0.35) * 0.4
    for k in range(5): add(sfx, WT("right2", "wipers") + k*0.3, wsq, 0.22)
    t = WT("right3", "Roll")
    while t < S("right3")["end"] + 0.3: add(sfx, t, squeak(), 0.25 + 0.15*rng.random()); t += 0.35 + rng.random()*0.4
    hk = WT("right4", "Honk")
    for f in [392, 494]: add(sfx, hk - 0.05, lp(tone(f, 0.45, "square", a=0.01, r=2), 2500) * np.minimum(1, (0.45 - tt(0.45))/0.05), 0.2)
    add(sfx, hk + 0.15, squeak(2600), 0.6); add(sfx, hk + 0.2, whoosh(0.8), 0.25); add(sfx, hk + 1.05, thud(), 0.5)
    add(sfx, WT("right4", "Giant"), pop(), 0.3)
    add(sfx, WT("right5", "golden"), chord([1046.5, 1318.5, 1568], 1.2, r=0.6), 0.25)
    for k in range(8): add(sfx, WT("right5", "golden") + k*0.07, plink(2500 + k*200), 0.06)
    for k in range(3): add(sfx, WT("right6", "report") + k*0.18, tone(1400, 0.12), 0.15)
    add(sfx, WT("hook2", "Ten"), pop(), 0.3)


# ---------------- generic cue-driven SFX (episodes 4+) ----------------
def sizzle(d=1.6):
    x = tt(d); n = hp(rng.standard_normal(len(x)), 3000) * (0.5 + 0.5 * (rng.random(len(x)) < 0.02)) * env(d, 0.05) * np.minimum(1, (d - x) / 0.4); return n * 0.8
def bloop():
    d = 0.35; x = tt(d); f = 260 * np.exp(-x * 5) + 90; return np.sin(2*np.pi*np.cumsum(f)/SR) * env(d, 0.005, 0.12)
def moo():
    d = 1.3; x = tt(d); f = 110 + 25*np.sin(np.pi*x/d); s = 2*((np.cumsum(f)/SR) % 1) - 1
    return (bp(s, 300, 900) + 0.6*bp(s, 900, 1600)) * np.sin(np.pi*x/d) ** 0.7 * 1.5
def servo(d=0.8): return bp(tone(160, d, "saw", r=3), 200, 2500) * np.sin(np.pi*tt(d)/d)
def honk(n=1):
    out = np.zeros(int(SR * (0.35 * n + 0.1)))
    for k in range(n):
        h = sum(lp(tone(f, 0.28, "square", a=0.01, r=2), 2500) for f in (392, 494)) * np.minimum(1, (0.28 - tt(0.28))/0.04)
        i = int(k * 0.35 * SR); out[i:i+len(h)] += h
    return out
def meow(angry=False):
    d = 0.9 if angry else 0.6; x = tt(d); f = (500 if angry else 700) + 300*np.sin(np.pi*x/d) - (250*x/d if angry else 0)
    s = 2*((np.cumsum(f)/SR) % 1) - 1; s = bp(s, 400, 3000) + (0.6*hp(rng.standard_normal(len(x)), 2500) if angry else 0)
    return s * np.sin(np.pi*x/d) ** 0.5 * 1.4
def hiss(d=1.0): return bp(rng.standard_normal(int(d*SR)), 2500, 9000) * env(d, 0.05) * np.minimum(1, (d - tt(d))/0.3)
def purr(d=3.0): x = tt(d); return lp(rng.standard_normal(len(x)), 150) * (0.5 + 0.5*np.sin(2*np.pi*24*x)) * 3 * np.minimum(1, x/0.3) * np.minimum(1, (d - x)/0.3)
def swipe(): return whoosh(0.5)
def laser():
    d = 0.5; x = tt(d); return np.sin(2*np.pi*np.cumsum(2400 - 1800*x/d)/SR) * env(d, 0.005, 0.2) * 0.7
def ufo_hum(d):
    x = tt(d); return (np.sin(2*np.pi*(70 + 3*np.sin(2*np.pi*0.5*x))*x) + 0.5*np.sin(2*np.pi*(141 + 9*np.sin(2*np.pi*0.7*x))*x) + 0.25*np.sin(2*np.pi*(420 + 40*np.sin(2*np.pi*2*x))*x)) * np.minimum(1, x/0.5) * np.minimum(1, (d - x)/0.5)
def beam(d=2.0):
    x = tt(d); f = 300 + 900*x/d; return (np.sin(2*np.pi*np.cumsum(f)/SR) + 0.5*np.sin(2*np.pi*np.cumsum(f*1.5)/SR)) * np.sin(np.pi*x/d) * 0.6
def static(d=1.2): return bp(rng.standard_normal(int(d*SR)), 1000, 6000) * env(d, 0.02) * np.minimum(1, (d - tt(d))/0.2)
def alien_music(d=3.0):
    out = np.zeros(int(d*SR)); t0 = 0
    while t0 < d - 0.2:
        f = 200 * 2 ** (rng.integers(0, 13) / 12 + rng.random()*0.3); add_local = tone(f, 0.25, "square", r=0.12) * 0.5
        i = int(t0*SR); out[i:i+len(add_local)] += add_local[:len(out)-i]; t0 += 0.14
    return lp(out, 3000)
def poof(): return whoosh(0.7) * 0.8 + np.concatenate([thud(), np.zeros(int(0.35*SR))])[:int(0.7*SR)] * 0.5
def boom_sfx():
    d = 2.2; xx = tt(d); return lp(rng.standard_normal(len(xx)), 250) * np.exp(-xx/0.5) * 4 + np.sin(2*np.pi*(55 - 20*xx/d)*xx) * np.exp(-xx/0.5) * 1.5
def jet_sfx(d=4.2):
    x = tt(d); n = rng.standard_normal(len(x)); sw = np.clip(x / (d*0.55), 0, 1)
    roar = lp(n, 900) * 1.6 + bp(n, 1500, 5000) * 0.35
    f = 1800 + 1400 * sw; whine = np.sin(2*np.pi*np.cumsum(f)/SR) * 0.12
    e = np.minimum(1, (x/(d*0.5))**2) * np.minimum(1, (d - x)/1.6)
    return (roar + whine) * e
def roar_sfx(d=1.5):
    x = tt(d); f = 70 + 40*np.sin(np.pi*x/d); ph = np.cumsum(f)/SR; saw = 2*(ph % 1) - 1
    g = lp(saw, 900) * (0.7 + 0.3*np.sin(2*np.pi*23*x)) + 0.6*bp(rng.standard_normal(len(x)), 200, 1500)
    return g * np.minimum(1, x/0.12) * np.minimum(1, (d - x)/0.5) * 1.3
def crack_sfx():
    o = np.zeros(int(0.6*SR))
    for k in range(6):
        c = click(0.05, 5000) * (1.4 - k*0.15); j = int((k*0.07 + rng.random()*0.03)*SR); o[j:j+len(c)] += c[:len(o)-j]
    return o * 2.2
def chirp_sfx():
    o = np.zeros(int(0.5*SR))
    for k in range(2):
        d = 0.14; x = tt(d); f = 2200 + 1400*np.sin(np.pi*x/d); s_ = np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*x/d); j = int(k*0.2*SR); o[j:j+len(s_)] += s_
    return o * 0.7
def rev(d=1.4): return engine(d, 45, 140, 700)
def beepbeep(): o = np.zeros(int(0.5*SR)); b = tone(1500, 0.1); o[:len(b)] += b; o[int(0.2*SR):int(0.2*SR)+len(b)] += b; return o
def party_loop(d=5.0):
    o = np.zeros(int(d*SR)); beat = 0.42
    for i in range(int(d/beat)):
        k = thud(); j = int(i*beat*SR); o[j:j+len(k)] += k[:len(o)-j]*0.9
        if i % 2 == 1:
            c = chord([523.3, 659.3, 784.0], 0.25, r=0.12); o[j:j+len(c)] += c[:len(o)-j]*0.5
    return o * np.minimum(1, (d - tt(d))/0.6)
def slurp_sfx():
    d1 = 0.16; x = tt(d1); f = 250 + 2400 * (x/d1)**1.5; s1 = np.sin(2*np.pi*np.cumsum(f)/SR) * env(d1, 0.003) * 0.8
    d2 = 0.22; x2 = tt(d2); f2 = 900 * np.exp(-x2*14) + 140; s2 = np.sin(2*np.pi*np.cumsum(f2)/SR) * env(d2, 0.002, 0.08)
    return np.concatenate([s1, np.zeros(int(0.05*SR)), s2])
def pins_sfx():
    o = np.zeros(int(1.0*SR))
    for k in range(9):
        c = click(0.07, 3500) * (1.6 - k*0.12); j = int((0.03 + k*0.075 + rng.random()*0.03)*SR); n = min(len(c), len(o)-j); o[j:j+n] += c[:n]
    t1 = thud(); o[:len(t1)] += t1[:len(o)]*0.8
    return o
def lullaby_sfx(d=6.0):
    o = np.zeros(int(d*SR)); notes = [784.0, 659.3, 523.3, 659.3, 784.0, 659.3, 587.3, 523.3, 659.3, 523.3, 392.0, 523.3]
    for i, f in enumerate(notes):
        tn = tone(f, 0.9, "sine", a=0.01, r=0.35) + 0.3*tone(f*2, 0.9, "sine", a=0.01, r=0.2); j = int(i*0.48*SR); n = min(len(tn), len(o)-j)
        if n > 0: o[j:j+n] += tn[:n]*0.5
    return o * np.minimum(1, (d - tt(d))/0.8)
def snore_sfx(d=1.6):
    x = tt(d); return lp(rng.standard_normal(len(x)), 300) * np.sin(np.pi*x/d)**2 * (0.6 + 0.4*np.sin(2*np.pi*28*x)) * 1.4
def ding_sfx():
    return chord([1318.5, 2637], 0.7, r=0.25) * 1.1
def boing_sfx(d=0.7):
    x = tt(d); f = 180 + 220 * np.exp(-x * 4) * (1 + 0.5 * np.sin(2*np.pi*14*x)); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph) * env(d, 0.005, 0.3) * 0.9
def tilt_sfx():
    return lp(tone(220, 0.9, "square", r=0.8) + tone(233, 0.9, "square", r=0.8), 1500) * 0.6
def drumroll_sfx(d=3.6):
    o = np.zeros(int(d*SR)); t_ = 0.0
    while t_ < d - 0.1:
        j = int(t_*SR); h = bp(rng.standard_normal(int(0.06*SR)), 150, 2500) * env(0.06, 0.002, 0.02); n = min(len(h), len(o)-j); o[j:j+n] += h[:n] * (0.35 + 0.65 * t_ / d); t_ += 0.045
    return o
def blink_sfx():
    return bp(rng.standard_normal(int(0.12*SR)), 2000, 8000) * env(0.12, 0.002, 0.03) * 1.4 + tone(1600, 0.12) * env(0.12, 0.002, 0.03) * 0.4
def crowd_sfx(d=3.0):
    x = tt(d); n = bp(rng.standard_normal(len(x)), 400, 3500)
    am = 0.6 + 0.4 * np.sin(2*np.pi*3.1*x) * np.sin(2*np.pi*0.7*x)
    return n * am * np.minimum(1, x / 0.25) * np.minimum(1, (d - x) / 0.8) * 1.6
def waves_sfx(d=6.0):
    x = tt(d); return lp(rng.standard_normal(len(x)), 900) * (0.35 + 0.65 * np.sin(np.pi * ((x / 2.6) % 1)) ** 2) * np.minimum(1, x / 0.8) * np.minimum(1, (d - x) / 1.0) * 1.5
def baa_sfx(d=0.7):
    x = tt(d); f = 330 * (1 + 0.06 * np.sin(2*np.pi*22*x)) * (1 - 0.15 * x / d); ph = 2*np.pi*np.cumsum(f)/SR
    s = np.sin(ph) + 0.5*np.sin(2*ph) + 0.3*np.sin(3*ph) + 0.2*np.sin(5*ph); return lp(s, 2500) * env(d, 0.03, 0.25) * 0.6
def neigh_sfx(d=1.0):
    x = tt(d); f = 900 - 500 * x / d + 120 * np.sin(2*np.pi*14*x); ph = 2*np.pi*np.cumsum(f)/SR
    return lp(np.sin(ph) + 0.4*np.sin(2*ph), 3000) * env(d, 0.02, 0.4) * 0.6
def burner_sfx(d=1.2):
    x = tt(d); return bp(rng.standard_normal(len(x)), 150, 1800) * np.minimum(1, x / 0.08) * np.minimum(1, (d - x) / 0.3) * 1.3
LIB = {"pop": pop, "baa": baa_sfx, "neigh": neigh_sfx, "burner": burner_sfx, "crowd": crowd_sfx, "waves": waves_sfx, "ding": ding_sfx, "boing": boing_sfx, "tilt": tilt_sfx, "drumroll": drumroll_sfx, "blinkfx": blink_sfx, "thud": thud, "whoosh": lambda: whoosh(0.8), "sizzle": sizzle, "bloop": bloop, "moo": moo, "servo": servo, "honk": lambda: honk(1), "honk3": lambda: honk(3),
       "meow": meow, "angry": lambda: meow(True), "hiss": hiss, "swipe": swipe, "laser": laser, "beam": beam, "static": static, "alien": alien_music, "poof": poof, "boom": boom_sfx,
       "rev": rev, "beep": beepbeep, "chime": lambda: chord([1046.5, 1318.5, 1568], 1.0, r=0.5), "buzz": buzzer, "squeak": squeak, "quack": quack, "plink": lambda: plink(2000),
       "splash": lambda: bp(rng.standard_normal(int(1.2*SR)), 300, 5000) * env(1.2, 0.005, 0.35) * 1.2,
       "party": lambda: party_loop(), "jet": jet_sfx, "roar": roar_sfx, "crack": crack_sfx, "chirp": chirp_sfx, "lullaby": lullaby_sfx, "snore": snore_sfx, "pins": pins_sfx, "slurp": slurp_sfx,
       "shiphorn": lambda: lp(tone(73, 2.2, "saw", a=0.08, r=4) + tone(110, 2.2, "saw", a=0.08, r=4), 700) * 0.8 * np.minimum(1, (2.2 - tt(2.2)) / 0.3)}
def whistle_sfx(d=0.9):
    x = tt(d); f = np.where(x < 0.3, 2400, 2400 + 900 * np.clip((x - 0.35) / 0.15, 0, 1)) * (1 + 0.025 * np.sin(2*np.pi*38*x)); ph = 2*np.pi*np.cumsum(f)/SR
    s = np.sin(ph) * (0.8 + 0.2 * rng.standard_normal(len(x)) * 0.3); g = np.where((x > 0.28) & (x < 0.36), 0.15, 1.0); return s * g * env(d, 0.02, 0.15) * 0.5
LIB["whistle"] = whistle_sfx
def rooster_sfx():
    parts = [(0.16, 650, 700), (0.14, 820, 880), (0.18, 900, 980), (0.55, 1000, 760)]; out = []
    for d, f0, f1 in parts:
        x = tt(d); f = np.linspace(f0, f1, len(x)) * (1 + 0.03 * np.sin(2*np.pi*30*x)); ph = 2*np.pi*np.cumsum(f)/SR
        s_ = (np.sin(ph) + 0.6*np.sin(2*ph) + 0.35*np.sin(3*ph) + 0.15*np.sin(4*ph)) * env(d, 0.015, 0.06); out.append(s_); out.append(np.zeros(int(0.03*SR)))
    return lp(np.concatenate(out), 4000) * 0.55
def bell_sfx():
    o = np.zeros(int(0.9*SR))
    for st in (0.0, 0.22):
        x = tt(0.6); s_ = (np.sin(2*np.pi*2350*x) + 0.5*np.sin(2*np.pi*3530*x) + 0.3*np.sin(2*np.pi*5100*x)) * np.exp(-x*7) * (0.6 + 0.4*np.sign(np.sin(2*np.pi*28*x))*0.5)
        i = int(st*SR); o[i:i+len(s_)] += s_[:len(o)-i]
    return o * 0.4
def shutter_sfx():
    o = np.zeros(int(0.45*SR)); c1 = bp(rng.standard_normal(int(0.03*SR)), 1500, 8000) * env(0.03, 0.001, 0.02); o[:len(c1)] += c1 * 1.2
    i = int(0.06*SR); c2 = bp(rng.standard_normal(int(0.04*SR)), 1000, 6000) * env(0.04, 0.001, 0.03); o[i:i+len(c2)] += c2
    x = tt(0.3); wh = np.sin(2*np.pi*np.cumsum(np.linspace(2600, 3400, len(x)))/SR) * env(0.3, 0.02, 0.1) * 0.12; i = int(0.12*SR); o[i:i+len(wh)] += wh[:len(o)-i]
    return o * 0.9
LIB["shutter"] = shutter_sfx
LIB["rooster"] = rooster_sfx; LIB["bell"] = bell_sfx
def march_bed(d):
    out = np.zeros(int(d * SR)); t_ = 0.0; k = 0
    while t_ < d - 0.3:
        th = thud(); th = th[: int(0.25 * SR)] * (1.0 if k % 2 == 0 else 0.7); i = int(t_ * SR); n = min(len(th), len(out) - i); out[i:i+n] += th[:n]
        sn = bp(rng.standard_normal(int(0.06*SR)), 1500, 6000) * env(0.06, 0.002, 0.04) * 0.4; n = min(len(sn), len(out) - i); out[i:i+n] += sn[:n]
        t_ += 60 / 132 / 1; k += 1
    return out
def clack_one():
    d = 0.09; n = bp(rng.standard_normal(int(d*SR)), 1800, 7000) * env(d, 0.0008, 0.035); x = tt(d)
    return (n * 0.8 + np.sin(2*np.pi*(1300 + 400*rng.random())*x) * env(d, 0.001, 0.025) * 0.5)
def clack_bed(d):
    out = np.zeros(int(d * SR)); t_ = 0.0
    while t_ < d - 0.1:
        c = clack_one() * (0.6 + 0.4 * rng.random()); i = int(t_ * SR); n = min(len(c), len(out) - i); out[i:i+n] += c[:n]; t_ += 0.075 + 0.03 * rng.random()
    return out
LIB["clack"] = clack_one
def alarm_sfx(d=2.2):
    x = tt(d); f = 900 + 500 * (np.sin(2*np.pi*2.2*x) > 0); ph = 2*np.pi*np.cumsum(f)/SR
    return lp(np.sign(np.sin(ph)) * 0.35 + np.sin(ph) * 0.4, 3500) * env(d, 0.01, 0.15) * 0.8
def splat_sfx():
    th = thud()[: int(0.4*SR)]; sq = bp(rng.standard_normal(int(0.35*SR)), 200, 1800) * env(0.35, 0.003, 0.25) * 0.9
    o = np.zeros(int(0.5*SR)); o[:len(th)] += th; o[:len(sq)] += sq; return o
def sneak_bed(d):
    out = np.zeros(int(d * SR)); notes = [196, 0, 233, 0, 262, 0, 233, 0, 196, 0, 175, 0, 196, 0, 147, 0]; t_ = 0.0; k = 0
    while t_ < d - 0.3:
        f = notes[k % len(notes)]
        if f:
            n_ = tone(f, 0.22, "sine", a=0.002, r=0.15) + 0.4 * tone(f * 2, 0.22, "sine", a=0.002, r=0.08); i = int(t_ * SR); m = min(len(n_), len(out) - i); out[i:i+m] += n_[:m] * 0.8
        t_ += 0.2; k += 1
    return out
LIB["alarm"] = alarm_sfx; LIB["splat"] = splat_sfx
def fanfare_sfx():
    o = np.zeros(int(1.9*SR)); seq = [(523.3, 0.0, 0.14), (523.3, 0.16, 0.14), (523.3, 0.32, 0.14), (659.3, 0.5, 0.3), (523.3, 0.85, 0.16), (659.3, 1.03, 0.16), (784.0, 1.22, 0.62)]
    for f, t0, d in seq:
        x = tt(d); ph = 2*np.pi*f*x*(1 + 0.004*np.sin(2*np.pi*6*x)); s_ = sum((0.6/k) * np.sin(k*ph) for k in range(1, 7)); s_ = lp(s_, 4200) * env(d, 0.012, 0.08)
        j = int(t0*SR); n = min(len(s_), len(o)-j); o[j:j+n] += s_[:n]
    return o * 0.75
def clang_sfx():
    d = 0.9; x = tt(d); s_ = sum(np.sin(2*np.pi*f*x) * np.exp(-x*k) for f, k in [(523, 5), (1187, 6), (1903, 8), (2711, 10)]) / 3
    return (s_ + bp(rng.standard_normal(len(x)), 2000, 8000) * np.exp(-x*40) * 0.6) * 0.8
def chomp_sfx():
    o = np.zeros(int(0.45*SR)); c1 = bp(rng.standard_normal(int(0.08*SR)), 300, 3000) * env(0.08, 0.002, 0.05) * 1.3; o[:len(c1)] += c1
    th = thud()[: int(0.3*SR)] * 0.7; j = int(0.05*SR); n = min(len(th), len(o)-j); o[j:j+n] += th[:n]; return o
def burp_sfx(d=0.8):
    x = tt(d); f = 95 + 25*np.sin(2*np.pi*3*x); ph = 2*np.pi*np.cumsum(f)/SR
    return lp(np.sign(np.sin(ph)) * 0.5 + bp(rng.standard_normal(len(x)), 80, 600) * 0.6, 900) * env(d, 0.03, 0.25) * 1.2

def jingle_sfx(d=2.6):
    # ice-cream van tune: bright music-box notes with a little siren-like wobble
    notes = [72, 76, 79, 76, 72, 74, 77, 74, 72, 79, 84, 79]; nd = d / len(notes); out = np.zeros(int(d * SR))
    for k, n in enumerate(notes):
        f = 440 * 2 ** ((n - 69) / 12); x = tt(nd * 1.6); fw = f * (1 + 0.012 * np.sin(2*np.pi*6*x))
        ph = np.cumsum(fw) / SR; sg = (np.sin(2*np.pi*ph) + 0.3*np.sin(4*np.pi*ph) + 0.15*np.sin(6*np.pi*ph)) * env(nd * 1.6, 0.004, 0.18)
        i = int(k * nd * SR); m = min(len(sg), len(out) - i); out[i:i+m] += sg[:m]
    return out * 0.7
LIB["jingle"] = jingle_sfx
LIB["fanfare"] = fanfare_sfx; LIB["clang"] = clang_sfx; LIB["chomp"] = chomp_sfx; LIB["burp"] = burp_sfx
def gallop_bed(d):
    out = np.zeros(int(d * SR)); t_ = 0.0
    while t_ < d - 0.3:
        for k, off in enumerate([0.0, 0.09, 0.17]):
            th = thud()[: int(0.12*SR)] * 0.45; c = clack_one() * 0.7; i = int((t_ + off) * SR)
            for sg in (th, c):
                n = min(len(sg), len(out) - i)
                if n > 0: out[i:i+n] += sg[:n] * (0.7 + 0.3 * rng.random())
        t_ += 0.42
    return out
SC = json.load(open(os.path.join(EP, "script.json")))
for cue in SC.get("cues", []):
    seg, word, name, g = cue[:4]; off = cue[4] if len(cue) > 4 else 0
    add(sfx, WT(seg, word) + off, LIB[name](), g)
for bed in SC.get("beds", []):
    kind, a_, b_, g = bed
    ta = TL["segs"][a_[0]]["start"] if isinstance(a_, list) else a_; tb = TL["segs"][b_[0]]["end"] if isinstance(b_, list) else b_
    d = max(0.5, tb - ta)
    if kind == "ticker": ticker(ta, tb, g); continue
    sig = {"lava": lambda d: lp(rng.standard_normal(int(d*SR)), 180) * 2.5, "ufo": ufo_hum, "purr": purr, "engine": lambda d: engine(d, 45, 55, 400), "march": march_bed, "clack": clack_bed, "sneak": sneak_bed, "gallop": gallop_bed, "wind": lambda d: lp(rng.standard_normal(int(d*SR)), 600) * 0.8}[kind](d)
    add(sfx, ta, sig * np.minimum(1, tt(d)/0.5)[:len(sig)] * np.minimum(1, (d - tt(d))/0.5)[:len(sig)], g)
for blp in SC.get("bloops", []):  # [start, end, rate, gain]
    t_ = blp[0]
    while t_ < blp[1]: add(sfx, t_, bloop(), blp[3] * (0.5 + rng.random()*0.5)); t_ += rng.random() * 2 / blp[2]

# ---------------- music ----------------
bpm = 104; beat = 60 / bpm
def pluck(f, d=0.5):
    x = tt(d); s = np.sin(2*np.pi*f*x) + 0.35*np.sin(2*np.pi*2*f*x) + 0.12*np.sin(2*np.pi*3*f*x); return s * env(d, 0.003, 0.16)
def bass(f, d):
    x = tt(d); return lp(2*((f*x) % 1) - 1, 300) * env(d, 0.01, 0.6)
n2f = lambda n: 440 * 2 ** ((n - 69) / 12)
major = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
minor = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]]
tense = [[57, 60, 64], [57, 60, 64], [53, 57, 60], [52, 56, 59]]
t = 0.3; bar = 0
while t < TOTAL - 1.0:
    prog = tense if t < S("wrong1")["start"] - 0.2 else minor if t < S("right1")["start"] - 0.2 else major
    ch = prog[bar % 4]
    add(music, t, bass(n2f(ch[0] - 24), beat * 4), 0.35)
    for k, p in enumerate([0, 1, 2, 1, 0, 2, 1, 2]): add(music, t + k * beat / 2, pluck(n2f(ch[p] + 12)), 0.22)
    t += beat * 4; bar += 1
    if S("wrong4")["end"] < t < S("right1")["start"]: t = S("right1")["start"] - 0.1
SW = TL.get("meta", {}).get("musicSwap") or json.load(open(os.path.join(EP, "script.json"))).get("meta", {}).get("musicSwap")
if SW:
    tsw = WT(SW[0], SW[1]) - 0.3; i0 = int(tsw * SR)
    music[i0:] *= np.clip(1 - (np.arange(N - i0) / SR) / 1.0, 0, 1)
    # chill music-box lullaby: slow I-vi-IV-V, soft bell plucks + warm pad
    lb = 60 / 72; prog = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]; mel = [0, 2, 1, 2, 0, 1, 2, 1]
    def bell(f, d=1.6): x = tt(d); return (np.sin(2*np.pi*f*x) + 0.25*np.sin(2*np.pi*2.01*f*x)) * env(d, 0.004, 0.55)
    def pad(fs, d): x = tt(d); return sum(np.sin(2*np.pi*f*x) for f in fs) / len(fs) * np.minimum(1, np.minimum(x / 0.8, (d - x) / 0.8))
    t2 = tsw; k = 0
    while t2 < TOTAL - 0.5:
        ch = prog[k % 4]
        add(music, t2, pad([n2f(n - 12) for n in ch], lb * 4), 0.22)
        for j, m in enumerate(mel): add(music, t2 + j * lb / 2, bell(n2f(ch[m] + 12)), 0.2)
        t2 += lb * 4; k += 1
CC = json.load(open(os.path.join(EP, "script.json"))).get("meta", {}).get("concert")
if CC:  # [seg, word, endSeg]: normal music pauses, a funky octopus band takes over
    c0 = WT(CC[0], CC[1]) - 0.05; c1 = S(CC[2])["start"] - 0.1
    i0, i1 = int(c0 * SR), int(c1 * SR); ramp_ = np.ones(N)
    ramp_[i0:i1] = 0; fi = int(0.25 * SR); ramp_[max(0, i0 - fi):i0] = np.linspace(1, 0, min(fi, i0)); ramp_[i1:i1 + fi] = np.linspace(0, 1, len(ramp_[i1:i1 + fi]))
    music *= ramp_
    cb = 60 / 118
    def kick():
        x = tt(0.35); f = 45 + 110 * np.exp(-x * 30); return np.sin(2*np.pi*np.cumsum(f)/SR) * env(0.35, 0.002, 0.12) * 1.3
    def snare():
        return bp(rng.standard_normal(int(0.2*SR)), 1200, 7000) * env(0.2, 0.001, 0.06) * 1.1 + tone(190, 0.2) * env(0.2, 0.001, 0.04) * 0.5
    def hat(o=False):
        d = 0.18 if o else 0.05; return bp(rng.standard_normal(int(d*SR)), 7000, 15000) * env(d, 0.001, d / 3) * 0.6
    def sbass(f, d):
        x = tt(d); return lp(2*((f*x) % 1) - 1, 700) * env(d, 0.004, 0.12) * 0.9
    def stab(fs, d=0.22):
        x = tt(d); return lp(sum(2*((f*x) % 1) - 1 for f in fs) / len(fs), 2500) * env(d, 0.003, 0.08)
    prog = [[52, 55, 59, 62], [52, 55, 59, 62], [57, 60, 64, 67], [55, 59, 62, 66]]
    riff = [0, 0, 12, 0, 10, 0, 7, 5]
    t = c0; bar = 0; build = 0
    while t < c1 - 0.05:
        ch = prog[bar % 4]
        for b4 in range(4):
            tb = t + b4 * cb
            if tb >= c1: break
            g = 0.55 if bar == 0 else 1.0
            add(music, tb, kick(), 1.0 * g)
            if b4 % 2 == 1: add(music, tb, snare(), 0.8 * g)
            add(music, tb + cb / 2, hat(b4 == 3), 0.5 * g); add(music, tb, hat(), 0.3 * g)
            for e in range(2):
                n = riff[(b4 * 2 + e) % 8]; add(music, tb + e * cb / 2, sbass(n2f(ch[0] - 24 + n), cb / 2 * 0.9), 0.8 * (g if bar else 0))
            if bar >= 1 and b4 in (1, 3): add(music, tb + cb / 2, stab([n2f(n) for n in ch]), 0.42)
        if bar % 2 == 1:  # tom fill on the roof
            for k in range(4): add(music, t + 3 * cb + k * cb / 4, bp(tone(140 - k * 15, 0.2, "sine"), 60, 600) * env(0.2, 0.001, 0.08) * 2.5, 0.6)
        t += 4 * cb; bar += 1
OR = json.load(open(os.path.join(EP, "script.json"))).get("meta", {}).get("organ")
if OR:  # [seg, word, endSeg]: normal music pauses, a carousel organ waltz plays
    o0 = WT(OR[0], OR[1]) - 0.1; o1 = S(OR[2])["start"] - 0.1
    if len(OR) > 5: o1 = min(o1, o0 + OR[5])
    OG = OR[4] if len(OR) > 4 else 1.0
    i0, i1 = int(o0 * SR), int(o1 * SR); fi = int(0.3 * SR); rp = np.ones(N); rp[i0:i1] = 0
    rp[max(0, i0 - fi):i0] = np.linspace(1, 0, min(fi, i0)); rp[i1:i1 + fi] = np.linspace(0, 1, len(rp[i1:i1 + fi])); music *= rp
    def pipe(f, d):
        x = tt(d); s = np.sin(2*np.pi*f*x) + 0.5*np.sin(2*np.pi*2*f*x) + 0.25*np.sin(2*np.pi*3*f*x) + 0.15*np.sin(2*np.pi*4*f*x)
        return s * np.minimum(1, x / 0.02) * np.minimum(1, (d - x) / 0.05) * (1 + 0.05*np.sin(2*np.pi*6*x))
    mel = [76, 79, 84, 83, 81, 79, 77, 76, 74, 76, 77, 79, 81, 79, 76, 72]
    chords = [[48, 55, 64], [43, 55, 62], [48, 55, 64], [43, 53, 59]]
    t = o0; k = 0; speed = 1.0
    while t < o1 - 0.1:
        acc = 1 + 0.9 * max(0, (t - o0) / max(1e-3, o1 - o0) - 0.45) / 0.55 * (1 if OR[3:] and OR[3] else 0)
        bb = (60 / 168) / acc
        ch = chords[(k // 6) % 4]
        if k % 3 == 0: add(music, t, pipe(n2f(ch[0]), bb * 0.9) * np.minimum(1, (o1 - t) / 0.6), 0.55 * OG)
        else: add(music, t, pipe(n2f(ch[1]), bb * 0.6) + pipe(n2f(ch[2]), bb * 0.6), 0.28 * OG)
        add(music, t, pipe(n2f(mel[k % 16]), bb * 0.95), 0.42 * OG)
        t += bb; k += 1
venv = np.convolve(np.abs(voice), np.ones(4800)/4800, mode="same")
music *= 1 - 0.55 * np.clip(venv / 0.05, 0, 1)
sfx *= 1 - 0.45 * np.clip(venv / 0.05, 0, 1)  # keep the narrator on top
fadeout = np.clip((TOTAL - np.arange(N)/SR) / 1.2, 0, 1)
mix = (voice + sfx * 0.8 + music * 0.30) * fadeout
mix = mix / (np.abs(mix).max() + 1e-9) * 0.95
wavfile.write(os.path.join(EP, "audio/mix.wav"), SR, (mix * 32767).astype(np.int16))
print("mix ok", EP, round(len(mix)/SR, 2))
