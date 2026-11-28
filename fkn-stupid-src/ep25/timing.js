// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.153, 2.32, 5.04, 6.96, 8.32, 10.08, 12.8, 15.92, 17.84, 19.982, 22.56, 25.12, 26.88, 28.32, 30.107], end: 31.76 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {found: 0.28, wallet0: 0.72, sidewalk: 1.2, keeping: 2.32, fucking1: 3.587, theft1: 4.08, ran: 5.6, police: 6.08, opened: 7.36, own: 8.88, wallet4: 9.56, turned: 10.4, taking: 11.68, reported: 13.2, cop6: 13.76, arresting: 14.48, owner: 15.12, second7: 16.08, checked: 16.8, ten: 17.84, fucking2: 18.4, dollars: 18.88, kept: 20.12, actual: 21.28, theft9: 21.76, first: 22.92, arrested: 23.44, second10: 24.24, drove: 25.36, jail: 26.12, got: 27.04, back12: 27.6, put: 28.44, pocket: 29.28, fucking3: 30.64, hole: 31.12};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He found a wallet *on the sidewalk.*',
  'Keeping it? That’s *F•CKING theft!*',
  'So he ran it *to the police.*',
  'The cop *opened it.*',
  'It was *his own wallet.*',
  'So he turned himself in. *For taking it.*',
  'Then he reported the cop... *for arresting the owner.*',
  'The second cop *checked the wallet.*',
  'Ten *F•CKING dollars!*',
  'He kept them. *That’s actual theft.*',
  'So the first cop *arrested the second cop.*',
  'They drove each other *to jail.*',
  'He got his *wallet back.*',
  'And put it in his *back pocket.*',
  'Which had a *F•CKING hole.*'];
