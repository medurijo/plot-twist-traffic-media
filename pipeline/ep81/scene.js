// Episode 76: Rush hour in an old one-lane tunnel – the double-decker bus in front of you gets wedged under the ceiling
// wrong: push it, bumper on bumper, full throttle -> the bus pops out of the tunnel like a cork, you fly right after it
//        -> you land on its roof, the bus just drives on: you're the top deck now. Next stop: EVERYWHERE
// right: engine off, hazards, knock on the driver's window, whisper: tyres -> psssst, a little air out of every tyre,
//        the bus sinks five centimetres -> rolls free into the sunshine -> fifty passengers pump the tyres back up,
//        one big breath each -> a golden ticket under your wiper: free rides, forever
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeCar, makeWheel, applyCam, makeLandscape, blink,
  project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, SKY,
  asphaltMat, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
scene.fog = new THREE.Fog(new THREE.Color('#cfe6f5'), 300, 1400);

// ---------------- timing ----------------
const tRush = WT('hook1', 'Rush'), tTunnel = WT('hook1', 'tunnel'), tFront = WT('hook1', 'In'), tDouble = WT('hook1', 'double'), tThen = WT('hook1', 'Then'), tStops = WT('hook1', 'stops');
const tStuck = WT('hook2', 'stuck'), tRoof = WT('hook2', 'roof'), tCeiling = WT('hook2', 'ceiling'), tFifty = WT('hook2', 'fifty'), tStaring = WT('hook2', 'staring'), tWhat = WT('hook2', 'What');
const tPush = WT('wrong1', 'push'), tBumper = WT('wrong1', 'Bumper'), tFull = WT('wrong1', 'Full');
const tPops = WT('wrong2', 'pops'), tCork = WT('wrong2', 'cork'), tFly = WT('wrong2', 'fly');
const tLand = WT('wrong3', 'land'), tDrives = WT('wrong3', 'drives'), tCongr = WT('wrong3', 'Congratulations'), tTop = WT('wrong3', 'top'), tNext = WT('wrong3', 'Next'), tEvery = WT('wrong3', 'everywhere');
const tEngine = WT('right2', 'Engine'), tHazards = WT('right2', 'Hazards'), tKnock = WT('right2', 'knock'), tWindow = WT('right2', 'window'), tWhisper = WT('right2', 'whisper'), tTyres = WT('right2', 'tyres');
const tPsst = WT('right3', 'Pssssst'), tAir = WT('right3', 'air'), tSinks = WT('right3', 'sinks'), tFive = WT('right3', 'five');
const tRolls = WT('right4', 'rolls'), tFree = WT('right4', 'free'), tOut = WT('right4', 'Out'), tSun = WT('right4', 'sunshine');
const tPass = WT('right5', 'passengers'), tPump = WT('right5', 'pump'), tFiftyR = WT('right5', 'Fifty'), tOne = WT('right5', 'One'), tBreath = WT('right5', 'breath');
const tGolden = WT('right6', 'golden'), tTicket = WT('right6', 'ticket'), tFreeR = WT('right6', 'Free'), tForever = WT('right6', 'Forever');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- mountain + tunnel ----------------
const TW = 5.2, TH = 5.0, TLEN = 80, EXIT_Z = -TLEN;
const rockT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#8f8a80'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = 110 + Math.random() * 60 | 0; c.fillStyle = `rgba(${v},${v - 5},${v - 12},0.6)`; c.fillRect(Math.random() * w, Math.random() * h, 4 + Math.random() * 18, 3 + Math.random() * 10); } }, true);
rockT.repeat.set(0.08, 0.08);
{ const sh = new THREE.Shape(); const hw = TW / 2;
  sh.moveTo(-90, 0); sh.lineTo(-hw, 0); sh.lineTo(-hw, TH); sh.lineTo(hw, TH); sh.lineTo(hw, 0); sh.lineTo(90, 0); sh.lineTo(70, 9); sh.lineTo(42, 20); sh.lineTo(18, 30); sh.lineTo(-6, 33); sh.lineTo(-30, 27); sh.lineTo(-58, 15); sh.lineTo(-90, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: TLEN, bevelEnabled: false }); g.translate(0, 0, -TLEN);
  const m = new THREE.Mesh(g, [L('#fff', { map: rockT }), L('#5f8f3a')]); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  // grass caps on the slopes (a second slightly bigger extrude in green above y>6 reads as hill)
  // portal frames
  const st = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#b9b2a4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8c8577'; c.lineWidth = 4; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 32 % 2) * 32; x < w; x += 64) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } } }, true);
  st.repeat.set(1, 1);
  const stM = L('#fff', { map: st });
  for (const z of [0.3, EXIT_Z - 0.3]) { const s = Math.sign(z + 1);
    box(1.4, TH + 1.6, 0.8, stM, -hw - 0.7, (TH + 1.6) / 2, z, true); box(1.4, TH + 1.6, 0.8, stM, hw + 0.7, (TH + 1.6) / 2, z, true); box(TW + 2.8, 1.8, 0.8, stM, 0, TH + 0.7, z, true); }
  const sT = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#1b4f8a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#fff'; c.font = '900 56px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OLD HILL TUNNEL', w / 2, h / 2 + 3); });
  for (const [z, ry] of [[0.75, 0], [EXIT_Z - 0.75, PI]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.05), L('#fff', { map: sT })); p.position.set(0, TH + 0.75, z); p.rotation.y = ry; scene.add(p); }
}
// tunnel lining: tiled walls, ceiling, wall lamps
const tileT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e8e1cf'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9c0aa'; c.lineWidth = 3; for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } c.fillStyle = '#3f6c8f'; c.fillRect(0, h - 40, w, 40); }, true);
{ for (const s of [-1, 1]) { const t = tileT.clone(); t.needsUpdate = true; t.repeat.set(TLEN / 2.5, 2); const m = new THREE.Mesh(new THREE.PlaneGeometry(TLEN, TH), L('#fff', { map: t })); m.position.set(s * (TW / 2 - 0.02), TH / 2, -TLEN / 2); m.rotation.y = -s * PI / 2; m.receiveShadow = true; scene.add(m); }
  const ct = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#6d6a64'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a5751'; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 3); }, true); ct.repeat.set(1, TLEN / 3);
  const cm = new THREE.Mesh(new THREE.PlaneGeometry(TW, TLEN), L('#fff', { map: ct })); cm.rotation.x = PI / 2; cm.position.set(0, TH - 0.02, -TLEN / 2); scene.add(cm);
  const lampM = new THREE.MeshBasicMaterial({ color: '#ffe2a8', toneMapped: false });
  for (let z = -3; z > -TLEN; z -= 5) for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 1.4), lampM); l.position.set(s * (TW / 2 - 0.08), 4.2, z); scene.add(l); } }
// road
const roadM = asphaltMat.clone(); roadM.polygonOffset = true; roadM.polygonOffsetFactor = -2; roadM.polygonOffsetUnits = -2;
{ plane(-TW / 2, TW / 2, -TLEN, 2, roadM, 0.04, 6); plane(-3.6, 3.6, -760, -TLEN, roadM, 0.04, 6); plane(-3.6, 3.6, 2, 200, roadM, 0.04, 6);
  const mk = L('#ffffff', { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  for (const x of [-TW / 2 + 0.25, TW / 2 - 0.25]) plane(x - 0.07, x + 0.07, -TLEN, 2, mk, 0.05, 4);
  for (const x of [-3.3, 3.3]) { plane(x - 0.08, x + 0.08, -760, -TLEN, mk, 0.05, 4); plane(x - 0.08, x + 0.08, 2, 200, mk, 0.05, 4); } }
makeLandscape({ seed: 76, trees: 1200, near: [0, -260, 160, 300],
  avoid: (x, z) => Math.abs(x) < 9 || (Math.abs(x) < 95 && z < 6 && z > -TLEN - 6),
  fieldAvoid: (x, z, w, d) => Math.abs(x) < w / 2 + 12 || (Math.abs(x) < 110 + w / 2 && z < 20 && z > -100) });
// bus stop at the lay-by (right way)
const STOP_Z = -122;
{ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), STD('#888')); p.position.set(4.6, 1.4, STOP_Z - 6.5); scene.add(p);
  const sT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffd60a'; c.beginPath(); c.arc(64, 64, 60, 0, PI * 2); c.fill(); c.fillStyle = '#1b5e20'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', 64, 68); });
  const s = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), L('#fff', { map: sT, side: THREE.DoubleSide })); s.position.set(4.6, 2.8, STOP_Z - 6.5); s.rotation.y = PI / 2; scene.add(s); }

// ---------------- bus ----------------
const BL = 11, BWD = 2.55, BH = 5.02, WR = 0.5;
const skins = ['#f0c39d', '#d9a37c', '#a86f4c', '#f5d2b5', '#7a4a32'], hairs = ['#3e2723', '#212121', '#8d6e63', '#ffcc80', '#bdbdbd', '#d84315'];
function drawFace(c, x, y, r, k, look = [0, 0]) {
  c.fillStyle = hairs[(hash(k + 3) * hairs.length) | 0]; c.beginPath(); c.arc(x, y - r * 0.15, r * 1.08, PI, 0); c.fill();
  c.fillStyle = skins[(hash(k) * skins.length) | 0]; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + s * r * 0.36, y - r * 0.1, r * 0.26, r * 0.32, 0, 0, PI * 2); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(x + s * r * 0.36 + look[0] * r * 0.1, y - r * 0.08 + look[1] * r * 0.1, r * 0.14, 0, PI * 2); c.fill(); }
  c.strokeStyle = '#5a2a1a'; c.lineWidth = r * 0.1; c.beginPath(); if (hash(k + 9) < 0.5) { c.arc(x, y + r * 0.42, r * 0.18, 0, PI * 2); } else { c.moveTo(x - r * 0.22, y + r * 0.45); c.lineTo(x + r * 0.22, y + r * 0.45); } c.stroke();
  c.fillStyle = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#ff7043'][(hash(k + 13) * 6) | 0]; c.fillRect(x - r * 1.1, y + r * 0.95, r * 2.2, r * 1.4);
}
const winTex = (nWin, faces, seed, look) => canvasTex(1024, 160, (c, w, h) => {
  c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); const ww = w / nWin;
  for (let i = 0; i < nWin; i++) { const x0 = i * ww + 8, y0 = 12; c.fillStyle = '#dfe9ee'; rrC(c, x0, y0, ww - 16, h - 24, 14); c.fill();
    c.save(); rrC(c, x0, y0, ww - 16, h - 24, 14); c.clip();
    for (let f = 0; f < faces; f++) { const k = seed + i * 7 + f; if (hash(k + 50) < 0.12) continue; drawFace(c, x0 + (f + 0.5) * (ww - 16) / faces, y0 + 62, 30, k, look); }
    c.restore(); c.strokeStyle = '#263238'; c.lineWidth = 6; rrC(c, x0, y0, ww - 16, h - 24, 14); c.stroke(); }
});
function rrC(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
const DEST = { canvas: document.createElement('canvas'), key: '' }; DEST.canvas.width = 512; DEST.canvas.height = 96;
DEST.tex = new THREE.CanvasTexture(DEST.canvas); DEST.tex.colorSpace = THREE.SRGBColorSpace;
function drawDest(txt) { if (DEST.key === txt) return; DEST.key = txt; const c = DEST.canvas.getContext('2d'); c.fillStyle = '#111'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#ffb300'; c.font = '900 62px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 256, 52, 490); DEST.tex.needsUpdate = true; }
drawDest('42  CITY CENTRE');
const bus = new THREE.Group(); scene.add(bus);
const busBody = new THREE.Group(); bus.add(busBody);    // sinks with the tyres
const BUSW = [];
{ const red = STD('#d32f2f', { roughness: 0.35, metalness: 0.15 }), cream = STD('#f3ead2'), dark = STD('#263238'), glassM = STD('#9fb7c6', { roughness: 0.1, metalness: 0.3 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(BWD, BH - 0.45, BL), red); b.position.y = 0.45 + (BH - 0.45) / 2; b.castShadow = b.receiveShadow = true; busBody.add(b);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(BWD - 0.1, 0.06, BL - 0.1), STD('#eeeeee')); roof.position.y = BH + 0.0; busBody.add(roof);
  const band = new THREE.Mesh(new THREE.BoxGeometry(BWD + 0.02, 0.25, BL + 0.02), cream); band.position.y = 2.82; busBody.add(band);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(BWD + 0.02, 0.2, BL + 0.02), dark); skirt.position.y = 0.55; busBody.add(skirt);
  // side windows (faces)
  const up = winTex(6, 2, 100, [0, 0]), lo = winTex(5, 2, 300, [0, 0]);
  for (const s of [-1, 1]) {
    const u = new THREE.Mesh(new THREE.PlaneGeometry(BL - 0.6, 1.25), L('#fff', { map: up })); u.position.set(s * (BWD / 2 + 0.012), 3.75, 0); u.rotation.y = s * PI / 2; busBody.add(u);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(BL - 3.0, 1.25), L('#fff', { map: lo })); l.position.set(s * (BWD / 2 + 0.012), 1.85, 1.0); l.rotation.y = s * PI / 2; busBody.add(l); }
  // rear windows: passengers staring back at you (look straight out)
  const rearU = winTex(2, 3, 600, [0, 0.4]), rearL = winTex(1, 4, 700, [0, 0.4]);
  const ru = new THREE.Mesh(new THREE.PlaneGeometry(BWD - 0.2, 1.3), L('#fff', { map: rearU })); ru.position.set(0, 3.75, BL / 2 + 0.012); busBody.add(ru);
  const rl = new THREE.Mesh(new THREE.PlaneGeometry(BWD - 0.5, 0.95), L('#fff', { map: rearL })); rl.position.set(0, 2.15, BL / 2 + 0.012); busBody.add(rl);
  const plateT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#ffd60a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '900 44px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUS 42', w / 2, h / 2 + 2); });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), L('#fff', { map: plateT })); pl.position.set(0, 1.0, BL / 2 + 0.015); busBody.add(pl);
  for (const s of [-1, 1]) { const tl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: '#7a0000', emissive: '#ff1010', emissiveIntensity: 0.6 })); tl.position.set(s * 1.0, 1.0, BL / 2 + 0.02); busBody.add(tl); }
  // front: windscreen with driver (lower), passengers (upper), destination board
  const frontU = winTex(2, 2, 900, [0, 0.3]);
  const fu = new THREE.Mesh(new THREE.PlaneGeometry(BWD - 0.2, 1.25), L('#fff', { map: frontU })); fu.position.set(0, 3.75, -BL / 2 - 0.012); fu.rotation.y = PI; busBody.add(fu);
  const drvT = canvasTex(512, 320, (c, w, h) => { c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); c.fillStyle = '#dfe9ee'; rrC(c, 12, 12, w - 24, h - 24, 20); c.fill(); c.save(); rrC(c, 12, 12, w - 24, h - 24, 20); c.clip();
    // driver with cap, worried
    c.fillStyle = '#1a237e'; c.fillRect(w * 0.62 - 70, 170, 140, 160); drawFace(c, w * 0.62, 150, 56, 4, [0, 0.4]); c.fillStyle = '#1a237e'; c.fillRect(w * 0.62 - 64, 74, 128, 34); c.fillRect(w * 0.62 - 10, 100, 86, 12);
    c.strokeStyle = '#333'; c.lineWidth = 12; c.beginPath(); c.arc(w * 0.62, 300, 70, PI * 1.1, PI * 1.9); c.stroke(); c.restore(); c.strokeStyle = '#263238'; c.lineWidth = 8; rrC(c, 12, 12, w - 24, h - 24, 20); c.stroke(); });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(BWD - 0.1, 1.6), L('#fff', { map: drvT })); fl.position.set(0, 1.75, -BL / 2 - 0.012); fl.rotation.y = PI; busBody.add(fl);
  const dst = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.4), new THREE.MeshBasicMaterial({ map: DEST.tex, toneMapped: false })); dst.position.set(0, 2.82, -BL / 2 - 0.02); dst.rotation.y = PI; busBody.add(dst);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), new THREE.MeshBasicMaterial({ color: '#fffbe0', toneMapped: false })); hl.position.set(s * 0.9, 0.85, -BL / 2 - 0.02); hl.rotation.y = PI; busBody.add(hl); }
  // driver's side window (front right, x+) with the driver looking out (used for the knock)
  const swT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); c.fillStyle = '#dfe9ee'; rrC(c, 10, 10, w - 20, h - 20, 16); c.fill(); c.save(); rrC(c, 10, 10, w - 20, h - 20, 16); c.clip(); c.fillStyle = '#1a237e'; c.fillRect(70, 170, 120, 100); drawFace(c, 130, 140, 52, 4, [0.6, 0.2]); c.fillStyle = '#1a237e'; c.fillRect(74, 66, 112, 32); c.fillRect(120, 92, 80, 12); c.restore(); c.strokeStyle = '#263238'; c.lineWidth = 7; rrC(c, 10, 10, w - 20, h - 20, 16); c.stroke(); });
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.25), L('#fff', { map: swT })); sw.position.set(BWD / 2 + 0.013, 1.85, -BL / 2 + 0.85); sw.rotation.y = PI / 2; busBody.add(sw);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.1), L('#90a4ae')); door.position.set(BWD / 2 + 0.013, 1.55, -BL / 2 + 2.15); door.rotation.y = PI / 2; busBody.add(door);
  // wheels (tyres can deflate: wheel group scale)
  for (const [z, dual] of [[-BL / 2 + 1.9, false], [BL / 2 - 2.6, true]]) for (const s of [-1, 1]) {
    const wg = new THREE.Group(); wg.position.set(s * (BWD / 2 - 0.22), WR, z); bus.add(wg); const w = makeWheel(WR, dual ? 0.5 : 0.32); wg.add(w);
    const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), STD('#222')); valve.position.set(s * (dual ? 0.27 : 0.18), 0.28, 0); valve.rotation.z = PI / 2; wg.add(valve);
    BUSW.push({ wg, w, s, z }); }
  busBody.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }

// ---------------- hero + other cars ----------------
const heroP = new THREE.Group(); scene.add(heroP);
const hero = makeCar('#1e88e5'); scene.remove(hero); heroP.add(hero); hero.position.y = -0.8;
const ud = hero.userData;
const glowT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const glowSp = (col, s) => { const m = new THREE.SpriteMaterial({ map: glowT, color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }); const sp = new THREE.Sprite(m); sp.scale.setScalar(s); return sp; };
const hazL = [[-0.82, 0.78, -2.2], [0.82, 0.78, -2.2], [-0.78, 0.86, 2.24], [0.78, 0.86, 2.24]].map(p => { const s = glowSp('#ffa000', 0.75); s.position.set(...p); ud.bodyG.add(s); return s; });
const hdL = [-0.6, 0.6].map(x => { const s = glowSp('#fff6c8', 0.9); s.position.set(x, 0.76, -2.3); ud.bodyG.add(s); return s; });
const OTHERS = ['#43a047', '#fdd835', '#f5f5f5', '#8e24aa'].map(c => makeCar(c));
// golden ticket
const ticketT = canvasTex(512, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#f5c542'); g.addColorStop(1, '#c99a1e'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#8a6a10'; c.lineWidth = 10; c.setLineDash([18, 10]); c.strokeRect(14, 14, w - 28, h - 28); c.setLineDash([]); c.fillStyle = '#5d4300'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '900 64px Inter'; c.fillText('GOLDEN TICKET', w / 2, 72); c.font = '900 50px Inter'; c.fillText('FREE RIDES', w / 2, 140); c.fillStyle = '#b71c1c'; c.fillText('FOREVER', w / 2, 200); });
const TICKET = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshStandardMaterial({ map: ticketT, roughness: 0.3, metalness: 0.4, side: THREE.DoubleSide, emissive: '#5a4100', emissiveIntensity: 0.25 })); TICKET.castShadow = true; scene.add(TICKET);
// knocking fist + air puffs + sparks + smoke
const FIST = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), STD('#f0c39d')); FIST.scale.set(1, 0.85, 1.2); scene.add(FIST);
const SPARK = Array.from({ length: 26 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: i % 2 ? '#ffb300' : '#fff3c4', transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); scene.add(s); return { s, k: hash(i + 3), a: hash(i + 9) }; });
const PUFF = Array.from({ length: 40 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, k: hash(i + 31), w: i % 4 }; });
const SMOKE = Array.from({ length: 18 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#bdbdbd', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, k: hash(i + 71) }; });
const POPC = Array.from({ length: 22 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#eeeeee', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, k: hash(i + 91), a: hash(i + 5) * PI * 2 }; });
// passengers who pump the tyres (right way), on the +x side of the bus
function makePerson(k) { const g = new THREE.Group(); const col = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#ff7043', '#26a69a'][k % 7];
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.8, 8), STD('#37474f')); legs.position.y = 0.4; g.add(legs);
  const tor = new THREE.Group(); tor.position.y = 0.8; g.add(tor);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.75, 10), STD(col)); body.position.y = 0.37; tor.add(body);
  const head = new THREE.Group(); head.position.y = 0.95; tor.add(head);
  const hm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), STD(skins[k % 5])); head.add(hm);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 8, 0, PI * 2, 0, PI * 0.45), STD(hairs[k % 6])); hair.position.y = 0.02; head.add(hair);
  const cheeks = [-1, 1].map(s => { const ch = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), STD('#ff8a80')); ch.position.set(s * 0.13, -0.05, -0.15); head.add(ch); return ch; });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), STD('#111')); e.position.set(s * 0.08, 0.05, -0.2); head.add(e); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return { g, tor, head, cheeks }; }
const PEOPLE = Array.from({ length: 12 }, (_, i) => ({ ...makePerson(i), i }));

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
const BUS_Z = EXIT_Z + 6 + BL / 2;          // stuck position (bus centre)  = -68.5
const CAR_Z = BUS_Z + BL / 2 + 3.4 + 2.2;   // our car stops behind
const CONTACT = BUS_Z + BL / 2 + 2.25;
const busHook = mono([[0, BUS_Z + 38], [tStops - 0.3, BUS_Z + 0.9], [tStops + 0.15, BUS_Z]]);
const carHook = mono([[0, CAR_Z + 38], [tStops, CAR_Z + 2.0], [tStops + 0.8, CAR_Z]]);
// wrong
const tPop = tPops - 0.05, tBusLand = tPop + 2.5, BUS_LAND = -205;
const busW = mono([[tFull, BUS_Z], [tPop - 0.05, BUS_Z - 0.9], [tPop + 0.35, EXIT_Z - 4], [tBusLand, BUS_LAND], [tLand, BUS_LAND - 32], [tRew0 + 1, BUS_LAND - 115]]);
const busArcY = z => (z > EXIT_Z - 2 ? 0 : 15 * Math.sin(PI * clamp((EXIT_Z - 2 - z) / (EXIT_Z - 2 - BUS_LAND))));
const carW = mono([[tPush - 0.1, CAR_Z], [tBumper + 0.2, CONTACT], [tPop - 0.05, CONTACT - 0.9], [tPop + 0.45, EXIT_Z - 1]]);
const tCarExit = tPop + 0.45;
// right
const busR = mono([[tRolls - 0.1, BUS_Z], [tSun + 0.4, STOP_Z + 2], [tPass - 0.2, STOP_Z], [tForever + 0.2, STOP_Z], [TOTAL, STOP_Z - 70]]);
const carR = mono([[tRolls + 0.3, CAR_Z], [tSun + 0.9, STOP_Z + BL / 2 + 4.5 + 2.2 + 1], [tPass + 0.2, STOP_Z + BL / 2 + 4.5 + 2.2], [TOTAL, STOP_Z + BL / 2 + 4.5 + 2.2]]);
const sinkR = t => -0.4 * ramp(t, tPsst + 0.2, tSinks + 0.4) + 0.4 * ramp(t, tOne - 0.4, tBreath + 0.9);
const busPose = t => {
  const right = isRight(t);
  if (t < tFull || (right && t < tRolls - 0.1)) return { z: t < tFull ? busHook(t) : BUS_Z, y: 0, pitch: 0, sink: right ? sinkR(t) : 0 };
  if (!right) { const z = busW(t); let y = busArcY(z), pitch = 0; if (z < EXIT_Z - 2 && t < tBusLand + 0.1) { const zz = busW(t + 0.03); pitch = Math.atan2(busArcY(zz) - y, -(zz - z) || 1e-3); }
    if (t > tBusLand) y += 0.4 * Math.abs(Math.sin((t - tBusLand) * 8)) * Math.exp(-(t - tBusLand) * 3.5);
    if (t > tLand) y += 0.25 * Math.abs(Math.sin((t - tLand) * 9)) * Math.exp(-(t - tLand) * 4);
    return { z, y, pitch: clamp(pitch, -0.5, 0.5), sink: 0 }; }
  return { z: busR(t), y: 0, pitch: 0, sink: sinkR(t) };
};
const _M = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _P = new THREE.Vector3(), _S = new THREE.Vector3();

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroW = (off, lookOff, fov = 40) => t => { const p = heroP.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + lookOff[0], p.y + lookOff[1], p.z + lookOff[2]), fov]; };
const BusW = (off, lookOff, fov = 40) => t => { const p = bus.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + lookOff[0], p.y + lookOff[1], p.z + lookOff[2]), fov]; };
const HeroL = (pos, lookOff, fov = 40) => t => { const p = heroP.position; return [V3(...pos), V3(p.x + lookOff[0], p.y + lookOff[1], p.z + lookOff[2]), fov]; };
const camKeys = [
  [0.0, HeroW([1.1, 2.7, 9.5], [0, 2.0, -12], 42)],
  [tThen - 0.2, HeroW([1.0, 2.6, 9.0], [0, 2.0, -12], 42)],
  ...cut(tThen - 0.15, Ac([0.7, 2.2, EXIT_Z + 0.4], [0, 2.75, BUS_Z - 2], 58)),
  [tFifty - 0.3, Ac([0.6, 2.2, EXIT_Z + 0.6], [0, 2.8, BUS_Z - 2], 58)],
  ...cut(tFifty - 0.25, Ac([0.9, 3.7, CAR_Z + 8.5], [0, 3.0, BUS_Z + 2], 42)),
  [S('hook2').end + 0.5, Ac([0.8, 3.6, CAR_Z + 7.5], [0, 3.0, BUS_Z + 2], 42)],
  // wrong
  [tFull - 0.25, Ac([0.8, 3.4, CAR_Z + 7], [0, 2.6, BUS_Z + 2], 42)],
  ...cut(tFull - 0.2, Ac([1.6, 0.8, CAR_Z + 6], [0, 1.4, BUS_Z + 3], 44)),
  [tPop - 0.1, Ac([1.5, 0.8, CAR_Z + 5], [0, 1.4, BUS_Z + 3], 44)],
  ...cut(tPop - 0.05, Ac([9, 1.8, EXIT_Z - 20], [0, 3.5, EXIT_Z + 1], 50)),
  [tCork - 0.4, t => { const p = bus.position; return [V3(9, 1.8, EXIT_Z - 20), V3(p.x, p.y + 2.5, p.z), 50]; }],
  ...cut(tCork - 0.35, BusW([10, 3, 22], [0, 3, -6], 48)),
  [tFly - 0.3, BusW([10, 3.5, 24], [0, 3, -6], 48)],
  ...cut(tFly - 0.25, HeroW([1.6, 3, 10], [0, -2, -14], 50)),
  [tLand - 0.6, HeroW([1.8, 3.4, 11], [0, -2.5, -12], 50)],
  ...cut(tLand - 0.55, Ac([13, 5, BUS_LAND - 40], [0, 4.5, BUS_LAND - 29], 46)),
  [tDrives - 0.2, Ac([12, 5.5, BUS_LAND - 42], [0, 5, BUS_LAND - 32], 46)],
  ...cut(tDrives - 0.15, BusW([11, 4, 9], [0, 5, -1], 46)),
  [tTop - 0.3, BusW([11, 4.5, 6], [0, 5, -1], 46)],
  ...cut(tTop - 0.25, BusW([6.5, 3.6, -19], [0, 4.2, 0], 44)),
  [tRew0, BusW([6.0, 3.8, -18], [0, 4.4, 0], 44)],
  // right
  ...cut(tRew1, Ac([0.8, 3.6, CAR_Z + 7.5], [0, 3.0, BUS_Z + 2], 42)),
  ...cut(tEngine - 0.2, Ac([1.0, 2.8, CAR_Z + 6.5], [0, 1.6, CAR_Z - 3], 42)),
  [tKnock - 0.35, Ac([0.9, 2.9, CAR_Z + 6.2], [0, 1.7, CAR_Z - 3], 42)],
  ...cut(tKnock - 0.3, Ac([2.4, 2.25, BUS_Z - BL / 2 + 3.6], [1.15, 1.95, BUS_Z - BL / 2 + 0.55], 50)),
  [S('right2').end + 0.3, Ac([2.4, 2.2, BUS_Z - BL / 2 + 3.3], [1.15, 1.95, BUS_Z - BL / 2 + 0.55], 50)],
  ...cut(tPsst - 0.15, Ac([2.25, 0.9, BUS_Z + BL / 2 + 2.6], [1.3, 0.55, BUS_Z + BL / 2 - 2.6], 42)),
  [tSinks - 0.35, Ac([2.25, 0.95, BUS_Z + BL / 2 + 2.2], [1.3, 0.55, BUS_Z + BL / 2 - 2.6], 42)],
  ...cut(tSinks - 0.3, Ac([0.9, 3.3, BUS_Z + BL / 2 + 10], [0, 4.5, BUS_Z + BL / 2], 34)),
  [S('right3').end + 0.3, Ac([0.8, 3.4, BUS_Z + BL / 2 + 9.5], [0, 4.6, BUS_Z + BL / 2], 34)],
  ...cut(tRolls - 0.15, Ac([8, 2.2, EXIT_Z - 24], [0, 3.0, EXIT_Z + 2], 48)),
  [tOut - 0.15, Ac([8, 2.4, EXIT_Z - 23], [0, 3.0, EXIT_Z + 1], 48)],
  ...cut(tOut - 0.1, Ac([-5, 2.6, STOP_Z - 16], [0, 2.4, -98], 44)),
  [tPass - 0.35, Ac([-5, 2.8, STOP_Z - 15], [0, 2.4, -100], 44)],
  ...cut(tPass - 0.3, Ac([10, 3.0, STOP_Z + 14], [0.5, 1.8, STOP_Z - 1], 44)),
  [tBreath - 0.6, Ac([9.5, 3.0, STOP_Z + 13], [0.5, 1.8, STOP_Z - 1], 44)],
  ...cut(tBreath - 0.55, Ac([5.5, 4.6, STOP_Z + BL / 2 + 3.5], [1.4, 0.7, STOP_Z + BL / 2 - 2.6], 42)),
  [S('right5').end + 0.3, Ac([5.3, 4.5, STOP_Z + BL / 2 + 3.7], [1.4, 0.7, STOP_Z + BL / 2 - 2.6], 42)],
  ...cut(tGolden - 0.4, HeroW([2.0, 2.6, -4.8], [0, 1.0, -0.4], 42)),
  [S('right6').end + 0.4, HeroW([1.8, 2.4, -4.4], [0, 1.0, -0.4], 42)],
  ...cut(S('right7').start - 0.1, HeroW([1.4, 3.6, 8.5], [0, 2.5, -14], 44)),
  [TOTAL, HeroW([2.5, 9, 16], [0, 3, -30], 46)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- tunnel lights (follow the action) ----------------
const TL_ = [0, 1, 2].map(() => { const l = new THREE.PointLight('#ffd9a0', 11, 16, 1.4); scene.add(l); return l; });

// ---------------- update ----------------
let screen = {};
let spin = 0, prevPos = null;
function update(t) {
  const right = isRight(t);
  // ---- bus ----
  const bp = busPose(t);
  bus.position.set(0, bp.y, bp.z); bus.rotation.set(bp.pitch, 0, 0); busBody.position.y = bp.sink;
  BUSW.forEach(w => { const d = -bp.sink / 0.4; w.wg.scale.set(1 + 0.25 * d, 1 - 0.42 * d, 1 + 0.1 * d); w.wg.position.y = WR * (1 - 0.42 * d);
    w.w.rotation.x = (bp.z - BUS_Z) / WR; });
  bus.updateMatrixWorld(true);
  drawDest(!right && t > tCongr - 0.2 ? '42  EVERYWHERE' : '42  CITY CENTRE');
  // ---- hero ----
  let hx = 0, hy = 0, hz = CAR_Z, pitch = 0, onBus = false, mode = 'drive';
  if (t < tPush - 0.1 || (right && t < tRolls)) hz = (t < tStops + 0.8) ? carHook(t) : CAR_Z;
  if (!right && t >= tPush - 0.1) {
    if (t < tCarExit) hz = carW(t);
    else if (t < tLand) { mode = 'fly'; const u = clamp((t - tCarExit) / (tLand - tCarExit)); const zEnd = busW(tLand) + 0.6; hz = lerp(EXIT_Z - 1, zEnd, u); hy = (BH + 0.0) * u + 22 * Math.sin(PI * u); pitch = -2 * PI * ease(u); }
    else onBus = true;
  }
  if (right && t >= tRolls) hz = carR(t);
  if (onBus) { _m.compose(_v.set(0, BH + 0.8, 0.6), _q.identity(), _s.set(1, 1, 1)); _M.multiplyMatrices(bus.matrixWorld, _m); _M.decompose(_P, _Q, _S); heroP.position.copy(_P); heroP.quaternion.copy(_Q); }
  else { heroP.position.set(hx, 0.8 + hy, hz); heroP.rotation.set(pitch, 0, 0); }
  heroP.updateMatrixWorld(true);
  { const baseZ = (t < tPush - 0.1 || (right && t < tRolls)) ? hz : CAR_Z; OTHERS.forEach((c, k) => c.position.set(0, 0, Math.max(baseZ, CAR_Z) + 6.6 * (k + 1))); }
  if (prevPos && mode !== 'fly') { const d = heroP.position.distanceTo(prevPos); if (d < 3) spin -= Math.sign(prevPos.z - heroP.position.z || 1) * d / 0.34; }
  const pushing = !right && t > tFull && t < tPop; if (pushing) spin -= 0.9; if (mode === 'fly') spin += 0.3;
  prevPos = heroP.position.clone(); ud.wheels.forEach(w => w.rotation.x = spin);
  // car shaking while pushing
  ud.bodyG.position.y = pushing ? 0.02 * Math.sin(t * 60) : 0; ud.bodyG.rotation.x = pushing ? -0.03 : 0;
  // hazards
  const haz = right && t > tHazards - 0.05; const on = Math.floor((t - tHazards) * 2.6) % 2 === 0;
  ud.bl.L.emissiveIntensity = ud.bl.R.emissiveIntensity = haz && on ? 3 : 0; hazL.forEach(s => s.material.opacity = haz && on ? 0.9 : 0);
  const lights = !right ? 1 : (t < tEngine ? 1 : 0); hdL.forEach(s => s.material.opacity = lights * 0.55); ud.hl.emissiveIntensity = lights ? 1.2 : 0.2;
  // ---- sparks (roof scraping) ----
  const scrape = (!right && ((t > tStops - 0.5 && t < tStops + 0.4) || (t > tFull && t < tPop + 0.3))) || (right && t < tRew1 + 0.1 && false);
  const sparkA = (t > tStops - 0.5 && t < tStops + 0.4) || (!right && t > tFull && t < tPop + 0.3);
  SPARK.forEach(p => { const age = (t * 2.2 + p.k) % 1; p.s.visible = sparkA; if (!sparkA) return; const zr = bus.position.z - BL / 2 + 0.6 + p.a * (BL - 1.2);
    p.s.position.set((p.a - 0.5) * BWD + Math.cos(p.a * 20) * age * 1.2, BH - 0.05 - age * age * 2.2, zr + age * 1.8); p.s.scale.setScalar(0.12 + 0.18 * (1 - age)); p.s.material.opacity = 0.95 * (1 - age); });
  // ---- tyre smoke while pushing ----
  SMOKE.forEach(p => { const age = (t * 1.4 + p.k) % 1; const onS = pushing; p.s.visible = onS; if (!onS) return; const s = p.k < 0.5 ? -1 : 1;
    p.s.position.set(heroP.position.x + s * 0.9 + s * age * 0.6, 0.3 + age * 1.6, heroP.position.z + 1.4 + age * 2.5); p.s.scale.setScalar(0.6 + age * 2.2); p.s.material.opacity = 0.55 * Math.sin(PI * age); });
  // ---- cork pop cloud at the exit ----
  POPC.forEach(p => { const age = t - tPop - 0.3 - p.k * 0.15; const onP = !right && age > 0 && age < 1.4; p.s.visible = onP; if (!onP) return;
    p.s.position.set(Math.cos(p.a) * (1.5 + age * 4), 2.6 + Math.sin(p.a) * (1.2 + age * 3), EXIT_Z - 1 - age * 3); p.s.scale.setScalar(1.5 + age * 3.5); p.s.material.opacity = 0.75 * (1 - age / 1.4); });
  // ---- air puffs from the valves (psst) and passengers' breaths ----
  PUFF.forEach(p => { const w = BUSW[p.w]; const wp = w.wg.getWorldPosition(new THREE.Vector3());
    const psst = right && t > tPsst && t < tSinks + 0.6; const blow = right && t > tOne - 0.3 && t < tBreath + 0.8;
    const age = (t * 2.5 + p.k) % 1; const onP = psst || (blow && w.s > 0); p.s.visible = onP; if (!onP) return;
    if (psst) { p.s.position.set(wp.x + w.s * (0.35 + age * 1.4), wp.y + 0.25 + age * 0.6, wp.z + (p.k - 0.5) * 0.4); p.s.scale.setScalar(0.15 + age * 0.6); p.s.material.opacity = 0.7 * (1 - age); }
    else { p.s.position.set(wp.x + w.s * (1.1 - age * 0.7), wp.y + 0.15, wp.z + (p.k - 0.5) * 0.8); p.s.scale.setScalar(0.25 + (1 - age) * 0.3); p.s.material.opacity = 0.6 * Math.sin(PI * age); } });
  // ---- knocking fist ----
  const kOn = right && t > tKnock - 0.4 && t < tWhisper; FIST.visible = kOn;
  if (kOn) { const k1 = Math.max(0, Math.sin(clamp((t - tKnock) / 0.18) * PI)), k2 = Math.max(0, Math.sin(clamp((t - tKnock - 0.18) / 0.18) * PI)); const kk = Math.max(k1, k2);
    FIST.position.set(BWD / 2 + 0.24 - 0.1 * kk, 2.05, bus.position.z - BL / 2 + 0.75); }
  // ---- people pumping the tyres ----
  const spots = [[-BL / 2 + 1.9, 0], [-BL / 2 + 1.9, 1], [BL / 2 - 2.6, 0], [BL / 2 - 2.6, 1]];
  PEOPLE.forEach(p => { const on2 = right && t > tPass - 0.2; p.g.visible = on2; if (!on2) return;
    const sp = spots[p.i % 4], row = Math.floor(p.i / 4); const door = V3(BWD / 2 + 0.6, 0, bus.position.z - BL / 2 + 2.15);
    const target = V3(BWD / 2 + 0.85 + row * 0.9, 0, bus.position.z + sp[0] + (sp[1] - 0.5) * 0.9 + (row ? (sp[1] - 0.5) * 0.4 : 0));
    const u = ease((t - tPass - p.i * 0.12) / 1.3); const pos = door.clone().lerp(target, clamp(u)); if (t < tPass + p.i * 0.12) { p.g.visible = false; return; }
    p.g.position.copy(pos); p.g.position.y = 0.06 * Math.abs(Math.sin(t * 10)) * (u < 1 ? 1 : 0);
    p.g.rotation.y = u < 1 ? Math.atan2(-(target.x - door.x), -(target.z - door.z)) : -PI / 2;   // face the wheel (-x)
    const bl = right && t > tOne - 0.3 && t < tBreath + 0.9 && row === 0; const bend = bl ? 0.5 : (row ? 0 : 0.25 * clamp(u));
    p.tor.rotation.x = -bend;
    const puff = bl ? 0.5 + 0.5 * Math.sin((t - tOne) * 7 + p.i) : 0; p.cheeks.forEach(c => c.scale.setScalar(1 + 1.1 * puff)); p.head.scale.set(1 + 0.12 * puff, 1, 1);
    p.g.scale.setScalar(row ? 0.95 : 1); });
  // ---- golden ticket ----
  const tk0 = tGolden - 0.2, tk1 = tTicket + 0.25;
  TICKET.visible = right && t > tk0;
  if (TICKET.visible) { const u = clamp((t - tk0) / (tk1 - tk0)); const A = V3(BWD / 2 + 0.3, 2.3, bus.position.z - BL / 2 + 0.8);
    const N = V3(0, 0.645, -0.764); const B = heroP.localToWorld(V3(0, 1.22 - 0.8, -0.9).addScaledVector(N, 0.1)); const P = A.clone().lerp(B, ease(u)); P.y += 2.2 * Math.sin(PI * u); P.x += 1.2 * Math.sin(PI * u);
    TICKET.position.copy(P);
    if (u < 1) TICKET.rotation.set(t * 7, t * 3, t * 5); else { TICKET.up.set(0, 1, 0); TICKET.lookAt(P.clone().add(N)); TICKET.rotateZ(0.1); } }
  // ---- tunnel lights near the action ----
  const zc = clamp(lerp(heroP.position.z, bus.position.z, 0.5), EXIT_Z + 2, -2);
  TL_.forEach((l, i) => { l.position.set(0, 3.9, zc + (i - 1) * 8); l.intensity = heroP.position.z < EXIT_Z - 4 && bus.position.z < EXIT_Z - 4 ? 0 : 11; });
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.12; camera.far = 3000; camera.updateProjectionMatrix();
  let shake = 0; if (!right) { shake = Math.max(shake, win(t, tFull, tPop, 0.1) * 0.5, win(t, tPop - 0.02, tPop + 0.4, 0.05), win(t, tLand - 0.02, tLand + 0.4, 0.05)); }
  if (t > tStops - 0.1 && t < tStops + 0.5) shake = Math.max(shake, win(t, tStops - 0.1, tStops + 0.5, 0.05));
  applyCam(c, t, shake > 0.02 ? 0.1 * shake : 0);
  // inside the tunnel: the sun is blocked
  const inside = camera.position.z < -1 && camera.position.z > EXIT_Z + 1 && Math.abs(camera.position.x) < TW / 2;
  camera.updateMatrixWorld(true);
  screen = { hero: project(heroP.localToWorld(V3(0, 1.2, 0))), gapTop: project(V3(0, TH, bus.position.z + BL / 2)), gapBus: project(V3(0, BH + bp.sink, bus.position.z + BL / 2)) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function bubble(text, x, y, a, b, size = 60) {
  const al = win(gT, a, b, 0.2); if (al <= 0) return; const k = back((gT - a) / 0.3);
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6; rr(-w / 2, -size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.15, size * 0.75); ctx.lineTo(-w * 0.3, size * 1.4); ctx.lineTo(-w * 0.02, size * 0.78); ctx.fill();
  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 4); ctx.restore();
}
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('RUSH HOUR', '#1565c0', tRush - 0.1, tTunnel - 0.1, 56);
    P_('ONE-LANE TUNNEL', '#1565c0', tTunnel - 0.05, tDouble - 0.2, 52);
    P_('DOUBLE-DECKER BUS', '#1565c0', tDouble - 0.1, tStops - 0.1, 50);
    floatText('SCREEECH!', W / 2, 700, t, tStops - 0.2, tStops + 1.0, 110, YEL, -0.05);
    P_('BUS: STUCK', RED, tStuck - 0.15, tFifty - 0.2, 60, iconWarn);
    P_('50 PASSENGERS STARING', RED, tFifty - 0.1, tWhat - 0.3, 46, iconWarn);
    P_('PUSH IT', RED, tPush - 0.15, tFull - 0.1, 60, iconX);
    P_('FULL THROTTLE', RED, tFull - 0.1, tPop - 0.1, 58, iconX);
    floatText('POP!', W / 2, 640, t, tPop + 0.2, tPop + 1.3, 170, YEL, -0.06);
    P_('LIKE A CORK', RED, tCork - 0.15, tFly - 0.2, 58, iconWarn);
    floatText('WHEEE!', W / 2 - 80, 700, t, tFly, tFly + 1.3, 120, YEL, -0.08);
    floatText('BONK!', W / 2 + 100, 660, t, tLand, tLand + 0.9, 120, YEL, 0.08);
    P_('NEW TOP DECK', RED, tTop - 0.15, tNext - 0.15, 58, iconX);
    P_('NEXT STOP: EVERYWHERE', RED, tNext - 0.1, tRew0, 46, iconX);
  } else {
    P_('ENGINE OFF', GREEN, tEngine - 0.15, tHazards - 0.1, 58, iconCheck);
    P_('HAZARDS ON', GREEN, tHazards - 0.1, tKnock - 0.3, 58, iconCheck);
    floatText('KNOCK KNOCK', W / 2 + 60, 760, t, tKnock, tKnock + 1.1, 90, YEL, 0.06);
    P_('WHISPER ONE WORD', GREEN, tWhisper - 0.15, S('right2').end + 0.3, 50, iconCheck);
    bubble('tyres...', W / 2 - 60, 720, tTyres - 0.1, S('right2').end + 0.4, 70);
    floatText('PSSSSST', W / 2, 700, t, tPsst - 0.05, tPsst + 1.6, 120, YEL, -0.05);
    P_('A LITTLE AIR OUT', GREEN, tAir - 0.1, tSinks - 0.15, 56, iconCheck);
    P_('THE BUS SINKS', GREEN, tSinks - 0.1, tFive - 0.15, 56, iconCheck);
    if (t > tFive - 0.2 && t < S('right3').end + 0.4) { const a = win(t, tFive - 0.2, S('right3').end + 0.4, 0.2), A = screen.gapTop, B = screen.gapBus;
      if (A.ok && B.ok) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = YEL; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(A.x + 260, A.y); ctx.lineTo(A.x + 260, B.y); ctx.stroke(); ctx.restore(); }
      P_('JUST 5 CM', GREEN, tFive - 0.2, S('right3').end + 0.4, 60, iconCheck); }
    P_('IT ROLLS FREE', GREEN, tFree - 0.15, tSun - 0.1, 58, iconCheck);
    P_('INTO THE SUNSHINE', GREEN, tSun - 0.1, S('right4').end + 0.3, 54, iconCheck);
    P_('PASSENGERS PUMP THE TYRES', '#1565c0', tPump - 0.15, tOne - 0.2, 42, iconHeart);
    P_('ONE BIG BREATH EACH', '#1565c0', tOne - 0.15, S('right5').end + 0.3, 48, iconHeart);
    floatText('PFFFF!', W / 2 + 120, 760, t, tBreath - 0.1, tBreath + 1.0, 100, YEL, 0.06);
    P_('GOLDEN TICKET', '#c99a1e', tGolden - 0.15, tFreeR - 0.15, 58);
    P_('FREE RIDES. FOREVER.', GREEN, tFreeR - 0.1, S('right7').start - 0.1, 50, iconCheck);
  }
}
window.dbg = { heroP, bus, camera };
start(update, hud);
