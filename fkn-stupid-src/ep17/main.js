// =====================================================================
//  EP17 "THE PIGEON" — a pigeon stole one fry. Citizen's arrest. Lawyer. 400 pigeons. They took the cop.
// =====================================================================
const pose_ = (m, o) => { for (const k in o) m[k].r = o[k]; };
const A3 = (b, d) => [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
const yawOf = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
let late = [];
function pathTo(target) { const st = []; const dfs = n => { st.push(n); if (n === target) return true; for (const c of n.children) if (dfs(c)) return true; st.pop(); return false; }; dfs(scene); return st; }
function wp(target, off = [0, 0, 0]) { const ch = target._path || (target._path = pathTo(target)); let m = M4.ident(); for (const n of ch) m = M4.mul(m, M4.trs(n.p, n.r, n.s)); return [m[0] * off[0] + m[4] * off[1] + m[8] * off[2] + m[12], m[1] * off[0] + m[5] * off[1] + m[9] * off[2] + m[13], m[2] * off[0] + m[6] * off[1] + m[10] * off[2] + m[14]]; }
function argue(m, t, amt = 1, seed = 0) { const a = t * 17 + seed; m.sL.r = [-1.6 + Math.sin(a) * 1.2 * amt, 0, .4 + Math.sin(a * 1.3) * .6 * amt]; m.sR.r = [-1.6 + Math.sin(a + 2) * 1.2 * amt, 0, -.4 - Math.sin(a * 1.7) * .6 * amt]; m.eL.r = [-1.2 + Math.sin(a * 2.1) * .8, 0, 0]; m.eR.r = [-1.2 + Math.sin(a * 1.9 + 1) * .8, 0, 0];
  m.body.p = [0, Math.abs(Math.sin(a * .9)) * .18 * amt, 0]; m.body.r = [Math.sin(a * .7) * .2 * amt, Math.sin(a * .5) * .3 * amt, Math.sin(a * 1.1) * .12 * amt]; m.head.r = [Math.sin(a * 2.3) * .25, Math.sin(a * 1.6) * .35, 0]; m.wob = .3; }
const wheelRun = (h, t, sp = 40, lean = .5) => { const a = t * sp; h.lL.r = [-(a % 6.283), 0, -.1]; h.lR.r = [-((a + 3.14) % 6.283), 0, .1]; h.lL.k = h.lR.k = .3; h.sL.r = [Math.sin(a * .5) * 1.4, 0, .3]; h.sR.r = [-Math.sin(a * .5) * 1.4, 0, -.3]; h.eL.r = h.eR.r = [-1.2, 0, 0];
  h.body.p = [0, .35 + Math.abs(Math.sin(a)) * .08, 0]; h.body.r = [lean, 0, Math.sin(a * .5) * .06]; h.wob = .35; };
const sitPose = m => { m.body.p = [0, -.43, 0]; m.lL.r = [-1.5, 0, -.12]; m.lR.r = [-1.5, 0, .12]; m.lL.k = m.lR.k = 1.4; };
// ---------- scenery ----------
lamp.p = [14, 0, 1.4]; scene.children.forEach(n => { if (n.p && n.p[0] > 5.2 && n.p[0] < 8.7 && n.p[2] > -2.3 && n.p[2] < -1.5) n.p = [n.p[0] + 5.2, n.p[1], n.p[2]]; });
scene.children.forEach(n => { if (!n.p) return; const z = n.p[2]; if (Math.abs(z - 10.9) < .01 && n.children && n.children.length > 3) n.visible = false; if (z > 14.7 && z < 16.3 && n.p[1] > 3) n.visible = false; if (Math.abs(n.p[0] - 12) < .01 && n.s && Math.abs(n.s[0] - 2.6) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .2 && Math.abs(z - 6.3) < .3) n.visible = false; });
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] + 5.6) < .01 && Math.abs(n.p[2] - 1.3) < .01) n.p = [-14.6, n.p[1], n.p[2]]; });
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] - 9.6) < .01 && n.p[2] > 1.4 && n.p[2] < 1.5) n.visible = false; });
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- pigeons ----------
function mkPigeon(o = {}) { const g = new Node(); const C = o.c || '#8d93a3', C2 = '#5d6372'; const add = (c, p, s, op) => { const n = B(c, p, s, Object.assign({ out: .006 }, op || {})); g.add(n); return n; };
  add(C, [0, 0, 0], [.17, .15, .27]); add('#a9aebb', [0, -.02, .08], [.15, .11, .14], { out: 0 }); const head = new Node(null, null, [0, .13, .12]); g.add(head);
  head.add(B(C2, [0, 0, 0], [.12, .12, .13], { out: .006 })); head.add(B('#e2b070', [0, -.02, .09], [.04, .035, .07], { out: 0 })); for (const s of [-1, 1]) { head.add(B('#ff8a2a', [s * .061, .02, .03], [.01, .035, .035], { out: 0 })); head.add(B('#1b1b20', [s * .066, .02, .035], [.01, .018, .018], { out: 0 })); }
  add('#5f9c84', [0, .07, .1], [.135, .05, .09], { out: 0, spec: .8 }); add('#8a6aa8', [0, .05, .08], [.14, .025, .08], { out: 0, spec: .8 }); add(C2, [0, .02, -.18], [.13, .03, .13]);
  const wl = new Node(null, null, [-.085, .05, 0]), wr = new Node(null, null, [.085, .05, 0]); wl.add(B('#7a8090', [-.07, 0, -.02], [.14, .02, .22], { out: .006 })); wr.add(B('#7a8090', [.07, 0, -.02], [.14, .02, .22], { out: .006 })); wl.add(B(C2, [-.07, .012, -.09], [.12, .01, .03], { out: 0 })); wr.add(B(C2, [.07, .012, -.09], [.12, .01, .03], { out: 0 })); g.add(wl, wr);
  for (const s of [-1, 1]) add('#e86a5a', [s * .04, -.11, .02], [.025, .08, .025], { out: 0 });
  const cuff = new Node(); for (const s of [-1, 1]) cuff.add(new Node('cyl', { c: hex('#d9dde6'), spec: 1, out: .004, rim: .4 }, [s * .04, -.12, .02], [.06, .015, .06])); cuff.add(B('#d9dde6', [0, -.12, .02], [.08, .01, .01], { spec: 1, out: 0 })); g.add(cuff); cuff.visible = false;
  g.s = [o.s || 1.6, o.s || 1.6, o.s || 1.6]; scene.add(g); return { g, wl, wr, head, cuff }; }
function setPig(q, pos, yaw, flap, t, pitch = 0, k = 0) { q.g.visible = true; q.g.p = pos; q.g.r = [pitch, yaw, 0]; const a = flap > 0 ? Math.sin(t * 34 + k) * 1.1 * flap + .2 : 0; q.wl.r = [0, 0, a]; q.wr.r = [0, 0, -a]; q.head.r = [flap > 0 ? 0 : Math.max(0, Math.sin(t * 7 + k * 1.7)) * .5, 0, 0]; }
const THIEF = mkPigeon(), LAW = mkPigeon({ c: '#9aa0ae' });
LAW.head.add(B('#1b1b20', [0, .03, .07], [.14, .02, .01], { out: 0 })); for (const s of [-1, 1]) LAW.head.add(B('#1b1b20', [s * .04, .02, .07], [.05, .04, .01], { out: 0 })); LAW.g.add(B('#d8302c', [0, .0, .155], [.03, .1, .01], { out: 0 })); LAW.g.add(B('#d8302c', [0, .055, .155], [.05, .03, .012], { out: 0 }));
const BRIEF = new Node(null, null, [.1, -.08, .05]); BRIEF.add(B('#6b4a36', [0, 0, 0], [.04, .12, .16])); BRIEF.add(B('#f0c44a', [0, .04, 0], [.042, .015, .03], { out: 0 })); LAW.g.add(BRIEF);
const FLOCK = []; for (let k = 0; k < 40; k++) FLOCK.push(mkPigeon({ c: ['#8d93a3', '#9aa0ae', '#7d8494', '#a5a1a0'][k % 4], s: 1.45 }));
const FRYB = new Node(); FRYB.add(B('#e3263a', [0, 0, 0], [.07, .015, .015], { out: 0 })); FRYB.add(B('#f2c94a', [.0, 0, .0], [.012, .012, .2], { out: 0 })); FRYB.p = [0, -.02, .16]; THIEF.head.add(FRYB);
// fries box in hero's left hand
const FRIES = new Node(null, null, [0, -.15, .12]); FRIES.add(B('#d8302c', [0, 0, 0], [.32, .3, .2])); FRIES.add(B('#f0c44a', [0, .02, .105], [.12, .12, .01], { out: 0 })); for (let k = 0; k < 9; k++) FRIES.add(B('#f2c94a', [-.12 + (k % 5) * .06, .2 + hsh(k, 2) * .1, -.05 + Math.floor(k / 5) * .08], [.035, .25 + hsh(k, 3) * .12, .035], { out: .004 }, [hsh(k, 4) * .3 - .15, 0, hsh(k, 5) * .3 - .15]));
hero.armL.end.add(FRIES);
const BADGE = new Node(null, null, [0, -.12, .1]); BADGE.add(B('#f0c44a', [0, 0, 0], [.22, .26, .03], { spec: 1, rim: .4, em: .15 })); BADGE.add(B('#b8862a', [0, 0, .02], [.1, .12, .01], { out: 0 })); hero.armR.end.add(BADGE);
const PHONE = B('#1b1b20', [.12, .05, .1], [.03, .1, .06], { out: 0 }); THIEF.g.add(PHONE);
const PAPERS = []; for (let k = 0; k < 10; k++) { const n = B('#f4f1e8', [0, 0, 0], [.22, .01, .3], { out: .004 }); n.visible = false; scene.add(n); PAPERS.push(n); }
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [0, 0, .045], [.09, .06, .09], [1.5708, 0, 0])); cop.armR.end.add(DON);
const NOTE = B('#f4f1e8', [0, -.12, .1], [.2, .26, .03]); cop.armL.end.add(NOTE);
// feathers
const FEA = []; for (let k = 0; k < 24; k++) { const n = B('#eef0f4', [0, 0, 0], [.07, .01, .2], { out: .003, noShadow: 1 }); n.visible = false; scene.add(n); FEA.push(n); }
function feathers(t, t0, c, n = 24, sp = 1, dur = 2.5) { const d = t - t0; if (d < 0 || d > dur) return; for (let k = 0; k < n; k++) { const q = FEA[k]; const a = hsh(k, 1) * 6.283, r = (1 - Math.exp(-d * 4)) * (1 + hsh(k, 2) * 2) * sp; q.visible = true; q.p = [c[0] + Math.cos(a) * r + Math.sin(t * 3 + k) * .2, Math.max(.02, c[1] + (1 - Math.exp(-d * 5)) * 1.5 * sp * hsh(k, 3) - d * .5), c[2] + Math.sin(a) * r]; q.r = [Math.sin(t * 4 + k) * .8, k + t, Math.cos(t * 3 + k) * .8]; } }
// ---------- hero's car (convertible, faces +x, driver door on the sidewalk side) ----------
const HCAR = car({ body: '#3f8f7a', stripe: '#f4f1e8' }); scene.add(HCAR.root); HCAR.root.children[1].visible = false; HCAR.l1.visible = HCAR.l2.visible = false;
HCAR.root.add(B('#9fd0e8', [0, 1.05, .6], [1.6, .45, .05], { out: .01, a: .5 })); HCAR.root.add(new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [.42, 1.15, .3], [.38, .04, .38], [-.9, 0, 0]));
HCAR.root.add(B('#2a2a30', [0, .9, -.4], [1.6, .12, 1.4])); HCAR.root.add(B('#2a2a30', [0, 1.2, -.05], [1.6, .55, .12])); HCAR.root.add(B('#2a2a30', [0, 1.2, -1.05], [1.6, .55, .12]));
const DOOR = new Node(null, null, [.97, 0, .5]); DOOR.add(B('#3f8f7a', [0, .62, -.6], [.06, .62, 1.2])); DOOR.add(B('#f4f1e8', [.02, .62, -.6], [.04, .18, 1.2], { out: 0 })); DOOR.add(B('#c8ccd6', [.05, .72, -.3], [.04, .05, .18], { spec: 1, out: 0 })); HCAR.root.add(DOOR);
// hide the original door-side slab of the body? (keep body; door sits on top)
const CZ = 3.0;
function setCar(cx, bulge = 0, t = 0) { HCAR.root.visible = true; HCAR.root.p = [cx, 0, CZ]; HCAR.root.r = [0, Math.PI / 2, 0]; const w = bulge * (1 + .08 * Math.sin(t * 9)); HCAR.root.s = [1 + w * .35, 1 + w * .5, 1 + w * .15]; }
const carW = (cx, l) => [cx + l[2], l[1], CZ - l[0]]; // local -> world (ignoring bulge)
function setPcar(x, y = 0, rz = 0, t = 0, on = true) { pcar.root.visible = true; pcar.root.p = [x, y, CZ]; pcar.root.r = [rz, Math.PI / 2, rz * .5]; const s = on && Math.sin(t * 14) > 0; pcar.l1.mat.em = s ? 1 : .2; pcar.l2.mat.em = s ? .2 : 1; }
// ---------- places ----------
const BENCH = [-9.2, 0, -1.9], SEAT = [-9.0, .03, -1.75], WALK0 = [-4.6, 0, -.5], PIGS = [-7.4, 0, -.2], HST = [-8.5, 0, -.7], HCX0 = 0.5, HCX1 = 6.5;
// flock spots (where they land)
const G = []; for (let k = 0; k < 40; k++) { let p; if (k < 24) { p = [-13 + hsh(k, 1) * 10.5, 0, -1.6 + hsh(k, 2) * 3.2]; if (Math.hypot(p[0] - HST[0], p[2] - HST[2]) < 1.1) p[0] += 2.2; }
  else if (k < 30) { const l = [[.6, .86, 1.7], [-.6, .86, 1.7], [0, .86, 2.0], [.6, .86, -1.9], [-.6, .86, -1.9], [0, 1.5, -1.05]][k - 24]; p = carW(HCX0, l); }
  else if (k < 35) p = [-12.4 + (k - 30) * 1.4, .95, -2.6]; else p = [-9.9 + (k - 35) * .35, 1.22, -2.14]; G.push(p); }
// ---------- times ----------
const T_SIT = P[14] - T_END + 1.35, T_PL = -0.9, T_STEAL = WD.stole - .05, T_SNATCH = T_STEAL + .3, T_DOWN = T_SNATCH + .45, T_GULP = WD.theft + .25;
const T_DIVE = WD.arrested2 - .15, T_HIT = T_DIVE + .35, T_UP = T_HIT + .45, T_LAWIN = P[3] + .1, T_LAWON = WD.lawyer3 + .15, T_GRAB = WD.fucking2 - .05;
const T_ZIP0 = P[6] + .1, T_ZIP1 = P[6] + 1.7, T_WALK7 = P[7] + .6, T_STUFF0 = P[7] + .65, T_IN = P[7] + 1.45, T_GOC = P[7] + 1.65;
const T_PO = WD.over + .05, T_COPOUT = T_PO + .1, T_COPAT = T_COPOUT + .35, T_DOOR = WD.door - .3, T_BURST = WD.fucking3 - .05;
const cxAt = t => { if (t < T_GOC) return HCX0; if (t < P[8]) return HCX0 + 3 * (t - T_GOC) ** 2; const a = HCX0 + 3 * (P[8] - T_GOC) ** 2; return lerp(a, HCX1, eout(clamp((t - P[8]) / (T_PO - P[8])))); };
const pileW = (j, cx, bulge, t) => { const layer = Math.floor(j / 10), idx = j % 10; const l = [-.45 + (idx % 2) * .9 + Math.sin(t * 7 + j) * .04, 1.0 + layer * .3 * (1 + bulge * .5), -1.0 + Math.floor(idx / 2) * .5]; return carW(cx, l); };
const towerW = (hand, j, t) => [hand[0] + Math.sin(t * 2.6 + j * .12) * j * .018, hand[1] + .15 + j * .3, hand[2] + Math.cos(t * 2.1 + j * .1) * j * .012];
const HAT0 = hero.hat.p.slice();
// ---------- intro / loop: he sits down with his fries; a pigeon lands... ----------
function intro(t) { const h = hero; let face = 'neutral'; FRIES.visible = true;
  if (t < T_SIT - .45) { const u = clamp((t - (P[14] - T_END)) / (T_SIT - .45 - (P[14] - T_END))); h.root.p = lerp3(WALK0, [SEAT[0], 0, -1.1], u); h.root.r = [0, yawOf(WALK0, [SEAT[0], 0, -1.1]), 0]; walkPose(h, t, 9, .7); pose_(h, { sL: [-.9, 0, .2], eL: [-.8, 0, 0] }); face = 'grin'; }
  else if (t < T_SIT) { const u = eio(clamp((t - T_SIT + .45) / .45)); h.root.p = lerp3([SEAT[0], 0, -1.1], SEAT, u); h.root.r = [0, lerp(yawOf(WALK0, [SEAT[0], 0, -1.1]) + 6.283, 0, u) % 6.283, 0]; h.body.p = [0, -.43 * u, 0]; h.lL.r = [-1.5 * u, 0, -.12]; h.lR.r = [-1.5 * u, 0, .12]; h.lL.k = h.lR.k = 1.4 * u; pose_(h, { sL: [-.9, 0, .2], eL: [-.8, 0, 0] }); face = 'grin'; }
  else { h.root.p = SEAT.slice(); h.root.r = [0, 0, 0]; sitPose(h); pose_(h, { sL: [-.9, 0, .25], eL: [-.8, 0, 0] }); const e = (t - T_SIT) % 1.3; face = e < .5 ? 'closed' : 'grin'; if (e < .4) pose_(h, { sR: [-2.2, 0, .3], eR: [-1.3, 0, 0] }); h.head.r = [e < .4 ? .1 : 0, 0, 0]; }
  // the pigeon
  if (t > T_PL) { const d = t - T_PL; const perch = [-8.3, .58, -1.85]; FRYB.visible = false;
    if (d < .35) { const u = d / .35; setPig(THIEF, [lerp(-6.5, perch[0], u), perch[1] + (1 - u) * 2.5, lerp(-.5, perch[2], u)], -1.4, 1, t); }
    else if (t < T_STEAL) { const st = clamp((t - T_PL - .4) / 1.2); setPig(THIEF, [lerp(perch[0], -8.55, st), perch[1], perch[2]], -1.5 + Math.sin(t * 5) * .3, 0, t); THIEF.head.r = [0, Math.sin(t * 9) * .5, 0]; }
    else if (t < T_SNATCH) { const u = (t - T_STEAL) / .3; const fb = A3(SEAT, [-.25, 1.05, .45]); setPig(THIEF, [lerp(-8.55, fb[0], Math.sin(u * Math.PI)), perch[1] + Math.sin(u * Math.PI) * .7, lerp(perch[2], fb[2], Math.sin(u * Math.PI))], -1.8, 1, t); FRYB.visible = u > .5; }
    else if (t < T_DOWN) { const u = (t - T_SNATCH) / (T_DOWN - T_SNATCH); setPig(THIEF, [lerp(-8.55, PIGS[0], u), perch[1] * (1 - u) + Math.sin(u * Math.PI) * .9, lerp(perch[2], PIGS[2], u)], 1.0, 1, t); FRYB.visible = true; }
    else { setPig(THIEF, PIGS.slice(), -2.2 + Math.sin(t * 3) * .15, 0, t); FRYB.visible = true; THIEF.head.r = [0, 0, Math.sin(t * 6) * .25]; } }
  if (t > T_STEAL) { face = 'wide'; h.wob = .2; if (t > T_STEAL + .25) FRIES.children.slice(3).forEach((f, k) => f.visible = k !== 4); }
  if (t > WD.fucking1 - .1 && t < P[1]) { const d = t - WD.fucking1 + .1; h.root.p = [SEAT[0] + d * .4, Math.max(0, Math.sin(clamp(d / .4) * Math.PI) * .6), lerp(SEAT[2], HST[2], clamp(d / .4))]; h.root.r = [0, .6, 0]; resetLegs(h); argue(h, t, 1.5, 1); face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .6; pose_(h, { sL: [-.9, 0, .25], eL: [-.8, 0, 0] }); }
  return face; }
const resetLegs = h => { h.lL.r = [0, 0, 0]; h.lR.r = [0, 0, 0]; h.lL.k = h.lR.k = 0; h.body.p = [0, 0, 0]; };
function hideAll() { for (const m of [hero, cop]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice();
  FRIES.visible = BADGE.visible = false; FRIES.children.forEach(f => f.visible = true); DON.visible = NOTE.visible = false; PHONE.visible = false;
  for (const q of [THIEF, LAW, ...FLOCK]) { q.g.visible = false; q.cuff.visible = false; q.g.s = q === THIEF || q === LAW ? [1.6, 1.6, 1.6] : [1.45, 1.45, 1.45]; } FRYB.visible = false; BRIEF.visible = true;
  PAPERS.forEach(p => p.visible = false); FEA.forEach(f => f.visible = false); puffs.forEach(p => p.visible = false); DOOR.r = [0, 0, 0]; setCar(HCX0); pcar.root.visible = false; pcar.root.p = [0, 0, 0]; }
const holdPig = (q, hand, t, yaw = 0, flap = .6, k = 0) => late.push(() => { const p = wp(hand, [0, -.05, .15]); setPig(q, p, yaw, flap, t, 0, k); q.cuff.visible = true; });
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  if (i === 0) face = intro(t);
  if (i === 1) { h.root.p = HST.slice(); h.root.r = [0, .75, 0]; FRIES.visible = true; FRIES.children.slice(3).forEach((f, k) => f.visible = k !== 4); BADGE.visible = t > P[1] + .3; face = 'squint';
    if (t > P[1] + .3) pose_(h, { sR: [-1.55, 0, -.15], eR: [-.15, 0, 0], sL: [-.4, 0, .25], eL: [-.6, 0, 0] }); else pose_(h, { sL: [-.4, 0, .25], eL: [-.6, 0, 0] });
    setPig(THIEF, PIGS.slice(), -2.3, 0, t); FRYB.visible = t < T_GULP + .15; if (t > T_GULP) { FRYB.s = [1, 1, Math.max(.01, 1 - (t - T_GULP) * 6)]; THIEF.head.r = [-.5, 0, 0]; THIEF.g.s = [1.6, 1.6 * (t - T_GULP < .25 ? 1.12 : 1), 1.6]; } }
  FRYB.s = i === 1 && t > T_GULP ? FRYB.s : [1, 1, 1];
  if (i === 2) { FRIES.visible = false; const d = t - T_DIVE;
    if (d < 0) { h.root.p = HST.slice(); h.root.r = [0, .75, 0]; face = 'squint'; h.body.p = [0, -.15, 0]; pose_(h, { sL: [-.6, 0, .6], sR: [-.6, 0, -.6] }); setPig(THIEF, PIGS.slice(), -2.3, 0, t); }
    else if (t < T_HIT) { const u = d / (T_HIT - T_DIVE); h.root.p = [lerp(HST[0], PIGS[0] - .2, u), .3 + Math.sin(u * Math.PI) * 1.2, lerp(HST[2], PIGS[2] - 1.0, u)]; h.root.r = [1.45, .75, 0]; pose_(h, { sL: [-3.0, 0, .3], sR: [-3.0, 0, -.3] }); face = 'scream'; h.wob = .4; setPig(THIEF, PIGS.slice(), -2.3, u > .6 ? 1 : 0, t); }
    else if (t < T_UP) { h.root.p = [PIGS[0] - .2, .2, PIGS[2] - 1.0]; h.root.r = [1.5, .75, 0]; pose_(h, { sL: [-3.0, 0, .3], sR: [-3.0, 0, -.3] }); face = 'squint'; burst(T_HIT, t, A3(PIGS, [0, .3, 0]), [.92, .92, .95], 0, 14, 1.2, 1.4); feathers(t, T_HIT, A3(PIGS, [0, .3, 0]), 24, 1.1); }
    else { const u = clamp((t - T_UP) / .25); h.root.p = [PIGS[0] - .4, 0, PIGS[2] - .6]; h.root.r = [1.5 * (1 - u), .4, 0]; face = 'grin'; pose_(h, { sR: [-2.7, 0, -.3], eR: [-.2, 0, 0] }); holdPig(THIEF, h.armR.end, t, .4, .8); feathers(t, T_HIT, A3(PIGS, [0, .3, 0]), 24, 1.1); } }
  const STAND = [PIGS[0] - .4, 0, PIGS[2] - .6];
  if (i === 3 || i === 4) { h.root.p = STAND.slice(); h.root.r = [0, .4, 0]; pose_(h, { sR: [-2.0, 0, -.5], eR: [-.4, 0, 0] }); face = 'grin'; holdPig(THIEF, h.armR.end, t, .4, i === 3 ? .3 : .6); if (i === 3) PHONE.visible = true;
    const hd = () => wp(h.head, [.16, 1.08, 0]);
    if (i === 3) { if (t < T_LAWON) { const u = clamp((t - T_LAWIN) / (T_LAWON - T_LAWIN)); late.push(() => { const e = hd(); setPig(LAW, [lerp(e[0] + 6, e[0], eout(u)), lerp(e[1] + 5, e[1], eout(u)) + Math.sin(u * Math.PI) * .5, lerp(e[2] + 2, e[2], u)], -1.5, 1, t); }); face = t > T_LAWIN + .3 ? 'up' : 'grin'; }
      else { late.push(() => { setPig(LAW, hd(), .4 + Math.sin(t * 2) * .2, 0, t); LAW.head.r = [.3, 0, 0]; }); face = 'wideup'; h.head.r = [-.2, 0, 0]; } }
    if (i === 4) { if (t < T_GRAB) { late.push(() => setPig(LAW, hd(), .4, 0, t)); face = t > WD.arrested4 ? 'squint' : 'up'; }
      else { pose_(h, { sL: [-2.7, 0, .4], eL: [-.2, 0, 0], sR: [-2.7, 0, -.4], eR: [-.2, 0, 0] }); holdPig(THIEF, h.armR.end, t, .4, .8); holdPig(LAW, h.armL.end, t, .4, 1, 3); face = Math.sin(t * 20) > 0 && t < T_GRAB + .8 ? 'scream' : 'grin'; h.root.p[1] = Math.max(0, Math.sin((t - T_GRAB) * 9) * .25) * clamp(1 - (t - T_GRAB)); BRIEF.visible = false;
        const dp = t - T_GRAB; for (let k = 0; k < 10; k++) { const q = PAPERS[k]; if (dp > 2.2) continue; q.visible = true; q.p = [STAND[0] + .4 + Math.cos(k * 2.4) * dp * 1.5, Math.max(.02, 2.4 + dp * 2 * hsh(k, 1) - dp * dp * 1.2), STAND[2] + Math.sin(k * 2.4) * dp * 1.2]; q.r = [dp * (3 + k), dp * 2, dp * (2 - k * .3)]; } } } }
  if (i === 5) { h.root.p = STAND.slice(); h.root.r = [0, .4 + Math.sin(t * 1.5) * .3, 0]; pose_(h, { sL: [-2.7, 0, .4], eL: [-.2, 0, 0], sR: [-2.7, 0, -.4], eR: [-.2, 0, 0] }); holdPig(THIEF, h.armR.end, t, .4, .3); holdPig(LAW, h.armL.end, t, .4, .3, 3); face = t > P[5] + .5 ? 'wideup' : 'grin'; h.head.r = [-.25, 0, 0];
    FLOCK.forEach((q, k) => { const tl = P[5] + .15 + k * .03 + hsh(k, 7) * .5, fl = 1.0; const s = A3(G[k], [6 + hsh(k, 1) * 8, 9 + hsh(k, 2) * 6, -3 + hsh(k, 3) * 8]); const u = clamp((t - tl + fl) / fl); if (u <= 0) return; if (u < 1) setPig(q, lerp3(s, G[k], eout(u)), yawOf(s, G[k]), 1, t, .3 * (1 - u), k); else setPig(q, G[k], hsh(k, 5) * 6.283, 0, t, 0, k); }); }
  if (i === 6) { const n = Math.floor(clamp((t - T_ZIP0) / (T_ZIP1 - T_ZIP0)) * 40); const zip = t > T_ZIP0 && t < T_ZIP1;
    if (zip) { const k = Math.min(39, n); h.root.p = [G[k][0] + .5, 0, G[k][2] + .5]; if (k >= 24 && k < 30) h.root.p = [G[k][0], 0, 1.4]; if (k >= 30) h.root.p = [G[k][0], 0, -2.0]; h.root.r = [0, (k * 2.3) % 6.283, 0]; wheelRun(h, t, 60, .3); face = 'squint'; h.wob = .6;
      for (let j = 0; j < 8; j++) { const q = puffs[j]; const kk = Math.max(0, k - j); q.visible = true; q.p = [G[kk][0], .6, G[kk][2]]; q.mat.c = [.9, .9, .94]; q.mat.a = .5 * (1 - j / 8); q.s = [.4, .4, .4]; } }
    else if (t <= T_ZIP0) { h.root.p = STAND.slice(); h.root.r = [0, .4, 0]; face = 'squint'; pose_(h, { sL: [-2.7, 0, .4], sR: [-2.7, 0, -.4] }); }
    else { h.root.p = HST.slice(); h.root.r = [0, .5, 0]; face = 'grin'; }
    if (!zip) { holdPig(THIEF, h.armR.end, t, .4, .3); holdPig(LAW, h.armL.end, t, .4, .3, 3); }
    if (t >= T_ZIP1) pose_(h, { sL: [-1.4, 0, .1], eL: [-.4, 0, 0], sR: [-1.4, 0, -.1], eR: [-.4, 0, 0] }); if (t >= T_ZIP1) h.wob = .2;
    FLOCK.forEach((q, k) => { if (k >= n || t <= T_ZIP0) setPig(q, G[k], hsh(k, 5) * 6.283, 0, t, 0, k); else if (t >= T_ZIP1) late.push(() => { const hd = wp(h.body, [0, 1.75, .45]); setPig(q, towerW(hd, k, t), Math.sin(k) * .6, 0, t, 0, k); q.cuff.visible = true; }); }); }
  if (i === 7) { const cx = cxAt(t), stuffed = j => T_STUFF0 + j * .018; let nIn = 0; FLOCK.forEach((q, j) => { if (t > stuffed(j) + .2) nIn++; }); const bulge = nIn / 40 * .9; setCar(cx, bulge, t); face = 'squint';
    const DOORW = carW(HCX0, [1.5, 0, .1]);
    if (t < T_WALK7) { const u = clamp((t - P[7]) / (T_WALK7 - P[7])); h.root.p = lerp3(HST, DOORW, u); h.root.r = [0, yawOf(HST, DOORW), 0]; wheelRun(h, t, 50, .3); pose_(h, { sL: [-1.4, 0, .1], eL: [-.4, 0, 0], sR: [-1.4, 0, -.1], eR: [-.4, 0, 0] }); }
    else if (t < T_IN) { h.root.p = DOORW.slice(); h.root.r = [0, Math.PI * .1, 0]; argue(h, t, .7, 2); h.body.r = [.3, 0, 0]; face = 'squint'; }
    else if (t < T_GOC) { const u = clamp((t - T_IN) / .2); const seat = carW(cx, [.42, .44, -.3]); h.root.p = lerp3(DOORW, seat, u); h.root.p[1] += Math.sin(u * Math.PI) * 1.5; h.root.r = [u * 1.2, Math.PI / 2, 0]; face = 'scream'; }
    else { h.root.p = carW(cx, [.42, .44 + bulge * .3, -.3]); h.root.r = [0, Math.PI / 2, 0]; sitPose(h); pose_(h, { sL: [-1.3, 0, .2], sR: [-1.3, 0, -.2] }); face = 'squint'; }
    FLOCK.forEach((q, j) => { const t0 = stuffed(j); if (t < T_WALK7) late.push(() => { const hd = wp(h.body, [0, 1.75, .45]); setPig(q, towerW(hd, j, t), Math.sin(j) * .6, 0, t, 0, j); q.cuff.visible = true; });
      else if (t < t0) { const hd = A3(DOORW, [0, 1.75, 0]); setPig(q, towerW(hd, j, t), Math.sin(j) * .6, 0, t, 0, j); q.cuff.visible = true; }
      else { const u = clamp((t - t0) / .2); const a = towerW(A3(DOORW, [0, 1.75, 0]), j, t), b = pileW(j, cx, bulge, t); setPig(q, lerp3(a, b, u), j * 1.7, u < 1 ? .6 : 0, t, 0, j); q.cuff.visible = true; } });
    [THIEF, LAW].forEach((q, j) => setPig(q, carW(cx, [-.3 + j * .6, 1.0 + 4 * .3, .3]), j * 2, 0, t, 0, j));
    if (t > T_GOC) burst(T_GOC, t, carW(cx, [0, .4, -2.4]), [.3, .3, .32], 0, 8, .8, .8); }
  if (i >= 8 && i <= 10) { const cx = cxAt(t); let bulge = .9; if (i === 10 && t > T_BURST) bulge = .9 * Math.max(0, 1 - (t - T_BURST) * 6); setCar(cx, bulge, t); h.root.p = carW(cx, [.42, .44 + bulge * .3, -.3]); h.root.r = [0, Math.PI / 2, 0]; sitPose(h); pose_(h, { sL: [-1.3, 0, .2], sR: [-1.3, 0, -.2] }); face = 'squint';
    const inPile = i < 10 || t < T_BURST; if (inPile) { FLOCK.forEach((q, j) => { setPig(q, pileW(j, cx, bulge, t), j * 1.7, 0, t, 0, j); q.cuff.visible = true; }); [THIEF, LAW].forEach((q, j) => setPig(q, carW(cx, [-.3 + j * .6, 2.2, .3]), j * 2, 0, t, 0, j)); }
    const pcx = i === 8 ? lerp(-16, cx - 5.0, eout(clamp((t - P[8] + .1) / (T_PO + .1 - P[8])))) : HCX1 - 5.0; setPcar(pcx, 0, 0, t);
    cop.root.visible = true; NOTE.visible = true;
    if (i === 8 && t < T_COPOUT) cop.root.visible = false;
    else if (i === 8 && t < T_COPAT) { const u = (t - T_COPOUT) / (T_COPAT - T_COPOUT); cop.root.p = [lerp(pcx + .5, HCX1 + .7, u), 0, 1.3]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 65, .6); setFace(cop, 'neutral'); burst(T_COPOUT, t, [pcx + .5, .3, 1.6], [.85, .8, .72], 8, 14, .6, 1); }
    else { cop.root.p = [HCX1 + .7, 0, 1.3]; cop.root.r = [0, 1.2, 0]; pose_(cop, { sL: [-1.2, 0, .3], eL: [-.8, 0, 0], sR: [-1.0, 0, -.2], eR: [-1.2, 0, 0] }); setFace(cop, i === 8 && t < T_COPAT + .25 ? 'wide' : (Math.sin(t * 14) > 0 ? 'talk' : 'neutral')); if (i === 8 && t < T_COPAT + .15) cop.body.r = [-.35, 0, 0]; }
    if (i >= 9) { const od = clamp((t - T_DOOR) / .14); DOOR.r = [0, -1.15 * eout(od), 0]; if (t > T_DOOR) { face = 'grin';
        const dh = t - T_DOOR - .1; if (dh > 0) { const u = clamp(dh / .35); cop.root.p = [HCX1 + .7 + u * .6, Math.sin(u * Math.PI) * .6, lerp(1.3, .0, u)]; cop.root.r = [-.6 * Math.sin(u * Math.PI), 1.2, 0]; setFace(cop, 'dizzy'); NOTE.visible = u < .3; if (u >= 1) { cop.root.r = [0, 1.6 + Math.sin(t * 4) * .2, Math.sin(t * 5) * .12]; cop.wob = .4; } } }
      if (i === 9 && t > T_DOOR + .2) FLOCK.slice(0, 4).forEach((q, j) => { const d = (t - T_DOOR - .2 - j * .15); if (d < 0) return; const s = carW(cx, [1.0, 1.0, .1]); setPig(q, [s[0] + Math.sin(j * 2) * .3, Math.max(0, s[1] - d * 3), s[2] - .3 - d * .8], -2.5 + j, 0, t, 0, j); }); }
    if (i === 10) { DON.visible = false; if (t < T_BURST) { face = 'grin'; }
      else { const d = t - T_BURST; face = d < .6 ? 'wide' : 'dizzy'; h.wob = .5; const c = carW(cx, [.4, 1.3, -.3]);
        [...FLOCK, THIEF, LAW].forEach((q, k) => { const a = hsh(k, 11) * 6.283, el = .3 + hsh(k, 12) * 1.0, sp = 4 + hsh(k, 13) * 6; const r = sp * (1 - Math.exp(-d * 2.2)) / 2.2; const dir = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)]; setPig(q, [c[0] + dir[0] * r, c[1] + dir[1] * r + d * 1.2, c[2] + dir[2] * r], a + Math.PI / 2, 1, t, -.3, k); });
        feathers(t, T_BURST, c, 24, 2.0, 3); burst(T_BURST, t, c, [.92, .92, .95], 0, 16, 2.0, 2.0); cop.root.p = [HCX1 + 1.3, 0, .0]; cop.root.r = [0, 1.9, 0]; setFace(cop, 'wide'); pose_(cop, { sL: [-2.6, 0, .6], sR: [-2.6, 0, -.6] }); cop.wob = .6; cop.body.r = [-.3, 0, Math.sin(t * 20) * .1]; } } }
  if (i >= 11 && i <= 13) { setCar(HCX1, 0, t); DOOR.r = [0, -1.15, 0]; h.root.p = carW(HCX1, [.42, .44, -.3]); h.root.r = [0, Math.PI / 2, 0]; sitPose(h); pose_(h, { sL: [-1.3, 0, .2], sR: [-1.3, 0, -.2] }); face = 'up'; h.head.r = [-.35, -.6, 0]; }
  if (i === 11 || i === 12) { const u = clamp((t - P[11]) / (P[13] - P[11])); const cp = [HCX1 + 1.3 + u * 3, .2 + 14 * u * u + 1.2 * u, .1 - u * 2]; cop.root.visible = true; DON.visible = true; cop.root.p = cp; cop.root.r = [0, 0, Math.sin(t * 3) * .15]; pose_(cop, { sL: [-2.9, 0, .5], sR: [-2.9, 0, -.5], eR: [-.4, 0, 0] }); cop.lL.r = [Math.sin(t * 14) * .8, 0, -.2]; cop.lR.r = [-Math.sin(t * 14) * .8, 0, .2]; cop.wob = .4; setFace(cop, Math.sin(t * 5) > 0 ? 'wideup' : 'scream');
    const pu2 = clamp((t - P[12] + .1) / (P[13] - P[12])); const pc = [HCX1 - 5.0 + pu2 * 4, 8 * pu2 * pu2 + .0, CZ - pu2 * 3]; setPcar(pc[0], pc[1], Math.sin(t * 2.5) * .2 * pu2, t);
    [...FLOCK, THIEF, LAW].forEach((q, k) => { const toCar = i === 12 && k % 2 === 0; const c = toCar ? A3(pc, [0, 1.6, 0]) : A3(cp, [0, 3.1, 0]); const a = k * .52 + t * (2.5 + hsh(k, 3)), r = (toCar ? 1.6 : .7) + hsh(k, 4) * 1.3; setPig(q, [c[0] + Math.cos(a) * r, c[1] + hsh(k, 5) * 1.1 - (toCar ? .9 : 0), c[2] + Math.sin(a) * r], -a, 1, t, 0, k); });
    feathers(t, T_BURST, carW(HCX1, [.4, 1.3, -.3]), 24, 2.0, 6); }
  if (i === 13) { const d = t - P[13]; h.head.r = [-.1 - Math.max(0, .5 - d * .5), 0, 0]; face = d < .8 ? 'up' : 'closed'; if (d > 1.0) face = 'half'; h.body.p[1] -= Math.sin(clamp((d - .6) / .8) * Math.PI) * .08;
    for (let k = 0; k < 18; k++) { const q = FEA[k]; q.visible = true; const f = ((d * .18 + hsh(k, 2)) % 1); q.p = [HCX1 - 3 + hsh(k, 1) * 6 + Math.sin(t * 1.5 + k) * .4, 4.5 - f * 4.5, CZ - 2.5 + hsh(k, 3) * 4]; q.r = [Math.sin(t * 2 + k) * .6, k, Math.cos(t * 2.2 + k) * .6]; }
    const f0 = clamp((d - .2) / 1.3); FEA[20].visible = true; FEA[20].p = lerp3(A3(h.root.p, [0.6, 3.6, 0]), wp(h.head, [.16, 1.13, 0]), f0); FEA[20].r = [Math.sin(t * 3) * .5 * (1 - f0), 0, .3]; }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
