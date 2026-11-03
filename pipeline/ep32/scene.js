// Episode 29: The road is a giant treadmill (mystery: powered by a giant hamster)
// wrong: floor it -> treadmill gets faster too, 200 km/h, 0 m -> the belt shoots you off the back into giant sawdust next to a giant water bottle. Where are you?
// right: ease off, stop, follow the cable -> a giant hamster wheel -> throw a sunflower seed -> snack break, the road stops -> drive on, the hamster waves.
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, BIG, SKY, sun, hemi,
  makeCar, blink, placeCar, applyCam,
  YEL, GREEN, RED, project, ring, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LANE = 1.75, BL = 40, BY = 0.56;        // belt half-length, belt height

// ---------------- timing ----------------
const tSomehow = WT('hook1', 'But'), tTreadmill = WT('hook2', 'treadmill'), tWhat = WT('hook2', 'What');
const tFloor = WT('wrong1', 'floor'), tFaster1 = WT('wrong1', 'Faster', 0);
const tBig = WT('wrong2', 'Big'), tTwo = WT('wrong2', 'Two'), tHaven = WT('wrong2', 'and');
const tShoots = WT('wrong3', 'shoots'), tLand = WT('wrong3', 'land'), tPile = WT('wrong3', 'pile'), tNext = WT('wrong3', 'Next'), tBottle = WT('wrong3', 'water'), tWait = WT('wrong3', 'Wait');
const tEase = WT('right2', 'Ease'), tStop = WT('right2', 'stop'), tFollow = WT('right2', 'follow');
const tWheel = WT('right3', 'giant'), tInside = WT('right3', 'inside'), tHamster = WT('right3', 'hamster');
const tThrow = WT('right4', 'Throw'), tSeed = WT('right4', 'seed'), tHeStops = WT('right4', 'stops', 0), tSnack = WT('right4', 'snack'), tRoad = WT('right4', 'road');
const tDrive = WT('right5', 'Drive'), tWave = WT('right5', 'wave'), tHardest = WT('right5', 'hardest');
const tApproved = WT('right6', 'Snack');

// ---------------- world ----------------
const CAGE = { x0: 26, x1: 90, z0: 30, z1: 112 };
makeLandscape({ avoid: (x, z) => Math.abs(x) < (Math.abs(z) < 70 ? 22 : 10) || (x > 20 && x < 96 && z > 24 && z < 118), fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 22 || (x + w / 2 > 18 && x - w / 2 < 98 && z + d / 2 > 22 && z - d / 2 < 120), near: [-40, -60, 60, 200], trees: 1500, seed: 33 });
plane(-3.6, 3.6, -BIG, -BL - 1.5, asphaltMat, 0.06, 7); plane(-3.6, 3.6, BL + 1.5, BIG, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(0.2, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -900; z < 900; z += 9) if (Math.abs(z) > BL + 3) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false); }
plane(3.3, 3.45, -BIG, -BL - 1.5, markMat, 0.08, 50); plane(-3.45, -3.3, -BIG, -BL - 1.5, markMat, 0.08, 50); plane(3.3, 3.45, BL + 1.5, BIG, markMat, 0.08, 50); plane(-3.45, -3.3, BL + 1.5, BIG, markMat, 0.08, 50);
// the treadmill
const beltTex = canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#2b2d31'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#34373c' : '#232528'; c.fillRect(0, i * 32, w, 14); } c.fillStyle = '#3d4046'; for (let i = 0; i < 40; i++) c.fillRect(hash(i) * w, hash(i + 3) * h, 2, 2); }, [1, 20]);
const belt = new THREE.Mesh(new THREE.PlaneGeometry(7.4, BL * 2), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.85 })); belt.rotation.x = -Math.PI / 2; belt.position.set(0, BY, 0); belt.receiveShadow = true; scene.add(belt);
const rollers = [];
{ const frameM = STD('#f9a825', { roughness: 0.45, metalness: 0.2 }), grey = STD('#90a4ae', { metalness: 0.6, roughness: 0.3 }), dark = STD('#263238');
  const base = new THREE.Mesh(new THREE.BoxGeometry(7.6, BY - 0.05, BL * 2 + 0.8), dark); base.position.set(0, (BY - 0.05) / 2, 0); scene.add(base);
  for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.95, BL * 2 + 1.2), frameM); side.position.set(s * 3.95, 0.48, 0); side.castShadow = side.receiveShadow = true; scene.add(side);
    const st = canvasTex(1024, 64, (c, w, h) => { c.fillStyle = '#f9a825'; c.fillRect(0, 0, w, h); c.fillStyle = '#212121'; c.font = '900 40px Inter'; c.textBaseline = 'middle'; for (let x = 20; x < w; x += 340) c.fillText('ROAD RUNNER 3000', x, h / 2 + 2); }, [6, 1]);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(BL * 2 + 1, 0.6), new THREE.MeshBasicMaterial({ map: st })); lab.position.set(s * 4.21, 0.5, 0); lab.rotation.y = s * Math.PI / 2; scene.add(lab); }
  for (const z of [-BL - 0.1, BL + 0.1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 7.4, 20).rotateZ(Math.PI / 2), grey); r.position.set(0, 0.12, z); scene.add(r); rollers.push(r); for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(7.42, 0.08, 0.95), dark); sp.rotation.x = i * Math.PI / 4; r.add(sp); } }
  for (const z of [-BL - 1.6, BL + 1.6]) { const rp = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 3.2), dark); rp.position.set(0, 0.28, z); rp.rotation.x = (z < 0 ? 1 : -1) * Math.atan2(0.5, 3.1); scene.add(rp); }
  // console arch with handrails at the front
  for (const s of [-1, 1]) { const u = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7, 0.5), grey); u.position.set(s * 4.3, 3.5, -BL + 4); u.castShadow = true; scene.add(u);
    const hr = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 26, 10).rotateX(Math.PI / 2), STD('#424242')); hr.position.set(s * 4.3, 3.2, -BL + 17); scene.add(hr); const hp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), grey); hp.position.set(s * 4.3, 1.6, -BL + 29.8); scene.add(hp); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(9.4, 2.6, 1.2), dark); top.position.set(0, 7.6, -BL + 4); top.castShadow = true; scene.add(top);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16).rotateX(Math.PI / 2), STD(['#e53935', '#43a047', '#1e88e5', '#fdd835'][i])); b.position.set(-3.3 + i * 0.7 + (i > 1 ? 4.2 : 0), 6.7, -BL + 4.65); scene.add(b); } }
// console screen (live speed)
const scrC = document.createElement('canvas'); scrC.width = 512; scrC.height = 256; const scrT = new THREE.CanvasTexture(scrC); scrT.colorSpace = THREE.SRGBColorSpace;
const scr = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.2), new THREE.MeshBasicMaterial({ map: scrT })); scr.position.set(0, 7.65, -BL + 4.62); scene.add(scr);
let lastScr = -1; function drawScreen(kmh, kcal) { const k = Math.round(kmh); if (k === lastScr) return; lastScr = k; const c = scrC.getContext('2d'); c.fillStyle = '#0b1f12'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#39ff6a'; c.font = '900 34px Inter'; c.textAlign = 'left'; c.fillText('SPEED', 24, 46); c.fillText('DISTANCE', 300, 46);
  c.font = '900 110px Inter'; c.fillText(String(k), 24, 170); c.font = '900 30px Inter'; c.fillText('KM/H', 24, 222); c.font = '900 92px Inter'; c.fillText('0.0', 300, 165); c.font = '900 30px Inter'; c.fillText('KM', 300, 222); scrT.needsUpdate = true; }
// hamster cage (sawdust, bars, water bottle), the wheel and the cable
const sawTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e8cfa0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = ['#d9b77f', '#f3dfb8', '#caa46c'][i % 3]; c.save(); c.translate(hash(i) * w, hash(i + 1) * h); c.rotate(hash(i + 2) * 6); c.fillRect(-5, -1.5, 10, 3); c.restore(); } }, [10, 12]);
{ const fl = new THREE.Mesh(new THREE.PlaneGeometry(CAGE.x1 - CAGE.x0, CAGE.z1 - CAGE.z0), new THREE.MeshStandardMaterial({ map: sawTex, roughness: 1 })); fl.rotation.x = -Math.PI / 2; fl.position.set((CAGE.x0 + CAGE.x1) / 2, 0.05, (CAGE.z0 + CAGE.z1) / 2); fl.receiveShadow = true; scene.add(fl);
  const bars = []; const HB = 26; const addBar = (x, z) => bars.push([x, HB / 2, z]);
  for (let z = CAGE.z0; z <= CAGE.z1; z += 3) { addBar(CAGE.x0, z); addBar(CAGE.x1, z); } for (let x = CAGE.x0 + 3; x < CAGE.x1; x += 3) { addBar(x, CAGE.z0); addBar(x, CAGE.z1); }
  instanced(new THREE.CylinderGeometry(0.22, 0.22, HB, 8), STD('#b0bec5', { metalness: 0.7, roughness: 0.3 }), bars, true);
  const rail = STD('#90a4ae', { metalness: 0.7 }); for (const y of [0.3, HB]) { for (const [x, z, w, d] of [[CAGE.x0, (CAGE.z0 + CAGE.z1) / 2, 0.5, CAGE.z1 - CAGE.z0], [CAGE.x1, (CAGE.z0 + CAGE.z1) / 2, 0.5, CAGE.z1 - CAGE.z0], [(CAGE.x0 + CAGE.x1) / 2, CAGE.z0, CAGE.x1 - CAGE.x0, 0.5], [(CAGE.x0 + CAGE.x1) / 2, CAGE.z1, CAGE.x1 - CAGE.x0, 0.5]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), rail); b.position.set(x, y, z); scene.add(b); } } }
const PILE = V3(34, 0, 80);
{ const p = new THREE.Mesh(new THREE.SphereGeometry(7, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: sawTex, roughness: 1 })); p.scale.set(1, 0.5, 1); p.position.copy(PILE); p.castShadow = p.receiveShadow = true; scene.add(p); }
const BOTTLE = V3(27.6, 10, 92);
{ const g = new THREE.Group(); g.position.copy(BOTTLE); scene.add(g); const b = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 9, 24), new THREE.MeshStandardMaterial({ color: '#b3e5fc', transparent: true, opacity: 0.5, roughness: 0.05, metalness: 0.1 })); g.add(b);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 6.5, 24), new THREE.MeshStandardMaterial({ color: '#4fc3f7', transparent: true, opacity: 0.6 })); water.position.y = -1.2; g.add(water);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.0, 24), STD('#e53935')); cap.position.y = -4.9; g.add(cap); const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.5, 12), STD('#cfd8dc', { metalness: 0.8 })); spout.position.set(0.9, -6.6, 0); spout.rotation.z = 0.5; g.add(spout);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.15, 6, 24), STD('#90a4ae')); strap.rotation.x = Math.PI / 2; strap.position.y = 2; g.add(strap); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// hamster wheel
const WC = V3(60, 10.6, 54), WR = 10;
const wheel = new THREE.Group(); wheel.position.copy(WC); scene.add(wheel);
{ const m = STD('#26a69a', { metalness: 0.4, roughness: 0.35 }); for (const x of [-3.2, 3.2]) { const r = new THREE.Mesh(new THREE.TorusGeometry(WR, 0.35, 10, 64), m); r.rotation.y = Math.PI / 2; r.position.x = x; wheel.add(r); }
  for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 6.4, 6).rotateZ(Math.PI / 2), STD('#80cbc4', { metalness: 0.5 })); c.position.set(0, Math.cos(a) * WR, Math.sin(a) * WR); wheel.add(c); }
  for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.25, WR * 2, 0.25), m); sp.rotation.x = i * Math.PI / 6; sp.position.x = 3.2; wheel.add(sp); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1, 16).rotateZ(Math.PI / 2), m); hub.position.x = 3.6; wheel.add(hub);
  for (const dz of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 13, 10), STD('#00897b')); leg.position.set(WC.x + 4.3, WC.y / 2, WC.z + dz * 3.8); leg.rotation.x = dz * 0.38; scene.add(leg); }
  wheel.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(3.9, 0.3, BL + 0.4), V3(9, 0.25, BL + 2), V3(20, 0.25, 44), V3(34, 0.25, 47), V3(50, 0.25, 50), V3(WC.x + 4.3, 1.0, WC.z - 3.5)]), 120, 0.28, 10, false), STD('#111', { roughness: 0.4 })); cable.castShadow = true; scene.add(cable);
{ const plug = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.2), STD('#424242')); plug.position.set(3.9, 0.4, BL + 0.5); scene.add(plug); }
// the hamster (inside the wheel at the bottom), faces -z (running direction)
const ham = new THREE.Group(); scene.add(ham); ham.position.set(WC.x, WC.y - WR + 0.4, WC.z);
const hamParts = {};
{ const fur = STD('#f0a35e', { roughness: 0.9 }), white = STD('#fff3e0', { roughness: 0.9 }), pink = STD('#f48fb1'), blk = STD('#111');
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), fur); body.scale.set(2.6, 2.4, 3.2); body.position.set(0, 2.6, 0.4); ham.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), white); belly.scale.set(2.1, 1.9, 2.4); belly.position.set(0, 2.1, -0.6); ham.add(belly);
  const head = new THREE.Group(); head.position.set(0, 3.7, -2.6); ham.add(head); hamParts.head = head;
  const hm = new THREE.Mesh(new THREE.SphereGeometry(1.75, 24, 18), fur); head.add(hm);
  const cheeks = [-1, 1].map(s => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), white); c.position.set(s * 1.2, -0.55, -0.6); head.add(c); return c; }); hamParts.cheeks = cheeks;
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 10), blk); e.position.set(s * 0.95, 0.35, -1.25); head.add(e); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); gl.position.set(s * 1.0, 0.5, -1.55); head.add(gl);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), fur); ear.scale.set(1, 1, 0.45); ear.position.set(s * 1.0, 1.55, -0.2); head.add(ear); const ei = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), pink); ei.scale.set(1, 1, 0.3); ei.position.set(s * 1.0, 1.55, -0.38); head.add(ei);
    for (const k of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 4), STD('#5d4037')); w.rotation.z = Math.PI / 2 + k * 0.2; w.position.set(s * 1.25, -0.35 + k * 0.12, -1.5); head.add(w); } }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), pink); nose.position.set(0, -0.2, -1.75); head.add(nose);
  hamParts.legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([s, f]) => { const g = new THREE.Group(); g.position.set(s * 1.2, 1.1, f * 1.4 + 0.3); ham.add(g); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 8), fur); l.position.y = -0.45; g.add(l); const p = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), pink); p.scale.set(1, 0.5, 1.3); p.position.set(0, -0.95, -0.15); g.add(p); return g; });
  hamParts.arms = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 1.3, 2.9, -1.9); ham.add(g); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.0, 8), fur); a.position.y = -0.45; g.add(a); const p = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), pink); p.position.y = -0.95; g.add(p); g.userData.s = s; return g; });
  ham.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// sunflower seed
const seedTex = canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#212121'; c.fillRect(0, 0, w, h); c.fillStyle = '#e0e0e0'; for (let i = 0; i < 6; i++) c.fillRect(i * 22 + 4, 0, 6, h); });
const seed = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), new THREE.MeshStandardMaterial({ map: seedTex, roughness: 0.6 })); seed.scale.set(0.45, 0.28, 1.0); seed.castShadow = true; scene.add(seed);

// ---------------- motion ----------------
// belt speed (m/s, moving +z under the car); the car stays at z=0 while the belt keeps up with it
const vBeltW = t => t < tFloor ? 16 : lerp(16, 56, ease(clamp((t - tFloor) / 5.5)));
const T_HSTOP = tHeStops + 0.1, T_BSTOP = tRoad + 0.3;
const vBeltR = t => t < T_HSTOP ? 16 : lerp(16, 0, ease(clamp((t - T_HSTOP) / (T_BSTOP - T_HSTOP))));
function integ(vfn, t0, t1) { const tab = []; let s = 0; for (let t = t0; t <= t1 + 0.1; t += 1 / 60) { tab.push(s); s += vfn(t) / 60; } return t => { const k = clamp((t - t0) * 60, 0, tab.length - 2), i = Math.floor(k); return lerp(tab[i], tab[i + 1], k - i); }; }
const beltW = integ(vBeltW, 0, tRew0 + 1), beltR = integ(vBeltR, tRew0, TOTAL + 1);
const beltPos = t => t < tRew0 + 0.5 ? beltW(t) : beltW(tRew0) + beltR(t);
const beltSpeed = t => t < tRew0 + 0.5 ? (t < T_SHOOT ? vBeltW(t) : 0) : vBeltR(t);
// wrong: shot off the back
const T_SHOOT = tShoots + 0.15, T_OFF = T_SHOOT + 0.45, T_LAND = tLand + 0.2;
const fly = new THREE.CubicBezierCurve3(V3(LANE, BY, BL), V3(6, 24, BL + 18), V3(26, 30, 70), V3(PILE.x - 1, 3.0, PILE.z - 1));
// right: drive on after the road stops
const T_GO = tDrive + 0.1;
const T_S0 = tThrow + 0.35, T_S1 = tSeed + 0.6;
const SEED_A = V3(LANE + 1.1, 1.5, 0.1), SEED_B = V3(WC.x - 0.5, WC.y - WR + 4.0, WC.z - 4.3);
function seedPos(t) { const u = clamp((t - T_S0) / (T_S1 - T_S0)); const p = SEED_A.clone().lerp(SEED_B, u); p.y += 22 * Math.sin(Math.PI * u); return p; }
function heroPose(t) {
  const right = t >= tRew0 + 0.5;
  if (!right) {
    if (t < T_SHOOT) return { x: LANE, y: BY, z: 0, h: 0, pitch: 0, roll: 0 };
    if (t < T_OFF) { const u = easeIn(clamp((t - T_SHOOT) / (T_OFF - T_SHOOT))); return { x: LANE, y: BY, z: BL * u, h: 0, pitch: 0, roll: 0 }; }
    if (t < T_LAND) { const u = clamp((t - T_OFF) / (T_LAND - T_OFF)); const p = fly.getPoint(u); return { x: p.x, y: p.y, z: p.z, h: 0.4 * u, pitch: 2 * Math.PI * ease(u) - 0.5 * u, roll: 0.3 * Math.sin(Math.PI * u) }; }
    return { x: PILE.x - 1, y: 3.0, z: PILE.z - 1, h: 0.4, pitch: -0.25, roll: 0.12 };
  }
  if (t < T_GO) return { x: LANE, y: BY, z: 0, h: 0, pitch: 0, roll: 0 };
  const f = t - T_GO; const z = -(1.5 * f * f + 6 * Math.max(0, f - 2) * 0); const zz = f < 3 ? -2.2 * f * f : -19.8 - 13.2 * (f - 3); return { x: LANE, y: zz > -BL - 1 ? BY : (zz > -BL - 3.2 ? lerp(BY, 0, (-BL - 1 - zz) / 2.2) : 0), z: zz, h: 0, pitch: 0, roll: 0 };
}

// ---------------- camera ----------------
const Ac = (p, l) => () => [V3(...p), V3(...l)];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2])]; };
const AcL = (p, lo = [0, 1, 0]) => t => { const h = heroPose(t); return [V3(...p), V3(h.x + lo[0], h.y + lo[1], h.z + lo[2])]; };
const cut = (t0, f) => [[t0, f], [t0 + 0.04, f]];
const HAM = V3(WC.x, WC.y - WR + 3.5, WC.z);
const camKeys = [
  [0.0, Hf([1.2, 2.6, 9.5], [0, 1.6, -25])],
  [tSomehow - 0.3, Hf([1.2, 2.5, 9.0], [0, 1.6, -25])],
  ...cut(tSomehow - 0.25, Ac([-9.5, 2.0, 1.5], [LANE, 1.0, -1])),
  [tTreadmill - 0.5, Ac([-9.3, 2.1, 1.2], [LANE, 1.0, -1])],
  ...cut(tTreadmill - 0.45, Ac([-22, 18, 44], [2, 0, -8])),
  [tWhat - 0.3, Ac([-21, 17, 42], [2, 0, -8])],
  ...cut(tWhat - 0.25, Ac([-12, 7, 18], [1, 2, -6])),
  [S('hook2').end + 0.5, Ac([-12, 6.8, 17], [1, 2, -6])],
  // wrong
  ...cut(S('wrong1').start - 0.3, Hf([1.2, 2.6, 9.5], [0, 1.6, -25])),
  [tBig - 0.2, Hf([1.0, 2.2, 8.0], [0, 1.6, -25])],
  ...cut(tBig - 0.15, Ac([-9.5, 2.0, 1.5], [LANE, 1.0, -1])),
  [tTwo - 0.3, Ac([-9.3, 2.0, 1.2], [LANE, 1.0, -1])],
  ...cut(tTwo - 0.25, Ac([0.3, 6.4, -27], [0, 7.4, -BL + 4.6])),
  [tHaven - 0.3, Ac([0.3, 6.6, -28], [0, 7.4, -BL + 4.6])],
  ...cut(tHaven - 0.25, Hf([-2.5, 1.6, -6.5], [0, 1.0, 0])),
  [tShoots - 0.3, Hf([-2.4, 1.6, -6.2], [0, 1.0, 0])],
  ...cut(tShoots - 0.25, AcL([-10, 5, BL + 16], [0, 1, 0])),
  [T_LAND - 0.6, AcL([-10, 6, BL + 18], [0, 1, 0])],
  ...cut(T_LAND - 0.55, Ac([42, 5.5, 70], [PILE.x - 1, 2.4, PILE.z - 1])),
  [tNext - 0.3, Ac([42, 5.5, 71], [PILE.x - 1, 2.4, PILE.z - 1])],
  [tBottle - 0.1, Ac([40, 6.5, 74], [BOTTLE.x + 1, BOTTLE.y - 2, BOTTLE.z])],
  [tWait - 0.1, Ac([40, 7.0, 75], [BOTTLE.x + 1, BOTTLE.y - 2, BOTTLE.z])],
  [tRew0 + 0.45, Ac([48, 30, 64], [31, 2, 84])],
  // right
  [tRew0 + 0.55, Hf([1.2, 2.6, 9.5], [0, 1.6, -25])],
  [tEase - 0.3, Hf([1.2, 2.6, 9.5], [0, 1.6, -25])],
  ...cut(tEase - 0.25, Ac([-9.5, 2.0, 1.5], [LANE, 1.0, -1])),
  [tFollow - 0.35, Ac([-9.3, 2.0, 1.2], [LANE, 1.0, -1])],
  ...cut(tFollow - 0.3, Ac([-1, 4.5, BL - 4], [6, 0.3, BL + 4])),
  [tWheel - 0.4, Ac([8, 7, BL - 2], [30, 1, 47])],
  [tInside - 0.4, Ac([20, 9, 26], [WC.x, WC.y - 1, WC.z])],
  ...cut(tInside - 0.35, Ac([WC.x - 26, 6, WC.z - 4], [HAM.x, HAM.y, HAM.z])),
  [tThrow - 0.35, Ac([WC.x - 24, 5.5, WC.z - 3], [HAM.x, HAM.y, HAM.z])],
  ...cut(tThrow - 0.3, Ac([LANE + 5.5, 2.4, -5.5], [LANE + 0.6, 1.3, 0])),
  [T_S0 + 0.05, Ac([LANE + 5.3, 2.5, -5.3], [LANE + 0.8, 1.6, 0])],
  ...cut(T_S0 + 0.1, t => { const p = seedPos(t); return [V3(p.x - 9, p.y + 2.5, p.z - 6), p]; }),
  [tSeed + 0.15, t => { const p = seedPos(t); return [V3(p.x - 9, p.y + 2.5, p.z - 6), p]; }],
  ...cut(tSeed + 0.2, Ac([WC.x - 12, 6.5, WC.z - 17], [HAM.x, HAM.y + 0.3, HAM.z - 2.5])),
  [tRoad - 0.35, Ac([WC.x - 11, 6.0, WC.z - 15.5], [HAM.x, HAM.y + 0.3, HAM.z - 2.5])],
  ...cut(tRoad - 0.3, Ac([-9.5, 2.0, 1.5], [LANE, 1.0, -1])),
  [T_GO, Ac([-9.5, 2.0, 1.5], [LANE, 1.0, -2])],
  [tWave - 0.3, Hf([1.2, 2.6, 9.5], [0, 1.6, -20])],
  ...cut(tWave - 0.25, Ac([WC.x - 12, 6.5, WC.z - 17], [HAM.x, HAM.y + 0.8, HAM.z - 2])),
  [tApproved - 0.35, Ac([WC.x - 11, 6.2, WC.z - 16], [HAM.x, HAM.y + 0.8, HAM.z - 2])],
  ...cut(tApproved - 0.3, Ac([WC.x - 17, 8, WC.z - 19], [HAM.x, HAM.y + 1, HAM.z - 1])),
  [S('outro').start + 0.4, Ac([WC.x - 24, 10, WC.z - 16], [HAM.x, HAM.y + 1.5, HAM.z])],
  [TOTAL - 0.4, Ac([CAGE.x0 + 3, 15, CAGE.z0 + 3], [HAM.x, HAM.y + 1, HAM.z])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = b === a ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u) };
}

// ---------------- update ----------------
const dust = Array.from({ length: 36 }, (_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.5), STD(['#d9b77f', '#f3dfb8', '#caa46c'][i % 3])); m.userData.d = [hash(i + 1) * 6.28, hash(i + 2), hash(i + 3)]; scene.add(m); return m; });
const sparks = Array.from({ length: 24 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffd54f' })); m.userData.d = [hash(i + 11), hash(i + 12), hash(i + 13)]; scene.add(m); return m; });
function update(t) {
  const right = t >= tRew0 + 0.5;
  const hp = heroPose(t); placeCar(hero, hp);
  const bp = beltPos(t); beltTex.offset.y = bp / 4; rollers.forEach(r => r.rotation.x = -bp / 0.5);
  // wheels spin with the belt while the car "drives" on it
  const onBelt = Math.abs(hp.z) < BL && hp.y <= BY + 0.01; const spin = onBelt ? (right && t > tStop ? (t > T_GO ? -(-hp.z) / 0.34 : 0) : -bp / 0.34) : null; if (spin !== null) hero.userData.wheels.forEach(w => w.rotation.x = spin);
  hero.userData.tl.emissiveIntensity = right && t > tStop - 0.1 && t < T_GO ? 2.5 : 0.35;
  const kmh = (right ? (t < tStop ? 58 : t < T_GO ? 0 : 0) : (t < T_SHOOT ? vBeltW(t) * 3.6 : 0)) * (t < tFloor && !right ? 1 : 1);
  drawScreen(right ? vBeltR(t) * 3.6 : (t < T_SHOOT ? Math.min(200, vBeltW(t) * 3.6 * (200 / 201.6)) : 0), 0);
  // hamster: runs while the belt runs (right), unseen in the wrong way
  const run = right ? vBeltR(t) / 16 : 1; const ws = (right ? beltR(t) : beltW(t)) / WR; wheel.rotation.x = ws;
  ham.visible = true; ham.position.y = WC.y - WR + 0.4 + 0.25 * Math.abs(Math.sin(t * 12)) * run; ham.rotation.set(0.05 * run, right && t > T_HSTOP ? 0.9 * ease(clamp((t - T_HSTOP) / 0.8)) : 0, 0);
  hamParts.legs.forEach((g, i) => g.rotation.x = run * 0.9 * Math.sin(t * 14 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)));
  const eat = right && t > T_HSTOP ? 1 : 0, wv = right && t > tWave - 0.2 && t < tApproved + 1.5 ? 1 : 0;
  hamParts.arms.forEach(g => { const s = g.userData.s; g.rotation.set(run * 0.8 * Math.sin(t * 14 + s), 0, 0); if (eat) g.rotation.set(-1.2, 0, -s * 0.5); g.scale.setScalar(1); g.position.set(s * 1.3, 2.9, -1.9); if (wv && s > 0) { g.position.set(s * 2.0, 3.4, -1.7); g.rotation.set(-0.2, 0, 2.3 + 0.5 * Math.sin(t * 9)); g.scale.setScalar(1.6); } });
  hamParts.cheeks.forEach(c => c.scale.setScalar(1 + (eat ? 0.32 * ease(clamp((t - tSnack) / 0.5)) : 0)));
  hamParts.head.rotation.set(eat ? 0.15 : 0, right && t > tHamster - 0.2 && !eat ? 0.45 : 0, 0);
  // seed throw (right)
  seed.visible = right && t > T_S0 - 0.25;
  arm.visible = right && t > tThrow - 0.3 && t < T_S0 + 0.5; if (arm.visible) arm.rotation.z = -0.3 - 1.6 * ease(clamp((t - tThrow) / (T_S0 - tThrow)));
  if (seed.visible) { if (t < T_S0) { seed.position.copy(arm.localToWorld(V3(0, 0.95, 0))); seed.rotation.set(0, 0, 0); } else if (t < T_S1) { seed.position.copy(seedPos(t)); seed.rotation.set(t * 8, t * 5, 0); } else { ham.updateMatrixWorld(true); seed.position.copy(t > T_HSTOP ? hamParts.head.localToWorld(V3(0, -1.5, -1.6)) : V3(HAM.x - 0.5, 0.9, HAM.z - 4.6)); seed.rotation.set(t > T_HSTOP ? -1.1 : 0, ham.rotation.y, 0); if (t > tSnack + 0.4) seed.scale.set(0.45 * (1 - ease(clamp((t - tSnack - 0.4) / 1.2))), 0.28, 1.0 * (1 - ease(clamp((t - tSnack - 0.4) / 1.2)))); } }
  // sawdust burst (wrong)
  dust.forEach(m => { const d = m.userData.d; const s = (t - T_LAND) / 1.6; const on = !right && s > 0 && s < 1; m.visible = on; if (!on) return; const r = 1.5 + 6 * d[1] * easeOut(s); m.position.set(PILE.x - 1 + Math.cos(d[0]) * r, 2.5 + (5 + 5 * d[2]) * s - 9 * s * s, PILE.z - 1 + Math.sin(d[0]) * r); m.rotation.set(t * 5 * d[1], t * 3, d[2] * 4); });
  // sparks from the rollers at high speed (wrong)
  const hot = !right ? ramp(t, tBig, tTwo) * (t < T_SHOOT + 0.6 ? 1 : 0) : 0; sparks.forEach((m, i) => { const d = m.userData.d; const s = ((t * 2.2 + d[0]) % 1); m.visible = hot > 0.05; if (!m.visible) return; const z0 = i % 2 ? BL + 0.2 : -BL - 0.2; m.position.set((d[1] - 0.5) * 7, 0.2 + 2.2 * s - 3 * s * s, z0 + (i % 2 ? 1 : -1) * 4 * s); });
  const c = cam(t); camera.near = clamp(c.p.y * 0.3, 0.3, 2.0); camera.updateProjectionMatrix();
  applyCam(c, t, (!right && t > T_LAND - 0.02 && t < T_LAND + 0.3) ? 0.1 : (!right && t > tTwo && t < T_SHOOT ? 0.03 : 0));
}

// ---------------- HUD ----------------
function speedo(t, a, b, kmh, dist) { if (t < a || t > b) return; const f = win(t, a, b, 0.25); ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1580);
  ctx.fillStyle = 'rgba(12,14,20,0.85)'; rr(-330, -120, 660, 220, 36); ctx.fill(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9aa0a6'; ctx.font = '900 30px Inter'; ctx.fillText('SPEED', -160, -70); ctx.fillText('DISTANCE', 160, -70);
  ctx.fillStyle = kmh > 120 ? '#ff5252' : '#fff'; ctx.font = '900 88px Inter'; ctx.fillText(String(Math.round(kmh)), -160, 10); ctx.fillStyle = '#ffd54f'; ctx.fillText(dist, 160, 10);
  ctx.fillStyle = '#9aa0a6'; ctx.font = '900 26px Inter'; ctx.fillText('KM/H', -160, 72); ctx.fillText('METRES', 160, 72); ctx.restore(); }
function hud(t) {
  const right = t >= tRew0 + 0.5;
  if (!right) {
    speedo(t, 1.2, tTreadmill - 0.3, 58, '0');
    pill('ROAD: GIANT TREADMILL', W / 2, 420, '#f9a825', '#212121', 46, win(t, tTreadmill - 0.2, S('hook2').end + 0.4, 0.2), back((t - tTreadmill + 0.2) / 0.35), iconWarn);
    pill('FLOOR IT', W / 2, 420, RED, '#fff', 52, win(t, tFloor - 0.2, tBig - 0.1, 0.2), back((t - tFloor + 0.2) / 0.35), iconX);
    speedo(t, tFloor, T_SHOOT, Math.min(200, vBeltW(t) * 3.6 * (200 / 201.6)), '0');
    pill('DISTANCE TRAVELLED: 0 M', W / 2, 420, '#424242', '#fff', 44, win(t, tHaven - 0.2, tShoots - 0.2, 0.2), back((t - tHaven + 0.2) / 0.35));
    floatText('YEET!', W / 2, 720, t, T_SHOOT, T_SHOOT + 0.9, 140, '#fff59d', -0.06);
    floatText('POOF!', W / 2, 760, t, T_LAND, T_LAND + 0.9, 140, '#f3dfb8', 0.06);
    pill('GIANT SAWDUST?', W / 2, 420, '#c9973f', '#fff', 48, win(t, tPile - 0.2, tBottle - 0.3, 0.2), back((t - tPile + 0.2) / 0.35));
    pill('GIANT WATER BOTTLE?', W / 2, 420, '#0288d1', '#fff', 46, win(t, tBottle - 0.3, tWait - 0.2, 0.2), back((t - tBottle + 0.3) / 0.35));
    pill('WAIT... WHERE ARE YOU?', W / 2, 420, '#6a1b9a', '#fff', 46, win(t, tWait - 0.2, tRew0, 0.2), back((t - tWait + 0.2) / 0.35));
  } else {
    pill('EASE OFF · STOP', W / 2, 420, '#1c4fa8', '#fff', 50, win(t, tEase - 0.2, tFollow - 0.2, 0.2), back((t - tEase + 0.2) / 0.35), iconCheck);
    pill('FOLLOW THE CABLE', W / 2, 420, GREEN, '#fff', 50, win(t, tFollow - 0.2, tInside - 0.3, 0.2), back((t - tFollow + 0.2) / 0.35), iconCheck);
    pill('POWER SOURCE: HAMSTER', W / 2, 420, '#f57c00', '#fff', 46, win(t, tHamster - 0.3, tThrow - 0.2, 0.2), back((t - tHamster + 0.3) / 0.35), iconHeart);
    pill('SUNFLOWER SEED', W / 2, 420, '#424242', '#fff', 50, win(t, tThrow - 0.2, tHeStops - 0.2, 0.2), back((t - tThrow + 0.2) / 0.35));
    pill('SNACK TIME', W / 2, 420, '#f57c00', '#fff', 52, win(t, tHeStops - 0.2, tRoad - 0.2, 0.2), back((t - tHeStops + 0.2) / 0.35), iconHeart);
    pill('ROAD: STOPPED', W / 2, 420, GREEN, '#fff', 52, win(t, tRoad - 0.2, tDrive - 0.2, 0.2), back((t - tRoad + 0.2) / 0.35), iconCheck);
    pill('ROAD WORKER OF THE YEAR', W / 2, 420, '#00838f', '#fff', 44, win(t, tHardest - 0.2, tApproved - 0.2, 0.2), back((t - tHardest + 0.2) / 0.35));
    pill('SNACK BREAK: APPROVED', W / 2, 420, '#f9a825', '#fff', 46, win(t, tApproved - 0.2, S('right7').start, 0.2), back((t - tApproved + 0.2) / 0.35), iconCheck);
  }
}
const hero = makeCar('#35d43a');
const arm = new THREE.Group(); arm.position.set(0.85, 1.05, -0.05); hero.add(arm);
{ const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.8, 8), STD('#2b6cb0')); a.position.y = 0.4; arm.add(a); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), STD('#f1c27d')); hd.position.y = 0.85; arm.add(hd); }
window.dbg = { heroPose, cam };
start(update, hud);
