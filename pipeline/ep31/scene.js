// Episode 28 (new): The speed camera is a fashion photographer
// wrong: speed up and pose -> "Gorgeous! Again! Faster!" -> you race past again and again -> magazine cover "Speeder of the year", fine 4,000 euros, licence gone.
// right: stick to the limit -> bored photographer -> friendly wave -> one free photo, no fine -> billboard "Safe driver of the month".
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, BIG, SKY, sun, hemi,
  makeCar, blink, placeCar, applyCam,
  YEL, GREEN, RED, project, ring, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LANE = 1.75, CX = 4.9, CY = 3.55;     // camera box position (x, height), at z = 0, facing +z

// ---------------- timing ----------------
const tDifferent = WT('hook1', 'But'), tFashion = WT('hook2', 'fashion'), tWhat = WT('hook2', 'What');
const tSpeedUp = WT('wrong1', 'speed'), tPose = WT('wrong1', 'strike'), tFlash0 = WT('wrong1', 'Flash');
const tBig = WT('wrong2', 'Big'), tGorgeous = WT('wrong2', 'Gorgeous'), tAgain0 = WT('wrong2', 'Again'), tFaster = WT('wrong2', 'Faster'), tTurn = WT('wrong2', 'turn'), tRace = WT('wrong2', 'race'), tPast = WT('wrong2', 'past'), tAndAgain = WT('wrong2', 'And');
const tF1 = WT('wrong2', 'Flash', 0), tF2 = WT('wrong2', 'Flash', 1), tF3 = WT('wrong2', 'Flash', 2);
const tWeek = WT('wrong3', 'week'), tCover = WT('wrong3', 'cover'), tSpeeder = WT('wrong3', 'Speeder'), tInside = WT('wrong3', 'inside'), tFine = WT('wrong3', 'fine'), tFour = WT('wrong3', 'Four'), tLicence = WT('wrong3', 'licence'), tGone = WT('wrong3', 'Gone');
const tStick = WT('right2', 'Stick'), tLimit = WT('right2', 'limit'), tCalm = WT('right2', 'Calm'), tHands = WT('right2', 'both');
const tBored = WT('right3', 'bored'), tImpressed = WT('right3', 'impressed'), tJumps = WT('right3', 'jumps'), tRuns = WT('right3', 'runs');
const tAutograph = WT('right4', 'autograph'), tStopR = WT('right4', 'stop'), tSign = WT('right4', 'sign');
const tSticks = WT('right5', 'sticks'), tLens = WT('right5', 'lens'), tCant = WT('right5', 'Now'), tCare = WT('right5', 'But'), tFan = WT('right6', 'Biggest');

// ---------------- world ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 10 || (x > 8 && x < 18 && z < -40 && z > -75), fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 12, near: [-30, 0, 80, 260], trees: 1500, seed: 21 });
plane(-3.6, 3.6, -BIG, BIG, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(0.2, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -900; z < 900; z += 9) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false); }
plane(3.3, 3.45, -BIG, BIG, markMat, 0.08, 50); plane(-3.45, -3.3, -BIG, BIG, markMat, 0.08, 50);
// speed limit 50 sign
function limitSign(x, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), STD('#9e9e9e')); p.position.y = 1.2; g.add(p);
  const t = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 128, 124, 0, 7); c.fill(); c.lineWidth = 30; c.strokeStyle = '#d50000'; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.stroke(); c.fillStyle = '#111'; c.font = '900 120px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('50', 128, 136); });
  const s = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), new THREE.MeshBasicMaterial({ map: t })); s.position.set(0, 2.4, 0.04); g.add(s); const b = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), STD('#9e9e9e')); b.rotation.y = Math.PI; b.position.set(0, 2.4, 0.03); g.add(b); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
limitSign(4.4, 34); limitSign(4.4, -140);
// roadside billboard (right way ending)
const BBZ = -58, BBX = 12.5;
const bbTex = { blank: canvasTex(1024, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#ad1457'); g.addColorStop(1, '#ff4081'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.font = '900 64px Inter'; c.fillText('FLASH-PROOF', 44, 92); c.fillText('SUNGLASSES', 44, 166);
    c.fillStyle = '#ffeb3b'; c.font = '800 38px Inter'; c.fillText('Look fabulous', 44, 246); c.fillText('at ANY speed!', 44, 292);
    c.fillStyle = '#212121'; c.beginPath(); c.roundRect(40, 352, 330, 100, 20); c.fill(); c.fillStyle = '#ffeb3b'; c.font = '900 30px Inter'; c.fillText('ONLY', 62, 384); c.font = '900 46px Inter'; c.fillText('€4,000', 140, 412);
    // sunglasses
    c.save(); c.translate(745, 250); c.fillStyle = '#111'; for (const s of [-1, 1]) { c.beginPath(); c.roundRect(s > 0 ? 20 : -200, -70, 180, 120, [20, 20, 70, 70]); c.fill(); } c.fillRect(-25, -60, 50, 16); c.fillRect(-235, -62, 40, 12); c.fillRect(195, -62, 40, 12);
    c.fillStyle = 'rgba(255,255,255,0.55)'; for (const x of [-170, 50]) { c.beginPath(); c.moveTo(x, -50); c.lineTo(x + 40, -50); c.lineTo(x + 10, 20); c.lineTo(x - 20, 20); c.closePath(); c.fill(); } c.restore();
    c.save(); c.translate(905, 95); c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 22 : 58; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore();
    c.fillStyle = '#fff'; c.font = '700 22px Inter'; c.textAlign = 'right'; c.fillText('*fine not included', 1000, 480); }),
  safe: canvasTex(1024, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#1565c0'); g.addColorStop(1, '#42a5f5'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffd54f'; c.font = '900 66px Inter'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('SAFE DRIVER', 50, 120); c.fillText('OF THE MONTH', 50, 200); c.fillStyle = '#fff'; c.font = '800 40px Inter'; c.fillText('50 means 50. Fabulous.', 50, 290);
    // little green car
    c.save(); c.translate(760, 330); c.fillStyle = '#35d43a'; c.beginPath(); c.roundRect(-190, -60, 380, 90, 30); c.fill(); c.beginPath(); c.roundRect(-110, -130, 200, 90, 30); c.fill(); c.fillStyle = '#1a2633'; c.beginPath(); c.roundRect(-95, -118, 170, 62, 18); c.fill(); c.fillStyle = '#222'; for (const x of [-110, 110]) { c.beginPath(); c.arc(x, 32, 44, 0, 7); c.fill(); } c.fillStyle = '#ccc'; for (const x of [-110, 110]) { c.beginPath(); c.arc(x, 32, 18, 0, 7); c.fill(); } c.restore();
    c.save(); c.translate(900, 110); c.fillStyle = '#ffd54f'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 30 : 70; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }) };
const bbFace = new THREE.MeshStandardMaterial({ map: bbTex.blank, roughness: 0.6 });
{ const g = new THREE.Group(); g.position.set(BBX, 0, BBZ); g.rotation.y = -0.35; scene.add(g); const b = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 0.3), [STD('#78909c'), STD('#78909c'), STD('#78909c'), STD('#78909c'), bbFace, STD('#78909c')]); b.position.y = 6.5; g.add(b);
  for (const x of [-3.5, 3.5]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 0.35), STD('#607d8b')); p.position.set(x, 1.8, -0.2); g.add(p); } g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- the fashion photographer (speed camera) ----------------
const cam3 = new THREE.Group(); scene.add(cam3); cam3.position.set(CX, 0, 0);
const camHead = new THREE.Group(); camHead.position.set(0, CY, 0); cam3.add(camHead);
const brows = [], camArms = [], lidM = [];
let beret, flashPanel, polaroid, mustache;
{ const grey = STD('#cfd8dc', { roughness: 0.4, metalness: 0.3 }), dark = STD('#263238'), blk = STD('#111');
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, CY - 0.4, 10), STD('#90a4ae', { metalness: 0.5 })); pole.position.y = (CY - 0.4) / 2; cam3.add(pole);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 1.2), grey); camHead.add(box);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 1.4), dark); hood.position.set(0, 0.46, 0.08); camHead.add(hood);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.25, 24).rotateX(Math.PI / 2), blk); lens.position.set(-0.16, -0.02, 0.72); camHead.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshStandardMaterial({ color: '#3949ab', metalness: 0.9, roughness: 0.05 })); glass.position.set(-0.16, -0.02, 0.85); camHead.add(glass);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), new THREE.MeshBasicMaterial({ color: '#ffffff' })); glint.position.set(-0.08, 0.06, 0.86); camHead.add(glint);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.31, 24, 0, Math.PI), STD('#b0bec5')); lid.position.set(-0.16, -0.02, 0.87); lid.scale.y = 0.01; camHead.add(lid); lidM.push(lid);
  flashPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), new THREE.MeshStandardMaterial({ color: '#fffde7', emissive: '#ffffff', emissiveIntensity: 0.2 })); flashPanel.position.set(0.28, 0.06, 0.61); camHead.add(flashPanel);
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.04), blk); b.position.set(-0.16 + s * 0.17, 0.34, 0.7); camHead.add(b); b.userData.s = s; brows.push(b); }
  // curly moustache
  mustache = new THREE.Group(); mustache.position.set(-0.16, -0.33, 0.66); camHead.add(mustache);
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 18, Math.PI * 1.3), blk); m.position.set(s * 0.12, 0, 0); m.rotation.set(0, 0, s > 0 ? -0.4 : Math.PI + 0.4); m.scale.x = s; mustache.add(m); }
  // beret
  beret = new THREE.Group(); beret.position.set(0.05, 0.5, 0.05); camHead.add(beret); const br = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 10), STD('#1a1a1a', { roughness: 0.9 })); br.scale.set(1, 0.28, 1); beret.add(br); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), STD('#1a1a1a')); st.position.y = 0.17; beret.add(st); beret.rotation.z = -0.25;
  // red scarf
  const sc = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.08, 8, 20), STD('#e53935')); sc.rotation.x = Math.PI / 2; sc.position.y = CY - 0.55; cam3.add(sc); const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.05), STD('#e53935')); tail.position.set(0.14, CY - 0.9, 0.18); tail.rotation.z = 0.2; cam3.add(tail);
  // arms with white gloves
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(s * 0.5, -0.1, 0.1); camHead.add(a); const up = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 6), blk); up.position.y = -0.27; a.add(up); const el = new THREE.Group(); el.position.y = -0.55; a.add(el); const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 6), blk); lo.position.y = -0.22; el.add(lo); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), STD('#fafafa')); gl.position.y = -0.47; el.add(gl); a.userData.s = s; a.userData.el = el; camArms.push(a); }
  // polaroid (right way)
  polaroid = new THREE.Group(); camHead.add(polaroid); const pf = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.46, 0.01), STD('#fafafa')); polaroid.add(pf); const pi = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.3), new THREE.MeshBasicMaterial({ map: bbTex.safe })); pi.position.set(0, 0.04, 0.006); polaroid.add(pi);
  cam3.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const camLegs = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.22, -0.42, 0.05); camHead.add(g); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6), STD('#111')); l.position.y = -0.25; g.add(l); const sh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.26), STD('#fafafa')); sh.position.set(0, -0.53, 0.05); g.add(sh); g.visible = false; return g; });
const sigTex = canvasTex(256, 192, (c, w, h) => { c.fillStyle = '#fffef7'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1a237e'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, 120); c.bezierCurveTo(50, 30, 80, 30, 70, 120); c.bezierCurveTo(90, 60, 120, 60, 115, 120); c.bezierCurveTo(140, 70, 160, 140, 180, 90); c.bezierCurveTo(195, 60, 215, 110, 232, 80); c.stroke(); c.beginPath(); c.moveTo(40, 150); c.lineTo(220, 140); c.stroke(); c.fillStyle = '#e91e63'; c.font = '900 34px Inter'; c.fillText('♥', 200, 175); });
const sigNote = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), new THREE.MeshStandardMaterial({ map: sigTex, roughness: 0.8, side: THREE.DoubleSide })); camHead.add(sigNote); sigNote.visible = false;
const flashLight = new THREE.PointLight('#ffffff', 0, 40, 1.2); scene.add(flashLight); flashLight.position.set(CX - 0.6, CY + 0.2, 1.2);

// ---------------- hero ----------------
const hero = makeCar('#35d43a');
const armUp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 1, 8).translate(0, 0.5, 0), STD('#1e88e5')); hero.add(armUp); armUp.position.set(0.0, 1.45, 0.1);
const handM = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), STD('#f1c27d')); hero.add(handM);
function zTable(vfn, t0, dir) { const tab = []; let z = 0; for (let i = 0; i < 7000; i++) { tab.push(z); z += dir * vfn(t0 + i / 60) / 60; } return t => { const k = clamp((t - t0) * 60, 0, tab.length - 2), i = Math.floor(k); return lerp(tab[i], tab[i + 1], k - i); }; }
// wrong, part A: approach, speed up, pose-pass #0 at tFlash0
const T_P0 = tFlash0 + 0.02;
const vA = t => t < tSpeedUp ? 14 : lerp(14, 32, ease(clamp((t - tSpeedUp) / 1.6)));
const zA0 = zTable(vA, 0, -1); const zA = t => zA0(t) - zA0(T_P0);
// part B: brake, U-turn at Z_UT, race back (+z) past the camera at tPast, zig-zag flashes
const T_BR = T_P0 + 0.6, Z_UT = -40, T_UT0 = tTurn - 0.3, T_UT1 = tTurn + 0.9, T_P1 = tPast + 0.05;
const zigPts = [[tF1 - 0.2, 26], [tF1 + 0.2, -26], [tF2 + 0.2, 26], [tF3 + 0.2, -26], [tF3 + 0.6, -55]];
function heroPose(t) {
  const right = t >= tRew0 + 0.5;
  if (right) return poseRight(t);
  const P = { x: LANE, y: 0, z: 0, h: 0, pitch: 0, roll: 0 };
  // magazine cover pose (freeze)
  if (t > tWeek - 0.15 && t < tRew0) return { x: 0.9, y: 0.0, z: 9.5, h: 0.55, pitch: 0, roll: 0.42 };
  if (t < T_BR) { P.z = zA(t); const k = win(t, T_P0 - 0.55, T_P0 + 0.5, 0.25); P.pitch = 0.32 * k; return P; }      // wheelie pass
  if (t < T_UT0) { const zb = zA(T_BR); const u = clamp((t - T_BR) / (T_UT0 - T_BR)); P.z = lerp(zb, Z_UT, 1 - (1 - u) * (1 - u)); return P; }
  if (t < T_UT1) { const u = ease(clamp((t - T_UT0) / (T_UT1 - T_UT0))); P.z = Z_UT - 3 * Math.sin(Math.PI * u); P.x = lerp(LANE, -LANE, u); P.h = Math.PI * u; P.roll = -0.12 * Math.sin(Math.PI * u); return P; }
  if (t < tF1 - 0.2) { const u = clamp((t - T_UT1) / (T_P1 - T_UT1)); P.x = -LANE; P.h = Math.PI; P.z = Z_UT + (0 - Z_UT) * (u * u * (1.6 - 0.6 * u)) * 1 + (t > T_P1 ? 30 * (t - T_P1) : 0); if (t > T_P1) P.z = 30 * (t - T_P1); P.z = Math.min(P.z, 26); P.h += 2 * Math.PI * ease(clamp((t - T_P1 + 0.45) / 0.9)); return P; }   // spin pass
  // zig-zag passes for the triple flash
  let i = 0; while (i < zigPts.length - 2 && zigPts[i + 1][0] <= t) i++; const [ta, za] = zigPts[i], [tb, zb] = zigPts[i + 1]; const u = clamp((t - ta) / (tb - ta)); const dir = Math.sign(zb - za);
  // three poses for the photographer: pirouette jump, handstand, backflip (slows right at the camera for each photo)
  const v = 2 * u - 1, sv = i < 3 ? 0.12 * v + 0.88 * v * v * v : v; P.z = lerp(za, zb, i < 3 ? (sv + 1) / 2 : u);
  P.h = dir < 0 ? 0 : Math.PI; P.x = dir < 0 ? LANE : -LANE; const k = Math.sin(Math.PI * u);
  if (i === 0) { P.y = 2.4 * k; P.h += 2 * Math.PI * ease(u); }                       // jump + 360 pirouette, wheels down
  if (i === 1) { P.pitch = -Math.PI / 2; P.y = 2.32 + 0.12 * k; P.roll = 0.06 * Math.sin(t * 20); }   // handstand on its nose
  if (i === 2) { const th = 2 * Math.PI * ease(u); P.pitch = th; P.y = 0.75 + 2.7 * k - 0.75 * Math.cos(th); const dz = -0.75 * Math.sin(th); P.x += dz * Math.sin(P.h); P.z += dz * Math.cos(P.h); }   // backflip around its centre
  return P;
}
// right: steady 50 km/h; passes the camera, slows down and stops; the camera jumps off its pole and runs after you
const VR = 13.9, T_PASS_R = tJumps - 0.5, DEC = 5.4, Z_STOPR = -VR * DEC / 2;
function poseRight(t) { if (t < T_PASS_R) return { x: LANE, y: 0, z: VR * (T_PASS_R - t), h: 0, pitch: 0, roll: 0 }; const u = Math.min(t - T_PASS_R, DEC); return { x: LANE, y: 0, z: -(VR * u - VR * u * u / (2 * DEC)), h: 0, pitch: 0, roll: 0 }; }
const T_HOP0 = tJumps - 0.05, T_HOP1 = tJumps + 0.55, T_RUN1 = tAutograph - 0.35, YG = 1.0;
const SPOT = V3(LANE + 1.75, YG, Z_STOPR - 0.25);
function walker(t) { // world position + heading of the camera head in the right way (null = on its pole)
  if (t < T_HOP0) return null;
  const top = V3(CX, CY, 0), land = V3(CX - 1.0, YG, -1.8);
  if (t < T_HOP1) { const u = clamp((t - T_HOP0) / (T_HOP1 - T_HOP0)); const p = top.clone().lerp(land, u); p.y += 1.2 * Math.sin(Math.PI * u); return { p, ry: lerp(0, Math.PI, ease(u)), walk: 0, legs: u > 0.3 }; }
  if (t < T_RUN1) { const u = clamp((t - T_HOP1) / (T_RUN1 - T_HOP1)); const e = u * u * (3 - 2 * u); const p = land.clone().lerp(SPOT, e); p.y += 0.12 * Math.abs(Math.sin(t * 14)); return { p, ry: Math.PI - 0.25 * Math.sin(Math.PI * u) , walk: t * 18, legs: true }; }
  const turnFace = ease(clamp((t - T_RUN1) / 0.5)), turnBack = ease(clamp((t - tSticks + 0.3) / 0.6));
  let ry = lerp(lerp(Math.PI, -Math.PI / 2 + 2 * Math.PI, turnFace), 2 * Math.PI, turnBack);
  const p = SPOT.clone(); let walk = 0;
  if (t > tCant - 0.1 && t < tFan - 0.2) { const k = t - tCant + 0.1; p.x += 0.35 * Math.sin(k * 3.1); p.z += 0.5 * Math.sin(k * 2.3) + 0.5; ry += 0.6 * Math.sin(k * 4); walk = t * 10; }
  if (t > tFan - 0.2) { p.z += 0.5 * (1 - ease(clamp((t - tFan + 0.2) / 0.6))) ; p.y += 0.1 * Math.abs(Math.sin(t * 9)); }
  return { p, ry, walk, legs: true };
}

// ---------------- camera ----------------
const Ac = (p, l) => () => [V3(...p), V3(...l)];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2])]; };
const cut = (t0, f) => [[t0, f], [t0 + 0.04, f]];
const FACE = [Ac([3.1, 3.9, 5.2], [CX - 0.2, CY + 0.05, 0]), Ac([3.2, 3.85, 5.0], [CX - 0.2, CY + 0.05, 0])];
const POV = Ac([CX - 0.4, CY - 0.2, 0.9], [0.9, 1.0, 9.5]);
const camKeys = [
  [0.0, Hf([1.0, 2.6, 9], [1.5, 2.2, -30])],
  [tDifferent - 0.3, Hf([1.0, 2.5, 8.5], [1.8, 2.3, -30])],
  ...cut(tDifferent - 0.25, Ac([2.4, 4.3, 8.5], [CX - 0.2, CY, 0])),
  [tFashion - 0.3, Ac([2.6, 4.1, 7.0], [CX - 0.2, CY, 0])],
  [tWhat - 0.3, FACE[0]],
  ...cut(tWhat - 0.25, Ac([-6, 6, 22], [2, 1.5, 0])),
  [S('hook2').end + 0.5, Ac([-6, 5.8, 21], [2, 1.5, 0])],
  // wrong
  ...cut(S('wrong1').start - 0.3, Hf([1.0, 2.6, 9], [1.5, 2.2, -30])),
  [tPose - 0.3, Hf([1.0, 2.4, 8.5], [1.5, 2.0, -30])],
  ...cut(tPose - 0.25, Ac([6.2, 1.5, -6.5], [1.4, 1.2, 10])),
  [tBig - 0.2, Ac([6.2, 1.5, -6.5], [1.4, 1.2, 4])],
  ...cut(tBig - 0.15, FACE[0]),
  [tTurn - 0.35, FACE[1]],
  ...cut(tTurn - 0.3, Ac([-9, 8, -18], [0, 0.6, -38])),
  [tRace - 0.2, Ac([-9, 8, -17], [0, 0.6, -34])],
  ...cut(tRace - 0.15, Ac([-6.5, 1.6, -7], [1.0, 1.1, -1])),
  [tAndAgain - 0.25, Ac([-6.5, 1.6, -7], [1.0, 1.1, 2])],
  ...cut(tAndAgain - 0.2, Ac([-8, 2.6, -4.5], [1.0, 1.2, 2.5])),
  [tF1 - 0.3, Ac([-8, 2.6, -4.5], [1.0, 1.2, 2.5])],
  ...cut(tF1 - 0.25, Ac([-14, 2.6, -1.0], [1.5, 2.3, 0.4])),
  [tWeek - 0.2, Ac([-13.6, 2.6, -0.9], [1.5, 2.3, 0.4])],
  ...cut(tWeek - 0.15, POV),
  [tRew0 + 0.45, POV],
  // right
  [tRew0 + 0.55, Hf([1.0, 2.6, 9], [1.5, 2.2, -30])],
  [tLimit - 0.4, Hf([1.0, 2.6, 9], [1.5, 2.2, -30])],
  ...cut(tLimit - 0.35, Hf([-2.6, 1.6, -5.6], [0, 1.0, 0])),
  [tBored - 0.5, Hf([-2.6, 1.6, -5.6], [0, 1.0, 0])],
  ...cut(tBored - 0.45, FACE[0]),
  [tJumps - 0.4, FACE[1]],
  ...cut(tJumps - 0.35, Ac([-4.0, 3.6, 9.5], [CX - 0.6, 2.4, -0.8])),
  [tRuns - 0.2, Ac([-4.0, 3.4, 8.5], [CX - 1.0, 1.8, -2])],
  ...cut(tRuns - 0.15, t => { const w = walker(t); return [V3(w.p.x + 6.5, 2.8, w.p.z + 6), V3(w.p.x - 1, 0.9, w.p.z - 3)]; }),
  [tAutograph - 0.35, t => { const w = walker(t); return [V3(w.p.x + 6.2, 2.7, w.p.z + 5.5), V3(w.p.x - 1, 0.9, w.p.z - 2.5)]; }],
  ...cut(tAutograph - 0.3, Ac([LANE + 7.5, 2.6, Z_STOPR + 5.5], [LANE + 1.6, 1.1, Z_STOPR - 0.3])),
  [tSign - 0.35, Ac([LANE + 7.2, 2.5, Z_STOPR + 5.0], [LANE + 1.6, 1.1, Z_STOPR - 0.3])],
  ...cut(tSign - 0.3, Ac([LANE + 5.4, 2.0, Z_STOPR + 3.4], [LANE + 1.3, 1.15, Z_STOPR - 0.2])),
  [tSticks - 0.35, Ac([LANE + 5.2, 2.0, Z_STOPR + 3.2], [LANE + 1.3, 1.15, Z_STOPR - 0.2])],
  ...cut(tSticks - 0.3, Ac([SPOT.x - 0.1, 1.15, SPOT.z + 3.0], [SPOT.x, 1.0, SPOT.z])),
  [tCant - 0.3, Ac([SPOT.x - 0.1, 1.2, SPOT.z + 2.8], [SPOT.x, 1.0, SPOT.z])],
  ...cut(tCant - 0.25, Ac([SPOT.x + 1.5, 2.4, SPOT.z + 7.5], [SPOT.x - 0.6, 0.9, SPOT.z])),
  [tFan - 0.3, Ac([SPOT.x + 1.4, 2.3, SPOT.z + 7.0], [SPOT.x - 0.6, 0.9, SPOT.z])],
  ...cut(tFan - 0.25, Ac([LANE + 3.6, 2.0, Z_STOPR + 5.0], [LANE + 1.0, 1.1, Z_STOPR])),
  [S('outro').start + 0.4, Ac([LANE + 4.0, 2.6, Z_STOPR + 6.5], [LANE + 1.0, 1.1, Z_STOPR])],
  [TOTAL - 0.4, Ac([-6, 10, Z_STOPR + 22], [2, 1.0, Z_STOPR])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = b === a ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u) };
}

// ---------------- update ----------------
const FLASHES_W = [tFlash0, tF1, tF2, tF3];
const flashK = t => { const right = t >= tRew0 + 0.5; const list = right ? [] : FLASHES_W; return list.reduce((m, f) => Math.max(m, t >= f ? Math.exp(-(t - f) * 9) : 0), 0); };
function update(t) {
  const right = t >= tRew0 + 0.5;
  const hp = heroPose(t); placeCar(hero, hp);
  // photographer mood
  const excited = !right && t > tPose - 0.3 && t < tWeek ? 1 : 0, bored = right && t > tBored - 0.4 && t < tImpressed - 0.1 ? 1 : 0, touched = right && t > tImpressed - 0.1 ? 1 : 0;
  brows.forEach(b => { b.rotation.z = b.userData.s * (excited ? -0.35 : bored ? 0.3 : touched ? -0.15 : 0); b.position.y = excited ? 0.38 : bored ? 0.28 : 0.34; });
  lidM.forEach(l => l.scale.y = bored ? 0.55 : 0.01 + 0.99 * win(t, 2.9, 3.15, 0.08));
  beret.rotation.z = -0.25 + (bored ? -0.35 : 0) + (excited ? 0.12 * Math.sin(t * 6) : 0); beret.position.y = 0.5 - (bored ? 0.06 : 0);
  mustache.rotation.z = excited ? 0.15 * Math.sin(t * 10) : 0; mustache.scale.y = bored ? 0.7 : 1;
  camHead.rotation.set(bored ? 0.18 : 0, excited ? 0.12 * Math.sin(t * 3) : 0, bored ? 0.1 : 0);
  // camera head follows the car when it passes (wrong) / looks at it (right)
  const look = Math.atan2(hp.x - CX, Math.max(1.5, hp.z)); camHead.rotation.y += clamp(look * 0.5, -0.6, 0.6);
  camArms.forEach(a => { const s = a.userData.s, el = a.userData.el; a.rotation.set(0, 0, s * 0.3); el.rotation.set(0, 0, 0);
    if (excited) { a.rotation.set(-0.4, 0, s * (2.4 + 0.3 * Math.sin(t * 9 + s))); el.rotation.set(0, 0, s * 0.6); }
    if (!right && t > tGorgeous - 0.1 && t < tFaster + 0.6 && s > 0) { a.rotation.set(-1.3, 0, 0.6); el.rotation.set(0, 0, 0.3 + 0.4 * Math.sin(t * 12)); }
    if (bored) { a.rotation.set(0, 0, s * 0.12); el.rotation.set(0, 0, 0); }
    if (touched) { a.rotation.set(-0.9, 0, s * 0.9); el.rotation.set(0, 0, s * 1.4); }
    const W_ = right ? walker(t) : null;
    if (W_ && t > T_HOP1 && t < T_RUN1) { a.rotation.set(0.9 * Math.sin(t * 18 + (s > 0 ? Math.PI : 0)), 0, s * 0.35); el.rotation.set(0, 0, 0); }
    if (W_ && t > T_RUN1 && t < tSticks - 0.3) { a.rotation.set(s > 0 ? -1.2 : 0, 0, s * (s > 0 ? 0.3 : 0.5)); el.rotation.set(0, 0, s > 0 ? 0.4 * Math.sin(t * 6) : 0); }
    if (W_ && t > tCant - 0.1 && t < tFan - 0.2) { a.rotation.set(-1.5, 0, s * 0.3); el.rotation.set(0, 0, s * 0.3 * Math.sin(t * 7)); }
    if (right && t > tCare - 0.1) { a.rotation.set(-0.2, 0, s * 2.6); el.rotation.set(0, 0, s * 0.4 + 0.2 * Math.sin(t * 9)); }
    if (right && t > tFan - 0.2) { a.rotation.set(-1.4, 0, s * 0.9); el.rotation.set(0, 0, -s * 1.2); } });
  // flash
  const fk = flashK(t); flashPanel.material.emissiveIntensity = 0.2 + 6 * fk; flashLight.intensity = 400 * fk;
  polaroid.visible = false;
  // walking camera (right): off the pole, legs, autograph note
  const Wk = right ? walker(t) : null; camLegs.forEach((g, i) => { g.visible = !!(Wk && Wk.legs); g.rotation.x = Wk && Wk.walk ? 0.7 * Math.sin(Wk.walk + i * Math.PI) : 0; });
  if (Wk) { camHead.position.copy(Wk.p).sub(cam3.position); camHead.rotation.set(0, Wk.ry, 0); } else camHead.position.set(0, CY, 0);
  sigNote.visible = right && t > tSign - 0.05;
  if (sigNote.visible) { const k = clamp((t - tSign + 0.05) / 0.7); const onLens = ease(clamp((t - tSticks - 0.1) / 0.8));
    sigNote.position.set(lerp(0.28, -0.16, onLens), lerp(0.06, -0.02, onLens), lerp(0.615, 0.9, onLens) + 0.25 * Math.sin(Math.PI * onLens)); sigNote.scale.set(lerp(0.75, 1.25, onLens) * k, lerp(0.75, 1.3, onLens), 1); sigNote.rotation.set(0, 0, lerp(0, -0.12, onLens) + 0.3 * Math.sin(Math.PI * onLens)); }
  // billboard texture
  bbFace.map = right ? bbTex.safe : bbTex.blank;
  // driver signs through the passenger window (right)
  const sv = right ? win(t, tSign - 0.4, tSign + 1.1, 0.25) : 0; armUp.visible = handM.visible = sv > 0.02;
  if (armUp.visible) { armUp.position.set(0.55, 1.05, -0.15); armUp.scale.set(1, 1.15 * sv, 1); armUp.rotation.set(0, 0, -1.45 + 0.08 * Math.sin(t * 22)); const tip = V3(0, 1.15 * sv, 0).applyEuler(armUp.rotation).add(armUp.position); handM.position.copy(tip); }
  const c = cam(t); camera.near = clamp(c.p.y * 0.3, 0.3, 2.0); camera.updateProjectionMatrix();
  applyCam(c, t, 0);
}

// ---------------- HUD ----------------
function flashHud(t) { const k = flashK(t); if (k < 0.02) return; ctx.save(); ctx.fillStyle = `rgba(255,255,255,${(t > tF1 - 0.05 && t < tWeek ? 0.4 : 0.85) * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function above(pos, txt, t, a, b, size = 100, col = '#fff', rot = 0) { if (t < a || t > b) return; const p = project(pos); if (!p.ok) return; floatText(txt, p.x, p.y, t, a, b, size, col, rot); }
function magazine(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2), k = 1 + 0.06 * (1 - ease(clamp((t - a) / 0.5)));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  ctx.lineWidth = 44; ctx.strokeStyle = '#fff'; ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.fillStyle = '#d50000'; ctx.font = '900 250px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('SPEED', W / 2, 560);
  ctx.fillStyle = '#fff'; ctx.font = '800 34px Inter'; ctx.fillText('THE MAGAZINE FOR FAST PEOPLE · ISSUE 312', W / 2, 615);
  ctx.textAlign = 'left'; ctx.lineJoin = 'round'; const line = (txt, y, size, col) => { ctx.font = `900 ${size}px Inter`; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#000'; ctx.strokeText(txt, 80, y); ctx.fillStyle = col; ctx.fillText(txt, 80, y); };
  if (t > tSpeeder - 0.1) { line('SPEEDER', 1430, 140, YEL); line('OF THE YEAR', 1560, 110, YEL); }
  line('EXCLUSIVE:', 1680, 46, '#fff'); line('312 KM/H IN A 50 ZONE', 1735, 46, '#fff');
  ctx.fillStyle = '#fff'; ctx.fillRect(W - 250, H - 230, 170, 130); ctx.fillStyle = '#000'; for (let i = 0; i < 24; i++) ctx.fillRect(W - 240 + i * 6.5, H - 220, (i % 3 ? 2 : 4), 90); ctx.restore(); }
function fineCard(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2), k = back(clamp((t - a) / 0.4));
  ctx.save(); ctx.fillStyle = `rgba(0,0,0,${0.45 * f})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = f; ctx.translate(W / 2, 900); ctx.rotate(-0.04); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fffdf5'; rr(-400, -330, 800, 660, 16); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#1565c0'; ctx.fillRect(-400, -330, 800, 110); ctx.fillStyle = '#fff'; ctx.font = '900 58px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SPEEDING FINE', 0, -275);
  ctx.fillStyle = '#333'; ctx.font = '700 40px Inter'; ctx.fillText('Measured: 312 km/h · Limit: 50', 0, -160); ctx.fillText('Photos taken: 4 (all gorgeous)', 0, -100);
  ctx.fillStyle = '#d50000'; ctx.font = '900 110px Inter'; if (t > tFour - 0.1) ctx.fillText('€4,000', 0, 30);
  if (t > tGone - 0.15) { const s = lerp(2.2, 1, easeOut(clamp((t - tGone + 0.15) / 0.25))); ctx.save(); ctx.translate(0, 200); ctx.rotate(-0.16); ctx.scale(s, s); ctx.lineWidth = 12; ctx.strokeStyle = '#d50000'; rr(-310, -70, 620, 140, 14); ctx.stroke(); ctx.fillStyle = '#d50000'; ctx.font = '900 76px Inter'; ctx.fillText('LICENCE: GONE', 0, 6); ctx.restore(); }
  ctx.restore(); }
function polaroidHud(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2), k = 1 + 0.05 * (1 - ease(clamp((t - a) / 0.5)));
  ctx.save(); ctx.globalAlpha = f; const x0 = 110, y0 = 380, w = W - 220, h = 900; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, y0 - 40); ctx.fillRect(0, y0 + h + 230, W, H); ctx.fillRect(0, 0, x0 - 40, H); ctx.fillRect(x0 + w + 40, 0, W, H);
  ctx.lineWidth = 80; ctx.strokeStyle = '#fafafa'; ctx.strokeRect(x0 - 40 + 40, y0 - 40 + 40, w, h); ctx.fillStyle = '#fafafa'; ctx.fillRect(x0 - 40, y0 + h, w + 80, 230);
  ctx.fillStyle = '#e91e63'; ctx.font = 'italic 900 72px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('just art ♥', W / 2, y0 + h + 115); ctx.restore(); }
function hud(t) {
  const right = t >= tRew0 + 0.5;
  flashHud(t);
  if (!right) {
    pill('SPEED CAMERA AHEAD', W / 2, 420, '#424242', '#fff', 46, win(t, 1.0, tDifferent - 0.1, 0.2), back((t - 1.0) / 0.35), iconWarn);
    pill('PROFESSION: FASHION PHOTOGRAPHER', W / 2, 420, '#000', '#fff', 38, win(t, tFashion - 0.2, S('hook2').end + 0.4, 0.2), back((t - tFashion + 0.2) / 0.35));
    pill('SPEED UP & POSE', W / 2, 420, RED, '#fff', 50, win(t, tSpeedUp - 0.2, tBig - 0.1, 0.2), back((t - tSpeedUp + 0.2) / 0.35), iconX);
    floatText('FLASH!', W / 2, 720, t, tFlash0, tFlash0 + 0.7, 140, '#fff59d', -0.06);
    above(V3(CX - 0.2, CY + 1.1, 0), 'GORGEOUS, DARLING!', t, tGorgeous, tAgain0 - 0.05, 72, '#ff80ab', -0.05);
    above(V3(CX - 0.2, CY + 1.1, 0), 'AGAIN!', t, tAgain0, tFaster - 0.05, 100, '#ff80ab', 0.06);
    above(V3(CX - 0.2, CY + 1.1, 0), 'FASTER!', t, tFaster, tTurn - 0.3, 110, '#ff80ab', -0.06);
    pill('SPEED: 312 KM/H', W / 2, 420, RED, '#fff', 50, win(t, tRace - 0.2, tWeek - 0.2, 0.2), back((t - tRace + 0.2) / 0.35), iconWarn);
    [tF1, tF2, tF3].forEach((f, i) => floatText('FLASH!', W / 2 + (i - 1) * 180, 700 + i * 60, t, f, f + 0.5, 110, '#fff59d', (i - 1) * 0.1));
    magazine(t, tWeek - 0.1, tInside - 0.1);
    fineCard(t, tInside - 0.1, tRew0);
  } else {
    pill('LIMIT: 50', W / 2, 420, '#d50000', '#fff', 52, win(t, tLimit - 0.3, tCalm - 0.2, 0.2), back((t - tLimit + 0.3) / 0.35), iconCheck);
    pill('CALM · STEADY · BOTH HANDS', W / 2, 420, GREEN, '#fff', 42, win(t, tCalm - 0.2, tBored - 0.4, 0.2), back((t - tCalm + 0.2) / 0.35), iconCheck);
    pill('PHOTOGRAPHER: BORED', W / 2, 420, '#607d8b', '#fff', 46, win(t, tBored - 0.4, tImpressed - 0.2, 0.2), back((t - tBored + 0.4) / 0.35));
    pill('PHOTOGRAPHER: IMPRESSED', W / 2, 420, '#ec407a', '#fff', 44, win(t, tImpressed - 0.2, tRuns - 0.2, 0.2), back((t - tImpressed + 0.2) / 0.35), iconHeart);
    pill('NEW HOBBY: RUNNING', W / 2, 420, '#00838f', '#fff', 46, win(t, tRuns - 0.2, tAutograph - 0.3, 0.2), back((t - tRuns + 0.2) / 0.35));
    above(camHead.getWorldPosition(V3(0, 0, 0)).add(V3(0, 1.0, 0)), 'AUTOGRAPH, PLEASE!', t, tAutograph - 0.1, tSign - 0.3, 70, '#ff80ab', -0.05);
    pill('SIGNED!', W / 2, 420, GREEN, '#fff', 54, win(t, tSign - 0.2, tSticks - 0.3, 0.2), back((t - tSign + 0.2) / 0.35), iconCheck);
    pill('VISIBILITY: ZERO', W / 2, 420, '#424242', '#fff', 48, win(t, tCant - 0.2, tCare - 0.2, 0.2), back((t - tCant + 0.2) / 0.35), iconWarn);
    pill('HAPPINESS: 100%', W / 2, 420, '#f9a825', '#fff', 48, win(t, tCare - 0.2, tFan - 0.2, 0.2), back((t - tCare + 0.2) / 0.35), iconHeart);
    pill('BIGGEST FAN EVER', W / 2, 420, '#d81b60', '#fff', 50, win(t, tFan - 0.2, S('right7').start, 0.2), back((t - tFan + 0.2) / 0.35), iconHeart);
    if (t > tCare - 0.1 && t < S('right7').start) { const p = project(camHead.getWorldPosition(V3(0, 0, 0)).add(V3(0, 0.8, 0))); if (p.ok) for (let i = 0; i < 5; i++) { const u = ((t - tCare) * 0.7 + i / 5) % 1; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u); iconHeart(p.x + 80 * Math.sin(i * 2.1 + u * 3), p.y - u * 260, 26 + 8 * (i % 2), '#ff4d7a'); ctx.restore(); } }
  }
}
window.dbg = { heroPose, cam };
start(update, hud);
