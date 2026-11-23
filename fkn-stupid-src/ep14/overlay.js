// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2 + .05, T_JON, T_BIG, WD.fucking3, T_WIN, T_GAS]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { comic(t, T_LAND + .05, .9, 'tap.', 540, 560, '#fff', -.05, 90); comic(t, T_GONE - .1, .8, 'ZOOM', 540, 520, '#ffd23a', .06, 130);
  comic(t, T_BL, 1.0, 'FWOOOSH', 540, 480, '#fff', -.06, 120); comic(t, T_PAP, .8, 'pat.', 760, 560, '#fff', .08, 90); comic(t, T_LB, .9, 'FWOOOSH', 540, 480, '#fff', .06, 120);
  comic(t, T_HAT + .1, 1.0, 'BYE.', 360, 420, '#fff', -.1, 110); comic(t, T_BIGP + .05, .7, 'KA-CHUNK', 540, 500, '#ffd23a', -.05, 115); comic(t, T_BIG, 1.0, 'WHOOOOOM', 540, 480, '#fff', .05, 130);
  comic(t, T_WIN, .8, 'CRASH!', 760, 640, '#ff5a4a', .1, 120); comic(t, T_JON, 1.3, 'VRAAAAAAAH', 540, 470, '#ffd23a', -.05, 125); comic(t, WD.donut + .05, 1.0, 'nom.', 640, 560, '#fff', .06, 100);
  comic(t, T_MB, .6, 'CHOMP', 540, 520, '#ffd23a', -.06, 120); comic(t, T_OFF, .8, 'FWIP!', 540, 480, '#fff', .05, 120); comic(t, P[11] + .3, 1.5, 'EXACTLY THE MIDDLE', 540, 470, '#fff', -.04, 70);
  comic(t, WD.ran + .05, .6, 'putt... putt...', 540, 600, '#fff', .04, 80); comic(t, T_UP, .8, 'FWIP', 540, 460, '#ffd23a', -.05, 120); comic(t, P[13] + .15, 1.5, '*crickets*', 540, 480, '#fff', -.04, 70); comic(t, T_PLOP, .8, 'plop.', 540, 560, '#fff', .05, 95); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]), ['pop', T_LAND], ['run', P[1] + .05], ['whoosh', P[1] + .05], ['slam', T_GONE], ['clank', T_GONE + .15], ['slam', T_BACK - .02], ['whoosh', T_BACK],
  ['blower', T_BACK + .25, P[3] + .3 - T_BACK - .25, 1.0], ['whoosh', T_BL], ['paper', T_PAP], ['launch', T_NJ], ['thud', T_NB], ['blower', T_NB, T_BIG + .3 - T_NB, 1.18], ['whoosh', T_LB], ['boing', T_HAT], ['whoosh', T_HAT + .05],
  ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['clank', T_BIGP], ['pop', T_BIGP], ['blower', T_BIGP + .1, P[7] - T_BIGP - .1, .55], ['launch', T_BIG], ['scream', T_BIG + .3], ['glass', T_WIN], ['crash', T_WIN],
  ['rumble', T_JIN], ['skid', T_JIN + .4], ['jet', T_JON, T_GAS - T_JON], ['scream', T_JON + .25], ['whoosh', P[7] + .45], ['chomp', WD.donut], ['chomp', WD.donut + .4], ['pop', T_STAND - .1],
  ['blower', P[9], T_GAS - P[9], 1.0], ['pop', T_MB], ['blower', T_MB + .1, T_GAS - T_MB - .1, 1.45], ['whoosh', T_OFF], ['wind', P[11]], ['sputter', WD.ran], ['burp', T_GAS], ['launch', T_UP], ['crash', T_GAS + .45], ['thud', T_GAS + .6],
  ['calm', P[13]], ['crickets', P[13], T_END - P[13]], ['whoosh', T_PLOP - .3], ['pop', T_PLOP], ['doorbell', 1e9]];
window.renderAt = renderAt; window.ready = true;
