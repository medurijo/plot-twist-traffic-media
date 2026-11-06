// Episode 37: Hill start – the lorry behind you is full of watermelons
// hook (old style): a red light on a very steep hill -> right behind you: a lorry full of watermelons. Ten thousand.
// wrong: clutch out too fast, roll back -> BONK, the lorry wobbles -> 10,000 watermelons jump into the air ->
//        splat splat splat: your car is a fruit salad. And the light? still red (with a melon hat)
// right: handbrake on, ask the lorry driver for ONE melon -> karate chop it in half -> halves behind the back wheels = juiciest wheel chocks ->
//        green: up you go, not one centimetre back -> the lorry driver gets the chocks back as lunch -> all melons still on board
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltTex, grassTex, makeWheel,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tRed = WT('hook1', 'red'), tOn = WT('hook1', 'On'), tSteep = WT('hook1', 'steep');
const tAnd0 = WT('hook2', 'And'), tLorry = WT('hook2', 'lorry'), tFull = WT('hook2', 'Full'), tTen = WT('hook2', 'Ten'), tWhat = WT('hook2', 'What');
const tClutch = WT('wrong1', 'clutch'), tFast = WT('wrong1', 'fast'), tRoll = WT('wrong1', 'roll');
const tBig = WT('wrong2', 'Big'), tBonk = WT('wrong2', 'Bonk'), tWobble = WT('wrong2', 'wobbles'), tAnd1 = WT('wrong2', 'And'), tJump = WT('wrong2', 'jump');
const tThey = WT('wrong3', 'They'), tSp = [WT('wrong3', 'Splat', 0), WT('wrong3', 'Splat', 1), WT('wrong3', 'Splat', 2)], tNow = WT('wrong3', 'Now'), tSalad = WT('wrong3', 'salad'), tLight = WT('wrong3', 'light'), tStill = WT('wrong3', 'Still');
const tHand = WT('right2', 'Handbrake'), tAsk = WT('right2', 'ask'), tOneM = WT('right2', 'one'), tMelon = WT('right2', 'watermelon');
const tKarate = WT('right3', 'Karate'), tChop = WT('right3', 'chop'), tPut = WT('right3', 'put'), tBehind = WT('right3', 'behind'), tWheels = WT('right3', 'wheels'), tJuicy = WT('right3', 'world');
const tGreen = WT('right4', 'Green'), tGas = WT('right4', 'Gas'), tOff = WT('right4', 'off'), tUp = WT('right4', 'up'), tNot = WT('right4', 'Not');
const tGets = WT('right5', 'gets'), tChocks = WT('right5', 'chocks'), tLunch = WT('right5', 'lunch');
const tAll = WT('right6', 'Watermelons');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- the hill (everything in hill-local coords: uphill = -z) ----------------
const A = 0.25;
const hill = new THREE.Group(); hill.rotation.x = A; scene.add(hill);
const HL = (x, y, z) => hill.localToWorld(V3(x, y, z));
hill.updateMatrixWorld(true);
const RX = 3.6;
{ const gm = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), L('#ffffff', { map: grassTex.clone() })); gm.material.map.wrapS = gm.material.map.wrapT = THREE.RepeatWrapping; gm.material.map.repeat.set(120, 120); gm.material.map.needsUpdate = true; gm.rotation.x = -Math.PI / 2; gm.receiveShadow = true; hill.add(gm);
  const at = asphaltTex.clone(); at.wrapS = at.wrapT = THREE.RepeatWrapping; at.repeat.set(2, 140); at.needsUpdate = true;
  const rd = new THREE.Mesh(new THREE.PlaneGeometry(RX * 2, 1000), L('#ffffff', { map: at })); rd.rotation.x = -Math.PI / 2; rd.position.y = 0.05; rd.receiveShadow = true; hill.add(rd);
  const mk = L('#f5f5f5', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  for (let z = -400; z < 400; z += 8) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 3), mk); d.rotation.x = -Math.PI / 2; d.position.set(0, 0.07, z); d.receiveShadow = true; hill.add(d); }
  for (const s of [1, -1]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 1000), mk); e.rotation.x = -Math.PI / 2; e.position.set(s * (RX - 0.25), 0.07, 0); hill.add(e); }
  const sl = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.4), mk); sl.rotation.x = -Math.PI / 2; sl.position.set(1.8, 0.071, 0); hill.add(sl);
  for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 1000), L('#cfc8b8')); p.position.set(s * (RX + 0.9), 0.07, 0); p.receiveShadow = true; hill.add(p); }
  // field strips on the slope
  const fc = ['#a6d95c', '#79bd45', '#cfd86e', '#9fcd58', '#dccf72', '#b7dc6a'];
  const R = rng(77); for (let i = 0; i < 60; i++) { const s = R() < 0.5 ? -1 : 1, x = s * (16 + R() * 120), z = (R() - 0.5) * 500, w = 20 + R() * 50, d = 20 + R() * 60;
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), L(fc[i % fc.length], { map: grassTex, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.03, z); f.receiveShadow = true; hill.add(f); } }
// upright helper (vertical things on the slope)
function upright(x, z, parent = hill) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.x = -A; parent.add(g); return g; }
// trees (world space, upright, on the slope)
{ const pts = []; const R = rng(311);
  while (pts.length < 900) { const cx = (R() - 0.5) * 500, cz = (R() - 0.5) * 600, n = 3 + (R() * 10 | 0); for (let k = 0; k < n; k++) { const x = cx + (R() - 0.5) * 30, z = cz + (R() - 0.5) * 30; if (Math.abs(x) < 9 || (Math.abs(x) < 40 && z > -32 && z < 36)) continue; pts.push([x, z, 0.8 + R() * 1.0, R()]); } }
  for (let z = -160; z < 160; z += 11) for (const s of [1, -1]) { if (z > -32 && z < 36) continue; pts.push([s * (7.5 + hash(z + s) * 2), z + hash(z * 3) * 4, 0.9 + hash(z + 7) * 0.4, hash(z + 11)]); }
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _c = new THREE.Color();
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.32, 2.2, 6), L('#6d4a2b'), pts.length);
  const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.3, 1), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length);
  const lc = ['#3f8f2e', '#4fa336', '#2f7a28', '#5fb33f', '#3a8a3a'];
  pts.forEach(([x, z, s, r], i) => { const b = HL(x, 0, z); _m.compose(V3(b.x, b.y + 1.1 * s - 0.3, b.z), _q.identity(), _s.set(s, s, s)); trunk.setMatrixAt(i, _m);
    _e.set(r * 3, r * 6, 0); _q.setFromEuler(_e); _m.compose(V3(b.x, b.y + 3.4 * s - 0.3, b.z), _q, _s.set(s, s * (1 + r * 0.4), s)); leaf.setMatrixAt(i, _m); leaf.setColorAt(i, _c.set(lc[(r * 5) | 0])); });
  trunk.castShadow = leaf.castShadow = true; leaf.receiveShadow = true; scene.add(trunk); scene.add(leaf); }
// a few houses beside the road (upright)
{ const cols = ['#f4d6a0', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5d7a99'; c.fillRect(30 + x * 120, 30 + y * 120, 76, 80); } });
  let k = 0; for (let z = -90; z <= 70; z += 20) for (const s of [1, -1]) { if (s > 0 && Math.abs(z) < 45) continue; const g = upright(s * 15, z + (s > 0 ? 6 : 0));
    const m = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 9), L(cols[k % cols.length], { map: winT })); m.position.y = 2.5; m.castShadow = m.receiveShadow = true; g.add(m);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(6.4, 3.4, 4), L(['#b0473a', '#7b5e57', '#455a64'][k % 3])); rf.rotation.y = Math.PI / 4; rf.position.y = 8.7; rf.castShadow = true; g.add(rf); k++; } }
// steep-hill sign
{ const g = upright(RX + 1.1, 18); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), STD('#9e9e9e', { metalness: 0.5 })); p.position.y = 1.1; g.add(p);
  const st = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#d32f2f'; c.beginPath(); c.moveTo(w / 2, 8); c.lineTo(w - 6, h - 20); c.lineTo(6, h - 20); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(w / 2, 50); c.lineTo(w - 44, h - 42); c.lineTo(44, h - 42); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.moveTo(60, 205); c.lineTo(196, 205); c.lineTo(196, 118); c.fill(); c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText('25%', 112, 168); });
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), L('#fff', { map: st, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); b.position.y = 2.4; g.add(b); g.rotation.y = -0.2; }

// ---------------- traffic light ----------------
const TL_ = upright(RX + 0.75, -0.3);
const lamps = {};
{ const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.0, 10), STD('#37474f')); pole.position.y = 1.5; TL_.add(pole);
  const hd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.4), STD('#263238')); hd.position.y = 3.5; TL_.add(hd);
  [['r', '#ff0000', 3.95], ['y', '#ffaa00', 3.5], ['g', '#00ff44', 3.05]].forEach(([k, c, y]) => { const m = new THREE.MeshStandardMaterial({ color: '#1a1a1a', emissive: c, emissiveIntensity: 0, toneMapped: false }); const l = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), m); l.position.set(0, y, 0.205); TL_.add(l); lamps[k] = m;
    const vz = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.16, 16, 1, true, Math.PI * 0.5, Math.PI), STD('#263238', { side: THREE.DoubleSide })); vz.rotation.x = Math.PI / 2; vz.position.set(0, y + 0.03, 0.28); TL_.add(vz); });
  TL_.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- melons ----------------
const stripeT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#8bc34a'; c.fillRect(0, 0, w, h); c.fillStyle = '#2e6b1f'; for (let i = 0; i < 14; i++) { c.beginPath(); const x0 = i * w / 14; c.moveTo(x0, 0); for (let y = 0; y <= h; y += 16) c.lineTo(x0 + 8 * Math.sin(y * 0.09 + i) + 10, y); for (let y = h; y >= 0; y -= 16) c.lineTo(x0 + 8 * Math.sin(y * 0.09 + i) - 6, y); c.fill(); } });
const fleshT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#2e7d32'; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, 7); c.fill(); c.fillStyle = '#f1f8e9'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 10, 0, 7); c.fill(); c.fillStyle = '#ff1f45'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 22, 0, 7); c.fill();
  c.fillStyle = '#222'; for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 30 + (i % 4) * 18; c.beginPath(); c.ellipse(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, 5, 9, a, 0, 7); c.fill(); } });
const MR = 0.3;
const melonGeo = new THREE.SphereGeometry(MR, 16, 12); melonGeo.scale(1.25, 1, 1);
const melonM = STD('#ffffff', { map: stripeT, roughness: 0.35 });
const domeGeo = new THREE.SphereGeometry(MR, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); domeGeo.scale(1.25, 1, 1);   // lower half (shell)
const fleshGeo = new THREE.CircleGeometry(MR, 24); fleshGeo.rotateX(-Math.PI / 2); fleshGeo.scale(1.25, 1, 1); fleshGeo.translate(0, 0.002, 0);
const fleshM = STD('#ffffff', { map: fleshT, roughness: 0.5, emissive: '#ff1744', emissiveIntensity: 0.16 });

// ---------------- lorry (faces -z, rests behind the hero) ----------------
const HX = 1.8, HZ = 2.6, LZ = 11.0;     // hero rest z, lorry centre z
const lorry = new THREE.Group(); hill.add(lorry); lorry.position.set(HX, 0, LZ);
const lorryBody = new THREE.Group(); lorry.add(lorryBody);
let lorryDrv;
{ const red = STD('#d84315', { roughness: 0.35, metalness: 0.3 }), dark = STD('#263238', { roughness: 0.7 }), glass = STD('#1a2633', { roughness: 0.05, metalness: 0.9 });
  const ch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 8.2), dark); ch.position.set(0, 0.75, 0); lorryBody.add(ch);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.4, 2.2), red); cab.position.set(0, 2.05, -2.95); lorryBody.add(cab);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.05), STD('#90a4ae', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35 })); ws.position.set(0, 2.55, -4.06); lorryBody.add(ws);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 1.0), glass); sw.position.set(s * 1.26, 2.55, -2.7); lorryBody.add(sw); }
  const gr = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.06), dark); gr.position.set(0, 1.35, -4.06); lorryBody.add(gr);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.05), STD('#fffbe8', { emissive: '#fff3b0', emissiveIntensity: 0.4 })); hl.position.set(s * 0.85, 1.05, -4.07); lorryBody.add(hl); }
  const bp = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.3, 0.25), dark); bp.position.set(0, 0.75, -4.15); lorryBody.add(bp);
  // cargo box (open top)
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 5.6), red); bed.position.set(0, 1.05, 1.1); lorryBody.add(bed);
  const wallM = STD('#ffcc80', { roughness: 0.8, map: canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#d7a86e'; c.fillRect(0, 0, w, h); c.fillStyle = '#b5844a'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 4, h); }) });
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 5.6), wallM); sw.position.set(s * 1.21, 1.7, 1.1); lorryBody.add(sw); }
  const fw = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.1, 0.08), wallM); fw.position.set(0, 1.7, -1.7); lorryBody.add(fw);
  const bw = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.1, 0.08), wallM); bw.position.set(0, 1.7, 3.9); lorryBody.add(bw);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.8), L('#fff', { map: canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#fff8e1'; c.fillRect(0, 0, w, h); c.fillStyle = '#2e7d32'; c.font = '900 58px Inter'; c.textAlign = 'center'; c.fillText('MELON EXPRESS', w / 2, 68); }) }));
  sign.rotation.y = Math.PI / 2; sign.position.set(1.26, 1.7, 1.1); lorryBody.add(sign); const sign2 = sign.clone(); sign2.rotation.y = -Math.PI / 2; sign2.position.x = -1.26; lorryBody.add(sign2);
  for (const z of [-3.0, 0.8, 2.6]) for (const s of [-1, 1]) { const w = makeWheel(0.52, 0.36); w.position.set(s * 1.08, 0.52, z); lorry.add(w); }
  // driver in the cab
  const dg = new THREE.Group(); dg.position.set(0.55, 1.9, -3.2); lorryBody.add(dg);
  const skin = STD('#e0ac69'); const tor = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.4, 4, 10), STD('#f57f17')); tor.position.y = 0.3; dg.add(tor);
  const hd = new THREE.Group(); hd.position.y = 0.95; dg.add(hd); hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skin));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), STD('#1565c0')); cap.position.y = 0.04; hd.add(cap);
  const peak = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.18), STD('#1565c0')); peak.position.set(0, 0.06, -0.26); hd.add(peak);
  const mus = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.05), STD('#4e342e')); mus.position.set(0, -0.06, -0.21); hd.add(mus);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), STD('#111')); e.position.set(s * 0.08, 0.04, -0.2); hd.add(e); }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6), STD('#6d2b1f')); mouth.scale.set(1.3, 0.5, 0.5); mouth.position.set(0, -0.12, -0.19); hd.add(mouth);
  const arm = new THREE.Group(); arm.position.set(0.28, 0.5, -0.05); dg.add(arm); const am = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.6, 8), STD('#f57f17')); am.position.y = -0.3; arm.add(am); const hn = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), skin); hn.position.y = -0.62; arm.add(hn);
  lorryDrv = { g: dg, hd, arm, mouth };
  lorry.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
// melon heap in the cargo box (lorry-local)
const heap = []; { const R = rng(9); for (let ly = 0; ly < 4; ly++) { const nx = 4 - (ly >= 2 ? 1 : 0), nz = 9 - ly * 2; for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) {
  const x = (ix - (nx - 1) / 2) * 0.58 + (R() - 0.5) * 0.08, z = 1.1 + (iz - (nz - 1) / 2) * 0.6 + (R() - 0.5) * 0.08, y = 1.45 + ly * 0.5 + (R() - 0.5) * 0.06; heap.push({ x, y, z, ry: R() * 3, rx: (R() - 0.5) * 0.4 }); } } }
const NHEAP = heap.length;
const heapMesh = new THREE.InstancedMesh(melonGeo, melonM, NHEAP); heapMesh.castShadow = heapMesh.receiveShadow = true; lorryBody.add(heapMesh);
// flying melons: a subset of the heap
const NF = Math.min(NHEAP, 120);
const flyIdx = heap.map((h, i) => i).sort((a, b) => (heap[b].y - heap[a].y) || (hash(a) - hash(b))).slice(0, NF);
const fly = flyIdx.map((hi, k) => { const h = heap[hi]; const g = k % 3;
  const onCar = hash(k + 5) < 0.42; const tx = onCar ? HX + (hash(k + 9) - 0.5) * 1.6 : -2.8 + hash(k + 9) * 8.2, tz = onCar ? HZ + 1.6 + (hash(k + 13) - 0.5) * 3.8 : HZ + 2 - 7 + hash(k + 13) * 9;
  const tl = tJump + 0.05 + hash(k + 21) * 0.3, tland = tSp[g] - 0.03 + (hash(k + 33) - 0.5) * 0.22 + (k > 100 ? 0.45 : 0);
  return { hi, g, p0: V3(HX + h.x, h.y, LZ + h.z), p1: V3(tx, onCar ? 1.55 : 0.08, tz), onCar, tl, tland, ry: hash(k + 41) * 6, tilt: (hash(k + 47) - 0.5) * 0.5 }; });
const flyMesh = new THREE.InstancedMesh(melonGeo, melonM, NF); flyMesh.castShadow = true; hill.add(flyMesh);
const domeMesh = new THREE.InstancedMesh(domeGeo, melonM, NF * 2), fleshMesh = new THREE.InstancedMesh(fleshGeo, fleshM, NF * 2); domeMesh.castShadow = true; fleshMesh.receiveShadow = true; hill.add(domeMesh); hill.add(fleshMesh); [flyMesh, domeMesh, fleshMesh].forEach(m => m.frustumCulled = false);
const splatGeo = new THREE.CircleGeometry(0.6, 16); splatGeo.rotateX(-Math.PI / 2);
const splatMesh = new THREE.InstancedMesh(splatGeo, STD('#ff3b5c', { roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }), NF); hill.add(splatMesh); splatMesh.frustumCulled = false;
const G_ = V3(0, -9.8 * Math.cos(A), 9.8 * Math.sin(A));
// melon hat on the traffic light (wrong) + single melon (right)
const hatHalf = new THREE.Group(); TL_.add(hatHalf); hatHalf.position.set(0, 4.22, 0);
{ const d = new THREE.Mesh(domeGeo, melonM); d.rotation.x = Math.PI; hatHalf.add(d); const f = new THREE.Mesh(fleshGeo, fleshM); f.rotation.x = Math.PI; hatHalf.add(f); hatHalf.scale.setScalar(1.25); hatHalf.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const one = new THREE.Mesh(melonGeo, melonM); one.castShadow = true; hill.add(one);
const halves = [0, 1].map(i => { const g = new THREE.Group(); hill.add(g); const d = new THREE.Mesh(domeGeo, melonM); g.add(d); const f = new THREE.Mesh(fleshGeo, fleshM); g.add(f); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; });

// ---------------- hero + driver ----------------
const hero = makeCar('#1e88e5'); hill.add(hero);
function heroWrong(t) {
  const p = { x: HX, y: 0, z: HZ, h: 0, pitch: 0, roll: 0 };
  if (t < 2.0) p.z = HZ - 26 * Math.pow(1 - clamp(t / 2.0), 2) * 0 ;
  // clutch out too fast: jolt + stall shake
  const j = win(t, tFast - 0.1, tFast + 0.5, 0.08); p.z -= 0.15 * j; p.pitch = 0.03 * j * Math.sin((t - tFast) * 30);
  // roll back into the lorry
  const tb = tBonk + 0.02; const u = clamp((t - tRoll + 0.25) / (tb - tRoll + 0.25)); p.z += 1.52 * u * u;
  if (t > tb) { p.z = HZ + 1.52 - 0.3 * easeOut(clamp((t - tb) / 0.4)); }
  return p;
}
const T_GO = tUp - 0.85;
function heroRight(t) {
  const p = { x: HX, y: 0, z: HZ, h: 0, pitch: 0, roll: 0 };
  if (t > T_GO) { const tt = t - T_GO; p.z = HZ - (tt < 2 ? 1.6 * tt * tt : 6.4 + 6.4 * (tt - 2)); p.pitch = -0.02 * win(t, T_GO, T_GO + 1.0, 0.3); }
  return p;
}
const heroPose = t => isRight(t) ? heroRight(t) : heroWrong(t);
function makePerson(shirt, pants = '#37474f', skinC = '#f1c27d', parent = hill) {
  const g = new THREE.Group(); const skin = STD(skinC), sh = STD(shirt), pm = STD(pants);
  const tor = new THREE.Group(); tor.position.y = 0.92; g.add(tor);
  const torM = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.42, 4, 12), sh); torM.position.y = 0.28; tor.add(torM);
  const hd = new THREE.Group(); hd.position.y = 0.76; tor.add(hd); hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), skin));
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), STD('#4e342e')); hair.position.y = 0.03; hd.add(hair);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.03, 6, 20), STD('#e53935')); band.rotation.x = Math.PI / 2; band.position.y = 0.05; hd.add(band);
  for (const s of [-1, 1]) { const ew = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), STD('#fff')); ew.position.set(s * 0.065, 0.04, 0.15); hd.add(ew); const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), STD('#111')); e.position.set(s * 0.065, 0.04, 0.19); hd.add(e); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12), STD('#6d2b1f')); mouth.position.set(0, -0.07, 0.17); hd.add(mouth);
  const hips = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.92, 0); g.add(hip); const th = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.9, 8), pm); th.position.y = -0.45; hip.add(th); const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.26), STD('#111')); shoe.position.set(0, -0.9, 0.05); hip.add(shoe); return hip; });
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.28, 0.5, 0); tor.add(a); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.58, 8), sh); m.position.y = -0.29; a.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), skin); h.position.y = -0.62; a.add(h); return a; });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); const up = upright(0, 0, parent); up.add(g); return { up, g, tor, hd, arms, hips };
}
const drv = makePerson('#ffffff', '#212121');   // karate: white shirt, red headband
const DPOS = V3(3.6, 0, 5.5);                   // standing behind the right rear wheel
function drvState(t) {   // right way only
  const s = { vis: false, x: DPOS.x, z: DPOS.z, yaw: Math.PI * 0.75, armR: [0, 0], armL: [0, 0], hop: 0, crouch: 0 };
  if (!isRight(t)) return s;
  const tOut = tAsk - 0.4, tIn = tJuicy + 0.6;
  if (t < tOut || t > tIn + 0.5) return s; s.vis = true;
  const kOut = clamp((t - tOut) / 0.45); s.x = lerp(2.7, DPOS.x, easeOut(kOut)); s.hop = 0.5 * Math.sin(Math.PI * kOut);
  const kIn = clamp((t - tIn) / 0.45); if (kIn > 0) { s.x = lerp(DPOS.x, 2.7, kIn); s.hop = 0.5 * Math.sin(Math.PI * kIn); s.vis = kIn < 0.98; }
  // catch (arms forward)
  const ca = win(t, tMelon - 0.3, tKarate - 0.1, 0.2); s.armR = [-1.3 * ca, 0]; s.armL = [-1.3 * ca, 0];
  // karate: raise right arm, chop
  const up = win(t, tKarate - 0.05, tChop + 0.05, 0.12), dn = win(t, tChop + 0.02, tChop + 0.6, 0.06);
  if (up > 0) s.armR = [-2.8 * up, 0.2 * up]; if (dn > 0) s.armR = [-0.9 * dn, 0]; s.crouch = 0.12 * win(t, tKarate - 0.1, tChop + 0.7, 0.15);
  // putting halves behind the wheels: bend down
  const aw = win(t, tPut - 0.35, tJuicy + 0.1, 0.3); s.x = lerp(s.x, 4.9, aw); s.z = lerp(s.z, 8.2, aw); if (aw > 0.2) { s.armR = [-1.2, 0]; s.armL = [-1.2, 0]; }
  // proud pose
  const pr = win(t, tJuicy - 0.1, tIn, 0.2); if (pr > 0) { s.armR = [0, 2.6 * pr]; s.yaw = lerp(s.yaw, Math.PI * 0.95, pr); }
  return s;
}

// ---------------- camera (hill-local) ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), 40]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const SIDE = Ac([42, 5.0, 4], [1.5, 2.0, 4.5], 22);
const BEHINDL = Ac([-1.8, 4.6, -9.5], [1.8, 1.4, 6.5]);
const WIDE = Ac([-6.5, 9.0, -14], [1.6, 0.5, 6.5]);
const camKeys = [
  [0.0, Ac([3.0, 3.9, 3.4], [4.35, 3.9, -0.3])],
  [tOn - 0.3, Ac([2.9, 3.8, 3.8], [4.35, 3.8, -0.3])],
  ...cut(tOn - 0.25, SIDE),
  [tAnd0 - 0.2, Ac([41, 5.4, 5.5], [1.5, 2.0, 5.2], 22)],
  ...cut(tAnd0 - 0.15, BEHINDL),
  [tFull - 0.3, Ac([-1.6, 4.9, -8.5], [1.8, 1.6, 7.0])],
  ...cut(tFull - 0.25, Ac([4.6, 6.4, 6.5], [1.8, 2.0, 11.5])),
  [tTen - 0.1, Ac([4.4, 7.0, 5.8], [1.8, 2.2, 11.5])],
  [tWhat - 0.3, Ac([6.5, 11.5, 19], [1.8, 1.2, 6.5])],
  ...cut(tWhat - 0.25, WIDE),
  [S('wrong1').start - 0.2, Ac([-6.8, 9.3, -14.4], [1.6, 0.5, 6.5])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([6.5, 2.6, -3.5], [1.8, 1.1, 5.5])),
  [tRoll - 0.3, Ac([6.8, 2.6, -3.0], [1.8, 1.1, 6.0])],
  ...cut(tRoll - 0.25, Ac([13.0, 2.4, 6.0], [1.8, 1.0, 5.6], 30)),
  [tBonk + 0.3, Ac([13.0, 2.5, 6.2], [1.8, 1.1, 5.8], 30)],
  ...cut(tWobble - 0.4, Ac([6.2, 5.6, 16.5], [1.8, 2.0, 9.5])),
  [tAnd1 - 0.1, Ac([6.0, 5.8, 16.2], [1.8, 2.0, 9.5])],
  ...cut(tAnd1 - 0.05, Ac([-7.0, 3.2, -8.0], [1.8, 6.0, 7.0])),
  [tJump + 0.9, Ac([-7.5, 3.6, -9.5], [1.8, 9.5, 6.0])],
  [tThey + 0.4, Ac([-7.5, 3.6, -9.5], [1.8, 6.5, 5.0])],
  ...cut(tSp[0] - 0.35, Ac([-5.5, 6.5, -6.0], [1.8, 0.8, 4.0])),
  [tNow - 0.2, Ac([-5.3, 6.2, -5.5], [1.8, 0.8, 4.0])],
  ...cut(tNow - 0.15, Ac([-3.6, 4.6, -3.5], [1.9, 0.8, 4.2])),
  [tLight - 0.5, Ac([-3.3, 4.4, -3.0], [1.9, 0.8, 4.2])],
  ...cut(tLight - 0.45, Ac([2.4, 4.0, 3.5], [4.35, 4.0, -0.3])),
  [tRew0, Ac([2.2, 4.3, 4.3], [4.35, 4.0, -0.3])],
  // right
  [tRew0 + 0.55, WIDE],
  [tHand - 0.3, WIDE],
  ...cut(tHand - 0.25, Ac([7.0, 3.4, -1.0], [2.2, 1.0, 6.5])),
  [tMelon + 0.6, Ac([7.4, 3.6, -0.5], [2.4, 1.2, 6.5])],
  ...cut(tKarate - 0.25, Ac([6.2, 1.9, 1.2], [3.0, 1.0, 4.7])),
  [tPut - 0.3, Ac([6.0, 1.9, 1.5], [3.0, 0.9, 4.7])],
  ...cut(tPut - 0.25, Ac([5.4, 1.2, 6.0], [2.6, 0.35, 4.3])),
  [tJuicy - 0.3, Ac([5.0, 0.95, 5.6], [2.6, 0.3, 4.3])],
  [tGreen - 0.3, Ac([4.8, 0.85, 5.4], [2.6, 0.3, 4.3])],
  ...cut(tGreen - 0.25, Ac([2.4, 4.0, 3.5], [4.35, 3.05, -0.3])),
  [tGas - 0.3, Ac([2.4, 4.0, 3.6], [4.35, 3.05, -0.3])],
  ...cut(tGas - 0.25, Ac([-2.0, 2.6, 9.0], [1.8, 0.9, -2.0])),
  [tNot - 0.3, Ac([-2.4, 3.0, 9.5], [1.8, 0.8, -6.0])],
  ...cut(tNot - 0.25, Ac([4.8, 1.0, 7.0], [2.2, 0.7, 0.0])),
  [tGets - 0.2, Ac([4.8, 1.1, 7.0], [2.0, 0.8, -2.0])],
  ...cut(tGets - 0.15, Ac([6.4, 3.2, 3.6], [3.0, 2.6, 7.4])),
  [tLunch - 0.4, Ac([5.7, 3.1, 4.6], [3.1, 2.8, 7.6])],
  [S('right6').start - 0.1, Ac([5.4, 3.1, 5.0], [3.1, 2.85, 7.7])],
  ...cut(tAll - 0.1, Ac([-3.0, 6.5, -6.0], [1.8, 1.5, 8.0])),
  [S('right7').start - 0.2, Ac([-3.5, 7.5, -12], [1.8, 1.8, 0])],
  ...cut(S('right7').start - 0.15, Ac([-2.5, 6.5, 9.0], [1.8, 2.0, -30])),
  [S('outro').start, Ac([-3.5, 9.0, 13], [1.8, 3.0, -32])],
  [TOTAL - 0.3, Ac([-6, 15, 21], [1.8, 5, -38])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: HL(...Aa[0].lerp(B[0], u).toArray()), l: HL(...Aa[1].lerp(B[1], u).toArray()), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
function lorryRZ(t) { if (!isRight(t)) return LZ; const t0 = tAll - 1.2; if (t < t0) return LZ; const tt = t - t0; return LZ - (tt < 2 ? 1.2 * tt * tt : 4.8 + 4.8 * (tt - 2)); }
function update(t) {
  const right = isRight(t);
  // lights
  const green = right && t > tGreen - 0.05; const amber = right && t > tGreen - 0.7 && !green;
  lamps.r.emissiveIntensity = green || amber ? 0.06 : 1.0; lamps.y.emissiveIntensity = amber ? 1.0 : 0.06; lamps.g.emissiveIntensity = green ? 1.0 : 0.06;
  // hero
  const hp = heroPose(t); placeCar(hero, hp);
  const squash = !right ? ramp(t, tSp[0], tSp[2] + 0.3) : 0; hero.userData.bodyG.scale.set(1 + 0.04 * squash, 1 - 0.22 * squash, 1); hero.userData.bodyG.rotation.z = -0.03 * squash;
  blink(hero, t, false, false);
  // lorry wobble after the bonk
  const tb = tBonk + 0.02; const wob = !right && t > tb ? Math.exp(-(t - tb) * 1.3) : 0;
  lorry.position.set(HX, 0, lorryRZ(t)); lorryBody.rotation.set(0.05 * wob * Math.sin((t - tb) * 9), 0, 0.06 * wob * Math.sin((t - tb) * 7 + 1));
  const lw = (lorryRZ(t) - LZ); lorry.children.forEach(o => { if (o.type === 'Group' && o !== lorryBody) o.rotation.x = -lw / 0.52; });
  // heap
  const flying = new Set(); fly.forEach(f => { if (!right && t > f.tl) flying.add(f.hi); });
  for (let i = 0; i < NHEAP; i++) { const h = heap[i]; if (flying.has(i)) { heapMesh.setMatrixAt(i, ZERO); continue; }
    const jig = wob * 0.08 * Math.sin(t * 17 + i); _e.set(h.rx + jig, h.ry, jig); _q.setFromEuler(_e); _m.compose(_p.set(h.x, h.y + Math.abs(jig) * 1.5, h.z), _q, _s.set(1, 1, 1)); heapMesh.setMatrixAt(i, _m); }
  heapMesh.instanceMatrix.needsUpdate = true;
  // flying melons + splats
  const hpz = hp.z; let k2 = 0;
  fly.forEach((f, k) => {
    let fm = ZERO, d1 = ZERO, d2 = ZERO, sp = ZERO;
    if (!right && t > f.tl) {
      const p1 = f.p1.clone(); if (f.onCar) p1.z += hpz - HZ, p1.y = 1.55 - 0.3 * squash;
      if (t < f.tland) { const T = f.tland - f.tl, u = t - f.tl; const v0 = p1.clone().sub(f.p0).multiplyScalar(1 / T).addScaledVector(G_, -0.5 * T);
        _p.copy(f.p0).addScaledVector(v0, u).addScaledVector(G_, 0.5 * u * u); _e.set(u * 4 + k, f.ry + u * 3, 0); _q.setFromEuler(_e); fm = _m.compose(_p, _q, _s.set(1, 1, 1)).clone(); }
      else { const k = clamp((t - f.tland) / 0.25); const sq = 1 + 0.4 * Math.exp(-(t - f.tland) * 10);
        // two halves, flesh up, sliding apart
        for (const s of [-1, 1]) { _e.set(f.tilt, f.ry, s * 0.1); _q.setFromEuler(_e); const off = V3(s * 0.22 * easeOut(k), 0, 0).applyQuaternion(_q);
          const M = new THREE.Matrix4().compose(V3(p1.x + off.x, p1.y + MR * 0.9 + 0.02, p1.z + off.z), _q, _s.set(sq * 0.95, 0.9 / sq, sq * 0.95)); if (s < 0) d1 = M; else d2 = M; }
        if (!f.onCar) { const sk = easeOut(clamp((t - f.tland) / 0.3)) * (0.7 + hash(k) * 0.6); sp = new THREE.Matrix4().compose(V3(p1.x, 0.075, p1.z), _q.identity(), _s.set(sk, 1, sk)); } }
    }
    flyMesh.setMatrixAt(k, fm); domeMesh.setMatrixAt(2 * k, d1); domeMesh.setMatrixAt(2 * k + 1, d2); fleshMesh.setMatrixAt(2 * k, d1); fleshMesh.setMatrixAt(2 * k + 1, d2); splatMesh.setMatrixAt(k, sp);
  });
  flyMesh.instanceMatrix.needsUpdate = domeMesh.instanceMatrix.needsUpdate = fleshMesh.instanceMatrix.needsUpdate = splatMesh.instanceMatrix.needsUpdate = true;
  // melon hat on the light
  const hk = !right ? back(clamp((t - tSp[2] - 0.05) / 0.35)) : 0; hatHalf.visible = hk > 0.01; hatHalf.scale.setScalar(Math.max(0.01, 1.25 * hk));
  // lorry driver
  const lean = right ? win(t, tAsk - 0.3, tMelon + 0.5, 0.3) : 0; const eat = right && t > tChocks + 0.3;
  lorryDrv.g.position.x = 0.55 + 0.85 * lean; lorryDrv.arm.rotation.set(0, 0, 0); if (lean > 0) lorryDrv.arm.rotation.z = 1.9 * lean + 0.4 * Math.sin(t * 9) * lean;
  if (!right && t > tBonk && t < tAnd1 + 0.4) lorryDrv.hd.rotation.x = -0.25 * win(t, tBonk, tAnd1 + 0.4, 0.2);
  else lorryDrv.hd.rotation.x = 0;
  if (eat) { lorryDrv.g.position.x = 0.55 + 0.85 * ramp(t, tChocks - 0.3, tChocks + 0.1); lorryDrv.arm.rotation.z = 1.2; }
  // the single melon (right): lorry window -> driver's hands -> road -> chop
  const drs = drvState(t);
  one.visible = false; halves.forEach(h => h.visible = false);
  if (right) {
    lorry.updateMatrixWorld(true);
    const tThrow = tMelon - 0.15, tCatch = tMelon + 0.55, tDown = tKarate - 0.25;
    const win0 = V3(HX + 1.4, 2.6, LZ - 3.2), hands = V3(DPOS.x - 0.32, 1.05, DPOS.z - 0.32), road = V3(DPOS.x - 0.55, MR * 1.0, DPOS.z - 0.45);
    if (t > tThrow - 0.6 && t < tChop + 0.03) { one.visible = true; let p;
      if (t < tThrow) p = win0;
      else if (t < tCatch) { const u = clamp((t - tThrow) / (tCatch - tThrow)); p = win0.clone().lerp(hands, u); p.y += 2.0 * u * (1 - u) * 1.6; one.rotation.set(u * 6, u * 3, 0); }
      else if (t < tDown) p = hands; else { p = hands.clone().lerp(road, ease(clamp((t - tDown) / 0.25))); one.rotation.set(0, 0, 0); }
      one.position.copy(p); }
    if (t >= tChop + 0.03) { // two halves
      const wheelZ = HZ + 1.38 + 0.5; const tgt = [V3(HX + 0.84, MR * 0.95, wheelZ), V3(HX - 0.84, MR * 0.95, wheelZ)];
      halves.forEach((h, i) => { const s = i ? -1 : 1; const k = easeOut(clamp((t - tChop - 0.03) / 0.18)); let pos = V3(road.x + s * 0.4 * k, MR * 0.5, road.z), rx = 0, ry = 0, rz = -s * 0.25 * k;
        // to the wheels (flesh facing the tyre: rotate so the flat side faces -z)
        const m = ease(clamp((t - tPut) / (tWheels - tPut + 0.2))); if (m > 0) { pos = pos.lerp(tgt[i], m); rx = lerp(rx, Math.PI / 2, m); rz = lerp(rz, 0, m); }
        // lunch: back to the lorry driver
        const tl0 = tChocks + 0.1 + i * 0.18, tl1 = tl0 + 0.75;
        if (t > tl0) { const u = clamp((t - tl0) / (tl1 - tl0)); lorryDrv.g.updateMatrixWorld(true); const mouthW = lorryDrv.hd.localToWorld(V3(i ? 0.15 : -0.15, -0.12, -0.32)); const mouthL = hill.worldToLocal(mouthW.clone());
          pos = tgt[i].clone().lerp(mouthL, ease(u)); pos.y += 3.0 * u * (1 - u); rx = lerp(Math.PI / 2, Math.PI / 2 + (i ? -0.5 : 0.5), u); ry = 0; rz = u * 6.28 * 2 * (1 - u);
          if (u >= 1) { pos = mouthL; const bite = 1 - 0.35 * clamp((t - tLunch - 0.2) / 1.2); h.scale.set(bite, 1, bite); } }
        h.visible = true; h.position.copy(pos); h.rotation.set(rx, ry, rz); });
    }
  }
  // karate driver
  drv.up.visible = drs.vis; if (drs.vis) { drv.up.position.set(drs.x, 0, drs.z); drv.g.position.y = drs.hop - drs.crouch; drv.g.rotation.y = drs.yaw;
    drv.arms[1].rotation.set(drs.armR[0], 0, -drs.armR[1]); drv.arms[0].rotation.set(drs.armL[0], 0, drs.armL[1]); drv.tor.rotation.x = drs.crouch * 1.4; drv.hips.forEach(h => h.rotation.x = -drs.crouch * 1.2); }
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  applyCam(c, t, (!right && (win(t, tb - 0.03, tb + 0.35, 0.05) + win(t, tSp[0], tSp[2] + 0.4, 0.05)) > 0) ? 0.05 : 0);
  camera.updateMatrixWorld(true); hero.updateMatrixWorld(true); lorry.updateMatrixWorld(true);
  screen = { car: project(hero.localToWorld(V3(0, 2.0, 0))), lorryDrv: project(lorryDrv.hd.localToWorld(V3(0, 0.5, 0))), light: project(TL_.localToWorld(V3(0, 4.6, 0))), drv: project(drv.hd.localToWorld(V3(0, 0.4, 0))), heap: project(lorry.localToWorld(V3(0, 3.6, 1.1))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0) => [clamp(p.x, 230, W - 230), clamp(p.y + dy, 560, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -120) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, h / 2 - 4); ctx.lineTo(0, h / 2 + 34); ctx.lineTo(22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function counter(t, a, b) { if (t < a || t > b) return; const n = Math.round(10000 * ease(clamp((t - a) / 0.9))); P_(`WATERMELONS: ${n.toLocaleString('en-US')}`, '#2e7d32', a, b, 48); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('RED LIGHT', RED, tRed - 0.1, tSteep - 0.2, 54);
    P_('GRADIENT: 25%', '#ef6c00', tSteep - 0.2, tAnd0 - 0.1, 50, iconWarn);
    P_('BEHIND YOU: A LORRY', '#455a64', tLorry - 0.2, tFull - 0.1, 46);
    counter(t, tFull - 0.1, S('hook2').end + 0.3);
    P_('CLUTCH OUT TOO FAST', RED, tClutch - 0.2, tRoll - 0.1, 46, iconX);
    P_('ROLLING BACK...', RED, tRoll - 0.1, tBig - 0.1, 50);
    floatText('BONK!', W / 2, 760, t, tBonk - 0.02, tBonk + 0.8, 170, '#ffffff', -0.08);
    P_('LORRY: WOBBLING', '#ef6c00', tWobble - 0.2, tAnd1 - 0.1, 50);
    P_('10,000 MELONS: AIRBORNE', RED, tJump - 0.2, tSp[0] - 0.3, 44);
    floatText('SPLAT!', W / 2 - 160, 700, t, tSp[0] - 0.02, tSp[0] + 0.8, 140, '#ff5c7a', -0.1);
    floatText('SPLAT!', W / 2 + 150, 850, t, tSp[1] - 0.02, tSp[1] + 0.8, 150, '#ff5c7a', 0.1);
    floatText('SPLAT!', W / 2, 1000, t, tSp[2] - 0.02, tSp[2] + 0.9, 170, '#ff5c7a', -0.05);
    P_('YOUR CAR: FRUIT SALAD', '#ad1457', tSalad - 0.4, tLight - 0.5, 46);
    P_('LIGHT: STILL RED', RED, tStill - 0.2, tRew0, 50);
  } else {
    P_('HANDBRAKE: ON', GREEN, tHand - 0.1, tAsk - 0.1, 52, iconCheck);
    bubble('JUST ONE, PLEASE!', screen.drv, t, tAsk + 0.1, tMelon - 0.2, 46, '#fff', '#111', -110);
    P_('1 WATERMELON', '#2e7d32', tOneM - 0.2, tKarate - 0.15, 52);
    bubble('HI-YAH!', screen.drv, t, tChop - 0.1, tChop + 0.7, 64, YEL, '#111', -120);
    P_('KARATE CHOP', '#37474f', tKarate - 0.1, tPut - 0.1, 52);
    P_('HALVES BEHIND THE WHEELS', '#ad1457', tPut - 0.1, tJuicy - 0.15, 42);
    P_('JUICIEST WHEEL CHOCKS', GREEN, tJuicy - 0.1, tGreen - 0.2, 46, iconCheck);
    P_('GREEN', GREEN, tGreen - 0.1, tGas - 0.2, 56, iconCheck);
    P_('GAS. HANDBRAKE OFF. UP!', '#00897b', tGas - 0.1, tNot - 0.1, 44);
    P_('ROLLBACK: 0 CM', GREEN, tNot - 0.1, tGets - 0.15, 54, iconCheck);
    P_('CHOCKS = LUNCH', '#ad1457', tChocks - 0.2, S('right6').start, 50);
    bubble('YUM!', screen.lorryDrv, t, tLunch + 0.15, S('right6').start + 0.3, 70, '#fff', '#ad1457', -110);
    P_('ON BOARD: 10,000 / 10,000', GREEN, tAll - 0.1, S('right7').start, 42, iconCheck);
  }
}
window.dbg = { heroPose, cam };
start(update, hud);
