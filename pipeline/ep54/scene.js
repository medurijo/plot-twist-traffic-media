// Episode 49: Toll booth before the bridge – it's a troll booth
// hook (old style): bridge ahead, toll booth, coins ready -> the barrier is a club, the hand holding it is green -> a troll rises from under the bridge
// wrong: throw your coins at him -> trolls don't want coins, they want MORE coins (coin eyes) -> shakes your car like a piggy bank,
//        every coin, every crumb -> keeps the car as his piggy bank (coin slot on the roof)
// right: read the sign: toll = one riddle -> "what has four wheels and flies?" -> he thinks, steam from his ears ->
//        "a bin lorry!" -> laughs so hard he drops the club -> free passage for you and the bin lorry behind you
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1,
  scene, camera, ctx, canvasTex, L, STD, asphaltMat, markMat, plane, instanced, makeLandscape, makeWheel,
  makeCar, placeCar, applyCam, blink, project, YEL, GREEN, RED, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- timing ----------------
const tBridge = WT('hook1', 'Bridge'), tYou1 = WT('hook1', 'You'), tToll1 = WT('hook1', 'toll'), tCoins1 = WT('hook1', 'Coins');
const tBarrier = WT('hook2', 'barrier'), tClub = WT('hook2', 'club'), tAndH = WT('hook2', 'And'), tHand = WT('hook2', 'hand'), tGreen = WT('hook2', 'green'), tIts = WT('hook2', "it's"), tTroll = WT('hook2', 'troll'), tWhat = WT('hook2', 'What');
const tMost = WT('wrong1', 'Most'), tThrow = WT('wrong1', 'throw'), tCoinsW = WT('wrong1', 'coins'), tHim = WT('wrong1', 'him');
const tBig = WT('wrong2', 'Big'), tTrolls = WT('wrong2', 'Trolls'), tDont = WT('wrong2', 'don'), tThey = WT('wrong2', 'They'), tMore = WT('wrong2', 'more'), tCoins2 = WT('wrong2', 'coins', 1);
const tHe3 = WT('wrong3', 'He'), tShakes = WT('wrong3', 'shakes'), tPiggy = WT('wrong3', 'piggy'), tEvery = WT('wrong3', 'Every'), tCrumb = WT('wrong3', 'crumb'), tAnd3 = WT('wrong3', 'And'), tKeeps = WT('wrong3', 'keeps'), tPiggy2 = WT('wrong3', 'piggy', 1);
const tRead = WT('right2', 'Read'), tTollR = WT('right2', 'Toll'), tRiddle = WT('right2', 'riddle'), tSo2 = WT('right2', 'So'), tAsk = WT('right2', 'ask');
const tWhatR = WT('right3', 'What'), tWheels = WT('right3', 'wheels'), tFlies = WT('right3', 'flies');
const tThinks = WT('right4', 'thinks'), tThinks2 = WT('right4', 'thinks', 1), tSteam = WT('right4', 'Steam'), tEars = WT('right4', 'ears');
const tAnswer = WT('right5', 'answer'), tBin = WT('right5', 'bin'), tLorry = WT('right5', 'lorry'), tLaughs = WT('right5', 'laughs'), tDrops = WT('right5', 'drops'), tClub5 = WT('right5', 'club');
const tFree = WT('right6', 'Free'), tFor6 = WT('right6', 'For'), tBin6 = WT('right6', 'bin'), tBehind = WT('right6', 'behind');
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
function monoV(keys) { const f = [0, 1, 2].map(i => mono(keys.map(k => [k[0], k[1][i]]))); return t => V3(f[0](t), f[1](t), f[2](t)); }

// ---------------- world: toll booth before a stone bridge over a river ----------------
const RX0 = -11.2, RX1 = -6.6, WATER_Y = 0.04;
makeLandscape({ avoid: (x, z) => (Math.abs(z) < 16 && x > -80 && x < 60) || (x > RX0 - 4 && x < RX1 + 4), fieldAvoid: (x, z, w, d) => (x + w / 2 > RX0 - 8 && x - w / 2 < RX1 + 8) || (Math.abs(z) - d / 2 < 20 && x + w / 2 > -90 && x - w / 2 < 70), near: [0, 0, 240, 200], trees: 1300, seed: 4901 });
{ const water = new THREE.Mesh(new THREE.PlaneGeometry(RX1 - RX0, 1400), STD('#3f8fc4', { roughness: 0.12, metalness: 0.25, emissive: '#0d3a5a', emissiveIntensity: 0.25 })); water.rotation.x = -Math.PI / 2; water.position.set((RX0 + RX1) / 2, WATER_Y, 0); water.receiveShadow = true; scene.add(water);
  const R = rng(11); const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.5, 0), STD('#9e9a90', { roughness: 0.95, flatShading: true }), 400); let k = 0; const mm = new THREE.Matrix4();
  for (let i = 0; i < 400; i++) { const side = i % 2 ? RX0 : RX1, z = (R() - 0.5) * 300; if (Math.abs(z) < 5.5) { mm.makeScale(0, 0, 0); rocks.setMatrixAt(k++, mm); continue; } mm.compose(V3(side + (R() - 0.5) * 0.6, 0.05, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 3, R() * 3, 0)), V3(0.6 + R() * 0.8, 0.4 + R() * 0.5, 0.6 + R() * 0.8)); rocks.setMatrixAt(k++, mm); }
  rocks.castShadow = rocks.receiveShadow = true; scene.add(rocks); }
// roads
plane(RX1, 120, -4.2, 4.2, asphaltMat, 0.05, 30); plane(-140, RX0, -4.2, 4.2, asphaltMat, 0.05, 30);
{ const g = new THREE.PlaneGeometry(3, 0.16); g.rotateX(-Math.PI / 2); const dl = []; for (let x = -130; x < 110; x += 7) if (x < RX0 - 1 || x > RX1 + 1) dl.push([x, 0.07, 0]); instanced(g, markMat, dl, false);
  const sl = new THREE.PlaneGeometry(0.35, 4.0); sl.rotateX(-Math.PI / 2); instanced(sl, markMat, [[-3.5, 0.07, -2.1]], false); }
// stone bridge deck + parapets
const stoneT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#a19a8c'; c.fillRect(0, 0, w, h); const R = rng(3); for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 * 24; x < w + 48; x += 48) { c.fillStyle = `hsl(40,${6 + R() * 8}%,${52 + R() * 14}%)`; c.fillRect(x - 46, y + 2, 44, 28); } }, true);
stoneT.repeat.set(3, 1);
const STONE = STD('#ffffff', { map: stoneT, roughness: 0.9 });
{ const deck = new THREE.Mesh(new THREE.BoxGeometry(RX1 - RX0 + 1.2, 1.2, 9.6), STONE); deck.position.set((RX0 + RX1) / 2, -0.55, 0); deck.castShadow = deck.receiveShadow = true; scene.add(deck);
  plane(RX0 - 0.6, RX1 + 0.6, -4.2, 4.2, asphaltMat, 0.06, 6);
  for (const z of [-4.6, 4.6]) { const p = new THREE.Mesh(new THREE.BoxGeometry(RX1 - RX0 + 1.6, 1.0, 0.5), STONE); p.position.set((RX0 + RX1) / 2, 0.5, z); p.castShadow = p.receiveShadow = true; scene.add(p);
    for (const x of [RX0 - 0.6, RX1 + 0.6]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.8), STONE); c.position.set(x, 0.75, z); c.castShadow = true; scene.add(c); } }
}
// toll booth on the island
const BOOTH = V3(-3.4, 0, 2.9);
const boothSign = {};
{ const isl = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.25, 2.6), STD('#cfc9bd', { roughness: 0.9 })); isl.position.set(BOOTH.x, 0.12, BOOTH.z); isl.receiveShadow = isl.castShadow = true; scene.add(isl);
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 1.8), STD('#f5f0e1', { roughness: 0.7 })); body.position.set(BOOTH.x, 1.5, BOOTH.z); body.castShadow = body.receiveShadow = true; scene.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.3, 2.3), STD('#5d4037')); roof.position.set(BOOTH.x, 2.9, BOOTH.z); roof.castShadow = true; scene.add(roof);
  const win_ = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), STD('#9ec9e8', { roughness: 0.1, metalness: 0.4 })); win_.position.set(BOOTH.x, 1.75, BOOTH.z - 0.91); win_.rotation.y = Math.PI; scene.add(win_);
  // roof sign "TOLL BOOTH" -> an R squeezes in: "TROLL BOOTH"
  const mkT = (r) => canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#1b5e20'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 12; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#fff'; c.font = '900 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (!r) c.fillText('TOLL BOOTH', w / 2, h / 2 + 8); else { c.fillText('T  OLL BOOTH', w / 2, h / 2 + 8); c.fillStyle = '#ffd54f'; c.font = '900 170px Inter'; c.save(); c.translate(w / 2 - 330, h / 2 + 4); c.rotate(-0.18); c.fillText('R', 0, 0); c.restore(); } });
  boothSign.a = mkT(false); boothSign.b = mkT(true);
  const sb = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.85, 3.2), STD('#1b5e20')); sb.position.set(BOOTH.x + 0.4, 3.55, BOOTH.z); sb.castShadow = true; scene.add(sb);
  boothSign.m = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.78), STD('#fff', { map: boothSign.a, roughness: 0.5 })); boothSign.m.position.set(BOOTH.x + 0.48, 3.55, BOOTH.z); boothSign.m.rotation.y = Math.PI / 2; scene.add(boothSign.m);
  // price board facing the arriving car: TOLL: 1 RIDDLE
  const pT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#fff8e1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2e7d32'; c.lineWidth = 22; c.strokeRect(11, 11, w - 22, h - 22); c.fillStyle = '#2e7d32'; c.textAlign = 'center';
    c.font = '900 92px Inter'; c.fillText('TOLL:', w / 2, 120); c.fillStyle = '#d84315'; c.font = '900 120px Inter'; c.fillText('1 RIDDLE', w / 2, 260); c.fillStyle = '#333'; c.font = '900 52px Inter'; c.fillText('NO COINS', w / 2, 360); c.fillText('PLEASE', w / 2, 425); c.strokeStyle = '#d84315'; c.lineWidth = 10; c.beginPath(); c.moveTo(120, 340); c.lineTo(392, 340); c.stroke(); });
  const pb = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), STD('#fff', { map: pT, roughness: 0.5 })); pb.position.set(BOOTH.x + 1.21, 1.55, BOOTH.z); pb.rotation.y = Math.PI / 2; scene.add(pb); }

// ---------------- troll ----------------
const TG = STD('#7cb342', { roughness: 0.7 }), TGD = STD('#5f8f2f', { roughness: 0.75 }), HAIR = STD('#e65100', { roughness: 0.9 });
const troll = new THREE.Group(); troll.scale.setScalar(1.25); scene.add(troll);
const TR = {};
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
{ mk(new THREE.SphereGeometry(1, 32, 24), TG, 0, 1.6, 0, troll).scale.set(1.6, 2.0, 1.85);
  const tun = mk(new THREE.SphereGeometry(1.03, 32, 16, 0, Math.PI * 2, 1.7, 1.2), STD('#795548', { roughness: 0.9 }), 0, 1.6, 0, troll); tun.scale.set(1.6, 2.0, 1.85);
  mk(new THREE.TorusGeometry(1.5, 0.1, 8, 40), STD('#4e342e'), 0, 0.95, 0, troll).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.55, 0.6, 3.0, 12), TG, 0, -0.8, s * 0.8, troll);
  const head = new THREE.Group(); head.position.set(0.35, 4.35, 0); troll.add(head); TR.head = head;
  mk(new THREE.SphereGeometry(1.2, 32, 24), TG, 0, 0, 0, head).scale.set(1.0, 0.92, 1.08);
  TR.nose = mk(new THREE.SphereGeometry(0.42, 20, 16), TGD, 1.22, 0.0, 0, head); TR.nose.scale.set(1.15, 0.95, 0.95);
  for (const [x, y, z, r] of [[1.0, 0.55, 0.62, 0.07], [0.7, -0.3, -0.85, 0.09], [1.5, 0.12, 0.2, 0.05]]) mk(new THREE.SphereGeometry(r, 8, 6), TGD, x, y, z, head);
  TR.eyes = [-1, 1].map(s => { const w = mk(new THREE.SphereGeometry(0.22, 16, 12), STD('#fffde7', { roughness: 0.3 }), 0.98, 0.42, s * 0.4, head);
    const p = mk(new THREE.SphereGeometry(0.11, 12, 8), STD('#1a1a1a', { roughness: 0.2 }), 1.17, 0.42, s * 0.4, head);
    const hl = mk(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), 1.25, 0.48, s * 0.4 + 0.04, head);
    const coin = mk(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24), STD('#ffc107', { metalness: 0.85, roughness: 0.25, emissive: '#7a5200', emissiveIntensity: 0.35 }), 1.18, 0.42, s * 0.4, head); coin.rotation.z = Math.PI / 2;
    const lid = mk(new THREE.SphereGeometry(0.235, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), TGD, 0.98, 0.42, s * 0.4, head);
    const brow = mk(new THREE.BoxGeometry(0.22, 0.14, 0.55), STD('#3e2723'), 1.02, 0.72, s * 0.42, head);
    return { w, p, hl, coin, lid, brow, s, c0: w.position.clone(), p0: p.position.clone(), h0: hl.position.clone() }; });
  // ears
  for (const s of [-1, 1]) { const e = mk(new THREE.ConeGeometry(0.3, 1.1, 12), TG, 0.0, 0.25, s * 1.25, head); e.rotation.x = s * (Math.PI / 2 + 0.35); e.scale.set(1, 1, 0.45); }
  TR.ears = [-1, 1].map(s => V3(0.0, 0.3, s * 1.35));
  // hair tufts
  for (let k = 0; k < 7; k++) { const c = mk(new THREE.ConeGeometry(0.16, 0.7, 8), HAIR, -0.15 + (k % 3) * 0.2, 1.1, (k - 3) * 0.17, head); c.rotation.set((k - 3) * 0.18, 0, 0.25 - (k % 3) * 0.2); }
  // mouth (dark ellipsoid) + tusks
  TR.mouth = mk(new THREE.SphereGeometry(0.5, 20, 12), STD('#3b1d1d', { roughness: 0.8 }), 0.98, -0.5, 0, head); TR.mouth.scale.set(0.35, 0.18, 1.2);
  TR.tusks = [-1, 1].map(s => { const k = mk(new THREE.ConeGeometry(0.08, 0.3, 8), STD('#fffbe6', { roughness: 0.4 }), 1.13, -0.5, s * 0.33, head); return k; });
  TR.tongue = mk(new THREE.SphereGeometry(0.25, 12, 8), STD('#e57373'), 1.0, -0.62, 0, head); TR.tongue.scale.set(0.6, 0.35, 1.2); }
// arms: bezier tubes rebuilt every frame
const AN = 40, AM = 14;
function makeTube(mat) { const g = new THREE.BufferGeometry(); const pos = new Float32Array((AN + 1) * (AM + 1) * 3), idx = [];
  for (let i = 0; i <= AN; i++) for (let j = 0; j <= AM; j++) { const k = i * (AM + 1) + j; if (i < AN && j < AM) { const a = k, b = k + AM + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); } }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m; }
const bez = (P, u) => { const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3; return V3(0, 0, 0).addScaledVector(P[0], a).addScaledVector(P[1], b).addScaledVector(P[2], c).addScaledVector(P[3], d); };
const bezT = (P, u) => { const a = -3 * (1 - u) ** 2, b = 3 * (1 - u) ** 2 - 6 * u * (1 - u), c = 6 * u * (1 - u) - 3 * u * u, d = 3 * u * u; return V3(0, 0, 0).addScaledVector(P[0], a).addScaledVector(P[1], b).addScaledVector(P[2], c).addScaledVector(P[3], d).normalize(); };
function buildTube(m, P, r0, r1) { const pos = m.geometry.attributes.position; let nPrev = null;
  for (let i = 0; i <= AN; i++) { const u = i / AN, c = bez(P, u), tg = bezT(P, u);
    let n = nPrev ? nPrev.clone().sub(tg.clone().multiplyScalar(nPrev.dot(tg))).normalize() : V3(0, 1, 0).sub(tg.clone().multiplyScalar(tg.y)).normalize();
    if (!isFinite(n.x) || n.lengthSq() < 0.1) n = V3(1, 0, 0); nPrev = n; const b = tg.clone().cross(n).normalize(); const r = lerp(r0, r1, u) * (1 + 0.15 * Math.exp(-((u - 0.5) ** 2) / 0.01));
    for (let j = 0; j <= AM; j++) { const a = j / AM * Math.PI * 2, k = i * (AM + 1) + j; const p = c.clone().addScaledVector(n, Math.cos(a) * r).addScaledVector(b, Math.sin(a) * r); pos.setXYZ(k, p.x, p.y, p.z); } }
  pos.needsUpdate = true; m.geometry.computeVertexNormals(); }
const ARMS = [0, 1].map(() => makeTube(TG));
function makeHand() { const g = new THREE.Group(); scene.add(g); mk(new THREE.SphereGeometry(0.42, 18, 14), TG, 0, 0, 0, g).scale.set(1, 0.75, 1.1);
  const f = [-1.5, -0.5, 0.5, 1.5].map(k => { const piv = new THREE.Group(); piv.position.set(0.3, 0, k * 0.2); g.add(piv); mk(new THREE.CapsuleGeometry(0.11, 0.32, 4, 8), TG, 0.2, 0, 0, piv).rotation.z = Math.PI / 2; return piv; });
  const th = new THREE.Group(); th.position.set(0.1, 0.18, -0.4); g.add(th); mk(new THREE.CapsuleGeometry(0.11, 0.25, 4, 8), TG, 0, 0.18, 0, th); return { g, f, th }; }
const HANDS = [makeHand(), makeHand()];
// club (painted like a barrier arm)
const clubT = canvasTex(64, 512, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.fillRect(0, i * h / 8, w, h / 8 + 1); } c.fillStyle = 'rgba(80,40,10,0.18)'; for (let i = 0; i < 40; i++) c.fillRect(Math.random() * w, Math.random() * h, 2, 30); });
const club = new THREE.Group(); scene.add(club);
{ const cm = STD('#ffffff', { map: clubT, roughness: 0.7 }); const s = mk(new THREE.CylinderGeometry(0.26, 0.11, 4.6, 16), cm, 0, 2.3, 0, club); s.geometry.translate(0, 0, 0);
  mk(new THREE.SphereGeometry(0.3, 16, 12), cm, 0, 4.6, 0, club);
  for (let k = 0; k < 6; k++) { const a = k * 1.05, y = 3.0 + (k % 3) * 0.55; mk(new THREE.ConeGeometry(0.08, 0.22, 6), STD('#6d4c41'), Math.cos(a) * 0.24, y, Math.sin(a) * 0.24, club).rotation.set(Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4); } }

// ---------------- hero car + coins + bin lorry ----------------
const hero = makeCar('#ff7043');
hero.userData.bodyG.children[1].material.color.set('#4a6c8c');
const dropCoin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 20), STD('#ffc107', { metalness: 0.85, roughness: 0.25, emissive: '#6a4800', emissiveIntensity: 0.3 })); scene.add(dropCoin);
const slot = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.12), STD('#111')); slot.position.set(0, 1.655, 0.06); hero.userData.bodyG.add(slot);
const COINMAT = STD('#ffc107', { metalness: 0.85, roughness: 0.25, emissive: '#6a4800', emissiveIntensity: 0.3 });
const NC = 60; const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 16), COINMAT, NC); coins.frustumCulled = false; coins.castShadow = true; scene.add(coins);
const NK = 40; const crumbs = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.07, 0), STD('#c68a3e', { roughness: 0.9 }), NK); crumbs.frustumCulled = false; scene.add(crumbs);
const glove = new THREE.Group(); scene.add(glove);
{ const wm = STD('#ffffff', { roughness: 0.55 }); const palm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), wm); palm.scale.set(1.0, 1.15, 0.6); glove.add(palm);
  for (const k of [-1.5, -0.5, 0.5]) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 4, 8), wm); f.position.set(k * 0.075, 0.24, 0.02); glove.add(f); }
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 16), STD('#e0e0e0')); cuff.position.y = -0.2; glove.add(cuff); }
// bin lorry
const lorry = new THREE.Group(); scene.add(lorry);
{ const gm = STD('#2e7d32', { roughness: 0.5, metalness: 0.2 }), wm = STD('#f5f5f5', { roughness: 0.5 });
  mk(new THREE.BoxGeometry(2.3, 2.1, 2.0), wm, 0, 1.45, -2.9, lorry);
  mk(new THREE.BoxGeometry(2.0, 0.8, 0.06), STD('#1a2633', { roughness: 0.05, metalness: 0.9 }), 0, 1.95, -3.92, lorry);
  mk(new THREE.BoxGeometry(2.4, 2.7, 5.2), gm, 0, 1.85, 0.8, lorry);
  const bT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#2e7d32'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BIN LORRY', w / 2, h / 2 - 30); c.font = '900 50px Inter'; c.fillStyle = '#c5e1a5'; c.fillText('♻  SMELLS GREAT', w / 2, h / 2 + 60); });
  for (const s of [-1, 1]) { const p = mk(new THREE.PlaneGeometry(4.6, 2.2), STD('#fff', { map: bT }), s * 1.21, 1.95, 0.8, lorry); p.rotation.y = s * Math.PI / 2; }
  for (const [x, z] of [[-1.05, -2.8], [1.05, -2.8], [-1.05, 1.9], [1.05, 1.9]]) { const w = makeWheel(0.5, 0.36); w.position.set(x, 0.5, z); lorry.add(w); }
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.4, 0.2, 0.06), new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#fff3b0', emissiveIntensity: 0.5 }), s * 0.75, 0.75, -3.92, lorry); }
const NF = 14; const flies = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), STD('#111'), NF); flies.frustumCulled = false; scene.add(flies);
// puffs (steam, splash)
const blobT = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const SPR = Array.from({ length: 120 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobT, depthWrite: false, transparent: true, color: '#ffffff' })); s.visible = false; scene.add(s); return s; });
let si = 0; function puff(p, size, alpha, col = '#ffffff') { const s = SPR[si++]; if (!s) return; s.visible = true; s.position.copy(p); s.scale.setScalar(size); s.material.color.set(col); s.material.opacity = alpha; }

// ---------------- choreography ----------------
const CAR_X = -0.6, CAR_Z = -1.8, CLUB_X = -4.9;
const carArrX = t => { const u = clamp(t / (tCoins1 + 0.3)); return lerp(26, CAR_X, 1 - Math.pow(1 - u, 2.2)); };
const carGoX = t => { const dt = Math.max(0, t - tFree + 0.15); return CAR_X - (0.3 * dt * dt + 0.8 * dt); };
const lorryX = t => { const a = t - tBin + 0.2; if (a < 0) return 40; const arrive = lerp(40, 7.2, 1 - Math.pow(1 - clamp(a / 1.6), 2.2)); const go = Math.max(0, t - tFree + 0.0); return arrive - (0.3 * go * go + 0.6 * go); };
const T_POS = V3(-8.9, 0, 6.6), T_YAW = 0.7;
const ROOT_DOWN = -7.6, ROOT_UP = -1.3;
const rootY = t => lerp(ROOT_DOWN, ROOT_UP, ease(clamp((t - tTroll + 0.5) / 0.75)));
// car in the wrong way: lifted, upside down, shaken -> held as piggy bank
const LIFT0 = tShakes - 0.55;
const HOLD = V3(-5.4, 2.7, 2.0), KEEP = V3(-6.3, 1.9, 3.5);
function carWrong(t) {
  const base = { p: V3(t < 0.01 ? 26 : carArrX(t), 0, CAR_Z), rx: 0, rz: 0 };
  if (t < LIFT0) return base;
  const u = ease(clamp((t - LIFT0) / 0.7)); const p = base.p.clone().lerp(HOLD, u); let rz = Math.PI * u;
  const sh = win(t, tShakes, tAnd3, 0.15); p.y += 0.55 * sh * Math.sin((t - tShakes) * 15); p.x += 0.2 * sh * Math.sin((t - tShakes) * 9);
  if (t > tAnd3 - 0.1) { const v = ease(clamp((t - tAnd3 + 0.1) / 0.8)); p.lerp(KEEP, v); rz = lerp(Math.PI, Math.PI * 2, v); }
  return { p, rx: 0, rz };
}
// camera
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const BEHIND = Ac([9.0, 3.4, -3.4], [-5.5, 2.0, 1.2], 40);
const WIDE = Ac([9.5, 6.4, -8.5], [-7.0, 3.3, 3.0], 40);
const camKeys = [
  [0.0, t => { const x = carArrX(t); return [V3(x + 8.5, 3.0, -1.4), V3(x - 10, 1.4, -0.4), 40]; }],
  [tToll1 - 0.3, t => { const x = carArrX(t); return [V3(x + 8.5, 3.0, -1.4), V3(x - 10, 1.4, -0.4), 40]; }],
  ...cut(tToll1 - 0.25, BEHIND),
  [S('hook1').end + 0.2, Ac([8.6, 3.4, -3.3], [-5.5, 2.0, 1.2], 38)],
  ...cut(tBarrier - 0.15, Ac([-1.0, 2.0, -4.6], [-4.9, 1.1, -1.4], 38)),
  [tAndH - 0.3, Ac([-1.2, 2.0, -4.3], [-4.9, 1.1, -0.9], 38)],
  ...cut(tAndH - 0.25, Ac([-0.4, 2.6, -2.8], [-5.6, 1.5, 1.8], 38)),
  [tIts - 0.4, Ac([-0.6, 2.7, -2.6], [-5.6, 1.6, 1.8], 38)],
  ...cut(tIts - 0.35, WIDE),
  [S('hook2').end + 0.3, Ac([9.0, 6.2, -8.0], [-7.0, 3.4, 3.0], 40)],
  // wrong
  ...cut(S('wrong1').start, Ac([3.0, 4.2, -10.5], [-6.5, 3.0, 3.5], 40)),
  [tBig - 0.3, Ac([2.6, 4.3, -10.0], [-6.5, 3.1, 3.5], 40)],
  ...cut(tBig - 0.25, Ac([-1.2, 4.4, -1.4], [-7.8, 4.0, 5.6], 38)),
  [tHe3 - 0.3, Ac([-1.4, 4.5, -1.2], [-7.8, 4.1, 5.6], 38)],
  ...cut(tHe3 - 0.25, Ac([2.2, 4.2, -9.5], [-6.0, 2.9, 2.6], 40)),
  [tAnd3 - 0.3, Ac([1.8, 4.2, -9.0], [-6.0, 2.8, 2.6], 40)],
  ...cut(tAnd3 - 0.25, Ac([2.2, 4.4, -7.5], [-7.2, 3.7, 4.2], 40)),
  [tRew0, Ac([1.8, 4.5, -7.0], [-7.2, 3.7, 4.2], 40)],
  // right
  ...cut(tRew1, BEHIND),
  [tRead - 0.2, Ac([6.2, 3.0, -2.9], [-5.5, 2.0, 1.0], 38)],
  ...cut(tRead - 0.15, Ac([2.6, 2.0, 1.0], [-2.2, 1.6, 2.9], 36)),
  [tSo2 - 0.3, Ac([2.4, 2.0, 1.1], [-2.2, 1.6, 2.9], 36)],
  ...cut(tSo2 - 0.25, Ac([3.0, 4.2, -10.5], [-6.5, 3.0, 3.5], 40)),
  [S('right3').end + 0.2, Ac([2.6, 4.3, -10.0], [-6.5, 3.2, 3.5], 40)],
  ...cut(tThinks - 0.15, Ac([-2.0, 5.0, -3.2], [-7.8, 4.4, 5.6], 40)),
  [S('right4').end + 0.2, Ac([-2.3, 5.1, -2.9], [-7.8, 4.5, 5.6], 40)],
  ...cut(tAnswer - 0.15, Ac([-6.8, 2.9, -2.9], [12.0, 1.4, -1.5], 40)),
  [tLaughs - 0.3, Ac([-7.0, 2.9, -2.9], [12.0, 1.5, -1.5], 40)],
  ...cut(tLaughs - 0.25, WIDE),
  [S('right5').end + 0.2, Ac([9.0, 6.2, -8.0], [-6.5, 2.4, 2.0], 40)],
  ...cut(tFree - 0.15, Ac([2.0, 9.0, -15.0], [-8.4, 2.6, 3.6], 40)),
  [TOTAL, Ac([1.5, 9.6, -16.5], [-9.4, 2.6, 3.4], 40)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = V3(1, 1, 1), YAX = V3(0, 1, 0);
const CLUB_HAND = V3(CLUB_X, 1.15, 0.9), CLUB_DIR = V3(0, 0, -1);
function update(t) {
  const right = isRight(t);
  si = 0; SPR.forEach(s => s.visible = false);
  // ---- car
  let cw = null;
  if (!right) { cw = carWrong(t); placeCar(hero, { x: cw.p.x, z: cw.p.z, h: Math.PI / 2 }); hero.position.y = cw.p.y; hero.rotation.set(0, Math.PI / 2, cw.rz, 'YXZ'); }
  else { const x = t > tFree - 0.3 ? carGoX(t) : CAR_X; placeCar(hero, { x, z: CAR_Z, h: Math.PI / 2 }); hero.position.y = 0; }
  slot.visible = !right && t > tKeeps - 0.3;
  dropCoin.visible = !right && t > tPiggy2 - 0.5 && t < tPiggy2 + 0.35; if (dropCoin.visible) { const top = hero.localToWorld(V3(0, 1.66, 0.06)); const u = clamp((t - tPiggy2 + 0.5) / 0.85); dropCoin.position.copy(top).add(V3(0, 1.2 * (1 - u * u), 0)); dropCoin.rotation.set(0, Math.PI / 2, Math.PI / 2); }
  hero.userData.hl.emissiveIntensity = 0.4; blink(hero, t, false, false);
  hero.updateMatrixWorld(true);
  // ---- troll body
  const laugh = right ? win(t, tLaughs - 0.15, TOTAL + 1, 0.2) : 0;
  troll.position.set(T_POS.x, rootY(t) + (laugh > 0 ? 0.15 * laugh * Math.abs(Math.sin(t * 11)) : 0) + 0.05 * Math.sin(t * 1.6), T_POS.z);
  troll.rotation.set(0, T_YAW, laugh * 0.05 * Math.sin(t * 13));
  const angry = !right ? win(t, tBig - 0.1, tThey, 0.2) : 0;
  const greedy = !right ? win(t, tThey - 0.05, tRew0 + 1, 0.15) : 0;
  const think = right ? win(t, tThinks - 0.2, tAnswer + 0.1, 0.3) : 0;
  const curious = right ? win(t, tWhatR - 0.2, tThinks, 0.3) : 0;
  TR.head.rotation.set(0.12 * curious - 0.1 * think * Math.sin(t * 2) , 0.0, 0.18 * curious + 0.2 * think + 0.25 * laugh * Math.sin(t * 9) + (!right ? 0.15 * win(t, tCoinsW + 0.3, tBig, 0.1) : 0), 'YXZ');
  // eyes
  const blinkE = (t % 3.9) < 0.13 ? 1 : 0;
  TR.eyes.forEach(E => { E.coin.visible = greedy > 0.5; E.p.visible = E.hl.visible = greedy <= 0.5;
    E.coin.rotation.x = t * 6; const sq = Math.max(laugh * 0.8, blinkE, !right && t > tCoinsW + 0.2 && t < tCoinsW + 0.7 ? 1 : 0);
    E.lid.rotation.x = lerp(-2.5, -1.2, sq); E.lid.rotation.order = 'XYZ';
    const look = think > 0 ? V3(0, 0.06 * think, -E.s * 0.02) : V3(0, 0, 0); E.p.position.copy(E.p0).add(look); E.hl.position.copy(E.h0).add(look);
    E.brow.rotation.x = E.s * (0.45 * angry - 0.25 * curious - 0.2 * greedy + 0.3 * think); E.brow.position.y = 0.72 - 0.08 * angry + 0.1 * (curious + greedy); });
  const mOpen = Math.max(0.15, laugh * (0.8 + 0.3 * Math.sin(t * 22)), greedy * 0.5, angry * 0.3, curious * 0.35);
  TR.mouth.scale.set(0.35, 0.18 + 0.5 * mOpen, 1.2 - 0.2 * angry); TR.tongue.visible = mOpen > 0.5;
  TR.nose.scale.set(1.15, 0.95, 0.95);
  troll.updateMatrixWorld(true);
  // ---- arms + hands
  const shoulder = s => troll.localToWorld(V3(0.4, 2.9, s * 1.55));
  let handP = [null, null], handDir = [V3(0, 0, -1), V3(0, 0, -1)];
  // hand 0 = club hand (towards the road), hand 1 = free hand
  const clubHeld = !right ? t < LIFT0 - 0.2 : t < tDrops;
  handP[0] = CLUB_HAND.clone().add(V3(0.03 * Math.sin(t * 2.1), 0.03 * Math.sin(t * 1.7), 0));
  handP[1] = troll.localToWorld(V3(1.5, 0.8, 1.9));
  if (!right) {
    if (t > tMore - 0.3 && t < LIFT0) { const u = win(t, tMore - 0.3, LIFT0, 0.3); handP[1].lerp(troll.localToWorld(V3(3.0, 2.0, -0.4)), u); handP[1].y += 0.2 * Math.sin(t * 8) * u; }
    if (t > LIFT0 - 0.4) { const u = ease(clamp((t - LIFT0 + 0.4) / 0.4)); const a = hero.localToWorld(V3(1.25, 0.8, 0)), b = hero.localToWorld(V3(-1.25, 0.8, 0)); handP[0] = handP[0].clone().lerp(a, u); handP[1] = handP[1].clone().lerp(b, u); handDir = [V3(1, 0, 0).applyQuaternion(hero.quaternion).negate(), V3(1, 0, 0).applyQuaternion(hero.quaternion)]; }
  } else {
    if (think > 0) { const scratch = troll.localToWorld(V3(0.0, 5.6, -1.1)).add(V3(0, 0.12 * Math.sin(t * 14), 0)); handP[1].lerp(scratch, think); }
    if (laugh > 0) { handP[1].lerp(troll.localToWorld(V3(1.4, 1.6, 0.4)).add(V3(0, 0.25 * Math.sin(t * 11), 0)), laugh); }
    if (t > tDrops) { const u = ease(clamp((t - tDrops) / 0.6)); handP[0].lerp(troll.localToWorld(V3(1.6, 1.3, -1.4)).add(V3(0, laugh * 0.2 * Math.sin(t * 11 + 1), 0)), u); }
  }
  [0, 1].forEach(k => { const s = k === 0 ? -1 : 1; const P0 = shoulder(s); const hp = handP[k];
    const P1 = P0.clone().add(V3(0, 1.4, 0)).add(V3(Math.cos(T_YAW), 0, -Math.sin(T_YAW)).multiplyScalar(1.2)); const P2 = hp.clone().add(V3(0, 1.6, 0)).add(V3(Math.cos(T_YAW), 0, -Math.sin(T_YAW)).multiplyScalar(-0.6));
    buildTube(ARMS[k], [P0, P1, P2, hp], 0.62, 0.34);
    const H = HANDS[k]; H.g.position.copy(hp); const tg = bezT([P0, P1, P2, hp], 0.98); H.g.quaternion.setFromUnitVectors(V3(1, 0, 0), tg);
    const grip = (k === 0 && clubHeld) || (!right && t > LIFT0 - 0.1) ? 1 : 0.2; H.f.forEach(f => f.rotation.y = 0); H.f.forEach(f => f.rotation.z = -1.4 * grip); });
  // ---- club
  if (clubHeld) { club.position.copy(handP[0]).add(V3(0, 0, 0.6)); club.quaternion.setFromUnitVectors(V3(0, 1, 0), CLUB_DIR); club.rotateY(0.3); }
  else if (!right) { const u = clamp((t - LIFT0 + 0.2) / 0.55); const p0 = CLUB_HAND.clone().add(V3(0, 0, 0.6)); club.position.set(p0.x + 0.6 * u, lerp(p0.y, 0.32, u * u), p0.z + 0.3 * u); club.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(0.15 * u, -0.3 * u, -1).normalize()); }
  else { const u = clamp((t - tDrops) / 0.9); const p0 = CLUB_HAND.clone().add(V3(0, 0, 0.6)); club.position.set(lerp(p0.x, -8.9, easeIn(u) * 0.7 + u * 0.3), p0.y + 2.0 * Math.sin(Math.PI * u * 0.6) - 4.6 * u * u, lerp(p0.z, -1.5, u)); club.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(-Math.sin(u * 5), Math.cos(u * 5) * 0.3, -Math.cos(u * 5)).normalize()); club.visible = club.position.y > WATER_Y - 0.25; }
  if (!right) club.visible = true;
  // ---- coins thrown (wrong1), coins + crumbs raining out of the car (wrong3)
  const face = TR.head.localToWorld(V3(1.4, 0.0, 0));
  for (let i = 0; i < NC; i++) { let ok = false; const p = V3(); const q = new THREE.Quaternion();
    if (!right && i < 8) { const t0 = tThrow + 0.05 + i * 0.07, dt = t - t0; if (dt > 0) { const win0 = hero.localToWorld(V3(-1.0, 1.25, -0.3)); const tgt = face.clone().add(V3((hash(i) - 0.5) * 0.8, (hash(i + 1) - 0.5) * 0.6, (hash(i + 2) - 0.5) * 0.8));
        const T1 = 0.55; if (dt < T1) { const u = dt / T1; p.lerpVectors(win0, tgt, u); p.y += 2.2 * Math.sin(Math.PI * u); ok = true; }
        else { const d = dt - T1; p.copy(tgt).add(V3(1.5 * d, 1.8 * d - 6 * d * d, -1.2 * d)); ok = p.y > -2; }
        q.setFromEuler(new THREE.Euler(dt * 14 + i, dt * 9, 0)); } }
    else if (!right && i >= 8) { const j = i - 8, t0 = tShakes + 0.1 + j * 0.06, dt = t - t0; if (dt > 0 && t < tRew0 + 1) { const src = HOLD.clone().add(V3((hash(i) - 0.5) * 1.6, 0.4, (hash(i + 3) - 0.5) * 3.0)); const y = src.y - 4.9 * dt * dt;
        if (y > 0.06) { p.set(src.x, y, src.z); q.setFromEuler(new THREE.Euler(dt * 10 + j, dt * 7, 0)); } else { p.set(src.x + (hash(i + 5) - 0.5) * 0.6, 0.07 + (j % 4) * 0.035, src.z + (hash(i + 6) - 0.5) * 0.6); q.setFromEuler(new THREE.Euler(0, hash(i) * 6, 0)); } ok = true; } }
    if (ok) _m.compose(p, q, _s.set(1.4, 1.4, 1.4)); else _m.makeScale(0, 0, 0); coins.setMatrixAt(i, _m); }
  coins.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < NK; i++) { let ok = false; const p = V3(); if (!right) { const t0 = tEvery + 0.5 + i * 0.03, dt = t - t0; if (dt > 0 && t < tRew0 + 1) { const src = HOLD.clone().add(V3((hash(i + 40) - 0.5) * 1.4, 0.3, (hash(i + 43) - 0.5) * 2.8)); const y = src.y - 4.9 * dt * dt; p.set(src.x, Math.max(0.08, y), src.z); ok = true; } }
    if (ok) _m.compose(p, _q.identity(), _s.set(1, 1, 1)); else _m.makeScale(0, 0, 0); crumbs.setMatrixAt(i, _m); }
  crumbs.instanceMatrix.needsUpdate = true;
  // glove throwing coins
  const gOn = !right ? win(t, tThrow - 0.35, tThrow + 0.7, 0.2) : 0; glove.visible = gOn > 0.02;
  if (glove.visible) { const w0 = hero.localToWorld(V3(-1.15, 1.2, -0.35)); const sw = ease(clamp((t - tThrow + 0.1) / 0.35)); glove.position.copy(w0).add(V3(-0.3 * sw, 0.35 * sw, 0.25)); glove.rotation.set(-0.6 + 1.6 * sw, 0, 0); glove.scale.setScalar(gOn); }
  // ---- bin lorry + flies
  lorry.visible = right && t > tBin - 0.3; const lx = lorryX(t); lorry.position.set(lx, 0, CAR_Z); lorry.rotation.y = Math.PI / 2;
  for (let i = 0; i < NF; i++) { if (!lorry.visible) { _m.makeScale(0, 0, 0); flies.setMatrixAt(i, _m); continue; } const a = t * (3 + hash(i) * 3) + i; const p = V3(lx + Math.sin(a * 1.3) * 2.4 + 0.5, 3.4 + Math.sin(a * 2.1) * 0.6 + hash(i + 1) * 0.6, CAR_Z + Math.cos(a) * 1.4); _m.compose(p, _q.identity(), _s.set(1, 1, 1)); flies.setMatrixAt(i, _m); }
  flies.instanceMatrix.needsUpdate = true;
  // ---- steam from the ears, splash
  if (right && t > tSteam - 0.2 && t < tAnswer + 0.3) { const a = win(t, tSteam - 0.2, tAnswer + 0.3, 0.2); for (const E of TR.ears) for (let k = 0; k < 8; k++) { const ph = ((t * 1.5 + k / 8) % 1); const base = TR.head.localToWorld(E.clone()); const out = TR.head.localToWorld(E.clone().multiplyScalar(1.6)).sub(base).normalize(); puff(base.clone().addScaledVector(out, 0.3 + ph * 1.2).add(V3(0, ph * 2.2, 0)), 0.7 + ph * 1.8, 0.95 * (1 - ph * 0.8) * a, '#ffffff'); } }
  if (right) { const ds = t - tDrops - 0.75; if (ds > 0 && ds < 1.0) for (let k = 0; k < 22; k++) { const ph = clamp(ds * 1.5 - hash(k) * 0.3); const d = V3(hash(k + 3) - 0.5, 0.8, hash(k + 5) - 0.5).normalize(); const p = V3(-8.9, WATER_Y, -1.5).addScaledVector(d, ph * 2.0); p.y += 2.5 * ph - 3 * ph * ph; puff(p, 0.3 + ph * 0.8, 0.8 * (1 - ph), '#bfe6ff'); } }
  // booth sign R
  const rOn = t > tTroll - 0.1; boothSign.m.material.map = rOn ? boothSign.b : boothSign.a;
  // ---- camera
  const c = cam(t); camera.fov = c.fov; camera.near = 0.3; camera.updateProjectionMatrix();
  const shk = !right ? win(t, tShakes, tAnd3, 0.1) * 0.5 : laugh * 0.3;
  applyCam(c, t, shk > 0.02 ? 0.06 * shk : 0);
  camera.updateMatrixWorld(true);
  screen = { head: project(TR.head.localToWorld(V3(0, 1.8, 0))), car: project(hero.localToWorld(V3(0, 2.0, 0))), lorry: project(lorry.localToWorld(V3(0, 3.6, 0))) };
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
function riddleCard(t, a, b, lines, col) { if (t < a || t > b) return; const f = win(t, a, b, 0.25), k = back((t - a) / 0.4);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, 1460); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(15,18,24,0.92)'; rr(-440, -150, 880, 300, 34); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.font = '900 44px Inter'; ctx.fillText(lines[0], 0, -88); ctx.fillStyle = '#fff'; ctx.font = '900 70px Inter'; ctx.fillText(lines[1], 0, -8); if (lines[2]) ctx.fillText(lines[2], 0, 74); ctx.restore(); }
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('BRIDGE AHEAD', '#455a64', tBridge - 0.1, tToll1 - 0.15, 62);
    P_('TOLL BOOTH', '#2e7d32', tToll1 - 0.15, tCoins1 - 0.1, 62);
    P_('COINS: READY', '#f9a825', tCoins1 - 0.1, S('hook1').end + 0.3, 62, iconCheck);
    P_('BARRIER = CLUB?', '#6d4c41', tClub - 0.15, tAndH - 0.1, 60);
    P_('HAND: GREEN', '#558b2f', tGreen - 0.15, tIts - 0.1, 62);
    P_("IT'S A TROLL BOOTH", '#2e7d32', tTroll - 0.15, S('hook2').end + 0.3, 56);
    P_('THROW THE COINS', RED, tThrow - 0.1, S('wrong1').end + 0.3, 60, iconWarn);
    floatText('DING! DING!', 540, 760, t, tCoinsW + 0.35, tCoinsW + 1.3, 100, YEL, -0.08);
    P_("TROLLS DON'T WANT COINS", RED, tTrolls - 0.1, tThey - 0.1, 50, iconX);
    P_('THEY WANT MORE COINS', RED, tThey - 0.1, S('wrong2').end + 0.3, 52, iconWarn);
    P_('SHAKEN LIKE A PIGGY BANK', RED, tShakes - 0.1, tEvery - 0.1, 50, iconX);
    P_('EVERY COIN', RED, tEvery - 0.1, tCrumb - 0.2, 62, iconX); P_('EVERY CRUMB', RED, tCrumb - 0.2, tAnd3 - 0.1, 62, iconX);
    P_('YOUR CAR = HIS PIGGY BANK', RED, tKeeps - 0.15, tRew0, 48, iconX);
  } else {
    P_('READ THE SIGN', '#455a64', tRead - 0.1, tTollR - 0.1, 62);
    P_('TOLL: 1 RIDDLE', '#2e7d32', tTollR - 0.1, tSo2 - 0.1, 62, iconCheck);
    P_('ASK HIM ONE', '#1565c0', tSo2 - 0.1, S('right2').end + 0.3, 62);
    riddleCard(t, tWhatR - 0.1, tAnswer - 0.1, ['RIDDLE', 'WHAT HAS 4 WHEELS', 'AND FLIES?'], YEL);
    floatText('?', 360, 700, t, tThinks, tThinks + 1.0, 150, YEL, -0.15); floatText('??', 720, 640, t, tThinks2, tThinks2 + 1.0, 150, YEL, 0.12);
    P_('THINKING...', '#6d4c41', tThinks - 0.1, tSteam - 0.1, 62); P_('BRAIN OVERHEATING', RED, tSteam - 0.1, S('right4').end + 0.3, 56, iconWarn);
    riddleCard(t, tAnswer - 0.05, tLaughs + 0.2, ['ANSWER', 'A BIN LORRY!', ''], GREEN);
    floatText('HA HA HA!', 540, 760, t, tLaughs, tLaughs + 1.2, 120, YEL, -0.06); floatText('HAHAHA!', 540, 900, t, tDrops + 0.3, tDrops + 1.3, 100, '#fff', 0.06);
    P_('CLUB DROPPED', GREEN, tDrops - 0.1, S('right5').end + 0.3, 62, iconCheck);
    P_('FREE PASSAGE', GREEN, tFree - 0.1, tFor6 - 0.1, 62, iconCheck);
    P_('+ THE BIN LORRY', '#2e7d32', tFor6 - 0.1, S('right7').start - 0.1, 58, iconHeart);
  }
}
window.dbg = { carWrong };
start(update, hud);
