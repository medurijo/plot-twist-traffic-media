// Episode 33: Right before left – a giant tortoise comes from the right
// hook: normal tip at an unmarked crossroads (give way to the right) -> the one coming from the right is a giant tortoise (1 m/min)
// wrong: "it's so slow, I'll go first" -> it saw that: blue light, police tortoise, chasing you -> time-lapse days/months/years,
//        car rusts, a tree grows through it -> it finally catches you: ticket
// right: stop, give way -> you'd wait till Christmas -> fishing rod + strawberry -> turbo tortoise, across in 3 s -> it gets the strawberry, you get the road
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, concreteMat, plane, instanced, makeLandscape, BIG, hemi, sun, SKY,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LANE = 1.75;
// ---------------- timing ----------------
const tSigns = WT('hook1', 'No'), tRule = WT('hook1', 'rule'), tGive = WT('hook1', 'give'), tBut = WT('hook2', 'But'), tToday = WT('hook2', 'today'), tTort = WT('hook2', 'tortoise'), tTop = WT('hook2', 'Top'), tWhat = WT('hook2', 'What');
const tSlow = WT('wrong1', 'slow'), tGo = WT('wrong1', 'go'), tBig = WT('wrong2', 'Big'), tSaw = WT('wrong2', 'saw'), tBlue = WT('wrong2', 'Blue'), tPolice = WT('wrong2', 'police'), tChase = WT('wrong2', 'chasing');
const tSlowly = WT('wrong3', 'Slowly'), tDays = WT('wrong3', 'Days'), tMonths = WT('wrong3', 'Months'), tYears = WT('wrong3', 'Years'), tRust = WT('wrong3', 'rusts'), tTree = WT('wrong3', 'tree'), tUntil = WT('wrong3', 'Until'), tCatch = WT('wrong3', 'catches'), tTicket = WT('wrong3', 'Ticket');
const tStop = WT('right2', 'Stop'), tRules = WT('right2', 'Rules'), tXmas = WT('right3', 'Christmas'), tGrab = WT('right3', 'grab'), tDangle = WT('right3', 'dangle'), tTurbo = WT('right4', 'turbo'), tZoom = WT('right4', 'Zoom'), tAcross = WT('right4', 'Across');
const tGets = WT('right5', 'gets'), tRoad = WT('right5', 'road'), tDrive = WT('right5', 'Drive'), tResp = WT('right6', 'Right');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: unmarked crossroads in a quiet neighbourhood ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 45 || Math.abs(z) < 45, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 50 || Math.abs(z) - d / 2 < 50, near: [0, -40, 200, 260], trees: 1500, seed: 88 });
plane(-3.6, 3.6, -BIG, BIG, asphaltMat, 0.06, 7);
plane(-BIG, -3.6, -3.6, 3.6, asphaltMat, 0.061, 7); plane(3.6, BIG, -3.6, 3.6, asphaltMat, 0.061, 7);
{ const g = new THREE.PlaneGeometry(0.18, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = 8; z < 400; z += 9) { dl.push([0, 0.08, z]); dl.push([0, 0.08, -z]); } instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(3, 0.18); g2.rotateX(-Math.PI / 2); const dl2 = []; for (let x = 8; x < 400; x += 9) { dl2.push([x, 0.08, 0]); dl2.push([-x, 0.08, 0]); } instanced(g2, markMat, dl2, false); }
const paveM = L('#cfc8bb');
for (const sx of [1, -1]) for (const sz of [1, -1]) { // pavement corners
  const m = new THREE.Mesh(new THREE.BoxGeometry(400, 0.16, 3.2), paveM); m.position.set(sx * 203.6, 0.08, sz * 5.2); m.receiveShadow = true; scene.add(m);
  const n = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 400), paveM); n.position.set(sx * 5.2, 0.08, sz * 203.6); n.receiveShadow = true; scene.add(n);
  const c = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 3.2), paveM); c.position.set(sx * 5.2, 0.08, sz * 5.2); scene.add(c); }
// houses with gardens along both roads
const houses = [];
{ const cols = ['#f4d6a0', '#d9a77f', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5d7a99'; c.fillRect(30 + x * 120, 30 + y * 120, 76, 80); c.fillStyle = '#ffffff'; c.fillRect(66 + x * 120, 30 + y * 120, 4, 80); } });
  const hedgeM = L('#3f8a32');
  const addHouse = (x, z, ry, k) => { const c = cols[k % cols.length]; const m = new THREE.Mesh(new THREE.BoxGeometry(9, 6.5, 8), L(c, { map: winT })); m.position.set(x, 3.25, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; scene.add(m);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.3, 3.4, 4, 1), L(['#b0473a', '#7b5e57', '#455a64'][k % 3])); roof.rotation.y = Math.PI / 4 + ry; roof.scale.set(1, 1, 0.9); roof.position.set(x, 8.2, z); roof.castShadow = true; scene.add(roof); houses.push(m); };
  let k = 0;
  for (let d = 14; d < 200; d += 14) { for (const s of [1, -1]) { addHouse(s * 13, d, 0, k++); addHouse(s * 13, -d, 0, k++); addHouse(d, s * 13, Math.PI / 2, k++); addHouse(-d, s * 13, Math.PI / 2, k++); } }
  // garden hedges hide the view to the right (that's why it's tricky)
  for (const [x, z, w, d] of [[-7.6, 9.5, 0.9, 7], [7.6, -9.5, 0.9, 7], [-9.5, -7.6, 7, 0.9]]) { const h = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, d), hedgeM); h.position.set(x, 0.8, z); h.castShadow = true; scene.add(h); } }
// street lamps
for (let d = 10; d < 160; d += 24) for (const [x, z] of [[6.9, d], [-6.9, -d], [d, -6.9], [-d, 6.9]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), STD('#455a64', { metalness: 0.6 })); p.position.set(x, 2.5, z); scene.add(p); const l = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), STD('#fff8e1', { emissive: '#fff3c4', emissiveIntensity: 0.3 })); l.position.set(x, 5.0, z); scene.add(l); }
// parked cars along the north road (where you park in the wrong way)
const pcol = ['#e53935', '#fdd835', '#1e88e5', '#ffffff', '#8e24aa', '#fb8c00'];
[[-4.9, -24], [-4.9, -40], [-4.9, -62], [4.9, -30], [4.9, -70]].forEach(([x, z], i) => { const c = makeCar(pcol[i]); placeCar(c, { x, y: 0, z, h: x < 0 ? Math.PI : 0, pitch: 0, roll: 0 }); });

// ---------------- tortoise (built facing -z) ----------------
const shellT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#5b7f2a'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 4; r++) for (let q = 0; q < 9; q++) { const x = q * 60 + (r % 2) * 30, y = r * 64 + 20; c.fillStyle = r === 0 ? '#3e5f1a' : ['#6f9a33', '#7aa83b', '#668f2e'][(q + r) % 3]; c.strokeStyle = '#2e4712'; c.lineWidth = 7;
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + 0.52; c.lineTo(x + 28 * Math.cos(a), y + 30 * Math.sin(a)); } c.closePath(); c.fill(); c.stroke(); } });
const skinM = STD('#9ccc65', { roughness: 0.8 }), skinD = STD('#7cb342', { roughness: 0.8 });
const tort = new THREE.Group(); scene.add(tort);
const tBody = new THREE.Group(); tort.add(tBody);
{ const sh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), STD('#ffffff', { map: shellT, roughness: 0.6 })); sh.scale.set(2.4, 2.1, 3.0); sh.position.y = 0.95; tBody.add(sh);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 40), STD('#3e5f1a')); rim.rotation.x = Math.PI / 2; rim.scale.set(2.42, 3.02, 2.4); rim.position.y = 0.97; tBody.add(rim);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 30, 12), STD('#e6c46a')); belly.scale.set(2.25, 0.45, 2.85); belly.position.y = 0.9; tBody.add(belly);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 10), skinM); tail.rotation.x = Math.PI / 2 + 0.3; tail.position.set(0, 0.85, 3.15); tBody.add(tail); }
const neck = new THREE.Group(); neck.position.set(0, 1.15, -2.7); tBody.add(neck);
{ const n = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 1.6, 16), skinM); n.rotation.x = Math.PI / 2 - 0.35; n.position.set(0, 0.25, -0.6); neck.add(n); }
const head = new THREE.Group(); head.position.set(0, 0.55, -1.45); neck.add(head);
{ const hm = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 18), skinM); hm.scale.set(0.9, 0.78, 1.15); head.add(hm);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), STD('#ffffff')); e.position.set(s * 0.42, 0.25, -0.38); head.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), STD('#111')); p.position.set(s * 0.5, 0.27, -0.52); head.add(p);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.215, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), skinD); lid.position.copy(e.position); lid.rotation.x = -0.35; head.add(lid); }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 16, Math.PI * 0.8), STD('#33691e')); smile.position.set(0, -0.2, -0.78); smile.rotation.set(0, 0, Math.PI * 1.1); head.add(smile); }
const legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => { const piv = new THREE.Group(); piv.position.set(sx * 1.85, 1.15, sz * 1.9); tBody.add(piv); const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 1.25, 14), skinM); lg.position.y = -0.62; piv.add(lg);
  for (let i = -1; i <= 1; i++) { const toe = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), STD('#f5f5dc')); toe.position.set(i * 0.25, -1.2, -0.5); piv.add(toe); } return { piv, ph: (sx * sz > 0 ? 0 : Math.PI) }; });
// police kit
const lightG = new THREE.Group(); lightG.position.set(0, 3.0, 0); tBody.add(lightG);
const beaconM = new THREE.MeshStandardMaterial({ color: '#1e40ff', emissive: '#2a5bff', emissiveIntensity: 0.2, transparent: true, opacity: 0.92 });
{ const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.2, 16), STD('#212121')); lightG.add(base); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), beaconM); dome.position.y = 0.1; dome.scale.y = 1.3; lightG.add(dome); }
const beaconL = new THREE.PointLight('#3060ff', 0, 14); beaconL.position.set(0, 3.5, 0); tBody.add(beaconL);
const cap = new THREE.Group(); cap.position.set(0, 0.5, 0.05); head.add(cap);
{ const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.32, 18), STD('#1a237e')); c1.position.y = 0.12; cap.add(c1); const vis = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 18, 1, false, -Math.PI / 2, Math.PI), STD('#111')); vis.position.set(0, -0.02, -0.12); cap.add(vis);
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.1, 6), STD('#ffd54f', { metalness: 0.6 })); badge.position.set(0, 0.14, -0.44); badge.rotation.x = -0.15; cap.add(badge); }
const ticket = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(256, 160, (c, w, h) => { c.fillStyle = '#fffde7'; c.fillRect(0, 0, w, h); c.fillStyle = '#c62828'; c.fillRect(0, 0, w, 40); c.fillStyle = '#fff'; c.font = '900 30px Inter'; c.textAlign = 'center'; c.fillText('POLICE', w / 2, 31); c.fillStyle = '#111'; c.font = '900 40px Inter'; c.fillText('TICKET', w / 2, 88); c.font = '800 34px Inter'; c.fillText('€ 50', w / 2, 136); }) }));
ticket.position.set(0, -0.3, -1.05); ticket.rotation.x = -0.2; head.add(ticket);
tort.traverse(o => { if (o.isMesh) o.castShadow = true; });

// ---------------- hero + props ----------------
const hero = makeCar('#35d43a');
const bodyMat = hero.userData.body;
const tree = new THREE.Group(); hero.add(tree); tree.position.set(0.1, 0.6, -0.9);
{ const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 6, 10), STD('#6d4c41')); tr.position.y = 3; tree.add(tr);
  for (const [x, y, z, r] of [[0, 6.6, 0, 2.2], [1.2, 5.6, 0.4, 1.5], [-1.2, 5.8, -0.3, 1.6], [0.3, 7.6, 0.6, 1.4]]) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), L('#4caf50', { flatShading: true })); f.position.set(x, y, z); tree.add(f); }
  tree.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const snow = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 2.4), L('#ffffff')); snow.position.set(0, 1.66, 0.1); hero.add(snow);
const leaves = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.03, 0.16), L('#e67e22'), 40); hero.add(leaves);
{ const o = new THREE.Object3D(); for (let i = 0; i < 40; i++) { o.position.set((hash(i) - 0.5) * 1.8, 1.0 + 0.62 * (hash(i + 3) > 0.5 ? 1 : 0), (hash(i + 7) - 0.5) * 3.8); o.rotation.y = hash(i + 9) * 6; o.updateMatrix(); leaves.setMatrixAt(i, o.matrix); leaves.setColorAt(i, new THREE.Color(['#e67e22', '#c0392b', '#f1c40f'][i % 3])); } }
const arm = new THREE.Group(); arm.position.set(0.86, 1.08, -0.35); hero.add(arm);
{ const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.75, 8), STD('#2b6cb0')); a.position.y = 0.37; arm.add(a); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), STD('#f1c27d')); hd.position.y = 0.78; arm.add(hd); }
const rodM = STD('#795548'), lineM = STD('#eeeeee');
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 1, 8), rodM); scene.add(rod);
const line = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 4), lineM); scene.add(line);
const berry = new THREE.Group(); scene.add(berry);
{ const b = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), STD('#e53935', { roughness: 0.4 })); b.scale.set(1, 1.25, 1); berry.add(b); const lf = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.14, 6), STD('#43a047')); lf.position.y = 0.4; lf.rotation.x = Math.PI; berry.add(lf);
  for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 3), STD('#ffeb3b')); const a = hash(i) * 6.28, y = (hash(i + 5) - 0.5) * 0.6; s.position.set(Math.cos(a) * 0.31, y, Math.sin(a) * 0.31); berry.add(s); } }
function setSeg(m, a, b) { const d = b.clone().sub(a); const l = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, Math.max(0.001, l), 1); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); }
const dust = Array.from({ length: 70 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshStandardMaterial({ color: '#d7ccc8', transparent: true, depthWrite: false })); scene.add(m); return m; });

// ---------------- motion ----------------
const ZSTOP = 6.0, ZPARK = -50, XPARK = 4.5;
const appr = t => ZSTOP + 34 * Math.pow(1 - clamp(t / 5.6), 2.2);
const TX0 = 14.5, TZ0 = -1.0;                         // tortoise waits/crawls on the east road
const crawl = t => TX0 + 2.0 - 2.0 * clamp(t / 30);  // ~1 m per minute (looks static)
// wrong: you go first
const T_GO = tGo - 0.2;
function heroWrong(t) {
  if (t < T_GO) return { x: LANE, y: 0, z: appr(t), h: 0, pitch: 0, roll: 0 };
  const D = ZSTOP - ZPARK, sNow = D * ease(clamp((t - T_GO) / 6.0)), sP = D * ease(clamp((t - T_GO - 0.05) / 6.0));
  const xs = s => lerp(LANE, XPARK, ease(clamp((s - (D - 18)) / 15)));
  const x = xs(sNow), dx = x - xs(sP), dz = -(sNow - sP);
  return { x, y: 0, z: ZSTOP - sNow, h: Math.abs(dz) > 1e-4 ? Math.atan2(-dx, -dz) : 0, pitch: 0, roll: 0 };
}
// tortoise in the wrong way: watches, lights up, turns north and chases (time-lapse)
const T_TURN = tChase - 0.3, LAPSE0 = tSlowly - 0.1, LAPSE1 = tCatch;
const TPATH = [[TX0 + 1.6, TZ0], [2.4, TZ0], [1.8, -12], [0.9, ZPARK - 0.6]];
function tortWrong(t) {
  if (t < T_TURN) return { x: crawl(t), z: TZ0, h: Math.PI / 2, speed: 0.15 };
  if (t < LAPSE0) { const u = ease(clamp((t - T_TURN) / (LAPSE0 - T_TURN))); return { x: lerp(crawl(T_TURN), 13.5, u), z: TZ0, h: Math.PI / 2 + 0.25 * u, speed: 0.4 }; }
  const u = ease(clamp((t - LAPSE0) / (LAPSE1 - LAPSE0)));
  // polyline: east road -> into the junction -> north road up to the parked car
  const P = [[13.5, TZ0], [3.0, TZ0], [1.6, -10], [1.0, ZPARK + 4.3]]; const seg = [0]; for (let i = 1; i < P.length; i++) seg.push(seg[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  let s = u * seg[seg.length - 1], i = 1; while (i < P.length - 1 && seg[i] < s) i++; const k = (s - seg[i - 1]) / (seg[i] - seg[i - 1]);
  const x = lerp(P[i - 1][0], P[i][0], k), z = lerp(P[i - 1][1], P[i][1], k);
  const s2 = Math.min(s + 3, seg[seg.length - 1]); let j = 1; while (j < P.length - 1 && seg[j] < s2) j++; const k2 = (s2 - seg[j - 1]) / (seg[j] - seg[j - 1]); const x2 = lerp(P[j - 1][0], P[j][0], k2), z2 = lerp(P[j - 1][1], P[j][1], k2);
  const h = Math.atan2(-(x2 - x), -(z2 - z)); return { x, z, h: u > 0.999 ? 0 : h, speed: t < LAPSE1 ? 3 : 0.1 };
}
// right: give way, rod + strawberry, turbo crossing
const T_ROD0 = tGrab - 0.1, T_ROD1 = T_ROD0 + 0.9;
const T_Z0 = tZoom - 0.2, T_Z1 = tAcross + 1.4;            // the turbo crossing
const XB0 = TX0 - 6.0, XB1 = -16;                          // strawberry x (nose distance 4.4)
const berryX = t => t < T_Z0 ? XB0 : lerp(XB0, XB1, ease(clamp((t - T_Z0) / (T_Z1 - T_Z0))));
function tortRight(t) {
  if (t < tTurbo) return { x: crawl(t), z: TZ0, h: Math.PI / 2, speed: 0.15 };
  if (t < T_Z0) { return { x: crawl(t) + 0.15 * Math.sin(t * 40) * ramp(t, tTurbo, T_Z0), z: TZ0, h: Math.PI / 2, speed: 4 * ramp(t, tTurbo, T_Z0) }; }
  const x = Math.min(crawl(T_Z0), berryX(t) + 6.0 - 0.6 * ramp(t, T_Z1 - 0.3, T_Z1)); return { x, z: TZ0, h: Math.PI / 2, speed: t < T_Z1 ? 12 : 0.5 };
}
const T_DRV = tDrive - 0.25;
function heroRight(t) {
  if (t < T_DRV) return { x: LANE, y: 0, z: appr(t), h: 0, pitch: 0, roll: 0 };
  const dt = t - T_DRV; return { x: LANE, y: 0, z: ZSTOP - (dt < 2 ? 2 * dt * dt : 8 + 8 * (dt - 2)), h: 0, pitch: 0, roll: 0 };
}
const heroPose = t => isRight(t) ? heroRight(t) : heroWrong(t);
const tortPose = t => isRight(t) ? tortRight(t) : tortWrong(t);

// ---------------- camera ----------------
const Ac = (p, l) => () => [V3(...p), V3(...l)];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2])]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const WIDE = Ac([-4, 13, 20], [8, 0.5, -2]);
const PARKV = Ac([2.0, 7.0, ZPARK - 22], [3.0, 1.0, ZPARK + 20]);
const camKeys = [
  [0.0, Hf([-2.2, 3.4, 10.5], [0.4, 1.0, -14])],
  [tBut - 0.1, Hf([-2.2, 3.4, 10.5], [0.4, 1.0, -14])],
  [tToday + 0.6, t => { const p = heroPose(t); return [V3(p.x - 1.2, 3.4, p.z + 7.5), V3(12, 1.6, -1)]; }],
  ...cut(tTort - 0.15, Ac([4.6, 1.3, -5.2], [12.5, 2.2, -1])),
  [tWhat - 0.3, Ac([5.4, 1.5, -5.6], [12.5, 2.2, -1])],
  ...cut(tWhat - 0.25, WIDE),
  [S('wrong1').start - 0.2, Ac([-4, 13.4, 20.5], [8, 0.5, -2])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Hf([-2.6, 3.4, 10.5], [0.4, 1.0, -14])),
  [tBig - 0.3, Hf([-2.6, 3.4, 10.5], [0.4, 1.0, -14])],
  ...cut(tBig - 0.25, Ac([4.0, 2.6, -7.5], [12.5, 2.4, -1])),
  [tBlue - 0.3, Ac([4.4, 2.6, -7.0], [12.5, 2.6, -1])],
  ...cut(tBlue - 0.25, Ac([5.5, 5.2, -9.5], [12.5, 2.6, -1])),
  [tChase - 0.3, Ac([5.2, 5.0, -9.0], [12.5, 2.4, -1])],
  ...cut(tChase - 0.25, Ac([-2, 8, -15], [9, 1, -1])),
  [LAPSE0 - 0.1, Ac([-2.5, 8.5, -16], [8, 1, -1])],
  ...cut(LAPSE0, PARKV),
  [tCatch - 0.4, Ac([2.2, 6.6, ZPARK - 20], [3.0, 1.0, ZPARK + 18])],
  ...cut(tCatch - 0.35, Ac([-3.2, 2.9, ZPARK - 6.5], [2.8, 1.6, ZPARK + 0.5])),
  [tRew0 + 0.45, Ac([-2.8, 2.8, ZPARK - 6.0], [2.8, 1.6, ZPARK + 0.5])],
  // right
  [tRew0 + 0.55, WIDE],
  [tStop - 0.3, WIDE],
  ...cut(tStop - 0.25, Hf([-2.6, 3.0, 8.5], [0.6, 1.0, -12])),
  [tRules - 0.2, Hf([-2.6, 3.0, 8.5], [0.6, 1.0, -12])],
  ...cut(tRules - 0.15, Ac([2.2, 2.4, -8.5], [12.5, 1.9, -1])),
  [tGrab - 0.3, Ac([2.6, 2.4, -8.8], [12.5, 1.9, -1])],
  ...cut(tGrab - 0.25, Ac([-1.8, 5.0, 14], [7.0, 1.6, -0.5])),
  [tTurbo - 0.2, Ac([-1.6, 5.0, 13.5], [7.5, 1.6, -0.5])],
  ...cut(tTurbo - 0.15, Ac([4.0, 1.4, -6.5], [12.0, 1.6, -1])),
  [T_Z0 - 0.05, Ac([4.2, 1.4, -6.8], [12.0, 1.6, -1])],
  ...cut(T_Z0, t => { const x = tortRight(t).x; return [V3(x - 13, 2.8, -2.2), V3(x - 1, 1.8, -1)]; }),
  [T_Z1, t => { const x = tortRight(t).x; return [V3(x - 13, 2.8, -2.2), V3(x - 1, 1.8, -1)]; }],
  ...cut(tGets - 0.2, Ac([-24, 2.6, -6.5], [-13, 1.8, -1])),
  [tDrive - 0.4, Ac([-24, 2.6, -6.2], [-13, 1.8, -1])],
  ...cut(tDrive - 0.35, Ac([-9, 7, 10], [2, 0.8, -6])),
  [S('right6').start, Ac([-9, 7, 6], [2, 0.8, -10])],
  [S('outro').start, Hf([-6, 7, 12], [0, 1, -6])],
  [TOTAL - 0.3, Hf([-8, 14, 18], [0, 0, -8])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u) };
}

// ---------------- update ----------------
const GREEN0 = new THREE.Color('#35d43a'), RUST = new THREE.Color('#8d4e2a');
let screen = {};
function lapseU(t) { return !isRight(t) ? clamp((t - LAPSE0) / (LAPSE1 - LAPSE0)) : 0; }
function update(t) {
  const right = isRight(t);
  const hp = heroPose(t); placeCar(hero, hp);
  blink(hero, t, false, !right && t > tGo - 1.0 && t < tGo + 3.5);
  // tortoise
  const tp = tortPose(t); tort.position.set(tp.x, 0, tp.z); tort.rotation.y = tp.h;
  const lap = !right && t > LAPSE0 && t < LAPSE1;
  const sp = tp.speed; const ph = lap ? t * 30 : right && t > T_Z0 && t < T_Z1 + 0.2 ? t * 38 : t * (sp > 1 ? 14 : 1.6);
  legs.forEach(l => { l.piv.rotation.x = (sp > 1 ? 0.6 : 0.25) * Math.sin(ph + l.ph); });
  tBody.position.y = (sp > 1 ? 0.12 : 0.03) * Math.abs(Math.sin(ph));
  // head: look at the car when it cheats, look at the strawberry in the right way
  let hy = 0, hx = 0;
  if (!right) { if (t > tSaw - 0.3 && t < T_TURN + 0.4) { hy = -0.55 * win(t, tSaw - 0.3, T_TURN + 0.4, 0.3); } if (t > tCatch - 0.2) { hy = -0.6 * ramp(t, tCatch - 0.2, tCatch + 0.3); } }
  else { if (t > T_ROD1 - 0.2 && t < T_Z1 + 0.5) hx = -0.15 * win(t, T_ROD1 - 0.2, T_Z1 + 0.5, 0.3); }
  neck.rotation.set(hx, hy, 0); head.rotation.set(0, 0, 0);
  // eyelids: sleepy -> wide awake
  head.children.forEach(o => { if (o.geometry && o.geometry.type === 'SphereGeometry' && o.material === skinD) o.rotation.x = (!right && t > tSaw - 0.2 && t < tRew0) || (right && t > tTurbo - 0.2 && t < T_Z1 + 1) ? -1.1 : -0.35; });
  // police kit
  const pol = !right ? back(clamp((t - tBlue + 0.1) / 0.35)) : 0; lightG.scale.setScalar(Math.max(0.001, pol)); lightG.visible = pol > 0.01;
  const flash = pol > 0.5 ? (Math.floor(t * 6) % 2 === 0 ? 1 : 0) : 0; beaconM.emissiveIntensity = 0.2 + 3 * flash; beaconL.intensity = pol > 0.5 ? 18 * flash : 0;
  const capK = !right ? back(clamp((t - tPolice + 0.1) / 0.35)) : 0; cap.scale.setScalar(Math.max(0.001, capK)); cap.visible = capK > 0.01;
  ticket.visible = !right && t > tTicket - 0.25; ticket.scale.setScalar(Math.max(0.001, back(clamp((t - tTicket + 0.25) / 0.3))));
  // time-lapse: day/night, rust, snow, leaves, tree
  const lu = lapseU(t);
  const night = lap ? Math.pow(Math.sin(Math.PI * 4 * clamp((t - LAPSE0) / (LAPSE1 - LAPSE0))), 2) * 0.75 : 0;
  hemi.intensity = 1.3 * (1 - 0.7 * night); sun.intensity = 2.7 * (1 - 0.85 * night);
  scene.background.copy(SKY).lerp(new THREE.Color('#1b2a4a'), night); scene.fog.color.copy(scene.background);
  const rust = !right ? ramp(t, tRust - 0.2, tRust + 0.9) : 0; bodyMat.color.copy(GREEN0).lerp(RUST, rust); bodyMat.roughness = lerp(0.22, 0.9, rust); bodyMat.metalness = lerp(0.45, 0.1, rust);
  hero.userData.wheels.forEach(w => { w.scale.y = 1 - 0.35 * rust; w.position.y = 0.34 - 0.1 * rust; });
  const sn = !right ? win(t, tMonths - 0.05, tYears + 0.1, 0.12) : 0; snow.visible = sn > 0.02; snow.scale.set(1, Math.max(0.01, sn), 1);
  leaves.visible = !right && t > tDays + 0.1 && t < tMonths;
  const tg = !right ? ease(clamp((t - tTree + 0.05) / 1.3)) : 0; tree.visible = tg > 0.01; tree.scale.set(Math.max(0.01, 0.3 + 0.7 * tg), Math.max(0.01, tg), Math.max(0.01, 0.3 + 0.7 * tg));
  // driver arm: takes the ticket
  arm.visible = (!right && t > tTicket - 0.1 && t < tRew0 + 0.5) || (right && t > T_ROD0 - 0.1 && t < tGets + 0.3);
  if (arm.visible) arm.rotation.set(-0.5, 0, -0.9 + 0.1 * Math.sin(t * 5));
  // fishing rod + strawberry
  const rodOn = right && t > T_ROD0 && t < tGets + 0.6; rod.visible = line.visible = rodOn; berry.visible = right && t > T_ROD0 && t < tGets + 0.15;
  if (rodOn) { hero.updateMatrixWorld(true); const base = hero.localToWorld(V3(1.4, 1.9, -0.4)); const ext = ease(clamp((t - T_ROD0) / 0.9)) * (1 - ramp(t, tGets, tGets + 0.5));
    const bx = berryX(t), tip = V3(bx, 3.9, TZ0); const tipE = base.clone().lerp(tip, ext); setSeg(rod, base, tipE);
    const sw = 0.25 * Math.sin(t * 3.1) * (t > T_Z0 && t < T_Z1 ? 0.3 : 1); const bp = tipE.clone().add(V3(sw, -2.3 * ext - 0.2, 0));
    if (t > tGets - 0.05) { const tpp = tortPose(t); tort.updateMatrixWorld(true); const mouth = head.localToWorld(V3(0, -0.15, -0.8)); bp.lerp(mouth, ramp(t, tGets - 0.05, tGets + 0.12)); }
    setSeg(line, tipE, bp); berry.position.copy(bp); berry.rotation.y = t * 1.5; }
  // dust cloud behind the turbo tortoise
  dust.forEach((m, i) => { const born = T_Z0 + (i / dust.length) * (T_Z1 - T_Z0 + 0.4); const a = (t - born) / 1.4; m.visible = right && a > 0 && a < 1; if (!m.visible) return;
    const x = tortRight(born).x + 3; m.position.set(x + (hash(i) - 0.5) * 2 + a * 1.5, 0.4 + a * 1.6 * hash(i + 3), TZ0 + (hash(i + 5) - 0.5) * 4 * (0.4 + a)); m.scale.setScalar(0.8 + 2.6 * a); m.material.opacity = 0.6 * (1 - a); });
  const c = cam(t); camera.near = clamp(c.p.y * 0.3, 0.3, 1.5); camera.updateProjectionMatrix();
  applyCam(c, t, right && t > T_Z0 && t < T_Z1 ? 0.04 : 0);
  camera.updateMatrixWorld(true); tort.updateMatrixWorld(true); hero.updateMatrixWorld(true);
  screen = { head: project(head.localToWorld(V3(0, 1.0, 0))), tort: project(tort.localToWorld(V3(0, 3.6, 0))), car: project(hero.localToWorld(V3(0, 2.0, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function junctionCard(t, a, b) { // little "give way to the right" diagram, tutorial style
  if (t < a || t > b) return; const f = win(t, a, b, 0.25), k = back((t - a) / 0.4);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1600); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; rr(-210, -190, 420, 380, 36); ctx.fill();
  ctx.fillStyle = '#546e7a'; ctx.fillRect(-45, -160, 90, 320); ctx.fillRect(-180, -45, 360, 90);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.setLineDash([16, 14]); ctx.beginPath(); ctx.moveTo(0, -160); ctx.lineTo(0, -48); ctx.moveTo(0, 48); ctx.lineTo(0, 160); ctx.moveTo(-180, 0); ctx.lineTo(-48, 0); ctx.moveTo(48, 0); ctx.lineTo(180, 0); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#35d43a'; rr(4, 70, 34, 60, 8); ctx.fill(); ctx.fillStyle = '#1e63d6'; rr(80, -38, 60, 34, 8); ctx.fill();
  ctx.fillStyle = '#16a34a'; ctx.font = '900 40px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(130, -60); ctx.lineTo(-60, -60); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, -80); ctx.lineTo(-90, -60); ctx.lineTo(-60, -40); ctx.fill();
  ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.arc(21, 155, 18, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(10, 151, 22, 8);
  ctx.restore();
}
function lapseHud(t) {
  if (isRight(t) || t < tDays - 0.1 || t > tCatch + 0.2) return;
  let label = 'DAY 1'; if (t > tDays) label = 'DAY ' + (1 + Math.floor(ramp(t, tDays, tMonths) * 29)); if (t > tMonths) label = 'MONTH ' + (1 + Math.floor(ramp(t, tMonths, tYears) * 11)); if (t > tYears) label = 'YEAR ' + (1 + Math.floor(ramp(t, tYears, tCatch) * 6));
  pill('⏳  ' + label, W / 2, 420, '#263238', '#fff', 56, win(t, tDays - 0.1, tCatch + 0.2, 0.2));
  const dist = Math.max(0, Math.round(lerp(55, 0, ease(clamp((t - LAPSE0) / (LAPSE1 - LAPSE0))))));
  pill('POLICE TORTOISE: ' + dist + ' M BEHIND', W / 2, 1620, '#1a237e', '#fff', 40, win(t, tDays - 0.1, tCatch + 0.2, 0.2));
}
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('DRIVING TIP: UNMARKED CROSSROADS', '#1565c0', 0.25, tBut - 0.1, 40);
    P_('GIVE WAY TO THE RIGHT', GREEN, tRule - 0.1, tBut - 0.1, 48, iconCheck, 520);
    junctionCard(t, tSigns, tBut + 0.2);
    P_('FROM THE RIGHT: GIANT TORTOISE', '#2e7d32', tTort - 0.2, tTop - 0.1, 42, iconWarn);
    P_('TOP SPEED: 1 M / MIN', '#e65100', tTop - 0.1, S('hook2').end + 0.4, 48);
    P_('TOO SLOW? GO FIRST', RED, tSlow - 0.2, tBig - 0.2, 46, iconX);
    P_('IT SAW THAT', '#424242', tSaw - 0.2, tBlue - 0.2, 48);
    P_('POLICE TORTOISE', '#1a237e', tBlue - 0.1, tChase - 0.1, 50);
    P_('PURSUIT: ACTIVE (VERY SLOW)', '#1a237e', tChase - 0.1, tDays - 0.15, 42);
    lapseHud(t);
    if (screen.tort && screen.tort.ok && t > tBlue && t < tChase + 0.4) floatText('WEE-OOO', clamp(screen.tort.x, 220, W - 220), clamp(screen.tort.y - 60, 560, 1100), t, tBlue + 0.1, tBlue + 1.3, 80, '#82b1ff', -0.08);
    floatText('RUST', W / 2 - 180, 900, t, tRust, tRust + 1.0, 100, '#ffab91', -0.1);
    floatText('GOTCHA.', W / 2, 760, t, tCatch, tCatch + 1.0, 120, '#ffffff', -0.05);
    P_('TICKET: €50  +  7 YEARS LATE', RED, tTicket - 0.1, tRew0, 42);
  } else {
    P_('STOP · GIVE WAY', GREEN, tStop - 0.2, tXmas - 0.3, 52, iconCheck);
    P_('ARRIVAL: DECEMBER 24', '#c62828', tXmas - 0.2, tGrab - 0.2, 46);
    P_('🎣  STRAWBERRY ON A STICK', '#ad1457', tGrab - 0.1, tTurbo - 0.15, 44);
    P_('TURBO TORTOISE', '#e65100', tTurbo - 0.1, tZoom, 52);
    floatText('ZOOM!', W / 2, 720, t, tZoom, tZoom + 1.1, 170, YEL, -0.08);
    P_('CROSSING TIME: 3 SECONDS', '#e65100', tAcross - 0.1, tGets - 0.2, 44);
    if (screen.head && screen.head.ok) floatText('NOM', clamp(screen.head.x, 200, W - 200), clamp(screen.head.y - 40, 560, 1100), t, tGets + 0.1, tGets + 1.1, 90, '#ff8a80', 0.08);
    P_('YOUR TURN: DRIVE ON', GREEN, tRoad - 0.2, tResp - 0.1, 48, iconCheck);
    P_('RIGHT OF WAY: RESPECTED', GREEN, tResp - 0.1, S('right7').start, 46, iconCheck);
  }
}
window.dbg = { heroPose, tortPose, cam };
start(update, hud);
