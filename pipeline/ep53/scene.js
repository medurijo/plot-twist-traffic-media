// Episode 48 (FORMAT v2): School zone – the lollipop lady is a snowman, and she's melting
// v2: cold open (gag in frame 1), quiz card A/B/C + comment prompt, ~38 s, recurring duo in a convertible learner car:
//     nervous hamster learner (driver) + grumpy owl instructor (passenger, narrator voice, catchphrases "Failed. Obviously." / "Passed. Barely.")
// wrong (A: honk): she jumps, collapses into our car -> the owl is a snowman now
// right (C: air con on max): she freezes back up, walks the penguins across, turns her sign: GO
import {
  THREE, W, H, S, WT, TL, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape,
  makeCar, placeCar, applyCam, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, floatText, start, rr, aoPass
} from '../common2.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tSchool = WT('hook1', 'School'), tLolli = WT('hook1', 'lollipop'), tSnowman = WT('hook1', 'snowman'), tMelt = WT('hook2', 'melting'), tWhat = WT('hook2', 'What');
const tHonk = WT('wrong2', 'Honk'), tJumps = WT('wrong2', 'jumps'), tColl = WT('wrong2', 'collapses'), tRight2 = WT('wrong2', 'Right'), tCarW = WT('wrong2', 'car');
const tMe = WT('wrong3', 'me'), tSnowNow = WT('wrong3', 'snowman'), tFailed = WT('wrong4', 'Failed');
const tAir = WT('right2', 'Air'), tMax = WT('right2', 'max'), tVents = WT('right2', 'vents');
const tFreezes = WT('right3', 'freezes'), tWalks = WT('right3', 'walks'), tPeng = WT('right3', 'penguins'), tAcross = WT('right3', 'across');
const tTurns = WT('right4', 'turns'), tSign = WT('right4', 'sign'), tGo = WT('right4', 'Go'), tPassed = WT('right7', 'Passed'), tBarely = WT('right7', 'Barely');
const isRight = t => t >= tRew0 + 0.5;
const ALLW = []; for (const id of Object.keys(TL.segs)) for (const w of TL.segs[id].words) ALLW.push(w);
const talking = t => { for (const w of ALLW) if (t >= w.s && t < w.e) return 0.5 + 0.5 * Math.sin((t - w.s) * 22); return 0; };

function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}

// ---------------- world: school zone ----------------
makeLandscape({ avoid: (x, z) => (x > -14 && x < 34 && z > -40 && z < 40), fieldAvoid: (x, z, w, d) => (x + w / 2 > -20 && x - w / 2 < 40 && z + d / 2 > -46 && z - d / 2 < 46), near: [0, -90, 200, 100], trees: 1500, seed: 4801 });
plane(-3.5, 3.5, -400, 400, asphaltMat, 0.05, 7);
const kerbMat = STD('#c9c4ba', { roughness: 0.9 });
for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.BoxGeometry(4, 0.16, 800), kerbMat); k.position.set(s * 5.5, 0.08, 0); k.receiveShadow = true; scene.add(k); }
{ // zebra crossing + centre line
  const g = new THREE.PlaneGeometry(0.55, 4.0); g.rotateX(-Math.PI / 2); const zl = []; for (let x = -3.0; x <= 3.01; x += 1.0) zl.push([x, 0.07, 0.3]); instanced(g, markMat, zl, false);
  const dg = new THREE.PlaneGeometry(0.16, 3); dg.rotateX(-Math.PI / 2); const dl = []; for (let z = -300; z < 300; z += 7) if (Math.abs(z - 0.3) > 4) dl.push([0, 0.07, z]); instanced(dg, markMat, dl, false);
  const zz = new THREE.PlaneGeometry(6.8, 0.25); zz.rotateX(-Math.PI / 2); const zm = L('#ffd54f', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }); instanced(zz, zm, [[0, 0.07, 9], [0, 0.07, -8.5]], false);
  const sz = canvasTex(512, 128, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h); c.fillStyle = '#ffd54f'; c.font = '900 110px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SCHOOL', w / 2, h / 2 + 6); });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.1), new THREE.MeshLambertMaterial({ map: sz, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })); sm.rotation.x = -Math.PI / 2; sm.position.set(0, 0.075, 12.5); scene.add(sm); }
{ // school building + fence + sign
  const sch = new THREE.Group(); sch.position.set(20, 0, -6); scene.add(sch);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(18, 7, 12), STD('#e57357', { roughness: 0.85 })); wall.position.y = 3.5; wall.castShadow = wall.receiveShadow = true; sch.add(wall);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(18.6, 0.6, 12.6), STD('#5d4037')); roof.position.y = 7.3; sch.add(roof);
  const winT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#81d4fa'; c.fillRect(10, 10, 108, 108); c.fillStyle = '#fff'; c.fillRect(60, 10, 8, 108); c.fillRect(10, 60, 108, 8); });
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const wm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), STD('#fff', { map: winT })); wm.rotation.y = -Math.PI / 2; wm.position.set(-9.01, 2.2 + j * 2.8, -6 + i * 2.4 + 0.0); sch.add(wm); }
  const sT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#1565c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 84px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SCHOOL', w / 2, h / 2 + 4); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), STD('#fff', { map: sT })); sp.rotation.y = -Math.PI / 2; sp.position.set(-9.02, 6.2, 2); sch.add(sp);
  const fence = []; for (let z = -30; z < 30; z += 1.2) fence.push([8.2, 0.6, z]); instanced(new THREE.BoxGeometry(0.08, 1.2, 0.08), STD('#43a047'), fence, true);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 60), STD('#43a047')); rail.position.set(8.2, 1.15, 0); scene.add(rail);
  // warning sign (children) at the right kerb, away from the camera lines
  const wT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(128, 12); c.lineTo(246, 230); c.lineTo(10, 230); c.closePath(); c.fill(); c.strokeStyle = '#e53935'; c.lineWidth = 22; c.stroke();
    c.fillStyle = '#111'; for (const [x, s] of [[100, 1], [150, 0.8]]) { c.beginPath(); c.arc(x, 110, 14 * s, 0, 7); c.fill(); c.fillRect(x - 10 * s, 128, 20 * s, 50 * s); c.fillRect(x - 14 * s, 175, 9 * s, 30 * s); c.fillRect(x + 5 * s, 175, 9 * s, 30 * s); } });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), STD('#9e9e9e')); pole.position.set(4.4, 1.3, 16); scene.add(pole);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ map: wT, transparent: true, side: THREE.DoubleSide })); ws.position.set(4.4, 2.9, 16); scene.add(ws); }

// ---------------- learner car (convertible) + duo ----------------
const hero = makeCar('#fdd835');
const HB = hero.userData.bodyG;
HB.children[1].visible = false; HB.children[2].visible = false;            // no glass, no roof: convertible
{ const trim = STD('#37474f', { roughness: 0.6 }), seat = STD('#3e2723', { roughness: 0.8 });
  const tub = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 2.3), STD('#263238', { roughness: 0.9 })); tub.position.set(0, 1.0, 0.05); HB.add(tub);
  for (const x of [-0.42, 0.42]) { const sb = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.7, 0.14), seat); sb.position.set(x, 1.35, 0.62); sb.rotation.x = -0.12; sb.castShadow = true; HB.add(sb); }
  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.4), trim); dash.position.set(0, 1.1, -0.92); dash.castShadow = true; HB.add(dash);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.42, 0.03), new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.2 })); ws.position.set(0, 1.38, -1.12); ws.rotation.x = -0.45; ws.userData.noAO = true; HB.add(ws);
  const wf = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.05, 0.05), trim); wf.position.set(0, 1.58, -1.02); wf.rotation.x = -0.45; HB.add(wf);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 24), STD('#212121')); wheel.position.set(-0.42, 1.32, -0.62); wheel.rotation.x = -0.9; HB.add(wheel);
  // L plates
  const lT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ccc'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#e53935'; c.fillRect(34, 20, 22, 88); c.fillRect(34, 86, 62, 22); });
  for (const [z, ry] of [[-2.24, Math.PI], [2.24, 0]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), STD('#fff', { map: lT })); p.position.set(0.55, 0.62, z); p.rotation.y = ry; HB.add(p); }
  // air-con button + vents on the dash
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), new THREE.MeshStandardMaterial({ color: '#29b6f6', emissive: '#29b6f6', emissiveIntensity: 0.2 })); btn.rotation.x = Math.PI / 2 - 0.4; btn.position.set(0, 1.22, -0.73); HB.add(btn); hero.userData.btn = btn;
  HB.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); }
// hamster learner (driver, local forward -z)
const ham = new THREE.Group(); ham.position.set(-0.42, 1.0, 0.1); HB.add(ham);
const HM = {};
{ const fur = STD('#e8a25c', { roughness: 0.85 }), cream = STD('#fff3e0', { roughness: 0.85 }), pink = STD('#f8a5b5', { roughness: 0.6 });
  const add = (geo, mat, x, y, z, p = ham) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  add(new THREE.SphereGeometry(0.33, 22, 16), fur, 0, 0.3, 0).scale.set(1, 1.05, 0.95);
  add(new THREE.SphereGeometry(0.24, 18, 12), cream, 0, 0.26, -0.15).scale.set(1, 1.1, 0.6);
  const hd = new THREE.Group(); hd.position.set(0, 0.7, -0.02); ham.add(hd); HM.head = hd;
  add(new THREE.SphereGeometry(0.3, 24, 18), fur, 0, 0, 0, hd);
  for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.15, 14, 10), cream, s * 0.15, -0.09, -0.17, hd);
    const ear = add(new THREE.SphereGeometry(0.1, 12, 8), fur, s * 0.2, 0.23, 0.02, hd); ear.scale.set(1, 1, 0.5); add(new THREE.SphereGeometry(0.06, 10, 6), pink, s * 0.2, 0.23, -0.02, hd).scale.set(1, 1, 0.4); }
  add(new THREE.SphereGeometry(0.045, 10, 8), pink, 0, -0.03, -0.31, hd);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.035, 0.05, 0.02), STD('#ffffff'), s * 0.02, -0.12, -0.285, hd);
  HM.eyes = [-1, 1].map(s => { const w = add(new THREE.SphereGeometry(0.085, 14, 10), STD('#ffffff', { roughness: 0.2 }), s * 0.12, 0.07, -0.235, hd);
    const p = add(new THREE.SphereGeometry(0.06, 12, 8), STD('#111', { roughness: 0.15 }), s * 0.12, 0.07, -0.29, hd); const hl = add(new THREE.SphereGeometry(0.02, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' }), s * 0.135, 0.095, -0.345, hd);
    return { w, p, hl, s }; });
  const wm = STD('#5d4037'); for (const s of [-1, 1]) for (const k of [-1, 1]) { const wh = add(new THREE.BoxGeometry(0.2, 0.008, 0.008), wm, s * 0.2, -0.05 + k * 0.025, -0.24, hd); wh.rotation.z = s * k * 0.15; wh.rotation.y = s * 0.3; }
  HM.paws = [-1, 1].map(s => add(new THREE.SphereGeometry(0.06, 10, 8), fur, s * 0.13, 0.36, -0.5));
  HM.sweat = [0, 1].map(k => add(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshStandardMaterial({ color: '#81d4fa', roughness: 0.1, transparent: true, opacity: 0.85 }), (k ? 0.24 : -0.22), 0.15, -0.1, hd)); }
// owl instructor (passenger)
const owl = new THREE.Group(); owl.position.set(0.42, 1.0, 0.2); HB.add(owl);
const OW = {};
{ const featT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(60,35,20,0.35)'; c.lineWidth = 5; for (let r = 0; r < 10; r++) for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(k * 30 + (r % 2) * 15, r * 28, 13, 0.2, Math.PI - 0.2); c.stroke(); } }, true); featT.repeat.set(2, 2);
  const brown = STD('#8d6e63', { roughness: 0.8, map: featT }), cream = STD('#efe3d3', { roughness: 0.8 }), dark = STD('#3e2723', { roughness: 0.6 }), yel = STD('#ffb300', { roughness: 0.4 });
  const add = (geo, mat, x, y, z, p = owl) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  add(new THREE.SphereGeometry(0.4, 24, 18), brown, 0, 0.4, 0).scale.set(1, 1.15, 0.9);
  add(new THREE.SphereGeometry(0.28, 18, 12), cream, 0, 0.35, -0.2).scale.set(1, 1.2, 0.55);
  const hd = new THREE.Group(); hd.position.set(0, 0.98, -0.02); owl.add(hd); OW.head = hd;
  add(new THREE.SphereGeometry(0.36, 26, 18), brown, 0, 0, 0, hd).scale.set(1.12, 0.95, 0.95);
  for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.19, 18, 12), cream, s * 0.15, 0.0, -0.25, hd).scale.set(1, 1, 0.45);
    const tuft = add(new THREE.ConeGeometry(0.08, 0.26, 8), brown, s * 0.27, 0.32, 0.02, hd); tuft.rotation.z = -s * 0.5; }
  OW.eyes = [-1, 1].map(s => { const w = add(new THREE.SphereGeometry(0.11, 16, 12), STD('#ffca28', { roughness: 0.3 }), s * 0.15, 0.02, -0.3, hd);
    const p = add(new THREE.SphereGeometry(0.06, 12, 8), STD('#111', { roughness: 0.15 }), s * 0.15, 0.02, -0.4, hd); const hl = add(new THREE.SphereGeometry(0.018, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' }), s * 0.165, 0.05, -0.455, hd);
    const br = add(new THREE.BoxGeometry(0.24, 0.055, 0.05), dark, s * 0.15, 0.16, -0.36, hd); br.rotation.z = s * 0.42;
    const gl = add(new THREE.TorusGeometry(0.125, 0.014, 6, 20), STD('#212121', { metalness: 0.5, roughness: 0.3 }), s * 0.15, 0.02, -0.43, hd);
    return { w, p, hl, br, gl, s }; });
  add(new THREE.BoxGeometry(0.07, 0.02, 0.02), STD('#212121'), 0, 0.04, -0.44, hd);
  const bk = add(new THREE.ConeGeometry(0.06, 0.16, 8), yel, 0, -0.1, -0.4, hd); bk.rotation.x = Math.PI + 0.35;
  const bkl = new THREE.Group(); bkl.position.set(0, -0.15, -0.36); hd.add(bkl); OW.jaw = bkl; const lj = add(new THREE.ConeGeometry(0.04, 0.08, 8), STD('#e69500'), 0, -0.03, -0.02, bkl); lj.rotation.x = Math.PI;
  // wings + clipboard + stamp
  OW.wings = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 0.36, 0.62, 0); owl.add(piv); const wm = add(new THREE.SphereGeometry(1, 16, 12), brown, s * 0.06, -0.22, -0.02, piv); wm.scale.set(0.12, 0.32, 0.24); return { piv, s }; });
  const cb = new THREE.Group(); cb.position.set(0.05, 0.55, -0.42); cb.rotation.x = -0.5; owl.add(cb); OW.clip = cb;
  const cbT = canvasTex(128, 160, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#90a4ae'; for (let i = 0; i < 6; i++) c.fillRect(14, 28 + i * 20, 100 - (i % 2) * 30, 6); c.strokeStyle = '#e53935'; c.lineWidth = 6; c.strokeRect(80, 120, 30, 28); });
  add(new THREE.BoxGeometry(0.3, 0.38, 0.02), STD('#8d5a2b'), 0, 0, 0, cb); const pp = add(new THREE.PlaneGeometry(0.26, 0.32), STD('#fff', { map: cbT }), 0, -0.01, -0.012, cb); pp.rotation.y = Math.PI;
  add(new THREE.BoxGeometry(0.12, 0.04, 0.04), STD('#b0bec5', { metalness: 0.7 }), 0, 0.18, -0.02, cb);
  const st = new THREE.Group(); owl.add(st); OW.stamp = st; add(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), STD('#e53935'), 0, 0.1, 0, st); add(new THREE.SphereGeometry(0.07, 12, 8), STD('#e53935'), 0, 0.2, 0, st); add(new THREE.BoxGeometry(0.16, 0.04, 0.12), STD('#212121'), 0, 0.0, 0, st); }
// snowball head that covers the owl in the wrong way
const snowHead = new THREE.Group(); OW.head.add(snowHead); snowHead.visible = false;
const SNOWM = STD('#fbfdff', { roughness: 0.7 });
{ const b = new THREE.Mesh(new THREE.SphereGeometry(0.47, 26, 18), SNOWM); b.castShadow = true; snowHead.add(b);
  const coal = STD('#1a1a1a', { roughness: 0.9 });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), coal); e.position.set(s * 0.15, 0.08, -0.43); snowHead.add(e);
    const g = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 6, 20), STD('#212121', { metalness: 0.5 })); g.position.set(s * 0.15, 0.08, -0.47); snowHead.add(g);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.05), coal); br.position.set(s * 0.15, 0.24, -0.42); br.rotation.z = s * 0.42; snowHead.add(br); }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 10), STD('#ff7a1a', { roughness: 0.6 })); nose.rotation.x = -Math.PI / 2; nose.position.set(0, -0.02, -0.62); snowHead.add(nose);
  snowHead.userData.mouth = [-2, -1, 0, 1, 2].map(k => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), coal); m.position.set(k * 0.07, -0.2 + 0.012 * k * k, -0.42); snowHead.add(m); return m; });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.18, 18), STD('#ffffff')); cap.position.set(0, 0.47, 0); snowHead.add(cap); const pk = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.22), STD('#1a237e')); pk.position.set(0, 0.4, -0.3); snowHead.add(pk); }
// snow piles on the car (wrong)
const piles = [[0, 1.15, -1.6, 0.85, 0.5, 1.0], [-0.4, 1.25, -0.2, 0.55, 0.42, 0.75], [0.35, 1.25, 0.5, 0.6, 0.5, 0.7], [-0.2, 1.05, 1.2, 0.8, 0.35, 0.8], [0.5, 1.2, -0.9, 0.5, 0.4, 0.5]].map(d => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), SNOWM); m.position.set(d[0], d[1], d[2]); m.scale.set(d[3], d[4], d[5]); m.userData.s = V3(d[3], d[4], d[5]); m.castShadow = m.receiveShadow = true; m.visible = false; HB.add(m); return m; });

// ---------------- snowman lollipop lady ----------------
const snow = new THREE.Group(); scene.add(snow);   // local front -z
const SN = {};
{ const add = (geo, mat, x, y, z, p = snow) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; };
  SN.mat = SNOWM.clone();
  SN.b0 = add(new THREE.SphereGeometry(1.0, 30, 22), SN.mat, 0, 0.95, 0);
  SN.b1 = add(new THREE.SphereGeometry(0.76, 28, 20), SN.mat, 0, 2.4, 0);
  SN.b2 = add(new THREE.SphereGeometry(0.56, 28, 20), SN.mat, 0, 3.5, 0);
  // hi-vis coat band on the middle ball
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.79, 0.86, 0.75, 28, 1, true), STD('#d4ff1e', { roughness: 0.5, side: THREE.DoubleSide, emissive: '#a6c900', emissiveIntensity: 0.15 })); vest.position.y = -0.05; SN.b1.add(vest);
  const strip = new THREE.Mesh(new THREE.CylinderGeometry(0.83, 0.84, 0.1, 28, 1, true), STD('#e0e0e0', { metalness: 0.6, roughness: 0.2, side: THREE.DoubleSide })); strip.position.y = -0.05; SN.b1.add(strip);
  const coal = STD('#1a1a1a', { roughness: 0.9 });
  for (const k of [0, 1]) add(new THREE.SphereGeometry(0.07, 10, 8), coal, 0, 0.25 - k * 0.45, -0.98, SN.b0);
  SN.eyes = [-1, 1].map(s => add(new THREE.SphereGeometry(0.065, 10, 8), coal, s * 0.2, 0.15, -0.5, SN.b2));
  SN.brows = [-1, 1].map(s => { const b = add(new THREE.BoxGeometry(0.16, 0.035, 0.03), coal, s * 0.2, 0.29, -0.49, SN.b2); return b; });
  const nose = add(new THREE.ConeGeometry(0.07, 0.42, 10), STD('#ff7a1a', { roughness: 0.6 }), 0, 0.02, -0.72, SN.b2); nose.rotation.x = -Math.PI / 2; SN.nose = nose;
  SN.mouth = [-2, -1, 0, 1, 2].map(k => add(new THREE.SphereGeometry(0.035, 8, 6), coal, k * 0.09, -0.2, -0.5, SN.b2));
  // lollipop lady cap
  const cap = add(new THREE.CylinderGeometry(0.42, 0.46, 0.26, 22), STD('#ffffff', { roughness: 0.6 }), 0, 0.5, 0, SN.b2); add(new THREE.CylinderGeometry(0.47, 0.47, 0.07, 22), STD('#1a237e'), 0, -0.1, 0, cap);
  const peak = add(new THREE.BoxGeometry(0.55, 0.04, 0.3), STD('#1a237e'), 0, -0.12, -0.4, cap); peak.rotation.x = 0.15;
  // stick arms: left waves, right holds the sign
  SN.arms = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 0.7, 0.1, 0); SN.b1.add(piv); const a = add(new THREE.CylinderGeometry(0.04, 0.05, 1.1, 6), STD('#5d4037'), s * 0.55, 0, 0, piv); a.rotation.z = Math.PI / 2;
    for (const k of [-1, 0, 1]) { const f = add(new THREE.CylinderGeometry(0.02, 0.025, 0.25, 5), STD('#5d4037'), s * 1.15, k * 0.08, 0, piv); f.rotation.z = Math.PI / 2 - s * k * 0.6; } return { piv, s }; });
  // puddle
  SN.puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: '#9fd4f5', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.75, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 })); SN.puddle.rotation.x = -Math.PI / 2; SN.puddle.userData.noAO = true; scene.add(SN.puddle); }
// lollipop sign (world object; STOP both sides, swapped to GO when turned)
const signTex = (txt, col) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(256, 256, 220, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 256, 248); c.font = '900 44px Inter'; c.fillText(txt === 'STOP' ? 'CHILDREN' : 'THANK YOU', 256, 360); });
const T_STOP = signTex('STOP', '#e53935'), T_GO = signTex('GO', '#2e7d32');
const sign = new THREE.Group(); scene.add(sign);
{ const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.3, 8), STD('#fafafa')); pole.position.y = 1.15; pole.castShadow = true; sign.add(pole);
  sign.userData.faces = [0, 1].map(k => { const f = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshStandardMaterial({ map: T_STOP, roughness: 0.5, emissive: '#ffffff', emissiveMap: T_STOP, emissiveIntensity: 0.2 })); f.position.set(0, 2.75, k ? -0.03 : 0.03); f.rotation.y = k ? Math.PI : 0; f.castShadow = true; sign.add(f); return f; });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 40), STD('#9e9e9e')); rim.position.y = 2.75; sign.add(rim); }
// penguin school kids
const pengs = Array.from({ length: 6 }, (_, i) => { const g = new THREE.Group(); scene.add(g);
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  add(new THREE.SphereGeometry(0.3, 18, 12), STD('#263238', { roughness: 0.6 }), 0, 0.42, 0).scale.set(1, 1.35, 0.95);
  add(new THREE.SphereGeometry(0.22, 16, 12), STD('#fafafa', { roughness: 0.7 }), 0, 0.38, -0.13).scale.set(1, 1.4, 0.6);
  add(new THREE.SphereGeometry(0.2, 16, 12), STD('#263238', { roughness: 0.6 }), 0, 0.92, 0);
  for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.045, 8, 6), STD('#fff'), s * 0.08, 0.97, -0.16); add(new THREE.SphereGeometry(0.025, 6, 4), STD('#111'), s * 0.08, 0.97, -0.2); add(new THREE.BoxGeometry(0.1, 0.04, 0.16), STD('#ff9800'), s * 0.1, 0.02, -0.06); }
  const bk = add(new THREE.ConeGeometry(0.05, 0.14, 8), STD('#ff9800'), 0, 0.9, -0.24); bk.rotation.x = -Math.PI / 2;
  add(new THREE.BoxGeometry(0.34, 0.36, 0.16), STD(['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00'][i], { roughness: 0.6 }), 0, 0.55, 0.27);
  return g; });

// sprites: drips, cold air, sparkle
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const flakeT = canvasTex(64, 64, (c, w, h) => { c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.translate(32, 32); for (let k = 0; k < 3; k++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.stroke(); } });
const SPR = Array.from({ length: 150 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#ffffff' })); s.visible = false; scene.add(s); return s; });
const FLK = Array.from({ length: 60 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flakeT, depthWrite: false, transparent: true, color: '#e3f6ff' })); s.visible = false; scene.add(s); return s; });
let si = 0, fi = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }
function flake(p, size, alpha) { const s = FLK[fi++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.opacity = alpha; }
const ND = 40; const drips = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshStandardMaterial({ color: '#b3e5fc', roughness: 0.05, transparent: true, opacity: 0.9 }), ND); drips.frustumCulled = false; scene.add(drips);

// ---------------- choreography ----------------
const CAR_Z = 6.4;
const SNOW0 = V3(-1.2, 0, 0.4);
const meltW = mono([[0, 0.35], [tMelt, 0.55], [tWhat, 0.7], [99, 0.75]]);
const meltR = mono([[0, 0.7], [tFreezes, 0.7], [tFreezes + 0.9, 0], [99, 0]]);
// right: snowman walks across with the penguins, then turns the sign
const snowXR = mono([[0, SNOW0.x], [tWalks - 0.2, SNOW0.x], [tAcross + 0.4, 2.7], [99, 2.7]]);
const pengX = (i, t) => { const t0 = tWalks - 0.3 + i * 0.22; const u = clamp((t - t0) / 3.3); return lerp(-5.2, 5.3, u); };
// wrong: balls fly into the car
const tLift = tJumps - 0.05, tTop = tJumps + 0.35, tFall = tColl - 0.05;
const BALL_T = [tRight2 - 0.15, tRight2 + 0.15, tCarW + 0.05];   // landing times (bottom, middle, head)

// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const FolC = (o, l, fov = 40) => () => { const z = hero.position.z; return [V3(o[0], o[1], z + o[2]), V3(l[0], l[1], z + l[2]), fov]; };
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const WIDE = Ac([2.2, 4.0, -7.4], [-0.5, 2.1, 2.6], 40);
const SNOWCU = Ac([2.6, 3.5, -2.2], [-1.0, 3.25, 0.5], 36);
const DUO = Ac([1.0, 2.25, 1.4], [0.0, 1.8, 6.4], 38);
const camKeys = [
  [0.0, WIDE],
  [tMelt - 0.3, Ac([2.1, 3.9, -6.9], [-0.5, 2.1, 2.6], 40)],
  ...cut(tMelt - 0.25, SNOWCU),
  [tWhat - 0.3, Ac([2.4, 3.5, -2.0], [-1.0, 3.2, 0.5], 36)],
  ...cut(tWhat - 0.25, Ac([2.4, 4.6, -8.2], [-0.4, 1.7, 2.8], 40)),
  [S('wrong1').start - 0.1, Ac([2.3, 4.5, -7.8], [-0.4, 1.7, 2.8], 40)],
  // wrong
  ...cut(S('wrong1').start + 0.85, DUO),
  [tHonk - 0.3, Ac([0.95, 2.25, 1.6], [0.0, 1.8, 6.4], 38)],
  ...cut(tHonk + 0.25, Ac([2.6, 4.6, -8.2], [-0.5, 2.5, 2.6], 40)),
  [tCarW + 0.3, Ac([2.4, 4.3, -7.6], [-0.3, 2.1, 3.6], 40)],
  ...cut(S('wrong3').start - 0.1, Ac([1.7, 3.3, 1.6], [0.3, 2.0, 6.4], 36)),
  [tRew0, Ac([1.8, 3.4, 1.3], [0.25, 2.0, 6.4], 36)],
  // right
  ...cut(tRew1, Ac([2.4, 4.6, -8.2], [-0.4, 1.7, 2.8], 40)),
  [S('right1').end + 0.1, Ac([2.3, 4.5, -7.8], [-0.4, 1.7, 2.8], 40)],
  ...cut(tAir - 0.1, DUO),
  [tAir + 0.9, Ac([0.95, 2.25, 1.6], [0.0, 1.8, 6.4], 38)],
  ...cut(tAir + 0.95, Ac([-1.9, 4.4, 13.0], [-1.0, 1.9, 0.4], 40)),
  [S('right2').end + 0.2, Ac([-1.9, 4.3, 12.4], [-1.0, 1.9, 0.4], 40)],
  ...cut(tFreezes - 0.15, SNOWCU),
  [tWalks - 0.25, Ac([2.4, 3.5, -2.0], [-1.0, 3.2, 0.5], 36)],
  ...cut(tWalks - 0.2, Ac([11.0, 2.6, -3.4], [-0.5, 1.5, -0.4], 38)),
  [S('right3').end + 0.2, Ac([12.6, 3.1, -3.8], [0.5, 1.7, -0.4], 38)],
  ...cut(tTurns - 0.15, Ac([-2.6, 4.3, 12.5], [1.9, 2.1, 0.6], 38)),
  [tGo + 0.6, Ac([-2.6, 4.4, 12.0], [1.7, 2.0, 0.4], 38)],
  ...cut(S('right7').start - 0.1, FolC([1.0, 2.25, -5.0], [0.0, 1.8, 0], 38)),
  [S('outro').start, FolC([1.3, 2.6, -6.5], [0.0, 1.9, 0], 40)],
  [TOTAL, FolC([1.8, 3.2, -8.5], [0.0, 2.0, 0], 40)],
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
  si = 0; fi = 0; SPR.forEach(s => s.visible = false); FLK.forEach(s => s.visible = false);
  // car
  let cz = CAR_Z; if (right && t > tGo) { const dt = t - tGo; cz = CAR_Z - (0.55 * dt * dt + 0.3 * dt); }
  placeCar(hero, { x: 0, z: cz, h: 0 }); hero.position.y = 0;
  const honkJ = !right ? win(t, tHonk - 0.05, tHonk + 0.35, 0.05) : 0; HB.position.y += 0.03 * honkJ * Math.sin(t * 60);
  hero.userData.hl.emissiveIntensity = 0.5;
  // ---- hamster
  const scared = !right ? Math.max(0.6 * win(t, tSnowman - 0.2, S('wrong1').end, 0.2), win(t, tJumps, S('wrong4').end + 1, 0.15)) : Math.max(0.6 * win(t, 0, tAir, 0.2), 0.3 * win(t, tAir, tFreezes, 0.3));
  const happyH = right ? win(t, tFreezes + 0.3, TOTAL, 0.4) : 0;
  HM.head.position.set(0.012 * scared * Math.sin(t * 45), 0.7 - (!right ? 0.2 * win(t, tRight2, TOTAL, 0.2) : 0), -0.02);
  HM.head.rotation.set(-0.05 + 0.1 * happyH * Math.sin(t * 6), (right ? -0.35 * win(t, tTurns - 0.3, tGo + 0.6, 0.3) : 0) + 0.15 * Math.sin(t * 1.3) * (1 - scared), 0);
  HM.eyes.forEach(E => { const s = 1 + 0.55 * scared; E.w.scale.setScalar(s); E.p.scale.setScalar(1 - 0.35 * scared); E.p.position.z = -0.235 - 0.055 * s; E.hl.position.z = -0.235 - 0.11 * s; });
  HM.sweat.forEach((d, k) => { const ph = ((t * 1.4 + k * 0.5) % 1); d.visible = scared > 0.3; d.position.y = 0.15 - 0.25 * ph; d.scale.setScalar(1 - ph * 0.5); });
  // paws: on the wheel; press horn / AC button; cheer
  const press = !right ? win(t, tHonk - 0.2, tHonk + 0.3, 0.1) : win(t, tAir - 0.15, tMax + 0.3, 0.1);
  HM.paws.forEach((p, k) => { const cheer = happyH * (right && t > S('right7').start - 0.3 ? 1 : 0);
    p.position.set((k ? 1 : -1) * 0.13 + (k ? press * 0.25 : 0), 0.36 + cheer * 0.55 + 0.02 * scared * Math.sin(t * 40 + k), -0.5 + (k ? -0.12 * press : 0) + cheer * 0.35); });
  // ---- owl
  const tk = (!right && t > BALL_T[2]) ? 0 : talking(t);
  const angry = !right ? Math.max(0.5, win(t, tHonk - 0.1, TOTAL, 0.2)) : 0.5 - 0.3 * win(t, tBarely, TOTAL, 0.3);
  OW.jaw.rotation.x = -0.5 * tk; OW.head.rotation.set(0.05 * Math.sin(t * 0.9), (!right ? 0 : -0.3 * win(t, tTurns - 0.3, tGo + 0.6, 0.3)) + 0.08 * Math.sin(t * 0.7), 0);
  OW.eyes.forEach(E => { E.br.rotation.z = E.s * (0.2 + 0.4 * angry) * (right && t > tBarely ? (E.s > 0 ? -0.6 : 1) : 1); E.br.position.y = 0.16 + (right && t > tBarely && E.s > 0 ? 0.06 : 0); });
  // stamp: lifts and slams on FAILED / PASSED
  const stT = !right ? tFailed : tPassed; const su = t - stT;
  const sp = su < -0.35 ? 0 : su < 0 ? ease((su + 0.35) / 0.35) : su < 0.12 ? 1 - su / 0.12 : su < 0.9 ? 0 : 0;
  OW.stamp.visible = su > -0.6 && su < 1.2 && !(t > BALL_T[2] && !right);
  OW.stamp.position.set(-0.05, 0.62 + 0.35 * sp, -0.45); OW.stamp.rotation.x = -0.5;
  OW.wings.forEach(Wg => { Wg.piv.rotation.z = Wg.s * (0.1 + (Wg.s < 0 && OW.stamp.visible ? 0.9 + 0.3 * sp : 0)) + (Wg.s > 0 && right && t > tVents - 0.5 && t < tFreezes ? -0.9 : 0); });
  // ---- snowman
  const melt = right ? meltR(t) : meltW(t);
  const frost = right ? win(t, tFreezes, tFreezes + 2.0, 0.3) : 0;
  SN.mat.color.setRGB(lerp(0.98, 0.85, frost), lerp(0.99, 0.93, frost), 1.0); SN.mat.roughness = 0.7 - 0.5 * frost; SN.mat.emissive = SN.mat.emissive || new THREE.Color(); SN.mat.emissive.setRGB(0.2 * frost, 0.35 * frost, 0.5 * frost);
  let sx = SNOW0.x, sy = 0, sz = SNOW0.z, ry = -0.8;
  if (right) { sx = snowXR(t); const walk = win(t, tWalks - 0.2, tAcross + 0.4, 0.2); sy = walk * 0.08 * Math.abs(Math.sin(t * 7)); ry = lerp(-0.8, -Math.PI / 2, win(t, tWalks - 0.4, tAcross + 0.5, 0.3)) + walk * 0.1 * Math.sin(t * 7) + 0.9 * win(t, tTurns - 0.2, TOTAL, 0.4); }
  snow.position.set(sx, sy, sz); snow.rotation.set(0, ry, 0);
  const sag = melt * 0.18; [SN.b0, SN.b1, SN.b2].forEach(b => { b.position.set(0, 0, 0); b.rotation.set(0, 0, 0); }); SN.b0.scale.set(1 + melt * 0.12, 1 - sag * 0.6, 1 + melt * 0.12); SN.b0.position.y = 0.95 * (1 - sag * 0.6);
  SN.b1.scale.setScalar(1 - melt * 0.08); SN.b1.position.y = 2.4 - sag * 0.9; SN.b2.scale.setScalar(1 - melt * 0.1); SN.b2.position.y = 3.5 - sag * 1.3;
  SN.b2.rotation.set(0.25 * melt, 0, 0.12 * melt);
  SN.eyes.forEach(e => e.scale.set(1, 1 - 0.5 * melt, 1)); SN.brows.forEach((b, k) => { b.rotation.z = (k ? 1 : -1) * (-0.35 * melt + 0.25 * frost); });
  SN.mouth.forEach((m, k) => { const kk = k - 2; m.position.y = -0.2 + (0.025 * (1 - 2 * melt) + 0.02 * frost) * kk * kk; });
  SN.nose.rotation.x = -Math.PI / 2 - 0.5 * melt;
  // wave arm (left) + sign arm (right)
  SN.arms[0].piv.rotation.set(0, 0, 0.5 + (right ? 0.5 * win(t, tFreezes + 0.3, TOTAL, 0.3) * Math.sin(t * 8) : -0.6 * melt));
  SN.arms[1].piv.rotation.set(0, 0, -0.35);
  SN.puddle.position.set(sx, 0.08, sz); SN.puddle.scale.setScalar(0.6 + 1.6 * melt);
  // wrong: jump + collapse into the car
  let balls = null;
  if (!right && t > tLift) {
    const jy = t < tFall ? 1.6 * Math.sin(Math.PI * clamp((t - tLift) / (tFall - tLift + 0.2))) : 0;
    snow.position.y += jy;
    if (t > tFall) {
      hero.updateMatrixWorld(true);
      const tgts = [HB.localToWorld(V3(0, 1.4, -1.6)), HB.localToWorld(V3(-0.4, 1.6, -0.1)), OW.head.getWorldPosition(V3())];
      const srcs = [SN.b0, SN.b1, SN.b2]; balls = [];
      srcs.forEach((b, k) => { const t0 = tFall + k * 0.12, t1 = BALL_T[k]; const u = clamp((t - t0) / (t1 - t0));
        const p0 = snow.localToWorld(V3(0, [0.95, 2.4, 3.5][k] + 0.2, 0)); const p = p0.clone().lerp(tgts[k], easeIn(u)); p.y += 2.2 * Math.sin(Math.PI * u);
        b.visible = u < 1; if (b.visible) { snow.worldToLocal(p); b.position.copy(p); b.rotation.set(u * 4, 0, u * 3); } }); }
  } else { SN.b0.visible = SN.b1.visible = SN.b2.visible = true; }
  if (right || t <= tFall) SN.b0.visible = SN.b1.visible = SN.b2.visible = true;
  const armsVis = right || t < tFall + 0.1; SN.arms.forEach(A => A.piv.visible = armsVis);
  piles.forEach((m, k) => { const tl = BALL_T[Math.min(2, [0, 1, 1, 0, 2][k])]; const on = !right && t > tl; m.visible = on; if (on) { const s = back(clamp((t - tl) / 0.3)); m.scale.copy(m.userData.s).multiplyScalar(Math.max(0.01, s)); } });
  snowHead.visible = !right && t > BALL_T[2];
  if (snowHead.visible) { const s = back(clamp((t - BALL_T[2]) / 0.3)); snowHead.scale.setScalar(Math.max(0.01, s)); const mt = talking(t); snowHead.userData.mouth.forEach((m, k) => { const kk = k - 2; m.position.y = -0.2 - 0.012 * kk * kk - 0.05 * mt * (2 - Math.abs(kk)) / 2; }); }
  // sign
  if (!right && t > tLift) { const u = clamp((t - tLift) / (BALL_T[1] + 0.2 - tLift)); hero.updateMatrixWorld(true); const p0 = snow.localToWorld(V3(1.25, 0.6, 0)), p1 = HB.localToWorld(V3(-0.65, 0.85, -1.75));
    const p = p0.lerp(p1, ease(u)); p.y += 4 * Math.sin(Math.PI * u); sign.position.copy(p); sign.rotation.set(-0.12 * u + u * (1 - u) * 8, 0.3, 0.15 * u); }
  else { snow.updateMatrixWorld(true); const hp = snow.localToWorld(V3(1.25, 2.4 - 1.4 - sag * 0.9, 0)); sign.position.copy(hp).add(V3(0, -0.2, 0)); sign.position.y = Math.max(0, hp.y - 1.05); sign.rotation.set(0, 0.45, 0); }
  // turn the sign: STOP -> GO
  const turn = right ? ease(clamp((t - tSign + 0.1) / 0.6)) : 0; sign.rotation.y += turn * Math.PI;
  const tex = turn > 0.5 ? T_GO : T_STOP; sign.userData.faces.forEach(f => { if (f.material.map !== tex) { f.material.map = tex; f.material.emissiveMap = tex; f.material.needsUpdate = true; } });
  // penguins
  pengs.forEach((g, i) => { const row = i >= 3 ? 0.75 : 0; let x = -5.0 - row, z = -1.75 + (i % 3) * 0.5, wob = 0; if (right) { x = pengX(i, t) - row; wob = (x > -5.1 - row && x < 5.2) ? 1 : 0; }
    g.position.set(x, 0.16 * (Math.abs(x) > 3.5 ? 1 : 0) + wob * 0.05 * Math.abs(Math.sin(t * 9 + i)), z); g.rotation.set(0, -Math.PI / 2 + wob * 0.0, wob * 0.18 * Math.sin(t * 9 + i)); g.scale.setScalar(0.95 + 0.1 * hash(i)); });
  // drips while melting
  for (let i = 0; i < ND; i++) { let ok = false; if (melt > 0.15 && !(!right && t > tFall)) { const ph = ((t * 0.9 + hash(i)) % 1); const a = hash(i + 3) * 6.283, ball = i % 3; const r = [1.0, 0.76, 0.56][ball] * 0.9, y0 = [0.95, 2.4, 3.5][ball] - sag;
      const p = snow.localToWorld(V3(Math.cos(a) * r, y0 - 0.3, Math.sin(a) * r)); p.y -= 4.0 * ph * ph * 2; if (p.y > 0.1) { ok = true; _m.compose(p, _q.identity(), _s.set(1, 1.6, 1).multiplyScalar(melt)); } }
    if (!ok) _m.makeScale(0, 0, 0); drips.setMatrixAt(i, _m); }
  drips.instanceMatrix.needsUpdate = true;
  // cold air from the car (right2) + frost sparkle
  if (right) { const air = win(t, tMax - 0.2, tFreezes + 0.6, 0.3); hero.updateMatrixWorld(true);
    if (air > 0) { const src = HB.localToWorld(V3(0, 1.3, -2.0)); const dst = snow.localToWorld(V3(0, 2.2, 0)); for (let k = 0; k < 40; k++) { const ph = ((t * 0.9 + hash(k)) % 1); const p = src.clone().lerp(dst, ph).add(V3((hash(k + 1) - 0.5) * 1.2 * ph, (hash(k + 2) - 0.5) * 1.0 * ph, (hash(k + 3) - 0.5) * 0.8 * ph)); puff(p, 0.5 + 1.0 * ph, 0.8 * air * Math.sin(Math.PI * ph), '#8fd6ff'); }
      for (let k = 0; k < 30; k++) { const ph = ((t * 1.2 + hash(k + 7)) % 1); const p = src.clone().lerp(dst, ph).add(V3((hash(k + 4) - 0.5) * 1.5 * ph, (hash(k + 5) - 0.5) * 1.3 * ph, 0)); flake(p, 0.3, air * Math.sin(Math.PI * ph)); } }
    if (frost > 0) for (let k = 0; k < 24; k++) { const ph = ((t * 0.8 + hash(k + 20)) % 1); const a = hash(k + 21) * 6.283, b_ = hash(k + 22); const p = snow.localToWorld(V3(Math.cos(a) * 0.9, 0.6 + b_ * 3.2, Math.sin(a) * 0.9)); flake(p, 0.12 + 0.12 * Math.sin(Math.PI * ph), frost * Math.sin(Math.PI * ph)); } }
  // impact puffs (wrong)
  if (!right) BALL_T.forEach(tl => { const dt = t - tl; if (dt > 0 && dt < 0.6) { const c = HB.localToWorld(V3(0, 1.5, -0.4)); for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; puff(c.clone().add(V3(Math.cos(a) * (1 + dt * 3), dt * 1.2, Math.sin(a) * (1 + dt * 3))), 0.8 + dt * 1.5, 0.7 * (1 - dt / 0.6), '#ffffff'); } } });
  // camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.2; camera.updateProjectionMatrix();
  const shk = !right ? Math.max(win(t, tHonk - 0.05, tHonk + 0.3, 0.05) * 0.4, win(t, BALL_T[0] - 0.03, BALL_T[2] + 0.3, 0.05) * 0.6) : 0;
  applyCam(c, t, shk > 0.02 ? 0.05 * shk : 0);
  camera.updateMatrixWorld(true);
  screen = { snowHead: project(SN.b2.getWorldPosition(V3()).add(V3(0, 0.6, 0))), owl: project(OW.head.getWorldPosition(V3()).add(V3(0, 0.5, 0))), ham: project(HM.head.getWorldPosition(V3()).add(V3(0, 0.4, 0))), car: project(HB.localToWorld(V3(0, 1.0, -2.2))) };
}

// ---------------- HUD (slim: only the gag words) ----------------
const cxy = (p, dy = 0) => [clamp(p.x, 200, W - 200), clamp(p.y + dy, 520, 1060)];
function bubble(text, p, t, a, b, size = 56, col = '#ffffff', fg = '#111', dy = -110) {
  if (t < a || t > b || !p || !p.ok) return; const [x, y] = cxy(p, dy); const f = win(t, a, b, 0.15), k = back((t - a) / 0.3);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.0, h = size * 1.6;
  ctx.translate(clamp(x, w / 2 + 30, W - w / 2 - 30) - x, 0);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2.2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, h / 2 - 4); ctx.lineTo(0, h / 2 + 34); ctx.lineTo(22, h / 2 - 4); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore(); }
function hud(t) {
  const right = isRight(t);
  if (!right) {
    bubble('EEK!', screen.ham, t, tSnowman + 0.1, tMelt + 0.3, 56, '#fff', '#e65100', -60);
    floatText('HONK!', 540, 820, t, tHonk, tHonk + 0.8, 130, YEL, -0.1);
    floatText('SPLAT!', 540, 860, t, BALL_T[1], BALL_T[1] + 0.9, 130, '#fff', 0.06);
  } else {
    floatText('BRRR!', 540, 820, t, tMax, tMax + 1.0, 120, '#bfe9ff', -0.06);
    bubble('YAY!', screen.ham, t, S('right7').start - 0.2, S('outro').start, 56, '#fff', '#2e7d32', -60);
  }
}
window.dbg = {};
start(update, hud);
