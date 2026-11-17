// Episode 55: Supermarket car park – a giant snail at the height barrier
// hook (old style): you want to park at the supermarket, the queue isn't moving -> at the front: a giant snail, her house is too tall for the height barrier
// wrong: honk, loudly, twice -> snails are shy: she jumps out of her house, the house lands on YOUR car -> now you're too tall (CLANG)
//        -> without her house the snail slides under the barrier and takes the last space
// right: snails love rain -> windscreen washers, full power -> happy snail dance -> she lays her house down flat -> 1.99 m, under the barrier
//        with a millimetre to spare -> thank-you slime trail straight into the last space -> you glide in sideways, whee, perfect parking
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, _m, _q, _v, _s
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tSuper = WT('hook1', 'supermarket'), tQueue = WT('hook1', 'queue'), tMoving = WT('hook1', 'moving'), tAtAll = WT('hook1', 'all');
const tFront = WT('hook2', 'front'), tGiant = WT('hook2', 'giant'), tSnail = WT('hook2', 'snail'), tHouse = WT('hook2', 'house'), tTall = WT('hook2', 'tall'), tHeight = WT('hook2', 'height'), tBarrier = WT('hook2', 'barrier'), tWhat = WT('hook2', 'What');
const tHonk = WT('wrong1', 'honk'), tLoud = WT('wrong1', 'Loudly'), tTwice = WT('wrong1', 'Twice');
const tBig = WT('wrong2', 'Big'), tShy = WT('wrong2', 'shy'), tSnails2 = WT('wrong2', 'Snails'), tJumps = WT('wrong2', 'jumps'), tLands = WT('wrong2', 'lands'), tYourCar = WT('wrong2', 'car');
const tNow = WT('wrong3', 'Now'), tTall3 = WT('wrong3', 'tall'), tWithout = WT('wrong3', 'without'), tSlides3 = WT('wrong3', 'slides'), tBar3 = WT('wrong3', 'barrier'), tTakes = WT('wrong3', 'takes'), tSpace3 = WT('wrong3', 'space');
const tRain = WT('right2', 'rain'), tTurn = WT('right2', 'turn'), tWashers = WT('right2', 'washers'), tFull = WT('right2', 'Full');
const tHappy = WT('right3', 'happy'), tDance = WT('right3', 'dance'), tLays = WT('right3', 'lays'), tFlat = WT('right3', 'flat');
const tOne = WT('right4', 'One'), tNinety = WT('right4', 'ninety'), tSlides4 = WT('right4', 'slides'), tMilli = WT('right4', 'millimetre'), tSpare = WT('right4', 'spare');
const tThank = WT('right5', 'thank'), tShiny = WT('right5', 'shiny'), tTrail = WT('right5', 'trail'), tStraight = WT('right5', 'Straight'), tLast5 = WT('right5', 'last');
const tGlide = WT('right6', 'glide'), tSideways = WT('right6', 'sideways'), tWhee = WT('right6', 'Whee'), tPerfect = WT('right6', 'Perfect');
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
// polyline path with arc-length lookup (points [x,z])
function makePath(pts, n = 400) {
  const cr = (a, b, c, d, u) => { const u2 = u * u, u3 = u2 * u; return 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3); };
  const P = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n / pts.length; k++) { const u = k / (n / pts.length); P.push([cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u)]); } }
  P.push(pts[pts.length - 1]); const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const len = cum[cum.length - 1];
  const at = s => { s = clamp(s, 0, len); let lo = 0, hi = P.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    const u = (s - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]); const x = lerp(P[lo][0], P[hi][0], u), z = lerp(P[lo][1], P[hi][1], u);
    const dx = P[hi][0] - P[lo][0], dz = P[hi][1] - P[lo][1]; return { x, z, h: Math.atan2(-dx, -dz) }; };
  return { at, len, P, cum };
}

// ---------------- layout ----------------
const BARZ = 0, BARY = 2.0;              // height barrier (bottom edge of the hanging bar)
const HERO_Z = 7.6;                      // hero waits here
const SLOT = { x: -5.5, z: -14.4 };      // the last free space (left row)
const STAND = { x: -16.8, z: -14.4 };    // salad stand on the grass beyond
const SN_Z0 = 1.45;                      // snail root z when the shell touches the bar

// ---------------- world ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 60 && z > -70 && z < 80, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 70 && z + d / 2 > -80 && z - d / 2 < 90, near: [0, 0, 10, 10], trees: 900, seed: 551 });
plane(-60, 60, -70, 80, L('#b9b3a8'), 0.02, 40);                 // pavement
plane(-9.0, 9.0, -31, 0.6, asphaltMat, 0.05, 7);                 // car park
plane(-3.4, 3.4, 0.6, 80, asphaltMat, 0.05, 7);                  // access road
plane(-60, 60, 34, 42, asphaltMat, 0.05, 7);                     // street
const grassM = L('#7cb342');
plane(-24, -9.3, -30, 0.0, grassM, 0.045, 8);                    // grass strip (left)
plane(9.3, 24, -30, 0.0, grassM, 0.045, 8);
{ const kerb = L('#d7d3cb'); for (const x of [-9.15, 9.15]) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 31), kerb); k.position.set(x, 0.08, -15.0); k.receiveShadow = true; scene.add(k); } }
// parking lines
const SLOTZ = [-3.6, -6.3, -9.0, -11.7, -14.4, -17.1, -19.8, -22.5, -25.2];
{ const g = new THREE.PlaneGeometry(5.2, 0.14); g.rotateX(-Math.PI / 2); const dl = [];
  for (const z of SLOTZ) for (const x of [-5.9, 5.9]) { dl.push([x, 0.075, z - 1.35]); dl.push([x, 0.075, z + 1.35]); } instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.16, 2.2); g2.rotateX(-Math.PI / 2); const d2 = []; for (let z = 4; z < 34; z += 5) d2.push([0, 0.075, z]); instanced(g2, markMat, d2, false); }
// parked cars (everything full except SLOT)
const COLS = ['#e53935', '#fdd835', '#43a047', '#8e24aa', '#fb8c00', '#9e9e9e', '#ffb300', '#ec407a', '#7cb342', '#6d4c41', '#f5f5f5', '#546e7a', '#ff7043', '#26a69a'];
{ let ci = 0; for (const z of SLOTZ) { if (z !== SLOT.z) { const c = makeCar(COLS[ci++ % COLS.length]); placeCar(c, { x: -5.6, z, h: Math.PI / 2 }); }
    const c2 = makeCar(COLS[ci++ % COLS.length]); placeCar(c2, { x: 5.6, z, h: -Math.PI / 2 }); } }
// glowing "last space" marker
const lpT = canvasTex(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#39ff4a'; c.lineWidth = 14; c.strokeRect(14, 14, w - 28, h - 28); c.fillStyle = '#39ff4a'; c.font = '900 170px Inter'; c.textAlign = 'center'; c.fillText('P', w / 2, h / 2 + 60); });
const lp = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4.8), new THREE.MeshBasicMaterial({ map: lpT, transparent: true, toneMapped: false, depthWrite: false })); lp.rotation.set(-Math.PI / 2, 0, Math.PI / 2); lp.position.set(SLOT.x, 0.08, SLOT.z); lp.userData.noAO = true; scene.add(lp);
// supermarket
{ const g = new THREE.Group(); g.position.set(0, 0, -40); scene.add(g);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(34, 7, 12), L('#eceff1')); wall.position.y = 3.5; wall.castShadow = wall.receiveShadow = true; g.add(wall);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(20, 3.2, 0.1), STD('#9ec9e6', { roughness: 0.1, metalness: 0.5 })); glass.position.set(0, 1.7, 6.02); g.add(glass);
  const band = new THREE.Mesh(new THREE.BoxGeometry(34.2, 1.0, 0.3), L('#2e7d32')); band.position.set(0, 4.0, 6.1); g.add(band);
  const sT = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#2e7d32'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 130px Inter'; c.textAlign = 'center'; c.fillText('SUPERMARKET', w / 2, 145); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 3), new THREE.MeshLambertMaterial({ map: sT })); sign.position.set(0, 5.6, 6.08); g.add(sign);
  const sb = new THREE.Mesh(new THREE.BoxGeometry(16.4, 3.4, 0.2), L('#2e7d32')); sb.position.set(0, 5.6, 5.95); g.add(sb); }
// trolley bay + lamp posts
{ const pm = STD('#90a4ae', { metalness: 0.6, roughness: 0.4 }); for (const [x, z] of [[9.9, -6], [9.9, -20], [-9.9, -27]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 6, 8), pm); p.position.set(x, 3, z); p.castShadow = true; scene.add(p);
    const h = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.4), pm); h.position.set(x - Math.sign(x) * 0.5, 6, z); scene.add(h); } }
// salad stand on the grass
const lettuces = [];
{ const g = new THREE.Group(); g.position.set(STAND.x, 0, STAND.z); scene.add(g);
  const wood = L('#a1673a'); const tab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 3.4), wood); tab.position.set(-0.3, 0.45, 0); tab.castShadow = tab.receiveShadow = true; g.add(tab);
  
  const awT = canvasTex(256, 64, (c, w, h) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#fff' : '#43a047'; c.fillRect(k * 32, 0, 32, h); } });
  const aw = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 3.8), [L('#43a047'), L('#43a047'), L('#fff', { map: awT }), L('#43a047'), L('#43a047'), L('#43a047')]); 
  const sgT = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#fff8e1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2e7d32'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#2e7d32'; c.font = '900 70px Inter'; c.textAlign = 'center'; c.fillText('FRESH SALAD', w / 2, 105); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.8), new THREE.MeshLambertMaterial({ map: sgT })); sg.position.set(0.42, 0.55, 0); sg.rotation.y = Math.PI / 2; g.add(sg);
  const lm = L('#7cc242'), lm2 = L('#a5d66b');
  for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), k % 2 ? lm : lm2); l.scale.y = 0.8; l.position.set(-0.3 + (k % 2) * 0.35, 1.12, -1.2 + Math.floor(k / 2) * 1.1); l.castShadow = true; g.add(l); lettuces.push(l); } }
// FREE spaces sign at the entrance
const signC = document.createElement('canvas'); signC.width = 256; signC.height = 320; const signT = new THREE.CanvasTexture(signC); signT.colorSpace = THREE.SRGBColorSpace; let signS = '';
function drawSign(n) { const s = 'F' + n; if (s === signS) return; signS = s; const c = signC.getContext('2d'); c.fillStyle = '#0d47a1'; c.fillRect(0, 0, 256, 320); c.fillStyle = '#fff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.fillText('P', 128, 140);
  c.fillStyle = '#111'; c.fillRect(20, 170, 216, 130); c.fillStyle = n > 0 ? '#39ff4a' : '#ff1744'; c.font = '900 46px Inter'; c.fillText('FREE', 128, 218); c.font = '900 76px Inter'; c.fillText(String(n), 128, 290); signT.needsUpdate = true; }
drawSign(1);
{ const sg = new THREE.Group(); sg.position.set(5.6, 0, -1.0); scene.add(sg); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.7, 8), STD('#90a4ae', { metalness: 0.6 })); pole.position.y = 1.35; sg.add(pole);
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.12), [L('#0d47a1'), L('#0d47a1'), L('#0d47a1'), L('#0d47a1'), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false }), L('#0d47a1')]); b.position.y = 3.4; b.rotation.y = -0.35; sg.add(b); pole.castShadow = b.castShadow = true; }

// ---------------- height barrier gantry ----------------
const stripeT = canvasTex(512, 64, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1b1b'; for (let k = -2; k < 18; k++) { c.beginPath(); c.moveTo(k * 40, h); c.lineTo(k * 40 + 20, h); c.lineTo(k * 40 + 20 + h, 0); c.lineTo(k * 40 + h, 0); c.fill(); } });
const stripeM = STD('#fff', { map: stripeT, roughness: 0.5 });
const postT = stripeT.clone(); postT.needsUpdate = true;
const swing = new THREE.Group();               // hanging bar pivots at the top beam
{ const pm = STD('#fff', { map: canvasTex(64, 512, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1b1b'; for (let k = 0; k < 8; k++) c.fillRect(0, k * 64, w, 32); }), roughness: 0.5 });
  for (const x of [-3.7, 3.7]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.4, 0.28), pm); p.position.set(x, 1.7, BARZ); p.castShadow = p.receiveShadow = true; scene.add(p); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.3, 0.3), STD('#455a64', { roughness: 0.5 })); top.position.set(0, 3.4, BARZ); top.castShadow = true; scene.add(top);
  swing.position.set(0, 3.25, BARZ); scene.add(swing);
  for (const x of [-2.4, 0, 2.4]) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 5), STD('#9e9e9e', { metalness: 0.8 })); ch.position.set(x, -0.5, 0); swing.add(ch); }
  const barT = canvasTex(1024, 96, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1b1b'; for (let k = -2; k < 30; k++) { c.beginPath(); c.moveTo(k * 60, h); c.lineTo(k * 60 + 30, h); c.lineTo(k * 60 + 30 + h, 0); c.lineTo(k * 60 + h, 0); c.fill(); }
    c.fillStyle = '#fff'; c.fillRect(w / 2 - 170, 6, 340, h - 12); c.strokeStyle = '#e11d2e'; c.lineWidth = 8; c.strokeRect(w / 2 - 166, 10, 332, h - 20); c.fillStyle = '#111'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText('MAX 2.0 m', w / 2, 72); });
  const bm = STD('#fff', { map: barT, roughness: 0.5 }), bs = STD('#ffd60a');
  const bar = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.3, 0.2), [bs, bs, bs, bs, bm, bm]); bar.position.set(0, BARY + 0.15 - 3.25, 0); bar.castShadow = true; swing.add(bar); }

// ---------------- queue + hero ----------------
const hero = makeCar('#1e88e5');
const QUEUE = [];
{ const qc = ['#fdd835', '#e53935', '#43a047', '#f5f5f5']; [13.4, 19.2, 25.0, 30.8].forEach((z, i) => { const c = makeCar(qc[i]); placeCar(c, { x: 0, z, h: 0 }); QUEUE.push({ c, z, ph: hash(i + 9) }); }); }
// washer nozzles -> droplets
const ND = 600; const dropM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 4), STD('#9fd8ff', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.75 }), ND); dropM.frustumCulled = false; dropM.userData.noAO = true; scene.add(dropM);
const NR = 220; const rainM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 4), new THREE.MeshBasicMaterial({ color: '#d8f1ff', transparent: true, opacity: 0.7 }), NR); rainM.frustumCulled = false; rainM.userData.noAO = true; scene.add(rainM);

// ---------------- the snail ----------------
const root = new THREE.Group(); scene.add(root);          // body centre on the ground, forward = -z
const bodyG = new THREE.Group(); root.add(bodyG);          // squash / stretch
const skinM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.0 });
const SK0 = new THREE.Color('#d9a35f'), SK1 = new THREE.Color('#a8733d'), SK2 = new THREE.Color('#ecc690');
const bezP = [V3(0, 0.35, 2.7), V3(0, 0.6, 0.9), V3(0, 0.62, -1.2), V3(0, 1.28, -2.35)];
const bez = (P, s) => { const u = 1 - s; return V3(0, 0, 0).addScaledVector(P[0], u * u * u).addScaledVector(P[1], 3 * u * u * s).addScaledVector(P[2], 3 * u * s * s).addScaledVector(P[3], s * s * s); };
const radAt = s => s < 0.5 ? lerp(0.12, 0.8, Math.sin(Math.PI / 2 * s / 0.5)) : lerp(0.8, 0.52, (s - 0.5) / 0.5);
{ const NS = 48, NRr = 22; const g = new THREE.BufferGeometry(); const pos = [], col = [], idx = [];
  const sp = []; for (let i = 0; i < NS; i++) sp.push(bez(bezP, i / (NS - 1)));
  for (let i = 0; i < NS; i++) { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(NS - 1, i + 1)]; const tn = b.clone().sub(a).normalize(); const n = V3(1, 0, 0); const bb = new THREE.Vector3().crossVectors(tn, n).normalize(); const r = radAt(i / (NS - 1));
    for (let j = 0; j <= NRr; j++) { const an = j / NRr * Math.PI * 2, c = Math.cos(an), s = Math.sin(an); const p = sp[i].clone().addScaledVector(n, c * r * 1.08).addScaledVector(bb, s * r); const foot = p.y < 0.04; p.y = Math.max(0.0, p.y);
      pos.push(p.x, p.y, p.z); const cc = foot ? SK1 : (p.y > sp[i].y + 0.2 * r ? SK0 : SK0.clone().lerp(SK2, 0.5)); const k = 0.06 * Math.sin(i * 1.7 + j * 2.3); col.push(cc.r + k, cc.g + k, cc.b + k); } }
  for (let i = 0; i < NS - 1; i++) for (let j = 0; j < NRr; j++) { const a = i * (NRr + 1) + j, b = a + NRr + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, skinM); m.castShadow = true; m.receiveShadow = true; bodyG.add(m); }
// head
const head = new THREE.Group(); head.position.copy(bezP[3]); bodyG.add(head);
const SN = {};
{ const hm = STD('#dcaa68', { roughness: 0.32 }); const hs = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 18), hm); hs.scale.set(1.04, 0.95, 1.0); hs.castShadow = true; head.add(hs);
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 16, Math.PI), STD('#7a3b2e')); mo.rotation.set(0, 0, Math.PI); mo.position.set(0, -0.12, -0.54); head.add(mo); SN.mouth = mo;
  const om = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), STD('#7a3b2e')); om.scale.set(1, 1, 0.4); om.position.set(0, -0.14, -0.53); om.visible = false; head.add(om); SN.oh = om;
  SN.cheeks = [-1, 1].map(s => { const c = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), new THREE.MeshBasicMaterial({ color: '#ff8a80', transparent: true, opacity: 0.55 })); c.position.set(s * 0.32, -0.05, -0.47); c.rotation.y = s * -0.6; c.scale.set(1.3, 0.8, 1); c.userData.noAO = true; head.add(c); return c; });
  // lower tentacles
  // eye stalks
  SN.stalks = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.2, 0.42, -0.12); head.add(g); const L0 = 1.0;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, L0, 10), hm); st.position.y = L0 / 2; st.castShadow = true; g.add(st);
    const eg = new THREE.Group(); eg.position.y = L0 + 0.1; g.add(eg);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), STD('#ffffff', { roughness: 0.2 })); eg.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), STD('#141414', { roughness: 0.15 })); p.position.set(0, 0.0, -0.13); eg.add(p);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(s * 0.04, 0.05, -0.23); eg.add(hl);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.212, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm); eg.add(lid);
    return { g, st, eg, p, hl, lid, s }; }); }
// shell (logarithmic spiral tube, disc in local YZ plane)
const shellG = new THREE.Group(); scene.add(shellG);
{ const turns = 3.3, NS = 260, NRr = 20, R0 = 1.1, k = 0.154, rk = 0.45, phi0 = Math.atan2(-1, 0.35);
  const C0 = new THREE.Color('#e0893a'), C1 = new THREE.Color('#f8dca6'), C2 = new THREE.Color('#9c5422');
  const pos = [], col = [], idx = [];
  for (let i = 0; i < NS; i++) { const th = i / (NS - 1) * turns * Math.PI * 2; const R = R0 * Math.exp(-k * th), rho = rk * R; const a = th + phi0; const er = V3(0, Math.sin(a), Math.cos(a));
    const c = er.clone().multiplyScalar(R); c.x = 0.42 * (1 - R / R0);
    for (let j = 0; j <= NRr; j++) { const ph = j / NRr * Math.PI * 2; const p = c.clone().addScaledVector(er, Math.cos(ph) * rho).add(V3(Math.sin(ph) * rho * 1.05, 0, 0)); pos.push(p.x, p.y, p.z);
      const stripe = Math.abs(Math.sin(ph)) < 0.3 ? 0 : 1; let cc = stripe ? C0.clone() : C1.clone(); const growth = Math.pow(Math.abs(Math.sin(th * 4.5)), 30); cc.lerp(C2, 0.55 * growth); if (Math.cos(ph) < -0.7) cc.lerp(C2, 0.3); col.push(cc.r, cc.g, cc.b); } }
  for (let i = 0; i < NS - 1; i++) for (let j = 0; j < NRr; j++) { const a = i * (NRr + 1) + j, b = a + NRr + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.05, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; shellG.add(m);
  // aperture cap (dark) so the open end reads as a hole
  const cap = new THREE.Mesh(new THREE.CircleGeometry(R0 * rk * 0.98, 20), STD('#5d3317', { side: THREE.DoubleSide })); const a = phi0; cap.position.set(0, Math.sin(a) * R0, Math.cos(a) * R0); cap.lookAt(cap.position.clone().add(V3(0, Math.cos(a), -Math.sin(a)))); shellG.add(cap); }
const SHELL_OFF = V3(0, 2.38, 0.45);      // shell centre relative to the snail root (upright)
const SHELL_FLAT = V3(0, 1.2, 0.35);       // lying flat

// slime trail (ribbon, revealed along the path)
function makeTrail(path, width) { const n = path.P.length; const g = new THREE.BufferGeometry(); const pos = new Float32Array(n * 2 * 3), idx = [];
  for (let i = 0; i < n; i++) { const a = path.P[Math.max(0, i - 1)], b = path.P[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const w = width * (0.85 + 0.15 * Math.sin(i * 0.37));
    pos.set([path.P[i][0] - dz * w, 0.085, path.P[i][1] + dx * w, path.P[i][0] + dz * w, 0.085, path.P[i][1] - dx * w], i * 6); }
  for (let i = 0; i < n - 1; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#c8ffd8', emissive: '#7dffb0', emissiveIntensity: 0.55, roughness: 0.02, metalness: 0.3, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }));
  m.userData.noAO = true; m.renderOrder = 2; scene.add(m); return m; }

// ---------------- motion ----------------
// wrong: slug path (from beside the left post, under the bar, into the last space)
const SLUG0 = { x: -2.25, z: 1.6 };
const slugPath = makePath([[SLUG0.x, SLUG0.z], [-1.6, -4], [-1.4, -9.5], [-2.6, -13.2], [-5.0, -14.4], [-6.0, -14.4]]);
const slugS = mono([[0, 0], [tSlides3 - 0.05, 0], [tBar3 + 0.3, 7.5], [tTakes + 0.2, slugPath.len - 1.2], [tSpace3 + 0.6, slugPath.len], [99, slugPath.len]]);
// right: snail path (under the bar, along the aisle, through the last space to the salad stand)
const rPath = makePath([[0, SN_Z0], [0, -2], [0, -7.5], [-0.8, -11.5], [-3.6, -14.2], [-8, -14.4], [-13.4, -14.4]]);
const rS = mono([[0, 0], [tSlides4 - 0.1, 0], [tMilli, 1.75], [tSpare + 0.6, 3.2], [tThank, 4.0], [tTrail, 10.5], [tLast5 + 0.3, rPath.len - 0.6], [S('right5').end + 0.4, rPath.len], [99, rPath.len]]);
const trail = makeTrail(rPath, 0.62);
const trailW = makeTrail(slugPath, 0.5);
// hero (right): along the trail, then a sideways drift into the slot
const heroPath = makePath([[0, HERO_Z], [0, 2], [0, -4], [0.1, -9.6], [-1.2, -13.0], [-3.2, -14.3], [-5.6, -14.4]]);
const hS = mono([[0, 0], [tStraight - 0.1, 0], [tGlide, 6], [tSideways, 14.5], [tWhee + 0.25, heroPath.len - 0.5], [tPerfect, heroPath.len], [99, heroPath.len]]);

// shell flight (wrong): from the snail's back onto the hero roof
function shellOnCar() { hero.updateMatrixWorld(true); return { p: hero.localToWorld(V3(0, 2.95, 0.15)), q: hero.quaternion.clone() }; }

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const SnCam = (off, look, fov = 40) => t => { const p = root.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
const HeroCam = (off, look, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + look[0], look[1], p.z + look[2]), fov]; };
const camKeys = [
  [0.0, Ac([14, 24, 46], [0, 1.5, 2])],
  [tQueue - 0.3, Ac([11, 20, 40], [0, 1.5, 0])],
  ...cut(tQueue - 0.25, Ac([-7.5, 2.4, 26], [0.5, 1.0, 12], 40)),
  [tFront - 0.3, Ac([-7.0, 2.6, 22], [0.5, 1.2, 8], 40)],
  ...cut(tFront - 0.25, Ac([-5.5, 3.0, 14], [0, 2.0, 2.5], 40)),
  [tGiant - 0.25, Ac([-4.8, 3.0, 9.5], [0, 2.0, 1.5], 40)],
  ...cut(tGiant - 0.2, Ac([-2.2, 2.4, -6.2], [0, 1.85, -1.0], 40)),
  [tHouse - 0.3, Ac([-2.0, 2.5, -6.6], [0, 1.9, -1.0], 40)],
  ...cut(tHouse - 0.25, Ac([-10.5, 2.6, 2.4], [0, 2.4, 1.2], 40)),
  [tWhat - 0.3, Ac([-10.0, 2.6, 2.6], [0, 2.4, 1.4], 40)],
  ...cut(tWhat - 0.25, Ac([6.5, 7.5, 21], [0, 1.8, 3])),
  [S('wrong1').start - 0.2, Ac([6.0, 7.3, 20], [0, 1.8, 3])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([3.2, 2.2, 15.5], [0, 1.4, 6.5], 40)),
  [tLoud - 0.3, Ac([3.0, 2.2, 15.0], [0, 1.4, 6.5], 40)],
  ...cut(tLoud - 0.25, Ac([-2.2, 2.4, -6.2], [0, 1.85, -1.0], 40)),
  [tSnails2 - 0.2, Ac([-2.0, 2.4, -6.6], [0, 1.85, -1.0], 40)],
  ...cut(tSnails2 - 0.15, Ac([9.0, 5.0, 17.5], [-0.5, 2.8, 3.6], 40)),
  [tLands + 0.4, Ac([9.5, 5.4, 18.5], [-0.5, 2.8, 4.2], 40)],
  ...cut(tNow - 0.2, Ac([12.0, 3.4, 7.0], [0, 2.5, 3.0], 40)),
  [tWithout - 0.3, Ac([12.3, 3.3, 5.0], [0, 2.5, 2.2], 40)],
  ...cut(tWithout - 0.25, Ac([-1.5, 3.0, 9.0], [-2.0, 1.3, 0.6], 40)),
  [tSlides3 + 0.2, Ac([-1.3, 3.2, 8.6], [-2.0, 1.3, -1.0], 40)],
  [tBar3 + 0.5, Ac([2.5, 7.0, 4.0], [-2.5, 0.8, -9.0], 40)],
  [tSpace3 + 0.3, Ac([2.5, 7.5, 1.0], [-4.5, 0.8, -13.5], 40)],
  ...cut(S('wrong4').start - 0.15, Ac([7.5, 7.0, 16.0], [0, 2.4, 1.5])),
  [tRew0, Ac([8.0, 7.5, 17.0], [0, 2.4, 1.5])],
  // right
  ...cut(tRew1, Ac([6.0, 7.3, 20], [0, 1.8, 3])),
  [S('right2').start - 0.1, Ac([5.6, 7.0, 19], [0, 1.8, 3])],
  ...cut(S('right2').start - 0.05, Ac([-2.2, 2.4, -6.2], [0, 1.85, -1.0], 40)),
  [tTurn - 0.3, Ac([-2.0, 2.4, -6.5], [0, 1.85, -1.0], 40)],
  ...cut(tTurn - 0.25, Ac([-4.6, 3.4, 13.5], [0, 2.0, 3.5], 40)),
  [tFull + 0.6, Ac([-4.2, 3.6, 13.0], [0, 2.2, 3.0], 40)],
  ...cut(S('right3').start - 0.1, Ac([-3.2, 2.6, -7.2], [0, 2.0, 0.0], 40)),
  [tLays - 0.3, Ac([-3.6, 2.8, -7.6], [0, 2.0, 0.4], 40)],
  ...cut(tLays - 0.25, Ac([-10.0, 2.8, 6.5], [0, 1.8, 0.8], 40)),
  [tSlides4 - 0.2, Ac([-10.0, 2.4, 6.0], [0, 1.6, 0.5], 40)],
  [tMilli - 0.4, Ac([-9.0, 2.3, 5.0], [0, 1.8, 0.0], 40)],
  ...cut(tMilli - 0.35, Ac([-4.6, 2.15, 3.3], [-0.3, 1.9, -0.2], 32)),
  [tSpare + 0.6, Ac([-4.5, 2.1, 3.0], [-0.3, 1.85, -0.7], 32)],
  ...cut(S('right5').start - 0.1, SnCam([-3.0, 8.5, 7.0], [0, 1.2, -1.8], 40)),
  [tShiny - 0.3, SnCam([-3.2, 8.8, 7.0], [0, 1.2, -1.8], 40)],
  ...cut(tShiny - 0.25, Ac([4.0, 9.0, 8.0], [-1.0, 0.0, -6.0], 40)),
  [tStraight + 0.2, Ac([4.0, 10.0, 4.0], [-2.5, 0.0, -10.5], 40)],
  ...cut(S('right6').start - 0.15, Ac([3.0, 5.5, 6.0], [-1.0, 0.8, -6.0], 40)),
  [tSideways, Ac([3.5, 7.0, -1.0], [-3.5, 0.6, -12.0], 40)],
  [tPerfect + 0.3, Ac([1.5, 10.0, -6.5], [-6.5, 0.5, -14.2], 40)],
  ...cut(S('right7').start - 0.2, Ac([-21.5, 3.6, -17.8], [-14.5, 1.5, -14.2], 40)),
  [S('outro').start, Ac([-22.0, 3.8, -18.0], [-14.5, 1.6, -14.2], 40)],
  [TOTAL - 0.3, Ac([-26.0, 4.0, -18.0], [-13.0, 1.8, -14.0], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
function update(t) {
  const right = isRight(t);
  // ---- hero ----
  let hp;
  if (!right) { const z = t < tNow ? HERO_Z : mono([[tNow, HERO_Z], [tTall3 - 0.06, 1.72], [tTall3 + 0.35, 2.7], [99, 2.7]])(t); hp = { x: 0, z, h: 0 }; }
  else { const s = hS(t); hp = heroPath.at(s); const d = ease(clamp((t - tGlide + 0.1) / (tWhee + 0.25 - tGlide + 0.1))); const drift = Math.sin(Math.PI * d) * 0.55; hp.h = hp.h + drift * (1 - ramp(t, tWhee, tPerfect + 0.2)); if (t > tPerfect) hp.h = Math.PI / 2; }
  placeCar(hero, hp);
  const hk = !right ? Math.max(win(t, tHonk - 0.05, tHonk + 0.5, 0.05), win(t, tTwice - 0.05, tTwice + 0.6, 0.05)) : 0; hero.userData.bodyG.position.y += 0.025 * hk * Math.sin(t * 60);
  const landK = !right ? Math.exp(-6 * Math.max(0, t - tLands)) * (t > tLands ? 1 : 0) : 0; hero.userData.bodyG.scale.set(1, 1 - 0.12 * landK * Math.abs(Math.cos(t * 18)), 1);
  blink(hero, t, false, false);
  QUEUE.forEach((Q, i) => { const sh = !right ? win(t, tTall3 + 0.6 + i * 0.25, tBar3 + 1.0, 0.05) : 0; Q.c.userData.bodyG.position.y = 0.02 * sh * Math.sin(t * 55 + i); });

  // ---- snail root ----
  let rx = 0, ry = 0, rz = SN_Z0, yaw = 0, jumpY = 0, sway = 0, flatU = 0, stretch = 0, attached = true, slug = false;
  const bonk = t < tWhat + 0.8 ? Math.abs(Math.sin(Math.PI * (t - 0.2) / 1.6)) : (!right ? 0 : (t < tLays ? Math.abs(Math.sin(Math.PI * (t - tRew1) / 1.6)) * (1 - ramp(t, S('right2').start, S('right2').start + 0.5)) : 0));
  rz = SN_Z0 + 0.35 * bonk;
  if (!right) {
    if (t > tJumps - 0.05) { attached = false; slug = true; const u = clamp((t - tJumps + 0.05) / 0.7); const e = ease(u);
      rx = lerp(0, SLUG0.x, e); rz = lerp(SN_Z0, SLUG0.z, e); jumpY = 1.6 * Math.sin(Math.PI * u); yaw = 0;
      if (t > tSlides3 - 0.1) { const p = slugPath.at(slugS(t)); rx = p.x; rz = p.z; yaw = p.h; } }
  } else {
    sway = win(t, tDance - 0.5, tLays - 0.05, 0.2);
    flatU = ease(clamp((t - tLays + 0.05) / (tFlat + 0.25 - tLays + 0.05))) * (1 - ease(clamp((t - tThank + 0.3) / 1.0)));
    stretch = flatU;
    if (t > tSlides4 - 0.15) { const p = rPath.at(rS(t)); rx = p.x; rz = p.z; yaw = p.h; }
  }
  root.position.set(rx, jumpY, rz);
  root.rotation.set(0, yaw + 0.16 * sway * Math.sin(t * 6.5), 0.07 * sway * Math.sin(t * 6.5 + 1), 'YXZ');
  const crawl = (right && t > tSlides4) || (!right && t > tSlides3) ? 1 : 0;
  bodyG.scale.set(1 - 0.08 * stretch, 1 - 0.38 * stretch - (jumpY > 0 ? -0.1 * Math.sin(Math.PI * clamp((t - tJumps) / 0.7)) : 0), 1 + 0.16 * stretch + 0.03 * crawl * Math.sin(t * 7));
  // head pose + face
  const scared = !right ? Math.max(win(t, tHonk - 0.1, tJumps + 0.2, 0.08), 0) : 0;
  const happy = right ? win(t, tHappy - 0.3, S('right3').end + 0.1, 0.2) : 0;
  const shyU = !right ? win(t, tJumps + 0.5, tSlides3 - 0.1, 0.25) : 0;
  head.rotation.set(-0.35 * stretch + 0.12 * sway * Math.sin(t * 6.5 + 2) + (right ? 0.15 * win(t, tThank - 0.3, tShiny, 0.2) : 0), (right ? 2.5 * win(t, tThank - 0.2, tShiny - 0.1, 0.4) : 0) - 0.5 * shyU, 0.12 * sway * Math.sin(t * 6.5));
  SN.mouth.visible = !(scared > 0.3 || shyU > 0.3); SN.oh.visible = !SN.mouth.visible;
  SN.mouth.scale.set(1 + 0.4 * happy, 1 + 0.6 * happy, 1);
  SN.cheeks.forEach(c => { c.material.opacity = 0.5 + 0.45 * Math.max(shyU, happy); c.scale.set(1.3 + 0.6 * shyU, 0.8 + 0.5 * shyU, 1); });
  const sad = (t < tWhat + 0.8) || (right && t < S('right2').start + 0.8) ? 1 : 0;
  SN.stalks.forEach((S2, k) => { const s = S2.s;
    const retract = Math.max(scared * (t > tHonk && t < tJumps + 0.3 ? 1 : 0), 0.7 * shyU);
    const down = 0.5 * stretch;
    S2.g.scale.y = 1 - 0.75 * retract; S2.eg.scale.setScalar(1 / Math.max(0.3, 1 - 0.75 * retract) > 1.6 ? 1 : 1);
    S2.g.rotation.set(-0.35 - 0.25 * sad + 0.2 * Math.sin(t * 1.3 + k) * (1 - retract) - 1.2 * down + 0.35 * sway * Math.sin(t * 6.5 + k * 3), 0, s * (-0.28 - 0.15 * sad + 0.5 * happy * Math.abs(Math.sin(t * 3.25))) * (1 - retract * 0.5));
    S2.eg.rotation.set(-S2.g.rotation.x * 0.9 + 0.1, 0, -S2.g.rotation.z);
    const blinkK = (t % 3.7 < 0.12) ? 1 : 0; const lidClose = Math.max(blinkK, 0.55 * sad * (t < tWhat + 0.8 || right ? 1 : 0), happy * 0.7, 0.4 * shyU);
    S2.lid.rotation.x = lerp(-Math.PI * 0.95, -Math.PI * 0.05 - 0.25, lidClose) ; S2.p.scale.setScalar(1 + 0.25 * scared); });
  // ---- shell ----
  root.updateMatrixWorld(true);
  if (attached) { const off = SHELL_OFF.clone().lerp(SHELL_FLAT, flatU); shellG.position.copy(root.localToWorld(off)); _qa.setFromEuler(new THREE.Euler(0.05 * bonk, 0, Math.PI / 2 * flatU)); shellG.quaternion.copy(root.quaternion).multiply(_qa); }
  else { const u = clamp((t - tJumps) / (tLands - tJumps)); const p0 = V3(0, SHELL_OFF.y + 0.3, SN_Z0 + SHELL_OFF.z); const tgt = shellOnCar();
    if (u < 1) { const e = u; shellG.position.lerpVectors(p0, tgt.p, e); shellG.position.y += 3.2 * Math.sin(Math.PI * e); _qa.setFromEuler(new THREE.Euler(-Math.PI * 2 * ease(u), 0.4 * Math.sin(Math.PI * u), 0)); shellG.quaternion.copy(_qa); }
    else { shellG.position.copy(tgt.p); const hit = Math.exp(-5 * Math.max(0, t - tTall3)) * (t > tTall3 ? 1 : 0); _qa.setFromEuler(new THREE.Euler(0.18 * hit * Math.sin((t - tTall3) * 14), 0, 0.05 * Math.sin(t * 2) * landK)); shellG.quaternion.copy(tgt.q).multiply(_qa); } }
  // ---- barrier swing ----
  let sw = 0; if (bonk > 0 && (t < tWhat + 0.8 || right)) sw = 0.06 * Math.max(0, 1 - bonk * 3);
  if (!right && t > tTall3 - 0.05) sw += 0.35 * Math.exp(-2.2 * (t - tTall3)) * Math.sin((t - tTall3) * 9);
  if (t < tWhat + 0.8 || (right && t < S('right2').start + 0.5)) sw += 0.05 * Math.exp(-4 * ((t * 0.625 + 0.875) % 1)) * Math.sin(((t * 0.625 + 0.875) % 1) * 30);
  swing.rotation.x = -sw;
  // ---- slime trails ----
  { const s = right ? rS(t) : 0; const n = right ? Math.floor(clamp((s - 1.0) / rPath.len) * (rPath.P.length - 1)) : 0; trail.geometry.setDrawRange(0, Math.max(0, n) * 6); trail.visible = n > 1; }
  { const s = !right ? slugS(t) : 0; const n = !right ? Math.floor(clamp((s - 0.5) / slugPath.len) * (slugPath.P.length - 1)) : 0; trailW.geometry.setDrawRange(0, Math.max(0, n) * 6); trailW.visible = n > 1; }
  lp.visible = !(!right && t > tSpace3 - 0.3) && !(right && t > tPerfect - 0.2); lp.material.opacity = 0.55 + 0.35 * Math.sin(t * 6);
  drawSign(!right ? (t > tSpace3 - 0.2 ? 0 : 1) : (t > tPerfect - 0.1 ? 0 : 1));
  // lettuce munch (right, end)
  lettuces.forEach((l, i) => { l.scale.setScalar(i === 1 && right && t > S('right6').start ? Math.max(0.2, 1 - 0.3 * (t - S('right6').start)) : 1); l.scale.y *= 0.8; });
  // ---- washer droplets + rain ----
  hero.updateMatrixWorld(true);
  const wash = right ? win(t, tTurn + 0.2, S('right3').start + 0.4, 0.25) : 0; const power = right ? lerp(0.6, 1.0, ramp(t, tFull - 0.1, tFull + 0.3)) : 0;
  for (let i = 0; i < ND; i++) { const side = i % 2 ? 1 : -1; const ph = ((t * 1.1 + hash(i) ) % 1); let ok = wash > 0.02;
    if (ok) { const n0 = hero.localToWorld(V3(side * 0.35, 1.02, -1.25)); const dist = 4.5 + 3.5 * power; const x = n0.x + side * 0.6 * ph + (hash(i + 3) - 0.5) * 0.3; const z = n0.z - dist * ph; const y = n0.y + 5.2 * power * ph - 4.6 * power * ph * ph + (hash(i + 5) - 0.5) * 0.2; const s = 0.8 + hash(i + 7);
      if (y < 0.05) ok = false; else { _m.compose(_v.set(x, y, z), _q.identity(), _s.set(s * wash, s * wash, s * wash)); } }
    if (!ok) _m.makeScale(0, 0, 0); dropM.setMatrixAt(i, _m); }
  dropM.instanceMatrix.needsUpdate = true;
  const rain = right ? win(t, tWashers - 0.2, tLays + 0.5, 0.4) : 0;
  for (let i = 0; i < NR; i++) { let ok = rain > 0.02; if (ok) { const ph = (t * 1.3 + hash(i + 11)) % 1; const x = root.position.x + (hash(i) - 0.5) * 5.0, z = root.position.z + (hash(i + 1) - 0.5) * 6.5; const y = 5.5 - 5.5 * ph; _m.compose(_v.set(x, y, z), _q.identity(), _s.set(1, rain, 1)); } else _m.makeScale(0, 0, 0); rainM.setMatrixAt(i, _m); }
  rainM.instanceMatrix.needsUpdate = true;
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(win(t, tLands - 0.05, tLands + 0.3, 0.05), win(t, tTall3 - 0.05, tTall3 + 0.3, 0.05)) : 0;
  applyCam(c, t, shake > 0.02 ? 0.07 * shake : 0);
  camera.updateMatrixWorld(true); head.updateMatrixWorld(true); shellG.updateMatrixWorld(true);
  screen = { head: project(head.localToWorld(V3(0, 1.4, 0))), car: project(hero.localToWorld(V3(0, 1.0, -2.3))), shell: project(shellG.localToWorld(V3(0, 1.7, 0))), hero: project(hero.localToWorld(V3(0, 1.8, 0))) };
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
function hornLines(t, a, b) { if (t < a || t > b) return; const p = screen.car; if (!p || !p.ok) return; const f = win(t, a, b, 0.1);
  ctx.save(); ctx.globalAlpha = f; ctx.strokeStyle = YEL; ctx.lineWidth = 14; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { const r = 60 + k * 50 + ((t * 300) % 50); ctx.beginPath(); ctx.arc(p.x, p.y, r, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke(); } ctx.restore(); }
function hearts(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 3; k++) { const u = ((t - a) * 0.9 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - u) * win(t, a, b, 0.2); iconHeart(clamp(p.x, 200, W - 200) + (k - 1) * 110, clamp(p.y, 600, 1100) - 40 - u * 200, 34, '#ff4f9a'); ctx.restore(); } }
function sparkles(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2); const n = rPath.P.length; const s = rS(t);
  for (let k = 0; k < 14; k++) { const ss = (hash(k) * 0.9) * s; const p = rPath.at(ss); const q = project(V3(p.x + (hash(k + 4) - 0.5) * 0.8, 0.12, p.z)); if (!q.ok) continue; const tw = Math.max(0, Math.sin(t * 7 + k * 2.1)); if (tw < 0.2) continue;
    ctx.save(); ctx.globalAlpha = f * tw; ctx.fillStyle = '#ffffff'; ctx.translate(q.x, q.y); ctx.rotate(0.785); const r = 16 * tw; ctx.fillRect(-r, -3, 2 * r, 6); ctx.fillRect(-3, -r, 6, 2 * r); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('SUPERMARKET CAR PARK', '#2e7d32', tSuper - 0.1, tQueue - 0.2, 50);
    P_('QUEUE: NOT MOVING', RED, tQueue - 0.15, tFront - 0.2, 54, iconX);
    P_('MAX HEIGHT: 2.0 m', '#0d47a1', tHeight - 0.2, S('hook2').end + 0.3, 50, null, 420);
    P_('SNAIL HOUSE: 3.9 m', RED, tTall - 0.15, S('hook2').end + 0.3, 50, iconWarn, 530);
    floatText('BONK', W / 2 + 160, 760, t, tBarrier - 0.05, tBarrier + 0.7, 100, YEL, 0.12);
    hornLines(t, tHonk - 0.05, tHonk + 0.5); hornLines(t, tTwice - 0.05, tTwice + 0.6);
    floatText('HONK!', W / 2 - 150, 700, t, tHonk - 0.03, tHonk + 0.7, 120, YEL, -0.12);
    floatText('HONK! HONK!', W / 2 + 40, 780, t, tTwice - 0.05, tTwice + 0.8, 120, YEL, 0.1);
    P_('SNAILS ARE SHY', '#e65100', tSnails2 - 0.15, tJumps - 0.1, 54, iconWarn);
    floatText('BOING!', W / 2, 640, t, tJumps - 0.05, tJumps + 0.8, 130, '#ffb74d', -0.08);
    P_('HOUSE: ON YOUR CAR', RED, tLands - 0.1, S('wrong2').end + 0.3, 52, iconX);
    P_('YOU: 4.5 m', RED, tNow - 0.1, tWithout - 0.2, 56, iconWarn, 420);
    P_('MAX: 2.0 m', '#0d47a1', tNow + 0.2, tWithout - 0.2, 50, null, 530);
    floatText('CLANG!', W / 2, 700, t, tTall3 - 0.05, tTall3 + 0.9, 150, '#ffd60a', -0.08);
    P_('SNAIL WITHOUT HOUSE: 1.2 m', '#e65100', tWithout - 0.1, tTakes - 0.2, 44);
    P_('FREE SPACES: 0', RED, tTakes - 0.1, tRew0, 56, iconX);
  } else {
    P_('SNAILS LOVE RAIN', '#0277bd', S('right2').start - 0.05, tTurn - 0.2, 54, iconHeart);
    P_('WASHERS: ON', '#0277bd', tTurn - 0.1, tFull - 0.15, 56);
    P_('WASHERS: FULL POWER', '#01579b', tFull - 0.15, S('right2').end + 0.3, 52);
    P_('HAPPY SNAIL DANCE', '#d81b60', tHappy - 0.1, tLays - 0.2, 52, iconHeart);
    hearts(t, tHappy, tLays - 0.1, screen.head);
    P_('HOUSE: FLAT', '#e65100', tLays - 0.1, tOne - 0.15, 56);
    P_('SNAIL: 1.99 m', GREEN, tOne - 0.1, tMilli - 0.4, 56, iconCheck, 420);
    P_('MAX: 2.0 m', '#0d47a1', tOne + 0.2, tMilli - 0.4, 50, null, 530);
    P_('1 mm TO SPARE', GREEN, tMilli - 0.3, S('right4').end + 0.3, 58, iconCheck);
    P_('THANK-YOU SLIME TRAIL', '#00897b', tShiny - 0.15, tStraight - 0.15, 48, iconHeart);
    P_('STRAIGHT INTO THE LAST SPACE', '#00897b', tStraight - 0.15, S('right5').end + 0.3, 44);
    sparkles(t, tShiny - 0.2, S('right6').end);
    floatText('WHEE!', W / 2, 700, t, tWhee - 0.1, tWhee + 0.9, 140, '#7dffb0', -0.1);
    P_('PERFECT PARKING', GREEN, tPerfect - 0.15, S('right7').start - 0.1, 58, iconCheck);
  }
}
window.dbg = { rPath, slugPath, heroPath, root, shellG, hero };
start(update, hud);
