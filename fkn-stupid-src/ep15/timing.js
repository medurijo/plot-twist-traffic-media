// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.16, 4.56, 5.84, 7.84, 9.44, 10.88, 12.32, 14.04, 15.76, 17.6, 19.08, 21.92, 23.68, 25.147], end: 26.24 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {drove: 0.24, bump0: 1.36, hit: 2.64, fucking1: 3.187, car1: 3.6, assault: 4.8, made: 6.16, arrest: 6.92, dug: 8.08, road4: 8.72, handcuffed: 9.6, police: 11.04, arrived: 11.36, said: 12.8, nothing: 13.12, let: 14.8, go: 15.04, fucking2: 16.16, escaped: 16.48, hid: 17.84, road10: 18.44, arrested: 19.36, whole: 20.12, fucking3: 20.547, road11: 20.96, no: 22.72, road12: 23.04, rolled: 24.04, back: 24.32, got: 25.28, car14: 25.84};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He drove over *the speed bump.*',
  'The bump hit his *F•CKING car!*',
  'That’s *assault.*',
  'So he made a *citizen’s arrest.*',
  'He *dug it out* of the road.',
  'And *handcuffed it.*',
  'The police *arrived.*',
  'The bump *said nothing.*',
  'So the officer *let it go.*',
  'And it *F•CKING escaped!*',
  'It hid *in the road.*',
  'So he arrested *the whole F•CKING road!*',
  'Now there was *no road.*',
  'So he *rolled it back out.*',
  'And got *in his car.*'];
