// =====================================================================
//  EP10 "THE RED LIGHT" — he waits. And waits. One step. Red again.
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
const HP = [12, 0, 1.25], HS = [12, 0, 2.3];
// ---------- pedestrian light ----------
function pedTex(name, green) { texC(name, 128, 256, (x, w, h) => { x.fillStyle = '#16161a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3a3a40'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.strokeRect(3, 128, w - 6, 3);
  const man_ = (cy, col, walk) => { x.fillStyle = col; x.beginPath(); x.arc(64, cy - 38, 12, 0, 6.283); x.fill(); x.lineWidth = 14; x.lineCap = 'round'; x.strokeStyle = col; x.beginPath(); x.moveTo(64, cy - 20); x.lineTo(64, cy + 12); x.stroke();
    x.lineWidth = 10; x.beginPath(); if (walk) { x.moveTo(64, cy + 12); x.lineTo(46, cy + 44); x.moveTo(64, cy + 12); x.lineTo(84, cy + 42); x.moveTo(64, cy - 14); x.lineTo(44, cy + 4); x.moveTo(64, cy - 14); x.lineTo(86, cy); } else { x.moveTo(58, cy + 12); x.lineTo(56, cy + 46); x.moveTo(70, cy + 12); x.lineTo(72, cy + 46); x.moveTo(56, cy - 14); x.lineTo(50, cy + 14); x.moveTo(72, cy - 14); x.lineTo(78, cy + 14); } x.stroke(); };
  man_(70, green ? '#3a2020' : '#ff3b2e', false); man_(196, green ? '#5dff8a' : '#203a28', true); }); }
pedTex('pedR', false); pedTex('pedG', true);
const PL = new Node(); PL.p = [13.55, 0, 1.45]; PL.add(B('#3d3f4a', [0, 1.5, 0], [.12, 3.0, .12], { out: .02 })); PL.add(B('#2a2b32', [0, 2.45, 0], [.42, .74, .34], { out: .02 }));
const pedF = new Node('quad', { c: [1, 1, 1], tex: 'pedR', em: .85, spec: 0, rim: 0, out: 0, noShadow: 1 }, [0, 2.45, .172], [.36, .68, 1]); PL.add(pedF);
const pedB = new Node('quad', { c: [1, 1, 1], tex: 'pedR', em: .85, spec: 0, rim: 0, out: 0, noShadow: 1 }, [0, 2.45, -.172], [.36, .68, 1], [0, Math.PI, 0]); PL.add(pedB);
PL.add(B('#2a2b32', [0, 2.86, .1], [.46, .06, .3], { out: 0 })); PL.add(B('#e2b23c', [0, 1.15, .07], [.2, .28, .16], { out: .02 })); PL.add(B('#1b1b20', [0, 1.17, .16], [.08, .08, .02], { out: 0 })); scene.add(PL);
const PL2 = new Node(); PL2.p = [10.6, 0, 12.4]; PL2.add(B('#3d3f4a', [0, 1.5, 0], [.12, 3.0, .12], { out: .02 })); PL2.add(B('#2a2b32', [0, 2.45, 0], [.42, .74, .34], { out: .02 }));
const pedF2 = new Node('quad', { c: [1, 1, 1], tex: 'pedR', em: .85, spec: 0, rim: 0, out: 0, noShadow: 1 }, [0, 2.45, -.172], [.36, .68, 1], [0, Math.PI, 0]); PL2.add(pedF2); scene.add(PL2);
const glowN = new Node('box', { c: [1, .3, .25], em: 1, a: .22, out: 0, noShadow: 1, noRecv: 1 }, [0, 2.45, .22], [.75, 1.05, .02]); PL.add(glowN);
function setLight(g) { pedF.mat.tex = pedB.mat.tex = pedF2.mat.tex = g ? 'pedG' : 'pedR'; glowN.mat.c = g ? [.4, 1, .55] : [1, .3, .25]; }
// ---------- traffic ----------
const CARS = [['#d8483c', 5.0, 1, 27, 0], ['#3f6fb5', 8.9, -1, 23, 33], ['#f4f1e8', 5.0, 1, 27, 52], ['#e2b23c', 8.9, -1, 23, 75]].map(([c, z, dir, sp, off]) => { const o = car({ body: c, top: c }); o.l1.visible = o.l2.visible = false; scene.add(o.root); return { o, z, dir, sp, off }; });
const STOPX = [7.6, 19.6, 2.9, 24.6];
function traffic(t, mode) { CARS.forEach((c, k) => { const r = c.o.root; r.visible = true; r.r = [0, c.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0];
  if (mode === 'go') { const q = (((t * c.sp + c.off) % 90) + 90) % 90; r.p = [12 + c.dir * (q - 45), 0, c.z]; }
  else { r.p = [STOPX[k], 0, c.z]; } }); }
const passTimes = (t0, t1) => { const out = []; CARS.forEach(c => { for (let n = -3; n < 40; n++) { const t = (45 - c.off + 90 * n) / c.sp; if (t >= t0 && t < t1) out.push(t); } }); return out; };
// ---------- snail ----------
function mkSnail() { const g = new Node(); const Y = '#cfc56a';
  g.add(B('#9fae48', [0, .05, 0], [.18, .1, .78], { out: .012 })); g.add(B('#9fae48', [0, .13, .38], [.16, .19, .14], { out: .012 }));
  const st = []; for (const sx of [-.045, .045]) { const pv = new Node(null, null, [sx, .22, .41]); pv.add(B('#9fae48', [0, .09, 0], [.025, .18, .025], { out: .005 })); pv.add(B('#1b1b20', [0, .19, 0], [.055, .055, .055], { out: .005 })); g.add(pv); st.push(pv); }
  g.add(B('#3a1418', [0, .11, .455], [.07, .015, .01], { out: 0 }));
  const sh = new Node(null, null, [0, .29, -.08]); sh.add(new Node('cyl', { c: hex('#9a5a34'), out: .01, spec: .3, rim: .1 }, [0, 0, 0], [.44, .2, .44], [0, 0, Math.PI / 2])); sh.add(new Node('cyl', { c: hex('#c98a5a'), out: 0 }, [0, .02, .02], [.28, .21, .28], [0, 0, Math.PI / 2])); sh.add(new Node('cyl', { c: hex('#7a4228'), out: 0 }, [0, .04, .04], [.12, .22, .12], [0, 0, Math.PI / 2])); g.add(sh);
  const trail = new Node('box', { c: [.85, .92, 1], em: .35, a: .55, spec: 1, out: 0, noShadow: 1 }, [0, 0, 0], [.12, .012, 1]); scene.add(trail); scene.add(g); return { g, st, sh, trail }; }
const SN = mkSnail();
function snailAt(p, yaw, t, crawl = 1, look = 0) { SN.g.visible = true; SN.g.p = p; SN.g.s = [1.6, 1.6, 1.6]; SN.g.r = [0, yaw, 0]; SN.g.children[0].s = [.18, .1, .78 + Math.sin(t * 9) * .06 * crawl];
  SN.st.forEach((s, k) => s.r = [look ? -.5 : Math.sin(t * 3 + k) * .25, look ? (k ? -.5 : .4) * look : 0, (k ? -1 : 1) * .15]); }
function trailTo(a, b) { SN.trail.visible = true; SN.trail.p = [(a[0] + b[0]) / 2, .02, (a[2] + b[2]) / 2]; SN.trail.s = [.14, .012, Math.max(.01, Math.abs(b[2] - a[2]))]; }
// ---------- bird + nest ----------
function mkBird() { const g = new Node(); const C = '#4a7fd0'; g.add(B(C, [0, 0, 0], [.16, .14, .24], { out: .006 })); g.add(B(C, [0, .1, .12], [.13, .13, .13], { out: .006 })); g.add(B('#f0a43a', [0, .08, .22], [.05, .04, .09], { out: .004 })); g.add(B('#f2e6c8', [0, -.02, .06], [.12, .08, .14], { out: 0 }));
  for (const sx of [-.04, .04]) { g.add(B('#ffffff', [sx, .13, .185], [.035, .045, .01], { out: 0 })); g.add(B('#1b1b20', [sx, .13, .19], [.016, .02, .01], { out: 0 })); }
  g.add(B(C, [0, .04, -.17], [.1, .03, .14], { out: .004 })); const wL = new Node(null, null, [-.08, .04, 0]), wR = new Node(null, null, [.08, .04, 0]); wL.add(B('#3a6ab8', [-.12, 0, 0], [.24, .02, .14], { out: .004 })); wR.add(B('#3a6ab8', [.12, 0, 0], [.24, .02, .14], { out: .004 })); g.add(wL, wR);
  const scarf = B('#d8302c', [0, .05, .08], [.17, .04, .1], { out: .004 }); g.add(scarf); scene.add(g); return { g, wL, wR, scarf }; }
const BD = mkBird();
function birdAt(p, yaw, t, flap = 0, sc = 1.7) { BD.g.visible = true; BD.g.p = p; BD.g.r = [0, yaw, 0]; BD.g.s = [sc, sc, sc]; const a = flap ? Math.sin(t * 46) * .9 : .1; BD.wL.r = [0, 0, a]; BD.wR.r = [0, 0, -a]; }
const nest = new Node(null, null, [0, .13, 0]); nest.add(new Node('cyl', { c: hex('#8a6038'), out: .01, spec: .02 }, [0, 0, 0], [.5, .12, .5])); nest.add(new Node('cyl', { c: hex('#5a3a20'), out: 0 }, [0, .005, 0], [.38, .125, .38]));
for (let k = 0; k < 10; k++) nest.add(B('#a07848', [Math.cos(k * .63) * .23, .03 + (k % 2) * .03, Math.sin(k * .63) * .23], [.2, .025, .025], { out: 0 }));
const eggs = []; for (let k = 0; k < 3; k++) { const e = B('#f4f1e8', [-.07 + k * .07, .09, (k % 2) * .05 - .02], [.07, .09, .07], { out: .004 }); nest.add(e); eggs.push(e); } hero.hat.add(nest);
const NEST2 = new Node(); NEST2.add(new Node('cyl', { c: hex('#8a6038'), out: .01 }, [0, 0, 0], [.5, .12, .5])); for (let k = 0; k < 3; k++) NEST2.add(B('#f4f1e8', [-.07 + k * .07, .09, 0], [.07, .09, .07], { out: .004 })); scene.add(NEST2);
// ---------- beard ----------
const beard = new Node(null, null, [.06, .16, .22]); beard.add(B('#6b4a36', [0, -.5, 0], [.34, 1, .07], { out: .01 })); for (let k = 0; k < 5; k++) beard.add(B('#5a3c2a', [-.12 + k * .06, -.98, .02], [.05, .06, .05], { out: 0 })); hero.head.add(beard);
const flyBeard = new Node(); flyBeard.add(B('#6b4a36', [0, -.5, 0], [.34, 1, .07], { out: .01 })); scene.add(flyBeard);
function beardLen(L, sway = 0, t = 0) { beard.visible = L > .02; beard.s = [1, Math.max(.02, L), 1]; beard.r = [-.08 - L * .03 + sway, 0, Math.sin(t * 3) * .05]; }
// ---------- snow ----------
const SNOW = []; const sn = (par, p, s) => { const n = B('#f6f8fd', p, s, { out: .006, spec: .25 }); par.add(n); SNOW.push(n); return n; };
sn(hero.hat, [0, .14, 0], [.3, .07, .3]); sn(nest, [0, .1, 0], [.52, .06, .52]); sn(hero.body, [0, 1.79, 0], [.66, .09, .38]); sn(PL, [0, 2.92, 0], [.5, .08, .4]); sn(PL2, [0, 2.92, 0], [.5, .08, .4]);
sn(scene, [16, .006, -.3], [40, .02, 4.15]); sn(scene, [16, -.045, -4.4], [40, .04, 3.4]); sn(scene, [16, .07, 1.9], [40, .03, .26]);
for (let k = 0; k <= 2; k++) { const x = k * 8.2 + 4.3, z = -5 - (k % 2) * 1.2; sn(scene, [x, 4.47, z], [2.38, .12, 2.38]); sn(scene, [x + .3, 5.24, z - .2], [1.46, .12, 1.46]); }
sn(scene, [9.6, 2.98, 1.45], [.5, .08, .1]); sn(scene, [7.8, 1.22, -1.95], [1.5, .08, .7]);
const snowman = new Node(); snowman.p = [9.0, 0, -.6]; snowman.add(new Node('cyl', { c: hex('#f6f8fd'), out: .01 }, [0, .3, 0], [.6, .6, .6])); snowman.add(new Node('cyl', { c: hex('#f6f8fd'), out: .01 }, [0, .78, 0], [.42, .42, .42])); snowman.add(B('#f08a2a', [0, .8, .26], [.05, .05, .2], { out: .004 })); snowman.add(B('#2a2a30', [0, 1.06, 0], [.3, .2, .3], { out: .01 })); for (const sx of [-.08, .08]) snowman.add(B('#1b1b20', [sx, .88, .21], [.04, .04, .02], { out: 0 })); scene.add(snowman);
// ---------- sunflower (time lapse) ----------
const flower = new Node(); flower.p = [11.2, 0, 1.0]; const stem = B('#4f8f4c', [0, .5, 0], [.05, 1, .05], { out: .006 }); flower.add(stem); const fhead = new Node(null, null, [0, 1, 0]); fhead.add(new Node('cyl', { c: hex('#f2c430'), out: .01 }, [0, 0, 0], [.42, .04, .42], [Math.PI / 2, 0, 0])); fhead.add(new Node('cyl', { c: hex('#6b4a2a'), out: 0 }, [0, 0, .02], [.18, .045, .18], [Math.PI / 2, 0, 0])); flower.add(fhead); scene.add(flower);
// ---------- bus stop ----------
texC('busS', 256, 160, (x, w, h) => { x.fillStyle = '#2b5fb0'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '900 80px "Inter Display"'; x.fillText('BUS', w / 2, 82); x.font = '700 22px "Courier 10 Pitch"'; x.fillText('EST. TODAY', w / 2, 128); });
const BS = new Node(); BS.p = [HP[0] + .1, 0, HP[2] - .35]; const BSP = [];
const bsp = (n, k) => { BS.add(n); BSP.push({ n, k, s0: n.s.slice(), p: n.p.slice(), r: (n.r || [0, 0, 0]).slice(), v: [(hsh(k, 1) - .5) * 8, 4 + hsh(k, 2) * 5, (hsh(k, 3) - .5) * 6 + 2], w: [(hsh(k, 4) - .5) * 9, (hsh(k, 5) - .5) * 9, (hsh(k, 6) - .5) * 9] }); };
for (const sx of [-1.35, 1.35]) bsp(B('#3d3f4a', [sx, 1.3, -.45], [.08, 2.6, .08], { out: .015 }), sx > 0 ? 0 : 1);
for (const sx of [-1.35, 1.35]) bsp(B('#3d3f4a', [sx, 1.3, .55], [.08, 2.6, .08], { out: .015 }), sx > 0 ? 2 : 3);
bsp(new Node('box', { c: [.75, .9, 1], a: .32, spec: 1, out: .004, noShadow: 1 }, [0, 1.35, -.45], [2.7, 2.2, .04]), 4);
bsp(B('#2b5fb0', [0, 2.65, .05], [2.95, .1, 1.35], { out: .012 }), 5);
bsp(B('#8a5a3a', [0, .48, -.2], [1.8, .08, .38], { out: .01 }), 6); bsp(B('#3d3f4a', [0, .24, -.2], [1.6, .46, .06], { out: .01 }), 7);
const bsign = new Node(null, null, [-1.75, 0, .6]); bsign.add(B('#3d3f4a', [0, 1.3, 0], [.07, 2.6, .07], { out: .015 })); bsign.add(new Node('quad', { c: [1, 1, 1], tex: 'busS', spec: 0, rim: 0, out: 0 }, [0, 2.5, .03], [.56, .35, 1])); bsign.add(B('#2b5fb0', [0, 2.5, 0], [.6, .39, .04], { out: .01 })); bsp(bsign, 8);
scene.add(BS);
const granny = man({ id: 'med', shape: 'can', seed: 21, skin: '#f0d2bd', shirt: '#b46aa0', stripe: '#9a5488', pants: '#6a5a7a', shoe: '#3a3040', hair: '#e8e8ee' }); scene.add(granny.root);
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- timing ----------
const T_RED = WD.red3 - T_END, T_BACK = T_RED + .5, T_SN = WD.snail - .1, T_LOOK = WD.fucking1, T_BIRD = WD.bird - .3, T_LAND = T_BIRD + .9, T_BEARD = WD.beard - .1, T_BIG = WD.fucking2, T_ZOOM = WD.sprinted - .05, T_GREEN = WD.green, T_JUMP = WD.fucking3 - .05, T_STEP = at(12, .12);
const BSTART = WD.city - .05; const bsIn = (t, k) => eback(clamp((t - BSTART - k * .17) / .3));
const SITG = g => { g.body.p = [0, -.43, 0]; g.lL.r = [-1.5, 0, -.1]; g.lR.r = [-1.5, 0, .1]; g.lL.k = g.lR.k = 1.5; };
// ---------- intro / loop (t < 0 = last line) ----------
function idle(h, t) { pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); const f = Math.max(0, Math.sin(t * 13)); h.lR.r = [-.35 * f, 0, 0]; h.lR.k = .4 * f; }
const STEPP = h => pose_(h, { sL: [-.5, 0, .5], sR: [-.5, 0, -.5], lL: [-.4, 0, 0], lR: [.3, 0, 0] });
function intro(t) { const h = hero; let face = 'half'; h.root.p = HP.slice(); h.root.r = [0, 0, 0]; setLight(t < T_RED);
  if (t < T_RED) { traffic(t, 'stop'); h.root.p = HS.slice(); STEPP(h); face = 'grin'; return face; }
  traffic(t, 'go'); CARS.forEach(c => { if (c.z < 6) c.o.root.visible = false; });
  if (t < T_BACK) { h.root.p = HS.slice(); STEPP(h); face = 'wide'; h.wob = .02; h.body.r = [-.05, 0, 0]; return face; }
  const e = t - T_BACK; if (e < .35) { const a = eio(clamp(e / .35)); h.root.p = [HP[0], Math.sin(a * Math.PI) * .55, lerp(HS[2], HP[2], a)]; pose_(h, { sL: [-2.6, 0, .8], sR: [-2.6, 0, -.8], lL: [-.6, 0, 0], lR: [-.6, 0, 0] }); face = 'scream'; h.wob = .5; return face; }
  idle(h, t); face = t < 0 ? 'squint' : 'half'; return face; }
function hideAll() { for (const m of [hero, cop, granny]) { resetPose(m); m.root.visible = false; m.body.s = [1, 1, 1]; m.body.r = [0, 0, 0]; } hero.root.visible = true; puffs.forEach(p => p.visible = false);
  SN.g.visible = SN.trail.visible = false; BD.g.visible = false; BD.scarf.visible = false; nest.visible = false; nest.s = [1, 1, 1]; NEST2.visible = false; eggs.forEach(e => e.visible = true); beardLen(0); flyBeard.visible = false; SNOW.forEach(n => n.visible = false); snowman.visible = false; flower.visible = false;
  BS.visible = false; BSP.forEach(o => { o.n.visible = true; o.n.p = o.p.slice(); o.n.r = o.r.slice(); o.n.s = o.s0.slice(); }); CARS.forEach(c => c.o.root.visible = false); setLight(false); }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  // world state
  let birdOnHat = i >= 6 && i <= 10 || (i === 11 && t <= T_JUMP) || (i === 5 && t > T_LAND);
  if (i >= 5 && i <= 11) nest.visible = !(i === 5 && t < T_LAND) && !(i === 11 && t > T_JUMP);
  if (birdOnHat) late.push(() => { birdAt(wp(hero.hat, [0, .25, 0]), .5, t, 0, 1.5); BD.scarf.visible = i >= 6; });
  if (i >= 6 && i <= 7) { SNOW.forEach(n => n.visible = true); snowman.visible = true; }
  if (i >= 4 && i <= 5) { flower.visible = true; const g = i === 4 ? eout(clamp((t - P[4] - .2) / 1.2)) : 1; const s = Math.max(.02, g * 1.9); stem.s = [.05, s, .05]; stem.p = [0, s / 2, 0]; fhead.p = [0, s, 0]; fhead.r = [0, 0, Math.sin(t * 2) * .1]; }
  if (i >= 7 && i <= 11) { const L_ = i === 7 ? eout(clamp((t - T_BEARD) / (WD.shoes - T_BEARD + .2))) * 1.75 : 1.75; if (!(i === 11 && t > T_JUMP)) beardLen(L_, 0, t); }
  if (i >= 8 && i <= 11) { BS.visible = true; if (i === 8) BSP.forEach(o => { const s = bsIn(t, o.k); const q = Math.max(.01, s); o.n.s = o.s0.map(v => v * q); if (s < .02) o.n.visible = false; }); }
  if ((i === 10 && t > T_GREEN) || i === 11 || i === 12) setLight(true);
  if (i === 1 || (i >= 4 && i <= 8)) { traffic(t, 'go'); if (i >= 5) CARS.forEach(c => { if (c.z < 6) c.o.root.visible = false; }); } if ((i >= 2 && i <= 3) || (i >= 9 && i <= 12)) traffic(t, 'stop');
  // characters
  if (i === 0) face = intro(t);
  if (i === 1) { h.root.p = HP.slice(); idle(h, t); face = 'half'; h.head.r = [0, Math.sin(t * 1.5) * .25, 0]; if (t > at(1, .55)) { pose_(h, { sL: [-.2, 0, .1], sR: [-1.6, 0, -.1], eR: [-1.9, 0, 0] }); face = 'squint'; } }
  if (i === 2 || i === 3) { h.root.p = HP.slice(); const x = 11.35;
    let z, yaw = Math.PI, look = 0; if (i === 2) { z = lerp(7.4, 4.4, clamp((t - T_SN) / (pend(2) - T_SN))); } else { const u1 = clamp((t - P[3]) / (T_LOOK - P[3])); z = lerp(4.4, 2.75, u1); if (t > T_LOOK) { look = 1; yaw = Math.PI + .6; } if (t > T_LOOK + 1.0) { const u2 = clamp((t - T_LOOK - 1.0) / .5); z = lerp(2.75, 1.5, u2); yaw = Math.PI; look = 0; } }
    const p = [x, z > 2.0 ? 0 : .06, z]; snailAt(p, yaw, t, look ? 0 : 1, look); trailTo([x, 0, 7.6], p);
    if (i === 2) { face = 'down'; h.head.r = [.35, 0, 0]; pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); }
    else if (t < WD.fucking1 - .25) { face = 'wide'; pose_(h, { sR: [-1.4, 0, .25], eR: [-.1, 0, 0], sL: [-.3, 0, .4] }); h.head.r = [.3, 0, 0]; h.body.r = [.12, 0, 0]; h.wob = .1; }
    else { argue(h, t, 1.6, 3); h.root.p[1] = Math.abs(Math.sin(t * 11)) * .45; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .5; } }
  if (i === 4) { h.root.p = HP.slice(); pose_(h, { sL: [-.1, 0, .1], sR: [-.1, 0, -.1] }); face = 'half'; h.head.r = [.05 + Math.sin(t * 20) * .02, 0, 0]; h.wob = .02; }
  if (i === 5) { h.root.p = HP.slice(); pose_(h, { sL: [-.1, 0, .1], sR: [-.1, 0, -.1] }); face = 'halfup'; const d = t - T_BIRD;
    if (d < .9) { if (d > 0) { const a = clamp(d / .9); const p0 = [19, 7, 7], p1 = wp(hero.hat, [0, .25, 0]); birdAt([lerp(p0[0], p1[0], eout(a)), lerp(p0[1], p1[1], eout(a)) + Math.sin(a * Math.PI) * .8, lerp(p0[2], p1[2], eout(a))], yawOf(p0, p1), t, 1, 1.5); } }
    else { const b = eback(clamp((d - .9) / .3)); nest.s = [Math.max(.01, b), Math.max(.01, b), Math.max(.01, b)]; eggs.forEach((e, k) => e.visible = t > T_LAND + .35 + k * .18); face = 'up'; h.head.r = [-.15, 0, 0]; } }
  if (i === 6) { h.root.p = HP.slice(); pose_(h, { sL: [-1.2, 0, -.7], eL: [-1.3, 0, 0], sR: [-1.2, 0, .7], eR: [-1.3, 0, 0] }); face = 'worry'; h.root.p[0] += Math.sin(t * 60) * .03; h.wob = .12; }
  if (i === 7) { h.root.p = HP.slice(); const big = t > T_BIG; pose_(h, big ? { sL: [-2.7, 0, .8], sR: [-2.7, 0, -.8] } : { sL: [-1.2, 0, -.7], eL: [-1.3, 0, 0], sR: [-1.2, 0, .7], eR: [-1.3, 0, 0] }); face = big ? (Math.sin(t * 20) > 0 ? 'scream' : 'wide') : 'down'; if (!big) h.head.r = [.3, 0, 0]; else { h.root.p[1] = Math.abs(Math.sin(t * 10)) * .2; h.wob = .4; } }
  if (i === 8) { h.root.p = HP.slice(); pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); face = 'half'; const gd = t - (BSTART + 1.1);
    if (gd > 0) { granny.root.visible = true; const a = eout(clamp(gd / .5)); granny.root.p = [lerp(15.5, HP[0] - .8, a), 0, HP[2] - .55]; granny.root.r = [0, a < 1 ? -Math.PI / 2 : 0, 0]; if (a < 1) walkPose(granny, t, 12, .6); else SITG(granny); setFace(granny, a < 1 ? 'neutral' : 'closed'); } }
  if (i >= 9 && i <= 11) { granny.root.visible = true; granny.root.p = [HP[0] - .8, 0, HP[2] - .55]; SITG(granny); setFace(granny, 'closed'); granny.head.r = [.35, 0, .2]; }
  if (i === 9) { h.root.p = HP.slice(); pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); face = 'half'; const d = t - T_ZOOM; cop.root.visible = d > -.05 && d < .7;
    if (cop.root.visible) { const u = clamp(d / .32); let p; if (u < 1) p = [11.0, 0, lerp(13, -.6, u)]; else { const a = clamp((d - .32) / .35); p = [11.0, Math.sin(a * Math.PI) * 1.6 + a * .1, lerp(-.6, -4.6, a)]; } cop.root.p = p; cop.root.r = [0, Math.PI, 0]; runPose(cop, t, 44); pose_(cop, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); setFace(cop, 'scream'); cop.wob = .7; }
    burst(T_ZOOM + .12, t, [11.0, .2, 4], [.85, .8, .72], 0, 16, 1.6, 1.2);
    if (d > .1 && d < .8) { const a = clamp((d - .1) / .6); h.root.r = [0, eout(a) * Math.PI * 4, 0]; face = 'dizzy'; h.wob = .6; beardLen(1.75, -.9 * (1 - a), t); }
    else if (d >= .8) { face = 'squint'; h.head.r = [0, -.7, 0]; } }
  if (i === 10) { h.root.p = HP.slice(); pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); face = t > T_GREEN ? 'wideup' : 'half'; if (t > T_GREEN) { h.head.r = [-.1, .5, 0]; h.body.r = [-.06, 0, 0]; } }
  if (i === 11) { h.root.p = HP.slice(); const d = t - T_JUMP;
    if (d < 0) { face = 'wide'; pose_(h, { sL: [-.5, 0, .5], sR: [-.5, 0, -.5] }); h.body.p = [0, -.12, 0]; }
    else { const a = clamp(d / .9); h.root.p[1] = Math.sin(a * Math.PI) * 2.6; h.root.r = [0, 0, Math.sin(d * 9) * .15]; pose_(h, { sL: [-2.9, 0, .6 + Math.sin(t * 25) * .3], sR: [-2.9, 0, -.6 - Math.sin(t * 25) * .3], lL: [-.9, 0, 0], lR: [.6, 0, 0] }); face = Math.sin(t * 20) > 0 ? 'scream' : 'grin'; h.wob = .55; if (a >= 1) h.root.p[1] = Math.abs(Math.sin(d * 10)) * .35;
      flyBeard.visible = d < 1.6; flyBeard.p = [HP[0] + .06 + d * 2.5, 1.9 + d * 4 - d * d * 4, HP[2] + .3 + d * 3]; flyBeard.r = [d * 6, d * 3, d * 5]; flyBeard.s = [1, 1.75, 1];
      const bp = [HP[0] + d * 3, 4.2 + d * 3.5, HP[2] + d * 1.5]; birdAt(bp, Math.PI / 2, t, 1, 1.5); BD.scarf.visible = true; NEST2.visible = true; NEST2.p = A3(bp, [0, -.32, 0]);
      BSP.forEach(o => { const e = Math.max(0, d - .05); o.n.p = [o.p[0] + o.v[0] * e, o.p[1] + o.v[1] * e - 9.8 * e * e * .5, o.p[2] + o.v[2] * e]; o.n.r = [o.r[0] + o.w[0] * e, o.r[1] + o.w[1] * e, o.r[2] + o.w[2] * e]; if (o.n.p[1] < -3) o.n.visible = false; });
      granny.root.r = [0, 0, -eout(clamp(d / .35)) * 1.4]; granny.root.p = [HP[0] - .9, 0, HP[2] - .55]; setFace(granny, 'wide');
      burst(T_JUMP, t, [HP[0], 1.4, HP[2]], [1, .85, .35], 0, 8, 2.4, 3); burst(T_JUMP + .08, t, [HP[0], 2.4, HP[2]], [.95, .45, .7], 8, 16, 2.4, 3); } }
  if (i === 12) { const u = clamp((t - T_STEP) / .9); h.root.p = lerp3(HP, HS, eio(u)); face = 'grin'; if (u > 0 && u < 1) walkPose(h, t, 7, .7); pose_(h, { sL: [-.5, 0, .5], sR: [-.5, 0, -.5] }); if (u >= 1) pose_(h, { lL: [-.4, 0, 0], lR: [.3, 0, 0] }); h.head.r = [.08, 0, 0]; }
  if (i === 13) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, granny]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
