// ---------- timeline (word-exact from ElevenLabs transcript, ep4 take1) ----------
const TIM = window.TIM || { L: [0.08, 2.96, 5.893, 7.68, 9.92, 13.28, 15.84, 17.52, 19.747, 22.31, 23.92, 26.4, 28.64, 30.96, 33.04], end: 34.64 };
const NOFF = .15; const P = TIM.L.map(x => x + NOFF); const NEND = TIM.end + NOFF; const TAIL = 1.2; const T_END = NEND + TAIL;
const WD = {yelled: 0.28, hello: 1.973, back: 4.04, hello2: 4.64, permission: 7.0, copyright: 8.32, stop: 10.88, rock: 12.56, stop2: 13.28, rock2: 14.96, harassment: 16.44, police: 18.76, officer: 19.84, youre: 20.947, arrest: 21.36, youre2: 22.31, arrest2: 22.88, arrested: 24.8, himself: 25.32, canyon: 27.56, finally: 28.64, quiet: 29.92, sorry: 32.16, deep: 33.64, breath: 33.84};
for (const k in WD) WD[k] += NOFF;
const ph = t => { let i = 0; for (let k = 0; k < P.length; k++) if (t >= P[k]) i = k; return i; }; const pend = i => P[i + 1] ?? NEND; const pu = (t, i) => clamp((t - P[i]) / (pend(i) - P[i])); const at = (i, f) => P[i] + (pend(i) - P[i]) * f;
const CAPS = ['He yelled into the canyon. *HELLO!*',
  'The canyon yelled back. *HELLO!*',
  'He never gave it *permission.*',
  'That was *copyright infringement.*',
  'So he yelled: *STOP COPYING ME, YOU F•CKING ROCK!*',
  '*STOP COPYING ME, YOU F•CKING ROCK!*',
  'That was *harassment.*',
  'So he called the *f•cking police.*',
  'The officer yelled: *YOU ARE UNDER ARREST!*',
  '*YOU ARE UNDER ARREST!*',
  'So the officer *arrested himself.*',
  'Then they *arrested the canyon.*',
  'Finally... *it was quiet.*',
  'So he went back *to say sorry.*',
  'He took a *deep breath...*'];
