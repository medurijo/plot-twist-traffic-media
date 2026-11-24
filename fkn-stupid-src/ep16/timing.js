// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.4, 3.92, 6.16, 7.76, 9.68, 11.36, 12.88, 14.88, 16.96, 19.44, 21.68, 23.12, 24.4, 26.3], end: 27.68 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {truck0: 0.72, stop0: 1.56, ran1: 2.76, drove: 4.16, fucking1: 4.627, faster2: 5.12, ran3: 6.6, faster3: 6.8, hat: 8.04, keep: 8.56, cop: 9.76, chase: 10.48, nobody: 11.36, why: 12.08, sign: 13.44, knocked: 14.04, said: 15.44, sold: 16.04, bought: 17.24, fucking2: 18.067, truck9: 18.48, now: 19.44, man: 21.0, played: 21.88, music: 22.32, waved: 23.32, him12: 23.76, fucking3: 24.976, him13: 25.28, did: 26.44, stop14: 27.04};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['The ice cream truck *didn’t stop.*',
  'So he *ran after it.*',
  'It drove *F•CKING faster!*',
  'So he *ran faster.*',
  'His hat *couldn’t keep up.*',
  'A cop *joined the chase.*',
  '*Nobody knows why.*',
  'At the stop sign, *he knocked.*',
  'The driver said: *sold out.*',
  'So he bought the whole *F•CKING truck!*',
  'Now he was *the ice cream man.*',
  'He played *the music.*',
  'Someone *waved at him.*',
  'It was *F•CKING him!*',
  'He did *not stop.*'];
