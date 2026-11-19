// Episode 59: Blue-hour junction – the traffic light turns into a disco
// hook (old style): waiting at a red light -> it goes yellow, and green, all at the same time -> it starts to blink, music,
//        a mirror ball: the traffic light has turned into a disco
// wrong: honk until it stops -> it thinks you're cheering, volume up -> the bass makes your car bounce, higher and higher
//        -> you land on top of the traffic light, spinning: you're the new mirror ball
// right: every disco needs a light show: hazard lights on, blink to the beat (left, right, left) -> the other drivers join in,
//        headlights flashing, everybody swaying -> the light is so happy it gives everybody green at once
//        -> you all drive off together: one big conga line, once around the light, and out
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, roundedPath, pathAt,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s, _e, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI, DEG = PI / 180;
// ---------------- blue-hour look ----------------
scene.background = new THREE.Color('#3b5596'); scene.fog.color.set('#2c4174'); scene.fog.near = 70; scene.fog.far = 360;
hemi.color.set('#aebff0'); hemi.groundColor.set('#2f3552'); hemi.intensity = 1.2;

// ---------------- timing ----------------
const tRed = WT('hook1', 'red'), tThen1 = WT('hook1', 'Then'), tYellow = WT('hook1', 'yellow'), tGreen1 = WT('hook1', 'green'), tAll = WT('hook1', 'All');
const tThen2 = WT('hook2', 'Then'), tBlink = WT('hook2', 'blink'), tMusic = WT('hook2', 'Music'), tMirror = WT('hook2', 'mirror'), tTraffic = WT('hook2', 'traffic'), tDisco = WT('hook2', 'disco'), tWhat = WT('hook2', 'What');
const tHonk = WT('wrong1', 'honk'), tStops = WT('wrong1', 'stops');
const tBig = WT('wrong2', 'Big'), tThinks = WT('wrong2', 'thinks'), tCheer = WT('wrong2', 'cheering'), tVolume = WT('wrong2', 'Volume'), tBass = WT('wrong2', 'bass'), tBounce = WT('wrong2', 'bounce');
const tHigher1 = WT('wrong3', 'Higher'), tHigher2 = WT('wrong3', 'higher', 1), tUntil = WT('wrong3', 'Until'), tLand = WT('wrong3', 'land'), tSpin = WT('wrong3', 'Spinning'), tNewMirror = WT('wrong3', 'mirror');
const tEvery = WT('right2', 'Every'), tShow = WT('right2', 'show'), tHazard = WT('right2', 'Hazard');
const tBlinkR = WT('right3', 'Blink'), tL1 = WT('right3', 'Left'), tR1 = WT('right3', 'Right'), tL2 = WT('right3', 'Left', 1);
const tOther = WT('right4', 'other'), tJoin = WT('right4', 'join'), tHeadl = WT('right4', 'Headlights'), tSway = WT('right4', 'swaying'), tWhole = WT('right4', 'whole'), tDancing = WT('right4', 'dancing');
const tHappy = WT('right5', 'happy'), tGives = WT('right5', 'gives'), tGreenR = WT('right5', 'green'), tOnce = WT('right5', 'once');
const tDrive = WT('right6', 'drive'), tConga = WT('right6', 'conga'), tAround = WT('right6', 'around'), tOut = WT('right6', 'out');
const isRight = t => t >= tRew0 + 0.5;
// disco beat (matches the mixer's concert band: 118 bpm, starts 0.05 s before the cue word)
const CB = 60 / 118, C0 = tMusic - 0.05, C1 = tHazard - 0.05;
const beatPos = t => t >= C1 - 0.01 ? (t - C1) / CB : (t - C0) / CB;
const pulseAt = t => { const b = beatPos(t); if (b < 0) return 0; return Math.exp(-(b - Math.floor(b)) * 5); };

function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}

// ---------------- world: town junction ----------------
const RW = 4.5, LANE = 2.25, STOPZ = 7.6, HEAD_Y = 4.25, HEAD_TOP = 5.05;
plane(-500, 500, -500, 500, L('#56604f'), 0, 40);                       // dark grass far away
plane(-60, 60, -60, 60, L('#8b8e96'), 0.02, 14);                          // pavement
plane(-RW, RW, -500, 500, asphaltMat, 0.05, 7); plane(-500, 500, -RW, RW, asphaltMat, 0.05, 7); plane(-RW, RW, -RW, RW, asphaltMat, 0.055, 7);
{ const g = new THREE.PlaneGeometry(0.15, 2.6); g.rotateX(-PI / 2); const gh = new THREE.PlaneGeometry(2.6, 0.15); gh.rotateX(-PI / 2); const dl = [], dh = [];
  for (let s = 8.5; s < 300; s += 6) { dl.push([0, 0.075, s]); dl.push([0, 0.075, -s]); dh.push([s, 0.075, 0]); dh.push([-s, 0.075, 0]); }
  instanced(g, markMat, dl, false); instanced(gh, markMat, dh, false);
  const sl = new THREE.PlaneGeometry(RW, 0.42); sl.rotateX(-PI / 2); const sl2 = new THREE.PlaneGeometry(0.42, RW); sl2.rotateX(-PI / 2);
  instanced(sl, markMat, [[RW / 2, 0.076, 5.6], [-RW / 2, 0.076, -5.6]], false); instanced(sl2, markMat, [[5.6, 0.076, -RW / 2], [-5.6, 0.076, RW / 2]], false);
  // zebra crossings a bit further out
  const zb = new THREE.PlaneGeometry(0.5, 2.6); zb.rotateX(-PI / 2); const zb2 = new THREE.PlaneGeometry(2.6, 0.5); zb2.rotateX(-PI / 2); const z1 = [], z2 = [];
  for (let x = -3.9; x <= 3.9; x += 1.0) { z1.push([x, 0.076, 13.2]); z1.push([x, 0.076, -13.2]); z2.push([13.2, 0.076, x]); z2.push([-13.2, 0.076, x]); }
  instanced(zb, markMat, z1, false); instanced(zb2, markMat, z2, false); }
// kerbs
{ const k = L('#b6b8bd'); for (const s of [-1, 1]) for (const [a, b] of [[-500, -RW - 0.1], [RW + 0.1, 500]]) {
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, b - a), k); m1.position.set(s * (RW + 0.15), 0.08, (a + b) / 2); m1.receiveShadow = true; scene.add(m1);
  const m2 = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.16, 0.3), k); m2.position.set((a + b) / 2, 0.08, s * (RW + 0.15)); m2.receiveShadow = true; scene.add(m2); } }
// buildings with lit windows in the four corners
{ const R = rng(641); const winT = (seed) => canvasTex(128, 256, (c, w, h) => { const r = rng(seed); c.fillStyle = '#20232e'; c.fillRect(0, 0, w, h); for (let y = 12; y < h; y += 32) for (let x = 10; x < w; x += 30) { c.fillStyle = r() < 0.45 ? (r() < 0.5 ? '#ffd27a' : '#ffe9b5') : '#2d3650'; c.fillRect(x, y, 18, 20); } }, true);
  const cols = ['#8a7f92', '#6f8196', '#94826f', '#6b7590', '#7f876c', '#a07870'];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let k = 0; k < 7; k++) { // row along x and row along z
      for (const along of ['x', 'z']) {
        const w = 8 + R() * 4, d = 9 + R() * 3, h = 8 + R() * 14; const off = 12.5 + k * 11.5 + R() * 2, edge = 11.5 + (along === 'x' ? d : w) / 2;
        const x = along === 'x' ? sx * off : sx * edge, z = along === 'x' ? sz * edge : sz * off;
        if (along === 'z' && k === 0) continue;
        const t = winT(Math.floor(R() * 1e6)); t.repeat.set(Math.round((along === 'x' ? w : d) / 3), Math.round(h / 3)); t.needsUpdate = true;
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), L(cols[Math.floor(R() * cols.length)], { map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.5 }));
        b.position.set(x, h / 2, z); b.castShadow = true; b.receiveShadow = true; scene.add(b);
      } } } }
// street lamps on the corners
const lampHeadM = new THREE.MeshBasicMaterial({ color: '#ffd48a', toneMapped: false });
{ const pm = STD('#4a5260', { metalness: 0.6, roughness: 0.4 }); const pole = new THREE.CylinderGeometry(0.08, 0.11, 6.2, 8), head = new THREE.BoxGeometry(0.9, 0.16, 0.4);
  for (const [x, z] of [[-7.5, 22], [7.5, -22], [22, 7.5], [-22, -7.5], [7.5, 40], [-7.5, -40], [40, -7.5], [-40, 7.5]]) {
    const p = new THREE.Mesh(pole, pm); p.position.set(x, 3.1, z); p.castShadow = true; scene.add(p); const h = new THREE.Mesh(head, lampHeadM); h.position.set(x, 6.15, z); scene.add(h);
    const pl = new THREE.PointLight('#ffc77a', 30, 22, 1.6); pl.position.set(x, 5.8, z); scene.add(pl); } }
// stars
{ const g = new THREE.BufferGeometry(); const p = []; const R = rng(77); for (let i = 0; i < 500; i++) { const a = R() * PI * 2, e = 0.2 + R() * 1.3; p.push(Math.cos(a) * Math.cos(e) * 900, Math.sin(e) * 900, Math.sin(a) * Math.cos(e) * 900); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 2.0, sizeAttenuation: false, fog: false }))); }

// ---------------- the traffic light (central pedestal) ----------------
const TLg = new THREE.Group(); scene.add(TLg);           // pivot at the base (sways when happy)
const TLhead = new THREE.Group(); TLhead.position.y = HEAD_Y; TLg.add(TLhead);
{ const island = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.05, 0.18, 28), L('#c9c6bd')); island.position.y = 0.09; island.receiveShadow = true; scene.add(island);
  const stripes = canvasTex(256, 64, (c, w, h) => { for (let x = 0; x < w; x += 64) { c.fillStyle = '#f4f4f4'; c.fillRect(x, 0, 32, h); c.fillStyle = '#d62828'; c.fillRect(x + 32, 0, 32, h); } }, true); stripes.repeat.set(2, 1);
  const pm = STD('#3a3f4a', { metalness: 0.5, roughness: 0.45 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, HEAD_Y - 0.8, 12), pm); pole.position.y = (HEAD_Y - 0.8) / 2; pole.castShadow = true; TLg.add(pole);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.8, 16), STD('#ffffff', { map: stripes })); band.position.y = 1.0; TLg.add(band);
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.6, 0.95), STD('#2b2f37', { roughness: 0.6 })); housing.castShadow = true; TLhead.add(housing);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.1, 1.08), STD('#2b2f37')); cap.position.y = 0.82; TLhead.add(cap); }
const LAMP_Y = [0.5, 0, -0.5];   // red, yellow, green
const lamps = [];               // [face][k] = {m, glowM}
const FACES = [[0, 1], [1, 0], [0, -1], [-1, 0]];  // +z (hero), +x, -z, -x
FACES.forEach(([fx, fz], f) => { const row = [];
  const ry = Math.atan2(fx, fz);
  for (let k = 0; k < 3; k++) {
    const g = new THREE.Group(); g.rotation.y = ry; TLhead.add(g);
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.19, 28), new THREE.MeshBasicMaterial({ color: '#222', toneMapped: false })); m.position.set(0, LAMP_Y[k], 0.48); g.add(m);
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.22, 20, 1, true, PI / 2, PI), STD('#1d2026', { side: THREE.DoubleSide })); hood.rotation.x = PI / 2; hood.position.set(0, LAMP_Y[k] + 0.02, 0.58); g.add(hood);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.3, 28), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    halo.position.set(0, LAMP_Y[k], 0.5); halo.userData.noAO = true; g.add(halo); m.userData.noAO = true;
    row.push({ m, halo });
  } lamps.push(row); });
const headGlow = new THREE.PointLight('#ff3030', 10, 14, 1.6); headGlow.position.set(0, HEAD_Y, 1.6); scene.add(headGlow);
// mirror ball
const tileTex = canvasTex(512, 256, (c, w, h) => { const r = rng(9); for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { const v = 150 + r() * 105 | 0; const tint = r(); c.fillStyle = tint < 0.08 ? '#9fe8ff' : tint < 0.14 ? '#ffb3ec' : `rgb(${v},${v},${v + 8})`; c.fillRect(x + 1, y + 1, 14, 14); } }, true);
const ballM = STD('#ffffff', { map: tileTex, metalness: 0.9, roughness: 0.18, emissive: '#ffffff', emissiveMap: tileTex, emissiveIntensity: 0.5 });
const ballG = new THREE.Group(); scene.add(ballG);
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 20), ballM); ball.castShadow = true; ballG.add(ball);
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), STD('#bbb', { metalness: 0.8 })); rod.position.y = -0.62; ballG.add(rod);
// disco spotlights (rotating colour beams from the head)
const DCOL = ['#ff2fd0', '#2fe6ff', '#ffe82f', '#8a4dff', '#ff6a2f', '#39ff6a'];
const spots = [0, 1, 2, 3].map(i => { const s = new THREE.SpotLight(DCOL[i], 0, 34, 0.32, 0.6, 1.3); s.position.set(0, HEAD_TOP + 0.3, 0); scene.add(s); scene.add(s.target); return s; });
// mirror-ball light dots on the ground and walls
const NDOT = 420; const dotData = [];
{ const R = rng(31); for (let i = 0; i < NDOT; i++) dotData.push({ r: 1.6 + Math.pow(R(), 0.8) * 26, a: R() * PI * 2, s: 0.12 + R() * 0.16, c: DCOL[i % DCOL.length], ph: R() * 6 }); }
const dotM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
const dotGeo = new THREE.CircleGeometry(1, 14); dotGeo.rotateX(-PI / 2);
const dots = new THREE.InstancedMesh(dotGeo, dotM, NDOT); dots.frustumCulled = false; dots.userData.noAO = true; scene.add(dots);
dotData.forEach((d, i) => dots.setColorAt(i, _c.set(d.c)));

// ---------------- cars ----------------
const hero = makeCar('#ffb300');
const others = [makeCar('#e53935'), makeCar('#eceff1'), makeCar('#43a047')];
const cars = [hero, ...others];
const beamM = new THREE.MeshBasicMaterial({ color: '#fff2c4', transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide, fog: false });
cars.forEach(car => { const u = car.userData; const orig = u.hl; u.hl = orig.clone(); u.hl.emissiveIntensity = 1.2; u.bodyG.children.forEach(o => { if (o.material === orig) o.material = u.hl; });
  u.beams = [-1, 1].map(s => { const g = new THREE.ConeGeometry(1.5, 8, 18, 1, true); g.translate(0, -4, 0); g.rotateX(-PI / 2); g.rotateX(PI); const m = new THREE.Mesh(g, beamM); m.position.set(s * 0.6, 0.76, -2.15); m.rotation.x = -0.1; m.userData.noAO = true; m.renderOrder = 3; u.bodyG.add(m); return m; }); });
// mirror material for the hero (wrong ending): planar UVs on the shared body geometry
{ const g = hero.userData.bodyG.children[0].geometry, p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) * 0.7 + p.getZ(i)) / 1.6, p.getY(i) / 1.6); uv.needsUpdate = true; }
const carMirrorM = STD('#ffffff', { map: tileTex, metalness: 0.85, roughness: 0.2, emissive: '#ffffff', emissiveMap: tileTex, emissiveIntensity: 0.55 });
const heroBodyM = hero.userData.body;
const setMirror = on => { const want = on ? carMirrorM : heroBodyM; const bg = hero.userData.bodyG; if (bg.children[0].material === want) return; bg.children.forEach(o => { if (o.material === heroBodyM || o.material === carMirrorM) o.material = want; }); };
const blHaloM = { L: new THREE.MeshBasicMaterial({ color: '#ffa31a', transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), R: null };
blHaloM.R = blHaloM.L.clone();
for (const [side, s] of [['L', -1], ['R', 1]]) for (const [z, ry] of [[2.26, 0], [-2.22, PI]]) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.19, 20), blHaloM[side]); m.position.set(s * (z > 0 ? 0.78 : 0.82), z > 0 ? 0.86 : 0.78, z); m.rotation.y = ry; m.userData.noAO = true; m.renderOrder = 4; hero.userData.bodyG.add(m); }
const setBlink = (car, L_, R_) => { car.userData.bl.L.emissiveIntensity = L_ ? 3 : 0; car.userData.bl.R.emissiveIntensity = R_ ? 3 : 0; if (car === hero) { blHaloM.L.opacity = L_ ? 0.85 : 0; blHaloM.R.opacity = R_ ? 0.85 : 0; } };

// conga paths: hero config (south approach, x = +LANE heading -z) rotated by -90° steps -> east, north, west
const RC = 3.2;
function congaPath(phi) {
  const pts = [[LANE, STOPZ]]; const a0 = 22 * DEG;
  for (let k = 0; k <= 76; k++) { const th = a0 - k * 5 * DEG; pts.push([RC * Math.cos(th), RC * Math.sin(th)]); }
  pts.push([RC, -2.5]); pts.push([LANE, -9]); pts.push([LANE, -400]);
  const c = Math.cos(phi), s = Math.sin(phi);
  return roundedPath(pts.map(([x, z]) => [x * c - z * s, x * s + z * c]), 0.6);
}
const CPATH = [0, -PI / 2, -PI, PI / 2].map(congaPath);
const startPose = CPATH.map(P => pathAt(P, 0));
// distance along the conga path: accelerate from tDrive, cruise round the circle, speed up on the way out
const vC = t => t < tDrive - 0.2 ? 0 : t < tDrive + 1.0 ? 5.5 * ease((t - tDrive + 0.2) / 1.2) : t < tOut + 0.4 ? 5.5 : 5.5 + 4 * ease((t - tOut - 0.4) / 1.5);
const sTab = []; { let s = 0; for (let t = 0; t <= TOTAL + 1; t += 1 / 120) { sTab.push(s); s += vC(t) / 120; } }
const sC = t => { const k = clamp(t * 120, 0, sTab.length - 2), i = Math.floor(k); return lerp(sTab[i], sTab[i + 1], k - i); };

// ---------------- hero motion (wrong way) ----------------
const HSTART = { x: LANE, z: STOPZ + 0.0 };
const bounceAmp = mono([[0, 0], [tBass, 0], [tBounce, 0.25], [tBounce + 0.6, 0.45], [tHigher1, 1.4], [tHigher2, 2.8], [tUntil, 3.2]]);
function hop(t, amp) { const b = beatPos(t); const f = b - Math.floor(b); return amp * 4 * f * (1 - f); }   // one hop per beat
const tJump0 = tUntil - 0.05, tJump1 = tLand;

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
const camKeys = [
  [0.0, Ac([3.4, 2.3, 18.5], [0.6, 3.8, 0], 38)],
  [tThen1 - 0.3, Ac([3.1, 2.5, 16.5], [0.5, 3.9, 0], 38)],
  ...cut(tThen1 - 0.25, Ac([0.9, 4.2, 8.0], [0, 4.3, 0], 34)),
  [tThen2 + 0.6, Ac([0.6, 4.2, 7.0], [0, 4.4, 0], 34)],
  ...cut(tMusic - 0.15, Ac([-6.5, 8.0, 19], [0.6, 1.8, 0], 40)),
  [tMirror - 0.2, Ac([-6.0, 8.0, 18], [0.6, 2.0, 0], 40)],
  ...cut(tMirror - 0.15, Ac([1.4, 3.9, 8.6], [0, 5.0, 0], 34)),
  [tTraffic - 0.25, Ac([1.2, 4.0, 9.4], [0, 4.9, 0], 34)],
  ...cut(tTraffic - 0.2, Ac([6.0, 3.0, 17.0], [0.6, 3.4, 0], 40)),
  [S('hook2').end + 0.4, Ac([5.2, 3.3, 19.5], [0.6, 3.0, 0], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([8.6, 3.0, 0.4], [1.6, 1.7, 8.4], 38)),
  [tStops + 0.3, Ac([8.0, 3.0, 0.9], [1.6, 1.7, 8.4], 38)],
  ...cut(tBig - 0.15, Ac([1.3, 4.0, 10.0], [0, 4.7, 0], 36)),
  [tVolume - 0.2, Ac([1.1, 4.1, 9.2], [0, 4.8, 0], 36)],
  [tBass - 0.4, Ac([0.9, 4.2, 8.4], [0, 4.85, 0], 36)],
  ...cut(tBass - 0.35, Ac([10.0, 2.4, 13.0], [2.25, 1.4, 8.0], 40)),
  [tHigher1 - 0.25, Ac([10.5, 2.8, 13.5], [2.25, 1.8, 8.0], 40)],
  ...cut(tHigher1 - 0.2, Ac([4.6, 3.6, 24.5], [1.3, 3.6, 3.0], 40)),
  [tLand + 0.4, Ac([4.2, 3.4, 22.0], [0.4, 5.0, 0.5], 40)],
  ...cut(tSpin - 0.25, Ac([7.0, 7.4, 11.5], [0, 5.7, 0], 40)),
  [tNewMirror - 0.2, Ac([6.4, 7.6, 10.5], [0, 5.7, 0], 40)],
  [tRew0, Ac([7.5, 9.0, 13.5], [0, 5.4, 0], 40)],
  // right
  ...cut(tRew1, Ac([3.4, 2.4, 17.5], [0.8, 3.0, 0], 38)),
  [tHazard - 0.3, Ac([3.2, 2.3, 16.5], [1.4, 2.4, 3], 38)],
  ...cut(tHazard - 0.25, Ac([3.0, 2.5, 17.0], [2.25, 1.2, 8.6], 36)),
  [tL1 - 0.3, Ac([2.8, 2.4, 16.4], [2.25, 1.15, 8.6], 36)],
  [tL2 + 0.5, Ac([2.6, 2.4, 16.0], [2.25, 1.15, 8.6], 36)],
  ...cut(tOther - 0.15, Ac([0.5, 29, 23], [0, 0, -0.8], 40)),
  [tHappy - 0.6, Ac([-0.5, 27, 22], [0, 0, -0.8], 40)],
  ...cut(tHappy - 0.55, Ac([0.8, 4.0, 6.2], [0, 4.35, 0], 36)),
  [tGreenR - 0.3, Ac([0.6, 4.0, 5.6], [0, 4.35, 0], 36)],
  [tOnce + 0.3, Ac([1.2, 4.6, 7.4], [0, 4.1, 0], 38)],
  ...cut(tDrive - 0.35, Ac([0.5, 28, 21], [0, 0, -0.8], 40)),
  [tAround + 0.2, Ac([1.0, 26, 18], [0, 0, -2.0], 40)],
  ...cut(tOut - 0.1, HeroCam([1.5, 4.2, 12.5], [-0.3, 1.8, -6], 40)),
  [S('right7').start, HeroCam([1.5, 5.0, 13.5], [-0.3, 2.2, -6], 40)],
  [TOTAL, HeroCam([1.5, 7.0, 16.0], [-0.3, 3.5, -8], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const OFF = new THREE.Color('#1c1c20'), TC = [new THREE.Color('#ff2a1a'), new THREE.Color('#ffc21a'), new THREE.Color('#22ff5a')];
const DC = DCOL.map(c => new THREE.Color(c));
let ballOff = null;
function update(t) {
  const right = isRight(t);
  const disco = t >= tBlink;
  const pulse = disco ? pulseAt(t) : 0;
  const bp = beatPos(t), bi = Math.floor(bp);
  const happy = right ? win(t, tHappy - 0.2, tDrive, 0.3) : 0;
  const allGreen = right && t >= tGreenR - 0.05;
  const loud = !right ? ramp(t, tVolume - 0.1, tVolume + 0.4) : 0;
  // ---- traffic light lamps ----
  let glowCol = TC[0].clone(), glowI = 10;
  lamps.forEach((row, f) => row.forEach((L_, k) => {
    let on = 0, col = TC[k];
    if (!disco) { on = k === 0 ? 1 : (k === 1 ? (t >= tYellow - 0.05 ? 1 : 0) : (t >= tGreen1 - 0.05 ? 1 : 0)); }
    else if (allGreen) { col = TC[2]; on = 0.75 + 0.25 * pulse; }
    else if (t < C0) { on = (Math.floor(t * 9) + k + f) % 2 ? 1 : 0.15; col = DC[(k + f * 2 + Math.floor(t * 9)) % DC.length]; }
    else { const idx = (bi + k + f * 2) % DC.length; col = DC[idx]; on = ((bi + k + f) % 3 === 0) ? 1 : 0.35 + 0.65 * pulse; }
    L_.m.material.color.copy(OFF).lerp(col, on);
    L_.halo.material.color.copy(col); L_.halo.material.opacity = on * (disco ? 0.14 + 0.18 * loud : 0.1);
    L_.halo.scale.setScalar(1 + 0.2 * pulse * (disco ? 1 : 0) + 0.3 * loud * pulse);
    if (f === 0 && on > 0.5) glowCol.copy(col);
  }));
  headGlow.color.copy(glowCol); headGlow.intensity = disco ? 14 + 10 * pulse : 8;
  // head: bob to the beat; happy wiggle; louder = bigger
  const bob = disco ? 0.035 * Math.sin(bp * PI) : 0;
  TLg.rotation.z = (disco ? 0.025 * Math.sin(bp * PI) : 0) + happy * 0.07 * Math.sin(t * 7);
  TLg.rotation.x = happy * 0.04 * Math.sin(t * 5 + 1);
  TLhead.scale.setScalar(1 + 0.06 * pulse * (disco ? 1 : 0) + 0.12 * loud * pulse);
  TLhead.position.y = HEAD_Y + bob;
  TLg.updateMatrixWorld(true);
  // ---- mirror ball ----
  const ballRise = easeOut(clamp((t - tMirror + 0.1) / 0.7));
  const knocked = !right && t > tLand - 0.02;
  if (!knocked) {
    const top = TLhead.localToWorld(V3(0, 0.85, 0));
    ballG.position.set(top.x, top.y - 0.6 + ballRise * 1.25, top.z); ballG.scale.setScalar(Math.max(0.001, ballRise)); ballG.rotation.set(0, t * 1.4, 0);
    ballG.visible = ballRise > 0.001;
  } else { const u = t - tLand; ballG.visible = u < 1.6; ballG.position.set(0.6 + 7 * u, HEAD_TOP + 0.7 + 4.5 * u - 6 * u * u, -1.5 - 3 * u); ballG.rotation.set(u * 9, u * 6, 0); ballG.scale.setScalar(1); }
  // ---- disco spots + dots ----
  const dA = disco ? ramp(t, tBlink, tMusic + 0.2) : 0;
  const mirrorCar = !right && t > tNewMirror - 0.05;
  const spin = t * (0.45 + 0.6 * loud) + (mirrorCar ? (t - tNewMirror) * 0.8 : 0);
  spots.forEach((s, i) => { const a = spin * 1.6 + i * PI / 2; s.intensity = dA * (55 + 30 * pulse); s.color.set(DCOL[(i + Math.floor(bp / 4) * 2) % DCOL.length]);
    s.target.position.set(Math.cos(a) * 8, 0, Math.sin(a) * 8); s.target.updateMatrixWorld(); });
  dotM.opacity = 0.85 * dA * (allGreen ? 0.85 : 1);
  dotData.forEach((d, i) => { const a = d.a + spin * (d.r < 8 ? 1 : 0.8); const sc = d.s * (1 + 0.5 * pulse) * (dA > 0 ? 1 : 0.0001) * (mirrorCar ? 1.3 : 1);
    _m.compose(_v.set(Math.cos(a) * d.r, 0.1, Math.sin(a) * d.r), _q.identity(), _s.set(sc, 1, sc)); dots.setMatrixAt(i, _m);
    if (allGreen) dots.setColorAt(i, _c.set(i % 3 ? '#39ff6a' : '#b6ffcb')); else dots.setColorAt(i, _c.set(d.c)); });
  dots.instanceMatrix.needsUpdate = true; dots.instanceColor.needsUpdate = true;
  // ---- cars ----
  const sway = right ? win(t, tJoin - 0.2, tDrive + 0.3, 0.3) : 0;
  const othersHop = !right ? ramp(t, tBass - 0.2, tBounce) * 0.14 : 0;
  // others
  others.forEach((car, j) => { const k = j + 1; const u = car.userData;
    let p;
    if (right && t > tDrive - 0.3) p = pathAt(CPATH[k], sC(t)); else p = { ...startPose[k] };
    p.y = othersHop > 0 ? hop(t + 0.07 * k, othersHop) : 0; p.pitch = 0; p.roll = sway * 0.07 * Math.sin(bp * PI + k);
    placeCar(car, p);
    const flash = right && t > tHeadl - 0.1 && t < tDrive ? ((bi + k) % 2 ? 1 : 0.1) : 1;
    u.hl.emissiveIntensity = 1.2 * flash;
    const hz = right && t > tJoin - 0.1 && t < tGreenR ? (bp - bi < 0.5) : false; setBlink(car, hz, hz);
  });
  // hero
  let hp = { x: HSTART.x, z: HSTART.z, h: 0, y: 0, pitch: 0, roll: 0 };
  setMirror(false);
  if (!right) {
    if (t < tJump0) { hp.y = hop(t, bounceAmp(t)); const b = beatPos(t), f = b - Math.floor(b); hp.pitch = -0.06 * Math.sin(f * 2 * PI) * clamp(bounceAmp(t)); hp.roll = 0.05 * Math.sin(b * PI) * clamp(bounceAmp(t) / 2);
      if (t > tHonk - 0.05 && t < tStops + 0.3) hp.pitch = 0.015 * Math.sin(t * 40); }
    else if (t < tJump1) { const u = (t - tJump0) / (tJump1 - tJump0), e = u;
      hp.x = lerp(HSTART.x, 0, e); hp.z = lerp(HSTART.z, 0, e); hp.y = lerp(0, HEAD_TOP, e) + 4.2 * 4 * u * (1 - u); hp.pitch = -2 * PI * ease(u); hp.h = 0.6 * ease(u); }
    else { const u = t - tJump1; hp.x = 0; hp.z = 0; hp.y = HEAD_TOP + 0.02 + 0.12 * Math.exp(-u * 6) * Math.abs(Math.sin(u * 20)); hp.h = 0.6 + 0.8 * u + 2.2 * Math.max(0, u - 0.9) ** 1.4; hp.pitch = 0; hp.roll = 0; }
    setMirror(mirrorCar);
  } else {
    if (t > tDrive - 0.3) { const p = pathAt(CPATH[0], sC(t)); hp.x = p.x; hp.z = p.z; hp.h = p.h; }
    hp.roll = sway * 0.07 * Math.sin(bp * PI);
  }
  placeCar(hero, hp); if (!right && t >= tJump0) hero.userData.prev = null;
  hero.userData.beams.forEach(b => b.visible = !(!right && t > tJump0));
  // hero blinkers: hazards on the beat, then left / right / left
  let hl_ = false, hr_ = false;
  if (right && t > tHazard - 0.05) { const on = bp - bi < 0.5; hl_ = hr_ = on;
    if (t > tL1 - 0.08 && t < tL2 + 0.55) { hl_ = (t < tR1 - 0.08) || (t > tL2 - 0.08); hr_ = t > tR1 - 0.08 && t < tL2 - 0.08; }
    if (t > tGreenR) { hl_ = hr_ = false; } }
  setBlink(hero, hl_, hr_);
  hero.userData.hl.emissiveIntensity = right && t > tHeadl - 0.1 && t < tDrive ? ((bi % 2) ? 1.2 : 0.15) : 1.2;
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(0.5 * win(t, tLand - 0.05, tLand + 0.35, 0.05), 0.25 * pulse * ramp(t, tVolume, tBass) * (t < tHigher1 ? 1 : 0)) : 0;
  applyCam(c, t, shake > 0.02 ? 0.06 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { head: project(TLhead.localToWorld(V3(0, 1.2, 0))), hero: project(hero.localToWorld(V3(0, 2.0, 0))), heroR: project(hero.localToWorld(V3(0, 1.0, 2.4))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hearts(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 3; k++) { const u = ((t - a) * 0.9 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - u) * win(t, a, b, 0.2); iconHeart(clamp(p.x, 200, W - 200) + (k - 1) * 120, clamp(p.y, 560, 1100) - 40 - u * 200, 36, '#ff4f9a'); ctx.restore(); } }
function notes(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; ctx.save(); ctx.font = '900 80px Inter'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for (let k = 0; k < 4; k++) { const u = ((t - a) * 0.7 + k / 4) % 1; const x = clamp(p.x, 160, W - 160) + Math.sin(k * 2.3 + u * 4) * 170 + (k - 1.5) * 60, y = clamp(p.y, 560, 1080) - u * 260;
    ctx.globalAlpha = Math.sin(PI * u) * win(t, a, b, 0.2); ctx.lineWidth = 12; ctx.strokeStyle = '#000'; ctx.strokeText(k % 2 ? '♪' : '♫', x, y); ctx.fillStyle = DCOL[k % DCOL.length]; ctx.fillText(k % 2 ? '♪' : '♫', x, y); } ctx.restore(); }
function volBars(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2), p = pulseAt(t); ctx.save(); ctx.globalAlpha = f;
  for (let k = 0; k < 10; k++) { const h = 30 + k * 14, on = k < 4 + 6 * ramp(t, a, a + 0.8); ctx.fillStyle = on ? (k > 7 ? RED : k > 5 ? YEL : '#39ff6a') : 'rgba(255,255,255,0.25)'; rr(W / 2 - 300 + k * 62, 610 - h * (1 + 0.15 * p), 44, h * (1 + 0.15 * p), 8); ctx.fill(); } ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('RED LIGHT', RED, tRed - 0.1, tThen1 - 0.2, 56);
    floatText('YELLOW?', W / 2 - 170, 760, t, tYellow - 0.05, tAll - 0.1, 96, '#ffc21a', -0.08);
    floatText('GREEN?!', W / 2 + 170, 900, t, tGreen1 - 0.05, tAll - 0.1, 96, '#39ff6a', 0.08);
    P_('ALL AT ONCE?!', '#e65100', tAll - 0.1, tBlink - 0.15, 56, iconWarn);
    floatText('BLINK!', W / 2, 720, t, tBlink - 0.05, tMusic + 0.2, 120, '#ff2fd0', -0.08);
    notes(t, tMusic, tMirror + 0.2, { x: W / 2, y: 900, ok: true });
    P_('MIRROR BALL', '#8e24aa', tMirror - 0.05, tTraffic - 0.2, 54);
    P_('TRAFFIC LIGHT: DISCO MODE', '#8e24aa', tDisco - 0.25, S('hook2').end + 0.3, 46);
    P_('HONK UNTIL IT STOPS', RED, tHonk - 0.15, tStops + 0.5, 50, iconX);
    floatText('HONK!', W / 2 + 160, 760, t, tHonk, tHonk + 0.7, 110, YEL, 0.08);
    floatText('HONK!', W / 2 - 170, 880, t, tHonk + 0.45, tHonk + 1.2, 110, YEL, -0.08);
    P_("IT THINKS YOU'RE CHEERING", '#8e24aa', tThinks - 0.1, tVolume - 0.2, 44);
    P_('VOLUME: MAX', RED, tVolume - 0.1, tBass - 0.2, 56);
    volBars(t, tVolume - 0.05, tBass - 0.2);
    P_('BASS: WAY TOO STRONG', RED, tBass - 0.1, tHigher1 - 0.2, 48, iconWarn);
    floatText('BOING!', W / 2 + 190, 700, t, tBounce, tBounce + 0.7, 100, YEL, 0.1);
    floatText('BOING!', W / 2 - 150, 640, t, tHigher1, tHigher1 + 0.6, 110, YEL, -0.1);
    floatText('BOING!!', W / 2 + 120, 560, t, tHigher2, tHigher2 + 0.6, 120, YEL, 0.1);
    P_('LANDED ON TOP', RED, tLand - 0.05, tSpin - 0.15, 54, iconX);
    P_('YOU = NEW MIRROR BALL', RED, tNewMirror - 0.15, tRew0, 50, iconX);
  } else {
    P_('EVERY DISCO NEEDS A LIGHT SHOW', '#8e24aa', tEvery - 0.1, tHazard - 0.2, 40);
    P_('HAZARD LIGHTS ON', GREEN, tHazard - 0.1, tBlinkR - 0.15, 54, iconCheck);
    P_('BLINK TO THE BEAT', GREEN, tBlinkR - 0.1, S('right3').end + 0.3, 54, iconCheck);
    floatText('LEFT!', W / 2 - 200, 820, t, tL1 - 0.05, tL1 + 0.5, 110, '#ffa000', -0.08);
    floatText('RIGHT!', W / 2 + 200, 820, t, tR1 - 0.05, tR1 + 0.5, 110, '#ffa000', 0.08);
    floatText('LEFT!', W / 2 - 200, 820, t, tL2 - 0.05, tL2 + 0.6, 110, '#ffa000', -0.08);
    P_('EVERYBODY JOINS IN', '#8e24aa', tJoin - 0.2, tWhole - 0.2, 50);
    P_('JUNCTION: DANCING', '#8e24aa', tWhole - 0.1, S('right4').end + 0.3, 54);
    notes(t, tWhole - 0.2, S('right4').end + 0.3, { x: W / 2, y: 980, ok: true });
    P_('SO HAPPY', '#d81b60', tHappy - 0.15, tGreenR - 0.2, 56, iconHeart);
    hearts(t, tHappy, tOnce + 0.5, screen.head);
    floatText('ALL GREEN!', W / 2, 760, t, tGreenR - 0.1, tOnce + 0.7, 120, '#39ff6a', -0.06);
    P_('ONE BIG CONGA LINE', GREEN, tConga - 0.25, tOut + 0.2, 52, iconCheck);
  }
}
window.dbg = { hero, cars, TLg, lamps };
start(update, hud);
