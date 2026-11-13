// Episode 48: School zone in the snow – the lollipop lady is a snowman
// hook (old style): snowy morning, school zone, the lollipop lady steps out -> carrot nose, coal buttons: she's a snowman
// wrong: honk to hurry her up -> snowmen scare easily: she jumps and falls apart -> bottom snowball rolls at you, grows, gulp:
//        your car is now the bottom of the snowman, until spring
// right: stop at the line and wait -> her special class: ten little snowmen hop across -> the smallest lost his nose ->
//        spare carrot from the glovebox -> she flips her sign: a real lollipop, for you -> sweet ride home, tiny snowmen waving
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, hemi,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tSnowy = WT('hook1', 'Snowy'), tSchool = WT('hook1', 'School'), tThe1 = WT('hook1', 'The'), tLolli = WT('hook1', 'lollipop'), tSteps = WT('hook1', 'steps');
const tBut = WT('hook2', 'But'), tNose = WT('hook2', 'nose'), tCarrot = WT('hook2', 'carrot'), tHer2 = WT('hook2', 'her', 1), tButtons = WT('hook2', 'buttons'), tCoal = WT('hook2', 'coal'), tShes = WT('hook2', 'she'), tSnowman = WT('hook2', 'snowman'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tHonk = WT('wrong1', 'honk'), tHurry = WT('wrong1', 'hurry');
const tBig = WT('wrong2', 'Big'), tSnowmen = WT('wrong2', 'Snowmen'), tScare = WT('wrong2', 'scare'), tShe2 = WT('wrong2', 'She'), tJumps = WT('wrong2', 'jumps'), tFalls = WT('wrong2', 'falls'), tApart = WT('wrong2', 'apart');
const tHerB = WT('wrong3', 'Her'), tRolls = WT('wrong3', 'rolls'), tBigger = WT('wrong3', 'bigger', 0), tBigger2 = WT('wrong3', 'bigger', 1), tGulp = WT('wrong3', 'Gulp'), tYoure = WT('wrong3', 'you', 1), tUntil = WT('wrong3', 'Until'), tSpring = WT('wrong3', 'spring');
const tStop = WT('right2', 'Stop'), tWait = WT('right2', 'wait'), tShes2 = WT('right2', 'She'), tSpecial = WT('right2', 'special');
const tTen = WT('right3', 'Ten'), tHopping = WT('right3', 'Hopping'), tOne1 = WT('right3', 'one', 0);
const tSmallest = WT('right4', 'smallest'), tLost = WT('right4', 'lost'), tSo4 = WT('right4', 'So'), tHand = WT('right4', 'hand'), tSpare = WT('right4', 'spare'), tCarrot4 = WT('right4', 'carrot'), tGlove = WT('right4', 'glovebox');
const tShes5 = WT('right5', 'She'), tHappy = WT('right5', 'happy'), tFlips = WT('right5', 'flips'), tSign5 = WT('right5', 'sign'), tReal = WT('right5', 'real'), tLolli5 = WT('right5', 'lollipop'), tFor = WT('right5', 'For');
const tSweet = WT('right6', 'Sweet'), tAnd6 = WT('right6', 'And'), tTen6 = WT('right6', 'ten'), tWaving = WT('right6', 'waving');
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
function monoV(keys) { const f = [0, 1, 2].map(i => mono(keys.map(k => [k[0], k[1][i]]))); return t => V3(f[0](t), f[1](t), f[2](t)); }

// ---------------- world: snowy school zone ----------------
scene.background = new THREE.Color('#a9cdeb'); scene.fog = new THREE.Fog(new THREE.Color('#dce9f5'), 70, 420);
hemi.groundColor = new THREE.Color('#c9d6e6');
const SNOW = STD('#f4f8fd', { roughness: 0.92 });
const snowGround = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), L('#eef3fa')); snowGround.rotation.x = -Math.PI / 2; snowGround.receiveShadow = true; scene.add(snowGround);
plane(-200, 200, -4.2, 4.2, asphaltMat, 0.04, 40);
// sidewalks (light grey, dusted)
const swMat = L('#cfd5dc'); plane(-200, 200, 4.2, 7.0, swMat, 0.09, 30); plane(-200, 200, -7.0, -4.2, swMat, 0.09, 30);
// kerbs
for (const z of [-4.25, 4.25]) { const k = new THREE.Mesh(new THREE.BoxGeometry(400, 0.16, 0.18), L('#e7e9ec')); k.position.set(0, 0.08, z); k.receiveShadow = true; scene.add(k); }
// snow dust on the road edges
{ const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); const R = rng(48), list = [];
  for (let i = 0; i < 260; i++) { const x = (R() - 0.5) * 160; if (x > -9 && x < -2) continue; const side = R() < 0.5 ? -1 : 1; list.push([x, 0.055, side * (3.6 + R() * 0.5), R() * 3, 1.5 + R() * 3, 1, 0.5 + R() * 0.7]); }
  instanced(g, new THREE.MeshLambertMaterial({ color: '#f3f7fc', transparent: true, opacity: 0.8, polygonOffset: true, polygonOffsetFactor: -1 }), list, false); }
// zebra crossing x in [-8.2, -4.0] -> stripes along x
{ const g = new THREE.PlaneGeometry(4.2, 0.55); g.rotateX(-Math.PI / 2); const list = []; for (let z = -3.6; z <= 3.7; z += 1.1) list.push([-6.1, 0.06, z]); instanced(g, markMat, list, false);
  const sl = new THREE.PlaneGeometry(0.3, 4.0); sl.rotateX(-Math.PI / 2); instanced(sl, markMat, [[-3.1, 0.06, -2.1]], false);
  const cl = new THREE.PlaneGeometry(3, 0.14); cl.rotateX(-Math.PI / 2); const dl = []; for (let x = -60; x < 60; x += 6) if (x < -10 || x > -1) dl.push([x, 0.06, 0]); instanced(cl, markMat, dl, false);
  // SCHOOL painted on the lane
  const tT = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#ffffff'; c.font = '900 130px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SCHOOL', w / 2, h / 2 + 6); });
  const tm = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.15), new THREE.MeshLambertMaterial({ map: tT, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 })); tm.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); tm.position.set(6.5, 0.065, -2.1); scene.add(tm); }
// zebra beacons (Belisha) at both ends
for (const z of [4.6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 10), STD('#222')); p.position.set(-8.6, 1.3, z); p.castShadow = true; scene.add(p);
  for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 10), STD('#ffffff')); b.position.set(-8.6, 0.3 + k * 0.4, z); scene.add(b); }
  const gl = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), new THREE.MeshStandardMaterial({ color: '#ffb300', emissive: '#ffa000', emissiveIntensity: 0.9, toneMapped: false })); gl.position.set(-8.6, 2.75, z); scene.add(gl); }
// school building behind (school side = -z)
{ const brick = STD('#c96b4b', { roughness: 0.85 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(22, 7, 9), brick); b.position.set(-12, 3.5, -17); b.castShadow = b.receiveShadow = true; scene.add(b);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(22.6, 0.6, 9.6), SNOW); roof.position.set(-12, 7.3, -17); roof.castShadow = true; scene.add(roof);
  const sT = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#1e3a8a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd54f'; c.font = '900 120px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SNOWDALE SCHOOL', w / 2, h / 2 + 6); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.9), STD('#fff', { map: sT })); sp.position.set(-12, 5.9, -12.48); scene.add(sp);
  const winM = STD('#bfe0f5', { roughness: 0.1, metalness: 0.3, emissive: '#ffe6a8', emissiveIntensity: 0.25 });
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { if (j === 0 && (i === 2 || i === 3)) continue; const w = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), winM); w.position.set(-21 + i * 3.6, 1.6 + j * 2.4, -12.47); scene.add(w); }
  const door = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.6), STD('#1e3a8a')); door.position.set(-12, 1.3, -12.47); scene.add(door);
  // fence + snow banks
  for (let x = -26; x < 4; x += 1.2) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), STD('#f2f2f2')); p.position.set(x, 0.5, -9.2); scene.add(p); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(30, 0.1, 0.08), STD('#f2f2f2')); rail.position.set(-11, 0.85, -9.2); scene.add(rail); }
// houses on the other side
{ const R = rng(9); for (let i = 0; i < 7; i++) { const x = -40 + i * 13 + R() * 3, z = 16 + R() * 6; const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const wl = new THREE.Mesh(new THREE.BoxGeometry(8, 4.4, 6), STD(['#f1e3c8', '#d9e7f1', '#f3d4c6', '#e6e1f4'][i % 4], { roughness: 0.85 })); wl.position.y = 2.2; wl.castShadow = wl.receiveShadow = true; g.add(wl);
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(4.7, 4.7, 8.6, 3, 1), SNOW); rf.rotation.z = Math.PI / 2; rf.rotation.x = Math.PI / 2; rf.scale.set(1, 1, 0.62); rf.position.y = 5.7; rf.castShadow = true; g.add(rf);
    for (const s of [-1.8, 1.8]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.2), STD('#fff3c4', { emissive: '#ffcc66', emissiveIntensity: 0.5 })); w.position.set(s, 2.4, -3.01); w.rotation.y = Math.PI; g.add(w); } } }
// snowy pines + snow mounds
{ const R = rng(4848), pts = [];
  while (pts.length < 900) { const x = (R() - 0.5) * 700, z = (R() - 0.5) * 700; if (Math.abs(z) < 12 && Math.abs(x) < 120) continue; if (z < -9 && z > -26 && x > -30 && x < 8) continue; if (z > 10 && z < 26 && x > -46 && x < 50) continue; pts.push([x, z, 0.7 + R() * 1.1, R()]); }
  for (let i = 0; i < 26; i++) { const x = 10 + i * 4.5 + R() * 2, z = (R() < 0.5 ? -1 : 1) * (10.5 + R() * 3); pts.push([x, z, 0.7 + R() * 0.6, R()]); }
  const n = pts.length; const cone = new THREE.InstancedMesh(new THREE.ConeGeometry(1.9, 4.0, 8), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), n * 3);
  const trk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 1.4, 6), L('#5d3f25'), n);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _c = new THREE.Color();
  pts.forEach(([x, z, s, r], i) => { _m.compose(V3(x, 0.7 * s, z), _q.identity(), V3(s, s, s)); trk.setMatrixAt(i, _m); _e.set(0, r * 6, 0); _q.setFromEuler(_e);
    for (let k = 0; k < 3; k++) { const sc = s * (1 - k * 0.24); _m.compose(V3(x, s * (2.4 + k * 1.55), z), _q, V3(sc, sc * 0.85, sc)); cone.setMatrixAt(i * 3 + k, _m); cone.setColorAt(i * 3 + k, _c.set(k === 2 ? '#e9f1f8' : (k === 1 ? '#5f8c6a' : '#2f5d3a'))); } });
  cone.castShadow = true; cone.receiveShadow = true; trk.castShadow = true; scene.add(cone); scene.add(trk);
  const mnd = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 10), SNOW, 90); const RM = rng(77); let k = 0;
  for (let i = 0; i < 90; i++) { let x = (RM() - 0.5) * 140, z = (RM() < 0.5 ? -1 : 1) * (7.6 + RM() * 1.4); if (x > -10 && x < -2) x += 14; _m.compose(V3(x, -0.1, z), _q.identity(), V3(1.4 + RM() * 1.6, 0.55 + RM() * 0.35, 0.9 + RM() * 0.4)); mnd.setMatrixAt(k++, _m); }
  mnd.receiveShadow = true; mnd.castShadow = true; scene.add(mnd); }
// school-zone sign
{ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), STD('#9e9e9e')); p.position.set(16, 1.4, -5.0); scene.add(p);
  const sT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(w / 2, 12); c.lineTo(w - 10, h - 24); c.lineTo(10, h - 24); c.closePath(); c.fill(); c.lineWidth = 20; c.strokeStyle = '#e11d2e'; c.stroke();
    c.fillStyle = '#111'; c.beginPath(); c.arc(105, 120, 16, 0, 7); c.arc(150, 112, 14, 0, 7); c.fill(); c.fillRect(92, 136, 26, 50); c.fillRect(138, 126, 24, 46); });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), STD('#fff', { map: sT, transparent: true, alphaTest: 0.5 })); s.position.set(16, 3.0, -5.0); s.rotation.y = Math.PI / 2; scene.add(s); }

// falling snow
const NSN = 2600; const snowGeo = new THREE.BufferGeometry(); const snowPos = new Float32Array(NSN * 3); snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const snowPts = new THREE.Points(snowGeo, new THREE.PointsMaterial({ map: blobT, size: 0.13, transparent: true, depthWrite: false, color: '#ffffff', fog: false })); snowPts.frustumCulled = false; scene.add(snowPts);

// ---------------- snowman builder ----------------
const COAL = STD('#1b1b1f', { roughness: 0.6 }), CARROT = STD('#ff7a1a', { roughness: 0.55 }), TWIG = STD('#6b4a2e', { roughness: 0.9 });
const WHITE_B = new THREE.MeshBasicMaterial({ color: '#ffffff' });
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function makeArm(parent, s, at, len, rad = 0.035) {
  const piv = new THREE.Group(); piv.position.copy(at); parent.add(piv);
  mk(new THREE.CylinderGeometry(rad * 0.7, rad, len, 6), TWIG, 0, len / 2, 0, piv);
  for (const a of [-0.6, 0.5]) { const f = mk(new THREE.CylinderGeometry(rad * 0.4, rad * 0.6, len * 0.28, 5), TWIG, 0, len * 0.95, 0, piv); f.rotation.x = a; f.position.z += Math.sin(a) * len * 0.12; f.position.y += len * 0.06; }
  const hand = new THREE.Object3D(); hand.position.set(0, len * 0.9, 0); piv.add(hand);
  return { piv, s, hand };
}
// lady: three separate parts (they fall apart in the wrong way)
const LB = new THREE.Group(), LM = new THREE.Group(), LH = new THREE.Group(); scene.add(LB, LM, LH);
const botTex = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#f6f9fd'; c.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(150,175,205,${0.08 + R() * 0.12})`; c.beginPath(); c.ellipse(R() * w, R() * h, 4 + R() * 14, 3 + R() * 8, R() * 3, 0, 7); c.fill(); } });
const BOTMAT = STD('#ffffff', { roughness: 0.92, map: botTex });
const LADY = {};
{ const bot = mk(new THREE.SphereGeometry(0.95, 40, 28), BOTMAT, 0, 0, 0, LB); LADY.bot = bot;
  LADY.botBtn = mk(new THREE.SphereGeometry(0.07, 10, 8), COAL, 0.9, 0.25, 0, LB);
  mk(new THREE.SphereGeometry(0.7, 32, 24), SNOW, 0, 0, 0, LM);
  // hi-vis coat band + reflective stripes
  const vest = mk(new THREE.SphereGeometry(0.715, 32, 16, 0, Math.PI * 2, 1.45, 0.95), STD('#d4f51c', { roughness: 0.5, emissive: '#a6c400', emissiveIntensity: 0.25 }), 0, 0, 0, LM);
  for (const y of [-0.22, -0.4]) { const st = mk(new THREE.TorusGeometry(Math.sqrt(0.72 * 0.72 - y * y), 0.03, 6, 40), STD('#e8eef2', { metalness: 0.7, roughness: 0.25 }), 0, y, 0, LM); st.rotation.x = Math.PI / 2; }
  LADY.btns = [0.5, 0.15].map(y => mk(new THREE.SphereGeometry(0.075, 12, 8), COAL, Math.sqrt(0.7 * 0.7 - y * y) + 0.01, y, 0, LM));
  LADY.arms = [-1, 1].map(s => makeArm(LM, s, V3(0, 0.18, s * 0.6), 0.95));
  // head
  mk(new THREE.SphereGeometry(0.52, 32, 24), SNOW, 0, 0, 0, LH);
  LADY.eyes = [-1, 1].map(s => { const e = mk(new THREE.SphereGeometry(0.075, 14, 10), COAL, 0.45, 0.1, s * 0.19, LH); const hl = mk(new THREE.SphereGeometry(0.022, 8, 6), WHITE_B, 0.515, 0.13, s * 0.19 + 0.02, LH);
    const lash = []; for (let k = 0; k < 3; k++) { const l = mk(new THREE.BoxGeometry(0.02, 0.08, 0.016), COAL, 0.44, 0.19, s * (0.13 + k * 0.055), LH); l.rotation.x = s * (-0.5 + k * 0.5); lash.push(l); }
    const brow = mk(new THREE.BoxGeometry(0.03, 0.03, 0.16), TWIG, 0.43, 0.27, s * 0.19, LH); return { e, hl, lash, brow, s }; });
  LADY.nose = mk(new THREE.ConeGeometry(0.085, 0.55, 14), CARROT, 0.76, -0.02, 0, LH); LADY.nose.rotation.z = -Math.PI / 2;
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.09, 10, 8), STD('#ff9eb5', { roughness: 0.8 }), 0.42, -0.08, s * 0.3, LH).scale.set(0.35, 0.7, 1);
  LADY.mouth = [0, 1, 2, 3, 4].map(() => mk(new THREE.SphereGeometry(0.035, 8, 6), COAL, 0.5, -0.2, 0, LH));
  LADY.oMouth = mk(new THREE.TorusGeometry(0.07, 0.025, 8, 16), COAL, 0.5, -0.22, 0, LH); LADY.oMouth.rotation.y = Math.PI / 2;
  // bobble hat + scarf
  const hatC = STD('#e53935', { roughness: 0.8 });
  const hat = mk(new THREE.SphereGeometry(0.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), hatC, 0, 0.2, 0, LH); hat.scale.set(1.02, 0.95, 1.02); hat.rotation.z = -0.12;
  mk(new THREE.TorusGeometry(0.48, 0.08, 10, 32), STD('#ffffff', { roughness: 0.9 }), 0.02, 0.22, 0, LH).rotation.x = Math.PI / 2;
  mk(new THREE.SphereGeometry(0.16, 14, 10), STD('#ffffff', { roughness: 0.95 }), -0.04, 0.72, 0, LH);
  const scarf = mk(new THREE.TorusGeometry(0.4, 0.1, 10, 32), hatC, 0, -0.44, 0, LH); scarf.rotation.x = Math.PI / 2;
  const tail = mk(new THREE.BoxGeometry(0.07, 0.5, 0.18), hatC, 0.3, -0.7, -0.25, LH); tail.rotation.z = 0.25; }
function setMouth(dots, r, sm, o) { dots.forEach((d, i) => { const k = i - 2, az = k * 0.2, y = -0.19 * r / 0.52 - 0.07 * r / 0.52 * sm * (1 - (k / 2) ** 2), z = r * 0.96 * Math.sin(az); d.position.set(Math.sqrt(Math.max(0.01, r * r - y * y - z * z)) + 0.005, y, z); d.visible = o < 0.5; }); }
// the sign (STOP / CHILDREN front, real lollipop on the back)
const sign = new THREE.Group(); scene.add(sign);
const SG = {};
{ const pole = mk(new THREE.CylinderGeometry(0.045, 0.045, 2.3, 10), STD('#fafafa', { roughness: 0.4 }), 0, 1.15, 0, sign);
  const fT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 2, 0, 7); c.fill(); c.lineWidth = 46; c.strokeStyle = '#e11d2e'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 26, 0, 7); c.stroke();
    c.fillStyle = '#111'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '900 150px Inter'; c.fillText('STOP', w / 2, h / 2 - 34); c.font = '900 64px Inter'; c.fillText('CHILDREN', w / 2, h / 2 + 86); });
  const bT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 2, 0, 7); c.fill(); c.save(); c.translate(w / 2, h / 2);
    const cols = ['#ff3d7f', '#ffffff', '#ffb300', '#ffffff', '#29b6f6', '#ffffff', '#66bb6a', '#ffffff'];
    for (let k = 0; k < 8; k++) { c.fillStyle = cols[k]; c.beginPath(); for (let a = 0; a <= 1; a += 0.01) { const r = a * (w / 2 - 6), th = a * 9 + k * Math.PI / 4; c.lineTo(Math.cos(th) * r, Math.sin(th) * r); } for (let a = 1; a >= 0; a -= 0.01) { const r = a * (w / 2 - 6), th = a * 9 + (k + 1) * Math.PI / 4; c.lineTo(Math.cos(th) * r, Math.sin(th) * r); } c.closePath(); c.fill(); }
    c.restore(); const g = c.createRadialGradient(w * 0.35, h * 0.3, 10, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 2, 0, 7); c.fill(); });
  const R0 = 0.58;
  const rim = mk(new THREE.CylinderGeometry(R0, R0, 0.06, 40), STD('#e0e0e0'), 0, 2.3 + R0 - 0.05, 0, sign); rim.rotation.z = Math.PI / 2;
  const f = mk(new THREE.CircleGeometry(R0 - 0.005, 40), STD('#fff', { map: fT, roughness: 0.5 }), 0.032, 2.3 + R0 - 0.05, 0, sign); f.rotation.y = Math.PI / 2;
  const b = mk(new THREE.CircleGeometry(R0 - 0.005, 40), STD('#fff', { map: bT, roughness: 0.2, metalness: 0.05, emissive: '#ffffff', emissiveMap: bT, emissiveIntensity: 0.15 }), -0.032, 2.3 + R0 - 0.05, 0, sign); b.rotation.y = -Math.PI / 2;
  SG.disk = 2.3 + R0 - 0.05; }

// ten little snowmen
const HATS = ['#1e88e5', '#8e24aa', '#43a047', '#fb8c00', '#e91e63', '#00acc1', '#fdd835', '#5e35b1', '#d81b60', '#3949ab'];
const KIDS = [];
for (let i = 0; i < 10; i++) {
  const g = new THREE.Group(); scene.add(g); const sc = i === 9 ? 0.82 : 0.92 + hash(i) * 0.16; const inner = new THREE.Group(); inner.scale.setScalar(sc); g.add(inner);
  mk(new THREE.SphereGeometry(0.34, 20, 14), SNOW, 0, 0.33, 0, inner);
  const head = new THREE.Group(); head.position.set(0, 0.8, 0); inner.add(head);
  mk(new THREE.SphereGeometry(0.24, 20, 14), SNOW, 0, 0, 0, head);
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.038, 10, 8), COAL, 0.205, 0.05, s * 0.085, head); mk(new THREE.SphereGeometry(0.012, 6, 4), WHITE_B, 0.24, 0.065, s * 0.085 + 0.01, head); }
  const nose = mk(new THREE.ConeGeometry(0.045, 0.26, 10), CARROT, 0.34, -0.01, 0, head); nose.rotation.z = -Math.PI / 2;
  const mouth = [0, 1, 2, 3, 4].map(() => mk(new THREE.SphereGeometry(0.017, 6, 4), COAL, 0.2, -0.09, 0, head));
  const hc = STD(HATS[i], { roughness: 0.8 });
  mk(new THREE.SphereGeometry(0.235, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), hc, 0, 0.07, 0, head).rotation.z = -0.15;
  mk(new THREE.SphereGeometry(0.075, 10, 8), STD('#ffffff', { roughness: 0.95 }), -0.04, 0.31, 0, head);
  const scarf = mk(new THREE.TorusGeometry(0.19, 0.05, 8, 20), STD(HATS[(i + 3) % 10], { roughness: 0.8 }), 0, 0.6, 0, inner); scarf.rotation.x = Math.PI / 2;
  mk(new THREE.BoxGeometry(0.2, 0.28, 0.3), STD(HATS[(i + 5) % 10], { roughness: 0.6 }), -0.33, 0.42, 0, inner);
  const arms = [-1, 1].map(s => makeArm(inner, s, V3(0, 0.45, s * 0.28), 0.36, 0.018));
  KIDS.push({ g, inner, head, nose, mouth, arms, sc });
}

// ---------------- hero car, glove, spare carrot ----------------
const hero = makeCar('#13a6a0');
hero.userData.bodyG.children[1].material.color.set('#3e6a8a');
{ const cap = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.1, 1.05), SNOW); cap.position.set(0, 1.66, 0.06); cap.castShadow = true; hero.userData.bodyG.add(cap);
  const cap2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.6), SNOW); cap2.position.set(0, 1.03, 1.85); hero.userData.bodyG.add(cap2); }
const glove = new THREE.Group(); scene.add(glove);
const GL = {};
{ const wm = STD('#ffffff', { roughness: 0.55 }); const palm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), wm); palm.scale.set(1.0, 1.15, 0.6); glove.add(palm);
  GL.f = [-1.5, -0.5, 0.5].map((k) => { const piv = new THREE.Group(); piv.position.set(k * 0.075, 0.16, 0.02); glove.add(piv); const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 4, 8), wm); f.position.y = 0.1; piv.add(f); return piv; });
  const th = new THREE.Group(); th.position.set(0.15, 0.0, 0.03); glove.add(th); const tm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.12, 4, 8), wm); tm.position.y = 0.08; th.add(tm); th.rotation.z = -0.9; GL.th = th;
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 16), STD('#e0e0e0')); cuff.position.y = -0.2; glove.add(cuff);
  glove.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const spare = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.34, 12), CARROT); spare.castShadow = true; scene.add(spare);
const leafT = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), STD('#43a047')); spare.add(leafT); leafT.position.y = -0.2; leafT.rotation.x = Math.PI;
// puffs (snow poof)
const SPR = Array.from({ length: 120 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#ffffff' })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }

// ---------------- choreography ----------------
const CAR_X = 0, CAR_Z = -1.8;
const LADY_P = V3(-4.0, 0, 0.6);
const carArrX = t => { const u = clamp((t - 0.0) / (tSteps + 0.6)); return lerp(26, CAR_X, 1 - Math.pow(1 - u, 2.2)); };
const carDriveX = t => { const dt = Math.max(0, t - tSweet + 0.2); return CAR_X - (0.06 * dt * dt + 0.5 * dt); };
// lady walk in (hook)
const ladyZ = mono([[0, 6.3], [tThe1 - 0.1, 6.3], [tSteps + 0.7, LADY_P.z], [99, LADY_P.z]]);
// wrong: parts
const H1 = V3(-4.6, 0.42, 3.9), M1 = V3(-6.6, 0.62, -1.4);
const GIANT = V3(0.55, 2.76, CAR_Z), GR = 3.0;
function partsWrong(t) {
  // returns centres + spins for bot, mid, head
  const base = V3(LADY_P.x, 0, ladyZ(t));
  const jump = 1.6 * Math.sin(Math.PI * clamp((t - tJumps + 0.05) / 0.62)) * (t < tFalls ? 1 : 0);
  const shiver = 0.04 * win(t, tHonk, tJumps, 0.1) * Math.sin(t * 40);
  const intact = { bot: base.clone().add(V3(0, 0.85 + jump, 0)), mid: base.clone().add(V3(shiver, 2.2 + jump, 0)), head: base.clone().add(V3(shiver, 3.2 + jump, 0)) };
  const R = { bot: intact.bot, mid: intact.mid, head: intact.head, botR: 0.95, botSpin: 0, botAxis: V3(0, 0, 1), midRot: 0, headRot: 0, giant: 0 };
  if (t > tFalls - 0.05) {
    const u = clamp((t - tFalls + 0.05) / 0.7), um = clamp((t - tFalls + 0.05) / 0.6);
    R.head = intact.head.clone().lerp(H1, easeOut(u)); R.head.y += 1.4 * Math.sin(Math.PI * u) * (1 - u * 0.3) + 0.25 * Math.abs(Math.sin(u * 9)) * (1 - u); R.headRot = u * 3.5;
    R.mid = intact.mid.clone().lerp(M1, easeOut(um)); R.mid.y += 0.9 * Math.sin(Math.PI * um); R.midRot = -um * 2.6;
    R.bot = V3(LADY_P.x, 0.85, LADY_P.z);
  }
  if (t > tRolls - 0.1) { // the bottom rolls at you and grows
    const u = clamp((t - tRolls + 0.1) / (tGulp + 0.15 - tRolls + 0.1)); const ue = easeIn(u) * 0.55 + u * 0.45;
    const r = lerp(0.95, GR, Math.pow(u, 0.8)); const p0 = V3(LADY_P.x, 0, LADY_P.z), p1 = V3(GIANT.x, 0, GIANT.z);
    const p = p0.clone().lerp(p1, ue); R.bot = V3(p.x, r * 0.92, p.z); R.botR = r;
    const dir = p1.clone().sub(p0).normalize(); R.botAxis = V3(0, 1, 0).cross(dir).normalize(); R.botSpin = (p0.distanceTo(p1) * ue) / ((0.95 + r) / 2);
    R.giant = u;
  }
  if (t > tYoure - 0.25) { // mid + head hop back on top of the giant ball
    const top = GIANT.y + GR * 0.92;
    const um = clamp((t - tYoure + 0.25) / 0.6), uh = clamp((t - tYoure - 0.15) / 0.6);
    const Mt = V3(GIANT.x, top + 0.55, GIANT.z), Ht = V3(GIANT.x, top + 1.55, GIANT.z);
    R.mid = M1.clone().lerp(Mt, ease(um)); R.mid.y += 3.2 * Math.sin(Math.PI * um); R.midRot = lerp(-2.6, 0, ease(um));
    R.head = H1.clone().lerp(Ht, ease(uh)); R.head.y += 3.6 * Math.sin(Math.PI * uh); R.headRot = lerp(3.5, 6.283, ease(uh));
    if (uh >= 1) R.head.y += 0.06 * Math.abs(Math.sin((t - tYoure) * 3));
  }
  return R;
}
// kids conga path: queue on the far (+z) sidewalk -> across the zebra -> along the school-side sidewalk
const KP = [V3(-16, 0, 5.6), V3(-6.4, 0, 5.6), V3(-6.4, 0, -5.6), V3(-16.6, 0, -5.6)];
const KL = [0, 9.6, 9.6 + 11.2, 9.6 + 11.2 + 10.2];
function kpath(s) { s = clamp(s, 0, KL[3]); let i = 0; while (i < 2 && s > KL[i + 1]) i++; const u = (s - KL[i]) / (KL[i + 1] - KL[i]); const p = KP[i].clone().lerp(KP[i + 1], u); const d = KP[i + 1].clone().sub(KP[i]).normalize(); return { p, d }; }
const SP = 0.95, V = 3.4, tGo = tTen - 0.15;
const kidS = i => t => clamp(9.2 - i * SP + V * Math.max(0, t - tGo - i * 0.05), 0, KL[3] - i * SP);
const s9 = mono([[0, 9.2 - 9 * SP], [tGo, 9.2 - 9 * SP], [tLost - 0.1, 9.6 + 5.2], [tCarrot4 + 1.6, 9.6 + 5.2], [tShes5 + 1.6, KL[3] - 9 * SP], [99, KL[3] - 9 * SP]]);
const DET = V3(-3.05, 0, -0.35);
// sign: hand -> roof of the car
const tToss = tFor - 0.55;

// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];

const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const BEHIND = Ac([7.0, 3.3, -2.9], [-4.0, 2.2, 0.3], 40);
const FACE = Ac([0.3, 3.75, 4.6], [-4.0, 3.3, 0.5], 36);
const camKeys = [
  [0.0, t => { const x = carArrX(t); return [V3(x + 9.0, 3.4, -1.5), V3(x - 10, 0.9, -0.6), 40]; }],
  [tThe1 - 0.3, t => { const x = carArrX(t); return [V3(x + 9.0, 3.4, -1.5), V3(x - 10, 0.9, -0.6), 40]; }],
  ...cut(tThe1 - 0.25, BEHIND),
  [S('hook1').end + 0.2, Ac([6.6, 3.3, -2.8], [-4.0, 2.3, 0.4], 38)],
  ...cut(tNose - 0.25, FACE),
  [tHer2 - 0.3, Ac([0.1, 3.7, 4.4], [-4.0, 3.3, 0.5], 36)],
  ...cut(tHer2 - 0.25, Ac([0.0, 2.7, 4.3], [-4.0, 2.55, 0.5], 36)),
  [tShes - 0.3, Ac([-0.2, 2.7, 4.1], [-4.0, 2.6, 0.5], 36)],
  ...cut(tShes - 0.25, Ac([3.6, 2.8, 6.6], [-3.8, 2.1, 0.0], 40)),
  [S('hook2').end + 0.3, Ac([3.2, 2.9, 6.0], [-3.8, 2.2, 0.0], 40)],
  // wrong
  ...cut(S('wrong1').start, BEHIND),
  [tBig - 0.3, Ac([6.5, 3.3, -2.8], [-4.0, 2.3, 0.4], 38)],
  ...cut(tBig - 0.25, FACE),
  [tShe2 - 0.3, Ac([-0.7, 3.5, 3.5], [-4.0, 3.2, 0.55], 36)],
  ...cut(tShe2 - 0.25, Ac([6.0, 6.2, 10.5], [-4.0, 2.4, 0.3], 40)),
  [tHerB - 0.3, Ac([5.8, 6.0, 10.0], [-4.2, 2.0, 0.6], 40)],
  ...cut(tHerB - 0.25, Ac([-2.5, 6.8, 16.5], [-1.4, 1.8, -1.0], 40)),
  [tGulp + 0.1, Ac([-2.0, 7.5, 20.5], [-0.6, 2.8, -1.2], 40)],
  ...cut(tYoure - 0.3, Ac([11.0, 6.5, 19.5], [0.5, 5.0, -1.8], 40)),
  [tRew0, Ac([10.0, 6.6, 18.5], [0.5, 5.0, -1.8], 40)],
  // right
  ...cut(tRew1, Ac([5.5, 6.5, -6.5], [-3.0, 0.6, -0.8], 40)),
  [tShes2 - 0.3, Ac([5.2, 6.4, -6.2], [-3.2, 0.7, -0.6], 40)],
  ...cut(tShes2 - 0.25, Ac([-1.0, 3.0, -7.0], [-7.5, 1.4, 4.2], 40)),
  [S('right2').end + 0.2, Ac([-1.3, 3.0, -7.0], [-7.5, 1.2, 4.0], 40)],
  ...cut(tTen - 0.15, Ac([2.0, 5.6, -10.5], [-6.0, 0.6, 0.8], 40)),
  [tSmallest - 0.3, Ac([1.6, 5.3, -10.0], [-6.0, 0.5, 0.2], 40)],
  ...cut(tSmallest - 0.25, Ac([-8.6, 1.8, -3.9], [-6.4, 0.7, 0.4], 38)),
  [tSo4 - 0.45, Ac([-8.4, 1.8, -3.8], [-6.2, 0.7, 0.3], 38)],
  ...cut(tSo4 - 0.4, Ac([-0.2, 1.7, 1.9], [-2.6, 0.8, -0.5], 40)),
  [tGlove + 0.5, Ac([-0.1, 1.7, 2.0], [-2.5, 0.85, -0.5], 40)],
  ...cut(tShes5 - 0.15, Ac([2.6, 3.9, 8.8], [-3.8, 3.3, 0.0], 40)),
  [tReal - 0.2, Ac([2.4, 4.0, 8.6], [-3.8, 3.4, 0.0], 40)],
  ...cut(tReal - 0.15, Ac([7.0, 6.0, -9.5], [-1.8, 3.6, -0.6], 40)),
  [S('right5').end + 0.2, Ac([6.6, 5.6, -9.0], [-0.6, 3.0, -1.4], 40)],
  ...cut(tSweet - 0.15, Ac([-15.5, 3.9, -12.0], [-5.0, 1.4, -2.4], 40)),
  [TOTAL, Ac([-21.0, 4.3, -12.5], [-12.5, 1.7, -2.4], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), YAX = V3(0, 1, 0);
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  // car
  let cx = carArrX(t); if (right && t > tSweet - 0.3) cx = carDriveX(t);
  placeCar(hero, { x: cx, z: CAR_Z, h: Math.PI / 2 });
  const honkShake = !right ? win(t, tHonk - 0.05, tHurry, 0.05) * 0.03 * Math.sin(t * 50) : 0;
  hero.userData.bodyG.position.y += honkShake;
  hero.userData.hl.emissiveIntensity = (!right && t > tGulp) ? 2.2 : (!right ? 0.35 + 1.4 * win(t, tHonk - 0.05, tHurry + 0.2, 0.05) : 0.35);
  blink(hero, t, false, false);
  hero.updateMatrixWorld(true);
  // lady
  const walking = t < tSteps + 0.7 && t > tThe1 - 0.1;
  const hop = walking ? 0.22 * Math.abs(Math.sin((t - tThe1) * 7.5)) : 0;
  const yawWalk = walking ? Math.PI / 2 * (1 - ramp(t, tSteps + 0.2, tSteps + 0.8)) : 0;
  let parts;
  if (!right) parts = partsWrong(t);
  else { const b = V3(LADY_P.x, 0, LADY_P.z); const hj = 0.7 * win(t, tHappy - 0.1, tFlips + 0.3, 0.15) * Math.abs(Math.sin((t - tHappy) * 7)) + 0.25 * win(t, tSweet, TOTAL + 1, 0.4) * Math.abs(Math.sin(t * 5));
    parts = { bot: b.clone().add(V3(0, 0.85 + hj, 0)), mid: b.clone().add(V3(0, 2.2 + hj, 0)), head: b.clone().add(V3(0, 3.2 + hj, 0)), botR: 0.95, botSpin: 0, botAxis: V3(0, 0, 1), midRot: 0, headRot: 0, giant: 0 }; }
  if (walking) { parts.bot.y += hop; parts.mid.y += hop; parts.head.y += hop; }
  const yaw = yawWalk;
  LB.position.copy(parts.bot); LB.scale.set(parts.botR / 0.95 * (parts.giant > 0 ? lerp(1, 1.12, parts.giant) : 1), parts.botR / 0.95 * 0.92, parts.botR / 0.95);
  LB.quaternion.setFromAxisAngle(YAX, yaw); if (parts.botSpin) { _q.setFromAxisAngle(parts.botAxis, parts.botSpin); LB.quaternion.premultiply(_q); }
  LADY.botBtn.visible = parts.giant < 0.05;
  LM.position.copy(parts.mid); LM.rotation.set(0, yaw, parts.midRot, 'YXZ');
  // head: turns to look back at the class (right2), tilt for fear
  const lookBack = right ? win(t, tShes2 - 0.2, tTen + 0.4, 0.3) : 0;
  const lookKid = right ? win(t, tSmallest - 0.2, tCarrot4 + 0.6, 0.3) : 0;
  LH.position.copy(parts.head); LH.rotation.set(0, yaw + 1.0 * lookBack - 0.35 * lookKid, parts.headRot + 0.08 * Math.sin(t * 1.7), 'YXZ');
  // face
  const scared = !right ? Math.max(win(t, tHonk, tFalls + 0.3, 0.12), 0) : 0;
  const smile = right ? 1 : (t > tYoure + 0.3 ? 1 : 1 - 2 * win(t, tHonk, tGulp, 0.15));
  setMouth(LADY.mouth, 0.52, smile, scared);
  LADY.oMouth.visible = scared > 0.5; LADY.oMouth.scale.setScalar(1 + 0.3 * scared);
  const blinkL = (t % 3.7) < 0.12 ? 0.15 : 1;
  LADY.eyes.forEach(E => { const sc = 1 + 0.5 * scared; E.e.scale.set(sc, sc * blinkL, sc); E.hl.visible = blinkL > 0.5; E.brow.position.y = 0.27 + 0.08 * scared - 0.03 * (right ? win(t, tHappy, tSign5, 0.2) : 0); E.brow.rotation.x = E.s * (0.25 * scared - 0.15 * (1 - scared)); });
  // arms: sign arm (s=-1) raised; other arm waves
  LADY.arms.forEach(A => { let lift = A.s < 0 ? 0.55 : 0.2; let sw = 0;
    if (A.s > 0) { if (walking) sw = 0.25 * Math.sin(t * 7.5); if (right && t > tSweet) { lift = 1.0; sw = 0.45 * Math.sin(t * 9); } if (!right && t > tYoure + 0.4) { lift = 0.9; sw = 0.4 * Math.sin(t * 8); } if (scared > 0.3) { lift = 1.2; sw = 0.2 * Math.sin(t * 30); } if (right && t > tShes2 && t < tTen + 0.5) { lift = 0.9; sw = 0.5 * Math.sin(t * 6); } }
    else { if (scared > 0.3) lift = 1.1; if (right && t > tToss) lift = lerp(0.55, 1.1, win(t, tToss, tToss + 0.9, 0.3)); }
    A.piv.rotation.set(A.s * (Math.PI / 2 - lift), sw, 0); });
  LM.updateMatrixWorld(true);
  // sign
  { const hand = LADY.arms[0].hand.getWorldPosition(V3()); const inHandP = hand.clone().add(V3(0, -0.85, 0));
    _q.setFromEuler(new THREE.Euler(0, yaw, 0)); if (!right) { const fallTilt = t > tFalls - 0.05 ? parts.midRot * 0.6 : 0; _q.multiply(_q2.setFromEuler(new THREE.Euler(0, 0, fallTilt + 0.06 * Math.sin(t * 1.3)))); }
    let flip = right ? Math.PI * ease(clamp((t - tFlips + 0.05) / 0.5)) + Math.PI * 2 * ease(clamp((t - tFlips + 0.05) / 0.5)) : 0;
    if (right) _q.multiply(_q2.setFromAxisAngle(YAX, flip));
    sign.position.copy(inHandP); sign.quaternion.copy(_q);
    if (right && t > tToss) { const u = clamp((t - tToss) / 0.75); const roof = hero.localToWorld(V3(0, 1.45, 0.25)); const q = new THREE.Quaternion().setFromAxisAngle(YAX, -Math.PI / 2);
      sign.position.lerpVectors(inHandP, roof, ease(u)); sign.position.y += 1.6 * Math.sin(Math.PI * u); sign.quaternion.slerp(q, ease(u)); if (u >= 1) { sign.position.copy(roof); sign.quaternion.copy(q); sign.rotateZ(0.05 * Math.sin(t * 6)); } } }
  // kids
  KIDS.forEach((K, i) => { K.g.visible = right && t > tRew1 - 0.1;
    if (!K.g.visible) return;
    let s = i === 9 ? s9(t) : kidS(i)(t); const kp = kpath(s); let p = kp.p.clone(); const dsdt = i === 9 ? (s9(t + 0.05) - s9(t - 0.05)) * 10 : (kidS(i)(t + 0.05) - kidS(i)(t - 0.05)) * 10;
    let moving = Math.abs(dsdt) > 0.2; let fwd = kp.d.clone();
    if (i === 9) { const w = win(t, tSo4 - 0.45, tCarrot4 + 1.65, 0.45); if (w > 0) { const prev = p.clone(); p.lerp(DET, w); const ww = (win(t + 0.05, tSo4 - 0.45, tCarrot4 + 1.65, 0.45) - win(t - 0.05, tSo4 - 0.45, tCarrot4 + 1.65, 0.45)); if (Math.abs(ww) > 0.01) { moving = true; fwd = DET.clone().sub(prev).multiplyScalar(Math.sign(ww)).normalize(); } } }
    const hopY = moving ? 0.32 * Math.abs(Math.sin(t * 9 + i * 0.7)) : 0.04 * Math.abs(Math.sin(t * 3 + i));
    K.g.position.set(p.x, hopY, p.z);
    let yawK; if (moving) yawK = Math.atan2(-fwd.z, fwd.x); else if (s > KL[2] + 0.2) yawK = 2.0; else if (i === 9 && t > tSo4 - 0.5 && t < tCarrot4 + 1.2) { const wv = hero.localToWorld(V3(-0.95, 1.1, -0.3)); yawK = Math.atan2(-(wv.z - p.z), wv.x - p.x); } else yawK = Math.atan2(-kp.d.z, kp.d.x);
    K.g.rotation.set(0, yawK, moving ? 0.12 * Math.sin(t * 9 + i * 0.7) : 0);
    const sad = i === 9 ? win(t, tSmallest - 0.4, tCarrot4 + 0.35, 0.2) : 0;
    setMouth(K.mouth, 0.24, 1 - 2 * sad, 0);
    if (i === 9) K.nose.visible = t > tCarrot4 + 0.3;
    const waving = s > KL[2] + 0.2 && t > tSweet - 0.4; const wave2 = i === 9 && t > tCarrot4 + 0.35 && t < tCarrot4 + 1.3;
    K.arms.forEach(A => { const up = (waving || (wave2 && A.s > 0)) ? 1.15 : 0.25; const sw = (waving || (wave2 && A.s > 0)) ? 0.5 * Math.sin(t * 10 + i) : (moving ? 0.3 * Math.sin(t * 9 + i) : 0); A.piv.rotation.set(A.s * (Math.PI / 2 - up), sw, 0); });
    K.head.rotation.z = 0.15 * sad; });
  // glove + spare carrot (right4)
  const gOn = right ? win(t, tHand - 0.35, tCarrot4 + 0.55, 0.25) : 0; glove.visible = gOn > 0.02;
  const k9 = KIDS[9]; k9.g.updateMatrixWorld(true); const noseW = k9.head.localToWorld(V3(0.34, -0.01, 0));
  spare.visible = right && t > tHand - 0.3 && t < tCarrot4 + 0.32;
  if (glove.visible) { const win0 = hero.localToWorld(V3(-1.15, 1.15, -0.35)); const tgt = noseW.clone().add(V3(0.32, -0.02, 0.05)); const u = ease(clamp((t - tHand + 0.1) / (tCarrot4 - tHand + 0.1)));
    glove.position.lerpVectors(win0, tgt, u); glove.rotation.set(0, 0, Math.PI / 2 + 0.3); glove.scale.setScalar(gOn * 1.0);
    GL.f.forEach(f => f.rotation.x = 1.0); GL.th.rotation.x = 0.6; }
  if (spare.visible) { spare.position.copy(glove.position).add(V3(-0.2, 0.05, 0)); spare.rotation.set(0, 0, Math.PI / 2); spare.scale.setScalar(1.0); if (t > tCarrot4 + 0.05) { const u = clamp((t - tCarrot4 - 0.05) / 0.25); spare.position.lerp(noseW, u); } }
  // snow puffs: lady falls apart, giant ball, kids hopping
  if (!right) { const dt = t - tFalls; if (dt > 0 && dt < 0.9) for (let k = 0; k < 18; k++) { const ph = clamp(dt * 1.5 - hash(k) * 0.2); const d = V3(hash(k + 3) - 0.5, hash(k + 5) * 0.6, hash(k + 7) - 0.5).normalize(); puff(V3(LADY_P.x, 1.2, LADY_P.z).addScaledVector(d, ph * 2.2), 0.4 + ph * 1.2, 0.8 * (1 - ph)); }
    if (t > tRolls && t < tGulp + 0.4) for (let k = 0; k < 14; k++) { const ph = ((t * 2.2 + hash(k)) % 1); puff(LB.position.clone().add(V3((hash(k + 1) - 0.5) * parts.botR * 1.6, 0.15 + ph * 0.6, (hash(k + 2) - 0.5) * parts.botR * 1.6)), 0.3 + parts.botR * 0.35 * ph, 0.7 * (1 - ph)); }
    const dg = t - tGulp; if (dg > -0.05 && dg < 0.8) for (let k = 0; k < 24; k++) { const ph = clamp(dg * 1.6 - hash(k + 50) * 0.2); const d = V3(hash(k + 13) - 0.5, hash(k + 15) * 0.5 + 0.1, hash(k + 17) - 0.5).normalize(); puff(GIANT.clone().add(V3(0, -1.5, 0)).addScaledVector(d, 3.0 + ph * 2.5), 0.6 + ph * 1.6, 0.85 * (1 - ph)); } }
  else { KIDS.forEach((K, i) => { if (!K.g.visible) return; const h = K.g.position.y; if (h < 0.05 && i % 2 === 0 && Math.abs(Math.sin(t * 9 + i * 0.7)) < 0.15) puff(K.g.position.clone().add(V3(0, 0.08, 0)), 0.35, 0.5); }); }
  // falling snow (deterministic)
  const cpos = cam(t).p;
  for (let i = 0; i < NSN; i++) { const bx = (hash(i * 3) - 0.5) * 50, bz = (hash(i * 3 + 1) - 0.5) * 50, by = hash(i * 3 + 2) * 16; let y = (by - 1.1 * t) % 16; if (y < 0) y += 16;
    snowPos[i * 3] = cpos.x + bx + 0.4 * Math.sin(t * 0.8 + i); snowPos[i * 3 + 1] = y; snowPos[i * 3 + 2] = cpos.z + bz + 0.4 * Math.cos(t * 0.7 + i * 1.3); }
  snowGeo.attributes.position.needsUpdate = true;
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? Math.max(win(t, tGulp - 0.05, tGulp + 0.45, 0.05), win(t, tFalls - 0.05, tFalls + 0.35, 0.05) * 0.5) : 0;
  applyCam(c, t, shk > 0.02 ? 0.07 * shk : 0);
  camera.updateMatrixWorld(true);
  LH.updateMatrixWorld(true);
  screen = { head: project(LH.localToWorld(V3(0, 0.9, 0))), car: project(hero.localToWorld(V3(0, 1.8, 0))), kid: project(KIDS[9].head.localToWorld(V3(0, 0.45, 0))), giant: project(V3(GIANT.x, GIANT.y + GR + 2.6, GIANT.z)) };
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
    P_('SCHOOL ZONE', '#f57c00', tSchool - 0.1, tThe1 - 0.1, 62, iconWarn);
    P_('LOLLIPOP LADY', '#455a64', tThe1 - 0.1, tBut - 0.1, 62);
    P_('NOSE: CARROT', '#ef6c00', tCarrot - 0.15, tHer2 - 0.1, 62);
    P_('BUTTONS: COAL', '#37474f', tButtons - 0.1, tShes - 0.1, 62);
    P_('LOLLIPOP LADY = SNOWMAN', '#0288d1', tSnowman - 0.15, S('hook2').end + 0.3, 50);
    P_('HONK TO HURRY HER', RED, tHonk - 0.1, S('wrong1').end + 0.3, 58, iconWarn);
    floatText('HONK! HONK!', 540, 880, t, tHonk, tHonk + 1.0, 110, YEL, -0.08);
    P_('SNOWMEN SCARE EASILY', RED, tSnowmen - 0.1, tJumps - 0.1, 54, iconWarn);
    floatText('EEEK!', 540, 700, t, tJumps - 0.05, tJumps + 0.8, 130, '#fff', 0.08);
    P_('FALLEN APART', RED, tFalls - 0.1, S('wrong2').end + 0.3, 62, iconX);
    P_('ROLLING SNOWBALL', RED, tRolls - 0.1, tBigger - 0.1, 60, iconWarn);
    floatText('BIGGER...', 330, 780, t, tBigger, tBigger + 0.8, 90, '#fff', -0.1); floatText('AND BIGGER!', 700, 900, t, tBigger2, tBigger2 + 0.8, 100, YEL, 0.08);
    floatText('GULP!', 540, 760, t, tGulp, tGulp + 0.9, 160, YEL, -0.06);
    P_("YOU'RE THE SNOWMAN NOW", RED, tYoure - 0.1, tUntil - 0.1, 52, iconX);
    P_('PARKED UNTIL: SPRING', RED, tUntil - 0.1, tRew0, 54, iconX);
  } else {
    P_('STOP AT THE LINE', GREEN, tStop - 0.1, tWait - 0.1, 60, iconCheck);
    P_('...AND WAIT', '#455a64', tWait - 0.1, tShes2 - 0.1, 62);
    P_('A VERY SPECIAL CLASS', '#8e24aa', tShes2 - 0.1, S('right2').end + 0.3, 54);
    P_('10 LITTLE SNOWMEN', '#0288d1', tTen - 0.1, S('right3').end + 0.2, 60);
    floatText('HOP!', 300, 820, t, tHopping, tHopping + 0.7, 100, '#fff', -0.12); floatText('HOP!', 760, 760, t, tOne1, tOne1 + 0.7, 100, YEL, 0.1);
    P_('NO NOSE!', RED, tLost - 0.1, tSo4 - 0.1, 62, iconWarn);
    P_('SPARE CARROT FROM THE GLOVEBOX', '#ef6c00', tSo4 - 0.1, S('right4').end + 0.3, 44, iconHeart);
    bubble('THANK YOU!', screen.kid, t, tCarrot4 + 0.4, S('right4').end + 0.2, 52, '#fff', '#111', -60);
    P_('SIGN FLIP', '#8e24aa', tFlips - 0.1, tReal - 0.15, 62);
    P_('A REAL LOLLIPOP', '#e91e63', tReal - 0.15, tFor - 0.1, 60, iconHeart);
    P_('FOR YOU!', '#e91e63', tFor - 0.1, S('right5').end + 0.3, 62, iconHeart);
    P_('SWEET RIDE HOME', GREEN, tSweet - 0.1, tAnd6 - 0.1, 60, iconCheck);
    P_('10 TINY SNOWMEN WAVING', '#0288d1', tAnd6 - 0.1, S('right7').start - 0.1, 50, iconHeart);
  }
}
window.dbg = { partsWrong };
start(update, hud);
