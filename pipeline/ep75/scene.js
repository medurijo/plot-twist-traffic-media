// Episode 70: Supermarket car park – hailstones the size of footballs
// wrong: quick, drive home, faster than the hail -> football hail loves a moving target: bonk, bonk, bonk ->
//        at home your car has 200 dimples, looks like a giant golf ball, the neighbour tees off: FORE!
// right: stay parked, wipers on full speed -> the wipers are goalkeepers: save! save! what a save! ->
//        every save lands in a shopping trolley, ten trolleys full of ice -> the hail stops, the sun comes out ->
//        the supermarket has an idea: free slushies for the whole car park, and a giant one for the goalkeeper
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeCar, placeCar, applyCam, project, blink, roundedPath, pathAt,
  YEL, GREEN, RED, BLUE, pill, rr, iconCheck, iconWarn, iconX, iconHeart, floatText, bigText, start, aoPass, hemi, sun, grassMat, _m, _q, _v, _s, _c, _e
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
// ---------------- timing ----------------
const tSuper = WT('hook1', 'Supermarket'), tFound = WT('hook1', 'found'), tThen = WT('hook1', 'Then'), tBounces = WT('hook1', 'bounces');
const tHail = WT('hook2', 'hailstone'), tSize = WT('hook2', 'size'), tMore = WT('hook2', 'more'), tWhat = WT('hook2', 'What');
const W1 = S('wrong1').start, tQuick = WT('wrong1', 'quick'), tDrive = WT('wrong1', 'drive'), tFaster = WT('wrong1', 'Faster');
const tLoves = WT('wrong2', 'loves'), tMoving = WT('wrong2', 'moving'), BONK = [0, 1, 2].map(k => WT('wrong2', 'Bonk', k));
const tWhen = WT('wrong3', 'When'), tDimples = WT('wrong3', 'dimples'), tLooks = WT('wrong3', 'looks'), tGolf = WT('wrong3', 'golf'), tNeigh = WT('wrong3', 'neighbour'), tTee = WT('wrong3', 'teeing'), tFore = WT('wrong3', 'Fore');
const tStay = WT('right2', 'Stay'), tWipers = WT('right2', 'Wipers'), tFull = WT('right2', 'Full');
const tGK = WT('right3', 'goalkeepers'), tSave1 = WT('right3', 'Save', 0), tSave2 = WT('right3', 'Save', 1), tWhatS = WT('right3', 'What');
const tEvery = WT('right4', 'Every'), tLands = WT('right4', 'lands'), tTen = WT('right4', 'Ten'), tFullI = WT('right4', 'full');
const tStops = WT('right5', 'stops'), tSun = WT('right5', 'sun'), tSupI = WT('right5', 'supermarket'), tIdea = WT('right5', 'idea');
const tFree = WT('right6', 'Free'), tWhole = WT('right6', 'whole'), tGiant = WT('right6', 'giant'), tGoalie = WT('right6', 'goalkeeper');
const isRight = t => t >= tRew0 + 0.5;
const T_HOME = S('wrong3').start - 0.1;
const X0 = 2000;                      // home set

// ---------------- world: car park ----------------
const asphT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#4f5257'; c.fillRect(0, 0, w, h); for (let i = 0; i < 14000; i++) { const v = 64 + hash(i) * 40 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); } }, true);
asphT.repeat.set(30, 30);
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshLambertMaterial({ map: asphT, color: '#d0d0d0' })); g.rotation.x = -PI / 2; g.receiveShadow = true; scene.add(g); }
// grass verges around the car park
for (const [x0, x1, z0, z1] of [[-700, -34, 8, 700], [34, 700, -700, 700], [-700, -34, -700, -17], [-34, 34, 16, 700]]) { const m = plane(x0, x1, z0, z1, grassMat, 0.02); }
// bay lines
const lineM = L('#f2f2f2', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
for (let x = -15.4; x <= 15.5; x += 2.8) { box(0.12, 0.01, 5.2, lineM, x, 0.03, 0, false, true); box(0.12, 0.01, 5.2, lineM, x, 0.03, -16.5, false, true); }
box(31, 0.01, 0.12, lineM, 0, 0.03, -2.6, false, true); box(31, 0.01, 0.12, lineM, 0, 0.03, -13.9, false, true);
// supermarket
const facT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#e9e4da'; c.fillRect(0, 0, w, h); c.fillStyle = '#2e7d32'; c.fillRect(0, 0, w, 44);
  c.fillStyle = '#9fc6dd'; for (let i = 0; i < 8; i++) if (i !== 3 && i !== 4) c.fillRect(30 + i * 124, 110, 100, 120);
  c.fillStyle = '#7fb0cc'; c.fillRect(380, 100, 260, 156); c.fillStyle = '#d0d0d0'; c.fillRect(507, 100, 8, 156);
  c.fillStyle = '#fff'; c.font = '900 34px Inter'; c.textAlign = 'center'; c.fillText('OPEN 7 – 22', w / 2, 32); });
{ const sm = new THREE.Mesh(new THREE.BoxGeometry(46, 9, 18), [L('#e9e4da'), L('#e9e4da'), L('#cfcac0'), L('#cfcac0'), new THREE.MeshLambertMaterial({ map: facT }), L('#e9e4da')]); sm.position.set(0, 4.5, -33); sm.castShadow = sm.receiveShadow = true; scene.add(sm);
  const signT = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#2e7d32'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 130px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FRESHMART', w / 2, h / 2 + 6); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.6), new THREE.MeshLambertMaterial({ map: signT, emissive: '#ffffff', emissiveIntensity: 0.15, emissiveMap: signT })); sg.position.set(0, 7.3, -23.9); scene.add(sg);
  const can = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 3), L('#2e7d32')); can.position.set(0, 3.6, -22.6); can.castShadow = true; scene.add(can); }
const banT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#e91e63'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(0, 14, w, 8); c.fillRect(0, h - 22, w, 8);
  c.font = '900 120px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffeb3b'; c.fillText('FREE SLUSHIES!', w / 2, h / 2 + 6); });
const banG = new THREE.Group(); banG.position.set(0, 6.0, -23.7); scene.add(banG);
const banner = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshLambertMaterial({ map: banT, emissive: '#ffffff', emissiveIntensity: 0.12, emissiveMap: banT })); banner.position.y = -1.25; banG.add(banner);
// trees + lamp posts around
{ const R = rng(5); for (let i = 0; i < 40; i++) { const a = R() * 2 * PI; let x = (R() - 0.5) * 160, z = (R() - 0.5) * 160; if (Math.abs(x) < 36 && z > -46 && z < 20) continue;
  const t = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6 + R() * 1.6, 1), new THREE.MeshLambertMaterial({ color: ['#3f8f2e', '#4fa336', '#2f7a28'][i % 3], flatShading: true })); t.position.set(x, 4, z); t.castShadow = true; scene.add(t);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), L('#6d4a2b')); tr.position.set(x, 1.5, z); scene.add(tr); } }
for (const [x, z] of [[-16.5, -8.2], [16.5, -8.2]]) { box(0.18, 7, 0.18, STD('#8a9096'), x, 3.5, z, true); box(1.4, 0.15, 0.4, STD('#8a9096'), x + (x < 0 ? 0.6 : -0.6), 7, z, true); }
// shopping trolleys (10 in a row)
const gridT = canvasTex(64, 64, (c, w, h) => { c.strokeStyle = '#d8dde2'; c.lineWidth = 5; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 16); c.lineTo(w, i * 16); c.stroke(); } }, true);
const gridM = new THREE.MeshStandardMaterial({ map: gridT, alphaTest: 0.5, transparent: false, side: THREE.DoubleSide, metalness: 0.7, roughness: 0.35, color: '#e0e6ea' });
const frameM = STD('#b0b8c0', { metalness: 0.8, roughness: 0.3 }), redM = STD('#d32f2f');
const iceM = new THREE.MeshStandardMaterial({ color: '#e6f4ff', roughness: 0.15, metalness: 0.05, emissive: '#bfe6ff', emissiveIntensity: 0.15 });
const NT = 10, TZ = -8.6, TX = k => 4.6 + k * 0.95;
const trolleys = [];
for (let k = 0; k < NT; k++) { const g = new THREE.Group(); g.position.set(TX(k), 0, TZ); scene.add(g);
  const bw = 0.6, bh = 0.5, bl = 0.9, by = 0.55;
  const side = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), gridM); m.position.set(x, y, z); m.rotation.y = ry; gridT.repeat.set(3, 3); g.add(m); };
  side(bl, bh, -bw / 2, by + bh / 2, 0, PI / 2); side(bl, bh, bw / 2, by + bh / 2, 0, PI / 2); side(bw, bh, 0, by + bh / 2, -bl / 2, 0); side(bw, bh, 0, by + bh / 2, bl / 2, 0);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(bw, bl), gridM); fl.rotation.x = -PI / 2; fl.position.y = by; g.add(fl);
  for (const [x, z] of [[-0.25, -0.38], [0.25, -0.38], [-0.25, 0.38], [0.25, 0.38]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5), frameM); p.position.set(x, 0.3, z); g.add(p); const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), STD('#222')); wh.rotation.z = PI / 2; wh.position.set(x, 0.05, z); g.add(wh); }
  const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.66, 8), redM); hd.rotation.z = PI / 2; hd.position.set(0, by + bh + 0.12, bl / 2 + 0.12); g.add(hd);
  const ice = new THREE.Group(); g.add(ice); const R = rng(k + 40);
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11 + R() * 0.05, 1), iceM); m.position.set((R() - 0.5) * 0.42, by + 0.12 + (i > 5 ? 0.18 : 0) + R() * 0.12, (R() - 0.5) * 0.7); ice.add(m); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); trolleys.push({ g, ice }); }

// ---------------- football hail ----------------
const HR = 0.23;
const ballT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#f4fbff'; c.fillRect(0, 0, w, h); c.fillStyle = '#7ec8f0';
  const pent = (x, y, r) => { c.beginPath(); for (let i = 0; i < 5; i++) { const a = -PI / 2 + i * 2 * PI / 5; c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } c.closePath(); c.fill(); };
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) pent((i + (row % 2) * 0.5) * w / 6 + 20, 40 + row * 88, 26);
  c.strokeStyle = 'rgba(120,170,200,0.55)'; c.lineWidth = 3; for (let i = 0; i < 30; i++) { c.beginPath(); c.moveTo(hash(i) * w, hash(i + 3) * h); c.lineTo(hash(i + 5) * w, hash(i + 9) * h); c.stroke(); } });
const ballM = new THREE.MeshStandardMaterial({ map: ballT, roughness: 0.18, metalness: 0.05, emissive: '#cfeaff', emissiveIntensity: 0.18 });
const ballGeo = new THREE.SphereGeometry(HR, 20, 14);
const NF = 260, NL = 140;
const fall = new THREE.InstancedMesh(ballGeo, ballM, NF); fall.frustumCulled = false; fall.castShadow = true; scene.add(fall);
const lying = new THREE.InstancedMesh(ballGeo, ballM, NL); lying.frustumCulled = false; lying.castShadow = true; lying.receiveShadow = true; scene.add(lying);
const LY = []; { const R = rng(9); while (LY.length < NL) { const x = (R() - 0.5) * 50, z = -20 + R() * 34; const inBay = Math.abs(z) < 2.7 && Math.abs(x) < 15.5 && Math.abs(((x % 2.8) + 2.8) % 2.8 - 1.4) < 1.5; const inBay2 = Math.abs(z + 16.5) < 2.7 && Math.abs(x) < 15.5;
  if (inBay || inBay2 || (Math.abs(x) < 1.6 && z > -6 && z < 3) || (x > 3.8 && x < 14 && Math.abs(z - TZ) < 0.8)) continue; LY.push([x, z, 5.2 + R() * 6.5, R() * 6]); } }
// special balls: the first bounce, the bonks, the saves
const special = Array.from({ length: 16 }, () => { const m = new THREE.Mesh(ballGeo, ballM); m.castShadow = true; m.visible = false; scene.add(m); return m; });

// ---------------- cars ----------------
const hero = makeCar('#e53935');
const PARK = [[-2.8, 0, 0, '#1e88e5'], [2.8, 0, 0, '#fdd835'], [-5.6, 0, 0, '#eceff1'], [-11.2, 0, 0, '#43a047'], [5.6, 0, 0, '#8e24aa'], [11.2, 0, 0, '#455a64'], [-7, -16.5, PI, '#ff7043'], [-1.4, -16.5, PI, '#26a69a'], [4.2, -16.5, PI, '#5c6bc0'], [9.8, -16.5, PI, '#ffca28']];
const parked = PARK.map(([x, z, h, c]) => { const car = makeCar(c); placeCar(car, { x, z, h }); return car; });
// dents (bonks) on the roof
const dentM = STD('#7f1010', { roughness: 0.6 });
const dents = [[0.25, -0.1], [-0.35, 0.3], [0.05, 0.55]].map(([x, z]) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 8), dentM); d.scale.set(1, 0.12, 1); d.position.set(x, 1.6, z + 0.06); d.visible = false; hero.userData.bodyG.add(d); return d; });
// golf-ball dimples: planar UVs + bump map on a cloned body material
const dimT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const cx = x * 64 + 32 + (y % 2) * 32, cy = y * 64 + 32; for (const ox of [0, -w]) { const g = c.createRadialGradient(cx + ox, cy, 2, cx + ox, cy, 27); g.addColorStop(0, '#555'); g.addColorStop(0.75, '#c8c8c8'); g.addColorStop(1, '#fff'); c.fillStyle = g; c.beginPath(); c.arc(cx + ox, cy, 27, 0, 2 * PI); c.fill(); } } }, true);
dimT.repeat.set(1, 1);
const dimpleM = new THREE.MeshStandardMaterial({ color: '#e53935', roughness: 0.35, metalness: 0.1, map: dimT, bumpMap: dimT, bumpScale: 6 });
const heroBody = hero.userData.bodyG.children[0], heroRoof = hero.userData.bodyG.children[2], bodyOrig = heroBody.material;
for (const m of [heroBody, heroRoof]) { const g = m.geometry.clone(); const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ax >= ay && ax >= az) { u = p.getZ(i); v = p.getY(i); } else if (ay >= az) { u = p.getX(i); v = p.getZ(i); } else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u / 0.42; uv[i * 2 + 1] = v / 0.42; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); m.geometry = g; }
// wipers on the hero windscreen (+ goalkeeper gloves)
const WN = V3(0, 0.645, -0.764).normalize(), WU = V3(0, 0.764, 0.645).normalize();
const wBasis = new THREE.Matrix4().makeBasis(V3(1, 0, 0), WU, WN); const wQ = new THREE.Quaternion().setFromRotationMatrix(wBasis);
const gloveM = STD('#ff6f00', { roughness: 0.6 }), gloveW = STD('#fafafa', { roughness: 0.7 });
const wipers = [-0.62, 0.08].map((x, i) => { const base = new THREE.Group(); base.position.set(x, 1.0, -1.13).addScaledVector(WN, 0.09); base.quaternion.copy(wQ); hero.userData.bodyG.add(base);
  const arm = new THREE.Group(); base.add(arm);
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.035, 0.03), STD('#2b2b2b')); a.position.x = 0.33; arm.add(a);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.05), STD('#111')); blade.position.set(0.36, -0.02, -0.01); arm.add(blade);
  const glove = new THREE.Group(); glove.position.set(0.66, 0, 0.1); arm.add(glove);
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.1), gloveM); palm.position.y = 0.04; glove.add(palm);
  const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.12), gloveW); cuff.position.y = -0.12; glove.add(cuff);
  for (let f = 0; f < 4; f++) { const fi = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.1, 4, 6), gloveM); fi.position.set(-0.075 + f * 0.05, 0.22, 0); glove.add(fi); }
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.08, 4, 6), gloveM); th.position.set(-0.13, 0.05, 0); th.rotation.z = 0.8; glove.add(th);
  glove.rotation.z = -PI / 2; glove.visible = false; base.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { base, arm, glove }; });
// slushie cups
function makeCup(s, colTop) { const g = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.11 * s, 0.4 * s, 18), STD('#ffffff', { roughness: 0.4 })); cup.position.y = 0.2 * s; g.add(cup);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.152 * s, 0.135 * s, 0.12 * s, 18), STD('#e91e63')); band.position.y = 0.2 * s; g.add(band);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16 * s, 18, 8, 0, 2 * PI, 0, PI / 2), STD(colTop, { roughness: 0.3, emissive: colTop, emissiveIntensity: 0.15 })); dome.position.y = 0.4 * s; g.add(dome);
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.014 * s, 0.014 * s, 0.4 * s, 6), STD('#ffeb3b')); straw.position.set(0.04 * s, 0.6 * s, 0); straw.rotation.z = -0.25; g.add(straw);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.visible = false; return g; }
const cups = parked.map((car, i) => { const c = makeCup(1.3, ['#2196f3', '#f44336', '#4caf50'][i % 3]); c.position.set(0, 1.6, 0.1); car.userData.bodyG.add(c); return c; });
const giantCup = makeCup(3.6, '#2196f3'); giantCup.position.set(0, 1.6, 0.25); hero.userData.bodyG.add(giantCup);

// ---------------- home set (x = 2000) ----------------
{ const lawn = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), L('#7cb342', { map: grassMat.map })); lawn.rotation.x = -PI / 2; lawn.position.set(X0, 0.03, 0); lawn.receiveShadow = true; scene.add(lawn);
  box(4.2, 0.02, 30, L('#9e9e9e'), X0, 0.05, 6, false, true);
  box(400, 0.02, 7, L('#5a5d62'), X0, 0.045, 24, false, true);
  const wall = L('#f1e3c8'), roof = L('#a1442f');
  const house = (x, z, w, d, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const b = new THREE.Mesh(new THREE.BoxGeometry(w, 5.2, d), L(col)); b.position.y = 2.6; g.add(b);
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.62, w * 0.62, d + 0.6, 3, 1), roof); rf.rotation.z = PI / 2; rf.rotation.y = PI / 2; rf.rotation.order = 'YZX'; rf.rotation.set(0, 0, PI / 2); rf.scale.set(0.55, 1, 1);
    const r2 = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, 3.2, 4), roof); r2.rotation.y = PI / 4; r2.scale.set(1, 1, d / w); r2.position.y = 6.8; g.add(r2);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), L('#5d4037')); door.position.set(-w * 0.2, 1.1, d / 2 + 0.01); g.add(door);
    for (const xx of [w * 0.15, w * 0.35]) { const wi = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), L('#90caf9')); wi.position.set(xx, 2.4, d / 2 + 0.01); g.add(wi); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); };
  house(X0 + 13, -12, 10, 8, '#f1e3c8'); house(X0 - 13, -10, 9, 8, '#dfe9f1'); house(X0 + 26, -11, 9, 8, '#f6e0e0'); house(X0 - 26, -11, 9, 8, '#f1e3c8');
  const hedge = L('#33691e'); box(0.8, 1.1, 18, hedge, X0 - 6.5, 0.55, 8, true, true);
  for (let i = 0; i < 12; i++) { const t = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), new THREE.MeshLambertMaterial({ color: ['#3f8f2e', '#4fa336'][i % 2], flatShading: true })); t.position.set(X0 - 60 + i * 11, 3.8, -30 - (i % 3) * 6); scene.add(t); } }
const tee = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.12, 0.5, 18), STD('#ffffff', { roughness: 0.5 })); tee.position.set(X0, 0.25, 0); tee.castShadow = true; scene.add(tee);
// neighbour golfer
const tartan = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,235,59,0.7)'; for (let i = 0; i < 4; i++) { c.fillRect(i * 32 + 10, 0, 6, h); c.fillRect(0, i * 32 + 10, w, 6); } c.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = 0; i < 4; i++) { c.fillRect(i * 32 + 22, 0, 10, h); c.fillRect(0, i * 32 + 22, w, 10); } }, true);
const golfer = new THREE.Group(); scene.add(golfer);
const skin = STD('#ffd2a6', { roughness: 0.6 });
const legs = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(0, 0.92, s * 0.13); golfer.add(g); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.88, 10), new THREE.MeshStandardMaterial({ map: tartan, roughness: 0.8 })); l.position.y = -0.44; g.add(l);
  const sh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.13), STD('#fafafa')); sh.position.set(0.06, -0.9, 0); g.add(sh); return g; });
const torsoG = new THREE.Group(); torsoG.position.set(0, 0.92, 0); golfer.add(torsoG);
{ const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 6, 12), STD('#ffeb3b', { roughness: 0.7 })); t.position.y = 0.36; torsoG.add(t);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), STD('#ffeb3b', { roughness: 0.7 })); belly.position.set(0.07, 0.22, 0); torsoG.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), skin); head.position.y = 0.88; torsoG.add(head);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), skin); nose.position.set(0.17, 0.88, 0); torsoG.add(nose);
  const mus = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.16, 4, 8), STD('#eeeeee')); mus.rotation.x = PI / 2; mus.position.set(0.16, 0.82, 0); torsoG.add(mus);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), STD('#111')); e.position.set(0.155, 0.93, s * 0.06); torsoG.add(e); }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16), new THREE.MeshStandardMaterial({ map: tartan, roughness: 0.8 })); cap.position.set(0.02, 1.02, 0); cap.scale.set(1.08, 1, 1); torsoG.add(cap);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.26), STD('#8d2020')); brim.position.set(0.2, 0.99, 0); torsoG.add(brim); }
const armsG = new THREE.Group(); armsG.position.set(0, 0.62 + 0.92, 0); golfer.add(armsG);       // shoulders; swing rotates about x
const club = new THREE.Group(); armsG.add(club);
const armMeshes = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 1, 8), STD('#ffeb3b', { roughness: 0.7 })); armsG.add(m); return m; });
{ const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 6), STD('#cfd8dc', { metalness: 0.8, roughness: 0.3 })); sh.position.y = -0.55; club.add(sh);
  const hd = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.12), STD('#212121', { metalness: 0.6 })); hd.position.set(0.05, -1.12, 0); club.add(hd);
  const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 6), STD('#111')); gr.position.y = -0.1; club.add(gr); }
golfer.traverse(o => { if (o.isMesh) o.castShadow = true; });

// ---------------- motion ----------------
const zIn = mono([[0, 17], [tFound + 0.2, 1.5], [tFound + 1.2, 0], [99, 0]]);
const PATH = roundedPath([[0, 0], [0, -4.6], [-60, -4.6], [-900, -4.6]], 3.2);
const vW = t => t < tDrive - 0.2 ? 0 : Math.min(15, 9 * (t - tDrive + 0.2));
let cumW = null; { cumW = [0]; let s = 0; for (let t = 0; t <= 40; t += 1 / 120) { s += vW(t) / 120; cumW.push(s); } }
const sW = t => { const k = clamp(t * 120, 0, cumW.length - 2), i = Math.floor(k); return lerp(cumW[i], cumW[i + 1], k - i); };
const T_LIFT = tGolf - 0.15;
function heroPose(t) {
  if (isRight(t)) return { x: 0, y: 0, z: 0, h: 0, pitch: 0, roll: 0 };
  if (t < tDrive - 0.2) return { x: 0, y: 0, z: t < W1 ? zIn(t) : 0, h: 0, pitch: 0, roll: 0 };
  if (t < T_HOME) { const p = pathAt(PATH, sW(t)); return { x: p.x, y: 0, z: p.z, h: p.h, pitch: 0, roll: 0 }; }
  // home: parked on the driveway, then on the tee, then FORE
  const lift = ease(clamp((t - T_LIFT) / 0.45)); let y = lift * 0.5, z = 0, pitch = 0;
  if (t > tFore) { const tau = t - tFore; z = -38 * tau; y = 0.5 + 14 * tau - 4.0 * tau * tau; pitch = 4.5 * tau; }
  return { x: X0, y, z, h: 0, pitch, roll: 0 };
}
// hail field
const hailOn = t => { if (isRight(t)) return t < tStops - 0.25; return t > tThen - 0.6 && t < T_HOME; };
function hailCentre(t) { if (!isRight(t) && t > tLoves - 1.2 && t < T_HOME) { const p = heroPose(t); return [p.x - 9, p.z]; } return [2, -6]; }
// wiper angle
const WP0 = tSave1 - 0.15;
function wiperA(t) {
  if (!isRight(t) || t < tWipers + 0.15) return 0.06;
  const slow = 0.06 + 0.72 * (1 - Math.cos(2 * PI * (t - tWipers - 0.15) / 1.4));
  const fast = 0.06 + 0.72 * (1 - Math.cos(2 * PI * (t - WP0) / 0.6));
  let a = lerp(slow, fast, ramp(t, tFull - 0.1, tFull + 0.35));
  const tEnd = tStops + 0.3; if (t > tEnd) { const k = ramp(t, tEnd, tEnd + 0.6); a = lerp(a, 0.06, k); }
  if (t > tGiant - 0.2) a = 1.1 + 0.25 * Math.sin((t - tGiant) * 12);  // wave
  return a;
}
const SAVES = [0, 2, 5, 8, 10, 12, 14, 16, 18, 20].map(m => tSave1 + 0.3 * m);
const HIT = V3(0, 1.22, -0.92).addScaledVector(WN, HR + 0.05);
const FLY = 1.1;
// golfer swing
const T_ADDR = tNeigh + 0.9, T_BACK = tFore - 0.75;
function golferPose(t) {
  const walk = clamp((t - tNeigh + 0.3) / 1.0), x = lerp(X0 - 9, X0 - 2.05, ease(walk));
  let th = 0.05 * Math.sin(t * 7) * ramp(t, T_ADDR, T_ADDR + 0.3) * (1 - ramp(t, T_BACK - 0.2, T_BACK));
  if (t > T_BACK) { const ub = ease(clamp((t - T_BACK) / 0.5)); th = -2.1 * ub; }
  if (t > tFore - 0.18) { const ud = clamp((t - tFore + 0.18) / 0.18); th = lerp(-2.1, 0, ud * ud); }
  if (t > tFore) th = 2.5 * easeOut(clamp((t - tFore) / 0.35));
  return { x, z: 2.45, walk: walk > 0 && walk < 1, th };
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const CC = (off, look, fov = 40) => t => { const p = heroPose(t), h = p.h, f = V3(-Math.sin(h), 0, -Math.cos(h)), r = V3(Math.cos(h), 0, -Math.sin(h));
  const P = V3(p.x, p.y || 0, p.z); return [P.clone().addScaledVector(r, off[0]).add(V3(0, off[1], 0)).addScaledVector(f, -off[2]), P.clone().addScaledVector(r, look[0]).add(V3(0, look[1], 0)).addScaledVector(f, -look[2]), fov]; };
const camKeys = [
  [0.0, Ac([3.5, 6.5, 21], [0, 3.2, -14], 40)],
  [tThen - 0.3, Ac([3.0, 6.0, 18], [0, 2.8, -12], 40)],
  ...cut(tThen - 0.25, Ac([0.6, 4.6, 8.5], [-2.2, 1.0, -1.2], 40)),
  [tHail - 0.25, Ac([0.4, 4.3, 8.0], [-2.0, 1.0, -0.5], 40)],
  ...cut(tHail - 0.2, Ac([-0.5, 0.7, 6.4], [-1.45, 0.35, 3.7], 36)),
  [tMore - 0.3, Ac([-0.6, 0.65, 6.0], [-1.45, 0.35, 3.7], 36)],
  ...cut(tMore - 0.25, Ac([6.5, 1.6, 11], [-1.5, 6.5, -14], 44)),
  [W1 - 0.2, Ac([6.8, 1.6, 11.5], [-1.5, 6.8, -14], 44)],
  // wrong
  ...cut(W1 - 0.15, CC([1.6, 3.2, 8.5], [0, 1.2, -8], 40)),
  [tLoves - 0.4, CC([1.6, 3.2, 8.5], [0, 1.2, -8], 40)],
  ...cut(tLoves - 0.35, CC([7.5, 3.2, 2.5], [-0.5, 1.4, -3], 40)),
  [S('wrong2').end + 0.3, CC([7.5, 3.4, 2.2], [-0.5, 1.4, -3], 40)],
  ...cut(T_HOME, Ac([X0 + 3.4, 1.7, 3.2], [X0, 1.15, 0.2], 40)),
  [tLooks - 0.3, Ac([X0 + 3.2, 1.75, 3.0], [X0, 1.15, 0.2], 40)],
  ...cut(tLooks - 0.25, Ac([X0 + 6.5, 2.6, 7.5], [X0 - 0.5, 1.2, 0], 40)),
  [tNeigh - 0.3, Ac([X0 + 6.8, 2.6, 8.0], [X0 - 0.8, 1.2, 0], 40)],
  ...cut(tNeigh - 0.25, Ac([X0 + 5.5, 2.2, 9.5], [X0 - 1.3, 1.0, 0.6], 40)),
  [tFore - 0.05, Ac([X0 + 5.8, 2.2, 9.8], [X0 - 1.3, 1.0, 0.6], 40)],
  [tFore + 0.9, Ac([X0 + 6.5, 2.0, 11], [X0 - 1, 9, -30], 44)],
  [tRew0, Ac([X0 + 6.5, 2.0, 11], [X0 - 1, 14, -50], 44)],
  // right
  ...cut(tRew1, Ac([1.6, 3.8, 8.5], [0, 1.2, -6], 40)),
  [tWipers - 0.3, Ac([1.6, 3.8, 8.2], [0, 1.2, -6], 40)],
  ...cut(tWipers - 0.25, Ac([0.7, 3.0, -5.6], [0, 1.15, -0.8], 40)),
  [tGK - 0.3, Ac([0.6, 2.9, -5.3], [0, 1.15, -0.8], 40)],
  ...cut(tGK - 0.25, Ac([-1.6, 2.9, -4.4], [0.2, 1.25, -0.9], 40)),
  [tWhatS - 0.25, Ac([-1.7, 3.0, -4.7], [0.3, 1.25, -0.9], 40)],
  ...cut(tWhatS - 0.2, Ac([-4.5, 7.8, 9], [6.5, 0.6, -6.5], 42)),
  [tTen - 0.3, Ac([-4.8, 8.2, 9.5], [6.5, 0.6, -6.5], 42)],
  ...cut(tTen - 0.25, Ac([9.0, 3.0, -1.6], [8.8, 0.8, -8.6], 40)),
  [S('right4').end + 0.2, Ac([9.3, 3.1, -1.2], [8.8, 0.8, -8.6], 40)],
  ...cut(S('right5').start - 0.1, Ac([4, 5.5, 15], [0, 4.5, -24], 42)),
  [tSupI - 0.3, Ac([3.5, 5.0, 13], [0, 4.5, -24], 42)],
  ...cut(tSupI - 0.25, Ac([2.0, 3.0, 12], [0, 5.2, -24], 38)),
  [S('right5').end + 0.3, Ac([2.0, 3.1, 11], [0, 5.2, -24], 38)],
  ...cut(tFree - 0.15, Ac([9, 11, 13], [0, 0.5, -6], 42)),
  [tGiant - 0.45, Ac([9.5, 11.5, 14], [0, 0.5, -6], 42)],
  ...cut(tGiant - 0.4, Ac([3.0, 3.4, -5.2], [0, 2.1, -0.2], 40)),
  [S('right6').end + 0.3, Ac([3.2, 3.6, -5.6], [0, 2.1, -0.2], 40)],
  ...cut(S('right7').start - 0.15, Ac([5, 7, 10], [0, 1.5, -4], 42)),
  [TOTAL, Ac([6, 11, 15], [0, 1.0, -6], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
const SUNNY = new THREE.Color('#a9d4f5'), STORM = new THREE.Color('#5e6a78'), sun0 = sun.intensity, hemi0 = hemi.intensity;
const _M = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _E = new THREE.Euler();
function setBall(m, p, spin) { m.visible = true; m.position.copy(p); m.rotation.set(spin, spin * 0.7, 0); }
function update(t) {
  const right = isRight(t);
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.far = 3000; camera.updateProjectionMatrix();
  // weather
  let E = right ? 1 - ramp(t, tSun - 0.3, tSun + 0.9) : (t > T_HOME ? 0.55 : 0.35 + 0.65 * ramp(t, tThen - 1.0, tThen + 0.6));
  scene.background.copy(SUNNY).lerp(STORM, E); sun.intensity = sun0 * (1 - 0.72 * E); hemi.intensity = hemi0 * (1 - 0.25 * E);
  // hero
  const hp = heroPose(t); placeCar(hero, hp);
  const bG = hero.userData.bodyG;
  if (!right && t > T_HOME) { hero.userData.wheels.forEach(w => w.rotation.x = t > tFore ? t * 20 : 0); bG.rotation.set(0, 0, 0); bG.position.y = 0; }
  const golfK = !right && t > T_HOME;
  heroBody.material = heroRoof.material = golfK ? dimpleM : bodyOrig;
  dimpleM.color.set('#e53935').lerp(new THREE.Color('#f7f7f2'), ramp(t, tGolf - 0.1, tGolf + 0.4));
  dents.forEach((d, k) => { d.visible = !right && t > BONK[k] + 0.05 && t < T_HOME; });
  BONK.forEach(b => { if (!right && t > b && t < b + 0.3) { const u = (t - b) / 0.3; bG.scale.set(1 + 0.05 * Math.sin(PI * u), 1 - 0.08 * Math.sin(PI * u), 1); } });
  if (right || t > S('wrong2').end) bG.scale.set(1, 1, 1);
  hero.userData.tl.emissiveIntensity = !right && t > tDrive - 0.3 && t < tDrive ? 1.5 : 0.4;
  tee.visible = !right && t > T_LIFT - 0.05; tee.scale.setScalar(Math.max(0.01, back((t - T_LIFT + 0.05) / 0.4)));
  // wipers + gloves
  const wa = wiperA(t); wipers.forEach((w, i) => { w.arm.rotation.z = wa; w.glove.visible = right && t > tGK - 0.05; w.glove.scale.setScalar(back((t - tGK + 0.05) / 0.35)); });
  // cups + banner
  banG.visible = right && t > tIdea - 0.1; banG.scale.set(1, Math.max(0.01, ease(clamp((t - tIdea + 0.1) / 0.6))), 1);
  cups.forEach((cu, i) => { const t0 = tFree + 0.1 + (i % 10) * 0.16; cu.visible = right && t > t0; cu.scale.setScalar(back((t - t0) / 0.35)); });
  giantCup.visible = right && t > tGiant - 0.05; giantCup.scale.setScalar(back((t - tGiant + 0.05) / 0.45));
  // trolley ice
  trolleys.forEach((tr, k) => { tr.ice.visible = right && t > SAVES[k] + FLY + 0.05; tr.ice.scale.setScalar(tr.ice.visible ? back((t - SAVES[k] - FLY - 0.05) / 0.3) : 1); });
  // falling hail
  const on = hailOn(t), [cx, cz] = hailCentre(t); const H0 = right ? -99 : tThen - 0.6, H1 = right ? tStops - 0.25 : T_HOME;
  for (let i = 0; i < NF; i++) { const P = 2.6, ph = hash(i * 7) * P; const n = Math.floor((t - ph) / P), s0 = ph + n * P, tau = t - s0;
    let vis = on && (right ? s0 < H1 : (s0 > H0 && s0 < H1));
    const x = cx + (hash(i * 13 + n * 31) - 0.5) * 48, z = cz + (hash(i * 17 + n * 29) - 0.5) * 40;
    const tHit = (24 - HR) / 20; let y;
    if (tau < tHit) y = 24 - 20 * tau; else { const b = tau - tHit; y = b < 0.5 ? HR + 2.4 * b - 4.9 * b * b : HR; }
    // keep the hero roof + windscreen + trolleys clear (special balls do those)
    if (Math.abs(x - hp.x) < 1.6 && Math.abs(z - hp.z) < 3 && !(t > T_HOME && !right)) vis = false;
    if (!vis) { _M.makeScale(0, 0, 0); } else { _E.set(tau * 3, i, 0); _Q.setFromEuler(_E); _M.compose(_v.set(x, y, z), _Q, _s.set(1, 1, 1)); }
    fall.setMatrixAt(i, _M); }
  fall.instanceMatrix.needsUpdate = true;
  LY.forEach(([x, z, ta, r], i) => { const vis = (right ? true : t > ta && t < T_HOME); if (vis) { _E.set(r, r * 2, 0); _Q.setFromEuler(_E); _M.compose(_v.set(x, HR, z), _Q, _s.set(1, 1, 1)); } else _M.makeScale(0, 0, 0); lying.setMatrixAt(i, _M); });
  lying.instanceMatrix.needsUpdate = true;
  // special balls
  special.forEach(m => m.visible = false);
  if (!right && t < T_HOME) {
    // first one: bounces off the blue car roof, lands next to you
    const tb = tBounces - 0.05; const A = V3(-2.8, 1.6 + HR, 0.2);
    if (t > tb - 1.0 && t < tb) setBall(special[0], A.clone().add(V3(0, 20 * (tb - t), 0)), t * 3);
    else if (t >= tb) { const u = t - tb; const D = 1.1; const B = V3(-1.45, HR, 3.7); if (u < D) { const p = A.clone().lerp(B, u / D); p.y = lerp(A.y, B.y, u / D) + 2.8 * Math.sin(PI * u / D); setBall(special[0], p, t * 4); }
      else { const v = u - D; const p = B.clone(); p.y = HR + Math.max(0, 0.5 * Math.sin(PI * clamp(v / 0.45))) * (v < 0.45 ? 1 : 0); setBall(special[0], p, 4 * D + Math.min(v, 1.2) * 1.5); } }
    // bonks
    BONK.forEach((b, k) => { const hb = heroPose(b); const d = dents[k].position; const target = V3(hb.x, 1.6 + HR, hb.z);
      if (t > b - 0.9 && t < b) { const u = (b - t); setBall(special[1 + k], target.clone().add(V3(u * 6, 20 * u, 0)), t * 3); }
      else if (t >= b && t < b + 1.4) { const u = t - b; const hpp = heroPose(b); setBall(special[1 + k], V3(hpp.x + 2 + 4 * u, 1.6 + HR + 4 * u - 4.9 * u * u + (u > 0.9 ? 0 : 0), hpp.z + (k - 1) * 2 * u), t * 5); } });
  }
  if (right) SAVES.forEach((ts, k) => { const m = special[4 + k];
    const from = HIT.clone().add(V3(1.5 - (k % 3), 14, 3)); const to = V3(TX(k), 1.25, TZ);
    if (t > ts - 0.8 && t < ts) { const u = (t - ts + 0.8) / 0.8; setBall(m, from.clone().lerp(HIT, u), t * 3); }
    else if (t >= ts && t < ts + FLY) { const u = (t - ts) / FLY; const p = HIT.clone().lerp(to, u); p.y = lerp(HIT.y, to.y, u) + 4.2 * Math.sin(PI * u); setBall(m, p, t * 9); }
    else if (t >= ts + FLY) setBall(m, to, 0.3 * k); });
  // golfer
  const gp = golferPose(t); golfer.visible = !right && t > T_HOME; golfer.position.set(gp.x, 0, gp.z); golfer.rotation.y = 0;
  legs.forEach((l, i) => l.rotation.z = gp.walk ? 0.45 * Math.sin(t * 11 + i * PI) : 0);
  torsoG.rotation.z = gp.walk ? 0 : -0.32; torsoG.rotation.x = gp.th * 0.12;
  armsG.position.set(0.08 + (gp.walk ? 0 : 0.18), 1.48 - (gp.walk ? 0 : 0.08), 0);
  // club: hands ~0.5 below/forward of the shoulders, head at the car's rear bumper at impact
  armsG.rotation.set(gp.th, 0, 0);
  const hands = V3(0.42, -0.5, 0); club.position.copy(hands); club.rotation.set(0, 0, gp.walk ? 0.2 : 0.95);
  armMeshes.forEach((a, i) => { const sh = V3(0, 0, (i ? 1 : -1) * 0.2); const d = hands.clone().sub(sh); a.position.copy(sh).addScaledVector(d, 0.5); a.scale.set(1, d.length(), 1); a.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); });
  applyCam(c, t, (!right && BONK.some(b => t > b && t < b + 0.25)) ? 0.04 : 0);
  camera.updateMatrixWorld(true);
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const PURP = '#6a1b9a';
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('SUPERMARKET CAR PARK', BLUE, tSuper - 0.1, tFound - 0.1, 52);
    P_('FOUND A SPACE!', GREEN, tFound - 0.05, tThen - 0.1, 56, iconCheck);
    floatText('BOING!', W / 2 - 140, 760, t, tBounces, tBounces + 0.9, 120, YEL, -0.08);
    P_('A HAILSTONE…', PURP, tHail - 0.15, tSize - 0.1, 56, iconWarn);
    P_('SIZE: FOOTBALL', PURP, tSize - 0.05, tMore - 0.15, 58, iconWarn);
    P_('AND MORE ARE COMING', RED, tMore - 0.15, S('hook2').end + 0.4, 50, iconWarn);
    P_('QUICK, DRIVE HOME!', RED, tQuick - 0.1, tFaster - 0.1, 54, iconX);
    P_('FASTER THAN THE HAIL', RED, tFaster - 0.05, S('wrong1').end + 0.3, 50, iconX);
    P_('IT LOVES A MOVING TARGET', RED, tLoves - 0.15, BONK[0] - 0.1, 46, iconX);
    BONK.forEach((b, k) => floatText('BONK!', W / 2 + (k - 1) * 220, 760 - k * 50, t, b - 0.05, b + 0.6, 130, YEL, (k - 1) * 0.1));
    P_('200 DIMPLES', RED, tDimples - 0.15, tLooks - 0.1, 60, iconX);
    P_('GIANT GOLF BALL', RED, tGolf - 0.15, tNeigh - 0.1, 58, iconX);
    P_('THE NEIGHBOUR…', PURP, tNeigh - 0.1, tFore - 0.1, 56, iconWarn);
    floatText('FORE!', W / 2, 700, t, tFore - 0.05, tRew0, 170, YEL, -0.07);
    floatText('PING!', W / 2 + 160, 900, t, tFore + 0.05, tFore + 0.8, 100, '#fff', 0.1);
  } else {
    P_('STAY PARKED', GREEN, tStay - 0.1, tWipers - 0.1, 62, iconCheck);
    P_('WIPERS ON', GREEN, tWipers - 0.05, tFull - 0.1, 62, iconCheck);
    P_('FULL SPEED', GREEN, tFull - 0.05, S('right2').end + 0.3, 62, iconCheck);
    P_('GOALKEEPER WIPERS', '#ef6c00', tGK - 0.25, tSave1 - 0.1, 54, iconHeart);
    floatText('SAVE!', W / 2 - 150, 700, t, tSave1 - 0.05, tSave1 + 0.55, 130, YEL, -0.08);
    floatText('SAVE!', W / 2 + 150, 760, t, tSave2 - 0.05, tSave2 + 0.55, 130, YEL, 0.08);
    bigText(['WHAT A', 'SAVE!'], 720, t, tWhatS - 0.05, S('right3').end + 0.3, 130, i => i ? YEL : '#fff');
    P_('INTO THE TROLLEYS', GREEN, tEvery - 0.1, tTen - 0.1, 54, iconCheck);
    P_('10 TROLLEYS OF ICE', GREEN, tTen - 0.05, S('right4').end + 0.3, 54, iconCheck);
    P_('HAIL STOPS', GREEN, tStops - 0.25, tSun - 0.1, 62, iconCheck);
    P_('SUN COMES OUT', '#f9a825', tSun - 0.05, tSupI - 0.15, 60, iconCheck);
    floatText('IDEA!', W / 2, 700, t, tIdea - 0.05, S('right5').end + 0.3, 140, YEL, -0.06);
    P_('FREE SLUSHIES', '#e91e63', tFree - 0.1, tGiant - 0.15, 62, iconHeart);
    P_('GIANT ONE FOR THE GOALIE', '#e91e63', tGiant - 0.1, S('right6').end + 0.4, 48, iconHeart);
  }
}
window.dbg = { hero, heroPose, cam, wipers };
start(update, hud);
