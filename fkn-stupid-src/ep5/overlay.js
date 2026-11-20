// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
function counters(t) { const i = ph(t); if (i === 2 && t > T_HAMMER0) { const n = Math.min(100, Math.max(1, Math.round(100 * clamp((t - T_HAMMER0) / (T_HEADBUTT - .3 - T_HAMMER0))))); badge(t, 'PRESSES', n, n >= 100 ? '#ff5a4a' : '#fff'); }
  if (i === 6 || i === 7) { const n = i === 6 ? 1 : Math.min(40, 1 + Math.floor(39 * Math.pow(clamp((t - P[7]) / (pend(7) - P[7] - .2)), 1.1))); badge(t, 'FLOOR', n, n >= 40 ? '#ff5a4a' : '#fff'); }
  if (i === 13) badge(t, 'FLOOR', Math.max(1, 40 - Math.floor(39 * clamp((t - P[13]) / (pend(13) - P[13] - .1)))), '#7fd0ff'); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [T_HEADBUTT, T_BLEAT, T_SNATCH, WD.forty2, WD.floors2]) { const d = t - t0; if (d >= 0 && d < .2) return (1 - d / .2) * 18; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function fx2d(t) { comic(t, P[1] + .2, 1.0, '*crickets*', 540, 640, '#fff', -.05, 70); comic(t, T_HEADBUTT, .5, 'BONK!', 600, 700, '#ffd23a', .1, 150); comic(t, T_DING, .7, 'DING!', 540, 480, '#ffd23a', -.06, 140);
  comic(t, T_BLEAT, .8, 'MEEEEEH!!', 540, 560, '#fff', -.08, 130); comic(t, WD.opened, .6, 'DING!', 700, 520, '#ffd23a', .08, 120); comic(t, WD.doormat, .5, 'NOM', 400, 760, '#fff', -.1, 110); comic(t, WD.door, .5, 'CRUNCH!', 560, 620, '#ffd23a', .07, 120);
  comic(t, T_SNATCH + .3, .6, 'GULP!', 540, 560, '#ff5a4a', -.06, 140); comic(t, WD.floors2 + .4, .5, 'WHEEZE', 540, 700, '#7fd0ff', .06, 100); }
// stair follow-cam
function stairCam(t, cam) { const p = late.stairCam; if (!p) return cam; const i = ph(t); let off, tg;
  if (i === 6) { off = [.5, 2.7, 2.8]; tg = [0, 1.3, 0]; } else if (i === 7) { off = [.62, 2.0, 1.9]; tg = [0, 1.5, 0]; } else { off = [.45, 1.7, -1.7]; tg = [0, .9, 0]; }
  const eye = A3(p, off), target = A3(p, tg); const f = norm(sub(target, eye)), r = norm(cross(f, [0, 1, 0])), u0 = cross(r, f); const a = (i === 7 ? Math.sin(t * 9) * .12 : i === 13 ? Math.sin(t * 6) * .25 : 0); const up = [u0[0] * Math.cos(a) + r[0] * Math.sin(a), u0[1] * Math.cos(a) + r[1] * Math.sin(a), u0[2] * Math.cos(a) + r[2] * Math.sin(a)];
  return Object.assign({}, cam, { eye, target, up }); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = stairCam(t, camAt(t)); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); counters(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).map(s => ['cut', s.t]), ['click', WD.pressed + .05], ['crickets', P[1], 1.3], ['tumble', P[1] + .1], ...Array.from({ length: 22 }, (_, k) => ['click', T_HAMMER0 + k * (T_HEADBUTT - .3 - T_HAMMER0) / 22]), ['thud', T_HEADBUTT], ['boing', T_HEADBUTT + .05], ['dizzy', T_HEADBUTT + .2],
  ['ding', T_DING], ['muzak', T_DING + .2, 2.6], ['bleat', T_BLEAT], ['bleat', T_BLEAT + .25], ['scream', T_BLEAT + .1], ['whoosh', T_BLEAT + .05], ['run', P[5] + .1], ['slam', pend(5) - .15],
  ...Array.from({ length: 6 }, (_, k) => ['step', P[6] + k * .2]), ['run', P[7]], ['run', P[7] + .8], ['run', P[7] + 1.6], ['groan', pend(7) - .5], ['ding', WD.opened - .05], ['bleat', WD.waiting], ['chomp', WD.doormat], ['chomp', WD.doormat + .35], ['chomp', WD.door], ['chomp', WD.door + .3], ['thud', WD.door + .6],
  ['whoosh', T_SNATCH], ['chomp', T_SNATCH + .3], ['scream', T_SNATCH + .35], ['tumble', P[13]], ...Array.from({ length: 8 }, (_, k) => ['thud', P[13] + .2 + k * .27]), ['scream', P[13] + .1], ['step', P[14] + .2], ['step', P[14] + .5], ['step', P[14] + .8], ['calm', P[14]]];
window.renderAt = renderAt; window.ready = true;
