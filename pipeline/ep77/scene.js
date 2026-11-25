// Episode 72: Narrow country road – a combine harvester as wide as the whole road comes over the hill
// wrong: squeeze past on the verge -> there isn't room: the reel grabs you, the combine harvests you like wheat ->
//        out the back pops a hay bale with wheels, it rolls down the hill into the barn, where the cows are hungry
// right: pull into the field gate, stop, flash once: thank you -> the farmer waves back, has an idea ->
//        harvests you a brand-new road straight through the wheat -> you follow through a golden corridor ->
//        at the other end he throws your car a straw hat: it suits you
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, makeCar, makeWheel, placeCar, applyCam, project, roundedPath, pathAt,
  YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, bigText, start, aoPass, hemi, sun, asphaltMat, _m, _q, _v, _s, _c, _e
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
const tNarrow = WT('hook1', 'Narrow'), tHarvT = WT('hook1', 'Harvest'), tThen = WT('hook1', 'Then'), tHuge = WT('hook1', 'huge'), tHill = WT('hook1', 'hill');
const tComb = WT('hook2', 'combine'), tWide = WT('hook2', 'wide'), tComing = WT('hook2', 'coming'), tWhat = WT('hook2', 'What');
const W1 = S('wrong1').start, tSqueeze = WT('wrong1', 'squeeze'), tRoom = WT('wrong1', 'room');
const tIsnt = WT('wrong2', 'isn'), tReel = WT('wrong2', 'reel'), tGrabs = WT('wrong2', 'grabs'), tHarvW = WT('wrong2', 'harvests'), tLike = WT('wrong2', 'Like');
const tPops = WT('wrong3', 'pops'), tHay = WT('wrong3', 'hay'), tWheels = WT('wrong3', 'wheels'), tRolls = WT('wrong3', 'rolls'), tBarn = WT('wrong3', 'barn'), tCows = WT('wrong3', 'cows'), tHungry = WT('wrong3', 'hungry');
const tPull = WT('right2', 'Pull'), tGate = WT('right2', 'gate'), tStop = WT('right2', 'Stop'), tFlash = WT('right2', 'flash'), tThank = WT('right2', 'thank');
const tFarmer = WT('right3', 'farmer'), tWaves = WT('right3', 'waves'), tIdea = WT('right3', 'idea');
const tHarvR = WT('right4', 'harvests'), tBrand = WT('right4', 'brand'), tStraight = WT('right4', 'Straight');
const tFollow = WT('right5', 'follow'), tGolden = WT('right5', 'golden'), tLeft = WT('right5', 'Wheat', 0), tRightW = WT('right5', 'Wheat', 1);
const tOther = WT('right6', 'other'), tGives = WT('right6', 'gives'), tHat = WT('right6', 'hat'), tSuits = WT('right6', 'suits');
const isRight = t => t >= tRew0 + 0.5;
const T_HR = tHarvR - 0.3;                         // right: combine is in the field from here (cut)

// ---------------- terrain ----------------
const crest = z => 6.5 * Math.exp(-(((z + 85) / 40) ** 2));
const side = x => x > 18 ? -0.1 * (x - 18) - 0.0012 * (x - 18) ** 2 * 0 : 0;
const HG = (x, z) => crest(z) + side(x);
const slopePitch = (x, z, h) => { const fx = -Math.sin(h), fz = -Math.cos(h); return Math.atan((HG(x + fx, z + fz) - HG(x - fx, z - fz)) / 2); };
{ const g = new THREE.PlaneGeometry(520, 480, 260, 240); g.rotateX(-PI / 2); g.translate(40, 0, -80);
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, HG(x, z)); _c.set(hash(i) > 0.5 ? '#7cbf4a' : '#86c753'); if (Math.abs(x) < 4.2) _c.set('#8ac455'); col.set([_c.r, _c.g, _c.b], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })); m.receiveShadow = true; scene.add(m); }
// road ribbon along x = 0
{ const pos = [], uv = [], idx = []; let k = 0; const RW = 2.6;
  for (let z = 90; z >= -260; z -= 1) { for (const x of [-RW, RW]) { pos.push(x, HG(x, z) + 0.05, z); } uv.push(0, z / 6, 1, z / 6); if (k) idx.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k - 1, 2 * k + 1, 2 * k); k++; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: asphaltMat.map, color: '#ffffff', side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m);
  const em = new THREE.MeshLambertMaterial({ color: '#efefef', side: THREE.DoubleSide });
  for (const sx of [-1, 1]) { const pp = [], ii = []; let j = 0; for (let z = 90; z >= -260; z -= 1) { for (const dx of [-0.07, 0.07]) pp.push(sx * 2.35 + dx, HG(0, z) + 0.07, z); if (j) ii.push(2 * j - 2, 2 * j - 1, 2 * j, 2 * j - 1, 2 * j + 1, 2 * j); j++; }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3)); gg.setIndex(ii); scene.add(new THREE.Mesh(gg, em)); } }

// ---------------- wheat canopy ----------------
const wheatT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e9bf55'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const x = hash(i) * w, y = hash(i + 7) * h; c.fillStyle = ['#f6d77a', '#cf9d3a', '#fbe39a', '#b98a2e'][i % 4]; c.save(); c.translate(x, y); c.rotate(hash(i + 3) * 0.6 - 0.3); c.fillRect(-1.5, -5, 3, 10); c.restore(); } }, true);
wheatT.repeat.set(1, 1);
const CANH = 1.05, CW0 = 4.0, CX1 = 72;                   // canopy height, inner edge, field end (+x side)
const STRIP = { x0: 4, x1: 72, z0: -16, z1: -8 };
const inStrip = (x, z) => x > STRIP.x0 - 0.01 && x < STRIP.x1 + 0.01 && z > STRIP.z0 - 0.01 && z < STRIP.z1 + 0.01;
const BARN = { x: 50.5, z: -31, w: 12, d: 11 };
{ // coarse canopy (2 m grid), holes for road, strip, barn yard
  const pos = [], uv = [], col = [], idx = []; const X0 = -150, X1 = 150, Z0 = -250, Z1 = 90, st = 2;
  const nx = (X1 - X0) / st + 1, nz = (Z1 - Z0) / st + 1;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = X0 + i * st, z = Z0 + j * st; pos.push(x, HG(x, z) + CANH, z); uv.push(x / 3, z / 3); _c.set('#ffffff').multiplyScalar(0.92 + 0.12 * hash(i * 977 + j)); col.push(_c.r, _c.g, _c.b); }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const cx = X0 + (i + 0.5) * st, cz = Z0 + (j + 0.5) * st;
    if (Math.abs(cx) < CW0 || (cx > CX1) || inStrip(cx, cz) || (Math.abs(cx - BARN.x) < 13 && Math.abs(cz - BARN.z) < 11) || (cx < -60) || (cz < -200)) continue;
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: wheatT, vertexColors: true })); m.receiveShadow = true; scene.add(m);
  // skirt along the road edges and field end (so the canopy reads as a wall of wheat)
  const sk = [], si = [], su = []; let k = 0;
  const addWall = (pts) => { for (let n = 0; n < pts.length; n++) { const [x, z] = pts[n]; sk.push(x, HG(x, z) - 0.1, z, x, HG(x, z) + CANH, z); su.push(n * 0.7, 0, n * 0.7, 0.35); if (n) si.push(k - 2, k - 1, k, k - 1, k + 1, k); k += 2; } };
  for (const sx of [-1, 1]) { const pts = []; for (let z = 90; z >= -200; z -= 2) if (!(sx > 0 && z > -17 && z < -7)) pts.push([sx * CW0, z]); else { addWall(pts.splice(0)); } addWall(pts); }
  const wallT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c99a3a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { c.strokeStyle = ['#e7c262', '#a8792a', '#f0d27c'][i % 3]; c.lineWidth = 2; const x = hash(i) * w; c.beginPath(); c.moveTo(x, h); c.lineTo(x + (hash(i + 1) - 0.5) * 10, 0); c.stroke(); } c.fillStyle = '#f3d27a'; c.fillRect(0, 0, w, 18); }, true);
  const gw = new THREE.BufferGeometry(); gw.setAttribute('position', new THREE.Float32BufferAttribute(sk, 3)); gw.setAttribute('uv', new THREE.Float32BufferAttribute(su, 2)); gw.setIndex(si); gw.computeVertexNormals();
  const mw = new THREE.Mesh(gw, new THREE.MeshLambertMaterial({ map: wallT, side: THREE.DoubleSide })); mw.receiveShadow = true; scene.add(mw);
}
// fine strip canopy (the new road gets cut here)
const SR = 0.35, SNX = Math.round((STRIP.x1 - STRIP.x0) / SR) + 1, SNZ = Math.round((STRIP.z1 - STRIP.z0) / SR) + 1;
const stripGeo = (() => { const pos = new Float32Array(SNX * SNZ * 3), uv = [], col = new Float32Array(SNX * SNZ * 3), idx = [];
  for (let j = 0; j < SNZ; j++) for (let i = 0; i < SNX; i++) { const x = STRIP.x0 + i * (STRIP.x1 - STRIP.x0) / (SNX - 1), z = STRIP.z0 + j * (STRIP.z1 - STRIP.z0) / (SNZ - 1); const n = j * SNX + i; pos[n * 3] = x; pos[n * 3 + 1] = HG(x, z) + CANH; pos[n * 3 + 2] = z; uv.push(x / 3, z / 3); }
  for (let j = 0; j < SNZ - 1; j++) for (let i = 0; i < SNX - 1; i++) { const a = j * SNX + i, b = a + 1, c = a + SNX, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx); return g; })();
const stripMesh = new THREE.Mesh(stripGeo, new THREE.MeshLambertMaterial({ map: wheatT, vertexColors: true })); stripMesh.receiveShadow = true; stripMesh.castShadow = false; scene.add(stripMesh);
const GOLD = new THREE.Color('#ffffff'), STUB = new THREE.Color('#d9c28e');
let lastCut = null;
function cutStrip(cutX, gateOnly) {
  const key = (gateOnly ? 'g' : 'c') + cutX.toFixed(2); if (key === lastCut) return; lastCut = key;
  const p = stripGeo.attributes.position, col = stripGeo.attributes.color;
  for (let j = 0; j < SNZ; j++) for (let i = 0; i < SNX; i++) { const n = j * SNX + i, x = p.getX(n), z = p.getZ(n);
    const gate = x < 10.6 && Math.abs(z + 12) < 2.9; const cut = gate || (!gateOnly && x < cutX && Math.abs(z + 12) < 3.5);
    p.setY(n, HG(x, z) + (cut ? 0.1 : CANH)); const k = 0.92 + 0.12 * hash(n * 31); if (cut) _c.copy(STUB).multiplyScalar(k * 0.62); else _c.copy(GOLD).multiplyScalar(k); col.setXYZ(n, _c.r, _c.g, _c.b); }
  p.needsUpdate = true; col.needsUpdate = true; stripGeo.computeVertexNormals();
}
// trees, a hedge line, a farmhouse far away
{ const pts = []; const R = rng(77); while (pts.length < 420) { const x = (R() - 0.5) * 500 + 40, z = -80 + (R() - 0.5) * 460; const far = x < -62 || x > 85 || z < -205; if (!far) continue; pts.push([x, z, 0.9 + R() * 1.2, R()]); }
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.32, 2.2, 6), L('#6d4a2b'), pts.length);
  const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.4, 1), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length);
  pts.forEach(([x, z, s, r], i) => { const y = HG(x, z); _m.compose(_v.set(x, y + 1.1 * s, z), _q.identity(), _s.set(s, s, s)); trunk.setMatrixAt(i, _m);
    _e.set(r * 3, r * 6, 0); _q.setFromEuler(_e); _m.compose(_v.set(x, y + 3.6 * s, z), _q, _s.set(s * 1.1, s * 1.25, s * 1.1)); leaf.setMatrixAt(i, _m); leaf.setColorAt(i, _c.set(['#3f8f2e', '#4fa336', '#2f7a28', '#5fb33f'][(r * 4) | 0])); });
  trunk.castShadow = leaf.castShadow = true; scene.add(trunk); scene.add(leaf);
  const fh = new THREE.Group(); fh.position.set(-90, HG(-90, -40), -40); scene.add(fh);
  const b = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 9), L('#f3ead8')); b.position.y = 3; fh.add(b);
  const rf = new THREE.Mesh(new THREE.ConeGeometry(9, 4.5, 4), L('#b5462f')); rf.rotation.y = PI / 4; rf.scale.set(1, 1, 0.75); rf.position.y = 8.2; fh.add(rf); fh.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// field gate (posts + open gate leaning into the wheat)
{ const wood = L('#8d6e63'); const yb = HG(4.2, -12);
  for (const z of [-15.3, -8.7]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4, 0.22), wood); p.position.set(4.25, yb + 0.7, z); p.castShadow = true; scene.add(p); }
  const gt = new THREE.Group(); gt.position.set(4.25, yb, -8.7); gt.rotation.y = -1.35; scene.add(gt);
  for (const y of [0.35, 0.7, 1.05]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 3.4), L('#c8b49a')); r.position.set(0, y, -1.7); gt.add(r); }
  const dg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 3.6), L('#c8b49a')); dg.position.set(0, 0.7, -1.7); dg.rotation.x = 0.2; gt.add(dg); gt.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- barn + cows ----------------
const HB = HG(BARN.x - BARN.w / 2, BARN.z);
{ const g = new THREE.Group(); g.position.set(BARN.x, HB, BARN.z); scene.add(g);
  const red = L('#b23b2e'), wd = L('#f1e3c8');
  const bx = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
  const fl = new THREE.Mesh(new THREE.BoxGeometry(BARN.w + 4, 3, BARN.d), L('#a1887f')); fl.position.set(1, -1.5, 0); fl.receiveShadow = true; g.add(fl);
  bx(0.3, 6.5, BARN.d, red, BARN.w / 2, 1.75, 0);                                 // back
  bx(BARN.w, 6.5, 0.3, red, 0, 1.75, -BARN.d / 2); bx(BARN.w, 6.5, 0.3, red, 0, 1.75, BARN.d / 2);
  bx(0.3, 6.5, 2.5, red, -BARN.w / 2, 1.75, -BARN.d / 2 + 1.25); bx(0.3, 6.5, 2.5, red, -BARN.w / 2, 1.75, BARN.d / 2 - 1.25);   // front pillars
  bx(0.3, 0.8, BARN.d, red, -BARN.w / 2, 4.65, 0);                                 // above the door
  for (const z of [-2.75, 2.75]) bx(0.36, 0.22, 0.22, wd, -BARN.w / 2 - 0.05, 1.5, z);
  const trim = bx(0.34, 0.25, 6.2, wd, -BARN.w / 2 - 0.02, 4.2, 0);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(BARN.w + 1.2, 0.25, BARN.d / 2 + 1.6), L('#5d4037')); r.position.set(0, 5.9, s * (BARN.d / 4 + 0.3)); r.rotation.x = s * 0.62; r.castShadow = true; g.add(r); }
  const hay = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 9), L('#e2bf5c')); hay.position.set(4.2, 0.6, 0); g.add(hay);
  const pl = new THREE.PointLight('#ffe0b0', 45, 22, 1.6); pl.position.set(0, 3.8, 0); g.add(pl); }
const cowSpot = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(hash(i) * w, hash(i + 4) * h, 18 + hash(i + 2) * 26, 14 + hash(i + 8) * 18, hash(i) * 3, 0, 7); c.fill(); } });
function makeCow() { const g = new THREE.Group(); scene.add(g); const bm = new THREE.MeshLambertMaterial({ map: cowSpot });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 2.1), bm); body.position.y = 1.25; g.add(body);
  for (const [x, z] of [[-0.38, -0.8], [0.38, -0.8], [-0.38, 0.8], [0.38, 0.8]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), L('#f2f2f2')); l.position.set(x, 0.4, z); g.add(l); }
  const head = new THREE.Group(); head.position.set(0, 1.65, -1.15); g.add(head);
  const hd = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.72), bm); hd.position.z = -0.15; head.add(hd);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.2, -0.45); head.add(jaw);
  const mz = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.24, 0.32), L('#f4a6b4')); mz.position.set(0, 0, -0.08); jaw.add(mz);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.2, 0.3), L('#f4a6b4')); top.position.set(0, 0.1, -0.55); head.add(top);
  for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.CircleGeometry(0.05, 8), L('#6d3440')); n.position.set(s * 0.14, 0.12, -0.705); n.rotation.y = PI; head.add(n);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), STD('#fff', { roughness: 0.2 })); e.position.set(s * 0.2, 0.17, -0.48); head.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), STD('#111')); p.position.set(0, 0, -0.07); e.add(p);
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.18), bm); ear.position.set(s * 0.45, 0.15, -0.05); ear.rotation.z = s * -0.3; head.add(ear);
    const hn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 6), L('#efe3c8')); hn.position.set(s * 0.22, 0.4, -0.05); hn.rotation.z = s * -0.4; head.add(hn); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.userData = { head, jaw }; return g; }
const cows = [[1.6, -3.3], [4.3, 0.0], [1.9, 3.3]].map(([dx, dz]) => ({ g: makeCow(), x: BARN.x + dx, z: BARN.z + dz }));

// ---------------- combine harvester (model faces -z) ----------------
const comb = new THREE.Group(); scene.add(comb);
const green = STD('#2e9a3e', { roughness: 0.4, metalness: 0.25 }), yel = STD('#fbc02d', { roughness: 0.45, metalness: 0.2 }), dark = STD('#2a2c30', { roughness: 0.7 }), redM = STD('#e53935', { roughness: 0.4 });
const cb = (w, h, d, m, x, y, z, p = comb) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
const CB = {}; const HF = 4.95;
const bodyG = new THREE.Group(); comb.add(bodyG);
{ cb(2.7, 2.6, 5.0, green, 0, 2.3, 0.9, bodyG);
  cb(2.8, 1.1, 2.8, STD('#38b24a', { roughness: 0.4 }), 0, 4.15, 1.9, bodyG);
  cb(2.9, 0.12, 2.9, yel, 0, 4.72, 1.9, bodyG);
  const sideT = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#ffd54f'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HARVEST 9000', w / 2, h / 2 + 6); });
  for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), new THREE.MeshLambertMaterial({ map: sideT, transparent: true })); d.position.set(s * 1.36, 2.5, 1.2); d.rotation.y = s * PI / 2; bodyG.add(d);
    cb(0.1, 0.25, 5.0, yel, s * 1.37, 1.15, 0.9, bodyG); }
  // cab (hollow, glass)
  const glass = new THREE.MeshStandardMaterial({ color: '#bfe3f5', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.28, depthWrite: false });
  cb(2.0, 0.15, 2.0, STD('#f5f5f5'), 0, 5.05, -1.6, bodyG);
  for (const [x, z] of [[-0.95, -2.55], [0.95, -2.55], [-0.95, -0.65], [0.95, -0.65]]) cb(0.1, 1.5, 0.1, dark, x, 4.25, z, bodyG);
  cb(2.0, 0.2, 2.0, dark, 0, 3.5, -1.6, bodyG);
  for (const [w, d, x, z, ry] of [[1.9, 0, 0, -2.58, 0], [1.9, 0, 0, -0.62, 0], [1.9, 0, -0.98, -1.6, PI / 2], [1.9, 0, 0.98, -1.6, PI / 2]]) { const gp = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.45), glass); gp.position.set(x, 4.27, z); gp.rotation.y = ry; gp.userData.noAO = true; bodyG.add(gp); }
  CB.beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 12), new THREE.MeshBasicMaterial({ color: '#ffa000', toneMapped: false })); CB.beacon.position.set(0.6, 5.25, -1.2); bodyG.add(CB.beacon);
  // exhaust + chute
  const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 8), dark); ex.position.set(-0.9, 5.2, 2.9); bodyG.add(ex);
  cb(1.5, 0.9, 0.6, dark, 0, 1.6, 3.6, bodyG);
  // feeder house
  const fd = cb(1.5, 1.1, 2.0, green, 0, 1.15, -2.4); fd.rotation.x = -0.18;
  // header
  CB.header = new THREE.Group(); CB.header.position.set(0, 0, -3.3); comb.add(CB.header);
  cb(7.5, 1.0, 0.14, yel, 0, 0.95, 0, CB.header); cb(7.5, 0.12, 1.6, yel, 0, 0.42, -0.8, CB.header);
  for (const s of [-1, 1]) { cb(0.14, 1.0, 1.6, yel, s * 3.75, 0.85, -0.8, CB.header); const dv = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 8), yel); dv.rotation.x = -PI / 2; dv.position.set(s * 3.75, 0.55, -1.95); dv.castShadow = true; CB.header.add(dv);
    cb(0.1, 0.1, 1.5, dark, s * 3.6, 1.75, -0.4, CB.header); }
  cb(7.4, 0.06, 0.2, STD('#cfd8dc', { metalness: 0.8, roughness: 0.3 }), 0, 0.36, -1.62, CB.header);
  const aug = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 7.2, 16), STD('#d4a017')); aug.rotation.z = PI / 2; aug.position.set(0, 0.75, -0.55); CB.header.add(aug);
  CB.reel = new THREE.Group(); CB.reel.position.set(0, 1.75, -1.0); CB.header.add(CB.reel);
  for (let i = 0; i < 6; i++) { const a = i * PI / 3; const bat = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.08, 0.22), redM); bat.position.set(0, 0.85 * Math.cos(a), 0.85 * Math.sin(a)); bat.rotation.x = a; bat.castShadow = true; CB.reel.add(bat);
    for (const x of [-3.4, 0, 3.4]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.06), redM); sp.position.set(x, 0.42 * Math.cos(a), 0.42 * Math.sin(a)); sp.rotation.x = a; CB.reel.add(sp); } }
  const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 7.3, 8), redM); ax.rotation.z = PI / 2; CB.reel.add(ax);
  // wheels
  CB.wheels = [];
  for (const [x, z, r, w] of [[-1.6, -1.1, 0.95, 0.6], [1.6, -1.1, 0.95, 0.6], [-1.3, 2.7, 0.58, 0.4], [1.3, 2.7, 0.58, 0.4]]) { const wh = makeWheel(r, w); wh.position.set(x, r, z); comb.add(wh); CB.wheels.push(wh); }
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({ color: '#fff7d6', toneMapped: false })); hl.position.set(s * 0.7, 4.95, -2.62); hl.rotation.y = PI; bodyG.add(hl); }
}
// farmer in the cab
const farmer = new THREE.Group(); farmer.position.set(0.2, 3.95, -1.5); bodyG.add(farmer);
const FM = {};
{ const skin = STD('#f2c09a', { roughness: 0.7 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 14), skin); farmer.add(head);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10, 0, PI * 2, PI * 0.5, PI * 0.45), STD('#c0703a')); beard.position.set(0, -0.02, -0.04); farmer.add(beard);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), STD('#fff', { roughness: 0.2 })); e.position.set(s * 0.11, 0.06, -0.26); farmer.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), STD('#111')); p.position.z = -0.05; e.add(p); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), STD('#e8987a')); nose.position.set(0, -0.03, -0.3); farmer.add(nose);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 24), STD('#e9c46a', { roughness: 0.9 })); brim.position.y = 0.2; farmer.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.26, 20), STD('#e9c46a', { roughness: 0.9 })); crown.position.y = 0.34; farmer.add(crown);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.305, 0.07, 20), STD('#c62828')); band.position.y = 0.25; farmer.add(band);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.5, 12), STD('#1e88e5')); body.position.y = -0.45; farmer.add(body);
  FM.arm = new THREE.Group(); FM.arm.position.set(0.36, -0.3, -0.05); farmer.add(FM.arm);
  const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.6, 8), STD('#1e88e5')); a.position.y = 0.3; FM.arm.add(a);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), skin); hd.position.y = 0.62; FM.arm.add(hd);
  farmer.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- hero + straw hat + hay bale ----------------
const hero = makeCar('#e53935');
const strawT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e9c46a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.strokeStyle = i % 2 ? '#d4a84f' : '#f4d88a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, i * 7); c.lineTo(w, i * 7 + 20); c.stroke(); c.beginPath(); c.moveTo(i * 7, 0); c.lineTo(i * 7 - 20, h); c.stroke(); } }, true);
function makeHat(s) { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ map: strawT, roughness: 0.9 });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.0 * s, 1.05 * s, 0.06 * s, 32), m); g.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.46 * s, 0.52 * s, 0.45 * s, 28), m); crown.position.y = 0.25 * s; g.add(crown);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.46 * s, 20, 8, 0, PI * 2, 0, PI / 2), m); top.scale.y = 0.3; top.position.y = 0.47 * s; g.add(top);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.525 * s, 0.53 * s, 0.13 * s, 28), STD('#c62828')); band.position.y = 0.1 * s; g.add(band);
  const fl = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 10, 8), STD('#ffeb3b')); fl.position.set(0.5 * s, 0.13 * s, 0.12 * s); g.add(fl);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
const hat = makeHat(1.0); scene.add(hat); hat.visible = false;
const BR = 1.15, BL = 1.9;
const bale = new THREE.Group(); scene.add(bale);
const baleRoll = new THREE.Group(); bale.add(baleRoll);
{ const sideT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#d9b250'; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.strokeStyle = ['#f0d27a', '#b98d35', '#e8c564'][i % 3]; c.lineWidth = 2; const y = hash(i) * h; c.beginPath(); c.moveTo(hash(i + 1) * w, y); c.lineTo(hash(i + 1) * w + 60, y + (hash(i + 2) - 0.5) * 8); c.stroke(); } c.fillStyle = '#e53935'; c.fillRect(0, h * 0.3, w, 6); c.fillRect(0, h * 0.7, w, 6); }, true);
  const endT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#d4aa48'; c.fillRect(0, 0, w, h); c.strokeStyle = '#a87e2c'; c.lineWidth = 4; c.beginPath(); for (let a = 0; a < 40; a += 0.1) { const r = 3 * a; c.lineTo(128 + r * Math.cos(a), 128 + r * Math.sin(a)); } c.stroke(); });
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(BR, BR, BL, 36), [new THREE.MeshLambertMaterial({ map: sideT }), new THREE.MeshLambertMaterial({ map: endT }), new THREE.MeshLambertMaterial({ map: endT })]);
  cyl.rotation.x = PI / 2; cyl.castShadow = true; cyl.receiveShadow = true; baleRoll.add(cyl);
  for (const [x, y, s] of [[-0.55, -0.45, 1], [0.55, -0.45, 1], [-0.55, -0.45, -1], [0.55, -0.45, -1]]) { const w = makeWheel(0.34, 0.24); w.rotation.y = PI / 2; w.position.set(x, y, s * (BL / 2 + 0.06)); baleRoll.add(w); }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#fff3b0', emissiveIntensity: 0.6 })); lamp.position.set(0.35, 0.35, -BL / 2 - 0.05); baleRoll.add(lamp);
  const lamp2 = lamp.clone(); lamp2.position.x = -0.35; baleRoll.add(lamp2);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.2), new THREE.MeshLambertMaterial({ map: canvasTex(256, 72, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#111'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#111'; c.font = '800 46px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HAY 123', w / 2, h / 2 + 2); }) }));
  plate.position.set(0, -0.05, -BL / 2 - 0.02); plate.rotation.y = PI; baleRoll.add(plate);
  const mir = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.3), STD('#e53935')); mir.position.set(0, BR + 0.04, -0.4); baleRoll.add(mir);
  baleRoll.traverse(o => { if (o.isMesh) o.castShadow = true; }); bale.visible = false; }
// straw puffs
const puffT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(245,215,130,0.95)'); g.addColorStop(1, 'rgba(245,215,130,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const puffs = Array.from({ length: 22 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
const flareT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.3, 'rgba(255,245,200,0.6)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const flares = [-1, 1].map(s => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareT, transparent: true, depthWrite: false, toneMapped: false })); sp.position.set(s * 0.6, 0.76, -2.3); sp.scale.set(0.01, 0.01, 1); hero.userData.bodyG.add(sp); return sp; });

// ---------------- motion ----------------
// wrong: hero drives -z on the right lane, stops, squeezes onto the verge
const HZW = mono([[0, 44], [tThen, 12], [tComb + 1.5, -10], [tSqueeze, -10], [tGrabs - 0.25, -17.0]]);
const HXW = mono([[0, 1.3], [tSqueeze - 0.1, 1.3], [tSqueeze + 1.2, 3.0], [99, 3.0]]);
const CZW = mono([[0, -150], [tThen + 0.2, -112], [tComb, -82], [tWhat, -45], [tGrabs - 0.3, -24.5], [tHarvW, -23], [99, -23]]);
const CZR = mono([[0, -110], [tRew1 - 1, -96], [tGate, -48], [tStop + 0.4, -38], [99, -38]]);
const CXR = mono([[T_HR, 12], [tGolden, 44], [tOther - 0.4, 80], [tOther + 0.3, 82], [99, 82]]);
const HPATH = roundedPath([[1.3, 80], [1.3, -12], [140, -12]], 5);
const SPR = mono([[0, 42], [tRew1, 58], [tGate - 0.2, 86], [tStop + 0.3, 95.6], [tFollow - 0.15, 95.6], [tOther + 0.2, 153], [tOther + 0.9, 155], [99, 155]]);
function combPose(t) {
  if (isRight(t)) { if (t < T_HR) { const z = CZR(t); return { x: 0, z, h: PI }; } const x = CXR(t); return { x, z: -12, h: -PI / 2 }; }
  return { x: 0, z: CZW(t), h: PI };
}
const T_ATT = tGrabs - 0.25, T_IN = tHarvW + 0.05;
function heroPose(t) {
  if (isRight(t)) { const p = pathAt(HPATH, SPR(t)); return { x: p.x, y: HG(p.x, p.z), z: p.z, h: p.h, pitch: slopePitch(p.x, p.z, p.h), roll: 0, sc: 1 }; }
  if (t < T_ATT) { const x = HXW(t), z = HZW(t); return { x, y: HG(x, z), z, h: 0, pitch: slopePitch(x, z, 0), roll: 0, sc: 1 }; }
  // grabbed: relative to the combine (world, combine faces +z)
  const c = combPose(t); const cy = HG(c.x, c.z);
  const K = [[T_ATT, [3.0, 0.0, HF + 2.2, 0, 1]], [T_ATT + 0.55, [2.2, 2.6, 4.9, 0.9, 1]], [T_ATT + 1.1, [0.8, 2.9, 3.6, 2.2, 0.85]], [T_IN - 0.35, [0, 2.0, 2.5, 3.4, 0.6]], [T_IN, [0, 1.4, 1.6, 4.2, 0.02]]];
  let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++; const u = ease(clamp((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); const A = K[i][1], B = K[i + 1][1];
  const r = A.map((a, k) => lerp(a, B[k], u));
  return { x: c.x + r[0], y: cy + r[1], z: c.z + r[2], h: 0, pitch: r[3], roll: 0.3 * r[3], sc: r[4] };
}
// bale
const BZ = -30.5;
const BXW = mono([[tRolls - 0.25, 0.6], [tBarn - 0.1, 44.6], [tBarn + 0.5, 47.8], [99, 47.8]]);
function balePose(t) {
  const c = combPose(t), t0 = tPops - 0.2;
  if (t < t0) return null;
  if (t < t0 + 0.6) { const u = (t - t0) / 0.6; const z = lerp(c.z - 3.6, BZ, u), x = lerp(0, 0.6, u); return { x, z, y: lerp(HG(0, c.z) + 1.6, HG(x, z) + BR, u) + 1.6 * Math.sin(PI * u), roll: -u * 1.2, sc: lerp(0.5, 1, Math.min(1, u * 2)) }; }
  const x = BXW(t); const inB = x > 44.4; const fk = clamp((x - 3.5) / 1.5) * (1 - clamp((x - 42) / 2)); const y = inB ? HB + BR : HG(x, BZ) + BR + fk * (0.7 + 0.35 * Math.abs(Math.sin(x * 0.7)));
  return { x, z: BZ - 0.0 * x, y, roll: -1.2 - (x - 0.6) / BR, sc: 1 };
}
// hat throw (right)
const T_THROW = tGives - 0.1, T_LAND = tHat + 0.05;

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const Ah = (p, l, fov = 40) => () => [V3(p[0], HG(p[0], p[2]) + p[1], p[2]), V3(l[0], HG(l[0], l[2]) + l[1], l[2]), fov];
const Ch = (p, l, fov = 40) => t => { const h = heroPose(t); return [V3(p[0] + h.x, p[1] + h.y, p[2] + h.z), V3(l[0] + h.x, l[1] + h.y, l[2] + h.z), fov]; };
const Cc = (p, l, fov = 40) => t => { const c = combPose(t), y = HG(c.x, c.z); return [V3(p[0] + c.x, p[1] + y, p[2] + c.z), V3(l[0] + c.x, l[1] + y, l[2] + c.z), fov]; };
const CHC = (off, fov = 40) => t => { const h = heroPose(t), c = combPose(t), cy = HG(c.x, c.z); return [V3(h.x + off[0], h.y + off[1], h.z + off[2]), V3(c.x, cy + 2.6, c.z), fov]; };
const Cb = (p, l, fov = 40) => t => { const b = balePose(t) || { x: 0.6, y: HG(0.6, BZ) + BR, z: BZ }; return [V3(p[0] + b.x, p[1] + b.y, p[2] + b.z), V3(l[0] + b.x, l[1] + b.y, l[2] + b.z), fov]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const camKeys = [
  [0.0, Ch([0.5, 3.8, 10], [0, 1.4, -22], 40)],
  [tThen - 0.3, Ch([0.4, 3.5, 9], [0, 1.4, -22], 40)],
  ...cut(tThen - 0.25, Ah([0.9, 1.9, 6], [0, 5.2, -85], 18)),
  [tComb - 0.35, Ah([0.9, 1.9, -1], [0, 5.0, -85], 18)],
  ...cut(tComb - 0.3, Cc([-7.5, 3.2, 15], [0, 2.4, 0], 40)),
  [tWide - 0.3, Cc([-7.0, 3.0, 14], [0, 2.4, 0], 40)],
  ...cut(tWide - 0.25, Cc([0, 2.2, 21], [0, 2.0, 0], 40)),
  [tComing - 0.3, Cc([0, 2.0, 19], [0, 2.0, 0], 40)],
  ...cut(tComing - 0.25, CHC([1.0, 2.6, 7.5], 40)),
  [tWhat - 0.3, CHC([1.0, 2.6, 7.0], 40)],
  ...cut(tWhat - 0.25, CHC([-1.5, 7.5, 16], 40)),
  [W1 - 0.2, CHC([-1.5, 7.7, 16.5], 40)],
  // wrong
  ...cut(W1 - 0.15, Ch([0.2, 3.4, 8.5], [-0.4, 1.4, -14], 40)),
  [tRoom - 0.35, Ch([0.2, 3.4, 8.5], [-0.4, 1.4, -14], 40)],
  ...cut(tRoom - 0.3, Ah([-3.0, 2.6, -2], [3.0, 1.0, -17], 40)),
  [tIsnt + 0.25, Ah([-3.0, 2.7, -3], [3.0, 1.0, -18], 40)],
  ...cut(tReel - 0.3, Ah([-7.5, 4.8, -9.5], [1.6, 2.0, -18.5], 40)),
  [tHarvW - 0.35, Ah([-7.6, 5.0, -9.8], [1.0, 2.3, -19], 40)],
  ...cut(tHarvW - 0.3, Cc([-8.5, 4.2, 6.0], [0, 2.6, 0.5], 40)),
  [S('wrong2').end + 0.25, Cc([-8.8, 4.3, 6.5], [0, 2.6, 0.5], 40)],
  ...cut(S('wrong3').start - 0.1, Cc([7.5, 3.8, -18], [1.0, 1.5, -6], 40)),
  [tWheels - 0.35, Cc([7.0, 3.5, -17], [1.0, 1.3, -7], 40)],
  ...cut(tWheels - 0.3, Cb([-2.3, 1.1, -6.4], [0, 0, 0], 40)),
  [tRolls - 0.3, Cb([-2.4, 1.15, -6.6], [0, 0, 0], 40)],
  ...cut(tRolls - 0.25, Cb([-6.5, 4.6, 9.5], [2.5, -0.3, -1], 42)),
  [tBarn - 0.45, Cb([-6.5, 4.6, 9.5], [2.5, -0.3, -1], 42)],
  ...cut(tBarn - 0.4, Ac([35.5, HB + 3.4, -26.5], [50, HB + 1.4, -31], 40)),
  [tCows - 0.3, Ac([36.3, HB + 3.4, -27.0], [50, HB + 1.4, -31], 40)],
  ...cut(tCows - 0.25, Ac([40.5, HB + 3.6, -28.9], [51, HB + 1.5, -31], 40)),
  [tRew0, Ac([41.0, HB + 3.6, -29.1], [51, HB + 1.5, -31], 40)],
  // right
  ...cut(tRew1, Ch([-1.3, 3.8, 9.5], [0, 1.6, -16], 40)),
  [tGate - 0.5, Ch([-1.3, 3.8, 9.5], [0, 1.6, -16], 40)],
  ...cut(tGate - 0.45, Ah([-6.5, 9, 16], [3.0, 0.5, -12], 40)),
  [tFlash - 0.3, Ah([-6.5, 9.2, 15], [3.0, 0.5, -12], 40)],
  ...cut(tFlash - 0.25, Ah([12.0, 3.5, -15.0], [6.8, 0.9, -12.1], 40)),
  [S('right2').end + 0.3, Ah([12.2, 3.5, -15.2], [6.8, 0.9, -12.1], 40)],
  ...cut(S('right3').start - 0.15, Cc([-2.2, 4.3, 6.4], [0, 4.0, 1.3], 40)),
  [S('right3').end + 0.25, Cc([-2.3, 4.4, 6.7], [0, 4.0, 1.3], 40)],
  ...cut(T_HR, Ah([-3, 15, 6], [24, 0, -13], 42)),
  [tStraight - 0.3, Ah([-2, 16, 5], [26, 0, -13], 42)],
  ...cut(tStraight - 0.25, Ah([2, 26, 6], [30, -2, -12.5], 42)),
  [S('right4').end + 0.2, Ah([4, 27, 6], [32, -2, -12.5], 42)],
  ...cut(S('right5').start - 0.1, Ch([-8.8, 3.0, 0.6], [10, 0.9, 0], 40)),
  [tLeft - 0.3, Ch([-8.8, 3.0, 0.8], [10, 0.9, -1.2], 40)],
  [tRightW - 0.1, Ch([-8.6, 3.0, -0.8], [10, 0.9, 1.2], 40)],
  [S('right5').end + 0.25, Ch([-8.6, 3.1, -0.8], [10, 0.9, 1.2], 40)],
  ...cut(S('right6').start - 0.1, Ch([-9.5, 4.8, 1.2], [10, 1.2, 0], 40)),
  [tGives - 0.3, Ch([-9.0, 4.8, 1.2], [10, 1.2, 0], 40)],
  ...cut(tGives - 0.25, Ch([-6.8, 4.2, 1.8], [7, 1.6, 0], 40)),
  [tSuits - 0.4, Ch([-6.3, 4.0, 1.7], [5, 1.4, 0], 40)],
  ...cut(tSuits - 0.35, Ch([4.2, 2.0, 3.6], [0, 1.4, 0], 40)),
  [S('right6').end + 0.3, Ch([4.4, 2.1, 3.9], [0, 1.4, 0], 40)],
  ...cut(S('right7').start - 0.15, Ch([7, 6, 9], [0, 0.8, 0], 42)),
  [TOTAL, Ch([9, 10, 13], [0, 0.8, 0], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
function update(t) {
  const right = isRight(t);
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.far = 3000; camera.updateProjectionMatrix();
  // combine
  const cp = combPose(t), cy = HG(cp.x, cp.z);
  comb.position.set(cp.x, cy, cp.z); comb.rotation.set(slopePitch(cp.x, cp.z, cp.h), cp.h, 0, 'YXZ');
  const moving = right ? (t < tStop + 0.4 || (t > T_HR && t < tOther + 0.3)) : t < tHarvW + 0.5;
  CB.reel.rotation.x = -t * (moving || (!right && t < tLike + 0.6) ? 3.2 : 0.8);
  CB.wheels.forEach((w, i) => w.rotation.x = -(right && t > T_HR ? cp.x : cp.z) / (i < 2 ? 0.95 : 0.58));
  const chomp = !right && t > tHarvW - 0.1 && t < tLike + 0.7 ? Math.sin((t - tHarvW) * 26) : 0;
  bodyG.position.set(0.04 * chomp, Math.abs(chomp) * 0.07, 0); bodyG.scale.set(1 + 0.02 * Math.abs(chomp), 1, 1);
  CB.beacon.material.color.set(Math.floor(t * 3) % 2 ? '#ffa000' : '#ffd54f');
  // farmer
  const wave = right ? win(t, tWaves - 0.2, tIdea - 0.1, 0.2) : 0; const thr = right ? win(t, T_THROW - 0.3, T_THROW + 0.6, 0.15) : 0;
  { const k = Math.max(wave, thr); FM.arm.rotation.set(0, 0, lerp(PI - 0.25, -0.5 + 0.45 * wave * Math.sin((t - tWaves) * 11), k)); }
  farmer.rotation.set(0, right && t > tWaves - 0.3 && t < T_HR ? -0.45 : 0, 0);
  // hero
  const hp = heroPose(t); placeCar(hero, hp); hero.scale.setScalar(hp.sc); hero.visible = hp.sc > 0.03;
  const fl = right ? Math.max(0, 1 - Math.abs(t - tFlash - 0.15) / 0.22) : 0; hero.userData.hl.emissiveIntensity = 0.3 + 3 * fl; flares.forEach(f => f.scale.setScalar(0.01 + 2.4 * fl));
  // canopy
  if (right && t > T_HR) cutStrip(Math.max(10.6, cp.x + HF - 0.3), false); else cutStrip(0, true);
  // bale
  const bp = right ? null : balePose(t); bale.visible = !!bp;
  if (bp) { bale.position.set(bp.x, bp.y, bp.z); baleRoll.rotation.set(0, 0, bp.roll); bale.scale.setScalar(bp.sc); }
  // straw puffs: at the pop (wrong) / behind the combine in the field (right)
  puffs.forEach((s, k) => { s.visible = false; let t0, P, life = 0.9;
    if (!right && t > tPops - 0.25 && t < tPops + 1.3) { t0 = tPops - 0.2 + (k % 8) * 0.06; P = V3(cp.x + (hash(k) - 0.5) * 2, cy + 1.6, cp.z - 3.9); }
    else if (right && t > T_HR && t < tOther + 1) { const per = 0.8; const ph = hash(k) * per; const n = Math.floor((t - ph) / per); t0 = n * per + ph; P = V3(cp.x - 4.2, HG(cp.x - 4, -12) + 1.4, -12 + (hash(k + n) - 0.5) * 1.2); life = 0.8; }
    else return;
    const u = (t - t0) / life; if (u < 0 || u > 1) return; s.visible = true; s.position.copy(P).add(V3((hash(k + 3) - 0.5) * 2.5 * u - (right ? 2.0 * u : 0), 1.4 * u, (right ? 0 : -2.2 * u) + (hash(k + 9) - 0.5) * 1.5 * u));
    const sc = 0.6 + 1.6 * u; s.scale.set(sc, sc, 1); s.material.opacity = 0.75 * (1 - u); });
  // cows
  cows.forEach((cw, i) => { const step = !right ? ramp(t, tCows - 0.3 + i * 0.1, tCows + 0.6) : 0; const x = cw.x - 1.2 * step;
    cw.g.position.set(x, HB, cw.z); cw.g.rotation.y = PI / 2 + (cw.z - BARN.z) * -0.3; cw.g.visible = !right;
    const mun = !right && t > tHungry - 0.2 ? Math.abs(Math.sin((t - tHungry) * 9 + i)) : 0; cw.g.userData.jaw.rotation.x = 0.35 * mun; cw.g.userData.head.rotation.x = 0.25 * step; });
  // straw hat
  hat.visible = right && t > T_THROW;
  if (hat.visible) { const from = V3(cp.x + 0.0, cy + 5.4, -12 + 1.2), hr = hero.userData.bodyG; hero.updateMatrixWorld(true);
    const to = V3(0, 1.62, 0.15).applyMatrix4(hr.matrixWorld); const u = clamp((t - T_THROW) / (T_LAND - T_THROW));
    if (u < 1) { const p = from.clone().lerp(to, u); p.y += 3.5 * Math.sin(PI * u); hat.position.copy(p); hat.rotation.set(0.25 * Math.sin(u * 9), u * 14, 0); hat.scale.setScalar(1); }
    else { const k = t - T_LAND; hat.position.copy(to); hat.position.y += 0.08 * Math.abs(Math.sin(k * 12)) * Math.exp(-k * 4); hat.quaternion.copy(new THREE.Quaternion().setFromRotationMatrix(hr.matrixWorld)); hat.rotateY(0.4); hat.scale.setScalar(1); } }
  applyCam(c, t, (!right && chomp) ? 0.05 : 0);
  camera.updateMatrixWorld(true);
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const PURP = '#6a1b9a', GOLD_ = '#c88a12';
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('NARROW COUNTRY ROAD', BLUE, tNarrow - 0.1, tHarvT - 0.1, 50);
    P_('HARVEST TIME', GOLD_, tHarvT - 0.05, tThen - 0.1, 56);
    P_('SOMETHING HUGE…', PURP, tHuge - 0.2, tComb - 0.15, 56, iconWarn);
    P_('COMBINE HARVESTER', PURP, tComb - 0.1, tWide - 0.1, 54, iconWarn);
    P_('AS WIDE AS THE ROAD', RED, tWide - 0.05, tComing - 0.1, 52, iconWarn);
    P_('COMING STRAIGHT AT YOU', RED, tComing - 0.05, S('hook2').end + 0.4, 46, iconWarn);
    P_('SQUEEZE PAST!', RED, tSqueeze - 0.1, tRoom - 0.1, 58, iconX);
    P_('ROOM ON THE VERGE?', RED, tRoom - 0.05, S('wrong1').end + 0.3, 52, iconX);
    P_("THERE ISN'T", RED, tIsnt - 0.1, tGrabs - 0.1, 58, iconX);
    P_('THE REEL GRABS YOU', RED, tGrabs - 0.05, tHarvW - 0.1, 52, iconX);
    P_('HARVESTED. LIKE WHEAT', RED, tHarvW - 0.05, S('wrong2').end + 0.3, 48, iconX);
    floatText('CHOMP!', W / 2, 760, t, tHarvW - 0.05, tHarvW + 1.0, 130, YEL, -0.07);
    floatText('POP!', W / 2 + 150, 720, t, tPops - 0.05, tPops + 0.8, 130, YEL, 0.08);
    P_('A HAY BALE… WITH WHEELS', RED, tHay - 0.1, tRolls - 0.1, 46, iconX);
    P_('DOWN THE HILL', RED, tRolls - 0.05, tBarn - 0.1, 56, iconX);
    P_('INTO THE BARN', RED, tBarn - 0.05, tCows - 0.1, 58, iconX);
    P_('THE COWS ARE HUNGRY', RED, tCows - 0.05, tRew0, 50, iconX);
    floatText('MOO!', W / 2 + 120, 700, t, tHungry - 0.05, tRew0, 140, '#fff', 0.08);
  } else {
    P_('INTO THE FIELD GATE', GREEN, tPull - 0.1, tStop - 0.1, 52, iconCheck);
    P_('STOP', GREEN, tStop - 0.05, tFlash - 0.1, 64, iconCheck);
    P_('FLASH ONCE: THANK YOU', GREEN, tFlash - 0.05, S('right2').end + 0.3, 48, iconHeart);
    P_('HE WAVES BACK', GREEN, tWaves - 0.15, tIdea - 0.15, 58, iconCheck);
    floatText('IDEA!', W / 2, 700, t, tIdea - 0.05, S('right3').end + 0.3, 140, YEL, -0.06);
    P_('A BRAND-NEW ROAD', GOLD_, tBrand - 0.2, tStraight - 0.1, 56, iconCheck);
    P_('STRAIGHT THROUGH THE WHEAT', GOLD_, tStraight - 0.05, S('right4').end + 0.3, 44, iconCheck);
    P_('GOLDEN CORRIDOR', GOLD_, tGolden - 0.15, tLeft - 0.1, 58, iconHeart);
    P_('◀ WHEAT', GOLD_, tLeft - 0.05, tRightW - 0.1, 62);
    P_('WHEAT ▶', GOLD_, tRightW - 0.05, S('right5').end + 0.3, 62);
    P_('A STRAW HAT!', GREEN, tHat - 0.25, tSuits - 0.1, 60, iconHeart);
    P_('IT SUITS YOU', GREEN, tSuits - 0.05, S('right6').end + 0.4, 60, iconHeart);
  }
}
window.dbg = { hero, heroPose, cam, comb, combPose };
start(update, hud);
