// Episode 62: Country road – the road in front of you rolls up like a carpet
// hook (old style): empty country road, sunny morning, the road in front starts to curl up -> it's rolling up like a
//        carpet, a wall of asphalt coming your way
// wrong: full speed, jump over it before it gets too big -> it's already too big, you drive up the curl, round and round,
//        loop the loop -> the road rolls right over you: wrapped up like a sausage roll, off it goes to the next town
// right: stop, engine off, let it come to you -> it stops right at your bumper, boop -> one tiny nudge, tap ->
//        it rolls back out again, but this time it's a red carpet -> flashlights, applause, drive on like a movie star
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, box, instanced, makeLandscape,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
// ---------------- timing ----------------
const tEmpty = WT('hook1', 'Empty'), tSunny = WT('hook1', 'Sunny'), tThen = WT('hook1', 'Then'), tCurl = WT('hook1', 'curl');
const tIts = WT('hook2', "It's"), tCarpet = WT('hook2', 'carpet'), tWall = WT('hook2', 'wall'), tComing = WT('hook2', 'coming'), tWhat = WT('hook2', 'What');
const tFull = WT('wrong1', 'full'), tJump = WT('wrong1', 'Jump'), tBig1 = WT('wrong1', 'big');
const tBigM = WT('wrong2', 'Big'), tAlready = WT('wrong2', 'already'), tDrive = WT('wrong2', 'drive'), tUp = WT('wrong2', 'up'), tRound = WT('wrong2', 'round'), tLoop = WT('wrong2', 'loop');
const tRolls = WT('wrong3', 'rolls'), tWrapped = WT('wrong3', 'wrapped'), tSausage = WT('wrong3', 'sausage'), tOff = WT('wrong3', 'off'), tNext = WT('wrong3', 'next');
const tStop = WT('right2', 'Stop'), tLet = WT('right2', 'Let');
const tCloser = WT('right3', 'closer'), tStops = WT('right3', 'stops'), tBumper = WT('right3', 'bumper'), tBoop = WT('right3', 'Boop');
const tNow = WT('right4', 'Now'), tNudge = WT('right4', 'nudge'), tRoll = WT('right4', 'roll'), tTap = WT('right4', 'Tap');
const tRollsR = WT('right5', 'rolls'), tBut = WT('right5', 'But'), tRed = WT('right5', 'red'), tCarpetR = WT('right5', 'carpet');
const tFlash = WT('right6', 'Flashlights'), tApplause = WT('right6', 'Applause'), tDriveR = WT('right6', 'drive'), tMovie = WT('right6', 'movie');
const isRight = t => t >= tRew0 + 0.5;
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}

// ---------------- the road strip that rolls up ----------------
const RW = 3.6, LANE = 1.75, TH = 0.3, LR = 90, ZA = 0, R0 = 3.2, DS = 0.3;
const AA = TH / (4 * PI);
const NR = Math.round(LR / DS) + 1;
// geometry of the roll for a given contact parameter sc (material s < sc lies flat, s > sc is wound up)
function rollInfo(sc) {
  const scc = Math.max(0, sc), Lw = LR - scc;
  const phiT = (-R0 + Math.sqrt(R0 * R0 + 4 * AA * Lw)) / (2 * AA);
  const rOut = R0 + TH * phiT / (2 * PI), Yc = rOut + TH;
  const D = Math.max(0, -sc);                              // free rolling distance after everything is wound up
  return { scc, Lw, phiT, rOut, Yc, zc: ZA - scc + D, alpha: D / Yc, D };
}
function matPoint(s, RI, out) { // -> out = [y, z, ny, nz] (top surface point, top normal)
  if (s <= RI.scc) { out[0] = TH; out[1] = ZA - s + RI.D * 0; out[2] = 1; out[3] = 0; }
  else { const d = s - RI.scc, ell = RI.Lw - d; const phi = (-R0 + Math.sqrt(R0 * R0 + 4 * AA * Math.max(0, ell))) / (2 * AA);
    const r = R0 + TH * phi / (2 * PI), th = RI.phiT - phi; out[0] = RI.Yc - r * Math.cos(th); out[1] = (ZA - RI.scc) - r * Math.sin(th); out[2] = Math.cos(th); out[3] = Math.sin(th); }
  if (RI.D > 0 && s > RI.scc - 1e-6) { // rigid free roll: rotate about the centre and move +z
    const zc0 = ZA - RI.scc, z = out[1] - zc0, y = out[0] - RI.Yc, ca = Math.cos(RI.alpha), sa = Math.sin(RI.alpha);
    out[1] = zc0 + RI.D + z * ca + y * sa; out[0] = RI.Yc - z * sa + y * ca;
    const nz = out[3], ny = out[2]; out[3] = nz * ca + ny * sa; out[2] = -nz * sa + ny * ca; }
  return out;
}
const roadTex = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#5a5d63'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = 72 + Math.random() * 40 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  c.fillStyle = '#f2f2f2'; c.fillRect(10, 0, 9, h); c.fillRect(w - 19, 0, 9, h); c.fillRect(w / 2 - 4, 40, 8, 190); c.fillRect(w / 2 - 4, 296, 8, 190); }, true);
const carpetTex = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#b5121b'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${120 + Math.random() * 80 | 0},0,10,0.35)`; c.fillRect(Math.random() * w, Math.random() * h, 2, 3); }
  c.fillStyle = '#e8b923'; c.fillRect(6, 0, 14, h); c.fillRect(w - 20, 0, 14, h); c.fillStyle = '#ffe08a'; c.fillRect(9, 0, 3, h); c.fillRect(w - 17, 0, 3, h);
  c.fillStyle = 'rgba(232,185,35,0.5)'; c.font = '900 60px Inter'; c.textAlign = 'center'; c.save(); c.translate(w / 2, h / 2); c.rotate(PI / 2); c.fillText('★  ★  ★', 0, 20); c.restore(); }, true);
const underTex = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#3f4146'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { const v = 50 + Math.random() * 40 | 0; c.fillStyle = `rgb(${v},${v - 2},${v - 6})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, true);
const topMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.9 });
const redMat = new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 0.85 });
const botMat = new THREE.MeshStandardMaterial({ map: underTex, roughness: 0.95, side: THREE.BackSide });
const edgeMat = new THREE.MeshStandardMaterial({ color: '#45474c', roughness: 0.95, side: THREE.DoubleSide });
function strip(cols, mat) { const g = new THREE.BufferGeometry(); const n = NR * cols;
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const uv = new Float32Array(n * 2); for (let i = 0; i < NR; i++) for (let k = 0; k < cols; k++) { uv[(i * cols + k) * 2] = k / (cols - 1); uv[(i * cols + k) * 2 + 1] = i * DS / 14; } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const idx = []; for (let i = 0; i < NR - 1; i++) for (let k = 0; k < cols - 1; k++) { const a = i * cols + k, b = a + 1, c = a + cols, d = c + 1; idx.push(a, b, c, b, d, c); } g.setIndex(idx);
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; }
const topM = strip(2, topMat), botM = strip(2, botMat), edgeL = strip(2, edgeMat), edgeR = strip(2, edgeMat);
const _pt = [0, 0, 0, 0];
function buildStrip(sc, carpet) {
  const RI = rollInfo(sc); topM.material = carpet ? redMat : topMat;
  const tp = topM.geometry.attributes.position.array, tn = topM.geometry.attributes.normal.array, bp = botM.geometry.attributes.position.array, bn = botM.geometry.attributes.normal.array;
  const lp = edgeL.geometry.attributes.position.array, ln = edgeL.geometry.attributes.normal.array, rp = edgeR.geometry.attributes.position.array, rn = edgeR.geometry.attributes.normal.array;
  for (let i = 0; i < NR; i++) { matPoint(i * DS, RI, _pt); const [y, z, ny, nz] = _pt; const yb = y - ny * TH, zb = z - nz * TH;
    for (let k = 0; k < 2; k++) { const x = k ? RW : -RW, j = (i * 2 + k) * 3;
      tp[j] = x; tp[j + 1] = y; tp[j + 2] = z; tn[j] = 0; tn[j + 1] = ny; tn[j + 2] = nz;
      bp[j] = x; bp[j + 1] = yb + 0.002; bp[j + 2] = zb; bn[j] = 0; bn[j + 1] = ny; bn[j + 2] = nz; }
    for (const [P, N, x] of [[lp, ln, -RW], [rp, rn, RW]]) { const j = i * 6; P[j] = x; P[j + 1] = y; P[j + 2] = z; P[j + 3] = x; P[j + 4] = yb; P[j + 5] = zb; for (let q = 0; q < 6; q += 3) { N[j + q] = x > 0 ? 1 : -1; N[j + q + 1] = 0; N[j + q + 2] = 0; } } }
  for (const m of [topM, botM, edgeL, edgeR]) { m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.normal.needsUpdate = true; m.geometry.computeBoundingSphere(); }
  return RI;
}
// static road before / after the strip (raised slab, same height)
const slabM = new THREE.MeshStandardMaterial({ map: roadTex.clone(), roughness: 0.9 }); slabM.map.repeat.set(1, 300 / 14); slabM.map.needsUpdate = true;
const slabM2 = new THREE.MeshStandardMaterial({ map: roadTex.clone(), roughness: 0.9 }); slabM2.map.repeat.set(1, 300 / 14); slabM2.map.needsUpdate = true;
for (const [z0, z1, m] of [[ZA, ZA + 300, slabM], [ZA - LR - 300, ZA - LR, slabM2]]) { const g = new THREE.PlaneGeometry(RW * 2, z1 - z0); g.rotateX(-PI / 2); const p = new THREE.Mesh(g, m); p.position.set(0, TH, (z0 + z1) / 2); p.receiveShadow = true; scene.add(p);
  box(RW * 2, TH, z1 - z0, L('#55585e'), 0, TH / 2 - 0.01, (z0 + z1) / 2, false, true); }
// the bare ground where the road was
plane(-RW, RW, ZA - LR, ZA, L('#7b5f3f', { map: canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { const v = 170 + Math.random() * 80 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, true) }), 0.03, 6);
makeLandscape({ avoid: x => Math.abs(x) < 16, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 9, near: [0, -20, 120, 200], trees: 1500, seed: 6701 });
// verge posts + town sign
{ const pg = new THREE.BoxGeometry(0.14, 1.0, 0.14); const pl = []; for (let z = -260; z < 260; z += 25) pl.push([-5.2, 0.5, z], [5.2, 0.5, z + 12]); instanced(pg, L('#f2f2f2'), pl); }
const signT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#111'; c.lineWidth = 14; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#111'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '900 40px Inter'; c.fillText('NEXT TOWN', w / 2, 70); c.font = '900 60px Inter'; c.fillText('ROLLINGHAM', w / 2, 160); });
const SIGNZ = 64;
{ const g = new THREE.Group(); g.position.set(6.2, 0, SIGNZ); g.rotation.y = 0.25; scene.add(g);
  for (const x of [-1.3, 1.3]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8), STD('#888', { metalness: 0.6 })); p.position.set(x, 1.6, 0); p.castShadow = true; g.add(p); }
  const b = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 0.06), [L('#ccc'), L('#ccc'), L('#ccc'), L('#ccc'), L('#fff', { map: signT }), L('#fff', { map: signT })]); b.position.y = 2.6; b.castShadow = true; g.add(b); }

// ---------------- red-carpet crowd (pops up in the right way) ----------------
const CROWD = [];
const crowd = new THREE.Group(); scene.add(crowd);
const ropeM = STD('#8e0e16', { roughness: 0.7 }), goldM = STD('#e8b923', { metalness: 0.8, roughness: 0.3 });
{ const R = rng(67); const skins = ['#f2c9a6', '#d9a07a', '#a86e4b', '#f0d0b0', '#7b4b2a'], cloth = ['#1e88e5', '#212121', '#8e24aa', '#f4511e', '#43a047', '#fdd835', '#eceff1', '#5d4037'];
  for (const side of [-1, 1]) for (let i = 0; i < 15; i++) { const z = -4 - i * 3.1 - R() * 0.8, x = side * (5.6 + R() * 1.0);
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = side > 0 ? PI / 2 : -PI / 2; crowd.add(g);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 1.2, 10), STD(cloth[(R() * cloth.length) | 0])); body.position.y = 0.95; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), STD(skins[(R() * skins.length) | 0], { roughness: 0.7 })); head.position.y = 1.8; g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8, 0, PI * 2, 0, PI * 0.45), STD(['#3e2723', '#f9a825', '#212121', '#bf360c'][(R() * 4) | 0])); hair.position.y = 1.83; g.add(hair);
    const isCam = R() < 0.55; let cam = null, arms = [];
    if (isCam) { cam = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.18), STD('#111')); cam.position.set(0, 1.78, -0.3); g.add(cam); const fl = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); fl.position.set(0, 1.85, -0.45); fl.scale.setScalar(1.4); g.add(fl); cam.userData.fl = fl; }
    else for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(s * 0.33, 1.4, 0); g.add(a); const am = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.5, 4, 8), body.material); am.position.y = 0.3; a.add(am); arms.push(a); }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    CROWD.push({ g, cam, arms, ph: R() * 10, d: R() * 0.4 + (i * 0.05) }); }
  // brass posts + velvet ropes along the carpet
  for (const side of [-1, 1]) { let prev = null; for (let i = 0; i < 17; i++) { const z = -1 - i * 3, x = side * 4.3; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.0, 10), goldM); p.position.set(x, TH + 0.5, z); p.castShadow = true; crowd.add(p);
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), goldM); k.position.set(x, TH + 1.05, z); crowd.add(k);
      if (prev) { const a = V3(x, TH + 0.95, prev), b = V3(x, TH + 0.95, z); const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3, 6), ropeM); r.position.copy(a).add(b).multiplyScalar(0.5).add(V3(0, -0.12, 0)); r.rotation.x = PI / 2; crowd.add(r); } prev = z; } } }
const blobT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
CROWD.forEach(c => { if (c.cam) c.cam.userData.fl.material.map = blobT; });
const SPARK = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: i % 2 ? '#ffe08a' : '#ffffff', transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); scene.add(s); return { s, a: hash(i) * PI * 2, v: 2 + hash(i + 3) * 4, y: hash(i + 7) }; });
const DUST = Array.from({ length: 14 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#bfae8c', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, x: (hash(i) - 0.5) * 8, ph: hash(i + 2) }; });

// ---------------- hero ----------------
const hero = makeCar('#1e88e5');
const HZ_STOP = 12.0;
const heroZW = mono([[0, 58], [tThen, 30], [tCurl + 1.0, 17], [S('hook2').end, HZ_STOP], [99, HZ_STOP]]);
// contact parameter schedules
const scW = mono([[0, LR], [tCurl - 0.15, LR], [tCurl + 1.0, LR - 3.5], [tWall, LR - 13], [S('hook2').end, LR - 22], [tUp, 47], [tOff, 4], [tOff + 0.8, 0], [tRew0 + 0.3, -62]]);
// wrong: the hero meets the roll at tUp, at the contact point
const zUp = ZA - 47;
const heroZWrong = mono([[tFull - 0.1, HZ_STOP], [tFull + 1.2, HZ_STOP - 6], [tUp, zUp]]);
// right: the roll comes to the bumper and stops; nudge; rolls back as a red carpet
const RIfull = rollInfo(0);
const scStop = -((HZ_STOP - 2.2) - RIfull.Yc - ZA);       // roll front touches the bumper
const scR = mono([[tRew1 - 1.0, LR - 22], [tLet, LR - 30], [tCloser, 30], [tStops - 0.1, scStop - 0.25], [tStops + 0.15, scStop], [tRollsR - 0.25, scStop], [tRollsR + 0.9, scStop + 4], [tRed, LR * 0.45], [tCarpetR + 1.2, LR], [999, LR]]);
const heroZR = mono([[0, HZ_STOP], [tTap - 0.35, HZ_STOP], [tTap + 0.05, HZ_STOP - 0.35], [tDriveR - 0.2, HZ_STOP - 0.35], [tDriveR + 2.5, -8], [S('right7').start, -24], [TOTAL + 1, -62]]);
// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
let RIcur = rollInfo(LR);
const RollCam = (off, look, fov = 40) => t => { const z = RIcur.zc, y = RIcur.Yc; return [V3(off[0], y + off[1], z + off[2]), V3(look[0], y + look[1], z + look[2]), fov]; };
const camKeys = [
  [0.0, HeroCam([7, 8, 16], [0, 0.5, -16], 40)],
  [tThen - 0.3, HeroCam([6, 6.5, 14], [0, 0.5, -16], 40)],
  ...cut(tThen - 0.25, HeroCam([1.2, 2.4, 9.5], [-0.6, 3.0, -100], 22)),
  [tIts - 0.3, HeroCam([1.2, 2.5, 9.0], [-0.6, 3.5, -90], 22)],
  ...cut(tIts - 0.25, Ac([24, 7, -50], [0, 3.5, -76], 40)),
  [tWall - 0.3, Ac([23, 7, -52], [0, 3.8, -72], 40)],
  ...cut(tWall - 0.25, Ac([4.4, 1.3, 21], [-0.3, 4.2, -60], 16)),
  [tWhat - 0.3, Ac([4.3, 1.3, 20.5], [-0.3, 4.6, -60], 18)],
  ...cut(tWhat - 0.25, Ac([5, 4.5, 32], [0, 3.5, -50], 24)),
  [S('hook2').end + 0.5, Ac([5, 4.5, 31], [0, 3.5, -50], 24)],
  // wrong
  ...cut(S('wrong1').start - 0.15, HeroCam([3.4, 1.5, 9.0], [0.0, 2.0, -24], 40)),
  [tJump, HeroCam([3.0, 1.6, 8.5], [0.0, 2.6, -24], 40)],
  ...cut(tBigM - 0.15, HeroCam([2.0, 8.5, 17], [0, 3.0, -26], 40)),
  [tUp - 0.4, HeroCam([1.6, 7.5, 15], [0, 3.5, -16], 40)],
  ...cut(tUp - 0.25, RollCam([17, 1.0, 4], [1.5, -0.6, 0], 40)),
  [tLoop + 0.3, RollCam([16, 1.0, 3], [1.5, -0.6, 0], 40)],
  ...cut(tRolls - 0.2, RollCam([18, 2.0, 7], [1.5, -0.6, 0], 40)),
  [tSausage + 0.2, RollCam([17, 1.6, 5], [1.5, -0.6, 0], 40)],
  ...cut(tOff - 0.2, Ac([13, 3.0, SIGNZ + 24], [1, 4.0, 20], 40)),
  [tRew0, Ac([13, 3.5, SIGNZ + 25], [1, 4.0, SIGNZ - 6], 40)],
  // right
  ...cut(tRew1, Ac([5, 4.5, 32], [0, 3.5, -50], 24)),
  ...cut(tStop - 0.2, HeroCam([3.0, 1.7, 8.5], [0.0, 2.8, -24], 40)),
  ...cut(tCloser - 0.25, Ac([4.6, 0.9, HZ_STOP - 3.0], [-0.5, 3.2, -14], 40)),
  ...cut(tStops - 0.3, Ac([24, 3.4, HZ_STOP - 4.5], [0, 3.8, HZ_STOP - 4.5], 40)),
  [S('right4').end, Ac([23, 3.4, HZ_STOP - 4.5], [0, 3.8, HZ_STOP - 4.8], 40)],
  ...cut(tRollsR - 0.2, Ac([2.5, 12, HZ_STOP + 16], [0, 1, -22], 40)),
  [tCarpetR + 0.8, Ac([2.5, 12.5, HZ_STOP + 17], [0, 1, -26], 40)],
  ...cut(tFlash - 0.2, Ac([-0.6, 3.4, 23], [0.4, 1.0, -26], 36)),
  ...cut(tDriveR - 0.15, HeroCam([1.8, 2.6, 9.0], [0, 1.6, -16], 40)),
  [S('right7').start, HeroCam([1.2, 4.2, 10.5], [0, 1.6, -18], 40)],
  [TOTAL, HeroCam([0.8, 5.5, 12.5], [0, 2.0, -20], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
function update(t) {
  const right = isRight(t);
  const sc = right ? scR(t) : scW(t);
  const carpet = right && t > tRollsR + 0.6;
  RIcur = buildStrip(sc, carpet);
  // ---- hero ----
  if (!right) {
    if (t < tFull - 0.1) placeCar(hero, { x: LANE, z: heroZW(t), h: 0, y: TH });
    else if (t < tUp) placeCar(hero, { x: LANE, z: heroZWrong(t), h: 0, y: TH });
    else { // inside the roll: round and round on the inner surface
      const u = t - tUp; const psi = 2 * PI * 0.85 * u;
      const RI = RIcur; const cz = RI.zc, cy = RI.Yc;
      const ps = psi;
      const y = cy - R0 * Math.cos(ps), z = cz - R0 * Math.sin(ps);
      hero.position.set(LANE, y, z); hero.rotation.set(ps, 0, 0, 'YXZ'); hero.userData.bodyG.rotation.set(0, 0, 0);
      hero.userData.spin = (hero.userData.spin || 0) - 0.55; hero.userData.wheels.forEach(w => w.rotation.x = hero.userData.spin);
    }
  } else {
    placeCar(hero, { x: LANE, z: heroZR(t), h: 0, y: TH });
    if (t > tStops - 0.05 && t < tStops + 0.6) { const k = t - tStops + 0.05; hero.position.z += 0.18 * Math.exp(-k * 7) * Math.sin(k * 26); }
  }
  hero.userData.tl.emissiveIntensity = right && t > tStop - 0.1 && t < tDriveR ? 1.0 : 0.35;
  // ---- red carpet crowd ----
  const pop = right ? ramp(t, tRed - 0.2, tRed + 0.6) : 0; crowd.visible = pop > 0.001;
  CROWD.forEach((c, i) => { const p = right ? back(clamp((t - tRed + 0.3 - c.d) / 0.45)) : 0; c.g.scale.set(1, Math.max(0.001, p), 1); c.g.visible = p > 0.001;
    if (c.cam) { const on = t > tFlash - 0.1 && t < S('right6').end + 1.5 && hash(Math.floor(t * 9) * 31 + i) > 0.82; c.cam.userData.fl.material.opacity = on ? 0.95 : 0; }
    c.arms.forEach((a, k) => { const clap = t > tApplause - 0.2 ? 1 : 0.3; a.rotation.z = (k ? -1 : 1) * (0.5 + clap * (0.9 + 0.35 * Math.sin(t * 16 + c.ph))); a.rotation.x = -0.6 * clap; });
    c.g.position.y = right && t > tApplause - 0.2 ? 0.08 * Math.abs(Math.sin(t * 8 + c.ph)) : 0; });
  crowd.children.forEach(o => { if (!o.isGroup) { o.scale.y = Math.max(0.001, pop); o.visible = pop > 0.001; } });
  // ---- sparkle when the carpet appears ----
  const sk = right ? t - (tRollsR + 0.6) : -1;
  SPARK.forEach(p => { const on = sk > 0 && sk < 1.6; p.s.visible = on; if (!on) return; const r = 1 + p.v * sk; p.s.position.set(Math.cos(p.a) * r * 0.7, RIcur.Yc + Math.sin(p.a) * r * 0.6 + 1, RIcur.zc + 1.5 + p.y); p.s.scale.setScalar(0.5 + 0.3 * Math.sin(sk * 20 + p.a)); p.s.material.opacity = 0.9 * (1 - sk / 1.6); });
  // ---- dust where the roll lifts the road ----
  DUST.forEach((d, i) => { const ph = (t * 0.7 + d.ph) % 1; const on = Math.abs(sc - (right ? scR(t + 0.1) : scW(t + 0.1))) > 0.05 && sc > 0.5; d.s.visible = on; if (!on) return; d.s.position.set(d.x, 0.4 + ph * 2.0, RIcur.zc + 1.5 + ph * 3); d.s.scale.setScalar(1.2 + ph * 2.5); d.s.material.opacity = 0.35 * Math.sin(PI * ph); });
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.updateProjectionMatrix();
  const shake = !right ? 0.5 * win(t, tRolls, tRolls + 0.6, 0.1) : 0.5 * win(t, tStops - 0.05, tStops + 0.35, 0.05);
  applyCam(c, t, shake > 0.02 ? 0.12 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { hero: project(hero.localToWorld(V3(0, 1.8, 0))), roll: project(V3(0, RIcur.Yc * 2 + 0.4, RIcur.zc)) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('EMPTY COUNTRY ROAD', '#2e7d32', tEmpty - 0.1, tThen - 0.2, 50);
    P_('THE ROAD AHEAD...', '#e65100', tThen - 0.1, tIts - 0.25, 54, iconWarn);
    P_('IT ROLLS UP', '#6d4c41', tIts - 0.1, tWall - 0.25, 58);
    P_('WALL OF ASPHALT', RED, tWall - 0.15, S('hook2').end + 0.3, 56, iconWarn);
    P_('FULL SPEED', RED, tFull - 0.15, tBigM - 0.15, 58, iconX);
    floatText('VROOOM!', W / 2, 780, t, tFull, tFull + 1.3, 110, YEL, -0.06);
    P_('ALREADY TOO BIG', RED, tAlready - 0.15, tUp - 0.25, 54, iconWarn);
    P_('LOOP THE LOOP', '#e65100', tRound - 0.2, S('wrong2').end + 0.2, 56);
    floatText('WHEEE!', W / 2 + 120, 700, t, tRound, tRound + 1.2, 120, YEL, 0.08);
    P_('ROLLED UP', RED, tRolls - 0.1, tSausage - 0.2, 58, iconX);
    P_('ROAD SAUSAGE ROLL', RED, tSausage - 0.15, tOff - 0.2, 52, iconX);
    P_('NEXT STOP: NEXT TOWN', RED, tOff - 0.1, tRew0, 50);
  } else {
    P_('STOP + ENGINE OFF', GREEN, tStop - 0.1, tLet - 0.15, 54, iconCheck);
    P_('LET IT COME TO YOU', GREEN, tLet - 0.15, tStops - 0.2, 52, iconCheck);
    floatText('BOOP!', W / 2, 760, t, tBoop - 0.05, tBoop + 0.9, 140, YEL, -0.06);
    P_('RIGHT AT YOUR BUMPER', GREEN, tStops - 0.15, S('right3').end + 0.2, 50, iconCheck);
    P_('ONE TINY NUDGE', GREEN, tNudge - 0.4, S('right4').end + 0.2, 54, iconCheck);
    floatText('TAP!', W / 2, 760, t, tTap - 0.05, tTap + 0.9, 140, YEL, 0.06);
    P_('RED CARPET', RED, tRed - 0.15, tFlash - 0.2, 60, iconHeart);
    floatText('FLASH!', W / 2 - 170, 700, t, tFlash, tFlash + 0.9, 110, '#fff', -0.08);
    floatText('CLAP CLAP!', W / 2 + 120, 860, t, tApplause, tApplause + 1.1, 96, YEL, 0.06);
    P_('MOVIE STAR', '#c2185b', tDriveR - 0.2, S('right6').end + 0.4, 58, iconHeart);
  }
}
window.dbg = { hero, rollInfo };
start(update, hud);
