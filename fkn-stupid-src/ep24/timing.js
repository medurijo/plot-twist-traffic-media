// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.4, 4.08, 6.16, 9.92, 12.464, 13.84, 15.04, 17.2, 19.12, 23.022, 24.4, 25.893, 27.6, 29.36], end: 31.2 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {bird0: 0.44, pooped0: 0.72, car0: 1.36, tiny1: 2.72, drop1: 3.12, washed: 4.4, whole2: 5.0, car2: 5.2, back3: 6.8, pooped3: 7.64, exact: 8.16, spot: 9.16, fucking1: 10.656, pressure: 10.96, washer: 11.36, paint: 13.4, neighbor: 14.24, built: 15.36, roof7: 15.72, landed: 17.68, roof8: 18.24, tiny9: 19.44, drop9: 20.08, fucking2: 21.12, collapsed: 21.84, cop10: 23.16, running: 23.68, ticket: 25.627, fucking3: 26.16, littering: 26.56, bought: 28.0, new: 28.56, car13: 28.72, parked: 29.6, under: 30.32, bird14: 30.64};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['A bird *pooped on his car.*',
  'One *tiny drop.*',
  'So he washed *the whole car.*',
  'The bird came back... and pooped on the *exact same spot.*',
  'So he got a *F•CKING pressure washer!*',
  'It washed off *the paint.*',
  'And *the neighbor.*',
  'So he built *a roof* over his car.',
  'The bird *landed on the roof.*',
  'One tiny drop... and the whole *F•CKING roof collapsed!*',
  'A cop *came running.*',
  'The cop gave him *a ticket.*',
  'For *F•CKING littering!*',
  'So he bought a *brand new car.*',
  'And parked it *right under the bird.*'];
