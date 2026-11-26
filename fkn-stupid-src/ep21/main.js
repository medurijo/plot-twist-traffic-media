// =====================================================================
//  EP21 "THE STREET" — no parking on this street. So he removed the street.
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
// ---------- road that can be rolled up ----------
const ROAD = scene.children.find(n => n.p && Math.abs(n.p[2] - 7) < .01 && Math.abs(n.p[1] + .12) < .01 && n.s && n.s[0] > 100);
const MARKS = scene.children.filter(n => n.p && Math.abs(n.p[2] - 7) < .01 && n.s && Math.abs(n.s[0] - 2.2) < .01);
scene.add(B('#7a5a3c', [0, -.16, 7], [160, .2, 10], { out: 0 })); for (let k = 0; k < 40; k++) scene.add(B(k % 2 ? '#6a4a30' : '#8a6a48', [-10 + hsh(k, 1) * 50, -.05, 2.5 + hsh(k, 2) * 9], [.3 + hsh(k, 3) * .5, .04, .2 + hsh(k, 4) * .4], { out: 0 }));
function setRoad(xr) { ROAD.p = [(-80 + xr) / 2, -.12, 7]; ROAD.s = [Math.max(.01, xr + 80), .2, 10]; MARKS.forEach(m => m.visible = m.p[0] + 1.1 < xr); }
const ROLLG = new Node(); ROLLG.add(new Node('cyl', { c: hex('#4a4854'), out: .01, spec: .15, rim: .15 }, [0, 0, 0], [4.6, 5, 4.6], [1.5708, 0, 0]));
for (const z of [-5.01, 5.01]) { ROLLG.add(new Node('cyl', { c: hex('#5a5864'), out: 0 }, [0, 0, z], [4.62, .02, 4.62], [1.5708, 0, 0])); for (let k = 1; k <= 5; k++) ROLLG.add(new Node('cyl', { c: hex(k % 2 ? '#3a3844' : '#e9e4d4'), out: 0 }, [0, 0, z * (1 + k * .0004)], [4.6 * (1 - k * .16), .02, 4.6 * (1 - k * .16)], [1.5708, 0, 0])); }
const RCUFF = new Node(); for (const z of [-1.6, 1.6]) RCUFF.add(new Node('cyl', { c: hex('#c8ccd6'), spec: 1, out: .01, rim: .4 }, [0, 0, z], [4.9, .18, 4.9], [1.5708, 0, 0])); for (let k = 0; k < 5; k++) RCUFF.add(B('#c8ccd6', [0, 2.45, -1.2 + k * .6], [.22, .18, .4], { spec: 1 }, [k % 2 ? 1.5708 : 0, 0, 0])); ROLLG.add(RCUFF);
ROLLG.p = [0, 2.3, 7]; scene.add(ROLLG);
function setRoll(xr, r) { ROLLG.visible = r > .05; const k = r / 2.3; ROLLG.s = [k, k, 1]; ROLLG.p = [xr - r, r - .02, 7]; }
const HCAR = car({ body: '#3f8f7a', stripe: '#f4f1e8' }); scene.add(HCAR.root); HCAR.root.children[1].visible = false; HCAR.l1.visible = HCAR.l2.visible = false;
HCAR.root.add(B('#1d1d22', [0, 1.05, .55], [.08, .08, .5], {}, [-.6, 0, 0])); const WHEEL = new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [0, 1.2, .35], [.42, .05, .42], [-.9, 0, 0]); HCAR.root.add(WHEEL);
HCAR.root.add(B('#2a2a30', [0, .9, -.6], [1.6, .12, 1.0])); HCAR.root.add(B('#2a2a30', [0, 1.2, -1.05], [1.6, .55, .14]));
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
// ===================== EP21 scene =====================
setRoll(30, 0);
const HS = [-1.4, 0, 1.35], CARP = [1.5, 0, 2.95], COPS = [3.1, 0, 1.6], SIGNP = [4.4, 0, 1.55], HFLAT = [-1.4, 0, 4.4];
texC('nopark', 256, 320, (x, w, h) => { x.fillStyle = '#f4f1e8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1b1b20'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#1b1b20'; x.font = '900 120px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('P', w / 2, 120);
  x.strokeStyle = '#e3263a'; x.lineWidth = 18; x.beginPath(); x.arc(w / 2, 120, 82, 0, 6.283); x.stroke(); x.beginPath(); x.moveTo(w / 2 - 58, 62); x.lineTo(w / 2 + 58, 178); x.stroke(); x.fillStyle = '#e3263a'; x.font = '900 40px "Inter Display"'; x.fillText('NO', w / 2, 238); x.fillText('PARKING', w / 2, 280); });
texC('ticket', 128, 192, (x, w, h) => { x.fillStyle = '#fff3a8'; x.fillRect(0, 0, w, h); x.fillStyle = '#e3263a'; x.fillRect(0, 0, w, 34); x.fillStyle = '#fff'; x.font = '900 24px "Inter Display"'; x.textAlign = 'center'; x.fillText('TICKET', w / 2, 26); x.fillStyle = '#1b1b20'; for (let k = 0; k < 6; k++) x.fillRect(14, 54 + k * 20, 60 + (k * 37) % 40, 5); x.font = '900 34px "Inter Display"'; x.fillText('$$$', w / 2, 178); });
// no parking sign
const SIGN = new Node(); SIGN.p = SIGNP.slice(); SIGN.add(B('#8a8e96', [0, 1.3, 0], [.08, 2.6, .08], { spec: .6 })); SIGN.add(B('#f4f1e8', [0, 2.35, 0], [.66, .84, .05])); SIGN.add(new Node('quad', { c: [1, 1, 1], tex: 'nopark', spec: 0, rim: 0, out: 0 }, [0, 2.35, -.03], [.64, .8, 1], [0, Math.PI, 0])); SIGN.add(new Node('quad', { c: [1, 1, 1], tex: 'nopark', spec: 0, rim: 0, out: 0 }, [0, 2.35, .03], [.64, .8, 1])); SIGN.r = [0, -.5, 0]; scene.add(SIGN);
// tickets on the windshield (car local: windshield at z≈.96 (front), y≈1.12)
const TK = []; for (let k = 0; k < 2; k++) { const q = new Node('quad', { c: [1, 1, 1], tex: 'ticket', spec: 0, rim: 0, out: 0 }, [-.35 + k * .55, 1.12, 1.02], [.34, .5, 1], [-.35, 0, (k - .5) * .3]); HCAR.root.add(q); TK.push(q); }
const FTK = []; for (let k = 0; k < 2; k++) { const q = new Node('quad', { c: [1, 1, 1], tex: 'ticket', spec: 0, rim: 0, out: 0 }, [0, 0, 0], [.34, .5, 1]); q.visible = false; scene.add(q); FTK.push(q); }
// pad + pen for the cop
const PAD = B('#fff3a8', [0, -.12, .08], [.24, .3, .03], { out: .01 }); cop.armL.end.add(PAD); const PEN = B('#1b1b20', [0, -.1, .12], [.04, .04, .3], { out: 0 }, [.5, 0, 0]); cop.armR.end.add(PEN);
const HTK = new Node('quad', { c: [1, 1, 1], tex: 'ticket', spec: 0, rim: 0, out: 0 }, [0, -.15, .12], [.3, .44, 1]); hero.armR.end.add(HTK);
// extra cops + 2nd police car
const COPX = [man({ id: 'cop2', shape: 'wide', neck: .28, seed: 4, skin: SK.hero, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1 }), man({ id: 'cop', shape: 'wide', neck: .28, seed: 5, skin: SK.cop, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1 }),
  man({ id: 'cop2', shape: 'wide', neck: .28, seed: 6, skin: SK.hero, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1 }), man({ id: 'cop', shape: 'wide', neck: .28, seed: 8, skin: SK.cop, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1 })];
COPX.forEach(m => scene.add(m.root)); const ALLC = [cop, ...COPX];
const PC2 = car({ body: '#f4f4f0', top: '#1d1d22', stripe: '#2b3a55' }); scene.add(PC2.root);
const PCS = [[pcar, [7.5, 0, 5.2]], [PC2, [11.5, 0, 8.6]]];
const COPSPOT = [[6.4, 0, 3.6], [8.6, 0, 6.6], [10.4, 0, 4.4], [12.6, 0, 6.9]];
const COPZ = [3.4, 5.2, 7.0, 8.8, 10.6]; // positions along the roll
const FLATP = [[3.6, 0, 3.6], [5.6, 0, 7.4], [8.6, 0, 3.3], [10.0, 0, 6.4], [13.2, 0, 4.0]];
const HAT0 = hero.hat.p.slice();
// ---------- roll state (RC = roll centre x, r = radius) ----------
const RR = xr => Math.sqrt(.3 + .1 * Math.max(0, 30 - xr));
function roll(rc, r) { setRoad(rc + r); setRoll(rc + r, r); }
const hopY = (cx, rc, r) => { const dx = Math.abs(cx - rc), R = r + 2.2; return dx < R ? 2 * r * (1 - (dx / R) ** 2) + .2 * (1 - dx / R) : 0; };
function carAt(c, p, yaw, rc, r) { c.root.visible = true; const y = r > .05 ? hopY(p[0], rc, r) : 0; c.root.p = [p[0], y, p[2]]; c.root.r = [y > 0 ? Math.sin((p[0] - rc) * .6) * .3 : 0, yaw, 0]; return y; }
// cop stuck in the roll: body radial at angle phi (0 = top, +x clockwise), feet inside
function inRoll(m, rc, r, z, phi, t, k) { m.root.visible = true; const d = [Math.sin(phi), Math.cos(phi)]; m.root.p = [rc + d[0] * (r - .85), r + d[1] * (r - .85), z]; m.root.r = [0, 0, -phi]; pose_(m, { sL: [-.3, 0, 2.2 + Math.sin(t * 17 + k) * .5], sR: [-.3, 0, -2.2 - Math.sin(t * 15 + k) * .5] }); m.wob = .5; setFace(m, Math.sin(t * 20 + k) > 0 ? 'scream' : 'wide'); }
function flat(m, p, yaw = 0) { m.root.visible = true; m.root.p = [p[0], .03, p[2]]; m.root.r = [-Math.PI / 2, yaw, 0]; m.root.s = [1.25, 1.1, .07]; pose_(m, { sL: [0, 0, 1.3], sR: [0, 0, -1.3] }); m.lL.r = [0, 0, -.4]; m.lR.r = [0, 0, .4]; m.wob = 0; }
function popUp(m, p, d, yaw = 0) { m.root.visible = true; const u = clamp(d / .3); m.root.p = [p[0], Math.sin(clamp(d / .45) * Math.PI) * 1.4, p[2]]; m.root.r = [-Math.PI / 2 * (1 - eout(clamp(d / .2))), yaw + u * 6.283, 0]; m.root.s = [lerp(1.25, 1, eback(u)), lerp(1.1, 1, eback(u)), lerp(.07, 1, eback(u))]; pose_(m, { sL: [-2.9, 0, .5], sR: [-2.9, 0, -.5] }); m.wob = .6; }
const copYaw = yawOf(COPS, [2.4, 0, 2.9]);
function copWrite(t, m = cop, fast = 1) { PAD.visible = PEN.visible = true; pose_(m, { sL: [-1.2, 0, .35], eL: [-1.0, 0, 0], sR: [-1.1 + Math.sin(t * 30 * fast) * .12, 0, -.1], eR: [-1.3 + Math.sin(t * 23 * fast) * .2, 0, 0] }); m.head.r = [.35, 0, 0]; setFace(m, 'squint'); }
// ---------- timing ----------
const T_SLAP = WD.ticket0 - .12;
const T_GRAB = P[2] + .15, T_R0 = WD.removed - .1, T_R1 = WD.street2 + .35; // roll from 30 to -10
const XE = -4, RE = RR(XE);
const T_SLAP2 = WD.ticket4 - .1;
const T_KICK6 = P[6] + .25, T_OUT6 = T_KICK6 + .55, T_BACK6 = WD.street6 + .25; // unroll to cop, roll back
const T_PCA = P[7] - .1, T_PCS = WD.came + .05;
const T_KICK8 = P[8] + .05, T_OUT8 = T_KICK8 + .45, T_BACK8 = pend(8) - .1;
const T_HUGE = WD.fucking2 - .1, RH = 4.2;
const T_AWAY = WD.rolled10 - .1, XAW = -22;
const T_TURN = P[11] + .05, T_FLAT = WD.flattened - .05;
const T_POP = WD.popped - .05, T_HPOP = T_POP + .25;
const XO6 = 4.4, XO8 = 13, HX9 = -2.2;
// roll centre / radius per time
function rollAt(t) { const i = ph(t);
  if (i < 2 || (i === 2 && t < T_R0) || i >= 14) return null;
  if (i === 2) { const u = clamp((t - T_R0) / (T_R1 - T_R0)); const xr = lerp(30, XE, eio(u)); const r = RR(xr); return [xr - r, r]; }
  if (i <= 5 || (i === 6 && t < T_KICK6)) return [XE - RE, RE];
  if (i === 6 || (i === 7)) { let xr = XE; if (i === 6) { if (t < T_OUT6) xr = lerp(XE, XO6, eout(clamp((t - T_KICK6) / (T_OUT6 - T_KICK6)))); else xr = lerp(XO6, XE, eio(clamp((t - T_OUT6) / (T_BACK6 - T_OUT6)))); } const r = RR(Math.min(xr, XE)) + .05 * (i === 7 || t > T_OUT6 ? 1 : 0); return [xr - r, r]; }
  if (i === 8) { let xr; if (t < T_KICK8) xr = XE; else if (t < T_OUT8) xr = lerp(XE, XO8, eout(clamp((t - T_KICK8) / (T_OUT8 - T_KICK8)))); else xr = lerp(XO8, XE, eio(clamp((t - T_OUT8) / (T_BACK8 - T_OUT8)))); const r = RE + .1; return [xr - r, r]; }
  if (i === 9) { const r = lerp(RE + .1, RH, eback(clamp((t - T_HUGE) / .5))); return [XE - r, r]; }
  if (i === 10) { const u = clamp((t - T_AWAY) / (pend(10) - T_AWAY)); return [lerp(XE - RH, XAW, u * u), RH]; }
  if (i >= 11 && i <= 13) { const xs = t < T_FLAT ? lerp(XAW, HFLAT[0], (clamp((t - T_TURN) / (T_FLAT - T_TURN))) ** 1.6) : HFLAT[0] + (t - T_FLAT) * 11; const r = i === 13 ? RH * clamp(1 - (t - P[13]) / (pend(13) - P[13] - .2)) : RH; return [xs, r]; }
  return null; }
// which cops are rolled in, and their angle
function copsInRoll(t, rc, r) { const i = ph(t); const n = i === 6 ? (t > T_OUT6 ? 1 : 0) : i === 7 ? 1 : i === 8 ? (t > T_OUT8 ? 5 : 1) : (i >= 9 && i <= 12) ? 5 : 0;
  for (let k = 0; k < n; k++) { const m = ALLC[k]; const phi = Math.PI - (rc - (k === 0 ? XO6 : XO8)) / r + k * 1.3; inRoll(m, rc, r, COPZ[k], phi, t, k); } return n; }
// ---------- loop intro: the cop writes; slap; ticket ----------
function intro(t) { const h = hero; let face = 'neutral'; setRoll(40, 0); setRoad(80);
  carAt(HCAR, CARP, Math.PI / 2, 0, 0); TK[0].visible = t > T_SLAP + .05; TK[1].visible = false;
  cop.root.visible = true; cop.root.p = COPS.slice(); cop.root.r = [0, copYaw, 0];
  if (t < -1.75) { copWrite(t); pose_(cop, { sR: [-2.0, 0, -.3], eR: [-.6, 0, 0] }); cop.head.r = [0, 0, 0]; setFace(cop, 'squint'); }
  else if (t < -1.3) { PAD.visible = PEN.visible = true; pose_(cop, { sR: [-2.9, 0, -.2], eR: [-.1, 0, 0], sL: [-1.2, 0, .35], eL: [-1.0, 0, 0] }); setFace(cop, 'grin'); cop.root.r = [0, copYaw - 1.2, 0]; }
  else if (t < T_SLAP - .15) copWrite(t);
  else { const d = t - (T_SLAP - .15); PAD.visible = true; const sw = clamp(d / .15); pose_(cop, { sR: [lerp(-2.6, -1.2, sw), 0, -.2], eR: [-.2, 0, 0], sL: [-1.0, 0, .35], eL: [-1.0, 0, 0] }); cop.body.r = [.3 * sw, 0, 0]; setFace(cop, d > .2 ? 'grin' : 'squint'); if (d > .2) { cop.root.r = [0, copYaw - .9, 0]; } }
  // hero walks back from the street (he was flat) to the sidewalk
  if (t < -.45) { const u = clamp((t + 2.6) / 2.15); h.root.p = lerp3(HFLAT, HS, u); h.root.r = [0, Math.PI, 0]; walkPose(h, t, 9, .7); face = 'half'; h.wob = .2; h.head.r = [0, 0, Math.sin(t * 5) * .15]; }
  else { h.root.p = HS.slice(); const s = clamp((t + .45) / .3); h.root.r = [0, lerp(Math.PI, .9, s), 0]; face = t > T_SLAP ? 'wide' : 'neutral'; if (t > T_SLAP) { pose_(h, { sL: [-.2, 0, .9], sR: [-.2, 0, -.9] }); h.head.r = [-.1, 0, 0]; h.body.p = [0, Math.max(0, Math.sin(clamp((t - T_SLAP) / .3) * Math.PI)) * .25, 0]; } }
  return face; }
function hideAll() { for (const m of [hero, ...ALLC]) { resetPose(m); m.root.visible = false; m.root.s = [1, 1, 1]; m.body.s = [1, 1, 1]; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice(); puffs.forEach(p => p.visible = false); STRK.forEach(s => s.visible = false);
  PAD.visible = PEN.visible = false; HTK.visible = false; DON.visible = false; RCUFF.visible = false; setRoad(80); setRoll(40, 0); HCAR.root.visible = true; HCAR.root.s = [1, 1, 1]; TK.forEach(q => q.visible = false); FTK.forEach(q => q.visible = false);
  pcar.root.visible = false; PC2.root.visible = false; pcar.root.s = [1, 1, 1]; ROLLG.s = [1, 1, 1]; SIGN.r = [0, -.5, 0]; SIGN.p = SIGNP.slice(); }
function heroLean(t, h) { h.root.p = [-.75, 0, 1.75]; h.root.r = [0, Math.PI - .25, 0]; h.body.r = [-.22, 0, 0]; pose_(h, { sL: [-.6, 0, -.9], eL: [-1.9, 0, 0], sR: [-.6, 0, .9], eR: [-1.9, 0, 0] }); h.lL.r = [0, 0, .25]; h.lR.r = [0, 0, -.35]; }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'squint';
  const R_ = rollAt(t); if (R_) roll(R_[0], R_[1]); const rc = R_ ? R_[0] : 99, rr = R_ ? R_[1] : 0;
  if (i === 0) face = intro(t);
  if (i >= 1 && i <= 13) { carAt(HCAR, CARP, Math.PI / 2, rc, rr); TK[0].visible = i < 12 || (i === 12 && rc < CARP[0] - 2); TK[1].visible = (i === 4 && t > T_SLAP2 + .05) || (i >= 5 && (i < 12 || (i === 12 && rc < CARP[0] - 2))); }
  if (i === 1) { cop.root.visible = true; cop.root.p = COPS.slice(); cop.root.r = [0, -Math.PI / 2 + .25, 0]; PAD.visible = true; const d = t - P[1];
    pose_(cop, { sR: [-1.6, 0, -1.3], eR: [0, 0, 0], sL: [-1.0, 0, .35], eL: [-1.0, 0, 0] }); setFace(cop, 'talksq'); cop.head.r = [0, -.2, 0];
    if (t > WD.fucking1 - .1) { const e = t - WD.fucking1; pose_(cop, { sR: [-2.4 - Math.sin(e * 25) * .25, 0, -1.0], eR: [0, 0, 0] }); setFace(cop, Math.sin(t * 22) > 0 ? 'scream' : 'talksq'); cop.root.p[1] = Math.abs(Math.sin(e * 9)) * .25; cop.wob = .4; SIGN.r = [Math.sin(e * 20) * .08 * Math.exp(-e * 2), -.5, Math.sin(e * 17) * .06 * Math.exp(-e * 2)]; }
    h.root.p = HS.slice(); h.root.r = [0, .9, 0]; face = 'wide'; if (t > WD.street1) { argue(h, t, 1.2, 1); face = Math.sin(t * 20) > 0 ? 'talksq' : 'squint'; h.wob = .4; } }
  // L2: he removes the street
  if (i === 2) { cop.root.visible = true; cop.root.p = COPS.slice(); cop.root.r = [0, -.3, 0]; PAD.visible = true; setFace(cop, t > T_R0 + .3 ? 'wide' : 'squint'); pose_(cop, { sL: [-1.0, 0, .35], eL: [-1.0, 0, 0] });
    if (t < T_R0) { const u = clamp((t - P[2]) / (T_R0 - P[2] - .05)); h.root.p = lerp3(HS, [29.4, 0, 4.0], u); h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 60, .6); face = 'squint'; late.push(() => stream(t, A3(h.root.p, [-.4, 1.4, 0]), [-1, 0, 0], 4, 0, 16, .8, 2, .5)); }
    else { h.root.p = [rc + rr + .6, 0, 4.0]; h.root.r = [0, -Math.PI / 2, 0]; runPose(h, t, 30); pose_(h, { sL: [-1.5, 0, .1], sR: [-1.5, 0, -.1] }); h.body.r = [.55, 0, 0]; face = 'grin'; dust(t, [rc + rr + .8, 0, 4.0], 8, 16); if (rc + rr < XE + .3) { resetPose(h); h.root.p = [XE + .7, 0, 4.0]; h.root.r = [0, -.4, 0]; pose_(h, { sR: [-2.8, 0, -.3] }); face = 'grin'; } } }
  // L3-L5: no street, no rule. tickets.
  if (i >= 3 && i <= 5) { heroLean(t, h); face = 'grin'; cop.root.visible = true; cop.root.p = [3.6, 0, 2.0]; cop.root.r = [0, yawOf([3.6, 0, 2], [2.2, 0, 2.9]), 0]; }
  if (i === 3) { setFace(cop, 'wide'); PAD.visible = true; pose_(cop, { sL: [-1.0, 0, .35], eL: [-1.0, 0, 0] }); cop.head.r = [0, -.4, 0]; h.head.r = [-.15, 0, 0]; if (t > WD.rule) { h.root.p[1] = 0; face = 'half'; } }
  if (i === 4) { if (t < T_SLAP2 - .15) copWrite(t, cop, 2.5); else { const d = t - (T_SLAP2 - .15); const sw = clamp(d / .15); PAD.visible = true; pose_(cop, { sR: [lerp(-2.6, -1.3, sw), 0, -.2], eR: [-.2, 0, 0], sL: [-1.0, 0, .35], eL: [-1.0, 0, 0] }); setFace(cop, 'grin'); } if (t > P[4] + .2) { face = 'wide'; } }
  if (i === 5) { PAD.visible = true; setFace(cop, 'grin'); pose_(cop, { sL: [-.2, 0, .3], sR: [-.2, 0, -.3] }); h.root.p = [-.6, 0, 1.95]; h.root.r = [0, .9, 0]; h.body.r = [0, 0, 0]; HTK.visible = true; pose_(h, { sR: [-1.3, 0, .35], eR: [-1.0, 0, 0], sL: [-.2, 0, .4] }); h.lL.r = h.lR.r = [0, 0, 0]; face = t > WD.dirt ? 'squint' : 'neutral'; h.head.r = [.3, -.2, 0]; }
  // L6: he yanks the street out under the cop and rolls him up
  if (i === 6) { const n = copsInRoll(t, rc, rr); h.root.p = [XE + .7, 0, 1.0]; h.root.r = [0, -1.2, 0];
    if (t < T_KICK6) { pose_(h, { sL: [-1.5, 0, .2], sR: [-1.5, 0, -.2] }); face = 'squint'; } else { const k = clamp((t - T_KICK6) / .2); h.lR.r = [-1.4 * Math.sin(k * Math.PI), 0, 0]; face = 'grin'; h.root.r = [0, -1.6, 0]; if (t > T_OUT6) { face = 'grin'; pose_(h, { sR: [-2.8, 0, -.3] }); h.root.r = [0, -.6, 0]; } }
    if (n === 0) { cop.root.visible = true; cop.root.p = [XO6 - .4, 0, COPZ[0]]; cop.root.r = [0, -1.0, 0]; setFace(cop, 'squint'); PAD.visible = true; pose_(cop, { sL: [-1.0, 0, .35], eL: [-1.0, 0, 0] }); if (rc + rr > XO6 - 1.2) { setFace(cop, 'wide'); cop.root.r = [-.4, -1.0, 0]; pose_(cop, { sL: [-2.8, 0, .8], sR: [-2.8, 0, -.8] }); } } }
  if (i === 7) { copsInRoll(t, rc, rr); h.root.p = [XE + .7, 0, 1.0]; h.root.r = [0, -.4, 0]; face = 'grin'; pose_(h, { sR: [-2.8, 0, -.3] });
    for (let k = 0; k < 2; k++) { const [c, p] = PCS[k]; const u = eout(clamp((t - T_PCA - k * .15) / (T_PCS - T_PCA))); carAt(c, [lerp(p[0] + 26, p[0], u), 0, p[2]], -Math.PI / 2 + Math.sin(u * Math.PI) * .4, 99, 0); c.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; c.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; }
    for (let k = 0; k < 4; k++) { const m = COPX[k], tj = T_PCS + .05 + k * .1, d = t - tj; if (d < 0) continue; m.root.visible = true; const st = A3(PCS[k >> 1][1], [(k % 2 ? .6 : -.6), 1.2, k % 2 ? -.9 : .9]); const en = COPSPOT[k]; const u = clamp(d / .4);
      m.root.p = lerp3(st, en, eout(u)); m.root.p[1] = Math.max(0, lerp(1.2, 0, u) + Math.sin(u * Math.PI) * 1.4); m.root.r = [u < 1 ? (k === 1 ? 1.4 * u : .8 * Math.sin(u * Math.PI)) : (k === 1 ? 1.45 : 0), -1.2 + u * 6.283 * (k % 2 ? 1 : 0), 0]; pose_(m, { sL: [-2.9, 0, .5], sR: [-2.9, 0, -.5] }); setFace(m, k === 1 && u >= 1 ? 'dizzy' : 'scream'); m.wob = .5; if (u >= 1 && k !== 1) { pose_(m, { sR: [-1.55, 0, -.2], sL: [-.3, 0, .4] }); setFace(m, 'squint'); m.root.r = [0, -1.9, 0]; } } }
  if (i >= 8 && i <= 13) { for (let k = 0; k < 2; k++) { const [c, p] = PCS[k]; carAt(c, p, -Math.PI / 2, rc, rr); c.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; c.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; } }
  if (i === 8) { const n = copsInRoll(t, rc, rr); h.root.p = [XE + .7, 0, 1.0]; h.root.r = [0, -1.6, 0]; const k8 = clamp((t - T_KICK8) / .2); h.lR.r = [-1.4 * Math.sin(k8 * Math.PI), 0, 0]; face = 'grin';
    if (n < 5) for (let k = 0; k < 4; k++) { const m = COPX[k]; m.root.visible = true; m.root.p = COPSPOT[k].slice(); m.root.r = [0, -1.9, 0]; setFace(m, rc + rr > COPSPOT[k][0] - 1 ? 'wide' : 'squint'); pose_(m, { sR: [-1.55, 0, -.2] }); if (rc + rr > COPSPOT[k][0] - 1.5) { pose_(m, { sL: [-2.8, 0, .8], sR: [-2.8, 0, -.8] }); m.root.r = [-.4, -1.9, 0]; } } }
  if (i === 9) { copsInRoll(t, rc, rr); h.root.p = [HX9, 0, 2.2]; h.root.r = [0, -2.4, 0]; face = t > T_HUGE ? 'wideup' : 'grin'; h.head.r = [-.3, 0, 0]; if (t > T_HUGE) { pose_(h, { sL: [-.3, 0, .8], sR: [-.3, 0, -.8] }); h.body.r = [-.2, 0, 0]; h.root.p[1] = Math.max(0, Math.sin(clamp((t - T_HUGE) / .3) * Math.PI)) * .5; } }
  if (i === 10) { copsInRoll(t, rc, rr); h.root.p = [HX9, 0, 2.2]; h.root.r = [0, -2.0, 0]; face = 'grin'; pose_(h, { sR: [-2.75 + Math.sin(t * 13) * .25, 0, -.35 + Math.sin(t * 13) * .45], eR: [-.3, 0, 0] }); }
  if (i === 11 || (i === 12 && t < T_FLAT)) { copsInRoll(t, rc, rr); const d = t - T_TURN; if (d < .35) { h.root.p = [HX9, 0, 2.2]; h.root.r = [0, -2.0 + clamp(d / .2) * 1.0, 0]; face = 'wide'; pose_(h, { sL: [-2.9, 0, .6], sR: [-2.9, 0, -.6] }); h.root.p[1] = Math.sin(clamp(d / .3) * Math.PI) * .6; }
    else { const u = clamp((t - T_TURN - .35) / (T_FLAT - T_TURN - .35)); h.root.p = lerp3([HX9, 0, 2.2], [HFLAT[0] + 1.2, 0, HFLAT[2]], u); h.root.r = [0, Math.PI / 2 - .3, 0]; wheelRun(h, t, 52, .55); pose_(h, { sL: [-2.9, 0, .6], sR: [-2.9, 0, -.6] }); face = 'scream'; dust(t, h.root.p, 8, 16); h.head.r = [0, -.8, 0]; } }
  if (i === 12 && t >= T_FLAT) { copsInRoll(t, rc, rr); hero.hat.visible = false; flat(h, [HFLAT[0] + 1.2, 0, HFLAT[2]], -Math.PI / 2); face = 'dizzy'; burst(T_FLAT, t, [HFLAT[0] + 1.2, .2, HFLAT[2]], [.85, .8, .72], 0, 10, 1.2, .6); }
  if (i === 12 || i === 13) { for (let k = 0; k < 2; k++) { const d = t - (T_FLAT + .25 + k * .05); if (d > 0 && d < 1.2) { const q = FTK[k]; q.visible = true; q.p = [CARP[0] + .9 + d * 2 * (k ? 1 : -1), 1.3 + 3 * d - 2.5 * d * d, CARP[2] - d * 1.2]; q.r = [d * 5, d * 7, d * 3]; } } }
  if (i === 13) { hero.hat.visible = false; flat(h, [HFLAT[0] + 1.2, 0, HFLAT[2]], -Math.PI / 2); face = 'dizzy'; const n = rr > 1.2 ? copsInRoll(t, rc, rr) : 0; if (n === 0) ALLC.forEach((m, k) => flat(m, FLATP[k], k * .7)); }
  // L14: every cop pops out — four sprint to their cars and zoom off
  if (i === 14) { setRoad(80); setRoll(40, 0); carAt(HCAR, CARP, Math.PI / 2, 99, 0); const dH = t - T_HPOP;
    if (dH < 0) { hero.hat.visible = false; flat(h, [HFLAT[0] + 1.2, 0, HFLAT[2]], -Math.PI / 2); face = 'dizzy'; } else { popUp(h, [HFLAT[0] + 1.2, 0, HFLAT[2]], dH, -Math.PI / 2); h.root.p[0] = lerp(HFLAT[0] + 1.2, HFLAT[0], clamp(dH / .5)); face = dH < .4 ? 'wide' : 'half'; if (dH > .5) { resetPose(h); h.root.p = HFLAT.slice(); h.root.r = [0, Math.PI, 0]; face = 'half'; } }
    ALLC.forEach((m, k) => { const d = t - (T_POP + k * .07); if (d < 0) { flat(m, FLATP[k], k * .7); setFace(m, 'dizzy'); return; } if (d < .5) { popUp(m, FLATP[k], d, k * .7); setFace(m, 'wide'); return; }
      if (k === 0) { m.root.visible = true; const u = clamp((d - .5) / .5); m.root.p = lerp3(FLATP[0], COPS, eout(u)); m.root.p[1] = Math.sin(u * Math.PI) * .8; m.root.r = [0, copYaw, 0]; setFace(m, 'squint'); pose_(m, { sL: [-1.0, 0, .35], eL: [-1.0, 0, 0] }); PAD.visible = true; return; }
      const e = d - .5; m.root.visible = true; const tgt = A3(PCS[(k - 1) >> 1][1], [0, 0, -1.3]); const u = clamp(e / .35); m.root.p = lerp3(FLATP[k], tgt, u); m.root.r = [0, yawOf(FLATP[k], tgt), 0]; wheelRun(m, t, 60, .6); setFace(m, 'scream'); if (u >= 1) m.root.visible = false; });
    for (let k = 0; k < 2; k++) { const [c, p] = PCS[k]; const e = t - (T_POP + 1.0 + k * .1); carAt(c, [p[0] + (e > 0 ? e * e * 30 + e * 6 : 0), 0, p[2]], -Math.PI / 2, 99, 0); if (e > 0) { c.root.r = [0, Math.PI / 2, Math.sin(clamp(e / .3) * Math.PI) * .12]; c.root.p[0] = p[0] + e * e * 30 + e * 6; } c.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; c.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; if (c.root.p[0] > 60) c.root.visible = false; } }
  if (i === 15) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, ...ALLC]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
