// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.24, 3.44, 6.387, 8.48, 11.52, 13.38, 14.56, 17.102, 19.36, 22.32, 23.76, 24.94, 26.88, 29.28], end: 31.84 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {pressed: 0.24, button: 1.2, nothing: 2.24, hundred: 4.32, times: 5.28, finally: 7.12, came: 7.6, full: 8.96, goats: 10.48, stairs: 12.24, forty: 13.38, forty2: 14.56, floors2: 15.92, top: 17.28, opened: 18.56, goats2: 19.6, waiting: 21.04, doormat: 22.84, door: 24.16, keys: 25.84, down: 27.68, newkeys: 28.48, then: 29.76, pressed2: 30.48, button2: 31.28};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He pressed the *elevator button.*',
  '*Nothing* happened.',
  'So he pressed it *a HUNDRED F•CKING TIMES!*',
  'The elevator *finally came.*',
  'It was full... *of F•CKING GOATS!*',
  'So he *took the stairs.*',
  '*Forty floors.*',
  '*FORTY. F•CKING. FLOORS!*',
  'At the top, *the elevator opened.*',
  'The goats... *were F•CKING WAITING* for him!',
  'They ate his *doormat.*',
  'Then his *door.*',
  'Then his *F•CKING KEYS!*',
  'So he went back down *to get new keys.*',
  'And then... he pressed *the elevator button.*'];
