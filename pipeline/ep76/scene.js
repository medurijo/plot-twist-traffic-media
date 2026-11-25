// Episode 71: Motorway – a car transporter wants to load your car
// hook: motorway, a car transporter with seven red cars, exactly like yours -> its ramp comes down right in front of
//       your bumper, the driver waves you on
// wrong: overtake, full throttle past the ramp -> the transporter is faster, swerves in front of you, up you go to the
//        top deck -> next stop: car showroom, on a turntable with a giant red bow, on sale, half price
// right: stay behind, window down, show him your car is not new -> old crisps, a sock from last week, a sandwich from...
//        nobody knows -> the smell reaches the driver, definitely not a new car, ramp up very fast -> he feels sorry,
//        grabs something from the delivery -> NEW CAR SMELL: one spray and your car sparkles like on day one
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, plane, box, instanced, makeLandscape, makeCar, makeWheel, placeCar, applyCam, project,
  YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, bigText, start, aoPass, hemi, sun, grassMat, asphaltMat, markMat, _m, _q, _v, _s, _c, _e
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
const tMotor = WT('hook1', 'Motorway'), tTrans = WT('hook1', 'transporter'), tSeven = WT('hook1', 'Seven'), tExactly = WT('hook1', 'Exactly');
const tRamp = WT('hook2', 'ramp'), tRight = WT('hook2', 'Right'), tBumper = WT('hook2', 'bumper'), tDriver = WT('hook2', 'driver'), tWaves = WT('hook2', 'waves'), tWhat = WT('hook2', 'What');
const W1 = S('wrong1').start, tOver = WT('wrong1', 'overtake'), tFull = WT('wrong1', 'Full'), tPast = WT('wrong1', 'past');
const tFaster = WT('wrong2', 'faster'), tSwerves = WT('wrong2', 'swerves'), tUp = WT('wrong2', 'up'), tTop = WT('wrong2', 'top');
const tShow = WT('wrong3', 'showroom'), tTurn = WT('wrong3', 'turntable'), tBow = WT('wrong3', 'bow'), tSale = WT('wrong3', 'sale'), tHalf = WT('wrong3', 'half');
const tStay = WT('right2', 'Stay'), tWindow = WT('right2', 'Window'), tShowH = WT('right2', 'show'), tNew = WT('right2', 'new');
const tCrisps = WT('right3', 'crisps'), tSock = WT('right3', 'sock'), tSandw = WT('right3', 'sandwich'), tNobody = WT('right3', 'nobody');
const tSmell = WT('right4', 'smell'), tReach = WT('right4', 'reaches'), tDrv = WT('right4', 'driver'), tDefin = WT('right4', 'definitely'), tRampUp = WT('right4', 'Ramp'), tFast = WT('right4', 'fast');
const tFeels = WT('right5', 'feels'), tGrabs = WT('right5', 'grabs'), tDeliv = WT('right5', 'delivery');
const tNCS = WT('right6', 'New'), tSpray = WT('right6', 'spray'), tSpark = WT('right6', 'sparkles'), tDay = WT('right6', 'day');
const isRight = t => t >= tRew0 + 0.5;
const T_SHOW = S('wrong3').start - 0.1;
const X0 = 3000;                                    // showroom set
const V = 18, Z0 = 600;                              // convoy speed + start
const CZ = t => Z0 - V * t;

// ---------------- motorway ----------------
{ const road = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 1700), asphaltMat); road.rotation.x = -PI / 2; road.position.set(0, 0.04, -100); road.receiveShadow = true; asphaltMat.map.repeat.set(2, 300); scene.add(road);
  const road2 = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 1700), asphaltMat); road2.rotation.x = -PI / 2; road2.position.set(-11, 0.04, -100); road2.receiveShadow = true; scene.add(road2);
  const mid = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1700), L('#7fa95a')); mid.rotation.x = -PI / 2; mid.position.set(-5.5, 0.045, -100); mid.receiveShadow = true; scene.add(mid);
  const dg = new THREE.PlaneGeometry(0.15, 4); dg.rotateX(-PI / 2); const pts = [];
  for (let z = 750; z > -950; z -= 12) { pts.push([0, 0.06, z, 0, 1, 1, 1]); pts.push([-11, 0.06, z, 0, 1, 1, 1]); }
  instanced(dg, markMat, pts, false);
  for (const x of [4.25, -4.25, -6.75, -15.25]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1700), markMat); e.rotation.x = -PI / 2; e.position.set(x, 0.06, -100); scene.add(e); }
  // central crash barrier + posts
  const railM = STD('#c3c8cc', { metalness: 0.7, roughness: 0.35 });
  for (const x of [-4.95, -6.05]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 1700), railM); r.position.set(x, 0.62, -100); r.castShadow = true; r.receiveShadow = true; scene.add(r); }
  const pp = []; for (let z = 750; z > -950; z -= 4) pp.push([-5.5, 0.35, z, 0, 1, 1, 1]); instanced(new THREE.BoxGeometry(1.2, 0.7, 0.1), STD('#9aa0a6', { metalness: 0.5 }), pp, false);
  // verge posts on the right
  const vp = []; for (let z = 750; z > -950; z -= 25) vp.push([5.6, 0.5, z, 0, 1, 1, 1]); instanced(new THREE.BoxGeometry(0.14, 1.0, 0.14), L('#f2f2f2'), vp);
}
makeLandscape({ avoid: (x, z) => x > -24 && x < 16, fieldAvoid: (x, z, w, d) => x + w / 2 > -26 && x - w / 2 < 18, near: [40, 0, 60, 1400], trees: 1500, seed: 7101 });
// gantry sign far ahead (atmosphere)
for (const zg of [180, -420]) { const gm = STD('#7d8287', { metalness: 0.6 }); box(0.3, 7, 0.3, gm, 6.0, 3.5, zg, true); box(0.3, 7, 0.3, gm, -4.6, 3.5, zg, true); box(10.9, 0.3, 0.3, gm, 0.7, 6.9, zg, true);
  const st = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#1e5aa8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#fff'; c.font = '800 60px Inter'; c.textAlign = 'center'; c.fillText('A7   SHOWROOMS', w / 2, 70); c.font = '800 44px Inter'; c.fillText('next exit  2 km', w / 2, 128); });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.6), new THREE.MeshLambertMaterial({ map: st })); s.position.set(1.9, 6.0, zg + 0.2); s.rotation.y = 0; scene.add(s);
  const sb = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.6), L('#5b6168')); sb.position.set(1.9, 6.0, zg - 0.0); sb.rotation.y = PI; scene.add(sb); }
// oncoming traffic on the other carriageway
const oncoming = ['#1e88e5', '#fdd835', '#eceff1', '#43a047', '#8e24aa', '#455a64'].map((c, i) => ({ car: makeCar(c), base: i * 67, x: i % 2 ? -8.9 : -12.9 }));

// ---------------- the car transporter (faces -z; origin = cab/trailer joint on the ground) ----------------
const trans = new THREE.Group(); scene.add(trans);
const cabM = STD('#1565c0', { roughness: 0.3, metalness: 0.35 }), darkM = STD('#2a2c30', { roughness: 0.7 }), frameM = STD('#f9a825', { roughness: 0.45, metalness: 0.3 });
const DK1 = 0.6, DK2 = 2.6, TZ0 = 0.6, TZ1 = 19.0;
const SLOTS = [3.0, 7.6, 12.2, 16.8];
const tb = (w, h, d, m, x, y, z, p = trans) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
{ // cab: lower body solid, cabin hollow (driver visible), open left window
  tb(2.5, 1.25, 3.1, cabM, 0, 1.3, -1.75);             // lower body y 0.675..1.925
  tb(2.5, 0.14, 3.1, cabM, 0, 3.38, -1.75);            // roof
  tb(2.5, 1.45, 0.12, cabM, 0, 2.65, -0.26);           // back wall
  for (const [x, z] of [[-1.19, -3.24], [1.19, -3.24], [-1.19, -0.3], [1.19, -0.3]]) tb(0.12, 1.45, 0.12, cabM, x, 2.65, z);
  tb(0.12, 0.25, 3.0, cabM, 1.19, 2.05, -1.75); tb(0.12, 0.25, 3.0, cabM, -1.19, 2.05, -1.75);     // window sills
  tb(2.5, 0.14, 3.1, STD('#37474f'), 0, 1.95, -1.75);  // cabin floor
  const glassM = new THREE.MeshStandardMaterial({ color: '#a8c8de', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.3, depthWrite: false });
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.2), glassM); ws.position.set(0, 2.72, -3.27); ws.rotation.y = PI; ws.userData.noAO = true; trans.add(ws);
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.2), glassM); sw.position.set(1.2, 2.72, -1.75); sw.rotation.y = PI / 2; sw.userData.noAO = true; trans.add(sw);
  tb(2.6, 0.4, 0.3, darkM, 0, 0.75, -3.4);             // bumper
  tb(1.5, 0.75, 0.05, STD('#b0b6bd', { metalness: 0.8, roughness: 0.3 }), 0, 1.35, -3.33);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), new THREE.MeshBasicMaterial({ color: '#fff7d6', toneMapped: false })); hl.position.set(s * 0.95, 1.05, -3.34); hl.rotation.y = PI; trans.add(hl); }
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 20), darkM); wheel.position.set(-0.55, 2.3, -2.75); wheel.rotation.x = -0.9; trans.add(wheel);
  const seat = tb(0.7, 0.12, 0.6, STD('#263238'), -0.55, 2.1, -1.9); const back_ = tb(0.7, 0.8, 0.12, STD('#263238'), -0.55, 2.5, -1.55);
  // "DELIVERY" on the cab side
  const dl = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.font = '900 84px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DELIVERY', w / 2, h / 2 + 4); });
  for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshLambertMaterial({ map: dl, transparent: true })); d.position.set(s * 1.26, 1.35, -1.75); d.rotation.y = s * PI / 2; trans.add(d); }
  // mirrors
  for (const s of [1]) { tb(0.08, 0.5, 0.25, darkM, s * 1.45, 2.6, -3.05); tb(0.3, 0.05, 0.05, darkM, s * 1.32, 2.85, -3.05); }
  // beacon
  const bc = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 12), new THREE.MeshBasicMaterial({ color: '#ffa000', toneMapped: false })); bc.position.set(0, 3.55, -2.6); trans.add(bc);
  // joint
  tb(1.0, 0.4, 1.0, darkM, 0, 0.9, 0.2);
  // trailer: lower deck, upper deck, posts, rails
  tb(2.3, 0.14, TZ1 - TZ0, darkM, 0, DK1 - 0.07, (TZ0 + TZ1) / 2);
  tb(2.3, 0.14, TZ1 - TZ0, darkM, 0, DK2 - 0.07, (TZ0 + TZ1) / 2);
  for (const s of [-1, 1]) { tb(0.1, 0.22, TZ1 - TZ0, frameM, s * 1.17, DK1 - 0.05, (TZ0 + TZ1) / 2); tb(0.1, 0.22, TZ1 - TZ0, frameM, s * 1.17, DK2 - 0.05, (TZ0 + TZ1) / 2);
    for (const z of [0.7, 5.3, 9.9, 14.5, 18.9]) tb(0.12, DK2 - DK1, 0.12, frameM, s * 1.2, (DK1 + DK2) / 2, z); }
  // wheels: cab + trailer
  trans.userData.wheels = [];
  for (const [z, r] of [[-2.55, 0.52], [-0.9, 0.52]]) for (const s of [-1, 1]) { const w = makeWheel(r, 0.38); w.position.set(s * 1.05, r, z); trans.add(w); trans.userData.wheels.push(w); }
  for (const z of [1.6, 15.0, 16.0, 17.0]) for (const s of [-1, 1]) { const w = makeWheel(0.4, 0.34); w.position.set(s * 1.38, 0.4, z); trans.add(w); trans.userData.wheels.push(w); }
  // tail lights
  for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), new THREE.MeshStandardMaterial({ color: '#7a0000', emissive: '#ff1010', emissiveIntensity: 0.6 })); t.position.set(s * 0.95, 0.45, TZ1 + 0.02); trans.add(t); }
}
// the telescopic ramp (hinged at the back of the upper deck)
const rampG = new THREE.Group(); rampG.position.set(0, DK2, TZ1); trans.add(rampG);
const stripeT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let x = -64; x < w; x += 40) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 20, h); c.lineTo(x + 44, 0); c.lineTo(x + 24, 0); c.closePath(); c.fill(); } }, true);
const plateM = STD('#8a9096', { metalness: 0.75, roughness: 0.35 });
const PLEN = 2.45, RLEN = 7.0, TH_D = Math.asin(2.58 / RLEN);
const plates = [2.3, 2.2, 2.1].map((w, k) => { const g = new THREE.Group(); rampG.add(g);
  const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, PLEN), plateM); p.position.set(0, -0.05 - k * 0.04, PLEN / 2); p.castShadow = true; p.receiveShadow = true; g.add(p);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, PLEN), new THREE.MeshLambertMaterial({ map: stripeT })); e.position.set(s * (w / 2 - 0.1), -0.03 - k * 0.04, PLEN / 2); g.add(e); }
  return g; });
function setRamp(u) {
  const th = lerp(PI / 2, TH_D, u); const Lr = clamp(2.58 / Math.sin(th), PLEN, RLEN);
  rampG.rotation.x = th; plates.forEach((g, k) => g.position.z = k * (Lr - PLEN) / 2);
}
// seven red cars on board
const RED_CAR = '#e53935';
const cargo = [];
for (const [z, y] of [[SLOTS[0], DK2], [SLOTS[1], DK2], [SLOTS[2], DK2], [SLOTS[0], DK1], [SLOTS[1], DK1], [SLOTS[2], DK1], [SLOTS[3], DK1]]) { const c = makeCar(RED_CAR); trans.add(c); placeCar(c, { x: 0, y, z, h: 0 }); cargo.push(c); }
// driver
const drv = new THREE.Group(); drv.position.set(-0.55, 2.62, -2.05); trans.add(drv);
const skinC = new THREE.Color('#f0c39d'), greenC = new THREE.Color('#9ccc65');
const skinM = STD('#f0c39d', { roughness: 0.7 });
const DR = {};
{ DR.head = new THREE.Group(); drv.add(DR.head);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 14), skinM); DR.head.add(head);
  const capM = STD('#ff7043'); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 10, 0, PI * 2, 0, PI / 2), capM); cap.position.y = 0.05; DR.head.add(cap);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.22), capM); brim.position.set(0, 0.07, -0.3); DR.head.add(brim);
  DR.eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8), STD('#fff', { roughness: 0.2 })); e.position.set(s * 0.1, 0.0, -0.23); DR.head.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), STD('#111')); p.position.set(0, 0, -0.05); e.add(p); return e; });
  DR.nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), skinM); DR.nose.position.set(0, -0.06, -0.27); DR.head.add(DR.nose);
  DR.mouth = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), STD('#7a2020')); DR.mouth.position.set(0, -0.15, -0.23); DR.mouth.scale.set(1, 0.3, 0.4); DR.head.add(DR.mouth);
  const mus = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), STD('#5d4037')); mus.rotation.z = PI / 2; mus.position.set(0, -0.11, -0.25); DR.head.add(mus);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.33, 0.62, 12), STD('#455a64')); body.position.y = -0.5; drv.add(body);
  DR.arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 1, 8), STD('#455a64')); trans.add(DR.arm);
  DR.hand = new THREE.Group(); trans.add(DR.hand);
  const hnd = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), skinM); DR.hand.add(hnd);
  DR.thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.08, 4, 6), skinM); DR.thumb.position.set(0, 0.1, 0); DR.hand.add(DR.thumb); DR.thumb.visible = false;
  drv.traverse(o => { if (o.isMesh) o.castShadow = true; }); DR.arm.castShadow = true; }
// spray can "NEW CAR SMELL"
const canT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#ec407a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(0, 30, w, 8); c.fillRect(0, h - 38, w, 8);
  c.font = '900 64px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NEW CAR', w / 2, 100); c.fillText('SMELL', w / 2, 168);
  c.fillStyle = '#ffeb3b'; for (const [x, y] of [[340, 70], [690, 190], [670, 60]]) { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 22, a = i * PI / 5 - PI / 2; c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } c.fill(); } });
const can = new THREE.Group(); trans.add(can);
{ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.56, 24), new THREE.MeshStandardMaterial({ map: canT, roughness: 0.35, metalness: 0.2 })); can.add(b);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.1, 24), STD('#cfd8dc', { metalness: 0.8, roughness: 0.25 })); top.position.y = 0.33; can.add(top);
  const noz = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.1), STD('#fff')); noz.position.set(0, 0.42, 0); can.add(noz);
  can.traverse(o => { if (o.isMesh) o.castShadow = true; }); can.visible = false; }

// ---------------- hero ----------------
const hero = makeCar(RED_CAR);
const heroBodyM = hero.userData.body;
// items on the roof: crisps, sock, sandwich
function sprTex(col) { return canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, col); g.addColorStop(0.6, col.replace('1)', '0.55)')); g.addColorStop(1, col.replace('1)', '0)')); c.fillStyle = g; c.fillRect(0, 0, w, h); }); }
const crispT = canvasTex(256, 320, (c, w, h) => { c.fillStyle = '#fbc02d'; c.fillRect(0, 0, w, h); c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, 50); c.fillRect(0, h - 50, w, 50);
  c.fillStyle = '#fff'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.translate(w / 2, h / 2); c.rotate(-0.15); c.fillText('CRISPS', 0, -10); c.restore();
  c.fillStyle = '#795548'; c.font = '800 30px Inter'; c.fillText('best before 2019', w / 2, h / 2 + 70); });
const items = new THREE.Group(); hero.userData.bodyG.add(items);
const crisps = new THREE.Group(); items.add(crisps);
{ const bag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.1), [L('#fbc02d'), L('#fbc02d'), L('#d32f2f'), L('#d32f2f'), new THREE.MeshLambertMaterial({ map: crispT }), new THREE.MeshLambertMaterial({ map: crispT })]); bag.scale.set(1, 1, 1); crisps.add(bag);
  for (let i = 0; i < 4; i++) { const cr = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), new THREE.MeshLambertMaterial({ color: '#ffe082', side: THREE.DoubleSide })); cr.position.set(-0.15 + i * 0.1, 0.32 + (i % 2) * 0.05, 0.02); cr.rotation.set(0.5 * i, i, 0); crisps.add(cr); } }
const sock = new THREE.Group(); items.add(sock);
{ const sockT = canvasTex(64, 128, (c, w, h) => { for (let y = 0; y < h; y += 16) { c.fillStyle = (y / 16) % 2 ? '#e8eaf6' : '#7e57c2'; c.fillRect(0, y, w, 16); } c.fillStyle = '#8d6e63'; c.beginPath(); c.arc(40, 100, 9, 0, 7); c.fill(); }, true);
  const sm = new THREE.MeshLambertMaterial({ map: sockT });
  const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.42, 6, 12), sm); leg.position.y = 0.1; sock.add(leg);
  const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.22, 6, 12), sm); foot.rotation.z = PI / 2; foot.position.set(0.14, -0.22, 0); sock.add(foot);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), STD('#f0c39d')); hole.position.set(0.3, -0.2, 0.1); sock.add(hole); }
const sandw = new THREE.Group(); items.add(sandw);
const breadM = STD('#c7a26b', { roughness: 0.9 }), lettM = STD('#7cb342'), mouldM = STD('#6b8e23', { roughness: 0.95 });
{ const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.42), breadM); b1.position.y = -0.08; sandw.add(b1);
  const b2 = b1.clone(); b2.position.y = 0.09; b2.rotation.z = 0.12; sandw.add(b2);
  const le = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.46), lettM); le.rotation.y = 0.2; sandw.add(le);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.44), STD('#ffca28')); ch.position.y = 0.035; ch.rotation.y = -0.3; sandw.add(ch);
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mouldM); m.scale.y = 0.4; m.position.set((hash(i) - 0.5) * 0.36, 0.14 + 0.02 * (i % 2), (hash(i + 5) - 0.5) * 0.34); sandw.add(m); } }
const flies = Array.from({ length: 5 }, () => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), STD('#111')); items.add(f); return f; });
items.traverse(o => { if (o.isMesh) o.castShadow = true; });
// stink lines + cloud (sprites)
const stinkT = sprTex('rgba(150,200,60,1)');
const stinkM = new THREE.SpriteMaterial({ map: stinkT, transparent: true, depthWrite: false, opacity: 0.6, toneMapped: false });
const STK = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(stinkM.clone()); s.visible = false; scene.add(s); return s; });
const wavyT = canvasTex(64, 192, (c, w, h) => { c.strokeStyle = '#8bc34a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); for (let y = 10; y < h - 10; y += 2) c.lineTo(32 + 14 * Math.sin(y / 18), h - y); c.stroke(); });
const wavy = Array.from({ length: 6 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: wavyT, transparent: true, depthWrite: false, toneMapped: false })); s.scale.set(0.22, 0.66, 1); s.visible = false; hero.userData.bodyG.add(s); return s; });
// sparkles
const starT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 12 : 62, a = i * PI / 4; c.lineTo(64 + r * Math.cos(a), 64 + r * Math.sin(a)); } c.fill(); const g = c.createRadialGradient(64, 64, 2, 64, 64, 30); g.addColorStop(0, 'rgba(255,255,220,1)'); g.addColorStop(1, 'rgba(255,255,220,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const sparks = Array.from({ length: 26 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starT, transparent: true, depthWrite: false, toneMapped: false, color: i % 3 ? '#fff9c4' : '#ffffff' })); s.visible = false; scene.add(s); return s; });
const mistT = sprTex('rgba(255,182,214,1)');
const mist = Array.from({ length: 16 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistT, transparent: true, depthWrite: false, opacity: 0.6, toneMapped: false })); s.visible = false; scene.add(s); return s; });

// ---------------- showroom (x = 3000) ----------------
const showCars = [];
const turntable = new THREE.Group(); turntable.position.set(X0, 0, 0); scene.add(turntable);
const bow = new THREE.Group();
{ const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), STD('#eef0f2', { roughness: 0.18, metalness: 0.1 })); fl.rotation.x = -PI / 2; fl.position.set(X0, 0.02, 0); fl.receiveShadow = true; scene.add(fl);
  const tile = []; for (let x = -20; x <= 20; x += 2.5) tile.push([X0 + x, 0.03, 0, 0, 1, 1, 1]); instanced(new THREE.BoxGeometry(0.03, 0.005, 40), L('#d5d9dd'), tile, false);
  // back wall with windows + sign
  const wallT = canvasTex(1024, 512, (c, w, h) => { c.fillStyle = '#f5f5f5'; c.fillRect(0, 0, w, h); c.fillStyle = '#9cc9e6'; for (let i = 0; i < 4; i++) c.fillRect(30 + i * 250, 150, 220, 330); c.fillStyle = '#b8daef'; for (let i = 0; i < 4; i++) c.fillRect(30 + i * 250, 150, 220, 40); });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(44, 12, 0.5), [L('#eee'), L('#eee'), L('#ddd'), L('#ddd'), new THREE.MeshLambertMaterial({ map: wallT }), L('#eee')]); wall.position.set(X0, 6, -12); wall.receiveShadow = true; scene.add(wall);
  const signT = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 118px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CAR SHOWROOM', w / 2, h / 2 + 6); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.35), new THREE.MeshLambertMaterial({ map: signT, emissive: '#ffffff', emissiveIntensity: 0.15, emissiveMap: signT })); sg.position.set(X0, 7.6, -11.7); scene.add(sg);
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.5, 12, 30), L('#eeeeee')); side.position.set(X0 - 18, 6, 3); side.receiveShadow = true; scene.add(side);
  // turntable
  const tt = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.24, 48), STD('#37474f', { roughness: 0.3, metalness: 0.5 })); tt.position.y = 0.12; tt.receiveShadow = true; tt.castShadow = true; turntable.add(tt);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.05, 6, 64), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })); ring.rotation.x = PI / 2; ring.position.y = 0.2; turntable.add(ring);
  // the other seven red cars, in a row behind
  for (let i = 0; i < 7; i++) { const c = makeCar(RED_CAR); placeCar(c, { x: X0 - 12 + i * 4.0, y: 0, z: -7.2, h: 0.35 }); showCars.push(c); }
  // ceiling lamps (discs high up, only visible on looks up) – plus a soft key light
  const pl = new THREE.PointLight('#fff4e0', 60, 30, 1.6); pl.position.set(X0 + 2, 7, 4); scene.add(pl); }
// bow on the roof
{ const rib = STD('#e53935', { roughness: 0.35, metalness: 0.15, emissive: '#5a0000', emissiveIntensity: 0.3 });
  const rib2 = STD('#ff5252', { roughness: 0.3 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 4.5), rib2); b1.position.y = -0.02; bow.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.22), rib2); b2.position.y = -0.02; bow.add(b2);
  for (const s of [-1, 1]) { const lp = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.12, 10, 24), rib); lp.position.set(s * 0.4, 0.36, 0); lp.rotation.set(0, 0, s * 0.45); lp.scale.set(1.1, 0.9, 0.7); bow.add(lp);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.75), rib2); tl.position.set(s * 0.28, 0.06, 0.4); tl.rotation.y = s * 0.5; bow.add(tl); }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), rib); knot.position.y = 0.2; bow.add(knot);
  bow.traverse(o => { if (o.isMesh) o.castShadow = true; }); bow.position.set(0, 1.62, 0.06); bow.visible = false; hero.userData.bodyG.add(bow); }
// price sign
const saleT = canvasTex(512, 640, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e11d2e'; c.fillRect(0, 0, w, 210);
  c.fillStyle = '#fff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SALE', w / 2, 112);
  c.fillStyle = '#e11d2e'; c.font = '900 190px Inter'; c.fillText('-50%', w / 2, 360); c.fillStyle = '#222'; c.font = '800 58px Inter'; c.fillText('slightly used', w / 2, 540); });
const saleG = new THREE.Group(); saleG.position.set(X0 + 3.2, 0, 3.1); saleG.rotation.y = 0.75; scene.add(saleG);
{ const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), STD('#90a4ae', { metalness: 0.8 })); pole.position.y = 0.8; saleG.add(pole);
  const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.06, 20), STD('#90a4ae', { metalness: 0.8 })); ft.position.y = 0.03; saleG.add(ft);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.62), new THREE.MeshLambertMaterial({ map: saleT, emissive: '#ffffff', emissiveIntensity: 0.12, emissiveMap: saleT })); card.position.y = 2.2; saleG.add(card);
  saleG.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- motion ----------------
// convoy frame: transporter at (XT, 0, -D), hero at (XH, y, HZ) – all relative to CZ(t)
const D_W = mono([[0, 0], [tFaster - 0.05, 0], [tSwerves + 0.2, 12], [99, 12]]);
const SW0 = tSwerves + 0.05, SW1 = tSwerves + 0.75;
const XT_W = mono([[0, 1.9], [SW0, 1.9], [SW1, -1.9], [99, -1.9]]);
const HZ_W = mono([[0, 31], [tRamp - 0.6, 28.6], [tOver + 0.1, 28.6], [tPast + 0.9, 19.5], [tFaster - 0.05, 19.0], [tSwerves + 0.2, 18.8]]);
const XH_W = mono([[0, 1.9], [tOver, 1.9], [tOver + 0.85, -1.9], [99, -1.9]]);
const R0 = tSwerves + 0.2;
const REL_W = mono([[R0, HZ_W(R0) + D_W(R0)], [SW1 + 0.1, 29.6], [tUp - 0.5, 25.5], [tUp + 0.5, 19.0], [tTop - 0.15, 16.8], [99, 16.8]]);
const HZ_R = mono([[0, 30.5], [tStay, 30], [tFeels + 0.1, 30], [tGrabs - 0.2, -1.6], [99, -1.6]]);
const XH_R = mono([[0, 1.9], [tFeels + 0.15, 1.9], [tFeels + 1.0, -1.9], [99, -1.9]]);
const rampU = t => isRight(t) ? 1 - ramp(t, tRampUp - 0.05, tFast + 0.05) : ramp(t, tRamp - 0.15, tRight) * (1 - ramp(t, tTop + 0.05, tTop + 0.6));
const ER = TZ1 + RLEN * Math.cos(TH_D);          // ramp end, rel z (~25.5)
function transPose(t) { if (isRight(t)) return { x: 1.9, z: CZ(t) }; return { x: XT_W(t), z: CZ(t) - D_W(t) }; }
function heroPose(t) {
  if (isRight(t)) return { x: XH_R(t), y: 0, z: CZ(t) + HZ_R(t), h: 0, pitch: 0, roll: 0 };
  if (t >= T_SHOW) { const a = 0.55 * (t - T_SHOW) - 0.4; return { x: X0, y: 0.24, z: 0, h: a, pitch: 0, roll: 0 }; }
  if (t < R0) return { x: XH_W(t), y: 0, z: CZ(t) + HZ_W(t), h: 0, pitch: 0, roll: 0 };
  const tp = transPose(t), r = REL_W(t);
  let y = 0, pitch = 0;
  if (r < ER && r > TZ1) { y = DK2 * (ER - r) / (ER - TZ1); }
  else if (r <= TZ1) y = DK2;
  pitch = TH_D * ramp(r, ER + 0.6, ER - 0.6) * (1 - ramp(r, TZ1 + 0.6, TZ1 - 0.6));
  return { x: XH_W(t), y, z: tp.z + r, h: 0, pitch, roll: 0 };
}
// driver arm target (trans-local)
const SH = V3(-0.82, 2.35, -2.05);
function handPose(t) {
  const right = isRight(t); const rest = V3(-0.42, 2.25, -2.68);
  if (!right && t < tRew0) {
    const k = win(t, tWaves - 0.35, tWhat + 0.2, 0.3); if (k <= 0) return { p: rest, k: 0 };
    const out = V3(-1.75, 2.95, -2.0 + 0.3 * Math.sin((t - tWaves) * 9)); return { p: rest.clone().lerp(out, k), k };
  }
  if (!right) return { p: rest, k: 0 };
  const pinch = win(t, tDrv - 0.1, tRampUp + 0.3, 0.3), out = win(t, tGrabs - 0.2, TOTAL + 1, 0.4);
  let p = rest.clone().lerp(V3(-0.55, 2.58, -2.4), pinch);
  if (out > 0) { const thumb = t > tDay + 0.3; const hp = thumb ? V3(-1.75, 2.85, -2.1) : V3(-1.8, 2.4, -2.0); p = p.lerp(hp, out); }
  return { p, k: out };
}
// stink cloud path (convoy frame) A -> B
const SA = V3(0.85, 1.4, 29.6), SB = V3(0.2, 2.9, -1.4);

// ---------------- camera ----------------
const Cv = (p, l, fov = 40) => t => { const z = CZ(t); return [V3(p[0], p[1], p[2] + z), V3(l[0], l[1], l[2] + z), fov]; };
const Ct = (p, l, fov = 40) => t => { const tp = transPose(t); return [V3(p[0] + tp.x, p[1], p[2] + tp.z), V3(l[0] + tp.x, l[1], l[2] + tp.z), fov]; };
const Ch = (p, l, fov = 40) => t => { const h = heroPose(t); return [V3(p[0] + h.x, p[1] + h.y, p[2] + h.z), V3(l[0] + h.x, l[1] + h.y, l[2] + h.z), fov]; };
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const camKeys = [
  [0.0, Cv([-6.5, 9.5, 56], [1.5, 1.0, 12], 40)],
  [tTrans - 0.3, Cv([-5.5, 8.5, 50], [1.5, 1.2, 12], 40)],
  ...cut(tTrans - 0.25, Cv([-4.8, 6.6, 27], [1.9, 2.0, 7], 42)),
  [tExactly - 0.3, Cv([-4.2, 7.4, 23.5], [1.9, 2.4, 7.5], 42)],
  ...cut(tExactly - 0.25, Cv([2.9, 3.4, 41.5], [1.9, 2.0, 14], 40)),
  [S('hook1').end + 0.2, Cv([2.8, 3.5, 40.5], [1.9, 2.0, 14], 40)],
  ...cut(S('hook2').start - 0.15, Cv([-3.4, 4.2, 37.5], [1.9, 1.2, 23], 40)),
  [tBumper - 0.35, Cv([-3.2, 4.0, 36.5], [1.9, 1.0, 24], 40)],
  ...cut(tBumper - 0.3, Cv([4.8, 2.3, 20.2], [2.0, 0.6, 27.0], 40)),
  [tDriver - 0.3, Cv([4.8, 2.35, 19.8], [2.0, 0.6, 27.0], 40)],
  ...cut(tDriver - 0.25, Cv([-2.4, 3.2, -6.0], [0.8, 2.7, -1.9], 40)),
  [tWhat - 0.3, Cv([-2.6, 3.3, -6.3], [0.8, 2.7, -1.9], 40)],
  ...cut(tWhat - 0.25, Cv([-1.0, 8.0, 50], [1.9, 1.4, 16], 40)),
  [W1 - 0.2, Cv([-1.0, 8.3, 51], [1.9, 1.4, 16], 40)],
  // wrong
  ...cut(W1 - 0.15, Ch([-1.4, 3.3, 8.8], [0, 1.2, -10], 40)),
  [tFull - 0.35, Ch([-1.4, 3.3, 8.8], [0, 1.2, -10], 40)],
  ...cut(tFull - 0.3, Ch([-2.7, 2.3, 4.2], [1.4, 1.2, -6], 40)),
  [S('wrong1').end + 0.2, Ch([-2.7, 2.4, 3.8], [1.4, 1.2, -6], 40)],
  ...cut(S('wrong2').start - 0.15, Cv([-6.5, 9.0, 41], [-0.6, 1.6, 12], 42)),
  [tUp - 0.85, Cv([-6.5, 9.0, 40], [-0.6, 1.6, 13], 42)],
  ...cut(tUp - 0.8, Ct([-8.8, 4.4, 27.5], [-0.3, 1.8, 19.5], 40)),
  [tTop - 0.4, Ct([-8.6, 4.8, 26], [-0.2, 2.4, 18], 40)],
  ...cut(tTop - 0.35, Ct([-5.2, 7.0, 25.5], [0, 3.0, 14], 40)),
  [T_SHOW - 0.05, Ct([-5.0, 7.4, 25], [0, 3.0, 13], 40)],
  // showroom
  ...cut(T_SHOW, Ac([X0 + 2.4, 3.3, 12.5], [X0 + 1.0, 2.9, -4], 40)),
  [tTurn - 0.3, Ac([X0 + 2.3, 3.2, 11.8], [X0 + 1.0, 2.8, -4], 40)],
  ...cut(tTurn - 0.25, Ac([X0 + 5.8, 3.0, 7.8], [X0, 0.7, 0], 40)),
  [tBow - 0.4, Ac([X0 + 5.5, 3.0, 7.4], [X0, 0.8, 0], 40)],
  ...cut(tBow - 0.35, Ac([X0 + 4.4, 4.4, 6.2], [X0, 1.4, 0], 40)),
  [tSale - 0.35, Ac([X0 + 4.2, 4.5, 6.0], [X0, 1.4, 0], 40)],
  ...cut(tSale - 0.3, Ac([X0 + 6.2, 3.4, 11.0], [X0 + 0.9, 1.5, 0.6], 40)),
  [tRew0, Ac([X0 + 5.9, 3.4, 10.5], [X0 + 0.9, 1.5, 0.6], 40)],
  // right
  ...cut(tRew1, Cv([-2.4, 5.2, 45], [1.9, 1.4, 18], 40)),
  [tWindow - 0.3, Cv([-2.4, 5.0, 44], [1.9, 1.4, 18], 40)],
  ...cut(tWindow - 0.25, Ch([-4.6, 2.3, -5.2], [0, 1.1, 0.4], 40)),
  [tShowH - 0.3, Ch([-4.7, 2.35, -5.4], [0, 1.1, 0.4], 40)],
  ...cut(tShowH - 0.25, Ch([-2.4, 3.9, 6.2], [0.1, 2.0, -3.5], 40)),
  [S('right2').end + 0.25, Ch([-2.3, 3.8, 5.8], [0.1, 2.0, -3.5], 40)],
  ...cut(S('right3').start - 0.1, Ch([-0.7, 3.6, 5.0], [0.0, 2.6, -0.6], 40)),
  [S('right3').end + 0.25, Ch([-0.8, 3.65, 5.2], [0.0, 2.6, -0.6], 40)],
  ...cut(S('right4').start - 0.15, Cv([-4.2, 6.8, 45], [0.9, 1.8, 10], 40)),
  [tDrv - 0.35, Cv([-3.8, 6.4, 41], [0.9, 2.0, 6], 40)],
  ...cut(tDrv - 0.3, Cv([-3.0, 3.2, -6.6], [1.0, 2.7, -1.9], 40)),
  [tRampUp - 0.3, Cv([-3.2, 3.25, -6.9], [1.0, 2.7, -1.9], 40)],
  ...cut(tRampUp - 0.25, Cv([-3.6, 4.2, 38], [1.9, 1.7, 20], 40)),
  [S('right4').end + 0.25, Cv([-3.6, 4.4, 39], [1.9, 1.7, 20], 40)],
  ...cut(S('right5').start - 0.1, Ch([-3.6, 4.2, 8.8], [1.4, 1.3, -5], 40)),
  [tGrabs - 0.35, Ch([-3.6, 4.2, 8.8], [1.4, 1.3, -5], 40)],
  ...cut(tGrabs - 0.3, Cv([-5.6, 3.5, -11.5], [0.0, 1.9, -1.4], 40)),
  [S('right5').end + 0.25, Cv([-5.4, 3.5, -11.0], [0.0, 1.9, -1.4], 40)],
  ...cut(tNCS - 0.15, Cv([-2.0, 3.0, -6.3], [0.1, 2.45, -2.0], 40)),
  [tSpray - 0.3, Cv([-2.05, 3.0, -6.4], [0.1, 2.45, -2.0], 40)],
  ...cut(tSpray - 0.25, Cv([-4.0, 3.6, -8.0], [-0.8, 1.6, -1.6], 40)),
  [tSpark - 0.3, Cv([-4.1, 3.6, -8.2], [-0.8, 1.6, -1.6], 40)],
  ...cut(tSpark - 0.25, Cv([-6.8, 2.9, -13.5], [-1.4, 1.2, -1.2], 40)),
  [S('right6').end + 0.2, Cv([-7.2, 3.1, -14.5], [-1.4, 1.2, -1.2], 40)],
  ...cut(S('right7').start - 0.15, Cv([-8, 9, -21], [0, 1.2, 3], 42)),
  [TOTAL, Cv([-9, 12, -27], [0, 1.0, 5], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
const _A = new THREE.Vector3(), _B = new THREE.Vector3();
function update(t) {
  const right = isRight(t);
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.far = 3000; camera.updateProjectionMatrix();
  // transporter
  const tp = transPose(t); trans.position.set(tp.x, 0, tp.z);
  const sw = !right ? (ramp(t, SW0, (SW0 + SW1) / 2) - ramp(t, (SW0 + SW1) / 2, SW1)) : 0; trans.rotation.set(0, 0.07 * sw, 0);
  trans.userData.wheels.forEach(w => w.rotation.x = -(Z0 - tp.z) / 0.5);
  setRamp(rampU(t));
  // hero
  const hp = heroPose(t); placeCar(hero, hp);
  if (!right && t >= T_SHOW) { hero.userData.wheels.forEach(w => w.rotation.x = 0); hero.userData.bodyG.rotation.set(0, 0, 0); hero.userData.bodyG.position.y = 0; }
  turntable.rotation.y = !right && t > T_SHOW ? hp.h : 0;
  bow.visible = !right && t > tBow - 0.05; bow.scale.setScalar(Math.max(0.01, back((t - tBow + 0.05) / 0.4)));
  saleG.visible = !right && t > tSale - 0.1; saleG.scale.set(1, Math.max(0.01, back((t - tSale + 0.1) / 0.45)), 1);
  // oncoming
  oncoming.forEach((o, i) => { const zr = ((o.base + (V + 24) * t) % 420) - 260; placeCar(o.car, { x: o.x, y: 0, z: CZ(t) + zr, h: PI }); });
  // driver
  const hpos = handPose(t); DR.hand.position.copy(hpos.p);
  { const d = hpos.p.clone().sub(SH); DR.arm.position.copy(SH).addScaledVector(d, 0.5); DR.arm.scale.set(1, d.length(), 1); DR.arm.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); }
  const lean = right ? win(t, tGrabs - 0.2, TOTAL + 1, 0.4) : 0;
  drv.position.set(-0.55 - 0.18 * lean, 2.62, -2.05);
  let yaw = 0.5, pitch = 0;           // looks back-left (mirror) by default
  if (!right && t > tWaves - 0.4 && t < tWhat + 0.4) yaw = 1.1;
  if (right && t > tDrv - 0.2 && t < tRampUp + 0.2) { yaw = 0.7 + 0.25 * Math.sin((t - tDefin) * 14) * win(t, tDefin, tDefin + 1.1, 0.15); pitch = 0.1; }
  if (right && t > tGrabs - 0.3) yaw = 1.35;
  DR.head.rotation.set(pitch, yaw, 0);
  const g = right ? win(t, tDrv - 0.05, tFeels, 0.4) : 0;
  skinM.color.copy(skinC).lerp(greenC, g);
  DR.eyes.forEach(e => e.scale.set(1, right && t > tDrv && t < tRampUp + 0.4 ? 0.25 : 1, 1));
  DR.mouth.scale.set(1, right && t > tDefin && t < tRampUp ? 0.12 : 0.3, 0.4);
  DR.thumb.visible = right && t > tDay + 0.3; DR.thumb.rotation.z = 0;
  // can
  can.visible = right && t > tGrabs - 0.05;
  if (can.visible) { can.position.copy(hpos.p).add(V3(-0.05, 0.12, 0)); can.rotation.set(0, 0.5, t > tSpray - 0.1 ? 0.5 * win(t, tSpray - 0.1, tSpark, 0.15) : 0); if (t > tDay + 0.3) { can.position.set(-0.9, 2.15, -2.3); can.rotation.set(0, 0.5, 0); } can.scale.setScalar(back((t - tGrabs + 0.05) / 0.35)); }
  // roof items
  const itemK = (t0) => right ? clamp((t - t0) / 0.35) : 0;
  const fadeI = right ? 1 - ramp(t, tRampUp - 0.2, tFast) : 0;
  [[crisps, tCrisps, -0.5, 0], [sock, tSock, 0.0, 0.25], [sandw, tSandw, 0.5, 0]].forEach(([o, t0, x, ex], i) => { const k = itemK(t0 - 0.1); o.visible = k > 0 && fadeI > 0.01;
    o.position.set(x, 1.75 + 0.95 * easeOut(k) + 0.06 * Math.sin(t * 3 + i), 0.1 + ex * 0); o.scale.setScalar(Math.max(0.01, back(k) * fadeI)); o.rotation.set(0, -0.35 + 0.15 * Math.sin(t * 2 + i), i === 1 ? 0.15 * Math.sin(t * 5) : 0); });
  sandw.children.forEach((m, i) => { if (i > 3) m.visible = t > tNobody - 0.2; });
  flies.forEach((f, i) => { f.visible = sandw.visible && t > tSandw + 0.2; const a = t * (5 + i) + i * 2; f.position.set(0.5 + 0.32 * Math.cos(a), 2.85 + 0.12 * Math.sin(a * 1.7), 0.1 + 0.3 * Math.sin(a)); });
  wavy.forEach((s, i) => { const t0 = [tCrisps, tSock, tSandw][i % 3] + 0.2; s.visible = right && t > t0 && fadeI > 0.05; const x = [-0.5, 0.0, 0.5][i % 3] + (i > 2 ? 0.14 : -0.1);
    s.position.set(x, 3.3 + 0.15 * Math.sin(t * 4 + i), 0.1); s.material.opacity = 0.85 * fadeI * (0.6 + 0.4 * Math.sin(t * 6 + i)); });
  // stink cloud: puffs from the window -> along the trailer -> around the driver
  STK.forEach((s, k) => { s.visible = false; if (!right) return; const t0 = tSmell - 0.15 + k * 0.035, t1 = t0 + 1.3; if (t < t0 || t > tRampUp + 0.4) return;
    const u = ease(clamp((t - t0) / (t1 - t0))); const P = SA.clone().lerp(SB, u); P.y += 0.6 * Math.sin(u * PI) + 0.2 * Math.sin(k * 2.1 + t * 3); P.x += -0.75 * Math.sin(u * PI) + 0.2 * Math.sin(k * 1.3 + t * 2);
    if (u >= 1) { const a = k * 2.4 + t * 1.5; P.add(V3(-0.3 + 0.6 * Math.cos(a), 0.4 * Math.sin(a * 1.3), 0.9 * Math.sin(a))); }
    s.visible = true; s.position.set(P.x, P.y, P.z + CZ(t));
    const sc = 0.7 + 0.5 * hash(k) + 0.3 * u; s.scale.set(sc, sc, 1); s.material.opacity = (u >= 1 ? 0.3 : 0.62) * (1 - ramp(t, tRampUp - 0.3, tRampUp + 0.4)); });
  // spray mist + sparkles
  mist.forEach((s, k) => { s.visible = false; if (!right) return; const t0 = tSpray - 0.05 + k * 0.03; if (t < t0 || t > t0 + 1.0) return; const u = (t - t0) / 1.0;
    const from = V3(0.05, 2.85, -2.05 + CZ(t)); const to = V3(-1.9 + (hash(k) - 0.5) * 1.6, 1.0 + hash(k + 3) * 0.9, -1.6 + (hash(k + 7) - 0.5) * 3.5 + CZ(t));
    s.visible = true; s.position.copy(from).lerp(to, easeOut(u)); const sc = 0.3 + 1.0 * u; s.scale.set(sc, sc, 1); s.material.opacity = 0.65 * (1 - u); });
  sparks.forEach((s, k) => { s.visible = false; if (!right || t < tSpark - 0.25) return; const ph = hash(k * 3) * 1.4, cyc = ((t - tSpark + ph) % 1.4) / 1.4;
    s.visible = true; s.position.set(hp.x + (hash(k) - 0.5) * 2.3, 0.4 + hash(k + 11) * 1.6, hp.z + (hash(k + 5) - 0.5) * 4.8);
    const sc = 0.55 * Math.sin(PI * cyc) * (0.6 + 0.6 * hash(k + 2)) * Math.min(1, (t - tSpark + 0.25) / 0.4); s.scale.set(sc, sc, 1); s.material.rotation = t * 1.5 + k; });
  const shine = right ? ramp(t, tSpark - 0.25, tSpark + 0.2) : 0;
  heroBodyM.emissive.set('#ff3030'); heroBodyM.emissiveIntensity = shine * (0.12 + 0.25 * Math.max(0, 1 - Math.abs(t - tSpark - 0.1) / 0.5)); heroBodyM.roughness = lerp(0.22, 0.08, shine); heroBodyM.envMapIntensity = lerp(1.3, 2.4, shine);
  applyCam(c, t, (!right && t > tTop - 0.1 && t < tTop + 0.25) ? 0.05 : 0);
  camera.updateMatrixWorld(true);
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const PURP = '#6a1b9a';
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('MOTORWAY', BLUE, tMotor - 0.1, tTrans - 0.2, 56);
    P_('CAR TRANSPORTER', BLUE, tTrans - 0.15, tSeven - 0.1, 54);
    P_('7 RED CARS…', PURP, tSeven - 0.05, tExactly - 0.1, 56);
    P_('EXACTLY LIKE YOURS', PURP, tExactly - 0.05, S('hook1').end + 0.25, 52, iconWarn);
    P_('THE RAMP COMES DOWN', RED, tRamp - 0.1, tDriver - 0.15, 50, iconWarn);
    P_('HE WAVES YOU ON', RED, tWaves - 0.2, S('hook2').end + 0.4, 54, iconWarn);
    P_('OVERTAKE!', RED, tOver - 0.1, tFull - 0.1, 60, iconX);
    P_('FULL THROTTLE', RED, tFull - 0.05, S('wrong1').end + 0.3, 58, iconX);
    P_('IT SWERVES IN', RED, tSwerves - 0.1, tUp - 0.15, 56, iconX);
    P_('UP TO THE TOP DECK', RED, tUp - 0.1, S('wrong2').end + 0.3, 52, iconX);
    P_('CAR SHOWROOM', PURP, tShow - 0.2, tTurn - 0.1, 56, iconWarn);
    P_('ON A TURNTABLE', RED, tTurn - 0.05, tBow - 0.1, 56, iconX);
    P_('WITH A GIANT BOW', RED, tBow - 0.05, tSale - 0.15, 54, iconX);
    P_('ON SALE: HALF PRICE', RED, tSale - 0.1, tRew0, 50, iconX);
  } else {
    P_('STAY BEHIND IT', GREEN, tStay - 0.1, tWindow - 0.1, 58, iconCheck);
    P_('WINDOW DOWN', GREEN, tWindow - 0.05, tShowH - 0.1, 58, iconCheck);
    P_("SHOW: IT'S NOT NEW", GREEN, tShowH - 0.05, S('right2').end + 0.3, 52, iconCheck);
    const lab = (txt, k, t0) => { const sc = Math.min(1, back((t - t0) / 0.3)); if (t < t0 || t > S('right3').end + 0.3) return; ctx.save(); ctx.globalAlpha = win(t, t0, S('right3').end + 0.3, 0.2); pill(txt, W / 2, 430 + k * 92, ['#f9a825', '#7e57c2', '#689f38'][k], '#fff', 44, 1, sc); ctx.restore(); };
    lab('OLD CRISPS', 0, tCrisps - 0.05); lab('A SOCK (LAST WEEK)', 1, tSock - 0.05); lab('SANDWICH (FROM… ???)', 2, tSandw - 0.05);
    P_('THE SMELL…', '#689f38', tSmell - 0.15, tDefin - 0.15, 58, iconWarn);
    P_('DEFINITELY NOT NEW', '#689f38', tDefin - 0.1, tRampUp - 0.1, 54, iconCheck);
    floatText('RAMP UP!', W / 2, 720, t, tRampUp - 0.05, S('right4').end + 0.3, 130, YEL, -0.06);
    P_('HE FEELS SORRY FOR YOU', GREEN, tFeels - 0.1, tGrabs - 0.1, 48, iconHeart);
    P_('A GIFT FROM THE DELIVERY', GREEN, tGrabs - 0.05, S('right5').end + 0.3, 46, iconHeart);
    P_('NEW CAR SMELL', '#ec407a', tNCS - 0.1, tSpark - 0.15, 60, iconHeart);
    floatText('PSSSHT!', W / 2 + 120, 700, t, tSpray - 0.05, tSpray + 0.9, 110, '#fff', 0.08);
    P_('LIKE ON DAY ONE', '#ec407a', tSpark - 0.1, S('right6').end + 0.4, 56, iconHeart);
  }
}
window.dbg = { hero, heroPose, cam, trans };
start(update, hud);
