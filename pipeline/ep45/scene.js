// Episode 40: Car wash – the brushes are a giant octopus
// hook (old style): your car is filthy, so you drive into the car wash -> the brushes open an eye: it's a giant octopus.
// wrong: leave the window open a crack -> one arm slips in, then two, then all eight -> SPLASH: the car fills up with foam,
//        you come out with a bubble hairdo, the outside is still filthy (flies are back)
// right: close every window + turn up the music -> the octopus dances: 8 arms, 8 sponges, perfect rhythm ->
//        wheels, roof, bonnet, a little heart on the windscreen -> dries you off with one big puff -> spotless car, happy octopus
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, makeWheel,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, sun
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tFilthy = WT('hook1', 'filthy'), tSo = WT('hook1', 'So'), tWash = WT('hook1', 'wash');
const tBut = WT('hook2', 'But'), tBrushes = WT('hook2', 'brushes'), tEye = WT('hook2', 'eye'), tIts = WT('hook2', "It's"), tOct = WT('hook2', 'octopus'), tWhat = WT('hook2', 'What');
const tLeave = WT('wrong1', 'leave'), tWindow = WT('wrong1', 'window'), tJust = WT('wrong1', 'Just'), tCrack = WT('wrong1', 'crack');
const tBig = WT('wrong2', 'Big'), tOne = WT('wrong2', 'One'), tSlips = WT('wrong2', 'slips'), tTwo = WT('wrong2', 'two'), tAll = WT('wrong2', 'all'), tEight = WT('wrong2', 'eight');
const tSplash = WT('wrong3', 'Splash'), tFills = WT('wrong3', 'fills'), tFoam = WT('wrong3', 'foam'), tYou = WT('wrong3', 'You'), tCome = WT('wrong3', 'come'), tBubble = WT('wrong3', 'bubble'), tAnd3 = WT('wrong3', 'And'), tOutside = WT('wrong3', 'outside'), tStill = WT('wrong3', 'Still'), tFilthy2 = WT('wrong3', 'filthy');
const tClose = WT('right2', 'Close'), tWin2 = WT('right2', 'window'), tAndM = WT('right2', 'And'), tMusic = WT('right2', 'music');
const tLoves = WT('right3', 'loves'), tEightA = WT('right3', 'Eight', 0), tSponges = WT('right3', 'sponges'), tPerfect = WT('right3', 'Perfect');
const tWheels = WT('right4', 'Wheels'), tRoof = WT('right4', 'Roof'), tBonnet = WT('right4', 'Bonnet'), tAndH = WT('right4', 'And'), tHeart = WT('right4', 'heart');
const tDries = WT('right5', 'dries'), tWith = WT('right5', 'With'), tPuff = WT('right5', 'puff');
const tSpotless = WT('right6', 'Spotless'), tHappy = WT('right6', 'Happy');
const isRight = t => t >= tRew0 + 0.5;
const C0 = tMusic - 0.05, CB = 60 / 118;            // concert beat (mix_ep.py)
const beatPh = t => (t - C0) / CB;                  // beats since the music started

function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}

// ---------------- world: petrol-station car wash ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 18 && z > -60 && z < 60, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 22 && Math.abs(z) - d / 2 < 70, near: [0, 0, 140, 200], trees: 1300, seed: 405 });
plane(-3.6, 3.6, -80, 80, asphaltMat, 0.05, 7);
{ const pad = L('#c9c4bb'); const p = new THREE.Mesh(new THREE.BoxGeometry(14, 0.08, 18), pad); p.position.set(0, 0.04, -1); p.receiveShadow = true; scene.add(p);
  const st = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c9c4bb'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 3; for (let k = 0; k <= w; k += 64) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k, h); c.stroke(); c.beginPath(); c.moveTo(0, k); c.lineTo(w, k); c.stroke(); } }, true);
  st.repeat.set(4, 5); p.material = L('#ffffff', { map: st });
  // wet floor + drain + guide rails
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 8.6), STD('#7f8c99', { roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.45 })); wet.rotation.x = -Math.PI / 2; wet.position.set(0, 0.09, 0); wet.receiveShadow = true; scene.add(wet);
  const dr = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.3), STD('#37474f', { roughness: 0.6 })); dr.rotation.x = -Math.PI / 2; dr.position.set(0, 0.1, 0); scene.add(dr);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 9.5), STD('#ffd60a', { roughness: 0.5 })); r.position.set(s * 1.45, 0.14, 0); r.castShadow = true; scene.add(r); } }
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -80; z < 80; z += 7) if (Math.abs(z + 1) > 10) dl.push([0, 0.07, z]); instanced(g, markMat, dl, false); }
// car-wash portal frame
const FX = 2.95, FZ = 4.2, FH = 4.0;
{ const m = STD('#eceff1', { roughness: 0.4, metalness: 0.3 }), bl = STD('#1e88e5', { roughness: 0.4, metalness: 0.2 });
  for (const x of [-FX, FX]) for (const z of [-FZ, FZ]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.32, FH, 0.32), m); p.position.set(x, FH / 2, z); scene.add(p);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.5), bl); f.position.set(x, 0.12, z); scene.add(f); }
  for (const x of [-FX, FX]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, FZ * 2 + 0.36), bl); b.position.set(x, FH - 0.05, 0); scene.add(b); }
  for (const z of [-FZ, FZ]) { const b = new THREE.Mesh(new THREE.BoxGeometry(FX * 2 + 0.36, 0.42, 0.36), bl); b.position.set(0, FH - 0.05, z); scene.add(b); }
  const sgT = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 120px Inter'; c.textAlign = 'center'; c.fillText('CAR WASH', w / 2, 140);
    c.fillStyle = '#4fc3f7'; for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(40 + k * 118, 18 + (k % 2) * 8, 8 + (k % 3) * 3, 0, Math.PI * 2); c.fill(); } });
  const sg = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 0.12), [bl, bl, bl, bl, L('#fff', { map: sgT }), bl]); sg.position.set(0, FH - 0.7, FZ + 0.22); scene.add(sg);
  const sg2 = sg.clone(); sg2.position.z = -FZ - 0.22; sg2.rotation.y = Math.PI; scene.add(sg2);
  scene.traverse(o => { if (o.isMesh && (o.material === m || o.material === bl || o === sg || o === sg2)) { o.castShadow = true; o.receiveShadow = true; } }); }
// kiosk + price sign
{ const k = new THREE.Group(); k.position.set(-10.5, 0, 7); scene.add(k);
  const b = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4), STD('#fafafa', { roughness: 0.6 })); b.position.y = 1.5; k.add(b);
  const r = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.3, 4.6), STD('#e53935')); r.position.y = 3.1; k.add(r);
  const gw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 3.0), STD('#9fc6e0', { roughness: 0.05, metalness: 0.5 })); gw.position.set(2.51, 1.5, 0); k.add(gw);
  k.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const ps = new THREE.Group(); ps.position.set(-6.0, 0, 10.5); scene.add(ps);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 8), STD('#90a4ae', { metalness: 0.6 })); pole.position.y = 1.7; ps.add(pole);
  const pt = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#0d47a1'; c.font = '900 56px Inter'; c.textAlign = 'center'; c.fillText('WASH', w / 2, 90); c.font = '900 92px Inter'; c.fillText('€5', w / 2, 200); });
  const pb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.1), [L('#ffd60a'), L('#ffd60a'), L('#ffd60a'), L('#ffd60a'), L('#fff', { map: pt }), L('#fff', { map: pt })]); pb.position.y = 3.6; ps.add(pb); pb.castShadow = true; pole.castShadow = true; }

// ---------------- hero car (filthy) ----------------
const hero = makeCar('#f3efe4');
const heroGlass = hero.userData.bodyG.children[1].material; heroGlass.color.set('#56789a'); const glassCol0 = heroGlass.color.clone();
const mud = [];
{ const mm = STD('#6b4a2b', { roughness: 0.95 }), mm2 = STD('#82603b', { roughness: 0.95 }); const R = rng(77); const sg = new THREE.SphereGeometry(1, 10, 8);
  const add = (x, y, z, sx, sy, sz, reg) => { const m = new THREE.Mesh(sg, R() < 0.5 ? mm : mm2); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = false; hero.userData.bodyG.add(m); mud.push({ m, reg, h: R() }); };
  for (const s of [-1, 1]) {
    for (let k = 0; k < 9; k++) { const z = -1.7 + R() * 3.4, y = 0.48 + R() * 0.34, r = 0.1 + R() * 0.16; add(s * 0.985, y, z, 0.03, r * 0.8, r * 1.3, 'side'); }
    for (const zc of [-1.38, 1.38]) for (let k = 0; k < 4; k++) { const a = Math.PI * (0.15 + R() * 0.7), r = 0.08 + R() * 0.1; add(s * 0.985, 0.3 + Math.sin(a) * 0.52, zc + Math.cos(a) * 0.52, 0.035, r, r * 1.4, 'wheel'); }
  }
  for (let k = 0; k < 7; k++) add(-0.6 + R() * 1.2, 1.0, -1.95 + R() * 0.8, 0.12 + R() * 0.12, 0.025, 0.1 + R() * 0.1, 'bonnet');
  for (let k = 0; k < 6; k++) add(-0.55 + R() * 1.1, 1.648, -0.45 + R() * 0.95, 0.1 + R() * 0.1, 0.02, 0.1 + R() * 0.1, 'roof');
  for (let k = 0; k < 5; k++) add(-0.6 + R() * 1.2, 0.99, 1.35 + R() * 0.6, 0.1 + R() * 0.1, 0.025, 0.1 + R() * 0.08, 'boot'); }
// window gap (driver side = left)
const gap = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.075), new THREE.MeshBasicMaterial({ color: '#050505' })); gap.rotation.y = -Math.PI / 2; gap.position.set(-0.8, 1.415, -0.15); hero.userData.bodyG.add(gap);
// driver head with bubble hairdo (pops out of the sunroof in the wrong way)
const drv = new THREE.Group(); hero.userData.bodyG.add(drv); drv.position.set(-0.3, 1.2, 0.05);
const sunroof = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.62), new THREE.MeshBasicMaterial({ color: '#111' })); sunroof.rotation.x = -Math.PI / 2; sunroof.position.set(-0.3, 1.652, 0.05); hero.userData.bodyG.add(sunroof);
const hair = new THREE.Group();
{ const sk = STD('#f1c27d'); const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), sk); head.position.y = 0.55; drv.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 12), STD('#43a047')); neck.position.y = 0.2; drv.add(neck);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), STD('#111')); e.position.set(s * 0.08, 0.6, -0.2); drv.add(e); }
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), STD('#7a2a1a')); mo.rotation.z = Math.PI; mo.position.set(0, 0.48, -0.205); drv.add(mo);
  hair.position.y = 0.72; drv.add(hair); const fm = STD('#ffffff', { roughness: 0.35, envMapIntensity: 1.3 }); const R = rng(9);
  for (let k = 0; k < 22; k++) { const a = R() * Math.PI * 2, h = R(); const r = 0.12 + R() * 0.1; const b = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), fm); const rad = 0.24 * (1 - h * 0.55); b.position.set(Math.cos(a) * rad, h * 0.75, Math.sin(a) * rad); hair.add(b); }
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), fm); top.position.y = 0.92; hair.add(top);
  drv.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// flies
const flies = [0, 1, 2].map(k => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), STD('#111')); g.add(b);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.07, 10), new THREE.MeshBasicMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.7, side: THREE.DoubleSide })); w.position.set(s * 0.07, 0.04, 0); w.rotation.x = -Math.PI / 2; g.add(w); g.userData['w' + s] = w; }
  scene.add(g); return g; });

// machine housing that hides the octopus until the reveal (portholes for the eyes)
const housing = new THREE.Group(); scene.add(housing);
{ const bl = STD('#1565c0', { roughness: 0.35, metalness: 0.25 }), inv = new THREE.MeshBasicMaterial({ visible: false });
  const hw = 5.7, hh = 3.9, hd = 4.7;
  const box = new THREE.Mesh(new THREE.BoxGeometry(hw, hh, hd), [bl, bl, bl, inv, inv, bl]); box.position.set(0, hh / 2, 0); housing.add(box);
  const fT = canvasTex(512, 352, (c, w, h) => { c.fillStyle = '#1976d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#0d47a1'; c.fillRect(0, h - 70, w, 70);
    c.fillStyle = '#fff'; c.font = '900 52px Inter'; c.textAlign = 'center'; c.fillText('SUPER SHINE 3000', w / 2, h - 22);
    c.fillStyle = '#ffd60a'; for (let k = 0; k < 6; k++) c.fillRect(30 + k * 80, 26, 40, 14);
    c.globalCompositeOperation = 'destination-out'; for (const s2 of [-1, 1]) { c.beginPath(); c.arc(w / 2 + s2 * 0.72 / hw * w, h * (1 - (1.67 + 0.0) / hh), 0.56 / hw * w, 0, Math.PI * 2); c.fill(); } });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(hw, hh), STD('#fff', { map: fT, transparent: true, alphaTest: 0.5, roughness: 0.4 })); front.position.set(0, hh / 2, hd / 2); housing.add(front);
  for (const s2 of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.08, 10, 28), STD('#cfd8dc', { metalness: 0.8, roughness: 0.25 })); ring.position.set(s2 * 0.72, 1.67, hd / 2 + 0.02); housing.add(ring); }
  housing.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const HOUSE0 = V3(0, 4.0, 0);

// ---------------- octopus ----------------
const OC = V3(0, 5.75, 0);
const oct = new THREE.Group(); oct.position.copy(OC); scene.add(oct);
const O = {};
{ const skinT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#a45bd0'; c.fillRect(0, 0, w, h); const R = rng(5); for (let k = 0; k < 70; k++) { c.fillStyle = R() < 0.5 ? 'rgba(120,50,170,0.55)' : 'rgba(205,140,240,0.45)'; c.beginPath(); c.arc(R() * w, R() * h * 0.8, 4 + R() * 12, 0, Math.PI * 2); c.fill(); } });
  const skin = STD('#ffffff', { map: skinT, roughness: 0.42, envMapIntensity: 1.1 }); O.skin = skin;
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), skin); body.scale.set(2.2, 2.4, 2.2); body.castShadow = true; body.receiveShadow = true; oct.add(body); O.body = body;
  const base = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), skin); base.scale.set(1.75, 0.7, 1.75); base.position.y = -1.85; base.castShadow = true; oct.add(base);
  const wh = STD('#ffffff', { roughness: 0.25 }), bk = STD('#111111', { roughness: 0.2 });
  O.eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.8, 0.3, 1.88); oct.add(e);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 18), wh.clone()); e.add(w);
    const p = new THREE.Group(); e.add(p); const pu = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 14), bk); pu.position.z = 0.36; p.add(pu);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(0.08, 0.1, 0.58); p.add(hl);
    const lid = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 24, Math.PI), STD('#7b3aa6')); lid.position.z = 0.12; e.add(lid);
    return { g: e, w, p, lid }; });
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 10, 24, Math.PI), STD('#5a1f73', { roughness: 0.4 })); mo.rotation.z = Math.PI; mo.position.set(0, -0.6, 2.08); mo.rotation.x = -0.15; oct.add(mo); O.mouth = mo;
  const om = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), STD('#5a1f73')); om.scale.set(1, 1, 0.4); om.position.set(0, -0.75, 2.05); oct.add(om); O.oMouth = om;
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), STD('#ff8fc4', { roughness: 0.6 })); ch.scale.set(1, 0.6, 0.3); ch.position.set(s * 1.3, -0.35, 1.68); ch.rotation.y = s * 0.6; oct.add(ch); } }

// tentacles: tube along a cubic Bezier + travelling wiggle, rebuilt every frame
const NS = 44, NR = 14;
const tentT = canvasTex(256, 1024, (c, w, h) => { c.fillStyle = '#a45bd0'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2b6e6'; c.fillRect(0, 0, w * 0.36, h);
  for (let y = 20; y < h; y += 46) for (const x of [0.09, 0.27]) { c.fillStyle = '#e48fd2'; c.beginPath(); c.arc(x * w, y + (x > 0.2 ? 23 : 0), 15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fbd3f2'; c.beginPath(); c.arc(x * w, y + (x > 0.2 ? 23 : 0), 7, 0, Math.PI * 2); c.fill(); } });
const tentMat = STD('#ffffff', { map: tentT, roughness: 0.42, envMapIntensity: 1.1 });
function makeTent() {
  const g = new THREE.BufferGeometry(); const pos = new Float32Array(NS * (NR + 1) * 3), uv = new Float32Array(NS * (NR + 1) * 2), idx = [];
  for (let i = 0; i < NS; i++) for (let j = 0; j <= NR; j++) { uv[(i * (NR + 1) + j) * 2] = j / NR; uv[(i * (NR + 1) + j) * 2 + 1] = i / (NS - 1); }
  for (let i = 0; i < NS - 1; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  const m = new THREE.Mesh(g, tentMat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m;
}
const bez = (P, s) => { const u = 1 - s; return V3(0, 0, 0).addScaledVector(P[0], u * u * u).addScaledVector(P[1], 3 * u * u * s).addScaledVector(P[2], 3 * u * s * s).addScaledVector(P[3], s * s * s); };
const _sp = [], _tn = [];
function buildTent(mesh, P, wig, t, ph, r0) {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < NS; i++) { const s = i / (NS - 1); _sp[i] = bez(P, s); }
  // wiggle perpendicular-ish
  for (let i = 0; i < NS; i++) { const s = i / (NS - 1); const w = wig * s * s; _sp[i].x += w * Math.sin(s * 7 - t * 3.1 + ph); _sp[i].y += w * 0.6 * Math.sin(s * 6 - t * 2.6 + ph * 1.7); _sp[i].z += w * Math.cos(s * 7.5 - t * 2.9 + ph); }
  for (let i = 0; i < NS; i++) { const a = _sp[Math.max(0, i - 1)], b = _sp[Math.min(NS - 1, i + 1)]; _tn[i] = b.clone().sub(a).normalize(); }
  let n = new THREE.Vector3().crossVectors(_tn[0], V3(0.3, 0.2, 1).normalize()).normalize();
  for (let i = 0; i < NS; i++) {
    const tn = _tn[i]; n.addScaledVector(tn, -n.dot(tn)).normalize(); const b = new THREE.Vector3().crossVectors(tn, n);
    const s = i / (NS - 1); let r = r0 * (1 - 0.82 * Math.pow(s, 0.9)); if (i === NS - 1) r = 0.01; if (i === NS - 2) r *= 0.7;
    for (let j = 0; j <= NR; j++) { const a = j / NR * Math.PI * 2; const c = Math.cos(a), sn = Math.sin(a);
      pos.setXYZ(i * (NR + 1) + j, _sp[i].x + (n.x * c + b.x * sn) * r, _sp[i].y + (n.y * c + b.y * sn) * r, _sp[i].z + (n.z * c + b.z * sn) * r); }
  }
  pos.needsUpdate = true; mesh.geometry.computeVertexNormals(); mesh.geometry.computeBoundingSphere();
  return _sp[NS - 1].clone();
}
const ANG = [-60, -25, 25, 60, 240, 205, 155, 120].map(d => d * Math.PI / 180);
const arms = ANG.map((a, k) => ({ k, a, s: k < 4 ? 1 : -1, j: k % 4, zj: [-1, -0.38, 0.38, 1][k % 4], mesh: makeTent(), ph: hash(k + 3) * 6 }));
// sponges
const spongeT = canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#ffd54f'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(200,140,0,0.5)'; const R = rng(3); for (let k = 0; k < 60; k++) { c.beginPath(); c.arc(R() * w, R() * h, 1 + R() * 3, 0, Math.PI * 2); c.fill(); } c.fillStyle = '#43a047'; c.fillRect(0, 0, w, 14); }, true);
arms.forEach(A => { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.34), STD('#fff', { map: spongeT, roughness: 0.9 })); sp.castShadow = true; scene.add(sp); A.sponge = sp; });
// heart drawn in foam on the windscreen
const heartT = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.shadowColor = 'rgba(255,255,255,0.8)'; c.shadowBlur = 10; c.beginPath(); const x = w / 2, y = h * 0.42, r = w * 0.36;
  c.moveTo(x, y + r * 1.05); c.bezierCurveTo(x - r * 1.7, y - r * 0.1, x - r * 0.7, y - r * 1.25, x, y - r * 0.35); c.bezierCurveTo(x + r * 0.7, y - r * 1.25, x + r * 1.7, y - r * 0.1, x, y + r * 1.05); c.fill();
  c.fillStyle = '#ff8fc4'; c.beginPath(); const r2 = r * 0.55; c.moveTo(x, y + r2 * 1.05); c.bezierCurveTo(x - r2 * 1.7, y - r2 * 0.1, x - r2 * 0.7, y - r2 * 1.25, x, y - r2 * 0.35); c.bezierCurveTo(x + r2 * 0.7, y - r2 * 1.25, x + r2 * 1.7, y - r2 * 0.1, x, y + r2 * 1.05); c.fill(); });
const heart = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshStandardMaterial({ map: heartT, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -4 }));
{ const nrm = V3(0, 0.38, -0.45).normalize(); heart.quaternion.setFromUnitVectors(V3(0, 0, 1), nrm); heart.rotateZ(Math.PI); heart.position.set(0, 1.2, -0.885).addScaledVector(nrm, 0.085); hero.userData.bodyG.add(heart); }
const WS = { c: V3(0, 1.2, -0.885), u: V3(1, 0, 0), v: V3(0, 0.45, 0.38).normalize() };   // windscreen frame (car local)

// foam (instanced)
const NF = 300; const foamM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 9), STD('#ffffff', { roughness: 0.35, envMapIntensity: 1.2 }), NF); foamM.frustumCulled = false; foamM.castShadow = true; scene.add(foamM);
{ const c = new THREE.Color(); for (let i = 0; i < NF; i++) foamM.setColorAt(i, c.setHSL(0.58 + hash(i) * 0.08, 0.6, 0.93 + hash(i + 1) * 0.06)); }
// wind streaks for the puff
const NW = 26; const wind = Array.from({ length: NW }, (_, i) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 1.4, 3, 6), new THREE.MeshBasicMaterial({ color: '#e3f6ff', transparent: true, opacity: 0.8 })); scene.add(m); return m; });

// ---------------- motion ----------------
const carZW = mono([[0, 24], [2.0, 15], [4.6, 3.2], [6.4, 0], [tYou - 0.1, 0], [tYou + 1.4, -9.5], [40, -9.5]]);
const carZR = mono([[0, 0], [tSpotless - 0.35, 0], [tSpotless + 1.3, -9.0], [80, -9.0]]);
const carZ = t => isRight(t) ? carZR(t) : carZW(t);

// arm poses -> [P0, P1, P2, P3, wiggle]
const baseOf = A => V3(1.3 * Math.cos(A.a), OC.y - 1.85, 1.3 * Math.sin(A.a));
const POSE = {
  brush: (A, t) => { const B = baseOf(A); return [B, B.clone().add(V3(A.s * 0.5, -1.0, 0)), V3(A.s * 2.15, 2.1, A.zj * 2.5), V3(A.s * 2.15, 0.25, A.zj * 2.5 + 0.05 * Math.sin(t * 3 + A.ph)), 0.04]; },
  wave: (A, t, sp = 3.0) => { const B = baseOf(A); const w = Math.sin(t * sp + A.k * 0.9); return [B, B.clone().add(V3(A.s * 1.2, 0.3, A.zj * 0.8)), B.clone().add(V3(A.s * 3.0, 1.3 + 0.5 * Math.sin(t * sp * 0.8 + A.k), A.zj * 2.1)), B.clone().add(V3(A.s * 4.1, 0.7 + 1.3 * w, A.zj * 3.1)), 0.28]; },
  idle: (A, t) => { const B = baseOf(A); return [B, B.clone().add(V3(A.s * 1.0, 0.0, A.zj * 0.6)), V3(A.s * 3.0, 3.6, A.zj * 2.8), V3(A.s * 3.3, 2.4 + 0.35 * Math.sin(t * 1.7 + A.ph), A.zj * 3.3), 0.18]; },
  peek: (A, t) => { const B = baseOf(A); const G = V3(-1.05, 1.42, -0.15); return [B, B.clone().add(V3(-0.5, -0.4, 0)), V3(-2.3, 2.2, -0.6), G.clone().add(V3(-0.35, 0.05 * Math.sin(t * 6), 0.05 * Math.cos(t * 5))), 0.05]; },
  slip: (A, t) => { const B = baseOf(A); const z = carZ(t); const G = V3(-0.55, 1.4, -0.4 + A.j * 0.2 + z); const up = A.s > 0;
    return [B, B.clone().add(up ? V3(-1.0, 1.1, 0) : V3(-1.2, -0.5, 0)), V3(-2.5, 1.5, -0.4 + A.zj * 0.6 + z * 0.5), G, 0.05]; },
  dance: (A, t) => { const B = baseOf(A); const b = beatPh(t) * Math.PI; const sw = Math.sin(b); return [B, B.clone().add(V3(A.s * 1.1, 0.2, A.zj * 0.7)), B.clone().add(V3(A.s * 2.6 + 0.8 * sw, 1.0 + 0.4 * Math.abs(sw), A.zj * 2.0)), B.clone().add(V3(A.s * 3.5 + 1.6 * sw, 0.6 + 1.2 * Math.abs(Math.sin(b + A.j * 0.5)), A.zj * 2.8)), 0.12]; },
  spread: (A, t) => { const B = baseOf(A); return [B, B.clone().add(V3(A.s * 1.0, 0.5, A.zj * 0.6)), B.clone().add(V3(A.s * 2.6, 2.4, A.zj * 2.2)), B.clone().add(V3(A.s * 3.4, 3.6 + 0.2 * Math.sin(t * 9 + A.k), A.zj * 3.4)), 0.08]; },
};
// scrub targets (car-local) per phase
const TG = {
  gen: [[0.45, 1.16, -1.55], [1.13, 0.78, -0.5], [1.13, 0.78, 0.8], [0.45, 1.16, 1.65], [-0.45, 1.16, -1.55], [-1.13, 0.78, -0.5], [-1.13, 0.78, 0.8], [-0.45, 1.16, 1.65]],
  wheels: { 1: [1.2, 0.38, -1.38], 2: [1.2, 0.38, 1.38], 5: [-1.2, 0.38, -1.38], 6: [-1.2, 0.38, 1.38] },
  roof: { 1: [0.32, 1.8, -0.25], 2: [0.32, 1.8, 0.5], 5: [-0.32, 1.8, -0.25], 6: [-0.32, 1.8, 0.5] },
};
const heartPath = s => { const a = s * Math.PI * 2; const x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); return [x / 17 * 0.3, y / 17 * 0.3]; };
function scrubPose(phase) {
  return (A, t) => { const B = baseOf(A); const z = carZ(t); let tg = TG.gen[A.k], roofy = false, amp = 0.16;
    if (phase === 'wheels' && TG.wheels[A.k]) tg = TG.wheels[A.k];
    if (phase === 'roof' && TG.roof[A.k]) { tg = TG.roof[A.k]; roofy = true; }
    if (phase === 'bonnet' && (A.k === 0 || A.k === 4)) amp = 0.24;
    const T = V3(tg[0], tg[1], tg[2] + z); const b = beatPh(t) * Math.PI;
    let P3;
    if (phase === 'heart' && A.k === 0) { const u = clamp((t - (tHeart - 0.55)) / 1.0); const [hx, hy] = heartPath(u * 0.999); const c = WS.c.clone().addScaledVector(WS.u, hx * 1.25).addScaledVector(WS.v, hy * 1.25 + 0.04).add(V3(0, 0.12, -0.1 + z)); const away = ease(clamp((t - (tHeart + 0.5)) / 0.5)); P3 = c.lerp(V3(1.4, 2.6, -2.2 + z), away); return [B, B.clone().add(V3(0.4, -0.6, -0.6)), V3(0.6, 2.6, -2.6 + z), P3, 0.02]; }
    const side = Math.abs(tg[0]) > 1.0; const o1 = amp * Math.cos(b * 2 + A.ph), o2 = amp * Math.sin(b * 2 + A.ph);
    P3 = side ? T.clone().add(V3(0, o1 * 0.8, o2)) : T.clone().add(V3(o1, 0, o2));
    const P2 = roofy ? T.clone().add(V3(A.s * 0.7, 1.4, 0)) : T.clone().add(V3(A.s * (side ? 1.2 : 0.6), side ? 0.9 : 1.6, side ? 0 : A.zj * 0.3));
    return [B, B.clone().add(V3(A.s * 0.9, -0.3, A.zj * 0.5)), P2, P3, 0.03]; };
}
POSE.scrub = scrubPose('gen'); POSE.wheels = scrubPose('wheels'); POSE.roof = scrubPose('roof'); POSE.bonnet = scrubPose('bonnet'); POSE.heart = scrubPose('heart');
POSE.happy = (A, t) => POSE.wave(A, t, 4.2);
// per-arm schedules [t0, pose, blend]
const slipT = { 5: tOne - 0.15, 4: tTwo - 0.2 };
const sched = arms.map(A => {
  const s = [[0, 'brush', 0.1], [tIts - 0.1, 'wave', 0.9], [S('wrong1').start - 0.3, 'idle', 0.8]];
  if (A.k === 4) s.push([tWindow - 0.2, 'peek', 0.9]);
  const ts = slipT[A.k] != null ? slipT[A.k] : tEight - 0.35 + [0, 0.07, 0.14, 0.21, 0, 0, 0.28, 0.35][A.k];
  s.push([ts, 'slip', 0.55]); s.push([tYou - 0.3, 'wave', 0.6]);
  s.push([tRew0 + 0.6, 'idle', 0.1]); s.push([tMusic - 0.1, 'dance', 0.7]); s.push([tSponges - 0.35, 'scrub', 0.6]);
  s.push([tWheels - 0.3, 'wheels', 0.35]); s.push([tRoof - 0.25, 'roof', 0.35]); s.push([tBonnet - 0.25, 'bonnet', 0.35]); s.push([tHeart - 0.75, 'heart', 0.3]);
  s.push([S('right4').end + 0.1, 'scrub', 0.4]); s.push([tDries - 0.2, 'spread', 0.8]); s.push([tSpotless - 0.3, 'happy', 0.7]);
  return s; });
function armCtrl(A, t) {
  const s = sched[A.k]; let i = 0; while (i < s.length - 1 && s[i + 1][0] <= t) i++;
  const cur = POSE[s[i][1]](A, t); if (i === 0) return cur; const prev = POSE[s[i - 1][1]](A, t);
  const u = ease(clamp((t - s[i][0]) / s[i][2])); return cur.map((v, k) => k < 4 ? prev[k].clone().lerp(v, u) : lerp(prev[k], v, u));
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const CarCam = (off, look, fov = 40) => t => { const z = carZ(t); return [V3(off[0], off[1], z + off[2]), V3(look[0], look[1], z + look[2]), fov]; };
const camKeys = [
  [0.0, CarCam([-4.6, 2.0, -7.6], [-0.2, 1.1, 0.3], 40)],
  [tSo - 0.3, CarCam([-4.0, 1.9, -7.0], [-0.2, 1.1, 0.3], 40)],
  ...cut(tSo - 0.25, Ac([5.5, 5.0, 26], [0.0, 2.6, 0.0])),
  [tBut - 0.3, Ac([4.4, 4.6, 21], [0.0, 2.8, 0.0])],
  ...cut(tBut - 0.25, Ac([0.6, 2.6, 14.0], [0.0, 4.4, 0.0], 40)),
  [tIts - 0.2, Ac([0.5, 2.9, 12.0], [0.0, 4.9, 0.0], 40)],
  [tOct + 0.3, Ac([0.4, 3.6, 18.5], [0.0, 3.9, 0.0], 40)],
  ...cut(tWhat - 0.25, Ac([13.0, 6.0, 19.5], [0.0, 6.4, 0.0])),
  [S('wrong1').start - 0.2, Ac([12.4, 6.2, 18.5], [0.0, 6.4, 0.0])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([-4.4, 2.1, -3.2], [-0.85, 1.35, -0.1], 40)),
  [tCrack - 0.4, Ac([-3.4, 1.8, -2.4], [-0.85, 1.38, -0.15], 40)],
  [tBig - 0.1, Ac([-3.2, 1.8, -2.2], [-0.85, 1.38, -0.15], 40)],
  ...cut(tBig - 0.05, Ac([-8.4, 2.3, -4.0], [-0.8, 2.0, 0.0])),
  [tEight + 0.3, Ac([-8.0, 2.4, -3.6], [-0.8, 2.1, 0.0])],
  ...cut(tSplash - 0.08, Ac([-6.2, 2.9, 4.5], [-0.3, 1.6, -0.2])),
  [tCome - 0.5, Ac([-6.6, 3.1, 4.8], [-0.3, 1.7, -0.6])],
  ...cut(tCome - 0.45, Ac([-4.0, 2.6, -18.5], [-0.3, 1.8, -9.5])),
  [tAnd3 - 0.2, Ac([-3.6, 2.5, -17.6], [-0.3, 1.9, -9.5])],
  ...cut(tAnd3 - 0.15, Ac([-7.5, 3.6, -15.5], [-0.3, 1.3, -9.3])),
  [tRew0, Ac([-7.0, 3.4, -15.0], [-0.3, 1.3, -9.3])],
  // right
  ...cut(tRew1, Ac([0.5, 5.4, 16], [0.0, 3.2, 0.0])),
  [tClose - 0.25, Ac([0.4, 5.0, 14.5], [0.0, 3.2, 0.0])],
  ...cut(tClose - 0.2, Ac([-3.4, 1.8, -2.4], [-0.85, 1.38, -0.15], 40)),
  [tAndM - 0.2, Ac([-3.3, 1.8, -2.3], [-0.85, 1.38, -0.15], 40)],
  ...cut(tAndM - 0.15, Ac([-1.5, 6.2, 16.5], [0.0, 3.6, 0.0])),
  [tEightA - 0.3, Ac([-1.0, 6.6, 15.0], [0.0, 3.4, 0.0])],
  ...cut(tSponges - 0.3, Ac([7.2, 4.4, 1.2], [0.0, 1.7, 0.0])),
  [tWheels - 0.25, Ac([6.8, 4.2, 0.4], [0.0, 1.6, 0.0])],
  ...cut(tWheels - 0.2, Ac([4.4, 1.5, -2.6], [1.1, 0.45, -1.4], 40)),
  ...cut(tRoof - 0.15, Ac([3.4, 3.7, 3.6], [0.0, 1.6, 0.0], 40)),
  ...cut(tBonnet - 0.15, Ac([2.2, 2.4, -6.0], [0.0, 1.0, -1.6], 40)),
  ...cut(tAndH - 0.15, Ac([0.4, 2.9, -3.75], [0.0, 1.15, -0.85], 40)),
  [S('right4').end + 0.2, Ac([0.4, 2.85, -3.65], [0.0, 1.15, -0.85], 40)],
  ...cut(S('right5').start - 0.2, Ac([-11.0, 4.6, -4.5], [0.0, 3.6, 0.0])),
  [tPuff - 0.2, Ac([-12.0, 4.8, -5.0], [0.0, 3.7, 0.0])],
  [tSpotless - 0.3, Ac([-12.3, 4.9, -5.2], [0.0, 3.7, 0.0])],
  ...cut(tSpotless - 0.25, Ac([-3.0, 2.0, -19.5], [0.0, 3.4, -4.0])),
  [S('right7').start, Ac([-3.6, 2.5, -20.5], [0.0, 3.6, -3.0])],
  [S('outro').start, Ac([-5.0, 3.6, -22.0], [0.0, 3.0, -3.0])],
  [TOTAL - 0.3, Ac([-7.5, 7.5, -26.0], [0.0, 3.0, -2.0])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const tips = [];
function update(t) {
  const right = isRight(t);
  // car
  const z = carZ(t); const foamIn = !right ? ramp(t, tFills - 0.2, tFoam + 0.2) : 0;
  const swell = !right ? win(t, tSplash - 0.05, tCome, 0.15) : 0;
  placeCar(hero, { x: 0, z, h: 0, y: 0.05 * swell * Math.abs(Math.sin(t * 9)) });
  hero.userData.bodyG.scale.set(1 + 0.05 * swell * (0.6 + 0.4 * Math.sin(t * 11)), 1 + 0.04 * swell * (0.6 + 0.4 * Math.cos(t * 9)), 1);
  if (right) { const bop = t > tMusic && t < tDries ? Math.abs(Math.sin(beatPh(t) * Math.PI)) : 0; hero.userData.bodyG.position.y = 0.04 * bop; }
  blink(hero, t, false, false);
  heroGlass.color.copy(glassCol0).lerp(new THREE.Color('#f4f8ff'), foamIn); heroGlass.metalness = lerp(0.6, 0.0, foamIn); heroGlass.roughness = lerp(0.12, 0.6, foamIn);
  // shine at the end of the right way
  const shine = right ? ramp(t, tPuff, tPuff + 0.6) : 0; hero.userData.body.envMapIntensity = 1.3 + 1.2 * shine; hero.userData.body.roughness = 0.22 - 0.12 * shine;
  // mud
  mud.forEach(M => { let v = true;
    if (right) { const tc = M.reg === 'wheel' ? tWheels - 0.05 + M.h * 0.3 : M.reg === 'roof' ? tRoof + 0.1 + M.h * 0.35 : M.reg === 'bonnet' ? tBonnet + 0.1 + M.h * 0.35 : tSponges + 0.3 + M.h * (tWheels - tSponges - 0.5);
      v = t < tc; }
    M.m.visible = v; });
  // window gap
  const gapH = right ? 1 - ramp(t, tClose, tWin2 + 0.2) : 1; gap.scale.y = Math.max(0.001, gapH); gap.visible = gapH > 0.01;
  // driver + hairdo
  const up = !right ? ramp(t, tBubble - 0.75, tBubble - 0.2) : 0; drv.visible = up > 0.01; sunroof.visible = up > 0.01; drv.position.y = lerp(1.0, 1.42, up);
  const hp = !right ? back((t - tBubble + 0.15) / 0.4) : 0; hair.scale.setScalar(Math.max(0.001, hp)); hair.rotation.z = 0.08 * Math.sin(t * 3);
  // flies
  const flyOn = !right && (t < tBut + 0.2 || t > tOutside - 0.4);
  flies.forEach((f, k) => { f.visible = flyOn; const a = t * (2.4 + k * 0.7) + k * 2.1; f.position.set(0.9 * Math.cos(a) + 0.2 * Math.sin(t * 7 + k), 2.05 + 0.25 * Math.sin(t * 3.3 + k), z + 1.2 * Math.sin(a) + 0.2 * Math.cos(t * 5 + k)); f.rotation.y = -a;
    const fl = Math.sin(t * 90 + k) * 0.6; f.userData['w-1'].rotation.z = fl; f.userData['w1'].rotation.z = -fl; });
  // octopus body
  const eyeOpen = !right ? ramp(t, tEye - 0.25, tEye + 0.1) : 1;
  const breath = 1 + 0.025 * Math.sin(t * 2.0);
  const inflate = right ? ramp(t, tDries - 0.1, tPuff - 0.05) * (1 - ramp(t, tPuff - 0.05, tPuff + 0.25)) : 0;
  const dance = right && t > tMusic && t < tDries ? 1 : 0; const bph = beatPh(t) * Math.PI;
  const rise = !right ? ramp(t, tIts - 0.25, tIts + 0.35) : 1;
  oct.position.set(dance ? 0.25 * Math.sin(bph) : 0, OC.y + 0.0 * rise - 0.35 * (1 - rise) + (dance ? 0.22 * Math.abs(Math.sin(bph)) : 0) + 0.12 * Math.sin(t * 1.6) * rise, 0);
  const sc = breath * (1 + 0.35 * inflate) * lerp(0.9, 1, rise);
  { // housing flies off at the reveal and lands beside the car wash
    const u = clamp((t - (tIts - 0.15)) / 1.1); const hp2 = u <= 0 || right ? HOUSE0.clone() : null;
    if (right || u >= 1) { housing.position.set(7.8, 0.0, -9.5); housing.rotation.set(0, 0.5, Math.PI / 2 * 0.0 + 0.12); housing.rotation.z = 0; housing.rotation.x = 0; housing.rotation.y = 0.5; }
    else if (u <= 0) { housing.position.copy(HOUSE0); housing.rotation.set(0, 0, 0); }
    else { const e = u; housing.position.set(lerp(0, 7.8, e), lerp(4.0, 0.0, e) + 7.5 * Math.sin(Math.PI * e), lerp(0, -9.5, e)); housing.rotation.set(0, 0.5 * e, -Math.PI * 2 * easeOut(e)); } } oct.scale.set(sc, sc * (1 + 0.04 * Math.sin(t * 2.0 + 1)), sc);
  oct.rotation.set(right ? (0.35 * inflate) * (1)  + 0.25 * win(t, tPuff - 0.1, tPuff + 0.9, 0.1) : 0, 0, dance ? 0.08 * Math.sin(bph) : 0.03 * Math.sin(t * 1.1));
  oct.rotation.y = right ? Math.PI * ease(clamp((t - tSpotless + 0.4) / 1.0)) : 0;
  O.eyes.forEach((E, k) => { const blinkK = (t % 3.7 < 0.12) ? 0.15 : 1; const o = eyeOpen * blinkK; E.g.scale.set(1, Math.max(0.06, o), 1);
    E.w.material.color.set(o < 0.2 ? '#8e44ad' : '#ffffff');
    // pupils look at the car / window / camera
    let lx = 0, ly = -0.15; if (!right && t > S('wrong1').start - 0.3 && t < tCome) { lx = -0.12; ly = -0.22; } if (right && t > tSponges) { ly = -0.25 + 0.05 * Math.sin(t * 4); lx = 0.06 * Math.sin(t * 2.3); }
    const wide = !right ? win(t, tSplash - 0.1, tCome + 0.5, 0.15) : (t > tSpotless ? 0.4 : 0);
    E.p.position.set(lx, ly, 0); E.p.scale.setScalar(1 - 0.25 * wide); E.lid.visible = o < 0.5; });
  // happy mouth: open "o" while puffing / wrong splash, smile otherwise
  const oo = right ? win(t, tPuff - 0.35, tPuff + 0.7, 0.15) : win(t, tSplash - 0.1, tFoam + 0.4, 0.15);
  O.oMouth.scale.set(Math.max(0.01, oo), Math.max(0.01, oo * 1.1), 0.4); O.mouth.visible = oo < 0.5;
  // arms
  oct.updateMatrixWorld(true);
  arms.forEach(A => { const P = armCtrl(A, t); const offY = oct.position.y - OC.y, offX = oct.position.x; const sc2 = oct.scale.x;
    // base follows the body
    P[0] = V3(P[0].x * sc2 + offX, OC.y + (P[0].y - OC.y) * sc2 + offY, P[0].z * sc2); P[1].x += offX * 0.6; P[1].y += offY * 0.6;
    const tip = buildTent(A.mesh, P, P[4], t, A.ph, 0.44); tips[A.k] = tip;
    const sv = right && t > tSponges - 0.15; A.sponge.visible = sv;
    if (sv) { const pop = back((t - tSponges + 0.15) / 0.35); A.sponge.scale.setScalar(Math.max(0.01, pop)); A.sponge.position.copy(tip); A.sponge.rotation.set(0.3 * Math.sin(t * 5 + A.k), A.k * 0.7, 0.2 * Math.cos(t * 4 + A.k)); } });
  // heart
  const hrt = right ? ramp(t, tHeart - 0.5, tHeart + 0.5) : 0; heart.visible = hrt > 0.01 && t < tDries + 0.2 + 99; heart.material.opacity = hrt; heart.scale.setScalar(0.4 + 0.6 * hrt);
  // foam
  for (let i = 0; i < NF; i++) {
    let p = null, r = 0;
    if (!right && i < 190) { // wrong: foam bursting out of the window gap + piles
      const t0 = tFills + hash(i) * 2.2; if (t >= t0) { const dt = t - t0; const zc = z; const vx = -1.4 - hash(i + 2) * 2.2, vy = 1.5 + hash(i + 4) * 2.4, vz = (hash(i + 6) - 0.5) * 2.6;
          const gy = 0.12 + 0.25 * hash(i + 8); let px = -1.0 + vx * dt, py = 1.42 + vy * dt - 4.9 * dt * dt, pz = -0.15 + vz * dt; if (py < gy) { const tl = (vy + Math.sqrt(vy * vy + 4 * 4.9 * (1.42 - gy))) / 9.8; px = -1.0 + vx * tl; pz = -0.15 + vz * tl; py = gy; }
          if (i < 60) { // stuck on the car (moves with it)
            const a = hash(i + 9) * Math.PI * 2; px = -0.98 - 0.05 * hash(i); py = 1.0 + hash(i + 11) * 0.5; pz = -1.0 + hash(i + 12) * 2.2; if (i < 30) { px = -0.9 + hash(i + 13) * 1.8; py = 1.67; pz = -0.6 + hash(i + 14) * 1.2; } p = V3(px, py, pz + zc); r = (0.12 + 0.14 * hash(i + 15)) * ramp(t, t0, t0 + 0.4); }
          else { p = V3(px, py, pz + (i < 120 ? zc : 0)); r = (0.14 + 0.2 * hash(i + 15)) * ramp(t, t0, t0 + 0.3) * (i >= 120 ? 1 : 1); } } }
    if (right && i >= 120) { // right: soap on the car from the sponges, blown off by the puff
      const k = i % 8; const tg = TG.gen[k]; const t0 = tSponges + hash(i) * 2.0; if (t >= t0) { let px = tg[0] + (hash(i + 1) - 0.5) * 0.9, py = tg[1] + (hash(i + 2) - 0.2) * 0.3, pz = tg[2] + (hash(i + 3) - 0.5) * 1.4;
        if (Math.abs(tg[0]) > 1) px = Math.sign(tg[0]) * (1.0 + 0.05 * hash(i + 4)); r = (0.07 + 0.1 * hash(i + 5)) * ramp(t, t0, t0 + 0.4) * ((k === 0 || k === 4) ? 1 - ramp(t, tAndH - 0.3, tAndH + 0.1) : 1);
        const bl = clamp((t - tPuff + 0.05) / 1.2); if (bl > 0) { const d = V3(px, 0, pz).normalize(); px += d.x * 9 * bl; pz += d.z * 9 * bl; py += 3 * bl - 3 * bl * bl; r *= 1 - bl; }
        p = V3(px, py, pz + z); } }
    if (p && r > 0.005) { _m.compose(p, _q.identity(), V3(r, r * 0.85, r)); } else _m.makeScale(0, 0, 0);
    foamM.setMatrixAt(i, _m); }
  foamM.instanceMatrix.needsUpdate = true;
  // wind streaks
  const wOn = right ? win(t, tPuff - 0.1, tPuff + 0.9, 0.08) : 0;
  wind.forEach((w, i) => { w.visible = wOn > 0.01; if (!w.visible) return; const u = ((t - tPuff + 0.1) * 2.4 + hash(i)) % 1; const a = hash(i + 3) * Math.PI * 2, rr2 = 0.4 + hash(i + 4) * 1.2;
    w.position.set(Math.cos(a) * rr2 * (1 + u * 1.6), lerp(4.0, 0.8, u), Math.sin(a) * rr2 * (1 + u * 1.6) + 0.6); w.material.opacity = 0.8 * wOn * (1 - u); w.rotation.set(0, 0, 0); });
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  applyCam(c, t, (!right ? win(t, tSplash - 0.03, tSplash + 0.5, 0.04) : win(t, tPuff - 0.03, tPuff + 0.5, 0.04)) > 0 ? 0.06 : 0);
  camera.updateMatrixWorld(true); hero.updateMatrixWorld(true);
  screen = { gap: project(hero.localToWorld(V3(-0.82, 1.42, -0.15))), oct: project(oct.localToWorld(V3(0, 2.6, 0))), car: project(hero.localToWorld(V3(0, 2.0, 0))), drv: project(hero.localToWorld(V3(-0.3, 3.0, 0))),
    sp: [V3(0.6, 1.1, -1.9), V3(-0.95, 1.3, -1.0), V3(0.2, 1.6, 0.3), V3(0.98, 0.7, 1.3), V3(-0.5, 0.9, 1.9), V3(0.0, 1.35, -0.95)].map(v => project(hero.localToWorld(v))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function sparkle(x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#bfe9ff'; ctx.shadowBlur = 20; ctx.beginPath();
  for (let k = 0; k < 8; k++) { const r = k % 2 ? s * 0.22 : s; const an = k * Math.PI / 4; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill(); ctx.restore(); }
function notes(t, a, b) { if (t < a || t > b) return; const p = screen.car; if (!p || !p.ok) return; for (let k = 0; k < 5; k++) { const u = ((t - a) * 0.7 + k / 5) % 1; const x = p.x + (k - 2) * 90 + 30 * Math.sin(t * 3 + k), y = p.y - 40 - u * 380;
    ctx.save(); ctx.globalAlpha = win(t, a, b, 0.3) * (1 - u) ; ctx.font = '900 80px Inter'; ctx.textAlign = 'center'; ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(k % 2 ? '♪' : '♫', x, y); ctx.fillStyle = ['#ffd60a', '#39ff4a', '#ff8fc4', '#4fc3f7', '#ffffff'][k]; ctx.fillText(k % 2 ? '♪' : '♫', x, y); ctx.restore(); } }
function gapArrow(t, a, b) { if (t < a || t > b) return; const p = screen.gap; if (!p || !p.ok) return; const f = win(t, a, b, 0.2), k = back((t - a) / 0.35), bob = 14 * Math.sin(t * 9);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(p.x, p.y - 40 - bob); ctx.scale(k, k); ctx.fillStyle = YEL; ctx.strokeStyle = '#000'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-38, -55); ctx.lineTo(-14, -55); ctx.lineTo(-14, -130); ctx.lineTo(14, -130); ctx.lineTo(14, -55); ctx.lineTo(38, -55); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) gapArrow(t, tJust - 0.2, tBig - 0.1); else gapArrow(t, tClose - 0.2, tWin2 + 0.3);
  if (!right) {
    P_('CAR: VERY FILTHY', '#6d4c41', tFilthy - 0.15, tSo - 0.05, 54);
    P_('CAR WASH: GIANT OCTOPUS', '#8e24aa', tOct - 0.2, S('hook2').end + 0.3, 48);
    P_('WINDOW: OPEN A CRACK', RED, tJust - 0.2, tBig - 0.1, 50, iconWarn);
    P_('ARMS INSIDE: 1', RED, tSlips - 0.2, tTwo - 0.15, 54);
    P_('ARMS INSIDE: 2', RED, tTwo - 0.15, tEight - 0.15, 54);
    P_('ARMS INSIDE: 8', RED, tEight - 0.15, tSplash - 0.1, 58, iconX);
    floatText('SPLASH!', W / 2, 700, t, tSplash - 0.03, tSplash + 0.9, 170, '#4fc3f7', -0.08);
    P_('FOAM: EVERYWHERE', '#0277bd', tFoam - 0.2, tYou + 0.1, 54);
    P_('HAIRDO: BUBBLES', '#0277bd', tBubble - 0.1, tAnd3 - 0.1, 54);
    P_('OUTSIDE: STILL FILTHY', '#6d4c41', tStill - 0.3, tRew0, 50, iconX);
  } else {
    P_('WINDOWS: CLOSED', GREEN, tClose - 0.1, tAndM - 0.1, 54, iconCheck);
    P_('MUSIC: ON', '#8e24aa', tMusic - 0.2, tEightA - 0.2, 56);
    notes(t, tMusic - 0.2, tSponges + 0.5);
    P_('8 ARMS · 8 SPONGES', '#8e24aa', tEightA - 0.15, tPerfect - 0.15, 52);
    P_('RHYTHM: PERFECT', GREEN, tPerfect - 0.15, tWheels - 0.2, 54, iconCheck);
    P_('WHEELS', GREEN, tWheels - 0.15, tRoof - 0.15, 60, iconCheck);
    P_('ROOF', GREEN, tRoof - 0.15, tBonnet - 0.15, 60, iconCheck);
    P_('BONNET', GREEN, tBonnet - 0.15, tAndH - 0.15, 60, iconCheck);
    P_('+ A LITTLE HEART', '#d81b60', tHeart - 0.2, S('right4').end + 0.3, 52, iconHeart);
    P_('DRYER: ONE BIG PUFF', '#0277bd', tWith - 0.2, tSpotless - 0.2, 50);
    floatText('PUFF!', W / 2, 700, t, tPuff - 0.03, tPuff + 0.9, 170, '#e3f6ff', 0.06);
    P_('CAR: SPOTLESS', GREEN, tSpotless - 0.15, tHappy - 0.15, 58, iconCheck);
    P_('OCTOPUS: HAPPY', '#8e24aa', tHappy - 0.15, S('right7').start - 0.1, 56, iconHeart);
    const sa = ramp(t, tPuff + 0.1, tPuff + 0.5) * (1 - ramp(t, S('outro').start - 0.3, S('outro').start + 0.2));
    if (sa > 0) screen.sp.forEach((p, k) => { if (!p.ok) return; const ph = (t * 1.7 + k * 0.37) % 1; sparkle(p.x, p.y, 34 + 26 * Math.sin(ph * Math.PI), sa * Math.sin(ph * Math.PI)); });
    if (t > tHappy - 0.1 && t < S('right7').start + 0.5 && screen.oct.ok) for (let k = 0; k < 3; k++) { const u = ((t - tHappy) * 0.8 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - u) * win(t, tHappy - 0.1, S('right7').start + 0.5, 0.2); iconHeart(screen.oct.x + (k - 1) * 120, screen.oct.y - u * 220, 34, '#ff4f9a'); ctx.restore(); }
  }
}
window.dbg = { carZ, tips };
start(update, hud);
