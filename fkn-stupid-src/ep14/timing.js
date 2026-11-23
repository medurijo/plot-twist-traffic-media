// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.32, 3.44, 5.12, 7.44, 9.04, 10.88, 12.8, 15.28, 17.12, 18.8, 20.56, 22.8, 24.84, 27.12, 28.76], end: 30.4 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {leaf: 0.56, landed: 0.96, lawn0: 2.24, got: 3.76, blower1: 4.32, blew: 5.36, neighbors: 6.08, back: 8.4, fucking1: 9.507, hat: 9.92, bigger: 11.64, fucking2: 13.669, jet: 14.16, flew: 16.16, still: 17.12, donut: 17.84, two: 19.52, fucking3: 21.44, mouth: 21.84, stopped: 23.36, middle: 24.2, ran: 25.36, gas: 25.84, silence: 27.12, very: 29.2, slowly: 29.6};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['One leaf landed on *his perfect lawn.*',
  'So he got *the leaf blower.*',
  'And blew it onto *the neighbor’s lawn.*',
  'The neighbor *blew it back.*',
  'And his *F•CKING hat!*',
  'So he got *a bigger blower.*',
  'The neighbor got a *F•CKING jet engine!*',
  'A police officer *flew by.*',
  'Still eating *his donut.*',
  'So he used *two blowers.*',
  'And one in his *F•CKING mouth!*',
  'The leaf stopped *in the middle.*',
  'Then both *ran out of gas.*',
  '*Silence.*',
  'Then, *very slowly...*'];
