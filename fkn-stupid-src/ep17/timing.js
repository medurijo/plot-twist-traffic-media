// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 3.36, 4.72, 6.88, 8.32, 10.72, 12.72, 14.88, 16.8, 18.4, 19.8, 22.144, 23.24, 24.72, 26.64], end: 28.56 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {pigeon0: 0.24, stole: 0.72, fucking1: 1.667, fry: 2.24, theft: 3.68, arrested2: 5.36, pigeon2: 5.96, called: 7.04, lawyer3: 7.44, arrested4: 8.64, fucking2: 9.36, lawyer4: 9.76, all: 11.12, came: 12.08, every: 13.52, single: 13.92, stuffed: 15.2, car7: 15.92, cop8: 17.04, pulled: 17.24, over: 17.76, opened: 18.56, door: 19.04, four: 19.8, fucking3: 20.627, pigeons10: 21.04, took: 22.24, cop11: 22.56, police: 23.52, car12: 23.92, finally: 24.72, peace: 25.6, sat: 26.92, fries: 27.84};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['A pigeon stole one *F•CKING fry!*',
  'That’s *theft.*',
  'So he *arrested the pigeon.*',
  'It called *its lawyer.*',
  'So he arrested the *F•CKING lawyer!*',
  'Then *all the pigeons* came.',
  'He arrested *every single one.*',
  'And stuffed them *in his car.*',
  'A cop *pulled him over.*',
  'He *opened the door.*',
  'Four hundred *F•CKING pigeons!*',
  'They *took the cop.*',
  'And the *police car.*',
  '*Finally, peace.*',
  'He sat down *with his fries.*'];
