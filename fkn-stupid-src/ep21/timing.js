// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 1.84, 4.24, 6.0, 8.08, 9.92, 11.52, 13.76, 14.92, 16.377, 18.32, 19.68, 21.44, 22.76, 24.0, 25.72], end: 27.12 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {got: 0.32, ticket0: 1.04, no1: 1.84, fucking1: 2.88, street1: 3.28, removed: 4.72, street2: 5.36, street3: 6.24, rule: 7.12, wrote: 8.44, ticket4: 9.24, dirt: 10.72, rolled6: 11.88, cop6: 12.16, street6: 13.0, more: 13.76, came: 14.24, rolled8: 15.08, too: 15.76, fucking2: 17.04, huge: 17.44, rolled10: 18.76, away: 19.08, back11: 20.0, fucking3: 20.453, him11: 20.8, flattened: 21.68, unrolled: 22.96, every: 24.0, popped: 24.68, one: 25.92, pen: 26.693};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He got a *parking ticket.*',
  'No parking on this *F•CKING street!*',
  'So he *removed the street.*',
  'No street. *No rule.*',
  'The cop wrote *another ticket.*',
  'For parking *in the dirt.*',
  'So he rolled the cop *up in the street.*',
  '*More cops* came.',
  'He rolled them *up too.*',
  'The roll got *F•CKING huge!*',
  'And it *rolled away.*',
  'Right back at *F•CKING him!*',
  'It *flattened him.*',
  'And *unrolled.*',
  'Every cop *popped out.*',
  'And one *had a pen.*'];
