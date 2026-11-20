// =====================================================================
//  EP8 "THE LAWN" — one inch too tall. He mows everything.
// =====================================================================
const pose_ = (m, o) => { for (const k in o) m[k].r = o[k]; };
const A3 = (b, d) => [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
const yawOf = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
let late = [];
function pathTo(target) { const st = []; const dfs = n => { st.push(n); if (n === target) return true; for (const c of n.children) if (dfs(c)) return true; st.pop(); return false; }; dfs(scene); return st; }
function wp(target, off = [0, 0, 0]) { const ch = target._path || (target._path = pathTo(target)); let m = M4.ident(); for (const n of ch) m = M4.mul(m, M4.trs(n.p, n.r, n.s)); return [m[0] * off[0] + m[4] * off[1] + m[8] * off[2] + m[12], m[1] * off[0] + m[5] * off[1] + m[9] * off[2] + m[13], m[2] * off[0] + m[6] * off[1] + m[10] * off[2] + m[14]]; }

const GY = -.06;
// ---------- lawns ----------
const LAWN_H = [], LAWN_N = [];
function mkLawn(arr, x0, x1, z0, z1, skip) { for (let z = z0; z <= z1 + 1e-6; z += .4) for (let x = x0; x <= x1 + 1e-6; x += .4) { if (skip(x, z)) continue; const row = Math.round((z - z0) / .4);
  const g = hsh(x * 1.7, z * 2.9) * .08; const n = new Node('box', { c: (row % 2 ? [.49, .74, .34] : [.41, .66, .29]).map((v, q) => v + (q === 1 ? g : g * .4)), out: 0, spec: .05, rim: .12 }, [x, 0, z], [.36, .1, .35]); scene.add(n); arr.push({ n, x, z, j: hsh(x * 3.1 + 7, z * 7.3) }); } }
mkLawn(LAWN_H, -3.0, 3.4, -6.0, -3.0, (x, z) => (x > -2.3 && x < -.7) || (x > -.2 && x < 2.0 && z > -4.0));
mkLawn(LAWN_N, 5.6, 12.4, -6.0, -3.0, (x, z) => (x > 6.7 && x < 8.3) || (x > 8.8 && x < 11.0 && z > -4.0) || (x > 11.5 && z < -5.0));
const setH = (b, h) => { b.n.s[1] = h; b.n.p[1] = GY + h / 2; };
const ROWS = [-5.8, -5.0, -4.2, -3.4];
const rowOf = z => { let r = 0, d = 9; ROWS.forEach((q, k) => { if (Math.abs(q - z) < d) { d = Math.abs(q - z); r = k; } }); return r; };
function mowPath(u, xa, xb, r0 = 0, nr = 4) { const seg = clamp(u, 0, .9999) * nr; const row = Math.floor(seg) + r0, f = seg - Math.floor(seg); const dir = row % 2 ? -1 : 1; const x = dir > 0 ? lerp(xa, xb, f) : lerp(xb, xa, f); return { row, x, dir, z: ROWS[row] }; }
const isCut = (b, m) => { const r = rowOf(b.z); return r < m.row || (r === m.row && (m.dir > 0 ? b.x < m.x : b.x > m.x)); };
// ---------- props ----------
const mower = new Node(); mower.add(B('#2a2a30', [0, .1, 0], [.78, .1, .86], { spec: .3 })); mower.add(B('#d8302c', [0, .24, .02], [.64, .2, .74], { spec: .5, rim: .2 })); mower.add(new Node('cyl', { c: hex('#3a3a40'), out: .01, spec: .5 }, [0, .42, .05], [.32, .2, .32]));
mower.add(B('#f0c44a', [0, .54, .05], [.1, .05, .1])); for (const [x, z] of [[-.38, .3], [.38, .3], [-.38, -.3], [.38, -.3]]) mower.add(new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [x, .1, z], [.22, .07, .22], [0, 0, Math.PI / 2]));
for (const sx of [-.22, .22]) mower.add(B('#2a2a30', [sx, .66, -.5], [.04, .9, .04], { spec: .4 }, [-.55, 0, 0])); mower.add(B('#2a2a30', [0, 1.03, -.73], [.5, .05, .05])); mower.add(B('#1d1d22', [.15, .3, -.35], [.24, .3, .2])); scene.add(mower);
const ruler = B('#f0c44a', [0, -.2, .1], [.05, .42, .015], { out: .01 }); for (let k = 0; k < 6; k++) ruler.add(B('#1b1b20', [.012, -.4 + k * .16, .01], [.5, .012, .5], { out: 0 })); hero.armR.end.add(ruler);
const scis = new Node(null, null, [0, -.1, .08]); const sb1 = B('#c9ccd4', [0, -.08, 0], [.02, .16, .015], { spec: 1 }), sb2 = B('#c9ccd4', [0, -.08, 0], [.02, .16, .015], { spec: 1 }); scis.add(sb1, sb2, B('#e3263a', [0, .02, 0], [.07, .05, .03])); hero.armR.end.add(scis);
const glass = new Node(null, null, [0, -.12, .06]); glass.add(new Node('cyl', { c: [1, .95, .55], a: .85, em: .25, out: .01, spec: .8 }, [0, 0, 0], [.1, .16, .1])); glass.add(B('#ffd23a', [.03, .1, 0], [.07, .02, .07])); hero.armL.end.add(glass);
const paper = B('#f4f1e8', [0, -.1, .14], [.36, .26, .02], { out: .01 }); paper.add(B('#1b1b20', [0, .06, .6], [.8, .08, .1], { out: 0 }));
const nb = man({ id: 'med', shape: 'can', seed: 12, skin: SK.med, shirt: '#f08aa8', stripe: '#e47aa0', pants: '#5b6f8f', shoe: '#f4f1e8', hair: '#c9c9d0' }); scene.add(nb.root); nb.armR.end.add(paper);
function lawnChair(c1, c2) { const c = new Node(); for (const sx of [-.3, .3]) { c.add(B('#d9d9d4', [sx, .2, .15], [.04, .42, .04], { spec: .6 }, [-.3, 0, 0])); c.add(B('#d9d9d4', [sx, .2, -.15], [.04, .42, .04], { spec: .6 }, [.3, 0, 0])); c.add(B('#d9d9d4', [sx, .42, 0], [.04, .04, .6], { spec: .6 })); }
  for (let k = 0; k < 4; k++) c.add(B(k % 2 ? c1 : c2, [0, .43, -.24 + k * .16], [.6, .03, .15], { out: .004 })); for (let k = 0; k < 4; k++) c.add(B(k % 2 ? c1 : c2, [0, .55 + k * .14, -.36 - k * .04], [.6, .13, .03], { out: .004 }, [-.25, 0, 0])); scene.add(c); return c; }
const NCH = lawnChair('#3f8f7a', '#f4f1e8'); NCH.p = [11.6, 0, -4.25];
const HCH = lawnChair('#e3263a', '#f4f1e8'); HCH.p = [1.6, 0, -4.7];
// cop hair (hidden under the cap)
const hair = new Node(null, null, [0, cop.capY - .02, 0]); for (let k = 0; k < 9; k++) hair.add(B(k % 2 ? '#4a2e1c' : '#5a3a24', [-.3 + k * .075, .2 + hsh(k, 3) * .08, (hsh(k, 4) - .5) * .2], [.1, .42 + hsh(k, 5) * .18, .16], { out: .02 }, [0, 0, (k - 4) * .09])); cop.head.add(hair);
const CAPY0 = cop.cap.p.slice();
// police car roof parts
const RF = [pcar.root.children[1], pcar.root.children[2], pcar.l1, pcar.l2].map(n => ({ n, p: n.p.slice(), r: (n.r || [0, 0, 0]).slice() }));
// trees + bushes -> perfect cubes
const TREES = scene.children.filter(n => n.children && n.children.length === 3 && n.children[0].s && Math.abs(n.children[0].s[1] - 2.2) < .01).filter(n => { if (Math.abs(n.p[0] + 3.9) < .1) { n.visible = false; return false; } return true; }).map(n => ({ n, x: n.p[0], c1: n.children[1], c2: n.children[2], s1: n.children[1].s.slice(), p1: n.children[1].p.slice() }));
const BUSH = scene.children.filter(n => n.p && Math.abs(n.p[2] + 3.5) < .01 && n.s && Math.abs(n.p[1] - .4) < .01).map(n => ({ n, x: n.p[0], s: n.s.slice(), p: n.p.slice() }));
const BUSHT = scene.children.filter(n => n.p && Math.abs(n.p[2] + 3.5) < .01 && n.s && Math.abs(n.p[1] - .95) < .01);
// rain cloud over HIS lawn only
const cloud = new Node(); for (const [x, y, z, s] of [[0, 0, 0, 1.6], [1.2, -.1, .2, 1.2], [-1.3, -.15, -.1, 1.3], [.4, .45, -.2, 1.1], [-.6, .35, .3, 1.0], [2.1, -.2, -.2, .8], [-2.2, -.25, .1, .8]]) cloud.add(B('#8d93a6', [x, y, z], [s * 1.2, s * .8, s], { out: .01, spec: 0 })); cloud.p = [0, 5.0, -4.5]; scene.add(cloud);
const DROPS = []; for (let k = 0; k < 40; k++) { const n = new Node('box', { c: [.75, .85, 1], em: .4, a: .7, out: 0, noShadow: 1 }, [0, 0, 0], [.025, .32, .025]); scene.add(n); DROPS.push(n); }
function argue(m, t, amt = 1, seed = 0) { const a = t * 17 + seed; m.sL.r = [-1.6 + Math.sin(a) * 1.2 * amt, 0, .4 + Math.sin(a * 1.3) * .6 * amt]; m.sR.r = [-1.6 + Math.sin(a + 2) * 1.2 * amt, 0, -.4 - Math.sin(a * 1.7) * .6 * amt]; m.eL.r = [-1.2 + Math.sin(a * 2.1) * .8, 0, 0]; m.eR.r = [-1.2 + Math.sin(a * 1.9 + 1) * .8, 0, 0];
  m.body.p = [0, Math.abs(Math.sin(a * .9)) * .18 * amt, 0]; m.body.r = [Math.sin(a * .7) * .2 * amt, Math.sin(a * .5) * .3 * amt, Math.sin(a * 1.1) * .12 * amt]; m.head.r = [Math.sin(a * 2.3) * .25, Math.sin(a * 1.6) * .35, 0]; m.wob = .3; }
let tod = t => ({ k: .42 }); let lighting = t => ({});
function placeMower(h, off = [0, 0, 1.0], yawAdd = 0, extra) { const y = h.root.r[1] + yawAdd, c = Math.cos(y), s = Math.sin(y); mower.visible = true; mower.p = [h.root.p[0] + off[0] * c + off[2] * s, h.root.p[1] + off[1], h.root.p[2] - off[0] * s + off[2] * c]; mower.r = [extra ? extra[0] : 0, y, extra ? extra[2] : 0]; }
const pushPose = h => pose_(h, { sL: [-1.15, 0, .12], sR: [-1.15, 0, -.12], eL: [-.25, 0, 0], eR: [-.25, 0, 0] });
function spray(t, pos, col = [.45, .78, .3], n0 = 0, n1 = 8) { const t0 = t - ((t * 7) % 1) / 7; burst(t0, t, pos, col, n0, n1, .5, 2.2); }
const runPose = (h, t, sp = 26) => { walkPose(h, t, sp, 1.1); h.body.p = [0, Math.abs(Math.sin(t * sp)) * .14, 0]; h.body.r = [.25, 0, 0]; };
// timing marks
const T_MW0 = P[0] + .05, T_MW1 = WD.perfectly + .45;
const T_LAUNCH = at(4, .46), T_DIVE = P[7] + .05, T_CAP = P[7] + .5, T_SLAM = at(8, .32), T_ROOF = at(9, .45), T_GROW = WD.grew - .1;
const tallH = b => .16 + b.j * .07, cutH = .07, nTall = b => .13 + b.j * .015;
// ---------- intro / loop: he gets the mower and mows his lawn ----------
const DOOR = [-1.5, 0, -6.3], ST = [-4.0, 0, -5.8]; const CX = 6.0; const KN = [-2.6, 0, -4.4], HS = [2.9, 0, -3.5];
function intro(t) { const h = hero; let face = 'squint';
  if (t < T_MW0) { const t0 = P[14] - T_END + .2; const u = clamp((t - t0) / (T_MW0 - t0)); h.root.p = lerp3(DOOR, ST, eio(u)); h.root.r = [0, u > .02 && u < .98 ? yawOf(DOOR, ST) : Math.PI / 2, 0]; if (u > .02 && u < .98) walkPose(h, t, 9, .6); pushPose(h); h.body.r = [.15, 0, 0];
    placeMower(h); LAWN_H.forEach(b => setH(b, tallH(b))); h.wob = .1; return face; }
  const u = clamp((t - T_MW0) / (T_MW1 - T_MW0)); const m = mowPath(u, -3.0, 3.4); h.root.p = [m.x - m.dir * 1.0, 0, m.z]; h.root.r = [0, m.dir * Math.PI / 2, 0]; LAWN_H.forEach(b => setH(b, u >= 1 || isCut(b, m) ? cutH : tallH(b)));
  if (u < 1) { runPose(h, t, 28); pushPose(h); placeMower(h); spray(t, [m.x, .3, m.z]); h.wob = .35; face = 'squint'; mower.r[2] = Math.sin(t * 60) * .04; }
  else { const d = t - T_MW1; h.root.p = [3.4 - 1.0, 0, ROWS[3]]; h.root.r = [0, Math.PI / 2 - Math.min(1, d * 3) * 1.2, 0]; placeMower(h, [0, 0, 1.0], 1.2 * Math.min(1, d * 3) - 0); mower.p = [3.4, 0, ROWS[3]]; mower.r = [0, Math.PI / 2, 0]; pose_(h, { sL: [-.3, 0, .3], sR: [-2.5, 0, -.4], eR: [-.4, 0, 0] }); face = 'grin'; h.wob = .1; }
  return face; }
function hideAll() { for (const m of [hero, cop, nb]) { resetPose(m); m.root.visible = false; m.body.s = [1, 1, 1]; } hero.root.visible = true; hero.hat.p = HAT0.slice(); hero.hat.r = [0, 0, -.32]; mower.visible = false; ruler.visible = scis.visible = glass.visible = paper.visible = false; hero.phone.visible = nb.phone.visible = false;
  cop.cap.visible = true; cop.cap.p = CAPY0.slice(); cop.cap.r = [0, 0, 0]; hair.visible = false; hair.s = [1, 1, 1]; pcar.root.visible = false; RF.forEach(o => { o.n.p = o.p.slice(); o.n.r = o.r.slice(); o.n.visible = true; });
  TREES.forEach(o => { o.c1.s = o.s1.slice(); o.c1.p = o.p1.slice(); o.c2.visible = true; }); BUSH.forEach(o => { o.n.s = o.s.slice(); o.n.p = o.p.slice(); }); BUSHT.forEach(n => n.visible = true);
  cloud.visible = false; DROPS.forEach(d => d.visible = false); puffs.forEach(p => p.visible = false); NCH.r = [0, 0, 0]; NCH.p = [11.6, 0, -4.25]; HCH.visible = false; HCH.r = [0, 0, 0]; HCH.p = [1.6, 0, -4.7]; }
const HAT0 = hero.hat.p.slice();
function cubeTrees(xm) { TREES.forEach(o => { if (o.x > xm) return; o.c1.s = [1.7, 1.7, 1.7]; o.c1.p = [0, 3.0, 0]; o.c2.visible = false; }); BUSH.forEach(o => { if (o.x > xm) return; o.n.s = [o.s[0], .32, o.s[2]]; o.n.p = [o.p[0], .16, o.p[2]]; }); BUSHT.forEach(n => { if (n.p[0] <= xm) n.visible = false; }); }
function nbSit(t) { nb.root.visible = true; nb.root.p = [11.6, 0, -4.2]; nb.root.r = [0, -.35, 0]; nb.body.p = [0, -.45, 0]; nb.lL.r = [-1.5, 0, -.12]; nb.lR.r = [-1.5, 0, .12]; nb.lL.k = nb.lR.k = 1.4; paper.visible = true; pose_(nb, { sR: [-1.0, 0, -.2], eR: [-.7, 0, 0], sL: [-1.0, 0, .2], eL: [-.7, 0, 0] }); nb.head.r = [.15, 0, 0]; setFace(nb, 'half'); }
const RIDGE = [9.6, 5.95, -9.4];
function nbRoof() { nb.root.visible = true; nb.root.p = RIDGE.slice(); nb.root.r = [0, 0, 0]; nb.body.p = [0, -.45, 0]; nb.lL.r = [-1.5, 0, -.3]; nb.lR.r = [-1.5, 0, .3]; nb.lL.k = nb.lR.k = 1.2; }
function nbHedge(t) { nb.root.visible = true; nb.root.p = [10.4, 1.9, -6.5]; nb.root.r = [Math.PI, .3, 0]; pose_(nb, { sL: [0, 0, .3], sR: [0, 0, -.3] }); nb.lL.r = [Math.sin(t * 9) * .5, 0, -.2]; nb.lR.r = [-Math.sin(t * 9) * .5, 0, .2]; setFace(nb, 'dizzy'); nb.wob = .3; }
function copCurb(t) { cop.root.visible = true; cop.root.p = [3.6, .12, 2.15]; cop.root.r = [0, 0, 0]; cop.body.p = [0, -.43, 0]; cop.lL.r = [-1.5, 0, -.15]; cop.lR.r = [-1.5, 0, .15]; cop.lL.k = cop.lR.k = 1.5; cop.cap.visible = false; hair.visible = true; hair.s = [1.25, .14, 1.1]; cop.head.r = [.35, 0, 0]; setFace(cop, 'worry'); pose_(cop, { sL: [-.8, 0, .3], sR: [-.8, 0, -.3], eL: [-1.2, 0, 0], eR: [-1.2, 0, 0] }); }
function carParked(t, roof = true) { pcar.root.visible = true; pcar.root.p = [CX, 0, 4.0]; pcar.root.r = [0, Math.PI / 2, 0]; pcar.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; pcar.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; if (!roof) RF.forEach(o => o.n.visible = false); }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  // lawn heights by phase
  if (i >= 1 && i <= 12) LAWN_H.forEach(b => setH(b, cutH)); if (i === 13) LAWN_H.forEach(b => { const g = eback(clamp((t - T_GROW - b.j * .35) / .3)); setH(b, cutH + (tallH(b) - cutH) * Math.max(0, g)); });
  LAWN_N.forEach(b => setH(b, i <= 3 || i === 14 || i === 0 ? nTall(b) : cutH));
  if (i <= 3 || i === 14) nbSit(t);
  if (i === 0) face = intro(t);
  if (i === 1) { h.root.p = KN.slice(); h.root.r = [0, 1.1, 0]; kneel(h); h.body.r = [.35, 0, 0]; ruler.visible = true; pose_(h, { sR: [-.7, 0, -.1], eR: [-.3, 0, 0], sL: [-.4, 0, .4] }); h.head.r = [.35, 0, 0]; face = t < WD.exactly ? 'squint' : 'grin';
    if (t > WD.exactly + .5) { scis.visible = true; ruler.visible = false; const s = Math.sin(t * 30) * .4; sb1.r = [0, 0, s]; sb2.r = [0, 0, -s]; } mower.visible = true; mower.p = [-.2, 0, -5.4]; mower.r = [0, Math.PI / 2, 0]; }
  if (i === 2) { h.root.p = HS.slice(); h.root.r = [0, -.5, 0]; pose_(h, { sL: [-.2, 0, .2], sR: [-.2, 0, -.2] }); const u = eout(clamp((t - WD.saw + .1) / .25)); h.head.r = [0, 1.3 * u, 0]; face = u > .5 ? 'squint' : 'grin'; mower.visible = true; mower.p = [1.6, 0, -5.4]; mower.r = [0, Math.PI / 2, 0]; }
  if (i === 3) { h.root.p = HS.slice(); h.root.r = [0, .7, 0]; const d = t - WD.fucking1; mower.visible = true; mower.p = [1.6, 0, -5.4]; mower.r = [0, Math.PI / 2, 0];
    if (d < 0) { face = 'squint'; h.lR.r = [0, 0, Math.max(0, Math.sin(t * 14)) * .15]; } else { argue(h, t, 1.8, 2); h.root.p[1] = Math.abs(Math.sin(t * 12)) * .5; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .55; h.hat.p = [HAT0[0], HAT0[1] + Math.sin(clamp(d / .9) * Math.PI) * 1.2, 0]; h.hat.r = [0, d * 12, -.32]; } }
  if (i === 4) { const u = clamp((t - P[4] - .05) / (pend(4) - P[4] - .1)); const m = mowPath(u, 3.0, 12.4, 2, 2); h.root.p = [m.x - m.dir * 1.0, 0, m.z]; h.root.r = [0, m.dir * Math.PI / 2, 0]; runPose(h, t, 30); pushPose(h); placeMower(h); spray(t, [m.x, .3, m.z]); face = 'squint'; h.wob = .4;
    LAWN_N.forEach(b => setH(b, rowOf(b.z) >= 2 && isCut(b, m) ? cutH : nTall(b)));
    const d = t - T_LAUNCH; if (d < 0) nbSit(t); else { const a = clamp(d / .75); nb.root.visible = true; nb.root.p = [lerp(11.6, RIDGE[0], a), lerp(.0, RIDGE[1], a) + Math.sin(a * Math.PI) * 4, lerp(-4.2, RIDGE[2], a)]; nb.root.r = [d * 14, d * 5, 0]; pose_(nb, { sL: [-2.8, 0, .9], sR: [-2.8, 0, -.9] }); setFace(nb, 'scream'); nb.wob = .5; NCH.r = [0, 0, Math.min(1.6, d * 8)]; NCH.p = [11.6 + Math.min(.6, d * 3), 0, -4.25]; if (a >= 1) { nbRoof(); setFace(nb, 'dizzy'); } } }
  if (i === 5) { LAWN_N.forEach(b => setH(b, rowOf(b.z) >= 2 ? cutH : nTall(b))); const lst = LAWN_N.filter(b => rowOf(b.z) < 2).sort((a, b) => b.z - a.z || a.x - b.x); const d0 = P[5] + .1, dd = (pend(5) - P[5] - .2) / lst.length; lst.forEach((b, k) => { if (t > d0 + k * dd) setH(b, cutH); });
    const k = clamp(Math.floor((t - d0) / dd), 0, lst.length - 1); const tb = lst[k]; h.root.p = [tb.x, 0, tb.z - .55]; h.root.r = [0, 0, 0]; kneel(h); h.body.r = [.4, 0, 0]; scis.visible = true; const s = Math.sin(t * 60) * .5; sb1.r = [0, 0, s]; sb2.r = [0, 0, -s]; pose_(h, { sR: [-.7 + Math.sin(t * 40) * .3, 0, -.1], eR: [-.3, 0, 0], sL: [-.5, 0, .4] }); h.head.r = [.4, 0, 0]; face = 'squint'; h.wob = .3;
    burst(t - ((t * 9) % 1) / 9, t, [tb.x, .1, tb.z], [.45, .78, .3], 0, 4, .25, 1.4); nbRoof(); setFace(nb, 'wide'); pose_(nb, { sL: [-2.6, 0, .6], sR: [-2.6, 0, -.6] }); NCH.r = [0, 0, 1.6]; NCH.p = [12.2, 0, -4.25]; mower.visible = true; mower.p = [12.4, 0, -3.3]; mower.r = [0, -Math.PI / 2, 0]; }
  if (i === 6) { const d = t - P[6]; NCH.r = [0, 0, 1.6]; NCH.p = [12.2, 0, -4.25]; h.root.p = [6.2, 0, -5.4]; h.root.r = [0, 0, 0]; kneel(h); scis.visible = true; face = 'grin'; h.head.r = [-.4, 0, 0];
    if (d < .95) { nbRoof(); phonePose(nb); setFace(nb, Math.sin(t * 26) > 0 ? 'scream' : 'talk'); nb.body.p[1] = -.45 + Math.abs(Math.sin(t * 14)) * .12; nb.wob = .3; }
    else if (d < 1.35) { const a = clamp((d - .95) / .4); nb.root.visible = true; nb.root.p = [9.6, lerp(5.95, 3.4, a), lerp(-9.4, -6.9, a)]; nb.root.r = [-.6, 0, Math.sin(t * 30) * .3]; pose_(nb, { sL: [-2.8, 0, .9], sR: [-2.8, 0, -.9] }); setFace(nb, 'scream'); nb.wob = .5; }
    else { const a = clamp((d - 1.35) / .25); if (a < 1) { nb.root.visible = true; nb.root.p = [lerp(9.6, 10.4, a), lerp(3.4, 1.9, a), -6.7]; nb.root.r = [Math.PI * a, 0, 0]; setFace(nb, 'scream'); } else nbHedge(t); }
    const u = eout(clamp((t - at(6, .45)) / .5)); if (t > at(6, .45) - .05) { carParked(t); pcar.root.p = [lerp(-30, CX, u), 0, 4.0]; pcar.root.r = [0, Math.PI / 2 - (1 - u) * .8 * Math.sin(u * Math.PI), 0]; } }
  if (i === 7 || i === 8 || i === 9) { if (i < 9 || t < T_ROOF) carParked(t); else { carParked(t, true); const d = t - T_ROOF; RF.forEach((o, k) => { o.n.p = A3(o.p, [-d * 2.5, d * 6 - d * d * 7, (k - 1.5) * d * .8]); o.n.r = [d * 7, d * 3, d * 5]; }); } nbHedge(t); }
  if (i === 7) { cop.root.visible = true; const d = t - T_DIVE; h.root.p = [2.6, 0, -3.3]; h.root.r = [0, .2, 0]; face = 'squint';
    if (d < .45) { const a = clamp(d / .45); cop.root.p = [CX, lerp(1.0, .25, a) + Math.sin(a * Math.PI) * .5, lerp(4.0, 2.2, a)]; cop.root.r = [lerp(.4, 1.45, a), Math.PI, 0]; pose_(cop, { sL: [-2.8, 0, .5], sR: [-2.8, 0, -.5] }); setFace(cop, 'wide'); cop.wob = .4; }
    else if (d < .95) { cop.root.p = [CX, .25, 2.2]; cop.root.r = [1.45, Math.PI, 0]; pose_(cop, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); setFace(cop, 'dizzy'); }
    else { const a = eout(clamp((d - .95) / .3)); cop.root.p = [CX, 0, 2.2]; cop.root.r = [1.45 * (1 - a), Math.PI + .5 * a, 0]; setFace(cop, 'worry'); pose_(cop, { sL: [-.3, 0, .3], sR: [-.3, 0, -.3] }); }
    const dc = t - T_CAP; if (dc > 0) { cop.cap.visible = dc < .8; cop.cap.p = [CAPY0[0], CAPY0[1] + dc * 3 - dc * dc * 4, CAPY0[2] - dc * .8]; cop.cap.r = [dc * 9, 0, dc * 4]; hair.visible = true; const g = eback(clamp(dc / .3)); hair.s = [1, Math.max(.05, g), 1]; }
    if (t > WD.fucking2 - .05) { const e = t - WD.fucking2; argue(h, t, 1.6, 4); h.root.p[1] = Math.abs(Math.sin(t * 12)) * .4; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .5; h.hat.p = [HAT0[0], HAT0[1] + Math.sin(clamp(e / .8) * Math.PI) * 1.0, 0]; }
    mower.visible = true; mower.p = [3.4, 0, -4.0]; mower.r = [0, .4, 0]; }
  if (i === 8) { const d = t - P[8]; cop.root.visible = true; hair.visible = true; cop.cap.visible = false; const CP = [CX, 0, 2.2];
    if (t < T_SLAM + .25) { cop.root.p = CP.slice(); cop.root.r = [0, -.9, 0]; setFace(cop, t < T_SLAM ? 'wide' : 'scream'); pose_(cop, { sL: [-2.2, 0, .5], sR: [-2.2, 0, -.5] }); cop.wob = .3; hair.s = [1, t < T_SLAM ? 1 : .14, 1]; if (t > T_SLAM) hair.s[0] = 1.25;
      const a = clamp((t - P[8]) / (T_SLAM - P[8])); h.root.p = [lerp(2.6, CX - .9, a), Math.sin(a * Math.PI) * 1.6, lerp(-3.3, 1.5, a)]; h.root.r = [0, yawOf([2.6, 0, -3.3], CP), 0]; pose_(h, { sL: [-3.0, 0, .2], sR: [-3.0, 0, -.2], eL: [-.3, 0, 0], eR: [-.3, 0, 0] }); placeMower(h, [0, 2.75, .45], 0, [Math.PI, 0, 0]); mower.r = [Math.PI + Math.sin(t * 50) * .05, h.root.r[1], 0]; face = 'scream'; h.wob = .5;
      if (t > T_SLAM) burst(T_SLAM, t, A3(CP, [0, 2.4, 0]), [.36, .24, .14], 0, 12, .8, 2.5); }
    else { const e = t - T_SLAM - .25; cop.root.p = [CX + e * 22, 0, 2.2 + Math.sin(e * 9) * .6]; cop.root.r = [0, Math.PI / 2, 0]; runPose(cop, t, 34); pose_(cop, { sL: [-2.7, 0, .6], sR: [-2.7, 0, -.6] }); setFace(cop, 'scream'); hair.s = [1.25, .14, 1.1]; cop.wob = .6;
      h.root.p = [CX - .9 + e * 16, 0, 1.6]; h.root.r = [0, Math.PI / 2, 0]; runPose(h, t, 30); pushPose(h); placeMower(h); spray(t, A3(mower.p, [0, .3, 0]), [.36, .4, .4], 12, 16); face = 'squint'; h.wob = .4; } }
  if (i === 9) { const u = clamp((t - P[9] + .05) / (pend(9) - P[9])); h.root.p = [lerp(CX - 2.6, CX + 2.9, u), 1.15, 4.0]; h.root.r = [0, Math.PI / 2, 0]; runPose(h, t, 30); pushPose(h); placeMower(h); spray(t, A3(mower.p, [0, .3, 0]), [.85, .85, .9], 0, 10); face = 'squint'; h.wob = .4; }
  if (i === 10) { const u = clamp((t - P[10]) / (pend(10) - P[10])); const x = lerp(-26, 30, u); h.root.p = [x, 0, -.9]; h.root.r = [0, Math.PI / 2, 0]; runPose(h, t, 34); pushPose(h); placeMower(h); spray(t, A3(mower.p, [0, .5, 0]), [.4, .7, .3], 0, 16); cubeTrees(x + 1); face = Math.sin(t * 20) > 0 ? 'scream' : 'squint'; h.wob = .5;
    carParked(t, false); nbHedge(t); copCurb(t); }
  if (i >= 11 && i <= 13) { cubeTrees(99); carParked(t, false); nbHedge(t); copCurb(t); HCH.visible = true; h.root.p = [1.6, 0, -4.65]; h.root.r = [0, 0, 0]; h.body.p = [0, -.43, 0]; h.lL.r = [-1.45, 0, -.14]; h.lR.r = [-1.45, 0, .14]; h.lL.k = h.lR.k = 1.4; glass.visible = true;
    pose_(h, { sL: [-1.1, 0, -.1], eL: [-1.4, 0, 0], sR: [-.3, 0, -.4] }); face = 'closed'; h.wob = .05; mower.visible = true; mower.p = [3.0, 0, -5.4]; mower.r = [0, -.6, 0]; }
  if (i === 12 || i === 13) { cloud.visible = true; const d = t - P[12]; cloud.p = [1.6 + Math.sin(t * .8) * .1, 4.1 + Math.sin(t * 2) * .08, -4.7 - .3 * (1 - eout(clamp(d / .4)))]; cloud.s = [1, 1, 1].map(v => v * eback(clamp(d / .35)));
    DROPS.forEach((n, k) => { const ph_ = (t * 2.2 + hsh(k, 1)) % 1; n.visible = true; n.p = [1.6 + (hsh(k, 2) - .5) * 3.6, 3.8 - ph_ * 3.9, -4.6 + (hsh(k, 3) - .5) * 3.2]; }); face = 'worry'; h.head.r = [-.5, 0, 0]; pose_(h, { sL: [-.6, 0, .2], eL: [-.6, 0, 0], sR: [-.3, 0, -.4] }); }
  if (i === 13) { const d = t - T_GROW; if (d > 0) { face = 'wide'; h.head.r = [.3, 0, 0]; } if (d > .7) { const a = eout(clamp((d - .7) / .35)); HCH.r = [-1.4 * a, 0, 0]; HCH.p = [1.6, .0, -4.7 - .4 * a]; h.root.p = [1.6, .25 * a, -4.65 - .4 * a]; h.root.r = [-1.45 * a, 0, 0]; pose_(h, { sL: [-2.8, 0, .8], sR: [-2.8, 0, -.8] }); h.lL.r = [-2.4, 0, -.2]; h.lR.r = [-2.0, 0, .2]; face = 'scream'; h.wob = .5; glass.visible = false; } }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, nb]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
