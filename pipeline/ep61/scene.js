// Episode 56: Night junction – the traffic light is an owl
// hook (old style): red light, middle of the night, nobody around, you wait and wait -> the red light blinks: it's an eye. The traffic light is an owl.
// wrong: nobody's watching -> drive straight through -> owls see everything: her head turns all the way round -> she swoops down,
//        grabs your car like a mouse, flies it home to her nest and sits on it: she thinks you're an egg
// right: stop at the line, owls love good manners and winking -> wink with your headlight -> she blushes and winks back:
//        red eye closed, green eye open = green light -> she flies along and lights up the whole road: two giant headlights, hoo hoo
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, hemi, sun, _m, _q, _v, _s
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- night look ----------------
scene.background = new THREE.Color('#2b4677'); scene.fog.color.set('#1f3157'); scene.fog.near = 90; scene.fog.far = 420;
hemi.color.set('#9fb4ea'); hemi.groundColor.set('#2a3352'); hemi.intensity = 1.05;
// ---------------- timing ----------------
const tRed = WT('hook1', 'Red'), tMiddle = WT('hook1', 'Middle'), tNobody = WT('hook1', 'Nobody'), tWait = WT('hook1', 'wait');
const tThen = WT('hook2', 'Then'), tBlinks = WT('hook2', 'blinks'), tIts = WT('hook2', "It's"), tEye = WT('hook2', 'eye'), tTraffic = WT('hook2', 'traffic'), tOwl = WT('hook2', 'owl'), tWhat = WT('hook2', 'What');
const tThink = WT('wrong1', 'think'), tWatching = WT('wrong1', 'watching'), tDrive = WT('wrong1', 'drive'), tThrough = WT('wrong1', 'through');
const tBig = WT('wrong2', 'Big'), tOwls2 = WT('wrong2', 'Owls'), tHead = WT('wrong2', 'head'), tTurns = WT('wrong2', 'turns'), tAllW = WT('wrong2', 'All'), tRound = WT('wrong2', 'round');
const tSwoops = WT('wrong3', 'swoops'), tGrabs = WT('wrong3', 'grabs'), tMouse = WT('wrong3', 'mouse'), tFlies = WT('wrong3', 'flies'), tNest = WT('wrong3', 'nest'), tNow = WT('wrong3', 'Now'), tSitting = WT('wrong3', 'sitting'), tThinks = WT('wrong3', 'thinks'), tEgg = WT('wrong3', 'egg');
const tStop = WT('right2', 'Stop'), tOwls = WT('right2', 'Owls'), tManners = WT('right2', 'manners'), tWinking = WT('right2', 'winking');
const tWink = WT('right3', 'wink'), tWith = WT('right3', 'With'), tHeadl = WT('right3', 'headlight'), tBlink = WT('right3', 'Blink');
const tBlush = WT('right4', 'blushes'), tWinks = WT('right4', 'winks'), tRedC = WT('right4', 'Red'), tGreenO = WT('right4', 'Green'), tGreenL = WT('right4', 'Green', 1);
const tLikes = WT('right5', 'likes'), tFliesR = WT('right5', 'flies'), tLights = WT('right5', 'lights'), tWhole = WT('right5', 'whole');
const tTwo = WT('right6', 'Two'), tHoo = WT('right6', 'Hoo');
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

// ---------------- world: night junction ----------------
const LANE = 1.75, POLE = V3(4.45, 0, -0.7), POLE_H = 3.0;
const NEST = V3(-13, 9.6, -42);
plane(-400, 400, -600, 300, L('#3b4a3a'), 0, 40);                 // dark grass
plane(-12, 12, -600, 300, L('#8d8f94'), 0.02, 30);                // pavements
plane(-3.6, 3.6, -600, 300, asphaltMat, 0.05, 7);                 // main road
plane(-400, 400, -9.5, -2.2, asphaltMat, 0.05, 7);                // cross road
plane(-3.6, 3.6, -9.5, -2.2, asphaltMat, 0.055, 7);
{ const g = new THREE.PlaneGeometry(0.15, 3); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -598; z < 298; z += 7) if (z > 0 || z < -12) dl.push([0, 0.075, z]); instanced(g, markMat, dl, false);
  const sl = new THREE.PlaneGeometry(3.5, 0.4); sl.rotateX(-Math.PI / 2); instanced(sl, markMat, [[LANE, 0.076, -0.1]], false);
  const zb = new THREE.PlaneGeometry(0.5, 3.0); zb.rotateX(-Math.PI / 2); const zl = []; for (let x = -3.0; x <= 3.0; x += 1.0) zl.push([x, 0.076, -10.9]); instanced(zb, markMat, zl, false); }
// kerbs
{ const k = L('#b0b2b6'); for (const x of [-3.75, 3.75]) for (const [z0, z1] of [[-600, -9.6], [-2.1, 300]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, z1 - z0), k); m.position.set(x, 0.08, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); } }
// night buildings with lit windows
{ const R = rng(561); const winT = (seed) => canvasTex(128, 256, (c, w, h) => { const r = rng(seed); c.fillStyle = '#1a1d26'; c.fillRect(0, 0, w, h); for (let y = 12; y < h; y += 32) for (let x = 10; x < w; x += 30) { c.fillStyle = r() < 0.38 ? (r() < 0.5 ? '#ffd27a' : '#ffe9b5') : '#273047'; c.fillRect(x, y, 18, 20); } }, true);
  const cols = ['#6f6a78', '#5d6b7a', '#7a6e62', '#596273', '#6b6f5f'];
  for (const side of [-1, 1]) for (let z = 40; z > -320; z -= 13 + R() * 6) { if (z < -1 && z > -11) continue; const w = 9 + R() * 4, d = 10 + R() * 3, h = 7 + R() * 16; const x = side * (13 + w / 2);
    if (side < 0 && Math.abs(z - NEST.z) < 16) continue;
    const t = winT(Math.floor(R() * 1e6)); t.repeat.set(Math.round(d / 3), Math.round(h / 3)); t.needsUpdate = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), L(cols[Math.floor(R() * cols.length)], { map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.55 })); b.position.set(x, h / 2, z); b.castShadow = true; b.receiveShadow = true; scene.add(b); } }
// street lamps (warm), a few real lights near the junction
const lampHeadM = new THREE.MeshBasicMaterial({ color: '#ffd48a', toneMapped: false });
{ const pm = STD('#4a5260', { metalness: 0.6, roughness: 0.4 }); const pole = new THREE.CylinderGeometry(0.08, 0.11, 6.2, 8), head = new THREE.BoxGeometry(0.9, 0.16, 0.4);
  for (let z = 26; z > -560; z -= 24) for (const side of [-1, 1]) { const zz = z + (side > 0 ? 12 : 0); if (zz > -12 && zz < 0) continue; const x = side * 5.2;
    const p = new THREE.Mesh(pole, pm); p.position.set(x, 3.1, zz); p.castShadow = true; scene.add(p); const h = new THREE.Mesh(head, lampHeadM); h.position.set(x - side * 0.5, 6.15, zz); scene.add(h); }
  for (const [x, z] of [[-4.7, 2], [4.7, 14], [-4.7, -22], [4.7, -34], [-4.7, 26]]) { const pl = new THREE.PointLight('#ffc77a', 38, 24, 1.6); pl.position.set(x, 5.8, z); scene.add(pl); } }
// moon + stars
{ const moon = new THREE.Mesh(new THREE.CircleGeometry(26, 40), new THREE.MeshBasicMaterial({ color: '#fff6dc', fog: false, toneMapped: false })); moon.position.set(-260, 240, -700); moon.lookAt(0, 0, 0); scene.add(moon);
  const g = new THREE.BufferGeometry(); const p = []; const R = rng(77); for (let i = 0; i < 700; i++) { const a = R() * Math.PI * 2, e = 0.12 + R() * 1.3; p.push(Math.cos(a) * Math.cos(e) * 900, Math.sin(e) * 900, Math.sin(a) * Math.cos(e) * 900); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); const st = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false })); scene.add(st); }
// traffic light pole (empty bracket: the owl IS the light)
{ const pm = STD('#3d4450', { metalness: 0.5, roughness: 0.45 }); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, POLE_H, 10), pm); p.position.set(POLE.x, POLE_H / 2, POLE.z); p.castShadow = true; scene.add(p);
  const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 8), pm); perch.rotation.z = Math.PI / 2; perch.position.set(POLE.x, POLE_H, POLE.z); scene.add(perch);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), STD('#ffd60a')); box.position.set(POLE.x, 1.1, POLE.z + 0.15); scene.add(box); }
// the nest tree
{ const bark = L('#4e3a2a'); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, NEST.y, 12), bark); tr.position.set(NEST.x, NEST.y / 2, NEST.z); tr.castShadow = true; scene.add(tr);
  for (const [a, y, l] of [[0.6, 6.5, 3.2], [2.4, 7.4, 2.6], [4.1, 5.6, 3.0]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, l, 6), bark); b.position.set(NEST.x + Math.cos(a) * l * 0.45, y + 0.9, NEST.z + Math.sin(a) * l * 0.45); b.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); b.castShadow = true; scene.add(b); }
  const twigT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#7a5532'; c.fillRect(0, 0, w, h); const r = rng(5); for (let k = 0; k < 260; k++) { c.strokeStyle = r() < 0.5 ? '#5a3d22' : '#a07444'; c.lineWidth = 2 + r() * 4; c.beginPath(); const x = r() * w, y = r() * h; c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 30); c.stroke(); } }, true);
  twigT.repeat.set(6, 1);
  const nest = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.75, 12, 36), L('#fff', { map: twigT })); nest.rotation.x = Math.PI / 2; nest.scale.set(1, 1.25, 1); nest.position.set(NEST.x, NEST.y + 0.25, NEST.z); nest.castShadow = true; nest.receiveShadow = true; scene.add(nest);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(2.9, 30), L('#5a3d22')); floor.rotation.x = -Math.PI / 2; floor.scale.set(1, 1.25, 1); floor.position.set(NEST.x, NEST.y - 0.1, NEST.z); scene.add(floor); }

// ---------------- hero ----------------
const hero = makeCar('#1e88e5');
const winkM = hero.userData.hl.clone(); hero.userData.bodyG.children[7].material = winkM;
hero.userData.hl.emissiveIntensity = 1.2; winkM.emissiveIntensity = 1.2;
const headBeamM = new THREE.MeshBasicMaterial({ color: '#fff2c4', transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide, fog: false });
const carBeams = [-1, 1].map(s => { const g = new THREE.ConeGeometry(1.6, 9, 20, 1, true); g.translate(0, -4.5, 0); g.rotateX(-Math.PI / 2); g.rotateX(Math.PI); const m = new THREE.Mesh(g, headBeamM); m.position.set(s * 0.6, 0.76, -2.15); m.rotation.x = -0.12; m.userData.noAO = true; m.renderOrder = 3; hero.userData.bodyG.add(m); return m; });
const carSpot = new THREE.SpotLight('#fff1c8', 60, 40, 0.5, 0.6, 1.4); carSpot.position.set(0, 0.8, -2.2); hero.add(carSpot); hero.add(carSpot.target); carSpot.target.position.set(0, 0, -14);

// ---------------- the owl (built facing -z, feet at origin) ----------------
const owl = new THREE.Group(); scene.add(owl);
const OS = 1.3; const ob = new THREE.Group(); ob.scale.setScalar(OS); owl.add(ob);
const featherT = (base, mark) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); c.strokeStyle = mark; c.lineWidth = 5; for (let y = 10; y < h; y += 26) for (let x = (y / 26 % 2) * 16; x < w; x += 32) { c.beginPath(); c.arc(x, y, 12, 0.2, Math.PI - 0.2); c.stroke(); } }, true);
const bodyM = STD('#ffffff', { map: featherT('#8a6a4f', '#5e4532'), roughness: 0.85 });
const bellyM = STD('#ffffff', { map: featherT('#e9dcc6', '#b89a78'), roughness: 0.85 });
const faceM = STD('#f4ead8', { roughness: 0.8 });
const O = {};
const revealLamp = new THREE.PointLight('#ffd9a0', 0, 14, 1.4); scene.add(revealLamp); revealLamp.position.set(POLE.x - 2.2, 8.2, POLE.z + 3.5);
const DARK = new THREE.Color('#1a1a22'), WHITE = new THREE.Color('#ffffff');
{ const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 28, 20), bodyM); body.scale.set(1.0, 1.2, 0.92); body.position.y = 1.0; ob.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 18), bellyM); belly.scale.set(0.95, 1.15, 0.7); belly.position.set(0, 0.92, -0.3); ob.add(belly);
  O.wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.72, 1.55, 0.05); ob.add(p); const w = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), bodyM); w.scale.set(0.22, 0.95, 0.62); w.position.set(s * 0.08, -0.6, 0); p.add(w); return p; });
  for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) { const cl = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 6), STD('#e0a030')); cl.rotation.x = -Math.PI / 2 - 0.4; cl.position.set(s * 0.28 + k * 0.09, 0.08, -0.25); ob.add(cl); }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 10), bodyM); tail.scale.z = 0.4; tail.rotation.x = -0.3; tail.position.set(0, 0.25, 0.65); ob.add(tail);
  // head
  const hd = new THREE.Group(); hd.position.set(0, 2.0, -0.02); ob.add(hd); O.head = hd;
  const hs = new THREE.Mesh(new THREE.SphereGeometry(0.78, 28, 20), bodyM); hs.scale.set(1.12, 0.92, 0.95); hd.add(hs);
  for (const s of [-1, 1]) { const fd = new THREE.Mesh(new THREE.SphereGeometry(0.42, 22, 16), faceM); fd.scale.set(1, 1, 0.35); fd.position.set(s * 0.33, 0.02, -0.58); hd.add(fd); }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 10), STD('#e0a030', { roughness: 0.5 })); beak.rotation.x = -Math.PI / 2 - 0.5; beak.position.set(0, -0.2, -0.78); hd.add(beak); O.beak = beak;
  const beakL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), STD('#c98a20')); beakL.rotation.x = -Math.PI / 2 + 0.6; beakL.position.set(0, -0.33, -0.72); hd.add(beakL); O.beakL = beakL;
  for (const s of [-1, 1]) { const tf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.55, 8), bodyM); tf.position.set(s * 0.55, 0.75, -0.05); tf.rotation.z = -s * 0.45; hd.add(tf); }
  O.cheeks = [-1, 1].map(s => { const c = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), new THREE.MeshBasicMaterial({ color: '#ff6f91', transparent: true, opacity: 0 })); c.position.set(s * 0.58, -0.25, -0.62); c.rotation.y = Math.PI + s * 0.5; c.scale.set(1.3, 0.8, 1); c.userData.noAO = true; hd.add(c); return c; });
  // eyes: local +x = viewer's left when the owl faces the camera -> RED, local -x -> GREEN
  O.eyes = [[1, '#ff2a2a'], [-1, '#2bff6a']].map(([s, col]) => { const e = new THREE.Group(); e.position.set(s * 0.33, 0.06, -0.62); hd.add(e);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.26, 22, 16), STD('#f6f6f0', { roughness: 0.2 })); w.scale.z = 0.6; e.add(w);
    const irisM = new THREE.MeshBasicMaterial({ color: col, toneMapped: false }); const ir = new THREE.Mesh(new THREE.CircleGeometry(0.2, 28), irisM); ir.position.z = -0.157; ir.rotation.y = Math.PI; e.add(ir);
    const pu = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), new THREE.MeshBasicMaterial({ color: '#0b0b0b' })); pu.position.z = -0.162; pu.rotation.y = Math.PI; e.add(pu);
    const hl = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), new THREE.MeshBasicMaterial({ color: '#ffffff' })); hl.position.set(s * 0.05, 0.06, -0.165); hl.rotation.y = Math.PI; e.add(hl);
    const lidG = new THREE.Group(); e.add(lidG); const lid = new THREE.Mesh(new THREE.SphereGeometry(0.272, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2), bodyM); lidG.add(lid);
    const glow = new THREE.PointLight(col, 0, 7, 1.8); glow.position.set(0, -0.3, -1.6); e.add(glow);
    [w, ir, pu, hl].forEach(m => m.userData.noAO = true);
    return { e, ir, irisM, pu, hl, lidG, glow, col: new THREE.Color(col), s }; });
  ob.traverse(o => { if (o.isMesh && !o.userData.noAO) { o.castShadow = true; o.receiveShadow = true; } }); }
// owl headlight beams (right way)
const owlBeamM = new THREE.MeshBasicMaterial({ color: '#fff4cf', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
const owlBeams = O.eyes.map(E => { const g = new THREE.ConeGeometry(2.6, 16, 24, 1, true); g.translate(0, -8, 0); g.rotateX(-Math.PI / 2); g.rotateX(Math.PI); const m = new THREE.Mesh(g, owlBeamM); m.position.z = -0.1; m.rotation.x = -0.55; m.userData.noAO = true; m.renderOrder = 3; m.visible = false; E.e.add(m); return m; });
const owlSpot = new THREE.SpotLight('#fff0c0', 0, 60, 0.6, 0.5, 1.2); scene.add(owlSpot); scene.add(owlSpot.target);
const greenPool = new THREE.PointLight('#38ff6a', 0, 14, 1.5); scene.add(greenPool);

// ---------------- motion ----------------
const OWL_POLE = V3(POLE.x, POLE_H, POLE.z);
const STOPZ = 2.35;
// wrong: car
const carZW = mono([[0, STOPZ], [tDrive - 0.05, STOPZ], [tThrough + 0.3, -8], [tTurns, -20], [tRound + 0.4, -24], [99, -24]]);
// wrong: owl flight (pole -> car -> nest)
const OWX = mono([[0, OWL_POLE.x], [tSwoops - 0.1, OWL_POLE.x], [tGrabs, LANE], [tFlies, LANE - 1], [tNest, NEST.x], [99, NEST.x]]);
const OWY = mono([[0, OWL_POLE.y], [tSwoops - 0.1, OWL_POLE.y], [tSwoops + 0.3, OWL_POLE.y + 2.0], [tGrabs, 1.68], [tGrabs + 0.35, 1.9], [tFlies, 7], [tNest - 0.5, NEST.y + 4.5], [tNest, NEST.y + 1.62], [99, NEST.y + 1.62]]);
const OWZ = mono([[0, OWL_POLE.z], [tSwoops - 0.1, OWL_POLE.z], [tGrabs, -24], [tFlies, -28], [tNest, NEST.z], [99, NEST.z]]);
// right: car
const carZR = mono([[0, STOPZ], [tFliesR - 0.6, STOPZ], [tLights, -4], [tWhole + 0.5, -14], [S('right6').start, -24], [S('right7').start, -42], [S('outro').start, -58], [TOTAL + 1, -84]]);
const flightU = t => ease(clamp((t - tFliesR + 0.35) / 1.3));

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const CarCam = (off, look, fov = 40) => t => { const z = hero.position.z; return [V3(off[0], off[1], z + off[2]), V3(look[0], look[1], z + look[2]), fov]; };
const OwlCam = (off, look, fov = 40) => t => { const p = owl.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + look[0], p.y + look[1], p.z + look[2]), fov]; };
const camKeys = [
  [0.0, Ac([0.4, 2.0, 12.5], [2.8, 3.6, -1.0], 40)],
  [tNobody - 0.3, Ac([0.5, 2.0, 11.5], [2.9, 3.8, -1.0], 40)],
  ...cut(tNobody - 0.25, Ac([-14, 9, 26], [1.5, 2.0, -2.0], 40)),
  [tThen - 0.3, Ac([-12, 8, 22], [1.5, 2.0, -2.0], 40)],
  ...cut(tThen - 0.25, Ac([4.6, 5.8, 6.0], [4.5, 5.7, -0.6], 30)),
  [tTraffic - 0.3, Ac([4.5, 5.6, 7.0], [4.45, 5.4, -0.6], 34)],
  ...cut(tTraffic - 0.25, Ac([1.0, 2.2, 12.0], [3.6, 4.4, -0.6], 40)),
  [S('hook2').end, Ac([0.4, 2.0, 13.5], [3.4, 4.2, -0.6], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([-2.5, 2.4, 9.0], [2.0, 1.6, 1.0], 40)),
  [tDrive - 0.2, Ac([-2.2, 2.4, 8.8], [2.0, 1.6, 1.0], 40)],
  [tThrough + 0.6, Ac([-1.0, 3.0, 4.0], [2.0, 1.4, -14.0], 40)],
  ...cut(tOwls2 - 0.2, Ac([2.0, 5.2, 8.5], [4.4, 5.4, -0.6], 34)),
  [tAllW - 0.3, Ac([2.2, 5.2, 9.0], [4.4, 5.4, -0.6], 34)],
  ...cut(tAllW - 0.25, Ac([3.8, 6.4, 6.0], [3.5, 4.6, -18.0], 40)),
  [S('wrong3').start - 0.1, Ac([3.8, 6.4, 6.0], [3.0, 3.6, -20.0], 40)],
  ...cut(S('wrong3').start - 0.05, Ac([-1.0, 3.2, -38.0], [2.3, 3.0, -22.0], 40)),
  [tGrabs + 0.3, Ac([-1.0, 3.4, -38.5], [2.0, 2.6, -24.0], 40)],
  ...cut(tFlies - 0.1, OwlCam([-4.0, 0.8, -12.0], [0, -0.4, 0], 40)),
  [tNest - 0.05, OwlCam([-4.0, 1.2, -12.0], [0, -0.4, 0], 40)],
  ...cut(tNest, Ac([-4.0, 13.0, -53.0], [-11.0, 10.5, -42.0], 40)),
  ...cut(tNow - 0.15, Ac([-1.5, 13.6, -27.0], [-13.0, 11.6, -42.0], 40)),
  [tThinks - 0.2, Ac([-3.0, 13.2, -29.5], [-13.0, 11.8, -42.0], 40)],
  [tRew0, Ac([2.5, 15.0, -20.0], [-12.0, 12.0, -42.0], 40)],
  // right
  ...cut(tRew1, Ac([-3.0, 3.0, 13.5], [2.6, 3.4, -0.5], 40)),
  [tOwls - 0.25, Ac([-2.8, 3.0, 13.0], [2.6, 3.4, -0.5], 40)],
  ...cut(tOwls - 0.2, Ac([2.0, 5.4, 5.8], [4.4, 5.8, -0.6], 30)),
  [tWink - 0.3, Ac([2.1, 5.4, 6.2], [4.4, 5.8, -0.6], 30)],
  ...cut(tWink - 0.25, Ac([4.6, 2.2, -6.5], [1.8, 0.9, 1.5], 36)),
  [tBlush - 0.2, Ac([4.4, 2.3, -6.8], [1.8, 0.9, 1.5], 36)],
  ...cut(tBlush - 0.15, Ac([2.2, 5.5, 6.0], [4.45, 5.85, -0.6], 26)),
  [tGreenL - 0.3, Ac([2.2, 5.3, 6.8], [4.45, 5.7, -0.6], 30)],
  ...cut(tGreenL - 0.25, Ac([-1.5, 3.4, 13.0], [2.8, 3.4, -1.0], 40)),
  [tFliesR, Ac([-1.5, 3.4, 13.0], [2.6, 3.6, -2.0], 40)],
  [tLights + 0.3, CarCam([-0.5, 5.0, 12.0], [1.8, 5.0, -8.0], 40)],
  ...cut(S('right6').start - 0.1, CarCam([3.5, 7.0, -31.0], [1.6, 5.2, -5.0], 40)),
  [tHoo - 0.2, CarCam([3.2, 7.4, -29.0], [1.6, 5.6, -6.0], 40)],
  [S('right7').start, CarCam([-0.5, 8.5, 16.0], [1.6, 6.3, -10.0], 40)],
  [TOTAL - 0.3, CarCam([-0.5, 10.0, 22.0], [1.6, 6.8, -12.0], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const lidSet = (E, close) => { E.lidG.rotation.x = lerp(Math.PI * 0.62, -Math.PI * 0.5, close); };
function update(t) {
  const right = isRight(t);
  // ---- hero ----
  let carried = false;
  if (!right) {
    if (t < tGrabs) placeCar(hero, { x: LANE, z: carZW(t), h: 0 });
    else { carried = true; }
  } else placeCar(hero, { x: LANE, z: carZR(t), h: 0 });
  blink(hero, t, false, false);
  // headlight wink (right)
  const wk = right ? Math.max(win(t, tWink - 0.05, tWink + 0.35, 0.05), win(t, tBlink - 0.05, tBlink + 0.4, 0.05)) : 0;
  winkM.emissiveIntensity = 1.2 - 1.2 * wk; carBeams[0].visible = true; carBeams[1].visible = wk < 0.5;
  // ---- owl ----
  { const rv = right ? 1 : (t < tIts - 0.15 ? 0 : (t < tIts + 0.35 ? ((Math.floor(t * 18) % 3) ? 1 : 0.2) : 1)); const k = 0.08 + 0.92 * rv; bodyM.color.copy(DARK).lerp(WHITE, k); bellyM.color.copy(DARK).lerp(WHITE, k); faceM.color.set('#f4ead8').multiplyScalar(k); revealLamp.intensity = 30 * rv; }
  let ox = OWL_POLE.x, oy = OWL_POLE.y, oz = OWL_POLE.z, yaw = Math.PI, flap = 0, pitch = 0, sit = 0;
  if (!right) {
    if (t > tSwoops - 0.1) { ox = OWX(t); oy = OWY(t); oz = OWZ(t); flap = t < tNest + 0.2 ? 1 : 0;
      const dt = 0.05; const dx = OWX(t + dt) - OWX(t - dt), dz = OWZ(t + dt) - OWZ(t - dt); if (Math.hypot(dx, dz) > 0.05) yaw = Math.atan2(-dx, -dz); else yaw = 0;
      if (t > tNest) { yaw = -2.48; sit = ramp(t, tNest, tNest + 0.6); }
      pitch = flap ? 0.25 : 0; }
  } else {
    const f = flightU(t);
    if (f > 0) { const zc = hero.position.z; const tgt = V3(LANE, 6.4 + 0.25 * Math.sin(t * 3), zc - 8.5); ox = lerp(OWL_POLE.x, tgt.x, f); oy = lerp(OWL_POLE.y, tgt.y, f) + 1.5 * Math.sin(Math.PI * f); oz = lerp(OWL_POLE.z, tgt.z, f);
      yaw = lerp(Math.PI, 0, ease(clamp((t - tFliesR) / 1.2))); flap = 1; pitch = -0.05; }
  }
  owl.position.set(ox, oy, oz); owl.rotation.set(0, yaw, 0, 'YXZ'); ob.rotation.x = pitch;
  O.wings.forEach((w, k) => { const s = k ? 1 : -1; w.rotation.z = flap ? s * (1.15 + 0.65 * Math.sin(t * 13)) : s * (0.05 + 0.04 * Math.sin(t * 2 + k)) + (sit ? s * 0.35 * sit : 0); w.rotation.x = flap ? 0.2 : 0; });
  ob.scale.set(OS * (1 + 0.1 * sit), OS * (1 - 0.06 * sit), OS * (1 + 0.1 * sit));
  // head: hunched in the hook, 360 turn in wrong2, looks down at the car in the right way
  let hy = 0, hp = 0, hr = 0;
  if (!right) { const turn = ease(clamp((t - tTurns + 0.05) / (tRound + 0.35 - tTurns + 0.05))); hy = Math.PI * 2 * turn; hp = 0.15 * win(t, tRed, tThen, 0.4) * 0 + (t > tDrive && t < tTurns ? -0.1 : 0);
    hr = 0.15 * Math.sin(t * 0.9) * (t < tThen ? 1 : 0); if (t > tSwoops - 0.1 && t < tNest) hp = 0.4; if (t > tNest) { hp = 0.35; hr = 0.25 * Math.sin(t * 1.5); } }
  else { hp = 0.35 * ramp(t, tStop, tOwls) * (1 - flightU(t)) + 0.15 * win(t, tBlush, tWinks + 0.4, 0.2); hr = 0.22 * win(t, tWinking - 0.3, tBlink + 0.6, 0.3) * Math.sin(t * 2.2) + 0.25 * win(t, tBlush - 0.1, tWinks + 0.5, 0.2);
    if (flightU(t) > 0.5) { hp = -0.1; hr = 0.12 * Math.sin(t * 2); } }
  O.head.rotation.set(hp, hy, hr, 'YXZ');
  // beak (hoot)
  const hoot = right ? Math.max(win(t, tHoo - 0.05, tHoo + 0.2, 0.05), win(t, tHoo + 0.25, tHoo + 0.55, 0.05)) : (t > tRed && t < tThen ? 0 : 0);
  O.beakL.rotation.x = -Math.PI / 2 + 0.6 + 0.5 * hoot;
  // eyes
  const nightBlink = (tt) => (tt % 4.1 < 0.13) ? 1 : 0;
  let redC = 0, greenC = 1, wide = 0, white = 0;
  if (!right) { redC = Math.max(win(t, tBlinks - 0.05, tBlinks + 0.25, 0.08), win(t, tBlinks + 0.45, tBlinks + 0.7, 0.08));
    greenC = t > tThen + 1.6 && t < S('hook2').end + 0.5 ? 1 - win(t, tIts - 0.05, tOwl + 0.4, 0.15) : 1;
    if (t > tWatching) { greenC = 0; wide = win(t, tOwls2 - 0.2, tGrabs + 0.5, 0.2); }
    if (t > tSitting - 0.3) { redC = 0.45; greenC = 0.45; }
    if (t > tDrive - 0.3 && t < tWatching) greenC = 0; }
  else { greenC = 1 - ramp(t, tGreenO - 0.1, tGreenO + 0.25); redC = ramp(t, tRedC - 0.05, tRedC + 0.3) * (1 - ramp(t, tFliesR - 0.3, tFliesR + 0.2));
    redC = Math.max(redC, win(t, tWinks - 0.05, tWinks + 0.35, 0.06)); // her wink back
    if (t < tRedC - 0.2) redC = Math.max(redC, nightBlink(t + 1.3) ); white = ramp(t, tLights - 0.25, tLights + 0.2); if (t > tFliesR) greenC = Math.min(greenC, 0); }
  const cl = [redC, greenC];
  O.eyes.forEach((E, k) => { const c = Math.max(cl[k], nightBlink(t) * (right || t > tWatching ? 1 : 0) * 0); lidSet(E, c); const open = 1 - c;
    const col = E.col.clone().lerp(new THREE.Color('#fff4cf'), white); E.irisM.color.copy(col).multiplyScalar(1.0); E.glow.color.copy(col); E.glow.intensity = 7 * open * (1 + white * 2);
    E.e.scale.setScalar(1 + 0.25 * wide); E.pu.scale.setScalar(1 - 0.4 * wide); });
  const blush = right ? win(t, tBlush - 0.15, S('right5').end, 0.3) : 0; O.cheeks.forEach(c => c.material.opacity = 0.8 * blush);
  // owl headlights
  owlBeams.forEach(b => { b.visible = white > 0.02; }); owlBeamM.opacity = 0.07 * white;
  owl.updateMatrixWorld(true);
  owlSpot.intensity = 130 * white; owlSpot.position.copy(owl.position).add(V3(0, 2.6, -0.5)); owlSpot.target.position.set(LANE, 0, owl.position.z - 16); owlSpot.target.updateMatrixWorld();
  greenPool.intensity = right ? 40 * (1 - greenC) * (1 - white) : 0; greenPool.position.set(OWL_POLE.x - 1.2, 2.0, OWL_POLE.z + 2.5);
  // carried car (wrong)
  if (carried) carBeams.forEach(b => b.visible = false); carSpot.intensity = carried ? 0 : 60;
  if (carried) { const p = owl.position; const sway = t < tNest ? 0.08 * Math.sin(t * 6.5) : 0; hero.position.set(p.x, Math.max(0, p.y - 1.66), p.z); hero.rotation.set(sway, owl.rotation.y + (t > tNest ? 0 : 0), sway * 0.6, 'YXZ'); hero.userData.prev = null;
    if (t > tNest) { hero.position.y = NEST.y; } }
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shake = !right ? Math.max(win(t, tGrabs - 0.05, tGrabs + 0.3, 0.05), win(t, tNest - 0.05, tNest + 0.3, 0.05)) : 0;
  applyCam(c, t, shake > 0.02 ? 0.07 * shake : 0);
  camera.updateMatrixWorld(true); O.head.updateMatrixWorld(true);
  screen = { head: project(O.head.localToWorld(V3(0, 0.9, 0))), car: project(hero.localToWorld(V3(0, 1.0, -2.3))), hero: project(hero.localToWorld(V3(0, 1.8, 0))) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hearts(t, a, b, p) { if (t < a || t > b || !p || !p.ok) return; for (let k = 0; k < 3; k++) { const u = ((t - a) * 0.9 + k / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - u) * win(t, a, b, 0.2); iconHeart(clamp(p.x, 200, W - 200) + (k - 1) * 110, clamp(p.y, 600, 1100) - 40 - u * 200, 34, '#ff4f9a'); ctx.restore(); } }
function zzz(t, a, b, p, txt = '?') { if (t < a || t > b || !p || !p.ok) return; }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('RED LIGHT', RED, tRed - 0.1, tNobody - 0.2, 56);
    P_('MIDNIGHT · NOBODY AROUND', '#283593', tMiddle + 0.2, tThen - 0.2, 46);
    P_('WAITING...', '#455a64', tWait - 0.1, tThen - 0.2, 50, null, 530);
    floatText('BLINK', W / 2 + 170, 700, t, tBlinks - 0.05, tBlinks + 0.8, 100, YEL, 0.1);
    P_("IT'S AN EYE!", '#e65100', tEye - 0.15, tTraffic - 0.2, 56, iconWarn);
    P_('TRAFFIC LIGHT: OWL', '#6d4c41', tOwl - 0.25, S('hook2').end + 0.3, 54);
    P_("NOBODY'S WATCHING?", '#455a64', tThink - 0.1, tDrive - 0.15, 50);
    P_('RED LIGHT: IGNORED', RED, tDrive - 0.1, S('wrong1').end + 0.3, 52, iconX);
    P_('OWLS SEE EVERYTHING', '#e65100', tOwls2 - 0.15, tTurns - 0.15, 50, iconWarn);
    floatText('360°', W / 2 + 120, 760, t, tAllW - 0.1, tRound + 0.8, 150, YEL, 0.08);
    floatText('SWOOSH!', W / 2, 700, t, tSwoops - 0.05, tSwoops + 0.8, 120, '#b3e5fc', -0.08);
    floatText('GRAB!', W / 2 - 60, 820, t, tGrabs - 0.05, tGrabs + 0.8, 130, '#ffb74d', 0.08);
    P_('LIKE A MOUSE', RED, tMouse - 0.15, tFlies - 0.1, 54, iconX);
    P_('HOME: NEST', '#6d4c41', tFlies - 0.05, tNow - 0.15, 54);
    P_('YOU = EGG', RED, tEgg - 0.15, tRew0, 64, iconX);
  } else {
    P_('STOP AT THE LINE', GREEN, tStop - 0.1, tOwls - 0.15, 54, iconCheck);
    P_('OWLS LOVE GOOD MANNERS', '#6d4c41', tOwls - 0.1, tWinking - 0.25, 46, iconHeart);
    P_('...AND WINKING', '#d81b60', tWinking - 0.2, S('right2').end + 0.3, 54, iconHeart);
    P_('HEADLIGHT WINK', '#0277bd', tWith - 0.15, S('right3').end + 0.3, 54);
    floatText('WINK!', W / 2, 720, t, tBlink - 0.05, tBlink + 0.8, 130, YEL, -0.08);
    P_('SHE BLUSHES', '#d81b60', tBlush - 0.15, tRedC - 0.2, 54, iconHeart);
    hearts(t, tBlush, tRedC + 0.2, screen.head);
    P_('RED EYE: CLOSED', RED, tRedC - 0.1, S('right4').end + 0.3, 48, null, 420);
    P_('GREEN EYE: OPEN', GREEN, tGreenO - 0.1, S('right4').end + 0.3, 48, null, 530);
    floatText('GREEN LIGHT!', W / 2, 760, t, tGreenL - 0.1, tGreenL + 1.0, 120, '#5dff8f', -0.06);
    P_('OWL ESCORT', '#6d4c41', tFliesR - 0.15, tLights - 0.15, 54);
    P_('ROAD: LIT UP', '#f9a825', tLights - 0.1, S('right5').end + 0.3, 54, iconCheck);
    P_('2 GIANT HEADLIGHTS', '#f9a825', tTwo - 0.1, tHoo - 0.1, 52);
    floatText('HOO HOO!', W / 2, 700, t, tHoo - 0.05, tHoo + 1.0, 130, '#fff4cf', -0.08);
  }
}
window.dbg = { owl, hero, O };
start(update, hud);
