import json, sys, os, subprocess, numpy as np, wave
from scipy.signal import lfilter, butter
SR = 44100
D = json.load(open(sys.argv[1])); SF = D['sfx']; TE = D['E']; OUT = sys.argv[2]
N = int(SR * TE); fx = np.zeros(N); mus = np.zeros(N); rng = np.random.default_rng(11)
cue = {}
for e in SF: cue.setdefault(e[0], e[1])
def env(n, a=.005, d=None, c=4.):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)); d = d or n / SR; return e * np.exp(-c * t / d)
def put(b, s, t, g=1.):
    i = int(t * SR)
    if i >= N or i + len(s) <= 0: return
    if i < 0: s = s[-i:]; i = 0
    j = min(N, i + len(s)); b[i:j] += s[:j - i] * g
def osc(f, d, w='sine'):
    n = int(d * SR); t = np.arange(n) / SR; ph = 2 * np.pi * (np.cumsum(f(t)) / SR if callable(f) else f * t)
    return {'sine': np.sin(ph), 'saw': 2 * (ph / (2 * np.pi) % 1) - 1, 'square': np.sign(np.sin(ph)), 'tri': 2 * np.abs(2 * (ph / (2 * np.pi) % 1) - 1) - 1}[w]
def tone(f, d, w='sine', a=.005, c=4): return osc(f, d, w) * env(int(d * SR), a, d, c)
def lp(s, fc, o=2): b, a = butter(o, min(fc, SR / 2.2) / (SR / 2)); return lfilter(b, a, s)
def hp(s, fc, o=2): b, a = butter(o, fc / (SR / 2), 'high'); return lfilter(b, a, s)
def noise(d, lo=None, hi=None, a=.003, c=4):
    s = rng.standard_normal(int(d * SR))
    if hi: s = lp(s, hi)
    if lo: s = hp(s, lo)
    return s * env(len(s), a, d, c)
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
def boom(d=1.5, f0=60): return tone(lambda x: f0 * np.exp(-x * 1.2) + 30, d, a=.002, c=2.5)


def sweep(f0, f1, d, w='sine', a=.005, c=3): return tone(lambda x: f0 + (f1 - f0) * x / d, d, w, a, c)
def chime(t, g=.06):
    for j, f in enumerate([1047, 1319, 1568, 2093]): put(fx, tone(f, .6, a=.001, c=5), t + j * .05, g)

def sweep(f0, f1, d, w='sine', a=.005, c=3): return tone(lambda x: f0 + (f1 - f0) * x / d, d, w, a, c)
def chime(t, g=.06):
    for j, f in enumerate([1047, 1319, 1568, 2093]): put(fx, tone(f, .6, a=.001, c=5), t + j * .05, g)

for k, t, *a in SF:
    if k == 'cut': n = int(.22 * SR); put(fx, lp(hp(rng.standard_normal(n), 700) * np.sin(np.linspace(0, np.pi, n)) ** 2, 5000), t - .1, .12)
    elif k == 'sign': put(fx, boom(.5, 70), t, 1.0); put(fx, noise(.12, 2000, None, a=.001, c=8), t, .3); chime(t + .05, .04)
    elif k == 'birds':
        for i in range(10): put(fx, tone(lambda x, i=i: 2600 + 900 * np.sin(x * 60 + i), .09, 'sine', a=.003, c=5), t + i * .17 + (i % 3) * .05, .04)
    elif k == 'bell':
        for j in range(2): put(fx, tone(2400, .35, a=.001, c=6), t + j * .14, .1); put(fx, tone(3150, .3, a=.001, c=7), t + j * .14, .05)
    elif k == 'whoosh': put(fx, lp(noise(.45, 400, 3500, a=.15, c=2), 3000), t, .3)
    elif k == 'spin':
        for j in range(8): put(fx, lp(noise(.06, 600, 3000, a=.005, c=5), 2500), t + j * .16, .12)
    elif k == 'thwap': put(fx, lp(noise(.12, 150, 3000, a=.001, c=9), 3000), t, .9); put(fx, boom(.2, 90), t, .6)
    elif k == 'splat': put(fx, lp(noise(.3, 200, 1800, a=.005, c=4), 1600), t, .35)
    elif k == 'sting': put(fx, sweep(220, 160, .6, 'saw', a=.005, c=2), t, .06); put(fx, boom(.4, 60), t, .5)
    elif k == 'dial':
        for j in range(3): put(fx, tone(1209 if j % 2 else 941, .09, a=.002, c=3), t + j * .12, .08)
        put(fx, tone(440, .5, a=.01, c=2), t + .45, .05)
    elif k == 'siren':
        n = int(2.2 * SR); x_ = np.arange(n) / SR; f = 700 + 250 * np.sin(x_ * 2 * np.pi * 2.2); e = np.clip(x_ / .4, 0, 1) * np.clip((2.2 - x_) / .6, 0, 1); put(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * e, t, .1)
    elif k == 'skid': put(fx, hp(noise(.7, 1500, 5000, a=.02, c=2), 1500), t, .3); put(fx, sweep(900, 600, .7, 'saw', a=.02, c=2), t, .02)
    elif k == 'cuff':
        for j in range(2): put(fx, tone(3200, .06, a=.001, c=10), t + j * .09, .2); put(fx, noise(.04, 3000, None, a=.001, c=9), t + j * .09, .15)
    elif k == 'camera': put(fx, noise(.05, 2000, None, a=.001, c=9), t, .3); put(fx, sweep(1800, 3000, .5, 'sine', a=.05, c=1), t + .05, .03)
    elif k == 'night': put(fx, sweep(600, 150, 1.0, 'sine', a=.05, c=1), t, .08)
    elif k == 'tk':
        g = a[0] if a else 1.0; put(fx, tone(2400, .04, a=.0005, c=10), t, .12 * g); put(fx, lp(noise(.06, 300, 3000, a=.0005, c=9), 2500), t, .25 * g); put(fx, boom(.12, 180), t, .2 * g)
    elif k == 'tick':
        for j in range(8): put(fx, tone(1800, .03, a=.001, c=10), t + j * .1, .08)
    elif k == 'scream': put(fx, sweep(500, 1800, .5, 'tri', a=.01, c=1), t, .07)
    elif k == 'marker': put(fx, hp(noise(.4, 3000, None, a=.01, c=2), 3000), t, .15)
    elif k == 'bike':
        for j in range(12): put(fx, tone(900, .02, a=.001, c=10), t + j * .07, .03)
    elif k == 'run':
        for j in range(12): put(fx, lp(noise(.05, 200, 3000, a=.001, c=8), 2500), t + j * .085, .25)
    elif k == 'crash': put(fx, boom(.45, 70), t, 1.0); put(fx, lp(noise(.6, 300, 5000, a=.002, c=3), 4000), t, .5); put(fx, tone(1700, .4, a=.001, c=5), t + .05, .08)
    elif k == 'wind': put(fx, lp(noise(2.3, 200, 900, a=.4, c=1), 700), t, .35); put(fx, sweep(500, 900, 2.0, 'sine', a=.5, c=1), t, .02)
    elif k == 'ufo':
        n = int(2.4 * SR); x_ = np.arange(n) / SR; f = 300 + 80 * np.sin(x_ * 30); e = np.clip(x_ / .5, 0, 1) * np.clip((2.4 - x_) / .5, 0, 1); put(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * e, t, .08); put(fx, np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * e, t, .04)
    elif k == 'beam': put(fx, sweep(200, 1200, 1.4, 'saw', a=.2, c=1), t, .04)
    elif k == 'ring':
        for j in range(4): put(fx, tone(1300, .12, 'square', a=.002, c=3), t + j * .16, .04)
    elif k == 'boom':
        n = int(.6 * SR); x_ = np.arange(n) / SR; put(fx, lp(rng.standard_normal(n), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * x_)) * env(n, .1, .2, 1), t, .5)
    elif k == 'bonk': put(fx, tone(lambda x: 900 * np.exp(-x * 18) + 250, .25, a=.001, c=5), t, .6); put(fx, boom(.2, 120), t, .5)
    elif k == 'dizzy':
        for j in range(5): put(fx, tone(2200 + j * 180, .12, a=.002, c=6), t + j * .1, .05)
    elif k == 'windmill':
        for j in range(14): put(fx, lp(noise(.06, 400, 2500, a=.005, c=5), 2000), t + j * .055, .2)
    elif k == 'launch': put(fx, sweep(300, 2500, .45, 'saw', a=.005, c=2), t, .06); put(fx, lp(noise(.5, 500, 4000, a=.01, c=2), 3500), t, .45)
    elif k == 'ding': put(fx, tone(3500, .5, a=.001, c=5), t, .1); put(fx, tone(5250, .4, a=.001, c=6), t, .05)
    elif k == 'squawk':
        for j in range(3): put(fx, hp(lp(noise(.18, 600, 3000, a=.005, c=3), 3000), 600) + sweep(900, 600, .18, 'saw') * .4, t + j * .25, .4)
    elif k == 'dig':
        for j in range(16): put(fx, lp(noise(.08, 200, 2000, a=.002, c=6), 1800), t + j * .12, .3)
    elif k == 'thud': put(fx, boom(.3, 80), t, .8)
    elif k == 'rumble': put(fx, lp(noise(.6, 30, 200, a=.1, c=1), 150), t, 1.0)
    elif k == 'burst': put(fx, lp(noise(.5, 100, 3000, a=.002, c=3), 2500), t, .8); put(fx, boom(.35, 70), t, .9)
    elif k == 'tape':
        for j in range(5): put(fx, hp(noise(.18, 2000, None, a=.01, c=2), 2000), t + j * .2, .15)
    elif k == 'squish': put(fx, sweep(400, 150, .5, 'tri', a=.01, c=2), t, .15); put(fx, lp(noise(.5, 100, 1200, a=.05, c=2), 1000), t, .3)
    elif k == 'plane': put(fx, sweep(300, 700, .7, 'saw', a=.1, c=1.5), t, .04); put(fx, lp(noise(.7, 200, 1500, a=.2, c=1), 1200), t, .25)
    elif k == 'hop': put(fx, tone(lambda x: 200 + 600 * x, .15, 'tri', a=.002, c=4), t, .2); put(fx, boom(.12, 100), t + .02, .4)
    elif k == 'punch': put(fx, boom(.25, 90), t, 1.0); put(fx, lp(noise(.08, 300, 4000, a=.001, c=8), 4000), t, .6)
    elif k == 'blabla':
        for j in range(16): put(fx, tone(lambda x, j=j: 180 + 90 * (j % 3) + 60 * np.sin(x * 40), .1, 'saw', a=.005, c=3), t + j * .12, .05)
    elif k == 'clank': put(fx, tone(900, .5, a=.001, c=5), t, .15); put(fx, tone(1430, .4, a=.001, c=6), t, .1); put(fx, boom(.2, 110), t, .4)
    elif k == 'fight':
        for j in range(22): put(fx, boom(.12, 90 + (j % 4) * 30), t + j * .1 + rng.random() * .04, .5); put(fx, lp(noise(.06, 300, 3000, a=.001, c=6), 3000), t + j * .1, .3)
    elif k == 'slam': put(fx, boom(.4, 70), t, 1.0); put(fx, lp(noise(.15, 200, 3000, a=.001, c=6), 2500), t, .5)
    elif k == 'hammer': put(fx, tone(1250, .2, a=.001, c=9), t, .18); put(fx, boom(.12, 140), t, .4)
    elif k == 'doorbell': put(fx, tone(660, .7, a=.002, c=3), t, .18); put(fx, tone(523, .9, a=.002, c=3), t + .38, .18)
    elif k == 'creak': put(fx, sweep(300, 180, .6, 'saw', a=.05, c=1), t, .04)
    elif k == 'crickets':
        d = a[0]; n = int(d * SR); x_ = np.arange(n) / SR; ch = np.sin(2 * np.pi * 4300 * x_) * (np.sin(2 * np.pi * 28 * x_) > .3) * (np.sin(2 * np.pi * .9 * x_) > -.1); ch2 = np.sin(2 * np.pi * 5100 * x_) * (np.sin(2 * np.pi * 31 * x_ + 1) > .4) * (np.sin(2 * np.pi * .7 * x_ + 2) > .2); put(fx, (ch + ch2) * .5, t, .018)
    elif k == 'buzz':
        d, pm = a[0], a[1]; n = int(d * SR); x_ = np.arange(n) / SR; f = (560 + 60 * np.sin(x_ * 9) + 30 * np.sin(x_ * 23)) * pm; ph = 2 * np.pi * np.cumsum(f) / SR; s_ = (np.sign(np.sin(ph)) * .5 + np.sin(2 * ph) * .3 + np.sin(3 * ph) * .2); e = np.clip(x_ / .15, 0, 1) * np.clip((d - x_) / .15, 0, 1) * (.75 + .25 * np.sin(x_ * 5)); put(fx, lp(s_, 4500) * e, t, .07)
    elif k == 'slurp':
        for j in range(4): put(fx, lp(noise(.09, 300, 2500, a=.01, c=4), 2000) + tone(lambda x, j=j: 300 + 400 * x / .09 + j * 50, .09, a=.005, c=3) * .3, t + j * .1, .3)
    elif k == 'yelp': put(fx, sweep(600, 1400, .25, 'tri', a=.005, c=2), t, .08)
    elif k == 'slap': put(fx, hp(noise(.08, 800, 8000, a=.0005, c=10), 600), t, 1.0); put(fx, boom(.1, 160), t, .4)
    elif k == 'splash': put(fx, lp(noise(.5, 400, 5000, a=.005, c=4), 4000), t, .35)
    elif k == 'burp': put(fx, lp(tone(lambda x: 95 + 15 * np.sin(x * 60), .35, 'saw', a=.02, c=2), 900), t, .25)
    elif k == 'zap':
        n = int(.6 * SR); s_ = rng.standard_normal(n) * (np.sin(2 * np.pi * 120 * np.arange(n) / SR) > 0) ; put(fx, hp(s_, 1500) * env(n, .002, .6, 1.5), t, .45); put(fx, tone(120, .6, 'square', a=.002, c=2), t, .08)
    elif k == 'paper': put(fx, hp(noise(.3, 2500, None, a=.01, c=3), 2500), t, .2)
    elif k == 'pop': put(fx, tone(lambda x: 300 + 900 * x, .08, a=.001, c=6), t, .25); put(fx, hp(noise(.05, 1500, None, a=.001, c=8), 1500), t, .4)
    elif k == 'stretch': put(fx, sweep(200, 900, .25, 'saw', a=.005, c=1.5), t, .05)
    elif k == 'chomp': put(fx, boom(.15, 140), t, .7); put(fx, lp(noise(.12, 200, 3000, a=.001, c=6), 2500), t, .6)
    elif k == 'boing': put(fx, tone(lambda x: 220 + 160 * np.sin(x * 40) * np.exp(-x * 4), .7, 'sine', a=.002, c=2), t, .25)
    elif k == 'radio':
        put(fx, hp(noise(1.4, 1200, 4000, a=.02, c=.6), 1200), t, .08)
        for j in range(2): put(fx, tone(1600, .08, a=.001, c=3), t + j * .12, .06)
    elif k == 'heli':
        d = a[0]; n = int(d * SR); x_ = np.arange(n) / SR; e = np.clip(x_ / .6, 0, 1) * np.clip((d - x_) / .5, 0, 1); put(fx, lp(rng.standard_normal(n), 400) * (0.4 + 0.6 * (np.sin(2 * np.pi * 13 * x_) > .6)) * e, t, .55)
    elif k == 'jar': put(fx, tone(2100, .4, a=.001, c=6), t, .12); put(fx, tone(3300, .3, a=.001, c=7), t, .06)
    elif k == 'groan':
        for j in range(3): put(fx, lp(tone(lambda x, j=j: 140 + j * 30 - 40 * x, .7, 'saw', a=.08, c=1.5), 700), t + j * .25, .06)
    elif k == 'fanfare':
        for j, (m_, d_) in enumerate([(72, .14), (72, .14), (72, .14), (77, .5)]): put(fx, lp(tone(mid(m_), d_ + .2, 'saw', a=.01, c=2), 2500), t + j * .15, .07); put(fx, lp(tone(mid(m_ - 5), d_ + .2, 'saw', a=.01, c=2), 2000), t + j * .15, .04)
    elif k == 'fw': put(fx, sweep(800, 2500, .35, 'sine', a=.01, c=1), t - .35, .02); put(fx, boom(.5, 60), t, .7); put(fx, hp(noise(.8, 2000, None, a=.01, c=2), 2000), t + .05, .12)
    elif k == 'step': put(fx, boom(.12, 120), t, .35); put(fx, lp(noise(.06, 100, 2000, a=.001, c=8), 1500), t, .2)
    elif k == 'bleat':
        x_ = np.arange(int(.7 * SR)) / SR; f = 420 + 40 * np.sin(x_ * 2 * np.pi * 9) * (x_ > .1) + 60 * np.exp(-x_ * 3); ph = 2 * np.pi * np.cumsum(f) / SR; s_ = np.sign(np.sin(ph)) * .4 + np.sin(2 * ph) * .3 + np.sin(3 * ph) * .2; put(fx, lp(s_, 2600) * env(len(x_), .02, .7, 2) * (0.6 + .4 * (np.sin(x_ * 2 * np.pi * 11) > 0)), t, .16)
    elif k == 'snore':
        x_ = np.arange(int(1.2 * SR)) / SR; s_ = lp(rng.standard_normal(len(x_)), 500) * (np.sin(x_ * 2 * np.pi * .9) > 0) * (0.5 + .5 * np.sin(x_ * 2 * np.pi * 35)); put(fx, s_ * env(len(x_), .1, 1.2, 1.5), t, .3)
    elif k == 'fire':
        d = a[0]; g = a[1] if len(a) > 1 else 1.0; n = int(d * SR); x_ = np.arange(n) / SR; s_ = lp(rng.standard_normal(n), 900) * .6 + hp(rng.standard_normal(n), 2500) * (rng.random(n) > .985) * 2.5; e = np.clip(x_ / .3, 0, 1) * np.clip((d - x_) / .4, 0, 1); put(fx, s_ * e, t, .16 * g)
    elif k == 'engine':
        d = a[0]; n = int(max(d, .05) * SR); x_ = np.arange(n) / SR; f = 55 + 30 * np.clip(x_ / max(d, .1), 0, 1) + 3 * np.sin(x_ * 20); ph = 2 * np.pi * np.cumsum(f) / SR; s_ = np.sign(np.sin(ph)) * .4 + np.sin(2 * ph) * .3 + lp(rng.standard_normal(n), 600) * .3; e = np.clip(x_ / .1, 0, 1) * np.clip((d - x_) / .15, 0, 1); put(fx, lp(s_, 1200) * e, t, .22)
    elif k == 'rollr':
        d = a[0]; n = int(max(d, .05) * SR); x_ = np.arange(n) / SR; e = np.clip(x_ / .15, 0, 1) * np.clip((d - x_) / .2, 0, 1); put(fx, lp(rng.standard_normal(n), 250) * (0.6 + 0.4 * np.sin(x_ * 2 * np.pi * 7)) * e, t, 1.0); put(fx, hp(lp(rng.standard_normal(n), 3000), 800) * e, t, .08)
    elif k == 'jingle':
        d, sp, g, off = a[0], a[1], a[2], (a[3] if len(a) > 3 else 0.)
        NT = [79, 76, 79, 76, 77, 74, 72, 74, 76, 77, 79, 81, 79, 76, 74, 72]; nl = .2 / sp; j = int(np.ceil((t + off) / nl))
        while j * nl - off < t + d:
            tt = j * nl - off; f = mid(NT[j % 16]); s_ = tone(f, .32, 'sine', a=.002, c=6); s2 = tone(2 * f, .2, 'sine', a=.002, c=8) * .35; s_[:len(s2)] += s2; s3 = tone(3 * f, .12, 'tri', a=.001, c=9) * .12; s_[:len(s3)] += s3
            if j % 4 == 0: s4 = tone(f / 4, .3, 'tri', a=.003, c=5) * .5; s_[:len(s4)] += s4
            put(fx, s_, tt, .085 * g); j += 1
    elif k == 'knock': put(fx, lp(noise(.06, 80, 1800, a=.001, c=10), 1500), t, .9); put(fx, boom(.1, 160), t, .7)
    elif k == 'jail': put(fx, boom(.6, 55), t, .8); put(fx, tone(180, .8, 'saw', a=.002, c=3), t, .05)
bpm = 100; beat = 60 / bpm; e8 = beat / 2; t_out = cue.get('outro', N / SR)
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62])]
t = .15; i = 0; hits = [x[1] for x in SF if x[0] in ('sign',)]; calm = [cue.get('calm', 1e9), cue.get('calmend', 1e9)]
while t < t_out + 1.0:
    b = i // 8; root, ch = prog[b % 4]; st = i % 8; g_ = .3 if any(0 <= t - h < .5 for h in hits) else 1
    q = calm[0] < t < calm[1]
    if st in (0, 3, 6) and not q: put(mus, lp(tone(mid(root - 12 + (7 if st == 3 else 0)), .25, 'tri', a=.002, c=6), 1200), t, .5 * g_)
    if st == 0 and q: put(mus, lp(tone(mid(root - 12), 1.6, 'sine', a=.2, c=1.2), 600), t, .4)
    if st in (2, 5, 7): m = ch[(i * 7) % 3] + 12; put(mus, tone(mid(m), .18 if not q else .6, 'sine', a=.001, c=7 if not q else 3), t, .09 * g_)
    if st % 2 == 1 and not q: put(mus, noise(.03, 6000, None, a=.0005, c=10), t, .025 * g_)
    if st in (2, 6) and not q: put(mus, tone(lambda x: 180 * np.exp(-x * 40) + 60, .12, a=.001, c=8), t, .2 * g_)
    t += e8; i += 1
fade = np.ones(N); i0 = int(min(t_out + .4, N / SR - .15) * SR); fade[i0:] = np.linspace(1, 0, N - i0) if N > i0 else 1; mus *= fade
narr = np.zeros(N); off = float(D.get('NOFF', .15))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'narr.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
a_ = np.frombuffer(raw, '<i2').astype(float) / 32767; put(narr, a_, off, 1.0); print('narration', len(a_) / SR)
for e in SF:
    if e[0] == 'echoseg':
        i0, i1 = int(e[1] * SR), int(e[2] * SR); seg = narr[i0:i1].copy(); narr[i0:i1] *= .55
        for j, (dl, g) in enumerate([(0, .75), (.28, .5), (.56, .32), (.84, .2), (1.12, .12)]):
            k0 = i0 + int(dl * SR); s2 = lp(seg, 3000 - j * 400) * g; k1 = min(len(narr), k0 + len(s2)); narr[k0:k1] += s2[:k1 - k0]
envn = np.clip(lp(np.abs(narr), 6) * 9, 0, 1)
mix = fx * (1 - .25 * envn) + mus * .8 * (1 - .45 * envn) + narr * 1.15
mix = np.tanh(mix * 1.05) * .9
w = wave.open(OUT, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([mix, mix], 1) * 32767).astype('<i2').tobytes()); w.close(); print('ok', TE)
