// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.88, 6.24, 8.32, 10.96, 12.72, 14.48, 16.24, 19.68, 21.28, 22.56, 24.96, 27.84, 28.96, 31.2], end: 32.4 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {mowed: 0.28, perfectly: 1.76, every: 2.88, exactly: 4.08, inch1: 5.2, saw: 6.84, neighbors: 7.12, fucking1: 9.2, taller: 9.92, mowed2: 11.28, tiny: 12.96, scissors: 13.36, called: 14.96, police: 15.36, hair: 16.88, fucking2: 17.907, long: 18.8, mowed3: 20.0, officer: 20.4, car: 21.92, whole: 23.04, street: 23.92, finally: 24.96, perfect: 26.88, rained: 28.16, grew: 29.68, inch2: 30.24, got: 31.52, mower: 31.8};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He mowed his lawn. *Perfectly.*',
  'Every blade. *Exactly one inch.*',
  'Then he saw *the neighbor’s lawn.*',
  'It was *one F•CKING inch taller!*',
  'So he mowed *the neighbor’s lawn.*',
  'With *tiny scissors.*',
  'The neighbor *called the police.*',
  'The officer’s hair was *one F•CKING inch too long!*',
  'So he *mowed the officer.*',
  'Then *the police car.*',
  'Then the *whole F•CKING street!*',
  'Finally... *everything was perfect.*',
  'Then *it rained.*',
  'And his lawn *grew one inch.*',
  'So he *got the mower.*'];
