// =====================================================================
//  EP23 "THE SPEED CAMERA" — a speed camera flashed him. He thought it was a photo shoot.
// =====================================================================
const pose_ = (m, o) => { for (const k in o) m[k].r = o[k]; };
const A3 = (b, d) => [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
const yawOf = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
let late = [];
function pathTo(target) { const st = []; const dfs = n => { st.push(n); if (n === target) return true; for (const c of n.children) if (dfs(c)) return true; st.pop(); return false; }; dfs(scene); return st; }
function wp(target, off = [0, 0, 0]) { const ch = target._path || (target._path = pathTo(target)); let m = M4.ident(); for (const n of ch) m = M4.mul(m, M4.trs(n.p, n.r, n.s)); return [m[0] * off[0] + m[4] * off[1] + m[8] * off[2] + m[12], m[1] * off[0] + m[5] * off[1] + m[9] * off[2] + m[13], m[2] * off[0] + m[6] * off[1] + m[10] * off[2] + m[14]]; }
function argue(m, t, amt = 1, seed = 0) { const a = t * 17 + seed; m.sL.r = [-1.6 + Math.sin(a) * 1.2 * amt, 0, .4 + Math.sin(a * 1.3) * .6 * amt]; m.sR.r = [-1.6 + Math.sin(a + 2) * 1.2 * amt, 0, -.4 - Math.sin(a * 1.7) * .6 * amt]; m.eL.r = [-1.2 + Math.sin(a * 2.1) * .8, 0, 0]; m.eR.r = [-1.2 + Math.sin(a * 1.9 + 1) * .8, 0, 0];
  m.body.p = [0, Math.abs(Math.sin(a * .9)) * .18 * amt, 0]; m.body.r = [Math.sin(a * .7) * .2 * amt, Math.sin(a * .5) * .3 * amt, Math.sin(a * 1.1) * .12 * amt]; m.head.r = [Math.sin(a * 2.3) * .25, Math.sin(a * 1.6) * .35, 0]; m.wob = .3; }
const runPose = (h, t, sp = 26) => { walkPose(h, t, sp, 1.1); h.body.p = [0, Math.abs(Math.sin(t * sp)) * .14, 0]; h.body.r = [.25, 0, 0]; };
lamp.p = [-4.6, 0, 1.4]; scene.children.forEach(n => { if (n.p && n.p[0] > 5.2 && n.p[0] < 8.7 && n.p[2] > -2.3 && n.p[2] < -1.5) n.p = [n.p[0] + 5.2, n.p[1], n.p[2]]; });
scene.children.forEach(n => { if (!n.p) return; const z = n.p[2]; if (Math.abs(z - 10.9) < .01 && n.children && n.children.length > 3) n.visible = false; if (z > 14.7 && z < 16.3 && n.p[1] > 3) n.visible = false; if (Math.abs(n.p[0] - 12) < .01 && n.s && Math.abs(n.s[0] - 2.6) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .01 && Math.abs(z - 6.3) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .2 && Math.abs(z - 6.3) < .3) n.visible = false; });
let tod = t => ({ k: .42 }); let lighting = t => ({});
const wheelRun = (h, t, sp = 40, lean = .5) => { const a = t * sp; h.lL.r = [-(a % 6.283), 0, -.1]; h.lR.r = [-((a + 3.14) % 6.283), 0, .1]; h.lL.k = h.lR.k = .3; h.sL.r = [Math.sin(a * .5) * 1.4, 0, .3]; h.sR.r = [-Math.sin(a * .5) * 1.4, 0, -.3]; h.eL.r = h.eR.r = [-1.2, 0, 0];
  h.body.p = [0, .35 + Math.abs(Math.sin(a)) * .08, 0]; h.body.r = [lean, 0, Math.sin(a * .5) * .06]; h.wob = .35; };
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [0, 0, .045], [.09, .06, .09], [1.5708, 0, 0])); cop.armR.end.add(DON);
const STRK = []; for (let k = 0; k < 40; k++) { const n = new Node('box', { c: [1, 1, 1], em: .7, a: .5, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.035, .035, .75]); n.visible = false; scene.add(n); STRK.push(n); }
function stream(t, o, d, len, n0, n1, rad = .5, sp = 1, al = .55) { d = norm(d); const p1 = norm(cross(d, [0, 1, 0])), p2 = cross(p1, d); const yaw = Math.atan2(d[0], d[2]), pit = -Math.asin(clamp(d[1], -1, 1));
  for (let k = n0; k < n1; k++) { const q = STRK[k]; const f = (t * 2.4 * sp + hsh(k, 1)) % 1; const a = hsh(k, 2) * 6.283, r = rad * (.25 + f) * hsh(k, 3);
    q.visible = true; q.p = [o[0] + d[0] * len * f + (p1[0] * Math.cos(a) + p2[0] * Math.sin(a)) * r, o[1] + d[1] * len * f + (p1[1] * Math.cos(a) + p2[1] * Math.sin(a)) * r, o[2] + d[2] * len * f + (p1[2] * Math.cos(a) + p2[2] * Math.sin(a)) * r];
    q.r = [pit, yaw, 0]; q.mat.a = al * Math.sin(f * Math.PI); q.s = [.035, .035, .5 + .6 * sp]; } }
// dust trail behind runners (uses puffs n0..n1)
function dust(t, pos, n0 = 8, n1 = 16, col = [.85, .8, .72]) { for (let k = n0; k < n1; k++) { const q = puffs[k]; const f = (t * 3 + hsh(k, 1)) % 1; q.visible = true; q.p = [pos[0] - f * 2.2, .15 + f * .6, pos[2] + (hsh(k, 2) - .5) * .6]; q.mat.c = col; q.mat.a = .55 * (1 - f); q.s = [.25, .25, .25].map(v => v * (1 + f * 2)); } }
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] - 9.6) < .01 && n.p[2] > 1.4 && n.p[2] < 1.5) n.visible = false; });
const sitPose = m => { m.body.p = [0, -.43, 0]; m.lL.r = [-1.5, 0, -.12]; m.lR.r = [-1.5, 0, .12]; m.lL.k = m.lR.k = 1.4; };
// ===================== EP23 scene: THE SPEED CAMERA =====================
const CZ = 4.2, CAMP = [4.4, 0, 1.35], XFL = 1.8, HAT0 = hero.hat.p.slice();
const HSW = [1.3, 0, 1.0], COPZ = 2.85, COPL = [10.4, 0, -.9], PCZ = 6.9;
// ---------- textures ----------
texC('limit', 200, 260, (x, w, h) => { x.fillStyle = '#f4f1e8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1b1b20'; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#1b1b20'; x.textAlign = 'center'; x.font = '900 34px "Inter Display"'; x.fillText('SPEED', w / 2, 56); x.fillText('LIMIT', w / 2, 96); x.font = '900 120px "Inter Display"'; x.fillText('30', w / 2, 210); });
for (const [nm, v] of [['d31', '31'], ['d97', '97'], ['d00', '--']]) texC(nm, 200, 110, (x, w, h) => { x.fillStyle = '#121216'; x.fillRect(0, 0, w, h); x.fillStyle = v === '97' ? '#ff3a30' : '#ffb020'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 86px "Inter Display"'; x.fillText(v, w / 2, 58); });
texC('ticket', 128, 192, (x, w, h) => { x.fillStyle = '#fff3a8'; x.fillRect(0, 0, w, h); x.fillStyle = '#e3263a'; x.fillRect(0, 0, w, 34); x.fillStyle = '#fff'; x.font = '900 24px "Inter Display"'; x.textAlign = 'center'; x.fillText('TICKET', w / 2, 26); x.fillStyle = '#1b1b20'; for (let k = 0; k < 6; k++) x.fillRect(14, 54 + k * 20, 60 + (k * 37) % 40, 5); x.font = '900 34px "Inter Display"'; x.fillText('$$$', w / 2, 178); });
// ---------- speed camera ----------
const SC = new Node(); SC.p = CAMP.slice(); scene.add(SC);
SC.add(B('#8a8e96', [0, 1.4, 0], [.16, 2.8, .16], { spec: .6 })); SC.add(B('#5a5e66', [0, .05, 0], [.5, .1, .5]));
const SCBOX = B('#f0c44a', [0, 3.15, 0], [.95, .75, .7], { out: .01 }); SC.add(SCBOX); for (let k = 0; k < 4; k++) SC.add(B('#1b1b20', [-.2 + k * .16, 3.15, .352], [.07, .75, .01], { out: 0 }, [0, 0, .5]));
SC.add(B('#3a3a44', [0, 3.58, 0], [1.05, .1, .8])); SC.add(new Node('cyl', { c: hex('#1b1b20'), out: .008, spec: .9 }, [-.48, 3.2, -.1], [.36, .12, .36], [0, 0, 1.5708])); SC.add(new Node('cyl', { c: hex('#4a6a9a'), out: 0, spec: 1, rim: .5 }, [-.6, 3.2, -.1], [.26, .02, .26], [0, 0, 1.5708]));
const FL = new Node('box', { c: [1, 1, 1], em: .15, out: 0, noShadow: 1 }, [-.49, 3.2, .2], [.04, .22, .2]); SC.add(FL);
const DISP = new Node('quad', { c: [1, 1, 1], tex: 'd00', spec: 0, rim: 0, out: 0, em: 1 }, [0, 2.45, .09], [.5, .28, 1]); SC.add(B('#2a2a30', [0, 2.45, .03], [.58, .36, .1])); SC.add(DISP);
const LIM = new Node(); LIM.p = [-3.2, 0, 1.5]; LIM.add(B('#8a8e96', [0, 1.2, 0], [.08, 2.4, .08], { spec: .6 })); LIM.add(B('#f4f1e8', [0, 2.2, 0], [.7, .9, .05])); LIM.add(new Node('quad', { c: [1, 1, 1], tex: 'limit', spec: 0, rim: 0, out: 0 }, [0, 2.2, .03], [.66, .86, 1])); LIM.r = [0, -Math.PI / 2 + .75, 0]; scene.add(LIM);
// ---------- hero car (convertible) ----------
const HCAR = car({ body: '#3f8f7a', stripe: '#f4f1e8' }); scene.add(HCAR.root); HCAR.root.children[1].visible = false; HCAR.l1.visible = HCAR.l2.visible = false;
HCAR.root.add(B('#2a2a30', [0, .9, -.4], [1.6, .12, 1.4])); HCAR.root.add(B('#2a2a30', [0, 1.2, -1.05], [1.6, .55, .12])); HCAR.root.add(new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [.42, 1.12, .35], [.36, .04, .36], [-.9, 0, 0]));
const SEAT = new Node(null, null, [.42, .44, -.3]); HCAR.root.add(SEAT); const STND = new Node(null, null, [.42, .62, -.35]); HCAR.root.add(STND);
function setCar(c, x, z, yaw = Math.PI / 2, roll = 0) { c.root.visible = true; c.root.p = [x, Math.abs(Math.sin(roll)) * .95, z]; c.root.r = [0, yaw, roll]; }
// police car, open top for the ending
const PSEAT = [B('#2a2a30', [0, .9, -.6], [1.6, .12, 2.2]), B('#2a2a30', [0, 1.2, -1.6], [1.6, .55, .12]), new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [.42, 1.12, .55], [.36, .04, .36], [-.9, 0, 0])]; PSEAT.forEach(n => pcar.root.add(n));
const CSEAT = new Node(null, null, [.42, .44, -.1]); pcar.root.add(CSEAT);
function setPcar(x, z, t) { setCar(pcar, x, z); pcar.root.children[1].visible = false; PSEAT.forEach(n => n.visible = true); pcar.l1.p[1] = pcar.l2.p[1] = 1.0; const s = Math.sin(t * 14) > 0; pcar.l1.mat.em = s ? 1 : .2; pcar.l2.mat.em = s ? .2 : 1; }
// flying ticket
const TKT = new Node('quad', { c: [1, 1, 1], tex: 'ticket', spec: 0, rim: 0, out: 0 }, [0, 0, 0], [.36, .52, 1]); scene.add(TKT);
// ---------- flashes ----------
const F0 = WD.flashed0, F3 = WD.posed + .05, F5 = WD.again5 + .1, F6 = WD.backwards + .4, F7 = WD.fucking2, F8 = WD.car8 + .05, F11 = WD.flashed11 + .05, F13a = WD.every, F13b = WD.day + .1;
const FLASHES = [F0, F3, F5, F6, F7, F8, F11, F13a, F13b];
const flashAmt = t => { for (const f of FLASHES) { const d = t - f; if (d >= 0 && d < .3) return 1 - d / .3; } return 0; };
// ---------- poses ----------
const poseUp = h => { pose_(h, { sR: [-2.9, 0, -.3], eR: [-.2, 0, 0], sL: [.25, 0, .85], eL: [-1.7, 0, 0] }); h.head.r = [-.1, 0, .15]; };
const poseV = h => { pose_(h, { sL: [-2.6, 0, .75], sR: [-2.6, 0, -.75], eL: [-.2, 0, 0], eR: [-.2, 0, 0] }); };
const posePeace = h => { pose_(h, { sR: [-2.0, 0, -.5], eR: [-1.3, 0, 0], sL: [.25, 0, .85], eL: [-1.7, 0, 0] }); h.head.r = [0, 0, -.2]; };
const drive = h => { sitPose(h); pose_(h, { sL: [-1.25, 0, .15], sR: [-1.25, 0, -.15], eL: [-.4, 0, 0], eR: [-.4, 0, 0] }); };
function inCar(h, standUp = false) { const c = HCAR.root; h.root.p = wp(standUp ? STND : SEAT); h.root.r = c.r.slice(); if (!standUp) drive(h); }
// car x for the approach / loop: passes XFL at F0, then brakes to a stop
const CSTOP = XFL + 9 * 1.1 - 9 / 2.2 * 1.21;
function carX0(t) { if (t < F0) return XFL + 9 * (t - F0); const d = Math.min(t - F0, 1.1); return XFL + 9 * d - 9 / 2.2 * d * d; }
// ---------- loop intro: he drives toward the camera, smiling ----------
function intro(t) { const h = hero; setCar(HCAR, carX0(t), CZ); inCar(h); DISP.mat.tex = 'd00'; const k = clamp((t + .8) / .5); h.head.r = [-.05, 0, .1 * k]; return t > -1.0 ? 'grin' : 'neutral'; }
function hideAll() { for (const m of [hero, cop]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice(); puffs.forEach(p => p.visible = false); STRK.forEach(s => s.visible = false);
  HCAR.root.visible = true; pcar.root.visible = false; DON.visible = false; TKT.visible = false; DISP.mat.tex = 'd31'; FL.mat.em = .15; cop.root.s = [1, 1, 1]; }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  const fa = flashAmt(t); FL.mat.em = .15 + fa * 6; lamp.visible = i !== 10; LIM.visible = i !== 10; HYD.forEach(n => n.visible = i !== 10);
  if (i === 0) { face = intro(t); if (t < F0) DISP.mat.tex = 'd00'; else DISP.mat.tex = 'd31'; if (t > F0) { const d = t - F0; face = d < .5 ? 'wide' : 'squint'; if (d < .5) pose_(h, { sL: [-1.9, 0, .4], eL: [-1.6, 0, 0] }); h.head.r = [.1, 0, 0]; } }
  // L1-L2: parked past the camera
  if (i === 1 || i === 2) { setCar(HCAR, CSTOP, CZ); inCar(h); }
  if (i === 1) { h.head.r = [0, 2.2 * clamp((t - P[1] - .2) / .3), 0]; face = 'wide'; pose_(h, { sR: [-1.25, 0, -.15], sL: [-.2, 0, .5] }); h.body.r = [0, .4, 0]; }
  if (i === 2) { const d = t - P[2]; face = 'grin'; h.head.r = [0, 0, Math.sin(d * 4) * .15]; if (d > .5) { pose_(h, { sR: [-2.7, 0, -.9], eR: [-1.3, 0, 0] }); hero.hat.p = A3(HAT0, [0, Math.max(0, Math.sin(d * 9)) * .06, 0]); } if (t > WD.shoot) { pose_(h, { sL: [-2.2, 0, .3], eL: [-1.7, 0, 0] }); } }
  // L3: backs up, drives past again and poses
  if (i === 3) { const tb = P[3] + .95, tf = tb + .1; let x; if (t < tb) x = lerp(CSTOP, -9, eio(clamp((t - P[3]) / (tb - P[3])))); else if (t < F3) x = lerp(-9, XFL, clamp((t - tf) / (F3 - tf))); else { const d = Math.min(t - F3, .9); x = XFL + 10.7 * d - 10.7 / 1.8 * d * d; }
    setCar(HCAR, x, CZ); if (t < tb) { inCar(h); h.head.r = [0, 2.6, 0]; face = 'squint'; burst(P[3] + .05, t, [CSTOP + 2.4, .3, CZ], [.85, .8, .72], 0, 8, .8, .6); }
    else if (t < F3 - .55) { inCar(h); face = 'grin'; } else { inCar(h, true); poseUp(h); face = t > F3 && t < F3 + .4 ? 'wide' : 'grin'; } }
  // L4: in the photo he blinked -> rage
  if (i === 4) { setCar(HCAR, XFL + 10.7 * .9 - 10.7 / 1.8 * .81, CZ); inCar(h, true); face = 'neutral'; h.root.r = [0, Math.PI / 2 - .6, 0];
    if (t > WD.fucking1 - .1) { face = Math.sin(t * 22) > 0 ? 'scream' : 'wide'; pose_(h, { sL: [-2.6 + Math.sin(t * 25) * .3, 0, .6], sR: [-2.6 - Math.sin(t * 25) * .3, 0, -.6], eL: [-1.2, 0, 0], eR: [-1.2, 0, 0] }); h.wob = .5; h.root.p[1] += Math.abs(Math.sin(t * 12)) * .25; } }
  // L5: again (eyes wide open)
  if (i === 5) { let x; if (t < F5) x = lerp(-14, XFL, clamp((t - P[5]) / (F5 - P[5]))); else x = XFL + 16 * (t - F5) - 7 * (t - F5) ** 2; setCar(HCAR, x, CZ); inCar(h, true); poseV(h); face = 'wide'; h.head.r = [-.1, 0, 0]; }
  // L6: backwards
  if (i === 6) { const x = lerp(-6, XFL, (t - P[6]) / (F6 - P[6])); setCar(HCAR, x, CZ, -Math.PI / 2); inCar(h, true); h.root.r = [0, Math.PI / 2, 0]; posePeace(h); face = 'grin'; kneel(h); h.root.p[1] += .4; }
  // L7: two wheels
  if (i === 7) { const x = t < F7 ? lerp(-10, XFL, (t - P[7]) / (F7 - P[7])) : XFL + 14 * (t - F7); const roll = -.5 * eout(clamp((t - P[7]) / .3)); setCar(HCAR, x, CZ, Math.PI / 2, roll); inCar(h, true); poseUp(h); face = t > F7 - .3 ? 'scream' : 'grin'; h.wob = .4; }
  // L8: without the car
  const CARP = [-4.5, 0, CZ];
  if (i >= 8 && i < 13) setCar(HCAR, CARP[0], CARP[2]);
  if (i === 8) { const x = t < F8 ? lerp(-9, XFL, (t - P[8]) / (F8 - P[8])) : XFL + 18 * (t - F8); h.root.p = [x, 0, 2.9]; h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 60, .45); poseUp(h); face = 'grin'; late.push(() => stream(t, A3(h.root.p, [-.3, 1.4, 0]), [-1, 0, 0], 4, 0, 16, .8, 2, .5)); dust(t, h.root.p, 8, 16); }
  // L9-L12: he poses on the sidewalk; the cop comes
  if (i >= 9 && i <= 12) { h.root.p = HSW.slice(); h.root.r = [0, Math.PI / 2 - .25, 0]; posePeace(h); face = 'grin'; }
  if (i === 9) { const u = clamp((t - P[9] - .3) / (pend(9) - P[9] - .3)); cop.root.visible = true; cop.root.p = [lerp(-20, -15, u), 0, COPZ]; cop.root.r = [0, Math.PI / 2, 0]; walkPose(cop, t, 12, .9); DON.visible = true; pose_(cop, { sR: [-1.3, 0, -.2], eR: [-1.0, 0, 0] }); setFace(cop, 'squint'); }
  if (i === 10 || (i === 11 && t < F11)) { const u = (t - P[10]) / (F11 - P[10]); const x = lerp(-15, XFL, u * u * .4 + u * .6); cop.root.visible = true; cop.root.p = [x, 0, COPZ]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 80, .75); DON.visible = true; setFace(cop, 'squint'); cop.head.r = [.15, 0, 0];
    late.push(() => stream(t, A3(cop.root.p, [-.5, 1.3, 0]), [-1, 0, 0], 5, 0, 20, .9, 2.5, .55)); dust(t, cop.root.p, 8, 16); }
  if (i === 11 && t >= F11) { const d = t - F11; cop.root.visible = true; DON.visible = d < .3; if (d < .25) { cop.root.p = [XFL + d * 20, 0, COPZ]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 80, .75); setFace(cop, 'wide'); }
    else if (d < 1.0) { const u = (d - .25) / .75; cop.root.p = [lerp(XFL + 5, COPL[0], u), Math.sin(u * Math.PI) * 2.6, lerp(COPZ, COPL[2], u)]; cop.root.r = [u * 8, Math.PI / 2, u * 3]; pose_(cop, { sL: [-2.9, 0, .7], sR: [-2.9, 0, -.7] }); cop.lL.r = [-1.2, 0, 0]; setFace(cop, 'scream'); cop.wob = .6; }
    else { cop.root.p = [COPL[0], .05, COPL[2]]; cop.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; pose_(cop, { sL: [0, 0, 1.3], sR: [0, 0, -1.3] }); setFace(cop, 'dizzy'); burst(F11 + 1.0, t, A3(COPL, [0, .3, 0]), [.85, .8, .72], 0, 12, 1.2, .8); }
    if (d > .15) { argue(h, t, .5, 2); face = Math.sin(t * 18) > 0 ? 'grin' : 'talk'; } }
  if (i === 11 || i === 12) DISP.mat.tex = t > F11 ? 'd97' : 'd31';
  if (i === 12) { cop.root.visible = true; cop.root.p = [COPL[0], .05, COPL[2]]; cop.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; pose_(cop, { sL: [0, 0, 1.3], sR: [0, 0, -1.3] }); setFace(cop, 'dizzy');
    const d = t - P[12] - .1; if (d > 0) { TKT.visible = true; const a = wp(SCBOX, [0, -.2, .4]), b = wp(cop.head, [0, .25, .3]); const u = clamp(d / .9); TKT.p = [lerp(a[0], b[0], u) + Math.sin(u * 9) * .4 * (1 - u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * .8, lerp(a[2], b[2], u)]; TKT.r = u < 1 ? [u * 6, u * 9, u * 3] : [-Math.PI / 2, 0, .3]; if (u >= 1) TKT.p = A3(b, [0, .05, 0]); }
    pose_(h, { sR: [-1.6, 0, -.2], eR: [0, 0, 0] }); h.root.r = [0, yawOf(HSW, COPL), 0]; face = Math.sin(t * 16) > 0 ? 'grin' : 'talk'; h.body.p = [0, Math.abs(Math.sin(t * 16)) * .12, 0]; }
  // L13: both drive past every day
  if (i === 13) { const xh = lerp(-12, 9, (t - P[13]) / (pend(13) - P[13])), xp = xh - 1.6; setCar(HCAR, xh, CZ); inCar(h, true); poseUp(h); face = 'grin';
    setPcar(xp, PCZ, t); cop.root.visible = true; cop.root.p = wp(CSEAT); cop.root.r = pcar.root.r.slice(); sitPose(cop); posePeace(cop); setFace(cop, 'grin'); }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
