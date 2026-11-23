// =====================================================================
//  EP15 "THE SPEED BUMP" — the bump hit his car. Citizen's arrest. He arrests the whole road.
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
// ---------- the speed bump (alive) ----------
const BP = [4.0, 0, 4.5], BOUT = [6.4, 0, 4.5];
const HOLE = B('#1d1a20', [BP[0], -.012, BP[2]], [1.6, .03, 4.1], { out: 0 }); scene.add(HOLE);
const BUMP = new Node(); BUMP.add(new Node('cyl', { c: hex('#f0c44a'), out: .01, spec: .3, rim: .25 }, [0, 0, 0], [1.5, 2.0, 1.1], [1.5708, 0, 0]));
for (const z of [-1.45, -.5, .45, 1.4]) BUMP.add(new Node('cyl', { c: hex('#1d1d22'), out: 0, spec: .2 }, [0, 0, z], [1.53, .18, 1.13], [1.5708, 0, 0]));
const EYES = new Node(null, null, [0, .27, 2.0]); const PUP = []; for (const x of [-.3, .3]) { EYES.add(new Node('cyl', { c: [1, 1, 1], out: .01, spec: .3 }, [x, 0, 0], [.36, .06, .36], [1.5708, 0, 0])); const p = new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [x, 0, .04], [.15, .04, .15], [1.5708, 0, 0]); EYES.add(p); PUP.push({ n: p, x }); } BUMP.add(EYES);
const LIDS = []; for (const x of [-.3, .3]) { const l = B('#f0c44a', [x, .3, 2.04], [.4, .2, .03], { out: 0 }); BUMP.add(l); LIDS.push(l); }
const MOUTH = B('#1b1b20', [0, .1, 2.02], [.34, .04, .02], { out: 0 }); BUMP.add(MOUTH);
const BCUFF = new Node(); for (const z of [-.75, .75]) BCUFF.add(new Node('cyl', { c: hex('#c8ccd6'), spec: 1, out: .01, rim: .4 }, [0, 0, z], [1.62, .1, 1.22], [1.5708, 0, 0])); for (let k = 0; k < 4; k++) BCUFF.add(B('#c8ccd6', [0, .6, -.45 + k * .3], [.1, .08, .2], { spec: 1 }, [k % 2 ? 1.5708 : 0, 0, 0])); BUMP.add(BCUFF);
scene.add(BUMP);
function bumpFace(t, look = 0, open = 1, lookY = 0) { PUP.forEach(p => p.n.p = [p.x + look * .09, lookY * .08, .04]); LIDS.forEach(l => { l.visible = open < .99; l.s = [.4, .02 + .3 * (1 - open), .03]; l.p[1] = .3 + .15 * open; }); EYES.visible = true; }
// ---------- cars ----------
const HCAR = car({ body: '#3f8f7a', stripe: '#f4f1e8' }); scene.add(HCAR.root); HCAR.root.children[1].visible = false; HCAR.l1.visible = HCAR.l2.visible = false;
HCAR.root.add(B('#1d1d22', [0, 1.05, .55], [.08, .08, .5], {}, [-.6, 0, 0])); const WHEEL = new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [0, 1.2, .35], [.42, .05, .42], [-.9, 0, 0]); HCAR.root.add(WHEEL);
HCAR.root.add(B('#2a2a30', [0, .9, -.6], [1.6, .12, 1.0])); HCAR.root.add(B('#2a2a30', [0, 1.2, -1.05], [1.6, .55, .14]));
const CCAR = car({ body: '#d8483c', top: '#f4f1e8' }); scene.add(CCAR.root); CCAR.l1.visible = CCAR.l2.visible = false;
const CARP = [-2.0, 0, 4.5], PCP = [-4.5, 0, 9.2];
const SHOV = new Node(null, null, [0, -.05, .05]); SHOV.add(B('#7a5238', [0, -.55, 0], [.06, 1.3, .06])); SHOV.add(B('#9aa0a8', [0, -1.28, .04], [.32, .38, .04], { spec: .8 })); hero.armR.end.add(SHOV);
const PAD = B('#f4f1e8', [0, -.12, .08], [.22, .28, .03], { out: .01 }); cop.armL.end.add(PAD);
const hatP0 = hero.hat.p.slice();
// ---------- timing ----------
const T_GO = .25, T_ON = WD.bump0 + .05, T_EYE = P[1] + .2, T_BUCK = WD.hit, T_LANDC = WD.fucking1 - .02, T_SEAT = T_LANDC + .3;
const T_DIVE = WD.made - .1, T_RIDE = T_DIVE + .4, T_POP = at(4, .72), T_CUFF = WD.handcuffed + .05;
const T_PC = P[6], T_PCSTOP = P[6] + .55, T_JUMP = T_PCSTOP + .1, T_COPL = T_JUMP + .45;
const T_UNCUFF = WD.go - .05, T_ESC = WD.fucking2 - .08, T_CRUN = T_ESC + .3;
const T_BACKIN = at(10, .5), T_CPASS = at(10, .78);
const T_R0 = P[11] + .1, T_R1 = pend(11) - .35, T_RCUFF = WD.road11 + .3, T_BONK = at(12, .55), T_HOP = P[13] + .02, T_KICK = WD.rolled - .05, T_U1 = T_KICK + .9;
const RMAX = 2.3, XR0 = 42, XR1 = -3;
const seatOf = c => wp(c.root, [0, .32, -.3]);
function heroSeat(h, c, t) { h.root.p = seatOf(c); h.root.r = [c.root.r[0], c.root.r[1], c.root.r[2]]; h.body.p = [0, -.43, 0]; h.lL.r = [-1.5, 0, -.12]; h.lR.r = [-1.5, 0, .12]; h.lL.k = h.lR.k = 1.4; pose_(h, { sL: [-1.15, 0, .25], eL: [-.4, 0, 0], sR: [-1.15, 0, -.25], eR: [-.4, 0, 0] }); h.wob = .08; }
function carAt(c, x, y = 0, pitch = 0) { c.root.visible = true; c.root.p = [x, y, CARP[2]]; c.root.r = [pitch, Math.PI / 2, 0]; }
// ---------- loop intro: he gets in his car and drives over the speed bump ----------
function intro(t) { const h = hero; let face = 'grin'; BUMP.p = BP.slice(); bumpFace(t, 0, 0);
  const T0 = P[14] - T_END;
  if (t < -1.25) { carAt(HCAR, CARP[0]); const u = clamp((t - T0) / (-1.25 - T0)); h.root.p = lerp3([7.0, 0, 6.6], [-1.6, 0, 6.6], u); h.root.r = [0, -Math.PI / 2, 0]; runPose(h, t, 32); h.wob = .45; face = 'grin'; return face; }
  if (t < -.8) { carAt(HCAR, CARP[0]); const u = clamp((t + 1.25) / .45); const s = seatOf(HCAR); h.root.p = lerp3([-1.6, 0, 6.6], s, u); h.root.p[1] += Math.sin(u * Math.PI) * 1.6; h.root.r = [0, lerp(-Math.PI / 2, Math.PI / 2 + 6.283, u), 0]; pose_(h, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); h.lL.r = [-1.2, 0, 0]; h.lR.r = [-.4, 0, 0]; h.wob = .4; face = 'grin'; return face; }
  // driving
  let x = CARP[0], y = 0, pit = 0; if (t > T_GO) { const u = clamp((t - T_GO) / (T_ON - T_GO)); x = lerp(CARP[0], BP[0], u * u * (1.6 - .6 * u)); }
  if (x > BP[0] - 2.4) { const a = clamp((x - (BP[0] - 2.4)) / 2.4); y = .5 * a; pit = -Math.sin(a * Math.PI) * .25; }
  if (t > T_ON) { const d = t - T_ON; y = .5 + Math.abs(Math.sin(d * 9)) * .15 * Math.exp(-d * 3); pit = Math.sin(d * 14) * .08 * Math.exp(-d * 2); }
  carAt(HCAR, x, y, pit); if (t < T_GO) HCAR.root.p[1] = Math.abs(Math.sin(t * 40)) * .015; heroSeat(h, HCAR, t); face = t > T_ON ? (t > T_ON + .25 ? 'squint' : 'wide') : 'grin';
  if (t > T_ON) { const d = t - T_ON; h.head.r = [Math.sin(clamp(d / .3) * Math.PI) * -.4, 0, 0]; h.hat.p = [hatP0[0], hatP0[1] + Math.sin(clamp(d / .4) * Math.PI) * .6, hatP0[2]]; }
  WHEEL.r = [-.9, 0, 0]; return face; }
function hideAll() { for (const m of [hero, cop]) { resetPose(m); m.root.visible = false; m.root.s = [1, 1, 1]; m.body.s = [1, 1, 1]; m.body.r = [0, 0, 0]; } hero.root.visible = true; puffs.forEach(p => p.visible = false); hero.hat.p = hatP0.slice(); hero.hat.visible = true;
  SHOV.visible = PAD.visible = false; BUMP.visible = true; BUMP.p = BP.slice(); BUMP.r = [0, 0, 0]; BUMP.s = [1, 1, 1]; BCUFF.visible = false; RCUFF.visible = false; HOLE.visible = false; setRoad(80); setRoll(XR0, 0);
  HCAR.root.visible = true; HCAR.root.p = CARP.slice(); HCAR.root.r = [0, Math.PI / 2, 0]; HCAR.root.s = [1, 1, 1]; pcar.root.visible = false; pcar.root.r = [0, Math.PI / 2, 0]; CCAR.root.visible = false; CCAR.root.s = [1, 1, 1]; }
function bumpLive(t, pos, look = 0) { BUMP.p = pos.slice(); bumpFace(t, look, 1); BUMP.s = [1, 1 + Math.sin(t * 3) * .03, 1]; }
const HST = [2.0, 0, 7.2];
function copStand(t, pos, yaw) { cop.root.visible = true; cop.root.p = pos.slice(); cop.root.r = [0, yaw, 0]; }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'squint';
  if (i === 0) face = intro(t);
  if (i >= 1 && i <= 10) { pcar.root.visible = i >= 6; pcar.root.p = PCP.slice(); if (i >= 6) { pcar.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; pcar.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; } }
  if (i >= 4 && i <= 10) HOLE.visible = true;
  if (i === 1) { const d = t - T_BUCK; if (d < 0) { carAt(HCAR, BP[0], .5 + Math.sin(t * 30) * .01); heroSeat(h, HCAR, t); face = t < T_EYE + .3 ? 'squint' : 'wide'; h.head.r = [.3, 0, 0]; bumpFace(t, Math.sin(t * 4), clamp((t - T_EYE) / .15)); }
    else { bumpFace(t, 0, 1); const u = clamp(d / (T_LANDC - T_BUCK)); BUMP.s = [1, 1 + Math.sin(clamp(d / .2) * Math.PI) * .9, 1]; BUMP.p = [BP[0], Math.sin(clamp(d / .25) * Math.PI) * .5, BP[2]];
      if (u < 1) { carAt(HCAR, lerp(BP[0], CARP[0], u), .5 + Math.sin(u * Math.PI) * 5.5, -u * 6.283); h.root.p = [lerp(BP[0], CARP[0] - .3, u), 1.0 + Math.sin(u * Math.PI) * 7.5, CARP[2]]; h.root.r = [u * 9, Math.PI / 2, u * 4]; pose_(h, { sL: [-2.9, 0, .9], sR: [-2.9, 0, -.9] }); h.lL.r = [-1.0, 0, -.5]; h.lR.r = [.4, 0, .5]; face = 'scream'; h.wob = .7; hero.hat.p = [hatP0[0], hatP0[1] + 1.0, hatP0[2]]; }
      else { const e = t - T_LANDC; carAt(HCAR, CARP[0], Math.abs(Math.sin(e * 12)) * .4 * Math.exp(-e * 4), Math.sin(e * 15) * .1 * Math.exp(-e * 3)); burst(T_LANDC, t, A3(CARP, [0, .3, 0]), [.8, .78, .75], 0, 12, 1.4, 1.5);
        if (t < T_SEAT) { const a = clamp(e / .3); h.root.p = lerp3([CARP[0] - .3, 4.0, CARP[2]], seatOf(HCAR), a); h.root.r = [0, Math.PI / 2, 0]; pose_(h, { sL: [-2.9, 0, .9], sR: [-2.9, 0, -.9] }); face = 'scream'; }
        else { heroSeat(h, HCAR, t); argue(h, t, 1.2, 1); h.body.p = [0, -.43, 0]; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .5; } } } }
  if (i >= 2 && i <= 14) { /* parked car */ if (i < 11 || (i === 11 && false)) carAt(HCAR, CARP[0]); }
  if (i === 2) { bumpLive(t, BP, Math.sin(t * 2.5) * .8); MOUTH.s = [.34, .04, .02]; h.root.p = HST.slice(); h.root.r = [0, .25, 0]; pose_(h, { sR: [-1.55, 0, -.9], eR: [0, 0, 0], sL: [-.2, 0, .4], eL: [-1.2, 0, 0] }); h.head.r = [.1, .35, 0]; face = 'squint'; h.wob = .1; if (t > WD.assault) { h.root.p[1] = Math.abs(Math.sin((t - WD.assault) * 8)) * .06; } }
  if (i === 3) { const d = t - T_DIVE; bumpFace(t, 0, 1);
    if (d < 0) { h.root.p = HST.slice(); h.root.r = [0, .25, 0]; face = 'squint'; pose_(h, { sL: [-.3, 0, .4], sR: [-.3, 0, -.4] }); h.lL.r = [-.3, 0, 0]; h.lR.r = [.3, 0, 0]; h.body.p = [0, -.15, 0]; }
    else if (t < T_RIDE) { const u = clamp(d / (T_RIDE - T_DIVE)); h.root.p = lerp3(HST, A3(BP, [0, .5, .6]), u); h.root.p[1] += Math.sin(u * Math.PI) * 2.2; h.root.r = [u * 1.2, yawOf(HST, BP), 0]; pose_(h, { sL: [-2.9, 0, .5], sR: [-2.9, 0, -.5] }); face = 'scream'; h.wob = .6; }
    else { const e = t - T_RIDE; const buck = Math.sin(e * 11); BUMP.p = [BP[0], Math.max(0, buck) * .35, BP[2]]; BUMP.r = [buck * .12, Math.sin(e * 5) * .15, 0]; BUMP.s = [1, 1 + Math.max(0, buck) * .3, 1]; bumpFace(t, Math.sin(t * 9), 1);
      late.push(() => { h.root.p = wp(BUMP, [0, .55, .4]); }); h.root.p = A3(BP, [0, .6, .4]); h.root.r = [buck * .15, 0, Math.sin(e * 7) * .25]; h.body.p = [0, -.43, 0]; h.lL.r = [-1.2, 0, -.9]; h.lR.r = [-1.2, 0, .9]; h.lL.k = h.lR.k = 1.6;
      pose_(h, { sR: [-3.0 + Math.sin(e * 14) * .3, 0, -.4], eR: [-.4, 0, 0], sL: [-1.0, 0, .5], eL: [-.6, 0, 0] }); hero.hat.visible = false; h.wob = .5; face = Math.sin(e * 6) > 0 ? 'grin' : 'scream'; } }
  if (i === 3 && t > T_RIDE) { HATW.visible = true; late.push(() => { HATW.p = wp(hero.armR.end, [0, -.15, 0]); HATW.r = [0, t * 14, .3]; }); hero.hat.visible = false; }
  if (i === 4) { const flip = t > T_POP; bumpFace(t, Math.sin(t * 6) * .7, 1); h.root.p = [2.3, 0, 6.6]; h.root.r = [0, .55, 0]; SHOV.visible = true; const dg = Math.sin(t * 14); pose_(h, { sR: [-1.0 + dg * .6, 0, -.2], eR: [-.6, 0, 0], sL: [-.9 + dg * .6, 0, .3], eL: [-.8, 0, 0] }); h.body.r = [.35 + dg * .15, 0, 0]; h.body.p = [0, -.1, 0]; h.lL.r = [.3, 0, 0]; h.lR.r = [-.3, 0, 0]; h.wob = .35; face = 'squint';
    if (!flip) { burst(t - ((t * 7) % 1) / 7, t, A3(BP, [-.8, .2, 1.6]), [.48, .35, .22], 0, 10, .6, 2.4); BUMP.p = [BP[0], Math.abs(Math.sin(t * 20)) * .05, BP[2]]; HOLE.visible = false; }
    else { const e = t - T_POP; const a = clamp(e / .4); BUMP.p = lerp3(BP, BOUT, eout(a)); BUMP.p[1] = Math.sin(a * Math.PI) * 1.8; BUMP.r = [0, 0, -a * 6.283]; face = 'grin'; burst(T_POP, t, A3(BP, [0, .2, 0]), [.48, .35, .22], 10, 16, 1.0, 2.0); } }
  if (i >= 5 && i <= 8) BUMP.p = BOUT.slice();
  if (i === 5) { bumpLive(t, BOUT, -.6); const d = t - T_CUFF; h.root.p = [5.2, 0, 6.9]; h.root.r = [0, .45, 0]; face = 'grin';
    if (d < 0) { pose_(h, { sR: [-1.4, 0, -.2], sL: [-1.4, 0, .2] }); } else { BCUFF.visible = true; BCUFF.s = [1, 1, 1].map(v => v * eback(clamp(d / .2))); pose_(h, { sL: [-.15, 0, .6], eL: [-1.6, 0, 0], sR: [-.15, 0, -.6], eR: [-1.6, 0, 0] }); bumpFace(t, 0, 1); BUMP.s = [1, .9 + Math.abs(Math.sin(t * 30)) * .05, 1]; } }
  if (i === 6) { bumpLive(t, BOUT, -.8); BCUFF.visible = true; h.root.p = [5.2, 0, 6.9]; h.root.r = [0, -.2, 0]; pose_(h, { sL: [-.15, 0, .6], eL: [-1.6, 0, 0], sR: [-.15, 0, -.6], eR: [-1.6, 0, 0] }); face = 'grin';
    const u = eout(clamp((t - T_PC) / (T_PCSTOP - T_PC))); pcar.root.p = [lerp(-28, PCP[0], u), 0, PCP[2]]; pcar.root.r = [0, Math.PI / 2 - Math.sin(u * Math.PI) * .35, 0];
    const d = t - T_JUMP; if (d > 0) { cop.root.visible = true; if (t < T_COPL) { const a = clamp(d / (T_COPL - T_JUMP)); cop.root.p = [lerp(PCP[0], 7.6, a), 1.1 + Math.sin(a * Math.PI) * 1.6, lerp(PCP[2] - .6, 6.6, a)]; cop.root.r = [1.3, Math.PI / 2 + a * 6.283, 0]; pose_(cop, { sL: [-2.9, 0, .4], sR: [-2.9, 0, -.4] }); cop.lL.r = [.2, 0, -.2]; cop.lR.r = [.2, 0, .2]; setFace(cop, 'wide'); cop.wob = .5; }
      else { const e = t - T_COPL; copStand(t, [7.6, 0, 6.6], -2.2); if (e < .25) { cop.body.p = [0, -.5 + e * 2, 0]; cop.lL.r = [-1.5, 0, -.3]; cop.lR.r = [-1.5, 0, .3]; cop.lL.k = cop.lR.k = 2; } pose_(cop, { sR: [-2.5, 0, -.2], eR: [-1.3, 0, 0] }); setFace(cop, 'squint'); } } }
  if (i === 7 || i === 8) { BCUFF.visible = i === 7 || t < T_UNCUFF; copStand(t, [7.6, 0, 6.6], -2.2); PAD.visible = i === 7; h.root.p = [5.0, 0, 7.2]; h.root.r = [0, .1, 0]; pose_(h, { sL: [-.15, 0, .6], eL: [-1.6, 0, 0], sR: [-.15, 0, -.6], eR: [-1.6, 0, 0] }); face = 'squint'; }
  if (i === 7) { const d = t - P[7]; bumpLive(t, BOUT, Math.sin(d * 2) > 0 ? .9 : -.9); BUMP.s = [1, 1, 1]; pose_(cop, { sL: [-1.2, 0, .3], eL: [-1.0, 0, 0], sR: [-1.0 + Math.sin(t * 9) * .4, 0, -.2], eR: [-1.2, 0, 0] }); setFace(cop, Math.sin(t * 20) > 0 ? 'talk' : 'squint'); cop.wob = .2; cop.body.r = [.25, 0, 0];
    if (t > WD.nothing) { bumpFace(t, Math.sin(t * 1.5) * .9, Math.sin(t * 5) > .9 ? .1 : 1, -.6); setFace(cop, 'squint'); pose_(cop, { sR: [-.3, 0, -.2], eR: [-1.8, 0, 0] }); } }
  if (i === 8) { bumpLive(t, BOUT, 0); const d = t - T_UNCUFF; if (d < 0) { pose_(cop, { sL: [-.2, 0, 1.6], eL: [-1.0, 0, 0], sR: [-.2, 0, -1.6], eR: [-1.0, 0, 0] }); setFace(cop, 'worry'); cop.body.p = [0, Math.abs(Math.sin(t * 6)) * .05, 0]; }
    else { pose_(cop, { sR: [-1.8, 0, -.2], eR: [-.4, 0, 0], sL: [-.2, 0, .2] }); setFace(cop, 'grin'); if (d < .7) { RCUFFW.visible = true; RCUFFW.p = A3(BOUT, [d * 4, .7 + d * 6 - d * d * 9, d * 2]); RCUFFW.r = [d * 12, d * 5, 0]; } bumpFace(t, 0, 1); face = 'wide'; if (d > .5) { argue(h, t, 1.4, 3); face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .5; } } }
  if (i === 9) { h.root.p = [5.0, 0, 7.2]; h.root.r = [0, .4, 0]; argue(h, t, 1.7, 3); h.root.p[1] = Math.abs(Math.sin(t * 12)) * .45; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .6;
    const d = t - T_ESC; if (d < 0) { bumpLive(t, BOUT, .9); bumpFace(t, 1, 1); copStand(t, [7.6, 0, 6.6], -2.2); setFace(cop, 'grin'); pose_(cop, { sR: [-1.8, 0, -.2], eR: [-.4, 0, 0] }); }
    else { const x = BOUT[0] + d * d * 14 + d * 6; const w = Math.sin(t * 30); BUMP.p = [x, Math.max(0, w) * .3, BUMP.p[2]]; BUMP.s = [1 + w * .35, 1 - w * .2, 1]; bumpFace(t, 1, 1); burst(T_ESC, t, A3(BOUT, [0, .2, 0]), [.8, .78, .75], 0, 8, 1.0, 1.0);
      const c = t - T_CRUN; copStand(t, [7.6, 0, 6.6], -2.2); setFace(cop, 'wide'); if (c > 0) { cop.root.p = [7.6 + c * c * 18 + c * 9, 0, lerp(6.6, 4.6, clamp(c * 3))]; cop.root.r = [0, Math.PI / 2, 0]; runPose(cop, t, 38); pose_(cop, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); setFace(cop, 'scream'); cop.wob = .6; burst(T_CRUN, t, [7.6, .2, 6.6], [.8, .78, .75], 8, 16, 1.0, 1.0); } } }
  if (i === 10) { h.root.p = [7.0, 0, 7.4]; const a = clamp((t - P[10]) / (T_BACKIN - P[10])); const bx = lerp(-34, BP[0], eout(a)); h.root.r = [0, clamp(yawOf(h.root.p, [bx, 0, 4.5]) , -1.6, .2), 0]; face = 'wide'; pose_(h, { sL: [-.3, 0, .4], sR: [-.3, 0, -.4] });
    if (a < 1) { const w = Math.sin(t * 30); BUMP.p = [bx, Math.max(0, w) * .3, BP[2]]; BUMP.s = [1 + w * .35, 1 - w * .2, 1]; bumpFace(t, 1, 1); }
    else { const e = t - T_BACKIN; BUMP.p = BP.slice(); BUMP.s = [1, 1 + Math.sin(clamp(e / .2) * Math.PI) * -.3, 1]; bumpFace(t, 0, clamp(1 - (e - .35) / .2)); h.head.r = [.3, 0, 0]; face = 'squint'; }
    const c = t - (T_CPASS - .7); if (c > 0) { cop.root.visible = true; const cx = -30 + c * 34; cop.root.p = [cx, Math.abs(cx - BP[0]) < .9 ? .5 : 0, 4.2]; cop.root.r = [0, Math.PI / 2, 0]; runPose(cop, t, 38); pose_(cop, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); setFace(cop, 'scream'); cop.wob = .6; } }
  // ---- the road gets rolled up ----
  if (i === 11) { const u = clamp((t - T_R0) / (T_R1 - T_R0)); const xr = lerp(XR0, XR1, u), r = lerp(.4, RMAX, Math.sqrt(u)); setRoad(xr); setRoll(xr, t < T_R0 ? 0 : r); RCUFF.visible = t > T_RCUFF; if (t > T_RCUFF) RCUFF.s = [1, 1, 1].map(v => v * eback(clamp((t - T_RCUFF) / .2)));
    BUMP.visible = xr > BP[0] + .8; bumpFace(t, 0, 0); HCAR.root.visible = xr > CARP[0] + 2.2; carAt(HCAR, CARP[0]); HCAR.root.visible = xr > CARP[0] + 2.2; pcar.root.visible = xr > PCP[0] + 2.2; pcar.root.p = PCP.slice(); pcar.root.r = [0, Math.PI / 2, 0];
    h.root.p = [xr + .55, 0, 5.2]; h.root.r = [0, -Math.PI / 2, 0]; if (u < 1 && t > T_R0) { runPose(h, t, 22); pose_(h, { sL: [-1.4, 0, .1], sR: [-1.4, 0, -.1] }); h.body.r = [.5, 0, 0]; face = 'squint'; } else { h.root.p = [xr + .7, 0, 5.2]; h.root.r = [0, -.4, 0]; face = 'grin'; pose_(h, { sR: [-2.9, 0, -.3], sL: [-.2, 0, .3] }); }
    if (t > WD.fucking3 - .05 && u < 1) { face = Math.sin(t * 20) > 0 ? 'scream' : 'squint'; h.wob = .5; }
    copStand(t, [8.5, 0, .4], -.3); setFace(cop, 'wide'); pose_(cop, { sL: [-.2, 0, .4], sR: [-.2, 0, -.4] }); cop.head.r = [0, -.4, 0]; }
  if (i === 12) { setRoad(XR1); setRoll(XR1, RMAX); RCUFF.visible = true; BUMP.visible = false; HCAR.root.visible = false; pcar.root.visible = false; h.root.p = [XR1 + .8, 0, 6.6]; h.root.r = [0, .2, 0]; pose_(h, { sL: [-.15, 0, .6], eL: [-1.6, 0, 0], sR: [-.15, 0, -.6], eR: [-1.6, 0, 0] }); face = 'grin'; h.body.r = [-.12, 0, 0];
    copStand(t, [1.6, 0, .4], -.3); setFace(cop, 'worry'); pose_(cop, { sR: [-2.2, 0, -.6], eR: [-1.6, 0, 0] }); cop.head.r = [0, Math.sin(t * 6) * .1, 0];
    CCAR.root.visible = true; const xl = XR1 - 2 * RMAX - 2.25; if (t < T_BONK) { const u = clamp((t - P[12]) / (T_BONK - P[12])); CCAR.root.p = [lerp(-32, xl, u), 0, 4.5]; CCAR.root.r = [0, Math.PI / 2, 0]; }
    else { const e = t - T_BONK; CCAR.root.p = [xl - e * 7 + e * e * 3, Math.abs(Math.sin(e * 9)) * .6 * Math.exp(-e * 2), 4.5]; CCAR.root.r = [-Math.sin(e * 9) * .3 * Math.exp(-e * 2), Math.PI / 2 + e * .8, 0]; CCAR.root.s = [1, 1, .82]; burst(T_BONK, t, [xl + 2.1, 1.0, 4.5], [.9, .9, .9], 0, 10, 1.0, 1.4); if (e > .1) face = 'grin'; } }
  if (i === 13) { CCAR.root.visible = true; CCAR.root.p = [XR1 - 2 * RMAX - 2.25 - 3.2, 0, 4.5]; CCAR.root.r = [0, Math.PI / 2 + 1.2, 0]; CCAR.root.s = [1, 1, .82]; RCUFF.visible = true;
    const k = t - T_KICK; let xr = XR1, r = RMAX; if (k > 0) { const u = clamp(k / (T_U1 - T_KICK)); xr = lerp(XR1, 45, u * u * (2 - u)); r = lerp(RMAX, .3, u); }
    if (k < 0) { const a = clamp((t - T_HOP) / (T_KICK - T_HOP)); const top = [XR1 - RMAX, 2 * RMAX, 5.6]; h.root.p = lerp3([XR1 + .8, 0, 6.6], top, eout(a)); h.root.p[1] += Math.sin(a * Math.PI) * 1.5; h.root.r = [0, -Math.PI / 2 + a * Math.PI, 0]; pose_(h, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); face = 'grin'; h.wob = .4; }
    else { setRoad(xr); setRoll(xr, r); const rx = xr - r; if (rx < 7.0) { h.root.p = [rx, 2 * r, 5.6]; h.root.r = [0, -.3, 0]; runPose(h, t, 30); pose_(h, { sL: [-2.6, 0, 1.2], sR: [-2.6, 0, -1.2] }); face = 'scream'; h.wob = .6; }
      else { const e = t - (T_KICK + .3); const a = clamp(e / .35); h.root.p = lerp3([7.0, 2 * r, 5.6], [7.0, 0, 6.6], a); h.root.p[1] = Math.max(0, lerp(4.0, 0, a) + Math.sin(a * Math.PI) * 1.2); h.root.r = [0, -.4, 0]; pose_(h, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); face = a < 1 ? 'scream' : 'grin'; if (a >= 1) { pose_(h, { sL: [-.15, 0, .6], eL: [-1.6, 0, 0], sR: [-.15, 0, -.6], eR: [-1.6, 0, 0] }); } } }
    if (k < 0) { setRoad(XR1); setRoll(XR1, RMAX); } BUMP.visible = xr > BP[0] + .8; bumpFace(t, 0, 0); HCAR.root.visible = xr > CARP[0] + 2.2; pcar.root.visible = xr > PCP[0] + 2.2; pcar.root.p = PCP.slice(); pcar.root.r = [0, Math.PI / 2, 0]; if (HCAR.root.visible) carAt(HCAR, CARP[0]); HCAR.root.visible = xr > CARP[0] + 2.2;
    copStand(t, [1.6, 0, .4], -.3); setFace(cop, k > .2 ? 'wide' : 'worry'); }
  if (i === 14) { face = intro(t - T_END); pcar.root.visible = true; pcar.root.p = PCP.slice(); copStand(t, [1.6, 0, .4], -.3); setFace(cop, 'half'); }
  setFace(h, face); for (const m of [hero, cop]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
// world props for hat waving + flying cuffs
const HATW = new Node(); HATW.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, 0, 0], [.4, .035, .4])); HATW.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, .02, 0], [.22, .2, .22])); HATW.add(new Node('cyl', { c: hex('#d8302c'), out: 0 }, [0, .03, 0], [.226, .045, .226])); HATW.s = [1.5, 1.5, 1.5]; scene.add(HATW);
const RCUFFW = new Node(); for (const x of [-.3, .3]) RCUFFW.add(new Node('cyl', { c: hex('#c8ccd6'), spec: 1, out: .01 }, [x, 0, 0], [.5, .08, .5])); RCUFFW.add(B('#c8ccd6', [0, 0, 0], [.3, .05, .05], { out: 0 })); scene.add(RCUFFW);
const _hideAll0 = hideAll; hideAll = function () { _hideAll0(); HATW.visible = false; RCUFFW.visible = false; };
