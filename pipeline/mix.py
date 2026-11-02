"""Voice + synthesized SFX + light music -> audio/mix.wav"""
import json, os
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly, butter, sosfilt

BASE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
TL = json.load(open(os.path.join(BASE, "timeline.json")))
TOTAL = TL["total"]
N = int((TOTAL + 0.5) * SR)
voice = np.zeros(N); sfx = np.zeros(N); music = np.zeros(N)
rng = np.random.default_rng(1)

def WT(seg, word, k=0):
    ws = [w for w in TL["segs"][seg]["words"] if w["w"].lower().strip(".,!?:;'").startswith(word.lower())]
    return ws[min(k, len(ws) - 1)]["s"] if ws else TL["segs"][seg]["start"]
S = lambda s: TL["segs"][s]

def add(buf, t, sig, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig * g

def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=None):
    x = tt(d); e = np.minimum(1, x / max(a, 1e-4))
    if r: e *= np.exp(-x / r)
    return e
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)

# ---- voice ----
for sid, s in TL["segs"].items():
    sr, a = wavfile.read(os.path.join(BASE, "audio", sid + ".wav"))
    a = resample_poly(a.astype(np.float64), SR, sr)
    add(voice, s["start"], a)
voice = voice / (np.abs(voice).max() + 1e-9) * 0.89

# ---- sfx generators ----
def bell(f=1180, d=0.45):
    x = tt(d); return (np.sin(2*np.pi*f*x) + 0.5*np.sin(2*np.pi*f*2.76*x) + 0.25*np.sin(2*np.pi*f*5.4*x)) * env(d, 0.002, 0.12)
def click(d=0.06, f=2500):
    return bp(rng.standard_normal(int(d*SR)), 300, f) * env(d, 0.001, 0.012)
def whoosh(d=0.9, up=True):
    n = rng.standard_normal(int(d*SR)); x = tt(d); e = np.sin(np.pi * x / d) ** 2
    out = np.zeros_like(n); seg = 2048
    for k in range(0, len(n), seg):
        u = k / len(n); f = 300 + (3000 * u if up else 3000 * (1 - u))
        out[k:k+seg] = bp(n[k:k+seg], max(100, f*0.5), min(f*1.5, 20000))
    return out * e
def tone(f, d, wave="sine", a=0.005, r=0.3):
    x = tt(d); ph = 2*np.pi*f*x
    w = np.sin(ph) if wave == "sine" else (2*(f*x % 1) - 1 if wave == "saw" else np.sign(np.sin(ph)))
    return w * env(d, a, r)
def buzzer():
    return lp(tone(140, 0.22, "square", r=1) , 1800) * 0.6
def chord(fs, d, r=0.35):
    return sum(tone(f, d, "sine", r=r) + 0.3*tone(f*2, d, "sine", r=r*0.6) for f in fs) / len(fs)
def thud():
    d = 0.35; x = tt(d); return np.sin(2*np.pi*(90 - 50*x/d)*x) * env(d, 0.002, 0.08) + 0.3*lp(rng.standard_normal(len(x)), 900) * env(d, 0.001, 0.03)
def quack():
    d = 0.32; x = tt(d); f = 520 - 260 * x / d
    s = 2*((np.cumsum(f)/SR) % 1) - 1
    s = bp(s, 700, 1800) + 0.5*bp(s, 2200, 3200)
    return s * env(d, 0.01, 0.12) * 2.2
def pop():
    d = 0.12; x = tt(d); return np.sin(2*np.pi*(500 + 900*x/d)*x) * env(d, 0.002, 0.03)
def plink(f):
    d = 0.18; x = tt(d); return np.sin(2*np.pi*f*(1 + 0.4*x)*x) * env(d, 0.001, 0.04)
def squeak():
    d = 0.35; x = tt(d); f = 900 + 400*np.sin(2*np.pi*3*x); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*x/d) * 0.4

# crossing bell
t = 0.75
while t < 8.0:
    g = 0.22 if t < 4.0 else 0.22 * max(0, 1 - (t - 4.0) / 4.0)
    add(sfx, t, bell(1180 if int(t*2) % 2 else 980), g); t += 0.5

# train: rumble + wheel clacks following the train speed factor
def trainFactor(t):
    sm = lambda u: np.clip(u, 0, 1)**2 * (3 - 2*np.clip(u, 0, 1))
    r = lambda t, a, b: sm((t - a) / (b - a))
    return 1 + 6*min(r(t, 12.4, 13.4), 1 - r(t, 20.0, 21.0)) - 10*min(r(t, 22.4, 22.6), 1 - r(t, 23.1, 23.3))
def trainGain(t):
    g = 0.10 + 0.12 * (3.6 < t < 8.0)
    if S("right5")["start"] < t < S("right5")["end"] + 0.5: g = 0.32
    if t < 3.4: g *= max(0, (t - 2.6) / 0.8)
    return g
tgrid = np.arange(0, TOTAL, 0.05)
gains = np.array([trainGain(x) for x in tgrid])
rumble = lp(rng.standard_normal(N), 140) * 3.0
rumble *= np.interp(np.arange(N)/SR, tgrid, gains)
sfx += rumble
pos = 0.0; t = 3.4
while t < TOTAL - 0.5:
    f = abs(trainFactor(t)); g = trainGain(t)
    for dt in (0, 0.11):
        add(sfx, t + dt, click(), g * 1.4)
    pos += 1; t += (15.6 / 2) / (17 * max(f, 0.2))

# time-lapse ticks
t = S("wrong2")["start"]
while t < S("wrong4")["start"]:
    add(sfx, t, click(0.03, 6000), 0.25); t += 0.25
# engine idle
x0, x1 = WT("wrong1", "Engine") - 0.6, WT("wrong3", "empty") + 0.3
d = x1 - x0; x = tt(d); idle = lp(2*((28*x) % 1) - 1, 220) * np.minimum(1, x/0.3) * np.minimum(1, (d - x)/0.5)
add(sfx, x0, idle, 0.18)
# sputter when empty
for k in range(4): add(sfx, WT("wrong3", "empty") + 0.1 + k*0.13, lp(rng.standard_normal(int(0.08*SR)), 400) * env(0.08, 0.002, 0.03), 0.5)

# transitions
add(sfx, 3.9, whoosh(1.2), 0.25)
add(sfx, S("wrong2")["start"] - 0.2, whoosh(0.8), 0.2)
add(sfx, S("wrong4")["end"] + 0.05, whoosh(0.95, up=False), 0.35)  # rewind
for k in range(14): add(sfx, S("wrong4")["end"] + 0.1 + k*0.06, click(0.03, 5000), 0.2)
add(sfx, S("right3")["start"] - 0.1, whoosh(1.0), 0.22)
add(sfx, S("outro")["start"] - 0.2, whoosh(0.9), 0.22)

# wrong / right stings
add(sfx, S("wrong1")["start"], buzzer(), 0.5); add(sfx, S("wrong1")["start"] + 0.27, buzzer(), 0.5)
add(sfx, WT("wrong4", "Exam"), thud(), 0.9); add(sfx, WT("wrong4", "Exam") + 0.05, lp(tone(110, 0.9, "saw", r=0.5), 900), 0.35)
add(sfx, S("right1")["start"], chord([523.25, 659.25], 0.6), 0.35); add(sfx, S("right1")["start"] + 0.14, chord([783.99, 1046.5], 0.7), 0.3)
ep = WT("right7", "Exam")
add(sfx, ep, thud(), 0.8)
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]): add(sfx, ep + 0.05 + k*0.09, chord([f], 0.9, r=0.45), 0.35)
for k in range(30): add(sfx, ep + 0.05 + rng.random()*1.5, plink(2000 + rng.random()*2500), 0.05)

# pops for highlights
for tp in [S("hook1")["start"], WT("hook1", "level"), WT("hook2", "fifty"), WT("hook2", "What"), WT("wrong2", "Your") - 0.3, WT("wrong3", "tow"),
           WT("right2", "clear"), WT("right4", "underpass"), WT("right4", "roof"), WT("right6", "depth") - 0.1, WT("right6", "Walking"), WT("right5", "Wipers")]:
    add(sfx, tp, pop(), 0.3)
# three-point turn steps
tTurn = WT("right2", "turn") + 0.15
for k in range(3): add(sfx, tTurn + k*1.1, pop(), 0.3)
# roof box hop & land
tOff = WT("right4", "Take")
add(sfx, tOff + 0.2, whoosh(0.6), 0.15); add(sfx, tOff + 1.05, thud(), 0.6)
# drive engine
def drive(a, b, f0, f1, g):
    d = b - a; x = tt(d); f = f0 + (f1 - f0) * np.sin(np.pi * np.clip(x/d, 0, 1)) ; ph = np.cumsum(f) / SR
    s = lp(2*(ph % 1) - 1, 500) * np.minimum(1, x/0.3) * np.minimum(1, (d - x)/0.4)
    add(sfx, a, s, g)
drive(S("right3")["start"] - 0.1, S("right4")["start"] + 0.6, 45, 110, 0.16)
drive(S("right5")["start"], WT("right5", "Wipers") + 0.9, 40, 80, 0.12)
drive(S("right7")["start"] + 0.5, S("outro")["start"] + 2.5, 40, 120, 0.14)
# drips + wipers
t = WT("right5", "dripping") - 0.5
while t < S("right5")["end"] + 0.4:
    add(sfx, t, plink(900 + rng.random()*700), 0.16); t += 0.12 + rng.random()*0.15
for k in range(3): add(sfx, WT("right5", "Wipers") + k*0.45, squeak(), 0.25)
# water slosh + quack
a, b = WT("right6", "Walking") - 0.1, S("right7")["start"] + 0.6
d = b - a; x = tt(d); slosh = bp(rng.standard_normal(len(x)), 300, 2500) * (0.5 + 0.5*np.sin(2*np.pi*1.6*x)) * np.minimum(1, x/0.3) * np.minimum(1, (d - x)/0.4)
add(sfx, a, slosh, 0.22)
add(sfx, WT("right6", "duck") + 0.15, quack(), 0.5)
add(sfx, WT("right6", "duck") + 0.5, quack(), 0.4)

# ---- music: soft plucked arpeggios, minor in the wrong part, major in the right part ----
bpm = 104; beat = 60 / bpm
def pluck(f, d=0.5):
    x = tt(d); s = np.sin(2*np.pi*f*x) + 0.35*np.sin(2*np.pi*2*f*x) + 0.12*np.sin(2*np.pi*3*f*x)
    return s * env(d, 0.003, 0.16)
def bass(f, d):
    x = tt(d); return lp(2*((f*x) % 1) - 1, 300) * env(d, 0.01, 0.6)
n2f = lambda n: 440 * 2 ** ((n - 69) / 12)
prog_major = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]   # C G Am F
prog_minor = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]]   # Am F Dm E
prog_tense = [[57, 60, 64], [57, 60, 64], [53, 57, 60], [52, 56, 59]]
t = 0.3; bar = 0
while t < TOTAL - 1.0:
    if t < S("wrong1")["start"] - 0.2: prog = prog_tense
    elif t < S("right1")["start"] - 0.2: prog = prog_minor
    else: prog = prog_major
    ch = prog[bar % 4]
    add(music, t, bass(n2f(ch[0] - 24), beat * 4), 0.35)
    pat = [0, 1, 2, 1, 0, 2, 1, 2]
    for k, p in enumerate(pat):
        add(music, t + k * beat / 2, pluck(n2f(ch[p] + 12)), 0.22)
    t += beat * 4; bar += 1
    if S("wrong4")["end"] < t < S("right1")["start"]:  # gap during rewind
        t = S("right1")["start"] - 0.1
# duck music under voice
venv = np.convolve(np.abs(voice), np.ones(4800)/4800, mode="same")
duck = 1 - 0.55 * np.clip(venv / 0.05, 0, 1)
music *= duck
fadeout = np.clip((TOTAL - np.arange(N)/SR) / 1.2, 0, 1)
mix = voice * 1.0 + sfx * 0.8 + music * 0.30
mix *= fadeout
mix = mix / (np.abs(mix).max() + 1e-9) * 0.95
wavfile.write(os.path.join(BASE, "audio/mix.wav"), SR, (mix * 32767).astype(np.int16))
print("mix ok", len(mix)/SR)
