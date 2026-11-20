// ===================== LOOK UPGRADE: dawn, facades, fairy lights, fog, bloom =====================
texC('siding', 512, 340, (x, w, h) => { x.clearRect(0, 0, w, h); for (let y = 0; y < h; y += 17) { x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(0, y + 14, w, 3); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(0, y, w, 2); for (let k = 0; k < 3; k++) { x.fillStyle = `rgba(0,0,0,${.04 + hsh(y, k) * .05})`; x.fillRect(hsh(y, k + 5) * w, y + 2, 60 + hsh(y, k + 9) * 140, 11); } }
  for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(40,30,20,${hsh(k, 3) * .08})`; x.beginPath(); x.ellipse(hsh(k, 1) * w, h - hsh(k, 2) * 60, 30 + hsh(k, 4) * 60, 8 + hsh(k, 5) * 20, 0, 0, 6.283); x.fill(); } });
texC('brick', 512, 340, (x, w, h) => { x.clearRect(0, 0, w, h); const bh = 15, bw = 46; for (let r = 0; r * bh < h; r++) for (let c = -1; c * bw < w; c++) { const ox = (r % 2) * bw / 2 + c * bw; x.fillStyle = `rgba(${hsh(r, c) > .5 ? '255,255,255' : '0,0,0'},${.03 + hsh(r * 7, c) * .1})`; x.fillRect(ox + 2, r * bh + 2, bw - 4, bh - 4); }
  x.fillStyle = 'rgba(240,235,225,.38)'; for (let r = 0; r * bh < h; r++) { x.fillRect(0, r * bh, w, 2); for (let c = -1; c * bw < w; c++) x.fillRect((r % 2) * bw / 2 + c * bw, r * bh, 2, bh); } });
texC('stain', 256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); for (let k = 0; k < 30; k++) { x.fillStyle = `rgba(30,35,30,${hsh(k, 1) * .1})`; x.fillRect(hsh(k, 2) * w, 0, 4 + hsh(k, 3) * 14, hsh(k, 4) * h); } });
const HOUSES = scene.children.filter(n => n.p && Math.abs(n.p[2] + 9.5) < .01 && n.children.length > 3);
HOUSES.forEach((hn, k) => { const body = hn.children[0], roof = hn.children[1]; const tx = k % 3 === 1 ? 'brick' : 'siding';
  hn.add(new Node('quad', { c: body.mat.c.slice(), tex: tx, spec: 0, rim: 0, out: 0 }, [0, 2, 2.505], [6, 4, 1])); for (const sx of [-3.02, 3.02]) hn.add(B('#f4f1e8', [sx, 2, 2.47], [.14, 4, .14], { out: .01 }));
  hn.add(B('#f4f1e8', [0, .12, 2.5], [6.1, .24, .1], { out: 0 })); roof.mat.pat = 6; roof.mat.ps = 5; roof.mat.c2 = roof.mat.c.map(v => v * .78);
  const pl = new Node('box', { c: [1, .82, .5], em: 1, out: 0, noShadow: 1 }, [-2.25, 2.25, 2.62], [.16, .22, .12]); hn.add(pl); hn.add(B('#2a2a30', [-2.25, 2.42, 2.58], [.22, .06, .1], { out: 0 })); });
// fairy lights along the fence + hero's eaves
const FAIRY = []; const fairyCols = [[1, .55, .25], [1, .85, .4], [.5, .8, 1], [1, .45, .55]];
for (let k = 0; k < 70; k++) { const x = -13 + k * .5; if (x > -2.9 && x < .05) continue; const y = .66 - Math.abs(Math.sin(k * .5 * Math.PI / .95 * .5)) * .1; const n = new Node('box', { c: fairyCols[k % 4], em: 1, out: 0, noShadow: 1 }, [x, y, -2.56], [.07, .09, .07]); scene.add(n); FAIRY.push(n); }
for (let k = 0; k < 26; k++) { const x = -3 + k * .24; const n = new Node('box', { c: fairyCols[k % 4], em: 1, out: 0, noShadow: 1 }, [x, 3.98 - Math.abs(Math.sin(k * .55)) * .12, -6.86], [.08, .1, .08]); scene.add(n); FAIRY.push(n); }
// jail bricks + stains
jl.add(new Node('quad', { c: hex('#a8a9ae'), tex: 'brick', spec: 0, rim: 0, out: 0 }, [0, 1.8, -2.198], [7, 3.6, 1])); jl.add(new Node('quad', { c: [1, 1, 1], tex: 'stain', spec: 0, rim: 0, out: 0 }, [.9, 1.0, -2.19], [2, 2, 1]));
// bedroom lighting (ep7)
tod = function (t) { return { k: .42 }; };
lighting = function (t) { const k = .42; return { dir: [-.7, .55, .3], sun: [1.45, .95, .72], amb: [.72, .72, 1.0], bg: [.3, .3, .4], k, morning: false, center: A3(BR, [0, 0, 0]), size: 8, inside: true, fogC: [.96, .64, .55], fogD: [100, 200, 0] }; };
function lookUpdate(t, L) { const lit = L.k > .35; WINS.forEach((w, j) => { const on = lit && hsh(j, 4) > .3; w.mat.em = on ? .92 : 0; w.mat.c = on ? [1, .78 + hsh(j, 7) * .12, .42] : [.74, .85, .9]; });
  FAIRY.forEach((f, j) => f.mat.em = .7 + .3 * Math.sin(t * 3 + j * 1.7)); bulb.mat.em = 1; bulb.mat.c = [1, .88, .6]; }
// 2D bloom + grade
const BLM = document.createElement('canvas'); BLM.width = 270; BLM.height = 480; const bx = BLM.getContext('2d');
function grade(t, L) { bx.filter = 'brightness(1.05) contrast(2.4) saturate(1.5) blur(5px)'; bx.clearRect(0, 0, 270, 480); bx.drawImage(g2.canvas, 0, 0, 270, 480); bx.filter = 'none';
  g2.save(); g2.globalCompositeOperation = 'screen'; g2.globalAlpha = .36; g2.drawImage(BLM, 0, 0, W, H); g2.restore();
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(255,150,110,${.28 * (1 - L.k * .6)})`); gr.addColorStop(.55, 'rgba(255,190,140,.12)'); gr.addColorStop(1, 'rgba(60,70,140,.3)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  for (let k = 0; k < 60; k++) { g2.fillStyle = `rgba(255,${200 + hsh(k, 2) * 50},170,${.08 + .1 * Math.sin(t * 2 + k)})`; const x_ = (hsh(k, 1) * W + t * 12 * (hsh(k, 3) - .5)) % W, y_ = (hsh(k, 4) * H - t * 8) % H; g2.beginPath(); g2.arc((x_ + W) % W, (y_ + H) % H, 1.5 + hsh(k, 5) * 2.5, 0, 6.283); g2.fill(); } }
