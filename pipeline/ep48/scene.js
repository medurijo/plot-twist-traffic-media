// Episode 43: Level crossing – the train is a caterpillar
// hook (old style): level crossing, barrier down, lights flashing, here comes the train -> it's not a train, it's a caterpillar. Very, very long.
// wrong: lift the barrier (stretchy arm) and drive under its belly -> caterpillars are ticklish, a hundred little legs giggle ->
//        it curls up into a ball with you in the middle (the car is the axle) and rolls away down the track. Next stop: who knows?
// right: engine off, open the boot, hand it your picnic blanket -> it wraps itself up: a checkered cocoon on the tracks ->
//        five seconds later: pop, a giant butterfly -> one flap of its wings, the barrier flies open, your car is covered in rainbow glitter
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tLevel = WT('hook1', 'Level'), tBarrierH = WT('hook1', 'Barrier'), tLights = WT('hook1', 'Lights'), tHere = WT('hook1', 'Here'), tTrain = WT('hook1', 'train');
const tBut = WT('hook2', 'But'), tIts = WT('hook2', "It's", 1), tCat = WT('hook2', 'caterpillar'), tAndH = WT('hook2', 'And'), tVery = WT('hook2', 'very'), tLong = WT('hook2', 'long'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tImp = WT('wrong1', 'impatient'), tLift = WT('wrong1', 'lift'), tBarrierW = WT('wrong1', 'barrier'), tDrive = WT('wrong1', 'drive', 1), tUnder = WT('wrong1', 'under'), tBelly = WT('wrong1', 'belly');
const tBig = WT('wrong2', 'Big'), tCats = WT('wrong2', 'Caterpillars'), tTick = WT('wrong2', 'ticklish'), tHund = WT('wrong2', 'hundred'), tLegs = WT('wrong2', 'legs'), tGigg = WT('wrong2', 'giggling');
const tCurls = WT('wrong3', 'curls'), tBall = WT('wrong3', 'ball'), tWith = WT('wrong3', 'With'), tMiddle = WT('wrong3', 'middle'), tRolls = WT('wrong3', 'rolls'), tAway = WT('wrong3', 'away'), tNext = WT('wrong3', 'Next'), tWho = WT('wrong3', 'who');
const tEngine = WT('right2', 'Engine'), tOpen = WT('right2', 'Open'), tBoot = WT('right2', 'boot'), tHand = WT('right2', 'hand'), tPicnic = WT('right2', 'picnic'), tBlanket = WT('right2', 'blanket');
const tWraps = WT('right3', 'wraps'), tUp3 = WT('right3', 'up'), tSnug = WT('right3', 'Snug'), tBug = WT('right3', 'bug'), tOne3 = WT('right3', 'One'), tCocoon = WT('right3', 'cocoon'), tTracks = WT('right3', 'tracks');
const tFive = WT('right4', 'Five'), tLater = WT('right4', 'later'), tPop = WT('right4', 'Pop'), tGiant4 = WT('right4', 'giant'), tButter = WT('right4', 'butterfly');
const tOne5 = WT('right5', 'One'), tFlap = WT('right5', 'flap'), tWings = WT('right5', 'wings'), tBarr5 = WT('right5', 'barrier'), tFlies = WT('right5', 'flies'), tAnd5 = WT('right5', 'And', 1), tCar5 = WT('right5', 'car'), tCovered = WT('right5', 'Covered'), tRainbow = WT('right5', 'rainbow'), tGlitter = WT('right5', 'glitter');
const tTrack6 = WT('right6', 'Track'), tClear = WT('right6', 'clear'), tPrettiest = WT('right6', 'Prettiest'), tTown = WT('right6', 'town');
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

// ---------------- world: country road + railway ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 8 || Math.abs(z) < 7 || (x > -25 && x < 45 && z > -20 && z < 30), fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 10 || Math.abs(z) - d / 2 < 9, near: [0, 0, 160, 160], trees: 1300, seed: 431 });
plane(-3.5, 3.5, -400, 400, asphaltMat, 0.05, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -300; z < 300; z += 7) if (Math.abs(z) > 9) dl.push([0, 0.07, z]); instanced(g, markMat, dl, false);
  const sl = new THREE.PlaneGeometry(3.3, 0.4); sl.rotateX(-Math.PI / 2); instanced(sl, markMat, [[1.75, 0.07, 7.4], [-1.75, 0.07, -7.4]], false); }
// ballast, sleepers, rails, crossing panel
plane(-400, 400, -2.3, 2.3, L('#9a8f84', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let k = 0; k < 5000; k++) { const v = 150 + Math.random() * 100 | 0; c.fillStyle = `rgb(${v},${v - 6},${v - 12})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, true) }), 0.06, 4);
{ const sl = []; for (let x = -390; x < 390; x += 0.75) if (Math.abs(x) > 3.6) sl.push([x, 0.12, 0]); instanced(new THREE.BoxGeometry(0.28, 0.14, 2.6), L('#6d5a48'), sl, false);
  for (const z of [-0.75, 0.75]) { const r = new THREE.Mesh(new THREE.BoxGeometry(800, 0.16, 0.12), STD('#9ea7ad', { metalness: 0.8, roughness: 0.35 })); r.position.set(0, 0.24, z); r.receiveShadow = true; scene.add(r); }
  const pn = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 4.4), L('#55585e', { map: asphaltMat.map })); pn.position.set(0, 0.1, 0); pn.receiveShadow = true; scene.add(pn); }
// barriers + crossbucks + flashing lamps
const BAR = [];
const lamps = [];
{ const armT = canvasTex(512, 32, (c, w, h) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#e53935' : '#fafafa'; c.fillRect(k * 64, 0, 64, h); } });
  const crossT = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d50000'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14); });
  for (const [px, pz, dir] of [[4.6, 5.9, 1], [-4.6, -5.9, -1]]) {
    const g = new THREE.Group(); g.position.set(px, 0, pz); scene.add(g);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.6, 10), STD('#eceff1', { metalness: 0.4 })); post.position.y = 1.8; g.add(post);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.5), STD('#fafafa', { roughness: 0.5 })); box.position.y = 0.45; g.add(box);
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.04), new THREE.MeshStandardMaterial({ map: crossT, roughness: 0.5 })); b.position.set(0, 3.4, 0.12 * dir); b.rotation.z = s * 0.6; if (dir < 0) b.rotation.y = Math.PI; g.add(b); }
    const lb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 0.2), STD('#111')); lb.position.set(0, 2.55, 0.12 * dir); g.add(lb);
    for (const s of [-1, 1]) { const m = new THREE.MeshStandardMaterial({ color: '#400', emissive: '#ff0000', emissiveIntensity: 0, toneMapped: false }); const l = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), m); l.position.set(s * 0.3, 2.55, 0.23 * dir); if (dir < 0) l.rotation.y = Math.PI; g.add(l); lamps.push({ m, s }); }
    const piv = new THREE.Group(); piv.position.set(0, 1.05, 0.3 * dir); g.add(piv);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.16, 0.1), new THREE.MeshStandardMaterial({ map: armT, roughness: 0.45 })); arm.position.x = -dir * 3.4; piv.add(arm);
    const cw = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.2), STD('#37474f')); cw.position.x = dir * 0.45; piv.add(cw);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); BAR.push({ piv, dir }); } }

// ---------------- hero car + stretchy arm + blanket + glitter ----------------
const hero = makeCar('#1e88e5');
const bodyMat0 = hero.userData.body;
const rainT = canvasTex(512, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); ['#ff4d6d', '#ff9f1c', '#ffe66d', '#4cd964', '#2ec4f1', '#7b5cff', '#ff4dd2', '#ff4d6d'].forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col)); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 220; k++) { c.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`; const x = Math.random() * w, y = Math.random() * h, r = 1 + Math.random() * 2.5; c.fillRect(x - r / 2, y - r / 2, r, r); } }, true);
rainT.repeat.set(0.28, 0.6);
const rainMat = new THREE.MeshStandardMaterial({ map: rainT, roughness: 0.18, metalness: 0.55, envMapIntensity: 1.5, emissive: '#ffffff', emissiveMap: rainT, emissiveIntensity: 0.18 });
const lid = new THREE.Group(); hero.userData.bodyG.add(lid); lid.position.set(0, 1.0, 1.32);
{ const m = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.06, 0.86), bodyMat0); m.position.z = 0.43; m.castShadow = true; lid.add(m); lid.userData.m = m; }
const stretch = new THREE.Group(); scene.add(stretch);
{ const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 10), STD('#ff7043')); sl.position.y = 0.5; stretch.add(sl); stretch.userData.sl = sl;
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), STD('#f1c27d')); hd.position.y = 1.0; stretch.add(hd); stretch.userData.hd = hd; stretch.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const checkT = (rep) => { const t = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(211,47,47,0.9)'; for (let k = 0; k < 8; k++) { c.fillRect(k * 32, 0, 16, h); c.fillRect(0, k * 32, w, 16); } c.fillStyle = 'rgba(160,20,20,0.6)'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) c.fillRect(i * 32, j * 32, 16, 16); }, true); t.repeat.set(rep, rep); return t; };
const blanket = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0, 16, 12), STD('#fff', { map: checkT(1.5), side: THREE.DoubleSide, roughness: 0.8 })); blanket.castShadow = true; scene.add(blanket);
const blP0 = blanket.geometry.attributes.position.array.slice();
const NSP = 90; const spark = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.09, 0), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), NSP); spark.frustumCulled = false; scene.add(spark);
{ for (let i = 0; i < NSP; i++) spark.setColorAt(i, new THREE.Color().setHSL(hash(i + 3), 1, 0.65)); }

// ---------------- caterpillar ----------------
const NSEG = 60, SP = 1.35, SR = 1.45, BH = 3.5;
const segCols = ['#7cc43c', '#5fae2e'];
const segMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(SR, 28, 20), STD('#ffffff', { roughness: 0.55 }), NSEG); segMesh.castShadow = true; segMesh.receiveShadow = true; segMesh.frustumCulled = false; scene.add(segMesh);
for (let i = 0; i < NSEG; i++) segMesh.setColorAt(i, new THREE.Color(segCols[i % 2]));
const dotMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.32, 12, 8), STD('#ffd54f', { roughness: 0.5 }), NSEG * 2); dotMesh.castShadow = false; dotMesh.frustumCulled = false; scene.add(dotMesh);
const NLEG = NSEG; // one leg pair on every other segment -> NSEG legs
const legMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.17, 1, 10), STD('#4e8f24', { roughness: 0.6 }), NLEG); legMesh.castShadow = true; legMesh.frustumCulled = false; scene.add(legMesh);
const shoeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 12, 8), STD('#ff7043', { roughness: 0.45 }), NLEG); shoeMesh.castShadow = true; shoeMesh.frustumCulled = false; scene.add(shoeMesh);
// head
const head = new THREE.Group(); scene.add(head);   // local forward = +x (direction of travel), up = +y
const HD = {};
{ const sk = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 24), STD('#8bd448', { roughness: 0.5 })); head.add(sk);
  HD.eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(1.45, 0.55, s * 0.78); head.add(e); const w = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), STD('#fff', { roughness: 0.2 })); e.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), STD('#111', { roughness: 0.15 })); p.position.set(0.36, 0.02, 0); e.add(p); const hl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(0.6, 0.15, 0.1 * s); e.add(hl);
    const happy = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 16, Math.PI), STD('#111')); happy.rotation.y = Math.PI / 2; happy.position.set(0.5, -0.05, 0); e.add(happy);
    return { e, w, p, hl, happy }; });
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), STD('#8e1b1b')); mouth.scale.set(0.5, 0.3, 1.2); mouth.position.set(1.62, -0.75, 0); head.add(mouth); HD.mouth = mouth;
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 20, Math.PI), STD('#2b1a12')); smile.rotation.set(0, Math.PI / 2, Math.PI); smile.position.set(1.7, -0.45, 0); head.add(smile); HD.smile = smile;
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), STD('#ff8a80', { roughness: 0.6 })); ch.scale.set(0.4, 0.7, 1); ch.position.set(1.62, -0.25, s * 1.15); head.add(ch); }
  HD.ant = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(0.5, 1.7, s * 0.6); head.add(g); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), STD('#33691e')); st.position.y = 0.8; g.add(st); const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), STD('#ffd54f')); b.position.y = 1.65; g.add(b); g.rotation.x = s * 0.35; g.rotation.z = 0.25; return g; });
  head.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// spiral (curled ball) slots in the wheel plane (x-y), tail = inner end, head = outer end
const SPIR = []; { const a = 2.75, b = 2.85 / (Math.PI * 2); let th = 0, s = 0, k = 0; while (k < NSEG + 1) { const r = a + b * th; if (s >= k * SP) { SPIR.push({ th, r }); k++; } th += 0.002; s += r * 0.002; } }
const RMAX = SPIR[NSEG].r + SR + 0.2;
// cocoon
const cocoon = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), STD('#fff', { map: checkT(3), roughness: 0.75 })); cocoon.castShadow = true; cocoon.receiveShadow = true; scene.add(cocoon);
const KC = V3(2.0, 3.3, 0);
const NPF = 40; const puff = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.6, 1), STD('#ffffff', { roughness: 0.9, transparent: true, opacity: 0.9 }), NPF); puff.frustumCulled = false; scene.add(puff);
// butterfly (faces +z, wings along x)
const fly = new THREE.Group(); scene.add(fly); const FB = {};
{ const wingT = (upper) => canvasTex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.save(); c.beginPath();
    if (upper) { c.moveTo(0, 300); c.bezierCurveTo(60, 40, 380, -20, 500, 120); c.bezierCurveTo(520, 260, 300, 380, 0, 360); }
    else { c.moveTo(0, 150); c.bezierCurveTo(200, 120, 440, 220, 420, 400); c.bezierCurveTo(360, 520, 120, 420, 0, 240); }
    c.closePath(); c.clip(); const g = c.createRadialGradient(0, 260, 20, 0, 260, 520); g.addColorStop(0, '#ffeb3b'); g.addColorStop(0.35, '#ff9800'); g.addColorStop(0.65, '#e91e63'); g.addColorStop(1, '#7b1fa2'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.85)'; for (const [x, y, r] of upper ? [[330, 150, 46], [200, 110, 26], [420, 210, 22]] : [[280, 330, 40], [180, 260, 22]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#1a237e'; c.beginPath(); c.arc(x, y, r * 0.55, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.85)'; }
    c.restore(); c.lineWidth = 22; c.strokeStyle = '#2b1a3a'; c.beginPath(); if (upper) { c.moveTo(0, 300); c.bezierCurveTo(60, 40, 380, -20, 500, 120); c.bezierCurveTo(520, 260, 300, 380, 0, 360); } else { c.moveTo(0, 150); c.bezierCurveTo(200, 120, 440, 220, 420, 400); c.bezierCurveTo(360, 520, 120, 420, 0, 240); } c.stroke(); });
  const wu = wingT(true), wl = wingT(false);
  FB.wings = [];
  for (const s of [-1, 1]) { const hinge = new THREE.Group(); fly.add(hinge); hinge.userData.s = s;
    const mu = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 7.0), new THREE.MeshStandardMaterial({ map: wu, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.6 }));
    mu.rotation.x = -Math.PI / 2; mu.position.set(s * 3.5, 0, -1.6); if (s < 0) mu.scale.x = -1; hinge.add(mu);
    const ml = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6), new THREE.MeshStandardMaterial({ map: wl, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.6 }));
    ml.rotation.x = -Math.PI / 2; ml.position.set(s * 2.8, -0.05, 2.2); if (s < 0) ml.scale.x = -1; hinge.add(ml);
    mu.castShadow = ml.castShadow = true; FB.wings.push(hinge); }
  const bd = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 4.2, 8, 16), STD('#4a2a6a', { roughness: 0.5 })); bd.rotation.x = Math.PI / 2; fly.add(bd);
  const hdm = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 16), STD('#8bd448', { roughness: 0.5 })); hdm.position.set(0, 0.25, -2.9); fly.add(hdm);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), STD('#fff', { roughness: 0.2 })); e.position.set(s * 0.33, 0.5, -3.55); fly.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), STD('#111')); p.position.set(s * 0.33, 0.5, -3.78); fly.add(p);
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), STD('#2b1a3a')); a.position.set(s * 0.6, 1.4, -3.4); a.rotation.set(-0.5, 0, -s * 0.4); fly.add(a); const ab = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), STD('#ffd54f')); ab.position.set(s * 1.05, 2.3, -3.95); fly.add(ab); }
  const sm = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 14, Math.PI), STD('#2b1a12')); sm.position.set(0, 0.0, -3.7); sm.rotation.z = Math.PI; fly.add(sm);
  fly.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- motion ----------------
const X0W = mono([[0, -36], [tCat, 0.6], [tWhat, 12], [tImp + 0.5, 18.4], [tLift, 20.3], [99, 20.3]]);   // head x (wrong; stops with a leg gap over the right lane)
const X0R = mono([[0, -36], [tCat, 0.6], [tWhat, 12], [tRew1 - 0.5, 12], [tRew1, 12.4], [tWraps, 19.0], [99, 19.0]]);
const carZ = mono([[0, 46], [4.5, 16], [7.2, 9.2], [8.0, 9.0], [99, 9.0]]);
const carZW = mono([[0, 46], [4.5, 16], [7.2, 9.2], [8.0, 9.0], [tDrive - 0.1, 9.0], [tBelly + 0.3, 0.0], [99, 0.0]]);
const carZR = mono([[0, 46], [4.5, 16], [7.2, 9.2], [8.0, 9.0], [tTrack6 - 0.2, 9.0], [tTown, 0.5], [TOTAL, -26]]);
const CX = 1.75;
const curlU = t => ease(clamp((t - tCurls + 0.1) / 1.25));
const ROLL = mono([[0, 0], [tRolls - 0.1, 0], [tRolls + 1.0, 5], [tNext, 16], [tWho + 0.6, 34], [tRew0 + 0.5, 60]]);
const wheelC = t => { const u = ease(clamp((t - tCurls + 0.1) / 1.25)); return V3(CX + ROLL(t), lerp(BH, RMAX, u), 0); };
const wheelPhi = t => -ROLL(t) / RMAX + 1.2 * curlU(t);
// segment i (0 = right behind the head) world transform
const _P = V3(0, 0, 0);
function segPos(i, t, out) {
  const right = isRight(t);
  const X0 = right ? X0R(t) : X0W(t);
  const crawl = right ? (t < tWraps ? 1 : 0) : (t < tLift ? 1 : 0);
  let x = X0 - 1.0 - i * SP, y = BH + 0.35 * Math.sin(i * 0.55 - t * 4.2) * (0.4 + 0.6 * crawl), z = 0;
  if (!right) {
    const tk = win(t, tTick - 0.3, tCurls + 0.2, 0.2); y += tk * 0.18 * Math.sin(t * 30 + i * 1.7); z += tk * 0.12 * Math.sin(t * 23 + i);
    const u = clamp((t - tCurls + 0.1 - (NSEG - i) * 0.006) / 1.2);
    if (u > 0) { const e = ease(u); const sl = SPIR[NSEG - 1 - i]; const C = wheelC(t), ph = wheelPhi(t); const a = sl.th + ph;
      const sx = C.x + Math.cos(a) * sl.r, sy = C.y + Math.sin(a) * sl.r; x = lerp(x, sx, e); y = lerp(y, sy, e) + 2.5 * Math.sin(Math.PI * u) * (1 - i / NSEG); z = lerp(z, 0, e); }
  } else {
    const u = clamp((t - tWraps - 0.05 - Math.abs(x - KC.x) * 0.012) / 0.9);
    if (u > 0) { const e = ease(u); const k = (i / (NSEG - 1)) - 0.5; x = lerp(x, KC.x + k * 7.5, e); y = lerp(y, KC.y + 0.4 * Math.sin(i), e); z = lerp(z, 0.4 * Math.cos(i * 1.3), e); }
  }
  return out.set(x, y, z);
}
function headPose(t) {
  const right = isRight(t); const X0 = right ? X0R(t) : X0W(t);
  let p = V3(X0 + 0.6, BH + 1.1 + 0.25 * Math.sin(t * 4.2 + 0.6), 0), yaw = 0, roll = 0, pitch = 0;
  if (!right) {
    const tk = win(t, tTick - 0.3, tCurls + 0.2, 0.2); roll = 0.15 * tk * Math.sin(t * 18); p.y += 0.3 * tk * Math.abs(Math.sin(t * 14));
    // looks back at the car when tickled
    yaw = 0.0;
    const u = clamp((t - tCurls + 0.1) / 1.2);
    if (u > 0) { const e = ease(u); const sl = SPIR[NSEG]; const C = wheelC(t), ph = wheelPhi(t); const a = sl.th + ph;
      const q = V3(C.x + Math.cos(a) * (sl.r + 0.6), C.y + Math.sin(a) * (sl.r + 0.6), 0); p.lerp(q, e); roll = lerp(roll, a + Math.PI / 2 - Math.PI / 2, e) ; }
  } else {
    // peeks out of the cocoon (snug as a bug), then disappears inside
    const u = clamp((t - tWraps - 0.05) / 0.9); if (u > 0) { const e = ease(u); p.lerp(V3(KC.x + 6.6, KC.y + 1.4, 0), e); pitch = 0; roll = 0.35 * e; }
  }
  return { p, yaw, roll, pitch };
}
// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeadCam = (p, fov = 38, dy = 0) => t => { const h = headPose(t).p; return [V3(...p), V3(h.x, h.y + dy, h.z), fov]; };
const WheelCam = (off, fov = 40, ly = 0) => t => { const C = wheelC(t); return [V3(C.x + off[0], off[1], off[2]), V3(C.x, C.y + ly, 0), fov]; };
const camKeys = [
  [0.0, Ac([6.5, 4.5, 52], [0, 1.6, 4])],
  [tLights - 0.25, Ac([5.5, 3.6, 30], [0.5, 1.8, 4])],
  ...cut(tLights - 0.2, Ac([9.6, 3.0, 13.2], [4.4, 2.4, 5.9], 34)),
  [tHere - 0.25, Ac([9.4, 3.0, 13.0], [4.4, 2.4, 5.9], 34)],
  ...cut(tHere - 0.2, Ac([2.0, 1.9, 15.5], [-1.0, 2.6, 0], 36)),
  [tIts - 0.25, Ac([2.0, 1.9, 15.0], [-1.0, 2.8, 0], 36)],
  ...cut(tIts - 0.2, HeadCam([10.0, 5.2, 8.0], 34)),
  [tAndH - 0.25, HeadCam([10.5, 5.4, 8.5], 34)],
  ...cut(tAndH - 0.2, Ac([34, 34, 46], [-12, 2, 0])),
  [tWhat - 0.3, Ac([32, 30, 42], [-8, 2, 0])],
  ...cut(tWhat - 0.25, Ac([3.6, 3.2, 18.5], [0.8, 2.8, 0])),
  [S('wrong1').start - 0.2, Ac([3.5, 3.2, 18.0], [0.8, 2.8, 0])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([4.8, 2.8, 17.0], [1.5, 2.3, 2])),
  [tLift - 0.3, Ac([4.6, 2.8, 16.5], [1.5, 2.3, 2])],
  ...cut(tLift - 0.25, Ac([-2.6, 2.6, 13.0], [2.2, 1.4, 7.0], 38)),
  [tDrive - 0.3, Ac([-2.8, 2.7, 13.2], [2.2, 1.4, 7.0], 38)],
  ...cut(tDrive - 0.25, Ac([14.0, 1.5, 0.0], [1.75, 1.8, 2.5], 36)),
  [S('wrong1').end + 0.2, Ac([13.5, 1.5, 0.0], [1.75, 1.9, 0.5], 36)],
  ...cut(tBig - 0.15, Ac([9.5, 1.4, 0.0], [1.75, 1.9, 0], 34)),
  [tCats - 0.25, Ac([9.2, 1.4, 0.0], [1.75, 1.9, 0], 34)],
  ...cut(tCats - 0.2, HeadCam([31.0, 6.2, 11.0], 34, 0.0)),
  [tHund - 0.3, HeadCam([30.5, 6.0, 10.6], 34, 0.0)],
  ...cut(tHund - 0.25, Ac([12.0, 1.7, 8.5], [4.0, 1.6, 0], 40)),
  [S('wrong2').end + 0.2, Ac([12.4, 1.8, 8.9], [4.0, 1.8, 0], 40)],
  ...cut(tCurls - 0.15, Ac([16, 10, 40], [2.0, 7.0, 0])),
  [tWith - 0.3, Ac([14, 10.5, 38], [2.0, 8.0, 0])],
  ...cut(tWith - 0.25, WheelCam([3.0, 10.8, 11.5], 40, 0.3)),
  [tRolls - 0.3, WheelCam([3.2, 10.8, 11.2], 40, 0.3)],
  ...cut(tRolls - 0.25, WheelCam([-6, 9, 36], 40, -1)),
  [tNext - 0.3, WheelCam([-8, 9, 38], 40, -1)],
  ...cut(tNext - 0.25, Ac([-6, 7.5, 34], [26, 8, 0], 40)),
  [tRew0, Ac([-6, 7.5, 34], [45, 9, 0], 40)],
  // right
  ...cut(tRew1, Ac([4.6, 3.1, 18.5], [1.0, 2.8, 0])),
  [tOpen - 0.25, Ac([4.4, 3.1, 18.0], [1.0, 2.8, 0])],
  ...cut(tOpen - 0.2, Ac([5.4, 3.6, 16.5], [1.75, 1.3, 10.0], 38)),
  [tPicnic - 0.4, Ac([5.6, 3.8, 16.8], [1.75, 1.6, 9.0], 38)],
  ...cut(tPicnic - 0.35, Ac([-8, 5.5, 20], [2.5, 3.8, 3])),
  [S('right2').end + 0.2, Ac([-9, 6, 21], [2.5, 3.6, 1])],
  ...cut(tSnug - 0.2, Ac([15.5, 6.4, 9.0], [8.4, 4.8, 0], 36)),
  [tOne3 - 0.25, Ac([15.8, 6.6, 9.4], [8.4, 4.8, 0], 36)],
  ...cut(tOne3 - 0.2, Ac([-9, 6.5, 25], [2, 3.4, 0])),
  [tPop - 0.3, Ac([-8, 6, 23], [2, 3.6, 0])],
  ...cut(tPop - 0.25, Ac([6, 4.2, 27], [2, 6.5, 0])),
  [tFlap - 0.3, Ac([5, 4.0, 26], [2, 7.5, 0])],
  [tBarr5 - 0.35, Ac([5, 4.0, 25], [2, 7.5, 0])],
  ...cut(tBarr5 - 0.3, Ac([4.6, 2.6, 16.5], [1.2, 3.4, 3.0], 46)),
  [tAnd5 - 0.25, Ac([4.8, 2.7, 16.8], [1.2, 3.6, 3.0], 46)],
  ...cut(tAnd5 - 0.2, Ac([-2.6, 2.4, 4.6], [1.75, 1.0, 9.2], 38)),
  [S('right5').end + 0.1, Ac([-2.9, 2.6, 4.2], [1.75, 1.0, 9.2], 38)],
  ...cut(tTrack6 - 0.2, t => { const z = carZR(t); return [V3(-7.5, 3.8, z + 8.5), V3(CX, 1.2, z - 1), 40]; }),
  [S('right7').start - 0.1, t => { const z = carZR(t); return [V3(-7.5, 3.8, z + 8.5), V3(CX, 1.2, z - 1), 40]; }],
  ...cut(S('right7').start, Ac([7, 5, 22], [0, 7, -8])),
  [S('outro').start, Ac([8, 7, 26], [0, 8, -10])],
  [TOTAL, Ac([10, 10, 32], [0, 9, -12])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = V3(1, 1, 1), _v = V3(0, 0, 0), _w = V3(0, 0, 0);
const flyPos = t => { const u = ease(clamp((t - tPop) / 1.2)); const p = KC.clone().lerp(V3(2.0, 8.2, -1.0), u); p.y += 0.5 * Math.sin(t * 2.2) * u;
  const go = ease(clamp((t - tTrack6 + 0.3) / 4.5)); p.lerp(V3(-30, 26, -60), go); return p; };
function update(t) {
  const right = isRight(t);
  // lamps flash while the barrier is down (until it flies open)
  const flashing = !right ? true : t < tFlies;
  lamps.forEach(L2 => { const on = flashing && ((Math.floor(t * 2.4) % 2 === 0) === (L2.s > 0)); L2.m.emissiveIntensity = on ? 1 : 0; L2.m.color.set(on ? '#ff0000' : '#400'); });
  // barriers: wrong = lifted by the stretchy arm; right = flies open
  const liftW = !right ? ease(clamp((t - tLift + 0.05) / 0.6)) : 0;
  const flyR = right ? clamp((t - tFlies + 0.15) / 0.5) : 0;
  BAR.forEach((B, k) => { let a = 0; if (!right) a = k === 0 ? liftW * 1.35 : 0; else a = back(flyR) * 1.45 + (flyR > 0 ? 0.08 * Math.sin((t - tFlies) * 9) * Math.exp(-Math.max(0, t - tFlies) * 2) : 0); B.piv.rotation.z = -B.dir * a; });
  // car
  const curled = !right && t > tCurls - 0.1;
  if (!curled) { placeCar(hero, { x: CX, z: right ? carZR(t) : carZW(t), h: 0 }); }
  else { const C = wheelC(t), ph = wheelPhi(t) - 1.2 * curlU(t) * 0; const u = curlU(t); const roll = -ROLL(t) / RMAX;
    hero.position.set(C.x + 0.75 * Math.sin(roll), lerp(0, C.y - 0.75, u) + (1 - u) * 0, 0); hero.rotation.set(0, 0, roll, 'YXZ'); hero.userData.prev = null; }
  // the car's body gets tickly-bumpy under the belly
  if (!right && t > tBelly && t < tCurls) hero.userData.bodyG.position.y = 0.04 * Math.sin(t * 40);
  blink(hero, t, false, false);
  // rainbow glitter body
  const rb = right && t > tCovered - 0.15; hero.userData.bodyG.children.forEach(m => { if (m.material === bodyMat0 || m.material === rainMat) m.material = rb ? rainMat : bodyMat0; });
  hero.userData.bodyG.children.filter(m => m.material === bodyMat0 || m.material === rainMat).forEach(() => {});
  rainT.offset.x = t * 0.08; lid.userData.m.material = rb ? rainMat : bodyMat0; lid.rotation.x = right ? -1.15 * back(clamp((t - tBoot + 0.2) / 0.4)) * (1 - ramp(t, tWraps, tWraps + 0.5)) : 0;
  // stretchy arm (wrong): from the driver's window to the barrier arm
  const sa = !right ? win(t, tLift - 0.35, tDrive - 0.1, 0.25) : 0; stretch.visible = sa > 0.02;
  if (stretch.visible) { hero.updateMatrixWorld(true); const a0 = hero.localToWorld(V3(-0.95, 1.15, -0.5)); const tip = V3(CX - 0.4, 1.05 + 0.6 * Math.sin(liftW * 1.35) * 1.0 + 0.1, 6.2); const p1 = a0.clone().lerp(tip, Math.min(1, sa * 1.2));
    const d = p1.clone().sub(a0); const len = Math.max(0.05, d.length()); stretch.position.copy(a0); _q.setFromUnitVectors(V3(0, 1, 0), d.normalize()); stretch.quaternion.copy(_q); stretch.userData.sl.scale.set(1, len, 1); stretch.userData.sl.position.y = len / 2; stretch.userData.hd.position.y = len; }
  // blanket (right): flies from the boot onto the caterpillar, then becomes the cocoon
  const bu = right ? clamp((t - tBlanket + 0.45) / 1.3) : 0; blanket.visible = bu > 0 && t < tWraps + 0.35;
  if (blanket.visible) { const p0 = V3(CX, 1.4, 11.4), p1 = V3(KC.x, KC.y + 2.6, 0.5); const e = ease(bu); const p = p0.clone().lerp(p1, e); p.y += 4.0 * Math.sin(Math.PI * bu); blanket.position.copy(p);
    blanket.rotation.set(-Math.PI / 2 + 0.5 * Math.sin(t * 5), 0.4 * Math.sin(t * 3), 0.3 * Math.sin(t * 4)); const sc = lerp(0.5, 1.6, e); blanket.scale.set(sc, sc, sc);
    const pa = blanket.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { const x = blP0[i * 3], y = blP0[i * 3 + 1]; pa.setZ(i, 0.25 * Math.sin(x * 2.4 + t * 9) + 0.18 * Math.cos(y * 3 + t * 7)); } pa.needsUpdate = true; blanket.geometry.computeVertexNormals(); }
  // caterpillar segments
  let legI = 0;
  const legsOut = !right ? 1 - curlU(t) : 1 - ease(clamp((t - tWraps) / 0.6));
  const shrinkR = right ? 1 - ease(clamp((t - tWraps - 0.3) / 0.9)) * 0.55 : 1;
  for (let i = 0; i < NSEG; i++) {
    segPos(i, t, _P);
    const sc = (1 - 0.18 * (i / NSEG)) * shrinkR;
    _m.compose(_P, _q.identity(), _s.set(sc, sc, sc)); segMesh.setMatrixAt(i, _m);
    for (const sd of [-1, 1]) { _m.compose(V3(_P.x, _P.y + 0.9 * sc, _P.z + sd * 0.75 * sc), _q.identity(), _s.set(sc, sc * 0.8, sc)); dotMesh.setMatrixAt(i * 2 + (sd > 0), _m); }
    if (i % 2 === 0) { for (const sd of [-1, 1]) { if (legI >= NLEG) break;
        const gig = !right ? win(t, tLegs - 0.4, tCurls, 0.2) : 0; const sw = (legsOut < 1 ? 0 : 0.25 * Math.sin(t * 4.2 - i * 0.55 + (sd > 0 ? 0 : Math.PI)) * (1 - gig) * (right ? (t < tWraps ? 1 : 0) : (t < tLift ? 1 : 0)));
        const top = V3(_P.x, _P.y - 0.9 * sc, _P.z + sd * 1.1 * sc); const foot = V3(_P.x + Math.sin(sw) * 0.8, 0.25 + gig * 0.55 * Math.max(0, Math.sin(t * 24 + i * 1.3 + sd)), _P.z + sd * 1.3 * sc); if (legsOut < 0.999) foot.lerp(V3(_P.x, _P.y - 1.3 * sc, _P.z + sd * 1.0 * sc), 1 - legsOut);
        const d = top.clone().sub(foot); const len = d.length(); _q.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
        _m.compose(foot.clone().addScaledVector(d, 0.5), _q, _s.set(sc * Math.max(0.01, legsOut), len, sc * Math.max(0.01, legsOut))); legMesh.setMatrixAt(legI, _m);
        _m.compose(foot, _q.identity(), _s.set(sc * legsOut * 1.0 + 0.001, sc * legsOut * 0.6 + 0.001, sc * legsOut * 1.4 + 0.001)); shoeMesh.setMatrixAt(legI, _m); legI++; } }
  }
  segMesh.instanceMatrix.needsUpdate = dotMesh.instanceMatrix.needsUpdate = legMesh.instanceMatrix.needsUpdate = shoeMesh.instanceMatrix.needsUpdate = true;
  // head
  const hp = headPose(t); head.position.copy(hp.p); head.rotation.set(hp.pitch, hp.yaw, hp.roll, 'YXZ');
  const hs = right ? 1 - ramp(t, tCocoon - 0.2, tCocoon + 0.3) : 1; head.scale.setScalar(Math.max(0.01, hs)); head.visible = hs > 0.02;
  const laugh = !right ? win(t, tTick - 0.2, tCurls + 0.1, 0.15) : 0; const dizzy = !right && t > tRolls ? 1 : 0; const sleepy = right ? ramp(t, tSnug, tBug) : 0;
  HD.mouth.visible = laugh > 0.1; HD.mouth.scale.set(0.5, 0.3 + 0.35 * laugh * Math.abs(Math.sin(t * 16)), 1.2); HD.smile.visible = laugh < 0.1;
  HD.eyes.forEach((E, k) => { const happy = Math.max(laugh, sleepy) > 0.5; E.happy.visible = happy; E.w.visible = E.p.visible = E.hl.visible = !happy; E.p.position.set(0.36, 0.02 + (dizzy ? 0.12 * Math.sin(t * 9 + k * 3) : 0), dizzy ? 0.12 * Math.cos(t * 9 + k * 3) : 0); E.happy.rotation.z = sleepy > 0.5 ? Math.PI : 0; });
  HD.ant.forEach((g, k) => { g.rotation.x = (k ? 1 : -1) * (0.35 + 0.15 * Math.sin(t * 3 + k)) ; g.rotation.z = 0.25 + 0.2 * Math.sin(t * 2.4 + k) + laugh * 0.3 * Math.sin(t * 20); });
  // cocoon + pop
  const cg = right ? ease(clamp((t - tWraps - 0.1) / 0.9)) : 0; const popU = right ? clamp((t - tPop + 0.02) / 0.25) : 0;
  const shake = right ? ramp(t, tFive, tPop) : 0; const cs = cg * (1 + 0.25 * popU); cocoon.visible = cg > 0.01 && popU < 1;
  cocoon.position.copy(KC).add(V3(0.15 * shake * Math.sin(t * 31), 0.1 * shake * Math.sin(t * 23), 0)); cocoon.rotation.set(0, 0, 0.05 * Math.sin(t * 2) + 0.12 * shake * Math.sin(t * 17)); cocoon.scale.set(6.9 * cs, (3.1 + 0.15 * Math.sin(t * 2.2)) * cs, 3.1 * cs);
  for (let i = 0; i < NPF; i++) { const dt = t - tPop; let ok = right && dt > 0 && dt < 1.6; if (ok) { const a = hash(i) * Math.PI * 2, b = (hash(i + 7) - 0.3) * 2.2, sp = 5 + hash(i + 3) * 6; const p = KC.clone().add(V3(Math.cos(a) * Math.cos(b) * sp * dt * 1.2, Math.sin(b) * sp * dt, Math.sin(a) * Math.cos(b) * sp * dt)); const s = (1 - dt / 1.6) * (0.8 + hash(i + 5)); _m.compose(p, _q.identity(), _s.set(s, s, s)); } if (!ok) _m.makeScale(0, 0, 0); puff.setMatrixAt(i, _m); }
  puff.instanceMatrix.needsUpdate = true;
  // the caterpillar body disappears into the cocoon
  segMesh.visible = dotMesh.visible = legMesh.visible = shoeMesh.visible = !(right && t > tCocoon);
  // butterfly
  const fu = right ? clamp((t - tPop + 0.05) / 0.5) : 0; fly.visible = fu > 0; if (fly.visible) { fly.position.copy(flyPos(t)); fly.scale.setScalar(Math.max(0.01, back(fu))); fly.rotation.set(0.95 - 0.5 * ramp(t, tTrack6, tTrack6 + 1), Math.PI + 0.5 * ramp(t, tTrack6, tTrack6 + 1.5), 0.05 * Math.sin(t * 1.3), 'YXZ');
    const bigFlap = win(t, tFlap - 0.15, tWings + 0.5, 0.15); const fl = Math.sin(t * (6 + 3 * bigFlap)) * (0.35 + 0.55 * bigFlap) + 0.15 - 0.3 * (1 - ramp(t, tPop, tPop + 0.8));
    FB.wings.forEach(h => { h.rotation.z = h.userData.s * fl; }); }
  // glitter rain + sparkles on the car
  for (let i = 0; i < NSP; i++) { let ok = false; if (right && t > tCovered - 0.6) { const ph = (t * (0.5 + hash(i) * 0.6) + hash(i + 9)) % 1; ok = true;
      if (t < tCovered + 0.6) { const fp = flyPos(t); const p = fp.clone().lerp(hero.position.clone().add(V3((hash(i + 1) - 0.5) * 2.2, 1.0 + hash(i + 2), (hash(i + 4) - 0.5) * 4.4)), (ph + clamp((t - tCovered + 0.6) / 1.2)) % 1); _m.compose(p, _q.identity(), _s.setScalar(1.2)); }
      else { const p = hero.position.clone().add(V3((hash(i + 1) - 0.5) * 2.3, 0.3 + hash(i + 2) * 1.5, (hash(i + 4) - 0.5) * 4.6)); const s = Math.max(0, Math.sin(Math.PI * ph)) * 1.6; _m.compose(p, _q.setFromEuler(_e.set(0, t * 3 + i, 0)), _s.set(s, s, s)); } }
    if (!ok) _m.makeScale(0, 0, 0); spark.setMatrixAt(i, _m); }
  spark.instanceMatrix.needsUpdate = true;
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? win(t, tRolls - 0.05, tRolls + 0.3, 0.05) * 0.6 : win(t, tPop - 0.05, tPop + 0.3, 0.05) * 0.8;
  applyCam(c, t, shk > 0.02 ? 0.06 * shk : 0);
  camera.updateMatrixWorld(true); hero.updateMatrixWorld(true); head.updateMatrixWorld(true);
  screen = { head: project(head.localToWorld(V3(0, 2.4, 0))), car: project(hero.localToWorld(V3(0, 2.2, 0))), fly: project(fly.position.clone().add(V3(0, 2.5, 0))), cocoon: project(KC.clone().add(V3(0, 4.2, 0))) };
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
function clock(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.15), k = back((t - a) / 0.3); const n = Math.max(0, 5 - Math.floor((t - a) / ((b - a) / 5.2)));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 600); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(12,14,20,0.88)'; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = YEL; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 100, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp((t - a) / (b - a))); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '900 110px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), 0, 8); ctx.restore(); }
function wind(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.15); ctx.save(); ctx.globalAlpha = 0.75 * f; ctx.strokeStyle = '#ffffff'; ctx.lineCap = 'round'; ctx.lineWidth = 10;
  for (let k = 0; k < 9; k++) { const y = 520 + k * 95 + 20 * Math.sin(k * 3), x0 = ((t - a) * 1600 + k * 260) % (W + 600) - 300; ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(x0 + 120, y - 30, x0 + 260, y); ctx.stroke(); } ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('LEVEL CROSSING', '#455a64', tLevel - 0.1, tLights - 0.15, 56);
    P_('BARRIER: DOWN', RED, tBarrierH - 0.1, tHere - 0.2, 54);
    P_('TRAIN COMING', '#455a64', tHere - 0.15, tIts - 0.15, 56, iconWarn);
    P_('TRAIN: CATERPILLAR', '#558b2f', tCat - 0.15, tAndH - 0.15, 54);
    P_('LENGTH: VERY, VERY LONG', '#558b2f', tVery - 0.2, S('hook2').end + 0.3, 46);
    P_('LIFT THE BARRIER', RED, tLift - 0.15, tDrive - 0.15, 54, iconWarn);
    P_('UNDER ITS BELLY', RED, tDrive - 0.15, S('wrong1').end + 0.3, 56, iconWarn);
    P_('TICKLISH!', '#e65100', tTick - 0.15, tHund - 0.2, 64);
    bubble('HEE HEE HEE!', screen.head, t, tTick + 0.1, tHund - 0.25, 58, '#fff', '#2e7d32', -90);
    floatText('HEE!', 240, 700, t, tLegs - 0.2, tLegs + 0.9, 90, YEL, -0.15); floatText('HIHI!', 800, 760, t, tLegs + 0.1, tLegs + 1.1, 90, YEL, 0.12); floatText('HAHA!', 520, 640, t, tGigg - 0.1, tGigg + 0.9, 100, YEL, -0.05);
    P_('100 GIGGLING LEGS', '#e65100', tHund - 0.2, S('wrong2').end + 0.3, 52);
    P_('CURLED UP', RED, tCurls - 0.1, tWith - 0.15, 60);
    P_('YOU = THE AXLE', RED, tWith - 0.15, tRolls - 0.15, 56, iconX);
    P_('ROLLING AWAY', RED, tRolls - 0.1, tNext - 0.15, 58, iconX);
    P_('NEXT STOP: ???', RED, tNext - 0.15, tRew0, 58, iconX);
  } else {
    P_('ENGINE OFF', '#455a64', tEngine - 0.1, tOpen - 0.15, 56);
    P_('OPEN THE BOOT', '#1565c0', tOpen - 0.15, tHand - 0.15, 56);
    P_('PICNIC BLANKET', '#c62828', tPicnic - 0.15, S('right2').end + 0.3, 56);
    P_('WRAPPING UP...', '#558b2f', tWraps - 0.1, tSnug - 0.15, 56);
    P_('SNUG AS A BUG', '#558b2f', tSnug - 0.15, tOne3 - 0.15, 56, iconHeart);
    bubble('COSY!', screen.head, t, tSnug + 0.1, tOne3 - 0.1, 56, '#fff', '#c62828', -100);
    P_('GIANT COCOON', '#6d4c41', tOne3 - 0.15, S('right3').end + 0.3, 58);
    clock(t, tFive - 0.05, tPop - 0.05);
    floatText('POP!', W / 2, 700, t, tPop - 0.05, tPop + 0.9, 170, YEL, -0.1);
    P_('GIANT BUTTERFLY', '#ad1457', tButter - 0.2, S('right4').end + 0.3, 56);
    P_('ONE FLAP', '#ad1457', tFlap - 0.15, tBarr5 - 0.2, 60);
    wind(t, tFlap - 0.05, tFlies + 0.4);
    P_('BARRIER: OPEN', GREEN, tFlies - 0.15, tAnd5 - 0.15, 58, iconCheck);
    P_('RAINBOW GLITTER', '#7b1fa2', tCovered - 0.2, S('right5').end + 0.3, 56);
    P_('TRACK CLEAR', GREEN, tTrack6 - 0.15, tPrettiest - 0.15, 60, iconCheck);
    P_('PRETTIEST CAR IN TOWN', '#d81b60', tPrettiest - 0.15, S('right7').start - 0.1, 48, iconHeart);
  }
}
window.dbg = { SPIR, RMAX };
start(update, hud);
