// Episode 34: Lane change / blind spot – a knight on horseback with a very long lance
// hook (old style): stuck behind a slow lorry, time to overtake, mirror empty... clip clop -> a knight in shining armour in your blind spot
// wrong: swerve over without looking -> insult: visor down, lance forward, joust -> car skewered like a kebab, carried off to the castle,
//        hung on the trophy wall: trophy number twelve
// right: mirror + shoulder check -> there he is -> indicator = royal signal -> fanfare, visor up, bow, lets you in -> overtake with a royal escort
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, BIG,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, floatText, start, rr
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LR = 1.9, LL = -1.9, V = 13, Z0 = 200;
const zB = t => Z0 - V * t;
// ---------------- timing ----------------
const tTime = WT('hook1', 'Time'), tMirror = WT('hook1', 'Mirror'), tBut = WT('hook1', 'But'), tSound = WT('hook1', 'sound');
const tIn = WT('hook2', 'In'), tKnight = WT('hook2', 'knight'), tWith = WT('hook2', 'With'), tLance = WT('hook2', 'lance'), tWhat = WT('hook2', 'What');
const tSwerve = WT('wrong1', 'swerve'), tWithout = WT('wrong1', 'without');
const tBig = WT('wrong2', 'Big'), tCut = WT('wrong2', 'cutting'), tInsult = WT('wrong2', 'insult'), tVisor = WT('wrong2', 'Visor'), tLanceF = WT('wrong2', 'Lance'), tJoust = WT('wrong2', 'joust');
const tPoke = WT('wrong3', 'poke'), tOnLance = WT('wrong3', 'lance'), tKebab = WT('wrong3', 'kebab'), tGallops = WT('wrong3', 'gallops'), tCastle = WT('wrong3', 'castle'), tHangs = WT('wrong3', 'hangs'), tTrophy = WT('wrong3', 'Trophy');
const tMir2 = WT('right2', 'Mirror'), tLook = WT('right2', 'look'), tShoulder = WT('right2', 'shoulder'), tThere = WT('right2', 'there');
const tDont = WT('right3', 'don\'t'), tSwitch = WT('right3', 'Switch'), tIndic = WT('right3', 'indicator'), tRoyal = WT('right3', 'royal');
const tFan = WT('right4', 'Fanfare'), tLifts = WT('right4', 'lifts'), tBows = WT('right4', 'bows'), tLets = WT('right4', 'lets');
const tNow = WT('right5', 'Now'), tOvertake = WT('right5', 'overtake'), tLorry = WT('right5', 'lorry'), tEscort = WT('right5', 'royal');
const tChecked = WT('right6', 'Blind');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: motorway through the countryside, castle on the right ----------------
const CX = 150, CZ = -262, WX = CX - 15;             // castle centre, x of the trophy wall
makeLandscape({ avoid: (x, z) => Math.abs(x + 4) < 26 || (x > CX - 70 && x < CX + 40 && z > CZ - 50 && z < CZ + 50), fieldAvoid: (x, z, w, d) => Math.abs(x + 4) - w / 2 < 28 || (x + w / 2 > CX - 75 && x - w / 2 < CX + 45 && z + d / 2 > CZ - 55 && z - d / 2 < CZ + 55), near: [40, -200, 120, 600], trees: 1500, seed: 134 });
plane(-4.4, 4.4, -BIG, BIG, asphaltMat, 0.06, 7);           // our carriageway
plane(-14.6, -6.0, -BIG, BIG, asphaltMat, 0.06, 7);        // oncoming carriageway
plane(-6.0, -4.4, -BIG, BIG, L('#7cae4a'), 0.05, 7);        // central reservation
{ const g = new THREE.PlaneGeometry(0.18, 4); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -1100; z < 1100; z += 12) { dl.push([0, 0.08, z]); dl.push([-10.3, 0.08, z]); } instanced(g, markMat, dl, false);
  plane(3.85, 4.0, -BIG, BIG, markMat, 0.08, 50); plane(-4.0, -3.85, -BIG, BIG, markMat, 0.08, 50); plane(-6.4, -6.25, -BIG, BIG, markMat, 0.08, 50); plane(-14.3, -14.15, -BIG, BIG, markMat, 0.08, 50); }
// guardrails (posts + rail) at the right edge and in the median
{ const railM = STD('#cfd8dc', { metalness: 0.7, roughness: 0.35 }); const postM = STD('#90a4ae', { metalness: 0.5 });
  for (const x of [5.2, -5.2, -15.6]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 2400), railM); r.position.set(x, 0.62, 0); r.receiveShadow = true; scene.add(r);
    const pts = []; for (let z = -1100; z < 1100; z += 4) pts.push([x + (x > 0 ? 0.12 : -0.12), 0.38, z]); instanced(new THREE.BoxGeometry(0.1, 0.76, 0.1), postM, pts, false); } }
// motorway signs
const signT = canvasTex(1024, 384, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 12; c.strokeRect(14, 14, w - 28, h - 28); c.fillStyle = '#fff'; c.font = '900 88px Inter'; c.textAlign = 'left';
  c.fillText('Camelot  12 km', 60, 140); c.fillText('Castle Joust  3 km', 60, 270); c.fillStyle = '#ffd54f'; c.fillRect(870, 60, 90, 90); c.fillStyle = '#1565c0'; c.font = '900 70px Inter'; c.fillText('A', 890, 130); });
for (const z of [60, -330, -720]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.0), new THREE.MeshLambertMaterial({ map: signT })); s.position.set(7.2, 4.2, z); s.rotation.y = 0.15; scene.add(s);
  for (const dx of [-2.2, 2.2]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8), STD('#90a4ae', { metalness: 0.6 })); p.position.set(7.2 + dx * 0.99, 2.1, z - dx * 0.15); scene.add(p); } }
// oncoming traffic (static scenery, far side)
{ const pc = ['#e53935', '#fdd835', '#ffffff', '#455a64', '#8e24aa', '#fb8c00', '#1e88e5'];
  for (let i = 0; i < 0; i++) { const c = makeCar(pc[i % pc.length]); placeCar(c, { x: i % 2 ? -8.3 : -12.3, y: 0, z: 150 - i * 47 - hash(i) * 20, h: Math.PI, pitch: 0, roll: 0 }); } }

// ---------------- castle with the trophy wall ----------------
const stoneT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#b9b2a6'; c.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = 0; x < 5; x++) { const v = 165 + (hash(x * 13 + y * 7) * 40 | 0); c.fillStyle = `rgb(${v},${v - 5},${v - 14})`; c.fillRect(x * 52 + (y % 2) * 26 - 26, y * 32, 49, 29); } }, [6, 4]);
const stoneM = L('#ffffff', { map: stoneT });
{ const keep = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 36), stoneM); keep.position.set(CX, 10, CZ); keep.castShadow = keep.receiveShadow = true; scene.add(keep);
  const cren = []; for (let k = -17; k <= 17; k += 2.4) { cren.push([CX - 15, 20.7, CZ + k]); cren.push([CX + 15, 20.7, CZ + k]); } for (let k = -14; k <= 14; k += 2.4) { cren.push([CX + k, 20.7, CZ - 18]); cren.push([CX + k, 20.7, CZ + 18]); }
  instanced(new THREE.BoxGeometry(1.3, 1.4, 1.3), stoneM, cren, true);
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) { const tw = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 27, 20), stoneM); tw.position.set(CX + sx * 15, 13.5, CZ + sz * 18); tw.castShadow = true; scene.add(tw);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(5.2, 8, 20), L('#c0392b')); rf.position.set(CX + sx * 15, 31, CZ + sz * 18); rf.castShadow = true; scene.add(rf);
    const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), STD('#5d4037')); fp.position.set(CX + sx * 15, 36, CZ + sz * 18); scene.add(fp);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), new THREE.MeshLambertMaterial({ color: sx * sz > 0 ? '#1565c0' : '#ffca28', side: THREE.DoubleSide })); fl.position.set(CX + sx * 15 + 1.2, 36.8, CZ + sz * 18); scene.add(fl); }
  // big gate on the trophy wall side
  const gate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 6), L('#5d4037')); gate.position.set(WX - 0.1, 3.5, CZ - 10.5); scene.add(gate);
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.42, 20, 1, false, 0, Math.PI), L('#5d4037')); arch.rotation.set(0, 0, Math.PI / 2); arch.rotation.y = Math.PI / 2; arch.position.set(WX - 0.1, 7, CZ - 10.5); scene.add(arch);
  // banner above the trophies
  const banT = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#8e1b1b'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffca28'; c.lineWidth = 10; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#ffca28'; c.font = '900 84px Inter'; c.textAlign = 'center'; c.fillText('HALL OF JOUSTS', w / 2, 128); });
  const ban = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.6), new THREE.MeshLambertMaterial({ map: banT })); ban.position.set(WX - 0.12, 17.4, CZ + 4); ban.rotation.y = -Math.PI / 2; scene.add(ban);
  plane(CX - 60, CX - 15, CZ - 30, CZ + 30, L('#b7a77f'), 0.04, 6); }
// trophy slots: 3 rows x 4 columns, ours is #12 (middle row, third column)
const SLOTS = []; { let n = 1; for (const y of [13.0, 8.4, 3.8]) for (const dz of [-6.2, -0.3, 5.6, 11.5]) SLOTS.push({ y, z: CZ + dz, n: n++ }); }
const OUR = SLOTS.find(s => s.y === 8.4 && Math.abs(s.z - (CZ + 5.6)) < 0.1);
OUR.n = 12; let nn = 1; SLOTS.forEach(s => { if (s !== OUR) s.n = nn++; });
{ const wood = STD('#7b4f2c', { roughness: 0.7 }); const tcols = ['#e53935', '#fdd835', '#1e88e5', '#ffffff', '#8e24aa', '#fb8c00', '#455a64', '#00897b', '#f06292', '#6d4c41', '#c0ca33'];
  let k = 0;
  SLOTS.forEach(s => { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.4, 5.4), wood); pl.position.set(WX - 0.2, s.y, s.z); pl.castShadow = pl.receiveShadow = true; scene.add(pl);
    const tag = canvasTex(256, 96, (c, w, h) => { c.fillStyle = s === OUR ? '#ffd54f' : '#d4af37'; c.fillRect(0, 0, w, h); c.fillStyle = '#3e2723'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText('No. ' + s.n, w / 2, 70); });
    const tg = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.64), new THREE.MeshStandardMaterial({ map: tag, metalness: 0.3, roughness: 0.4 })); tg.position.set(WX - 0.4, s.y - 2.05, s.z); tg.rotation.y = -Math.PI / 2; scene.add(tg);
    if (s !== OUR) { const c = makeCar(tcols[k++ % tcols.length]); placeCar(c, { x: WX - 1.45, y: s.y - 0.75, z: s.z, h: 0, pitch: 0, roll: 0 }); } }); }

// ---------------- lorry ----------------
const lorry = new THREE.Group(); scene.add(lorry);
{ const boxT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#eceff1'; c.fillRect(0, 0, w, h); c.fillStyle = '#ef6c00'; c.fillRect(0, h - 50, w, 50); c.fillStyle = '#37474f'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.fillText('SLOW & STEADY', w / 2, 110); c.font = '800 54px Inter'; c.fillText('Snail Transport Ltd.', w / 2, 180); });
  const backT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e0e0e0'; c.fillRect(0, 0, w, h); c.fillStyle = '#9e9e9e'; c.fillRect(w / 2 - 3, 0, 6, h); c.fillStyle = '#ef6c00'; c.fillRect(0, h - 40, w, 40); c.fillStyle = '#c62828'; c.font = '900 46px Inter'; c.textAlign = 'center'; c.fillText('max 60', w / 2, 110); });
  const side = L('#fff', { map: boxT }), bk = L('#fff', { map: backT }), pl = L('#eceff1');
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.2, 9.5), [side, side, pl, pl, bk, pl]); box.position.set(0, 2.4, 1.2); lorry.add(box);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 2.2), STD('#ef6c00', { roughness: 0.4 })); cab.position.set(0, 1.9, -4.8); lorry.add(cab);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.05), STD('#1a2633', { metalness: 0.8, roughness: 0.1 })); ws.position.set(0, 2.5, -5.92); lorry.add(ws);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 11.4), STD('#263238')); ch.position.set(0, 0.7, -0.3); lorry.add(ch);
  for (const z of [-4.6, 3.0, 4.6]) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16), STD('#212121')); w.rotation.z = Math.PI / 2; w.position.set(s * 1.05, 0.5, z); lorry.add(w); }
  const tl = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.15, 0.05), STD('#7a0000', { emissive: '#ff1010', emissiveIntensity: 0.4 })); tl.position.set(0, 0.95, 5.98); lorry.add(tl);
  lorry.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const LORRY_DZ = -17;

// ---------------- horse + knight (built facing -z) ----------------
const knight = new THREE.Group(); scene.add(knight);
const horse = new THREE.Group(); knight.add(horse);           // pitch for rearing (pivot at hind legs)
const hb = new THREE.Group(); hb.position.set(0, 0, -1.0); horse.add(hb); // body offset so horse.rotation pivots at the rear
const hide = STD('#f3efe6', { roughness: 0.7 }), hoofM = STD('#3e2723'), maneM = STD('#8d6e63', { roughness: 0.9 });
{ const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 1.3, 8, 16), hide); body.rotation.x = Math.PI / 2; body.position.set(0, 1.42, 0); hb.add(body); }
const neckG = new THREE.Group(); neckG.position.set(0, 1.62, -0.85); hb.add(neckG);
{ const n = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 1.0, 12), hide); n.position.set(0, 0.3, -0.3); n.rotation.x = -0.85; neckG.add(n);
  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.22), maneM); mane.position.set(0, 0.42, -0.12); mane.rotation.x = -0.85; neckG.add(mane); }
const hHead = new THREE.Group(); hHead.position.set(0, 0.68, -0.72); neckG.add(hHead);
{ const hd = new THREE.Mesh(new THREE.CapsuleGeometry(0.165, 0.6, 6, 12), hide); hd.rotation.x = 0.85; hd.position.set(0, -0.2, -0.26); hHead.add(hd);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), hide); jaw.scale.set(0.9, 1.0, 1.1); jaw.position.set(0, -0.02, 0.02); hHead.add(jaw);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), STD('#e8dcd2')); nose.position.set(0, -0.47, -0.5); nose.scale.set(1, 0.9, 1.15); hHead.add(nose);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), STD('#111')); e.position.set(s * 0.16, 0.02, -0.12); hHead.add(e);
    const nos = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), STD('#5d4037')); nos.position.set(s * 0.07, -0.5, -0.66); hHead.add(nos);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 6), hide); ear.position.set(s * 0.1, 0.24, 0.06); ear.rotation.z = -s * 0.25; hHead.add(ear); }
  const fl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.1), maneM); fl.position.set(0, 0.17, -0.06); fl.rotation.x = 0.5; hHead.add(fl);
  const cham = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.42), STD('#b0bec5', { metalness: 0.8, roughness: 0.3 })); cham.position.set(0, -0.08, -0.28); cham.rotation.x = 0.85 - Math.PI / 2 + Math.PI / 2 ; cham.rotation.x = 0.72; hHead.add(cham); }
const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.95, 8), maneM); tail.position.set(0, 1.35, 1.05); tail.rotation.x = -0.6; hb.add(tail);
const hLegs = [[-1, -1, 0], [1, -1, 0.35], [-1, 1, 1.9], [1, 1, 2.25]].map(([sx, sz, ph]) => { const piv = new THREE.Group(); piv.position.set(sx * 0.24, 1.25, sz * 0.62); hb.add(piv);
  const up = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.6, 8), hide); up.position.y = -0.3; piv.add(up); const kn = new THREE.Group(); kn.position.y = -0.6; piv.add(kn);
  const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.55, 8), hide); lo.position.y = -0.27; kn.add(lo); const hf = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.12, 8), hoofM); hf.position.y = -0.6; kn.add(hf);
  return { piv, kn, ph, front: sz < 0 }; });
// caparison: striped cloth hanging over the body
const capT = canvasTex(1024, 256, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#ffca28' : '#c62828'; c.fillRect(i * w / 16, 0, w / 16 + 1, h); } c.fillStyle = '#ffca28'; c.fillRect(0, h - 26, w, 26); });
{ const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.68, 0.78, 32, 1, true, Math.PI * 0.55, Math.PI * 0.9), new THREE.MeshLambertMaterial({ map: capT, side: THREE.DoubleSide }));
  cap.rotation.x = Math.PI / 2; cap.scale.set(1, 2.25, 1); cap.position.set(0, 1.42, 0); hb.add(cap);
  const cap2 = cap.clone(); cap2.rotation.y = Math.PI; hb.add(cap2); cap.rotation.order = cap2.rotation.order = 'YXZ'; cap.rotation.set(Math.PI / 2, 0, -Math.PI / 2 - 0.15); cap2.rotation.set(Math.PI / 2, 0, Math.PI / 2 + 0.15);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.7), STD('#5d4037')); saddle.position.set(0, 1.92, -0.15); hb.add(saddle); }
// rider
const steel = STD('#dfe6ea', { metalness: 0.85, roughness: 0.28, envMapIntensity: 1.4 }), steelD = STD('#9aa6ad', { metalness: 0.85, roughness: 0.35 });
const rider = new THREE.Group(); rider.position.set(0, 2.0, -0.15); hb.add(rider);
const torso = new THREE.Group(); rider.add(torso);
{ const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.42, 6, 14), steel); t.position.y = 0.42; torso.add(t);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 6, 18), STD('#5d4037')); belt.rotation.x = Math.PI / 2; belt.position.y = 0.18; torso.add(belt);
  const tab = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.31, 0.5, 18, 1, true), new THREE.MeshLambertMaterial({ map: capT, side: THREE.DoubleSide })); tab.position.y = 0.3; torso.add(tab);
  for (const s of [-1, 1]) { const pau = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), steel); pau.position.set(s * 0.32, 0.78, 0); torso.add(pau);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 10), steel); leg.position.set(s * 0.42, -0.2, -0.1); leg.rotation.x = 0.3; leg.rotation.z = s * 0.15; rider.add(leg);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.28), steelD); boot.position.set(s * 0.47, -0.58, -0.22); rider.add(boot); } }
const helm = new THREE.Group(); helm.position.set(0, 1.08, 0); torso.add(helm);
const face = new THREE.Group(); helm.add(face);
{ const h = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.44, 20), steel); helm.add(h); const top = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), steel); top.position.y = 0.22; helm.add(top);
  const skinM = STD('#ffd2a6', { emissive: '#5a3a20', emissiveIntensity: 0.25, roughness: 0.6 });
  const skin = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 12), skinM); skin.scale.set(1, 1, 0.45); skin.position.set(0, -0.02, -0.19); face.add(skin);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), skinM); nose.position.set(0, -0.03, -0.27); face.add(nose);
  for (const s of [-1, 1]) { const ew = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), STD('#ffffff')); ew.position.set(s * 0.06, 0.045, -0.255); face.add(ew);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), STD('#111')); e.position.set(s * 0.06, 0.045, -0.284); face.add(e);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.07, 4, 8), STD('#5d4037')); m.position.set(s * 0.045, -0.075, -0.262); m.rotation.z = s * 1.2; face.add(m); }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 6, 12, Math.PI), STD('#8d3b2b')); smile.position.set(0, -0.11, -0.255); smile.rotation.z = Math.PI; face.add(smile);
  const plume = new THREE.Group(); plume.position.set(0, 0.42, 0.05); helm.add(plume);
  for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), STD(i % 2 ? '#ffca28' : '#d32f2f')); p.scale.set(0.8, 1.6, 0.8); p.position.set(0, i * 0.06, i * 0.09); p.rotation.x = 0.6; plume.add(p); } }
const visor = new THREE.Group(); visor.position.set(0, 0.14, 0); helm.add(visor);   // pivots up over the top
{ const vm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.245, 0.32, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76), steel); vm.position.y = -0.16; visor.add(vm);
  vm.material = steel.clone(); vm.material.side = THREE.DoubleSide;
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.02), STD('#111')); slit.position.set(0, -0.08, -0.245); visor.add(slit);
  const sn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), steel); sn.rotation.x = -Math.PI / 2; sn.position.set(0, -0.2, -0.28); visor.add(sn); }
// arms: right holds the lance, left the shield
const armR = new THREE.Group(); armR.position.set(0.34, 0.74, 0); torso.add(armR);
const armL = new THREE.Group(); armL.position.set(-0.34, 0.74, 0); torso.add(armL);
for (const a of [armR, armL]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.6, 10), steel); m.position.y = -0.3; a.add(m); const g = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), steelD); g.position.y = -0.62; a.add(g); }
armR.rotation.set(-1.1, 0, 0.1); armL.rotation.set(-0.7, 0, -0.25);
const shieldT = canvasTex(256, 320, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffca28'; c.fillRect(w / 2 - 18, 30, 36, h - 60); c.fillRect(30, 120, w - 60, 36);
  c.beginPath(); c.moveTo(70, 60); c.lineTo(90, 20); c.lineTo(110, 50); c.lineTo(128, 10); c.lineTo(146, 50); c.lineTo(166, 20); c.lineTo(186, 60); c.closePath(); c.fill(); });
{ const shp = new THREE.Shape(); shp.moveTo(-0.32, 0.36); shp.lineTo(0.32, 0.36); shp.lineTo(0.32, 0.0); shp.quadraticCurveTo(0.3, -0.32, 0, -0.5); shp.quadraticCurveTo(-0.3, -0.32, -0.32, 0.0); shp.closePath();
  const g = new THREE.ExtrudeGeometry(shp, { depth: 0.05, bevelEnabled: false }); const uv = g.attributes.uv; const pos = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 0.32) / 0.64, (pos.getY(i) + 0.5) / 0.86);
  const sh = new THREE.Mesh(g, [STD('#fff', { map: shieldT }), STD('#ffca28', { metalness: 0.6 })]); sh.position.set(-0.6, 0.45, -0.05); sh.rotation.y = -Math.PI / 2 + 0.25; torso.add(sh); }
// lance: pivot at the right hand, points along -z, rotation.x > 0 raises the tip
const LANCE = 6.2;
const lanceP = new THREE.Group(); lanceP.position.set(0.42, 0.5, -0.35); torso.add(lanceP);
const lanceT = canvasTex(64, 512, (c, w, h) => { for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#c62828'; c.beginPath(); c.moveTo(0, i * 48); c.lineTo(w, i * 48 - 30); c.lineTo(w, i * 48 + 18); c.lineTo(0, i * 48 + 48); c.fill(); } }, [1, 3]);
{ const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.11, LANCE, 12), STD('#fff', { map: lanceT, roughness: 0.5 })); sh.rotation.x = -Math.PI / 2; sh.position.z = -LANCE / 2 + 0.6; lanceP.add(sh);
  const vam = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 18, 1, true), new THREE.MeshStandardMaterial({ color: '#cfd8dc', metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide })); vam.rotation.x = -Math.PI / 2; vam.position.z = -0.15; lanceP.add(vam);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 10), steel); tip.rotation.x = -Math.PI / 2; tip.position.z = -LANCE + 0.45; lanceP.add(tip); }
const pennT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#1565c0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h / 2); c.lineTo(0, h); c.closePath(); c.fill(); c.fillStyle = '#ffca28'; c.font = '900 46px Inter'; c.fillText('VIP', 18, 80); });
const penn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshLambertMaterial({ map: pennT, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 }));
penn.position.set(0, 0.36, -LANCE + 1.6); penn.rotation.y = -Math.PI / 2; lanceP.add(penn);
knight.traverse(o => { if (o.isMesh) { o.castShadow = true; } });

// ---------------- hero ----------------
const hero = makeCar('#35d43a');
// the left wing mirror shows an empty lane (that's the point of a blind spot)
const mirT = canvasTex(256, 140, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fd0ff'); g.addColorStop(0.45, '#d9efff'); g.addColorStop(0.46, '#7cae4a'); g.addColorStop(1, '#6a9e3c'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = '#5b5f66'; c.beginPath(); c.moveTo(20, h); c.lineTo(128, 64); c.lineTo(150, 64); c.lineTo(250, h); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.setLineDash([14, 12]); c.beginPath(); c.moveTo(139, 66); c.lineTo(150, h); c.stroke();
  c.setLineDash([]); c.strokeStyle = '#26282c'; c.lineWidth = 10; c.strokeRect(0, 0, w, h); });
{ const mg = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.11), new THREE.MeshBasicMaterial({ map: mirT })); mg.position.set(-0.98, 1.02, -0.646); hero.add(mg); }
hero.traverse(o => { if (o.isMesh) o.castShadow = true; });

// ---------------- motion ----------------
const T_SW = tSwerve - 0.15;
function heroWrong(t) {
  const z0 = zB(t);
  if (t < T_SW) return { x: LR, y: 0, z: z0, h: 0, pitch: 0, roll: 0 };
  const xs = tt => lerp(LR, LL, ease(clamp((tt - T_SW) / 1.4))), dzs = tt => -3.5 * ease(clamp((tt - T_SW) / 1.8));
  const x = xs(t), z = z0 + dzs(t), dx = x - xs(t - 0.05), dz = z - (zB(t - 0.05) + dzs(t - 0.05));
  return { x, y: 0, z, h: Math.atan2(-dx, -dz), pitch: 0, roll: 0 };
}
const T_KIN = tBut - 0.35, T_KIN1 = tIn + 0.5;                          // knight rides up into the blind spot
const T_CH0 = tJoust - 0.15, T_POKE = tPoke - 0.08, T_OFF = tGallops - 0.25, T_WALL = tHangs - 0.25;
const DZ_POKE = 4.3 + 0.35 + 0.7;                                      // horse origin to car centre when skewered
// knight pose: x, z, h, y, rear (pitch), lp (lance pitch), spd
function knightWrong(t) {
  const z0 = zB(t);
  let dz; if (t < T_KIN) dz = 70; else if (t < T_KIN1) dz = lerp(46, 3.4, easeOut((t - T_KIN) / (T_KIN1 - T_KIN))); else dz = 3.4;
  const rear = t > T_SW ? 0.55 * win(t, T_SW + 0.7, T_SW + 2.3, 0.45) : 0;
  if (t > T_SW + 0.5) dz += 9.5 * ease(clamp((t - T_SW - 0.5) / 4.5));            // drops back, offended
  if (t > T_CH0) dz = lerp(dz, -3.5 + DZ_POKE, easeIn(clamp((t - T_CH0) / (T_POKE - T_CH0))));
  let lp = 1.0; if (t > tWith - 0.1 && t < tWhat - 0.1) lp = lerp(1.0, 0.18, win(t, tWith - 0.1, tWhat - 0.1, 0.45));
  if (t > tLanceF - 0.15) lp = lerp(1.0, 0.0, ease(clamp((t - tLanceF + 0.15) / 0.5)));
  if (t > tOnLance - 0.5) lp = 0.5 * ease(clamp((t - tOnLance + 0.5) / 1.4));
  if (t < T_OFF) return { x: LL, z: z0 + dz, h: 0, y: 0, rear, lp, spd: t > T_CH0 && t < T_POKE ? 22 : 13 };
  if (t < T_WALL) { // gallop off the motorway towards the castle (numerical path)
    let x = LL, z = zB(T_OFF) + dz, h = 0; const dt = 1 / 60; for (let s = T_OFF; s < t; s += dt) { h = -1.05 * ease(clamp((s - T_OFF) / 1.1)); const sp = 16; x += -Math.sin(h) * sp * dt; z += -Math.cos(h) * sp * dt; }
    return { x, z, h, y: 0, rear: 0, lp, spd: 16 };
  }
  return { x: WX - 20, z: OUR.z - 3.6, h: Math.PI / 2 - 0.35, y: 0, rear: 0, lp: 1.45, spd: 0 };
}
const T_BACK = tLets - 0.1, T_OV = tOvertake - 0.3;
const heroDzR = t => t < T_OV + 0.6 ? 0 : -33 * ease(clamp((t - T_OV - 0.6) / 4.6));
const heroXR = t => t < T_OV ? LR : (t < T_OV + 3.6 ? lerp(LR, LL, ease(clamp((t - T_OV) / 1.4))) : lerp(LL, LR, ease(clamp((t - T_OV - 3.6) / 1.6))));
function heroRight(t) {
  const x = heroXR(t), z = zB(t) + heroDzR(t), dx = x - heroXR(t - 0.05), dz = z - (zB(t - 0.05) + heroDzR(t - 0.05));
  return { x, y: 0, z, h: Math.abs(dx) > 1e-4 ? Math.atan2(-dx, -dz) : 0, pitch: 0, roll: 0 };
}
function knightRight(t) {
  let dz = 3.4; if (t > T_BACK) dz = lerp(3.4, 13, ease(clamp((t - T_BACK) / 1.4)));
  if (t > T_OV + 1.0) dz = lerp(dz, heroDzR(t) + 9.5, ease(clamp((t - T_OV - 1.0) / 2.0)));
  const wave = 0; return { x: LL, z: zB(t) + dz, h: 0, y: 0, rear: 0, lp: 1.2, spd: 13 + (t > T_OV + 1 && t < T_OV + 5 ? 6 : 0) };
}
const heroPose = t => isRight(t) ? heroRight(t) : heroWrong(t);
const knightPose = t => isRight(t) ? knightRight(t) : knightWrong(t);

// ---------------- camera ----------------
const Ac = (p, l) => () => [V3(...p), V3(...l)];
const Hf = (off, look) => t => { const p = heroPose(t); const y = p.y || 0; return [V3(p.x + off[0], y + off[1], p.z + off[2]), V3(p.x + look[0], y + look[1], p.z + look[2])]; };
const Bf = (off, look) => t => { const z = zB(t); return [V3(off[0], off[1], z + off[2]), V3(look[0], look[1], z + look[2])]; };   // follows the traffic flow
const Kf = (off, look) => t => { const k = knightPose(t); return [V3(k.x + off[0], off[1], k.z + off[2]), V3(k.x + look[0], look[1], k.z + look[2])]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const MIRROR = Hf([-0.9, 2.7, -2.6], [-2.2, 0.9, 30]);
const WIDE = Bf([-6, 11, 20], [0, 0.8, -6]);
const WALL0 = Ac([WX - 46, 8.5, OUR.z - 2.5], [WX, 10.5, OUR.z - 2.5]);
const camKeys = [
  [0.0, Hf([1.2, 4.6, 13.5], [-0.2, 1.4, -14])],
  [tTime - 0.2, Hf([0.4, 4.4, 12.5], [-0.4, 1.4, -14])],
  [tMirror - 0.35, Hf([-3.2, 2.4, 8.5], [-0.5, 1.2, -14])],
  ...cut(tMirror - 0.3, MIRROR),
  [tBut - 0.35, MIRROR],
  ...cut(tBut - 0.3, Bf([0.15, 2.0, -2.4], [-1.9, 1.9, 14])),
  [tIn - 0.2, Bf([0.25, 2.1, -2.6], [-1.9, 2.0, 10])],
  ...cut(tIn - 0.15, Bf([-5.5, 6.2, 15.5], [-0.2, -0.2, -2.5])),
  [tWith - 0.2, Bf([-5.0, 5.8, 14], [-0.2, -0.1, -2.5])],
  ...cut(tWith - 0.15, Bf([-11, 6.0, -11], [-0.5, 2.6, 0.5])),
  [tWhat - 0.3, Bf([-11.5, 6.2, -11.5], [-0.5, 2.6, 0.5])],
  ...cut(tWhat - 0.25, WIDE),
  [S('wrong1').start - 0.2, Bf([-6.2, 11.4, 20.5], [0, 0.8, -6])],
  // wrong
  ...cut(S('wrong1').start - 0.15, Bf([0.6, 7.0, 17], [-0.6, 0.6, -6])),
  [tBig - 0.3, Bf([0.4, 7.4, 19], [-0.8, 0.8, -4])],
  ...cut(tBig - 0.25, Kf([-4.4, 3.2, -4.6], [0, 2.8, 0])),
  [tVisor - 0.3, Kf([-3.8, 3.2, -3.9], [0, 2.95, 0])],
  ...cut(tLanceF - 0.3, Bf([-5.5, 6.5, 24], [-0.8, 1.0, 2])),
  [T_CH0, Bf([-5.5, 6.5, 24], [-0.8, 1.0, 1])],
  [T_POKE - 0.15, Bf([-5.2, 6.0, 16], [-0.9, 1.3, -3])],
  ...cut(T_POKE - 0.1, Bf([-10, 4.5, -17], [-1.5, 2.4, -1])),
  [tKebab - 0.45, Bf([-11, 6.0, -18], [-1.5, 3.4, -1])],
  ...cut(tKebab - 0.4, Bf([-14, 6.5, -13], [-1.2, 3.0, -0.5])),
  [T_OFF + 0.1, Bf([-13.5, 6.8, -12.5], [-1.2, 3.0, -0.5])],
  ...cut(T_OFF + 0.15, Kf([-21, 12.5, 15], [25, 2.0, -17])),
  [T_WALL - 0.05, Kf([-22, 13.5, 16], [30, 2.5, -20])],
  ...cut(T_WALL, WALL0),
  [tTrophy - 0.35, Ac([WX - 42, 8.5, OUR.z - 2.0], [WX, 10.2, OUR.z - 2.0])],
  [tRew0, Ac([WX - 34, 8.6, OUR.z - 1.5], [WX, 9.8, OUR.z - 1.5])],
  // right
  [tRew0 + 0.55, WIDE],
  [tMir2 - 0.3, WIDE],
  ...cut(tMir2 - 0.25, MIRROR),
  [tLook - 0.2, MIRROR],
  ...cut(tLook - 0.15, Hf([-0.5, 2.4, -4.6], [-5.0, 1.6, -3.0])),
  [tThere - 0.2, Hf([-0.8, 2.7, -7.0], [-3.6, 2.1, 3.2])],
  [tDont - 0.3, Hf([-0.9, 2.8, -7.4], [-3.6, 2.1, 3.2])],
  ...cut(tDont - 0.25, Bf([-5.5, 6.2, 15.5], [-0.2, -0.2, -2.5])),
  [tIndic - 0.4, Bf([-5.0, 5.8, 14], [-0.2, -0.1, -2.5])],
  ...cut(tIndic - 0.35, Hf([-1.6, 2.3, -6.0], [-3.0, 1.8, 3.0])),
  [tRoyal - 0.3, Hf([-1.7, 2.4, -6.4], [-3.0, 1.9, 3.0])],
  ...cut(tRoyal - 0.25, Kf([-2.7, 3.1, -5.0], [0, 2.75, 0])),
  [tLifts - 0.2, Kf([-2.3, 3.1, -4.3], [0, 2.85, 0])],
  [tLets - 0.3, Kf([-2.5, 3.1, -4.6], [0, 2.7, 0])],
  ...cut(tLets - 0.25, Bf([-4.5, 9, 26], [-0.3, 0.3, 1])),
  [T_OV - 0.2, Bf([-4.2, 8.6, 25], [-0.3, 0.3, 0])],
  ...cut(T_OV - 0.15, Hf([4.5, 12, 19], [-0.8, 0.0, -14])),
  [tEscort - 0.35, Hf([4.0, 12, 20], [-0.8, 0.0, -14])],
  ...cut(tEscort - 0.3, Hf([-7.5, 2.6, -10], [0.2, 1.9, 5])),
  [S('right6').start - 0.3, Hf([-7.2, 2.8, -9.5], [0.2, 2.0, 5])],
  ...cut(S('right6').start - 0.25, Hf([-5.5, 9, 22], [-0.5, 0.6, -5])),
  [S('right7').start, Hf([-5.5, 10, 24], [-0.5, 0.6, -5])],
  [S('outro').start, Hf([-7, 14, 28], [0, 0.5, -4])],
  [TOTAL - 0.3, Hf([-9, 22, 34], [0, 0, -4])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u) };
}

// ---------------- update ----------------
let screen = {};
const _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _e = new THREE.Euler();
function update(t) {
  const right = isRight(t);
  // knight
  const k = knightPose(t);
  knight.position.set(k.x, k.y, k.z); knight.rotation.y = k.h; knight.visible = right || t > T_KIN;
  horse.rotation.x = k.rear; horse.position.z = 1.0; hb.position.z = -1.0;   // pivot at the hind legs
  const gal = k.spd > 0.5, ph = t * (k.spd > 18 ? 15 : 11.5);
  hLegs.forEach(l => { const s = Math.sin(ph + l.ph); l.piv.rotation.x = gal ? (l.front ? 0.6 : 0.45) * s : 0; l.kn.rotation.x = gal ? (l.front ? 0.9 : -0.6) * Math.max(0, l.front ? -s : s) : 0;
    if (k.rear > 0.05 && l.front) { l.piv.rotation.x = -0.9 * k.rear / 0.55; l.kn.rotation.x = 1.4 * k.rear / 0.55; } });
  hb.position.y = gal ? 0.09 * Math.abs(Math.sin(ph)) : 0; hb.rotation.x = gal ? 0.035 * Math.sin(ph * 2) : 0;
  neckG.rotation.x = (gal ? 0.08 * Math.sin(ph * 2 + 1) : 0) - 0.3 * k.rear; tail.rotation.x = -0.6 - (gal ? 0.35 + 0.1 * Math.sin(ph * 2) : 0);
  // rider: visor, bow, waves, lance
  let vis = 0;                                         // 0 = visor down/closed, 1 = open
  if (!right) vis = t < tVisor - 0.1 ? (t > tBig - 0.5 ? 1 : 0) : 1 - ease(clamp((t - tVisor + 0.1) / 0.3));
  else vis = ease(clamp((t - tLifts + 0.1) / 0.45));
  visor.rotation.x = -1.9 * vis; face.visible = vis > 0.15;
  const bow = right ? win(t, tBows - 0.15, tBows + 0.9, 0.3) : 0;
  torso.rotation.x = -0.55 * bow + (!right && t > T_CH0 && t < T_POKE + 0.3 ? -0.25 : 0);
  helm.rotation.set(0, 0, 0);
  if (!right && t > tCut - 0.2 && t < tVisor) helm.rotation.y = -0.35 * win(t, tCut - 0.2, tVisor, 0.3);            // glares at the car
  if (right && t > tThere - 0.4 && t < tRoyal + 0.6) helm.rotation.y = -0.25 * win(t, tThere - 0.4, tRoyal + 0.6, 0.3);
  if (right && t > tRoyal - 0.1 && t < tFan + 0.6) helm.rotation.z = 0.25 * Math.sin((t - tRoyal) * 8) * win(t, tRoyal - 0.1, tFan + 0.6, 0.2);
  // left arm: shield normally, waves "hello" on the shoulder check, hand on heart while bowing
  armL.rotation.set(-0.7, 0, -0.25);
  if (right && t > tThere - 0.2 && t < tDont) { const w = win(t, tThere - 0.2, tDont, 0.25); armL.rotation.set(-0.7 - 1.9 * w, 0, -0.25 - 0.5 * w + 0.35 * w * Math.sin(t * 14)); }
  if (right && bow > 0) armL.rotation.set(-0.7 - 0.6 * bow, 0, -0.25 + 0.9 * bow);
  lanceP.rotation.x = k.lp; penn.visible = right || t < tLanceF;
  penn.rotation.x = 0.12 * Math.sin(t * 9);
  // hero
  if (!right && t > T_POKE - 0.02 && t < T_WALL) {         // skewered: rides on the lance
    knight.updateMatrixWorld(true); lanceP.getWorldPosition(_p); lanceP.getWorldQuaternion(_q);
    const c = V3(0, -0.15, -4.3).applyQuaternion(_q).add(_p); _e.setFromQuaternion(_q, 'YXZ');
    const shake = t < T_POKE + 0.25 ? 0.12 * Math.sin(t * 70) * (1 - (t - T_POKE) / 0.25) : 0;
    placeCar(hero, { x: c.x, y: c.y - 0.75, z: c.z, h: _e.y, pitch: _e.x + shake, roll: 0.15 * Math.sin(t * 6) });
  } else if (!right && t >= T_WALL) {
    const drop = 1.6 * (1 - easeOut(clamp((t - tHangs - 0.15) / 0.3)));
    placeCar(hero, { x: WX - 1.45, y: OUR.y - 0.75 + drop, z: OUR.z, h: 0, pitch: 0, roll: 0 });
  } else placeCar(hero, heroPose(t));
  hero.userData.wheels.forEach(w => { if (!right && t > T_POKE) w.rotation.x = t * 30; });
  blink(hero, t, (!right && t > tTime && t < T_SW + 1.6) || (right && t > tSwitch - 0.1 && t < T_OV + 1.6) || (right && t > T_OV + 3.4 && t < T_OV + 3.4), right && t > T_OV + 3.0 && t < T_OV + 5.4);
  // lorry
  lorry.position.set(LR, 0, zB(t) + LORRY_DZ); lorry.visible = right || t < T_WALL;
  const c = cam(t); camera.near = clamp(c.p.y * 0.25, 0.25, 1.5); camera.updateProjectionMatrix();
  applyCam(c, t, !right && t > T_CH0 && t < T_POKE + 0.3 ? 0.05 : 0);
  camera.updateMatrixWorld(true); knight.updateMatrixWorld(true); hero.updateMatrixWorld(true);
  screen = { helm: project(helm.localToWorld(V3(0, 0.6, 0))), car: project(hero.localToWorld(V3(0, 2.0, 0))), ind: project(hero.localToWorld(V3(-0.8, 1.3, 2.2))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const clampXY = (p, dy = 0) => [clamp(p.x, 230, W - 230), clamp(p.y + dy, 560, 1080)];
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('MIRROR: EMPTY', '#37474f', tMirror - 0.1, tBut - 0.1, 50, iconCheck);
    floatText('CLIP  CLOP  CLIP  CLOP', W / 2, 1560, t, tSound - 0.1, tIn + 0.3, 66, '#ffe082', -0.04);
    P_('BLIND SPOT: 1 KNIGHT', '#6a1b9a', tKnight - 0.2, tWith - 0.1, 50, iconWarn);
    P_('LANCE LENGTH: 6 METRES', '#e65100', tWith, S('hook2').end + 0.3, 46);
    P_('SWERVE OVER. NO LOOK.', RED, tSwerve - 0.2, tBig - 0.2, 46, iconX);
    P_('HOW DARE YOU!', '#6a1b9a', tInsult - 0.25, tVisor - 0.1, 52);
    if (screen.helm && screen.helm.ok) { const [x, y] = clampXY(screen.helm, -40); floatText('CLANK!', x, y, t, tVisor + 0.1, tVisor + 1.0, 90, '#eceff1', -0.08); }
    P_('LANCE: FORWARD', RED, tLanceF - 0.1, tJoust - 0.1, 50);
    floatText('JOUST!', W / 2, 760, t, tJoust - 0.05, tJoust + 1.1, 190, YEL, -0.08);
    floatText('POKE!', W / 2, 820, t, tPoke - 0.05, tPoke + 0.8, 150, '#ffffff', 0.08);
    P_('CAR KEBAB', '#bf360c', tKebab - 0.2, T_OFF + 0.1, 52);
    P_('NEXT STOP: HIS CASTLE', '#4e342e', T_OFF + 0.2, T_WALL, 46);
    P_('TROPHY No. 12', '#b8860b', tTrophy - 0.15, tRew0, 60, null, 1560);
  } else {
    P_('MIRROR: EMPTY?', '#37474f', tMir2 - 0.1, tLook - 0.15, 50);
    P_('SHOULDER CHECK', GREEN, tLook - 0.1, tDont - 0.2, 50, iconCheck);
    if (screen.helm && screen.helm.ok) { const [x, y] = clampXY(screen.helm, -60); floatText('HELLO!', x, y, t, tThere + 0.05, tDont - 0.1, 86, '#ffffff', -0.06); }
    P_("DON'T CUT IN", RED, tDont - 0.1, tSwitch - 0.1, 50, iconX);
    P_('INDICATOR ON', '#ef6c00', tSwitch - 0.1, tRoyal - 0.2, 50);
    P_('= A ROYAL SIGNAL', '#6a1b9a', tRoyal - 0.15, tFan - 0.1, 50);
    floatText('TA-TA-TAAA!', W / 2, 760, t, tFan - 0.05, tFan + 1.3, 130, YEL, -0.07);
    P_('AFTER YOU, GOOD SIR', '#6a1b9a', tBows - 0.2, tLets + 0.5, 46);
    P_('LANE CHANGE: SAFE', GREEN, tOvertake - 0.2, tEscort - 0.3, 48, iconCheck);
    P_('ROYAL ESCORT', '#6a1b9a', tEscort - 0.15, S('right6').start - 0.1, 56);
    P_('BLIND SPOT: CHECKED', GREEN, tChecked - 0.1, S('right7').start, 48, iconCheck);
  }
}
window.dbg = { heroPose, knightPose, cam };
start(update, hud);
