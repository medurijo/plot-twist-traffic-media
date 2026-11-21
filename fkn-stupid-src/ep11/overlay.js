// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [T_EXP, T_CH1, T_EAT1 + .5, T_EAT2 + .45, T_EAT3 + .55, T_YES, T_BURP]) { const d = t - t0; if (d >= 0 && d < .3) return (1 - d / .3) * 22; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { comic(t, T_EXP + .05, 1.0, 'BEEP BEEP', 560, 560, '#ff4a3a', -.05, 110); comic(t, T_COIN + .45, .9, 'YUM.', 620, 600, '#9affb8', .06, 110);
  comic(t, WD.more - .05, 1.0, 'MORE.', 540, 540, '#ffd23a', -.05, 150); comic(t, T_CH1, 1.0, 'CHOMP!', 540, 540, '#fff', .05, 150); comic(t, T_SH + .7, .9, 'nom nom', 600, 600, '#fff', -.05, 100);
  comic(t, T_PCA + 1.4, .9, 'scribble scribble', 560, 560, '#fff', .05, 70); comic(t, T_EAT1 + .5, .9, 'GULP.', 540, 1080, '#fff', -.05, 150); comic(t, T_RUN + .1, .7, 'ZOOOOM!', 540, 540, '#ffb03a', .06, 150);
  comic(t, T_EAT2 + .45, .9, 'GULP.', 540, 1080, '#fff', .05, 150); comic(t, T_EAT3 + .55, 1.0, 'GUUULP!', 540, 1080, '#fff', -.06, 160); comic(t, WD.ninety, 1.2, 'PAID UNTIL 2090', 540, 560, '#9affb8', .04, 90);
  comic(t, T_YES, 1.2, 'SO PROUD!', 540, 540, '#7cf08a', -.05, 140); comic(t, T_BURP, 1.1, 'BUUUURP!', 540, 540, '#ffd23a', .06, 170); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).map(s => ['cut', s.t]), ['ding', T_EXP], ['ding', T_EXP + .3], ['clank', T_COIN + .4], ['chomp', T_COIN + .45], ['ding', T_COIN + .6], ['blabla', WD.more - .1], ['chomp', T_CH1], ['chomp', T_CH1 + .25], ['scream', T_WAL + .35],
  ['hop', T_SH], ['hop', T_SH + .2], ['chomp', T_SH + .5], ['chomp', T_SH + .85], ['siren', T_PCA - .4], ['skid', T_PCA + .35], ['step', T_PCA + .8], ['step', T_PCA + 1.1], ['marker', T_PCA + 1.4], ['whoosh', T_GRAB], ['scream', T_GRAB + .1], ['slurp', T_EAT1], ['chomp', T_EAT1 + .5], ['burp', T_EAT1 + .7],
  ['run', T_RUN], ['skid', T_RUN + .35], ['whoosh', T_GRAB2], ['scream', T_GRAB2 + .05], ['slurp', T_EAT2], ['chomp', T_EAT2 + .45], ['groan', T_LIFT], ['slurp', T_EAT3], ['crash', T_EAT3 + .55], ['chomp', T_EAT3 + .55],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12]), ['ding', WD.ninety], ['fanfare', T_YES], ['punch', T_YES], ['burp', T_BURP], ['boom', T_BURP], ['launch', T_BURP + .05], ['scream', T_BURP + .1], ['thud', T_BURP + .3], ['thud', T_BURP + .6], ['thud', T_BURP + .7],
  ['dizzy', T_BURP + .8], ['step', T_UP + T_END + .1], ['step', T_UP + T_END + .35], ['calm', 1e9], ['doorbell', 1e9]];
window.renderAt = renderAt; window.ready = true;
