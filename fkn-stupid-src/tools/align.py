# usage: align.py words.json cfg.py timing.js  -> rewrites TIM, WD, CAPS lines in timing.js
import json, re, sys, importlib.util
W = json.load(open(sys.argv[1])); W = W.get('words', W) if isinstance(W, dict) else W
spec = importlib.util.spec_from_file_location('cfg', sys.argv[2]); cfg = importlib.util.module_from_spec(spec); spec.loader.exec_module(cfg)
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
toks = [w for w in W if w.get('type', 'word') == 'word' and not w['text'].startswith('[') and norm(w['text'])]
lines = [[norm(x) for x in re.sub(r'\[[^\]]*\]', ' ', l).split() if norm(x)] for l in cfg.LINES]
pos = 0; LW = []
for li, lw in enumerate(lines):
    cur = []
    for w in lw:
        j = pos
        while j < len(toks) and norm(toks[j]['text']) != w and j < pos + 4: j += 1
        if j < len(toks) and norm(toks[j]['text']) == w: cur.append(toks[j]); pos = j + 1
        else: print('MISS', li, w, file=sys.stderr); cur.append(None)
    LW.append(cur)
L = [round(next(x for x in c if x)['start'], 3) for c in LW]
end = round(toks[-1]['end'], 3)
WD = {}
for key, li, word, *occ in cfg.KEYS:
    n = occ[0] if occ else 1; k = 0
    for x, w in zip(LW[li], lines[li]):
        if w == norm(word) and x:
            k += 1
            if k == n: WD[key] = round(x['start'], 3); break
    else: print('KEYMISS', key, file=sys.stderr)
s = open(sys.argv[3]).read()
s = re.sub(r'const TIM = .*', 'const TIM = window.TIM || { L: %s, end: %s };' % (json.dumps(L), end), s)
s = re.sub(r'const WD = \{[^}]*\};', 'const WD = %s;' % json.dumps(WD).replace('"', ''), s)
s = re.sub(r'const CAPS = \[.*?\];', 'const CAPS = %s;' % json.dumps(cfg.CAPS, ensure_ascii=False).replace('", "', "',\n  '").replace('["', "['").replace('"]', "']"), s, flags=re.S)
open(sys.argv[3], 'w').write(s); print('L', L, 'end', end); print('WD', WD)
