// =====================================================================
//  EP14 "THE LEAF BLOWER" — one leaf. Blower war. Jet engine. Leaf in the middle.
// =====================================================================
const pose_ = (m, o) => { for (const k in o) m[k].r = o[k]; };
const A3 = (b, d) => [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
const yawOf = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
let late = [];
function pathTo(target) { const st = []; const dfs = n => { st.push(n); if (n === target) return true; for (const c of n.children) if (dfs(c)) return true; st.pop(); return false; }; dfs(scene); return st; }
function wp(target, off = [0, 0, 0]) { const ch = target._path || (target._path = pathTo(target)); let m = M4.ident(); for (const n of ch) m = M4.mul(m, M4.trs(n.p, n.r, n.s)); return [m[0] * off[0] + m[4] * off[1] + m[8] * off[2] + m[12], m[1] * off[0] + m[5] * off[1] + m[9] * off[2] + m[13], m[2] * off[0] + m[6] * off[1] + m[10] * off[2] + m[14]]; }
const GY = -.06;
// ---------- lawns (perfect) ----------
const LAWN_H = [], LAWN_N = [];
function mkLawn(arr, x0, x1, z0, z1, skip) { for (let z = z0; z <= z1 + 1e-6; z += .4) for (let x = x0; x <= x1 + 1e-6; x += .4) { if (skip(x, z)) continue; const row = Math.round((z - z0) / .4);
  const g = hsh(x * 1.7, z * 2.9) * .08; const n = new Node('box', { c: (row % 2 ? [.49, .74, .34] : [.41, .66, .29]).map((v, q) => v + (q === 1 ? g : g * .4)), out: 0, spec: .05, rim: .12 }, [x, 0, z], [.36, .1, .35]); scene.add(n); arr.push({ n, x, z, j: hsh(x * 3.1 + 7, z * 7.3) }); } }
mkLawn(LAWN_H, -3.0, 3.4, -6.0, -3.0, (x, z) => (x > -2.3 && x < -.7) || (x > -.2 && x < 2.0 && z > -4.0));
mkLawn(LAWN_N, 5.6, 12.4, -6.0, -3.0, (x, z) => (x > 6.7 && x < 8.3) || (x > 11.5 && z < -5.0));
const setH = (b, h) => { b.n.s[1] = h; b.n.p[1] = GY + h / 2; };
LAWN_H.forEach(b => setH(b, .07)); LAWN_N.forEach(b => setH(b, .085 + b.j * .02));
// ---------- scenery tweaks: hide middle tree, left tree, neighbor bush ----------
const TREES = scene.children.filter(n => n.children && n.children.length === 3 && n.children[0].s && Math.abs(n.children[0].s[1] - 2.2) < .01);
TREES.forEach(n => { if (Math.abs(n.p[0] + 3.9) < .1 || Math.abs(n.p[0] - 4.3) < .1) n.visible = false; });
const BUSH = scene.children.filter(n => n.p && Math.abs(n.p[2] + 3.5) < .01 && n.s && (Math.abs(n.p[1] - .4) < .01 || Math.abs(n.p[1] - .95) < .01));
BUSH.forEach(n => { if (Math.abs(n.p[0] - 9.9) < .2 || Math.abs(n.p[0] - .9) < .2) n.visible = false; });
const BINS0 = scene.children.filter(n => n.p && n.p[0] > 6.9 && n.p[0] < 8.7 && n.p[2] > -2.0 && n.p[2] < -1.5); BINS0.forEach(n => n.p[0] += 5.6);
// ---------- props ----------
const leafMat = { c: hex('#ff6a1a'), out: .012, spec: .1, rim: .3, em: .3 };
function mkLeaf(sc = 1) { const n = new Node(); n.add(new Node('box', Object.assign({}, leafMat), [0, 0, 0], [.46 * sc, .03, .32 * sc])); n.add(B('#b8451c', [0, .02, 0], [.44 * sc, .012, .035], { out: 0 })); for (const s of [-1, 1]) n.add(B('#b8451c', [.05 * sc, .02, s * .07 * sc], [.2 * sc, .01, .025], { out: 0 }, [0, s * .7, 0])); n.add(B('#7a4a2a', [-.27 * sc, .02, 0], [.12 * sc, .02, .025], { out: 0 })); scene.add(n); return n; }
const LEAF = mkLeaf(1.9); lamp.visible = false;
const FACELEAF = new Node(null, null, [0, .48, .13], null, [-1.5708, 0, .3]); { const l = new Node('box', Object.assign({}, leafMat), [0, 0, 0], [.62, .03, .5]); FACELEAF.add(l); FACELEAF.add(B('#b8451c', [0, .02, 0], [.6, .012, .04], { out: 0 })); } hero.head.add(FACELEAF);
function mkBlower(col) { const n = new Node(null, null, [0, -.06, .12]); n.add(B(col, [0, .02, .14], [.3, .34, .36], { spec: .4, rim: .2 })); n.add(B('#2a2a30', [0, .21, .14], [.14, .06, .3])); n.add(B('#f4f1e8', [.16, .02, .14], [.02, .12, .12], { out: 0 }));
  n.add(new Node('cyl', { c: hex('#3a3a40'), out: .01, spec: .5 }, [0, -.52, 0], [.13, .95, .13])); n.add(new Node('cyl', { c: hex(col), out: .01 }, [0, -1.02, 0], [.17, .08, .17])); return n; }
const BLR = mkBlower('#f08a24'); hero.armR.end.add(BLR); const BLL = mkBlower('#f08a24'); hero.armL.end.add(BLL);
const NBL = mkBlower('#3f8f7a');
// mouth blower (tube along +z from the face)
const MB = new Node(null, null, [.0, .3, .12]); MB.add(B('#f0c44a', [0, 0, .12], [.2, .2, .22], { spec: .4 })); MB.add(new Node('cyl', { c: hex('#3a3a40'), out: .01, spec: .5 }, [0, 0, .62], [.1, .8, .1], [1.5708, 0, 0])); MB.add(new Node('cyl', { c: hex('#f0c44a'), out: .01 }, [0, 0, 1.03], [.14, .07, .14], [1.5708, 0, 0])); hero.head.add(MB);
// giant backpack blower (on hero.body)
const BIG = new Node(); BIG.add(B('#d8302c', [0, 1.5, -.62], [1.05, 1.35, .7], { spec: .5, rim: .2 })); BIG.add(B('#2a2a30', [0, 2.3, -.62], [.7, .25, .5])); BIG.add(new Node('cyl', { c: hex('#3a3a40'), out: .01, spec: .5 }, [0, 1.5, -1.0], [.7, .12, .7], [1.5708, 0, 0]));
for (let k = 0; k < 5; k++) BIG.add(B('#f4f1e8', [-.3 + k * .15, 1.0, -.27], [.06, .3, .02], { out: 0 })); BIG.add(B('#f0c44a', [0, 1.95, -.26], [.8, .14, .02], { out: 0 }));
BIG.add(new Node('cyl', { c: hex('#3a3a40'), out: .01, spec: .5 }, [.52, 1.05, .75], [.42, 2.3, .42], [1.5708, 0, 0])); BIG.add(new Node('cyl', { c: hex('#d8302c'), out: .01 }, [.52, 1.05, 1.95], [.52, .14, .52], [1.5708, 0, 0])); hero.body.add(BIG);
// flying hat (world copy)
const FHAT = new Node(); FHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, 0, 0], [.4, .035, .4])); FHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, .02, 0], [.22, .2, .22])); FHAT.add(new Node('cyl', { c: hex('#d8302c'), out: 0 }, [0, .03, 0], [.226, .045, .226])); FHAT.s = [1.5, 1.5, 1.5]; scene.add(FHAT);
// donut
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [0, 0, .045], [.09, .06, .09], [1.5708, 0, 0]));
cop.armR.end.add(DON);
// neighbor + paper + chairs
const paper = B('#f4f1e8', [0, -.1, .14], [.36, .26, .02], { out: .01 }); paper.add(B('#1b1b20', [0, .06, .6], [.8, .08, .1], { out: 0 }));
const nb = man({ id: 'med', shape: 'can', seed: 12, skin: SK.med, shirt: '#f08aa8', stripe: '#e47aa0', pants: '#5b6f8f', shoe: '#f4f1e8', hair: '#c9c9d0' }); scene.add(nb.root); nb.armR.end.add(paper); nb.armL.end.add(NBL);
function lawnChair(c1, c2) { const c = new Node(); for (const sx of [-.3, .3]) { c.add(B('#d9d9d4', [sx, .2, .15], [.04, .42, .04], { spec: .6 }, [-.3, 0, 0])); c.add(B('#d9d9d4', [sx, .2, -.15], [.04, .42, .04], { spec: .6 }, [.3, 0, 0])); c.add(B('#d9d9d4', [sx, .42, 0], [.04, .04, .6], { spec: .6 })); }
  for (let k = 0; k < 4; k++) c.add(B(k % 2 ? c1 : c2, [0, .43, -.24 + k * .16], [.6, .03, .15], { out: .004 })); for (let k = 0; k < 4; k++) c.add(B(k % 2 ? c1 : c2, [0, .55 + k * .14, -.36 - k * .04], [.6, .13, .03], { out: .004 }, [-.25, 0, 0])); scene.add(c); return c; }
const NCH = lawnChair('#3f8f7a', '#f4f1e8');
// jet engine
const JP = [10.3, 1.42, -4.6];
const JET = new Node(); JET.add(new Node('cyl', { c: hex('#c9ccd4'), out: .01, spec: .9, rim: .3 }, [0, 0, 0], [2.3, 3.0, 2.3], [0, 0, 1.5708]));
JET.add(new Node('cyl', { c: hex('#8a8e96'), out: .01, spec: .9 }, [1.55, 0, 0], [2.5, .22, 2.5], [0, 0, 1.5708])); JET.add(new Node('cyl', { c: hex('#1d1d22'), out: 0 }, [1.62, 0, 0], [2.1, .05, 2.1], [0, 0, 1.5708]));
const FAN = new Node(null, null, [1.66, 0, 0]); for (let k = 0; k < 10; k++) FAN.add(B('#b9bcc4', [0, 0, 0], [.04, 1.95, .22], { out: 0, spec: .8 }, [k * .314, 0, 0])); FAN.add(new Node('cyl', { c: hex('#e3263a'), out: .01 }, [0, 0, 0], [.5, .12, .5], [0, 0, 1.5708])); JET.add(FAN);
JET.add(new Node('cyl', { c: hex('#3a3a40'), out: .01, spec: .5 }, [-1.75, 0, 0], [1.75, .6, 1.75], [0, 0, 1.5708])); const FLAME = new Node('cyl', { c: [1, .6, .2], em: 1, out: 0, noShadow: 1 }, [-2.06, 0, 0], [1.3, .04, 1.3], [0, 0, 1.5708]); JET.add(FLAME);
for (let k = 0; k < 6; k++) JET.add(B('#e3263a', [-1.2 + k * .5, 0, 1.16], [.18, .5, .02], { out: 0 })); JET.add(B('#f4f1e8', [0, .62, 1.12], [1.6, .2, .02], { out: 0 }));
for (const x of [-1, 1]) { JET.add(B('#3a3a40', [x, -.9, 0], [.25, .9, 1.9])); for (const z of [-.9, .9]) JET.add(new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [x, -1.28, z], [.32, .14, .32], [1.5708, 0, 0])); }
const LEVER = new Node(null, null, [-.6, 1.16, .35]); LEVER.add(B('#2a2a30', [0, .3, 0], [.06, .6, .06])); LEVER.add(B('#e3263a', [0, .62, 0], [.16, .16, .16])); JET.add(LEVER); JET.add(B('#3a3a40', [-.6, 1.16, .35], [.3, .12, .3]));
scene.add(JET);
const BROKEN = new Node(); BROKEN.add(B('#1b1b22', [0, 0, 0], [1.0, 1.1, .04], { out: 0 })); for (let k = 0; k < 6; k++) BROKEN.add(B('#bcd9e6', [-.4 + k * .16, (k % 2 ? .45 : -.45), .03], [.12, .2 + hsh(k, 2) * .25, .02], { out: 0 }, [0, 0, (hsh(k, 3) - .5) * 1.2])); BROKEN.p = [9.6, 2.3, -6.94]; scene.add(BROKEN);
// flying bins (copies)
function mkBin(c) { const n = new Node(); n.add(B(c, [0, 0, 0], [.6, 1.1, .6], { out: .012 })); n.add(B('#2f3238', [0, .59, 0], [.68, .1, .68], { out: .012 })); scene.add(n); return n; }
const FB = [mkBin('#4f8a5b'), mkBin('#3f6fb5')];
// wind streaks
const STRK = []; for (let k = 0; k < 56; k++) { const n = new Node('box', { c: [1, 1, 1], em: .7, a: .5, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.035, .035, .75]); n.visible = false; scene.add(n); STRK.push(n); }
function stream(t, o, d, len, n0, n1, rad = .5, sp = 1, al = .55) { d = norm(d); const p1 = norm(cross(d, [0, 1, 0])), p2 = cross(p1, d); const yaw = Math.atan2(d[0], d[2]), pit = -Math.asin(clamp(d[1], -1, 1));
  for (let k = n0; k < n1; k++) { const q = STRK[k]; const f = (t * 2.4 * sp + hsh(k, 1)) % 1; const a = hsh(k, 2) * 6.283, r = rad * (.25 + f) * hsh(k, 3);
    q.visible = true; q.p = [o[0] + d[0] * len * f + (p1[0] * Math.cos(a) + p2[0] * Math.sin(a)) * r, o[1] + d[1] * len * f + (p1[1] * Math.cos(a) + p2[1] * Math.sin(a)) * r, o[2] + d[2] * len * f + (p1[2] * Math.cos(a) + p2[2] * Math.sin(a)) * r];
    q.r = [pit, yaw, 0]; q.mat.a = al * Math.sin(f * Math.PI); q.s = [.035, .035, .5 + .6 * sp]; } }
function argue(m, t, amt = 1, seed = 0) { const a = t * 17 + seed; m.sL.r = [-1.6 + Math.sin(a) * 1.2 * amt, 0, .4 + Math.sin(a * 1.3) * .6 * amt]; m.sR.r = [-1.6 + Math.sin(a + 2) * 1.2 * amt, 0, -.4 - Math.sin(a * 1.7) * .6 * amt]; m.eL.r = [-1.2 + Math.sin(a * 2.1) * .8, 0, 0]; m.eR.r = [-1.2 + Math.sin(a * 1.9 + 1) * .8, 0, 0];
  m.body.p = [0, Math.abs(Math.sin(a * .9)) * .18 * amt, 0]; m.body.r = [Math.sin(a * .7) * .2 * amt, Math.sin(a * .5) * .3 * amt, Math.sin(a * 1.1) * .12 * amt]; m.head.r = [Math.sin(a * 2.3) * .25, Math.sin(a * 1.6) * .35, 0]; m.wob = .3; }
let tod = t => ({ k: .42 }); let lighting = t => ({});
const runPose = (h, t, sp = 26) => { walkPose(h, t, sp, 1.1); h.body.p = [0, Math.abs(Math.sin(t * sp)) * .14, 0]; h.body.r = [.25, 0, 0]; };
const aimR = m => pose_(m, { sR: [-1.45, 0, -.05], eR: [-.1, 0, 0] }), aimL = m => pose_(m, { sL: [-1.45, 0, .05], eL: [-.1, 0, 0] });
const brace = (m, t, k = 1) => { m.lL.r = [.45 * k, 0, -.15]; m.lR.r = [-.55 * k, 0, .15]; m.lL.k = .2; m.lR.k = .5; m.body.r = [.3 * k, 0, Math.sin(t * 31) * .04]; m.body.p = [0, -.06, 0]; };
// ---------- places & times ----------
const HS = [1.5, 0, -4.55], LS = [2.75, .05, -3.6], DOOR = [-1.5, 0, -6.6], NCHP = [11.6, 0, -4.25], NSIT = [11.6, 0, -4.2], NBS = [7.6, 0, -4.4], LPAP = [11.22, 1.28, -3.72], WIN = [9.6, 2.0, -7.2], LM = [5.35, 1.75, -4.5];
const HAT0 = hero.hat.p.slice();
let LPAPW = LPAP;
const T_F0 = P[14] - T_END, T_LAND = WD.landed + .35;
const T_GONE = P[1] + .32, T_BACK = P[1] + .7, T_BL = WD.blew + .1, T_PAP = T_BL + 1.25;
const T_NJ = P[3] + .08, T_NB = P[3] + .45, T_LB = WD.back - .05, T_HAT = P[4] + .18;
const T_BIGP = P[5] + .12, T_BIG = WD.bigger + .2, T_WIN = T_BIG + .5;
const T_JIN = P[6], T_JON = WD.fucking2 - .02, T_FLY = T_JON + .55, T_FACE = T_JON + .42;
const T_COP0 = P[7] + .05, T_STAND = P[9] + .12, T_MB = WD.fucking3 - .05, T_OFF = WD.mouth + .05, T_MID = T_OFF + .55, T_GAS = WD.gas + .1, T_UP = T_GAS + .12, T_PLOP = P[13] + .8;
function leafFlutter(t, pos, amp = 1) { LEAF.visible = true; LEAF.p = pos; LEAF.r = [Math.sin(t * 13) * .5 * amp, t * 3 * amp, Math.sin(t * 17 + 1) * .5 * amp]; }
function leafArc(t, t0, t1, a, b, h, spin = 1) { const u = clamp((t - t0) / (t1 - t0)); const p = lerp3(a, b, u); p[1] += Math.sin(u * Math.PI) * h; LEAF.visible = true; LEAF.p = p; LEAF.r = [u * 9 * spin, u * 5, Math.sin(t * 20) * .6]; return u; }
const LEAFGROUND = p => { LEAF.visible = true; LEAF.p = p; LEAF.r = [0, .6, 0]; };
// ---------- intro / loop: the leaf falls very slowly onto his perfect lawn ----------
function intro(t) { const h = hero; let face = 'halfup'; h.root.p = HS.slice(); h.root.r = [0, .55, 0]; pose_(h, { sL: [-.15, 0, .55], eL: [-1.6, 0, 0], sR: [-.15, 0, -.55], eR: [-1.6, 0, 0] }); h.wob = .08;
  const u = clamp((t - T_F0) / (T_LAND - T_F0)); if (u < 1) { const y = LS[1] + 9.2 * Math.pow(1 - u, 1.15); LEAF.visible = true; LEAF.p = [LS[0] + Math.sin(u * Math.PI * 4.5) * .9 * (1 - u * .8), y, LS[2] + Math.cos(u * Math.PI * 3) * .3 * (1 - u)]; LEAF.r = [0, u * 2, Math.sin(u * Math.PI * 4.5 + 1.57) * .55]; const look = yawOf(HS, LEAF.p) - .55; h.head.r = [-clamp((y - 2.3) / 5, -.2, .75), clamp(look, -.7, .7), 0]; face = y > 3 ? 'halfup' : 'half'; }
  else { LEAFGROUND(LS); const d = t - T_LAND; h.head.r = [.35, .35, 0]; face = d < .25 ? 'half' : 'wide'; if (t > WD.lawn0 + .1) { face = 'squint'; h.root.p[0] += Math.sin(t * 70) * .025; h.wob = .25; pose_(h, { sL: [-.3, 0, .4], eL: [-.4, 0, 0], sR: [-.3, 0, -.4], eR: [-.4, 0, 0] }); } }
  return face; }
function hideAll() { for (const m of [hero, cop, nb]) { resetPose(m); m.root.visible = false; m.body.s = [1, 1, 1]; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice();
  BLR.visible = BLL.visible = NBL.visible = MB.visible = BIG.visible = FACELEAF.visible = false; paper.visible = DON.visible = false; FHAT.visible = false; LEAF.visible = false; JET.visible = false; FB.forEach(b => b.visible = false); BINS0.forEach(n => n.visible = true);
  STRK.forEach(s => s.visible = false); puffs.forEach(p => p.visible = false); NCH.visible = true; NCH.r = [0, 0, 0]; NCH.p = NCHP.slice(); pcar.root.visible = false; FLAME.mat.em = 1; FLAME.s = [1.3, .04, 1.3]; DON.s = [1, 1, 1]; LEVER.r = [0, 0, 0]; MB.p = [0, .3, .12]; MB.s = [1, 1, 1]; BIG.s = [1, 1, 1]; FACELEAF.r = [-1.5708, 0, .3]; BROKEN.visible = false; }
function nbSit(t, read = true) { nb.root.visible = true; nb.root.p = NSIT.slice(); nb.root.r = [0, -.35, 0]; nb.body.p = [0, -.45, 0]; nb.lL.r = [-1.5, 0, -.12]; nb.lR.r = [-1.5, 0, .12]; nb.lL.k = nb.lR.k = 1.4; paper.visible = read; pose_(nb, { sR: [-1.0, 0, -.2], eR: [-.7, 0, 0], sL: [-1.0, 0, .2], eL: [-.7, 0, 0] }); nb.head.r = [.15, 0, 0]; setFace(nb, 'half'); }
function nbBlow(t, pos, yaw) { nb.root.visible = true; nb.root.p = pos; nb.root.r = [0, yaw, 0]; NBL.visible = true; aimL(nb); nb.sR.r = [-.3, 0, -.5]; brace(nb, t, .8); nb.wob = .2; setFace(nb, 'squint');
  late.push(() => { const o = wp(NBL, [0, -1.05, 0]), d = sub(wp(NBL, [0, -2, 0]), o); stream(t, o, d, 4.8, 14, 28, .55, 1.1); }); }
function heroBlowHand(t, both = false, dir) { const h = hero; BLR.visible = true; aimR(h); if (both) { BLL.visible = true; aimL(h); } late.push(() => { for (const [bl, n0] of both ? [[BLR, 0], [BLL, 7]] : [[BLR, 0]]) { const o = wp(bl, [0, -1.05, 0]), d = dir || sub(wp(bl, [0, -2, 0]), o); stream(t, o, d, both ? 2.6 : 4.5, n0, n0 + (both ? 7 : 14), .5, 1.1); } }); }
function jetRun(t, on = 1) { JET.visible = true; JET.p = JP.slice(); JET.r = [0, 0, 0]; FAN.r = [t * 40 * on, 0, 0]; FLAME.mat.em = on > .5 ? .8 + .2 * Math.sin(t * 60) : .15; FLAME.s = [1.3, .04 + .4 * on, 1.3];
  if (on > .5) { stream(t, A3(JP, [-2.1, 0, 0]), [-1, 0, 0], 9, 28, 56, 1.1, 1.6, .6); JET.p = A3(JP, [Math.sin(t * 50) * .02, Math.sin(t * 43) * .02, 0]); } }
function nbRide(t, pull = 0) { nb.root.visible = true; nb.root.p = A3(JET.p, [.2, 1.18, 0]); nb.root.r = [0, -Math.PI / 2, 0]; nb.body.p = [0, -.43, 0]; nb.lL.r = [-1.3, 0, -.8]; nb.lR.r = [-1.3, 0, .8]; nb.lL.k = nb.lR.k = 1.6;
  pose_(nb, { sL: [-1.2 + pull * .9, 0, .5], eL: [-.4, 0, 0], sR: [-2.6, 0, -.3], eR: [-.3, 0, 0] }); nb.wob = .2; setFace(nb, 'squint'); }
function nbWindow(t) { BROKEN.visible = true; nb.root.visible = true; nb.root.p = [9.6, 2.0, -5.85]; nb.root.r = [-1.35, 0, Math.sin(t * 3) * .05]; nb.lL.r = [Math.sin(t * 16) * .8, 0, -.25]; nb.lR.r = [-Math.sin(t * 16) * .8, 0, .25]; pose_(nb, { sL: [-2.9, 0, .3], sR: [-2.9, 0, -.3] }); nb.wob = .4; NBL.visible = false; }
const flagHero = (h, t, x) => { h.root.p = [x, .55 + Math.sin(t * 18) * .15, HS[2]]; h.root.r = [-1.5708, -Math.PI / 2, Math.sin(t * 22) * .15]; pose_(h, { sL: [-3.0, 0, .3], sR: [-3.0, 0, -.3], eL: [-.2, 0, 0], eR: [-.2, 0, 0] }); h.lL.r = [Math.sin(t * 30) * .6, 0, -.3]; h.lR.r = [-Math.sin(t * 30) * .6, 0, .3]; h.wob = .9; };
nbSit(0); applyNoodle(nb, 0); LPAPW = wp(paper, [0, 0, .04]);
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  if (i <= 2 || i === 14) nbSit(t);
  if (i === 0) face = intro(t);
  if (i === 1) { LEAFGROUND(LS); face = 'squint';
    if (t < T_GONE) { const u = clamp((t - P[1] - .05) / (T_GONE - P[1] - .05)); h.root.p = lerp3(HS, DOOR, eio(u)); h.root.r = [0, yawOf(HS, DOOR), 0]; runPose(h, t, 34); h.wob = .5; if (u > .9) h.root.visible = false; }
    else if (t < T_BACK) { h.root.visible = false; burst(T_GONE, t, A3(DOOR, [0, 1.2, .4]), [.85, .8, .75], 0, 10, 1.0, 1.5); }
    else { const u = clamp((t - T_BACK) / .28); h.root.p = lerp3(DOOR, HS, eout(u)); h.root.r = [0, u < 1 ? yawOf(DOOR, HS) : yawOf(HS, LS), 0]; BLR.visible = true; if (u < 1) { runPose(h, t, 34); aimR(h); h.wob = .5; } else { aimR(h); brace(h, t, .4); face = 'grin'; h.root.p[1] = Math.abs(Math.sin(t * 60)) * .02; } } }
  if (i === 2) { h.root.p = HS.slice(); leafArc(t, T_BL, T_PAP, LS, LPAPW, 3.2, 1); if (t < T_BL) LEAFGROUND(LS); h.root.r = [0, t < T_BL ? yawOf(HS, LS) : lerp(yawOf(HS, LS), 1.45, eout(clamp((t - T_BL) / .5))), 0]; aimR(h); brace(h, t, .5); face = t < T_BL ? 'grin' : 'squint';
    if (t > T_BL) heroBlowHand(t); else BLR.visible = true; if (t >= T_PAP) { LEAF.p = LPAPW.slice(); LEAF.r = [-1.45, -.35, 0]; setFace(nb, t > T_PAP + .3 ? 'squint' : 'wide'); } }
  if (i === 3 || i === 4) { h.root.p = HS.slice(); h.root.r = [0, 1.45, 0]; BLR.visible = true; pose_(h, { sR: [-.6, 0, -.3], eR: [-.4, 0, 0], sL: [-.3, 0, .3] }); face = 'wide'; h.wob = .3;
    if (t < T_NB) { nbSit(t, t < T_NJ); if (t > T_NJ) { const a = clamp((t - T_NJ) / (T_NB - T_NJ)); nb.root.p = [lerp(NSIT[0], NBS[0], a), Math.sin(a * Math.PI) * 2.6, lerp(NSIT[2], NBS[2], a)]; nb.root.r = [a * 6.283, -Math.PI / 2, 0]; nb.body.p = [0, 0, 0]; pose_(nb, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); nb.lL.r = [-.4, 0, -.5]; nb.lR.r = [.3, 0, .5]; nb.lL.k = nb.lR.k = 0; setFace(nb, 'squint'); nb.wob = .5; NBL.visible = a > .5; NCH.r = [0, 0, Math.min(1.6, (t - T_NJ) * 9)]; NCH.p = [12.2, 0, -4.25]; } }
    else { NCH.r = [0, 0, 1.6]; NCH.p = [12.2, 0, -4.25]; nbBlow(t, NBS.slice(), -Math.PI / 2 - .05); }
    if (t < T_NJ) { LEAF.visible = true; LEAF.p = LPAPW.slice(); LEAF.r = [-1.45, -.35, 0]; } else if (t < T_LB) { const a = clamp((t - T_NJ) / .5); LEAF.visible = true; LEAF.p = [lerp(LPAPW[0], 10.6, a), lerp(LPAPW[1], .06, eout(a)), lerp(LPAPW[2], -3.9, a)]; LEAF.r = [a * 4, a, Math.sin(t * 14) * .4]; }
    else { const u = leafArc(t, T_LB, T_LB + .6, [10.6, .06, -3.9], LS, 2.4, -1); if (u >= 1) leafFlutter(t, A3(LS, [0, .02 + Math.abs(Math.sin(t * 9)) * .05, 0]), .25); } }
  if (i === 3 && t > T_LB + .5) { face = 'wide'; h.wob = .45; }
  if (i === 4) { const dh = t - T_HAT; face = 'wide'; h.wob = .5; h.head.r = [-.2, 0, Math.sin(t * 40) * .06];
    if (dh > 0) { hero.hat.visible = false; FHAT.visible = true; FHAT.p = [HS[0] - .2 - dh * 5.5, 3.0 + dh * 7 - dh * dh * 1.5, HS[2] - dh * 1.2]; FHAT.r = [dh * 11, dh * 4, dh * 7]; }
    if (t > WD.fucking1 - .05) { argue(h, t, 1.7, 2); h.root.p[1] = Math.abs(Math.sin(t * 12)) * .5; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .6; BLR.visible = false; } }
  if (i >= 4 && i <= 12) hero.hat.visible = false;
  if (i === 5) { h.root.p = HS.slice(); h.root.r = [0, 1.45, 0]; face = 'squint'; NCH.r = [0, 0, 1.6]; NCH.p = [12.2, 0, -4.25];
    if (t < T_BIGP) { pose_(h, { sL: [-.3, 0, .4], sR: [-.3, 0, -.4] }); LEAFGROUND(LS); }
    else { BIG.visible = true; burst(T_BIGP, t, A3(HS, [0, 1.6, 0]), [.85, .8, .75], 0, 8, .9, 1.4); BIG.s = [1, 1, 1].map(v => v * Math.max(.01, eback(clamp((t - T_BIGP) / .25)))); pose_(h, { sR: [-1.2, 0, .25], eR: [-.4, 0, 0], sL: [-1.0, 0, .45], eL: [-.8, 0, 0] }); brace(h, t, .6); face = t < T_BIG ? 'grin' : 'squint';
      if (t < T_BIG) LEAFGROUND(LS); else { const d = t - T_BIG; h.root.p[0] -= Math.min(.35, d * 2); h.body.r[2] += Math.sin(t * 50) * .05; h.wob = .35; late.push(() => { const o = wp(BIG, [.52, 1.05, 2.05]); stream(t, o, sub(wp(BIG, [.52, 1.05, 3]), o), 7, 0, 28, .9, 1.6, .65); }); leafArc(t, T_BIG, T_BIG + .45, LS, A3(WIN, [0, .2, .3]), 1.0, 2); if (t > T_BIG + .45) LEAF.visible = false; } }
    if (t < T_BIG + .3) nbBlow(t, NBS.slice(), -Math.PI / 2 - .05); else { const a = clamp((t - T_BIG - .3) / (T_WIN - T_BIG - .3)); if (a < 1) { nb.root.visible = true; nb.root.p = [lerp(NBS[0], WIN[0], a), lerp(0, WIN[1] - .6, a) + Math.sin(a * Math.PI) * 1.2, lerp(NBS[2], WIN[2], a)]; nb.root.r = [-a * 5, -Math.PI / 2, a * 2]; pose_(nb, { sL: [-2.8, 0, .9], sR: [-2.8, 0, -.9] }); nb.lL.r = [-1.2, 0, -.4]; nb.lR.r = [-1.0, 0, .4]; setFace(nb, 'scream'); nb.wob = .6; NBL.visible = true; }
      else nbWindow(t); burst(T_WIN, t, WIN, [.75, .9, 1], 8, 16, 1.1, 2.2); }
    if (t > T_BIG) { const d = t - T_BIG; NCH.p = [12.2 + d * 9, d * 6 - d * d * 6, -4.25 - d * 2]; NCH.r = [d * 8, d * 3, 1.6 + d * 6]; if (d > 1) NCH.visible = false; } }
  if (i >= 6) NCH.visible = false; if (i >= 6 && i <= 13) BROKEN.visible = true;
  if (i === 6) { const ja = eout(clamp((t - T_JIN) / .55)); jetRun(t, t > T_JON ? 1 : 0); JET.p = [lerp(26, JP[0], ja), JP[1] + (ja < 1 ? Math.abs(Math.sin(t * 30)) * .08 : 0), JP[2]]; JET.r = [0, 0, (1 - ja) * .15]; FAN.r = [t > T_JON ? (t - T_JON) * 50 : 0, 0, 0];
    const pull = clamp((t - T_JON + .12) / .12); nbRide(t, pull); LEVER.r = [0, 0, pull * .9]; if (t > T_JON) setFace(nb, Math.sin(t * 20) > 0 ? 'scream' : 'grin');
    h.root.r = [0, 1.45, 0]; BIG.visible = true;
    if (t < T_JON + .1) { h.root.p = HS.slice(); pose_(h, { sR: [-1.2, 0, .25], eR: [-.4, 0, 0], sL: [-1.0, 0, .45], eL: [-.8, 0, 0] }); brace(h, t, .6); face = t > T_JIN + .5 ? 'wide' : 'squint'; late.push(() => { const o = wp(BIG, [.52, 1.05, 2.05]); stream(t, o, sub(wp(BIG, [.52, 1.05, 3]), o), 5, 0, 14, .7, 1.4, .5); }); }
    else if (t < T_FLY) { const a = clamp((t - T_JON - .1) / (T_FLY - T_JON - .1)); h.root.p = [lerp(HS[0], -.4, eio(a)), 0, HS[2]]; brace(h, t, -.6); h.body.r = [-.45, 0, Math.sin(t * 40) * .1]; pose_(h, { sL: [-2.6, 0, .9], sR: [-2.6, 0, -.9] }); face = 'scream'; h.wob = .7; burst(T_JON + .1, t, A3(HS, [-.6, .1, 0]), [.45, .72, .3], 0, 6, .4, 1.2); }
    else { flagHero(h, t, -1.0 - Math.min(.5, (t - T_FLY) * 2)); face = 'scream'; }
    if (t > T_JON) { if (t < T_FACE) leafArc(t, T_JON, T_FACE, A3(JP, [-2.4, .2, 0]), A3(HS, [-.3, 2.3, 0]), .6, 3); else { FACELEAF.visible = true; face = 'scream'; } } }
  if (i === 7 || i === 8) { jetRun(t, 1); nbRide(t, 1); LEVER.r = [0, 0, .9]; setFace(nb, 'grin'); flagHero(h, t, -1.5); FACELEAF.visible = true; BIG.visible = true;
    // the cop flies by, sitting, eating his donut
    cop.root.visible = true; DON.visible = true; const ct = t - T_COP0; const cx = t < P[8] ? lerp(8.5, -3, clamp(ct / (P[8] - T_COP0))) : -3 - (t - P[8]) * 3.6; cop.root.p = [cx, 2.5 + Math.sin(t * 2.2) * .25, -1.0]; cop.root.r = [Math.sin(t * 1.7) * .12, -.25, Math.sin(t * 1.3) * .2 + .15];
    cop.body.p = [0, -.43, 0]; cop.lL.r = [-1.45, 0, -.12]; cop.lR.r = [-1.45, 0, .12]; cop.lL.k = cop.lR.k = 1.3; pose_(cop, { sR: [-.25, 0, .95], eR: [-.4, 0, 2.2], sL: [-.4, 0, .3], eL: [-1.2, 0, 0] }); cop.wob = .25; setFace(cop, 'half');
    if (t > WD.donut - .05) { const d = t - WD.donut + .05; setFace(cop, Math.sin(d * 18) > 0 ? 'talk' : 'closed'); DON.s = d > .1 ? [.75, 1, .75] : [1, 1, 1]; }
    cop.cap.p = [0, cop.capY + .05 + Math.abs(Math.sin(t * 6)) * .04, 0]; }
  if (i >= 9 && i <= 13) { JET.visible = true; JET.p = JP.slice(); nbRide(t, 1); LEVER.r = [0, 0, .9]; setFace(nb, 'squint'); }
  if (i >= 9 && i <= 11) { jetRun(t, 1); nbRide(t, 1); h.root.p = HS.slice(); h.root.r = [0, Math.PI / 2, 0]; brace(h, t, 1); h.wob = .45; face = 'squint';
    if (t < T_STAND) { burst(P[9], t, A3(HS, [0, 1.2, 0]), [.85, .8, .75], 0, 6, .8, 1.2); }
    heroBlowHand(t, true, t > T_OFF ? [1, 0, 0] : null); h.root.p[0] += Math.sin(t * 9) * .05;
    if (t < T_OFF) { FACELEAF.visible = true; FACELEAF.r = [-1.5708 + Math.sin(t * 40) * .08, 0, .3]; }
    if (t > T_MB) { MB.visible = true; MB.s = [1, 1, 1].map(v => v * Math.max(.01, eback(clamp((t - T_MB) / .15)))); if (t < T_MB + .45) { h.root.p[1] = Math.sin(clamp((t - T_MB) / .45) * Math.PI) * .5; }
      if (t > T_OFF) late.push(() => { const o = wp(MB, [0, 0, 1.08]); stream(t, o, sub(wp(MB, [0, 0, 2]), o), 3.4, 14, 22, .35, 1.2); }); }
    if (t > T_OFF) { const u = clamp((t - T_OFF) / (T_MID - T_OFF)); const a = A3(HS, [.3, 2.3, 0]); LEAF.visible = true; LEAF.p = lerp3(a, LM, eout(u)); LEAF.p[1] += Math.sin(u * Math.PI) * .8; LEAF.r = [u * 8, 0, Math.sin(t * 30) * .4]; if (u >= 1) leafFlutter(t, A3(LM, [Math.sin(t * 37) * .04, Math.sin(t * 29) * .05, 0]), .15); } }
  if (i === 11) { for (let k = 0; k < 2; k++) { const d = t - P[11] - k * .25; if (d < 0) continue; BINS0.forEach(n => n.visible = false); const b = FB[k]; b.visible = true; const yy = Math.min(4.2 + k * .8, .55 + d * 6); b.p = [LM[0] + Math.cos(t * 4 + k * 3) * (1.1 - k * .2), yy, LM[2] + Math.sin(t * 4 + k * 3) * .8]; b.r = [t * (5 + k), t * 3, t * (4 - k)]; } }
  if (i >= 12 && i <= 13) BINS0.forEach(n => n.visible = false);
  if (i === 12) { const g = t < T_GAS; h.root.p = HS.slice(); h.root.r = [0, Math.PI / 2, 0]; brace(h, t, g ? 1 : .2); face = g ? 'squint' : 'wide'; aimL(h); aimR(h); BLR.visible = BLL.visible = true; MB.visible = t < T_GAS + .2;
    const sp = t > WD.ran && g ? (Math.sin(t * 30) > -.2 ? 1 : 0) : 1;
    if (g) { if (sp) { jetRun(t, 1); heroBlowHand(t, true, [1, 0, 0]); late.push(() => { const o = wp(MB, [0, 0, 1.08]); stream(t, o, [1, 0, 0], 3.4, 14, 22, .35, 1.2); }); } else jetRun(t, .3); leafFlutter(t, A3(LM, [Math.sin(t * 37) * .04, Math.sin(t * 29) * .05, 0]), .15); }
    else { const d = t - T_GAS; jetRun(t, 0); FAN.r = [(T_GAS - P[12]) * 40 + (1 - Math.exp(-d * 2)) * 8, 0, 0]; pose_(h, { sR: [-.7 + d * .3, 0, -.1], sL: [-.7 + d * .3, 0, .1] }); burst(T_GAS, t, A3(JP, [-2.2, 0, 0]), [.15, .15, .17], 0, 8, 1.2, 1.0); burst(T_GAS + .05, t, A3(HS, [1.3, 1.5, 0]), [.2, .2, .22], 8, 12, .5, 1.0);
      if (d < .12) leafFlutter(t, LM, .1); else { const e = d - .12; LEAF.visible = true; LEAF.p = [LM[0], LM[1] + e * 24, LM[2]]; LEAF.r = [0, e * 30, 0]; }
      if (t > T_GAS + .2) { MB.visible = true; MB.p = [0, .3 - Math.min(.3, (t - T_GAS - .2) * 2), .12]; } face = d > .4 ? 'up' : 'wide'; h.head.r = [d > .4 ? -.5 : 0, 0, 0]; }
    for (let k = 0; k < 2; k++) { const b = FB[k]; b.visible = true; const tg = T_GAS + .25 + k * .15; if (t < tg) { b.p = [LM[0] + Math.cos(t * 4 + k * 3) * (1.1 - k * .2), 4.2 + k * .8, LM[2] + Math.sin(t * 4 + k * 3) * .8]; b.r = [t * (5 + k), t * 3, t * (4 - k)]; } else { const e = t - tg; const y = Math.max(.55, 4.2 + k * .8 - e * e * 30); b.p = [LM[0] + (k ? .9 : -.8), y, LM[2] + (k ? .6 : -.3)]; b.r = y > .56 ? [e * 9, 0, e * 7] : [0, k * .6, k ? 1.5708 : 0]; if (k && y <= .56) b.p[1] = .3; } } }
  if (i === 13) { jetRun(t, 0); FAN.r = [1.2, 0, 0]; h.root.p = HS.slice(); h.root.r = [0, Math.PI / 2 - .4, 0]; BLR.visible = BLL.visible = true; pose_(h, { sR: [-.2, 0, -.1], sL: [-.2, 0, .1] }); face = 'up'; h.head.r = [-.55, 0, 0]; h.wob = .08; setFace(nb, 'up'); nb.head.r = [-.5, 0, 0];
    MB.visible = false; for (let k = 0; k < 2; k++) { const b = FB[k]; b.visible = true; b.p = [LM[0] + (k ? .9 : -.8), k ? .3 : .55, LM[2] + (k ? .6 : -.3)]; b.r = [0, k * .6, k ? 1.5708 : 0]; }
    const dp = t - T_PLOP; if (dp < 0) { hero.hat.visible = false; FHAT.visible = true; FHAT.p = [HS[0] + .1, 2.95 - dp * 10, HS[2]]; FHAT.r = [0, t * 6, 0]; } else { hero.hat.visible = true; face = dp < .3 ? 'closed' : 'halfup'; h.body.p = [0, -Math.max(0, .12 - dp * .6), 0]; }
    // the cop is stuck upside-down in the bush, legs kicking
    cop.root.visible = true; cop.root.p = [.5, 2.35, -5.4]; cop.root.r = [Math.PI, .5, .12]; burst(P[13] - .3, t, [.5, .1, -5.4], [.45, .72, .3], 0, 6, .5, 1.0); cop.lL.r = [Math.sin(t * 14) * .7, 0, -.3]; cop.lR.r = [-Math.sin(t * 14) * .7, 0, .3]; pose_(cop, { sL: [0, 0, .2], sR: [0, 0, -.2] }); cop.wob = .3; }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, nb]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
