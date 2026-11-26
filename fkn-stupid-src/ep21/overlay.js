// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_SLAP, T_FLAT]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const i = ph(t); const sir = t > 0 && i >= 6 && i <= 8 ? .14 : 0;
  if (sir) { const red = Math.sin(t * 18) > 0; const sg = g2.createRadialGradient(red ? 0 : W, 960, 200, red ? 0 : W, 960, 1300); sg.addColorStop(0, red ? `rgba(255,40,50,${sir})` : `rgba(50,90,255,${sir})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); g2.save(); g2.globalCompositeOperation = 'screen'; g2.fillStyle = sg; g2.fillRect(0, 0, W, H); g2.restore(); }
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { const tl = t >= P[15] ? t - T_END : t;
  comic(tl, -1.7, .7, 'click.', 760, 560, '#fff', .06, 95); comic(tl, T_SLAP, .6, 'SLAP', 540, 520, '#ffd23a', -.06, 140); comic(tl, T_SLAP + .55, .6, '$450', 760, 640, '#ff5a4a', .06, 90);
  comic(t, WD.no1, .9, 'NO PARKING', 540, 500, '#ff5a4a', -.05, 110); comic(t, WD.street1 + .2, .7, 'blah blah', 300, 1060, '#fff', .05, 80);
  comic(t, P[2] + .1, .7, 'ZOOM', 540, 500, '#fff', -.06, 130); comic(t, T_R0 + .05, .8, 'RRRRIP', 540, 500, '#ffd23a', .05, 130); comic(t, T_R0 + .7, .6, 'hop', 300, 1080, '#fff', -.06, 90);
  comic(t, WD.street3, .9, 'NO STREET', 540, 500, '#fff', -.05, 115); comic(t, WD.rule, .9, 'NO RULE', 540, 640, '#ffd23a', .05, 125);
  comic(t, P[4] + .15, .8, 'scribble scribble', 540, 500, '#fff', .04, 75); comic(t, T_SLAP2, .5, 'SLAP', 540, 520, '#ffd23a', -.06, 140); comic(t, WD.dirt, .8, 'DIRT?!', 540, 520, '#ff5a4a', -.06, 125);
  comic(t, T_KICK6, .5, 'YANK', 540, 500, '#fff', .06, 130); comic(t, T_OUT6 + .3, .8, 'HEEELP', 540, 1080, '#fff', -.05, 105);
  comic(t, T_PCS - .25, .6, 'SKRRRT', 540, 500, '#ffd23a', .05, 120); comic(t, T_KICK8, .5, 'YANK', 540, 500, '#fff', -.06, 130);
  comic(t, WD.huge, 1.0, 'HUGE', 540, 520, '#ffd23a', .05, 170); comic(t, WD.away, .9, 'bye!', 760, 620, '#fff', .06, 90);
  comic(t, P[11] + .05, .5, 'uh oh', 540, 520, '#fff', -.05, 110); comic(t, T_FLAT, .6, 'SQUISH', 540, 1080, '#ffd23a', .06, 135);
  comic(t, P[13] + .1, .9, 'flap flap', 540, 520, '#fff', -.05, 90); comic(t, T_POP, .6, 'POP POP POP', 540, 500, '#ffd23a', .05, 115); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['marker', -2.4 + T_END], ['ding', -1.7 + T_END], ['marker', -1.2 + T_END], ['marker', .1], ['marker', .5], ['slap', T_SLAP], ['paper', T_SLAP + .05], ['step', -2.2 + T_END], ['step', -1.7 + T_END], ['step', -1.2 + T_END],
  ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['blabla', WD.fucking1 + .1], ['blabla', WD.street1 + .2],
  ['run', P[2]], ['whoosh', P[2] + .1], ['rollr', T_R0, .9], ['rumble', T_R0], ['boing', T_R0 + .75], ['thud', T_R0 + 1.0],
  ['marker', P[4] + .1], ['marker', P[4] + .4], ['marker', P[4] + .7], ['slap', T_SLAP2], ['paper', T_SLAP2 + .05], ['paper', WD.dirt - .3],
  ['whoosh', T_KICK6], ['rollr', T_KICK6, .9], ['scream', T_OUT6 + .1], ['rollr', T_OUT6 + .1, .9],
  ['siren', T_PCA - .3], ['skid', T_PCS - .3], ['skid', T_PCS - .15], ['whoosh', T_PCS + .05], ['thud', T_PCS + .5], ['yelp', T_PCS + .45],
  ['whoosh', T_KICK8], ['rollr', T_KICK8, .9], ['rollr', T_OUT8, .9], ['scream', T_OUT8 + .1], ['boing', T_KICK8 + .3],
  ['stretch', T_HUGE], ['boom', T_HUGE + .1], ['rumble', WD.away - .2], ['rollr', WD.away, .9],
  ['skid', T_TURN], ['rumble', T_TURN + .2], ['run', T_TURN + .4], ['scream', WD.fucking3], ['squish', T_FLAT], ['crash', T_FLAT], ['boing', T_FLAT + .3],
  ['rollr', P[13], .9], ['paper', T_FLAT + .3], ['pop', T_POP], ['pop', T_POP + .07], ['pop', T_POP + .14], ['pop', T_POP + .21], ['pop', T_HPOP], ['run', T_POP + .6], ['siren', T_POP + 1.0], ['engine', T_POP + 1.0, 1.0],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
