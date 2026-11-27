// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.074, 2.16, 4.08, 6.0, 8.96, 11.92, 13.68, 14.56, 16.8, 18.64, 20.4, 21.84, 24.384, 25.84, 28.24], end: 29.04 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {speed: 0.16, flashed0: 0.96, him0: 1.36, one1: 2.16, limit: 3.12, thought: 4.24, photo2: 4.84, shoot: 5.12, drove3: 6.24, again3: 6.8, posed: 8.12, photo4: 9.36, fucking1: 10.4, blinked: 10.72, drove5: 12.24, again5: 12.8, backwards: 13.68, two: 14.92, fucking2: 15.376, wheels: 15.76, without: 17.2, car8: 17.68, cop9: 18.8, arrest: 19.48, way: 20.4, fast: 21.08, camera11: 22.08, flashed11: 22.4, fucking3: 23.027, cop11: 23.44, ticket: 24.8, too12: 25.12, both: 26.36, drive13: 26.64, every: 27.2, day: 27.52, smile: 28.4};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['A speed camera *flashed him.*',
  'One mile *over the limit.*',
  'He thought it was a *photo shoot.*',
  'So he drove past again... *and posed.*',
  'In the photo, he *F•CKING blinked!*',
  'So he *drove past again.*',
  '*Backwards.*',
  'On two *F•CKING wheels!*',
  'Then *without the car.*',
  'A cop came *to arrest him.*',
  '*Way too fast.*',
  'The camera flashed the *F•CKING cop!*',
  'He got *a ticket too.*',
  'Now they both drive past *every day.*',
  'And *smile.*'];
