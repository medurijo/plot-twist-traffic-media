// Episode 60: Country road – a whole house on a lorry comes towards you
// hook (old style): quiet country road, something big comes round the bend -> it's a house, a whole house on a lorry,
//        both lanes, and the TV is still on
// wrong: honk and flash your lights, it'll make room -> the lorry driver gets a fright, full brake -> the house keeps going,
//        over the cab, and lands right on top of you -> congratulations, new homeowner (SOLD sign) -> and the TV? still on
// right: pull over, stop, honk politely like a doorbell: ding dong -> grandma opens the window, she knows what to do ->
//        opens the garage front and back, rolls out a ramp -> you drive straight through the house, past the sofa, past the TV,
//        she hands you a cup of tea (it rides on your roof) -> out the back: the cosiest tunnel in the world
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, roundedPath, pathAt, makeWheel,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
// ---------------- timing ----------------
const tQuiet = WT('hook1', 'Quiet'), tThen = WT('hook1', 'Then'), tBig1 = WT('hook1', 'big'), tBend = WT('hook1', 'bend');
const tIts = WT('hook2', "It's"), tWhole = WT('hook2', 'whole'), tLorry = WT('hook2', 'lorry'), tBoth = WT('hook2', 'Both'), tTV = WT('hook2', 'TV'), tStill = WT('hook2', 'still'), tWhat = WT('hook2', 'What');
const tHonk = WT('wrong1', 'honk'), tFlash = WT('wrong1', 'flash'), tRoom = WT('wrong1', 'room');
const tBigM = WT('wrong2', 'Big'), tDriver = WT('wrong2', 'driver'), tFright = WT('wrong2', 'fright'), tFull = WT('wrong2', 'Full'), tBrake = WT('wrong2', 'brake');
const tKeeps = WT('wrong3', 'keeps'), tOver = WT('wrong3', 'Over'), tCab = WT('wrong3', 'cab'), tLands = WT('wrong3', 'lands'), tCongr = WT('wrong3', 'Congratulations'), tHomeowner = WT('wrong3', 'homeowner'), tTVw = WT('wrong3', 'TV'), tStillW = WT('wrong3', 'Still');
const tPull = WT('right2', 'Pull'), tStop = WT('right2', 'Stop'), tPolite = WT('right2', 'politely'), tDoorbell = WT('right2', 'doorbell'), tDing = WT('right2', 'Ding'), tDong = WT('right2', 'dong');
const tGrandma = WT('right3', 'Grandma'), tWindow = WT('right3', 'window'), tKnows = WT('right3', 'knows');
const tGarage = WT('right4', 'garage'), tFront = WT('right4', 'front'), tBack = WT('right4', 'back'), tRolls = WT('right4', 'rolls'), tRamp = WT('right4', 'ramp');
const tDrive = WT('right5', 'drive'), tHouse = WT('right5', 'house'), tSofa = WT('right5', 'sofa'), tTVr = WT('right5', 'TV'), tHands = WT('right5', 'hands'), tCup = WT('right5', 'cup'), tTea = WT('right5', 'tea');
const tOut = WT('right6', 'Out'), tGo = WT('right6', 'go'), tCosiest = WT('right6', 'cosiest'), tTunnel = WT('right6', 'tunnel');
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

// ---------------- road (straight, then a bend to the left behind a wood) ----------------
const LANE = 1.75, RW = 3.6;
const CORN = [[0, 320], [0, -80], [-85, -133]];
const ROAD = roundedPath(CORN, 36);
const LP = roundedPath([...CORN].reverse(), 36);              // lorry drives the other way (towards +z)
const sOfZ = z => LP.len - (320 - z);                           // on the straight part
const roadPts = []; for (let s = 0; s <= ROAD.len; s += 2) roadPts.push(pathAt(ROAD, s));
const distRoad = (x, z) => { let d = 1e9; for (const p of roadPts) { const dd = (p.x - x) ** 2 + (p.z - z) ** 2; if (dd < d) d = dd; } return Math.sqrt(d); };
{ // ribbon
  const pos = [], uv = [], idx = []; let k = 0;
  for (let s = 0; s <= ROAD.len + 0.01; s += 1.5) { const p = pathAt(ROAD, s); const nx = Math.cos(p.h), nz = -Math.sin(p.h);
    pos.push(p.x - nx * RW, 0.05, p.z - nz * RW, p.x + nx * RW, 0.05, p.z + nz * RW); uv.push(0, s / 7, RW * 2 / 7, s / 7);
    if (k) idx.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k - 1, 2 * k + 1, 2 * k); k++; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, asphaltMat); m.receiveShadow = true; scene.add(m);
  // markings: centre dashes + edge lines
  const dg = new THREE.PlaneGeometry(0.15, 3); dg.rotateX(-PI / 2); const eg = new THREE.PlaneGeometry(0.14, 1.6); eg.rotateX(-PI / 2);
  const dI = new THREE.InstancedMesh(dg, markMat, 400), eI = new THREE.InstancedMesh(eg, markMat, 1000); let nd = 0, ne = 0;
  for (let s = 2; s < ROAD.len; s += 8) { const p = pathAt(ROAD, s); _q.setFromAxisAngle(_v.set(0, 1, 0), p.h); _m.compose(_v.set(p.x, 0.07, p.z), _q, _s.set(1, 1, 1)); dI.setMatrixAt(nd++, _m); }
  for (let s = 0; s < ROAD.len; s += 1.5) { const p = pathAt(ROAD, s); const nx = Math.cos(p.h), nz = -Math.sin(p.h); _q.setFromAxisAngle(_v.set(0, 1, 0), p.h);
    for (const sd of [-1, 1]) { _m.compose(_v.set(p.x + sd * nx * (RW - 0.3), 0.07, p.z + sd * nz * (RW - 0.3)), _q, _s.set(1, 1, 1)); if (ne < 1000) eI.setMatrixAt(ne++, _m); } }
  dI.count = nd; eI.count = ne; scene.add(dI); scene.add(eI); }
makeLandscape({ avoid: (x, z) => distRoad(x, z) < 9 || (x > 4 && x < 30 && z > -40 && z < 40), fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 8 && z + d / 2 > -60, near: [-30, -60, 80, 80], trees: 1400, seed: 6501 });
// a wood on the inside of the bend that hides what's coming
{ const R = rng(65); const pts = []; for (let i = 0; i < 260; i++) { const x = -6 - R() * 60, z = -50 - R() * 75; if (distRoad(x, z) < 7.5) continue; pts.push([x, z, 1.4 + R() * 0.9, R()]); }
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.32, 2.2, 6), L('#6d4a2b'), pts.length);
  const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.3, 1), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length);
  pts.forEach(([x, z, s, r], i) => { _m.compose(_v.set(x, 1.1 * s, z), _q.identity(), _s.set(s, s, s)); trunk.setMatrixAt(i, _m);
    _q.setFromEuler(new THREE.Euler(r * 3, r * 6, 0)); _m.compose(_v.set(x, 3.6 * s, z), _q, _s.set(s * 1.1, s * 1.3, s * 1.1)); leaf.setMatrixAt(i, _m); leaf.setColorAt(i, _c.set(['#3f8f2e', '#4fa336', '#2f7a28', '#5fb33f'][(r * 4) | 0])); });
  trunk.castShadow = leaf.castShadow = true; leaf.receiveShadow = true; scene.add(trunk); scene.add(leaf); }
// verge posts
{ const pg = new THREE.BoxGeometry(0.14, 1.0, 0.14); const pl = []; for (let z = -40; z < 300; z += 25) pl.push([-4.4, 0.5, z], [4.4, 0.5, z + 12]); instanced(pg, L('#f2f2f2'), pl); }

// ---------------- lorry (model faces -z, like the cars) ----------------
const lorry = new THREE.Group(); scene.add(lorry);
const cabM = STD('#d32f2f', { roughness: 0.35, metalness: 0.3 }), darkM = STD('#2a2c30', { roughness: 0.7 });
const DECK = 1.0;
{ const deck = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.32, 13.6), darkM); deck.position.set(0, DECK - 0.16, 0.6); deck.castShadow = true; deck.receiveShadow = true; lorry.add(deck);
  for (const [w, h, d, x, y, z] of [[2.5, 1.2, 2.5, 0, 1.4, -7.65], [2.5, 0.12, 2.5, 0, 3.04, -7.65], [2.5, 1.1, 0.12, 0, 2.5, -6.46], [0.12, 1.1, 2.5, -1.19, 2.5, -7.65], [0.12, 1.1, 2.5, 1.19, 2.5, -7.65]]) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cabM); cab.position.set(x, y, z); cab.castShadow = true; cab.receiveShadow = true; lorry.add(cab); }
  const seatB = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 2.3), STD('#37474f')); seatB.position.set(0, 2.0, -7.65); lorry.add(seatB);
  const bump = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.45, 0.3), darkM); bump.position.set(0, 0.75, -8.95); lorry.add(bump);
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.05), STD('#9aa0a8', { metalness: 0.8, roughness: 0.3 })); grille.position.set(0, 1.35, -8.92); lorry.add(grille);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CircleGeometry(0.17, 18), new THREE.MeshBasicMaterial({ color: '#fff7d6', toneMapped: false })); hl.position.set(s * 0.95, 1.05, -8.93); hl.rotation.y = PI; lorry.add(hl); }
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.95), new THREE.MeshStandardMaterial({ color: '#a8c8de', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.38, depthWrite: false })); ws.position.set(0, 2.55, -8.91); ws.rotation.y = PI; ws.userData.noAO = true; lorry.add(ws);
  // WIDE LOAD sign on the bumper
  const wl = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '900 70px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WIDE LOAD', w / 2, h / 2 + 4); c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.34), STD('#fff', { map: wl })); sign.position.set(0, 0.76, -9.11); sign.rotation.y = PI; lorry.add(sign);
  const axleZ = [-7.6, 3.6, 4.8, 6.0]; lorry.userData.wheels = [];
  for (const z of axleZ) for (const s of [-1, 1]) { const w = makeWheel(0.52, 0.4); w.position.set(s * 1.15, 0.52, z); lorry.add(w); lorry.userData.wheels.push(w); } }
// beacons on the cab roof
const beaconM = new THREE.MeshBasicMaterial({ color: '#ffa000', toneMapped: false });
const beacons = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.22, 14), beaconM); b.position.set(s * 0.9, 3.22, -7.9); lorry.add(b); return b; });
// lorry driver (visible through the windscreen)
const drv = new THREE.Group(); drv.position.set(0.55, 2.2, -8.0); lorry.add(drv);
const D = {};
{ const skin = STD('#f0c39d', { roughness: 0.7 }); const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 14), skin); drv.add(head);
  const capM = STD('#1e88e5'); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 10, 0, PI * 2, 0, PI / 2), capM); cap.position.y = 0.05; drv.add(cap);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.2), capM); brim.position.set(0, 0.07, -0.3); drv.add(brim);
  D.eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), STD('#fff', { roughness: 0.2 })); e.position.set(s * 0.1, 0.0, -0.24); drv.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), STD('#111')); p.position.set(0, 0, -0.045); e.add(p); return e; });
  D.mouth = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), STD('#7a2020')); D.mouth.position.set(0, -0.12, -0.24); D.mouth.scale.set(1, 0.3, 0.4); drv.add(D.mouth);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.7, 12), STD('#455a64')); body.position.y = -0.55; drv.add(body); }

// ---------------- the house (model: origin = slab bottom centre, front -z, passage on model -x = world +x) ----------------
const house = new THREE.Group(); scene.add(house);
const HW = 9, HL = 10, WH = 3.0, FL = 0.3, PX0 = -3.8, PX1 = -1.4, PH = 2.35, WX0 = 0.4, WX1 = 3.2, WY0 = 1.2, WY1 = 2.6;
const plaster = L('#f4e6cc'), wallpaper = L('#ffffff', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e9dcc0'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = '#d9c6a0'; c.fillRect(x, 0, 10, h); } c.fillStyle = '#c98a8a'; for (let y = 16; y < h; y += 48) for (let x = 21; x < w; x += 32) { c.beginPath(); c.arc(x, y + (x / 32 % 2) * 24, 5, 0, PI * 2); c.fill(); } }, true) });
wallpaper.map.repeat.set(3, 1);
function wbox(x0, x1, y0, y1, z0, z1, inner) { // inner: which face index shows wallpaper (0 +x,1 -x,4 +z,5 -z)
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); const mats = [plaster, plaster, plaster, plaster, plaster, plaster]; if (inner != null) mats[inner] = wallpaper;
  const m = new THREE.Mesh(g, mats); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = true; m.receiveShadow = true; house.add(m); return m; }
const T_ = 0.2, Y1 = FL + WH;
{ // slab + floor
  const slab = new THREE.Mesh(new THREE.BoxGeometry(HW, FL, HL), L('#bfb6a6')); slab.position.y = FL / 2; slab.castShadow = true; slab.receiveShadow = true; house.add(slab);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(HW - 0.4, HL - 0.4), L('#ffffff', { map: canvasTex(256, 256, (c, w, h) => { for (let y = 0; y < h; y += 16) { c.fillStyle = (y / 16) % 2 ? '#b07a48' : '#a36c3c'; c.fillRect(0, y, w, 16); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(0, y, w, 1); } }, true) }));
  fl.material.map.repeat.set(2, 3); fl.rotation.x = -PI / 2; fl.position.y = FL + 0.005; fl.receiveShadow = true; house.add(fl);
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(PX1 - PX0, HL - 0.2), L('#8d8a84')); lane.rotation.x = -PI / 2; lane.position.set((PX0 + PX1) / 2, FL + 0.01, 0); lane.receiveShadow = true; house.add(lane);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.3, 30), L('#b23a48')); rug.rotation.x = -PI / 2; rug.scale.set(1.4, 1, 1); rug.position.set(2.0, FL + 0.015, 1.9); house.add(rug);
  // front wall (z = -HL/2), inner face +z (index 4)
  const zf0 = -HL / 2, zf1 = -HL / 2 + T_;
  wbox(-HW / 2, PX0, FL, Y1, zf0, zf1, 4); wbox(PX0, PX1, FL + PH, Y1, zf0, zf1, 4); wbox(PX1, WX0, FL, Y1, zf0, zf1, 4);
  wbox(WX0, WX1, FL, WY0 + FL, zf0, zf1, 4); wbox(WX0, WX1, WY1 + FL, Y1, zf0, zf1, 4); wbox(WX1, HW / 2, FL, Y1, zf0, zf1, 4);
  // back wall
  const zb0 = HL / 2 - T_, zb1 = HL / 2;
  wbox(-HW / 2, PX0, FL, Y1, zb0, zb1, 5); wbox(PX0, PX1, FL + PH, Y1, zb0, zb1, 5); wbox(PX1, HW / 2, FL, Y1, zb0, zb1, 5);
  // side walls
  wbox(-HW / 2, -HW / 2 + T_, FL, Y1, zf1, zb0, 0); wbox(HW / 2 - T_, HW / 2, FL, Y1, zf1, zb0, 1);
  // ceiling
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(HW, 0.12, HL), L('#f3efe6')); ceil.position.y = Y1 + 0.06; ceil.receiveShadow = true; ceil.castShadow = true; house.add(ceil);
  // gable roof
  const sh = new THREE.Shape(); sh.moveTo(-HW / 2 - 0.45, 0); sh.lineTo(HW / 2 + 0.45, 0); sh.lineTo(0, 2.5); sh.lineTo(-HW / 2 - 0.45, 0);
  const rg = new THREE.ExtrudeGeometry(sh, { depth: HL + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(HL + 0.6) / 2);
  const tiles = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#b8462e'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 22) for (let x = (y / 22 % 2) * 16; x < w; x += 32) { c.fillStyle = '#9c3a26'; c.beginPath(); c.arc(x + 16, y + 20, 15, 0, PI); c.fill(); } }, true); tiles.repeat.set(0.35, 0.35);
  const roof = new THREE.Mesh(rg, [L('#e8dcc4'), L('#ffffff', { map: tiles })]); roof.position.y = Y1 + 0.12; roof.castShadow = true; roof.receiveShadow = true; house.add(roof);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.7), L('#a5523a')); ch.position.set(2.2, Y1 + 1.9, 2.0); ch.castShadow = true; house.add(ch); house.userData.top = [roof, ceil, ch];
  // front door + step (decor) on the far left, window frame + flower box, little lamp
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.1), STD('#2e7d32')); door.position.set(3.7, FL + 1.05, zf0 - 0.01); door.rotation.y = PI; house.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), STD('#d4af37', { metalness: 0.9, roughness: 0.3 })); knob.position.set(3.35, FL + 1.0, zf0 - 0.04); house.add(knob);
  const fbox = new THREE.Mesh(new THREE.BoxGeometry(WX1 - WX0 + 0.2, 0.25, 0.35), L('#6d4c41')); fbox.position.set((WX0 + WX1) / 2, FL + WY0 - 0.05, zf0 - 0.2); house.add(fbox);
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), L(['#e91e63', '#ffeb3b', '#ff5722'][i % 3])); f.position.set(WX0 + 0.2 + i * 0.3, FL + WY0 + 0.15, zf0 - 0.22); house.add(f); }
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, WY1 - WY0, 0.08), L('#ffffff')); frame.position.set((WX0 + WX1) / 2, FL + (WY0 + WY1) / 2, zf0 - 0.02); house.add(frame);
  // garage passage frame stripes
  for (const z of [zf0 - 0.01, zb1 + 0.01]) { const st = new THREE.Mesh(new THREE.BoxGeometry(PX1 - PX0 + 0.3, 0.15, 0.05), L('#ffffff')); st.position.set((PX0 + PX1) / 2, FL + PH + 0.08, z); house.add(st); }
  // side windows (decals) on the left (model +x) wall
  for (const z of [-2.5, 1.0]) { const wd = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), STD('#3a5068', { roughness: 0.1, metalness: 0.5 })); wd.position.set(HW / 2 + 0.01, FL + 1.9, z); wd.rotation.y = PI / 2; house.add(wd);
    const wf = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.32, 1.72), L('#ffffff')); wf.position.set(HW / 2 + 0.0, FL + 1.9, z); house.add(wf); }
}
// front window glass (slides up when grandma opens it)
const glassM = new THREE.MeshStandardMaterial({ color: '#cfe6f5', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.22, depthWrite: false });
const sash = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, (WY1 - WY0) / 2), glassM); sash.position.set((WX0 + WX1) / 2, FL + WY0 + (WY1 - WY0) / 4, -HL / 2 + 0.06); sash.userData.noAO = true; house.add(sash);
const sashTop = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, (WY1 - WY0) / 2), glassM); sashTop.position.set((WX0 + WX1) / 2, FL + WY0 + 3 * (WY1 - WY0) / 4, -HL / 2 + 0.03); sashTop.userData.noAO = true; house.add(sashTop);
// garage doors (roll-up) + ramps
const doorT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#f2f2f2'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { c.fillStyle = '#c9c9c9'; c.fillRect(0, y, w, 3); } });
const gDoors = [-1, 1].map(s => { const d = new THREE.Mesh(new THREE.BoxGeometry(PX1 - PX0, PH, 0.06), STD('#ffffff', { map: doorT })); d.geometry.translate(0, -PH / 2, 0); d.position.set((PX0 + PX1) / 2, FL + PH, s * (HL / 2 - 0.1)); d.castShadow = true; house.add(d); return d; });
const RAMP_L = 3.0;
const rampMat = L('#ffffff', { map: canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#9a7650'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 20) { c.fillStyle = '#7a5a38'; c.fillRect(0, y, w, 3); } c.fillStyle = '#ffd60a'; c.fillRect(0, 0, 10, h); c.fillRect(w - 10, 0, 10, h); }) });
const ramps = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set((PX0 + PX1) / 2, FL, s * HL / 2); house.add(g);
  const m = new THREE.Mesh(new THREE.BoxGeometry(PX1 - PX0 - 0.1, 0.1, RAMP_L), rampMat); m.position.set(0, 0.05, s * RAMP_L / 2); m.castShadow = true; m.receiveShadow = true; g.add(m); g.userData.s = s; return g; });
const rampDown = Math.asin((DECK + FL) / RAMP_L);
const setRamp = (g, u) => { const s = g.userData.s; const ex = clamp(u / 0.65), tl = ramp(u, 0.6, 1); g.visible = u > 0.005; g.scale.set(1, 1, Math.max(0.001, ex)); g.rotation.x = s < 0 ? -rampDown * tl : rampDown * tl; };
// interior
const room = {};
{ const sofaM = STD('#5c7cbf', { roughness: 0.9 }); const sofa = new THREE.Group(); sofa.position.set(2.0, FL, -0.4); house.add(sofa);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.9), sofaM); seat.position.y = 0.32; sofa.add(seat);
  const bk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 0.25), sofaM); bk.position.set(0, 0.75, -0.38); sofa.add(bk);
  for (const s of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.9), sofaM); arm.position.set(s * 1.25, 0.45, 0); sofa.add(arm); }
  for (const s of [-1, 1]) { const cu = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.15), STD(s < 0 ? '#ffca28' : '#ef5350')); cu.position.set(s * 0.8, 0.75, -0.2); cu.rotation.z = s * 0.2; sofa.add(cu); }
  sofa.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); room.sofa = sofa;
  // TV on a cabinet against the back wall, facing the front
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.6, 0.5), STD('#6d4c41')); cab.position.set(2.0, FL + 0.3, HL / 2 - 0.5); cab.castShadow = true; house.add(cab);
  const tvb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 0.12), STD('#1b1b1f', { roughness: 0.4 })); tvb.position.set(2.0, FL + 1.3, HL / 2 - 0.5); tvb.castShadow = true; house.add(tvb);
  const tvCv = document.createElement('canvas'); tvCv.width = 320; tvCv.height = 180; room.tvCtx = tvCv.getContext('2d'); room.tvTex = new THREE.CanvasTexture(tvCv); room.tvTex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.04, 1.15), new THREE.MeshBasicMaterial({ map: room.tvTex, toneMapped: false })); scr.position.set(2.0, FL + 1.3, HL / 2 - 0.57); scr.rotation.y = PI; scr.userData.noAO = true; house.add(scr);
  room.tvLight = new THREE.PointLight('#9fd0ff', 6, 6, 1.5); room.tvLight.position.set(2.0, FL + 1.2, HL / 2 - 1.4); house.add(room.tvLight);
  // floor lamp, plant, pictures, armchair
  const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), STD('#333')); lp.position.set(3.9, FL + 0.8, 3.6); house.add(lp);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe0a0', side: THREE.DoubleSide })); shade.position.set(3.9, FL + 1.7, 3.6); house.add(shade);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 12), L('#c0623b')); pot.position.set(4.0, FL + 0.2, -4.2); house.add(pot);
  const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), new THREE.MeshLambertMaterial({ color: '#3f8f2e', flatShading: true })); pl.position.set(4.0, FL + 0.75, -4.2); house.add(pl);
  for (const [z, col] of [[-2.6, '#ffb74d'], [-0.4, '#64b5f6'], [1.8, '#81c784']]) { const pf = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.8), STD('#8d6e63')); pf.position.set(HW / 2 - T_ - 0.03, FL + 2.0, z); house.add(pf);
    const pi_ = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.46), L(col)); pi_.position.set(HW / 2 - T_ - 0.06, FL + 2.0, z); pi_.rotation.y = -PI / 2; house.add(pi_); }
  const arm = new THREE.Group(); arm.position.set(-0.3, FL, 0.6); arm.rotation.y = PI / 2; house.add(arm);
  const aM = STD('#8e5a9e', { roughness: 0.9 }); const as = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 0.9), aM); as.position.y = 0.3; arm.add(as);
  const ab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.2), aM); ab.position.set(0, 0.75, 0.38); arm.add(ab); arm.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const il = new THREE.PointLight('#ffd9a0', 22, 14, 1.4); il.position.set(1.5, FL + 2.7, 0.5); house.add(il); room.il = il;
  const il2 = new THREE.PointLight('#ffd9a0', 14, 10, 1.4); il2.position.set(-2.6, FL + 2.5, 1.0); house.add(il2); room.il2 = il2;
}
// grandma (model coords inside the house; front = -z by default)
const gran = new THREE.Group(); house.add(gran);
const G = {};
{ const skin = STD('#f2c9a6', { roughness: 0.7 }), cardi = STD('#8e44ad', { roughness: 0.9 }), skirt = STD('#5d4037', { roughness: 0.9 }), hair = STD('#eeeeee', { roughness: 0.8 });
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.75, 14), skirt); legs.position.y = 0.38; gran.add(legs);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 14), cardi); body.scale.set(1, 1.25, 0.85); body.position.y = 1.0; gran.add(body);
  const hd = new THREE.Group(); hd.position.y = 1.55; gran.add(hd); G.head = hd;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 22, 16), skin); hd.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.275, 22, 14, 0, PI * 2, 0, PI * 0.55), hair); hairM.rotation.x = 0.35; hairM.position.z = 0.03; hd.add(hairM);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), hair); bun.position.set(0, 0.22, 0.14); hd.add(bun);
  const glM = STD('#c9a227', { metalness: 0.8, roughness: 0.3 });
  for (const s of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 8, 20), glM); ring.position.set(s * 0.1, 0.03, -0.24); hd.add(ring);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), STD('#222')); e.position.set(s * 0.1, 0.03, -0.235); hd.add(e); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), skin); nose.position.set(0, -0.03, -0.26); hd.add(nose);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 6, 16, PI), STD('#a0303a')); smile.position.set(0, -0.1, -0.235); smile.rotation.z = PI; hd.add(smile);
  G.cheeks = [-1, 1].map(s => { const c = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), new THREE.MeshBasicMaterial({ color: '#ff8fa3', transparent: true, opacity: 0.7 })); c.position.set(s * 0.16, -0.06, -0.232); c.rotation.y = PI + s * 0.5; hd.add(c); return c; });
  // arms: pivots at the shoulders, arm hangs down (-y)
  G.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.36, 1.25, 0); gran.add(p);
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.5, 4, 10), cardi); a.position.y = -0.3; p.add(a);
    const hnd = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), skin); hnd.position.y = -0.62; p.add(hnd); p.userData.hand = hnd; return p; });
  gran.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); }
// teacup (+ saucer); lives in the world so it can ride on the car
const cup = new THREE.Group(); scene.add(cup);
{ const cm = STD('#ffffff', { roughness: 0.3 }); const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.13, 16), cm); c1.position.y = 0.065; cup.add(c1);
  const tea = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), STD('#8d5a2b')); tea.rotation.x = -PI / 2; tea.position.y = 0.12; cup.add(tea);
  const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.02, 20), cm); cup.add(sc);
  const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.013, 6, 12), cm); hdl.position.set(0.12, 0.07, 0); cup.add(hdl);
  for (let k = 0; k < 4; k++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: '#e91e63' })); d.position.set(Math.cos(k * PI / 2) * 0.1, 0.07, Math.sin(k * PI / 2) * 0.1); cup.add(d); }
  cup.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const blobT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const steam = Array.from({ length: 5 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0 })); cup.add(s); return s; });
const DUST = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: i % 2 ? '#d8c9a8' : '#bfae8c', transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); return { s, a: hash(i) * PI * 2, v: 3 + hash(i + 5) * 5, y: 0.4 + hash(i + 9) * 1.5 }; });
// SOLD sign (wrong ending)
const soldG = new THREE.Group(); scene.add(soldG);
{ const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.1), L('#8d6e63')); post.position.y = 0.8; soldG.add(post);
  const st = canvasTex(256, 160, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e11d2e'; c.fillRect(0, 0, w, 40); c.fillStyle = '#fff'; c.font = '900 30px Inter'; c.textAlign = 'center'; c.fillText('FOR SALE', w / 2, 30); c.fillStyle = '#e11d2e'; c.font = '900 84px Inter'; c.fillText('SOLD', w / 2, 128); });
  const bd = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.88, 0.05), [L('#fff'), L('#fff'), L('#fff'), L('#fff'), L('#fff', { map: st }), L('#fff', { map: st })]); bd.position.y = 1.6; soldG.add(bd); soldG.userData.bd = bd; }
soldG.position.set(3.9, 0, 12.6); soldG.rotation.y = -0.35;

// ---------------- hero ----------------
const hero = makeCar('#1e88e5');
const flares = [-1, 1].map(sd => { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#fff6c8', transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); f.position.set(sd * 0.6, 0.76, -2.35); f.scale.setScalar(0.75); hero.userData.bodyG.add(f); return f; });

// ---------------- motion ----------------
const ZC_R = -14, ZC_W = -12.4;          // lorry (house centre) stop positions: right way / after the full brake
const sL = mono([[0, sOfZ(-44) - 52], [tThen - 0.2, sOfZ(-44) - 36], [tIts, sOfZ(-37)], [tTV, sOfZ(-23)], [S('hook2').end + 0.6, sOfZ(-19.5)],
  [tHonk, sOfZ(-17.5)], [tFull - 0.1, sOfZ(-14.0)], [tBrake + 0.1, sOfZ(ZC_W)], [99, sOfZ(ZC_W)]]);
const sLR = mono([[S('wrong1').start - 1.0, sOfZ(-19.0)], [tPull, sOfZ(-17.2)], [tDing, sOfZ(ZC_R + 0.6)], [tDong + 0.6, sOfZ(ZC_R)], [999, sOfZ(ZC_R)]]);
const heroZW = mono([[0, 44], [tThen, 26], [tIts, 13], [tTV, 7.2], [S('hook2').end, 6.0], [99, 6.0]]);
// right: pull over to the verge, then drive through the house (x = 2.6)
const PXW = 2.6, HFZ = ZC_R + HL / 2, HBZ = ZC_R - HL / 2, RTIP = Math.cos(rampDown) * RAMP_L;
const heroXR = mono([[0, LANE], [tPull, LANE], [tStop + 0.2, PXW], [999, PXW]]);
const heroZR = mono([[0, 6.0], [tPull, 6.0], [tStop + 0.3, 2.4], [tDrive - 0.1, 2.4], [tDrive + 1.4, HFZ - 0.5], [tSofa + 0.1, ZC_R + 0.6], [tTVr + 0.1, ZC_R - 2.4], [tHands - 0.2, ZC_R - 2.9], [tTea + 0.4, ZC_R - 2.9], [tOut + 0.6, HBZ - 2.0], [tGo + 0.4, HBZ - 7.5], [TOTAL + 1, HBZ - 50]]);
const yAtZ = z => { if (z > HFZ + RTIP || z < HBZ - RTIP) return 0; if (z > HFZ) return (HFZ + RTIP - z) / RTIP * (DECK + FL); if (z < HBZ) return (z - (HBZ - RTIP)) / RTIP * (DECK + FL); return DECK + FL; };
// house flight (wrong)
const tFly0 = tBrake + 0.05, tFly1 = tLands;
const LAND = { x: -(PXW - LANE) + 0, z: 6.0 };   // passage centred on the hero (house rotated by PI: world x = cx - model x)
LAND.x = LANE - 2.6;

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
const HouseCam = (off, look, fov = 40) => t => { const p = house.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
// house-model coordinates -> world (house rotated by PI around y)
const HM = (x, y, z, zc = ZC_R) => [-x, y + DECK, zc - z];
const camKeys = [
  [0.0, HeroCam([0.6, 2.7, 9.5], [-0.6, 1.8, -24], 40)],
  ...cut(tThen - 0.25, Ac([2.2, 2.8, 30], [-7, 3.8, -78], 14)),
  [tIts - 0.3, Ac([2.2, 2.8, 30], [-2, 3.8, -50], 17)],
  ...cut(tIts - 0.25, HeroCam([2.6, 2.4, 9.5], [-1.2, 3.4, -24], 36)),
  [tBoth - 0.3, HeroCam([2.4, 2.5, 9.0], [-1.2, 3.6, -22], 36)],
  ...cut(tBoth - 0.25, Ac([0.6, 10.5, 9.5], [0, 2.0, -18], 40)),
  ...cut(tTV - 0.35, HouseCam([-2.0, 3.55, 12.5], [-2.0, 2.45, -4.5], 30)),
  [tWhat - 0.3, HouseCam([-2.0, 3.5, 11.2], [-2.0, 2.45, -4.5], 30)],
  ...cut(tWhat - 0.25, Ac([6.0, 3.2, 18], [-0.5, 3.0, -10], 40)),
  [S('hook2').end + 0.4, Ac([5.6, 3.3, 19], [-0.5, 3.0, -10], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([-0.6, 1.9, -1.2], [1.75, 1.0, 6.0], 40)),
  [tRoom + 0.3, Ac([-0.9, 2.0, -1.6], [1.75, 1.0, 6.0], 40)],
  ...cut(tBigM - 0.15, Ac([0.4, 2.9, ZC_W + 18.5], [-0.3, 2.3, ZC_W + 8.0], 30)),
  [tFull - 0.3, Ac([0.3, 2.9, ZC_W + 17.5], [-0.4, 2.3, ZC_W + 8.0], 30)],
  ...cut(tFull - 0.25, Ac([14, 4.0, 14], [0.3, 3.0, -6], 40)),
  ...cut(tKeeps - 0.15, Ac([24, 8.5, 27], [0.0, 3.2, -2.5], 40)),
  [tLands - 0.1, Ac([23, 8.0, 28], [0.0, 2.8, 0], 40)],
  [tCongr - 0.3, Ac([22, 7.5, 29], [-0.3, 2.6, 3], 40)],
  ...cut(tCongr - 0.25, Ac([7.5, 4.0, 35], [-0.2, 2.8, 8], 40)),
  [tTVw - 0.35, Ac([7.0, 4.0, 33], [-0.2, 2.8, 8], 40)],
  ...cut(tTVw - 0.3, Ac([-2.6, 2.5, 18.0], [-2.7, 1.5, 9.0], 30)),
  [tRew0, Ac([-2.6, 2.5, 17.0], [-2.7, 1.5, 9.0], 30)],
  // right
  ...cut(tRew1, Ac([3.4, 2.7, 18], [0.3, 3.0, -10], 40)),
  [tPull - 0.1, Ac([3.4, 2.7, 17.5], [0.3, 3.0, -10], 40)],
  ...cut(tPolite - 0.3, Ac([6.2, 2.6, 11.5], [0.8, 2.6, -8], 38)),
  [tDong + 0.4, Ac([5.8, 2.7, 10.5], [0.8, 2.7, -8], 38)],
  ...cut(tGrandma - 0.2, Ac([-4.2, 4.5, 1.8], [-1.8, 3.1, -9.2], 30)),
  [S('right3').end, Ac([-4.0, 4.4, 1.0], [-1.8, 3.1, -9.2], 30)],
  ...cut(tGarage - 0.3, Ac([10.5, 4.4, 5.0], [1.4, 1.9, -12.5], 40)),
  [tRamp + 0.5, Ac([10.0, 4.2, 4.0], [1.6, 1.7, -11.5], 40)],
  ...cut(tDrive - 0.2, Ac([4.0, 2.9, 7.0], [2.4, 1.9, -9], 38)),
  ...cut(tHouse - 0.1, Ac(HM(0.2, 25, -4.0), HM(0.2, 0, 0.3), 40)),
  [tTVr + 0.4, Ac(HM(0.2, 23.5, -3.0), HM(0.2, 0, 0.6), 40)],
  ...cut(tHands - 0.35, Ac(HM(0.7, 2.75, -1.9), HM(-1.45, 1.4, 3.0), 44)),
  [tTea + 0.3, Ac(HM(0.6, 2.75, -1.6), HM(-1.45, 1.45, 3.0), 44)],
  ...cut(tOut - 0.15, Ac([8.0, 3.8, -36], [2.2, 1.6, -21], 40)),
  [tCosiest - 0.3, Ac([7.0, 4.4, -40], [1.8, 1.8, -22], 40)],
  ...cut(tCosiest - 0.25, Ac([-3.0, 6.5, -47], [1.6, 2.2, -22], 40)),
  ...cut(S('right7').start - 0.2, HeroCam([-2.4, 2.8, -11], [0.2, 1.5, 3], 40)),
  [TOTAL, HeroCam([-2.4, 3.6, -13], [0.2, 2.0, 3], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- TV picture ----------------
function drawTV(t, right) {
  const c = room.tvCtx, w = 320, h = 180;
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5fb8ff'); g.addColorStop(1, '#bfe6ff'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = '#5cb84a'; c.fillRect(0, 120, w, 60);
  // a cartoon cow jumping over a fence (looped)
  const u = (t * 0.6) % 1, x = -40 + u * 400, y = 108 - Math.sin(u * PI * 3) ** 2 * 30;
  c.fillStyle = '#fff'; c.fillRect(x - 22, y - 14, 44, 24); c.fillStyle = '#222'; c.fillRect(x - 10, y - 12, 12, 10); c.fillRect(x + 20, y - 20, 14, 14);
  c.fillStyle = '#fff'; c.fillRect(x - 18, y + 10, 6, 10); c.fillRect(x + 12, y + 10, 6, 10);
  c.fillStyle = '#8d6e63'; for (let k = 0; k < 5; k++) c.fillRect(140 + k * 10, 100, 5, 25); c.fillRect(135, 105, 55, 5);
  // news ticker
  c.fillStyle = '#c62828'; c.fillRect(0, 152, w, 28); c.fillStyle = '#fff'; c.font = '900 18px Inter'; c.textBaseline = 'middle';
  const msg = (!right && t > tLands) ? 'BREAKING: HOUSE LANDS ON CAR  +++  NEW HOMEOWNER  +++  ' : 'LIVE  +++  HOUSE ON THE MOVE  +++  PLEASE DRIVE CAREFULLY  +++  ';
  const tw = c.measureText(msg).width; const off = (t * 60) % tw; c.fillText(msg + msg, 8 - off, 167);
  c.fillStyle = '#fff'; c.fillRect(8, 8, 46, 20); c.fillStyle = '#c62828'; c.font = '900 14px Inter'; c.fillText('LIVE', 14, 19);
  room.tvTex.needsUpdate = true;
  room.tvLight.intensity = 5 + 2 * Math.sin(t * 13) * Math.sin(t * 7);
}

// ---------------- update ----------------
let screen = {};
const _mx = new THREE.Matrix4();
function update(t) {
  const right = isRight(t);
  // ---- lorry ----
  const sl = right ? sLR(t) : sL(t);
  const lp = pathAt(LP, sl);
  const braking = !right ? win(t, tBrake - 0.05, tBrake + 0.7, 0.1) : 0;
  lorry.position.set(lp.x, 0, lp.z); lorry.rotation.set(-0.025 * braking * Math.sin((t - tBrake) * 12 + 1.5) * 0 - 0.03 * braking, lp.h, 0, 'YXZ');
  lorry.userData.wheels.forEach(w => w.rotation.x = -sl / 0.52);
  beacons.forEach((b, k) => { const on = Math.floor(t * 3 + k * 0.5) % 2 === 0; b.material.color.set(on ? '#ffb300' : '#7a4a00'); });
  lorry.updateMatrixWorld(true);
  // driver: fright in the wrong way
  const fr = !right ? win(t, tFright - 0.1, tKeeps + 0.4, 0.15) : 0;
  drv.position.y = 2.2 + 0.18 * fr * Math.abs(Math.sin((t - tFright) * 9)); D.eyes.forEach(e => e.scale.setScalar(1 + 0.8 * fr)); D.mouth.scale.set(1 + 0.4 * fr, 0.3 + 1.6 * fr, 0.4);
  // ---- house ----
  const onLorry = right || t < tFly0;
  if (onLorry) { _v.set(0, DECK, 0).applyMatrix4(lorry.matrixWorld); house.position.copy(_v); house.rotation.set(0, lp.h, 0, 'YXZ'); house.scale.set(1, 1, 1); }
  else { const u = clamp((t - tFly0) / (tFly1 - tFly0)), e = easeIn(u * 0.6 + 0.4 * u * u) ;
    const zc = pathAt(LP, sOfZ(ZC_W)).z; const sx = 0, sy = DECK, sz = zc;
    if (u < 1) { house.position.set(lerp(sx, LAND.x, u), lerp(sy, 0, u) + 3.3 * 4 * u * (1 - u), lerp(sz, LAND.z, ease(u))); house.rotation.set(0.10 * Math.sin(PI * u), PI, 0.05 * Math.sin(PI * u), 'YXZ'); house.scale.set(1, 1, 1); }
    else { const k = t - tFly1; house.position.set(LAND.x, 0, LAND.z); house.rotation.set(0, PI, 0, 'YXZ'); const sq = 0.06 * Math.exp(-k * 7) * Math.cos(k * 30); house.scale.set(1 + sq, 1 - sq, 1 + sq); } }
  house.updateMatrixWorld(true);
  // doors, ramps, window
  let doorF = 1, doorB = 1, rampF = 0, rampB = 0, win_ = 0;
  if (right) { doorF = 1 - ramp(t, tGarage - 0.1, tGarage + 0.7); doorB = 1 - ramp(t, tBack - 0.3, tBack + 0.5); rampF = ramp(t, tRolls - 0.1, tRamp + 0.2); rampB = ramp(t, tRolls + 0.1, tRamp + 0.5); win_ = ramp(t, tWindow - 0.3, tWindow + 0.4); }
  else if (t > tLands) doorF = 1 - 0.55 * ramp(t, tCongr - 0.2, tCongr + 0.8);
  [doorF, doorB].forEach((d, k) => { const m = gDoors[k]; m.scale.y = Math.max(0.03, d); m.visible = true; });
  // closed ramps stand up in front of the doors (they double as the loading flaps)
  setRamp(ramps[0], rampF); setRamp(ramps[1], rampB);
  sashTop.position.y = FL + WY0 + 3 * (WY1 - WY0) / 4; sash.position.y = FL + WY0 + (WY1 - WY0) / 4 + win_ * (WY1 - WY0) / 2 * 0.95;
  // grandma: only in the right way (window -> by the passage with the tea)
  gran.visible = right && t > tGrandma - 0.4;
  const atWindow = t < tDrive;
  let waveA = 0, reach = 0;
  if (atWindow) { gran.position.set(1.8, FL + 0.4, -HL / 2 + 0.75); gran.rotation.y = 0; waveA = win(t, tGrandma, tKnows + 0.3, 0.3); }
  else { gran.position.set(-0.85, FL, 3.0); gran.rotation.y = 0.15; reach = win(t, tHands - 0.3, tTea + 0.5, 0.3); }
  G.head.rotation.set(0.1 * Math.sin(t * 2), (atWindow ? 0.25 * Math.sin(t * 1.3) : 0), atWindow ? 0.12 * win(t, tKnows - 0.2, S('right3').end, 0.2) * Math.sin(t * 6) : 0);
  G.arms[1].rotation.set(0, 0, 0.15 + waveA * (2.5 + 0.35 * Math.sin(t * 9)));
  G.arms[0].rotation.set(-0.3 * reach, 0, -0.15 - reach * 1.35);
  // ---- hero ----
  let hp;
  if (!right) {
    const z = heroZW(t); hp = { x: LANE, z, h: 0, y: 0 };
    if (t > tLands) hp.y = FL;
  } else {
    const z = heroZR(t); const y = yAtZ(z); const pitch = Math.atan((yAtZ(z - 0.6) - yAtZ(z + 0.6)) / 1.2);
    hp = { x: heroXR(t), z, h: t > tPull && t < tStop + 0.3 ? 0.12 * win(t, tPull, tStop + 0.3, 0.3) * -1 : 0, y, pitch };
  }
  placeCar(hero, hp);
  const flashOn = !right && t > tFlash - 0.05 && t < tRoom + 0.4 && Math.floor((t - tFlash) * 6) % 2 === 0;
  hero.userData.hl.emissiveIntensity = flashOn ? 4 : 0.3; flares.forEach(f => f.material.opacity = flashOn ? 0.8 : 0);
  const blinkR = right && t > tPull - 0.1 && t < tStop + 0.6 && Math.floor(t * 2.6) % 2 === 0; hero.userData.bl.R.emissiveIntensity = blinkR ? 3 : 0; hero.userData.bl.L.emissiveIntensity = 0;
  // ---- teacup ----
  cup.visible = right && t > tHands - 0.5;
  if (cup.visible) {
    const handW = G.arms[0].userData.hand.getWorldPosition(new THREE.Vector3()); const roof = hero.localToWorld(V3(0.15, 1.63, 0.25));
    const u = ramp(t, tCup - 0.1, tTea + 0.15);
    cup.position.copy(handW).add(V3(0, 0.05, 0)).lerp(roof, u); cup.rotation.set(hero.rotation.x * u, hero.rotation.y, 0, 'YXZ');
    steam.forEach((s, k) => { const ph = (t * 0.6 + k / 5) % 1; s.position.set(0.02 * Math.sin(k * 3 + t * 2), 0.18 + ph * 0.45, 0); s.scale.setScalar(0.1 + ph * 0.18); s.material.opacity = 0.5 * Math.sin(PI * ph); });
  }
  // ---- dust (wrong landing) ----
  const dk = !right ? t - tLands : -1;
  DUST.forEach(d => { const on = dk > 0 && dk < 2.2; d.s.visible = on; if (!on) return; const r = 4.8 + d.v * (1 - Math.exp(-dk * 2.2)); d.s.position.set(LAND.x + Math.cos(d.a) * r * 1.05, d.y + dk * 0.4, LAND.z + Math.sin(d.a) * r * 1.1); d.s.scale.setScalar(1.6 + dk * 1.4); d.s.material.opacity = 0.55 * (1 - dk / 2.2); });
  soldG.visible = !right && t > tHomeowner - 0.3; const sp = back(clamp((t - tHomeowner + 0.3) / 0.45)); soldG.scale.set(1, Math.max(0.001, sp), 1);
  const topOff = right && t > tHouse - 0.12 && t < tHands - 0.36; house.userData.top.forEach(o => o.visible = !topOff);
  // ---- interior lights only matter when we look inside ----
  drawTV(t, right);
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(win(t, tLands - 0.05, tLands + 0.5, 0.05), 0.5 * win(t, tBrake - 0.05, tBrake + 0.4, 0.05)) : 0;
  applyCam(c, t, shake > 0.02 ? 0.12 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { gran: project(gran.localToWorld(V3(0, 1.9, 0))), hero: project(hero.localToWorld(V3(0, 1.8, 0))), cup: project(cup.position.clone()), drv: project(drv.localToWorld(V3(0, 0.4, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hearts(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 3; k++) { const u = ((t - a) * 0.9 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - u) * win(t, a, b, 0.2); iconHeart(clamp(p.x, 200, W - 200) + (k - 1) * 110, clamp(p.y, 560, 1100) - 40 - u * 200, 34, '#ff4f9a'); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('QUIET COUNTRY ROAD', '#2e7d32', tQuiet - 0.1, tThen - 0.2, 50);
    P_('SOMETHING BIG...', '#e65100', tBig1 - 0.1, tIts - 0.2, 54, iconWarn);
    P_("IT'S A HOUSE", '#6d4c41', tIts - 0.1, tBoth - 0.2, 58);
    P_('BOTH LANES', RED, tBoth - 0.1, tTV - 0.4, 58, iconWarn);
    P_('TV: STILL ON', '#1565c0', tTV - 0.2, S('hook2').end + 0.3, 56);
    P_('HONK + FLASH', RED, tHonk - 0.15, tRoom + 0.4, 54, iconX);
    floatText('HONK!', W / 2 + 170, 720, t, tHonk, tHonk + 0.7, 110, YEL, 0.08);
    floatText('FLASH!', W / 2 - 160, 840, t, tFlash, tFlash + 0.8, 110, '#fff59d', -0.08);
    P_('DRIVER: FRIGHT', '#e65100', tFright - 0.15, tFull - 0.2, 54, iconWarn);
    floatText('!!!', (screen.drv && screen.drv.ok) ? clamp(screen.drv.x, 200, W - 200) : W / 2, (screen.drv && screen.drv.ok) ? clamp(screen.drv.y - 120, 560, 1000) : 700, t, tFright - 0.05, tFull, 130, RED, 0.06);
    P_('FULL BRAKE!', RED, tFull - 0.1, tKeeps - 0.15, 60);
    floatText('SCREECH!', W / 2, 700, t, tBrake, tBrake + 0.8, 110, YEL, -0.06);
    P_('THE HOUSE KEEPS GOING', RED, tKeeps - 0.1, tLands - 0.1, 50, iconWarn);
    floatText('BOOM!', W / 2, 760, t, tLands, tLands + 0.9, 150, YEL, 0.06);
    P_('NEW HOMEOWNER', RED, tHomeowner - 0.2, tTVw - 0.35, 56, iconX);
    P_('TV: STILL ON', '#1565c0', tStillW - 0.15, tRew0, 56);
  } else {
    P_('PULL OVER + STOP', GREEN, tPull - 0.1, tPolite - 0.3, 54, iconCheck);
    P_('HONK POLITELY', GREEN, tPolite - 0.25, tDing - 0.15, 54, iconCheck);
    floatText('DING...', W / 2 - 150, 720, t, tDing - 0.05, tDong + 0.9, 110, YEL, -0.08);
    floatText('...DONG!', W / 2 + 150, 860, t, tDong - 0.05, tDong + 1.0, 110, YEL, 0.08);
    P_("SOMEBODY'S HOME!", '#8e24aa', tGrandma - 0.15, tKnows - 0.2, 54, iconHeart);
    P_('GRANDMA KNOWS WHAT TO DO', '#8e24aa', tKnows - 0.15, S('right3').end + 0.3, 44);
    P_('GARAGE: FRONT + BACK', '#6d4c41', tGarage - 0.15, tRolls - 0.2, 50);
    P_('RAMP OUT', GREEN, tRolls - 0.1, S('right4').end + 0.3, 56, iconCheck);
    P_('STRAIGHT THROUGH', GREEN, tDrive - 0.1, tSofa - 0.25, 54, iconCheck);
    P_('PAST THE SOFA', '#5c7cbf', tSofa - 0.25, tTVr - 0.25, 54);
    P_('PAST THE TV', '#1565c0', tTVr - 0.25, tHands - 0.4, 54);
    P_('FREE TEA', '#8e24aa', tHands - 0.2, S('right5').end + 0.3, 58, iconHeart);
    hearts(t, tCup, S('right5').end + 0.3, screen.gran);
    P_('COSIEST TUNNEL IN THE WORLD', GREEN, tCosiest - 0.2, S('right6').end + 0.4, 42, iconCheck);
  }
}
window.dbg = { hero, house, lorry, gran, LP };
start(update, hud);
