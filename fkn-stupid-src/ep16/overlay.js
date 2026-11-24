// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_CASH, T_STOP, T_FAST]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function note2d(x, y, s, col, rot) { g2.save(); g2.translate(x, y); g2.rotate(rot); g2.scale(s, s); g2.lineJoin = 'round'; g2.strokeStyle = '#1b1b20'; g2.lineWidth = 14; g2.fillStyle = col;
  g2.beginPath(); g2.ellipse(-22, 40, 26, 19, -.4, 0, 6.283); g2.ellipse(38, 26, 26, 19, -.4, 0, 6.283); g2.stroke(); g2.fillRect(-2, -60, 10, 100); g2.fillRect(58, -74, 10, 100); g2.beginPath(); g2.moveTo(-2, -60); g2.lineTo(68, -74); g2.lineTo(68, -50); g2.lineTo(-2, -36); g2.closePath(); g2.stroke(); g2.fill();
  g2.strokeRect(-2, -60, 10, 100); g2.strokeRect(58, -74, 10, 100); g2.beginPath(); g2.ellipse(-22, 40, 26, 19, -.4, 0, 6.283); g2.ellipse(38, 26, 26, 19, -.4, 0, 6.283); g2.fill(); g2.restore(); }
function notes(t, t0, t1, n, amp = 1) { if (t < t0 || t > t1) return; for (let k = 0; k < n; k++) { const f = ((t - t0) * .7 + hsh(k, 4)) % 1; const x = 120 + hsh(k, 1) * 840 + Math.sin(t * 3 + k) * 40, y = 1150 - f * 900; const a = Math.sin(f * Math.PI); if (a < .05) continue; g2.globalAlpha = a; note2d(x, y, (.6 + hsh(k, 2) * .5) * amp, ['#ffd23a', '#f08aa8', '#7fd1c3', '#fff'][k % 4], Math.sin(t * 5 + k) * .3); } g2.globalAlpha = 1; }
function fx2d(t) { const tl = t >= P[14] ? t - T_END : t; // loop-aware for the intro
  notes(tl, -5, P[1], 3, .6); comic(t, TPASS + .35, .9, 'nope.', 760, 560, '#fff', .06, 90); comic(t, T_GO - .05, .8, 'ZOOM', 540, 520, '#ffd23a', -.06, 130);
  comic(t, T_FAST, 1.1, 'VROOOOM', 540, 470, '#ffd23a', -.05, 130); comic(t, P[3] + .25, 1.1, 'NYOOOOOM', 540, 480, '#fff', .05, 120); comic(t, T_HOFF, .6, 'POP', 540, 520, '#fff', -.06, 120);
  for (let k = 0; k < 3; k++) comic(t, T_HOFF + .62 + k * .36, .34, 'hop', 380 + k * 160, 1060 - k * 40, '#fff', (k % 2 ? .1 : -.1), 80);
  comic(t, T_CJ, .7, 'HUP!', 540, 520, '#fff', .06, 120); comic(t, WD.why - .1, 1.0, '???', 540, 520, '#fff', -.05, 150); comic(t, T_STOP - .3, .8, 'SKRRRT', 540, 500, '#ffd23a', .05, 120);
  comic(t, T_KN, .7, 'knock knock', 540, 520, '#fff', -.04, 85); comic(t, T_OPEN + .45, .8, 'lick.', 700, 540, '#fff', .07, 90); comic(t, T_SOLD + .25, .7, '...', 540, 520, '#fff', -.03, 150);
  comic(t, T_CASH + .1, 1.1, 'SOLD!', 540, 500, '#ffd23a', -.08, 170); comic(t, T_LAUNCH + .1, .8, 'WHEEE', 330, 560, '#fff', .08, 100); comic(t, T_HATON + .25, .8, 'plop.', 540, 540, '#fff', .05, 95);
  comic(t, T_COPB + .3, .8, 'again?', 760, 600, '#fff', .07, 80); notes(t, T_BTN, P[12] + .2, 8, 1.0); comic(t, T_BTN, .6, 'CLICK', 540, 520, '#ffd23a', -.06, 110); comic(t, WD.fucking3 + .1, .9, 'HUH?!', 540, 480, '#ff5a4a', .06, 140); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['jingle', 0, T_FAST, 1.0, 1.0, 0], ['jingle', T_FAST, P[7] - T_FAST, 1.9, .55, 0], ['jingle', P[12], T_END - P[12] + .1, 1.0, 1.0, -T_END], ['jingle', T_BTN, P[12] - T_BTN, 1.0, 1.8, 0], ['engine', 0, P[1]], ['engine', P[14], T_END - P[14]],
  ['run', T_GO], ['whoosh', T_GO], ['run', T_GO + 1.0], ['launch', T_FAST], ['engine', T_FAST, 1.5], ['boing', T_FAST + .1], ['yelp', T_FAST + .3], ['run', P[3]], ['whoosh', P[3] + .1], ['run', P[3] + 1.0],
  ['pop', T_HOFF], ['whoosh', T_HOFF + .05], ['hop', T_HOFF + .62], ['hop', T_HOFF + .98], ['hop', T_HOFF + 1.34], ['hop', T_HOFF + 1.7], ['run', P[4] + .3],
  ['whoosh', T_CJ], ['thud', T_CL], ['run', T_CL], ['run', T_CL + 1.0], ['whoosh', P[6] + .65], ['run', P[6]], ['chomp', P[6] + .4],
  ['skid', T_STOP - .35], ['skid', T_ARR - .2], ['knock', T_KN], ['knock', T_KN + .16], ['knock', T_KN + .32],
  ['creak', T_OPEN], ['slurp', T_OPEN + .4], ['slap', T_SOLD], ['slurp', T_SOLD + .5],
  ['pop', T_WAL], ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['punch', T_CASH], ['ding', T_CASH + .08], ['paper', T_CASH + .05], ['paper', T_CASH + .3], ['scream', T_LAUNCH], ['crash', T_LAUNCH + .7], ['whoosh', T_DIVE], ['thud', T_DIVE + .4],
  ['hop', T_HATON - .72], ['hop', T_HATON - .36], ['hop', T_HATON], ['pop', T_HATON + .25], ['whoosh', T_COPB + .3], ['run', T_COPB + .1],
  ['clank', T_BTN], ['engine', T_DRIVE, P[12] - T_DRIVE], ['scream', WD.fucking3 + .05],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
