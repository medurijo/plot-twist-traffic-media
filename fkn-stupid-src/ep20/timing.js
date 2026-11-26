// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.24, 2.12, 4.16, 5.44, 7.653, 10.16, 11.92, 13.56, 15.84, 18.16, 19.76, 21.36, 22.64], end: 24.0 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {missed0: 0.4, truck0: 1.2, one: 2.24, fucking1: 2.64, second: 3.2, chased: 4.48, threw3: 5.6, bag: 5.92, missed3: 6.8, threw4: 7.72, bin: 8.24, fucking2: 8.8, missed4: 9.2, threw5: 10.48, himself: 10.72, in5: 11.28, crushed: 12.48, him6: 12.88, perfect: 13.84, fucking3: 14.4, cube7: 14.88, week: 16.16, brought: 16.88, back8: 17.28, still: 18.48, cube9: 18.8, pigeon: 19.88, moved: 20.24, unfolded: 21.84, took: 22.88, trash: 23.52};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He missed *the garbage truck.*',
  'By one *F•CKING second!*',
  'So he *chased it.*',
  'He threw the bag. *Missed.*',
  'He threw the bin. *F•CKING missed!*',
  'So he threw *himself in.*',
  'The truck *crushed him.*',
  'Into a perfect *F•CKING cube!*',
  '*Next week,* it brought him back.',
  'He was *still a cube.*',
  'A pigeon *moved in.*',
  'So he *unfolded.*',
  'And took out *the trash.*'];
