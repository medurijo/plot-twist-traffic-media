// Episode 57: Country road – a tornado takes the car in front of you
// hook (old style): country road, sunny afternoon, just a little breeze -> the breeze becomes a tornado, takes the red car in front
//        and spins it right above your head
// wrong: floor it and get out of here -> tornadoes love fast cars: it turns around and sucks you up too -> spinning with the red car,
//        a cow, a caravan and a garden gnome -> spits you out right onto a windmill -> still spinning
// right: pull over into the field, the tornado spins one way, you drive circles the other way -> round and round, faster -> the tornado
//        gets dizzy, wobbles, puts the red car back down right side up -> shrinks to a tiny breeze, blows the dust off your car
//        -> from above: your tyre tracks are the best crop circle in the country
import { mergeGeometries as mergeGeo } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s, _e
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tCountry = WT('hook1', 'Country'), tSunny = WT('hook1', 'Sunny'), tJust = WT('hook1', 'Just'), tBreeze = WT('hook1', 'breeze');
const tThen = WT('hook2', 'Then'), tBecomes = WT('hook2', 'becomes'), tTornado = WT('hook2', 'tornado'), tTakes = WT('hook2', 'takes'), tFront = WT('hook2', 'front');
const tSpins = WT('hook2', 'spins'), tAbove = WT('hook2', 'above'), tHead = WT('hook2', 'head'), tWhat = WT('hook2', 'What');
const tFloor = WT('wrong1', 'floor'), tGet = WT('wrong1', 'get'), tHere = WT('wrong1', 'here');
const tBig = WT('wrong2', 'Big'), tTornadoes = WT('wrong2', 'Tornadoes'), tLove = WT('wrong2', 'love'), tFast = WT('wrong2', 'fast'), tTurns = WT('wrong2', 'turns'), tSucks = WT('wrong2', 'sucks');
const tNow = WT('wrong3', 'Now'), tRedCar = WT('wrong3', 'red'), tCow = WT('wrong3', 'cow'), tCaravan = WT('wrong3', 'caravan'), tGnome = WT('wrong3', 'garden');
const tUntil = WT('wrong3', 'Until'), tSpits = WT('wrong3', 'spits'), tOnto = WT('wrong3', 'Right'), tWindmill = WT('wrong3', 'windmill'), tStill = WT('wrong3', 'still');
const tPull = WT('right2', 'Pull'), tField = WT('right2', 'field'), tTorn2 = WT('right2', 'tornado'), tOneWay = WT('right2', 'one'), tSo = WT('right2', 'So'), tCircles = WT('right2', 'circles'), tOther = WT('right2', 'other');
const tRound = WT('right3', 'Round'), tFaster = WT('right3', 'Faster');
const tDizzy = WT('right4', 'dizzy'), tWobbles = WT('right4', 'wobbles'), tGently = WT('right4', 'gently'), tDown = WT('right4', 'down'), tRightUp = WT('right4', 'Right');
const tShrinks = WT('right5', 'shrinks'), tTiny = WT('right5', 'tiny'), tBlows = WT('right5', 'blows'), tDust = WT('right5', 'dust');
const tAboveR = WT('right6', 'above'), tTracks = WT('right6', 'tracks'), tBest = WT('right6', 'best'), tCrop = WT('right6', 'crop');
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
function makePath(pts, n = 400) {
  const cr = (a, b, c, d, u) => { const u2 = u * u, u3 = u2 * u; return 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3); };
  const P = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n / pts.length; k++) { const u = k / (n / pts.length); P.push([cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u)]); } }
  P.push(pts[pts.length - 1]); const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const len = cum[cum.length - 1];
  const at = s => { s = clamp(s, 0, len); let lo = 0, hi = P.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    const u = (s - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]); const x = lerp(P[lo][0], P[hi][0], u), z = lerp(P[lo][1], P[hi][1], u);
    const dx = P[hi][0] - P[lo][0], dz = P[hi][1] - P[lo][1]; return { x, z, h: Math.atan2(-dx, -dz) }; };
  return { at, len, P, cum };
}

// ---------------- layout ----------------
const LANE = 1.75;
const HERO_STOP = -12, RED_STOP = -26;
const TOR0 = V3(14, 0, -42), TORH = V3(LANE, 0, -31);      // touchdown spot, spot on the road
const C = { x: 17, z: -20 }, R0 = 8.5, RA = 1.5;            // crop circle centre / radius / petal amplitude
const WM = V3(-30, 0, 62);                                   // windmill
const FX0 = 4.6, FX1 = 64.6, FZ0 = -64, FZ1 = 12;            // wheat field
const SKY_SUN = new THREE.Color('#8fc8ff'), SKY_STORM = new THREE.Color('#7b8a8f');

// ---------------- world ----------------
makeLandscape({ avoid: (x, z) => (x > -9 && x < 70 && z > -75 && z < 20) || Math.abs(x) < 9 || (x > -22 && x < 0 && z > -70 && z < 60) || (Math.hypot(x - WM.x, z - WM.z) < 12),
  fieldAvoid: (x, z, w, d) => (x + w / 2 > -12 && x - w / 2 < 72 && z + d / 2 > -80 && z - d / 2 < 24) || Math.abs(x) - w / 2 < 10, near: [-40, -40, 60, 200], trees: 1300, seed: 5701 });
plane(-3.6, 3.6, -900, 400, asphaltMat, 0.05, 7);
{ const g = new THREE.PlaneGeometry(0.15, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -898; z < 398; z += 8) dl.push([0, 0.075, z]); instanced(g, markMat, dl, false);
  const e = new THREE.PlaneGeometry(0.15, 1300); e.rotateX(-Math.PI / 2); instanced(e, markMat, [[-3.3, 0.075, -250], [3.3, 0.075, -250]], false); }
// verge posts
{ const pg = new THREE.BoxGeometry(0.14, 1.0, 0.14); const pl = []; for (let z = -400; z < 300; z += 25) { if (z > -60 && z < 20) continue; pl.push([-4.3, 0.5, z], [4.3, 0.5, z + 12]); } instanced(pg, L('#f2f2f2'), pl); }

// wheat field with a live crop-circle texture
const fieldCv = document.createElement('canvas'); fieldCv.width = 2048; fieldCv.height = 2048; const fctx = fieldCv.getContext('2d');
const baseCv = document.createElement('canvas'); baseCv.width = 2048; baseCv.height = 2048;
{ const b = baseCv.getContext('2d'); b.fillStyle = '#d9a83c'; b.fillRect(0, 0, 2048, 2048); const R = rng(91);
  for (let i = 0; i < 60000; i++) { const v = R(); b.fillStyle = v < 0.33 ? '#c99630' : v < 0.66 ? '#e6bb4e' : '#b8892b'; b.fillRect(R() * 2048, R() * 2048, 3 + R() * 5, 2 + R() * 3); }
  for (let y = 0; y < 2048; y += 26) { b.fillStyle = 'rgba(120,80,20,0.13)'; b.fillRect(0, y, 2048, 6); } }
const fieldTex = new THREE.CanvasTexture(fieldCv); fieldTex.colorSpace = THREE.SRGBColorSpace; fieldTex.anisotropy = 8;
const FW = FX1 - FX0, FD = FZ1 - FZ0;
{ const g = new THREE.PlaneGeometry(FW, FD); g.rotateX(-Math.PI / 2); const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) { const x = p.getX(i) + (FX0 + FX1) / 2, z = p.getZ(i) + (FZ0 + FZ1) / 2; uv.setXY(i, (x - FX0) / FW, 1 - (z - FZ0) / FD); }
  const m = new THREE.Mesh(g, L('#ffffff', { map: fieldTex })); m.position.set((FX0 + FX1) / 2, 0.06, (FZ0 + FZ1) / 2); m.receiveShadow = true; scene.add(m); }
const fpx = (x, z) => [(x - FX0) / FW * 2048, (z - FZ0) / FD * 2048];
// rosette (the car's circles): clockwise seen from above, spiralling in
const PHI = Math.PI * 2 * 4.0;
const rose = u => { const ph = Math.PI + u * PHI; const r = R0 * (1 - 0.86 * u) + RA * (1 - 0.7 * u) * Math.sin(5 * ph) * Math.min(1, u * 12); return { x: C.x + r * Math.cos(ph), z: C.z + r * Math.sin(ph) }; };
const ROSE_N = 2400; const ROSE = Array.from({ length: ROSE_N + 1 }, (_, i) => rose(i / ROSE_N));
let lastField = -1;
function drawField(u) {
  const k = Math.round(u * ROSE_N); if (k === lastField) return; lastField = k;
  fctx.drawImage(baseCv, 0, 0);
  if (k > 1) {
    fctx.lineCap = 'round'; fctx.lineJoin = 'round';
    const pass = (w, col) => { fctx.strokeStyle = col; fctx.lineWidth = w; fctx.beginPath(); for (let i = 0; i <= k; i++) { const [x, y] = fpx(ROSE[i].x, ROSE[i].z); i ? fctx.lineTo(x, y) : fctx.moveTo(x, y); } fctx.stroke(); };
    pass(2.6 / FW * 2048, '#a37a2a'); pass(2.2 / FW * 2048, '#f2d98c');
    pass(0.25 / FW * 2048, 'rgba(150,110,40,0.55)');
  }
  fieldTex.needsUpdate = true;
}
drawField(0);
// wheat tufts (not inside the crop circle / entry lane)
const tufts = [];
{ const R = rng(57); for (let i = 0; i < 6500; i++) { const x = FX0 + 0.8 + R() * (FW - 1.6), z = FZ0 + 0.8 + R() * (FD - 1.6);
    if (Math.hypot(x - C.x, z - C.z) < R0 + RA + 2.2) continue; if (x < 12 && z > -22 && z < -6) continue; tufts.push([x, 0, z, R() * 6, 0.9 + R() * 0.5, 0.7 + R() * 0.6, 0.9 + R() * 0.5]); }
  const parts = []; const R2 = rng(8); for (let k = 0; k < 6; k++) { const c = new THREE.ConeGeometry(0.04, 0.95 + R2() * 0.25, 3); c.translate(0, 0.5, 0); c.rotateZ((R2() - 0.5) * 0.35); c.rotateX((R2() - 0.5) * 0.35); const ox = (R2() - 0.5) * 0.5, oz = (R2() - 0.5) * 0.5; c.translate(ox, 0, oz); parts.push(c);
    const e = new THREE.SphereGeometry(0.065, 4, 3); e.scale(1, 2.6, 1); e.translate(ox * 1.1, 1.08, oz * 1.1); parts.push(e); }
  const g = mergeGeo(parts); const m = instanced(g, L('#ffffff', { flatShading: true }), tufts);
  const cols = ['#d6a23a', '#e4b74b', '#c8922c', '#eac25a']; tufts.forEach((_, i) => m.setColorAt(i, new THREE.Color(cols[i % 4]))); m.castShadow = false; }

// ---------------- windmill ----------------
const mill = new THREE.Group(); mill.position.copy(WM); scene.add(mill);
const millYaw = Math.atan2(-(8 - WM.z), (6 - WM.x)); mill.rotation.y = millYaw; // local +x faces the road / camera side
const sails = new THREE.Group(); sails.position.set(3.1, 13.2, 0); mill.add(sails);
{ const tw = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.9, 13, 8), L('#efe5d2')); tw.position.y = 6.5; mill.add(tw);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 1.3), L('#5b3a22')); door.position.set(3.75, 1.1, 0); mill.add(door);
  for (const [y, a] of [[5, 0.3], [9, -0.4]]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.8), L('#3b4d66')); w.position.set(3.4 - (y - 5) * 0.1, y, a); mill.add(w); }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(3.3, 3.8, 8), L('#7a4a2c')); cap.position.y = 14.6; mill.add(cap);
  const capB = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 1.2, 8), L('#8a5a36')); capB.position.y = 13.1; mill.add(capB);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.2, 10), L('#5b3a22')); axle.rotation.z = Math.PI / 2; axle.position.set(2.2, 13.2, 0); mill.add(axle);
  const latT = canvasTex(128, 512, (c, w, h) => { c.fillStyle = '#f4ead6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7a5532'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.lineWidth = 5; for (let y = 0; y < h; y += 46) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); });
  for (let k = 0; k < 4; k++) { const b = new THREE.Group(); b.rotation.x = k * Math.PI / 2; sails.add(b);
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 11.5, 0.3), L('#6b4426')); sp.position.y = 5.75; b.add(sp);
    const sl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 9.0, 2.3), L('#ffffff', { map: latT })); sl.position.set(0.05, 6.6, 1.2); b.add(sl); }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), L('#5b3a22')); sails.add(hub);
  mill.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const millAng = t => -0.55 * t;   // sails turn steadily
const STUCK = new THREE.Matrix4().makeBasis(V3(0, 0, -1), V3(1, 0, 0), V3(0, -1, 0)).setPosition(1.05, 7.4, 1.1); // car glued to blade 0, roof to the camera

// ---------------- cars ----------------
const hero = makeCar('#1e88e5');
const heroCol = new THREE.Color('#1e88e5'), dustCol = new THREE.Color('#6e5530');
const redCar = makeCar('#e53935');

// ---------------- tornado ----------------
const TH = 72;
const rFun = y => 2.0 + 0.11 * y + 0.0062 * y * y;
const tor = new THREE.Group(); scene.add(tor);            // root: position + uniform scale
const torLean = new THREE.Group(); tor.add(torLean);      // wobble / lean
const funnelT = (seed, a0) => { const t = canvasTex(512, 512, (c, w, h) => { const R = rng(seed); c.clearRect(0, 0, w, h);
  for (let i = 0; i < 520; i++) { const y = R() * h, x = R() * w, len = 80 + R() * 260, th = 3 + R() * 14, v = 150 + R() * 90 | 0;
    c.strokeStyle = `rgba(${v},${v - 4},${v - 10},${a0 * (0.25 + R() * 0.75)})`; c.lineWidth = th; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + len / 2, y - len * 0.08, x + len, y - len * 0.22); c.stroke();
    if (x + len > w) { c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w + len / 2, y - len * 0.08, x - w + len, y - len * 0.22); c.stroke(); } } }, true); t.repeat.set(3, 2.5); return t; };
function funnelGeo(scale) {
  const pts = []; for (let i = 0; i <= 40; i++) { const y = TH * i / 40; pts.push(new THREE.Vector2(rFun(y) * scale, y)); }
  const g = new THREE.LatheGeometry(pts, 48); const col = []; const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / TH; const c = new THREE.Color('#b09a7a').lerp(new THREE.Color('#c3cacf'), Math.min(1, y * 2.2)); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return g;
}
const layers = [[1.0, 0.8, 11, 1.0], [0.8, 0.9, 23, 1.35], [0.58, 1.0, 37, 1.8]].map(([sc, a, seed, spd], i) => {
  const mat = new THREE.MeshLambertMaterial({ map: funnelT(seed, a), vertexColors: true, transparent: true, opacity: [0.55, 0.6, 0.75][i], depthWrite: false, side: THREE.DoubleSide, fog: true });
  const m = new THREE.Mesh(funnelGeo(sc), mat); m.userData.noAO = true; m.renderOrder = 4 - i; torLean.add(m); return { m, mat, spd }; });
// solid-ish core so it reads as a column
const coreM = new THREE.MeshLambertMaterial({ color: '#8a8278', transparent: true, opacity: 0.35, depthWrite: false });
const core = new THREE.Mesh(funnelGeo(0.35), coreM); core.userData.noAO = true; core.renderOrder = 5; torLean.add(core);
// debris specks
const DEB_N = 1400; const debG = new THREE.BufferGeometry(); const debP = new Float32Array(DEB_N * 3); debG.setAttribute('position', new THREE.BufferAttribute(debP, 3));
const debris = new THREE.Points(debG, new THREE.PointsMaterial({ color: '#4a3b2a', size: 0.32, sizeAttenuation: true, transparent: true, opacity: 0.9 })); debris.frustumCulled = false; torLean.add(debris);
const DEB = Array.from({ length: DEB_N }, (_, i) => ({ y: hash(i) * TH * 0.75, a: hash(i + 3) * 6.283, w: 1.8 + hash(i + 5) * 2.2, rk: 0.95 + hash(i + 7) * 0.45, vy: 1.5 + hash(i + 9) * 3 }));
// dust skirt sprites
const blobT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const DUST = Array.from({ length: 34 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: i % 3 ? '#a8916c' : '#8e7a5c', transparent: true, depthWrite: false, opacity: 0.6 })); torLean.add(s);
  return { s, a: hash(i + 40) * 6.283, r: 2.5 + hash(i + 41) * 6, y: 0.6 + hash(i + 42) * 4, sz: 3.5 + hash(i + 43) * 4, w: 1.4 + hash(i + 44) }; });
// storm cloud deck
const cloudM = new THREE.MeshLambertMaterial({ color: '#9aa4ab', emissive: '#4c555c', transparent: true, opacity: 1, depthWrite: false });
const clouds = new THREE.Group(); scene.add(clouds);
{ const R = rng(33); for (let i = 0; i < 46; i++) { const a = R() * 6.283, r = Math.sqrt(R()) * 85; const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), cloudM); const s = 12 + R() * 16;
    m.scale.set(s, s * 0.32, s); m.position.set(Math.cos(a) * r, TH + 2 + R() * 6, Math.sin(a) * r); m.userData.noAO = true; clouds.add(m); } }

// ---------------- debris passengers: cow, caravan, gnome ----------------
const cow = new THREE.Group(); scene.add(cow);
{ const spotT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#f6f3ee'; c.fillRect(0, 0, w, h); const R = rng(4); c.fillStyle = '#222'; for (let k = 0; k < 9; k++) { c.beginPath(); c.ellipse(R() * w, R() * h, 18 + R() * 30, 14 + R() * 22, R() * 3, 0, 7); c.fill(); } });
  const bm = L('#ffffff', { map: spotT });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.3, 6, 14), bm); body.rotation.x = Math.PI / 2; body.position.y = 1.25; cow.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.75), bm); head.position.set(0, 1.6, -1.35); cow.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.3), L('#f2a5a5')); snout.position.set(0, 1.45, -1.78); cow.add(snout);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 6), L('#f1e6c8')); h.position.set(s * 0.22, 2.0, -1.25); h.rotation.z = -s * 0.5; cow.add(h);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), L('#111')); e.position.set(s * 0.2, 1.72, -1.72); cow.add(e);
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.16), L('#e9d9c8')); ear.position.set(s * 0.38, 1.85, -1.2); cow.add(ear); }
  for (const [x, z] of [[-0.35, -0.6], [0.35, -0.6], [-0.35, 0.65], [0.35, 0.65]]) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.9, 8), bm); lg.position.set(x, 0.45, z); cow.add(lg); }
  const ud = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), L('#f2a5a5')); ud.position.set(0, 0.68, 0.45); cow.add(ud);
  cow.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const caravan = new THREE.Group(); scene.add(caravan);
{ const cm = L('#f4efe3'); const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 4.6), cm); b.position.y = 1.55; caravan.add(b);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4.6, 16, 1, false, 0, Math.PI), cm); top.rotation.z = Math.PI / 2; top.rotation.y = Math.PI / 2; top.scale.set(1, 1, 0.35); top.position.y = 2.62; caravan.add(top);
  const st = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.3, 4.64), L('#3e8ed0')); st.position.y = 1.2; caravan.add(st);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 1.3), L('#33465a')); w.position.set(s * 1.12, 2.0, -0.6); caravan.add(w); }
  const dr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.7, 0.7), L('#d8cfbd')); dr.position.set(1.12, 1.45, 1.2); caravan.add(dr);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.4), L('#444')); bar.position.set(0, 0.55, -2.9); caravan.add(bar);
  for (const s of [-1, 1]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16), L('#1b1b1d')); wh.rotation.z = Math.PI / 2; wh.position.set(s * 1.05, 0.4, 0.3); caravan.add(wh); }
  caravan.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const gnome = new THREE.Group(); scene.add(gnome);
{ const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.8, 14), L('#2f6fd6')); body.position.y = 0.4; gnome.add(body);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.1, 14), L('#3b2a1a')); belt.position.y = 0.45; gnome.add(belt);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 12), L('#f4c7a1')); face.position.y = 1.0; gnome.add(face);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), L('#e8957a')); nose.position.set(0, 0.98, -0.27); gnome.add(nose);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), L('#111')); e.position.set(s * 0.1, 1.07, -0.24); gnome.add(e); }
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.6, 14), L('#ffffff')); beard.rotation.x = Math.PI; beard.position.set(0, 0.72, -0.1); gnome.add(beard);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.85, 14), L('#e53935')); hat.position.y = 1.55; hat.rotation.x = 0.15; gnome.add(hat);
  gnome.scale.setScalar(1.7); gnome.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- motion ----------------
const PI = Math.PI;
// spin angle tables (integral of the spin rate)
function spinTable(rate) { const dt = 1 / 60, n = Math.ceil((TOTAL + 2) / dt); const A = new Float32Array(n + 1); for (let i = 1; i <= n; i++) A[i] = A[i - 1] + rate(i * dt) * dt; return t => { const k = clamp(t / dt, 0, n - 1), i = Math.floor(k); return lerp(A[i], A[i + 1], k - i); }; }
const spinW = spinTable(t => 2.4);
const spinR = spinTable(t => t < tDizzy - 0.3 ? 2.4 : lerp(2.4, 0.55, ramp(t, tDizzy - 0.3, tGently)) + (t > tShrinks ? 4 * ramp(t, tShrinks, tTiny) : 0));
// hook cars
const heroZH = mono([[0, 48], [4.4, -2], [6.2, HERO_STOP], [99, HERO_STOP]]);
const redZH = mono([[0, 34], [4.4, -16], [6.0, RED_STOP], [99, RED_STOP]]);
// tornado position
const grow = t => ramp(t, tBecomes - 0.2, tTornado + 0.4);
const torHX = mono([[0, TOR0.x], [tTornado + 0.2, TOR0.x], [tTakes - 0.1, TORH.x], [99, TORH.x]]);
const torHZ = mono([[0, TOR0.z], [tTornado + 0.2, TOR0.z], [tTakes - 0.1, TORH.z], [99, TORH.z]]);
// wrong: you flee (+z), it chases
const tU0 = tFloor + 0.15, tU1 = tU0 + 0.9;
const heroWZ = t => t < tU1 ? lerp(HERO_STOP, HERO_STOP + 1.5, ease((t - tU0) / 0.9)) : HERO_STOP + 1.5 + 0.5 * 2.7 * Math.pow(t - tU1, 2);
const torWZ = mono([[0, TORH.z], [S('wrong1').start, TORH.z], [tTurns - 0.2, TORH.z - 6], [tSucks, heroWZ(tSucks) - 0.3], [tNow, heroWZ(tSucks) + 4], [tSpits, heroWZ(tSucks) + 7], [tWindmill + 0.4, 12], [99, 0]]);
const torWX = mono([[0, TORH.x], [tTurns - 0.2, TORH.x], [tSucks, -LANE], [tSpits, -5], [tWindmill + 0.4, 16], [99, 26]]);
// red car orbit
const RED_W = 1.8; const redA0 = -PI / 2 - RED_W * (tAbove + 0.5 - tTakes) + 2 * PI; // directly above the hero at ~tAbove+0.5
const redOrbitR = t => lerp(4.5, 18.5, ease((t - tTakes) / 2.6));
const redOrbitY = t => lerp(0.0, 11.0, ease((t - tTakes) / 1.8));
// right: hero into the field and the rosette
const ENTRY = makePath([[LANE, HERO_STOP], [LANE + 0.2, HERO_STOP - 2.5], [5.0, HERO_STOP - 5.5], [7.9, HERO_STOP - 7.0], [C.x - R0, C.z]]);
const tE0 = tPull + 0.15, tE1 = tField + 1.1;
const roseU = mono([[tE1, 0], [tCircles, 0.07], [tRound, 0.22], [tFaster, 0.42], [tDizzy, 0.72], [tGently, 0.94], [tDown, 1.0]]);
function roseAt(u) { const a = rose(clamp(u, 0, 1)), b = rose(clamp(u + 0.002, 0, 1.002)); const dx = b.x - a.x, dz = b.z - a.z; return { x: a.x, z: a.z, h: Math.atan2(-dx, -dz) }; }
// right: tornado drifts off the road while dizzy, red car lands
const torRX = mono([[0, TORH.x], [tDizzy, TORH.x], [tGently, -6], [99, -6]]);
const torRZ = mono([[0, TORH.z], [tDizzy, TORH.z], [tGently, -36], [99, -36]]);
const LAND = { x: LANE, z: -23.5 };
const tLand = tRightUp + 0.25;
const miniP = t => { // tiny breeze path: to the hero, around it, away
  const hx = C.x, hz = C.z; const u0 = ease((t - tTiny) / (tBlows - 0.15 - tTiny));
  if (t < tBlows - 0.15) return { x: lerp(-6, hx - 2.4, u0), z: lerp(-36, hz, u0) };
  const a = PI + (t - tBlows + 0.15) * 4.2; const out = ramp(t, tAboveR - 0.6, tAboveR + 0.4);
  return { x: hx + Math.cos(a) * (2.4 + 10 * out), z: hz + Math.sin(a) * (2.4 + 10 * out) };
};

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => () => { const p = hero.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + look[0], p.y + look[1], p.z + look[2]), fov]; };
const TorCam = (off, look, fov = 40) => () => { const p = tor.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
// inside the tornado: camera on the axis, turning with the debris
let insideLook = V3(0, 0, 0), insidePos = V3(0, 20, 20), insideAng = 0;
const Inside = () => [insidePos.clone(), insideLook.clone(), 50];
const camKeys = [
  [0.0, HeroCam([2.6, 3.6, 13.5], [-0.6, 1.2, -10], 40)],
  [tJust - 0.35, HeroCam([2.4, 3.2, 12.0], [-0.6, 1.2, -10], 40)],
  ...cut(tJust - 0.3, Ac([15, 2.7, -10], [1.0, 1.2, -2], 36)),
  [S('hook1').end, Ac([14.5, 2.7, -10.5], [1.0, 1.4, -4], 36)],
  ...cut(tThen - 0.15, Ac([-3.0, 4.0, 18], [8, 22, -40], 46)),
  [tTakes - 0.45, Ac([-2.6, 4.2, 15], [7, 20, -38], 46)],
  ...cut(tTakes - 0.4, Ac([-7.5, 2.4, -6], [2.0, 4.0, -27], 44)),
  [tFront, Ac([-7.5, 2.6, -6.5], [2.0, 6.5, -27], 44)],
  ...cut(tSpins - 0.3, Ac([3.6, 1.1, -2.5], [1.2, 9.5, -16], 60)),
  [S('hook2').end, Ac([3.8, 1.1, -1.5], [1.2, 9.5, -17], 60)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([3.4, 2.4, -2.5], [1.0, 4.5, -30], 42)),
  [tU0, Ac([3.4, 2.5, -3.0], [1.0, 4.5, -30], 42)],
  ...cut(tU1 - 0.15, HeroCam([3.0, 2.6, 11.0], [-0.5, 3.5, -12], 42)),
  [tTurns - 0.3, HeroCam([3.4, 2.6, 13.0], [-0.5, 4.5, -12], 42)],
  ...cut(tTurns - 0.25, Ac([24, 5.0, 18], [-1.0, 7.0, 30], 42)),
  [S('wrong2').end, Ac([23, 6.0, 22], [-1.5, 9.0, 33], 42)],
  ...cut(tNow - 0.12, Inside),
  [tUntil + 0.5, Inside],
  ...cut(tUntil + 0.55, Ac([7, 6.5, 42], [-18, 12, 56], 44)),
  [tWindmill - 0.25, Ac([6.5, 6.5, 43], [-20, 12, 57], 44)],
  ...cut(tWindmill + 0.15, Ac([0.5, 10.0, 39.5], [-28.0, 13.5, 61.2], 50)),
  [tRew0, Ac([-0.5, 10.5, 38.5], [-28.0, 13.5, 61.2], 50)],
  // right
  ...cut(tRew1, Ac([6.0, 2.2, 0.0], [1.0, 7.0, -28], 46)),
  [tPull - 0.1, Ac([6.2, 2.2, -0.5], [1.0, 7.0, -28], 46)],
  ...cut(tPull, HeroCam([-6.5, 5.0, 10.5], [2.0, 0.6, -6], 42)),
  [tTorn2 - 0.3, HeroCam([-6.0, 5.5, 10.0], [2.0, 0.6, -6], 42)],
  ...cut(tTorn2 - 0.25, Ac([22, 4.5, -2], [2.5, 12, -31], 42)),
  [tSo - 0.15, Ac([21, 4.5, -3], [2.5, 12, -31], 42)],
  ...cut(tSo - 0.1, Ac([C.x + 2, 26, C.z + 22], [C.x, 0, C.z - 1], 40)),
  [tRound - 0.1, Ac([C.x + 1.5, 25, C.z + 20], [C.x, 0, C.z - 1], 40)],
  ...cut(tRound - 0.05, () => [V3(C.x, 4.2, C.z), hero.position.clone().add(V3(0, 0.6, 0)), 48]),
  [tDizzy - 0.35, () => [V3(C.x, 7.5, C.z), hero.position.clone().add(V3(0, 0.6, 0)), 48]],
  ...cut(tDizzy - 0.3, Ac([16, 5.0, -8], [-1.0, 14, -33], 44)),
  [tGently - 0.35, Ac([15, 5.0, -9], [-3.0, 14, -34], 44)],
  ...cut(tGently - 0.3, () => [V3(-7.5, 2.6, -11.5), redCar.position.clone().lerp(V3(LAND.x, 1.0, LAND.z), 0.35), 50]),
  [tLand + 0.5, Ac([-6.5, 2.2, -12.5], [1.8, 1.2, -23.5], 42)],
  ...cut(S('right5').start - 0.15, Ac([28, 8.0, 4], [2, 7, -28], 44)),
  [tBlows - 0.45, Ac([28, 7.0, 2], [8, 3, -24], 44)],
  ...cut(tBlows - 0.4, Ac([C.x + 6.4, 3.0, C.z + 7.6], [C.x, 0.9, C.z], 42)),
  [S('right5').end + 0.2, Ac([C.x + 6.8, 3.2, C.z + 8.2], [C.x, 0.9, C.z], 42)],
  ...cut(S('right6').start - 0.05, Ac([C.x, 30, C.z + 3.0], [C.x, 0, C.z], 40)),
  [tCrop, Ac([C.x, 48, C.z + 4.0], [C.x, 0, C.z], 40)],
  [TOTAL, Ac([C.x, 64, C.z + 5.0], [C.x, 0, C.z], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
const sunBase = sun.intensity, hemiBase = hemi.intensity;
let screen = {};
const orbitPos = (tp, a, r, y) => V3(tp.x + r * Math.cos(a), y, tp.z - r * Math.sin(a));
function setCarQ(car, pos, h, pitch, roll) { car.position.copy(pos); car.rotation.set(pitch, h, roll, 'YXZ'); car.userData.prev = null; }
function update(t) {
  const right = isRight(t);
  // ---- storm level / sky ----
  let storm = ramp(t, tThen, tTornado + 0.6); if (right) storm = 1 - ramp(t, tShrinks, tBlows);
  scene.background.copy(SKY_SUN).lerp(SKY_STORM, storm); scene.fog.color.copy(scene.background); scene.fog.near = lerp(380, 160, storm); scene.fog.far = lerp(1150, 650, storm);
  sun.intensity = sunBase * (1 - 0.5 * storm); hemi.intensity = hemiBase * (1 - 0.15 * storm);
  // ---- tornado placement ----
  let tx, tz, sc = 1, g = 1, lean = 0, leanZ = 0, spin;
  if (t < S('wrong1').start - 0.2 || right && t < tDizzy) { tx = torHX(t); tz = torHZ(t); g = grow(t); }
  if (!right && t >= S('wrong1').start - 0.2) { tx = torWX(t); tz = torWZ(t); lean = 0.08 * Math.sin(t * 0.9); }
  if (right) { tx = torRX(t); tz = torRZ(t);
    const wob = win(t, tDizzy - 0.1, tShrinks + 0.5, 0.4); lean = wob * 0.22 * Math.sin((t - tDizzy) * 4.2); leanZ = wob * 0.16 * Math.sin((t - tDizzy) * 3.1 + 1);
    sc = lerp(1, 0.034, ease((t - tShrinks + 0.1) / (tTiny + 0.3 - tShrinks)));
    if (t > tTiny) { const m = miniP(t); tx = m.x; tz = m.z; } }
  spin = right ? spinR(t) : spinW(t);
  const vis = !(right && t > tAboveR + 0.4);
  tor.visible = vis; tor.position.set(tx, 0, tz); tor.scale.setScalar(sc); torLean.rotation.set(leanZ, 0, lean);
  layers.forEach((L_, i) => { L_.m.rotation.y = spin * L_.spd; L_.m.scale.y = Math.max(0.001, g); L_.m.position.y = TH * (1 - g); L_.mat.map.offset.y = -t * 0.12 * (i + 1); L_.mat.opacity = [0.55, 0.6, 0.75][i] * (right && t > tAboveR - 0.6 ? 1 - ramp(t, tAboveR - 0.6, tAboveR + 0.3) : 1); });
  core.scale.y = Math.max(0.001, g); core.position.y = TH * (1 - g); core.rotation.y = spin * 2;
  for (let i = 0; i < DEB_N; i++) { const d = DEB[i]; const y = (d.y + d.vy * t) % (TH * 0.75); const a = d.a + spin * d.w * 0.6; const r = rFun(y) * d.rk;
    const on = y > TH * (1 - g) ? 1 : 0; debP[3 * i] = Math.cos(a) * r * on; debP[3 * i + 1] = y * on - (1 - on) * 50; debP[3 * i + 2] = -Math.sin(a) * r * on; }
  debG.attributes.position.needsUpdate = true; debris.material.size = 0.32 * Math.max(sc, 0.12);
  const dustA = ramp(g, 0.75, 1) * (right && t > tAboveR - 0.6 ? 1 - ramp(t, tAboveR - 0.6, tAboveR + 0.3) : 1);
  DUST.forEach(d => { const a = d.a + spin * d.w * 0.5; d.s.position.set(Math.cos(a) * d.r, d.y, -Math.sin(a) * d.r); d.s.scale.setScalar(d.sz); d.s.material.opacity = 0.42 * dustA; d.s.visible = dustA > 0.01; });
  // cloud deck follows (lagging) and clears in the right way
  clouds.position.set(lerp(tx, TORH.x, 0.5), 0, lerp(tz, TORH.z, 0.5)); clouds.rotation.y = spin * 0.05; cloudM.opacity = clamp(storm * 1.0); clouds.visible = storm > 0.01;
  if (right && t > tShrinks) clouds.position.y = 30 * ramp(t, tShrinks, tBlows);
  tor.updateMatrixWorld(true);
  const tp = tor.position;
  // ---- windmill ----
  sails.rotation.x = millAng(t); mill.updateMatrixWorld(true);
  // ---- hero ----
  let heroDust = 0;
  if (t < S('wrong1').start - 0.2) placeCar(hero, { x: LANE, z: heroZH(t), h: 0 });
  else if (!right) {
    if (t < tSucks) { if (t < tU0) placeCar(hero, { x: LANE, z: HERO_STOP, h: 0 });
      else if (t < tU1) { const u = ease((t - tU0) / 0.9); placeCar(hero, { x: lerp(LANE, -LANE, u), z: heroWZ(t), h: PI * u, roll: 0.05 * Math.sin(PI * u) }); }
      else placeCar(hero, { x: -LANE, z: heroWZ(t), h: PI }); }
    else if (t < tNow - 0.1) { const u = (t - tSucks) / (tNow - 0.1 - tSucks); const a = PI / 2 + u * 7; const p = orbitPos(tp, a, lerp(0.5, 7, ease(u)), lerp(0, 20, easeIn(u))); setCarQ(hero, p, a + PI * u, 0.4 * u, 1.5 * u); }
    else if (t < tSpits) { insideAng = spin * 0.55; const a = insideAng + 0.0; const p = orbitPos(tp, a, 5.5, 22.0 + 0.4 * Math.sin(t * 2)); setCarQ(hero, p, a + 0.6 + 0.3 * Math.sin(t * 1.3), 0.25 * Math.sin(t * 1.7), 0.5 + 0.3 * Math.sin(t * 1.1)); }
    else { const tA = tSpits, tB = tWindmill; const a0 = spinW(tA) * 0.55; const p0 = orbitPos(tp, a0, 5.5, 22.0 + 0.4 * Math.sin(tA * 2));
      const stuckW = new THREE.Matrix4(); const sailAt = tt => { sails.rotation.x = millAng(tt); mill.updateMatrixWorld(true); return stuckW.multiplyMatrices(sails.matrixWorld, STUCK).clone(); };
      if (t < tB) { const M = sailAt(tB); const p1 = new THREE.Vector3().setFromMatrixPosition(M); const u = (t - tA) / (tB - tA); const p = p0.clone().lerp(p1, u); p.y += 9 * Math.sin(PI * u);
        sails.rotation.x = millAng(t); mill.updateMatrixWorld(true); setCarQ(hero, p, a0 + u * 9, u * 5, u * 3); }
      else { const M = sailAt(t); M.decompose(hero.position, hero.quaternion, _s); hero.userData.prev = null; } }
  } else {
    if (t < tE0) placeCar(hero, { x: LANE, z: HERO_STOP, h: 0 });
    else if (t < tE1) { const u = ease((t - tE0) / (tE1 - tE0)); placeCar(hero, ENTRY.at(ENTRY.len * u)); }
    else { const p = roseAt(roseU(t)); placeCar(hero, p); }
    heroDust = ramp(t, tRound - 0.3, tDizzy) * (1 - ramp(t, tBlows + 0.2, tDust + 0.6));
  }
  hero.userData.body.color.copy(heroCol).lerp(dustCol, heroDust * 0.95); hero.userData.body.roughness = lerp(0.22, 0.95, heroDust); hero.userData.body.metalness = lerp(0.45, 0.0, heroDust); hero.userData.body.envMapIntensity = lerp(1.3, 0.25, heroDust);
  blink(hero, t, false, right && t > tPull - 0.2 && t < tE1);
  // ---- red car ----
  const redA = redA0 + RED_W * (t - tTakes);
  if (t < tTakes) placeCar(redCar, { x: LANE, z: redZH(t), h: 0 });
  else if (!right && t >= tNow - 0.1 && t < tRew0 + 0.5) { const a = spinW(t) * 0.55 + 1.05; setCarQ(redCar, orbitPos(tp, a, 5.8, 25.4 + 0.4 * Math.sin(t * 1.6)), a + 2.2, 0.5 * Math.sin(t * 1.4), PI + 0.4 * Math.sin(t)); }
  else {
    const p = orbitPos(tp, redA, redOrbitR(t), redOrbitY(t)); let h = redA, pitch = 0.25 * Math.sin(t * 1.3) * ramp(t, tTakes, tTakes + 1), roll = 1.25 * (t - tTakes);
    if (right && t > tGently - 0.4) { // gentle spiral down to the road, then right side up
      const u = ease((t - tGently + 0.4) / (tLand - tGently + 0.4)); const q = V3(LAND.x, 0, LAND.z); const pp = p.clone().lerp(q, u); pp.y = lerp(p.y, 0, u) + (t > tLand ? 0.25 * Math.max(0, Math.sin((t - tLand) * 9)) * Math.exp(-(t - tLand) * 4) : 0);
      const rollEnd = Math.round(roll / (2 * PI) + 0.5) * 2 * PI; const r0 = 1.25 * (tGently - 0.4 - tTakes);
      roll = lerp(r0, Math.ceil(r0 / (2 * PI)) * 2 * PI, ease((t - tGently + 0.4) / (tLand - tGently + 0.4))); h = lerp(redA, 0, u) ; pitch *= 1 - u;
      if (t > tLand) { roll = Math.ceil(r0 / (2 * PI)) * 2 * PI; h = angWrap(redA0 + RED_W * (tLand - tTakes)) * 0; }
      setCarQ(redCar, pp, h, pitch, roll); }
    else setCarQ(redCar, p, h, pitch, roll);
  }
  // ---- cow / caravan / gnome (only inside the tornado) ----
  const inside = !right && t > tNow - 0.12 && t < tRew0 + 0.5;
  cow.visible = caravan.visible = gnome.visible = inside;
  if (inside) { const s = spinW(t) * 0.55;
    { const a = s + 2.05; cow.position.copy(orbitPos(tp, a, 5.4, 20.4 + 0.5 * Math.sin(t * 1.9))); cow.rotation.set(0.6 * Math.sin(t * 1.2), a + 1.2, 0.8 + 0.5 * Math.sin(t * 0.9), 'YXZ'); }
    { const a = s - 1.15; caravan.position.copy(orbitPos(tp, a, 6.2, 25.0 + 0.4 * Math.sin(t * 1.3))); caravan.rotation.set(0.3 * Math.sin(t), a - 0.4, -0.7 + 0.3 * Math.sin(t * 0.8), 'YXZ'); }
    { const a = s + 3.05; gnome.position.copy(orbitPos(tp, a, 4.4, 22.3 + 0.3 * Math.sin(t * 2.3))); gnome.rotation.set(0.3 * Math.sin(t * 2), a - PI / 2 + 0.5 * Math.sin(t), 0.4 * Math.sin(t * 1.7), 'YXZ'); }
  }
  // inside camera: co-rotating with the passengers, framed one after another
  layers.forEach(L_ => { L_.mat.side = inside ? THREE.BackSide : THREE.DoubleSide; });
  if (inside) { const s = spinW(t) * 0.55;
    const targ = [[tNow - 0.2, 0.0, 22.0, 5.5, 10.5], [tRedCar - 0.25, 1.05, 25.4, 5.8, 10.5], [tCow - 0.05, 2.05, 20.9, 5.4, 9.0], [tCaravan - 0.0, -1.15, 25.4, 6.2, 11.0], [tGnome - 0.05, 3.05, 23.4, 4.4, 6.5], [tUntil - 0.1, 0.0, 22.2, 5.5, 10.5]];
    let i = 0; while (i < targ.length - 1 && t >= targ[i + 1][0] - 0.22) i++; const A = targ[Math.max(0, i - 1)], B = targ[i];
    const u = i === 0 ? 1 : ease((t - (B[0] - 0.22)) / 0.22); const Q = A.map((v, k) => lerp(v, B[k], u));
    insideLook = orbitPos(tp, s + Q[1], Q[3], Q[2]); insidePos = orbitPos(tp, s + Q[1] + 0.12, Q[3] + Q[4], Q[2] + 1.6); }
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shake = (!right ? Math.max(win(t, tSucks - 0.1, tSucks + 0.5, 0.1), win(t, tWindmill - 0.05, tWindmill + 0.35, 0.05)) : 0) + (t > tTakes - 0.2 && t < S('hook2').end ? 0.3 : 0);
  applyCam(c, t, shake > 0.02 ? 0.06 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { tor: project(V3(tp.x, 14 * sc, tp.z)), torTop: project(V3(tp.x, 26 * sc, tp.z)), torMid: project(V3(tp.x, 9 * sc, tp.z)), torR: project(V3(tp.x + 9 * sc, 9 * sc, tp.z)), hero: project(hero.localToWorld(V3(0, 1.8, 0))), red: project(redCar.position.clone().add(V3(0, 1.6, 0))),
    cow: project(cow.position.clone().add(V3(0, 2.2, 0))), caravan: project(caravan.position.clone().add(V3(0, 3.2, 0))), gnome: project(gnome.position.clone().add(V3(0, 3.2, 0))), C: project(V3(C.x, 0, C.z)), CR: project(V3(C.x + R0, 0, C.z)), sc };
  // ---- crop circle texture ----
  drawField(right && t > tE1 ? roseU(t) : 0);
}
function angWrap(a) { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; }

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function spinArrow(p, rx, ry, dir, t, a, b, col) { // elliptic arrow around a screen point; dir +1 = anticlockwise on screen
  if (t < a || t > b || !p || !p.ok) return; const f = win(t, a, b, 0.25);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(p.x, p.y); ctx.lineCap = 'round'; const ph = -dir * (t - a) * 3.0;
  for (const [lw, c] of [[24, 'rgba(0,0,0,0.45)'], [14, col]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, ph, ph - dir * 4.4, dir > 0); ctx.stroke(); }
  const e = ph - dir * 4.4; const ex = rx * Math.cos(e), ey = ry * Math.sin(e); const tx = -rx * Math.sin(e) * -dir, ty = ry * Math.cos(e) * -dir; const tl = Math.hypot(tx, ty); const ux = tx / tl, uy = ty / tl;
  ctx.fillStyle = col; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex + ux * 40, ey + uy * 40); ctx.lineTo(ex - uy * 30 - ux * 10, ey + ux * 30 - uy * 10); ctx.lineTo(ex + uy * 30 - ux * 10, ey - ux * 30 - uy * 10); ctx.closePath(); ctx.stroke(); ctx.fill();
  ctx.restore();
}
function star(x, y, r, col) { ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -PI / 2 + k * PI / 5, rr_ = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); } ctx.closePath(); ctx.stroke(); ctx.fill(); }
function dizzy(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; const f = win(t, a, b, 0.3); ctx.save(); ctx.globalAlpha = f;
  for (let k = 0; k < 5; k++) { const ang = t * 4 + k * 2 * PI / 5; const x = clamp(p.x, 260, W - 260) + Math.cos(ang) * 170, y = clamp(p.y, 560, 1000) + Math.sin(ang) * 55; star(x, y, 44 + 8 * Math.sin(ang), YEL); } ctx.restore(); }
function sparkles(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; ctx.save();
  for (let k = 0; k < 9; k++) { const u = ((t - a) * 1.3 + k / 9) % 1; const x = p.x + (hash(k) - 0.5) * 420, y = p.y + 60 + (hash(k + 9) - 0.5) * 220 - u * 60; const r = 26 * Math.sin(PI * u);
    ctx.globalAlpha = win(t, a, b, 0.2); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); } ctx.restore(); }
function label(text, p, t, a, b, col, size = 56) { if (!p || !p.ok) return; floatText(text, clamp(p.x, 220, W - 220), clamp(p.y, 520, 1080), t, a, b, size, col, 0); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('COUNTRY ROAD', '#2e7d32', tCountry - 0.1, tJust - 0.2, 54);
    P_('JUST A LITTLE BREEZE', '#0288d1', tJust - 0.1, tThen - 0.2, 50);
    P_('BREEZE → TORNADO', '#455a64', tTornado - 0.2, tTakes - 0.25, 54, iconWarn);
    P_('THE CAR IN FRONT: TAKEN', RED, tTakes - 0.2, tSpins - 0.35, 48);
    P_('RIGHT ABOVE YOU', '#455a64', tAbove - 0.2, S('hook2').end + 0.3, 54, iconWarn);
    P_('FLOOR IT?', '#455a64', tFloor - 0.15, tBig - 0.2, 56);
    P_('TORNADOES LOVE FAST CARS', '#d81b60', tTornadoes - 0.1, tTurns - 0.15, 46, iconHeart);
    P_('SUCKED UP', RED, tSucks - 0.15, S('wrong2').end + 0.3, 60, iconX);
    label('RED CAR', screen.red, t, tRedCar - 0.1, tCow - 0.25, '#ff8a80', 60);
    label('COW', screen.cow, t, tCow - 0.05, tCaravan - 0.2, '#fff', 72);
    label('CARAVAN', screen.caravan, t, tCaravan - 0.05, tGnome - 0.2, '#fff', 64);
    label('GARDEN GNOME', screen.gnome, t, tGnome - 0.05, tUntil - 0.05, YEL, 60);
    P_('SPAT OUT', RED, tSpits - 0.15, tOnto - 0.2, 60, iconX);
    P_('NEW HOME: WINDMILL', '#6d4c41', tWindmill - 0.15, tStill - 0.2, 50);
    P_('STILL SPINNING', RED, tStill - 0.15, tRew0, 58, iconX);
  } else {
    P_('PULL OVER: FIELD', GREEN, tPull - 0.1, tTorn2 - 0.3, 54, iconCheck);
    P_('TORNADO SPINS THIS WAY', '#455a64', tTorn2 - 0.15, tSo - 0.2, 44);
    spinArrow(screen.torMid, 290, 90, 1, t, tTorn2 - 0.1, tSo - 0.15, '#ff5252');
    P_('YOU: THE OTHER WAY', GREEN, tSo - 0.05, S('right2').end + 0.3, 48, iconCheck);
    if (screen.C.ok && screen.CR.ok) spinArrow(screen.C, Math.max(120, Math.abs(screen.CR.x - screen.C.x) * 0.85), Math.max(70, Math.abs(screen.CR.x - screen.C.x) * 0.42), -1, t, tCircles - 0.1, S('right2').end + 0.3, '#39ff4a');
    P_('ROUND AND ROUND', '#0277bd', tRound - 0.1, tFaster - 0.15, 54);
    P_('FASTER!', '#e65100', tFaster - 0.1, S('right3').end + 0.3, 62);
    P_('DIZZY TORNADO', '#7b1fa2', tDizzy - 0.15, tGently - 0.35, 54);
    dizzy(t, tDizzy - 0.1, tGently - 0.35, screen.torTop);
    P_('RED CAR: BACK DOWN', GREEN, tGently - 0.1, tRightUp - 0.15, 50, iconCheck);
    P_('RIGHT SIDE UP', GREEN, tRightUp - 0.1, S('right4').end + 0.3, 56, iconCheck);
    P_('TORNADO → TINY BREEZE', '#0288d1', tShrinks - 0.1, tBlows - 0.45, 46);
    P_('DUST: GONE', '#0288d1', tBlows - 0.1, S('right5').end + 0.3, 56, iconCheck);
    sparkles(t, tDust - 0.1, S('right5').end + 0.3, screen.hero);
    P_('BEST CROP CIRCLE', '#f9a825', tBest - 0.15, S('right6').end + 0.3, 56);
    P_('IN THE COUNTRY', '#f9a825', tBest + 0.2, S('right6').end + 0.3, 46, null, 530);
  }
}
window.dbg = { tor, hero, redCar, cow, caravan, gnome, mill };
start(update, hud);
