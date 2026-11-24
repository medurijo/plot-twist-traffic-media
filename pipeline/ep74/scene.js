// Episode 69: A wall of fog on the motorway – and out of it ride knights
// wrong: honk, flash, rev -> a red beast with glowing eyes that roars = a dragon (knight vision: wings, horns, tail) ->
//        twenty knights charge, you flee into the fog, they follow -> year 1347, in a cage: the first dragon they ever caught
// right: stop, engine off, window down -> knights love good manners: bow, even your car bows -> the king rides up,
//        draws his sword, taps your roof once, twice -> "Arise, Sir Car-a-lot!" -> royal flag on the aerial,
//        they ride back into the fog, the fog rolls away
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeLandscape, makeCar, placeCar, applyCam, project, blink,
  YEL, GREEN, RED, BLUE, pill, rr, iconCheck, iconWarn, iconX, iconHeart, floatText, bigText, start, aoPass, hemi, sun, _m, _q, _v, _s, _c
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
const tSunday = WT('hook1', 'Sunday'), tThen = WT('hook1', 'Then'), tAcross = WT('hook1', 'across'), tWall = WT('hook1', 'wall'), tFogH = WT('hook1', 'fog');
const tHooves = WT('hook2', 'Hooves'), tTrump = WT('hook2', 'Trumpets'), tOut = WT('hook2', 'out'), tKnights = WT('hook2', 'knights'), tWhat = WT('hook2', 'What');
const W1 = S('wrong1').start, tHonk = WT('wrong1', 'honk'), tFlash = WT('wrong1', 'Flash'), tRev = WT('wrong1', 'Rev'), tTheyll = WT('wrong1', "They'll");
const tBut = WT('wrong2', 'But'), tRed = WT('wrong2', 'red'), tGlow = WT('wrong2', 'glowing'), tRoars = WT('wrong2', 'roars'), tTo = WT('wrong2', 'To'), tDragon = WT('wrong2', 'dragon');
const tTwenty = WT('wrong3', 'Twenty'), tCharge = WT('wrong3', 'charge'), tFlee = WT('wrong3', 'flee'), tFollow = WT('wrong3', 'follow'), tOutC = WT('wrong3', 'out'), tYear = WT('wrong3', 'year'), tCage = WT('wrong3', 'cage'), tFirst = WT('wrong3', 'first'), tCaught = WT('wrong3', 'caught');
const tStop = WT('right2', 'Stop'), tEngine = WT('right2', 'Engine'), tWindow = WT('right2', 'Window');
const tLove = WT('right3', 'Knights'), tManners = WT('right3', 'manners'), tBow = WT('right3', 'bow'), tEven = WT('right3', 'Even'), tBows = WT('right3', 'bows');
const tKing = WT('right4', 'king'), tDraws = WT('right4', 'draws'), tTaps = WT('right4', 'taps'), tOnce = WT('right4', 'Once'), tTwice = WT('right4', 'Twice');
const tArise = WT('right5', 'Arise'), tSir = WT('right5', 'Sir');
const tRoyal = WT('right6', 'royal'), tAerial = WT('right6', 'aerial'), tThenR = WT('right6', 'Then'), tRide = WT('right6', 'ride'), tFog2 = WT('right6', 'fog', 1), tRolls = WT('right6', 'rolls');
const isRight = t => t >= tRew0 + 0.5;
const T_WHITE0 = tOutC - 0.25, T_SET = tOutC + 0.45;          // whiteout, then the year 1347

// ---------------- world ----------------
const FZ = -72, ZSTOP = -24, X0 = 3000, CZ = -8;               // fog wall, car stop, medieval set, cage z
makeLandscape({ avoid: (x, z) => Math.abs(x) < 26 || (Math.abs(x) < 60 && z < -60 && z > -110), fieldAvoid: (x, z, w, d) => Math.abs(x) < 22 + w / 2, near: [0, 0, 300, 300], trees: 1500, seed: 7409 });
const roadT = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#5a5d62'; c.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { const v = 72 + hash(i) * 38 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); }
  const X = d => (d + 7) / 14 * w; c.fillStyle = '#f2f2f2'; for (const d of [-5.6, 5.6]) c.fillRect(X(d) - 3, 0, 6, h); for (const d of [-1.85, 1.85]) for (let y = 0; y < h; y += 128) c.fillRect(X(d) - 3, y, 6, 70); }, true);
roadT.repeat.set(1, 1600 / 24);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 1600), new THREE.MeshLambertMaterial({ map: roadT })); m.rotation.x = -PI / 2; m.position.set(0, 0.04, 0); m.receiveShadow = true; scene.add(m);
  for (const s of [-1, 1]) { const g = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1600), L('#8f9a6a')); g.rotation.x = -PI / 2; g.position.set(s * 8.2, 0.035, 0); g.receiveShadow = true; scene.add(g); } }
// crash barrier on the left edge
{ const bm = STD('#c4c9ce', { metalness: 0.5, roughness: 0.4 }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 1600), bm); b.position.set(-9.6, 0.6, 0); b.castShadow = b.receiveShadow = true; scene.add(b);
  const posts = []; for (let z = -790; z <= 790; z += 2.5) posts.push(z); const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.72, 0.12), STD('#8f969d', { metalness: 0.4 }), posts.length);
  posts.forEach((z, i) => { _m.compose(_v.set(-9.7, 0.36, z), _q.identity(), _s.set(1, 1, 1)); im.setMatrixAt(i, _m); }); im.castShadow = true; scene.add(im); }

// ---------------- fog wall ----------------
const fogT = canvasTex(256, 256, (c, w, h) => { const R = rng(31); for (let k = 0; k < 14; k++) { const x = w / 2 + (R() - 0.5) * w * 0.45, y = h / 2 + (R() - 0.5) * h * 0.4, r = w * (0.18 + R() * 0.16);
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.6, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); } });
const fogSprites = []; { const R = rng(77);
  for (let i = 0; i < 150; i++) { const m = new THREE.SpriteMaterial({ map: fogT, color: new THREE.Color('#bcc6cf'), transparent: true, depthWrite: false, opacity: 0.9, toneMapped: false });
    const s = new THREE.Sprite(m); const low = i < 60;
    const p = V3((R() - 0.5) * 130, low ? 1 + R() * 6 : 4 + R() * 16, FZ - 5 + R() * 11 + (low ? 1.5 : 0)); s.position.copy(p); m.color.lerp(new THREE.Color('#ffffff'), clamp(p.y / 20) * 0.8 + R() * 0.2);
    const sc = (low ? 9 : 12) + R() * 10; s.scale.set(sc, sc * 0.8, 1); s.material.rotation = R() * 6; s.renderOrder = 2;
    s.userData = { p, sc, ph: R() * 6, sp: 0.2 + R() * 0.3 }; scene.add(s); fogSprites.push(s); } }
const wallT = canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const fogWall = new THREE.Mesh(new THREE.PlaneGeometry(320, 30), new THREE.MeshBasicMaterial({ map: wallT, color: new THREE.Color('#e4e8ec'), transparent: true, depthWrite: false, toneMapped: false }));
fogWall.position.set(0, 15, FZ - 6); fogWall.renderOrder = 1; fogWall.userData.noAO = true; scene.add(fogWall);

// ---------------- knights ----------------
const MC = {}; const M = (c, o = {}) => { const k = c + JSON.stringify(o); return MC[k] || (MC[k] = STD(c, o)); };
const capTex = (a, b) => canvasTex(1024, 256, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? a : b; c.fillRect(i * w / 16, 0, w / 16 + 1, h); } c.fillStyle = '#ffca28'; c.fillRect(0, h - 26, w, 26); });
const CAPS = [capTex('#ffca28', '#c62828'), capTex('#1565c0', '#eceff1'), capTex('#2e7d32', '#ffeb3b'), capTex('#212121', '#ffca28'), capTex('#ffca28', '#8e24aa')];
const capMats = CAPS.map(t => new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide }));
const lanceT = canvasTex(64, 512, (c, w, h) => { for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#c62828'; c.beginPath(); c.moveTo(0, i * 48); c.lineTo(w, i * 48 - 30); c.lineTo(w, i * 48 + 18); c.lineTo(0, i * 48 + 48); c.fill(); } }, true);
const pennTs = ['#1565c0', '#c62828', '#2e7d32', '#ffca28'].map(col => canvasTex(128, 64, (c, w, h) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h / 2); c.lineTo(0, h); c.closePath(); c.fill(); }));
const LANCE = 6.2;
function makeKnight(o) {
  const root = new THREE.Group(); scene.add(root);
  const horse = new THREE.Group(); root.add(horse); horse.position.z = 1.0;
  const hb = new THREE.Group(); hb.position.set(0, 0, -1.0); horse.add(hb);
  const hide = M(o.horse, { roughness: 0.7 }), hoofM = M('#3e2723'), maneM = M(o.mane || '#5d4037', { roughness: 0.9 });
  { const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 1.3, 6, 12), hide); body.rotation.x = PI / 2; body.position.set(0, 1.42, 0); hb.add(body); }
  const neckG = new THREE.Group(); neckG.position.set(0, 1.62, -0.85); hb.add(neckG);
  { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 1.0, 10), hide); n.position.set(0, 0.3, -0.3); n.rotation.x = -0.85; neckG.add(n);
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.22), maneM); mane.position.set(0, 0.42, -0.12); mane.rotation.x = -0.85; neckG.add(mane); }
  const hHead = new THREE.Group(); hHead.position.set(0, 0.68, -0.72); neckG.add(hHead);
  { const hd = new THREE.Mesh(new THREE.CapsuleGeometry(0.165, 0.6, 5, 10), hide); hd.rotation.x = 0.85; hd.position.set(0, -0.2, -0.26); hHead.add(hd);
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), hide); jaw.scale.set(0.9, 1.0, 1.1); jaw.position.set(0, -0.02, 0.02); hHead.add(jaw);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), M('#111')); e.position.set(s * 0.16, 0.02, -0.12); hHead.add(e);
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 6), hide); ear.position.set(s * 0.1, 0.24, 0.06); ear.rotation.z = -s * 0.25; hHead.add(ear); }
    const cham = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.42), M('#b0bec5', { metalness: 0.8, roughness: 0.3 })); cham.position.set(0, -0.08, -0.28); cham.rotation.x = 0.72; hHead.add(cham); }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.95, 8), maneM); tail.position.set(0, 1.35, 1.05); tail.rotation.x = -0.6; hb.add(tail);
  const hLegs = [[-1, -1, 0], [1, -1, 0.35], [-1, 1, 1.9], [1, 1, 2.25]].map(([sx, sz, ph]) => { const piv = new THREE.Group(); piv.position.set(sx * 0.24, 1.25, sz * 0.62); hb.add(piv);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.6, 7), hide); up.position.y = -0.3; piv.add(up); const kn = new THREE.Group(); kn.position.y = -0.6; piv.add(kn);
    const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.55, 7), hide); lo.position.y = -0.27; kn.add(lo); const hf = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.12, 7), hoofM); hf.position.y = -0.6; kn.add(hf);
    return { piv, kn, ph, front: sz < 0 }; });
  { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.68, 0.78, 20, 1, true, PI * 0.55, PI * 0.9), capMats[o.cap]);
    cap.scale.set(1, 2.25, 1); cap.position.set(0, 1.42, 0); hb.add(cap); const cap2 = cap.clone(); hb.add(cap2);
    cap.rotation.order = cap2.rotation.order = 'YXZ'; cap.rotation.set(PI / 2, 0, -PI / 2 - 0.15); cap2.rotation.set(PI / 2, 0, PI / 2 + 0.15);
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.7), M('#5d4037')); saddle.position.set(0, 1.92, -0.15); hb.add(saddle); }
  const steel = M(o.steel || '#dfe6ea', { metalness: 0.85, roughness: 0.28, envMapIntensity: 1.4 }), steelD = M('#9aa6ad', { metalness: 0.85, roughness: 0.35 });
  const rider = new THREE.Group(); rider.position.set(0, 2.0, -0.15); hb.add(rider);
  const torso = new THREE.Group(); rider.add(torso);
  { const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.42, 5, 12), steel); t.position.y = 0.42; torso.add(t);
    const tab = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.31, 0.5, 16, 1, true), capMats[o.cap]); tab.position.y = 0.3; torso.add(tab);
    for (const s of [-1, 1]) { const pau = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 6, 0, PI * 2, 0, PI / 2), steel); pau.position.set(s * 0.32, 0.78, 0); torso.add(pau);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 8), steel); leg.position.set(s * 0.42, -0.2, -0.1); leg.rotation.x = 0.3; leg.rotation.z = s * 0.15; rider.add(leg);
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.28), steelD); boot.position.set(s * 0.47, -0.58, -0.22); rider.add(boot); } }
  const helm = new THREE.Group(); helm.position.set(0, 1.08, 0); torso.add(helm);
  if (o.king) {
    const skinM = M('#ffd2a6', { emissive: '#5a3a20', emissiveIntensity: 0.25, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 14), skinM); head.position.y = 0.02; helm.add(head);
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), M('#f5f5f5', { roughness: 0.9 })); beard.scale.set(1, 1.15, 0.7); beard.position.set(0, -0.16, -0.1); helm.add(beard);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), skinM); nose.position.set(0, 0.0, -0.21); helm.add(nose);
    for (const s of [-1, 1]) { const ew = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), M('#ffffff')); ew.position.set(s * 0.075, 0.07, -0.18); helm.add(ew);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), M('#111')); e.position.set(s * 0.075, 0.07, -0.215); helm.add(e);
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), M('#f5f5f5')); br.position.set(s * 0.075, 0.13, -0.2); br.rotation.z = -s * 0.15; helm.add(br);
      const mu = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.1, 4, 8), M('#f5f5f5')); mu.position.set(s * 0.06, -0.06, -0.2); mu.rotation.z = s * 1.25; helm.add(mu); }
    const crownT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#ffc107'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = ['#e53935', '#1e88e5', '#43a047'][i % 3]; c.beginPath(); c.arc(16 + i * 32, h * 0.6, 8, 0, 2 * PI); c.fill(); } });
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.13, 20, 1, true), new THREE.MeshStandardMaterial({ map: crownT, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide })); crown.position.y = 0.2; helm.add(crown);
    for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; const p = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), M('#ffc107', { metalness: 0.7, roughness: 0.3 })); p.position.set(Math.cos(a) * 0.19, 0.31, Math.sin(a) * 0.19); helm.add(p); }
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3, 1, 4), M('#b71c1c', { side: THREE.DoubleSide, roughness: 0.8 })); cape.position.set(0, 0.32, 0.33); cape.rotation.x = 0.28; torso.add(cape);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.07, 8, 18), M('#fafafa', { roughness: 0.95 })); collar.rotation.x = PI / 2; collar.position.y = 0.86; torso.add(collar);
  } else {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.44, 16), steel); helm.add(h); const top = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 8, 0, PI * 2, 0, PI / 2), steel); top.position.y = 0.22; helm.add(top);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.03), M('#111')); slit.position.set(0, 0.06, -0.225); helm.add(slit);
    const sn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), steel); sn.rotation.x = -PI / 2; sn.position.set(0, -0.06, -0.27); helm.add(sn);
    const plume = new THREE.Group(); plume.position.set(0, 0.42, 0.05); helm.add(plume);
    for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), M(i % 2 ? o.plume : '#fafafa')); p.scale.set(0.8, 1.6, 0.8); p.position.set(0, i * 0.06, i * 0.09); p.rotation.x = 0.6; plume.add(p); }
  }
  const armR = new THREE.Group(); armR.position.set(0.34, 0.74, 0); torso.add(armR);
  const armL = new THREE.Group(); armL.position.set(-0.34, 0.74, 0); torso.add(armL);
  for (const a of [armR, armL]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.6, 8), steel); m.position.y = -0.3; a.add(m); const g = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), steelD); g.position.y = -0.62; a.add(g); }
  armR.rotation.set(-1.1, 0, 0.1); armL.rotation.set(-0.7, 0, -0.25);
  { const shp = new THREE.Shape(); shp.moveTo(-0.32, 0.36); shp.lineTo(0.32, 0.36); shp.lineTo(0.32, 0.0); shp.quadraticCurveTo(0.3, -0.32, 0, -0.5); shp.quadraticCurveTo(-0.3, -0.32, -0.32, 0.0); shp.closePath();
    const sh = new THREE.Mesh(new THREE.ExtrudeGeometry(shp, { depth: 0.05, bevelEnabled: false }), M(o.shield || '#1565c0')); sh.position.set(-0.6, 0.45, -0.05); sh.rotation.y = -PI / 2 + 0.25; torso.add(sh); }
  let lanceP = null, penn = null, sword = null;
  if (o.king) {
    sword = new THREE.Group(); sword.position.y = -0.62; armR.add(sword);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.3, 0.025), M('#f1f5f8', { metalness: 0.95, roughness: 0.12, envMapIntensity: 1.8 })); blade.position.y = -0.8; sword.add(blade);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 4), M('#f1f5f8', { metalness: 0.95, roughness: 0.12 })); tip.rotation.z = PI; tip.position.y = -1.52; sword.add(tip);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.06), M('#ffc107', { metalness: 0.7, roughness: 0.3 })); guard.position.y = -0.14; sword.add(guard);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), M('#5d4037')); grip.position.y = -0.02; sword.add(grip);
  } else {
    lanceP = new THREE.Group(); lanceP.position.set(0.42, 0.5, -0.35); torso.add(lanceP);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.11, LANCE, 10), M('#fff', { map: lanceT, roughness: 0.5 })); sh.rotation.x = -PI / 2; sh.position.z = -LANCE / 2 + 0.6; lanceP.add(sh);
    const vam = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 14, 1, true), M('#cfd8dc', { metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide })); vam.rotation.x = -PI / 2; vam.position.z = -0.15; lanceP.add(vam);
    penn = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshLambertMaterial({ map: pennTs[o.penn], transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 }));
    penn.position.set(0, 0.32, -LANCE + 1.5); penn.rotation.y = -PI / 2; lanceP.add(penn);
  }
  root.traverse(q => { if (q.isMesh) q.castShadow = true; });
  return { root, horse, hb, neckG, tail, hLegs, torso, helm, armR, armL, lanceP, penn, sword };
}
const HORSES = ['#f3efe6', '#6d4c41', '#3e2723', '#9e9e9e', '#a1887f', '#f3efe6'];
const XS = [0, 4.2, -4.2, 8.4, -8.4, 12.6, -12.6, 16.8, -16.8];
const KN = [];
for (let i = 0; i < 18; i++) { const row = i < 9 ? 0 : 1, j = i % 9;
  const lead = i === 0;
  const k = makeKnight({ horse: lead ? '#212121' : HORSES[(i * 7) % HORSES.length], mane: lead ? '#111' : '#5d4037', cap: lead ? 3 : (i * 3) % 5 === 3 ? 0 : (i * 3) % 5, plume: ['#d32f2f', '#1565c0', '#2e7d32', '#ffca28'][i % 4], shield: ['#1565c0', '#c62828', '#2e7d32', '#6a1b9a'][i % 4], penn: i % 4, steel: lead ? '#5c6670' : null });
  k.row = row; k.j = j; k.x0 = XS[j]; k.zH = (row ? -55 : -48) - Math.abs(XS[j]) * 0.22; k.ph = hash(i * 13) * 6; KN.push(k); }
const KING = makeKnight({ horse: '#fafafa', mane: '#e0e0e0', cap: 4, king: true, shield: '#b71c1c' });

// ---------------- hero ----------------
const hero = makeCar('#e53935');
{ const a = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 1.0, 5), STD('#26282c')); a.position.set(0.5, 1.95, 1.05); hero.add(a); }
const halos = [-1, 1].map(s => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: fogT, color: new THREE.Color(1.0, 0.95, 0.55), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false })); m.position.set(s * 0.6, 0.76, -2.35); m.scale.set(0.4, 0.4, 1); hero.add(m); return m; });
// royal flag on the aerial
const flagT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#1e3a8a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h / 2); c.lineTo(0, h); c.closePath(); c.fill();
  c.fillStyle = '#ffc107'; c.beginPath(); c.moveTo(30, 88); c.lineTo(30, 44); c.lineTo(50, 62); c.lineTo(66, 36); c.lineTo(82, 62); c.lineTo(102, 44); c.lineTo(102, 88); c.closePath(); c.fill(); });
const flagG = new THREE.Group(); flagG.position.set(0.5, 2.18, 1.05); hero.add(flagG);
const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4, 6, 1), new THREE.MeshLambertMaterial({ map: flagT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); flag.rotation.y = PI / 2; flag.position.z = 0.4; flagG.add(flag); flagG.visible = false;
// "knight vision" dragon costume
const dragonG = new THREE.Group(); hero.add(dragonG); dragonG.visible = false;
const dragM = STD('#8e1414', { roughness: 0.5, side: THREE.DoubleSide }), hornM = STD('#f2e6c9', { roughness: 0.6 });
const wings = [-1, 1].map(s => { const shp = new THREE.Shape(); shp.moveTo(0, 0.6); shp.lineTo(1.2, 1.2); shp.lineTo(2.7, 1.0); shp.lineTo(2.3, 0.3); shp.quadraticCurveTo(2.0, 0.45, 1.8, -0.1); shp.quadraticCurveTo(1.45, 0.15, 1.15, -0.45); shp.quadraticCurveTo(0.8, -0.1, 0.5, -0.6); shp.lineTo(0, -0.5); shp.closePath();
  const g = new THREE.ShapeGeometry(shp); g.translate(0, 0.5, 0);
  const piv = new THREE.Group(); piv.position.set(s * 0.6, 1.58, 0.15); piv.scale.setScalar(0.5); dragonG.add(piv); const m = new THREE.Mesh(g, dragM); if (s < 0) m.rotation.y = PI; m.castShadow = true; piv.add(m); return { piv, s }; });
for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 10), hornM); h.position.set(s * 0.35, 1.8, -0.5); h.rotation.x = 0.7; h.rotation.z = -s * 0.25; dragonG.add(h); }
for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 6), dragM); c.position.set(0, 1.66, -0.3 + i * 0.32); dragonG.add(c); }
const tailSegs = []; { let par = dragonG; for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.set(0, i ? 0 : 0.8, i ? 0.42 : 2.25); par.add(g);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.17 - i * 0.025, 0.19 - i * 0.025, 0.46, 8), dragM); m.rotation.x = PI / 2; m.position.z = 0.2; g.add(m); tailSegs.push(g); par = g; }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 4), dragM); tip.rotation.x = PI / 2; tip.position.z = 0.55; par.add(tip); }
// exhaust puffs
const puffs = Array.from({ length: 8 }, (_, i) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: fogT, color: new THREE.Color('#9e9e9e'), transparent: true, depthWrite: false, opacity: 0 })); scene.add(m); return m; });

// ---------------- the year 1347 (separate set at x = 3000) ----------------
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), L('#86c34f')); g.rotation.x = -PI / 2; g.position.set(X0, 0.02, -100); g.receiveShadow = true; scene.add(g);
  const stone = STD('#b8ad9a', { roughness: 0.95 }), stoneD = STD('#9c917e', { roughness: 0.95 }), roofB = STD('#1e4fa8'), roofR = STD('#b3261e');
  const castle = new THREE.Group(); castle.position.set(X0, 0, -46); scene.add(castle);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(44, 11, 3), stone); wall.position.y = 5.5; castle.add(wall);
  for (let x = -21; x <= 21; x += 2) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 3.1), stone); m.position.set(x, 11.6, 0); castle.add(m); }
  const gate = new THREE.Mesh(new THREE.BoxGeometry(6, 7, 0.4), STD('#4e342e')); gate.position.set(0, 3.5, 1.6); castle.add(gate);
  for (const x of [-22, 22, -8, 8]) { const big = Math.abs(x) > 10; const r = big ? 4 : 2.6, hh = big ? 18 : 14; const tw = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hh, 20), x === 8 || x === -8 ? stoneD : stone); tw.position.set(x, hh / 2, big ? 0 : -6); castle.add(tw);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(r * 1.2, r * 2.2, 20), big ? roofB : roofR); rf.position.set(x, hh + r * 1.1, big ? 0 : -6); castle.add(rf);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), STD('#555')); pole.position.set(x, hh + r * 2.2 + 1.1, big ? 0 : -6); castle.add(pole);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.0), new THREE.MeshLambertMaterial({ map: pennTs[(x > 0 ? 1 : 3)], transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); fl.position.set(x + 0.9, hh + r * 2.2 + 1.7, big ? 0 : -6); castle.add(fl); }
  castle.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // a few trees + hills
  for (let i = 0; i < 26; i++) { const R = hash(i * 5), R2 = hash(i * 9 + 1); const x = X0 + (R - 0.5) * 160, z = -70 - R2 * 90; if (Math.abs(x - X0) < 26 && z > -60) continue;
    const t = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + R2 * 2, 1), new THREE.MeshLambertMaterial({ color: ['#3f8f2e', '#4fa336', '#2f7a28'][i % 3], flatShading: true })); t.position.set(x, 4, z); t.castShadow = true; scene.add(t);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), L('#6d4a2b')); tr.position.set(x, 1.5, z); scene.add(tr); }
  for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 12), L(['#7cb342', '#8bc34a', '#689f38'][i % 3])); h.scale.set(1.4, 0.25, 1); h.position.set(X0 - 160 + i * 80, -4, -190 - (i % 2) * 40); scene.add(h); }
  // cart with cage
  const wood = STD('#8d6e63', { roughness: 0.9 }), woodD = STD('#5d4037', { roughness: 0.9 });
  const cart = new THREE.Group(); cart.position.set(X0, 0, CZ); scene.add(cart);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 5.8), wood); bed.position.y = 0.95; cart.add(bed);
  for (const [x, z] of [[-1.6, -1.8], [1.6, -1.8], [-1.6, 1.8], [1.6, 1.8]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 18), woodD); w.rotation.z = PI / 2; w.position.set(x, 0.62, z); cart.add(w); }
  const barM = STD('#4e3b2c', { roughness: 0.8 });
  for (let k = 0; k < 2; k++) for (let z = -2.8; z <= 2.81; z += 0.56) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), barM); b.position.set(k ? 1.42 : -1.42, 2.2, z); cart.add(b); }
  for (let k = 0; k < 2; k++) for (let x = -1.2; x <= 1.21; x += 0.6) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), barM); b.position.set(x, 2.2, k ? 2.82 : -2.82); cart.add(b); }
  for (const x of [-1.42, 1.42]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 5.8), woodD); b.position.set(x, 3.3, 0); cart.add(b); }
  for (let z = -2.82; z <= 2.83; z += 1.41) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.98, 0.12, 0.12), woodD); b.position.set(0, 3.32, z); cart.add(b); }
  const signT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#efe3c2'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6d4c41'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); c.fillStyle = '#8e1414'; c.font = '900 50px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HERE BE DRAGON', w / 2, h / 2 + 4); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshLambertMaterial({ map: signT })); sign.position.set(0, 4.15, 2.0); sign.rotation.x = -0.12; cart.add(sign);
  for (const x of [-1.42, 1.42]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), woodD); p.position.set(x * 0.9, 3.75, 2.0); cart.add(p); }
  cart.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }

// ---------------- motion ----------------
const zHook = mono([[0, 150], [2.6, 94], [5.0, 42], [6.6, 4], [7.6, -15], [8.7, ZSTOP], [99, ZSTOP]]);
function heroPose(t) {
  if (isRight(t)) { const z = t < tRolls + 0.9 ? ZSTOP : mono([[tRolls + 0.9, ZSTOP], [tRolls + 3.0, ZSTOP - 22], [tRolls + 6, ZSTOP - 95], [tRolls + 12, ZSTOP - 280]])(t); return { x: 0, y: 0, z, h: 0, pitch: 0, roll: 0 }; }
  if (t < tFlee - 0.1) return { x: 0, y: 0, z: zHook(t), h: 0, pitch: 0, roll: 0 };
  const T0 = tFlee - 0.1; const xf = tt => 2.1 * ease(clamp((tt - T0) / 0.9)); const zf = tt => ZSTOP - 6 * Math.max(0, tt - T0) * Math.max(0, tt - T0);
  const x = xf(t), z = zf(t), dx = x - xf(t - 0.05), dz = z - zf(t - 0.05); return { x, y: 0, z, h: Math.abs(dx) + Math.abs(dz) > 1e-4 ? Math.atan2(-dx, -dz) : 0, pitch: 0, roll: 0 };
}
// knight poses
const T_EM = tOut - 0.3, T_CH = tCharge - 0.15;
const kingZ = mono([[tLove + 1.6, FZ - 10], [tKing + 0.2, -44], [tDraws - 0.35, ZSTOP - 0.3], [tDraws, ZSTOP], [99, ZSTOP]]);
function knightPose(k, t) {
  const right = isRight(t), d = k.row * 0.25 + k.j * 0.035;
  const zEm = mono([[T_EM + d, FZ - 12 - k.row * 7], [T_EM + d + 1.4, (FZ - 12 - k.row * 7 + k.zH) / 2 + 3], [T_EM + d + 2.5, k.zH]]);
  let p = { x: k.x0, z: zEm(t), h: PI, rear: 0, lp: 1.35, spd: 0, bow: 0, vis: true, cheer: 0 };
  const dz = 0.03; p.spd = Math.abs(zEm(t + dz) - zEm(t)) / dz;
  if (!right) {
    // alarm: rearing horses at flash / rev / roar
    const rr_ = (a, w) => win(t, a, a + w, 0.25) * (0.5 + 0.5 * hash(k.j * 7 + k.row));
    p.rear = Math.max(rr_(tFlash + 0.1 + k.j * 0.05, 0.9), rr_(tRev + 0.15 + k.j * 0.04, 0.8), rr_(tRoars + 0.1 + k.j * 0.05, 0.8)) * 0.55;
    if (t > tDragon - 0.2) p.lp = lerp(1.35, 0.06, ease(clamp((t - tDragon + 0.2 - k.j * 0.05) / 0.5)));
    if (t > T_CH) { const u = t - T_CH - d * 0.5; const dzc = u > 0 ? Math.min(4 * u * u, 18 * u - 20.25) : 0; p.z = k.zH + dzc; p.spd = u > 0 ? Math.min(8 * u, 18) : 0; p.rear = 0;
      const tU = tFollow + 0.05 + k.row * 0.25 + (k.j % 3) * 0.06;
      if (t > tU) { const zU = k.zH + Math.min(4 * (tU - T_CH - d * 0.5) ** 2, 18 * (tU - T_CH - d * 0.5) - 20.25); const sgn = k.x0 >= 0 ? 1 : -1, R = 3.5, D = 0.85, u2 = clamp((t - tU) / D), th = PI * u2;
        p.x = k.x0 + sgn * R * (1 - Math.cos(th)); p.z = zU + R * Math.sin(th) - (t > tU + D ? 16 * (t - tU - D) : 0); p.h = Math.atan2(-sgn * Math.sin(th), -Math.cos(th)); if (u2 >= 1) p.h = 0; p.lp = lerp(0.06, 1.0, u2); } }
    if (t > T_SET) { // the year 1347: around the cage
      const i = k.row * 9 + k.j, side = i % 2 ? 1 : -1, kk = i >> 1, col = kk % 3, zi = Math.floor(kk / 3);
      p = { x: X0 + side * (4.4 + col * 2.5), z: CZ - 6 + zi * 4.2 - col * 0.8, h: side * (PI / 2 + 0.35), rear: 0, lp: 1.25 + 0.18 * Math.sin(t * 7 + i), spd: 0, bow: 0, vis: true, cheer: 1 };
      if (i === 0) { p.x = X0 + 2.6; p.z = CZ + 4.3; p.h = PI + 0.5; }
    }
  } else {
    if (t > tBows + 0.15) p.bow = win(t, tBows + 0.15 + k.j * 0.04, tBows + 1.4, 0.3);
    if (t > tArise - 0.1) p.lp = 1.35 + 0.25 * win(t, tArise - 0.1 + k.j * 0.03, tSir + 1.2, 0.25);
    const tT = tRide - 0.25 + k.j * 0.06 + k.row * 0.15;
    if (t > tT) { const u = clamp((t - tT) / 0.8); p.h = PI - PI * ease(u) * (k.x0 >= 0 ? 1 : -1); const g = Math.max(0, t - tT - 0.5); p.z = k.zH - 7 * g * g - (g > 1 ? 0 : 0); p.spd = 14 * g; p.lp = 1.35; }
    if (p.z < FZ - 2) p.vis = false;
  }
  return p;
}
function kingPose(t) {
  const right = isRight(t);
  if (!right) { if (t > T_SET) return { x: X0 - 2.4, z: CZ + 3.6, h: PI - 0.55, rear: 0, spd: 0, vis: true }; return { vis: false }; }
  let z = kingZ(t), h = PI, spd = Math.abs(kingZ(t + 0.03) - z) / 0.03;
  const tT = tRide - 0.1; if (t > tT) { const u = clamp((t - tT) / 0.9); h = PI - PI * ease(u); const g = Math.max(0, t - tT - 0.6); z = ZSTOP - 7 * g * g; spd = 14 * g; }
  return { x: 2.15, z, h, rear: right && t > tArise - 0.15 && t < tSir + 0.9 ? 0.32 * win(t, tArise - 0.15, tSir + 0.9, 0.3) : 0, spd, vis: t > tLove + 1.6 && z > FZ - 2 };
}
const _p = new THREE.Vector3();
function poseKnight(k, p, t) {
  k.root.visible = p.vis !== false; if (!k.root.visible) return;
  k.root.position.set(p.x, 0, p.z); k.root.rotation.y = p.h; k.horse.rotation.x = p.rear || 0;
  const gal = (p.spd || 0) > 0.5, ph = t * ((p.spd || 0) > 12 ? 15 : 11.5) + (k.ph || 0);
  k.hLegs.forEach(l => { const s = Math.sin(ph + l.ph); l.piv.rotation.x = gal ? (l.front ? 0.6 : 0.45) * s : 0; l.kn.rotation.x = gal ? (l.front ? 0.9 : -0.6) * Math.max(0, l.front ? -s : s) : 0;
    if ((p.rear || 0) > 0.05 && l.front) { l.piv.rotation.x = -0.9 * p.rear / 0.55; l.kn.rotation.x = 1.4 * p.rear / 0.55; } });
  k.hb.position.y = gal ? 0.09 * Math.abs(Math.sin(ph)) : 0; k.hb.rotation.x = gal ? 0.035 * Math.sin(ph * 2) : 0;
  k.neckG.rotation.x = (gal ? 0.08 * Math.sin(ph * 2 + 1) : 0.04 * Math.sin(t * 1.3 + (k.ph || 0))) - 0.3 * (p.rear || 0) + 0.35 * (p.bow || 0);
  k.tail.rotation.x = -0.6 - (gal ? 0.35 + 0.1 * Math.sin(ph * 2) : 0.05 * Math.sin(t * 2 + (k.ph || 0)));
  k.torso.rotation.x = -0.55 * (p.bow || 0) + (gal && p.lp < 0.5 ? -0.22 : 0);
  if (k.lanceP) { k.lanceP.rotation.x = p.lp; k.penn.rotation.x = 0.12 * Math.sin(t * 9 + (k.ph || 0)); }
  k.armL.rotation.set(-0.7, 0, -0.25);
  if (p.cheer) k.armL.rotation.set(-0.7 - 1.6, 0, -0.5 + 0.3 * Math.sin(t * 9 + (k.ph || 0)));
}
// king's sword arm: aim the right arm (+ sword) at a world point
const DOWN = V3(0, -1, 0);
function aimArm(k, target) {
  k.root.updateMatrixWorld(true); const sh = k.armR.parent.localToWorld(k.armR.position.clone());
  const d = target.clone().sub(sh).normalize(); const qW = new THREE.Quaternion(); k.armR.parent.getWorldQuaternion(qW);
  d.applyQuaternion(qW.invert()); k.armR.quaternion.setFromUnitVectors(DOWN, d);
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const WC = (off, look, fov = 40) => t => { const p = heroPose(t); return [V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2]), fov]; };
const WCa = (off, lookAbs, fov = 40) => t => { const p = heroPose(t); return [V3(p.x + off[0], off[1], p.z + off[2]), V3(...lookAbs), fov]; };
const Z = ZSTOP;
const camKeys = [
  [0.0, WC([1.0, 2.4, 9], [0, 1.6, -40], 40)],
  [tThen - 0.3, WC([1.0, 2.6, 9.5], [0, 1.8, -40], 40)],
  ...cut(tThen - 0.25, WCa([0, 5, 20], [0, 6, FZ], 40)),
  [tHooves - 0.25, WCa([0, 9, 30], [0, 7, FZ], 42)],
  [tOut - 0.3, WCa([0, 10, 32], [0, 7, FZ], 42)],
  ...cut(tOut - 0.25, WC([1.3, 1.9, 8.5], [0, 2.4, -32], 40)),
  [tWhat - 0.2, WC([1.2, 2.0, 8.0], [0, 2.4, -30], 40)],
  [W1 - 0.2, WC([1.1, 2.1, 7.6], [0, 2.4, -30], 40)],
  // wrong
  ...cut(W1 - 0.15, Ac([0.9, 2.4, Z + 7.5], [0, 1.9, -48], 40)),
  [tFlash - 0.25, Ac([0.9, 2.4, Z + 7.2], [0, 1.9, -48], 40)],
  ...cut(tFlash - 0.2, Ac([2.8, 2.3, Z - 11], [0, 0.9, Z], 40)),
  [tTheyll - 0.25, Ac([2.6, 2.2, Z - 10.2], [0, 0.9, Z], 40)],
  ...cut(tTheyll - 0.2, Ac([-2.5, 4.2, Z + 9], [0, 2.0, -50], 40)),
  [tBut - 0.25, Ac([-2.7, 4.4, Z + 9.6], [0, 2.0, -50], 40)],
  ...cut(tBut - 0.2, Ac([-1.7, 1.0, Z - 7.2], [0, 0.85, Z], 38)),
  [tTo - 0.25, Ac([-1.5, 0.95, Z - 6.4], [0, 0.85, Z], 38)],
  ...cut(tTo - 0.2, Ac([0.9, 3.5, -48 - 3.2], [0, 1.2, Z], 15)),
  [S('wrong2').end + 0.2, Ac([0.9, 3.4, -48 - 2.6], [0, 1.2, Z], 13)],
  ...cut(tTwenty - 0.2, Ac([1.2, 1.3, Z + 6.5], [0, 2.4, -50], 40)),
  [tFlee - 0.3, Ac([1.2, 1.3, Z + 6.2], [0, 2.4, -50], 40)],
  ...cut(tFlee - 0.25, Ac([6, 14, -2], [1, 0, -46], 40)),
  [T_WHITE0 + 0.4, Ac([6, 15, -6], [1, 0, -52], 40)],
  ...cut(T_SET, Ac([X0 + 1.5, 5.5, CZ + 30], [X0, 2.6, CZ - 2], 40)),
  [tCage - 0.3, Ac([X0 + 1.5, 5.0, CZ + 27], [X0, 2.6, CZ - 2], 40)],
  ...cut(tCage - 0.25, Ac([X0 + 3.0, 2.4, CZ + 7.8], [X0, 1.7, CZ], 40)),
  [tFirst - 0.3, Ac([X0 + 2.7, 2.4, CZ + 7.0], [X0, 1.7, CZ], 40)],
  ...cut(tFirst - 0.25, Ac([X0 + 0.5, 6.5, CZ + 24], [X0, 3.0, CZ - 4], 40)),
  [tRew0, Ac([X0 + 0.5, 7.5, CZ + 27], [X0, 3.2, CZ - 4], 40)],
  // right
  ...cut(tRew1, WC([1.1, 2.1, 7.6], [0, 2.4, -30], 40)),
  [tLove - 0.25, Ac([1.1, 2.2, Z + 8.2], [0, 2.4, -50], 40)],
  ...cut(tLove - 0.2, Ac([3.2, 2.6, Z + 8.5], [-0.4, 1.3, Z - 12], 52)),
  [tEven - 0.25, Ac([3.3, 2.65, Z + 8.8], [-0.4, 1.3, Z - 12], 52)],
  ...cut(tEven - 0.2, Ac([11, 1.8, Z - 1.5], [0, 0.9, Z - 1.0], 40)),
  [tKing - 0.3, Ac([11.4, 1.85, Z - 1.7], [0, 0.9, Z - 1.0], 40)],
  ...cut(tKing - 0.25, Ac([-2.0, 2.7, Z + 8.5], [1.2, 2.0, Z - 8], 40)),
  [tDraws - 0.3, Ac([-2.1, 2.8, Z + 8.0], [1.4, 2.2, Z - 4], 40)],
  ...cut(tDraws - 0.25, Ac([5.2, 3.2, Z + 5.4], [1.7, 2.7, Z], 40)),
  [tTaps - 0.25, Ac([5.0, 3.3, Z + 5.0], [1.6, 2.7, Z], 40)],
  ...cut(tTaps - 0.2, Ac([-3.4, 4.6, Z + 6.0], [0.8, 1.9, Z], 40)),
  [S('right4').end + 0.2, Ac([-3.6, 4.8, Z + 6.4], [0.8, 1.9, Z], 40)],
  ...cut(tArise - 0.2, Ac([-3.0, 1.2, Z + 9.5], [2.6, 3.3, Z - 4], 42)),
  [S('right5').end + 0.3, Ac([-3.2, 1.2, Z + 10.0], [2.6, 3.4, Z - 4], 42)],
  ...cut(tRoyal - 0.25, Ac([2.6, 2.9, Z + 4.4], [0.5, 2.35, Z + 0.9], 36)),
  [tThenR - 0.25, Ac([2.7, 2.95, Z + 4.6], [0.5, 2.35, Z + 0.9], 36)],
  ...cut(tThenR - 0.2, Ac([2.5, 9, Z + 18], [0, 2.5, -56], 40)),
  [tRolls, Ac([2.5, 10.5, Z + 20], [0, 2.5, -60], 40)],
  [S('right7').start - 0.2, Ac([2.5, 11, Z + 21], [0, 2.0, -70], 40)],
  ...cut(S('right7').start - 0.15, WC([1.4, 3.2, 10], [0, 1.6, -30], 40)),
  [TOTAL, WC([1.6, 5.0, 13], [0, 1.4, -34], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
function update(t) {
  const right = isRight(t);
  const c = cam(t); camera.fov = c.fov; camera.near = 0.2; camera.far = 3000; camera.updateProjectionMatrix();
  // hero
  const hp = heroPose(t); const inSet = !right && t > T_SET;
  if (inSet) placeCar(hero, { x: X0, y: 1.1, z: CZ, h: 0, pitch: 0, roll: 0 }); else placeCar(hero, hp);
  const bG = hero.userData.bodyG;
  if (!right && t > tRev - 0.05 && t < tRev + 0.9) { const u = (t - tRev + 0.05) / 0.95; bG.rotation.z = 0.035 * Math.sin(t * 38) * (1 - u); bG.rotation.x = -0.03 * Math.sin(PI * u); }
  if (!right && t > tRoars && t < tRoars + 0.7) bG.rotation.z = 0.03 * Math.sin(t * 40);
  if (right) { const b1 = win(t, tBow - 0.05, tBow + 0.6, 0.2) * 0.07, b2 = win(t, tBows - 0.05, tBows + 1.1, 0.3) * 0.16, b3 = win(t, tArise, tArise + 0.5, 0.15) * 0.06;
    bG.rotation.x = -(b1 + b2) + b3; bG.position.y += (b1 + b2) * 0.6; }
  if (inSet) hero.userData.wheels.forEach(w => w.rotation.x = 0);
  const hlOn = (!right && ((t > tFlash && t < tFlash + 0.28) || (t > tFlash + 0.42 && t < tFlash + 0.7) || (t > tRed && t < T_SET))) ? 1 : 0;
  hero.userData.hl.emissiveIntensity = hlOn ? 3.2 : 0.3;
  halos.forEach(h => { h.material.opacity = hlOn ? 0.95 : 0; h.scale.setScalar(hlOn ? 0.42 + 0.04 * Math.sin(t * 20) : 0.3); });
  blink(hero, t, false, false);
  hero.userData.tl.emissiveIntensity = right && t > tStop - 0.2 && t < tRolls + 0.8 ? 1.4 : 0.4;
  // knight vision dragon costume
  dragonG.visible = !right && t > tTo - 0.15 && t < S('wrong2').end + 0.25;
  const fl = Math.sin(t * 9); wings.forEach(w => { w.piv.rotation.z = w.s * (0.2 + 0.35 * fl); });
  tailSegs.forEach((g, i) => { g.rotation.y = 0.25 * Math.sin(t * 5 - i * 0.7); g.rotation.x = i ? -0.12 : -0.2; });
  // exhaust puffs
  puffs.forEach((m, i) => { const tau = t - tRev - i * 0.1; const on = !right && tau > 0 && tau < 1.3; m.material.opacity = on ? 0.55 * (1 - tau / 1.3) : 0; m.visible = on;
    if (on) { m.position.set(hp.x + 0.55 + (hash(i) - 0.5) * 0.6 * tau, 0.35 + tau * 0.9, hp.z + 2.4 + tau * 2.2); m.scale.setScalar(0.5 + tau * 1.6); } });
  // flag
  flagG.visible = right && t > tRoyal - 0.05; flagG.scale.setScalar(back((t - tRoyal + 0.05) / 0.4));
  flag.rotation.x = 0.1 * Math.sin(t * 8); flag.rotation.z = 0.08 * Math.sin(t * 11);
  // fog wall
  const fogGo = right ? ramp(t, tRolls - 0.4, tRolls + 1.6) : 0, fogVis = (!right && t > T_SET) ? 0 : 1;
  fogSprites.forEach((s, i) => { const d = s.userData; s.visible = fogVis > 0 && fogGo < 0.995;
    s.position.set(d.p.x + Math.sin(t * d.sp + d.ph) * 2.5, d.p.y + Math.sin(t * d.sp * 0.7 + d.ph) * 0.8 + fogGo * 6, d.p.z - fogGo * 40);
    const sc = d.sc * (1 + 0.06 * Math.sin(t * 0.8 + d.ph) + fogGo * 0.8); s.scale.set(sc, sc * 0.8, 1); s.material.rotation = d.ph + t * 0.05 * (i % 2 ? 1 : -1);
    s.material.opacity = 0.9 * (1 - fogGo) * (t > tHooves - 0.2 && t < tOut && !right ? 0.85 + 0.15 * Math.sin(t * 9 + i) : 1); });
  fogWall.visible = fogVis > 0 && fogGo < 0.995; fogWall.material.opacity = 1 - fogGo; fogWall.position.z = FZ - 6 - fogGo * 40;
  // knights
  KN.forEach(k => poseKnight(k, knightPose(k, t), t));
  const kp = kingPose(t); poseKnight(KING, { ...kp, lp: 0, cheer: 0, bow: 0 }, t);
  if (KING.root.visible) {
    KING.helm.rotation.set(0, 0, 0);
    if (!right) { KING.sword.visible = true; aimArm(KING, KING.root.localToWorld(V3(0.6, 6, -0.6))); KING.armL.rotation.set(-2.2, 0, -0.6 + 0.3 * Math.sin(t * 9)); }
    else {
      KING.sword.visible = t > tDraws + 0.1;
      const roof = V3(0.25, 1.62, ZSTOP);
      let tgt = null;
      if (t > tDraws - 0.1 && t < tTaps - 0.1) { const u = ease(clamp((t - tDraws + 0.1) / 0.5)); tgt = KING.root.localToWorld(V3(lerp(0.5, 0.4, u), lerp(1.4, 6, u), lerp(0.1, -1.2, u))); }
      else if (t >= tTaps - 0.1 && t < tArise - 0.2) { const taps = [tOnce - 0.05, tTwice - 0.05]; let lift = 1; for (const ta of taps) lift = Math.min(lift, clamp(Math.abs(t - ta) / 0.24));
        tgt = roof.clone().add(V3(0, 1.3 * smoothLift(lift), 0)); }
      else if (t >= tArise - 0.2 && t < tThenR) { const u = ease(clamp((t - tArise + 0.2) / 0.5)); tgt = KING.root.localToWorld(V3(0.6, lerp(1.6, 6.5, u), -0.3)); }
      if (tgt) aimArm(KING, tgt); else KING.armR.rotation.set(-0.4, 0, 0.15);
      if (t > tKing && t < tArise + 1.4) KING.helm.rotation.y = 0.35 * win(t, tKing + 0.8, tArise + 1.4, 0.3);
      KING.armL.rotation.set(-0.7, 0, -0.25);
    }
  }
  applyCam(c, t, !right && t > T_CH && t < tFollow ? 0.03 : 0);
  camera.updateMatrixWorld(true);
}
function smoothLift(l) { return l * l * (3 - 2 * l); }

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const PURP = '#6a1b9a', GOLD = '#b8860b';
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('SUNDAY MORNING', BLUE, tSunday - 0.1, tThen - 0.15, 58);
    P_('ALL THREE LANES…', PURP, tAcross - 0.1, tWall - 0.1, 50, iconWarn);
    P_('A WALL OF FOG', PURP, tWall - 0.05, S('hook1').end + 0.3, 58, iconWarn);
    floatText('CLIP CLOP', W / 2 + 120, 700, t, tHooves - 0.05, tTrump - 0.05, 110, YEL, 0.08);
    floatText('TA-TAAA!', W / 2 - 110, 820, t, tTrump, tOut - 0.1, 120, YEL, -0.08);
    P_('KNIGHTS. REAL ONES.', PURP, tKnights - 0.25, S('hook2').end + 0.4, 54, iconWarn);
    floatText('HONK!', W / 2, 700, t, tHonk - 0.05, tFlash - 0.05, 140, YEL, -0.06);
    floatText('FLASH!', W / 2, 700, t, tFlash - 0.05, tRev - 0.05, 140, YEL, 0.06);
    floatText('VROOOM!', W / 2, 700, t, tRev - 0.05, tTheyll - 0.1, 140, YEL, -0.05);
    P_('"OUT OF THE WAY!"', RED, tTheyll - 0.05, S('wrong1').end + 0.3, 54, iconX);
    P_('RED BEAST', RED, tRed - 0.1, tTo - 0.15, 52, iconCheck, 400);
    P_('GLOWING EYES', RED, tGlow - 0.05, tTo - 0.15, 52, iconCheck, 520);
    P_('ROARS', RED, tRoars - 0.05, tTo - 0.15, 52, iconCheck, 640);
    P_('KNIGHT VISION', PURP, tTo - 0.1, S('wrong2').end + 0.3, 54);
    floatText('DRAGON!', W / 2, 760, t, tDragon - 0.05, S('wrong2').end + 0.3, 150, YEL, -0.07);
    floatText('CHARGE!', W / 2, 720, t, tCharge - 0.1, tFlee - 0.1, 150, YEL, 0.06);
    P_('20 KNIGHTS', RED, tTwenty - 0.1, tFlee - 0.15, 60, iconX);
    P_('INTO THE FOG', RED, tFlee - 0.1, tOutC - 0.3, 58, iconX);
    // whiteout + year
    const wa = Math.min(ramp(t, T_WHITE0, T_WHITE0 + 0.35), 1 - ramp(t, T_SET, T_SET + 0.45));
    if (wa > 0) { ctx.fillStyle = `rgba(246,243,238,${wa})`; ctx.fillRect(0, 0, W, H); }
    bigText(['YEAR', '1347'], 760, t, tYear - 0.15, tCage - 0.3, 150, i => i ? YEL : '#fff');
    P_('IN A CAGE', RED, tCage - 0.15, tFirst - 0.2, 62, iconX);
    P_('1ST DRAGON EVER CAUGHT', RED, tFirst - 0.1, tRew0, 46, iconX);
  } else {
    P_('STOP', GREEN, tStop - 0.1, tEngine - 0.1, 66, iconCheck);
    P_('ENGINE OFF', GREEN, tEngine - 0.05, tWindow - 0.1, 60, iconCheck);
    P_('WINDOW DOWN', GREEN, tWindow - 0.05, S('right2').end + 0.3, 60, iconCheck);
    P_('GOOD MANNERS', '#0277bd', tManners - 0.25, tBow - 0.1, 58, iconHeart);
    P_('BOW', GREEN, tBow - 0.1, tEven - 0.1, 70, iconCheck);
    P_('EVEN YOUR CAR BOWS', GREEN, tEven - 0.05, S('right3').end + 0.3, 50, iconCheck);
    P_('THE KING', GOLD, tKing - 0.15, tDraws - 0.15, 62);
    P_('HE DRAWS HIS SWORD…', PURP, tDraws - 0.1, tTaps - 0.1, 50, iconWarn);
    floatText('TAP!', W / 2 - 120, 720, t, tOnce - 0.08, tOnce + 0.5, 130, YEL, -0.08);
    floatText('TAP!', W / 2 + 120, 780, t, tTwice - 0.08, tTwice + 0.55, 130, YEL, 0.08);
    bigText(['ARISE,', 'SIR CAR-A-LOT!'], 700, t, tArise - 0.05, S('right5').end + 0.35, 104, i => i ? '#ffd54f' : '#fff');
    P_('ROYAL FLAG', GOLD, tRoyal - 0.15, tThenR - 0.15, 62, iconHeart);
    P_('BACK INTO THE FOG', '#0277bd', tRide - 0.2, tRolls - 0.3, 54, iconCheck);
    P_('MOTORWAY CLEAR', GREEN, tRolls - 0.1, S('right6').end + 0.4, 58, iconCheck);
  }
}
window.dbg = { hero, heroPose, knightPose, KN, KING, cam };
start(update, hud);
