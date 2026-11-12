// Episode 46: Drive-through – the window opens and out comes a T-rex in a paper hat
// hook (old style): you're starving, pull up to the drive-through window -> it opens, out comes a T-rex in a paper hat
// wrong: shout "the biggest burger you've got!" -> a T-rex takes every order literally, the biggest thing here is your car ->
//        bun, cheese, ketchup: one giant car burger, to go
// right: order nicely -> problem: tiny arms, she can't reach your window -> hand her your barbecue tongs ->
//        burger, fries, a tiny high five -> happy dance, the whole restaurant wiggles -> free dessert, extra large (ice-cream cone hat)
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, roundRectShape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, iconArrow, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tStarv = WT('hook1', 'starving'), tYou1 = WT('hook1', 'You', 1), tDrive = WT('hook1', 'drive'), tWin1 = WT('hook1', 'window');
const tThe = WT('hook2', 'The'), tOpens = WT('hook2', 'opens'), tOut = WT('hook2', 'out'), tTrex = WT('hook2', 'trex'), tIn = WT('hook2', 'In'), tPaper = WT('hook2', 'paper'), tHat = WT('hook2', 'hat'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tShout = WT('wrong1', 'shout'), tBiggest1 = WT('wrong1', 'biggest'), tBurger1 = WT('wrong1', 'burger'), tGot = WT('wrong1', 'got');
const tBig = WT('wrong2', 'Big'), tTrex2 = WT('wrong2', 'trex'), tTakes = WT('wrong2', 'takes'), tLiterally = WT('wrong2', 'literally'), tAnd2 = WT('wrong2', 'And'), tBiggest2 = WT('wrong2', 'biggest'), tThing = WT('wrong2', 'thing'), tYourCar = WT('wrong2', 'your'), tCar2 = WT('wrong2', 'car');
const tBun = WT('wrong3', 'Bun'), tCheese = WT('wrong3', 'Cheese'), tKetchup = WT('wrong3', 'Ketchup'), tOne3 = WT('wrong3', 'One'), tGiant3 = WT('wrong3', 'giant'), tCar3 = WT('wrong3', 'car'), tBurger3 = WT('wrong3', 'burger'), tTo = WT('wrong3', 'To'), tGo = WT('wrong3', 'go');
const tOrder = WT('right2', 'Order'), tNicely = WT('right2', 'nicely'), tThen2 = WT('right2', 'Then'), tSpot = WT('right2', 'spot'), tProblem = WT('right2', 'problem'), tTiny = WT('right2', 'Tiny'), tArms = WT('right2', 'arms'), tShe2 = WT('right2', 'She'), tReach2 = WT('right2', 'reach'), tWindow2 = WT('right2', 'window');
const tSo = WT('right3', 'So'), tHand = WT('right3', 'hand'), tBbq = WT('right3', 'barbecue'), tTongs = WT('right3', 'tongs'), tEvery = WT('right3', 'Every'), tCarries = WT('right3', 'carries');
const tNow = WT('right4', 'Now'), tReach4 = WT('right4', 'reach'), tBurger4 = WT('right4', 'Burger'), tFries = WT('right4', 'Fries'), tAnd4 = WT('right4', 'And'), tTiny4 = WT('right4', 'tiny'), tHigh = WT('right4', 'high'), tFive = WT('right4', 'five');
const tHappy = WT('right5', 'happy'), tDance = WT('right5', 'dance'), tThe5 = WT('right5', 'The'), tRest = WT('right5', 'restaurant'), tWiggles = WT('right5', 'wiggles');
const tFree = WT('right6', 'Free'), tDessert = WT('right6', 'dessert'), tExtra = WT('right6', 'Extra'), tLarge = WT('right6', 'large');
const tPassed = WT('right7', 'Exam');
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
// vector keys [t, [x,y,z]] -> fn(t) -> Vector3
function monoV(keys) { const f = [0, 1, 2].map(i => mono(keys.map(k => [k[0], k[1][i]]))); return t => V3(f[0](t), f[1](t), f[2](t)); }

// ---------------- world: drive-through ----------------
makeLandscape({ avoid: (x, z) => (x > -30 && x < 30 && z > -70 && z < 80), fieldAvoid: (x, z, w, d) => (x + w / 2 > -36 && x - w / 2 < 36 && z + d / 2 > -76 && z - d / 2 < 86), near: [0, -120, 200, 120], trees: 1500, seed: 4601 });
plane(-26, 26, -66, 76, asphaltMat, 0.05, 7);
// lane markings: yellow lane edges + arrows
{ const ym = L('#ffd54f', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  const eg = new THREE.PlaneGeometry(0.16, 120); eg.rotateX(-Math.PI / 2); instanced(eg, ym, [[2.3, 0.07, 10], [-2.25, 0.07, 10]], false);
  const ar = new THREE.Shape(); ar.moveTo(0, 1.4); ar.lineTo(0.7, 0.4); ar.lineTo(0.25, 0.4); ar.lineTo(0.25, -1.2); ar.lineTo(-0.25, -1.2); ar.lineTo(-0.25, 0.4); ar.lineTo(-0.7, 0.4); ar.closePath();
  const ag = new THREE.ShapeGeometry(ar); ag.rotateX(-Math.PI / 2); for (const z of [14, 28, -14]) { const m = new THREE.Mesh(ag, markMat); m.position.set(0, 0.07, z); scene.add(m); }
  // parking bays east
  const pg = new THREE.PlaneGeometry(0.14, 5); pg.rotateX(-Math.PI / 2); const pl = []; for (let z = -40; z < 60; z += 3) pl.push([15, 0.07, z]); instanced(pg, markMat, pl, false);
  // kerb strip between lane and building
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.16, 40), L('#cfc9bd')); kerb.position.set(-2.62, 0.08, 0); kerb.receiveShadow = true; scene.add(kerb); }
// parked cars far east + lamp posts
for (const [x, z, c] of [[17.5, -22, '#e53935'], [17.5, -10, '#fdd835'], [17.5, 26, '#43a047'], [17.5, 41, '#8e24aa'], [12.5, 50, '#fb8c00']]) { const pc = makeCar(c); pc.position.set(x, 0, z); pc.rotation.y = Math.PI / 2; }
for (const z of [-30, 30, 55]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 7, 8), STD('#555')); p.position.set(10, 3.5, z); p.castShadow = true; scene.add(p); const hdl = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.4), STD('#444')); hdl.position.set(9.5, 7, z); scene.add(hdl); }

// building (window in the east face x=-3, z in [-2.2, 2.2], y in [1, 5])
const bld = new THREE.Group(); scene.add(bld);       // pivot at ground under the window (for the wiggle)
bld.position.set(-9, 0, 0);
const WALL = STD('#ffe0a3', { roughness: 0.85 }), REDM = STD('#d84315', { roughness: 0.6 }), DARK = STD('#4e342e', { roughness: 0.9 });
const stripeT = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(i * 32, 0, 32, h); } }, true);
{ const add = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x + 9, y, z); m.castShadow = m.receiveShadow = true; bld.add(m); return m; };
  add(9.5, 6.5, 18, WALL, -11.75, 3.25, 0);                     // main block (x -16.5..-7)
  // east shell around the window (x -7..-3)
  add(4.0, 6.5, 6.8, WALL, -5.0, 3.25, 5.6); add(4.0, 6.5, 6.8, WALL, -5.0, 3.25, -5.6);   // sides of the window bay
  add(4.0, 1.5, 4.4, WALL, -5.0, 5.75, 0);                       // above window
  add(4.0, 1.0, 4.4, WALL, -5.0, 0.5, 0);                        // below window
  add(0.25, 4.0, 0.25, REDM, -3.0, 3.0, 2.3); add(0.25, 4.0, 0.25, REDM, -3.0, 3.0, -2.3);  // window frame
  add(0.9, 0.12, 4.9, STD('#bdbdbd', { metalness: 0.5, roughness: 0.35 }), -2.75, 1.04, 0);   // counter sill
  add(0.3, 0.9, 18.2, REDM, -2.9, 0.45, 0).position.x = 9 - 2.9; // red base band (east)
  add(4.0, 0.06, 4.4, DARK, -5.0, 1.03, 0);                       // interior floor at sill height
  add(0.2, 4.0, 4.4, STD('#6d4c41', { roughness: 0.9 }), -6.9, 3.0, 0);   // interior back wall (kitchen)
  // kitchen tiles on the interior back wall
  const tileT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e53935'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) c.fillRect(i * 32, j * 32, 32, 32); }, true); tileT.repeat.set(3, 3);
  const tw = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.9), STD('#ffffff', { map: tileT, roughness: 0.6 })); tw.rotation.y = Math.PI / 2; tw.position.set(-6.78 + 9, 3.0, 0); bld.add(tw);
  // fascia stripes + awning
  const fas = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 18.2), STD('#ffffff', { map: stripeT, roughness: 0.6 })); fas.material.map.repeat.set(9, 1); fas.position.set(-2.95 + 9, 6.15, 0); bld.add(fas);
  const awT = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(i * 32, 0, 32, h); } c.fillStyle = '#e53935'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(i * 32 + 16, h, 16, Math.PI, 0); c.fill(); } }, true);
  const aw = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 5.2), STD('#ffffff', { map: awT, roughness: 0.7 })); aw.material.map.repeat.set(2.6, 1); aw.position.set(-2.45 + 9, 5.45, 0); aw.rotation.z = -0.32; aw.castShadow = true; bld.add(aw);
  // "PICK UP" plate above window
  const puT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#ffd54f'; c.fillRect(0, 0, w, h); c.fillStyle = '#b71c1c'; c.font = '900 78px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PICK UP  ►', w / 2, h / 2 + 4); });
  const pu = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), STD('#ffffff', { map: puT, roughness: 0.6 })); pu.rotation.y = Math.PI / 2; pu.position.set(-2.88 + 9, 5.0 - 0.0, 3.6); bld.add(pu); }
// roof sign: giant burger + "DINO BURGER"
const signG = new THREE.Group(); signG.position.set(-5.5 + 9, 6.5, -3.0); bld.add(signG);
const BUN = STD('#e0953e', { roughness: 0.55 }), BUNL = STD('#f2c27a', { roughness: 0.6 }), PATTY = STD('#5d3a1a', { roughness: 0.8 }), LETT = STD('#7cb342', { roughness: 0.7 }), CHEESE = STD('#ffc107', { roughness: 0.45, side: THREE.DoubleSide });
const seedGeo = new THREE.SphereGeometry(0.06, 6, 4); seedGeo.scale(1, 0.5, 1.8);
function domeBun(r, h, seeds) { const g = new THREE.Group(); const top = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), BUN); top.scale.y = h / r; g.add(top);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.97, r * 0.12, 32), BUNL); base.position.y = -r * 0.06; g.add(base);
  if (seeds) { const R = rng(seeds); const list = []; for (let i = 0; i < seeds; i++) { const a = R() * 6.283, rad = Math.sqrt(R()) * r * 0.85; const x = Math.cos(a) * rad, z = Math.sin(a) * rad; const y = h * Math.sqrt(Math.max(0, 1 - (rad / r) ** 2)); list.push([x, y, z, R() * 3]); }
    const sm = new THREE.InstancedMesh(seedGeo, STD('#fff8e1'), list.length); list.forEach((d, i) => { const m = new THREE.Matrix4().compose(V3(d[0], d[1], d[2]), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, d[3], 0)), V3(r / 2.8, r / 2.8, r / 2.8)); sm.setMatrixAt(i, m); }); g.add(sm); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }
{ const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.6, 8), STD('#777')); pole.position.y = 0.8; signG.add(pole);
  const b = new THREE.Group(); b.position.y = 2.4; signG.add(b); signG.userData.burger = b;
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.4, 0.45, 32), BUN); bot.position.y = -0.55; b.add(bot);
  const pat = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 32), PATTY); pat.position.y = -0.15; b.add(pat);
  const let_ = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.72, 0.1, 18), LETT); let_.position.y = 0.08; b.add(let_);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 2.6), CHEESE); ch.position.y = 0.16; ch.rotation.y = 0.4; b.add(ch);
  const top = domeBun(1.55, 0.9, 40); top.position.y = 0.25; b.add(top);
  b.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const boardT = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd54f'; c.fillRect(10, 10, w - 20, h - 20); c.fillStyle = '#c62828'; c.fillRect(22, 22, w - 44, h - 44);
  c.fillStyle = '#ffffff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 14; c.strokeStyle = '#7f0000'; c.strokeText('DINO BURGER', w / 2, h / 2 + 8); c.fillText('DINO BURGER', w / 2, h / 2 + 8); });
const board = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.9, 7.4), [STD('#c62828'), STD('#c62828'), STD('#c62828'), STD('#c62828'), STD('#c62828'), STD('#c62828')]);
board.material[0] = STD('#ffffff', { map: boardT, roughness: 0.5 }); board.position.set(-3.2 + 9, 7.55, 3.3); board.castShadow = true; bld.add(board);
// menu board + speaker post at the lane entry
{ const mT = canvasTex(512, 384, (c, w, h) => { c.fillStyle = '#263238'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd54f'; c.font = '900 52px Inter'; c.textAlign = 'center'; c.fillText('MENU', w / 2, 60);
    c.font = '800 34px Inter'; c.textAlign = 'left'; c.fillStyle = '#fff'; ['BRONTO BURGER', 'RAPTOR WRAP', 'T-BONE FRIES', 'METEOR SHAKE'].forEach((s, i) => { c.fillText(s, 30, 130 + i * 62); c.fillStyle = '#ffd54f'; c.fillText('★', w - 70, 130 + i * 62); c.fillStyle = '#fff'; }); });
  const mb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.7, 2.3), STD('#37474f')); mb.position.set(-2.6, 2.1, 10.5); mb.castShadow = true; scene.add(mb);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), STD('#ffffff', { map: mT, roughness: 0.6 })); face.rotation.y = Math.PI / 2; face.position.set(-2.48, 2.1, 10.5); scene.add(face);
  const pst = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), STD('#555')); pst.position.set(-2.6, 0.6, 10.5); scene.add(pst); }

// ---------------- T-rex ----------------
const SKIN = STD('#5cb04a', { roughness: 0.62 }), BELLY = STD('#d7eab0', { roughness: 0.7 }), SPOT = STD('#3f8a34', { roughness: 0.7 });
const skinT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(40,90,30,${0.18 + R() * 0.2})`; c.beginPath(); c.ellipse(R() * w, R() * h, 6 + R() * 14, 5 + R() * 10, R() * 3, 0, 7); c.fill(); } }, true);
skinT.repeat.set(2, 2); SKIN.map = skinT;
const rexBody = new THREE.Group(); scene.add(rexBody);       // chest + arms + body (shifts with lean)
const RX = {};
{ const chest = new THREE.Mesh(new THREE.SphereGeometry(1.25, 28, 20), SKIN); chest.scale.set(1.0, 1.25, 1.15); chest.position.set(-4.15, 2.0, 0); rexBody.add(chest);
  const bel = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 16), BELLY); bel.scale.set(0.55, 1.15, 0.95); bel.position.set(-3.4, 1.85, 0); rexBody.add(bel);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 16), SKIN); body.scale.set(2.4, 1.6, 1.6); body.position.set(-6.2, 2.0, 0); rexBody.add(body);
  // tiny arms: capsule from shoulder to hand, two claws
  RX.arms = [-1, 1].map(s => { const g = new THREE.Group(); rexBody.add(g);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 6, 10), SKIN); up.rotation.z = Math.PI / 2; up.position.x = 0.26; g.add(up);
    const hand = new THREE.Group(); hand.position.x = 0.55; g.add(hand);
    for (const k of [-1, 1]) { const cl = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 8), STD('#fafafa', { roughness: 0.4 })); cl.rotation.z = -Math.PI / 2; cl.position.set(0.12, 0, k * 0.05); hand.add(cl); }
    return { g, hand, s, sh: V3(-3.12, 2.45, s * 0.5) }; });
  rexBody.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
// neck (sphere chain on a bezier)
const neckS = Array.from({ length: 7 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), SKIN); m.castShadow = m.receiveShadow = true; scene.add(m); return m; });
// head: local forward +x, up +y
const hd = new THREE.Group(); scene.add(hd); hd.scale.setScalar(0.82);
{ const add = (geo, mat, x, y, z, p = hd) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  add(new THREE.SphereGeometry(1, 32, 24), SKIN, 0, 0.15, 0).scale.set(1.25, 1.0, 0.98);
  add(new THREE.SphereGeometry(1, 32, 20), SKIN, 1.45, -0.02, 0).scale.set(1.55, 0.6, 0.8);
  // mouth interior (visible when the jaw opens)
  add(new THREE.SphereGeometry(1, 20, 14), STD('#8e2430', { roughness: 0.8 }), 1.3, -0.42, 0).scale.set(1.35, 0.3, 0.62);
  // upper teeth
  const toothG = new THREE.ConeGeometry(0.075, 0.2, 6); const TM = STD('#fffdf2', { roughness: 0.35 });
  for (let i = 0; i < 7; i++) { const x = 0.55 + i * 0.36; const zz = 0.72 * Math.sqrt(Math.max(0.05, 1 - ((x - 1.45) / 1.6) ** 2)); for (const s of [-1, 1]) { const tth = add(toothG, TM, x, -0.48, s * zz * 0.92); tth.rotation.x = Math.PI; } }
  // nostrils
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.07, 8, 6), STD('#1b3b16'), 2.82, 0.3, s * 0.22).scale.set(1, 0.6, 1.4);
  // eyes (white, pupil, highlight) + brows
  RX.eyes = [-1, 1].map(s => { const w = add(new THREE.SphereGeometry(0.31, 18, 14), STD('#ffffff', { roughness: 0.25 }), 0.72, 0.62, s * 0.56);
    const p = add(new THREE.SphereGeometry(0.15, 14, 10), STD('#111', { roughness: 0.2 }), 0.98, 0.66, s * 0.66);
    const hl = add(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), 1.08, 0.74, s * 0.7);
    const br = add(new THREE.BoxGeometry(0.55, 0.12, 0.2), SPOT, 0.72, 0.98, s * 0.56); return { w, p, hl, br, s, p0: p.position.clone(), h0: hl.position.clone(), c0: w.position.clone() }; });
  // lower jaw
  const jaw = new THREE.Group(); jaw.position.set(-0.25, -0.42, 0); hd.add(jaw); RX.jaw = jaw;
  add(new THREE.SphereGeometry(1, 28, 16), BELLY, 1.55, -0.12, 0, jaw).scale.set(1.6, 0.32, 0.7);
  for (let i = 0; i < 6; i++) { const x = 0.75 + i * 0.36; const zz = 0.62 * Math.sqrt(Math.max(0.05, 1 - ((x - 1.55) / 1.65) ** 2)); for (const s of [-1, 1]) add(toothG, TM, x, 0.12, s * zz * 0.9, jaw); }
  const tongue = add(new THREE.SphereGeometry(1, 18, 10), STD('#ef6f8a', { roughness: 0.5 }), 1.3, 0.08, 0, jaw); tongue.scale.set(0.8, 0.12, 0.38); RX.tongue = tongue;
  // paper hat (soda-jerk cap) with stripe + name
  const capS = new THREE.Shape(); capS.moveTo(-0.95, 0); capS.lineTo(0.95, 0); capS.lineTo(0.62, 0.52); capS.quadraticCurveTo(0, 0.6, -0.62, 0.52); capS.lineTo(-0.95, 0);
  const capG = new THREE.ExtrudeGeometry(capS, { depth: 0.62, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }); capG.translate(0, 0, -0.31);
  const capT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e53935'; c.fillRect(0, 150, w, 34); c.fillStyle = '#c62828'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText('DINO', w / 2, 120); });
  capG.computeBoundingBox(); { const uv = capG.attributes.uv, p = capG.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + 1) / 2, 1 - (p.getY(i) / 0.62) * 0.9); }
  const cap = new THREE.Mesh(capG, STD('#ffffff', { roughness: 0.7 })); { const bandM = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.12, 0.7), STD('#e53935', { roughness: 0.6 })); bandM.position.y = 0.16; cap.add(bandM); } cap.position.set(-0.05, 0.98, 0); cap.rotation.set(0.12, 0, -0.1); cap.castShadow = true; hd.add(cap); RX.cap = cap; }
// ketchup bottle (held in the mouth in the wrong way)
const ketch = new THREE.Group(); hd.add(ketch); ketch.position.set(2.55, -0.55, 0); ketch.visible = false;
{ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.0, 16), STD('#e53935', { roughness: 0.35 })); b.position.y = 0.0; ketch.add(b); const cp = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 12), STD('#ffffff')); cp.rotation.x = Math.PI; cp.position.y = -0.65; ketch.add(cp); }

// ---------------- hero car + driver arm ----------------
const hero = makeCar('#1e88e5');
hero.userData.bodyG.children[1].material.color.set('#4a6c8c');
const armG = new THREE.Group(); hero.userData.bodyG.add(armG);
const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 1, 12), STD('#ff7043', { roughness: 0.7 })); sleeve.rotation.z = Math.PI / 2; armG.add(sleeve);
const handM = new THREE.Group(); armG.add(handM);
{ const palm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), STD('#f1c27d', { roughness: 0.6 })); palm.scale.set(0.8, 1.0, 1.2); handM.add(palm); const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.09, 4, 8), STD('#f1c27d')); th.position.set(0, 0.06, -0.13); th.rotation.x = 0.8; handM.add(th); }
armG.traverse(o => { if (o.isMesh) o.castShadow = true; });

// ---------------- props: tongs, bag, fries, burger parts, cone ----------------
const TONG_L = 1.85;
const tongs = new THREE.Group(); scene.add(tongs);   // local +x from handle to tip
const TONGA = [];
{ const steel = STD('#cfd8dc', { metalness: 0.8, roughness: 0.25 }); for (const s of [-1, 1]) { const a = new THREE.Group(); tongs.add(a);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(TONG_L, 0.05, 0.03), steel); bar.position.x = TONG_L / 2; a.add(bar);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.05), steel); pad.position.set(TONG_L - 0.1, 0, 0); a.add(pad);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.05), STD('#212121')); grip.position.set(0.22, 0, 0); a.add(grip);
    a.userData.s = s; TONGA.push(a); }
  tongs.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const bag = new THREE.Group(); scene.add(bag);
{ const k = STD('#c8a165', { roughness: 0.9 }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.48), k); b.position.y = -0.25; bag.add(b);
  const fold = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.5), STD('#b08a50')); fold.position.y = 0.0; bag.add(fold);
  const lg = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c8a165'; c.fillRect(0, 0, w, h); c.fillStyle = '#c62828'; c.beginPath(); c.arc(64, 64, 40, 0, 7); c.fill(); c.fillStyle = '#ffd54f'; c.font = '900 30px Inter'; c.textAlign = 'center'; c.fillText('DINO', 64, 75); });
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), STD('#ffffff', { map: lg })); f.position.set(s * 0.175, -0.27, 0); f.rotation.y = s * Math.PI / 2; bag.add(f); }
  bag.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const fries = new THREE.Group(); scene.add(fries);
{ const box_ = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.32, 4), STD('#e53935', { roughness: 0.5 })); box_.rotation.y = Math.PI / 4; box_.position.y = -0.16; fries.add(box_);
  const fl = []; for (let i = 0; i < 14; i++) fl.push([(hash(i) - 0.5) * 0.2, 0.02 + hash(i + 3) * 0.08, (hash(i + 5) - 0.5) * 0.2, hash(i + 7)]);
  const fm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.28, 0.04), STD('#ffd54f', { roughness: 0.6 }), fl.length);
  fl.forEach((d, i) => fm.setMatrixAt(i, new THREE.Matrix4().compose(V3(d[0], d[1], d[2]), new THREE.Quaternion().setFromEuler(new THREE.Euler((d[3] - 0.5) * 0.4, 0, (d[3] - 0.5) * 0.5)), V3(1, 1, 1)))); fries.add(fm);
  fries.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// giant burger parts (wrong)
const BUN_R = 2.25;
const botBun = new THREE.Group(); scene.add(botBun);
{ const lp = []; const n = 16; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2; lp.push(new THREE.Vector2(BUN_R - 0.25 + 0.25 * Math.cos(a - Math.PI / 2) , 0.25 + 0.25 * Math.sin(a - Math.PI / 2))); }
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2; lp.push(new THREE.Vector2(BUN_R - 0.25 + 0.25 * Math.cos(a), 0.55 + 0.25 * Math.sin(a))); }
  lp.unshift(new THREE.Vector2(0, 0)); lp.push(new THREE.Vector2(0, 0.8));
  const m = new THREE.Mesh(new THREE.LatheGeometry(lp, 48), BUN); m.castShadow = m.receiveShadow = true; botBun.add(m);
  const crumb = new THREE.Mesh(new THREE.CircleGeometry(BUN_R - 0.2, 48), BUNL); crumb.rotation.x = -Math.PI / 2; crumb.position.y = 0.805; crumb.receiveShadow = true; botBun.add(crumb);
  const lett = new THREE.Mesh(new THREE.TorusGeometry(BUN_R - 0.1, 0.16, 8, 60), LETT); lett.rotation.x = Math.PI / 2; lett.scale.z = 0.6; lett.position.y = 0.86; botBun.add(lett); }
const topBun = domeBun(BUN_R, 1.5, 70); scene.add(topBun);
const BUN_TOP_Y = 0.8;          // car sits on the bottom bun at this height
// cheese slice: draped over the car (vertex animation)
const cheeseG = new THREE.PlaneGeometry(4.3, 4.3, 30, 30); cheeseG.rotateX(-Math.PI / 2);
const cheese = new THREE.Mesh(cheeseG, CHEESE); cheese.castShadow = true; cheese.receiveShadow = true; scene.add(cheese);
const CH0 = cheeseG.attributes.position.array.slice();
const carTopAt = (x, z) => { // approximate car top height (local) incl. a margin
  const ax = Math.abs(x), az = z; if (ax > 0.98 || az < -2.25 || az > 2.25) return -1;
  if (az > -1.0 && az < 0.85 && ax < 0.82) return 1.66; if (az > -1.3 && az < 1.1) return lerp(1.66, 1.05, clamp((Math.abs(az + 0.08) - 0.92) / 0.3)) * (ax < 0.85 ? 1 : 0.62);
  return 1.06; };
function drapeCheese(u, cx, cy, cz, rot) { const p = cheeseG.attributes.position; for (let i = 0; i < p.count; i++) { const x = CH0[i * 3], z = CH0[i * 3 + 2];
    let top = carTopAt(x, z); let y;
    if (top > 0) y = top + 0.04; else { const dx = Math.max(0, Math.abs(x) - 0.95), dz = Math.max(0, Math.abs(z) - 2.2); const d = Math.hypot(dx, dz); const edge = (Math.abs(z) > 2.2) ? 1.0 : (Math.abs(z) < 1.0 ? 1.62 : 1.06); y = edge + 0.04 - 1.2 * Math.pow(d, 1.3); }
    const flat = 1.7 + 0.1 * Math.sin(x * 1.3 + z); p.setY(i, lerp(flat, Math.max(y, -BUN_TOP_Y + 0.02), u)); }
  p.needsUpdate = true; cheeseG.computeVertexNormals(); cheese.position.set(cx, cy, cz); cheese.rotation.y = rot; }
// ketchup squiggle on the roof
const sqPts = []; for (let i = 0; i <= 80; i++) { const u = i / 80; sqPts.push(V3(0.32 * Math.sin(u * Math.PI * 7), 0, -1.0 + 2.0 * u)); }
const sqCurve = new THREE.CatmullRomCurve3(sqPts);
const sqGeo = new THREE.TubeGeometry(sqCurve, 200, 0.075, 8, false); const squig = new THREE.Mesh(sqGeo, STD('#d50000', { roughness: 0.25 })); squig.castShadow = true; scene.add(squig);
// TO GO flag
const flag = new THREE.Group(); scene.add(flag);
{ const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), STD('#d7b98e')); st.position.y = 0.7; flag.add(st);
  const fT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#c62828'; c.font = '900 70px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TO GO', w / 2, h / 2 + 4); });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), STD('#ffffff', { map: fT, side: THREE.DoubleSide })); f.position.set(0.47, 1.2, 0); flag.add(f); }
// giant ice-cream cone (upside down: scoops on the roof, point up)
const coneG = new THREE.Group(); scene.add(coneG);
{ const wT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e1a95f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#a86f2f'; c.lineWidth = 8; for (let i = -8; i < 16; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32 + 256, 256); c.stroke(); c.beginPath(); c.moveTo(i * 32, 256); c.lineTo(i * 32 + 256, 0); c.stroke(); } }, true); wT.repeat.set(3, 2);
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 28, 20), STD('#f48fb1', { roughness: 0.6 })); s1.scale.y = 0.85; s1.position.y = 0.78; coneG.add(s1);
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.88, 28, 20), STD('#fff3e0', { roughness: 0.6 })); s2.scale.y = 0.85; s2.position.y = 1.9; coneG.add(s2);
  const cn = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.5, 28, 1, true), STD('#ffffff', { map: wT, roughness: 0.7, side: THREE.DoubleSide })); cn.position.y = 2.25 + 1.25; coneG.add(cn);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.09, 8, 28), STD('#c98a3f')); rim.rotation.x = Math.PI / 2; rim.position.y = 2.25; coneG.add(rim);
  const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), STD('#d50000', { roughness: 0.2 })); cherry.position.y = 4.95; coneG.add(cherry);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 5), STD('#5d4037')); stem.position.set(0.05, 5.3, 0); stem.rotation.z = 0.3; coneG.add(stem);
  const spr = []; for (let i = 0; i < 40; i++) { const a = hash(i) * 6.283, b = (hash(i + 9) - 0.5) * 2.4; spr.push([Math.cos(a) * 0.86 * Math.cos(b * 0.6), 1.9 + 0.7 * Math.sin(b * 0.6), Math.sin(a) * 0.86 * Math.cos(b * 0.6), hash(i + 4)]); }
  const sm = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.025, 0.1, 2, 4), STD('#ffffff'), spr.length); const sc = ['#e53935', '#1e88e5', '#fdd835', '#43a047'];
  spr.forEach((d, i) => { sm.setMatrixAt(i, new THREE.Matrix4().compose(V3(d[0], d[1], d[2]), new THREE.Quaternion().setFromEuler(new THREE.Euler(d[3] * 3, d[3] * 5, 0)), V3(1, 1, 1))); sm.setColorAt(i, new THREE.Color(sc[i % 4])); }); coneG.add(sm);
  coneG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const CONE_HOLD = 2.6;   // tongs grip height above the scoop contact

// sparkle / star sprites
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 60 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#ffffff' })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }

// ---------------- choreography ----------------
const CAR_Z = 0.3;
const carArrive = t => { const u = clamp((t - 0.0) / (tWin1 + 0.25)); return lerp(42, CAR_Z, 1 - Math.pow(1 - u, 2.4)); };
const R0 = [-1.35, 3.75, 0];                // head rest (out of the window)
const HID = [-9.8, 3.4, 0];                 // head inside
// wrong-way car lift: car y
const tBite = tCar2 + 0.35, tLift = tBite + 0.35, tBunLand = tBun + 0.2, tDown = tBunLand + 0.05, tOnBun = tDown + 0.35, tRel = tOnBun + 0.1;
const carYW = mono([[0, 0], [tBite, 0], [tLift + 0.2, 3.3], [tDown, 3.3], [tOnBun, BUN_TOP_Y], [99, BUN_TOP_Y]]);
// head keys (wrong timeline; also used before the rewind target)
const headPW = monoV([[0, HID], [tOut - 0.1, HID], [tTrex - 0.05, [-2.2, 3.6, 0]], [tTrex + 0.35, R0], [tShout, R0], [tShout + 0.25, [-2.0, 3.9, 0]], [tBiggest1, [-1.6, 3.8, 0]], [tBurger1 + 0.3, [-1.1, 3.9, 0]],
  [tLiterally, [-1.3, 3.8, 0]], [tAnd2, [-1.4, 3.9, 0]], [tThing, [-1.2, 4.1, -0.6]], [tYourCar, [-1.0, 3.9, 0.4]], [tCar2 + 0.15, [-0.95, 3.6, 0.3]], [tBite, [-0.75, 2.3, 0.3]],
  [tLift + 0.2, [-0.75, 2.3 + 3.3, 0.3]], [tDown, [-0.75, 2.3 + 3.3, 0.3]], [tOnBun, [-0.75, 2.3 + BUN_TOP_Y, 0.3]], [tRel + 0.35, [-1.7, 4.9, 0.1]],
  [tKetchup - 0.15, [-1.75, 4.95, 0.1]], [tKetchup + 0.05, [-2.4, 5.0, 0.3]], [tOne3 - 0.05, [-2.4, 5.0, 0.3]], [tOne3 + 0.35, [-1.9, 5.3, 0.1]], [99, [-1.9, 5.3, 0.1]]]);
const pitchW = mono([[0, 0], [tTrex, 0.35], [tTrex + 0.5, -0.05], [tShout, -0.05], [tShout + 0.2, 0.15], [tBiggest1, 0.0], [tLiterally, -0.15], [tLiterally + 0.4, 0.05], [tYourCar, -0.4], [tBite, -0.62], [tLift + 0.2, -0.55], [tOnBun, -0.6], [tRel + 0.35, -0.4], [tKetchup, -0.55], [tOne3 + 0.35, -0.35], [99, -0.35]]);
const yawW = mono([[0, 0], [tAnd2, 0], [tBiggest2, 0.5], [tThing, -0.5], [tYourCar, 0.0], [99, 0]]);
// ketchup head path: the bottle tip draws the squiggle on the roof
const squigWorld = u => { const p = sqCurve.getPoint(clamp(u)); return V3(p.x, BUN_TOP_Y + 1.7, CAR_Z + p.z); };
const tSq0 = tKetchup - 0.05, tSq1 = tOne3 - 0.1;
// right-way: tongs / arms / hand schedule
const tBagUp = tThen2 + 0.1, tBagSill = tHand - 0.25, tGrab = tTongs - 0.1;
const C_REST = () => null;
const leanR = mono([[0, 0], [tFree + 0.1, 0], [tExtra - 0.1, 1.25], [tLarge + 0.6, 1.25], [S('right7').start, 0], [99, 0]]);
const SILL_BAG = V3(-2.6, 1.37, 1.55), SILL_FR = V3(-2.6, 1.32, -1.55);
const handOutR = mono([[0, 0], [tHand - 0.25, 0], [tHand + 0.35, 1], [tTongs + 0.15, 1], [tEvery + 0.3, 0], [tBurger4 - 0.3, 0], [tBurger4 - 0.05, 0.75], [tBurger4 + 0.3, 0.75], [tBurger4 + 0.45, 0], [tFries - 0.1, 0], [tFries + 0.15, 0.75], [tFries + 0.45, 0.75], [tFries + 0.6, 0],
  [tAnd4, 0], [tTiny4, 1], [tFive + 0.5, 1], [tFive + 0.9, 0], [99, 0]]);
const handRaiseR = mono([[0, 0], [tAnd4, 0], [tTiny4, 1], [tFive + 0.5, 1], [tFive + 0.9, 0], [99, 0]]);
const handWorld = (t, out, raise) => hero.localToWorld(V3(-0.98 - 0.55 * out, 1.22 + 0.45 * raise, -0.25));
const N_TIP = V3(-1.2, 3.3, 0.2);
const tipKeys = [[0, N_TIP.toArray()], [tGrab + 0.3, N_TIP.toArray()], [tCarries + 0.6, [-1.0, 3.6, 0.3]], [tNow, N_TIP.toArray()], [tReach4 - 0.1, SILL_BAG.toArray()], [tReach4 + 0.15, SILL_BAG.toArray()], [tBurger4 - 0.05, [-0.95, 1.45, 0.05]], [tBurger4 + 0.3, [-0.95, 1.45, 0.05]],
  [tFries - 0.35, SILL_FR.toArray()], [tFries - 0.2, SILL_FR.toArray()], [tFries + 0.12, [-0.95, 1.45, 0.05]], [tFries + 0.45, [-0.95, 1.45, 0.05]], [tAnd4 + 0.1, N_TIP.toArray()], [tHigh - 0.05, [-1.45, 2.05, 0.05]], [tFive, [-1.5, 1.86, 0.05]], [tFive + 0.4, [-1.45, 2.15, 0.05]], [tFive + 0.9, N_TIP.toArray()],
  [tFree - 0.1, [-1.6, 3.2, -0.2]], [tDessert + 0.3, [-0.9, 3.4, -0.3]], [tExtra + 0.1, [0.0, 1.62 + CONE_HOLD + 1.0, CAR_Z]], [tLarge + 0.15, [0.0, 1.62 + CONE_HOLD, CAR_Z]], [tLarge + 0.55, [0.0, 1.62 + CONE_HOLD + 0.1, CAR_Z]], [S('right7').start + 0.3, N_TIP.toArray()], [99, N_TIP.toArray()]];
const tipR = monoV(tipKeys);
const headPR = monoV([[0, R0], [tNicely, R0], [tNicely + 0.3, [-1.2, 3.95, 0]], [tThen2, [-1.3, 3.8, 0]], [tTiny, [-1.9, 3.65, 0]], [tShe2, [-1.6, 3.7, 0.1]], [tHand, [-1.6, 3.75, 0]], [tEvery, [-1.3, 3.9, 0]], [tNow, [-1.35, 3.85, 0]],
  [tFive + 0.5, [-1.35, 3.85, 0]], [tHappy, [-1.2, 4.0, 0]], [tFree, [-1.3, 3.9, 0]], [tExtra, [-1.7, 4.7, 0.6]], [tLarge + 0.6, [-1.6, 4.6, 0.6]], [S('right7').start + 0.3, R0], [99, R0]]);
const pitchR = mono([[0, -0.05], [tThen2, -0.05], [tTiny, -0.7], [tShe2, -0.25], [tHand, -0.3], [tEvery, -0.15], [tNow, -0.35], [tFive + 0.4, -0.35], [tHappy, 0.1], [tFree, -0.1], [tExtra, -0.45], [tLarge + 0.6, -0.5], [S('right7').start + 0.3, 0.0], [99, 0.0]]);

function headState(t) {
  const right = isRight(t);
  const st = { pos: right ? headPR(t) : headPW(t), yaw: right ? 0 : yawW(t), pitch: right ? pitchR(t) : pitchW(t), roll: 0, jaw: 0.05, eyes: 1, brow: 0, browY: 0, tongue: 0, blink: 0, look: 0 };
  // idle breathing / blink
  st.pos.y += 0.05 * Math.sin(t * 2.1); st.roll += 0.03 * Math.sin(t * 1.3);
  const bl = (t % 3.7) < 0.12 ? 1 : 0; st.blink = bl;
  if (!right) {
    st.jaw = Math.max(st.jaw, 0.7 * win(t, tTrex - 0.05, tTrex + 0.6, 0.12));                       // roar
    st.jaw = Math.max(st.jaw, 0.25 * win(t, tIn, tHat + 0.3, 0.1) * Math.abs(Math.sin(t * 9)));   // "order?"
    st.eyes = 1 + 0.4 * win(t, tBiggest1, tGot + 0.6, 0.2) + 0.5 * win(t, tYourCar - 0.1, tBite, 0.15);
    st.brow = -0.25 * win(t, tBig, tLiterally + 0.4, 0.3) + 0.35 * win(t, tYourCar - 0.1, tCar2 + 0.5, 0.15);
    st.jaw = Math.max(st.jaw, 0.6 * win(t, tCar2, tBite, 0.12), 0.45 * win(t, tOnBun, tRel + 0.4, 0.1));
    if (t > tBite - 0.05 && t < tOnBun) st.jaw = 0.12;
    st.tongue = win(t, tTo, S('wrong3').end + 1.4, 0.2);
    st.jaw = Math.max(st.jaw, 0.35 * st.tongue);
    st.yaw += 0.35 * st.tongue * Math.sin((t - tTo) * 5);
    if (t > tSq0 && t < tSq1 + 0.1) { const u = clamp((t - tSq0) / (tSq1 - tSq0)); const p = squigWorld(u); st.pos = p.clone().add(V3(-2.2, 1.6, 0)); st.pitch = -0.62; st.jaw = 0.12; }
  } else {
    st.eyes = 1 + 0.25 * win(t, tNicely - 0.1, tThen2, 0.2) + 0.35 * win(t, tTongs - 0.2, tCarries + 0.5, 0.2);
    st.brow = 0.4 * win(t, tTiny - 0.1, tHand, 0.3) - 0.2 * win(t, tHappy - 0.2, S('right5').end, 0.3);
    st.jaw = Math.max(st.jaw, 0.25 * win(t, tNicely, tThen2, 0.1), 0.35 * win(t, tTongs, tCarries + 0.4, 0.15), 0.4 * win(t, tFive, tFive + 0.7, 0.1), 0.3 * win(t, tHappy, S('right5').end, 0.2), 0.35 * win(t, S('right7').start, TOTAL, 0.3));
    // happy dance
    const dn = win(t, tHappy - 0.1, S('right5').end + 0.2, 0.3); st.pos.z += dn * 0.7 * Math.sin((t - tHappy) * 5.5); st.roll += dn * 0.3 * Math.sin((t - tHappy) * 5.5 + 0.6); st.pos.y += dn * 0.25 * Math.abs(Math.sin((t - tHappy) * 5.5));
    st.yaw += dn * 0.25 * Math.sin((t - tHappy) * 2.75);
    const nod = win(t, tNicely, tThen2 - 0.1, 0.1); st.pitch += 0.25 * nod * Math.sin((t - tNicely) * 14);
    st.tongue = 0.6 * win(t, tCarries - 0.1, tNow, 0.2);
    st.look = win(t, tHand - 0.2, tGrab, 0.2);
  }
  return st;
}

// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const FOL = (o, l, fov = 40) => () => { const z = hero.position.z; return [V3(o[0], o[1], z + o[2]), V3(l[0], l[1], z + l[2]), fov]; };
const WIDE = Ac([6.6, 5.0, -8.8], [-1.3, 2.9, 0.3], 40);
const HEADC = Ac([4.2, 5.5, -7.6], [-0.9, 4.25, 0.1], 36);
const GAP = (z = -6.4, y = 2.7) => Ac([-2.0, y - 0.1, z - 2.0], [-1.85, 2.35, 0.4], 34);
const camKeys = [
  [0.0, Ac([9, 7.5, 32], [-2.5, 3.2, 0], 40)],
  [tYou1 - 0.3, Ac([8.5, 6.8, 27], [-2.4, 3.0, 0], 40)],
  ...cut(tYou1 - 0.25, Ac([6.0, 2.6, 15.0], [-1.2, 2.2, -1.0], 40)),
  [S('hook1').end + 0.25, Ac([5.6, 2.6, 13.0], [-1.2, 2.3, -1.0], 40)],
  ...cut(tThe - 0.1, Ac([8.0, 4.3, -8.8], [-2.4, 3.2, 0.3], 38)),
  [tIn - 0.3, Ac([7.5, 4.4, -8.3], [-2.0, 3.4, 0.3], 38)],
  ...cut(tIn - 0.25, HEADC),
  [tWhat - 0.3, Ac([4.0, 5.5, -7.3], [-0.9, 4.25, 0.1], 36)],
  ...cut(tWhat - 0.25, WIDE),
  [S('wrong1').start - 0.1, Ac([6.4, 5.0, -8.5], [-1.3, 2.9, 0.3], 40)],
  // wrong
  ...cut(S('wrong1').start, Ac([5.4, 3.3, -8.8], [-1.0, 2.9, 0.3], 40)),
  [tBiggest1 - 0.3, Ac([5.2, 3.3, -8.5], [-1.0, 2.9, 0.3], 40)],
  ...cut(tBiggest1 - 0.25, HEADC),
  [S('wrong1').end + 0.2, Ac([4.0, 5.5, -7.3], [-0.9, 4.25, 0.1], 36)],
  ...cut(tBig - 0.1, WIDE),
  [tAnd2 - 0.3, Ac([6.3, 5.0, -8.4], [-1.3, 2.9, 0.3], 40)],
  ...cut(tAnd2 - 0.25, Ac([3.6, 3.1, -7.0], [-1.0, 3.0, 0.2], 40)),
  [tCar2 + 0.1, Ac([3.5, 3.1, -6.8], [-0.8, 2.6, 0.3], 40)],
  ...cut(tCar2 + 0.15, Ac([11.5, 6.6, -15.0], [-0.6, 3.6, 0.3], 40)),
  [tKetchup - 0.3, Ac([11.2, 6.4, -14.6], [-0.6, 3.2, 0.3], 40)],
  ...cut(tKetchup - 0.25, Ac([6.0, 9.0, -7.8], [-0.4, 2.8, 0.3], 40)),
  [tOne3 - 0.2, Ac([5.9, 9.0, -7.6], [-0.4, 2.8, 0.3], 40)],
  ...cut(tOne3 - 0.15, Ac([10.2, 5.4, -13.2], [-0.6, 3.1, 0.3], 40)),
  [tRew0, Ac([9.2, 5.0, -12.0], [-0.6, 3.1, 0.3], 40)],
  // right
  ...cut(tRew1, WIDE),
  [tOrder - 0.2, Ac([6.4, 5.0, -8.5], [-1.3, 2.9, 0.3], 40)],
  ...cut(tOrder - 0.15, Ac([5.4, 3.3, -8.8], [-1.0, 2.9, 0.3], 40)),
  [tThen2 - 0.2, Ac([5.2, 3.3, -8.5], [-1.0, 2.9, 0.3], 40)],
  ...cut(tThen2 - 0.15, GAP(-6.6, 2.8)),
  [tEvery - 0.3, GAP(-6.0, 2.8)],
  ...cut(tEvery - 0.25, Ac([2.8, 4.4, -7.6], [-1.5, 3.2, 0.1], 36)),
  [S('right3').end + 0.2, Ac([2.7, 4.4, -7.3], [-1.5, 3.2, 0.1], 36)],
  ...cut(tNow - 0.15, GAP(-6.6, 2.9)),
    [S('right4').end + 0.2, GAP(-5.9, 2.9)],
  ...cut(tHappy - 0.6, Ac([10.5, 6.5, -13.5], [-4.2, 4.2, 0.6], 42)),
  [tFree - 0.3, Ac([10.0, 6.3, -13.0], [-4.0, 4.2, 0.6], 42)],
  ...cut(tFree - 0.25, Ac([8.6, 6.0, -11.6], [-0.6, 3.9, 0.3], 40)),
  [S('right7').start - 0.1, Ac([8.2, 5.8, -11.0], [-0.5, 3.8, 0.3], 40)],
  ...cut(S('right7').start, FOL([5.4, 4.8, -11.5], [-0.8, 3.0, 2.5])),
  [S('outro').start, FOL([5.0, 5.2, -11.5], [-0.8, 3.2, 2.5])],
  [TOTAL, FOL([5.0, 6.2, -12.5], [-0.9, 3.5, 2.5])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _q = new THREE.Quaternion(), XA = V3(1, 0, 0);
function orientX(obj, from, to) { const d = to.clone().sub(from); const len = d.length(); obj.position.copy(from); obj.quaternion.setFromUnitVectors(XA, d.clone().normalize()); return len; }
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  // car
  let cz = carArrive(t), cy = 0, cx = 0;
  if (right && t > S('right7').start + 0.2) { const dt = t - S('right7').start - 0.2; cz = CAR_Z - (0.45 * dt * dt + 0.6 * dt); }
  if (!right) cy = carYW(t);
  placeCar(hero, { x: cx, z: cz, h: 0 });
  hero.position.y = cy;
  if (!right && cy > 0.01 && t < tOnBun) { hero.rotation.z = 0.06 * Math.sin(t * 6); hero.rotation.x = 0.05 * Math.sin(t * 4.3); }
  hero.userData.hl.emissiveIntensity = 0.5; blink(hero, t, false, false);
  hero.updateMatrixWorld(true);
  // building wiggle
  const wg = right ? win(t, tThe5 - 0.2, S('right5').end + 0.5, 0.3) : 0;
  bld.rotation.z = wg * 0.035 * Math.sin((t - tThe5) * 9); bld.scale.set(1, 1 + wg * 0.035 * Math.sin((t - tThe5) * 18), 1);
  signG.userData.burger.position.y = 2.4 + wg * 0.4 * Math.abs(Math.sin((t - tThe5) * 9)); signG.rotation.y = wg * 0.25 * Math.sin((t - tThe5) * 7);
  // T-rex body (lean) + arms
  const lean = right ? leanR(t) : 0; const emerge = right ? 1 : ramp(t, tOpens + 0.2, tTrex + 0.2); rexBody.position.set(lean * 1.0 - 1.8 * (1 - emerge), 0, 0);
  const st = headState(t);
  hd.position.copy(st.pos); hd.rotation.set(st.roll, st.yaw, st.pitch, 'YZX');
  RX.jaw.rotation.z = -0.9 * st.jaw;
  RX.eyes.forEach(E => { E.w.scale.set(st.eyes, st.eyes * (1 - 0.9 * st.blink), st.eyes); E.p.scale.setScalar((1 - st.blink) * (0.9 + 0.25 * (st.eyes - 1))); E.hl.visible = !st.blink; E.p.position.copy(E.c0).addScaledVector(E.p0.clone().sub(E.c0), st.eyes); E.hl.position.copy(E.c0).addScaledVector(E.h0.clone().sub(E.c0), st.eyes);
    E.br.position.y = 0.98 + 0.12 * (st.eyes - 1); E.br.rotation.x = E.s * 0.35 * st.brow; });
  RX.tongue.position.x = 1.3 + 1.2 * st.tongue; RX.tongue.position.y = 0.08 + 0.1 * st.tongue; RX.tongue.rotation.y = 0.5 * st.tongue * Math.sin(t * 8);
  RX.cap.position.y = 0.98 + 0.25 * (!right ? win(t, tTrex - 0.05, tTrex + 0.4, 0.08) : 0) + 0.12 * (right ? win(t, tHappy, S('right5').end, 0.2) * Math.abs(Math.sin(t * 11)) : 0);
  // neck
  hd.updateMatrixWorld(true);
  const nb = V3(-4.6 + lean - 1.8 * (1 - emerge), 2.9, 0), na = hd.localToWorld(V3(-0.75, -0.1, 0)); const ctl = V3((nb.x + na.x) / 2 - 0.3, Math.max(nb.y, na.y) + 0.6, (nb.z + na.z) / 2);
  neckS.forEach((m, i) => { const u = i / (neckS.length - 1); const p = nb.clone().multiplyScalar((1 - u) * (1 - u)).add(ctl.clone().multiplyScalar(2 * u * (1 - u))).add(na.clone().multiplyScalar(u * u)); m.position.copy(p); m.scale.setScalar(lerp(0.95, 0.66, u)); });
  // tiny arms: reach toward the claw target
  let clawT;   // where the claws are
  const reach = right ? Math.max(win(t, tThen2 + 0.0, tHand + 0.4, 0.3), win(t, tHand, 99, 0.3)) : 0.25 + 0.2 * win(t, tTrex, tWhat, 0.3);
  const tremble = right ? 0.05 * win(t, tTiny, tHand, 0.2) * Math.sin(t * 38) : 0;
  RX.arms.forEach(A => { const sh = A.sh.clone().add(V3(lean - 1.8 * (1 - emerge), 0, 0)); const dirRest = V3(0.45, -0.85, 0.15 * A.s).normalize(), dirFwd = V3(0.95, -0.1 + tremble, -0.05 * A.s).normalize();
    const d = dirRest.clone().lerp(dirFwd, reach).normalize(); if (right && t > tGrab) d.lerp(tipR(t).sub(sh).normalize(), 0.35).normalize();
    A.g.position.copy(sh); A.g.quaternion.setFromUnitVectors(XA, d);
    // little flaps while dancing / waving
    if (right) { const wv = win(t, tHappy - 0.1, S('right5').end, 0.3) + win(t, S('right7').start, TOTAL, 0.3); A.g.rotateZ(wv * 0.4 * Math.sin(t * 11 + A.s)); } });
  rexBody.updateMatrixWorld(true);
  clawT = RX.arms[0].hand.getWorldPosition(V3()).add(RX.arms[1].hand.getWorldPosition(V3())).multiplyScalar(0.5).add(V3(0.1, 0, 0));
  // driver arm
  const hOut = right ? handOutR(t) : 0, hRaise = right ? handRaiseR(t) : 0;
  armG.visible = hOut > 0.02;
  { const base = V3(-0.82, 1.22, -0.25), hp = V3(-0.98 - 0.55 * hOut, 1.22 + 0.45 * hRaise, -0.25); const len = base.distanceTo(hp);
    sleeve.position.copy(base.clone().add(hp).multiplyScalar(0.5)); sleeve.quaternion.setFromUnitVectors(V3(0, 1, 0), hp.clone().sub(base).normalize()); sleeve.scale.set(1, len, 1);
    handM.position.copy(hp); handM.rotation.set(hRaise * -0.3, 0, hRaise * 1.2); }
  const handW = handWorld(t, hOut, hRaise);
  // tongs
  tongs.visible = right && t > tHand - 0.25;
  let tip = null;
  if (tongs.visible) {
    if (t < tGrab) { tip = handW.clone(); const dir = clawT.clone().sub(tip).normalize(); const base = tip.clone().addScaledVector(dir, TONG_L); orientX(tongs, base, tip); tongs.scale.set(1, 1, 1); }
    else { const g = clamp((t - tGrab) / 0.35); let tgt = tipR(t); if (t < tGrab + 0.35) tgt = handW.clone().lerp(tgt, ease(g));
      const dn = win(t, tHappy - 0.1, S('right5').end + 0.2, 0.3); tgt.add(V3(0, dn * 0.5 * Math.sin((t - tHappy) * 11), dn * 0.6 * Math.sin((t - tHappy) * 5.5)));
      const wv = win(t, S('right7').start + 0.4, TOTAL, 0.4); tgt.add(V3(0, wv * 0.5 * Math.sin(t * 7), wv * 0.6 * Math.sin(t * 3.5)));
      tip = tgt; const len = orientX(tongs, clawT, tip); tongs.scale.set(len / TONG_L, 1, 1); }
    const open = right ? (0.12 + 0.18 * win(t, tCarries - 0.3, tNow, 0.1) * Math.abs(Math.sin(t * 9)) + 0.15 * win(t, tFive + 0.05, tFive + 0.35, 0.05)) : 0.12;
    TONGA.forEach(a => { a.rotation.y = a.userData.s * open * 0.5; });
    tongs.updateMatrixWorld(true); }
  // bag + fries
  bag.visible = right && t > tBagUp && t < tBurger4 + 0.35; fries.visible = right && t > tProblem && t < tFries + 0.4;
  if (bag.visible) { const sc = back(clamp((t - tBagUp) / 0.3)); bag.scale.setScalar(Math.max(0.01, sc) * (t > tBurger4 + 0.15 ? 1 - clamp((t - tBurger4 - 0.15) / 0.2) : 1) + 0.001);
    const inClaw = clawT.clone().add(V3(0.05, -0.2, 0)); let p;
    if (t < tBagSill) p = inClaw; else if (t < tReach4 + 0.05) p = inClaw.lerp(SILL_BAG, ease(clamp((t - tBagSill) / 0.4))); else if (t < tBurger4 + 0.1) p = SILL_BAG.clone().lerp(tip ? tip.clone().add(V3(0, -0.1, 0)) : SILL_BAG, ease(clamp((t - tReach4 - 0.05) / 0.15))); else p = handW.clone();
    bag.position.copy(p); bag.rotation.set(0, 0.3, (t > tReach4 && t < tBurger4) ? 0.15 * Math.sin(t * 9) : 0); }
  if (fries.visible) { const sc = back(clamp((t - tProblem) / 0.3)); fries.scale.setScalar(Math.max(0.01, sc) * (t > tFries + 0.2 ? 1 - clamp((t - tFries - 0.2) / 0.2) : 1) + 0.001);
    let p = SILL_FR.clone(); if (t > tFries - 0.25 && t < tFries + 0.2 && tip) p = SILL_FR.clone().lerp(tip.clone().add(V3(0, -0.05, 0)), ease(clamp((t - tFries + 0.25) / 0.12))); else if (t >= tFries + 0.2) p = handW.clone();
    fries.position.copy(p); }
  // ice-cream cone
  coneG.visible = right && t > tFree - 0.05;
  if (coneG.visible) { const sc = back(clamp((t - tFree + 0.05) / 0.35));
    if (t < tLarge + 0.25 && tip) { coneG.position.copy(tip).add(V3(0, -CONE_HOLD, 0)); coneG.rotation.set(0.05 * Math.sin(t * 6), 0, 0.05 * Math.sin(t * 5)); coneG.scale.set(sc, sc, sc); }
    else { coneG.position.copy(hero.localToWorld(V3(0, 1.62, 0))); const sq = win(t, tLarge + 0.2, tLarge + 0.7, 0.15); const wob = clamp(t - tLarge - 0.25); coneG.rotation.set(0.12 * Math.sin(t * 7) * (1 - 0.5 * wob), 0, 0.08 * Math.sin(t * 5.5)); coneG.scale.set(1 + 0.12 * sq, 1 - 0.15 * sq, 1 + 0.12 * sq); } }
  // wrong-way burger stack
  const bunU = !right ? clamp((t - (tBun - 0.25)) / (tBunLand - tBun + 0.25)) : 0;
  botBun.visible = !right && t > tBun - 0.25;
  if (botBun.visible) { const p0 = V3(-3.0, 2.2, 0), p1 = V3(0, 0, CAR_Z); const p = p0.clone().lerp(p1, ease(bunU)); p.y += 3.0 * Math.sin(Math.PI * bunU); botBun.position.copy(p); botBun.rotation.set(0, bunU * 3, 0); const sq = win(t, tBunLand, tBunLand + 0.35, 0.1); botBun.scale.set(1 + 0.1 * sq, 1 - 0.18 * sq, 1 + 0.1 * sq); }
  const chU = !right ? clamp((t - (tCheese - 0.05)) / 0.35) : 0;
  cheese.visible = !right && t > tCheese - 0.05;
  if (cheese.visible) { const drapeU = easeOut(clamp((t - tCheese - 0.3) / 0.45)); const p0 = V3(-3.0, 2.8, 0), p1 = V3(0, BUN_TOP_Y + 0.0, CAR_Z); const p = p0.lerp(p1, ease(chU)); p.y += 2.5 * Math.sin(Math.PI * chU) + (chU < 1 ? 0.8 * (1 - chU) : 0); drapeCheese(drapeU, p.x, p.y, p.z, 0.5 * (1 - chU)); }
  squig.visible = !right && t > tSq0;
  if (squig.visible) { const u = clamp((t - tSq0) / (tSq1 - tSq0)); squig.geometry.setDrawRange(0, Math.floor(u * sqGeo.index.count / 3) * 3); squig.position.set(0, BUN_TOP_Y + 1.7, CAR_Z); }
  ketch.visible = !right && t > tSq0 - 0.35 && t < tSq1 + 0.3; if (ketch.visible) { ketch.scale.setScalar(Math.max(0.01, back(clamp((t - tSq0 + 0.35) / 0.25)) * (1 - clamp((t - tSq1 - 0.1) / 0.2)))); ketch.rotation.z = 0.62; }
  const tbU = !right ? clamp((t - (tOne3 - 0.1)) / 0.45) : 0;
  topBun.visible = !right && t > tOne3 - 0.1;
  if (topBun.visible) { const p0 = V3(-3.0, 3.6, 0), p1 = V3(0, BUN_TOP_Y + 1.74, CAR_Z); const p = p0.lerp(p1, ease(tbU)); p.y += 3.2 * Math.sin(Math.PI * tbU); topBun.position.copy(p); topBun.rotation.set(0, tbU * 2.5, 0); const sq = win(t, tOne3 + 0.35, tOne3 + 0.75, 0.12); topBun.scale.set(1 + 0.08 * sq, 1 - 0.15 * sq, 1 + 0.08 * sq); }
  flag.visible = !right && t > tTo - 0.05; if (flag.visible) { const k = back(clamp((t - tTo + 0.05) / 0.3)); flag.position.set(0.2, BUN_TOP_Y + 1.74 + 0.9, CAR_Z + 0.2); flag.scale.setScalar(Math.max(0.01, k) * 2.0); flag.rotation.set(0, 2.5, 0.08 * Math.sin(t * 3)); }
  // crumbs/sparkles when parts land
  if (!right) for (const [tl, y] of [[tBunLand, 0.4], [tCheese + 0.3, 2.5], [tOne3 + 0.35, 3.4]]) { const dt = t - tl; if (dt > 0 && dt < 0.6) for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; puff(V3(Math.cos(a) * (2.6 + dt * 2), y + dt * 0.8, CAR_Z + Math.sin(a) * (2.6 + dt * 2)), 0.9 + dt, 0.55 * (1 - dt / 0.6), '#fff3d6'); } }
  // high-five sparkle
  if (right) { const dt = t - tFive; if (dt > 0 && dt < 0.6) for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; puff(handW.clone().add(V3(Math.cos(a) * 0.1, Math.sin(a) * (0.2 + dt * 1.5), Math.cos(a) * (0.2 + dt * 1.5))), 0.25, 0.9 * (1 - dt / 0.6), '#fff59d'); } }
  // window shutter (rolls up at 'opens')
  shutter.visible = !(right) && t < tOpens + 0.7; if (shutter.visible) { const u = clamp((t - tOpens + 0.1) / 0.6); shutter.scale.y = Math.max(0.02, 1 - u); shutter.position.y = 5.0 - 2.0 * (1 - u); }
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? Math.max(win(t, tTrex - 0.05, tTrex + 0.4, 0.05) * 0.4, win(t, tBunLand - 0.03, tBunLand + 0.25, 0.05) * 0.4, win(t, tOne3 + 0.3, tOne3 + 0.6, 0.05) * 0.4) : win(t, tWiggles - 0.6, tWiggles + 0.3, 0.1) * 0.3;
  applyCam(c, t, shk > 0.02 ? 0.05 * shk : 0);
  camera.updateMatrixWorld(true);
  screen = { head: project(hd.localToWorld(V3(0.4, 1.4, 0))), car: project(hero.localToWorld(V3(0, 1.8, 0))), carWin: project(hero.localToWorld(V3(-0.95, 1.3, -0.25))), claw: project(clawT), hand: project(handW),
    bag: project(bag.position), burger: project(V3(0, BUN_TOP_Y + 3.4, CAR_Z)), tip: tip ? project(tip) : null };
}
// shutter mesh (in the window)
const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.0, 4.4), STD('#b0bec5', { metalness: 0.5, roughness: 0.4 })); shutter.position.set(-2.95, 3.0, 0); shutter.castShadow = true; scene.add(shutter);
{ const st = canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#cfd8dc'; c.fillRect(0, 0, w, h); c.fillStyle = '#90a4ae'; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 4); }, true); st.repeat.set(1, 4); shutter.material.map = st; shutter.material.color.set('#ffffff'); }

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
function gapArrow(a, b, t, t0, t1, label) {   // red double arrow between two screen points + label
  if (t < t0 || t > t1 || !a || !b || !a.ok || !b.ok) return; const f = win(t, t0, t1, 0.2), k = clamp((t - t0) / 0.35);
  const bx = lerp(a.x, b.x, k), by = lerp(a.y, b.y, k);
  ctx.save(); ctx.globalAlpha = f; ctx.strokeStyle = '#000'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bx, by); ctx.stroke();
  ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.setLineDash([26, 18]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
  if (k >= 1) { ctx.font = '900 54px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 12; ctx.strokeStyle = '#000'; const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 70; ctx.strokeText(label, mx, my); ctx.fillStyle = YEL; ctx.fillText(label, mx, my); }
  ctx.restore(); }
function notes(t, a, b) { if (t < a || t > b) return; for (let k = 0; k < 6; k++) { const ph = ((t - a) * 0.6 + k / 6) % 1; const x = 180 + (k * 157) % 760, y = 1050 - ph * 520; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * ph) * win(t, a, b, 0.3); ctx.font = '900 90px Inter'; ctx.textAlign = 'center'; ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(k % 2 ? '♪' : '♫', x, y); ctx.fillStyle = ['#ffd60a', '#ff5ec4', '#39ff4a'][k % 3]; ctx.fillText(k % 2 ? '♪' : '♫', x, y); ctx.restore(); } }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('DRIVE-THROUGH', '#c62828', tDrive - 0.15, S('hook1').end + 0.3, 60);
    P_('STAFF: T-REX', '#2e7d32', tTrex - 0.05, tIn - 0.1, 62);
    P_('PAPER HAT', '#455a64', tPaper - 0.1, S('hook2').end + 0.3, 58, iconCheck);
    bubble('ROAAAR!', screen.head, t, tTrex + 0.05, tIn - 0.15, 64, '#fff', '#2e7d32', -60);
    bubble('YOUR ORDER?', screen.head, t, tIn + 0.1, tWhat - 0.15, 54, '#fff', '#2e7d32', -60);
    bubble('THE BIGGEST BURGER YOU\'VE GOT!', screen.carWin, t, tShout + 0.15, S('wrong1').end + 0.3, 40, '#fff', '#c62828', -170);
    P_('SHOUTED ORDER', RED, tMost - 0.1, S('wrong1').end + 0.3, 60, iconWarn);
    P_('T-REX = VERY LITERAL', RED, tTrex2 - 0.15, tAnd2 - 0.1, 54, iconWarn);
    P_('BIGGEST THING HERE: YOUR CAR', RED, tBiggest2 - 0.1, tBun - 0.1, 44, iconX);
    floatText('BUN!', 300, 820, t, tBun, tBun + 0.9, 110, YEL, -0.15); floatText('CHEESE!', 720, 700, t, tCheese, tCheese + 0.9, 110, YEL, 0.1); floatText('KETCHUP!', 540, 900, t, tKetchup, tKetchup + 0.9, 110, '#ff5252', -0.06);
    P_('1 GIANT CAR BURGER', RED, tOne3 - 0.1, tTo - 0.1, 58, iconX);
    bubble('ORDER UP!', screen.head, t, tGo + 0.1, tRew0 - 0.1, 56, '#fff', '#2e7d32', -150);
  } else {
    bubble('ONE BURGER, PLEASE!', screen.carWin, t, tOrder - 0.05, tThen2 - 0.1, 46, '#fff', '#1565c0', -170);
    P_('ORDER NICELY', GREEN, tOrder - 0.1, tThen2 - 0.15, 60, iconCheck);
    P_('PROBLEM: TINY ARMS', '#e65100', tTiny - 0.15, S('right2').end + 0.3, 56, iconWarn);
    gapArrow(screen.claw, screen.carWin, t, tShe2 - 0.1, S('right2').end + 0.3, "CAN'T REACH!");
    P_('BARBECUE TONGS', '#1565c0', tBbq - 0.15, tEvery - 0.1, 60);
    P_('ESSENTIAL DRIVER KIT', '#455a64', tEvery - 0.1, S('right3').end + 0.3, 54, iconCheck);
    bubble('CLACK CLACK!', screen.tip, t, tCarries - 0.2, S('right3').end + 0.2, 52, '#fff', '#1565c0', -90);
    P_('BURGER', GREEN, tBurger4 - 0.1, tFries - 0.1, 64, iconCheck);
    P_('FRIES', GREEN, tFries - 0.1, tAnd4 - 0.1, 64, iconCheck);
    P_('TINY HIGH FIVE', '#f9a825', tTiny4 - 0.1, S('right4').end + 0.3, 60, iconHeart);
    floatText('HIGH FIVE!', W / 2, 760, t, tFive, tFive + 1.0, 100, YEL, -0.08);
    P_('HAPPY DANCE', '#8e24aa', tDance - 0.4, tThe5 - 0.1, 62);
    P_('WHOLE RESTAURANT WIGGLES', '#8e24aa', tThe5 - 0.1, S('right5').end + 0.3, 48);
    notes(t, tHappy, S('right5').end + 0.4);
    P_('FREE DESSERT', '#d81b60', tFree - 0.1, tExtra - 0.1, 62, iconHeart);
    P_('EXTRA LARGE', '#d81b60', tExtra - 0.1, S('right7').start - 0.1, 66, iconHeart);
  }
}
window.dbg = { headState, tipR };
start(update, hud);
