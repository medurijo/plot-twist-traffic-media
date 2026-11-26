// =====================================================================
//  EP20 "THE GARBAGE TRUCK" — missed it by one second. Chased it. Became a cube.
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
const DON = new Node(null, null, [0, -.12, .1]); DON.add(new Node('cyl', { c: hex('#c98a4a'), out: .01 }, [0, 0, 0], [.3, .09, .3], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#f08aa8'), out: 0 }, [0, 0, .03], [.27, .05, .27], [1.5708, 0, 0])); DON.add(new Node('cyl', { c: hex('#1b1b20'), out: 0 }, [0, 0, .045], [.09, .06, .09], [1.5708, 0, 0])); cop.armR.end.add(DON);
const FHAT = new Node(); FHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, 0, 0], [.4, .035, .4])); FHAT.add(new Node('cyl', { c: hex('#2a2a30'), out: 0, spec: .2, rim: .12 }, [0, .02, 0], [.22, .2, .22])); FHAT.add(new Node('cyl', { c: hex('#d8302c'), out: 0 }, [0, .03, 0], [.226, .045, .226])); FHAT.s = [1.6, 1.6, 1.6]; scene.add(FHAT);
const STRK = []; for (let k = 0; k < 40; k++) { const n = new Node('box', { c: [1, 1, 1], em: .7, a: .5, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.035, .035, .75]); n.visible = false; scene.add(n); STRK.push(n); }
function stream(t, o, d, len, n0, n1, rad = .5, sp = 1, al = .55) { d = norm(d); const p1 = norm(cross(d, [0, 1, 0])), p2 = cross(p1, d); const yaw = Math.atan2(d[0], d[2]), pit = -Math.asin(clamp(d[1], -1, 1));
  for (let k = n0; k < n1; k++) { const q = STRK[k]; const f = (t * 2.4 * sp + hsh(k, 1)) % 1; const a = hsh(k, 2) * 6.283, r = rad * (.25 + f) * hsh(k, 3);
    q.visible = true; q.p = [o[0] + d[0] * len * f + (p1[0] * Math.cos(a) + p2[0] * Math.sin(a)) * r, o[1] + d[1] * len * f + (p1[1] * Math.cos(a) + p2[1] * Math.sin(a)) * r, o[2] + d[2] * len * f + (p1[2] * Math.cos(a) + p2[2] * Math.sin(a)) * r];
    q.r = [pit, yaw, 0]; q.mat.a = al * Math.sin(f * Math.PI); q.s = [.035, .035, .5 + .6 * sp]; } }
// dust trail behind runners (uses puffs n0..n1)
function dust(t, pos, n0 = 8, n1 = 16, col = [.85, .8, .72]) { for (let k = n0; k < n1; k++) { const q = puffs[k]; const f = (t * 3 + hsh(k, 1)) % 1; q.visible = true; q.p = [pos[0] - f * 2.2, .15 + f * .6, pos[2] + (hsh(k, 2) - .5) * .6]; q.mat.c = col; q.mat.a = .55 * (1 - f); q.s = [.25, .25, .25].map(v => v * (1 + f * 2)); } }
function mkPigeon(o = {}) { const g = new Node(); const C = o.c || '#8d93a3', C2 = '#5d6372'; const add = (c, p, s, op) => { const n = B(c, p, s, Object.assign({ out: .006 }, op || {})); g.add(n); return n; };
  add(C, [0, 0, 0], [.17, .15, .27]); add('#a9aebb', [0, -.02, .08], [.15, .11, .14], { out: 0 }); const head = new Node(null, null, [0, .13, .12]); g.add(head);
  head.add(B(C2, [0, 0, 0], [.12, .12, .13], { out: .006 })); head.add(B('#e2b070', [0, -.02, .09], [.04, .035, .07], { out: 0 })); for (const s of [-1, 1]) { head.add(B('#ff8a2a', [s * .061, .02, .03], [.01, .035, .035], { out: 0 })); head.add(B('#1b1b20', [s * .066, .02, .035], [.01, .018, .018], { out: 0 })); }
  add('#5f9c84', [0, .07, .1], [.135, .05, .09], { out: 0, spec: .8 }); add('#8a6aa8', [0, .05, .08], [.14, .025, .08], { out: 0, spec: .8 }); add(C2, [0, .02, -.18], [.13, .03, .13]);
  const wl = new Node(null, null, [-.085, .05, 0]), wr = new Node(null, null, [.085, .05, 0]); wl.add(B('#7a8090', [-.07, 0, -.02], [.14, .02, .22], { out: .006 })); wr.add(B('#7a8090', [.07, 0, -.02], [.14, .02, .22], { out: .006 })); wl.add(B(C2, [-.07, .012, -.09], [.12, .01, .03], { out: 0 })); wr.add(B(C2, [.07, .012, -.09], [.12, .01, .03], { out: 0 })); g.add(wl, wr);
  for (const s of [-1, 1]) add('#e86a5a', [s * .04, -.11, .02], [.025, .08, .025], { out: 0 });
  const cuff = new Node(); for (const s of [-1, 1]) cuff.add(new Node('cyl', { c: hex('#d9dde6'), spec: 1, out: .004, rim: .4 }, [s * .04, -.12, .02], [.06, .015, .06])); cuff.add(B('#d9dde6', [0, -.12, .02], [.08, .01, .01], { spec: 1, out: 0 })); g.add(cuff); cuff.visible = false;
  g.s = [o.s || 1.6, o.s || 1.6, o.s || 1.6]; scene.add(g); return { g, wl, wr, head, cuff }; }
function setPig(q, pos, yaw, flap, t, pitch = 0, k = 0) { q.g.visible = true; q.g.p = pos; q.g.r = [pitch, yaw, 0]; const a = flap > 0 ? Math.sin(t * 34 + k) * 1.1 * flap + .2 : 0; q.wl.r = [0, 0, a]; q.wr.r = [0, 0, -a]; q.head.r = [flap > 0 ? 0 : Math.max(0, Math.sin(t * 7 + k * 1.7)) * .5, 0, 0]; }
