// Episode 31: Parallel parking between two sleeping bears
// hook: normal parking tip -> the perfect gap is between two sleeping bears
// wrong: parking sensor beeps -> bear thinks it's his alarm clock -> hits snooze on your car (splat), car alarm -> snooze again -> car becomes his pillow
// right: sensor off, give each bear a teddy -> they hug it and roll onto the pavement -> tiptoe mode: the car sneaks in on little legs -> lock: beep, oops, one eye... back to sleep
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, concreteMat, plane, instanced, makeLandscape, BIG,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LANE = 1.75, PX = 4.85;                                   // parking strip centre
// ---------------- timing ----------------
const tFind = WT('hook1', 'Find'), tInd = WT('hook1', 'indicate'), tRev = WT('hook1', 'reverse'), tPerfect = WT('hook2', 'Perfect'), tProblem = WT('hook2', 'problem'), tSleeping = WT('hook2', 'sleeping'), tWhat = WT('hook2', 'What');
const tRevW = WT('wrong1', 'reverse'), tSensor = WT('wrong1', 'sensor'), tBig = WT('wrong2', 'Big'), tB1 = WT('wrong2', 'Beep', 0), tB2 = WT('wrong2', 'Beep', 1), tB3 = WT('wrong2', 'Beep', 2), tBear = WT('wrong2', 'bear'), tThinks = WT('wrong2', 'thinks'), tClock = WT('wrong2', 'clock');
const tSnz1 = WT('wrong3', 'snooze', 0), tCarAl = WT('wrong3', 'alarm'), tSnz2 = WT('wrong3', 'snooze', 1), tAgain = WT('wrong3', 'again'), tAndNow = WT('wrong3', 'And'), tPillow = WT('wrong3', 'pillow');
const tOff = WT('right2', 'Turn'), tGive = WT('right2', 'give'), tTeddy = WT('right2', 'teddy'), tHug = WT('right3', 'hug'), tRollR = WT('right3', 'roll'), tTip = WT('right4', 'tiptoe'), tSneak = WT('right4', 'sneak'), tTime = WT('right4', 'time');
const tLock = WT('right5', 'Now'), tBeepR = WT('right5', 'Beep'), tOops = WT('right5', 'Oops'), tEye = WT('right5', 'opens'), tBackS = WT('right5', 'goes'), tShh = WT('right6', 'Shh'), tParked = WT('right6', 'Parked');

// ---------------- street ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 40, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 45, near: [80, 0, 60, 300], trees: 900, seed: 63 });
plane(-3.6, 3.6, -BIG, BIG, asphaltMat, 0.06, 7);
const parkM = L('#ffffff', { map: canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#5b5e63'; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { const v = 76 + (hash(i) * 30 | 0); c.fillStyle = `rgb(${v},${v + 2},${v + 5})`; c.fillRect(hash(i + 3) * w, hash(i + 9) * h, 2, 2); } }, [2, 120]) });
for (const sx of [1, -1]) { plane(sx > 0 ? 3.6 : -6.3, sx > 0 ? 6.3 : -3.6, -400, 400, parkM, 0.065, 1);
  const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 800), concreteMat); curb.position.set(sx * 6.45, 0.09, 0); curb.receiveShadow = true; scene.add(curb);
  plane(sx > 0 ? 6.6 : -10.5, sx > 0 ? 10.5 : -6.6, -400, 400, L('#cfc8bb'), 0.16, 60); }
{ const g = new THREE.PlaneGeometry(0.2, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -400; z < 400; z += 9) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false);
  const pg = new THREE.PlaneGeometry(2.6, 0.12); pg.rotateX(-Math.PI / 2); const pl = []; for (let z = -300; z < 300; z += 6.5) { pl.push([PX, 0.08, z + 3.25]); pl.push([-PX, 0.08, z + 3.25]); } instanced(pg, markMat, pl, false); }
plane(3.5, 3.6, -400, 400, markMat, 0.08, 50); plane(-3.6, -3.5, -400, 400, markMat, 0.08, 50);
// houses
{ const cols = ['#f4d6a0', '#d9a77f', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5d7a99'; c.fillRect(30 + x * 120, 30 + y * 120, 76, 80); c.fillStyle = '#ffffff'; c.fillRect(66 + x * 120, 30 + y * 120, 4, 80); c.fillRect(30 + x * 120, 68 + y * 120, 76, 4); } });
  for (const sx of [1, -1]) for (let z = -260, k = 0; z < 260; k++) { const w = 9 + hash(k * 3 + (sx > 0 ? 1 : 7)) * 6, hgt = 7 + hash(k * 5 + 2) * 5; const c = cols[(k * 3 + (sx > 0 ? 0 : 2)) % cols.length];
    const m = new THREE.Mesh(new THREE.BoxGeometry(8, hgt, w - 0.6), [L(c), L(c), L(c), L(c), L(c, { map: winT }), L(c, { map: winT })]); const mm = m.material; mm[sx > 0 ? 1 : 0] = L(c, { map: winT }); m.position.set(sx * 15, hgt / 2, z + w / 2); m.castShadow = m.receiveShadow = true; scene.add(m);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(4, (w - 0.6) / 2) * 1.02, 3, 4, 1), L(['#b0473a', '#7b5e57', '#455a64'][k % 3])); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, (w - 0.6) / 8); roof.position.set(sx * 15, hgt + 1.5, z + w / 2); roof.castShadow = true; scene.add(roof); z += w; } }
// street lamps + trees on the pavement
for (let z = -200; z < 200; z += 22) for (const sx of [1, -1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), STD('#455a64', { metalness: 0.6 })); p.position.set(sx * 7.0, 2.5, z + (sx > 0 ? 0 : 11)); scene.add(p); const l = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), STD('#fff8e1', { emissive: '#fff3c4', emissiveIntensity: 0.3 })); l.position.set(sx * 6.6, 5.0, z + (sx > 0 ? 0 : 11)); scene.add(l); }
// parked cars beyond the bears
const parked = [];
for (const z of [-17.5, -24, -30.5, -43.5, -50, 17.5, 24, 37, 43.5, 50]) parked.push([PX, z]);
for (let z = -60; z < 60; z += 6.5) if (hash(z * 13) > 0.35) parked.push([-PX, z + 3.25]);
const pcol = ['#e53935', '#fdd835', '#1e88e5', '#ffffff', '#8e24aa', '#fb8c00', '#455a64', '#00897b'];
parked.forEach(([x, z], i) => { const c = makeCar(pcol[i % pcol.length]); placeCar(c, { x, y: 0, z, h: x < 0 ? Math.PI : 0, pitch: 0, roll: 0 }); });
// a couple of normal cars driving (tutorial look)
const traffic = [makeCar('#90a4ae'), makeCar('#c62828')];

// ---------------- bears ----------------
// built along -z from a pivot at the tail; head at the -z end
function makeBear(furC = '#7b5034') {
  const fur = STD(furC, { roughness: 0.95 }), light = STD('#c49a6c', { roughness: 0.9 }), dark = STD('#2b1b12');
  const root = new THREE.Group(); scene.add(root); const piv = new THREE.Group(); piv.position.set(0, 0.2, 0); root.add(piv);
  const body = new THREE.Group(); piv.add(body);
  const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), fur); torso.scale.set(1.35, 1.05, 2.45); torso.position.set(0, 1.0, -2.45); body.add(torso);
  const hump = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 14), fur); hump.position.set(0, 1.55, -3.6); body.add(hump);
  const head = new THREE.Group(); head.position.set(0, 1.15, -5.0); body.add(head);
  const hm = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 18), fur); hm.scale.set(1, 0.92, 1); head.add(hm);
  const jawG = new THREE.Group(); jawG.position.set(0, -0.25, -0.55); head.add(jawG);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), light); snout.scale.set(1, 0.75, 1.15); snout.position.set(0, -0.05, -0.75); head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), dark); nose.position.set(0, 0.06, -1.18); head.add(nose);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), light); jaw.scale.set(1, 0.6, 1.2); jaw.position.set(0, 0, -0.2); jawG.add(jaw);
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), STD('#8e2b2b')); mouth.position.set(0, -0.12, -0.92); mouth.scale.set(1, 0.001, 1); head.add(mouth);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), fur); ear.position.set(s * 0.55, 0.62, 0.05); head.add(ear); const ei = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), light); ei.position.set(s * 0.55, 0.62, -0.12); head.add(ei); }
  const eyes = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.36, 0.22, -0.72); head.add(g);
    const shut = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.04), dark); shut.rotation.z = s * 0.15; g.add(shut);
    const open = new THREE.Group(); g.add(open); const wh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), STD('#ffffff')); open.add(wh); const pu = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), dark); pu.position.set(0, 0, -0.09); open.add(pu);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.06), dark); brow.position.set(0, 0.17, -0.02); open.add(brow); return { shut, open, brow, s }; });
  const paws = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.85, 0.75, -4.1); body.add(g); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 1.5, 12), fur); a.rotation.x = Math.PI / 2; a.position.set(0, -0.25, -0.55); g.add(a); const p = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), fur); p.scale.set(1, 0.6, 1.2); p.position.set(0, -0.35, -1.25); g.add(p); return g; });
  const hind = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 1.0, 0.55, -0.6); body.add(g); const l = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), fur); l.scale.set(0.8, 0.7, 1.3); g.add(l); return g; });
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), fur); tail.position.set(0, 1.1, 0.0); body.add(tail);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, piv, body, torso, head, jawG, mouth, eyes, paws, hind };
}
const bearA = makeBear('#7b5034'), bearB = makeBear('#6d4428');
const ZA = -11.0, ZB = 11.0;                       // tails; heads point at the gap
// bear A: head towards +z (rotate 180°), bear B: head towards -z
const placeBear = (b, x, z, h, curl = 0) => { b.root.position.set(x, 0, z); b.root.rotation.y = h; b.body.scale.set(1, 1, 1 - 0.18 * curl); b.head.rotation.x = 0.25 * curl; b.paws.forEach(p => p.rotation.x = -0.4 * curl); };
// ---------------- hero: parallel parking ----------------
const Z_STOP = -6.8, Z_FIN = 0.3;
const appr = t => { const T1 = tPerfect + 0.9; if (t > T1) return Z_STOP; const u = clamp(t / T1); return lerp(95, Z_STOP, 1 - (1 - u) * (1 - u)); };
function parkPath(u, zEnd) { const x = LANE + (PX - LANE) * (u * u * (3 - 2 * u)); const z = Z_STOP + (zEnd - Z_STOP) * u; const dx = (PX - LANE) * 6 * u * (1 - u), dz = zEnd - Z_STOP; return { x, z, h: Math.atan2(dx, dz) * (u < 1 ? 1 : 0) }; }
const T_RW0 = tRevW - 0.2, T_RW1 = tB3 + 0.15, ZW_END = 2.4;          // wrong: reverse until the bumper kisses bear B
// right: teddies, hug, roll, tiptoe
const T_TA = tGive - 0.25, T_TB = tTeddy - 0.45, T_RL0 = tRollR - 0.1, T_RL1 = tRollR + 1.2;
const N_STEP = 6, T_SN0 = tSneak - 0.1, T_SN1 = Math.min(tTime + 0.35, tLock - 0.3);
function heroPose(t) {
  const right = t >= tRew0 + 0.5;
  if (!right) {
    if (t < T_RW0) return { x: LANE, y: 0, z: appr(t), h: 0, pitch: 0, roll: 0 };
    const u = ease(clamp((t - T_RW0) / (T_RW1 - T_RW0))); const p = parkPath(u, ZW_END); return { x: p.x, y: 0, z: p.z, h: p.h, pitch: 0, roll: 0 };
  }
  const lf = liftF(t), sp = stepPhase(t);
  const u = t < T_SN0 ? 0 : t >= T_SN1 ? 1 : (sp.k + ease(sp.f)) / N_STEP;
  const p = parkPath(u, Z_FIN); return { x: p.x, y: lf + (sp.k >= 0 ? 0.1 * Math.sin(Math.PI * sp.f) : 0), z: p.z, h: p.h, pitch: 0, roll: sp.k >= 0 ? 0.05 * Math.sin(Math.PI * sp.f) * (sp.k % 2 ? 1 : -1) : 0 };
}
// bear B, wrong way: wakes, sits up (alarm clock!), smashes the snooze button twice, then uses the car as a pillow
const R_SLAM = 6.8, R_PIL = 8.6;
function bearBPose(t) {
  const up0 = ease(clamp((t - tBear + 0.1) / 1.0));                       // rises + shuffles forward
  let th = 1.35 * up0, z = lerp(ZB, R_SLAM, ease(clamp((t - tBear) / 1.6))), paw = 1.6 * ease(clamp((t - tThinks) / 0.8)), head = 0, y = 0;
  const slam = (ti, thLow, pawLow) => { const d = ease(clamp((t - (ti - 0.28)) / 0.28)); th = lerp(th, thLow, d); paw = lerp(paw, pawLow, d); };
  slam(TI1, 0.35, -0.95);
  const re = ease(clamp((t - (tSnz2 - 0.55)) / 0.5)); th = lerp(th, 1.3, re); paw = lerp(paw, 1.6, re);
  slam(TI2, 0.2, -0.9);
  const pl = ease(clamp((t - tPillow + 0.6) / 1.2));
  th = lerp(th, 0, pl); paw = lerp(paw, 0.15, pl); z = lerp(z, R_PIL, pl); head = 0.3 * pl; y = -0.05 * pl;
  return { th, z, paw, head, y };
}
const TI1 = tSnz1 + 0.35, TI2 = tAgain + 0.1, T_PIL1 = tPillow + 0.6;

// ---------------- camera ----------------
const Ac = (p, l) => () => [V3(...p), V3(...l)];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2])]; };
const cut = (t0, f) => [[t0, f], [t0 + 0.04, f]];
function eyeCam(d) { return () => { bearB.head.updateMatrixWorld(true); const p = bearB.head.localToWorld(V3(0, 0, -0.4)); return [V3(p.x - 3.2 - d, p.y + 2.6 + d, p.z - 2.8 - d), p]; }; }
const camKeys = [
  [0.0, Hf([-1.2, 3.2, 10], [1.2, 1.0, -20])],
  [tPerfect - 0.3, Hf([-1.2, 3.2, 10], [1.4, 1.0, -20])],
  ...cut(tPerfect - 0.25, Ac([-2.5, 2.4, 9.5], [PX - 0.5, 0.9, -1])),
  [tProblem + 0.3, Ac([-2.6, 2.6, 9.0], [PX - 0.5, 0.9, -1])],
  [tSleeping + 0.1, Ac([-6.5, 9.5, 21], [PX, 0.8, -1])],
  [S('hook2').end + 0.5, Ac([-6.8, 10.5, 22], [PX, 0.8, -1])],
  // wrong
  ...cut(S('wrong1').start - 0.3, Ac([-5.5, 9, 18], [PX - 1, 0.6, -2])),
  [tB1 - 0.35, Ac([-5.5, 9, 18], [PX - 1, 0.6, -1])],
  ...cut(tB1 - 0.3, Ac([0.2, 2.0, 8.5], [PX - 0.3, 1.0, 4.0])),
  [tBear - 0.3, Ac([0.4, 2.1, 8.0], [PX - 0.3, 1.2, 4.0])],
  ...cut(tBear - 0.25, Ac([PX - 9.5, 5.6, -9.0], [PX + 0.3, 3.7, 5.0])),
  [tSnz1 - 0.1, Ac([PX - 9.8, 5.6, -9.4], [PX + 0.3, 3.5, 4.5])],
  [tCarAl - 0.3, Ac([PX - 9.0, 4.4, -8.2], [PX + 0.3, 2.3, 4.0])],
  ...cut(tCarAl - 0.25, Ac([PX - 4.5, 1.5, -2.6], [PX, 0.6, 2.2])),
  [tSnz2 - 0.3, Ac([PX - 4.8, 1.6, -2.9], [PX, 0.7, 2.2])],
  ...cut(tSnz2 - 0.25, Ac([PX - 9.5, 5.6, -9.0], [PX + 0.3, 3.5, 4.5])),
  [tAndNow - 0.1, Ac([PX - 8.8, 4.2, -7.5], [PX + 0.3, 1.8, 4.5])],
  [tPillow + 0.4, Ac([PX - 6.5, 3.0, -2.5], [PX, 0.9, 4.2])],
  [tRew0 + 0.45, Ac([PX - 6.3, 2.9, -2.2], [PX, 0.9, 4.2])],
  // right
  [tRew0 + 0.55, Ac([-6, 12, 17], [PX, 0.5, -1])],
  [tHug - 0.3, Ac([-6, 12.5, 17.5], [PX, 0.5, -1])],
  ...cut(tHug - 0.25, Ac([PX - 5.0, 2.6, -1.2], [PX, 1.0, -6.8])),
  [tRollR - 0.35, Ac([PX - 5.2, 2.7, -1.0], [PX, 1.0, -6.8])],
  ...cut(tRollR - 0.3, Ac([PX + 0.5, 30, 15], [PX + 1.5, 0, -0.5])),
  [tTip - 0.3, Ac([PX + 0.5, 31, 15.5], [PX + 1.5, 0, -0.5])],
  ...cut(tTip - 0.25, Hf([-12.5, 3.6, 3.0], [0.8, 1.3, 0])),
  [T_SN1 + 0.4, Hf([-13, 3.8, 3.4], [0.8, 1.1, 0])],
  ...cut(tLock - 0.25, Ac([-4.5, 4.5, 12], [PX + 1, 1.0, 1])),
  [tEye - 0.35, Ac([-4.6, 4.6, 12.5], [PX + 1, 1.0, 1])],
  ...cut(tEye - 0.3, eyeCam(0)),
  [tShh - 0.3, eyeCam(0.3)],
  ...cut(tShh - 0.25, Ac([-6.5, 7, 19], [PX + 1, 1.0, 0])),
  [S('outro').start + 0.4, Ac([-7, 9, 22], [PX + 1, 1.0, 0])],
  [TOTAL - 0.3, Ac([-2, 14, 30], [PX + 1, 1.0, 0])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = b === a ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u) };
}

// ---------------- props ----------------
const hero = makeCar('#35d43a');
const keyFlash = new THREE.PointLight('#ffb300', 0, 9); scene.add(keyFlash);
function eyeState(b, open, oneEye = false, grumpy = 0) { b.eyes.forEach(e => { const o = open > 0.5 && (!oneEye || e.s > 0); e.open.visible = o; e.shut.visible = !o; e.brow.rotation.z = -e.s * 0.45 * grumpy; e.brow.position.y = 0.17 - 0.03 * grumpy; }); }
// teddies: tiny light bears sitting upright
function makeTeddy(c) { const b = makeBear(c); b.root.scale.setScalar(0.24); b.piv.rotation.x = Math.PI / 2 * 0.95; eyeState(b, 1); const bow = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.14, 8, 16), STD('#e91e63')); bow.position.set(0, 0.7, -4.3); b.body.add(bow); return b; }
const teddyA = makeTeddy('#e0b07a'), teddyB = makeTeddy('#d7a36a');
const _q = new THREE.Quaternion(), _e = new THREE.Euler();
function placeTeddy(td, b, t, ta, rl) {
  b.body.updateMatrixWorld(true);
  const hold = b.body.localToWorld(V3(0, 0.15, -5.75)), belly = b.body.localToWorld(V3(0, -0.95, -3.2));
  const tgt = hold.clone().lerp(belly, rl); tgt.y = lerp(0.0, 1.65, rl) + (1 - rl) * 0.0;
  const u = clamp((t - ta) / 0.75);
  if (u < 1) { const from = V3(LANE + 0.6, 1.7, Z_STOP); const p = from.lerp(tgt, ease(u)); p.y += 3.2 * Math.sin(Math.PI * u); td.root.position.copy(p); td.root.rotation.set(0, b.root.rotation.y + 6 * u, 0); }
  else { td.root.position.copy(tgt); td.root.rotation.set(-1.3 * rl, b.root.rotation.y + Math.PI, 0); }
}
// tiptoe legs with sneakers, children of the hero car
const legs = new THREE.Group(); hero.add(legs);
const legParts = [[-0.84, -1.38], [0.84, -1.38], [-0.84, 1.38], [0.84, 1.38]].map(([x, z], i) => {
  const g = new THREE.Group(); g.position.set(x * 1.12, 0.34, z); legs.add(g);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 10), STD('#cfd8dc', { metalness: 0.5, roughness: 0.4 })); leg.position.y = -0.5; g.add(leg);
  const shoe = new THREE.Group(); g.add(shoe);
  const sole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.52), STD('#ffffff')); sole.position.set(0, 0.05, -0.08); shoe.add(sole);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), STD('#e53935')); top.scale.set(1, 0.7, 1.4); top.position.set(0, 0.14, -0.08); shoe.add(top);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, leg, shoe, ph: (i === 0 || i === 3) ? 0 : 1 };
});
const LIFT = 0.95;
function stepPhase(t) { const n = (t - T_SN0) / ((T_SN1 - T_SN0) / N_STEP); if (n < 0 || n >= N_STEP) return { k: -1, f: 0 }; return { k: Math.floor(n), f: n - Math.floor(n) }; }
function liftF(t) { return LIFT * ease(clamp((t - tTip + 0.1) / 0.6)) * (1 - ease(clamp((t - T_SN1 - 0.05) / 0.45))); }
function poseLegs(t, lf) {
  const sp = stepPhase(t);
  legParts.forEach(L => { const up = sp.k >= 0 && sp.k % 2 === L.ph ? 0.32 * Math.sin(Math.PI * sp.f) : 0;
    const len = Math.max(0.02, 0.34 + lf - up - 0.02); L.leg.scale.y = len; L.leg.position.y = -len / 2; L.shoe.position.y = -len - 0.02; L.shoe.rotation.x = -0.5 * up; L.g.scale.setScalar(lf > 0.05 ? 1 : lf / 0.05); });
}

// ---------------- update ----------------
function update(t) {
  const right = t >= tRew0 + 0.5;
  const hp = heroPose(t); placeCar(hero, hp);
  blink(hero, t, false, (!right && t > tInd - 0.1 && t < T_RW1) || (right && t < T_SN1 && t > tRew0));
  traffic.forEach((c, i) => placeCar(c, { x: -LANE, y: 0, z: -120 + 14 * t + i * 60, h: Math.PI, pitch: 0, roll: 0 }));
  const br = 1 + 0.035 * Math.sin(t * 2.2), br2 = 1 + 0.035 * Math.sin(t * 2.2 + 1.7);
  // ---- bears in their default pose
  for (const b of [bearA, bearB]) { b.body.rotation.set(0, 0, 0); b.body.position.set(0, 0, 0); b.body.scale.set(1, 1, 1); b.head.rotation.set(0, 0, 0); b.piv.rotation.set(0, 0, 0); b.root.rotation.set(0, 0, 0); b.paws.forEach(p => p.rotation.set(0, 0, 0)); b.jawG.rotation.x = 0; b.mouth.scale.set(1, 0.001, 1); }
  bearA.root.position.set(PX, 0, ZA); bearA.root.rotation.y = Math.PI; bearA.torso.scale.y = 1.05 * br;
  bearB.root.position.set(PX, 0, ZB); bearB.torso.scale.y = 1.05 * br2;
  eyeState(bearA, 0); eyeState(bearB, 0);
  teddyA.root.visible = teddyB.root.visible = false; legs.visible = false;
  if (!right) {
    const bp = bearBPose(t);
    bearB.root.position.set(PX, bp.y, bp.z); bearB.piv.rotation.x = bp.th; bearB.head.rotation.x = bp.head;
    bearB.paws.forEach(p => p.rotation.x = bp.paw);
    const awake = t > tB3 + 0.15 && t < T_PIL1;
    eyeState(bearB, awake ? 1 : 0, false, awake ? 1 : 0);
    // squash 1 + 2
    const s1 = ease(clamp((t - TI1) / 0.18)), s2 = ease(clamp((t - TI2) / 0.18));
    const sy = 1 - 0.5 * s1 - 0.35 * s2, sx = 1 + 0.12 * s1 + 0.14 * s2; hero.scale.set(sx, sy, 1 + 0.05 * s1 + 0.05 * s2);
    // car alarm: hazard + headlights flashing
    const al = t > tCarAl - 0.15 && t < TI2 + 0.25 ? (Math.floor(t * 7) % 2) : 0;
    if (al) { hero.userData.bl.L.emissiveIntensity = 3; hero.userData.bl.R.emissiveIntensity = 3; }
    keyFlash.intensity = 40 * al; keyFlash.position.set(hp.x, 1.2, hp.z);
  } else {
    hero.scale.set(1, 1, 1);
    // teddies fly in, hugs, then roll onto the pavement
    const hug = ease(clamp((t - tHug + 0.1) / 0.5));
    const rl = ease(clamp((t - T_RL0) / (T_RL1 - T_RL0)));
    for (const [b, td, ta, dir] of [[bearA, teddyA, T_TA, -1], [bearB, teddyB, T_TB, 1]]) {
      b.root.position.x = PX + 3.0 * rl; b.root.position.y = 0.0;
      const r = dir * Math.PI * rl; b.body.rotation.z = r; b.body.position.set(Math.sin(r) * 1.0, 1.0 - Math.cos(r) * 1.0, 0);
      b.paws.forEach((p, i) => { p.rotation.x = 0.55 * hug; p.rotation.y = (i ? -1 : 1) * 0.35 * hug; });
      b.head.rotation.x = -0.15 * hug;
      if (t > ta) { td.root.visible = true; placeTeddy(td, b, t, ta, rl); }
    }
    bearA.torso.scale.y = 1.05 * br; bearB.torso.scale.y = 1.05 * br2;
    const oneEye = t > tEye - 0.1 && t < tBackS + 0.25;
    eyeState(bearB, oneEye ? 1 : 0, true, 0);
    // tiptoe legs
    const lf = liftF(t); legs.visible = lf > 0.01; if (legs.visible) poseLegs(t, lf);
    const lk = t > tBeepR - 0.05 && t < tBeepR + 0.5 ? Math.max(0, Math.sin((t - tBeepR) * 20)) : 0; hero.userData.bl.L.emissiveIntensity = Math.max(hero.userData.bl.L.emissiveIntensity, 3 * lk); hero.userData.bl.R.emissiveIntensity = Math.max(hero.userData.bl.R.emissiveIntensity, 3 * lk);
    keyFlash.intensity = 30 * lk; keyFlash.position.set(hp.x, 1.5, hp.z);
  }
  const c = cam(t); camera.near = clamp(c.p.y * 0.3, 0.3, 2.0); camera.updateProjectionMatrix();
  const shake = !right && ((t > TI1 - 0.02 && t < TI1 + 0.3) || (t > TI2 - 0.02 && t < TI2 + 0.3)) ? 0.12 : 0;
  applyCam(c, t, shake);
}

// ---------------- HUD ----------------
function stepCard(t, n, label, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2), k = back((t - a) / 0.35); ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1560 + (n - 1) * 110); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; rr(-330, -44, 660, 88, 22); ctx.fill(); ctx.fillStyle = '#1565c0'; ctx.beginPath(); ctx.arc(-282, 0, 30, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '900 38px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), -282, 2); ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'left'; ctx.font = '900 42px Inter'; ctx.fillText(label, -230, 2); ctx.restore(); }
function zzz(t, b, on) { if (on <= 0.01) return; b.head.updateMatrixWorld(true); const p = project(b.head.localToWorld(V3(0, 0, 0)).add(V3(0, 1.1, 0))); if (p.z > 1) return;
  for (let k = 0; k < 3; k++) { const ph = ((t * 0.55 + k / 3) % 1); ctx.save(); ctx.globalAlpha = on * Math.sin(Math.PI * ph); ctx.translate(p.x + 30 + ph * 70 + 10 * Math.sin(ph * 9), p.y - 20 - ph * 170); ctx.rotate(-0.2); ctx.font = `900 ${40 + k * 16}px Inter`; ctx.lineWidth = 8; ctx.strokeStyle = '#1a237e'; ctx.strokeText('Z', 0, 0); ctx.fillStyle = '#fff'; ctx.fillText('Z', 0, 0); ctx.restore(); } }
function sensor(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2); const lvl = t < tB1 ? 1 : t < tB2 ? 2 : t < tB3 ? 3 : 4; ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1600);
  ctx.fillStyle = 'rgba(12,14,20,0.85)'; rr(-280, -90, 560, 180, 30); ctx.fill(); ctx.fillStyle = '#9aa0a6'; ctx.font = '900 28px Inter'; ctx.textAlign = 'center'; ctx.fillText('PARKING SENSOR', 0, -50);
  const cols = ['#43a047', '#fdd835', '#fb8c00', '#e53935']; for (let i = 0; i < 4; i++) { ctx.fillStyle = i < lvl ? cols[i] : '#333'; rr(-200 + i * 104, -15, 88, 70, 12); ctx.fill(); } ctx.restore(); }
function notes(t, a, b) { if (t < a || t > b) return; const hp = heroPose(t); const p = project(V3(hp.x, 1.8, hp.z)); for (let k = 0; k < 5; k++) { const ph = ((t * 0.45 + k / 5) % 1); ctx.save(); ctx.globalAlpha = win(t, a, b, 0.3) * Math.sin(Math.PI * ph); ctx.translate(p.x + (k - 2) * 50 + 30 * Math.sin(ph * 7 + k), p.y - ph * 260); ctx.font = '900 64px Inter'; ctx.fillStyle = ['#ffeb3b', '#80deea', '#f48fb1'][k % 3]; ctx.lineWidth = 7; ctx.strokeStyle = '#1a237e'; ctx.strokeText(k % 2 ? '♪' : '♫', 0, 0); ctx.fillText(k % 2 ? '♪' : '♫', 0, 0); ctx.restore(); } }
function hud(t) {
  const right = t >= tRew0 + 0.5;
  zzz(t, bearA, right || t > tPerfect ? 1 : 0);
  if (right || t > tPerfect) zzz(t, bearB, right ? (t > tEye - 0.1 && t < tBackS + 0.3 ? 0 : 1) : Math.max(1 - ramp(t, tB2, tB3 + 0.3), ramp(t, T_PIL1 - 0.2, T_PIL1 + 0.3)));
  if (!right) {
    pill('DRIVING TIP: PARALLEL PARKING', W / 2, 420, '#1565c0', '#fff', 42, win(t, 0.25, tPerfect - 0.2, 0.2), back((t - 0.25) / 0.35));
    stepCard(t, 1, 'FIND A GAP', tFind - 0.1, tPerfect - 0.2); stepCard(t, 2, 'INDICATE', tInd - 0.1, tPerfect - 0.2); stepCard(t, 3, 'REVERSE IN SLOWLY', tRev - 0.1, tPerfect - 0.2);
    pill('PERFECT GAP', W / 2, 420, GREEN, '#fff', 50, win(t, tPerfect - 0.1, tSleeping - 0.3, 0.2), back((t - tPerfect + 0.1) / 0.35), iconCheck);
    pill('NEIGHBOURS: 2 SLEEPING BEARS', W / 2, 420, '#6d4c41', '#fff', 42, win(t, tSleeping - 0.3, S('hook2').end + 0.4, 0.2), back((t - tSleeping + 0.3) / 0.35), iconWarn);
    pill('SENSOR: ON', W / 2, 420, RED, '#fff', 52, win(t, tSensor - 0.2, tB1 - 0.1, 0.2), back((t - tSensor + 0.2) / 0.35), iconX);
    sensor(t, tSensor, tBear + 0.3);
    floatText('BEEP', W / 2 - 170, 700, t, tB1, tB1 + 0.6, 90, '#ffeb3b', -0.1); floatText('BEEP', W / 2 + 170, 760, t, tB2, tB2 + 0.6, 100, '#ffb300', 0.1); floatText('BEEEEEP!', W / 2, 700, t, tB3, tB3 + 0.8, 120, '#ff5252', -0.05);
    pill('BEAR THINKS: ALARM CLOCK', W / 2, 420, RED, '#fff', 44, win(t, tThinks - 0.2, tSnz1 - 0.1, 0.2), back((t - tThinks + 0.2) / 0.35), iconWarn);
    pill('SNOOZE', W / 2, 420, '#6d4c41', '#fff', 56, win(t, tSnz1 - 0.1, tCarAl - 0.2, 0.2), back((t - tSnz1 + 0.1) / 0.35));
    floatText('SPLAT!', W / 2, 700, t, TI1, TI1 + 1.0, 140, '#ffd54f', -0.06);
    pill('CAR ALARM: ON', W / 2, 420, RED, '#fff', 52, win(t, tCarAl - 0.2, tSnz2 - 0.1, 0.2), back((t - tCarAl + 0.2) / 0.35), iconWarn);
    floatText('WEE-WOO!', W / 2, 760, t, tCarAl, tCarAl + 1.1, 110, '#ff5252', 0.06);
    pill('SNOOZE AGAIN', W / 2, 420, '#6d4c41', '#fff', 52, win(t, tSnz2 - 0.1, tAndNow - 0.1, 0.2), back((t - tSnz2 + 0.1) / 0.35));
    floatText('SPLAT!!', W / 2, 700, t, TI2, TI2 + 1.0, 150, '#ffd54f', 0.06);
    pill('NEW PILLOW', W / 2, 420, '#8e24aa', '#fff', 54, win(t, tPillow - 0.3, tRew0, 0.2), back((t - tPillow + 0.3) / 0.35), iconHeart);
  } else {
    pill('SENSOR: OFF', W / 2, 420, GREEN, '#fff', 52, win(t, tOff - 0.2, tGive - 0.2, 0.2), back((t - tOff + 0.2) / 0.35), iconCheck);
    pill('TEDDY DELIVERY', W / 2, 420, '#c2185b', '#fff', 50, win(t, tGive - 0.2, tHug - 0.2, 0.2), back((t - tGive + 0.2) / 0.35), iconHeart);
    pill('BEAR HUG', W / 2, 420, '#8e24aa', '#fff', 54, win(t, tHug - 0.2, tRollR - 0.1, 0.2), back((t - tHug + 0.2) / 0.35), iconHeart);
    pill('ROOM MADE', W / 2, 420, GREEN, '#fff', 52, win(t, tRollR - 0.1, tTip - 0.3, 0.2), back((t - tRollR + 0.1) / 0.35), iconCheck);
    pill('TIPTOE MODE: ON', W / 2, 420, '#5e35b1', '#fff', 50, win(t, tTip - 0.3, tLock - 0.2, 0.2), back((t - tTip + 0.3) / 0.35));
    if (t > T_SN0 && t < T_SN1) { const k = Math.min(N_STEP, Math.floor((t - T_SN0) / ((T_SN1 - T_SN0) / N_STEP)) + 1); floatText('tip', W / 2 + (k % 2 ? -150 : 150), 760, t, T_SN0 + (k - 1) * (T_SN1 - T_SN0) / N_STEP, T_SN0 + k * (T_SN1 - T_SN0) / N_STEP, 70, '#b39ddb', k % 2 ? -0.1 : 0.1); }
    pill('LOCK IT · QUIETLY', W / 2, 420, '#1c4fa8', '#fff', 48, win(t, tLock - 0.2, tOops - 0.1, 0.2), back((t - tLock + 0.2) / 0.35));
    floatText('beep', W / 2, 720, t, tBeepR, tBeepR + 0.7, 80, '#ffeb3b', -0.08);
    pill('OOPS', W / 2, 420, '#f57c00', '#fff', 56, win(t, tOops - 0.1, tShh - 0.2, 0.2), back((t - tOops + 0.1) / 0.35));
    pill('SHH... PARKED', W / 2, 420, GREEN, '#fff', 54, win(t, tShh - 0.2, S('right7').start, 0.2), back((t - tShh + 0.2) / 0.35), iconCheck);
  }
}
window.dbg = { heroPose, cam, bearB, bearA, update };
start(update, hud);
