// =====================================================================
//  EP18 "THE PACKAGE" — he blinked once. We missed you. He mailed himself. Delivered to his own door.
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
const resetLegs = h => { h.lL.r = [0, 0, 0]; h.lR.r = [0, 0, 0]; h.lL.k = h.lR.k = 0; h.body.p = [0, 0, 0]; };
// ---------- scenery: lamp away, hide parked cars / poles / crosswalk / manhole / stop sign / tree right of the yard ----------
lamp.p = [-9.5, 0, 1.4];
scene.children.forEach(n => { if (!n.p) return; const z = n.p[2]; if (Math.abs(z - 10.9) < .01 && n.children && n.children.length > 3) n.visible = false; if (z > 14.7 && z < 16.3 && n.p[1] > 3) n.visible = false; if (Math.abs(n.p[0] - 12) < .01 && n.s && Math.abs(n.s[0] - 2.6) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .2 && Math.abs(z - 6.3) < .3) n.visible = false; });
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] - 9.6) < .01 && n.p[2] > 1.4 && n.p[2] < 1.5) n.visible = false; });
scene.children.forEach(n => { if (n.p && (Math.abs(n.p[0] - 4.3) < .01 || Math.abs(n.p[0] + 3.9) < .01) && n.p[2] < -3 && n.p[2] > -6 && n.children && n.children.length === 3) n.visible = false; });
const HHOUSE = scene.children.find(n => n.p && Math.abs(n.p[0]) < .01 && Math.abs(n.p[2] + 9.5) < .01 && n.children.length > 3); const HDOOR = HHOUSE.children[2]; const HDOOR0 = HDOOR.p.slice();
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- textures ----------
texC('missed', 256, 192, (x, w, h) => { x.fillStyle = '#ffe34a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, 0, w, 26); x.fillStyle = '#1b1b20'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 46px "Inter Display"'; x.fillText('WE', w / 2, 58); x.fillText('MISSED', w / 2, 102); x.fillText('YOU :)', w / 2, 146); });
texC('label', 256, 160, (x, w, h) => { x.fillStyle = '#fbfaf4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1b1b20'; x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#1b1b20'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.font = '900 44px "Inter Display"'; x.fillText('TO: DEPOT', 20, 48); for (let k = 0; k < 30; k++) x.fillRect(22 + k * 7, 86, hsh(k, 3) > .5 ? 4 : 2, 50); });
texC('fragile', 256, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#d8302c'; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#d8302c'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 52px "Inter Display"'; x.fillText('FRAGILE', w / 2, h / 2 + 3); });
texC('parcel', 512, 128, (x, w, h) => { x.fillStyle = '#6b4426'; x.fillRect(0, 0, w, h); x.fillStyle = '#f0c44a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 80px "Inter Display"'; x.fillText('FAST PARCEL', w / 2, h / 2 - 8); x.font = '800 24px "Inter Display"'; x.fillText('WE ALWAYS MISS YOU', w / 2, h - 16); });
texC('dollar', 128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#2a6a3a'; x.font = '900 110px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$', w / 2, h / 2 + 6); });
// ---------- the delivery van (front = +x, hatch on the sidewalk side -z) ----------
const TZ = 3.7, VXP = -0.6, VC = '#6b4426';
const VAN = new Node(), VB = new Node(); VAN.add(VB); scene.add(VAN);
const vb = (c, p, s, o, r) => { const n = B(c, p, s, o); if (r) n.r = r; VB.add(n); return n; };
vb('#2a2a30', [0, .62, 0], [5.3, .22, 1.9]); vb(VC, [-.85, 2.05, 0], [3.5, 2.7, 2.0]); vb('#f0c44a', [-.85, 1.0, 0], [3.52, .16, 2.02], { out: 0 }); vb('#f0c44a', [-.85, 3.32, 0], [3.52, .1, 2.02], { out: 0 });
VB.add(new Node('quad', { c: [1, 1, 1], tex: 'parcel', spec: 0, rim: 0, out: 0 }, [-.85, 2.3, 1.012], [3.0, .75, 1])); VB.add(new Node('quad', { c: [1, 1, 1], tex: 'parcel', spec: 0, rim: 0, out: 0 }, [-.85, 3.0, -1.012], [2.4, .6, 1], [0, Math.PI, 0]));
vb('#24160c', [-.85, 1.9, -.995], [1.6, 1.1, .02], { out: 0 });
vb(VC, [1.85, 1.1, 0], [1.9, .8, 2.0]); vb(VC, [1.5, 2.15, 0], [1.3, 1.3, 2.0]); vb('#9fd0e8', [2.17, 2.15, 0], [.03, .95, 1.8], { spec: .9, out: 0 }); for (const z of [-1.0, 1.0]) vb('#9fd0e8', [1.55, 2.25, z * 1.005], [.9, .7, .02], { out: 0, spec: .9 });
for (const z of [-.7, .7]) vb('#fff4c0', [2.81, 1.25, z], [.04, .2, .32], { em: .8, out: 0 }); vb('#c8ccd6', [2.86, .78, 0], [.12, .22, 2.0], { spec: .8 }); vb('#c8ccd6', [-2.66, .78, 0], [.12, .22, 2.0], { spec: .8 }); vb('#4a2e18', [-2.61, 2.0, 0], [.03, 2.4, .05], { out: 0 });
for (const z of [-.6, .6]) vb('#e3263a', [-2.62, 1.0, z], [.03, .18, .25], { em: .5, out: 0 });
const WHL = []; for (const x of [-1.8, 1.8]) for (const z of [-1.0, 1.0]) { const w = new Node(null, null, [x, .45, z]); w.add(new Node('cyl', { c: hex('#1d1d22'), out: .015 }, [0, 0, 0], [.9, .14, .9], [1.5708, 0, 0])); w.add(new Node('cyl', { c: hex('#c8ccd6'), out: 0, spec: .8 }, [0, 0, z * .15], [.45, .02, .45], [1.5708, 0, 0])); w.add(B('#8a8e96', [0, 0, z * .16], [.4, .06, .02], { out: 0 })); VB.add(w); WHL.push(w); }
const HATCH = new Node(null, null, [-.85, 2.5, -1.03]); HATCH.add(B(VC, [0, -.6, 0], [1.75, 1.2, .05])); HATCH.add(B('#f0c44a', [0, -1.15, -.03], [1.75, .08, .01], { out: 0 })); VB.add(HATCH);
const HATCHW = () => [VXP - .85, 1.9, TZ - 1.0];
function setVan(x, yaw = 0, roll = 0, lift = 0) { VAN.visible = true; VAN.p = [x, lift, TZ]; VAN.r = [0, yaw, 0]; VB.r = [roll, 0, 0]; WHL.forEach(w => w.r = [0, 0, -x / .45]); }
// ---------- people ----------
const DG = man({ id: 'pilot', shape: 'disc', seed: 5, skin: '#e8b48f', shirt: '#6b4426', pants: '#5a3a20', shoe: '#1d1d22', cap: '#6b4426', capBadge: '#f0c44a' }); scene.add(DG.root);
DG.body.add(B('#f0c44a', [0, 1.5, .175], [.3, .08, .02], { out: 0 }));
const PAD = new Node(null, null, [0, -.12, .1]); PAD.add(B('#ffe34a', [0, 0, 0], [.22, .03, .17], { out: .004 })); DG.armR.end.add(PAD);
const TH = man({ id: 'nb', shape: 'can', seed: 9, skin: '#e8b48f', shirt: '#f4f1e8', stripe: '#1b1b20', pants: '#2a2a30', shoe: '#1d1d22', beanie: '#1b1b20', beanie2: '#3a3a44' }); scene.add(TH.root);
const SACK = new Node(null, null, [0, -.35, .05]); SACK.add(B('#c9b07a', [0, -.1, 0], [.55, .6, .5])); SACK.add(B('#9a8050', [0, .26, 0], [.18, .14, .18])); SACK.add(new Node('quad', { c: [1, 1, 1], tex: 'dollar', spec: 0, rim: 0, out: 0 }, [0, -.1, .256], [.36, .36, 1])); TH.armL.end.add(SACK);
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [0, 0, .045], [.09, .06, .09], [1.5708, 0, 0])); cop.armR.end.add(DON);
// stickers on the hero's face
const STK = []; for (const [p, r] of [[[.04, .6, .118], .22], [[-.1, .32, .12], -.28]]) { const n = new Node('quad', { c: [1, 1, 1], tex: 'missed', spec: 0, rim: 0, out: 0 }, p, [.27, .2, 1], [0, 0, r]); hero.head.add(n); STK.push(n); }
// ---------- pigeon ----------
function mkPigeon(o = {}) { const g = new Node(); const C = o.c || '#8d93a3', C2 = '#5d6372'; const add = (c, p, s, op) => { const n = B(c, p, s, Object.assign({ out: .006 }, op || {})); g.add(n); return n; };
  add(C, [0, 0, 0], [.17, .15, .27]); add('#a9aebb', [0, -.02, .08], [.15, .11, .14], { out: 0 }); const head = new Node(null, null, [0, .13, .12]); g.add(head);
  head.add(B(C2, [0, 0, 0], [.12, .12, .13], { out: .006 })); head.add(B('#e2b070', [0, -.02, .09], [.04, .035, .07], { out: 0 })); for (const s of [-1, 1]) { head.add(B('#ff8a2a', [s * .061, .02, .03], [.01, .035, .035], { out: 0 })); head.add(B('#1b1b20', [s * .066, .02, .035], [.01, .018, .018], { out: 0 })); }
  add('#5f9c84', [0, .07, .1], [.135, .05, .09], { out: 0, spec: .8 }); add('#8a6aa8', [0, .05, .08], [.14, .025, .08], { out: 0, spec: .8 }); add(C2, [0, .02, -.18], [.13, .03, .13]);
  const wl = new Node(null, null, [-.085, .05, 0]), wr = new Node(null, null, [.085, .05, 0]); wl.add(B('#7a8090', [-.07, 0, -.02], [.14, .02, .22], { out: .006 })); wr.add(B('#7a8090', [.07, 0, -.02], [.14, .02, .22], { out: .006 })); g.add(wl, wr);
  for (const s of [-1, 1]) add('#e86a5a', [s * .04, -.11, .02], [.025, .08, .025], { out: 0 });
  g.s = [1.6, 1.6, 1.6]; scene.add(g); return { g, wl, wr, head }; }
function setPig(q, pos, yaw, flap, t, pitch = 0, k = 0) { q.g.visible = true; q.g.p = pos; q.g.r = [pitch, yaw, 0]; const a = flap > 0 ? Math.sin(t * 34 + k) * 1.1 * flap + .2 : 0; q.wl.r = [0, 0, a]; q.wr.r = [0, 0, -a]; q.head.r = [flap > 0 ? 0 : Math.max(0, Math.sin(t * 7 + k * 1.7)) * .5, 0, 0]; }
const PG = mkPigeon();
const FEA = []; for (let k = 0; k < 16; k++) { const n = B('#eef0f4', [0, 0, 0], [.07, .01, .2], { out: .003, noShadow: 1 }); n.visible = false; scene.add(n); FEA.push(n); }
function feathers(t, t0, c, n = 16, sp = 1, dur = 2.5) { const d = t - t0; if (d < 0 || d > dur) return; for (let k = 1; k < n; k++) { const q = FEA[k]; const a = hsh(k, 1) * 6.283, r = (1 - Math.exp(-d * 4)) * (1 + hsh(k, 2) * 2) * sp; q.visible = true; q.p = [c[0] + Math.cos(a) * r + Math.sin(t * 3 + k) * .2, Math.max(.02, c[1] + (1 - Math.exp(-d * 5)) * 1.5 * sp * hsh(k, 3) - d * .5), c[2] + Math.sin(a) * r]; q.r = [Math.sin(t * 4 + k) * .8, k + t, Math.cos(t * 3 + k) * .8]; } }
const PAPERS = []; for (let k = 0; k < 8; k++) { const n = B('#ffe34a', [0, 0, 0], [.22, .01, .17], { out: .004 }); n.visible = false; scene.add(n); PAPERS.push(n); }
// ---------- the cardboard box ----------
const BX = .7; const PB = new Node(); scene.add(PB);
PB.add(B('#b9824a', [0, BX, 0], [BX * 2, BX * 2, BX * 2], { c2: hex('#a8743e'), pat: 5, ps: 6 })); PB.add(B('#3a2414', [0, BX * 2 - .02, 0], [BX * 2 - .1, .02, BX * 2 - .1], { out: 0 }));
PB.add(new Node('quad', { c: [1, 1, 1], tex: 'fragile', spec: 0, rim: 0, out: 0 }, [BX + .006, BX + .25, 0], [.9, .34, 1], [0, Math.PI / 2, 0])); PB.add(B('#d9b77a', [0, BX, BX + .004], [.2, BX * 2, .01], { out: 0 }));
const FLAPS = []; for (const [hp, cp, s, ax, sg] of [[[0, BX * 2 + .012, BX], [0, 0, -BX / 2], [BX * 2, .025, BX], 0, 1], [[0, BX * 2 + .012, -BX], [0, 0, BX / 2], [BX * 2, .025, BX], 0, -1], [[-BX, BX * 2, 0], [BX / 2, 0, 0], [BX, .025, BX * 2], 2, 1], [[BX, BX * 2, 0], [-BX / 2, 0, 0], [BX, .025, BX * 2], 2, -1]]) {
  const hn = new Node(null, null, hp); hn.add(B('#c08a52', cp, s, { out: .006 })); PB.add(hn); FLAPS.push({ hn, ax, sg }); }
const TAPE = new Node(null, null, [0, BX * 2 + .03, 0]); TAPE.add(B('#d9b77a', [0, 0, 0], [.3, .012, BX * 2 + .04], { out: 0, spec: .5 })); PB.add(TAPE);
const LABEL = new Node('quad', { c: [1, 1, 1], tex: 'label', spec: 0, rim: 0, out: 0 }, [.33, BX - .05, BX + .008], [.6, .38, 1]); PB.add(LABEL);
const BSTK = new Node('quad', { c: [1, 1, 1], tex: 'missed', spec: 0, rim: 0, out: 0 }, [-.32, BX + .38, BX + .01], [.52, .39, 1], [0, 0, .12]); PB.add(BSTK);
function setFlaps(open) { FLAPS.forEach(f => { const a = 2.3 * clamp(open) * f.sg; f.hn.r = f.ax === 0 ? [a, 0, 0] : [0, 0, a]; }); }
function flapsClose(t, t0) { FLAPS.forEach((f, k) => { const u = 1 - eout(clamp((t - t0 - k * .09) / .16)); const a = 2.3 * u * f.sg; f.hn.r = f.ax === 0 ? [a, 0, 0] : [0, 0, a]; }); }
function setBox(p, r = [0, 0, 0], s = 1) { PB.visible = true; PB.p = p.slice(); PB.r = r; PB.s = [s, s, s]; }
// tumbleweed
const TW = new Node(); for (let k = 0; k < 9; k++) TW.add(B(['#a8865a', '#8a6a42', '#c0a070'][k % 3], [(hsh(k, 1) - .5) * .3, (hsh(k, 2) - .5) * .3, (hsh(k, 3) - .5) * .3], [.55, .08, .08], { out: .005 }, [hsh(k, 4) * 3, hsh(k, 5) * 3, hsh(k, 6) * 3])); scene.add(TW);
function dustLine(t, a, b, n0 = 0, n1 = 10, col = [.85, .8, .72], fade = 1) { if (fade <= 0) return; for (let k = n0; k < n1; k++) { const q = puffs[k]; const f = (k - n0) / (n1 - n0); q.visible = true; const p = lerp3(a, b, f); q.p = [p[0] + Math.sin(t * 5 + k) * .15, .25 + hsh(k, 2) * .45 + (1 - fade) * .5, p[2]]; q.mat.c = col; q.mat.a = .55 * fade * (1 - f * .4); q.s = [.5, .5, .5].map(v => v * (1 + (1 - fade))); } }
// ---------- places ----------
const STEP = [-1.5, .16, -6.5], BOXD = [-1.5, 0, -5.65], BOX8 = [-.05, 0, -5.3], BF8 = [-.05, 0, -4.25], HOLD_Y = 2.75, SW = [-1.45, 0, 1.75], BFRONT = [-1.5, 0, -4.6];
const HAT0 = hero.hat.p.slice();
// ---------- times ----------
const T_BL = WD.blinked + .1, T_BL1 = T_BL + .22;
const T_PIGIN = WD.landed - .3, T_PIGON = WD.landed + .1;
const T_TH1 = WD.cop - .25, T_CP1 = T_TH1 + .55, T_TRIP = T_CP1 + (-1.42 + 9.5) / 11, T_TH2 = WD.nothing5 + .15, T_CP2 = T_TH2 + .45;
const T_SNZ = WD.sneezed + .38, T_SNZ1 = T_SNZ + .3, T_VAN2 = T_SNZ + .28;
const T_RIP = WD.fucking2 + .3;
const T_JUMP = WD.mailed + .05, T_IN = T_JUMP + .38, T_FLAP = T_IN + .05, T_TAPE = WD.depot - .05, T_LAB = WD.depot + .3;
const T_ARR = P[9] + .2, T_DG0 = T_ARR + .05, T_DGAT = T_DG0 + .4, T_LIFT = WD.picked + .05, T_BACK = T_LIFT + .15, T_BACKAT = T_BACK + .38, T_TOSS = T_BACKAT + .05, T_TOSSIN = T_TOSS + .22;
const T_GO = P[10] + .05, T_RET = WD.around + .05, T_SPIN = WD.fucking3 - .05, T_STOP = P[11] - .15;
const T_THROW = WD.threw + .3, T_IMP = WD.door + .02;
const T_Z0 = P[12] + .02, T_ZAT = T_Z0 + .16, T_SLAP = WD.missed12 + .02, T_ZB = T_SLAP + .12, T_ZBAT = T_ZB + .16, T_VAN3 = T_ZBAT + .1;
const vanGo = (t, t0) => VXP + 18 * Math.max(0, t - t0) ** 2;
const SW11 = [-1.45, 0, .5]; const BTH0 = [SW11[0], HOLD_Y + .15, SW11[2]], BIMP = [-1.5, 1.0, -6.25];
const boxFly = u => [lerp(BTH0[0], BIMP[0], u), lerp(BTH0[1], BIMP[1], u) + 4 * 5.5 * u * (1 - u), lerp(BTH0[2], BIMP[2], u)];
// ---------- intro / loop: he climbs out of the box, orders another package, waits ----------
function intro(t) { const h = hero; let face = 'neutral'; const T13 = P[13] - T_END;
  if (t < -.4) {
    if (t < -1.05) { setBox(BOXD); TAPE.visible = t < -2.9; BSTK.visible = true; LABEL.visible = true; if (t < -2.9) { setFlaps(0); PB.r = [0, 0, Math.sin(t * 30) * .03 * (t > T13 + .4 ? 1 : 0)]; } else setFlaps(eout(clamp((t + 2.9) / .12))); }
    else { const d = t + 1.05; setBox([BOXD[0] - 7.5 * d, 7 * d - 4.9 * d * d, BOXD[2] + 2.5 * d], [d * 6, d * 4, d * 3]); setFlaps(1); BSTK.visible = LABEL.visible = true; TAPE.visible = false; } }
  if (t < -2.9) { h.root.visible = false; }
  else if (t < -1.6) { const u = eout(clamp((t + 2.9) / .25)); h.root.p = [BOXD[0], lerp(-1.6, -.3, u), BOXD[2]]; h.root.r = [0, 0, 0]; h.wob = .15;
    if (t > -2.62) { phonePose(h); face = 'squint'; h.head.r = [.25, 0, 0]; if (t < -1.95) h.eR.r = [-.4 + Math.sin(t * 40) * .15, 0, 2.3]; else { face = 'grin'; h.head.r = [0, 0, 0]; } } else face = 'wide'; }
  else if (t < -1.2) { const u = clamp((t + 1.6) / .4); h.root.p = lerp3([BOXD[0], -.3, BOXD[2]], STEP, eio(u)); h.root.p[1] += Math.sin(u * Math.PI) * 1.4; h.root.r = [0, 0, 0]; face = 'grin'; pose_(h, { sL: [-.6, 0, .9], sR: [-.6, 0, -.9] }); h.lL.r = h.lR.r = [-.6 * Math.sin(u * Math.PI), 0, 0]; }
  else if (t < -.75) { const u = clamp((t + 1.2) / .45); h.root.p = STEP.slice(); h.lR.r = [-1.5 * Math.sin(u * Math.PI), 0, 0]; h.body.r = [.25 * Math.sin(u * Math.PI), 0, 0]; pose_(h, { sL: [-.6, 0, .6], sR: [.4, 0, -.4] }); face = u > .3 ? 'grin' : 'squint'; }
  else { h.root.p = STEP.slice(); h.root.r = [0, 0, 0]; face = t < 0 ? 'grin' : 'neutral';
    pose_(h, { sL: [-.9, 0, .75], eL: [-1.6, 0, 0], sR: [-.9, 0, -.75], eR: [-1.6, 0, 0] }); h.lR.r = [-Math.max(0, Math.sin(t * 10)) * .3, 0, 0];
    if (t > 0) { h.head.r = [0, Math.sin(t * 1.4) * .5, 0]; face = t > .8 ? 'squint' : 'neutral'; } }
  if (t > WD.fucking1 - .1 && t < WD.package0 + .45) { const d = t - WD.fucking1 + .1; resetLegs(h); h.root.p = A3(STEP, [0, Math.max(0, Math.sin(d * 9)) * .35, 0]); argue(h, t, 1.5, 1); face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.wob = .6; h.lL.r = [-.5 * Math.max(0, Math.sin(d * 9)), 0, -.2]; h.lR.r = [-.5 * Math.max(0, Math.sin(d * 9 + 1)), 0, .2]; }
  if (t > WD.package0 + .45 && t < P[1]) { face = 'squint'; h.head.r = [0, .45, 0]; }
  if (t > .7 && t < 2.6) { const u = (t - .7) / 1.9; TW.visible = true; TW.p = [lerp(-8, 6, u), .3 + Math.abs(Math.sin(u * 14)) * .35, -4.4]; TW.r = [0, 0, -u * 20]; }
  return face; }
function hideAll() { for (const m of [hero, cop, DG, TH]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice();
  STK.forEach(s => s.visible = false); DON.visible = false; PAD.visible = false; SACK.visible = true; PG.g.visible = false; FEA.forEach(f => f.visible = false); PAPERS.forEach(p => p.visible = false); puffs.forEach(p => p.visible = false);
  PB.visible = false; PB.r = [0, 0, 0]; PB.s = [1, 1, 1]; setFlaps(0); TAPE.visible = true; TAPE.s = [1, 1, 1]; TAPE.p = [0, BX * 2 + .03, 0]; LABEL.visible = true; BSTK.visible = false; TW.visible = false; VAN.visible = false; HATCH.r = [0, 0, 0]; HDOOR.p = HDOOR0.slice(); HDOOR.r = [0, 0, 0]; pcar.root.visible = false; }
function standStep(h) { h.root.p = STEP.slice(); h.root.r = [0, 0, 0]; }
const runner = (m, a, b, t0, t, dur, sp = 60) => { const u = (t - t0) / dur; if (u < 0 || u > 1) return false; m.root.visible = true; m.root.p = lerp3(a, b, u); m.root.r = [0, yawOf(a, b), 0]; wheelRun(m, t, sp, .45); return true; };
const slapPose = () => { DG.root.visible = true; DG.root.r = [0, Math.PI, 0]; pose_(DG, { sR: [-1.7, 0, -.1], eR: [-.1, 0, 0], sL: [-.3, 0, .5] }); DG.body.r = [.2, 0, 0]; setFace(DG, 'grin'); PAD.visible = true; };
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  if (i === 0) face = intro(t);
  if (i === 1) { standStep(h); face = t < WD.blinked ? 'squint' : 'neutral'; h.head.r = [0, .45 * (1 - eio(clamp((t - P[1]) / .35))), 0]; pose_(h, { sL: [-.9, 0, .75], eL: [-1.6, 0, 0], sR: [-.9, 0, -.75], eR: [-1.6, 0, 0] });
    if (t > T_BL && t < T_BL1) { face = 'closed'; slapPose(); DG.root.p = A3(STEP, [-.85, -.16, .75]); DG.root.r = [0, 2.3, 0]; }
    if (t > T_BL + .12) STK[0].visible = true;
    if (t >= T_BL1) { face = 'wide'; h.wob = .25; dustLine(t, A3(STEP, [0, 0, 1.2]), [-1.45, 0, 1.6], 0, 12, [.85, .8, .72], clamp(1 - (t - T_BL1) * .8)); } }
  if (i === 2) { standStep(h); STK[0].visible = true; face = t < P[2] + .5 ? 'wide' : 'half'; pose_(h, { sL: [-.1, 0, .25], sR: [-.1, 0, -.25] }); h.wob = .1; h.head.r = [0, 0, -.06];
    dustLine(t, A3(STEP, [0, 0, 1.2]), [-1.45, 0, 1.6], 0, 12, [.85, .8, .72], clamp(1 - (t - T_BL1) * .8)); }
  if (i === 3) { standStep(h); STK[0].visible = true; face = 'wide'; h.head.r = [Math.sin(t * 50) * .015, Math.sin(t * 37) * .02, 0]; pose_(h, { sL: [-.15, 0, .2], sR: [-.15, 0, -.2] }); h.wob = .05; }
  const hatTop = () => wp(h.head, [.16, 1.1, 0]);
  if (i >= 4 && i <= 6) { standStep(h); STK[0].visible = true; face = 'wide'; h.head.r = [Math.sin(t * 50) * .01, 0, 0]; pose_(h, { sL: [-.15, 0, .2], sR: [-.15, 0, -.2] }); h.wob = .04; }
  if (i === 4) { if (t > T_PIGIN) { if (t < T_PIGON) { const u = (t - T_PIGIN) / (T_PIGON - T_PIGIN); late.push(() => { const e = hatTop(); setPig(PG, [lerp(e[0] + 5, e[0], eout(u)), lerp(e[1] + 4, e[1], eout(u)) + Math.sin(u * Math.PI) * .6, lerp(e[2] - 1, e[2], u)], -1.6, 1, t); }); }
      else late.push(() => { setPig(PG, hatTop(), .3 + Math.sin(t * 2) * .3, 0, t); if (t > WD.head) PG.head.r = [Math.max(0, Math.sin(t * 16)) * 1.0, 0, 0]; }); }
    if (t > WD.head + .1) h.head.r = [Math.max(0, Math.sin(t * 16)) * .04, 0, 0]; }
  if (i === 5 || i === 6) late.push(() => { if (i === 6 && t > T_SNZ) return; setPig(PG, hatTop(), .3 + Math.sin(t * 1.5) * .4, 0, t); });
  if (i === 5) { const ZR = -5.0;
    runner(TH, [-9.5, 0, ZR], [8, 0, ZR], T_TH1, t, 1.6, 55);
    if (t < T_TRIP) runner(cop, [-9.5, 0, ZR], [-1.42, 0, ZR], T_CP1, t, T_TRIP - T_CP1, 65);
    else if (t < T_TRIP + .55) { const d = t - T_TRIP; cop.root.visible = true; const sl = 1.6 * (1 - Math.exp(-d * 5)); cop.root.p = [-1.42 + sl, Math.max(0, Math.sin(clamp(d / .2) * Math.PI) * .4), ZR]; cop.root.r = [lerp(.2, 1.5, clamp(d / .2)), Math.PI / 2, 0]; pose_(cop, { sL: [-3.0, 0, .4], sR: [-3.0, 0, -.4] }); cop.wob = .5; burst(T_TRIP + .15, t, [-1.42 + 1.2, .2, ZR], [.85, .8, .72], 0, 10, .8, .9); }
    else runner(cop, [.2, 0, ZR], [9.5, 0, ZR], T_TRIP + .55, t, .9, 65);
    if (cop.root.visible) setFace(cop, t < T_TRIP ? 'scream' : t < T_TRIP + .55 ? 'dizzy' : 'squint');
    runner(TH, [8.5, 0, ZR - .3], [-10, 0, ZR - .3], T_TH2, t, 1.6, 55); if (t > T_CP2) { const ok = runner(cop, [9, 0, ZR + .25], [-10, 0, ZR + .25], T_CP2, t, 1.7, 65); if (ok) { DON.visible = true; setFace(cop, 'talk'); pose_(cop, { sR: [-1.9, 0, -.2], eR: [-1.0, 0, 0] }); } }
    if (TH.root.visible) setFace(TH, 'wide'); }
  if (i === 6) { const f = clamp((t - P[6]) / (T_SNZ - .4 - P[6])); if (t < T_SNZ - .15) { FEA[0].visible = true; late.push(() => { const n = wp(h.head, [.1, .35, .25]); FEA[0].p = [n[0] + Math.sin(t * 6) * .25 * (1 - f), n[1] + (1 - f) * 1.4, n[2]]; FEA[0].r = [Math.sin(t * 5) * .6, t, .3]; }); }
    if (t > WD.sneezed - .1 && t < T_SNZ) { const u = clamp((t - WD.sneezed + .1) / (T_SNZ - WD.sneezed + .1)); face = u < .5 ? 'half' : 'closed'; h.body.r = [-.35 * eio(u), 0, 0]; h.head.r = [-.3 * u, 0, 0]; }
    else if (t >= T_SNZ && t < T_SNZ + .45) { face = 'dizzy'; const d = t - T_SNZ; h.body.r = [.55 * Math.exp(-d * 5), 0, 0]; h.head.r = [.4 * Math.exp(-d * 6), 0, 0]; h.wob = .5; burst(T_SNZ, t, A3(STEP, [0, 2.2, .9]), [.95, .95, .98], 0, 14, 1.4, 1.0); h.hat.p = A3(HAT0, [0, Math.sin(clamp(d / .4) * Math.PI) * .5, 0]);
      if (t > T_SNZ + .03 && t < T_SNZ1) { slapPose(); DG.root.p = A3(STEP, [-.85, -.16, .75]); DG.root.r = [0, 2.3, 0]; } }
    else if (t >= T_SNZ + .45) { face = 'wide'; dustLine(t, A3(STEP, [0, 0, 1.2]), [-1.45, 0, 1.6], 0, 10, [.85, .8, .72], clamp(1 - (t - T_SNZ1) * .9)); }
    if (t > T_SNZ + .15) STK[1].visible = true;
    if (t > T_SNZ) { const d = t - T_SNZ; late.push(() => { const s = A3(STEP, [0, 3.0, 0]); setPig(PG, [s[0] + d * 3, s[1] + d * 3.5, s[2] - d * 1.5], 1.2, 1, t, -.4); }); feathers(t, T_SNZ, A3(STEP, [0, 3.0, 0]), 14, 1.0, 2.0); } }
  if (i === 7) { standStep(h); STK[0].visible = STK[1].visible = t < T_RIP; face = 'wide'; pose_(h, { sL: [-.15, 0, .2], sR: [-.15, 0, -.2] });
    if (t < T_VAN2 + 3) setVan(VXP + 6 * Math.max(0, t - T_VAN2) ** 2);
    if (t > WD.fucking2 - .12) { const d = t - WD.fucking2 + .12; h.root.p = A3(STEP, [0, Math.max(0, Math.sin(d * 10)) * .45, 0]); argue(h, t, 1.6, 2); face = Math.sin(t * 24) > 0 ? 'scream' : 'talksq'; h.wob = .6; h.lL.r = [-.6 * Math.max(0, Math.sin(d * 10)), 0, -.25]; h.lR.r = [-.6 * Math.max(0, Math.sin(d * 10 + 1.5)), 0, .25];
      if (t > T_RIP - .1 && t < T_RIP + .1) pose_(h, { sL: [-2.8, 0, .2], eL: [-.4, 0, 0], sR: [-2.8, 0, -.2], eR: [-.4, 0, 0] });
      const dp = t - T_RIP; if (dp > 0) for (let k = 0; k < 8; k++) { const q = PAPERS[k]; q.visible = true; q.p = [STEP[0] + Math.cos(k * 2.4) * dp * 1.6, Math.max(.02, 2.5 + dp * 2.2 * hsh(k, 1) - dp * dp * 2.2), STEP[2] + .5 + Math.sin(k * 2.4) * dp * 1.2 + dp]; q.r = [dp * (3 + k), dp * 2, dp * (2 - k * .3)]; } } }
  if (i === 8) { setBox(BOX8); TAPE.visible = false; LABEL.visible = false; setFlaps(1);
    if (t < T_JUMP) { standStep(h); face = 'grin'; h.root.r = [0, .5, 0]; pose_(h, { sR: [-1.4, 0, -.2], eR: [-.2, 0, 0] }); h.head.r = [.15, 0, 0]; }
    else if (t < T_IN) { const u = clamp((t - T_JUMP) / (T_IN - T_JUMP)); h.root.p = [lerp(STEP[0], BOX8[0], eio(u)), lerp(STEP[1], -1.0, u * u) + Math.sin(u * Math.PI) * 1.3, lerp(STEP[2], BOX8[2], eio(u))]; h.root.r = [.3 * u, .9, 0]; pose_(h, { sL: [-2.9, 0, .2], sR: [-2.9, 0, -.2] }); h.lL.r = h.lR.r = [-.8 * Math.sin(u * Math.PI), 0, 0]; face = 'scream'; h.wob = .4; }
    else { h.root.visible = false; flapsClose(t, T_FLAP); PB.r = [0, 0, Math.sin(t * 28) * .03 * clamp(1 - (t - T_IN) * 1.5)]; PB.s = [1, 1 - .08 * Math.exp(-(t - T_IN) * 8), 1];
      if (t > T_TAPE) { TAPE.visible = true; const s = Math.max(.02, eout(clamp((t - T_TAPE) / .3))); TAPE.s = [1, 1, s]; TAPE.p = [0, BX * 2 + .03, (1 - s) * -BX]; }
      LABEL.visible = t > T_LAB; } }
  if (i >= 9 && i <= 12) h.root.visible = false;
  if (i === 9) { const vx = lerp(-17, VXP, eout(clamp((t - P[9]) / (T_ARR - P[9])))); setVan(vx); if (t < T_ARR + .7) burst(T_ARR - .05, t, [VXP - 2.6, .3, TZ - .9], [.6, .6, .62], 0, 10, 1, .8);
    HATCH.r = [1.4 * eout(clamp((t - T_ARR) / .12)) * (t < T_TOSSIN + .15 ? 1 : clamp(1 - (t - T_TOSSIN - .15) / .12)), 0, 0];
    let bp = BOX8.slice(), br = [0, 0, 0], bs = 1; DG.root.visible = t > T_DG0 && t < T_TOSSIN + .15; setFace(DG, 'grin');
    if (t < T_DGAT) { const u = clamp((t - T_DG0) / (T_DGAT - T_DG0)); DG.root.p = lerp3(SW, BF8, u); DG.root.r = [0, yawOf(SW, BF8), 0]; wheelRun(DG, t, 70, .5); }
    else if (t < T_BACK) { const u = clamp((t - T_DGAT) / (T_BACK - T_DGAT)); DG.root.p = BF8.slice(); DG.root.r = [0, Math.PI, 0]; pose_(DG, { sL: [-lerp(1.4, 3.0, u), 0, .3], sR: [-lerp(1.4, 3.0, u), 0, -.3] }); DG.body.r = [.4 * (1 - u), 0, 0]; bp = [BOX8[0], lerp(0, HOLD_Y - .1, eio(u)), lerp(BOX8[2], BF8[2] - .1, eio(u))]; setFace(DG, u < .5 ? 'squint' : 'grin'); }
    else if (t < T_BACKAT) { const u = clamp((t - T_BACK) / (T_BACKAT - T_BACK)); DG.root.p = lerp3(BF8, SW, u); DG.root.r = [0, yawOf(BF8, SW), 0]; wheelRun(DG, t, 70, .3); pose_(DG, { sL: [-3.0, 0, .3], sR: [-3.0, 0, -.3] }); bp = A3(DG.root.p, [0, HOLD_Y - .1, 0]); }
    else if (t < T_TOSSIN) { const u = clamp((t - T_TOSS) / (T_TOSSIN - T_TOSS)); DG.root.p = SW.slice(); DG.root.r = [0, 0, 0]; pose_(DG, { sL: [-lerp(3.0, 1.5, u), 0, .3], sR: [-lerp(3.0, 1.5, u), 0, -.3] }); const hw = HATCHW(); bp = lerp3(A3(SW, [0, HOLD_Y - .1, 0]), [hw[0], hw[1] - .7, hw[2] + .3], eio(u)); bp[1] += Math.sin(u * Math.PI) * .6; bs = lerp(1, .55, u); br = [0, 0, u * 1.5]; }
    else { const u = clamp((t - T_TOSSIN) / .15); DG.root.p = lerp3(SW, [HATCHW()[0], 1.4, HATCHW()[2] + .2], u); DG.root.r = [1.4 * u, 0, 0]; pose_(DG, { sL: [-3.0, 0, .3], sR: [-3.0, 0, -.3] }); bs = 0; }
    if (bs > 0 && t < T_TOSSIN) { setBox(bp, br, bs); TAPE.visible = LABEL.visible = true; } else PB.visible = false; }
  if (i === 10) { HATCH.r = [0, 0, 0];
    if (t < T_RET) { setVan(vanGo(t, T_GO), 0, Math.sin(t * 30) * .01); burst(T_GO, t, [VXP - 2.7, .3, TZ], [.55, .55, .58], 0, 8, .8, .6); }
    else { const u = clamp((t - T_RET) / (T_STOP - T_RET)); const x = lerp(-11, VXP, eout(u)); const s = clamp((t - T_SPIN) / .65); const yaw = 6.283 * eio(s); const roll = -.45 * Math.sin(s * Math.PI);
      setVan(x, yaw, roll, 0); if (t > T_SPIN) { for (let k = 0; k < 16; k++) { const q = puffs[k]; const d = ((t - T_SPIN) * 1.4 + hsh(k, 1)) % 1; q.visible = t < T_STOP + .6; const a = hsh(k, 2) * 6.283; q.p = [x - 1.5 + Math.cos(a) * 2 * d, .3 + d * 1.3, TZ + Math.sin(a) * 1.8 * d]; q.mat.c = [.75, .75, .78]; q.mat.a = .6 * (1 - d); q.s = [.5 + d, .5 + d, .5 + d]; } } } }
  if (i === 11) { setVan(VXP); HATCH.r = [1.4 * eout(clamp((t - P[11]) / .12)), 0, 0]; DG.root.visible = true; DG.root.p = SW11.slice(); DG.root.r = [0, Math.PI, 0]; setFace(DG, 'grin'); TAPE.visible = LABEL.visible = true;
    if (t < T_THROW) { const u = clamp((t - P[11]) / (T_THROW - P[11])); DG.body.r = [-.45 * eio(u), 0, 0]; pose_(DG, { sL: [-3.0 - .4 * u, 0, .3], sR: [-3.0 - .4 * u, 0, -.3] }); late.push(() => setBox(wp(DG.body, [0, HOLD_Y - .1 - .7, -.1]), [0, 0, 0])); }
    else if (t < T_IMP) { const u = clamp((t - T_THROW) / (T_IMP - T_THROW)); DG.body.r = [.45 * Math.exp(-(t - T_THROW) * 4), 0, 0]; pose_(DG, { sL: [-1.4, 0, .3], sR: [-1.4, 0, -.3] }); const p = boxFly(u); setBox(A3(p, [0, -BX, 0]), [u * 7, u * 2, u * 1.5]); }
    else { const d = t - T_IMP; const u = clamp(d / .35); const y = Math.max(0, lerp(BIMP[1] - BX, 0, u * u)) + (d > .35 ? Math.abs(Math.sin((d - .35) * 14)) * .15 * Math.exp(-(d - .35) * 6) : 0); setBox([BOXD[0], y, lerp(BIMP[2], BOXD[2], eout(u))], [0, 0, 0], 1); PB.s = [1 + .25 * Math.exp(-d * 12), 1 - .2 * Math.exp(-d * 12), 1]; HDOOR.p = A3(HDOOR0, [0, 0, -.06 * Math.exp(-d * 9) * Math.cos(d * 50)]); HDOOR.r = [Math.sin(d * 40) * .04 * Math.exp(-d * 5), 0, 0]; burst(T_IMP, t, [-1.5, 1.2, -6.4], [.85, .8, .72], 0, 12, 1.0, 1.0); pose_(DG, { sR: [-2.8, 0, -.4], eR: [-.2, 0, 0] }); } }
  if (i === 12) { setBox(BOXD); TAPE.visible = LABEL.visible = true; BSTK.visible = t > T_SLAP; setVan(t < T_VAN3 ? VXP : vanGo(t, T_VAN3)); HATCH.r = [t < T_ZBAT ? 1.4 : 1.4 * clamp(1 - (t - T_ZBAT) / .1), 0, 0];
    if (t < T_ZAT) { DG.root.visible = true; const u = clamp((t - T_Z0) / (T_ZAT - T_Z0)); DG.root.p = lerp3(SW, BFRONT, u); DG.root.r = [0, Math.PI, 0]; wheelRun(DG, t, 80, .55); setFace(DG, 'grin'); }
    else if (t < T_ZB) { DG.root.visible = true; DG.root.p = BFRONT.slice(); DG.root.r = [0, Math.PI, 0]; PAD.visible = true; const sl = clamp((t - T_SLAP + .08) / .08); pose_(DG, { sR: [-lerp(.6, 1.5, sl), 0, -.1], eR: [-.1, 0, 0] }); setFace(DG, 'grin'); }
    else if (t < T_ZBAT) { DG.root.visible = true; const u = clamp((t - T_ZB) / (T_ZBAT - T_ZB)); DG.root.p = lerp3(BFRONT, SW, u); DG.root.r = [0, 0, 0]; wheelRun(DG, t, 80, .55); setFace(DG, 'grin'); }
    if (t > T_ZB) dustLine(t, BFRONT, SW, 0, 10, [.85, .8, .72], clamp(1 - (t - T_ZBAT) * 1.2)); }
  if (i === 13) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, DG, TH]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
