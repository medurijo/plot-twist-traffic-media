// Episode 32: Petrol station – a circus fire-breather with the hiccups at the next pump
// hook: normal refuelling tip -> at pump 2 a fire-breather is "filling up" (drinking from the nozzle) and has fiery hiccups
// wrong: shout BOO to cure them -> he jumps, biggest flame of his life straight into your tank -> 3-2-1 lift-off, your car is a rocket,
//        over the town, into the circus tent: ta-da, the new human cannonball
// right: close the tank (click) -> pass him a glass of water -> circus cure: one-arm handstand on the pump, drink upside down ->
//        a tiny puff, hiccups gone -> thanks: a heart of fire + he toasts a marshmallow on your antenna
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, concreteMat, plane, instanced, makeLandscape, BIG,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, roundedPath, pathAt
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tEngine = WT('hook1', 'Engine'), tOpen = WT('hook1', 'open'), tGrab = WT('hook1', 'grab'), tBut = WT('hook2', 'But'), tCircus = WT('hook2', 'circus'), tHicW = WT('hook2', 'hiccups'), tWhat = WT('hook2', 'What');
const tHelp = WT('wrong1', 'help'), tBoo = WT('wrong1', 'Boo'), tBig = WT('wrong2', 'Big'), tJump = WT('wrong2', 'jumps'), tBiggest = WT('wrong2', 'biggest'), tTank = WT('wrong2', 'tank');
const t3 = WT('wrong3', 'Three'), t2 = WT('wrong3', 'two'), t1 = WT('wrong3', 'one'), tLift = WT('wrong3', 'lift'), tRocket = WT('wrong3', 'rocket'), tOver = WT('wrong3', 'Over'), tInto = WT('wrong3', 'into'), tTent = WT('wrong3', 'tent'), tTa = WT('wrong3', 'Ta'), tCannon = WT('wrong3', 'human');
const tClose = WT('right2', 'close'), tClick = WT('right2', 'Click'), tGlass = WT('right3', 'glass'), tCure = WT('right3', 'circus'), tHand = WT('right3', 'handstand'), tUpside = WT('right3', 'upside');
const tHicR = WT('right4', 'Hic'), tPuff = WT('right4', 'tiny'), tGone = WT('right4', 'gone'), tThanks = WT('right5', 'thanks'), tHeart = WT('right5', 'heart'), tToast = WT('right5', 'toasts'), tAntenna = WT('right5', 'antenna');
const tFull = WT('right6', 'Tank'), tToasted = WT('right6', 'toasted');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world ----------------
const ZR = -16;                                    // road along x in front of the station
const TX = 0, TZ = -300;                           // circus tent
makeLandscape({ avoid: (x, z) => (Math.abs(z - ZR) < 8) || (Math.abs(x) < 110 && z < 40 && z > -360), fieldAvoid: (x, z, w, d) => (Math.abs(z - ZR) - d / 2 < 10) || (Math.abs(x) - w / 2 < 115 && z + d / 2 > -370 && z - d / 2 < 45), near: [0, -150, 160, 420], trees: 1400, seed: 77 });
plane(-BIG, BIG, ZR - 3.6, ZR + 3.6, asphaltMat, 0.06, 7);
{ const g = new THREE.PlaneGeometry(3, 0.2); g.rotateX(-Math.PI / 2); const dl = []; for (let x = -400; x < 400; x += 9) dl.push([x, 0.08, ZR]); instanced(g, markMat, dl, false); }
// forecourt + driveway
const foreM = L('#ffffff', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c9c4ba'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = 185 + (hash(i) * 30 | 0); c.fillStyle = `rgb(${v},${v - 4},${v - 10})`; c.fillRect(hash(i + 3) * w, hash(i + 9) * h, 3, 3); } c.strokeStyle = '#b3ada2'; c.lineWidth = 3; c.strokeRect(0, 0, w, h); }, [8, 8]) });
plane(-14, 14, -12.4, 16, foreM, 0.065, 1);
// islands + pumps
const pumpTex = n => canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#f5f5f5'; c.fillRect(0, 0, w, h); c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, 90); c.fillStyle = '#fff'; c.font = '900 54px Inter'; c.textAlign = 'center'; c.fillText('PUMP ' + n, w / 2, 64);
  c.fillStyle = '#102027'; c.fillRect(30, 120, w - 60, 140); c.fillStyle = '#76ff03'; c.font = '700 54px monospace'; c.fillText('42.17', w / 2, 180); c.font = '700 34px monospace'; c.fillText('1.79 €/L', w / 2, 236);
  c.fillStyle = '#ffca28'; c.fillRect(30, 300, w - 60, 60); c.fillStyle = '#111'; c.font = '900 38px Inter'; c.fillText('SUPER 95', w / 2, 343); c.fillStyle = '#2e7d32'; c.fillRect(30, 380, w - 60, 60); c.fillStyle = '#fff'; c.fillText('DIESEL', w / 2, 423); });
function makeIsland(x, nA, nB, pil = true) {
  const isl = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 5.2), L('#e0e0e0')); isl.position.set(x, 0.1, 0); isl.receiveShadow = true; scene.add(isl);
  const plain = STD('#eeeeee'), tA = STD('#fff', { map: pumpTex(nA) }), tB = STD('#fff', { map: pumpTex(nB) });
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.9, 0.6), [tA, tB, plain, plain, plain, plain]); p.position.set(x, 1.15, 0); p.castShadow = p.receiveShadow = true; scene.add(p);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.7), STD('#d32f2f')); top.position.set(x, 2.16, 0); scene.add(top);
  if (pil) for (const z of [-2.3, 2.3]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.3, 0.35), STD('#fafafa')); pl.position.set(x, 2.85, z); pl.castShadow = true; scene.add(pl);
    const bol = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 10), STD('#ffca28')); bol.position.set(x, 0.55, z + Math.sign(z) * 0.5); scene.add(bol); }
}
makeIsland(-3, 1, 2, false); makeIsland(5, 3, 4);
for (const z of []) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.3, 0.35), STD('#fafafa')); pl.position.set(-5.9, 2.85, z); pl.castShadow = true; scene.add(pl); }
// canopy
{ const fas = canvasTex(1024, 64, (c, w, h) => { c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(0, h - 10, w, 6); c.font = '900 44px Inter'; c.textAlign = 'center'; c.fillText('FUEL  ·  SNACKS  ·  CAR WASH', w / 2, 44); });
  const cm = STD('#fff', { map: fas }), white = STD('#fafafa');
  const can = new THREE.Mesh(new THREE.BoxGeometry(14, 0.7, 9), [cm, cm, white, white, cm, cm]); can.position.set(1, 5.85, 0); can.castShadow = true; can.receiveShadow = true; scene.add(can);
  const lights = []; for (const x of [-4, -1, 2, 5]) for (const z of [-2.5, 0, 2.5]) lights.push([x, 5.49, z]); instanced(new THREE.BoxGeometry(1.2, 0.03, 0.4), STD('#fffde7', { emissive: '#fff9c4', emissiveIntensity: 0.6 }), lights, false); }
// shop
{ const sh = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 76px Inter'; c.textAlign = 'center'; c.fillText('SHOP 24/7', w / 2, 92); });
  const b = new THREE.Mesh(new THREE.BoxGeometry(14, 4.2, 6), L('#eceff1')); b.position.set(1, 2.1, 14); b.castShadow = b.receiveShadow = true; scene.add(b);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: sh })); s.position.set(1, 3.5, 10.98); s.rotation.y = Math.PI; scene.add(s);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.2), STD('#90caf9', { roughness: 0.1, metalness: 0.4 })); gl.position.set(1, 1.3, 10.97); gl.rotation.y = Math.PI; scene.add(gl);
  const ps = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 56px Inter'; c.textAlign = 'center'; c.fillText('FUEL', w / 2, 80); c.fillStyle = '#111'; c.fillRect(20, 120, w - 40, 160); c.fillRect(20, 310, w - 40, 160); c.fillStyle = '#ffca28'; c.font = '700 62px monospace'; c.fillText('1.79', w / 2, 220); c.fillText('1.69', w / 2, 410); });
  const pyl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 3), [STD('#d32f2f'), STD('#fff', { map: ps }), STD('#d32f2f'), STD('#d32f2f'), STD('#fff', { map: ps }), STD('#fff', { map: ps })]); pyl.position.set(11, 3, -11); pyl.rotation.y = Math.PI / 2; pyl.castShadow = true; scene.add(pyl); }
// town (the rocket flies over it)
{ const cols = ['#f4d6a0', '#d9a77f', '#bcd4e6', '#e8c3c3', '#c8dcb4', '#f0e2c4', '#d1c4e9', '#ffe0b2'];
  const winT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { c.fillStyle = '#5d7a99'; c.fillRect(20 + x * 80, 20 + y * 80, 46, 52); } }, [2, 2]);
  for (let gx = -100; gx <= 100; gx += 18) for (let gz = -30; gz > -270; gz -= 18) { const k = (gx + 200) * 7 + gz; if (Math.abs(gx - TX) < 40 && gz < -250) continue; if (hash(k) < 0.15) continue;
    const w = 9 + hash(k + 1) * 6, d = 9 + hash(k + 2) * 6, h = 6 + hash(k + 3) * 10, c = cols[(hash(k + 4) * cols.length) | 0]; const m = L(c, { map: winT }), r = L(c);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [m, m, r, r, m, m]); b.position.set(gx + (hash(k + 5) - 0.5) * 3, h / 2, gz + (hash(k + 6) - 0.5) * 3); b.castShadow = b.receiveShadow = true; scene.add(b);
    if (hash(k + 7) > 0.5) { const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) / 2 * 1.02, 3, 4, 1), L(['#b0473a', '#7b5e57', '#455a64'][k % 3 < 0 ? 0 : k % 3])); roof.rotation.y = Math.PI / 4; roof.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414); roof.position.set(b.position.x, h + 1.5, b.position.z); scene.add(roof); } }
  for (let gz = -30; gz > -270; gz -= 18) plane(-120, 120, gz + 7.5, gz + 9.5, asphaltMat, 0.05, 30); }
// circus tent
const tentStripe = canvasTex(1024, 128, (c, w, h) => { for (let i = 0; i < 24; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(i * w / 24, 0, w / 24 + 1, h); } });
{ const wallM = new THREE.MeshLambertMaterial({ map: tentStripe, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 6, 48, 1, true), wallM); wall.position.set(TX, 3, TZ); scene.add(wall);
  const roofT = canvasTex(1024, 256, (c, w, h) => { for (let i = 0; i < 24; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(i * w / 24, 0, w / 24 + 1, h); } c.fillStyle = '#ffca28'; c.fillRect(0, h - 22, w, 22); });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(16.6, 10, 48, 1, true), new THREE.MeshLambertMaterial({ map: roofT, side: THREE.DoubleSide })); roof.position.set(TX, 11, TZ); scene.add(roof);
  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 3), STD('#ffca28')); flag.position.set(TX + 0.7, 17.0, TZ); flag.rotation.z = -Math.PI / 2; scene.add(flag);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), STD('#5d4037')); pole.position.set(TX, 16.6, TZ); scene.add(pole);
  const sign = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#4a148c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffca28'; c.lineWidth = 14; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#ffca28'; c.font = '900 120px Inter'; c.textAlign = 'center'; c.fillText('CIRCUS FLAMBINI', w / 2, 170); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshBasicMaterial({ map: sign })); sg.position.set(TX + 18, 3.6, TZ + 20); sg.rotation.y = Math.PI / 4; scene.add(sg);
  for (const dx of [-5, 5]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5.4, 8), STD('#5d4037')); p.position.set(TX + 18 + dx * 0.707, 2.7, TZ + 20 - dx * 0.707); scene.add(p); }
  // interior: sawdust ring, red ring curb, bleachers with crowd, banner, spotlight
  const saw = new THREE.Mesh(new THREE.CircleGeometry(15.8, 48), L('#d7b47a')); saw.rotation.x = -Math.PI / 2; saw.position.set(TX, 0.07, TZ); scene.add(saw);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.3, 8, 48), STD('#c62828')); ring.rotation.x = -Math.PI / 2; ring.position.set(TX, 0.25, TZ); scene.add(ring);
  const crowd = [], cc = ['#e53935', '#fdd835', '#1e88e5', '#43a047', '#ffffff', '#fb8c00', '#8e24aa'], camA = Math.atan2(8, 8);
  for (let k = 0; k < 4; k++) { const R = 9.5 + k * 1.6, hgt = 0.5 + k * 0.6; const st = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.8, R + 0.8, hgt, 48, 1, true), new THREE.MeshLambertMaterial({ color: '#5d4037', side: THREE.DoubleSide })); st.position.set(TX, hgt / 2, TZ); scene.add(st);
    for (let a = 0; a < Math.PI * 2; a += 0.75 / R) { let da = Math.abs(((a - camA + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (da < 0.9) continue; crowd.push([TX + Math.cos(a) * R, hgt + 0.45, TZ + Math.sin(a) * R]); } }
  const cmesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 0.9, 0.45), L('#ffffff'), crowd.length); const o = new THREE.Object3D(); crowd.forEach((p, i) => { o.position.set(...p); o.updateMatrix(); cmesh.setMatrixAt(i, o.matrix); cmesh.setColorAt(i, new THREE.Color(cc[(hash(i) * 7) | 0])); }); scene.add(cmesh); window._crowd = { cmesh, crowd, o };
  const ban = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#ffca28'; c.fillRect(0, 0, w, h); c.fillStyle = '#b71c1c'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.fillText('TONIGHT: THE HUMAN', w / 2, 110); c.fillText('CANNONBALL!', w / 2, 215); });
  const bn = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: ban, side: THREE.DoubleSide })); bn.position.set(TX - 10.5, 4.3, TZ - 10.5); bn.rotation.y = Math.PI / 4; scene.add(bn); }
const spot = new THREE.Mesh(new THREE.ConeGeometry(3.6, 14, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#fff59d', transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); spot.position.set(TX, 7.5, TZ); scene.add(spot);
// other customers
{ const c = makeCar('#1e63d6'); placeCar(c, { x: 7.0, y: 0, z: 0.4, h: 0, pitch: 0, roll: 0 }); const c2 = makeCar('#fdd835'); placeCar(c2, { x: 3.0, y: 0, z: -0.8, h: Math.PI, pitch: 0, roll: 0 });
  const pc = ['#e53935', '#ffffff', '#455a64', '#8e24aa']; [[-10, 9], [-7, 9], [9, 9], [12, 9]].forEach(([x, z], i) => { const k = makeCar(pc[i]); placeCar(k, { x, y: 0, z, h: Math.PI / 2, pitch: 0, roll: 0 }); }); }

// ---------------- people ----------------
function makePerson(shirtMat, pants = '#37474f', skinC = '#f1c27d') {
  const g = new THREE.Group(); const root = new THREE.Group(); g.add(root); const skin = STD(skinC), sh = shirtMat, pm = STD(pants);
  const tor = new THREE.Group(); tor.position.y = 0.92; root.add(tor);
  const torM = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.42, 4, 12), sh); torM.position.y = 0.28; tor.add(torM);
  const head = new THREE.Group(); head.position.y = 0.76; tor.add(head); head.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), skin));
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), STD('#111')); e.position.set(s * 0.065, 0.04, -0.16); head.add(e); }
  const legs = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.92, 0); root.add(hip); const th = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.075, 0.46, 8), pm); th.position.y = -0.23; hip.add(th); const knee = new THREE.Group(); knee.position.y = -0.46; hip.add(knee); const sn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.42, 8), pm); sn.position.y = -0.21; knee.add(sn); const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.26), STD('#111')); shoe.position.set(0, -0.44, -0.05); knee.add(shoe); return { hip, knee }; });
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.28, 0.5, 0); tor.add(a); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.58, 8), sh); m.position.y = -0.29; a.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), skin); h.position.y = -0.62; a.add(h); a.userData.hand = h; return a; });
  scene.add(g); return { g, root, tor, head, legs, arms };
}
const stripeM = STD('#fff', { map: canvasTex(128, 128, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#d32f2f'; c.fillRect(0, i * h / 8, w, h / 8); } }) });
const fb = makePerson(stripeM, '#1a1a1a', '#f0b98a');
{ const must = STD('#111'); for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 6, 12, Math.PI * 1.3), must); m.position.set(s * 0.07, -0.06, -0.165); m.rotation.set(0, 0, s > 0 ? -0.6 : Math.PI - 2.5); fb.head.add(m); }
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), must); hair.position.y = 0.03; fb.head.add(hair);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), must); bun.position.set(0, 0.2, 0.02); fb.head.add(bun);
  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.04, 6, 16), STD('#ffca28')); sash.rotation.x = Math.PI / 2; sash.position.y = 0.02; fb.tor.add(sash);
  const brows = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.02), must); brows.position.set(0, 0.1, -0.17); fb.head.add(brows); fb.brows = brows; }
fb.g.traverse(o => { if (o.isMesh) o.castShadow = true; });
// his unicycle
{ const u = new THREE.Group(); u.position.set(-6.6, 0, -2.4); scene.add(u); const wh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.06, 8, 24), STD('#111')); wh.position.y = 0.42; wh.rotation.y = 0.3; u.add(wh);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), STD('#d32f2f')); post.position.set(0, 0.95, 0); post.rotation.z = 0.25; u.add(post); const seat = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.32), STD('#111')); seat.position.set(-0.11, 1.4, 0); u.add(seat); }

// ---------------- hero ----------------
const hero = makeCar('#35d43a', { antenna: true });
const flapPiv = new THREE.Group(); flapPiv.position.set(-0.935, 0.86, 1.13); hero.add(flapPiv);
{ const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.24), hero.userData.body); f.position.z = 0.12; flapPiv.add(f); }
const flapHole = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), STD('#111')); flapHole.position.set(-0.925, 0.86, 1.25); flapHole.rotation.y = -Math.PI / 2; hero.add(flapHole);
const fins = new THREE.Group(); hero.add(fins);
{ const fm = STD('#e53935', { roughness: 0.3, metalness: 0.3 }); for (const [x, y, z, rz] of [[-1.0, 0.75, 1.75, 0.55], [1.0, 0.75, 1.75, -0.55], [0, 1.72, 1.45, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.75, 0.75), fm); f.position.set(x, y, z); f.rotation.z = rz; f.castShadow = true; fins.add(f); }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 16), fm); nose.rotation.x = -Math.PI / 2; nose.position.set(0, 0.65, -2.55); fins.add(nose); }
const arm = new THREE.Group(); arm.position.set(-0.86, 1.08, -0.35); hero.add(arm);
{ const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.75, 8), STD('#2b6cb0')); a.position.y = 0.37; arm.add(a); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), STD('#f1c27d')); hd.position.y = 0.78; arm.add(hd); }
const marsh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 14), STD('#ffffff', { roughness: 0.9 })); marsh.position.set(0.5, 3.0, 0.9); hero.add(marsh);
hero.traverse(o => { if (o.isMesh) o.castShadow = true; });

// nozzles + hoses
function makeNozzle() { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.28), STD('#2e7d32')); g.add(h); const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), STD('#90a4ae', { metalness: 0.7 })); sp.rotation.x = Math.PI / 2; sp.position.set(0, 0.08, -0.25); g.add(sp); scene.add(g); return g; }
const nozA = makeNozzle(), nozB = makeNozzle();
const hoseM = STD('#1b1b1b', { roughness: 0.8 });
const hoses = [0, 1].map(() => Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), hoseM); scene.add(m); return m; }));
function setSeg(m, a, b) { const d = b.clone().sub(a); const l = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, Math.max(0.001, l), 1); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); }
function setHose(segs, a, b, sag) { const pts = []; for (let i = 0; i <= segs.length; i++) { const u = i / segs.length; const p = a.clone().lerp(b, u); p.y -= sag * 4 * u * (1 - u); p.y = Math.max(p.y, 0.25); pts.push(p); } segs.forEach((m, i) => setSeg(m, pts[i], pts[i + 1])); }
const HOME_A = V3(-2.52, 1.25, 0.12), HOME_B = V3(-3.48, 1.25, 0.12), HOSE_A = V3(-2.6, 0.7, -0.15), HOSE_B = V3(-3.4, 0.7, -0.15);
const glass = new THREE.Group(); scene.add(glass);
{ const gm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.24, 14, 1, true), new THREE.MeshStandardMaterial({ color: '#e3f2fd', transparent: true, opacity: 0.45, roughness: 0.05, side: THREE.DoubleSide })); glass.add(gm);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.2, 14), STD('#4fc3f7', { roughness: 0.1 })); water.position.y = -0.02; glass.add(water); glass.userData.water = water; }

// ---------------- particles (fire additive, smoke normal) ----------------
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const FP = Array.from({ length: 420 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); return s; });
const SP = Array.from({ length: 220 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#9e9e9e' })); s.visible = false; scene.add(s); return s; });
let fi = 0, si = 0;
const C1 = new THREE.Color('#fff6c0'), C2 = new THREE.Color('#ffb020'), C3 = new THREE.Color('#ff4a10'), C4 = new THREE.Color('#6a0a00'), _c = new THREE.Color();
const fireCol = a => a < 0.3 ? _c.copy(C1).lerp(C2, a / 0.3) : a < 0.7 ? _c.copy(C2).lerp(C3, (a - 0.3) / 0.4) : _c.copy(C3).lerp(C4, (a - 0.7) / 0.3);
function fire(p, size, a, alpha = 1) { const s = FP[fi++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.copy(fireCol(a)); s.material.opacity = alpha * (1 - a * a); }
function smoke(p, size, alpha, col = '#9e9e9e') { const s = SP[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }
// jet: particles born in [t0,t1] at `rate`, live `life`, travel from `from` along dir*len, spreading
function jet(t, t0, t1, from, to, { rate = 60, life = 0.45, s0 = 0.25, s1 = 1.1, spread = 0.5, seed = 0, rise = 0.6, alpha = 1 } = {}) {
  if (t < t0) return; const d = to.clone().sub(from);
  const kA = Math.max(0, Math.floor((t - life - t0) * rate)), kB = Math.floor((Math.min(t, t1) - t0) * rate);
  for (let k = kA; k <= kB; k++) { const tb = t0 + k / rate, age = (t - tb) / life; if (age < 0 || age > 1) continue;
    const j = V3(hash(k * 3 + seed) - 0.5, hash(k * 3 + 1 + seed) - 0.5, hash(k * 3 + 2 + seed) - 0.5).multiplyScalar(spread * age * 2);
    const p = from.clone().addScaledVector(d, Math.pow(age, 0.8)).add(j); p.y += rise * age * age; fire(p, lerp(s0, s1, age) * (0.8 + 0.4 * hash(k + seed + 7)), age, alpha); }
}
function burst(t, t0, at, { n = 40, r = 2.5, life = 0.9, size = 1.4, seed = 5, up = 1.2 } = {}) {
  const age = (t - t0) / life; if (age < 0 || age > 1) return;
  for (let k = 0; k < n; k++) { const th = hash(k + seed) * 6.283, ph = Math.acos(2 * hash(k + seed + 50) - 1), rr = r * (0.4 + 0.6 * hash(k + seed + 90)) * easeOut(age);
    const p = at.clone().add(V3(Math.sin(ph) * Math.cos(th) * rr, Math.abs(Math.cos(ph)) * rr * 0.7 + up * age, Math.sin(ph) * Math.sin(th) * rr)); fire(p, size * (0.6 + 0.8 * age), age); }
}

// ---------------- fire-breather pose ----------------
const FBX = -4.4, FBZ = 0.2, RY0 = -Math.PI / 2;
const T_HANG = tHicW + 0.25;
const hicsW = []; for (let h = tHicW + 0.55; h < tBoo - 0.35; h += 1.15) hicsW.push(h);
const T_HS = tHand - 0.15, T_HS1 = T_HS + 0.7;
const hicsR = []; for (let h = S('right1').start + 0.35; h < tGlass - 0.2; h += 1.15) hicsR.push(h);
const T_DN = tGone - 0.05, T_DN1 = T_DN + 0.7;
const T_HEART = tHeart - 0.35, T_HEART1 = T_HEART + 1.1;
const T_TOAST = tToast + 0.1, T_TOAST1 = T_TOAST + 1.5;
const T_RYF = Math.atan2(-(-1.93 - FBX), -(1.85 - FBZ));                // facing the open flap
const MARSH_W = () => hero.localToWorld(V3(0.5, 3.0, 0.9));
function hicK(t, list) { let k = 0; for (const h of list) { const d = t - h; if (d > -0.02 && d < 0.35) k = Math.max(k, Math.sin(Math.PI * clamp((d + 0.02) / 0.37))); } return k; }
function fbPose(t) {
  const P = { x: FBX, y: 0, z: FBZ, ry: RY0, flip: 0, armL: 0.12, armR: 0.12, armLz: 0, armRz: 0, lean: 0, jolt: 0, headX: 0 };
  // drinking from the nozzle in the hook
  const drink = 1 - ramp(t, T_HANG, T_HANG + 0.45); P.armR = lerp(0.12, 2.35, drink); P.headX = -0.25 * drink + 0.05 * Math.sin(t * 7) * drink;
  if (!isRight(t)) {
    P.jolt = hicK(t, hicsW);
    if (t > tBoo - 0.05) { const u = clamp((t - tBoo + 0.05) / 0.35); P.y = 0.25 * Math.sin(Math.PI * u); P.armL = P.armR = lerp(0.12, 2.6, Math.sin(Math.PI * u)); }
    if (t > tJump - 0.1) { const u = clamp((t - tJump + 0.1) / 0.7); P.y = 1.0 * Math.sin(Math.PI * u); P.armL = P.armR = 2.9 * Math.sin(Math.PI * Math.min(u, 0.5) * 2 / 2 + 0.0) + 0.12 * (1 - u); P.armLz = P.armRz = 0.5 * Math.sin(Math.PI * u); }
    P.ry = lerp(RY0, T_RYF, ease(clamp((t - tJump) / 0.6)));
    if (t > tBiggest - 0.3) { const k = ramp(t, tBiggest - 0.3, tBiggest) * (1 - ramp(t, tBiggest + 1.5, tBiggest + 1.9)); P.lean = -0.35 * ramp(t, tBiggest - 0.3, tBiggest - 0.05) * (1 - ramp(t, tBiggest - 0.05, tBiggest + 0.1)) + 0.25 * k; P.armL = P.armR = lerp(P.armL, 0.6, k); P.armLz = 0.5 * k; P.armRz = -0.5 * k; }
    if (t > tBiggest + 1.9) { const k = ramp(t, tBiggest + 1.9, tBiggest + 2.3); P.armL = P.armR = lerp(0.6, 2.9, k); P.armLz = 0.6 * k; P.armRz = -0.6 * k; }      // shocked
    return P;
  }
  P.armR = 0.12; P.headX = 0; P.jolt = hicK(t, hicsR);
  // catch the glass
  const reach = ramp(t, tGlass + 0.2, tGlass + 0.75); P.armR = lerp(0.12, 1.5, reach);
  // flip onto the pump (one-arm handstand), drink upside down, flip back
  const up = ease(clamp((t - T_HS) / 0.7)), dn = ease(clamp((t - T_DN) / 0.7)), f = up * (1 - dn);
  if (t > T_HS) { P.x = lerp(FBX, -3.0, f); P.y = lerp(0, 4.45, f) + 1.2 * Math.sin(Math.PI * clamp((t - T_HS) / 0.7)) * (t < T_DN ? 1 : 0) + 1.2 * Math.sin(Math.PI * clamp((t - T_DN) / 0.7)); P.flip = f;
    P.armL = lerp(0.12, Math.PI, f); P.armR = lerp(1.5, 2.35, Math.min(f, 1 - ramp(t, tGone - 0.6, tGone - 0.2))); P.armLz = 0; }
  if (t > T_DN) { P.armR = lerp(P.armR, 0.12, dn); }
  if (t > T_DN1) { const k = win(t, T_DN1, tThanks - 0.1, 0.2); P.armL = P.armR = lerp(0.12, 2.8, k); P.armLz = 0.6 * k; P.armRz = -0.6 * k; }   // ta-da pose
  // heart of fire: head back, breathe upward
  if (t > T_HEART - 0.3) { const k = win(t, T_HEART - 0.3, T_HEART1 + 0.2, 0.25); P.lean = 0.3 * k; P.headX = 0.45 * k; }
  // toast the marshmallow: turn to the antenna
  if (t > T_TOAST - 0.5) { hero.updateMatrixWorld(true); const m = MARSH_W(); const ry = Math.atan2(-(m.x - FBX), -(m.z - FBZ)); const k = win(t, T_TOAST - 0.5, tToasted + 0.6, 0.4); P.ry = lerp(RY0, ry, k); P.headX = 0.25 * k; P.armL = lerp(P.armL, 1.2, k); }
  if (t > tToasted + 0.4) { const k = ramp(t, tToasted + 0.4, tToasted + 0.8); P.armR = lerp(0.12, 2.9, k) + 0.3 * Math.sin(t * 12) * k; P.armRz = -0.5 * k; }   // wave
  return P;
}
function applyFb(P) {
  fb.g.position.set(P.x, P.y, P.z); fb.g.rotation.set(0, P.ry, 0);
  fb.root.position.y = 0; fb.root.rotation.set(P.flip * Math.PI, 0, 0);
  fb.tor.rotation.set(P.lean - 0.15 * P.jolt, 0, 0); fb.head.rotation.set(P.headX - 0.3 * P.jolt, 0, 0);
  fb.arms[0].rotation.set(P.armL, 0, -P.armLz); fb.arms[1].rotation.set(P.armR, 0, -P.armRz);
  fb.legs.forEach((l, i) => { l.hip.rotation.x = P.y > 0.05 && P.flip < 0.05 ? (i ? 0.4 : -0.3) : P.flip > 0.2 ? (i ? 0.25 : -0.25) : 0; l.knee.rotation.x = P.flip > 0.2 && P.flip < 0.95 ? -0.8 : 0; });
  fb.g.updateMatrixWorld(true);
}
const mouthW = () => fb.head.localToWorld(V3(0, -0.07, -0.2));
const mouthFwd = () => { const a = fb.head.localToWorld(V3(0, -0.07, -0.2)), b = fb.head.localToWorld(V3(0, -0.07, -1.2)); return b.sub(a).normalize(); };

// ---------------- hero pose ----------------
const P0 = { x: -1.0, y: 0, z: 0.6, h: 0, pitch: 0, roll: 0 };
const T_BOOM = tTank + 0.1, T_A1 = tLift + 0.55, T_TENT = tTent + 0.15, T_LAND = tTa - 0.05;
const BZ = [[-8, 0], [-22, 32], [TZ + 70, 78], [TZ, 17]];
const bez = (u, i) => { const v = 1 - u; return v * v * v * BZ[0][i] + 3 * v * v * u * BZ[1][i] + 3 * v * u * u * BZ[2][i] + u * u * u * BZ[3][i]; };
const bezD = (u, i) => { const v = 1 - u; return 3 * v * v * (BZ[1][i] - BZ[0][i]) + 6 * v * u * (BZ[2][i] - BZ[1][i]) + 3 * u * u * (BZ[3][i] - BZ[2][i]); };
const outPath = roundedPath([[-1, 0.6], [-1, ZR + 1.75], [120, ZR + 1.75]], 6);
const T_GO = S('right7').start - 0.4;
function heroPose(t) {
  if (!isRight(t)) {
    if (t < tLift) { const sh = t > T_BOOM ? 0.025 * (1 + 2 * ramp(t, t3, t1 + 0.3)) : 0; const hov = 0.18 * ramp(t, t1, tLift);
      return { ...P0, y: hov + sh * Math.abs(Math.sin(t * 41)), pitch: sh * Math.sin(t * 37) + 0.06 * ramp(t, t1, tLift), roll: sh * Math.sin(t * 29 + 1) }; }
    if (t < T_A1) { const u = clamp((t - tLift) / (T_A1 - tLift)); return { x: -1, y: 0.18 * (1 - u), z: lerp(0.6, -8, u * u), h: 0, pitch: 0.06, roll: 0 }; }
    if (t < T_TENT) { const u = clamp((t - T_A1) / (T_TENT - T_A1)); const dz = bezD(u, 0), dy = bezD(u, 1); const pt = Math.atan2(dy, -dz);
      return { x: lerp(-1, TX, ease(u)), y: bez(u, 1), z: bez(u, 0), h: 0, pitch: lerp(0.06, pt, ramp(t, T_A1, T_A1 + 0.3)), roll: 0.25 * Math.sin(Math.PI * u) }; }
    // inside the tent: fall, flip upright, land, bounce
    const u = clamp((t - T_TENT) / (T_LAND - 0.25 - T_TENT)), w = clamp((t - T_LAND + 0.25) / 0.25);
    const pend = Math.atan2(bezD(1, 1), -bezD(1, 0));
    let y = lerp(17, 1.2, easeIn(u)) * (1 - w) + 0 * w, pitch = lerp(pend, -1.3, u) * (1 - ease(w));
    if (t > T_LAND) { const b = t - T_LAND; y = 0.7 * Math.abs(Math.sin(b * 7)) * Math.exp(-b * 3); }
    return { x: TX, y, z: TZ, h: lerp(0, -2.35, ease(clamp((t - T_TENT) / (T_LAND - T_TENT)))), pitch, roll: 0 };
  }
  if (t < T_GO) return { ...P0 };
  const dt = t - T_GO, s = dt < 2 ? 1.5 * dt * dt : 6 + 6 * (dt - 2); const p = pathAt(outPath, s); return { x: p.x, y: 0, z: p.z, h: p.h, pitch: 0, roll: 0 };
}
const heroC = t => { const p = heroPose(t); return V3(p.x, (p.y || 0) + 0.8, p.z); };

// ---------------- camera ----------------
const Ac = (p, l) => () => [V3(...p), V3(...l)];
const Hf = (off, look) => t => { const p = heroPose(t); return [V3(p.x + off[0], (p.y || 0) + off[1], p.z + off[2]), V3(p.x + look[0], (p.y || 0) + look[1], p.z + look[2])]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const camKeys = [
  [0.0, Ac([-2.0, 4.0, 10.5], [-2.0, 0.9, 0.5])],
  [tGrab - 0.2, Ac([-2.8, 3.0, 7.2], [-1.9, 0.9, 1.2])],
  [tBut - 0.25, Ac([-2.9, 2.9, 6.8], [-1.9, 0.9, 1.2])],
  ...cut(tBut - 0.2, Ac([-1.6, 2.2, -3.6], [-4.3, 1.5, 0.3])),
  [tCircus, Ac([-2.4, 2.0, -2.6], [-4.3, 1.6, 0.25])],
  [tHicW - 0.1, Ac([-2.4, 2.0, -2.6], [-4.3, 1.6, 0.25])],
  ...cut(tHicW - 0.05, Ac([1.8, 3.8, -8.0], [-3.0, 1.4, 0.4])),
  [S('hook2').end + 0.6, Ac([2.2, 4.0, -8.6], [-3.0, 1.4, 0.4])],
  // wrong
  ...cut(S('wrong1').start - 0.25, Ac([0.8, 3.2, -7.0], [-2.6, 1.3, 0.5])),
  [tBoo - 0.1, Ac([0.3, 3.0, -6.2], [-2.6, 1.3, 0.5])],
  ...cut(tBig - 0.25, Ac([-9.0, 3.4, 7.4], [-3.9, 1.6, 0.9])),
  [tTank - 0.2, Ac([-8.6, 3.3, 7.0], [-3.7, 1.5, 1.0])],
  ...cut(tTank, Ac([-6.5, 2.0, 6.5], [-1.8, 1.0, 1.4])),
  [t3 - 0.1, Ac([-6.2, 1.9, 6.2], [-1.6, 1.0, 1.2])],
  ...cut(t3 - 0.05, Ac([-4.0, 1.3, 8.8], [-0.9, 0.9, 0.8])),
  [tLift - 0.15, Ac([-4.4, 1.3, 9.4], [-0.9, 0.9, 0.6])],
  ...cut(tLift - 0.1, t => { const p = heroPose(t); return [V3(p.x - 9, p.y * 0.6 + 1.8, p.z + 16), heroC(t)]; }),
  [tOver - 0.2, t => { const p = heroPose(t); return [V3(p.x - 9, p.y * 0.6 + 1.8, p.z + 16), heroC(t)]; }],
  ...cut(tOver - 0.15, t => { const p = heroPose(t); return [V3(p.x + 30, p.y + 5, p.z + 16), V3(p.x, p.y - 4, p.z - 8)]; }),
  [tInto - 0.15, t => { const p = heroPose(t); return [V3(p.x + 30, p.y + 5, p.z + 16), V3(p.x, p.y - 4, p.z - 8)]; }],
  ...cut(tInto - 0.1, Ac([TX + 34, 8, TZ + 40], [TX, 11, TZ])),
  [T_LAND - 0.15, Ac([TX + 33, 8, TZ + 38], [TX, 11, TZ])],
  ...cut(T_LAND - 0.1, Ac([TX + 8.4, 2.7, TZ + 8.4], [TX, 1.6, TZ])),
  [tRew0 + 0.45, Ac([TX + 7.6, 2.6, TZ + 7.6], [TX, 1.6, TZ])],
  // right
  [tRew0 + 0.55, Ac([-2.0, 4.0, 10.5], [-2.0, 0.9, 0.5])],
  [tClose - 0.3, Ac([-2.0, 4.0, 10.5], [-2.0, 0.9, 0.5])],
  ...cut(tClose - 0.25, Ac([-5.6, 2.4, 6.6], [-1.9, 0.9, 1.5])),
  [tGlass - 0.3, Ac([-5.4, 2.3, 6.2], [-1.9, 0.9, 1.5])],
  ...cut(tGlass - 0.25, Ac([1.0, 3.4, -8.0], [-2.8, 1.6, 0.3])),
  [tHand - 0.3, Ac([1.2, 3.5, -8.4], [-2.8, 1.7, 0.3])],
  ...cut(tHand - 0.25, Ac([2.2, 4.0, -9.5], [-3.0, 2.8, 0.2])),
  [tUpside - 0.3, Ac([2.0, 4.0, -9.2], [-3.0, 2.8, 0.2])],
  ...cut(tUpside - 0.25, Ac([0.2, 3.6, -6.0], [-3.0, 3.0, 0.15])),
  [tGone - 0.2, Ac([0.4, 3.6, -6.2], [-3.0, 3.0, 0.15])],
  ...cut(tGone - 0.15, Ac([2.0, 3.6, -9.0], [-3.2, 2.0, 0.4])),
  [tThanks - 0.2, Ac([2.0, 3.6, -9.0], [-3.2, 2.0, 0.4])],
  ...cut(tThanks - 0.15, Ac([3.6, 2.9, -8.8], [-2.4, 3.1, 0.6])),
  [tToast - 0.3, Ac([3.4, 2.9, -8.4], [-2.4, 3.1, 0.6])],
  ...cut(tToast - 0.25, Ac([3.6, 4.2, 7.5], [-1.8, 2.2, 0.6])),
  [S('right6').start - 0.2, Ac([3.4, 4.1, 7.2], [-1.8, 2.2, 0.6])],
  ...cut(S('right6').start - 0.15, Ac([2.4, 3.8, 5.6], [-0.5, 2.8, 1.2])),
  [tToasted + 0.3, Ac([2.5, 3.9, 5.9], [-0.5, 2.8, 1.2])],
  ...cut(S('right7').start - 0.2, Ac([-12, 9, 12], [0, 0.5, -8])),
  [TOTAL - 0.3, Ac([-14, 14, 16], [3, 0, -12])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const A = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: A[0].lerp(B[0], u), l: A[1].lerp(B[1], u) };
}

// ---------------- update ----------------
let screen = {};
function update(t) {
  const right = isRight(t);
  FP.forEach(s => s.visible = false); SP.forEach(s => s.visible = false); fi = 0; si = 0;
  const hp = heroPose(t); placeCar(hero, hp); hero.updateMatrixWorld(true);
  const P = fbPose(t); applyFb(P);
  // flap
  const open = right ? 1 - ramp(t, tClick - 0.25, tClick) : ramp(t, tOpen, tOpen + 0.4);
  flapPiv.rotation.y = -1.9 * open; flapHole.visible = open > 0.05;
  // fins + nose cone (rocket)
  const fk = !right ? back(clamp((t - tRocket + 0.1) / 0.35)) : 0; fins.visible = fk > 0.01; fins.scale.setScalar(Math.max(0.001, fk));
  // driver arm
  arm.visible = (!right && t > tHelp - 0.2 && t < tBig) || (right && t > tGlass - 0.3 && t < tGlass + 0.8);
  if (arm.visible) arm.rotation.set(-0.3, 0, 0.9 + 0.3 * Math.sin(t * 13));
  // nozzles
  const flapW = hero.localToWorld(V3(-1.0, 0.86, 1.25));
  let nA = HOME_A.clone(), qA = 0;
  if (!right) { const g = ease(clamp((t - tGrab) / 0.8)); nA = HOME_A.clone().lerp(flapW, g); nA.y += 0.4 * Math.sin(Math.PI * g); qA = g;
    if (t > T_BOOM) { const u = clamp((t - T_BOOM) / 0.9); nA = flapW.clone().lerp(V3(-2.0, 0.3, 5.0), u); nA.y += 3.0 * Math.sin(Math.PI * u) * (1 - u * 0.4); qA = 1 + 8 * u; } }
  else { const g = 1 - ease(clamp((t - tClose + 0.25) / 0.6)); nA = HOME_A.clone().lerp(flapW, g); nA.y += 0.4 * Math.sin(Math.PI * g); qA = g; }
  nozA.position.copy(nA); nozA.rotation.set(0, -Math.PI / 2 * clamp(qA) + (qA > 1 ? qA : 0), qA > 1 ? qA * 0.7 : 0);
  // fire-breather's nozzle: at his mouth while drinking, then back into the holster
  const hand = fb.arms[1].userData.hand.getWorldPosition(V3(0, 0, 0));
  const hb = ease(clamp((t - T_HANG) / 0.45)); const nB = hand.clone().lerp(HOME_B, hb); nozB.position.copy(nB); nozB.rotation.set(-1.0 * (1 - hb), P.ry * (1 - hb) + Math.PI / 2 * hb, 0);
  setHose(hoses[0], HOSE_A, nozA.position, 0.4); setHose(hoses[1], HOSE_B, nozB.position, 0.4);
  // glass of water (right): window -> his hand -> upside-down drink
  glass.visible = right && t > tGlass - 0.05 && t < tGone + 0.2;
  if (glass.visible) { const win0 = hero.localToWorld(V3(-1.1, 1.35, -0.35)); const hR = fb.arms[1].userData.hand.getWorldPosition(V3(0, 0, 0)); const u = ease(clamp((t - tGlass + 0.05) / 0.8));
    const p = win0.clone().lerp(hR, u); p.y += 1.2 * Math.sin(Math.PI * u); glass.position.copy(p); const inv = fb.root.rotation.x / Math.PI;
    glass.rotation.set(inv * Math.PI + (t > tUpside ? -0.9 * ramp(t, tUpside, tUpside + 0.4) * (inv > 0.5 ? -1 : 1) : 0), 0, 0);
    glass.userData.water.scale.y = Math.max(0.02, 1 - ramp(t, tUpside + 0.2, WT('right3', 'down') + 0.6)); glass.userData.water.position.y = -0.02 - 0.1 * (1 - glass.userData.water.scale.y); }
  // marshmallow
  marsh.visible = right && t > T_TOAST - 0.6; if (marsh.visible) { marsh.scale.setScalar(Math.max(0.001, back(clamp((t - T_TOAST + 0.6) / 0.3)))); const b = ramp(t, T_TOAST + 0.2, T_TOAST1); marsh.material.color.set('#ffffff').lerp(new THREE.Color('#b8743a'), b); }
  // ---- fire ----
  const mouth = mouthW(), fwd = mouthFwd();
  const hics = right ? hicsR : hicsW;
  hics.forEach((h, k) => { if (t > h && t < h + 0.5) jet(t, h, h + 0.12, mouth, mouth.clone().addScaledVector(fwd, 0.9), { rate: 90, life: 0.4, s0: 0.12, s1: 0.45, spread: 0.25, seed: k * 17, rise: 0.3 }); });
  if (!right) {
    // biggest flame of his life -> into the tank
    jet(t, tBiggest - 0.05, T_BOOM, mouth, flapW, { rate: 110, life: 0.42, s0: 0.25, s1: 0.95, spread: 0.45, seed: 3, rise: 0.25 });
    burst(t, T_BOOM, flapW, { n: 60, r: 2.2, life: 1.0, size: 1.6, seed: 9 });
    // sputtering flames from the tank during the countdown
    if (t > T_BOOM + 0.3 && t < tLift + 0.2) { const k = 0.4 + 0.6 * ramp(t, t3, tLift); jet(t, T_BOOM + 0.3, tLift + 0.2, flapW, flapW.clone().add(V3(-0.9 * k, 0.4, 0.3)), { rate: 50, life: 0.35, s0: 0.15, s1: 0.5 * k + 0.2, spread: 0.3, seed: 21, rise: 0.8 }); }
    // rocket exhaust + smoke trail
    if (t > t1 - 0.15 && t < T_TENT + 0.1) { const rear = hero.localToWorld(V3(0, 0.6, 2.35)), back2 = hero.localToWorld(V3(0, 0.6, 5.2)); const k = t < tLift ? 0.4 : 1;
      jet(t, t1 - 0.15, T_TENT + 0.1, rear, rear.clone().lerp(back2, k), { rate: 120, life: 0.22, s0: 0.5, s1: 1.4 * k, spread: 0.35, seed: 31, rise: 0 });
      for (let k2 = 0; k2 < 60; k2++) { const a = k2 * 0.05 + (t % 0.05); const ta = t - a; if (ta < tLift) break; const p = heroPose(ta); const q = V3(p.x, (p.y || 0) + 0.6, p.z).add(V3(hash(k2) - 0.5, hash(k2 + 3) - 0.5, hash(k2 + 5) - 0.5).multiplyScalar(a * 2)); smoke(q, 1.2 + a * 2.5, 0.55 * (1 - a / 3), '#d6d6d6'); } }
    if (t > T_LAND && t < tRew0 + 0.5) { for (let k = 0; k < 10; k++) { const a = ((t - T_LAND) * 0.6 + k * 0.1) % 1; smoke(V3(TX + (hash(k) - 0.5) * 2, 0.6 + a * 3, TZ + (hash(k + 4) - 0.5) * 2), 1 + a * 1.5, 0.4 * (1 - a)); } }
  } else {
    // tiny puff: a smoke ring
    if (t > tPuff - 0.2 && t < tPuff + 1.3) { const a = clamp((t - tPuff + 0.2) / 1.5); for (let k = 0; k < 14; k++) { const th = k / 14 * 6.283; const c = mouth.clone().addScaledVector(fwd, 0.3 + 0.6 * a); c.y += 0.6 * a; smoke(c.add(V3(Math.cos(th) * (0.08 + 0.25 * a), Math.sin(th) * (0.08 + 0.25 * a), 0)), 0.18 + 0.1 * a, 0.75 * (1 - a), '#bdbdbd'); } }
    // heart of fire
    if (t > T_HEART - 0.1 && t < T_HEART1 + 1.6) {
      const HC = V3(-2.6, 3.65, 0.4); const cr = V3().setFromMatrixColumn(camera.matrixWorld, 0), cu = V3().setFromMatrixColumn(camera.matrixWorld, 1);
      jet(t, T_HEART - 0.1, T_HEART1 - 0.3, mouth, HC.clone().add(cu.clone().multiplyScalar(-0.9)), { rate: 80, life: 0.35, s0: 0.15, s1: 0.5, spread: 0.2, seed: 41, rise: 0 });
      const drawU = ease(clamp((t - T_HEART) / 0.9)), fade = 1 - ramp(t, T_HEART1 + 0.9, T_HEART1 + 1.6), pulse = 1 + 0.08 * Math.sin(t * 9) * ramp(t, T_HEART1 - 0.2, T_HEART1 + 0.2);
      const N = 70; for (let k = 0; k < N * drawU; k++) { const s = k / N * 6.283 - Math.PI; const hx = 16 * Math.pow(Math.sin(s), 3), hy = 13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s);
        const p = HC.clone().addScaledVector(cr, hx * 0.065 * pulse).addScaledVector(cu, hy * 0.065 * pulse + 0.15 * hash(k + Math.floor(t * 20)) * 0.3); fire(p, 0.42 + 0.15 * hash(k * 7 + Math.floor(t * 24)), 0.15 + 0.3 * hash(k + Math.floor(t * 30)), fade); } }
    // toasting the marshmallow
    const m = MARSH_W(); jet(t, T_TOAST, T_TOAST1, mouth, m, { rate: 70, life: 0.3, s0: 0.08, s1: 0.32, spread: 0.08, seed: 51, rise: 0 });
    if (t > T_TOAST + 0.3 && t < T_TOAST1 + 1.2) for (let k = 0; k < 6; k++) { const a = ((t - T_TOAST) * 0.8 + k / 6) % 1; smoke(m.clone().add(V3((hash(k) - 0.5) * 0.2, 0.15 + a * 0.8, 0)), 0.15 + a * 0.3, 0.5 * (1 - a), '#eeeeee'); }
  }
  // crowd jumps in the tent
  { const { cmesh, crowd, o } = window._crowd; if (!right && t > T_LAND - 0.2 && t < tRew0 + 0.6) { crowd.forEach((p, i) => { o.position.set(p[0], p[1] + 0.3 * Math.max(0, Math.sin(t * 10 + i)), p[2]); o.updateMatrix(); cmesh.setMatrixAt(i, o.matrix); }); cmesh.instanceMatrix.needsUpdate = true; } }
  spot.visible = !right && t > T_LAND - 0.3;
  const c = cam(t); camera.near = clamp(c.p.y * 0.3, 0.2, 1.0); camera.updateProjectionMatrix();
  const shake = !right ? (t > T_BOOM && t < T_BOOM + 0.4 ? 0.08 : t > t3 && t < tLift + 0.6 ? 0.03 + 0.05 * ramp(t, t3, tLift) : t > T_LAND && t < T_LAND + 0.3 ? 0.08 : 0) : 0;
  applyCam(c, t, shake);
  camera.updateMatrixWorld(true);
  hero.updateMatrixWorld(true); fb.g.updateMatrixWorld(true);
  screen = { head: project(fb.head.localToWorld(V3(0, 0.3, 0))), win: project(hero.localToWorld(V3(-1.2, 1.6, -0.35))), flap: project(flapW), hero: project(heroC(t)), marsh: project(MARSH_W()) };
}

// ---------------- HUD ----------------
function stepCard(t, n, label, a, b) { if (t < a || t > b) return; const f = win(t, a, b, 0.2), k = back((t - a) / 0.35); ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1560 + (n - 1) * 110); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; rr(-330, -44, 660, 88, 22); ctx.fill(); ctx.fillStyle = '#1565c0'; ctx.beginPath(); ctx.arc(-282, 0, 30, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '900 38px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), -282, 2); ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'left'; ctx.font = '900 42px Inter'; ctx.fillText(label, -230, 2); ctx.restore(); }
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(globalT, a, b, 0.2), back((globalT - a) / 0.35), icon);
let globalT = 0;
function hicText(t, list) { const h = screen.head; if (!h || !h.ok) return; list.forEach((x, k) => floatText('hic!', clamp(h.x + (k % 2 ? 110 : -110), 160, W - 160), clamp(h.y - 60, 300, 1100), t, x, x + 0.7, 66, '#ffcc80', k % 2 ? 0.12 : -0.12)); }
function hud(t) {
  globalT = t; const right = isRight(t);
  if (!right) {
    P_('DRIVING TIP: REFUELLING', '#1565c0', 0.25, tBut - 0.2);
    stepCard(t, 1, 'ENGINE OFF', tEngine - 0.1, tBut - 0.2); stepCard(t, 2, 'OPEN THE FLAP', tOpen - 0.1, tBut - 0.2); stepCard(t, 3, 'GRAB THE NOZZLE', tGrab - 0.1, tBut - 0.2);
    P_('PUMP 2: FIRE-BREATHER', '#d32f2f', tCircus - 0.2, tHicW - 0.1, 46, iconWarn);
    P_('STATUS: HICCUPS (FLAMING)', '#e65100', tHicW, S('hook2').end + 0.5, 44, iconWarn);
    if (t < tBoo + 0.5) hicText(t, hicsW);
    P_('CURE HIC-UPS: SCARE HIM', RED, tHelp - 0.2, tBig - 0.2, 44, iconX);
    if (screen.win && screen.win.ok) floatText('BOO!', clamp(screen.win.x, 200, W - 200), clamp(screen.win.y - 80, 300, 1100), t, tBoo, tBoo + 1.0, 150, '#ffffff', -0.08);
    P_('BIGGEST HICCUP EVER', '#e65100', tBiggest - 0.2, tTank - 0.1, 48);
    floatText('FWOOSH!', W / 2, 720, t, T_BOOM, T_BOOM + 1.0, 150, '#ffcc80', -0.06);
    P_('TANK: ON FIRE', RED, T_BOOM + 0.2, t3 - 0.1, 48, iconWarn);
    floatText('3', W / 2, 760, t, t3, t3 + 0.6, 260, '#fff'); floatText('2', W / 2, 760, t, t2, t2 + 0.6, 260, '#fff'); floatText('1', W / 2, 760, t, t1, t1 + 0.6, 260, '#fff');
    floatText('LIFT-OFF!', W / 2, 760, t, tLift, tLift + 1.0, 140, YEL, -0.05);
    P_('NEW VEHICLE CLASS: ROCKET', '#4a148c', tRocket - 0.2, tOver - 0.15, 44);
    P_('ALTITUDE: WAY TOO HIGH', '#1565c0', tOver - 0.1, tInto - 0.1, 44);
    floatText('TA-DA!', W / 2, 700, t, tTa, tTa + 1.6, 170, YEL, -0.06);
    P_('NEW ACT: HUMAN CANNONBALL', '#4a148c', tCannon - 0.3, tRew0, 44);
  } else {
    hicText(t, hicsR);
    P_('TANK: CLOSED', GREEN, tClick - 0.3, tGlass - 0.3, 50, iconCheck);
    if (screen.flap && screen.flap.ok) floatText('CLICK', clamp(screen.flap.x, 200, W - 200), clamp(screen.flap.y - 90, 300, 1100), t, tClick, tClick + 0.8, 90, '#ffffff', -0.08);
    P_('1 GLASS OF WATER', '#0277bd', tGlass - 0.2, tCure - 0.1, 48);
    P_('CIRCUS CURE: ONE-ARM HANDSTAND', '#4a148c', tCure, tUpside - 0.1, 40);
    P_('DRINK IT UPSIDE DOWN', '#0277bd', tUpside - 0.1, tHicR - 0.1, 46);
    if (screen.head && screen.head.ok) floatText('hic.', clamp(screen.head.x + 120, 160, W - 160), clamp(screen.head.y - 40, 300, 1100), t, tHicR, tHicR + 0.9, 60, '#ffcc80', 0.1);
    P_('HICCUPS: GONE', GREEN, tGone - 0.2, tThanks - 0.1, 50, iconCheck);
    P_('THANK YOU', '#d81b60', tHeart - 0.1, tToast - 0.2, 52, iconHeart);
    P_('MARSHMALLOW: TOASTING', '#e65100', tToast, S('right6').start - 0.1, 44);
    P_('TANK: FULL · SNACK: TOASTED', GREEN, tFull - 0.1, S('right7').start, 42, iconCheck);
  }
}
window.dbg = { heroPose, fbPose, cam };
start(update, hud);
