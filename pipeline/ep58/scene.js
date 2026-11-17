// Episode 53: Car park exit – a goat lives in the ticket machine and eats your parking ticket
// hook (old style): leaving the car park, ticket into the machine -> the machine chews it, says "baa": a goat inside
// wrong: shout "hey, give that back!" -> shouting makes goats hungry: jumps out of the machine, eats wing mirror,
//        number plate, tyres -> chomp chomp chomp, 5 minutes later only you, your seat and the steering wheel are left. Still hungry.
// right: never argue with a goat: glovebox, offer your old road map -> munch, eats all of Europe, happy goat ->
//        presses the button with its nose, barrier up -> knows every road by heart, hops on the roof as your sat-nav -> "turn left. baa!"
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, box, instanced, makeLandscape, roundedPath, pathAt,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
scene.background = new THREE.Color('#9fcdf2'); scene.fog.color.set('#d6e6f0');
// ---------------- timing ----------------
const tTicket = WT('hook1', 'ticket'), tMachine1 = WT('hook1', 'machine');
const tChewed = WT('hook2', 'chewed'), tSaid = WT('hook2', 'said'), tBaa = WT('hook2', 'baa'), tThere = WT('hook2', 'There'), tGoat = WT('hook2', 'goat'), tWhat = WT('hook2', 'What');
const tShout = WT('wrong1', 'shout'), tHey = WT('wrong1', 'hey'), tGive = WT('wrong1', 'Give');
const tBig = WT('wrong2', 'Big'), tShouting = WT('wrong2', 'Shouting'), tHungry2 = WT('wrong2', 'hungry'), tSo2 = WT('wrong2', 'So'), tWing = WT('wrong2', 'wing'), tMirror = WT('wrong2', 'mirror'),
  tThen1 = WT('wrong2', 'Then', 0), tPlate = WT('wrong2', 'plate'), tThen2 = WT('wrong2', 'Then', 1), tTyres = WT('wrong2', 'tyres');
const tChomp = [0, 1, 2].map(k => WT('wrong3', 'Chomp', k)), tFive = WT('wrong3', 'Five'), tSeat = WT('wrong3', 'seat'), tSteer = WT('wrong3', 'steering'), tAndG = WT('wrong3', 'And', 1), tStill = WT('wrong3', 'Still');
const tNever = WT('right2', 'Never'), tOpen = WT('right2', 'Open'), tGlove = WT('right2', 'glovebox'), tOffer = WT('right2', 'offer'), tMap = WT('right2', 'map');
const tMunch = [WT('right3', 'Munch', 0), WT('right3', 'Munch', 1)], tEats = WT('right3', 'eats'), tEurope = WT('right3', 'Europe'), tHappy = WT('right3', 'Happy');
const tPresses = WT('right4', 'presses'), tButton = WT('right4', 'button'), tNose = WT('right4', 'nose'), tBarrier = WT('right4', 'Barrier');
const tKnows = WT('right5', 'knows'), tHeart = WT('right5', 'heart'), tHops = WT('right5', 'hops'), tSat = WT('right5', 'sat');
const tTurn = WT('right6', 'turn'), tLeft = WT('right6', 'left'), tBaa6 = WT('right6', 'Baa');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world: car park, exit lane along -z, ticket booth on the driver's side ----------------
const CX = 0.45;                                   // car x at the machine
const MX0 = -3.6, MX1 = -1.6, MZ0 = -1.1, MZ1 = 0.5, MH = 2.4;   // ticket booth box
const HZ = -0.3, HY = 1.5;                         // hatch centre on the +x face
const BZ = -4.6, BX = -1.5;                        // barrier post
const ROADZ = -24;                                 // exit road (runs to -x)
makeLandscape({ avoid: (x, z) => x > -40 && x < 40 && z > -36 && z < 50, fieldAvoid: (x, z, w, d) => Math.abs(x) < 60 + w / 2 && z + d / 2 > -50 && z - d / 2 < 60, near: [0, -70, 160, 60], trees: 1300, seed: 5308 });
plane(-30, 30, -30, 42, asphaltMat, 0.05, 7);
plane(-260, -30, ROADZ - 3.6, ROADZ + 3.6, asphaltMat, 0.05, 7);
// kerbs / islands
const kerbM = L('#d7d2c6');
box(0.4, 0.18, 6.5, kerbM, -1.1, 0.09, 2.0, false, true); box(0.4, 0.18, 6.5, kerbM, 1.75, 0.09, 2.0, false, true);
// lane + bay markings
{ const g = new THREE.PlaneGeometry(0.12, 5.0); g.rotateX(-Math.PI / 2); const L1 = [];
  for (let z = 10; z < 40; z += 6.5) for (let x = 4; x < 28; x += 2.8) L1.push([x, 0.07, z]);
  for (let z = 10; z < 40; z += 6.5) for (let x = -6; x > -28; x -= 2.8) L1.push([x, 0.07, z]);
  instanced(g, markMat, L1, false);
  const g2 = new THREE.PlaneGeometry(0.15, 3.0); g2.rotateX(-Math.PI / 2); const L2 = []; for (let x = -250; x < -32; x += 9) L2.push([x, 0.07, ROADZ]); instanced(g2, markMat, L2.map(p => [p[0], p[1], p[2], Math.PI / 2]), false);
  const g3 = new THREE.PlaneGeometry(4.2, 0.35); g3.rotateX(-Math.PI / 2); instanced(g3, L('#ffffff', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), [[CX + 0.2, 0.07, BZ + 0.25]], false); }
// EXIT painted on the lane
{ const tx = canvasTex(512, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', w / 2, h / 2); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), new THREE.MeshLambertMaterial({ map: tx, transparent: true, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 })); m.rotation.x = -Math.PI / 2; m.position.set(CX + 0.2, 0.075, -10); m.userData.noAO = true; scene.add(m); }
// parked cars
{ const cols = ['#e53935', '#fdd835', '#ffffff', '#43a047', '#8e24aa', '#ff7043', '#90a4ae', '#26c6da', '#5d4037', '#212121', '#1e88e5', '#f48fb1'];
  let k = 0; for (let z = 13; z < 40; z += 6.5) for (const x of [5.4, 8.2, 11.0, 13.8, -7.4, -10.2, -13.0]) { if (hash(k + 50) < 0.25) { k++; continue; } const c = makeCar(cols[k % cols.length]); placeCar(c, { x, z: z + 0.2, h: (hash(k) < 0.5 ? 0 : Math.PI) + (hash(k + 9) - 0.5) * 0.06 }); k++; } }
// hedges around the car park
{ const hg = new THREE.BoxGeometry(1, 1, 1), list = []; for (let z = -30; z < 42; z += 1.6) { list.push([-29, 0.6, z, 0, 1.4, 1.2, 1.7]); list.push([29, 0.6, z, 0, 1.4, 1.2, 1.7]); }
  for (let x = -29; x < 30; x += 1.6) { if (x > -4 && x < 5) continue; list.push([x, 0.6, -29.5, 0, 1.7, 1.2, 1.4]); }
  const m = instanced(hg, L('#3f8a34'), list, true); }
// lamp posts
{ const pm = STD('#7d8288', { metalness: 0.5, roughness: 0.4 }); for (const [x, z] of [[4.2, -12], [-5.5, 8], [4.2, 20]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 8), pm); p.position.set(x, 3, z); p.castShadow = true; scene.add(p); const h = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.3), pm); h.position.set(x - 0.4, 6, z); h.castShadow = true; scene.add(h); } }
// building behind (multi-storey look)
{ const g = new THREE.Group(); g.position.set(-16, 0, 26); scene.add(g); const wm = L('#d9d3c7'); const m = new THREE.Mesh(new THREE.BoxGeometry(18, 7, 10), wm); m.position.y = 3.5; m.castShadow = m.receiveShadow = true; g.add(m);
  for (let k = 0; k < 2; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.4, 10.2), L('#b8b1a3')); s.position.y = 2.4 + k * 2.4; g.add(s); }
  const pt = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 200px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('P', w / 2, h / 2 + 10); });
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), L('#fff', { map: pt })); ps.position.set(0, 5.4, -5.06); ps.rotation.y = Math.PI; g.add(ps); }

// ---------------- ticket booth ----------------
const MACH = new THREE.Group(); MACH.position.set((MX0 + MX1) / 2, 0, (MZ0 + MZ1) / 2); scene.add(MACH);
const MW = MX1 - MX0, MD = MZ1 - MZ0; const yelM = STD('#ffcc1a', { roughness: 0.45 }), yelD = STD('#e0a800', { roughness: 0.5 });
const mBody = new THREE.Mesh(new THREE.BoxGeometry(MW, MH - 0.2, MD), yelM); mBody.position.y = (MH - 0.2) / 2; mBody.castShadow = mBody.receiveShadow = true; MACH.add(mBody);
const LIDP = new THREE.Group(); LIDP.position.set(-MW / 2, MH - 0.2, 0); MACH.add(LIDP);    // lid hinged at the back (-x) edge
{ const lid = new THREE.Mesh(new THREE.BoxGeometry(MW + 0.16, 0.22, MD + 0.16), yelD); lid.position.set(MW / 2, 0.11, 0); lid.castShadow = true; LIDP.add(lid); }
// face (+x) decals: hatch hole, flap, screen, button, coin slot
const faceX = MW / 2 + 0.006; const hz = HZ - (MZ0 + MZ1) / 2;
const holeM = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.62), new THREE.MeshBasicMaterial({ color: '#1a1410' })); holeM.rotation.y = Math.PI / 2; holeM.position.set(faceX, HY, hz); MACH.add(holeM);
{ const fr = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.74, 0.08), STD('#555')); fr.position.set(faceX, HY, hz - 0.36); MACH.add(fr); const f2 = fr.clone(); f2.position.z = hz + 0.36; MACH.add(f2);
  const f3 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.8), STD('#555')); f3.position.set(faceX, HY - 0.35, hz); MACH.add(f3); }
const FLAP = new THREE.Group(); FLAP.position.set(faceX + 0.02, HY + 0.33, hz); MACH.add(FLAP);
{ const ft = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#3a3f46'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffcc1a'; c.font = '900 46px Inter'; c.textAlign = 'center'; c.fillText('INSERT', w / 2, 100); c.fillText('TICKET', w / 2, 152); c.fillStyle = '#111'; c.fillRect(40, 190, 176, 18); });
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.64, 0.64), [STD('#3a3f46', { map: ft }), STD('#3a3f46'), STD('#3a3f46'), STD('#3a3f46'), STD('#3a3f46'), STD('#3a3f46')]); f.position.y = -0.32; f.castShadow = true; FLAP.add(f); }
const SCREENS = ['PLEASE PAY', 'CHEWING…', 'BAA', 'BAA!', 'THANK YOU', 'NOM NOM'].map((s, k) => canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#0d2b1a'; c.fillRect(0, 0, w, h); c.fillStyle = k === 2 || k === 3 ? '#ff5252' : '#5cff8a'; c.font = `900 ${s.length > 7 ? 40 : 58}px Inter`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, w / 2, h / 2 + 3); }));
const scrM = new THREE.MeshBasicMaterial({ map: SCREENS[0], toneMapped: false });
const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), scrM); scr.rotation.y = Math.PI / 2; scr.position.set(faceX + 0.005, 2.0, hz); MACH.add(scr);
{ const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.74), STD('#333')); b.position.set(faceX - 0.02, 2.0, hz); MACH.add(b); }
const btnM = new THREE.MeshStandardMaterial({ color: '#1fa64a', emissive: '#30ff70', emissiveIntensity: 0.1, roughness: 0.3 });
const BTN = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 20), btnM); BTN.rotation.z = Math.PI / 2; BTN.position.set(faceX + 0.03, 1.02, hz); BTN.castShadow = true; MACH.add(BTN);
{ const r = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 20), STD('#ddd', { metalness: 0.6 })); r.rotation.y = Math.PI / 2; r.position.set(faceX + 0.01, 1.02, hz); MACH.add(r); }
// signs: TICKETS banner on the -z face and the +x face top
const tkT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TICKETS', w / 2, h / 2 + 4); });
{ const s1 = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), L('#fff', { map: tkT })); s1.position.set(0, MH - 0.45, -MD / 2 - 0.01); s1.rotation.y = Math.PI; MACH.add(s1);
  const s2 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), L('#fff', { map: tkT })); s2.position.set(faceX, MH - 0.5, 0); s2.rotation.y = Math.PI / 2; MACH.add(s2); }
// barrier
const BAR = new THREE.Group(); BAR.position.set(BX, 1.0, BZ); scene.add(BAR);
{ const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 0.4), STD('#e7e7e7')); post.position.set(BX, 0.55, BZ); post.castShadow = true; scene.add(post);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.44), STD('#d32f2f')); cap.position.set(BX, 1.14, BZ); scene.add(cap);
  const st = canvasTex(512, 32, (c, w, h) => { for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(i * w / 10, 0, w / 10, h); } });
  const arm = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.08), STD('#fff', { map: st })); arm.position.x = 2.4; arm.castShadow = true; BAR.add(arm); }

// ---------------- hero car ----------------
const hero = makeCar('#18a999', { });
const glassMat = hero.userData.bodyG.children[1].material; glassMat.color.set('#a9c4d8'); glassMat.transparent = true; glassMat.opacity = 0.42; glassMat.metalness = 0.3; glassMat.depthWrite = false;
hero.userData.bodyG.children[1].userData.noAO = true; hero.userData.bodyG.children[1].castShadow = false;
const HB = hero.userData.bodyG;
const ORIG = HB.children.slice();                  // all original body parts (hidden at the end of the wrong way)
const MIRROR_L = ORIG.find(o => o.geometry && o.geometry.parameters && o.geometry.parameters.width === 0.22 && o.position.x < 0);
const skin = STD('#f1c8a5', { roughness: 0.7 });
const KEEP = new THREE.Group(); HB.add(KEEP);       // seat, wheel, driver (survive)
{ const seatM = STD('#3e2723', { roughness: 0.8 });
  const bk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.12), seatM); bk.position.set(-0.42, 1.12, 0.45); bk.rotation.x = -0.12; KEEP.add(bk);
  const cu = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), seatM); cu.position.set(-0.42, 0.82, 0.2); KEEP.add(cu);
  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.3), STD('#555')); ped.position.set(-0.42, 0.52, 0.2); KEEP.add(ped);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.032, 8, 22), STD('#222')); sw.position.set(-0.42, 1.12, -0.32); sw.rotation.x = -0.9; KEEP.add(sw);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.75, 8), STD('#444')); col.position.set(-0.42, 0.82, -0.5); col.rotation.x = 0.6; KEEP.add(col);
  const ps = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.12), seatM); ps.position.set(0.42, 1.12, 0.45); ps.rotation.x = -0.12; HB.add(ps); ORIG.push(ps);
  // glovebox + dashboard
  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.3), STD('#2b2b2b')); dash.position.set(0, 1.0, -0.72); HB.add(dash); ORIG.push(dash); }
const DRV = new THREE.Group(); DRV.position.set(-0.42, -0.38, 0.12); KEEP.add(DRV);
const EYES_D = [];
{ const tor = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.3, 4, 10), STD('#ff7043')); tor.position.y = 1.3; DRV.add(tor);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), skin); hd.position.y = 1.7; DRV.add(hd);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), STD('#5d4037')); hair.position.y = 1.72; hair.rotation.x = 0.25; DRV.add(hair);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), STD('#fff')); e.position.set(s * 0.06, 1.72, -0.135); DRV.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), STD('#111')); p.position.set(s * 0.06, 1.72, -0.175); DRV.add(p); EYES_D.push(e); }
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.013, 6, 12), STD('#5a0000')); mo.position.set(0, 1.62, -0.15); DRV.add(mo); DRV.userData.mouth = mo;
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.32, 4, 8), STD('#ff7043')); a.position.set(s * 0.2, 1.35, -0.2); a.rotation.x = 1.1; DRV.add(a); } }
DRV.traverse(o => { if (o.isMesh) o.castShadow = true; });
// arm out of the left (driver) window, points along local +x towards a target
const ARM = new THREE.Group(); scene.add(ARM);
{ const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.55, 4, 8), STD('#ff7043')); a.rotation.z = -Math.PI / 2; a.position.x = 0.32; ARM.add(a);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), skin); h.position.x = 0.7; ARM.add(h); }
ARM.traverse(o => { if (o.isMesh) o.castShadow = true; });
// number plates
const plT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#111'; c.lineWidth = 5; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#1e3fa8'; c.fillRect(3, 3, 30, h - 6); c.fillStyle = '#111'; c.font = '900 44px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PT 53', w / 2 + 14, h / 2 + 2); });
const plGeo = new THREE.BoxGeometry(0.62, 0.15, 0.03);
const plMat = [STD('#fff'), STD('#fff'), STD('#fff'), STD('#fff'), STD('#fff', { map: plT }), STD('#fff', { map: plT })];
const PLATE_F = new THREE.Mesh(plGeo, plMat); PLATE_F.position.set(0, 0.5, -2.275); HB.add(PLATE_F); ORIG.push(PLATE_F);
{ const pr = new THREE.Mesh(plGeo, plMat); pr.position.set(0, 0.5, 2.26); HB.add(pr); ORIG.push(pr); }
// free-flying copies of eaten parts
const FLY = { mirror: MIRROR_L.clone(), plate: PLATE_F.clone(), wheels: hero.userData.wheels.map(w => w.clone()) };
scene.add(FLY.mirror); scene.add(FLY.plate); FLY.wheels.forEach(w => scene.add(w));
// ticket + road map
const TICKET = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 0.09), [STD('#fff'), STD('#fff'), STD('#fff', { map: canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let i = 0; i < 14; i++) c.fillRect(10 + i * 7, 12, 3 + (i % 3), 30); c.font = '800 12px Inter'; c.fillText('PARKING', 20, 58); }) }), STD('#fff'), STD('#fff'), STD('#fff')]);
TICKET.castShadow = true; scene.add(TICKET);
const mapT = canvasTex(512, 384, (c, w, h) => { c.fillStyle = '#9fd3f2'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#cfe8a8'; c.beginPath(); const R = rng(77); c.moveTo(60, 380); const pts = [[40, 300], [90, 250], [70, 190], [130, 150], [120, 90], [200, 60], [240, 110], [300, 70], [360, 40], [430, 70], [500, 60], [512, 384]]; pts.forEach(([x, y]) => c.lineTo(x + (R() - 0.5) * 20, y + (R() - 0.5) * 20)); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(80, 120, 40, 60, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(270, 330, 30, 50, 0.6, 0, 7); c.fill();
  c.strokeStyle = '#e53935'; c.lineWidth = 5; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(120 + R() * 360, 120 + R() * 240); c.quadraticCurveTo(150 + R() * 300, 100 + R() * 250, 140 + R() * 360, 110 + R() * 250); c.stroke(); }
  c.strokeStyle = '#f9a825'; c.lineWidth = 3; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(130 + R() * 350, 110 + R() * 260); c.lineTo(130 + R() * 350, 110 + R() * 260); c.stroke(); }
  c.fillStyle = '#c62828'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText('EUROPE', 300, 260); c.strokeStyle = '#999'; c.lineWidth = 2; for (let x = 128; x < w; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } });
const MAP = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.68), STD('#fff', { map: mapT, side: THREE.DoubleSide, roughness: 0.8 })); MAP.castShadow = true; scene.add(MAP);

// ---------------- the goat (local forward +x, root on the ground) ----------------
const FUR = STD('#f3efe6', { roughness: 0.85 }), FUR2 = STD('#e4ddd0', { roughness: 0.9 }), PINK = STD('#c99a96', { roughness: 0.6 }), HORN = STD('#b59a72', { roughness: 0.6 }), HOOF = STD('#4a3b30');
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
const GOAT = new THREE.Group(); scene.add(GOAT);
const GB = new THREE.Group(); GOAT.add(GB);              // body (bob / belly)
const BELLY = mk(new THREE.SphereGeometry(1, 32, 20), FUR, 0, 0.95, 0, GB); BELLY.scale.set(0.75, 0.46, 0.4);
mk(new THREE.SphereGeometry(1, 20, 12), FUR2, -0.45, 1.05, 0, GB).scale.set(0.35, 0.36, 0.36);
const TAIL = new THREE.Group(); TAIL.position.set(-0.72, 1.22, 0); GB.add(TAIL); mk(new THREE.ConeGeometry(0.07, 0.24, 8), FUR, 0, 0.1, 0, TAIL).rotation.z = 0.5;
const LEGS = [[0.46, 0.2], [0.46, -0.2], [-0.46, 0.2], [-0.46, -0.2]].map(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, 0.68, z); GB.add(g);
  const l = mk(new THREE.CylinderGeometry(0.075, 0.06, 0.6, 10), FUR, 0, -0.3, 0, g); mk(new THREE.CylinderGeometry(0.07, 0.075, 0.1, 10), HOOF, 0, -0.63, 0, g); return { g, x, z, i }; });
const NECK = new THREE.Group(); NECK.position.set(0.55, 1.12, 0); GB.add(NECK);
const neckMesh = mk(new THREE.CylinderGeometry(0.15, 0.2, 0.55, 14), FUR, 0, 0.27, 0, NECK);
const HEAD = new THREE.Group(); HEAD.position.set(0, 0.52, 0); NECK.add(HEAD);
mk(new THREE.SphereGeometry(0.21, 24, 18), FUR, 0.12, 0.05, 0, HEAD).scale.set(1.05, 0.95, 0.9);
mk(new THREE.SphereGeometry(1, 24, 16), FUR, 0.34, -0.03, 0, HEAD).scale.set(0.27, 0.115, 0.115);
mk(new THREE.SphereGeometry(1, 16, 12), PINK, 0.59, -0.0, 0, HEAD).scale.set(0.035, 0.05, 0.07);
for (const s of [-1, 1]) { const n = mk(new THREE.SphereGeometry(1, 8, 6), STD('#5b3a35'), 0.6, 0.0, s * 0.035, HEAD); n.scale.set(0.012, 0.018, 0.012); }
const JAW = new THREE.Group(); JAW.position.set(0.2, -0.1, 0); HEAD.add(JAW);
mk(new THREE.SphereGeometry(1, 16, 10), FUR, 0.16, -0.02, 0, JAW).scale.set(0.2, 0.055, 0.1);
const TONGUE = mk(new THREE.CapsuleGeometry(0.035, 0.12, 4, 8), STD('#e57373'), 0.3, 0.02, 0, JAW); TONGUE.rotation.z = Math.PI / 2; TONGUE.visible = false;
const BEARD = mk(new THREE.ConeGeometry(0.06, 0.24, 10), FUR2, 0.3, -0.17, 0, JAW); BEARD.rotation.z = Math.PI;
for (const s of [-1, 1]) { const h = mk(new THREE.ConeGeometry(0.045, 0.34, 10), HORN, -0.02, 0.33, s * 0.08, HEAD); h.rotation.set(s * 0.15, 0, 0.55);
  const e = mk(new THREE.SphereGeometry(1, 14, 8), FUR, 0.0, 0.1, s * 0.22, HEAD); e.scale.set(0.12, 0.035, 0.08); e.rotation.set(s * -0.6, 0, 0.3); }
const GEYES = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(0.22, 0.11, s * 0.15); g.rotation.y = s > 0 ? 0.9 : Math.PI - 0.9; HEAD.add(g);   // local +z points out of the face
  mk(new THREE.SphereGeometry(0.07, 18, 12), STD('#f6d13a', { roughness: 0.3 }), 0, 0, 0, g);
  const p = mk(new THREE.BoxGeometry(0.075, 0.024, 0.02), STD('#111'), 0, 0, 0.064, g);
  const hl = mk(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' }), 0.022, 0.02, 0.07, g);
  const lid = mk(new THREE.SphereGeometry(0.078, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), FUR, 0, 0, 0, g);
  return { g, p, hl, lid }; });
GOAT.traverse(o => { if (o.isMesh) o.castShadow = true; });

// goat ground pose (pure function of t): {x, y, z, yaw, air}
const ROOT_IN = { x: -2.3, y: 0, z: HZ, yaw: 0 }, ROOT_HID = { x: -3.05, y: 0, z: HZ, yaw: 0 };
const P_MIR = { x: -1.75, y: 0, z: -1.95, yaw: -0.86 }, P_PLATE = { x: -0.6, y: 0, z: -3.5, yaw: -0.9 }, P_TYRE = { x: -1.35, y: 0, z: -2.65, yaw: -1.04 }, P_END = { x: -1.2, y: 0, z: -2.8, yaw: -1.17 };
const lerpP = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u), yaw: lerp(a.yaw, b.yaw, u) });
const jumpP = (a, b, u, h) => { const p = lerpP(a, b, ease(u)); p.y += h * Math.sin(Math.PI * clamp(u)); p.air = u > 0 && u < 1; return p; };
const tJump = tSo2 - 0.05, tJump1 = tJump + 0.7;
const tHop = tHops - 0.1, tHop1 = tHop + 0.75;
// car pose
const CPATH = roundedPath([[CX, 0], [CX, ROADZ], [-120, ROADZ]], 9);
const tDrive = tHop1 + 0.25;
const drvS = t => { if (t < tDrive) return 0; const d = t - tDrive; const a = 1.1; return d < a ? 7.5 * d * d / (2 * a) : 7.5 * a / 2 + 7.5 * (d - a); };
function carPose(t) {
  if (t < 2.2) { const u = clamp(t / 2.2); return { x: CX, z: 24 * Math.pow(1 - u, 2.2), h: 0 }; }
  if (isRight(t) && t > tDrive) { const p = pathAt(CPATH, drvS(t)); return { x: p.x, z: p.z, h: p.h }; }
  return { x: CX, z: 0, h: 0 };
}
function goatRoot(t) {
  const right = isRight(t);
  if (!right) {
    if (t < tThere - 0.05) return ROOT_HID;
    if (t < tJump - 0.25) return lerpP(ROOT_HID, ROOT_IN, easeOut(clamp((t - tThere + 0.05) / 0.35)));
    if (t < tJump) return lerpP(ROOT_IN, ROOT_HID, ease(clamp((t - tJump + 0.25) / 0.2)));
    if (t < tJump1) return jumpP({ x: -2.9, y: 0.3, z: HZ, yaw: 0 }, P_MIR, (t - tJump) / 0.7, 3.0);
    if (t < tThen1) return P_MIR;
    if (t < tThen1 + 0.6) { const u = (t - tThen1) / 0.6; return lerpP(P_MIR, P_PLATE, ease(u)); }
    if (t < tThen2) return P_PLATE;
    if (t < tThen2 + 0.55) { const u = (t - tThen2) / 0.55; return lerpP(P_PLATE, P_TYRE, ease(u)); }
    if (t < tFive) return P_TYRE;
    return P_END;
  }
  if (t < tHop) return ROOT_IN;
  const roofP = () => { const cp = carPose(t); const r = V3(0, 1.6, 0.1).applyAxisAngle(V3(0, 1, 0), cp.h); return { x: cp.x + r.x, y: 1.6, z: cp.z + r.z, yaw: cp.h + Math.PI / 2 }; };
  if (t < tHop1) { const p = jumpP({ x: -2.6, y: 0.4, z: HZ, yaw: 0 }, roofP(), (t - tHop) / 0.75, 2.6); p.yaw = lerp(0, Math.PI / 2, ease((t - tHop) / 0.75)); return p; }
  return roofP();
}
// distance table for the gait
const DT = 1 / 60, SD = [0]; { let pv = goatRoot(0); for (let t = DT; t <= TOTAL + 1; t += DT) { const p = goatRoot(t); const d = (p.air ? 0 : Math.hypot(p.x - pv.x, p.z - pv.z)) + Math.abs(p.yaw - pv.yaw) * 0.4; SD.push(SD[SD.length - 1] + (d < 1 ? d : 0)); pv = p; } }
const sAt = t => { const k = clamp(t / DT, 0, SD.length - 2), i = Math.floor(k); return lerp(SD[i], SD[i + 1], k - i); };

// ---------------- puffs ----------------
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 80 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const chase = (dx, dy, dz) => t => { const c = carPose(t); return [V3(c.x + dx, dy, c.z + dz), V3(c.x - 1.2, 1.3, c.z - 6), 40]; };
const follow = (off, look, fov = 40) => t => { const c = carPose(t); const r = v => V3(...v).applyAxisAngle(V3(0, 1, 0), c.h).add(V3(c.x, 0, c.z)); return [r(off), r(look), fov]; };
const FACE = Ac([0.15, 1.95, -3.0], [-1.4, 1.5, -0.3], 36);
const camKeys = [
  [0.0, chase(2.0, 2.9, 9.0)],
  [tTicket - 0.6, chase(1.6, 2.6, 7.5)],
  ...cut(tTicket - 0.55, Ac([1.4, 2.35, -4.7], [-1.15, 1.35, -0.2], 38)),
  [S('hook1').end + 0.3, Ac([1.2, 2.3, -4.4], [-1.15, 1.4, -0.2], 38)],
  ...cut(tChewed - 0.3, Ac([0.5, 2.05, -3.5], [-1.6, 1.65, -0.3], 36)),
  [tThere - 0.1, Ac([0.4, 2.0, -3.3], [-1.6, 1.65, -0.3], 36)],
  ...cut(tThere - 0.05, FACE),
  [tWhat - 0.25, Ac([0.1, 1.9, -2.85], [-1.4, 1.5, -0.3], 36)],
  ...cut(tWhat - 0.2, Ac([1.8, 2.6, -5.2], [-1.0, 1.35, -0.2], 40)),
  [S('hook2').end + 0.4, Ac([1.6, 2.5, -4.9], [-1.0, 1.35, -0.2], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([1.6, 2.35, -4.5], [-0.95, 1.4, -0.15], 40)),
  [S('wrong1').end + 0.2, Ac([1.4, 2.3, -4.2], [-0.95, 1.4, -0.15], 40)],
  ...cut(tBig - 0.15, FACE),
  [tSo2 - 0.3, Ac([0.05, 1.9, -2.7], [-1.4, 1.5, -0.3], 34)],
  ...cut(tSo2 - 0.25, Ac([4.6, 5.2, -7.4], [-1.0, 1.3, -1.8], 42)),
  [tThen2, Ac([4.5, 4.9, -7.2], [-0.8, 0.9, -1.9], 42)],
  [S('wrong3').start + 0.6, Ac([4.3, 4.7, -7.0], [-0.7, 0.8, -1.9], 42)],
  ...cut(tFive + 0.15, Ac([6.6, 2.9, -4.2], [-0.5, 0.95, -1.3], 50)),
  [tAndG - 0.2, Ac([6.2, 2.8, -4.0], [-0.5, 0.95, -1.3], 50)],
  ...cut(tAndG - 0.15, Ac([0.7, 2.05, 1.7], [-0.8, 1.4, -1.9], 38)),
  [tRew0, Ac([0.6, 1.95, 1.45], [-0.8, 1.45, -1.9], 36)],
  // right
  ...cut(tRew1, Ac([1.6, 2.35, -4.5], [-0.95, 1.4, -0.15], 40)),
  [tOpen - 0.3, Ac([1.4, 2.3, -4.3], [-0.95, 1.4, -0.15], 40)],
  ...cut(tOpen - 0.25, Ac([0.8, 2.2, -3.4], [-1.05, 1.4, -0.2], 38)),
  [S('right2').end + 0.2, Ac([0.6, 2.1, -3.2], [-1.1, 1.45, -0.25], 38)],
  ...cut(tMunch[0] - 0.2, FACE),
  [tHappy - 0.3, Ac([0.1, 1.9, -2.85], [-1.4, 1.5, -0.3], 36)],
  ...cut(tHappy - 0.25, Ac([0.9, 2.0, -3.4], [-1.4, 1.55, -0.3], 38)),
  [S('right3').end + 0.2, Ac([0.8, 2.0, -3.3], [-1.4, 1.5, -0.3], 38)],
  ...cut(tPresses - 0.2, Ac([0.45, 1.75, -3.0], [-1.35, 1.25, -0.3], 38)),
  [tBarrier - 0.3, Ac([0.4, 1.7, -2.85], [-1.35, 1.25, -0.3], 38)],
  ...cut(tBarrier - 0.25, Ac([2.6, 3.0, 5.0], [-0.6, 1.6, -4.5], 40)),
  [S('right4').end + 0.2, Ac([2.5, 3.1, 4.6], [-0.6, 2.0, -4.5], 40)],
  ...cut(tKnows - 0.2, FACE),
  [tHops - 0.35, Ac([0.1, 1.95, -2.9], [-1.4, 1.55, -0.3], 36)],
  ...cut(tHops - 0.3, Ac([4.4, 3.6, -6.4], [-0.6, 1.9, -0.3], 40)),
  [tDrive, Ac([4.2, 3.6, -6.2], [-0.3, 2.0, -0.6], 40)],
  ...cut(tDrive + 0.3, follow([-3.0, 3.6, -7.5], [0, 1.9, 0], 40)),
  [tTurn - 0.3, follow([-3.0, 3.4, -7.0], [0, 1.9, 0], 40)],
  ...cut(tTurn - 0.25, follow([2.6, 3.6, 7.8], [0, 1.8, -4], 40)),
  [S('right7').start - 0.2, follow([2.6, 3.8, 8.4], [0, 1.8, -4], 40)],
  ...cut(S('right7').start - 0.15, follow([-3.2, 3.2, -7.4], [0, 2.0, 0], 40)),
  [TOTAL, follow([-3.6, 3.6, -8.6], [0, 2.0, 0], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _up = V3(0, 1, 0);
function flyTo(obj, from, to, u, s0 = 1) { obj.visible = u < 1; obj.position.copy(from).lerp(to, ease(u)); obj.position.y += 0.25 * Math.sin(Math.PI * u); obj.scale.setScalar(Math.max(0.01, s0 * (1 - 0.85 * easeIn(u)))); }
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  // ---- car
  const cp = carPose(t); placeCar(hero, cp);
  const wheelEat = !right ? [tTyres + 0.05, tChomp[0] + 0.05, tChomp[1] + 0.05, tChomp[2] + 0.05] : [1e9, 1e9, 1e9, 1e9];
  const wOrder = [0, 1, 2, 3]; // FL, FR, RL, RR
  const gone = wOrder.map(i => t > wheelEat[i] + 0.25);
  hero.userData.wheels.forEach((w, i) => w.visible = !gone[i]);
  const sinkF = (gone[0] + gone[1]) / 2, sinkR = (gone[2] + gone[3]) / 2, sinkL = (gone[0] + gone[2]) / 2, sinkRt = (gone[1] + gone[3]) / 2;
  const final = !right && t > tFive + 0.1;
  hero.position.y = -0.3 * (sinkF + sinkR) / 2; hero.rotation.x = 0.13 * (sinkR - sinkF) * 0.5; hero.rotation.z = 0.15 * (sinkRt - sinkL) * 0.5;
  if (final) { hero.position.y = -0.27; hero.rotation.x = 0; hero.rotation.z = 0; }
  ORIG.forEach(o => o.visible = !final); MIRROR_L.visible = MIRROR_L.visible && !(!right && t > tMirror + 0.05);
  PLATE_F.visible = PLATE_F.visible && !(!right && t > tPlate + 0.05);
  hero.userData.wheels.forEach((w, i) => { if (final) w.visible = false; });
  hero.userData.hl.emissiveIntensity = 0.35;
  blink(hero, t, right && t > tDrive + 1.0 && t < tLeft + 1.8, false);
  hero.updateMatrixWorld(true);
  const CW = v => hero.localToWorld(v.clone());
  // driver expressions
  const shout = !right && t > tHey - 0.1 && t < S('wrong1').end + 0.2;
  const scared = !right && t > tAndG - 0.2;
  DRV.userData.mouth.scale.set(shout || scared ? 2.0 : 1, shout || scared ? 2.4 : 1, 1);
  EYES_D.forEach(e => e.scale.setScalar(scared ? 1.35 : 1));
  DRV.rotation.y = scared ? -0.5 : 0;
  // ---- machine
  MACH.position.x = (MX0 + MX1) / 2; MACH.rotation.set(0, 0, 0);
  const chewShake = (!right && t > tChewed - 0.05 && t < tThere) ? 1 : 0;
  if (chewShake) { MACH.rotation.z = 0.025 * Math.sin(t * 38); MACH.rotation.x = 0.015 * Math.sin(t * 29); }
  let scrK = 0; if (!right) { if (t > tChewed - 0.05) scrK = 1; if (t > tBaa - 0.05) scrK = 2; if (t > tBaa + 0.5) scrK = 3; } else { scrK = 1; if (t > tMunch[0]) scrK = 5; if (t > tNose) scrK = 4; }
  scrM.map = SCREENS[scrK];
  const hatchOpen = (!right && t > tThere - 0.12) || right;
  FLAP.scale.y = hatchOpen ? Math.max(0.04, 1 - easeOut(clamp((t - (right ? -10 : tThere - 0.12)) / 0.2))) : 1; FLAP.rotation.z = (!right && t > tChewed - 0.05 && t < tThere ? 0.12 * Math.abs(Math.sin(t * 20)) : 0);
  const lidOpen = Math.max(!right ? win(t, tJump - 0.15, tJump + 1.2, 0.15) : 0, right ? win(t, tHop - 0.15, tHop + 1.3, 0.15) : 0);
  LIDP.rotation.z = 1.9 * lidOpen;
  btnM.emissiveIntensity = right && t > tNose - 0.05 && t < tNose + 1.2 ? 1.0 : 0.1;
  BTN.position.x = faceX + 0.03 - (right && t > tNose - 0.05 && t < tNose + 0.3 ? 0.035 : 0);
  const barU = right ? ease(clamp((t - tBarrier) / 0.8)) : 0; BAR.rotation.z = barU * Math.PI * 0.47;
  // ---- goat root
  const gp = goatRoot(t);
  GOAT.position.set(gp.x, gp.y, gp.z); GOAT.rotation.set(0, gp.yaw, 0);
  const s = sAt(t), moving = Math.abs(sAt(t + 0.05) - s) > 0.01;
  // gait
  LEGS.forEach(Lg => { const ph = s / 0.55 * Math.PI * 2 + (Lg.i === 0 || Lg.i === 3 ? 0 : Math.PI); Lg.g.rotation.z = gp.air ? (Lg.x > 0 ? 0.7 : -0.7) : (moving ? 0.45 * Math.sin(ph) : 0); });
  let bob = moving && !gp.air ? 0.04 * Math.abs(Math.sin(s / 0.55 * Math.PI * 2)) : 0;
  // expressions
  const happy = right && ((t > tHappy - 0.1 && t < S('right3').end + 0.3) || (t > tHeart - 0.3 && t < tHops - 0.2) || t > tBaa6 - 0.1);
  if (happy) bob += 0.05 * Math.abs(Math.sin(t * 9));
  const fat = final ? 1.0 : 0;
  BELLY.scale.set(0.75 + 0.22 * fat, 0.46 + 0.2 * fat, 0.4 + 0.22 * fat);
  GB.position.y = bob; LEGS.forEach(Lg => Lg.g.position.y = 0.68);
  TAIL.rotation.x = (happy ? 0.7 : 0.25) * Math.sin(t * (happy ? 22 : 6));
  // neck/head pose: default looking forward; pitch + yaw targets
  let nPitch = -0.55, hPitch = 0.55, nYaw = 0, jaw = 0, lid = -0.15, pupil = 1, tongue = 0;
  const chewing = (!right && t > tThere && t < tFive + 3) || (right && ((t > tRew1 && t < S('right2').start) || (t > tMunch[0] - 0.05 && t < tHappy)));
  if (chewing) jaw = 0.12 + 0.12 * Math.sin(t * 15);
  // hungry (wrong2): eyes wide, lick
  if (!right && t > tShouting - 0.1 && t < tSo2 - 0.2) { lid = -1.0; pupil = 1.5; tongue = win(t, tHungry2 - 0.1, tSo2 - 0.25, 0.12); jaw = 0.2; }
  // looking at the driver in wrong1 / right2
  if ((!right && t > tShout && t < S('wrong1').end + 0.3) || (right && t > tNever - 0.2 && t < tMunch[0])) { nYaw = 0.35; }
  // eating targets in wrong2
  const reach = (u) => { nPitch = lerp(-0.55, -1.25, u); hPitch = lerp(0.55, 0.3, u); };
  if (!right) {
    if (t > tWing - 0.3 && t < tThen1) reach(win(t, tWing - 0.3, tThen1, 0.25) * 0.4);
    if (t > tNumberStart() && t < tThen2) reach(win(t, tNumberStart(), tThen2, 0.25) * 0.95);
    if (t > tTyres - 0.35 && t < tFive) reach(win(t, tTyres - 0.35, tFive, 0.25) * 1.0);
    if (final) { nPitch = -0.4; hPitch = 0.45; nYaw = 0.1 * Math.sin(t * 1.5); }
    if (t > tStill - 0.2) { lid = -1.0; pupil = 1.6; tongue = win(t, tStill + 0.1, tRew0 + 0.3, 0.12); jaw = 0.18; nPitch = -0.35; }
  } else {
    if (t > tOffer - 0.1 && t < tMunch[0]) nYaw = 0.45;
    if (t > tPresses - 0.1 && t < tBarrier + 0.4) { const u = win(t, tPresses - 0.1, tBarrier + 0.4, 0.4); nPitch = lerp(-0.55, -0.5, u); hPitch = lerp(0.55, -0.95, u) - (t > tNose - 0.15 && t < tNose + 0.25 ? 0.1 : 0); }
    if (t > tKnows - 0.2 && t < tHops - 0.2) { nPitch = -0.35; hPitch = 0.35 + 0.08 * Math.sin(t * 5); }
    if (t > tHop1) { nPitch = -0.75; hPitch = 0.9; }
    if (t > tTurn - 0.15) { nYaw = 0.8 * win(t, tTurn - 0.15, tBaa6 + 1.0, 0.25); }
    if (t > tBaa6 - 0.15 && t < tBaa6 + 0.6) jaw = 0.35;
    if (t > S('right7').start) { nYaw = 0.3 * Math.sin(t * 2); }
  }
  if (happy) lid = 1.45;
  const blinkNow = (t % 3.3) < 0.12; if (blinkNow && lid < 1) lid = 1.5;
  NECK.rotation.set(0, nYaw, nPitch); HEAD.rotation.set(0, 0, hPitch);
  JAW.rotation.z = -jaw; TONGUE.visible = tongue > 0.02; TONGUE.position.x = 0.22 + 0.12 * tongue; TONGUE.position.y = 0.02 - 0.03 * Math.sin(t * 12) * tongue;
  GEYES.forEach(E => { E.lid.rotation.x = lid; E.p.scale.set(pupil, pupil, 1); });
  GOAT.updateMatrixWorld(true);
  const mouth = HEAD.localToWorld(V3(0.5, -0.12, 0));
  // ---- ticket
  TICKET.visible = false;
  if (!right && t > tTicket - 0.7 && t < tMachine1 + 0.5) { TICKET.visible = true; }
  if (!right && t > tThere - 0.1 && t < S('wrong1').end) { TICKET.visible = true; }
  // ---- arm
  ARM.visible = false;
  const shoulder = CW(V3(-0.75, 1.2, -0.12));
  const armTo = (target, u) => { ARM.visible = true; const tip = shoulder.clone().lerp(target, u); const d = tip.clone().sub(shoulder); const len = Math.max(0.25, d.length()); ARM.position.copy(shoulder); ARM.quaternion.setFromUnitVectors(V3(1, 0, 0), d.normalize()); ARM.scale.set(len / 0.72, 1, 1); return tip; };
  const slot = V3(MX1 + 0.04, HY - 0.25, HZ);
  if (!right && t > tTicket - 0.75 && t < tMachine1 + 0.7) {
    const u = win(t, tTicket - 0.75, tMachine1 + 0.7, 0.45); const tip = armTo(slot.clone().add(V3(0.14, 0, 0)), u);
    const ins = clamp((t - tMachine1 + 0.05) / 0.35);
    TICKET.position.copy(tip).add(V3(-0.1 - 0.2 * ins, 0, 0)); TICKET.rotation.set(0, 0, 0); TICKET.visible = ins < 1;
  }
  if (!right && t > tShout - 0.1 && t < S('wrong1').end + 0.3) { const tgt = CW(V3(-1.6, 1.9, -0.5)); armTo(tgt, win(t, tShout - 0.1, S('wrong1').end + 0.3, 0.2) * (1 + 0.05 * Math.sin(t * 14))); }
  if (!right && t > tThere - 0.1 && t < S('wrong1').end) { TICKET.position.copy(mouth).add(V3(0.08, 0.0, 0)); TICKET.rotation.set(0.2, 0, 0.3 * Math.sin(t * 15)); const u = clamp((t - tThere) / (S('wrong1').end - tThere)); TICKET.scale.set(1 - 0.9 * u, 1, 1); }
  // ---- road map (right)
  MAP.visible = false;
  if (right && t > tOpen - 0.2 && t < tMunch[1] + 0.6) {
    const u = win(t, tOpen - 0.2, tMunch[0] + 0.1, 0.5);
    const tgt = CW(V3(-1.45, 1.45, -0.32));
    const tip = armTo(tgt, u);
    const unf = ease(clamp((t - tOffer) / 0.6));
    const eat = clamp((t - tMunch[0] + 0.05) / (tMunch[1] + 0.5 - tMunch[0]));
    MAP.visible = eat < 0.98; MAP.position.copy(tip).add(V3(-0.12, 0.08, -0.08 + 0.3 * unf));
    MAP.rotation.set(0, Math.PI / 2 + 0.35, 0);
    MAP.scale.set(Math.max(0.02, (0.25 + 0.75 * unf) * (1 - eat)), Math.max(0.02, (0.35 + 0.65 * unf) * (1 - eat * 0.7)), 1);
    if (t > tMunch[0] - 0.05) { ARM.visible = t < tMunch[0] + 0.3; MAP.position.lerp(mouth.clone().add(V3(0.15, -0.05, 0)), ease(clamp((t - tMunch[0] + 0.05) / 0.25))); }
  }
  // ---- flying eaten parts (wrong)
  FLY.mirror.visible = FLY.plate.visible = false; FLY.wheels.forEach(w => w.visible = false);
  if (!right) {
    const fm = (obj, src, t0, s0) => { if (t > t0 && t < t0 + 0.6) { const u = clamp((t - t0) / 0.3); src.updateMatrixWorld(true); const from = new THREE.Vector3().setFromMatrixPosition(src.matrixWorld); obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().extractRotation(src.matrixWorld)); flyTo(obj, from, mouth, u, s0); obj.visible = u < 0.98; } };
    fm(FLY.mirror, MIRROR_L, tMirror + 0.05, 1);
    fm(FLY.plate, PLATE_F, tPlate + 0.05, 1);
    hero.userData.wheels.forEach((w, i) => fm(FLY.wheels[i], w, wheelEat[i], 1));
    // crumbs on each bite
    for (const tb of [tMirror + 0.3, tPlate + 0.3, ...wheelEat.map(x => x + 0.3)]) if (t > tb && t < tb + 0.5) { const d = t - tb; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + tb; puff(mouth.clone().add(V3(Math.cos(a) * d * 1.2, 0.1 + d * 0.8, Math.sin(a) * d * 1.2)), 0.18 + d * 0.3, 0.8 * (1 - d / 0.5), '#cfcfcf'); } }
    // poof: 5 minutes later
    if (t > tFive - 0.25 && t < tFive + 0.9) { const d = t - tFive + 0.25; const a = win(t, tFive - 0.25, tFive + 0.9, 0.25); for (let k = 0; k < 22; k++) { const ang = hash(k) * 6.28; puff(V3(CX - 0.5 + Math.cos(ang) * (1 + d * 2.0 * hash(k + 3)), 0.5 + hash(k + 7) * 1.8 + d, -0.8 + Math.sin(ang) * (1.4 + d * 2)), 1.6 + d * 1.5, 0.92 * a, '#efe9dd'); } }
    // jump dust
    if (t > tJump1 - 0.05 && t < tJump1 + 0.6) { const d = t - tJump1 + 0.05; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; puff(V3(P_MIR.x + Math.cos(a) * (0.4 + d * 2), 0.15 + d * 0.5, P_MIR.z + Math.sin(a) * (0.4 + d * 2)), 0.5 + d, 0.6 * (1 - d / 0.65), '#d9d4c8'); } }
  } else {
    if (t > tHop1 - 0.05 && t < tHop1 + 0.5) { const d = t - tHop1 + 0.05; const c = CW(V3(0, 1.65, 0)); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; puff(c.clone().add(V3(Math.cos(a) * (0.5 + d * 2), d * 0.4, Math.sin(a) * (0.6 + d * 2))), 0.45 + d, 0.55 * (1 - d / 0.55), '#ffffff'); } }
  }
  // ---- camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.updateProjectionMatrix();
  applyCam(c, t, 0);
  camera.updateMatrixWorld(true);
  screen = { drv: project(CW(V3(-0.5, 2.0, 0.1))), goat: project(HEAD.localToWorld(V3(0.15, 0.45, 0))), mouth: project(mouth), car: project(CW(V3(0, 1.6, 0))) };
}
function tNumberStart() { return tThen1 + 0.45; }

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0) => [clamp(p.x, 230, W - 230), clamp(p.y + dy, 560, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -120) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  const xx = clamp(x, w / 2 + 30, W - w / 2 - 30); ctx.translate(xx, y); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  const tx = clamp(x - xx, -w / 2 + 40, w / 2 - 40); ctx.beginPath(); ctx.moveTo(tx - 20, h / 2 - 4); ctx.lineTo(tx, h / 2 + 34); ctx.lineTo(tx + 22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function hearts(p, t, a, b) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 5; k++) { const d = ((t - a) * 0.8 + k / 5) % 1; ctx.save(); ctx.globalAlpha = win(t, a, b, 0.2) * (1 - d); iconHeart(p.x + 90 * Math.sin(k * 2.1 + d * 3), p.y - 40 - d * 260, 26 + 10 * hash(k), '#ff4d6d'); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('LEAVING THE CAR PARK', '#455a64', 0.45, tTicket - 0.2, 54);
    P_('INSERT TICKET…', '#1565c0', tTicket - 0.2, S('hook1').end + 0.3, 58);
    P_('IT… CHEWED IT?', '#6d4c41', tChewed - 0.1, tBaa - 0.15, 60);
    floatText('BAA!', 700, 640, t, tBaa - 0.05, tBaa + 0.9, 150, YEL, 0.1);
    P_('THERE’S A GOAT INSIDE', '#212121', tThere - 0.1, S('hook2').end + 0.3, 54);
    P_('SHOUT AT IT', RED, tShout - 0.1, S('wrong1').end + 0.3, 60, iconWarn);
    bubble('HEY! GIVE THAT BACK!', screen.drv, t, tHey - 0.1, S('wrong1').end + 0.3, 54, '#fff', '#111', -150);
    P_('SHOUTING = HUNGRY GOAT', RED, tShouting - 0.1, tSo2 - 0.1, 52, iconX);
    P_('WING MIRROR: EATEN', RED, tMirror - 0.05, tThen1 + 0.2, 54, iconX);
    P_('NUMBER PLATE: EATEN', RED, tPlate - 0.05, tThen2 + 0.1, 52, iconX);
    P_('TYRES: EATEN', RED, tTyres - 0.05, S('wrong2').end + 0.3, 60, iconX);
    floatText('CHOMP!', 330, 760, t, tChomp[0] - 0.03, tChomp[0] + 0.6, 110, YEL, -0.12);
    floatText('CHOMP!', 760, 700, t, tChomp[1] - 0.03, tChomp[1] + 0.6, 110, YEL, 0.1);
    floatText('CHOMP!', 520, 840, t, tChomp[2] - 0.03, tChomp[2] + 0.6, 120, YEL, -0.05);
    P_('5 MINUTES LATER…', '#212121', tFive - 0.1, tSeat - 0.3, 64);
    P_('YOU · SEAT · STEERING WHEEL', RED, tSeat - 0.3, tAndG - 0.15, 46, iconX);
    P_('STILL HUNGRY', RED, tStill - 0.1, tRew0, 64, iconX);
  } else {
    P_('NEVER ARGUE WITH A GOAT', GREEN, tNever - 0.1, tOpen - 0.15, 50, iconCheck);
    P_('GLOVEBOX: OLD ROAD MAP', GREEN, tOpen - 0.15, S('right2').end + 0.3, 50, iconCheck);
    floatText('MUNCH!', 360, 700, t, tMunch[0] - 0.03, tMunch[0] + 0.7, 110, YEL, -0.1);
    floatText('MUNCH!', 720, 780, t, tMunch[1] - 0.03, tMunch[1] + 0.7, 110, YEL, 0.1);
    P_('IT ATE ALL OF EUROPE', '#ef6c00', tEats - 0.1, tHappy - 0.15, 56);
    P_('HAPPY GOAT', GREEN, tHappy - 0.15, S('right3').end + 0.3, 64, iconHeart);
    hearts(screen.goat, t, tHappy - 0.1, S('right3').end + 0.4);
    P_('NOSE ON THE BUTTON', GREEN, tPresses - 0.1, tBarrier - 0.15, 56, iconCheck);
    P_('BARRIER UP!', GREEN, tBarrier - 0.15, S('right4').end + 0.3, 64, iconCheck);
    P_('KNOWS EVERY ROAD BY HEART', '#ef6c00', tKnows - 0.1, tHops - 0.2, 46, iconHeart);
    hearts(screen.goat, t, tHeart - 0.1, tHops - 0.2);
    P_('NEW SAT-NAV: GOAT', GREEN, tHops - 0.2, S('right5').end + 0.3, 56, iconCheck);
    bubble('IN 200 M, TURN LEFT. BAA!', screen.goat, t, S('right6').start - 0.05, S('right6').end + 0.5, 48, '#fff', '#111', -110);
  }
}
window.dbg = { goatRoot, carPose };
start(update, hud);
