// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 4.0, 5.52, 6.72, 8.48, 11.68, 15.28, 17.12, 19.84, 22.16, 23.92, 26.384, 28.8, 29.92], end: 32.0 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {waited: 0.24, fucking1: 2.307, package0: 2.8, blinked: 4.2, once: 4.56, missed2: 5.76, stopped: 7.2, blinking: 7.44, pigeon: 8.64, landed: 9.04, head: 9.84, nothing4: 10.72, cop: 11.84, chased: 12.16, thief: 12.64, yard: 13.28, nothing5: 14.24, sneezed: 16.0, missed7: 17.36, fucking2: 18.307, again: 18.64, mailed: 20.32, himself: 20.68, depot: 21.28, delivery: 22.44, picked: 22.96, up: 23.36, drove: 23.92, around: 24.48, fucking3: 25.027, block: 25.44, threw: 26.48, own: 27.36, door: 27.92, missed12: 29.04, ordered: 30.64, another: 30.96, package13: 31.2};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He waited three days for one *F•CKING package!*',
  'He *blinked once.*',
  '*“We missed you.”*',
  'So he *stopped blinking.*',
  'A pigeon *landed on his head.* Nothing.',
  'A cop *chased a thief* through his yard. Nothing.',
  'Then he *sneezed.*',
  '“We missed you.” *F•CKING again!*',
  'So he *mailed himself* to the depot.',
  'The delivery guy *picked him up.*',
  'Drove him around the *F•CKING block!*',
  'And *threw him* at his own front door.',
  '*“We missed you.”*',
  'So he *ordered another package.*'];
