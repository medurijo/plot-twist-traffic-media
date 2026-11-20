// =====================================================================
//  EP7 "COUNTING SHEEP" — bedroom, a fence, sheep #4, 500 sheep, a shepherd
// =====================================================================
const pose_ = (m, o) => { for (const k in o) m[k].r = o[k]; };
const A3 = (b, d) => [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
const yawOf = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
let late = [];
function pathTo(target) { const st = []; const dfs = n => { st.push(n); if (n === target) return true; for (const c of n.children) if (dfs(c)) return true; st.pop(); return false; }; dfs(scene); return st; }
function wp(target, off = [0, 0, 0]) { const ch = target._path || (target._path = pathTo(target)); let m = M4.ident(); for (const n of ch) m = M4.mul(m, M4.trs(n.p, n.r, n.s)); return [m[0] * off[0] + m[4] * off[1] + m[8] * off[2] + m[12], m[1] * off[0] + m[5] * off[1] + m[9] * off[2] + m[13], m[2] * off[0] + m[6] * off[1] + m[10] * off[2] + m[14]]; }

const BR = [100, 0, 100];
// ---------- textures ----------
texC('dusk', 512, 340, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a2a68'); g.addColorStop(.5, '#b45e7a'); g.addColorStop(.8, '#f0985a'); g.addColorStop(1, '#f6c77a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fff6d8'; x.beginPath(); x.arc(w * .3, h * .3, 22, 0, 6.283); x.fill(); for (let k = 0; k < 18; k++) { const bw = 20 + hsh(k, 1) * 40, bh = 30 + hsh(k, 2) * 120, bx_ = k * 30 - 10; x.fillStyle = '#2a2240'; x.fillRect(bx_, h - bh, bw, bh); x.fillStyle = '#ffd48a'; for (let j = 0; j < 6; j++) if (hsh(k, j + 9) > .5) x.fillRect(bx_ + 4 + (j % 2) * 10, h - bh + 8 + Math.floor(j / 2) * 16, 5, 7); } });
texC('clock3', 200, 90, (x, w, h) => { x.fillStyle = '#120a08'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff4a2a'; x.textAlign = 'center'; x.font = '700 70px "Courier 10 Pitch"'; x.fillText('3:07', w / 2, 70); });
texC('poster7', 200, 280, (x, w, h) => { x.fillStyle = '#2a3a6a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffd23a'; x.textAlign = 'center'; x.font = '900 34px "Inter Display"'; x.fillText('SLEEP', w / 2, 60); x.fillText('IS FOR', w / 2, 100); x.fillText('THE WEAK', w / 2, 140); x.fillStyle = '#fff'; x.beginPath(); x.arc(w / 2, 210, 40, 0, 6.283); x.fill(); x.fillStyle = '#2a3a6a'; x.beginPath(); x.arc(w / 2 + 18, 200, 36, 0, 6.283); x.fill(); });
for (let k = 1; k <= 5; k++) texC('sn' + k, 128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#e3263a'; x.textAlign = 'center'; x.font = '900 110px "Inter Display"'; x.fillText(String(k), w / 2, 104); });
// ---------- sheep ----------
function sheep(sc = 1, num = 0, simple = false) { const n = new Node(); n.s = [sc, sc, sc]; n._sc = sc; const b = new Node(); n.add(b); n.b = b;
  b.add(B('#f4f1ea', [0, .62, 0], [.62, .5, .82], { out: .02, spec: 0, rim: .3 })); if (!simple) for (let k = 0; k < 8; k++) b.add(B('#fbf8f2', [(hsh(k, 1) - .5) * .5, .78 + hsh(k, 2) * .14, (hsh(k, 3) - .5) * .7], [.26, .22, .26], { out: .015, spec: 0 }));
  n.legs = []; for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new Node(null, null, [sx * .18, .42, sz * .28]); lg.add(B('#1d1d22', [0, -.2, 0], [.09, .42, .09], { out: .01 })); b.add(lg); n.legs.push(lg); }
  const hd = new Node(null, null, [0, .78, .45]); b.add(hd); n.hd = hd; hd.add(B('#1d1d22', [0, 0, .1], [.26, .28, .3], { out: .02 })); hd.add(B('#fbf8f2', [0, .16, .04], [.3, .1, .24], { out: .01 }));
  for (const sx of [-1, 1]) hd.add(B('#1d1d22', [sx * .19, .06, .02], [.16, .06, .08], { out: .01 })); n.pup = [];
  if (!simple) for (const sx of [-1, 1]) { hd.add(B('#ffffff', [sx * .07, .05, .25], [.1, .1, .02], { out: 0 })); const pp = B('#111014', [sx * .07, .05, .265], [.045, .045, .01], { out: 0 }); hd.add(pp); n.pup.push(pp); }
  if (num) for (const sx of [-1, 1]) b.add(new Node('quad', { c: [1, 1, 1], tex: 'sn' + num, spec: 0, rim: 0, out: 0 }, [sx * .315, .62, 0], [.4, .4, 1], [0, sx * Math.PI / 2, 0]));
  scene.add(n); n.visible = false; return n; }
function sset(s, t, pos, yaw, o = {}) { s.visible = true; s.p = pos; s.r = [o.pitch || 0, yaw, o.roll || 0]; const w = o.walk || 0, ph = t * 13 + s._sc * 9;
  s.legs.forEach((lg, k) => lg.r = [o.legs ? o.legs[k] : Math.sin(ph + (k % 2 ? Math.PI : 0) + (k > 1 ? Math.PI : 0)) * .6 * w, 0, 0]); s.b.p = [0, Math.abs(Math.sin(ph)) * .04 * w, 0]; s.hd.r = o.hr || [Math.sin(t * 2 + pos[0]) * .08, Math.sin(t * 1.3 + pos[2] * 2) * .2, 0];
  const lk = o.look || [0, 0]; s.pup.forEach((pp, k) => pp.p = [(k ? 1 : -1) * .07 + lk[0] * .025, .05 - lk[1] * .025, .265]); }
const SN = [1, 2, 3, 4, 5].map(k => sheep(1, k)); const PSH = sheep(.9, 0, false); const CROWD = []; for (let k = 0; k < 70; k++) CROWD.push(sheep(.8 + hsh(k, 7) * .3, 0, k > 14));
// ---------- bedroom ----------
const br = new Node(); br.p = BR.slice(); D_(br, '#8a6a4a', [0, -.05, 0], [8, .1, 8], { c2: hex('#7a5a3a'), pat: 5, ps: 10 }); D_(br, '#3a3a5e', [0, 3.3, 0], [8, .1, 8], { out: 0 });
D_(br, '#6a7aa8', [0, 1.6, -2.4], [8, 3.4, .2]); br.add(new Node('quad', { c: hex('#6a7aa8'), tex: 'siding', spec: 0, rim: 0, out: 0 }, [0, 1.6, -2.295], [8, 3.4, 1])); for (const sx of [-1, 1]) D_(br, '#6a7aa8', [sx * 3.4, 1.6, 0], [.2, 3.4, 8]);
// window with curtains
br.add(new Node('quad', { c: [1, 1, 1], tex: 'dusk', spec: 0, rim: 0, out: 0, em: .85 }, [-3.29, 1.8, -.3], [1.6, 1.2, 1], [0, Math.PI / 2, 0])); D_(br, '#f4f1e8', [-3.27, 1.8, -.3], [.06, 1.25, .06], { out: 0 }); D_(br, '#f4f1e8', [-3.27, 1.8, -.3], [.06, .06, 1.65], { out: 0 });
for (const sz of [-1, 1]) D_(br, '#b04a5a', [-3.2, 1.75, -.3 + sz * .95], [.08, 1.9, .4], { c2: hex('#903a4a'), pat: 5, ps: 8 });
// bed
const bed = new Node(); bed.p = [0, 0, -.9]; br.add(bed); D_(bed, '#6a4a30', [0, .25, 0], [1.8, .3, 2.8]); D_(bed, '#f4f1e8', [0, .48, 0], [1.7, .2, 2.7]); D_(bed, '#6a4a30', [0, .75, -1.38], [1.9, 1.5, .1]);
const blanket = B('#3a7ac8', [0, .6, .45], [1.75, .1, 1.8], { c2: hex('#2a5aa0'), pat: 5, ps: 6 }); bed.add(blanket);
const pillow = B('#ffffff', [-.4, .66, -1.0], [.7, .16, .42], { out: .02 }); bed.add(pillow);
// nightstand, clock, lamp, wardrobe, poster, rug
D_(br, '#6a4a30', [1.4, .3, -1.9], [.5, .6, .45]); br.add(new Node('quad', { c: [1, 1, 1], tex: 'clock3', spec: 0, rim: 0, out: 0, em: .9 }, [1.35, .74, -1.75], [.3, .14, 1], [-.2, -.3, 0])); D_(br, '#1d1d22', [1.35, .7, -1.8], [.32, .16, .1], { out: 0 });
D_(br, '#e8d2a0', [1.55, .9, -2.0], [.1, .4, .1]); br.add(new Node('box', { c: [1, .85, .55], em: 1, out: 0, noShadow: 1 }, [1.55, 1.18, -2.0], [.3, .22, .3]));
const ward = new Node(); ward.p = [2.6, 0, .9]; D_(ward, '#8a5a3a', [0, 1.1, 0], [1.2, 2.2, .7]); D_(ward, '#6a4a2a', [0, 1.1, -.36], [.02, 2.0, .02], { out: 0 }); br.add(ward); ward.r = [0, -Math.PI / 2, 0];
const poster = new Node('quad', { c: [1, 1, 1], tex: 'poster7', spec: 0, rim: 0, out: 0 }, [-1.6, 1.9, -2.28], [.6, .84, 1]); br.add(poster);
D_(br, '#a8584a', [.2, .01, 1.0], [2.6, .02, 1.8], { c2: hex('#8a3a3a'), pat: 6, ps: 4, out: 0 });
// the fence at the foot of the bed
const FZ = 1.65; for (let k = 0; k < 7; k++) D_(br, '#f4f1e8', [-.9 + k * .3, .3, FZ], [.08, .6, .05]); D_(br, '#f4f1e8', [0, .42, FZ], [2.0, .06, .04]); D_(br, '#f4f1e8', [0, .2, FZ], [2.0, .06, .04]);
scene.add(br);
// ---------- shepherd ----------
const shep = man({ id: 'med2', shape: 'can', seed: 7, skin: SK.med2, shirt: '#7a8a4a', pants: '#5a4a3a', shoe: '#3a2a1a' }); scene.add(shep.root); shep.root.visible = false;
const straw = new Node(null, null, [0, .9, 0]); straw.add(cyl('#e8c86a', [0, 0, 0], [.95, .04, .95])); straw.add(cyl('#e8c86a', [0, .12, 0], [.46, .22, .46])); straw.add(cyl('#a83a2a', [0, .03, 0], [.47, .05, .47])); shep.head.add(straw);
const crook = new Node(null, null, [0, -.1, .06]); crook.add(B('#8a5a2a', [0, -.2, 0], [.05, 1.8, .05])); crook.add(B('#8a5a2a', [.1, .72, 0], [.25, .05, .05])); crook.add(B('#8a5a2a', [.22, .62, 0], [.05, .22, .05])); shep.armR.end.add(crook);
const feathers = []; for (let k = 0; k < 14; k++) { const q = B('#ffffff', [0, 0, 0], [.06, .015, .04], { out: 0 }); q.visible = false; scene.add(q); feathers.push(q); }
const HAT0 = hero.hat.p.slice();
let tod = t => ({ k: .42 }); let lighting = t => ({});
function argue(m, t, amt = 1, seed = 0) { const a = t * 17 + seed; m.sL.r = [-1.6 + Math.sin(a) * 1.2 * amt, 0, .4 + Math.sin(a * 1.3) * .6 * amt]; m.sR.r = [-1.6 + Math.sin(a + 2) * 1.2 * amt, 0, -.4 - Math.sin(a * 1.7) * .6 * amt]; m.eL.r = [-1.2 + Math.sin(a * 2.1) * .8, 0, 0]; m.eR.r = [-1.2 + Math.sin(a * 1.9 + 1) * .8, 0, 0];
  m.body.p = [0, Math.abs(Math.sin(a * .9)) * .18 * amt, 0]; m.body.r = [Math.sin(a * .7) * .2 * amt, Math.sin(a * .5) * .3 * amt, Math.sin(a * 1.1) * .12 * amt]; m.head.r = [Math.sin(a * 2.3) * .25, Math.sin(a * 1.6) * .35, 0]; m.wob = .3; }
// lying in bed: feet toward +z, head on the pillow
const LIE = A3(BR, [-.4, .72, -.9 + 1.25]); const SIT = A3(BR, [-.4, .72, -1.15]);
function sitUp(m) { m.root.p = SIT.slice(); m.root.r = [0, 0, 0]; m.body.p = [0, -.45, 0]; m.lL.r = [-1.5, 0, -.12]; m.lR.r = [-1.5, 0, .12]; m.lL.k = m.lR.k = .1; }
function lie(m, p = LIE) { if (m === hero) coverUp(); m.root.p = p.slice(); m.root.r = [-Math.PI / 2, 0, 0]; pose_(m, { sL: [0, 0, .15], sR: [0, 0, -.15] }); m.wob = .03; }
const jumpPos = (u) => A3(BR, [lerp(-2.4, 2.4, u), Math.max(0, Math.sin(clamp((u - .3) / .4) * Math.PI)) * .9, FZ + .45]);
const T_KICK = WD.kicked - .15, T_SLEEP = WD.asleep - .2;
// ---------- intro / loop close-up: lying awake, twitching eye ----------
function intro(t) { const h = hero; lie(h); let face = Math.sin(t * 3.1) > .85 ? 'half' : 'neutral'; if (t > WD.sleep - .1 && t < WD.sleep + .5) face = 'wide'; h.head.r = [0, 0, Math.sin(t * 1.7) * .05];
  if (Math.floor(t * 4) % 5 === 0) h.head.s = [1, 1.02, 1]; return face; }
function hideAll() { for (const m of [hero, shep]) { resetPose(m); m.root.visible = false; m.root.s = [1, 1, 1]; } hero.root.visible = true; hero.hat.p = HAT0.slice(); hero.head.s = [1, 1, 1]; [...SN, ...CROWD, PSH].forEach(s => s.visible = false); pillow.visible = true; pillow.s = [.7, .16, .42]; feathers.forEach(f => f.visible = false); puffs.forEach(p => p.visible = false); blanket.p = [0, .6, .45]; blanket.r = [0, 0, 0]; }
const coverUp = () => { blanket.p = [0, .92, .55]; blanket.s = [1.75, .1, 1.6]; };
function crowdFill(t, n, o = {}) { for (let k = 0; k < Math.min(n, CROWD.length); k++) { const s = CROWD[k]; const x = (hsh(k, 1) - .5) * 6.2, z = (hsh(k, 2) - .5) * 3.6 - .2; if (o.noBed && Math.abs(x + .1) < 1.1 && z < .6) continue; const _z = z, lay = Math.floor(k / 28); let y = lay * .55; if (Math.abs(x) < 1 && z > -2.3 && z < .5) y += .55;
    const pop = o.t0 !== undefined ? eback(clamp((t - o.t0 - hsh(k, 3) * o.spread) / .25)) : 1; if (pop <= 0) continue; sset(s, t + k, A3(BR, [x, y + (1 - pop) * 3, z]), hsh(k, 4) * 6.28 + (o.look ? 0 : Math.sin(t + k) * .3), { walk: o.sleep ? 0 : .3, look: [Math.sin(t * 2 + k), 0], hr: o.sleep ? [.5, 0, .3] : undefined });
    if (o.sleep) { s.r = [0, s.r[1], 1.4]; s.p[1] += .25; } if (o.bounce) s.p[1] += Math.abs(Math.sin(t * 9 + k)) * .15; } }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  if (i === 0) face = intro(t);
  if (i === 1 || i === 2) { lie(h); face = 'closed'; h.head.r = [0, 0, Math.sin(t * 2) * .05];
    const tj = [WD.one - .55, WD.two - .55, WD.three - .55]; SN.slice(0, 3).forEach((s, k) => { const u = (t - tj[k]) / 1.1; if (u < -.6 || u > 1.3) return; sset(s, t + k, jumpPos(clamp(u)), Math.PI / 2, { walk: 1, legs: u > .3 && u < .7 ? [-.9, -.9, .9, .9] : undefined, pitch: u > .3 && u < .7 ? -.3 + (u - .3) * 1.5 : 0 }); s.p[0] += u < 0 ? u * 2 : u > 1 ? (u - 1) * 3 : 0; }); }
  if (i === 3 || i === 4) { const s4 = SN[3]; const u = clamp((t - P[3]) / .8); const p4 = A3(BR, [lerp(-2.6, -.3, eout(u)), 0, FZ + .45]); sset(s4, t, p4, Math.PI / 2, { walk: u < 1 ? 1 : 0, look: [i === 4 ? -.6 : 0, 0], hr: i === 4 ? [0, -.9 * eout(clamp((t - WD.stood) / .8)), 0] : undefined });
    if (i === 3 && t < WD.not) { lie(h); face = 'closed'; } else { sitUp(h); if (i === 3) { argue(h, t, 1.4); face = 'scream'; h.body.p[1] -= .45; h.root.p[1] += Math.abs(Math.sin(t * 12)) * .15; } else { face = t < WD.staring ? 'wide' : 'worry'; pose_(h, { sL: [-1.0, 0, -.5], sR: [-1.0, 0, .5], eL: [-1.5, 0, 0], eR: [-1.5, 0, 0] }); } }
    }
  if (i === 5 || i === 6) { const s4 = SN[3]; const sp = A3(BR, [-.3, 0, FZ + .45]); const hp = A3(BR, [-1.35, 0, FZ + .45]);
    if (i === 5) { const u = clamp((t - P[5]) / 1.0); h.root.p = [lerp(LIE[0] - .2, hp[0], u), 0, lerp(LIE[2] - .4, hp[2], u)]; h.root.r = [0, Math.PI / 2, 0]; if (u < 1) walkPose(h, t, 10, .8); else { pose_(h, { sL: [-1.6, 0, .3], sR: [-1.6, 0, -.3], eL: [-.3, 0, 0], eR: [-.3, 0, 0] }); h.body.r = [.6, 0, Math.sin(t * 25) * .06]; h.lL.r = [.5, 0, 0]; h.lR.r = [-.7, 0, 0]; face = 'squint'; h.wob = .3; h.root.p[0] += Math.sin(t * 30) * .02; }
      sset(s4, t, sp, Math.PI / 2, { look: [-1, 0], hr: [0, -1.2, 0], legs: [.3, -.3, .3, -.3] }); if (u < 1) face = 'squint'; }
    else { const d = t - T_KICK; if (d < 0) { h.root.p = hp; h.root.r = [0, Math.PI / 2, 0]; pose_(h, { sL: [-1.6, 0, .3], sR: [-1.6, 0, -.3] }); h.body.r = [.6, 0, 0]; face = 'squint'; sset(s4, t, sp, Math.PI / 2, { hr: [0, -1.2, 0], look: [-1, 0] }); }
      else { const a = clamp(d / .55); sset(s4, t, sp, Math.PI / 2, { pitch: d < .3 ? .5 : 0, legs: d < .3 ? [0, 0, -1.4, -1.4] : undefined, hr: [0, -1.2, 0], look: [-1, 0] }); h.root.p = A3(BR, [lerp(-1.35, -3.0, eout(a)), Math.sin(a * Math.PI) * 1.4 + (a >= 1 ? 0 : 0), lerp(FZ + .45, -1.3, a)]); h.root.r = [a * 6, Math.PI / 2, a * 2]; pose_(h, { sL: [-2.8, 0, 1.0], sR: [-2.8, 0, -1.0] }); face = 'scream'; h.wob = .6; h.hat.p = [HAT0[0], HAT0[1] + Math.sin(a * Math.PI) * .8, 0];
        if (d > .55) { h.root.p = A3(BR, [-2.9, 0, -1.3]); h.root.r = [-1.45, 1.2, 0]; face = 'dizzy'; h.root.p[1] = .2; } burst(T_KICK + .02, t, A3(BR, [-1.1, 1.2, FZ + .45]), [1, 1, 1], 0, 10, .6, 2.5); burst(T_KICK + .55, t, A3(BR, [-3.0, .5, -1.3]), [.85, .82, .78], 10, 10, .7, 2); } } }
  if (i >= 7 && i <= 11) { h.root.p = A3(BR, [-2.9, .2, -1.3]); h.root.r = [-1.45, 1.2, 0]; face = 'dizzy'; pose_(h, { sL: [-.3, 0, 1.0], sR: [-.3, 0, -1.0] });
    if (i === 7) { const R5 = [[-2.0, -.3], [-1.8, -2.0], [-1.0, -1.4], [-2.4, .6], [-1.2, -.2]]; SN.forEach((s, k) => { const pop = eback(clamp((t - P[7] - k * .12) / .3)); if (pop <= 0) return; sset(s, t, A3(BR, [R5[k][0], (1 - pop) * 2, R5[k][1]]), yawOf(R5[k].concat([]).slice(0, 1).concat([0, R5[k][1]]), [-2.9, 0, -1.3]), { look: [0, .5] }); s.r[1] = Math.atan2(-2.9 - R5[k][0], -1.3 - R5[k][1]); }); face = t > P[7] + .6 ? 'wide' : 'dizzy'; }
    if (i === 8) { crowdFill(t, 26, { t0: P[8], spread: .9 }); SN.forEach((s, k) => sset(s, t, A3(BR, [-2.2 + k * .3, 0, -1.9 + (k % 2) * 1.6]), 2, { look: [0, .5] })); face = 'wide'; }
    if (i === 9) { crowdFill(t, 70, { bounce: 1 }); SN.forEach((s, k) => sset(s, t, A3(BR, [-2.2 + k * .3, .55, -1.9 + (k % 2) * 1.6]), 2 + t, { look: [Math.sin(t * 9), 0] })); h.root.p[1] = -.1; face = 'scream'; h.root.r = [-.6, 1.2, Math.sin(t * 20) * .2]; argue(h, t, 1.4); h.root.p = A3(BR, [-2.6, .55 + Math.abs(Math.sin(t * 9)) * .3, -1.0]); }
    if (i === 10) { crowdFill(t, 26, { noBed: 1 }); const u = clamp((t - P[10] - .1) / (pend(10) - P[10] - .2)); pillow.s = [.7 * (1 - u * .9), .16 * (1 - u * .5), .42 * (1 - u * .8)]; const s1 = SN[0]; sset(s1, t, A3(BR, [.45, .5, -1.9]), -Math.PI / 2, { hr: [.5, 0, 0] });
      feathers.forEach((f, k) => { const ph_ = ((t - P[10]) * 1.2 + k / 14) % 1; f.visible = true; f.p = A3(BR, [-.4 + Math.sin(k * 2.1 + t) * (.3 + ph_), 1.2 + ph_ * 1.5, -1.9 + Math.cos(k * 1.3) * .5]); f.r = [t * 3 + k, k, t * 2]; }); h.root.p = A3(BR, [-2.6, 1.0, -1.0]); h.root.r = [0, 1.2, 0]; pose_(h, { sL: [-.5, 0, .4], sR: [-.5, 0, -.4] }); face = 'worry'; }
    if (i === 11) { crowdFill(t, 70); pillow.visible = false; h.root.p = A3(BR, [-2.6, .9, -1.0]); h.root.r = [0, 1.1, 0]; phonePose(h); face = Math.sin(t * 22) > 0 ? 'talksq' : 'scream'; h.wob = .3; h.body.p = [0, Math.abs(Math.sin(t * 13)) * .1, 0]; } }
  if (i === 12) { pillow.visible = false; crowdFill(t, 12, { noBed: 1 }); h.root.p = A3(BR, [-2.6, .9, -1.0]); h.root.r = [0, 1.1, 0]; face = 'wide'; shep.root.visible = true; const d = t - P[12];
    if (t < T_SLEEP) { const u = clamp(d / .7); shep.root.p = A3(BR, [lerp(2.9, 1.25, u), 0, lerp(.4, -.2, u)]); shep.root.r = [0, -1.6, 0]; if (u < 1) walkPose(shep, t, 9, .7); pose_(shep, { sR: [-1.2, 0, -.2], eR: [-.4, 0, 0] }); setFace(shep, u < 1 ? 'neutral' : 'half'); shep.head.r = [0, Math.sin(t * 6) * .4, 0]; }
    else { const a = eout(clamp((t - T_SLEEP) / .5)); shep.root.p = A3(BR, [1.25, 0, -.2]); shep.root.r = [1.2 * a, -1.6, 0]; setFace(shep, 'closed'); pose_(shep, { sR: [-.3, 0, -.6], sL: [-.3, 0, .6] }); } }
  if (i === 13) { pillow.visible = false; crowdFill(t, 70, { sleep: 1 }); h.root.p = A3(BR, [-2.6, .9, -1.0]); h.root.r = [0, 1.1, 0]; face = 'squint'; shep.root.visible = true; lie(shep, A3(BR, [.4, .62, .35])); setFace(shep, 'closed'); shep.body.p = [0, 0, Math.sin(t * 3) * .02]; }
  if (i === 14) { pillow.visible = false; crowdFill(t, 70, { sleep: 1 }); shep.root.visible = true; lie(shep, A3(BR, [.4, .62, .35])); setFace(shep, 'closed'); shep.root.r[2] = .2; sset(PSH, t, A3(BR, [-.4, .5, -1.95]), Math.PI / 2, { hr: [.5, 0, .3] }); PSH.r = [0, Math.PI / 2, 1.4]; PSH.p[1] += .2; face = intro(t - T_END); }
  setFace(h, face); for (const m of [hero, shep]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
