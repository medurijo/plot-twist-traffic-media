// =====================================================================
//  EP16 "THE ICE CREAM TRUCK" — it didn't stop. He chased it. Bought it. Drove past himself.
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
// cartoon wheel-legs (legs spin full circles), arms pumping
const wheelRun = (h, t, sp = 40, lean = .5) => { const a = t * sp; h.lL.r = [-(a % 6.283), 0, -.1]; h.lR.r = [-((a + 3.14) % 6.283), 0, .1]; h.lL.k = h.lR.k = .3; h.sL.r = [Math.sin(a * .5) * 1.4, 0, .3]; h.sR.r = [-Math.sin(a * .5) * 1.4, 0, -.3]; h.eL.r = h.eR.r = [-1.2, 0, 0];
  h.body.p = [0, .35 + Math.abs(Math.sin(a)) * .08, 0]; h.body.r = [lean, 0, Math.sin(a * .5) * .06]; h.wob = .35; };
// ---------- scenery: move lamp + bins/mailbox, hide parked cars/poles/crosswalk/manhole ----------
lamp.p = [19.5, 0, 1.4]; scene.children.forEach(n => { if (n.p && n.p[0] > 5.2 && n.p[0] < 8.7 && n.p[2] > -2.3 && n.p[2] < -1.5) n.p = [n.p[0] + 5.2, n.p[1], n.p[2]]; });
scene.children.forEach(n => { if (!n.p) return; const z = n.p[2]; if (Math.abs(z - 10.9) < .01 && n.children && n.children.length > 3) n.visible = false; if (z > 14.7 && z < 16.3 && n.p[1] > 3) n.visible = false; if (Math.abs(n.p[0] - 12) < .01 && n.s && Math.abs(n.s[0] - 2.6) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .2 && Math.abs(z - 6.3) < .3) n.visible = false; });
// extend the street: more houses, fence, trees, bushes on both ends
for (const k of [-7, -6, -5, 5, 6]) { const x = k * 8.2 + (k % 2) * .8, c = HC[(k + 14) % 7]; const h = new Node(); h.p = [x, 0, -9.5]; h.add(B(c, [0, 2, 0], [6, 4, 5], { out: .004 })); h.add(new Node('box', M(k % 2 ? '#8a4a3c' : '#5d6b7a', { out: 0 }), [0, 4, 0], [6.4, 3.4, 3.6], [Math.PI / 4, 0, 0]));
  h.add(B('#6b4a36', [-1.5, 1.05, 2.52], [1.1, 2.1, .06], { out: .01 })); for (const wx of [.6, 2.1]) { const w = B('#bcd9e6', [wx, 2.3, 2.52], [1, 1.1, .06], { out: .03 }); WINS.push(w); h.add(w); h.add(B('#f4f1e8', [wx, 2.3, 2.56], [.06, 1.1, .02], { out: 0 })); h.add(B('#f4f1e8', [wx, 1.7, 2.6], [1.2, .08, .14], { out: 0 })); } h.add(B('#9a6a52', [1.9, 5.6, -.6], [.7, 1.6, .7], { out: .01 })); h.add(B('#cfc8ba', [-1.5, .08, 2.8], [1.5, .16, .5], { out: 0 })); scene.add(h);
  const h2 = new Node(); h2.p = [x + 3, 0, 21]; h2.add(B(HC[(k + 18) % 7], [0, 2, 0], [6, 4, 5], { out: .004 })); h2.add(new Node('box', M('#8a4a3c'), [0, 4, 0], [6.4, 3.4, 3.6], [Math.PI / 4, 0, 0])); scene.add(h2);
  scene.add(B(k % 2 ? '#4f8f4c' : '#5fa257', [x + .9, .4, -3.5], [1.7, .8, .9], { out: .01 })); }
for (let k = -70; k <= 52; k++) { const x = k * .95 + 3.8; if (x >= -13.4 && x <= 21) continue; scene.add(B('#f1ece0', [x, .45, -2.6], [.14, .9, .06], { out: .02 })); }
for (const [a, b] of [[-63, -13.3], [20.9, 53]]) for (const y of [.25, .6]) scene.add(B('#f1ece0', [(a + b) / 2, y, -2.62], [b - a, y > .5 ? .1 : .08, .04], { out: 0 }));
for (const k of [-8, -7, -6, 6]) { const x = k * 8.2 + 4.3, tr = new Node(); tr.p = [x, 0, -5 - (k % 2) * 1.2]; tr.add(B('#7a5238', [0, 1.1, 0], [.4, 2.2, .4], { out: .01 })); tr.add(B(k % 2 ? '#5c9a54' : '#6fae5e', [0, 3.2, 0], [2.3, 2.5, 2.3], { out: .008 })); tr.add(B('#7fbd68', [.3, 4.6, -.2], [1.4, 1.2, 1.4], { out: .008 })); scene.add(tr); }
scene.children.forEach(n => { if (n.p && Math.abs(n.p[0] + 5.6) < .01 && Math.abs(n.p[2] - 1.3) < .01) n.p = [-15.6, n.p[1], n.p[2]]; });
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- the ice cream truck (front = +x, sidewalk side = -z) ----------
const TZ = 3.7, HS = [-4, 0, 1.0], SPD = 5.2, TPASS = .95, TXS = 6.3;
const TXi = t => HS[0] + SPD * (t - TPASS);
const TC = '#f6eee4', PK = '#f08aa8', MN = '#7fd1c3';
texC('icsign', 512, 96, (x, w, h) => { x.fillStyle = '#f6eee4'; x.fillRect(0, 0, w, h); x.fillStyle = '#f08aa8'; x.fillRect(0, 0, w, 10); x.fillRect(0, h - 10, w, 10); x.font = '900 70px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 10; x.strokeStyle = '#7a2a4a'; x.strokeText('ICE CREAM', w / 2, h / 2 + 4); x.fillStyle = '#f08aa8'; x.fillText('ICE CREAM', w / 2, h / 2 + 4); });
texC('soldout', 256, 128, (x, w, h) => { x.fillStyle = '#e3263a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(8, 8, w - 16, h - 16); x.font = '900 58px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText('SOLD', w / 2, 40); x.fillText('OUT', w / 2, 92); });
texC('menu', 256, 256, (x, w, h) => { x.fillStyle = '#fff6e8'; x.fillRect(0, 0, w, h); const cols = ['#f08aa8', '#7fd1c3', '#ffd23a', '#c98a4a', '#b58af0', '#ff7a5a']; for (let k = 0; k < 6; k++) { const cx = 50 + (k % 3) * 78, cy = 70 + Math.floor(k / 3) * 110; x.fillStyle = '#d9a35a'; x.beginPath(); x.moveTo(cx - 18, cy); x.lineTo(cx + 18, cy); x.lineTo(cx, cy + 50); x.fill(); x.fillStyle = cols[k]; x.beginPath(); x.arc(cx, cy - 6, 22, 0, 6.283); x.fill(); x.fillStyle = '#1b1b20'; x.font = '800 22px "Inter Display"'; x.textAlign = 'center'; x.fillText('$' + (k + 2), cx, cy + 72); } });
const TRK = new Node(), TB = new Node(null, null, [1.9, 0, 0]); TRK.add(TB); scene.add(TRK);
const tb = (c, p, s, o, r) => { const n = B(c, p, s, o); if (r) n.r = r; TB.add(n); return n; };
tb('#3a3a40', [0, .62, 0], [5.4, .22, 1.9]);
// box (x -2.8..0.9), side wall with serving window on -z
tb(TC, [-.95, 2.075, 1.0], [3.7, 2.65, .1]); tb(TC, [-2.75, 2.075, 0], [.1, 2.65, 2.1]); tb(TC, [.85, 2.075, 0], [.1, 2.65, 2.1]); tb(TC, [-.95, 3.36, 0], [3.84, .12, 2.24]); tb('#8a6a5a', [-.95, .8, 0], [3.7, .1, 2.0]);
tb(TC, [-.95, 1.275, -1.0], [3.7, 1.05, .1]); tb(TC, [-.95, 3.125, -1.0], [3.7, .55, .1]); tb(TC, [-2.375, 2.325, -1.0], [.85, 1.05, .1]); tb(TC, [.425, 2.325, -1.0], [.95, 1.05, .1]);
tb('#5a3a48', [-.95, 2.1, .93], [3.6, 2.5, .04], { out: 0 }); tb('#c9e8f0', [-1.6, 1.3, .55], [1.4, 1.0, .7], { spec: .5 }); tb('#e8e6e0', [-.4, 1.3, .55], [.9, 1.0, .7]);
for (let k = 0; k < 4; k++) tb(['#f08aa8', '#ffd23a', '#7fd1c3', '#c98a4a'][k], [-2.0 + k * .32, 1.86, .5], [.24, .14, .4], { out: .01 });
tb('#d9d9d4', [-1.0, 1.82, -1.22], [2.0, .07, .36], { spec: .5 }); tb('#c8ccd6', [-1.95, 2.33, -1.08], [.06, 1.1, .06], { spec: .8 }); tb('#c8ccd6', [-.05, 2.33, -1.08], [.06, 1.1, .06], { spec: .8 });
for (const z of [-1.06, 1.06]) { tb(PK, [-.95, 1.0, z], [3.7, .26, .02], { out: 0 }); tb(MN, [-.95, 3.2, z], [3.7, .14, .02], { out: 0 }); for (let k = 0; k < 6; k++) tb(k % 2 ? PK : MN, [-2.55 + k * .62, .82, z * 1.002], [.3, .12, .02], { out: 0 }); }
TB.add(new Node('quad', { c: [1, 1, 1], tex: 'menu', spec: 0, rim: 0, out: 0 }, [-2.35, 2.3, -1.065], [.7, .9, 1], [0, Math.PI, 0]));
// roof sign + giant cone
tb('#e8e6e0', [-.95, 3.55, 0], [.1, .3, .1]); TB.add(new Node('quad', { c: [1, 1, 1], tex: 'icsign', spec: 0, rim: 0, out: 0 }, [-.95, 3.95, -.05], [3.2, .62, 1], [0, Math.PI, 0])); TB.add(new Node('quad', { c: [1, 1, 1], tex: 'icsign', spec: 0, rim: 0, out: 0 }, [-.95, 3.95, .05], [3.2, .62, 1])); tb('#e8e6e0', [-.95, 3.95, 0], [3.25, .66, .08]);
const CONEB = new Node(null, null, [-2.1, 3.42, 0]); TB.add(CONEB); for (let k = 0; k < 6; k++) CONEB.add(new Node('cyl', { c: hex(k % 2 ? '#d9a35a' : '#c98a4a'), out: .01, spec: .1 }, [0, .1 + k * .18, 0], [.2 + k * .1, .09, .2 + k * .1]));
CONEB.add(new Node('cyl', { c: hex(PK), out: .01, spec: .3, rim: .2 }, [0, 1.3, 0], [.95, .28, .95])); CONEB.add(new Node('cyl', { c: hex(PK), out: .01, spec: .3 }, [0, 1.6, 0], [.75, .2, .75])); CONEB.add(new Node('cyl', { c: hex('#fff6e8'), out: .01, spec: .3 }, [0, 1.82, 0], [.5, .14, .5])); CONEB.add(B('#e3263a', [0, 2.02, 0], [.18, .18, .18], { spec: .6 }));
for (let k = 0; k < 6; k++) CONEB.add(B(['#ffd23a', '#7fd1c3', '#b58af0'][k % 3], [Math.cos(k) * .38, 1.5, Math.sin(k) * .38], [.08, .04, .04], { out: 0 }, [0, k, 0]));
// cab (x .9..2.8)
tb('#3a3a40', [1.85, .8, 0], [1.9, .1, 2.0]); tb(TC, [2.45, 1.3, 0], [.7, 1.0, 2.1]); tb('#2a2a30', [2.05, 1.85, 0], [.15, .2, 1.9]); tb(TC, [1.85, 3.3, 0], [1.95, .12, 2.12]);
for (const z of [-1.0, 1.0]) tb(TC, [2.75, 2.55, z], [.1, 1.5, .1]); tb(TC, [1.55, 1.55, 1.0], [1.3, 1.5, .08]); tb(TC, [1.55, 1.35, -1.0], [1.3, 1.1, .08]); tb(PK, [1.55, 1.1, -1.05], [1.3, .2, .02], { out: 0 }); tb(PK, [1.55, 1.1, 1.05], [1.3, .2, .02], { out: 0 });
tb('#9fd0e8', [2.76, 2.55, 0], [.03, 1.4, 1.9], { a: .2, out: 0, noShadow: 1, spec: .9 });
tb('#d8302c', [1.25, 1.1, -.45], [.5, .12, .62]); tb('#d8302c', [.98, 1.5, -.45], [.1, .8, .62]);
TB.add(new Node('cyl', { c: hex('#2a2a30'), out: .01 }, [1.95, 2.05, -.45], [.42, .03, .42], [0, 0, 1.0]));
const BTN = B('#e3263a', [2.05, 2.0, .3], [.16, .1, .16], { em: .4 }); TB.add(BTN);
for (const z of [-.75, .75]) { tb('#fff4c0', [2.81, 1.5, z], [.03, .22, .32], { em: .8, out: 0 }); }
tb('#c8ccd6', [2.86, .75, 0], [.12, .22, 2.1], { spec: .8 }); tb('#c8ccd6', [-2.86, .75, 0], [.12, .22, 2.1], { spec: .8 });
TB.add(new Node('cyl', { c: hex('#8a8e96'), out: .01, spec: .6 }, [-2.95, .5, .7], [.14, .12, .14], [0, 0, 1.5708]));
const SPK = []; for (const z of [-.45, .45]) { const s = new Node(null, null, [1.8, 3.5, z]); s.add(new Node('cyl', { c: hex('#c8ccd6'), out: .01, spec: .8 }, [.2, 0, 0], [.42, .22, .42], [0, 0, -1.5708])); s.add(B('#2a2a30', [-.05, 0, 0], [.2, .22, .22])); TB.add(s); SPK.push(s); }
// wheels (spin about z)
const WHL = []; for (const x of [-1.9, 1.9]) for (const z of [-1.0, 1.0]) { const w = new Node(null, null, [x, .45, z]); w.add(new Node('cyl', { c: hex('#1d1d22'), out: .015 }, [0, 0, 0], [.9, .14, .9], [1.5708, 0, 0])); w.add(new Node('cyl', { c: hex('#c8ccd6'), out: 0, spec: .8 }, [0, 0, z * .15], [.45, .02, .45], [1.5708, 0, 0])); w.add(B('#8a8e96', [0, 0, z * .16], [.4, .06, .02], { out: 0 })); TB.add(w); WHL.push(w); }
// serving hatch (pivot at top of the window, swings out to -z)
const HATCH = new Node(null, null, [-1.0, 2.88, -1.07]); HATCH.add(B(PK, [0, -.53, 0], [1.95, 1.06, .05])); HATCH.add(B('#fff6e8', [0, -.53, -.03], [1.5, .4, .01], { out: 0 })); TB.add(HATCH);
const SOLD = new Node('quad', { c: [1, 1, 1], tex: 'soldout', spec: 0, rim: 0, out: 0 }, [-1.0, 2.15, -1.09], [1.0, .5, 1], [0, Math.PI, 0]); TB.add(SOLD);
function setTruck(cx, wheelie = 0, lift = 0, roll = 0) { TRK.visible = true; TRK.p = [cx - 1.9, lift, TZ]; TRK.r = [roll, 0, wheelie]; WHL.forEach(w => w.r = [0, 0, -cx / .45]); }
// ---------- people ----------
const hero2 = man({ id: 'hero', shape: 'tri', seed: 1, skin: SK.hero, shirt: '#e2b23c', stripe: '#b8862a', pants: '#5b6f8f', shoe: '#e9e4d4' }); TB.add(hero2.root);
const icm = man({ id: 'pilot', shape: 'disc', seed: 7, skin: '#e8b48f', shirt: '#f4f1e8', stripe: '#f6c6d6', pants: '#f4f1e8', shoe: '#1d1d22', cap: '#f4f1e8', capBadge: PK }); scene.add(icm.root);
// props in hands
const COIN = new Node('cyl', { c: hex('#f0c44a'), out: .01, spec: 1, rim: .4, em: .15 }, [0, -.1, .1], [.2, .02, .2], [1.5708, 0, 0]); hero.armR.end.add(COIN);
function mkCone(sc) { const n = new Node(); for (let k = 0; k < 4; k++) n.add(new Node('cyl', { c: hex(k % 2 ? '#d9a35a' : '#c98a4a'), out: .01 }, [0, -.3 + k * .1, 0], [(.06 + k * .05) * sc, .05, (.06 + k * .05) * sc])); n.add(new Node('cyl', { c: hex(PK), out: .01, spec: .3 }, [0, .12, 0], [.34 * sc, .12, .34 * sc])); n.add(new Node('cyl', { c: hex('#fff6e8'), out: .01, spec: .3 }, [0, .26, 0], [.24 * sc, .08, .24 * sc])); n.add(B('#e3263a', [0, .36, 0], [.07, .07, .07])); return n; }
const ICONE = mkCone(1.2); ICONE.p = [0, .05, .12]; icm.armR.end.add(ICONE);
const HCONE = mkCone(1.6); HCONE.p = [0, .1, .12]; hero.armR.end.add(HCONE);
const CASH = new Node(null, null, [-.12, -.12, .22]); CASH.add(B('#5aa05a', [0, 0, 0], [.7, .45, .45], { c2: hex('#4a904a'), pat: 5, ps: 12 })); CASH.add(B('#f4f1e8', [0, 0, 0], [.72, .47, .1], { out: 0 })); CASH.add(B('#f0c44a', [0, .24, 0], [.18, .02, .46], { out: 0 })); hero.armR.end.add(CASH);
const BAG = new Node(null, null, [0, -.35, .1]); BAG.add(B('#c9b07a', [0, 0, 0], [.55, .6, .45])); BAG.add(B('#2a2a30', [0, .05, .23], [.25, .25, .01], { out: 0 })); BAG.add(B('#9a8050', [0, .34, 0], [.2, .1, .2])); icm.armL.end.add(BAG);
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [0, 0, .045], [.09, .06, .09], [1.5708, 0, 0])); cop.armR.end.add(DON);
// flying / hopping hat (world copy)
const FHAT = new Node(); FHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, 0, 0], [.4, .035, .4])); FHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, .02, 0], [.22, .2, .22])); FHAT.add(new Node('cyl', { c: hex('#d8302c'), out: 0 }, [0, .03, 0], [.226, .045, .226])); FHAT.s = [1.6, 1.6, 1.6]; scene.add(FHAT);
// flying bills
const BILLS = []; for (let k = 0; k < 16; k++) { const n = B('#6ab86a', [0, 0, 0], [.34, .015, .17], { out: .004 }); n.visible = false; scene.add(n); BILLS.push(n); }
function bills(t0, t, o, dir, n0 = 0, n1 = 16, spr = 1) { const d = t - t0; if (d < 0 || d > 1.6) return; for (let k = n0; k < n1; k++) { const q = BILLS[k]; const s = .6 + hsh(k, 3); q.visible = true; q.p = [o[0] + dir[0] * d * s * 3 + (hsh(k, 1) - .5) * d * 3 * spr, o[1] + d * (2 + hsh(k, 2) * 2) - d * d * 2.4, o[2] + dir[2] * d * s * 3 + (hsh(k, 4) - .5) * d * 2 * spr]; q.r = [d * (6 + k), d * 3, d * (4 - k * .3)]; } }
// wind streaks (speed lines)
const STRK = []; for (let k = 0; k < 40; k++) { const n = new Node('box', { c: [1, 1, 1], em: .7, a: .5, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.035, .035, .75]); n.visible = false; scene.add(n); STRK.push(n); }
function stream(t, o, d, len, n0, n1, rad = .5, sp = 1, al = .55) { d = norm(d); const p1 = norm(cross(d, [0, 1, 0])), p2 = cross(p1, d); const yaw = Math.atan2(d[0], d[2]), pit = -Math.asin(clamp(d[1], -1, 1));
  for (let k = n0; k < n1; k++) { const q = STRK[k]; const f = (t * 2.4 * sp + hsh(k, 1)) % 1; const a = hsh(k, 2) * 6.283, r = rad * (.25 + f) * hsh(k, 3);
    q.visible = true; q.p = [o[0] + d[0] * len * f + (p1[0] * Math.cos(a) + p2[0] * Math.sin(a)) * r, o[1] + d[1] * len * f + (p1[1] * Math.cos(a) + p2[1] * Math.sin(a)) * r, o[2] + d[2] * len * f + (p1[2] * Math.cos(a) + p2[2] * Math.sin(a)) * r];
    q.r = [pit, yaw, 0]; q.mat.a = al * Math.sin(f * Math.PI); q.s = [.035, .035, .5 + .6 * sp]; } }
// dust trail behind runners (uses puffs n0..n1)
function dust(t, pos, n0 = 8, n1 = 16, col = [.85, .8, .72]) { for (let k = n0; k < n1; k++) { const q = puffs[k]; const f = (t * 3 + hsh(k, 1)) % 1; q.visible = true; q.p = [pos[0] - f * 2.2, .15 + f * .6, pos[2] + (hsh(k, 2) - .5) * .6]; q.mat.c = col; q.mat.a = .55 * (1 - f); q.s = [.25, .25, .25].map(v => v * (1 + f * 2)); } }
// ---------- poses ----------
const sitDrive = (m, t, steer = 0) => { m.body.p = [0, -.43, 0]; m.lL.r = [-1.5, 0, -.1]; m.lR.r = [-1.5, 0, .1]; m.lL.k = m.lR.k = 1.4; pose_(m, { sL: [-1.25, 0, .25 + steer], eL: [-.5, 0, 0], sR: [-1.25, 0, -.25 + steer], eR: [-.5, 0, 0] }); m.wob = .08; };
function driverHero2(t, face = 'neutral') { hero2.root.visible = true; hero2.root.p = [1.25, .64, -.45]; hero2.root.r = [0, Math.PI / 2, 0]; sitDrive(hero2, t, Math.sin(t * 2) * .08); hero2.head.r = [0, 0, 0]; setFace(hero2, face); }
const wave = (m, t, amp = 1) => { m.sR.r = [-2.75 + Math.sin(t * 13) * .25 * amp, 0, -.35 + Math.sin(t * 13) * .45 * amp]; m.eR.r = [-.3, 0, Math.sin(t * 13 + 1) * .5 * amp]; };
function heroWaver(t, tx, face) { const h = hero; h.root.p = HS.slice(); const look = yawOf(HS, [tx + 2.8, 0, TZ]); const by = lerp(-1.2, -.45, clamp((tx - HS[0] + 1) / 6)); h.root.r = [0, by, 0]; h.head.r = [0, clamp(look - by, -.5, .6), 0]; COIN.visible = true; return face; }
// ---------- times ----------
const T_GO = P[1] + .42, T_FAST = WD.fucking1 - .05, T_HOFF = WD.hat - .08, T_CJ = WD.cop + .02, T_CL = T_CJ + .42, T_STOP = WD.sign + .05, T_ARR = T_STOP + .35;
const T_KN = WD.knocked, T_OPEN = P[8] + .1, T_SOLD = WD.sold, T_WAL = P[9] + .15, T_CASH = WD.fucking2 - .03, T_LAUNCH = T_CASH + .35, T_DIVE = T_CASH + .7, T_HATON = P[10] + .75, T_COPB = P[10] + 1.15, T_BTN = WD.music - .12, T_DRIVE = WD.music + .3;
const HX1 = t => HS[0] + 11 * (t - T_GO);
const TX2 = t => t < T_FAST ? TXi(t) : TXi(T_FAST) + 5.2 * (t - T_FAST) + 13 * (t - T_FAST) ** 2;
const HX2 = t => t < T_FAST ? HX1(P[2]) + 5.6 * (t - P[2]) : HX1(P[2]) + 5.6 * (T_FAST - P[2]) + 3.5 * Math.min(t - T_FAST, 1.4) - 1.2 * Math.min(t - T_FAST, 1.4) ** 2;
const TX3 = t => -6 + 13 * (t - P[3]), HX3 = t => -24 + 22 * (t - P[3]);
const TX4 = t => -2 + 13 * (t - P[4]), TX5 = t => -8 + 13 * (t - P[5]), TX6 = t => -12 + 12 * (t - P[6]);
const TX7 = t => lerp(-1, TXS, eout(clamp((t - P[7]) / (T_STOP - P[7])))), HX7 = t => lerp(-6.5, TXS - 1.6, eout(clamp((t - P[7]) / (T_ARR - P[7]))));
const TX11 = t => t < T_DRIVE ? TXS : TXS + 6 * (t - T_DRIVE) ** 2;
const HAT0 = hero.hat.p.slice();
const HATX0 = TXS - 2.2 - (T_HATON - (P[10] - 1.0)) / .36 * 1.3;
// ---------- intro / loop: the truck passes the waving hero (the driver is... him) ----------
function intro(t) { const h = hero; const tx = TXi(t); setTruck(tx, 0, Math.abs(Math.sin(t * 9)) * .02); driverHero2(t, 'neutral'); let face = 'grin';
  heroWaver(t, tx, face); const dp = t - TPASS; wave(h, t, dp < .2 ? 1 : clamp(1 - (dp - .2) * 1.2)); h.wob = .15;
  if (dp > -.15) face = 'wide';
  if (dp > .45) { face = 'half'; pose_(h, { sR: [lerp(-2.75, -.3, clamp((dp - .45) * 1.4)), 0, -.25], eR: [-.4, 0, 0] }); }
  if (t > WD.stop0 - .05 && t < P[1]) { face = 'squint'; h.root.p[0] += Math.sin(t * 70) * .02; }
  return face; }
function hideAll() { for (const m of [hero, cop, hero2, icm]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice(); hero2.hat.visible = true;
  COIN.visible = HCONE.visible = CASH.visible = false; ICONE.visible = BAG.visible = false; DON.visible = false; FHAT.visible = false; FHAT.s = [1.6, 1.6, 1.6]; HATCH.r = [0, 0, 0]; SOLD.visible = false; TRK.visible = true; TRK.s = [1, 1, 1]; SPK.forEach(s => s.s = [1, 1, 1]); CONEB.r = [0, 0, 0]; BTN.p[1] = 2.0;
  BILLS.forEach(b => b.visible = false); STRK.forEach(s => s.visible = false); puffs.forEach(p => p.visible = false); pcar.root.visible = false; }
function hatHop(t, t0, x0, z, dir = 1) { // hat hops along the ground like a bunny
  FHAT.visible = true; const d = t - t0; if (d < 0) return false; const hp = .36, n = Math.floor(d / hp), f = (d % hp) / hp; const sq = f < .15 ? 1 - f * 2 : 1;
  FHAT.p = [x0 + dir * (n + eio(f)) * 1.3, Math.sin(f * Math.PI) * .75, z]; FHAT.s = [1.6 / Math.sqrt(sq), 1.6 * sq, 1.6 / Math.sqrt(sq)]; FHAT.r = [0, 0, -dir * Math.sin(f * Math.PI) * .4]; return true; }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  if (i === 0) face = intro(t);
  if (i === 1) { const tx = TXi(t); setTruck(tx, 0, Math.abs(Math.sin(t * 9)) * .02); h.root.r = [0, Math.PI / 2, 0]; face = 'squint';
    if (t < T_GO) { h.root.p = HS.slice(); const w = clamp((t - P[1]) / .15); h.root.r = [0, lerp(0, Math.PI / 2, w), 0]; wheelRun(h, t, 55, .55); h.body.p[1] = .05 + Math.abs(Math.sin(t * 50)) * .05; dust(t, A3(HS, [-.2, 0, 0]), 8, 16); h.root.p[0] -= .15 * w; }
    else { const x = HX1(t); h.root.p = [x, 0, lerp(1.0, 2.1, clamp((t - T_GO) / .3))]; runPose(h, t, 34); h.body.r = [.45, 0, 0]; h.wob = .45; dust(t, [x, 0, h.root.p[2]], 8, 16); late.push(() => stream(t, A3(h.root.p, [-.4, 1.5, 0]), [-1, 0, 0], 3, 0, 12, .7, 1.4, .5)); burst(T_GO, t, A3(HS, [0, .3, 0]), [.85, .8, .72], 0, 8, 1.1, 1.0); } }
  if (i === 2) { const tx = TX2(t), d = t - T_FAST; const wh = d > 0 ? Math.sin(clamp(d / .7) * Math.PI) * .32 : 0; setTruck(tx, wh, Math.abs(Math.sin(t * 9)) * .02); const x = HX2(t); h.root.p = [x, 0, 2.1]; h.root.r = [0, Math.PI / 2, 0];
    if (d < 0) { runPose(h, t, 34); h.body.r = [.45, 0, 0]; pose_(h, { sR: [-1.55, 0, -.1], eR: [-.1, 0, 0] }); face = 'grin'; dust(t, [x, 0, 2.1], 8, 16); }
    else { const s = clamp(d / .9); h.root.r = [0, Math.PI / 2 + eout(s) * 6.283, 0]; runPose(h, t, 34 * (1 - s * .7)); face = d < .3 ? 'wide' : 'dizzy'; h.wob = .6; burst(T_FAST + .05, t, [tx - 3.2, .5, TZ + .7], [.18, .18, .2], 0, 12, 1.2, .6);
      if (d > .9) { h.root.r = [0, Math.PI / 2, 0]; face = 'squint'; argue(h, t, .8, 3); h.root.p[1] = 0; } late.push(() => stream(t, [tx - 3, 1.2, TZ], [-1, 0, 0], 6, 0, 16, 1.2, 1.8, .6)); } }
  if (i === 3) { const tx = TX3(t), x = HX3(t); setTruck(tx, 0, Math.abs(Math.sin(t * 11)) * .03); h.root.p = [x, 0, 2.1]; h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 48, .7); face = 'squint'; dust(t, [x, 0, 2.1], 4, 16); late.push(() => stream(t, [x - .3, 1.6, 2.1], [-1, 0, 0], 4, 0, 20, .9, 2, .6)); }
  if (i === 4) { const tx = TX4(t), x = tx - 3.4; setTruck(tx, 0, Math.abs(Math.sin(t * 11)) * .03); h.root.p = [x, 0, 2.1]; h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 48, .7); face = 'squint'; dust(t, [x, 0, 2.1], 10, 16);
    const d = t - T_HOFF; if (d > 0) { const x0 = TX4(T_HOFF) - 3.2; if (d < .62) { const u = d / .62; FHAT.visible = true; FHAT.p = [x0 + 1.5 * u, 2.95 + Math.sin(u * Math.PI) * 1.5 - u * 2.9, 2.1 + u * .3]; FHAT.r = [u * 9, u * 3, u * 6]; } else { hatHop(t, T_HOFF + .62, x0 + 1.5, 2.4, 1); if (t - T_HOFF - .62 < .12) burst(T_HOFF + .62, t, [x0 + 1.5, .1, 2.4], [.8, .76, .7], 0, 6, .4, .8); } } }
  if (i >= 4 && i <= 9) hero.hat.visible = (i === 4 && t < T_HOFF);
  if (i === 5) { const tx = TX5(t), x = tx - 3.4; setTruck(tx, 0, Math.abs(Math.sin(t * 11)) * .03); h.root.p = [x, 0, 2.1]; h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 48, .7); face = 'squint'; dust(t, [x, 0, 2.1], 10, 16);
    cop.root.visible = true; DON.visible = true; const dc = t - T_CJ;
    if (dc < 0) { cop.root.p = [3.4, 0, -4.6]; cop.root.r = [0, .4, 0]; pose_(cop, { sR: [-.25, 0, .95], eR: [-.4, 0, 2.2] }); setFace(cop, 'half'); }
    else if (t < T_CL) { const u = dc / (T_CL - T_CJ); cop.root.p = [lerp(3.4, 3.8, u), Math.sin(u * Math.PI) * 2.2, lerp(-4.6, 1.5, u)]; cop.root.r = [lerp(0, .9, Math.sin(u * Math.PI)), lerp(.4, Math.PI / 2, u), 0]; pose_(cop, { sL: [-2.9, 0, .4], sR: [-2.9, 0, -.4] }); cop.lL.r = [-.6, 0, -.2]; cop.lR.r = [.4, 0, .2]; setFace(cop, 'wide'); cop.wob = .5; }
    else { const cx = 3.8 + 15 * (t - T_CL); cop.root.p = [cx, 0, 1.45]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 60, .6); pose_(cop, { sR: [-.4, 0, .6], eR: [-.4, 0, 2.0] }); setFace(cop, 'neutral'); burst(T_CL, t, [3.8, .2, 1.5], [.85, .8, .72], 0, 8, .9, 1.2); late.push(() => stream(t, [cx - .3, 1.4, 1.45], [-1, 0, 0], 4, 20, 34, .8, 2, .55)); } }
  if (i === 6) { const tx = TX6(t), x = tx - 3.4; setTruck(tx, 0, Math.abs(Math.sin(t * 11)) * .03); h.root.p = [x, 0, 2.1]; h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 48, .7); face = 'squint'; dust(t, [x, 0, 2.1], 10, 16);
    cop.root.visible = true; DON.visible = true; const dd = Math.max(0, t - P[6] - 1.05); const cx = x - 1.2 + 30 * dd * dd + 4 * dd; cop.root.p = [cx, 0, 1.0]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 60, .6); pose_(cop, { sR: [-.4, 0, .6], eR: [-.4, 0, 2.0] }); cop.head.r = [0, -.7, 0]; setFace(cop, Math.sin(t * 6) > .3 ? 'sip' : 'neutral'); late.push(() => stream(t, [cx - .3, 1.4, 1.0], [-1, 0, 0], 4, 20, 34, .8, 2, .55)); }
  if (i === 7) { const tx = TX7(t); const br = clamp((t - T_STOP + .25) / .25) * clamp((T_STOP + .4 - t) / .3); setTruck(tx, -br * .05, 0); const x = HX7(t); h.root.p = [x, 0, lerp(2.1, 1.7, clamp((t - P[7]) / .8))]; h.root.r = [0, Math.PI / 2, 0];
    if (t < T_ARR - .1) { runPose(h, t, 30); h.body.r = [.45, 0, 0]; face = 'squint'; dust(t, [x, 0, 2.0], 10, 16); }
    else if (t < T_ARR + .35) { h.body.r = [-.45, 0, 0]; pose_(h, { sL: [-.6, 0, .9], sR: [-.6, 0, -.9] }); h.lL.r = [-.7, 0, 0]; h.lR.r = [-.5, 0, 0]; face = 'wide'; burst(T_ARR - .1, t, [x + .4, .1, 1.8], [.85, .8, .72], 0, 8, .6, .8); h.wob = .4; }
    else { const tu = clamp((t - T_ARR - .35) / .25); h.root.r = [0, lerp(Math.PI / 2, .25, tu), 0]; face = 'neutral'; if (t > T_KN - .2) { pose_(h, { sR: [-1.75, 0, -.2], eR: [-.9, 0, 0] }); for (const k of [0, .16, .32]) { const dk = t - T_KN - k; if (dk > 0 && dk < .12) h.eR.r = [-.9 + Math.sin(dk / .12 * Math.PI) * .6, 0, 0]; } face = 'half'; } } }
  if (i >= 8 && i <= 11) setTruck(i === 11 ? TX11(t) : TXS);
  if (i === 8) { h.root.p = [TXS - 1.6, 0, 1.7]; h.root.r = [0, .25, 0]; const op = eout(clamp((t - T_OPEN) / .3)); HATCH.r = [op * 1.35, 0, 0]; face = 'half'; h.head.r = [-.15, 0, 0];
    icm.root.visible = true; ICONE.visible = true; icm.root.p = [TXS - 1.0, .8, TZ - .3]; icm.root.r = [0, Math.PI, 0]; icm.body.p = [0, -.7, 0]; pose_(icm, { sR: [-1.2, 0, .5], eR: [-1.6, 0, .4], sL: [-.4, 0, .2] }); const lk = Math.sin(t * 7); icm.head.r = [lk > .3 ? .2 : -.05, 0, 0]; setFace(icm, lk > .3 ? 'sip' : 'half');
    if (t > T_SOLD) { SOLD.visible = true; SOLD.p[1] = 2.15 + Math.max(0, .3 - (t - T_SOLD) * 3); setFace(icm, 'talk'); if (t > T_SOLD + .35) setFace(icm, lk > .3 ? 'sip' : 'half'); if (t > T_SOLD + .15) { h.root.r = [0, -2.3, 0]; face = 'worry'; h.head.r = [.1, 0, 0]; pose_(h, { sL: [-.2, 0, .5], sR: [-.2, 0, -.5] }); h.wob = .1; } } }
  if (i === 9) { HATCH.r = [1.35, 0, 0]; SOLD.visible = t < T_CASH + .1; h.root.p = [TXS - 1.6, 0, 1.7]; const d = t - T_CASH;
    icm.root.visible = true; ICONE.visible = true;
    if (t < T_WAL) { h.root.r = [0, -2.3, 0]; face = 'worry'; }
    else if (d < 0) { h.root.r = [0, -2.0, 0]; face = 'squint'; CASH.visible = true; CASH.s = [1, 1, 1].map(v => v * Math.max(.01, eback(clamp((t - T_WAL) / .25)))); pose_(h, { sR: [-1.2, 0, -.3], eR: [-1.0, 0, 0], sL: [-.3, 0, .3] }); h.body.r = [0, 0, Math.sin(t * 40) * .03]; }
    else if (t < T_DIVE) { h.root.r = [0, .15, 0]; CASH.visible = d < .2; CASH.s = [1.6, 1.6, 1.6]; pose_(h, { sR: [-2.2, 0, -.1], eR: [-.1, 0, 0], sL: [-2.0, 0, .2], eL: [-.2, 0, 0] }); face = 'scream'; h.body.r = [.25, 0, 0]; h.wob = .4; }
    if (d > 0) bills(T_CASH, t, [TXS - 1.0, 2.3, TZ - 1.0], [0, 0, 1], 0, 16, 1.4);
    if (t < T_LAUNCH) { icm.root.p = [TXS - 1.0, .8, TZ - .3]; icm.root.r = [0, Math.PI, 0]; icm.body.p = [0, -.7, 0]; pose_(icm, { sR: [-1.2, 0, .5], eR: [-1.6, 0, .4] }); setFace(icm, d > 0 ? 'wide' : 'half'); }
    else { const u = clamp((t - T_LAUNCH) / .7); BAG.visible = true; icm.root.p = [lerp(TXS - 1.0, TXS + 1.6, u), .8 + Math.sin(u * Math.PI) * 2.6 - u * .8, lerp(TZ - .3, -.6, u)]; icm.root.r = [u < 1 ? u * 6.283 : 0, Math.PI, 0]; pose_(icm, { sL: [-2.8, 0, .6], sR: [-2.8, 0, -.6] }); setFace(icm, u < 1 ? 'scream' : 'dizzy'); icm.wob = .6;
      if (u >= 1) { icm.root.p = [TXS + 1.6, 0, -.6]; icm.root.r = [0, -2.6, 0]; icm.body.p = [0, -.45, 0]; icm.lL.r = [-1.5, 0, -.3]; icm.lR.r = [-1.5, 0, .3]; burst(T_LAUNCH + .7, t, [TXS + 1.6, .2, -.6], [.85, .8, .72], 0, 8, .6, 1.0); } }
    if (t >= T_DIVE) { const u = clamp((t - T_DIVE) / .4); h.root.p = [TXS - lerp(1.6, 1.0, u), Math.sin(u * Math.PI * .8) * 2.0 + u * .3, lerp(1.7, TZ - .5, u)]; h.root.r = [lerp(0, 1.45, u), 0, 0]; pose_(h, { sL: [-2.9, 0, .3], sR: [-2.9, 0, -.3] }); face = 'scream'; if (u >= 1) { h.root.p = [TXS - 1.0, 2.0, TZ - 1.0]; h.root.r = [1.5, 0, 0]; h.lL.r = [Math.sin(t * 22) * .8, 0, -.2]; h.lR.r = [-Math.sin(t * 22) * .8, 0, .2]; h.wob = .6; } } }
  if (i === 10 || i === 11) { icm.root.visible = true; ICONE.visible = true; BAG.visible = true; icm.root.p = [TXS + 1.6, 0, -.6]; icm.root.r = [0, -2.6 + (i === 11 ? .5 : 0), 0]; icm.body.p = [0, -.45, 0]; icm.lL.r = [-1.5, 0, -.3]; icm.lR.r = [-1.5, 0, .3]; pose_(icm, { sR: [-1.2, 0, .4], eR: [-1.6, 0, .4] }); const lk = Math.sin(t * 6); icm.head.r = [lk > .3 ? .2 : 0, 0, 0]; setFace(icm, lk > .3 ? 'sip' : 'grin'); }
  if (i === 10) { HATCH.r = [1.35, 0, 0]; h.root.p = [TXS - 1.0, .8, TZ - .25]; h.root.r = [0, Math.PI, 0]; h.body.p = [0, -.85, 0]; HCONE.visible = true; pose_(h, { sR: [-1.7, 0, -1.25], eR: [-.7, 0, 0], sL: [-.5, 0, .3] }); face = 'grin'; h.wob = .12;
    const dh = t - T_HATON; if (dh < 0) { hero.hat.visible = false; hatHop(t, P[10] - 1.0, HATX0, .6, 1); } else if (dh < .25) { hero.hat.visible = false; FHAT.visible = true; const u = dh / .25; const hw = wp(hero.head, [.16, .95, 0]); FHAT.p = lerp3([TXS - 2.2, .2, .6], hw, u); FHAT.p[1] += Math.sin(u * Math.PI) * 1.2; FHAT.r = [0, u * 6.283, 0]; FHAT.s = [1, 1, 1]; }
    else { hero.hat.visible = true; if (dh < .4) { face = 'closed'; h.body.p[1] -= .1 * (1 - (dh - .25) / .15); } }
    // the cop sprints past again (he lapped the planet)
    const dc = t - T_COPB; if (dc > 0 && dc < 1.2) { cop.root.visible = true; DON.visible = true; const cx = -14 + 34 * dc; cop.root.p = [cx, 0, 6.2]; cop.root.r = [0, Math.PI / 2, 0]; wheelRun(cop, t, 60, .6); pose_(cop, { sR: [-.4, 0, .6], eR: [-.4, 0, 2.0] }); setFace(cop, 'neutral'); cop.head.r = [0, -.9, 0]; late.push(() => stream(t, [cx - .3, 1.4, 6.2], [-1, 0, 0], 4, 20, 34, .8, 2, .55)); } }
  if (i === 11) { HATCH.r = [1.35 * clamp(1 - (t - T_DRIVE) * 3), 0, 0]; h.root.visible = false; driverHero2(t, t > T_BTN ? 'grin' : 'grinup'); if (t > T_BTN - .25 && t < T_BTN + .1) pose_(hero2, { sR: [-1.5, 0, .5], eR: [-.2, 0, 0] });
    if (t > T_BTN) { BTN.p[1] = 1.96; const b = 1 + Math.abs(Math.sin(t * 16)) * .35; SPK.forEach(s => s.s = [b, b, b]); CONEB.r = [0, (t - T_BTN) * 5, 0]; TRK.s = [1, 1 + Math.abs(Math.sin(t * 8)) * .03, 1]; } }
  if (i === 12 || i === 13) { const tx = TXi(t - T_END); setTruck(tx, 0, Math.abs(Math.sin(t * 9)) * .02); face = heroWaver(t, tx, 'grin'); wave(hero, t, 1); hero.wob = .15;
    let df = 'neutral'; if (i === 13) { const d = t - WD.fucking3; df = d < -.1 ? 'neutral' : d < .9 ? 'scream' : d < 1.15 ? 'wide' : 'neutral'; } driverHero2(t, df);
    if (i === 13 && df === 'scream') { hero2.head.r = [0, -.35, Math.sin(t * 40) * .08]; hero2.body.r = [0, 0, Math.sin(t * 30) * .05]; } if (i === 12 && t > WD.waved) hero2.head.r = [0, -.2, 0]; }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); for (const m of [hero, cop, hero2, icm]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
