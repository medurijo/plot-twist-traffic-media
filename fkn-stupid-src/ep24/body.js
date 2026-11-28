// ===================== EP24 scene: THE BIRD POOP =====================
R.mesh('mound', Geo.lathe([[1e-4, 0], [.5, 0], [.47, .1], [.4, .3], [.29, .58], [.16, .84], [.05, .97], [1e-4, 1]], 28));
const HAT0 = hero.hat.p.slice();
lamp.p = [2.2, 0, 1.4]; lamp.r = [0, Math.PI / 2, 0];
const PERCH = [2.2, 4.93, 2.25];
const CARP = [2.0, 0, 3.0], CP2 = [2.6, 0, 7.6], POL = [4.05, 0, 1.5], HB = [5.7, 0, 5.85], HBN = [6.6, 0, 8.6], COPP = [8.5, 0, 9.5];
const len3 = v => Math.hypot(v[0], v[1], v[2]);
const RED = hex('#d8483c'), GREY = hex('#a9aeb6');
// trees/bush near the yard cameras
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] - 4.3) < .01 && n.p[2] < -3 && n.p[2] > -6 && n.children && n.children.length === 3) n.visible = false; });
// ---------- bird ----------
const BIRD = new Node(); BIRD.add(B('#3a3a44', [0, 0, 0], [.16, .14, .3], { out: .006 })); BIRD.add(B('#f0b23a', [0, 0, .19], [.06, .05, .1], { out: 0 })); BIRD.add(B('#ffffff', [.05, .05, .1], [.03, .04, .03], { out: 0 })); BIRD.add(B('#ffffff', [-.05, .05, .1], [.03, .04, .03], { out: 0 }));
const BW1 = B('#2a2a34', [-.16, .02, 0], [.3, .02, .16], { out: 0 }), BW2 = B('#2a2a34', [.16, .02, 0], [.3, .02, .16], { out: 0 }); BIRD.add(BW1); BIRD.add(BW2); BIRD.add(B('#2a2a34', [0, .02, -.2], [.1, .02, .14], { out: 0 })); BIRD.s = [1.7, 1.7, 1.7]; scene.add(BIRD);
function setBird(p, yaw, t, flap = 1, pitch = 0) { BIRD.visible = true; BIRD.p = p.slice(); BIRD.r = [pitch, yaw, 0]; const a = flap ? Math.sin(t * 30) * .9 : 0; BW1.r = [0, 0, a]; BW2.r = [0, 0, -a]; }
function birdFly(t, t0, t1, a, b, hop = 1.5) { const u = clamp((t - t0) / (t1 - t0)); const e = eio(u); setBird([lerp(a[0], b[0], e), lerp(a[1], b[1], e) + Math.sin(u * Math.PI) * hop, lerp(a[2], b[2], e)], yawOf(a, b), t, u < 1); return u; }
// ---------- convertible ----------
function mkConv(col) { const c = car({ body: col, stripe: '#f4f1e8' }); scene.add(c.root); c.root.children[1].visible = false; c.l1.visible = c.l2.visible = false;
  c.root.add(B('#2a2a30', [0, .9, -.4], [1.6, .12, 1.4])); c.root.add(B('#2a2a30', [0, 1.2, -1.05], [1.6, .55, .12])); c.root.add(new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [.42, 1.12, .35], [.36, .04, .36], [-.9, 0, 0]));
  for (const sx of [-.7, .7]) c.root.add(B('#fff1b8', [sx, .62, 2.16], [.32, .16, .04], { em: .8, out: 0 })); c.body = c.root.children[0]; c.stripe = c.root.children[7]; return c; }
const HCAR = mkConv('#d8483c'), NCAR = mkConv('#d8483c');
const SEAT = new Node(null, null, [.42, .44, -.3]); HCAR.root.add(SEAT);
function setCar(c, p, yaw = Math.PI / 2) { c.root.visible = true; c.root.p = p.slice(); c.root.r = [0, yaw, 0]; c.root.s = [1, 1, 1]; }
const drive = h => { sitPose(h); pose_(h, { sL: [-1.25, 0, .15], sR: [-1.25, 0, -.15], eL: [-.4, 0, 0], eR: [-.4, 0, 0] }); };
// poop on the hood (child of the car) + falling drop
const DM = c => ({ c: hex(c), out: .006, spec: .35, rim: .2 });
function mkPoop(s = 1) { const n = new Node(); n.add(new Node('mound', DM('#f4f2ea'), [0, 0, 0], [.34 * s, .1 * s, .28 * s])); n.add(new Node('mound', DM('#fbfaf6'), [.02, .06 * s, 0], [.16 * s, .09 * s, .14 * s])); n.add(B('#6a6a5a', [-.05 * s, .02 * s, .05 * s], [.06 * s, .03 * s, .05 * s], { out: 0 })); for (let k = 0; k < 4; k++) n.add(new Node('mound', DM('#f4f2ea'), [Math.cos(k * 1.7) * .22 * s, 0, Math.sin(k * 1.7) * .18 * s], [.07 * s, .03 * s, .07 * s])); return n; }
const POOP = mkPoop(); POOP.p = [.25, .875, 1.2]; HCAR.root.add(POOP);
const DROP = new Node('mound', DM('#f4f2ea'), [0, 0, 0], [.09, .16, .09]); scene.add(DROP);
function dropFall(t, t0, a, b) { const d = t - t0; if (d < 0) return 0; const u = clamp(d / .4); if (u < 1) { DROP.visible = true; DROP.p = lerp3(a, b, u * u); DROP.r = [0, 0, Math.PI]; } return u; }
// foam
const FOAM = []; for (let k = 0; k < 26; k++) { const n = new Node('mound', { c: [1, 1, 1], em: .25, out: 0, spec: .5, rim: .3 }, [(hsh(k, 1) - .5) * 1.9, .7 + hsh(k, 2) * .35, (hsh(k, 3) - .5) * 4.2], [.5, .3, .5]); n.visible = false; HCAR.root.add(n); FOAM.push(n); }
// red paint puddle
const PUD = new Node('cyl', { c: RED, out: 0, spec: .6, rim: .2, noShadow: 1 }, [CARP[0], .01, CARP[2]], [3.2, .01, 2.0]); scene.add(PUD);
// pressure washer: gun + wand on the hero's body, tank on his back
const WASH = new Node(null, null, [.18, 1.18, .28]); WASH.add(B('#f0c44a', [0, 0, 0], [.2, .24, .42], { out: .01 })); WASH.add(B('#2a2a30', [0, -.17, -.05], [.08, .16, .08])); WASH.add(new Node('cyl', { c: hex('#2a2a30'), out: .008, spec: .6 }, [0, .02, .75], [.05, .55, .05], [Math.PI / 2, 0, 0]));
WASH.add(B('#e3263a', [0, .02, 1.3], [.1, .1, .1], { out: .01 })); const WTIP = new Node(null, null, [0, .02, 1.38]); WASH.add(WTIP); hero.body.add(WASH);
const TANK = new Node(null, null, [0, 1.3, -.32]); TANK.add(new Node('cyl', { c: hex('#f0c44a'), out: .01, spec: .4 }, [0, 0, 0], [.42, .32, .42])); TANK.add(B('#2a2a30', [0, .34, 0], [.14, .08, .14])); TANK.add(B('#e3263a', [0, 0, .21], [.3, .1, .02], { out: 0 })); hero.body.add(TANK);
// rag + hammer in the hand
const RAG = B('#4a8ad8', [0, -.12, .05], [.22, .08, .22], { out: .01 }); hero.armR.end.add(RAG);
const HAM = new Node(null, null, [0, -.1, 0]); HAM.add(B('#8a5a3a', [0, -.05, .2], [.05, .05, .42])); HAM.add(B('#5a5e66', [0, -.05, .42], [.12, .12, .24], { spec: .7 })); hero.armR.end.add(HAM);
// ticket + notepad
texC('ticket', 128, 192, (x, w, h) => { x.fillStyle = '#fff3a8'; x.fillRect(0, 0, w, h); x.fillStyle = '#e3263a'; x.fillRect(0, 0, w, 34); x.fillStyle = '#fff'; x.font = '900 24px "Inter Display"'; x.textAlign = 'center'; x.fillText('TICKET', w / 2, 26); x.fillStyle = '#1b1b20'; for (let k = 0; k < 6; k++) x.fillRect(14, 54 + k * 20, 60 + (k * 37) % 40, 5); x.font = '900 34px "Inter Display"'; x.fillText('$$$', w / 2, 178); });
const TKT = new Node('quad', { c: [1, 1, 1], tex: 'ticket', spec: 0, rim: 0, out: 0 }, [0, 0, 0], [.4, .58, 1]); scene.add(TKT);
const PAD = B('#fff3a8', [0, -.14, .06], [.2, .26, .03], { out: .01 }); cop.armL.end.add(PAD);
// neighbor
const NB = man({ id: 'nb', shape: 'can', seed: 7, skin: '#e8b48f', shirt: '#8a6aa8', stripe: '#7a5a98', pants: '#3a3a44', shoe: '#e9e4d4', hair: '#6b4a36' }); scene.add(NB.root);
const NBSH = NB.torso.mat.c.slice(), NBP0 = [-4.2, 0, -.35];
// carport (posts pivot at the base)
const CPORT = new Node(); CPORT.p = CP2.slice(); scene.add(CPORT); const POSTS = [];
for (const [x, z] of [[2.5, -1.25], [2.5, 1.25], [-2.5, -1.25], [-2.5, 1.25]]) { const pv = new Node(null, null, [x, 0, z]); pv.add(B('#c9a06a', [0, 1.45, 0], [.16, 2.9, .16], { out: .01 })); pv.add(B('#a8744a', [0, .05, 0], [.3, .1, .3])); CPORT.add(pv); POSTS.push(pv); }
const ROOF = new Node(null, null, [0, 2.95, 0]); ROOF.add(B('#a8744a', [0, 0, 0], [5.5, .14, 3.1], { out: .01 })); for (let k = 0; k < 8; k++) ROOF.add(B('#94643e', [-2.6 + k * .74, .08, 0], [.06, .03, 3.1], { out: 0 })); ROOF.add(B('#7a5236', [0, -.12, 1.25], [5.4, .14, .12])); ROOF.add(B('#7a5236', [0, -.12, -1.25], [5.4, .14, .12])); CPORT.add(ROOF);
const RPOOP = mkPoop(.8); RPOOP.p = [.5, .08, -.2]; ROOF.add(RPOOP);
const PANC = B('#8a8e96', [CP2[0], .02, CP2[2]], [4.6, .04, 2.2], { out: 0 }); scene.add(PANC);
// ---------- poses ----------
const polish = (h, t) => { const a = t * 9; pose_(h, { sR: [-1.15 + Math.sin(a) * .25, 0, -.2 + Math.cos(a) * .35], eR: [-.4, 0, 0], sL: [.1, 0, .9], eL: [-1.6, 0, 0] }); h.body.r = [.32, 0, 0]; h.head.r = [.15, 0, 0]; };
const proud = h => { pose_(h, { sL: [.1, 0, .9], eL: [-1.6, 0, 0], sR: [-2.8, 0, -.4], eR: [-.4, 0, 0] }); };
const sprayPose = (h, t, k = 1) => { pose_(h, { sR: [-1.35, 0, -.05], eR: [-.2, 0, 0], sL: [-1.3, 0, .35], eL: [-.5, 0, 0] }); h.body.r = [-.12 * k, 0, 0]; h.wob = .3; };
const hammerPose = (h, t) => { const a = Math.sin(t * 22); pose_(h, { sR: [-1.9 - a * .7, 0, -.2], eR: [-.6 - a * .4, 0, 0], sL: [-1.0, 0, .4], eL: [-.8, 0, 0] }); h.body.r = [.15 + a * .05, 0, 0]; h.wob = .25; };
function lookUp(m, k = 1) { m.head.r = [-.45 * k, 0, 0]; }
// ---------- timing ----------
const T_SPL0 = WD.pooped0 + .1, T_SPL3 = WD.pooped3 + .3, T_FUCK = WD.fucking1, T_HIT = WD.neighbor + .15, TC = WD.fucking2 + .05, T_TK = WD.ticket + .1, T_DROPC = P[13] + .25, T_IMP = T_DROPC + .4;
const BUILD = [P[7] + .15, P[7] + .4, P[7] + .65, P[7] + .9, WD.roof7 + .25];
const RPOS = [CP2[0] + .5, CP2[1] + 2.95 + .2, CP2[2] - .2];
// car slide during the spray
function slide(t) { const u = clamp((t - T_FUCK - .1) / 1.1); const e = eout(u); return { p: [lerp(CARP[0], CP2[0], e), Math.sin(u * Math.PI) * .5, lerp(CARP[2], CP2[2], e)], yaw: Math.PI / 2 + e * Math.PI * 2, u }; }
// ---------- loop intro: drive the new car under the bird, hop out, polish ----------
const TI0 = P[14] - T_END, TI1 = -1.75, TI2 = -1.35;
function intro(t) { const h = hero; setBird(PERCH, -2.2, t, 0); BIRD.r = [0, -2.2, Math.sin(t * 2) * .1];
  if (t < TI1) { const u = eio(clamp((t - TI0) / (TI1 - TI0))); setCar(HCAR, [lerp(-7, CARP[0], eout(u)), 0, CARP[2]], Math.PI / 2 + Math.sin(u * Math.PI) * .12); h.root.p = wp(SEAT); h.root.r = HCAR.root.r.slice(); drive(h); return 'grin'; }
  setCar(HCAR, CARP); if (t < TI2) { const u = (t - TI1) / (TI2 - TI1); const a = wp(SEAT); h.root.p = [lerp(a[0], POL[0], u), lerp(a[1], 0, u) + Math.sin(u * Math.PI) * 1.0, lerp(a[2], POL[2], u)]; h.root.r = [0, lerp(Math.PI / 2, 0, u), 0]; pose_(h, { sL: [-2.6, 0, .6], sR: [-2.6, 0, -.6] }); h.lL.r = [-.8, 0, 0]; h.lR.r = [.5, 0, 0]; return 'grin'; }
  h.root.p = POL.slice(); h.root.r = [0, 0, 0]; polish(h, t); RAG.visible = true; let f = Math.sin(t * 3) > .6 ? 'closed' : 'grin';
  if (t > WD.pooped0 - .3) { const u = dropFall(t, WD.pooped0 - .3, PERCH, wp(POOP)); if (u >= 1) { DROP.visible = false; POOP.visible = true; f = 'wide'; const d = t - T_SPL0; pose_(h, { sR: [-1.2, 0, -.2], eR: [-.3, 0, 0] }); h.body.r = [.32, 0, 0]; h.head.r = [.3, 0, 0]; if (d < .5) burst(T_SPL0, t, wp(POOP), [1, 1, 1], 0, 6, .35, 1.4); } }
  return f; }
function hideAll() { for (const m of [hero, cop, NB]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice(); hero.hat.r = [0, 0, -.32]; puffs.forEach(p => p.visible = false); STRK.forEach(s => { s.visible = false; s.mat.c = [.85, .93, 1]; });
  for (const c of [HCAR, NCAR]) { c.root.visible = false; c.root.s = [1, 1, 1]; c.body.mat.c = RED.slice(); c.stripe.visible = true; } POOP.visible = false; DROP.visible = false; FOAM.forEach(f => f.visible = false); PUD.visible = false; WASH.visible = TANK.visible = false; RAG.visible = HAM.visible = false;
  TKT.visible = false; PAD.visible = false; DON.visible = false; CPORT.visible = false; ROOF.p = [0, 2.95, 0]; ROOF.r = [0, 0, 0]; POSTS.forEach(p => { p.r = [0, 0, 0]; p.s = [1, 1, 1]; p.visible = true; }); ROOF.s = [1, 1, 1]; RPOOP.visible = false; PANC.visible = false; BIRD.visible = false; pcar.root.visible = false; NB.torso.mat.c = NBSH.slice(); }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  if (i === 0) face = intro(t);
  // L1: one tiny drop
  if (i === 1) { setCar(HCAR, CARP); POOP.visible = true; h.root.p = A3(POL, [-.2, 0, .25]); h.root.r = [0, -.25, 0]; h.body.r = [.55, 0, 0]; h.body.p = [0, -.15, 0]; h.head.r = [.35, 0, 0]; pose_(h, { sR: [-1.0, 0, -.1], eR: [-.5, 0, 0], sL: [-.3, 0, .4] }); RAG.visible = true;
    face = Math.sin(t * 30) > .3 && t > P[1] + .6 ? 'squint' : 'wide'; const tb = P[1] + .3; if (t < tb) setBird(PERCH, -2.2, t, 0); else birdFly(t, tb, tb + 1.0, PERCH, [-6, 9, -3], 1); }
  // L2: washes the whole car (zooms around it)
  if (i === 2) { setCar(HCAR, CARP); const t0 = P[2] + .1, t1 = WD.car2 + .45; const k = clamp((t - t0) / (t1 - t0)); POOP.visible = t < WD.whole2;
    FOAM.forEach((f, j) => { const on = k > j / 30 && t < t1 + .05; f.visible = on; const s = .3 + .35 * clamp((k - j / 30) * 4); f.s = [s * 1.4, s, s * 1.4]; });
    if (t < t1) { const a = (t - t0) * 11; h.root.p = [CARP[0] + Math.cos(a) * 3.1, 0, CARP[2] + Math.sin(a) * 2.25]; h.root.r = [0, -a + Math.PI, 0]; wheelRun(h, t, 60, .5); pose_(h, { sR: [-1.6, 0, -.6], eR: [-.3, 0, 0] }); RAG.visible = true; face = 'grin';
      late.push(() => stream(t, A3(h.root.p, [0, 1.3, 0]), [-Math.sin(-a + Math.PI), 0, -Math.cos(-a + Math.PI)], 2.5, 0, 14, .7, 2, .45)); }
    else { h.root.p = POL.slice(); h.root.r = [0, .3, 0]; proud(h); face = 'grin'; burst(t1, t, [CARP[0], 1, CARP[2]], [1, 1, 1], 0, 16, 2.2, 1.2); } }
  // L3: the bird comes back... same spot
  if (i === 3) { setCar(HCAR, CARP); h.root.p = POL.slice(); h.root.r = [0, .3, 0]; const tl = P[3] + 1.0;
    if (t < tl) birdFly(t, P[3] - .1, tl, [-7, 8, -2], PERCH, 1); else setBird(PERCH, -2.2, t, 0, t > WD.pooped3 - .1 && t < WD.pooped3 + .3 ? -.4 : 0);
    if (t < T_SPL3) { proud(h); h.head.r = [0, 0, Math.sin(t * 3) * .1]; face = t > tl ? 'worry' : 'grin'; if (t > tl) lookUp(h, .6); if (t > WD.pooped3 - .1) { dropFall(t, WD.pooped3 - .1, PERCH, wp(POOP)); } }
    else { POOP.visible = true; const d = t - T_SPL3; if (d < .5) burst(T_SPL3, t, wp(POOP), [1, 1, 1], 0, 6, .35, 1.4); face = d < .9 ? 'wide' : (Math.sin(t * 34) > 0 ? 'squint' : 'wide'); pose_(h, { sL: [-2.7, 0, .6], sR: [-2.7, 0, -.6], eL: [-1.4, 0, 0], eR: [-1.4, 0, 0] }); h.head.r = [.25, 0, 0]; h.wob = .3; if (d > .9) h.root.p = A3(POL, [n1(t * 40) * .04, 0, 0]); } }
  // L4: FUCKING pressure washer
  if (i === 4) { WASH.visible = TANK.visible = true; const pop = clamp((t - P[4]) / .2); WASH.s = TANK.s = [pop, pop, pop].map(v => eback(v) || .01);
    if (t < T_FUCK) { setCar(HCAR, CARP); POOP.visible = true; h.root.p = POL.slice(); h.root.r = [0, 0, 0]; sprayPose(h, t, 0); face = 'squint'; setBird(PERCH, -2.2, t, 0); }
    else { const s = slide(t); setCar(HCAR, s.p, s.yaw); POOP.visible = s.u < .15; if (s.u > .5) { HCAR.body.mat.c = lerp3(RED, GREY, clamp((s.u - .5) * 2)); HCAR.stripe.visible = s.u < .8; } PUD.visible = s.u > .2; PUD.s = [3.2 * clamp(s.u * 1.5), .01, 2.0 * clamp(s.u * 1.5)];
      const rc = eout(clamp((t - T_FUCK) / .6)); h.root.p = [POL[0] + n1(t * 50) * .06, 0, POL[2] - rc * 1.1]; h.root.r = [0, n1(t * 30) * .08, 0]; sprayPose(h, t, 1); face = Math.sin(t * 24) > 0 ? 'scream' : 'talksq'; h.hat.p = A3(HAT0, [0, Math.abs(Math.sin(t * 20)) * .06, 0]);
      const tip = wp(WTIP), car_ = HCAR.root.p; late.push(() => stream(t, tip, sub(A3(car_, [0, .8, 0]), tip), Math.max(1, len3(sub(car_, tip))), 0, 40, .35, 3, .75)); burst(T_FUCK + .05, t, A3(CARP, [0, .8, -.9]), [.85, .93, 1], 0, 16, 1.6, 1.8);
      setBird(A3(PERCH, [0, Math.abs(Math.sin(t * 10)) * .3, 0]), -2.2, t, 1); } }
  // L5: the paint is gone
  if (i === 5) { setCar(HCAR, CP2); HCAR.body.mat.c = GREY.slice(); HCAR.stripe.visible = false; PUD.visible = true; WASH.visible = TANK.visible = true; h.root.p = A3(POL, [0, 0, -1.1]); h.root.r = [0, -.25, 0]; sprayPose(h, t, 0); pose_(h, { sR: [-.9, 0, -.1] }); face = 'wide'; h.head.r = [0, 0, .15]; setBird(PERCH, -2.2, t, 0); }
  // L6: and the neighbor
  if (i === 6) { setCar(HCAR, CP2); HCAR.body.mat.c = GREY.slice(); HCAR.stripe.visible = false; PUD.visible = true; WASH.visible = TANK.visible = true; setBird(PERCH, -2.2, t, 0);
    const hp = A3(POL, [0, 0, -1.1]); h.root.p = hp; const tt = clamp((t - P[6]) / .25); h.root.r = [0, lerp(-.25, -Math.PI / 2 + .1, eout(tt)), 0]; sprayPose(h, t, 1); face = t > T_HIT - .2 ? 'grin' : 'squint';
    NB.root.visible = true; if (t < T_HIT) { const u = clamp((t - P[6]) / (T_HIT - P[6])); NB.root.p = [lerp(NBP0[0], -1.6, u), 0, NBP0[2]]; NB.root.r = [0, Math.PI / 2, 0]; walkPose(NB, t, 9, .7); phonePose(NB); setFace(NB, 'talk'); }
    else { const d = t - T_HIT, u = clamp(d / .9); NB.root.p = [lerp(-1.6, -13, u), Math.sin(u * Math.PI) * 2.6, NBP0[2] + u * 1.2]; NB.root.r = [d * 9, Math.PI / 2, d * 4]; pose_(NB, { sL: [-2.9, 0, .8], sR: [-2.9, 0, -.8] }); NB.lL.r = [-1.2, 0, 0]; NB.lR.r = [.6, 0, 0]; NB.wob = .6; setFace(NB, 'scream'); NB.torso.mat.c = lerp3(NBSH, [.95, .95, .93], clamp(d * 3)); }
    if (t > T_HIT - .35) { const tip = wp(WTIP), tg = NB.root.p; late.push(() => stream(t, tip, sub(A3(tg, [0, 1.3, 0]), tip), Math.max(1, len3(sub(tg, tip))), 0, 40, .35, 3, .75)); }
    if (t > T_HIT) burst(T_HIT, t, [-1.6, 1.4, NBP0[2]], [.85, .93, 1], 0, 16, 1.4, 1.6); }
  // L7: builds a roof over the car
    if (i >= 7 && i <= 12) { setCar(HCAR, CP2); HCAR.body.mat.c = GREY.slice(); HCAR.stripe.visible = false; CPORT.visible = true; PUD.visible = true; }
  if (i === 7) { h.root.p = HB.slice(); h.root.r = [0, yawOf(HB, [CP2[0] + 2.5, 0, CP2[2] - 1.25]), 0]; HAM.visible = true; hammerPose(h, t); face = 'squint'; setBird(PERCH, -2.2, t, 0);
    POSTS.forEach((p, k) => { const u = clamp((t - BUILD[k]) / .18); p.visible = u > 0; p.s = [1, eback(u) || .01, 1]; if (u > 0 && u < 1) burst(BUILD[k], t, A3(CP2, [p.p[0], .1, p.p[2]]), [.85, .8, .72], k * 3, k * 3 + 3, .5, .8); });
    const ur = clamp((t - BUILD[4]) / .2); ROOF.visible = ur > 0; ROOF.p = [0, 2.95 + (1 - ur) * 2, 0]; if (t > BUILD[4] + .3) { face = 'grin'; proud(h); HAM.visible = false; } }
  // L8: the bird lands on the roof
  if (i === 8) { h.root.p = HBN.slice(); h.root.r = [0, .5, 0]; lookUp(h); face = 'worry'; pose_(h, { sL: [.1, 0, .9], eL: [-1.6, 0, 0] });
    const u = birdFly(t, P[8] + .1, WD.roof8 + .1, PERCH, RPOS, 1.2); if (u >= 1) { setBird(RPOS, -1.4, t, 0); ROOF.p = [0, 2.95 - .04 * Math.max(0, Math.sin((t - WD.roof8) * 20)) * Math.exp(-(t - WD.roof8) * 4), 0]; } }
  // L9: one tiny drop... and the whole FUCKING roof collapsed
  if (i === 9) { h.root.p = HBN.slice(); h.root.r = [0, .5, 0]; if (t < TC) { setBird(RPOS, -1.4, t, 0, t > WD.tiny9 - .1 && t < WD.tiny9 + .3 ? -.4 : 0); RPOOP.visible = t > WD.drop9; lookUp(h); face = t > WD.drop9 ? 'wide' : 'worry'; pose_(h, { sL: [.1, 0, .9], eL: [-1.6, 0, 0] });
      const sag = clamp((t - WD.drop9) / (TC - WD.drop9)); ROOF.p = [0, 2.95 - sag * .12 - Math.max(0, Math.sin(t * 25)) * .03 * sag, 0]; ROOF.r = [0, 0, sag * .03]; POSTS.forEach((p, k) => p.r = [0, 0, (k < 2 ? -1 : 1) * sag * .05]); }
    else { const d = t - TC, u = clamp(d / .3); POSTS.forEach((p, k) => p.r = [(k % 2 ? 1 : -1) * eout(u) * .3, 0, (k < 2 ? -1 : 1) * eout(u) * 1.35]); ROOF.p = [0, lerp(2.83, .62, u * u) + (u >= 1 ? Math.abs(Math.sin(d * 14)) * Math.exp(-d * 5) * .3 : 0), 0]; ROOF.r = [0, 0, -.05 * u]; RPOOP.visible = true;
      HCAR.root.s = [1 + .08 * u, lerp(1, .38, u), 1 + .06 * u]; burst(TC + .25, t, A3(CP2, [0, .4, 0]), [.85, .8, .72], 0, 16, 3, 1); setBird(A3(RPOS, [0, .4 + Math.sin(d * 3) * .15, 0]), -1.4, t, 1);
      face = 'scream'; pose_(h, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7], eL: [-.4, 0, 0], eR: [-.4, 0, 0] }); h.wob = .5; const j = clamp(d / .4); h.root.p = A3(HBN, [j * .4, Math.sin(j * Math.PI) * .7, j * .4]); h.root.r = [0, .45, 0]; if (d > .1) { const hu = clamp((d - .1) / .5); hero.hat.p = A3(HAT0, [hu * .3, Math.sin(hu * Math.PI) * 1.4, 0]); } } }
  if (i >= 10 && i <= 12) { HCAR.root.s = [1.08, .38, 1.06]; POSTS.forEach((p, k) => { if (i > 9) p.r = [(k % 2 ? 1 : -1) * .3, 0, (k < 2 ? -1 : 1) * 1.35]; }); if (i > 9) { ROOF.p = [0, .62, 0]; ROOF.r = [0, 0, -.05]; } RPOOP.visible = true; }
  // L10-L12: the cop
  const HB2 = A3(HBN, [.4, 0, .4]);
  if (i >= 10 && i <= 12) { h.root.p = HB2.slice(); h.root.r = [0, .45, 0]; hero.hat.p = A3(HAT0, [.05, -.02, 0]); hero.hat.r = [0, 0, -.7]; face = 'dizzy'; }
  if (i === 10) { const ts = WD.running + .45; cop.root.visible = true; DON.visible = true;
    if (t < ts) { const u = clamp((t - P[10]) / (ts - P[10])); cop.root.p = [lerp(-20, COPP[0], u), 0, COPP[2]]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 80, .75); setFace(cop, 'squint'); late.push(() => stream(t, A3(cop.root.p, [-.5, 1.3, 0]), [-1, 0, 0], 5, 0, 20, .9, 2.5, .55)); dust(t, cop.root.p, 8, 16); }
    else { const d = t - ts; cop.root.p = COPP.slice(); cop.root.r = [-.25 * Math.exp(-d * 6) * Math.cos(d * 20), Math.PI / 2 - lerp(0, 2.2, clamp(d / .3)), 0]; setFace(cop, 'squint'); pose_(cop, { sR: [-1.3, 0, -.2], eR: [-1.0, 0, 0] }); burst(ts, t, COPP, [.85, .8, .72], 0, 10, .8, .5); }
    setBird(A3(RPOS, [0, .5 + Math.sin(t * 3) * .15, 0]), -1.4, t, 1); }
  const CYAW = -.75;
  if (i === 11 || i === 12) { cop.root.visible = true; cop.root.p = COPP.slice(); cop.root.r = [0, CYAW, 0]; const tb = P[11] + .2;
    if (i === 11 && t < tb + .5) { const u = birdFly(t, P[11] - .2, tb + .5, A3(RPOS, [0, .5, 0]), wp(cop.cap, [0, .28, 0]), .8); } else setBird(wp(cop.cap, [0, .28, 0]), CYAW, t, 0); }
  if (i === 11) { PAD.visible = t < T_TK; pose_(cop, { sL: [-1.4, 0, .3], eL: [-.6, 0, 0] }); const sc = Math.sin(t * 40); pose_(cop, { sR: [-1.2 + sc * .15, 0, .1 + sc * .15], eR: [-1.2, 0, 0] }); setFace(cop, 'squint');
    if (t > T_TK - .1) { pose_(cop, { sR: [-1.5, 0, -.1], eR: [-.2, 0, 0] }); setFace(cop, 'talksq'); }
    if (t > T_TK) { const u = clamp((t - T_TK) / .25); TKT.visible = true; const a = wp(cop.armR.end), b = wp(h.head, [-.02, .42, .2]); TKT.p = lerp3(a, b, eout(u)); TKT.r = [0, h.root.r[1] + (1 - u) * 6, (1 - u) * 3]; face = u >= 1 ? 'closed' : 'wide'; } }
  if (i === 12) { TKT.visible = true; TKT.p = wp(h.head, [-.02, .42, .2]); TKT.r = [0, h.root.r[1], .1]; face = 'closed'; pose_(h, { sL: [-2.5 + Math.sin(t * 20) * .4, 0, .6], sR: [-2.5 - Math.sin(t * 20) * .4, 0, -.6] }); h.wob = .4;
    pose_(cop, { sR: [-1.6, 0, .9], eR: [0, 0, 0], sL: [.1, 0, .9], eL: [-1.6, 0, 0] }); cop.root.r = [0, CYAW - .4, 0]; setFace(cop, Math.sin(t * 16) > 0 ? 'talksq' : 'squint'); const tp = WD.littering + .7;
    if (t > tp) { RPOOP.visible = true; const u = dropFall(t, tp, wp(cop.cap, [0, .4, 0]), wp(cop.cap, [0, .2, .1])); setFace(cop, u >= 1 ? 'wideup' : 'squint'); if (u >= 1) cop.head.r = [-.3, 0, 0]; } }
  // L13: a brand new car (falls on the wreck)
  if (i === 13) { h.root.p = HB2.slice(); h.root.r = [0, .45, 0]; const tc0 = P[13] + .1;
    if (t < tc0 + .5) { cop.root.visible = true; const u = clamp((t - tc0) / .5); cop.root.p = [lerp(COPP[0], 22, u * u), 0, COPP[2]]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 80, .75); setFace(cop, 'wide'); late.push(() => stream(t, A3(cop.root.p, [.5, 1.3, 0]), [1, 0, 0], 5, 20, 36, .9, 2.5, .5)); }
    birdFly(t, tc0, pend(13) - .3, [COPP[0] + 1, 3.2, COPP[2]], PERCH, 2);
    if (t < T_IMP) { setCar(HCAR, CP2); HCAR.body.mat.c = GREY.slice(); HCAR.stripe.visible = false; HCAR.root.s = [1.08, .38, 1.06]; CPORT.visible = true; ROOF.p = [0, .62, 0]; ROOF.r = [0, 0, -.05]; POSTS.forEach((p, k) => p.r = [(k % 2 ? 1 : -1) * .3, 0, (k < 2 ? -1 : 1) * 1.35]); PUD.visible = true;
      const u = clamp((t - T_DROPC) / .4); setCar(NCAR, [CP2[0], lerp(20, .8, u * u), CP2[2]]); NCAR.root.r = [0, Math.PI / 2, 0]; face = t > T_DROPC ? 'wideup' : 'neutral'; lookUp(h, .8); TKT.visible = true; TKT.p = wp(h.head, [-.02, .42, .2]); TKT.r = [0, h.root.r[1], .1]; }
    else { const d = t - T_IMP; setCar(HCAR, CP2); PANC.visible = d < .5; PUD.visible = true; const sq = Math.exp(-d * 6) * Math.sin(d * 30); HCAR.root.s = [1 + sq * .12, 1 - sq * .2, 1 + sq * .12]; burst(T_IMP, t, A3(CP2, [0, .3, 0]), [.85, .8, .72], 0, 16, 3.2, 1.2);
      face = 'grin'; pose_(h, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); h.root.p = A3(HB2, [0, Math.abs(Math.sin(d * 9)) * .5, 0]); h.wob = .35; hero.hat.p = A3(HAT0, [.05, -.02, 0]); hero.hat.r = [0, 0, -.32];
      if (d < .6) { TKT.visible = true; TKT.p = A3(wp(h.head, [-.02, .42, .2]), [d * .8, -d * d * 6, d * .5]); TKT.r = [d * 8, h.root.r[1], d * 5]; } } }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, NB]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
