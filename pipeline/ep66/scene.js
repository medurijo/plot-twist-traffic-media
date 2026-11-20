// Episode 61: Town crossing – a giant scrapyard magnet hangs over the crossing and pulls everything up
// hook (old style): red light, waiting at the crossing, the manhole covers start to float -> above the crossing hangs a
//        giant magnet, and somebody (the sleepy crane driver) just switched it on
// wrong: floor it, get out from under there -> hit the open manhole, car jumps, magnet catches you mid-air -> every other
//        car flies up too, the crane swings round and drops you all into the crusher -> crunch: your car is now a cube
// right: stop, engine off, open the glovebox -> grandma's fridge magnet on the roof, the wrong way round -> north against
//        north: the big one gets pushed away, swings back and sticks to its own crane (clang) -> everything it grabbed comes
//        back down where it belongs -> green light, drive on with the strongest fridge magnet in town
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, box, instanced, makeLandscape, makeWheel,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
// ---------------- timing ----------------
const tRed = WT('hook1', 'Red'), tWaiting = WT('hook1', 'waiting'), tThenH = WT('hook1', 'Then'), tManholeH = WT('hook1', 'manhole'), tFloat = WT('hook1', 'float');
const tAbove = WT('hook2', 'Above'), tGiant = WT('hook2', 'giant'), tMagnet = WT('hook2', 'magnet'), tSomebody = WT('hook2', 'somebody'), tSwitched = WT('hook2', 'switched'), tWhat = WT('hook2', 'What');
const tFloor = WT('wrong1', 'floor'), tGet = WT('wrong1', 'Get'), tFast = WT('wrong1', 'fast');
const tBigM = WT('wrong2', 'Big'), tHit = WT('wrong2', 'hit'), tOpen = WT('wrong2', 'open'), tManhole = WT('wrong2', 'manhole'), tJumps = WT('wrong2', 'jumps'), tCatches = WT('wrong2', 'catches'), tMid = WT('wrong2', 'mid');
const tThenW = WT('wrong3', 'Then'), tComes = WT('wrong3', 'comes'), tCrane = WT('wrong3', 'crane'), tSwings = WT('wrong3', 'swings'), tDrops = WT('wrong3', 'drops'), tCrusher = WT('wrong3', 'crusher'), tCrunch = WT('wrong3', 'Crunch'), tYour = WT('wrong3', 'Your'), tCube = WT('wrong3', 'cube');
const tStop = WT('right2', 'Stop'), tEngine = WT('right2', 'Engine'), tGlove = WT('right2', 'glovebox');
const tGrandma = WT('right3', 'Grandma'), tPut = WT('right3', 'Put'), tRoof = WT('right3', 'roof'), tWrongWay = WT('right3', 'wrong'), tRound = WT('right3', 'round');
const tNorth = WT('right4', 'North'), tHate = WT('right4', 'hate'), tBigOne = WT('right4', 'big'), tPushed = WT('right4', 'pushed'), tSwingsR = WT('right4', 'swings'), tSticks = WT('right4', 'sticks'), tCraneR = WT('right4', 'crane'), tClang = WT('right4', 'Clang');
const tEverything = WT('right5', 'everything'), tComesR = WT('right5', 'comes'), tRight = WT('right5', 'Right'), tBelongs = WT('right5', 'belongs');
const tGreen = WT('right6', 'Green'), tDrive = WT('right6', 'drive'), tStrongest = WT('right6', 'strongest');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- town crossing ----------------
const RW = 3.6, LANE = 1.75;
plane(-RW, RW, -400, 400, asphaltMat, 0.04, 7);
plane(-400, -RW, -RW, RW, asphaltMat, 0.045, 7); plane(RW, 400, -RW, RW, asphaltMat, 0.045, 7);
const walkMat = L('#cfc9be');
for (const [x0, x1, z0, z1] of [[-8, -RW, -400, -RW], [-8, -RW, RW, 400], [RW, 8, -400, -RW], [RW, 8, RW, 400], [-400, -8, -8, -RW], [-400, -8, RW, 8], [8, 400, -8, -RW], [8, 400, RW, 8]]) plane(x0, x1, z0, z1, walkMat, 0.09, 4);
{ // markings: centre dashes, stop lines, zebra crossings
  const dg = new THREE.PlaneGeometry(0.15, 3); dg.rotateX(-PI / 2); const list = [];
  for (let z = 14; z < 300; z += 7) { list.push([0, 0.07, z], [0, 0.07, -z]); }
  const dI = new THREE.InstancedMesh(dg, markMat, list.length * 2); let n = 0;
  list.forEach(p => { _m.compose(_v.set(...p), _q.identity(), _s.set(1, 1, 1)); dI.setMatrixAt(n++, _m); });
  list.forEach(p => { _q.setFromAxisAngle(_v.set(0, 1, 0), PI / 2); _m.compose(_v.set(p[2], 0.075, p[0]), _q, _s.set(1, 1, 1)); dI.setMatrixAt(n++, _m); });
  dI.count = n; scene.add(dI);
  const sl = new THREE.PlaneGeometry(RW, 0.45); sl.rotateX(-PI / 2);
  for (const [x, z, r] of [[LANE, 8.0, 0], [-LANE, -8.0, 0], [-8.0, LANE, PI / 2], [8.0, -LANE, PI / 2]]) { const m = new THREE.Mesh(sl, markMat); m.position.set(x, 0.075, z); m.rotation.y = r; scene.add(m); }
  const zg = new THREE.PlaneGeometry(0.55, 3.2); zg.rotateX(-PI / 2); const zl = [];
  for (let k = -5; k <= 5; k++) { const o = k * 0.68; zl.push([o, 0.076, 10.6, 0], [o, 0.076, -10.6, 0], [10.6, 0.076, o, PI / 2], [-10.6, 0.076, o, PI / 2]); }
  const zI = new THREE.InstancedMesh(zg, markMat, zl.length); zl.forEach((p, i) => { _q.setFromAxisAngle(_v.set(0, 1, 0), p[3]); _m.compose(_v.set(p[0], p[1], p[2]), _q, _s.set(1, 1, 1)); zI.setMatrixAt(i, _m); }); scene.add(zI);
}
makeLandscape({ avoid: (x, z) => (Math.abs(x) < 70 && Math.abs(z) < 70) || Math.abs(x) < 10 || Math.abs(z) < 10, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 75 && Math.abs(z) - d / 2 < 75, near: [0, 0, 300, 300], trees: 1200, seed: 6601 });
// houses on three corners
const winTex = (base, frame) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = frame; c.fillRect(24 + x * 128, 30 + y * 128, 80, 84); c.fillStyle = '#4f6f8f'; c.fillRect(30 + x * 128, 36 + y * 128, 68, 72); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(34 + x * 128, 40 + y * 128, 20, 64); } }, true);
function house(x, z, w, d, h, col, roofCol, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const t = winTex(col, '#ffffff'); t.repeat.set(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 4)));
  const t2 = winTex(col, '#ffffff'); t2.repeat.set(Math.max(1, Math.round(d / 4)), Math.max(1, Math.round(h / 4)));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [L('#fff', { map: t2 }), L('#fff', { map: t2 }), L(col), L(col), L('#fff', { map: t }), L('#fff', { map: t })]);
  m.position.y = h / 2; m.castShadow = m.receiveShadow = true; g.add(m);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.4, 0); sh.lineTo(w / 2 + 0.4, 0); sh.lineTo(0, 2.6); sh.lineTo(-w / 2 - 0.4, 0);
  const rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.6) / 2);
  const rf = new THREE.Mesh(rg, L(roofCol)); rf.position.y = h; rf.castShadow = true; g.add(rf); return g;
}
const HC = [['#f4e1c1', '#b8462e'], ['#dfe9f2', '#5d6d7e'], ['#f6d6d0', '#8e3b2e'], ['#e8f0d8', '#6d4c41'], ['#fff1c9', '#a5523a']];
[[-14, 16, 9, 8, 7], [-14, 28, 9, 9, 8], [-14, 41, 9, 9, 6.5], [14, 16, 9, 8, 7.5], [14, 28, 9, 9, 6], [14, 41, 9, 9, 8], [-14, -16, 9, 9, 9], [-14, -29, 9, 10, 7], [-14, -42, 9, 9, 8], [-27, 16, 9, 8, 6], [27, 16, 9, 8, 7], [-27, -16, 9, 9, 7]]
  .forEach(([x, z, w, d, h], i) => house(x, z, w, d, h, HC[i % 5][0], HC[i % 5][1], Math.abs(x) < 20 ? PI / 2 : 0));
// street trees on the pavements (kept away from the hero's camera lines)
{ const pts = [[-6.3, 24], [-6.3, 36], [6.3, 26], [6.3, 38], [-24, 6.3], [-36, 6.3], [-24, -6.3], [-6.3, -24], [-6.3, -36], [24, 6.3]];
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.22, 2.6, 6), L('#6d4a2b'), pts.length);
  const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length);
  pts.forEach(([x, z], i) => { _m.compose(_v.set(x, 1.3, z), _q.identity(), _s.set(1, 1, 1)); trunk.setMatrixAt(i, _m); _m.compose(_v.set(x, 3.6, z), _q.identity(), _s.set(1, 1.15, 1)); leaf.setMatrixAt(i, _m); leaf.setColorAt(i, _c.set(['#3f8f2e', '#4fa336', '#5fb33f'][i % 3])); });
  trunk.castShadow = leaf.castShadow = true; scene.add(trunk); scene.add(leaf); }

// ---------------- scrapyard (x > 8, z < -8) ----------------
const T = V3(16, 0, -16), JY = 30;                  // crane tower foot, jib height
const fenceT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#9aa3a8'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = '#7f888d'; c.fillRect(x, 0, 6, h); c.fillStyle = '#b5bdc1'; c.fillRect(x + 8, 0, 3, h); } c.fillStyle = 'rgba(120,70,30,0.25)'; for (let i = 0; i < 40; i++) c.fillRect(Math.random() * w, h - 30 + Math.random() * 30, 10, 30); }, true);
fenceT.repeat.set(6, 1);
const fenceM = L('#ffffff', { map: fenceT });
box(0.15, 2.6, 52, fenceM, 9.0, 1.3, -35, true); box(52, 2.6, 0.15, fenceM, 35, 1.3, -9.0, true);
{ const st = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("MAGNUS SCRAP", w / 2, h / 2 + 4); c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), L('#fff', { map: st })); sg.position.set(22, 3.2, -8.9); scene.add(sg);
  for (const x of [19.2, 24.8]) box(0.15, 3.2, 0.15, L('#555'), x, 1.6, -8.95, true); }
plane(9.1, 60, -60, -9.1, L('#8b7b62', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = 150 + Math.random() * 90 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, true) }), 0.08, 8);
// scrap bales: stacks of crushed cars
const baleT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { c.fillStyle = `hsl(${Math.random() * 360},${30 + Math.random() * 40}%,${35 + Math.random() * 35}%)`; c.fillRect(Math.random() * w, Math.random() * h, 8 + Math.random() * 30, 4 + Math.random() * 10); } c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(Math.random() * w, Math.random() * h); c.lineTo(Math.random() * w, Math.random() * h); c.stroke(); } });
const BALE_COLS = ['#d84f4f', '#4f7fd8', '#e8c24a', '#5fae5f', '#d8d8d8', '#8a6fd0', '#e08a3c'];
{ const R = rng(661); const list = [];
  for (const [bx, bz, nx, nz, ny] of [[44, -16, 3, 2, 3], [44, -30, 2, 3, 2], [22, -50, 3, 2, 2], [40, -50, 2, 2, 3], [12, -46, 1, 3, 2]]) for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) for (let k = 0; k < ny - (R() < 0.3 ? 1 : 0); k++) list.push([bx + i * 1.8 + (R() - 0.5) * 0.2, 0.8 + k * 1.6, bz + j * 1.8, (R() - 0.5) * 0.2, R()]);
  const bm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 1.6, 1.7), L('#ffffff', { map: baleT }), list.length);
  list.forEach(([x, y, z, r, c], i) => { _q.setFromAxisAngle(_v.set(0, 1, 0), r); _m.compose(_v.set(x, y, z), _q, _s.set(1, 1, 1)); bm.setMatrixAt(i, _m); bm.setColorAt(i, _c.set(BALE_COLS[(c * 7) | 0])); });
  bm.castShadow = bm.receiveShadow = true; scene.add(bm);
  // tyre stacks
  const tl = []; for (const [x, z] of [[30, -14], [31.4, -14], [30.7, -15.3], [12.5, -24], [12.5, -26]]) for (let k = 0; k < 5; k++) tl.push([x, 0.15 + k * 0.28, z]);
  const tm = new THREE.InstancedMesh(new THREE.TorusGeometry(0.45, 0.17, 8, 18), STD('#1d1d1f', { roughness: 0.9 }), tl.length);
  tl.forEach((p, i) => { _q.setFromAxisAngle(_v.set(1, 0, 0), PI / 2); _m.compose(_v.set(...p), _q, _s.set(1, 1, 1)); tm.setMatrixAt(i, _m); }); tm.castShadow = true; scene.add(tm); }

// ---------------- tower crane ----------------
const craneY = STD('#ffc107', { roughness: 0.5, metalness: 0.2 });
const latT = canvasTex(128, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 12; c.strokeRect(6, -10, w - 12, h + 20); c.lineWidth = 8; for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y + 64); c.stroke(); c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y); c.stroke(); } }, true);
const latMat = (rx, ry) => { const t = latT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ color: '#ffc107', map: t, alphaTest: 0.5, transparent: false, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.2 }); };
{ const tw = new THREE.Mesh(new THREE.BoxGeometry(2.2, JY, 2.2), latMat(1, JY / 4.4)); tw.position.set(T.x, JY / 2, T.z); tw.castShadow = true; scene.add(tw);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.8, 4.5), L('#9e9e9e')); foot.position.set(T.x, 0.4, T.z); foot.castShadow = foot.receiveShadow = true; scene.add(foot); }
const slew = new THREE.Group(); slew.position.set(T.x, JY, T.z); scene.add(slew);
const JIB = 34;
{ const jib = new THREE.Mesh(new THREE.BoxGeometry(JIB, 1.6, 1.6), latMat(JIB / 3.2, 0.5)); jib.position.set(JIB / 2, 0.8, 0); jib.castShadow = true; slew.add(jib);
  const cj = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 1.6), latMat(4, 0.4)); cj.position.set(-6, 0.6, 0); cj.castShadow = true; slew.add(cj);
  const cw = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.2), L('#8d8d8d')); cw.position.set(-10.5, -0.4, 0); cw.castShadow = true; slew.add(cw);
  const peak = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6, 1.4), latMat(0.6, 1.4)); peak.position.set(0, 4.2, 0); peak.castShadow = true; slew.add(peak);
  const tie = (a, b) => { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, d.length(), 5), STD('#555')); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); m.castShadow = true; slew.add(m); };
  tie(V3(0, 7.2, 0), V3(JIB - 0.5, 1.6, 0)); tie(V3(0, 7.2, 0), V3(JIB * 0.5, 1.6, 0)); tie(V3(0, 7.2, 0), V3(-11.5, 1.2, 0));
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.6, 20), L('#5d5d5d')); ring.position.y = -0.3; slew.add(ring); }
// cab with the sleepy crane driver (window looks along the jib, +x local)
const cabG = new THREE.Group(); cabG.position.set(1.0, -1.4, 1.9); slew.add(cabG);
const OP = {};
{ const cm = craneY; const add = (w, h, d, x, y, z, m = cm) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; cabG.add(b); return b; };
  add(2.2, 0.15, 2.0, 0, -1.1, 0); add(2.2, 0.15, 2.0, 0, 1.1, 0); add(0.12, 2.2, 2.0, -1.05, 0, 0); add(2.2, 2.2, 0.12, 0, 0, -0.95); add(2.2, 2.2, 0.12, 0, 0, 0.95);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.05), new THREE.MeshStandardMaterial({ color: '#cfe6f5', transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false })); gl.position.set(1.08, 0, 0); gl.rotation.y = PI / 2; gl.userData.noAO = true; cabG.add(gl);
  const lt = new THREE.PointLight('#fff2d0', 6, 5, 1.5); lt.position.set(0.6, 0.6, 0); cabG.add(lt);
  // console + big red button
  add(0.5, 0.7, 1.2, 0.65, -0.7, 0, STD('#455a64'));
  OP.btn = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.08, 16), new THREE.MeshStandardMaterial({ color: '#e11d2e', emissive: '#ff2020', emissiveIntensity: 0.4 })); OP.btn.position.set(0.62, -0.3, 0.15); cabG.add(OP.btn);
  // driver
  const op = new THREE.Group(); op.position.set(-0.15, -0.55, 0); cabG.add(op); OP.g = op;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.8, 12), STD('#ff7043')); body.position.y = 0; op.add(body);
  const neck = new THREE.Group(); neck.position.set(0, 0.45, 0); op.add(neck); OP.neck = neck;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), STD('#f0c39d', { roughness: 0.7 })); head.position.set(0.05, 0.25, 0); neck.add(head);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 10, 0, PI * 2, 0, PI / 2), STD('#ffd60a')); hat.position.set(0.05, 0.32, 0); neck.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 18), STD('#ffd60a')); brim.position.set(0.08, 0.32, 0); neck.add(brim);
  OP.lids = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), STD('#fff')); e.position.set(0.3, 0.27, s * 0.1); neck.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), STD('#111')); p.position.set(0.05, 0, 0); e.add(p); return e; });
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12, PI), STD('#8a2b2b')); mo.position.set(0.31, 0.14, 0); mo.rotation.y = PI / 2; mo.rotation.z = PI; neck.add(mo);
  const sw = new THREE.Group(); sw.position.set(0.32, 0.05, -0.32); op.add(sw); OP.sand = sw;
  const br = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.18), L('#e8c48a')); sw.add(br); const br2 = br.clone(); br2.position.y = 0.09; sw.add(br2);
  const let_ = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.2), L('#6abf3f')); let_.position.y = 0.045; sw.add(let_);
}
// trolley + hook cable + magnet
const trolley = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.8), L('#616161')); trolley.castShadow = true; slew.add(trolley);
const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), STD('#2b2b2b')); cable.castShadow = true; scene.add(cable);
const mag = new THREE.Group(); scene.add(mag);
const MR = 2.8, MH = 1.1;
{ const side = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let x = -h; x < w; x += 96) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 48, h); c.lineTo(x + 48 + h, 0); c.lineTo(x + h, 0); c.fill(); } c.fillStyle = '#ffd60a'; c.fillRect(150, 28, 300, 72); c.fillRect(600, 28, 300, 72); c.fillStyle = '#111'; c.font = '900 56px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MAGNET', 300, 66); c.fillText('DANGER', 750, 66); });
  const bodyM = STD('#3b3f45', { roughness: 0.45, metalness: 0.6 });
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(MR, MR, MH, 40, 1, true), STD('#ffffff', { map: side, roughness: 0.5 })); cyl.castShadow = true; mag.add(cyl);
  const top = new THREE.Mesh(new THREE.CircleGeometry(MR, 40), STD('#c62828', { roughness: 0.45, metalness: 0.3 })); top.rotation.x = -PI / 2; top.position.y = MH / 2; mag.add(top);
  const bot = new THREE.Mesh(new THREE.CircleGeometry(MR, 40), bodyM); bot.rotation.x = PI / 2; bot.position.y = -MH / 2; mag.add(bot);
  const nT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e11d2e'; c.beginPath(); c.arc(128, 128, 120, 0, PI * 2); c.fill(); c.fillStyle = '#fff'; c.font = '900 190px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', 128, 140); });
  const nd = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), new THREE.MeshStandardMaterial({ map: nT, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 })); nd.rotation.x = PI / 2; nd.rotation.z = PI; nd.position.y = -MH / 2 - 0.01; mag.add(nd);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(MR, 0.12, 8, 40), bodyM); rim.rotation.x = PI / 2; rim.position.y = -MH / 2; mag.add(rim);
  const rim2 = rim.clone(); rim2.position.y = MH / 2; mag.add(rim2);
  // hook ring + chains
  const hk = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 8, 18), STD('#424242', { metalness: 0.7, roughness: 0.4 })); hk.position.y = MH / 2 + 2.0; mag.add(hk);
  for (let k = 0; k < 4; k++) { const a = k * PI / 2 + PI / 4, p0 = V3(Math.cos(a) * 2.0, MH / 2, Math.sin(a) * 2.0), p1 = V3(0, MH / 2 + 1.65, 0); const d = p1.clone().sub(p0); const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, d.length(), 5), STD('#424242', { metalness: 0.7 })); ch.position.copy(p0).add(p1).multiplyScalar(0.5); ch.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); mag.add(ch); }
  mag.userData.lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffb300', toneMapped: false })); mag.userData.lamp.position.set(1.4, MH / 2 + 0.15, 0); mag.add(mag.userData.lamp);
}
const glowT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
// field rings under the magnet (only while it pulls hard)
const fieldRings = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 40), new THREE.MeshBasicMaterial({ color: '#7fd3ff', transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = PI / 2; m.userData.noAO = true; scene.add(m); return m; });

// ---------------- crusher (front = +z) ----------------
const DIR0 = V3(-14.4, 0, 24).normalize();               // tower -> crossing
const M0 = V3(T.x + DIR0.x * 28, 0, T.z + DIR0.z * 28);  // magnet rest position (x,z)
const C = V3(T.x - DIR0.x * 28, 0, T.z - DIR0.z * 28);   // crusher (180 deg slew)
const crY = STD('#f9a825', { roughness: 0.5, metalness: 0.2 }), crD = STD('#37474f', { roughness: 0.6 });
const crusher = new THREE.Group(); crusher.position.copy(C); scene.add(crusher);
{ const add = (w, h, d, x, y, z, m = crY) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; crusher.add(b); return b; };
  add(9, 0.6, 6, 0, 0.3, 0, crD); add(9, 2.6, 0.5, 0, 1.6, -2.75); add(0.5, 2.6, 6, -4.25, 1.6, 0); add(0.5, 2.6, 6, 4.25, 1.6, 0); add(3.2, 2.6, 0.5, -2.9, 1.6, 2.75); add(3.2, 2.6, 0.5, 2.9, 1.6, 2.75);
  add(2.6, 0.6, 0.5, 0, 2.6, 2.75);                         // lintel over the exit hatch
  add(9, 0.25, 6, 0, 0.62, 0, STD('#5d4037'));               // chamber floor
  for (const x of [-4.6, 4.6]) { add(0.6, 7.5, 0.6, x, 3.75, -2.6, crD); add(0.6, 7.5, 0.6, x, 3.75, 2.6, crD); }
  add(10, 0.7, 6.4, 0, 7.6, 0, crD);
  const st = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd60a'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CRUSHER 3000', w / 2, h / 2 + 4); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.1), L('#fff', { map: st })); sg.position.set(0, 7.6, 3.21); crusher.add(sg); }
const press = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.0, 5.2), STD('#b0bec5', { metalness: 0.6, roughness: 0.35 })); press.castShadow = true; crusher.add(press);
const pistons = [-2.5, 2.5].map(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1, 10), STD('#cfd8dc', { metalness: 0.8, roughness: 0.25 })); p.position.x = x; crusher.add(p); return p; });

// ---------------- props that float ----------------
const ironM = STD('#4a4d52', { roughness: 0.6, metalness: 0.7 });
const coverT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#55595e'; c.beginPath(); c.arc(64, 64, 62, 0, PI * 2); c.fill(); c.strokeStyle = '#3c3f43'; c.lineWidth = 5; for (let k = -60; k < 64; k += 14) { c.beginPath(); c.moveTo(4, 64 + k); c.lineTo(124, 64 + k); c.stroke(); } c.strokeStyle = '#2c2e31'; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 58, 0, PI * 2); c.stroke(); });
const holeM = new THREE.MeshBasicMaterial({ color: '#0a0a0a', polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -4 });
const ITEMS = [];
function addItem(g, home, rot, local, localRot, kind) { g.position.copy(home); g.rotation.copy(rot); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(g);
  const it = { g, home: home.clone(), q0: new THREE.Quaternion().setFromEuler(rot), local, ql: new THREE.Quaternion().setFromEuler(localRot), kind }; ITEMS.push(it); return it; }
// manhole covers (local = on the magnet underside)
const COVERS = [[LANE, 2.4], [-1.6, -1.8], [2.2, -5.0]];
COVERS.forEach(([x, z], i) => {
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.58, 24), holeM); hole.rotation.x = -PI / 2; hole.position.set(x, 0.05, z); scene.add(hole);
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 28), [ironM, STD('#fff', { map: coverT, roughness: 0.6, metalness: 0.6 }), ironM]); g.add(m);
  const a = [-2.3, 0.4, 2.6][i];
  addItem(g, V3(x, 0.085, z), new THREE.Euler(0, i, 0), V3(Math.cos(a) * 2.1, -MH / 2 - 0.05, Math.sin(a) * 2.1), new THREE.Euler(0, i, 0), 'cover');
});
// bicycle (leaning on a lamp post)
const lampPos = V3(-5.0, 0, 13.5);
{ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 6, 8), STD('#37474f', { metalness: 0.6 })); p.position.set(lampPos.x, 3, lampPos.z); p.castShadow = true; scene.add(p);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), STD('#37474f')); arm.position.set(lampPos.x + 0.55, 5.95, lampPos.z); scene.add(arm);
  const hd = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.35), STD('#eceff1', { emissive: '#fff1c0', emissiveIntensity: 0.2 })); hd.position.set(lampPos.x + 1.05, 5.85, lampPos.z); scene.add(hd); }
const tubeBetween = (a, b, r, m, parent) => { const d = b.clone().sub(a); const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), m); t.position.copy(a).add(b).multiplyScalar(0.5); t.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); parent.add(t); return t; };
{ const g = new THREE.Group(); const fm = STD('#1e88e5', { metalness: 0.5, roughness: 0.35 }), tm = STD('#222', { roughness: 0.9 });
  for (const x of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 24), tm); w.position.set(x, 0.36, 0); g.add(w); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), fm); hub.rotation.x = PI / 2; hub.position.set(x, 0.36, 0); g.add(hub); }
  const P = { rw: V3(-0.55, 0.36, 0), fw: V3(0.55, 0.36, 0), bb: V3(-0.08, 0.36, 0), st: V3(-0.25, 0.85, 0), hd: V3(0.42, 0.9, 0) };
  tubeBetween(P.rw, P.bb, 0.025, fm, g); tubeBetween(P.rw, P.st, 0.025, fm, g); tubeBetween(P.bb, P.st, 0.03, fm, g); tubeBetween(P.st, P.hd, 0.03, fm, g); tubeBetween(P.bb, P.hd, 0.03, fm, g); tubeBetween(P.hd, P.fw, 0.025, fm, g);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.1), tm); seat.position.set(-0.27, 0.9, 0); g.add(seat);
  tubeBetween(V3(0.42, 0.98, -0.25), V3(0.42, 0.98, 0.25), 0.02, tm, g); tubeBetween(P.hd, V3(0.42, 0.98, 0), 0.02, fm, g);
  const basket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), L('#c48a3a')); basket.position.set(0.6, 0.98, 0); g.add(basket);
  addItem(g, V3(lampPos.x + 0.15, 0, lampPos.z - 0.75), new THREE.Euler(0.12, PI / 2, 0, 'YXZ'), V3(-MR - 0.35, -0.3, 0.2), new THREE.Euler(0, 0, PI / 2), 'bike'); }
// shopping trolley
{ const g = new THREE.Group(); const gT = canvasTex(64, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 5; c.strokeRect(2, 2, w - 4, h - 4); c.lineWidth = 3; for (let k = 16; k < w; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k, h); c.stroke(); c.beginPath(); c.moveTo(0, k); c.lineTo(w, k); c.stroke(); } }, true);
  const gm = new THREE.MeshStandardMaterial({ color: '#cfd8dc', map: gT, alphaTest: 0.5, side: THREE.DoubleSide, metalness: 0.7, roughness: 0.3 });
  const bx = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.9), gm); bx.position.set(0, 0.75, 0); g.add(bx);
  tubeBetween(V3(-0.3, 1.0, 0.5), V3(0.3, 1.0, 0.5), 0.025, STD('#e53935'), g);
  for (const [x, z] of [[-0.25, -0.35], [0.25, -0.35], [-0.25, 0.4], [0.25, 0.4]]) { tubeBetween(V3(x, 0.52, z), V3(x, 0.08, z), 0.02, STD('#9e9e9e', { metalness: 0.7 }), g); const w = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), STD('#222')); w.position.set(x, 0.06, z); g.add(w); }
  addItem(g, V3(6.0, 0.09, -10.5), new THREE.Euler(0, 0.6, 0), V3(MR + 0.3, -0.4, -0.6), new THREE.Euler(0, 0, -PI / 2), 'trolley'); }
// metal bin
{ const g = new THREE.Group(); const bm = STD('#9aa4ab', { metalness: 0.75, roughness: 0.35 });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.85, 18), bm); c.position.y = 0.43; g.add(c);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 18), bm); lid.position.y = 0.89; g.add(lid);
  const kn = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), bm); kn.position.y = 0.95; g.add(kn);
  addItem(g, V3(5.4, 0.09, 13.2), new THREE.Euler(0, 0, 0), V3(-0.4, -0.2, MR + 0.3), new THREE.Euler(-PI / 2, 0, 0), 'bin'); }

// ---------------- traffic light (hero's stop line, right-hand side) ----------------
const TLP = V3(4.6, 0, 7.4);
const lamps = {};
{ const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 3.2, 8), STD('#37474f', { metalness: 0.5 })); post.position.set(TLP.x, 1.6, TLP.z); post.castShadow = true; scene.add(post);
  const hd = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.25, 0.35), STD('#263238')); hd.position.set(TLP.x, 3.55, TLP.z); hd.castShadow = true; scene.add(hd);
  [['r', '#ff2a1a', 3.95], ['y', '#ffb300', 3.55], ['g', '#22e05a', 3.15]].forEach(([k, col, y]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), new THREE.MeshBasicMaterial({ color: col, toneMapped: false })); m.position.set(TLP.x, y, TLP.z + 0.18); scene.add(m); lamps[k] = { m, col: new THREE.Color(col) }; });
}
const haloR = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ff4a2a', transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending })); haloR.scale.setScalar(0.75); scene.add(haloR);

// ---------------- cars ----------------
const hero = makeCar('#1e88e5');
const others = [
  { car: makeCar('#e53935'), p: { x: -LANE, z: -9.5, h: PI }, local: V3(-2.6, -1.3, 1.2), lr: new THREE.Euler(0.5, 0.4, 0.9) },
  { car: makeCar('#fdd835'), p: { x: -11.5, z: LANE, h: -PI / 2 }, local: V3(2.4, -1.4, 1.9), lr: new THREE.Euler(-0.6, 1.4, -0.8) },
  { car: makeCar('#f5f5f5'), p: { x: 11.5, z: -LANE, h: PI / 2 }, local: V3(0.6, -1.5, -2.8), lr: new THREE.Euler(0.8, -0.3, 0.2) },
];
const HERO_HOME = { x: LANE, z: 10.2, h: 0 };
const HERO_LOCAL = V3(0, -MH / 2 - 1.66, 0.2);   // hanging under the magnet by the roof
// fridge magnet (heart): GRANDMA side / N side
const heart = new THREE.Group(); scene.add(heart);
{ const s = new THREE.Shape(); const k = 0.33; s.moveTo(0, -k * 1.0); s.bezierCurveTo(-k * 1.7, k * 0.1, -k * 0.8, k * 1.45, 0, k * 0.55); s.bezierCurveTo(k * 0.8, k * 1.45, k * 1.7, k * 0.1, 0, -k * 1.0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2 }); g.translate(0, 0, -0.04); g.rotateX(-PI / 2);
  const hm = new THREE.Mesh(g, STD('#e91e63', { roughness: 0.35 })); hm.castShadow = true; heart.add(hm);
  const tA = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.font = '900 44px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('I ♥', 128, 96); c.font = '900 40px Inter'; c.fillText('GRANDMA', 128, 146); });
  const tB = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', 128, 130); });
  const da = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: tA, transparent: true, depthWrite: false })); da.rotation.x = -PI / 2; da.rotation.z = PI; da.position.set(0, 0.075, 0.02); heart.add(da);
  const db = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: tB, transparent: true, depthWrite: false })); db.rotation.x = PI / 2; db.rotation.z = PI; db.position.set(0, -0.075, 0.02); heart.add(db);
  heart.scale.setScalar(1.35); }
// burnout smoke + dust
const SMOKE = Array.from({ length: 18 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#cfcfcf', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return s; });
const DUST = Array.from({ length: 16 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#c8b89a', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, a: hash(i) * PI * 2, v: 2 + hash(i + 4) * 3 }; });

// ---------------- motion helpers ----------------
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
const A0 = Math.atan2(-DIR0.z, DIR0.x);          // slew angle that points the jib at the crossing (local +x -> (cos a, 0, -sin a))
const MY0 = 7.4;                                   // magnet centre height at rest
const tSlew0 = tCrane - 0.1, tSlew1 = tDrops - 0.05;
const slewA = t => isRight(t) ? A0 : A0 + PI * ease(clamp((t - tSlew0) / (tSlew1 - tSlew0)));
// right way: magnet pushed away, swings back and sticks to the tower
const STICK = V3(T.x + DIR0.x * 3.9, 16.5, T.z + DIR0.z * 3.9);
const qStick = new THREE.Quaternion().setFromUnitVectors(V3(0, -1, 0), V3(DIR0.x * 0.75, -0.66, DIR0.z * 0.75).normalize());
const tPush0 = tPushed - 0.15, tStick = tClang - 0.05;
function bez(p0, p1, p2, p3, u) { const a = 1 - u; return V3(0, 0, 0).addScaledVector(p0, a * a * a).addScaledVector(p1, 3 * a * a * u).addScaledVector(p2, 3 * a * u * u).addScaledVector(p3, u * u * u); }
const PM0 = V3(M0.x, MY0, M0.z);
const PB1 = PM0.clone().add(V3(-DIR0.x * 9, 8, -DIR0.z * 9)), PB2 = STICK.clone().add(V3(DIR0.x * 9, 9, DIR0.z * 9));
function magnetPose(t) { // -> {pos, q, trolleyR}
  const right = isRight(t);
  const jit = (right ? win(t, tNorth, tPush0, 0.15) : 0);
  if (!right) { const a = slewA(t); const dir = V3(Math.cos(a), 0, -Math.sin(a)); const pos = V3(T.x + dir.x * 28, MY0, T.z + dir.z * 28);
    // swing-out while slewing + bounce when the cars hit
    const sw = Math.sin(PI * clamp((t - tSlew0) / (tSlew1 - tSlew0))) * 0.22;
    const q = new THREE.Quaternion().setFromAxisAngle(V3(-dir.z, 0, dir.x).normalize(), sw);
    const bump = win(t, tCatches + 0.1, tCatches + 0.8, 0.1) * Math.sin((t - tCatches) * 25) * 0.25 * Math.exp(-(t - tCatches) * 3);
    pos.y += bump + (t > tDrops ? 0.6 * ramp(t, tDrops, tDrops + 0.4) : 0);
    return { pos, q, r: 28 };
  }
  if (t < tPush0) { const pos = PM0.clone(); pos.x += 0.08 * jit * Math.sin(t * 61); pos.z += 0.08 * jit * Math.sin(t * 53); return { pos, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.04 * jit * Math.sin(t * 47), 0, 0.04 * jit * Math.sin(t * 41))), r: 28 }; }
  const u = clamp((t - tPush0) / (tStick - tPush0)); const e = u < 0.3 ? easeOut(u / 0.3) * 0.3 : 0.3 + 0.7 * easeIn((u - 0.3) / 0.7);
  if (u < 1) { const pos = bez(PM0, PB1, PB2, STICK, e); const q = new THREE.Quaternion().slerp(qStick, ease(u)); return { pos, q, r: lerp(28, 3.6, ease(u)) }; }
  const k = t - tStick; const pos = STICK.clone().addScaledVector(DIR0, 0.15 * Math.exp(-k * 6) * Math.sin(k * 30)); return { pos, q: qStick.clone(), r: 3.6 };
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + look[0], p.y + look[1], p.z + look[2]), fov]; };
const CabCam = (off, fov) => t => { const c = cabG.getWorldPosition(V3(0, 0, 0)); const a = slewA(t); const dir = V3(Math.cos(a), 0, -Math.sin(a)); return [c.clone().addScaledVector(dir, off).add(V3(0, 1.6, 0)), c.clone().add(V3(0, 0.0, 0)), fov]; };
const Cc = (p, l, fov = 40) => () => [V3(C.x + p[0], p[1], C.z + p[2]), V3(C.x + l[0], l[1], C.z + l[2]), fov];
const camKeys = [
  [0.0, Ac([2.4, 1.9, 19.0], [1.5, 1.5, -10], 40)],
  [tThenH - 0.3, Ac([2.3, 1.9, 18.3], [1.5, 1.4, -10], 40)],
  ...cut(tThenH - 0.25, Ac([-1.2, 0.9, -2.6], [1.7, 1.0, 4.5], 40)),
  [tAbove - 0.3, Ac([-1.0, 1.0, -2.2], [1.7, 1.9, 4.5], 40)],
  ...cut(tAbove - 0.2, Ac([4.6, 1.5, 19.5], [1.6, 3.0, 6.0], 40)),
  [tMagnet + 0.5, Ac([4.4, 1.5, 19.0], [1.6, 9.0, 5.0], 42)],
  ...cut(tSomebody - 0.25, CabCam(7.5, 25)),
  [tWhat - 0.3, CabCam(7.0, 25)],
  ...cut(tWhat - 0.25, Ac([-2.6, 5.0, 40], [1.0, 8.5, 0.0], 40)),
  [S('hook2').end + 0.5, Ac([-2.4, 5.0, 39], [1.0, 8.5, 0.0], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([5.2, 1.0, 16.8], [1.6, 1.0, 9.0], 40)),
  [tFast + 0.3, Ac([5.0, 1.1, 16.2], [1.6, 1.0, 9.0], 40)],
  ...cut(tBigM - 0.15, Ac([-4.0, 1.6, -6.5], [1.75, 0.6, 5.0], 36)),
  [tManhole + 0.3, Ac([-4.4, 1.6, -6.0], [1.75, 0.5, 3.5], 36)],
  ...cut(tJumps - 0.2, Ac([-7.5, 1.4, -7.5], [1.4, 4.5, 5.0], 40)),
  [tMid + 0.3, Ac([-7.8, 1.6, -8.5], [1.4, 5.8, 6.0], 40)],
  ...cut(tThenW - 0.15, Ac([-2.0, 12, 38], [1.0, 4.5, 2.0], 52)),
  [tCrane - 0.3, Ac([-2.0, 12.5, 39], [1.0, 5.0, 2.0], 52)],
  ...cut(tCrane - 0.25, Ac([-30, 26, 34], [14, 11, -14], 46)),
  [tDrops - 0.4, Ac([-30, 27, 34], [19, 8, -22], 46)],
  ...cut(tDrops - 0.2, Cc([-11, 13, 18], [0, 2.0, 0], 40)),
  [tCrunch + 0.4, Cc([-10.5, 12.5, 17.5], [0, 2.2, 0], 40)],
  ...cut(tYour - 0.2, Cc([-2.6, 2.3, 13.5], [0, 1.0, 6.2], 36)),
  [tRew0, Cc([-2.2, 2.2, 12.5], [0, 1.0, 6.2], 36)],
  // right
  ...cut(tRew1, Ac([-2.6, 5.0, 40], [1.0, 8.5, 0.0], 40)),
  ...cut(tStop - 0.2, Ac([-5.5, 2.6, 4.0], [1.2, 1.7, 9.8], 38)),
  [tGlove + 0.4, Ac([-5.2, 2.8, 4.4], [1.0, 1.8, 9.8], 38)],
  ...cut(tGrandma - 0.2, Ac([-0.9, 3.0, 5.2], [0.6, 2.0, 9.7], 36)),
  [tPut - 0.1, Ac([-0.8, 3.1, 5.5], [0.6, 2.0, 9.7], 36)],
  ...cut(tPut - 0.05, Ac([0.2, 5.2, 15.6], [1.75, 1.6, 9.9], 34)),
  [S('right3').end + 0.2, Ac([0.3, 5.3, 15.2], [1.75, 1.6, 9.9], 34)],
  ...cut(tNorth - 0.2, Ac([-4.0, 2.6, 22.5], [1.4, 4.4, 7.5], 40)),
  [tPushed - 0.35, Ac([-4.0, 2.7, 23.0], [1.4, 4.5, 7.5], 40)],
  ...cut(tPushed - 0.3, Ac([-24, 22, 32], [6, 13, -6], 46)),
  [tClang + 0.6, Ac([-23, 22, 31], [8, 14, -9], 46)],
  ...cut(tEverything - 0.2, Ac([-1.5, 10, 34], [4, 7, -4], 48)),
  [tBelongs + 0.6, Ac([-1.5, 8.5, 31], [2, 3.0, 2], 46)],
  ...cut(tGreen - 0.2, Ac([0.6, 2.7, 19.5], [2.6, 2.6, -6], 40)),
  ...cut(tDrive - 0.1, HeroCam([-1.2, 3.4, 8.0], [0.2, 0.9, -8], 40)),
  [tStrongest, HeroCam([-0.9, 2.9, 5.6], [0.0, 1.3, -6], 38)],
  [S('right7').start, HeroCam([-1.0, 3.6, 8.5], [0.2, 2.0, -16], 42)],
  [TOTAL, HeroCam([-1.0, 4.2, 10.5], [0.2, 3.0, -20], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _q2 = new THREE.Quaternion(), _p = new THREE.Vector3();
const heroZW = mono([[0, HERO_HOME.z], [tBigM - 0.1, HERO_HOME.z], [tManhole - 0.05, COVERS[0][1] + 1.38], [99, COVERS[0][1] + 1.38]]);
const heroZR = mono([[0, HERO_HOME.z], [tDrive - 0.1, HERO_HOME.z], [tDrive + 2.0, 0], [S('right7').start, -20], [TOTAL + 1, -46]]);
function setItemWorld(it, pos, q) { it.g.position.copy(pos); it.g.quaternion.copy(q); }
function attachPose(local, ql, out) { _p.copy(local).applyMatrix4(mag.matrixWorld); out.pos = _p.clone(); out.q = mag.quaternion.clone().multiply(ql); return out; }
function update(t) {
  const right = isRight(t);
  // ---- crane + magnet ----
  slew.rotation.y = slewA(t); slew.updateMatrixWorld(true);
  const mp = magnetPose(t); mag.position.copy(mp.pos); mag.quaternion.copy(mp.q); mag.updateMatrixWorld(true);
  trolley.position.set(mp.r, -0.35, 0);
  const tw = trolley.getWorldPosition(V3(0, 0, 0)); const top = mag.localToWorld(V3(0, MH / 2 + 2.4, 0)); const cd = tw.clone().sub(top);
  cable.position.copy(tw).add(top).multiplyScalar(0.5); cable.scale.set(1, cd.length(), 1); cable.quaternion.setFromUnitVectors(V3(0, 1, 0), cd.normalize());
  const on = t > tSwitched - 0.05 && (!right || t < tPush0);
  mag.userData.lamp.material.color.set(on ? (Math.floor(t * 4) % 2 ? '#ff2020' : '#ff8080') : '#ffb300');
  // field rings pulse down from the magnet while it is on (hook only)
  const fa = win(t, tSwitched, tWhat + 0.3, 0.3) * (right ? 0 : 1) + win(t, tGiant, tSwitched, 0.3) * 0.5 * (right ? 0 : 1);
  fieldRings.forEach((r, k) => { const ph = (t * 0.8 + k / 3) % 1; r.position.set(mp.pos.x, mp.pos.y - MH / 2 - 0.2 - ph * 5.5, mp.pos.z); r.scale.setScalar(1.2 + ph * 2.2); r.material.opacity = 0.55 * fa * Math.sin(PI * ph); r.visible = fa > 0.01; });
  // ---- crane driver: dozes off onto the button ----
  const doze = win(t, tSomebody - 0.6, 999, 0.4), nod = ramp(t, tSwitched - 0.35, tSwitched - 0.05);
  OP.neck.rotation.z = -0.15 * doze - (right ? (t < tPush0 ? 0.9 : lerp(0.9, 0.0, ramp(t, tPush0, tPush0 + 0.4))) : 0.9 * nod) + 0.06 * Math.sin(t * 2.2) * doze * (1 - nod);
  OP.lids.forEach(e => e.scale.y = (t > tSwitched + 0.3 && t < tSwitched + 1.0) ? 1.4 : (doze > 0.5 ? 0.15 : 1));
  OP.btn.material.emissiveIntensity = t > tSwitched - 0.05 && (!right || t < tPush0) ? 2.5 : 0.4;
  OP.sand.rotation.z = 0.1 * Math.sin(t * 1.7);
  // ---- floating props ----
  ITEMS.forEach((it, i) => {
    // lift schedule (hook): covers start to float, then snap up; bike/trolley/bin fly at "switched"
    const lift = it.kind === 'cover' ? [tManholeH - 0.1 + i * 0.12, tGiant + 0.2 + i * 0.15] : [tWhat - 0.45 + i * 0.1 - 3 * 0.1, tWhat + 0.35 + (i - 3) * 0.12];
    const a = attachPose(it.local, it.ql, {});
    let pos, q;
    if (t < lift[0]) { pos = it.home.clone(); q = it.q0.clone(); }
    else if (it.kind === 'cover' && t < tGiant - 0.05) { const u = ramp(t, lift[0], tGiant - 0.05); pos = it.home.clone().add(V3(0, 0.15 + 1.8 * u + 0.08 * Math.sin(t * 3 + i), 0)); q = it.q0.clone().multiply(_q2.setFromEuler(new THREE.Euler(0.25 * Math.sin(t * 2 + i) * u, t * 0.6 * u, 0.2 * Math.cos(t * 2.3 + i) * u))); }
    else { const s0 = it.kind === 'cover' ? tGiant - 0.05 : lift[0], u = easeIn(clamp((t - s0) / (lift[1] - s0)));
      const from = it.kind === 'cover' ? it.home.clone().add(V3(0, 1.95, 0)) : it.home.clone();
      pos = from.lerp(a.pos, u); pos.y += (it.kind === 'cover' ? 0 : 1.2 * Math.sin(PI * u)); q = it.q0.clone().slerp(a.q, u); }
    // right way: fall back home after the clang
    if (right && t > tComesR - 0.3) { const s0 = tComesR - 0.3 + i * 0.22, u = clamp((t - s0) / 1.15); const ar = attachPose(it.local, it.ql, {});
      if (u > 0) { pos = ar.pos.clone().lerp(it.home, easeIn(u)); pos.y += 6 * Math.sin(PI * u) * (1 - u); q = ar.q.clone().slerp(it.q0, ease(u)); if (u >= 1) { pos = it.home.clone(); const k = t - s0 - 1.15; pos.y += 0.25 * Math.abs(Math.sin(k * 14)) * Math.exp(-k * 6); } }
      else { pos = ar.pos; q = ar.q; } }
    // wrong way: dropped into the crusher with the cars
    if (!right && t > tDrops) { const u = easeIn(clamp((t - tDrops - 0.1) / 0.55)); const dst = V3(C.x - 2.5 + i * 1.0, 1.2, C.z + (i % 2 ? 1 : -1)); pos = pos.clone().lerp(dst, u); it.g.visible = t < tCrunch + 0.05; }
    else it.g.visible = true;
    setItemWorld(it, pos, q);
  });
  // ---- other cars: wobble in the hook, fly up in the wrong way ----
  others.forEach((o, i) => {
    const s0 = tComes - 0.35 + i * 0.32, s1 = s0 + 0.75;
    if (right || t < s0) { placeCar(o.car, Object.assign({ y: 0 }, o.p)); o.car.userData.bodyG.position.y = 0.04 * win(t, tSwitched, 999, 0.3) * Math.sin(t * 9 + i * 2); o.car.scale.set(1, 1, 1); o.car.visible = true; return; }
    const a = attachPose(o.local, _q2.setFromEuler(o.lr), {}); const u = easeIn(clamp((t - s0) / (s1 - s0)));
    const home = V3(o.p.x, 0, o.p.z); let pos = home.lerp(a.pos, u); const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, o.p.h, 0)); let q = q0.slerp(a.q, u);
    if (t > tDrops) { const v = easeIn(clamp((t - tDrops - 0.05 * i) / 0.55)); pos = pos.clone().lerp(V3(C.x - 2.4 + i * 2.4, 0.8, C.z + (i - 1) * 0.6), v); q = q.clone().slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, i, 0.2)), v); }
    o.car.position.copy(pos); o.car.quaternion.copy(q); o.car.userData.bodyG.rotation.set(0, 0, 0);
    const sq = ramp(t, tCrunch - 0.05, tCrunch + 0.12); o.car.scale.set(1, 1 - 0.7 * sq, 1); o.car.visible = t < tCrunch + 0.3;
  });
  // ---- hero ----
  hero.scale.set(1, 1, 1); hero.visible = true;
  let burn = 0, stuckHole = 0;
  if (!right) {
    if (t < tJumps) {
      const z = heroZW(t); burn = win(t, tFloor - 0.05, tBigM, 0.1); stuckHole = t > tManhole - 0.05 ? 1 : 0;
      const p = { x: LANE, z, h: 0, y: 0, pitch: 0, roll: 0 };
      if (burn) { p.roll = 0.02 * Math.sin(t * 40); p.pitch = 0.04 * burn; p.y = 0.02 * Math.abs(Math.sin(t * 30)); }
      if (stuckHole) { const k = ramp(t, tManhole - 0.05, tManhole + 0.12); p.pitch = -0.14 * k; p.y = -0.16 * k + 0.04 * Math.abs(Math.sin(t * 25)) * k; p.roll = 0.03 * Math.sin(t * 31) * k; }
      placeCar(hero, p);
      if (burn || stuckHole) { hero.userData.spin = (hero.userData.spin || 0) - 0.9; hero.userData.wheels.forEach(w => w.rotation.x = hero.userData.spin); }
    } else if (t < tCatches) {
      const u = clamp((t - tJumps) / (tCatches - tJumps)); const y = 4.3 * easeOut(Math.min(1, u * 1.25)) + 0.15 * Math.sin(t * 6) * u;
      hero.position.set(LANE, y, COVERS[0][1] + 1.38 + 1.2 * u); hero.rotation.set(0.5 * Math.sin(PI * Math.min(1, u * 1.1)) * 0.6, 0.15 * u, 0.12 * u, 'YXZ'); hero.userData.bodyG.rotation.set(0, 0, 0);
      hero.userData.spin = (hero.userData.spin || 0) - 0.6; hero.userData.wheels.forEach(w => w.rotation.x = hero.userData.spin);
    } else {
      const a = attachPose(HERO_LOCAL, _q2.identity(), {}); const u = easeIn(clamp((t - tCatches) / 0.32));
      const from = V3(LANE, 4.3 + 0.15 * Math.sin(tCatches * 6), COVERS[0][1] + 2.58); const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5 * Math.sin(PI * Math.min(1, 1.1)) * 0.6, 0.15, 0.12, 'YXZ'));
      let pos = from.lerp(a.pos, u), q = q0.slerp(a.q, u);
      if (t > tDrops) { const v = easeIn(clamp((t - tDrops - 0.15) / 0.55)); pos = pos.clone().lerp(V3(C.x, 0.9, C.z + 0.4), v); q = q.clone().slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.4, 0)), v); }
      hero.position.copy(pos); hero.quaternion.copy(q); hero.userData.bodyG.rotation.set(0, 0, 0);
      const sq = ramp(t, tCrunch - 0.05, tCrunch + 0.12); hero.scale.set(1, 1 - 0.6 * sq, 1);
      if (t > tCrunch + 0.25) { hero.visible = t > tYour - 0.1; // the cube comes out of the hatch
        const u2 = clamp((t - tYour + 0.1) / 0.7); const z = lerp(1.6, 6.2, easeOut(u2));
        hero.position.set(C.x, 0.62 * (1 - ramp(u2, 0.55, 0.8)) + 0.18 * Math.abs(Math.sin(u2 * 9)) * (1 - u2), C.z + z); hero.rotation.set(0, PI, 0); hero.scale.set(0.86, 1.0, 0.37);
        const sp = Math.exp(-Math.max(0, t - tCube) * 5) * Math.sin(Math.max(0, t - tCube) * 22); hero.scale.y = 1.0 + 0.08 * sp; }
    }
  } else {
    placeCar(hero, { x: LANE, z: heroZR(t), h: 0, y: 0 });
  }
  hero.userData.tl.emissiveIntensity = right && t < tStop ? 0.8 : (burn ? 1.6 : 0.35);
  // ---- fridge magnet ----
  heart.visible = right && t > tGlove - 0.1;
  if (heart.visible) {
    const win_ = hero.localToWorld(V3(-0.85, 1.25, -0.3)), roof = hero.localToWorld(V3(0, 1.66, 0.15));
    const u1 = clamp((t - tGlove + 0.1) / 0.5), u2 = clamp((t - tPut + 0.05) / (tRoof + 0.05 - tPut + 0.05));
    const hover = win_.clone().add(V3(-0.5, 0.9, 0)), pos = win_.clone().lerp(hover, easeOut(u1));
    let flipA = PI * ease(clamp((t - tWrongWay + 0.05) / 0.55));
    if (u2 > 0) pos.copy(hover.lerp(roof, ease(u2))).add(V3(0, 0.9 * Math.sin(PI * u2), 0));
    const rep = right ? win(t, tNorth - 0.1, tPush0 + 0.2, 0.15) : 0;   // N against N: it trembles
    pos.y += 0.03 * rep * Math.abs(Math.sin(t * 40));
    heart.position.copy(pos); heart.rotation.set(0, hero.rotation.y + PI, 0, 'YXZ'); heart.rotateZ(flipA); heart.rotateX(u2 < 1 ? 0.35 * Math.sin(t * 4) * (1 - u2) : 0);
    if (flipA > 0 && flipA < PI) heart.position.y += 0.5 * Math.sin(flipA);
    const pop = back(u1); heart.scale.setScalar(1.35 * Math.max(0.01, pop));
  }
  // ---- traffic light ----
  const green = right && t > tGreen - 0.1;
  lamps.r.m.material.color.copy(green ? new THREE.Color('#3a1010') : lamps.r.col); lamps.y.m.material.color.set('#3a2a08'); lamps.g.m.material.color.copy(green ? lamps.g.col : new THREE.Color('#0d2a14'));
  haloR.position.set(TLP.x, green ? 3.15 : 3.95, TLP.z + 0.25); haloR.material.color.set(green ? '#30ff70' : '#ff4a2a'); haloR.material.opacity = 0.35;
  // ---- crusher press ----
  const pr = !right ? ramp(t, tCrunch - 0.08, tCrunch + 0.06) - ramp(t, tCrunch + 0.6, tCrunch + 1.4) : 0;
  press.position.set(0, lerp(6.6, 1.25, pr), 0); pistons.forEach(p => { const top = 7.25, bot = press.position.y + 0.5; p.position.y = (top + bot) / 2; p.scale.y = Math.max(0.05, top - bot); });
  // ---- smoke (burnout + stuck) ----
  const sm = !right ? Math.max(win(t, tFloor, tBigM + 0.3, 0.2), win(t, tManhole, tJumps + 0.2, 0.1)) : 0;
  SMOKE.forEach((s, k) => { const ph = (t * 1.3 + k / SMOKE.length) % 1; const side = k % 2 ? 1 : -1; const base = hero.localToWorld(V3(side * 0.85, 0.25, 1.45)); s.position.copy(base).add(V3(side * ph * 0.8, ph * 1.6, ph * 2.0)); s.scale.setScalar(0.5 + ph * 1.5); s.material.opacity = 0.28 * sm * Math.sin(PI * ph); s.visible = sm > 0.01; });
  const dk = !right ? t - tCrunch : -1;
  DUST.forEach(d => { const on = dk > 0 && dk < 1.8; d.s.visible = on; if (!on) return; const r = 4 + d.v * (1 - Math.exp(-dk * 2.5)); d.s.position.set(C.x + Math.cos(d.a) * r * 1.2, 1 + dk * 0.8, C.z + Math.sin(d.a) * r * 0.8); d.s.scale.setScalar(1.6 + dk * 1.8); d.s.material.opacity = 0.5 * (1 - dk / 1.8); });
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(win(t, tCrunch - 0.02, tCrunch + 0.5, 0.05), 0.5 * win(t, tManhole - 0.02, tManhole + 0.3, 0.05), 0.6 * win(t, tCatches + 0.15, tCatches + 0.5, 0.05)) : 0.6 * win(t, tClang - 0.05, tClang + 0.45, 0.05);
  applyCam(c, t, shake > 0.02 ? 0.14 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { mag: project(mag.localToWorld(V3(0, -MH / 2, 0))), heart: project(heart.position.clone()), hero: project(hero.localToWorld(V3(0, 1.8, 0))), op: project(cabG.localToWorld(V3(0, 0.6, 0))), cube: project(hero.position.clone().add(V3(0, 2.2, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function badge(p, txt, col, a) { if (!p || !p.ok || a <= 0) return; ctx.save(); ctx.globalAlpha = a; const x = clamp(p.x, 120, W - 120), y = clamp(p.y, 520, 1100); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 52, 0, PI * 2); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + 4); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('RED LIGHT', RED, tRed - 0.1, tThenH - 0.2, 56);
    P_('THE MANHOLE COVERS...', '#455a64', tManholeH - 0.1, tAbove - 0.25, 50);
    floatText('FLOATING?!', W / 2, 760, t, tFloat - 0.05, tAbove - 0.2, 100, YEL, -0.05);
    P_('GIANT MAGNET', RED, tGiant - 0.15, tSomebody - 0.3, 58, iconWarn);
    P_('CRANE DRIVER: ASLEEP', '#e65100', tSomebody - 0.2, tSwitched - 0.1, 48);
    floatText('BONK!', W / 2 + 150, 820, t, tSwitched - 0.1, tSwitched + 0.8, 110, YEL, 0.08);
    P_('MAGNET: MAX', RED, tSwitched - 0.05, S('hook2').end + 0.3, 58, iconWarn);
    P_('FLOOR IT', RED, tFloor - 0.15, tBigM - 0.15, 58, iconX);
    floatText('VROOOM!', W / 2, 780, t, tFloor, tFloor + 1.4, 110, YEL, -0.06);
    P_('OPEN MANHOLE', RED, tOpen - 0.15, tJumps - 0.2, 56, iconWarn);
    floatText('BOING!', W / 2 - 120, 760, t, tJumps, tJumps + 0.9, 120, YEL, -0.08);
    P_('CAUGHT MID-AIR', RED, tCatches - 0.15, S('wrong2').end + 0.2, 54);
    floatText('CLANG!', W / 2 + 140, 700, t, tCatches + 0.15, tCatches + 1.0, 120, YEL, 0.08);
    P_('EVERY CAR', RED, tThenW - 0.1, tCrane - 0.25, 58, iconWarn);
    P_('NEXT STOP: CRUSHER', RED, tCrane - 0.2, tCrunch - 0.15, 52);
    floatText('CRUNCH!', W / 2, 760, t, tCrunch, tCrunch + 0.8, 150, YEL, 0.06);
    P_('YOUR CAR: CUBE', RED, tYour - 0.1, tRew0, 58, iconX);
  } else {
    P_('STOP + ENGINE OFF', GREEN, tStop - 0.1, tGlove - 0.25, 54, iconCheck);
    P_('OPEN THE GLOVEBOX', GREEN, tGlove - 0.2, tGrandma - 0.2, 54, iconCheck);
    P_("GRANDMA'S FRIDGE MAGNET", '#c2185b', tGrandma - 0.15, tWrongWay - 0.2, 46, iconHeart);
    P_('WRONG WAY ROUND', GREEN, tWrongWay - 0.15, tNorth - 0.2, 56, iconCheck);
    P_('NORTH vs NORTH', '#c62828', tNorth - 0.1, tPushed - 0.3, 56);
    const na = win(t, tNorth - 0.05, tPushed - 0.3, 0.2); badge(screen.mag, 'N', '#e11d2e', na); badge(screen.heart, 'N', '#e11d2e', na);
    floatText('MAGNETS HATE THAT', W / 2, 1000, t, tHate - 0.1, tPushed - 0.3, 64, YEL, -0.04);
    floatText('PUSH!', W / 2, 760, t, tPushed - 0.1, tPushed + 0.9, 130, YEL, -0.06);
    P_('STICKS TO ITS OWN CRANE', '#e65100', tSticks - 0.2, S('right4').end + 0.3, 46);
    floatText('CLANG!', W / 2 + 120, 760, t, tClang, tClang + 0.9, 140, YEL, 0.08);
    P_('EVERYTHING COMES BACK', GREEN, tComesR - 0.3, tRight - 0.15, 50, iconCheck);
    P_('RIGHT WHERE IT BELONGS', GREEN, tRight - 0.15, S('right5').end + 0.3, 48, iconCheck);
    P_('GREEN LIGHT', GREEN, tGreen - 0.1, tStrongest - 0.3, 58, iconCheck);
    P_('STRONGEST FRIDGE MAGNET IN TOWN', '#c2185b', tStrongest - 0.2, S('right6').end + 0.4, 38, iconHeart);
  }
}
window.dbg = { hero, mag, slew, ITEMS, C, M0, T };
start(update, hud);
