// Episode 58: Old town drawbridge – the bridge opens with you on it
// hook (old style): crossing the old bridge into town, halfway across a bell starts ringing -> the barriers come down behind you,
//        the bridge is opening, with you on it
// wrong: full throttle, jump it like in the movies -> the ramp gets steeper and steeper, you fly, really high -> over the river,
//        right into the swimming pool of a cruise ship, splash -> next stop: Australia
// right: stop, engine off, handbrake on, hold on to your coffee -> up you go, best view in town -> the cruise ship glides past underneath,
//        everybody waves, the captain salutes and sounds the horn just for you -> he throws you his captain's hat
//        -> the bridge comes down, you drive into town as captain of the road
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, topExtrude,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI, DEG = PI / 180;
// ---------------- timing ----------------
const tCrossing = WT('hook1', 'crossing'), tTown = WT('hook1', 'town'), tHalfway = WT('hook1', 'Halfway'), tBell = WT('hook1', 'bell'), tRinging = WT('hook1', 'ringing');
const tBarriers = WT('hook2', 'barriers'), tBehind = WT('hook2', 'Behind'), tBridge = WT('hook2', 'bridge'), tOpening = WT('hook2', 'opening'), tWith = WT('hook2', 'With'), tWhat = WT('hook2', 'What');
const tFull = WT('wrong1', 'full'), tJump = WT('wrong1', 'Jump'), tMovies = WT('wrong1', 'movies');
const tBig = WT('wrong2', 'Big'), tRamp = WT('wrong2', 'ramp'), tSteeper = WT('wrong2', 'steeper'), tFly = WT('wrong2', 'fly'), tReally = WT('wrong2', 'Really');
const tOver = WT('wrong3', 'Over'), tSwim = WT('wrong3', 'swimming'), tCruise = WT('wrong3', 'cruise'), tSplash = WT('wrong3', 'Splash'), tNext = WT('wrong3', 'Next'), tAus = WT('wrong3', 'Australia');
const tStop = WT('right2', 'Stop'), tEngine = WT('right2', 'Engine'), tHand = WT('right2', 'Handbrake'), tHold = WT('right2', 'Hold'), tCoffee = WT('right2', 'coffee');
const tUp = WT('right3', 'Up'), tBest = WT('right3', 'Best');
const tGlides = WT('right4', 'glides'), tEvery = WT('right4', 'Everybody'), tCaptain = WT('right4', 'captain'), tSalutes = WT('right4', 'salutes'), tSounds = WT('right4', 'sounds'), tHorn = WT('right4', 'horn'), tJust = WT('right4', 'just');
const tImpressed = WT('right5', 'impressed'), tThrows = WT('right5', 'throws'), tHat = WT('right5', 'hat');
const tComes = WT('right6', 'comes'), tDrive = WT('right6', 'drive'), tCapt6 = WT('right6', 'captain');
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

// ---------------- layout ----------------
const LANE = 1.75, HALF = 20, WATER = -5, LEAF_W = 10;
const S_CAR = 10;                       // hero stops 10 m onto the near leaf
// ---------------- world ----------------
scene.fog.near = 260; scene.fog.far = 900;
plane(-700, 700, HALF, 700, L('#9aa18f'), 0, 30);        // near bank (town ground)
plane(-700, 700, -700, -HALF, L('#9aa18f'), 0, 30);      // far bank
plane(-3.8, 3.8, HALF, 700, asphaltMat, 0.04, 7); plane(-3.8, 3.8, -700, -HALF, asphaltMat, 0.04, 7);
plane(-700, 700, HALF + 0.5, HALF + 5, L('#c9c1b2'), 0.03, 10); plane(-700, 700, -HALF - 5, -HALF - 0.5, L('#c9c1b2'), 0.03, 10); // quays
{ const g = new THREE.PlaneGeometry(0.15, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -698; z < 698; z += 7) if (Math.abs(z) > HALF + 1) dl.push([0, 0.06, z]); instanced(g, markMat, dl, false); }
// river + quay walls
const waterM = new THREE.MeshStandardMaterial({ color: '#2f7aa6', roughness: 0.12, metalness: 0.15, envMapIntensity: 1.2 });
const waterT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(160,200,230,${0.25 + R() * 0.4})`; c.fillRect(R() * w, R() * h, 10 + R() * 30, 2); } }, true);
waterM.map = waterT; waterT.repeat.set(60, 4);
{ const g = new THREE.PlaneGeometry(1400, 2 * HALF); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, waterM); m.position.y = WATER; m.receiveShadow = true; scene.add(m); }
{ const stoneT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#9b8f7e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7d7262'; c.lineWidth = 3; for (let y = 0; y < h; y += 21) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 21 % 2) * 20; x < w; x += 40) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 21); c.stroke(); } } }, true);
  stoneT.repeat.set(250, 1); const sm = L('#ffffff', { map: stoneT });
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(1400, 6, 1), sm); m.position.set(0, -3, s * (HALF + 0.5)); m.receiveShadow = true; scene.add(m); } }
// town houses along both quays
{ const R = rng(588); const facade = (seed, col) => canvasTex(128, 256, (c, w, h) => { const r = rng(seed); c.fillStyle = col; c.fillRect(0, 0, w, h); for (let y = 24; y < h - 50; y += 52) for (let x = 14; x < w - 20; x += 38) { c.fillStyle = '#f7f3ea'; c.fillRect(x - 3, y - 3, 26, 36); c.fillStyle = r() < 0.3 ? '#ffe2a0' : '#3a4a5c'; c.fillRect(x, y, 20, 30); } c.fillStyle = '#5b3a22'; c.fillRect(w / 2 - 14, h - 46, 28, 46); });
  const cols = ['#e8b4a0', '#f2d48a', '#a9c8e0', '#e7e0d0', '#c9a6d6', '#b8d8a8', '#f0a878', '#d8c0a0', '#e2a6a6'];
  const roofM = [L('#8a3b2a'), L('#5d4a44'), L('#a24b2e')];
  for (const side of [-1, 1]) for (const zs of [1]) for (let x = -170; x < 170;) { const w = 6 + R() * 3, h = 8 + R() * 7, d = 9; if (Math.abs(x + w / 2) < 9) { x += 20; continue; }
    const z = side * (HALF + 5.5 + d / 2); const g = new THREE.Group(); g.position.set(x + w / 2, 0, z); scene.add(g);
    const col = cols[Math.floor(R() * cols.length)]; const ft = facade(Math.floor(R() * 1e6), col); ft.repeat.set(1, 1);
    const mats = [L(col), L(col), L(col), L(col), L(col), L(col)]; const front = side > 0 ? 5 : 4; mats[front] = L('#ffffff', { map: ft });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); b.position.y = h / 2; b.castShadow = b.receiveShadow = true; g.add(b);
    const shp = new THREE.Shape(); shp.moveTo(-w / 2 - 0.2, 0); shp.lineTo(0, w * 0.55); shp.lineTo(w / 2 + 0.2, 0); shp.lineTo(-w / 2 - 0.2, 0);
    const rg = new THREE.ExtrudeGeometry(shp, { depth: d + 0.4, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.4) / 2); const rf = new THREE.Mesh(rg, roofM[Math.floor(R() * 3)]); rf.position.y = h; rf.castShadow = true; g.add(rf);
    x += w + 0.15; }
  // church on the far side
  const ch = new THREE.Group(); ch.position.set(-26, 0, -52); scene.add(ch);
  const tw = new THREE.Mesh(new THREE.BoxGeometry(6, 26, 6), L('#d9cdb8')); tw.position.y = 13; tw.castShadow = true; ch.add(tw);
  const sp = new THREE.Mesh(new THREE.ConeGeometry(4.6, 12, 4), L('#3f6b5a')); sp.position.y = 32; sp.rotation.y = PI / 4; sp.castShadow = true; ch.add(sp);
  const clk = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), L('#f6f0dc')); clk.position.set(0, 21, 3.02); ch.add(clk);
  const nave = new THREE.Mesh(new THREE.BoxGeometry(10, 12, 18), L('#e4d8c2')); nave.position.set(0, 6, -11); nave.castShadow = true; ch.add(nave);
  // trees behind
  const tg = new THREE.IcosahedronGeometry(2.6, 1); const tl = []; const RT = rng(9); for (let i = 0; i < 260; i++) { const x = (RT() - 0.5) * 500, z = (RT() < 0.5 ? 1 : -1) * (50 + RT() * 200); if (Math.abs(x) < 12) continue; tl.push([x, 3.2, z, RT() * 3, 1 + RT() * 0.6, 1 + RT() * 0.6, 1 + RT() * 0.6]); }
  instanced(tg, L('#4f9a3a', { flatShading: true }), tl); }

// ---------------- the bascule bridge ----------------
const leafMat = L('#ffffff', { map: asphaltMat.map });
const steelM = STD('#2f5d50', { roughness: 0.6 }), underM = L('#8a9098');
function makeLeaf(sign) { // sign +1: near leaf (hinge at z=+HALF, tip towards -z)
  const pivot = new THREE.Group(); pivot.position.set(0, 0, sign * HALF); scene.add(pivot);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(LEAF_W, 1.1, HALF), underM); deck.position.set(0, -0.55, -sign * HALF / 2); deck.castShadow = deck.receiveShadow = true; pivot.add(deck);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(7.6, HALF), asphaltMat); top.rotation.x = -PI / 2; top.position.set(0, 0.02, -sign * HALF / 2); top.receiveShadow = true; pivot.add(top);
  for (let k = 0; k < 3; k++) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 3), markMat); ln.rotation.x = -PI / 2; ln.position.set(0, 0.04, -sign * (3 + k * 7)); pivot.add(ln); }
  for (const x of [-4.5, 4.5]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, HALF), L('#bdb5a6')); sw.position.set(x, 0.12, -sign * HALF / 2); sw.receiveShadow = true; pivot.add(sw);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, HALF), steelM); rail.position.set(x + Math.sign(x) * 0.45, 1.15, -sign * HALF / 2); pivot.add(rail);
    for (let z = 0.5; z < HALF; z += 2.4) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), steelM); p.position.set(x + Math.sign(x) * 0.45, 0.6, -sign * z); pivot.add(p); }
    // steel truss girders on the side
    const gir = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, HALF), steelM); gir.position.set(Math.sign(x) * 5.2, -0.2, -sign * HALF / 2); gir.castShadow = true; pivot.add(gir); }
  pivot.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return pivot;
}
const leafN = makeLeaf(1), leafF = makeLeaf(-1);
// hinge towers + bell
const bell = new THREE.Group();
{ const st = L('#b8a88e'), rf = L('#7a3b2a');
  for (const zs of [-1, 1]) for (const xs of [-1, 1]) { const g = new THREE.Group(); g.position.set(xs * 7.4, 0, zs * (HALF + 2.2)); scene.add(g);
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.4, 9, 3.4), st); b.position.y = 4.5; b.castShadow = b.receiveShadow = true; g.add(b);
    const r = new THREE.Mesh(new THREE.ConeGeometry(2.8, 3.2, 4), rf); r.position.y = 10.6; r.rotation.y = PI / 4; r.castShadow = true; g.add(r);
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.9), L('#33465a')); w.position.set(-xs * 1.72, 6, 0); g.add(w);
    if (zs > 0 && xs < 0) { bell.position.set(0, 12.6, 0); g.add(bell); const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 1.6), L('#3b2a1a')); yoke.position.set(0, 13.2, 0); g.add(yoke);
      const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.6, 0.9, 16, 1, true), STD('#d4a017', { metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide })); bm.position.y = -0.2; bell.add(bm); bell.position.y = 13.2;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), L('#3b2a1a')); post.position.set(0, 12.4, 0.75); g.add(post); const post2 = post.clone(); post2.position.z = -0.75; g.add(post2); } } }
// barriers + warning lights
const stripeT = canvasTex(256, 32, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e11d2e'; c.fillRect(i * 32, 0, 32, h); } });
const barriers = [], lamps = [];
for (const zs of [1, -1]) for (const xs of [1, -1]) { const g = new THREE.Group(); g.position.set(xs * 4.6, 0, zs * (HALF + 6.5)); scene.add(g);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.4), L('#e8e8e8')); post.position.y = 0.7; g.add(post);
  const arm = new THREE.Group(); arm.position.y = 1.15; g.add(arm); const a = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.26, 0.18), L('#ffffff', { map: stripeT })); a.position.x = -xs * 2.1; arm.add(a); barriers.push({ arm, xs });
  const lp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.6, 0.18), L('#222')); lp.position.set(xs * 0.9, 1.3, 0); g.add(lp);
  for (const k of [0, 1]) { const m = new THREE.MeshBasicMaterial({ color: '#330000', toneMapped: false }); const l = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), m); l.position.set(xs * 0.9 + (k ? 0.12 : -0.12), 2.2, zs * 0.1); l.rotation.y = zs > 0 ? 0 : PI; g.add(l); lamps.push({ m, k }); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- the cruise ship ----------------
const ship = new THREE.Group(); scene.add(ship);
const POOL = V3(19, 2.05, 0), CAPT = V3(-25.5, 12.5, 4.3);
{ const hs = new THREE.Shape(); hs.moveTo(-35, -6.5); hs.lineTo(16, -7); hs.quadraticCurveTo(31, -6.2, 37, 0); hs.quadraticCurveTo(31, 6.2, 16, 7); hs.lineTo(-35, 6.5); hs.quadraticCurveTo(-36.6, 0, -35, -6.5);
  const hull = new THREE.Mesh(topExtrude(hs, 9, 0.3), STD('#1d2b4a', { roughness: 0.5 })); hull.position.y = -2.5; ship.add(hull);
  const band = new THREE.Mesh(topExtrude(hs, 1.6, 0.1), STD('#f5f5f5', { roughness: 0.4 })); band.scale.set(1.004, 1, 1.01); band.position.y = 1.2; ship.add(band);
  const boot = new THREE.Mesh(topExtrude(hs, 0.8, 0.05), STD('#b3261e')); boot.scale.set(1.004, 1, 1.01); boot.position.y = WATER + 0.25; ship.add(boot);
  const deckS = new THREE.ShapeGeometry(hs); deckS.rotateX(PI / 2); const deck = new THREE.Mesh(deckS, L('#c9a77a', { side: THREE.DoubleSide })); deck.scale.set(0.98, 1, 0.95); deck.position.y = 2.06; ship.add(deck);
  // pool
  const rim = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.5, 6.0), L('#f2f2f2')); rim.position.set(POOL.x, 2.2, 0); ship.add(rim);
  const pw = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.52, 5.0), new THREE.MeshStandardMaterial({ color: '#3fc6e8', roughness: 0.1, emissive: '#0b5f7a', emissiveIntensity: 0.4 })); pw.position.set(POOL.x, 2.22, 0); ship.add(pw);
  for (const [x, z, c] of [[13.5, -4.6, '#ff7043'], [13.5, 4.6, '#ffd54f'], [25, -4.4, '#4fc3f7']]) { const ch = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.8), L(c)); ch.position.set(x, 2.45, z); ship.add(ch);
    const um = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.7, 8), L(c)); um.position.set(x, 4.5, z); ship.add(um); const up = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4), L('#eee')); up.position.set(x, 3.3, z); ship.add(up); }
  // superstructure with windows
  const winT = (n) => canvasTex(512, 64, (c, w, h) => { c.fillStyle = '#f7f7f4'; c.fillRect(0, 0, w, h); for (let x = 8; x < w; x += 512 / n) { c.fillStyle = '#26415e'; c.fillRect(x, 18, 512 / n - 14, 28); } }, true);
  const blocks = [[-32, -2, 2, 5.5, 6.0], [-30, -4, 5.5, 9, 5.5], [-27, -6, 9, 12.5, 5.0], [-9.5, -5.5, 12.5, 15, 4.0]];
  blocks.forEach(([x0, x1, y0, y1, hw], i) => { const tx = winT(16); tx.repeat.set((x1 - x0) / 10, 1); const tz = winT(4); const mats = [L('#f7f7f4', { map: tz }), L('#f7f7f4', { map: tz }), L('#f7f7f4'), L('#f7f7f4'), L('#f7f7f4', { map: tx }), L('#f7f7f4', { map: tx })];
    const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, 2 * hw), mats); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); ship.add(b);
    const rl = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.9, 0.06), new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.5 })); rl.position.set((x0 + x1) / 2, y1 + 0.45, hw - 0.1); ship.add(rl); });
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 15), L('#f7f7f4')); wing.position.set(-7.2, 12.55, 0); ship.add(wing);
  const fn = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 7, 20), L('#d32f2f')); fn.scale.z = 0.7; fn.position.set(-20, 16, 0); ship.add(fn);
  const ft = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 1.2, 20), L('#1b1b1b')); ft.scale.z = 0.7; ft.position.set(-20, 19.9, 0); ship.add(ft);
  const nm = canvasTex(512, 64, (c, w, h) => { c.fillStyle = '#1d2b4a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = '900 44px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MS  SUNSHINE', w / 2, h / 2 + 2); });
  const name = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.5), new THREE.MeshBasicMaterial({ map: nm })); name.position.set(22, -0.4, 6.75); name.rotation.y = 0.12; ship.add(name);
  ship.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
// passengers (waving) on the +z side
const PAX = []; { const R = rng(21); const decks = [[-31, -4, 2.0, 5.6], [-29, -6, 5.5, 5.1], [-26, -8, 9.0, 4.6], [10, 30, 2.0, 5.5]];
  decks.forEach(([x0, x1, y, z]) => { for (let x = x0 + 1; x < x1; x += 1.6 + R() * 1.4) PAX.push({ x, y, z: z + (R() - 0.5) * 0.4, ph: R() * 6, c: ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#fb8c00', '#8e24aa', '#ffffff', '#00acc1'][Math.floor(R() * 8)], sk: ['#f1c9a5', '#c68e62', '#8d5a3b', '#f5d6bd'][Math.floor(R() * 4)] }); }); }
const paxBody = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.32, 0.7, 4, 10), new THREE.MeshLambertMaterial({ color: '#fff' }), PAX.length);
const paxHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 12, 10), new THREE.MeshLambertMaterial({ color: '#fff' }), PAX.length);
const armG = new THREE.BoxGeometry(0.16, 0.75, 0.16); armG.translate(0, 0.37, 0);
const paxArm = new THREE.InstancedMesh(armG, new THREE.MeshLambertMaterial({ color: '#fff' }), PAX.length);
PAX.forEach((p, i) => { paxBody.setColorAt(i, new THREE.Color(p.c)); paxHead.setColorAt(i, new THREE.Color(p.sk)); paxArm.setColorAt(i, new THREE.Color(p.sk)); });
[paxBody, paxHead, paxArm].forEach(m => { m.castShadow = true; m.frustumCulled = false; ship.add(m); });
const PS = 1.35;
// captain
const capt = new THREE.Group(); capt.position.copy(CAPT); capt.rotation.y = 0; ship.add(capt);
const CS = 1.6; capt.scale.setScalar(CS);
const captArm = new THREE.Group(); const hatG = new THREE.Group();
{ const wm = L('#f7f7f7'); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.8, 4, 12), wm); b.position.y = 0.85; capt.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), L('#f1c9a5')); h.position.y = 1.62; capt.add(h);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), L('#ffffff')); beard.scale.set(1, 0.8, 0.7); beard.position.set(0, 1.45, 0.12); capt.add(beard);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), L('#111')); e.position.set(s * 0.1, 1.68, 0.25); capt.add(e); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), L('#e8957a')); nose.position.set(0, 1.6, 0.28); capt.add(nose);
  for (const s of [-1, 1]) { const ep = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.14), L('#d4a017')); ep.position.set(s * 0.32, 1.28, 0); capt.add(ep); }
  captArm.position.set(0.38, 1.25, 0); capt.add(captArm); const arm = new THREE.Mesh(armG, wm); arm.scale.set(1.1, 1.0, 1.1); arm.rotation.z = PI; captArm.add(arm);
  const arm2 = new THREE.Mesh(armG, wm); arm2.position.set(-0.38, 1.25, 0); arm2.rotation.z = PI - 0.15; capt.add(arm2);
  capt.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// captain's hat (own top-level group: flies to the car)
scene.add(hatG);
{ const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.3, 0.2, 20), L('#ffffff')); crown.position.y = 0.16; hatG.add(crown);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 20), L('#1a1a2a')); band.position.y = 0.05; hatG.add(band);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 20, 1, false, 0, PI), L('#111')); brim.position.set(0, 0.01, 0.12); brim.scale.set(1, 1, 1.2); hatG.add(brim);
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), new THREE.MeshBasicMaterial({ color: '#ffd54f' })); badge.position.set(0, 0.16, 0.335); hatG.add(badge);
  hatG.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// funnel smoke puffs (horn)
const blobT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const PUFF = Array.from({ length: 10 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#f2f2f2', transparent: true, depthWrite: false })); s.visible = false; ship.add(s); return s; });
const SPL = Array.from({ length: 26 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#bfefff', transparent: true, depthWrite: false })); s.visible = false; ship.add(s); return s; });

// ---------------- hero ----------------
const hero = makeCar('#1e88e5');

// ---------------- motion ----------------
const leafAng = t => {
  if (t < S('wrong1').start - 0.2) return 8 * DEG * ramp(t, tOpening - 0.2, S('hook2').end + 0.4);
  if (!isRight(t)) return mono([[S('wrong1').start - 0.2, 8], [tBig, 18], [tFly, 44], [tSplash, 64], [99, 66]])(t) * DEG;
  return mono([[0, 7], [tUp - 0.2, 12], [tBest + 0.4, 70], [tComes - 0.1, 70], [tDrive - 0.1, 0], [99, 0]])(t) * DEG;
};
// hero distance along the near leaf (from the hinge); world z = HALF - s while the leaf is down
const heroHookS = mono([[0, -48], [tHalfway, 2], [tBell, 8.6], [tRinging + 0.3, S_CAR], [99, S_CAR]]);
const heroWS = mono([[0, S_CAR], [tFull + 0.3, S_CAR], [tBig, S_CAR + 1.6], [tSteeper, S_CAR + 4.5], [tFly - 0.05, HALF + 0.3]]);
const heroRZ = mono([[0, HALF - S_CAR], [tDrive - 0.2, HALF - S_CAR], [tCapt6, -26], [TOTAL, -62]]);
// ship x (centre)
const shipXW = t => -POOL.x + 4.0 * (t - tSplash);
const shipXR = t => 8.0 * (t - tSalutes - 2.6) + 25.5;   // captain passes the road around tCaptain..tSalutes
const leafCar = (pivot, ang, s, yo = 0) => { pivot.rotation.x = ang; pivot.updateMatrixWorld(true); const m = new THREE.Matrix4().makeTranslation(LANE, yo, -s); return m.premultiply(pivot.matrixWorld); };

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const HeroCam = (off, look, fov = 40) => () => { const p = hero.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + look[0], p.y + look[1], p.z + look[2]), fov]; };
const LeafCam = (off, look, fov = 40) => () => { const m = leafN.matrixWorld; return [V3(...off).applyMatrix4(m), V3(...look).applyMatrix4(m), fov]; };
const ShipCam = (off, look, fov = 40) => () => { const p = ship.position; return [V3(p.x + off[0], off[1], off[2]), V3(p.x + look[0], look[1], look[2]), fov]; };
const camKeys = [
  [0.0, HeroCam([0.6, 10, 18], [-0.5, 0, -30], 40)],
  [tHalfway - 0.35, HeroCam([0.6, 7, 14], [-0.5, 0, -30], 40)],
  ...cut(tHalfway - 0.3, HeroCam([-3.2, 3.0, 9.5], [0.5, 1.2, -8], 40)),
  [S('hook1').end, HeroCam([-3.0, 2.8, 8.5], [0.5, 1.2, -8], 40)],
  ...cut(S('hook2').start - 0.1, Ac([-2.5, 2.6, 1.0], [2.0, 1.2, 26], 40)),
  [tBridge - 0.3, Ac([-2.3, 2.6, 1.6], [2.0, 1.2, 26], 40)],
  ...cut(tBridge - 0.25, Ac([46, 9, 6], [0, 4, 4], 38)),
  [S('hook2').end, Ac([44, 9, 4], [0, 5, 4], 38)],
  // wrong
  ...cut(S('wrong1').start - 0.15, LeafCam([LANE, 3.2, -S_CAR + 9.5], [LANE, 1.8, -HALF - 6], 44)),
  [tJump, LeafCam([LANE, 3.2, -S_CAR + 9.0], [LANE, 1.8, -HALF - 6], 44)],
  ...cut(tBig - 0.1, Ac([44, 6, 8], [0, 6, 8], 40)),
  [tFly - 0.35, Ac([42, 6.5, 6], [0, 8, 6], 40)],
  ...cut(tFly - 0.3, () => [V3(7, 1.8, -23.5), hero.position.clone(), 56]),
  [S('wrong2').end, () => [V3(7, 1.8, -23.5), hero.position.clone(), 56]],
  ...cut(S('wrong3').start - 0.05, () => [V3(72, 30, 6), hero.position.clone().lerp(V3(-6, 6, 0), 0.45), 48]),
  [tSwim, () => [V3(68, 26, 5), hero.position.clone().lerp(V3(-6, 6, 0), 0.45), 48]],
  ...cut(tSplash - 0.35, () => { const p = ship.localToWorld(POOL.clone()); return [V3(p.x + 10, 15, 13), V3(p.x, 2.5, 0), 42]; }),
  [tNext - 0.2, () => { const p = ship.localToWorld(POOL.clone()); return [V3(p.x + 11, 15.5, 14), V3(p.x, 2.5, 0), 42]; }],
  ...cut(tNext - 0.15, ShipCam([48, 14, 15], [6, 5, 0], 44)),
  [tRew0, ShipCam([54, 16, 15], [4, 5, 0], 44)],
  // right
  ...cut(tRew1, Ac([44, 9, 4], [0, 5, 4], 38)),
  [tStop - 0.1, Ac([44, 9, 4], [0, 5, 4], 38)],
  ...cut(tStop - 0.05, LeafCam([LANE + 3.6, 1.9, -S_CAR - 6.5], [LANE, 0.9, -S_CAR], 40)),
  [tUp - 0.15, LeafCam([LANE + 3.9, 2.1, -S_CAR - 7.0], [LANE, 0.9, -S_CAR], 40)],
  ...cut(tUp - 0.1, Ac([10, 21, 24], [1.75, 9.5, 15], 46)),
  [tGlides - 0.3, Ac([9, 22, 24], [1.75, 10, 14], 46)],
  ...cut(tGlides - 0.25, Ac([11, 31, 30], [0, 3, 0], 48)),
  [tEvery - 0.2, Ac([10, 31, 29], [-2, 3, 0], 48)],
  ...cut(tEvery - 0.15, Ac([15, 10, 17], [11, 3.5, 4.5], 44)),
  [tCaptain - 0.2, Ac([16, 10, 17], [13, 3.5, 4.5], 44)],
  ...cut(tCaptain - 0.15, () => { const p = capt.localToWorld(V3(0, 1.2, 0)); return [V3(p.x + 4.5, p.y + 1.0, p.z + 6.0), p, 42]; }),
  [tSounds - 0.2, () => { const p = capt.localToWorld(V3(0, 1.2, 0)); return [V3(p.x + 4.5, p.y + 1.0, p.z + 6.0), p, 42]; }],
  ...cut(tSounds - 0.15, ShipCam([-34, 18, 15], [-20, 17, 0], 46)),
  [S('right4').end + 0.2, ShipCam([-38, 18, 15], [-21, 17, 0], 46)],
  ...cut(tImpressed - 0.2, () => { const p = capt.localToWorld(V3(0, 1.2, 0)); return [V3(p.x + 5, p.y + 1.5, p.z + 6.5), V3(p.x - 1, p.y + 0.3, p.z), 44]; }),
  [tThrows + 0.15, () => { const p = capt.localToWorld(V3(0, 1.2, 0)); return [V3(p.x + 5, p.y + 1.5, p.z + 6.5), V3(p.x - 1, p.y + 0.3, p.z), 44]; }],
  ...cut(tThrows + 0.2, LeafCam([LANE + 4.5, 2.6, -S_CAR - 5.5], [LANE, 1.2, -S_CAR], 44)),
  [S('right5').end + 0.2, LeafCam([LANE + 4.8, 2.8, -S_CAR - 6.0], [LANE, 1.2, -S_CAR], 44)],
  ...cut(S('right6').start - 0.05, Ac([-15, 9, 16], [1.75, 6, 15], 48)),
  [tDrive - 0.3, Ac([-14.5, 8, 16], [1.75, 1.5, 11], 48)],
  ...cut(tDrive - 0.25, HeroCam([4.5, 3.4, -10.5], [0, 1.2, 0], 40)),
  [TOTAL, HeroCam([5.5, 4.0, -12.5], [0, 1.2, 0], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const hatOnCar = new THREE.Matrix4().compose(V3(0, 1.62, 0.15), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, 0, 0.12)), V3(1.55, 1.55, 1.55));
function heroMatrixRight(t) { const ang = leafAng(t); if (t < tDrive - 0.2 || ang > 0.001) return leafCar(leafN, ang, S_CAR); return new THREE.Matrix4().makeTranslation(LANE, 0, heroRZ(t)); }
function update(t) {
  const right = isRight(t);
  const ang = leafAng(t); leafN.rotation.x = ang; leafF.rotation.x = -ang; leafN.updateMatrixWorld(true); leafF.updateMatrixWorld(true);
  // bell + barriers + lamps
  const ringing = t > tBell - 0.1 && !(right && t > tDrive);
  bell.rotation.z = ringing ? 0.45 * Math.sin((t - tBell) * 9) : 0;
  const bar = right ? 1 - ramp(t, tComes + 0.6, tDrive - 0.2) : ramp(t, tBarriers - 0.1, tBehind);
  barriers.forEach(b => { b.arm.rotation.z = -b.xs * (PI / 2) * (1 - bar); });
  lamps.forEach(l => { const on = ringing && (Math.floor(t * 3) % 2 === l.k); l.m.color.set(on ? '#ff2020' : '#3a0000'); });
  // ship
  const sx = right ? shipXR(t) : shipXW(t); ship.position.set(sx, 0, 0); ship.position.y = 0.12 * Math.sin(t * 0.8); ship.rotation.z = 0.004 * Math.sin(t * 0.6); ship.updateMatrixWorld(true);
  // passengers wave when the ship is near
  const waveOn = right ? win(t, tEvery - 0.3, tImpressed, 0.3) : 0.3;
  PAX.forEach((p, i) => { const s = PS; _m.compose(_v.set(p.x, p.y + 0.67 * s, p.z), _q.identity(), _s.set(s, s, s)); paxBody.setMatrixAt(i, _m);
    _m.compose(_v.set(p.x, p.y + 1.5 * s, p.z), _q.identity(), _s.set(s, s, s)); paxHead.setMatrixAt(i, _m);
    const a = PI - 0.35 - 0.55 * waveOn * (0.6 + 0.4 * Math.sin(t * 9 + p.ph)) * 1.4 - (1 - waveOn) * 2.3; _q.setFromEuler(new THREE.Euler(0, 0, -a));
    _m.compose(_v.set(p.x + 0.36 * s, p.y + 1.05 * s, p.z), _q, _s.set(s, s, s)); paxArm.setMatrixAt(i, _m); });
  paxBody.instanceMatrix.needsUpdate = paxHead.instanceMatrix.needsUpdate = paxArm.instanceMatrix.needsUpdate = true;
  // captain: salute, then throw
  const sal = right ? win(t, tSalutes - 0.2, tSounds + 0.8, 0.25) : 0; const thr = right ? win(t, tThrows - 0.5, tThrows + 0.5, 0.25) : 0;
  captArm.rotation.z = lerp(0, 2.6, sal) + lerp(0, 2.9, thr); captArm.rotation.x = -0.6 * sal - 0.4 * thr;
  capt.rotation.y = right ? lerp(0, 0.5, ramp(t, tImpressed, tThrows)) : 0;
  capt.updateMatrixWorld(true);
  // horn puffs
  PUFF.forEach((s, i) => { const u = (t - tHorn + 0.2 - i * 0.12); const on = right && u > 0 && u < 2.2; s.visible = on; if (on) { s.position.set(-20 - u * 3, 21 + u * 4.5, 0); s.scale.setScalar(2.5 + u * 4); s.material.opacity = 0.85 * (1 - u / 2.2); } });
  // ---- hero ----
  let heroM;
  if (t < S('wrong1').start - 0.2) { const s = heroHookS(t); heroM = s < 0 ? new THREE.Matrix4().makeTranslation(LANE, 0, HALF - s) : leafCar(leafN, ang, s); }
  else if (!right) {
    if (t < tFly - 0.05) heroM = leafCar(leafN, ang, heroWS(t));
    else { // flight: up, over, into the pool
      const P0 = new THREE.Vector3().setFromMatrixPosition(leafCar(leafN, leafAng(tFly - 0.05), HALF + 0.3)); leafN.rotation.x = ang; leafN.updateMatrixWorld(true);
      const apex = V3(0, 44, -6); const pool = V3(shipXW(tSplash) + POOL.x, 2.0, 0); let p, pitch;
      if (t < tSplash) { const tA = tFly - 0.05, tM = tSwim - 0.2; if (t < tM) { const u = (t - tA) / (tM - tA); p = P0.clone().lerp(apex, easeOut(u)); p.z = lerp(P0.z, apex.z, u); } else { const u = (t - tM) / (tSplash - tM); p = apex.clone().lerp(pool, easeIn(u)); p.x = lerp(apex.x, pool.x, ease(u)); }
        pitch = 44 * DEG + 2 * PI * ease((t - tA) / (tSplash - tA)); heroM = new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0.2 * Math.sin(t), 0, 'YXZ')), V3(1, 1, 1)); }
      else { const lp = POOL.clone().add(V3(0, -0.15 + 0.08 * Math.sin(t * 3), 0)); heroM = new THREE.Matrix4().compose(lp, new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05 * Math.sin(t * 2), 0.6 + 0.1 * Math.sin(t * 0.7), 0.05 * Math.sin(t * 1.6))), V3(1, 1, 1)).premultiply(ship.matrixWorld); }
    }
  } else heroM = heroMatrixRight(t);
  heroM.decompose(hero.position, hero.quaternion, _s); hero.userData.prev = null;
  const spin = !right && t > tFull && t < tFly ? (t - tFull) * 30 : (right && t > tDrive ? (heroRZ(t) - HALF + S_CAR) / -0.34 : 0);
  hero.userData.wheels.forEach(w => w.rotation.x = -spin);
  blink(hero, t, false, false);
  hero.userData.hl.emissiveIntensity = right && t > tEngine && t < tDrive - 0.3 ? 0.0 : 0.3;
  // splash
  SPL.forEach((s, i) => { const u = t - tSplash + 0.05; const on = !right && u > 0 && u < 1.6; s.visible = on; if (on) { const a = hash(i) * 6.28, v = 3 + hash(i + 5) * 5; s.position.set(POOL.x + Math.cos(a) * v * u, 2.4 + (6 + hash(i + 9) * 6) * u - 9 * u * u, Math.sin(a) * v * u * 0.7); s.scale.setScalar(0.9 + hash(i + 2) * 1.2); s.material.opacity = 0.9 * (1 - u / 1.6); } });
  // hat
  const head = capt.localToWorld(V3(0, 1.84, 0)); const tH0 = tThrows + 0.05, tH1 = tHat + 0.05;
  if (!right || t < tH0) { hatG.position.copy(head); hatG.quaternion.copy(capt.getWorldQuaternion(new THREE.Quaternion())); hatG.scale.setScalar(CS); }
  else { const HM = heroMatrixRight(Math.max(t, tH1)).clone().multiply(hatOnCar); const pe = new THREE.Vector3(), qe = new THREE.Quaternion(), se = new THREE.Vector3(); HM.decompose(pe, qe, se);
    if (t < tH1) { const u = (t - tH0) / (tH1 - tH0); const p = head.clone().lerp(pe, u); p.y += 7 * Math.sin(PI * u); hatG.position.copy(p); hatG.rotation.set(0, u * 9, 0.3 * Math.sin(u * 9)); hatG.scale.setScalar(lerp(CS, se.x, u)); }
    else { hatG.position.copy(pe); hatG.quaternion.copy(qe); hatG.scale.copy(se); } }
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(win(t, tSplash - 0.1, tSplash + 0.35, 0.05), 0) : 0;
  applyCam(c, t, shake > 0.02 ? 0.08 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { hero: project(hero.localToWorld(V3(0, 1.8, 0))), capt: project(capt.localToWorld(V3(0, 2.4, 0))), bell: project(bell.getWorldPosition(new THREE.Vector3())), ship: project(ship.localToWorld(V3(-20, 22, 0))), pool: project(ship.localToWorld(POOL.clone().add(V3(0, 3, 0)))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function at(text, p, t, a, b, col, size = 70, rot = 0) { if (!p || !p.ok) return; floatText(text, clamp(p.x, 240, W - 240), clamp(p.y, 560, 1080), t, a, b, size, col, rot); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('OLD BRIDGE → TOWN', '#5d4037', tCrossing - 0.1, tHalfway - 0.2, 52);
    P_('HALFWAY ACROSS', '#455a64', tHalfway - 0.1, tBell - 0.15, 52);
    floatText('DING DING DING', W / 2, 640, t, tBell - 0.05, S('hook1').end + 0.2, 84, YEL, -0.06);
    P_('BARRIERS: DOWN', RED, tBarriers - 0.1, tBridge - 0.25, 54, iconWarn);
    P_('THE BRIDGE IS OPENING', '#e65100', tBridge - 0.2, tWith - 0.1, 48, iconWarn);
    P_('WITH YOU ON IT', RED, tWith - 0.1, S('hook2').end + 0.3, 56);
    P_('FULL THROTTLE?', '#455a64', tFull - 0.15, tJump - 0.1, 56);
    P_('JUMP IT LIKE IN THE MOVIES', '#455a64', tJump - 0.1, S('wrong1').end + 0.3, 44);
    P_('STEEPER... AND STEEPER', '#e65100', tRamp - 0.1, tFly - 0.2, 50);
    floatText('WHEEE!', W / 2, 700, t, tFly - 0.05, tReally + 0.6, 130, YEL, -0.08);
    P_('NEXT STOP: AUSTRALIA', RED, tNext - 0.15, tRew0, 52, iconX);
    at('SPLASH!', screen.pool, t, tSplash - 0.05, tSplash + 1.0, '#6fe3ff', 140, -0.06);
  } else {
    P_('STOP · ENGINE OFF', GREEN, tStop - 0.1, tHand - 0.15, 54, iconCheck);
    P_('HANDBRAKE: ON', GREEN, tHand - 0.1, tHold - 0.15, 56, iconCheck);
    P_('HOLD YOUR COFFEE', '#6d4c41', tHold - 0.1, S('right2').end + 0.3, 54);
    P_('UP YOU GO', '#0288d1', tUp - 0.1, tBest - 0.15, 58);
    P_('BEST VIEW IN TOWN', '#f9a825', tBest - 0.1, S('right3').end + 0.3, 54, iconCheck);
    P_('EVERYBODY WAVES', '#0288d1', tEvery - 0.1, tCaptain - 0.15, 54, iconHeart);
    P_('THE CAPTAIN SALUTES', '#1a237e', tSalutes - 0.25, tSounds - 0.15, 50);
    at('TOOT TOOOT!', screen.ship, t, tHorn - 0.05, tHorn + 1.3, '#fff', 110, -0.06);
    P_('JUST FOR YOU', '#d81b60', tJust - 0.1, S('right4').end + 0.3, 56, iconHeart);
    P_('A GIFT: CAPTAIN\'S HAT', '#1a237e', tThrows - 0.1, S('right5').end + 0.3, 50);
    P_('CAPTAIN OF THE ROAD', '#1a237e', tCapt6 - 0.15, S('right6').end + 0.3, 54, iconCheck);
  }
}
window.dbg = { hero, ship, leafN, capt, hatG };
start(update, hud);
