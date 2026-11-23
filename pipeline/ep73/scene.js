// Episode 68: The crash barrier comes alive – it jumps off its posts and stretches across the motorway like a rubber band
// wrong: full speed, break right through it -> it doesn't break, it stretches, further and further ->
//        it snaps back: you fly backwards like a slingshot, over two fields, head first into a haystack
// right: stop, hazard lights, wait -> the barrier is just bored (20 years standing still), it wants to play ->
//        radio on: it swings like a giant skipping rope -> hop over it, one car at a time ->
//        it lies back down on its posts, happy, straighter than ever
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeLandscape, makeCar, placeCar, applyCam, project, blink,
  YEL, GREEN, RED, BLUE, pill, rr, iconCheck, iconWarn, iconX, iconHeart, floatText, start, aoPass, hemi, sun, _m, _q, _v, _s, _c
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
const tEmpty = WT('hook1', 'Empty'), tJust = WT('hook1', 'Just'), tThen = WT('hook1', 'Then'), tStarts = WT('hook1', 'starts'), tWobble = WT('hook1', 'wobble');
const tJumps = WT('hook2', 'jumps'), tPosts = WT('hook2', 'posts'), tStretch = WT('hook2', 'stretches'), tRoad = WT('hook2', 'road'), tLikeH = WT('hook2', 'Like'), tRubber = WT('hook2', 'rubber'), tWhat = WT('hook2', 'What');
const W1 = S('wrong1').start, tMost = WT('wrong1', 'Most'), tFull = WT('wrong1', 'full'), tBreak = WT('wrong1', 'break');
const tBut = WT('wrong2', 'But'), tStretchW = WT('wrong2', 'stretches'), tF1 = WT('wrong2', 'Further'), tF2 = WT('wrong2', 'further', 1), tF3 = WT('wrong2', 'further', 2);
const tSnap = WT('wrong3', 'snaps'), tFly = WT('wrong3', 'fly'), tSling = WT('wrong3', 'slingshot'), tOver = WT('wrong3', 'Over'), tHead = WT('wrong3', 'Head'), tHay = WT('wrong3', 'haystack');
const tStop = WT('right2', 'Stop'), tHazard = WT('right2', 'Hazard'), tWait = WT('right2', 'wait');
const tBored = WT('right3', 'bored'), tTwenty = WT('right3', 'Twenty'), tStill = WT('right3', 'still'), tWants = WT('right3', 'It'), tPlay = WT('right3', 'play');
const tTurn = WT('right4', 'turn'), tRadio = WT('right4', 'radio'), tSwing = WT('right4', 'swing'), tLikeR = WT('right4', 'Like'), tRope = WT('right4', 'rope');
const tNow = WT('right5', 'Now'), tOne = WT('right5', 'One'), HOP = [0, 1, 2].map(k => WT('right5', 'Hop', k + 1) + 0.12);
const tLies = WT('right6', 'lies'), tPostsR = WT('right6', 'posts'), tHappy = WT('right6', 'Happy'), tStraight = WT('right6', 'straighter');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world ----------------
const BX = 5.6, BY = 0.58, LX = 2.0, SEC = 15;   // barrier x, beam height, lane x, half length of the living section
makeLandscape({ avoid: (x, z) => Math.abs(x) < 16 || (x > -6 && x < 75 && z > -90 && z < 230), fieldAvoid: (x, z, w, d) => Math.abs(x) < 12 + w / 2, near: [0, 0, 300, 200], trees: 1500, seed: 7301 });
const roadT = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#5a5d62'; c.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { const v = 72 + hash(i) * 38 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); }
  const X = d => (d + 6) / 12 * w; c.fillStyle = '#f2f2f2'; for (const d of [-4.3, 4.3]) c.fillRect(X(d) - 3, 0, 6, h); for (let y = 0; y < h; y += 128) c.fillRect(X(0) - 3, y, 6, 70); }, true);
roadT.repeat.set(1, 1600 / 24);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(12, 1600), new THREE.MeshLambertMaterial({ map: roadT })); m.rotation.x = -PI / 2; m.position.set(0, 0.04, 0); m.receiveShadow = true; scene.add(m);
  for (const s of [-1, 1]) { const g = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1600), L('#8f9a6a')); g.rotation.x = -PI / 2; g.position.set(s * 7.1, 0.035, 0); g.receiveShadow = true; scene.add(g); } }
// galvanised W-beam texture
const beamT = canvasTex(256, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#c9ced3'); g.addColorStop(0.2, '#9aa1a8'); g.addColorStop(0.35, '#e2e6ea'); g.addColorStop(0.5, '#8d949b'); g.addColorStop(0.65, '#e2e6ea'); g.addColorStop(0.8, '#9aa1a8'); g.addColorStop(1, '#c2c7cc'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(60,60,60,0.5)'; for (let x = 20; x < w; x += 64) { c.beginPath(); c.arc(x, h / 2, 4, 0, 2 * PI); c.fill(); } }, true);
const beamM = new THREE.MeshStandardMaterial({ map: beamT, metalness: 0.55, roughness: 0.38, side: THREE.DoubleSide });
// static beams
function staticBeam(x, z0, z1) { const g = new THREE.PlaneGeometry(Math.abs(z1 - z0), 0.34); const m = new THREE.Mesh(g, beamM); m.rotation.y = PI / 2; m.position.set(x, BY, (z0 + z1) / 2); m.castShadow = true; m.receiveShadow = true; beamT.repeat.set(1, 1); scene.add(m); return m; }
staticBeam(-BX, SEC, 800); staticBeam(-BX, -800, -SEC); staticBeam(BX, -800, 800);
{ const posts = []; for (const x of [-BX - 0.12, BX + 0.12]) for (let z = -790; z <= 790; z += 2) posts.push([x, z]);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.72, 0.12), STD('#8f969d', { metalness: 0.4 }), posts.length); posts.forEach(([x, z], i) => { _m.compose(_v.set(x, 0.36, z), _q.identity(), _s.set(1, 1, 1)); im.setMatrixAt(i, _m); }); im.castShadow = true; im.receiveShadow = true; scene.add(im); }
// living beam = ribbon rebuilt every frame
const NB = 64;
const bGeo = new THREE.BufferGeometry(); const bPos = new Float32Array(NB * 2 * 3), bUV = new Float32Array(NB * 2 * 2), bIdx = [];
for (let i = 0; i < NB; i++) { bUV.set([i / (NB - 1) * 8, 0, i / (NB - 1) * 8, 1], i * 4); if (i < NB - 1) { const a = i * 2; bIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3)); bGeo.setAttribute('uv', new THREE.BufferAttribute(bUV, 2)); bGeo.setIndex(bIdx);
const beamT2 = beamT.clone(); beamT2.needsUpdate = true; beamT2.wrapS = beamT2.wrapT = THREE.RepeatWrapping;
const live = new THREE.Mesh(bGeo, new THREE.MeshStandardMaterial({ map: beamT2, metalness: 0.55, roughness: 0.38, side: THREE.DoubleSide })); live.castShadow = true; live.receiveShadow = true; live.frustumCulled = false; scene.add(live);
// googly eyes
const eyes = [-1, 1].map(s => { const g = new THREE.Group(); scene.add(g);
  const wh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), STD('#ffffff', { roughness: 0.3 })); g.add(wh);
  const pu = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), STD('#111', { roughness: 0.2 })); pu.position.z = 0.24; g.add(pu);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(0.06, 0.07, 0.39); g.add(hl);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.385, 24, 12, 0, 2 * PI, 0, PI / 2), STD('#a7aeb5', { metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide })); const lp = new THREE.Group(); lp.add(lid); g.add(lp);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, pu, hl, lp, s }; });
// haystack + bales
const HAY = V3(42, 0, 178);
const strawT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e3c25c'; c.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 900; i++) { c.strokeStyle = R() > 0.5 ? 'rgba(160,120,30,0.5)' : 'rgba(255,240,170,0.6)'; c.lineWidth = 1.5; const x = R() * w, y = R() * h, a = (R() - 0.5) * 0.8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a) * 18, y + Math.cos(a) * 18); c.stroke(); } }, true);
strawT.repeat.set(4, 2);
{ const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * PI / 2; pts.push(new THREE.Vector2(6.2 * Math.cos(a) * (1 + 0.06 * Math.sin(a * 6)), 5.6 * Math.sin(a))); }
  const hs = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), STD('#e3c25c', { map: strawT, roughness: 0.95 })); hs.position.copy(HAY); hs.castShadow = hs.receiveShadow = true; scene.add(hs);
  for (const [dx, dz, r] of [[12, -6, 0.4], [-10, 9, 1.2], [14, 10, 2.0]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.6, 24), STD('#d8b54e', { map: strawT, roughness: 0.95 })); b.rotation.set(PI / 2, r, 0, 'YXZ'); b.position.set(HAY.x + dx, 1.3, HAY.z + dz); b.castShadow = b.receiveShadow = true; scene.add(b); } }
// straw puff on impact
const puffs = []; { const R = rng(9); for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.7), STD('#f0d070')); m.userData.d = V3(R() - 0.5, R() * 0.9 + 0.3, R() - 0.5).normalize().multiplyScalar(5 + R() * 6); m.userData.r = V3(R() * 9, R() * 9, R() * 9); m.visible = false; scene.add(m); puffs.push(m); } }

// ---------------- cars ----------------
const hero = makeCar('#e53935');
const Q = [makeCar('#1e88e5'), makeCar('#fdd835')];

// ---------------- motion ----------------
const zHook = mono([[0, 175], [tThen, 95], [tWhat, 46], [S('hook2').end + 0.6, 40]]);
const zW = mono([[W1 - 0.3, 40], [tFull, 38], [tBut, 2.2], [tStretchW, -14], [tF1, -24], [tF2, -34], [tF3, -42], [tSnap - 0.05, -45], [tSnap, -45]]);
const tLand = tHay + 0.15, FL = tLand - tSnap;
const HEND = V3(HAY.x - 0.2, 5.3, HAY.z + 0.4);
function heroW(t) {
  if (t < W1 - 0.3) return { x: LX, y: 0, z: zHook(t), h: 0, pitch: 0 };
  if (t < tSnap) return { x: LX, y: 0, z: zW(t), h: 0, pitch: 0 };
  const u = clamp((t - tSnap) / FL), f = 1 - (1 - u) * (1 - u);
  if (u >= 1) return { x: HEND.x, y: HEND.y, z: HEND.z, h: 0, pitch: -1.2, roll: 0.12 };
  const x = lerp(LX, HEND.x, ease(u)), z = lerp(-45, HEND.z, f), y = 4 * 42 * u * (1 - u) * Math.min(1, u * 6) + HEND.y * u * u;
  return { x, y, z, h: 0, pitch: -(2 * PI + 1.2) * ease(u), roll: 0.12 * u };
}
const zR = mono([[tRew1, zHook(REW_TARGET)], [tStop + 0.3, 12], [99, 12]]);
const QZ = [12, 20.5, 29];
function carR(k, t) {   // k = 0 hero, 1/2 queue
  const Hk = HOP[k]; let z;
  if (k === 0 && t < Hk - 1.3) z = zR(t);
  else if (k > 0 && t < Hk - 1.3) z = mono([[tRew1, 160 + k * 25], [tWait + 0.4 + k * 0.6, QZ[k]], [99, QZ[k]]])(t);
  else z = mono([[Hk - 1.3, QZ[k]], [Hk, 0], [Hk + 1.0, -16], [Hk + 4, -95], [Hk + 9, -260]])(t);
  const hu = clamp((t - (Hk - 0.32)) / 0.64); const y = 2.1 * Math.sin(PI * hu) * (hu > 0 && hu < 1 ? 1 : 0);
  return { x: LX, y, z, h: 0, pitch: (hu > 0 && hu < 1) ? 0.22 * Math.cos(PI * hu) : 0 };
}
const HP = t => isRight(t) ? carR(0, t) : heroW(t);

// barrier shape: returns point list (NB) and eye anchor
const E0r = V3(-BX, BY, SEC), E1r = V3(-BX, BY, -SEC), E0a = V3(-BX, BY, 0), E1a = V3(BX, BY, 0);
const P = Array.from({ length: NB }, () => V3(0, 0, 0));
const ropeK = [[tSwing - 0.25, 0], [tSwing + 0.6, PI * 0.9], [HOP[0], 18 * PI], [HOP[1], 20 * PI], [HOP[2], 22 * PI], [HOP[2] + 0.55, 24 * PI], [HOP[2] + 1.3, 26 * PI]];
const ropePhi = mono(ropeK);
function shape(t) {
  const right = isRight(t);
  // amount "across": 0 = on its posts, 1 = across the road
  let ac = ease(ramp(t, tJumps - 0.05, tRoad + 0.2)), lift = Math.sin(PI * ac) * 7;
  if (right) { const back_ = ease(ramp(t, tLies - 0.1, tPostsR + 0.4)); ac = 1 - back_; lift = Math.sin(PI * back_) * 2.6; }
  const E0 = E0r.clone().lerp(E0a, ac), E1 = E1r.clone().lerp(E1a, ac);
  const C = E0r.clone().lerp(E1r, 0.5).lerp(E0a.clone().lerp(E1a, 0.5), ac).add(V3(0, lift, 0));
  const wob = (!right ? ramp(t, tStarts - 0.2, tWobble) * (1 - ramp(t, tJumps, tJumps + 0.3)) + Math.sin(PI * ac) * 0.8 : Math.sin(PI * (1 - ac)) * 0.6);
  let apex = null;
  if (!right && t >= tBut - 0.3) { const hp = heroW(t); const nz = hp.z - 2.25;
    if (t < tSnap) { if (nz < 0) apex = V3(LX, BY, nz); }
    else { const tau = t - tSnap, rel = clamp((45 - 2.25) / (FL * 2 * 221 / 2) * 1.0, 0.05, 0.6); // release time when the nose passes z=0
      const tr = 0.27; if (tau < tr) apex = V3(LX, BY + hp.y * 0.0, Math.min(-2.25 + -45 * (1 - tau / tr) * (1 - tau / tr), 0));
      else apex = V3(LX * Math.exp(-3 * (tau - tr)), BY, 7 * Math.exp(-1.8 * (tau - tr)) * Math.sin(9 * (tau - tr))); } }
  // skipping rope (right way)
  const rope = right ? (ramp(t, tSwing - 0.3, tSwing + 0.3) * (1 - ramp(t, tLies - 0.3, tLies + 0.3))) : 0, phi = ropePhi(t);
  for (let i = 0; i < NB; i++) { const s = i / (NB - 1);
    let p; if (apex) p = s < 0.5 ? E0.clone().lerp(apex, s * 2) : apex.clone().lerp(E1, s * 2 - 1);
    else { const a = E0.clone().multiplyScalar((1 - s) * (1 - s)), b = C.clone().multiplyScalar(2 * s * (1 - s)), c = E1.clone().multiplyScalar(s * s); p = a.add(b).add(c); }
    const env = Math.sin(PI * s);
    p.x += wob * 0.35 * env * Math.sin(s * 14 - t * 11) * (1 - ac); p.y += wob * 0.28 * env * Math.sin(s * 11 - t * 9); p.z += wob * 0.5 * env * Math.sin(s * 12 - t * 10) * ac;
    if (rope > 0) { const R = 2.5 * env * rope; p.y += 1.95 * env * rope - R * Math.cos(phi); p.z += R * Math.sin(phi); }
    P[i].copy(p); }
  return { mid: P[NB >> 1].clone(), tan: P[(NB >> 1) + 1].clone().sub(P[(NB >> 1) - 1]).normalize() };
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const WC = (off, look, fov = 40) => t => { const p = HP(t); return [V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2]), fov]; };
const camKeys = [
  [0.0, WC([3, 13, 27], [0, 0, -22], 40)],
  [tThen - 0.3, WC([2.5, 11, 24], [0, 0, -24], 40)],
  ...cut(tThen - 0.25, Ac([-2.2, 1.7, 24], [-BX, 0.6, 2], 34)),
  [tJumps - 0.3, Ac([-2.0, 1.8, 23], [-BX, 0.6, 2], 34)],
  ...cut(tJumps - 0.25, Ac([1.5, 5, 33], [-2.5, 1.8, 0], 44)),
  [tLikeH - 0.3, Ac([1.5, 4.2, 27], [-0.5, 1.2, 0], 42)],
  ...cut(tLikeH - 0.25, Ac([4, 2.2, 9], [0, 1.0, 0], 40)),
  [tWhat - 0.3, Ac([4.4, 2.3, 9.5], [0, 1.0, 0], 40)],
  ...cut(tWhat - 0.25, WC([0.6, 2.9, 9.5], [0, 1.0, -30], 40)),
  [W1 - 0.2, WC([0.6, 2.9, 9.5], [0, 1.0, -30], 40)],
  // wrong
  ...cut(W1 - 0.15, WC([0.6, 2.7, 9.5], [0, 1.0, -30], 40)),
  [tBut - 0.6, WC([0.8, 2.6, 9.0], [0, 1.0, -30], 40)],
  ...cut(tBut - 0.55, Ac([16, 20, 20], [0, 0, -14], 42)),
  [tF2, Ac([16, 24, 14], [0, 0, -22], 42)],
  [tSnap - 0.2, Ac([16, 26, 12], [0, 0, -24], 42)],
  ...cut(tSnap - 0.15, Ac([9, 6, 26], [1, 2, -14], 42)),
  [tFly - 0.25, Ac([9, 6, 26], [2, 6, 0], 42)],
  ...cut(tFly - 0.2, WC([32, 2, -6], [0, 0, 4], 40)),
  [tOver - 0.2, WC([36, 6, -14], [0, -2, 6], 40)],
  ...cut(tOver - 0.15, WC([-20, 14, -30], [0, -4, 6], 40)),
  [tHead - 0.25, WC([-22, 12, -26], [0, -4, 8], 40)],
  ...cut(tHead - 0.2, Ac([HAY.x - 21, 9, HAY.z - 21], [HAY.x, 5, HAY.z], 40)),
  [tRew0, Ac([HAY.x - 18, 8, HAY.z - 18], [HAY.x, 5.4, HAY.z], 40)],
  // right
  ...cut(tRew1, WC([0.6, 2.9, 9.5], [0, 1.0, -30], 40)),
  [tStop, WC([0.6, 2.9, 10.5], [0, 1.0, -30], 40)],
  ...cut(tHazard - 0.2, Ac([LX + 4, 2.6, 23], [LX - 1, 0.9, 11], 40)),
  [S('right2').end + 0.2, Ac([LX + 4.5, 2.8, 26], [LX - 1, 0.9, 10], 40)],
  ...cut(S('right3').start - 0.15, Ac([3.2, 1.9, 7.5], [0, 1.0, 0], 38)),
  [tPlay - 0.2, Ac([3.0, 1.8, 7.2], [0, 1.0, 0], 38)],
  ...cut(S('right4').start - 0.15, Ac([10, 7, 28], [0, 1.5, 4], 40)),
  [tLikeR - 0.25, Ac([11, 7.5, 29], [0, 1.8, 4], 40)],
  ...cut(tLikeR - 0.2, Ac([14, 4.5, 24], [0, 2.2, 4], 42)),
  [S('right5').end + 0.2, Ac([15, 5, 25], [0, 2.0, 2], 42)],
  ...cut(S('right6').start - 0.15, Ac([3, 4.5, -20], [-4.2, 1.0, 1], 40)),
  [tHappy - 0.2, Ac([3.5, 4.7, -21], [-5.0, 1.0, 0], 40)],
  ...cut(tHappy - 0.15, Ac([0.5, 2.0, -4.5], [-5.5, 1.1, 0.3], 36)),
  [S('right6').end + 0.3, Ac([0.8, 2.1, -5], [-5.5, 1.1, 0.3], 36)],
  ...cut(S('right7').start - 0.15, Ac([4, 13, -30], [-4, 0, 2], 42)),
  [TOTAL, Ac([5, 15, -34], [-4, 0, 1], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
const UP = V3(0, 1, 0);
function update(t) {
  const right = isRight(t);
  const c = cam(t); camera.fov = c.fov; camera.near = 0.2; camera.far = 3000; camera.updateProjectionMatrix();
  // cars
  const hp = HP(t); placeCar(hero, { x: hp.x, z: hp.z, h: hp.h, y: hp.y, pitch: hp.pitch, roll: hp.roll || 0 });
  if (!right && t > tSnap) { hero.userData.bodyG.rotation.set(0, 0, 0); hero.userData.bodyG.position.y = 0; }
  const haz = right && t > tHazard - 0.1 && t < HOP[0] - 1.4; blink(hero, t, haz, haz);
  hero.userData.tl.emissiveIntensity = right && t > tStop - 0.2 && t < HOP[0] - 1.3 ? 1.8 : 0.4;
  Q.forEach((q, i) => { const k = i + 1; const p = carR(k, t); q.visible = right; placeCar(q, p); const hz = right && t > tWait + k * 0.6 && t < HOP[k] - 1.4; blink(q, t + k * 0.2, hz, hz); q.userData.tl.emissiveIntensity = hz ? 1.6 : 0.4; });
  // barrier
  const sh = shape(t);
  for (let i = 0; i < NB; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(NB - 1, i + 1)]; const T = b.clone().sub(a).normalize(); const Wd = UP.clone().addScaledVector(T, -UP.dot(T)).normalize().multiplyScalar(0.17);
    bPos.set([P[i].x - Wd.x, P[i].y - Wd.y, P[i].z - Wd.z, P[i].x + Wd.x, P[i].y + Wd.y, P[i].z + Wd.z], i * 6); }
  bGeo.attributes.position.needsUpdate = true; bGeo.computeVertexNormals(); bGeo.computeBoundingSphere();
  // eyes
  const eo = ease(ramp(t, tStretch - 0.1, tStretch + 0.35)), ev = right ? 1 : eo;
  const side = V3(-sh.tan.z, 0, sh.tan.x); if (side.lengthSq() < 1e-4) side.set(0, 0, 1);
  eyes.forEach(E => { const sc = Math.max(0.01, ev); E.g.visible = ev > 0.02; E.g.scale.setScalar(sc * (right && ((t > tPlay - 0.1 && t < tLies) || t > tHappy - 0.1) ? 1.15 + 0.08 * Math.sin(t * 12) : 1));
    E.g.position.copy(sh.mid).addScaledVector(sh.tan, E.s * 0.42).add(V3(0, 0.42 + (right && ((t > tPlay && t < tSwing) || t > tHappy) ? Math.abs(Math.sin(t * 7 + E.s)) * 0.3 : 0), 0));
    E.g.lookAt(c.p);
    // lids: -1.3 = open, 0 = half closed (bored), 0.55 = squint
    let lid = -1.3;
    if (!right) { if (t > tF1 - 0.2 && t < tSnap + 0.4) lid = 0.5; if (t < tStretch + 0.6) lid = lerp(0.9, -1.3, ramp(t, tStretch, tStretch + 0.5)); }
    else { if (t < tPlay - 0.15) lid = 0.05 + 0.08 * Math.sin(t * 1.5); if (t > tHappy - 0.1) lid = -1.3; if (Math.abs(t - (tTwenty + 0.4)) < 0.08) lid = 1.4; }
    E.lp.rotation.x = lid; const look = right && t > tStop && t < tPlay ? V3(-0.06 * E.s, -0.05, 0.24) : V3(0, 0, 0.24); E.pu.position.copy(look); E.hl.position.set(look.x + 0.06, look.y + 0.07, 0.39); });
  // straw puff
  puffs.forEach(m => { const tau = t - tLand; m.visible = !right && tau > 0 && tau < 1.6; if (!m.visible) return; const d = m.userData.d; m.position.set(HEND.x + d.x * tau, HEND.y + 0.8 + d.y * tau - 4.9 * tau * tau * 0.6, HEND.z - 1.2 + d.z * tau); m.rotation.set(m.userData.r.x * tau, m.userData.r.y * tau, 0); });
  applyCam(c, t, !right && t > tF2 && t < tSnap ? 0.05 : 0);
  camera.updateMatrixWorld(true);
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('EMPTY MOTORWAY', BLUE, tEmpty - 0.1, tThen - 0.15, 58);
    P_('THE CRASH BARRIER… WOBBLES?', '#6a1b9a', tStarts - 0.1, tJumps - 0.1, 46, iconWarn);
    floatText('BOING!', W / 2 + 100, 700, t, tJumps, tJumps + 0.9, 130, YEL, 0.08);
    P_('THE CRASH BARRIER IS ALIVE', '#6a1b9a', tStretch - 0.1, tLikeH - 0.1, 48, iconWarn);
    P_('GIANT RUBBER BAND', RED, tLikeH - 0.05, S('hook2').end + 0.5, 58, iconWarn);
    P_('FULL SPEED', RED, tFull - 0.1, tBreak - 0.1, 62, iconX);
    P_('BREAK RIGHT THROUGH IT', RED, tBreak - 0.05, S('wrong1').end + 0.3, 50, iconX);
    P_("IT DOESN'T BREAK", RED, tBut - 0.1, tStretchW - 0.1, 56, iconX);
    floatText('S-T-R-E-T-C-H', W / 2, 760, t, tStretchW, tF1 - 0.05, 100, YEL, -0.05);
    floatText('FURTHER…', W / 2 - 80, 760, t, tF1, tF2 - 0.05, 110, YEL, 0.05);
    floatText('FURTHER…', W / 2 + 60, 820, t, tF2, tF3 - 0.05, 120, YEL, -0.06);
    floatText('FURTHER…!', W / 2, 880, t, tF3, tSnap - 0.1, 130, YEL, 0.06);
    floatText('TWANG!', W / 2, 760, t, tSnap, tSnap + 0.9, 150, YEL, -0.08);
    P_('HUMAN SLINGSHOT', RED, tFly - 0.1, tOver - 0.1, 58, iconX);
    P_('OVER TWO FIELDS', RED, tOver - 0.05, tHead - 0.1, 58, iconX);
    P_('HEAD FIRST INTO A HAYSTACK', RED, tHead - 0.05, tRew0, 46, iconX);
    floatText('FLUMP!', W / 2 + 60, 1350, t, tLand, tLand + 1.0, 140, YEL, 0.08);
  } else {
    P_('STOP', GREEN, tStop - 0.1, tHazard - 0.1, 66, iconCheck);
    P_('HAZARD LIGHTS ON', GREEN, tHazard - 0.05, tWait - 0.1, 56, iconCheck);
    P_('WAIT', GREEN, tWait - 0.05, S('right2').end + 0.3, 66, iconCheck);
    P_('IT IS JUST BORED', '#5d4037', tBored - 0.15, tTwenty - 0.1, 54);
    P_('20 YEARS OF STANDING STILL', '#5d4037', tTwenty - 0.05, tWants - 0.1, 46);
    P_('IT WANTS TO PLAY', '#0277bd', tWants - 0.05, S('right3').end + 0.3, 56, iconHeart);
    P_('RADIO ON', '#8e24aa', tTurn - 0.1, tSwing - 0.1, 64, iconCheck);
    P_('GIANT SKIPPING ROPE', '#0277bd', tSwing - 0.05, S('right4').end + 0.3, 54, iconHeart);
    P_('ONE CAR AT A TIME', GREEN, tOne - 0.1, HOP[0] - 0.3, 54, iconCheck);
    HOP.forEach((h, k) => floatText('HOP!', W / 2 + (k - 1) * 230, 760 - k * 40, t, h - 0.2, h + 0.3, 120, YEL, (k - 1) * 0.08));
    P_('BACK ON ITS POSTS', GREEN, tLies - 0.1, tHappy - 0.1, 54, iconCheck);
    P_('HAPPY', '#0277bd', tHappy - 0.05, tStraight - 0.15, 64, iconHeart);
    P_('STRAIGHTER THAN EVER', GREEN, tStraight - 0.1, S('right6').end + 0.4, 52, iconCheck);
  }
}
window.dbg = { hero, shape, P };
start(update, hud);
