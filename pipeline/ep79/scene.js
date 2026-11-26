// Episode 74: Harbour – last car onto the ferry, the ramp starts closing with you on it
// wrong: reverse, back to dry land -> the ramp is already too steep, it turns into a ski jump, you fly backwards
//        -> right over the harbour into the fish market: on the ice between the salmon, price per kilo: very reasonable
// right: stay calm, handbrake, honk twice like a ship -> captain answers with the ship's horn, ramp comes back down
//        -> roll on board, the last car -> for the nice honking: the best seat on the ship, the ramp open like a balcony,
//        sea view -> dolphins jump right over your bonnet
import {
  THREE, W, H, S, WT, TOTAL, clamp, lerp, ease, easeOut, easeIn, ramp, win, back, hash, rng, tRew0, tRew1, REW_TARGET,
  scene, camera, ctx, canvasTex, L, STD, plane, box, makeCar, applyCam, roundedPath, pathAt,
  project, YEL, GREEN, RED, BLUE, pill, iconCheck, iconWarn, iconX, iconHeart, floatText, start, rr, aoPass, blink, hemi, SKY,
  _m, _q, _v, _s, _c
} from '../common.js';
if (aoPass) aoPass.overrideVisibility = function () { const c = this._visibilityCache; this.scene.traverse(o => { c.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO) o.visible = false; }); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
scene.fog = new THREE.Fog(new THREE.Color('#cfe6f5'), 300, 1400);

// ---------------- timing ----------------
const tHarbour = WT('hook1', 'Harbour'), tLast = WT('hook1', 'Last'), tRoll = WT('hook1', 'roll'), tThen = WT('hook1', 'Then'), tEngines = WT('hook1', 'engines');
const tClosing = WT('hook2', 'closing'), tStill = WT('hook2', 'still'), tWhat = WT('hook2', 'What');
const tReverse = WT('wrong1', 'reverse'), tBack = WT('wrong1', 'Back');
const tSteep = WT('wrong2', 'steep'), tSki = WT('wrong2', 'ski'), tFly = WT('wrong2', 'fly'), tBackwards = WT('wrong2', 'Backwards');
const tOver = WT('wrong3', 'over'), tInto = WT('wrong3', 'Into'), tFish = WT('wrong3', 'fish'), tIce = WT('wrong3', 'ice'), tSalmon = WT('wrong3', 'salmon'), tPrice = WT('wrong3', 'Price'), tReason = WT('wrong3', 'reasonable');
const tStay = WT('right2', 'Stay'), tHandbrake = WT('right2', 'Handbrake'), tHonkW = WT('right2', 'honk'), tHere = WT('right2', 'here');
const tHonk1 = tHere + 0.55, tHonk2 = tHere + 0.95;
const tCaptain = WT('right3', 'captain'), tHorn = WT('right3', 'horn'), tRampR = WT('right3', 'ramp'), tDown = WT('right3', 'down');
const tRollR = WT('right4', 'roll'), tBoard = WT('right4', 'board'), tLastR = WT('right4', 'last');
const tNice = WT('right5', 'nice'), tBest = WT('right5', 'best'), tRamp5 = WT('right5', 'ramp'), tOpen = WT('right5', 'open'), tBalcony = WT('right5', 'balcony'), tSea = WT('right5', 'sea', 1);
const tDolphins = WT('right6', 'dolphins'), tHello = WT('right6', 'hello'), tRight6 = WT('right6', 'Right'), tBonnet = WT('right6', 'bonnet');
const isRight = t => t >= tRew0 + 0.5;

// ---------------- harbour ----------------
const WATER = -1.6;
const waterT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 320; i++) { c.fillStyle = `rgba(150,195,230,${0.25 + R() * 0.45})`; c.fillRect(R() * w, R() * h, 10 + R() * 30, 2); } }, true);
waterT.repeat.set(140, 140);
const waterM = new THREE.MeshStandardMaterial({ color: '#2b7bb0', map: waterT, roughness: 0.15, metalness: 0.15, envMapIntensity: 1.2 });
{ const g = new THREE.PlaneGeometry(3000, 3000); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, waterM); m.position.set(0, WATER, -1200 + 1); m.receiveShadow = true; scene.add(m); }
const QZ = 1.0;          // quay edge
const quayM = L('#9a948a', { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { const v = 200 + Math.random() * 55 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 3; c.strokeRect(0, 0, w, h); }, true) });
{ const q = new THREE.Mesh(new THREE.BoxGeometry(400, 4, 120), quayM); q.position.set(0, -2, QZ + 60); q.receiveShadow = true; scene.add(q);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(400, 0.25, 0.5), L('#e8e2d6')); edge.position.set(0, 0.12, QZ + 0.25); scene.add(edge);
  plane(-200, 200, QZ + 120, 1500, L('#8ccd52'), 0.0, 18); }
// yellow lane markings to the ferry + bollards
{ const mk = L('#ffd60a', { polygonOffset: true, polygonOffsetFactor: -2 }); for (const x of [-2.8, 2.8]) plane(x - 0.08, x + 0.08, QZ, 26, mk, 0.02, 4);
  const bg = new THREE.CylinderGeometry(0.25, 0.3, 0.7, 10); const list = [-22, -14, 10, 18, 26, -30]; const bI = new THREE.InstancedMesh(bg, STD('#333'), list.length);
  list.forEach((x, i) => { _m.compose(_v.set(x, 0.35, QZ + 0.8), _q.identity(), _s.set(1, 1, 1)); bI.setMatrixAt(i, _m); }); bI.castShadow = true; scene.add(bI); }
// harbour houses
const winTex = (base) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#fff'; c.fillRect(24 + x * 128, 30 + y * 128, 80, 84); c.fillStyle = '#4f6f8f'; c.fillRect(30 + x * 128, 36 + y * 128, 68, 72); } }, true);
{ const cols = ['#e57373', '#ffd54f', '#81c784', '#64b5f6', '#ffb74d', '#f06292', '#4dd0e1', '#fff1c9'];
  for (let k = -9; k <= 9; k++) { const x = k * 8.2, w = 7.6, h = 8 + hash(k + 20) * 5, d = 8; const col = cols[(k + 18) % cols.length];
    const t = winTex(col); t.repeat.set(2, Math.round(h / 4));
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [L(col), L(col), L(col), L(col), L('#fff', { map: t }), L(col)]); m.position.set(x, h / 2, 50); m.castShadow = m.receiveShadow = true; scene.add(m);
    const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.2, 0); sh.lineTo(w / 2 + 0.2, 0); sh.lineTo(0, 3.2); sh.lineTo(-w / 2 - 0.2, 0);
    const rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.4, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.4) / 2);
    const rf = new THREE.Mesh(rg, L(['#8e3b2e', '#5d4037', '#455a64'][(k + 30) % 3])); rf.position.set(x, h, 50); rf.castShadow = true; scene.add(rf); } }
// breakwater + lighthouse
{ const bw = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 120), L('#9e978c')); bw.position.set(-48, -0.6, -60); bw.receiveShadow = bw.castShadow = true; scene.add(bw);
  const lhT = canvasTex(64, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff' : '#e53935'; c.fillRect(0, i * 32, w, 32); } });
  const lh = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.0, 14, 20), L('#fff', { map: lhT })); lh.position.set(-48, 7.9, -116); lh.castShadow = true; scene.add(lh);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.8, 12), new THREE.MeshBasicMaterial({ color: '#fff7c0' })); top.position.set(-48, 15.8, -116); scene.add(top);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.6, 12), L('#c62828')); cap.position.set(-48, 17.5, -116); scene.add(cap); }
// a few small boats moored on the right
{ for (const [x, z, c] of [[-20, -5, '#fdd835'], [-28, -4, '#e53935']]) { const g = new THREE.Group(); g.position.set(x, WATER, z); scene.add(g);
    const h = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 6), L(c)); h.position.y = 0.3; h.castShadow = true; g.add(h);
    const cb = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 2), L('#fff')); cb.position.set(0, 1.4, 0.6); cb.castShadow = true; g.add(cb);
    const ms = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6, 5), L('#ddd')); ms.position.set(0, 3.8, -0.6); g.add(ms); } }

// ---------------- fish market (wrong-way landing) ----------------
const FM = V3(0, 0, 32), ICEY = 1.0;
{ const iceT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#eef8ff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${170 + Math.random() * 60},${210 + Math.random() * 40},255,0.7)`; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 0, PI * 2); c.fill(); } }, true);
  const tbl = new THREE.Mesh(new THREE.BoxGeometry(8, 0.35, 5.4), [L('#8d6e63'), L('#8d6e63'), L('#fff', { map: iceT }), L('#8d6e63'), L('#8d6e63'), L('#8d6e63')]); tbl.position.set(FM.x, ICEY - 0.175, FM.z); tbl.castShadow = tbl.receiveShadow = true; scene.add(tbl);
  for (const [x, z] of [[-3.7, -2.4], [3.7, -2.4], [-3.7, 2.4], [3.7, 2.4]]) box(0.2, ICEY - 0.35, 0.2, L('#5d4037'), FM.x + x, (ICEY - 0.35) / 2, FM.z + z, true);
  // awning
  const awT = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff' : '#1e6fb8'; c.fillRect(i * 32, 0, 32, h); } });
  const aw = new THREE.Mesh(new THREE.BoxGeometry(9, 0.1, 2.2), L('#fff', { map: awT })); aw.position.set(FM.x, 5.0, FM.z + 3.4); aw.rotation.x = -0.18; aw.castShadow = true; scene.add(aw);
  for (const [x, z, h] of [[-4.3, 3.6, 5.2], [4.3, 3.6, 5.2]]) box(0.14, h, 0.14, L('#eee'), FM.x + x, h / 2, FM.z + z, true);
  const sg = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#1e6fb8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 76px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FISH MARKET', w / 2, h / 2 + 4); });
  const sgm = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), L('#fff', { map: sg })); sgm.position.set(FM.x, 6.1, FM.z + 3.7); sgm.rotation.y = PI; scene.add(sgm);
  const sgm2 = sgm.clone(); sgm2.rotation.y = 0; sgm2.position.z = FM.z + 3.72; scene.add(sgm2); }
// salmon on the ice
function makeSalmon() { const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), STD('#ff8a65', { roughness: 0.4 })); b.scale.set(0.32, 0.3, 1.0); g.add(b);
  const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), STD('#e0e6ea', { roughness: 0.3, metalness: 0.3 })); bl.scale.set(0.3, 0.2, 0.95); bl.position.y = -0.1; g.add(bl);
  const tl = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.5, 4), STD('#ff7043')); tl.rotation.x = -PI / 2; tl.scale.set(0.25, 1, 1); tl.position.z = 1.1; g.add(tl);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), STD('#fff')); e.position.set(s * 0.25, 0.08, -0.7); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), STD('#111')); p.position.set(s * 0.29, 0.08, -0.72); g.add(p); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
const SALMON = [[-3.0, -1.6, 0.1], [-3.1, 0.2, -0.1], [-2.9, 1.8, 0.2], [3.0, -1.5, -0.1], [3.1, 0.3, 0.1], [2.9, 1.9, -0.2]].map(([x, z, r], i) => { const g = makeSalmon(); g.position.set(FM.x + x, ICEY + 0.22, FM.z + z); g.rotation.set(0, r, PI / 2 * (x < 0 ? 1 : -1) * 0.0); scene.add(g); return { g, x, z, r, i }; });
// fishmonger behind the table (faces -z)
const FMG = {};
{ const g = new THREE.Group(); g.position.set(FM.x + 2.6, 0, FM.z + 3.5); g.rotation.y = 0; scene.add(g); FMG.g = g;
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 10), STD('#37474f')); legs.position.y = 0.45; g.add(legs);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 1.1, 14), STD('#90caf9')); body.position.y = 1.45; g.add(body);
  const apron = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 1.0, 14, 1, true, PI * 0.7, PI * 0.6), STD('#ffffff', { side: THREE.DoubleSide })); apron.position.y = 1.35; g.add(apron);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 12), STD('#f0c39d')); head.position.y = 2.35; g.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 8, 0, PI * 2, 0, PI / 2), STD('#1e6fb8')); cap.position.y = 2.42; g.add(cap);
  const peak = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.3), STD('#1e6fb8')); peak.position.set(0, 2.45, -0.4); g.add(peak);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), STD('#fff')); e.position.set(s * 0.13, 2.4, -0.32); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), STD('#111')); p.position.set(0, 0, -0.05); e.add(p); FMG['e' + s] = e; }
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 6, 14, PI), STD('#7a1f1f')); mo.position.set(0, 2.22, -0.33); mo.rotation.z = PI; g.add(mo); FMG.mo = mo;
  const sh = new THREE.Group(); sh.position.set(-0.5, 1.9, 0); g.add(sh); FMG.sh = sh;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.75, 8), STD('#90caf9')); arm.position.y = -0.37; sh.add(arm);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), STD('#f0c39d')); hand.position.y = -0.78; sh.add(hand);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// price board
const priceG = new THREE.Group(); priceG.position.set(FM.x - 2.2, 0, FM.z - 3.4); priceG.rotation.y = PI; scene.add(priceG);
{ const t = canvasTex(512, 600, (c, w, h) => { c.fillStyle = '#263238'; c.fillRect(0, 0, w, h); c.strokeStyle = '#a1887f'; c.lineWidth = 26; c.strokeRect(13, 13, w - 26, h - 26);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '900 64px Inter'; c.fillText("TODAY'S CATCH", w / 2, 110); c.font = '900 120px Inter'; c.fillStyle = '#ffd60a'; c.fillText('1 CAR', w / 2, 270);
    c.fillStyle = '#fff'; c.font = '900 96px Inter'; c.fillText('€0.99/kg', w / 2, 420); c.font = '800 48px Inter'; c.fillStyle = '#80cbc4'; c.fillText('very fresh', w / 2, 520); });
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.0), L('#fff', { map: t })); b.position.y = 1.9; b.rotation.x = -0.12; b.castShadow = true; priceG.add(b);
  for (const s of [-1, 1]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.4, 0.07), L('#6d4c41')); lg.position.set(s * 0.75, 1.15, 0.12); priceG.add(lg); } }

// ---------------- the ferry (group origin = stern centre at deck level) ----------------
const ferry = new THREE.Group(); scene.add(ferry);
const FL = 46, FW = 15;
const white = L('#f7f7f4'), hullM = L('#1d4f91'), redM = L('#d32f2f'), deckM = L('#6b6f75'), darkM = L('#3d4047');
const fbox = (w, h, d, m, x, y, z, parent = ferry) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b; };
{ fbox(FW, 3.4, FL, hullM, 0, -1.7, -FL / 2);
  fbox(FW + 0.05, 0.35, FL, redM, 0, -1.3, -FL / 2);
  const bow = new THREE.Shape(); bow.moveTo(-FW / 2, 0); bow.lineTo(FW / 2, 0); bow.quadraticCurveTo(FW / 2, -6, 0, -9); bow.quadraticCurveTo(-FW / 2, -6, -FW / 2, 0);
  const bg = new THREE.ExtrudeGeometry(bow, { depth: 6.2, bevelEnabled: false }); bg.rotateX(PI / 2); const bm = new THREE.Mesh(bg, [hullM, hullM]); bm.position.set(0, 2.8, -FL); bm.castShadow = true; ferry.add(bm);
  fbox(FW - 0.8, 0.1, FL - 0.4, deckM, 0, 0.02, -FL / 2);
  for (const s of [-1, 1]) fbox(0.4, 2.8, FL - 0.5, white, s * (FW / 2 - 0.2), 1.4, -FL / 2 - 0.25);
  fbox(FW, 0.35, FL - 12, white, 0, 2.95, -12 - (FL - 12) / 2);
  const cabT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#f7f7f4'; c.fillRect(0, 0, w, h); for (let x = 16; x < w; x += 42) { c.fillStyle = '#26445f'; c.fillRect(x, 36, 30, 46); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x + 3, 40, 8, 38); } }, true);
  const ct1 = cabT.clone(); ct1.needsUpdate = true; ct1.repeat.set(3, 1); const ct2 = cabT.clone(); ct2.needsUpdate = true; ct2.repeat.set(1.3, 1);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(FW - 2, 2.6, 24), [L('#fff', { map: ct1 }), L('#fff', { map: ct1 }), white, white, L('#fff', { map: ct2 }), L('#fff', { map: ct2 })]); cab.position.set(0, 4.42, -16 - 12); cab.castShadow = cab.receiveShadow = true; ferry.add(cab);
  // name on the hull sides
  const nT = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#1d4f91'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FERRY FIONA', w / 2, h / 2 + 4); });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.75), L('#fff', { map: nT })); p.position.set(s * (FW / 2 + 0.03), -0.45, -24); p.rotation.y = s * PI / 2; ferry.add(p); }
  // stern frame around the car deck opening
  fbox(FW, 0.6, 0.5, white, 0, 3.0, -0.25);
  // funnel
  const fn = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 5.5, 18), redM); fn.position.set(0, 8.4, -33); fn.castShadow = true; ferry.add(fn);
  const fb = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.8, 18), white); fb.position.set(0, 9.6, -33); ferry.add(fb);
  const ft = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.5, 18), darkM); ft.position.set(0, 11.0, -33); ferry.add(ft);
  // railings on the upper deck
  const rl = new THREE.Mesh(new THREE.BoxGeometry(FW - 1, 0.06, 0.06), L('#fff')); rl.position.set(0, 4.0, -12.2); ferry.add(rl);
  for (let x = -6.5; x <= 6.5; x += 1.3) fbox(0.05, 0.9, 0.05, white, x, 3.55, -12.2); }
// wheelhouse with captain (big window faces aft, +z)
const WHZ = -17.5;
const CAP = {};
{ const add = (w, h, d, x, y, z, m = white) => fbox(w, h, d, m, x, y, z);
  add(9, 0.2, 5, 0, 5.8, WHZ - 2.5); add(9, 0.3, 5.4, 0, 8.45, WHZ - 2.5); add(0.25, 2.5, 5, -4.4, 7.05, WHZ - 2.5); add(0.25, 2.5, 5, 4.4, 7.05, WHZ - 2.5); add(9, 2.5, 0.25, 0, 7.05, WHZ - 5);
  add(9, 0.9, 0.25, 0, 6.3, WHZ - 0.05); add(1.0, 1.6, 0.25, -4.0, 7.5, WHZ - 0.05); add(1.0, 1.6, 0.25, 4.0, 7.5, WHZ - 0.05);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.5), new THREE.MeshStandardMaterial({ color: '#cfe6f5', transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false })); gl.position.set(0, 7.5, WHZ + 0.05); gl.userData.noAO = true; ferry.add(gl);
  const lt = new THREE.PointLight('#fff2d0', 14, 7, 1.5); lt.position.set(0, 7.6, WHZ - 1.0); ferry.add(lt);
  const g = new THREE.Group(); g.position.set(-1.2, 6.0, WHZ - 1.4); ferry.add(g); CAP.g = g;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.1, 14), STD('#1a237e')); body.position.y = 0.75; g.add(body);
  for (const y of [0.55, 0.8, 1.05]) { const bt = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), STD('#ffd54f', { metalness: 0.7 })); bt.position.set(0, y, 0.42); g.add(bt); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 12), STD('#f0c39d')); head.position.y = 1.65; g.add(head);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 10, 0, PI * 2, PI * 0.45, PI * 0.55), STD('#eeeeee', { roughness: 0.9 })); beard.position.set(0, 1.63, 0.04); g.add(beard);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.34, 0.24, 18), STD('#ffffff')); hat.position.y = 2.0; g.add(hat);
  const peak = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.28), STD('#111')); peak.position.set(0, 1.9, 0.36); g.add(peak);
  const badge = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), STD('#ffd54f', { metalness: 0.7 })); badge.position.set(0, 2.02, 0.39); g.add(badge);
  CAP.eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), STD('#fff')); e.position.set(s * 0.13, 1.72, 0.31); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), STD('#111')); p.position.set(0, 0, 0.05); e.add(p); return e; });
  const sh = new THREE.Group(); sh.position.set(0.48, 1.15, 0); g.add(sh); CAP.sh = sh;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8), STD('#1a237e')); arm.position.y = -0.35; sh.add(arm);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), STD('#f0c39d')); hand.position.y = -0.74; sh.add(hand);
  // horn cord + wheel
  const wh = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 6, 18), STD('#6d4c41')); wh.position.set(0.6, 6.9, WHZ - 1.0); ferry.add(wh);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
// ship horn on the funnel front + steam
const HORN = V3(0, 10.5, -31.2);
{ const h = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.12, 0.9, 12), STD('#cfd8dc', { metalness: 0.7, roughness: 0.3 })); h.rotation.x = PI / 2; h.position.copy(HORN); ferry.add(h); }
const glowT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const STEAM = Array.from({ length: 14 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0 })); ferry.add(s); return { s, k: hash(i + 3) }; });
const SMOKE = Array.from({ length: 16 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#9e9e9e', transparent: true, depthWrite: false, opacity: 0 })); ferry.add(s); return { s, k: hash(i + 7) }; });
// parked cars on the car deck
{ const cols = ['#e53935', '#fdd835', '#43a047', '#f5f5f5', '#8e24aa', '#ff7043', '#90a4ae', '#26a69a'];
  let n = 0; for (const z of [-15, -20.5, -26, -31.5]) for (const x of [-4.8, -1.6, 1.6, 4.8]) { const c = makeCar(cols[n++ % cols.length]); scene.remove(c); c.position.set(x, 0.07, z); ferry.add(c); } }
// the ramp (hinge at the stern, extends towards +z)
const RL = 7.2, RWD = 5.6, RT = 0.12;
const rampG = new THREE.Group(); ferry.add(rampG);
{ const rT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#7a7f86'; c.fillRect(0, 0, w, h); c.fillStyle = '#5f646b'; for (let y = 0; y < h; y += 20) c.fillRect(0, y, w, 7); }, true);
  rT.repeat.set(2, 6);
  const top = new THREE.Mesh(new THREE.BoxGeometry(RWD, 0.25, RL), [L('#5f646b'), L('#5f646b'), L('#fff', { map: rT }), L('#8a9098'), L('#5f646b'), L('#5f646b')]); top.position.set(0, RT - 0.125, RL / 2); top.castShadow = top.receiveShadow = true; rampG.add(top);
  for (const s of [-1, 1]) { const st = canvasTex(256, 32, (c, w, h) => { for (let x = 0; x < w; x += 32) { c.fillStyle = (x / 32) % 2 ? '#111' : '#ffd60a'; c.fillRect(x, 0, 32, h); } }); const e = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, RL), L('#fff', { map: st })); e.position.set(s * (RWD / 2 - 0.06), RT + 0.12, RL / 2); rampG.add(e); }
  // chains from the stern frame to the ramp tip
  rampG.userData.chains = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 5), STD('#333', { metalness: 0.6 })); m.castShadow = true; ferry.add(m); return { m, s }; }); }
// wake foam behind the ferry
const wakeT = canvasTex(128, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-in'; for (let i = 0; i < 400; i++) { c.fillStyle = 'rgba(0,0,0,1)'; c.fillRect(Math.random() * w, Math.random() * h, 6, 3); } c.globalCompositeOperation = 'source-over'; const g2 = c.createLinearGradient(0, 0, w, 0); });
const wake = new THREE.Mesh(new THREE.PlaneGeometry(13, 60), new THREE.MeshBasicMaterial({ map: wakeT, transparent: true, depthWrite: false, opacity: 0 })); wake.rotation.x = -PI / 2; wake.position.set(0, WATER + 0.05, 30); wake.userData.noAO = true; ferry.add(wake);

// ---------------- hero + dolphins ----------------
const hero = makeCar('#1e88e5');
const glowSp = (col, s) => { const m = new THREE.SpriteMaterial({ map: glowT, color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }); const sp = new THREE.Sprite(m); sp.scale.setScalar(s); return sp; };
const revL = [-0.55, 0.55].map(x => { const s = glowSp('#ffffff', 0.7); s.position.set(x, 0.86, 2.26); hero.userData.bodyG.add(s); return s; });
const brL = [-0.55, 0.55].map(x => { const s = glowSp('#ff2a1a', 0.8); s.position.set(x, 0.86, 2.26); hero.userData.bodyG.add(s); return s; });
const hdL = [-0.6, 0.6].map(x => { const s = glowSp('#fff6c8', 0.9); s.position.set(x, 0.76, -2.3); hero.userData.bodyG.add(s); return s; });
function makeDolphin() { const g = new THREE.Group(); const m = STD('#7fa7cc', { roughness: 0.35 }), bm = STD('#e8eef2', { roughness: 0.4 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), m); b.scale.set(0.42, 0.42, 1.25); g.add(b);
  const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), bm); bl.scale.set(0.36, 0.3, 1.1); bl.position.y = -0.14; g.add(bl);
  const sn = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.35, 4, 8), m); sn.rotation.x = PI / 2; sn.position.set(0, -0.08, -1.35); g.add(sn);
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 4), m); fin.scale.set(0.3, 1, 1); fin.position.set(0, 0.5, 0.1); fin.rotation.x = 0.5; g.add(fin);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.35), m); tail.position.set(0, 0, 1.35); g.add(tail);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), STD('#111')); e.position.set(s * 0.33, 0.08, -0.75); g.add(e); const hl = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), STD('#fff')); hl.position.set(s * 0.37, 0.11, -0.78); g.add(hl); }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 6, 12, PI), STD('#2b3f55')); smile.position.set(0, -0.16, -1.05); smile.rotation.set(PI / 2, 0, PI); g.add(smile);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); ferry.add(g); return g; }
const DOL = [0, 1, 2].map(i => ({ g: makeDolphin(), i }));
const SPLASH = Array.from({ length: 24 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0 })); ferry.add(s); return { s, k: hash(i + 31), a: hash(i + 77) * PI * 2 }; });

// ---------------- motion ----------------
function mono(keys) {
  const n = keys.length, ts = keys.map(k => k[0]), vs = keys.map(k => k[1]), d = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m = [d[0]]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return t => { if (t <= ts[0]) return vs[0]; if (t >= ts[n - 1]) return vs[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
const tLaunch = tFly - 0.1, tLand = tIce + 0.05;
const thW = mono([[tClosing - 0.25, 0], [tWhat + 0.3, 0.2], [tReverse, 0.27], [tSteep, 0.45], [tLaunch, 0.68], [tRew0, 0.95]]);
const DW = mono([[tClosing - 0.2, 0], [tWhat + 0.5, 1.0], [tLaunch, 3.2], [tRew0, 12]]);
const thRew = thW(REW_TARGET), DRew = DW(REW_TARGET);
const tDn0 = tHorn + 0.2, tDn1 = tDown + 0.5;
const tClose2a = tLastR + 0.35, tClose2b = tNice + 0.6, tOpenA = tRamp5 - 0.25, tOpenB = tOpen + 0.5;
const thR = mono([[tRew1, thRew], [tDn0, thRew], [tDn1, 0], [tClose2a, 0], [tClose2b, 1.3], [tOpenA, 1.3], [tOpenB, 0]]);
const DR = mono([[tRew1, DRew], [tDn0, DRew], [tDn1, 0], [tClose2a, 0], [tBest, 7], [tSea, 40], [TOTAL, 95]]);
const PSI = mono([[tClose2a, 0], [tBest, -0.15], [tSea, -2.0], [TOTAL, -2.3]]);
const FPATH = (() => { const dt = 0.02, arr = []; let x = 0, z = 0, Dp = DR(tClose2a); for (let t = tClose2a; t <= TOTAL + 1; t += dt) { const D = DR(t), ps = PSI(t), dd = D - Dp; Dp = D; x += -Math.sin(ps) * dd; z += -Math.cos(ps) * dd; arr.push([x, z]); } return { dt, arr }; })();
function ferryXZ(t) { const k = clamp((t - tClose2a) / FPATH.dt, 0, FPATH.arr.length - 1) | 0; return FPATH.arr[k]; }
const rampZ = mono([[0, 14.5], [tLast, 13], [tRoll + 0.9, 3.6]]);   // hook: drive onto the ramp (ramp-local z of car centre, > RL = quay)
const zrW = mono([[tReverse - 0.15, 3.6], [tBack, 4.3], [tSteep, 5.4], [tLaunch, 7.4]]);
const zrR4 = mono([[tRollR - 0.1, 3.6], [tLastR + 0.2, -6.2]]);
// right way U-turn on the car deck, then out onto the balcony (ferry-local x,z)
const uPath = roundedPath([[0, -6.2], [0, -9.6], [-4.6, -9.6], [-4.6, -3.4], [0, -3.4], [0, 3.8]], 2.2);
const uS = mono([[tClose2a, 0], [tOpenB - 0.2, uPath.len - 7.2], [tBalcony + 0.4, uPath.len]]);
// flight (world)
const LAND = V3(FM.x, ICEY, FM.z);
function rampLocalToWorld(x, y, z) { return rampG.localToWorld(V3(x, y, z)); }
const _M = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _P = new THREE.Vector3(), _S = new THREE.Vector3();
function setFromParent(obj, parent, x, y, z, h, pitch = 0) {
  _m.compose(_v.set(x, y, z), _q.setFromEuler(new THREE.Euler(pitch, h, 0, 'YXZ')), _s.set(1, 1, 1));
  _M.multiplyMatrices(parent.matrixWorld, _m); _M.decompose(_P, _Q, _S); obj.position.copy(_P); obj.quaternion.copy(_Q);
}
function bez(p0, p1, p2, p3, u) { const a = 1 - u; return V3(0, 0, 0).addScaledVector(p0, a * a * a).addScaledVector(p1, 3 * a * a * u).addScaledVector(p2, 3 * a * u * u).addScaledVector(p3, u * u * u); }
function poseAt(t) { // ferry + ramp state
  const right = isRight(t);
  return right ? { th: thR(t), D: DR(t) } : { th: thW(t), D: DW(t) };
}
let launchCache = null;
function launchPose() {   // world pose of the car centre at the launch moment (pure function)
  if (launchCache) return launchCache;
  const th = thW(tLaunch), D = DW(tLaunch);
  const g = new THREE.Group(); g.position.set(0, 0, -D); const r = new THREE.Group(); r.rotation.x = -th; g.add(r); g.updateMatrixWorld(true);
  const p = r.localToWorld(V3(0, RT, zrW(tLaunch))); const d = r.localToWorld(V3(0, RT, zrW(tLaunch) + 1)).sub(p).normalize();
  launchCache = { p, d, th }; return launchCache;
}

// ---------------- camera ----------------
const Ac = (p, l, fov = 40) => () => [V3(...p), V3(...l), fov];
const cut = (t0, f) => [[t0, f, 'cut'], [t0 + 0.04, f]];
const Fc = (p, l, fov = 40) => t => [ferry.localToWorld(V3(...p)), ferry.localToWorld(V3(...l)), fov];
const HeroC = (off, lookOff, fov = 40) => t => { const p = hero.position; return [V3(p.x + off[0], p.y + off[1], p.z + off[2]), V3(p.x + lookOff[0], p.y + lookOff[1], p.z + lookOff[2]), fov]; };
const camKeys = [
  [0.0, Ac([2.8, 9.0, 31], [0, 2.6, -6], 42)],
  [tThen - 0.3, Ac([2.4, 8.0, 26], [0, 2.4, -6], 42)],
  ...cut(tThen - 0.25, Ac([10, 6.5, 16], [0, 7.0, -26], 42)),
  [S('hook1').end + 0.3, Ac([9.5, 6.2, 15], [0, 6.0, -26], 42)],
  ...cut(tClosing - 0.3, Ac([13.5, 2.0, 5.5], [0, 1.4, 3.0], 38)),
  [tWhat - 0.3, Ac([12.5, 2.6, 6.5], [0, 1.8, 2.5], 38)],
  ...cut(tWhat - 0.25, Ac([4.5, 3.8, 15], [0, 2.2, 0.5], 40)),
  [S('hook2').end + 0.5, Ac([4.3, 3.6, 14.5], [0, 2.2, 0.5], 40)],
  // wrong
  ...cut(S('wrong1').start - 0.15, Ac([3.6, 6.5, 16], [0, 2.4, 3], 40)),
  [tBack + 0.5, Ac([3.4, 7.2, 15.5], [0, 3.0, 3], 40)],
  ...cut(tSteep - 0.3, Ac([17, 4.0, 6.5], [0, 3.4, 2.5], 40)),
  [tFly - 0.2, Ac([18, 4.5, 7.5], [0, 4.0, 3.0], 40)],
  ...cut(tFly - 0.15, t => { const p = hero.position; return [V3(14, 5, -6), V3(p.x, p.y, p.z), 44]; }),
  [tOver - 0.1, t => { const p = hero.position; return [V3(14, 5, -6), V3(p.x, p.y, p.z), 44]; }],
  ...cut(tOver - 0.05, t => { const p = hero.position; return [V3(7, 6, -9), V3(p.x * 0.5, lerp(p.y, 6, 0.5), lerp(p.z, FM.z, 0.4)), 50]; }),
  [tInto - 0.3, t => { const p = hero.position; return [V3(6, 6.5, -6), V3(p.x * 0.5, lerp(p.y, 6, 0.5), lerp(p.z, FM.z, 0.4)), 50]; }],
  ...cut(tInto - 0.25, Ac([10, 6, FM.z - 16], [0, 4.0, FM.z], 50)),
  [tIce - 0.1, Ac([8, 4.2, FM.z - 12], [0, 1.6, FM.z], 42)],
  ...cut(tSalmon - 0.25, Ac([6.5, 3.8, FM.z - 9.5], [0, 1.6, FM.z + 0.5], 40)),
  [tPrice - 0.25, Ac([6.0, 3.6, FM.z - 9.0], [0, 1.6, FM.z + 0.3], 40)],
  ...cut(tPrice - 0.2, Ac([-1.6, 3.3, FM.z - 12.0], [-1.1, 1.9, FM.z - 2.0], 44)),
  [tRew0, Ac([-1.5, 3.5, FM.z - 13.0], [-1.1, 2.0, FM.z - 2.0], 44)],
  // right
  ...cut(tRew1, Ac([4.3, 3.6, 14.5], [0, 2.2, 0.5], 40)),
  ...cut(tStay - 0.2, Ac([12.5, 2.6, 6.5], [0, 1.8, 2.5], 38)),
  [tHere + 1.3, Ac([12.0, 2.8, 7.0], [0, 2.0, 2.5], 38)],
  ...cut(tCaptain - 0.2, Fc([2.2, 7.4, -9.0], [-1.2, 7.6, WHZ - 1.4], 34)),
  [tHorn - 0.2, Fc([2.0, 7.4, -9.5], [-1.2, 7.6, WHZ - 1.4], 34)],
  ...cut(tHorn - 0.15, Fc([12, 13, 2], [0, 9.5, -31], 44)),
  [tRampR - 0.3, Fc([12, 12.5, 3], [0, 8, -28], 44)],
  ...cut(tRampR - 0.25, Ac([13.0, 3.2, 8.5], [0, 1.4, 2.5], 40)),
  [S('right3').end + 0.3, Ac([12.0, 3.0, 9.0], [0, 1.2, 2.0], 40)],
  ...cut(tRollR - 0.2, Fc([3.5, 2.6, -12.0], [0, 1.0, 1.0], 44)),
  [tLastR + 0.6, Fc([3.2, 2.4, -12.5], [0, 1.0, -4.0], 44)],
  ...cut(tNice - 0.2, Fc([9, 23, 6], [-1.5, 0, -4.5], 46)),
  [tBalcony + 0.3, Fc([8, 20, 10], [0, 0.5, 1], 46)],
  ...cut(tSea - 0.2, Fc([-2.5, 4.2, -8.5], [0, 1.2, 12], 44)),
  [S('right5').end + 0.3, Fc([-2.3, 4.0, -8.0], [0, 1.2, 12], 44)],
  ...cut(tDolphins - 0.2, Fc([1.5, 3.2, 17.5], [0, 1.6, 4.0], 42)),
  [tBonnet + 0.8, Fc([1.2, 3.4, 16.5], [0, 1.8, 4.0], 42)],
  [S('right7').start, Fc([12, 9, 24], [0, 2, 0], 46)],
  [TOTAL, Fc([18, 13, 38], [0, 2, -4], 48)],
];
function cam(t) {
  let i = 0; while (i < camKeys.length - 1 && camKeys[i + 1][0] <= t) i++;
  const a = camKeys[i], b = camKeys[Math.min(i + 1, camKeys.length - 1)];
  const Aa = a[1](t), B = b[1](t); const u = (b === a || b[2] === 'cut') ? 0 : ease(clamp((t - a[0]) / (b[0] - a[0])));
  return { p: Aa[0].lerp(B[0], u), l: Aa[1].lerp(B[1], u), fov: lerp(Aa[2], B[2], u) };
}

// ---------------- update ----------------
let screen = {};
let spin = 0, prevHero = null;
function update(t) {
  const right = isRight(t);
  const ps = poseAt(t);
  // ---- ferry + ramp ----
  const bob = 0.05 * Math.sin(t * 0.9);
  if (right && t > tClose2a) { const fx = ferryXZ(t); ferry.position.set(fx[0], bob * 0.3, fx[1]); ferry.rotation.set(0.002 * Math.sin(t * 0.7), PSI(t), 0.004 * Math.sin(t * 0.6), 'YXZ'); }
  else { ferry.position.set(0, bob * 0.3, -ps.D); ferry.rotation.set(0.002 * Math.sin(t * 0.7), 0, 0.004 * Math.sin(t * 0.6)); }
  rampG.rotation.x = -ps.th; ferry.updateMatrixWorld(true);
  rampG.userData.chains.forEach(c => { const a = V3(c.s * (RWD / 2 - 0.2), 3.0, -0.3), b = V3(c.s * (RWD / 2 - 0.2), RT, RL - 0.3).applyEuler(rampG.rotation); const d = b.clone().sub(a); c.m.visible = false; c.m.position.copy(a).add(b).multiplyScalar(0.5); c.m.scale.set(1, d.length(), 1); c.m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); });
  // ---- hero ----
  hero.visible = true; let dist = 0, pitchW = 0;
  const ud = hero.userData; ud.bodyG.rotation.set(0, 0, 0); ud.bodyG.position.y = 0;
  let mode = 'ramp', zr = 3.6;
  if (t < tClosing - 0.25) zr = rampZ(t);
  if (!right) {
    if (t < tLaunch) zr = t < tReverse - 0.15 ? (t < tClosing - 0.25 ? rampZ(t) : 3.6) : zrW(t);
    else if (t < tLand) mode = 'fly'; else mode = 'ice';
  } else {
    if (t > tRollR - 0.1 && t < tClose2a) zr = zrR4(t);
    if (t >= tClose2a) mode = 'deck';
  }
  if (mode === 'ramp') {
    if (zr > RL + 0.6) { // still on the quay (hook): world placement
      setFromParent(hero, scene, 0, RT * clamp(1 - (zr - RL - 0.6) / 1.5), zr, 0);
    } else if (zr < 0) setFromParent(hero, ferry, 0, lerp(0.07, RT, clamp(1 + zr)), zr, 0);
    else setFromParent(hero, rampG, 0, RT, zr, 0);
  } else if (mode === 'deck') {
    const s = uS(t), p = pathAt(uPath, s); setFromParent(hero, ferry, p.x, 0.07, p.z, p.h);
    if (s > uPath.len - 7.4) { const zr2 = p.z; if (zr2 > 0) setFromParent(hero, rampG, p.x, RT, zr2, p.h); }
  } else if (mode === 'fly') {
    const L0 = launchPose(); const u = clamp((t - tLaunch) / (tLand - tLaunch));
    const P1 = L0.p.clone().addScaledVector(L0.d, 9), P2 = V3(0, 24, LAND.z - 6), P3 = LAND.clone();
    const pos = bez(L0.p, P1, P2, P3, u);
    const pitch = -L0.th + (2 * PI + L0.th) * ease(u);
    hero.position.copy(pos).sub(V3(0, Math.cos(pitch) * 0, 0)); hero.quaternion.setFromEuler(new THREE.Euler(-pitch * 0 + pitch, 0, 0.15 * Math.sin(PI * u), 'YXZ'));
  } else if (mode === 'ice') {
    const k = t - tLand; hero.position.set(LAND.x, LAND.y + 0.35 * Math.abs(Math.sin(k * 9)) * Math.exp(-k * 4), LAND.z); hero.quaternion.setFromEuler(new THREE.Euler(0.04 * Math.sin(k * 11) * Math.exp(-k * 3), 0, 0, 'YXZ'));
  }
  // wheel spin from movement (frames render in order)
  if (prevHero && mode !== 'fly') { const d = hero.position.distanceTo(prevHero); if (d < 2) { const fw = V3(0, 0, -1).applyQuaternion(hero.quaternion); spin -= Math.sign(fw.dot(hero.position.clone().sub(prevHero)) || 1) * d / 0.34; } }
  if (mode === 'fly') spin += 0.25;
  prevHero = hero.position.clone(); ud.wheels.forEach(w => w.rotation.x = spin);
  // ---- lights ----
  const rev = !right && t > tReverse - 0.2 && t < tLand;
  revL.forEach(s => s.material.opacity = rev ? 0.9 : 0);
  const brake = right && t > tHandbrake - 0.1 && t < tRollR - 0.2;
  brL.forEach(s => s.material.opacity = brake ? 0.75 : 0); ud.tl.emissiveIntensity = brake ? 1.6 : 0.35;
  const hb = right && ((t > tHonk1 - 0.05 && t < tHonk1 + 0.25) || (t > tHonk2 - 0.05 && t < tHonk2 + 0.25));
  hdL.forEach(s => s.material.opacity = hb ? 0.95 : 0); ud.hl.emissiveIntensity = hb ? 2.5 : 0.3;
  // ---- ship smoke + horn steam ----
  const eng = t > tEngines - 0.1 ? 1 : 0;
  SMOKE.forEach((p, k) => { const ph = (t * 0.35 + p.k) % 1; p.s.visible = eng > 0; p.s.position.set(Math.sin(k) * 0.4 + ph * 1.5, 11.3 + ph * 7, -33 + ph * 6); p.s.scale.setScalar(1.6 + ph * 4.5); p.s.material.opacity = 0.42 * Math.sin(PI * ph) * eng; });
  const hornOn = (!right && t > tEngines - 0.05 && t < tEngines + 1.8) || (right && t > tHorn + 0.25 && t < tHorn + 2.3);
  const h0 = !right ? tEngines - 0.05 : tHorn + 0.25;
  STEAM.forEach((p, k) => { const age = t - h0 - p.k * 1.4; const on = hornOn && age > 0 && age < 1.2; p.s.visible = on; if (!on) return; p.s.position.copy(HORN).add(V3((p.k - 0.5) * 0.6, age * 1.6, 0.6 + age * 2.2)); p.s.scale.setScalar(0.6 + age * 2.2); p.s.material.opacity = 0.75 * (1 - age / 1.2); });
  // ---- captain ----
  const wave = right && t > tCaptain - 0.2 ? 1 : 0; const pull = right && t > tHorn - 0.1 && t < tHorn + 1.5;
  CAP.sh.rotation.set(0, 0, 0);
  if (pull) { CAP.sh.rotation.x = -1.2 - 0.4 * Math.abs(Math.sin((t - tHorn) * 5)); }
  else if (wave) CAP.sh.rotation.z = 2.4 + 0.35 * Math.sin(t * 9);
  CAP.g.rotation.y = 0.15 * Math.sin(t * 0.8);
  // ---- fish market ----
  const landed = !right && t > tLand;
  SALMON.forEach(s => { const k = t - tLand - 0.03 * s.i; let y = ICEY + 0.22, rz = 0;
    if (landed && k > 0) { y += 0.9 * Math.abs(Math.sin(k * 7)) * Math.exp(-k * 2.5); rz = 0.6 * Math.sin(k * 9) * Math.exp(-k * 2); }
    s.g.position.y = y; s.g.rotation.set(0, s.r, rz); });
  const surp = landed ? 1 : 0;
  FMG.e1.scale.setScalar(1 + 0.5 * surp); FMG['e-1'].scale.setScalar(1 + 0.5 * surp);
  FMG.sh.rotation.set(0, 0, 0); if (!right && t > tPrice - 0.2) FMG.sh.rotation.set(-1.0, 0, -0.5 - 0.2 * Math.sin(t * 6));
  const pu = !right ? clamp((t - tPrice + 0.15) / 0.4) : 0; priceG.visible = pu > 0; priceG.scale.setScalar(Math.max(0.01, back(pu)));
  // ---- wake ----
  const spd = (poseAt(t + 0.05).D - poseAt(t - 0.05).D) / 0.1; wake.material.opacity = clamp(spd / 5) * 0.8;
  // ---- dolphins (jump over the bonnet, across x) ----
  const bon = V3(0, RT, 3.8 + 1.5);
  DOL.forEach(d => { const t0 = tDolphins + 0.1 + d.i * 0.75 + (d.i === 2 ? 0.9 : 0); const u = (t - t0) / 1.35; const on = right && u > 0 && u < 1;
    d.g.visible = on; if (!on) return; const dir = d.i % 2 ? -1 : 1;
    const x = dir * lerp(-8.5, 8.5, u), y = WATER + (bon.y - WATER + 2.4 + 0.4 * d.i) * Math.sin(PI * u) - 0.6, z = bon.z + (d.i - 1) * 1.0;
    d.g.position.set(x, y, z); d.g.rotation.set(0, dir > 0 ? -PI / 2 : PI / 2, 0, 'YXZ'); d.g.rotateX(-(PI * (u - 0.5)) * 1.1 * (1)); });
  SPLASH.forEach((p, k) => { const di = k % 3, d = DOL[di]; const t0 = tDolphins + 0.1 + di * 0.75 + (di === 2 ? 0.9 : 0); const dir = di % 2 ? -1 : 1;
    const which = k % 6 < 3 ? 0 : 1; const ts = t0 + which * 1.35; const age = t - ts; const on = right && age > 0 && age < 0.9; p.s.visible = on; if (!on) return;
    const x = dir * (which ? 8.5 : -8.5), z = bon.z + (di - 1) * 1.0; p.s.position.set(x + Math.cos(p.a) * age * 2, WATER + 0.3 + age * (2.5 - age * 2.4) * (0.6 + p.k), z + Math.sin(p.a) * age * 1.5); p.s.scale.setScalar(0.7 + age * 1.5); p.s.material.opacity = 0.8 * (1 - age / 0.9); });
  // ---- camera ----
  const c = cam(t); camera.fov = c.fov; camera.near = 0.15; camera.updateProjectionMatrix();
  const shake = !right ? 0.6 * win(t, tLand - 0.02, tLand + 0.4, 0.05) : 0;
  applyCam(c, t, shake > 0.02 ? 0.12 * shake : 0);
  camera.updateMatrixWorld(true);
  screen = { hero: project(hero.localToWorld(V3(0, 1.8, 0))), cap: project(CAP.g.localToWorld(V3(0, 2.3, 0))), horn: project(ferry.localToWorld(HORN.clone())) };
}

// ---------------- HUD ----------------
let gT = 0;
const P_ = (text, bg, a, b, size = 46, icon = null, y = 420) => pill(text, W / 2, y, bg, '#fff', size, win(gT, a, b, 0.2), back((gT - a) / 0.35), icon);
function hud(t) {
  gT = t; const right = isRight(t);
  if (!right) {
    P_('HARBOUR', '#1565c0', tHarbour - 0.1, tLast - 0.15, 56);
    P_('LAST CAR ONTO THE FERRY', '#1565c0', tLast - 0.1, tThen - 0.2, 46);
    floatText('TOOOOT!', W / 2 + 80, 640, t, tEngines - 0.05, tEngines + 1.2, 110, YEL, 0.06);
    P_('RAMP: CLOSING', RED, tClosing - 0.15, tWhat - 0.3, 58, iconWarn);
    floatText('YOU\'RE STILL ON IT!', W / 2, 1000, t, tStill - 0.1, tWhat - 0.2, 64, YEL, -0.04);
    P_('REVERSE', RED, tReverse - 0.15, tSteep - 0.3, 58, iconX);
    P_('TOO STEEP', RED, tSteep - 0.2, tSki - 0.15, 58, iconWarn);
    P_('SKI JUMP', RED, tSki - 0.1, tFly - 0.2, 58, iconWarn);
    floatText('WHEEE!', W / 2 - 60, 700, t, tFly - 0.05, tFly + 1.4, 120, YEL, -0.08);
    P_('BACKWARDS', RED, tBackwards - 0.1, tInto - 0.3, 56);
    P_('FISH MARKET', '#1e6fb8', tFish - 0.15, tSalmon + 0.4, 58);
    floatText('SPLAT!', W / 2 + 100, 700, t, tLand, tLand + 0.9, 130, YEL, 0.08);
    P_('PRICE PER KILO: VERY REASONABLE', RED, tPrice - 0.1, tRew0, 40, iconX);
  } else {
    P_('HANDBRAKE ON', GREEN, tHandbrake - 0.15, tHonkW - 0.1, 56, iconCheck);
    P_('HONK TWICE, LIKE A SHIP', GREEN, tHonkW - 0.1, tHere + 1.4, 48, iconCheck);
    floatText('HONK!', W / 2 - 160, 760, t, tHonk1, tHonk1 + 0.8, 110, YEL, -0.1);
    floatText('HONK!', W / 2 + 160, 640, t, tHonk2, tHonk2 + 0.8, 110, YEL, 0.1);
    P_('THE CAPTAIN ANSWERS', '#1565c0', tCaptain - 0.15, tHorn - 0.2, 52);
    floatText('TOOOOT!', W / 2, 640, t, tHorn + 0.2, tHorn + 1.6, 120, YEL, 0.05);
    P_('RAMP COMES BACK DOWN', GREEN, tRampR - 0.15, S('right3').end + 0.3, 48, iconCheck);
    P_('THE LAST CAR', GREEN, tBoard - 0.1, S('right4').end + 0.3, 56, iconCheck);
    P_('BEST SEAT ON THE SHIP', '#1565c0', tBest - 0.15, tSea - 0.2, 50, iconHeart);
    P_('SEA VIEW', GREEN, tSea - 0.1, S('right5').end + 0.4, 60, iconCheck);
    floatText('HELLO!', W / 2 + 120, 640, t, tHello - 0.1, tHello + 1.0, 110, YEL, 0.08);
    floatText('BOING!', W / 2 - 120, 760, t, tBonnet - 0.05, tBonnet + 0.9, 100, YEL, -0.08);
  }
}
window.dbg = { hero, ferry, rampG, launchPose };
start(update, hud);
