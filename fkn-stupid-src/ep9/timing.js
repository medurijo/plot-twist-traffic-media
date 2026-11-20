// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.24, 3.84, 5.76, 7.76, 10.133, 11.6, 13.68, 16.24, 17.76, 20.0, 22.16, 26.72, 28.4, 29.76], end: 30.8 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {saw: 0.24, spider: 0.68, this: 2.64, big: 2.96, burned: 4.16, down: 4.96, moved: 6.32, car: 7.16, burned2: 8.16, fucking1: 8.64, car2: 9.28, firefighters: 10.32, came: 10.88, moved2: 12.16, truck: 13.04, burned3: 14.08, fucking2: 14.56, truck2: 15.36, police: 16.64, hat: 19.28, burned4: 20.4, hat2: 21.64, house: 23.36, car3: 24.0, fucking3: 25.187, spider3: 25.6, bought: 27.173, perfect: 29.2, opened: 29.92, door: 30.4};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He saw a *spider* in his house.',
  'It was *this big.*',
  'So he *burned the house down.*',
  'The spider moved *into his car.*',
  'So he burned *the F•CKING car!*',
  'The *firefighters came.*',
  'The spider moved *into the fire truck.*',
  'So he burned *the F•CKING fire truck!*',
  'Then *the police came.*',
  'The spider was *on the officer’s hat.*',
  'So he burned *the officer’s hat.*',
  'Now he had no house, no car... *and no F•CKING spider!*',
  'So he *bought a new house.*',
  'It was *perfect.*',
  'He *opened the door...*'];
