// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 1.76, 3.04, 4.88, 7.68, 9.12, 11.52, 13.2, 16.32, 18.64, 21.36, 23.28, 25.588, 26.96], end: 28.08 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {light: 0.24, red0: 0.8, waited: 2.16, snail: 3.28, crossed: 3.68, onred: 5.2, fucking1: 6.16, criminal: 6.64, kept: 7.84, bird: 9.28, nest: 10.16, hat: 10.72, winter: 12.0, beard: 13.48, fucking2: 14.787, shoes: 15.28, city: 16.48, bus: 17.2, cop: 18.8, sprinted: 19.12, onred2: 20.64, green: 22.56, fucking3: 24.16, happy: 24.64, step: 26.16, red3: 27.6};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['The light *was red.*',
  'So he *waited.*',
  'A snail *crossed the street.*',
  'On red! *The F•CKING criminal!*',
  'He *kept waiting.*',
  'A bird built a nest *on his hat.*',
  'Then *winter came.*',
  'His beard grew down *to his F•CKING shoes!*',
  'The city built *a bus stop around him.*',
  'A cop sprinted across. *On red.*',
  'Then... *the light turned green!*',
  'He was *so F•CKING happy!*',
  'He took *one step.*',
  'And it *turned red.*'];
