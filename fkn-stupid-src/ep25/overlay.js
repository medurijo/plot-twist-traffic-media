// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_BACK + .25]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const i = ph(t); const sir = i === 11 ? .12 : 0;
  if (sir) { const red = Math.sin(t * 18) > 0; const sg = g2.createRadialGradient(red ? 0 : W, 960, 200, red ? 0 : W, 960, 1300); sg.addColorStop(0, red ? `rgba(255,40,50,${sir})` : `rgba(50,90,255,${sir})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); g2.save(); g2.globalCompositeOperation = 'screen'; g2.fillStyle = sg; g2.fillRect(0, 0, W, H); g2.restore(); }
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function idcard(t, t0, dur) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .2)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(540, 760); g2.rotate(-.06 + Math.sin(d * 3) * .01); g2.scale(s, s);
  g2.fillStyle = 'rgba(0,0,0,.35)'; g2.fillRect(-372, -222, 760, 460); g2.fillStyle = '#e8eef6'; g2.fillRect(-380, -230, 760, 460); g2.fillStyle = '#3d5a80'; g2.fillRect(-380, -230, 760, 80);
  g2.fillStyle = '#fff'; g2.font = '900 52px "Inter Display"'; g2.textAlign = 'left'; g2.textBaseline = 'middle'; g2.fillText('ID CARD', -340, -190);
  g2.fillStyle = '#c9b89a'; g2.fillRect(-340, -120, 260, 310); g2.lineWidth = 7; g2.strokeStyle = '#1b1b20'; g2.lineJoin = 'round';
  g2.fillStyle = '#e2b23c'; g2.fillRect(-270, 110, 120, 80); g2.fillStyle = '#f0cdb4'; g2.beginPath(); g2.moveTo(-310, 110); g2.lineTo(-110, 110); g2.lineTo(-190, -80); g2.closePath(); g2.fill(); g2.stroke();
  g2.fillStyle = '#2a2a30'; g2.fillRect(-205, -120, 60, 44); g2.fillRect(-222, -82, 94, 10); g2.fillStyle = '#d8302c'; g2.fillRect(-205, -88, 60, 8);
  g2.lineWidth = 6; g2.fillStyle = '#fff'; g2.beginPath(); g2.arc(-232, 40, 22, 0, 6.283); g2.fill(); g2.stroke(); g2.beginPath(); g2.arc(-170, 30, 10, 0, 6.283); g2.fill(); g2.stroke(); g2.fillStyle = '#1b1b20'; g2.beginPath(); g2.arc(-232, 40, 6, 0, 6.283); g2.fill(); g2.beginPath(); g2.moveTo(-230, 85); g2.lineTo(-190, 82); g2.stroke();
  g2.fillStyle = '#1b1b20'; g2.font = '800 40px "Inter Display"'; g2.fillText('NAME:', -40, -90); g2.font = '900 56px "Inter Display"'; g2.fillText('HIM', -40, -30); g2.font = '800 36px "Inter Display"'; g2.fillText('HEAD: TRIANGLE', -40, 50); g2.fillText('HAT: YES', -40, 110); g2.fillText('IQ: 31', -40, 170);
  g2.save(); g2.translate(220, -40); g2.rotate(-.2); g2.strokeStyle = '#e3263a'; g2.lineWidth = 10; g2.strokeRect(-120, -50, 240, 100); g2.fillStyle = '#e3263a'; g2.font = '900 64px "Inter Display"'; g2.textAlign = 'center'; g2.fillText('HIS', 0, 4); g2.restore(); g2.restore(); }
function fx2d(t) { const tl = t >= P[14] ? t - T_END : t;
  comic(tl, -2.8, .7, 'la la la', 760, 1060, '#fff', .05, 80); comic(tl, T_HOLE + .25, .6, 'plop', 300, 1080, '#fff', -.05, 90); comic(t, WD.wallet0, .9, '!', 760, 560, '#ffd23a', .05, 170);
  comic(t, WD.keeping, .9, 'keep it?', 540, 560, '#fff', -.04, 100); comic(t, WD.fucking1, 1.0, 'THEFT?!', 540, 560, '#ff5a4a', .05, 140);
  comic(t, P[2] + .2, .9, 'ZOOOOM', 540, 540, '#ffd23a', .05, 140); comic(t, pend(2) - .3, .5, 'officer!', 760, 1060, '#fff', .05, 80);
  comic(t, WD.opened + .3, .7, 'click', 760, 560, '#fff', .05, 90); idcard(t, WD.own - .1, pend(4) - WD.own + .1);
  comic(t, P[5] + .2, 1.0, 'arrest me!', 540, 560, '#fff', -.04, 100); comic(t, T_CUF1 + .05, .5, 'CLICK', 300, 600, '#fff', .05, 100);
  comic(t, P[6] + .1, .9, 'hello police?', 540, 560, '#fff', .05, 90); comic(t, T_C2 - .4, .7, 'ZOOOOM', 540, 560, '#ffd23a', -.05, 130); comic(t, T_CUF2 + .02, .5, 'CLICK', 300, 1060, '#fff', -.05, 100);
  comic(t, WD.checked + .2, .8, 'hmm', 760, 560, '#fff', .05, 90); comic(t, WD.dollars, 1.0, '$10', 760, 1060, '#7fe08a', -.05, 150);
  comic(t, P[9] + .3, .9, 'whistle', 300, 1080, '#fff', -.05, 80);
  comic(t, T_CUF3 + .02, .6, 'CLICK', 540, 560, '#fff', .05, 120); comic(t, WD.drove + .2, 1.0, 'WEE-OO', 540, 540, '#ffd23a', -.05, 120);
  comic(t, T_BACK + .25, .6, 'BONK', 540, 560, '#fff', .05, 140); comic(t, WD.put, .9, 'mwah', 760, 560, '#fff', -.05, 90); comic(t, WD.pocket + .4, .7, 'pat pat', 300, 1080, '#fff', .05, 80);
  if (t >= P[14]) comic(t, WD.hole, .8, 'HOLE', 540, 560, '#ff5a4a', -.05, 130); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['step', .5], ['step', 1.05], ['yelp', WD.wallet0], ['step', WD.wallet0 + .4], ['step', WD.wallet0 + .7],
  ['pop', P[1] + .35], ['sting', WD.fucking1], ['scream', WD.fucking1 + .05],
  ['run', P[2] + .1], ['whoosh', P[2] + .15], ['whoosh', P[2] + .8], ['skid', pend(2) - .35], ['chomp', P[2] + .5],
  ['clank', WD.opened + .3], ['ding', WD.own], ['paper', WD.own - .1], ['blabla', P[5] + .2], ['cuff', T_CUF1],
  ['dial', P[6] + .1], ['ring', P[6] + .5], ['run', T_C2 - .9], ['whoosh', T_C2 - .6], ['whoosh', T_C2 - .2], ['skid', T_C2], ['pop', T_FREE], ['cuff', T_CUF2],
  ['clank', WD.checked], ['sting', WD.fucking2], ['ding', T_BILL + .1], ['paper', T_BILL + .05], ['slurp', P[9] + .3], ['paper', P[9] + .35],
  ['step', P[10] + .25], ['step', P[10] + .45], ['cuff', T_CUF3], ['siren', P[11]], ['engine', T_DRV, 1.6], ['skid', T_DRV + .3],
  ['whoosh', P[12] + .5], ['bonk', T_BACK + .25], ['dizzy', T_BACK + .3], ['pop', WD.put], ['knock', WD.pocket + .4], ['knock', WD.pocket + .6],
  ['step', P[14] + .3], ['step', P[14] + .7], ['step', P[14] + 1.1], ['sting', WD.fucking3], ['thud', T_HOLE + T_END + .3], ['step', P[14] + 1.5],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
