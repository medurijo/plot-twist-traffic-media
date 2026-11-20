// =====================================================================
//  EP9 "THE SPIDER" — he burns everything. The spider is on his hat.
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
// ---------- the house ----------
const HOME = scene.children.find(n => n.p && n.p[0] === 0 && n.p[2] === -9.5 && n.children.length > 3);
const door = HOME.children.find(n => n.p && Math.abs(n.p[0] + 1.5) < .01 && Math.abs(n.p[1] - 1.05) < .01); const DOORP = door.p.slice();
HOME.add(B('#141218', [-1.5, 1.05, 2.505], [1.06, 2.06, .02], { out: 0 }));
let HZ = null; const CHAR = [.14, .12, .11];
function homeInit() { HZ = []; const walk = n => { if (n.mat && n !== door) HZ.push({ n, c: n.mat.c.slice(), em: n.mat.em || 0, tex: n.mat.tex }); n.children.forEach(walk); }; HOME.children.forEach(walk); }
function homeState(ch, sag) { HZ.forEach(o => { o.n.mat.c = ch > 0 ? lerp3(o.c, CHAR, ch) : o.c.slice(); o.n.mat.em = ch > .5 ? 0 : o.em; }); door.mat.c = ch > 0 ? lerp3(hex('#6b4a36'), CHAR, ch) : hex('#6b4a36'); HOME.s = [1, 1 - sag * .45, 1]; HOME.r = [0, 0, sag * .06]; }
// ---------- vehicles ----------
const hcar = car({ body: '#4f8a5b', top: '#4f8a5b' }); hcar.l1.visible = hcar.l2.visible = false; scene.add(hcar.root); const HCAR = [-3.4, 0, 3.6];
const ft = car({ body: '#d8302c', top: '#d8302c', stripe: '#f4f1e8' }); ft.l2.mat.c = hex('#ff3b3b'); ft.root.s = [1.12, 1.25, 1.35]; for (const sx of [-.45, .45]) ft.root.add(B('#c9ccd4', [sx, 1.62, -.3], [.06, .06, 3.4], { spec: 1 })); for (let k = 0; k < 9; k++) ft.root.add(B('#c9ccd4', [0, 1.62, -1.9 + k * .4], [.9, .05, .05], { spec: 1 }));
ft.root.add(new Node('cyl', { c: hex('#e8e2d0'), out: .01 }, [.75, .6, -1.5], [.4, .5, .4], [0, 0, Math.PI / 2])); scene.add(ft.root); const FT = [3.4, 0, 4.4];
const CARZ = [hcar, ft, pcar].map(c => ({ c, cols: c.root.children.filter(n => n.mat).map(n => ({ n, c: n.mat.c.slice() })) }));
function charCar(o, a) { o.cols.forEach(q => { if (q.n === o.c.l1 || q.n === o.c.l2) return; q.n.mat.c = a > 0 ? lerp3(q.c, CHAR, a) : q.c.slice(); }); }
// ---------- crew ----------
const FF = [0, 1].map(k => { const m = man({ id: k ? 'cop' : 'cop2', shape: 'wide', neck: .22, seed: 30 + k * 7, skin: k ? '#c48a62' : SK.hero, shirt: '#3a3a40', stripe: '#c9b23a', pants: '#3a3a40', shoe: '#1d1d22', cap: '#e2b23c', capBadge: '#d8302c' }); scene.add(m.root); return m; });
// ---------- spider ----------
function mkSpider() { const g = new Node(); const body = new Node(); g.add(body); body.add(B('#1b1b20', [0, .07, -.07], [.13, .11, .15], { spec: .5, rim: .3, out: .01 })); body.add(B('#25252c', [0, .06, .05], [.09, .08, .08], { spec: .5, out: .01 }));
  for (const sx of [-.025, .025]) { body.add(B('#ffffff', [sx, .09, .095], [.035, .04, .01], { out: .004 })); body.add(B('#1b1b20', [sx, .085, .1], [.016, .02, .01], { out: 0 })); }
  const legs = []; for (let k = 0; k < 8; k++) { const sd = k < 4 ? -1 : 1, j = k % 4; const piv = new Node(null, null, [sd * .04, .07, .06 - j * .045]); piv.add(B('#1b1b20', [sd * .07, .02, 0], [.12, .018, .018], { out: .004 }, [0, 0, sd * .5])); piv.add(B('#1b1b20', [sd * .13, -.04, 0], [.018, .1, .018], { out: .004 })); body.add(piv); legs.push({ piv, sd, j }); }
  const bag = new Node(null, null, [.11, .03, .02]); bag.add(B('#8a5a3a', [0, 0, 0], [.07, .05, .025], { out: .004 })); bag.add(B('#3a2a1a', [0, .035, 0], [.03, .015, .01], { out: 0 })); g.add(bag);
  const thread = new Node('box', { c: [.95, .95, .95], em: .4, out: 0, noShadow: 1 }, [0, 0, 0], [.006, 1, .006]); scene.add(thread); scene.add(g); return { g, body, legs, bag, thread }; }
const SP = mkSpider();
function spAt(p, sc, t, walk = 0, yaw = 0, wave = 0) { SP.g.visible = true; SP.g.p = p; SP.g.s = [sc, sc, sc]; SP.g.r = [0, yaw, 0]; SP.legs.forEach(l => { const a = Math.sin(t * 30 + l.j * 1.6 + (l.sd > 0 ? 1.5 : 0)) * walk; l.piv.r = [0, a * .6, a * .3]; }); if (wave) SP.legs[4].piv.r = [0, 0, 1.2 + Math.sin(t * 14) * .5]; SP.body.p = [0, walk ? Math.abs(Math.sin(t * 30)) * .02 : 0, 0]; }
function thr(top, bot) { SP.thread.visible = true; SP.thread.p = [(top[0] + bot[0]) / 2, (top[1] + bot[1]) / 2, (top[2] + bot[2]) / 2]; SP.thread.s = [.006, Math.max(.01, top[1] - bot[1]), .006]; }
// ---------- props ----------
const match = new Node(null, null, [0, -.12, .06]); match.add(B('#e8d2a0', [0, 0, 0], [.025, .16, .025], { out: .004 })); const mflame = new Node('box', { c: [1, .7, .2], em: 1, out: 0, noShadow: 1 }, [0, .11, 0], [.05, .08, .05]); match.add(mflame); hero.armR.end.add(match);
const keys = new Node(null, null, [0, -.12, .06]); keys.add(new Node('cyl', { c: hex('#f0c44a'), spec: 1, out: .004 }, [0, 0, 0], [.07, .02, .07], [Math.PI / 2, 0, 0])); keys.add(B('#f0c44a', [0, -.07, 0], [.025, .1, .01], { spec: 1 })); hero.armL.end.add(keys);
texC('sold', 300, 200, (x, w, h) => { x.fillStyle = '#fbf6e6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d8302c'; x.lineWidth = 10; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#d8302c'; x.textAlign = 'center'; x.font = '900 92px "Inter Display"'; x.fillText('SOLD', w / 2, 128); x.font = '700 20px "Courier 10 Pitch"'; x.fillText('(NO SPIDERS. PROMISE.)', w / 2, 172); });
const sold = new Node(); sold.add(B('#6b4a36', [0, .6, 0], [.08, 1.2, .08])); sold.add(B('#6b4a36', [.3, 1.18, 0], [.7, .06, .06])); const sq = new Node('quad', { c: [1, 1, 1], tex: 'sold', spec: 0, rim: 0, out: 0 }, [.35, .85, .03], [.66, .44, 1]); sold.add(sq, B('#6b4a36', [.35, .85, 0], [.7, .48, .04], { out: 0 })); sold.p = [1.6, 0, -3.3]; sold.r = [0, -.3, 0]; scene.add(sold);
// ---------- fire + smoke ----------
const FL = []; const FCOL = [[1, .85, .3], [1, .55, .15], [1, .35, .1], [1, .7, .2]];
for (let k = 0; k < 64; k++) { const n = new Node('box', { c: FCOL[k % 4], em: 1, a: .92, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.3, .5, .3]); n.visible = false; scene.add(n); FL.push(n); }
const SM = []; for (let k = 0; k < 24; k++) { const n = new Node('box', { c: [.22, .2, .22], a: .55, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.5, .5, .5]); n.visible = false; scene.add(n); SM.push(n); }
let fi = 0, si = 0;
function fire(t, pts, n, amt, sz = 1) { for (let k = 0; k < n && fi < FL.length; k++, fi++) { const f = FL[fi], b = pts[k % pts.length], s = (hsh(k, 7) * .6 + .7) * sz * amt; const fl = .75 + .35 * Math.sin(t * (14 + k % 5) + k * 2.1); f.visible = amt > .02; f.p = [b[0] + Math.sin(t * 6 + k) * .05 * sz, b[1] + s * fl * .45, b[2]]; f.s = [s * .55, s * fl * 1.1, s * .55]; f.r = [0, k + t * 2, Math.sin(t * 9 + k) * .2]; } }
function smoke(t, src, n, amt = 1, sz = 1) { for (let k = 0; k < n && si < SM.length; k++, si++) { const q = SM[si], b = src[k % src.length], ph_ = (t * .45 + hsh(k, 3)) % 1; q.visible = amt > .05; q.p = [b[0] + Math.sin(ph_ * 4 + k) * .6 * sz, b[1] + ph_ * 5 * sz, b[2] + Math.cos(ph_ * 3 + k) * .3]; const s = (.4 + ph_ * 1.4) * sz * amt; q.s = [s, s, s]; q.mat.a = .55 * (1 - ph_) * amt; } }
const HPTS = []; for (let k = 0; k < 22; k++) { const roof = k > 11; HPTS.push(roof ? [-2.8 + hsh(k, 1) * 5.6, 4.2 + hsh(k, 2) * 1.6, -9.0 - hsh(k, 3) * 1.2] : [-2.8 + hsh(k, 1) * 5.6, .3 + hsh(k, 2) * 3.2, -6.85]); }
const carPts = (c, L = 2.0, W = .8, y = .9) => { const pts = []; for (let k = 0; k < 10; k++) pts.push([c[0] + (hsh(k, 11) - .5) * 2 * L, c[1] + y + hsh(k, 12) * .5, c[2] + (hsh(k, 13) - .5) * 2 * W]); return pts; };
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- timing ----------
const T_OPEN = P[14] - T_END + .35, T_DROP = P[0] + .15, T_SPIN = WD.spider - .05, T_IGN = P[2] + .25, T_BOOM = WD.fucking1 + .05, T_FTA = P[5] + .05, T_HOP = at(5, .55), T_FTIGN = WD.fucking2 - .1, T_PCA = P[8] + .05, T_HATIGN = WD.hat2 - .35, T_JUMP = at(10, .7), T_YES = WD.fucking3 - .05, T_POP = WD.bought + .1;
const HAT0 = hero.hat.p.slice(); const DOOR = [-1.5, 0, -6.15];
const hatTop = () => wp(hero.hat, [0, .2, 0]);
function doorOpen(a) { const th = -1.35 * a; door.r = [0, th, 0]; door.p = [-2.05 + .55 * Math.cos(th), 1.05, 2.52 - .55 * Math.sin(th)]; }
// ---------- intro / loop ----------
function intro(t) { const h = hero; let face = 'grin'; h.root.p = DOOR.slice(); h.root.r = [0, Math.PI, 0]; const op = eout(clamp((t - T_OPEN) / .45)); doorOpen(op); if (t < T_OPEN) pose_(h, { sR: [-1.3, 0, -.2], eR: [-.3, 0, 0] }); else pose_(h, { sR: [-.6, 0, -.3] });
  if (t < T_DROP) { h.root.p = A3(DOOR, [0, 0, Math.max(0, -t) * .0]); spAt(hatTop(), 1, t, 0, Math.PI); return face; }
  const d = t - T_DROP; const top = hatTop(); const drop = eout(clamp(d / .45)); const sp = [top[0], top[1] - drop * .75, top[2] - .32 * drop]; thr(top, A3(sp, [0, .12, 0])); spAt(sp, 1, t, .2, 0, 1);
  if (t < T_SPIN) { face = 'neutral'; return face; }
  const e = t - T_SPIN; const a = eout(clamp(e / .25)); h.root.r = [0, Math.PI * (1 - a), 0]; h.root.p = A3(DOOR, [0, Math.sin(clamp(e / .5) * Math.PI) * .6, a * 1.4]); pose_(h, { sL: [-2.8, 0, .9], sR: [-2.8, 0, -.9] }); face = 'scream'; h.wob = .55; h.hat.p = [HAT0[0], HAT0[1] + Math.sin(clamp(e / .9) * Math.PI) * 1.0, 0];
  const sp2 = [-1.5, 1.55 - Math.sin(t * 4) * .03, -6.55]; thr([-1.5, 2.3, -6.55], A3(sp2, [0, .12, 0])); spAt(sp2, 1, t, .2, 0, 1); return face; }
function hideAll() { for (const m of [hero, cop, ...FF]) { resetPose(m); m.root.visible = false; m.body.s = [1, 1, 1]; m.body.r = [0, 0, 0]; } hero.root.visible = true; hero.hat.p = HAT0.slice(); match.visible = keys.visible = false;
  SP.g.visible = false; SP.thread.visible = false; FL.forEach(f => f.visible = false); SM.forEach(f => f.visible = false); fi = si = 0; puffs.forEach(p => p.visible = false); door.r = [0, 0, 0]; door.p = DOORP.slice(); sold.visible = false; HOME.s = [1, 1, 1];
  hcar.root.visible = true; hcar.root.p = HCAR.slice(); hcar.root.r = [0, Math.PI / 2, 0]; ft.root.visible = false; pcar.root.visible = false; CARZ.forEach(o => charCar(o, 0)); cop.cap.visible = true; }
function carLights(c, t) { c.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; c.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; }
function drive(c, t, t0, x0, x1, z, dur = .6) { const u = eout(clamp((t - t0) / dur)); c.root.visible = t >= t0 - .05; c.root.p = [lerp(x0, x1, u), 0, z]; c.root.r = [0, -Math.PI / 2 + (1 - u) * .8 * Math.sin(u * Math.PI), 0]; carLights(c, t); return u; }
function lit(h) { match.visible = true; pose_(h, { sR: [-1.4, 0, -.15], eR: [-.4, 0, 0] }); mflame.s = [.05, .08 + Math.sin(Date.now() * .03) * 0, .05]; }
const CUPOS = [5.6, 0, 1.6];
function stage(t) { late = []; if (!HZ) homeInit(); const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  // world state by phase
  const burnt = i >= 3 && i <= 11, hb = i === 2 ? eout(clamp((t - T_IGN) / 1.2)) : 0; homeState(burnt ? 1 : hb, burnt ? 1 : hb * .6); if (i === 12) { const a = eback(clamp((t - T_POP) / .45)); homeState(t < T_POP ? 1 : 0, t < T_POP ? 1 : 0); if (t >= T_POP) HOME.s = [1, Math.max(.02, a), 1]; }
  FAIRY.forEach(f => { if (Math.abs(f.p[2] + 6.86) < .05) f.visible = !(burnt || (i === 12 && t < T_POP) || hb > .4); });
  if (i === 2) { fire(t, HPTS, 22, clamp((t - T_IGN) / .5), 1.6); smoke(t, HPTS.slice(12), 8, clamp((t - T_IGN) / .8), 1.4); }
  if (burnt) { fire(t, HPTS, 10, .55, 1.0); smoke(t, HPTS.slice(12), 6, .8, 1.2); }
  const carBurnt = i >= 5 && i <= 13; if (carBurnt || (i === 4 && t > T_BOOM)) { charCar(CARZ[0], 1); hcar.root.p = A3(HCAR, [0, 1.62, 0]); hcar.root.r = [0, Math.PI / 2, Math.PI]; if (i <= 11) { fire(t, carPts(A3(HCAR, [0, -.4, 0]), 1.8, .8), 6, .6, .8); smoke(t, [A3(HCAR, [0, 1.6, 0])], 3, .7, .8); } }
  const ftBurnt = (i >= 8 && i <= 11) || (i === 7 && t > T_FTIGN);
  if (i >= 5 && i <= 11) { ft.root.visible = true; ft.root.p = FT.slice(); ft.root.r = [0, -Math.PI / 2, 0]; carLights(ft, t); if (ftBurnt) { const a = i === 7 ? clamp((t - T_FTIGN) / .6) : 1; charCar(CARZ[1], a); fire(t, carPts(A3(FT, [0, .3, 0]), 2.4, .9), 12, a, 1.2); smoke(t, [A3(FT, [0, 2.2, 0])], 4, a, 1.0); } }
  if (i >= 8 && i <= 11) { pcar.root.visible = true; pcar.root.p = [9.6, 0, 4.2]; pcar.root.r = [0, -Math.PI / 2, 0]; carLights(pcar, t); }
  // characters
  if (i === 0) face = intro(t);
  if (i === 1) { h.root.p = A3(DOOR, [.2, 0, 1.4]); h.root.r = [0, .1, 0]; doorOpen(1); face = 'half'; pose_(h, { sL: [-1.45, 0, -.55], eL: [-.5, 0, 0], sR: [-1.45, 0, .55], eR: [-.5, 0, 0] }); h.head.r = [.1, 0, 0]; const sp2 = [-1.5, 1.55 - Math.sin(t * 4) * .03, -6.55]; thr([-1.5, 2.3, -6.55], A3(sp2, [0, .12, 0])); spAt(sp2, 1, t, .1, 0, 1); }
  if (i === 2) { h.root.p = [0, 0, -3.2]; h.root.r = [0, .15, 0]; lit(h); face = 'half'; h.head.r = [-.05, 0, 0]; pose_(h, { sL: [-.2, 0, .2] }); h.wob = .04; doorOpen(1); }
  if (i === 3) { const u = clamp((t - P[3] - .1) / (pend(3) - P[3] - .35)); const path = [[-1.5, 0, -6.0], [-1.45, 0, -2.6], [-2.2, 0, 1.6], [-3.4, 1.0, 2.9]]; const sg = Math.min(2.999, u * 3), k = Math.floor(sg), f = sg - k; const p = lerp3(path[k], path[k + 1], f);
    spAt(p, 2.6, t, u < 1 ? 1 : 0, yawOf(path[k], path[k + 1])); SP.bag.visible = true; h.root.p = [.6, 0, -1.4]; h.root.r = [0, -.6, 0]; face = 'squint'; h.head.r = [.3, -.4, 0]; doorOpen(1); }
  if (i === 4) { h.root.p = [-1.2, 0, .6]; h.root.r = [0, -.4, 0]; lit(h); const d = t - T_BOOM;
    if (d < 0) { fire(t, carPts(A3(HCAR, [0, .1, 0]), 1.9, .8), 12, clamp((t - P[4] - .1) / .4), 1.0); face = 'squint'; }
    else { const a = clamp(d / .9); hcar.root.p = A3(HCAR, [0, Math.sin(a * Math.PI) * 3 + 1.62 * a, 0]); hcar.root.r = [0, Math.PI / 2, Math.PI * eout(a)]; burst(T_BOOM, t, A3(HCAR, [0, 1, 0]), [1, .6, .2], 0, 16, 2.5, 3); argue(h, t, 1.6, 3); h.root.p[1] = Math.abs(Math.sin(t * 12)) * .4; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .5; match.visible = true; } }
  if (i === 5) { const u = drive(ft, t, T_FTA, 34, FT[0], FT[2]); h.root.p = [-1.2, 0, .6]; h.root.r = [0, .8, 0]; face = 'neutral'; lit(h);
    FF.forEach((m, k) => { m.root.visible = t > T_HOP - .05; const d = t - T_HOP - k * .2; if (d < 0) { m.root.visible = false; return; } if (k === 0) { const a = clamp(d / .45); m.root.p = [lerp(FT[0] + .3, FT[0] - .2, a), lerp(1.3, .3, a) + Math.sin(a * Math.PI) * .4, lerp(FT[2] - .2, FT[2] - 2.0, a)]; m.root.r = [lerp(.2, 1.45, a), Math.PI, 0]; pose_(m, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); setFace(m, a < 1 ? 'wide' : 'dizzy'); m.wob = .4; }
      else { const a = eout(clamp(d / .3)); m.root.p = [FT[0] + 1.5 * a, Math.sin(a * Math.PI) * .5, FT[2] - 1.9]; m.root.r = [0, -Math.PI / 2, 0]; pose_(m, { sR: [-2.3, 0, .5], eR: [-1.9, 0, 0] }); setFace(m, 'grin'); } }); }
  if (i === 6 || i === 7) { h.root.p = [-1.2, 0, .6]; h.root.r = [0, .8, 0]; lit(h); face = i === 6 ? 'squint' : 'neutral';
    FF.forEach((m, k) => { m.root.visible = true; m.root.p = [FT[0] + .4 + k * 1.1, 0, FT[2] - 2.0]; m.root.r = [0, -Math.PI / 2 - .3, 0]; setFace(m, i === 6 ? 'up' : 'wide'); pose_(m, { sL: [-.3, 0, .3], sR: [-.3, 0, -.3] }); if (i === 6 && t > at(6, .55)) { m.root.r = [0, -2.2, 0]; setFace(m, 'squint'); } });
    if (i === 6) { const p = [FT[0] + .2, 2.12, FT[2]]; spAt(p, 2.2, t, 0, -Math.PI / 2 + .4, 1); } }
  if (i === 7) { const d = t - T_FTIGN; if (d > 0) { argue(h, t, 1.6, 5); h.root.p[1] = Math.abs(Math.sin(t * 12)) * .4; face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .5; match.visible = true;
      FF.forEach((m, k) => { const e = Math.max(0, d - .15 - k * .1); m.root.p = [FT[0] + .4 + k * 1.1 + e * (k ? 24 : -20), Math.abs(Math.sin(t * 30)) * .15, FT[2] - 2.0 + e * (k ? 3 : 6)]; m.root.r = [0, k ? Math.PI / 2 - .2 : -Math.PI / 2 + .4, 0]; runPose(m, t, 34); pose_(m, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); setFace(m, 'scream'); m.wob = .6; }); } }
  if (i === 8) { const u = drive(pcar, t, T_PCA, 40, 9.6, 4.2, .55); h.root.p = [1.6, 0, 1.4]; h.root.r = [0, Math.PI / 2, 0]; face = 'neutral'; lit(h);
    const d = t - T_PCA - .55; cop.root.visible = d > 0; if (d > 0) { const a = clamp(d / .6); cop.root.p = lerp3([8.6, 0, 3.0], CUPOS, a); cop.root.r = [0, -Math.PI / 2, 0]; if (a < 1) walkPose(cop, t, 9, .6); setFace(cop, 'squint'); } }
  if (i === 9) { h.root.p = [1.6, 0, 1.4]; h.root.r = [0, Math.PI / 2, 0]; face = 'squint'; lit(h); cop.root.visible = true; cop.root.p = CUPOS.slice(); cop.root.r = [0, -Math.PI / 2, 0]; setFace(cop, 'up'); cop.head.r = [-.25, 0, 0]; pose_(cop, { sL: [-.3, 0, .3], sR: [-.3, 0, -.3] });
    spAt(wp(cop.cap, [0, .17, 0]), 1.6, t, 0, -Math.PI / 2, 1); }
  if (i === 10) { h.root.p = [1.6, 0, 1.4]; h.root.r = [0, Math.PI / 2, 0]; lit(h); face = 'grin'; cop.root.visible = true; const d = t - T_HATIGN;
    if (d < 0) { cop.root.p = CUPOS.slice(); cop.root.r = [0, -Math.PI / 2, 0]; setFace(cop, 'up'); spAt(wp(cop.cap, [0, .17, 0]), 1.6, t, 0, -Math.PI / 2, 0); }
    else { const R_ = 1.8, w = 9; cop.root.p = [CUPOS[0] + 2.2 + Math.cos(d * w) * R_, Math.abs(Math.sin(t * 30)) * .15, CUPOS[2] + .6 + Math.sin(d * w) * R_]; cop.root.r = [0, -d * w, 0]; runPose(cop, t, 36); pose_(cop, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); setFace(cop, 'scream'); cop.wob = .6;
      late.push(() => { const hp = wp(cop.cap, [0, .1, 0]); fire(t, [hp], 3, 1, .55); smoke(t, [hp], 3, .8, .4); });
      const e = t - T_JUMP; if (e < 0) spAt(wp(cop.cap, [0, .17, 0]), 1.6, t, 1, 0); else { const a = clamp(e / .5); const p0 = [CUPOS[0], 2.4, CUPOS[2]], p1 = hatTop(); spAt(A3(lerp3(p0, p1, a), [0, Math.sin(a * Math.PI) * 1.5, 0]), 1.2, t, 0, a * 12); } } }
  if (i === 11) { h.root.p = [0, 0, -.6]; h.root.r = [0, 0, 0]; face = 'grin'; const y = t > T_YES; if (y) { pose_(h, { sL: [-2.9, 0, .5], sR: [-2.9, 0, -.5] }); face = Math.sin(t * 20) > 0 ? 'scream' : 'grin'; h.root.p[1] = Math.abs(Math.sin(t * 9)) * .5; h.wob = .5; } else { pose_(h, { sL: [-.3, 0, .2], sR: [-.3, 0, -.2] }); }
    late.push(() => spAt(hatTop(), 1, t, 0, 0, 1)); cop.root.visible = true; cop.root.p = [5.0, .12, 2.1]; cop.root.r = [0, -.3, 0]; cop.body.p = [0, -.43, 0]; cop.lL.r = [-1.5, 0, -.15]; cop.lR.r = [-1.5, 0, .15]; cop.lL.k = cop.lR.k = 1.5; cop.cap.visible = false; setFace(cop, 'worry'); cop.head.r = [.3, 0, 0]; smoke(t, [wp(cop.head, [0, .6, 0])], 3, .6, .3);
    FF.forEach((m, k) => { m.root.visible = true; m.root.p = [6.2 + k * .9, .12, 2.1]; m.root.r = [0, -.4, 0]; m.body.p = [0, -.43, 0]; m.lL.r = [-1.5, 0, -.15]; m.lR.r = [-1.5, 0, .15]; m.lL.k = m.lR.k = 1.5; setFace(m, k ? 'worry' : 'dizzy'); m.head.r = [.3, 0, 0]; }); }
  if (i === 12) { sold.visible = true; h.root.p = [.8, 0, -3.0]; h.root.r = [0, -.2, 0]; keys.visible = true; pose_(h, { sL: [-1.7, 0, .2], eL: [-.6, 0, 0] }); face = 'grin'; late.push(() => spAt(hatTop(), 1, t, 0, 0)); if (t > T_POP) burst(T_POP, t, [0, .3, -7], [.95, .9, .85], 0, 16, 3, 2); }
  if (i === 13) { sold.visible = true; const u = clamp((t - P[13]) / (pend(13) - P[13])); h.root.p = lerp3([-1.45, 0, -1.6], [-1.45, 0, -4.4], eio(u)); h.root.r = [0, Math.PI, 0]; walkPose(h, t, 8, .55); face = 'grin'; keys.visible = true; pose_(h, { sL: [-1.2, 0, .2], eL: [-.4, 0, 0] });
    late.push(() => spAt(hatTop(), 1, t, 0, 0, 1)); }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, ...FF]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
