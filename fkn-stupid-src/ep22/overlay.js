// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_SINK + .1, T_FALL + .3]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const i = ph(t); const sir = 0;
  if (sir) { const red = Math.sin(t * 14) > 0; const sg = g2.createRadialGradient(red ? 0 : W, 960, 200, red ? 0 : W, 960, 1300); sg.addColorStop(0, red ? `rgba(255,40,50,${sir})` : `rgba(50,90,255,${sir})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); g2.save(); g2.globalCompositeOperation = 'screen'; g2.fillStyle = sg; g2.fillRect(0, 0, W, H); g2.restore(); }
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { const tl = t >= P[15] ? t - T_END : t;
  comic(tl, P[15] - T_END + .6, .7, 'grab.', 760, 560, '#fff', .06, 95); comic(tl, .35, .8, 'dig dig', 540, 520, '#fff', -.05, 110);
  comic(t, WD.dirt1, .9, '???', 540, 520, '#ffd23a', .05, 140); comic(t, WD.dirt1 + .3, .9, 'hi', 760, 1060, '#fff', -.06, 80);
  comic(t, CY[1][1] + .1, .7, 'DIG DIG DIG', 540, 500, '#fff', .05, 105); comic(t, CY[1][2] + .2, .6, 'HUP', 540, 520, '#ffd23a', -.05, 130); comic(t, CY[1][3] + .1, .5, 'PLOP', 540, 1080, '#fff', .05, 120);
  comic(t, T_BOOST + .05, .8, 'BOING', 540, 520, '#ffd23a', -.06, 150);
  comic(t, WD.third, .7, '#3', 760, 560, '#fff', .06, 150); comic(t, WD.fourth, .6, '#4', 300, 560, '#fff', -.06, 150); comic(t, T_HIT + .35, .6, 'BONK', 760, 1060, '#ffd23a', .06, 120); comic(t, WD.fifth, .7, '#5', 760, 560, '#fff', .06, 150);
  comic(t, T_COPGATE - .1, .6, 'SKRRT', 540, 520, '#fff', .05, 120); comic(t, T_COPGATE + .3, .9, 'blah blah', 300, 1060, '#fff', -.05, 80);
  comic(t, T_FALL + .05, .7, 'WHOOOP', 540, 520, '#fff', -.05, 125); comic(t, WD.six, .9, 'HOLE #6', 540, 560, '#ffd23a', .05, 140);
  comic(t, WD.full - .1, .9, 'pat pat', 760, 1060, '#fff', .05, 90);
  comic(t, T_MT + .1, .9, 'RUMBLE', 540, 520, '#ffd23a', -.04, 130); comic(t, WD.fucking3 + .1, .8, 'DIG DIG DIG DIG', 540, 520, '#fff', .05, 90);
  comic(t, T_PUSH0, .5, 'HNNNG', 540, 520, '#fff', -.05, 125); comic(t, T_SINK + .1, .7, 'GLORP', 540, 560, '#ffd23a', .05, 140);
  comic(t, WD.perfect, .8, 'ahh.', 760, 600, '#fff', .05, 100); comic(t, T_POP, .6, 'POP', 540, 520, '#ffd23a', -.05, 150); comic(t, T_POP + .5, .6, 'ZOOM', 300, 1060, '#fff', .05, 110);
  comic(t, WD.tiny + .1, 1.1, '...', 760, 560, '#fff', .05, 130); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['step', P[15] + .5], ['clank', P[15] + .62], ['step', P[15] + 1.1], ['step', P[15] + 1.5], ['step', P[15] + 1.9], ['scoop', P[0] + .1, 6, .22],
  ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['pop', WD.dirt1 - .1], ['yelp', WD.dirt1 + .2],
  ...[1, 2, 3, 4].flatMap(k => [['whoosh', CY[k][0]], ['scoop', CY[k][1], Math.round((CY[k][2] - CY[k][1]) / .1), .1], ['whoosh', CY[k][2]], ['thud', CY[k][3] + .12], ['splat', CY[k][3] + .15]]),
  ['boing', T_BOOST], ['scream', T_BOOST + .1], ['bonk', T_HIT + .35], ['yelp', T_HIT + .38], ['thud', T_HIT + .7],
  ['run', T_COPRUN], ['skid', T_COPGATE - .1], ['blabla', T_COPGATE + .2], ['scream', T_FALL + .02], ['thud', T_FALL + .5], ['ding', T_FALL + 1.0], ['whoosh', T_LOOK],
  ['bonk', P[8] + .12], ['bonk', P[8] + .6], ['bonk', P[8] + 1.08], ['rumble', T_MT], ['boom', T_MT + .1], ['flap', P[9] + .5],
  ['whoosh', P[10]], ['scoop', T_GDIG, 26, .1], ['rumble', T_GDIG + .5], ['rumble', T_GDIG + 1.4], ['whoosh', P[11] + .02], ['groan', T_PUSH0], ['rumble', T_SLIDE], ['rumble', T_SLIDE + .5], ['crash', T_SINK + .1], ['boom', T_SINK + .1],
  ['birds', P[12] + .2], ['flap', WD.yard - .25], ['pop', T_POP], ['boing', T_POP + .1], ['run', T_POP + .45], ['flap', T_POP + .1], ['pop', T_POP + .05],
  ['calm', P[15]], ['calmend', NEND + .3],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
