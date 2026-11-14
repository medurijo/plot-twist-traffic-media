// Episode 50: Speed bump – it's a sleeping walrus
// hook (old style): quiet street, thirty zone, speed bump ahead -> the bump snores, has whiskers and tusks: a sleeping walrus
// wrong: don't slow down, drive over it -> BUMP, car stuck on his back, he wakes up, very grumpy ->
//        flips the car onto his nose like a circus ball, spins it, falls back asleep holding it. Forever.
// right: speed bump = slow down -> stop completely -> walruses love a back scratch: snow brush out of the window ->
//        scratch scratch, he smiles, rolls onto his back -> softest speed bump in town: boing, boing -> waves goodbye with his flipper
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tQuiet = WT('hook1', 'Quiet'), tThirty = WT('hook1', 'Thirty'), tSpeed1 = WT('hook1', 'Speed');
const tSnored = WT('hook2', 'snored'), tIt2 = WT('hook2', 'It'), tWhiskers = WT('hook2', 'whiskers'), tAnd2 = WT('hook2', 'And'), tTusks = WT('hook2', 'tusks'), tIts = WT('hook2', "It's"), tWalrus = WT('hook2', 'walrus'), tWhat = WT('hook2', 'What');
const tDont = WT('wrong1', 'don'), tThey = WT('wrong1', 'They'), tOver = WT('wrong1', 'over');
const tBig = WT('wrong2', 'Big'), tBump = WT('wrong2', 'Bump'), tWakes = WT('wrong2', 'wakes'), tAndW = WT('wrong2', 'And'), tGrumpy = WT('wrong2', 'grumpy');
const tFlips = WT('wrong3', 'flips'), tNose = WT('wrong3', 'nose'), tLike = WT('wrong3', 'like'), tSpins = WT('wrong3', 'Spins'), tAnd3 = WT('wrong3', 'And'), tFalls = WT('wrong3', 'falls'), tStill = WT('wrong3', 'Still'), tForever = WT('wrong3', 'Forever');
const tSpeedR = WT('right2', 'speed'), tSlow = WT('right2', 'slow'), tSo2 = WT('right2', 'So'), tStop = WT('right2', 'stop'), tCompl = WT('right2', 'Completely');
const tWalruses = WT('right3', 'Walruses'), tScratchW = WT('right3', 'scratch'), tSo3 = WT('right3', 'So'), tGrab = WT('right3', 'grab'), tBrush = WT('right3', 'brush');
const tScr1 = WT('right4', 'Scratch'), tScr2 = WT('right4', 'scratch', 1), tHe4 = WT('right4', 'He'), tSmiles = WT('right4', 'smiles'), tAnd4 = WT('right4', 'And'), tRolls = WT('right4', 'rolls');
const tNow = WT('right5', 'Now'), tSoftest = WT('right5', 'softest'), tBoing1 = WT('right5', 'Boing'), tBoing2 = WT('right5', 'Boing', 1);
const tAnd6 = WT('right6', 'And'), tWaves = WT('right6', 'waves'), tFlipper = WT('right6', 'flipper');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: quiet town street (road along z, car drives towards -z) ----------------
const RX = 3.6, WZ = -6.0, CX = 1.6;
makeLandscape({ avoid: (x, z) => Math.abs(x) < 24 && z > -140 && z < 120, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 34 && z + d / 2 > -150 && z - d / 2 < 130, near: [0, 0, 160, 300], trees: 1100, seed: 5005 });
plane(-RX, RX, -600, 600, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -300; z < 300; z += 7) if (Math.abs(z - WZ) > 3) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.14, 600); g2.rotateX(-Math.PI / 2); instanced(g2, markMat, [[RX - 0.25, 0.08, 0], [-RX + 0.25, 0.08, 0]], false);
  // "30" painted on the road + white triangles before the bump
  const t30 = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#fff'; c.font = '900 300px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.translate(w / 2, h / 2); c.scale(0.8, 1.6); c.fillText('30', 0, 0); c.restore(); });
  const p30 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), L('#fff', { map: t30, transparent: true, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); p30.rotation.x = -Math.PI / 2; p30.position.set(CX, 0.085, WZ + 30); scene.add(p30);
  const tri = new THREE.CircleGeometry(0.42, 3); tri.rotateX(-Math.PI / 2); tri.rotateY(Math.PI / 2); const tl = []; for (let x = -3.0; x <= 3.1; x += 1.0) tl.push([x, 0.083, WZ + 3.2]); instanced(tri, markMat, tl, false); }
const paveM = L('#cfc9bc'), kerbM = L('#a9a397');
for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 600), paveM); p.position.set(s * (RX + 0.8), 0.07, 0); p.receiveShadow = true; scene.add(p);
  const k = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 600), kerbM); k.position.set(s * (RX + 0.07), 0.08, 0); k.receiveShadow = true; scene.add(k); }
const hedgeM = new THREE.MeshLambertMaterial({ color: '#3f8a35', flatShading: true });
{ const hg = new THREE.BoxGeometry(0.9, 1.05, 1.0); const R = rng(5); const list = []; for (const s of [-1, 1]) for (let z = -90; z < 80; z += 0.9) { if (Math.abs(z - (WZ - 9)) < 1.6 && s > 0) continue; list.push([s * 5.45, 0.52, z, (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.15, 1 + (R() - 0.5) * 0.12, 1]); }
  instanced(hg, hedgeM, list, true); }
{ const cols = ['#f4d6a0', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5d7a99'; c.fillRect(30 + x * 120, 30 + y * 120, 76, 80); c.fillStyle = '#fff'; c.fillRect(66 + x * 120, 30 + y * 120, 4, 80); } });
  let k = 0; for (const s of [-1, 1]) for (let z = -90; z <= 70; z += 13) { const g = new THREE.Group(); g.position.set(s * (14 + (k % 2) * 2), 0, z + (s > 0 ? 6 : 0)); scene.add(g);
    const m = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 9), L(cols[k % cols.length], { map: winT })); m.position.y = 3.5; m.castShadow = m.receiveShadow = true; g.add(m);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.4, 4), L(['#b0473a', '#7b5e57', '#455a64'][k % 3])); rf.rotation.y = Math.PI / 4; rf.position.y = 8.7; rf.castShadow = true; g.add(rf); k++; } }
// signs on the right pavement: 30 zone + speed bump warning
function sign(z, draw, shape) { const g = new THREE.Group(); g.position.set(RX + 1.25, 0.14, z); g.rotation.y = -0.3; scene.add(g);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), STD('#9e9e9e', { metalness: 0.5 })); p.position.y = 1.15; g.add(p);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), L('#fff', { map: canvasTex(256, 256, draw), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); b.position.set(0, 2.4, 0.06); g.add(b);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
sign(WZ + 40, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 128, 122, 0, 7); c.fill(); c.strokeStyle = '#d32f2f'; c.lineWidth = 26; c.beginPath(); c.arc(128, 128, 108, 0, 7); c.stroke(); c.fillStyle = '#111'; c.font = '900 120px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('30', 128, 136); });
sign(WZ + 15, (c, w, h) => { c.fillStyle = '#d32f2f'; c.beginPath(); c.moveTo(w / 2, 8); c.lineTo(w - 6, h - 20); c.lineTo(6, h - 20); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(w / 2, 50); c.lineTo(w - 44, h - 42); c.lineTo(44, h - 42); c.fill();
  c.fillStyle = '#111'; c.fillRect(64, 188, 128, 12); c.beginPath(); c.ellipse(128, 190, 40, 30, 0, Math.PI, 0); c.fill(); });

// ---------------- walrus ----------------
const PIV = 0.9;                                   // group pivot height (spine axis) -> roll keeps the height
const WG = new THREE.Group(); WG.position.set(0, PIV, WZ); scene.add(WG);
const NA = 56, NM = 28;
const rProf = u => 0.38 + 0.8 * Math.sin(Math.PI * (0.08 + 0.7 * u));
const SQ = 0.82;                                   // cross-section vertical squash
const bodyGeo = new THREE.BufferGeometry();
{ const pos = new Float32Array((NA + 1) * (NM + 1) * 3), col = new Float32Array((NA + 1) * (NM + 1) * 3), idx = [];
  for (let i = 0; i <= NA; i++) for (let j = 0; j <= NM; j++) { const k = i * (NM + 1) + j; if (i < NA && j < NM) { const a = k, b = k + NM + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); } }
  bodyGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bodyGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); bodyGeo.setIndex(idx); }
const BODYM = STD('#ffffff', { vertexColors: true, roughness: 0.75 });
const body = new THREE.Mesh(bodyGeo, BODYM); body.castShadow = body.receiveShadow = true; body.frustumCulled = false; WG.add(body);
const tailCap = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), STD('#94603f', { roughness: 0.75 })); tailCap.castShadow = true; WG.add(tailCap);
const C_BACK = new THREE.Color('#94603f'), C_BELLY = new THREE.Color('#f4d4b6'), C_SPOT = new THREE.Color('#96603f');
// spine poses (W-local, x from tail +3.9 to neck -2.4)
const lyingAt = (u, br) => V3(lerp(3.9, -2.4, u), rProf(u) * SQ * br - PIV, 0);
const UPQ = [V3(3.9, 0.48 - PIV, 0), V3(1.0, 1.0 - PIV, 0), V3(-1.5, 1.2 - PIV, 0), V3(-1.5, 3.7 - PIV, 0)];
const bez = (P, u) => { const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3; return V3(0, 0, 0).addScaledVector(P[0], a).addScaledVector(P[1], b).addScaledVector(P[2], c).addScaledVector(P[3], d); };
let spineFn = u => lyingAt(u, 1);
function buildBody(up, br, squashY) {
  spineFn = u => { const p = lyingAt(u, br).lerp(bez(UPQ, u), up); p.y = (p.y + PIV) * squashY - PIV; return p; };
  const pos = bodyGeo.attributes.position, col = bodyGeo.attributes.color; let nPrev = null;
  for (let i = 0; i <= NA; i++) { const u = i / NA, c = spineFn(u); const tg = spineFn(Math.min(1, u + 0.01)).sub(spineFn(Math.max(0, u - 0.01))).normalize();
    let n = nPrev ? nPrev.clone().sub(tg.clone().multiplyScalar(nPrev.dot(tg))).normalize() : V3(0, 1, 0).sub(tg.clone().multiplyScalar(tg.y)).normalize(); nPrev = n;
    const b = tg.clone().cross(n).normalize(); const r = rProf(u) * br;
    for (let j = 0; j <= NM; j++) { const a = j / NM * Math.PI * 2, k = i * (NM + 1) + j; const ca = Math.cos(a);
      const p = c.clone().addScaledVector(n, ca * r * SQ * squashY).addScaledVector(b, Math.sin(a) * r); pos.setXYZ(k, p.x, p.y, p.z);
      const bl = clamp((-ca - 0.02) / 0.4); const spot = hash(i * 7 + j * 13) > 0.93 && bl < 0.2 ? 0.6 : 0; const cc = C_BACK.clone().lerp(C_SPOT, spot).lerp(C_BELLY, bl); col.setXYZ(k, cc.r, cc.g, cc.b); } }
  pos.needsUpdate = true; col.needsUpdate = true; bodyGeo.computeVertexNormals();
  const t0 = spineFn(0); tailCap.position.copy(t0); tailCap.scale.set(rProf(0) * br, rProf(0) * br * SQ * squashY, rProf(0) * br);
}
// flippers
function flipperMesh(len, wid) { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), STD('#9a6243', { roughness: 0.8 })); m.scale.set(len / 2, 0.09, wid / 2); m.position.x = len / 2; m.castShadow = true; g.add(m);
  for (let k = -1; k <= 1; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), STD('#7d4c33', { roughness: 0.8 })); f.scale.set(0.22, 0.07, 0.09); f.position.set(len - 0.05, 0.02, k * wid * 0.28); g.add(f); } return g; }
const FF = [-1, 1].map(s => { const piv = new THREE.Group(); WG.add(piv); const f = flipperMesh(1.35, 0.62); f.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; piv.add(f); return { piv, f, s }; });
const TF = [-1, 1].map(s => { const piv = new THREE.Group(); WG.add(piv); const f = flipperMesh(0.95, 0.75); f.rotation.y = s * 0.35; piv.add(f); return { piv, f, s }; });
// head
const HD = new THREE.Group(); scene.add(HD);
const HM = STD('#ad7350', { roughness: 0.75 }), PAD = STD('#c99272', { roughness: 0.85 });
const WK = {};
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
{ mk(new THREE.SphereGeometry(0.78, 32, 24), HM, 0, 0, 0, HD).scale.set(1.08, 0.95, 1.0);
  WK.pads = [-1, 1].map(s => { const m = mk(new THREE.SphereGeometry(0.42, 24, 18), PAD, s * 0.3, -0.24, 0.62, HD); m.scale.set(1.0, 0.85, 0.85); return m; });
  WK.noseDots = [-1, 1].map(s => { const m = mk(new THREE.SphereGeometry(1, 10, 8), STD('#4a2a1c'), s * 0.12, 0.05, 0.84, HD); m.scale.set(0.07, 0.035, 0.04); return m; });
  // whiskers: bristles on both pads
  const wm = STD('#f3e6cf', { roughness: 0.6 }); const wg = new THREE.CylinderGeometry(0.012, 0.018, 0.34, 5); wg.translate(0, 0.17, 0);
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { const row = k % 3, col_ = Math.floor(k / 3); const m = mk(wg, wm, s * (0.18 + col_ * 0.13), -0.18 - row * 0.12, 0.92 - col_ * 0.06, HD); m.rotation.set(Math.PI / 2 + 0.25 + row * 0.15, 0, -s * (0.35 + col_ * 0.35)); m.castShadow = false; }
  WK.tusks = [-1, 1].map(s => { const m = mk(new THREE.ConeGeometry(0.085, 1.0, 14), STD('#fffbea', { roughness: 0.35 }), s * 0.22, -0.92, 0.72, HD); m.rotation.set(Math.PI, 0, s * 0.06); return m; });
  WK.mouth = mk(new THREE.SphereGeometry(0.2, 18, 12), STD('#7a2f2f', { roughness: 0.8 }), 0, -0.5, 0.66, HD); WK.mouth.scale.set(1.0, 0.25, 0.6);
  WK.smile = mk(new THREE.TorusGeometry(0.14, 0.03, 8, 20, Math.PI), STD('#5a2020'), 0, -0.47, 0.82, HD); WK.smile.rotation.z = Math.PI;
  WK.blush = [-1, 1].map(s => { const m = mk(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: '#ff8a80', transparent: true, opacity: 0.0, roughness: 0.8 }), s * 0.6, -0.08, 0.5, HD); m.scale.set(0.16, 0.09, 0.06); m.castShadow = false; return m; });
  WK.eyes = [-1, 1].map(s => { const w = mk(new THREE.SphereGeometry(0.13, 16, 12), STD('#fffde7', { roughness: 0.3 }), s * 0.36, 0.3, 0.6, HD);
    const p = mk(new THREE.SphereGeometry(0.06, 12, 8), STD('#1a1a1a', { roughness: 0.2 }), s * 0.365, 0.3, 0.675, HD);
    const hl = mk(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), s * 0.35, 0.325, 0.725, HD);
    const lid = new THREE.Group(); lid.position.set(s * 0.36, 0.3, 0.6); HD.add(lid); mk(new THREE.SphereGeometry(0.142, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), HM, 0, 0, 0, lid);
    const brow = mk(new THREE.BoxGeometry(0.26, 0.06, 0.08), STD('#5d3a26'), s * 0.36, 0.48, 0.62, HD);
    return { w, p, hl, lid, brow, s }; }); }
// snore puffs / Zzz sprites
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 60 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }

// ---------------- hero car + glove with snow brush ----------------
const hero = makeCar('#2f7bff');
hero.userData.bodyG.children[1].material.color.set('#4a6c8c');
const glove = new THREE.Group(); scene.add(glove);
{ const wm = STD('#ffffff', { roughness: 0.55 }); const palm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), wm); palm.scale.set(1.0, 1.15, 0.6); glove.add(palm);
  for (const k of [-1.5, -0.5, 0.5]) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 4, 8), wm); f.position.set(k * 0.075, 0.24, 0.02); glove.add(f); }
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 16), STD('#e0e0e0')); cuff.position.y = -0.2; glove.add(cuff); }
const brush = new THREE.Group(); scene.add(brush);    // local +y along the handle, head at y = BL
const BL = 3.1;
{ const h = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, BL, 10), STD('#1e88e5', { roughness: 0.4 })); h.position.y = BL / 2; brush.add(h);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 10), STD('#263238')); grip.position.y = 0.25; brush.add(grip);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.12), STD('#ffca28')); hb.position.set(0, BL, 0); brush.add(hb);
  const br = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.22, 0.1), STD('#37474f', { roughness: 0.95 })); br.position.set(0, BL + 0.16, 0); brush.add(br);
  brush.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- choreography ----------------
// body cross-section height profile along z at the car lane (local x = CX) -> wheel contact heights
const uAtX = x => clamp((3.9 - x) / 6.3);
function groundAt(z, st) {           // st: {br, sq, up}
  if (st.up > 0.05) return 0; const u = uAtX(CX), r = rProf(u) * st.br, d = z - WZ; if (Math.abs(d) >= r) return 0;
  return (PIV + (rProf(u) * SQ * st.br - PIV)) * st.sq + SQ * r * st.sq * Math.sqrt(1 - (d / r) ** 2);
}
const Z_HOOK0 = WZ + 72, Z_HOOK1 = WZ + 31;
const zHook = t => lerp(Z_HOOK0, Z_HOOK1, easeOut(clamp(t / (S('hook2').end))));
// wrong: accelerate from Z_HOOK1 at wrong1 start, contact at tBump-0.18, hop, stuck on top
const tA0 = S('wrong1').start - 0.3, tHit = tBump - 0.2, Z_TOP = WZ;
const accW = 2 * ((Z_HOOK1 - (WZ + 1.3 + 1.38)) - 0) / (tHit - tA0) ** 2;
function carWrong(t) {
  if (t < tA0) return { p: V3(CX, 0, zHook(t)), pitch: 0, roll: 0, rx: 0, ry: 0 };
  if (t < tHit) { const d = t - tA0; return { p: V3(CX, 0, Z_HOOK1 - 0.5 * accW * d * d), pitch: 0, roll: 0 }; }
  const zH = WZ + 1.3 + 1.38;
  const u = clamp((t - tHit) / 0.42); const z = lerp(zH, Z_TOP, easeOut(u)); const yTop = 1.62;
  let y = lerp(0, yTop, easeOut(u)) + 0.9 * Math.sin(Math.PI * u); let pitch = 0.35 * Math.sin(Math.PI * u) + (u >= 1 ? 0.05 * Math.sin((t - tHit) * 9) * Math.exp(-(t - tHit - 0.42) * 2.5) : 0);
  let roll = u >= 1 ? 0.06 * Math.sin((t - tHit) * 7) * Math.exp(-(t - tHit - 0.42) * 2.0) : 0;
  return { p: V3(CX, y, z), pitch, roll };
}
// right: slow down from Z_HOOK1 and stop at Z_STOP; drive over the belly from tBoing1 - x
const Z_STOP = WZ + 1.3 + 2.2 + 0.9;
const tStopA = tStop + 0.2;
const zRight0 = t => lerp(Z_HOOK1, Z_STOP, 1 - Math.pow(1 - clamp((t - (tRew1 - 0.2)) / (tStopA - tRew1 + 0.2)), 2.0));
const VB = 2.76 / (tBoing2 - tBoing1);                     // speed so front wheel hits at boing1, rear at boing2
const zFront1 = WZ + 1.38;                                  // car centre when the front wheel is on top of the belly
const tGo = tBoing1 - (Z_STOP - zFront1) / VB - 0.6;        // start a bit earlier (accelerating)
function zRight(t) {
  if (t < tGo) return zRight0(t);
  const d = t - tGo, a = 0.6;     // smooth start: first `a` seconds accelerate
  const s = d < 2 * a ? VB * d * d / (4 * a) : VB * (d - a);
  return Z_STOP - s;
}
const T_ROLL0 = tRolls - 0.05, T_ROLL1 = tRolls + 0.85;
const roll = t => isRight(t) ? -Math.PI * ease(clamp((t - T_ROLL0) / (T_ROLL1 - T_ROLL0))) : 0;
const upPose = t => !isRight(t) ? ease(clamp((t - tFlips + 0.05) / 0.6)) : 0;
const boing = (t, tb) => t > tb - 0.05 ? Math.exp(-(t - tb) * 3.2) * Math.abs(Math.sin((t - tb + 0.05) * 8.5)) : 0;

// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const chase = (dz, dy, look = 10) => t => { const z = isRight(t) ? zRight(t) : carWrong(t).p.z; return [V3(CX + 0.4, dy, z + dz), V3(CX - 0.9, 1.0, z - look), 40]; };
const FACE = Ac([-1.5, 2.3, WZ + 7.4], [-3.3, 1.0, WZ + 0.2], 34);
const FACE2 = Ac([-1.7, 2.1, WZ + 6.6], [-3.3, 0.95, WZ + 0.2], 33);
const WIDE = Ac([5.0, 4.6, WZ + 14.5], [-0.6, 1.0, WZ], 40);
const SIDE = Ac([-6.5, 5.2, WZ + 7.5], [1.0, 1.2, WZ - 0.5], 40);
const UPW = Ac([-0.2, 4.4, WZ + 17.5], [-1.0, 4.0, WZ], 40);
const camKeys = [
  [0.0, chase(9.5, 3.4, 12)],
  [tSnored - 0.35, chase(8.5, 3.2, 12)],
  ...cut(tSnored - 0.3, Ac([2.6, 3.6, WZ + 15.5], [-0.4, 0.8, WZ], 38)),
  [tIt2 - 0.25, Ac([2.4, 3.4, WZ + 14.0], [-0.5, 0.8, WZ], 38)],
  ...cut(tIt2 - 0.2, FACE),
  [tIts - 0.3, FACE2],
  ...cut(tIts - 0.25, WIDE),
  [S('hook2').end + 0.3, Ac([4.6, 4.8, WZ + 13.5], [-0.6, 1.0, WZ], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.1, chase(8.5, 3.0, 10)),
  [tHit - 0.55, chase(8.0, 3.0, 10)],
  ...cut(tHit - 0.5, SIDE),
  [tWakes - 0.3, Ac([-6.2, 5.0, WZ + 7.0], [1.0, 1.3, WZ - 0.5], 40)],
  ...cut(tWakes - 0.25, FACE),
  [tAndW - 0.2, FACE2],
  ...cut(tAndW - 0.15, Ac([-0.4, 2.4, WZ + 6.0], [-2.6, 1.25, WZ - 0.2], 36)),
  [tFlips - 0.3, Ac([-0.5, 2.4, WZ + 5.6], [-2.6, 1.25, WZ - 0.2], 36)],
  ...cut(tFlips - 0.25, UPW),
  [tSpins - 0.2, Ac([-0.3, 4.6, WZ + 16.0], [-1.0, 4.2, WZ], 40)],
  ...cut(tAnd3 - 0.1, Ac([0.6, 6.0, WZ + 10.5], [-1.5, 5.0, WZ], 40)),
  [tForever - 0.3, Ac([0.4, 6.2, WZ + 9.6], [-1.5, 5.1, WZ], 40)],
  ...cut(tForever - 0.25, Ac([1.0, 5.5, WZ + 20.0], [-0.8, 4.0, WZ], 40)),
  [tRew0, Ac([1.2, 5.8, WZ + 22.0], [-0.8, 4.0, WZ], 40)],
  // right
  ...cut(tRew1, chase(9.0, 3.2, 12)),
  [tStop - 0.35, chase(8.0, 3.0, 10)],
  ...cut(tStop - 0.3, Ac([4.4, 5.4, WZ + 12.5], [-0.2, 0.8, WZ + 0.5], 40)),
  [S('right2').end + 0.2, Ac([4.0, 5.2, WZ + 11.8], [-0.2, 0.8, WZ + 0.5], 40)],
  ...cut(tWalruses - 0.15, FACE),
  [tSo3 - 0.3, FACE2],
  ...cut(tSo3 - 0.25, Ac([-3.2, 4.4, WZ + 11.0], [1.0, 1.2, WZ + 2.0], 40)),
  [tHe4 - 0.3, Ac([-3.0, 4.2, WZ + 10.2], [1.0, 1.2, WZ + 1.8], 40)],
  ...cut(tHe4 - 0.25, FACE),
  [tAnd4 - 0.25, FACE2],
  ...cut(tAnd4 - 0.2, WIDE),
  [S('right4').end + 0.2, Ac([4.6, 4.8, WZ + 13.5], [-0.6, 1.0, WZ], 40)],
  ...cut(tNow - 0.1, SIDE),
  [S('right5').end + 0.2, Ac([-6.2, 5.0, WZ + 6.4], [0.8, 1.2, WZ - 1.5], 40)],
  ...cut(tAnd6 - 0.1, Ac([-2.0, 5.4, WZ + 11.0], [-1.8, 1.0, WZ - 3.0], 40)),
  [TOTAL, Ac([-2.1, 6.4, WZ + 13.5], [-1.8, 1.0, WZ - 4.0], 40)],
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
  si = 0; SPR.forEach(s => s.visible = false);
  // ---- walrus state
  const awake = !right ? win(t, tWakes - 0.1, tFalls + 0.2, 0.15) : 0;
  const grumpy = !right ? win(t, tAndW - 0.1, tFalls + 0.2, 0.2) : 0;
  const up = upPose(t);
  const rl = roll(t), rolled = clamp(-rl / Math.PI);
  const happy = right ? win(t, tScr1 - 0.1, TOTAL + 1, 0.3) : 0;
  const smile = right ? ramp(t, tSmiles - 0.15, tSmiles + 0.25) : 0;
  const sleeping = 1 - Math.max(awake, right ? ramp(t, tWalruses, tWalruses + 0.3) * 0 : 0);
  const breath = 1 + 0.035 * Math.sin(t * 1.9) * (1 - up);
  // belly squash under the wheels (right way)
  let sq = 1;
  if (right) { const zc = zRight(t); for (const zw of [zc - 1.38, zc + 1.38]) { const d = Math.abs(zw - WZ); if (d < 1.1) sq = Math.min(sq, 1 - 0.28 * (1 - d / 1.1)); } }
  if (!right && t > tHit + 0.2 && up < 0.5) sq = 1 - 0.12 * Math.exp(-(t - tHit - 0.35) * 3) * Math.abs(Math.sin((t - tHit) * 10)) - 0.06;
  buildBody(up, breath, sq);
  WG.rotation.set(rl, 0, 0);
  WG.position.y = PIV + 0.25 * Math.sin(Math.PI * clamp((t - T_ROLL0) / (T_ROLL1 - T_ROLL0))) * (right ? 1 : 0);
  WG.updateMatrixWorld(true);
  // flippers
  const nU = 0.8, nP = spineFn(nU);
  FF.forEach(F => { const r = rProf(nU) * breath; F.piv.position.copy(nP).add(V3(0, -0.25 * (1 - up), F.s * r * 0.92));
    let rz = -0.35 + 0.2 * up, rx = F.s * (0.15 + 0.5 * up);
    if (right && t > tWaves - 0.3 && F.s > 0) { const w = win(t, tWaves - 0.3, TOTAL + 1, 0.3); rx += w * (0.9 + 0.55 * Math.sin((t - tWaves) * 9)); }
    if (right && happy > 0 && t < T_ROLL0) rx += F.s * 0.15 * Math.sin(t * 8) * happy;
    if (!right && up > 0.5) rx += F.s * 0.25 * Math.sin(t * 3);
    F.piv.rotation.set(rx, 0, rz); });
  const tP = spineFn(0);
  TF.forEach(F => { F.piv.position.copy(tP).add(V3(0.25, -0.2 * (1 - up) + 0.1, F.s * 0.25)); F.piv.rotation.set(F.s * 0.15, 0, -0.1 + (right ? 0.35 * Math.sin(t * 10) * win(t, tScr1, tRolls + 2.5, 0.2) : 0) + (!right ? 0.4 * win(t, tWakes, tFlips, 0.2) * Math.sin(t * 14) : 0)); });
  // head
  const neck = WG.localToWorld(spineFn(1).clone());
  const tgN = WG.localToWorld(spineFn(1).clone()).sub(WG.localToWorld(spineFn(0.97).clone())).normalize();
  const hp = neck.clone().addScaledVector(tgN, 0.45);
  hp.y += 0.38 * (1 - up) + 0.25 * up - 0.12 * rolled;
  HD.position.copy(hp);
  let pitch = 0.18, yaw = 0.1, hroll = 0;
  pitch += 0.04 * Math.sin(t * 1.9) * sleeping;
  if (!right) { pitch = lerp(pitch, -0.05, awake); yaw = lerp(yaw, 0.55, grumpy * (1 - up)); pitch = lerp(pitch, -1.35, up);
    if (t > tFalls) pitch += 0.12 * ramp(t, tFalls, tFalls + 0.8) + 0.03 * Math.sin(t * 1.9); }
  else { pitch = lerp(pitch, 0.0, happy); yaw = lerp(yaw, 0.25, happy) + 0.08 * Math.sin(t * 2.2) * happy; pitch = lerp(pitch, -0.5, rolled); hroll = 0.15 * rolled; }
  HD.rotation.set(pitch, yaw, hroll, 'YXZ');
  HD.updateMatrixWorld(true);
  // eyes
  const blinkE = (t % 3.7) < 0.12 ? 1 : 0;
  const shut = right ? (t < tSmiles - 0.1 ? (t > tScr1 ? 0.6 : 1 - 0.55 * win(t, tWalruses - 0.1, tSo3, 0.2)) : 1) : (awake > 0.5 && !(t > tFalls + 0.3) ? blinkE : 1);
  WK.eyes.forEach(E => { const g = !right ? grumpy : 0;
    E.lid.rotation.set(lerp(-0.7, 1.4, shut) + 0.75 * g * (1 - shut), 0, 0); E.lid.rotation.order = 'XYZ';
    E.brow.rotation.z = E.s * (0.5 * g - 0.3 * smile); E.brow.position.y = 0.48 - 0.07 * g + 0.04 * smile;
    E.p.visible = E.hl.visible = shut < 0.7; });
  // mouth: snore / roar / smile
  const snore = (sleeping > 0.5 && !right) || (right && t < tScr1) ? 0.3 + 0.3 * Math.max(0, Math.sin(t * 1.9)) : 0;
  const roar = !right ? win(t, tGrumpy - 0.1, tGrumpy + 0.8, 0.15) : 0;
  WK.mouth.scale.set(1.0 + 0.4 * roar, 0.25 + 0.9 * roar + 0.5 * snore * (1 - awake), 0.6); WK.mouth.visible = smile < 0.5;
  WK.smile.visible = smile > 0.5; WK.blush.forEach(b => b.material.opacity = 0.8 * smile);
  WK.pads.forEach(p => p.scale.set(1.0, 0.85 + 0.12 * smile + 0.08 * roar, 0.85));
  // snore puffs from the nose (sleeping)
  const snoring = (!right && (t < tWakes - 0.1 || t > tFalls + 0.4)) || (right && t < tScr1 - 0.2);
  if (snoring) { const ph = (t * 1.9 / (Math.PI * 2)) % 1; if (ph > 0.25 && ph < 0.75) { const nose = HD.localToWorld(V3(0, 0.0, 1.0)); const dir = HD.localToWorld(V3(0, 0.3, 2.0)).sub(nose).normalize(); for (let k = 0; k < 3; k++) { const q = clamp((ph - 0.25) * 2 - k * 0.15); if (q <= 0) continue; puff(nose.clone().addScaledVector(dir, 0.2 + q * 1.1).add(V3(0, q * 0.4, 0)), 0.25 + q * 0.6, 0.75 * (1 - q)); } } }
  // ---- car
  let carPose;
  if (!right) {
    const cw = carWrong(t);
    if (up > 0.001 || t > tFlips) {
      const NT = HD.localToWorld(V3(0, 0.05, 1.0)); const upHeadDir = HD.localToWorld(V3(0, 0, 2)).sub(HD.localToWorld(V3(0, 0, 0))).normalize();
      const topP = NT.clone().addScaledVector(upHeadDir, 1.62);
      const u = clamp((t - tFlips) / (tNose - tFlips + 0.1));
      const p = cw.p.clone().lerp(topP, ease(u)); p.y += 3.2 * Math.sin(Math.PI * u) * (1 - u * 0.3);
      const rz = Math.PI * ease(u) + (u >= 1 ? 0.08 * Math.sin((t - tNose) * 5) : 0);
      let spin = 0; if (t > tSpins - 0.1) { const d = t - tSpins + 0.1; spin = d < 1.2 ? 4 * Math.PI * easeOut(d / 1.2) : 4 * Math.PI + (d - 1.2) * 0.45 * (1 - ramp(t, tFalls, tFalls + 1.5) * 0.6); }
      carPose = { p, h: spin, pitch: 0, roll: rz };
    } else carPose = { p: cw.p, h: 0, pitch: cw.pitch, roll: cw.roll };
  } else {
    const z = zRight(t); const st = { br: 1, sq, up: 0 };
    const gf = groundAt(z - 1.38, st), gr = groundAt(z + 1.38, st);
    const b = 0.55 * boing(t, tBoing1) + 0.55 * boing(t, tBoing2);
    carPose = { p: V3(CX, (gf + gr) / 2 + b, z), h: 0, pitch: Math.atan2(gf - gr, 2.76) + 0.06 * (boing(t, tBoing1) - boing(t, tBoing2)), roll: 0 };
  }
  placeCar(hero, { x: carPose.p.x, z: carPose.p.z, h: carPose.h, pitch: carPose.pitch, roll: carPose.roll, y: carPose.p.y });
  hero.userData.hl.emissiveIntensity = 0.4; blink(hero, t, false, false);
  hero.updateMatrixWorld(true);
  // wheels spin in the air when stuck / upside down
  if (!right && t > tHit + 0.4) hero.userData.wheels.forEach(w => w.rotation.x = -t * 14);
  // ---- glove + snow brush (right)
  const bOn = right ? win(t, tGrab - 0.25, T_ROLL0 + 0.1, 0.3) : 0; glove.visible = brush.visible = bOn > 0.02;
  if (glove.visible) { const w0 = hero.localToWorld(V3(-1.12, 1.25, -0.25));
    let tgt = V3(CX - 0.9, 2.05, WZ + 0.15); const scr = win(t, tScr1 - 0.1, tSmiles + 0.4, 0.15); tgt.x += 0.45 * Math.sin((t - tScr1) * 13) * scr; tgt.y += 0.05 * Math.abs(Math.sin((t - tScr1) * 13)) * scr;
    const ext = ease(clamp((t - tGrab + 0.2) / 0.6)) * (1 - ramp(t, T_ROLL0 - 0.3, T_ROLL0 + 0.1));
    const rest = w0.clone().add(V3(-0.5, 1.2, -0.6)); const head = rest.clone().lerp(tgt, ext);
    const dir = head.clone().sub(w0).normalize(); glove.position.copy(w0).add(V3(-0.2, 0, 0)); glove.quaternion.setFromUnitVectors(V3(0, 1, 0), dir); glove.scale.setScalar(bOn);
    brush.position.copy(w0).addScaledVector(dir, -0.15); brush.quaternion.setFromUnitVectors(V3(0, 1, 0), dir); const L_ = Math.max(1.0, head.distanceTo(w0)); brush.scale.set(bOn, L_ / BL, bOn); }
  // ---- camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? win(t, tHit + 0.3, tHit + 0.8, 0.1) * 0.6 + win(t, tGrumpy - 0.1, tGrumpy + 0.7, 0.1) * 0.4 : 0.35 * (boing(t, tBoing1) + boing(t, tBoing2));
  applyCam(c, t, shk > 0.02 ? 0.06 * shk : 0);
  camera.updateMatrixWorld(true);
  screen = { head: project(HD.localToWorld(V3(0, 1.0, 0.3))), car: project(hero.localToWorld(V3(0, 2.0, 0))), body: project(WG.localToWorld(V3(0.6, 1.4, 0))) };
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
function zzz(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, -60); for (let k = 0; k < 3; k++) { const ph = ((t - a) * 0.8 + k / 3) % 1; ctx.save(); ctx.globalAlpha = win(t, a, b, 0.3) * Math.sin(Math.PI * ph); ctx.translate(x + 40 + ph * 90, y - ph * 170); ctx.rotate(-0.2); ctx.font = `900 ${50 + ph * 40}px Inter`; ctx.lineWidth = 10; ctx.strokeStyle = '#123'; ctx.strokeText('Z', 0, 0); ctx.fillStyle = '#fff'; ctx.fillText('Z', 0, 0); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('QUIET STREET', '#455a64', tQuiet - 0.1, tThirty - 0.1, 62);
    P_('30 ZONE', RED, tThirty - 0.1, tSpeed1 - 0.1, 66);
    P_('SPEED BUMP AHEAD', '#f9a825', tSpeed1 - 0.1, S('hook1').end + 0.3, 60, iconWarn);
    P_('THE BUMP... SNORED?', '#6d4c41', tSnored - 0.1, tIt2 - 0.1, 56);
    P_('WHISKERS?', '#8d6e63', tWhiskers - 0.1, tAnd2 - 0.05, 64);
    P_('TUSKS?!', '#8d6e63', tTusks - 0.1, tIts - 0.1, 66);
    P_("IT'S A SLEEPING WALRUS", '#5d4037', tWalrus - 0.15, S('hook2').end + 0.3, 54);
    zzz(t, 0.8, tIt2 - 0.2, screen.head); zzz(t, tIts - 0.2, S('hook2').end + 0.3, screen.head);
    P_("DON'T SLOW DOWN", RED, tDont - 0.1, tThey - 0.1, 60, iconWarn);
    P_('JUST DRIVE OVER IT', RED, tThey - 0.1, S('wrong1').end + 0.3, 58, iconX);
    floatText('BUMP!', 540, 780, t, tBump - 0.05, tBump + 0.9, 140, YEL, -0.1);
    P_('WALRUS: AWAKE', RED, tWakes - 0.1, tAndW - 0.1, 62, iconWarn);
    P_('VERY GRUMPY', RED, tAndW - 0.1, S('wrong2').end + 0.3, 64, iconX);
    floatText('HMPF!', 560, 700, t, tGrumpy + 0.05, tGrumpy + 1.0, 110, '#fff', 0.08);
    P_('FLIPPED ONTO HIS NOSE', RED, tFlips - 0.1, tLike - 0.1, 54, iconX);
    P_('LIKE A CIRCUS BALL', '#8e24aa', tLike - 0.1, tSpins - 0.1, 58);
    floatText('SPIN!', 540, 760, t, tSpins, tSpins + 0.9, 130, YEL, 0.1);
    P_('BACK ASLEEP', '#455a64', tFalls - 0.1, tStill - 0.1, 62); zzz(t, tFalls, tRew0, screen.head);
    P_('STILL HOLDING IT', RED, tStill - 0.1, tForever - 0.1, 58, iconX);
    if (t > tForever - 0.1 && t < tRew0) { const d = Math.floor(1 + 9998 * Math.pow(clamp((t - tForever) / 1.1), 2.5)); P_(`FOREVER · DAY ${d.toLocaleString('en-US')}`, RED, tForever - 0.1, tRew0, 52, iconX); }
  } else {
    P_('SPEED BUMP = SLOW DOWN', '#f9a825', tSpeedR - 0.1, tSo2 - 0.1, 52, iconWarn);
    P_('STOP. COMPLETELY.', GREEN, tStop - 0.1, S('right2').end + 0.3, 60, iconCheck);
    P_('WALRUSES LOVE BACK SCRATCHES', '#6d4c41', tWalruses - 0.1, tSo3 - 0.1, 44, iconHeart);
    P_('SNOW BRUSH: READY', '#1e88e5', tGrab - 0.1, S('right3').end + 0.3, 58, iconCheck);
    floatText('SCRATCH!', 400, 760, t, tScr1, tScr1 + 0.8, 100, YEL, -0.1); floatText('SCRATCH!', 680, 860, t, tScr2, tScr2 + 0.8, 100, YEL, 0.1);
    P_('HE SMILES', GREEN, tSmiles - 0.1, tAnd4 - 0.1, 64, iconHeart);
    P_('BELLY UP!', GREEN, tRolls - 0.1, S('right4').end + 0.3, 66, iconCheck);
    P_('SOFTEST SPEED BUMP IN TOWN', GREEN, tSoftest - 0.1, tBoing1 - 0.1, 46, iconCheck);
    floatText('BOING!', 420, 720, t, tBoing1, tBoing1 + 0.9, 130, YEL, -0.12); floatText('BOING!', 660, 840, t, tBoing2, tBoing2 + 0.9, 130, YEL, 0.12);
    bubble('BYE BYE! ♥', screen.head, t, tWaves - 0.1, S('right7').start - 0.1, 60, '#fff', '#c62828', -130);
  }
}
window.dbg = { carWrong, zRight, tGo };
start(update, hud);
