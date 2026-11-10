// Episode 42: Roundabout – a hundred sheep, and the sheepdog is in charge
// hook (old style): a roundabout, busy as always, but the traffic looks a little fluffy -> it's a hundred sheep, the sheepdog is in charge.
// wrong: squeeze in between the sheep -> the sheepdog counts: 99, 100, 101? -> you are sheep no. 101 (wool wig), round and round,
//        lap after lap, then it herds you home into the pen, with an ear tag
// right: roll down the window, count the sheep out loud (megaphone), nice and slowly -> they yawn -> by ten the whole flock
//        is asleep: one big fluffy cloud on the island -> even the sheepdog, snoring on top -> indicate, second exit, very quietly
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, iconArrow, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tRound = WT('hook1', 'roundabout'), tBusy = WT('hook1', 'Busy'), tBut = WT('hook1', 'But'), tFluffy = WT('hook1', 'fluffy');
const tIts = WT('hook2', "It's"), tHundred = WT('hook2', 'hundred'), tSheepH = WT('hook2', 'sheep'), tAndH = WT('hook2', 'And'), tDogH = WT('hook2', 'sheepdog'), tCharge = WT('hook2', 'charge'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tSqueeze = WT('wrong1', 'squeeze'), tRight1 = WT('wrong1', 'Right'), tSheepW = WT('wrong1', 'sheep');
const tBig = WT('wrong2', 'Big'), tCounts = WT('wrong2', 'counts'), t99 = WT('wrong2', 'Ninety'), t100 = WT('wrong2', 'A', 0), tA2 = WT('wrong2', 'A', 1), t101 = WT('wrong2', 'one');
const tNow = WT('wrong3', 'Now'), tNumber = WT('wrong3', 'number'), tRoundW = WT('wrong3', 'Round'), tLap = WT('wrong3', 'lap'), tThen = WT('wrong3', 'Then'), tHerds = WT('wrong3', 'herds'), tHome = WT('wrong3', 'home'), tInto = WT('wrong3', 'Into'), tPen = WT('wrong3', 'pen'), tWith = WT('wrong3', 'With'), tTag = WT('wrong3', 'tag');
const tRoll = WT('right2', 'Roll'), tCount = WT('right2', 'count'), tOut = WT('right2', 'Out'), tNice = WT('right2', 'Nice'), tSlowly = WT('right2', 'slowly');
const tOne = WT('right3', 'One'), tTwo = WT('right3', 'Two'), tThree = WT('right3', 'Three'), tThey = WT('right3', 'They'), tYawn = WT('right3', 'yawn');
const tBy = WT('right4', 'By'), tTen = WT('right4', 'ten'), tAsleep = WT('right4', 'asleep'), tOneB = WT('right4', 'One'), tCloud = WT('right4', 'cloud'), tMiddle = WT('right4', 'middle');
const tEven = WT('right5', 'Even'), tDogR = WT('right5', 'sheepdog'), tSnoring = WT('right5', 'Snoring'), tTop = WT('right5', 'top');
const tIndicate = WT('right6', 'Indicate'), tSecond = WT('right6', 'Second'), tExit = WT('right6', 'exit'), tVery = WT('right6', 'Very'), tQuietly = WT('right6', 'quietly');
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
// polyline path (dense points) with arc length
function polyPath(pts) { const P = pts.map(p => new THREE.Vector2(p[0], p[1])); const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + P[i].distanceTo(P[i - 1])); return { pts: P, cum, len: cum[cum.length - 1] }; }
function pAt(path, s) { s = clamp(s, 0, path.len); let i = 1; while (i < path.cum.length - 1 && path.cum[i] < s) i++;
  const a = path.pts[i - 1], b = path.pts[i], u = (s - path.cum[i - 1]) / Math.max(1e-6, path.cum[i] - path.cum[i - 1]);
  return { x: lerp(a.x, b.x, u), z: lerp(a.y, b.y, u), h: Math.atan2(-(b.x - a.x), -(b.y - a.y)) }; }
function pAtS(path, s) { const p = pAt(path, s), q0 = pAt(path, Math.max(0, s - 1.2)), q1 = pAt(path, Math.min(path.len, s + 1.2)); const dx = q1.x - q0.x, dz = q1.z - q0.z; if (dx * dx + dz * dz > 1e-6) p.h = Math.atan2(-dx, -dz); return p; }

// ---------------- world: country roundabout ----------------
const RI = 9.5, RO = 16.5, RC = 13.0, ISL = 9.2;          // ring inner/outer radius, car lane radius, island radius
const PEN = { x0: -42.5, x1: -27.5, z0: -22, z1: -8 };
const onRoad = (x, z) => Math.hypot(x, z) < 24 || (Math.abs(x) < 7 && Math.abs(z) < 400) || (Math.abs(z) < 7 && Math.abs(x) < 400);
makeLandscape({ avoid: (x, z) => onRoad(x, z) || (x > -62 && x < -22 && z > -40 && z < -2), fieldAvoid: (x, z, w, d) => (Math.abs(x) - w / 2 < 30 && Math.abs(z) - d / 2 < 30) || Math.abs(x) - w / 2 < 8 || Math.abs(z) - d / 2 < 8 || (x + w / 2 > -66 && x - w / 2 < -18 && z + d / 2 > -44 && z - d / 2 < 0), near: [0, 0, 160, 160], trees: 1300, seed: 421 });
{ const ring = new THREE.Mesh(new THREE.RingGeometry(RI - 0.3, RO, 128, 1), asphaltMat); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; ring.receiveShadow = true;
  const uv = ring.geometry.attributes.uv, p = ring.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 7, p.getY(i) / 7); scene.add(ring); }
plane(-3.5, 3.5, 15.5, 400, asphaltMat, 0.045, 7); plane(-3.5, 3.5, -400, -15.5, asphaltMat, 0.045, 7);
plane(15.5, 400, -3.5, 3.5, asphaltMat, 0.045, 7); plane(-400, -15.5, -3.5, 3.5, asphaltMat, 0.045, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = [];
  for (let s = 19; s < 300; s += 7) { dl.push([0, 0.07, s]); dl.push([0, 0.07, -s]); dl.push([s, 0.07, 0, Math.PI / 2]); dl.push([-s, 0.07, 0, Math.PI / 2]); }
  for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; if (k % 2) continue; dl.push([Math.cos(a) * RC * 0 + Math.cos(a) * 13, 0.07, Math.sin(a) * 13, -a, 1, 1, 0.55]); }
  instanced(g, markMat, dl, false);
  // edge lines of the ring
  for (const r of [RI - 0.1, RO - 0.35]) { const e = new THREE.Mesh(new THREE.RingGeometry(r - 0.08, r + 0.08, 128), markMat); e.rotation.x = -Math.PI / 2; e.position.y = 0.068; scene.add(e); }
  // give-way "shark teeth" at the four entries
  const tri = new THREE.Shape(); tri.moveTo(-0.3, 0); tri.lineTo(0.3, 0); tri.lineTo(0, 0.6); tri.lineTo(-0.3, 0); const tg = new THREE.ShapeGeometry(tri); tg.rotateX(-Math.PI / 2);
  const teeth = []; for (let k = 0; k < 5; k++) { const o = 0.5 + k * 0.7; teeth.push([o, 0.07, 17.0, Math.PI]); teeth.push([-o, 0.07, -17.0, 0]); teeth.push([17.0, 0.07, -o, -Math.PI / 2]); teeth.push([-17.0, 0.07, o, Math.PI / 2]); }
  instanced(tg, markMat, teeth, false); }
// island (grass + kerb) and the traffic-police podium
{ const kerbT = canvasTex(512, 32, (c, w, h) => { for (let k = 0; k < 16; k++) { c.fillStyle = k % 2 ? '#e53935' : '#f5f5f5'; c.fillRect(k * 32, 0, 32, h); } }, true); kerbT.repeat.set(6, 1);
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(ISL, ISL, 0.24, 96), [L('#fff', { map: kerbT }), L('#7cc44a'), L('#777')]); isl.position.y = 0.12; isl.receiveShadow = true; scene.add(isl);
  const fl = []; const R = rng(5); for (let k = 0; k < 160; k++) { const a = R() * Math.PI * 2, r = 7.6 + R() * 1.3; fl.push([Math.cos(a) * r, 0.3, Math.sin(a) * r, 0, 1, 1, 1]); }
  const fm = instanced(new THREE.IcosahedronGeometry(0.13, 0), L('#ffffff'), fl, false); fl.forEach((f, i) => fm.setColorAt(i, new THREE.Color(['#ffd54f', '#f06292', '#ffffff', '#ba68c8'][i % 4]))); }
const POD = V3(0, 0, 7.6), PODH = 1.0;
{ const st = canvasTex(256, 64, (c, w, h) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#e53935' : '#fafafa'; c.fillRect(k * 32, 0, 32, h); } }, true);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, PODH, 32), [STD('#fff', { map: st, roughness: 0.4 }), STD('#eceff1'), STD('#eceff1')]); p.position.set(POD.x, 0.24 + PODH / 2 - 0.24, POD.z); p.castShadow = p.receiveShadow = true; scene.add(p); }
// roundabout sign at the south entry
{ const sT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#1565c0'; c.beginPath(); c.arc(128, 128, 124, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 22; c.fillStyle = '#fff';
    for (let k = 0; k < 3; k++) { const a = k * 2.094 - 1.2; c.beginPath(); c.arc(128, 128, 62, a, a + 1.4); c.stroke(); const ea = a + 1.4; const x = 128 + Math.cos(ea) * 62, y = 128 + Math.sin(ea) * 62; c.save(); c.translate(x, y); c.rotate(ea + Math.PI / 2); c.beginPath(); c.moveTo(18, 0); c.lineTo(-14, -20); c.lineTo(-14, 20); c.fill(); c.restore(); } });
  const g = new THREE.Group(); g.position.set(-5.6, 0, 22.5); scene.add(g); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), STD('#90a4ae', { metalness: 0.6 })); pole.position.y = 1.2; g.add(pole);
  const d = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshStandardMaterial({ map: sT, roughness: 0.5 })); d.position.set(0, 2.5, 0.05); g.add(d); pole.castShadow = true; }
// farm: pen with fence + gate, straw, barn, hay bales
const gate = new THREE.Group();
{ const wood = L('#a1754b'), straw = L('#e8d48b', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let k = 0; k < 900; k++) { c.strokeStyle = `rgba(160,120,40,${0.2 + Math.random() * 0.3})`; c.lineWidth = 2; const x = Math.random() * w, y = Math.random() * h, a = Math.random() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); c.stroke(); } }, true) });
  plane(PEN.x0, PEN.x1, PEN.z0, PEN.z1, straw, 0.04, 5);
  plane(-37, -33, -8, -3.5, L('#c8b47a'), 0.035, 5);   // track from the road to the gate
  const posts = [], rails = [];
  const side = (x0, z0, x1, z1, gapA = null, gapB = null) => { const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 2.5);
    for (let k = 0; k <= n; k++) { const u = k / n, x = lerp(x0, x1, u), z = lerp(z0, z1, u); posts.push([x, 0.7, z]); }
    const seg = (a, b) => { const xa = lerp(x0, x1, a), za = lerp(z0, z1, a), xb = lerp(x0, x1, b), zb = lerp(z0, z1, b); for (const y of [0.55, 1.05]) rails.push([(xa + xb) / 2, y, (za + zb) / 2, Math.atan2(-(zb - za), xb - xa), Math.hypot(xb - xa, zb - za), 1, 1]); };
    if (gapA == null) seg(0, 1); else { seg(0, gapA); seg(gapB, 1); } };
  side(PEN.x0, PEN.z0, PEN.x1, PEN.z0); side(PEN.x0, PEN.z0, PEN.x0, PEN.z1); side(PEN.x1, PEN.z0, PEN.x1, PEN.z1);
  const gA = (-36.8 - PEN.x0) / (PEN.x1 - PEN.x0), gB = (-33.2 - PEN.x0) / (PEN.x1 - PEN.x0); side(PEN.x0, PEN.z1, PEN.x1, PEN.z1, gA, gB);
  instanced(new THREE.BoxGeometry(0.18, 1.4, 0.18), wood, posts); instanced(new THREE.BoxGeometry(1, 0.12, 0.08), wood, rails);
  // gate: hinged at x = -36.8, swings shut towards +x
  gate.position.set(-36.8, 0, PEN.z1); scene.add(gate);
  for (const y of [0.45, 0.8, 1.15]) { const b = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.13, 0.08), L('#d7b98a')); b.position.set(1.8, y, 0); b.castShadow = true; gate.add(b); }
  const dg = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.12, 0.08), L('#d7b98a')); dg.position.set(1.8, 0.8, 0); dg.rotation.z = 0.2; gate.add(dg);
  // barn
  const barn = new THREE.Group(); barn.position.set(-52, 0, -17); barn.rotation.y = Math.PI / 2; scene.add(barn);
  const bw = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 9), L('#b83a2b')); bw.position.y = 3; bw.castShadow = bw.receiveShadow = true; barn.add(bw);
  const rf = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, 12.4, 3, 1), L('#5d4037')); rf.rotation.z = Math.PI / 2; rf.rotation.x = Math.PI / 2; rf.scale.set(1, 1, 0.5); rf.position.y = 7.6; rf.castShadow = true; barn.add(rf);
  const dr = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.2, 0.1), L('#f5f5f5')); dr.position.set(0, 2.1, 4.52); barn.add(dr);
  const hb = []; for (const [x, z] of [[-25, -24], [-24, -21.5], [-45.5, -6], [-47.5, -7.5]]) hb.push([x, 0.6, z, hash(x) * 3]);
  instanced(new THREE.CylinderGeometry(0.75, 0.75, 1.2, 16).rotateZ(Math.PI / 2), L('#e3c46b'), hb); }

// ---------------- hero car + wig + megaphone + ear tag ----------------
const hero = makeCar('#1e88e5');
const wig = new THREE.Group(); hero.userData.bodyG.add(wig); wig.position.set(0, 1.62, 0.1);
{ const wm = STD('#f6f1e7', { roughness: 0.95 }); const R = rng(9);
  for (let k = 0; k < 11; k++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32 + R() * 0.12, 1), wm); m.position.set((R() - 0.5) * 1.1, 0.08 + R() * 0.18, (R() - 0.5) * 1.2); m.castShadow = true; wig.add(m); }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), STD('#3a3330')); e.scale.set(1, 0.35, 0.6); e.position.set(s * 0.72, 0.25, -0.35); e.rotation.z = s * 0.5; wig.add(e); } }
const mega = new THREE.Group(); hero.userData.bodyG.add(mega); mega.position.set(-0.98, 1.22, -0.4);
{ const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.06, 0.55, 20, 1, true), STD('#ff7043', { side: THREE.DoubleSide, roughness: 0.4 })); cone.rotation.x = -Math.PI / 2; cone.position.z = -0.3; mega.add(cone);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 24), STD('#fafafa')); rim.position.z = -0.57; mega.add(rim);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), STD('#f1c27d')); hand.position.set(0, -0.08, -0.05); mega.add(hand);
  const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), STD('#43a047')); sl.rotation.z = Math.PI / 2; sl.position.set(0.25, -0.08, -0.02); mega.add(sl);
  mega.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const tag = new THREE.Group(); hero.userData.bodyG.add(tag); tag.position.set(-1.2, 0.98, -0.72);
{ const tT = canvasTex(256, 288, (c, w, h) => { c.fillStyle = '#ffd60a'; c.beginPath(); c.roundRect(10, 30, w - 20, h - 40, 40); c.fill(); c.fillStyle = '#c79a00'; c.beginPath(); c.arc(w / 2, 62, 18, 0, 7); c.fill();
    c.fillStyle = '#111'; c.font = '900 108px Inter'; c.textAlign = 'center'; c.fillText('101', w / 2, 210); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.56), new THREE.MeshStandardMaterial({ map: tT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.5 })); m.rotation.y = -Math.PI / 2; m.position.y = -0.26; m.castShadow = true; tag.add(m); }

// ---------------- sheep (instanced) ----------------
const NSH = 100;
const wool = STD('#f6f1e7', { roughness: 0.95 }), face = STD('#3a3330', { roughness: 0.7 });
const PARTS = [];   // {mesh, items:[{m: Matrix4 local, grp:'body'|'head'|'leg', k, kind}]}
function part(geo, mat, items) { const mesh = new THREE.InstancedMesh(geo, mat, NSH * items.length); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; scene.add(mesh); PARTS.push({ mesh, items }); return mesh; }
const LM = (x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V3(sx, sy, sz));
const NECK = V3(0, 0.83, -0.45); const DROP = new THREE.Matrix4().makeTranslation(0, -0.12, 0);
part(new THREE.IcosahedronGeometry(1, 2), wool, [{ m: LM(0, 0.8, 0.05, 0.5, 0.44, 0.66), grp: 'body' }]);
part(new THREE.IcosahedronGeometry(1, 1), wool, [[-0.2, 1.12, -0.2], [0.2, 1.12, -0.15], [0, 1.18, 0.15], [-0.18, 1.08, 0.38], [0.2, 1.1, 0.35], [0.38, 0.85, 0.1], [-0.38, 0.85, 0.05]].map(p => ({ m: LM(p[0], p[1], p[2], 0.24, 0.22, 0.24), grp: 'body' })));
part(new THREE.SphereGeometry(1, 16, 12), face, [{ m: LM(0, 0.95, -0.66, 0.2, 0.22, 0.28), grp: 'head' }]);
part(new THREE.IcosahedronGeometry(1, 1), wool, [{ m: LM(0, 1.15, -0.6, 0.17, 0.12, 0.15), grp: 'head' }]);
part(new THREE.SphereGeometry(1, 10, 8), face, [-1, 1].map(s => ({ m: LM(s * 0.25, 1.03, -0.58, 0.14, 0.05, 0.08, 0, 0, s * 0.4), grp: 'head' })));
const eyeW = part(new THREE.SphereGeometry(0.065, 12, 10), STD('#ffffff', { roughness: 0.3 }), [-1, 1].map(s => ({ m: LM(s * 0.11, 1.02, -0.84), grp: 'head', kind: 'eye' })));
part(new THREE.SphereGeometry(0.036, 10, 8), STD('#111', { roughness: 0.2 }), [-1, 1].map(s => ({ m: LM(s * 0.115, 1.02, -0.895), grp: 'head', kind: 'pupil' })));
part(new THREE.SphereGeometry(0.08, 12, 8), STD('#6d1b1b'), [{ m: LM(0, 0.86, -0.9), grp: 'head', kind: 'mouth' }]);
part(new THREE.CylinderGeometry(0.055, 0.045, 0.56, 8), face, [[-0.2, -0.36], [0.2, -0.36], [-0.2, 0.42], [0.2, 0.42]].map((p, k) => ({ m: LM(p[0], 0.28, p[1]), grp: 'leg', k })));
// layout in the co-rotating ring frame (a hole where the car squeezes in)
const A_CAR = 1.15 + 0.2 * (WT('wrong1', 'squeeze') + 1.3);
const SH = []; { const R = rng(4207);
  while (SH.length < NSH) { const a = R() * Math.PI * 2, r = 10.2 + R() * 5.7; const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (SH.some(s => Math.hypot(s.x - x, s.z - z) < 1.35)) continue;
    let da = a - A_CAR; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da * RC) < 3.4 && Math.abs(r - RC) < 1.9) continue;
    SH.push({ a, r, x, z, s: 0.92 + R() * 0.2, ph: R() * 6.28, i: SH.length }); } }
// ring rotation: wrong (with time-lapse laps) / right (slows down to a stop for counting)
const W0 = 0.2;
const extraW = mono([[0, 0], [tRoundW - 0.1, 0], [tLap + 0.5, 0.9 * Math.PI * 2], [tThen, 1.5 * Math.PI * 2], [99, 1.5 * Math.PI * 2]]);
const angW = t => W0 * t + extraW(t);
const angR = mono([[0, 0], [tOne - 0.3, W0 * (tOne - 0.3)], [tYawn + 0.2, W0 * (tOne - 0.3) + W0 * 0.5 * (tYawn + 0.5 - tOne)], [99, W0 * (tOne - 0.3) + W0 * 0.5 * (tYawn + 0.5 - tOne)]]);
// car lane angle: car sits in the hole (a = 0) once merged
const carAng = t => A_CAR - (isRight(t) ? angR(t) : angW(t));
const T_M0 = tSqueeze - 0.45, T_M1 = tSqueeze + 1.3;
// mound slots on the island (one big fluffy cloud)
const MC = V3(0, 0, -1.0); const SLOTS = [];
for (const [r, y, n] of [[6.4, 0, 33], [5.15, 0.62, 27], [3.95, 1.2, 20], [2.75, 1.75, 13], [1.55, 2.25, 6], [0.3, 2.65, 1]]) for (let k = 0; k < n; k++) { const a = (k + (y * 3) % 1) / n * Math.PI * 2; SLOTS.push({ x: MC.x + Math.cos(a) * r, z: MC.z + Math.sin(a) * r, y, a }); }
{ // assign: outer slots first, nearest free sheep by angle at rest
  const restA = SH.map(s => Math.atan2(Math.sin(s.a - angR(60)), Math.cos(s.a - angR(60))));
  const free = new Set(SH.map((s, i) => i)); let order = 0;
  for (const sl of SLOTS) { if (!free.size) break; let best = -1, bd = 1e9; for (const i of free) { const p = V3(Math.cos(restA[i]) * SH[i].r, 0, Math.sin(restA[i]) * SH[i].r); const d = Math.hypot(p.x - sl.x, p.z - sl.z); if (d < bd) { bd = d; best = i; } }
    free.delete(best); SH[best].slot = sl; SH[best].ord = order++; } }
// herding (wrong): queue along the road into the pen, the car is the very last one
const HP = polyPath([[-14, -1.6], [-24, -1.6], [-30, -1.6], [-33.5, -2.2], [-35, -4.5], [-35, -8], [-35, -15]]);
const HT0 = tThen - 0.2;
const HS = mono([[HT0, 50], [tInto - 0.15, 60], [tPen + 0.35, 67.0], [tPen + 1.0, 67.6], [99, 67.6]]);
const PSL = []; for (let ix = 0; ix < 11; ix++) for (let iz = 0; iz < 11; iz++) { const x = PEN.x0 + 0.9 + ix * 1.32, z = PEN.z0 + 0.9 + iz * 1.2; if (Math.abs(x + 35) < 1.5 && Math.abs(z + 15) < 2.8) continue; if (x < -36.0 && x > -40.5 && z < -15.4 && z > -20.5) continue; PSL.push([x, z]); }
PSL.sort((a, b) => Math.hypot(a[0] + 35, a[1] + 9) - Math.hypot(b[0] + 35, b[1] + 9)).reverse();
const CAR_S = 67.6 - 0;   // car settles at the path end (pen centre)

const _M = new THREE.Matrix4(), _T = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _E = new THREE.Euler();
function sheepState(i, t) {
  const sh = SH[i]; const right = isRight(t); let x, z, h, y = 0, legA = 0, pitch = 0, yawn = 0, sleep = 0, lie = 0, hop = 0;
  if (!right && t >= HT0) {   // herding into the pen
    const row = Math.floor(sh.i / 4), lat = (sh.i % 4 - 1.5) * 1.15; const s = HS(t) - 2 - row * 1.25;
    if (s < HP.len) { const p = pAt(HP, s); x = p.x + Math.cos(p.h) * lat; z = p.z - Math.sin(p.h) * lat; h = p.h; legA = 0.7 * Math.sin(t * 16 + sh.ph); y = 0.12 * Math.abs(Math.sin(t * 8 + sh.ph)); }
    else { const sl = PSL[sh.i % PSL.length]; const u = ease(clamp((s - HP.len) / 6)); const p = pAt(HP, HP.len); x = lerp(p.x, sl[0], u); z = lerp(p.z, sl[1], u); h = lerp(Math.PI, hash(i) * 6.28, u); legA = 0.6 * Math.sin(t * 14 + sh.ph) * (1 - u); }
    return { x, z, h, y, legA, pitch: 0.15 * Math.sin(t * 2 + sh.ph), yawn: 0, sleep: 0, lie: 0, s: sh.s };
  }
  const ang = right ? angR(t) : angW(t); const th = sh.a - ang; const moving = right ? 1 - ramp(t, tYawn - 0.6, tYawn + 0.3) : 1;
  x = Math.cos(th) * sh.r; z = Math.sin(th) * sh.r; h = -th; legA = 0.55 * Math.sin(t * 9 + sh.ph) * moving; y = 0.05 * Math.abs(Math.sin(t * 9 + sh.ph)) * moving;
  pitch = 0.12 * Math.sin(t * 1.7 + sh.ph);
  if (right) { yawn = Math.max(0, Math.sin(Math.PI * clamp((t - tThey - 0.1 - hash(i + 3) * 0.6) / 1.2))) * (t < tTen ? 1 : 0); pitch += 0.75 * yawn;
    const tg = tTen - 0.35 + sh.ord * 0.024, u = clamp((t - tg) / 1.15);
    if (u > 0 && sh.slot) { const sl = sh.slot; const e = ease(u); const dx = sl.x - x, dz = sl.z - z; x += dx * e; z += dz * e; y = sl.y * e + 1.4 * Math.sin(Math.PI * u) + (sl.y > 0 ? 0 : 0);
      h = u < 0.85 ? Math.atan2(-dx, -dz) : lerp(Math.atan2(-dx, -dz), sl.a + Math.PI / 2 + Math.PI, ease((u - 0.85) / 0.15)); legA = 0.5 * Math.sin(t * 14 + sh.ph) * (1 - e);
      lie = ramp(t, tg + 1.05, tg + 1.5); sleep = ramp(t, tg + 1.2, tg + 1.6); pitch = lerp(pitch, -0.35, lie); hop = u; }
  }
  return { x, z, h, y, legA, pitch, yawn, sleep, lie, s: sh.s };
}
function updateSheep(t) {
  const cnt = PARTS.map(() => 0);
  for (let i = 0; i < NSH; i++) {
    const st = sheepState(i, t); const sc = st.s;
    _E.set(0, st.h, 0); _Q.setFromEuler(_E); _M.compose(V3(st.x, st.y + (isRight(t) && st.lie > 0 ? -0.22 * st.lie : 0) + (Math.hypot(st.x, st.z) < ISL ? 0.24 : 0), st.z), _Q, V3(sc, sc, sc));
    const Hm = _M.clone().multiply(new THREE.Matrix4().makeTranslation(NECK.x, NECK.y, NECK.z)).multiply(new THREE.Matrix4().makeRotationX(st.pitch)).multiply(new THREE.Matrix4().makeTranslation(-NECK.x, -NECK.y, -NECK.z));
    PARTS.forEach((P, pi) => { for (const it of P.items) {
      let m;
      if (it.grp === 'body') m = _M.clone().multiply(DROP).multiply(it.m);
      else if (it.grp === 'head') { let L2 = it.m; if (it.kind === 'eye') L2 = it.m.clone().multiply(new THREE.Matrix4().makeScale(1, lerp(1, 0.18, Math.max(st.sleep, 0.75 * st.yawn)), 1));
        if (it.kind === 'pupil') L2 = it.m.clone().multiply(new THREE.Matrix4().makeScale(1 - st.sleep, 1 - st.sleep, 1 - st.sleep));
        if (it.kind === 'mouth') L2 = it.m.clone().multiply(new THREE.Matrix4().makeScale(1.4 * st.yawn + 0.001, 2.2 * st.yawn + 0.001, 0.7 * st.yawn + 0.001));
        m = Hm.clone().multiply(DROP).multiply(L2); }
      else { const sw = (it.k % 3 === 0 ? 1 : -1) * st.legA; m = _M.clone().multiply(new THREE.Matrix4().makeTranslation(it.m.elements[12], 0.44, it.m.elements[14])).multiply(new THREE.Matrix4().makeRotationX(sw)).multiply(new THREE.Matrix4().makeScale(1, 0.78 * lerp(1, 0.25, st.lie), 1)).multiply(new THREE.Matrix4().makeTranslation(0, -0.28, 0)); }
      P.mesh.setMatrixAt(cnt[pi]++, m); } });
  }
  PARTS.forEach(P => { P.mesh.instanceMatrix.needsUpdate = true; });
}

// ---------------- the sheepdog (border collie, hi-vis vest, police cap, whistle) ----------------
const dog = new THREE.Group(); scene.add(dog); const DS = 1.55; dog.scale.setScalar(DS);
const D = {};
{ const blk = STD('#1d1b1a', { roughness: 0.75 }), wht = STD('#f5f2ea', { roughness: 0.8 });
  const piv = new THREE.Group(); piv.position.y = 0.3; dog.add(piv); D.piv = piv;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.42, 6, 16), blk); torso.position.y = 0.42; piv.add(torso);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), wht); chest.scale.set(1, 1.35, 0.6); chest.position.set(0, 0.58, -0.17); piv.add(chest);
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.29, 0.36, 24, 1, true), STD('#ff6d00', { roughness: 0.5, emissive: '#ff3d00', emissiveIntensity: 0.15, side: THREE.DoubleSide })); vest.position.y = 0.4; piv.add(vest);
  const strip = new THREE.Mesh(new THREE.CylinderGeometry(0.292, 0.297, 0.07, 24, 1, true), STD('#e0e0e0', { metalness: 0.7, roughness: 0.25, side: THREE.DoubleSide })); strip.position.y = 0.4; piv.add(strip);
  const head = new THREE.Group(); head.position.set(0, 0.92, -0.02); piv.add(head); D.head = head;
  const sk = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), blk); head.add(sk);
  const blaze = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), wht); blaze.scale.set(0.06, 0.17, 0.05); blaze.position.set(0, 0.06, -0.2); head.add(blaze);
  const mz = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), wht); mz.scale.set(1, 0.78, 1.35); mz.position.set(0, -0.07, -0.22); head.add(mz);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), STD('#111', { roughness: 0.2 })); nose.position.set(0, -0.03, -0.39); head.add(nose);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), STD('#7b1f1f')); mouth.position.set(0, -0.14, -0.3); head.add(mouth); D.mouth = mouth;
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6), STD('#f06292')); tongue.scale.set(1, 0.4, 1.4); tongue.position.set(0, -0.17, -0.33); head.add(tongue); D.tongue = tongue;
  D.eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.1, 0.06, -0.19); head.add(e); const w = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), STD('#fff', { roughness: 0.25 })); e.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), STD('#3e2723', { roughness: 0.2 })); p.position.z = -0.045; e.add(p); const hl = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(0.015, 0.015, -0.08); e.add(hl); return { e, w, p, hl }; });
  D.ears = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.16, 0.17, 0.0); head.add(g); const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 10), blk); ear.scale.z = 0.45; ear.position.y = 0.1; g.add(ear); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 8), wht); tip.position.y = 0.2; tip.rotation.x = 0.9; tip.position.z = -0.04; g.add(tip); g.rotation.z = -s * 0.35; return g; });
  const cap = new THREE.Group(); cap.position.set(0, 0.2, 0.02); cap.rotation.x = -0.12; head.add(cap); D.cap = cap;
  const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.12, 24), STD('#1a237e', { roughness: 0.5 })); cb.position.y = 0.04; cap.add(cb);
  const ct = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.06, 24), STD('#1a237e', { roughness: 0.5 })); ct.position.y = 0.12; cap.add(ct);
  const vis = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 20, 1, false, -Math.PI / 2 - 1.1, 2.2), STD('#111', { roughness: 0.3 })); vis.position.set(0, -0.01, -0.06); cap.add(vis);
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), STD('#ffd60a', { metalness: 0.6, roughness: 0.3 })); badge.position.set(0, 0.06, -0.196); cap.add(badge);
  const whistle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 10), STD('#cfd8dc', { metalness: 0.9, roughness: 0.2 })); whistle.rotation.x = Math.PI / 2 - 0.3; whistle.position.set(0.07, -0.13, -0.38); head.add(whistle); D.whistle = whistle;
  D.arms = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.22, 0.72, -0.06); piv.add(g); const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.34, 4, 8), s > 0 ? blk : wht); a.position.y = -0.24; g.add(a); const paw = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), wht); paw.position.y = -0.46; g.add(paw); return g; });
  D.legs = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.2, 0.3, 0.05); dog.add(g); const th = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), blk); th.scale.set(0.8, 1, 1.3); th.position.y = -0.12; g.add(th); const ft = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), wht); ft.scale.set(1, 0.7, 1.5); ft.position.set(0, -0.26, -0.18); g.add(ft); return g; });
  const tail = new THREE.Group(); tail.position.set(0, 0.12, 0.25); dog.add(tail); D.tail = tail;
  for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.075 - k * 0.004, 10, 8), k > 3 ? wht : blk); m.position.set(0, 0.03 * k * k * 0.3, 0.09 * k); tail.add(m); }
  const bub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 12), new THREE.MeshStandardMaterial({ color: '#cfefff', transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1 })); bub.position.set(0.05, -0.03, -0.45); head.add(bub); D.bub = bub;
  dog.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); }
const DOG_SIT = V3(POD.x, PODH, POD.z), DOG_TOP = V3(MC.x, 2.65 + 0.85, MC.z);
function dogPose(t) {
  const right = isRight(t); let pos = DOG_SIT.clone(), yaw = Math.PI, mode = 'sit', armR = 0, armL = 0, headYaw = 0, headTilt = 0, yawn = 0, sleep = 0, wide = 0, run = 0;
  if (!right) {
    // directing traffic: right paw waving up, left paw out
    armR = 2.4 + 0.35 * Math.sin(t * 5); armL = 0.6 + 0.2 * Math.sin(t * 2.5);
    if (t > tCounts - 0.2 && t < tNow) { armR = lerp(armR, 1.4 + 0.25 * Math.sin(t * 9), ramp(t, tCounts - 0.2, tCounts + 0.2)); headYaw = 0.55 * Math.sin((t - tCounts) * 2.2) * (1 - ramp(t, tA2 - 0.3, tA2)); }
    if (t > t101 - 0.2 && t < tNow + 0.3) { headTilt = 0.4 * ramp(t, t101 - 0.2, t101 + 0.2); wide = ramp(t, t101 - 0.2, t101 + 0.1); }
    // looks + points at the car ("you're sheep number 101")
    const look = ramp(t, tA2 - 0.3, tA2 + 0.2) * (1 - ramp(t, tRoundW, tRoundW + 0.4));
    if (look > 0) { const c = carPos(t); const a = Math.atan2(-(c.x - pos.x), -(c.z - pos.z)); yaw = lerp(Math.PI, a, look * 0.7); headYaw += (a - yaw) * look * 0.6; armR = lerp(armR, Math.PI / 2 + 0.1, ramp(t, tNow - 0.2, tNow + 0.2) * look); }
    if (t >= HT0) { run = 1; const s = Math.min(HS(t) - 2 - 26 * 1.25 - 4.6, 23.0); const p = pAtS(HP, s); pos.set(p.x, 0, p.z); yaw = p.h; mode = s >= 22.95 ? 'sit' : 'run';
      if (mode === 'sit') { run = 0; yaw = Math.PI * 1.0 + 0.0; armR = 2.3 + 0.4 * Math.sin(t * 6); armL = 0.3; } }
  } else {
    armR = 2.4 + 0.35 * Math.sin(t * 5); armL = 0.6 + 0.2 * Math.sin(t * 2.5);
    const calm = ramp(t, tOne, tThey); armR = lerp(armR, 0.3, calm); armL = lerp(armL, 0.2, calm); headYaw = 0.25 * Math.sin(t * 1.3) * (1 - calm);
    yawn = Math.max(win(t, tThey + 0.3, tYawn + 0.9, 0.3) * 0.6, win(t, tEven - 0.05, tDogR + 0.75, 0.25));
    const hop = clamp((t - (tSnoring - 0.45)) / 0.75);
    if (hop > 0) { const e = ease(hop); pos.lerpVectors(DOG_SIT, DOG_TOP, e); pos.y += 1.6 * Math.sin(Math.PI * hop); yaw = Math.PI + 0.25 * e; mode = hop >= 1 ? 'lie' : 'sit'; }
    sleep = ramp(t, tSnoring + 0.1, tSnoring + 0.4);
  }
  return { pos, yaw, mode, armR, armL, headYaw, headTilt, yawn, sleep, wide, run };
}
function updateDog(t) {
  const P = dogPose(t); dog.position.copy(P.pos); dog.rotation.set(0, P.yaw, 0);
  let pv = 0, hx = 0, aR = P.armR, aL = P.armL, armRx = 0, armLx = 0, legX = 0;
  if (P.mode === 'run') { pv = -1.0; hx = 0.85; const sw = Math.sin(t * 17); armRx = 1.25 + 0.7 * sw; armLx = 1.25 - 0.7 * sw; aR = 0; aL = 0; legX = 0.8 * sw; dog.position.y += 0.12 * Math.abs(Math.sin(t * 17)); }
  if (P.mode === 'lie') { pv = 0.12; hx = 0.45 + 0.06 * Math.sin((t - tSnoring) * 3.2); aR = 0.15; aL = 0.15; armRx = -0.2; armLx = -0.2; }
  D.piv.rotation.set(pv, 0, 0); D.head.rotation.set(hx - 0.25 * P.yawn + (P.mode === 'lie' ? 0.15 : 0), P.headYaw, P.headTilt, 'YXZ');
  D.arms[1].rotation.set(armRx, 0, aR); D.arms[0].rotation.set(armLx, 0, -aL);
  D.legs.forEach((g, k) => { g.rotation.x = (k ? 1 : -1) * legX * (P.mode === 'run' ? 1 : 0); });
  D.tail.rotation.set(P.mode === 'run' ? 0.5 : -0.4, 0.6 * Math.sin(t * (P.sleep > 0.5 ? 1 : 9)), 0);
  D.mouth.scale.set(1, 0.2 + 1.6 * P.yawn, 1); D.tongue.visible = P.yawn > 0.3 || P.mode === 'run';
  D.whistle.visible = P.yawn < 0.2 && P.sleep < 0.5 && P.mode !== 'run';
  D.eyes.forEach(E => { E.w.scale.set(1, lerp(1, 0.15, Math.max(P.sleep, P.yawn * 0.7)), 1); E.p.visible = E.hl.visible = P.sleep < 0.5 && P.yawn < 0.6; E.e.scale.setScalar(1 + 0.3 * P.wide); });
  D.ears.forEach((g, k) => { g.rotation.x = 0.25 * Math.sin(t * 3 + k) * (1 - P.sleep); });
  const sb = P.sleep > 0.5 ? 0.4 + 1.1 * (0.5 + 0.5 * Math.sin((t - tSnoring) * 3.2)) : 0; D.bub.visible = sb > 0.05; D.bub.scale.setScalar(Math.max(0.01, sb));
}

// ---------------- hero car motion ----------------
const carZ = mono([[0, 62], [4.2, 26], [6.6, 19.2], [7.2, 19.0], [99, 19.0]]);
const RP = polyPath((() => { const p = [[1.75, 19.0], [1.8, 16.8], [2.6, 14.6]]; const a0 = 1.25, a1 = -1.25;
  for (let k = 0; k <= 60; k++) { const a = lerp(a0, a1, k / 60); p.push([Math.cos(a) * RC, Math.sin(a) * RC]); }
  p.push([2.6, -14.6]); p.push([1.8, -16.8]); p.push([1.75, -19]); p.push([1.75, -80]); return p; })());
const RS = mono([[0, 0], [tSecond - 0.25, 0], [tSecond + 0.6, 1.2], [tQuietly + 0.4, 9.5], [S('right7').start + 1.0, 21], [TOTAL, 21 + 3.6 * (TOTAL - S('right7').start - 1)]]);
function carPos(t) {
  if (isRight(t)) { const p = pAtS(RP, RS(t)); return { x: p.x, z: p.z, h: p.h }; }
  if (t >= HT0) { const s = Math.min(HS(t) - 2 - 26 * 1.25, HP.len); const p = pAtS(HP, s); return { x: p.x, z: p.z, h: p.h }; }
  if (t < T_M0) return { x: 1.75, z: carZ(t), h: 0 };
  const th1 = carAng(T_M1); const P3 = V3(Math.cos(th1) * RC, 0, Math.sin(th1) * RC);
  if (t < T_M1) { const u = ease((t - T_M0) / (T_M1 - T_M0)); const P0 = V3(1.75, 0, 19), P1 = V3(1.75, 0, 15.5), tg = V3(Math.sin(th1), 0, -Math.cos(th1)), P2 = P3.clone().addScaledVector(tg, -3.5);
    const B = s => { const v = 1 - s; return V3(0, 0, 0).addScaledVector(P0, v * v * v).addScaledVector(P1, 3 * v * v * s).addScaledVector(P2, 3 * v * s * s).addScaledVector(P3, s * s * s); };
    const p = B(u), q = B(Math.min(1, u + 0.01)), q0 = B(Math.max(0, u - 0.01)); return { x: p.x, z: p.z, h: Math.atan2(-(q.x - q0.x), -(q.z - q0.z)) }; }
  const th = carAng(t); return { x: Math.cos(th) * RC, z: Math.sin(th) * RC, h: -th };
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const CarCam = (off, look, fov = 40, rad = false) => t => { const c = carPos(t); let o = V3(...off);
  if (rad) { const r = V3(c.x, 0, c.z).normalize(), tn = V3(-Math.sin(c.h), 0, -Math.cos(c.h)); o = r.clone().multiplyScalar(off[0]).add(V3(0, off[1], 0)).addScaledVector(tn, off[2]); }
  return [V3(c.x, 0, c.z).add(o), V3(c.x + look[0], look[1], c.z + look[2]), fov]; };
const LookCar = (p, fov = 40, dy = 1.0) => t => { const c = carPos(t); return [V3(...p), V3(c.x, dy, c.z), fov]; };
let YK = -1;
const YawnCam = (push) => t => { if (YK < 0) { let bd = 1e9; for (let i = 0; i < NSH; i++) { const st = sheepState(i, tYawn + 0.3); const d = Math.hypot(st.x - 10.5, st.z - 8.5); if (d < bd) { bd = d; YK = i; } } }
  const st = sheepState(YK, Math.min(t, tTen - 0.4)); const f = V3(-Math.sin(st.h), 0, -Math.cos(st.h)); const sd = V3(f.z, 0, -f.x); const hd = V3(st.x, 0.95, st.z).addScaledVector(f, 0.6);
  return [hd.clone().addScaledVector(f, 7.5 - push).addScaledVector(sd, 1.2).add(V3(0, 1.7, 0)), hd, 20]; };
const camKeys = [
  [0.0, Ac([34, 60, 78], [0, 0, 0])],
  [tBut - 0.25, Ac([26, 44, 60], [0, 0, 2])],
  ...cut(tBut - 0.2, Ac([20.5, 1.7, 9.0], [11.5, 0.9, 3.0], 34)),
  [tIts - 0.25, Ac([20.0, 1.8, 7.5], [11.5, 0.9, 1.5], 34)],
  ...cut(tIts - 0.2, Ac([7, 13, 42], [0, 0, 6])),
  [tAndH - 0.25, Ac([6, 12, 38], [0, 0, 6])],
  ...cut(tAndH - 0.2, Ac([1.4, 3.1, 13.6], [0, 2.3, 7.6], 38)),
  [tWhat - 0.3, Ac([1.2, 3.0, 13.0], [0, 2.3, 7.6], 38)],
  ...cut(tWhat - 0.25, Ac([3.4, 3.4, 28.5], [0.5, 1.0, 10])),
  [S('wrong1').start - 0.2, Ac([3.4, 3.5, 28.0], [0.5, 1.0, 10])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([7.5, 6.5, 30], [1.5, 0.5, 14])),
  [tSqueeze - 0.3, Ac([7.5, 6.5, 30], [1.5, 0.5, 14])],
  [tSheepW + 0.3, LookCar([12, 8.5, 29], 40, 0.6)],
  ...cut(tBig - 0.15, Ac([1.9, 3.4, 11.5], [0, 2.75, 7.6], 42)),
  [tA2 - 0.35, Ac([1.7, 3.4, 11.4], [0, 2.75, 7.6], 42)],
  ...cut(tA2 - 0.3, t => { const c = carPos(t); const d = V3(c.x - POD.x, 0, c.z - POD.z).normalize(); return [V3(POD.x - d.x * 4.6 - d.z * 1.4, 4.5, POD.z - d.z * 4.6 + d.x * 1.4), V3(c.x, 1.0, c.z), 36]; }),
  [tNow - 0.2, t => { const c = carPos(t); const d = V3(c.x - POD.x, 0, c.z - POD.z).normalize(); return [V3(POD.x - d.x * 4.6 - d.z * 1.4, 4.5, POD.z - d.z * 4.6 + d.x * 1.4), V3(c.x, 1.0, c.z), 36]; }],
  ...cut(tNow - 0.15, CarCam([6.5, 3.4, -2.5], [0, 1.4, 0], 40, true)),
  [tRoundW - 0.25, CarCam([6.5, 3.4, -2.5], [0, 1.4, 0], 40, true)],
  ...cut(tRoundW - 0.2, Ac([0.5, 88, 6], [0, 0, 0], 40)),
  [tThen - 0.25, Ac([0.5, 84, 6], [0, 0, 0], 40)],
  ...cut(tThen - 0.2, Ac([-19, 10, 11], [-32, 0.5, -4.5], 40)),
  [tWith - 0.3, Ac([-22, 11.5, 8], [-34, 0.5, -9], 40)],
  ...cut(tWith - 0.25, Ac([-39.0, 2.5, -18.4], [-35.8, 1.25, -15.6], 38)),
  [tRew0, Ac([-39.3, 2.6, -18.8], [-35.8, 1.25, -15.6], 38)],
  // right
  ...cut(tRew1, Ac([4.0, 4.0, 29], [0.5, 1.0, 10])),
  [tRoll - 0.25, Ac([3.8, 3.8, 28], [0.5, 1.0, 10])],
  ...cut(tRoll - 0.2, Ac([-4.0, 2.2, 23.6], [0.6, 1.25, 18.0], 36)),
  [tOne - 0.3, Ac([-4.2, 2.2, 24.0], [0.6, 1.25, 18.0], 36)],
  ...cut(tOne - 0.25, Ac([-1.2, 3.4, 26.5], [3.0, 0.8, 12.0], 38)),
  [tThey - 0.25, Ac([-1.0, 3.3, 26.0], [3.0, 0.8, 12.0], 38)],
  ...cut(tThey - 0.2, YawnCam(0)),
  [tBy - 0.25, YawnCam(0.4)],
  ...cut(tBy - 0.2, Ac([0, 22, 38], [0, 0, 1])),
  [tOneB - 0.2, Ac([0, 20, 35], [0, 0.5, 0])],
  [S('right4').end + 0.2, Ac([2, 16, 30], [0, 1.0, 0])],
  ...cut(tEven - 0.2, Ac([1.4, 3.4, 13.6], [0, 2.4, 7.0], 40)),
  [tSnoring - 0.5, Ac([1.6, 3.6, 13.8], [0, 2.6, 6.5], 40)],
  [tSnoring + 0.5, Ac([2.4, 6.2, 8.4], [0, 4.6, -1.0], 38)],
  [S('right5').end + 0.3, Ac([2.2, 6.0, 7.6], [0, 4.6, -1.0], 38)],
  ...cut(tIndicate - 0.2, Ac([6.8, 2.3, 14.6], [1.75, 0.9, 18.6], 36)),
  [tSecond - 0.3, Ac([7.0, 2.4, 14.4], [1.75, 0.9, 18.6], 36)],
  ...cut(tSecond - 0.25, Ac([12, 18, 34], [0, 1, 2])),
  [S('right7').start, Ac([10, 20, 32], [0, 1, -2])],
  [S('outro').start, Ac([6, 26, 34], [0, 1, -3])],
  [TOTAL, Ac([4, 34, 40], [0, 1, -4])],
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
  const c = carPos(t); const tip = right && t > tSecond - 0.3 && t < S('outro').start ? 0.06 * Math.abs(Math.sin(t * 7)) : 0;
  if (!right && t >= HT0) hero.userData.prev = null;
  placeCar(hero, { x: c.x, z: c.z, h: c.h, y: tip });
  blink(hero, t, false, right && t > tIndicate - 0.1 && t < tQuietly + 1.2);
  const wg = !right ? back(clamp((t - tNumber + 0.1) / 0.35)) : 0; wig.visible = wg > 0.01; wig.scale.setScalar(Math.max(0.01, wg)); wig.rotation.z = 0.08 * Math.sin(t * 6) * (t > tRoundW && t < tThen ? 1 : 0.2);
  const mg = right ? back(clamp((t - tCount + 0.25) / 0.35)) * (1 - ramp(t, tTen + 0.5, tTen + 1.0)) : 0; mega.visible = mg > 0.01; mega.scale.setScalar(Math.max(0.01, mg)); mega.rotation.set(0, 0.35 + 0.08 * Math.sin(t * 2), 0.06 * Math.sin(t * 9) * win(t, tOne, tYawn, 0.1));
  const tg = !right ? back(clamp((t - tTag + 0.15) / 0.3)) : 0; tag.visible = tg > 0.01; tag.scale.setScalar(Math.max(0.01, tg)); tag.rotation.x = 0.25 * Math.sin((t - tTag) * 6) * Math.exp(-Math.max(0, t - tTag) * 1.5);
  gate.rotation.y = !right ? lerp(-1.75, 0, ease(clamp((t - tPen + 0.05) / 0.5))) : -1.75;
  updateSheep(t); updateDog(t);
  const cc = cam(t); camera.fov = cc.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shake = !right ? win(t, tTag - 0.05, tTag + 0.25, 0.05) * 0.5 : 0;
  applyCam(cc, t, shake > 0.02 ? 0.05 * shake : 0);
  camera.updateMatrixWorld(true); hero.updateMatrixWorld(true); dog.updateMatrixWorld(true);
  screen = { dog: project(D.head.localToWorld(V3(0, 0.45, 0))), car: project(hero.localToWorld(V3(0, 2.0, 0))), mega: project(mega.localToWorld(V3(0, 0, -0.6))) };
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
function zzz(t, a, b, p, big = 1) { if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, -40);
  for (let i = 0; i < 3; i++) { const u = ((t - a) * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = win(t, a, b, 0.3) * Math.sin(Math.PI * u); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1a237e'; ctx.lineWidth = 8; ctx.font = `900 ${(50 + 30 * u) * big}px Inter`; ctx.textAlign = 'center';
    ctx.strokeText('Z', x + 110 + u * 90 + i * 8, y - u * 160); ctx.fillText('Z', x + 110 + u * 90 + i * 8, y - u * 160); ctx.restore(); } }
function counter(n, t, a, b, col = '#0d47a1', y = 1480) { if (t < a || t > b) return; const f = win(t, a, b, 0.12), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, y); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(12,14,20,0.88)'; rr(-210, -95, 420, 190, 30); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = YEL; ctx.font = '900 36px Inter'; ctx.fillText('SHEEP COUNT', 0, -52); ctx.fillStyle = col; ctx.font = '900 104px Inter'; ctx.fillText(n, 0, 28); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('ROUNDABOUT', '#1565c0', tRound - 0.1, tBut - 0.15, 56);
    P_('TRAFFIC: FLUFFY?', '#455a64', tBut + 0.2, tIts - 0.15, 54);
    P_('TRAFFIC: 100 SHEEP', '#6d4c41', tHundred - 0.1, tAndH - 0.15, 54);
    P_('IN CHARGE: SHEEPDOG', '#e65100', tDogH - 0.15, S('hook2').end + 0.3, 52);
    bubble('*WHISTLE*', screen.dog, t, tDogH + 0.2, tWhat - 0.2, 50, '#fff', '#1a237e', -90);
    P_('SQUEEZE IN', RED, tSqueeze - 0.15, S('wrong1').end + 0.3, 56, iconWarn);
    counter('99', t, t99 - 0.1, t100 - 0.05, '#ffffff');
    counter('100', t, t100 - 0.05, t101 - 0.1, '#39ff4a');
    counter('101 ?', t, t101 - 0.1, tNow + 0.2, '#ff5252');
    bubble('101?!', screen.dog, t, t101 + 0.05, tNow + 0.1, 64, '#fff', '#c62828', -100);
    P_('YOU = SHEEP No. 101', '#e65100', tNumber - 0.15, tRoundW - 0.15, 50);
    if (t > tRoundW - 0.1 && t < tThen - 0.1) { const n = 1 + Math.floor(extraW(t) / (Math.PI * 2) * 30); P_('LAP ' + Math.min(n, 47), '#455a64', tRoundW - 0.1, tThen - 0.1, 64); }
    P_('HERDED HOME', '#6d4c41', tHerds - 0.15, tInto - 0.1, 56);
    P_('INTO THE PEN', RED, tInto - 0.1, tWith - 0.15, 56, iconX);
    P_('EAR TAG: 101', RED, tTag - 0.2, tRew0, 58, iconX);
  } else {
    P_('WINDOW DOWN', '#1565c0', tRoll - 0.1, tCount - 0.2, 54);
    P_('COUNT THE SHEEP', GREEN, tCount - 0.2, tOut - 0.15, 54);
    P_('OUT LOUD', GREEN, tOut - 0.15, tNice - 0.15, 60);
    P_('NICE AND SLOWLY', GREEN, tNice - 0.15, S('right2').end + 0.3, 54);
    floatText('1', 300, 760, t, tOne - 0.05, tOne + 1.3, 150, '#fff', -0.1);
    floatText('2', 540, 700, t, tTwo - 0.05, tTwo + 1.3, 150, '#fff', 0.05);
    floatText('3', 780, 760, t, tThree - 0.05, tThree + 1.3, 150, '#fff', 0.12);
    P_('YAAAWN...', '#7e57c2', tYawn - 0.25, S('right3').end + 0.3, 60);
    floatText('... 10', W / 2, 720, t, tTen - 0.1, tTen + 1.2, 140, '#fff', -0.06);
    P_('FLOCK: FAST ASLEEP', '#5e35b1', tAsleep - 0.15, tOneB - 0.1, 52);
    P_('ONE BIG FLUFFY CLOUD', '#5e35b1', tOneB - 0.1, S('right4').end + 0.3, 50);
    if (t > tAsleep && t < S('right4').end + 0.3) zzz(t, tAsleep, S('right4').end + 0.3, { x: W / 2, y: 900, ok: true }, 1.3);
    P_('SHEEPDOG: ASLEEP TOO', '#5e35b1', tDogR - 0.1, S('right5').end + 0.3, 50);
    zzz(t, tSnoring + 0.1, S('right6').start + 0.2, screen.dog);
    P_('INDICATE', '#ef6c00', tIndicate - 0.15, tSecond - 0.15, 60, iconArrow);
    P_('SECOND EXIT', GREEN, tSecond - 0.15, tVery - 0.15, 60, iconCheck);
    P_('SHHH... QUIETLY', '#5e35b1', tVery - 0.15, S('right7').start - 0.1, 56);
  }
}
window.dbg = { carPos, SH, SLOTS };
start(update, hud);
