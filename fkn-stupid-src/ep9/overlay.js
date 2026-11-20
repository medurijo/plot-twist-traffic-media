// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [T_SPIN, T_BOOM, T_FTIGN, T_YES, T_IGN]) { const d = t - t0; if (d >= 0 && d < .3) return (1 - d / .3) * 22; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { comic(t, T_SPIN, .9, 'AAAAAH!', 540, 520, '#fff', -.06, 150); comic(t, WD.this + .05, 1.3, 'THIS BIG.', 540, 520, '#fff', .05, 120); comic(t, WD.big + .2, 1.0, '(0.4 cm)', 540, 660, '#ffd23a', -.05, 70);
  comic(t, T_IGN, .9, 'FWOOOSH', 540, 520, '#ffb03a', -.05, 130); comic(t, at(3, .25), 1.0, 'bye.', 700, 760, '#fff', .08, 80); comic(t, T_BOOM, 1.0, 'KA-BOOM!', 540, 540, '#ffb03a', -.06, 160);
  comic(t, T_HOP + .3, .7, 'oof.', 600, 900, '#fff', .1, 80); comic(t, at(6, .2), 1.0, 'hi :)', 700, 620, '#fff', .08, 90); comic(t, T_FTIGN, .9, 'FWOOOSH', 540, 520, '#ffb03a', .05, 130);
  comic(t, WD.hat + .1, 1.0, 'hi :)', 640, 560, '#fff', -.06, 90); comic(t, T_HATIGN + .1, 1.1, 'AAAAAAAAH!', 540, 520, '#fff', .05, 120); comic(t, T_YES, 1.3, 'YESSSS!', 540, 520, '#7cf08a', -.05, 150);
  comic(t, T_POP, .8, 'POP!', 540, 560, '#fff', .06, 140); comic(t, WD.perfect + .1, 1.1, 'hi :)', 620, 620, '#fff', .07, 80); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).map(s => ['cut', s.t]), ['creak', P[14] - T_END + T_END + .35], ['pop', T_DROP + .3], ['scream', T_SPIN], ['whoosh', T_SPIN], ['ding', WD.this], ['fire', T_IGN, pend(2) - T_IGN], ['burst', T_IGN], ['fire', P[3], pend(11) - P[3], .35],
  ['run', P[3] + .2], ['burst', P[4] + .2], ['fire', P[4], pend(4) - P[4], .8], ['crash', T_BOOM], ['burst', T_BOOM], ['thud', T_BOOM + .9], ['siren', T_FTA - .4], ['skid', T_FTA + .3], ['thud', T_HOP + .45], ['pop', at(6, .25)],
  ['burst', T_FTIGN], ['fire', T_FTIGN, pend(7) - T_FTIGN, .8], ['run', T_FTIGN + .2], ['siren', T_PCA - .4], ['skid', T_PCA + .3], ['step', T_PCA + .7], ['step', T_PCA + 1.0], ['pop', WD.hat + .1], ['burst', T_HATIGN], ['scream', T_HATIGN + .05], ['run', T_HATIGN + .2], ['boing', T_JUMP],
  ['fanfare', T_YES], ['punch', T_YES], ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12]), ['calm', P[12]], ['pop', T_POP], ['ding', T_POP + .2], ['birds', P[12] + .4], ['step', P[13] + .3], ['step', P[13] + .7], ['step', P[13] + 1.1], ['doorbell', 1e9]];
window.renderAt = renderAt; window.ready = true;
