// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.48, 3.84, 7.6, 10.0, 11.6, 12.48, 14.08, 15.84, 17.28, 18.56, 20.64, 22.16, 24.08, 25.36], end: 26.48 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {chips: 1.52, stuck: 2.88, second: 4.56, knock: 5.72, down: 6.64, fucking1: 8.704, stuck2: 9.04, shook: 10.28, climbed: 12.76, inside: 13.52, he: 14.52, cop: 16.04, help: 16.68, shook2: 17.4, fell: 18.8, fucking2: 19.456, everything: 20.64, out: 21.44, chips2: 23.16, opened: 24.28, bag: 24.72, fucking3: 25.36, empty: 25.76};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He just wanted *one bag of chips.*',
  'It got *stuck.*',
  'So he bought a second bag... *to knock the first one down.*',
  'Now both were *F•CKING stuck!*',
  'So he *shook the machine.*',
  '*Nothing.*',
  'So he *climbed inside.*',
  'Now *HE* was stuck.',
  'A cop came *to help.*',
  'He *shook the machine...*',
  'It fell on the *F•CKING cop!*',
  '*Everything* fell out.',
  'Finally... *his chips.*',
  'He *opened the bag...*',
  '*F•CKING EMPTY!*'];
