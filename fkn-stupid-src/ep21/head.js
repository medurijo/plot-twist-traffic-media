// =====================================================================
//  EP21 "THE STREET" — no parking on this street. So he removed the street.
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
lamp.p = [-4.6, 0, 1.4]; scene.children.forEach(n => { if (n.p && n.p[0] > 5.2 && n.p[0] < 8.7 && n.p[2] > -2.3 && n.p[2] < -1.5) n.p = [n.p[0] + 5.2, n.p[1], n.p[2]]; });
scene.children.forEach(n => { if (!n.p) return; const z = n.p[2]; if (Math.abs(z - 10.9) < .01 && n.children && n.children.length > 3) n.visible = false; if (z > 14.7 && z < 16.3 && n.p[1] > 3) n.visible = false; if (Math.abs(n.p[0] - 12) < .01 && n.s && Math.abs(n.s[0] - 2.6) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .01 && Math.abs(z - 6.3) < .01) n.visible = false; if (Math.abs(n.p[0] + 1.6) < .2 && Math.abs(z - 6.3) < .3) n.visible = false; });
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- road that can be rolled up ----------
const ROAD = scene.children.find(n => n.p && Math.abs(n.p[2] - 7) < .01 && Math.abs(n.p[1] + .12) < .01 && n.s && n.s[0] > 100);
const MARKS = scene.children.filter(n => n.p && Math.abs(n.p[2] - 7) < .01 && n.s && Math.abs(n.s[0] - 2.2) < .01);
scene.add(B('#7a5a3c', [0, -.16, 7], [160, .2, 10], { out: 0 })); for (let k = 0; k < 40; k++) scene.add(B(k % 2 ? '#6a4a30' : '#8a6a48', [-10 + hsh(k, 1) * 50, -.05, 2.5 + hsh(k, 2) * 9], [.3 + hsh(k, 3) * .5, .04, .2 + hsh(k, 4) * .4], { out: 0 }));
function setRoad(xr) { ROAD.p = [(-80 + xr) / 2, -.12, 7]; ROAD.s = [Math.max(.01, xr + 80), .2, 10]; MARKS.forEach(m => m.visible = m.p[0] + 1.1 < xr); }
const ROLLG = new Node(); ROLLG.add(new Node('cyl', { c: hex('#4a4854'), out: .01, spec: .15, rim: .15 }, [0, 0, 0], [4.6, 5, 4.6], [1.5708, 0, 0]));
for (const z of [-5.01, 5.01]) { ROLLG.add(new Node('cyl', { c: hex('#5a5864'), out: 0 }, [0, 0, z], [4.62, .02, 4.62], [1.5708, 0, 0])); for (let k = 1; k <= 5; k++) ROLLG.add(new Node('cyl', { c: hex(k % 2 ? '#3a3844' : '#e9e4d4'), out: 0 }, [0, 0, z * (1 + k * .0004)], [4.6 * (1 - k * .16), .02, 4.6 * (1 - k * .16)], [1.5708, 0, 0])); }
const RCUFF = new Node(); for (const z of [-1.6, 1.6]) RCUFF.add(new Node('cyl', { c: hex('#c8ccd6'), spec: 1, out: .01, rim: .4 }, [0, 0, z], [4.9, .18, 4.9], [1.5708, 0, 0])); for (let k = 0; k < 5; k++) RCUFF.add(B('#c8ccd6', [0, 2.45, -1.2 + k * .6], [.22, .18, .4], { spec: 1 }, [k % 2 ? 1.5708 : 0, 0, 0])); ROLLG.add(RCUFF);
ROLLG.p = [0, 2.3, 7]; scene.add(ROLLG);
function setRoll(xr, r) { ROLLG.visible = r > .05; const k = r / 2.3; ROLLG.s = [k, k, 1]; ROLLG.p = [xr - r, r - .02, 7]; }
const HCAR = car({ body: '#3f8f7a', stripe: '#f4f1e8' }); scene.add(HCAR.root); HCAR.root.children[1].visible = false; HCAR.l1.visible = HCAR.l2.visible = false;
HCAR.root.add(B('#1d1d22', [0, 1.05, .55], [.08, .08, .5], {}, [-.6, 0, 0])); const WHEEL = new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [0, 1.2, .35], [.42, .05, .42], [-.9, 0, 0]); HCAR.root.add(WHEEL);
HCAR.root.add(B('#2a2a30', [0, .9, -.6], [1.6, .12, 1.0])); HCAR.root.add(B('#2a2a30', [0, 1.2, -1.05], [1.6, .55, .14]));
const wheelRun = (h, t, sp = 40, lean = .5) => { const a = t * sp; h.lL.r = [-(a % 6.283), 0, -.1]; h.lR.r = [-((a + 3.14) % 6.283), 0, .1]; h.lL.k = h.lR.k = .3; h.sL.r = [Math.sin(a * .5) * 1.4, 0, .3]; h.sR.r = [-Math.sin(a * .5) * 1.4, 0, -.3]; h.eL.r = h.eR.r = [-1.2, 0, 0];
  h.body.p = [0, .35 + Math.abs(Math.sin(a)) * .08, 0]; h.body.r = [lean, 0, Math.sin(a * .5) * .06]; h.wob = .35; };
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [0, 0, .045], [.09, .06, .09], [1.5708, 0, 0])); cop.armR.end.add(DON);
const STRK = []; for (let k = 0; k < 40; k++) { const n = new Node('box', { c: [1, 1, 1], em: .7, a: .5, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.035, .035, .75]); n.visible = false; scene.add(n); STRK.push(n); }
function stream(t, o, d, len, n0, n1, rad = .5, sp = 1, al = .55) { d = norm(d); const p1 = norm(cross(d, [0, 1, 0])), p2 = cross(p1, d); const yaw = Math.atan2(d[0], d[2]), pit = -Math.asin(clamp(d[1], -1, 1));
  for (let k = n0; k < n1; k++) { const q = STRK[k]; const f = (t * 2.4 * sp + hsh(k, 1)) % 1; const a = hsh(k, 2) * 6.283, r = rad * (.25 + f) * hsh(k, 3);
    q.visible = true; q.p = [o[0] + d[0] * len * f + (p1[0] * Math.cos(a) + p2[0] * Math.sin(a)) * r, o[1] + d[1] * len * f + (p1[1] * Math.cos(a) + p2[1] * Math.sin(a)) * r, o[2] + d[2] * len * f + (p1[2] * Math.cos(a) + p2[2] * Math.sin(a)) * r];
    q.r = [pit, yaw, 0]; q.mat.a = al * Math.sin(f * Math.PI); q.s = [.035, .035, .5 + .6 * sp]; } }
// dust trail behind runners (uses puffs n0..n1)
function dust(t, pos, n0 = 8, n1 = 16, col = [.85, .8, .72]) { for (let k = n0; k < n1; k++) { const q = puffs[k]; const f = (t * 3 + hsh(k, 1)) % 1; q.visible = true; q.p = [pos[0] - f * 2.2, .15 + f * .6, pos[2] + (hsh(k, 2) - .5) * .6]; q.mat.c = col; q.mat.a = .55 * (1 - f); q.s = [.25, .25, .25].map(v => v * (1 + f * 2)); } }
