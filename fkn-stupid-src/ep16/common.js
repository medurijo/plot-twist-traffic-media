// EP3 'THE BOOMERANG' — shared helpers (from ep2)
const cyl = (c, p, s, o = {}, r) => new Node('cyl', Object.assign({ c: hex(c), out: 0, spec: .08, rim: .05 }, o), p, s, r);
const D_ = (par, c, p, s, o, r) => { const n = B(c, p, s, o); if (r) n.r = r; par.add(n); return n; };
const texC = (name, w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); R.tex(name, c); };
const J = [60, 0, -40], MG = [40, 0, -40];
const NP = [-2.55, .08, -4.5], HD = [-1.5, 0, -6.6];
// circle mesh for coin faces
(() => { const P = [0, 0, 0], N = [0, 0, 1], I = []; const n = 32; for (let k = 0; k <= n; k++) { const a = k / n * 6.283; P.push(Math.cos(a) * .5, Math.sin(a) * .5, 0); N.push(0, 0, 1); if (k) I.push(0, k, k + 1); } R.mesh('circ', { P, N, I }); })();
// ---------- gate in the fence + path ----------
scene.children.forEach(n => { if (n.p && Math.abs(n.p[2] + 2.6) < .05 && n.p[0] > -2.2 && n.p[0] < -.5 && n.s && n.s[1] > .8) n.visible = false; if (n.p && Math.abs(n.p[2] + 2.62) < .03 && n.s && n.s[0] > 30) n.visible = false; });
scene.add(B('#f1ece0', [-8.03, .6, -2.62], [10.35, .1, .04], { out: 0 })); scene.add(B('#f1ece0', [10.4, .6, -2.62], [20.8, .1, .04], { out: 0 }));
for (const x of [-2.85, 0]) scene.add(B('#e2d8c4', [x, .55, -2.6], [.2, 1.1, .2], { out: .02 }));
const gate = new Node(null, null, [0, 0, -2.6], null, [0, 1.9, 0]); for (let k = 0; k < 4; k++) gate.add(B('#f1ece0', [-.2 - k * .3, .45, 0], [.12, .82, .05], { out: .02 })); gate.add(B('#f1ece0', [-.65, .62, 0], [1.25, .08, .04], { out: 0 })); scene.add(gate);
for (let k = 0; k < 7; k++) scene.add(B('#b9b2a6', [-1.42 + Math.sin(k * 1.7) * .12, -.04, -3.0 - k * .58], [.7, .1, .42], { out: .01 }));
const HYD = scene.children.filter(n => n.p && Math.abs(n.p[0] + 5.6) < .01 && Math.abs(n.p[2] - 1.3) < .01);
const pcar = car({ body: '#f4f4f0', top: '#1d1d22', stripe: '#2b3a55' }); scene.add(pcar.root);
const jl = new Node(); jl.p = J.slice(); D_(jl, '#8a8e96', [0, -.05, 0], [7, .1, 6], { c2: hex('#7a7e86'), pat: 6, ps: 3 }); D_(jl, '#a8a9ae', [0, 1.8, -2.3], [7, 3.6, .2], { c2: hex('#97989e'), pat: 6, ps: 5 }); D_(jl, '#a8a9ae', [-2.6, 1.8, 0], [.2, 3.6, 6], { c2: hex('#97989e'), pat: 6, ps: 5 }); D_(jl, '#a8a9ae', [2.6, 1.8, 0], [.2, 3.6, 6], { c2: hex('#97989e'), pat: 6, ps: 5 });
D_(jl, '#6b6f78', [0, .42, -1.85], [3.6, .1, .7]); for (const x of [-1.6, 1.6]) D_(jl, '#4a4d55', [x, .2, -1.85], [.1, .4, .6]);
const jwin = new Node('box', { c: [1, .95, .8], em: .9, out: 0, noShadow: 1 }, [0, 2.7, -2.19], [1.0, .7, .04]); jl.add(jwin); for (let k = 0; k < 4; k++) D_(jl, '#2a2a30', [-.36 + k * .24, 2.7, -2.15], [.05, .72, .05], { out: 0 });
for (let k = 0; k < 18; k++) jl.add(cyl('#3a3842', [-2.5 + k * .3, 0, 2.2], [.07, 3.4, .07], { spec: .6 })); D_(jl, '#3a3842', [0, 3.3, 2.2], [5.4, .12, .12]); D_(jl, '#3a3842', [0, 1.6, 2.2], [5.4, .08, .08]);
D_(jl, '#f4f4f0', [2.05, .3, -1.6], [.5, .6, .6]); D_(jl, '#f4f4f0', [2.05, .75, -1.85], [.5, .5, .2]); jl.add(new Node('quad', { c: [1, 1, 1], tex: 'board', spec: 0, rim: 0, out: 0 }, [-1.6, 2.2, -2.15], [.9, .64, 1]));
for (let k = 0; k < 6; k++) D_(jl, '#2a2a30', [-2.49, 1.2 + k * .15, -1.2 + (k % 2) * .05], [.02, .05, .5], { out: 0 }); scene.add(jl);
const puffs = []; for (let k = 0; k < 16; k++) { const n = new Node('box', { c: [.8, .76, .7], a: .7, out: 0, noShadow: 1, noRecv: 1 }, [0, 0, 0], [.12, .12, .12]); n.visible = false; scene.add(n); puffs.push(n); }
function burst(t0, t, pos, col, n0, n1, spread = 1, up = 1.6) { const d = t - t0; if (d < 0 || d > .7) return; for (let k = n0; k < n1; k++) { const q = puffs[k]; q.visible = true; const a = k * 2.399, r = (.2 + d * 2.0) * spread; q.p = [pos[0] + Math.cos(a) * r, pos[1] + d * up * (1 + hsh(k, 2)) - d * d * 3, pos[2] + Math.sin(a) * r]; q.mat.c = col; q.mat.a = .8 * (1 - d / .7); q.s = [.12, .12, .12].map(v => v * (1 + hsh(k, 3))); } }
