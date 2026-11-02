"""Kokoro TTS (onnx) with espeak-ng CLI phonemization and per-word timings."""
import json, os, re, subprocess, sys, types
import numpy as np
from scipy.io import wavfile

BASE = os.path.dirname(os.path.abspath(__file__))
E = os.path.join(BASE, "vendor/espeak-install")

# stub modules the package imports but we bypass
sys.modules["espeakng_loader"] = types.ModuleType("espeakng_loader")
ph = types.ModuleType("phonemizer"); ph.phonemize = None
sys.modules["phonemizer"] = ph
for m in ["phonemizer.backend", "phonemizer.backend.espeak", "phonemizer.backend.espeak.wrapper"]:
    sys.modules[m] = types.ModuleType(m)
sys.modules["phonemizer.backend.espeak.wrapper"].EspeakWrapper = object
sys.path.insert(0, os.path.join(BASE, "vendor/kokoro-onnx/src"))
import kokoro_onnx  # noqa
from kokoro_onnx import Kokoro
from kokoro_onnx.session import create_session
from kokoro_onnx.trim import trim as trim_audio
from kokoro_onnx.sliding import token_edges

env = dict(os.environ, ESPEAK_DATA_PATH=os.path.join(E, "share/espeak-ng-data"))


def espeak(word):
    out = subprocess.run([os.path.join(E, "bin/espeak-ng"), "-q", "--ipa", "-v", "en-gb", word],
                         capture_output=True, text=True, env=env).stdout
    return "".join(out.split())


def estimate(audio, SR, words, spans, phon):
    """word timings: split at detected pauses (punctuation), then proportional to phoneme count"""
    hop = int(SR * 0.01)
    n = len(audio) // hop
    env_ = np.array([np.sqrt(np.mean(audio[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    thr = max(env_.max() * 0.03, 1e-4)
    silent = env_ < thr
    gaps = []  # (start,end) frames of silent runs >= 8 frames, not at edges
    i = 0
    while i < n:
        if silent[i]:
            j = i
            while j < n and silent[j]: j += 1
            if j - i >= 8 and i > 5 and j < n - 5: gaps.append((i, j))
            i = j
        else: i += 1
    # groups of words separated by punctuation
    groups, cur = [], []
    for k, w in enumerate(words):
        cur.append(k)
        if re.search(r"[.,!?:;]$", w) and k < len(words) - 1:
            groups.append(cur); cur = []
    if cur: groups.append(cur)
    need = len(groups) - 1
    # expected boundary times from phoneme proportions; pick the nearest unused gap for each
    plen = [sum(spans[k][1]-spans[k][0] + 1.5 for k in g) for g in groups]
    tot_ = sum(plen); exp_ = []; acc = 0
    for L_ in plen[:-1]:
        acc += L_; exp_.append(acc / tot_ * n)
    chosen = []
    pool = list(gaps)
    for e_ in exp_:
        if not pool: break
        g_ = min(pool, key=lambda g: abs((g[0] + g[1]) / 2 - e_) - 0.3 * (g[1] - g[0]))
        chosen.append(g_); pool = [p for p in pool if p[0] > g_[0]]
    chosen = sorted(chosen)
    bounds = []
    if len(chosen) == need:
        st = 0
        for g in chosen:
            bounds.append((st, g[0] * 0.01)); st = g[1] * 0.01
        bounds.append((st, len(audio) / SR))
    else:
        tot = sum(sum(spans[k][1]-spans[k][0] for k in g) for g in groups)
        st = 0
        for g in groups:
            L = sum(spans[k][1]-spans[k][0] for k in g) / tot * len(audio) / SR
            bounds.append((st, st + L)); st += L
    out = []
    for g, (a, b) in zip(groups, bounds):
        lens = [max(1, spans[k][1]-spans[k][0]) + 1.5 for k in g]
        tot = sum(lens); t = a
        for k, L in zip(g, lens):
            d = (b - a) * L / tot
            out.append({"w": words[k], "s": round(t, 3), "e": round(t + d, 3)}); t += d
    return out


def main():
    EP = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else BASE
    script = json.load(open(os.path.join(EP, "script.json")))
    k = Kokoro.__new__(Kokoro)
    sess = create_session(os.path.join(BASE, "tts/kokoro-v1.0.onnx"))
    # minimal setup without Tokenizer espeak init
    from kokoro_onnx.config import DEFAULT_VOCAB
    from kokoro_onnx.session import input_dtypes
    k.sess = sess
    k.voices = np.load(os.path.join(BASE, "tts/voices-v1.0.bin"))
    k._input_dtypes = input_dtypes(sess)
    k._tokens_input = "input_ids" if "input_ids" in k._input_dtypes else "tokens"
    k.has_timings = "duration" in {o.name for o in sess.get_outputs()}
    print("has_timings", k.has_timings)
    vocab = DEFAULT_VOCAB
    voice = k.voices[script["voice"]]
    speed = float(os.environ.get("SPEED", "1.05"))
    SR = 24000
    out = []
    os.makedirs(os.path.join(EP, "audio"), exist_ok=True)
    for seg in script["segments"]:
        words = seg["text"].split()
        # phonemize each clause in context, then split back to words
        clause_ph = []
        cur = []
        for w in words:
            cur.append(re.sub(r"[^\w'-]", "", w).replace("-", " "))
            if re.search(r"[.,!?:;]$", w):
                clause_ph.append(cur); cur = []
        if cur: clause_ph.append(cur)
        wph = []
        for cl in clause_ph:
            raw = subprocess.run([os.path.join(E, "bin/espeak-ng"), "-q", "--ipa", "-v", "en-gb", " ".join(cl)],
                                 capture_output=True, text=True, env=env).stdout.split()
            if len(raw) < len(cl):
                # espeak joins "of the", "for a" ... into one token: merge articles into the previous word
                groups = [[w] for w in cl]
                i = 1
                while len(groups) > len(raw) and i < len(groups):
                    if groups[i][0].lower() in ("the", "a", "an") and groups[i-1][-1].lower() in ("of", "for", "on", "in", "to", "at", "from", "with", "into", "by"):
                        groups[i-1] += groups.pop(i)
                    else:
                        i += 1
                if len(groups) == len(raw):
                    for g, r in zip(groups, raw):
                        wph.append(r)
                        wph += [""] * (len(g) - 1)
                    continue
            if len(raw) == len(cl):
                wph += raw
            else:
                print("  mismatch", cl, raw)
                wph += [espeak(x) for x in cl]
        phon, spans = "", []
        for w, p in zip(words, wph):
            punct = re.findall(r"[.,!?:;]+$", w)
            p = "".join(c for c in p if c in vocab)
            if phon:
                phon += " "
            start = len(phon)
            phon += p
            spans.append((start, len(phon)))
            if punct:
                phon += punct[0][0]
        toks = [vocab[c] for c in phon]
        style = voice[min(len(toks), len(voice)) - 1]
        audio, dur = k._infer(toks, style, speed)
        if dur is not None:
            edges = token_edges(dur, len(audio))[1:]
        trimmed, (head, _) = trim_audio(audio)
        t = []
        for (a, b), w in zip(spans, words):
            if dur is not None:
                s = max(0, edges[a] - head) / SR
                e = max(0, edges[b] - head) / SR if b < len(edges) else len(trimmed) / SR
            else:
                s = e = None
            if s is not None:
                t.append({"w": w, "s": round(float(s), 3), "e": round(float(e), 3)})
        if dur is None:
            t = estimate(trimmed, SR, words, spans, phon)
        fn = os.path.join(EP, "audio", seg["id"] + ".wav")
        wavfile.write(fn, SR, trimmed.astype(np.float32))
        out.append({"id": seg["id"], "dur": round(len(trimmed) / SR, 3), "words": t})
        print(seg["id"], round(len(trimmed) / SR, 2), phon[:60])
    json.dump(out, open(os.path.join(EP, "audio/timings.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
