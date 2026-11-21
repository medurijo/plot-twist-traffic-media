// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [T_LOOK - .2, T_BIG, T_JUMP, T_ZOOM + .1]) { const d = t - t0; if (d >= 0 && d < .3) return (1 - d / .3) * 22; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function snowfall(t, amt) { if (amt <= 0) return; g2.save(); for (let k = 0; k < 170; k++) { const sp = 90 + hsh(k, 2) * 160, x_ = ((hsh(k, 1) * W + Math.sin(t * 1.3 + k) * 30) % W + W) % W, y_ = ((hsh(k, 4) * H + t * sp) % H + H) % H, r = 2.5 + hsh(k, 5) * 6;
  g2.fillStyle = `rgba(255,255,255,${(.5 + hsh(k, 6) * .4) * amt})`; g2.beginPath(); g2.arc(x_, y_, r, 0, 6.283); g2.fill(); } g2.restore(); }
function fx2d(t) { const i = ph(t); if (i === 6 || i === 7) snowfall(t, clamp((t - WD.winter + .2) / .4));
  comic(t, WD.waited + .25, 1.0, 'tap tap tap', 560, 640, '#fff', .06, 80); comic(t, at(1, .6), .8, '*sigh*', 640, 560, '#fff', -.05, 80);
  comic(t, WD.crossed, 1.3, 'slowly.', 600, 600, '#fff', -.06, 90); comic(t, T_LOOK + .15, 1.0, '...slime.', 600, 980, '#7cf08a', .06, 90);
  comic(t, P[4] + .1, .45, 'DAY 2', 540, 560, '#fff', -.05, 130); comic(t, P[4] + .55, .45, 'DAY 61', 540, 560, '#ffd23a', .05, 130); comic(t, P[4] + 1.0, .5, 'DAY 300', 540, 560, '#ff8a5a', -.05, 140);
  comic(t, T_LAND + .1, .9, 'tweet.', 720, 520, '#fff', .07, 90); comic(t, WD.winter + .1, 1.1, 'brrrrr', 540, 560, '#bfe3ff', -.05, 120);
  comic(t, T_BIG, 1.1, 'SCHWOOOP', 540, 540, '#ffd23a', -.06, 130); comic(t, BSTART + .2, 1.0, 'CLANK CLANK', 540, 520, '#fff', .05, 100);
  comic(t, T_ZOOM + .05, .8, 'ZOOOOM!', 540, 520, '#ffb03a', -.06, 150); comic(t, T_GREEN + .05, 1.0, '!!!', 540, 520, '#7cf08a', .05, 170);
  comic(t, T_JUMP, 1.2, 'YEEEES!', 540, 520, '#7cf08a', -.05, 150); comic(t, T_STEP + .2, 1.0, 'one. small. step.', 560, 600, '#fff', .05, 70);
  comic(t, WD.red3 + .05, .9, '...', 540, 560, '#ff4a3a', .05, 170); comic(t, T_RED + .05, .9, '...', 540, 560, '#ff4a3a', .05, 170); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
const goLines = [[P[1], P[2]], [P[4], P[9]]]; const PASS = [...goLines.flatMap(([a, b]) => passTimes(a, b)), ...passTimes(T_RED, 0).map(x => x + T_END)];
window.SFX = [...SHOTS.slice(1).map(s => ['cut', s.t]), ...PASS.map(x => ['whoosh', x - .15]), ...passTimes(T_RED, 0).filter(x => x < -1.2).map(x => ['whoosh', x - .15]),
  ['tick', WD.waited + .25], ['tick', WD.waited + .5], ['tick', WD.waited + .75], ['squish', T_SN + .3], ['squish', P[3] + .3], ['scream', T_LOOK - .2], ['squish', T_LOOK + 1.05], ['blabla', T_LOOK - .1],
  ['ding', P[4] + .1], ['ding', P[4] + .55], ['ding', P[4] + 1.0], ['whoosh', T_BIRD + .3], ['squawk', T_LAND], ['pop', T_LAND + .35], ['pop', T_LAND + .53], ['pop', T_LAND + .71], ['wind', WD.winter - .1],
  ['stretch', T_BEARD + .1], ['stretch', T_BEARD + .6], ['boing', T_BIG], ['scream', T_BIG], ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => ['clank', BSTART + k * .17 + .1]), ['step', BSTART + 1.2], ['step', BSTART + 1.4], ['snore', BSTART + 1.8],
  ['run', T_ZOOM], ['whoosh', T_ZOOM + .1], ['spin', T_ZOOM + .15], ['dizzy', T_ZOOM + .7], ['fanfare', T_GREEN], ['ding', T_GREEN], ['fw', T_JUMP], ['crash', T_JUMP + .1], ['scream', T_JUMP], ['punch', T_JUMP], ['thud', T_JUMP + .9],
  ['step', T_STEP + .3], ['step', T_STEP + .85], ['sting', WD.red3], ['hop', T_BACK + T_END], ['thud', T_BACK + .35 + T_END], ['calm', 1e9], ['doorbell', 1e9]];
window.renderAt = renderAt; window.ready = true;
