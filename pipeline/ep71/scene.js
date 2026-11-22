// Episode 66: On the bridge, gravity switches off
// hook (old style): morning drive over the river, coffee in the cup holder -> your coffee floats out of the sunroof ->
//        gravity just switched off, the whole bridge is floating, and so are you
// wrong: full throttle, get off this bridge -> wheels spin in thin air, the car does a backflip, and another one ->
//        you tumble higher and higher, gravity comes back, you land on top of the bridge tower: like a cat up a tree
// right: stay calm, hazard lights, open the sunroof, put up your umbrella -> a breeze carries you gently over the river
//        like a balloon -> two seagulls fly along, never seen a flying car -> gravity comes back at the other end,
//        land softly in your lane -> the coffee drops back into the cup holder, not a single drop spilled
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeLandscape, makeCar, placeCar, applyCam, project, blink,
  YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, ring, aoPass, hemi, sun, _m, _q, _v, _s, _c
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
// ---------------- timing ----------------
const tMorning = WT('hook1', 'Morning'), tCoffeeH = WT('hook1', 'Coffee'), tThen = WT('hook1', 'Then'), tFloats = WT('hook1', 'floats'), tSunroofH = WT('hook1', 'sunroof');
const tGravity = WT('hook2', 'Gravity'), tWhole = WT('hook2', 'whole'), tFloating = WT('hook2', 'floating'), tSoAre = WT('hook2', 'so'), tWhat = WT('hook2', 'What');
const tFull = WT('wrong1', 'full'), tGet = WT('wrong1', 'Get');
const tWheels = WT('wrong2', 'wheels'), tAir = WT('wrong2', 'air'), tAnd1 = WT('wrong2', 'And'), tBackflip = WT('wrong2', 'backflip'), tAnother = WT('wrong2', 'another');
const tTumble = WT('wrong3', 'tumble'), tThenW = WT('wrong3', 'Then'), tGravW = WT('wrong3', 'gravity'), tBackW = WT('wrong3', 'back'), tLand = WT('wrong3', 'land'), tTower = WT('wrong3', 'tower'), tLike = WT('wrong3', 'Like'), tCat = WT('wrong3', 'cat');
const tStay = WT('right2', 'Stay'), tHazard = WT('right2', 'Hazard'), tOpen = WT('right2', 'Open'), tUmb = WT('right2', 'umbrella');
const tBreeze = WT('right3', 'breeze'), tCarries = WT('right3', 'carries'), tRiver = WT('right3', 'river'), tBalloon = WT('right3', 'balloon');
const tTwo = WT('right4', 'Two'), tGulls = WT('right4', 'seagulls'), tThey = WT('right4', 'They'), tNever = WT('right4', 'never'), tFlying = WT('right4', 'flying');
const tOther = WT('right5', 'other'), tGravR = WT('right5', 'gravity'), tLandR = WT('right5', 'land'), tSoftly = WT('right5', 'softly'), tRightR = WT('right5', 'right'), tLane = WT('right5', 'lane');
const tDrops = WT('right6', 'drops'), tCup = WT('right6', 'cup'), tHolder = WT('right6', 'holder'), tNot = WT('right6', 'Not'), tSpilled = WT('right6', 'spilled');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- world ----------------
const DECK = 14, TOWER_Z = 50, TOP = 60, RIVER = 85, ANCH = 125;
const waterM = new THREE.MeshStandardMaterial({ color: '#2f7aa6', roughness: 0.15, metalness: 0.15, envMapIntensity: 1.2 });
const waterT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(160,200,230,${0.25 + R() * 0.4})`; c.fillRect(R() * w, R() * h, 10 + R() * 30, 2); } }, true);
waterM.map = waterT; waterT.repeat.set(70, 8);
{ const g = new THREE.PlaneGeometry(3400, 2 * RIVER); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, waterM); m.position.y = 0.15; m.receiveShadow = true; scene.add(m); }
for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(3400, 1.2, 3), L('#9b958a')); m.position.set(0, 0.4, s * (RIVER + 1)); m.receiveShadow = true; scene.add(m); }
makeLandscape({ avoid: (x, z) => Math.abs(z) < RIVER + 14 || Math.abs(x) < 16, fieldAvoid: (x, z, w, d) => Math.abs(z) < RIVER + 8 + d / 2 || Math.abs(x) < 12 + w / 2, near: [0, -250, 400, 200], trees: 1400, seed: 7101 });
// deck (viaduct) with road
const roadT = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#5a5d62'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = 72 + hash(i) * 38 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); }
  const X = d => (d + 6) / 12 * w; c.fillStyle = '#f2f2f2'; for (const d of [-4.0, 4.0]) c.fillRect(X(d) - 2, 0, 4, h); c.fillStyle = '#ffd23a'; c.fillRect(X(0) - 5, 0, 3, h); c.fillRect(X(0) + 2, 0, 3, h);
  c.fillStyle = '#b8b4ac'; c.fillRect(0, 0, X(-4.6), h); c.fillRect(X(4.6), 0, w - X(4.6), h); }, true);
roadT.repeat.set(1, 1200 / 24);
{ const top = new THREE.Mesh(new THREE.PlaneGeometry(12, 1200), new THREE.MeshLambertMaterial({ map: roadT })); top.rotation.x = -PI / 2; top.position.set(0, DECK + 0.01, 0); top.receiveShadow = true; scene.add(top);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(12.4, 1.4, 1200), L('#a9a49a')); slab.position.set(0, DECK - 0.7, 0); slab.castShadow = slab.receiveShadow = true; scene.add(slab);
  const gird = new THREE.Mesh(new THREE.BoxGeometry(12.8, 1.0, 1200), L('#c8553d')); gird.position.set(0, DECK - 1.6, 0); gird.castShadow = true; scene.add(gird); }
// railings
{ const posts = []; for (const x of [-6.0, 6.0]) for (let z = -600; z <= 600; z += 2.5) posts.push([x, z]);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), L('#d9dde2'), posts.length); posts.forEach(([x, z], i) => { _m.compose(_v.set(x, DECK + 0.55, z), _q.identity(), _s.set(1, 1, 1)); im.setMatrixAt(i, _m); }); im.castShadow = true; scene.add(im);
  for (const x of [-6.0, 6.0]) for (const y of [0.6, 1.1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1200), L('#d9dde2')); r.position.set(x, DECK + y, 0); scene.add(r); } }
// viaduct pillars over land
for (let z = -580; z <= 580; z += 40) { if (Math.abs(z) < RIVER + 10) continue; const p = new THREE.Mesh(new THREE.BoxGeometry(4, DECK - 2, 2.5), L('#b9b4aa')); p.position.set(0, (DECK - 2) / 2, z); p.castShadow = p.receiveShadow = true; scene.add(p); }
// towers
const towerM = STD('#c8553d', { roughness: 0.55 });
for (const zt of [TOWER_Z, -TOWER_Z]) { for (const x of [-7.6, 7.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(2.2, TOP, 3.0), towerM); l.position.set(x, TOP / 2, zt); l.castShadow = l.receiveShadow = true; scene.add(l); }
  const cap = new THREE.Mesh(new THREE.BoxGeometry(17.6, 2.4, 4.0), towerM); cap.position.set(0, TOP - 1.2, zt); cap.castShadow = cap.receiveShadow = true; scene.add(cap);
  const mid = new THREE.Mesh(new THREE.BoxGeometry(15.2, 2.0, 2.6), towerM); mid.position.set(0, 42, zt); mid.castShadow = true; scene.add(mid);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(20, 3, 7), L('#9b958a')); foot.position.set(0, 1.0, zt); foot.receiveShadow = true; scene.add(foot); }
// main cables (parabola between towers, straight back spans) + hangers
const cableY = z => { const az = Math.abs(z); if (az <= TOWER_Z) return DECK + 3 + (TOP - 1.5 - DECK - 3) * (z / TOWER_Z) ** 2; return lerp(TOP - 1.5, DECK + 1.2, clamp((az - TOWER_Z) / (ANCH - TOWER_Z))); };
const cableM = STD('#b8463a', { roughness: 0.5 });
for (const x of [-7.6, 7.6]) { const pts = []; for (let z = -ANCH; z <= ANCH; z += 2) pts.push(V3(x, cableY(z), z)); const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 260, 0.4, 8, false), cableM); m.castShadow = true; scene.add(m); }
{ const hs = []; for (const x of [-7.6, 7.6]) for (let z = -ANCH + 6; z < ANCH - 4; z += 6) { if (Math.abs(Math.abs(z) - TOWER_Z) < 3) continue; if (x > 0 && z > 55 && z < 86) continue; const h = cableY(z) - DECK; if (h < 0.8) continue; hs.push([x, z, h]); }
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 5), L('#8f3a30'), hs.length); hs.forEach(([x, z, h], i) => { _m.compose(_v.set(x, DECK + h / 2, z), _q.identity(), _s.set(1, h, 1)); im.setMatrixAt(i, _m); }); im.castShadow = true; scene.add(im); }
// a little sailing boat on the river
const boat = new THREE.Group(); boat.position.set(-60, 0.2, -20); scene.add(boat);
{ const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 6), STD('#ffffff')); hull.position.y = 0.4; boat.add(hull); const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7), STD('#7a5a3a')); mast.position.y = 4; boat.add(mast);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute([0, 1.2, -0.3, 0, 7.2, -0.3, 0, 1.2, -2.8], 3)); sg.computeVertexNormals(); const sail = new THREE.Mesh(sg, STD('#ffe08a', { side: THREE.DoubleSide })); boat.add(sail);
  boat.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- hero + coffee + umbrella ----------------
const hero = makeCar('#1e88e5');
const sunroofM = new THREE.MeshStandardMaterial({ color: '#10161d', roughness: 0.1, metalness: 0.6 });
const sunroof = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.75), sunroofM); sunroof.rotation.x = -PI / 2; sunroof.position.set(0, 1.648, 0.05); hero.userData.bodyG.add(sunroof);
const sunHole = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.75), new THREE.MeshBasicMaterial({ color: '#020304' })); sunHole.rotation.x = -PI / 2; sunHole.position.set(0, 1.652, 0.05); hero.userData.bodyG.add(sunHole); sunHole.userData.noAO = true;
const cup = new THREE.Group(); scene.add(cup);
{ const cg = new THREE.CylinderGeometry(0.17, 0.12, 0.46, 20); const c1 = new THREE.Mesh(cg, STD('#ffffff', { roughness: 0.6 })); cup.add(c1);
  const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.162, 0.142, 0.18, 20), STD('#9c6b3f', { roughness: 0.8 })); sl.position.y = 0.0; sl.scale.set(1.03, 1, 1.03); cup.add(sl);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.18, 0.06, 20), STD('#3b2a20', { roughness: 0.5 })); lid.position.y = 0.25; cup.add(lid);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.05, 12), STD('#3b2a20')); knob.position.set(0.07, 0.3, 0); cup.add(knob);
  const steam = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 16), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 })); steam.position.y = 0.45; cup.add(steam); }
cup.traverse(o => { if (o.isMesh) o.castShadow = true; });
cup.scale.setScalar(1.25);
const umb = new THREE.Group(); umb.position.set(0, 1.3, 0.05); hero.userData.bodyG.add(umb);
const umbT = canvasTex(512, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffd23a' : '#e53935'; c.fillRect(i * w / 8, 0, w / 8, h); } });
const umbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 8), STD('#333')); umbPole.position.y = 1.2; umb.add(umbPole);
const canopyG = new THREE.Group(); canopyG.position.y = 2.35; umb.add(canopyG);
{ const g = new THREE.ConeGeometry(1.9, 0.75, 16, 1, true); const m = new THREE.Mesh(g, STD('#ffffff', { map: umbT, side: THREE.DoubleSide, roughness: 0.7 })); canopyG.add(m);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), STD('#333')); tip.position.y = 0.4; canopyG.add(tip); }
umb.traverse(o => { if (o.isMesh) o.castShadow = true; }); umb.visible = false;

// ---------------- other cars, fish, droplets ----------------
const COLS = ['#e53935', '#fdd835', '#43a047', '#ffffff', '#8e24aa', '#fb8c00'];
// [x, zStop, dir(+1 = drives -z), delay, spin]
const OTH = [[2, 26, 1, 0.0, 0.5], [2, 94, 1, 0.4, -0.4], [-2, 40, -1, 0.2, 0.7], [-2, 78, -1, 0.6, -0.6], [-2, 5, -1, 0.3, 0.45], [2, -12, 1, 0.5, -0.35]].map(([x, z, f, d, w], i) => ({ c: makeCar(COLS[i]), x, z, f, d, w, k: i }));
function makeFish(col) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), STD(col, { roughness: 0.4 })); b.scale.set(0.28, 0.42, 0.85); g.add(b);
  const tl = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 4), STD(col)); tl.rotation.x = -PI / 2; tl.scale.set(0.3, 1, 1); tl.position.z = 0.95; g.add(tl);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), STD('#ffffff')); e.position.set(s * 0.22, 0.12, -0.5); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), STD('#111')); p.position.set(s * 0.29, 0.13, -0.53); g.add(p); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.scale.setScalar(1.4); scene.add(g); return { g, tl }; }
const FISH = Array.from({ length: 8 }, (_, i) => { const f = makeFish(['#ff8c2a', '#7fb8d9', '#ffcf3a', '#ff6f61'][i % 4]); const s = i % 2 ? 1 : -1; return Object.assign(f, { x: s * (9.5 + hash(i * 3) * 9), z: 25 + hash(i * 5) * 70, d: 7.0 + hash(i * 7) * 2, v: 1.3 + hash(i * 11) * 0.8, ph: hash(i * 13) * 6, k: i }); });
const DROPN = 420;
const drops = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DROPN * 3), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfeaff', size: 0.35, transparent: true, opacity: 0.85 })); p.frustumCulled = false; scene.add(p); return p; })();
// seagulls
function makeGull() { const g = new THREE.Group(); const wh = STD('#f5f5f5', { roughness: 0.6 }), gr = STD('#9aa3ad', { roughness: 0.6 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), wh); b.scale.set(0.32, 0.3, 0.7); g.add(b);
  const head = new THREE.Group(); head.position.set(0, 0.28, -0.6); g.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), wh); head.add(hd);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), STD('#ffb300')); bk.rotation.x = -PI / 2; bk.position.set(0, -0.04, -0.3); head.add(bk);
  const eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), STD('#ffffff')); e.position.set(s * 0.13, 0.07, -0.13); head.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), STD('#111')); p.position.set(s * 0.17, 0.08, -0.17); head.add(p); return { e, p, d: new THREE.Vector3(s * 0.04, 0.01, -0.04) }; });
  const wings = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(s * 0.25, 0.1, -0.05); g.add(pv); const w = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.45), gr); w.position.x = s * 0.42; pv.add(w); const tip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.045, 0.38), STD('#222')); tip.position.x = s * 0.95; pv.add(tip); return { pv, s }; });
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.35), gr); tail.position.set(0, 0.05, 0.7); g.add(tail);
  const legs = [-1, 1].map(s => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6), STD('#ffb300')); l.position.set(s * 0.1, -0.38, 0.05); g.add(l); return l; });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.scale.setScalar(1.3); scene.add(g); return { g, head, eyes, wings, legs }; }
const GULLS = [makeGull(), makeGull()]; GULLS.forEach(g => g.g.scale.setScalar(1.5));

// ---------------- gravity / float model ----------------
const tOffH = tGravity - 0.1;                                   // gravity off (hook)
const tOnW = tGravW + 0.05, tOnR = tGravR + 0.05;               // gravity back
// float clock: in the right way the floating continues slowly from the rewind state
const fT = t => isRight(t) ? REW_TARGET + (t - tRew1) * 0.55 : t;
const tOn = t => isRight(t) ? tOnR : tOnW;
// generic floating body: rises with v after t0, falls when gravity returns; returns {h, k(0..1 float amount)}
function floatH(t, t0, v, cap) { const tf = fT(t), tg = tOn(t);
  const rise = tt => cap * (1 - Math.exp(-Math.max(0, tt - t0) * v / cap));
  if (t < tg) return { h: rise(tf), a: Math.max(0, tf - t0) };
  const h0 = rise(fT(tg)), dt = t - tg; const h = Math.max(0, h0 - 0.5 * 9.8 * dt * dt); const tl = Math.sqrt(2 * h0 / 9.8);
  const b = dt > tl ? 0.35 * Math.max(0, Math.sin((dt - tl) * 9)) * Math.exp(-(dt - tl) * 4) * Math.min(1, h0) : 0;
  return { h: h + b, a: Math.max(0, fT(tg) - t0), fall: clamp(dt / Math.max(0.15, tl)) }; }

// ---------------- hero motion ----------------
const zHook = mono([[0, 150], [tThen, 112], [tGravity, 84], [tSoAre, 66.5], [tSoAre + 1, 66]]);
const hLiftH = t => 1.35 * (1 - Math.exp(-Math.max(0, t - (tSoAre - 0.25)) * 1.3));
// wrong: centre position + rotation keys
const Cy0 = DECK + 0.8;
const wY = mono([[tFull, Cy0 + hLiftH(tFull)], [tAnd1, Cy0 + 2.4], [tAnother + 1.0, DECK + 15], [tGravW + 0.2, TOP + 6.5], [tBackW + 0.05, TOP + 7.2]]);
const tApex = tBackW + 0.05;
const wX = mono([[tAnd1, 2], [tGravW, 0.6], [tLand, 0]]), wZ = mono([[tAnd1, 66], [tGravW, 53], [tLand, TOWER_Z]]);
const pitchW = mono([[tAnd1 - 0.05, 0], [tBackflip + 0.25, 2 * PI], [tAnother - 0.3, 2 * PI], [tAnother + 0.6, 4 * PI], [tThenW, 5.3 * PI], [tApex, 5.85 * PI], [tLand, 6 * PI]]);
const rollW = mono([[tAnother + 0.6, 0], [tThenW, 0.9 * PI], [tApex, 1.7 * PI], [tLand, 2 * PI]]);
const yawW = mono([[tAnother + 0.6, 0], [tLand, PI / 2]]);
// right: glide with the umbrella
const tBz = tBreeze + 0.1;
const rZ = mono([[tBz - 0.2, 66], [tBz + 1.2, 62], [tGravR, -62], [tLandR + 0.1, -73], [tLane, -75]]);
const rY = mono([[tRew1, Cy0 + hLiftH(REW_TARGET)], [tBz - 0.2, Cy0 + 1.55], [tCarries + 1.0, DECK + 7.5], [tGravR, DECK + 8.0], [tLandR + 0.12, Cy0], [tLane, Cy0]]);
function heroPose(t) {     // {c: centre, yaw, pitch, roll}
  const right = isRight(t);
  if (!right) {
    if (t < tFull) { const fl = t >= tSoAre - 0.25 ? hLiftH(t) : 0; const bob = fl > 0 ? 0.08 * Math.sin(t * 2.3) * clamp(fl) : 0; return { c: V3(2, Cy0 + fl + bob, zHook(t)), yaw: 0, pitch: fl > 0 ? 0.04 * Math.sin(t * 1.7) : 0, roll: fl > 0 ? 0.05 * Math.sin(t * 1.3) : 0 }; }
    let y = wY(t); if (t > tApex) y = Math.max(TOP + 0.8, TOP + 7.2 - 0.5 * 9.8 * (t - tApex) ** 2);
    if (t > tLand) { const dt = t - tLand; y = TOP + 0.8 + 0.5 * Math.max(0, Math.sin(dt * 8)) * Math.exp(-dt * 3); }
    const wob = t > tLand + 0.6 ? 0.06 * Math.sin((t - tLand) * 3.1) * (0.6 + 0.4 * Math.sin(t * 0.7)) : 0;
    return { c: V3(wX(t), y, wZ(t)), yaw: yawW(t), pitch: t < tAnd1 ? 0.04 * Math.sin(t * 1.7) : pitchW(t), roll: (t < tAnother ? 0.05 * Math.sin(t * 1.3) : rollW(t)) + wob };
  }
  const fl = t < tLandR ? 1 : 0; const sway = fl * (t > tBz ? 1 : 0.5);
  return { c: V3(2, rY(t) + 0.1 * Math.sin(t * 2.1) * fl, rZ(t)), yaw: 0.05 * Math.sin(t * 0.9) * sway, pitch: 0.05 * Math.sin(t * 1.4) * sway, roll: 0.08 * Math.sin(t * 1.1) * sway };
}
const _o = new THREE.Object3D();
function placeHero(t) { const p = heroPose(t); _o.rotation.set(p.pitch, p.yaw, p.roll, 'YXZ'); _o.updateMatrix(); const off = V3(0, 0.8, 0).applyQuaternion(_o.quaternion);
  hero.position.copy(p.c).sub(off); hero.quaternion.copy(_o.quaternion); return p; }

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
// hero-relative (yaw-free: road frame), off = [side, up, back], look = [side, up, ahead]
const HC = (off, look, fov = 40) => t => { const c = heroPose(t).c; return [c.clone().add(V3(off[0], off[1], off[2])), c.clone().add(V3(look[0], look[1], -look[2])), fov]; };
const FixLook = (p, dy = 0, fov = 40) => t => [V3(...p), heroPose(t).c.clone().add(V3(0, dy, 0)), fov];
const camKeys = [
  [0.0, HC([0.9, 4.0, 15], [0, 1.0, 40], 40)],
  [tThen - 0.3, HC([0.8, 3.4, 12], [0, 1.0, 40], 40)],
  ...cut(tThen - 0.25, HC([2.6, 2.6, -2.8], [0, 1.4, -0.3], 40)),
  [tGravity - 0.3, HC([2.4, 3.2, -2.4], [0, 2.2, -0.3], 40)],
  ...cut(tGravity - 0.25, HC([-2.2, 2.4, 11], [0, 2.4, 24], 42)),
  [tWhole - 0.3, HC([-2.4, 2.6, 12], [0, 3.0, 24], 42)],
  ...cut(tWhole - 0.25, Ac([-30, 25, 104], [0, 16, 58], 42)),
  [tSoAre - 0.3, Ac([-28, 24, 100], [0, 16, 58], 42)],
  ...cut(tSoAre - 0.25, HC([-8.5, -0.3, 0.6], [0, -0.5, 0.1], 40)),
  [tWhat - 0.3, HC([-8.0, -0.2, 0.5], [0, -0.5, 0.1], 40)],
  ...cut(tWhat - 0.25, HC([4.0, 3.6, 10], [0, 1.0, 10], 42)),
  [S('hook2').end + 0.6, HC([4.0, 3.8, 10.5], [0, 1.0, 10], 42)],
  // wrong
  ...cut(S('wrong1').start - 0.15, HC([1.4, 1.8, 8.5], [0, 0.8, 20], 40)),
  [tGet - 0.2, HC([1.2, 1.7, 7.5], [0, 0.8, 20], 40)],
  ...cut(tWheels - 0.25, HC([3.4, -0.6, 4.6], [0, -0.7, -0.4], 36)),
  [tAnd1 - 0.25, HC([3.2, -0.5, 4.2], [0, -0.7, -0.4], 36)],
  ...cut(tAnd1 - 0.2, HC([15, 2.0, 2], [0, 1.5, 0], 42)),
  [tAnother + 0.7, HC([17, 1.0, 3], [0, 2.5, 0], 42)],
  ...cut(tTumble - 0.2, FixLook([13, DECK + 9, 76], 3, 44)),
  [tBackW, FixLook([16, DECK + 26, 78], 1, 44)],
  ...cut(tLand - 0.35, Ac([20, TOP + 3, 70], [0, TOP + 1.2, TOWER_Z], 40)),
  [tLike - 0.2, Ac([19, TOP + 3, 68], [0, TOP + 1.2, TOWER_Z], 40)],
  ...cut(tLike - 0.15, Ac([26, TOP - 2, 84], [0, TOP - 1.5, TOWER_Z], 40)),
  [tRew0, Ac([28, TOP - 2, 87], [0, TOP - 2, TOWER_Z], 40)],
  // right
  ...cut(tRew1, HC([4.0, 3.6, 10], [0, 1.0, 10], 42)),
  ...cut(tStay - 0.15, HC([0.4, 2.2, 9], [0, 0.8, 20], 40)),
  [tOpen - 0.3, HC([0.4, 2.0, 8.4], [0, 0.8, 20], 40)],
  ...cut(tOpen - 0.25, HC([2.6, 4.6, 4.6], [0, 1.6, 0.6], 40)),
  [S('right2').end + 0.2, HC([2.8, 5.0, 6.0], [0, 2.4, 0.6], 40)],
  ...cut(tBreeze - 0.25, HC([3.0, 3.8, 11], [0, 2.4, 10], 42)),
  [tCarries - 0.2, HC([3.0, 4.2, 12], [0, 2.4, 10], 42)],
  ...cut(tCarries - 0.15, HC([9, 12.5, -17], [0, 1.0, 0], 42)),
  [S('right3').end + 0.3, HC([8, 11.5, -16], [0, 1.0, 0], 42)],
  ...cut(tTwo - 0.2, HC([5.2, 2.4, -7.5], [0, 1.3, 0], 44)),
  [S('right4').end + 0.2, HC([5.0, 2.3, -7.0], [0, 1.3, 0], 44)],
  ...cut(tOther - 0.2, HC([5.5, 3.5, 13], [0, 1.0, 8], 42)),
  [tLandR - 0.2, HC([5.0, 3.0, 12], [0, 0.0, 8], 42)],
  ...cut(tRightR - 0.25, HC([3.5, 6.5, 9], [0, 0, 2], 42)),
  [S('right5').end + 0.3, HC([3.5, 7, 9.5], [0, 0, 2], 42)],
  ...cut(tDrops - 0.25, HC([1.8, 3.4, -2.2], [0, 1.6, 0.1], 40)),
  [S('right6').end + 0.3, HC([1.6, 3.1, -2.0], [0, 1.6, 0.1], 40)],
  ...cut(S('right7').start - 0.15, HC([3.2, 4.0, 13], [0, 1.2, 30], 42)),
  [TOTAL, HC([3.2, 4.6, 16], [0, 1.2, 30], 42)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
function update(t) {
  const right = isRight(t);
  const c = cam(t); camera.fov = c.fov; camera.near = 0.2; camera.far = 3000; camera.updateProjectionMatrix();
  // ---- hero ----
  const hp = placeHero(t);
  const spinning = !right && t > tFull - 0.1;
  hero.userData.spin = (hero.userData.spin || 0) + (spinning ? 1.4 : (right || t > tSoAre ? 0 : 0.5)); hero.userData.wheels.forEach(w => w.rotation.x = -hero.userData.spin);
  hero.userData.bodyG.rotation.set(0, 0, 0); hero.userData.bodyG.position.y = 0;
  blink(hero, t, right && t > tHazard - 0.1, right && t > tHazard - 0.1);
  hero.userData.tl.emissiveIntensity = 0.5;
  // sunroof + umbrella
  const roofOpen = right ? ramp(t, tOpen, tOpen + 0.5) : (t > tFloats - 0.6 ? 1 : 0);
  sunroof.position.z = 0.05 + 0.5 * roofOpen; sunroof.position.y = 1.648 + 0.02 * roofOpen; sunHole.visible = roofOpen > 0.05;
  const cls = right ? ramp(t, tLane - 0.1, tLane + 0.4) : 0; const uo = right ? ramp(t, tUmb - 0.1, tUmb + 0.45) * (1 - cls) : 0; const ext = right ? ramp(t, tUmb - 0.5, tUmb) * (1 - ramp(t, tLane + 0.3, tLane + 0.8)) : 0; umb.visible = ext > 0.01;
  umb.position.y = 1.3 - 1.6 * (1 - ext); canopyG.scale.set(lerp(0.12, 1, back(uo)), lerp(1.8, 1, uo), lerp(0.12, 1, back(uo)));
  const lean = right ? 0.22 * ramp(t, tBz - 0.2, tBz + 0.5) * (1 - ramp(t, tLandR, tLandR + 0.8)) : 0; umb.rotation.x = -lean + 0.05 * Math.sin(t * 2.4) * uo; umb.rotation.z = 0.06 * Math.sin(t * 1.7) * uo;
  if (right && t > tGravR && t < tLandR + 0.5) canopyG.scale.y *= 1 + 0.15 * Math.sin((t - tGravR) * 6);
  // ---- coffee cup ----
  hero.updateMatrixWorld(true);
  const cupLocal = V3(0, 1.25, 0.12);
  if (!right) { const u = clamp((t - tFloats + 0.2) / 2.2); const loc = cupLocal.clone().add(V3(0.1 * u, 1.9 * easeOut(u), -0.1 * u));
    if (t < tFull) { cup.position.copy(hero.localToWorld(loc)); cup.rotation.set(0.5 * u * Math.sin(t * 1.3), t * 0.4 * u, 0.4 * u * Math.sin(t * 0.9)); }
    else { const base = hero.localToWorld(loc.clone()); const p0 = cup.userData.leave || null; // left behind where it was at tFull
      const anchor = V3(2.1, Cy0 + hLiftH(tFull) + 0.3 + 1.9 + 0.08 * Math.sin(tFull * 2.3), zHook(tFull)); const fl = t < tOnW ? 0 : 0;
      let y = anchor.y + 0.25 * (t - tFull); if (t > tOnW) { const dt = t - tOnW; y = Math.max(DECK + 0.25, anchor.y + 0.25 * (tOnW - tFull) - 4.9 * dt * dt); }
      cup.position.set(anchor.x + 0.6, y, anchor.z + 0.4); cup.rotation.set(0.6 * Math.sin(t * 1.3), t * 0.5, 0.5 * Math.sin(t * 0.9)); if (t > tOnW + 0.9) cup.rotation.set(PI / 2, 0.3, 0); }
    cup.visible = t > tFloats - 0.6;
  } else { const dropU = clamp((t - tDrops + 0.05) / (tHolder - tDrops + 0.2)); const hov = cupLocal.clone().add(V3(0.75, 2.0 + 0.12 * Math.sin(t * 2.0), -0.9));
    const loc = hov.lerp(cupLocal.clone().add(V3(0, -0.15, 0)), easeIn(dropU)); cup.position.copy(hero.localToWorld(loc)); cup.quaternion.copy(hero.quaternion);
    cup.rotateX(0.35 * Math.sin(t * 1.3) * (1 - dropU)); cup.rotateZ(0.3 * Math.sin(t * 0.9) * (1 - dropU)); cup.visible = dropU < 0.98; }
  // ---- other cars ----
  OTH.forEach(o => { const t0 = tOffH + o.d; const fh = floatH(t, t0 + 0.4, 0.55, 6 + o.k);
    const zz = o.z + o.f * 9 * Math.max(0, Math.min(fT(t), tOffH) - 0) * -1 + o.f * 9 * tOffH; // moved before gravity went off
    const zDrive = o.z + o.f * 9 * (tOffH - Math.min(fT(t), tOffH));
    let rx = fh.a * o.w * 0.35, rz = fh.a * o.w * 0.22; if (fh.fall !== undefined) { const k = 1 - easeOut(fh.fall); rx *= k; rz *= k; }
    _o.rotation.set(rx, o.f > 0 ? 0 : PI, rz, 'YXZ'); _o.updateMatrix(); const off = V3(0, 0.8, 0).applyQuaternion(_o.quaternion);
    o.c.position.set(o.x, DECK + 0.8 + fh.h, zDrive).sub(off); o.c.quaternion.copy(_o.quaternion);
    o.c.userData.spin = (o.c.userData.spin || 0) + (fT(t) < tOffH ? 0.45 : 0); o.c.userData.wheels.forEach(w => w.rotation.x = -o.c.userData.spin); o.c.userData.prev = null; });
  // ---- fish + droplets ----
  FISH.forEach(f => { const fh = floatH(t, f.d, f.v, 9 + f.k * 1.6); f.g.visible = fh.h > 0.05 || (fT(t) > f.d && t < tOn(t));
    f.g.position.set(f.x, fh.h - 0.2, f.z); f.g.rotation.set(0.3 * Math.sin(t * 1.1 + f.ph), t * 0.3 + f.ph, 0.4 * Math.sin(t * 0.8 + f.ph)); f.tl.rotation.y = 0.5 * Math.sin(t * 9 + f.ph); });
  { const pa = drops.geometry.attributes.position.array; const tf = fT(t), tg = tOn(t);
    for (let i = 0; i < DROPN; i++) { const x = (hash(i * 3) - 0.5) * 70, z = 10 + hash(i * 7) * 90, t0 = tOffH + 0.5 + hash(i * 11) * 3, v = 0.6 + hash(i * 13) * 1.4;
      let y = Math.max(0, Math.min(tf, fT(tg)) - t0) * v; if (t > tg) y = Math.max(-1, y - 4.9 * (t - tg) ** 2); pa[i * 3] = x; pa[i * 3 + 1] = y > 0.02 ? y + 0.2 : -5; pa[i * 3 + 2] = z; }
    drops.geometry.attributes.position.needsUpdate = true; }
  // ---- seagulls ----
  GULLS.forEach((gl, i) => { const s = i ? 1 : -1;
    if (right && t > tTwo - 0.8 && t < tOther + 1.5) { const come = ramp(t, tTwo - 0.8, tTwo + 0.6), go = ramp(t, tOther, tOther + 1.5);
      const loc = V3(s * (2.45 + 0.15 * Math.sin(t * 1.3 + i)), 1.0 + 0.35 * Math.sin(t * 1.7 + i * 2), -1.6 - i * 0.4).add(V3(s * 6 * go, 3 * go, 10 * (1 - come)));
      gl.g.position.copy(heroPose(t).c).add(loc); gl.g.rotation.set(0, 0, s * 0.08 * Math.sin(t * 2));
      const look = ramp(t, tThey - 0.1 + i * 0.25, tThey + 0.25 + i * 0.25) * (1 - ramp(t, tFlying + 0.4, tFlying + 0.9)); const toCam = s > 0 ? ramp(t, tNever - 0.15, tNever + 0.15) * (1 - ramp(t, tFlying + 0.6, tFlying + 1.0)) : 0; gl.head.rotation.y = lerp(s * 1.1 * look, -0.7, toCam); gl.head.rotation.x = 0.15 * look;
      const big = 1 + 0.9 * ramp(t, tNever - 0.1, tNever + 0.2) * (1 - ramp(t, tFlying + 0.4, tFlying + 0.9)); gl.eyes.forEach(e => { e.e.scale.setScalar(big); e.p.scale.setScalar(big); e.p.position.copy(e.e.position).addScaledVector(e.d, big * 1.15); });
      gl.wings.forEach(w => w.pv.rotation.z = w.s * 0.6 * Math.sin(t * 7 + i)); gl.legs.forEach(l => l.visible = false); gl.g.visible = true; }
    else if (!right && t > tGravW) { gl.g.position.set(s * 5.5 + i * 0.6, TOP + 0.55 * 1.5 - 0.1, TOWER_Z + 0.6 * s); const land = ramp(t, tGravW + i * 0.5, tLand + 0.3 + i * 0.4);
      gl.g.position.y += 8 * (1 - land); gl.g.position.x += s * 6 * (1 - land); gl.g.rotation.set(0, -s * PI / 2 + 0.25 * s, 0);
      gl.wings.forEach(w => w.pv.rotation.z = land < 1 ? w.s * 0.6 * Math.sin(t * 8) : -w.s * 0.15); gl.legs.forEach(l => l.visible = land > 0.9);
      const look = ramp(t, tLand + 0.4, tLand + 0.8); gl.head.rotation.y = s * 0.6 * look; gl.eyes.forEach(e => { const bg = 1 + 0.6 * ramp(t, tLike, tLike + 0.3); e.e.scale.setScalar(bg); e.p.scale.setScalar(bg); e.p.position.copy(e.e.position).addScaledVector(e.d, bg * 1.15); }); gl.g.visible = true; }
    else gl.g.visible = false; });
  boat.position.x = -60 + t * 1.2; boat.rotation.z = 0.05 * Math.sin(t * 1.3);
  if (!right) { const fh = floatH(t, tOffH + 1.0, 0.7, 7); boat.position.y = 0.2 + fh.h; boat.rotation.x = fh.a * 0.05; } else { const fh = floatH(t, tOffH + 1.0, 0.7, 7); boat.position.y = 0.2 + fh.h; boat.rotation.x = fh.a * 0.05 * (fh.fall !== undefined ? 1 - fh.fall : 1); }
  // ---- camera ----
  let shake = 0; if (!right) shake = 0.3 * win(t, tLand - 0.02, tLand + 0.45, 0.05);
  applyCam(c, t, shake);
  camera.updateMatrixWorld(true);
  screen = { cup: project(cup.position), hero: project(hp.c) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('BRIDGE · 8:00 AM', '#1565c0', tMorning - 0.1, tCoffeeH - 0.15, 58);
    P_('COFFEE IN THE CUP HOLDER', '#6d4c41', tCoffeeH - 0.1, tThen - 0.15, 46);
    if (t > tFloats - 0.2 && t < tGravity - 0.2 && screen.cup) ring(cup.position.clone(), 70, t, tFloats - 0.1, tGravity - 0.2);
    floatText('?!', W / 2 + 160, 640, t, tFloats + 0.3, tGravity - 0.1, 130, YEL, 0.1);
    P_('GRAVITY: OFF', '#6a1b9a', tGravity - 0.1, S('hook2').end + 0.4, 64, iconWarn);
    P_('FULL THROTTLE', RED, tFull - 0.1, tGet + 0.8, 60, iconX);
    P_('WHEELS SPIN IN THIN AIR', RED, tWheels - 0.15, tAnd1 - 0.15, 48, iconX);
    floatText('BACKFLIP!', W / 2, 820, t, tBackflip - 0.15, tBackflip + 0.9, 120, YEL, -0.08);
    floatText('AND ANOTHER!', W / 2, 860, t, tAnother - 0.1, tAnother + 0.9, 110, YEL, 0.07);
    P_('HIGHER AND HIGHER', RED, tTumble - 0.1, tThenW - 0.15, 52, iconX);
    P_('GRAVITY: BACK ON', '#6a1b9a', tGravW - 0.1, tLand - 0.2, 56, iconWarn);
    floatText('CLONK!', W / 2 + 120, 760, t, tLand + 0.05, tLand + 0.9, 120, YEL, 0.08);
    P_('STUCK ON THE TOWER', RED, tTower - 0.2, tRew0, 54, iconX);
    floatText('MEOW?', W / 2 - 140, 1450, t, tCat, tCat + 1.3, 100, '#fff', -0.08);
  } else {
    P_('STAY CALM', GREEN, tStay - 0.1, tHazard - 0.15, 60, iconCheck);
    P_('HAZARD LIGHTS ON', GREEN, tHazard - 0.1, tOpen - 0.15, 54, iconCheck);
    P_('OPEN THE SUNROOF', GREEN, tOpen - 0.1, tUmb - 0.25, 54, iconCheck);
    P_('UMBRELLA UP', GREEN, tUmb - 0.2, tBreeze - 0.1, 60, iconCheck);
    P_('A LITTLE BREEZE', '#0277bd', tBreeze - 0.1, tCarries - 0.15, 56, iconCheck);
    P_('LIKE A BALLOON', '#0277bd', tCarries - 0.1, S('right3').end + 0.2, 58, iconHeart);
    P_('NEVER SEEN A FLYING CAR', '#5d4037', tThey - 0.1, S('right4').end + 0.2, 48);
    P_('GRAVITY: BACK ON', '#6a1b9a', tGravR - 0.1, tLandR - 0.1, 56, iconWarn);
    P_('SOFT LANDING · IN LANE', GREEN, tLandR - 0.1, S('right5').end + 0.3, 50, iconCheck);
    floatText('PLOP', W / 2 + 130, 900, t, tHolder - 0.3, tHolder + 0.6, 110, YEL, 0.08);
    P_('0 DROPS SPILLED', GREEN, tNot - 0.1, S('right6').end + 0.4, 58, iconCheck);
  }
}
window.dbg = { hero, heroPose };
start(update, hud);
