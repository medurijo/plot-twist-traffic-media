// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 3.76, 5.6, 7.92, 10.08, 11.44, 13.84, 16.24, 17.68, 20.0, 21.36, 22.907, 24.08, 25.984, 28.24, 30.36], end: 32.24 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {gnome0: 0.72, fucking1: 1.667, staring: 2.24, him0: 2.96, got: 4.08, restraining: 4.32, order: 4.8, fifty: 5.6, feet: 5.92, minimum: 6.64, morning3: 8.24, closer: 9.2, threw: 10.36, back4: 10.8, through: 11.44, fucking2: 12.384, window: 12.72, morning6: 14.16, porch: 15.36, buried: 16.56, it7: 16.88, morning8: 17.92, car8: 19.24, called: 20.16, cops: 20.44, saw: 21.84, grave: 22.16, arrested: 23.04, him11: 23.68, fucking3: 24.336, kidnapping: 24.64, drove: 26.48, police: 26.96, car13: 27.36, six: 28.24, later: 28.72, came: 29.48, home: 29.76, back15: 31.24, yard: 31.68};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['The neighbor’s gnome was *F•CKING staring* at him.',
  'So he got a *restraining order.*',
  '*Fifty feet.* Minimum.',
  'Next morning, *it was closer.*',
  'So he *threw it back.*',
  'Through the neighbor’s *F•CKING window!*',
  'Next morning, it was *on his porch.*',
  'So he *buried it.*',
  'Next morning, it was *in his car.*',
  'He *called the cops.*',
  'The cop *saw the grave.*',
  'And *arrested him.*',
  'For *F•CKING kidnapping!*',
  'The gnome *drove the police car.*',
  '*Six months later,* he came home.',
  'The gnome was *back in its yard.*'];
