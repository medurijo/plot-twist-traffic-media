// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, TC + .25, T_IMP]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function sparkle(t, t0, dur, pts) { const d = t - t0; if (d < 0 || d > dur) return; pts.forEach(([x, y, s], k) => { const a = Math.sin(clamp(d / dur) * Math.PI) * (.6 + .4 * Math.sin(t * 20 + k)); const r = s * a; g2.save(); g2.translate(x, y); g2.rotate(t * 2 + k); g2.fillStyle = '#fffbe0'; g2.beginPath();
  for (let j = 0; j < 8; j++) { const rr = j % 2 ? r * .22 : r; const an = j * Math.PI / 4; g2.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g2.closePath(); g2.fill(); g2.restore(); }); }
function fx2d(t) { const tl = t >= P[14] ? t - T_END : t;
  comic(tl, -1.0, .8, 'polish polish', 330, 1080, '#fff', -.05, 70); comic(t, T_SPL0, .7, 'SPLAT', 760, 560, '#fff', .06, 140);
  comic(t, WD.tiny1, .9, 'tiny.', 760, 600, '#ffd23a', .05, 110); comic(t, P[1] + .6, .9, 'twitch', 300, 1080, '#fff', -.06, 80);
  comic(t, P[2] + .2, .9, 'SCRUB SCRUB', 540, 520, '#fff', -.04, 110); sparkle(t, WD.car2 + .45, 1.2, [[300, 820, 70], [700, 760, 90], [520, 980, 60], [820, 1000, 50]]); comic(t, WD.car2 + .5, .9, 'SHINY', 540, 560, '#ffd23a', .05, 140);
  comic(t, P[3] + .3, .8, 'coo', 760, 520, '#fff', .05, 90); comic(t, T_SPL3, .7, 'SPLAT', 540, 560, '#fff', -.05, 150); comic(t, WD.exact + .1, .9, 'SAME SPOT', 540, 1080, '#ff5a4a', .04, 110);
  comic(t, T_FUCK + .1, .9, 'PSSSHHHH', 540, 540, '#9ad4ff', -.05, 130); comic(t, WD.paint + .1, .9, 'NO PAINT', 540, 560, '#fff', .05, 120);
  comic(t, T_HIT, .7, 'WHOOSH', 540, 540, '#9ad4ff', -.05, 130); comic(t, T_HIT + .3, .7, 'aaaaa', 300, 1060, '#fff', .05, 90);
  for (let k = 0; k < 4; k++) comic(t, BUILD[k] + .02, .25, 'BANG', [300, 760, 400, 700][k], [560, 600, 1080, 1060][k], '#fff', (k % 2 ? .1 : -.1), 110); comic(t, BUILD[4] + .05, .6, 'TA-DA', 540, 560, '#ffd23a', .05, 130);
  comic(t, WD.landed + .2, .9, 'creak', 760, 560, '#fff', .05, 90); comic(t, WD.drop9 + .05, .7, 'plip', 760, 560, '#fff', -.05, 90); comic(t, WD.drop9 + .6, .7, 'CREEEAK', 540, 1080, '#fff', .05, 100); comic(t, TC + .25, .8, 'CRUNCH', 540, 560, '#ffd23a', -.05, 150);
  comic(t, P[10] + .2, .9, 'ZOOOOM', 540, 540, '#ffd23a', .05, 140); comic(t, T_TK + .25, .6, 'SLAP', 540, 1080, '#fff', -.05, 120);
  comic(t, WD.littering, 1.2, 'LITTERING', 540, 560, '#ff5a4a', -.05, 120); comic(t, WD.littering + .9, .7, 'plip', 760, 1060, '#fff', .05, 80);
  comic(t, T_IMP, .7, 'BOING', 540, 560, '#ffd23a', .05, 150); comic(t, T_IMP + .2, 1.0, 'NEW!', 760, 1080, '#fff', -.06, 110); sparkle(t, T_IMP + .1, 1.0, [[320, 900, 60], [760, 820, 80], [560, 1040, 50]]);
  if (t >= P[14] && t < NEND) comic(t, WD.bird14, .9, 'hehe', 760, 520, '#fff', .05, 90); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['coo', .3], ['splat', T_SPL0], ['flap', P[1] + .3], ['coo', P[1] + .5], ['run', P[2] + .1], ['run', P[2] + 1.1], ['squish', P[2] + .3], ['ding', WD.car2 + .45], ['pop', WD.car2 + .4],
  ['flap', P[3]], ['flap', P[3] + .6], ['coo', P[3] + .9], ['splat', T_SPL3], ['sting', WD.exact],
  ['pop', P[4] + .05], ['sting', WD.fucking1], ['spray', T_FUCK, 1.7], ['splash', T_FUCK + .1], ['skid', T_FUCK + .3], ['spin', T_FUCK + .4], ['thud', T_FUCK + 1.2],
  ['groan', WD.paint + .2], ['spray', T_HIT - .35, 1.0], ['scream', T_HIT + .05], ['whoosh', T_HIT], ['crash', T_HIT + .9],
  ...BUILD.slice(0, 4).map(b => ['hammer', b]), ['hammer', BUILD[0] + .12], ['hammer', BUILD[2] + .12], ['thud', BUILD[4] + .18], ['fanfare', BUILD[4] + .3],
  ['flap', P[8] + .1], ['flap', P[8] + .6], ['creak', WD.roof8 + .15], ['coo', WD.roof8 + .4], ['pop', WD.drop9], ['creak', WD.drop9 + .5], ['creak', TC - .5],
  ['sting', WD.fucking2], ['crash', TC + .25], ['rumble', TC + .25], ['scream', TC + .1], ['flap', TC + .3],
  ['run', P[10]], ['whoosh', P[10] + .2], ['whoosh', P[10] + .7], ['skid', WD.running + .3], ['chomp', P[10] + .4], ['flap', P[11]], ['marker', P[11] + .3], ['paper', T_TK - .05], ['slap', T_TK + .25],
  ['sting', WD.fucking3], ['blabla', WD.littering + .1], ['splat', WD.littering + 1.1],
  ['run', P[13] + .1], ['whoosh', P[13] + .15], ['launch', T_DROPC - .1], ['crash', T_IMP], ['boing', T_IMP + .05], ['ding', T_IMP + .2], ['fanfare', T_IMP + .3],
  ['engine', P[14], 1.2], ['skid', P[14] + .9], ['hop', P[14] + 1.25], ['coo', WD.bird14 + .1],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
