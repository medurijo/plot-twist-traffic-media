// Episode 44: Tunnel – a dragon is sleeping in the tunnel, every snore is a fireball
// hook (old style): mountain road, one little tunnel, a very loud snore from inside -> a dragon sleeps in the tunnel, every snore is a fireball
// wrong: honk to wake it up -> nobody likes being woken up -> one grumpy yawn (fire) = toasted car -> grabs the nearest teddy bear (your car),
//        cuddles it and goes back to sleep for a hundred years
// right: engine off, lights off, fluffy socks on all four wheels -> tiptoe past its nose between two snores -> it wakes up: radio on,
//        lullaby station -> it smiles, snuggles in, snores heart-shaped smoke rings -> tunnel clear, socks only slightly toasted
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tMount = WT('hook1', 'Mountain'), tOneH = WT('hook1', 'One'), tTunnelH = WT('hook1', 'tunnel'), tAndH1 = WT('hook1', 'And'), tInside = WT('hook1', 'inside'), tLoud = WT('hook1', 'loud'), tSnoreH = WT('hook1', 'snore');
const tDragon = WT('hook2', 'dragon'), tSleeping = WT('hook2', 'sleeping'), tAndH2 = WT('hook2', 'And'), tEvery = WT('hook2', 'every'), tFireball = WT('hook2', 'fireball'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tHonk = WT('wrong1', 'honk'), tWake = WT('wrong1', 'Wake'), tMove = WT('wrong1', 'move'), tRightQ = WT('wrong1', 'Right');
const tBig = WT('wrong2', 'Big'), tNobody = WT('wrong2', 'Nobody'), tWoken = WT('wrong2', 'woken'), tEsp = WT('wrong2', 'Especially'), tDragonW = WT('wrong2', 'dragon');
const tOne3 = WT('wrong3', 'One'), tGrumpy = WT('wrong3', 'grumpy'), tYawn = WT('wrong3', 'yawn'), tToast = WT('wrong3', 'toast'), tThen = WT('wrong3', 'Then'), tGrabs = WT('wrong3', 'grabs'), tTeddy = WT('wrong3', 'teddy'),
  tYourCar = WT('wrong3', 'Your', 1), tGoes = WT('wrong3', 'goes'), tSleep = WT('wrong3', 'sleep'), tFor = WT('wrong3', 'For'), tHundred = WT('wrong3', 'hundred'), tYears = WT('wrong3', 'years');
const tEngine = WT('right2', 'Engine'), tLights = WT('right2', 'Lights'), tAnd2 = WT('right2', 'And'), tFluffy = WT('right2', 'fluffy'), tSocks = WT('right2', 'socks'), tFour = WT('right2', 'four'), tWheels = WT('right2', 'wheels');
const tNow = WT('right3', 'Now'), tTiptoe = WT('right3', 'tiptoe'), tPast = WT('right3', 'past'), tNose = WT('right3', 'nose'), tRight3 = WT('right3', 'Right'), tBetween = WT('right3', 'between'), tSnores3 = WT('right3', 'snores');
const tUhoh = WT('right4', 'Uh'), tWaking = WT('right4', 'waking'), tQuick = WT('right4', 'Quick'), tRadio = WT('right4', 'radio'), tLullaby = WT('right4', 'Lullaby'), tStation = WT('right4', 'station');
const tSmiles = WT('right5', 'smiles'), tSnuggles = WT('right5', 'snuggles'), tSnoresOut = WT('right5', 'snores'), tHeart = WT('right5', 'heart'), tRings = WT('right5', 'rings');
const tTunnel6 = WT('right6', 'Tunnel'), tClear = WT('right6', 'clear'), tSocks6 = WT('right6', 'Socks'), tToasted = WT('right6', 'toasted');
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

// ---------------- world: mountain road + tunnel ----------------
const TL0 = 0, TL1 = -50;            // tunnel portal z (entrance / exit)
const TW = 4.6, TWALL = 3.4;         // half width, straight wall height (arch radius = TW)
makeLandscape({ avoid: (x, z) => Math.abs(x) < 17 || (Math.abs(x) < 75 && z < 12 && z > -75), fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 10 || (Math.abs(x) - w / 2 < 70 && z - d / 2 < 10 && z + d / 2 > -75), near: [0, 40, 160, 120], trees: 1300, seed: 449 });
plane(-3.5, 3.5, -400, 400, asphaltMat, 0.05, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -300; z < 300; z += 7) dl.push([0, 0.07, z]); instanced(g, markMat, dl, false);
  const eg = new THREE.PlaneGeometry(0.14, 800); eg.rotateX(-Math.PI / 2); instanced(eg, markMat, [[3.25, 0.07, 0], [-3.25, 0.07, 0]], false); }
// arch shape (portal opening)
const archShape = (w, hw, r) => { const s = new THREE.Shape(); s.moveTo(-w, 0); s.lineTo(-w, hw); s.absarc(0, hw, r, Math.PI, 0, true); s.lineTo(w, 0); s.lineTo(-w, 0); return s; };
const stoneT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#6a6259'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 12; r++) for (let k = 0; k < 7; k++) { const x = k * 76 + (r % 2) * 38 - 20, y = r * 44; const v = 125 + Math.random() * 50 | 0; c.fillStyle = `rgb(${v + 8},${v},${v - 10})`; rr(x + 3, y + 3, 70, 38, 8); c.fill(); }
 }, true);
stoneT.repeat.set(0.16, 0.16);
const facadeMat = STD('#ffffff', { map: stoneT, roughness: 0.9 });
for (const [zf, rot] of [[TL0, 0], [TL1, Math.PI]]) {
  const sh = new THREE.Shape(); sh.moveTo(-10, -0.2); sh.lineTo(-TW, -0.2); sh.lineTo(-TW, TWALL); sh.absarc(0, TWALL, TW, Math.PI, 0, true); sh.lineTo(TW, -0.2); sh.lineTo(10, -0.2); sh.lineTo(10, 10.5); sh.lineTo(-10, 10.5); sh.lineTo(-10, -0.2);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 2.0, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 2, curveSegments: 24 });
  const m = new THREE.Mesh(g, facadeMat); m.castShadow = m.receiveShadow = true;
  const grp = new THREE.Group(); grp.position.set(0, 0, zf); grp.rotation.y = rot; scene.add(grp); m.position.z = -2.0; grp.add(m);
  // keystone ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(TW + 0.35, 0.38, 8, 40, Math.PI), STD('#7d756b', { roughness: 0.85 })); ring.position.set(0, TWALL, 0.15); ring.castShadow = true; grp.add(ring);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.76, TWALL, 0.76), STD('#7d756b', { roughness: 0.85 })); p.position.set(s * (TW + 0.35), TWALL / 2, 0.15); p.castShadow = true; grp.add(p); }
  // name plate
  const plT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#1565c0'; rr(0, 0, w, h, 18); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 8; rr(8, 8, w - 16, h - 16, 12); c.stroke(); c.fillStyle = '#fff'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DRACHENBERG', w / 2, h / 2 + 4); });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.25), new THREE.MeshStandardMaterial({ map: plT, roughness: 0.4 })); pl.position.set(0, 9.0, 0.25); if (zf !== TL0) grp.add(pl);
}
// tunnel interior (inside of an extruded arch, back faces)
{ const g = new THREE.ExtrudeGeometry(archShape(TW, TWALL, TW), { depth: TL0 - TL1, bevelEnabled: false, curveSegments: 24 });
  const m = new THREE.Mesh(g, STD('#3b3936', { side: THREE.BackSide, roughness: 0.9 })); m.position.z = TL1; m.receiveShadow = true; scene.add(m);
  const lamps = []; for (let z = TL0 - 3; z > TL1 + 2; z -= 4) lamps.push([0, TWALL + TW - 0.25, z]);
  instanced(new THREE.BoxGeometry(0.3, 0.08, 0.9), new THREE.MeshBasicMaterial({ color: '#d9a35a' }), lamps, false); }
// mountain: blobs around the tunnel corridor
{ const R = rng(4491); const list = []; const cols = ['#6f9a4a', '#5f8c40', '#7ea457', '#8d8a80', '#7b786f', '#679444'];
  const hgt = (x, z) => 34 * Math.exp(-(x * x) / (46 * 46) - ((z + 25) * (z + 25)) / (30 * 30)) + 2;
  let tries = 0;
  while (list.length < 520 && tries < 20000) { tries++;
    const x = (R() - 0.5) * 150, z = -25 + (R() - 0.5) * 80, r = 4 + R() * 7; const y = hgt(x, z) - r * 0.55;
    if (y + r < 1) continue;
    // keep the corridor + portal fronts free
    if (Math.abs(x) - r < TW + 0.9 && y - r < TWALL + TW + 1.2 && z + r > TL1 - 3 && z - r < TL0 + 3) continue;
    if (Math.abs(x) - r < 10.5 && (z + r > TL0 - 1.6 || z - r < TL1 + 1.6) && y - r < 10.6) continue;
    if (z + r > TL0 + 1.5 && Math.abs(x) < 30) continue; if (z - r < TL1 - 1.5 && Math.abs(x) < 30) continue;
    list.push([x, y, z, r]); }
  const geo = new THREE.IcosahedronGeometry(1, 2); const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), list.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  list.forEach(([x, y, z, r], i) => { e.set(R() * 3, R() * 3, 0); q.setFromEuler(e); m4.compose(V3(x, y, z), q, V3(r * (1 + R() * 0.3), r * (0.8 + R() * 0.3), r)); mesh.setMatrixAt(i, m4); mesh.setColorAt(i, new THREE.Color(cols[(R() * cols.length) | 0])); });
  mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  // pines on the slopes
  const pines = []; for (let k = 0; k < 160; k++) { const x = (R() - 0.5) * 120, z = -25 + (R() - 0.5) * 70; const y = hgt(x, z) - 1.5; if (Math.abs(x) < 12 && (z > -6 || z < -44)) continue; if (y < 4) continue; pines.push([x, y, z]); }
  const pg = new THREE.ConeGeometry(1.6, 4.6, 7); pg.translate(0, 2.3, 0); const pm = new THREE.InstancedMesh(pg, new THREE.MeshLambertMaterial({ color: '#2f6b2a', flatShading: true }), pines.length);
  pines.forEach(([x, y, z], i) => { const s = 0.8 + R() * 0.8; m4.compose(V3(x, y, z), q.identity(), V3(s, s, s)); pm.setMatrixAt(i, m4); }); pm.castShadow = true; scene.add(pm);
  // a snowy cap
  const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(9, 2), new THREE.MeshLambertMaterial({ color: '#f4f6f8', flatShading: true })); cap.position.set(0, 33, -26); cap.scale.set(1.3, 0.55, 1.1); scene.add(cap); }

// ---------------- hero car + socks ----------------
const hero = makeCar('#e53935');
const bodyMat0 = hero.userData.body;
const sootMat = STD('#2b2522', { roughness: 0.95, metalness: 0.0 });
const sockT = (burnt) => canvasTex(256, 256, (c, w, h) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#ff6fb0'; c.fillRect(0, k * 32, w, 32); }
  for (let k = 0; k < 900; k++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 4); }
  if (burnt) for (let k = 0; k < 14; k++) { const g = c.createRadialGradient(0, 0, 2, 0, 0, 30); const x = Math.random() * w, y = Math.random() * h; c.save(); c.translate(x, y); g.addColorStop(0, 'rgba(30,20,15,0.85)'); g.addColorStop(1, 'rgba(30,20,15,0)'); c.fillStyle = g; c.fillRect(-30, -30, 60, 60); c.restore(); } });
const sockMat = STD('#ffffff', { map: sockT(false), roughness: 1 }), sockBurnt = STD('#ffffff', { map: sockT(true), roughness: 1 });
const socks = hero.userData.wheels.map((w, i) => { const g = new THREE.Group(); hero.add(g);
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), sockMat); s.scale.set(0.62, 1.0, 1.08); g.add(s);
  const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 18), STD('#ffffff', { roughness: 1 })); cuff.rotation.x = Math.PI / 2; cuff.position.y = 0.42; g.add(cuff);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), STD('#ff3d8b', { roughness: 1 })); pom.position.set(Math.sign(w.position.x) * 0.3, 0.12, -0.15); g.add(pom);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.userData.s = s; return g; });

// ---------------- particles (fire additive, smoke) ----------------
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const FP = Array.from({ length: 520 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); return s; });
const SPR = Array.from({ length: 240 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#9e9e9e' })); s.visible = false; scene.add(s); return s; });
let fi = 0, si = 0;
const C1 = new THREE.Color('#fff6c0'), C2 = new THREE.Color('#ffb020'), C3 = new THREE.Color('#ff4a10'), C4 = new THREE.Color('#6a0a00'), _c = new THREE.Color();
const fireCol = a => a < 0.3 ? _c.copy(C1).lerp(C2, a / 0.3) : a < 0.7 ? _c.copy(C2).lerp(C3, (a - 0.3) / 0.4) : _c.copy(C3).lerp(C4, (a - 0.7) / 0.3);
function fire(p, size, a, alpha = 1) { const s = FP[fi++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.copy(fireCol(a)); s.material.opacity = alpha * (1 - a * a); }
function smoke(p, size, alpha, col = '#9e9e9e') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }
function jet(t, t0, t1, from, to, { rate = 60, life = 0.45, s0 = 0.25, s1 = 1.1, spread = 0.5, seed = 0, rise = 0.6, alpha = 1 } = {}) {
  if (t < t0) return; const d = to.clone().sub(from);
  const kA = Math.max(0, Math.floor((t - life - t0) * rate)), kB = Math.floor((Math.min(t, t1) - t0) * rate);
  for (let k = kA; k <= kB; k++) { const tb = t0 + k / rate, age = (t - tb) / life; if (age < 0 || age > 1) continue;
    const j = V3(hash(k * 3 + seed) - 0.5, hash(k * 3 + 1 + seed) - 0.5, hash(k * 3 + 2 + seed) - 0.5).multiplyScalar(spread * age * 2);
    const p = from.clone().addScaledVector(d, Math.pow(age, 0.8)).add(j); p.y += rise * age * age; fire(p, lerp(s0, s1, age) * (0.8 + 0.4 * hash(k + seed + 7)), age, alpha); }
}
function puffs(t, t0, t1, from, { rate = 14, life = 1.6, s0 = 0.4, s1 = 1.6, up = 2.2, drift = V3(0, 0, 0.5), seed = 3, alpha = 0.55, col = '#8f8f8f' } = {}) {
  if (t < t0) return; const kA = Math.max(0, Math.floor((t - life - t0) * rate)), kB = Math.floor((Math.min(t, t1) - t0) * rate);
  for (let k = kA; k <= kB; k++) { const tb = t0 + k / rate, age = (t - tb) / life; if (age < 0 || age > 1) continue;
    const p = from.clone().add(V3((hash(k + seed) - 0.5) * 0.6, up * age, (hash(k + seed + 5) - 0.5) * 0.6)).addScaledVector(drift, age);
    smoke(p, lerp(s0, s1, age), alpha * (1 - age) * clamp(age * 6), col); }
}

// ---------------- dragon ----------------
const SKIN = '#33a37a', SKIN2 = '#2a8a66', BELLY = '#f2d9a2', HORN = '#f6ecd0', SPIKE = '#ff8a3d';
const skin = STD(SKIN, { roughness: 0.5 }), skin2 = STD(SKIN2, { roughness: 0.55 }), belly = STD(BELLY, { roughness: 0.6 });
const scaleT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,60,40,0.22)'; c.lineWidth = 4;
  for (let r = 0; r < 9; r++) for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(k * 32 + (r % 2) * 16, r * 30, 16, 0, Math.PI); c.stroke(); } }, true);
scaleT.repeat.set(3, 3); skin.map = scaleT; skin2.map = scaleT;
const head = new THREE.Group(); scene.add(head);   // local: forward +z (snout), up +y
const HD = {};
{ const sk = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 24), skin); sk.scale.set(1.0, 0.9, 1.05); head.add(sk);
  const sn = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), skin); sn.scale.set(1.0, 0.68, 1.75); sn.position.set(0, -0.12, 1.55); head.add(sn);
  // nostrils
  HD.nos = [-1, 1].map(s => { const n = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), STD('#123b2a')); n.scale.set(1, 0.6, 1); n.position.set(s * 0.36, 0.38, 2.9); n.rotation.x = -0.4; head.add(n); return n; });
  // brow / eyes
  HD.eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.74, 0.62, 0.62); head.add(e);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14), STD('#fffdf0', { roughness: 0.2 })); e.add(w);
    const ir = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), STD('#ffb300', { roughness: 0.2 })); ir.position.set(s * 0.06, 0.02, 0.2); e.add(ir);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), STD('#111', { roughness: 0.15 })); p.scale.set(0.55, 1.6, 0.5); p.position.set(s * 0.09, 0.03, 0.37); e.add(p);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(s * 0.02, 0.12, 0.4); e.add(hl);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.47, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), skin2); e.add(lid);
    const lid2 = new THREE.Mesh(new THREE.SphereGeometry(0.465, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), skin2); lid2.rotation.x = Math.PI; e.add(lid2); // lower lid (bottom half, mostly hidden)
    const lash = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 6, 20, Math.PI), STD('#0c2a1e')); e.add(lash);
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 4, 8), skin2); brow.rotation.z = Math.PI / 2; brow.position.set(0, 0.48, 0.12); e.add(brow);
    return { e, w, ir, p, hl, lid, lid2, lash, brow, s }; });
  // horns + ears + spikes
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.5, 12), STD(HORN, { roughness: 0.4 })); h.position.set(s * 0.6, 1.25, -0.55); h.rotation.set(-1.0, 0, -s * 0.25); head.add(h);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 4), skin2); ear.scale.set(1, 1, 0.35); ear.position.set(s * 1.15, 0.6, -0.4); ear.rotation.set(-0.5, 0, -s * 1.1); head.add(ear); }
  for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 6), STD(SPIKE, { roughness: 0.45 })); sp.position.set(0, 1.12 - k * 0.05, -0.2 - k * 0.55); sp.rotation.x = -0.5; head.add(sp); }
  // cheeks (blush)
  HD.blush = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), STD('#ff7a9a', { roughness: 0.6, transparent: true, opacity: 0 })); b.scale.set(0.3, 0.7, 1.1); b.position.set(s * 0.98, 0.0, 1.2); head.add(b); return b; });
  // smile lines on the snout sides (y-z plane arcs)
  HD.smile = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 6, 18, Math.PI * 0.75), STD('#0f3324')); m.rotation.set(0, s * Math.PI / 2, 0); m.position.set(s * 0.93, -0.32, 1.05); head.add(m); return m; });
  // lower jaw (hinged at the back of the snout)
  const jaw = new THREE.Group(); jaw.position.set(0, -0.42, 0.25); head.add(jaw); HD.jaw = jaw;
  const jm = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), belly); jm.scale.set(0.92, 0.32, 1.55); jm.position.set(0, -0.12, 1.3); jaw.add(jm);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), STD('#8e1b2b', { roughness: 0.6 })); mouth.scale.set(0.8, 0.42, 1.45); mouth.position.set(0, -0.32, 1.48); head.add(mouth); HD.mouth = mouth;
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), STD('#e05570')); tongue.scale.set(0.5, 0.16, 1.0); tongue.position.set(0, 0.04, 1.3); jaw.add(tongue);
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const th = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 6), STD('#ffffff', { roughness: 0.3 })); th.rotation.x = Math.PI; th.position.set(s * (0.62 - k * 0.06), -0.66, 0.9 + k * 0.5); head.add(th); }
  head.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
// neck chain + body + arms
const NNK = 7; const neck = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), skin, NNK); neck.castShadow = neck.receiveShadow = true; neck.frustumCulled = false; scene.add(neck);
const nspk = new THREE.InstancedMesh(new THREE.ConeGeometry(0.28, 0.7, 6), STD(SPIKE, { roughness: 0.45 }), NNK); nspk.castShadow = true; nspk.frustumCulled = false; scene.add(nspk);
const SHOULDER = V3(0.6, 3.0, -7.0);
const BODY = new THREE.Group(); scene.add(BODY);
{ const b = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), skin); b.scale.set(3.6, 3.0, 5.5); b.position.set(0.3, 3.0, -12); b.castShadow = true; BODY.add(b);
  const bb = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), belly); bb.scale.set(3.0, 2.4, 4.6); bb.position.set(0.3, 2.3, -10.6); BODY.add(bb);
  for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 6), STD(SPIKE)); sp.position.set(0.3, 5.9 - k * 0.1, -8.5 - k * 2.0); sp.rotation.x = -0.3; BODY.add(sp); }
  // folded wings tips on the back
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 4), skin2); w.scale.set(1, 1, 0.25); w.position.set(0.3 + s * 2.8, 5.0, -12); w.rotation.set(-1.2, 0, s * 0.5); w.castShadow = true; BODY.add(w); } }
const limbMat = skin;
const ARMS = [-1, 1].map(s => { const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1, 6, 14), limbMat); const lo = new THREE.Mesh(new THREE.CapsuleGeometry(0.52, 1, 6, 14), limbMat);
  const paw = new THREE.Group(); const pb = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 14), skin); pb.scale.set(1.05, 0.62, 1.15); paw.add(pb);
  const claws = []; for (let k = -1; k <= 1; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 8), STD(HORN, { roughness: 0.4 })); c.rotation.x = Math.PI / 2; c.position.set(k * 0.36, -0.12, 0.92); paw.add(c); claws.push(c); }
  [up, lo, paw].forEach(o => { scene.add(o); o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); });
  return { s, up, lo, paw }; });
const _yy = V3(0, 1, 0), _qq = new THREE.Quaternion();
function limb(mesh, a, b, r) { const d = b.clone().sub(a); const len = d.length(); mesh.position.copy(a).addScaledVector(d, 0.5); _qq.setFromUnitVectors(_yy, d.normalize()); mesh.quaternion.copy(_qq); mesh.scale.set(1, Math.max(0.05, len) / (1 + 2 * r), 1); }
// heart rings
const heartCurve = (() => { const pts = []; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; pts.push(V3(16 * Math.pow(Math.sin(a), 3) * 0.045, (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.045, 0)); } return new THREE.CatmullRomCurve3(pts, true); })();
const HR = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.TubeGeometry(heartCurve, 80, 0.1, 8, true), new THREE.MeshStandardMaterial({ color: '#ffd0de', emissive: '#ff6f9a', emissiveIntensity: 0.35, transparent: true, opacity: 0.9, roughness: 0.6 })); m.visible = false; m.userData.noAO = true; scene.add(m); return m; });

// ---------------- motion ----------------
const CX = 1.75;
// car: hook drive in + stop; wrong stays; right tiptoes around the head into the tunnel
const carZ0 = mono([[0, 62], [tOneH, 46], [tSnoreH, 24], [tDragon, 15], [tWhat, 11.2], [tWhat + 0.6, 11.0], [99, 11.0]]);
const STOPZ = 11.0;
const tipU = mono([[0, 0], [tTiptoe - 0.05, 0], [tNose + 0.4, 0.55], [tBetween, 0.78], [tSnores3 + 0.6, 1.0], [99, 1.0]]);   // around the nose to the stop beside the eye
const tipPath = u => { // from (CX, STOPZ) -> (-2.5, 6) -> (-2.6, 1.6)
  const p0 = V3(CX, 0, STOPZ), p1 = V3(-2.6, 0, 8.5), p2 = V3(-2.6, 0, 4.0), p3 = V3(-2.6, 0, 1.6);
  const a = 1 - u; return p0.clone().multiplyScalar(a * a * a).addScaledVector(p1, 3 * a * a * u).addScaledVector(p2, 3 * a * u * u).addScaledVector(p3, u * u * u); };
const inZ = mono([[0, 1.6], [tSnuggles + 0.3, 1.6], [tRings + 0.8, -9], [99, -9]]);
const exitZ = mono([[0, -44], [tTunnel6 - 0.1, -44], [tSocks6, -54], [S('right7').start, -62], [99, -62]]);
function carPose(t) {
  if (!isRight(t)) return { x: CX, z: carZ0(t), h: 0 };
  if (t >= tTunnel6 - 0.2) return { x: -1.75, z: exitZ(t), h: 0 };
  if (t > tSnuggles + 0.3) { const z = inZ(t); return { x: lerp(-2.6, -1.75, clamp((1.6 - z) / 6)), z, h: 0 }; }
  const u = tipU(t); const p = tipPath(u); const p2 = tipPath(Math.min(1, u + 0.01)); const h = u < 0.995 ? Math.atan2(-(p2.x - p.x), -(p2.z - p.z)) : 0;
  return { x: p.x, z: p.z, h: u > 0.005 ? h : 0 };
}
const tiptoe = t => isRight(t) ? win(t, tTiptoe - 0.1, tSnores3 + 0.7, 0.2) + win(t, tSnuggles + 0.2, tRings + 1.0, 0.2) + win(t, tTunnel6 - 0.3, S('right7').start, 0.2) : 0;

// dragon head pose
const R0 = V3(1.2, 1.3, 1.0);
const HUG_CAR = V3(1.25, 0, 6.2);
function headPose(t) {
  const right = isRight(t);
  let p = R0.clone(), pitch = 0.06, yaw = 0, roll = 0, jaw = 0, lid = [0, 0], grumpy = 0, smile = 0, look = 0;
  const breathe = Math.sin(t * 2.0); p.y += 0.06 * breathe;
  if (t < tDragon - 0.15) p.z -= 3.6;   // hook: still in the dark of the tunnel
  if (!right) {
    const o1 = ramp(t, tRightQ - 0.3, tRightQ + 0.35); lid[1] = o1; lid[0] = 0;
    const o2 = ramp(t, tBig - 0.1, tBig + 0.4); lid = [lerp(lid[0], 1, o2), lerp(lid[1], 1, o2)]; grumpy = Math.max(o1 * 0.8, o2);
    const up = ease(clamp((t - tNobody + 0.2) / 1.6)); p.lerp(V3(1.2, 4.4, 2.6), up); pitch = lerp(pitch, 0.42, up);
    p.x += 0.12 * up * Math.sin(t * 1.3);
    // yawn + fire
    const yo = ramp(t, tOne3 - 0.1, tYawn - 0.05), yc = ramp(t, tToast - 0.2, tToast + 0.3); jaw = yo * (1 - yc); pitch += 0.12 * yo * (1 - yc);
    // grab + cuddle
    const down = ease(clamp((t - tGoes + 0.1) / 1.0)); p.lerp(V3(1.25, 2.65, 4.1), down); pitch = lerp(pitch, 0.12, down); roll = 0.18 * down;
    const cl = ramp(t, tSleep - 0.1, tSleep + 0.5); lid = [lerp(lid[0], 0, cl), lerp(lid[1], 0, cl)]; grumpy *= 1 - ramp(t, tGoes - 0.2, tGoes + 0.4); smile = cl;
  } else {
    const wk = win(t, tWaking - 0.2, tLullaby + 0.6, 0.35); lid[0] = 0.5 * wk; look = wk;
    p.y += 0.05 * wk * Math.sin(t * 14) * win(t, tUhoh, tWaking + 0.5, 0.1);
    const sm = ramp(t, tSmiles - 0.15, tSmiles + 0.4); smile = sm;
    const sn = ramp(t, tSnuggles - 0.1, tSnuggles + 0.8); roll = -0.16 * sn + 0.05 * sn * Math.sin(t * 1.7); p.y -= 0.12 * sn; yaw = 0.1 * sn;
  }
  return { p, pitch, yaw, roll, jaw, lid, grumpy, smile, look };
}
// snore puffs: [time, strength]
const SNW = [[tSnoreH - 0.1, 1.3], [tFireball - 0.05, 1.0], [12.4, 0.5], [tYears - 0.4, 0.7], [tYears + 2.0, 0.7]];
const SNR = [[36.2, 0.6], [tTiptoe + 0.3, 1.0], [tSnores3 + 0.1, 1.0]];
const heartTimes = () => [tSnoresOut, tHeart, tRings + 0.1, S('right7').start - 0.3, S('right7').start + 1.4, S('outro').start + 1.2];

// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const CarCam = (off, look, fov = 40) => t => { const c = carPose(t); return [V3(c.x + off[0], off[1], c.z + off[2]), V3(c.x + look[0], look[1], c.z + look[2]), fov]; };
const camKeys = [
  [0.0, CarCam([3.2, 4.2, 10], [-1, 3.5, -30], 42)],
  [tOneH - 0.25, CarCam([3.0, 4.0, 10], [-1, 3.5, -30], 42)],
  ...cut(tOneH - 0.2, Ac([13, 6.5, 40], [0, 5, -2], 38)),
  [tAndH1 - 0.25, Ac([12, 6.0, 37], [0, 4.6, -2], 38)],
  ...cut(tAndH1 - 0.2, Ac([3.4, 2.4, 17], [0.2, 2.8, -3], 36)),
  [tDragon - 0.25, Ac([3.2, 2.3, 15.5], [0.2, 2.6, -3], 36)],
  ...cut(tDragon - 0.2, Ac([7.4, 4.2, 12.0], [0.9, 1.6, 1.2], 36)),
  [tAndH2 - 0.25, Ac([7.0, 4.0, 11.4], [0.9, 1.6, 1.2], 36)],
  ...cut(tAndH2 - 0.2, Ac([10.5, 2.3, 9.5], [1.0, 1.3, 4.6], 38)),
  [tWhat - 0.3, Ac([10.0, 2.3, 9.2], [1.0, 1.3, 4.8], 38)],
  ...cut(tWhat - 0.25, Ac([5.0, 4.2, 21], [0.6, 3.8, 2])),
  [S('wrong1').start - 0.1, Ac([4.8, 4.1, 20.5], [0.6, 3.8, 2])],
  // wrong
  ...cut(S('wrong1').start, Ac([4.4, 3.4, 20.0], [0.8, 1.6, 4])),
  [tHonk - 0.3, Ac([4.2, 3.3, 19.4], [0.8, 1.6, 4])],
  ...cut(tHonk - 0.25, Ac([-1.6, 2.4, 3.4], [1.9, 1.0, 11.0], 44)),
  [tRightQ - 0.3, Ac([-1.7, 2.5, 3.2], [1.9, 1.0, 11.0], 44)],
  ...cut(tRightQ - 0.25, Ac([3.4, 3.1, 9.6], [1.8, 1.9, 1.6], 32)),
  [tBig - 0.1, Ac([3.3, 3.1, 9.4], [1.8, 1.9, 1.6], 32)],
  ...cut(tNobody - 0.25, Ac([4.6, 1.5, 18.5], [1.2, 3.6, 3], 40)),
  [tEsp - 0.3, Ac([4.4, 1.5, 18.0], [1.2, 4.0, 3], 40)],
  ...cut(tEsp - 0.25, Ac([3.0, 2.6, 13.6], [1.2, 4.6, 2.8], 32)),
  [S('wrong2').end + 0.2, Ac([3.0, 2.5, 13.3], [1.2, 4.6, 2.8], 32)],
  ...cut(tOne3 - 0.2, Ac([5.0, 6.4, 22.5], [1.4, 2.8, 5.5], 42)),
  [tToast - 0.3, Ac([4.8, 6.2, 22.0], [1.4, 2.8, 5.5], 42)],
  ...cut(tToast - 0.25, Ac([6.0, 2.2, 16.0], [1.75, 1.0, 11], 38)),
  [tThen - 0.3, Ac([6.2, 2.3, 16.3], [1.75, 1.0, 11], 38)],
  ...cut(tThen - 0.25, Ac([6.0, 7.0, 23.0], [1.4, 2.4, 6.0], 44)),
  [tYourCar - 0.3, Ac([5.8, 6.8, 22.5], [1.4, 2.4, 6.0], 44)],
  ...cut(tYourCar - 0.25, Ac([7.5, 3.8, 14.5], [1.2, 1.8, 5.2], 38)),
  [tFor - 0.2, Ac([7.2, 3.8, 14.0], [1.2, 1.9, 5.0], 38)],
  [tRew0, Ac([6.5, 6.5, 24], [0.8, 2.6, 3], 40)],
  // right
  ...cut(tRew1, Ac([4.4, 3.4, 20.0], [0.8, 1.6, 4])),
  [tEngine - 0.25, Ac([4.2, 3.3, 19.6], [0.8, 1.6, 4])],
  ...cut(tEngine - 0.2, Ac([-1.2, 1.7, 4.8], [1.75, 0.9, 10.4], 38)),
  [tAnd2 - 0.25, Ac([-1.3, 1.7, 5.0], [1.75, 0.9, 10.4], 38)],
  ...cut(tAnd2 - 0.2, Ac([11.5, 1.9, 13.0], [1.75, 0.7, 11.0], 38)),
  [S('right2').end + 0.2, Ac([11.2, 1.9, 12.8], [1.75, 0.7, 11.0], 38)],
  ...cut(tNow - 0.15, Ac([4.6, 6.2, 20.5], [-0.2, 1.0, 6.0], 42)),
  [tRight3 - 0.3, Ac([4.2, 6.2, 20.0], [-0.4, 1.0, 5.5], 42)],
  ...cut(tRight3 - 0.25, Ac([-2.0, 10.5, 11.5], [-1.4, 0.6, 3.4], 40)),
  [S('right3').end + 0.2, Ac([-2.0, 10.2, 11.0], [-1.5, 0.6, 3.2], 40)],
  ...cut(tUhoh - 0.15, Ac([-3.6, 2.9, 6.6], [0.2, 2.1, 1.4], 30)),
  [tQuick - 0.25, Ac([-3.6, 2.9, 6.4], [0.2, 2.1, 1.4], 30)],
  ...cut(tQuick - 0.2, Ac([-6.8, 2.2, 6.2], [-2.4, 1.3, 1.6], 38)),
  [tLullaby - 0.3, Ac([-6.8, 2.2, 6.0], [-2.4, 1.3, 1.6], 38)],
  ...cut(tLullaby - 0.25, Ac([-4.2, 4.2, 13.0], [-1.3, 1.4, 2.0], 40)),
  [S('right4').end + 0.2, Ac([-4.0, 4.2, 12.6], [-1.3, 1.4, 2.0], 40)],
  ...cut(S('right5').start - 0.1, Ac([4.4, 2.8, 9.5], [1.0, 1.7, 1.4], 34)),
  [tSnoresOut - 0.3, Ac([4.6, 2.9, 9.8], [1.0, 1.8, 1.4], 34)],
  ...cut(tSnoresOut - 0.25, Ac([6.5, 2.6, 15], [0.6, 4.2, 2], 40)),
  [S('right5').end + 0.3, Ac([6.3, 2.8, 14.5], [0.6, 4.6, 2], 40)],
  ...cut(tTunnel6 - 0.2, Ac([4.4, 2.2, -66], [-1.4, 1.5, -51], 38)),
  [S('right7').start - 0.1, Ac([5.5, 2.6, -75], [-1.4, 0.9, -60], 36)],
  ...cut(S('right7').start, Ac([10, 5.5, 26], [0.4, 4.2, 0])),
  [S('outro').start, Ac([12, 7.5, 32], [0.4, 5.5, -2])],
  [TOTAL, Ac([14, 10, 40], [0.4, 7, -4])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _v = V3(0, 0, 0);
function update(t) {
  const right = isRight(t);
  fi = 0; si = 0; FP.forEach(s => s.visible = false); SPR.forEach(s => s.visible = false);
  // ---- dragon head ----
  const hidden = t < tDragon - 0.15; head.visible = neck.visible = nspk.visible = BODY.visible = !hidden; ARMS.forEach(A => { A.up.visible = A.lo.visible = A.paw.visible = !hidden; });
  const hp = headPose(t); head.position.copy(hp.p); head.rotation.set(hp.pitch, hp.yaw, hp.roll, 'YXZ'); head.updateMatrixWorld(true);
  HD.jaw.rotation.x = 0.85 * hp.jaw; HD.mouth.visible = hp.jaw > 0.03; HD.mouth.scale.y = 0.42 + 0.5 * hp.jaw; HD.mouth.position.y = -0.32 - 0.35 * hp.jaw;
  HD.eyes.forEach((E, k) => { const o = hp.lid[k]; E.lid.rotation.set(lerp(Math.PI / 2 + 0.05, -0.35, o), 0, E.s * 0.45 * hp.grumpy); E.lash.rotation.set(lerp(0, -Math.PI / 2 + 0.2, o) + 0.0, 0, 0); E.lash.position.set(0, lerp(0, 0.18, o), lerp(0.4, 0.2, o));
    E.lash.visible = o < 0.3; E.brow.rotation.set(0, 0, Math.PI / 2 + E.s * 0.5 * hp.grumpy); E.brow.position.y = 0.48 - 0.1 * hp.grumpy;
    const lx = hp.look * -0.25 * (k === 0 ? 1 : 0.5); E.ir.position.set(E.s * 0.06 + lx, 0.02, 0.2); E.p.position.set(E.s * 0.09 + lx * 1.4, 0.03, 0.37); E.hl.position.set(E.s * 0.02 + lx * 1.4, 0.12, 0.4); });
  HD.smile.forEach((m, k) => { m.rotation.set(0, m.rotation.y, hp.smile > 0.5 ? Math.PI * 1.12 : Math.PI * 0.12); m.visible = hp.jaw < 0.1; });
  HD.blush.forEach(b => b.material.opacity = 0.8 * hp.smile * (right ? 1 : 0.6));
  // nostril flare with breathing
  HD.nos.forEach(n => n.scale.set(1 + 0.25 * Math.max(0, Math.sin(t * 2.0)), 0.6, 1));
  // ---- neck (Bezier from the back of the skull into the tunnel) ----
  const nb = head.localToWorld(V3(0, 0.1, -1.0)); const nc = V3(lerp(nb.x, SHOULDER.x, 0.4), Math.max(nb.y, SHOULDER.y) + 0.4, lerp(nb.z, SHOULDER.z, 0.55));
  for (let i = 0; i < NNK; i++) { const u = (i + 0.5) / NNK, a = 1 - u; const p = nb.clone().multiplyScalar(a * a).addScaledVector(nc, 2 * a * u).addScaledVector(SHOULDER, u * u); const r = lerp(1.05, 1.9, u);
    neck.setMatrixAt(i, new THREE.Matrix4().compose(p, new THREE.Quaternion(), V3(r, r, r))); nspk.setMatrixAt(i, new THREE.Matrix4().compose(p.clone().add(V3(0, r * 0.95, 0)), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.4, 0, 0)), V3(1 + u, 1 + u, 1 + u))); }
  neck.instanceMatrix.needsUpdate = nspk.instanceMatrix.needsUpdate = true;
  // ---- car ----
  const cp = carPose(t);
  const grabbed = !right && t > tGrabs + 0.35;
  if (!grabbed) { placeCar(hero, { x: cp.x, z: cp.z, h: cp.h }); }
  else { const u = ease(clamp((t - tGrabs - 0.35) / 1.3)); const p = V3(CX, 0, STOPZ).lerp(HUG_CAR, u); p.y += 3.2 * Math.sin(Math.PI * u);
    hero.position.copy(p); hero.rotation.set(0.25 * Math.sin(Math.PI * u), lerp(0, Math.PI / 2, u), 0.3 * Math.sin(Math.PI * u), 'YXZ'); hero.userData.prev = null; }
  // tiptoe: body up, wheels lift in turn
  const tp = tiptoe(t); hero.userData.wheels.forEach((w, i) => { const ph = (t * 3.2 + [0, 0.5, 0.75, 0.25][i]) % 1; w.position.y = 0.34 + tp * (0.16 + 0.22 * Math.max(0, Math.sin(ph * Math.PI * 2))); });
  hero.userData.bodyG.position.y += tp * (0.24 + 0.05 * Math.sin(t * 6.4)); hero.userData.bodyG.rotation.z += tp * 0.05 * Math.sin(t * 3.2);
  const sockOn = right ? hero.userData.wheels.map((w, i) => back(clamp((t - (tSocks - 0.05 + i * 0.28)) / 0.3))) : [0, 0, 0, 0];
  socks.forEach((g, i) => { const w = hero.userData.wheels[i]; g.position.copy(w.position); g.scale.setScalar(Math.max(0.001, sockOn[i])); g.visible = sockOn[i] > 0.01; g.userData.s.material = t > tTunnel6 - 0.3 ? sockBurnt : sockMat; });
  // lights: on until 'Lights off' in the right way; off when toasted
  const lightsOn = right ? t < tLights + 0.1 : t < tYawn + 0.5; hero.userData.hl.emissiveIntensity = lightsOn ? 1.6 : 0; hero.userData.hl.color.set(lightsOn ? '#fffbe8' : '#c9c2a8');
  hero.userData.tl.emissiveIntensity = lightsOn ? 0.8 : 0.1;
  blink(hero, t, false, false);
  const toast = !right && t > tYawn + 0.7; hero.userData.bodyG.children.forEach(m => { if (m.material === bodyMat0 || m.material === sootMat) m.material = toast ? sootMat : bodyMat0; });
  // ---- arms ----
  ARMS.forEach(A => { const s = A.s; const sh = V3(SHOULDER.x + s * 2.3, 1.9, -4.2);
    let wr = V3(R0.x + s * 2.05, 0.42, 2.6), el = V3(R0.x + s * 2.5, 0.8, -1.4), pawRot = 0;
    if (t < tDragon - 0.15) { wr.z -= 4.0; el.z -= 3.0; }
    if (!right) {
      if (s > 0) { // right paw grabs the car
        const r1 = ease(clamp((t - tGrabs + 0.2) / 0.55)), r2 = ease(clamp((t - tGrabs - 0.35) / 1.3));
        const carNow = hero.position.clone(); const reach = V3(CX + 1.25, 0.9, STOPZ - 0.2); wr = wr.lerp(reach, r1); if (r2 > 0) wr = reach.clone().lerp(carNow.clone().add(V3(1.8, 0.8, 0)), r2);
        el = el.lerp(V3(4.4, 2.4, 3.0), r1);
        const hug = ease(clamp((t - tYourCar + 0.1) / 0.6)); wr.lerp(V3(HUG_CAR.x + 2.6, 0.9, HUG_CAR.z + 0.3), hug); el.lerp(V3(4.0, 1.0, 2.0), hug); pawRot = -0.9 * Math.max(r1 * (1 - hug), hug);
      } else {
        const hug = ease(clamp((t - tYourCar + 0.1) / 0.6)); wr.lerp(V3(HUG_CAR.x - 2.7, 0.9, HUG_CAR.z + 0.3), hug); el.lerp(V3(-1.6, 1.0, 2.0), hug); pawRot = 0.9 * hug;
      }
    }
    limb(A.up, sh, el, 0.62); limb(A.lo, el, wr, 0.52); A.paw.position.copy(wr); A.paw.rotation.set(0, Math.atan2(wr.x - el.x, wr.z - el.z) + pawRot, 0, 'YXZ'); });
  // ---- fire / smoke ----
  const nosL = head.localToWorld(V3(-0.36, 0.4, 3.0)), nosR = head.localToWorld(V3(0.36, 0.4, 3.0)), fwd = head.localToWorld(V3(0, 0.1, 6.0)).sub(head.localToWorld(V3(0, 0.1, 3.0)));
  const snores = right ? SNR : SNW;
  snores.forEach(([ts, k], i) => { if (t < ts - 0.05 || t > ts + 1.6) return; const len = 3.2 * k;
    for (const n of [nosL, nosR]) jet(t, ts, ts + 0.35 * k, n, n.clone().addScaledVector(fwd.clone().normalize(), len).add(V3(0, 0.6, 0)), { rate: 70, life: 0.5, s0: 0.25, s1: 0.95 * k + 0.3, spread: 0.35, seed: i * 17 + (n === nosL ? 0 : 7), rise: 0.6 });
    puffs(t, ts + 0.25, ts + 0.6, nosL.clone().addScaledVector(fwd.clone().normalize(), len * 0.8), { rate: 16, life: 1.2, s0: 0.6, s1: 1.8, up: 1.6, seed: i * 31, alpha: 0.45 }); });
  if (t < tDragon) { jet(t, tSnoreH - 0.1, tSnoreH + 0.4, V3(0.9, 1.9, -2.0), V3(0.9, 2.6, 6.0), { rate: 90, life: 0.6, s0: 0.4, s1: 1.8, spread: 0.6, seed: 77, rise: 0.5 }); }
  // ambient sleepy smoke from nostrils
  if (!(!right && t > tBig && t < tGoes)) puffs(t, 0, TOTAL, nosR.clone().add(V3(0, 0.15, 0.2)), { rate: 3, life: 2.2, s0: 0.25, s1: 0.9, up: 1.3, seed: 99, alpha: 0.3, col: '#b9b9b9' });
  if (!right) {
    // grumpy smoke while awake
    if (t > tBig && t < tOne3) { puffs(t, tBig, tOne3, nosL, { rate: 10, life: 1.2, s0: 0.3, s1: 1.1, up: 1.3, seed: 11, alpha: 0.5, col: '#6f6f6f' }); puffs(t, tBig, tOne3, nosR, { rate: 10, life: 1.2, s0: 0.3, s1: 1.1, up: 1.3, seed: 12, alpha: 0.5, col: '#6f6f6f' }); }
    // the big yawn: fire from the mouth onto the car
    const mouthP = head.localToWorld(V3(0, -0.55, 2.7)); const carC = V3(CX, 1.1, STOPZ);
    jet(t, tYawn - 0.05, tToast - 0.25, mouthP, carC.clone().add(V3(0, 0.2, 1.8)), { rate: 95, life: 0.55, s0: 0.5, s1: 2.6, spread: 1.1, seed: 5, rise: 0.4 });
    // the toasted car smokes
    if (t > tToast - 0.4) puffs(t, tToast - 0.4, 99, hero.localToWorld(V3(0, 1.5, 0)), { rate: 9, life: 1.8, s0: 0.5, s1: 1.8, up: 2.4, seed: 21, alpha: 0.5, col: '#4a4a4a' });
  } else {
    // toasted socks smoke (exit)
    if (t > tSocks6 - 0.6) for (const w of [2, 3]) puffs(t, tSocks6 - 0.6, 99, hero.localToWorld(hero.userData.wheels[w].position.clone().add(V3(0, 0.5, 0))), { rate: 6, life: 1.3, s0: 0.15, s1: 0.6, up: 1.2, seed: 40 + w, alpha: 0.5, col: '#5a5a5a' });
  }
  // ---- heart smoke rings ----
  HR.forEach(m => m.visible = false);
  if (right) heartTimes().forEach((ts, i) => { const age = (t - ts) / 3.2; if (age < 0 || age > 1) return; const m = HR[i % HR.length]; m.visible = true;
    const p = head.localToWorld(V3(0, 0.6, 3.1)).add(V3(0.25 * Math.sin(age * 5 + i), 0.4 + 4.2 * easeOut(age), 1.2 * age)); m.position.copy(p);
    const sc = lerp(0.45, 1.35, easeOut(age)); m.scale.setScalar(sc); m.rotation.set(-0.15, 0.25 * Math.sin(t * 1.4 + i), 0.12 * Math.sin(t * 2 + i)); m.material.opacity = 0.92 * (1 - age * age) * clamp(age * 8); });
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? Math.max(win(t, tSnoreH - 0.1, tSnoreH + 0.5, 0.1) * 0.6, win(t, tYawn - 0.05, tToast - 0.2, 0.1) * 0.5) : win(t, tTiptoe + 0.25, tTiptoe + 0.8, 0.1) * 0.4;
  applyCam(c, t, shk > 0.02 ? 0.05 * shk : 0);
  camera.updateMatrixWorld(true); hero.updateMatrixWorld(true);
  screen = { head: project(head.localToWorld(V3(0, 1.4, 0.4))), nose: project(head.localToWorld(V3(0, 0.6, 2.8))), car: project(hero.localToWorld(V3(0, 1.9, 0))), carF: project(hero.localToWorld(V3(0, 0.9, -2.3))), win: project(hero.localToWorld(V3(-0.9, 1.3, -0.3))) };
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
function zzz(p, t, a, b, size = 70) { if (t < a || t > b || !p || !p.ok) return; const f = win(t, a, b, 0.3);
  for (let k = 0; k < 3; k++) { const ph = ((t - a) * 0.45 + k / 3) % 1; const x = clamp(p.x, 120, W - 160) + 40 + ph * 120 + 20 * Math.sin(ph * 6 + k), y = clamp(p.y, 600, 1100) - 60 - ph * 260;
    ctx.save(); ctx.globalAlpha = f * Math.sin(Math.PI * ph); ctx.font = `900 ${size * (0.6 + 0.6 * ph)}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 12; ctx.strokeStyle = '#1b2a4a'; ctx.strokeText('Z', x, y); ctx.fillStyle = '#ffffff'; ctx.fillText('Z', x, y); ctx.restore(); } }
function honkRings(p, t, a, b) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 3; k++) { const ph = ((t - a) * 2.2 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * win(t, a, b, 0.1); ctx.strokeStyle = YEL; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(p.x, p.y, 40 + ph * 220, -2.2, -0.9); ctx.stroke(); ctx.restore(); } }
function notes(p, t, a, b) { if (t < a || t > b || !p || !p.ok) return; const f = win(t, a, b, 0.3);
  for (let k = 0; k < 6; k++) { const ph = ((t - a) * 0.5 + k / 6) % 1; const x = clamp(p.x, 100, W - 100) + 30 + ph * 300 + 40 * Math.sin(ph * 7 + k * 2), y = clamp(p.y, 500, 1150) - 30 - ph * 300;
    ctx.save(); ctx.globalAlpha = f * Math.sin(Math.PI * ph); ctx.translate(x, y); ctx.rotate(0.2 * Math.sin(t * 3 + k)); ctx.fillStyle = ['#ffd60a', '#ff6fb0', '#7fd6ff'][k % 3]; ctx.strokeStyle = '#1b2a4a'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 16, -0.4, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillRect(16, -70, 8, 70); ctx.strokeRect(16, -70, 8, 70); if (k % 2) { ctx.beginPath(); ctx.moveTo(24, -70); ctx.quadraticCurveTo(60, -50, 46, -20); ctx.lineWidth = 8; ctx.strokeStyle = ctx.fillStyle; ctx.stroke(); } ctx.restore(); } }
function yearCard(t, a, b) { if (t < a || t > b) return; const n = Math.max(1, Math.min(100, Math.round(1 + 99 * ease(clamp((t - a - 0.3) / (b - a - 1.0))))));
  pill(`SLEEPING: YEAR ${n}`, W / 2, 420, '#283593', '#fff', 56, win(t, a, b, 0.2), back((t - a) / 0.35)); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('MOUNTAIN ROAD', '#455a64', tMount - 0.1, tOneH - 0.15, 56);
    P_('ONE LITTLE TUNNEL', '#455a64', tOneH - 0.1, tAndH1 - 0.15, 56);
    P_('...SNORE?', '#5e35b1', tSnoreH - 0.1, tDragon - 0.2, 64);
    floatText('SNOOORE!', W / 2, 760, t, tSnoreH, tSnoreH + 1.0, 120, YEL, -0.08);
    P_('TUNNEL: SLEEPING DRAGON', '#2e7d32', tDragon - 0.15, tAndH2 - 0.15, 46);
    zzz(screen.head, t, tDragon, tAndH2 + 0.2);
    P_('EVERY SNORE = FIREBALL', RED, tEvery - 0.1, S('hook2').end + 0.3, 48, iconWarn);
    P_('HONK!', RED, tHonk - 0.15, tWake - 0.15, 72, iconWarn);
    honkRings(screen.carF, t, tHonk - 0.05, tWake + 0.8);
    floatText('HONK! HONK!', W / 2, 760, t, tHonk, tHonk + 1.1, 110, YEL, 0.06);
    P_('WAKE IT UP?', RED, tWake - 0.1, tRightQ - 0.15, 60, iconWarn);
    P_('ONE EYE OPENS...', '#455a64', tRightQ - 0.15, tBig - 0.1, 54);
    P_('GRUMPY DRAGON', RED, tBig - 0.1, tEsp - 0.15, 60, iconX);
    bubble('GRRRR...', screen.head, t, tWoken - 0.1, S('wrong2').end + 0.3, 60, '#fff', '#c62828', -80);
    P_('GRUMPY YAWN', RED, tOne3 - 0.1, tToast - 0.15, 60, iconX);
    P_('CAR: TOAST', RED, tToast - 0.15, tThen - 0.15, 64, iconX);
    P_('NEAREST TEDDY BEAR...', '#6d4c41', tTeddy - 0.25, tYourCar - 0.15, 50);
    P_('= YOUR CAR', RED, tYourCar - 0.15, tFor - 0.15, 62, iconX);
    yearCard(t, tFor - 0.1, tRew0);
    zzz(screen.head, t, tSleep + 0.2, tRew0);
  } else {
    P_('ENGINE OFF', '#455a64', tEngine - 0.1, tLights - 0.15, 58);
    P_('LIGHTS OFF', '#455a64', tLights - 0.15, tAnd2 - 0.1, 58);
    P_('FLUFFY SOCKS', '#d81b60', tFluffy - 0.15, S('right2').end + 0.3, 58, iconHeart);
    P_('TIPTOE...', '#5e35b1', tTiptoe - 0.15, tRight3 - 0.15, 62);
    P_('BETWEEN TWO SNORES', '#5e35b1', tRight3 - 0.15, S('right3').end + 0.3, 50);
    zzz(screen.head, t, S('right2').start, tWaking - 0.2);
    P_('UH-OH...', RED, tUhoh - 0.1, tQuick - 0.15, 64, iconWarn);
    P_('RADIO ON', '#1565c0', tRadio - 0.15, tLullaby - 0.1, 60);
    P_('LULLABY FM', '#5e35b1', tLullaby - 0.1, S('right4').end + 0.3, 60, iconHeart);
    notes(screen.win, t, tRadio, tRings + 0.6);
    P_('HAPPY DRAGON', '#2e7d32', tSmiles - 0.15, tSnoresOut - 0.15, 60, iconHeart);
    P_('HEART-SHAPED SMOKE RINGS', '#d81b60', tSnoresOut - 0.1, S('right5').end + 0.3, 44, iconHeart);
    zzz(screen.head, t, tSnuggles, tRings + 1.0);
    P_('TUNNEL CLEAR', GREEN, tTunnel6 - 0.15, tSocks6 - 0.15, 60, iconCheck);
    P_('SOCKS: SLIGHTLY TOASTED', '#e65100', tSocks6 - 0.15, S('right7').start - 0.1, 46);
    zzz(screen.head, t, S('right7').start + 0.2, TOTAL);
  }
}
window.dbg = { headPose };
start(update, hud);
