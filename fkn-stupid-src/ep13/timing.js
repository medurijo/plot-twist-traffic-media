// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 3.6, 5.2, 6.88, 9.744, 12.24, 14.16, 15.44, 17.36, 19.2, 21.84, 24.4, 26.64, 28.16], end: 28.72 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {clock: 0.72, ticking: 1.36, loud: 2.56, called: 3.92, came: 5.48, sirens: 5.88, fucking1: 8.227, louder: 8.64, called2: 9.92, on: 11.04, cops2: 11.28, fucking2: 12.707, came2: 13.44, louder2: 14.52, stole: 15.84, sirens2: 16.52, hid: 17.6, can: 18.76, fucking3: 20.307, screaming: 20.8, arrested: 22.48, can2: 23.88, silence: 25.44, heard: 27.2, tick: 28.16};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['His neighbor’s clock was ticking... *too loud.*',
  'So he *called the cops.*',
  'They came *with sirens.*',
  'The sirens were even *F•CKING louder!*',
  'So he called the cops... *on the cops.*',
  'More *F•CKING cops* came.',
  'Even *louder.*',
  'So he *stole all their sirens...*',
  'and hid them *in his trash can.*',
  'The trash can was *F•CKING screaming!*',
  'So the cops *arrested the trash can.*',
  'Finally... *silence.*',
  'Then he *heard it.*',
  '*Tick.*'];
