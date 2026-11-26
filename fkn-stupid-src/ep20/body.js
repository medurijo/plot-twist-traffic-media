// ===================== EP20 scene =====================
lamp.p = [19.6, 0, 1.6]; scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] - 9.6) < .3 && Math.abs(n.p[2] - 1.45) < .3) n.visible = false; });
const TZ = 3.6, HS = [-.8, 0, .9], BAGP = [-1.75, 0, 1.15], TXS = 3.6, TX2 = 26, HT = [15.5, 0, 2.3], CP = [19.2, 0, -.3], BINP = [16.7, 0, 1.25], COLP = [21.9, 0, 1.75];
const CY = 2.2; const HOP = [-3.15, 1.45, 0]; // hopper mouth (local)
texC('gtsign', 512, 128, (x, w, h) => { x.fillStyle = '#3f8f5a'; x.fillRect(0, 0, w, h); x.font = '900 64px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 10; x.strokeStyle = '#1e4a2c'; x.strokeText('CITY TRASH', w / 2, 48); x.fillStyle = '#f4f1e8'; x.fillText('CITY TRASH', w / 2, 48);
  x.font = '800 30px "Inter Display"'; x.fillStyle = '#ffd23a'; x.fillText('WE TAKE EVERYTHING', w / 2, 104); });
// ---------- garbage truck (front = +x, sidewalk side = -z) ----------
const GT = new Node(); scene.add(GT); const gt = (c, p, s, o, r) => { const n = B(c, p, s, o); if (r) n.r = r; GT.add(n); return n; };
const GC = '#3f8f5a', GC2 = '#2f7046', WH = '#f2f2ee';
gt('#3a3a40', [0, .62, 0], [7.0, .26, 2.0]);
// cab
gt(WH, [2.7, 1.75, 0], [1.6, 1.9, 2.3]); gt(WH, [2.6, 2.75, 0], [1.4, .12, 2.24]); gt('#9fd0e8', [3.51, 2.15, 0], [.03, .8, 1.9], { spec: .9 }); for (const z of [-1.16, 1.16]) gt('#3a4a5a', [2.85, 2.2, z], [1.0, .62, .02], { out: 0, spec: .8 });
gt('#c8ccd6', [3.58, .85, 0], [.16, .3, 2.2], { spec: .8 }); for (const z of [-.8, .8]) gt('#fff4c0', [3.53, 1.25, z], [.03, .22, .34], { em: .8, out: 0 }); gt('#2a2a30', [3.52, 1.45, 0], [.02, .3, 1.0], { out: 0 });
const BEACON = gt('#ff9a2a', [2.6, 2.92, 0], [.3, .22, .3], { em: .8, out: .01 });
for (const z of [-1.2, 1.2]) gt('#2a2a30', [3.25, 2.2, z * 1.06], [.08, .35, .05]);
// body
gt(GC, [-.43, 2.05, 0], [4.55, 2.6, 2.4]); gt(GC2, [-.43, 3.38, 0], [4.6, .1, 2.45]); for (let k = 0; k < 8; k++) for (const z of [-1.21, 1.21]) gt(GC2, [-2.5 + k * .6, 2.05, z], [.1, 2.5, .04], { out: 0 });
for (const z of [-1.225, 1.225]) GT.add(new Node('quad', { c: [1, 1, 1], tex: 'gtsign', spec: 0, rim: 0, out: 0 }, [-.43, 2.25, z], [3.4, .85, 1], [0, z < 0 ? Math.PI : 0, 0]));
for (const z of [-1.24, 1.24]) { gt('#ffd23a', [-.43, .98, z], [4.5, .14, .02], { out: 0 }); }
// hopper (rear, mouth faces -x)
gt('#1a1a1e', [-3.1, 1.85, 0], [.9, 1.95, 2.25], { out: 0 }); // dark inside
for (const z of [-1.17, 1.17]) gt(GC, [-3.1, 1.85, z], [.95, 2.05, .1]); gt(GC, [-3.1, 2.92, 0], [.95, .14, 2.44]); gt(GC, [-3.1, .82, 0], [.95, .14, 2.44]);
gt(GC, [-3.58, 2.68, 0], [.08, .5, 2.44]); gt(GC, [-3.58, 1.0, 0], [.08, .32, 2.44]);
for (let k = 0; k < 6; k++) { gt(k % 2 ? '#1b1b20' : '#ffd23a', [-3.63, 2.68, -1.0 + k * .4], [.02, .46, .2], { out: 0 }); gt(k % 2 ? '#ffd23a' : '#1b1b20', [-3.63, 1.0, -1.0 + k * .4], [.02, .28, .2], { out: 0 }); }
const BLADE = new Node(null, null, [-3.25, 2.8, 0]); BLADE.add(B('#8a8e96', [0, -.75, 0], [.08, 1.5, 2.1], { spec: .6 })); BLADE.add(B('#6a6e76', [0, -1.45, 0], [.16, .12, 2.1], { spec: .6 })); GT.add(BLADE);
const LEVER = new Node(null, null, [-3.0, 1.35, -1.25]); LEVER.add(B('#2a2a30', [0, .2, 0], [.06, .42, .06])); LEVER.add(B('#e3263a', [0, .44, 0], [.14, .14, .14], { spec: .5 })); GT.add(LEVER);
gt('#c8ccd6', [-3.85, .55, 0], [.45, .06, 2.0], { spec: .8 }); for (const z of [-1.0, 1.0]) gt('#c8ccd6', [-3.66, 1.75, z], [.05, 1.3, .05], { spec: .8 });
for (const z of [-1.1, 1.1]) gt('#e3263a', [-3.62, .72, z], [.03, .14, .22], { em: .6, out: 0 });
const WHL = []; for (const x of [-2.3, -1.2, 2.6]) for (const z of [-1.0, 1.0]) { const w = new Node(null, null, [x, .5, z]); w.add(new Node('cyl', { c: hex('#1d1d22'), out: .015 }, [0, 0, 0], [1.0, .2, 1.0], [1.5708, 0, 0])); w.add(new Node('cyl', { c: hex('#c8ccd6'), out: 0, spec: .8 }, [0, 0, z * .2], [.5, .02, .5], [1.5708, 0, 0])); w.add(B('#8a8e96', [0, 0, z * .21], [.44, .06, .02], { out: 0 })); GT.add(w); WHL.push(w); }
const DRV = man({ id: 'nb', shape: 'box', seed: 9, skin: '#d9a987', shirt: '#ff8a2a', stripe: '#ffd23a', pants: '#3a3a40', shoe: '#1d1d22', cap: '#ff8a2a' }); DRV.root.p = [2.55, .78, -.45]; DRV.root.r = [0, Math.PI / 2, 0]; GT.add(DRV.root);
function setGT(cx, shake = 0) { GT.visible = true; GT.p = [cx, Math.abs(Math.sin(cx * 3)) * .01 + shake * Math.abs(Math.sin(gtT * 47)) * .08, TZ]; GT.r = [shake * Math.sin(gtT * 31) * .03, 0, shake * Math.sin(gtT * 23) * .02]; WHL.forEach(w => w.r = [0, 0, -cx / .5]); }
let gtT = 0;
const GTW = (l) => A3(GT.p, l); // world point of a truck-local point (truck only translates)
// ---------- collector (rides the rear step) ----------
const COL = man({ id: 'pilot', shape: 'disc', seed: 7, skin: '#e8b48f', shirt: '#ff8a2a', stripe: '#ffd23a', pants: '#3a3a40', shoe: '#1d1d22', cap: '#ff8a2a', capBadge: '#ffd23a' }); scene.add(COL.root);
function colRide(t, wave = 0) { const m = COL; m.root.visible = true; m.root.p = GTW([-3.85, .58, -.75]); m.root.r = [0, -Math.PI / 2 - .5, 0]; pose_(m, { sL: [-2.2, 0, -.3], eL: [-.6, 0, 0] }); m.lL.r = [-.2, 0, 0]; m.lR.r = [.5, 0, .3]; m.wob = .12;
  if (wave) { m.sR.r = [-2.75 + Math.sin(t * 13) * .25, 0, -.35 + Math.sin(t * 13) * .45]; m.eR.r = [-.3, 0, Math.sin(t * 13 + 1) * .5]; } setFace(m, wave ? 'grin' : 'neutral'); }
// ---------- props ----------
function mkBag() { const n = new Node(); n.add(B('#26302a', [0, 0, 0], [.55, .55, .5], { spec: .5, rim: .2 })); n.add(B('#26302a', [0, .3, 0], [.3, .14, .28], { spec: .5 })); n.add(B('#ffd23a', [0, .4, 0], [.16, .08, .16], { out: .01 })); n.add(B('#1b1f1c', [.12, -.05, .26], [.2, .3, .01], { out: 0 })); return n; }
const BAGW = mkBag(); scene.add(BAGW);
function mkBin() { const n = new Node(); n.add(B('#3f7a4a', [0, .55, 0], [.66, 1.0, .72], { spec: .2 })); n.add(B('#2f5f3a', [0, 1.08, -.02], [.72, .08, .8])); n.add(B('#2f5f3a', [0, .95, -.42], [.6, .1, .1])); for (const x of [-.25, .25]) n.add(new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [x, .1, -.38], [.2, .08, .2], [0, 0, 1.5708])); n.add(B('#f4f1e8', [0, .6, .37], [.3, .2, .01], { out: 0 })); return n; }
const BINW = mkBin(); scene.add(BINW);
for (const [x, z] of [[27.8, 1.0], [28.6, 1.0]]) { const b = mkBin(); b.p = [x, 0, z]; scene.add(b); }
const PEEL = new Node(null, null, [.05, .52, 0]); for (let k = 0; k < 3; k++) PEEL.add(B('#f2d04a', [Math.cos(k * 2.1) * .12, -.02, Math.sin(k * 2.1) * .12], [.08, .03, .3], { out: .01 }, [0, k * 2.1, .5])); PEEL.add(B('#f2d04a', [0, .05, 0], [.1, .14, .1])); cop.head.add(PEEL);
const TRASH = []; for (let k = 0; k < 14; k++) { const n = B(['#f2d04a', '#c8ccd6', '#e3263a', '#9a6a42', '#f4f1e8', '#6ab86a'][k % 6], [0, 0, 0], [.12 + hsh(k, 1) * .14, .03, .1 + hsh(k, 2) * .12], { out: .006 }); n.visible = false; scene.add(n); TRASH.push(n); }
function trash(t0, t, o, n0 = 0, n1 = 14, spr = 1.4) { const d = t - t0; if (d < 0) return; for (let k = n0; k < n1; k++) { const q = TRASH[k]; q.visible = true; const a = k * 2.399, v = (.8 + hsh(k, 3)) * spr, dd = Math.min(d, .55 + hsh(k, 4) * .25);
  q.p = [o[0] + Math.cos(a) * v * dd, Math.max(.02, o[1] + 3.2 * dd - 6 * dd * dd), o[2] + Math.sin(a) * v * dd]; q.r = [dd * 9 * hsh(k, 5), a, dd * 7]; } }
// the cube (him, compacted)
const CUBE = new Node(); const CB = new Node(); CUBE.add(CB);
CB.add(B('#e2b23c', [0, .3, 0], [.9, .5, .9], { c2: hex('#b8862a'), pat: 5, ps: 9 })); CB.add(B('#5b6f8f', [0, .05, 0], [.9, .1, .9])); CB.add(B(SK.hero, [0, .78, 0], [.9, .46, .9], { out: .012 }));
const CFACE = new Node('quad', { c: hex(SK.hero), tex: 'hero_wide', spec: 0, rim: 0, out: 0 }, [.05, .72, .455], [.62, .62, 1]); CB.add(CFACE);
for (const x of [-.2, .2]) CB.add(B('#e9e4d4', [x, .0, .48], [.18, .08, .16], { out: .01 }));
const CHAT = new Node(null, null, [-.18, 1.01, -.05], null, [0, 0, .15]); CHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, 0, 0], [.4, .035, .4])); CHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, .02, 0], [.22, .2, .22])); CHAT.add(new Node('cyl', { c: hex('#d8302c'), out: 0 }, [0, .03, 0], [.226, .045, .226])); CHAT.s = [1.3, 1.3, 1.3]; CB.add(CHAT);
const NEST = new Node(null, null, [.2, 1.01, .05]); for (let k = 0; k < 7; k++) NEST.add(B(k % 2 ? '#8a6a42' : '#6a4a30', [Math.cos(k * .9) * .12, .02, Math.sin(k * .9) * .12], [.2, .03, .03], { out: 0 }, [0, k * .9 + .8, 0])); CB.add(NEST);
const SUIT = new Node(); SUIT.add(B('#8a4a3c', [0, .06, 0], [.14, .11, .05])); SUIT.add(B('#2a2a30', [0, .13, 0], [.05, .02, .02], { out: 0 })); scene.add(SUIT);
scene.add(CUBE);
const PIG = mkPigeon();
// hat that flies out of the hopper
const HATW = new Node(); HATW.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, 0, 0], [.4, .035, .4])); HATW.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, .02, 0], [.22, .2, .22])); HATW.add(new Node('cyl', { c: hex('#d8302c'), out: 0 }, [0, .03, 0], [.226, .045, .226])); HATW.s = [1.5, 1.5, 1.5]; scene.add(HATW);
const HAT0 = hero.hat.p.slice();
// ---------- timing ----------
const T_TGO = 0, T_STOPX = 4.8;
const TXa = t => t < 0 ? TXS : TXS + (TX2 - TXS) * eio(clamp(t / T_STOPX));
const T_WIND = WD.threw3 - .1, T_REL = WD.bag + .02, T_HIT = T_REL + .6;
const T_GRAB = P[4] + .05, T_LIFT = T_GRAB + .25, T_BREL = WD.bin + .02, T_BLAND = WD.fucking2 - .02, T_COPUP = P[4] + .35;
const T_RUN5 = P[5], T_LEAP = WD.himself + .05, T_IN = WD.in5 + .05;
const T_PULL = P[6] + .3, T_CRUSH = WD.crushed - .05, T_SUCK = T_CRUSH + .15;
const T_REACH = P[7] + .05, T_UP = WD.perfect + .05, T_TOSS = pend(7) - .55;
const T_ARR = WD.brought + .05, T_FLING = WD.back8 - .1, T_CLAND = T_FLING + .5, T_BFLING = T_FLING + .35, T_BLAND2 = T_BFLING + .45, T_HOPON = pend(8) - .35;
const T_PIGIN = WD.pigeon - .3, T_PIGLAND = WD.moved + .05, T_POP = WD.unfolded + .02;
const arc3 = (a, b, u, hgt) => { const p = lerp3(a, b, u); p[1] += Math.sin(u * Math.PI) * hgt; return p; };
function holdBag(m, side = 'R') { late.push(() => { BAGW.visible = true; BAGW.p = wp(side === 'R' ? m.armR.end : m.armL.end, [0, -.38, 0]); BAGW.r = [0, m.root.r[1], 0]; }); }
// ---------- intro / loop: he takes out the trash — the truck leaves ----------
function intro(t) { const h = hero; let face = 'grin'; gtT = t; setGT(TXa(t)); colRide(t, t > .3 && t < 2.2);
  h.root.p = HS.slice(); h.root.r = [0, 0, 0];
  if (t < -2.15) { face = 'grin'; h.root.r = [0, 1.9, 0]; h.body.p = [0, Math.abs(Math.sin(t * 6)) * .04, 0]; pose_(h, { sL: [-.3, 0, .5], sR: [-.3, 0, -.5] }); BAGW.visible = true; BAGW.p = BAGP.slice(); BAGW.r = [0, .4, 0]; }
  else if (t < -1.55) { const u = clamp((t + 2.15) / .3); h.root.r = [0, lerp(1.9, -1.2, u), 0]; h.body.r = [Math.sin(clamp((t + 2.15) / .6) * Math.PI) * .9, 0, 0]; pose_(h, { sR: [-.4 - u * .8, 0, -.2] }); face = 'neutral';
    if (t < -1.8) { BAGW.visible = true; BAGW.p = BAGP.slice(); BAGW.r = [0, .4, 0]; } else holdBag(h); }
  else if (t < -.25) { const u = clamp((t + 1.55) / .35); h.root.r = [0, lerp(-1.2, Math.PI / 2 - .2, eout(u)), 0]; pose_(h, { sR: [-2.6, 0, -.3], eR: [-.3, 0, 0], sL: [-.2, 0, .5] }); holdBag(h); face = 'grin'; h.body.p = [0, Math.abs(Math.sin(t * 5)) * .05, 0]; h.wob = .15; }
  else { const d = t + .25; const x = Math.min(HS[0] + d * 2.4 + d * d * .8, 1.8); const stop = HS[0] + d * 2.4 + d * d * .8 >= 1.8; h.root.p = [x, 0, lerp(HS[2], 1.6, clamp(d / 1.2))]; h.root.r = [0, Math.PI / 2 - .2, 0];
    if (!stop) { runPose(h, t, 22); pose_(h, { sR: [-1.6, 0, -.2], eR: [-.1, 0, 0] }); face = t > 0 ? 'wide' : 'grin'; }
    else { pose_(h, { sR: [-1.55, 0, -.15], eR: [-.05, 0, 0], sL: [-.3, 0, .6] }); h.body.r = [.25, 0, 0]; face = 'wide'; h.wob = .1; h.head.r = [.1, .25, 0]; if (t > WD.truck0 - .1) { h.body.r = [.32, 0, 0]; } }
    holdBag(h); }
  return face; }
function hideAll() { for (const m of [hero, cop, COL]) { resetPose(m); m.root.visible = false; m.root.s = [1, 1, 1]; m.body.s = [1, 1, 1]; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice(); resetPose(DRV); DRV.root.p = [2.55, .78, -.45]; DRV.root.r = [0, Math.PI / 2, 0]; DRV.body.p = [0, -.43, 0]; DRV.lL.r = [-1.5, 0, 0]; DRV.lR.r = [-1.5, 0, 0]; pose_(DRV, { sL: [-1.2, 0, .2], sR: [-1.2, 0, -.2] }); setFace(DRV, 'neutral');
  DON.visible = false; FHAT.visible = false; HATW.visible = false; BAGW.visible = false; BAGW.s = [1, 1, 1]; BINW.visible = true; BINW.p = BINP.slice(); BINW.r = [0, -.3, 0]; PEEL.visible = false; TRASH.forEach(q => q.visible = false); CUBE.visible = false; CUBE.s = [1, 1, 1]; CB.s = [1, 1, 1]; CB.p = [0, 0, 0]; CB.r = [0, 0, 0]; NEST.visible = false; SUIT.visible = false; PIG.g.visible = false; CHAT.visible = true;
  STRK.forEach(s => s.visible = false); puffs.forEach(p => p.visible = false); pcar.root.visible = false; BLADE.r = [0, 0, -1.25]; LEVER.r = [0, 0, 0]; BEACON.mat.em = .8; }
function copEat(t, pos, yaw) { cop.root.visible = true; cop.root.p = pos.slice(); cop.root.r = [0, yaw, 0]; DON.visible = true; pose_(cop, { sR: [-.25, 0, .95], eR: [-.4, 0, 2.2] }); setFace(cop, Math.sin(t * 9) > 0 ? 'half' : 'closed'); cop.head.r = [0, 0, Math.sin(t * 2) * .05]; }
function copBlind(t, pos, yaw) { cop.root.visible = true; cop.root.p = pos.slice(); cop.root.r = [0, yaw + Math.sin(t * 3) * .4, 0]; walkPose(cop, t, 7, .5); pose_(cop, { sL: [-1.5 + Math.sin(t * 5) * .3, 0, .5], sR: [-1.5 - Math.sin(t * 5) * .3, 0, -.5] }); cop.wob = .35;
  late.push(() => { BINW.visible = true; BINW.p = wp(cop.body, [0, 2.55, 0]); BINW.r = [Math.PI, cop.root.r[1], 0]; }); }
function cubeAt(pos, yaw = 0) { CUBE.visible = true; CUBE.p = pos.slice(); CUBE.r = [0, yaw, 0]; }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'squint'; gtT = t;
  BEACON.mat.em = Math.sin(t * 12) > 0 ? 1 : .3; lamp.visible = !(i >= 3 && i <= 7);
  if (i === 0) face = intro(t);
  // ---- L1: one second ----
  if (i === 1) { face = intro(t); setGT(TXa(t)); colRide(t, 1); const d = t - P[1]; h.root.p = [1.8, 0, 1.6]; h.root.r = [0, Math.PI / 2 - .2 - .6 * clamp(d * 3), 0];
    if (t < WD.fucking1 - .1) { face = 'wide'; pose_(h, { sR: [-1.55, 0, -.15], eR: [-.05, 0, 0] }); holdBag(h); h.body.r = [.32, 0, 0]; h.head.r = [0, 0, Math.sin(t * 40) * .05]; }
    else { const e = t - WD.fucking1; argue(h, t, 1.6, 2); h.root.p[1] = Math.abs(Math.sin(e * 9)) * .7; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .6; holdBag(h);
      if (e < .2) { h.root.p[1] = 0; h.body.p = [0, -.3 * Math.sin(e / .2 * Math.PI), 0]; } } }
  // ---- L2: chase ----
  if (i === 2) { setGT(TXa(t)); colRide(t, 0); const u = clamp((t - P[2]) / (pend(2) - P[2] - .1)); const x = lerp(1.8, HT[0], u); h.root.p = [x, 0, lerp(1.6, HT[2], clamp(u * 3))]; h.root.r = [0, Math.PI / 2, 0];
    wheelRun(h, t, 55, .6); pose_(h, { sR: [-2.6, 0, -.3], eR: [-.2, 0, 0] }); holdBag(h); face = 'squint'; h.wob = .5; dust(t, [x, 0, h.root.p[2]], 6, 16); late.push(() => stream(t, A3(h.root.p, [-.4, 1.5, 0]), [-1, 0, 0], 3.5, 0, 16, .8, 1.6, .5));
    if (u >= 1) { resetPose(h); h.root.p = HT.slice(); h.root.r = [0, Math.PI / 2, 0]; pose_(h, { sR: [-2.6, 0, -.3] }); holdBag(h); face = 'squint'; } }
  // ---- L3..L7 at the truck's next stop ----
  if (i >= 3 && i <= 7) { setGT(TX2, i === 6 && t > T_CRUSH && t < T_CRUSH + 1.0 ? 1 : 0); }
  if (i >= 3 && i <= 4) { COL.root.visible = true; COL.root.p = COLP.slice(); COL.root.r = [0, -Math.PI / 2 - .3, 0]; pose_(COL, { sL: [-.2, 0, .5], sR: [-.3, 0, -.3], eR: [-1.8, 0, 0] }); setFace(COL, Math.sin(t * 2) > 0 ? 'neutral' : 'half'); }
  if (i === 3) { h.root.p = HT.slice(); h.root.r = [0, Math.PI / 2 - .1, 0]; face = 'squint';
    if (t < T_WIND) { holdBag(h); pose_(h, { sR: [-2.6, 0, -.3] }); }
    else if (t < T_REL) { const u = clamp((t - T_WIND) / (T_REL - T_WIND)); h.root.r = [0, Math.PI / 2 - .1 + Math.sin(u * Math.PI) * 6.283 * u, 0]; pose_(h, { sR: [-1.6, 0, -1.4] }); holdBag(h); h.body.r = [0, 0, .2]; face = 'squint'; h.wob = .4; }
    else { pose_(h, { sR: [-2.3, 0, -.2], eR: [0, 0, 0] }); h.body.r = [.35, 0, 0]; face = t < T_HIT ? 'grin' : 'wide'; h.wob = .3;
      if (t < T_HIT) { const u = (t - T_REL) / (T_HIT - T_REL); BAGW.visible = true; BAGW.p = arc3(A3(HT, [.6, 2.6, -.1]), A3(CP, [0, 2.5, 0]), u, 2.6); BAGW.r = [u * 9, u * 4, 0]; }
      else { trash(T_HIT, t, A3(CP, [0, 2.2, 0])); burst(T_HIT, t, A3(CP, [0, 2.2, 0]), [.2, .25, .22], 0, 10, 1.2, 1.2); } }
    if (t < T_HIT) copEat(t, CP, .2);
    else { const e = t - T_HIT; cop.root.visible = true; DON.visible = e < .1; PEEL.visible = true; cop.root.p = CP.slice(); const f = clamp(e / .35); cop.root.r = [-eout(f) * 1.45, .2, 0]; cop.root.p[1] = Math.sin(f * Math.PI) * .4; pose_(cop, { sL: [-2.6, 0, 1.0], sR: [-2.6, 0, -1.0] }); cop.lL.r = [-1.2 * f, 0, -.4]; cop.lR.r = [-.3 * f, 0, .4]; setFace(cop, 'dizzy'); cop.wob = .4;
      BAGW.visible = false; for (let k = 0; k < 6; k++) { TRASH[k].visible = true; } trash(T_HIT, t, A3(CP, [0, 2.2, 0])); } }
  if (i === 4) { trash(T_HIT, t, A3(CP, [0, 2.2, 0])); const d = t - T_GRAB;
    // hero grabs the neighbor's bin and throws it
    h.root.p = HT.slice(); h.root.r = [0, Math.PI / 2 - .1, 0];
    if (d < 0) { face = 'squint'; }
    else if (t < T_LIFT) { const u = clamp(d / (T_LIFT - T_GRAB)); h.root.p = lerp3(HT, [16.3, 0, 1.95], u); h.root.r = [0, lerp(Math.PI / 2, 2.6, u), 0]; h.body.r = [u * .6, 0, 0]; pose_(h, { sL: [-1.3, 0, .2], sR: [-1.3, 0, -.2] }); face = 'squint'; }
    else if (t < T_BREL) { const u = clamp((t - T_LIFT) / (T_BREL - T_LIFT)); h.root.p = [16.3, 0, 1.95]; h.root.r = [0, lerp(2.6, Math.PI / 2 - .1, eout(u)), 0]; pose_(h, { sL: [-3.0, 0, .3], sR: [-3.0, 0, -.3], eL: [-.3, 0, 0], eR: [-.3, 0, 0] }); h.body.r = [-.25, 0, 0]; face = 'talksq'; h.wob = .3;
      late.push(() => { BINW.p = A3(wp(h.body, [0, 2.45, 0]), [0, 0, 0]); BINW.r = [0, h.root.r[1], .2]; }); }
    else { h.root.p = [16.3, 0, 1.95]; h.root.r = [0, Math.PI / 2 - .1, 0]; const e = t - T_BREL; pose_(h, { sL: [-2.2, 0, .3], sR: [-2.2, 0, -.3] }); h.body.r = [.4, 0, 0]; face = t < WD.fucking2 - .05 ? 'grin' : (Math.sin(t * 22) > 0 ? 'scream' : 'talksq');
      if (t > WD.fucking2 + .05) { argue(h, t, 1.5, 4); h.root.p[1] = Math.abs(Math.sin(t * 10)) * .5; h.wob = .6; }
      if (t < T_BLAND) { const u = (t - T_BREL) / (T_BLAND - T_BREL); BINW.p = arc3([16.6, 2.4, 1.9], [CP[0], 1.8, CP[2]], u, 2.4); BINW.r = [u * 3.14, u * 6, 0]; } }
    // cop gets up dizzy, then the bin lands on him
    PEEL.visible = true; cop.root.visible = true;
    if (t < T_COPUP) { cop.root.p = CP.slice(); cop.root.r = [-1.45, .2, 0]; setFace(cop, 'dizzy'); pose_(cop, { sL: [-2.6, 0, 1.0], sR: [-2.6, 0, -1.0] }); cop.lL.r = [-1.2, 0, -.4]; cop.lR.r = [-.3, 0, .4]; }
    else if (t < T_BLAND) { const u = clamp((t - T_COPUP) / .35); cop.root.p = CP.slice(); cop.root.r = [-1.45 * (1 - eback(u)), .2 + Math.sin(t * 6) * .3, Math.sin(t * 7) * .12 * u]; setFace(cop, 'dizzy'); pose_(cop, { sL: [-.6, 0, 1.2], sR: [-.6, 0, -1.2] }); cop.wob = .5; cop.head.r = [0, 0, Math.sin(t * 8) * .3]; }
    else { const e = t - T_BLAND; copBlind(t, A3(CP, [0, -Math.min(e, .15) * 2, Math.min(e, 1) * .3]), .2); if (e < .2) cop.body.p = [0, -.35 * Math.sin(e / .2 * Math.PI), 0]; burst(T_BLAND, t, A3(CP, [0, 1.4, 0]), [.85, .8, .72], 0, 8, 1.0, .8); } }
  if (i >= 5 && i <= 7) { PEEL.visible = false; const e = t - T_BLAND; const z = CP[2] + .3 - Math.min(e, 6) * .3; const bonk = 13.35; let pos = [CP[0] + Math.min(e, 4) * .6, 0, Math.max(z, -1.2)];
    if (t < bonk) copBlind(t, pos, .1); else { const f = clamp((t - bonk) / .3); copBlind(t, pos, .1); cop.root.r = [-eout(f) * 1.45, .1, 0]; cop.lL.r = [-1.1 * f, 0, -.3]; cop.lR.r = [-.4, 0, .3]; cop.wob = .2; } }
  // L5: he throws himself in
  if (i === 5) { COL.root.visible = true; COL.root.p = COLP.slice(); COL.root.r = [0, -Math.PI / 2 - .3, 0]; setFace(COL, t > T_LEAP ? 'wide' : 'neutral'); pose_(COL, { sL: [-.2, 0, .5], sR: [-.3, 0, -.3], eR: [-1.8, 0, 0] });
    const mouth = GTW([HOP[0] + .55, HOP[1], 0]);
    if (t < T_LEAP) { const u = clamp((t - T_RUN5) / (T_LEAP - T_RUN5)); const x = lerp(HT[0], 17.8, u); h.root.p = [x, 0, lerp(HT[2], 2.9, u)]; h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 50, .7); face = 'squint'; dust(t, [x, 0, h.root.p[2]], 8, 16); late.push(() => stream(t, A3(h.root.p, [-.4, 1.4, 0]), [-1, 0, 0], 3, 0, 14, .8, 1.6, .5)); }
    else if (t < T_IN) { const u = clamp((t - T_LEAP) / (T_IN - T_LEAP)); const st = [17.8, .4, 2.9], en = [mouth[0] - 1.7, mouth[1] - .1, TZ]; h.root.p = arc3(st, en, u, 1.0); h.root.r = [lerp(.2, Math.PI / 2, eout(u)), Math.PI / 2, 0]; pose_(h, { sL: [-3.0, 0, .2], sR: [-3.0, 0, -.2] }); h.lL.r = [.2, 0, 0]; h.lR.r = [.3, 0, 0]; face = 'grin'; h.wob = .5; }
    else { const e = t - T_IN; h.root.p = [mouth[0] - 2.4 + Math.min(e, .2) * 1.0, mouth[1] - .1, TZ]; h.root.r = [Math.PI / 2, Math.PI / 2, 0]; h.lL.r = [Math.sin(t * 20) * .7, 0, -.2]; h.lR.r = [-Math.sin(t * 20) * .7, 0, .2]; h.wob = .4; h.hat.visible = false; } }
  if (i === 6) { const mouth = GTW([HOP[0] + .55, HOP[1], 0]); const s = clamp((t - T_SUCK) / .25); h.root.p = [mouth[0] - 2.2 + s * 3.0, mouth[1] - .1, TZ]; h.root.r = [Math.PI / 2, Math.PI / 2, 0]; h.lL.r = [Math.sin(t * 24) * .8, 0, -.2]; h.lR.r = [-Math.sin(t * 24) * .8, 0, .2]; h.wob = .5; h.hat.visible = false; h.root.visible = s < 1;
    COL.root.visible = true; COL.root.p = COLP.slice(); const pl = clamp((t - T_PULL) / .25); COL.root.r = [0, lerp(-Math.PI / 2 - .3, Math.PI * .9, pl), 0]; pose_(COL, { sR: [-1.5 + pl * .9, 0, -.1], sL: [-.3, 0, .4] }); setFace(COL, t > T_CRUSH ? 'squint' : 'neutral'); COL.root.p = [COLP[0] + pl * .3, 0, COLP[2] + pl * .1];
    LEVER.r = [0, 0, t > T_CRUSH - .1 ? .9 : 0]; const b = clamp((t - T_CRUSH) / .35); BLADE.r = [0, 0, lerp(-1.25, .25, eio(b)) + (t > T_CRUSH + .35 ? Math.sin((t - T_CRUSH) * 18) * .12 * clamp(1 - (t - T_CRUSH - .35)) : 0)];
    if (t > T_CRUSH) { burst(T_CRUSH + .1, t, GTW([HOP[0] - .6, 2.3, 0]), [.55, .5, .45], 0, 12, 1.2, 1.8); const d = t - (T_CRUSH + .2); if (d > 0 && d < 1.1) { HATW.visible = true; HATW.p = GTW([HOP[0] - .2 - d * .4, 3.2 + 4.2 * d - 6.5 * d * d, .2]); HATW.r = [d * 8, d * 3, d * 6]; } } }
  if (i === 7) { BLADE.r = [0, 0, .25]; COL.root.visible = true; const mouthW = GTW([HOP[0] - .3, 1.6, -.6]); const r = clamp((t - T_REACH) / .25), u = clamp((t - T_UP) / .3);
    COL.root.p = [COLP[0] + .2, 0, COLP[2]]; COL.root.r = [0, lerp(Math.PI * .75, -2.3 + 6.283, eout(u)), 0];
    if (t < T_UP) { pose_(COL, { sL: [-1.6, 0, .3], sR: [-1.6, 0, -.3] }); COL.body.r = [r * .5, 0, 0]; setFace(COL, 'neutral'); }
    else if (t < T_TOSS) { pose_(COL, { sL: [-2.95, 0, .35], sR: [-2.95, 0, -.35], eL: [-.2, 0, 0], eR: [-.2, 0, 0] }); setFace(COL, t > WD.fucking3 ? 'grin' : 'wide'); COL.body.p = [0, Math.abs(Math.sin(t * 7)) * .06, 0];
      CFACE.mat.tex = t > WD.fucking3 - .05 && t < WD.fucking3 + .8 ? 'hero_scream' : 'hero_wide'; late.push(() => { cubeAt(A3(wp(COL.body, [0, 3.0, 0]), [0, .05, 0]), -2.3 + Math.sin(t * 3) * .1); CUBE.s = [1, 1, 1]; }); }
    else { const d = t - T_TOSS; const u2 = clamp(d / .45); COL.root.r = [0, lerp(-2.3, -3.8, u2), 0]; pose_(COL, { sL: [-2.2, 0, .3], sR: [-2.2, 0, -.3] }); setFace(COL, 'grin'); CFACE.mat.tex = 'hero_wide';
      if (u2 < 1) { cubeAt(arc3(A3(COLP, [0, 2.7, 0]), GTW([HOP[0] + .2, 1.6, 0]), u2, 1.8)); CUBE.r = [u2 * 6, u2 * 3, 0]; CUBE.s = [.95, .95, .95]; } } }
  // ---- L8: next week, it brings him back ----
  if (i === 8) { const a = clamp((t - P[8]) / (T_ARR - P[8])); const cx = lerp(-22, TXS, eout(a)); setGT(cx); BLADE.r = [0, 0, -1.25]; h.root.visible = false; CFACE.mat.tex = 'hero_wide';
    if (t < T_ARR + .02) colRide(t, 0);
    else if (t < T_HOPON) { const m = COL; m.root.visible = true; const j = clamp((t - T_ARR) / .25); m.root.p = lerp3(GTW([-3.85, .58, -.75]), [-.2, 0, 2.0], j); m.root.p[1] += Math.sin(j * Math.PI) * .5; m.root.r = [0, -Math.PI / 2 - .9, 0];
      const f = t > T_FLING - .15 && t < T_FLING + .1 || t > T_BFLING - .15 && t < T_BFLING + .1; pose_(m, f ? { sL: [-2.9, 0, .3], sR: [-2.9, 0, -.3] } : { sL: [-1.2, 0, .3], sR: [-1.2, 0, -.3] }); m.body.r = [f ? -.2 : .5, 0, 0]; setFace(m, 'grin'); }
    else colRide(t, 0);
    if (t > T_FLING) { const u = clamp((t - T_FLING) / (T_CLAND - T_FLING)); if (u < 1) { cubeAt(arc3(GTW([HOP[0] - .5, 1.9, -.6]), HS, u, 2.4)); CUBE.r = [0, CY + (1 - u) * 6.283 * 1.5, (1 - u) * 3.14]; }
      else { const e = t - T_CLAND; cubeAt(HS, CY); CUBE.p[1] = Math.abs(Math.sin(e * 10)) * .5 * Math.exp(-e * 5); const q = Math.exp(-e * 6) * Math.sin(e * 30) * .2; CB.s = [1 + q, 1 - q, 1 + q]; burst(T_CLAND, t, HS, [.85, .8, .72], 0, 8, .9, .8); } }
    if (t > T_BFLING) { const u = clamp((t - T_BFLING) / (T_BLAND2 - T_BFLING)); BAGW.visible = true; BAGW.p = u < 1 ? arc3(GTW([HOP[0] - .5, 1.9, -.6]), BAGP, u, 2.0) : BAGP.slice(); BAGW.r = u < 1 ? [u * 7, u * 2, 0] : [0, .4, 0]; } }
  if (i >= 9 && i <= 11) { setGT(TXS); colRide(t, 0); setFace(COL, Math.sin(t * 1.3) > 0 ? 'half' : 'neutral'); COL.head.r = [0, Math.sin(t * 4) * .15, 0]; h.root.visible = false; BAGW.visible = true; BAGW.p = BAGP.slice(); BAGW.r = [0, .4, 0]; cubeAt(HS, CY); }
  if (i === 9) { CFACE.mat.tex = Math.sin(t * 3.3) > .85 ? 'hero_closed' : 'hero_half';
    const cx = 4.6 - (t - P[9]) * 3.6; copBlind(t, [cx, 0, 2.05], -Math.PI / 2); }
  if (i === 10) { CFACE.mat.tex = t > T_PIGLAND + .2 ? 'hero_up' : 'hero_half'; 
    const top = A3(HS, [-.1, 1.02, -.15]);
    if (t < T_PIGLAND) { const u = clamp((t - T_PIGIN) / (T_PIGLAND - T_PIGIN)); setPig(PIG, arc3([HS[0] + 5, 4.5, HS[2] + 3], top, eout(u), .6), -2.3, 1, t, .3); SUIT.visible = true; SUIT.p = A3(PIG.g.p, [0, -.2, 0]); }
    else { const e = t - T_PIGLAND; setPig(PIG, top.slice(), .4 + Math.sin(e * 2) * .3, 0, t); NEST.visible = e > .45; NEST.s = [1, 1, 1].map(v => v * eback(clamp((e - .45) / .2))); SUIT.visible = true; SUIT.p = A3(HS, [.2, 1.02, .1]); SUIT.r = [0, .3, 0]; PIG.head.r = [Math.max(0, Math.sin(t * 9)) * .5, 0, 0]; } }
  if (i === 11) { const top = A3(HS, [-.1, 1.02, -.15]); const d = t - T_POP;
    if (d < 0) { CFACE.mat.tex = 'hero_squint'; const q = Math.sin(t * 60) * .03 * clamp((t - P[11]) * 3); CB.s = [1 + q, 1 - q, 1 + q]; CB.p = [Math.sin(t * 50) * .02, 0, 0]; setPig(PIG, top, .4, 0, t); PIG.head.r = [-.3, 0, 0]; NEST.visible = true; SUIT.visible = true; SUIT.p = A3(HS, [.2, 1.02, .1]); }
    else { CUBE.visible = false; burst(T_POP, t, A3(HS, [0, .6, 0]), [.95, .9, .8], 0, 14, 1.4, 1.4);
      setPig(PIG, A3(top, [d * 3, d * 7 - d * d * 4, d * 1.5]), .4 + d * 6, 1, t, -.6); SUIT.visible = true; SUIT.p = A3(HS, [-.05 - d * 2, Math.max(0, 1.0 + 3 * d - 9 * d * d), .2 + d * 2]); SUIT.r = [d * 8, 0, d * 5];
      h.root.visible = true; h.root.p = HS.slice(); h.root.r = [0, 0, 0]; const u = clamp(d / .3); h.root.s = [lerp(1.6, 1, eback(u)), lerp(.25, 1, eback(u)), lerp(1.6, 1, eback(u))]; h.root.p[1] = Math.sin(clamp(d / .4) * Math.PI) * .6;
      pose_(h, { sL: [-.3, 0, 2.6 - u * 1.8], sR: [-.3, 0, -2.6 + u * 1.8] }); h.lL.r = [0, 0, -1.2 * (1 - u)]; h.lR.r = [0, 0, 1.2 * (1 - u)]; face = d < .35 ? 'wide' : 'grin'; h.wob = .6;
      if (d > .6) { h.root.p[1] = 0; pose_(h, { sL: [-.3, 0, .5], sR: [-.3, 0, -.5] }); h.body.p = [0, Math.abs(Math.sin(t * 6)) * .04, 0]; } } }
  if (i === 12) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, COL]) if (m.root.visible) applyNoodle(m, t); applyNoodle(DRV, t); late.forEach(f => f()); return L; }
