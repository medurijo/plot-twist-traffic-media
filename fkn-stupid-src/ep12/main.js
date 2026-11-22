// =====================================================================
//  EP12 "THE VENDING MACHINE" — the chips got stuck. So did he.
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
// machine frame: VP = front-bottom pivot spot on the ground, VY = yaw
const VS = 1.25, VC = [2.2, 0, -1.25], VY = .3; const VR = [Math.cos(VY), 0, -Math.sin(VY)], VN = [Math.sin(VY), 0, Math.cos(VY)];
const loc = (x, y, z) => [VC[0] + (VR[0] * x + VN[0] * z) * VS, y, VC[2] + (VR[2] * x + VN[2] * z) * VS];
const HP = loc(-.98, 0, .55), HY = .42;
lamp.p = [-3.9, 0, 1.4];
// ---------- textures ----------
texC('snax', 512, 80, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#ffd23a'); g.addColorStop(1, '#ff8a3a'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#1b1b20'; x.font = '900 62px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SNAX ★ SNAX', w / 2, h / 2 + 3); });
texC('vdisp', 128, 64, (x, w, h) => { x.fillStyle = '#0d1612'; x.fillRect(0, 0, w, h); x.fillStyle = '#7cf08a'; x.font = '700 34px "Courier 10 Pitch"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$1.00', w / 2, h / 2 + 2); });
const BAGC = [['#e8483c', '#ffd23a'], ['#3f6fb5', '#f4f1e8'], ['#2f9a5a', '#ffd23a'], ['#f08a2a', '#7a2a1a'], ['#8a4ac0', '#f4f1e8'], ['#e2b23c', '#d8302c']];
BAGC.forEach(([c, s], k) => texC('bag' + k, 96, 128, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 0, w, 14); x.fillRect(0, h - 14, w, 14); x.fillStyle = s; x.beginPath(); x.ellipse(w / 2, h / 2, 34, 26, -.3, 0, 6.283); x.fill(); x.fillStyle = c; x.font = '900 22px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(['CHIPS', 'CRISP', 'NACHO', 'PUFFS', 'CORN', 'CHEEZ'][k], w / 2, h / 2 + 2); }));
// ---------- machine ----------
const VM = new Node(null, null, [0, 0, 0], [VS, VS, VS]); scene.add(VM); const VB = new Node(null, null, [0, 0, -.425]); VM.add(VB);
const RED = '#c8302c', DK = '#1c1e26';
D_(VB, RED, [0, 1.0, -.4], [1.1, 2.0, .05], { spec: .3 }); for (const sx of [-.525, .525]) D_(VB, RED, [sx, 1.0, 0], [.05, 2.0, .85], { spec: .3, rim: .1 });
D_(VB, RED, [0, 1.96, 0], [1.12, .09, .87], { spec: .3 }); D_(VB, RED, [0, .2, 0], [1.1, .4, .85], { spec: .3 }); D_(VB, '#a8262a', [-.375, 1.18, 0], [.25, 1.56, .85], { spec: .3 });
D_(VB, DK, [.125, 1.18, -.36], [.75, 1.56, .03], { out: 0 }); D_(VB, '#2a2d38', [.125, 1.18, -.2], [.73, 1.54, .02], { out: 0, a: 0 });
VB.add(new Node('quad', { c: [1, 1, 1], tex: 'snax', em: .9, spec: 0, rim: 0, out: 0, noShadow: 1 }, [0, 1.86, .432], [1.04, .16, 1]));
const glass = new Node('box', { c: [.75, .9, 1], a: .16, spec: 1.2, rim: .4, out: 0, noShadow: 1 }, [.125, 1.18, .41], [.74, 1.54, .01]); VB.add(glass);
for (const [x, y, w, h] of [[.125, 1.95, .8, .04], [.125, .41, .8, .04], [-.25, 1.18, .04, 1.58], [.5, 1.18, .04, 1.58]]) D_(VB, '#d8d8de', [x, y, .425], [w, h, .03], { out: 0, spec: .8 });
VB.add(new Node('box', { c: [1, .95, .8], em: 1, out: 0, noShadow: 1 }, [.125, 1.88, .2], [.7, .03, .3]));
const ROWS = [.43, .8, 1.17, 1.54], COLS = [-.12, .125, .37], PROD = [];
ROWS.forEach((y, r) => { D_(VB, '#9aa0ae', [.125, y - .01, .0], [.74, .02, .7], { out: 0, spec: .6 }); COLS.forEach((x, c) => { for (let q = 0; q < 3; q++) VB.add(new Node('cyl', { c: hex('#d8d8de'), out: 0, spec: 1 }, [x, y + .06, .3 - q * .12], [.16, .012, .16], [0, 0, Math.PI / 2]));
  for (let q = 0; q < 2; q++) { const k = (r * 3 + c + q) % 6, can = (r + c) % 3 === 2; const n = can ? new Node('cyl', { c: hex(BAGC[k][0]), spec: .8, rim: .2, out: .006 }, [x, y + .12, .25 - q * .2], [.12, .22, .12]) : new Node('box', { c: [1, 1, 1], tex: 'bag' + k, spec: .4, rim: .1, out: .006 }, [x, y + .15, .25 - q * .2], [.2, .27, .07]); VB.add(n); PROD.push({ n, r, c, q, p0: n.p.slice() }); } }); });
D_(VB, '#d8d8de', [-.375, 1.42, .43], [.18, .1, .02], { out: 0 }); VB.add(new Node('quad', { c: [1, 1, 1], tex: 'vdisp', em: .8, spec: 0, rim: 0, out: 0 }, [-.375, 1.42, .442], [.15, .075, 1]));
for (let k = 0; k < 9; k++) D_(VB, '#e9e4d4', [-.425 + (k % 3) * .05, 1.27 - Math.floor(k / 3) * .05, .43], [.035, .035, .02], { out: 0 }); D_(VB, '#111', [-.375, 1.05, .43], [.03, .09, .02], { out: 0 }); D_(VB, '#111', [-.375, .92, .43], [.16, .03, .02], { out: 0 });
D_(VB, '#0a0a0e', [.125, .2, .424], [.68, .22, .01], { out: 0 }); const flap = new Node(null, null, [.125, .31, .43]); VB.add(flap); D_(flap, '#3a3c46', [0, -.11, 0], [.68, .22, .02], { out: .006, spec: .6 }); D_(flap, '#d8d8de', [0, -.2, .01], [.3, .03, .02], { out: 0 });
for (const sx of [-.45, .45]) for (const sz of [-.3, .3]) D_(VB, '#2a2a30', [sx, -.01, sz], [.1, .04, .1], { out: 0 });
const anchor = new Node(null, null, [.125, .42, .02]); VB.add(anchor);
// stuck bags A (row1,col1 front) and B (row2,col1 front)
const PA = PROD.find(p => p.r === 1 && p.c === 1 && p.q === 0), PB = PROD.find(p => p.r === 2 && p.c === 1 && p.q === 0);
// ---------- props ----------
const coin = new Node('cyl', { c: hex('#f0c44a'), spec: 1, rim: .3, out: .004 }, [0, 0, 0], [.09, .02, .09], [Math.PI / 2, 0, 0]); scene.add(coin);
const hbag = new Node('box', { c: [1, 1, 1], tex: 'bag0', spec: .4, rim: .1, out: .008 }, [0, 0, 0], [.3, .4, .1]); scene.add(hbag);
const crumb = B('#f0c44a', [0, 0, 0], [.035, .02, .03], { out: 0 }); scene.add(crumb);
const tumble = new Node(); for (let k = 0; k < 14; k++) tumble.add(B(k % 2 ? '#a07a4a' : '#8a6a3c', [0, 0, 0], [.75 - (k % 3) * .1, .04, .04], { out: .008 })); tumble.children.forEach((n, k) => n.r = [hsh(k, 1) * 3, hsh(k, 2) * 3, hsh(k, 3) * 3]); scene.add(tumble);
const FLY = []; for (let k = 0; k < 22; k++) { const can = k % 4 === 3, j = k % 6; const n = can ? new Node('cyl', { c: hex(BAGC[j][0]), spec: .8, rim: .2, out: .006 }, [0, 0, 0], [.12, .22, .12]) : new Node('box', { c: [1, 1, 1], tex: 'bag' + j, spec: .4, rim: .1, out: .006 }, [0, 0, 0], [.2, .27, .07]); scene.add(n); FLY.push(n); }
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- timing ----------
const T_COIN = .55, T_BTN = 1.35, T_TIP = WD.stuck - .35, T_B = WD.second - .1, T_KNOCK = WD.knock, T_BANG = WD.fucking1 - .1, T_SHK = WD.shook - .15, T_DIVE = WD.climbed - .25, T_RUN = WD.cop - .45, T_GRAB = WD.shook2 - .2, T_FALL = WD.fell - .1, T_IMP = T_FALL + .42, T_OUT = WD.everything - .05, T_LIFT = P[12] + .55, T_OPEN = WD.opened + .05, T_EMP = WD.fucking3 - .05;
const COPP = loc(.05, 0, 1.05), CUP = loc(.05, 0, 1.25); const HP2 = loc(-1.35, 0, 2.75);
// tilt of the whole machine (fall forward) + wobble
function machine(t, i) { let tilt = 0, roll = 0, yaw = 0, y = 0;
  if (i === 4 && t > T_SHK) { const a = clamp((t - T_SHK) / .2) * (t < pend(4) - .1 ? 1 : 0); roll = Math.sin(t * 34) * .07 * a; yaw = Math.sin(t * 27) * .04 * a; }
  if (i === 9 && t > T_GRAB + .2) { const a = clamp((t - T_GRAB - .2) / 1.0); roll = Math.sin(t * 30) * .1 * (.4 + a); tilt = Math.max(0, Math.sin(t * 15)) * .12 * a + a * .05; }
  if (i === 10) { const d = t - T_FALL; if (d < 0) tilt = .08 + Math.sin(t * 30) * .04; else if (d < .42) { const u = d / .42; tilt = .08 + (Math.PI / 2 - .08) * u * u; } else { tilt = Math.PI / 2 - .02 * Math.exp(-(d - .42) * 8) * Math.cos((d - .42) * 40); y = .1; } }
  if (i === 11) { tilt = Math.PI / 2; y = .1; const d = t - T_OUT; if (d > 0 && d < .4) { y = .1 + Math.sin(d / .4 * Math.PI) * .25; } }
  if (i === 12) { const u = eio(clamp((t - T_LIFT) / .8)); tilt = Math.PI / 2 * (1 - u) + Math.sin(u * Math.PI) * -.15; y = .1 * (1 - u) + Math.sin(u * Math.PI) * .5; }
  VM.p = [VC[0] + VN[0] * .425 * VS, y, VC[2] + VN[2] * .425 * VS]; VM.r = [tilt, VY + yaw, roll]; return tilt; }
// ---------- loop intro (t<0 = last line) ----------
function idle(h) { pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); }
function sitGround(h, t) { h.body.p = [0, -.62, 0]; h.body.r = [-.25, 0, 0]; h.lL.r = [-1.35, 0, -.2]; h.lR.r = [-1.25, 0, .2]; h.lL.k = h.lR.k = .4; pose_(h, { sL: [.4, 0, .6], sR: [.4, 0, -.6] }); }
function bagState(t, i) { // bag A/B positions in machine-local coords
  PA.n.p = PA.p0.slice(); PA.n.r = [0, 0, 0]; PB.n.p = PB.p0.slice(); PB.n.r = [0, 0, 0]; PA.n.visible = PB.n.visible = true;
  if (t > T_BTN + .2 || t < 0 && t > -9) { const u = t < 0 ? 1 : eout(clamp((t - T_BTN - .2) / .9)); PA.n.p = A3(PA.p0, [0, -.03 * u, .1 * u]); PA.n.r = [.75 * u + (t > 0 && u < 1 ? 0 : 0), 0, 0]; if (t > T_TIP && t < T_TIP + .5) PA.n.r[0] += Math.sin((t - T_TIP) * 30) * .1 * (1 - (t - T_TIP) / .5); }
  if (t < 0) { PA.n.p = PA.p0.slice(); PA.n.r = [0, 0, 0]; }
  if (i >= 2 && t > T_B) { const u = clamp((t - T_B) / .6); if (t < T_KNOCK) { PB.n.p = A3(PB.p0, [0, 0, .12 * u]); PB.n.r = [.3 * u, 0, 0]; } else { const v = clamp((t - T_KNOCK) / .25); PB.n.p = A3(PB.p0, [0, -.27 * v * v, .12 + .02 * v]); PB.n.r = [.3 + .9 * v, 0, .2 * v]; if (v >= 1) { PA.n.r[0] = .75 + Math.sin((t - T_KNOCK - .25) * 30) * .12 * Math.exp(-(t - T_KNOCK - .25) * 4); } } }
  if (i >= 3) { PB.n.p = A3(PB.p0, [0, -.27, .14]); PB.n.r = [1.2, 0, .2]; } }
function intro(t) { const h = hero; let face = 'neutral'; h.root.p = HP.slice(); h.root.r = [0, HY, 0]; idle(h);
  if (t < -.95) { face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.root.p = A3(HP, [0, Math.abs(Math.sin(t * 10)) * .25, .15]); pose_(h, { sL: [-2.9, 0, .5 + Math.sin(t * 30) * .2], sR: [-2.4, 0, -.3], eR: [-.4, 0, 0] }); h.wob = .45; h.head.r = [-.35, 0, 0];
    hbag.visible = true; late.push(() => { hbag.p = wp(hero.armR.end, [0, -.05, .12]); hbag.r = [Math.PI + Math.sin(t * 30) * .3, HY, 0]; hbag.mat.tex = 'bag0'; });
    const d = t - (T_EMP - T_END); crumb.visible = d > 0; if (d > 0) late.push(() => { const p0 = wp(hero.armR.end, [0, -.25, .12]); crumb.p = [p0[0], Math.max(.01, p0[1] - d * d * 4.9 - d * .5), p0[2]]; crumb.r = [d * 9, d * 5, 0]; }); return face; }
  if (t < -.45) { const u = (t + .95) / .5; face = 'squint'; pose_(h, { sR: [-2.6 + u * 2.4, 0, -.6] }); hbag.visible = true; hbag.p = [HP[0] - u * 2.5, 1.8 + u * 2 - u * u * 4.5, HP[2] - u * 1.5]; hbag.r = [u * 12, u * 6, 0]; h.root.p = A3(HP, [0, 0, .15 * (1 - u)]); return face; }
  if (t < 0) { face = 'neutral'; return face; }
  // t >= 0 : coin, button, stuck
  face = 'neutral'; h.head.r = [.05, .25, 0];
  if (t < T_COIN + .2) { pose_(h, { sR: [-1.2, 0, -.35], eR: [-.5, 0, 0] }); coin.visible = t > .05 && t < T_COIN; late.push(() => { const hp = wp(hero.armR.end, [0, -.08, .05]); const sl = wp(VB, [-.375, 1.05, .45]); coin.p = lerp3(hp, sl, eio(clamp((t - .15) / (T_COIN - .15)))); coin.r = [Math.PI / 2, t * 6, 0]; }); face = 'squint'; }
  else if (t < T_BTN + .3) { pose_(h, { sR: [-1.3, 0, -.4], eR: [-.35, 0, 0] }); face = 'neutral'; if (t > T_BTN - .1) h.head.r = [.15, .3, 0]; }
  else { idle(h); face = 'grinup'; h.head.r = [0, .25, 0]; if (t > T_TIP + .2) face = 'wide'; }
  return face; }
function hideAll() { for (const m of [hero, cop]) { resetPose(m); m.root.visible = false; m.root.s = [1, 1, 1]; m.body.s = [1, 1, 1]; m.body.r = [0, 0, 0]; } hero.root.visible = true; puffs.forEach(p => p.visible = false);
  coin.visible = hbag.visible = crumb.visible = tumble.visible = false; FLY.forEach(f => f.visible = false); PROD.forEach(p => p.n.visible = true); flap.r = [0, 0, 0]; hbag.s = [.3, .4, .1]; if (cop.cap) cop.cap.visible = true; pcar.root.visible = false; }
const inside = (h, t, sq = .6) => { late.push(() => { h.root.p = wp(anchor); h.root.r = [VM.r[0] + .08, VM.r[1], VM.r[2]]; }); h.root.s = [sq, sq, sq]; PROD.forEach(p => { if (p.r <= 2 || p.c === 1) p.n.visible = false; }); };
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  const tilt = machine(t, i); bagState(i === 14 ? t - T_END : t, i === 14 ? 0 : i); h.root.p = HP.slice(); h.root.r = [0, HY, 0];
  if (i === 0) face = intro(t);
  if (i === 1) { face = intro(t); if (t > T_TIP + .3) { face = 'half'; h.head.r = [0, .35, 0]; pose_(h, { sR: [-.6, 0, -.6], eR: [-1.0, 0, 0] }); } }
  if (i === 2) { const d = t - T_B; if (d < .5) { pose_(h, { sR: [-1.25, 0, -.35], eR: [-.4, 0, 0] }); face = 'squint'; coin.visible = d < .2; late.push(() => { coin.p = lerp3(wp(hero.armR.end, [0, -.08, .05]), wp(VB, [-.375, 1.05, .45]), clamp((d + .3) / .5)); coin.r = [Math.PI / 2, t * 6, 0]; }); }
    else { idle(h); h.head.r = [0, .3, 0]; face = t < T_KNOCK ? 'grin' : (t < T_KNOCK + .5 ? 'wide' : 'grinup'); h.root.p = A3(HP, [0, Math.abs(Math.sin(t * 7)) * .08, 0]); } }
  if (i === 3) { const d = t - T_BANG; if (d < 0) { idle(h); face = 'half'; h.head.r = [0, .25, 0]; } else { face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; pose_(h, { sR: [-1.6 + Math.abs(Math.sin(t * 16)) * .7, 0, -.7], eR: [-.3, 0, 0], sL: [-2.8, 0, .5 + Math.sin(t * 20) * .3] }); h.root.p = A3(HP, [0, Math.abs(Math.sin(t * 8)) * .35, 0]); h.wob = .55; h.body.r = [0, .2, Math.sin(t * 16) * .1]; } }
  if (i === 4) { const d = t - T_SHK; h.root.r = [0, HY + .55, 0]; h.root.p = A3(HP, [.15, 0, 0]); if (d < 0) { idle(h); face = 'squint'; } else { face = Math.sin(t * 25) > 0 ? 'scream' : 'talksq'; pose_(h, { sL: [-1.5, 0, .2 + Math.sin(t * 34) * .3], sR: [-1.5, 0, -.2 + Math.sin(t * 34) * .3], eL: [-.4, 0, 0], eR: [-.4, 0, 0] }); h.body.r = [Math.sin(t * 34) * .12, 0, Math.sin(t * 17) * .15]; h.wob = .6; h.root.p[0] += Math.sin(t * 34) * .06; } }
  if (i === 5) { idle(h); face = 'half'; h.head.r = [0, -.15, 0]; h.root.r = [0, HY - .2, 0]; tumble.visible = true; const u = (t - P[5]) / (pend(5) - P[5]); tumble.p = [lerp(-3.5, 7, u), .38 + Math.abs(Math.sin(u * 16)) * .25, .9]; tumble.r = [0, 0, -u * 26]; }
  if (i === 6) { const d = t - T_DIVE; flap.r = [-clamp(d / .2) * 1.3, 0, 0]; if (d < 0) { idle(h); face = 'squint'; h.head.r = [.1, .5, 0]; }
    else { const u = clamp(d / 1.4); face = 'scream'; let p, th, sc; if (u < .25) { const a = eout(u / .25); p = lerp3(HP, loc(.125, .25, 1.7), a); p[1] += Math.sin(a * Math.PI) * .5; th = Math.PI / 2 * a; sc = lerp(1, .6, a); }
      else { const a = (u - .25) / .75; p = loc(.125, .25, lerp(1.7, -.1, a * a)); th = Math.PI / 2; sc = .6 - .1 * a; }
      h.root.p = p; h.root.r = [th, VY + Math.PI + Math.sin(t * 25) * .08 * (u > .25 ? 1 : 0), 0]; h.root.s = [sc, sc, sc]; walkPose(h, t, 34, 1.3); pose_(h, { sL: [-2.9, 0, .3], sR: [-2.9, 0, -.3] }); h.wob = .6; if (u > .92) h.root.visible = false; } }
  if (i === 7) { inside(h, t); flap.r = [-.0, 0, 0]; face = Math.sin(t * 3) > .2 ? 'worry' : 'wide'; pose_(h, { sL: [-1.7, 0, .7], sR: [-1.7, 0, -.7], eL: [-.4, 0, 0], eR: [-.4, 0, 0] }); h.head.r = [0, 0, Math.sin(t * 4) * .1]; }
  if (i === 8) { inside(h, t); face = Math.sin(t * 9) > 0 ? 'scream' : 'wide'; pose_(h, { sL: [-2.6 + Math.sin(t * 20) * .3, 0, .6], sR: [-1.6, 0, -.7] }); h.wob = .4;
    const d = t - T_RUN; cop.root.visible = d > 0; if (d > 0) { const a = clamp(d / .5); cop.root.p = lerp3([-24, 0, COPP[2] + .2], COPP, eout(a)); cop.root.r = [0, Math.PI / 2, 0]; if (a < .85) { runPose(cop, t, 46); pose_(cop, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); setFace(cop, 'scream'); cop.wob = .7; } else { cop.root.r = [0, lerp(Math.PI / 2, .35, clamp((a - .85) / .15)), -.1]; cop.body.r = [-.3, 0, 0]; pose_(cop, { sL: [-1.6, 0, .9], sR: [-1.6, 0, -.9] }); setFace(cop, 'wide'); }
      if (a >= 1) { cop.root.r = [0, .35, 0]; cop.body.r = [0, 0, 0]; idle(cop); pose_(cop, { sR: [-2.6, 0, -.9], eR: [-1.9, 0, 0] }); setFace(cop, 'grin'); cop.body.p = [0, Math.abs(Math.sin(t * 6)) * .05, 0]; } burst(T_RUN + .4, t, A3(COPP, [-.6, .15, 0]), [.85, .8, .72], 0, 16, 1.4, 1.0); } }
  if (i === 9) { inside(h, t); face = 'scream'; pose_(h, { sL: [-2.6, 0, .9], sR: [-2.6, 0, -.9] }); h.wob = .7; cop.root.visible = true; cop.root.p = COPP.slice(); cop.root.r = [0, lerp(.35, VY + Math.PI, clamp((t - P[9]) / .25)), 0]; setFace(cop, t > T_GRAB ? (Math.sin(t * 20) > 0 ? 'scream' : 'talksq') : 'squint');
    if (t > T_GRAB) { pose_(cop, { sL: [-1.5, 0, .3 + Math.sin(t * 30) * .25], sR: [-1.5, 0, -.3 + Math.sin(t * 30) * .25], eL: [-.3, 0, 0], eR: [-.3, 0, 0] }); cop.body.r = [Math.sin(t * 30) * .15, 0, Math.sin(t * 15) * .18]; cop.wob = .5; cop.root.p[1] = Math.abs(Math.sin(t * 15)) * .1; } }
  if (i === 10) { const d = t - T_FALL; if (d < .42) { inside(h, t); face = 'scream'; pose_(h, { sL: [-2.6, 0, .9], sR: [-2.6, 0, -.9] }); } else h.root.visible = false;
    cop.root.visible = true; if (d < .42) { cop.root.p = COPP.slice(); cop.root.r = [0, VY + Math.PI, 0]; setFace(cop, 'scream'); pose_(cop, { sL: [-2.9, 0, .6], sR: [-2.9, 0, -.6] }); cop.body.r = [.2 * clamp(d / .3), 0, 0]; cop.head.r = [-.5, 0, 0]; cop.wob = .6; }
    else { cop.root.p = loc(.9, .04, 1.45); cop.root.r = [-Math.PI / 2, VY + Math.PI / 2, 0]; cop.root.s = [1, 1, .4]; setFace(cop, 'dizzy'); pose_(cop, { sL: [-2.9, 0, .4], sR: [-2.9, 0, -.4] }); cop.lL.r = [Math.sin(t * 30) * .5, 0, 0]; cop.lR.r = [-Math.sin(t * 30) * .5, 0, 0]; cop.wob = .5; burst(T_IMP, t, loc(0, .1, 1.4), [.85, .8, .72], 0, 16, 2.2, .8); } }
  if (i === 11) { const d = t - T_OUT; cop.root.visible = true; cop.root.p = loc(.9, .04, 1.45); cop.root.r = [-Math.PI / 2, VY + Math.PI / 2, 0]; cop.root.s = [1, 1, .4]; setFace(cop, 'dizzy'); cop.lL.r = [Math.sin(t * 25) * .4, 0, 0]; cop.lR.r = [-Math.sin(t * 25) * .4, 0, 0]; cop.wob = .4;
    const src = loc(.1, .9, 1.4); FLY.forEach((f, k) => { const e = d - k * .025; if (e < 0) return; f.visible = true; const a = hsh(k, 7) * 6.283, sp = 1.5 + hsh(k, 8) * 2.5, vy = 5 + hsh(k, 9) * 4; const T = e; let y = src[1] + vy * T - 4.9 * T * T; const land = y < .07; if (land) { const tl = (vy + Math.sqrt(vy * vy + 4 * 4.9 * src[1])) / 9.8; f.p = [src[0] + Math.cos(a) * sp * tl, .07, src[2] + Math.sin(a) * sp * tl * .7 + .3]; f.r = [Math.PI / 2, a, 0]; } else { f.p = [src[0] + Math.cos(a) * sp * T, y, src[2] + Math.sin(a) * sp * T * .7 + .3]; f.r = [T * 9, a + T * 5, T * 7]; } });
    if (d < 0) { h.root.visible = false; } else { const u = clamp(d / .9); const top = loc(.1, .95, 1.4); h.root.p = [lerp(top[0], HP2[0], u), top[1] + Math.sin(u * Math.PI) * 2.4 - (u > .5 ? 0 : 0), lerp(top[2], HP2[2], u)]; if (u < 1) { h.root.p[1] = lerp(top[1], 0, u) + Math.sin(u * Math.PI) * 2.4; h.root.r = [u * 6.283 * 1.5, HY, 0]; face = 'scream'; pose_(h, { sL: [-2.9, 0, .8], sR: [-2.9, 0, -.8] }); h.wob = .7; } else { h.root.r = [0, HY, 0]; sitGround(h, t); face = 'dizzy'; }
      hbag.visible = true; const bu = clamp((d - .25) / .9); hbag.p = [lerp(top[0], HP2[0] + .1, bu), lerp(1, 1.0, bu) + Math.sin(bu * Math.PI) * 3, lerp(top[2], HP2[2] + .4, bu)]; hbag.r = [bu * 15, bu * 4, 0]; if (bu >= 1) late.push(() => { hbag.p = A3(wp(hero.body, [0, .75, .35]), [0, 0, 0]); hbag.r = [0, HY, 0]; }); } }
  if (i === 12) { h.root.p = HP2.slice(); sitGround(h, t); face = Math.sin(t * 2) > -.5 ? 'closed' : 'grin'; face = t < P[12] + .5 ? 'grin' : 'closed'; pose_(h, { sL: [-.9, 0, .9], eL: [-1.7, 0, 0], sR: [-.9, 0, -.9], eR: [-1.7, 0, 0] }); h.body.r = [-.25, Math.sin(t * 3) * .2, Math.sin(t * 2.5) * .12];
    hbag.visible = true; late.push(() => { hbag.p = wp(hero.body, [0, 1.35, .33]); hbag.r = [0, HY + Math.sin(t * 3) * .2, 0]; }); burst(P[12] + .1, t, A3(HP2, [0, 1.3, .3]), [1, .85, .35], 0, 10, 1.6, 2);
    cop.root.visible = true; const u = clamp((t - T_LIFT) / .8); if (u <= 0) { cop.root.p = loc(.9, .04, 1.45); cop.root.r = [-Math.PI / 2, VY + Math.PI / 2, 0]; cop.root.s = [1, 1, .4]; setFace(cop, 'dizzy'); cop.lL.r = [Math.sin(t * 25) * .4, 0, 0]; cop.lR.r = [-Math.sin(t * 25) * .4, 0, 0]; }
    else { cop.root.s = [1, 1, .22]; cop.root.p = loc(.05, 0, 1.2); cop.root.r = [0, VY + Math.PI, 0]; setFace(cop, u < 1 ? 'scream' : 'dizzy'); pose_(cop, { sL: [-2.9, 0, .4], sR: [-2.9, 0, -.4] }); cop.wob = .8; cop.body.p = [0, -Math.sin(u * Math.PI) * .15, 0]; } }
  if (i === 13) { h.root.p = HP2.slice(); sitGround(h, t); const d = t - T_OPEN; face = d < 0 ? 'grin' : 'wide'; pose_(h, { sL: [-1.3, 0, .5], eL: [-.6, 0, 0], sR: [-1.3, 0, -.5], eR: [-.6, 0, 0] }); hbag.visible = true; late.push(() => { hbag.p = wp(hero.body, [0, 1.25, .55]); hbag.r = [-.3, HY, 0]; hbag.s = [.3 * (d > 0 ? 1.15 : 1), .4, .1]; });
    if (d > 0) burst(T_OPEN, t, A3(HP2, [0, 1.4, .5]), [.95, .95, .95], 0, 8, .7, 1);
    cop.root.visible = true; const u = clamp((t - P[13]) / 1.4); cop.root.s = [1, 1, .22]; cop.root.p = [lerp(loc(.05, 0, 1.2)[0], -4.5, u), 0, lerp(loc(.05, 0, 1.2)[2], 1.0, u)]; cop.root.r = [0, -Math.PI / 2 + Math.sin(t * 10) * .6, Math.sin(t * 7) * .15]; walkPose(cop, t, 11, .8); cop.wob = .9; setFace(cop, 'dizzy'); }
  if (i >= 11 && i <= 13) PROD.forEach(p => p.n.visible = false);
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
