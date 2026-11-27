// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, F11 + 1.0]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const i = ph(t); const sir = i === 13 ? .1 : 0;
  if (sir) { const red = Math.sin(t * 18) > 0; const sg = g2.createRadialGradient(red ? 0 : W, 960, 200, red ? 0 : W, 960, 1300); sg.addColorStop(0, red ? `rgba(255,40,50,${sir})` : `rgba(50,90,255,${sir})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); g2.save(); g2.globalCompositeOperation = 'screen'; g2.fillStyle = sg; g2.fillRect(0, 0, W, H); g2.restore(); }
  { const tl = t < 0 ? t + T_END : t; const fa = flashAmt(t) || flashAmt(t + T_END); if (fa > 0) { g2.fillStyle = `rgba(255,255,255,${fa * .9})`; g2.fillRect(0, 0, W, H); } }
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function photo(t, t0, dur, who) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .2)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(540, 820); g2.rotate(-.06 + Math.sin(d * 3) * .01); g2.scale(s, s);
  g2.fillStyle = 'rgba(0,0,0,.35)'; g2.fillRect(-352, -392, 720, 800); g2.fillStyle = '#fbfaf4'; g2.fillRect(-360, -400, 720, 800); const gr = g2.createLinearGradient(0, -360, 0, 240); gr.addColorStop(0, '#7a6ab8'); gr.addColorStop(1, '#f2a070'); g2.fillStyle = gr; g2.fillRect(-320, -360, 640, 600);
  g2.fillStyle = '#4a4854'; g2.fillRect(-320, 120, 640, 120); g2.fillStyle = '#e9e4d4'; g2.fillRect(-300, 175, 120, 10); g2.fillRect(-60, 175, 120, 10); g2.fillRect(180, 175, 120, 10);
  g2.lineWidth = 8; g2.strokeStyle = '#1b1b20'; g2.lineJoin = 'round';
  if (who === 'hero') { g2.fillStyle = '#3f8f7a'; g2.fillRect(-260, 20, 520, 130); g2.strokeRect(-260, 20, 520, 130); g2.fillStyle = '#1d1d22'; for (const x of [-170, 170]) { g2.beginPath(); g2.arc(x, 150, 48, 0, 6.283); g2.fill(); }
    g2.fillStyle = '#e2b23c'; g2.fillRect(-60, -110, 120, 140); g2.strokeRect(-60, -110, 120, 140); g2.beginPath(); g2.moveTo(60, -100); g2.lineTo(150, -260); g2.stroke(); g2.beginPath(); g2.moveTo(-60, -90); g2.lineTo(-100, -20); g2.stroke();
    g2.fillStyle = '#f0cdb4'; g2.beginPath(); g2.moveTo(-110, -110); g2.lineTo(110, -110); g2.lineTo(30, -310); g2.closePath(); g2.fill(); g2.stroke(); g2.fillStyle = '#2a2a30'; g2.fillRect(-10, -350, 70, 50); g2.fillRect(-30, -305, 110, 12); g2.fillStyle = '#d8302c'; g2.fillRect(-10, -312, 70, 9);
    g2.lineWidth = 7; g2.beginPath(); g2.moveTo(-50, -175); g2.quadraticCurveTo(-30, -160, -10, -175); g2.stroke(); g2.beginPath(); g2.moveTo(25, -185); g2.quadraticCurveTo(38, -175, 50, -185); g2.stroke(); g2.beginPath(); g2.arc(5, -140, 18, 0, Math.PI); g2.stroke(); }
  else { g2.fillStyle = '#3d5a80'; g2.fillRect(-60, -90, 120, 170); g2.strokeRect(-60, -90, 120, 170); g2.beginPath(); g2.moveTo(-60, -70); g2.lineTo(-190, -10); g2.moveTo(60, -70); g2.lineTo(190, -130); g2.moveTo(-30, 80); g2.lineTo(-150, 200); g2.moveTo(30, 80); g2.lineTo(170, 160); g2.stroke();
    for (let k = 0; k < 6; k++) { g2.strokeStyle = 'rgba(255,255,255,.6)'; g2.beginPath(); g2.moveTo(-320, -200 + k * 60); g2.lineTo(-200, -200 + k * 60); g2.stroke(); } g2.strokeStyle = '#1b1b20';
    g2.fillStyle = '#d9a987'; g2.fillRect(-150, -270, 300, 180); g2.strokeRect(-150, -270, 300, 180); g2.fillStyle = '#2b3a55'; g2.fillRect(-160, -300, 320, 50); g2.fillStyle = '#fff'; for (const [x, r] of [[-80, 38], [70, 50]]) { g2.beginPath(); g2.arc(x, -190, r, 0, 6.283); g2.fill(); g2.stroke(); g2.fillStyle = '#1b1b20'; g2.beginPath(); g2.arc(x, -190, 7, 0, 6.283); g2.fill(); g2.fillStyle = '#fff'; }
    g2.fillStyle = '#c98a4a'; g2.beginPath(); g2.arc(200, -140, 36, 0, 6.283); g2.fill(); g2.stroke(); g2.fillStyle = '#f08aa8'; g2.beginPath(); g2.arc(200, -140, 26, 0, 6.283); g2.fill(); }
  g2.save(); g2.translate(170, 300); g2.rotate(-.12); g2.strokeStyle = '#e3263a'; g2.lineWidth = 10; g2.strokeRect(-150, -55, 300, 110); g2.fillStyle = '#e3263a'; g2.font = '900 80px "Inter Display"'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(who === 'hero' ? '31 MPH' : '97 MPH', 0, 4); g2.restore();
  g2.fillStyle = '#1b1b20'; g2.font = '800 40px "Inter Display"'; g2.textAlign = 'left'; g2.fillText(who === 'hero' ? 'IMG_0001.JPG' : 'IMG_0007.JPG', -320, 320); g2.restore(); }
function fx2d(t) { const tl = t >= P[14] ? t - T_END : t;
  comic(tl, -1.6, .8, 'vroom', 300, 1060, '#fff', -.05, 90); comic(t, F0 + .02, .5, 'FLASH', 540, 500, '#fff', .05, 160);
  comic(t, WD.one1, 1.0, '31', 760, 600, '#ff5a4a', .06, 170); comic(t, WD.one1 + .3, .9, 'in a 30', 760, 760, '#fff', -.05, 80);
  comic(t, WD.photo2, .9, 'photo shoot?', 540, 520, '#ffd23a', -.05, 100); comic(t, WD.shoot + .2, .8, 'mwah', 760, 1060, '#fff', .06, 90);
  comic(t, P[3] + .1, .7, 'BEEP BEEP', 540, 520, '#fff', .05, 110); comic(t, F3, .6, 'FLASH', 540, 500, '#fff', -.05, 160);
  photo(t, P[4] + .05, pend(4) - P[4] - .05, 'hero'); comic(t, WD.blinked, .8, 'BLINKED', 540, 1580, '#ff5a4a', -.04, 120);
  comic(t, P[5] + .1, .8, 'EYES OPEN', 540, 520, '#ffd23a', .05, 110); comic(t, F5, .5, 'FLASH', 540, 500, '#fff', -.05, 160);
  comic(t, F6, .5, 'FLASH', 540, 500, '#fff', .05, 160); comic(t, F7, .6, 'FLASH', 540, 500, '#fff', -.05, 160); comic(t, F8, .6, 'FLASH', 540, 500, '#fff', .05, 160);
  comic(t, P[9] + .4, .9, 'nom nom', 300, 1060, '#fff', -.05, 85); comic(t, WD.way, .9, 'ZOOOOM', 540, 520, '#ffd23a', .05, 140);
  comic(t, F11, .6, 'FLASH', 540, 500, '#fff', -.05, 160); comic(t, F11 + .35, .6, 'MY EYES', 540, 1080, '#fff', .05, 110); comic(t, F11 + 1.0, .6, 'CRASH', 540, 560, '#ffd23a', -.05, 140);
  photo(t, P[12] + .05, pend(12) - P[12] - .05, 'cop'); comic(t, WD.ticket + .4, .7, 'slap', 760, 1580, '#fff', .05, 100);
  comic(t, F13a, .5, 'FLASH', 540, 500, '#fff', .05, 160); comic(t, F13b, .5, 'FLASH', 540, 500, '#fff', -.05, 160); comic(t, WD.every, 1.0, 'MON TUE WED...', 540, 680, '#ffd23a', -.04, 85); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['engine', P[14] + .1, 1.6], ['engine', .02, 1.0], ...FLASHES.map(f => ['camera', f]), ['skid', F0 + .2],
  ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['ding', WD.one1 + .1], ['yelp', WD.shoot + .2],
  ['engine', P[3], 1.0], ['skid', P[3] + .9], ['engine', P[3] + 1.0, 1.0], ['skid', F3 + .3], ['paper', P[4] + .05], ['scream', WD.fucking1 + .05],
  ['engine', P[5], 1.2], ['engine', P[6], .6], ['engine', P[7], 1.4], ['skid', P[7] + .05], ['run', P[8] + .1], ['whoosh', F8 - .1],
  ['step', P[9] + .5], ['step', P[9] + .9], ['step', P[9] + 1.3], ['chomp', P[9] + .6], ['run', P[10]], ['whoosh', P[10] + .2], ['whoosh', P[10] + .8], ['run', P[10] + 1.0],
  ['scream', F11 + .3], ['whoosh', F11 + .3], ['crash', F11 + 1.0], ['dizzy', F11 + 1.2], ['paper', P[12] + .1], ['slap', P[12] + 1.0],
  ['siren', P[13]], ['engine', P[13], 2.2],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
