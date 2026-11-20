// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.whole + .4, T_SLAM, T_ROOF]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { comic(t, T_MW0 + .1, 1.4, 'VRRRRRRM', 540, 470, '#fff', -.06, 120); comic(t, WD.exactly + .1, 1.0, '1.000"', 540, 520, '#7cf08a', .05, 140);
  comic(t, WD.fucking1, 1.3, '+1 INCH', 540, 560, '#ff5a4a', -.06, 160); comic(t, T_LAUNCH + .05, .7, 'AAAAH!', 760, 420, '#fff', .1, 100); comic(t, P[5] + .2, 1.3, 'snip snip snip', 540, 520, '#fff', -.04, 80);
  comic(t, at(6, .45), .6, 'SKRRRT', 540, 1150, '#ffd23a', .06, 110); comic(t, T_CAP + .1, 1.0, 'BOING', 760, 520, '#fff', .1, 100); comic(t, WD.fucking2, 1.0, '+1 INCH', 540, 560, '#ff5a4a', .06, 160);
  comic(t, T_SLAM, .6, 'BZZZT!', 540, 560, '#ffd23a', -.05, 130); comic(t, T_ROOF, .7, 'CONVERTIBLE.', 540, 600, '#fff', .05, 95); comic(t, WD.whole + .3, 1.4, 'VRRRRRRRRRM', 540, 560, '#ffd23a', -.04, 110);
  comic(t, P[11] + .4, 1.6, '*birds chirping*', 540, 480, '#fff', -.05, 66); comic(t, T_GROW + .05, 1.2, '+1 INCH', 540, 560, '#ff5a4a', -.06, 170); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).map(s => ['cut', s.t]), ['creak', P[14] + .15], ['mower', T_MW0, T_MW1 - T_MW0], ['mower', P[4], pend(4) - P[4]], ['mower', P[9], pend(9) - P[9]], ['mower', P[10], pend(10) - P[10]], ['mower', at(8, .6), pend(8) - at(8, .6)],
  ['ding', WD.exactly + .1], ['snip', P[5] + .1, pend(5) - P[5] - .2], ['whoosh', WD.saw], ['sting', WD.fucking1], ['sting', WD.fucking2], ['scream', T_LAUNCH], ['whoosh', T_LAUNCH + .1], ['thud', T_LAUNCH + .75],
  ['dial', P[6] + .1], ['blabla', P[6] + .3], ['whoosh', at(6, .55)], ['crash', at(6, .55) + .35], ['siren', at(6, .45)], ['skid', at(6, .45) + .3], ['thud', T_DIVE + .45], ['boing', T_CAP + .1], ['punch', T_SLAM], ['run', T_SLAM + .3],
  ['launch', T_ROOF], ['crash', T_ROOF + .9], ['punch', WD.whole + .2], ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12]), ['calm', P[11]], ['birds', P[11] + .3], ['rain', P[12], P[14] - P[12]], ['stretch', T_GROW], ['boing', T_GROW + .15], ['thud', T_GROW + 1.05], ['doorbell', 1e9]];
window.renderAt = renderAt; window.ready = true;
