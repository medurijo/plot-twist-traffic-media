// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 1.6, 3.68, 6.64, 9.2, 11.04, 13.36, 15.04, 18.16, 19.84, 22.08, 25.176, 26.8, 29.04, 30.64, 33.2], end: 34.56 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {dug0: 0.24, hole0: 0.56, where: 1.84, dirt1: 2.36, go: 2.72, second: 4.56, hole2: 4.8, dirt2: 5.787, more: 7.12, fucking1: 7.587, dirt3: 8.08, third: 10.12, hole4: 10.32, fourth: 11.36, fifth: 12.4, cop6: 13.56, came: 13.76, complain: 14.08, fell: 15.28, hole7: 15.76, fucking2: 16.547, six: 17.04, full: 18.96, now8: 19.2, pile9: 20.4, mountain9: 21.12, dug10: 22.4, fucking3: 23.187, giant: 23.76, hole10: 24.24, pushed: 25.32, mountain11: 25.68, in11: 26.08, perfect: 26.8, flat: 27.76, yard: 28.08, cop13: 29.56, climbed: 29.76, out13: 30.08, left: 30.8, tiny: 31.52, dirt14: 32.4, grabbed: 33.56, shovel: 34.0};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He *dug a hole.*',
  'Now where does *the dirt go?*',
  'So he dug a second hole... *for the dirt.*',
  'That made more *F•CKING dirt!*',
  'So he dug a *third hole.*',
  'And a *fourth.* And a *fifth.*',
  'The cop came *to complain.*',
  'He fell into hole number *F•CKING six!*',
  'One hole was *full now.*',
  'But the dirt pile was *a mountain.*',
  'So he dug one *F•CKING giant hole!*',
  'And pushed *the mountain in.*',
  '*Perfect.* A flat yard.',
  'Then the cop *climbed out.*',
  'And left one *tiny pile of dirt.*',
  'So he grabbed *his shovel.*'];
