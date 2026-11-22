// =====================================================================
//  EP13 "THE NOISE COMPLAINT" — the clock was too loud. The cops were louder.
// =====================================================================
const pose_ = (m, o) => { for (const k in o) m[k].r = o[k]; };
const A3 = (b, d) => [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
const yawOf = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
let late = [];
function pathTo(target) { const st = []; const dfs = n => { st.push(n); if (n === target) return true; for (const c of n.children) if (dfs(c)) return true; st.pop(); return false; }; dfs(scene); return st; }
function wp(target, off = [0, 0, 0]) { const ch = target._path || (target._path = pathTo(target)); let m = M4.ident(); for (const n of ch) m = M4.mul(m, M4.trs(n.p, n.r, n.s)); return [m[0] * off[0] + m[4] * off[1] + m[8] * off[2] + m[12], m[1] * off[0] + m[5] * off[1] + m[9] * off[2] + m[13], m[2] * off[0] + m[6] * off[1] + m[10] * off[2] + m[14]]; }
function argue(m, t, amt = 1, seed = 0) { const a = t * 17 + seed; m.sL.r = [-1.6 + Math.sin(a) * 1.2 * amt, 0, .4 + Math.sin(a * 1.3) * .6 * amt]; m.sR.r = [-1.6 + Math.sin(a + 2) * 1.2 * amt, 0, -.4 - Math.sin(a * 1.7) * .6 * amt]; m.eL.r = [-1.2 + Math.sin(a * 2.1) * .8, 0, 0]; m.eR.r = [-1.2 + Math.sin(a * 1.9 + 1) * .8, 0, 0];
  m.body.p = [0, Math.abs(Math.sin(a * .9)) * .18 * amt, 0]; m.body.r = [Math.sin(a * .7) * .2 * amt, Math.sin(a * .5) * .3 * amt, Math.sin(a * 1.1) * .12 * amt]; m.head.r = [Math.sin(a * 2.3) * .25, Math.sin(a * 1.6) * .35, 0]; m.wob = .3; }
const runPose = (h, t, sp = 26) => { walkPose(h, t, sp, 1.1); h.body.p = [0, Math.abs(Math.sin(t * sp)) * .14, 0]; h.body.r = [.25, 0, 0]; };
const ears = (m, t, j = 0) => { pose_(m, { sL: [0, 0, 2.4 + Math.sin(t * 30) * j], eL: [0, 0, -2.3], sR: [0, 0, -2.4 - Math.sin(t * 30) * j], eR: [0, 0, 2.3] }); };
lamp.p = [-4.6, 0, 1.4]; scene.children.forEach(n => { if (n.p && n.p[0] > 5.2 && n.p[0] < 8.7 && n.p[2] > -2.3 && n.p[2] < -1.5) n.p = [n.p[0] + 5.2, n.p[1], n.p[2]]; });
const HP = [2.5, 0, -1.1], HY = .3, CK = [6.9, 0, -3.7], CKY = -.4, TB = [3.75, 0, -1.95];
const PC1 = [0.0, 0, 3.4], PC2 = [6.2, 0, 3.4], COP1 = [0.9, 0, -.45], COP2 = [5.4, 0, .2], COP3 = [6.2, 0, 1.55];
// ---------- grandfather clock ----------
texC('ckface', 256, 256, (x, w, h) => { x.fillStyle = '#f6efdc'; x.beginPath(); x.arc(128, 128, 126, 0, 6.283); x.fill(); x.strokeStyle = '#1b1b20'; x.lineWidth = 8; x.stroke(); x.fillStyle = '#1b1b20'; x.font = '700 30px "Courier 10 Pitch"'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let k = 1; k <= 12; k++) { const a = k / 12 * 6.283; x.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][k - 1], 128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); } });
const CKN = new Node(); CKN.p = CK.slice(); CKN.r = [0, CKY, 0]; scene.add(CKN);
D_(CKN, '#6b3a22', [0, 1.5, 0], [1.0, 3.0, .6], { spec: .4, rim: .1 }); D_(CKN, '#5a2e1a', [0, .1, 0], [1.2, .2, .75]); D_(CKN, '#5a2e1a', [0, 3.05, 0], [1.2, .14, .72]); D_(CKN, '#7a4a2a', [0, 3.3, 0], [.7, .4, .5]); D_(CKN, '#e0b23c', [0, 3.6, 0], [.18, .18, .18], { spec: 1 });
CKN.add(new Node('circ', { c: [1, 1, 1], tex: 'ckface', spec: .1, rim: 0, out: 0 }, [0, 2.45, .305], [.84, .84, 1])); D_(CKN, '#e0b23c', [0, 2.45, .3], [.92, .92, .01], { spec: 1, out: 0 });
const HH = new Node(null, null, [0, 2.45, .32]), HM = new Node(null, null, [0, 2.45, .325]); HH.add(B('#1b1b20', [0, .13, 0], [.05, .26, .01], { out: 0 })); HM.add(B('#1b1b20', [0, .18, 0], [.035, .36, .01], { out: 0 })); CKN.add(HH, HM);
D_(CKN, '#2a1a12', [0, 1.15, .29], [.66, 1.6, .02], { out: 0 }); const PEN = new Node(null, null, [0, 1.85, .27]); CKN.add(PEN); PEN.add(B('#e0b23c', [0, -.45, 0], [.04, .9, .02], { out: 0, spec: 1 })); PEN.add(new Node('cyl', { c: hex('#e0b23c'), spec: 1.2, rim: .4, out: .005 }, [0, -.92, 0], [.28, .04, .28], [Math.PI / 2, 0, 0]));
CKN.add(new Node('box', { c: [.8, .9, 1], a: .18, spec: 1.2, rim: .4, out: 0, noShadow: 1 }, [0, 1.15, .31], [.68, 1.62, .01]));
function clock(t, amp = .35, sh = 0) { PEN.r = [0, 0, Math.sin(t * Math.PI) * amp]; HM.r = [0, 0, -t * .2]; HH.r = [0, 0, -1.1 - t * .02]; CKN.r = [0, CKY, Math.sin(t * 31) * sh * .03]; CKN.p = [CK[0], Math.abs(Math.sin(t * 15)) * sh * .05, CK[2]]; }
// ---------- cars, cops, bin ----------
const pcar2 = car({ body: '#f4f4f0', top: '#1d1d22', stripe: '#2b3a55' }); scene.add(pcar2.root);
for (const [k, v] of Object.entries({ scream: { e: 'wide', m: 'open' }, grin: { m: 'grin' }, dizzy: { e: 'closed', m: 'o' }, up: { ly: -1.2 } })) faceTex('cop2_' + k, LAY.cop2, v);
const cop2 = man({ id: 'cop2', shape: 'wide', neck: .22, seed: 37, skin: SK.hero, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1, pocket: '#31496b' }); scene.add(cop2.root);
const cop3 = man({ id: 'cop', shape: 'wide', neck: .34, seed: 53, skin: SK.cop, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1 }); scene.add(cop3.root);
const BIN = new Node(); BIN.p = TB.slice(); scene.add(BIN); D_(BIN, '#3c6e4a', [0, .55, 0], [.66, 1.1, .62], { spec: .3, rim: .1 }); for (const z of [-.2, .2]) D_(BIN, '#2f5a3a', [0, .55, .315], [.5, .04, .01], { out: 0 });
D_(BIN, '#1d1d22', [-.24, .12, -.35], [.1, .24, .24]); D_(BIN, '#1d1d22', [.24, .12, -.35], [.1, .24, .24]);
const LID = new Node(null, null, [0, 1.1, -.31]); BIN.add(LID); D_(LID, '#2f5a3a', [0, .04, .31], [.72, .08, .68], { spec: .3 }); D_(LID, '#2f5a3a', [0, .1, .55], [.2, .05, .06]);
const BL = [new Node('box', { c: [1, .25, .25], em: 1, out: 0, noShadow: 1 }, [-.15, 1.0, 0], [.22, .14, .22]), new Node('box', { c: [.3, .45, 1], em: 1, out: 0, noShadow: 1 }, [.15, 1.0, 0], [.22, .14, .22])]; BL.forEach(n => BIN.add(n));
const SL = []; for (let k = 0; k < 4; k++) { const n = new Node('box', { c: k % 2 ? [.3, .45, 1] : [1, .25, .25], em: .9, out: .01, noShadow: 1 }, [0, 0, 0], [.6, .16, .3]); scene.add(n); SL.push(n); }
const CUFF = new Node(); CUFF.add(new Node('cyl', { c: hex('#c8ccd6'), spec: 1, out: .005 }, [-.12, 0, 0], [.16, .03, .16])); CUFF.add(new Node('cyl', { c: hex('#c8ccd6'), spec: 1, out: .005 }, [.12, 0, 0], [.16, .03, .16])); CUFF.add(B('#c8ccd6', [0, 0, 0], [.12, .02, .02], { out: 0 })); scene.add(CUFF);
const hatP0 = hero.hat.p.slice();
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- timing ----------
const T_PH1 = WD.called - .25, T_C1 = WD.came - .35, T_BLOW = WD.fucking1 - .05, T_PH2 = WD.called2 - .2, T_C2 = WD.fucking2 - .3, T_RUN2 = WD.came2 - .45, T_LOUD = WD.louder2 - .05, T_ST = WD.stole - .12, T_LID = WD.hid - .1, T_SLAM = WD.can - .05, T_SCR = WD.fucking3 - .05, T_CUFF = WD.arrested + .05, T_DRIVE = WD.can2 - .25, T_EYE = WD.heard - .1, T_TICK = WD.tick;
const lightsOn = t => t > T_C1 + .2 && t < T_ST + .35;
const lights2On = t => t > T_C2 + .2 && t < T_ST + .95;
function carLights(c, t, on) { c.l1.visible = c.l2.visible = on; c.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; c.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; }
// ---------- loop intro (t<0 = last line) ----------
function idle(h) { pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); }
const LIEP = A3(HP, [-1.15, .17, 0]);
function lie(h, t) { h.root.p = LIEP.slice(); h.root.r = [-Math.PI / 2, Math.PI / 2, 0]; pose_(h, { sL: [-2.9, 0, .9], eL: [-1.6, 0, 0], sR: [-2.9, 0, -.9], eR: [-1.6, 0, 0] }); h.lL.r = [0, 0, -.1]; h.lR.r = [.3, 0, .2]; h.lR.k = .8; h.wob = .03; }
function intro(t) { const h = hero; let face = 'squint'; h.root.p = HP.slice(); h.root.r = [0, HY, 0]; idle(h);
  if (t < -.65) { lie(h, t); face = 'wide'; h.head.r = [0, .5, 0]; return face; }
  if (t < -.15) { const u = eout((t + .65) / .5); h.root.p = lerp3(LIEP, HP, u); h.root.p[1] += Math.sin(u * Math.PI) * .6; h.root.r = [-Math.PI / 2 * (1 - u), lerp(Math.PI / 2, HY, u), 0]; pose_(h, { sL: [-2.6, 0, .7], sR: [-2.6, 0, -.7] }); h.wob = .5; return 'scream'; }
  if (t < 0) return 'squint';
  h.head.r = [0, -.55, 0]; face = Math.sin(t * Math.PI * 2) > .7 ? 'half' : 'squint'; if (t > WD.loud - .1) { ears(h, t, .15); face = 'talksq'; h.body.r = [0, 0, Math.sin(t * 20) * .05]; } return face; }
function hideAll() { for (const m of [hero, cop, cop2, cop3]) { resetPose(m); m.root.visible = false; m.root.s = [1, 1, 1]; m.body.s = [1, 1, 1]; m.body.r = [0, 0, 0]; } hero.root.visible = true; puffs.forEach(p => p.visible = false);
  SL.forEach(s => s.visible = false); CUFF.visible = false; BIN.p = TB.slice(); BIN.r = [0, 0, 0]; BIN.visible = true; LID.r = [0, 0, 0]; BL.forEach(b => b.visible = false); hero.hat.p = hatP0.slice();
  pcar.root.visible = pcar2.root.visible = false; pcar.root.r = [0, Math.PI / 2, 0]; pcar2.root.r = [0, -Math.PI / 2, 0]; pcar.root.p = PC1.slice(); pcar2.root.p = PC2.slice(); for (const c of [pcar, pcar2]) c.l1.visible = c.l2.visible = true; }
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'squint';
  const loud = (i >= 2 && i <= 6) ? (i >= 5 ? 1 : .6) : 0; clock(t, .35, i === 13 || t < 0 ? .4 : 0); h.root.p = HP.slice(); h.root.r = [0, HY, 0];
  // police cars
  if (i >= 2 && i <= 10) { pcar.root.visible = true; if (i === 2) { const u = eout(clamp((t - T_C1) / .6)); pcar.root.p = [lerp(-30, PC1[0], u), 0, PC1[2]]; pcar.root.r = [0, Math.PI / 2 + (u < 1 ? Math.sin(u * 9) * .12 * (1 - u) : 0), 0]; }
    carLights(pcar, t, lightsOn(t)); }
  if (i >= 5 && i <= 10) { pcar2.root.visible = true; if (i === 5) { const u = eout(clamp((t - T_C2) / .55)); pcar2.root.p = [lerp(36, PC2[0], u), 0, PC2[2]]; pcar2.root.r = [0, -Math.PI / 2 - (u < 1 ? Math.sin(u * 9) * .15 * (1 - u) : 0), 0]; } carLights(pcar2, t, lights2On(t)); }
  if (i === 10) { const d = t - T_DRIVE; if (d > 0) { pcar.root.p = [PC1[0] + d * d * 22, 0, PC1[2]]; pcar2.root.p = [PC2[0] + 1.5 + d * d * 26, 0, PC2[2]]; pcar2.root.r = [0, Math.PI / 2, 0]; } }
  // cop1
  if (i >= 2 && i <= 10) { cop.root.visible = true; cop.root.p = COP1.slice(); cop.root.r = [0, yawOf(COP1, HP), 0]; setFace(cop, 'squint'); idle(cop);
    if (i === 2) { const d = t - T_C1 - .55; cop.root.visible = d > 0; const a = clamp(d / .45); cop.root.p = lerp3(A3(PC1, [.4, 0, -1.2]), COP1, a); if (a < 1) { runPose(cop, t, 30); setFace(cop, 'scream'); } else { pose_(cop, { sR: [-2.6, 0, -.9], eR: [-1.9, 0, 0] }); setFace(cop, 'grin'); } } }
  if (i >= 5 && i <= 10) { cop2.root.visible = true; cop2.root.p = COP2.slice(); cop2.root.r = [0, yawOf(COP2, HP), 0]; setFace(cop2, 'squint'); idle(cop2); cop3.root.visible = true; cop3.root.p = COP3.slice(); cop3.root.r = [0, yawOf(COP3, HP), 0]; setFace(cop3, 'neutral'); idle(cop3); }
  if (i === 0 || i === 1) face = intro(t);
  if (i === 1) { const d = t - T_PH1; h.head.r = [0, -.2, 0]; if (d > 0) { phonePose(h); face = Math.sin(t * 16) > 0 ? 'talk' : 'talksq'; h.body.r = [0, 0, Math.sin(t * 5) * .06]; } }
  if (i === 2) { idle(h); face = t < T_C1 + .3 ? 'neutral' : 'grin'; h.head.r = [0, .3, 0]; if (t > T_C1 + .4) { face = 'worry'; h.head.r = [0, .4, 0]; } }
  if (i === 3) { const d = t - T_BLOW; if (d < 0) { idle(h); face = 'worry'; h.head.r = [0, .3, 0]; ears(h, t, .1); } else { ears(h, t, .3); face = Math.sin(t * 24) > 0 ? 'scream' : 'dizzy'; const k = clamp(d / .15); h.root.p = A3(HP, [-.35 * k, Math.abs(Math.sin(t * 9)) * .2, -.25 * k]); h.body.r = [-.45 * k, 0, Math.sin(t * 20) * .12]; h.wob = .6; h.hat.p = A3(hatP0, [0, Math.max(0, Math.sin(clamp(d / 1.0) * Math.PI)) * 1.4, 0]); }
    setFace(cop, d > 0 ? 'scream' : 'grin'); if (d > 0) { ears(cop, t, .2); cop.body.r = [-.3, 0, 0]; } }
  if (i === 4) { phonePose(h); face = Math.sin(t * 18) > 0 ? 'talksq' : 'squint'; h.root.r = [0, HY - .3, 0]; h.body.r = [0, 0, Math.sin(t * 7) * .1]; h.root.p[1] = Math.abs(Math.sin(t * 8)) * .12; setFace(cop, t > WD.on ? 'wide' : 'squint'); cop.head.r = [0, 0, t > WD.on ? .2 : 0]; if (t > WD.cops2) pose_(cop, { sR: [-2.0, 0, -.3], eR: [-.4, 0, 0] }); }
  if (i === 5) { ears(h, t, .2); face = 'scream'; h.head.r = [0, .5, 0]; setFace(cop, 'wide'); h.root.p[1] = Math.abs(Math.sin(t * 10)) * .2;
    const d = t - T_C2 - .25; cop3.root.visible = d > 0; if (d > 0) { const u = clamp(d / .7); const s0 = A3(PC2, [0, 1.4, -.8]); if (u < 1) { cop3.root.p = [lerp(s0[0], COP3[0], u), s0[1] + Math.sin(u * Math.PI) * 1.4 - s0[1] * u, lerp(s0[2], COP3[2], u)]; cop3.root.r = [u * 9, 0, u * 3]; setFace(cop3, 'scream'); pose_(cop3, { sL: [-2.8, 0, .8], sR: [-2.8, 0, -.8] }); cop3.wob = .7; runPose(cop3, t, 30); }
      else { cop3.root.p = A3(COP3, [0, .17, 0]); cop3.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; setFace(cop3, 'dizzy'); cop3.lL.r = [Math.sin(t * 20) * .3, 0, 0]; burst(T_C2 + .95, t, COP3, [.85, .8, .72], 0, 8, 1.2, .8); } }
    const e = t - T_RUN2; cop2.root.visible = e > 0; if (e > 0) { const a = clamp(e / .45); cop2.root.p = [lerp(-26, COP2[0], eout(a)), 0, COP2[2]]; if (a < .85) { cop2.root.r = [0, Math.PI / 2, 0]; runPose(cop2, t, 46); pose_(cop2, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); setFace(cop2, 'scream'); cop2.wob = .7; } else { cop2.root.r = [0, Math.PI / 2, -.12]; cop2.body.r = [-.35, 0, 0]; pose_(cop2, { sL: [-1.6, 0, .9], sR: [-1.6, 0, -.9] }); setFace(cop2, 'wide'); } burst(T_RUN2 + .35, t, A3(COP2, [-.6, .15, 0]), [.85, .8, .72], 8, 16, 1.4, 1.0); } }
  if (i === 6) { ears(h, t, .3); face = Math.sin(t * 30) > 0 ? 'dizzy' : 'scream'; h.root.r = [0, HY + Math.sin(t * 20) * .3, 0]; h.root.p[1] = Math.abs(Math.sin(t * 12)) * .3; h.wob = .6;
    for (const c of [cop, cop2, cop3]) { ears(c, t, .2); setFace(c, c === cop2 ? 'scream' : (c === cop3 ? 'dizzy' : 'scream')); c.body.r = [Math.sin(t * 25) * .1, 0, Math.sin(t * 19) * .1]; } cop3.root.p = A3(COP3, [0, .17, 0]); cop3.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; ears(cop3, t, .3);
    burst(T_LOUD + .1, t, [9.0, 2.3, -6.9], [.8, .9, 1], 0, 8, 1.2, 2); burst(T_LOUD + .1, t, [.6, 2.3, -6.9], [.8, .9, 1], 8, 16, 1.2, 2); }
  if (i === 7) { const d = t - T_ST; for (const c of [cop, cop2, cop3]) { setFace(c, 'wide'); c.root.r = [0, yawOf(c.root.p, h.root.p), 0]; } cop3.root.p = A3(COP3, [0, .17, 0]); cop3.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; setFace(cop3, 'dizzy');
    const W1 = A3(PC1, [.75, 1.36, 0]), W2 = A3(PC2, [-.75, 1.36, 0]), WB = A3(TB, [-.8, 0, .35]); const arc = u => Math.sin(u * Math.PI) * 1.2; let p = HP, n = 0; const seg = (a, b, t0, t1) => clamp((d - t0) / (t1 - t0));
    if (d < 0) { idle(h); face = 'squint'; } else { if (d < .25) { const u = seg(0, 0, 0, .25); p = lerp3(HP, W1, eio(u)); p[1] += arc(u); } else if (d < .5) { p = W1; n = 2; } else if (d < .85) { const u = seg(0, 0, .5, .85); p = lerp3(W1, W2, eio(u)); p[1] += arc(u); n = 2; } else if (d < 1.1) { p = W2; n = 4; } else { const u = seg(0, 0, 1.1, 1.55); p = lerp3(W2, WB, eio(u)); p[1] += arc(u); n = 4; }
      h.root.p = p.slice(); const moving = d < .25 || (d > .5 && d < .85) || d > 1.1 && d < 1.55; if (moving) { runPose(h, t, 40); h.wob = .7; face = 'scream'; h.root.r = [0, Math.PI / 2 * (d > .5 && d < .85 ? 1 : (d > 1.1 ? -1 : 1)), 0]; } else { face = 'grin'; h.root.r = [0, Math.PI, 0]; pose_(h, { sL: [-2.9, 0, .4 + Math.sin(t * 30) * .3], sR: [-2.9, 0, -.4] }); h.root.p[1] = Math.abs(Math.sin(t * 20)) * .25; }
      if (d > .3) pcar.l1.visible = pcar.l2.visible = false; if (d > .9) pcar2.l1.visible = pcar2.l2.visible = false;
      for (let k = 0; k < n; k++) { SL[k].visible = true; late.push(() => { const b = wp(hero.body, [0, 1.55 + k * .17, .35]); SL[k].p = b; SL[k].r = [0, hero.root.r[1] + k * .2, 0]; SL[k].mat.em = Math.sin(t * 18 + k * 1.6) > 0 ? 1 : .3; }); }
      if (!moving) pose_(h, { sL: [-2.9, 0, .4 + Math.sin(t * 30) * .3], sR: [-2.9, 0, -.4] }); else pose_(h, { sL: [-1.4, 0, .5], eL: [-1.4, 0, 0], sR: [-1.4, 0, -.5], eR: [-1.4, 0, 0] }); } }
  if (i >= 7 && i <= 10) { pcar.l1.visible = pcar.l2.visible = i === 7 && t < T_ST + .3; pcar2.l1.visible = pcar2.l2.visible = i === 7 && t < T_ST + .9; }
  const WB = A3(TB, [-.8, 0, .35]);
  if (i === 8) { h.root.p = WB.slice(); h.root.r = [0, .45, 0]; for (const c of [cop, cop2]) setFace(c, 'wide'); cop3.root.p = A3(COP3, [0, .17, 0]); cop3.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; setFace(cop3, 'dizzy');
    const d = t - T_LID, e = t - T_SLAM; LID.r = [d < 0 ? 0 : (e < 0 ? -1.9 * clamp(d / .2) : -1.9 * (1 - clamp(e / .1))), 0, 0]; face = e < 0 ? 'grin' : 'grinup';
    for (let k = 0; k < 4; k++) { const k0 = d - .2 - k * .2; if (k0 > .3) continue; SL[k].visible = true; const a = clamp(k0 / .3); late.push(() => { const b = wp(hero.body, [0, 1.55 + k * .17, .35]); SL[k].p = lerp3(b, A3(TB, [0, .8, 0]), a); SL[k].r = [a * 3, hero.root.r[1], 0]; SL[k].mat.em = Math.sin(t * 18 + k) > 0 ? 1 : .3; }); }
    if (d > 0 && e < 0) { pose_(h, { sL: [-1.2 + Math.abs(Math.sin(t * 12)) * .5, 0, 1.1], sR: [-1.4, 0, -.4] }); } if (e > 0) { pose_(h, { sL: [-.6, 0, 1.3], eL: [-.6, 0, 0] }); BIN.r = [0, 0, Math.sin(t * 30) * .06]; } }
  if (i === 9) { const d = t - T_SCR; const a = d < 0 ? .4 : 1; BIN.p = A3(TB, [0, Math.abs(Math.sin(t * 13)) * .35 * a, 0]); BIN.r = [Math.sin(t * 17) * .12 * a, Math.sin(t * 7) * .2 * a, Math.sin(t * 23) * .15 * a]; LID.r = [-Math.abs(Math.sin(t * 15)) * .7 * a, 0, 0]; BL.forEach((b, k) => { b.visible = true; b.mat.em = Math.sin(t * 18 + k * 3.14) > 0 ? 1 : .2; });
    h.root.p = WB.slice(); h.root.r = [0, .45, 0]; if (d < 0) { pose_(h, { sL: [-.6, 0, 1.3], eL: [-.3, 0, 0] }); face = 'worry'; } else { ears(h, t, .3); face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.root.p[1] = Math.abs(Math.sin(t * 11)) * .3; h.wob = .6; }
    for (const c of [cop, cop2]) { ears(c, t, .25); setFace(c, 'scream'); c.root.r = [0, yawOf(c.root.p, TB), 0]; c.body.r = [Math.sin(t * 20) * .1, 0, Math.sin(t * 17) * .1]; } cop3.root.p = A3(COP3, [0, .17, 0]); cop3.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; setFace(cop3, 'dizzy'); ears(cop3, t, .3); }
  if (i === 10) { const d = t - T_CUFF; h.root.p = WB.slice(); h.root.r = [0, .5, 0]; idle(h); face = d > 0 ? 'wide' : 'worry'; h.head.r = [0, .3, 0]; cop3.root.p = A3(COP3, [0, .17, 0]); cop3.root.r = [-Math.PI / 2, -Math.PI / 2, 0]; setFace(cop3, 'dizzy');
    const CB = A3(TB, [.1, 0, .85]); BL.forEach((b, k) => { b.visible = true; b.mat.em = Math.sin(t * 18 + k * 3.14) > 0 ? 1 : .2; }); LID.r = [-Math.abs(Math.sin(t * 15)) * .3, 0, 0]; BIN.p = A3(TB, [0, Math.abs(Math.sin(t * 13)) * .08, 0]);
    if (d < -.6) { const a = clamp((t - P[10]) / .3); cop.root.p = lerp3(COP1, CB, eio(a)); cop.root.r = [0, yawOf(COP1, CB), 0]; if (a < 1) runPose(cop, t, 30); setFace(cop, 'squint'); }
    else if (t < T_DRIVE - .6) { cop.root.p = CB; cop.root.r = [0, Math.PI, 0]; setFace(cop, 'squint'); pose_(cop, { sL: [-1.4, 0, .3], sR: [-1.4, 0, -.3], eL: [-.4, 0, 0], eR: [-.4, 0, 0] }); if (d > 0) { CUFF.visible = true; late.push(() => { CUFF.p = wp(BIN, [0, .7, .33]); CUFF.r = [Math.PI / 2, 0, 0]; }); } }
    else { const a = clamp((t - (T_DRIVE - .6)) / .55); const tgt = A3(PC1, [-.3, 0, -1.0]); cop.root.p = lerp3(CB, tgt, a); cop.root.r = [0, yawOf(CB, tgt), 0]; runPose(cop, t, 26); pose_(cop, { sL: [-2.9, 0, .5], sR: [-2.9, 0, -.5] }); setFace(cop, 'grin'); BIN.p = A3(cop.root.p, [0, 2.15 + Math.abs(Math.sin(t * 13)) * .1, 0]); BIN.r = [Math.sin(t * 9) * .2, 0, Math.sin(t * 11) * .2]; CUFF.visible = true; late.push(() => { CUFF.p = wp(BIN, [0, .7, .33]); CUFF.r = [Math.PI / 2, 0, 0]; });
      if (a >= 1) { cop.root.visible = BIN.visible = CUFF.visible = false; } }
    if (t > T_DRIVE - .2) { cop.root.visible = BIN.visible = CUFF.visible = false; }
    for (const c of [cop2, cop3]) { if (t > T_DRIVE - .7) { const a = clamp((t - (T_DRIVE - .7)) / .4); const tgt = A3(PC2, [-.8, 0, -1.0]); c.root.p = lerp3(c === cop2 ? COP2 : COP3, tgt, a); c.root.r = [0, yawOf(c.root.p, tgt), 0]; runPose(c, t, 34); setFace(c, 'scream'); if (a >= 1) c.root.visible = false; } }
    if (t <= T_DRIVE - .7) { setFace(cop2, 'squint'); cop2.root.r = [0, yawOf(COP2, TB), 0]; } }
  if (i === 11) { lie(hero, t); face = 'closed'; BIN.visible = false; }
  if (i === 12) { lie(hero, t); BIN.visible = false; const d = t - T_EYE; face = d < 0 ? 'closed' : (d < .4 ? 'half' : 'wide'); if (d > .4) hero.head.r = [0, .5, 0]; }
  if (i === 13) { BIN.visible = false; face = intro(t - T_END); }
  if (t < 0 || i <= 7 || i === 13) { BIN.visible = true; BIN.p = TB.slice(); }
  setFace(h, face); for (const m of [hero, cop, cop2, cop3]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
