// Episode 36: Roadworks – the STOP/GO man is a parrot
// hook (old style): roadworks, one lane, someone with a sign (hidden behind it) -> reveal: a parrot
// wrong: honk at him -> parrots copy everything: HONK! HONK! -> the whole family flies in, honking ->
//        they think the shiny car is a giant egg, carry it up into their nest on top of the crane -> you sit on it. 3 weeks.
// right: offer a cracker -> best friends -> teach him "please" -> he spins the sign to GO, the digger gets a stern STOP ->
//        drive through slowly, he waves you off -> promoted to site manager (golden hard hat)
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, BIG,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tAhead = WT('hook1', 'ahead'), tOne = WT('hook1', 'One'), tSomeone = WT('hook1', 'Someone'), tSign0 = WT('hook1', 'sign');
const tBut = WT('hook2', 'But'), tParrot = WT('hook2', 'parrot'), tWhat = WT('hook2', 'What');
const tImp = WT('wrong1', 'impatient'), tHonk = WT('wrong1', 'honk');
const tBig = WT('wrong2', 'Big'), tCopy = WT('wrong2', 'copy'), tH1 = WT('wrong2', 'Honk', 0), tH2 = WT('wrong2', 'Honk', 1), tThen = WT('wrong2', 'then'), tFamily = WT('wrong2', 'family'), tFlies = WT('wrong2', 'flies'), tHonking = WT('wrong2', 'Honking');
const tThink = WT('wrong3', 'think'), tShiny = WT('wrong3', 'shiny'), tEgg = WT('wrong3', 'egg'), tCarry = WT('wrong3', 'carry'), tInto = WT('wrong3', 'into'), tNest = WT('wrong3', 'nest'), tCrane = WT('wrong3', 'crane'), tNow = WT('wrong3', 'Now'), tSit = WT('wrong3', 'sit'), tFor = WT('wrong3', 'For'), tWeeks = WT('wrong3', 'weeks');
const tDont = WT('right2', 'Don'), tWind = WT('right2', 'Wind'), tOffer = WT('right2', 'offer'), tCracker = WT('right2', 'cracker');
const tNow2 = WT('right3', 'Now'), tFriend = WT('right3', 'friend'), tTeach = WT('right3', 'teach'), tPlease = WT('right3', 'please');
const tSpins = WT('right4', 'spins'), tGo = WT('right4', 'GO'), tAnd = WT('right4', 'And'), tDigger = WT('right4', 'digger'), tIt = WT('right4', 'It'), tStern = WT('right4', 'stern'), tStop = WT('right4', 'STOP');
const tDrive = WT('right5', 'Drive'), tWaves = WT('right5', 'waves'), tWing = WT('right5', 'wing');
const tPromo = WT('right6', 'Parrot'), tPromoted = WT('right6', 'promoted'), tManager = WT('right6', 'manager');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: a country road with roadworks ----------------
const RX = 3.6;                        // road half width
const CRX = 11, CRZ = -24, CRH = 22;   // crane
makeLandscape({ avoid: (x, z) => Math.abs(x) < 9 && Math.abs(z) < 400 || (Math.abs(x - CRX) < 12 && Math.abs(z - CRZ) < 12) || (x < -2 && x > -40 && z < -20 && z > -60), fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 10 && Math.abs(z) - d / 2 < 400, near: [0, -20, 120, 300], trees: 1400, seed: 241 });
plane(-RX, RX, -BIG, BIG, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -400; z < 400; z += 8) if (z > 6 || z < -40) dl.push([0, 0.08, z]); instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.14, 800); g2.rotateX(-Math.PI / 2); instanced(g2, markMat, [[RX - 0.25, 0.08, 0], [-RX + 0.25, 0.08, 0]], false);
  const g3 = new THREE.PlaneGeometry(3.3, 0.35); g3.rotateX(-Math.PI / 2); instanced(g3, markMat, [[1.8, 0.081, -3.6]], false); }   // stop line
const vergeM = L('#9c8f6e'); { for (const s of [1, -1]) { const v = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 800), vergeM); v.position.set(s * (RX + 0.6), 0.03, 0); v.receiveShadow = true; scene.add(v); } }

// barriers (red/white boards on feet)
const stripeT = canvasTex(256, 32, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e53935'; for (let x = -32; x < w + 32; x += 64) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 32, 0); c.lineTo(x + 64, 0); c.lineTo(x + 32, h); c.fill(); } });
const boardM = L('#ffffff', { map: stripeT }), footM = L('#37474f'), coneM = L('#ff6d00'), coneW = L('#fafafa');
function barrier(x, z, ry, len = 1.7) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.26, 0.05), boardM); b.position.y = 0.95; g.add(b);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.05), boardM); b2.position.y = 0.45; g.add(b2);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), footM); p.position.set(s * (len / 2 - 0.1), 0.55, 0); g.add(p); const f = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.6), footM); f.position.set(s * (len / 2 - 0.1), 0.04, 0); g.add(f);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), STD('#ffb300', { emissive: '#ff8f00', emissiveIntensity: 0.8 })); lamp.position.set(s * (len / 2 - 0.1), 1.15, 0); g.add(lamp); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }
function cone(x, z) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 12), coneM); c.position.set(x, 0.39, z); c.castShadow = true; scene.add(c);
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.14, 0.12, 12), coneW); r.position.set(x, 0.42, z); scene.add(r);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), footM); b.position.set(x, 0.09, z); scene.add(b); }
const WZ0 = -9.6, WZ1 = -34;            // works zone (right lane blocked)
barrier(0.95, WZ0, 0); barrier(2.7, WZ0, 0);
for (let z = WZ0 - 1.0; z > WZ1; z -= 1.9) barrier(0.12, z, Math.PI / 2);
barrier(0.95, WZ1, 0); barrier(2.7, WZ1, 0);
for (let z = 10; z > WZ0; z -= 3.2) cone(0.15, z - 0.2);
for (let z = WZ1 - 1; z > WZ1 - 12; z -= 3.2) cone(0.15, z);
// trench + dirt pile + roller
{ const tr = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 12), L('#4e342e')); tr.position.set(2.0, 0.075, -19); scene.add(tr);
  const dm = L('#8d6e63', { flatShading: true }); for (const [x, z, s] of [[2.2, -27.5, 1.3], [2.8, -26.2, 0.9], [1.6, -28.8, 0.8]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.1, 7), dm); p.position.set(x, s * 0.5, z); p.castShadow = p.receiveShadow = true; scene.add(p); }
  const sh = new THREE.Group(); sh.position.set(1.2, 0, -14.5); sh.rotation.set(0.2, 0.4, -0.35); scene.add(sh);
  const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), L('#8d6e63')); hd.position.y = 0.8; sh.add(hd); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.03), STD('#90a4ae', { metalness: 0.6 })); bl.position.y = 0.12; sh.add(bl); }
// roadworks sign before the works
{ const g = new THREE.Group(); g.position.set(RX + 0.9, 0, 9); g.rotation.y = -0.25; scene.add(g);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), STD('#9e9e9e', { metalness: 0.5 })); p.position.y = 0.8; g.add(p);
  const st = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#d32f2f'; c.beginPath(); c.moveTo(w / 2, 8); c.lineTo(w - 6, h - 20); c.lineTo(6, h - 20); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(w / 2, 50); c.lineTo(w - 44, h - 42); c.lineTo(44, h - 42); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(128, 118, 11, 0, 7); c.fill(); c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = '#111'; c.beginPath(); c.moveTo(128, 132); c.lineTo(118, 168); c.lineTo(100, 196); c.moveTo(118, 168); c.lineTo(134, 196); c.moveTo(124, 142); c.lineTo(150, 160); c.stroke(); c.lineWidth = 6; c.beginPath(); c.moveTo(150, 150); c.lineTo(162, 196); c.stroke(); c.fillRect(150, 188, 34, 10); });
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), L('#fff', { map: st, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); b.position.y = 1.9; g.add(b);
  const pb = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.34, 0.03), L('#fff', { map: canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#ffeb3b'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '900 34px Inter'; c.textAlign = 'center'; c.fillText('ONE LANE', w / 2, 45); }) })); pb.position.y = 1.15; g.add(pb);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// tower crane
const latT = canvasTex(128, 128, (c, w, h) => { c.strokeStyle = '#fbc02d'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.lineWidth = 7; c.beginPath(); c.moveTo(6, 6); c.lineTo(w - 6, h - 6); c.moveTo(w - 6, 6); c.lineTo(6, h - 6); c.stroke(); }, true);
function lattice(w, h, d, x, y, z, rx, ry) { const t = latT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide })); m.position.set(x, y, z); scene.add(m); return m; }
lattice(1.6, CRH, 1.6, CRX, CRH / 2, CRZ, 1, CRH / 1.6);
lattice(26, 1.1, 1.1, CRX - 11, CRH + 0.15, CRZ, 26 / 1.1, 1);          // jib over the road
lattice(8, 1.1, 1.1, CRX + 4.5, CRH + 0.15, CRZ, 8 / 1.1, 1);            // counter jib
{ const cw = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 1.6), L('#9e9e9e')); cw.position.set(CRX + 7.4, CRH - 0.3, CRZ); cw.castShadow = true; scene.add(cw);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.5), L('#fbc02d')); cab.position.set(CRX - 1.5, CRH - 1.0, CRZ + 0.2); cab.castShadow = true; scene.add(cab);
  const cg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 1.2), STD('#263238', { roughness: 0.1, metalness: 0.8 })); cg.position.set(CRX - 2.26, CRH - 0.9, CRZ + 0.2); scene.add(cg);
  const plat = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.3, 5.0), L('#fbc02d')); plat.position.set(CRX, CRH + 0.85, CRZ); plat.castShadow = plat.receiveShadow = true; scene.add(plat);
  const base = new THREE.Mesh(new THREE.BoxGeometry(4, 0.8, 4), L('#9e9e9e')); base.position.set(CRX, 0.4, CRZ); base.castShadow = base.receiveShadow = true; scene.add(base);
  const cab2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 9, 4), L('#333')); cab2.position.set(CRX - 13, CRH - 4.5, CRZ); scene.add(cab2);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.09, 8, 16, Math.PI * 1.4), STD('#e53935')); hook.position.set(CRX - 13, CRH - 9.2, CRZ); scene.add(hook); }
// the nest on top of the crane
const NY = CRH + 1.0;
const twigT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#8d6e3f'; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.strokeStyle = ['#6d4c2a', '#a1824f', '#5d4024', '#b8975e'][i % 4]; c.lineWidth = 3 + (i % 3); c.beginPath(); const x = hash(i) * w, y = hash(i + 50) * h, a = hash(i + 99) * 0.8 - 0.4; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 70, y + Math.sin(a) * 30); c.stroke(); } }, true);
twigT.repeat.set(6, 1);
{ const n = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.75, 12, 36), L('#ffffff', { map: twigT })); n.rotation.x = Math.PI / 2; n.position.set(CRX, NY + 0.45, CRZ); n.castShadow = n.receiveShadow = true; scene.add(n);
  const nb = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.4, 0.5, 30), L('#ffffff', { map: twigT })); nb.position.set(CRX, NY + 0.1, CRZ); nb.receiveShadow = true; scene.add(nb);
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6 + hash(i) * 0.8, 4), L('#7a5a33')); s.position.set(CRX + Math.cos(a) * 3.1, NY + 0.6, CRZ + Math.sin(a) * 3.1); s.rotation.set(0.9 * (hash(i + 3) - 0.5), a, 1.2 + hash(i + 9) * 0.5); scene.add(s); }
  const feather = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), L('#29b6f6')); feather.scale.set(0.08, 0.04, 0.45); feather.position.set(CRX + 2.2, NY + 1.15, CRZ + 1.9); feather.rotation.y = 0.8; scene.add(feather); }

// ---------------- parrots ----------------
function makeParrot(col = { body: '#e53935', wing2: '#fdd835', wing3: '#1e88e5', face: '#ffffff' }, vest = false) {
  const P = new THREE.Group(); scene.add(P); const bodyM = STD(col.body, { roughness: 0.7 }), w2 = STD(col.wing2, { roughness: 0.7 }), w3 = STD(col.wing3, { roughness: 0.7 });
  const greyM = STD('#757575', { roughness: 0.8 });
  for (const s of [-1, 1]) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.38, 6), greyM); lg.position.set(s * 0.15, 0.19, 0.02); P.add(lg);
    for (const a of [-0.5, 0, 0.5]) { const toe = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.14, 3, 6), greyM); toe.rotation.set(Math.PI / 2, a, 0); toe.position.set(s * 0.15 + Math.sin(a) * 0.08, 0.03, 0.06 + Math.cos(a) * 0.06); P.add(toe); } }
  const B = new THREE.Group(); B.position.y = 0.36; P.add(B);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), bodyM); body.scale.set(0.42, 0.62, 0.4); body.position.y = 0.58; B.add(body);
  const tail = new THREE.Group(); tail.position.set(0, 0.22, -0.3); B.add(tail);
  [[bodyM, 0, 0.62], [w3, -0.08, 0.5], [w3, 0.08, 0.5]].forEach(([m, x, l]) => { const f = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), m); f.scale.set(0.09, l, 0.035); f.position.set(x, -l * 0.8, 0); tail.add(f); }); tail.rotation.x = 0.45;
  const Hd = new THREE.Group(); Hd.position.y = 1.22; B.add(Hd);
  const hm = new THREE.Mesh(new THREE.SphereGeometry(0.3, 22, 16), bodyM); Hd.add(hm);
  for (const s of [-1, 1]) { const fp = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), STD(col.face, { roughness: 0.8 })); fp.scale.set(0.6, 0.85, 0.7); fp.position.set(s * 0.16, 0.0, 0.17); Hd.add(fp); }
  const eyes = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.13, 0.07, 0.235); Hd.add(g);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), STD('#ffffff', { roughness: 0.3 })); g.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), STD('#111', { roughness: 0.2 })); p.position.z = 0.06; g.add(p);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), STD('#fff', { emissive: '#fff', emissiveIntensity: 1 })); hl.position.set(0.015, 0.02, 0.1); g.add(hl);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), bodyM); lid.rotation.x = -1.6; g.add(lid);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.03, 0.03), STD('#3e2723')); brow.position.set(0, 0.11, 0.06); g.add(brow);
    return { g, p, lid, brow, s }; });
  const beakU = new THREE.Group(); beakU.position.set(0, 0.0, 0.25); Hd.add(beakU);
  { const bu = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), STD('#f3ead4', { roughness: 0.45 })); bu.scale.set(0.1, 0.12, 0.13); bu.position.set(0, 0.0, 0.04); beakU.add(bu);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 10), STD('#f3ead4', { roughness: 0.45 })); tip.rotation.x = Math.PI / 2 + 1.0; tip.position.set(0, -0.09, 0.13); beakU.add(tip);
    const tt = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), STD('#424242')); tt.position.set(0, -0.17, 0.17); beakU.add(tt); }
  const beakL = new THREE.Group(); beakL.position.set(0, -0.07, 0.23); Hd.add(beakL);
  { const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), STD('#3a3a3a', { roughness: 0.5 })); bl.scale.set(0.075, 0.05, 0.1); bl.position.set(0, -0.02, 0.03); beakL.add(bl);
    const tg = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), STD('#ef9a9a')); tg.position.set(0, 0.02, 0.04); beakL.add(tg); }
  const wings = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.36, 0.95, -0.02); B.add(g);
    [[bodyM, -0.3, 0.1, 0.36, 0.25], [w2, -0.58, 0.095, 0.16, 0.23], [w3, -0.8, 0.09, 0.2, 0.19]].forEach(([m, y, a, b, c]) => { const f = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), m); f.scale.set(a, b, c); f.position.set(s * 0.04, y, -0.03); g.add(f); });
    return g; });
  let vestM = null;
  if (vest) { const vt = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#ff6d00'; c.fillRect(0, 0, w, h); c.fillStyle = '#e0e0e0'; c.fillRect(0, 34, w, 16); c.fillRect(0, 84, w, 16); c.fillStyle = '#fff59d'; c.fillRect(0, 38, w, 8); c.fillRect(0, 88, w, 8); });
    vestM = STD('#ffffff', { map: vt, roughness: 0.6, side: THREE.DoubleSide, emissive: '#ff6d00', emissiveIntensity: 0.08 });
    const v = new THREE.Mesh(new THREE.CylinderGeometry(0.405, 0.43, 0.55, 26, 1, true), vestM); v.position.y = 0.6; v.scale.set(1.06, 1, 1.04); B.add(v);
    const v2 = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.4, 0.22, 26, 1, true), vestM); v2.position.y = 0.97; v2.scale.set(1.06, 1, 1.04); B.add(v2); }
  // golden hard hat (site manager)
  const hat = new THREE.Group(); hat.position.y = 0.19; Hd.add(hat); hat.visible = false;
  { const gm = STD('#ffca28', { roughness: 0.25, metalness: 0.65, emissive: '#ff8f00', emissiveIntensity: 0.12 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.29, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), gm); dome.scale.set(1, 0.85, 1.05); hat.add(dome);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 26), gm); brim.position.set(0, 0.0, 0.04); hat.add(brim);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.5), gm); ridge.position.y = 0.22; hat.add(ridge);
    const star = new THREE.Mesh(new THREE.CircleGeometry(0.07, 5), STD('#fff', { emissive: '#fff8e1', emissiveIntensity: 0.6 })); star.position.set(0, 0.13, 0.27); star.rotation.x = -0.4; hat.add(star); }
  P.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { P, B, Hd, eyes, beakU, beakL, wings, tail, hat, body };
}
// pose helper: o = {x,y,z,yaw, beak(0-1), wingL, wingR: [rx, rz], lean, headTilt, headYaw, blink, brow, look:[x,y]}
function poseParrot(p, o, t) {
  p.P.position.set(o.x, o.y || 0, o.z); p.P.rotation.set(0, o.yaw || 0, 0);
  p.B.rotation.x = o.lean || 0; p.B.position.y = 0.36 + (o.bob || 0);
  p.Hd.rotation.set(o.headPitch || 0, o.headYaw || 0, o.headTilt || 0, 'YXZ');
  p.beakL.rotation.x = 0.75 * (o.beak || 0); p.beakU.rotation.x = -0.18 * (o.beak || 0);
  const wl = o.wingL || [0, 0], wr = o.wingR || [0, 0];   // wingL = side -1 (holds sign), wingR = side +1
  p.wings[0].rotation.set(wl[0], 0, -wl[1]); p.wings[1].rotation.set(wr[0], 0, wr[1]);
  const bl = o.blink != null ? o.blink : (Math.sin(t * 2.1 + (o.x || 0)) > 0.985 ? 1 : 0);
  p.eyes.forEach(e => { e.lid.rotation.x = lerp(-1.6, -0.15, bl); e.brow.rotation.z = -e.s * (o.brow || 0) * 0.5; e.brow.position.y = 0.11 - 0.025 * (o.brow || 0);
    e.p.position.x = (o.look ? o.look[0] : 0) * 0.025; e.p.position.y = (o.look ? o.look[1] : 0) * 0.025; });
  p.tail.rotation.x = 0.45 + 0.08 * Math.sin(t * 2.3);
}
const polly = makeParrot(undefined, true);
const famCols = [
  { body: '#43a047', wing2: '#fdd835', wing3: '#1565c0', face: '#fff59d' },
  { body: '#1e88e5', wing2: '#ffca28', wing3: '#0d47a1', face: '#ffffff' },
  { body: '#ec407a', wing2: '#ffee58', wing3: '#26c6da', face: '#ffffff' },
  { body: '#ff9800', wing2: '#e53935', wing3: '#43a047', face: '#fff9c4' },
  { body: '#7e57c2', wing2: '#4dd0e1', wing3: '#ffee58', face: '#ffffff' },
  { body: '#26a69a', wing2: '#ff7043', wing3: '#5c6bc0', face: '#ffffff' },
];
const fam = famCols.map(c => { const p = makeParrot(c); p.P.scale.setScalar(0.62); return p; });

// STOP / GO sign (world positioned near Polly)
const signG = new THREE.Group(); scene.add(signG);
const disk = new THREE.Group(); signG.add(disk); disk.position.y = 1.9;
{ const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 8), STD('#eeeeee', { metalness: 0.4 })); pole.position.y = 0.95; signG.add(pole);
  const faceTex = (txt, bg) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, 7); c.fill(); c.fillStyle = bg; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 14, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = `900 ${txt.length > 2 ? 78 : 118}px Inter`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 6); });
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 32), STD('#e0e0e0')); rim.rotation.x = Math.PI / 2; disk.add(rim);
  const f1 = new THREE.Mesh(new THREE.CircleGeometry(0.43, 32), STD('#fff', { map: faceTex('STOP', '#d32f2f'), roughness: 0.5, emissive: '#ffffff', emissiveIntensity: 0.12, emissiveMap: faceTex('STOP', '#d32f2f') })); f1.position.z = 0.027; disk.add(f1);
  const f2 = new THREE.Mesh(new THREE.CircleGeometry(0.43, 32), STD('#fff', { map: faceTex('GO', '#2e7d32'), roughness: 0.5, emissive: '#ffffff', emissiveIntensity: 0.12, emissiveMap: faceTex('GO', '#2e7d32') })); f2.position.z = -0.027; f2.rotation.y = Math.PI; disk.add(f2);
  signG.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- digger (faces +z, in the left lane beyond the works) ----------------
const dig = new THREE.Group(); scene.add(dig);
const digUp = new THREE.Group(); dig.add(digUp); digUp.position.y = 0.75;
const boom = new THREE.Group(), stick = new THREE.Group();
const digEyes = [];
{ const yM = STD('#fbc02d', { roughness: 0.5 }), dM = STD('#37474f', { roughness: 0.8 });
  for (const s of [-1, 1]) { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.75, 3.6), dM); tr.position.set(s * 1.05, 0.37, 0); dig.add(tr); }
  const bd = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 2.8), yM); bd.position.set(0, 0.55, -0.2); digUp.add(bd);
  const cw = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.6), dM); cw.position.set(0, 0.6, -1.65); digUp.add(cw);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 1.3), yM); cab.position.set(-0.6, 1.7, 0.45); digUp.add(cab);
  const gl = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.05), STD('#90caf9', { roughness: 0.1, metalness: 0.3 })); gl.position.set(-0.6, 1.8, 1.11); digUp.add(gl);
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(-0.6 + s * 0.22, 1.85, 1.15); digUp.add(g);
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20), STD('#fff', { emissive: '#fff', emissiveIntensity: 0.2 })); g.add(w);
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), STD('#111')); p.position.z = 0.01; g.add(p);
    const lid = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), yM); lid.position.set(0, 0.27, 0.02); g.add(lid);
    digEyes.push({ g, p, lid, s }); }
  boom.position.set(0.45, 1.1, 1.0); digUp.add(boom);
  const bm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 3.2), yM); bm.position.z = 1.6; boom.add(bm);
  stick.position.z = 3.2; boom.add(stick);
  const sk = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 2.2), yM); sk.position.z = 1.1; stick.add(sk);
  const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.6), dM); bucket.position.set(0, -0.15, 2.3); stick.add(bucket);
  for (let i = -1; i <= 1; i++) { const tth = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 5), STD('#bdbdbd', { metalness: 0.6 })); tth.position.set(i * 0.3, -0.5, 2.45); tth.rotation.x = Math.PI; stick.add(tth); }
  dig.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const DIGX = -1.8, DIGZ1 = -43.5;
function digState(t) {
  const right = isRight(t); const st = { z: -95, pitch: 0, boom: -0.55, stick: 1.3, eyeSad: 0, look: 0 };
  if (!right) { st.z = -95; return st; }
  const t0 = tAnd - 1.0, t1 = tStop + 0.05;   // drives towards the works ... stern STOP: brakes hard
  const zFree = u => lerp(-75, DIGZ1 - 3.0, u);
  if (t < t1) st.z = zFree(clamp((t - t0) / (t1 - t0 + 0.6)));
  else { const z1 = zFree(clamp((t1 - t0) / (t1 - t0 + 0.6))); st.z = lerp(z1, DIGZ1, easeOut(clamp((t - t1) / 0.35))); }
  const br = win(t, t1, t1 + 0.9, 0.12); st.pitch = 0.09 * br * Math.cos((t - t1) * 14) * Math.exp(-(t - t1) * 3);
  st.boom = lerp(-0.55, 0.32, ramp(t, t1 + 0.15, t1 + 0.9)); st.stick = lerp(1.3, 1.65, ramp(t, t1 + 0.15, t1 + 0.9));   // arm droops sadly
  st.eyeSad = ramp(t, t1, t1 + 0.4);
  return st;
}

// ---------------- hero + driver ----------------
const hero = makeCar('#fff3d6');
hero.userData.body.roughness = 0.12; hero.userData.body.metalness = 0.55;
const HX = 1.8, HZW = -5.8;                // waiting position
const appr = t => HZW + 46 * Math.pow(1 - clamp(t / 3.3), 2.2);
// right way: drive through slowly in the left lane, back to the right lane after the works
const T_D0 = tDrive - 0.1, T_D1 = S('right6').start + 3.0;
const passPts = [[HX, HZW], [HX, HZW - 2.0], [-1.7, -14], [-1.75, -30], [-1.4, -36], [HX, -47], [HX, -90]];
const passCurve = new THREE.CatmullRomCurve3(passPts.map(([x, z]) => V3(x, 0, z)), false, 'centripetal');
const passLen = passCurve.getLength();
function heroRight(t) {
  if (t < T_D0) return { x: HX, y: 0, z: HZW, h: 0, pitch: 0, roll: 0 };
  const tt = t - T_D0, v = 4.2; const s = clamp((tt < 1.5 ? 0.5 * v * tt * tt / 1.5 : v * (tt - 0.75)) / passLen, 0, 0.999);
  const a = passCurve.getPointAt(s), b = passCurve.getPointAt(Math.min(1, s + 0.002));
  return { x: a.x, y: 0, z: a.z, h: Math.atan2(-(b.x - a.x), -(b.z - a.z)), pitch: 0, roll: 0 };
}
// wrong way: lifted into the nest
const T_L0 = tCarry - 0.25, T_L1 = tCrane + 0.3;
const liftA = V3(HX, 0, HZW), liftC = V3(4.5, 30, -12), liftB = V3(CRX, NY + 0.32, CRZ);
function heroWrong(t) {
  if (t < 3.3) return { x: HX, y: 0, z: appr(t), h: 0, pitch: 0, roll: 0 };
  let p = { x: HX, y: 0, z: HZW, h: 0, pitch: 0, roll: 0 };
  const hk = win(t, tHonk - 0.05, tHonk + 0.35, 0.08); p.pitch = -0.02 * hk; p.y = 0.03 * hk;
  // parrots inspecting the "egg": a little wobble
  if (t > tEgg - 0.3 && t < T_L0) { p.roll = 0.025 * Math.sin((t - tEgg) * 9) * win(t, tEgg - 0.3, T_L0, 0.2); }
  if (t >= T_L0) { const u = ease(clamp((t - T_L0) / (T_L1 - T_L0))); const q = 1 - u;
    const P = liftA.clone().multiplyScalar(q * q).add(liftC.clone().multiplyScalar(2 * q * u)).add(liftB.clone().multiplyScalar(u * u));
    const lift0 = ramp(t, T_L0, T_L0 + 0.8);   // first straight up a bit
    p = { x: P.x, y: Math.max(P.y, 1.6 * lift0 * (1 - u)), z: P.z, h: lerp(0, 0.9, u), pitch: 0.12 * Math.sin(Math.PI * u), roll: 0.08 * Math.sin(t * 5) * Math.sin(Math.PI * u) };
    if (t > T_L1) { const k = clamp((t - T_L1) / 0.5); p.y = NY + 0.32 - 0.12 * Math.sin(Math.PI * k) * (1 - k); }
  }
  return p;
}
const heroPose = t => isRight(t) ? heroRight(t) : heroWrong(t);
// driver
function makePerson(shirt, pants = '#37474f', skinC = '#f1c27d') {
  const g = new THREE.Group(); const skin = STD(skinC), sh = STD(shirt), pm = STD(pants);
  const tor = new THREE.Group(); tor.position.y = 0.92; g.add(tor);
  const torM = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.42, 4, 12), sh); torM.position.y = 0.28; tor.add(torM);
  const hd = new THREE.Group(); hd.position.y = 0.76; tor.add(hd); hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), skin));
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), STD('#4e342e')); hair.position.y = 0.03; hd.add(hair);
  for (const s of [-1, 1]) { const ew = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), STD('#fff')); ew.position.set(s * 0.065, 0.04, 0.15); hd.add(ew); const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), STD('#111')); e.position.set(s * 0.065, 0.04, 0.19); hd.add(e); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12), STD('#6d2b1f')); mouth.position.set(0, -0.07, 0.17); hd.add(mouth);
  const hips = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.92, 0); g.add(hip); const th = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.9, 8), pm); th.position.y = -0.45; hip.add(th); const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.26), STD('#111')); shoe.position.set(0, -0.9, 0.05); hip.add(shoe); return hip; });
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.28, 0.5, 0); tor.add(a); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.58, 8), sh); m.position.y = -0.29; a.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), skin); h.position.y = -0.62; a.add(h); return a; });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return { g, tor, hd, arms, hips };
}
const drv = makePerson('#2b6cb0');
// arm out of the passenger window with a cracker (attached to the hero)
const armG = new THREE.Group(); hero.add(armG); armG.position.set(0.55, 1.12, -0.15);
const cracker = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.2), L('#ffcc66', { map: canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#e8b04f'; c.fillRect(0, 0, w, h); c.fillStyle = '#9a6a1e'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.beginPath(); c.arc(8 + x * 16, 8 + y * 16, 2.5, 0, 7); c.fill(); } }) }));
{ const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.6, 8), STD('#2b6cb0')); sl.rotation.z = Math.PI / 2; sl.position.x = 0.3; armG.add(sl);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), STD('#f1c27d')); hand.position.x = 0.64; armG.add(hand);
  cracker.position.set(0.7, 0.07, 0); armG.add(cracker); armG.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const crackerB = cracker.clone(); scene.add(crackerB);    // cracker in the beak

// ---------------- Polly state ----------------
const PX = 4.35, PZ = -7.4;
function pollyState(t) {
  const right = isRight(t);
  const o = { x: PX, z: PZ, yaw: 0, beak: 0, wingL: [-0.55, 0.12], wingR: [0, 0.08], lean: 0, headTilt: 0, headYaw: 0, headPitch: 0, brow: 0, look: [0, 0], bob: 0 };
  o.bob = 0.012 * Math.sin(t * 2.4);
  // sign pose: hidden face (hook) -> raised aside
  o.signHide = t < tParrot - 0.15 ? 1 : 1 - ease(clamp((t - tParrot + 0.15) / 0.4));
  if (o.signHide > 0.01) o.wingL = [lerp(-0.55, -1.15, o.signHide), lerp(0.12, -0.35, o.signHide)];
  if (t > tParrot && t < tWhat + 1.0) { const k = win(t, tParrot + 0.1, tWhat + 0.9, 0.2); o.headTilt = 0.35 * k * Math.sin(Math.min(1, (t - tParrot) * 2) * Math.PI / 2); o.beak = 0.6 * win(t, tParrot + 0.25, tParrot + 0.6, 0.08); }
  if (!right) {
    o.look = [-0.6, 0];
    // copying the honks
    const hk = tb => win(t, tb - 0.03, tb + 0.32, 0.06);
    const h = Math.max(hk(tH1 + 0.02), hk(tH2 + 0.02), hk(tHonk + 0.45), t > tHonking - 0.05 && t < tThink ? 0.5 + 0.5 * Math.abs(Math.sin((t - tHonking) * 7)) : 0);
    o.beak = Math.max(o.beak, h); o.headPitch = -0.25 * h; o.lean = -0.06 * h;
    if (t > tBig && t < tH1 - 0.2) { o.headTilt = 0.3 * win(t, tBig, tH1 - 0.2, 0.25); }
    if (t > tThink) { o.look = [-0.8, -0.2]; o.headYaw = -0.5 * ramp(t, tThink, tThink + 0.4); }
    if (t > T_L0) { o.look = [-0.5, 0.9]; o.headPitch = -0.45 * ramp(t, T_L0, T_L0 + 0.6); o.headYaw = -0.3; }
  } else {
    o.look = [-0.6, 0];
    // waddle closer for the cracker, take it, munch
    const tTake = tCracker + 0.3;
    const app = ease(clamp((t - tOffer + 0.1) / 0.9)) * (1 - ease(clamp((t - tTake - 0.5) / 0.8)));
    o.x = lerp(PX, 3.75, app); o.z = lerp(PZ, -6.55, app); o.yaw = -0.55 * app; o.lean = 0.35 * win(t, tTake - 0.5, tTake + 0.35, 0.25); o.headPitch = 0.25 * win(t, tTake - 0.5, tTake + 0.35, 0.25);
    o.beak = Math.max(o.beak, 0.7 * win(t, tTake - 0.35, tTake + 0.02, 0.1));
    if (t > tTake + 0.05 && t < tNow2 + 0.9) o.beak = Math.max(o.beak, 0.25 * Math.abs(Math.sin((t - tTake) * 12)));   // munch
    // best friends: happy wiggle + wing flap
    const hf = win(t, tNow2 - 0.1, tTeach, 0.25); o.headTilt += 0.3 * hf * Math.sin(t * 5); o.wingR = [0, lerp(0.08, 1.1 + 0.35 * Math.sin(t * 14), hf)]; o.bob += 0.06 * hf * Math.abs(Math.sin(t * 7));
    // learning "please"
    if (t > tTeach && t < tSpins) { o.headTilt = 0.4 * ramp(t, tTeach, tTeach + 0.4); o.beak = Math.max(o.beak, 0.6 * win(t, tPlease + 0.55, tPlease + 0.95, 0.08)); }
    // spin the sign
    o.wingL = [lerp(-0.55, -0.85, win(t, tSpins - 0.2, tGo + 0.6, 0.2)), 0.12];
    // stern STOP towards the digger: turn round, brows down, point with the free wing
    const tr = ease(clamp((t - tIt + 0.25) / 0.5)) * (1 - ease(clamp((t - tDrive + 0.4) / 0.5)));
    o.yaw = lerp(o.yaw, -Math.PI + 0.25, tr); o.brow = ramp(t, tIt, tIt + 0.3) * (1 - ramp(t, tDrive - 0.4, tDrive)); o.look = tr > 0.5 ? [0, 0] : o.look;
    const pt = win(t, tStern - 0.2, tDrive - 0.3, 0.2); o.wingR = [lerp(o.wingR[0], -1.45, pt), lerp(o.wingR[1], 0.15, pt)];
    o.beak = Math.max(o.beak, 0.5 * win(t, tStop - 0.05, tStop + 0.35, 0.08));
    // waving you off
    const wv = win(t, tWaves - 0.3, S('right6').start, 0.25); if (wv > 0) { o.wingR = [lerp(o.wingR[0], 0, wv), lerp(o.wingR[1], 2.5 + 0.45 * Math.sin((t - tWaves) * 10), wv)]; o.headYaw = -0.45 * wv; o.look = [-0.8, 0]; }
    // promotion: chest out
    const pr = ramp(t, tManager - 0.2, tManager + 0.3); o.lean = lerp(o.lean, -0.12, pr); o.headPitch = lerp(o.headPitch, -0.12, pr); o.look = pr > 0.5 ? [0, 0] : o.look;
    o.hat = back(clamp((t - tPromoted + 0.15) / 0.55));
  }
  return o;
}
// family: fly in from the sky, perch, honk, then carry the car
const perches = [[0.35, 1.68, 0.75], [-0.35, 1.68, -0.6], [-0.45, 1.68, 0.55], [0.4, 1.68, -0.55], [2.8, 0, -3.6], [5.4, 0, -6.6]];   // [x, y, z] (first 4: local to the car roof)
const carryOff = [[0.65, 1.9, 1.3], [-0.65, 1.9, -1.3], [-0.65, 1.9, 1.3], [0.65, 1.9, -1.3], [0, 2.2, 1.9], [0, 2.2, -1.9]];
const nestPerch = [[1.9, 0.75, 1.6], [-2.1, 0.75, 1.0], [2.4, 0.75, -0.5], [-1.4, 0.75, -2.1], [0.4, 0.75, 2.6], [1.0, 0.75, -2.5]];
function famState(i, t, carM) {
  const o = { x: 0, y: 0, z: 0, yaw: 0, beak: 0, wingL: [0, 0.1], wingR: [0, 0.1], look: [0, 0], hidden: true };
  if (isRight(t)) return o;
  const ta = tFamily - 0.4 + i * 0.16, tb = ta + 1.15;
  if (t < ta) return o;
  o.hidden = false;
  const local = i < 4; const pp = perches[i];
  const land = local ? V3(pp[0], pp[1], pp[2]).applyMatrix4(carM) : V3(pp[0], pp[1], pp[2]);
  const from = V3(land.x + (i % 2 ? -9 : 9), land.y + 8 + i * 0.6, land.z + 6 - i * 2);
  const flap = (a = 1.3) => { const f = a + 0.55 * Math.sin(t * 22 + i); return [0, f]; };
  if (t < tb) { const u = clamp((t - ta) / (tb - ta)); const e = easeOut(u); o.x = lerp(from.x, land.x, e); o.y = lerp(from.y, land.y, e) + 1.2 * Math.sin(Math.PI * u) * (1 - u); o.z = lerp(from.z, land.z, e);
    o.yaw = Math.atan2(land.x - from.x, land.z - from.z); o.wingL = o.wingR = flap(); return o; }
  o.x = land.x; o.y = land.y; o.z = land.z; o.yaw = local ? (i % 2 ? 0.9 : -0.9) : (i === 4 ? -0.6 : 0.4);
  const settle = 1 - clamp((t - tb) / 0.4); o.wingL = o.wingR = [0, 0.1 + 1.2 * settle];
  // honking
  if (t > tHonking - 0.1 && t < tThink) o.beak = 0.5 + 0.5 * Math.abs(Math.sin((t - tHonking) * 7 + i * 1.3));
  // inspecting the egg: peck, tilt heads
  if (t > tThink && t < T_L0) { o.headTilt = 0.4 * Math.sin(i + 1) * ramp(t, tThink, tThink + 0.3); o.look = [0, -1]; o.headPitch = 0.4; if (i < 4) o.beak = 0.3 * win(t, tEgg + i * 0.12, tEgg + 0.25 + i * 0.12, 0.05); }
  // carry: fly to positions around the car and lift it
  if (t >= T_L0 - 0.5) { const k = ease(clamp((t - T_L0 + 0.5) / 0.5)); const co = carryOff[i]; const cp = V3(co[0], co[1], co[2]).applyMatrix4(carM);
    o.x = lerp(o.x, cp.x, k); o.y = lerp(o.y, cp.y, k) + 0.08 * Math.sin(t * 11 + i); o.z = lerp(o.z, cp.z, k); o.wingL = o.wingR = flap(1.5); o.beak = 0; o.look = [0, -0.5];
    o.yaw = lerp(o.yaw, heroWrong(t).h + (i % 2 ? 0.25 : -0.25), k);
    if (t > T_L1 + 0.1) { const k2 = ease(clamp((t - T_L1 - 0.1) / 0.8)); const np = nestPerch[i];
      o.x = lerp(o.x, CRX + np[0], k2); o.y = lerp(o.y, NY + np[1], k2); o.z = lerp(o.z, CRZ + np[2], k2); o.wingL = o.wingR = [0, lerp(1.5, 0.15, k2)];
      o.yaw = lerp(o.yaw, Math.atan2(-np[0], -np[2]), k2); o.look = [0, -0.6]; o.headPitch = 0.3 * k2;
      if (t > tNow) { o.headTilt = 0.3 * Math.sin(i * 2.1) * ramp(t, tNow, tNow + 0.4); }
      if (t > tFor) o.beak = 0.35 * win(t, tFor + 0.2 + i * 0.1, tFor + 0.5 + i * 0.1, 0.06); }
  }
  return o;
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + look[0], p.y + look[1], p.z + look[2]), 40]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const SIGNC = Ac([2.75, 1.75, 0.9], [4.25, 1.75, -7.4]);
const POLLYC = Ac([2.55, 1.85, -1.3], [4.3, 1.6, -7.4]);
const WIDE = Ac([-4.5, 9.5, 12.5], [2.4, 0.6, -9]);
const NESTC = Ac([4.6, NY + 3.4, CRZ + 9.5], [CRX - 0.2, NY + 0.9, CRZ]);
const camKeys = [
  [0.0, Hf([-0.6, 3.0, 9.0], [0.6, 1.2, -14])],
  [tOne - 0.3, Hf([-0.8, 3.3, 9.6], [0.4, 1.0, -14])],
  ...cut(tOne - 0.25, Ac([-6.5, 13, 6.5], [1.0, 0, -18])),
  [tSomeone - 0.3, Ac([-6.0, 12, 4.5], [1.6, 0, -16])],
  ...cut(tSomeone - 0.25, Ac([2.9, 1.8, 2.6], [4.25, 1.8, -7.4])),
  [tBut, SIGNC],
  [tParrot - 0.15, Ac([3.0, 1.8, -1.0], [4.3, 1.75, -7.4])],
  [tWhat + 0.15, Ac([3.05, 1.6, -1.9], [4.3, 2.15, -7.4])],
  ...cut(tWhat + 0.2, WIDE),
  [S('wrong1').start - 0.2, Ac([-4.8, 9.8, 12.8], [2.4, 0.6, -9])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([0.6, 2.9, 4.0], [3.0, 1.2, -8])),
  [tHonk - 0.2, Ac([0.8, 2.8, 3.2], [3.0, 1.2, -8])],
  ...cut(tBig - 0.1, POLLYC),
  [tH1 - 0.3, Ac([2.75, 1.82, -2.3], [4.3, 1.65, -7.4])],
  [tThen - 0.2, Ac([2.85, 1.85, -2.6], [4.3, 1.7, -7.4])],
  ...cut(tThen - 0.15, Ac([-2.5, 8.0, 9.0], [2.8, 2.4, -6])),
  [tHonking - 0.3, Ac([-2.2, 7.0, 7.6], [2.8, 1.4, -6])],
  ...cut(tThink - 0.2, Ac([-2.6, 4.6, 1.6], [2.2, 1.5, -6.2])),
  [tCarry - 0.35, Ac([-2.3, 4.4, 1.2], [2.2, 1.6, -6.2])],
  ...cut(tCarry - 0.3, Ac([-5.5, 2.0, 5.0], [1.8, 2.8, -6])),
  [tInto - 0.2, Ac([-5.6, 2.2, 4.6], [2.4, 6.5, -8])],
  ...cut(tInto - 0.15, Hf([-9.5, 0.5, 13], [1.5, -0.5, -4])),
  [tCrane + 0.4, Hf([-9.0, 1.5, 12.5], [1.0, -0.8, -3])],
  ...cut(tNow - 0.2, NESTC),
  [tWeeks + 0.6, Ac([5.0, NY + 3.1, CRZ + 8.8], [CRX - 0.2, NY + 1.0, CRZ])],
  [tRew0, Ac([3.0, NY + 5, CRZ + 13], [CRX, NY, CRZ])],
  // right
  [tRew0 + 0.55, WIDE],
  [tDont - 0.3, WIDE],
  ...cut(tDont - 0.25, Ac([4.6, 2.7, 2.2], [3.4, 1.3, -7])),
  [tOffer - 0.4, Ac([4.5, 2.6, 1.4], [3.4, 1.3, -6.8])],
  ...cut(tOffer - 0.35, Ac([2.6, 2.1, -1.4], [3.4, 1.35, -6.6])),
  [tNow2 - 0.2, Ac([2.65, 2.05, -1.7], [3.6, 1.45, -6.8])],
  ...cut(tNow2 - 0.15, POLLYC),
  [tSpins - 0.4, Ac([2.75, 1.82, -2.3], [4.3, 1.65, -7.4])],
  ...cut(tSpins - 0.35, Ac([2.4, 1.9, -0.6], [4.1, 2.0, -7.6])),
  [tAnd - 0.2, Ac([2.5, 1.95, -0.9], [4.1, 2.0, -7.6])],
  ...cut(tAnd - 0.15, Ac([-4.2, 1.4, -38], [-1.8, 2.0, -70], 28)),
  [tIt - 0.3, Ac([-4.1, 1.5, -39], [-1.8, 2.0, -62], 28)],
  ...cut(tIt - 0.25, Ac([-1.3, 4.3, -50], [4.0, 1.6, -7.6], 6.5)),
  [tStop + 0.9, Ac([-1.25, 4.3, -50], [3.9, 1.6, -7.6], 6)],
  ...cut(tDrive - 0.15, Ac([4.6, 3.8, 6.0], [0.5, 0.8, -16])),
  [tWaves - 0.2, Ac([5.0, 3.4, 2.5], [1.6, 1.0, -18])],
  [S('right6').start - 0.1, Ac([5.2, 3.2, 0.8], [2.0, 1.0, -22])],
  ...cut(tPromo - 0.1, Ac([3.2, 2.0, -2.7], [4.3, 1.85, -7.4])),
  [S('right6').end + 0.3, Ac([3.0, 2.0, -2.3], [4.3, 1.8, -7.4])],
  ...cut(S('right7').start - 0.15, Ac([0.6, 4.0, 1.8], [4.1, 1.5, -8.5])),
  [S('outro').start, Ac([-1.0, 6.5, 5.5], [3.8, 2.6, -12])],
  [TOTAL - 0.3, Ac([-5, 12, 11], [4, 6, -16])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u), fov: lerp(A[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
function update(t) {
  const right = isRight(t);
  // hero
  const hp = heroPose(t); placeCar(hero, hp); hero.updateMatrixWorld(true);
  blink(hero, t, right && t > T_D0 - 0.6 && t < T_D0 + 2.5, false);
  // arm + cracker
  const armK = right ? ease(clamp((t - tWind - 0.3) / 0.6)) * (1 - ease(clamp((t - tNow2 - 0.2) / 0.5))) : 0;
  armG.visible = armK > 0.02; armG.scale.set(Math.max(0.01, armK), 1, 1); armG.rotation.z = -0.15;
  const tTake = tCracker + 0.3; cracker.visible = right && t > tOffer - 0.2 && t < tTake;
  // Polly
  const o = pollyState(t); poseParrot(polly, o, t);
  polly.hat.visible = right && (o.hat || 0) > 0.01; if (polly.hat.visible) { const k = o.hat; polly.hat.position.y = 0.19 + 1.4 * (1 - clamp(k)); polly.hat.rotation.y = (1 - clamp(k)) * 3; }
  polly.P.updateMatrixWorld(true);
  crackerB.visible = right && t >= tTake && t < tNow2 + 0.7; if (crackerB.visible) { const bp = polly.beakU.localToWorld(V3(0, -0.12, 0.16)); crackerB.position.copy(bp); crackerB.rotation.set(0.3, o.yaw, 0); crackerB.scale.setScalar(Math.max(0.01, 1 - clamp((t - tTake - 0.4) / 0.9))); }
  // sign: world transform from Polly's position (hide pose in front of the face / aside in the left wing)
  const sh = o.signHide;
  const yaw = o.yaw; const cs = Math.cos(yaw), sn = Math.sin(yaw);
  const lx = lerp(-0.62, 0.0, sh), lz = lerp(0.3, 0.62, sh), ly = lerp(0.18, -0.3, sh);
  signG.position.set(o.x + lx * cs + lz * sn, ly, o.z - lx * sn + lz * cs);
  let spin = 0; if (right) spin = Math.PI * 3 * ease(clamp((t - tSpins + 0.05) / 0.85));
  signG.rotation.set(0, yaw + spin + (right && t > tIt - 0.25 ? 0 : 0), 0);
  // when Polly turns round to face the digger, the sign must keep STOP towards the digger: compensate
  if (right && t > tSpins) signG.rotation.y = Math.PI * 3 * ease(clamp((t - tSpins + 0.05) / 0.85)) + 0;   // world-fixed after the spin (GO -> +z)
  // family
  const carM = hero.matrixWorld;
  fam.forEach((p, i) => { const s = famState(i, t, carM); p.P.visible = !s.hidden; if (!s.hidden) poseParrot(p, Object.assign({ blink: 0 }, s), t); });
  // driver: sitting on the car (the egg) in the nest
  const dOn = !right && t > tNow - 0.05;
  drv.g.visible = dOn;
  if (dOn) { const k = clamp((t - tNow + 0.05) / 0.55); const top = hero.localToWorld(V3(0, 1.66, 0.15)); const side = hero.localToWorld(V3(1.4, 0.0, 0.1));
    drv.g.position.set(lerp(side.x, top.x, easeOut(k)), lerp(side.y, top.y, k) + 1.3 * Math.sin(Math.PI * k), lerp(side.z, top.z, easeOut(k)));
    drv.g.position.y -= 0.92 * k; drv.g.rotation.set(0, hero.rotation.y + Math.PI * 0.85, 0);
    drv.hips.forEach(h => h.rotation.x = -1.45 * k); drv.hips.forEach((h, j) => h.rotation.z = (j ? 1 : -1) * 0.35 * k);
    drv.arms.forEach((a, j) => { a.rotation.z = (j ? -1 : 1) * (0.25 + 0.5 * k); a.rotation.x = -0.2; });
    if (t > tFor) { drv.arms.forEach((a, j) => { a.rotation.z = (j ? -1 : 1) * (0.9 + 0.45 * Math.abs(Math.sin((t - tFor) * 6))); }); }   // flapping like a hen
    drv.hd.rotation.z = 0.15 * Math.sin(t * 2.5); }
  // digger
  const ds = digState(t); dig.position.set(DIGX, 0, ds.z); dig.rotation.set(ds.pitch, 0, 0); boom.rotation.x = ds.boom; stick.rotation.x = ds.stick;
  digEyes.forEach(e => { e.lid.position.y = lerp(0.27, 0.12, ds.eyeSad); e.lid.rotation.z = -e.s * 0.35 * ds.eyeSad; e.p.position.y = -0.04 * ds.eyeSad; });
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = clamp(c.p.y * 0.12, 0.2, 1.5); camera.updateProjectionMatrix();
  applyCam(c, t, (!right && win(t, T_L1 - 0.05, T_L1 + 0.3, 0.05) > 0) ? 0.05 : 0);
  camera.updateMatrixWorld(true);
  screen = { polly: project(polly.Hd.localToWorld(V3(0, 0.35, 0.1))), car: project(hero.localToWorld(V3(0, 2.0, 0))), win: project(hero.localToWorld(V3(0.9, 1.4, -0.1))), nest: project(V3(CRX, NY + 2.6, CRZ)), dig: project(dig.localToWorld(V3(0, 3.6, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0, dx = 0) => [clamp(p.x + dx, 230, W - 230), clamp(p.y + dy, 560, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -120) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, h / 2 - 4); ctx.lineTo(0, h / 2 + 34); ctx.lineTo(22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function hearts(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; const [x0, y0] = cxy(p, -40);
  for (let i = 0; i < 6; i++) { const u = ((t - a) * 0.55 + i / 6) % 1; ctx.save(); ctx.globalAlpha = win(t, a, b, 0.3) * Math.sin(Math.PI * u); iconHeart(x0 + 90 * Math.sin(i * 2.3 + u * 3), y0 - 260 * u, 26 + 14 * (i % 2), ['#ff4081', '#ff1744', '#f06292'][i % 3]); ctx.restore(); } }
function calendar(t, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2), k = back((t - a) / 0.35); const day = 1 + Math.floor(20 * clamp((t - a - 0.3) / Math.max(0.5, b - a - 0.9)));
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2 + 270, 610); ctx.rotate(0.08); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff'; rr(-110, -120, 220, 240, 22); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = RED; rr(-110, -120, 220, 64, 22); ctx.fill(); ctx.fillRect(-110, -80, 220, 24);
  ctx.fillStyle = '#fff'; ctx.font = '900 38px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DAY', 0, -86);
  ctx.fillStyle = '#111'; ctx.font = '900 104px Inter'; ctx.fillText(String(day), 0, 30); ctx.fillStyle = '#757575'; ctx.font = '800 30px Inter'; ctx.fillText('OF 21', 0, 95); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('ROADWORKS: ONE LANE', '#ef6c00', tAhead - 0.1, tSomeone - 0.2, 46, iconWarn);
    P_('STOP/GO MAN: A PARROT', '#c62828', tParrot - 0.05, S('hook2').end + 0.3, 44);
    bubble('SQUAWK!', screen.polly, t, tParrot + 0.2, tWhat - 0.05, 54, '#fff', '#c62828', -110);
    P_('IMPATIENT. HONK!', RED, tHonk - 0.2, tBig - 0.2, 50, iconX);
    floatText('HONK!', W / 2 - 180, 900, t, tHonk + 0.05, tHonk + 0.9, 100, YEL, -0.1);
    P_('PARROTS COPY EVERYTHING', '#6a1b9a', tCopy - 0.2, tThen - 0.1, 42);
    bubble('HONK!', screen.polly, t, tH1, tH1 + 0.42, 70, YEL, '#111', -130);
    bubble('HONK!', screen.polly, t, tH2, tThen - 0.05, 84, YEL, '#111', -150);
    P_('THE WHOLE FAMILY', '#6a1b9a', tFamily - 0.2, tHonking - 0.2, 50);
    P_('HONK LEVEL: MAXIMUM', RED, tHonking - 0.1, tThink - 0.1, 46);
    [[250, 600], [830, 680], [300, 1000], [800, 1010]].forEach(([x, y], i) => floatText('HONK!', x, y, t, tHonking - 0.05 + i * 0.1, tThink - 0.15, 80, [YEL, '#ffffff', '#ff8a80', YEL][i], (i % 2 ? 0.12 : -0.12)));
    P_('YOUR CAR = A GIANT EGG?', '#f9a825', tShiny - 0.2, tCarry - 0.25, 44);
    bubble('EGG?', screen.car, t, tEgg - 0.1, tCarry - 0.3, 62, '#fff', '#111', -130);
    P_('DESTINATION: THE NEST', '#6d4c41', tNest - 0.25, tNow - 0.2, 44);
    P_('YOUR JOB: SIT ON IT', '#6d4c41', tSit - 0.25, tFor - 0.1, 46);
    P_('INCUBATION: 3 WEEKS', RED, tFor - 0.1, tRew0, 46);
    calendar(t, tFor - 0.05, tRew0);
  } else {
    P_('DON\'T HONK', GREEN, tDont - 0.2, tWind - 0.1, 50, iconCheck);
    P_('OFFER: 1 CRACKER', '#ef6c00', tOffer - 0.2, tNow2 - 0.1, 48);
    floatText('CRUNCH!', W / 2 + 120, 760, t, tCracker + 0.35, tCracker + 1.1, 96, '#ffcc80', 0.08);
    P_('BEST FRIENDS', '#d81b60', tFriend - 0.3, tTeach - 0.1, 52, iconHeart);
    hearts(t, tFriend - 0.3, tTeach + 0.4, screen.polly);
    P_('NEW WORD: PLEASE', '#6a1b9a', tTeach - 0.1, tSpins - 0.15, 48);
    bubble('PLEASE?', screen.win, t, tPlease - 0.05, tPlease + 0.6, 56, '#fff', '#111', -150);
    bubble('PLEASE!', screen.polly, t, tPlease + 0.55, tSpins - 0.1, 64, '#fff', '#6a1b9a', -110);
    P_('SIGN: GO', GREEN, tGo - 0.15, tAnd - 0.1, 56, iconCheck);
    P_('THE DIGGER?', '#f9a825', tDigger - 0.2, tIt - 0.15, 52);
    P_('A VERY STERN STOP', RED, tStern - 0.2, tDrive - 0.15, 48, iconX);
    P_('SLOWLY THROUGH', GREEN, tDrive - 0.1, tWaves - 0.2, 50, iconCheck);
    bubble('DRIVE SAFELY, DARLING!', screen.polly, t, tWaves + 0.1, S('right6').start - 0.1, 44, '#fff', '#2e7d32', -110);
    P_('NEW JOB: SITE MANAGER', '#f9a825', tManager - 0.25, S('right7').start, 46, iconCheck);
  }
}
window.dbg = { heroPose, pollyState, cam };
start(update, hud);
