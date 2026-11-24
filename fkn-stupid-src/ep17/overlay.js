// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_HIT, T_PO]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const i = ph(t); const sir = t > 0 && i >= 8 && i <= 10 ? .14 : 0;
  if (sir) { const red = Math.sin(t * 14) > 0; const sg = g2.createRadialGradient(red ? 0 : W, 960, 200, red ? 0 : W, 960, 1300); sg.addColorStop(0, red ? `rgba(255,40,50,${sir})` : `rgba(50,90,255,${sir})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); g2.save(); g2.globalCompositeOperation = 'screen'; g2.fillStyle = sg; g2.fillRect(0, 0, W, H); g2.restore(); }
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { comic(t, T_SIT + .6, .9, 'munch.', 760, 560, '#fff', .06, 90); comic(t, T_PL + .3, .8, 'coo.', 760, 600, '#fff', -.05, 90); comic(t, T_STEAL + .1, .7, 'SNATCH', 540, 520, '#ffd23a', -.06, 120);
  comic(t, WD.fry, .9, 'coo coo', 640, 560, '#fff', .06, 95); comic(t, T_GULP, .8, 'GULP', 540, 520, '#fff', -.05, 120); comic(t, T_HIT, .5, 'FWUMP', 540, 1080, '#ffd23a', .05, 115);
  comic(t, WD.called, .6, 'ring ring', 540, 520, '#fff', -.04, 85); comic(t, T_LAWON, .9, 'objection.', 700, 700, '#fff', .06, 80); comic(t, T_GRAB + .05, .5, 'CLICK', 540, 1080, '#fff', -.05, 105);
  comic(t, P[5] + .6, 1.3, 'FLAP FLAP FLAP', 540, 470, '#fff', -.04, 90); comic(t, T_ZIP0 + .1, .6, 'click', 300, 1080, '#fff', -.1, 80); comic(t, T_ZIP0 + .5, .6, 'click', 780, 1100, '#fff', .1, 80); comic(t, T_ZIP0 + .9, .6, 'click', 420, 1120, '#fff', -.08, 80);
  comic(t, T_STUFF0 + .1, 1.0, 'SQUISH', 540, 500, '#ffd23a', .05, 120); comic(t, T_PO - .25, .8, 'WEE-OOO', 540, 480, '#ff5a4a', -.05, 115); comic(t, T_COPAT, .5, 'SKRT', 540, 520, '#fff', .06, 110);
  comic(t, T_DOOR + .1, .7, 'BONK', 540, 520, '#ffd23a', -.05, 125); comic(t, T_BURST + .05, 1.4, 'FLAPAPAPAPAP', 540, 470, '#fff', .04, 100); comic(t, P[11] + .3, 1.0, 'HELP', 760, 520, '#fff', -.08, 100);
  comic(t, P[13] + .6, 1.3, '*sigh*', 540, 520, '#fff', -.04, 90); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['step', .05], ['chomp', T_SIT + .1], ['chomp', T_SIT + 1.4], ['flap', T_PL], ['coo', T_PL + .35], ['flap', T_STEAL], ['whoosh', T_STEAL + .05], ['flap', T_SNATCH], ['coo', WD.fry - .05], ['step', P[14] - T_END + T_END + .1], ['chomp', P[14] + 1.3],
  ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['gulp', T_GULP], ['whoosh', T_DIVE], ['crash', T_HIT], ['flap', T_HIT + .02], ['cuff', T_UP + .1], ['coo', T_UP + .3],
  ['ring', WD.called], ['flap', T_LAWIN + .2], ['coo', T_LAWON], ['cuff', T_GRAB], ['paper', T_GRAB + .05], ['flock', P[5] + .1, 2.2], ['coo', P[5] + 1.4], ['coo', P[5] + 1.7],
  ...Array.from({ length: 14 }, (_, k) => ['cuff', T_ZIP0 + k * .115]), ['run', T_ZIP0], ['whoosh', T_ZIP0 + .1], ['whoosh', T_ZIP0 + .8], ['boing', T_ZIP1],
  ['step', P[7] + .1], ['squish', T_STUFF0 + .1], ['squish', T_STUFF0 + .4], ['coo', T_STUFF0 + .5], ['squish', T_STUFF0 + .7], ['whoosh', T_IN], ['engine', T_GOC, P[8] + .5 - T_GOC],
  ['siren', P[8] - .1], ['skid', T_PO - .3], ['run', T_COPOUT], ['skid', T_COPAT - .05], ['blabla', T_COPAT + .3],
  ['creak', T_DOOR], ['bonk', T_DOOR + .1], ['thud', T_DOOR + .4], ['flock', T_BURST, 3.2], ['burst', T_BURST], ['flap', T_BURST + .02], ['scream', T_BURST + .15],
  ['flock', P[11], P[13] - P[11]], ['scream', P[11] + .3], ['yelp', P[11] + .9], ['siren', P[12]], ['calm', P[13]], ['birds', P[13] + .4], ['calmend', P[14]],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
