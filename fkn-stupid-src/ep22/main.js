// =====================================================================
//  EP22 "THE HOLE" — he dug a hole. Where does the dirt go? So he dug another hole.
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
lamp.p = [-9.5, 0, 1.4];
scene.children.forEach(n => { if (!n.p) return; const z = n.p[2]; if (Math.abs(z - 10.9) < .01 && n.children && n.children.length > 3) n.visible = false; if (z > 14.7 && z < 16.3 && n.p[1] > 3) n.visible = false; if (Math.abs(n.p[0] - 12) < .01 && n.s && Math.abs(n.s[0] - 2.6) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .2 && Math.abs(z - 6.3) < .3) n.visible = false; });
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] - 9.6) < .01 && n.p[2] > 1.4 && n.p[2] < 1.5) n.visible = false; });
scene.children.forEach(n => { if (n.p && (Math.abs(n.p[0] - 4.3) < .01 || Math.abs(n.p[0] + 3.9) < .01) && n.p[2] < -3 && n.p[2] > -6 && n.children && n.children.length === 3) n.visible = false; });
scene.children.forEach(n => { if (n.p && n.p[0] > 5.2 && n.p[0] < 8.7 && n.p[2] > -2.3 && n.p[2] < -1.5) n.p = [n.p[0] + 7.5, n.p[1], n.p[2]]; }); // mailbox/bins out of the way
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] - .9) < .01 && Math.abs(n.p[2] + 3.5) < .01) n.visible = false; if (n.p && Math.abs(n.p[0] - 1.2) < .01 && Math.abs(n.p[2] + 3.5) < .01) n.visible = false; if (n.p && (Math.abs(n.p[0] - 9.1) < .01 || Math.abs(n.p[0] - 9.4) < .01) && Math.abs(n.p[2] + 3.5) < .01) n.visible = false; }); // hero's front bush
const NWIN = WINS.find(w => { const p = wp(w); return Math.abs(p[0] - 9.6) < .05 && p[2] < -6; });
let tod = t => ({ k: .42 }); let lighting = t => ({});
const runPose = (h, t, sp = 26) => { walkPose(h, t, sp, 1.1); h.body.p = [0, Math.abs(Math.sin(t * sp)) * .14, 0]; h.body.r = [.25, 0, 0]; };
const STRK = []; for (let k = 0; k < 40; k++) { const n = new Node('box', { c: [1, 1, 1], em: .7, a: .5, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.035, .035, .75]); n.visible = false; scene.add(n); STRK.push(n); }
function stream(t, o, d, len, n0, n1, rad = .5, sp = 1, al = .55) { d = norm(d); const p1 = norm(cross(d, [0, 1, 0])), p2 = cross(p1, d); const yaw = Math.atan2(d[0], d[2]), pit = -Math.asin(clamp(d[1], -1, 1));
  for (let k = n0; k < n1; k++) { const q = STRK[k]; const f = (t * 2.4 * sp + hsh(k, 1)) % 1; const a = hsh(k, 2) * 6.283, r = rad * (.25 + f) * hsh(k, 3);
    q.visible = true; q.p = [o[0] + d[0] * len * f + (p1[0] * Math.cos(a) + p2[0] * Math.sin(a)) * r, o[1] + d[1] * len * f + (p1[1] * Math.cos(a) + p2[1] * Math.sin(a)) * r, o[2] + d[2] * len * f + (p1[2] * Math.cos(a) + p2[2] * Math.sin(a)) * r];
    q.r = [pit, yaw, 0]; q.mat.a = al * Math.sin(f * Math.PI); q.s = [.035, .035, .5 + .6 * sp]; } }
// dust trail behind runners (uses puffs n0..n1)
function dust(t, pos, n0 = 8, n1 = 16, col = [.85, .8, .72]) { for (let k = n0; k < n1; k++) { const q = puffs[k]; const f = (t * 3 + hsh(k, 1)) % 1; q.visible = true; q.p = [pos[0] - f * 2.2, .15 + f * .6, pos[2] + (hsh(k, 2) - .5) * .6]; q.mat.c = col; q.mat.a = .55 * (1 - f); q.s = [.25, .25, .25].map(v => v * (1 + f * 2)); } }
// ===================== EP22 scene: THE HOLE =====================
R.mesh('mound', Geo.lathe([[1e-4, 0], [.5, 0], [.47, .1], [.4, .3], [.29, .58], [.16, .84], [.05, .97], [1e-4, 1]], 28));
const DM = (c = '#6b4a2e', c2 = '#5a3c24') => ({ c: hex(c), c2: hex(c2), pat: 6, ps: 4, out: .008, spec: .04, rim: .06 });
const S = [-1.0, 0, -3.7];
const HP_ = [S, [3.4, 0, -3.6], [-3.9, 0, -3.6], [2.4, 0, -5.8], [-3.4, 0, -5.9]];
const PP = [[.5, 0, -4.1], [4.7, 0, -4.4], [-5.4, 0, -4.5], [4.3, 0, -5.5], [-5.5, 0, -5.6]];
const PR = [[.45, .55], [.75, 1.0], [1.15, 1.6], [1.35, 2.0], [1.6, 2.5]], PR1B = [.95, 1.35];
const G = [3.0, 0, -4.7], GR = 2.6, MR = [3.3, 7.5], MR2 = [3.7, 9.5];
const stand = H => [H[0], 0, H[2] - .85];
const HOME = [.9, 0, -5.0], SHVG0 = [.25, 0, -5.35];
// ---------- holes ----------
function mkHole(r, deep) { const g = new Node(); scene.add(g);
  const rim = new Node('cyl', { c: hex('#7a5636'), out: 0, noShadow: 1 }, [0, -.056, 0], [2 * r + .34, .012, (2 * r + .34) * .85]); g.add(rim);
  const dk = new Node('cyl', { c: hex(deep ? '#120b06' : '#1e140c'), out: 0, noShadow: 1, spec: 0, rim: 0 }, [0, -.046, 0], [2 * r, .012, 2 * r * .85]); g.add(dk);
  const md = new Node('cyl', { c: hex('#3a2616'), out: 0, noShadow: 1, spec: 0, rim: 0 }, [0, -.05, -.06], [2 * r + .12, .012, (2 * r + .12) * .85]); g.add(md);
  const fill = new Node('mound', DM('#7a5636', '#5a3c24'), [0, -.07, 0], [2 * r + .2, .2, (2 * r + .2) * .85]); g.add(fill);
  return { g, dk, md, fill, r }; }
const HL = HP_.map(H => { const o = mkHole(.55); o.g.p = H.slice(); return o; });
const GH = mkHole(GR, 1); GH.g.p = G.slice();
function setHole(o, mode, sc = 1) { o.g.visible = mode > 0 && sc > .02; o.g.s = [sc, 1, sc]; o.dk.visible = o.md.visible = mode === 1; o.fill.visible = mode === 2; }
// ---------- piles ----------
const PILEA = new Node('mound', DM(), [0, 0, 0], [1, 1, 1]); scene.add(PILEA);
const PILEB = new Node('mound', DM(), [0, 0, 0], [1, 1, 1]); scene.add(PILEB);
const SNOW = new Node('mound', { c: hex('#f6f4ef'), out: .006, spec: .2, rim: .2 }, [0, .79, 0], [.42, .22, .42]); PILEA.add(SNOW);
const FLAG = new Node(null, null, [0, .995, 0]); FLAG.add(B('#8a8e96', [0, .06, 0], [.006, .12, .006], { out: 0 })); FLAG.add(B('#e3263a', [.02, .1, 0], [.04, .03, .004], { out: 0 })); PILEA.add(FLAG);
const TINY = new Node('mound', DM(), [S[0], -.06, S[2]], [.5, .3, .45]); scene.add(TINY);
function setPile(n, p, r, h) { n.visible = r > .02; n.p = [p[0], -.07, p[2]]; n.s = [2 * r, h, 2 * r * .9]; }
// worm
const WORM = new Node(); for (let k = 0; k < 4; k++) WORM.add(B('#f08aa8', [0, .1 + k * .13, 0], [.14 - k * .01, .14, .14 - k * .01], { out: .006 })); WORM.add(B('#1b1b20', [-.035, .52, .07], [.03, .04, .01], { out: 0 })); WORM.add(B('#1b1b20', [.035, .52, .07], [.03, .06, .01], { out: 0 })); scene.add(WORM);
// bird
const BIRD = new Node(); BIRD.add(B('#3a3a44', [0, 0, 0], [.16, .14, .3], { out: .006 })); BIRD.add(B('#f0b23a', [0, 0, .19], [.06, .05, .1], { out: 0 })); const BW1 = B('#2a2a34', [-.16, .02, 0], [.3, .02, .16], { out: 0 }), BW2 = B('#2a2a34', [.16, .02, 0], [.3, .02, .16], { out: 0 }); BIRD.add(BW1); BIRD.add(BW2); BIRD.s = [1.4, 1.4, 1.4]; scene.add(BIRD);
function setBird(p, yaw, t, flap = 1) { BIRD.visible = true; BIRD.p = p.slice(); BIRD.r = [0, yaw, 0]; const a = flap ? Math.sin(t * 30) * .9 : 0; BW1.r = [0, 0, a]; BW2.r = [0, 0, -a]; }
// shovel in hand + shovel stuck in the lawn
const SHV = new Node(null, null, [0, -.08, .05]); SHV.add(new Node('cyl', { c: hex('#8a5a3a'), out: .008 }, [0, -.3, .35], [.05, .7, .05], [1.1, 0, 0])); SHV.add(B('#8a8e96', [0, -.62, .96], [.28, .04, .34], { spec: .8, out: .008 }, [1.1, 0, 0])); hero.armR.end.add(SHV);
const SHVG = new Node(); SHVG.add(new Node('cyl', { c: hex('#8a5a3a'), out: .008 }, [0, .3, 0], [.05, 1.25, .05])); SHVG.add(B('#8a8e96', [0, .18, 0], [.28, .36, .04], { spec: .8, out: .008 })); SHVG.add(B('#8a5a3a', [0, 1.55, 0], [.2, .05, .05])); SHVG.r = [.12, .3, .08]; scene.add(SHVG);
// dirt clods
const DIRT = []; for (let k = 0; k < 16; k++) { const n = B('#6b4a2e', [0, 0, 0], [.16, .12, .14], { out: .004 }); n.visible = false; scene.add(n); DIRT.push(n); }
function dirtArc(t, a, b, n = 10, period = .3, ht = 1.6, sz = 1, k0 = 0) { for (let j = 0; j < n; j++) { const k = k0 + j; const q = DIRT[k]; const f = ((t / period) + j / n) % 1; q.visible = true;
  q.p = [lerp(a[0], b[0], f) + (hsh(k, 2) - .5) * .4 * sz, lerp(a[1], b[1], f) + Math.sin(f * Math.PI) * ht, lerp(a[2], b[2], f) + (hsh(k, 3) - .5) * .4 * sz]; q.r = [f * 7, k, f * 5]; q.s = [.16 * sz, .12 * sz, .14 * sz]; } }
const CLOD = B('#6b4a2e', [0, 0, 0], [.3, .24, .28], { out: .006 }); scene.add(CLOD);
// neighbor on the phone
const NB = man({ id: 'nb', shape: 'can', seed: 7, skin: '#e8b48f', shirt: '#8a6aa8', stripe: '#7a5a98', pants: '#3a3a44', shoe: '#e9e4d4', hair: '#6b4a36' }); scene.add(NB.root);
const NBP = [7.6, 0, -3.3], NBY = -1.25;
// ---------- poses ----------
function digPose(h, t, sp = 22) { const a = Math.sin(t * sp); pose_(h, { sR: [-.9 + a * .6, 0, -.15], eR: [-.5 - a * .3, 0, 0], sL: [-.9 + a * .6, 0, .35], eL: [-.7, 0, 0] }); h.body.r = [.35 + a * .15, 0, 0]; h.body.p = [0, -.08 + a * .05, 0]; h.wob = .3; }
function carryPose(h) { pose_(h, { sL: [-2.95, 0, .35], eL: [-.2, 0, 0], sR: [-2.95, 0, -.35], eR: [-.2, 0, 0] }); }
function zoomTo(h, t, a, b, u) { h.root.p = lerp3(a, b, eio(u)); h.root.r = [0, yawOf(a, b), 0]; wheelRun(h, t, 60, .6); late.push(() => stream(t, A3(h.root.p, [0, 1.4, 0]), norm(sub(a, b)), 3, 0, 14, .7, 2, .5)); }
// ---------- cycles: dig hole k, carry pile k-1 over head into it ----------
const CY = [null, [P[2] + .05, P[2] + .35, WD.dirt2 - .35, WD.dirt2 + .3], [P[4] + .03, P[4] + .25, P[4] + .95, P[4] + 1.6], [P[5] + .02, P[5] + .17, P[5] + .67, P[5] + 1.05], [P[5] + 1.1, P[5] + 1.25, P[5] + 1.75, P[5] + 2.2]];
const T_BOOST = WD.fucking1 - .05;
const pr = (k, t) => (k === 1 && t > T_BOOST) ? [lerp(PR[1][0], PR1B[0], eback(clamp((t - T_BOOST) / .35))), lerp(PR[1][1], PR1B[1], eback(clamp((t - T_BOOST) / .35)))] : PR[k];
const T_COPRUN = P[6] + .08, T_COPGATE = P[6] + .45, T_FALL = WD.fell + .08, T_LOOK = WD.fucking2 - .1;
const T_MT = P[9] + .05, T_GDIG = P[10] + .1, T_GEND = pend(10) - .15;
const T_PUSH0 = P[11] + .2, T_SLIDE = P[11] + .4, T_SINK = pend(11) - .45, T_FLAT = pend(11) - .08;
const T_POP = WD.climbed - .05, T_HIT = P[5] + .55;
const GATE = [-1.4, 0, -2.0];
// world state for holes and piles
function world(t) { const i = ph(t); const flat = t >= T_FLAT || t < 0; TINY.visible = false;
  // first hole (S)
  if (t < 0 || i >= 15) { setHole(HL[0], 0); TINY.visible = true; TINY.s = [.5, .3, .45]; } else if (flat) setHole(HL[0], 0); else setHole(HL[0], 1, i === 0 ? eout(clamp((t - P[0] - .1) / 1.1)) : 1);
  if (i === 0 && t < P[0] + .3) { TINY.visible = true; TINY.s = [.5, .3 * (1 - clamp((t - P[0]) / .3)), .45]; }
  if (i === 14 && t > T_POP) { TINY.visible = true; const u = eback(clamp((t - T_POP) / .3)); TINY.s = [.5 * u, .3 * u, .45 * u]; } if (i === 13 && t > T_POP) { TINY.visible = true; const u = eback(clamp((t - T_POP) / .3)); TINY.s = [.5 * u, .3 * u, .45 * u]; }
  for (let k = 1; k <= 4; k++) { const [tz, td, tc, tx] = CY[k]; if (flat || t < td) setHole(HL[k], 0); else if (t < tx) setHole(HL[k], 1, eout(clamp((t - td) / (tc - td)))); else setHole(HL[k], 2); if ((k === 1 || k === 3) && t > T_GDIG + .25 && !flat) setHole(HL[k], 0); }
  // giant hole
  if (t >= T_GDIG && !flat) setHole(GH, 1, eout(clamp((t - T_GDIG) / (T_GEND - T_GDIG)))); else setHole(GH, 0);
  // piles
  PILEA.visible = PILEB.visible = false; SNOW.visible = FLAG.visible = false;
  if (t >= 0 && i < 15 && !flat) {
    if (t < CY[1][1]) setPile(PILEA, PP[0], PR[0][0] * eout(clamp((t - P[0] - .1) / 1.1)), PR[0][1] * eout(clamp((t - P[0] - .1) / 1.1)));
    else { let k = 1; for (let j = 1; j <= 4; j++) if (t >= CY[j][1]) k = j; const [tz, td, tc, tx] = CY[k]; const g = eout(clamp((t - td) / (tc - td)));
      if (k === 4 && t >= tx) { // pile 5 -> mountain
        let r = PR[4][0], h = PR[4][1]; if (t > T_MT) { const u = eback(clamp((t - T_MT) / .7)); r = lerp(r, MR[0], u); h = lerp(h, MR[1], u); SNOW.visible = FLAG.visible = u > .8; }
        if (t > T_GDIG) { const u = clamp((t - T_GDIG) / (T_GEND - T_GDIG)); r = lerp(MR[0], MR2[0], u); h = lerp(MR[1], MR2[1], u); }
        let p = PP[4].slice(), y = 0; if (t > T_SLIDE) { const u = eio(clamp((t - T_SLIDE) / (T_SINK - T_SLIDE))); p = lerp3(PP[4], G, u); } if (t > T_SINK) { const u = clamp((t - T_SINK) / (T_FLAT - T_SINK)); y = -h * u * u; r = lerp(r, GR * 1.05, u); }
        setPile(PILEA, p, r, h); PILEA.p[1] = -.07 + y; }
      else { const pk = pr(k, t); setPile(PILEA, PP[k], pk[0] * g, pk[1] * g);
        if (t < tx) { const pq = pr(k - 1, t); if (t < tc) setPile(PILEB, PP[k - 1], pq[0], pq[1]); else { setPile(PILEB, [0, 0, 0], pq[0] * .8, pq[1] * .8); PILEB._c = [1, 0, k]; PILEB.r = [0, 0, Math.sin(t * 20) * .08]; } }
        else if (t < tx + .2) { const pq = pr(k - 1, t), u = (t - tx) / .2; setPile(PILEB, [0, 0, 0], pq[0] * .8 * (1 - u), pq[1] * .8 * (1 - u)); PILEB._c = [2, u, k]; } } } }
  if (PILEB.visible === false) PILEB.r = [0, 0, 0]; }
// ---------- loop intro: he grabs his shovel and walks to the tiny pile ----------
function intro(t) { const h = hero; let face = 'neutral'; const t0 = P[15] - T_END; // ≈ -2.6
  const tg = t0 + .55, tw = t0 + .85, ta = -.35;
  if (t < tg) { h.root.p = HOME.slice(); h.root.r = [0, yawOf(HOME, S) + .2, 0]; face = 'half'; SHVG.visible = true; SHVG.p = SHVG0.slice(); if (t > tg - .3) { pose_(h, { sR: [-1.2 * clamp((t - tg + .3) / .3), 0, -.3] }); h.root.r = [0, yawOf(HOME, SHVG0), 0]; face = 'squint'; } }
  else if (t < tw) { h.root.p = HOME.slice(); h.root.r = [0, yawOf(HOME, SHVG0), 0]; SHV.visible = true; pose_(h, { sR: [-1.4, 0, -.2], eR: [-.4, 0, 0] }); face = 'grin'; h.body.p = [0, Math.sin(clamp((t - tg) / .3) * Math.PI) * .2, 0]; }
  else if (t < ta) { const u = clamp((t - tw) / (ta - tw)); h.root.p = lerp3(HOME, stand(S), u); h.root.r = [0, yawOf(HOME, stand(S)), 0]; walkPose(h, t, 10, .8); SHV.visible = true; pose_(h, { sR: [-.9, 0, -.2], eR: [-.6, 0, 0] }); face = 'squint'; }
  else { h.root.p = stand(S); h.root.r = [0, lerp(yawOf(HOME, stand(S)), 0, clamp((t - ta) / .2)), 0]; SHV.visible = true; const u = clamp((t - ta) / .35); pose_(h, { sR: [-.9 - .7 * u, 0, -.15], eR: [-.5, 0, 0], sL: [-.9 - .7 * u, 0, .35], eL: [-.7, 0, 0] }); h.body.r = [-.1 * u, 0, 0]; face = 'grin'; }
  nbIdle(t); return face; }
function nbIdle(t) { NB.root.visible = true; NB.root.p = NBP.slice(); NB.root.r = [0, NBY, 0]; phonePose(NB); setFace(NB, Math.sin(t * 9) > 0 ? 'talk' : 'neutral'); NB.head.r = [0, Math.sin(t * 1.3) * .2, 0]; }
function hideAll() { for (const m of [hero, cop, NB]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice();
  puffs.forEach(p => p.visible = false); STRK.forEach(s => s.visible = false); DIRT.forEach(d => d.visible = false); SHV.visible = false; SHVG.visible = false; DON.visible = false; WORM.visible = false; BIRD.visible = false; CLOD.visible = false; pcar.root.visible = false; }
const HAT0 = hero.hat.p.slice();
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); cop.armR.end.add(DON);
const COPHEAD_Y = -1.95;
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'squint';
  PILEB._c = null; world(t);
  if (i === 0) { if (t < P[0]) face = intro(t); else { h.root.p = stand(S); SHV.visible = true; digPose(h, t, 24); face = 'grin'; dirtArc(t, A3(S, [0, .3, 0]), A3(PP[0], [0, .4, 0]), 6, .35, 1.4, .8); nbIdle(t); } }
  if (i >= 1 && i <= 5) nbIdle(t);
  if (i === 1) { h.root.p = stand(S); h.root.r = [0, .35, 0]; SHVG.visible = true; SHVG.p = A3(stand(S), [-.55, 0, .25]); pose_(h, { sL: [-2.6, 0, .9], eL: [-1.9 + Math.sin(t * 20) * .3, 0, 0] }); face = 'squint'; h.head.r = [0, .5 * Math.sin(clamp((t - P[1]) / 1.2) * Math.PI * 2), 0];
    const dw = t - (WD.dirt1 - .2); if (dw > 0 && dw < 1.4) { WORM.visible = true; const up = Math.sin(clamp(dw / 1.4) * Math.PI); WORM.p = [PP[0][0], -.07 + PR[0][1] - .45 + up * .45, PP[0][2]]; WORM.r = [0, Math.sin(dw * 6) * .8 + .4, Math.sin(dw * 9) * .15]; } }
  // dig cycles L2, L4, L5
  for (let k = 1; k <= 4; k++) { const [tz, td, tc, tx] = CY[k]; const prevEnd = k === 1 ? P[2] : CY[k - 1][3]; const lineOk = (k === 1 && i === 2) || (k === 2 && i === 4) || (k >= 3 && i === 5); if (!lineOk || t < tz || (k < 4 && t >= CY[k + 1][0] && i === 5)) continue;
    const from = k === 1 ? stand(S) : stand(HP_[k - 1]), at_ = stand(HP_[k]); SHV.visible = true;
    if (t < td) zoomTo(h, t, from, at_, (t - tz) / (td - tz));
    else if (t < tc) { h.root.p = at_; h.root.r = [0, 0, 0]; digPose(h, t, 40); face = 'grin'; dirtArc(t, A3(HP_[k], [0, .3, 0]), A3(PP[k], [0, .5, 0]), 10, .22, 1.6 + k * .2, 1); }
    else if (t < tx) { const pick = PP[k - 1], u = clamp((t - tc) / (tx - tc)); if (u < .3) zoomTo(h, t, at_, A3(pick, [.3, 0, .3]), u / .3); else { zoomTo(h, t, A3(pick, [.3, 0, .3]), A3(HP_[k], [0, 0, -.6]), (u - .3) / .7); }
      SHV.visible = false; carryPose(h); face = u > .3 ? 'grin' : 'wide'; }
    else { h.root.p = A3(HP_[k], [0, 0, -.6]); h.root.r = [0, 0, 0]; SHV.visible = false; const u = clamp((t - tx) / .25); pose_(h, { sL: [lerp(-2.95, -1.2, u), 0, .35], sR: [lerp(-2.95, -1.2, u), 0, -.35] }); face = 'grin'; burst(tx + .15, t, A3(HP_[k], [0, .2, 0]), [.55, .4, .28], 0, 8, 1, 1.2); } }
  if (i === 2 && t < CY[1][0]) { h.root.p = stand(S); }
  if (i === 3) { const at_ = A3(HP_[1], [0, 0, -.6]); h.root.p = at_; h.root.r = [0, .5, 0]; face = 'neutral'; h.head.r = [0, .35, 0];
    if (t > T_BOOST) { const d = t - T_BOOST; face = Math.sin(t * 24) > 0 ? 'scream' : 'wide'; pose_(h, { sL: [-2.9, 0, .7], sR: [-2.9, 0, -.7] }); h.root.p = A3(at_, [0, Math.max(0, Math.sin(clamp(d / .4) * Math.PI)) * .8, 0]); h.hat.p = A3(HAT0, [0, Math.max(0, Math.sin(clamp(d / .7) * Math.PI)) * 1.2, 0]); h.wob = .5; }
    burst(T_BOOST, t, A3(PP[1], [0, PR1B[1] * .8, 0]), [.55, .4, .28], 0, 10, 1.3, 1.5); }
  if (i === 4 && t < CY[2][0]) h.root.p = A3(HP_[1], [0, 0, -.6]);
  if (i === 5 && t < CY[3][0]) h.root.p = A3(HP_[2], [0, 0, -.6]);
  // L5 gag: a clod flies onto the neighbor
  if (i === 5) { const d = t - T_HIT; if (d > 0 && d < .35) { CLOD.visible = true; const a = A3(HP_[3], [0, .3, 0]), b = A3(NBP, [.1, 2.4, 0]); const u = d / .35; CLOD.p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * 2.4, lerp(a[2], b[2], u)]; CLOD.r = [d * 9, d * 7, 0]; } }
  if (t > T_HIT + .35 && i <= 13) { const d = t - T_HIT - .35; NB.root.visible = true; resetPose(NB); NB.root.p = NBP.slice(); const u = clamp(d / .35); NB.root.r = [-1.5 * eout(u), NBY, 0]; setFace(NB, 'dizzy'); pose_(NB, { sL: [-2.6, 0, .6], sR: [-2.6, 0, -.6] }); NB.lL.r = [-.6, 0, 0]; NB.lR.r = [-.9, 0, 0]; NB.wob = .3; if (d < .5) burst(T_HIT + .35, t, A3(NBP, [0, 2.4, 0]), [.55, .4, .28], 8, 16, .6, 1); }
  if (i === 14) nbIdle(t);
  // L6: the cop sprints in, then complains
  if (i === 6 || (i === 7 && t < T_FALL)) { const st = stand(HP_[4]); h.root.p = st; h.root.r = [0, yawOf(st, GATE), 0]; SHVG.visible = true; SHVG.p = A3(st, [.45, 0, .3]); pose_(h, { sR: [-.5, 0, -.5], eR: [-1.0, 0, 0] }); face = 'neutral'; h.body.r = [0, 0, -.08];
    cop.root.visible = true; if (t < T_COPRUN) { cop.root.visible = false; } else if (t < T_COPGATE) { const u = (t - T_COPRUN) / (T_COPGATE - T_COPRUN); cop.root.p = lerp3([16, 0, -.3], GATE, eout(u)); cop.root.r = [0, -Math.PI / 2, 0]; wheelRun(cop, t, 70, .7); setFace(cop, 'squint'); late.push(() => stream(t, A3(cop.root.p, [0, 1.3, 0]), [1, 0, 0], 4, 0, 14, .8, 2, .5)); }
    else { const u = clamp((t - T_COPGATE) / (T_FALL - T_COPGATE)); cop.root.p = lerp3(GATE, S, u); cop.root.r = [0, yawOf(GATE, S) - .4, 0]; walkPose(cop, t, 9, .6); pose_(cop, { sR: [-2.2 + Math.sin(t * 22) * .3, 0, -.2], eR: [-.3, 0, 0] }); setFace(cop, Math.sin(t * 20) > 0 ? 'talksq' : 'talk'); cop.head.r = [0, -.5, 0]; if (u < .25) { cop.body.r = [-.45, 0, 0]; burst(T_COPGATE, t, A3(GATE, [0, .1, 0]), [.85, .8, .72], 0, 8, .8, .6); } } }
  // L7: falls into hole six
  if (i === 7 && t >= T_FALL) { const d = t - T_FALL; cop.root.visible = true; cop.root.p = [S[0], -3.2 * clamp(d / .28) ** 2, S[2]]; cop.root.r = [0, yawOf(GATE, S) - .4, 0]; pose_(cop, { sL: [-2.9, 0, .6], sR: [-2.9, 0, -.6] }); setFace(cop, 'scream'); cop.wob = .6;
    const cy = 3.0 * d - 7 * d * d; cop.cap.p = [0, cop.capY - cop.root.p[1] + cy, 0]; cop.cap.r = [d * 8, d * 5, 0]; if (d > .95) cop.root.visible = false;
    if (t < T_LOOK) { const st = stand(HP_[4]); h.root.p = st; h.root.r = [0, yawOf(st, S), 0]; face = 'wide'; pose_(h, { sL: [-.3, 0, .8], sR: [-.3, 0, -.8] }); }
    else { const pk = A3(S, [.55, 0, -.75]); const u = clamp((t - T_LOOK) / .25); if (u < 1) zoomTo(h, t, stand(HP_[4]), pk, u); else { h.root.p = pk; h.root.r = [0, yawOf(pk, S), 0]; h.body.r = [.3, 0, 0]; h.head.r = [.15, 0, 0]; pose_(h, { sL: [-.6, 0, .5], sR: [-1.2, 0, -.3] }); face = 'wide'; } } }
  // L8: the hole is full now (cop head plugs it)
  const copHead = (t, face = 'dizzy') => { cop.root.visible = true; cop.root.p = [S[0], COPHEAD_Y, S[2]]; cop.root.r = [0, .35, 0]; setFace(cop, face); cop.wob = .1; };
  if (i === 8) { copHead(t, Math.sin(t * 5) > 0 ? 'dizzy' : 'squint'); const pk = A3(S, [.75, 0, -.7]); h.root.p = pk; h.root.r = [0, yawOf(pk, S) + .5, 0]; SHV.visible = true; const a = Math.max(0, Math.sin(t * 13)); pose_(h, { sR: [-1.9 + a * .6, 0, -.3], eR: [-.4, 0, 0] }); face = 'grin';
    if (Math.sin(t * 13) > .97) burst(t - .01, t, A3(S, [0, .2, 0]), [.55, .4, .28], 0, 4, .4, .5); }
  if (i >= 9 && i <= 12) copHead(t, i === 12 ? (Math.sin(t * 3) > .7 ? 'closed' : 'wide') : 'dizzy');
  if (i === 11 && t > T_SLIDE + .5 && t < T_SINK) { cop.root.visible = Math.abs(PILEA.p[0] - S[0]) > PILEA.s[0] * .45; }
  if (i === 11 && t >= T_SINK) setFace(cop, 'dizzy');
  // L9: the mountain
  if (i === 9) { const p0 = [-.2, 0, -3.4]; h.root.p = p0; h.root.r = [0, -.6, 0]; face = t > T_MT + .3 ? 'wideup' : 'neutral'; h.head.r = [-.45, -.3, 0]; SHVG.visible = true; SHVG.p = A3(p0, [.5, 0, .2]); if (t > T_MT + .3) { pose_(h, { sL: [-.2, 0, .8], sR: [-.2, 0, -.8] }); h.body.r = [-.25, 0, 0]; }
    const a = t * 2.2; setBird([PP[4][0] + Math.cos(a) * 2.2, MR[1] + .8 + Math.sin(a * 2) * .3, PP[4][2] + Math.sin(a) * 2.2], a + Math.PI, t); }
  // L10: one giant hole
  if (i === 10) { if (t < T_GDIG) zoomTo(h, t, [-.2, 0, -3.4], G, clamp((t - P[10]) / .1)); else { const u = clamp((t - T_GDIG) / (T_GEND - T_GDIG)); h.root.p = A3(G, [0, -1.1 * u, 0]); h.root.r = [0, t * 28, 0]; SHV.visible = true; digPose(h, t, 50); face = 'scream';
      const top = A3(PP[4], [0, lerp(MR[1], MR2[1], u) * .9, 0]); dirtArc(t, A3(G, [0, .4, 0]), top, 16, .4, 4.5, 1.6); } }
  // L11: pushes the mountain in
  if (i === 11) { const mx = PILEA.p[0], mr = PILEA.s[0] / 2; if (t < T_PUSH0) { const u = (t - P[11]) / (T_PUSH0 - P[11]); zoomTo(h, t, G, [PP[4][0] - MR2[0] - 1.25, 0, PP[4][2] + 1.2], u); }
    else if (t < T_SINK + .1) { h.root.p = [mx - mr - 1.25, 0, PP[4][2] + 1.2 + (PILEA.p[2] - PP[4][2])]; h.root.r = [0, Math.PI / 2 - .35, 0]; wheelRun(h, t, t < T_SLIDE ? 30 : 50, .5); pose_(h, { sL: [-1.6, 0, .25], sR: [-1.6, 0, -.25], eL: [-.3, 0, 0], eR: [-.3, 0, 0] }); face = 'squint'; h.body.p = [0, .1, 0]; }
    else { h.root.p = [G[0] - GR - 1.0, 0, G[2] + .4]; h.root.r = [0, Math.PI / 2 - .35, 0]; h.body.r = [.9, 0, 0]; pose_(h, { sL: [-1.6, 0, .25], sR: [-1.6, 0, -.25] }); face = 'wide'; }
    if (t > T_SINK) burst(T_SINK + .1, t, A3(G, [0, .3, 0]), [.6, .45, .32], 0, 16, 2.6, 1.4); }
  // L12-L14: flat yard, cop pops out, tiny pile
  if (i >= 12 && i <= 14) { h.root.p = HOME.slice(); h.root.r = [0, -.25, 0]; SHVG.visible = true; SHVG.p = SHVG0.slice(); }
  if (i === 12) { pose_(h, { sL: [.15, 0, .75], eL: [-1.7, 0, 0], sR: [.15, 0, -.75], eR: [-1.7, 0, 0] }); h.body.r = [-.18, 0, 0]; face = 'grin'; h.head.r = [-.15, 0, 0];
    const bt = WD.yard - .25; if (t > bt) { const u = clamp((t - bt) / .5); setBird(lerp3([-4, 3.5, -2], A3(S, [0, COPHEAD_Y + 3.0, 0]), eout(u)), yawOf([-4, 0, -2], S), t, u < 1); } }
  if (i === 13) { if (t < T_POP) copHead(t, 'squint'); else { const d = t - T_POP; cop.root.visible = true; if (d < .45) { cop.root.p = [S[0], lerp(COPHEAD_Y, 0, eout(clamp(d / .2))) + Math.sin(clamp(d / .45) * Math.PI) * 1.4, S[2]]; cop.root.r = [0, d * 14, 0]; pose_(cop, { sL: [-2.9, 0, .5], sR: [-2.9, 0, -.5] }); setFace(cop, 'wide'); burst(T_POP, t, A3(S, [0, .2, 0]), [.55, .4, .28], 0, 12, 1, 1.6); }
      else { const u = clamp((d - .45) / .5); cop.root.p = lerp3(S, [-1.4, 0, 3.5], u); if (u >= 1) cop.root.visible = false; cop.root.r = [0, yawOf(S, [-1.4, 0, 3.5]), 0]; wheelRun(cop, t, 70, .7); setFace(cop, 'scream'); late.push(() => stream(t, A3(cop.root.p, [0, 1.3, 0]), [0, 0, -1], 3, 0, 14, .7, 2, .5)); } }
    if (t < T_POP + .1) setBird(A3(S, [0, COPHEAD_Y + 3.0, 0]), .8, t, 0); else { const d = t - T_POP; setBird(A3(S, [d * 3, COPHEAD_Y + 3.0 + d * 4, d * 2]), .8, t); }
    face = t > T_POP ? 'wide' : 'grin'; pose_(h, { sL: [.15, 0, .75], eL: [-1.7, 0, 0], sR: [.15, 0, -.75], eR: [-1.7, 0, 0] }); if (t > T_POP) pose_(h, { sL: [-.3, 0, .8], sR: [-.3, 0, -.8] }); }
  if (i === 14) { h.root.r = [0, yawOf(HOME, S) + .2, 0]; face = Math.sin(t * 7) > .6 ? 'squint' : 'half'; h.head.r = [.15, 0, Math.sin(t * 30) * .03]; }
  if (i === 15) face = intro(t - T_END);
  if (PILEB._c) { const [md, u, k] = PILEB._c, hp = h.root.p; if (md === 1) PILEB.p = [hp[0], hp[1] + 2.95, hp[2]]; else { const q = lerp3([hp[0], 2.95, hp[2]], A3(HP_[k], [0, -.07, 0]), u); PILEB.p = q; } }
  setFace(h, face); for (const m of [hero, cop, NB]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
