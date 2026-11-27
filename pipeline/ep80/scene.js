// Episode 75: Saturday, a quick car wash for five euros – the gate opens: it's a car wash the size of a stadium
// wrong: full speed, straight through -> the brushes love a fast ball: bam left, bam right, pinball across the pitch
//        -> straight into the goal, upside down, covered in foam; scoreboard BRUSHES 1 : 0 CAR
// right: slowly, windows up, hazards on, a lap of honour like a champion -> Mexican wave, the brushes join in
//        -> the show: foam cannons, water fireworks, a hairdryer the size of a lorry -> rainbow, the car shines
//        like a trophy (turns gold) -> on the podium (2nd: a sponge, 3rd: a bucket): CHAMPION OF THE WASH
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeCar, applyCam, roundedPath, pathAt, makeLandscape, blink,
  project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, SKY,
  asphaltMat, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
scene.fog = new THREE.Fog(new THREE.Color('#cfe6f5'), 320, 1500);

// ---------------- timing ----------------
const tSat = WT('hook1', 'Saturday'), tQuick = WT('hook1', 'quick'), tFive = WT('hook1', 'Five'), tThen = WT('hook1', 'Then'), tGate = WT('hook1', 'gate');
const tStadium = WT('hook2', 'stadium'), tBrushesH = WT('hook2', 'Brushes'), tHouses = WT('hook2', 'houses'), tForty = WT('hook2', 'forty'), tFans = WT('hook2', 'fans'), tWhat = WT('hook2', 'What');
const tFull = WT('wrong1', 'full'), tStraight = WT('wrong1', 'Straight');
const tLove = WT('wrong2', 'love'), tBam1 = WT('wrong2', 'Bam', 0), tLeft = WT('wrong2', 'Left'), tBam2 = WT('wrong2', 'Bam', 1), tRightW = WT('wrong2', 'Right'), tPinball = WT('wrong2', 'pinball'), tAcross = WT('wrong2', 'across'), tPitch = WT('wrong2', 'pitch');
const tGoal = WT('wrong3', 'goal'), tUpside = WT('wrong3', 'Upside'), tFoam = WT('wrong3', 'foam'), tBr1 = WT('wrong3', 'Brushes'), tNil = WT('wrong3', 'nil');
const tSlowly = WT('right2', 'Slowly'), tWindows = WT('right2', 'Windows'), tHazards = WT('right2', 'Hazards'), tLap = WT('right2', 'lap'), tChampion = WT('right2', 'champion');
const tCrowd = WT('right3', 'crowd'), tMex = WT('right3', 'Mexican'), tJoin = WT('right3', 'brushes');
const tShow = WT('right4', 'show'), tFoamC = WT('right4', 'foam'), tWater = WT('right4', 'Water'), tDryer = WT('right4', 'hairdryer'), tLorry = WT('right4', 'lorry');
const tRainbow = WT('right5', 'rainbow'), tShines = WT('right5', 'shines'), tTrophy = WT('right5', 'trophy');
const tPodium = WT('right6', 'podium'), tChamp6 = WT('right6', 'Champion');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- stadium ----------------
const RX = 50, RZ = 74, K = 14, DR = 0.035, H0 = 1.2, DH = 1.6;
const rowR = k => 1.0 + k * DR, rowH = k => H0 + k * DH;
const RTOP = rowR(K), HTOP = rowH(K);
// pitch with stripes + lines
const pitchT = canvasTex(1024, 1536, (c, w, h) => {
  for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#5fae3c' : '#6fbf47'; c.fillRect(0, i * h / 16, w, h / 16); }
  c.strokeStyle = 'rgba(255,255,255,0.92)'; c.lineWidth = 9; const m = 30, X = x => m + (x + 34) / 68 * (w - 2 * m), Y = z => m + (z + 52.5) / 105 * (h - 2 * m);
  c.strokeRect(X(-34), Y(-52.5), X(34) - X(-34), Y(52.5) - Y(-52.5));
  c.beginPath(); c.moveTo(X(-34), Y(0)); c.lineTo(X(34), Y(0)); c.stroke();
  c.beginPath(); c.arc(X(0), Y(0), (X(9.15) - X(0)), 0, PI * 2); c.stroke();
  for (const s of [-1, 1]) { const z0 = s * 52.5, z1 = s * (52.5 - 16.5), z2 = s * (52.5 - 5.5);
    c.strokeRect(X(-20.15), Math.min(Y(z0), Y(z1)), X(20.15) - X(-20.15), Math.abs(Y(z1) - Y(z0)));
    c.strokeRect(X(-9.16), Math.min(Y(z0), Y(z2)), X(9.16) - X(-9.16), Math.abs(Y(z2) - Y(z0))); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(X(0), Y(0), 7, 0, PI * 2); c.fill();
});
{ const pw = 68 + 60 / (1024 - 60) * 68, ph = 105 + 60 / (1536 - 60) * 105;
  const g = new THREE.PlaneGeometry(pw, ph); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, L('#fff', { map: pitchT, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); m.position.y = 0.05; m.receiveShadow = true; scene.add(m); }
// surround (inside the bowl)
{ const g = new THREE.CircleGeometry(1, 96); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, L('#4f9a35', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.scale.set(RX + 0.5, 1, RZ + 0.5); m.position.y = 0.04; m.receiveShadow = true; scene.add(m); }
// stepped bowl (lathe, scaled to an ellipse)
const standM = L('#c9ccd2', { side: THREE.DoubleSide });
{ const pts = [new THREE.Vector2(1.0, 0), new THREE.Vector2(1.0, H0)];
  for (let k = 0; k < K; k++) { pts.push(new THREE.Vector2(rowR(k + 1), rowH(k))); pts.push(new THREE.Vector2(rowR(k + 1), rowH(k + 1))); }
  pts.push(new THREE.Vector2(RTOP + 0.01, HTOP + 3.2)); pts.push(new THREE.Vector2(RTOP + 0.03, HTOP + 3.2)); pts.push(new THREE.Vector2(RTOP + 0.03, 0));
  const g = new THREE.LatheGeometry(pts, 160); const m = new THREE.Mesh(g, standM); m.scale.set(RX, 1, RZ); m.receiveShadow = true; scene.add(m);
  // coloured seat rows (thin stripes on the treads)
  const seatCols = ['#1e6fb8', '#e53935', '#1e6fb8', '#ffffff'];
  for (let k = 0; k < K; k++) { const sp = [new THREE.Vector2(rowR(k) + 0.006, rowH(k) + 0.02), new THREE.Vector2(rowR(k + 1) - 0.006, rowH(k) + 0.02)];
    const sg = new THREE.LatheGeometry(sp, 160); const sm = new THREE.Mesh(sg, L(seatCols[k % 4], { side: THREE.DoubleSide })); sm.scale.set(RX, 1, RZ); sm.receiveShadow = true; scene.add(sm); }
  // outer wall with panels
  const wT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#e9edf2'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { c.fillStyle = '#c3cad3'; c.fillRect(x, 0, 6, h); }
    c.fillStyle = '#1e6fb8'; c.fillRect(0, h * 0.62, w, h * 0.1); c.fillStyle = '#9fb3c8'; for (let x = 10; x < w; x += 32) c.fillRect(x, h * 0.2, 20, h * 0.25); }, true);
  wT.repeat.set(10, 1);
  const og = new THREE.CylinderGeometry(1, 1, HTOP + 3.4, 160, 1, true); const om = new THREE.Mesh(og, L('#fff', { map: wT })); om.scale.set(RX * (RTOP + 0.032), 1, RZ * (RTOP + 0.032)); om.position.y = (HTOP + 3.4) / 2; om.receiveShadow = true; om.castShadow = true; scene.add(om);
  // roof canopy ring
  const rp = [new THREE.Vector2(RTOP - 0.14, HTOP + 7.5), new THREE.Vector2(RTOP + 0.035, HTOP + 3.4)];
  const rg = new THREE.LatheGeometry(rp, 160); const rm = new THREE.Mesh(rg, L('#f4f6f8', { side: THREE.DoubleSide })); rm.scale.set(RX, 1, RZ); scene.add(rm);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.004, 4, 160), L('#1e6fb8')); rim.rotation.x = PI / 2; rim.scale.set(RX * (RTOP - 0.14), RZ * (RTOP - 0.14), 1); rim.position.y = HTOP + 7.5; scene.add(rim);
}
// player tunnel under the south stand (car comes out here)
const TUN_Z = 72;
{ const dark = L('#1a1c22'), wall = L('#8d9299');
  box(0.6, 5.2, 18, wall, -4.3, 2.6, TUN_Z + 9, true); box(0.6, 5.2, 18, wall, 4.3, 2.6, TUN_Z + 9, true); box(9.2, 0.8, 18, wall, 0, 5.6, TUN_Z + 9, true);
  box(8.0, 5.0, 0.3, dark, 0, 2.5, TUN_Z + 17.5); const fl = box(8, 0.1, 18, dark, 0, 0.05, TUN_Z + 9);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(7.9, 5.0, 17.6), new THREE.MeshLambertMaterial({ color: '#111318', side: THREE.BackSide })); inner.position.set(0, 2.5, TUN_Z + 9.2); scene.add(inner);
  const sT = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#1e6fb8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 60px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WASH ARENA', w / 2, h / 2 + 3); });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 1.6), L('#fff', { map: sT })); s.position.set(0, 6.0, TUN_Z - 0.02); scene.add(s); }
// north goal (car wash has only one)
const GZ = -52.5, GW = 12, GH = 5, GD = 5;
{ const wm = STD('#ffffff', { roughness: 0.4 });
  const post = (x) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, GH, 10), wm); m.position.set(x, GH / 2, GZ); m.castShadow = true; scene.add(m); };
  post(-GW / 2); post(GW / 2); { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, GW + 0.32, 10), wm); m.rotation.z = PI / 2; m.position.set(0, GH, GZ); m.castShadow = true; scene.add(m); }
  const netT = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 3; for (let i = 0; i <= w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }, true);
  const nm = (rx, ry) => { const t = netT.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }); };
  const back_ = new THREE.Mesh(new THREE.PlaneGeometry(GW, GH), nm(GW / 1.2, GH / 1.2)); back_.position.set(0, GH / 2, GZ - GD); back_.userData.noAO = true; scene.add(back_);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(GW, GD), nm(GW / 1.2, GD / 1.2)); top.rotation.x = -PI / 2; top.position.set(0, GH, GZ - GD / 2); top.userData.noAO = true; scene.add(top);
  for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(GD, GH), nm(GD / 1.2, GH / 1.2)); sd.rotation.y = PI / 2; sd.position.set(s * GW / 2, GH / 2, GZ - GD / 2); sd.userData.noAO = true; scene.add(sd); }
  for (const x of [-GW / 2, GW / 2]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, GH, 6), wm); m.position.set(x, GH / 2, GZ - GD); scene.add(m); } }
// scoreboard above the north stand
const SB = { canvas: document.createElement('canvas'), key: '' }; SB.canvas.width = 1024; SB.canvas.height = 420;
SB.tex = new THREE.CanvasTexture(SB.canvas); SB.tex.colorSpace = THREE.SRGBColorSpace; SB.tex.anisotropy = 8;
{ const g = new THREE.Group(); g.position.set(0, HTOP + 17.5, -RZ * RTOP + 4); scene.add(g); SB.g = g;
  const fr = new THREE.Mesh(new THREE.BoxGeometry(38, 16, 1.2), L('#22262d')); fr.castShadow = true; g.add(fr);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(36, 14.4), new THREE.MeshBasicMaterial({ map: SB.tex, toneMapped: false })); scr.position.z = 0.62; g.add(scr);
  for (const x of [-12, 12]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 16, 1.2), L('#555b63')); l.position.set(x, -14, -0.5); g.add(l); } }
function drawSB(mode, t) {
  const blinkOn = Math.floor(t * 3) % 2 === 0; const key = mode + (mode === 'champ' || mode === 'score' ? (blinkOn ? 1 : 0) : '');
  if (key === SB.key) return; SB.key = key; const c = SB.canvas.getContext('2d'), w = 1024, h = 420;
  c.fillStyle = '#0b0e14'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < h; y += 6) c.fillRect(0, y, w, 2);
  if (mode === 'score') {
    c.font = '900 64px Inter'; c.fillStyle = '#ffd60a'; c.fillText('FULL TIME', w / 2, 70);
    c.font = '900 92px Inter'; c.fillStyle = '#fff'; c.fillText('BRUSHES', w * 0.27, 190); c.fillText('CAR', w * 0.77, 190);
    c.font = '900 170px Inter'; c.fillStyle = blinkOn ? '#ff3b30' : '#ffffff'; c.fillText('1 : 0', w / 2, 330);
  } else if (mode === 'wave') {
    c.font = '900 120px Inter'; c.fillStyle = '#ffd60a'; c.fillText('MEXICAN', w / 2, 140); c.fillStyle = '#fff'; c.fillText('WAVE!', w / 2, 290);
  } else if (mode === 'champ') {
    c.font = '900 84px Inter'; c.fillStyle = blinkOn ? '#ffd60a' : '#ffffff'; c.fillText('★ CHAMPION ★', w / 2, 120);
    c.font = '900 110px Inter'; c.fillStyle = '#fff'; c.fillText('OF THE WASH', w / 2, 270); c.font = '800 48px Inter'; c.fillStyle = '#7fd3ff'; c.fillText('the blue car  ·  1st place', w / 2, 375);
  } else {
    c.font = '900 120px Inter'; c.fillStyle = '#7fd3ff'; c.fillText('WASH ARENA', w / 2, 150); c.font = '900 76px Inter'; c.fillStyle = '#fff'; c.fillText('QUICK WASH  ·  5 €', w / 2, 300);
  }
  SB.tex.needsUpdate = true;
}
// floodlight masts
for (const [x, z] of [[-62, -96], [62, -96], [-62, 96], [62, 96]]) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 52, 8), L('#9aa2ab')); m.position.set(x, 26, z); m.castShadow = true; scene.add(m);
  const p = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 1.2), L('#e0e4ea')); p.position.set(x, 53, z); p.lookAt(0, 20, 0); scene.add(p);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.4), new THREE.MeshBasicMaterial({ color: '#fffbe6', toneMapped: false })); f.position.copy(p.position).add(V3(-x, -33, -z).normalize().multiplyScalar(0.65)); f.lookAt(0, 20, 0); scene.add(f); }

// ---------------- spectators (instanced) ----------------
const NA = 210; const SP = [];
for (let k = 0; k < K; k++) for (let i = 0; i < NA; i++) {
  const th = (i + (k % 2) * 0.5) / NA * PI * 2; const r = rowR(k) + DR * 0.55;
  const x = RX * r * Math.cos(th), z = RZ * r * Math.sin(th);
  if (Math.abs(x) < 6.5 && z > 0 && k < 5) continue;          // above the player tunnel
  if (hash(k * 997 + i) < 0.06) continue;
  SP.push({ x, z, y: rowH(k), th, k, h: hash(k * 31 + i * 7), yaw: Math.atan2(x, z) });
}
const bodyGeo = new THREE.BoxGeometry(0.55, 0.75, 0.38); bodyGeo.translate(0, 0.45, 0);
const headGeo = new THREE.SphereGeometry(0.19, 8, 6); headGeo.translate(0, 1.03, 0);
const armGeo = new THREE.BoxGeometry(0.12, 0.62, 0.12); armGeo.translate(0, 0.31, 0);
const spBody = new THREE.InstancedMesh(bodyGeo, new THREE.MeshLambertMaterial({ color: '#fff' }), SP.length);
const spHead = new THREE.InstancedMesh(headGeo, new THREE.MeshLambertMaterial({ color: '#fff' }), SP.length);
const spArm = new THREE.InstancedMesh(armGeo, new THREE.MeshLambertMaterial({ color: '#fff' }), SP.length * 2);
const teamCols = ['#1e6fb8', '#e53935', '#ffd60a', '#ffffff', '#1e6fb8', '#43a047', '#ff7043', '#1e6fb8'], skin = ['#f0c39d', '#d9a37c', '#a86f4c', '#f5d2b5', '#7a4a32'];
SP.forEach((p, i) => { const c = teamCols[(p.h * teamCols.length) | 0]; spBody.setColorAt(i, _c.set(c)); spHead.setColorAt(i, _c.set(skin[(hash(i + 5) * skin.length) | 0])); spArm.setColorAt(2 * i, _c.set(c)); spArm.setColorAt(2 * i + 1, _c.set(c)); });
for (const m of [spBody, spHead, spArm]) { m.frustumCulled = false; m.userData.noAO = true; scene.add(m); }
const _e = new THREE.Euler(), _q2 = new THREE.Quaternion(), _m2 = new THREE.Matrix4(), _p = new THREE.Vector3();
function updateCrowd(t, right) {
  const cheer = (a, b) => win(t, a, b, 0.3);
  let excite = 0.0;
  excite = Math.max(excite, cheer(tFans - 0.3, tWhat + 0.8));
  if (!right) excite = Math.max(excite, cheer(tGoal, tRew0));
  if (right) excite = Math.max(excite, cheer(tLap, S('right2').end + 0.3), cheer(tShow, S('right4').end + 0.5), cheer(tPodium - 0.2, TOTAL + 1));
  const waveOn = right && t > tMex - 0.4 && t < S('right3').end + 1.2;
  const wa = waveOn ? win(t, tMex - 0.4, S('right3').end + 1.2, 0.4) : 0;
  const ph = (t - tMex - 0.2) * 1.3 - 0.4;                                    // wave travels around (rad)
  SP.forEach((p, i) => {
    let up = 0;
    if (wa > 0) { let d = (p.th - ph) % (PI * 2); if (d < -PI) d += PI * 2; if (d > PI) d -= PI * 2; up = Math.exp(-((d / 0.5) ** 2)) * wa; }
    const jig = excite * (0.5 + 0.5 * Math.sin(t * 9 + p.h * 40));
    const a = Math.max(up, jig * 0.8);
    const yo = up * 1.0 + jig * 0.18;
    _q2.setFromEuler(_e.set(0, p.yaw, 0)); _m2.compose(_p.set(p.x, p.y + yo, p.z), _q2, _s.set(1, 1, 1));
    spBody.setMatrixAt(i, _m2); spHead.setMatrixAt(i, _m2);
    for (const s of [-1, 1]) { const ang = lerp(PI * 0.92, 0.25, a) * s;   // arms down (hang) -> up
      const loc = new THREE.Matrix4().compose(_v.set(s * 0.33, 0.78, 0), _q.setFromEuler(_e.set(0, 0, ang * -1 + (s > 0 ? 0 : 0))), _s.set(1, 1, 1));
      spArm.setMatrixAt(2 * i + (s > 0 ? 1 : 0), _m.multiplyMatrices(_m2, loc)); }
  });
  spBody.instanceMatrix.needsUpdate = spHead.instanceMatrix.needsUpdate = spArm.instanceMatrix.needsUpdate = true;
}

// ---------------- outside: car park, entrance booth ----------------
makeLandscape({ seed: 75, trees: 900, near: [0, 160, 260, 120],
  avoid: (x, z) => (x / 100) ** 2 + (z / 145) ** 2 < 1 || (Math.abs(x) < 40 && z > 0 && z < 200),
  fieldAvoid: (x, z, w, d) => (x / 130) ** 2 + (z / 175) ** 2 < 1.4 });
{ const g = new THREE.CircleGeometry(1, 96); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, L('#7b7f86', { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); m.scale.set(95, 1, 138); m.position.y = 0.02; m.receiveShadow = true; scene.add(m);
  plane(-6, 6, 110, 200, L('#5b5f66', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0.03, 6);
  const mk = L('#ffffff', { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  for (let z = 126; z < 200; z += 6) plane(-0.12, 0.12, z, z + 3, mk, 0.04, 4);
  // parked cars outside
  const cols = ['#e53935', '#fdd835', '#43a047', '#f5f5f5', '#8e24aa', '#ff7043', '#90a4ae'];
  let n = 0; for (const x of [-16, -12.8, -9.6, 9.6, 12.8, 16]) for (const z of [128, 140]) { const c = makeCar(cols[n++ % cols.length]); c.position.set(x, 0, z); c.rotation.y = z > 130 ? PI : 0; } }
const DOOR_Z = RZ * (RTOP + 0.032) + 0.05;
const shutter = new THREE.Group(); shutter.position.set(0, 0, DOOR_Z + 0.08); scene.add(shutter);
{ const sT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c9cfd6'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { c.fillStyle = '#9aa3ad'; c.fillRect(0, y, w, 3); c.fillStyle = '#e3e7ec'; c.fillRect(0, y + 4, w, 2); } }, true);
  sT.repeat.set(1, 3);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(7, 5.4), L('#fff', { map: sT })); s.position.y = 2.7; s.receiveShadow = true; shutter.add(s); shutter.userData.s = s;
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(7, 5.4), new THREE.MeshBasicMaterial({ color: '#fffaf0', toneMapped: false })); glow.position.set(0, 2.7, DOOR_Z + 0.02); scene.add(glow);
  // booth canopy
  const bm = L('#1e6fb8'), wm = L('#f4f6f8');
  box(10, 0.5, 9, wm, 0, 6.0, DOOR_Z + 4.5, true); box(10.2, 0.9, 0.3, bm, 0, 6.2, DOOR_Z + 9.05, true);
  for (const x of [-4.8, 4.8]) box(0.3, 6, 0.3, wm, x, 3, DOOR_Z + 8.8, true);
  box(0.4, 6.4, 0.4, wm, -3.8, 3.2, DOOR_Z + 0.25, true); box(0.4, 6.4, 0.4, wm, 3.8, 3.2, DOOR_Z + 0.25, true); box(8, 0.8, 0.4, wm, 0, 5.8, DOOR_Z + 0.25, true);
  const sT2 = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#1e6fb8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 108px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('QUICK WASH', w * 0.4, h / 2 + 6); c.fillStyle = '#ffd60a'; c.fillText('5 €', w * 0.85, h / 2 + 6); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 1.8), L('#fff', { map: sT2 })); sg.position.set(0, 7.35, DOOR_Z + 9.1); scene.add(sg);
  box(9.8, 1.9, 0.2, bm, 0, 7.35, DOOR_Z + 8.98, true);
  // pay terminal
  box(0.6, 1.4, 0.5, L('#37474f'), -2.6, 0.7, DOOR_Z + 6.0, true); box(0.5, 0.35, 0.05, new THREE.MeshBasicMaterial({ color: '#7fd3ff' }), -2.6, 1.15, DOOR_Z + 6.26);
  // big lettering on the stadium wall
  const lT = canvasTex(1024, 160, (c, w, h) => { c.fillStyle = '#1e6fb8'; c.font = '900 130px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WASH ARENA', w / 2, h / 2 + 6); });
  const lg = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.4), new THREE.MeshLambertMaterial({ map: lT, transparent: true })); lg.position.set(0, HTOP - 2, DOOR_Z + 0.4); scene.add(lg); }

// ---------------- brushes ----------------
const brushT = canvasTex(512, 512, (c, w, h) => { const cols = ['#1e88e5', '#e53935', '#1e88e5', '#ffd60a'];
  for (let i = 0; i < 16; i++) { c.fillStyle = cols[i % 4]; c.fillRect(0, i * h / 16, w, h / 16); }
  for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${0.08 + Math.random() * 0.16})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 10 + Math.random() * 24); }
  c.fillStyle = 'rgba(0,0,0,0.18)'; for (let x = 0; x < w; x += 64) c.fillRect(x, 0, 10, h); }, true);
brushT.repeat.set(3, 1);
const brushBump = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#808080'; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { const v = Math.random() * 255 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(Math.random() * w, Math.random() * h, 1.5, 8); } }, true);
brushBump.repeat.set(6, 3);
const BR_R = 3, BR_H = 12;
function makeBrush() {
  const g = new THREE.Group(); const spin = new THREE.Group(); g.add(spin);
  const geo = new THREE.CylinderGeometry(BR_R, BR_R, BR_H, 56, 24); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); const a = Math.atan2(z, x); const rr_ = Math.hypot(x, z); if (rr_ < 0.1) continue;
    const n = 1 + 0.07 * Math.sin(a * 23 + y * 2.1) + 0.05 * Math.sin(a * 41 - y * 3.7) - 0.12 * Math.pow(Math.abs(y) / (BR_H / 2), 6);
    pos.setX(i, x * n); pos.setZ(i, z * n); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#fff', map: brushT, bumpMap: brushBump, bumpScale: 4, roughness: 0.95 })); m.position.y = BR_H / 2 + 0.6; m.castShadow = true; m.receiveShadow = true; spin.add(m);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.2, 14), STD('#9aa2ab', { metalness: 0.6, roughness: 0.35 })); core.position.y = BR_H + 1.6; g.add(core);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 1.4, 20), STD('#eceff1')); cap.position.y = BR_H + 2.9; cap.castShadow = true; g.add(cap);
  const capB = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.3, 20), STD('#1e6fb8')); capB.position.y = BR_H + 2.4; g.add(capB);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.4, 0.6, 18), STD('#455a64')); base.position.y = 0.3; g.add(base);
  scene.add(g); return { g, spin };
}
const BR = [[8, 20], [-8, 20], [8, -5], [-8, -5], [8, -30], [-8, -30]].map(([x, z], i) => ({ ...makeBrush(), x, z, i, side: Math.sign(x) }));
// foam piles on the pitch
const foamT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 6, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(250,252,255,0.9)'); g.addColorStop(1, 'rgba(240,248,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const glowT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const foamM = STD('#fbfdff', { roughness: 0.9 });
{ const list = []; const R = rng(9); for (const b of BR) for (let k = 0; k < 9; k++) { const a = R() * PI * 2, d = BR_R + 0.6 + R() * 3; list.push([b.x + Math.cos(a) * d, b.z + Math.sin(a) * d, 0.5 + R() * 0.9]); }
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), foamM, list.length);
  list.forEach(([x, z, s], i) => { _m.compose(_v.set(x, 0.05, z), _q.identity(), _s.set(s * 1.3, s * 0.55, s * 1.1)); im.setMatrixAt(i, _m); }); im.receiveShadow = true; scene.add(im); }

// ---------------- show props (right way) ----------------
// foam cannons on both touchlines
const CANNON = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 16, 0, 12); scene.add(g);
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), STD('#37474f')); base.position.y = 0.6; base.castShadow = true; g.add(base);
  const piv = new THREE.Group(); piv.position.y = 1.6; g.add(piv); const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.85, 4.2, 16), STD('#e53935', { metalness: 0.3 })); bar.position.y = 2.0; bar.castShadow = true; piv.add(bar);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.12, 8, 16), STD('#ffd60a')); ring.position.y = 4.1; ring.rotation.x = PI / 2; piv.add(ring);
  piv.rotation.z = s * 0.75; return { g, piv, s }; });
const FOAMP = Array.from({ length: 70 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: foamT, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, k: hash(i + 101), side: i % 2 ? 1 : -1 }; });
// water fireworks
const FOUNT = [[-13, -2], [13, -2], [-13.5, -15], [13.5, -15], [-13, -27], [13, -27]].map(([x, z], i) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.5, 14), STD('#90a4ae')); b.position.set(x, 0.25, z); scene.add(b); return { x, z, i }; });
const WATERP = Array.from({ length: 240 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: ['#29b6f6', '#00e5ff', '#ffffff', '#4fc3f7'][i % 4], transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, k: hash(i + 333), f: i % 6, b: hash(i + 777) }; });
// giant hairdryer (pink), blowing towards -x at the car lane
const DRY = new THREE.Group(); DRY.position.set(13, 0, -16); scene.add(DRY);
{ const pk = STD('#ff6fa8', { roughness: 0.35, metalness: 0.1 }), gr = STD('#5f6670', { roughness: 0.5 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 8, 28), pk); barrel.rotation.z = PI / 2; barrel.position.set(1.0, 6.2, 0); DRY.add(barrel);
  const backC = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 12, 0, PI * 2, 0, PI / 2), pk); backC.rotation.z = -PI / 2; backC.position.set(5.0, 6.2, 0); DRY.add(backC);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 2.0, 2.4, 24, 1, true), gr); nozzle.rotation.z = -PI / 2; nozzle.position.set(-4.2, 6.2, 0); DRY.add(nozzle);
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(1.24, 24), new THREE.MeshBasicMaterial({ color: '#2b2f36' })); mouth.rotation.y = -PI / 2; mouth.position.set(-5.35, 6.2, 0); DRY.add(mouth);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 5.5, 18), pk); handle.position.set(2.2, 3.2, 0); handle.rotation.z = -0.22; DRY.add(handle);
  const btn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), STD('#ffffff')); btn.position.set(1.35, 4.2, 0.9); DRY.add(btn);
  const cable = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.18, 6, 24, PI * 1.2), STD('#222')); cable.position.set(3.6, 1.0, 0); cable.rotation.set(0, PI / 2, 0.4); DRY.add(cable);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.6, 20), gr); stand.position.set(2.6, 0.3, 0); DRY.add(stand);
  DRY.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const WIND = Array.from({ length: 26 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); m.userData.noAO = true; scene.add(m); return { m, k: hash(i + 55), y: hash(i + 66), z: hash(i + 99) }; });
// rainbow over the pitch
const RAINBOW = new THREE.Group(); RAINBOW.position.set(0, -1, -41); scene.add(RAINBOW);
['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#32ade6', '#5856d6', '#af52de'].forEach((c, i) => { const r0 = 13.5 - i * 0.7;
  const m = new THREE.Mesh(new THREE.RingGeometry(r0 - 0.72, r0, 96, 1, 0, PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false })); m.userData.noAO = true; RAINBOW.add(m); });
// podium (rises from the pitch): centre lifts the car, 2nd a sponge, 3rd a bucket
const POD_Z = -44;
const POD = new THREE.Group(); POD.position.set(0, 0, POD_Z); scene.add(POD);
const numTex = n => canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = n === 1 ? '#d4a017' : n === 2 ? '#8e9aa6' : '#b0703c'; c.font = '900 200px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), w / 2, h / 2 + 10); });
const podStep = (n, w, h, x) => { const g = new THREE.Group(); g.position.x = x; POD.add(g); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 5), [L('#fff'), L('#fff'), L('#fff'), L('#fff'), L('#fff', { map: numTex(n) }), L('#fff')]); m.position.y = -h / 2; m.castShadow = m.receiveShadow = true; g.add(m); g.userData.h = h; return g; };
const P1 = podStep(1, 5.6, 2.0, 0), P2 = podStep(2, 5.2, 1.3, -5.5), P3 = podStep(3, 5.2, 0.8, 5.5);
const SPONGE = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 1.8), STD('#ffd34d', { roughness: 0.95, bumpMap: brushBump, bumpScale: 2 })); SPONGE.position.set(0, 0.65, 0); SPONGE.castShadow = true; P2.add(SPONGE);
{ const sp2 = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.35, 1.82), STD('#43a047', { roughness: 0.9 })); sp2.position.y = 0.48; SPONGE.add(sp2); }
const BUCKET = new THREE.Group(); P3.add(BUCKET);
{ const bk = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.8, 1.5, 22, 1, true), STD('#e53935', { side: THREE.DoubleSide })); bk.position.y = 0.75; bk.castShadow = true; BUCKET.add(bk);
  const bt = new THREE.Mesh(new THREE.CircleGeometry(0.8, 22), STD('#b71c1c')); bt.rotation.x = -PI / 2; bt.position.y = 0.02; BUCKET.add(bt);
  const wt = new THREE.Mesh(new THREE.CircleGeometry(0.93, 22), STD('#7fc6ff', { roughness: 0.1 })); wt.rotation.x = -PI / 2; wt.position.y = 1.3; BUCKET.add(wt);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 6, 20, PI), STD('#888')); hd.position.y = 1.5; BUCKET.add(hd); }
// sponge + bucket faces (cute: simple dots so they read as "competitors")
for (const [obj, y, z, s] of [[SPONGE, 0.1, 0.91, 1], [BUCKET, 0.85, 0.96, 1]]) for (const e of [-1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), STD('#111')); m.position.set(e * 0.35, y, z); obj.add(m); }

// ---------------- hero ----------------
const heroP = new THREE.Group(); scene.add(heroP);
const hero = makeCar('#1e88e5'); scene.remove(hero); heroP.add(hero); hero.position.y = -0.8;
const ud = hero.userData;
const glowSp = (col, s) => { const m = new THREE.SpriteMaterial({ map: glowT, color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }); const sp = new THREE.Sprite(m); sp.scale.setScalar(s); return sp; };
const hazL = [[-0.82, 0.78, -2.2], [0.82, 0.78, -2.2], [-0.78, 0.86, 2.24], [0.78, 0.86, 2.24], [-1.08, 1.04, -0.72], [1.08, 1.04, -0.72]].map(p => { const s = glowSp('#ffa000', 0.75); s.position.set(...p); ud.bodyG.add(s); return s; });
const CARFOAM = Array.from({ length: 22 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: foamT, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0 })); const a = hash(i + 7), b = hash(i + 19);
  const p = V3((a - 0.5) * 1.9, 1.0 + hash(i + 3) * 0.7, (b - 0.5) * 4.4); s.position.copy(p); ud.bodyG.add(s); return { s, p, k: hash(i + 41) }; });
const SPARK = Array.from({ length: 16 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * PI / 4, r = k % 2 ? 6 : 31; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.fill(); }), color: '#fff6c8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.set((hash(i + 3) - 0.5) * 2.0, 0.9 + hash(i + 8) * 0.8, (hash(i + 13) - 0.5) * 4.2); ud.bodyG.add(s); return { s, k: hash(i + 21) }; });
const bodyCol0 = new THREE.Color('#1e88e5'), gold = new THREE.Color('#d9a011');

// ---------------- motion ----------------
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
// hook: wait at the booth, drive in, come out of the player tunnel
const START_Z = DOOR_Z + 8.5, STOP_Z = 62;
const hookZ = mono([[0, START_Z + 1.2], [tGate, START_Z], [tGate + 0.9, DOOR_Z + 2.0], [tGate + 1.35, TUN_Z + 9], [tGate + 2.2, TUN_Z - 2], [tStadium + 0.9, STOP_Z]]);
// wrong way: pinball keys [t, x, z, heading]
const tLaunch = tGoal - 0.55, tLandG = tGoal + 0.25;
const WK = [[tFull - 0.2, 0, STOP_Z, 0], [tStraight, 0, 54, 0], [tBam1 - 0.15, 3.85, 21.5, 0.08], [tBam1 + 0.55, -0.5, 9, 1.4], [tBam2 - 0.12, -3.85, -3.5, 2.7], [tBam2 + 0.55, 1.6, -13, 4.3],
  [tPinball - 0.05, 3.85, -28.5, 5.9], [tAcross, -1.2, -34, 8.0], [tPitch, -2.6, -38.5, 10.3], [tLaunch, -0.6, -43, 4 * PI]];
const wx = mono(WK.map(k => [k[0], k[1]])), wz = mono(WK.map(k => [k[0], k[2]])), wh = mono(WK.map(k => [k[0], k[3]]));
const GOAL_LAND = V3(0, 0, GZ - 2.7);
// right way: slow lap of honour, then down the middle through the show to the podium
const rPath = roundedPath([[0, STOP_Z], [0, 57], [17, 57], [17, 40], [0, 31], [0, POD_Z]], 6.5);
const LEN = rPath.len;
const sAtZ = z => { let lo = 0, hi = LEN; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const p = pathAt(rPath, m); if (m < LEN * 0.4 || p.z > z) lo = m; else hi = m; } return (lo + hi) / 2; };
const rS = mono([[tRew1, 0], [tSlowly - 0.1, 0], [tLap, 12], [S('right2').end + 0.2, 26], [S('right3').end, sAtZ(28)], [tFoamC + 0.2, sAtZ(19.5)], [tWater + 0.3, sAtZ(5)], [tDryer + 0.3, sAtZ(-14.5)], [tLorry + 0.9, sAtZ(-17.5)],
  [tRainbow + 0.5, sAtZ(-28)], [tShines, sAtZ(-38)], [tTrophy + 0.4, LEN]]);
const tLift0 = tPodium - 0.7, tLift1 = tPodium + 0.6;
function heroPose(t) {
  const right = isRight(t);
  if (t < tFull - 0.2 || (right && t < tRew1)) { return { x: 0, y: 0, z: t < tFull - 0.2 ? hookZ(t) : STOP_Z, h: 0, roll: 0, pitch: 0, mode: 'drive' }; }
  if (!right) {
    if (t < tLaunch) return { x: wx(t), y: 0, z: wz(t), h: wh(t), roll: 0, pitch: 0, mode: 'drive' };
    if (t < tLandG) { const u = (t - tLaunch) / (tLandG - tLaunch); const p0 = V3(wx(tLaunch), 0, wz(tLaunch));
      const x = lerp(p0.x, GOAL_LAND.x, u), z = lerp(p0.z, GOAL_LAND.z, easeOut(u)), y = 3.6 * Math.sin(PI * u) + 0.8 * u;
      return { x, y, z, h: 4 * PI, roll: PI * ease(u), pitch: 0.25 * Math.sin(PI * u), mode: 'fly' }; }
    const k = t - tLandG; return { x: GOAL_LAND.x, y: 0.8 + 0.25 * Math.abs(Math.sin(k * 8)) * Math.exp(-k * 3.5), z: GOAL_LAND.z, h: 4 * PI, roll: PI + 0.05 * Math.sin(k * 7) * Math.exp(-k * 2), pitch: 0, mode: 'net' };
  }
  const s = rS(t), p = pathAt(rPath, s); const lift = 2.0 * ease((t - tLift0) / (tLift1 - tLift0));
  return { x: p.x, y: lift, z: p.z, h: s >= LEN - 0.05 ? 0 : p.h, roll: 0, pitch: 0, mode: 'drive' };
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroW = (off, lookOff, fov = 40) => t => { const p = heroP.position; return [V3(p.x + off[0], off[1], p.z + off[2]), V3(p.x + lookOff[0], lookOff[1], p.z + lookOff[2]), fov]; };
const HeroL = (pos, lookOff, fov = 40) => t => { const p = heroP.position; return [V3(...pos), V3(p.x + lookOff[0], p.y + lookOff[1], p.z + lookOff[2]), fov]; };
const camKeys = [
  [0.0, Ac([3.5, 3.6, DOOR_Z + 40], [0, 4.4, DOOR_Z + 3], 34)],
  [tGate + 0.85, Ac([2.5, 3.2, DOOR_Z + 34], [0, 4.0, DOOR_Z + 2], 34)],
  // reveal from above the south stand
  ...cut(tGate + 1.0, Ac([0, 30, 95], [0, 0, 36], 50)),
  [tBrushesH - 0.3, Ac([0, 29, 92], [0, 0, 32], 50)],
  ...cut(tBrushesH - 0.25, Ac([4.5, 1.6, STOP_Z + 11], [0, 7.5, 18], 34)),
  [tForty - 0.25, Ac([4.0, 1.7, STOP_Z + 10], [0, 7.0, 18], 34)],
  ...cut(tForty - 0.2, Ac([16, 3.5, 30], [62, 13, 42], 40)),
  [tWhat - 0.3, Ac([16, 4.0, 33], [62, 12, 40], 40)],
  ...cut(tWhat - 0.25, Ac([3.2, 3.6, STOP_Z + 11], [0, 2.5, STOP_Z - 6], 40)),
  [S('hook2').end + 0.6, Ac([3.0, 3.5, STOP_Z + 10.5], [0, 2.5, STOP_Z - 6], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, HeroW([2.6, 3.8, 11], [0, 1.6, -8], 42)),
  [tBam1 - 0.5, HeroW([2.6, 4.0, 12], [0, 1.6, -8], 42)],
  ...cut(tBam1 - 0.45, HeroW([0, 17, 19], [0, 0, -8], 46)),
  [tPinball - 0.4, HeroW([0, 18, 19], [0, 0, -8], 46)],
  ...cut(tPinball - 0.35, Ac([0, 40, -4], [0, 0, -32], 42)),
  [tLaunch - 0.15, Ac([0, 39, -6], [0, 0, -34], 42)],
  ...cut(tLaunch - 0.1, Ac([17, 5, -38], [0, 2.2, -52], 42)),
  [tUpside - 0.25, Ac([16, 4.6, -39], [0, 2, -53], 42)],
  ...cut(tUpside - 0.2, Ac([7.5, 2.6, -46.5], [0, 1.4, -55], 40)),
  [tBr1 - 0.25, Ac([7.0, 2.8, -46], [0, 1.4, -55], 40)],
  ...cut(tBr1 - 0.2, Ac([0, 12, -20], [0, HTOP + 17.5, -RZ * RTOP], 44)),
  [S('wrong4').start - 0.1, Ac([0, 12.5, -22], [0, HTOP + 17.5, -RZ * RTOP], 44)],
  ...cut(S('wrong4').start - 0.05, Ac([11, 4.5, -38], [0, 1.5, -54], 40)),
  [tRew0, Ac([10, 4.2, -39], [0, 1.5, -54], 40)],
  // right
  ...cut(tRew1, Ac([3.0, 3.5, STOP_Z + 10.5], [0, 2.5, STOP_Z - 6], 40)),
  ...cut(tSlowly - 0.2, Ac([-9, 2.6, 46], [3, 1.4, 58], 40)),
  [tHazards + 0.2, HeroL([-8, 2.6, 46.5], [0, 1.0, 0], 40)],
  ...cut(tLap - 0.15, HeroL([26, 2.4, 50], [-1, 1.2, 0], 40)),
  [S('right2').end + 0.3, HeroL([25, 2.6, 48], [-1, 1.4, 0], 40)],
  ...cut(tCrowd - 0.2, Ac([16, 3.8, 31], [62, 12.5, 41], 40)),
  [tJoin - 0.3, Ac([16.5, 4.2, 33], [62, 12, 40], 40)],
  ...cut(tJoin - 0.25, Ac([0, 13, 52], [0, 5, -6], 46)),
  [S('right3').end + 0.4, Ac([0, 13.5, 50], [0, 5, -6], 46)],
  ...cut(tShow - 0.15, HeroW([0, 16, 17], [0, 2, -8], 48)),
  [tWater - 0.3, HeroW([0, 16.5, 17], [0, 2.4, -8], 48)],
  ...cut(tWater - 0.25, Ac([0, 10, 52], [0, 10, -15], 50)),
  [tDryer - 0.3, Ac([0, 10.5, 49], [0, 10, -15], 50)],
  ...cut(tDryer - 0.25, Ac([-16, 5.5, -10], [4, 3.0, -16], 44)),
  [S('right4').end + 0.3, Ac([-16, 5.7, -11], [4, 3.0, -16], 44)],
  ...cut(tRainbow - 0.25, HeroW([0, 4, 16], [0, 7, -30], 52)),
  [tShines - 0.3, HeroW([0, 4.2, 15], [0, 7, -30], 52)],
  ...cut(tShines - 0.25, HeroL([-5.5, 2.2, -32], [0, 0.9, 0], 38)),
  [tTrophy + 0.6, HeroL([-5.8, 2.6, -33], [0, 1.0, 0], 38)],
  ...cut(S('right6').start - 0.1, Ac([0, 3.5, -22], [0, 7, -60], 50)),
  [S('right7').start, Ac([0, 3.8, -23.5], [0, 7.5, -60], 50)],
  [TOTAL, Ac([-22, 32, 14], [0, 6, -40], 48)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
let spin = 0, prevPos = null;
function update(t) {
  const right = isRight(t);
  // ---- hero ----
  const hp = heroPose(t);
  heroP.position.set(hp.x, 0.8 + hp.y, hp.z); heroP.rotation.set(hp.pitch, hp.h, hp.roll, 'YXZ'); heroP.updateMatrixWorld(true);
  if (prevPos && hp.mode !== 'fly') { const d = heroP.position.distanceTo(prevPos); if (d < 3) { const fw = V3(-Math.sin(hp.h), 0, -Math.cos(hp.h)); spin -= Math.sign(fw.dot(heroP.position.clone().sub(prevPos)) || 1) * d / 0.34; } }
  if (hp.mode === 'fly') spin += 0.3; prevPos = heroP.position.clone(); ud.wheels.forEach(w => w.rotation.x = spin);
  // hazards
  const haz = right && t > tHazards - 0.05 && t < S('right5').start; const on = Math.floor((t - tHazards) * 2.6) % 2 === 0;
  ud.bl.L.emissiveIntensity = ud.bl.R.emissiveIntensity = haz && on ? 3 : 0; hazL.forEach(s => s.material.opacity = haz && on ? 0.9 : 0);
  // foam on the car (wrong: covered in foam; right: scrubbed by the brushes, blown off by the dryer)
  const wrongFoam = !right ? ramp(t, tFoam - 0.25, tFoam + 0.2) : 0;
  const rightFoam = right ? Math.min(ramp(t, tFoamC + 0.3, tFoamC + 1.2), 1 - ramp(t, tDryer + 0.2, tLorry + 0.6)) : 0;
  CARFOAM.forEach(f => { const blow = right && t > tDryer + 0.2 ? clamp((t - tDryer - 0.2 - f.k * 0.6) / 0.8) : 0;
    const a = Math.max(wrongFoam, rightFoam > 0 ? rightFoam : 0);
    f.s.visible = a > 0.01 || blow > 0 && blow < 1; f.s.position.copy(f.p).add(V3(-blow * 9, blow * 3, 0));
    const sc = (0.9 + f.k * 0.9) * (0.4 + 0.6 * Math.max(a, wrongFoam)) * (wrongFoam > 0 ? 1.25 : 1); f.s.scale.setScalar(sc); f.s.material.opacity = 0.95 * Math.max(a, right && blow > 0 && blow < 1 ? 1 - blow : 0); });
  // gold shine
  const g = right ? ramp(t, tShines - 0.1, tShines + 0.9) : 0;
  ud.body.color.copy(bodyCol0).lerp(gold, g); ud.body.metalness = lerp(0.45, 0.85, g); ud.body.roughness = lerp(0.22, 0.12, g); ud.body.envMapIntensity = lerp(1.3, 2.2, g);
  SPARK.forEach((s, i) => { const ph = (t * 1.3 + s.k) % 1; const a = g > 0.2 ? Math.sin(PI * ph) : 0; s.s.material.opacity = a * 0.95; s.s.scale.setScalar(0.25 + 0.55 * a); s.s.material.rotation = t * 2 + i; });
  // ---- shutter ----
  const su = ramp(t, tGate - 0.05, tGate + 0.8); shutter.userData.s.scale.y = Math.max(0.02, 1 - su); shutter.userData.s.position.y = 5.4 - (1 - su) * 2.7; shutter.userData.s.material.map.repeat.y = 3 * Math.max(0.02, 1 - su);
  // ---- brushes ----
  BR.forEach(b => { let x = b.x, tiltX = 0, tiltZ = 0;
    const sp = right ? 1.5 : 2.6; b.spin.rotation.y = -b.side * t * sp;
    if (!right) { // hits: wobble away
      for (const [th, idx] of [[tBam1, 0], [tBam2, 3], [tPinball, 4]]) if (b.i === idx) { const k = t - th; if (k > -0.1) tiltZ += b.side * 0.22 * Math.sin(k * 11) * Math.exp(-Math.max(0, k) * 2.6) * (k > 0 ? 1 : 0); }
    } else {
      // join the Mexican wave: lean in sequence
      const wv = win(t, tJoin - 0.3, S('right3').end + 0.6, 0.3); const ph = (t - tJoin) * 3.2 - b.z * 0.08 - (b.side > 0 ? 0.6 : 0);
      tiltZ += -b.side * 0.24 * wv * Math.max(0, Math.sin(ph)); tiltX += 0.05 * wv * Math.sin(ph);
      // scrub the car as it passes
      const dz = Math.abs(heroP.position.z - b.z); const near = clamp(1 - (dz - 2) / 6) * (t > S('right3').end ? 1 : 0) * (t < tDryer + 1 ? 1 : 0);
      x = lerp(b.x, b.side * (BR_R + 1.15), ease(near));
    }
    b.g.position.set(x, 0, b.z); b.g.rotation.set(tiltX, 0, tiltZ); });
  DRY.visible = right; CANNON.forEach(c => c.g.visible = right);
  // ---- foam cannons ----
  const fcOn = right && t > tFoamC - 0.15 && t < tFoamC + 3.2;
  CANNON.forEach(c => { c.piv.rotation.z = c.s * (0.75 + (fcOn ? 0.06 * Math.sin(t * 20) : 0)); });
  FOAMP.forEach(p => { const age = ((t - tFoamC + 0.15) * 1.2 + p.k) % 1; const on = fcOn && t - tFoamC + 0.15 > p.k / 1.2;
    p.s.visible = on; if (!on) return; const c = CANNON[p.side > 0 ? 1 : 0];
    const P0 = V3(c.s * 16 - c.s * 2.8, 4.8, 12), P1 = V3(heroP.position.x + c.s * 1.2 * (p.k - 0.5), 1.8, heroP.position.z + (p.k - 0.5) * 3.5);
    const x = lerp(P0.x, P1.x, age), z = lerp(P0.z, P1.z, age), y = lerp(P0.y, P1.y, age) + 11 * Math.sin(PI * age);
    p.s.position.set(x, y, z); p.s.scale.setScalar(1.2 + age * 1.6); p.s.material.opacity = 0.95 * Math.min(1, (1 - age) * 3); });
  // ---- water fireworks ----
  const wOn = right && t > tWater - 0.1 && t < S('right5').end;
  WATERP.forEach(p => { const F = FOUNT[p.f]; const cyc = 1.6; const ph0 = F.i * 0.27; const age = ((t - tWater + 0.1 - ph0) % cyc + cyc) % cyc; const nCyc = Math.floor((t - tWater + 0.1 - ph0) / cyc);
    const on = wOn && t - tWater + 0.1 - ph0 > 0; p.s.visible = on; if (!on) return;
    const rise = 0.75; let x = F.x, y, z = F.z, op = 0.9, sc = 0.7;
    if (age < rise) { y = 15 * easeOut(age / rise) * (0.4 + 0.6 * p.k); x += (p.b - 0.5) * 0.6; z += (hash(p.k * 99 + nCyc) - 0.5) * 0.6; sc = 1.7; }
    else { const k = (age - rise) / (cyc - rise); const a = p.b * PI * 2, el = (p.k - 0.3) * 2; const R = 6.5 * easeOut(k);
      x += Math.cos(a) * R; z += Math.sin(a) * R; y = 15 + el * R * 0.6 - 9 * k * k; op = 0.95 * (1 - k); sc = 1.0 + 0.9 * (1 - k); }
    p.s.position.set(x, Math.max(0.2, y), z); p.s.scale.setScalar(sc); p.s.material.opacity = op; });
  // ---- hairdryer wind ----
  const dOn = right && t > tDryer - 0.1 && t < S('right5').start + 0.3;
  DRY.rotation.y = 0.05 * Math.sin(t * 0.8); DRY.position.y = dOn ? 0.03 * Math.sin(t * 40) : 0;
  WIND.forEach(w => { const age = ((t * 1.6 + w.k) % 1); const on = dOn; w.m.visible = on; if (!on) return;
    const x = DRY.position.x - 5.6 - age * 16, y = 6.2 + (w.y - 0.5) * 3.2 - age * 3.5, z = DRY.position.z + (w.z - 0.5) * 3.2;
    w.m.position.set(x, y, z); w.m.lookAt(camera.position); w.m.material.opacity = 0.7 * Math.sin(PI * age); w.m.scale.x = 0.6 + age; });
  // ---- rainbow ----
  const rb = right ? ramp(t, tRainbow - 0.2, tRainbow + 1.0) : 0;
  RAINBOW.children.forEach((m, i) => { m.material.opacity = 0.62 * clamp(rb * 1.6 - i * 0.08); }); RAINBOW.visible = rb > 0.001;
  // ---- podium ----
  const pu = right ? ease((t - tLift0) / (tLift1 - tLift0)) : 0; POD.visible = right && t > tLift0 - 0.05;
  for (const P of [P1, P2, P3]) P.position.y = P.userData.h * pu;
  SPONGE.rotation.y = 0.1 * Math.sin(t * 2); BUCKET.rotation.y = -0.1 * Math.sin(t * 2.2);
  // ---- crowd + scoreboard ----
  updateCrowd(t, right);
  drawSB(!right && t > tBr1 - 0.1 ? 'score' : right && t > tPodium - 0.3 ? 'champ' : right && t > tMex - 0.3 && t < S('right3').end + 0.8 ? 'wave' : 'welcome', t);
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.far = 3000; camera.updateProjectionMatrix();
  let shake = 0; if (!right) for (const th of [tBam1, tBam2, tPinball]) shake = Math.max(shake, win(t, th - 0.02, th + 0.35, 0.05)); if (!right) shake = Math.max(shake, win(t, tLandG - 0.02, tLandG + 0.4, 0.05));
  applyCam(c, t, shake > 0.02 ? 0.12 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { hero: project(heroP.localToWorld(V3(0, 1.2, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('SATURDAY', '#1565c0', tSat - 0.1, tQuick - 0.2, 56);
    P_('QUICK WASH · 5 €', '#1565c0', tQuick - 0.1, tGate - 0.2, 52);
    P_('CAR WASH: STADIUM SIZE', RED, tStadium - 0.2, tBrushesH - 0.2, 48, iconWarn);
    P_('BRUSHES: HOUSE-TALL', RED, tBrushesH - 0.1, tForty - 0.2, 50, iconWarn);
    P_('40,000 FANS', RED, tForty - 0.1, tWhat - 0.3, 58, iconWarn);
    P_('FULL SPEED', RED, tFull - 0.15, tBam1 - 0.3, 58, iconX);
    floatText('BAM!', W / 2 + 170, 700, t, tBam1 - 0.03, tBam1 + 0.8, 130, YEL, 0.1);
    floatText('BAM!', W / 2 - 170, 760, t, tBam2 - 0.03, tBam2 + 0.8, 130, YEL, -0.1);
    P_('PINBALL', RED, tPinball - 0.15, tGoal - 0.6, 60, iconWarn);
    floatText('GOAL!', W / 2, 600, t, tLandG - 0.05, tLandG + 1.3, 150, YEL, -0.06);
    P_('UPSIDE DOWN', RED, tUpside - 0.1, tFoam - 0.15, 56, iconX);
    P_('COVERED IN FOAM', RED, tFoam - 0.1, tBr1 - 0.2, 52, iconX);
  } else {
    P_('SLOWLY', GREEN, tSlowly - 0.15, tWindows - 0.1, 58, iconCheck);
    P_('WINDOWS UP', GREEN, tWindows - 0.1, tHazards - 0.1, 56, iconCheck);
    P_('HAZARDS ON', GREEN, tHazards - 0.1, tLap - 0.2, 58, iconCheck);
    P_('LAP OF HONOUR', '#1565c0', tLap - 0.15, S('right2').end + 0.3, 56, iconHeart);
    P_('THE CROWD LOVES IT', '#1565c0', tCrowd - 0.15, tJoin - 0.2, 52, iconHeart);
    P_('THE BRUSHES JOIN IN', '#1565c0', tJoin - 0.15, S('right3').end + 0.3, 50);
    P_('FOAM CANNONS', '#1565c0', tFoamC - 0.1, tWater - 0.15, 56);
    P_('WATER FIREWORKS', '#1565c0', tWater - 0.1, tDryer - 0.2, 54);
    P_('HAIRDRYER: LORRY-SIZED', '#1565c0', tDryer - 0.1, S('right4').end + 0.3, 46);
    floatText('WHOOOSH!', W / 2 - 80, 700, t, tDryer + 0.3, tDryer + 1.6, 110, YEL, -0.06);
    P_('SHINES LIKE A TROPHY', GREEN, tShines - 0.15, S('right5').end + 0.3, 48, iconCheck);
    P_('CHAMPION OF THE WASH', GREEN, tChamp6 - 0.15, S('right7').start - 0.1, 48, iconCheck);
  }
}
window.dbg = { heroP, BR, camera };
start(update, hud);
