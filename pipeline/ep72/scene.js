// Episode 67: Your sat-nav says turn left – but left is a runway, and a jet is coming in to land
// wrong: the sat-nav is always right, turn left onto the runway -> the jet touches down behind you, catching up fast ->
//        boing: up onto its roof, the jet takes off again with you on top; sat-nav: recalculating
// right: stop at the yellow line, let the jet land -> open the sunroof, two baguettes, wave it in like a marshaller ->
//        left, a bit more, stop: perfect parking nose to nose -> pilot drops a bag of peanuts (tiny parachute) ->
//        200 passengers applaud from the windows
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
const tSatH = WT('hook1', 'sat'), tFifty = WT('hook1', 'fifty'), tTurnH = WT('hook1', 'turn');
const tBut = WT('hook2', 'But'), tRunwayH = WT('hook2', 'runway'), tAnd = WT('hook2', 'And'), tJetH = WT('hook2', 'jet'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tAlways = WT('wrong1', 'always'), tSo = WT('wrong1', 'So'), tTurnW = WT('wrong1', 'turn'), tOnto = WT('wrong1', 'Onto');
const tTouches = WT('wrong2', 'touches'), tBehind = WT('wrong2', 'behind'), tAndW2 = WT('wrong2', 'And'), tCatching = WT('wrong2', 'catching'), tFast = WT('wrong2', 'Fast');
const tBoing = WT('wrong3', 'Boing'), tRoof = WT('wrong3', 'roof'), tAndW3 = WT('wrong3', 'And'), tTakes = WT('wrong3', 'takes'), tYourW = WT('wrong3', 'your'), tRecalc = WT('wrong3', 'recalculating');
const tStop = WT('right2', 'Stop'), tYellow = WT('right2', 'yellow'), tLet = WT('right2', 'let'), tLandR = WT('right2', 'land');
const tOpen = WT('right3', 'open'), tGrab = WT('right3', 'grab'), tBag = WT('right3', 'baguettes'), tWave = WT('right3', 'wave'), tLike = WT('right3', 'Like');
const tLeft = WT('right4', 'Left'), tBit = WT('right4', 'bit'), tStop4 = WT('right4', 'stop'), tPerfect = WT('right4', 'Perfect'), tNose = WT('right4', 'Nose');
const tPilot = WT('right5', 'pilot'), tImpressed = WT('right5', 'impressed'), tDrops = WT('right5', 'drops'), tPeanuts = WT('right5', 'peanuts');
const tTwoH = WT('right6', 'two'), tPass6 = WT('right6', 'passengers'), tApplaud = WT('right6', 'applaud');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world ----------------
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
for (const sz of [1]) { const g = new THREE.Group(); g.position.set(-5.8 * sz, 0, sz * (HOLD + 0.8)); g.rotation.y = sz > 0 ? 0 : PI; scene.add(g);
  const b = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 0.25), STD('#d11d1d')); b.position.y = 1.0; g.add(b); const f = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 0.98), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false })); f.position.set(0, 1.0, 0.13); g.add(f);
  for (const x of [-1.2, 1.2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), STD('#ccc')); p.position.set(x, 0.3, 0); g.add(p); } }
const stopLights = [];
for (const sz of [1]) { const g = new THREE.Group(); g.position.set(5.6 * sz, 0, sz * (HOLD + 0.6)); g.rotation.y = sz > 0 ? 0 : PI; scene.add(g);
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
    c.fillStyle = '#1d4f9c'; c.font = '900 64px Inter'; c.textAlign = 'center';  });
  livT.wrapS = THREE.RepeatWrapping;
  const fg = new THREE.CylinderGeometry(2.1, 2.1, 30, 32, 1, true); fg.rotateX(PI / 2); // along z
  // uv: map texture so the window row faces +x side and -x side
  const fus = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ map: livT, roughness: 0.35, metalness: 0.1, side: THREE.DoubleSide })); planeG.add(fus); window.FUS = fus;
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

// passenger-faces livery (swapped in for the applause)
const livFace = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#f7f7f5'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d4f9c'; c.fillRect(0, h * 0.62, w, h * 0.14); c.fillStyle = '#ffb300'; c.fillRect(0, h * 0.76, w, h * 0.04);
  const R = rng(67); const skins = ['#f2c7a5', '#e0a77e', '#c68863', '#8d5a3b', '#f5d0b5'], hair = ['#3b2a1e', '#111', '#d8b25a', '#8a4a20', '#aaa'];
  for (let x = 60; x < w - 60; x += 22) { c.fillStyle = '#26323e'; c.beginPath(); c.roundRect(x - 2, h * 0.42 - 3, 15, 22, 6); c.fill();
    c.fillStyle = skins[R() * 5 | 0]; c.beginPath(); c.arc(x + 5.5, h * 0.42 + 9, 6, 0, 2 * PI); c.fill(); c.fillStyle = hair[R() * 5 | 0]; c.beginPath(); c.arc(x + 5.5, h * 0.42 + 6, 6, PI, 2 * PI); c.fill();
    c.fillStyle = '#111'; c.fillRect(x + 3, h * 0.42 + 9, 1.5, 1.5); c.fillRect(x + 7, h * 0.42 + 9, 1.5, 1.5); }
  c.fillStyle = '#1d4f9c'; c.font = '900 64px Inter'; c.textAlign = 'center';  });
livFace.wrapS = THREE.RepeatWrapping; livFace.center.set(0.5, 0.5); livFace.rotation = PI / 2;
const livBase = window.FUS.material.map;
const winT = k => canvasTex(2048, 64, (c, w, h) => { c.clearRect(0, 0, w, h); const R = rng(670); const skins = ['#f2c7a5', '#e0a77e', '#c68863', '#8d5a3b', '#f5d0b5'], hair = ['#3b2a1e', '#111', '#d8b25a', '#8a4a20', '#888'];
  for (let i = 0; i < 46; i++) { const x = 20 + i * 44; c.fillStyle = '#26323e'; c.beginPath(); c.roundRect(x, 6, 30, 52, 12); c.fill(); if (k < 0) continue;
    const sk = skins[R() * 5 | 0], hr = hair[R() * 5 | 0], ph = R() > 0.5 ? k : 1 - k; c.save(); c.beginPath(); c.roundRect(x, 6, 30, 52, 12); c.clip();
    c.fillStyle = sk; c.beginPath(); c.arc(x + 15, 40, 11, 0, 2 * PI); c.fill(); c.fillStyle = hr; c.beginPath(); c.arc(x + 15, 35, 11, PI, 2 * PI); c.fill();
    c.fillStyle = '#111'; c.fillRect(x + 10, 40, 3, 3); c.fillRect(x + 17, 40, 3, 3); c.strokeStyle = '#7a2b2b'; c.lineWidth = 2; c.beginPath(); c.arc(x + 15, 45, 4, 0.1 * PI, 0.9 * PI); c.stroke();
    c.fillStyle = sk; const d = ph ? 5 : 1; c.beginPath(); c.arc(x + 15 - d - 3, 18, 4.5, 0, 2 * PI); c.arc(x + 15 + d + 3, 18, 4.5, 0, 2 * PI); c.fill(); c.restore(); } });
const WIN0 = winT(-1), WINA = winT(0), WINB = winT(1);
const winM = new THREE.MeshBasicMaterial({ map: WIN0, transparent: true, toneMapped: false });
for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(24, 0.62), winM); m.position.set(sx * 2.13, 0.55, 0.5); m.rotation.y = sx * PI / 2; m.userData.noAO = true; planeG.add(m); }

// ---------------- cars ----------------
const hero = makeCar('#1e88e5');
// open sunroof + two arms with baguettes
const sunroof = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.6), new THREE.MeshBasicMaterial({ color: '#15191e' })); sunroof.rotation.x = -PI / 2; sunroof.position.set(0, 1.652, 0.02); hero.userData.bodyG.add(sunroof); sunroof.visible = false;
const arms = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.2, 1.5, 0.02); hero.userData.bodyG.add(g);
  const a = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.8, 8), STD('#f4f4f4')); a.position.y = 0.4; g.add(a);
  const hnd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), STD('#f2c7a5')); hnd.position.y = 0.84; g.add(hnd);
  const bg = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.75, 4, 10), STD('#d99a4e', { roughness: 0.8 })); bg.position.set(0, 1.05, -0.05); bg.rotation.x = 0.25; g.add(bg);
  for (let k = -1; k <= 1; k++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.14), STD('#f2d19b')); sl.position.set(0, 1.05 + k * 0.22, -0.13 + k * 0.05); sl.rotation.x = 0.25; g.add(sl); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.visible = false; return g; });
// peanut bag on a tiny parachute
const nut = new THREE.Group(); scene.add(nut);
{ const bagT = canvasTex(128, 160, (c, w, h) => { c.fillStyle = '#d62828'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23a'; c.fillRect(0, 50, w, 60); c.fillStyle = '#7a3e12'; c.font = '900 30px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PEA-', w / 2, 68); c.fillText('NUTS', w / 2, 96); });
  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.12), [STD('#d62828'), STD('#d62828'), STD('#d62828'), STD('#d62828'), new THREE.MeshStandardMaterial({ map: bagT }), new THREE.MeshStandardMaterial({ map: bagT })]); bag.position.y = 0.28; nut.add(bag); bag.castShadow = true;
  const can = new THREE.Group(); can.position.y = 1.6; nut.add(can); nut.userData.can = can;
  const cT = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff' : '#e53935'; c.fillRect(i * 32, 0, 32, h); } });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 8, 0, 2 * PI, 0, PI / 2.3), new THREE.MeshStandardMaterial({ map: cT, side: THREE.DoubleSide })); can.add(dome); dome.castShadow = true;
  const lg = new THREE.BufferGeometry().setFromPoints([V3(-0.6, 0.35, 0), V3(-0.15, -1.0, 0), V3(0.6, 0.35, 0), V3(0.15, -1.0, 0), V3(0, 0.35, 0.6), V3(0, -1.0, 0.05), V3(0, 0.35, -0.6), V3(0, -1.0, -0.05)]);
  can.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#eee' }))); nut.visible = false; }

// ---------------- motion ----------------
const PLY = 3.9, ROOF = [0, 2.02, -4.5];
const zHook = mono([[0, 150], [tBut, 84], [tWhat, 52], [S('hook2').end + 0.6, 48.5]]);
const W1 = S('wrong1').start;
const WPATH = roundedPath([[ROADX, 48.5], [ROADX, 0], [-2600, 0]], 11);
const vW = mono([[W1 - 0.3, 0], [tAlways, 6], [tTurnW, 11], [tOnto + 0.5, 15], [tTouches, 22], [tCatching, 26], [tBoing, 28], [99, 28]]);
const sW = integ(t => t < W1 - 0.3 ? 0 : vW(t), W1 - 0.3, TOTAL, 0);
function heroG(t) { if (t < W1 - 0.3) return { x: ROADX, z: zHook(t), h: 0, y: 0, pitch: 0 }; const p = pathAt(WPATH, sW(t)); return { x: p.x, z: p.z, h: p.h, y: 0, pitch: 0 }; }
// plane (wrong way): distance ahead of the ground car along +x
const dPW = mono([[0, 900], [tAnd, 430], [tWhat, 300], [W1, 255], [tTurnW, 195], [tOnto + 0.5, 150], [tTouches, 95], [tBehind, 72], [tCatching, 46], [tFast, 33], [tBoing, 21], [tBoing + 0.6, 9], [tTakes, -8], [tRew0, -260]]);
const yPW = mono([[0, 75], [tAnd, 40], [tWhat, 25], [W1, 21], [tTurnW, 14], [tTouches - 0.05, PLY], [tTakes, PLY], [tTakes + 1.6, 13], [tRew0, 70]]);
const pPW = mono([[0, 0.06], [tTouches - 0.4, 0.08], [tTouches + 0.3, 0], [tTakes - 0.1, 0], [tTakes + 0.8, 0.2], [tRew0, 0.22]]);
function planeW(t) { const g = heroG(t); return { x: g.x + dPW(t), y: yPW(t), z: 0, h: PI / 2, pitch: pPW(t) }; }
// local -> world for the plane pose (rotation order YXZ: R = Ry(h) * Rx(pitch))
function pl2w(pp, v) { const cp = Math.cos(pp.pitch || 0), sp = Math.sin(pp.pitch || 0); const y1 = v[1] * cp - v[2] * sp, z1 = v[1] * sp + v[2] * cp;
  const ch = Math.cos(pp.h), sh = Math.sin(pp.h); return V3(pp.x + v[0] * ch + z1 * sh, pp.y + y1, pp.z - v[0] * sh + z1 * ch); }
const tHop0 = tBoing - 0.05, tHop1 = tBoing + 0.6;
function heroW(t) { const g = heroG(t); if (t < tHop0) return g; const pp = planeW(t); const r = pl2w(pp, ROOF); const u = ease(ramp(t, tHop0, tHop1));
  return { x: lerp(g.x, r.x, u), y: lerp(0, r.y, u) + 4.5 * Math.sin(PI * u), z: lerp(g.z, r.z, u), h: PI / 2, pitch: lerp(0, pp.pitch, u) + 0.5 * Math.sin(PI * u) * (1 - u) }; }
// right way
const HOLDZ = HOLD + 2.5;
const zR = mono([[tRew1, zHook(REW_TARGET)], [tYellow + 0.3, HOLDZ], [99, HOLDZ]]);
function heroR(t) { return { x: ROADX, z: zR(t), h: 0, y: 0, pitch: 0 }; }
const PZ = 4.8;
const RP = roundedPath([[1400, 0], [-90, 0], [-90, -50], [ROADX, -50], [ROADX, PZ]], 13);
const tPass = tLandR + 0.25;
const sPR = mono([[tRew1, 500], [tStop, 860], [tPass, 1400], [tPass + 2.6, 1468], [tLeft, RP.len - 13], [tBit + 0.2, RP.len - 4], [tStop4 + 0.25, RP.len], [99, RP.len]]);
const yPR = mono([[tRew1, 60], [tStop, 27], [tPass - 1.1, PLY], [99, PLY]]);
const pPR = mono([[tRew1, 0.06], [tPass - 1.3, 0.08], [tPass - 0.6, 0], [99, 0]]);
function planeR(t) { const p = pathAt(RP, sPR(t)); return { x: p.x, z: p.z, h: p.h, y: yPR(t), pitch: pPR(t) }; }
const HP = t => isRight(t) ? heroR(t) : heroW(t);
const PP = t => isRight(t) ? planeR(t) : planeW(t);

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HC = (off, look, fov = 40) => t => { const p = HP(t); const fw = V3(-Math.sin(p.h), 0, -Math.cos(p.h)), rt = V3(Math.cos(p.h), 0, -Math.sin(p.h)); const b = V3(p.x, p.y || 0, p.z);
  return [b.clone().addScaledVector(rt, off[0]).add(V3(0, off[1], 0)).addScaledVector(fw, -off[2]), b.clone().addScaledVector(rt, look[0]).add(V3(0, look[1], 0)).addScaledVector(fw, look[2]), fov]; };
const WC = (off, look, fov = 40) => t => { const p = HP(t); return [V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2]), fov]; };
const PC = (off, look, fov = 40) => t => { const p = PP(t); return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + look[0], p.y + look[1], p.z + look[2]), fov]; };
const camKeys = [
  [0.0, WC([0.8, 5.2, 14], [0, 1.2, -14], 40)],
  [tFifty - 0.3, WC([0.6, 4.4, 12.5], [0, 1.2, -14], 40)],
  ...cut(tFifty - 0.25, HC([0.4, 2.6, 9.5], [0, 1.0, 40], 40)),
  [tBut - 0.3, HC([0.4, 2.9, 10.5], [0, 1.0, 40], 40)],
  ...cut(tBut - 0.25, Ac([-4, 3.2, 31], [-90, 0, 0], 36)),
  [tAnd - 0.2, Ac([-7, 3.6, 31], [-90, 0, 0], 36)],
  ...cut(tAnd - 0.15, Ac([7, 2.4, 31], [300, 24, 0], 30)),
  [tWhat - 0.3, Ac([8, 2.6, 31], [300, 30, 0], 28)],
  ...cut(tWhat - 0.25, t => [V3(-14, 3.5, 53.8), V3(planeW(t).x, planeW(t).y - 4, 0), 38]),
  [W1 - 0.2, t => [V3(-14.5, 3.6, 54), V3(planeW(t).x, planeW(t).y - 4, 0), 38]],
  // wrong
  ...cut(W1 - 0.15, HC([0.6, 2.6, 9.5], [0, 1.0, 30], 40)),
  [tOnto + 0.6, HC([1.0, 2.8, 10], [0, 1.0, 30], 40)],
  ...cut(tTouches - 0.3, HC([0.8, 2.2, -15], [0, 5, -60], 44)),
  [tBoing - 0.45, HC([0.8, 2.0, -13], [0, 5, -60], 44)],
  ...cut(tBoing - 0.4, WC([-6, 7, 58], [-2, 4, 0], 42)),
  [tTakes - 0.25, WC([-10, 8, 60], [-4, 4, -2], 42)],
  ...cut(tTakes - 0.2, PC([110, 2, 35], [0, 3, 0], 36)),
  [tYourW - 0.25, PC([100, 6, 40], [0, 3, 0], 36)],
  ...cut(tYourW - 0.2, WC([7, 2.2, 11], [0, 0.9, 0], 40)),
  [tRew0, WC([8, 3.2, 12], [0, 0.9, 0], 40)],
  // right
  ...cut(tRew1, HC([0.5, 2.8, 10], [0, 1.0, 30], 40)),
  [tLandR - 0.6, HC([0.6, 3.0, 11], [-2, 2.0, 40], 40)],
  [S('right2').end + 0.2, HC([0.6, 3.0, 11], [-3, 2.0, 40], 40)],
  ...cut(tOpen - 0.2, HC([3.2, 3.0, -6.5], [0, 1.6, 0], 40)),
  [tWave - 0.25, HC([3.4, 3.2, -6.8], [0, 1.7, 0], 40)],
  ...cut(tWave - 0.2, Ac([ROADX + 2.2, 5.2, HOLDZ + 11], [-12, 3.5, -10], 42)),
  [tLeft - 0.25, Ac([ROADX + 2.4, 5.4, HOLDZ + 11.5], [-6, 3.5, -10], 42)],
  ...cut(tLeft - 0.2, Ac([ROADX + 2.5, 6.2, HOLDZ + 13], [ROADX - 1, 2.6, 8], 42)),
  [tPerfect - 0.2, Ac([ROADX + 2.3, 6.0, HOLDZ + 12], [ROADX - 0.5, 2.6, 10], 42)],
  ...cut(tPerfect - 0.15, Ac([ROADX - 11, 12, 53], [ROADX + 1.5, 2.5, 30], 40)),
  [S('right4').end + 0.2, Ac([ROADX - 12, 12.5, 54], [ROADX + 1.5, 2.5, 30], 40)],
  ...cut(S('right5').start - 0.15, Ac([ROADX + 7, 7, 37], [ROADX, 5.0, 21], 36)),
  ...cut(tDrops - 0.1, Ac([ROADX - 9, 5.5, 46], [ROADX, 3.4, 31], 40)),
  [S('right5').end + 0.3, Ac([ROADX - 9.5, 5.2, 47], [ROADX, 2.6, 34], 40)],
  ...cut(S('right6').start - 0.15, Ac([ROADX + 22, 5.6, -4], [ROADX, 4.6, -4], 32)),
  [S('right6').end + 0.4, Ac([ROADX + 21, 5.6, -5], [ROADX, 4.6, -4.5], 32)],
  ...cut(S('right7').start - 0.15, Ac([16, 13, 58], [ROADX, 2, 30], 42)),
  [TOTAL, Ac([18, 15, 62], [ROADX, 2, 29], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _q2 = new THREE.Quaternion(), _e = new THREE.Euler();
function update(t) {
  const right = isRight(t);
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.far = 3500; camera.updateProjectionMatrix();
  // plane
  const pp = PP(t); planeG.position.set(pp.x, pp.y, pp.z); planeG.rotation.set(pp.pitch || 0, pp.h, 0, 'YXZ');
  // hero
  const hp = HP(t); placeCar(hero, { x: hp.x, z: hp.z, h: hp.h, y: hp.y, pitch: hp.pitch });
  if (!right && t > tHop1) { hero.userData.bodyG.rotation.set(0, 0, 0); hero.userData.bodyG.position.y = 0; }
  blink(hero, t, !right && t > tAlways && t < tTurnW + 0.8, false);
  if (right) blink(hero, t, false, false);
  hero.userData.tl.emissiveIntensity = right && t > tYellow - 0.3 && t < tOpen ? 1.8 : 0.4;
  // sunroof + baguette arms
  const ae = right ? ramp(t, tOpen + 0.1, tGrab + 0.2) : 0; sunroof.visible = right && t > tOpen - 0.05;
  arms.forEach((g, i) => { const s = i ? 1 : -1; g.visible = ae > 0.01; g.scale.set(1, Math.max(0.01, back(ae)), 1);
    let rz = s * 0.35, rx = 0;
    if (t > tWave - 0.2 && t < tLeft - 0.1) { rz = s * (0.55 + 0.45 * Math.sin(t * 7)); rx = -0.2; }           // wave in: up-down sweeps
    else if (t >= tLeft - 0.1 && t < tStop4 - 0.1) { rz = (s < 0 ? -(1.2 + 0.25 * Math.sin(t * 9)) : 0.25 + 0.15 * Math.sin(t * 9)); }   // "left": left arm out, waving
    else if (t >= tStop4 - 0.1 && t < tPerfect + 0.6) { rz = -s * 0.45; }                                 // stop: crossed
    else if (t >= tPerfect + 0.6) { rz = s * (0.4 + 0.2 * Math.sin(t * 5 + i)); }
    g.rotation.set(rx, 0, -rz); });
  // landing lights
  const app = pp.y > 4.5 ? 0.9 : (right && t > tLeft - 1 && t < tStop4 + 0.4 ? 0.8 : 0.3);
  LL.forEach(s => { s.material.opacity = app; s.scale.setScalar(2.6); });
  // livery swap for the applause
  winM.map = right && t > tPass6 - 0.3 ? (t > tApplaud - 0.1 && Math.floor(t * 7) % 2 ? WINB : WINA) : WIN0;
  // peanuts
  const n0 = tDrops + 0.05, n1 = tDrops + 1.9; nut.visible = right && t > n0;
  if (nut.visible) { const u = ramp(t, n0, n1), e = ease(u); const A = V3(ROADX, 5.4, PZ + 19.5), B = V3(ROADX, 1.66, HOLDZ + 0.15);
    nut.position.set(A.x, lerp(A.y, B.y, e) + 2.6 * Math.sin(PI * Math.min(1, u * 1.3)), lerp(A.z, B.z, easeOut(u))); nut.rotation.set(0.15 * Math.sin(t * 4) * (1 - u), 0.6, 0.1 * Math.sin(t * 3) * (1 - u));
    const cs = 1 - ramp(t, n1 + 0.05, n1 + 0.5); nut.userData.can.scale.setScalar(Math.max(0.01, cs)); nut.userData.can.visible = cs > 0.02; }
  // stop light flashes while a plane is near
  const danger = Math.abs(pp.x) < 650 && Math.abs(pp.z) < 30;
  stopLights.forEach(([a, b]) => { const on = danger ? (Math.floor(t * 2.2) % 2 === 0) : false; a.material.color.set(danger && on ? '#ff1a1a' : '#330000'); b.material.color.set(danger && !on ? '#ff1a1a' : '#330000'); });
  applyCam(c, t, !right && t > tBehind && t < tTakes ? 0.05 : 0);
  camera.updateMatrixWorld(true);
  screen = { hero: project(hero.localToWorld(V3(0, 1.0, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function satnav(t, a, b, l1, l2, arrow = true, Y = 1520) { const f = win(t, a, b, 0.25); if (f <= 0) return; const k = back(clamp((t - a) / 0.4));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, Y); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.fillStyle = '#122033'; rr(-360, -120, 720, 240, 30); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = arrow ? '#2e7df6' : '#e53935'; rr(-340, -100, 200, 200, 22); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (arrow) { ctx.beginPath(); ctx.moveTo(-220, 70); ctx.lineTo(-220, -10); ctx.lineTo(-280, -10); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-305, -10); ctx.lineTo(-270, -45); ctx.lineTo(-270, 25); ctx.closePath(); ctx.fill(); }
  else { const a0 = t * 6; ctx.beginPath(); ctx.arc(-240, 0, 52, a0, a0 + 4.6); ctx.stroke(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.font = `900 ${l1.length > 10 ? 44 : 70}px Inter`; ctx.fillText(l1, -110, -30); ctx.fillStyle = '#9fb3c8'; ctx.font = '700 46px Inter'; ctx.fillText(l2, -110, 45); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    satnav(t, tSatH - 0.1, tBut + 0.2, 'TURN LEFT', 'in 50 m', true, 700);
    P_('LEFT = RUNWAY', RED, tRunwayH - 0.1, tAnd - 0.1, 62, iconWarn);
    P_('JET COMING IN TO LAND', RED, tJetH - 0.1, S('hook2').end + 0.5, 52, iconWarn);
    floatText('?!', W / 2 + 180, 700, t, tWhat, S('hook2').end + 0.5, 130, YEL, 0.1);
    P_('THE SAT-NAV IS ALWAYS RIGHT', RED, tMost - 0.1, tSo - 0.1, 44, iconX);
    P_('TURN LEFT · ONTO THE RUNWAY', RED, tSo - 0.05, S('wrong1').end + 0.3, 44, iconX);
    P_('JET RIGHT BEHIND YOU', RED, tTouches - 0.1, tCatching - 0.1, 52, iconWarn);
    floatText('FAST!', W / 2, 760, t, tFast - 0.05, tFast + 0.9, 140, YEL, -0.08);
    floatText('BOING!', W / 2 - 60, 720, t, tBoing, tBoing + 0.9, 140, YEL, 0.08);
    P_('PASSENGER ON THE ROOF', RED, tRoof - 0.1, tTakes - 0.2, 48, iconX);
    P_('NEXT STOP: HAWAII', RED, tTakes - 0.1, tYourW - 0.2, 54, iconX);
    satnav(t, tYourW - 0.1, tRew0, 'RECALCULATING…', 'please turn around', false);
  } else {
    P_('STOP AT THE YELLOW LINE', GREEN, tStop - 0.1, tLet - 0.15, 48, iconCheck);
    P_('LET THE JET LAND FIRST', GREEN, tLet - 0.1, S('right2').end + 0.3, 48, iconCheck);
    P_('SUNROOF OPEN', GREEN, tOpen - 0.1, tGrab - 0.15, 56, iconCheck);
    P_('2 BAGUETTES', '#a0522d', tGrab - 0.1, tWave - 0.15, 60, iconCheck);
    P_('WAVE IT IN', GREEN, tWave - 0.1, tLike - 0.1, 60, iconCheck);
    P_('LIKE A REAL MARSHALLER', '#0277bd', tLike - 0.05, S('right3').end + 0.3, 48, iconHeart);
    floatText('LEFT…', W / 2 - 120, 700, t, tLeft - 0.05, tBit - 0.1, 120, YEL, -0.06);
    floatText('A BIT MORE…', W / 2, 700, t, tBit - 0.05, tStop4 - 0.1, 110, YEL, 0.05);
    floatText('STOP!', W / 2, 700, t, tStop4 - 0.05, tPerfect - 0.2, 150, YEL, -0.05);
    P_('PERFECT PARKING', GREEN, tPerfect - 0.1, tNose - 0.1, 56, iconCheck);
    P_('NOSE TO NOSE', GREEN, tNose - 0.1, S('right4').end + 0.3, 60, iconHeart);
    P_('THE PILOT IS IMPRESSED', '#5d4037', tPilot - 0.1, tDrops - 0.15, 48, iconCheck);
    P_('FREE PEANUTS', '#d62828', tPeanuts - 0.1, S('right5').end + 0.3, 60, iconHeart);
    P_('200 PASSENGERS', '#0277bd', tTwoH - 0.1, tApplaud - 0.1, 58, iconHeart);
    floatText('CLAP! CLAP!', W / 2, 800, t, tApplaud, S('right6').end + 0.5, 120, YEL, -0.06);
  }
}
window.dbg = { hero, planeR, planeW, heroW, heroR, RP };
start(update, hud);
