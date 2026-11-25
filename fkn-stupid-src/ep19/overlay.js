// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_CRASH, T_SEE6]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const i = ph(t); const sir = t > 0 && ((i === 10 && t > T_PC - .3) || i === 11 || i === 12 || i === 13) ? .12 : 0;
  if (sir) { const red = Math.sin(t * 14) > 0; const sg = g2.createRadialGradient(red ? 0 : W, 960, 200, red ? 0 : W, 960, 1300); sg.addColorStop(0, red ? `rgba(255,40,50,${sir})` : `rgba(50,90,255,${sir})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); g2.save(); g2.globalCompositeOperation = 'screen'; g2.fillStyle = sg; g2.fillRect(0, 0, W, H); g2.restore(); }
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function card(t, t0, dur, txt) { const d = t - t0; if (d < 0 || d > dur) return; const s = eout(clamp(d / .15)) * clamp((dur - d) / .15); g2.save(); g2.translate(540, 300); g2.rotate(-.03); g2.globalAlpha = s; g2.fillStyle = '#1b1b20'; g2.fillRect(-380, -70, 760, 140); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 8; g2.strokeRect(-380, -70, 760, 140);
  g2.fillStyle = '#ffd23a'; g2.font = '900 76px "Inter Display"'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(txt, 0, 4); g2.restore(); }
function fx2d(t) { comic(t, WD.gnome0 + .1, .8, 'stare.', 760, 560, '#fff', .06, 95); comic(t, WD.staring + .1, .9, '...', 540, 520, '#fff', -.04, 120);
  comic(t, WD.order, .8, 'OFFICIAL.', 540, 520, '#ffd23a', -.05, 110); comic(t, WD.feet, .9, '50 FT', 540, 520, '#ffd23a', .05, 130); comic(t, WD.minimum + .1, .8, 'minimum.', 760, 620, '#fff', -.05, 85);
  card(t, P[3], 1.0, 'NEXT MORNING'); card(t, P[6], 1.0, 'NEXT MORNING'); card(t, P[8], 1.0, 'NEXT MORNING'); card(t, P[14] - .05, 1.5, '6 MONTHS LATER');
  comic(t, P[3] + .1, .6, 'yawn', 760, 620, '#fff', .06, 85); comic(t, T_SPIT, .6, 'PFFFT', 540, 560, '#ffd23a', -.06, 125);
  comic(t, T_SPIN0 + .05, .6, 'HNNNG', 540, 520, '#fff', .05, 110); comic(t, T_THROW, .6, 'YEET', 540, 520, '#ffd23a', -.06, 130); comic(t, T_CRASH, .5, 'CRASH', 540, 1080, '#fff', .05, 125);
  comic(t, T_SEE6, .7, 'AAAH!', 540, 560, '#ffd23a', -.06, 130); comic(t, P[7] + .1, .7, 'dig dig dig', 540, 520, '#fff', .05, 95); comic(t, T_STONE + .3, 1.0, '*sniff*', 760, 1080, '#fff', -.05, 85);
  comic(t, T_SEE8 + .1, .8, '...', 760, 560, '#fff', .05, 120); comic(t, P[9] + .1, 1.1, 'HELLO 911?!', 540, 520, '#ffd23a', -.04, 105); comic(t, T_PC - .2, .6, 'SKRT', 300, 520, '#fff', .05, 100);
  comic(t, T_COPAT + .55, .7, 'GASP', 540, 1080, '#fff', -.05, 110); comic(t, T_CLICK, .5, 'CLICK', 540, 520, '#fff', -.05, 115); comic(t, P[12] + .9, .8, 'IT WAS HIM!', 540, 1100, '#fff', .05, 85);
  comic(t, P[13] + .3, 1.0, 'WEE-OOO', 540, 480, '#ff5a4a', -.05, 110); comic(t, T_OUT + .1, .6, 'YOINK', 540, 520, '#fff', .05, 110); comic(t, T_OUT + .5, .5, 'THUD', 540, 1080, '#ffd23a', -.05, 115);
  comic(t, P[15] + 1.4, .7, '...', 540, 520, '#fff', .03, 120); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['step', P[15] + .1], ['step', P[15] + .5], ['step', P[15] + .9], ['step', P[15] + 1.3], ['step', .15], ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['night', WD.gnome0], ['night', WD.staring],
  ['step', P[1] + .2], ['step', P[1] + .5], ['paper', T_RO], ['slap', T_RO + .15], ['tape', T_TAPE0], ['ding', T_TAPE1],
  ['crow', P[3]], ['crow', P[6]], ['crow', P[8]], ['slurp', P[3] + .7], ['splash', T_SPIT], ['whoosh', T_SPIN0], ['whoosh', T_SPIN0 + .25], ['launch', T_THROW], ['whoosh', T_THROW + .4], ['glass', T_CRASH], ['crash', T_CRASH], ['scream', T_NBOUT], ['thud', T_NBOUT + .55],
  ['slurp', P[6] + .7], ['scream', T_SEE6], ['yelp', T_SEE6 + .1], ['dig', P[7]], ['dig', P[7] + .35], ['dig', P[7] + .7], ['thud', T_DROP + .15], ['slam', T_STONE], ['bell', T_STONE + .2],
  ['step', P[8] + .2], ['step', P[8] + .55], ['creak', T_SEE8 + .3], ['dial', P[9]], ['blabla', P[9] + .3], ['siren', P[10] - .2], ['skid', T_PC - .3], ['run', T_COPJ], ['skid', T_COPAT - .05], ['yelp', T_COPAT + .5],
  ['run', T_CZIP], ['cuff', T_CLICK], ['blabla', P[12] + .5], ['creak', WD.kidnapping + .4], ['siren', P[13]], ['engine', P[13], 2.2], ['engine', P[14], 1.0], ['skid', WD.later - .1], ['whoosh', T_OUT], ['thud', T_OUT + .45], ['engine', T_OUT + .4, 1.0],
  ['calm', P[15]], ['calmend', NEND + .3],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
