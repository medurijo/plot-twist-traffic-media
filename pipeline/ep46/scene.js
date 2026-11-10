// Episode 41: Multi-storey car park – the barrier is a giraffe
// hook (old style): city centre, one space left in the multi-storey car park -> the barrier isn't a barrier: it's a giraffe.
// wrong: honk -> the giraffe jumps up in fright, its neck goes straight through all four floors -> it walks off wearing the
//        car park like a scarf, every car still inside -> you: still no parking space (FREE: 0)
// right: take the little tree air freshener off your mirror, hold it out of the window -> the giraffe sees a tree, up goes the neck
//        -> one nibble, pine flavour, its favourite -> as thanks it lifts your car all the way up into the last space on the roof
//        -> perfect parking, free ticket
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, makeWheel,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, sun
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tCity = WT('hook1', 'City'), tOne = WT('hook1', 'One'), tLeft = WT('hook1', 'left'), tIn = WT('hook1', 'In'), tMulti = WT('hook1', 'multi');
const tBut = WT('hook2', 'But'), tBarrier = WT('hook2', 'barrier'), tIsnt = WT('hook2', "isn't"), tIts = WT('hook2', "It's"), tGir = WT('hook2', 'giraffe'), tWhat = WT('hook2', 'What');
const tHonk = WT('wrong1', 'honk'), tReally = WT('wrong1', 'Really'), tLoudly = WT('wrong1', 'loudly');
const tBig = WT('wrong2', 'Big'), tThe2 = WT('wrong2', 'The'), tJumps = WT('wrong2', 'jumps'), tFright = WT('wrong2', 'fright'), tStraight = WT('wrong2', 'Straight'), tFour = WT('wrong2', 'four'), tFloors = WT('wrong2', 'floors');
const tNow = WT('wrong3', 'Now'), tWalks = WT('wrong3', 'walks'), tWearing = WT('wrong3', 'wearing'), tScarf = WT('wrong3', 'scarf'), tWith = WT('wrong3', 'With'), tEvery = WT('wrong3', 'every'), tAndY = WT('wrong3', 'And'), tStill = WT('wrong3', 'Still'), tSpace = WT('wrong3', 'space');
const tTake = WT('right2', 'Take'), tTree = WT('right2', 'tree'), tMirror = WT('right2', 'mirror'), tHold = WT('right2', 'hold'), tWindow = WT('right2', 'window');
const tGir3 = WT('right3', 'giraffe'), tSees = WT('right3', 'sees'), tTree3 = WT('right3', 'tree'), tUp = WT('right3', 'Up'), tNeck = WT('right3', 'neck');
const tOneN = WT('right4', 'One'), tNibble = WT('right4', 'nibble'), tPine = WT('right4', 'Pine'), tFav = WT('right4', 'favourite');
const tAnd5 = WT('right5', 'And'), tThank = WT('right5', 'thank'), tLifts = WT('right5', 'lifts'), tAll5 = WT('right5', 'all'), tUp5 = WT('right5', 'up'), tInto = WT('right5', 'Into'), tLast = WT('right5', 'last'), tRoof = WT('right5', 'roof');
const tPerfect = WT('right6', 'Perfect'), tFree = WT('right6', 'Free'), tTicket = WT('right6', 'ticket');
const isRight = t => t >= tRew0 + 0.5;
const treeW = new THREE.Vector3(-3.9, 1.3, 5.3);

function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}

// ---------------- world: city block ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 120 && Math.abs(z) < 120, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 130 && Math.abs(z) - d / 2 < 130, near: [0, 0, 10, 10], trees: 900, seed: 411 });
plane(-120, 120, -120, 120, L('#b9b3a8'), 0.02, 40);           // pavement
plane(-6.0, 1.6, 3.5, 120, asphaltMat, 0.05, 7);                // access road
plane(-120, 120, 12, 22, asphaltMat, 0.05, 7);                  // street
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let x = -118; x < 118; x += 7) dl.push([x, 0.07, 17, Math.PI / 2]); instanced(g, markMat, dl, false); }
// city buildings around
{ const R = rng(23); const cols = ['#e0d6c8', '#cfd8dc', '#f0e2c6', '#d7ccc8', '#bcc6cc', '#e8d1b5', '#c5cae9'];
  const winT = canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#5b7a96'; for (let y = 12; y < h; y += 32) for (let x = 10; x < w; x += 30) c.fillRect(x, y, 18, 20); }, true);
  const spots = [];
  for (let i = 0; i < 70; i++) { const x = (R() - 0.5) * 200, z = (R() - 0.5) * 200; const w = 8 + R() * 10, d = 8 + R() * 10, h = 8 + R() * 24;
    if (Math.abs(x) < 16 + w / 2 && z > -22 - d / 2 && z < 30 + d / 2) continue; if (z > 9 - d / 2 && z < 25 + d / 2) continue; if (x > -10 - w / 2 && x < 5 + w / 2 && z > 0) continue;
    const t = winT.clone(); t.repeat.set(Math.round(w / 3), Math.round(h / 3)); t.needsUpdate = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), L(cols[i % cols.length], { map: t })); b.position.set(x, h / 2, z); b.castShadow = true; b.receiveShadow = true; scene.add(b); } }

// ground floor slab (stays when the car park walks off): hatched NO PARKING
const PX0 = -6.5, PX1 = 6.5, PZ0 = -8.0, PZ1 = 3.5;
{ const gt = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#9e9e9e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffd60a'; c.lineWidth = 16; for (let k = -w; k < 2 * w; k += 60) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + h, h); c.stroke(); }
    c.fillStyle = '#9e9e9e'; c.fillRect(110, 200, 292, 112); c.fillStyle = '#ffd60a'; c.font = '900 50px Inter'; c.textAlign = 'center'; c.fillText('NO', w / 2, 248); c.fillText('PARKING', w / 2, 300); });
  const g = new THREE.Mesh(new THREE.BoxGeometry(PX1 - PX0, 0.1, PZ1 - PZ0), [L('#888'), L('#888'), L('#fff', { map: gt }), L('#888'), L('#888'), L('#888')]); g.position.set((PX0 + PX1) / 2, 0.05, (PZ0 + PZ1) / 2); g.receiveShadow = true; scene.add(g); }
// "FREE" counter sign at the entrance
const signC = document.createElement('canvas'); signC.width = 256; signC.height = 320; const signT = new THREE.CanvasTexture(signC); signT.colorSpace = THREE.SRGBColorSpace; let signS = '';
function drawSign(n) { const s = 'F' + n; if (s === signS) return; signS = s; const c = signC.getContext('2d'); c.fillStyle = '#0d47a1'; c.fillRect(0, 0, 256, 320); c.fillStyle = '#fff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.fillText('P', 128, 140);
  c.fillStyle = '#111'; c.fillRect(20, 170, 216, 130); c.fillStyle = n > 0 ? '#39ff4a' : '#ff1744'; c.font = '900 46px Inter'; c.fillText('FREE', 128, 218); c.font = '900 76px Inter'; c.fillText(String(n), 128, 290); signT.needsUpdate = true; }
drawSign(1);
{ const sg = new THREE.Group(); sg.position.set(-6.8, 0, 6.5); scene.add(sg); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.7, 8), STD('#90a4ae', { metalness: 0.6 })); pole.position.y = 1.35; sg.add(pole);
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.12), [L('#0d47a1'), L('#0d47a1'), L('#0d47a1'), L('#0d47a1'), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false }), L('#0d47a1')]); b.position.y = 3.4; b.rotation.y = 0.45; sg.add(b); pole.castShadow = b.castShadow = true; }

// ---------------- the car park (everything above ground walks off) ----------------
const park = new THREE.Group(); scene.add(park);
const DECKY = [2.9, 5.6, 8.3], SLAB = 0.3;
const NX = 0.6, NZ = 1.0;                 // where the neck goes through
const holes = [];
const parked = [];
{ const con = L('#c9c3b8'), con2 = L('#b0a99d'), rail = STD('#eceff1', { metalness: 0.5, roughness: 0.4 }), blue = STD('#1565c0', { roughness: 0.4 });
  const deckT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#8f8f8f'; c.fillRect(0, 0, w, h); c.fillStyle = '#f5f5f5'; for (let k = 0; k < 6; k++) { c.fillRect(30 + k * 80, 0, 6, 150); c.fillRect(30 + k * 80, 330, 6, 182); } });
  DECKY.forEach((y, i) => { const d = new THREE.Mesh(new THREE.BoxGeometry(PX1 - PX0, SLAB, PZ1 - PZ0), [con2, con2, L('#fff', { map: deckT }), con, con2, con2]); d.position.set(0, y - SLAB / 2, (PZ0 + PZ1) / 2); d.castShadow = d.receiveShadow = true; park.add(d);
    // facade band
    const fb = new THREE.Mesh(new THREE.BoxGeometry(PX1 - PX0 + 0.1, 0.55, 0.12), i === 2 ? blue : con); fb.position.set(0, y - 0.1, PZ1 + 0.02); fb.castShadow = true; park.add(fb);
    // railings
    for (const [x0, z0, x1, z1] of [[PX0, PZ1, PX1, PZ1], [PX0, PZ0, PX1, PZ0], [PX0, PZ0, PX0, PZ1], [PX1, PZ0, PX1, PZ1]]) for (const hh of [0.55, 1.0]) { const len = Math.hypot(x1 - x0, z1 - z0);
      const r = new THREE.Mesh(new THREE.BoxGeometry(x1 !== x0 ? len : 0.06, 0.06, z1 !== z0 ? len : 0.06), rail); r.position.set((x0 + x1) / 2, y + hh, (z0 + z1) / 2); park.add(r); }
    // holes (appear when the neck crashes through)
    const hm = new THREE.MeshBasicMaterial({ color: '#2b2622' }); for (const s of [1, -1]) { const hc = new THREE.Mesh(new THREE.CircleGeometry(0.75, 16), hm); hc.rotation.x = -s * Math.PI / 2; hc.position.set(NX, y - SLAB / 2 + s * (SLAB / 2 + 0.02), NZ); hc.visible = false; park.add(hc); holes.push({ m: hc, y }); } });
  for (const x of [PX0 + 0.25, PX1 - 0.25]) for (const z of [PZ0 + 0.25, -2.2, PZ1 - 0.25]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.45, DECKY[2], 0.45), con); c.position.set(x, DECKY[2] / 2, z); c.castShadow = c.receiveShadow = true; park.add(c); }
  // big P sign on the roof
  const pT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 200px Inter'; c.textAlign = 'center'; c.fillText('P', 110, 200); c.font = '900 66px Inter'; c.fillText('CITY', 330, 110); c.fillText('PARK', 330, 190); });
  const ps = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.15), [blue, blue, blue, blue, L('#fff', { map: pT }), blue]); ps.position.set(4.3, DECKY[2] + 1.9, PZ1 - 0.3); ps.castShadow = true; park.add(ps);
  for (const x of [3.0, 5.6]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), rail); p.position.set(x, DECKY[2] + 0.6, PZ1 - 0.35); park.add(p); }
  // parked cars
  const COLS = ['#e53935', '#fdd835', '#43a047', '#8e24aa', '#fb8c00', '#00acc1', '#3949ab', '#ec407a', '#7cb342', '#6d4c41', '#f5f5f5', '#546e7a', '#ff7043', '#26a69a'];
  let ci = 0;
  DECKY.forEach((y, i) => { const front = [-4.8, -2.4, 3.0, 5.3], backR = [-4.8, -2.4, 0.0, 2.4, 4.8];
    front.forEach(x => { if (i === 2 && x === -2.4) return; const c = makeCar(COLS[ci++ % COLS.length]); scene.remove(c); park.add(c); placeCar(c, { x, z: 1.0, h: 0, y }); parked.push({ c, x, y, z: 1.0, ph: hash(ci) * 6 }); });
    backR.forEach(x => { const c = makeCar(COLS[ci++ % COLS.length]); scene.remove(c); park.add(c); placeCar(c, { x, z: -5.6, h: Math.PI, y }); parked.push({ c, x, y, z: -5.6, h: Math.PI, ph: hash(ci) * 6 }); }); });
  // the last space on the roof (glowing P)
  const lpT = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#39ff4a'; c.lineWidth = 14; c.strokeRect(20, 20, w - 40, h - 40); c.fillStyle = '#39ff4a'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.fillText('P', w / 2, 185); });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 4.6), new THREE.MeshBasicMaterial({ map: lpT, transparent: true, toneMapped: false })); lp.rotation.x = -Math.PI / 2; lp.position.set(-2.4, DECKY[2] + 0.03, 1.0); park.add(lp); park.userData.lp = lp; }

// ---------------- hero car + tree air freshener ----------------
const hero = makeCar('#1e88e5');
const CX = -2.2;
const arm = new THREE.Group(); hero.userData.bodyG.add(arm); arm.position.set(-0.86, 1.18, -0.3);
const treeG = new THREE.Group();
const treeTex = bitten => canvasTex(256, 384, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#2e7d32'; c.beginPath(); c.moveTo(w / 2, 20);
  for (const [y, hw] of [[120, 70], [110, 40], [220, 100], [210, 60], [330, 120]]) { c.lineTo(w / 2 + hw, y); } c.lineTo(w / 2 + 18, 330); c.lineTo(w / 2 + 18, 370); c.lineTo(w / 2 - 18, 370); c.lineTo(w / 2 - 18, 330);
  for (const [y, hw] of [[330, 120], [210, 60], [220, 100], [110, 40], [120, 70]]) { c.lineTo(w / 2 - hw, y); } c.closePath(); c.fill(); c.strokeStyle = '#a5d6a7'; c.lineWidth = 8; c.stroke();
  c.fillStyle = '#fff'; c.font = '900 44px Inter'; c.textAlign = 'center'; c.fillText('PINE', w / 2, 260);
  if (bitten) { c.globalCompositeOperation = 'destination-out'; for (const [x, y, r] of [[180, 70, 46], [215, 120, 40], [150, 40, 34]]) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); } } });
const treeM0 = new THREE.MeshStandardMaterial({ map: treeTex(false), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.7 });
const treeM1 = new THREE.MeshStandardMaterial({ map: treeTex(true), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.7 });
const treeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.84), treeM0); treeMesh.castShadow = true;
{ const sk = STD('#f1c27d'), sl = STD('#ff7043'); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.75, 8), sl); m.position.y = 0.37; arm.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), sk); h.position.y = 0.78; arm.add(h);
  treeG.position.y = 0.85; arm.add(treeG); const str = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4), STD('#eee')); str.position.y = -0.05; treeG.add(str); treeMesh.position.y = -0.52; treeG.add(treeMesh);
  arm.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// horn lines
// ticket
const ticket = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: canvasTex(256, 144, (c, w, h) => { c.fillStyle = '#fffde7'; c.fillRect(0, 0, w, h); c.fillStyle = '#333'; c.font = '800 26px Inter'; c.fillText('CITY PARK', 16, 34); c.strokeStyle = '#d50000'; c.lineWidth = 8; c.strokeRect(60, 52, 170, 74); c.fillStyle = '#d50000'; c.font = '900 56px Inter'; c.textAlign = 'center'; c.fillText('FREE', 145, 110); }) })); ticket.castShadow = true; scene.add(ticket);

// ---------------- giraffe ----------------
const gir = new THREE.Group(); scene.add(gir);           // origin = neck base, yaw: 0 -> body behind (+x), facing -x
const gb = new THREE.Group(); gir.add(gb);                 // body (relative to neck base)
const spotT = (rx, ry) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#f6c65b'; c.fillRect(0, 0, w, h); const R = rng(rx * 7 + ry); c.fillStyle = '#b5652a';
  for (let k = 0; k < 46; k++) { const x = R() * w, y = R() * h, r = 18 + R() * 26; c.beginPath(); for (let j = 0; j < 7; j++) { const a = j / 7 * Math.PI * 2, rr2 = r * (0.75 + R() * 0.4); c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); } }, true);
const skinT = spotT(1, 2); const skin = STD('#ffffff', { map: skinT, roughness: 0.6 });
const neckT = spotT(3, 4); neckT.repeat.set(2, 6); const neckMat = STD('#ffffff', { map: neckT, roughness: 0.6 });
const G = {};
{ const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), skin); body.scale.set(1.25, 0.62, 0.55); body.position.set(1.05, -0.35, 0); gb.add(body);
  const legs = []; for (const [x, z] of [[0.35, -0.28], [0.35, 0.28], [1.75, -0.28], [1.75, 0.28]]) { const lg = new THREE.Group(); lg.position.set(x, -0.6, z); gb.add(lg);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 1.7, 10), skin); l.position.y = -0.85; lg.add(l); const hf = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 10), STD('#4e342e')); hf.position.y = -1.72; lg.add(hf); legs.push(lg); }
  G.legs = legs;
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), skin); tail.position.set(2.32, -0.6, 0); tail.rotation.z = 0.35; gb.add(tail); const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), STD('#4e342e')); tuft.position.set(2.48, -1.02, 0); gb.add(tuft); G.tail = tail;
  gb.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
// neck: tube along a cubic Bezier, rebuilt every frame
const NS = 40, NR = 14;
const neck = (() => { const g = new THREE.BufferGeometry(); const pos = new Float32Array(NS * (NR + 1) * 3), uv = new Float32Array(NS * (NR + 1) * 2), idx = [];
  for (let i = 0; i < NS; i++) for (let j = 0; j <= NR; j++) { uv[(i * (NR + 1) + j) * 2] = j / NR; uv[(i * (NR + 1) + j) * 2 + 1] = i / (NS - 1); }
  for (let i = 0; i < NS - 1; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  const m = new THREE.Mesh(g, neckMat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m; })();
const mane = (() => { const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.16, 0.16), STD('#8d4a1c', { roughness: 0.8 }), NS); m.castShadow = true; m.frustumCulled = false; scene.add(m); return m; })();
const bez = (P, s) => { const u = 1 - s; return V3(0, 0, 0).addScaledVector(P[0], u * u * u).addScaledVector(P[1], 3 * u * u * s).addScaledVector(P[2], 3 * u * s * s).addScaledVector(P[3], s * s * s); };
const _sp = [], _tn = [];
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion();
function buildNeck(P, r0, r1) {
  const pos = neck.geometry.attributes.position; let len = 0;
  for (let i = 0; i < NS; i++) { _sp[i] = bez(P, i / (NS - 1)); if (i) len += _sp[i].distanceTo(_sp[i - 1]); }
  for (let i = 0; i < NS; i++) { const a = _sp[Math.max(0, i - 1)], b = _sp[Math.min(NS - 1, i + 1)]; _tn[i] = b.clone().sub(a).normalize(); }
  let n = new THREE.Vector3().crossVectors(_tn[0], V3(0, 0, 1)); if (n.lengthSq() < 1e-4) n.set(1, 0, 0); n.normalize();
  for (let i = 0; i < NS; i++) { const tn = _tn[i]; n.addScaledVector(tn, -n.dot(tn)).normalize(); const b = new THREE.Vector3().crossVectors(tn, n); const r = lerp(r0, r1, i / (NS - 1));
    for (let j = 0; j <= NR; j++) { const a = j / NR * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); pos.setXYZ(i * (NR + 1) + j, _sp[i].x + (n.x * c + b.x * s) * r, _sp[i].y + (n.y * c + b.y * s) * r, _sp[i].z + (n.z * c + b.z * s) * r); }
    // mane along the "upper" side (towards world up where possible)
    const upv = V3(0, 1, 0).addScaledVector(tn, -tn.y); if (upv.lengthSq() < 1e-3) upv.copy(b); upv.normalize();
    const mp = _sp[i].clone().addScaledVector(upv, r * 0.95); _q.setFromUnitVectors(V3(0, 1, 0), upv); _m.compose(mp, _q, V3(1, 1, 1)); if (i < 2 || i > NS - 3) _m.makeScale(0, 0, 0); mane.setMatrixAt(i, _m); }
  pos.needsUpdate = true; neck.geometry.computeVertexNormals(); mane.instanceMatrix.needsUpdate = true;
  neckT.repeat.set(2, Math.max(2, len / 0.9)); return len;
}
// head
const head = new THREE.Group(); scene.add(head);   // local forward = -z
{ const sk = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), skin); sk.scale.set(0.3, 0.3, 0.38); head.add(sk);
  const mz = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), STD('#f3d59b', { roughness: 0.6 })); mz.scale.set(0.24, 0.21, 0.3); mz.position.set(0, -0.08, -0.36); head.add(mz);
  for (const s of [-1, 1]) { const ns = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), STD('#4e342e')); ns.position.set(s * 0.08, -0.02, -0.64); head.add(ns); }
  G.eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.25, 0.1, -0.12); e.rotation.y = s * 0.5; head.add(e); const w = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), STD('#fff', { roughness: 0.25 })); e.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), STD('#111', { roughness: 0.2 })); p.position.set(s * 0.02, 0.0, -0.085); e.add(p); const hl = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(s * 0.03, 0.03, -0.14); e.add(hl);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), STD('#e2a845')); e.add(lid);
    for (let k = -1; k <= 1; k++) { const la = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 4), STD('#222')); la.position.set(k * 0.04, 0.13, -0.08); la.rotation.x = -0.6; e.add(la); }
    return { e, lid, p }; });
  G.ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.26, 0.2, 0.12); head.add(e); const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 10), skin); ear.scale.z = 0.5; ear.rotation.z = -s * 1.2; ear.position.x = s * 0.12; e.add(ear); return e; });
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.26, 8), STD('#e2a845')); o.position.set(s * 0.11, 0.38, 0.08); o.rotation.z = -s * 0.15; head.add(o); const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), STD('#5d4037')); b.position.set(s * 0.13, 0.52, 0.08); head.add(b); }
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 14, Math.PI), STD('#6d3b22')); mo.rotation.set(Math.PI / 2 - 0.4, 0, Math.PI); mo.position.set(0, -0.2, -0.5); head.add(mo); G.mouth = mo;
  const tg = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.25, 4, 8), STD('#6a3d9a', { roughness: 0.4 })); tg.rotation.x = Math.PI / 2; tg.position.set(0, -0.2, -0.62); head.add(tg); G.tongue = tg;
  head.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); }
// booth around the lying giraffe (barrier housing)
const booth = [];
{ const st = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e53935'; for (let k = -2; k < 8; k++) { c.beginPath(); c.moveTo(k * 48, h); c.lineTo(k * 48 + 24, h); c.lineTo(k * 48 + 24 + h * 0.5, 0); c.lineTo(k * 48 + h * 0.5, 0); c.fill(); } }, true);
  const m = STD('#fff', { map: st, roughness: 0.5 });
  for (const [w, d, x, z, ry] of [[2.9, 0.12, 1.3, -0.62, 0], [2.9, 0.12, 1.3, 0.62, 0], [1.24, 0.12, -0.1, 0, Math.PI / 2], [1.24, 0.12, 2.75, 0, Math.PI / 2]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.25, d), m); b.castShadow = true; b.receiveShadow = true; scene.add(b); booth.push({ b, p0: V3(NX + x, 0.625, NZ + z), ry, h: hash(booth.length + 4) }); } }
// rest post for the head
{ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.0, 10), STD('#e53935')); p.position.set(-4.7, 0.5, NZ); p.castShadow = true; scene.add(p);
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.3), STD('#fafafa')); c.position.set(-4.7, 1.02, NZ); scene.add(c); }
// debris
const ND = 90; const debM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), L('#a9a296'), ND); debM.castShadow = true; debM.frustumCulled = false; scene.add(debM);

// ---------------- motion ----------------
const carZ = mono([[0, 30], [3.5, 14], [6.8, 5.6], [8.4, 5.4], [80, 5.4]]);
// neck tip height for the crash (wrong)
const tipY = t => lerp(2.3, 10.6, easeOut(clamp((t - tStraight + 0.1) / (tFloors + 0.25 - tStraight + 0.1))));
const passT = y => { let lo = tStraight - 0.2, hi = tFloors + 0.4; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (tipY(m) < y) lo = m; else hi = m; } return lo; };
const walkX = mono([[0, 0], [tWalks - 0.15, 0], [tWith, 7], [tAndY, 14], [tSpace + 0.5, 22], [60, 30]]);
const turnU = t => ease(clamp((t - (tNow - 0.1)) / 0.8));
// lift path for the car (mouth position) in the right way
const LIFT = { x: mono([[0, CX], [tLifts - 0.1, CX], [tUp5, CX - 0.1], [tInto - 0.2, CX - 0.2], [tLast, -2.4], [80, -2.4]]),
  y: mono([[0, 1.75], [tLifts - 0.1, 1.75], [tUp5 + 0.1, 11.9], [tInto, 12.2], [tLast + 0.1, 11.6], [tRoof + 0.1, DECKY[2] + 1.72], [80, DECKY[2] + 1.72]]),
  z: mono([[0, 5.4], [tLifts - 0.1, 5.4], [tUp5 + 0.1, 5.6], [tInto, 5.0], [tLast + 0.1, 2.6], [tRoof + 0.1, 1.0], [80, 1.0]]) };

// neck poses -> {P:[4], head:{yaw,pitch}}
const BASE0 = V3(NX, 1.15, NZ);
function neckPose(t) {
  const right = isRight(t);
  const lie = { base: BASE0.clone(), P: null };
  const barrier = (lift = 0, wob = 0) => { const B = BASE0.clone(); const H2 = V3(-4.55, 1.2 + lift, NZ + wob); return { P: [B, B.clone().lerp(H2, 0.33), B.clone().lerp(H2, 0.66), H2], yaw: Math.PI / 2, pitch: -0.1 + lift * 0.6 }; };
  if (!right) {
    if (t < tJumps - 0.05) { const lk = ramp(t, tIts - 0.2, tIts + 0.4) * (1 - ramp(t, tWhat + 0.6, tWhat + 1.2)) * 0.35; const st = win(t, tHonk - 0.05, tLoudly + 0.6, 0.1); const b = barrier(lk + 0.25 * st * Math.abs(Math.sin(t * 25)), 0); b.yaw += lk / 0.35 * 0.9 + 0.6 * st; return b; }
    const B = V3(NX, 2.1 + 0.0, NZ);
    if (t < tStraight - 0.1) { const u = ease(clamp((t - tJumps + 0.05) / 0.35)); const scared = V3(-0.4, 2.35, NZ - 0.2); const b0 = barrier(0.0); const H2 = b0.P[3].clone().lerp(scared, u); const B2 = BASE0.clone().lerp(B, u);
      return { P: [B2, B2.clone().add(V3(-0.4, 0.15 * u, 0)), H2.clone().add(V3(0.6, 0.05, 0)), H2], yaw: Math.PI / 2 * (1 - u) + Math.PI * u, pitch: -0.1 }; }
    const y = tipY(t); const H2 = V3(NX, y, NZ); const tw = turnU(t);
    return { P: [B, B.clone().add(V3(0, (y - B.y) * 0.33, 0)), B.clone().add(V3(0, (y - B.y) * 0.66, 0)), H2], yaw: lerp(Math.PI, Math.PI * 1.5, tw) + 0.25 * Math.sin(t * 1.3) * ramp(t, tWalks, tWalks + 0.5), pitch: 0.3 * win(t, tFloors - 0.1, tNow + 0.2, 0.2) };
  }
  // right way
  const treeP = V3(CX - 1.95, 1.75, 5.0);
  const seeU = ramp(t, tSees - 0.2, tTree3 + 0.2);
  if (t < tUp - 0.15) { const b = barrier(0.25 * seeU); b.yaw = Math.PI / 2 + 0.9 * seeU; return b; }
  const B = BASE0.clone(); const outB = V3(NX - 0.3, 1.5, 3.9);
  const upH = V3(-1.6, 5.2, 5.3), nibH = treeW.clone().sub(V3(-Math.sin(Math.PI - 0.5), 0, -Math.cos(Math.PI - 0.5)).multiplyScalar(0.8)).add(V3(0, 0.12, 0)), liftH = V3(LIFT.x(t), LIFT.y(t) + 0.15, LIFT.z(t));
  let H2, yaw = 0, pitch = 0;
  const uUp = ease(clamp((t - tUp + 0.15) / 0.8)); const fromBar = barrier(0.25).P[3];
  if (t < tOneN - 0.3) { H2 = fromBar.clone().lerp(upH, uUp); H2.y += 0.6 * Math.sin(Math.PI * uUp); yaw = lerp(Math.PI / 2 + 0.9, Math.PI - 0.3, uUp); pitch = lerp(0, 0.1, uUp); }
  else if (t < tLifts - 0.2) { const u = ease(clamp((t - tOneN + 0.3) / 0.55)); H2 = upH.clone().lerp(nibH, u); const ch = win(t, tNibble - 0.1, tFav + 0.3, 0.1) * 0.05 * Math.sin(t * 24); H2.y += ch; yaw = lerp(Math.PI - 0.3, Math.PI - 0.5, u); pitch = lerp(0.1, 0.25, u);
    const v = ease(clamp((t - tAnd5) / 0.6)); H2.lerp(V3(CX, 2.8, 5.0), v); yaw = lerp(yaw, Math.PI, v); pitch = lerp(pitch, 0.5, v); }
  else { const u = ease(clamp((t - tLifts + 0.2) / 0.3)); H2 = V3(CX, 2.8, 5.0).lerp(liftH, u); yaw = Math.PI; pitch = lerp(0.5, 0.55, u) - 0.25 * ramp(t, tRoof, tRoof + 0.6) + 0.2 * win(t, tPerfect, tTicket + 0.6, 0.2);
    const off = ease(clamp((t - tRoof - 0.25) / 0.7)); H2.lerp(V3(-0.9, DECKY[2] + 3.0, 3.6), off); yaw = lerp(Math.PI, Math.PI + 0.35, off); pitch = lerp(pitch, 0.15, off); }
  const top = Math.max(H2.y, 2);
  return { P: [B, outB, V3(H2.x * 0.6 + outB.x * 0.4, Math.min(top * 0.55, top - 0.6), Math.max(H2.z, 4.2) + 0.5), H2], yaw, pitch };
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const GirCam = (off, look, fov = 40) => t => { const x = walkX(t); return [V3(off[0] + x, off[1], off[2]), V3(look[0] + x, look[1], look[2]), fov]; };
const camKeys = [
  [0.0, Ac([18, 22, 42], [-1.0, 3.0, 0.0])],
  [tOne - 0.3, Ac([14, 18, 36], [-1.0, 3.0, 0.0])],
  ...cut(tOne - 0.25, Ac([-4.2, 2.4, 11.5], [-6.8, 2.6, 6.5], 40)),
  [tIn - 0.3, Ac([-4.4, 2.4, 11.1], [-6.8, 2.7, 6.5], 40)],
  ...cut(tIn - 0.25, Ac([7.0, 4.5, 31], [-1.0, 4.0, 0.0])),
  [tBut - 0.3, Ac([5.5, 4.0, 27], [-1.2, 3.6, 0.0])],
  ...cut(tBut - 0.25, Ac([0.9, 1.6, 8.0], [-2.0, 1.1, 1.0], 38)),
  [tIts - 0.25, Ac([0.7, 1.6, 7.4], [-2.2, 1.15, 1.0], 38)],
  ...cut(tIts - 0.2, Ac([-3.1, 2.5, 4.9], [-4.5, 1.75, NZ], 40)),
  [tWhat - 0.3, Ac([-3.2, 2.55, 5.2], [-4.5, 1.75, NZ], 40)],
  ...cut(tWhat - 0.25, Ac([6.5, 5.0, 17], [-1.5, 2.2, 1.5])),
  [S('wrong1').start - 0.2, Ac([6.2, 5.2, 16], [-1.5, 2.2, 1.5])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([2.2, 1.9, 10.5], [-2.6, 1.1, 2.6], 40)),
  [tReally - 0.3, Ac([2.0, 1.9, 10.0], [-2.6, 1.1, 2.6], 40)],
  ...cut(tReally - 0.25, Ac([-3.0, 2.0, 4.8], [-4.5, 1.6, NZ], 40)),
  [tBig - 0.2, Ac([-3.1, 2.05, 5.1], [-4.5, 1.6, NZ], 40)],
  ...cut(tBig - 0.15, Ac([5.2, 2.0, 11.0], [0.8, 1.7, 1.0])),
  [tStraight - 0.3, Ac([5.0, 2.1, 10.5], [0.8, 1.9, 1.0])],
  ...cut(tStraight - 0.25, Ac([7.0, 5.5, 25.0], [0.0, 5.6, 0.0])),
  [tNow - 0.2, Ac([7.5, 6.0, 26.0], [0.0, 5.8, 0.0])],
  ...cut(tNow - 0.15, Ac([-14, 9, 30], [6.0, 4.5, 0.0])),
  [tWith - 0.3, Ac([-12, 10, 32], [9.0, 4.5, 0.0])],
  ...cut(tWith - 0.25, GirCam([10.0, 7.0, 14.0], [-0.5, 5.2, -1.0])),
  [tAndY - 0.25, GirCam([10.0, 7.2, 15.0], [-0.5, 5.2, -1.0])],
  ...cut(tAndY - 0.2, Ac([3.6, 2.7, 14.0], [-3.4, 1.7, 3.0])),
  [tRew0, Ac([4.0, 3.0, 15.0], [-3.4, 1.7, 3.0])],
  // right
  ...cut(tRew1, Ac([2.2, 2.8, 17], [-1.2, 3.0, 0.0])),
  [tTake - 0.25, Ac([2.0, 2.7, 16], [-1.2, 2.8, 0.0])],
  ...cut(tTake - 0.2, Ac([-6.0, 2.0, 2.4], [-3.5, 1.5, 5.1], 40)),
  [tSees - 0.3, Ac([-6.2, 2.1, 2.2], [-3.5, 1.5, 5.1], 40)],
  ...cut(tSees - 0.25, Ac([-3.1, 2.5, 4.9], [-4.5, 1.75, NZ], 40)),
  [tUp - 0.3, Ac([-3.2, 2.55, 5.2], [-4.5, 1.75, NZ], 40)],
  ...cut(tUp - 0.25, Ac([-3.0, 3.6, 17.5], [-1.4, 3.6, 2.5])),
  [tOneN - 0.3, Ac([-3.2, 3.8, 17.0], [-1.6, 3.4, 3.0])],
  ...cut(tOneN - 0.25, Ac([-6.3, 2.3, 1.8], [-3.7, 1.7, 5.0], 40)),
  [tAnd5 - 0.1, Ac([-6.5, 2.4, 1.6], [-3.7, 1.7, 5.0], 40)],
  ...cut(tAnd5 - 0.05, Ac([4.0, 5.5, 25], [-1.5, 5.4, 1.0])),
  [tRoof + 0.3, Ac([3.5, 7.0, 24], [-1.5, 6.4, 1.0])],
  ...cut(tPerfect - 0.25, Ac([-0.5, 12.8, 9.0], [-2.4, 9.4, 1.0], 40)),
  [S('right7').start, Ac([-0.3, 13.0, 9.4], [-2.4, 9.4, 1.0], 40)],
  [S('outro').start, Ac([2.0, 14.0, 17.0], [-1.5, 8.0, 0.0])],
  [TOTAL - 0.3, Ac([8.0, 20.0, 30.0], [-1.0, 6.0, 0.0])],
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
  // car (wrong / right; lifted by the giraffe in the right way)
  const lifted = right && t > tLifts - 0.2;
  if (!lifted) placeCar(hero, { x: CX, z: carZ(t), h: 0 });
  else { const u = clamp((t - tLifts + 0.2) / 0.3); const mx = LIFT.x(t), my = LIFT.y(t), mz = LIFT.z(t); const sw = 0.06 * Math.sin(t * 3.1) * (1 - ramp(t, tRoof - 0.2, tRoof + 0.4));
    hero.position.set(mx, Math.max(0, my - 1.75), mz); hero.rotation.set(sw, 0, 0.5 * sw, 'YXZ'); hero.userData.prev = null; }
  blink(hero, t, false, false);
  // horn shake
  const hk = !right ? win(t, tHonk - 0.05, tLoudly + 0.5, 0.05) : 0; hero.userData.bodyG.position.y = 0.025 * hk * Math.sin(t * 60);
  // arm with tree
  const armU = right ? ramp(t, tHold - 0.2, tWindow) * (1 - ramp(t, tAnd5 - 0.2, tAnd5 + 0.3)) : 0; arm.visible = armU > 0.01; arm.scale.setScalar(Math.max(0.01, armU));
  arm.rotation.set(0.25, 0, 1.45 + 0.06 * Math.sin(t * 5)); treeG.rotation.set(0, Math.PI + 0.35 * Math.sin(t * 1.3), 1.45 + 0.12 * Math.sin(t * 4));
  treeMesh.material = right && t > tNibble ? treeM1 : treeM0;
  hero.updateMatrixWorld(true); treeMesh.getWorldPosition(treeW);
  // giraffe body
  let stand = 0, ry = 0, gx = 0;
  if (!right) { stand = ramp(t, tJumps - 0.05, tJumps + 0.3); const jump = win(t, tJumps - 0.05, tFright + 0.2, 0.15) * 0.25; gir.position.set(NX + walkX(t), lerp(1.15, 2.1, stand) + jump + 0.08 * Math.abs(Math.sin(t * 6)) * ramp(t, tWalks, tWalks + 0.3), NZ); ry = lerp(0, Math.PI, turnU(t)); }
  else { stand = ramp(t, tThank - 0.3, tThank + 0.3); gir.position.set(NX, lerp(1.15, 2.1, stand), NZ); }
  gir.rotation.set(0, ry, 0);
  const walking = !right && t > tWalks - 0.1;
  G.legs.forEach((lg, k) => { lg.scale.y = lerp(0.15, 1, stand); lg.rotation.z = walking ? 0.45 * Math.sin(t * 7 + (k % 2 ? Math.PI : 0) + (k > 1 ? Math.PI / 2 : 0)) : 0; lg.position.y = -0.6; });
  gb.position.set(0, lerp(-0.25, 0, stand), 0); G.tail.rotation.z = 0.35 + 0.25 * Math.sin(t * 4);
  // neck + head
  const np = neckPose(t); if (!right) { const wx = walkX(t); for (let k = 1; k < 4; k++) np.P[k].x += wx; } np.P[0] = gir.position.clone();
  buildNeck(np.P, 0.32, 0.22);
  const tipP = np.P[3]; const tp = np.P[3].clone().sub(np.P[2]).normalize();
  head.position.copy(tipP).addScaledVector(V3(0, 1, 0), 0.12); head.rotation.set(np.pitch, np.yaw, 0, 'YXZ');
  head.position.add(V3(-Math.sin(np.yaw), 0, -Math.cos(np.yaw)).multiplyScalar(0.18));
  // eyes: closed (sleepy barrier) -> open at "giraffe"; wide when scared
  const open = right ? 1 : ramp(t, tGir - 0.25, tGir + 0.05); const scared = !right ? win(t, tHonk - 0.05, tFloors + 0.3, 0.1) : (t > tSees - 0.2 && t < tTree3 + 0.6 ? 0.6 : 0);
  const blinkK = (t % 3.3 < 0.12) && open > 0.9 ? 0.2 : 1;
  G.eyes.forEach(E => { E.lid.rotation.x = lerp(-Math.PI * 0.95, -Math.PI * 0.05, 1 - open * blinkK) - 0.3 * scared * open; E.p.scale.setScalar(1 - 0.35 * scared); });
  G.ears.forEach((e, k) => { e.rotation.z = (k ? -1 : 1) * (0.2 * Math.sin(t * 3 + k) + 0.6 * (!right ? win(t, tHonk, tFloors, 0.1) : 0)); });
  const nib = right ? win(t, tNibble - 0.15, tFav + 0.2, 0.1) : 0; G.tongue.visible = nib > 0.05 || (right && t > tPine && t < tFav + 0.5); G.tongue.scale.set(1, 1, 1); G.tongue.position.z = -0.62 - 0.1 * Math.abs(Math.sin(t * 9)) * nib;
  // booth walls
  booth.forEach((B, i) => { const p = B.p0.clone(); let rx = 0, rz = 0, ry2 = B.ry;
    if (!right) { const u = clamp((t - tJumps + 0.05) / 1.2); if (u > 0) { const dir = V3((p.x - NX - 1.3) * 0.4, 0, -1).normalize(); p.x += dir.x * 5 * u; p.z += dir.z * 5 * u; p.y += 4 * u - 4.4 * u * u; p.y = Math.max(0.1, p.y); rx = 5 * u * (B.h - 0.5); rz = 4 * u; }
      p.x += walkX(t) * 0; }
    else { const u = ease(clamp((t - tThank + 0.35) / 0.45)); const out = V3(p.x - NX - 1.3, 0, p.z - NZ); const ax = Math.abs(out.x) > Math.abs(out.z); rz = ax ? Math.sign(out.x) * -Math.PI / 2 * u : 0; rx = ax ? 0 : Math.sign(out.z) * Math.PI / 2 * u;
      if (ax) { p.x += Math.sign(out.x) * 0.6 * u; } else { p.z += Math.sign(out.z) * 0.6 * u; } p.y = lerp(0.625, 0.08, u); }
    B.b.position.copy(p); B.b.rotation.set(rx, ry2, rz); });
  // the car park: lifts + walks off (wrong)
  const lift = !right ? 0.35 * ramp(t, tFloors - 0.2, tFloors + 0.3) : 0; park.position.set(!right ? walkX(t) : 0, lift + (walking ? 0.08 * Math.abs(Math.sin(t * 7)) : 0), 0);
  park.rotation.z = walking ? 0.015 * Math.sin(t * 3.5) : 0;
  holes.forEach(h => { h.m.visible = !right && t > passT(h.y); });
  parked.forEach(P => { const wob = walking ? 1 : 0; P.c.position.y = P.y + 0.05 * wob * Math.abs(Math.sin(t * 7 + P.ph)); P.c.rotation.z = 0.04 * wob * Math.sin(t * 5 + P.ph); });
  park.userData.lp.visible = !(right && t > tRoof + 0.2); park.userData.lp.material.opacity = 0.6 + 0.4 * Math.sin(t * 6);
  // FREE counter
  drawSign(!right ? (t > tSpace - 0.6 ? 0 : 1) : (t > tRoof + 0.1 ? 0 : 1));
  // debris
  for (let i = 0; i < ND; i++) { const dk = i % 3; const t0 = passT(DECKY[dk]) - 0.02; let ok = !right && t > t0 && t < t0 + 2.4;
    if (ok) { const dt = t - t0; const a = hash(i) * Math.PI * 2, sp = 2 + hash(i + 3) * 4; const x = NX + Math.cos(a) * sp * dt + park.position.x, z = NZ + Math.sin(a) * sp * dt; const y = DECKY[dk] + (3 + hash(i + 5) * 5) * dt - 4.9 * dt * dt; const s = 0.15 + 0.25 * hash(i + 7);
      if (y < -0.5) ok = false; else { _q.setFromEuler(new THREE.Euler(dt * 5 + i, dt * 3, 0)); _m.compose(V3(x, Math.max(0.1, y), z), _q, V3(s, s * 0.6, s)); } }
    if (!ok) _m.makeScale(0, 0, 0); debM.setMatrixAt(i, _m); }
  debM.instanceMatrix.needsUpdate = true;
  // ticket
  const tk = right ? clamp((t - tFree + 0.1) / 0.9) : 0; ticket.visible = tk > 0;
  if (tk > 0) { head.updateMatrixWorld(true); const m0 = head.localToWorld(V3(0, -0.2, -0.6)); const tgt = V3(-2.4, DECKY[2] + 1.0, 0.25); const p = m0.clone().lerp(tgt, easeIn(tk)); p.y += 0.3 * Math.sin(Math.PI * tk); ticket.position.copy(p); ticket.rotation.set(-1.2 + 0.4 * Math.sin(t * 8) * (1 - tk), 0.3 * Math.sin(t * 6), 0); }
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(win(t, tJumps - 0.05, tJumps + 0.3, 0.05), win(t, tStraight, tFloors + 0.3, 0.05) * 1.3) : win(t, tRoof - 0.05, tRoof + 0.25, 0.05) * 0.6;
  applyCam(c, t, shake > 0.02 ? 0.06 * shake : 0);
  camera.updateMatrixWorld(true); hero.updateMatrixWorld(true); head.updateMatrixWorld(true);
  screen = { head: project(head.localToWorld(V3(0, 0.6, 0))), car: project(hero.localToWorld(V3(0, 1.0, -2.3))), hero: project(hero.localToWorld(V3(0, 2.2, 0))) };
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
function hornLines(t, a, b) { if (t < a || t > b) return; const p = screen.car; if (!p || !p.ok) return; const f = win(t, a, b, 0.1);
  ctx.save(); ctx.globalAlpha = f; ctx.strokeStyle = YEL; ctx.lineWidth = 14; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { const r = 60 + k * 50 + ((t * 300) % 50); ctx.beginPath(); ctx.arc(p.x, p.y, r, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke(); } ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('CITY CENTRE', '#455a64', tCity - 0.1, tOne - 0.2, 54);
    P_('FREE SPACES: 1', '#0d47a1', tOne - 0.15, tIn - 0.2, 54);
    P_('BARRIER?', '#455a64', tBarrier - 0.15, tIts - 0.15, 56);
    P_('BARRIER: GIRAFFE', '#e65100', tGir - 0.2, S('hook2').end + 0.3, 54);
    hornLines(t, tHonk - 0.05, tLoudly + 0.5);
    floatText('HONK!', W / 2 - 150, 700, t, tHonk - 0.03, tHonk + 0.7, 120, YEL, -0.12);
    floatText('HOOONK!!', W / 2 + 80, 760, t, tLoudly - 0.05, tLoudly + 0.8, 130, YEL, 0.1);
    P_('GIRAFFE: VERY SCARED', RED, tThe2 - 0.1, tStraight - 0.15, 50, iconWarn);
    floatText('CRASH!', W / 2, 640, t, tFour - 0.1, tFour + 0.9, 160, '#ffb74d', -0.08);
    P_('THROUGH ALL 4 FLOORS', RED, tStraight - 0.1, tNow - 0.1, 50, iconX);
    P_('CAR PARK = SCARF', '#e65100', tWearing - 0.2, tWith - 0.1, 54);
    P_('EVERY CAR STILL INSIDE', '#e65100', tEvery - 0.25, tAndY - 0.1, 48);
    P_('FREE SPACES: 0', RED, tStill - 0.25, tRew0, 56, iconX);
  } else {
    P_('LITTLE TREE: FROM THE MIRROR', '#2e7d32', tTree - 0.2, tHold - 0.1, 44);
    P_('HOLD IT OUT OF THE WINDOW', '#2e7d32', tHold - 0.1, S('right2').end + 0.3, 46);
    bubble('A TREE?!', screen.head, t, tTree3 - 0.25, tUp - 0.1, 54, '#fff', '#111', -110);
    P_('BARRIER: OPEN', GREEN, tUp - 0.1, tOneN - 0.2, 56, iconCheck);
    floatText('NIBBLE', W / 2, 700, t, tNibble - 0.1, tNibble + 0.8, 110, '#a5d6a7', -0.08);
    P_('PINE FLAVOUR', '#2e7d32', tPine - 0.15, tFav - 0.15, 56);
    P_('ITS FAVOURITE', '#d81b60', tFav - 0.15, S('right4').end + 0.3, 54, iconHeart);
    if (t > tFav - 0.1 && t < S('right4').end + 0.4 && screen.head.ok) for (let k = 0; k < 3; k++) { const u = ((t - tFav) * 0.9 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - u) * win(t, tFav - 0.1, S('right4').end + 0.4, 0.2); iconHeart(clamp(screen.head.x, 200, W - 200) + (k - 1) * 110, screen.head.y - 60 - u * 200, 34, '#ff4f9a'); ctx.restore(); }
    P_('THANK-YOU LIFT', '#e65100', tLifts - 0.2, tInto - 0.15, 54);
    P_('LAST SPACE: ROOF', '#0d47a1', tInto - 0.15, S('right6').start - 0.1, 52);
    P_('PERFECT PARKING', GREEN, tPerfect - 0.15, tFree - 0.15, 56, iconCheck);
    P_('TICKET: FREE', GREEN, tFree - 0.15, S('right7').start - 0.1, 58, iconCheck);
  }
}
window.dbg = { carZ, LIFT };
start(update, hud);
