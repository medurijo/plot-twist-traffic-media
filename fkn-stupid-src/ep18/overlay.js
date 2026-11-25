// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_SNZ, T_IMP]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const i = ph(t); const sir = 0;
  if (sir) { const red = Math.sin(t * 14) > 0; const sg = g2.createRadialGradient(red ? 0 : W, 960, 200, red ? 0 : W, 960, 1300); sg.addColorStop(0, red ? `rgba(255,40,50,${sir})` : `rgba(50,90,255,${sir})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); g2.save(); g2.globalCompositeOperation = 'screen'; g2.fillStyle = sg; g2.fillRect(0, 0, W, H); g2.restore(); }
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { comic(t, .45, 1.2, 'DAY 3', 300, 520, '#fff', -.08, 110); comic(t, .9, 1.0, 'tap tap tap', 760, 700, '#fff', .06, 70);
  comic(t, T_BL, .35, 'SLAP', 540, 560, '#ffd23a', -.06, 130); comic(t, P[2] + .1, .9, 'VROOOM', 540, 480, '#fff', .05, 110); comic(t, WD.stopped, 1.2, 'STARE.', 760, 560, '#fff', .06, 95);
  comic(t, WD.head - .1, .9, 'peck peck', 760, 520, '#fff', -.05, 85); comic(t, WD.nothing4 + .1, .7, '...', 540, 520, '#fff', .03, 110);
  comic(t, WD.cop - .05, .7, 'STOP!', 280, 560, '#ff5a4a', -.08, 110); comic(t, T_TRIP + .05, .5, 'BONK', 540, 1080, '#ffd23a', .05, 115); comic(t, T_CP2 + .3, .7, 'STOP!!', 780, 560, '#ff5a4a', .08, 105);
  comic(t, WD.sneezed + .05, .5, 'ah...', 760, 540, '#fff', .05, 90); comic(t, T_SNZ, .55, 'ACHOO!', 540, 500, '#ffd23a', -.06, 140); comic(t, P[7] + .05, .8, 'VROOOM', 540, 480, '#fff', .05, 110);
  comic(t, T_JUMP + .1, .5, 'HOP', 540, 520, '#fff', -.05, 110); comic(t, T_TAPE, .6, 'SKRRRT', 540, 520, '#ffd23a', .05, 115);
  comic(t, T_ARR - .1, .6, 'SKRT', 540, 1080, '#fff', .05, 110); comic(t, T_LIFT, .5, 'HUP', 760, 560, '#fff', -.05, 100); comic(t, T_TOSSIN - .05, .5, 'THUNK', 540, 560, '#ffd23a', .05, 110);
  comic(t, T_RET - .05, .8, '1 SEC LATER', 540, 470, '#fff', -.04, 85); comic(t, T_SPIN, .9, 'SKREEEEECH', 540, 1080, '#ffd23a', .05, 100);
  comic(t, T_THROW, .5, 'YEET', 540, 1080, '#fff', -.06, 120); comic(t, T_IMP, .7, 'THUD', 540, 520, '#ffd23a', .05, 135); comic(t, T_IMP + .35, .7, 'ow.', 760, 760, '#fff', -.05, 80);
  comic(t, T_SLAP, .5, 'SLAP', 540, 560, '#ffd23a', -.06, 130); comic(t, T_VAN3, .6, 'VROOOM', 540, 480, '#fff', .05, 110);
  comic(t, P[13] - T_END + T_END + 1.05, .9, 'tap tap', 800, 800, '#fff', .06, 80); comic(t, P[13] + 1.4, .8, 'ORDERED.', 540, 520, '#fff', -.05, 100); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['step', .1], ['knock', .9], ['knock', 1.15], ['knock', 1.4], ['wind', .7], ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3],
  ['whoosh', T_BL - .05], ['slap', T_BL + .1], ['engine', T_BL1, 1.0], ['whoosh', T_BL1 + .1], ['skid', T_BL1 + .05], ['tick', WD.stopped + .3],
  ['flap', T_PIGIN], ['coo', T_PIGON + .1], ['knock', WD.head + .05], ['knock', WD.head + .25], ['knock', WD.head + .45], ['coo', WD.nothing4 + .2],
  ['run', T_TH1 + .3], ['siren', WD.cop], ['run', T_CP1 + .3], ['bonk', T_TRIP + .02], ['thud', T_TRIP + .2], ['run', T_TRIP + .55], ['run', T_TH2 + .3], ['run', T_CP2 + .4], ['blabla', T_CP2 + .4],
  ['sneeze', T_SNZ], ['slap', T_SNZ + .12], ['flap', T_SNZ + .05], ['coo', T_SNZ + .2], ['engine', T_VAN2, 1.0], ['skid', T_VAN2 + .05], ['paper', T_RIP], ['paper', T_RIP + .1],
  ['boing', T_JUMP + .05], ['thud', T_IN], ['creak', T_FLAP], ['tape', T_TAPE], ['slap', T_LAB],
  ['engine', P[9], .4], ['skid', T_ARR - .15], ['creak', T_ARR], ['run', T_DG0], ['groan', T_LIFT], ['run', T_BACK], ['whoosh', T_TOSS], ['thud', T_TOSSIN], ['slam', T_TOSSIN + .2],
  ['engine', T_GO, .6], ['engine', T_RET, 1.4], ['skid', T_SPIN], ['skid', T_SPIN + .35], ['thud', T_STOP],
  ['creak', P[11]], ['whoosh', T_THROW], ['crash', T_IMP], ['bonk', T_IMP + .02], ['thud', T_IMP + .35],
  ['run', T_Z0], ['slap', T_SLAP], ['run', T_ZB], ['slam', T_ZBAT + .05], ['engine', T_VAN3, 1.0],
  ['pop', P[13] - T_END + T_END + .4], ['dial', WD.ordered], ['ding', P[13] + 1.4], ['hop', P[13] + 1.7], ['punch', P[13] + 2.15], ['whoosh', P[13] + 2.2], ['step', P[13] + 2.6],
  ['calm', P[13]], ['calmend', NEND + .3]];
window.renderAt = renderAt; window.ready = true;
