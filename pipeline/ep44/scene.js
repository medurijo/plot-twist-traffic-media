// Episode 39: Emergency lane – the siren is an ice-cream van (its emergency: everything is melting)
// hook (old style): traffic jam on the motorway, then a siren -> not an ambulance: an ice-cream van. Emergency: it's all melting.
// wrong: nobody moves, they wave and order a cone -> the van gets stuck, the sun gets hotter, the freezer gives up ->
//        BOOM: a giant wave of melted ice cream floods the motorway -> you're stuck in a milkshake, with sprinkles (+ straw + cherry)
// right: emergency lane (left lane left, right lane right) -> the van zooms through and fires a cone at every car as thanks ->
//        strawberry, chocolate, pistachio: every car gets a party hat -> even the lorry, extra large -> nothing melted
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, makeWheel,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, floatText, start, rr, sun
} from '../common.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tJam = WT('hook1', 'jam'), tThen = WT('hook1', 'Then'), tSiren = WT('hook1', 'siren');
const tBut = WT('hook2', 'But'), tAmb = WT('hook2', 'ambulance'), tIts = WT('hook2', "It's", 0), tIce = WT('hook2', 'ice'), tAnd0 = WT('hook2', 'And'), tEmerg = WT('hook2', 'emergency'), tAll = WT('hook2', 'all'), tMelting = WT('hook2', 'melting'), tWhat = WT('hook2', 'What');
const tMove = WT('wrong1', 'move'), tThey = WT('wrong1', 'They'), tWave = WT('wrong1', 'wave'), tOrder = WT('wrong1', 'order'), tCone = WT('wrong1', 'cone');
const tBig = WT('wrong2', 'Big'), tVan2 = WT('wrong2', 'van'), tStuck = WT('wrong2', 'stuck'), tSun = WT('wrong2', 'sun'), tHotter = WT('wrong2', 'hotter'), tFreezer = WT('wrong2', 'freezer'), tGives = WT('wrong2', 'gives');
const tBoom = WT('wrong3', 'Boom'), tGiant = WT('wrong3', 'giant'), tFloods = WT('wrong3', 'floods'), tNow = WT('wrong3', 'Now'), tMilk = WT('wrong3', 'milkshake'), tSprink = WT('wrong3', 'sprinkles');
const tMake = WT('right2', 'Make'), tLeft = WT('right2', 'Left'), tRightL = WT('right2', 'Right');
const tZooms = WT('right3', 'zooms'), tThank = WT('right3', 'thank'), tFires = WT('right3', 'fires'), tEvery3 = WT('right3', 'every');
const tStraw = WT('right4', 'Strawberry'), tChoc = WT('right4', 'Chocolate'), tPist = WT('right4', 'Pistachio'), tEvery = WT('right4', 'Every'), tParty = WT('right4', 'party');
const tEven = WT('right5', 'Even'), tLorry = WT('right5', 'lorry'), tExtra = WT('right5', 'Extra');
const tOver = WT('right6', 'Emergency'), tNothing = WT('right6', 'Nothing'), tMelted = WT('right6', 'melted');
const isRight = t => t >= tRew0 + 0.5;

// monotone cubic through keys [[t, v], ...]
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}

// ---------------- world: a motorway ----------------
const LX = 1.9, RXr = 3.9, SH = 6.4, BX = -4.4;    // lane centre offset, right edge line, hard shoulder edge, central barrier
makeLandscape({ avoid: (x, z) => x > -22 && x < 16 && Math.abs(z) < 500, fieldAvoid: (x, z, w, d) => x + w / 2 > -24 && x - w / 2 < 18 && Math.abs(z) - d / 2 < 500, near: [0, 0, 160, 300], trees: 1500, seed: 397 });
plane(-RXr - 0.6, SH, -600, 600, asphaltMat, 0.06, 7);
plane(-20.5, -5.0, -600, 600, asphaltMat, 0.06, 7);   // opposite carriageway
{ const g = new THREE.PlaneGeometry(0.16, 4); g.rotateX(-Math.PI / 2); const dl = []; for (let z = -400; z < 400; z += 10) { dl.push([0, 0.08, z]); dl.push([-12.7, 0.08, z]); } instanced(g, markMat, dl, false);
  const g2 = new THREE.PlaneGeometry(0.16, 1200); g2.rotateX(-Math.PI / 2); instanced(g2, markMat, [[-RXr + 0.1, 0.08, 0], [RXr, 0.08, 0], [-5.6, 0.08, 0], [-19.9, 0.08, 0]], false); }
// central barrier
{ const m = STD('#b0bec5', { metalness: 0.6, roughness: 0.35 }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 1200), m); b.position.set(BX - 0.2, 0.62, 0); b.castShadow = true; scene.add(b);
  const pg = new THREE.BoxGeometry(0.12, 0.7, 0.12); const ps = []; for (let z = -400; z < 400; z += 4) ps.push([BX - 0.3, 0.35, z]); instanced(pg, STD('#78909c', { metalness: 0.5 }), ps, true);
  const gm = L('#7cb342'); const gr = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 1200), gm); gr.position.set(BX - 0.3, 0.05, 0); scene.add(gr); }
// verge
{ const v = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 1200), L('#a1b56c')); v.position.set(SH + 1, 0.03, 0); v.receiveShadow = true; scene.add(v); }
// gantry sign ahead
{ const g = new THREE.Group(); g.position.set(0, 0, -62); scene.add(g); const m = STD('#90a4ae', { metalness: 0.6 });
  for (const x of [BX - 0.4, SH + 0.6]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7, 0.35), m); p.position.set(x, 3.5, 0); g.add(p); }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(SH - BX + 1.4, 0.4, 0.5), m); beam.position.set((SH + BX) / 2, 6.8, 0); g.add(beam);
  const st = canvasTex(512, 160, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#fff'; c.font = '900 60px Inter'; c.textAlign = 'center'; c.fillText('A1  NORTH', w / 2, 80); c.font = '800 34px Inter'; c.fillText('Seaside  42', w / 2, 128); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.7), L('#fff', { map: st })); sg.position.set(1.0, 5.6, 0.27); g.add(sg);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

// ---------------- jam ----------------
const COLS = ['#e53935', '#fdd835', '#43a047', '#8e24aa', '#fb8c00', '#00acc1', '#f5f5f5', '#6d4c41', '#3949ab', '#ec407a', '#7cb342', '#546e7a'];
const cars = [];
const HERO = { lane: -1, z: 0 };
const leftZ = [42, 35, 28, 21, 14, 7, 0, -7, -14, -21, -28, -35, -42, -50, -58], rightZ = [45.5, 38.5, 31.5, 24.5, 17.5, 10.5, 3.5, -4.5, -27.5, -34.5, -41.5, -49, -57];
leftZ.forEach((z, i) => cars.push({ lane: -1, z, hero: z === 0, col: z === 0 ? '#1e88e5' : COLS[(i * 5) % COLS.length] }));
rightZ.forEach((z, i) => cars.push({ lane: 1, z, col: COLS[(i * 7 + 3) % COLS.length] }));
cars.forEach((c, i) => { c.g = makeCar(c.col); c.i = i; c.ph = hash(i * 3) * 6; });
const hero = cars.find(c => c.hero);
// waving arm out of the hero's right window
const arm = new THREE.Group(); hero.g.userData.bodyG.add(arm); arm.position.set(0.9, 1.15, -0.35);
{ const sk = STD('#f1c27d'), sl = STD('#ff7043'); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.55, 8), sl); m.position.y = 0.27; arm.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), sk); h.position.y = 0.58; arm.add(h); arm.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// lorry (right lane, z -21..-11)
const LOZ = -16;
const lorry = new THREE.Group(); scene.add(lorry); lorry.position.set(LX, 0, LOZ);
const lorryRoof = V3(0, 3.0, -3.9);   // cab roof (lorry-local)
{ const cab = STD('#1565c0', { roughness: 0.35, metalness: 0.3 }), dk = STD('#263238'), wh = STD('#f5f5f5', { roughness: 0.5 });
  const ch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 10), dk); ch.position.y = 0.75; lorry.add(ch);
  const c = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.4, 2.2), cab); c.position.set(0, 2.05, -3.9); lorry.add(c);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 0.05), STD('#1a2633', { roughness: 0.05, metalness: 0.9 })); ws.position.set(0, 2.55, -5.01); lorry.add(ws);
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.55, 3.0, 7.3), wh); box.position.set(0, 2.55, 1.15); lorry.add(box);
  const lt = canvasTex(512, 128, (c2, w, h) => { c2.fillStyle = '#f5f5f5'; c2.fillRect(0, 0, w, h); c2.fillStyle = '#1565c0'; c2.font = '900 64px Inter'; c2.textAlign = 'center'; c2.fillText('FROZEN PEAS', w / 2, 86); });
  for (const s of [-1, 1]) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), L('#fff', { map: lt })); sg.rotation.y = s * Math.PI / 2; sg.position.set(s * 1.285, 2.6, 1.15); lorry.add(sg); }
  for (const z of [-3.9, 2.0, 3.6]) for (const s of [-1, 1]) { const w = makeWheel(0.52, 0.36); w.position.set(s * 1.08, 0.52, z); lorry.add(w); }
  lorry.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }

// ---------------- ice-cream van ----------------
const van = new THREE.Group(); scene.add(van);
const vanB = new THREE.Group(); van.add(vanB);
const VP = {};
{ const pink = STD('#ffb3d1', { roughness: 0.35, metalness: 0.15 }), wh = STD('#ffffff', { roughness: 0.4 }), dk = STD('#263238', { roughness: 0.7 }), gl = STD('#9fc6e0', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35 });
  const ch = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.35, 6.1), dk); ch.position.set(0, 0.55, 0); vanB.add(ch);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.25, 1.8), wh); cab.position.set(0, 1.25, -2.15); vanB.add(cab);
  const cabTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 1.2), wh); cabTop.position.set(0, 2.45, -1.85); vanB.add(cabTop);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 0.05), gl); ws.position.set(0, 2.05, -2.5); ws.rotation.x = -0.35; vanB.add(ws);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.9), gl); sw.position.set(s * 1.1, 2.1, -1.85); vanB.add(sw);
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.1), wh); pil.position.set(s * 1.06, 2.0, -2.38); vanB.add(pil); }
  const bodyT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#ffb3d1'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; for (let x = -40; x < w + 40; x += 80) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 40, h - 40); c.lineTo(x + 80, h); c.fill(); }
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, 26); c.fillStyle = '#d81b60'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.fillText('ICE CREAM', w / 2, 112);
    c.font = '800 30px Inter'; c.fillStyle = '#6a1b9a'; c.fillText('EMERGENCY SCOOPS', w / 2, 160); });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.5, 4.3), [STD('#fff', { map: bodyT, roughness: 0.4 }), STD('#fff', { map: bodyT, roughness: 0.4 }), wh, dk, pink, pink]); body.position.set(0, 2.05, 0.9); vanB.add(body);
  const bp = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.3, 0.25), dk); bp.position.set(0, 0.62, -3.05); vanB.add(bp);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.05), STD('#fffbe8', { emissive: '#fff3b0', emissiveIntensity: 0.5 })); hl.position.set(s * 0.75, 1.0, -3.06); vanB.add(hl); }
  // serving hatch on the right
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 1.9), dk); hatch.position.set(1.16, 2.2, 0.6); vanB.add(hatch);
  const awn = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 2.1), STD('#e91e63')); awn.position.set(1.45, 2.78, 0.6); awn.rotation.z = -0.3; vanB.add(awn);
  // freezer display on the left side (canvas updated per frame)
  const fc = document.createElement('canvas'); fc.width = 256; fc.height = 128; const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; VP.fc = fc; VP.ft = ft; VP.fs = '';
  const fp = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), new THREE.MeshBasicMaterial({ map: ft, toneMapped: false })); fp.rotation.y = -Math.PI / 2; fp.position.set(-1.16, 2.45, 1.7); vanB.add(fp);
  // rear doors (fly off at BOOM)
  VP.doors = [-1, 1].map(s => { const d = new THREE.Mesh(new THREE.BoxGeometry(1.12, 2.3, 0.06), pink); d.position.set(s * 0.57, 2.05, 3.07); vanB.add(d); d.userData.p0 = d.position.clone(); d.userData.s = s; return d; });
  // flashing beacons
  VP.lamps = ['#ff2d95', '#2f7bff'].map((c, k) => { const m = new THREE.MeshStandardMaterial({ color: '#222', emissive: c, emissiveIntensity: 0, toneMapped: false }); const l = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), m); l.position.set(k ? 0.6 : -0.6, 2.62, -1.9); vanB.add(l); return m; });
  // giant cone on the roof (also the cone cannon)
  const tur = new THREE.Group(); tur.position.set(0, 3.3, 0.9); vanB.add(tur); VP.tur = tur;
  const waf = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e0a35a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b5762f'; c.lineWidth = 8; for (let k = -w; k < 2 * w; k += 40) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + h, h); c.stroke(); c.beginPath(); c.moveTo(k, h); c.lineTo(k + h, 0); c.stroke(); } }, true);
  VP.waf = waf;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 24, 1, true), STD('#fff', { map: waf, roughness: 0.8, side: THREE.DoubleSide })); cone.rotation.x = Math.PI; cone.position.y = 0.0; tur.add(cone);
  const melt = new THREE.Group(); melt.position.y = 0.75; tur.add(melt); VP.melt = melt;
  const sc = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 16), STD('#ff8fb8', { roughness: 0.45 })); melt.add(sc); VP.scoop = sc;
  const sc2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), STD('#fff3d6', { roughness: 0.45 })); sc2.position.y = 0.7; melt.add(sc2);
  const ch2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), STD('#d50000', { roughness: 0.25 })); ch2.position.y = 1.22; melt.add(ch2);
  // drips
  VP.drips = Array.from({ length: 6 }, (_, k) => { const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.18, 4, 8), STD('#ff8fb8', { roughness: 0.4 })); scene.add(d); return d; });
  for (const z of [-2.2, 1.9]) for (const s of [-1, 1]) { const w = makeWheel(0.42, 0.3); w.position.set(s * 1.0, 0.42, z); van.add(w); }
  // ice-cream man in the cab
  const man = new THREE.Group(); man.position.set(-0.45, 1.55, -1.8); vanB.add(man); VP.man = man;
  const sk = STD('#f1c27d'); const tor = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.3, 4, 10), STD('#fafafa')); tor.position.y = 0.2; man.add(tor);
  const hd = new THREE.Group(); hd.position.y = 0.72; man.add(hd); VP.manHd = hd; hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), sk));
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.22, 14), STD('#fff')); hat.position.y = 0.2; hd.add(hat);
  const mus = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.05), STD('#4e342e')); mus.position.set(0, -0.05, -0.19); hd.add(mus);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), STD('#111')); e.position.set(s * 0.08, 0.05, -0.18); hd.add(e); }
  const mo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6), STD('#6d2b1f')); mo.scale.set(1.2, 0.6, 0.5); mo.position.set(0, -0.12, -0.18); hd.add(mo); VP.mouth = mo;
  VP.manArm = new THREE.Group(); VP.manArm.position.set(0.28, 0.42, 0); man.add(VP.manArm); { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.5, 8), STD('#fafafa')); a.position.y = -0.25; VP.manArm.add(a); const hh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), sk); hh.position.y = -0.52; VP.manArm.add(hh); }
  van.traverse(o => { if (o.isMesh && o.material !== gl) { o.castShadow = true; o.receiveShadow = true; } }); }

// ---------------- cones (party hats) ----------------
const FLAV = { straw: '#ff7aa8', choc: '#6d3b22', pist: '#93c572', van: '#fff1cf', mint: '#a8f0d0', lemon: '#fff176' };
const coneGeo = new THREE.ConeGeometry(0.2, 0.62, 16); coneGeo.rotateX(Math.PI); coneGeo.translate(0, 0.0, 0);   // point down
const coneMat = STD('#fff', { map: (() => { const t = VP.waf.clone(); t.repeat.set(2, 2); t.needsUpdate = true; return t; })(), roughness: 0.8 });
function makeIce(col, s = 1) { const g = new THREE.Group(); const c = new THREE.Mesh(coneGeo, coneMat); g.add(c); const sc = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), STD(col, { roughness: 0.45 })); sc.position.y = 0.36; g.add(sc);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.scale.setScalar(s); scene.add(g); return g; }

// ---------------- motion ----------------
const vanZW = mono([[0, 215], [4.3, 112], [6.0, 50], [8.2, 37], [11.8, 29], [15.6, 13], [18.1, 8.6], [40, 8.6]]);
const vanZR = mono([[0, 70], [38.6, 70], [40.4, 28], [41.95, 2.3], [44.0, -2.5], [44.8, -5.0], [45.45, -12.0], [49.8, -17.0], [51.2, -24], [55.5, -110]]);
const laneX = (c, t) => { const base = c.lane * LX; if (!isRight(t)) return base; const ta = (c.lane < 0 ? tLeft : tRightL) - 0.2 + clamp((50 - c.z) / 100) * 0.6; const u = ease(clamp((t - ta) / 0.9));
  return base + c.lane * 1.35 * u; };
const laneYaw = (c, t) => { if (!isRight(t)) return 0; const ta = (c.lane < 0 ? tLeft : tRightL) - 0.2 + clamp((50 - c.z) / 100) * 0.6; return -c.lane * 0.12 * Math.sin(Math.PI * clamp((t - ta) / 0.9)); };
// fire times (right way): when the van passes a car
const fireAt = z => { let lo = 38.6, hi = 55.5; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (vanZR(m) > z + 2) lo = m; else hi = m; } return lo; };
const flavList = ['van', 'mint', 'lemon', 'straw', 'choc', 'pist'];
cars.forEach(c => { c.tf = fireAt(c.z); c.flav = flavList[(c.i * 5 + 2) % flavList.length]; });
const cA = cars.find(c => c.lane > 0 && c.z === -4.5), cB = cars.find(c => c.lane < 0 && c.z === -7), cC = cars.find(c => c.lane < 0 && c.z === -14);
cA.flav = 'straw'; cB.flav = 'choc'; cC.flav = 'pist'; hero.flav = 'van';
cars.forEach(c => { c.ice = makeIce(FLAV[c.flav]); });
const lorryIce = makeIce(FLAV.straw, 3.2); const tLF = tExtra - 1.15, tLL = tExtra + 0.0;
const cherry = new THREE.Group(); scene.add(cherry);
{ const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), STD('#e00022', { roughness: 0.2 })); cherry.add(b); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 6), STD('#5d4037')); st.position.set(0.12, 0.75, 0); st.rotation.z = -0.3; cherry.add(st); cherry.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 10, 18, 1, true), STD('#fff', { side: THREE.DoubleSide, map: canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e53935'; for (let y = 0; y < h; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + 24); c.lineTo(w, y + 48); c.lineTo(0, y + 24); c.fill(); } }, true) })); straw.castShadow = true; scene.add(straw);

// ---------------- milkshake flood ----------------
const FX0 = -4.5, FX1 = 7.2, FZ0 = -110, FZ1 = 80, NZ = 380;
const shakeT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#f7b9d2'; c.fillRect(0, 0, w, h); const R = rng(11);
  for (let k = 0; k < 26; k++) { c.strokeStyle = ['#7b4a2e', '#fff3d6', '#ff8fb8', '#fff3d6'][k % 4]; c.lineWidth = 10 + R() * 26; c.lineCap = 'round'; c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (R() - 0.5) * 180; y += (R() - 0.5) * 180; c.quadraticCurveTo(x + (R() - 0.5) * 120, y + (R() - 0.5) * 120, x, y); } c.stroke(); } }, true);
shakeT.repeat.set(1.2, 14);
const floodG = new THREE.PlaneGeometry(FX1 - FX0, FZ1 - FZ0, 12, NZ); floodG.rotateX(-Math.PI / 2); floodG.translate((FX0 + FX1) / 2, 0, (FZ0 + FZ1) / 2);
const flood = new THREE.Mesh(floodG, STD('#ffffff', { map: shakeT, roughness: 0.22, metalness: 0.05, envMapIntensity: 1.2 })); flood.receiveShadow = true; flood.castShadow = false; flood.frustumCulled = false; scene.add(flood);
const FLV = 1.15, FSP = 13;
function floodH(z, t) { // height of the milkshake at z
  if (isRight(t) || t < tBoom) return -0.5; const zv = vanZW(t); const d = Math.abs(z - (zv + 1.2)); const r = FSP * (t - tBoom) + 2.5;
  if (d > r + 2.0) return -0.5; const crest = 1.9 * Math.exp(-Math.pow((r - d) / 2.8, 2)) * (1 - ramp(t, tBoom + 5, tBoom + 7.5));
  const lev = FLV * ramp(t, tBoom, tBoom + 0.6); if (d > r) return lerp(lev + crest, -0.5, (d - r) / 2.0);
  return lev + crest + 0.06 * Math.sin(z * 0.7 + t * 2.0); }
// sprinkles
const NSPR = 420; const sprM = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.06, 0.3, 3, 6), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }), NSPR); sprM.frustumCulled = false; scene.add(sprM);
{ const cs = ['#ff3b30', '#ffd60a', '#39d353', '#2f7bff', '#ff9f0a', '#bf5af2', '#ffffff']; const c = new THREE.Color(); for (let i = 0; i < NSPR; i++) sprM.setColorAt(i, c.set(cs[i % cs.length])); }

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const vz = t => isRight(t) ? vanZR(t) : vanZW(t);
const VanCam = (off, look, fov = 40) => t => { const z = vz(t); return [V3(off[0], off[1], z + off[2]), V3(look[0], look[1], z + look[2]), fov]; };
const HC = isR => isR ? -LX - 1.35 : -LX;
const camKeys = [
  [0.0, Ac([5.0, 9.5, 32], [-1.0, 0.0, -24])],
  [tThen - 0.3, Ac([4.4, 8.6, 27], [-1.0, 0.0, -24])],
  ...cut(tThen - 0.25, Ac([0.6, 3.4, 9.5], [-1.9, 1.0, -1.5], 40)),
  [tBut - 0.3, Ac([0.4, 3.2, 8.6], [-1.9, 1.0, -1.5], 40)],
  ...cut(tBut - 0.25, Ac([0.3, 1.5, 49], [0.0, 2.2, 120], 16)),
  [tIts - 0.3, Ac([0.3, 1.5, 49], [0.0, 2.2, 90], 18)],
  ...cut(tIts - 0.25, VanCam([0.5, 1.25, -10.5], [0.0, 2.3, 0.0], 40)),
  [tAnd0 - 0.25, VanCam([0.5, 1.3, -9.5], [0.0, 2.4, 0.0], 40)],
  ...cut(tAnd0 - 0.2, VanCam([3.8, 5.9, -4.8], [0.0, 3.9, 0.9], 40)),
  [tWhat - 0.3, VanCam([3.5, 5.7, -4.3], [0.0, 4.0, 0.9], 40)],
  ...cut(tWhat - 0.25, Ac([-2.5, 13, -24], [0.3, 0.0, 18])),
  [S('wrong1').start - 0.2, Ac([-2.4, 13.4, -23], [0.3, 0.0, 18])],
  // wrong
  ...cut(S('wrong1').start - 0.15, VanCam([3.4, 7.5, 15], [0.0, 0.5, -14])),
  [tThey - 0.3, VanCam([3.0, 7.0, 13], [0.0, 0.5, -14])],
  ...cut(tThey - 0.25, Ac([0.9, 1.9, -6.2], [-1.4, 1.3, 2.5], 40)),
  [tBig - 0.2, Ac([0.8, 1.9, -5.8], [-1.4, 1.3, 2.5], 40)],
  ...cut(tBig - 0.15, Ac([0.4, 7.0, -4.0], [0.0, 1.4, 9.5], 40)),
  [tSun - 0.3, Ac([0.4, 7.2, -4.6], [0.0, 1.4, 9.5], 40)],
  ...cut(tSun - 0.25, Ac([-3.0, 2.2, 3.0], [0.0, 4.6, 9.8], 40)),
  [tFreezer - 0.3, Ac([-3.2, 2.2, 2.6], [0.0, 4.6, 9.8], 40)],
  ...cut(tFreezer - 0.25, Ac([-4.9, 3.3, 15.5], [-0.8, 2.5, 9.6], 40)),
  [tBoom - 0.1, Ac([-4.7, 3.3, 15.0], [-0.8, 2.5, 9.6], 40)],
  ...cut(tBoom - 0.05, Ac([5.0, 7.5, 34], [0.0, 1.5, 8])),
  [tGiant + 0.5, Ac([5.5, 8.5, 36], [0.0, 1.0, 6])],
  ...cut(tFloods - 0.3, Ac([2.5, 6.0, -40], [0.0, 1.2, -8])),
  [tNow - 0.3, Ac([2.5, 6.4, -38], [0.0, 1.2, -10])],
  ...cut(tNow - 0.25, Ac([2.8, 4.0, -8.0], [-1.9, 1.6, 0.0])),
  [tRew0, Ac([2.4, 4.6, -8.5], [-1.9, 1.8, 0.0])],
  // right
  ...cut(tRew1, Ac([5.0, 10, 34], [-0.5, 0.0, -15])),
  [tMake - 0.1, Ac([4.0, 12, 34], [-0.3, 0.0, -12])],
  [tLeft - 0.3, Ac([0.6, 24, 36], [0.0, 0.0, -6])],
  [S('right2').end + 0.1, Ac([0.6, 25, 35], [0.0, 0.0, -6])],
  ...cut(S('right3').start - 0.1, Ac([0.0, 1.3, -6.5], [0.0, 1.6, 40], 30)),
  [tThank - 0.45, Ac([0.0, 1.4, -6.5], [0.0, 1.8, 20], 32)],
  ...cut(tThank - 0.4, Ac([-6.6, 4.4, -7.5], [-2.6, 1.9, 1.5], 40)),
  [tStraw - 0.3, Ac([-6.4, 4.4, -7.0], [-2.6, 1.9, 1.0], 40)],
  ...cut(tStraw - 0.25, Ac([7.3, 3.6, -10.5], [3.25, 1.6, -4.5], 40)),
  ...cut(tChoc - 0.25, Ac([-7.2, 3.6, -13.2], [-3.25, 1.6, -7.0], 40)),
  ...cut(tPist - 0.25, Ac([-7.2, 3.6, -20.2], [-3.25, 1.6, -14.0], 40)),
  ...cut(tEvery - 0.15, Ac([4.0, 15, 36], [0.0, 0.0, -14])),
  [tEven - 0.3, Ac([3.5, 16, 33], [0.0, 0.0, -16])],
  ...cut(tEven - 0.25, Ac([10.5, 8.0, -33.0], [2.6, 3.4, -18.5], 40)),
  [tExtra + 0.6, Ac([10.0, 7.6, -32.0], [2.6, 3.6, -18.5], 40)],
  ...cut(tOver - 0.2, Ac([0.0, 4.0, 14], [0.0, 1.5, -40], 36)),
  [S('right7').start - 0.2, Ac([0.0, 4.4, 12], [0.0, 1.5, -60], 36)],
  ...cut(S('right7').start - 0.15, Ac([-6.0, 2.3, 7.0], [-2.6, 1.6, -10])),
  [S('outro').start, Ac([-6.5, 3.6, 9.0], [-2.0, 1.6, -12])],
  [TOTAL - 0.3, Ac([-8, 9, 16], [-1.0, 1.0, -16])],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {}; let heat = 0;
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _m = new THREE.Matrix4();
const baseSun = sun.color.clone(), baseSunI = sun.intensity;
function carPose(c, t) {
  const p = { x: laneX(c, t), y: 0, z: c.z, h: laneYaw(c, t), pitch: 0, roll: 0 };
  if (c.hero && !isRight(t)) { }
  const fh = floodH(c.z, t); if (fh > -0.2) { const lift = Math.max(0, fh - 0.55); p.y = lift; const fl = ramp(t, tBoom + 0.3, tBoom + 1.5) * (lift > 0 ? 1 : 0); p.roll = 0.07 * fl * Math.sin(t * 1.3 + c.ph); p.pitch = 0.05 * fl * Math.sin(t * 1.1 + c.ph * 2); p.h += 0.15 * fl * Math.sin(t * 0.4 + c.ph); }
  return p;
}
function update(t) {
  const right = isRight(t);
  // heat (wrong): sun turns hot
  heat = !right ? ramp(t, tSun - 0.3, tHotter + 0.5) * (1 - ramp(t, tBoom + 2, tBoom + 4)) : 0;
  sun.color.copy(baseSun).lerp(new THREE.Color('#ff9a40'), heat * 0.7); sun.intensity = baseSunI * (1 + 0.35 * heat);
  // cars
  cars.forEach(c => { const p = carPose(c, t); placeCar(c.g, p); blink(c.g, t, false, false);
    // party hat cone
    const ice = c.ice; ice.visible = right && t > c.tf;
    if (ice.visible) { const roof = c.g.localToWorld(V3(0, 1.62 + 0.24 * 1.0 + 0.0, 0.1)); c.g.updateMatrixWorld(true); const roofW = c.g.localToWorld(V3(0, 2.12, 0.1));
      const u = clamp((t - c.tf) / 0.55); const from = V3(0, vanB.position.y + 4.2, vanZR(c.tf) + 0.9);
      if (u < 1) { const p = from.clone().lerp(roofW, u); p.y += 2.6 * Math.sin(Math.PI * u); ice.position.copy(p); ice.rotation.set(Math.PI * 3 * u, 0, 0.3 * Math.sin(u * 6)); ice.scale.setScalar(1); }
      else { const sq = 1 + 0.25 * Math.exp(-(t - c.tf - 0.55) * 9) * Math.sin((t - c.tf - 0.55) * 30); ice.position.copy(roofW); ice.rotation.set(Math.PI, 0, 0); ice.scale.set(sq, 1 / sq, sq); } } });
  // hero arm
  const wv = !right ? win(t, tWave - 0.3, tCone + 0.6, 0.2) : 0; arm.visible = wv > 0.01; arm.rotation.set(0, 0, -0.5 - 0.5 * wv + 0.5 * Math.sin(t * 12) * wv); arm.scale.setScalar(Math.max(0.01, wv));
  // lorry
  { const fh = floodH(LOZ, t); const lift = Math.max(0, fh - 0.7); lorry.position.set(right ? LX + 1.35 * ease(clamp((t - tRightL + 0.2 - 0.3) / 0.9)) : LX, lift, LOZ); lorry.rotation.set(0.03 * Math.sin(t * 1.1) * (lift > 0 ? 1 : 0), 0, 0.04 * Math.sin(t * 1.3) * (lift > 0 ? 1 : 0)); }
  lorryIce.visible = right && t > tLF;
  if (lorryIce.visible) { lorry.updateMatrixWorld(true); const roofW = lorry.localToWorld(lorryRoof.clone().add(V3(0, 2.1, 0))); const u = clamp((t - tLF) / (tLL - tLF)); const from = V3(0, 4.6, vanZR(tLF) + 0.9);
    if (u < 1) { const p = from.clone().lerp(roofW, u); p.y += 5.0 * Math.sin(Math.PI * u); lorryIce.position.copy(p); lorryIce.rotation.set(Math.PI * 3 * u, 0, 0); lorryIce.scale.setScalar(3.2); }
    else { const sq = 1 + 0.25 * Math.exp(-(t - tLL) * 7) * Math.sin((t - tLL) * 24); lorryIce.position.copy(roofW); lorryIce.rotation.set(Math.PI, 0, 0); lorryIce.scale.set(3.2 * sq, 3.2 / sq, 3.2 * sq); } }
  // van
  const z = vz(t); const fhv = floodH(z + 1, t); const vlift = Math.max(0, fhv - 0.75);
  const stuckJ = !right ? win(t, tStuck - 0.05, tStuck + 0.5, 0.05) : 0;
  van.position.set(0, vlift, z); van.rotation.set(0, 0, 0);
  vanB.rotation.set(0.02 * stuckJ * Math.sin(t * 40), 0, 0.03 * stuckJ * Math.sin(t * 33)); vanB.scale.set(1 - 0.05 * (!right && t > tStuck ? 1 : 0) * 0, 1, 1);
  const shake = !right ? win(t, tGives - 0.1, tBoom + 0.1, 0.1) : 0; vanB.position.set(0.04 * shake * Math.sin(t * 50), 0.03 * shake * Math.sin(t * 43), 0);
  if (vlift > 0) { van.rotation.z = 0.05 * Math.sin(t * 1.2); van.rotation.x = 0.03 * Math.sin(t * 0.9); }
  van.children.forEach(o => { if (o !== vanB) o.rotation.x = -(z - 150) / 0.42; });
  const flash = Math.floor(t * 5) % 2; VP.lamps[0].emissiveIntensity = flash ? 1.0 : 0.08; VP.lamps[1].emissiveIntensity = flash ? 0.08 : 1.0;
  // doors fly off at BOOM
  VP.doors.forEach(d => { const u = !right ? clamp((t - tBoom) / 1.4) : 0; const p0 = d.userData.p0, s = d.userData.s;
    d.position.set(p0.x + s * 3.5 * u, p0.y + 7 * u - 9 * u * u, p0.z + 9 * u); d.rotation.set(-5 * u, s * 2 * u, s * 3 * u); d.visible = u < 0.98; });
  // roof cone: melting (wrong) / cannon (right)
  const mlt = !right ? Math.max(0.35 * ramp(t, tMelting - 0.6, tMelting + 1.0), ramp(t, tSun - 0.2, tGives) ) : 0;
  VP.melt.scale.set(1 + 0.25 * mlt, 1 - 0.45 * mlt, 1 + 0.25 * mlt); VP.melt.rotation.z = 0.25 * mlt; VP.melt.position.y = 0.75 - 0.2 * mlt;
  VP.tur.rotation.set(0, 0, 0); VP.tur.scale.setScalar(1);
  if (right) { // tilt towards the side being fired at + recoil
    let side = 0, rec = 0; cars.forEach(c => { const dt = t - c.tf; if (dt > -0.25 && dt < 0.35) { side = -c.lane; rec = Math.max(rec, Math.exp(-Math.max(0, dt) * 10) * (dt > 0 ? 1 : 0)); } });
    const dl = t - tLF; if (dl > -0.3 && dl < 0.5) { side = -1; rec = Math.max(rec, dl > 0 ? Math.exp(-dl * 8) : 0); }
    VP.tur.rotation.z = 0.45 * side; VP.tur.scale.set(1, 1 - 0.2 * rec, 1); }
  VP.drips.forEach((d, k) => { const per = 1.1, ph = ((t + k * per / 6) % per) / per; const on = !right && t > tMelting - 0.5 && t < tBoom; d.visible = on;
    if (on) { const a = k * 1.05; d.position.set(Math.cos(a) * 0.78 * (1 + 0.25 * mlt), van.position.y + 3.3 + 0.7 - 0.2 * mlt - ph * 1.1, z + 0.9 + Math.sin(a) * 0.78); d.scale.setScalar(0.6 + 0.6 * mlt); } });
  // ice-cream man
  const panic = !right ? ramp(t, tStuck, tStuck + 0.4) : 0; VP.mouth.scale.set(1.2 - 0.4 * panic, 0.6 + 1.0 * panic, 0.5); VP.manHd.rotation.set(0, 0.4 * Math.sin(t * 6) * panic, 0);
  VP.manArm.rotation.set(0, 0, right ? 2.4 * win(t, tZooms, tMelted + 1, 0.3) + 0.3 * Math.sin(t * 10) : 1.8 * win(t, tSiren, tMove, 0.3) * (0.8 + 0.3 * Math.sin(t * 11)));
  // freezer display
  const temp = !right ? Math.round(lerp(-18, 31, ramp(t, tSun - 0.3, tGives))) : -18; const err = !right && t > tGives;
  const fsTxt = err ? 'ERROR' : `${temp > 0 ? '+' : ''}${temp}°C`;
  if (fsTxt !== VP.fs) { VP.fs = fsTxt; const c = VP.fc.getContext('2d'); c.fillStyle = '#111'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#fff'; c.font = '800 22px Inter'; c.textAlign = 'center'; c.fillText('FREEZER', 128, 28);
    c.fillStyle = err ? '#ff1744' : temp > 0 ? '#ff9100' : '#00e5ff'; c.font = '900 64px Inter'; c.fillText(fsTxt, 128, 100); VP.ft.needsUpdate = true; }
  // flood
  const pos = floodG.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, floodH(pos.getZ(i), t)); pos.needsUpdate = true; floodG.computeVertexNormals();
  flood.visible = !right && t > tBoom - 0.05; shakeT.offset.set(0.02 * t, -0.01 * t);
  // straw + cherry + sprinkles
  const hp = carPose(hero, t);
  straw.visible = !right && t > tMilk - 0.4; if (straw.visible) { const u = easeIn(clamp((t - tMilk + 0.4) / 0.45)); straw.position.set(-1.4, lerp(22, 4.0, u), 4.0); straw.rotation.set(0.15, 0, -0.25 + 0.04 * Math.sin(t * 2) * (u >= 1 ? 1 : 0)); }
  cherry.visible = !right && t > tSprink - 0.6; if (cherry.visible) { hero.g.updateMatrixWorld(true); const roof = hero.g.localToWorld(V3(0, 2.15, 0.2)); const u = clamp((t - tSprink + 0.6) / 0.55); cherry.position.set(roof.x, lerp(roof.y + 14, roof.y, easeIn(u)), roof.z); const sq = u >= 1 ? 1 + 0.3 * Math.exp(-(t - tSprink + 0.05) * 8) * Math.sin((t - tSprink) * 30) : 1; cherry.scale.set(sq, 1 / sq, sq); }
  for (let i = 0; i < NSPR; i++) { const t0 = tSprink - 0.7 + hash(i) * 2.2; const x = -4.2 + hash(i + 7) * 9, zz = -9 + hash(i + 13) * 14; let y;
    if (right || t < t0) { sprM.setMatrixAt(i, _m.makeScale(0, 0, 0)); continue; }
    const fy = floodH(zz, t) + 0.03; y = Math.max(fy, 9 - 12 * (t - t0)); _e.set(y > fy ? t * 5 + i : Math.PI / 2, hash(i + 3) * 6, 0); _q.setFromEuler(_e); _m.compose(V3(x, y, zz), _q, V3(1, 1, 1)); sprM.setMatrixAt(i, _m); }
  sprM.instanceMatrix.needsUpdate = true;
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  applyCam(c, t, (!right && (win(t, tStuck - 0.03, tStuck + 0.3, 0.04) + win(t, tBoom - 0.02, tBoom + 0.6, 0.04)) > 0) ? 0.06 : 0);
  camera.updateMatrixWorld(true); hero.g.updateMatrixWorld(true); van.updateMatrixWorld(true);
  screen = { hero: project(hero.g.localToWorld(V3(0.9, 2.0, 0))), man: project(VP.manHd.localToWorld(V3(0, 0.5, 0))), van: project(van.localToWorld(V3(0, 5.0, 0.9))) };
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
function heatGlow() { if (heat <= 0.01) return; const g = ctx.createRadialGradient(W * 0.78, 120, 20, W * 0.78, 120, 700); g.addColorStop(0, `rgba(255,250,215,${0.95 * heat})`); g.addColorStop(0.12, `rgba(255,225,140,${0.8 * heat})`); g.addColorStop(0.35, `rgba(255,160,50,${0.45 * heat})`); g.addColorStop(1, 'rgba(255,120,0,0)');
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,130,30,${0.55 * heat})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    heatGlow();
    P_('TRAFFIC JAM', '#455a64', tJam - 0.1, tThen - 0.1, 54);
    P_('SIREN!', '#1565c0', tSiren - 0.15, tAmb + 0.3, 56);
    P_('AMBULANCE?', '#455a64', tAmb - 0.15, tIts - 0.1, 54);
    P_('ICE-CREAM VAN', '#d81b60', tIce - 0.15, tEmerg - 0.1, 56);
    P_('EMERGENCY: MELTING', RED, tEmerg - 0.1, S('hook2').end + 0.3, 48, iconWarn);
    P_('NOBODY MOVES', RED, tMove - 0.2, tThey - 0.1, 52, iconX);
    bubble('ONE CONE, PLEASE!', screen.hero, t, tWave - 0.1, tBig - 0.2, 46, '#fff', '#111', -110);
    P_('VAN: STUCK', RED, tStuck - 0.1, tSun - 0.2, 56, iconX);
    { const a = tSun - 0.2, b = tGives; if (t > a && t < b + 0.3) P_(`TEMPERATURE: ${Math.round(lerp(31, 49, ramp(t, a, b)))}°C`, '#ef6c00', a, tGives + 0.3, 48); }
    P_('FREEZER: ERROR', RED, tGives - 0.1, tBoom - 0.05, 52, iconWarn);
    floatText('BOOM!', W / 2, 720, t, tBoom - 0.03, tBoom + 0.9, 190, '#ff8fb8', -0.08);
    P_('MELTED ICE CREAM: EVERYWHERE', '#ad1457', tGiant - 0.1, tNow - 0.2, 40);
    P_('YOU: IN A MILKSHAKE', '#ad1457', tMilk - 0.4, tSprink - 0.2, 48);
    P_('+ SPRINKLES', '#6a1b9a', tSprink - 0.2, tRew0, 54);
  } else {
    P_('EMERGENCY LANE', GREEN, tMake - 0.1, tLeft - 0.2, 54, iconCheck);
    P_('◀ LEFT LANE: LEFT', '#00897b', tLeft - 0.2, tRightL - 0.2, 50);
    P_('RIGHT LANE: RIGHT ▶', '#00897b', tRightL - 0.2, S('right2').end + 0.3, 50);
    P_('VAN: ZOOMING THROUGH', '#d81b60', tZooms - 0.1, tThank - 0.3, 46);
    P_('THANK-YOU CONES', '#d81b60', tFires - 0.25, tStraw - 0.3, 52);
    P_('STRAWBERRY', '#ec407a', tStraw - 0.15, tChoc - 0.2, 58);
    P_('CHOCOLATE', '#6d3b22', tChoc - 0.15, tPist - 0.2, 58);
    P_('PISTACHIO', '#689f38', tPist - 0.15, tEvery - 0.2, 58);
    P_('PARTY HATS: ALL CARS', GREEN, tParty - 0.35, tEven - 0.2, 48, iconCheck);
    P_('LORRY: EXTRA LARGE', '#1565c0', tExtra - 0.15, S('right6').start - 0.1, 50);
    P_('MELTED: 0', GREEN, tNothing - 0.15, S('right7').start, 58, iconCheck);
  }
}
window.dbg = { vanZW, vanZR, cars };
start(update, hud);
