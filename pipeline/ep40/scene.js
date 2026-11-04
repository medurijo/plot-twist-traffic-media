// Episode 35: Parking – the kerb is a sleeping crocodile
// hook (old style): the perfect parking space, right by the kerb -> the kerb yawns: it's a sleeping crocodile
// wrong: reverse in and bump the kerb -> it wakes up hungry: snap (bumper), crunch (wheel) -> swallows the whole car like a sandwich,
//        burp: only the number plate is left, and you, holding the steering wheel
// right: stop before touching it -> tuck it in with a blanket + lullaby on the radio -> it curls up like a kitten on the pavement ->
//        reverse in gently, not a single bump -> hang a DO NOT DISTURB sign
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, BIG,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tPerfect = WT('hook1', 'perfect'), tRightBy = WT('hook1', 'Right'), tBut = WT('hook2', 'But'), tYawn = WT('hook2', 'yawned'), tSleeping = WT('hook2', 'sleeping'), tWhat = WT('hook2', 'What');
const tReverse = WT('wrong1', 'reverse'), tBump = WT('wrong1', 'bump');
const tBig = WT('wrong2', 'Big'), tWakes = WT('wrong2', 'wakes'), tHungry = WT('wrong2', 'hungry'), tSnap = WT('wrong2', 'Snap'), tBumper = WT('wrong2', 'bumper'), tCrunch = WT('wrong2', 'Crunch'), tWheelW = WT('wrong2', 'wheel');
const tSwallow = WT('wrong3', 'swallows'), tSandwich = WT('wrong3', 'sandwich'), tBurp = WT('wrong3', 'Burp'), tLeft = WT('wrong3', 'left'), tPlate = WT('wrong3', 'plate'), tYou = WT('wrong3', 'you', 1), tSteer = WT('wrong3', 'steering');
const tStop = WT('right2', 'Stop'), tNever = WT('right2', 'Never');
const tTuck = WT('right3', 'tuck'), tBlanket = WT('right3', 'blanket'), tLullaby = WT('right3', 'lullaby');
const tDreams = WT('right4', 'dreams'), tCurls = WT('right4', 'curls'), tKitten = WT('right4', 'kitten'), tLeaves = WT('right4', 'leaves');
const tRev2 = WT('right5', 'Reverse'), tNot = WT('right5', 'Not'), tSingle = WT('right5', 'bump'), tHang = WT('right5', 'hang'), tSign = WT('right5', 'sign');
const tAsleep = WT('right6', 'Crocodile');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: a quiet residential street ----------------
const KX = 4.35;                    // kerb line (right side)
makeLandscape({ avoid: (x, z) => Math.abs(x) < 30 && Math.abs(z) < 260 || Math.abs(x) < 12, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 32 && Math.abs(z) - d / 2 < 265 || Math.abs(x) - w / 2 < 14, near: [0, 0, 120, 500], trees: 1400, seed: 135 });
plane(-KX, KX, -BIG, BIG, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -400; z < 400; z += 8) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false);
  // parking bay ticks
  const g2 = new THREE.PlaneGeometry(0.9, 0.12); g2.rotateX(-Math.PI / 2); const t2 = []; for (let z = -60; z <= 60; z += 10.4) { t2.push([KX - 0.5, 0.081, z + 5.2]); t2.push([-KX + 0.5, 0.081, z + 5.2]); } instanced(g2, markMat, t2, false); }
const paveM = L('#ffffff', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#d6d0c4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#bdb6a8'; c.lineWidth = 4; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }, [3, 120]) });
for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.15, 900), paveM); p.position.set(s * (KX + 0.3 + 2.0), 0.075, 0); p.receiveShadow = true; scene.add(p); }
const kerbM = STD('#a9a9a3', { roughness: 0.8 });
{ const mk = (x, z0, z1) => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, z1 - z0), kerbM); k.position.set(x, 0.09, (z0 + z1) / 2); k.receiveShadow = true; scene.add(k); };
  mk(KX + 0.16, -450, -5.0); mk(KX + 0.16, 5.0, 450); mk(-KX - 0.16, -450, 450);
  const gut = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 10.2), STD('#8d8d88', { roughness: 0.9 })); gut.position.set(KX + 0.16, 0.03, 0); gut.receiveShadow = true; scene.add(gut); }
// houses with front gardens
{ const cols = ['#f4d6a0', '#d9a77f', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9', '#ffe0b2'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5d7a99'; c.fillRect(30 + x * 120, 30 + y * 120, 76, 80); c.fillStyle = '#ffffff'; c.fillRect(66 + x * 120, 30 + y * 120, 4, 80); } });
  let k = 0; for (let z = -140; z <= 140; z += 13) for (const s of [1, -1]) { const c = cols[k % cols.length];
    const m = new THREE.Mesh(new THREE.BoxGeometry(8, 6.5, 9), L(c, { map: winT })); m.position.set(s * 16.5, 3.25, z + (s > 0 ? 0 : 6)); m.castShadow = m.receiveShadow = true; scene.add(m);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.4, 3.4, 4, 1), L(['#b0473a', '#7b5e57', '#455a64'][k % 3])); roof.rotation.y = Math.PI / 4; roof.position.set(m.position.x, 8.2, m.position.z); roof.castShadow = true; scene.add(roof);
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 9), L('#3f8a32')); hd.position.set(s * 10.6, 0.5, m.position.z); hd.castShadow = true; scene.add(hd); k++; } }
// street trees + lamps on the pavement
for (let z = -120; z <= 120; z += 18) for (const s of [1, -1]) { if (s > 0 && Math.abs(z - 0) < 14) continue;
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.8, 8), L('#6d4a2b')); tr.position.set(s * 7.6, 1.4, z + 9); tr.castShadow = true; scene.add(tr);
  const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), L('#4fa336', { flatShading: true })); cr.position.set(s * 7.6, 3.7, z + 9); cr.castShadow = true; scene.add(cr); }
// parked cars: the gap is z in [-5.2, 5.2] on the right side
const pcol = ['#e53935', '#fdd835', '#1e88e5', '#ffffff', '#8e24aa', '#fb8c00', '#455a64', '#00897b'];
{ let i = 0; for (const z of [-7.4, -17.8, -28.2, -38.6, 11.0, 21.4, 31.8, 42.2]) { const c = makeCar(pcol[i++ % pcol.length]); placeCar(c, { x: KX - 1.2, y: 0, z, h: 0, pitch: 0, roll: 0 }); }
  for (const z of [-20, -9, 3, 14, 26, 40]) { const c = makeCar(pcol[i++ % pcol.length]); placeCar(c, { x: -KX + 1.2, y: 0, z, h: Math.PI, pitch: 0, roll: 0 }); } }

// ---------------- the crocodile (spine of segments, head at +z) ----------------
const NS = 16;
const scuteT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#7f9468'; c.fillRect(0, 0, w, h); for (let y = 0; y < 3; y++) for (let x = 0; x < 6; x++) { c.fillStyle = ['#8ea377', '#879c70', '#95a97e'][(x + y) % 3]; c.fillRect(x * 43 + (y % 2) * 20 - 10, y * 43 + 4, 38, 36); } });
const skinM = STD('#ffffff', { map: scuteT, roughness: 0.75 }), bellyM = STD('#d9d3a0', { roughness: 0.8 }), darkM = STD('#5e7149', { roughness: 0.8 });
const wS = s => 0.07 + 0.62 * Math.pow(1 - s, 0.55) * (s < 0.08 ? 0.85 + 2 * s : 1);   // body half-width profile (s: 0 neck -> 1 tail)
const segs = Array.from({ length: NS }, (_, i) => { const g = new THREE.Group(); scene.add(g);
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), skinM); g.add(m); m.castShadow = true; m.receiveShadow = true;
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), bellyM); g.add(b);
  const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 4), darkM); ridge.position.y = 1; g.add(ridge);
  const quilt = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 1), STD(['#e57373', '#fff59d', '#81d4fa', '#ce93d8'][i % 4], { roughness: 0.9 })); g.add(quilt);
  return { g, m, b, ridge, quilt }; });
const SL = 0.62;                                   // spine spacing (m)
const head = new THREE.Group(); scene.add(head);
const jawU = new THREE.Group(), jawL = new THREE.Group(); head.add(jawU); head.add(jawL);
{ const snout = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 1.25), skinM); snout.position.set(0, 0.06, 0.62); jawU.add(snout);
  const sn2 = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.22, 16, 1, false, 0, Math.PI), skinM); sn2.rotation.set(0, -Math.PI / 2, 0); sn2.position.set(0, 0.06, 1.24); sn2.rotation.order = 'YXZ'; jawU.add(sn2);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 12), skinM); skull.scale.set(1, 0.6, 0.9); skull.position.set(0, 0.08, -0.05); jawU.add(skull);
  const lo = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 1.3), bellyM); lo.position.set(0, -0.06, 0.6); jawL.add(lo);
  const lo2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 1.3), skinM); lo2.position.set(0, -0.15, 0.6); jawL.add(lo2);
  const mouthU = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 1.15), STD('#c2185b')); mouthU.position.set(0, -0.055, 0.6); jawU.add(mouthU);
  const mouthL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 1.15), STD('#e91e63')); mouthL.position.set(0, 0.015, 0.6); jawL.add(mouthL);
  const tooth = new THREE.ConeGeometry(0.035, 0.11, 5), toothM = STD('#fffde7');
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const z = 0.15 + i * 0.16;
    const tu = new THREE.Mesh(tooth, toothM); tu.rotation.x = Math.PI; tu.position.set(s * 0.27, -0.09, z); jawU.add(tu);
    const tl = new THREE.Mesh(tooth, toothM); tl.position.set(s * 0.26, 0.05, z + 0.08); jawL.add(tl); }
  for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), STD('#33412a')); n.position.set(s * 0.09, 0.18, 1.2); jawU.add(n); } }
const eyes = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.2, 0.3, 0.05); jawU.add(g);
  const bump = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), skinM); g.add(bump);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), STD('#ffee58', { emissive: '#ffcc00', emissiveIntensity: 0.25 })); eye.position.set(s * 0.02, 0.04, 0.05); g.add(eye);
  const pup = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.15, 0.03), STD('#111')); pup.position.set(s * 0.025, 0.05, 0.165); g.add(pup);
  const lid = new THREE.Group(); lid.position.set(s * 0.02, 0.04, 0.05); g.add(lid);
  const lm = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), darkM); lid.add(lm);
  const lm2 = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 10, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), darkM); lid.add(lm2);
  return { g, lid, lm, lm2 }; });
// nightcap
const nightcap = new THREE.Group(); nightcap.position.set(0, 0.4, -0.1); jawU.add(nightcap);
{ const c = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.75, 16), STD('#5c6bc0')); c.rotation.x = -0.9; c.position.set(0, 0.12, -0.22); nightcap.add(c);
  const b = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.06, 8, 20), STD('#ffffff')); b.rotation.x = Math.PI / 2 - 0.3; nightcap.add(b);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), STD('#ffffff')); pom.position.set(0, 0.36, -0.55); nightcap.add(pom);
  nightcap.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const legs = [[0.16, -1], [0.16, 1], [0.44, -1], [0.44, 1]].map(([s, side]) => { const g = new THREE.Group(); scene.add(g);
  const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 4, 8), skinM); up.rotation.z = Math.PI / 2; up.position.x = side * 0.2; g.add(up);
  const ft = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), skinM); ft.scale.set(1, 0.45, 1.3); ft.position.set(side * 0.42, -0.12, 0.08); g.add(ft);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, s, side }; });
head.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); head.scale.setScalar(1.3);
// spine curves: straight along the kerb (head at +z) / curled up on the pavement
const STR = s => ({ x: KX + 0.4, z: 3.0 - s * SL * (NS - 1), y: 0.0 });
const CC = { x: 6.35, z: -0.3 };
const CUR = s => { const a = 0.55 + s * Math.PI * 1.7, r = 1.75 - 0.85 * s; return { x: CC.x + r * Math.cos(a), z: CC.z + r * Math.sin(a), y: 0.15 }; };
function spine(s, curl) { const A = STR(s), B = CUR(s); const u = clamp(curl * 1.25 - s * 0.25); const e = ease(u); return { x: lerp(A.x, B.x, e), z: lerp(A.z, B.z, e), y: lerp(A.y, B.y, ease(clamp(curl * 1.6))) + 0.25 * Math.sin(Math.PI * e) }; }
// crocodile state from time: curl, eye open, jaw, head yaw/pitch/lunge, bulge
function crocState(t) {
  const right = isRight(t); const st = { curl: 0, eye: 0, jaw: 0, yaw: 0, pitch: 0, lunge: 0, bulge: 0, smile: 0, cap: 0, quilt: 0 };
  // hook yawn (still asleep)
  st.jaw = 0.75 * win(t, tYawn - 0.35, tYawn + 1.15, 0.35) * (t < tWhat ? 1 : 0); st.pitch = 0.25 * st.jaw;
  if (!right) {
    if (t > tWakes - 0.15) st.eye = ease(clamp((t - tWakes + 0.15) / 0.25));
    if (t > tHungry - 0.3) { st.pitch = 0.25 * ramp(t, tHungry - 0.3, tHungry + 0.2); st.yaw = -0.45 * ramp(t, tHungry - 0.3, tHungry + 0.3); st.jaw = 0.5 * win(t, tHungry - 0.1, tSnap - 0.4, 0.25); }
    const bite = (tb, yaw, lunge) => { const w = win(t, tb - 0.55, tb + 0.6, 0.3); st.yaw = lerp(st.yaw, yaw, w); st.lunge = Math.max(st.lunge, lunge * w); if (t > tb - 0.5 && t < tb + 0.1) st.jaw = Math.max(st.jaw, 0.9 * ramp(t, tb - 0.5, tb - 0.25) * (1 - ramp(t, tb - 0.08, tb + 0.02))); };
    bite(tSnap + 0.05, -0.9, 0.6); bite(tCrunch + 0.05, -1.25, 0.75);
    if (t > tBumper && t < tSwallow) st.jaw = Math.max(st.jaw, 0.12 * Math.abs(Math.sin((t - tBumper) * 9)));   // chewing
    if (t > tSwallow - 0.6) { const w = win(t, tSwallow - 0.6, tSandwich + 0.15, 0.3); st.yaw = lerp(st.yaw, -1.05, w); st.pitch = lerp(st.pitch, 0.35, w); st.lunge = Math.max(st.lunge, 0.55 * w);
      if (t < tSandwich + 0.1) st.jaw = Math.max(st.jaw, 1.0 * ramp(t, tSwallow - 0.5, tSwallow - 0.1) * (1 - ramp(t, tSandwich - 0.05, tSandwich + 0.08))); }
    if (t > tSandwich) st.bulge = easeOut(clamp((t - tSandwich + 0.1) / 0.35));
    if (t > tBurp - 0.15) { const w = win(t, tBurp - 0.15, tBurp + 0.9, 0.2); st.jaw = Math.max(st.jaw, 0.85 * w); st.pitch = Math.max(st.pitch, 0.5 * w); st.yaw = lerp(st.yaw, -0.6, w); }
    if (t > tBurp + 0.8) { st.yaw = -0.35; st.pitch = 0.1; st.smile = 1; st.eye = 0.55; }
  } else {
    st.quilt = clamp((t - tTuck + 0.1) / 1.4); st.cap = back(clamp((t - tBlanket - 0.1) / 0.4));
    st.smile = ramp(t, tLullaby, tLullaby + 0.8);
    st.curl = ease(clamp((t - tCurls + 0.25) / 1.9));
    st.pitch = -0.05; st.yaw = 0.15 * Math.sin(t * 0.8) * st.smile;
  }
  return st;
}

// ---------------- hero, driver, props ----------------
const hero = makeCar('#35d43a');
const plateT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h); c.fillStyle = '#1e40af'; c.fillRect(0, 0, 30, h); c.strokeStyle = '#111'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#111'; c.font = '900 42px Inter'; c.textAlign = 'center'; c.fillText('PTT 35', w / 2 + 14, 47); });
const plateM = new THREE.MeshStandardMaterial({ map: plateT, roughness: 0.4, side: THREE.DoubleSide });
const plateOn = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.13), plateM); plateOn.position.set(0, 0.58, 2.205); hero.add(plateOn);
const bumpers = hero.userData.bodyG.children.filter(o => o.geometry && o.geometry.type === 'BoxGeometry' && Math.abs(o.position.z - 2.15) < 0.05 && Math.abs(o.position.y - 0.42) < 0.05);
const tailL = hero.userData.bodyG.children.filter(o => o.material === hero.userData.tl);
const RRW = hero.userData.wheels.find(w => w.position.x > 0 && w.position.z > 0);
const plateFly = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.13), plateM); scene.add(plateFly); plateFly.castShadow = true;
function makePerson(shirt, pants = '#37474f', skinC = '#f1c27d') {
  const g = new THREE.Group(); const skin = STD(skinC), sh = STD(shirt), pm = STD(pants);
  const tor = new THREE.Group(); tor.position.y = 0.92; g.add(tor);
  const torM = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.42, 4, 12), sh); torM.position.y = 0.28; tor.add(torM);
  const hd = new THREE.Group(); hd.position.y = 0.76; tor.add(hd); hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), skin));
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), STD('#4e342e')); hair.position.y = 0.03; hd.add(hair);
  for (const s of [-1, 1]) { const ew = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), STD('#fff')); ew.position.set(s * 0.065, 0.04, -0.15); hd.add(ew); const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), STD('#111')); e.position.set(s * 0.065, 0.04, -0.19); hd.add(e); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12), STD('#6d2b1f')); mouth.position.set(0, -0.07, -0.17); hd.add(mouth);
  for (const s of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.92, 0); g.add(hip); const th = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.9, 8), pm); th.position.y = -0.45; hip.add(th); const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.26), STD('#111')); shoe.position.set(0, -0.9, -0.05); hip.add(shoe); }
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.28, 0.5, 0); tor.add(a); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.58, 8), sh); m.position.y = -0.29; a.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), skin); h.position.y = -0.62; a.add(h); return a; });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return { g, tor, hd, arms };
}
const drv = makePerson('#2b6cb0');
const wheelS = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 24), STD('#212121')); drv.tor.add(wheelS); wheelS.position.set(0, 0.25, -0.42);
{ const sp = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.03), STD('#212121')); wheelS.add(sp); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), STD('#e53935')); hub.rotation.x = Math.PI / 2; wheelS.add(hub); }
drv.arms.forEach(a => a.rotation.set(-1.25, 0, 0));
// sign "DO NOT DISTURB"
const signG = new THREE.Group(); scene.add(signG); signG.position.set(5.0, 0.15, 2.7);
{ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8), STD('#795548')); p.position.y = 0.75; signG.add(p);
  const st = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#fff8e1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#5d4037'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14); c.fillStyle = '#c62828'; c.font = '900 72px Inter'; c.textAlign = 'center'; c.fillText('DO NOT', w / 2, 100); c.fillText('DISTURB', w / 2, 180); c.fillStyle = '#5c6bc0'; c.font = '800 40px Inter'; c.fillText('z z z', w / 2, 232); });
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.04), [STD('#fff8e1'), STD('#fff8e1'), STD('#fff8e1'), STD('#fff8e1'), STD('#fff', { map: st }), STD('#fff', { map: st })]); b.position.y = 1.45; b.rotation.y = -0.5; signG.add(b);
  signG.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- hero motion ----------------
const XA = 1.25, ZA = -9.6, XP = 3.05, ZP = 0.2;
const appr = t => ZA - 40 * Math.pow(1 - clamp(t / 3.2), 2.0) * -1;      // drives in from +z, stops at ZA
const revPath = u => ({ x: lerp(XA, XP, ease(clamp((u - 0.15) / 0.8))), z: lerp(ZA, ZP, ease(u)) });
function revPose(u, du = 0.01) { const a = revPath(u), b = revPath(Math.min(1, u + du)); const dx = b.x - a.x, dz = b.z - a.z; return { x: a.x, y: 0, z: a.z, h: Math.hypot(dx, dz) > 1e-5 ? Math.atan2(dx, dz) : 0, pitch: 0, roll: 0 }; }
const T_RV0 = tReverse - 0.3, T_RV1 = tBump + 0.12;
function heroWrong(t) {
  if (t < T_RV0) { const p = revPose(0); p.z = appr(t); return p; }
  const u = clamp((t - T_RV0) / (T_RV1 - T_RV0)); const p = revPose(u); if (u >= 1) p.h = 0;
  const bj = win(t, T_RV1 - 0.05, T_RV1 + 0.4, 0.12); p.roll = -0.06 * bj; p.y = 0.05 * bj; return p;
}
const T_RR0 = S('right1').start + 0.9, T_RS = tStop + 0.05, U_STOP = 0.38, T_RR1 = tRev2 - 0.2, T_RR2 = tNot - 0.1;
function heroRight(t) {
  if (t < T_RR0) return revPose(0);
  if (t < T_RR1) { const u = U_STOP * easeOut(clamp((t - T_RR0) / (T_RS - T_RR0))); return revPose(u); }
  const u = lerp(U_STOP, 1, ease(clamp((t - T_RR1) / (T_RR2 - T_RR1)))); const p = revPose(u); if (u > 0.999) p.h = 0; return p;
}
const heroPose = t => isRight(t) ? heroRight(t) : heroWrong(t);

// ---------------- camera ----------------
const Ac = (p, l) => () => [V3(...p), V3(...l)];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2])]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const GAPV = Ac([-5, 7.5, 13], [4, 0, -1.5]);
const HEADC = Ac([1.4, 1.9, 9.8], [4.6, 0.6, 3.6]);
const WHOLE = Ac([1.6, 6.0, 12.0], [4.5, 0.0, -1.2]);
const WIDE = Ac([-6.5, 12.5, 15], [3, 0, -2]);
const REVV = Ac([-5.5, 10, 3], [2.4, 0, -6]);
const camKeys = [
  [0.0, Hf([-1.2, 4.2, 11], [1.0, 0.8, -10])],
  [tPerfect - 0.3, Hf([-1.5, 4.6, 12], [1.0, 0.8, -10])],
  ...cut(tPerfect - 0.25, GAPV),
  [tRightBy - 0.3, Ac([-4.6, 7.2, 12.5], [4, 0, -1.5])],
  ...cut(tRightBy - 0.25, Ac([0.3, 1.9, 9.5], [4.4, 0.3, 0.5])),
  [tBut - 0.1, Ac([0.6, 1.8, 9.0], [4.4, 0.3, 0.5])],
  ...cut(tBut + 0.2, HEADC),
  [tSleeping - 0.4, Ac([1.5, 1.95, 9.5], [4.6, 0.6, 3.6])],
  ...cut(tSleeping - 0.35, WHOLE),
  [tWhat - 0.3, Ac([1.4, 6.3, 12.4], [4.5, 0.0, -1.2])],
  ...cut(tWhat - 0.25, WIDE),
  [S('wrong1').start - 0.2, Ac([-6.7, 12.8, 15.3], [3, 0, -2])],
  // wrong
  ...cut(S('wrong1').start - 0.15, REVV),
  [tBump - 0.45, Ac([-5.0, 9.4, 8.0], [2.7, 0, -3])],
  ...cut(tBump - 0.4, Ac([0.4, 2.1, 9.4], [4.3, 0.7, 2.4])),
  [tWakes - 0.4, Ac([0.6, 2.0, 9.1], [4.3, 0.7, 2.5])],
  ...cut(tWakes - 0.35, Ac([3.0, 1.2, 7.0], [4.5, 0.6, 3.5])),
  [tHungry - 0.2, Ac([2.8, 1.3, 7.2], [4.5, 0.6, 3.5])],
  ...cut(tSnap - 0.6, Ac([-0.6, 3.4, 8.8], [3.6, 0.6, 2.0])),
  [tCrunch - 0.3, Ac([-0.8, 3.4, 8.6], [3.6, 0.5, 1.8])],
  [tSwallow - 0.5, Ac([-2.6, 5.0, 10.5], [3.6, 1.6, 1.0])],
  [tBurp - 0.3, Ac([-2.6, 4.6, 10], [3.6, 1.7, 1.5])],
  ...cut(tLeft - 0.2, Ac([1.3, 1.0, 3.6], [2.05, 0.1, 1.55])),
  [tYou - 0.3, Ac([1.25, 1.05, 3.5], [2.05, 0.1, 1.55])],
  ...cut(tYou - 0.25, Ac([-0.9, 1.75, 2.9], [2.4, 1.0, -0.4])),
  [tSteer + 0.4, Ac([-1.6, 2.6, 4.2], [2.8, 0.8, 0.0])],
  [tRew0, Ac([-3.2, 5.0, 7.5], [3.4, 0.6, 0.0])],
  // right
  [tRew0 + 0.55, WIDE],
  [T_RR0 - 0.3, WIDE],
  ...cut(T_RR0 - 0.25, REVV),
  [tNever - 0.35, Ac([-5.2, 9.6, 3.4], [2.4, 0, -6])],
  ...cut(tNever - 0.3, HEADC),
  [S('right3').start - 0.1, Ac([1.5, 1.95, 9.5], [4.6, 0.6, 3.6])],
  ...cut(tTuck - 0.25, WHOLE),
  [tLullaby - 0.35, Ac([1.4, 6.3, 12.4], [4.5, 0.0, -1.2])],
  ...cut(tLullaby - 0.3, Ac([-3.0, 5.0, -15.5], [3.0, 0.3, -2])),
  [tDreams - 0.1, Ac([-2.6, 4.8, -15], [3.2, 0.3, -1.5])],
  ...cut(tDreams + 0.05, HEADC),
  [tCurls - 0.35, Ac([1.5, 1.95, 9.5], [4.6, 0.6, 3.6])],
  ...cut(tCurls - 0.3, Ac([0.5, 12.5, 7.5], [4.8, 0, -0.4])),
  [tLeaves + 0.4, Ac([0.2, 13.0, 8.0], [4.4, 0, -0.6])],
  ...cut(tRev2 - 0.25, REVV),
  [tNot - 0.4, Ac([-5.0, 9.4, 8.0], [2.7, 0, -3])],
  ...cut(tNot - 0.35, Ac([-0.5, 3.4, 10.5], [4.2, 0.4, 0.2])),
  [tHang - 0.3, Ac([-0.3, 3.3, 10.2], [4.2, 0.4, 0.2])],
  ...cut(tHang - 0.25, Ac([0.4, 3.0, 8.6], [5.4, 0.9, 0.6])),
  [S('right6').start + 0.4, Ac([0.0, 3.4, 9.0], [5.2, 0.8, 0.4])],
  [S('right7').start, Ac([-2.5, 6.5, 11], [4.4, 0.3, -0.5])],
  [S('outro').start, Ac([-4.5, 9.5, 13], [4.2, 0.2, -1])],
  [TOTAL - 0.3, Ac([-7, 15, 17], [4, 0, -2])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u) };
}

// ---------------- update ----------------
let screen = {};
const _v = new THREE.Vector3(), _q2 = new THREE.Quaternion(), UP = V3(0, 1, 0);
function placeCroc(st, t) {
  const pts = []; for (let i = 0; i <= NS; i++) pts.push(spine(i / NS, st.curl));
  // head at the front end, facing away from the body
  const p0 = pts[0], p1 = pts[1]; const fx = p0.x - p1.x, fz = p0.z - p1.z; const hy = Math.atan2(fx, fz);
  const breath = 0.02 * Math.sin(t * 1.6);
  head.position.set(p0.x + Math.sin(hy) * (0.15 + st.lunge * 0.0), 0.5 + p0.y + breath, p0.z + Math.cos(hy) * 0.15);
  head.rotation.set(0, 0, 0); head.rotation.order = 'YXZ'; head.rotation.y = hy + st.yaw; head.rotation.x = -st.pitch;
  if (st.lunge > 0) { head.position.x += Math.sin(hy + st.yaw) * st.lunge; head.position.z += Math.cos(hy + st.yaw) * st.lunge; }
  jawU.rotation.x = -0.55 * st.jaw; jawL.rotation.x = 0.25 * st.jaw;
  eyes.forEach(e => { e.lm.visible = true; e.lm.rotation.x = -1.35 * st.eye; e.lm2.rotation.x = 0.9 * st.eye; });
  nightcap.visible = st.cap > 0.01; nightcap.scale.setScalar(Math.max(0.001, st.cap));
  for (let i = 0; i < NS; i++) {
    const s = (i + 0.5) / NS, a = pts[i], b = pts[i + 1], g = segs[i];
    g.g.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    g.g.rotation.set(0, Math.atan2(a.x - b.x, a.z - b.z), 0);
    let w = wS(s); const bul = st.bulge * Math.exp(-Math.pow((s - 0.32) / 0.13, 2)) * 0.9; w += bul;
    const hgt = w * 0.62 + 0.04 + bul * 0.4; const len = SL * 0.9 + w * 0.6;
    g.m.scale.set(w, hgt, len); g.b.scale.set(w * 1.01, hgt * 1.02, len * 0.98); g.m.position.y = g.b.position.y = hgt * 0.62 + breath * (1 - s);
    g.ridge.position.y = hgt * 1.6 + breath; g.ridge.visible = (i % 2 === 0) && s > 0.08;
    const qv = clamp((st.quilt * 1.3 - (1 - s) * 0.3) * 1.0); const qOn = isRight(t) && s < 0.82 && qv > 0.02;
    g.quilt.visible = qOn; if (qOn) { const k = back(clamp(qv * 2)); g.quilt.scale.set(w * 2.3 * k, 1, SL * 1.05 * k); g.quilt.position.y = hgt * 1.25 + 0.04 + breath; }
  }
  legs.forEach(l => { const k = Math.min(NS - 1, Math.floor(l.s * NS)); const a = pts[k], b = pts[k + 1]; const ry = Math.atan2(a.x - b.x, a.z - b.z);
    l.g.position.set((a.x + b.x) / 2, 0.14 + (a.y + b.y) / 2, (a.z + b.z) / 2); l.g.rotation.set(0, ry, 0); l.g.scale.setScalar(1 + st.bulge * 0.2 * (l.s < 0.3 ? 1 : 0)); });
}
function update(t) {
  const right = isRight(t);
  const st = crocState(t); placeCroc(st, t);
  // hero
  const swallowed = !right && t > tSwallow - 0.2;
  if (swallowed) {
    const u = clamp((t - tSwallow + 0.2) / (tSandwich - tSwallow + 0.1)); const hp = heroWrong(T_RV1 + 1);
    head.updateMatrixWorld(true); const mouth = head.localToWorld(V3(0, 0, 1.6));
    const p = { x: lerp(hp.x, mouth.x, easeIn(u)), y: lerp(0, mouth.y - 0.3, easeIn(u)), z: lerp(hp.z, mouth.z, easeIn(u)), h: lerp(0, -1.2, easeIn(u)), pitch: 0.3 * u, roll: 0.4 * u };
    placeCar(hero, p); hero.scale.setScalar(Math.max(0.001, 1 - 0.85 * easeIn(u))); hero.visible = u < 0.98;
  } else { placeCar(hero, heroPose(t)); hero.scale.setScalar(1); hero.visible = true; }
  // damage: bumper + tail light gone, rear-right wheel gone
  const noB = !right && t > tSnap; bumpers.forEach(b => b.visible = !noB); tailL.forEach(o => o.visible = !noB); plateOn.visible = !noB;
  const noW = !right && t > tCrunch + 0.02; RRW.visible = !noW;
  if (noW && !swallowed) { hero.rotation.z += -0.07; hero.rotation.x += -0.05; hero.position.y -= 0.12; }
  blink(hero, t, false, (!right && t > tReverse - 1.0 && t < T_RV1) || (right && t > T_RR0 - 0.6 && t < T_RR2));
  // flying plate + spat-out driver
  const tSpit = tBurp - 0.05;
  plateFly.visible = !right && t > tSpit; drv.g.visible = !right && t > tSpit;
  if (plateFly.visible) { const u = clamp((t - tSpit) / 0.9); head.updateMatrixWorld(true); const m0 = head.localToWorld(V3(0, 0.1, 1.5)); const P1 = V3(2.05, 0.08, 1.55);
    plateFly.position.set(lerp(m0.x, P1.x, u), lerp(m0.y, P1.y, u) + 2.2 * u * (1 - u) * 2, lerp(m0.z, P1.z, u)); plateFly.rotation.set(u < 1 ? t * 9 : -Math.PI / 2, u < 1 ? t * 5 : 0, u < 1 ? 0 : 0.3);
    const v = clamp((t - tSpit - 0.1) / 1.0); const D0 = m0, D1 = V3(2.35, 0, -0.45);
    drv.g.position.set(lerp(D0.x, D1.x, v), Math.max(0, lerp(D0.y, 0, v) + 3.2 * v * (1 - v)), lerp(D0.z, D1.z, v)); drv.g.rotation.set(v < 1 ? (1 - v) * 6.28 : 0, Math.PI / 2 + 0.25, 0, 'YXZ');
    const sq = v >= 1 ? 1 - 0.12 * Math.exp(-(t - tSpit - 1.1) * 6) * Math.cos((t - tSpit - 1.1) * 25) : 1; drv.g.scale.set(1, sq, 1);
    drv.hd.rotation.z = v >= 1 ? 0.12 * Math.sin(t * 3) : 0; }
  // sign
  const sk = right ? back(clamp((t - tSign + 0.25) / 0.4)) : 0; signG.visible = sk > 0.01; signG.scale.setScalar(Math.max(0.001, sk));
  const c = cam(t); camera.near = clamp(c.p.y * 0.25, 0.25, 1.5); camera.updateProjectionMatrix();
  applyCam(c, t, (!right && (win(t, tSnap - 0.05, tSnap + 0.3, 0.05) + win(t, tCrunch - 0.05, tCrunch + 0.3, 0.05)) > 0) ? 0.06 : 0);
  camera.updateMatrixWorld(true); head.updateMatrixWorld(true); hero.updateMatrixWorld(true);
  screen = { head: project(head.localToWorld(V3(0, 0.6, 0.3))), car: project(hero.localToWorld(V3(0, 1.8, 0))), radio: project(hero.localToWorld(V3(0.6, 1.7, -0.3))), drv: project(drv.g.localToWorld(V3(0, 2.0, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0) => [clamp(p.x, 220, W - 220), clamp(p.y + dy, 560, 1080)];
function zzz(t, a, b) { if (t < a || t > b || !screen.head || !screen.head.ok) return; const [x, y] = cxy(screen.head, -70);
  for (let i = 0; i < 3; i++) { const u = ((t - a) * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = win(t, a, b, 0.3) * Math.sin(Math.PI * u); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1a237e'; ctx.lineWidth = 8; ctx.font = `900 ${50 + 30 * u}px Inter`; ctx.textAlign = 'center';
    ctx.strokeText('Z', x + 40 + u * 90 + i * 8, y - u * 200); ctx.fillText('Z', x + 40 + u * 90 + i * 8, y - u * 200); ctx.restore(); } }
function notes(t, a, b) { if (t < a || t > b || !screen.radio || !screen.radio.ok) return; const [x0, y0] = cxy(screen.radio, -20);
  for (let i = 0; i < 5; i++) { const u = ((t - a) * 0.5 + i / 5) % 1; const x = x0 + 260 * u + 50 * Math.sin(u * 9 + i), y = y0 - 300 * u; ctx.save(); ctx.globalAlpha = win(t, a, b, 0.3) * Math.sin(Math.PI * u);
    ctx.fillStyle = ['#ffd54f', '#f48fb1', '#80deea'][i % 3]; ctx.strokeStyle = '#263238'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(x, y, 20, 15, -0.4, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillRect(x + 15, y - 62, 7, 62); ctx.strokeRect(x + 15, y - 62, 7, 62);
    ctx.beginPath(); ctx.moveTo(x + 22, y - 62); ctx.quadraticCurveTo(x + 50, y - 50, x + 40, y - 24); ctx.lineWidth = 7; ctx.strokeStyle = ctx.fillStyle; ctx.stroke(); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('THE PERFECT SPACE', GREEN, tPerfect - 0.1, tBut - 0.1, 50, iconCheck);
    floatText('YAWN...', W / 2, 760, t, tYawn - 0.2, tSleeping - 0.1, 110, '#ffffff', -0.06);
    P_('KERB: CROCODILE (ASLEEP)', '#2e7d32', tSleeping - 0.15, S('hook2').end + 0.3, 44, iconWarn);
    zzz(t, tSleeping, tWhat + 0.6);
    P_('REVERSE IN. BUMP.', RED, tReverse - 0.2, tBig - 0.2, 48, iconX);
    floatText('BONK', W / 2 + 160, 900, t, tBump + 0.05, tBump + 0.9, 110, '#ffab91', 0.1);
    P_('CROCODILE: AWAKE', '#e65100', tWakes - 0.1, tHungry - 0.1, 50, iconWarn);
    P_('HUNGER LEVEL: 100%', RED, tHungry - 0.1, tSnap - 0.25, 48);
    floatText('SNAP!', W / 2, 760, t, tSnap - 0.02, tSnap + 0.8, 170, '#ffffff', -0.08);
    P_('BUMPER: GONE', RED, tBumper - 0.2, tCrunch - 0.1, 50);
    floatText('CRUNCH!', W / 2, 760, t, tCrunch - 0.02, tCrunch + 0.85, 160, YEL, 0.07);
    P_('WHEEL: GONE', RED, tWheelW - 0.2, tSwallow - 0.3, 50);
    P_('CAR SANDWICH', '#bf360c', tSandwich - 0.4, tBurp - 0.1, 52);
    floatText('BURP!', W / 2, 760, t, tBurp - 0.02, tBurp + 0.9, 190, '#c5e1a5', -0.06);
    P_('LEFT: 1 NUMBER PLATE', '#37474f', tLeft - 0.1, tYou - 0.1, 46);
    P_('+ 1 STEERING WHEEL', '#37474f', tYou - 0.1, tRew0, 46);
  } else {
    P_('STOP. DON\'T TOUCH IT.', GREEN, tStop - 0.2, tNever - 0.15, 48, iconCheck);
    P_('NEVER WAKE A CROCODILE', '#2e7d32', tNever - 0.1, S('right3').start, 44, iconWarn);
    zzz(t, tNever, tCurls + 2.5);
    P_('TUCKED IN', '#5c6bc0', tBlanket - 0.3, tLullaby - 0.3, 50, iconCheck);
    P_('RADIO: LULLABY', '#ad1457', tLullaby - 0.2, tCurls - 0.3, 50);
    notes(t, tLullaby - 0.1, tLeaves + 0.5);
    P_('CURLED UP LIKE A KITTEN', '#5c6bc0', tCurls - 0.1, tLeaves - 0.1, 44);
    P_('THE WHOLE SPACE: YOURS', GREEN, tLeaves - 0.1, tRev2 - 0.2, 46, iconCheck);
    P_('GENTLY...', '#00897b', tRev2 - 0.1, tNot - 0.1, 52);
    P_('BUMPS: 0', GREEN, tNot - 0.1, tHang - 0.2, 54, iconCheck);
    zzz(t, tHang, TOTAL);
    P_('CROCODILE: STILL ASLEEP', GREEN, tAsleep - 0.1, S('right7').start, 44, iconCheck);
  }
}
window.dbg = { heroPose, crocState, cam };
start(update, hud);
