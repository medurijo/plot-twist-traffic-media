// Episode 38: Zebra crossing – a duck with endless ducklings
// hook (old style): a zebra crossing, a duck wants to cross. No problem. -> behind her: ducklings, and more, the line never ends.
// wrong: honk -> Mum flies over, lands on your bonnet: QUACK. -> every duckling dives under the car, lifts it,
//        carries it over the grass and tosses it into the pond: your car is a boat, Mum is the captain.
// right: engine off, hazards on, look closer -> the duckling with the tiny hat has walked past before -> it's a circle, Mum is lost ->
//        pop out of the sunroof, lend her your sat-nav (destination: pond) -> "in 50 m turn right" -> the family waddles home, road clear
//        (final image: they now swim in a circle in the pond)
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, roundedPath, pathAt, angLerp,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tZebra = WT('hook1', 'zebra'), tDuck = WT('hook1', 'duck'), tNoP = WT('hook1', 'No');
const tBut = WT('hook2', 'But'), tDucklings = WT('hook2', 'ducklings'), tMore1 = WT('hook2', 'more', 0), tMore2 = WT('hook2', 'more', 1), tLine = WT('hook2', 'line'), tNever = WT('hook2', 'never'), tWhat = WT('hook2', 'What');
const tLose = WT('wrong1', 'lose'), tHonk = WT('wrong1', 'honk'), tBeep = WT('wrong1', 'Beep');
const tBig = WT('wrong2', 'Big'), tMum = WT('wrong2', 'Mum'), tFlies = WT('wrong2', 'flies'), tLands = WT('wrong2', 'lands'), tBonnet = WT('wrong2', 'bonnet'), tSays = WT('wrong2', 'says'), tQuack = WT('wrong2', 'Quack');
const tEvery = WT('wrong3', 'Every'), tDives = WT('wrong3', 'dives'), tLifts = WT('wrong3', 'lifts'), tOff = WT('wrong3', 'Off'), tGrass = WT('wrong3', 'grass'), tSplash = WT('wrong3', 'splash'), tPond = WT('wrong3', 'pond');
const tNow = WT('wrong3', 'Now'), tBoat = WT('wrong3', 'boat'), tMum2 = WT('wrong3', 'Mum'), tCaptain = WT('wrong3', 'captain');
const tEngine = WT('right2', 'Engine'), tHazard = WT('right2', 'Hazard'), tLook = WT('right2', 'look');
const tSee = WT('right3', 'See'), tTiny = WT('right3', 'tiny'), tHat = WT('right3', 'hat'), tWalked = WT('right3', 'walked'), tBefore = WT('right3', 'before'), tAgain1 = WT('right3', 'Again', 0), tAgain2 = WT('right3', 'again', 1);
const tNot = WT('right4', 'not'), tEndless = WT('right4', 'endless'), tCircle = WT('right4', 'circle'), tMumL = WT('right4', 'Mum'), tLost = WT('right4', 'lost');
const tPop = WT('right5', 'pop'), tSunroof = WT('right5', 'sunroof'), tLend = WT('right5', 'lend'), tSatnav = WT('right5', 'sat'), tDest = WT('right5', 'Destination'), tPondR = WT('right5', 'pond');
const tIn = WT('right6', 'In'), tFifty = WT('right6', 'fifty'), tTurn = WT('right6', 'turn'), tRightW = WT('right6', 'right'), tFamily = WT('right6', 'family'), tWaddles = WT('right6', 'waddles'), tRoad = WT('right6', 'Road'), tClear = WT('right6', 'clear');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: a quiet town road with a zebra crossing and a park pond ----------------
const RA = 6.5, Z1 = 11;
const RX = 3.6, ZZ = -5.0, HX = 1.8, HZ = -0.6;    // road half width, zebra centre z, hero rest position
makeLandscape({ avoid: (x, z) => Math.abs(x) < 10 && Math.abs(z) < 300 || (x > 4 && x < 26 && z > -24 && z < 26) || (x < -4 && x > -30 && z > -40 && z < 40), fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 30 && Math.abs(z) - d / 2 < 60, near: [0, 0, 140, 260], trees: 1300, seed: 383 });
plane(-RX, RX, -600, 600, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -300; z < 300; z += 7) if (z > 0 || z < -12) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.14, 600); g2.rotateX(-Math.PI / 2); instanced(g2, markMat, [[RX - 0.25, 0.08, 0], [-RX + 0.25, 0.08, 0]], false);
  // zebra stripes
  const gs = new THREE.PlaneGeometry(0.5, 3.0); gs.rotateX(-Math.PI / 2); const st = []; for (let x = -3.25; x <= 3.3; x += 1.0) st.push([x, 0.082, ZZ]); instanced(gs, markMat, st, false);
  // give-way dashes both sides
  const gd = new THREE.PlaneGeometry(0.5, 0.2); gd.rotateX(-Math.PI / 2); const gl = []; for (let x = 0.3; x < RX - 0.2; x += 0.8) { gl.push([x, 0.081, ZZ + 2.1]); gl.push([-x, 0.081, ZZ - 2.1]); } instanced(gd, markMat, gl, false);
  // zig-zags
  const gz = new THREE.PlaneGeometry(0.12, 1.25); gz.rotateX(-Math.PI / 2); const zz = [];
  for (const s of [1, -1]) for (let k = 0; k < 9; k++) { const z0 = s > 0 ? ZZ + 2.6 + k * 1.1 : ZZ - 2.6 - k * 1.1; for (const sx of [1, -1]) zz.push([sx * (RX - 0.55), 0.081, z0, (k % 2 ? 0.25 : -0.25) * s]); }
  instanced(gz, L('#f5f5f5', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), zz, false); }
// pavements (kerbed)
const paveM = L('#cfc9bc'), kerbM = L('#a9a397');
for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 600), paveM); p.position.set(s * (RX + 0.8), 0.07, 0); p.receiveShadow = true; scene.add(p);
  const k = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 600), kerbM); k.position.set(s * (RX + 0.07), 0.08, 0); k.receiveShadow = true; scene.add(k); }
// little paths where the ducks walk off the pavement (park side)
{ const pm = L('#d9cfb4', { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); plane(RX + 1.6, 7.6, ZZ - 0.8, ZZ + 0.8, pm, 0.045, 4); plane(-7.6, -RX - 1.6, ZZ - 0.8, ZZ + 0.8, pm, 0.045, 4); }
// left: hedge + houses
const hedgeM = new THREE.MeshLambertMaterial({ color: '#3f8a35', flatShading: true });
{ const hg = new THREE.BoxGeometry(0.9, 1.05, 1.0); const R = rng(5); const list = []; for (let z = ZZ + 2.6; z < 60; z += 0.9) if (Math.abs(z - Z1) > 1.4) list.push([-5.45, 0.52, z, (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.12, 1]);
  for (let z = ZZ - 2.6; z > -80; z -= 0.9) list.push([-5.45, 0.52, z, (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.12, 1]);
  instanced(hg, hedgeM, list, true); }
{ const cols = ['#f4d6a0', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5d7a99'; c.fillRect(30 + x * 120, 30 + y * 120, 76, 80); c.fillStyle = '#fff'; c.fillRect(66 + x * 120, 30 + y * 120, 4, 80); } });
  let k = 0; for (let z = -70; z <= 50; z += 13) { const g = new THREE.Group(); g.position.set(-14 - (k % 2) * 2, 0, z); scene.add(g);
    const m = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 9), L(cols[k % cols.length], { map: winT })); m.position.y = 3.5; m.castShadow = m.receiveShadow = true; g.add(m);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.4, 4), L(['#b0473a', '#7b5e57', '#455a64'][k % 3])); rf.rotation.y = Math.PI / 4; rf.position.y = 8.7; rf.castShadow = true; g.add(rf); k++; } }
// Belisha beacons
const beacons = [];
for (const [x, z] of [[RX + 0.95, ZZ - 1.9], [-RX - 0.95, ZZ + 1.9]]) { const g = new THREE.Group(); g.position.set(x, 0.14, z); scene.add(g);
  const poleT = canvasTex(32, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fafafa' : '#111'; c.fillRect(0, i * 32, w, 32); } });
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10), L('#fff', { map: poleT })); p.position.y = 1.3; p.castShadow = true; g.add(p);
  const m = new THREE.MeshStandardMaterial({ color: '#ffb300', emissive: '#ffa000', emissiveIntensity: 0.5, roughness: 0.3, toneMapped: false }); const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), m); b.position.y = 2.75; b.castShadow = true; g.add(b); beacons.push(m); }
// duck-crossing warning sign (park side, before the crossing)
{ const g = new THREE.Group(); g.position.set(RX + 1.25, 0.14, ZZ + 4.5); g.rotation.y = -0.35; scene.add(g);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), STD('#9e9e9e', { metalness: 0.5 })); p.position.y = 1.1; g.add(p);
  const st = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#d32f2f'; c.beginPath(); c.moveTo(w / 2, 8); c.lineTo(w - 6, h - 20); c.lineTo(6, h - 20); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(w / 2, 50); c.lineTo(w - 44, h - 42); c.lineTo(44, h - 42); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.ellipse(128, 168, 42, 24, 0, 0, 7); c.fill(); c.beginPath(); c.arc(150, 128, 17, 0, 7); c.fill(); c.beginPath(); c.moveTo(162, 124); c.lineTo(186, 132); c.lineTo(162, 138); c.fill(); c.beginPath(); c.moveTo(88, 160); c.lineTo(74, 146); c.lineTo(94, 170); c.fill();
    for (const [x, s] of [[86, 0.5], [118, 0.5]]) { c.beginPath(); c.ellipse(x - 40, 196, 14, 8, 0, 0, 7); c.fill(); } });
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), L('#fff', { map: st, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); b.position.y = 2.3; g.add(b);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- the ring the ducks walk (counter-clockwise from above: zebra -x, left side +z, back +x, right side -z) ----------------
const ring = roundedPath([[3.9, ZZ], [-RA, ZZ], [-RA, Z1], [RA, Z1], [RA, ZZ], [3.9, ZZ]], 2.2);
const LR = ring.len;
const LAP = 33.0, V = LR / LAP;
const xs1 = (() => { for (let s = 0; s < 3; s += 0.01) if (pathAt(ring, s).x <= HX) return s; return 2.1; })();     // arc length to x = HX on the zebra
const ringAt = D => pathAt(ring, ((D % LR) + LR) % LR);
const Dm = t => V * (t - tDuck);                      // Mum's travelled distance (0 at the right kerb when she "wants to cross")
const N = 76, SP = 0.42, LAG0 = 1.15;
const tHatPass = tTiny - 0.15;                        // hat duckling right in front of the car (lap 2)
const hatLagWanted = V * (tHatPass - (tDuck + LAP + xs1 / V));
const IH = clamp(Math.round((hatLagWanted - LAG0) / SP), 3, N - 1);
const lag = i => LAG0 + i * SP;
// exit: where Mum is when she turns right (right side, heading -z), then into the pond and round in circles
const tTurnAct = tTurn + 0.55;
const D_EXIT = Dm(tTurnAct);
const E = ringAt(D_EXIT);
const ZT = E.z - 1.6, PR = 3.0;
const PC = V3(12.6, 0, ZT + PR);                     // pond centre
const exitPath = (() => {
  const a = roundedPath([[E.x, E.z], [E.x, ZT], [PC.x, ZT]], 1.4); const pts = a.pts.slice();
  for (let k = 1; k <= 400; k++) { const th = k / 400 * Math.PI * 6, r = PR - 0.6 * Math.min(2, th / (Math.PI * 2)); pts.push(new THREE.Vector2(PC.x + r * Math.sin(th), PC.z - r * Math.cos(th))); }
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1])); return { pts, cum, len: cum[cum.length - 1] };
})();
console.warn(`ring L=${LR.toFixed(1)} v=${V.toFixed(2)} hat=${IH} exit=(${E.x.toFixed(1)},${E.z.toFixed(1)}) h=${E.h.toFixed(2)} pond=(${PC.x.toFixed(1)},${PC.z.toFixed(1)})`);
const trajR = D => D < D_EXIT ? ringAt(D) : pathAt(exitPath, D - D_EXIT);    // right way (with exit)
const inPond = (x, z) => (x - PC.x) ** 2 + (z - PC.z) ** 2 < 5.0 ** 2;

// ---------------- pond ----------------
const PONDR = 5.4;
{ const w = new THREE.Mesh(new THREE.CircleGeometry(PONDR, 48), STD('#3d8fcf', { roughness: 0.12, metalness: 0.15, envMapIntensity: 1.2, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  w.rotation.x = -Math.PI / 2; w.position.set(PC.x, 0.05, PC.z); w.receiveShadow = true; scene.add(w);
  const rim = new THREE.Mesh(new THREE.RingGeometry(PONDR, PONDR + 0.5, 48), L('#b8a27a', { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); rim.rotation.x = -Math.PI / 2; rim.position.set(PC.x, 0.045, PC.z); rim.receiveShadow = true; scene.add(rim);
  const sm = new THREE.MeshLambertMaterial({ color: '#9e9a90', flatShading: true }); const R = rng(17);
  for (let k = 0; k < 46; k++) { const a = k / 46 * Math.PI * 2 + R() * 0.1, r = PONDR + 0.25 + R() * 0.2; if (Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))) < 0.55) continue;
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + R() * 0.12, 0), sm); s.position.set(PC.x + Math.cos(a) * r, 0.08, PC.z + Math.sin(a) * r); s.scale.y = 0.6; s.castShadow = s.receiveShadow = true; scene.add(s); }
  // reeds on the far side
  const rm = L('#5c8f2e'); for (let k = 0; k < 40; k++) { const a = -0.9 + R() * 1.8, r = PONDR - 0.3 + R() * 0.8; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.9 + R() * 0.6, 4), rm); c.position.set(PC.x + Math.cos(a) * r, 0.5, PC.z + Math.sin(a) * r); c.rotation.z = (R() - 0.5) * 0.3; c.castShadow = true; scene.add(c);
    if (k % 4 === 0) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.18, 3, 6), L('#6d4c41')); b.position.set(c.position.x, 1.05 + R() * 0.3, c.position.z); scene.add(b); } }
  // lily pads
  const lp = L('#4caf50', { polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }); for (let k = 0; k < 9; k++) { const a = R() * 6.28, r = 1.2 + R() * 3.4; if (r < 4.2 && r > 2.2) continue; const m = new THREE.Mesh(new THREE.CircleGeometry(0.35 + R() * 0.2, 16, 0.4, 5.8), lp); m.rotation.x = -Math.PI / 2; m.position.set(PC.x + Math.cos(a) * r, 0.06, PC.z + Math.sin(a) * r); scene.add(m); }
  // bench + bin by the pond
  const wd = L('#8d5a33'), mt = STD('#37474f'); const g = new THREE.Group(); g.position.set(PC.x + 3.0, 0, PC.z - PONDR - 1.6); g.rotation.y = 0.2; scene.add(g);
  for (const y of [0.45, 0.85]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.32), wd); b.position.set(0, y, y > 0.6 ? -0.18 : 0); g.add(b); }
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.4), mt); l.position.set(s * 0.8, 0.45, -0.05); g.add(l); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
// park trees (kept away from the camera corridors)
{ const pts = [[20, -14], [23, -2], [21, 12], [24, 22], [17, 24], [9, 22], [26, 6], [13, -18], [28, -10], [19, 30]];
  const tr = L('#6d4a2b'), lf = new THREE.MeshLambertMaterial({ color: '#4fa336', flatShading: true });
  pts.forEach(([x, z], i) => { const s = 1.0 + hash(i) * 0.5; const t = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.32 * s, 2.4 * s, 7), tr); t.position.set(x, 1.2 * s, z); t.castShadow = true; scene.add(t);
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4 * s, 1), lf); l.position.set(x, 3.6 * s, z); l.castShadow = l.receiveShadow = true; scene.add(l); }); }

// ---------------- ducklings (instanced) ----------------
const yel = STD('#ffd21f', { roughness: 0.6 }), ora = STD('#ff8a00', { roughness: 0.5 }), blk = STD('#111111', { roughness: 0.3 });
const dParts = [
  [new THREE.SphereGeometry(0.13, 14, 10), yel, new THREE.Matrix4().compose(V3(0, 0.13, 0.02), new THREE.Quaternion(), V3(1.0, 0.9, 1.25))],
  [new THREE.SphereGeometry(0.095, 14, 10), yel, new THREE.Matrix4().makeTranslation(0, 0.27, -0.1)],
  [new THREE.BoxGeometry(0.075, 0.03, 0.08), ora, new THREE.Matrix4().makeTranslation(0, 0.255, -0.2)],
  [new THREE.SphereGeometry(0.019, 8, 6), blk, new THREE.Matrix4().makeTranslation(0.048, 0.295, -0.17)],
  [new THREE.SphereGeometry(0.019, 8, 6), blk, new THREE.Matrix4().makeTranslation(-0.048, 0.295, -0.17)],
  [new THREE.SphereGeometry(0.05, 8, 6), yel, new THREE.Matrix4().compose(V3(0.12, 0.15, 0.03), new THREE.Quaternion(), V3(0.5, 1, 1.4))],
  [new THREE.SphereGeometry(0.05, 8, 6), yel, new THREE.Matrix4().compose(V3(-0.12, 0.15, 0.03), new THREE.Quaternion(), V3(0.5, 1, 1.4))],
];
const DSC = 1.25;   // a touch bigger than life, so they read on a phone
const dMeshes = dParts.map(([g, m]) => { const im = new THREE.InstancedMesh(g, m, N); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); return im; });
const hat = new THREE.Group(); scene.add(hat);
{ const red = STD('#e53935', { roughness: 0.6 }), wh = STD('#fafafa');
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.17, 16), red); c.position.y = 0.08; hat.add(c);
  const b = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 8, 18), wh); b.rotation.x = Math.PI / 2; b.position.y = 0.0; hat.add(b);
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), wh); p.position.y = 0.18; hat.add(p);
  hat.traverse(o => { if (o.isMesh) o.castShadow = true; }); hat.scale.setScalar(1.35); }
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _M2 = new THREE.Matrix4();
function setDuckling(i, x, y, z, h, roll, bob, pitch = 0) {
  _e.set(pitch, h, roll, 'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x, y + bob, z), _q, _s.set(DSC, DSC, DSC));
  dMeshes.forEach((im, k) => { _M2.multiplyMatrices(_m, dParts[k][2]); im.setMatrixAt(i, _M2); });
  if (i === IH) { hat.position.copy(V3(0, 0.355, -0.1).multiplyScalar(DSC).applyQuaternion(_q).add(_p)); hat.quaternion.copy(_q); hat.rotateX(-0.25); }
}

// ---------------- Mum ----------------
const mum = new THREE.Group(); scene.add(mum);
const mumP = {};
{ const wh = STD('#fbf8f0', { roughness: 0.75 }), orn = STD('#ff8f00', { roughness: 0.45 }), dk = STD('#151515', { roughness: 0.3 });
  const body = new THREE.Group(); mum.add(body); mumP.body = body;
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.32, 22, 16), wh); b.scale.set(0.92, 0.82, 1.22); b.position.set(0, 0.42, 0.04); body.add(b);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), wh); tail.rotation.x = -2.1; tail.position.set(0, 0.56, 0.42); body.add(tail);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.34, 12), wh); neck.position.set(0, 0.72, -0.24); neck.rotation.x = 0.25; body.add(neck);
  const hd = new THREE.Group(); hd.position.set(0, 0.92, -0.3); body.add(hd); mumP.hd = hd;
  hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 14), wh));
  const up = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.24), orn); up.position.set(0, -0.03, -0.24); hd.add(up);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.06, -0.13); hd.add(jaw); mumP.jaw = jaw;
  const lo = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.2), orn); lo.position.set(0, -0.01, -0.1); jaw.add(lo);
  mumP.brows = [];
  for (const s of [-1, 1]) { const ew = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), STD('#ffffff', { roughness: 0.2 })); ew.position.set(s * 0.095, 0.06, -0.13); hd.add(ew);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 8), dk); pu.position.set(s * 0.1, 0.06, -0.19); hd.add(pu);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.03), dk); br.position.set(s * 0.095, 0.15, -0.15); hd.add(br); mumP.brows.push([br, s]); }
  mumP.wings = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.26, 0.52, -0.02); body.add(g); const w = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), wh); w.scale.set(0.3, 0.6, 1.1); w.position.set(s * 0.04, -0.02, 0.06); g.add(w); return g; });
  mumP.legs = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.12, 0.18, 0.05); mum.add(g); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.17, 6), orn); l.position.y = -0.09; g.add(l);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.2), orn); f.position.set(0, -0.17, -0.06); g.add(f); return g; });
  // captain's hat (wrong) – hidden until needed
  const cap = new THREE.Group(); cap.position.set(0, 0.15, 0.01); hd.add(cap); mumP.cap = cap;
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.1, 18), STD('#1a237e')); c1.position.y = 0.03; cap.add(c1);
  const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.05, 18), STD('#fafafa')); c2.position.y = 0.1; cap.add(c2);
  const pk = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.12), STD('#111')); pk.position.set(0, 0.0, -0.17); cap.add(pk);
  const an = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), STD('#ffd54f', { metalness: 0.7, roughness: 0.3 })); an.position.set(0, 0.05, -0.172); cap.add(an);
  // sat-nav on a strap (right)
  const sat = new THREE.Group(); scene.add(sat); mumP.sat = sat;
  const scr = canvasTex(256, 400, (c, w, h) => { c.fillStyle = '#e8f1d8'; c.fillRect(0, 0, w, h); c.fillStyle = '#cfd8c0'; for (let i = 0; i < 6; i++) c.fillRect(0, i * 70 + 20, w, 10);
    c.strokeStyle = '#2f7bff'; c.lineWidth = 26; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(70, 380); c.lineTo(70, 210); c.lineTo(190, 210); c.stroke();
    c.fillStyle = '#3d8fcf'; c.beginPath(); c.ellipse(200, 140, 46, 36, 0, 0, 7); c.fill(); c.fillStyle = '#e53935'; c.beginPath(); c.arc(200, 118, 18, Math.PI, 0); c.lineTo(200, 150); c.fill();
    c.fillStyle = '#111'; c.fillRect(0, 0, w, 74); c.fillStyle = '#fff'; c.font = '900 50px Inter'; c.textAlign = 'center'; c.fillText('POND ↱', w / 2, 54); });
  const ph = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.42, 0.04), STD('#1b1b1d', { roughness: 0.3 })); sat.add(ph);
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.375), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false })); sc.position.z = 0.022; sat.add(sc);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.015, 6, 24), STD('#263238')); strap.position.set(0, 0.28, -0.08); strap.rotation.x = 1.25; sat.add(strap); mumP.strap = strap;
  mum.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); sat.traverse(o => { if (o.isMesh) o.castShadow = true; });
  mum.scale.setScalar(1.05); }

// ---------------- hero + driver ----------------
const hero = makeCar('#1e88e5');
const sunroof = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.62), STD('#0d1117', { roughness: 0.2, metalness: 0.6 })); sunroof.position.set(0, 1.612, 0.15); hero.userData.bodyG.add(sunroof);
function makePerson(shirt) {
  const g = new THREE.Group(); const skin = STD('#f1c27d'), sh = STD(shirt);
  const tor = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.42, 4, 12), sh); tor.position.y = 1.2; g.add(tor);
  const hd = new THREE.Group(); hd.position.y = 1.68; g.add(hd); hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), skin));
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), STD('#5d4037')); hair.position.y = 0.03; hd.add(hair);
  for (const s of [-1, 1]) { const ew = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), STD('#fff')); ew.position.set(s * 0.065, 0.04, -0.15); hd.add(ew); const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), STD('#111')); e.position.set(s * 0.065, 0.04, -0.19); hd.add(e); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.013, 6, 12, Math.PI), STD('#6d2b1f')); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.06, -0.17); hd.add(mouth);
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.28, 1.42, 0); g.add(a); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.58, 8), sh); m.position.y = -0.29; a.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), skin); h.position.y = -0.62; a.add(h); return a; });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, hd, arms };
}
const drv = makePerson('#ff7043'); hero.add(drv.g); drv.g.scale.setScalar(0.85); drv.g.visible = false;

// ---------------- splash particles ----------------
const NSP = 60; const spMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), STD('#e3f4ff', { roughness: 0.1, emissive: '#bfe6ff', emissiveIntensity: 0.25 }), NSP); spMesh.frustumCulled = false; scene.add(spMesh);
const spRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); spRing.rotation.x = -Math.PI / 2; scene.add(spRing);

// ---------------- wrong-way choreography ----------------
const HPOS = { x: HX, z: HZ, h: 0 };
const PE = (() => { const dx = PC.x - HX, dz = PC.z - HZ, d = Math.hypot(dx, dz); return { x: PC.x - dx / d * 7.3, z: PC.z - dz / d * 7.3, h: Math.atan2(-dx, -dz) }; })();
const tLiftA = tLifts - 0.05, tCarry0 = tOff - 0.1, tCarry1 = tSplash - 0.75, tLandW = tSplash + 0.02;
function heroWrong(t) {
  const p = { x: HX, y: 0, z: HZ, h: 0, pitch: 0, roll: 0 };
  const lurch = win(t, tHonk - 0.1, tHonk + 0.9, 0.12); p.z -= 0.35 * easeOut(clamp((t - tHonk + 0.1) / 0.3)) - 0.35 * ramp(t, tHonk + 0.5, tHonk + 1.0) * 0 ; p.pitch = 0.025 * lurch * Math.sin((t - tHonk) * 22) * (1 - ramp(t, tHonk + 0.2, tHonk + 0.9));
  if (t > tHonk) p.z = HZ - 0.35;
  if (t < tLiftA) return p;
  const lift = back(clamp((t - tLiftA) / 0.45)) * 0.34; p.y = lift;
  if (t < tCarry0) { p.roll = 0.03 * Math.sin(t * 9); return p; }
  if (t < tCarry1) { const u = ease(clamp((t - tCarry0) / (tCarry1 - tCarry0))); p.x = lerp(HX, PE.x, u); p.z = lerp(HZ - 0.35, PE.z, u); p.h = angLerp(0, PE.h, ease(clamp((t - tCarry0) / 0.5)));
    p.y = 0.34 + 0.05 * Math.abs(Math.sin(t * 16)); p.roll = 0.04 * Math.sin(t * 16); return p; }
  if (t < tLandW) { const u = clamp((t - tCarry1) / (tLandW - tCarry1)); p.x = lerp(PE.x, PC.x, u); p.z = lerp(PE.z, PC.z, u); p.h = PE.h + u * 0.6; p.y = lerp(0.34, -0.32, u) + 2.6 * 4 * u * (1 - u); p.pitch = -0.25 * Math.sin(Math.PI * u); return p; }
  const tt = t - tLandW; p.x = PC.x; p.z = PC.z; p.h = PE.h + 0.6 + 0.04 * Math.sin(tt * 1.1); p.y = -0.32 - 0.35 * Math.exp(-tt * 4) * Math.cos(tt * 9) + 0.04 * Math.sin(tt * 2.2);
  p.roll = 0.05 * Math.sin(tt * 1.7); p.pitch = 0.03 * Math.sin(tt * 1.3 + 1); return p;
}
const tGo = tClear - 0.35;
function heroRight(t) { const p = { x: HX, y: 0, z: HZ, h: 0, pitch: 0, roll: 0 }; if (t > tGo) { const tt = t - tGo; p.z = HZ - (tt < 2 ? 1.5 * tt * tt : 6 + 6 * (tt - 2)); } return p; }
const heroPose = t => isRight(t) ? heroRight(t) : heroWrong(t);
const carLocal = (p, lx, ly, lz) => { _e.set(p.pitch || 0, p.h, p.roll || 0, 'YXZ'); _q.setFromEuler(_e); return V3(lx, ly, lz).applyQuaternion(_q).add(V3(p.x, p.y || 0, p.z)); };
const tFreeze = tFlies - 0.15;
const Dline = t => (!isRight(t) && t > tFreeze) ? Dm(tFreeze) : Dm(t);
// grid slots under the car
const slot = i => { const c = i % 6, r = Math.floor(i / 6); return [(c - 2.5) * 0.3, (r - 6) * 0.33]; };
function ducklingWrong(i, t) {
  const D = Dline(t) - lag(i); const rp = ringAt(D);
  let x = rp.x, z = rp.z, h = rp.h, y = 0, walking = t < tFreeze, pitch = 0;
  // turn to look at the car when Mum quacks
  if (t > tQuack) { const k = ease(clamp((t - tQuack - 0.05 - hash(i) * 0.3) / 0.3)); const hc = Math.atan2(-(HX - x), -(HZ - z)); h = angLerp(h, hc, k); }
  if (t < tDives) return { x, z, h, y, walking, pitch };
  const hp = heroWrong(t); const [sx, sz] = slot(i);
  const d0 = Math.hypot(x - HX, z - HZ); const ta = tDives + 0.1 * hash(i + 3), tb = ta + 0.35 + d0 * 0.045;
  const u = clamp((t - ta) / (tb - ta)); const tgt = carLocal({ ...hp, y: 0, pitch: 0, roll: 0 }, sx, 0, sz);
  const hc = Math.atan2(-(tgt.x - x), -(tgt.z - z));
  if (u < 1) { const e = easeIn(u) * 0.6 + u * 0.4; return { x: lerp(x, tgt.x, e), z: lerp(z, tgt.z, e), h: u > 0 ? hc : h, y: 0.35 * Math.sin(Math.PI * u) * (u > 0.75 ? 1 : 0.3), walking: true, pitch: u > 0 && u < 1 ? -0.5 : 0 }; }
  if (t < tCarry1) return { x: tgt.x, z: tgt.z, h: hp.h, y: 0, walking: t > tCarry0, pitch: 0 };
  // tossed the car -> hop into the pond and swim around it
  const k = clamp((t - tCarry1 - 0.15 - hash(i + 9) * 0.35) / 0.6); const a = i / N * Math.PI * 2 + (t - tLandW) * 0.22, rr_ = 3.7 + (i % 3) * 0.45;
  const sw = V3(PC.x + Math.cos(a) * rr_, -0.05, PC.z + Math.sin(a) * rr_);
  if (k <= 0) return { x: tgt.x, z: tgt.z, h: hp.h, y: 0, walking: false, pitch: 0 };
  const pend = carLocal({ x: PE.x, z: PE.z, h: PE.h, y: 0 }, sx, 0, sz);
  return { x: lerp(pend.x, sw.x, k), z: lerp(pend.z, sw.z, k), y: lerp(0, -0.05, k) + 1.3 * Math.sin(Math.PI * k), h: k < 1 ? Math.atan2(-(sw.x - pend.x), -(sw.z - pend.z)) : a + Math.PI, walking: false, pitch: 0, swim: k >= 1 };
}
function ducklingRight(i, t) {
  const D = Dm(t) - lag(i); const p = trajR(D); const sw = D > D_EXIT + 6.2 || (D > D_EXIT && inPond(p.x, p.z));
  return { x: p.x, z: p.z, h: p.h, y: sw ? -0.05 : 0, walking: !sw, pitch: 0, swim: sw };
}
// Mum
function mumWrong(t) {
  const D = Dm(Math.min(t, tFreeze)); const rp = ringAt(D);
  const s = { x: rp.x, y: 0, z: rp.z, h: rp.h, walk: t < tFreeze, flap: 0, jaw: 0, angry: ramp(t, tFlies, tLands), head: 0, cap: 0 };
  if (t < tFlies - 0.1) return s;
  const hp = heroWrong(t);
  const bon = carLocal(hp, 0, 0.98, -1.35);
  const tl = tLands + 0.05;
  if (t < tl) { const u = clamp((t - tFlies + 0.1) / (tl - tFlies + 0.1)); const a = V3(rp.x, 0, rp.z); const p = a.lerp(bon, ease(u)); p.y += 3.2 * Math.sin(Math.PI * u);
    return { ...s, x: p.x, y: p.y, z: p.z, h: Math.atan2(-(bon.x - rp.x), -(bon.z - rp.z)), walk: false, flap: 1 }; }
  // on the bonnet, facing the windscreen (+z in car space)
  const hb = hp.h + Math.PI;
  const q = { ...s, x: bon.x, y: bon.y, z: bon.z, h: hb, walk: false, flap: win(t, tl, tl + 0.5, 0.1) * 0.6 };
  q.jaw = Math.max(win(t, tQuack - 0.05, tQuack + 0.55, 0.06), 0.35 * win(t, tSays, tSays + 0.35, 0.05) + 0.35 * win(t, tSays + 0.5, tSays + 0.8, 0.05));
  q.head = -0.25 * win(t, tSays - 0.3, tQuack + 0.6, 0.25);   // leans in
  if (t > tCarry1) { const roof = carLocal(hp, 0, 1.62, 0.15); const u = clamp((t - tCarry1 - 0.1) / 0.5); const pp = bon.clone().lerp(roof, ease(u)); pp.y += 0.9 * Math.sin(Math.PI * u);
    q.x = pp.x; q.y = pp.y; q.z = pp.z; q.h = hp.h; q.flap = Math.max(win(t, tCarry1, tLandW + 0.4, 0.1), win(t, tCaptain + 0.1, tCaptain + 0.9, 0.1) * 0.5); q.angry = 1 - ramp(t, tNow, tBoat); }
  q.cap = back(clamp((t - tCaptain + 0.1) / 0.35));
  return q;
}
const tF0 = tLend - 0.7, tF1 = tLend + 0.15, tGive = tSatnav + 0.05, tB0 = tPondR + 0.2, tB1 = tPondR + 0.95;
function mumRight(t) {
  const D = Dm(t); const rp = trajR(D);
  const sw = D > D_EXIT + 6.2;
  const s = { x: rp.x, y: sw ? -0.12 : 0, z: rp.z, h: rp.h, walk: !sw, flap: 0, jaw: 0, angry: 0, head: 0, cap: 0, lost: win(t, tMumL - 0.5, tPop, 0.3), sat: t > tGive };
  if (t > tF0 - 0.1 && t < tB1) {
    const hp = heroRight(t); const bon = carLocal(hp, 0, 0.98, -1.25);
    if (t < tF1) { const u = clamp((t - tF0) / (tF1 - tF0)); const p = V3(ringAt(Dm(tF0)).x, 0, ringAt(Dm(tF0)).z).lerp(bon, ease(u)); p.y += 2.8 * Math.sin(Math.PI * u); const a = ringAt(Dm(tF0));
      return { ...s, x: p.x, y: p.y, z: p.z, h: Math.atan2(-(bon.x - a.x), -(bon.z - a.z)), walk: false, flap: 1 }; }
    if (t < tB0) { return { ...s, x: bon.x, y: bon.y, z: bon.z, h: Math.PI, walk: false, flap: win(t, tF1, tF1 + 0.4, 0.1) * 0.5 + win(t, tGive + 0.1, tGive + 0.6, 0.1) * 0.4, jaw: 0.5 * win(t, tGive + 0.15, tGive + 0.5, 0.05) }; }
    const u = clamp((t - tB0) / (tB1 - tB0)); const p = bon.clone().lerp(V3(rp.x, 0, rp.z), ease(u)); p.y += 2.8 * Math.sin(Math.PI * u);
    return { ...s, x: p.x, y: p.y, z: p.z, h: Math.atan2(-(rp.x - bon.x), -(rp.z - bon.z)), walk: false, flap: 1 };
  }
  return s;
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const hatPos = t => { const D = Dm(t) - lag(IH); return isRight(t) ? trajR(D) : ringAt(D); };
const HatCam = (p, fov, dy = 0.3) => t => { const h = hatPos(t); return [V3(...p), V3(h.x, dy, h.z), fov]; };
const mumAt = t => (isRight(t) ? mumRight(t) : mumWrong(t));
const MumCam = (off, fov = 40, ly = 0.7) => t => { const m = mumAt(t); return [V3(m.x + off[0], m.y + off[1], m.z + off[2]), V3(m.x, m.y + ly, m.z), fov]; };
const CarCam = (off, look, fov = 40) => t => { const p = heroPose(t); return [V3(p.x + off[0], Math.max(0.6, (p.y || 0) + off[1]), p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2]), fov]; };
const WIDE_BACK = Ac([2.8, 3.4, 9.0], [1.0, 0.4, -6.5]);
const camKeys = [
  [0.0, Ac([3.8, 5.4, 8.2], [0.9, -0.6, -6.0])],
  [tNoP - 0.35, Ac([3.4, 4.9, 6.8], [1.0, -0.5, -6.0])],
  ...cut(tNoP - 0.3, Ac([2.2, 1.05, -11.5], [1.3, 0.55, -3.5])),
  [tBut - 0.1, Ac([2.1, 1.0, -11.0], [1.1, 0.55, -3.5])],
  ...cut(tBut - 0.05, Ac([6.2, 0.8, -7.4], [2.4, 0.2, -4.6], 44)),
  [tMore1 - 0.25, Ac([5.9, 0.8, -7.2], [2.0, 0.2, -4.6], 44)],
  ...cut(tMore1 - 0.2, Ac([-2.4, 0.5, -7.0], [0.6, 0.22, -4.9], 42)),
  [tLine - 0.3, Ac([-2.2, 0.5, -6.9], [0.8, 0.22, -4.9], 42)],
  ...cut(tLine - 0.25, Ac([1.5, 1.5, -1.9], [1.5, 0.25, -5.4], 46)),
  [tWhat - 0.3, Ac([1.5, 1.5, -2.1], [1.5, 0.25, -5.4], 46)],
  ...cut(tWhat - 0.25, Ac([4.6, 4.4, -16.5], [1.4, 0.2, -3.0])),
  [S('wrong1').start - 0.2, Ac([4.4, 4.6, -16.0], [1.4, 0.2, -3.0])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([3.0, 2.4, -11.0], [1.8, 0.7, -1.5])),
  [tHonk - 0.2, Ac([2.9, 2.3, -10.4], [1.8, 0.75, -1.5])],
  [tBig - 0.1, Ac([2.8, 2.25, -10.0], [1.8, 0.75, -1.5])],
  ...cut(tMum - 0.3, Ac([5.0, 3.0, -12.5], [1.6, 2.4, -1.0], 44)),
  [tLands + 0.3, Ac([4.4, 2.6, -10.5], [1.8, 1.4, -1.8], 42)],
  ...cut(tBonnet + 0.15, Ac([4.5, 2.35, 0.1], [1.8, 1.5, -2.2], 40)),
  [tQuack - 0.1, Ac([4.2, 2.3, -0.3], [1.8, 1.55, -2.2], 38)],
  [tQuack + 0.5, Ac([4.1, 2.3, -0.4], [1.8, 1.55, -2.2], 40)],
  ...cut(tEvery - 0.15, Ac([-3.6, 5.6, -10.5], [1.8, 0.3, -0.8])),
  [tLifts + 0.4, Ac([-3.3, 5.2, -10.0], [1.8, 0.4, -0.8])],
  ...cut(tOff - 0.2, Ac([6.0, 7.0, -14.5], [3.2, 0.4, -0.2])),
  [tCarry1, Ac([7.5, 7.5, -12.5], [8.8, 0.4, PE.z - 0.5])],
  [tLandW + 0.5, Ac([8.5, 7.8, -12.0], [PC.x - 1.0, 0.2, PC.z - 0.5])],
  ...cut(tNow - 0.2, Ac([PC.x - 4.8, 2.4, PC.z - 6.4], [PC.x, 0.9, PC.z], 40)),
  [tRew0, Ac([PC.x - 4.2, 2.3, PC.z - 5.6], [PC.x, 1.0, PC.z], 40)],
  // right
  ...cut(tRew1, WIDE_BACK),
  [tEngine - 0.25, Ac([2.7, 3.2, 8.5], [1.0, 0.4, -6.5])],
  ...cut(tEngine - 0.2, Ac([4.0, 1.5, 5.6], [1.8, 0.75, 0.8])),
  [tLook - 0.2, Ac([3.6, 1.6, 5.2], [1.8, 0.8, 0.8])],
  [S('right2').end + 0.1, Ac([3.6, 4.4, 3.2], [0.8, -0.4, -5.6], 40)],
  ...cut(tSee - 0.1, HatCam([0.4, 0.75, -11.5], 13)),
  [tAgain2 + 0.4, HatCam([0.4, 0.75, -11.5], 13)],
  ...cut(tNot - 0.3, Ac([0.6, 9.0, -14.0], [0.3, 0.2, -3.0])),
  [tCircle - 0.25, Ac([0.0, 50.0, 8.0], [0.0, 0.0, 3.0])],
  [tMumL - 0.3, Ac([0.0, 50.0, 8.0], [0.0, 0.0, 3.0])],
  ...cut(tMumL - 0.25, MumCam([-2.0, 1.25, 2.7], 34, 0.7)),
  [tPop - 0.35, MumCam([-1.9, 1.25, 2.5], 34, 0.7)],
  ...cut(tPop - 0.3, Ac([5.6, 2.7, -3.0], [1.8, 1.75, -0.9], 38)),
  [tSatnav - 0.2, Ac([5.2, 2.6, -2.6], [1.8, 1.7, -1.0], 38)],
  ...cut(tDest - 0.2, Ac([3.0, 2.0, 0.6], [1.8, 1.55, -1.45], 30)),
  [tPondR + 0.1, Ac([2.95, 2.0, 0.5], [1.8, 1.55, -1.45], 30)],
  ...cut(tIn - 0.2, Ac([E.x + 0.5, 12.0, E.z - 12.0], [E.x - 0.6, 0.0, E.z + 0.2])),
  [tFamily, Ac([E.x + 1.5, 12.5, E.z - 12.0], [E.x + 0.6, 0.0, E.z + 0.8])],
  ...cut(tRoad - 0.25, Ac([3.0, 2.7, 7.5], [1.3, 0.5, -6.5])),
  [S('right7').start - 0.2, Ac([3.0, 2.9, 7.0], [1.3, 0.6, -9.0])],
  ...cut(S('right7').start - 0.15, Ac([PC.x - 6.5, 3.6, PC.z - 7.0], [PC.x, 0.3, PC.z])),
  [S('outro').start, Ac([PC.x - 7.5, 5.0, PC.z - 8.0], [PC.x, 0.3, PC.z])],
  [TOTAL - 0.3, Ac([PC.x - 10, 9.0, PC.z - 11], [PC.x, 0.5, PC.z])],
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
  beacons.forEach((m, k) => m.emissiveIntensity = (Math.floor(t * 1.4) % 2 === 0) ? 1.0 : 0.25);
  // hero
  const hp = heroPose(t); placeCar(hero, hp, 0);
  blink(hero, t, right && t > tHazard, right && t > tHazard);
  hero.userData.hl.emissiveIntensity = (!right && win(t, tBeep - 0.05, tBeep + 0.6, 0.03) > 0 && Math.floor((t - tBeep) * 8) % 2 === 0) ? 3 : 0.3;
  // ducklings
  for (let i = 0; i < N; i++) {
    const d = right ? ducklingRight(i, t) : ducklingWrong(i, t);
    const ph = t * 13 + i * 1.7; const wk = d.walking ? 1 : 0;
    const roll = d.swim ? 0.05 * Math.sin(t * 2 + i) : 0.2 * wk * Math.sin(ph), bob = d.swim ? 0.02 * Math.sin(t * 2.5 + i) : 0.025 * wk * Math.abs(Math.sin(ph));
    setDuckling(i, d.x, d.y, d.z, d.h, roll, bob, d.pitch || 0);
  }
  dMeshes.forEach(m => m.instanceMatrix.needsUpdate = true);
  // Mum
  const ms = right ? mumRight(t) : mumWrong(t);
  mum.position.set(ms.x, ms.y, ms.z); mum.rotation.set(0, ms.h, 0);
  const ph = t * 10; mumP.body.rotation.z = ms.walk ? 0.12 * Math.sin(ph) : 0; mumP.body.position.y = ms.walk ? 0.03 * Math.abs(Math.sin(ph)) : 0;
  mumP.legs.forEach((g, k) => g.rotation.x = ms.walk ? 0.6 * Math.sin(ph + k * Math.PI) : (ms.flap > 0.5 ? 0.9 : 0));
  mumP.wings.forEach((g, k) => { const s = k ? 1 : -1; g.rotation.z = s * (ms.flap * (0.5 + 0.9 * Math.sin(t * 26))); });
  mumP.jaw.rotation.x = 0.7 * ms.jaw;
  const lost = ms.lost || 0; mumP.hd.rotation.set(ms.head || 0, lost * 0.7 * Math.sin((t - tMumL) * 3.2), lost * 0.18 * Math.sin((t - tMumL) * 1.6));
  mumP.brows.forEach(([b, s]) => { b.rotation.z = s * (0.5 * ms.angry - 0.45 * lost); b.position.y = 0.15 - 0.03 * ms.angry + 0.02 * lost; });
  mumP.cap.visible = ms.cap > 0.01; mumP.cap.scale.setScalar(Math.max(0.01, ms.cap));
  // sat-nav: in the driver's hand, then round Mum's neck
  const showDrv = right && t > tPop - 0.1 && t < tB1 + 2.5;
  drv.g.visible = showDrv;
  if (showDrv) { const up = back(clamp((t - tPop + 0.1) / 0.4)) * (1 - ramp(t, tB1 + 1.6, tB1 + 2.4)); drv.g.position.set(0, -0.68 + 1.22 * up, 0.15);
    const give = win(t, tLend - 0.2, tGive + 0.25, 0.2); drv.arms[1].rotation.set(1.4 * give + 0.15, 0, 0); drv.arms[0].rotation.set(1.4 * give + 0.15, 0, 0);
    const wave = ramp(t, tB0, tB0 + 0.3) * (1 - ramp(t, tB1 + 1.3, tB1 + 1.6)); if (wave > 0) drv.arms[1].rotation.set(0, 0, 2.6 * wave + 0.3 * Math.sin(t * 12) * wave); }
  mumP.sat.visible = right && t > tLend - 0.3;
  if (mumP.sat.visible) {
    mum.updateMatrixWorld(true); hero.updateMatrixWorld(true);
    if (!ms.sat) { drv.g.updateMatrixWorld(true); const hand = drv.arms[1].localToWorld(V3(0, -0.66, -0.05)); mumP.sat.position.copy(hand); mumP.sat.quaternion.setFromEuler(new THREE.Euler(0, hp.h, 0)); mumP.strap.visible = false; }
    else { const k = ease(clamp((t - tGive) / 0.3)); mumP.body.updateMatrixWorld(true); const chest = mumP.body.localToWorld(V3(0, 0.52, -0.42)); const hand = drv.arms[1].localToWorld(V3(0, -0.66, -0.05));
      mumP.sat.position.copy(k < 1 ? hand.lerp(chest, k) : chest); const q = new THREE.Quaternion(); mumP.body.getWorldQuaternion(q); mumP.sat.quaternion.copy(q); mumP.sat.rotateY(Math.PI); mumP.sat.rotateX(-0.2); mumP.strap.visible = k > 0.5; }
  }
  // splash
  const ts = t - tLandW; const spOn = !right && ts > 0 && ts < 1.6;
  for (let k = 0; k < NSP; k++) { if (!spOn) { spMesh.setMatrixAt(k, new THREE.Matrix4().makeScale(0, 0, 0)); continue; }
    const a = hash(k) * 6.28, sp = 2.5 + hash(k + 5) * 3.5, vy = 4 + hash(k + 9) * 5; const x = PC.x + Math.cos(a) * (1.2 + sp * ts), z = PC.z + Math.sin(a) * (1.2 + sp * ts), y = 0.2 + vy * ts - 4.9 * ts * ts;
    const s = y > 0 ? 1 - ts / 1.6 : 0; spMesh.setMatrixAt(k, new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion(), V3(s, s, s))); }
  spMesh.instanceMatrix.needsUpdate = true;
  spRing.visible = !right && ts > 0 && ts < 2.5; if (spRing.visible) { const r = 1.5 + ts * 2.2; spRing.scale.setScalar(r); spRing.position.set(PC.x, 0.08, PC.z); spRing.material.opacity = 0.7 * (1 - ts / 2.5); }
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = c.fov < 20 ? 1.0 : 0.15; camera.updateProjectionMatrix();
  applyCam(c, t, (!right && (win(t, tQuack - 0.02, tQuack + 0.45, 0.04) + win(t, tLandW - 0.02, tLandW + 0.4, 0.04)) > 0) ? 0.04 : 0);
  camera.updateMatrixWorld(true); mum.updateMatrixWorld(true); hero.updateMatrixWorld(true);
  const hpos = V3(hat.position.x, hat.position.y + 0.12, hat.position.z);
  screen = { car: project(hero.localToWorld(V3(0, 2.0, 0))), mum: project(mumP.hd.localToWorld(V3(0, 0.35, 0))), hat: project(hpos), drv: project(drv.hd.localToWorld(V3(0, 0.4, 0))), sat: project(mumP.sat.localToWorld(V3(0, 0.35, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0) => [clamp(p.x, 230, W - 230), clamp(p.y + dy, 560, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -120) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  ctx.translate(clamp(x, w / 2 + 30, W - w / 2 - 30) - x, 0);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, h / 2 - 4); ctx.lineTo(0, h / 2 + 34); ctx.lineTo(22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function hatRing(t, a, b) { if (t < a || t > b) return; const p = screen.hat; if (!p.ok) return; const f = win(t, a, b, 0.2), k = back((t - a) / 0.35);
  ctx.save(); ctx.globalAlpha = f; ctx.lineWidth = 10; ctx.strokeStyle = YEL; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(p.x, p.y + 40, 150 * k, 0, 7); ctx.stroke(); ctx.restore(); }
function loopArrow(t, a, b) { // dashed loop over the duck route, seen from above
  if (t < a || t > b) return; const f = win(t, a, b, 0.25), u = clamp((t - a) / 0.9);
  const pts = []; for (let s = 0; s <= LR * u; s += 0.6) { const p = ringAt(s); pts.push(project(V3(p.x, 0.3, p.z))); }
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = f * 0.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -t * 90;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 22; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 11; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.restore(); }
function counter(t, a, b, c) { if (t < a || t > b) return; let s;
  if (t < c) { const n = Math.round(1 + 999 * Math.pow(clamp((t - a) / (c - a)), 2.2)); s = `DUCKLINGS: ${n.toLocaleString('en-US')}`; } else s = 'DUCKLINGS: ∞';
  P_(s, '#f9a825', a, b, 50); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    counter(t, tDucklings - 0.1, S('hook2').end + 0.3, tNever);
    floatText('BEEP BEEP!', W / 2, 760, t, tBeep - 0.03, tBeep + 0.9, 120, '#ffffff', -0.06);
    P_('IMPATIENT', RED, tLose - 0.1, tBeep - 0.1, 54, iconX);
    P_('MUM: NOT AMUSED', '#ef6c00', tMum - 0.2, tSays - 0.1, 50);
    floatText('QUACK.', W / 2, 540, t, tQuack - 0.03, tQuack + 1.1, 190, '#ffd21f', -0.06);
    P_('DUCKLING POWER', '#f9a825', tLifts - 0.15, tSplash - 0.2, 52);
    floatText('SPLASH!', W / 2, 760, t, tLandW - 0.03, tLandW + 0.9, 160, '#9fe0ff', 0.06);
    P_('YOUR CAR: A BOAT', '#0277bd', tBoat - 0.3, tMum2 - 0.1, 52);
    P_('CAPTAIN: MUM', '#1a237e', tCaptain - 0.25, tRew0, 54);
  } else {
    P_('ENGINE: OFF', GREEN, tEngine - 0.1, tHazard - 0.1, 54, iconCheck);
    P_('HAZARDS: ON', '#ef6c00', tHazard - 0.1, tLook - 0.1, 54, iconWarn);
    P_('LOOK CLOSER...', '#37474f', tLook - 0.1, tSee, 54);
    hatRing(t, tTiny - 0.15, tAgain2 + 0.5);
    P_('SEEN HIM BEFORE...', '#6a1b9a', tWalked - 0.1, tAgain1 - 0.1, 48);
    P_('AGAIN.', '#6a1b9a', tAgain1 - 0.1, S('right3').end + 0.3, 56);
    P_('AND AGAIN.', '#6a1b9a', tAgain2 - 0.1, S('right3').end + 0.3, 56, null, 525);
    loopArrow(t, tCircle - 0.35, tMumL - 0.25);
    P_("IT'S A CIRCLE!", GREEN, tCircle - 0.15, tMumL - 0.25, 58, iconCheck);
    bubble('?', screen.mum, t, tMumL - 0.1, tPop - 0.3, 90, '#ffffff', '#111', -130);
    P_('MUM: LOST', '#ef6c00', tLost - 0.15, tPop - 0.3, 56);
    P_('SAT-NAV FOR MUM', '#1565c0', tSatnav - 0.2, tDest - 0.2, 52);
    bubble('QUACK!', screen.mum, t, tGive + 0.15, tDest - 0.2, 56, '#ffffff', '#111', -120);
    P_('DESTINATION: POND', '#0277bd', tDest - 0.15, S('right5').end + 0.3, 50);
    bubble('IN 50 M: TURN RIGHT ↱', screen.sat, t, tIn - 0.05, tFamily, 44, '#111', '#fff', -110);
    P_('HOME SWEET POND', '#0277bd', tFamily - 0.1, tRoad - 0.2, 50);
    P_('ROAD: CLEAR', GREEN, tRoad - 0.1, S('right7').start, 56, iconCheck);
  }
}
window.dbg = { heroPose, cam, Dm, ringAt, E, PC };
start(update, hud);
