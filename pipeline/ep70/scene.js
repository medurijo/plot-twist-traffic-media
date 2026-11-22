// Episode 65: A rocket launch, right next to the traffic jam
// hook (old style): traffic jam, nothing has moved for an hour, a voice in the field starts counting ->
//        ten, nine, eight: right next to the motorway a rocket is about to launch
// wrong: front-row seats! off the motorway, through the fence, right up to the rocket -> park underneath it, 3-2-1 ->
//        lift-off, your car is stuck to the rocket like chewing gum -> next stop space: your car is now a satellite
// right: stay in your lane, engine off, windows up, enjoy the show -> 3-2-1 lift-off, the whole jam cheers (people in sunroofs) ->
//        the astronaut sees you all waiting so nicely -> the rocket draws a giant heart in the sky -> a tiny parachute lands
//        on your roof: space ice cream
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeLandscape, roundedPath, pathAt,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, ring, aoPass, hemi, sun, _m, _q, _v, _s, _c
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
const tTraffic = WT('hook1', 'Traffic'), tNothing = WT('hook1', 'Nothing'), tThen = WT('hook1', 'Then'), tField = WT('hook1', 'field'), tVoice = WT('hook1', 'voice'), tCounting = WT('hook1', 'counting');
const tTen = WT('hook2', 'Ten'), tNine = WT('hook2', 'Nine'), tEight = WT('hook2', 'Eight'), tRight = WT('hook2', 'Right'), tRocketH = WT('hook2', 'rocket'), tLaunch = WT('hook2', 'launch'), tWhat = WT('hook2', 'What');
const tFrontRow = WT('wrong1', 'front'), tOff = WT('wrong1', 'Off'), tThrough = WT('wrong1', 'through'), tFence = WT('wrong1', 'fence'), tRocketW = WT('wrong1', 'rocket');
const tBig = WT('wrong2', 'Big'), tPark = WT('wrong2', 'park'), tUnder = WT('wrong2', 'underneath'), tThreeW = WT('wrong2', 'Three'), tTwoW = WT('wrong2', 'Two'), tOneW = WT('wrong2', 'One');
const tLiftW = WT('wrong3', 'Lift'), tStuck = WT('wrong3', 'stuck'), tLike = WT('wrong3', 'like'), tGum = WT('wrong3', 'gum'), tNext = WT('wrong3', 'Next'), tSpace = WT('wrong3', 'space'), tYourW = WT('wrong3', 'Your', 1), tSat = WT('wrong3', 'satellite');
const tStay = WT('right2', 'Stay'), tEngine = WT('right2', 'Engine'), tWindows = WT('right2', 'Windows'), tEnjoy = WT('right2', 'enjoy');
const tThreeR = WT('right3', 'Three'), tTwoR = WT('right3', 'Two'), tOneR = WT('right3', 'One'), tLiftR = WT('right3', 'Lift'), tWhole = WT('right3', 'whole'), tCheers = WT('right3', 'cheers');
const tUp = WT('right4', 'Up'), tAstro = WT('right4', 'astronaut'), tSees = WT('right4', 'sees'), tWaiting = WT('right4', 'waiting');
const tSo = WT('right5', 'So'), tDraws = WT('right5', 'draws'), tHeart = WT('right5', 'heart'), tJust = WT('right5', 'Just'), tYouR = WT('right5', 'you');
const tTiny = WT('right6', 'tiny'), tPara = WT('right6', 'parachute'), tRoof = WT('right6', 'roof'), tThank = WT('right6', 'thank'), tSpaceR = WT('right6', 'space'), tCream = WT('right6', 'cream');
const isRight = t => t >= tRew0 + 0.5;
const tIgnW = tLiftW - 0.12, tIgnR = tOneR + 0.35;

// ---------------- world layout ----------------
// motorway along z (traffic on our side drives -z), fence at x = +-13, launch pad in the field ahead-right
const HERO0 = V3(2.3, 0, 0);
const PAD = V3(80, 0, -85);
const N_ = V3(PAD.x - HERO0.x, 0, PAD.z - HERO0.z).normalize();     // hero -> pad (horizontal)
const U_ = V3(-N_.z, 0, N_.x);                                        // horizontal, across the line of sight (to the right of N_ seen from the hero... any side)
const roadT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#55585e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 70 + hash(i) * 40 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); }
  const X = d => (d + 11) / 22 * w; c.fillStyle = '#f2f2f2';
  for (const d of [-9.6, -0.95, 0.95, 9.6]) c.fillRect(X(d) - 3, 0, 6, h);
  for (const d of [-7.7, 7.7]) c.fillRect(X(d) - 2, 0, 4, h);
  for (const d of [-4.1, 4.1]) c.fillRect(X(d) - 3, 30, 6, 110);
  c.fillStyle = '#7a7d80'; c.fillRect(X(-0.6), 0, X(0.6) - X(-0.6), h); }, true);
roadT.repeat.set(1, 1400 / 12);
plane(-11, 11, -900, 500, new THREE.MeshLambertMaterial({ map: roadT }), 0.05, 1);
{ const g = new THREE.BoxGeometry(0.3, 0.85, 1400); const m = new THREE.Mesh(g, L('#b9bcc0')); m.position.set(0, 0.45, -200); m.castShadow = m.receiveShadow = true; scene.add(m); }
const nearPad = (x, z, d) => Math.hypot(x - PAD.x, z - PAD.z) < d;
// keep the heart sky clear of nothing (trees are low anyway); keep road + pad + a viewing corridor free
makeLandscape({ avoid: (x, z) => Math.abs(x) < 26 || nearPad(x, z, 75) || (x > 0 && x < PAD.x + 20 && z < 20 && z > PAD.z - 30), fieldAvoid: (x, z, w, d) => Math.abs(x) < 20 + w / 2 || nearPad(x, z, 60 + Math.max(w, d) / 2), near: [-200, 0, 300, 600], trees: 1300, seed: 7001 });
// launch-site gravel field
{ const m = new THREE.Mesh(new THREE.CircleGeometry(70, 48), L('#c9c2ae', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.rotation.x = -PI / 2; m.position.set(PAD.x, 0.05, PAD.z); m.receiveShadow = true; scene.add(m); }
{ const m = new THREE.Mesh(new THREE.CylinderGeometry(22, 24, 1.0, 8), L('#d8d4cc')); m.position.set(PAD.x, 0.45, PAD.z); m.receiveShadow = true; m.castShadow = true; scene.add(m);
  const tr = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 40), L('#3a3632')); tr.position.set(PAD.x, 0.97, PAD.z); tr.rotation.y = Math.atan2(U_.x, U_.z); tr.receiveShadow = true; scene.add(tr); }
const PADY = 1.0;
// fuel tanks + a little control building
for (const s of [-1, 1]) { const p = PAD.clone().addScaledVector(N_, 42).addScaledVector(U_, s * 22);
  const sp = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), STD('#f4f4f4')); sp.position.set(p.x, 8, p.z); sp.castShadow = sp.receiveShadow = true; scene.add(sp);
  for (let k = 0; k < 4; k++) box(0.5, 6, 0.5, L('#8a8f96'), p.x + Math.cos(k * PI / 2) * 4, 3, p.z + Math.sin(k * PI / 2) * 4, true); }

// ---------------- fence + loudspeaker ----------------
const chainT = canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(200,205,210,1)'; c.lineWidth = 5; for (let i = -w; i < w * 2; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.stroke(); } });
chainT.wrapS = chainT.wrapT = THREE.RepeatWrapping;
const chainM = (len) => { const t = chainT.clone(); t.needsUpdate = true; t.repeat.set(len / 1.2, 2.2 / 1.2); return new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }); };
const CRASH_Z0 = -21.5, CRASH_Z1 = -12.5;
function fenceRun(x, z0, z1) { const len = z1 - z0; const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 2.2), chainM(len)); m.rotation.y = PI / 2; m.position.set(x, 1.2, (z0 + z1) / 2); scene.add(m); m.userData.noAO = true; return m; }
fenceRun(13, -600, CRASH_Z0); fenceRun(13, CRASH_Z1, 300); fenceRun(-13, -600, 300);
const crashG = new THREE.Group(); crashG.position.set(13, 0, (CRASH_Z0 + CRASH_Z1) / 2); scene.add(crashG);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(CRASH_Z1 - CRASH_Z0, 2.2), chainM(CRASH_Z1 - CRASH_Z0)); m.rotation.y = PI / 2; m.position.y = 1.2; m.userData.noAO = true; crashG.add(m);
  for (const z of [-4.5, 0, 4.5]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), L('#9aa0a6')); p.position.set(0, 1.2, z); p.castShadow = true; crashG.add(p); }
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, CRASH_Z1 - CRASH_Z0, 6), L('#9aa0a6')); rail.rotation.x = PI / 2; rail.position.y = 2.3; crashG.add(rail); }
{ const posts = []; for (const x of [13, -13]) for (let z = -600; z <= 300; z += 4.5) if (!(x > 0 && z > CRASH_Z0 - 0.1 && z < CRASH_Z1 + 0.1)) posts.push([x, z]);
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 5), L('#9aa0a6'), posts.length); posts.forEach(([x, z], i) => { _m.compose(_v.set(x, 1.2, z), _q.identity(), _s.set(1, 1, 1)); im.setMatrixAt(i, _m); }); im.castShadow = true; scene.add(im); }
const SPK = V3(14.6, 0, 7);
{ box(0.22, 7.2, 0.22, L('#7d8288'), SPK.x, 3.6, SPK.z, true); box(0.15, 0.15, 2.6, L('#7d8288'), SPK.x, 6.9, SPK.z, true);
  for (const s of [-1, 1]) { const g = new THREE.ConeGeometry(0.62, 1.4, 20, 1, true); g.rotateZ(-PI / 2); const m = new THREE.Mesh(g, STD('#b8bec6', { side: THREE.DoubleSide, metalness: 0.4 })); m.position.set(SPK.x - 0.6, 6.9, SPK.z + s * 0.9); m.rotation.y = s * 0.25; m.castShadow = true; scene.add(m);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 12), STD('#9aa0a6')); b.rotation.z = PI / 2; b.position.set(SPK.x + 0.2, 6.9, SPK.z + s * 0.9); scene.add(b); } }
const signT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, 70); c.fillStyle = '#fff'; c.font = '900 48px Inter'; c.textAlign = 'center'; c.fillText('LAUNCH SITE', w / 2, 52);
  c.fillStyle = '#222'; c.font = '900 40px Inter'; c.fillText('NO ENTRY', w / 2, 140); c.font = '700 30px Inter'; c.fillText('Rocket launches today', w / 2, 200); });
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshLambertMaterial({ map: signT })); m.position.set(12.9, 1.5, -30); m.rotation.y = -PI / 2; scene.add(m); }

// ---------------- traffic jam ----------------
const hero = makeCar('#1e88e5');
const COLS = ['#e53935', '#fdd835', '#43a047', '#ffffff', '#8e24aa', '#fb8c00', '#546e7a', '#d81b60', '#00897b', '#3949ab'];
// full cars near the hero  [x, z, facing(+1 = drives -z)]
const NEAR = [[2.3, -8.6, 1], [2.3, 8.0, 1], [5.9, 5.0, 1], [5.9, -19.5, 1], [5.9, -27.5, 1], [2.3, -16.8, 1], [-2.3, -3, -1], [-5.9, 4, -1], [-2.3, -12, -1], [-5.9, -20, -1]];
const SKIN = ['#f2c7a5', '#d9a07a', '#8d5a3b', '#f5d0b5', '#b9825a'];
function makePerson(shirt, k) { const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.75, 12), STD(shirt)); torso.position.y = 0.37; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 12), STD(SKIN[k % 5])); head.position.y = 0.95; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 8, 0, 2 * PI, 0, PI * 0.5), STD(['#3b2a1e', '#111', '#c9a04a', '#7a3b1e'][k % 4])); hair.position.y = 0.98; hair.rotation.x = -0.25; g.add(hair);
  const arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.3, 0.66, 0); g.add(p); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8), STD(shirt)); a.position.y = -0.3; p.add(a);
    const hnd = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), STD(SKIN[k % 5])); hnd.position.y = -0.62; p.add(hnd); p.rotation.z = s * 0.15; return { p, s }; });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, arms }; }
const CARS = NEAR.map(([x, z, f], i) => { const c = makeCar(COLS[i % COLS.length]); placeCar(c, { x, z, h: f > 0 ? 0 : PI }); c.userData.prev = null;
  const per = makePerson(COLS[(i + 3) % COLS.length], i); per.g.position.set(0, 0.55, 0.15); per.g.rotation.y = (f > 0 ? -1 : 1) * 0.9; c.add(per.g); per.g.visible = false;
  return { c, x, z, f, per, k: i }; });
// instanced far cars (body + cabin)
const FAR = [];
for (const [x, f] of [[2.3, 1], [5.9, 1], [-2.3, -1], [-5.9, -1]]) for (let z = -560; z < 160; z += 7.6 + (hash(FAR.length * 7 + x) - 0.5) * 1.6) {
  if (NEAR.some(n => Math.abs(n[0] - x) < 1 && Math.abs(n[1] - z) < 7.5)) continue;
  if (Math.abs(x - 2.3) < 0.1 && Math.abs(z) < 8) continue;
  if (Math.abs(x - 5.9) < 0.1 && z > -17 && z < 1) continue;     // gap the hero pulls out through
  if (Math.abs(z) < 32 && Math.abs(x) < 7) continue;
  FAR.push([x + (hash(FAR.length) - 0.5) * 0.4, z, f]); }
const farBody = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.7, 4.3), STD('#ffffff', { roughness: 0.3, metalness: 0.3 }), FAR.length);
const farCab = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.55, 2.2), STD('#26313d', { roughness: 0.15, metalness: 0.6 }), FAR.length);
const farTail = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: '#ff2a1a', toneMapped: false }), FAR.length);
function placeFar(dz) { FAR.forEach(([x, z, f], i) => { const zz = z - f * dz;
  _m.compose(_v.set(x, 0.62, zz), _q.identity(), _s.set(1, 1, 1)); farBody.setMatrixAt(i, _m);
  _m.compose(_v.set(x, 1.25, zz + f * 0.2), _q.identity(), _s.set(1, 1, 1)); farCab.setMatrixAt(i, _m);
  _m.compose(_v.set(x, 0.85, zz + f * 2.16), _q.identity(), _s.set(1, 1, 1)); farTail.setMatrixAt(i, _m); });
  farBody.instanceMatrix.needsUpdate = farCab.instanceMatrix.needsUpdate = farTail.instanceMatrix.needsUpdate = true; }
FAR.forEach((_, i) => farBody.setColorAt(i, _c.set(COLS[(i * 7) % COLS.length])));
placeFar(0); for (const m of [farBody, farCab, farTail]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }

// ---------------- rocket ----------------
const ROT = Math.atan2(-N_.x, -N_.z);                 // local +z faces the hero
const rocketBase = new THREE.Group(); rocketBase.position.set(PAD.x, PADY, PAD.z); rocketBase.rotation.y = ROT; scene.add(rocketBase);
const rk = new THREE.Group(); scene.add(rk);           // flying part (world)
const rkIn = new THREE.Group(); rk.add(rkIn); rkIn.rotation.y = ROT;
const RR = 3.2, BODY0 = 5.5, BODY1 = 41.5;
const bodyT = canvasTex(1024, 2048, (c, w, h) => { c.fillStyle = '#f6f6f4'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, 120); c.fillRect(0, h - 260, w, 90);
  c.fillStyle = '#1d1d22'; for (let i = 0; i < 4; i++) { c.fillRect(i * w / 4, h - 520, w / 8, 140); c.fillRect(i * w / 4 + w / 8, 560, w / 8, 120); }
  // vertical text facing +z (u = 0 / 1 seam is at +z for CylinderGeometry) -> centre text at u = 0 via wrap: draw at both edges
  c.save(); c.fillStyle = '#1d3f8f'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const cx of [0, w]) { c.save(); c.translate(cx, h * 0.5); c.rotate(-PI / 2); c.fillText('PLOT TWIST', 0, 0); c.restore(); }
  c.restore(); });
const body = new THREE.Mesh(new THREE.CylinderGeometry(RR, RR, BODY1 - BODY0, 48, 1), STD('#ffffff', { map: bodyT, roughness: 0.45 })); body.position.y = (BODY0 + BODY1) / 2; rkIn.add(body);
// the window seam: CylinderGeometry u=0 is at +z? (theta 0 -> +z). good.
const noseProf = []; for (let i = 0; i <= 20; i++) { const u = i / 20; noseProf.push(new THREE.Vector2(RR * Math.sqrt(1 - u * u) * (1 - 0.02 * u), u * 10)); }
const nose = new THREE.Mesh(new THREE.LatheGeometry(noseProf, 48), STD('#d32f2f', { roughness: 0.4 })); nose.position.y = BODY1; rkIn.add(nose);
const plate = new THREE.Mesh(new THREE.CylinderGeometry(RR * 0.96, RR * 0.9, 0.5, 40), STD('#3a3a40', { metalness: 0.6, roughness: 0.4 })); plate.position.y = BODY0 - 0.2; rkIn.add(plate);
const bellProf = [new THREE.Vector2(0.42, 0), new THREE.Vector2(0.5, -0.4), new THREE.Vector2(0.66, -1.2), new THREE.Vector2(0.86, -2.0)];
const BELLS = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => { const m = new THREE.Mesh(new THREE.LatheGeometry(bellProf, 24), STD('#4a4a52', { metalness: 0.75, roughness: 0.35, side: THREE.DoubleSide })); m.position.set(a * 1.7, BODY0 - 0.4, b * 1.7); rkIn.add(m); return m; });
const finShape = new THREE.Shape(); finShape.moveTo(0, 0); finShape.lineTo(3.4, -2.2); finShape.lineTo(3.4, 1.2); finShape.lineTo(0, 9); finShape.lineTo(0, 0);
const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.35, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 }); finGeo.translate(0, 0, -0.175);
for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(finGeo, STD('#d32f2f', { roughness: 0.4 })); const g = new THREE.Group(); g.rotation.y = k * PI / 2 + PI / 2; rkIn.add(g); f.position.set(RR - 0.2, BODY0 + 0.5, 0); g.add(f); }
// window with astronaut (canvas decal on the body, facing +z)
const astroT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#9aa3ad'; c.beginPath(); c.arc(128, 128, 126, 0, 2 * PI); c.fill();
  const g = c.createRadialGradient(110, 100, 10, 128, 128, 110); g.addColorStop(0, '#2b4c8c'); g.addColorStop(1, '#0d1a36'); c.fillStyle = g; c.beginPath(); c.arc(128, 128, 108, 0, 2 * PI); c.fill();
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(128, 136, 74, 0, 2 * PI); c.fill();                        // helmet
  c.fillStyle = '#f2c7a5'; c.beginPath(); c.arc(128, 138, 52, 0, 2 * PI); c.fill();                        // face
  c.fillStyle = '#1b1b1b'; c.beginPath(); c.arc(108, 128, 8, 0, 2 * PI); c.arc(148, 128, 8, 0, 2 * PI); c.fill();
  c.fillStyle = '#ff8fa3'; c.globalAlpha = 0.6; c.beginPath(); c.arc(96, 150, 10, 0, 2 * PI); c.arc(160, 150, 10, 0, 2 * PI); c.fill(); c.globalAlpha = 1;
  c.strokeStyle = '#7a2b2b'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(128, 146, 22, 0.15 * PI, 0.85 * PI); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(90, 80, 30, 14, -0.6, 0, 2 * PI); c.fill();
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(200, 190, 20, 0, 2 * PI); c.fill(); });      // waving glove
const win_ = new THREE.Mesh(new THREE.CircleGeometry(1.45, 40), new THREE.MeshBasicMaterial({ map: astroT, toneMapped: false })); win_.position.set(0, 37.5, RR + 0.04); rkIn.add(win_);
rk.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
// launch mount legs + tower (static)
for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.8, BODY0 + 0.6, 0.8), STD('#8a9099', { metalness: 0.5 })); l.position.set(a * 3.4, (BODY0 + 0.6) / 2, b * 3.4); l.castShadow = true; rocketBase.add(l); }
const towerG = new THREE.Group(); towerG.position.set(-10.5, 0, -4.5); rocketBase.add(towerG);
{ const tm = STD('#b5442c', { roughness: 0.6 }); for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 56, 0.4), tm); p.position.set(a * 2, 28, b * 2); towerG.add(p); }
  for (let y = 3; y < 56; y += 4) for (const [a, b, rx] of [[0, 2, 0], [0, -2, 0], [2, 0, 1], [-2, 0, 1]]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(rx ? 0.25 : 4.2, 0.25, rx ? 4.2 : 0.25), tm); bar.position.set(a, y, b); towerG.add(bar); } }
const armPivot = new THREE.Group(); armPivot.position.set(-10.5 + 2, 38, -4.5); rocketBase.add(armPivot);
{ const arm = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.2, 1.4), STD('#8a9099')); arm.position.set(3.8, 0, 2.2); armPivot.add(arm); armPivot.rotation.y = 0.45; }
towerG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); armPivot.traverse(o => { if (o.isMesh) o.castShadow = true; });

// flames
const flameT = canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,235,1)'); g.addColorStop(0.35, 'rgba(255,210,90,1)'); g.addColorStop(0.75, 'rgba(255,120,30,0.85)'); g.addColorStop(1, 'rgba(255,80,20,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
function flameCone(r) { const g = new THREE.ConeGeometry(r, 1, 20, 1, true); g.rotateX(PI); g.translate(0, -0.5, 0);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: flameT, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, fog: false })); m.userData.noAO = true; m.frustumCulled = false; return m; }
const FL = BELLS.map(b => { const m = flameCone(0.95); m.position.set(b.position.x, BODY0 - 2.4, b.position.z); rkIn.add(m); return m; });
const plume = flameCone(3.4); plume.position.y = BODY0 - 2.4; rkIn.add(plume);
const fireLight = new THREE.PointLight('#ffa040', 0, 90, 1.3); rk.add(fireLight); fireLight.position.set(0, -2, 0);

// smoke
const puffT = canvasTex(128, 128, (c, w, h) => { for (let i = 0; i < 9; i++) { const x = 64 + (hash(i) - 0.5) * 50, y = 64 + (hash(i + 9) - 0.5) * 40, r = 22 + hash(i + 3) * 22; const g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.6, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); } });
const puffM = (col) => new THREE.SpriteMaterial({ map: puffT, color: col, transparent: true, depthWrite: false, opacity: 0 });
const GROUND = Array.from({ length: 120 }, (_, i) => { const s = new THREE.Sprite(puffM(i % 3 ? '#f3f1ee' : '#d9d6d0')); scene.add(s); return { s, a: hash(i * 3 + 1) * 2 * PI, rm: 14 + hash(i * 5 + 2) * 38, d: hash(i * 7 + 3) * 1.6, h: hash(i * 11 + 4), sz: hash(i * 13 + 5) }; });
const COLUMN = Array.from({ length: 70 }, (_, i) => { const s = new THREE.Sprite(puffM(i % 2 ? '#f6f4f0' : '#e2dfd9')); scene.add(s); return { s, k: i, j: hash(i * 17 + 1) }; });
const STEAM = Array.from({ length: 14 }, (_, i) => { const s = new THREE.Sprite(puffM('#ffffff')); scene.add(s); return { s, k: i, j: hash(i * 23 + 2) }; });

// rocket trajectories
const yW = t => { const u = Math.max(0, t - tLiftW); return 4 * u + 3 * u * u + 0.2 * u * u * u; };
const YT = 70, HK = 3.3;
const RPTS = [];
for (let y = 0; y <= YT; y += 2) RPTS.push(PAD.clone().add(V3(0, PADY + y, 0)));
const heartP = tau => { const hx = 16 * Math.pow(Math.sin(tau), 3), hy = 13 * Math.cos(tau) - 5 * Math.cos(2 * tau) - 2 * Math.cos(3 * tau) - Math.cos(4 * tau) + 17; return PAD.clone().addScaledVector(U_, HK * hx).add(V3(0, PADY + YT + HK * hy, 0)); };
for (let k = 1; k <= 240; k++) RPTS.push(heartP(PI - k / 240 * 2 * PI));
for (let y = 2; y <= 330; y += 3) RPTS.push(PAD.clone().add(V3(0, PADY + YT + y, 0)));
const RCUM = [0]; for (let i = 1; i < RPTS.length; i++) RCUM.push(RCUM[i - 1] + RPTS[i].distanceTo(RPTS[i - 1]));
const L_VERT = YT, L_HEART = RCUM[36 + 240] - RCUM[35], L_ALL = RCUM[RCUM.length - 1];
function rAt(s) { s = clamp(s, 0, L_ALL); let i = 1; while (i < RCUM.length - 1 && RCUM[i] < s) i++; const u = (s - RCUM[i - 1]) / Math.max(1e-6, RCUM[i] - RCUM[i - 1]); return RPTS[i - 1].clone().lerp(RPTS[i], u); }
const tHeart0 = tDraws - 0.1, tHeart1 = tYouR + 0.35;
const sR = mono([[tLiftR, 0], [tLiftR + 1.2, 1.5], [tHeart0, L_VERT], [tHeart1, L_VERT + L_HEART], [tHeart1 + 2.4, L_ALL]]);
function rocketPose(t) {       // returns {p, up}
  if (!isRight(t)) { const y = t < tLiftW ? 0 : yW(t); return { p: PAD.clone().add(V3(0, PADY + y, 0)), up: V3(0, 1, 0), s: y }; }
  const s = t < tLiftR ? 0 : sR(t); const p = rAt(s); const a = rAt(s - 4), b = rAt(s + 4); const up = b.sub(a); if (up.lengthSq() < 1e-6) up.set(0, 1, 0); up.normalize(); if (s < 4) up.set(0, 1, 0);
  return { p, up, s }; }
// contrail tubes
class PolyCurve extends THREE.Curve { constructor(pts, cum) { super(); this.pts = pts; this.cum = cum; this.len = cum[cum.length - 1]; }
  getPoint(u, tgt = new THREE.Vector3()) { const s = u * this.len; let i = 1; while (i < this.cum.length - 1 && this.cum[i] < s) i++; const k = (s - this.cum[i - 1]) / Math.max(1e-6, this.cum[i] - this.cum[i - 1]); return tgt.copy(this.pts[i - 1]).lerp(this.pts[i], k); } }
const TSEG = 900, TRAD = 8;
const trailR = new THREE.Mesh(new THREE.TubeGeometry(new PolyCurve(RPTS, RCUM), TSEG, 2.3, TRAD, false), new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#d8dde6', emissiveIntensity: 0.35 }));
trailR.userData.noAO = true; trailR.frustumCulled = false; scene.add(trailR);
const WPTS = [], WCUM = []; for (let y = 0; y <= 700; y += 5) { WPTS.push(PAD.clone().add(V3(0, PADY + y, 0))); WCUM.push(y); }
const trailW = new THREE.Mesh(new THREE.TubeGeometry(new PolyCurve(WPTS, WCUM), 200, 2.6, TRAD, false), trailR.material); trailW.userData.noAO = true; trailW.frustumCulled = false; scene.add(trailW);

// ---------------- the hero (wrong way: off the motorway to the pad) ----------------
const WPATH = roundedPath([[2.3, 0], [2.3, -1.5], [9.5, -13], [PAD.x, PAD.z]], 5);
let sFence = 0; for (let s = 0; s < WPATH.len; s += 0.1) { if (pathAt(WPATH, s).x >= 13) { sFence = s; break; } }
const tGo = tFrontRow + 0.15, tArrive = tUnder - 0.1;
const sW = mono([[tGo, 0], [tGo + 1.0, 2.5], [tFence, sFence], [tArrive - 0.9, WPATH.len - 6], [tArrive, WPATH.len]]);
const PARKH = pathAt(WPATH, WPATH.len).h;
const TSTUCK0 = tLiftW - 0.45, TSTUCK1 = tLiftW - 0.15;
function heroPose(t) { if (isRight(t) || t < tGo) return { x: HERO0.x, z: HERO0.z, h: 0 }; const p = pathAt(WPATH, sW(t)); return { x: p.x, z: p.z, h: p.h }; }

// ---------------- space set (far away) ----------------
const SP = V3(6000, 0, 0);
const earthT = canvasTex(2048, 1024, (c, w, h) => { c.fillStyle = '#1f5fbf'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { const x = hash(i * 3) * w, y = 150 + hash(i * 5) * (h - 300), r = 40 + hash(i * 7) * 170; c.fillStyle = ['#4f9a3e', '#6fae48', '#c9b37a', '#3f8a3a'][i % 4]; c.beginPath();
    for (let k = 0; k <= 24; k++) { const a = k / 24 * 2 * PI, rr_ = r * (0.6 + 0.5 * hash(i * 31 + k)); c.lineTo(x + Math.cos(a) * rr_ * 1.4, y + Math.sin(a) * rr_); } c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 60; i++) { c.beginPath(); c.ellipse(hash(i * 41) * w, hash(i * 43) * h, 60 + hash(i * 47) * 140, 12 + hash(i * 53) * 22, hash(i) * 0.4, 0, 2 * PI); c.fill(); } });
const earth = new THREE.Mesh(new THREE.SphereGeometry(1400, 96, 48), new THREE.MeshLambertMaterial({ map: earthT, fog: false })); earth.position.copy(SP).add(V3(0, -1500, -900)); earth.rotation.z = 0.3; scene.add(earth);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(1430, 96, 48), new THREE.MeshBasicMaterial({ color: '#7fc0ff', transparent: true, opacity: 0.22, fog: false, depthWrite: false })); atmo.position.copy(earth.position); atmo.userData.noAO = true; scene.add(atmo);
{ const p = []; const R = rng(65); for (let i = 0; i < 1500; i++) { const a = R() * 2 * PI, e = (R() - 0.3) * 1.6; p.push(SP.x + Math.cos(a) * Math.cos(e) * 2500, Math.sin(e) * 2500, Math.sin(a) * Math.cos(e) * 2500); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); var stars = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 2.6, sizeAttenuation: false, fog: false })); stars.frustumCulled = false; scene.add(stars); }
const spaceDome = new THREE.Mesh(new THREE.SphereGeometry(3200, 32, 16), new THREE.MeshBasicMaterial({ color: '#000004', side: THREE.BackSide, fog: false })); spaceDome.position.copy(SP); spaceDome.userData.noAO = true; scene.add(spaceDome);
// solar panels + dish for the satellite car (children of the hero, hidden normally)
const panelT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#1a3a8a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#9fb8e8'; c.lineWidth = 3; for (let x = 0; x <= w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
const PANELS = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.95, 0.95, 0); hero.add(g); const p = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 1.7), STD('#ffffff', { map: panelT, metalness: 0.5, roughness: 0.3 })); p.position.x = s * 1.85; g.add(p);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), STD('#c0c4ca')); rod.rotation.z = PI / 2; rod.position.x = s * 0.1; g.add(rod); g.visible = false; return g; });
const dish = new THREE.Group(); dish.position.set(0, 1.62, 0.6); hero.add(dish); dish.visible = false;
{ const d = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 8, 0, 2 * PI, 0, 0.9), STD('#e8e8e8', { side: THREE.DoubleSide })); d.rotation.x = -0.6; d.position.y = 0.45; dish.add(d); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), STD('#aaa')); st.position.y = 0.2; dish.add(st); }
const gum = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), STD('#ff79b0', { roughness: 0.5 })); gum.visible = false; scene.add(gum);
const gumStr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 10), STD('#ff79b0', { roughness: 0.5 })); gumStr.visible = false; scene.add(gumStr);
const satRocket = rk.clone(true); scene.add(satRocket); satRocket.traverse(o => { if (o.isMesh && o.material === plume.material) o.visible = false; }); satRocket.visible = false;

// ---------------- parachute + space ice cream ----------------
const chute = new THREE.Group(); scene.add(chute);
const canT = canvasTex(512, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(i * w / 8, 0, w / 8, h); } });
const canopy = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 12, 0, 2 * PI, 0, PI * 0.42), STD('#ffffff', { map: canT, side: THREE.DoubleSide, roughness: 0.7 })); canopy.position.y = 2.3; chute.add(canopy);
{ const lp = []; for (let k = 0; k < 8; k++) { const a = k / 8 * 2 * PI; lp.push(Math.cos(a) * 1.95, 2.3 + 2.0 * Math.cos(PI * 0.42), Math.sin(a) * 1.95, 0, 0.62, 0); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  var lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#333' })); chute.add(lines); }
const ice = new THREE.Group(); chute.add(ice);
{ const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.16, 16), STD('#c8ccd2', { metalness: 0.8, roughness: 0.25 })); base.position.y = 0.08; ice.add(base);
  const cg = new THREE.ConeGeometry(0.2, 0.55, 16); cg.rotateX(PI); const cone = new THREE.Mesh(cg, STD('#d9a35c', { roughness: 0.8 })); cone.position.y = 0.42; ice.add(cone);
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), STD('#ff8fb1')); s1.position.y = 0.74; ice.add(s1);
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 12), STD('#bff3d6')); s2.position.y = 0.98; ice.add(s2);
  const ch = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), STD('#d50000')); ch.position.y = 1.18; ice.add(ch);
  for (let k = 0; k < 10; k++) { const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), new THREE.MeshBasicMaterial({ color: ['#ffd60a', '#ffffff', '#40c4ff'][k % 3] })); const a = k * 2.4; sp.position.set(Math.cos(a) * 0.2, 0.7 + (k % 4) * 0.08, Math.sin(a) * 0.2); ice.add(sp); } }
ice.scale.setScalar(1.25);
chute.traverse(o => { if (o.isMesh) o.castShadow = true; });

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const heroV = t => { const p = heroPose(t); return { p: V3(p.x, 0, p.z), fw: V3(-Math.sin(p.h), 0, -Math.cos(p.h)), rt: V3(Math.cos(p.h), 0, -Math.sin(p.h)) }; };
const HC = (off, look, fov = 40) => t => { const { p, fw, rt } = heroV(t);
  return [p.clone().addScaledVector(rt, off[0]).add(V3(0, off[1], 0)).addScaledVector(fw, -off[2]), p.clone().addScaledVector(rt, look[0]).add(V3(0, look[1], 0)).addScaledVector(fw, look[2]), fov]; };
// camera on the line pad -> hero, behind the hero
const LineCam = (dist, up, lookY, fov = 40, side = 0) => t => { const p = HERO0.clone().addScaledVector(N_, -dist).addScaledVector(U_, side).add(V3(0, up, 0)); return [p, PAD.clone().add(V3(0, lookY, 0)), fov]; };
const PadCam = (r, dn, up, lookY, fov) => t => [PAD.clone().addScaledVector(U_, r).addScaledVector(N_, dn).add(V3(0, up, 0)), PAD.clone().add(V3(0, lookY, 0)), fov];
const RkCam = (r, dn, up, lookY, fov) => t => { const rp = rocketPose(t).p; return [rp.clone().addScaledVector(U_, r).addScaledVector(N_, dn).add(V3(0, up, 0)), rp.clone().add(V3(0, lookY, 0)), fov]; };
const FenceCam = () => { const X = pathAt(WPATH, sFence); const d = V3(-Math.sin(X.h), 0, -Math.cos(X.h)), r = V3(Math.cos(X.h), 0, -Math.sin(X.h)); const p = V3(X.x, 2.2, X.z).addScaledVector(d, 15).addScaledVector(r, -6.5); return t => [p.clone(), V3(X.x, 1.0, X.z).addScaledVector(d, 2), 42]; };
const WinCam = (back_, dy, fov) => t => { const rp = rocketPose(t).p; const w = rp.clone().add(V3(0, 37.5, 0)); return [w.clone().addScaledVector(N_, -back_).add(V3(0, dy, 0)), w, fov]; };
const PovCam = (fov) => t => { const rp = rocketPose(t).p; const w = rp.clone().add(V3(0, 37.5, 0)).addScaledVector(N_, -5); return [w, HERO0.clone().add(V3(0, 0, -6)), fov]; };
const SpaceCam = (dx, dy, dz, fov) => t => [SP.clone().add(V3(dx, 30 + dy, dz)), SP.clone().add(V3(0, 27.5, 0)), fov];
const ChuteCam = () => t => { const { p, fw } = heroV(t); const cp = chutePos(t); const cam = p.clone().addScaledVector(fw, 9).add(V3(1.6, 1.3, 0)); return [cam, cp.clone().lerp(p.clone().add(V3(0, 1.4, 0)), 0.35), 42]; };
const camKeys = [
  [0.0, HC([0.3, 3.4, 12], [0, 1.0, 40], 40)],
  [tThen - 0.3, HC([0.4, 3.0, 10.5], [0.2, 1.0, 40], 40)],
  ...cut(tThen - 0.25, Ac([0.6, 1.9, 9], [14.6, 4.8, 7], 40)),
  [tTen - 0.2, Ac([4.0, 2.4, 8], [14.6, 5.6, 7], 40)],
  [tRight - 0.25, Ac([6.0, 2.9, 7.6], [14.6, 6.4, 7], 40)],
  ...cut(tRight - 0.2, LineCam(12, 2.2, 6, 40)),
  [tRocketH - 0.2, LineCam(12.5, 2.4, 12, 40)],
  [tLaunch + 0.3, LineCam(13.5, 2.6, 24, 42)],
  ...cut(tWhat - 0.25, LineCam(34, 9, 24, 44)),
  [S('hook2').end + 0.6, LineCam(36, 10, 24, 44)],
  // wrong
  ...cut(S('wrong1').start - 0.15, HC([1.4, 2.6, 9.5], [0, 1.2, 30], 40)),
  [tGo, HC([1.4, 2.6, 9.5], [0, 1.2, 30], 40)],
  [tThrough - 0.4, HC([1.2, 3.0, 11], [0, 1.2, 30], 40)],
  ...cut(tThrough - 0.15, FenceCam()),
  [tRocketW - 0.25, FenceCam()],
  ...cut(tRocketW - 0.2, HC([0.6, 2.8, 11], [0, 9, 40], 42)),
  [tPark, HC([0.8, 3.2, 13], [0, 11, 40], 44)],
  ...cut(tThreeW - 0.25, PadCam(-9.5, -3, 0.9, 5.2, 52)),
  [tLiftW - 0.25, PadCam(-10.5, -3.5, 0.9, 5.6, 52)],
  ...cut(tLiftW - 0.2, PadCam(-75, -30, 6, 24, 46)),
  [tStuck - 0.25, PadCam(-75, -30, 6, 30, 46)],
  ...cut(tStuck - 0.2, RkCam(-15, -4, 1.5, 4.0, 46)),
  [tNext - 0.25, RkCam(-14, -4, 0.5, 4.5, 46)],
  ...cut(tNext - 0.2, RkCam(-26, -12, -28, 12, 44)),
  [tYourW - 0.25, RkCam(-30, -14, -40, 14, 44)],
  ...cut(tYourW - 0.2, SpaceCam(7, 2, 18, 38)),
  [tRew0, SpaceCam(5, 1.5, 15, 38)],
  // right
  ...cut(tRew1, LineCam(34, 9, 24, 44)),
  ...cut(tStay - 0.15, HC([0.4, 3.1, 11.5], [0, 1.0, 30], 40)),
  [tEnjoy - 0.3, HC([0.3, 2.8, 10], [0, 1.0, 30], 40)],
  ...cut(tEnjoy - 0.25, LineCam(13, 2.4, 20, 42)),
  [tOneR, LineCam(16, 2.6, 22, 42)],
  ...cut(tLiftR - 0.25, LineCam(48, 7, 26, 46)),
  [tWhole - 0.3, LineCam(50, 8, 30, 46)],
  ...cut(tWhole - 0.25, Ac([8.5, 6.5, -27], [2.5, 0.6, -5], 46)),
  [S('right3').end + 0.3, Ac([8.5, 6.8, -28.5], [2.5, 0.6, -5], 46)],
  ...cut(tAstro - 0.2, WinCam(15, -2, 36)),
  [tSees - 0.25, WinCam(13, -2, 36)],
  ...cut(tSees - 0.2, PovCam(26)),
  [S('right4').end + 0.3, PovCam(22)],
  ...cut(tSo - 0.2, LineCam(14, 1.2, 76, 72)),
  [S('right5').end + 0.3, LineCam(15, 1.2, 80, 72)],
  ...cut(tTiny - 0.2, ChuteCam()),
  [tRoof - 0.3, ChuteCam()],
  ...cut(tRoof - 0.2, HC([5.0, 2.8, 3.5], [0, 1.6, 0.2], 40)),
  [tSpaceR - 0.3, HC([4.4, 2.7, 3.0], [0, 1.7, 0.2], 40)],
  ...cut(tSpaceR - 0.2, HC([2.2, 2.6, 2.6], [0, 2.1, 0.1], 34)),
  [S('right6').end + 0.3, HC([2.0, 2.6, 2.4], [0, 2.1, 0.1], 34)],
  ...cut(S('right7').start - 0.15, LineCam(12, 2.2, 70, 72)),
  [TOTAL, LineCam(16, 2.6, 74, 72)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- parachute path ----------------
const tChute0 = tTiny - 0.3, tLand = tRoof - 0.05;
function chutePos(t) { const { p } = heroV(t); const u = clamp((t - tChute0) / (tLand - tChute0)); const e = 1 - Math.pow(1 - u, 1.6);
  return p.clone().add(V3(Math.sin(t * 2.1) * 1.2 * (1 - u), lerp(42, 1.64, e), lerp(-6, 0.3, e))); }

let CP = new THREE.Vector3();
const nearFade = sp => clamp((sp.position.distanceTo(CP) - sp.scale.x * 0.6 - 3) / 12);
// ---------------- update ----------------
const DAY = new THREE.Color('#8fc7ff'), SPACEBG = new THREE.Color('#02030a');
const SUN0 = sun.intensity, HEMI0 = hemi.intensity;
let screen = {};
function update(t) {
  const right = isRight(t);
  const c = cam(t); CP.copy(c.p); camera.fov = c.fov; camera.near = 0.2; camera.far = 5000; camera.updateProjectionMatrix();
  // ---- sky ----
  const inSpace = !right && t >= tYourW - 0.2;
  const dark = right ? 0 : (inSpace ? 1 : 0.85 * ramp(t, tNext, tYourW - 0.2));
  scene.background.copy(DAY).lerp(SPACEBG, dark); scene.fog.color.copy(scene.background); scene.fog.far = inSpace ? 99999 : 1150; scene.fog.near = inSpace ? 99998 : 380;
  hemi.intensity = HEMI0 * (inSpace ? 0.35 : 1);
  // ---- traffic ----
  const go = right ? ramp(t, S('right7').start, TOTAL) : 0;           // jam starts moving at the end
  const dz = right ? 4 * Math.pow(Math.max(0, t - S('right7').start), 1.6) * 0.5 : 0;
  placeFar(dz);
  const cheer = right ? ramp(t, tWhole - 0.3, tWhole + 0.3) : 0;
  CARS.forEach(o => { const zz = o.z - o.f * dz; placeCar(o.c, { x: o.x, z: zz, h: o.f > 0 ? 0 : PI }); o.c.userData.prev = null;
    o.c.userData.tl.emissiveIntensity = go > 0.5 ? 0.4 : 1.6;
    const pc = cheer * (1 - ramp(t, tUp + 0.5, tUp + 1.2)); o.per.g.visible = pc > 0.01; o.per.g.position.y = lerp(0.3, 1.05, pc);
    o.per.arms.forEach(a => { a.p.rotation.z = a.s * lerp(0.15, PI - 0.35 + 0.35 * Math.sin(t * 9 + o.k + a.s), pc); });
    o.c.userData.bodyG.position.y = cheer > 0 && pc > 0.01 ? 0.05 * Math.abs(Math.sin(t * 8 + o.k)) : 0; });
  // ---- hero ----
  const hp = heroPose(t);
  const stuck = !right && t >= TSTUCK0 && !inSpace;
  const rp = rocketPose(t);
  if (inSpace) {
    hero.position.copy(SP).add(V3(0, 28.6, 0)); hero.rotation.set(0.25 * Math.sin(t * 0.7), 0.6 + (t - tYourW) * 0.35, 0.18, 'YXZ'); hero.userData.prev = null;
    const uo = ramp(t, tSat - 0.5, tSat + 0.2); PANELS.forEach(g => { g.visible = true; g.scale.set(Math.max(0.02, uo), 1, 1); }); dish.visible = uo > 0.05; dish.scale.setScalar(Math.max(0.01, uo)); dish.rotation.y = t * 1.5;
  } else {
    PANELS.forEach(g => g.visible = false); dish.visible = false;
    if (stuck) { const k = ramp(t, TSTUCK0, TSTUCK1); const y0 = rp.p.y + BODY0 - 1.62 - 0.05;
      hero.position.set(lerp(PAD.x, rp.p.x, 1), lerp(PADY, y0, easeOut(k)), PAD.z); hero.rotation.set(0, PARKH, 0.06 * Math.sin(t * 13) * k, 'YXZ'); hero.userData.prev = null;
      hero.userData.spin = (hero.userData.spin || 0) + 0.6; hero.userData.wheels.forEach(w => w.rotation.x = hero.userData.spin); hero.userData.bodyG.rotation.set(0, 0, 0); }
    else { const onPad = !right && t >= tGo && sW(t) > WPATH.len - 25; placeCar(hero, { x: hp.x, z: hp.z, h: hp.h, y: onPad ? PADY * ramp(sW(t), WPATH.len - 25, WPATH.len - 22) : 0 }); }
  }
  hero.userData.tl.emissiveIntensity = right && t > tEngine ? 0.35 : 1.6;
  blink(hero, t, false, !right && t > tFrontRow - 0.4 && t < tFence);
  // ---- fence crash ----
  const fr = !right ? ramp(t, tFence - 0.08, tFence + 0.35) : 0; crashG.rotation.z = -1.45 * fr; crashG.position.y = 0;
  // ---- rocket ----
  const flying = right ? t >= tLiftR : t >= tLiftW;
  rk.position.copy(rp.p); rk.quaternion.setFromUnitVectors(V3(0, 1, 0), rp.up);
  rk.visible = !inSpace || true;
  armPivot.rotation.y = 0.45 + 1.3 * ramp(t, (right ? tThreeR : tThreeW) - 0.2, (right ? tThreeR : tThreeW) + 1.0);
  const tIgn = right ? tIgnR : tIgnW, tLift = right ? tLiftR : tLiftW;
  const fire = t >= tIgn ? (t < tLift ? ramp(t, tIgn, tIgn + 0.25) * 0.7 : 1) : 0;
  const fadeHigh = right ? (1 - ramp(t, tHeart1 + 1.5, tHeart1 + 2.4)) : 1;
  FL.forEach((m, i) => { m.visible = fire > 0.01 && fadeHigh > 0.01; m.scale.set(1, (4 + 6 * fire) * (0.85 + 0.15 * Math.sin(t * 47 + i * 2)), 1); m.material.opacity = 0.95 * fire; });
  plume.visible = fire > 0.01 && fadeHigh > 0.01; plume.scale.set(0.6 + 0.4 * fire, (6 + 14 * fire) * (0.9 + 0.1 * Math.sin(t * 31)), 0.6 + 0.4 * fire); plume.material.opacity = 0.75 * fire * fadeHigh;
  fireLight.intensity = 900 * fire * fadeHigh;
  // ---- smoke ----
  const age0 = t - tIgn;
  GROUND.forEach(g => { const a = age0 - g.d * 0.6; g.s.visible = a > 0; if (a <= 0) return; const r = 4 + g.rm * (1 - Math.exp(-a * 0.7));
    g.s.position.set(PAD.x + Math.cos(g.a) * r, PADY + 2 + g.h * 9 + a * 0.9, PAD.z + Math.sin(g.a) * r); g.s.scale.setScalar(7 + 16 * (1 - Math.exp(-a * 0.5)) + g.sz * 8);
    g.s.material.opacity = nearFade(g.s) * 0.92 * ramp(a, 0, 0.4) * (right ? 1 - 0.88 * ramp(t, tSo - 1.2, tSo + 0.2) : 1); });
  COLUMN.forEach(p => { const te = tLift + p.k * 0.1; const a = t - te; p.s.visible = a > 0 && flying; if (!p.s.visible) return; const rpe = rocketPose(te); if (rpe.s > 60) { p.s.visible = false; return; }
    p.s.position.copy(rpe.p).add(V3((p.j - 0.5) * 3 + a * (p.j - 0.5) * 2, -1 + a * 0.6, (hash(p.k * 5) - 0.5) * 3)); p.s.scale.setScalar(6 + a * 5 + p.j * 4); p.s.material.opacity = nearFade(p.s) * 0.85 * (1 - ramp(a, 6, 14)); });
  STEAM.forEach(p => { const per = 2.2, ph = ((t * 0.9 + p.j * per) % per) / per; const on = !flying && t > 0; p.s.visible = on; if (!on) return;
    p.s.position.copy(PAD).add(V3(0, PADY + 9 + p.k * 0.8, 0)).addScaledVector(U_, -RR - 0.5 - ph * 4).add(V3(0, ph * 3, 0)); p.s.scale.setScalar(1.5 + ph * 5); p.s.material.opacity = 0.7 * Math.sin(PI * ph) * (t > tIgn - 1.5 ? 1.6 : 1); });
  // ---- contrails ----
  trailW.visible = !right && flying; trailW.geometry.setDrawRange(0, Math.floor(clamp((yW(t) - 4) / 700) * 200) * TRAD * 6);
  trailR.visible = right && flying; trailR.geometry.setDrawRange(0, Math.floor(clamp((sR(t) - 4) / L_ALL) * TSEG) * TRAD * 6);
  // ---- chewing gum ----
  gum.visible = stuck; gumStr.visible = stuck && t < TSTUCK1 + 0.6;
  if (stuck) { gum.position.copy(hero.position).add(V3(0, 1.62, 0)); gum.scale.set(1.0, 0.35, 0.8);
    const top = V3(PAD.x, PADY + 0.05, PAD.z); const bot = gum.position.clone(); const len = bot.y - top.y; gumStr.position.copy(top).add(V3(0, len / 2, 0)); gumStr.scale.set(1 - ramp(t, TSTUCK1, TSTUCK1 + 0.6), Math.max(0.01, len), 1 - ramp(t, TSTUCK1, TSTUCK1 + 0.6)); }
  // ---- space ----
  spaceDome.visible = earth.visible = atmo.visible = stars.visible = inSpace;
  satRocket.visible = inSpace; if (inSpace) { const k = t - tYourW; satRocket.position.copy(SP).add(V3(-60 - k * 22, 70 + k * 30, -160 - k * 10)); satRocket.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(-0.5, 0.8, -0.2).normalize()); satRocket.scale.setScalar(0.55); }
  // ---- parachute ----
  const showChute = right && t >= tChute0;
  chute.visible = showChute;
  if (showChute) { const cp = chutePos(t); chute.position.copy(cp); const landed = ramp(t, tLand, tLand + 0.6);
    chute.rotation.set(0.08 * Math.sin(t * 1.7) * (1 - landed), 0, 0.12 * Math.sin(t * 2.1) * (1 - landed));
    canopy.scale.set(1 - 0.35 * landed, 1 - 0.85 * landed, 1 - 0.35 * landed); canopy.position.set(0, lerp(2.3, 0.5, landed), lerp(0, 2.4, landed)); canopy.rotation.x = 0.9 * landed;
    lines.visible = landed < 0.2; ice.rotation.y = t * 0.6; }
  // ---- camera ----
  let shake = 0; const tl_ = right ? tLiftR : tLiftW; if (t > tl_ - 0.4 && t < tl_ + 2.2 && !inSpace) shake = 0.18 * (1 - ramp(t, tl_ + 0.8, tl_ + 2.2));
  if (!right) shake = Math.max(shake, 0.3 * win(t, tFence - 0.05, tFence + 0.3, 0.05));
  applyCam(c, t, shake);
  camera.updateMatrixWorld(true);
  screen = { hero: project(hero.localToWorld(V3(0, 1.8, 0))), win: project(rk.localToWorld(V3(0, 37.5, 0))), fence: project(V3(13, 1.4, -17)) };
}
import { blink } from '../common.js';

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const NUM = (s, a, col) => floatText(s, W / 2, 760, gT, a, a + 0.75, 260, col, 0);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('TRAFFIC JAM', '#1565c0', tTraffic - 0.1, tNothing - 0.15, 60);
    P_('NOTHING MOVES · 60 MIN', '#455a64', tNothing - 0.1, tThen - 0.15, 50);
    P_('A VOICE IN THE FIELD?', '#6a1b9a', tField - 0.2, tTen - 0.15, 52);
    NUM('10', tTen, '#ffffff'); NUM('9', tNine, '#ffffff'); NUM('8', tEight, '#ffffff');
    P_('ROCKET LAUNCH', '#e65100', tRocketH - 0.15, S('hook2').end + 0.4, 62, iconWarn);
    P_('FRONT-ROW SEATS!', RED, tFrontRow - 0.1, tThrough - 0.15, 56, iconX);
    P_('THROUGH THE FENCE', RED, tThrough - 0.1, tRocketW - 0.15, 54, iconX);
    floatText('CRASH!', W / 2 + 140, 1450, t, tFence, tFence + 0.9, 120, YEL, 0.08);
    P_('PARKED UNDER A ROCKET', RED, tPark - 0.1, tThreeW - 0.15, 50, iconX);
    NUM('3', tThreeW, '#ff3b30'); NUM('2', tTwoW, '#ff3b30'); NUM('1', tOneW, '#ff3b30');
    floatText('LIFT-OFF!', W / 2, 800, t, tLiftW, tLiftW + 1.0, 150, YEL, -0.06);
    P_('STUCK LIKE CHEWING GUM', RED, tStuck - 0.1, tNext - 0.15, 50, iconX);
    P_('NEXT STOP: SPACE', '#311b92', tNext - 0.1, tYourW - 0.15, 58, iconX);
    P_('NEW SATELLITE', RED, tYourW - 0.05, tRew0, 60, iconX);
    floatText('BEEP BEEP', W / 2 - 150, 1450, t, tSat + 0.3, tSat + 1.4, 90, '#7fe3ff', -0.08);
  } else {
    P_('STAY IN YOUR LANE', GREEN, tStay - 0.1, tEngine - 0.15, 56, iconCheck);
    P_('ENGINE OFF', GREEN, tEngine - 0.1, tWindows - 0.15, 60, iconCheck);
    P_('WINDOWS UP', GREEN, tWindows - 0.1, tEnjoy - 0.15, 60, iconCheck);
    P_('ENJOY THE SHOW', GREEN, tEnjoy - 0.1, tThreeR - 0.1, 60, iconCheck);
    NUM('3', tThreeR, '#4cff6a'); NUM('2', tTwoR, '#4cff6a'); NUM('1', tOneR, '#4cff6a');
    floatText('LIFT-OFF!', W / 2, 800, t, tLiftR, tLiftR + 1.0, 150, YEL, -0.06);
    floatText('WOOHOO!', W / 2 - 170, 760, t, tCheers - 0.2, tCheers + 0.9, 100, YEL, -0.1);
    floatText('YEAH!', W / 2 + 200, 900, t, tCheers + 0.1, tCheers + 1.0, 90, '#fff', 0.1);
    P_('THE ASTRONAUT SEES YOU', '#3949ab', tAstro - 0.1, S('right4').end + 0.2, 50, iconHeart);
    if (t > tSees && t < S('right4').end + 0.3) ring(V3(2.3, 1.0, 0), 46, t, tSees + 0.1, S('right4').end + 0.3);
    P_('A HEART · JUST FOR YOU', '#d81b60', tHeart - 0.1, S('right5').end + 0.3, 52, iconHeart);
    P_('SPACE ICE CREAM', '#d81b60', tSpaceR - 0.15, S('right6').end + 0.4, 58, iconHeart);
  }
}
window.dbg = { hero, rocketPose, heroPose, PAD, N_, U_ };
start(update, hud);
