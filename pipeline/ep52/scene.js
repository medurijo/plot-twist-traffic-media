// Episode 47: Petrol station – the pump hose is an elephant's trunk
// hook (old style): fuel light on, pull up to pump 3 -> grab the hose: it's warm, it just sniffed you -> it's an elephant (peeks over the billboard)
// wrong: grab the trunk and squeeze hard -> that's her nose, a squeezed nose sneezes -> ah.. ah.. ACHOO: car parked on the canopy roof, next to the prices
// right: read the pump sign: payment peanuts only -> one peanut on the fuel cap, wait -> she sniffs it, finds the tank, fills you up, happy trumpet ->
//        free wash, trunk shower included -> full tank, clean car, a rainbow, all for one peanut
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, iconArrow, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tFuel = WT('hook1', 'Fuel'), tYou1 = WT('hook1', 'You'), tPump1 = WT('hook1', 'pump'), tThree = WT('hook1', 'three');
const tGrabH = WT('hook2', 'grab'), tHose = WT('hook2', 'hose'), tWarm = WT('hook2', 'warm'), tAndH = WT('hook2', 'And'), tSniffed = WT('hook2', 'sniffed'), tIts2 = WT('hook2', 'it', 2), tEleph = WT('hook2', 'elephant'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tGrab = WT('wrong1', 'grab'), tTrunk = WT('wrong1', 'trunk'), tSqueeze = WT('wrong1', 'squeeze'), tHard = WT('wrong1', 'hard');
const tBig = WT('wrong2', 'Big'), tThats = WT('wrong2', 'That'), tNose = WT('wrong2', 'nose'), tAnd2 = WT('wrong2', 'And'), tSqueeze2 = WT('wrong2', 'squeeze'), tSneezes = WT('wrong2', 'sneezes');
const tAh1 = WT('wrong3', 'Ah', 0), tAh2 = WT('wrong3', 'Ah', 1), tAchoo = WT('wrong3', 'Achoo'), tYour3 = WT('wrong3', 'Your'), tRoof = WT('wrong3', 'roof'), tNext3 = WT('wrong3', 'Next'), tPrices = WT('wrong3', 'prices');
const tRead = WT('right2', 'Read'), tSign = WT('right2', 'sign'), tPayment = WT('right2', 'Payment'), tPeanuts = WT('right2', 'peanuts'), tOnly = WT('right2', 'only');
const tPut = WT('right3', 'put'), tPeanut3 = WT('right3', 'peanut'), tFuel3 = WT('right3', 'fuel'), tCap = WT('right3', 'cap'), tAnd3 = WT('right3', 'And'), tWait = WT('right3', 'wait');
const tSniffs = WT('right4', 'sniffs'), tFinds = WT('right4', 'finds'), tTank = WT('right4', 'tank'), tFills = WT('right4', 'fills'), tHappy = WT('right4', 'happy'), tTrumpet = WT('right4', 'trumpet');
const tThen5 = WT('right5', 'Then'), tGives = WT('right5', 'gives'), tWash = WT('right5', 'wash'), tTrunk5 = WT('right5', 'Trunk'), tShower = WT('right5', 'shower'), tIncl = WT('right5', 'included');
const tFull = WT('right6', 'Full'), tClean = WT('right6', 'Clean'), tAnd6 = WT('right6', 'And'), tRainbow = WT('right6', 'rainbow'), tAll = WT('right6', 'All'), tPeanut6 = WT('right6', 'peanut');
const isRight = t => t >= tRew0 + 0.5;

function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
// pose keys: [t, poseName] -> 3 control points (P1,P2,P3), smooth between
function poseTrack(keys, P) { const ch = []; for (let j = 0; j < 9; j++) ch.push(mono(keys.map(k => [k[0], P[k[1]][Math.floor(j / 3)][j % 3]]))); return t => [0, 1, 2].map(i => V3(ch[i * 3](t), ch[i * 3 + 1](t), ch[i * 3 + 2](t))); }
function monoV(keys) { const f = [0, 1, 2].map(i => mono(keys.map(k => [k[0], k[1][i]]))); return t => V3(f[0](t), f[1](t), f[2](t)); }

// ---------------- world: petrol station ----------------
const CAN_Y = 6.0, CAN_T = 0.8, ROOF_Y = CAN_Y + CAN_T;
makeLandscape({ avoid: (x, z) => (x > -40 && x < 40 && z > -30 && z < 30), fieldAvoid: (x, z, w, d) => (x + w / 2 > -46 && x - w / 2 < 46 && z + d / 2 > -36 && z - d / 2 < 36), near: [0, -80, 220, 80], trees: 1500, seed: 4701 });
plane(-36, 36, -24, 24, asphaltMat, 0.05, 7);
{ const g = new THREE.PlaneGeometry(3, 0.16); g.rotateX(-Math.PI / 2); const dl = []; for (let x = -34; x < 36; x += 7) dl.push([x, 0.07, 14]); instanced(g, markMat, dl, false);
  const bay = new THREE.PlaneGeometry(0.14, 5.2); bay.rotateX(-Math.PI / 2); instanced(bay, markMat, [[-4.5, 0.07, 0], [4.5, 0.07, 0]], false); }
// canopy
const canopy = new THREE.Group(); scene.add(canopy);
{ const white = STD('#f5f5f5', { roughness: 0.6 }), red = STD('#e53935', { roughness: 0.5 });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(20, CAN_T, 11), white); slab.position.set(-1, CAN_Y + CAN_T / 2, -1.2); slab.castShadow = slab.receiveShadow = true; canopy.add(slab);
  const band = new THREE.Mesh(new THREE.BoxGeometry(20.1, 0.42, 11.1), red); band.position.set(-1, CAN_Y + 0.42, -1.2); canopy.add(band);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(19.6, 10.6), new THREE.MeshStandardMaterial({ color: '#fff9e6', emissive: '#fff4d0', emissiveIntensity: 0.45 })); under.rotation.x = Math.PI / 2; under.position.set(-1, CAN_Y - 0.01, -1.2); canopy.add(under);
  for (const x of [-10.4, 8.4]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, CAN_Y, 0.6), white); p.position.set(x, CAN_Y / 2, -5.6); p.castShadow = p.receiveShadow = true; canopy.add(p); }
  // fascia lettering
  const fT = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#e53935'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('JUMBO FUEL', w / 2, h / 2 + 4); });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.1), STD('#ffffff', { map: fT, roughness: 0.5 })); fl.position.set(-1, CAN_Y + 0.42, 4.36); canopy.add(fl); }
// price board on the roof
const priceT = canvasTex(512, 640, (c, w, h) => { c.fillStyle = '#1b1b1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#e53935'; c.fillRect(0, 0, w, 110); c.fillStyle = '#fff'; c.font = '900 72px Inter'; c.textAlign = 'center'; c.fillText('PRICES', w / 2, 82);
  const rows = [['SUPER', '1.89'], ['DIESEL', '1.79'], ['ROOF', 'FREE']]; rows.forEach(([a, b], i) => { const y = 210 + i * 160; c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = '900 58px Inter'; c.fillText(a, 30, y);
    c.textAlign = 'right'; c.fillStyle = i === 2 ? '#39ff4a' : '#ffd54f'; c.font = '900 84px Inter'; c.fillText(b, w - 28, y + 6); c.fillStyle = '#444'; c.fillRect(30, y + 40, w - 60, 4); }); });
const priceB = new THREE.Group(); priceB.position.set(-6.8, ROOF_Y, 1.6); scene.add(priceB);
{ const b = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.75, 0.3), STD('#e53935')); b.position.y = 2.6; b.castShadow = true; priceB.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.4), new THREE.MeshStandardMaterial({ map: priceT, roughness: 0.5, emissive: '#ffffff', emissiveMap: priceT, emissiveIntensity: 0.35 })); f.position.set(0, 2.6, 0.16); priceB.add(f);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), STD('#555')); l.position.set(s * 1.0, 0.4, 0); priceB.add(l); } }
// shop behind
{ const shop = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 6), STD('#eceff1', { roughness: 0.8 })); shop.position.set(-4, 2.25, -14); shop.castShadow = shop.receiveShadow = true; scene.add(shop);
  const sT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 80px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SHOP', w / 2, h / 2 + 4); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), STD('#fff', { map: sT })); sp.position.set(-4, 3.7, -10.99); scene.add(sp);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.4), STD('#9ec9e8', { roughness: 0.1, metalness: 0.4 })); gl.position.set(-4, 1.5, -10.98); scene.add(gl); }
// pump island + pump 3
const PUMP = V3(1.6, 0, -2.55);
{ const isl = new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 1.4), concrete()); isl.position.set(0.5, 0.125, -2.6); isl.receiveShadow = isl.castShadow = true; scene.add(isl);
  function concrete() { return STD('#cfc9bd', { roughness: 0.9 }); }
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.6), STD('#fafafa', { roughness: 0.45 })); body.position.set(PUMP.x, 1.4, PUMP.z); body.castShadow = body.receiveShadow = true; scene.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 0.7), STD('#e53935')); top.position.set(PUMP.x, 2.7, PUMP.z); top.castShadow = true; scene.add(top);
  const n3 = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#e53935'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 84px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('3', w / 2, h / 2 + 4); });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), STD('#fff', { map: n3 })); nm.position.set(PUMP.x, 2.7, PUMP.z + 0.36); scene.add(nm);
  // sign: payment peanuts only
  const sg = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#fff8e1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e65100'; c.lineWidth = 18; c.strokeRect(9, 9, w - 18, h - 18);
    c.fillStyle = '#333'; c.font = '900 56px Inter'; c.textAlign = 'center'; c.fillText('PAYMENT:', w / 2, 100);
    // peanut drawing
    c.save(); c.translate(w / 2, 245); c.rotate(-0.4); c.fillStyle = '#d7a96b'; c.strokeStyle = '#8d6e3f'; c.lineWidth = 8; c.beginPath(); c.ellipse(-55, 0, 70, 52, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(55, 0, 66, 50, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#d7a96b'; c.fillRect(-30, -36, 60, 72); c.restore();
    c.fillStyle = '#e65100'; c.font = '900 76px Inter'; c.fillText('PEANUTS', w / 2, 400); c.fillStyle = '#333'; c.font = '900 52px Inter'; c.fillText('ONLY', w / 2, 465); });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), STD('#fff', { map: sg, roughness: 0.5 })); sm.position.set(PUMP.x, 1.75, PUMP.z + 0.31); scene.add(sm);
  // display
  const dT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#102027'; c.fillRect(0, 0, w, h); c.fillStyle = '#39ff4a'; c.font = '900 50px Inter'; c.textAlign = 'center'; c.fillText('00.00', w / 2, 76); });
  const dm = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.3), new THREE.MeshBasicMaterial({ map: dT })); dm.position.set(PUMP.x, 2.35, PUMP.z + 0.31); scene.add(dm);
  // holster
  const ho = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.2), STD('#424242')); ho.position.set(PUMP.x + 0.35, 1.0, PUMP.z + 0.38); scene.add(ho);
  // other pumps
  for (const x of [-3.2]) { const b2 = body.clone(); b2.position.x = x; scene.add(b2); const t2 = top.clone(); t2.position.x = x; scene.add(t2);
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 20, Math.PI * 1.3), STD('#212121')); hose.position.set(x + 0.4, 1.5, PUMP.z + 0.35); hose.rotation.z = -1.8; scene.add(hose); } }
// billboard behind pump 3 (hides the elephant until the reveal)
{ const bT = canvasTex(1024, 768, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#29b6f6'); g.addColorStop(1, '#0277bd'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.font = '900 140px Inter'; c.textAlign = 'center'; c.fillText('CAR WASH', w / 2, 250); c.fillStyle = '#ffd54f'; c.font = '900 92px Inter'; c.fillText('SPARKLING CLEAN!', w / 2, 400);
    for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc((i * 137) % w, 470 + (i * 71) % 260, 18 + (i % 4) * 10, 0, 7); c.fill(); } });
  const bb = new THREE.Mesh(new THREE.BoxGeometry(5.4, 4.6, 0.3), STD('#ffffff', { roughness: 0.6 })); bb.position.set(1.6, 2.3, -3.55); bb.castShadow = bb.receiveShadow = true; scene.add(bb);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 3.4), STD('#fff', { map: bT, roughness: 0.55 })); face.position.set(1.6, 2.55, -3.39); scene.add(face); }

// ---------------- elephant (head, ears, trunk; body hidden behind the billboard) ----------------
const GREY = STD('#9ea7ad', { roughness: 0.75 }), PINK = STD('#f4b6c2', { roughness: 0.7 });
const wrT = canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(70,80,90,0.35)'; c.lineWidth = 3; for (let y = 6; y < h; y += 14) { c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(w / 2, y + 4, w, y); c.stroke(); } }, true);
const TRUNK_MAT = STD('#9ea7ad', { roughness: 0.75, map: wrT });
const eh = new THREE.Group(); scene.add(eh);   // head, local forward +z
const EL = {};
{ const add = (geo, mat, x, y, z, p = eh) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  add(new THREE.SphereGeometry(1.15, 32, 24), GREY, 0, 0, 0).scale.set(1.05, 1.0, 0.95);
  add(new THREE.SphereGeometry(0.75, 24, 16), GREY, 0, -0.35, 0.65).scale.set(1.0, 0.9, 0.8);  // muzzle
  // ears
  EL.ears = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 0.95, 0.15, -0.2); eh.add(piv);
    const e = add(new THREE.SphereGeometry(1, 24, 16), GREY, s * 0.85, -0.1, 0, piv); e.scale.set(1.0, 1.15, 0.14);
    const ei = add(new THREE.SphereGeometry(1, 24, 16), PINK, s * 0.85, -0.1, 0.06, piv); ei.scale.set(0.78, 0.92, 0.1); return { piv, s }; });
  // eyes + lashes
  EL.eyes = [-1, 1].map(s => { const w = add(new THREE.SphereGeometry(0.24, 16, 12), STD('#fff', { roughness: 0.25 }), s * 0.45, 0.32, 0.92);
    const p = add(new THREE.SphereGeometry(0.12, 12, 8), STD('#1a1a1a', { roughness: 0.2 }), s * 0.47, 0.32, 1.12);
    const hl = add(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), s * 0.5, 0.38, 1.21);
    const lid = add(new THREE.SphereGeometry(0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), GREY, s * 0.45, 0.32, 0.92); lid.rotation.x = -1.6;
    const lashes = []; for (let k = 0; k < 3; k++) { const l = add(new THREE.BoxGeometry(0.04, 0.16, 0.03), STD('#222'), s * (0.32 + k * 0.12), 0.58, 0.98); l.rotation.z = s * (-0.4 + k * 0.4); lashes.push(l); }
    return { w, p, hl, lid, s, c0: w.position.clone(), p0: p.position.clone(), h0: hl.position.clone() }; });
  // cheeks
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.16, 10, 8), STD('#f48fb1', { roughness: 0.8 }), s * 0.62, -0.15, 0.85).scale.set(1, 0.6, 0.4);
  // smile
  const sm = add(new THREE.TorusGeometry(0.25, 0.035, 6, 16, Math.PI), STD('#4a2b2b'), 0, -0.72, 0.98); sm.rotation.z = Math.PI; EL.smile = sm;
  // cap
  const cap = new THREE.Group(); cap.position.set(0, 0.95, 0.1); cap.rotation.x = -0.15; eh.add(cap); EL.cap = cap;
  add(new THREE.SphereGeometry(0.62, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), STD('#e53935', { roughness: 0.55 }), 0, 0, 0, cap);
  const vis = add(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 20, 1, false, -Math.PI / 2, Math.PI), STD('#b71c1c'), 0, 0.02, 0.45, cap); vis.scale.z = 0.9;
  const bT = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(32, 32, 30, 0, 7); c.fill(); c.fillStyle = '#e53935'; c.font = '900 40px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('3', 32, 34); });
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), STD('#fff', { map: bT })); badge.position.set(0, 0.32, 0.52); badge.rotation.x = -0.6; cap.add(badge); }
// trunk tube (rebuilt each frame from a cubic bezier)
const TN = 60, TM = 16;
const trunkGeo = new THREE.BufferGeometry();
{ const pos = new Float32Array((TN + 1) * (TM + 1) * 3), uv = new Float32Array((TN + 1) * (TM + 1) * 2), idx = [];
  for (let i = 0; i <= TN; i++) for (let j = 0; j <= TM; j++) { const k = i * (TM + 1) + j; uv[k * 2] = j / TM; uv[k * 2 + 1] = i / TN * 6; if (i < TN && j < TM) { const a = k, b = k + TM + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); } }
  trunkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); trunkGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); trunkGeo.setIndex(idx); }
const trunk = new THREE.Mesh(trunkGeo, TRUNK_MAT); trunk.castShadow = true; trunk.receiveShadow = true; trunk.frustumCulled = false; scene.add(trunk);
const tipCap = new THREE.Mesh(new THREE.CircleGeometry(1, 20), STD('#6d757a', { roughness: 0.8, side: THREE.DoubleSide })); scene.add(tipCap);
const nostrils = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 12), new THREE.MeshBasicMaterial({ color: '#2a2a2a', side: THREE.DoubleSide })); scene.add(m); return m; });
const bez = (P, u) => { const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3; return V3(0, 0, 0).addScaledVector(P[0], a).addScaledVector(P[1], b).addScaledVector(P[2], c).addScaledVector(P[3], d); };
const bezT = (P, u) => { const a = -3 * (1 - u) ** 2, b = 3 * (1 - u) ** 2 - 6 * u * (1 - u), c = 6 * u * (1 - u) - 3 * u * u, d = 3 * u * u; return V3(0, 0, 0).addScaledVector(P[0], a).addScaledVector(P[1], b).addScaledVector(P[2], c).addScaledVector(P[3], d).normalize(); };
let TIP = { p: V3(), d: V3(0, -1, 0), P: null };
function buildTrunk(P, radFn) {
  const pos = trunkGeo.attributes.position; let nPrev = null;
  for (let i = 0; i <= TN; i++) { const u = i / TN; const c = bez(P, u), tg = bezT(P, u);
    let n = nPrev ? nPrev.clone().sub(tg.clone().multiplyScalar(nPrev.dot(tg))).normalize() : V3(1, 0, 0).sub(tg.clone().multiplyScalar(tg.x)).normalize();
    if (!isFinite(n.x) || n.lengthSq() < 0.1) n = V3(0, 1, 0); nPrev = n; const b = tg.clone().cross(n).normalize();
    const r = radFn(u);
    for (let j = 0; j <= TM; j++) { const a = j / TM * Math.PI * 2; const k = i * (TM + 1) + j; const p = c.clone().addScaledVector(n, Math.cos(a) * r).addScaledVector(b, Math.sin(a) * r); pos.setXYZ(k, p.x, p.y, p.z); }
    if (i === TN) { TIP = { p: c, d: tg, n, b, r, P }; } }
  pos.needsUpdate = true; trunkGeo.computeVertexNormals(); trunkGeo.computeBoundingSphere();
  tipCap.position.copy(TIP.p); tipCap.quaternion.setFromUnitVectors(V3(0, 0, 1), TIP.d); tipCap.scale.setScalar(TIP.r * 0.98);
  nostrils.forEach((m, k) => { m.position.copy(TIP.p).addScaledVector(TIP.d, 0.005).addScaledVector(TIP.n, (k ? 1 : -1) * TIP.r * 0.38); m.quaternion.copy(tipCap.quaternion); m.scale.set(TIP.r * 0.2, TIP.r * 0.28, 1); });
}

// ---------------- hero car + flap + peanut ----------------
const hero = makeCar('#ff7043');
hero.userData.bodyG.children[1].material.color.set('#4a6c8c');
const flapPiv = new THREE.Group(); flapPiv.position.set(0.95, 0.98, 1.38); hero.userData.bodyG.add(flapPiv);
const flap = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.24), hero.userData.body); flap.position.set(0.02, 0, -0.12); flapPiv.add(flap);
const fillHole = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), STD('#222')); fillHole.rotation.y = Math.PI / 2; fillHole.position.set(0.955, 0.98, 1.26); hero.userData.bodyG.add(fillHole);
const peanut = new THREE.Group(); scene.add(peanut);
{ const pm = STD('#d7a96b', { roughness: 0.85 }); const a = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), pm); a.scale.set(1, 0.85, 0.85); a.position.x = -0.08; peanut.add(a); const b = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 10), pm); b.scale.set(1, 0.85, 0.85); b.position.x = 0.08; peanut.add(b);
  const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12), pm); w.rotation.z = Math.PI / 2; peanut.add(w); peanut.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// cartoon glove ("you")
const glove = new THREE.Group(); scene.add(glove);
const GL = {};
{ const wm = STD('#ffffff', { roughness: 0.55 }); const palm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), wm); palm.scale.set(1.0, 1.15, 0.6); glove.add(palm);
  GL.f = [-1.5, -0.5, 0.5].map((k, i) => { const piv = new THREE.Group(); piv.position.set(k * 0.075, 0.16, 0.02); glove.add(piv); const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 4, 8), wm); f.position.y = 0.1; piv.add(f); return piv; });
  const th = new THREE.Group(); th.position.set(0.15, 0.0, 0.03); glove.add(th); const tm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.12, 4, 8), wm); tm.position.y = 0.08; th.add(tm); th.rotation.z = -0.9; GL.th = th;
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 16), STD('#e0e0e0')); cuff.position.y = -0.2; glove.add(cuff);
  glove.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// water drops (spray) + sneeze puffs + sparkles
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 140 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#ffffff' })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }
const ND = 160; const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshStandardMaterial({ color: '#7fd3ff', roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85 }), ND); drops.frustumCulled = false; scene.add(drops);
// rainbow arc
const rbT = canvasTex(8, 256, (c, w, h) => { const cols = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#2979ff', '#651fff']; cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * h / 6, w, h / 6 + 1); }); });
const rainbow = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.4, 64, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ map: rbT, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
{ const g = rainbow.geometry, uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < uv.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, 0.5, (r - 2.6) / 0.8); } }
rainbow.userData.noAO = true; scene.add(rainbow);

// ---------------- choreography ----------------
const CAR_X = 0;
const carArrX = t => { const u = clamp((t - 0.0) / (tThree + 0.2)); return lerp(26, CAR_X, 1 - Math.pow(1 - u, 2.3)); };
const HEAD_HID = [1.6, 3.0, -4.75], HEAD_UP = [1.6, 4.55, -4.6];
const POSES = {
  HOLST: [[1.6, 5.6, -3.6], [1.95, 3.4, -1.9], [1.95, 1.3, -2.0]],
  GRAB: [[1.6, 5.4, -3.4], [1.5, 2.7, -1.9], [1.3, 1.05, -1.2]],
  SNIFF: [[1.6, 5.4, -3.4], [1.9, 3.0, -2.0], [2.9, 1.75, -1.15]],
  SQZ: [[1.6, 5.3, -3.4], [1.5, 2.8, -1.9], [1.35, 1.1, -1.25]],
  CURL: [[1.6, 5.7, -3.2], [1.7, 5.7, -1.7], [1.7, 4.4, -1.4]],
  AIM: [[1.6, 4.6, -3.5], [1.4, 2.1, -2.4], [1.0, 1.15, -1.55]],
  REST: [[1.6, 5.4, -3.5], [2.2, 4.0, -2.4], [2.7, 3.4, -1.6]],
  PEAN: [[1.6, 5.3, -3.4], [1.5, 2.6, -1.9], [1.42, 1.06, -1.18]],
  TANK: [[1.6, 5.3, -3.4], [1.45, 2.4, -1.8], [1.35, 0.98, -1.1]],
  TRUMP: [[1.6, 5.8, -3.3], [1.5, 5.9, -2.2], [1.4, 5.5, -1.3]],
  SHOW: [[1.6, 5.6, -3.3], [1.2, 5.6, -1.6], [0.5, 4.7, -0.7]],
  HAPPY: [[1.6, 5.4, -3.4], [2.2, 4.4, -2.2], [2.6, 4.0, -1.4]],
};
// wrong: car flight path to the roof
const tBlow = tAchoo + 0.05, tLand = tYour3 + 0.15;
const FLY = [V3(CAR_X, 0, 0), V3(0.5, 2.5, 9.5), V3(-2.0, 13.5, 6.5), V3(-3.6, ROOF_Y, 1.4)];
const trW = poseTrack([[0, 'HOLST'], [tGrabH, 'HOLST'], [tHose + 0.1, 'GRAB'], [tAndH, 'GRAB'], [tSniffed - 0.1, 'SNIFF'], [tIts2 + 0.2, 'SNIFF'], [tWhat, 'GRAB'], [tGrab, 'GRAB'], [tSqueeze - 0.05, 'SQZ'], [tAh1 - 0.3, 'SQZ'], [tAh2 + 0.1, 'CURL'], [tAchoo - 0.08, 'CURL'], [tAchoo + 0.08, 'AIM'], [tLand, 'AIM'], [tNext3, 'REST'], [99, 'REST']], POSES);
const trR = poseTrack([[0, 'REST'], [tAnd3, 'REST'], [tWait, 'REST'], [tSniffs - 0.15, 'PEAN'], [tFinds, 'PEAN'], [tTank - 0.05, 'TANK'], [tHappy - 0.35, 'TANK'], [tHappy + 0.05, 'TRUMP'], [tThen5 - 0.1, 'TRUMP'], [tGives, 'SHOW'], [tIncl + 0.6, 'SHOW'], [tAnd6 - 0.2, 'HAPPY'], [99, 'HAPPY']], POSES);
const headW = monoV([[0, HEAD_HID], [tIts2 - 0.35, HEAD_HID], [tIts2 + 0.35, HEAD_UP], [tAh1, HEAD_UP], [tAh2 + 0.2, [1.6, 4.85, -4.75]], [tAchoo, [1.6, 4.85, -4.75]], [tAchoo + 0.15, [1.6, 4.35, -4.45]], [tAchoo + 0.6, HEAD_UP], [99, HEAD_UP]]);

function elState(t) {
  const right = isRight(t);
  const s = { head: right ? V3(...HEAD_UP) : headW(t), pitch: 0, yaw: 0, roll: 0, ear: 0.15, eyes: 1, lid: 0, cross: 0, smile: 1, sq: 0 };
  s.ear += 0.12 * Math.sin(t * 2.3); s.head.y += 0.04 * Math.sin(t * 1.9);
  const bl = (t % 4.1) < 0.13 ? 1 : 0; s.lid = bl;
  if (!right) {
    s.eyes = 1 + 0.45 * win(t, tIts2 + 0.1, tWhat + 0.4, 0.15);
    s.ear += 0.9 * win(t, tIts2 + 0.1, tIts2 + 0.9, 0.15) * Math.abs(Math.sin(t * 9));
    s.sq = win(t, tSqueeze - 0.05, tAh1 - 0.2, 0.12);
    s.cross = Math.max(s.sq, win(t, tThats, tSneezes, 0.2));
    s.eyes += 0.3 * s.sq;
    const ah = win(t, tAh1 - 0.1, tAchoo, 0.1); s.pitch = -0.35 * ah; s.lid = Math.max(s.lid, 0.7 * ah); s.ear += 0.8 * ah; s.smile = 1 - ah;
    const ach = win(t, tAchoo - 0.02, tAchoo + 0.6, 0.06); s.pitch += 0.25 * ach; s.lid = Math.max(s.lid, ach); s.ear += 1.2 * ach;
    s.smile = Math.min(s.smile, 1 - win(t, tSqueeze, tAchoo + 0.8, 0.2));
  } else {
    s.lid = Math.max(s.lid, 0.75 * win(t, tRead - 0.3, tAnd3 + 0.2, 0.3));  // dozing until "and wait"
    s.eyes = 1 + 0.4 * win(t, tWait, tSniffs + 0.6, 0.15);
    s.ear += 0.9 * win(t, tHappy - 0.2, tThen5, 0.2) * Math.abs(Math.sin(t * 8)) + 0.5 * win(t, tAnd6, TOTAL, 0.4) * Math.abs(Math.sin(t * 4));
    s.pitch = -0.3 * win(t, tHappy - 0.2, tThen5, 0.2) + 0.15 * win(t, tSniffs - 0.2, tFills, 0.3);
    s.roll = 0.15 * win(t, tAnd6, TOTAL, 0.4) * Math.sin(t * 2.5);
  }
  return s;
}
// tip radius bumps: squeeze pinch, gulps travelling to the tank, trumpet flare
function radFn(t) { const right = isRight(t); const st = !right ? win(t, tSqueeze - 0.05, tAh1 - 0.2, 0.12) : 0; const sn = !right ? win(t, tAh1 - 0.1, tAchoo, 0.1) : 0;
  const gulp = right ? win(t, tFills - 0.1, tHappy - 0.4, 0.2) : 0; const fl = right ? win(t, tHappy - 0.1, tThen5 - 0.2, 0.15) : 0;
  return u => { let r = lerp(0.44, 0.17, Math.pow(u, 0.8));
    if (st > 0) r *= 1 - 0.4 * st * Math.exp(-((u - 0.86) ** 2) / 0.002) + 0.25 * st * Math.exp(-((u - 0.78) ** 2) / 0.003);
    if (sn > 0) r *= 1 + 0.35 * sn * Math.exp(-((u - 0.8) ** 2) / 0.02) * (0.6 + 0.4 * Math.sin(t * 6));
    if (gulp > 0) { const ph = (t * 1.6) % 1; r *= 1 + 0.45 * gulp * Math.exp(-((u - ph) ** 2) / 0.002); }
    if (fl > 0) r *= 1 + 0.6 * fl * Math.pow(Math.max(0, (u - 0.85) / 0.15), 2);
    return r; }; }

// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const REAR = Ac([10.5, 3.2, -1.2], [0.8, 2.3, -1.4], 40);
const FRONT = Ac([2.6, 5.6, 12.0], [1.2, 2.7, -2.6], 38);
const CLOSE = Ac([9.0, 2.9, -0.9], [1.0, 1.75, -1.5], 38);
const ELCU = Ac([3.0, 4.9, 3.2], [1.6, 4.35, -4.6], 34);
const camKeys = [
  [0.0, Ac([-9.5, 3.0, 11.0], [4.0, 1.6, -1.5], 40)],
  [tYou1 - 0.3, Ac([-9.0, 3.0, 10.5], [3.0, 1.6, -1.5], 40)],
  ...cut(tYou1 - 0.25, FRONT),
  [S('hook1').end + 0.2, Ac([2.6, 5.4, 11.4], [1.2, 2.6, -2.6], 38)],
  ...cut(tGrabH - 0.15, CLOSE),
  [tIts2 - 0.4, Ac([8.7, 2.9, -0.9], [1.0, 1.8, -1.5], 38)],
  ...cut(tIts2 - 0.35, FRONT),
  [S('hook2').end + 0.3, Ac([2.6, 5.2, 10.8], [1.3, 3.0, -2.6], 38)],
  // wrong
  ...cut(S('wrong1').start, CLOSE),
  [tBig - 0.3, Ac([8.7, 2.9, -0.9], [1.0, 1.8, -1.5], 38)],
  ...cut(tBig - 0.25, ELCU),
  [tAnd2 - 0.3, Ac([2.9, 4.9, 3.0], [1.6, 4.35, -4.6], 34)],
  ...cut(tAnd2 - 0.25, Ac([-6.5, 4.4, 13.0], [0.8, 2.9, -1.8], 40)),
  [tAchoo + 0.1, Ac([-6.8, 4.5, 13.4], [0.6, 3.0, -1.8], 40)],
  ...cut(tAchoo + 0.15, Ac([9.0, 9.0, 22.0], [-1.0, 5.2, 0.5], 40)),
  [tNext3 - 0.3, Ac([7.5, 9.5, 19.0], [-3.0, 6.6, 0.5], 40)],
  ...cut(tNext3 - 0.25, Ac([2.5, 10.5, 15.0], [-5.0, 8.0, 1.0], 40)),
  [tRew0, Ac([2.0, 10.8, 14.0], [-5.0, 8.0, 1.0], 40)],
  // right
  ...cut(tRew1, FRONT),
  [tRead - 0.2, Ac([2.6, 5.4, 11.4], [1.2, 2.6, -2.6], 38)],
  ...cut(tRead - 0.15, Ac([4.8, 1.9, 0.6], [1.6, 1.45, -2.25], 34)),
  [S('right2').end + 0.2, Ac([4.4, 1.9, 0.3], [1.6, 1.45, -2.25], 32)],
  ...cut(tPut - 0.15, Ac([4.4, 1.7, -2.9], [1.2, 1.05, -1.0], 38)),
  [tWait - 0.3, Ac([4.3, 1.7, -2.8], [1.2, 1.05, -1.0], 38)],
  ...cut(tWait - 0.25, Ac([5.0, 4.6, 1.6], [1.6, 4.3, -4.5], 36)),
  [S('right3').end + 0.3, Ac([2.9, 4.9, 3.0], [1.6, 4.35, -4.6], 34)],
  ...cut(tSniffs - 0.15, Ac([4.4, 1.8, -2.9], [1.3, 1.25, -1.1], 38)),
  [tFills + 0.2, Ac([4.2, 1.8, -2.8], [1.3, 1.25, -1.1], 38)],
  ...cut(tFills + 0.25, FRONT),
  [tHappy - 0.3, Ac([2.6, 5.3, 11.2], [1.3, 3.0, -2.6], 38)],
  ...cut(tHappy - 0.25, Ac([3.8, 5.0, 6.0], [1.5, 4.7, -3.0], 38)),
  [S('right4').end + 0.2, Ac([3.7, 5.0, 5.7], [1.5, 4.7, -3.0], 38)],
  ...cut(tThen5 - 0.15, Ac([-6.0, 5.6, 12.5], [0.6, 2.9, -1.8], 40)),
  [tFull - 0.2, Ac([-5.6, 5.6, 12.0], [0.6, 2.9, -1.8], 40)],
  ...cut(tFull - 0.15, Ac([-2.5, 5.4, 12.5], [0.3, 2.9, -1.4], 40)),
  [S('right7').start, Ac([-2.6, 5.5, 13.0], [0.3, 3.0, -1.4], 40)],
  [TOTAL, Ac([-3.2, 5.8, 15.0], [0.3, 3.2, -1.4], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {}; let fuelLvl = 0;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = V3(1, 1, 1);
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  // car
  let cp = { x: carArrX(t), z: 0, h: Math.PI / 2 }; let fly = false;
  if (!right && t > tBlow) { const u = clamp((t - tBlow) / (tLand - tBlow)); const p = bez(FLY, easeOut(u) * 0.35 + u * 0.65); cp = { x: p.x, z: p.z, h: Math.PI / 2 }; fly = u < 1; placeCar(hero, cp); hero.position.y = p.y; if (fly) { hero.rotation.z = u * Math.PI * 2; hero.rotation.x = Math.sin(u * Math.PI) * 0.6; }
    const bnc = win(t, tLand, tLand + 0.5, 0.1); hero.position.y += 0.25 * bnc * Math.abs(Math.sin((t - tLand) * 12)); }
  else if (false) { const dt = t - S('right7').start - 0.3; cp.x = CAR_X - (0.9 * dt * dt + 0.4 * dt); placeCar(hero, cp); hero.position.y = 0; }
  else { placeCar(hero, cp); hero.position.y = 0; }
  hero.userData.hl.emissiveIntensity = 0.5;
  blink(hero, t, !right && t > tLand, !right && t > tLand);
  // shiny after the wash
  const shine = right ? ramp(t, tShower, tFull) : 0; hero.userData.body.envMapIntensity = 1.3 + 1.2 * shine; hero.userData.body.roughness = 0.22 - 0.12 * shine;
  flapPiv.rotation.y = (right ? ease(clamp((t - tPut + 0.2) / 0.4)) * (1 - ease(clamp((t - S('right7').start + 0.6) / 0.4))) : 0) * 1.6;
  hero.updateMatrixWorld(true);
  // elephant head
  const es = elState(t);
  eh.position.copy(es.head); eh.rotation.set(es.pitch, es.yaw, es.roll, 'YXZ');
  EL.ears.forEach(E => E.piv.rotation.y = -E.s * (0.15 + es.ear * 0.6));
  EL.eyes.forEach(E => { const sc = es.eyes; E.w.scale.setScalar(sc); E.lid.scale.setScalar(sc * 1.04); E.lid.rotation.x = lerp(-2.6, -1.0, es.lid) ;
    const crossOff = V3(-E.s * 0.07 * es.cross, -0.04 * es.cross, 0);
    E.p.position.copy(E.c0).addScaledVector(E.p0.clone().sub(E.c0), sc).add(crossOff); E.hl.position.copy(E.c0).addScaledVector(E.h0.clone().sub(E.c0), sc).add(crossOff); E.p.visible = E.hl.visible = es.lid < 0.6; });
  EL.smile.scale.set(1, lerp(-0.6, 1, es.smile), 1);
  EL.cap.position.y = 0.95 + 0.3 * (!right ? win(t, tAchoo - 0.02, tAchoo + 0.5, 0.06) : 0) + 0.12 * (right ? win(t, tHappy, tThen5, 0.2) * Math.abs(Math.sin(t * 10)) : 0);
  eh.updateMatrixWorld(true);
  // trunk
  const P3 = right ? trR(t) : trW(t); const P0 = eh.localToWorld(V3(0, -0.45, 0.9));
  // wiggles
  const wig = V3(0.08 * Math.sin(t * 2.2), 0.06 * Math.sin(t * 1.7), 0.06 * Math.sin(t * 2.6));
  if (!right && t > tSniffed - 0.15 && t < tIts2 + 0.3) wig.add(V3(0.08 * Math.sin(t * 18), 0.05 * Math.sin(t * 15), 0));
  if (right && t > tSniffs - 0.2 && t < tFinds) wig.add(V3(0.04 * Math.sin(t * 18), 0.03 * Math.sin(t * 15), 0));
  if (right && t > S('right7').start + 0.4) wig.add(V3(0.6 * Math.sin(t * 4), 0.3 * Math.sin(t * 8), 0));
  const P = [P0, P3[0], P3[1].clone().add(wig.clone().multiplyScalar(0.6)), P3[2].clone().add(wig)];
  buildTrunk(P, radFn(t));
  // glove: grabs the tip in the hook + wrong1/2
  const gOn = !right ? Math.max(win(t, tGrabH - 0.15, tAndH - 0.1, 0.2), win(t, tGrab - 0.15, tAh1 - 0.1, 0.2)) : win(t, tPut - 0.25, tCap + 0.4, 0.2);
  glove.visible = gOn > 0.02;
  if (glove.visible) {
    if (!right) { const u = 0.84; const gp = bez(P, u), tg = bezT(P, u); glove.position.copy(gp).add(V3(0.32, 0, 0.0)); glove.quaternion.setFromUnitVectors(V3(0, 1, 0), tg.clone().negate()); glove.rotateY(-Math.PI / 2); }
    else { const fl = hero.localToWorld(V3(1.1, 1.05, 1.32)); const src = fl.clone().add(V3(1.2, 0.6, -0.8)); const u = ease(clamp((t - tPut + 0.2) / 0.7)); glove.position.copy(src.lerp(fl.clone().add(V3(0.25, 0.12, 0)), u)); glove.rotation.set(0, -Math.PI / 2, 0.5); }
    glove.scale.setScalar(Math.max(0.01, gOn) * 1.05);
    const sq = !right ? win(t, tSqueeze - 0.1, tAh1 - 0.2, 0.08) : 0; const grip = !right ? 0.9 : 0.5;
    GL.f.forEach(f => f.rotation.x = grip + 0.6 * sq); GL.th.rotation.x = 0.5 + 0.4 * sq; }
  // peanut: placed on the open flap, sniffed up by the trunk
  peanut.visible = right && t > tPut - 0.2 && t < tFinds + 0.1;
  if (peanut.visible) { const fl = hero.localToWorld(V3(1.12, 1.1, 1.32)); if (glove.visible && t < tPut + 0.55) peanut.position.copy(glove.position).add(V3(-0.1, 0.12, 0)); else peanut.position.copy(fl);
    if (t > tSniffs + 0.3) { const u = clamp((t - tSniffs - 0.3) / 0.35); peanut.position.lerp(TIP.p, ease(u)); peanut.scale.setScalar(1.4 * (1 - 0.8 * u)); } else peanut.scale.setScalar(1.4);
    peanut.rotation.set(0, 0.3, 0.2); }
  // fuel level
  fuelLvl = right ? clamp((t - tFills) / (tHappy - 0.3 - tFills)) : 0;
  // water drops: shower
  for (let i = 0; i < ND; i++) { let ok = false;
    if (right) { const sh = win(t, tGives - 0.1, tIncl + 0.9, 0.2), mist = win(t, tAnd6 - 0.3, TOTAL + 1, 0.3) * 0.5; const a = Math.max(sh, mist);
      if (a > 0) { const ph = ((t * 1.4 + hash(i)) % 1); const life = ph * 1.1; const sp = 4.5 + hash(i + 3) * 2; const d = TIP.d.clone(); const jit = V3(hash(i + 5) - 0.5, hash(i + 7) - 0.5, hash(i + 9) - 0.5).multiplyScalar(0.9);
        const v = (mist > sh ? V3(0.2, 1, 0.3).normalize().multiplyScalar(sp) : d.multiplyScalar(sp)).add(jit.multiplyScalar(sp * 0.5)); const p = TIP.p.clone().addScaledVector(v, life); p.y -= 4.9 * life * life;
        if (p.y > 0.1 && hash(i + 11) < a) { ok = true; _m.compose(p, _q.identity(), _s.set(1, 1.6, 1)); } } } if (!ok) _m.makeScale(0, 0, 0); drops.setMatrixAt(i, _m); }
  drops.instanceMatrix.needsUpdate = true;
  // sneeze blast + sniff puffs + suds
  if (!right) { const dt = t - tAchoo; if (dt > -0.05 && dt < 1.0) for (let k = 0; k < 40; k++) { const ph = clamp(dt * 1.6 - hash(k) * 0.3); if (ph <= 0) continue; const dir = TIP.d.clone().add(V3(hash(k + 3) - 0.5, hash(k + 5) - 0.5, hash(k + 7) - 0.5).multiplyScalar(0.9)).normalize();
      puff(TIP.p.clone().addScaledVector(dir, ph * 9), 0.6 + ph * 3.2, 0.75 * (1 - ph), '#ffffff'); } }
  if (right) { const dt = t - tSniffs; if (dt > 0 && dt < 0.9) for (let k = 0; k < 6; k++) { const ph = ((dt * 2 + k / 6) % 1); puff(TIP.p.clone().addScaledVector(TIP.d, -ph * 0.6).add(V3(0, ph * 0.4, 0)), 0.15 + ph * 0.3, 0.5 * (1 - ph), '#e3f2fd'); }
    if (t > tWash) for (let k = 0; k < 30; k++) { const tw_ = (t * 0.7 + hash(k)) % 1; const p = hero.localToWorld(V3((hash(k + 1) - 0.5) * 1.8, 0.9 + hash(k + 2) * 0.8, (hash(k + 3) - 0.5) * 4.0)); puff(p, 0.12 + 0.18 * Math.sin(Math.PI * tw_), 0.95 * Math.sin(Math.PI * tw_) * ramp(t, tWash, tWash + 0.5), '#ffffff'); } }
  // rainbow
  rainbow.visible = right && t > tRainbow - 0.4; if (rainbow.visible) { const u = ease(clamp((t - tRainbow + 0.4) / 0.8)); rainbow.position.set(hero.position.x, 0.3, -0.4); rainbow.scale.set(1.15 * u + 0.01, 1.15 * u + 0.01, 1); rainbow.material.opacity = 0.85 * u; }
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? Math.max(win(t, tAchoo - 0.05, tAchoo + 0.5, 0.05), win(t, tLand - 0.05, tLand + 0.3, 0.05) * 0.6) : win(t, tHappy, tTrumpet + 0.4, 0.1) * 0.25;
  applyCam(c, t, shk > 0.02 ? 0.06 * shk : 0);
  camera.updateMatrixWorld(true);
  screen = { head: project(eh.localToWorld(V3(0, 1.4, 0))), tip: project(TIP.p), car: project(hero.localToWorld(V3(0, 1.8, 0))), flap: project(hero.localToWorld(V3(1.1, 1.0, 1.3))), roofCar: project(hero.localToWorld(V3(0, 2.2, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
const cxy = (p, dy = 0) => [clamp(p.x, 230, W - 230), clamp(p.y + dy, 560, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -120) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  ctx.translate(clamp(x, w / 2 + 30, W - w / 2 - 30) - x, 0);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, h / 2 - 4); ctx.lineTo(0, h / 2 + 34); ctx.lineTo(22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function gauge(t, a, b, lvl) {  // fuel gauge card
  if (t < a || t > b) return; const f = win(t, a, b, 0.25), k = back((t - a) / 0.4);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1450); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(15,18,24,0.9)'; rr(-230, -150, 460, 250, 30); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.strokeStyle = '#37474f'; ctx.beginPath(); ctx.arc(0, 40, 150, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.strokeStyle = lvl > 0.98 ? '#39ff4a' : YEL; ctx.beginPath(); ctx.arc(0, 40, 150, Math.PI * 1.15, Math.PI * (1.15 + 0.7 * lvl)); ctx.stroke();
  const an = Math.PI * (1.15 + 0.7 * lvl); ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(Math.cos(an) * 120, 40 + Math.sin(an) * 120); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '900 44px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('E', -150, 75); ctx.fillText('F', 150, 75); ctx.fillStyle = lvl > 0.98 ? '#39ff4a' : '#fff'; ctx.font = '900 40px Inter'; ctx.fillText(lvl > 0.98 ? 'FULL!' : 'FILLING...', 0, 72);
  ctx.restore(); }
function notes(t, a, b, p) { if (t < a || t > b || !p) return; for (let k = 0; k < 5; k++) { const ph = ((t - a) * 0.9 + k / 5) % 1; const x = clamp(p.x, 200, W - 200) + (k - 2) * 90 + Math.sin(ph * 6 + k) * 30, y = clamp(p.y, 500, 1100) - ph * 360; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * ph) * win(t, a, b, 0.3); ctx.font = '900 90px Inter'; ctx.textAlign = 'center'; ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(k % 2 ? '♪' : '♫', x, y); ctx.fillStyle = ['#ffd60a', '#ff5ec4', '#39ff4a'][k % 3]; ctx.fillText(k % 2 ? '♪' : '♫', x, y); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('FUEL: LOW', RED, tFuel - 0.1, tYou1 - 0.1, 62, iconWarn);
    P_('PUMP 3', '#455a64', tPump1 - 0.15, S('hook1').end + 0.3, 62);
    P_('HOSE: WARM?', '#e65100', tWarm - 0.15, tSniffed - 0.15, 60);
    bubble('SNIFF SNIFF', screen.tip, t, tSniffed - 0.05, tIts2 - 0.2, 54, '#fff', '#555', -90);
    P_('PUMP: ELEPHANT', '#6d4c41', tEleph - 0.15, S('hook2').end + 0.3, 60);
    P_('GRAB & SQUEEZE', RED, tGrab - 0.1, S('wrong1').end + 0.3, 60, iconWarn);
    floatText('SQUEEZE!', 540, 820, t, tSqueeze, tSqueeze + 0.9, 110, YEL, -0.1);
    P_("THAT'S HER NOSE", RED, tThats - 0.1, tAnd2 - 0.1, 60, iconX);
    P_('SQUEEZED NOSE = SNEEZE', RED, tAnd2 - 0.1, S('wrong2').end + 0.3, 50, iconWarn);
    floatText('AH...', 330, 760, t, tAh1, tAh1 + 0.7, 100, '#fff', -0.12); floatText('AH...', 720, 700, t, tAh2, tAh2 + 0.6, 110, '#fff', 0.1);
    floatText('ACHOO!!!', 540, 860, t, tAchoo, tAchoo + 1.0, 150, YEL, -0.06);
    P_('CAR PARKED ON THE ROOF', RED, tYour3 - 0.1, tNext3 - 0.1, 52, iconX);
    P_('NEXT TO THE PRICES', RED, tNext3 - 0.1, tRew0, 56, iconX);
  } else {
    P_('READ THE SIGN', '#455a64', tRead - 0.1, tPayment - 0.15, 60);
    P_('PAYMENT: PEANUTS ONLY', '#e65100', tPayment - 0.1, S('right2').end + 0.3, 52);
    P_('1 PEANUT ON THE FUEL CAP', '#1565c0', tPeanut3 - 0.15, tAnd3 - 0.1, 50);
    P_('...AND WAIT', '#455a64', tAnd3 - 0.1, S('right3').end + 0.3, 60);
    bubble('SNIFF SNIFF', screen.tip, t, tSniffs - 0.05, tFinds + 0.1, 54, '#fff', '#555', -90);
    P_('TANK FOUND', GREEN, tFinds - 0.1, tFills - 0.15, 60, iconCheck);
    gauge(t, tFills - 0.1, tHappy - 0.05, fuelLvl);
    floatText('TOOOOT!', 540, 1000, t, tTrumpet - 0.2, tTrumpet + 1.1, 130, YEL, -0.06);
    notes(t, tHappy, S('right4').end + 0.5, screen.head);
    P_('FREE CAR WASH', '#0288d1', tFree() - 0.15, tTrunk5 - 0.15, 60, iconHeart);
    P_('TRUNK SHOWER INCLUDED', '#0288d1', tTrunk5 - 0.15, S('right5').end + 0.3, 52, iconCheck);
    P_('FULL TANK', GREEN, tFull - 0.1, tClean - 0.1, 62, iconCheck);
    P_('CLEAN CAR', GREEN, tClean - 0.1, tAnd6 - 0.1, 62, iconCheck);
    P_('+ RAINBOW', '#8e24aa', tAnd6 - 0.1, tAll - 0.1, 62);
    P_('PRICE: 1 PEANUT', '#e65100', tAll - 0.1, S('right7').start - 0.1, 58, iconHeart);
  }
}
function tFree() { return WT('right5', 'free'); }
window.dbg = { elState };
start(update, hud);
