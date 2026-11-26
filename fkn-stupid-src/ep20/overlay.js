// ---------- 2D overlay ----------
function comic(t, t0, dur, txt, x, y, col, rot = -.08, sz = 120) { const d = t - t0; if (d < 0 || d > dur) return; const s = eback(clamp(d / .12)) * (1 - clamp((d - dur + .15) / .15)); g2.save(); g2.translate(x, y); g2.rotate(rot + Math.sin(d * 30) * .03); g2.scale(s, s);
  g2.font = `900 ${sz}px "Inter Display"`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = sz * .22; g2.strokeStyle = '#1b1b20'; g2.strokeText(txt, 0, 0); g2.fillStyle = col; g2.fillText(txt, 0, 0); g2.restore(); }
function badge(t, label, n, col = '#fff') { g2.save(); g2.translate(790, 300); g2.rotate(.05); g2.fillStyle = '#1b2a44'; g2.fillRect(-230, -95, 460, 190); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 10; g2.strokeRect(-230, -95, 460, 190);
  g2.fillStyle = '#ffd23a'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.font = '800 40px "Inter Display"'; g2.fillText(label, 0, -48); g2.font = '900 104px "Inter Display"'; g2.fillStyle = col; g2.fillText(String(n), 0, 30); g2.restore(); }
const bigShake = t => signShake(t) + (() => { for (const t0 of [WD.fucking1, WD.fucking2, WD.fucking3, T_HIT, T_CRUSH, T_CLAND]) { const d = t - t0; if (d >= 0 && d < .25) return (1 - d / .25) * 20; } return 0; })();
function post(t, L, cam) { const v = g2.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,20,40,${.28 + L.k * .25})`); g2.fillStyle = v; g2.fillRect(0, 0, W, H);
  g2.save(); g2.globalCompositeOperation = 'soft-light'; const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,150,110,.22)'); gr.addColorStop(1, 'rgba(90,80,160,.2)'); g2.fillStyle = gr; g2.fillRect(0, 0, W, H); g2.restore();
  const d = t - cam.st; if (d < .07 && cam.shot > 0) { g2.fillStyle = `rgba(255,255,255,${(1 - d / .07) * .16})`; g2.fillRect(0, 0, W, H); } }
function note2d(x, y, s, col, rot) { g2.save(); g2.translate(x, y); g2.rotate(rot); g2.scale(s, s); g2.lineJoin = 'round'; g2.strokeStyle = '#1b1b20'; g2.lineWidth = 14; g2.fillStyle = col;
  g2.beginPath(); g2.ellipse(-22, 40, 26, 19, -.4, 0, 6.283); g2.ellipse(38, 26, 26, 19, -.4, 0, 6.283); g2.stroke(); g2.fillRect(-2, -60, 10, 100); g2.fillRect(58, -74, 10, 100); g2.beginPath(); g2.moveTo(-2, -60); g2.lineTo(68, -74); g2.lineTo(68, -50); g2.lineTo(-2, -36); g2.closePath(); g2.stroke(); g2.fill();
  g2.strokeRect(-2, -60, 10, 100); g2.strokeRect(58, -74, 10, 100); g2.beginPath(); g2.ellipse(-22, 40, 26, 19, -.4, 0, 6.283); g2.ellipse(38, 26, 26, 19, -.4, 0, 6.283); g2.fill(); g2.restore(); }
function notes(t, t0, t1, n, amp = 1) { if (t < t0 || t > t1) return; for (let k = 0; k < n; k++) { const f = ((t - t0) * .7 + hsh(k, 4)) % 1; const x = 120 + hsh(k, 1) * 840 + Math.sin(t * 3 + k) * 40, y = 1150 - f * 900; const a = Math.sin(f * Math.PI); if (a < .05) continue; g2.globalAlpha = a; note2d(x, y, (.6 + hsh(k, 2) * .5) * amp, ['#ffd23a', '#f08aa8', '#7fd1c3', '#fff'][k % 4], Math.sin(t * 5 + k) * .3); } g2.globalAlpha = 1; }
function card(t, t0, dur, txt) { const d = t - t0; if (d < 0 || d > dur) return; const s = eout(clamp(d / .15)) * clamp((dur - d) / .15); g2.save(); g2.translate(540, 300); g2.rotate(-.03); g2.globalAlpha = s; g2.fillStyle = '#1b1b20'; g2.fillRect(-380, -70, 760, 140); g2.strokeStyle = '#ffd23a'; g2.lineWidth = 8; g2.strokeRect(-380, -70, 760, 140);
  g2.fillStyle = '#ffd23a'; g2.font = '900 76px "Inter Display"'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(txt, 0, 4); g2.restore(); }
function fx2d(t) { const tl = t >= P[12] ? t - T_END : t;
  comic(tl, -1.65, .8, 'TA-DA', 760, 560, '#ffd23a', .06, 100); comic(tl, .05, .7, 'VROOM', 300, 520, '#fff', -.06, 110); comic(tl, WD.truck0 + .05, .9, '...', 540, 520, '#fff', -.04, 150);
  comic(t, WD.one, 1.0, '-1 SEC', 540, 500, '#ffd23a', -.06, 140); comic(t, WD.fucking1 + .3, .8, 'bye!', 780, 640, '#fff', .07, 85);
  comic(t, P[2] + .05, .9, 'ZOOOM', 540, 500, '#ffd23a', .05, 130); comic(t, T_REL, .5, 'YEET', 540, 500, '#fff', -.06, 130); comic(t, T_HIT, .6, 'SPLAT', 540, 1080, '#ffd23a', .05, 130);
  comic(t, T_LIFT, .6, 'HNNNG', 540, 500, '#fff', .05, 110); comic(t, T_BLAND, .6, 'BONK', 540, 1080, '#ffd23a', -.05, 130); comic(t, WD.missed4 + .4, .8, 'hello?', 760, 620, '#fff', .06, 85);
  comic(t, T_LEAP - .05, .7, 'CANNONBALL', 540, 500, '#ffd23a', -.05, 105); comic(t, T_PULL, .5, 'click', 760, 600, '#fff', .06, 90); comic(t, T_CRUSH + .1, .8, 'CRUNCH', 540, 520, '#ffd23a', .05, 140);
  comic(t, WD.cube7, .9, 'NEAT.', 540, 520, '#fff', -.04, 130); comic(t, T_TOSS + .45, .6, 'ding', 760, 600, '#fff', .06, 90);
  card(t, P[8], 1.0, 'NEXT WEEK'); comic(t, T_CLAND, .5, 'BOING', 540, 1080, '#ffd23a', .05, 120); comic(t, WD.cube9 + .3, .8, 'blink.', 760, 600, '#fff', .05, 85);
  comic(t, T_PIGLAND + .1, .8, 'coo.', 760, 560, '#fff', -.05, 95); comic(t, T_POP, .6, 'POP!', 540, 500, '#ffd23a', -.06, 150); }
function renderAt(tr) { const t = Math.floor(tr * 30 + .001) / 30; if (t >= NEND) { drawFrame(t - T_END); return; } drawFrame(t); }
function drawFrame(t) { const L = stage(t); const cam = camAt(t); R.render(scene, { eye: cam.eye, target: cam.target, up: cam.up, fov: cam.fov, bg: L.bg }, { dir: L.dir, center: L.center, size: L.size, sun: L.sun, amb: L.amb, fogC: L.fogC, fogD: L.fogD });
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; g2.imageSmoothingQuality = 'high'; const sh = SHOTS[cam.shot]; const shk = bigShake(t) + sh.shk * 10 * (1 + Math.sin(t * 3));
  g2.drawImage(glc, -30 + n1(t * 60) * shk, -54 + n1(t * 60 + 9) * shk, W + 60, H + 108); grade(t, L); post(t, L, cam); fx2d(t); sign(t); caption(t); }
window.SEGS = [P[3], P[6], P[9], P[12]]; window.T_INTRO = P[3]; window.T_OUT = NEND; window.T_END = T_END;
window.SFX = [...SHOTS.slice(1).filter(s => s.t < NEND - .05).map(s => ['cut', s.t]),
  ['engine', 0, 2.2], ['paper', WD.took - .2], ['step', -.2 + T_END], ['run', .1], ['run', .6],
  ['sting', WD.fucking1], ['sting', WD.fucking2], ['sting', WD.fucking3], ['thud', WD.fucking1], ['thud', WD.fucking1 + .35], ['blabla', WD.fucking1 + .1],
  ['run', P[2]], ['whoosh', P[2] + .1], ['run', P[2] + .7], ['whoosh', T_WIND], ['launch', T_REL], ['whoosh', T_REL + .2], ['splat', T_HIT], ['crash', T_HIT], ['yelp', T_HIT + .05], ['thud', T_HIT + .35],
  ['clank', T_GRAB + .1], ['groan', T_LIFT], ['launch', T_BREL], ['whoosh', T_BREL + .2], ['bonk', T_BLAND], ['clank', T_BLAND + .02], ['yelp', T_BLAND + .1],
  ['run', P[5]], ['run', P[5] + .5], ['launch', T_LEAP], ['whoosh', T_LEAP + .1], ['thud', T_IN], ['clank', T_IN + .05], ['clank', T_PULL + .1], ['rumble', T_CRUSH], ['crash', T_CRUSH + .1], ['squish', T_CRUSH + .25], ['scream', T_CRUSH + .05], ['pop', T_CRUSH + .25],
  ['clank', T_REACH], ['stretch', T_UP], ['fanfare', WD.cube7 - .1], ['whoosh', T_TOSS], ['ding', T_TOSS + .45], ['clank', T_TOSS + .45],
  ['engine', P[8], T_ARR - P[8] + .3], ['skid', T_ARR - .3], ['whoosh', T_FLING], ['boing', T_CLAND], ['thud', T_CLAND], ['whoosh', T_BFLING], ['thud', T_BLAND2],
  ['crickets', P[9], 1.6], ['coo', T_PIGIN + .2], ['flap', T_PIGIN], ['coo', T_PIGLAND + .3], ['tape', T_PIGLAND + .5],
  ['stretch', P[11] + .1], ['pop', T_POP], ['boing', T_POP + .05], ['flap', T_POP + .05], ['coo', T_POP + .1],
  ...SIGNS.map(([li, f]) => ['sign', at(li, f) + .12])];
window.renderAt = renderAt; window.ready = true;
