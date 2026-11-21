// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 3.12, 4.8, 6.24, 8.8, 10.4, 12.36, 14.56, 16.4, 17.96, 20.4, 23.04, 25.36, 26.88], end: 27.76 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {meter: 0.64, expired: 1.76, fed: 3.44, coin: 3.84, more: 5.44, fucking1: 7.376, wallet: 7.76, shoes: 9.28, cop: 10.48, ticket: 11.733, fed2: 12.72, cop2: 13.68, partner: 15.16, running: 15.76, fed3: 16.56, too: 17.32, whole: 18.36, fucking2: 18.816, car: 19.52, parking: 21.12, ninety: 22.24, fucking3: 23.92, proud: 24.36, burped: 26.12, said: 27.28};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['The parking meter said... *EXPIRED.*',
  'So he *fed it a coin.*',
  'It *wanted more.*',
  'So he fed it *his F•CKING wallet!*',
  'Then *his shoes.*',
  'A cop came *to write him a ticket.*',
  'So he fed the meter... *the cop.*',
  'The cop’s partner *came running.*',
  'He fed *the partner too.*',
  'Then the whole *F•CKING police car!*',
  'Now he had parking *until 2090.*',
  'He was *so F•CKING proud!*',
  'Then the meter *burped.*',
  'And it said...'];
