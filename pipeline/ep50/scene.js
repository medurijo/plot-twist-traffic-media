// Episode 45: Overtaking a tractor – the farmer is a giant hen, the trailer is full of eggs
// hook (old style): country road, slow tractor ahead, you want to overtake -> the farmer is a giant hen, the trailer is full of eggs
// wrong: honk and squeeze past -> a frightened hen lays eggs, lots, very fast -> splat splat splat, the bonnet is hot: fried eggs, sunny side up
// right: stay back, flap your wipers twice (chicken for "may I pass, please?") -> she nods, signals with her wing, pulls over ->
//        waves as you pass, drops a thank-you egg through the sunroof -> crack: road clear and a brand new co-driver (chick in the sunroof)
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, iconArrow, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tCountry = WT('hook1', 'Country'), tSlow = WT('hook1', 'slow'), tTractor = WT('hook1', 'tractor'), tYou1 = WT('hook1', 'You'), tOvertake = WT('hook1', 'overtake');
const tBut = WT('hook2', 'But'), tFarmer = WT('hook2', 'farmer'), tGiant = WT('hook2', 'giant'), tHen = WT('hook2', 'hen'), tAndH = WT('hook2', 'And'), tTrailer = WT('hook2', 'trailer'), tEggsH = WT('hook2', 'eggs'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tHonk = WT('wrong1', 'honk'), tSqueeze = WT('wrong1', 'squeeze'), tPast = WT('wrong1', 'past');
const tBig = WT('wrong2', 'Big'), tWhen = WT('wrong2', 'When'), tFright = WT('wrong2', 'fright'), tLays = WT('wrong2', 'lays'), tLots = WT('wrong2', 'Lots'), tVery = WT('wrong2', 'Very'), tFast = WT('wrong2', 'fast');
const tSp1 = WT('wrong3', 'Splat', 0), tSp2 = tSp1 + 0.35, tSp3 = tSp1 + 0.8, tAnd3 = WT('wrong3', 'And'), tBonnet = WT('wrong3', 'bonnet'), tHot = WT('wrong3', 'hot'), tYour3 = WT('wrong3', 'Your', 1), tBreak = WT('wrong3', 'breakfast'), tSunny = WT('wrong3', 'Sunny');
const tStay = WT('right2', 'Stay'), tThen = WT('right2', 'Then'), tFlap = WT('right2', 'flap'), tWipers = WT('right2', 'wipers'), tTwice = WT('right2', 'Twice');
const tIn = WT('right3', 'In'), tChicken = WT('right3', 'chicken'), tMeans = WT('right3', 'means'), tMay = WT('right3', 'may'), tPlease = WT('right3', 'please');
const tNods = WT('right4', 'nods'), tSignals = WT('right4', 'signals'), tWing = WT('right4', 'wing'), tPulls = WT('right4', 'pulls'), tOver = WT('right4', 'over');
const tAs = WT('right5', 'As'), tPass5 = WT('right5', 'pass'), tWaves = WT('right5', 'waves'), tDrops = WT('right5', 'drops'), tThank = WT('right5', 'thank'), tEgg5 = WT('right5', 'egg'), tSunroof = WT('right5', 'sunroof');
const tCrack = WT('right6', 'Crack'), tRoad6 = WT('right6', 'Road'), tClear = WT('right6', 'clear'), tBrand = WT('right6', 'brand'), tCo = WT('right6', 'co');
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

// ---------------- world: country road ----------------
makeLandscape({ avoid: (x, z) => Math.abs(x) < 13, fieldAvoid: (x, z, w, d) => Math.abs(x) - w / 2 < 6, near: [0, -150, 120, 400], trees: 1500, seed: 4501 });
plane(-3.5, 3.5, -700, 300, asphaltMat, 0.05, 7);
{ const g = new THREE.PlaneGeometry(0.16, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -690; z < 290; z += 7) dl.push([0, 0.07, z]); instanced(g, markMat, dl, false);
  const eg = new THREE.PlaneGeometry(0.14, 1000); eg.rotateX(-Math.PI / 2); instanced(eg, markMat, [[3.25, 0.07, -200], [-3.25, 0.07, -200]], false);
  // gravel verge on the right (where the tractor pulls over)
  plane(3.5, 6.6, -700, 300, L('#b9a77f', { map: asphaltMat.map }), 0.04, 12);
  // fence posts + hay bales along the road
  const posts = []; for (let z = -690; z < 290; z += 4.5) { posts.push([-7.5, 0.6, z]); posts.push([8.2, 0.6, z]); } instanced(new THREE.BoxGeometry(0.16, 1.2, 0.16), L('#8d6e4f'), posts, true);
  const rails = []; for (let z = -690; z < 290; z += 9) { rails.push([-7.5, 0.95, z]); rails.push([8.2, 0.95, z]); } instanced(new THREE.BoxGeometry(0.08, 0.1, 9), L('#a1846a'), rails, false);
  const bales = []; const R = rng(77); for (let k = 0; k < 120; k++) { const side = R() < 0.5 ? -1 : 1; bales.push([side * (16 + R() * 40), 0.7, -690 + R() * 980]); }
  const bg = new THREE.CylinderGeometry(0.75, 0.75, 1.2, 18); bg.rotateZ(Math.PI / 2); instanced(bg, L('#e0c06a'), bales, true); }

// ---------------- tractor + trailer ----------------
const tractor = new THREE.Group(); scene.add(tractor);   // local forward -z
const TR = {};
{ const red = STD('#d32f2f', { roughness: 0.4, metalness: 0.2 }), dark = STD('#2b2b2b', { roughness: 0.7 }), yel = STD('#fdd835', { roughness: 0.45 });
  const add = (geo, mat, x, y, z, p = tractor) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  add(new THREE.BoxGeometry(1.3, 1.0, 2.6), red, 0, 1.25, -1.0);          // hood
  add(new THREE.BoxGeometry(1.36, 0.25, 0.1), dark, 0, 1.1, -2.31);       // grille
  add(new THREE.BoxGeometry(1.8, 0.35, 1.6), red, 0, 1.0, 0.7);           // rear body
  add(new THREE.BoxGeometry(0.9, 0.18, 0.8), dark, 0, 1.9, 0.75);          // seat
  add(new THREE.BoxGeometry(0.9, 0.7, 0.14), dark, 0, 2.3, 1.12);          // seat back
  add(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 8), dark, -0.55, 2.2, -1.3);   // exhaust
  const sw = add(new THREE.TorusGeometry(0.32, 0.05, 8, 20), dark, 0, 2.35, -0.25); sw.rotation.x = -0.9;
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), dark, 0, 2.0, -0.45).rotation.x = -0.9;
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.5, 0.12, 1.5), red, s * 1.05, 2.05, 0.7); }   // mudguards
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.12, 10, 8), STD('#fffbe8', { emissive: '#fff3b0', emissiveIntensity: 0.4 }), s * 0.5, 1.55, -2.32);
  TR.wheels = [];
  const mkW = (r, w, x, z) => { const g = new THREE.Group(); g.position.set(x, r, z); tractor.add(g);
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 28), STD('#222', { roughness: 0.9 })); tyre.rotation.z = Math.PI / 2; tyre.castShadow = true; g.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, w + 0.02, 20), yel); rim.rotation.z = Math.PI / 2; g.add(rim);
    for (let k = 0; k < 10; k++) { const lug = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.12, 0.22), STD('#1a1a1a')); const a = k / 10 * Math.PI * 2; lug.position.set(0, Math.cos(a) * r, Math.sin(a) * r); lug.rotation.x = a; g.add(lug); }
    TR.wheels.push({ g, r }); };
  mkW(1.05, 0.62, -1.15, 0.7); mkW(1.05, 0.62, 1.15, 0.7); mkW(0.55, 0.32, -0.8, -1.7); mkW(0.55, 0.32, 0.8, -1.7);
  // amber beacon (indicator)
  TR.ind = new THREE.MeshStandardMaterial({ color: '#7a4a00', emissive: '#ffa000', emissiveIntensity: 0 });
  add(new THREE.BoxGeometry(0.2, 0.14, 0.12), TR.ind, 0.75, 1.3, 1.52); add(new THREE.BoxGeometry(0.2, 0.14, 0.12), TR.ind, 0.66, 1.5, -2.32); }
const trailer = new THREE.Group(); scene.add(trailer);
const EGG_LOCAL = [];
const eggGeo = new THREE.SphereGeometry(1, 24, 18); eggGeo.scale(0.5, 0.66, 0.5); { const p = eggGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = y > 0 ? 0.88 : 1.08; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } eggGeo.computeVertexNormals(); }
const eggMat = STD('#ecd6b2', { roughness: 0.55 });
{ const wood = STD('#9c6b3c', { roughness: 0.8 }), dark = STD('#2b2b2b', { roughness: 0.7 });
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; trailer.add(m); return m; };
  add(new THREE.BoxGeometry(2.3, 0.18, 3.8), wood, 0, 0.95, 0);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.1, 0.55, 3.8), wood, s * 1.12, 1.3, 0);
  add(new THREE.BoxGeometry(2.3, 0.55, 0.1), wood, 0, 1.3, 1.88); add(new THREE.BoxGeometry(2.3, 0.55, 0.1), wood, 0, 1.3, -1.88);
  add(new THREE.BoxGeometry(0.12, 0.12, 1.6), dark, 0, 0.85, -2.6);
  add(new THREE.BoxGeometry(2.1, 0.12, 3.5), STD('#e8c96a', { roughness: 1 }), 0, 1.08, 0);   // straw
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20), STD('#222', { roughness: 0.9 })); w.rotation.z = Math.PI / 2; w.position.set(s * 1.3, 0.5, 0); w.castShadow = true; trailer.add(w); }
  // tail lights + "SLOW" plate
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.3, 0.14, 0.06), STD('#7a0000', { emissive: '#ff1010', emissiveIntensity: 0.4 }), s * 0.85, 1.0, 1.94);
  const tri = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ff6d00'; c.beginPath(); c.moveTo(64, 8); c.lineTo(122, 116); c.lineTo(6, 116); c.closePath(); c.fill(); c.strokeStyle = '#c62828'; c.lineWidth = 12; c.stroke(); });
  const tp = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), new THREE.MeshStandardMaterial({ map: tri, transparent: true })); tp.position.set(0, 1.3, 1.94); trailer.add(tp);
  const P = [[-0.55, -1.2], [0.5, -1.25], [-0.5, 0], [0.55, 0.05], [-0.5, 1.2], [0.5, 1.15], [0, -0.6], [0.02, 0.62], [0, 1.65 - 0.4]];
  P.forEach(([x, z], i) => { const top = i >= 6; const e = new THREE.Mesh(eggGeo, eggMat); e.position.set(x, top ? 2.05 : 1.75, z); e.rotation.set((hash(i) - 0.5) * 0.4, hash(i + 3) * 3, (hash(i + 5) - 0.5) * 0.4); e.castShadow = e.receiveShadow = true; trailer.add(e); EGG_LOCAL.push(e); }); }
const tarp = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), STD('#3f6b3a', { roughness: 0.85, side: THREE.DoubleSide })); tarp.castShadow = true; scene.add(tarp);

// ---------------- hen ----------------
const hen = new THREE.Group(); scene.add(hen);   // local forward -z, origin at body centre
const HN = {};
{ const brown = STD('#b5652e', { roughness: 0.75 }), cream = STD('#f3dcb0', { roughness: 0.8 }), red = STD('#e53935', { roughness: 0.5 }), orange = STD('#ffa726', { roughness: 0.4 });
  const featT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(90,40,10,0.25)'; c.lineWidth = 5; for (let r = 0; r < 10; r++) for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(k * 30 + (r % 2) * 15, r * 28, 15, 0.1, Math.PI - 0.1); c.stroke(); } }, true);
  featT.repeat.set(2.5, 2.5); brown.map = featT;
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), brown); body.scale.set(1.2, 1.1, 1.4); hen.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), cream); chest.scale.set(0.95, 0.95, 0.8); chest.position.set(0, 0.05, -0.75); hen.add(chest);
  // neck + head
  const neck = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 14), brown); neck.position.set(0, 0.95, -0.85); hen.add(neck);
  const hd = new THREE.Group(); hd.position.set(0, 1.45, -1.0); hen.add(hd); HN.head = hd;
  const hs = new THREE.Mesh(new THREE.SphereGeometry(0.58, 28, 20), brown); hd.add(hs);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.45, 12), orange); beak.rotation.x = -Math.PI / 2; beak.position.set(0, -0.05, -0.68); hd.add(beak); HN.beak = beak;
  const beakLo = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), orange); beakLo.rotation.x = -Math.PI / 2; beakLo.position.set(0, -0.15, -0.6); hd.add(beakLo); HN.beakLo = beakLo;
  for (let k = 0; k < 3; k++) { const cb = new THREE.Mesh(new THREE.SphereGeometry(0.17 - k * 0.02, 12, 8), red); cb.position.set(0, 0.6 - k * 0.05, -0.25 + k * 0.22); hd.add(cb); }
  const wat = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), red); wat.scale.set(0.8, 1.5, 0.8); wat.position.set(0, -0.36, -0.52); hd.add(wat);
  HN.eyes = [-1, 1].map(s => { const w = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), STD('#fff', { roughness: 0.2 })); w.position.set(s * 0.34, 0.12, -0.38); hd.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), STD('#111', { roughness: 0.15 })); p.position.set(s * 0.4, 0.14, -0.49); hd.add(p);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(s * 0.42, 0.18, -0.55); hd.add(hl); return { w, p, hl, s }; });
  // straw hat
  const hatG = new THREE.Group(); hatG.position.set(0, 0.5, 0.12); hatG.rotation.set(0.15, 0, -0.12); hd.add(hatG);
  const straw = STD('#e8c96a', { roughness: 0.9 });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 28), straw); hatG.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.42, 22), straw); crown.position.y = 0.22; hatG.add(crown);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.1, 22), STD('#c62828')); band.position.y = 0.08; hatG.add(band);
  HN.hat = hatG;
  // wings (pivot at the shoulder)
  HN.wings = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 1.05, 0.35, -0.2); hen.add(piv);
    const wm = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), brown); wm.scale.set(0.22, 0.62, 1.0); wm.position.set(s * 0.12, -0.38, 0.35); piv.add(wm);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), STD('#7a3d17', { roughness: 0.8 })); tip.scale.set(0.16, 0.38, 0.6); tip.position.set(s * 0.14, -0.75, 0.75); piv.add(tip);
    return { piv, s }; });
  // tail feathers
  for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.28; const f = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), STD(k % 2 ? '#3e2a1a' : '#5d4027', { roughness: 0.6 })); f.scale.set(0.16, 0.75, 0.32); f.position.set(Math.sin(a) * 0.4, 0.75, 1.25); f.rotation.set(-0.7, 0, a); hen.add(f); }
  hen.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }

// ---------------- hero car: wipers, sunroof, fried eggs, chick ----------------
const hero = makeCar('#1e88e5');
hero.userData.bodyG.children[1].material.color.set('#4a6c8c');
const N_WS = V3(0, 0.645, -0.764).normalize();
const wiperG = new THREE.Group(); hero.userData.bodyG.add(wiperG); wiperG.position.copy(V3(0, 1.0, -1.06).addScaledVector(N_WS, 0.09));
{ const q = new THREE.Quaternion().setFromUnitVectors(V3(0, 0, 1), N_WS); wiperG.quaternion.copy(q); }
const WIP = [-0.62, 0.08].map(x => { const piv = new THREE.Group(); piv.position.set(x, 0.0, 0); wiperG.add(piv); const arm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.05), STD('#e8e8e8', { roughness: 0.3, metalness: 0.5 })); arm.position.x = 0.31; piv.add(arm); return piv; });
const sunroof = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.02, 0.62), STD('#0a0d12', { roughness: 0.3 })); sunroof.position.set(0, 1.612, -0.02); hero.userData.bodyG.add(sunroof);
const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.64), hero.userData.body); roofPanel.position.set(0, 1.62, -0.02); hero.userData.bodyG.add(roofPanel);
const friedShape = (() => { const s = new THREE.Shape(); for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2, r = 1 + 0.16 * Math.sin(3 * a + 0.5) + 0.09 * Math.sin(5 * a + 1.3); const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); } return s; })();
const friedGeo = new THREE.ShapeGeometry(friedShape, 2); const whiteMat = STD('#fbfbf6', { roughness: 0.35 }), yolkMat = STD('#ffb300', { roughness: 0.2, emissive: '#ff8f00', emissiveIntensity: 0.12 });
function makeFried(scale = 1) { const g = new THREE.Group(); const w = new THREE.Mesh(friedGeo, whiteMat); w.scale.setScalar(0.55 * scale); w.receiveShadow = true; g.add(w); const y = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), yolkMat); y.rotation.x = Math.PI / 2; y.position.set(0.06 * scale, 0.05 * scale, 0.01); g.add(y); return g; }
// fried eggs on the car (bonnet, windscreen, roof): plane faces +z, rotate to the surface normal
const CARFRIED = [[V3(0.1, 1.0, -1.6), V3(0, 1, 0), 1.25], [V3(-0.15, 1.2, -0.88).addScaledVector(N_WS, 0.09), N_WS, 0.85], [V3(0.0, 1.64, -0.05), V3(0, 1, 0), 1.0]].map(([p, n, sc]) => { const g = makeFried(sc); g.position.copy(p); g.quaternion.setFromUnitVectors(V3(0, 0, 1), n); g.visible = false; hero.userData.bodyG.add(g); return g; });
const roadFried = Array.from({ length: 26 }, () => { const g = makeFried(0.9); g.rotation.x = -Math.PI / 2; g.visible = false; scene.add(g); return g; });
const flyEggs = Array.from({ length: 30 }, () => { const e = new THREE.Mesh(eggGeo, eggMat); e.castShadow = true; e.visible = false; scene.add(e); return e; });
// chick
const chick = new THREE.Group(); hero.userData.bodyG.add(chick); const CK = {};
{ const yel = STD('#ffd54f', { roughness: 0.8 }); const b = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 12), yel); chick.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), yel); h.position.set(0, 0.32, -0.04); chick.add(h); CK.h = h;
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 8), STD('#ff8f00')); bk.rotation.x = -Math.PI / 2; bk.position.set(0, 0.3, -0.27); chick.add(bk);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), STD('#111')); e.position.set(s * 0.09, 0.38, -0.19); chick.add(e); }
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), STD('#f7ead4', { roughness: 0.45, side: THREE.DoubleSide })); shell.position.set(0, 0.44, 0); shell.rotation.z = 0.25; chick.add(shell);
  CK.w = [-1, 1].map(s => { const w = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), yel); w.scale.set(0.4, 1, 0.7); w.position.set(s * 0.26, 0.02, 0); chick.add(w); return w; });
  chick.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const shells = Array.from({ length: 10 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6, 0, 1.6, 0, 1.2), STD('#f7ead4', { side: THREE.DoubleSide })); m.visible = false; scene.add(m); return m; });

// feathers (fright) + steam
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 120 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#ffffff' })); s.visible = false; scene.add(s); return s; });
let si = 0; function smoke(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }
const NF = 36; const feath = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), STD('#ffffff', { roughness: 0.8 }), NF); feath.frustumCulled = false; feath.castShadow = true; scene.add(feath);
for (let i = 0; i < NF; i++) feath.setColorAt(i, new THREE.Color(i % 3 ? '#c27a3f' : '#f3dcb0'));

// ---------------- motion ----------------
const V = 5.0;
const tStop = tPulls - 0.1, DEC = 2.8;
function TZ(t) { if (!isRight(t) || t < tStop) return -V * t; const dt = Math.min(t - tStop, DEC); return -V * tStop - V * (dt - dt * dt / (2 * DEC)); }
const TX = t => isRight(t) ? lerp(1.75, 4.95, ease(clamp((t - tPulls + 0.1) / 2.2))) : 1.75;
const relH = mono([[0, 30], [tSlow + 0.4, 14], [tYou1 + 0.3, 12.5], [99, 12.5]]);
const relW = mono([[0, 30], [tSlow + 0.4, 14], [tYou1 + 0.3, 12.5], [tSqueeze - 0.1, 12.5], [tPast + 0.9, 4.6], [99, 4.6]]);
const xW = mono([[0, 1.75], [tSqueeze - 0.2, 1.75], [tPast + 0.6, -1.75], [99, -1.75]]);
const tBrake = tAnd3;
const tGo = tPulls + 0.3;
function carXZ(t) {
  if (!isRight(t)) {
    if (t < tBrake) return [xW(t), TZ(t) + relW(t)];
    const dt = Math.min(t - tBrake, 1.6); return [-1.75, TZ(tBrake) + 4.6 - V * (dt - dt * dt / 3.2)];
  }
  if (t < tGo) return [1.75, TZ(t) + relH(t)];
  const z0 = TZ(tGo) + 12.5, dt = t - tGo; const ta = 1.8; const d = dt < ta ? V * dt + 2.5 * dt * dt : V * ta + 2.5 * ta * ta + 14 * (dt - ta);
  return [1.75, z0 - d];
}
function carPose(t) { const [x, z] = carXZ(t); const [x2, z2] = carXZ(t + 0.05); const dz = z2 - z; const h = Math.abs(dz) > 1e-3 ? Math.atan2(-(x2 - x), -dz) : 0; return { x, z, h: clamp(h, -0.35, 0.35) }; }

// hen pose (relative to the tractor seat)
function henPose(t) {
  const right = isRight(t);
  let y = 0, bob = 0.05 * Math.sin(t * 7), headYaw = 0, headPitch = 0.05 * Math.sin(t * 2.3), headRoll = 0, wing = [0.1, 0.1], wingFwd = [0, 0], beak = 0, eyesBig = 0, body = 0;
  // idle: small pecks toward the steering wheel
  headPitch += 0.25 * Math.max(0, Math.sin(t * 1.7)) ** 8;
  if (!right) {
    const fr = win(t, tBig - 0.1, tLays, 0.12);   // fright jump
    y += fr * (0.7 * Math.abs(Math.sin((t - tBig) * 5.5))); eyesBig = Math.max(fr, win(t, tLays, tSp3 + 0.4, 0.2) * 0.7);
    const fl = Math.max(fr, win(t, tLays - 0.1, tSp3 + 0.3, 0.2) * 0.6); wing = [0.2 + fl * (0.6 + 0.5 * Math.sin(t * 26)), 0.2 + fl * (0.6 + 0.5 * Math.sin(t * 26 + 0.6))];
    beak = Math.max(fr, 0.6 * win(t, tLays, tSp3, 0.15)) * Math.abs(Math.sin(t * 13));
    headRoll = 0.15 * fr * Math.sin(t * 17); headYaw = 0.45 * win(t, tSp1 - 0.2, tSunny + 1.5, 0.4);   // looks back at the mess
    body = win(t, tLays - 0.05, tSp3 + 0.2, 0.1) * 0.12 * Math.max(0, Math.sin(t * 22));          // laying jolts
  } else {
    // looks back over her shoulder at the wipers, tilts head ('may I pass, please?')
    const lk = win(t, tWipers - 0.3, tNods - 0.1, 0.45); headYaw = lk * 2.2; headRoll = lk * 0.35 * ramp(t, tMeans - 0.2, tMeans + 0.3);
    const nod = win(t, tNods - 0.1, tSignals - 0.1, 0.1); headPitch += nod * 0.45 * Math.max(0, Math.sin((t - tNods + 0.1) * 12));
    // signal with the right wing (straight out), then wave
    const sg = win(t, tSignals - 0.15, tPulls + 1.4, 0.3); wing[1] = 0.1 + sg * 1.45 + sg * 0.12 * Math.sin(t * 9);
    const wv = win(t, tWaves - 0.5, tDrops + 0.2, 0.25); wing[0] = 0.1 + wv * (1.6 + 0.5 * Math.sin(t * 11)); headYaw = Math.max(headYaw, wv * -0.9) + (wv > 0 ? -0.9 * wv : 0);
    const lay = win(t, tDrops - 0.25, tDrops + 0.35, 0.1); y += 0.35 * lay; beak = Math.max(beak, lay);
    const wv2 = win(t, tClear, TOTAL, 0.4); wing[0] = Math.max(wing[0], 0.1 + wv2 * (1.5 + 0.5 * Math.sin(t * 9))); headYaw += wv2 * -0.7;
    beak = Math.max(beak, win(t, tNods - 0.1, tNods + 0.6, 0.1) * Math.abs(Math.sin(t * 14)));
  }
  return { y, bob, headYaw, headPitch, headRoll, wing, beak, eyesBig, body };
}

// eggs: wrong-way volley [launch time, landing target fn, carSlot]
const henTail = t => { const p = V3(TX(t), 3.3, TZ(t) + 1.7); return p; };
const EGGS = [];
{ const R = rng(9); const n = 18; for (let k = 0; k < n; k++) { const tl = tLays + k * ((tSp1 - 0.85 - tLays) / n) + (R() - 0.5) * 0.05; const dur = 0.75 + R() * 0.15; const tland = tl + dur;
    const rz = 2.0 + R() * 5.0, rx = -3.0 + R() * 2.2; EGGS.push({ tl, dur, target: () => V3(rx, 0.12, TZ(tland) + rz), slot: -1 }); }
  [tSp1, tSp2, tSp3].forEach((ts, i) => { const dur = 0.8; EGGS.push({ tl: ts - dur, dur, target: null, slot: i }); }); }
const carSlotWorld = (i, t) => { const cp = carPose(t); const m = new THREE.Matrix4().compose(V3(cp.x, 0, cp.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, cp.h, 0)), V3(1, 1, 1)); return CARFRIED[i].position.clone().applyMatrix4(m); };

// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const CarCam = (off, look, fov = 40) => t => { const c = carPose(t); return [V3(c.x + off[0], off[1], c.z + off[2]), V3(c.x + look[0], look[1], c.z + look[2]), fov]; };
const TrCam = (off, look, fov = 40) => t => { const x = TX(t), z = TZ(t); return [V3(x + off[0], off[1], z + off[2]), V3(x + look[0], look[1], z + look[2]), fov]; };
const camKeys = [
  [0.0, CarCam([9, 11, 22], [-1, 1.5, -24], 40)],
  [tSlow - 0.25, CarCam([7, 9, 18], [-1, 1.5, -22], 40)],
  ...cut(tSlow - 0.2, CarCam([1.6, 2.7, 8.0], [-0.2, 2.6, -14], 40)),
  [tYou1 - 0.25, CarCam([1.5, 2.7, 7.6], [-0.2, 2.6, -14], 40)],
  ...cut(tYou1 - 0.2, CarCam([-3.4, 1.5, 4.2], [0.6, 1.5, -6], 40)),
  [S('hook1').end + 0.2, CarCam([-3.5, 1.6, 4.0], [0.6, 1.6, -6], 40)],
  ...cut(tFarmer - 0.15, TrCam([2.6, 4.8, -9.5], [0, 4.0, 0.3], 36)),
  [tAndH - 0.25, TrCam([2.4, 4.7, -9.0], [0, 4.0, 0.3], 36)],
  ...cut(tAndH - 0.2, TrCam([3.6, 6.8, 11.0], [0, 1.8, 4.6], 40)),
  [tWhat - 0.3, TrCam([3.4, 6.6, 10.5], [0, 1.8, 4.6], 40)],
  ...cut(tWhat - 0.25, CarCam([3.0, 5.6, 9.5], [-0.3, 2.8, -10], 40)),
  [S('wrong1').start - 0.1, CarCam([2.9, 5.5, 9.2], [-0.3, 2.8, -10], 40)],
  // wrong
  ...cut(S('wrong1').start, CarCam([2.0, 3.0, 8.5], [-0.2, 2.2, -12], 40)),
  [tSqueeze - 0.3, CarCam([1.8, 3.0, 8.0], [-0.2, 2.2, -12], 40)],
  ...cut(tSqueeze - 0.25, TrCam([-8.5, 6.5, 13], [-1.2, 1.8, 3.5], 40)),
  [S('wrong1').end + 0.2, TrCam([-8.5, 6.5, 11], [-1.4, 1.8, 2.5], 40)],
  ...cut(tBig - 0.15, TrCam([2.6, 4.9, -9.2], [0, 4.1, 0.4], 38)),
  [tLays - 0.35, TrCam([2.4, 4.9, -8.8], [0, 4.1, 0.4], 38)],
  ...cut(tLays - 0.3, TrCam([-13.0, 7.5, 10.0], [-0.4, 2.6, 2.8], 42)),
  [tSp1 - 0.3, TrCam([-12.6, 7.3, 9.6], [-0.6, 2.4, 3.0], 42)],
  ...cut(tSp1 - 0.25, CarCam([-3.6, 2.9, -5.6], [0.0, 1.2, -0.2], 40)),
  [tBonnet - 0.3, CarCam([-3.6, 2.9, -5.4], [0.0, 1.2, -0.2], 40)],
  ...cut(tBonnet - 0.25, CarCam([-2.2, 2.4, -3.8], [0.1, 1.1, -1.2], 36)),
  [tYour3 - 0.3, CarCam([-2.3, 2.5, -3.9], [0.1, 1.1, -1.2], 36)],
  ...cut(tYour3 - 0.25, CarCam([-4.8, 3.6, -6.5], [0.2, 1.0, 0], 40)),
  [tRew0, CarCam([-6.0, 4.6, -8.5], [0.4, 1.2, 0], 40)],
  // right
  ...cut(tRew1, CarCam([2.0, 3.6, 9.0], [-0.2, 2.4, -12], 40)),
  [tStay - 0.2, CarCam([2.0, 3.6, 9.0], [-0.2, 2.4, -12], 40)],
  ...cut(tStay - 0.15, CarCam([5.0, 7.0, 12.0], [-0.4, 1.8, -8], 40)),
  [tFlap - 0.3, CarCam([4.8, 6.8, 11.5], [-0.4, 1.8, -8], 40)],
  ...cut(tFlap - 0.25, CarCam([2.6, 3.0, -6.2], [0.0, 1.1, -0.8], 36)),
  [S('right2').end + 0.2, CarCam([2.7, 3.0, -6.0], [0.0, 1.1, -0.8], 36)],
  ...cut(tIn - 0.15, TrCam([1.6, 5.4, 5.8], [0, 4.3, -0.2], 40)),
  [tMay - 0.3, TrCam([1.5, 5.3, 5.4], [0, 4.3, -0.2], 40)],
  ...cut(tMay - 0.25, CarCam([2.6, 3.0, -6.2], [0.0, 1.2, -0.8], 36)),
  [S('right3').end + 0.2, CarCam([2.7, 3.0, -6.0], [0.0, 1.2, -0.8], 36)],
  ...cut(tNods - 0.2, TrCam([2.8, 4.9, -9.2], [0, 4.0, 0.4], 36)),
  [tSignals - 0.3, TrCam([2.6, 4.9, -8.8], [0, 4.0, 0.4], 36)],
  ...cut(tSignals - 0.25, TrCam([4.5, 5.4, -13.0], [0.9, 3.2, 0.4], 40)),
  [tPulls - 0.3, TrCam([4.5, 5.3, -12.6], [0.9, 3.2, 0.4], 40)],
  ...cut(tPulls - 0.25, t => { const c = carPose(t); return [V3(-3.5, 9.0, c.z + 12), V3(2.2, 1.4, TZ(t) + 2.5), 40]; }),
  [S('right4').end + 0.2, t => { const c = carPose(t); return [V3(-3.5, 9.0, c.z + 12), V3(2.2, 1.4, TZ(t) + 2.5), 40]; }],
  ...cut(tAs - 0.15, TrCam([-8.4, 5.0, -12.5], [-0.6, 3.0, 1.0], 42)),
  [tDrops - 0.3, TrCam([-8.4, 5.0, -13.0], [-0.8, 2.8, 0.5], 42)],
  ...cut(tDrops - 0.25, CarCam([2.4, 4.6, -10.0], [0.4, 2.6, 5.0], 42)),
  [S('right5').end + 0.15, CarCam([2.2, 4.4, -9.0], [0.2, 2.0, 2.0], 42)],
  ...cut(tCrack - 0.2, CarCam([2.0, 3.6, 3.0], [0, 1.7, -0.2], 38)),
  [tBrand - 0.3, CarCam([2.0, 3.6, 3.0], [0, 1.8, -0.2], 38)],
  ...cut(tBrand - 0.25, CarCam([1.3, 2.4, -4.6], [0, 1.95, -0.1], 34)),
  [S('right7').start - 0.1, CarCam([1.4, 2.5, -4.8], [0, 2.0, -0.1], 34)],
  ...cut(S('right7').start, CarCam([-4.0, 3.2, -9.0], [0.5, 1.6, 3.0], 40)),
  [S('outro').start, CarCam([-5.0, 4.5, -11.0], [0.6, 1.8, 3.0], 40)],
  [TOTAL, CarCam([-5.5, 6.5, -13.0], [0.6, 2.2, 3.0], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = V3(1, 1, 1);
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  // tractor + trailer
  const tz = TZ(t), tx = TX(t); const tz2 = TZ(t + 0.05), tx2 = TX(t + 0.05); const yaw = Math.abs(tz2 - tz) > 1e-4 ? Math.atan2(-(tx2 - tx), -(tz2 - tz)) : 0;
  tractor.position.set(tx, 0.04 * Math.abs(Math.sin(t * 9)) * (Math.abs(tz2 - tz) > 0.05 ? 1 : 0), tz); tractor.rotation.set(0, yaw, 0.012 * Math.sin(t * 5.3));
  TR.wheels.forEach(W2 => W2.g.rotation.x = tz / W2.r);
  const on = Math.floor(t * 2.6) % 2 === 0; TR.ind.emissiveIntensity = right && t > tSignals - 0.1 && t < tAs + 1.0 && on ? 2.5 : 0;
  const tyaw = yaw * 0.6; trailer.position.set(tx - Math.sin(tyaw) * 4.6, 0, tz + Math.cos(tyaw) * 4.6); trailer.rotation.set(0, tyaw, 0);
  // tarp: covers the eggs until 'trailer' (hook), then the wind takes it
  const tu = clamp((t - tTrailer + 0.1) / 1.6); tarp.visible = tu < 1 && !right && t < tWhat + 1;
  if (tarp.visible) { tarp.position.copy(trailer.localToWorld(V3(0, 1.15, 0))).add(V3(-2.5 * tu, 6 * tu * (1.4 - tu), 14 * tu * tu)); tarp.scale.set(1.25 * (1 - 0.4 * tu), 1.75 * (1 - 0.6 * tu), 2.05 * (1 - 0.3 * tu)); tarp.rotation.set(-2.5 * tu * tu, tyaw + 1.2 * tu, 1.6 * tu); }
  // hen
  const hp = henPose(t); trailer.updateMatrixWorld(true); tractor.updateMatrixWorld(true);
  hen.position.copy(tractor.localToWorld(V3(0, 3.05 + hp.y + hp.bob, 0.55))); hen.rotation.set(-0.05 + hp.body, yaw, 0, 'YXZ');
  HN.head.rotation.set(hp.headPitch, hp.headYaw, hp.headRoll, 'YXZ'); HN.beakLo.rotation.x = -Math.PI / 2 + 0.5 * hp.beak; HN.beakLo.position.y = -0.15 - 0.06 * hp.beak;
  HN.eyes.forEach(E => { const s = 1 + 0.5 * hp.eyesBig; E.w.scale.setScalar(s); E.p.scale.setScalar(1 - 0.3 * hp.eyesBig); });
  HN.hat.position.y = 0.5 + 0.4 * (!right ? win(t, tBig - 0.1, tFright, 0.1) * Math.abs(Math.sin((t - tBig) * 7)) : 0);
  HN.wings.forEach((Wg, k) => { Wg.piv.rotation.set(0, 0, Wg.s * hp.wing[k]); });
  // feathers burst (fright)
  for (let i = 0; i < NF; i++) { const dt = t - tBig - hash(i) * 0.5; let ok = !right && dt > 0 && dt < 3.0; if (ok) { const a = hash(i + 3) * 6.283, sp = 1.5 + hash(i + 7) * 2.5; const p = hen.position.clone().add(V3(Math.cos(a) * sp * Math.min(dt, 1.2), 1.0 + 1.8 * Math.min(dt, 0.6) - 0.6 * Math.max(0, dt - 0.6) + 0.15 * Math.sin(dt * 6 + i), Math.sin(a) * sp * Math.min(dt, 1.2) + V * dt * 0.9));
      _m.compose(p, _q.setFromEuler(new THREE.Euler(dt * 3 + i, dt * 2, Math.sin(dt * 5 + i))), _s.set(0.06, 0.22, 0.12).multiplyScalar(1 - dt / 3.0)); } if (!ok) _m.makeScale(0, 0, 0); feath.setMatrixAt(i, _m); }
  feath.instanceMatrix.needsUpdate = true;
  // car
  const cp = carPose(t); placeCar(hero, cp);
  const brakeShake = !right && t > tSp1 - 0.05 && t < tSp3 + 0.4 ? 0.03 * Math.sin(t * 40) : 0; hero.userData.bodyG.position.y += brakeShake;
  blink(hero, t, !right ? (t > tYou1 && t < tPast + 0.5) : (t > tYou1 && t < S('hook2').end), false);
  hero.userData.hl.emissiveIntensity = 0.5;
  // wipers: two flaps
  const wp = right ? Math.max(win(t, tWipers - 0.2, tWipers + 0.45, 0.2), win(t, tTwice - 0.1, tTwice + 0.55, 0.2)) : 0; WIP.forEach(p => p.rotation.z = -1.75 * wp);
  // sunroof slides open before the thank-you egg
  const so = right ? ease(clamp((t - tWaves) / 0.6)) : 0; roofPanel.position.z = -0.02 + 0.62 * so; roofPanel.position.y = 1.62 + 0.04 * so;
  // flying eggs + splats
  flyEggs.forEach(e => e.visible = false); roadFried.forEach(e => e.visible = false); CARFRIED.forEach(g => g.visible = false);
  if (!right) { let fe = 0, rf = 0;
    EGGS.forEach((E, k) => { const u = (t - E.tl) / E.dur; if (u < 0) return; const tland = E.tl + E.dur;
      const tgt = E.slot >= 0 ? carSlotWorld(E.slot, Math.min(t, tland)) : E.target();
      if (u < 1) { const e = flyEggs[fe++]; if (!e) return; const p0 = henTail(E.tl); const p = p0.clone().lerp(tgt, u); p.y += 3.0 * Math.sin(Math.PI * u); e.position.copy(p); e.rotation.set(t * 7 + k, t * 3, 0); e.visible = true; }
      else if (E.slot >= 0) { CARFRIED[E.slot].visible = true; const s = back(clamp((t - tland) / 0.25)); CARFRIED[E.slot].scale.setScalar(Math.max(0.01, s)); }
      else { const r = roadFried[rf++]; if (!r) return; r.visible = true; r.position.copy(tgt); r.position.y = 0.09; r.rotation.set(-Math.PI / 2, 0, k); r.scale.setScalar(Math.max(0.01, back(clamp((t - tland) / 0.25)))); } });
    // hot bonnet: steam
    if (t > tSp1) for (let k = 0; k < 18; k++) { const ph = ((t - tSp1) * 0.6 + k / 18) % 1; const p = hero.localToWorld(V3((hash(k) - 0.5) * 1.4, 1.1 + ph * 1.6, -1.6 + (hash(k + 4) - 0.5) * 1.6 + ph * 0.3)); smoke(p, 0.3 + 0.7 * ph, 0.5 * Math.sin(Math.PI * ph) * ramp(t, tSp1, tHot), '#ffffff'); }
  }
  // thank-you egg -> sunroof; crack; chick
  let thank = null;
  if (right) { const tl = tDrops - 0.05, dur = tSunroof + 0.3 - tl; const u = (t - tl) / dur;
    if (u >= 0 && u < 1) { const e = flyEggs[0]; e.visible = true; hero.updateMatrixWorld(true); const p0 = henTail(tl).add(V3(-0.4, -0.4, 0)); const p1 = hero.localToWorld(V3(0, 1.7, -0.02)); const p = p0.lerp(p1, ease(u)); p.y += 3.5 * Math.sin(Math.PI * u); e.position.copy(p); e.rotation.set(t * 5, 0, t * 3); e.scale.setScalar(lerp(1, 0.5, ease(u))); thank = p; }
    else flyEggs[0].scale.setScalar(1); }
  const crk = right ? t - tCrack : -1;
  shells.forEach((m, i) => { const ok = crk > 0 && crk < 1.4; m.visible = ok; if (ok) { const a = i / shells.length * 6.283; const p = hero.localToWorld(V3(Math.cos(a) * 1.4 * crk, 1.75 + 3.0 * crk - 3.5 * crk * crk, -0.02 + Math.sin(a) * 1.4 * crk)); m.position.copy(p); m.rotation.set(crk * 8 + i, crk * 5, i); } });
  const ck = right ? back(clamp((t - tCrack - 0.15) / 0.5)) : 0; chick.visible = ck > 0.01; chick.position.set(0, 1.25 + 0.55 * ck, -0.02); chick.scale.setScalar(Math.max(0.01, ck) * 1.1);
  chick.rotation.set(0, 0.25 * Math.sin(t * 3), 0.08 * Math.sin(t * 5)); CK.w.forEach((w, k) => w.rotation.z = (k ? -1 : 1) * (0.3 + 0.6 * Math.abs(Math.sin(t * 9)) * win(t, tBrand - 0.3, TOTAL, 0.3)));
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? Math.max(win(t, tSp1 - 0.05, tSp3 + 0.3, 0.05) * 0.5, win(t, tBig - 0.05, tBig + 0.4, 0.05) * 0.4) : win(t, tCrack - 0.05, tCrack + 0.25, 0.05) * 0.3;
  applyCam(c, t, shk > 0.02 ? 0.05 * shk : 0);
  camera.updateMatrixWorld(true); hero.updateMatrixWorld(true); HN.head.updateMatrixWorld(true);
  screen = { head: project(HN.head.localToWorld(V3(0, 0.9, 0))), car: project(hero.localToWorld(V3(0, 2.0, 0))), carF: project(hero.localToWorld(V3(0, 1.0, -2.3))), chick: project(chick.localToWorld(V3(0, 0.7, 0))), wiper: project(hero.localToWorld(V3(0, 1.6, -1.0))) };
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
function honkRings(p, t, a, b) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 3; k++) { const ph = ((t - a) * 2.2 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * win(t, a, b, 0.1); ctx.strokeStyle = YEL; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(p.x, p.y, 40 + ph * 220, -2.4, -0.7); ctx.stroke(); ctx.restore(); } }
function dict(t, a, b) { // chicken dictionary card
  if (t < a || t > b) return; const f = win(t, a, b, 0.25), k = back((t - a) / 0.4);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 640); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(255,248,225,0.97)'; rr(-420, -150, 840, 300, 34); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#e65100'; ctx.lineWidth = 8; rr(-404, -134, 808, 268, 26); ctx.stroke();
  ctx.fillStyle = '#e65100'; ctx.font = '900 40px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CHICKEN DICTIONARY', 0, -92);
  ctx.fillStyle = '#222'; ctx.font = '900 54px Inter'; ctx.fillText('WIPER, WIPER =', 0, -18);
  ctx.fillStyle = '#1565c0'; ctx.font = '900 52px Inter'; ctx.fillText('"MAY I PASS, PLEASE?"', 0, 62); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('COUNTRY ROAD', '#455a64', tCountry - 0.1, tSlow - 0.15, 56);
    P_('SLOW TRACTOR AHEAD', '#455a64', tSlow - 0.1, tYou1 - 0.15, 52);
    P_('OVERTAKE?', '#1565c0', tYou1 - 0.1, S('hook1').end + 0.3, 62, iconArrow);
    P_('FARMER: GIANT HEN', '#e65100', tGiant - 0.15, tAndH - 0.15, 56);
    bubble('BAWK!', screen.head, t, tHen + 0.1, tAndH - 0.2, 60, '#fff', '#e65100', -70);
    P_('TRAILER: FULL OF EGGS', '#6d4c41', tEggsH - 0.15, S('hook2').end + 0.3, 50);
    P_('HONK!', RED, tHonk - 0.15, tSqueeze - 0.15, 72, iconWarn);
    honkRings(screen.carF, t, tHonk - 0.05, tSqueeze + 0.5);
    P_('SQUEEZE PAST', RED, tSqueeze - 0.15, S('wrong1').end + 0.3, 60, iconWarn);
    P_('FRIGHTENED HEN', RED, tBig - 0.1, tLays - 0.15, 58, iconX);
    bubble('BAWK?!', screen.head, t, tBig + 0.05, tFright + 0.2, 64, '#fff', '#c62828', -70);
    P_('EGGS!', '#e65100', tLays - 0.15, tLots - 0.15, 66);
    P_('LOTS OF EGGS', '#e65100', tLots - 0.15, tVery - 0.15, 62);
    P_('VERY FAST', RED, tVery - 0.15, S('wrong2').end + 0.3, 64, iconX);
    floatText('SPLAT!', 300, 760, t, tSp1, tSp1 + 0.9, 110, YEL, -0.15); floatText('SPLAT!', 760, 680, t, tSp2, tSp2 + 0.9, 110, YEL, 0.12); floatText('SPLAT!', 540, 860, t, tSp3, tSp3 + 1.0, 130, YEL, -0.05);
    P_('BONNET: HOT', RED, tBonnet - 0.15, tYour3 - 0.15, 60, iconWarn);
    P_('CAR = BREAKFAST', RED, tYour3 - 0.15, tSunny - 0.15, 60, iconX);
    P_('SUNNY SIDE UP', '#f9a825', tSunny - 0.15, tRew0, 60, iconX);
  } else {
    P_('STAY BACK', '#455a64', tStay - 0.1, tFlap - 0.15, 60);
    P_('WIPER, WIPER', '#1565c0', tFlap - 0.15, S('right2').end + 0.3, 60);
    dict(t, tChicken - 0.1, S('right3').end + 0.3);
    bubble('BAWK!', screen.head, t, tNods - 0.05, tSignals, 60, '#fff', '#2e7d32', -70);
    P_('NOD', GREEN, tNods - 0.15, tSignals - 0.15, 60, iconCheck);
    P_('WING SIGNAL', '#e65100', tSignals - 0.15, tPulls - 0.15, 60, iconArrow);
    P_('PULLS OVER', GREEN, tPulls - 0.15, S('right4').end + 0.3, 60, iconCheck);
    P_('WAVE!', '#1565c0', tWaves - 0.15, tDrops - 0.15, 66);
    P_('THANK-YOU EGG', '#e65100', tDrops - 0.15, S('right5').end + 0.3, 58, iconHeart);
    floatText('CRACK!', W / 2, 700, t, tCrack - 0.05, tCrack + 0.9, 140, YEL, -0.1);
    P_('ROAD CLEAR', GREEN, tRoad6 - 0.15, tBrand - 0.15, 60, iconCheck);
    P_('NEW CO-DRIVER', '#f9a825', tBrand - 0.15, S('right7').start - 0.1, 58, iconHeart);
    bubble('PEEP!', screen.chick, t, tCo - 0.1, S('right7').start - 0.1, 58, '#fff', '#f57f17', -60);
  }
}
window.dbg = { carPose, TZ };
start(update, hud);
