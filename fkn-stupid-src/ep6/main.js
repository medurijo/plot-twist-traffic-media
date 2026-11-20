// =====================================================================
//  EP6 "THE ECHO" — canyon with a (very subtle) face, police, the arrest of a canyon
// =====================================================================
const pose_ = (m, o) => { for (const k in o) m[k].r = o[k]; };
const A3 = (b, d) => [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
const yawOf = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
let late = [];
const CY = [0, 0, -500];
// ---------- textures ----------
texC('strata', 512, 512, (x, w, h) => { x.clearRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { const v = Math.sin(y * .05) * .5 + Math.sin(y * .013 + 1) * .5; x.fillStyle = v > .3 ? 'rgba(255,240,220,.16)' : v < -.4 ? 'rgba(60,20,10,.22)' : 'rgba(0,0,0,0)'; x.fillRect(0, y, w, 4); }
  for (let k = 0; k < 60; k++) { x.fillStyle = `rgba(40,15,5,${hsh(k, 1) * .25})`; x.fillRect(hsh(k, 2) * w, hsh(k, 3) * h, 2 + hsh(k, 4) * 4, 20 + hsh(k, 5) * 80); } });
texC('echo', 360, 200, (x, w, h) => { x.fillStyle = '#7a4a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8d2a0'; x.fillRect(10, 10, w - 20, h - 20); x.fillStyle = '#4a2a1a'; x.textAlign = 'center'; x.font = '900 60px "Inter Display"'; x.fillText('ECHO', w / 2, 84); x.fillText('POINT', w / 2, 150); });
texC('tape', 256, 40, (x, w, h) => { x.fillStyle = '#ffd23a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b1b20'; x.textAlign = 'center'; x.font = '900 26px "Inter Display"'; x.fillText('POLICE LINE', w / 2, 30); x.fillRect(0, 0, w, 3); x.fillRect(0, h - 3, w, 3); });
texC('noyell', 300, 200, (x, w, h) => { x.fillStyle = '#fbf6e6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1b1b20'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); x.fillStyle = '#1b1b20'; x.textAlign = 'center'; x.font = '900 40px "Inter Display"'; x.fillText('PLEASE', w / 2, 70); x.fillText('NO YELLING', w / 2, 120); x.font = '700 22px "Courier 10 Pitch"'; x.fillText('(IT YELLS BACK)', w / 2, 165); });
// ---------- canyon ----------
const cy = new Node(); cy.p = CY.slice(); const RK = ['#e08a58', '#cf7448', '#ea9a66', '#c06a40', '#da8052', '#b85e3a'];
const rock = (p, s, k = 0) => cy.add(new Node('box', { c: hex(RK[k % RK.length]), tex: 'strata', spec: .05, rim: .2, out: .015 }, p, s));
// ledge where he stands (edge at z = -1.2)
cy.add(new Node('box', { c: hex('#c98a5a'), spec: 0, out: .01 }, [0, -2, 8], [60, 4, 18.4])); for (let k = 0; k < 6; k++) rock([(k - 2.5) * .6, -6 - k * 4, -1.6 - k * .3], [62, 4.2, 2 + k * .6], k);
cy.add(new Node('box', { c: hex('#9a7a5a'), spec: 0, out: 0 }, [0, .01, 5.2], [60, .02, 3.2])); // dirt road
// opposite wall + side walls
for (let k = 0; k < 8; k++) rock([Math.sin(k) * 2, -28 + k * 5, -42 - k * .8], [90, 5.2, 6], k + 2);
for (const sx of [-1, 1]) for (let k = 0; k < 7; k++) rock([sx * (24 + k * .6), -28 + k * 5, -21], [6 + k, 5.2, 42], k + (sx > 0 ? 3 : 1));
cy.add(new Node('box', { c: hex('#8a5a3a'), spec: 0, out: 0 }, [0, -31, -20], [60, 2, 46])); cy.add(new Node('box', { c: [.35, .55, .75], em: .35, spec: 1, out: 0 }, [0, -29.9, -22], [5, .05, 44]));
// pinnacles
const PIN = [[-9, -17], [9, -20], [0, -29]]; PIN.forEach(([x, z], j) => { for (let k = 0; k < 6; k++) rock([x + Math.sin(k + j) * .4, -29 + k * 4.4, z], [4.4 - k * .35, 4.6, 4.4 - k * .3], k + j); });
// far mesas
for (let k = 0; k < 7; k++) cy.add(new Node('box', { c: hex('#b07060'), spec: 0, out: 0 }, [-70 + k * 24, -10 + hsh(k, 2) * 8, -110 - hsh(k, 3) * 40], [14 + hsh(k, 4) * 20, 30, 14]));
// the face (eyes = caves, mouth = crack) on the opposite wall
const FACE = new Node(); FACE.p = [0, -3, -38.8]; cy.add(FACE);
for (const sx of [-1, 1]) { FACE.add(new Node('box', { c: hex('#3a1e12'), spec: 0, out: .02 }, [sx * 6, 2.5, 0], [6, 4.4, .4])); FACE.add(new Node('box', { c: hex('#a85a36'), tex: 'strata', spec: 0, out: .02 }, [sx * 5.5, 4.6, .6], [5.4, 1.0, 1.4], [0, 0, sx * -.15])); }
const pupils = [-1, 1].map(sx => { const n = new Node('box', { c: [1, .85, .5], em: .9, out: 0 }, [sx * 6, 2.3, .25], [1.4, 1.4, .1]); FACE.add(n); return n; });
FACE.add(new Node('box', { c: hex('#b8653c'), tex: 'strata', spec: 0, out: .02 }, [0, -.8, 1.2], [3, 4, 2.4]));
const mouth = new Node('box', { c: hex('#2a140c'), spec: 0, out: .02 }, [0, -5.2, .1], [11, 1.0, .4]); FACE.add(mouth);
const tapeX = new Node(); for (const s of [-1, 1]) tapeX.add(new Node('box', { c: [.85, .85, .82], spec: .2, out: .01 }, [0, -5.2, .5], [14, 1.6, .2], [0, 0, s * .32])); FACE.add(tapeX);
// rail, sign, binocular viewer, cacti
for (let k = -8; k <= 8; k++) { cy.add(new Node('box', { c: hex('#6a4a30'), spec: 0, out: .01 }, [k * 1.3, .5, -.95], [.12, 1.0, .12])); } for (const y of [.55, .95]) cy.add(new Node('box', { c: hex('#7a5638'), spec: 0, out: .01 }, [0, y, -.95], [21, .08, .06]));
const sgn = new Node(); sgn.p = [-2.6, 0, .2]; sgn.r = [0, .3, 0]; sgn.add(B('#6a4a30', [0, .7, 0], [.1, 1.4, .1])); sgn.add(new Node('quad', { c: [1, 1, 1], tex: 'echo', spec: 0, rim: 0, out: 0 }, [0, 1.5, .06], [.9, .5, 1])); sgn.add(B('#6a4a30', [0, 1.5, 0], [.95, .55, .08], { out: 0 })); cy.add(sgn);
const sg2 = new Node(); sg2.p = [3.4, 0, .4]; sg2.r = [0, -.35, 0]; sg2.add(B('#6a4a30', [0, .6, 0], [.08, 1.2, .08])); sg2.add(new Node('quad', { c: [1, 1, 1], tex: 'noyell', spec: 0, rim: 0, out: 0 }, [0, 1.25, .05], [.66, .44, 1])); cy.add(sg2);
const vw = new Node(); vw.p = [1.9, 0, -.4]; vw.r = [0, Math.PI + .3, 0]; vw.add(cyl('#3a6a8a', [0, .55, 0], [.12, 1.1, .12])); vw.add(B('#3a6a8a', [0, 1.25, 0], [.42, .26, .3], { spec: .8 })); for (const sx of [-1, 1]) vw.add(cyl('#1b1b20', [sx * .1, 1.25, .17], [.1, .1, .1], {}, [Math.PI / 2, 0, 0])); cy.add(vw);
for (const [x, z, s] of [[-5, 1.5, 1], [6, 2.2, 1.2], [-8, 3, .8]]) { const c = new Node(); c.p = [x, 0, z]; c.s = [s, s, s]; c.add(B('#4f8a5b', [0, .8, 0], [.3, 1.6, .3])); c.add(B('#4f8a5b', [.3, 1.0, 0], [.3, .14, .14])); c.add(B('#4f8a5b', [.42, 1.3, 0], [.14, .6, .14])); c.add(B('#4f8a5b', [-.3, .8, 0], [.3, .14, .14])); c.add(B('#4f8a5b', [-.42, 1.0, 0], [.14, .45, .14])); cy.add(c); }
for (let k = 0; k < 14; k++) cy.add(new Node('box', { c: hex(RK[k % 6]), spec: 0, out: .01 }, [(hsh(k, 1) - .5) * 20, .12, 1 + hsh(k, 2) * 8], [.3 + hsh(k, 3) * .5, .25 + hsh(k, 4) * .3, .3 + hsh(k, 5) * .5], [0, k, 0]));
// giant handcuffs on two pinnacles + police tape across the gorge
const GC = new Node(); function ring(par, c, r, n = 14) { for (let k = 0; k < n; k++) { const a = k / n * 6.283; par.add(new Node('box', { c: [.8, .82, .88], spec: 1, rim: .4, out: .01 }, [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r], [r * .5, .9, .9], [0, -a, 0])); } }
ring(GC, [PIN[0][0], -12, PIN[0][1]], 3.2); ring(GC, [PIN[1][0], -12, PIN[1][1]], 3.2); for (let k = 0; k < 9; k++) { const u = k / 8; GC.add(new Node('box', { c: [.8, .82, .88], spec: 1, out: .01 }, [lerp(PIN[0][0] + 3, PIN[1][0] - 3, u), -12 - Math.sin(u * Math.PI) * 2.5, lerp(PIN[0][1], PIN[1][1], u)], [1.6, .4, .6], [0, 0, k % 2 ? .4 : -.4])); } cy.add(GC);
const TAPE = new Node(); for (const [y, z] of [[-1.5, -8], [-3.2, -13]]) for (let k = 0; k < 24; k++) TAPE.add(new Node('quad', { c: [1, 1, 1], tex: 'tape', spec: 0, rim: 0, out: 0, em: .3 }, [-23 + k * 2, y - Math.sin(k / 23 * Math.PI) * 1.2, z], [2.02, .32, 1])); cy.add(TAPE);
scene.add(cy);
// ---------- props ----------
const flowers = new Node(null, null, [0, -.1, .1]); flowers.add(cyl('#4f8a5b', [0, -.15, 0], [.05, .4, .05])); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; flowers.add(B(['#e3263a', '#ffd23a', '#f08aa8', '#fff'][k % 4], [Math.cos(a) * .07, .08 + (k % 2) * .04, Math.sin(a) * .07], [.07, .07, .07], { out: .01 })); } flowers.add(B('#f4f1e8', [0, -.05, 0], [.11, .13, .11], { out: .01 })); hero.armL.end.add(flowers);
const flyF = new Node(); flowers.children.forEach(c => { const q = new Node(c.mesh, Object.assign({}, c.mat), c.p.slice(), c.s.slice()); flyF.add(q); }); scene.add(flyF);
const mega = new Node(null, null, [0, -.1, .12]); mega.add(cyl('#e8e2d0', [0, 0, .12], [.16, .3, .16], { spec: .6 }, [Math.PI / 2, 0, 0])); mega.add(cyl('#e3263a', [0, 0, .3], [.28, .06, .28], { spec: .6 }, [Math.PI / 2, 0, 0])); cop.armR.end.add(mega);
const cuffs = []; for (const arm of [cop.armL, cop.armR]) { const c = new Node(null, null, [0, -.05, 0]); c.add(cyl('#c9ccd4', [0, 0, 0], [.16, .04, .16], { spec: 1 })); arm.end.add(c); cuffs.push(c); }
const phone2 = hero.phone; const HAT0 = hero.hat.p.slice();
const XC = []; for (let k = 0; k < 2; k++) { const c = man({ id: 'cop', shape: 'wide', neck: .28, seed: 20 + k * 5, skin: ['#c48a62', '#e8b48f'][k], shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1, pocket: '#31496b' }); scene.add(c.root); c.root.visible = false; XC.push(c); }
const pebbles = []; for (let k = 0; k < 14; k++) { const q = B(RK[k % 6], [0, 0, 0], [.6, .5, .6], { out: .02 }); q.visible = false; scene.add(q); pebbles.push(q); }
let tod = t => ({ k: .42 }); let lighting = t => ({});
function argue(m, t, amt = 1, seed = 0) { const a = t * 17 + seed; m.sL.r = [-1.6 + Math.sin(a) * 1.2 * amt, 0, .4 + Math.sin(a * 1.3) * .6 * amt]; m.sR.r = [-1.6 + Math.sin(a + 2) * 1.2 * amt, 0, -.4 - Math.sin(a * 1.7) * .6 * amt]; m.eL.r = [-1.2 + Math.sin(a * 2.1) * .8, 0, 0]; m.eR.r = [-1.2 + Math.sin(a * 1.9 + 1) * .8, 0, 0];
  m.body.p = [0, Math.abs(Math.sin(a * .9)) * .18 * amt, 0]; m.body.r = [Math.sin(a * .7) * .2 * amt, Math.sin(a * .5) * .3 * amt, Math.sin(a * 1.1) * .12 * amt]; m.head.r = [Math.sin(a * 2.3) * .25, Math.sin(a * 1.6) * .35, 0]; m.wob = .3; }
function drift(c, t, t0, x0, x1, z, dur = .6, dir = 1) { const u = eout(clamp((t - t0) / dur)); c.root.visible = t >= t0 - .05; c.root.p = A3(CY, [lerp(x0, x1, u), 0, z]); c.root.r = [0, dir * Math.PI / 2 - dir * (1 - u) * .8 * Math.sin(u * Math.PI), 0]; c.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; c.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; return u; }
const T_YELL = WD.hello - .05, T_ECHO1 = WD.hello2 - .05, T_ECHO2 = WD.stop2 - .05, T_ECHO3 = WD.youre2 - .05;
const HP = A3(CY, [-.3, 0, -.45]);
function mouthAmt(t) { let a = 0; for (const [t0, t1] of [[T_ECHO1, pend(1)], [T_ECHO2, pend(5) - .1], [T_ECHO3, pend(9) - .1]]) if (t > t0 && t < t1) a = Math.max(a, .5 + .5 * Math.abs(Math.sin((t - t0) * 14))); return a; }
// ---------- intro / loop: walk to the edge with flowers, deep breath, YELL ----------
function intro(t) { const h = hero; let face = 'neutral'; h.root.p = HP.slice(); h.root.r = [0, Math.PI, 0]; flowers.visible = t < T_YELL + .05; pose_(h, { sL: [-.9, 0, .2], eL: [-.6, 0, 0] });
  const tb = WD.deep - T_END - .1; const inh = clamp((t - tb) / 1.1), yell = t >= T_YELL; if (!yell) { const a = eout(inh); h.body.s = [1 + a * .3, 1 + a * .08, 1 + a * .3]; h.head.r = [-.25 * a, 0, 0]; face = a > .1 ? 'closed' : 'worry'; h.wob = .05 + a * .05; }
  else { const d = t - T_YELL; const a = Math.exp(-d * 1.5); h.body.s = [1 + .3 * Math.exp(-d * 6), 1.08, 1 + .3 * Math.exp(-d * 6)]; h.body.r = [.45 * clamp(d / .1), 0, Math.sin(t * 40) * .05]; pose_(h, { sL: [-2.6, 0, .7], sR: [-2.6, 0, -.7], eL: [0, 0, 0], eR: [0, 0, 0] }); face = 'scream'; h.wob = .4 + .2 * a;
    if (t > WD.canyon + 1.2 && ph(t) === 0 && t > pend(0) - .3) face = 'neutral'; }
  if (t >= T_YELL && t < T_YELL + 2.2) { const d = t - T_YELL; flyF.visible = true; flyF.p = A3(HP, [-.4 + d * .3, 1.5 + d * 3 - d * d * 5, -.6 - d * 4]); flyF.r = [d * 6, d * 3, 0]; }
  return face; }
function hideAll() { for (const m of [hero, cop, ...XC]) { resetPose(m); m.root.visible = false; m.body.s = [1, 1, 1]; } hero.root.visible = true; hero.hat.p = HAT0.slice(); hero.head.s = [1, 1, 1]; flowers.visible = false; flyF.visible = false; mega.visible = false; cuffs.forEach(c => c.visible = false); pcar.root.visible = false;
  tapeX.visible = false; GC.visible = false; TAPE.visible = false; mouth.s = [13, 1.4, .4]; pupils.forEach(p => { p.p[0] = Math.sign(p.p[0]) * 6; p.s = [1.4, 1.4, .1]; }); pebbles.forEach(p => p.visible = false); puffs.forEach(p => p.visible = false); }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); dome.p = [CY[0], -10, CY[2]]; sunN.p = A3(sunN.p, CY); moonN.p = A3(moonN.p, CY); clouds.forEach(c => c.g.p = A3(c.g.p, CY)); lookUpdate(t, L); const h = hero; let face = 'neutral';
  const ma = mouthAmt(t); mouth.s = [13 + ma * 3, 1.4 + ma * 6, .4]; mouth.p = [0, -5.2 - ma * 1.5, .1]; const look = t > P[7] ? [.6, 0] : [0, 0]; pupils.forEach(p => { p.p = [Math.sign(p.p[0]) * 6 + look[0], 2.3 + look[1], .25]; });
  if (i === 0) face = intro(t);
  if (i === 1) { h.root.p = HP.slice(); h.root.r = [0, Math.PI, 0]; face = t < T_ECHO1 ? 'neutral' : 'wide'; if (t > T_ECHO1) { const d = t - T_ECHO1; h.body.r = [-.35, 0, Math.sin(t * 30) * .06]; h.root.p = A3(HP, [0, 0, Math.min(.5, d * 1.5)]); pose_(h, { sL: [-2.0, 0, .9], sR: [-2.0, 0, -.9] }); h.hat.p = [HAT0[0] - d * .5, HAT0[1] + d * 3, d * 2]; h.wob = .5; } }
  if (i === 2 || i === 3) { h.root.p = A3(HP, [0, 0, .5]); h.root.r = [0, Math.PI * .9, 0]; const d = t - P[2]; h.hat.p = [HAT0[0], HAT0[1] + Math.max(0, 2.5 - d * 6), 0]; pose_(h, { sL: [-1.15, 0, -.65], sR: [-1.15, 0, .65], eL: [-1.6, 0, 0], eR: [-1.6, 0, 0] }); face = 'squint'; h.lR.r = [0, 0, Math.max(0, Math.sin(t * 12)) * .15];
    if (i === 3) { h.sR.r = [-1.7, 0, -.2]; h.eR.r = [0, 0, 0]; face = 'talksq'; h.body.r = [.1, 0, 0]; } }
  if (i === 4) { h.root.p = A3(HP, [0, 0, .3]); h.root.r = [0, Math.PI, 0]; argue(h, t, 1.7, 1); h.root.p[1] = Math.abs(Math.sin(t * 11)) * .45; face = Math.sin(t * 24) > 0 ? 'scream' : 'talksq'; h.wob = .5; burst(WD.rock, t, A3(HP, [0, 2.2, -.4]), [.9, .95, 1], 0, 8, .5, 2); }
  if (i === 5 || i === 6) { const d = t - T_ECHO2; if (d < 0) { h.root.p = A3(HP, [0, 0, .3]); h.root.r = [0, Math.PI, 0]; face = 'talksq'; } else { const a = eout(clamp(d / .5)); h.root.p = A3(HP, [0, 0, .3 + a * 3.2]); h.root.r = [-1.3 * a, Math.PI, Math.sin(t * 20) * .2 * (1 - a)]; h.root.p[1] = .15 * a; pose_(h, { sL: [-2.8, 0, 1.0], sR: [-2.8, 0, -1.0] }); h.lL.r = [-1.4, 0, -.3]; h.lR.r = [-1.0, 0, .3]; face = i === 6 ? 'dizzy' : 'scream'; h.wob = .5; h.hat.p = [HAT0[0], HAT0[1] + Math.max(0, Math.sin(clamp(d / .9) * Math.PI)) * .8, 0];
      pebbles.forEach((q, k) => { const pd = d - k * .05; if (pd < 0 || i === 6) return; q.visible = true; q.p = A3(CY, [(hsh(k, 1) - .5) * 30, 8 - pd * pd * 9 + hsh(k, 2) * 4, -38 + hsh(k, 3) * 6]); q.r = [pd * 4, k, 0]; }); } }
  if (i === 7) { h.root.p = A3(HP, [0, 0, 3.4]); h.root.r = [0, .3, 0]; phonePose(h); face = Math.sin(t * 28) > 0 ? 'scream' : 'talk'; h.body.p = [0, Math.abs(Math.sin(t * 14)) * .16, 0]; h.lL.r = [Math.sin(t * 28) * .6, 0, 0]; h.lR.r = [-Math.sin(t * 28) * .6, 0, 0]; h.wob = .35; drift(pcar, t, at(7, .45), -30, 2.6, 5.4); }
  if (i >= 8 && i <= 10) { pcar.root.visible = true; pcar.root.p = A3(CY, [2.6, 0, 5.4]); pcar.root.r = [0, Math.PI / 2, 0]; pcar.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; pcar.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2;
    h.root.p = A3(CY, [-1.4, 0, .4]); h.root.r = [0, 2.6, 0]; face = 'worry'; cop.root.visible = true; cop.root.p = A3(CY, [.9, 0, -.4]); cop.root.r = [0, Math.PI, 0];
    if (i === 8) { mega.visible = true; pose_(cop, { sR: [-1.55, 0, .1], eR: [-.4, 0, 0], sL: [-.3, 0, .3] }); setFace(cop, t > WD.youre - .1 ? 'scream' : 'squint'); cop.body.r = [t > WD.youre ? .3 : 0, 0, 0]; cop.wob = .2; }
    if (i === 9) { mega.visible = true; const d = t - T_ECHO3; if (d < 0) { pose_(cop, { sR: [-1.55, 0, .1], eR: [-.4, 0, 0] }); setFace(cop, 'scream'); } else { const a = eout(clamp(d / .3)); cop.root.p = A3(CY, [.9, 0, -.4 + a * 1.2]); cop.body.r = [-.4 * a, 0, Math.sin(t * 25) * .1]; pose_(cop, { sR: [-2.8, 0, -.4], sL: [-2.8, 0, .4], eR: [0, 0, 0] }); setFace(cop, 'wide'); cop.cap.p = [0, cop.capY + Math.sin(clamp(d / .7) * Math.PI) * .6, 0]; cop.wob = .5; face = 'wide'; } }
    if (i === 10) { cop.root.p = A3(CY, [.9, 0, .8]); const d = t - P[10]; cuffs.forEach(c => c.visible = d > .6); pose_(cop, { sL: [-1.0, 0, -.55], sR: [-1.0, 0, .55], eL: [-1.1, 0, 0], eR: [-1.1, 0, 0] }); cop.head.r = [.35, 0, 0]; setFace(cop, d > .9 ? 'worry' : 'squint');
      if (d > 1.4) { const u = clamp((d - 1.4) / 1.0); cop.root.p = A3(CY, [lerp(.9, 2.0, u), 0, lerp(.8, 4.2, u)]); cop.root.r = [0, .3, 0]; walkPose(cop, t, 7, .4); pose_(cop, { sL: [-1.0, 0, -.55], sR: [-1.0, 0, .55], eL: [-1.1, 0, 0], eR: [-1.1, 0, 0] }); cop.head.r = [.4, 0, 0]; } face = d > 1.0 ? 'squint' : 'wide'; h.sR.r = [-2.4, 0, .9]; h.eR.r = [-2.2, 0, 0]; } }
  if (i === 11) { GC.visible = TAPE.visible = true; tapeX.visible = t > at(11, .55); const pop = eback(clamp((t - P[11] - .15) / .35)); GC.s = [pop, pop, pop]; GC.p = [0, -12 * (1 - pop), 0]; h.root.visible = false;
    [cop, ...XC].forEach((c, k) => { c.root.visible = true; c.root.p = A3(CY, [-1.5 + k * 1.4, 0, -.4]); c.root.r = [0, Math.PI, 0]; pose_(c, { sR: [-2.3, 0, .55], eR: [-1.9, 0, 0] }); setFace(c, 'grin'); c.wob = .05; }); pcar.root.visible = true; pcar.root.p = A3(CY, [2.6, 0, 5.4]); pcar.root.r = [0, Math.PI / 2, 0]; pcar.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; pcar.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; }
  if (i === 12) { GC.visible = TAPE.visible = tapeX.visible = true; h.root.visible = false; pupils.forEach(p => { p.s = [1.4, .7, .1]; p.p[1] = 1.8; }); }
  if (i === 13) { GC.visible = TAPE.visible = tapeX.visible = true; const u = clamp((t - P[13]) / (pend(13) - P[13])); h.root.p = A3(CY, [lerp(3.5, HP[0] - CY[0], u), 0, lerp(4.8, HP[2] - CY[2], u)]); h.root.r = [0, u < .97 ? yawOf([3.5, 0, 4.8], [HP[0] - CY[0], 0, HP[2] - CY[2]]) : Math.PI, 0]; if (u < .97) walkPose(h, t, 6, .5); flowers.visible = true; pose_(h, { sL: [-.9, 0, .2], eL: [-.6, 0, 0] }); face = 'worry'; h.head.r = [.25, 0, 0]; }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, ...XC]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
