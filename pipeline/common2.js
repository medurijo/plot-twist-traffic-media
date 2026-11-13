// Shared engine for Plot Twist Traffic episodes: renderer, world helpers, vehicles, camera, HUD, captions.
import * as THREE from 'three';
export { THREE };

export const W = 1080, H = 1920;
export const TL = await (await fetch('timeline.json')).json();
export const META = TL.meta || {};
export const TOTAL = TL.total;
export const S = id => TL.segs[id];
export const WT = (id, word, k = 0) => {
  const ws = S(id).words.filter(x => x.w.toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(word.toLowerCase()));
  return ws.length ? ws[Math.min(k, ws.length - 1)].s : S(id).start;
};
await document.fonts.load('900 76px Inter'); await document.fonts.load('800 32px Inter');

// ---------------- helpers ----------------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const smooth = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const ease = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const easeOut = u => 1 - Math.pow(1 - clamp(u), 2.2);
export const easeIn = u => Math.pow(clamp(u), 2);
export const linear = u => clamp(u);
export const ramp = (t, a, b) => smooth((t - a) / (b - a));
export const win = (t, a, b, f = 0.25) => Math.min(ramp(t, a, a + f), 1 - ramp(t, b - f, b));
export const back = u => { u = clamp(u); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
export function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export const hash = i => { let x = Math.imul((i + 12345) ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
export const tRew0 = S('wrong4').end + 0.05, tRew1 = S('right1').start;
export const REW_TARGET = META.rewindTo != null ? META.rewindTo : Math.max(0.5, S('wrong1').start - 0.8);

// ---------------- renderer ----------------
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: new URLSearchParams(location.search).has('gfx') || !!META.gfx });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
export const out = document.createElement('canvas'); out.width = W; out.height = H;
export const ctx = out.getContext('2d');
document.body.appendChild(out);
export const scene = new THREE.Scene();
export const SKY = new THREE.Color('#bfe3ff');
scene.background = SKY.clone();
scene.fog = new THREE.Fog(SKY.clone(), 380, 1150);
export const camera = new THREE.PerspectiveCamera(40, W / H, 2.0, 3000);
export const hemi = new THREE.HemisphereLight('#eef6ff', '#5f7d3c', 1.3); scene.add(hemi);
export const sun = new THREE.DirectionalLight('#fff3dc', 2.7);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 1, far: 600 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.05;
scene.add(sun); scene.add(sun.target);
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// GFX mode: outdoor sky environment, finer shadows, ambient occlusion, bloom, colour grading + vignette
export const GFX = new URLSearchParams(location.search).has('gfx') || !!META.gfx;
export const GFXOPT = Object.assign({ ao: true, bloom: 0, bloomThr: 0.96, bloomRad: 0.25, vignette: 0.26, sat: 1.14, contrast: 1.13, warm: 0, aoHalf: true, hemi: 0.55, sunBoost: 1.45, skyDome: false, sky2d: true, sunDir: [110, 60, 80], sunCol: '#ffd9a8', envInt: 0.7 }, META.gfxopt || {}, JSON.parse(new URLSearchParams(location.search).get('gfxopt') || '{}'));
if (!GFX || GFXOPT.roomEnv) { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; }
if (GFX) {
  // gradient sky dome as image-based light: blue zenith, warm bright horizon, green-brown ground bounce
  const envScene = new THREE.Scene();
  const g = new THREE.SphereGeometry(100, 48, 24); const col = []; const pos = g.attributes.position;
  const zen = new THREE.Color('#5d9be8'), hor = new THREE.Color('#fff1d6'), gnd = new THREE.Color('#6b7a45'), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 100;
    if (y >= 0) c.copy(hor).lerp(zen, Math.pow(y, 0.6)); else c.copy(hor).lerp(gnd, Math.min(1, -y * 4));
    col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5.4, 4.4) }));
  sunDisc.position.set(55, 60, 40); envScene.add(sunDisc);
  if (!GFXOPT.roomEnv) { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0.02).texture; }
  sun.shadow.mapSize.set(4096, 4096); hemi.intensity *= GFXOPT.hemi; sun.intensity *= GFXOPT.sunBoost; sun.color.set(GFXOPT.sunCol); hemi.color.set('#e4efff'); hemi.groundColor.set('#6e6a3c');
}
export let composer = null, aoPass = null;
if (GFX) {
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt); composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  if (GFXOPT.ao) { aoPass = new GTAOPass(scene, camera, W, H);
    aoPass.updateGtaoMaterial({ radius: 1.4, distanceExponent: 1.5, thickness: 2.0, scale: 1.15, samples: 12 });
    aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    aoPass.blendIntensity = 0.9;
    if (GFXOPT.aoHalf) { const ss = aoPass.setSize.bind(aoPass); aoPass.setSize = (w, h) => ss(Math.round(w / 2), Math.round(h / 2));
      aoPass.updateGtaoMaterial({ samples: 8 }); aoPass.updatePdMaterial({ samples: 8 }); }
    composer.addPass(aoPass); }
  if (GFXOPT.bloom > 0) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), GFXOPT.bloom, GFXOPT.bloomRad, GFXOPT.bloomThr));
  composer.addPass(new OutputPass());
}
// gradient sky dome tinted from the current scene.background colour (keeps per-episode day/night changes)
let skyDome = null;
if (GFX && GFXOPT.skyDome) {
  skyDome = new THREE.Mesh(new THREE.SphereGeometry(2400, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { base: { value: new THREE.Color() } },
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 base; varying vec3 vp;
      void main(){ float h = clamp(vp.y, -0.1, 1.0);
        vec3 zen = base * vec3(0.55, 0.72, 1.0) * 0.92;
        vec3 hor = mix(base, vec3(1.0, 0.93, 0.82), 0.45);
        vec3 c = mix(hor, zen, pow(max(h, 0.0), 0.55));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }` }));
  skyDome.renderOrder = -1; skyDome.frustumCulled = false; scene.add(skyDome);
}
const _hv = new THREE.Vector3(), _fw = new THREE.Vector3();
function gfxSky(bg) {
  // 2D gradient sky behind the (transparent) 3D render: not tone-mapped, so it stays clean and saturated
  camera.getWorldDirection(_fw); _fw.y = 0; if (_fw.lengthSq() < 1e-6) _fw.set(0, 0, -1); _fw.normalize();
  _hv.copy(camera.position).addScaledVector(_fw, 2000).project(camera);
  const hy = clamp((1 - _hv.y) / 2, -0.5, 1.5) * H;
  const b = bg.clone(); const hsl = {}; b.getHSL(hsl, THREE.SRGBColorSpace);
  const zen = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.05), hsl.l * 0.78, THREE.SRGBColorSpace);
  const mid = new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(0.95, hsl.l * 1.0), THREE.SRGBColorSpace);
  const hor = new THREE.Color().setHSL(hsl.h, hsl.s * 0.55, Math.min(0.97, hsl.l * 1.08 + 0.04), THREE.SRGBColorSpace).lerp(new THREE.Color('#ffe7c4'), 0.28);
  const g = ctx.createLinearGradient(0, hy - H * 0.9, 0, hy + 10);
  g.addColorStop(0, '#' + zen.getHexString(THREE.SRGBColorSpace)); g.addColorStop(0.55, '#' + mid.getHexString(THREE.SRGBColorSpace));
  g.addColorStop(1, '#' + hor.getHexString(THREE.SRGBColorSpace));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function gfxPre() {
  if (GFXOPT.sky2d) { const bg = scene.background; if (!bg || !bg.isColor) return null; scene.background = null; renderer.setClearColor(0x000000, 0); return bg; }
  if (!skyDome) return null;
  const bg = scene.background; if (!bg || !bg.isColor) { skyDome.visible = false; return null; }
  skyDome.visible = true; skyDome.material.uniforms.base.value.copy(bg); skyDome.position.copy(camera.position);
  scene.background = null; return bg;
}
export function gfxVignette() {
  if (!GFX || GFXOPT.vignette <= 0) return;
  const gr = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.28, W / 2, H * 0.5, H * 0.72);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(10,5,0,${GFXOPT.vignette})`);
  ctx.save(); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  if (GFXOPT.warm > 0) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,170,90,${GFXOPT.warm * 2})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

// ---------------- textures & materials ----------------
export function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const R0 = rng(7);
export const grassTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 12000; i++) { const v = 205 + R0() * 50 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R0() * w, R0() * h, 2 + R0() * 4, 2 + R0() * 4); }
}, true);
export const asphaltTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#55585e'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 6000; i++) { const v = 70 + R0() * 40 | 0; g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(R0() * w, R0() * h, 1.6, 1.6); }
}, true);
export const L = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o));
export const grassMat = L('#8ccd52', { map: grassTex });
export const asphaltMat = L('#ffffff', { map: asphaltTex });
export const markMat = L('#f5f5f5', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
export const concreteMat = L('#bdb8ae');

// ---------------- geometry helpers ----------------
export const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _c = new THREE.Color();
export function plane(x0, x1, z0, z1, mat, y = 0, uvs = 18) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + (x0 + x1) / 2) / uvs, (p.getZ(i) + (z0 + z1) / 2) / uvs);
  const m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); return m;
}
export function box(w, h, d, mat, x, y, z, cast = false, recv = true, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m;
}
export function polyPlane(pts, mat, y = 0.06, uvs = 7) { // pts: [[x,z],...] counter-clockwise seen from above
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(shape); g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / uvs, p.getZ(i) / uvs);
  const m = new THREE.Mesh(g, mat); m.position.y = y; m.receiveShadow = true; scene.add(m); return m;
}
export function instanced(geo, mat, list, cast = true) { // list of [x,y,z,ry,sx,sy,sz]
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
  list.forEach((d, i) => { _e.set(0, d[3] || 0, 0); _q.setFromEuler(_e); _m.compose(_v.set(d[0], d[1], d[2]), _q, _s.set(d[4] || 1, d[5] || 1, d[6] || 1)); m.setMatrixAt(i, _m); });
  m.count = list.length; m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m;
}

// ---------------- landscape ----------------
export const BIG = 1700;
export function makeLandscape({ avoid, fieldAvoid, seed = 42, trees = 1700, near = [40, 10, 300, 260] }) {
  plane(-BIG, BIG, -BIG, BIG, grassMat);
  const fieldCols = ['#a6d95c', '#79bd45', '#cfd86e', '#9fcd58', '#6bb03c', '#dccf72', '#b7dc6a'];
  const RF = rng(seed);
  for (let i = 0; i < 90; i++) {
    const x = (RF() - 0.5) * 1500, z = (RF() - 0.5) * 1500, w = 50 + RF() * 110, d = 50 + RF() * 110;
    if (fieldAvoid(x, z, w, d)) continue;
    const c = fieldCols[i % fieldCols.length];
    plane(x - w / 2, x + w / 2, z - d / 2, z + d / 2, L(c, { map: grassTex, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }), 0.03, 9);
  }
  const RT = rng(seed + 57), pts = [];
  while (pts.length < trees) {
    const cx = (RT() - 0.5) * 1500, cz = (RT() - 0.5) * 1500, n = 3 + RT() * 14 | 0;
    for (let k = 0; k < n; k++) { const x = cx + (RT() - 0.5) * 40, z = cz + (RT() - 0.5) * 40; if (!avoid(x, z)) pts.push([x, z, 0.8 + RT() * 1.1, RT()]); }
  }
  for (let k = 0; k < 160; k++) { const x = (RT() - 0.5) * near[2] + near[0], z = (RT() - 0.5) * near[3] + near[1]; if (!avoid(x, z)) pts.push([x, z, 0.9 + RT() * 0.9, RT()]); }
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.32, 2.2, 6), L('#6d4a2b'), pts.length);
  const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.3, 1), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pts.length);
  const leafCols = ['#3f8f2e', '#4fa336', '#2f7a28', '#5fb33f', '#3a8a3a'];
  pts.forEach(([x, z, s, r], i) => {
    _m.compose(_v.set(x, 1.1 * s, z), _q.identity(), _s.set(s, s, s)); trunk.setMatrixAt(i, _m);
    _e.set(r * 3, r * 6, 0); _q.setFromEuler(_e);
    _m.compose(_v.set(x, 3.4 * s, z), _q, _s.set(s * (0.9 + r * 0.3), s * (1.0 + r * 0.5), s * (0.9 + r * 0.2))); leaf.setMatrixAt(i, _m);
    leaf.setColorAt(i, _c.set(leafCols[(r * 5) | 0]));
  });
  trunk.castShadow = leaf.castShadow = true; leaf.receiveShadow = true; scene.add(trunk); scene.add(leaf);
  // pines + bushes for variety
  const RP = rng(seed + 91), pines = [], bush = [];
  while (pines.length < trees * 0.45) { const cx = (RP() - 0.5) * 1500, cz = (RP() - 0.5) * 1500, n = 4 + RP() * 12 | 0; for (let k = 0; k < n; k++) { const x = cx + (RP() - 0.5) * 34, z = cz + (RP() - 0.5) * 34; if (!avoid(x, z)) pines.push([x, z, 0.8 + RP() * 0.9, RP()]); } }
  for (let k = 0; k < 900; k++) { const x = (RP() - 0.5) * 1200, z = (RP() - 0.5) * 1200; if (!avoid(x, z)) bush.push([x, z, 0.6 + RP() * 0.8, RP()]); }
  const pineGeo = new THREE.ConeGeometry(1.9, 4.2, 7); const pine = new THREE.InstancedMesh(pineGeo, new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), pines.length * 2);
  const ptr = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 1.6, 6), L('#5d3f25'), pines.length);
  pines.forEach(([x, z, s, r], i) => { _m.compose(_v.set(x, 0.8 * s, z), _q.identity(), _s.set(s, s, s)); ptr.setMatrixAt(i, _m);
    _e.set(0, r * 6, 0); _q.setFromEuler(_e); _m.compose(_v.set(x, 3.0 * s, z), _q, _s.set(s, s, s)); pine.setMatrixAt(2 * i, _m); _m.compose(_v.set(x, 5.0 * s, z), _q, _s.set(s * 0.7, s * 0.75, s * 0.7)); pine.setMatrixAt(2 * i + 1, _m);
    const c = _c.set(['#2e6b2a', '#357a30', '#28602a'][(r * 3) | 0]); pine.setColorAt(2 * i, c); pine.setColorAt(2 * i + 1, c); });
  pine.castShadow = ptr.castShadow = true; pine.receiveShadow = true; scene.add(pine); scene.add(ptr);
  const bm = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), bush.length);
  bush.forEach(([x, z, s, r], i) => { _e.set(r * 3, r * 5, 0); _q.setFromEuler(_e); _m.compose(_v.set(x, 0.45 * s, z), _q, _s.set(s * 1.3, s * 0.8, s)); bm.setMatrixAt(i, _m); bm.setColorAt(i, _c.set(['#4f9a35', '#5eae3c', '#3f8a30'][(r * 3) | 0])); });
  bm.castShadow = true; bm.receiveShadow = true; scene.add(bm);
  const RH = rng(seed + 5); const wallMat = L('#f1ece2'), roofMat = L('#c2492f');
  for (let k = 0; k < 30; k++) {
    const x = (RH() - 0.5) * 900, z = (RH() - 0.5) * 900; if (avoid(x, z) || avoid(x + 12, z) || avoid(x - 12, z) || avoid(x, z + 12) || avoid(x, z - 12)) continue;
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = RH() * 3; scene.add(g);
    const wl = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 6), wallMat); wl.position.y = 2; wl.castShadow = wl.receiveShadow = true; g.add(wl);
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 8.4, 3, 1), roofMat); rf.rotation.z = Math.PI / 2; rf.rotation.x = Math.PI / 2; rf.scale.set(1, 1, 0.65); rf.position.y = 5.4; rf.castShadow = true; g.add(rf);
  }
}

// ---------------- vehicles ----------------
export const STD = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.05 }, o));
export function sideExtrude(shape, width, bevel = 0.06, curve = 10) { // side-profile shape (x = forward, y = up) extruded across the width; forward -> -z
  const g = new THREE.ExtrudeGeometry(shape, { depth: width - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: curve });
  g.rotateY(Math.PI / 2); g.translate(-(width - 2 * bevel) / 2, 0, 0); g.computeVertexNormals(); return g;
}
export function topExtrude(shape, height, bevel = 0.05) { // top-view shape (x, z) extruded upward, centred vertically
  const g = new THREE.ExtrudeGeometry(shape, { depth: height - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 8 });
  g.rotateX(Math.PI / 2); g.translate(0, (height - 2 * bevel) / 2, 0); g.computeVertexNormals(); return g;
}
export function roundRectShape(w, d, r) { const s = new THREE.Shape(); const x = -w / 2, y = -d / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
const tyreMat = STD('#1b1b1d', { roughness: 0.9 }), rimMat = STD('#c9ced6', { metalness: 0.85, roughness: 0.28 }), hubMat = STD('#55595f', { metalness: 0.6, roughness: 0.4 });
const tyreGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 28); tyreGeo.rotateZ(Math.PI / 2);
const rimGeo = new THREE.CylinderGeometry(0.215, 0.215, 0.25, 24); rimGeo.rotateZ(Math.PI / 2);
const spokeGeo = new THREE.BoxGeometry(0.03, 0.36, 0.06);
export function makeWheel(r = 0.34, w = 0.24) {
  const wh = new THREE.Group(); const k = r / 0.34;
  const t = new THREE.Mesh(tyreGeo, tyreMat); t.scale.set(w / 0.24, k, k); wh.add(t);
  const rim = new THREE.Mesh(rimGeo, rimMat); rim.scale.set(w / 0.24, k, k); wh.add(rim);
  for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(spokeGeo, hubMat); sp.position.x = (w / 2 + 0.005) * 1; sp.rotation.x = i * Math.PI * 2 / 5; sp.scale.set(1, k, k); wh.add(sp); const sp2 = sp.clone(); sp2.position.x = -sp.position.x; wh.add(sp2); }
  wh.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return wh;
}
let CAR_GEO = null;
function carGeos() {
  if (CAR_GEO) return CAR_GEO;
  const b = new THREE.Shape();
  b.moveTo(-2.12, 0.30); b.lineTo(-2.2, 0.6); b.quadraticCurveTo(-2.22, 0.93, -1.95, 0.97); b.lineTo(-1.3, 1.0); b.lineTo(1.0, 0.99);
  b.quadraticCurveTo(1.85, 0.95, 2.1, 0.8); b.quadraticCurveTo(2.25, 0.72, 2.2, 0.48); b.lineTo(2.12, 0.30);
  b.lineTo(1.84, 0.30); b.absarc(1.38, 0.30, 0.46, 0, Math.PI, false); b.lineTo(-0.92, 0.30); b.absarc(-1.38, 0.30, 0.46, 0, Math.PI, false); b.lineTo(-2.12, 0.30);
  const body = sideExtrude(b, 1.84, 0.09, 12);
  const gh = new THREE.Shape(); gh.moveTo(-1.3, 0.97); gh.lineTo(-0.98, 1.42); gh.quadraticCurveTo(-0.85, 1.5, -0.6, 1.5); gh.lineTo(0.42, 1.5); gh.quadraticCurveTo(0.6, 1.49, 0.7, 1.42); gh.lineTo(1.08, 0.97); gh.lineTo(-1.3, 0.97);
  const glass = sideExtrude(gh, 1.56, 0.05, 8);
  const roofShape = roundRectShape(1.5, 1.18, 0.28); const roof = topExtrude(roofShape, 0.08, 0.03); roof.translate(0, 1.565, 0.06);
  const lamp = new THREE.CapsuleGeometry(0.07, 0.3, 4, 8); lamp.rotateZ(Math.PI / 2);
  const bump = new THREE.BoxGeometry(1.7, 0.18, 0.18);
  CAR_GEO = { body, glass, roof, lamp, bump, grille: new THREE.BoxGeometry(0.85, 0.16, 0.05), tail: new THREE.BoxGeometry(1.45, 0.07, 0.05), mirror: new THREE.BoxGeometry(0.22, 0.12, 0.14), ind: new THREE.BoxGeometry(0.16, 0.08, 0.06) };
  return CAR_GEO;
}
export function makeCar(color, opts = {}) {
  const G = carGeos();
  const g = new THREE.Group(); const bodyG = new THREE.Group(); g.add(bodyG);
  const body = STD(color, { roughness: 0.22, metalness: 0.45, envMapIntensity: 1.3 });
  const glass = STD('#1a2633', { roughness: 0.05, metalness: 0.9, envMapIntensity: 1.6 });
  const trim = STD('#26282c', { roughness: 0.6 });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = bodyG) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  add(G.body, body); add(G.glass, glass); add(G.roof, body);
  add(G.bump, trim, 0, 0.4, -2.17); add(G.bump, trim, 0, 0.42, 2.15); add(G.grille, trim, 0, 0.6, -2.2);
  const hl = new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#fff3b0', emissiveIntensity: 0.3, roughness: 0.2 });
  for (const s of [-1, 1]) add(G.lamp, hl, s * 0.6, 0.76, -2.12);
  const tl = new THREE.MeshStandardMaterial({ color: '#7a0000', emissive: '#ff1010', emissiveIntensity: 0.35, roughness: 0.3 });
  add(G.tail, tl, 0, 0.86, 2.2);
  for (const s of [-1, 1]) { add(G.mirror, body, s * 0.98, 1.02, -0.72); }
  const bl = { L: new THREE.MeshStandardMaterial({ color: '#7a4a00', emissive: '#ffa000', emissiveIntensity: 0 }), R: new THREE.MeshStandardMaterial({ color: '#7a4a00', emissive: '#ffa000', emissiveIntensity: 0 }) };
  for (const [side, s] of [['L', -1], ['R', 1]]) { add(G.ind, bl[side], s * 0.82, 0.78, -2.16); add(G.ind, bl[side], s * 0.78, 0.86, 2.2); add(G.ind, bl[side], s * 1.06, 1.04, -0.72); }
  const wheels = [];
  for (const [x, z] of [[-0.84, -1.38], [0.84, -1.38], [-0.84, 1.38], [0.84, 1.38]]) { const w = makeWheel(); w.position.set(x, 0.34, z); g.add(w); wheels.push(w); }
  if (opts.antenna) { const a = add(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 5), trim, 0.5, 2.2, 0.9); add(new THREE.SphereGeometry(0.08, 8, 6), STD('#ff3b30'), 0.5, 2.9, 0.9); g.userData.antenna = a; }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  Object.assign(g.userData, { hl, tl, bl, body, wheels, bodyG, prev: null });
  scene.add(g); return g;
}
export function blink(car, t, left, right) {
  const on = Math.floor(t * 2.6) % 2 === 0;
  car.userData.bl.L.emissiveIntensity = left && on ? 3 : 0;
  car.userData.bl.R.emissiveIntensity = right && on ? 3 : 0;
}

// ---------------- motion ----------------
export function roundedPath(corners, r = 9) {
  const pts = []; const P = corners.map(c => new THREE.Vector2(c[0], c[1]));
  pts.push(P[0].clone());
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1];
    const d1 = b.clone().sub(a).normalize(), d2 = c.clone().sub(b).normalize();
    const rr = Math.min(r, a.distanceTo(b) / 2, b.distanceTo(c) / 2);
    const p0 = b.clone().addScaledVector(d1, -rr), p2 = b.clone().addScaledVector(d2, rr);
    for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push(new THREE.Vector2((1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * b.x + u * u * p2.x, (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * b.y + u * u * p2.y)); }
  }
  pts.push(P[P.length - 1].clone());
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return { pts, cum, len: cum[cum.length - 1] };
}
export function pathAt(path, s) {
  s = clamp(s, 0, path.len); let i = 1; while (i < path.cum.length - 1 && path.cum[i] < s) i++;
  const a = path.pts[i - 1], b = path.pts[i], u = (s - path.cum[i - 1]) / Math.max(1e-6, path.cum[i] - path.cum[i - 1]);
  const dx = b.x - a.x, dz = b.y - a.y;
  return { x: lerp(a.x, b.x, u), z: lerp(a.y, b.y, u), h: Math.atan2(-dx, -dz) };
}
export const angLerp = (a, b, u) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * u; };
// moves: {t0,t1,path,e} or {t0,t1,a:{x,z,h},b:{x,z,h},e} ; optional extra fields are passed through via fn(m,u,p)
export function mover(moves) {
  return t => {
    let m = moves[0]; for (const mv of moves) if (t >= mv.t0) m = mv;
    const u = clamp((t - m.t0) / (m.t1 - m.t0)); let p;
    if (m.path) p = pathAt(m.path, m.path.len * (m.e || ease)(u));
    else { const e = (m.e || ease)(u); p = { x: lerp(m.a.x, m.b.x, e), z: lerp(m.a.z, m.b.z, e), h: angLerp(m.a.h, m.b.h, e) }; }
    p.y = 0; p.pitch = 0; p.roll = 0; if (m.fx) m.fx(p, u, t); return p;
  };
}
// distance-based mover: speed profile v(t) integrated -> position along a path
export function speedMover(path, vfn, t0, t1, dt = 1 / 120) {
  const cum = [0]; let s = 0; for (let t = t0; t <= t1 + 1; t += dt) { s += vfn(t) * dt; cum.push(s); }
  return t => { const k = clamp((t - t0) / dt, 0, cum.length - 2), i = Math.floor(k); const ss = lerp(cum[i], cum[i + 1], k - i); const p = pathAt(path, ss); p.y = 0; p.pitch = 0; p.roll = 0; p.s = ss; return p; };
}
export function placeCar(g, p, yo = 0) {
  g.position.set(p.x, (p.y || 0) + yo, p.z); g.rotation.set(p.pitch || 0, p.h, p.roll || 0, 'YXZ');
  const u = g.userData; if (!u.wheels) return;
  // wheel spin + body lean/pitch from motion between frames (frames render in order)
  const pv = u.prev; let ds = 0, dh = 0;
  if (pv) { const dx = p.x - pv.x, dz = p.z - pv.z; ds = Math.hypot(dx, dz); if (ds > 3) ds = 0; const fwd = -Math.sin(p.h) * dx - Math.cos(p.h) * dz; ds = Math.sign(fwd) * ds; dh = p.h - pv.h; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI; if (Math.abs(dh) > 0.5) dh = 0; }
  u.spin = (u.spin || 0) - ds / 0.34; u.wheels.forEach(w => w.rotation.x = u.spin);
  const speed = ds * 30, acc = pv ? (speed - (pv.speed || 0)) : 0;
  u.lean = lerp(u.lean || 0, clamp(-dh * 30 * speed * 0.004, -0.06, 0.06), 0.25);
  u.dive = lerp(u.dive || 0, clamp(acc * 0.012, -0.05, 0.05), 0.2);
  u.bodyG.rotation.set(u.dive, 0, u.lean); u.bodyG.position.y = 0.012 * Math.sin((u.spin || 0) * 0.7) * Math.min(1, Math.abs(speed) / 10);
  u.prev = { x: p.x, z: p.z, h: p.h, speed };
}

// ---------------- camera ----------------
export const F = (off, look) => ({ follow: true, off, look });
export function makeCam(keys, poseFn) {
  const evalKey = (k, t) => {
    if (k[1].follow) { const p = poseFn(t); return { p: new THREE.Vector3(p.x + k[1].off[0], (p.y || 0) + k[1].off[1], p.z + k[1].off[2]), l: new THREE.Vector3(p.x + k[1].look[0], (p.y || 0) + k[1].look[1], p.z + k[1].look[2]) }; }
    return { p: new THREE.Vector3(...k[1]), l: new THREE.Vector3(...k[2]) };
  };
  return t => {
    let i = 0; while (i < keys.length - 1 && keys[i + 1][0] <= t) i++;
    const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
    const A = evalKey(a, t), B = evalKey(b, t);
    const u = b === a ? 0 : ease((t - a[0]) / (b[0] - a[0]));
    return { p: A.p.lerp(B.p, u), l: A.l.lerp(B.l, u) };
  };
}
export function applyCam(c, t, shake = 0) {
  camera.position.copy(c.p).add(new THREE.Vector3(Math.sin(t * 0.37) * 0.6 + shake * Math.sin(t * 61), Math.sin(t * 0.29) * 0.4 + shake * Math.sin(t * 47 + 1), shake * Math.sin(t * 53 + 2)));
  camera.lookAt(c.l);
  sun.position.copy(c.l).add(GFX ? new THREE.Vector3(...GFXOPT.sunDir) : new THREE.Vector3(70, 140, 45)); sun.target.position.copy(c.l); sun.target.updateMatrixWorld();
}

// ---------------- HUD ----------------
export const BLUE = '#2f7bff', YEL = '#ffd60a', GREEN = '#16a34a', RED = '#e11d2e';
export function project(v) { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, ok: p.z < 1 }; }
export function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
export function ring(pos, r, t, a, b) {
  if (t < a || t > b) return; const s = project(pos); if (!s.ok) return;
  const k = back((t - a) / 0.35), f = 1 - ramp(t, b - 0.25, b);
  ctx.save(); ctx.globalAlpha = f; ctx.lineWidth = 9; ctx.strokeStyle = YEL; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(s.x, s.y, r * k, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  s.f = f; return s;
}
export function pill(text, x, y, bg, fg = '#fff', size = 48, alpha = 1, scale = 1, icon = null) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 1.1 + (icon ? size * 1.1 : 0), h = size * 1.55;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = bg; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, icon ? size * 0.55 : 0, size * 0.04);
  if (icon) icon(-w / 2 + size * 0.95, 0, size * 0.42, fg);
  ctx.restore();
}
export const iconX = (x, y, r, c = '#fff') => { ctx.strokeStyle = c; ctx.lineWidth = r * 0.42; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); };
export const iconCheck = (x, y, r, c = '#fff') => { ctx.strokeStyle = c; ctx.lineWidth = r * 0.42; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x - r * 0.25, y + r * 0.8); ctx.lineTo(x + r, y - r * 0.8); ctx.stroke(); };
export const iconWarn = (x, y, r, c = '#000') => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - r * 1.1); ctx.lineTo(x + r * 1.15, y + r * 0.9); ctx.lineTo(x - r * 1.15, y + r * 0.9); ctx.closePath(); ctx.fill(); ctx.fillStyle = YEL; ctx.fillRect(x - r * 0.12, y - r * 0.45, r * 0.24, r * 0.75); ctx.fillRect(x - r * 0.12, y + r * 0.45, r * 0.24, r * 0.22); };
export const iconArrow = (x, y, r, c = '#fff') => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + r * 1.1, y); ctx.lineTo(x - r * 0.1, y - r); ctx.lineTo(x - r * 0.1, y - r * 0.4); ctx.lineTo(x - r * 1.0, y - r * 0.4); ctx.lineTo(x - r * 1.0, y + r * 0.4); ctx.lineTo(x - r * 0.1, y + r * 0.4); ctx.lineTo(x - r * 0.1, y + r); ctx.closePath(); ctx.fill(); };
export const iconHeart = (x, y, r, c = '#fff') => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y + r); ctx.bezierCurveTo(x - r * 1.6, y - r * 0.1, x - r * 0.7, y - r * 1.4, x, y - r * 0.45); ctx.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.1, x, y + r); ctx.fill(); };
export function bigText(lines, y, t, a, b, size = 110, color = '#fff') {
  if (t < a || t > b) return;
  const k = back((t - a) / 0.4), f = 1 - ramp(t, b - 0.3, b);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, y); ctx.scale(k, k);
  ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  lines.forEach((ln, i) => {
    const yy = (i - (lines.length - 1) / 2) * size * 1.08;
    ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#000'; ctx.strokeText(ln, 0, yy); ctx.fillStyle = typeof color === 'function' ? color(i) : color; ctx.fillText(ln, 0, yy);
  });
  ctx.restore();
}
export function floatText(text, x, y, t, a, b, size = 56, color = YEL, rot = 0) {
  if (t < a || t > b) return;
  const k = back((t - a) / 0.3), f = 1 - ramp(t, b - 0.25, b);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y - (t - a) * 30); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#000'; ctx.strokeText(text, 0, 0); ctx.fillStyle = color; ctx.fillText(text, 0, 0);
  ctx.restore();
}
export function stamp(text, t, a, b, col, rot = -0.14) {
  if (t < a || t > b) return;
  const u = clamp((t - a) / 0.28), sc = lerp(2.4, 1, easeOut(u)), f = 1 - ramp(t, b - 0.3, b);
  ctx.save(); ctx.globalAlpha = f * clamp(u * 2); ctx.translate(W / 2, 760); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = '900 130px Inter'; const w = ctx.measureText(text).width + 90;
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; rr(-w / 2, -105, w, 210, 28); ctx.fill();
  ctx.lineWidth = 16; ctx.strokeStyle = col; rr(-w / 2 + 14, -91, w - 28, 182, 20); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 8);
  ctx.restore();
}
export function card(x, y, w, h, t, a, b, draw) { // generic HUD card with pop
  if (t < a || t > b) return;
  const f = win(t, a, b, 0.3), k = back((t - a) / 0.4);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(15,18,24,0.9)'; rr(-w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.shadowColor = 'transparent';
  draw(f); ctx.restore();
}
// captions
const chunks = [];
for (const [id, s] of Object.entries(TL.segs)) {
  let cur = [];
  s.words.forEach((w, i) => {
    cur.push(w);
    if (/[.,!?:;]$/.test(w.w) || cur.length >= 3 || i === s.words.length - 1) { chunks.push(cur); cur = []; }
  });
}
chunks.forEach((c, i) => { c.t0 = c[0].s; c.t1 = (i + 1 < chunks.length && chunks[i + 1][0].s - c[c.length - 1].e < 0.6) ? chunks[i + 1][0].s : c[c.length - 1].e + 0.35; });
export function captions(t, y = 1185) {
  const c = chunks.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const size = 76; ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const sp = ctx.measureText(' ').width; const ws = c.map(w => ctx.measureText(w.w).width); const total = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  const pop = back(clamp((t - c.t0) / 0.18)); const sc = Math.min(1, (W - 80) / total);
  ctx.translate(W / 2, y); ctx.scale((0.85 + 0.15 * pop) * sc, (0.85 + 0.15 * pop) * sc);
  let x = -total / 2;
  c.forEach((w, i) => {
    const active = t >= w.s - 0.03 && (t < w.e || i === c.length - 1);
    ctx.lineWidth = 15; ctx.strokeStyle = '#000'; ctx.strokeText(w.w, x, 0);
    ctx.fillStyle = active ? BLUE : '#ffffff'; ctx.fillText(w.w, x, 0);
    x += ws[i] + sp;
  });
  ctx.restore();
}
const confetti = Array.from({ length: 140 }, (_, i) => ({ x: hash(i) * W, vy: 380 + hash(i + 3) * 600, vx: (hash(i + 7) - 0.5) * 300, r: hash(i + 11) * 6, c: ['#ffd60a', '#39ff4a', '#2f7bff', '#ff3b30', '#ff9f0a', '#fff'][i % 6], d: hash(i + 13) * 0.4 }));
export function drawConfetti(t, a) {
  if (t < a || t > a + 3.2) return;
  for (const c of confetti) {
    const u = t - a - c.d; if (u < 0) continue;
    ctx.save(); ctx.globalAlpha = 1 - ramp(t, a + 2.6, a + 3.2); ctx.translate(c.x + c.vx * u, -40 + c.vy * u + 200 * u * u); ctx.rotate(c.r + u * 6); ctx.fillStyle = c.c; ctx.fillRect(-9, -5, 18, 10); ctx.restore();
  }
}
function rewindFx(t) {
  if (t < tRew0 || t > tRew1) return;
  const f = win(t, tRew0, tRew1, 0.15);
  ctx.save(); ctx.globalAlpha = 0.25 * f; ctx.fillStyle = '#fff'; for (let y = (t * 900) % 16; y < H; y += 16) ctx.fillRect(0, y, W, 3); ctx.restore();
  ctx.save(); ctx.globalAlpha = f; ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(W / 2 - 230, 240, 460, 120, 22); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '900 70px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('◀◀  REWIND', W / 2, 302); ctx.restore();
}
// v2 HUD (Nov 13): quiz card A/B/C + comment prompt, slim labels, FAILED/PASSED stamps, no black first frame
const QZ = META.quiz || { options: ['?', '?', '?'], short: ['A', 'B', 'C'], wrong: 0, right: 2 };
const LET = ['A', 'B', 'C'];
export function quizCard(t, a, b, hi = -1, hiCol = RED, y = 600, prompt = true) {
  if (t < a || t > b) return; const f = win(t, a, b, 0.25), k = back((t - a) / 0.4);
  ctx.save(); ctx.globalAlpha = f; ctx.translate(W / 2, y); ctx.scale(k, k);
  const w = 900, rowH = 118, h = 150 + 3 * rowH + (prompt ? 96 : 10);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(12,14,20,0.9)'; rr(-w / 2, -h / 2, w, h, 40); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = YEL; ctx.font = '900 64px Inter'; ctx.fillText('WHAT DO YOU DO?', 0, -h / 2 + 72);
  QZ.options.forEach((o, i) => { const yy = -h / 2 + 150 + i * rowH + rowH / 2 - 6; const on = i === hi; const dim = hi >= 0 && !on;
    ctx.globalAlpha = f * (dim ? 0.35 : 1);
    ctx.fillStyle = on ? hiCol : 'rgba(255,255,255,0.1)'; rr(-w / 2 + 34, yy - rowH / 2 + 10, w - 68, rowH - 20, 26); ctx.fill();
    ctx.fillStyle = on ? '#fff' : [BLUE, '#ff9f0a', '#a855f7'][i]; rr(-w / 2 + 50, yy - 38, 76, 76, 20); ctx.fill();
    ctx.fillStyle = on ? hiCol : '#fff'; ctx.font = '900 54px Inter'; ctx.fillText(LET[i], -w / 2 + 88, yy + 2);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '900 50px Inter'; const sc = Math.min(1, 680 / ctx.measureText(o).width); ctx.save(); ctx.translate(-w / 2 + 156, yy + 2); ctx.scale(sc, sc); ctx.fillText(o, 0, 0); ctx.restore(); ctx.textAlign = 'center';
    if (on) { ctx.save(); ctx.translate(w / 2 - 80, yy); (hiCol === RED ? iconX : iconCheck)(0, 0, 26, '#fff'); ctx.restore(); } });
  ctx.globalAlpha = f;
  if (prompt) { const pa = 0.75 + 0.25 * Math.sin(t * 7); ctx.fillStyle = `rgba(255,59,48,${pa})`; rr(-300, h / 2 - 86, 600, 70, 35); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 40px Inter'; ctx.fillText('COMMENT  A,  B  OR  C!', 0, h / 2 - 50); }
  ctx.restore();
}
function standardHud(t) {
  const wrongA = win(t, S('wrong1').start - 0.1, tRew0, 0.3);
  if (wrongA > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.7);
    g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, `rgba(190,0,0,${0.22 * wrongA})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  const tagA = win(t, -1, S('hook2').end, 0.3);
  pill(`DRIVING TEST QUESTION #${META.q || 1}`, W / 2, 250, 'rgba(0,0,0,0.6)', '#fff', 40, tagA);
  const tQ = WT('hook2', 'What') - 0.05;
  quizCard(t, tQ, S('wrong1').start + 0.9, -1);
  quizCard(t, S('wrong1').start + 0.9 - 0.001, S('wrong1').end + 0.2, QZ.wrong, RED, 600, false);
  quizCard(t, S('right1').start, S('right1').end + 0.25, QZ.right, GREEN, 600, false);
  if (wrongA > 0 && t > S('wrong1').end) pill(QZ.short[QZ.wrong], W / 2, 250, RED, '#fff', 54, wrongA, back((t - S('wrong1').end) / 0.4), iconX);
  const rightA = win(t, S('right1').end + 0.1, S('outro').start - 0.2, 0.3);
  if (rightA > 0) pill(QZ.short[QZ.right], W / 2, 250, GREEN, '#fff', 54, rightA, back((t - S('right1').end - 0.1) / 0.4), iconCheck);
  stamp('FAILED', t, S('wrong4').start, tRew0 + 0.1, RED);
  stamp('PASSED', t, S('right7').start, S('outro').start - 0.1, GREEN, -0.08);
  drawConfetti(t, S('right7').start);
  const oa = win(t, S('outro').start - 0.1, TOTAL + 1, 0.4);
  if (oa > 0) {
    const k = back((t - S('outro').start) / 0.45), nx = META.next || ['NEXT', 'EPISODE'];
    ctx.save(); ctx.globalAlpha = oa; ctx.translate(W / 2, 600); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(12,14,20,0.9)'; rr(-450, -210, 900, 420, 40); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = YEL; ctx.font = '900 46px Inter'; ctx.fillText('NEXT QUESTION', 0, -130);
    ctx.fillStyle = '#fff'; ctx.font = '900 72px Inter';
    ctx.save(); const mw = Math.max(...nx.map(s => ctx.measureText(s).width)); const sc = Math.min(1, 820 / mw); ctx.scale(sc, sc);
    ctx.fillText(nx[0], 0, -30 / sc); ctx.fillText(nx[1], 0, 55 / sc); ctx.restore();
    const fa = ramp(t, WT('outro', 'Comment') - 0.1, WT('outro', 'Comment') + 0.3);
    ctx.globalAlpha = oa * fa; ctx.fillStyle = RED; rr(-300, 112, 600, 84, 42); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 40px Inter'; ctx.fillText(`COMMENT  ${LET[QZ.right]}  IF YOU KNEW IT`, 0, 156);
    ctx.restore();
  }
  const fade = ramp(t, TOTAL - 0.4, TOTAL);
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
}
export function pathLine(pointsWorld, alpha) {
  const pts = pointsWorld.map(v => project(v)); if (pts.length < 2 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0,80,0,0.35)'; ctx.lineWidth = 22; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
  ctx.strokeStyle = '#39ff4a'; ctx.lineWidth = 12; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
  ctx.restore();
}

// ---------------- frame driver ----------------
export function start(update, hud) {
  window.renderAt = (t, q = 0.9, clean = false) => {
    // rewind: replay the wrong-way part backwards at high speed instead of jumping
    const rewinding = t > tRew0 && t < tRew1;
    let tw = t;
    if (rewinding) { const u = (t - tRew0) / (tRew1 - tRew0); tw = lerp(tRew0 - 0.05, REW_TARGET, u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2); }
    update(tw);
    const _bg = GFX ? gfxPre() : null;
    if (composer) composer.render(); else renderer.render(scene, camera);
    if (_bg) scene.background = _bg;
    ctx.save();
    const rw = (t > tRew0 && t < tRew1) ? win(t, tRew0, tRew1, 0.15) : 0;
    ctx.filter = rw > 0 ? `grayscale(${0.7 * rw}) contrast(${1 + 0.25 * rw}) saturate(${1 - 0.5 * rw})` : (GFX ? `saturate(${GFXOPT.sat}) contrast(${GFXOPT.contrast})` : 'saturate(1.12) contrast(1.04)');
    if (_bg && GFXOPT.sky2d) gfxSky(_bg);
    ctx.drawImage(renderer.domElement, 0, 0);
    ctx.restore();
    gfxVignette();
    if (!clean) { rewindFx(t);
    if (!rewinding) hud(t);
    standardHud(t);
    captions(t); }
    return out.toDataURL('image/jpeg', q);
  };
  window.TOTAL = TOTAL;
  window.ready = true;
}
