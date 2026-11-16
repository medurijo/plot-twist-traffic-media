// Episode 52: Breakdown on the motorway – the tow truck is a giant crab
// hook (old style): your car breaks down on the motorway, you call a tow truck -> it arrives sideways, flashing lights, two giant claws: a crab
// wrong: point and shout "pick it up!" -> it picks it up by the roof: SNIP, convertible -> crabs only walk sideways:
//        not to the garage but home to the beach -> builds a sandcastle on you (driver's head sticks out)
// right: hazard lights, warning triangle, wave hello -> it waves back, clack clack = "no problem" -> lifts the car like a waiter's tray,
//        scuttles sideways past the traffic jam -> straight to the garage -> keeps the warning triangle as a tip: party hat
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, SKY
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
scene.background = new THREE.Color('#9fcdf2'); scene.fog.color.set('#cfe3f2');
// ---------------- timing ----------------
const tBreaks = WT('hook1', 'breaks'), tCall = WT('hook1', 'call');
const tArrives = WT('hook2', 'arrives'), tFlash = WT('hook2', 'flashing'), tTwo = WT('hook2', 'two'), tClaws = WT('hook2', 'claws'), tThe = WT('hook2', 'The'), tCrab = WT('hook2', 'crab'), tWhat = WT('hook2', 'What');
const tPoint = WT('wrong1', 'point'), tShout = WT('wrong1', 'shout'), tPick = WT('wrong1', 'pick');
const tBig = WT('wrong2', 'Big'), tPicks = WT('wrong2', 'picks'), tRoof = WT('wrong2', 'roof'), tSnip = WT('wrong2', 'Snip'), tNow = WT('wrong2', 'Now'), tConv = WT('wrong2', 'convertible');
const tAnd3 = WT('wrong3', 'And'), tSide3 = WT('wrong3', 'sideways'), tSo3 = WT('wrong3', 'So'), tGarage3 = WT('wrong3', 'garage'), tTakes = WT('wrong3', 'takes'), tBeach = WT('wrong3', 'beach'), tBuilds = WT('wrong3', 'builds'), tCastle = WT('wrong3', 'sandcastle');
const tHazard = WT('right2', 'Hazard'), tWarn = WT('right2', 'Warning'), tTri = WT('right2', 'triangle'), tThen = WT('right2', 'Then'), tWave = WT('right2', 'wave');
const tWaves = WT('right3', 'waves'), tClack1 = WT('right3', 'Clack', 0), tClack2 = WT('right3', 'Clack', 1), tThats = WT('right3', 'That'), tNoP = WT('right3', 'problem');
const tLifts = WT('right4', 'lifts'), tTray = WT('right4', 'tray'), tScut = WT('right4', 'scuttles'), tRight4 = WT('right4', 'Right'), tJam = WT('right4', 'jam');
const tStraight = WT('right5', 'Straight'), tGarage5 = WT('right5', 'garage'), tFaster = WT('right5', 'Faster');
const tTip = WT('right6', 'tip'), tKeeps = WT('right6', 'keeps'), tTri6 = WT('right6', 'triangle'), tPerfect = WT('right6', 'Perfect'), tParty = WT('right6', 'party');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: motorway along z, hard shoulder at x 0..3.3, beach + sea on +x ----------------
const CX = 1.7, GR = 4.0, GZ = -80;              // car x on the hard shoulder, guardrail x, garage stop z
makeLandscape({ avoid: (x, z) => x > -26, fieldAvoid: (x, z, w, d) => x + w / 2 > -32, near: [-60, 0, 60, 300], trees: 1100, seed: 5207 });
plane(-17.6, 3.3, -900, 900, asphaltMat, 0.06, 7);
const sandMat = L('#ecd39b', { map: (() => { const t = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 5000; i++) { const v = 215 + R() * 40 | 0; c.fillStyle = `rgb(${v},${v},${v - 8})`; c.fillRect(R() * w, R() * h, 2, 2); } }, true); return t; })() });
plane(3.3, 35, -900, 900, sandMat, 0.04, 9);
const waterMat = STD('#2f8fbf', { roughness: 0.18, metalness: 0.2, envMapIntensity: 1.2 });
plane(34, 1700, -1700, 1700, waterMat, 0.02, 30);
const median = plane(-10.2, -7.7, -900, 900, L('#7fb84a'), 0.065, 9);
{ const g = new THREE.PlaneGeometry(0.15, 4); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -400; z < 400; z += 10) { dl.push([-3.75, 0.08, z]); dl.push([-13.9, 0.08, z]); } instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.25, 900); g2.rotateX(-Math.PI / 2); instanced(g2, markMat, [[0.0, 0.08, 0], [-7.45, 0.08, 0], [-10.45, 0.08, 0], [-17.4, 0.08, 0]], false); }
// central barrier
{ const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 900), L('#c9c4b8')); m.position.set(-8.95, 0.4, 0); m.castShadow = m.receiveShadow = true; scene.add(m); }
// guardrail between hard shoulder and beach (ends before the garage forecourt)
{ const post = new THREE.BoxGeometry(0.12, 0.75, 0.12), list = []; for (let z = -64; z < 400; z += 4) list.push([GR, 0.38, z]); instanced(post, L('#9aa0a6'), list, true);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 464), STD('#c8ccd0', { metalness: 0.6, roughness: 0.35 })); rail.position.set(GR - 0.08, 0.6, 168); rail.castShadow = rail.receiveShadow = true; scene.add(rail); }
// foam lines
const FOAM = [0, 1, 2].map(k => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1800), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(34 + k * 2, 0.045, 0); m.userData.noAO = true; scene.add(m); return m; });
// beach umbrella + bucket near the crab's home
{ const g = new THREE.Group(); g.position.set(28, 0, 7); scene.add(g);
  const ut = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(i * w / 8, 0, w / 8, h); } });
  const u = new THREE.Mesh(new THREE.ConeGeometry(2.0, 0.8, 16, 1, true), STD('#fff', { map: ut, side: THREE.DoubleSide })); u.position.y = 2.6; u.castShadow = true; g.add(u);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), STD('#eeeeee')); p.position.y = 1.3; p.castShadow = true; g.add(p);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.45, 14), STD('#1e88e5')); b.position.set(1.6, 0.25, -1.0); b.castShadow = true; g.add(b); }
// road sign "GARAGE 1 km" (faces +z)
{ const g = new THREE.Group(); g.position.set(3.0, 0, -34); scene.add(g);
  const tx = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 10; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#fff'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GARAGE', w / 2, 95); c.font = '800 70px Inter'; c.fillText('↑  1 km', w / 2, 185); });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), STD('#fff', { map: tx })); s.position.y = 2.6; s.castShadow = true; g.add(s);
  for (const x of [-0.9, 0.9]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), STD('#9e9e9e')); p.position.set(x, 1.3, -0.03); p.castShadow = true; g.add(p); } }
// garage at the end of the right way
plane(3.3, 22, -112, -66, L('#c9c3b6'), 0.05, 7);
{ const g = new THREE.Group(); g.position.set(9.5, 0, -99); scene.add(g);
  const front = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#f2ece0'; c.fillRect(0, 0, w, h); c.fillStyle = '#5b6770'; c.fillRect(150, 70, 212, 186); c.strokeStyle = '#7d8a93'; c.lineWidth = 4; for (let y = 82; y < 256; y += 16) { c.beginPath(); c.moveTo(150, y); c.lineTo(362, y); c.stroke(); } c.fillStyle = '#90a4ae'; c.fillRect(30, 90, 90, 70); c.fillRect(392, 90, 90, 70); });
  const wall = L('#f2ece0');
  const m = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 12), [wall, wall, L('#8d6e63'), wall, L('#fff', { map: front }), wall]); m.position.y = 2.5; m.castShadow = m.receiveShadow = true; g.add(m);
  const st = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GARAGE', w / 2, h / 2 + 4); });
  const s = new THREE.Mesh(new THREE.BoxGeometry(6, 1.5, 0.2), [L('#b71c1c'), L('#b71c1c'), L('#b71c1c'), L('#b71c1c'), L('#fff', { map: st }), L('#b71c1c')]); s.position.set(0, 5.9, 6.0); s.castShadow = true; g.add(s);
  for (const x of [-3.5, 3.5]) { const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.2, 10, 20), STD('#1b1b1d', { roughness: 0.9 })); tyre.rotation.x = Math.PI / 2; tyre.position.set(x + (x > 0 ? 1.2 : -1.2), 0.2, 7.0); tyre.castShadow = true; g.add(tyre); const t2 = tyre.clone(); t2.position.y = 0.6; g.add(t2); } }

// ---------------- vehicles ----------------
const hero = makeCar('#2f7bff');
hero.userData.bodyG.children[1].material.color.set('#40566e');
const HB = hero.userData.bodyG;
// seats, steering wheel and the driver inside (visible once the roof is gone)
const skin = STD('#f1c8a5', { roughness: 0.7 });
{ const seatM = STD('#3e2723', { roughness: 0.8 });
  for (const x of [-0.42, 0.42]) { const bk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.12), seatM); bk.position.set(x, 1.19, 0.42); bk.rotation.x = -0.1; HB.add(bk); }
  const rear = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 0.3), seatM); rear.position.set(0, 1.05, 0.85); HB.add(rear);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 8, 20), STD('#222')); sw.position.set(-0.42, 1.12, -0.32); sw.rotation.x = -0.9; HB.add(sw); }
const DRV = new THREE.Group(); DRV.position.set(-0.42, -0.38, 0.12); HB.add(DRV);
{ const tor = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.3, 4, 10), STD('#ffb300')); tor.position.y = 1.3; DRV.add(tor);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), skin); hd.position.y = 1.7; DRV.add(hd);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), STD('#5d4037')); hair.position.y = 1.72; hair.rotation.x = 0.25; DRV.add(hair);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), STD('#fff')); e.position.set(s * 0.06, 1.72, -0.135); DRV.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), STD('#111')); p.position.set(s * 0.06, 1.72, -0.175); DRV.add(p); }
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.013, 6, 12), STD('#5a0000')); mo.position.set(0, 1.62, -0.15); DRV.add(mo); }
DRV.traverse(o => { if (o.isMesh) o.castShadow = true; });
// arm out of the right window (pointing / waving)
const ARM = new THREE.Group(); ARM.position.set(0.86, 1.18, -0.15); HB.add(ARM);
{ const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.55, 4, 8), STD('#ffb300')); a.rotation.z = -Math.PI / 2; a.position.x = 0.32; ARM.add(a);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), skin); h.position.x = 0.72; ARM.add(h);
  const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 6), skin); f.rotation.z = -Math.PI / 2; f.position.set(0.86, 0.02, 0); ARM.add(f); ARM.userData.finger = f; }
ARM.traverse(o => { if (o.isMesh) o.castShadow = true; });
// detachable roof copy (glass + roof) for the snip
const ROOF = new THREE.Group(); scene.add(ROOF);
{ const gl = new THREE.Mesh(HB.children[1].geometry, HB.children[1].material); ROOF.add(gl); const rf = new THREE.Mesh(HB.children[2].geometry, HB.children[2].material); ROOF.add(rf); ROOF.traverse(o => { if (o.isMesh) o.castShadow = true; }); ROOF.visible = false; }
// traffic jam
const JAM = []; { const cols = ['#e53935', '#fdd835', '#ffffff', '#43a047', '#8e24aa', '#ff7043', '#90a4ae', '#26c6da', '#5d4037', '#212121'];
  let k = 0; for (const lx of [-1.9, -5.6]) for (let z = -18 - (lx < -3 ? 4 : 0); z > -72; z -= 7.2) { const c = makeCar(cols[k % cols.length]); placeCar(c, { x: lx + (hash(k) - 0.5) * 0.3, z, h: (hash(k + 9) - 0.5) * 0.05 }); c.userData.tl.emissiveIntensity = 1.6; JAM.push(c); k++; } }
// warning triangle (red frame, white inside); local: stands on y=0, faces +z
const TRI = new THREE.Group(); scene.add(TRI);
{ const tri = (r) => { const s = new THREE.Shape(); for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + i * 2 * Math.PI / 3; const x = r * Math.cos(a), y = r * Math.sin(a); i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; };
  const o = tri(0.55); o.holes.push((() => { const h = tri(0.36); return new THREE.Path(h.getPoints().reverse()); })());
  const fg = new THREE.ExtrudeGeometry(o, { depth: 0.06, bevelEnabled: false }); fg.translate(0, 0.28, -0.03);
  const fr = new THREE.Mesh(fg, STD('#e01b1b', { emissive: '#600000', roughness: 0.35 })); fr.castShadow = true; TRI.add(fr);
  const inner = new THREE.Mesh(new THREE.ShapeGeometry(tri(0.36)), STD('#ffffff', { side: THREE.DoubleSide })); inner.position.y = 0.28; TRI.add(inner);
  const st = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.3), STD('#555')); st.position.y = 0.02; TRI.add(st); }
TRI.visible = false;

// ---------------- the crab (local forward +x, lateral z) ----------------
const RED_C = STD('#e2502c', { roughness: 0.45 }), RED_D = STD('#c23b1e', { roughness: 0.5 }), BELLY = STD('#f6b48a', { roughness: 0.6 });
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
const CR = new THREE.Group(); scene.add(CR);                // ground frame: position + yaw
const BODY = new THREE.Group(); CR.add(BODY);             // body (bobs)
const BODY_Y = 3.0;
const CRB = {};
{ const sh = mk(new THREE.SphereGeometry(1, 48, 28), RED_C, 0, 0, 0, BODY); sh.scale.set(1.75, 0.95, 2.7);
  const bl = mk(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), BELLY, 0, -0.05, 0, BODY); bl.scale.set(1.65, 0.6, 2.55);
  // spikes on the front rim
  for (let k = -3; k <= 3; k++) { const a = k * 0.2; const sp = mk(new THREE.ConeGeometry(0.14, 0.42, 8), RED_D, 1.72 * Math.cos(a) * 0.98, 0.25, 2.65 * Math.sin(a), BODY); sp.rotation.z = -1.2; sp.rotation.y = -a; }
  // dots
  for (let k = 0; k < 14; k++) { const a = hash(k) * 6.28, r = 0.3 + hash(k + 4) * 0.55; const d = mk(new THREE.SphereGeometry(0.11 + hash(k + 8) * 0.08, 10, 8), STD('#f07a50'), 1.75 * r * Math.cos(a) * 0.9, 0.86 - r * 0.35, 2.7 * r * Math.sin(a) * 0.9, BODY); d.scale.y = 0.4; }
  // mouth
  CRB.mouth = mk(new THREE.TorusGeometry(0.28, 0.06, 8, 20, Math.PI), STD('#5a0f05'), 1.68, -0.18, 0, BODY); CRB.mouth.rotation.set(0, Math.PI / 2, Math.PI);
  // eye stalks
  CRB.eyes = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(1.2, 0.6, s * 0.62); BODY.add(g);
    const st = new THREE.CylinderGeometry(0.11, 0.15, 1.5, 12); st.translate(0, 0.75, 0); mk(st, RED_C, 0, 0, 0, g);
    const ball = new THREE.Group(); ball.position.y = 1.62; g.add(ball);
    const w = mk(new THREE.SphereGeometry(0.42, 24, 16), STD('#ffffff', { roughness: 0.25 }), 0, 0, 0, ball);
    const p = mk(new THREE.SphereGeometry(0.22, 16, 12), STD('#141414', { roughness: 0.2 }), 0.3, 0.02, 0, ball);
    const hl = mk(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), 0.47, 0.12, -0.06, ball);
    return { g, ball, w, p, hl, s }; });
  // tow-truck light bar on the shell
  CRB.bar = new THREE.Group(); CRB.bar.position.set(-0.55, 0.92, 0); BODY.add(CRB.bar);
  mk(new THREE.BoxGeometry(0.45, 0.22, 2.2), STD('#333', { roughness: 0.5 }), 0, 0, 0, CRB.bar);
  CRB.lamps = [-0.75, 0.75].map(z => { const m = new THREE.MeshStandardMaterial({ color: '#ffb300', emissive: '#ff9800', emissiveIntensity: 0.4, roughness: 0.3, toneMapped: false, transparent: true, opacity: 0.95 }); mk(new THREE.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, 0.1, z, CRB.bar); return m; });
  const tt = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '900 52px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TOW', w / 2, h / 2 + 3); });
  const pl = mk(new THREE.PlaneGeometry(0.9, 0.22), STD('#fff', { map: tt }), 0.235, 0.0, 0, CRB.bar); pl.rotation.y = Math.PI / 2; }
// limbs are world-space segments driven by IK
const segGeo = (r0, r1) => { const g = new THREE.CylinderGeometry(r1, r0, 1, 12); g.translate(0, 0.5, 0); return g; };
const _up = V3(0, 1, 0);
function seg(m, a, b) { const d = b.clone().sub(a); const l = d.length(); m.position.copy(a); m.quaternion.setFromUnitVectors(_up, d.multiplyScalar(1 / Math.max(l, 1e-6))); m.scale.set(1, l, 1); }
function ik(A, C, l1, l2, hint) { const d0 = C.clone().sub(A); let d = d0.length(); const dir = d0.clone().normalize(); d = Math.min(d, l1 + l2 - 0.02);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d); const h = Math.sqrt(Math.max(0, l1 * l1 - a * a)); const perp = hint.clone().addScaledVector(dir, -hint.dot(dir)).normalize();
  return { B: A.clone().addScaledVector(dir, a).addScaledVector(perp, h), C: A.clone().addScaledVector(dir, d) }; }
const LEGS = [];
const LX = [1.05, 0.38, -0.32, -1.0];
for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
  const up = new THREE.Mesh(segGeo(0.26, 0.2), RED_C), lo = new THREE.Mesh(segGeo(0.19, 0.06), RED_D), kn = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), RED_C);
  for (const m of [up, lo, kn]) { m.castShadow = true; m.receiveShadow = true; scene.add(m); }
  LEGS.push({ s, i, up, lo, kn, hip: V3(LX[i] * 0.95, -0.15, s * 2.25), rest: V3(LX[i] * 1.55, 0, s * 4.5), off: (((i % 2) ^ (s > 0 ? 1 : 0)) * 0.5 + i * 0.07) }); }
const ARMS = [-1, 1].map(s => { const up = new THREE.Mesh(segGeo(0.3, 0.26), RED_C), lo = new THREE.Mesh(segGeo(0.27, 0.24), RED_C), el = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 10), RED_D);
  for (const m of [up, lo, el]) { m.castShadow = true; m.receiveShadow = true; scene.add(m); }
  const P = new THREE.Group(); scene.add(P);                   // pincer, local +x = pointing direction
  const palm = mk(new THREE.SphereGeometry(1, 28, 18), RED_C, 0.55, 0, 0, P); palm.scale.set(0.75, 0.5, 0.42);
  const fixG = new THREE.CylinderGeometry(0.05, 0.22, 1.3, 12); fixG.rotateZ(-Math.PI / 2); fixG.translate(0.65, 0, 0);
  const upper = new THREE.Group(); upper.position.set(1.05, 0.12, 0); P.add(upper); mk(fixG, RED_C, 0, 0, 0, upper).scale.set(1, 1, 0.8);
  const lower = new THREE.Group(); lower.position.set(1.05, -0.12, 0); P.add(lower); mk(fixG, RED_D, 0, 0, 0, lower).scale.set(0.85, 0.8, 0.7);
  for (const g of [upper, lower]) for (let k = 0; k < 3; k++) mk(new THREE.ConeGeometry(0.06, 0.14, 6), STD('#fff3e0'), 0.35 + k * 0.3, g === upper ? -0.1 : 0.1, 0, g).rotation.z = g === upper ? Math.PI : 0;
  return { s, up, lo, el, P, upper, lower, sh: V3(1.25, -0.25, s * 1.45) }; });

// crab trajectory (pure function of t): {x, z, yaw}
const CR_X = 8.0, YAW0 = Math.PI;
const tArrive0 = 2.0, tArrive1 = tThe - 0.35; const ARR_Z0 = -78;
function crabPath(t) {
  const right = isRight(t);
  // arrival along the beach (moving +z = sideways)
  const u = clamp((t - tArrive0) / (tArrive1 - tArrive0)); const ua = u < 0.82 ? u / 0.82 * 0.88 : 0.88 + 0.12 * Math.sin((u - 0.82) / 0.18 * Math.PI / 2);
  let p = { x: CR_X, z: lerp(ARR_Z0, 0, ua), yaw: YAW0 };
  if (!right) {
    if (t > tSide3) { const ut = ease(clamp((t - tSide3) / 0.9)); p.yaw = lerp(YAW0, Math.PI / 2, ut); }
    if (t > tSo3) { const uw = clamp((t - tSo3) / (tBeach + 0.3 - tSo3)); p.x = lerp(CR_X, 22, uw < 0.15 ? uw * uw / 0.3 : uw > 0.85 ? 1 - (1 - uw) * (1 - uw) / 0.3 : (uw - 0.075) / 0.85); p.x = Math.min(p.x, 22); }
  } else {
    if (t > tScut - 0.25) { const uw = clamp((t - tScut + 0.25) / (tGarage5 - tScut + 0.25)); const e = uw < 0.18 ? uw * uw / 0.36 : uw > 0.82 ? 1 - (1 - uw) * (1 - uw) / 0.36 : (uw - 0.09) / 0.82; p.z = lerp(0, GZ, Math.min(1, e)); }
  }
  return p;
}
// distance travelled table (for the gait)
const DT = 1 / 60, SD = [0]; { let prev = crabPath(0); for (let t = DT; t <= TOTAL + 1; t += DT) { const p = crabPath(t); SD.push(SD[SD.length - 1] + Math.hypot(p.x - prev.x, p.z - prev.z) + Math.abs(p.yaw - prev.yaw) * 2.5); prev = p; } }
const sAt = t => { const k = clamp(t / DT, 0, SD.length - 2), i = Math.floor(k); return lerp(SD[i], SD[i + 1], k - i); };
const STRIDE = 4.2;

// ---------------- puffs ----------------
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 90 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }

// ---------------- sandcastle (wrong ending) ----------------
const CAST = new THREE.Group(); scene.add(CAST);
const SANDM = STD('#e6c587', { roughness: 0.95 });
const MOUND = mk(new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), SANDM, 0, 0, 0, CAST);
const TOWERS = [[-0.7, -1.5], [0.7, -1.5], [-0.75, 1.5], [0.75, 1.5], [0, 0.7]].map(([x, z], k) => { const g = new THREE.Group(); g.position.set(x, 0, z); CAST.add(g);
  const r = k === 4 ? 0.42 : 0.32, h = k === 4 ? 1.0 : 0.7; mk(new THREE.CylinderGeometry(r, r * 1.12, h, 16), SANDM, 0, h / 2, 0, g);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; mk(new THREE.BoxGeometry(0.13, 0.16, 0.13), SANDM, Math.cos(a) * r * 0.9, h + 0.08, Math.sin(a) * r * 0.9, g); }
  if (k === 4) { mk(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 5), STD('#795548'), 0, h + 0.4, 0, g); const f = mk(new THREE.PlaneGeometry(0.42, 0.26), STD('#e53935', { side: THREE.DoubleSide }), 0.21, h + 0.66, 0, g); g.userData.flag = f; }
  return { g, h }; });
CAST.visible = false;

// ---------------- choreography helpers ----------------
const carHook = t => { const u = clamp(t / 2.7); return { x: CX, z: 38 * (1 - u) * (1 - u), h: 0 }; };
// carried car pose in crab-local terms
const CARRY_W = V3(3.3, 2.5, 0), CARRY_R = V3(2.5, 5.9, 0);
const _M = new THREE.Matrix4(), _Q = new THREE.Quaternion();
function crabToWorld(p, local) { return local.clone().applyAxisAngle(_up, p.yaw).add(V3(p.x, 0, p.z)); }
// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const chase = (dz, dy, dx = -1.2) => t => { const c = carHook(t); return [V3(c.x + dx, dy, c.z + dz), V3(c.x + 0.6, 1.2, c.z - 14), 40]; };
const crabF = (off, look, fov = 40) => t => { const p = crabPath(t); return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
const camKeys = [
  [0.0, chase(9.0, 3.0)],
  [tCall - 0.35, chase(7.0, 2.8)],
  ...cut(tCall - 0.3, Ac([-2.6, 2.1, -6.5], [1.6, 1.1, 0.6], 36)),
  [S('hook1').end + 0.3, Ac([-2.4, 2.0, -6.0], [1.6, 1.1, 0.6], 36)],
  // hook2: arrives sideways
  ...cut(tArrives - 0.25, Ac([2.7, 2.4, 10.0], [7.6, 3.2, -24], 32)),
  [tFlash - 0.3, Ac([2.8, 2.6, 9.0], [7.6, 3.4, -18], 32)],
  ...cut(tFlash - 0.25, crabF([-6.5, 7.5, 9.5], [0.0, 4.0, 0], 38)),
  [tTwo - 0.3, crabF([-6.8, 7.2, 9.0], [0.0, 3.8, 0], 38)],
  ...cut(tTwo - 0.25, Ac([-2.2, 3.3, 7.8], [5.2, 3.2, -0.3], 38)),
  [tThe - 0.3, Ac([-2.0, 3.3, 7.2], [5.2, 3.2, -0.3], 38)],
  ...cut(tThe - 0.25, Ac([-8.0, 3.4, 1.2], [6.0, 3.7, 0], 40)),
  [S('hook2').end + 0.3, Ac([-6.8, 3.4, 1.0], [6.0, 3.7, 0], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([-8.5, 2.7, 3.6], [4.4, 2.7, 0], 40)),
  [S('wrong1').end, Ac([-8.0, 2.7, 3.4], [4.4, 2.7, 0], 40)],
  ...cut(tBig - 0.15, Ac([-10.0, 3.8, 2.6], [4.4, 3.0, 0], 40)),
  [tSnip, Ac([-9.6, 3.8, 2.4], [4.4, 3.0, 0], 40)],
  ...cut(tNow - 0.05, Ac([-1.4, 3.6, -6.6], [1.7, 1.1, 0.2], 36)),
  [S('wrong2').end + 0.3, Ac([-1.2, 3.4, -6.0], [1.7, 1.1, 0.2], 36)],
  ...cut(tAnd3 - 0.2, Ac([-10.0, 4.6, 6.0], [5.0, 3.0, -0.5], 40)),
  [tSo3 - 0.3, Ac([-10.0, 4.8, 6.4], [5.5, 3.0, -1.0], 40)],
  ...cut(tSo3 - 0.25, crabF([-2.5, 5.2, -24.0], [0.8, 3.0, -1.0], 40)),
  [tTakes - 0.3, crabF([-2.0, 5.2, -22.0], [0.8, 3.0, -1.0], 40)],
  ...cut(tTakes - 0.25, Ac([17.0, 5.8, -21.0], [22.0, 2.2, -2.0], 40)),
  [tBuilds - 0.2, Ac([18.6, 4.2, -16.0], [22.0, 1.9, -3.0], 40)],
  [tRew0, Ac([19.2, 3.8, -14.5], [22.0, 2.0, -3.0], 40)],
  // right
  ...cut(tRew1, Ac([-10.0, 3.9, 6.5], [4.5, 2.8, 0], 40)),
  [tHazard - 0.3, Ac([-9.4, 3.9, 6.0], [4.5, 2.8, 0], 40)],
  ...cut(tHazard - 0.25, Ac([0.9, 3.4, 15.5], [1.8, 0.7, 2.0], 32)),
  [tThen - 0.3, Ac([1.0, 3.2, 14.5], [1.8, 0.7, 2.0], 32)],
  ...cut(tThen - 0.25, Ac([5.0, 2.7, 8.0], [2.5, 1.5, -0.4], 36)),
  [S('right2').end + 0.2, Ac([5.0, 2.6, 7.6], [2.5, 1.5, -0.4], 36)],
  ...cut(tWaves - 0.25, Ac([-8.5, 2.4, 3.6], [7.5, 4.3, 0], 44)),
  [S('right3').end + 0.2, Ac([-9.0, 2.5, 3.4], [7.5, 4.3, 0], 44)],
  ...cut(tLifts - 0.2, Ac([-15.0, 5.5, 9.5], [5.0, 4.6, 0], 44)),
  [tScut - 0.3, Ac([-15.0, 5.8, 9.0], [5.0, 5.0, 0], 44)],
  ...cut(tScut - 0.25, crabF([-23.0, 6.0, 4.0], [0.0, 4.2, -1.0], 42)),
  [tStraight - 0.3, crabF([-22.0, 6.0, 3.0], [0.0, 4.2, -1.0], 42)],
  ...cut(tStraight - 0.25, Ac([-2.0, 5.5, -58.0], [7.6, 3.6, -84.0], 40)),
  [S('right5').end + 0.2, Ac([-1.5, 5.2, -60.0], [7.2, 3.2, -82.0], 40)],
  ...cut(tTip - 0.3, Ac([-4.6, 4.6, -73.5], [6.8, 4.5, -80.0], 38)),
  [tPerfect - 0.2, Ac([-4.2, 4.6, -74.0], [6.8, 4.8, -80.0], 38)],
  ...cut(S('right7').start - 0.2, Ac([-1.5, 5.2, -61.0], [6.8, 3.2, -81.0], 40)),
  [TOTAL, Ac([-2.0, 5.6, -59.0], [6.8, 3.2, -81.0], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
const _pq = new THREE.Quaternion(), _bm = new THREE.Matrix4();
function orientPincer(P, at, dir, upHint) { const x = dir.clone().normalize(); const z = x.clone().cross(upHint).normalize(); const y = z.clone().cross(x).normalize(); _bm.makeBasis(x, y, z); P.quaternion.setFromRotationMatrix(_bm); P.position.copy(at); }
let screen = {};
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  FOAM.forEach((m, k) => { m.position.x = 34.5 + k * 2.2 + 0.9 * Math.sin(t * 0.7 + k * 1.7); m.material.opacity = 0.35 + 0.3 * Math.sin(t * 0.7 + k * 1.7 + 1.2); });
  // ---- crab ground frame + body
  const cp = crabPath(t); CR.position.set(cp.x, 0, cp.z); CR.rotation.set(0, cp.yaw, 0);
  const s = sAt(t), moving = Math.abs(sAt(t + 0.05) - s) > 0.02;
  let bob = 0.12 * Math.abs(Math.sin(s / STRIDE * Math.PI * 2)) * (moving ? 1 : 0), tilt = 0, roll = 0, happy = 0;
  // dances
  if (!right && t > tCastle + 0.4) { const d = t - tCastle - 0.4; bob += 0.25 * Math.abs(Math.sin(d * 7)); roll = 0.08 * Math.sin(d * 7); happy = 1; }
  if (right && t > tWaves - 0.2 && t < S('right3').end + 0.3) { bob += 0.1 * Math.abs(Math.sin(t * 6)); happy = 1; }
  if (right && t > tPerfect - 0.1) { const d = t - tPerfect + 0.1; bob += 0.28 * Math.abs(Math.sin(d * 6.5)); roll = 0.09 * Math.sin(d * 6.5); happy = 1; }
  BODY.position.set(0, BODY_Y + bob, 0); BODY.rotation.set(roll, 0, tilt);
  CR.updateMatrixWorld(true);
  // eyes: look around, blink
  const bl = (t % 3.7) < 0.13 ? 1 : 0;
  CRB.eyes.forEach((E, k) => { E.g.rotation.set(E.s * (0.12 + 0.05 * Math.sin(t * 2 + k)), 0, -0.1 + 0.06 * Math.sin(t * 1.3 + k)); const sq = bl ? 0.12 : happy ? 0.62 : 1; E.ball.scale.set(1, sq, 1); E.p.visible = E.hl.visible = !bl; });
  CRB.mouth.scale.setScalar(happy ? 1.25 : 1);
  // light bar flashing
  CRB.lamps.forEach((m, k) => m.emissiveIntensity = ((t * 2.4 + k * 0.5) % 1) < 0.5 ? 1.0 : 0.15);
  // legs (gait along the direction of travel)
  const p2 = crabPath(t + 0.04); let dv = V3(p2.x - cp.x, 0, p2.z - cp.z); if (dv.lengthSq() < 1e-6) dv = V3(0, 0, 1).applyAxisAngle(_up, cp.yaw); dv.normalize();
  for (const Lg of LEGS) { const hip = BODY.localToWorld(Lg.hip.clone());
    const f = ((s / STRIDE + Lg.off) % 1 + 1) % 1; const off = f < 0.7 ? (0.35 - f) * STRIDE : (-0.35 + (f - 0.7) / 0.3 * 0.7) * STRIDE; const lift = f < 0.7 ? 0 : 1.2 * Math.sin(Math.PI * (f - 0.7) / 0.3);
    let tap = 0; if (happy && !moving) tap = 0.5 * Math.max(0, Math.sin(t * 9 + Lg.i * 1.3 + Lg.s));
    const foot = crabToWorld(cp, Lg.rest).addScaledVector(dv, off); foot.y = lift + tap + 0.05;
    const hint = V3(0, 1, 0).addScaledVector(V3(0, 0, Lg.s).applyAxisAngle(_up, cp.yaw), 0.8);
    const r = ik(hip, foot, 2.6, 3.0, hint); seg(Lg.up, hip, r.B); seg(Lg.lo, r.B, r.C); Lg.kn.position.copy(r.B); }
  // ---- car pose
  let car = { x: CX, z: 0, h: 0, y: 0 }; let carM = null, convertible = false, carLift = 0;
  if (!right && t < S('wrong1').start - 0.5) car = Object.assign(carHook(t), { y: 0 });
  // claw grip targets (world) + opening; default rest
  const grip = [null, null], open = [0.25, 0.25];
  const restGrip = k => BODY.localToWorld(V3(3.3, -1.6 + 0.12 * Math.sin(t * 1.7 + k), (k ? 1 : -1) * 1.9));
  const carryPose = (local, carH) => { const w = crabToWorld(cp, local); return { x: w.x, z: w.z, y: w.y + bob * 0.6, h: cp.yaw - Math.PI, pitch: 0, roll: 0 }; };
  const lerpPose = (a, b, u) => ({ x: lerp(a.x, b.x, u), z: lerp(a.z, b.z, u), y: lerp(a.y, b.y, u), h: lerp(a.h, b.h, u), pitch: 0, roll: 0 });
  let roofW = null; // world position of roof clone (if detached)
  if (!right) {
    // wrong1: point, wrong2: grab by the roof, lift, snip, drop
    if (t > tPicks - 0.1 && t < tSnip + 0.05) { const lu = ease(clamp((t - tRoof) / 0.5)); car.y = 3.2 * lu; car.pitch = 0.05 * Math.sin(t * 9) * lu; car.roll = 0.04 * Math.sin(t * 7) * lu; }
    if (t > tSnip + 0.05) { const d = t - tSnip - 0.05; car.y = Math.max(0, 3.2 - 4.9 * d * d * 2); if (car.y === 0) { const d2 = d - Math.sqrt(3.2 / 9.8); car.y = Math.max(0, 0.35 * Math.sin(Math.PI * clamp(d2 / 0.3))); } convertible = true; }
    // wrong3: grab ends, lift, carry, set down at the beach
    if (t > tAnd3 - 0.1) { const g0 = { x: CX, z: 0, y: car.y, h: 0, pitch: 0, roll: 0 }; const lu = ease(clamp((t - tAnd3 - 0.35) / 0.7)); car = lerpPose(g0, carryPose(CARRY_W), lu); convertible = true; carLift = 1; }
    if (t > tBeach + 0.3) { const du = ease(clamp((t - tBeach - 0.3) / 0.55)); const down = carryPose(V3(3.6, 0, 0)); car = lerpPose(carryPose(CARRY_W), down, du); }
  } else {
    if (t > tLifts - 0.1) { const g0 = { x: CX, z: 0, y: 0, h: 0, pitch: 0, roll: 0 }; const lu = ease(clamp((t - tLifts - 0.3) / 1.0)); car = lerpPose(g0, carryPose(CARRY_R), lu); carLift = 2; }
    if (t > tGarage5 - 0.1) { const du = ease(clamp((t - tGarage5 + 0.1) / 0.8)); car = lerpPose(carryPose(CARRY_R), carryPose(V3(3.6, 0, 0)), du); }
  }
  placeCar(hero, car); hero.scale.set(1, 1, 1);
  HB.children[1].visible = HB.children[2].visible = !convertible; DRV.position.y = convertible ? (!right && t > tBuilds ? 0.3 : -0.2) : -0.38;
  hero.userData.hl.emissiveIntensity = 0.35;
  const hazards = right && t > tHazard - 0.05; blink(hero, t, hazards, hazards);
  hero.updateMatrixWorld(true);
  const CW = v => hero.localToWorld(v.clone());
  // steam from the bonnet (breakdown)
  if (!right && t > 0.7 && t < tThe + 1.5) { const a = (1 - ramp(t, tThe, tThe + 1.5)) * ramp(t, 0.7, 1.4); for (let k = 0; k < 8; k++) { const ph = ((t * 0.9 + k / 8) % 1); puff(CW(V3((hash(k) - 0.5) * 0.6, 1.0 + ph * 2.2, -1.5 - ph * 0.6)), 0.6 + ph * 1.6, 0.55 * (1 - ph) * a, '#f2f2f2'); } }
  // arm: point (wrong1) / wave (right2/3)
  ARM.visible = false;
  if (!right && t > tPoint - 0.3 && t < S('wrong1').end + 0.3) { ARM.visible = true; ARM.position.x = -0.86; ARM.rotation.set(0, 0, 1.1 + 0.1 * Math.sin(t * 12) * (t > tPick - 0.1 ? 1 : 0)); ARM.userData.finger.visible = true; }
  if (right && t > tWave - 0.3 && t < tThats) { ARM.visible = true; ARM.position.x = 0.86; ARM.rotation.set(0, 0, 1.15 + 0.4 * Math.sin((t - tWave) * 10)); ARM.userData.finger.visible = false; }
  // ---- claws
  if (!right) {
    if (t > tPicks - 0.3 && t < tAnd3) { // right claw (k=0 -> s=-1 is toward -z) to the roof
      const k = 0; const u = ease(clamp((t - tPicks + 0.3) / 0.7)); const roofP = CW(V3(0, 1.62, 0.05)); grip[k] = restGrip(k).lerp(roofP, u); open[k] = t < tRoof - 0.05 ? 0.55 : t < tSnip ? 0.05 : 0.05 + 0.4 * ramp(t, tSnip, tSnip + 0.2);
      if (t > tSnip) { const d = t - tSnip; const hold = BODY.localToWorld(V3(2.6, 0.6, -1.6)); const toss = ramp(t, tNow + 0.2, tNow + 0.6); grip[k] = roofP.clone().lerp(hold, ease(clamp(d / 0.5))).lerp(BODY.localToWorld(V3(1.8, 2.8, -2.4)), toss); open[k] = toss > 0.6 ? 0.6 : 0.05; } }
    if (t > tSnip) { // roof clone
      const d = t - tSnip; const tTo = tNow + 0.55; const inClaw = t < tTo;
      if (inClaw) { const g = grip[0] || restGrip(0); roofW = { p: g.clone().add(V3(0, -1.55, 0)), r: 0 }; }
      else { const u = clamp((t - tTo) / 1.4); const p0 = BODY.localToWorld(V3(1.8, 1.25, -2.4)); const p1 = V3(40, -0.5, 9); roofW = { p: p0.clone().lerp(p1, u).add(V3(0, 12 * Math.sin(Math.PI * u) * (1 - u * 0.3), 0)), r: u * 9 }; if (u >= 1) roofW = null;
        if (u > 0.93 && u < 1) { } }
    }
    if (t > tAnd3 - 0.2) { const u = ease(clamp((t - tAnd3 + 0.2) / 0.5)); for (const k of [0, 1]) { const e = CW(V3(0, 0.62, k ? -2.25 : 2.25)); grip[k] = (grip[k] || restGrip(k)).lerp(e, u); open[k] = lerp(0.5, 0.12, u); } }
    if (t > tBeach + 0.75) { const u = ease(clamp((t - tBeach - 0.75) / 0.5)); for (const k of [0, 1]) { grip[k] = grip[k].lerp(BODY.localToWorld(V3(3.0, -0.6 + 0.6 * Math.sin(t * 9 + k * 3) * ramp(t, tBuilds, tBuilds + 0.3), (k ? 1 : -1) * 2.6)), u); open[k] = 0.25 + 0.3 * Math.max(0, Math.sin(t * 14 + k)) * ramp(t, tBuilds, tBuilds + 0.3); } }
  } else {
    if (t > tWaves - 0.25 && t < tLifts - 0.2) { // wave back + clack
      const u = win(t, tWaves - 0.25, tLifts - 0.2, 0.35); for (const k of [0, 1]) { const sgn = k ? 1 : -1; const w = BODY.localToWorld(V3(2.2, 2.7 + 0.25 * Math.sin(t * 7 + k * 2), sgn * (2.5 + 0.7 * Math.sin(t * 6 + k * 1.5)))); grip[k] = restGrip(k).lerp(w, u); }
      const cl = Math.max(win(t, tClack1 - 0.12, tClack1 + 0.12, 0.05), win(t, tClack2 - 0.12, tClack2 + 0.12, 0.05)); open[0] = open[1] = lerp(0.25, 0.75, u) * (1 - cl); }
    if (t > tLifts - 0.25) { const u = ease(clamp((t - tLifts + 0.25) / 0.5)); for (const k of [0, 1]) { const e = CW(V3(0, 0.22, k ? -2.15 : 2.15)); grip[k] = restGrip(k).lerp(e, u); open[k] = 0.15; } }
    if (t > tGarage5 + 0.75) { const u = ease(clamp((t - tGarage5 - 0.75) / 0.5)); for (const k of [0, 1]) grip[k] = grip[k].lerp(restGrip(k), u); }
  }
  // triangle
  TRI.visible = false; let triW = null;
  if (right && t > tTri - 0.25) {
    const u = clamp((t - tTri + 0.25) / 0.5); const p0 = V3(CX, 0.9, 2.3), p1 = V3(CX, 0.0, 6.0);
    triW = { p: p0.clone().lerp(p1, easeOut(u)).add(V3(0, 1.2 * Math.sin(Math.PI * u), 0)), q: new THREE.Quaternion(), s: 1 };
    if (t > tLifts - 0.6) { const u2 = ease(clamp((t - tLifts + 0.6) / 0.55)); const rp = CW(V3(0.35, 1.6, 0.9)); triW.p = p1.clone().lerp(rp, u2).add(V3(0, 1.4 * Math.sin(Math.PI * u2), 0)); triW.q.setFromEuler(new THREE.Euler(0, 0, 0)); if (u2 >= 1) { triW.p = rp; triW.q.setFromRotationMatrix(new THREE.Matrix4().extractRotation(hero.matrixWorld)); } }
    if (t > tKeeps - 0.5) { // claw (k=1) fetches it and puts it on the head
      const k = 1; const fetch = ease(clamp((t - tKeeps + 0.5) / 0.55)); const rp = CW(V3(0.35, 1.6, 0.9));
      const hat = BODY.localToWorld(V3(0.55, 0.9, 0)); const u3 = ease(clamp((t - tTri6) / 0.85));
      const tp = rp.clone().lerp(hat, u3).add(V3(0, 2.0 * Math.sin(Math.PI * u3), 0));
      if (t > tTri6) { triW.p = tp; triW.q.setFromEuler(new THREE.Euler(0, cp.yaw + Math.PI / 2, 0)); triW.s = 1.3 * u3 + 1 * (1 - u3); }
      grip[k] = restGrip(k).lerp(t > tTri6 ? tp.clone().add(V3(0, 0.75, 0)) : rp.clone().add(V3(0, 0.6, 0)), fetch * (1 - ease(clamp((t - tTri6 - 0.8) / 0.5)))); open[k] = t > tTri6 && t < tTri6 + 0.8 ? 0.05 : 0.45;
      if (u3 >= 1) { triW.p = hat; triW.q.setFromEuler(new THREE.Euler(0, cp.yaw + Math.PI / 2, -roll)); }
    }
    TRI.visible = true; TRI.position.copy(triW.p); TRI.quaternion.copy(triW.q); TRI.scale.setScalar(triW.s);
  }
  // party: claws clack up high at the end
  if (right && t > tPerfect - 0.1) { const u = ease(clamp((t - tPerfect + 0.1) / 0.5)); for (const k of [0, 1]) { const sgn = k ? 1 : -1; grip[k] = (grip[k] || restGrip(k)).lerp(BODY.localToWorld(V3(2.0, 2.4 + 0.4 * Math.sin(t * 6.5 + k * 3.1), sgn * 2.7)), u); open[k] = 0.1 + 0.5 * Math.max(0, Math.sin(t * 13 + k * 2)); } }
  ARMS.forEach((A, k) => { const sh = BODY.localToWorld(A.sh.clone()); const g = grip[k] || restGrip(k);
    const dir = g.clone().sub(sh).normalize(); const wrist = g.clone().addScaledVector(dir, -1.15);
    const hint = V3(0, 0.8, 0).add(V3(-0.2, 0, A.s * 1.0).applyAxisAngle(_up, cp.yaw));
    const r = ik(sh, wrist, 2.3, 2.3, hint); seg(A.up, sh, r.B); seg(A.lo, r.B, r.C); A.el.position.copy(r.B);
    const fd = r.C.clone().sub(r.B).normalize(); orientPincer(A.P, r.C, fd.lerp(dir, 0.5).normalize(), V3(0, 1, 0).applyAxisAngle(fd, 0).add(V3(0, 0, 0.0001)));
    A.upper.rotation.z = 0.15 + open[k] * 0.5; A.lower.rotation.z = -0.15 - open[k] * 0.6; });
  // roof clone
  ROOF.visible = false;
  if (roofW) { ROOF.visible = true; ROOF.position.copy(roofW.p); ROOF.rotation.set(roofW.r * 0.7, roofW.r, roofW.r * 0.3); }
  if (!right) { const tTo = tNow + 0.55, u = clamp((t - tTo) / 1.4); if (u > 0.95 && t < tTo + 2.3) { const d = t - tTo - 1.33; for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28; puff(V3(40 + Math.cos(a) * (0.5 + d * 3), 0.6 + d * 2 * hash(k), 9 + Math.sin(a) * (0.5 + d * 3)), 1.2 + d * 2, 0.8 * (1 - clamp(d / 0.9)), '#e8f6ff'); } } }
  // snip sparkle
  if (!right && t > tSnip - 0.02 && t < tSnip + 0.35) { const d = t - tSnip; const p = CW(V3(0, 1.4, 0)); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; puff(p.clone().add(V3(Math.cos(a) * d * 6, 0.3 + Math.sin(a) * d * 3, Math.sin(a) * d * 2)), 0.35, 0.9 * (1 - d / 0.35), '#fff7c4'); } }
  // sandcastle
  CAST.visible = false;
  if (!right && t > tBuilds - 0.2) { CAST.visible = true; const c = CW(V3(0, 0, 0)); CAST.position.set(c.x, 0.03, c.z); CAST.rotation.y = car.h;
    const mu = easeOut(clamp((t - tBuilds + 0.2) / 0.8)); MOUND.scale.set(1.55 * mu + 0.01, 1.42 * mu + 0.01, 2.75 * mu + 0.01);
    TOWERS.forEach((T, k) => { const tu = back(clamp((t - tCastle - 0.1 - k * 0.12) / 0.35)); T.g.visible = tu > 0.01; T.g.scale.setScalar(Math.max(0.01, tu)); T.g.position.y = 1.0 * mu + (k === 4 ? 0.25 : 0); if (T.g.userData.flag) T.g.userData.flag.rotation.y = 0.3 * Math.sin(t * 6); });
    if (t < tCastle + 0.8) for (let k = 0; k < 12; k++) { const d = ((t * 1.3 + k / 12) % 1); const a = hash(k) * 6.28; puff(c.clone().add(V3(Math.cos(a) * (1.5 + d), 0.3 + d * 1.6, Math.sin(a) * (2.4 + d))), 0.5 + d, 0.7 * (1 - d), '#e6c587'); } }
  // walking dust
  if (moving) for (let k = 0; k < 8; k++) { const d = ((t * 2 + k / 8) % 1); puff(V3(cp.x + (hash(k) - 0.5) * 7, 0.3 + d, cp.z + (hash(k + 5) - 0.5) * 8), 0.8 + d * 1.5, 0.35 * (1 - d), right ? '#d7d2c8' : '#efd9a6'); }
  // ---- camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  applyCam(c, t, 0);
  camera.updateMatrixWorld(true);
  screen = { car: project(CW(V3(0, 2.2, 0))), crab: project(BODY.localToWorld(V3(1.4, 3.4, 0))), drv: project(CW(V3(-0.4, 2.3, 0.2))) };
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
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('BREAKDOWN!', '#455a64', tBreaks - 0.1, tCall - 0.15, 64, iconWarn);
    P_('CALLING A TOW TRUCK…', '#455a64', tCall - 0.15, S('hook1').end + 0.3, 54);
    P_('IT ARRIVES… SIDEWAYS?', '#6d4c41', tArrives - 0.1, tFlash - 0.15, 54);
    P_('FLASHING LIGHTS', '#ef6c00', tFlash - 0.15, tTwo - 0.15, 60);
    P_('TWO GIANT CLAWS', '#c62828', tTwo - 0.15, tThe - 0.15, 60);
    P_('THE TOW TRUCK IS A CRAB', '#212121', tThe - 0.15, S('hook2').end + 0.3, 52);
    P_('POINT AND SHOUT', RED, tPoint - 0.1, S('wrong1').end + 0.3, 56, iconWarn);
    bubble('PICK IT UP!', screen.car, t, tPick - 0.15, S('wrong1').end + 0.3, 64, '#fff', '#111', -150);
    P_('BY THE ROOF…', RED, tPicks - 0.1, tSnip - 0.1, 60, iconX);
    floatText('SNIP!', 540, 760, t, tSnip - 0.05, tSnip + 1.0, 170, YEL, -0.1);
    P_('NOW IT’S A CONVERTIBLE', RED, tNow - 0.1, S('wrong2').end + 0.3, 52, iconX);
    P_('CRABS ONLY WALK SIDEWAYS', RED, tAnd3 - 0.1, tSo3 - 0.1, 50, iconX);
    P_('GARAGE? NOPE.', RED, tSo3 - 0.1, tTakes - 0.1, 62, iconX);
    P_('HOME: THE BEACH', '#0277bd', tTakes - 0.1, tBuilds - 0.1, 60);
    P_('YOU ARE A SANDCASTLE', RED, tBuilds - 0.1, tRew0, 54, iconX);
  } else {
    P_('HAZARD LIGHTS ON', GREEN, tHazard - 0.1, tWarn - 0.1, 60, iconCheck);
    P_('WARNING TRIANGLE OUT', GREEN, tWarn - 0.1, tThen - 0.1, 54, iconCheck);
    P_('WAVE HELLO', GREEN, tThen - 0.1, S('right2').end + 0.3, 64, iconHeart);
    P_('IT WAVES BACK', '#ef6c00', tWaves - 0.1, tThats - 0.1, 62, iconHeart);
    floatText('CLACK!', 380, 720, t, tClack1 - 0.05, tClack1 + 0.8, 110, YEL, -0.12);
    floatText('CLACK!', 700, 800, t, tClack2 - 0.05, tClack2 + 0.8, 110, YEL, 0.1);
    P_('CRAB FOR: “NO PROBLEM!”', '#212121', tThats - 0.1, S('right3').end + 0.3, 52);
    P_('LIFTED LIKE A TRAY', GREEN, tLifts - 0.1, tScut - 0.1, 58, iconCheck);
    P_('SIDEWAYS PAST THE JAM', GREEN, tScut - 0.1, S('right4').end + 0.3, 54, iconCheck);
    P_('STRAIGHT TO THE GARAGE', GREEN, tStraight - 0.1, tFaster - 0.1, 54, iconCheck);
    P_('FASTER THAN ANY TOW TRUCK', '#ef6c00', tFaster - 0.1, S('right5').end + 0.3, 50);
    P_('TIP: YOUR WARNING TRIANGLE', '#212121', tTip - 0.1, tPerfect - 0.1, 50, iconHeart);
    floatText('PARTY HAT!', 540, 580, t, tParty - 0.1, tParty + 1.2, 120, YEL, -0.08);
  }
}
window.dbg = { crabPath };
start(update, hud);
