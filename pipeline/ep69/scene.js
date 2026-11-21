// Episode 64: Motorway at noon – total solar eclipse, suddenly pitch dark
// hook (old style): motorway, twelve o'clock, not a cloud in the sky, then something takes a bite out of the sun ->
//        total eclipse, in ten seconds pitch dark, and you're doing 120
// wrong: full beam, light up the sky -> you dazzle the moon, it blinks and loses its grip -> drops onto the motorway,
//        bounces over you and rolls after you: squash -> your car is now a crater on the moon
// right: slow down, dipped headlights, keep your distance -> everyone does the same: from above the motorway is a string of
//        fairy lights -> the moon looks down, never seen anything so beautiful -> blushes, slides away, sun is back ->
//        the moon gives you a little wink: see you tonight
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, box, instanced, makeLandscape, roundedPath, pathAt,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
// ---------------- timing ----------------
const tMotor = WT('hook1', 'Motorway'), tNot = WT('hook1', 'Not'), tCloud = WT('hook1', 'cloud'), tThen = WT('hook1', 'Then'), tBite = WT('hook1', 'bite'), tSunH = WT('hook1', 'sun');
const tTotal = WT('hook2', 'total'), tEclipse = WT('hook2', 'eclipse'), tTen = WT('hook2', 'ten'), tPitch = WT('hook2', 'pitch'), tDark = WT('hook2', 'dark'), tDoing = WT('hook2', 'doing'), tHundred = WT('hook2', 'hundred'), tWhat = WT('hook2', 'What');
const tFull = WT('wrong1', 'full'), tBeam = WT('wrong1', 'beam'), tLight = WT('wrong1', 'Light'), tSky = WT('wrong1', 'sky');
const tBigM = WT('wrong2', 'Big'), tDazzle = WT('wrong2', 'dazzle'), tBlinks = WT('wrong2', 'blinks'), tLoses = WT('wrong2', 'loses'), tGrip = WT('wrong2', 'grip');
const tDrops = WT('wrong3', 'drops'), tMotorW = WT('wrong3', 'motorway'), tBounces = WT('wrong3', 'bounces'), tRolls = WT('wrong3', 'rolls'), tAfter = WT('wrong3', 'after'), tSquash = WT('wrong3', 'Squash'), tYour = WT('wrong3', 'Your'), tCrater = WT('wrong3', 'crater');
const tSlow = WT('right2', 'Slow'), tDipped = WT('right2', 'Dipped'), tKeep = WT('right2', 'keep'), tDist = WT('right2', 'distance');
const tEveryone = WT('right3', 'Everyone'), tFrom = WT('right3', 'from'), tAbove = WT('right3', 'above'), tFairy = WT('right3', 'fairy');
const tLooks = WT('right4', 'looks'), tNever = WT('right4', 'never'), tBeautiful = WT('right4', 'beautiful');
const tBlushes = WT('right5', 'blushes'), tSlowly = WT('right5', 'slowly'), tSlides = WT('right5', 'slides'), tSunR = WT('right5', 'sun'), tBack = WT('right5', 'back');
const tGives = WT('right6', 'gives'), tWink = WT('right6', 'wink'), tSee = WT('right6', 'See'), tTonight = WT('right6', 'tonight');
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
// integrate a speed profile -> distance
function integ(vfn, t0, t1, s0) { const dt = 1 / 120, cum = [s0]; let s = s0; for (let t = t0; t <= t1 + 1; t += dt) { s += vfn(t) * dt; cum.push(s); } return t => { const k = clamp((t - t0) / dt, 0, cum.length - 2), i = Math.floor(k); return lerp(cum[i], cum[i + 1], k - i); }; }

// ---------------- darkness ----------------
// E = 0 day ... 1 totality
const Ew = mono([[0, 0], [tBite, 0], [tSunH + 0.3, 0.12], [tEclipse, 0.45], [tPitch, 0.85], [tDark + 0.4, 1], [tLoses + 0.4, 1], [tGrip + 0.9, 0], [99, 0]]);
const Er = mono([[0, 1], [tSlides, 1], [tSunR + 0.25, 0], [99, 0]]);

// ---------------- motorway on a long gentle bend ----------------
const PATH = roundedPath([[0, 760], [0, -40], [-300, -480], [-300, -1250]], 300);
const RWD = 8.6;                                    // half width of the whole road (two carriageways + median)
const PS = []; for (let s = 0; s <= PATH.len; s += 4) PS.push(pathAt(PATH, s));
function frame(s, d = 0) { const p = pathAt(PATH, s); const rx = Math.cos(p.h), rz = -Math.sin(p.h); return { x: p.x + rx * d, z: p.z + rz * d, h: p.h }; }
const roadT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#55585e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 70 + hash(i) * 40 | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(hash(i * 3) * w, hash(i * 7) * h, 2, 2); }
  const X = d => (d + RWD) / (2 * RWD) * w; c.fillStyle = '#f2f2f2';
  for (const d of [-8.0, -0.95, 0.95, 8.0]) c.fillRect(X(d) - 3, 0, 6, h);
  for (const d of [-4.4, 4.4]) c.fillRect(X(d) - 3, 30, 6, 110);
  c.fillStyle = '#7a7d80'; c.fillRect(X(-0.6), 0, X(0.6) - X(-0.6), h); }, true);
const roadGeo = new THREE.BufferGeometry(); { const pos = [], uv = [], idx = []; let s = 0;
  for (let i = 0; i < PS.length; i++) { const p = PS[i]; const rx = Math.cos(p.h), rz = -Math.sin(p.h); pos.push(p.x - rx * RWD, 0.05, p.z - rz * RWD, p.x + rx * RWD, 0.05, p.z + rz * RWD); uv.push(0, i * 4 / 12, 1, i * 4 / 12); if (i) idx.push(2 * i - 2, 2 * i, 2 * i - 1, 2 * i - 1, 2 * i, 2 * i + 1); }
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); roadGeo.setIndex(idx); roadGeo.computeVertexNormals(); }
const roadM = new THREE.Mesh(roadGeo, new THREE.MeshLambertMaterial({ map: roadT, side: THREE.DoubleSide })); roadM.receiveShadow = true; scene.add(roadM);
// straight extensions at both ends
plane(-RWD, RWD, 760, 1700, new THREE.MeshLambertMaterial({ map: (() => { const t = roadT.clone(); t.needsUpdate = true; t.repeat.set(1, 940 / 12); return t; })() }), 0.05, 1);
// median barrier along the path
{ const pos = [], idx = []; for (let i = 0; i < PS.length; i++) { const p = PS[i]; const rx = Math.cos(p.h), rz = -Math.sin(p.h); for (const [d, y] of [[-0.25, 0.05], [-0.12, 0.85], [0.12, 0.85], [0.25, 0.05]]) pos.push(p.x + rx * d, y, p.z + rz * d); if (i) for (let k = 0; k < 3; k++) { const a = (i - 1) * 4 + k, b = a + 1, c = a + 4, d = c + 1; idx.push(a, c, b, b, c, d); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: '#b9bcc0', side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; scene.add(m); }
// near-path test for the landscape
const nearPath = (x, z, d) => { if (z > 760) return Math.abs(x) < d; for (let i = 0; i < PS.length; i += 2) { const p = PS[i]; if (Math.abs(p.x - x) < d && Math.abs(p.z - z) < d && Math.hypot(p.x - x, p.z - z) < d) return true; } return false; };
makeLandscape({ avoid: (x, z) => nearPath(x, z, 24), fieldAvoid: (x, z, w, d) => nearPath(x, z, 12 + Math.max(w, d) / 2), near: [-150, 100, 500, 700], trees: 1500, seed: 6901 });

// ---------------- traffic ----------------
const blobT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
function lampSprite(col, sc) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(sc); return s; }
function addLamps(car) { const L_ = []; for (const x of [-0.6, 0.6]) { const f = lampSprite('#fff6d8', 0.9); f.position.set(x, 0.76, -2.3); car.add(f); L_.push(['f', f]); const r = lampSprite('#ff2a1a', 0.75); r.position.set(x, 0.86, 2.3); car.add(r); L_.push(['r', r]); } car.userData.lamps = L_; }
const hero = makeCar('#1e88e5'); addLamps(hero);
const HD = 2.3;                                     // hero lane offset
const COLS = ['#e53935', '#fdd835', '#43a047', '#ffffff', '#8e24aa', '#fb8c00', '#546e7a', '#d81b60', '#00897b'];
const SAME = [[30, 2.3], [-24, 5.9], [14, 5.9], [58, 5.9], [80, 2.3], [108, 5.9], [140, 2.3], [176, 5.9], [210, 2.3]].map(([ds, d], i) => { const c = makeCar(COLS[i % COLS.length]); addLamps(c); return { c, ds, d, k: i }; });
const OPP = Array.from({ length: 9 }, (_, i) => { const c = makeCar(COLS[(i + 4) % COLS.length]); addLamps(c); return { c, s0: i * 61 + hash(i) * 20, d: i % 2 ? -2.3 : -5.9, k: i }; });
// far "necklace": light points along both carriageways
const NF = 90;
function lightPoints(col, size) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NF * 2 * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NF * 2 * 3), 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ map: blobT, size, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); p.frustumCulled = false; scene.add(p); p.userData.col = new THREE.Color(col); return p; }
const farRed = lightPoints('#ff3020', 5.0), farWhite = lightPoints('#fff2cc', 6.0);
// hero beams
const beamT = canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,250,225,1)'); g.addColorStop(0.3, 'rgba(255,250,225,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
function beam(len, rad) { const g = new THREE.ConeGeometry(rad, len, 24, 1, true); g.translate(0, -len / 2, 0); // apex at origin, axis -y; uv v: 1 at apex (top) -> 0 base
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: beamT, color: '#fff3c8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); m.userData.noAO = true; m.frustumCulled = false; scene.add(m); return m; }
const fullBeams = [beam(420, 22), beam(420, 22)], dipBeams = [beam(14, 1.8), beam(14, 1.8)];
const dipSpot = new THREE.SpotLight('#fff2d0', 0, 40, 0.55, 0.6, 1.2); scene.add(dipSpot); scene.add(dipSpot.target);
const fill = new THREE.PointLight('#9fb8ff', 0, 70, 1.6); scene.add(fill);

// ---------------- sky: sun, moon, stars ----------------
const SUN_DIR = V3(0, 0.3, -0.95).normalize();
const SUN_D = 680, MOON_D = 600, SUN_R = 26, MOON_R = 24.5;
const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(SUN_R, 48), new THREE.MeshBasicMaterial({ color: '#fff7d6', toneMapped: false, fog: false })); scene.add(sunDisc);
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#fff0b0', transparent: true, opacity: 0.6, depthWrite: false, fog: false })); sunGlow.scale.setScalar(SUN_R * 5); scene.add(sunGlow);
const coronaT = canvasTex(512, 512, (c, w, h) => { c.translate(w / 2, h / 2); const g = c.createRadialGradient(0, 0, w * 0.17, 0, 0, w * 0.5); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,250,235,0.85)'); g.addColorStop(0.4, 'rgba(200,220,255,0.28)'); g.addColorStop(1, 'rgba(120,150,255,0)'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
  c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 60; i++) { const a = hash(i) * 2 * PI, l = w * (0.25 + hash(i + 3) * 0.24); c.strokeStyle = `rgba(255,255,255,${0.08 + hash(i + 5) * 0.12})`; c.lineWidth = 2 + hash(i + 7) * 5; c.beginPath(); c.moveTo(Math.cos(a) * w * 0.17, Math.sin(a) * w * 0.17); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke(); } });
const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: coronaT, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); corona.scale.setScalar(SUN_R * 5.2); scene.add(corona);
{ const p = []; const R = rng(64); for (let i = 0; i < 700; i++) { const a = R() * 2 * PI, e = 0.05 + R() * 1.4; p.push(Math.cos(a) * Math.cos(e) * 1500, Math.sin(e) * 1500, Math.sin(a) * Math.cos(e) * 1500); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); var stars = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 2.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0, depthWrite: false })); scene.add(stars); }
// moon with a face (unit radius body inside moonG; face looks along local +z)
const moonG = new THREE.Group(); scene.add(moonG);
const moonB = new THREE.Group(); moonG.add(moonB);
const craterT = canvasTex(1024, 512, (c, w, h) => { c.fillStyle = '#d9d7d0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { const v = 190 + hash(i) * 50 | 0; c.fillStyle = `rgb(${v},${v},${v - 6})`; c.fillRect(hash(i * 3) * w, hash(i * 5) * h, 4, 4); }
  for (let i = 0; i < 70; i++) { const x = hash(i + 11) * w, y = 60 + hash(i + 13) * (h - 120), r = 6 + hash(i + 17) * 34; c.fillStyle = 'rgba(140,138,132,0.55)'; c.beginPath(); c.arc(x, y, r, 0, 2 * PI); c.fill(); c.fillStyle = 'rgba(245,244,238,0.5)'; c.beginPath(); c.arc(x - r * 0.15, y - r * 0.15, r * 0.75, 0, 2 * PI); c.fill(); }
  // keep the face area (front, u ~ 0.75) calmer
  c.fillStyle = 'rgba(217,215,208,0.75)'; c.beginPath(); c.ellipse(w * 0.75, h * 0.5, w * 0.11, h * 0.26, 0, 0, 2 * PI); c.fill(); });
const MB = []; const mb = (geo, col, extra = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(Object.assign({ color: col, fog: false }, extra))); m.userData.base = new THREE.Color(col); MB.push(m); return m; };
const moonBody = mb(new THREE.SphereGeometry(1, 64, 32), '#ffffff', { map: craterT }); moonB.add(moonBody);
const EYES = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.3, 0.2, 0.9); moonB.add(g);
  const w = mb(new THREE.SphereGeometry(0.17, 24, 16), '#ffffff'); w.scale.z = 0.55; g.add(w);
  const p = mb(new THREE.SphereGeometry(0.085, 18, 12), '#1a1a22'); p.position.set(0, -0.01, 0.075); p.scale.z = 0.5; g.add(p);
  const hl = mb(new THREE.SphereGeometry(0.03, 10, 8), '#ffffff'); hl.position.set(0.035, 0.035, 0.12); g.add(hl);
  const st = mb(new THREE.TorusGeometry(0.09, 0.015, 6, 20), '#2a2a33'); st.position.set(0, 0, 0.1); st.visible = false; g.add(st);
  const lid = mb(new THREE.TorusGeometry(0.13, 0.028, 8, 20, PI), '#3a3030'); lid.position.set(s * 0.3, 0.17, 0.99); lid.visible = false; moonB.add(lid);
  return { g, w, p, hl, st, s, lid }; });
const smile = mb(new THREE.TorusGeometry(0.2, 0.035, 8, 28, PI), '#5a3b3b'); smile.position.set(0, -0.25, 0.96); smile.rotation.z = PI; moonB.add(smile);
const oMouth = mb(new THREE.SphereGeometry(0.11, 20, 12), '#3a2222'); oMouth.position.set(0, -0.3, 0.93); oMouth.scale.set(0.8, 1.1, 0.4); moonB.add(oMouth);
const cheeks = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.13, 24), new THREE.MeshBasicMaterial({ color: '#ff6f91', transparent: true, opacity: 0, fog: false, depthWrite: false })); m.position.set(s * 0.5, -0.08, 0.875); m.lookAt(s * 0.5 * 3, -0.08 * 3, 0.875 * 3); moonB.add(m); return m; });
const sparkS = Array.from({ length: 3 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); scene.add(s); return s; });
const moonLight = new THREE.PointLight('#fff7e0', 0, 60, 1.0); scene.add(moonLight);
// dust ring when the moon lands
const DUST = Array.from({ length: 14 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, color: '#cbbfa8', transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return { s, a: i / 14 * 2 * PI, ph: hash(i) }; });

// ---------------- hero + traffic motion ----------------
const V_FAST = 30;
const vW = t => V_FAST;
const sW = integ(vW, 0, 32, 0);
const s0R = sW(REW_TARGET);
const vR = mono([[tRew1, V_FAST], [tSlow - 0.1, V_FAST], [tSlow + 1.6, 17], [99, 17]]);
const sR = integ(vR, tRew1, TOTAL + 1, s0R);
const heroS = t => isRight(t) ? sR(Math.max(t, tRew1)) : sW(t);
const gapAhead = t => isRight(t) ? 30 + 22 * ramp(t, tKeep - 0.3, tDist + 1.0) : 30;
const laneLights = t => isRight(t) ? 1 : (t > tPitch - 0.6 ? 1 : 0);    // everyone has lights on in the dark

// ---------------- moon pose ----------------
// sky mode: relative to the hero (the sky is "at infinity")
const moonOffW = mono([[0, 1.0], [tBite - 0.8, 1.0], [tSunH + 0.1, 0.62], [tEclipse - 0.1, 0.03], [tTotal + 0.6, 0], [99, 0]]);   // in sun radii (x)
const moonOffR = mono([[0, 0], [tSlowly - 0.1, 0], [tBack + 0.4, -2.6], [99, -2.6]]);
function heroPos(t) { const f = frame(heroS(t), HD); return V3(f.x, 0, f.z); }
const tFall0 = tDrops - 0.25, tLand1 = tMotorW + 0.25, tBounce = tBounces - 0.05, tLand2 = tRolls - 0.05, tHit = tSquash - 0.05;
const RM_ROAD = 13;
const L1s = sW(tLand1) + 150, L2s = sW(tLand2) - 48;
function moonSky(t, off, upOff = 0) { const hp = heroPos(t); const side = V3(1, 0, 0), up = V3(0, 1, 0).sub(SUN_DIR.clone().multiplyScalar(SUN_DIR.y)).normalize();
  return hp.add(SUN_DIR.clone().multiplyScalar(MOON_D)).add(side.multiplyScalar(off * SUN_R * MOON_D / SUN_D * 1.0 * 2)).add(up.multiplyScalar(upOff * SUN_R)).add(V3(0, 2, 0)); }
// wrong-way moon on the road: s along path, lateral 4, rolling
const moonRoadS = t => { if (t < tLand2) return L2s; const k = t - tLand2; const vRel = (sW(tHit) - 8 - L2s) / (tHit - tLand2); return L2s + vRel * k; };
function moonPose(t) { // returns {p, q, r}
  const right = isRight(t);
  if (right || t < tFall0) { const off = right ? moonOffR(t) : moonOffW(t); const p = moonSky(t, off, right ? 0.6 * ramp(t, tSlowly, tBack + 0.4) : -1.7 * easeIn(clamp((t - tLoses) / (tFall0 - tLoses))) + (t > tLoses ? 0.06 * Math.sin(t * 25) : 0)); return { p, r: MOON_R, sky: true }; }
  if (t < tLand1) { const u = clamp((t - tFall0) / (tLand1 - tFall0)); const a = moonSky(tFall0, 0, -1.7); const f = frame(L1s, 4); const b = V3(f.x, RM_ROAD, f.z); const e = easeIn(u);
    return { p: V3(lerp(a.x, b.x, u), lerp(a.y, b.y, e), lerp(a.z, b.z, u)), r: lerp(MOON_R, RM_ROAD, u), sky: false }; }
  if (t < tLand2) { const u = clamp((t - tLand1) / (tLand2 - tLand1)); const s = lerp(L1s, L2s, u); const f = frame(s, 4); const sq = t < tBounce ? 1 - 0.12 * Math.sin(PI * clamp((t - tLand1) / (tBounce - tLand1))) : 1;
    return { p: V3(f.x, RM_ROAD + 38 * 4 * u * (1 - u), f.z), r: RM_ROAD, sq, sky: false, h: f.h }; }
  if (t < tYour - 0.1) { const s = moonRoadS(t); const f = frame(s, 4); return { p: V3(f.x, RM_ROAD, f.z), r: RM_ROAD, sky: false, h: f.h, roll: (s - L2s) / RM_ROAD }; }
  // crater shot: back in the sky, a bit closer
  const hp = heroPos(t); return { p: hp.add(V3(-45, 0, 0)).add(SUN_DIR.clone().multiplyScalar(260)), r: RM_ROAD, sky: true, crater: true };
}
// hero embedded in the moon after the squash (pose relative to the moon group)
const EMB = new THREE.Matrix4();
const _o = new THREE.Object3D();
function applyMoonPose(t, mp, camPos) {
  moonG.position.copy(mp.p); moonB.scale.setScalar(mp.r); if (mp.sq) moonB.scale.y *= mp.sq;
  if (mp.sky || mp.h === undefined) { moonG.up.set(0, 1, 0); moonG.lookAt(camPos); moonG.rotateZ(0); }
  else { moonG.rotation.set(0, 0, 0); moonG.rotation.order = 'YXZ'; moonG.rotation.y = mp.h + PI; moonG.rotation.x = 0; }
  moonBody.rotation.x = mp.roll ? mp.roll : 0;
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
// camera relative to the hero frame: off = [side, up, back], look = [side, up, ahead]
const HC = (off, look, fov = 40) => t => { const s = heroS(t); const f = frame(s, HD); const fw = V3(-Math.sin(f.h), 0, -Math.cos(f.h)), rt = V3(Math.cos(f.h), 0, -Math.sin(f.h));
  const p = V3(f.x, 0, f.z).add(rt.clone().multiplyScalar(off[0])).add(V3(0, off[1], 0)).add(fw.clone().multiplyScalar(-off[2]));
  const l = V3(f.x, 0, f.z).add(rt.clone().multiplyScalar(look[0])).add(V3(0, look[1], 0)).add(fw.clone().multiplyScalar(look[2])); return [p, l, fov]; };
const SunCam = (fov, lift = 1.6, back_ = 6) => t => { const hp = heroPos(t); const p = hp.clone().add(V3(0.8, lift, back_)); const mp = moonPose(t); const sp = hp.clone().add(SUN_DIR.clone().multiplyScalar(SUN_D)); return [p, sp, fov]; };
const MoonCam = (fov, dy = 0) => t => { const hp = heroPos(t); const p = hp.clone().add(V3(0.8, 1.8, 6)); const mp = moonPose(t); return [p, mp.p.clone().add(V3(0, dy, 0)), fov]; };
const SunMoonCam = (fov) => t => { const hp = heroPos(t); const p = hp.clone().add(V3(0.8, 1.8, 6)); return [p, hp.clone().add(SUN_DIR.clone().multiplyScalar(SUN_D)).add(V3(-14, 4, 0)), fov]; };
const AerialCam = (back_, up, ahead) => t => { const s = heroS(t); const f = frame(s - back_, 0), a = frame(s + ahead, 0); return [V3(f.x + 30, up, f.z), V3(a.x, 0, a.z), 40]; };
const ChaseBack = (ahead, up, side, fov = 40) => t => { const s = heroS(t); const f = frame(s + ahead, HD + side); const h = frame(s - 25, HD); return [V3(f.x, up, f.z), V3(h.x, 6, h.z), fov]; };
const DropCam = () => t => { const [p, l] = HC([10, 16, 34], [0, 6, 120], 40)(t); const mp = moonPose(t); return [p, l.lerp(mp.p, 0.45), 40]; };
const BounceCam = () => t => { const [p] = HC([1.5, 2.5, 16], [0, 0, 0], 40)(t); return [p, moonPose(t).p.clone().add(V3(0, -6, 0)), 40]; };
const camKeys = [
  [0.0, HC([1.2, 6.0, 16], [0.5, 1.5, 30], 40)],
  [tNot - 0.3, HC([1.0, 5.2, 14], [0.5, 2.0, 30], 40)],
  ...cut(tNot - 0.25, HC([0.8, 1.3, 7.5], [-0.5, 14, 60], 40)),
  [tThen - 0.3, HC([0.8, 1.25, 7.2], [-0.5, 15, 60], 40)],
  ...cut(tThen - 0.25, SunCam(13)),
  [tTotal - 0.3, SunCam(13)],
  ...cut(tTotal - 0.25, HC([0.8, 1.3, 7.5], [-0.5, 16, 60], 40)),
  [tPitch, HC([0.9, 1.5, 8.0], [-0.5, 14, 60], 40)],
  ...cut(tDoing - 0.25, HC([5.5, 4.0, 13], [0, 1.0, 20], 40)),
  ...cut(tWhat - 0.25, HC([6, 14, 28], [0, 0, 30], 40)),
  [S('hook2').end + 0.5, HC([6, 14, 27], [0, 0, 30], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, HC([1.8, 2.0, 8.5], [0, 2.0, 30], 40)),
  [tFull - 0.1, HC([1.8, 2.0, 8.5], [0, 2.0, 30], 40)],
  [tLight + 0.2, HC([2.2, 2.6, 11], [0, 12, 40], 40)],
  [tSky + 0.3, HC([2.2, 2.8, 11.5], [0, 16, 40], 40)],
  ...cut(tDazzle - 0.25, MoonCam(14)),
  [tLoses + 0.4, MoonCam(14)],
  [tGrip + 0.3, MoonCam(30, -20)],
  ...cut(tDrops - 0.05, DropCam()),
  [tBounces - 0.25, DropCam()],
  ...cut(tBounces - 0.2, BounceCam()),
  [tLand2 - 0.2, BounceCam()],
  ...cut(tRolls - 0.2, ChaseBack(32, 5.0, -1.0, 40)),
  [tHit + 0.6, ChaseBack(60, 10, -2.5, 40)],
  ...cut(tYour - 0.1, MoonCam(16)),
  [tRew0, MoonCam(16)],
  // right
  ...cut(tRew1, HC([6, 14, 28], [0, 0, 30], 40)),
  ...cut(tSlow - 0.15, HC([1.8, 2.4, 9], [0, 1.4, 30], 40)),
  [tKeep - 0.3, HC([1.8, 2.6, 9.5], [0, 1.4, 30], 40)],
  [tDist + 0.6, HC([2.0, 5.5, 14], [0, 0.5, 40], 40)],
  ...cut(tEveryone - 0.15, HC([4, 12, 24], [0, 0, 60], 40)),
  ...cut(tFrom - 0.1, AerialCam(70, 90, 220)),
  [tFairy + 0.6, AerialCam(60, 170, 330)],
  ...cut(tLooks - 0.6, MoonCam(14)),
  [tBack - 0.6, MoonCam(14)],
  ...cut(tSunR - 0.2, HC([2.5, 3.0, 11], [0, 9, 50], 40)),
  ...cut(tGives - 0.2, MoonCam(14)),
  [S('right6').end + 0.2, MoonCam(14)],
  ...cut(S('right7').start - 0.15, HC([1.8, 1.6, 9], [-1, 12, 60], 40)),
  [TOTAL, HC([1.6, 2.0, 10], [-1, 13, 60], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
const DAY = new THREE.Color('#8fc7ff'), NIGHT = new THREE.Color('#0c1630');
const SUN0 = sun.intensity, HEMI0 = hemi.intensity;
let screen = {};
function setLamps(car, front, rear, E) { car.userData.lamps.forEach(([k, s]) => { const a = (k === 'f' ? front : rear) * (car === hero && k === 'r' ? 0.35 : 1); s.material.opacity = a * (0.25 + 0.75 * E); s.scale.setScalar((k === 'f' ? 0.9 : 0.5) * (0.7 + 0.8 * E)); }); car.userData.hl.emissiveIntensity = 0.3 + 2.5 * front * E; car.userData.tl.emissiveIntensity = 0.35 + 2.0 * rear * E; }
function update(t) {
  const right = isRight(t);
  const E = right ? Er(t) : Ew(t);
  // ---- light / sky ----
  sun.intensity = SUN0 * Math.pow(1 - E, 1.4) + 0.02; hemi.intensity = HEMI0 * (1 - 0.76 * E);
  hemi.color.set('#e4efff').lerp(new THREE.Color('#8aa4ff'), E);
  scene.background.copy(DAY).lerp(NIGHT, E); scene.fog.color.copy(scene.background);
  stars.material.opacity = clamp((E - 0.55) / 0.4); stars.position.copy(heroPos(t));
  // ---- hero ----
  const hs = heroS(t); const hf = frame(hs, HD);
  const mp = moonPose(t);
  let embedded = !right && t >= tHit && t < tYour - 0.1;
  const crater = !right && mp.crater;
  if (!embedded && !crater) placeCar(hero, { x: hf.x, z: hf.z, h: hf.h });
  // ---- traffic ----
  const lw = laneLights(t);
  SAME.forEach(o => { const ds = o.k === 0 ? gapAhead(t) : o.ds; const f = frame(hs + ds, o.d); placeCar(o.c, { x: f.x, z: f.z, h: f.h });
    let on = lw; if (right) { const w0 = tEveryone + 0.15 + o.k * 0.12; on = t < tSlow ? 1 : (t < tEveryone ? 0.5 : 0.5 + 0.5 * ramp(t, w0, w0 + 0.2)); }
    setLamps(o.c, on, on, E);
    // squashed too in the wrong way? no – only the hero
  });
  const vRelOpp = 30;
  OPP.forEach(o => { const W0 = 620; const sA = hs - 140; const sTrue = o.s0 - (vRelOpp * t) - (hs - sW(t)); let s = sA + (((sTrue - sA) % W0) + W0) % W0; const f = frame(s, o.d); placeCar(o.c, { x: f.x, z: f.z, h: f.h + PI }); o.c.userData.prev = null;
    const on = right ? (t < tEveryone ? 0.5 : 0.5 + 0.5 * ramp(t, tEveryone + 0.3 + o.k * 0.1, tEveryone + 0.5 + o.k * 0.1)) : lw; setLamps(o.c, on, on, E); });
  // far necklace
  const wave = right ? clamp((t - tEveryone) / 2.2) : (t > tPitch ? 1 : 0);
  for (const [P, side, dir] of [[farRed, 1, 1], [farWhite, -1, -1]]) { const pa = P.geometry.attributes.position.array, ca = P.geometry.attributes.color.array;
    for (let i = 0; i < NF; i++) { const s = dir > 0 ? hs + 240 + i * 12.5 : hs + 480 + i * 12.5 - ((t * 60) % 12.5); const d = side * (i % 2 ? 2.3 : 5.9); for (const k of [0, 1]) { const f = frame(s, d + (k ? 0.6 : -0.6)); const j = (i * 2 + k) * 3; pa[j] = f.x; pa[j + 1] = 0.9; pa[j + 2] = f.z;
        const vis = (wave * NF > i ? 1 : 0) * clamp((E - 0.2) / 0.5) * (s > 0 && s < PATH.len ? 1 : 0); ca[j] = P.userData.col.r * vis; ca[j + 1] = P.userData.col.g * vis; ca[j + 2] = P.userData.col.b * vis; } }
    P.geometry.attributes.position.needsUpdate = true; P.geometry.attributes.color.needsUpdate = true; }
  // ---- hero lights ----
  const full = !right ? win(t, tFull - 0.05, tLoses + 0.3, 0.2) : 0;
  const dip = right ? ramp(t, tDipped - 0.1, tDipped + 0.25) : (t > tPitch - 0.6 && full < 0.5 ? 1 : 0);
  setLamps(hero, Math.max(dip, full), 1, E);
  if (right) hero.userData.tl.emissiveIntensity += 2.5 * win(t, tSlow - 0.1, tSlow + 1.6, 0.2);
  const fw = V3(-Math.sin(hf.h), 0, -Math.cos(hf.h)), rt = V3(Math.cos(hf.h), 0, -Math.sin(hf.h));
  const hp = V3(hf.x, 0, hf.z);
  const toMoon = mp.p.clone().sub(hp).normalize();
  fullBeams.forEach((b, i) => { b.visible = full > 0.01 && !embedded; b.position.copy(hp).addScaledVector(fw, 2.3).addScaledVector(rt, i ? 0.6 : -0.6).add(V3(0, 0.76, 0)); b.quaternion.setFromUnitVectors(V3(0, -1, 0), toMoon); b.material.opacity = 0.35 * full * (0.5 + 0.5 * E); });
  dipBeams.forEach((b, i) => { b.visible = dip * E > 0.01 && !embedded && !crater; b.position.copy(hp).addScaledVector(fw, 2.3).addScaledVector(rt, i ? 0.6 : -0.6).add(V3(0, 0.76, 0)); b.quaternion.setFromUnitVectors(V3(0, -1, 0), fw.clone().add(V3(0, -0.09, 0)).normalize()); b.material.opacity = 0.10 * dip * E; });
  dipSpot.intensity = 150 * Math.max(dip, full) * E; dipSpot.position.copy(hp).addScaledVector(fw, 2.2).add(V3(0, 0.8, 0)); dipSpot.target.position.copy(hp).addScaledVector(fw, 22); dipSpot.target.updateMatrixWorld();
  // ---- sun + moon ----
  const skyBase = heroPos(t);
  const sp = skyBase.clone().add(SUN_DIR.clone().multiplyScalar(SUN_D));
  const c = cam(t); camera.fov = c.fov; camera.near = 0.2; camera.far = 3200; camera.updateProjectionMatrix();
  sunDisc.position.copy(sp); sunDisc.lookAt(c.p); sunGlow.position.copy(sp); sunGlow.material.opacity = 0.55 * (1 - E);
  corona.position.copy(sp).addScaledVector(SUN_DIR, 30); const cov = right ? 1 - ramp(t, tSlowly, tSunR) : (t < tFall0 ? clamp(1 - Math.abs(moonOffW(t)) * 2.2) : 0);
  corona.material.opacity = 0.95 * cov * clamp((E - 0.3) / 0.5);
  applyMoonPose(t, mp, c.p);
  // moon brightness (lit by the full beam / the fairy lights / daylight)
  let bri;
  if (!right) { bri = t < tFull ? lerp(0.5, 0.1, ramp(t, tBite - 0.5, tEclipse)) : lerp(0.1, 0.85, ramp(t, tLight - 0.2, tSky + 0.2)); if (t > tLoses) bri = Math.max(bri, 0.95); }
  else { bri = lerp(0.12, 0.62, ramp(t, tLooks - 0.3, tLooks + 0.8)); bri = lerp(bri, 0.95, ramp(t, tSlides, tBack)); }
  MB.forEach(m => m.material.color.copy(m.userData.base).multiplyScalar(bri));
  // face expressions
  let open = 1, look = [0, 0], mouth = 'smile', blush = 0, dizzy = false, smileW = 1;
  if (!right) {
    if (t > tDazzle - 0.1) open = 0.35;                                                  // squinting into the beam
    for (const tb of [tBlinks, tBlinks + 0.35]) if (t > tb - 0.05 && t < tb + 0.18) open = 0.05;
    if (t > tLoses - 0.1) { open = 1.15; mouth = 'o'; }
    if (t > tHit) { dizzy = true; mouth = 'o'; }
    if (mp.crater) { dizzy = true; mouth = 'smile'; smileW = 0.6; }
  } else {
    look = t > tLooks - 0.2 && t < tSlides ? [0, -0.6 * ramp(t, tLooks - 0.2, tLooks + 0.3)] : [0, 0];
    open = t > tNever - 0.2 && t < tSlides ? 1.2 : 1;
    blush = right ? ramp(t, tBlushes - 0.1, tBlushes + 0.4) * (1 - 0.6 * ramp(t, tGives, tGives + 0.3)) : 0;
    if (t > tGives - 0.2) blush = Math.max(blush, 0.35);
  }
  const wink = right && t > tWink - 0.05 && t < tWink + 0.55;
  EYES.forEach(e => { let o = open; if (wink && e.s > 0) o = 0.06; e.g.scale.set(1, Math.max(0.05, o), 1); e.lid.visible = o < 0.15; e.g.visible = o >= 0.15;
    e.p.position.set(look[0] * 0.07, -0.01 + look[1] * 0.07, 0.075); e.p.visible = !dizzy; e.hl.visible = !dizzy; e.st.visible = dizzy; if (dizzy) e.st.rotation.z = t * 8 * e.s;
    const shine = right && t > tNever - 0.2 && t < tSlides; e.hl.scale.setScalar(shine ? 1.8 + 0.3 * Math.sin(t * 9) : 1); });
  smile.visible = mouth === 'smile'; oMouth.visible = mouth === 'o'; smile.scale.set(smileW * (right && t > tSee - 0.2 ? 1.25 : 1), smileW * (right && t > tSee - 0.2 ? 1.3 : 1), 1);
  cheeks.forEach(ch => ch.material.opacity = 0.75 * blush);
  sparkS.forEach((s, i) => { const on = right && t > tNever && t < tSlides; s.visible = on; if (!on) return; const e = EYES[i % 2]; const wp = e.g.localToWorld(V3(0.04, 0.05, 0.14)); s.position.copy(wp); s.scale.setScalar(MOON_R * (0.08 + 0.05 * Math.sin(t * 7 + i))); s.material.opacity = 0.9; });
  moonLight.intensity = 0;
  // dust where the moon lands
  const dk = !right ? t - tLand1 : -1, dk2 = !right ? t - tLand2 : -1; const dd = dk > 0 && dk < 1.6 ? dk : (dk2 > 0 && dk2 < 1.6 ? dk2 : -1);
  DUST.forEach(d => { d.s.visible = dd > 0; if (dd <= 0) return; const r = RM_ROAD * 0.6 + dd * 14; d.s.position.set(mp.p.x + Math.cos(d.a) * r, 1 + dd * 3 * (0.5 + d.ph), mp.p.z + Math.sin(d.a) * r); d.s.scale.setScalar(5 + dd * 10); d.s.material.opacity = 0.55 * (1 - dd / 1.6); });
  // ---- hero squashed into the moon ----
  if (embedded || crater) {
    moonG.updateMatrixWorld(true);
    let loc;
    if (crater) { const n = V3(-0.42, -0.34, 0.84).normalize(); const pos = n.clone().multiplyScalar(mp.r + 1.05); _o.position.copy(pos); _o.quaternion.setFromUnitVectors(V3(0, 1, 0), n.clone().negate()); _o.rotateY(0.6); }
    else { const n = V3(0, -0.75, 0.66).normalize(); const pos = n.clone().multiplyScalar(mp.r + 1.0); _o.position.copy(pos); _o.quaternion.setFromUnitVectors(V3(0, 1, 0), n.clone().negate()); }
    _o.updateMatrix(); const M = moonG.matrixWorld.clone().multiply(_o.matrix); M.decompose(hero.position, hero.quaternion, _v);
    hero.userData.bodyG.rotation.set(0, 0, 0); hero.userData.spin = (hero.userData.spin || 0) + 0.5; hero.userData.wheels.forEach(w => w.rotation.x = hero.userData.spin);
    if (!crater) { // flatten a bit for the squash moment
      hero.scale.set(1, lerp(1, 0.55, ramp(t, tHit, tHit + 0.15)), 1); } else hero.scale.set(1.6, 1.0, 1.6);
    hero.userData.prev = null;
  } else hero.scale.set(1, 1, 1);
  // fill light around the hero in the dark so the car reads
  fill.intensity = 380 * E; fill.position.copy(hp).add(V3(0, 16, 4));
  // ---- camera ----
  let shake = 0; if (!right) for (const tt of [tLand1, tLand2, tHit]) shake = Math.max(shake, win(t, tt - 0.02, tt + 0.5, 0.05));
  applyCam(c, t, shake > 0.02 ? 0.25 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { moon: project(mp.p), hero: project(hero.localToWorld(V3(0, 1.8, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('MOTORWAY  ·  12:00', '#1565c0', tMotor - 0.1, tThen - 0.2, 52);
    P_('A BITE OUT OF THE SUN?!', '#e65100', tThen - 0.1, tTotal - 0.2, 50, iconWarn);
    floatText('CHOMP!', W / 2 + 120, 1000, t, tBite, tBite + 0.9, 110, YEL, 0.08);
    P_('TOTAL ECLIPSE', '#311b92', tTotal - 0.1, tDoing - 0.2, 60, iconWarn);
    P_('120 KM/H', RED, tDoing - 0.1, S('hook2').end + 0.3, 64, iconWarn);
    P_('FULL BEAM', RED, tFull - 0.15, tBigM - 0.15, 60, iconX);
    P_('MOON: DAZZLED', RED, tDazzle - 0.1, tLoses - 0.15, 56, iconX);
    floatText('BLINK', W / 2 - 160, 1430, t, tBlinks, tBlinks + 0.8, 90, '#fff', -0.08);
    floatText('WHOA!', W / 2, 1000, t, tLoses, tLoses + 1.0, 120, YEL, 0.06);
    P_('IT DROPS', RED, tDrops - 0.1, tBounces - 0.15, 60, iconX);
    floatText('BOING!', W / 2, 1500, t, tBounces, tBounces + 0.9, 130, YEL, 0.06);
    P_('IT ROLLS AFTER YOU', RED, tRolls - 0.15, tSquash - 0.1, 52, iconX);
    floatText('SQUASH!', W / 2, 820, t, tSquash, tSquash + 0.9, 150, '#ff3b30', -0.06);
    P_('NEW CRATER', RED, tYour - 0.05, tRew0, 60, iconX);
  } else {
    P_('SLOW DOWN', GREEN, tSlow - 0.1, tDipped - 0.15, 60, iconCheck);
    P_('DIPPED HEADLIGHTS', GREEN, tDipped - 0.15, tKeep - 0.2, 54, iconCheck);
    P_('KEEP YOUR DISTANCE', GREEN, tKeep - 0.15, tEveryone - 0.2, 52, iconCheck);
    P_('EVERYONE DOES THE SAME', GREEN, tEveryone - 0.1, tFairy - 0.2, 48, iconCheck);
    P_('FAIRY LIGHTS', '#ad1457', tFairy - 0.15, S('right3').end + 0.3, 60, iconHeart);
    P_('SO BEAUTIFUL', '#ad1457', tNever - 0.1, S('right4').end + 0.2, 60, iconHeart);
    P_('IT BLUSHES', '#d81b60', tBlushes - 0.1, tSunR - 0.25, 60, iconHeart);
    P_('THE SUN IS BACK', GREEN, tSunR - 0.15, S('right5').end + 0.3, 56, iconCheck);
    floatText('*WINK*', W / 2 + 150, 1400, t, tWink, tWink + 0.9, 100, YEL, 0.08);
    P_('SEE YOU TONIGHT', '#3949ab', tSee - 0.15, S('right6').end + 0.4, 56, iconHeart);
  }
}
window.dbg = { hero, moonPose, heroS };
start(update, hud);
