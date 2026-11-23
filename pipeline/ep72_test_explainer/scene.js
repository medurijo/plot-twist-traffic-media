// Episode 67 (TEST – serious explainer style, ElevenLabs voice "Louis - Friendly Instructor")
// Lesson 67: runway crossings. Sat-nav says turn left – on the left there is a runway, a plane is coming in to land.
// wrong: trust the sat-nav, turn onto the runway -> plane directly behind you at 250 km/h -> ATC treats your car as an
//        aircraft: cleared for take-off, your car now has a flight number
// right: stop at the yellow holding line, wait for the plane to land -> hazard lights, wait for the follow-me car ->
//        it guides you across, stay close behind -> wave to the pilot -> the pilot flashes the landing lights: thank you
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeLandscape, roundedPath, pathAt, makeCar, placeCar, applyCam, project, blink,
  YEL, GREEN, RED, BLUE, pill, rr, iconCheck, iconWarn, iconX, iconHeart, iconArrow, floatText, start, aoPass, hemi, sun, _m, _q, _v, _s, _c
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
function integ(vfn, t0, t1, s0) { const dt = 1 / 120, cum = [s0]; let s = s0; for (let t = t0; t <= t1 + 1; t += dt) { s += vfn(t) * dt; cum.push(s); } return t => { const k = clamp((t - t0) / dt, 0, cum.length - 2), i = Math.floor(k); return lerp(cum[i], cum[i + 1], k - i); }; }
// ---------------- timing ----------------
const tLesson = WT('hook1', 'Lesson'), tRunwayH = WT('hook1', 'Runway'), tYourH = WT('hook1', 'Your'), tTurnH = WT('hook1', 'turn');
const tOn = WT('hook2', 'On'), tAnd = WT('hook2', 'And'), tPlaneH = WT('hook2', 'plane'), tWhat = WT('hook2', 'What');
const tCommon = WT('wrong1', 'common'), tDrivers = WT('wrong1', 'drivers'), tTurnW = WT('wrong1', 'turn'), tRunwayW = WT('wrong1', 'runway');
const tPlaneW = WT('wrong2', 'plane'), tBehind = WT('wrong2', 'behind'), tLanding = WT('wrong2', 'Landing'), tTwo = WT('wrong2', 'two');
const tAt = WT('wrong3', 'At'), tAir = WT('wrong3', 'air'), tTreats = WT('wrong3', 'treats'), tAircraft = WT('wrong3', 'aircraft'), tCleared = WT('wrong3', 'cleared'), tTake = WT('wrong3', 'take'), tYourW = WT('wrong3', 'Your', 1), tFlight = WT('wrong3', 'flight');
const tStop = WT('right2', 'Stop'), tYellow = WT('right2', 'yellow'), tWait = WT('right2', 'Wait'), tLandR = WT('right2', 'land');
const tSwitch = WT('right3', 'Switch'), tHazard = WT('right3', 'hazard'), tWaitF = WT('right3', 'wait'), tFollowMe = WT('right3', 'follow');
const tGuide = WT('right4', 'guide'), tAcross = WT('right4', 'across'), tStay = WT('right4', 'Stay');
const tGive = WT('right5', 'give'), tWave = WT('right5', 'wave'), tPilots = WT('right5', 'Pilots');
const tPilot6 = WT('right6', 'pilot'), tFlashes = WT('right6', 'flashes'), tThat = WT('right6', 'That'), tThank = WT('right6', 'thank');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world ----------------
const RWH = 22.5, HOLD = 34, ROADX = 1.8;
makeLandscape({ avoid: (x, z) => Math.abs(z) < 95 || Math.abs(x) < 16 || (x < -60 && x > -160 && z < -40 && z > -140), fieldAvoid: (x, z, w, d) => Math.abs(z) < 90 + d / 2 || Math.abs(x) < 14 + w / 2, near: [0, 200, 300, 200], trees: 1300, seed: 7201 });
// mown airfield grass band
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(3000, 180), L('#8fc65a', { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); m.rotation.x = -PI / 2; m.position.y = 0.02; m.receiveShadow = true; scene.add(m); }
// road
const roadT = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#55585d'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = 72 + hash(i) * 38 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); }
  c.fillStyle = '#f2f2f2'; c.fillRect(8, 0, 6, h); c.fillRect(w - 14, 0, 6, h); for (let y = 0; y < h; y += 128) c.fillRect(w / 2 - 3, y, 6, 64); }, true);
roadT.repeat.set(1, 800 / 16);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 800), new THREE.MeshLambertMaterial({ map: roadT })); m.rotation.x = -PI / 2; m.position.set(0, 0.04, 0); m.receiveShadow = true; scene.add(m); }
// perimeter service road along the runway (z = +28) on the right
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(60, 5), L('#6a6d72')); m.rotation.x = -PI / 2; m.position.set(34, 0.045, 28); m.receiveShadow = true; scene.add(m); }
// runway
const rwT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#4a4d52'; c.fillRect(0, 0, w, h); for (let i = 0; i < 12000; i++) { const v = 62 + hash(i) * 34 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); }
  c.fillStyle = '#f4f4f4'; c.fillRect(0, 10, w, 7); c.fillRect(0, h - 17, w, 7); c.fillRect(60, h / 2 - 5, 420, 10); c.fillRect(600, h / 2 - 5, 420, 10); }, true);
rwT.repeat.set(2800 / 120, 1);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(2800, 2 * RWH), new THREE.MeshLambertMaterial({ map: rwT, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.rotation.x = -PI / 2; m.position.y = 0.06; m.receiveShadow = true; scene.add(m); }
// threshold keys + designators + touchdown blocks
const markM = L('#f4f4f4', { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
for (const sx of [1, -1]) { const X0 = sx * 520; for (let k = -6; k <= 6; k++) { if (!k) continue; const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 1.8), markM); m.rotation.x = -PI / 2; m.position.set(X0, 0.07, k * 3.0); scene.add(m); }
  for (const zz of [-9, 9]) for (const dx of [80, 150, 220]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(22, 3), markM); m.rotation.x = -PI / 2; m.position.set(X0 - sx * dx, 0.07, zz); scene.add(m); } }
const numT = (txt) => canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#f4f4f4'; c.font = '900 200px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2); });
for (const [x, txt, rot] of [[480, '27', -PI / 2], [-480, '09', PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshLambertMaterial({ map: numT(txt), transparent: true, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); m.rotation.set(-PI / 2, 0, rot); m.position.set(x, 0.08, 0); scene.add(m); }
// edge lights
{ const pts = []; for (let x = -1400; x <= 1400; x += 30) for (const z of [-RWH - 0.8, RWH + 0.8]) if (Math.abs(x) > 8) pts.push([x, z]);
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 6), new THREE.MeshBasicMaterial({ color: '#fffbe0', toneMapped: false }), pts.length); pts.forEach(([x, z], i) => { _m.compose(_v.set(x, 0.2, z), _q.identity(), _s.set(1, 1, 1)); im.setMatrixAt(i, _m); }); scene.add(im); }
// holding lines (two solid + two dashed yellow) on the road, both sides
for (const sz of [1, -1]) { const z0 = sz * HOLD; for (let k = 0; k < 4; k++) { const zz = z0 - sz * k * 0.45; if (k < 2) { const m = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 0.2), L('#ffcc00', { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); m.rotation.x = -PI / 2; m.position.set(0, 0.06, zz); scene.add(m); }
    else for (let x = -3.6; x < 3.6; x += 1.0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), L('#ffcc00', { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); m.rotation.x = -PI / 2; m.position.set(x + 0.3, 0.06, zz); scene.add(m); } } }
// mandatory sign (red, white text) + stop light at the holding point
const signT = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#d11d1d'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 110px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('27-09', w / 2, h / 2 + 6); c.strokeStyle = '#fff'; c.lineWidth = 8; c.strokeRect(8, 8, w - 16, h - 16); });
for (const sz of [1, -1]) { const g = new THREE.Group(); g.position.set(-5.8 * sz, 0, sz * (HOLD + 0.8)); g.rotation.y = sz > 0 ? 0 : PI; scene.add(g);
  const b = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 0.25), STD('#d11d1d')); b.position.y = 1.0; g.add(b); const f = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 0.98), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false })); f.position.set(0, 1.0, 0.13); g.add(f);
  for (const x of [-1.2, 1.2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), STD('#ccc')); p.position.set(x, 0.3, 0); g.add(p); } }
const stopLights = [];
for (const sz of [1, -1]) { const g = new THREE.Group(); g.position.set(5.6 * sz, 0, sz * (HOLD + 0.6)); g.rotation.y = sz > 0 ? 0 : PI; scene.add(g);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.6, 8), STD('#2b2b2b')); pole.position.y = 1.8; g.add(pole);
  const hs = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.4), STD('#1b1b1b')); hs.position.y = 3.6; g.add(hs);
  const lamps = [0, 1].map(k => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), new THREE.MeshBasicMaterial({ color: '#330000', toneMapped: false })); m.position.set(0, 3.85 - k * 0.5, 0.21); g.add(m); return m; });
  stopLights.push(lamps); }
// control tower + terminal
{ const T = new THREE.Group(); T.position.set(-110, 0, -90); scene.add(T);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4, 30, 24), STD('#e8e6e0')); sh.position.y = 15; T.add(sh);
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(7, 5.5, 5, 10), STD('#1d3b55', { metalness: 0.6, roughness: 0.15 })); cab.position.y = 32.5; T.add(cab);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, 0.8, 10), STD('#d9d6cf')); roof.position.y = 35.4; T.add(roof);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6), STD('#888')); ant.position.y = 38.5; T.add(ant);
  T.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); window.TOWER = T; }
{ const t = new THREE.Mesh(new THREE.BoxGeometry(140, 14, 30), STD('#dfe3e8')); t.position.set(-230, 7, -150); t.castShadow = t.receiveShadow = true; scene.add(t);
  const gl = new THREE.Mesh(new THREE.BoxGeometry(140.2, 5, 30.2), STD('#2c4a66', { metalness: 0.5, roughness: 0.2 })); gl.position.set(-230, 8, -150); scene.add(gl); }
// windsock
{ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6), STD('#ddd')); p.position.set(40, 3, -40); scene.add(p); const sg = new THREE.ConeGeometry(0.6, 3, 12, 1, true); sg.rotateZ(PI / 2); const s = new THREE.Mesh(sg, STD('#ff6a00', { side: THREE.DoubleSide })); s.position.set(41.5, 5.6, -40); scene.add(s); }

// ---------------- plane ----------------
const planeG = new THREE.Group(); scene.add(planeG);       // nose towards local -z
{ const wh = STD('#f7f7f5', { roughness: 0.35, metalness: 0.15 }), bl = STD('#1d4f9c', { roughness: 0.4 }), gr = STD('#9aa1a9', { metalness: 0.5, roughness: 0.35 });
  const livT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#f7f7f5'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d4f9c'; c.fillRect(0, h * 0.62, w, h * 0.14); c.fillStyle = '#ffb300'; c.fillRect(0, h * 0.76, w, h * 0.04);
    c.fillStyle = '#26323e'; for (let x = 60; x < w - 60; x += 22) { c.beginPath(); c.roundRect(x, h * 0.42, 11, 16, 5); c.fill(); }
    c.fillStyle = '#1d4f9c'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText('PLOT TWIST AIR', w * 0.45, h * 0.34); });
  livT.wrapS = THREE.RepeatWrapping;
  const fg = new THREE.CylinderGeometry(2.1, 2.1, 30, 32, 1, true); fg.rotateX(PI / 2); // along z
  // uv: map texture so the window row faces +x side and -x side
  const fus = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ map: livT, roughness: 0.35, metalness: 0.1, side: THREE.DoubleSide })); planeG.add(fus);
  livT.center.set(0.5, 0.5); livT.rotation = PI / 2; livT.repeat.set(1, 1); fus.rotation.z = 0;
  const nose = new THREE.Mesh(new THREE.SphereGeometry(2.1, 32, 16, 0, 2 * PI, 0, PI / 2), wh); nose.rotation.x = -PI / 2; nose.scale.set(1, 1, 2.0); nose.position.z = -15; planeG.add(nose);
  nose.scale.set(1, 2.0, 1);
  const tailG = new THREE.CylinderGeometry(2.1, 0.5, 9, 32, 1, true); tailG.rotateX(PI / 2); const tail = new THREE.Mesh(tailG, new THREE.MeshStandardMaterial({ color: '#f7f7f5', side: THREE.DoubleSide, roughness: 0.35 })); tail.position.set(0, 0.7, 19.5); tail.rotation.x = -0.12; planeG.add(tail);
  const wingS = new THREE.Shape(); wingS.moveTo(0, -3.5); wingS.lineTo(17, 3.2); wingS.lineTo(17, 5.0); wingS.lineTo(0, 4.0); wingS.lineTo(0, -3.5);
  for (const s of [-1, 1]) { const g = new THREE.ExtrudeGeometry(wingS, { depth: 0.35, bevelEnabled: false }); g.rotateX(PI / 2); const m = new THREE.Mesh(g, wh); m.scale.x = s; m.position.set(0, -0.9, 0); planeG.add(m);
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.0, 4.2, 24), gr); eng.rotation.x = PI / 2; eng.position.set(s * 6.2, -2.1, -0.9); planeG.add(eng);
    const ein = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), STD('#222')); ein.position.set(s * 6.2, -2.1, -3.02); ein.rotation.y = PI; planeG.add(ein);
    const hs = new THREE.ExtrudeGeometry((() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(6.5, 2.6); sh.lineTo(6.5, 4.0); sh.lineTo(0, 3.4); sh.lineTo(0, 0); return sh; })(), { depth: 0.25, bevelEnabled: false }); hs.rotateX(PI / 2);
    const hm = new THREE.Mesh(hs, wh); hm.scale.x = s; hm.position.set(0, 1.2, 19.5); planeG.add(hm); }
  const finS = new THREE.Shape(); finS.moveTo(0, 0); finS.lineTo(6.5, 7.5); finS.lineTo(9, 7.5); finS.lineTo(8, 0); finS.lineTo(0, 0);
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(finS, { depth: 0.3, bevelEnabled: false }), bl); fin.rotation.y = -PI / 2; fin.position.set(0.15, 1.8, 15.5); planeG.add(fin);
  // gear
  for (const [x, z] of [[0, -11.5], [-2.6, 1.2], [2.6, 1.2]]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.6), gr); st.position.set(x, -2.6, z); planeG.add(st); const wl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 18), STD('#1b1b1d')); wl.rotation.z = PI / 2; wl.position.set(x, -3.4, z); planeG.add(wl); }
  planeG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
// cockpit window decal with pilots
const pilotT = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#1a2a3a'; c.beginPath(); c.roundRect(0, 0, w, h, 30); c.fill();
  for (const [cx, k] of [[150, 0], [362, 1]]) { c.fillStyle = '#f2c7a5'; c.beginPath(); c.arc(cx, 98, 42, 0, 2 * PI); c.fill(); c.fillStyle = '#10243e'; c.fillRect(cx - 50, 40, 100, 26); c.fillRect(cx - 36, 22, 72, 26); c.fillStyle = '#ffcc00'; c.fillRect(cx - 12, 30, 24, 10);
    c.fillStyle = '#111'; c.beginPath(); c.arc(cx - 15, 96, 6, 0, 2 * PI); c.arc(cx + 15, 96, 6, 0, 2 * PI); c.fill(); c.strokeStyle = '#7a2b2b'; c.lineWidth = 5; c.beginPath(); c.arc(cx, 108, 15, 0.15 * PI, 0.85 * PI); c.stroke(); }
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 10; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); });
pilotT.center.set(0.5, 0.5); pilotT.rotation = PI;
const cockpit = new THREE.Mesh(new THREE.SphereGeometry(2.1 * 1.015, 32, 8, PI / 2 - 0.75, 1.5, 0.42, 0.42), new THREE.MeshBasicMaterial({ map: pilotT, toneMapped: false, side: THREE.DoubleSide })); cockpit.rotation.x = -PI / 2; cockpit.scale.set(1, 2.0, 1); cockpit.position.z = -15; planeG.add(cockpit);
// landing lights (sprites)
const blobT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const LL = [[-3.2, -1.2, -2.2], [3.2, -1.2, -2.2], [0, -2.2, -11.9]].map(p => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#fff6d8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.position.set(...p); s.scale.setScalar(2.6); planeG.add(s); return s; });

// ---------------- cars ----------------
const hero = makeCar('#1e88e5');
// little wings for take-off
const heroWings = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.92, 0.75, 0.1); hero.add(g); const w = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.1), STD('#e8e8e8', { metalness: 0.4, roughness: 0.3 })); w.position.x = s * 1.3; g.add(w);
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.6), STD('#1d4f9c')); tip.position.set(s * 2.6, 0.2, 0.15); g.add(tip); g.visible = false; return g; });
const flightT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h); c.fillStyle = '#1d4f9c'; c.font = '900 44px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PT 067', w / 2, h / 2); });
const doorTxt = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.38), new THREE.MeshBasicMaterial({ map: flightT, transparent: true })); m.position.set(s * 0.94, 0.62, 0.1); m.rotation.y = s * PI / 2; hero.userData.bodyG.add(m); m.visible = false; return m; });
// waving arm (driver side = left = -x)
const arm = new THREE.Group(); arm.position.set(-0.85, 1.12, -0.25); hero.userData.bodyG.add(arm);
{ const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8), STD('#2f5d8a')); a.position.y = 0.35; arm.add(a); const hnd = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), STD('#f2c7a5')); hnd.position.y = 0.75; arm.add(hnd); arm.visible = false; }
// follow-me car
const fm = makeCar('#f5c400');
{ const chk = canvasTex(256, 32, (c, w, h) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#111' : '#f5c400'; c.fillRect(i * 16, j * 16, 16, 16); } });
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.24), new THREE.MeshBasicMaterial({ map: chk })); m.position.set(s * 0.935, 0.66, 0.0); m.rotation.y = s * PI / 2; fm.userData.bodyG.add(m); }
  const fT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd21a'; c.font = '900 84px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FOLLOW ME', w / 2, h / 2 + 4); });
  const box_ = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 0.5), STD('#111')); box_.position.set(0, 1.95, 0.25); fm.userData.bodyG.add(box_);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.46, 0.38), new THREE.MeshBasicMaterial({ map: fT, toneMapped: false })); f.position.set(0, 1.95, 0.25 + s * 0.26); if (s < 0) f.rotation.y = PI; fm.userData.bodyG.add(f); }
  const bc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.25, 14), new THREE.MeshBasicMaterial({ color: '#ff9800', toneMapped: false })); bc.position.set(0, 1.75, -0.5); fm.userData.bodyG.add(bc); fm.userData.beacon = bc;
  const bs = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#ffab00', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); bs.scale.setScalar(1.6); bs.position.set(0, 1.8, -0.5); fm.userData.bodyG.add(bs); fm.userData.bsp = bs; }
// a few parked cars on the far side road + oncoming car waiting
const WAITERS = [[-ROADX, -HOLD - 3.2, PI, '#e53935'], [-ROADX, -HOLD - 10, PI, '#ffffff'], ].map(([x, z, h, c]) => { const k = makeCar(c); placeCar(k, { x, z, h }); k.userData.prev = null; return { k, x, z, h }; });

// ---------------- motion ----------------
const zHook = mono([[0, 150], [tOn, 84], [tWhat, 52], [S('hook2').end + 0.6, 48.5]]);
// wrong: from the junction approach turn left onto the runway
const WPATH = roundedPath([[ROADX, 48.5], [ROADX, 0], [-2600, 0]], 11);
const vW = mono([[S('wrong1').start - 0.3, 0], [tDrivers, 8], [tTurnW + 0.5, 11], [tPlaneW, 17], [tLanding, 32], [tAt + 1, 44], [tTake, 72], [tFlight, 80]]);
const sW = integ(t => t < S('wrong1').start - 0.3 ? 0 : vW(t), S('wrong1').start - 0.3, TOTAL, 0);
const yW = mono([[tTake - 0.1, 0], [tTake + 0.8, 3], [tYourW + 0.4, 14], [tRew0, 40]]);
const pitchW = mono([[tTake - 0.2, 0], [tTake + 0.3, 0.16], [tRew0, 0.2]]);
function heroW(t) { if (t < S('wrong1').start - 0.3) return { x: ROADX, z: zHook(t), h: 0, y: 0, pitch: 0 }; const p = pathAt(WPATH, sW(t)); return { x: p.x, z: p.z, h: p.h, y: yW(t), pitch: pitchW(t) }; }
// plane relative to the hero in the wrong way: distance behind (+x) and height
const dPW = mono([[0, 900], [tAnd, 520], [tWhat, 420], [tCommon, 330], [tPlaneW - 0.3, 150], [tBehind, 70], [tLanding + 0.5, 48], [tTake, 44], [tFlight, 95], [tRew0, 160]]);
const yPW = mono([[0, 60], [tAnd, 42], [tCommon, 26], [tPlaneW, 10], [tBehind + 0.6, 3.9], [99, 3.9]]);
// right way
const zR = mono([[tRew1, zHook(REW_TARGET)], [tYellow, HOLD + 2.5], [99, HOLD + 2.5]]);
const FMP = roundedPath([[16, 28], [ROADX, 28], [ROADX, -400]], 5.5);
const sFM = mono([[tFollowMe - 0.5, 0], [tGuide - 0.1, 13.5], [tGuide + 0.2, 15], [tStay + 0.6, 56], [tGive, 70], [tGive + 0.4, 70.5]]);
function fmPose(t) { if (!isRight(t) || t < tFollowMe - 0.5) return { x: 16, z: 28, h: PI / 2 }; const p = pathAt(FMP, sFM(t)); return { x: p.x, z: p.z, h: p.h }; }
function heroR(t) { const z0 = zR(t); const f = fmPose(t); let z = z0; if (t > tGuide) z = Math.min(z0, f.z + 8.5); return { x: ROADX, z, h: 0, y: 0, pitch: 0 }; }
// plane in the right way (absolute along the runway, z = 0)
const tPass = tLandR + 0.15;
const xPR = mono([[tRew1, 900], [tStop, 520], [tPass, 0], [tSwitch + 0.8, -120], [tFollowMe + 0.5, -158], [tGuide + 0.5, -160]]);
const yPR = mono([[tRew1, 60], [tStop, 26], [tPass - 1.2, 3.9], [99, 3.9]]);
const tU0 = tGuide + 0.5, tU1 = tAcross + 1.6, tTaxi1 = tGive - 0.1;
function planeR(t) { if (t < tU0) return { x: xPR(t), y: yPR(t), z: 0, h: PI / 2 };
  const u = ramp(t, tU0, tU1); const a = PI / 2 - PI * u; const cx = -160, r = 9; // U-turn around a small circle
  if (t < tU1) return { x: cx - r * Math.sin(PI * u), y: 3.9, z: -r + r * Math.cos(PI * u) - 0, h: a };
  const k = mono([[tU1, -160], [tTaxi1, -48], [99, -48]])(t); return { x: k, y: 3.9, z: 0 - 0 * 1, h: -PI / 2 }; }
function planeW(t) { const hw = heroW(t); const dd = dPW(t); return { x: hw.x + (hw.z > 1 ? 40 : 0) + dd, y: yPW(t), z: 0, h: PI / 2 }; }

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HP = t => isRight(t) ? heroR(t) : heroW(t);
const HC = (off, look, fov = 40) => t => { const p = HP(t); const fw = V3(-Math.sin(p.h), 0, -Math.cos(p.h)), rt = V3(Math.cos(p.h), 0, -Math.sin(p.h)); const b = V3(p.x, p.y || 0, p.z);
  return [b.clone().addScaledVector(rt, off[0]).add(V3(0, off[1], 0)).addScaledVector(fw, -off[2]), b.clone().addScaledVector(rt, look[0]).add(V3(0, look[1], 0)).addScaledVector(fw, look[2]), fov]; };
const RunCam = (dx, y, z, ldx, ly, fov = 40) => t => { const p = HP(t); return [V3(p.x + dx, y, z), V3(p.x + ldx, ly + (p.y || 0) * 0.6, 0), fov]; };
const PlaneLook = (off, fov, k = 0.75) => t => { const p = HP(t); const pp = isRight(t) ? planeR(t) : planeW(t); const nose = V3(pp.x - Math.sin(pp.h) * 16, pp.y + 0.8, pp.z - Math.cos(pp.h) * 16); const cp = V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]); return [cp, cp.clone().lerp(nose, 1).lerp(V3(p.x, 1.4, p.z), 1 - k), fov]; };
const camKeys = [
  [0.0, Ac([70, 60, 175], [0, 0, 20], 40)],
  [tYourH - 0.3, Ac([55, 48, 160], [0, 0, 30], 40)],
  ...cut(tYourH - 0.25, HC([0.4, 2.6, 9.5], [0, 1.0, 40], 40)),
  [tOn - 0.3, HC([0.4, 3.0, 11], [0, 1.0, 40], 40)],
  ...cut(tOn - 0.25, Ac([-4, 3.2, 31], [-90, 0, 0], 36)),
  [tAnd - 0.2, Ac([-7, 3.6, 31], [-90, 0, 0], 36)],
  ...cut(tAnd - 0.15, Ac([7, 2.4, 31], [300, 24, 0], 30)),
  [tWhat - 0.3, Ac([8, 2.6, 31], [300, 30, 0], 28)],
  ...cut(tWhat - 0.25, Ac([0.5, 150, 52], [0.5, 0, 22], 40)),
  [S('hook2').end + 0.6, Ac([0.5, 158, 54], [0.5, 0, 22], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, HC([0.6, 2.6, 9.5], [0, 1.0, 30], 40)),
  [tTurnW + 0.3, HC([1.0, 2.8, 10], [0, 1.0, 30], 40)],
  ...cut(tBehind - 0.4, HC([0.8, 2.2, -14], [0, 6, -60], 44)),
  [tLanding - 0.2, HC([0.8, 2.0, -13], [0, 6, -60], 44)],
  ...cut(tLanding - 0.15, RunCam(-12, 6, 88, 22, 4, 55)),
  [tAt - 0.2, RunCam(-14, 6, 90, 24, 4, 55)],
  ...cut(tAir - 0.25, Ac([-60, 14, -36], [-110, 31, -90], 32)),
  [tCleared - 0.25, Ac([-61, 14, -37], [-110, 31, -90], 32)],
  ...cut(tCleared - 0.2, RunCam(-3, 2.6, 18, -0.5, 2.0, 44)),
  [tYourW - 0.2, RunCam(-5, 5, 22, -1, 5, 44)],
  ...cut(tYourW - 0.15, HC([3.2, -0.3, 12], [0.6, 1.2, 4], 40)),
  [tRew0, HC([3.6, -0.8, 13], [0.6, 1.4, 4], 40)],
  // right
  ...cut(tRew1, Ac([0.5, 158, 54], [0.5, 0, 22], 40)),
  ...cut(tStop - 0.15, HC([0.5, 2.8, 10], [0, 1.0, 30], 40)),
  [tYellow - 0.2, HC([0.5, 2.6, 9.5], [0, 0.6, 20], 40)],
  ...cut(tWait - 0.2, Ac([ROADX + 0.5, 6.5, 62], [2, 3, 0], 50)),
  [S('right2').end + 0.2, Ac([ROADX + 0.5, 6.5, 62], [-6, 3, 0], 50)],
  ...cut(tSwitch - 0.15, HC([-1.0, 3.2, 10.5], [2, 0.8, 12], 42)),
  ...cut(tFollowMe - 0.4, Ac([10, 2.6, 21], [4, 1.0, 33], 46)),
  [tGuide - 0.3, Ac([10, 2.8, 20], [3, 1.0, 32], 46)],
  ...cut(tGuide - 0.25, Ac([0.5, 128, 26], [0.5, 0, 2], 40)),
  [tStay - 0.3, Ac([0.5, 132, 24], [0.5, 0, 0], 40)],
  ...cut(tStay - 0.25, HC([0.8, 2.8, 10], [0, 1.0, 20], 42)),
  [S('right4').end + 0.2, HC([0.8, 2.8, 10], [0, 1.0, 20], 42)],
  ...cut(tGive - 0.2, PlaneLook([4.5, 2.4, -7], 40, 0.55)),
  [S('right5').end + 0.2, PlaneLook([4.2, 2.3, -6.5], 38, 0.55)],
  ...cut(tPilot6 - 0.2, PlaneLook([-1.5, 2.3, -4.5], 22)),
  [S('right6').end + 0.3, PlaneLook([-1.5, 2.3, -4.5], 20)],
  ...cut(S('right7').start - 0.15, Ac([14, 10, -8], [-12, 3, -32], 44)),
  [TOTAL, Ac([16, 12, -4], [-14, 3, -34], 44)],
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
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.far = 3500; camera.updateProjectionMatrix();
  // hero
  const hp = HP(t); placeCar(hero, { x: hp.x, z: hp.z, h: hp.h, y: hp.y, pitch: hp.pitch });
  const air = !right && t > tTake - 0.1;
  if (air) { hero.userData.bodyG.rotation.set(0, 0, 0); }
  const wu = !right ? ramp(t, tCleared - 0.1, tCleared + 0.5) : 0; heroWings.forEach(g => { g.visible = wu > 0.01; g.scale.set(Math.max(0.01, back(wu)), 1, 1); });
  doorTxt.forEach(m => m.visible = !right && t > tYourW + 0.3);
  blink(hero, t, right && t > tHazard - 0.1 && t < tGive, right && t > tHazard - 0.1 && t < tGive);
  if (!right) blink(hero, t, t > tDrivers && t < tTurnW + 0.6, false);
  hero.userData.tl.emissiveIntensity = right && t > tYellow - 0.3 && t < tGuide ? 1.8 : 0.4;
  arm.visible = right && t > tGive - 0.1 && t < tPilot6 + 0.3; arm.rotation.z = 0.5 + 0.45 * Math.sin(t * 9); arm.rotation.x = -0.1;
  // follow-me
  const f = fmPose(t); placeCar(fm, { x: f.x, z: f.z, h: f.h }); const bOn = Math.sin(t * 9) > 0; fm.userData.bsp.material.opacity = right ? (bOn ? 0.9 : 0.15) : 0; fm.userData.beacon.material.color.set(right && bOn ? '#ffb300' : '#a35a00');
  // plane
  const pp = right ? planeR(t) : planeW(t); planeG.position.set(pp.x, pp.y, pp.z); planeG.rotation.set(0, pp.h, 0, 'YXZ');
  if (pp.y > 4.2) planeG.rotation.x = -0.06 * clamp((pp.y - 4) / 20) - 0.05;   // nose up on approach
  const flash = right ? Math.max(win(t, tFlashes - 0.05, tFlashes + 0.35, 0.05), win(t, tFlashes + 0.6, tFlashes + 0.95, 0.05), win(t, tThat + 0.1, tThat + 0.45, 0.05)) : 0;
  const onApp = (pp.y > 4.5 ? 0.85 : 0.35);
  LL.forEach(s => { s.material.opacity = Math.max(onApp * (right && t > tPass + 2 ? 0 : 1), flash); s.scale.setScalar(2.6 + 10 * flash); });
  // stop lights at the holding points: flashing red while a plane is close
  const danger = Math.abs(pp.x) < 650 && (right ? t < tPass + 1.5 || (t > tU1 && t < TOTAL && false) : true);
  stopLights.forEach(([a, b]) => { const on = danger ? (Math.floor(t * 2.2) % 2 === 0) : false; a.material.color.set(danger && on ? '#ff1a1a' : '#330000'); b.material.color.set(danger && !on ? '#ff1a1a' : '#330000'); });
  WAITERS.forEach(w => { placeCar(w.k, { x: w.x, z: w.z, h: w.h }); w.k.userData.prev = null; w.k.userData.tl.emissiveIntensity = 1.4; });
  applyCam(c, t, !right && t > tBehind && t < tTake ? 0.06 : 0);
  if (window.DBGCAM) { const d = window.DBGCAM(planeG); camera.position.copy(d[0]); camera.lookAt(d[1]); camera.fov = 30; camera.updateProjectionMatrix(); }
  camera.updateMatrixWorld(true);
  screen = { hero: project(hero.localToWorld(V3(0, 1.0, 0))), plane: project(planeG.localToWorld(V3(0, 0, -6))) };
}

// ---------------- HUD (explainer style) ----------------
const NAVY = '#0b2545', ACC = '#3d8bfd';
function lowerThird(title, sub, a, b, t, accent = ACC) {
  const f = win(t, a, b, 0.25); if (f <= 0) return; const k = easeOut(clamp((t - a) / 0.35));
  ctx.save(); ctx.globalAlpha = f; const x = 70 - 40 * (1 - k), y = 1500, w = 940, h = sub ? 190 : 130;
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(255,255,255,0.96)'; rr(x, y, w, h, 18); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = accent; rr(x, y, 16, h, 8); ctx.fill();
  ctx.fillStyle = NAVY; ctx.font = '800 62px Inter'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 50, y + (sub ? 64 : h / 2 + 2));
  if (sub) { ctx.fillStyle = '#4a5a6e'; ctx.font = '600 44px Inter'; ctx.fillText(sub, x + 50, y + 136); }
  ctx.restore(); }
function chip(text, a, b, t, col = NAVY, y = 420) { pill(text, W / 2, y, col, '#fff', 44, win(t, a, b, 0.2), 1); }
function titleCard(t, a, b) { const f = win(t, a, b, 0.35); if (f <= 0) return; const k = easeOut(clamp((t - a) / 0.5));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 760 + 30 * (1 - k)); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(255,255,255,0.97)'; rr(-430, -170, 860, 340, 26); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = ACC; rr(-430, -170, 860, 16, 8); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4a5a6e'; ctx.font = '700 46px Inter'; ctx.fillText('LESSON 67', 0, -78);
  ctx.fillStyle = NAVY; ctx.font = '900 92px Inter'; ctx.fillText('RUNWAY', 0, 8); ctx.fillText('CROSSINGS', 0, 104); ctx.restore(); }
function satnav(t, a, b) { const f = win(t, a, b, 0.25); if (f <= 0) return; const k = back(clamp((t - a) / 0.4));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1560); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.fillStyle = '#122033'; rr(-330, -120, 660, 240, 30); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#2e7df6'; rr(-310, -100, 200, 200, 22); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-190, 70); ctx.lineTo(-190, -10); ctx.lineTo(-250, -10); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-275, -10); ctx.lineTo(-240, -45); ctx.lineTo(-240, 25); ctx.closePath(); ctx.fill();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.font = '900 70px Inter'; ctx.fillText('TURN LEFT', -80, -30); ctx.fillStyle = '#9fb3c8'; ctx.font = '700 46px Inter'; ctx.fillText('in 50 m', -80, 45); ctx.restore(); }
function dashedPath(pts, col, t, a, b, label) { const f = win(t, a, b, 0.25); if (f <= 0) return; const P = pts.map(p => project(V3(...p))); const u = clamp((t - a) / 0.9);
  ctx.save(); ctx.globalAlpha = f; ctx.strokeStyle = col; ctx.lineWidth = 16; ctx.setLineDash([34, 22]); ctx.lineCap = 'round'; ctx.beginPath();
  let tot = 0; const seg = []; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); seg.push(d); tot += d; }
  let rem = tot * u; ctx.moveTo(P[0].x, P[0].y); let last = P[0], dir = [0, -1];
  for (let i = 1; i < P.length && rem > 0; i++) { const d = seg[i - 1], k = Math.min(1, rem / d); const x = lerp(P[i - 1].x, P[i].x, k), y = lerp(P[i - 1].y, P[i].y, k); ctx.lineTo(x, y); dir = [P[i].x - P[i - 1].x, P[i].y - P[i - 1].y]; last = { x, y }; rem -= d; }
  ctx.stroke(); ctx.setLineDash([]); const L_ = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / L_, dy = dir[1] / L_;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(last.x + dx * 34, last.y + dy * 34); ctx.lineTo(last.x - dy * 26, last.y + dx * 26); ctx.lineTo(last.x + dy * 26, last.y - dx * 26); ctx.closePath(); ctx.fill();
  if (label && u > 0.6) { ctx.font = '800 40px Inter'; const tw = ctx.measureText(label[0]).width + 40; ctx.fillStyle = col; rr(label[1] - tw / 2, label[2] - 34, tw, 68, 34); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label[0], label[1], label[2] + 2); }
  ctx.restore(); }
function tag(text, wp, t, a, b, col = NAVY) { const f = win(t, a, b, 0.2); if (f <= 0) return; const p = project(wp); if (!p.ok) return;
  ctx.save(); ctx.globalAlpha = f; ctx.font = '800 38px Inter'; const tw = ctx.measureText(text).width + 36; ctx.fillStyle = col; rr(p.x - tw / 2, p.y - 32, tw, 62, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, p.x, p.y + 1); ctx.restore(); }
function radioCard(t, a, b) { const f = win(t, a, b, 0.25); if (f <= 0) return; const k = back(clamp((t - a) / 0.4));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1560); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(255,255,255,0.97)'; rr(-450, -130, 900, 260, 24); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#4a5a6e'; ctx.font = '700 38px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('TOWER  →  BLUE CAR', -400, -70);
  ctx.fillStyle = NAVY; ctx.font = '800 54px Inter'; ctx.fillText('"Cleared for take-off,', -400, 5); ctx.fillText(' runway 09."', -400, 75); ctx.restore(); }
function boardCard(t, a, b) { const f = win(t, a, b, 0.25); if (f <= 0) return; const k = back(clamp((t - a) / 0.4));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1560); ctx.scale(k, k); ctx.fillStyle = '#111418'; rr(-460, -120, 920, 240, 18); ctx.fill();
  ctx.font = '800 36px Inter'; ctx.fillStyle = '#8a93a0'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('FLIGHT', -420, -70); ctx.fillText('TO', -150, -70); ctx.fillText('STATUS', 170, -70);
  ctx.font = '900 64px Inter'; ctx.fillStyle = '#ffc531'; ctx.fillText('PT 067', -420, 20); ctx.fillText('???', -150, 20); ctx.fillStyle = '#4cff6a'; ctx.fillText('DEPARTED', 170, 20); ctx.restore(); }
function hud(t) {
  const right = isRight(t);
  if (!right) {
    titleCard(t, tLesson - 0.1, tYourH - 0.2);
    satnav(t, tYourH - 0.1, tOn + 0.6);
    lowerThird('RUNWAY 09 / 27', 'Active runway', tOn + 0.2, tAnd - 0.1, t);
    lowerThird('AIRCRAFT ON APPROACH', 'Landing in 10 seconds', tAnd + 0.05, tWhat - 0.2, t, '#e0a100');
    dashedPath([[ROADX, 0, 46], [ROADX, 0, 6], [-4, 0, 0.5], [-60, 0, 0]], '#e53935', t, tWhat, S('hook2').end + 0.6, ['SAT-NAV', 340, 1060]);
    dashedPath([[ROADX + 2.5, 0, 46], [ROADX + 2.5, 0, -40]], '#16a34a', t, tWhat + 0.35, S('hook2').end + 0.6, ['?', 760, 1060]);
    tag('YOU', V3(ROADX, 2, 48), t, tWhat, S('hook2').end + 0.6, ACC);
    tag('RUNWAY', V3(40, 1, 0), t, tWhat + 0.2, S('hook2').end + 0.6);
    chip('COMMON MISTAKE', tCommon - 0.1, tPlaneW - 0.2, t, RED);
    lowerThird('FOLLOWING THE SAT-NAV', 'onto an active runway', tDrivers - 0.1, tRunwayW + 0.9, t, RED);
    lowerThird('AIRCRAFT BEHIND YOU', 'Landing speed: 250 km/h', tBehind - 0.1, tAt - 0.2, t, RED);
    lowerThird('AIR TRAFFIC CONTROL', 'treats your car as an aircraft', tAir - 0.15, tCleared - 0.25, t, RED);
    radioCard(t, tCleared - 0.2, tYourW - 0.15);
    boardCard(t, tYourW - 0.05, tRew0);
  } else {
    chip('STEP 1 · STOP AT THE HOLDING LINE', tStop - 0.1, tWait - 0.15, t, NAVY);
    tag('HOLDING LINE', V3(-2.2, 0.3, HOLD - 0.3), t, tYellow - 0.1, tWait - 0.15, '#c79a00');
    chip('STEP 2 · LET THE AIRCRAFT LAND', tWait - 0.1, tSwitch - 0.15, t, NAVY);
    chip('STEP 3 · HAZARD LIGHTS ON', tSwitch - 0.1, tWaitF - 0.15, t, NAVY);
    chip('STEP 4 · WAIT FOR THE FOLLOW-ME CAR', tWaitF - 0.1, tGuide - 0.25, t, NAVY);
    tag('FOLLOW-ME CAR', fm.localToWorld(V3(0, 3.2, 0)), t, tFollowMe - 0.1, tGuide - 0.25, '#c79a00');
    dashedPath([[ROADX - 2.6, 0, 36], [ROADX - 2.6, 0, -36]], '#16a34a', t, tGuide - 0.1, tStay - 0.25, ['SAFE CROSSING', 300, 960]);
    chip('STEP 5 · STAY CLOSE BEHIND IT', tStay - 0.2, S('right4').end + 0.2, t, NAVY);
    chip('STEP 6 · WAVE TO THE PILOT', tGive - 0.1, tPilot6 - 0.2, t, NAVY);
    lowerThird('PILOTS APPRECIATE THIS', null, tPilots - 0.1, S('right5').end + 0.2, t, GREEN);
    lowerThird('LANDING LIGHTS FLASH', '= "Thank you"', tFlashes - 0.1, S('right6').end + 0.3, t, GREEN);
  }
}
window.dbg = { hero, planeR, planeW, heroW, heroR };
start(update, hud);
