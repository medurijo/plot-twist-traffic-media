// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.16, 1.84, 3.68, 6.869, 9.6, 12.4, 14.869, 16.88, 18.8, 20.206, 22.48, 24.08, 25.76, 27.5, 29.246], end: 33.36 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {sleep: 0.8, counted: 2.32, sheep: 2.72, one: 3.68, two: 4.72, three: 6.0, four: 7.44, not: 8.0, jump: 8.8, stood: 10.0, staring: 11.12, push: 13.44, fence: 14.04, kicked: 15.84, five: 17.6, fifty: 19.2, hundred: 20.8, sheep9: 21.68, pillow: 23.24, shepherd: 24.88, asleep: 26.48, counted2: 27.8, slept: 30.0, bed: 30.72, still: 31.68, sleep2: 32.8};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He *couldn’t sleep.*',
  'So he *counted sheep.*',
  '*One... two... three...*',
  'Sheep number four *did NOT F•CKING JUMP!*',
  'It just stood there... *staring at him.*',
  'So he got up *to push it over the fence.*',
  'The sheep *F•CKING KICKED HIM!*',
  'Now there were *five sheep.*',
  'Then *fifty.*',
  'Then *FIVE HUNDRED F•CKING SHEEP!*',
  'They ate his *pillow.*',
  'So he called *a shepherd.*',
  'The shepherd *fell asleep.*',
  'He had *counted the sheep.*',
  'Now the shepherd slept in his bed... and he *still couldn’t f•cking sleep.*'];
