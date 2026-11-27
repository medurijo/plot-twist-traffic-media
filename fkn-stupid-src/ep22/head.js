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
