// =====================================================================
//  EP19 "THE GNOME" — the neighbor's gnome stared at him. Restraining order. It kept coming closer.
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
// ---------- textures ----------
texC('gface', 160, 140, (x, w, h) => { x.fillStyle = '#f2c8a8'; x.fillRect(0, 0, w, h); for (const [ex, r] of [[48, 24], [114, 27]]) { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(ex, 58, r, r * 1.1, 0, 0, 6.283); x.fill(); x.lineWidth = 5; x.strokeStyle = '#1b1b20'; x.stroke(); x.fillStyle = '#1b1b20'; x.beginPath(); x.arc(ex, 60, 6, 0, 6.283); x.fill(); }
  x.fillStyle = 'rgba(230,110,120,.55)'; x.beginPath(); x.arc(26, 104, 13, 0, 6.283); x.fill(); x.beginPath(); x.arc(136, 104, 13, 0, 6.283); x.fill(); x.lineWidth = 3; x.strokeStyle = '#1b1b20'; x.beginPath(); x.moveTo(20, 22); x.lineTo(70, 30); x.moveTo(140, 22); x.lineTo(92, 30); x.stroke(); });
texC('ro', 200, 256, (x, w, h) => { x.fillStyle = '#fbfaf4'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b1b20'; x.textAlign = 'center'; x.font = '900 30px "Inter Display"'; x.fillText('RESTRAINING', w / 2, 44); x.fillText('ORDER', w / 2, 78); x.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 7; k++) x.fillRect(22, 104 + k * 16, 150 - hsh(k, 2) * 50, 6);
  x.strokeStyle = '#d8302c'; x.lineWidth = 6; x.beginPath(); x.arc(150, 216, 26, 0, 6.283); x.stroke(); x.fillStyle = '#d8302c'; x.font = '900 16px "Inter Display"'; x.fillText('50 FT', 150, 222); });
texC('rip', 128, 160, (x, w, h) => { x.fillStyle = '#9a9ca6'; x.fillRect(0, 0, w, h); x.fillStyle = '#4a4c56'; x.textAlign = 'center'; x.font = '900 40px "Inter Display"'; x.fillText('R.I.P.', w / 2, 62); x.font = '800 22px "Inter Display"'; x.fillText('GNOME', w / 2, 100); x.fillText('?–2026', w / 2, 128); });
// ---------- the gnome ----------
function mkGnome() { const g = new Node(); const a = (c, p, s, o, r) => { const n = B(c, p, s, Object.assign({ out: .008 }, o || {})); if (r) n.r = r; g.add(n); return n; }; const cy = (par, c, p, s, o) => { const n = new Node('cyl', Object.assign({ c: hex(c), out: .008, spec: .15, rim: .1 }, o || {}), p, s); par.add(n); return n; };
  cy(g, '#7a7e86', [0, .04, 0], [.5, .04, .5]); a('#3a2a20', [-.09, .12, .06], [.13, .12, .2]); a('#3a2a20', [.09, .12, .06], [.13, .12, .2]);
  cy(g, '#3a6ab5', [0, .38, 0], [.44, .2, .44]); cy(g, '#2a2a30', [0, .42, 0], [.46, .03, .46]); a('#f0c44a', [0, .42, .225], [.08, .07, .02], { out: 0 });
  for (const s of [-1, 1]) { a('#3a6ab5', [s * .25, .42, .04], [.1, .26, .1], {}, [0, 0, s * .25]); a('#f2c8a8', [s * .28, .28, .08], [.09, .09, .09]); }
  const hd = new Node(null, null, [0, .56, 0]); g.add(hd);
  hd.add(B('#f2c8a8', [0, .15, 0], [.32, .3, .3], { out: .008 })); hd.add(new Node('quad', { c: [1, 1, 1], tex: 'gface', spec: 0, rim: 0, out: 0 }, [0, .18, .152], [.3, .26, 1]));
  hd.add(B('#f4f4f0', [0, -.02, .12], [.36, .22, .12], { out: .008 })); hd.add(B('#f4f4f0', [0, -.13, .13], [.22, .14, .1], { out: .008 })); hd.add(B('#e89a8a', [0, .11, .175], [.07, .07, .06], { out: .006 }));
  for (let k = 0; k < 7; k++) cy(hd, k % 2 ? '#c8282a' : '#d8302c', [k * .012, .33 + k * .075, -.01], [.38 - k * .05, .04, .38 - k * .05]);
  const cap = new Node(null, null, [0, .34, 0]); cap.add(B('#2b3a55', [0, .04, 0], [.4, .1, .36])); cap.add(B('#2b3a55', [0, -.01, .22], [.36, .03, .14])); cap.add(B('#f0c44a', [0, .05, .185], [.06, .06, .02], { out: 0 })); hd.add(cap); cap.visible = false;
  g.s = [1.3, 1.3, 1.3]; scene.add(g); return { g, hd, cap }; }
const GN = mkGnome();
function setGn(p, yaw, t, o = {}) { GN.g.visible = true; GN.g.p = p.slice(); GN.g.r = [o.pitch || 0, yaw, o.roll || 0]; GN.hd.r = [0, o.look || 0, 0]; GN.cap.visible = !!o.cap; }
// ---------- props ----------
const RO = new Node(null, null, [0, -.12, .14]); RO.add(B('#fbfaf4', [0, 0, 0], [.42, .54, .01], { out: .004 })); RO.add(new Node('quad', { c: [1, 1, 1], tex: 'ro', spec: 0, rim: 0, out: 0 }, [0, 0, .008], [.4, .52, 1])); hero.armR.end.add(RO);
const TMC = new Node(null, null, [0, -.1, .1]); TMC.add(B('#f0c44a', [0, 0, 0], [.2, .2, .1])); TMC.add(B('#1b1b20', [0, 0, .052], [.1, .1, .01], { out: 0 })); hero.armR.end.add(TMC);
const TAPEW = B('#f0c44a', [0, 0, 0], [.06, .012, 1], { out: 0, noShadow: 1 }); scene.add(TAPEW);
function setTape(a, b) { TAPEW.visible = true; const d = sub(b, a); const L = Math.hypot(d[0], d[1], d[2]); TAPEW.p = lerp3(a, b, .5); TAPEW.s = [.06, .012, L]; TAPEW.r = [-Math.asin(clamp(d[1] / L, -1, 1)), Math.atan2(d[0], d[2]), 0]; }
const MUG = new Node(null, null, [0, -.1, .12]); MUG.add(new Node('cyl', { c: hex('#e8e6e0'), out: .008 }, [0, 0, 0], [.16, .1, .16])); MUG.add(new Node('cyl', { c: hex('#4a2e18'), out: 0 }, [0, .09, 0], [.13, .02, .13])); hero.armR.end.add(MUG);
const SHV = new Node(null, null, [0, -.08, .05]); SHV.add(new Node('cyl', { c: hex('#8a5a3a'), out: .008 }, [0, -.3, .35], [.05, .7, .05], [1.1, 0, 0])); SHV.add(B('#8a8e96', [0, -.62, .96], [.28, .04, .34], { spec: .8, out: .008 }, [1.1, 0, 0])); hero.armR.end.add(SHV);
const KEYS = new Node(null, null, [0, -.14, .1]); KEYS.add(B('#c8ccd6', [0, 0, 0], [.04, .14, .02], { spec: 1 })); KEYS.add(new Node('cyl', { c: hex('#c8ccd6'), out: 0, spec: 1 }, [0, .09, 0], [.1, .01, .1], [1.57, 0, 0])); hero.armR.end.add(KEYS);
const CUFF = new Node(null, null, [0, -.05, 0]); CUFF.add(new Node('cyl', { c: hex('#d9dde6'), spec: 1, out: .004, rim: .4 }, [0, 0, 0], [.2, .04, .2])); hero.armR.end.add(CUFF); const CUFF2 = new Node(null, null, [0, -.05, 0]); CUFF2.add(new Node('cyl', { c: hex('#d9dde6'), spec: 1, out: .004, rim: .4 }, [0, 0, 0], [.2, .04, .2])); hero.armL.end.add(CUFF2);
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); cop.armR.end.add(DON);
// grave
const GRAVE = [2.5, 0, -4.3];
const GV = new Node(); GV.p = GRAVE.slice(); scene.add(GV);
const HOLE = new Node('cyl', { c: hex('#2a1c12'), out: 0, noShadow: 1 }, [0, .01, 0], [1.1, .01, .8]); GV.add(HOLE);
const MOUND = B('#6b4a2e', [0, .08, 0], [1.1, .2, .8], { c2: hex('#5a3c24'), pat: 6, ps: 4 }); GV.add(MOUND);
const STONE = new Node(null, null, [0, 0, -.55]); STONE.add(B('#9a9ca6', [0, .38, 0], [.5, .76, .14])); STONE.add(new Node('quad', { c: [1, 1, 1], tex: 'rip', spec: 0, rim: 0, out: 0 }, [0, .4, .072], [.46, .6, 1])); GV.add(STONE);
const PILE = B('#6b4a2e', [1.1, .1, .1], [.9, .3, .7], { c2: hex('#5a3c24'), pat: 6, ps: 4 }); GV.add(PILE);
const FLOW = new Node(null, null, [-.3, .2, .25]); for (let k = 0; k < 3; k++) { FLOW.add(B('#5c8f48', [k * .12, .1, 0], [.02, .25, .02], { out: 0 })); FLOW.add(B(['#f2d24a', '#f08aa8', '#fff'][k], [k * .12, .24, 0], [.08, .08, .08], { out: .004 })); } GV.add(FLOW);
const DIRT = []; for (let k = 0; k < 12; k++) { const n = B('#6b4a2e', [0, 0, 0], [.14, .1, .12], { out: .004 }); n.visible = false; scene.add(n); DIRT.push(n); }
function dirt(t, period = .25) { for (let k = 0; k < 12; k++) { const q = DIRT[k]; const f = ((t + k * period / 12 * 3) / period) % 1; q.visible = true; q.p = [GRAVE[0] + .2 + f * 1.0, .2 + Math.sin(f * Math.PI) * 1.4, GRAVE[2] + (hsh(k, 2) - .5) * .6]; q.r = [f * 6, k, f * 4]; } }
// shards
const SHARD = []; for (let k = 0; k < 14; k++) { const n = B('#bfe2f0', [0, 0, 0], [.12, .16, .01], { out: .003, spec: 1, a: .8 }); n.visible = false; scene.add(n); SHARD.push(n); }
function shards(t, t0, c) { const d = t - t0; if (d < 0 || d > 1.4) return; for (let k = 0; k < 14; k++) { const q = SHARD[k]; const a = hsh(k, 1) * 3.14, sp = 2 + hsh(k, 2) * 3; q.visible = true; q.p = [c[0] + Math.cos(a) * sp * d * .6, Math.max(.02, c[1] + sp * d * hsh(k, 3) - 4.9 * d * d), c[2] + Math.sin(a) * sp * d]; q.r = [d * 9 + k, d * 5, d * 7]; } }
// hero's car (convertible, faces +x, driver on the sidewalk side)
const CZ = 3.0, HCX = 1.6;
const HCAR = car({ body: '#3f8f7a', stripe: '#f4f1e8' }); scene.add(HCAR.root); HCAR.root.children[1].visible = false; HCAR.l1.visible = HCAR.l2.visible = false; HCAR.root.p = [HCX, 0, CZ]; HCAR.root.r = [0, Math.PI / 2, 0];
HCAR.root.add(B('#2a2a30', [0, .9, -.4], [1.6, .12, 1.4])); HCAR.root.add(B('#2a2a30', [0, 1.2, -1.05], [1.6, .55, .12])); HCAR.root.add(new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [.42, 1.12, .35], [.36, .04, .36], [-.9, 0, 0]));
const carW = (cx, l, cz = CZ) => [cx + l[2], l[1], cz - l[0]];
// police car seats (open top for the gnome ride)
const PSEAT = [B('#2a2a30', [0, .9, -.6], [1.6, .12, 2.2]), B('#2a2a30', [0, 1.2, -1.6], [1.6, .55, .12]), new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [.42, 1.12, .55], [.36, .04, .36], [-.9, 0, 0])]; PSEAT.forEach(n => pcar.root.add(n));
function setPcar(x, z, t, open = false, yaw = Math.PI / 2) { pcar.root.visible = true; pcar.root.p = [x, 0, z]; pcar.root.r = [0, yaw, 0]; pcar.root.children[1].visible = !open; PSEAT.forEach(n => n.visible = open); pcar.l1.p[1] = pcar.l2.p[1] = open ? 1.0 : 1.46; const s = Math.sin(t * 14) > 0; pcar.l1.mat.em = s ? 1 : .2; pcar.l2.mat.em = s ? .2 : 1; }
// neighbor
const NB = man({ id: 'nb', shape: 'can', seed: 7, skin: '#e8b48f', shirt: '#8a6aa8', stripe: '#7a5a98', pants: '#3a3a44', shoe: '#e9e4d4', hair: '#6b4a36' }); scene.add(NB.root);
// ---------- places ----------
const HP = [1.4, 0, -4.5], GN0 = [6.3, 0, -4.6], GY0 = -.75, STEP = [-1.5, .16, -6.5], GN1 = [-1.5, 0, -5.15], GN2 = [-1.5, .16, -5.85], WIN = [9.6, 2.3, -6.95], SWH = [1.4, 0, 1.0];
const HAT0 = hero.hat.p.slice();
// ---------- times ----------
const T_RO = WD.restraining - .1, T_TAPE0 = P[2] + .1, T_TAPE1 = WD.minimum + .1;
const T_SEE3 = WD.closer - .25, T_SPIT = WD.closer + .05;
const T_GRAB = P[4] + .1, T_SPIN0 = P[4] + .3, T_THROW = WD.back4 + .1, T_CRASH = WD.fucking2 + .02, T_NBOUT = T_CRASH + .25;
const T_SEE6 = WD.porch - .1;
const T_DROP = WD.it7 - .05, T_STONE = WD.it7 + .25;
const T_SEE8 = WD.car8 - .1;
const T_PC = P[10] + .3, T_COPJ = T_PC + .05, T_COPAT = T_COPJ + .35;
const T_CZIP = P[11] + .05, T_CAT = T_CZIP + .2, T_CLICK = WD.him11;
const T_OUT = WD.came - .1;
// ---------- intro / loop: he walks home through the gate, the gnome is back. staring. ----------
function intro(t) { const h = hero; let face = 'neutral'; setGn(GN0, GY0, t);
  const W0 = [-1.42, 0, .6], W1 = [-1.42, 0, -3.5];
  if (t < -2.2) { const u = clamp((t + 3.1) / .9); h.root.p = lerp3(W0, W1, u); h.root.r = [0, Math.PI, 0]; walkPose(h, t, 9, .7); face = 'neutral'; }
  else if (t < -1.1) { const u = clamp((t + 2.2) / 1.1); h.root.p = lerp3(W1, HP, u); h.root.r = [0, yawOf(W1, HP), 0]; walkPose(h, t, 9, .7); face = 'neutral'; }
  else { h.root.p = HP.slice(); const u = eio(clamp((t + 1.1) / .5)); h.root.r = [0, lerp(yawOf(W1, HP), 1.0, u), 0]; face = t < -.6 ? 'neutral' : t < 0 ? 'wide' : 'squint'; if (t > -.6 && t < -.3) h.wob = .4;
    h.head.r = [0, .35, 0]; pose_(h, { sL: [-.2, 0, .3], sR: [-.2, 0, -.3] }); }
  if (t > 0) { h.head.r = [Math.sin(t * 40) * .01, .4, 0]; if (t > WD.gnome0 + .3) { const tw = Math.sin(t * 3) > .7; face = tw ? 'squint' : 'half'; } }
  if (t > WD.fucking1 - .1 && t < WD.him0) { const d = t - WD.fucking1 + .1; argue(h, t, 1.3, 1); face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.root.p = A3(HP, [0, Math.max(0, Math.sin(d * 9)) * .3, 0]); h.wob = .6; }
  if (t > WD.him0) { face = 'squint'; pose_(h, { sL: [-.2, 0, .3], sR: [-.2, 0, -.3] }); h.head.r = [0, .4, 0]; }
  if (t > WD.staring - .1 && t < P[1]) GN.hd.r = [0, -.12, 0];
  return face; }
let i_ = 0; function hideAll() { for (const m of [hero, cop, NB]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice();
  RO.visible = TMC.visible = MUG.visible = SHV.visible = KEYS.visible = CUFF.visible = CUFF2.visible = DON.visible = false; TAPEW.visible = false; GN.g.visible = false; GN.cap.visible = false; GN.hd.r = [0, 0, 0];
  GV.visible = false; HOLE.visible = MOUND.visible = STONE.visible = PILE.visible = FLOW.visible = false; DIRT.forEach(d => d.visible = false); SHARD.forEach(s => s.visible = false); puffs.forEach(p => p.visible = false);
  pcar.root.visible = false; HCAR.root.visible = i_ >= 8 && i_ <= 14; }
const morningStretch = (h, t, t0) => { const d = t - t0; if (d < .6) { pose_(h, { sL: [-2.9, 0, .3], sR: [-2.9, 0, -.3] }); h.body.r = [-.15, 0, 0]; return 'closed'; } pose_(h, { sR: [-1.2, 0, -.2], eR: [-1.2, 0, 0] }); MUG.visible = true; return 'neutral'; };
function stage(t) { late = []; const i = ph(t); i_ = i; hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  if (i === 0) face = intro(t);
  // 1: restraining order
  if (i === 1) { setGn(GN0, GY0, t); const RP = [GN0[0] - 1.05, 0, GN0[2] + .15]; const u = clamp((t - P[1]) / (T_RO - P[1]));
    if (t < T_RO) { h.root.p = lerp3(HP, RP, eio(u)); h.root.r = [0, Math.PI / 2, 0]; walkPose(h, t, 10, .7); face = 'squint'; }
    else { h.root.p = RP.slice(); h.root.r = [0, Math.PI / 2, 0]; RO.visible = true; const sl = eout(clamp((t - T_RO) / .2)); pose_(h, { sR: [-1.55 * sl, 0, -.1], eR: [-.1, 0, 0], sL: [-.4, 0, .4] }); face = t > WD.order ? 'grin' : 'squint'; h.body.r = [.12 * sl, 0, 0]; if (t > WD.order) h.head.r = [0, 0, Math.sin(t * 12) * .08]; }
    GN.hd.r = [0, -.2, 0]; }
  // 2: fifty feet. minimum. (tape measure)
  if (i === 2) { setGn(GN0, GY0, t); const RP = [GN0[0] - 1.05, 0, GN0[2] + .15], FP = [-6.0, 0, -4.4]; const u = clamp((t - T_TAPE0) / (T_TAPE1 - T_TAPE0)); TMC.visible = true;
    h.root.p = lerp3(RP, FP, eio(u)); h.root.r = [0, Math.PI / 2, 0]; if (u > 0 && u < 1) { walkPose(h, -t, 9, .6); } pose_(h, { sR: [-1.3, 0, -.1], eR: [-.2, 0, 0] }); face = t > T_TAPE1 ? 'grin' : 'squint'; if (t > T_TAPE1) h.head.r = [Math.sin(t * 10) * .12, 0, 0];
    late.push(() => setTape(wp(hero.armR.end, [0, -.1, .2]), A3(GN0, [0, .9, 0]))); GN.hd.r = [0, -.4 * (1 - u), 0]; }
  // 3: next morning, it was closer
  if (i === 3) { h.root.p = STEP.slice(); h.root.r = [0, 0, 0]; setGn(GN1, Math.PI, t); face = morningStretch(h, t, P[3]);
    if (t > T_SEE3) { face = 'wide'; h.wob = .3; h.head.r = [.35, 0, 0]; if (t > T_SPIT) { burst(T_SPIT, t, A3(STEP, [0, 2.2, .5]), [.45, .3, .18], 0, 12, .9, 1.0); pose_(h, { sR: [-2.4, 0, -.6], eR: [-.2, 0, 0], sL: [-1.0, 0, .9] }); h.body.r = [-.2, 0, 0]; } } }
  // 4: so he threw it back
  if (i === 4) { const HT = [-1.1, 0, -4.4]; h.root.p = HT.slice(); face = 'squint';
    if (t < T_SPIN0) { h.root.r = [0, Math.PI, 0]; setGn(GN1, Math.PI, t); pose_(h, { sL: [-1.2, 0, .3], sR: [-1.2, 0, -.3] }); h.body.r = [.5, 0, 0]; }
    else if (t < T_THROW) { const u = clamp((t - T_SPIN0) / (T_THROW - T_SPIN0)); const yaw = Math.PI + u * u * 6.283 * 2.25; h.root.r = [0, yaw, 0]; pose_(h, { sL: [-1.6, 0, .2], sR: [-1.6, 0, -.2] }); h.body.r = [-.25, 0, 0]; face = 'scream'; h.wob = .5;
      late.push(() => { const p = wp(h.body, [0, 1.2, 1.4]); setGn(A3(p, [0, -.6, 0]), yaw, t, { pitch: -1.2 }); }); }
    else { h.root.r = [0, yawOf(HT, WIN), 0]; pose_(h, { sL: [-2.0, 0, .2], sR: [-2.0, 0, -.2] }); face = 'grin'; h.wob = .3; } }
  if ((i === 4 && t >= T_THROW) || (i === 5 && t < T_CRASH)) { const P0 = [-.2, 1.4, -3.5]; const u = clamp((t - T_THROW) / (T_CRASH - T_THROW)); const p = [lerp(P0[0], WIN[0], u), lerp(P0[1], WIN[1] - .4, u) + 4 * 6.5 * u * (1 - u), lerp(P0[2], WIN[2] - .2, u)]; setGn(p, u * 9, t, { pitch: u * 14, roll: u * 5 }); }
  // 5: through the neighbor's FUCKING window
  if (i === 5) { h.root.visible = false; if (t > T_CRASH) { shards(t, T_CRASH, [WIN[0], WIN[1], WIN[2] + .1]); burst(T_CRASH, t, [WIN[0], WIN[1], WIN[2] + .2], [.75, .85, .95], 0, 12, 1.2, 1.0); }
    if (t > T_NBOUT) { const d = t - T_NBOUT; NB.root.visible = true; const u = clamp(d / .55); const NL = [9.3, 0, -4.4];
      if (u < 1) { NB.root.p = [lerp(WIN[0], NL[0], u), lerp(1.2, 0, u) + Math.sin(u * Math.PI) * 1.2, lerp(WIN[2] - .3, NL[2], u)]; NB.root.r = [u * 4.2, -.4, 0]; pose_(NB, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); setFace(NB, 'scream'); NB.wob = .6; }
      else { NB.root.p = A3(NL, [0, .12, 0]); NB.root.r = [-1.5, -.3, 0]; pose_(NB, { sL: [-.3, 0, 1.2], sR: [-.3, 0, -1.2] }); setFace(NB, 'dizzy'); NB.wob = .3; burst(T_NBOUT + .55, t, A3(NL, [0, .2, 0]), [.85, .8, .72], 12, 16, .8, .6); } } }
  if (i >= 5 && i <= 14 && NWIN && (i !== 5 || t > T_CRASH)) late.push(() => { NWIN.mat.c = [.1, .1, .12]; NWIN.mat.em = 0; });
  // 6: next morning, it was on his porch
  if (i === 6) { h.root.p = STEP.slice(); h.root.r = [0, 0, 0]; setGn(GN2, Math.PI, t, { look: .0 }); face = morningStretch(h, t, P[6]); h.root.p = A3(STEP, [0, 0, -.3]);
    if (t > T_SEE6) { const d = t - T_SEE6; face = 'scream'; h.root.p = A3(STEP, [0, Math.max(0, Math.sin(clamp(d / .6) * Math.PI)) * 1.6, -.3]); pose_(h, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); h.wob = .6; MUG.visible = false;
      if (d < 1.2) { const mp = A3(STEP, [.6 + d * 1.0, 2.6 + d * 3 - 4.9 * d * d, .5]); late.push(() => { MUG.visible = false; }); burst(T_SEE6 + .05, t, A3(STEP, [0, 2.6, .4]), [.45, .3, .18], 0, 10, .8, 1.2); } } }
  // 7: so he buried it
  if (i === 7) { GV.visible = true; const HG = [GRAVE[0] - .2, 0, GRAVE[2] - 1.1]; h.root.p = HG.slice(); h.root.r = [0, .2, 0];
    if (t < T_DROP) { SHV.visible = true; HOLE.visible = true; PILE.visible = true; PILE.s = [.9, .3 * clamp((t - P[7]) / .6 + .2), .7]; PILE.p = [1.1, PILE.s[1] / 2, .1]; const a = Math.sin(t * 30); pose_(h, { sR: [-1.0 + a * .7, 0, -.2], eR: [-.4, 0, 0], sL: [-1.0 + a * .7, 0, .2], eL: [-.4, 0, 0] }); h.body.r = [.45 + a * .15, 0, 0]; face = 'squint'; h.wob = .3; dirt(t);
      setGn(A3(GRAVE, [-.9, .15, .1]), Math.PI / 2, t, { roll: 1.4 }); }
    else { HOLE.visible = false; MOUND.visible = true; PILE.visible = false; const st = clamp((t - T_STONE) / .15); STONE.visible = st > 0; STONE.s = [1, eback(st), 1]; FLOW.visible = t > T_STONE + .2;
      if (t < T_STONE) { const u = clamp((t - T_DROP) / .2); setGn(A3(GRAVE, [0, .8 * (1 - u) - .9 * u, 0]), 0, t, { pitch: -1.4 }); SHV.visible = true; pose_(h, { sR: [-1.6, 0, -.2], eR: [-.3, 0, 0] }); face = 'grin'; }
      else { face = 'closed'; h.hat.visible = false; pose_(h, { sR: [-1.0, 0, .6], eR: [-1.8, 0, 0] }); h.head.r = [.3, 0, 0]; } } }
  // 8: next morning, it was in his car
  const GCAR = carW(HCX, [.42, .3, -.25]);
  if (i >= 8 && i <= 12) { GV.visible = true; MOUND.visible = i < 10; STONE.visible = true; FLOW.visible = i < 10; HOLE.visible = i >= 10; PILE.visible = i >= 10; }
  if (i === 8 || i === 9) { h.root.p = SWH.slice(); h.root.r = [0, Math.PI / 2 + .5, 0]; setGn(GCAR, Math.PI / 2, t, { look: t > T_SEE8 + .3 ? .9 * eio(clamp((t - T_SEE8 - .3) / .8)) : 0 });
    if (i === 8) { if (t < T_SEE8) { const u = clamp((t - P[8]) / (T_SEE8 - P[8])); h.root.p = lerp3([-1.4, 0, .3], SWH, u); walkPose(h, t, 9, .7); KEYS.visible = true; pose_(h, { sR: [-.9 + Math.sin(t * 12) * .3, 0, -.2], eR: [-.6, 0, 0] }); face = 'grin'; h.root.r = [0, yawOf([-1.4, 0, .3], SWH), 0]; }
      else { face = 'wide'; h.wob = .35; pose_(h, { sL: [-.3, 0, .5], sR: [-.3, 0, -.5] }); const d = t - T_SEE8; if (d < .6) { KEYS.visible = false; burst(T_SEE8 + .25, t, A3(SWH, [.4, .1, .4]), [.85, .8, .72], 0, 4, .3, .3); } } }
    if (i === 9) { phonePose(h); face = Math.sin(t * 20) > 0 ? 'scream' : 'talksq'; h.wob = .4; pose_(h, { sL: [-1.9 + Math.sin(t * 15) * .6, 0, .5], eL: [-.8, 0, 0] }); h.root.p = A3(SWH, [0, Math.max(0, Math.sin(t * 12)) * .12, 0]); } }
  // 10: the cop saw the grave
  if (i === 10) { h.root.p = SWH.slice(); h.root.r = [0, Math.PI, 0]; face = 'grin'; pose_(h, { sR: [-1.4, 0, -.6], eR: [-.2, 0, 0] }); setGn(GCAR, Math.PI / 2, t, { look: .9 });
    const px = lerp(-16, -3.5, eout(clamp((t - P[10]) / (T_PC - P[10])))); setPcar(px, CZ, t);
    cop.root.visible = t > T_COPJ; const CG = [GRAVE[0] + .2, 0, GRAVE[2] - 1.15];
    if (t < T_COPAT) { const u = clamp((t - T_COPJ) / (T_COPAT - T_COPJ)); cop.root.p = lerp3([-3.5, .9, CZ - 1.0], CG, u); cop.root.p[1] += Math.sin(u * Math.PI) * .8 * (1 - u); cop.root.r = [0, yawOf([-3.5, 0, CZ], CG), 0]; wheelRun(cop, t, 70, .6); setFace(cop, 'neutral'); burst(T_COPJ, t, [-3.5, .4, CZ - 1], [.85, .8, .72], 0, 8, .6, .8); }
    else { cop.root.p = CG.slice(); cop.root.r = [0, -.2, 0]; const d = t - T_COPAT; setFace(cop, d < .5 ? 'squint' : 'wide'); cop.body.r = [d < .5 ? .5 : -.2, 0, 0]; pose_(cop, d < .5 ? { sL: [-.4, 0, .3], sR: [-1.6, 0, -.3], eR: [-1.3, 0, 0] } : { sL: [-2.8, 0, .5], sR: [-2.8, 0, -.5] }); cop.wob = d < .5 ? .1 : .5; } }
  // 11-12: and arrested him. for FUCKING kidnapping.
  if (i === 11 || i === 12) { h.root.p = SWH.slice(); h.root.r = [0, Math.PI - .3, 0]; setPcar(-3.5, CZ, t); setGn(GCAR, Math.PI / 2, t, { look: i === 12 ? 1.25 + Math.sin(t * .7) * .05 : .9 }); cop.root.visible = true;
    const CP = A3(SWH, [-.2, 0, -.95]);
    if (i === 11 && t < T_CAT) { const u = clamp((t - T_CZIP) / (T_CAT - T_CZIP)); cop.root.p = lerp3([GRAVE[0] + .2, 0, GRAVE[2] - 1.15], CP, u); cop.root.r = [0, yawOf([GRAVE[0], 0, GRAVE[2] - 1.15], CP), 0]; wheelRun(cop, t, 80, .6); setFace(cop, 'squint'); face = 'neutral'; }
    else { cop.root.p = CP.slice(); cop.root.r = [0, yawOf(CP, SWH), 0]; setFace(cop, Math.sin(t * 14) > 0 ? 'talk' : 'squint'); pose_(cop, { sL: [-1.3, 0, .3], eL: [-.4, 0, 0], sR: [-1.5, 0, -.3], eR: [-.4, 0, 0] }); cop.wob = .2;
      if (t > T_CLICK - .1) { CUFF.visible = CUFF2.visible = true; pose_(h, { sL: [-.7, 0, -.5], eL: [-.3, 0, 0], sR: [-.7, 0, .5], eR: [-.3, 0, 0] }); }
      face = i === 11 ? (t > T_CLICK ? 'wide' : 'neutral') : (Math.sin(t * 22) > 0 ? 'scream' : 'talksq');
      if (i === 12) { h.wob = .5; h.root.p = A3(SWH, [0, Math.max(0, Math.sin(t * 11)) * .2, 0]); h.head.r = [0, Math.sin(t * 9) * .3, 0]; cop.body.r = [0, 0, Math.sin(t * 6) * .08]; } } }
  // 13: the gnome drove the police car (open top: gnome at the wheel with a cop cap, hero + cop in the back)
  if (i === 13) { HCAR.root.visible = true; const u = (t - P[13]) / (pend(13) - P[13]); const px = lerp(-7, 6, u); const wz = 5.6 + Math.sin(t * 3) * .25; setPcar(px, wz, t, true, Math.PI / 2 + Math.cos(t * 3) * .12);
    setGn(carW(px, [.42, .3, .3], wz), Math.PI / 2 + Math.cos(t * 3) * .12, t, { cap: true, look: .5 }); GN.g.s = [1.3, 1.3, 1.3];
    h.root.p = carW(px, [.45, .35, -1.05], wz); h.root.r = [0, Math.PI / 2, 0]; sitPose(h); CUFF.visible = CUFF2.visible = true; pose_(h, { sL: [-.7, 0, -.5], sR: [-.7, 0, .5] }); face = 'half'; h.head.r = [0, -.7, 0];
    cop.root.visible = true; cop.root.p = carW(px, [-.45, .35, -1.05], wz); cop.root.r = [0, Math.PI / 2, 0]; sitPose(cop); DON.visible = true; pose_(cop, { sR: [-1.9, 0, -.2], eR: [-1.1, 0, 0] }); setFace(cop, 'neutral'); cop.head.r = [0, -.4, 0]; }
  // 14: six months later, he came home
  if (i === 14) { HCAR.root.visible = true; const ST = WD.later + .1; const px = t < ST ? lerp(-14, -1.4, eout(clamp((t - P[14]) / (ST - P[14])))) : (t < T_OUT + .4 ? -1.4 : -1.4 + 16 * (t - T_OUT - .4) ** 2); setPcar(px, CZ, t, true);
    setGn(carW(px, [.42, .3, .3]), Math.PI / 2, t, { cap: true, look: t > T_OUT ? 1.2 : 0 });
    if (t < T_OUT) { h.root.p = carW(px, [.45, .35, -1.05]); h.root.r = [0, Math.PI / 2, 0]; sitPose(h); face = 'half'; }
    else { const d = t - T_OUT; const u = clamp(d / .45); const A = carW(-1.4, [.45, .9, -1.05]), Bp = [-1.42, 0, .6];
      if (u < 1) { h.root.p = lerp3(A, Bp, u); h.root.p[1] += Math.sin(u * Math.PI) * 1.2; h.root.r = [u * 6.283, Math.PI, 0]; pose_(h, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); face = 'scream'; h.wob = .5; }
      else { h.root.p = Bp.slice(); h.root.r = [0, Math.PI, 0]; face = d < 1.0 ? 'dizzy' : 'neutral'; h.body.r = [Math.sin(d * 6) * .1, 0, Math.sin(d * 8) * .1]; burst(T_OUT + .45, t, A3(Bp, [0, .2, 0]), [.85, .8, .72], 0, 8, .8, .6); } } }
  if (i === 15) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, NB]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
