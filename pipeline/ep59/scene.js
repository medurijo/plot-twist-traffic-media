// Episode 54: Motorway – a penguin parade crosses all lanes, very slowly
// hook (old style): on the motorway, suddenly everyone stops for no reason -> a penguin parade, 200 of them, crossing very slowly
// wrong: honk and squeeze through -> 200 penguins dive belly first, slide under your car -> your car is a sledge:
//        they slide you off the motorway, down to the sea, onto an iceberg. Bye bye!
// right: hazard lights, engine off, wait -> radio: marching music -> the parade waddles to the beat, twice as fast ->
//        the smallest one can't keep up: climbs onto your roof and uses your car as a slide (whee!) -> its dad leaves a fish under the wiper
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, box, instanced,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, _m, _q, _e, _v, _s
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
scene.background = new THREE.Color('#a9cdea'); scene.fog.color.set('#dfe8ef'); scene.fog.near = 220; scene.fog.far = 900;
hemi.groundColor.set('#b9c6d6');
// ---------------- timing ----------------
const tStops = WT('hook1', 'stops'), tSudden = WT('hook1', 'Suddenly');
const tThen = WT('hook2', 'Then'), tSee = WT('hook2', 'see'), tPeng = WT('hook2', 'penguin'), tTwo = WT('hook2', 'Two'), tCross = WT('hook2', 'crossing'), tVery = WT('hook2', 'Very'), tWhat = WT('hook2', 'What');
const tHonk = WT('wrong1', 'honk'), tSqueeze = WT('wrong1', 'squeeze');
const tBig = WT('wrong2', 'Big'), tTwo2 = WT('wrong2', 'Two'), tDive = WT('wrong2', 'dive'), tBelly = WT('wrong2', 'Belly'), tStraight = WT('wrong2', 'Straight'), tCar2 = WT('wrong2', 'car');
const tSledge = WT('wrong3', 'sledge'), tThey = WT('wrong3', 'They'), tOff = WT('wrong3', 'off'), tSea = WT('wrong3', 'sea'), tIce = WT('wrong3', 'iceberg'), tBye = WT('wrong3', 'Bye');
const tHazard = WT('right2', 'Hazard'), tEngine = WT('right2', 'Engine'), tWait = WT('right2', 'wait');
const tSlow = WT('right3', 'slow'), tRadio = WT('right3', 'radio'), tMarch = WT('right3', 'Marching');
const tWhole = WT('right4', 'whole'), tBeat = WT('right4', 'beat'), tTwice = WT('right4', 'Twice');
const tOnly = WT('right5', 'Only'), tSmall = WT('right5', 'smallest'), tKeep = WT('right5', 'keep'), tClimbs = WT('right5', 'climbs'), tRoof = WT('right5', 'roof'), tUses = WT('right5', 'uses'), tSlide = WT('right5', 'slide'), tWhee = WT('right5', 'Whee');
const tThank = WT('right6', 'thank'), tDad = WT('right6', 'dad'), tLeaves = WT('right6', 'leaves'), tFish = WT('right6', 'fish'), tWiper = WT('right6', 'wiper');
const isRight = t => t >= tRew0 + 0.5;
const BEAT = 60 / 132, T_MARCH = 40.7;

// ---------------- world: motorway along z, sea on +x ----------------
const LX = -1.9, LX2 = -5.6, PZ = -7.2, SEA = 24;
const snowMat = L('#eef3f8'), snowMat2 = L('#e3ebf3');
plane(-1700, SEA, -1700, 1700, snowMat, 0, 30);
plane(-17.6, 3.2, -900, 900, asphaltMat, 0.05, 7);
plane(-9.6, -7.6, -900, 900, snowMat2, 0.06, 9);
const waterMat = STD('#2c7fb0', { roughness: 0.15, metalness: 0.25, envMapIntensity: 1.2 });
plane(SEA, 1700, -1700, 1700, waterMat, 0.03, 30);
{ const g = new THREE.PlaneGeometry(0.15, 4); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -400; z < 400; z += 10) { dl.push([-3.75, 0.075, z]); dl.push([-13.4, 0.075, z]); } instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.25, 900); g2.rotateX(-Math.PI / 2); instanced(g2, markMat, [[0.0, 0.075, 0], [-7.45, 0.075, 0], [-9.75, 0.075, 0], [-17.3, 0.075, 0]], false); }
// snow banks along the road edges
{ const g = new THREE.SphereGeometry(1, 10, 6), list = []; const R = rng(11);
  for (let z = -300; z < 300; z += 2.2) { list.push([-18.8 - R() * 0.6, 0, z + R(), R() * 3, 1.4 + R(), 0.5 + R() * 0.3, 1.3 + R() * 0.5]); if (Math.abs(z - PZ) > 6) list.push([4.2 + R() * 0.5, 0, z + R(), R() * 3, 1.0 + R() * 0.5, 0.35 + R() * 0.2, 1.2 + R() * 0.4]); }
  instanced(g, L('#f4f8fb'), list, true); }
// penguin crossing sign (on the hard shoulder, faces +z)
{ const g = new THREE.Group(); g.position.set(3.6, 0, 26); scene.add(g);
  const tx = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(w / 2, 14); c.lineTo(w - 10, h - 20); c.lineTo(10, h - 20); c.closePath(); c.fill(); c.strokeStyle = '#e11d2e'; c.lineWidth = 22; c.stroke();
    c.fillStyle = '#111'; c.beginPath(); c.ellipse(w / 2, 150, 30, 50, 0, 0, 7); c.fill(); c.beginPath(); c.arc(w / 2, 92, 22, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(w / 2 + 8, 158, 16, 36, 0, 0, 7); c.fill(); c.fillStyle = '#ff9800'; c.beginPath(); c.moveTo(w / 2 + 18, 88); c.lineTo(w / 2 + 40, 95); c.lineTo(w / 2 + 18, 100); c.fill(); });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshLambertMaterial({ map: tx, transparent: true, alphaTest: 0.3 })); s.position.y = 2.6; g.add(s);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), STD('#9e9e9e')); p.position.set(0, 1.3, -0.03); p.castShadow = true; g.add(p); }
// snowy pine forest
{ const R = rng(54), pts = [];
  while (pts.length < 900) { const cx = -30 - R() * 600, cz = (R() - 0.5) * 1400, n = 4 + R() * 12 | 0; for (let k = 0; k < n; k++) pts.push([cx + (R() - 0.5) * 40, cz + (R() - 0.5) * 40, 0.8 + R() * 1.0]); }
  for (let k = 0; k < 140; k++) { const x = 7 + R() * 14, z = (R() < 0.5 ? -1 : 1) * (30 + R() * 300); pts.push([x, z, 0.6 + R() * 0.6]); }
  const cone = new THREE.ConeGeometry(1.9, 3.6, 8), cone2 = new THREE.ConeGeometry(1.0, 1.4, 8);
  const tri = new THREE.InstancedMesh(cone, new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length * 3);
  const cap = new THREE.InstancedMesh(cone2, L('#f7fbff', { flatShading: true }), pts.length * 3);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.28, 1.6, 6), L('#5d3f25'), pts.length);
  pts.forEach(([x, z, s], i) => { _m.compose(_v.set(x, 0.8 * s, z), _q.identity(), _s.set(s, s, s)); trunk.setMatrixAt(i, _m);
    for (let k = 0; k < 3; k++) { const y = (2.6 + k * 1.6) * s, sc = s * (1 - k * 0.25); _m.compose(_v.set(x, y, z), _q.identity(), _s.set(sc, sc, sc)); tri.setMatrixAt(3 * i + k, _m); tri.setColorAt(3 * i + k, new THREE.Color(['#2f6b3a', '#34763f', '#2a6034'][(i + k) % 3]));
      _m.compose(_v.set(x, y + 1.25 * sc, z), _q.identity(), _s.set(sc * 0.95, sc, sc * 0.95)); cap.setMatrixAt(3 * i + k, _m); } });
  for (const m of [tri, cap, trunk]) { m.castShadow = true; m.receiveShadow = true; scene.add(m); } }
// distant ice floes
{ const g = new THREE.CylinderGeometry(1, 1.1, 0.4, 7), list = []; const R = rng(9); for (let k = 0; k < 40; k++) list.push([SEA + 30 + R() * 300, 0.05, (R() - 0.5) * 500, R() * 3, 3 + R() * 9, 1, 2 + R() * 7]); instanced(g, L('#f6fbff'), list, true); }
// the iceberg (wrong ending)
const BERG = new THREE.Group(); BERG.position.set(42, 0, 0); scene.add(BERG);
{ const im = STD('#f2f9ff', { roughness: 0.35, flatShading: true }), ib = STD('#bfe6f7', { roughness: 0.3, flatShading: true });
  const a = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), ib); a.scale.set(5.2, 1.4, 4.2); a.position.y = -0.7; BERG.add(a);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.8, 0.6, 9), im); top.position.y = 0.4; BERG.add(top);
  const pk = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), im); pk.scale.set(1.6, 2.6, 1.4); pk.position.set(2.6, 1.4, -2.6); BERG.add(pk);
  BERG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const BERG_TOP = 0.7;

// ---------------- vehicles ----------------
const hero = makeCar('#ff7a1a');
const glassMat = hero.userData.bodyG.children[1].material; glassMat.color.set('#8fb0c8'); glassMat.transparent = true; glassMat.opacity = 0.45; glassMat.metalness = 0.3; glassMat.depthWrite = false;
hero.userData.bodyG.children[1].castShadow = false; hero.userData.bodyG.children[1].userData.noAO = true;
const HB = hero.userData.bodyG;
const skin = STD('#f1c8a5', { roughness: 0.7 });
const DRV = new THREE.Group(); DRV.position.set(-0.42, -0.38, 0.12); HB.add(DRV);
{ const tor = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.3, 4, 10), STD('#2f7bff')); tor.position.y = 1.3; DRV.add(tor);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), skin); hd.position.y = 1.7; DRV.add(hd);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), STD('#e53935')); hat.position.y = 1.73; DRV.add(hat);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), STD('#fff')); pom.position.y = 1.92; DRV.add(pom);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), STD('#fff')); e.position.set(s * 0.06, 1.72, -0.135); DRV.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), STD('#111')); p.position.set(s * 0.06, 1.72, -0.175); DRV.add(p); }
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 8, 20), STD('#222')); sw.position.set(0, 1.5, -0.45); sw.rotation.x = -0.9; DRV.add(sw); }
DRV.traverse(o => { if (o.isMesh) o.castShadow = true; });
// wiper + fish
const WIPER = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.025, 0.03), STD('#222')); WIPER.position.set(0.2, 1.04, -1.03); WIPER.rotation.set(-0.85, 0, 0.08); HB.add(WIPER);
const FISH = new THREE.Group(); scene.add(FISH);
{ const fm = STD('#bcd8ee', { metalness: 0.45, roughness: 0.3 }); const b = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), fm); b.scale.set(0.22, 0.08, 0.045); FISH.add(b);
  const tl = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 3), fm); tl.rotation.z = Math.PI / 2; tl.scale.set(1, 1, 0.35); tl.position.x = -0.26; FISH.add(tl);
  const st = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), STD('#5d7f99')); st.scale.set(0.2, 0.03, 0.046); st.position.y = 0.04; FISH.add(st);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), STD('#111')); e.position.set(0.15, 0.015, s * 0.04); FISH.add(e); }
  FISH.traverse(o => { if (o.isMesh) o.castShadow = true; }); FISH.scale.setScalar(1.6); }
// other traffic: stopped queue + opposite carriageway
const TRAF = []; { const cols = ['#e53935', '#fdd835', '#ffffff', '#43a047', '#8e24aa', '#26c6da', '#5d4037', '#212121', '#90a4ae', '#1e88e5'];
  [[LX, 8.5], [LX, 15.2], [LX, 22], [LX2, 4.6], [LX2, 11.4], [LX2, 18.3], [LX2, 25]].forEach(([x, z], k) => { const c = makeCar(cols[k % cols.length]); TRAF.push({ c, x, z, h: 0 }); });
  [[-11.6, -14.5], [-15.2, -15.5], [-11.6, -21.5], [-15.2, -22.5]].forEach(([x, z], k) => { const c = makeCar(cols[(k + 6) % cols.length]); TRAF.push({ c, x, z, h: Math.PI }); }); }

// ---------------- penguins (instanced, local forward +x) ----------------
const NP = 200, BABY = 200, DAD = 201, NALL = 202;
const COLS = 6;
const PEN = Array.from({ length: NALL }, (_, i) => { const r = Math.floor(i / COLS), c = i % COLS;
  return { i, bx: -r * 0.72 - (c % 2) * 0.32 + (hash(i) - 0.5) * 0.18, bz: PZ + (c - (COLS - 1) / 2) * 0.62 + (hash(i + 7) - 0.5) * 0.14, s: 0.85 + hash(i + 3) * 0.25, ph: hash(i + 11) * 6.28 }; });
PEN[BABY].s = 0.5; PEN[DAD].s = 1.25;
const TAIL_OFF = Math.min(...PEN.slice(0, NP).map(p => p.bx));
const blackM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55 }), whiteM = STD('#f6f6f2', { roughness: 0.6 }), orM = STD('#ff9a1f', { roughness: 0.5 }), cheekM = STD('#ffc23a', { roughness: 0.5 }), pupM = STD('#101010', { roughness: 0.2 }), eyeM = STD('#ffffff', { roughness: 0.25 });
const PARTS = [];
function part(geo, mat, mult, localFn) { const m = new THREE.InstancedMesh(geo, mat, NALL * mult); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); PARTS.push({ m, mult, localFn }); return m; }
const M4 = (x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V3(sx, sy, sz));
const L_BACK = M4(-0.02, 0.44, 0, 0.27, 0.44, 0.27), L_BELLY = M4(0.07, 0.41, 0, 0.215, 0.36, 0.235), L_HEAD = M4(0.02, 0.86, 0, 0.19, 0.18, 0.19);
const L_EYE = [-1, 1].map(s => M4(0.15, 0.9, s * 0.075, 0.05, 0.055, 0.05)), L_PUP = [-1, 1].map(s => M4(0.19, 0.9, s * 0.078, 0.028, 0.032, 0.028)), L_HL = [-1, 1].map(s => M4(0.205, 0.915, s * 0.07, 0.009, 0.009, 0.009));
const L_CHEEK = [-1, 1].map(s => M4(0.07, 0.79, s * 0.14, 0.05, 0.035, 0.06, s * 0.4));
const L_BEAK = M4(0.25, 0.85, 0, 1, 1, 1, 0, 0, -Math.PI / 2);
const sph = new THREE.SphereGeometry(1, 20, 14);
const backIM = part(sph, blackM, 1, (P) => L_BACK);
part(sph, whiteM, 1, () => L_BELLY);
const headIM = part(sph, blackM, 1, () => L_HEAD);
part(sph, eyeM, 2, (P, k) => L_EYE[k]);
part(sph, pupM, 2, (P, k) => L_PUP[k]);
part(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' }), 2, (P, k) => L_HL[k]);
part(sph, cheekM, 2, (P, k) => L_CHEEK[k]);
part(new THREE.ConeGeometry(0.04, 0.13, 10), orM, 1, () => L_BEAK);
const flipIM = part(sph, blackM, 2, (P, k) => { const s = k ? 1 : -1; return M4(-0.01, 0.62, s * 0.26, 0.07, 0.24, 0.035, s * (0.18 + P.flap), 0, 0).multiply(M4(0, -0.75, 0)); });
part(sph, orM, 2, (P, k) => { const s = k ? 1 : -1; const st = (k ? 1 : -1) * P.step; return M4(0.07 + 0.08 * st, 0.025 + 0.04 * Math.max(0, st), s * 0.1, 0.1, 0.03, 0.06); });
for (let i = 0; i < NALL; i++) { const col = new THREE.Color(i === BABY ? '#8b929d' : '#1c2130'); backIM.setColorAt(i, col); headIM.setColorAt(i, col); flipIM.setColorAt(2 * i, col); flipIM.setColorAt(2 * i + 1, col); }
// column head x along the road (pure function of t)
const vCol = t => { const right = isRight(t); if (!right) return t < tHonk ? 0.25 : 0; return 0.25 + 1.75 * ramp(t, tWhole - 0.3, tTwice + 0.2); };
const HX = [10]; { const dt = 1 / 60; for (let t = dt; t < TOTAL + 2; t += dt) HX.push(HX[HX.length - 1] + vCol(t) * dt); }
const headX = t => { const k = clamp(t * 60, 0, HX.length - 2), i = Math.floor(k); return lerp(HX[i], HX[i + 1], k - i); };

// ---------------- car motion ----------------
const V0 = 13, TB = 0.85;
function heroBase(t) { const t1 = tStops + TB; if (t < tStops) return V0 * TB / 2 + V0 * (tStops - t); if (t < t1) return V0 * Math.pow(t1 - t, 2) / (2 * TB); return 0; }
const tSlide0 = tThey - 0.1, tSlide1 = tIce + 0.1;
function heroPose(t) {
  const right = isRight(t); let p = { x: LX, z: heroBase(t), h: 0, y: 0, pitch: 0, roll: 0 };
  if (!right && t > tStraight) { p.y = 0.44 * ease(clamp((t - tStraight - 0.3) / 0.8)); p.roll = 0.03 * Math.sin(t * 9) * clamp((t - tStraight) / 0.8); }
  if (!right && t > tSlide0) { const u = clamp((t - tSlide0) / (tSlide1 - tSlide0)); const e = u < 0.2 ? u * u / 0.4 : u > 0.85 ? 1 - Math.pow(1 - u, 2) / 0.3 : (u - 0.1) / 0.8; const ee = clamp(e);
    p.x = lerp(LX, BERG.position.x, ee); p.h = -0.35 * Math.sin(Math.PI * ee); p.roll = 0.04 * Math.sin(t * 13); if (ee > 0.93) p.y = lerp(0.44, 0.44 + BERG_TOP, (ee - 0.93) / 0.07);
    if (u >= 1) { p.y = 0.44 * (1 - ease(clamp((t - tBye + 0.3) / 0.4))) + BERG_TOP + 0.05 * Math.sin(t * 1.6); p.roll = 0.02 * Math.sin(t * 1.3); } }
  if (!right && t > tSlide1) { const d = t - tSlide1; p.x += 0.9 * d; p.z += 0.4 * d; }
  return p;
}
const bergOff = t => { if (isRight(t) || t < tSlide1) return V3(0, 0, 0); const d = t - tSlide1; return V3(0.9 * d, 0.05 * Math.sin(t * 1.6), 0.4 * d); };

// ---------------- penguin state (pure function of t) ----------------
// returns {x,y,z,yaw,pitch,roll,flap,step,swim}
const _P = {};
const slotOf = []; { const order = PEN.slice(0, NP).map(p => ({ i: p.i, d: Math.abs(p.bx + headX(tHonk) - LX) + Math.abs(p.bz - 0) * 0.3 })).sort((a, b) => a.d - b.d); order.forEach((o, k) => slotOf[o.i] = k); }
function slotLocal(k) { if (k < 12) return { x: (k % 3 - 1) * 0.55, z: (Math.floor(k / 3) - 1.5) * 0.95, under: true }; const kk = k - 12; return { x: -2.6 - Math.floor(kk / 3) * 0.55, z: (kk % 3 - 1) * 0.62, under: false }; }
function penguin(i, t) {
  const P = PEN[i], right = isRight(t);
  const o = { x: 0, y: 0, z: P.bz, yaw: 0, pitch: 0, roll: 0, flap: 0, step: 0, swim: false, s: P.s };
  const hx = headX(t);
  const marching = right && t > T_MARCH;
  const ph = marching ? Math.PI * (t - T_MARCH) / BEAT + (i % 2) * 0.0 : (hx / 0.18) * Math.PI * (1 / P.s) + P.ph;
  const walking = vCol(t) > 0.01;
  o.x = hx + P.bx; if (i === DAD) { o.x = hx + 1.1; o.z = PZ; }
  if (walking) { o.roll = (marching ? 0.22 : 0.13) * Math.sin(ph); o.step = Math.sin(ph); o.flap = (marching ? 0.55 : 0.15) * Math.max(0, Math.sin(ph * 0.5 + P.ph)) + 0.08; o.y = 0.03 * Math.abs(Math.sin(ph)); }
  if (!right) {
    if (t > tHonk) { const u = ease(clamp((t - tHonk - 0.15 - hash(i + 5) * 0.4) / 0.4)); o.yaw = lerp(0, -Math.PI / 2, u); o.roll = 0; o.flap = u * 0.25 * (1 + Math.sin(t * 8 + i)); o.step = 0;
      if (t > tBig - 0.2 && t < tDive) { o.flap = 0.6 + 0.3 * Math.sin(t * 14 + i); } }
    if (t > tDive - 0.1) { const du = ease(clamp((t - tDive + 0.1 - hash(i + 9) * 0.35) / 0.35)); o.pitch = du * Math.PI / 2; o.flap = 1.3 * du; o.y = 0; }
    if (t > tStraight - 0.4 && i < NP) { // slide into the slots relative to the car
      const k = slotOf[i]; const sl = slotLocal(k); const hp = heroPose(t);
      const loc = V3(sl.x, 0, sl.z).applyAxisAngle(V3(0, 1, 0), hp.h);
      const target = { x: hp.x + loc.x, z: hp.z + loc.z };
      const u = ease(clamp((t - tStraight + 0.4 - (k / NP) * 1.0) / 0.9));
      const sx = hx + P.bx; o.x = lerp(sx, target.x, u); o.z = lerp(P.bz, target.z, u);
      o.yaw = lerp(-Math.PI / 2, sl.under ? -Math.PI / 2 : 0, u);
      if (t > tSlide0 && !sl.under) { // the stream follows the car along x
        o.x = target.x; o.z = target.z; o.yaw = 0; }
      if (sl.under) o.yaw = -Math.PI / 2 + hp.h;
      if (sl.under && hp.y > 0.5) o.y = hp.y - 0.44;
      // swimming in the sea
      if (!sl.under && o.x > SEA + 0.5) { o.swim = true; o.pitch = 0; o.y = -0.42 + 0.04 * Math.sin(t * 3 + i); o.flap = 0.5 + 0.4 * Math.sin(t * 6 + i); o.yaw = 0.5 * Math.sin(i); }
      if (t > tBye - 0.3 && sl.under) { const bu = ease(clamp((t - tBye + 0.3 - hash(i) * 0.2) / 0.4)); const a = k / 12 * 6.28 + 0.3; const ring = { x: hp.x + Math.cos(a) * 2.7, z: hp.z + Math.sin(a) * 2.4 };
        o.x = lerp(o.x, ring.x, bu); o.z = lerp(o.z, ring.z, bu); o.pitch = (1 - bu) * Math.PI / 2; o.flap = bu * (0.9 + 0.6 * Math.sin(t * 12 + i)); o.y = lerp(hp.y - 0.44, BERG_TOP + bergOff(t).y, bu) + 0.5 * Math.sin(Math.PI * bu); o.yaw = Math.atan2(-0.8, -0.6); }
    }
    if (i === DAD && t > tDive - 0.1) { o.x = hx + 1.1; }
  } else {
    // waving at the end, swimming when in the sea
    if (i < NP && o.x > SEA + 0.4) { o.swim = true; o.pitch = 0; o.roll = 0; o.y = -0.42 + 0.04 * Math.sin(t * 3 + i); o.flap = 0.5 + 0.4 * Math.sin(t * 6 + i); o.step = 0; }
    if (i === DAD) dadRight(o, t, hx);
    if (i === BABY) babyRight(o, t, hx);
  }
  if (i === BABY && !right) { o.x = hx + TAIL_OFF - 1.0; o.z = PZ + 0.4; if (t > tHonk) { o.x = hx + TAIL_OFF - 1.0; } }
  return o;
}
// dad: leads the column, then waits on the hard shoulder for the little one, brings the fish
const DAD_WAIT = { x: 3.0, z: -6.1 }, DAD_CAR = { x: LX + 1.35, z: -3.0 };
function dadRight(o, t, hx) {
  const tLeave = 43.0;
  if (t < tLeave) return;
  const fromX = Math.min(hx + 1.1, 60);
  const u = ease(clamp((t - tLeave) / 0.01)); o.x = DAD_WAIT.x; o.z = DAD_WAIT.z; o.yaw = Math.PI * 0.85; o.roll = 0; o.step = 0; o.flap = 0.1;
  if (t < 46.0) { const v = clamp((t - tLeave) / 3.0); o.x = lerp(Math.min(hx - 2 + 1.1, DAD_WAIT.x + 12), DAD_WAIT.x, ease(v)); }
  if (t > tWhee - 0.4 && t < tThank) { o.yaw = lerp(Math.PI * 0.85, Math.PI * 1.15, 0.5 + 0.5 * Math.sin(t * 3)); o.flap = 0.6 + 0.4 * Math.sin(t * 10); }
  if (t > tThank - 0.2) { const v = clamp((t - tThank + 0.2) / (tFish - 0.3 - tThank + 0.2)); o.x = lerp(DAD_WAIT.x, DAD_CAR.x, ease(v)); o.z = lerp(DAD_WAIT.z, DAD_CAR.z, ease(v)); o.yaw = Math.atan2(-(DAD_CAR.z - DAD_WAIT.z), DAD_CAR.x - DAD_WAIT.x);
    if (v > 0 && v < 1) { const ph = t * 14; o.roll = 0.15 * Math.sin(ph); o.step = Math.sin(ph); }
    if (v >= 1) { const tgt = V3(LX + 0.2, 1.0, -1.1); o.yaw = Math.atan2(-(tgt.z - o.z), tgt.x - o.x); o.pitch = 0.5 * win(t, tFish - 0.3, tWiper + 0.4, 0.25); }
    if (t > tWiper + 0.3) { o.pitch = 0; o.yaw = Math.atan2(3.8, -0.45); o.flap = t > S('right7').start - 0.2 ? 0.2 + 1.1 * Math.max(0, Math.sin(t * 9)) : 0.15; } }
}
// baby: falls behind, climbs the car, slides off it, zooms to dad
function babyRight(o, t, hx) {
  const tailX = hx + TAIL_OFF;
  const lagX = t < 44.0 ? tailX - 1.0 : Math.min(headX(44) + TAIL_OFF - 1.0 + 2.2 * (t - 44), -2.9 + 0.15 * Math.max(0, t - 46.1));
  o.x = lagX; o.z = PZ + 0.5; o.yaw = 0;
  const tH1 = tClimbs - 0.15, tH2 = tRoof - 0.25, tS0 = tUses, tS1 = tSlide + 0.15, tJ1 = tS1 + 0.45, tZ1 = tWhee + 0.9;
  const startP = V3(lagX, 0, PZ + 0.5);
  if (t >= tH1 - 0.6 && t < tH1) { const v = ease((t - tH1 + 0.6) / 0.6); o.x = lerp(lagX, LX - 0.2, v); o.z = lerp(PZ + 0.5, -3.0, v); o.yaw = Math.atan2(-(-3.0 - PZ), LX - 0.2 - lagX); o.roll = 0.2 * Math.sin(t * 16); o.step = Math.sin(t * 16); }
  const bonnet = V3(LX, 0.92, -1.75), roof = V3(LX, 1.62, 0.15), front = V3(LX, 0.9, -2.35), land = V3(LX + 0.4, 0, -4.6), zoomTo = V3(DAD_WAIT.x - 0.6, 0, DAD_WAIT.z + 0.3);
  const hop = (a, b, u, h) => { const p = a.clone().lerp(b, ease(u)); p.y += h * Math.sin(Math.PI * clamp(u)); return p; };
  let p = null;
  if (t >= tH1 && t < tH1 + 0.45) { p = hop(V3(LX - 0.2, 0, -3.0), bonnet, (t - tH1) / 0.45, 0.9); o.yaw = Math.PI / 2 + Math.PI; o.flap = 1.0; }
  else if (t >= tH1 + 0.45 && t < tH2) { p = bonnet.clone(); o.yaw = -Math.PI / 2; o.flap = 0.3; }
  else if (t >= tH2 && t < tH2 + 0.45) { p = hop(bonnet, roof, (t - tH2) / 0.45, 0.8); o.yaw = -Math.PI / 2; o.flap = 1.0; }
  else if (t >= tH2 + 0.45 && t < tS0) { p = roof.clone(); o.yaw = Math.PI / 2; o.flap = 0.4 + 0.4 * Math.sin(t * 8); }
  else if (t >= tS0 && t < tS1) { const v = clamp((t - tS0) / (tS1 - tS0)); const a = easeIn(v);
    const pts = [roof, V3(LX, 1.5, -0.65), V3(LX, 1.0, -1.15), V3(LX, 0.95, -1.9), front]; const f = a * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(f)); p = pts[k].clone().lerp(pts[k + 1], f - k);
    o.yaw = Math.PI / 2; o.pitch = Math.PI / 2 * ease(clamp(v * 4)); o.flap = 1.2; }
  else if (t >= tS1 && t < tJ1) { const v = (t - tS1) / (tJ1 - tS1); p = front.clone().lerp(land, v); p.y = lerp(0.9, 0, v) + 0.9 * Math.sin(Math.PI * v); o.yaw = Math.PI / 2; o.pitch = Math.PI / 2; o.flap = 1.4; }
  else if (t >= tJ1 && t < tZ1) { const v = ease(clamp((t - tJ1) / (tZ1 - tJ1))); const c1 = V3(LX + 2.5, 0, -6.5);
    p = land.clone().multiplyScalar((1 - v) * (1 - v)).add(c1.clone().multiplyScalar(2 * v * (1 - v))).add(zoomTo.clone().multiplyScalar(v * v));
    const dv = c1.clone().sub(land).multiplyScalar(2 * (1 - v)).add(zoomTo.clone().sub(c1).multiplyScalar(2 * v)); o.yaw = Math.atan2(-dv.z, dv.x); o.pitch = Math.PI / 2 * (1 - ramp(t, tZ1 - 0.25, tZ1)); o.flap = 1.4; }
  else if (t >= tZ1) { const fv = ease(clamp((t - tFish) / 1.4)); p = zoomTo.clone().lerp(V3(-1.75, 0, -3.7), fv); o.yaw = fv > 0 && fv < 1 ? Math.atan2(-(-3.7 - zoomTo.z), -1.75 - zoomTo.x) : Math.atan2(4.9, 0.75); if (fv > 0 && fv < 1) { o.roll = 0.2 * Math.sin(t * 18); } o.flap = 0.3 + (t > S('right7').start - 0.2 ? 0.9 * Math.max(0, Math.sin(t * 10 + 1)) : 0); o.y = 0.06 * Math.abs(Math.sin(t * 6)); }
  if (p) { o.x = p.x; o.y = p.y + (o.pitch > 0.3 ? 0.08 : 0); o.z = p.z; o.roll = 0; o.step = 0; }
}
const _B = new THREE.Matrix4(), _T = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _E = new THREE.Euler(0, 0, 0, 'YZX');
function updatePenguins(t) {
  for (let i = 0; i < NALL; i++) {
    const o = penguin(i, t); _P[i] = o; const s = o.s;
    _E.set(o.roll, o.yaw, -o.pitch, 'YZX'); _Q.setFromEuler(_E);
    const lift = 0.27 * s * Math.sin(o.pitch);
    _B.compose(_v.set(o.x, o.y + lift, o.z), _Q, _s.set(s, s, s));
    for (const Pt of PARTS) for (let k = 0; k < Pt.mult; k++) { _T.multiplyMatrices(_B, Pt.localFn(o, k)); Pt.m.setMatrixAt(i * Pt.mult + k, _T); }
  }
  for (const Pt of PARTS) Pt.m.instanceMatrix.needsUpdate = true;
}
const penHead = (i, dy = 0) => { const o = _P[i]; const v = V3(0.05, 0.9 + dy, 0).multiplyScalar(o.s).applyEuler(new THREE.Euler(o.roll, o.yaw, -o.pitch, 'YZX')); return v.add(V3(o.x, o.y + 0.27 * o.s * Math.sin(o.pitch), o.z)); };

// ---------------- puffs ----------------
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 90 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }
// falling snow (pure function of t, around the camera)
const NS = 1400; const snowGeo = new THREE.BufferGeometry(); snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 3), 3));
const SNOW = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.07, transparent: true, opacity: 0.85, depthWrite: false })); SNOW.frustumCulled = false; scene.add(SNOW);

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HF = (off, look, fov = 40) => t => { const c = heroPose(t); return [V3(c.x + off[0], c.y + off[1], c.z + off[2]), V3(c.x + look[0], c.y + look[1], c.z + look[2]), fov]; };
const camKeys = [
  [0.0, HF([1.6, 2.4, 8.5], [-0.6, 1.2, -6], 40)],
  [tStops - 0.2, HF([1.4, 2.2, 7.6], [-0.6, 1.1, -6], 40)],
  [tThen - 0.1, HF([1.2, 2.2, 7.2], [-0.6, 1.0, -6], 40)],
  ...cut(tThen - 0.05, Ac([-1.6, 1.7, -2.3], [-2.2, 0.6, -8.5], 44)),
  [tPeng - 0.15, Ac([-1.6, 1.6, -2.5], [-2.2, 0.6, -8.5], 44)],
  ...cut(tPeng - 0.1, Ac([4.6, 1.15, -5.3], [-1.0, 0.6, -7.4], 36)),
  [tTwo - 0.2, Ac([4.4, 1.15, -5.4], [-1.0, 0.6, -7.4], 36)],
  ...cut(tTwo - 0.15, Ac([17.0, 7.5, -3.0], [-6.0, 0.0, -7.6], 40)),
  [tVery - 0.2, Ac([17.5, 8.0, -2.5], [-7.0, 0.0, -7.6], 40)],
  ...cut(tVery - 0.15, Ac([1.5, 0.6, -2.5], [-0.6, 0.4, -6.4], 34)),
  [tWhat - 0.2, Ac([1.4, 0.6, -2.6], [-0.6, 0.42, -6.4], 34)],
  ...cut(tWhat - 0.15, Ac([0.6, 3.2, 7.2], [-1.6, 0.8, -6.5], 40)),
  [S('hook2').end + 0.4, Ac([0.6, 3.4, 7.6], [-1.6, 0.8, -6.5], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([1.6, 2.4, 4.8], [-2.2, 0.7, -6.8], 40)),
  [S('wrong1').end + 0.2, Ac([1.4, 2.3, 4.3], [-2.2, 0.7, -6.8], 40)],
  ...cut(tBig - 0.15, Ac([-1.5, 1.05, -3.1], [-2.0, 0.65, -7.4], 40)),
  [tDive - 0.2, Ac([-1.5, 1.1, -3.3], [-2.0, 0.65, -7.4], 40)],
  ...cut(tDive - 0.15, Ac([6.5, 3.2, -1.4], [-2.4, 0.5, -4.2], 40)),
  [S('wrong2').end + 0.3, Ac([6.3, 3.0, -0.6], [-2.2, 0.6, -2.2], 40)],
  ...cut(tSledge - 0.4, Ac([3.6, 1.3, 4.6], [-1.9, 0.7, 0.0], 38)),
  [tSlide0 - 0.1, Ac([3.4, 1.3, 4.4], [-1.9, 0.75, 0.0], 38)],
  ...cut(tSlide0 - 0.05, HF([-1.5, 2.6, 9.0], [0.6, 0.6, 0], 40)),
  [tSea, HF([-1.0, 2.4, 9.2], [0.6, 0.7, 0], 40)],
  ...cut(tSea + 0.05, Ac([22.0, 5.5, 15.0], [41.0, 1.0, 0.5], 40)),
  [tBye - 0.3, Ac([23.0, 5.0, 14.0], [41.5, 1.2, 0.5], 40)],
  ...cut(tBye - 0.25, t => { const o = bergOff(t); return [V3(35.5 + o.x, 2.9, 8.5 + o.z), V3(42 + o.x, 1.6, 0.3 + o.z), 40]; }),
  [tRew0, t => { const o = bergOff(t); return [V3(35.0 + o.x, 3.1, 9.2 + o.z), V3(42 + o.x, 1.6, 0.3 + o.z), 40]; }],
  // right
  ...cut(tRew1, Ac([1.6, 2.4, 4.8], [-2.2, 0.7, -6.8], 40)),
  [tHazard - 0.3, Ac([1.4, 2.3, 4.5], [-2.2, 0.7, -6.8], 40)],
  ...cut(tHazard - 0.25, Ac([-0.6, 1.7, 6.6], [-1.9, 0.9, 0.5], 38)),
  [S('right2').end + 0.2, Ac([-0.7, 1.75, 6.9], [-1.9, 0.9, 0.5], 38)],
  ...cut(tSlow - 0.35, Ac([1.5, 0.6, -2.5], [-0.6, 0.4, -6.4], 34)),
  [tRadio - 0.4, Ac([1.4, 0.6, -2.6], [-0.6, 0.42, -6.4], 34)],
  ...cut(tRadio - 0.35, Ac([-0.4, 1.9, -5.4], [-1.9, 1.05, -0.4], 38)),
  [S('right3').end + 0.1, Ac([-0.5, 1.9, -5.2], [-1.9, 1.05, -0.4], 38)],
  ...cut(tWhole - 0.2, Ac([16.0, 6.0, -1.0], [2.0, 0.2, -7.6], 40)),
  [tTwice - 0.2, Ac([16.5, 6.2, -0.6], [3.0, 0.2, -7.6], 40)],
  ...cut(tTwice - 0.15, Ac([9.5, 1.1, -4.6], [4.5, 0.6, -7.4], 38)),
  [S('right4').end + 0.2, Ac([10.5, 1.2, -4.8], [5.5, 0.6, -7.4], 38)],
  ...cut(tOnly - 0.2, Ac([-0.6, 1.0, -3.0], [-3.0, 0.4, -7.2], 38)),
  [tClimbs - 0.4, Ac([-0.4, 1.1, -2.9], [-2.4, 0.45, -6.4], 38)],
  ...cut(tClimbs - 0.35, Ac([3.6, 2.1, -3.6], [-1.9, 1.0, -1.2], 40)),
  [tUses - 0.2, Ac([3.4, 2.4, -2.6], [-1.9, 1.3, -0.4], 40)],
  ...cut(tUses - 0.15, Ac([4.6, 1.8, -2.4], [-1.9, 1.0, -1.2], 40)),
  [tSlide + 0.2, Ac([4.4, 1.6, -3.0], [-1.6, 0.8, -2.4], 40)],
  [tWhee + 0.9, Ac([6.8, 1.6, -0.8], [2.0, 0.4, -5.8], 40)],
  ...cut(tThank - 0.3, Ac([6.0, 2.6, -10.0], [0.6, 0.8, -4.2], 40)),
  [tFish - 0.3, Ac([5.2, 2.5, -9.0], [0.0, 0.9, -3.4], 40)],
  ...cut(tFish - 0.25, Ac([-3.6, 2.8, -6.2], [-1.3, 1.0, -1.4], 34)),
  [S('right7').start - 0.2, Ac([-3.5, 2.8, -6.0], [-1.3, 1.0, -1.4], 34)],
  ...cut(S('right7').start - 0.15, Ac([-1.0, 2.9, -8.6], [-1.0, 1.0, -2.4], 40)),
  [TOTAL, Ac([-1.0, 3.2, -9.6], [-1.0, 1.0, -2.4], 40)],
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
  si = 0; SPR.forEach(s => s.visible = false);
  const hp = heroPose(t); placeCar(hero, hp);
  hero.userData.hl.emissiveIntensity = 0.5;
  hero.userData.tl.emissiveIntensity = t > tStops - 0.1 && t < tStops + 2.5 ? 1.8 : 0.35;
  const hz = right && t > tHazard - 0.05; blink(hero, t, hz, hz);
  hero.updateMatrixWorld(true);
  const CW = v => hero.localToWorld(v.clone());
  // other traffic follows the same braking profile
  const base = heroBase(t);
  TRAF.forEach(T => { if (T.h === 0) placeCar(T.c, { x: T.x, z: T.z + base * (T.x === LX2 ? 1.02 : 1), h: 0 }); else placeCar(T.c, { x: T.x, z: T.z, h: T.h }); T.c.userData.tl.emissiveIntensity = 1.4; });
  // iceberg drift
  const bo = bergOff(t); BERG.position.set(42 + bo.x, bo.y, bo.z);
  // penguins
  updatePenguins(t);
  // fish
  FISH.visible = right && t > tThank - 0.3;
  if (FISH.visible) {
    const beak = (() => { const o = _P[DAD]; return V3(0.33, 0.86, 0).multiplyScalar(o.s).applyEuler(new THREE.Euler(o.roll, o.yaw, -o.pitch, 'YZX')).add(V3(o.x, o.y + 0.27 * o.s * Math.sin(o.pitch), o.z)); })();
    const onCar = CW(V3(0.25, 1.07, -1.02));
    const u = ease(clamp((t - tFish + 0.05) / 0.35));
    FISH.position.copy(beak).lerp(onCar, u); FISH.position.y += 0.3 * Math.sin(Math.PI * u);
    FISH.rotation.set(lerp(0, -0.85, u), lerp(_P[DAD].yaw, 0.3, u), lerp(Math.PI / 2 * 0.0, 0, u));
    if (u >= 1) FISH.rotation.set(-0.85 + 0.05 * Math.sin(t * 5) * ramp(t, tFish + 0.4, tFish + 0.6) * (1 - ramp(t, tWiper + 0.8, tWiper + 1.2)), 0.3, 0.06 * Math.sin(t * 7) * (1 - ramp(t, tWiper + 0.5, tWiper + 1.0)));
  }
  WIPER.rotation.z = 0.08 + (right && t > tWiper - 0.1 && t < tWiper + 0.5 ? 0.0 : 0);
  // exhaust (engine on) / honk puffs
  const engineOn = !right ? t < tSlide0 : t < tEngine;
  if (engineOn) for (let k = 0; k < 5; k++) { const d = ((t * 1.3 + k / 5) % 1); puff(CW(V3(0.55, 0.35 + d * 0.4, 2.4 + d * 0.9)), 0.25 + d * 0.6, 0.35 * (1 - d), '#e9eef2'); }
  // snow spray while sliding
  if (!right && t > tDive && t < tSlide1 + 0.2) { const a = win(t, tDive, tSlide1 + 0.2, 0.3); for (let k = 0; k < 24; k++) { const d = ((t * 2.2 + k / 24) % 1); const src = t > tSlide0 ? CW(V3((hash(k) - 0.5) * 2.4, 0.1, (hash(k + 3) - 0.5) * 4.4)) : V3(LX + (hash(k) - 0.5) * 10, 0.1, PZ + 2 + (hash(k + 3) - 0.5) * 6); puff(src.add(V3(-d * 1.4, d * 0.6, (hash(k + 5) - 0.5) * d)), 0.25 + d * 0.45, 0.4 * a * (1 - d), '#ffffff'); } }
  if (!right && t > tSlide1 - 0.4 && t < tSlide1 + 1.0) { const d = t - tSlide1 + 0.4; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; puff(V3(SEA + 17 + Math.cos(a) * (2 + d * 3), 0.2 + d * 1.5 * hash(k), Math.sin(a) * (2 + d * 3)), 0.9 + d, 0.7 * (1 - d / 1.4), '#e8f6ff'); } }
  // baby slide sparkle
  if (right && t > tUses && t < tWhee + 0.8) { const o = _P[BABY]; for (let k = 0; k < 8; k++) { const d = ((t * 3 + k / 8) % 1); puff(V3(o.x - Math.cos(o.yaw) * d * 0.8, o.y + 0.1 + d * 0.3, o.z + Math.sin(o.yaw) * d * 0.8), 0.18 + d * 0.3, 0.7 * (1 - d), '#ffffff'); } }
  // ---- camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.updateProjectionMatrix();
  applyCam(c, t, 0);
  camera.updateMatrixWorld(true);
  // snow around the camera
  { const pa = snowGeo.attributes.position; const cp = camera.position; for (let k = 0; k < NS; k++) { const bx = (hash(k) - 0.5) * 24, bz = (hash(k + 999) - 0.5) * 24, by = ((hash(k + 77) * 12 - t * (0.6 + hash(k + 5) * 0.5)) % 12 + 12) % 12;
      pa.setXYZ(k, cp.x + bx + 0.3 * Math.sin(t * 0.7 + k), by - 2 + cp.y * 0.3, cp.z + bz); } pa.needsUpdate = true; }
  screen = { fish: project(FISH.position), car: project(CW(V3(0, 1.7, 0))), drv: project(CW(V3(-0.4, 2.0, 0.1))), dad: project(penHead(DAD, 0.25)), baby: project(penHead(BABY, 0.3)), lead: project(V3(headX(t) - 3, 1.2, PZ)) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0) => [clamp(p.x, 230, W - 230), clamp(p.y + dy, 560, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -120) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  const xx = clamp(x, w / 2 + 30, W - w / 2 - 30); ctx.translate(xx, y); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  const tx = clamp(x - xx, -w / 2 + 40, w / 2 - 40); ctx.beginPath(); ctx.moveTo(tx - 20, h / 2 - 4); ctx.lineTo(tx, h / 2 + 34); ctx.lineTo(tx + 22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function notes(p, t, a, b) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 6; k++) { const d = ((t - a) * 0.7 + k / 6) % 1; ctx.save(); ctx.globalAlpha = win(t, a, b, 0.2) * (1 - d); ctx.font = '900 70px Inter'; ctx.fillStyle = ['#ffd60a', '#ffffff', '#39ff4a'][k % 3]; ctx.strokeStyle = '#000'; ctx.lineWidth = 8; const x = p.x + 160 * Math.sin(k * 2.3 + d * 2.5), y = p.y - 60 - d * 300; ctx.strokeText(k % 2 ? '♪' : '♫', x, y); ctx.fillText(k % 2 ? '♪' : '♫', x, y); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('EVERYONE STOPS…', '#455a64', tSudden - 0.1, S('hook1').end + 0.3, 58);
    P_('PENGUIN PARADE', '#212121', tPeng - 0.15, tTwo - 0.15, 62);
    P_('200 OF THEM', '#1565c0', tTwo - 0.15, tVery - 0.15, 64);
    P_('VERY, VERY SLOWLY', '#6d4c41', tVery - 0.15, S('hook2').end + 0.3, 58);
    P_('HONK & SQUEEZE THROUGH', RED, tHonk - 0.15, S('wrong1').end + 0.3, 50, iconWarn);
    floatText('HONK!', 760, 700, t, tHonk - 0.05, tHonk + 0.9, 130, YEL, 0.1);
    P_('200 PENGUINS DIVE', RED, tTwo2 - 0.1, tStraight - 0.15, 56, iconX);
    P_('STRAIGHT UNDER YOUR CAR', RED, tStraight - 0.15, S('wrong2').end + 0.3, 50, iconX);
    P_('YOUR CAR IS A SLEDGE', RED, tSledge - 0.4, tSea - 0.1, 54, iconX);
    P_('NEXT STOP: AN ICEBERG', '#0277bd', tSea - 0.1, tRew0, 54, iconX);
    bubble('BYE BYE!', screen.car, t, tBye - 0.1, tRew0, 64, '#fff', '#111', -150);
  } else {
    P_('HAZARD LIGHTS ON', GREEN, tHazard - 0.1, tEngine - 0.1, 60, iconCheck);
    P_('ENGINE OFF', GREEN, tEngine - 0.1, tWait - 0.1, 64, iconCheck);
    P_('WAIT', GREEN, tWait - 0.1, S('right2').end + 0.3, 70, iconCheck);
    P_('PENGUINS ARE SLOW…', '#6d4c41', S('right3').start - 0.1, tRadio - 0.4, 56);
    P_('RADIO: MARCHING MUSIC', GREEN, tRadio - 0.35, S('right3').end + 0.3, 52, iconCheck);
    notes(screen.car, t, tRadio + 0.1, S('right4').end + 0.3);
    P_('WADDLE TO THE BEAT', GREEN, tWhole - 0.15, tTwice - 0.15, 58, iconCheck);
    P_('TWICE AS FAST!', '#ef6c00', tTwice - 0.15, S('right4').end + 0.3, 64);
    P_('THE SMALLEST ONE…', '#455a64', tOnly - 0.15, tClimbs - 0.35, 60);
    P_('YOUR CAR = A SLIDE', GREEN, tClimbs - 0.35, S('right5').end + 0.3, 58, iconHeart);
    floatText('WHEE!', 560, 720, t, tWhee - 0.05, tWhee + 1.0, 140, YEL, -0.1);
    P_('THANK-YOU FROM DAD', GREEN, tThank - 0.2, tFish - 0.15, 56, iconHeart);
    P_('A FISH UNDER THE WIPER', '#0277bd', tFish - 0.15, S('right6').end + 0.4, 52, iconCheck);
    if (t > tFish + 0.3 && t < S('right6').end + 0.3 && screen.fish.ok) { const k = back(clamp((t - tFish - 0.3) / 0.35)); ctx.save(); ctx.globalAlpha = win(t, tFish + 0.3, S('right6').end + 0.3, 0.2); ctx.lineWidth = 9; ctx.strokeStyle = YEL; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(screen.fish.x, screen.fish.y, 95 * k, 0, 7); ctx.stroke(); ctx.restore(); }
  }
}
window.dbg = { penguin, heroPose, headX };
start(update, hud);
