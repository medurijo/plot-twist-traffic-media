// ===================== EP25 scene: THE WALLET =====================
const HAT0 = hero.hat.p.slice();
for (const [k, v] of Object.entries({ grin: { m: 'grin' }, scream: { e: 'wide', m: 'open' }, dizzy: { e: 'closed', m: 'o' }, wideup: { e: 'wide', m: 'o', ly: -1.3 }, worry: { brow: -1.2, m: 'frown', lx: .4 } })) faceTex('cop2_' + k, LAY.cop2, v);
// scenery: hide the tree + bushes in the neighbor yard (camera sits there), lamp out of the way
scene.children.forEach(n => { if (n.p && (Math.abs(n.p[0] - 4.3) < .01 || Math.abs(n.p[0] - 12.5) < .01) && n.p[2] < -3 && n.p[2] > -7 && n.children && n.children.length === 3) n.visible = false; });
scene.children.forEach(n => { if (n.p && (Math.abs(n.p[0] - 9.1) < .01 || Math.abs(n.p[0] - 9.4) < .01) && Math.abs(n.p[2] + 3.5) < .01) n.visible = false; });
lamp.p = [-6.5, 0, 1.4];
const WAL = [1.2, .03, .1], ZW = .1, PCP = [9.2, 0, 3.05], HSP = [6.6, 0, 1.0], C1 = [8.0, 0, 1.15], C2 = [9.3, 0, .35], HC2 = [2.9, 0, ZW];
const cop2 = man({ id: 'cop2', shape: 'wide', neck: .28, seed: 4, skin: SK.hero, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1 }); scene.add(cop2.root);
// ---------- props ----------
texC('ten', 200, 100, (x, w, h) => { x.fillStyle = '#8fc98a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2f6b3a'; x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#2f6b3a'; x.font = '900 64px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$10', w / 2, h / 2 + 3); });
const WL = new Node(); WL.add(B('#6b3e26', [-.065, 0, 0], [.13, .035, .19], { out: .006 })); const WLB = new Node(); WLB.add(B('#7a4a2e', [.065, 0, 0], [.13, .035, .19], { out: .006 })); WL.add(WLB); WL.add(B('#c9a06a', [-.06, .02, 0], [.08, .005, .12], { out: 0 })); WL.s = [1.8, 1.8, 1.8]; scene.add(WL);
const BILL = new Node('quad', { c: [1, 1, 1], tex: 'ten', spec: 0, rim: 0, out: 0 }, [0, 0, 0], [.7, .35, 1]); scene.add(BILL);
function setWal(p, r = [0, 0, 0], open = 0) { WL.visible = true; WL.p = p.slice(); WL.r = r; WLB.r = [0, 0, -open * 2.9]; }
function mkCuff() { const o = { a: new Node('cyl', { c: hex('#b9bcc4'), out: .006, spec: .9, rim: .4 }, [0, 0, 0], [.16, .03, .16]), b: new Node('cyl', { c: hex('#b9bcc4'), out: .006, spec: .9, rim: .4 }, [0, 0, 0], [.16, .03, .16]), ch: B('#8a8e96', [0, 0, 0], [.03, .03, .2], { out: 0, spec: .9 }) }; scene.add(o.a, o.b, o.ch); return o; }
const CF = [mkCuff(), mkCuff(), mkCuff()];
function setCuff(c, a, b) { c.a.visible = c.b.visible = c.ch.visible = true; c.a.p = a; c.b.p = b; const m = lerp3(a, b, .5), d = sub(b, a), l = Math.hypot(d[0], d[1], d[2]); c.ch.p = m; c.ch.s = [.03, .03, Math.max(.05, l)]; c.ch.r = [-Math.asin(clamp(d[1] / Math.max(l, 1e-4), -1, 1)), Math.atan2(d[0], d[2]), 0]; }
const hand = (m, s) => wp(s < 0 ? m.armL.end : m.armR.end, [0, -.06, 0]);
// police car, open top, 2 seats
const PSEAT = [B('#2a2a30', [0, .9, -.6], [1.6, .12, 2.2]), B('#2a2a30', [0, 1.2, -1.6], [1.6, .55, .12]), new Node('cyl', { c: hex('#1d1d22'), out: .01 }, [.42, 1.12, .55], [.36, .04, .36], [-.9, 0, 0])]; PSEAT.forEach(n => pcar.root.add(n));
const CSEAT = new Node(null, null, [.42, .44, -.1]), CSEAT2 = new Node(null, null, [-.42, .44, -.1]); pcar.root.add(CSEAT); pcar.root.add(CSEAT2);
function setPcar(p, yaw, t, siren = 0) { pcar.root.visible = true; pcar.root.p = p.slice(); pcar.root.r = [0, yaw, 0]; pcar.root.children[1].visible = false; PSEAT.forEach(n => n.visible = true); pcar.l1.p[1] = pcar.l2.p[1] = 1.0; const s = Math.sin(t * 14) > 0; pcar.l1.mat.em = siren ? (s ? 1 : .2) : .25; pcar.l2.mat.em = siren ? (s ? .2 : 1) : .25; }
// ---------- poses ----------
const holdOut = (h, k = 1) => pose_(h, { sR: [-1.5, 0, -.1], eR: [-.1, 0, 0] });
const wristsOut = (h, t) => { pose_(h, { sL: [-1.45, 0, -.12], sR: [-1.45, 0, .12], eL: [-.2, 0, 0], eR: [-.2, 0, 0] }); };
const cuffedFront = m => pose_(m, { sL: [-.75, 0, -.42], sR: [-.75, 0, .42], eL: [-.7, 0, 0], eR: [-.7, 0, 0] });
const shrug = (m, t) => { const a = Math.max(0, Math.sin(t * 6)); pose_(m, { sL: [-.3, 0, .9 + a * .4], sR: [-.3, 0, -.9 - a * .4], eL: [-1.6, 0, 0], eR: [-1.6, 0, 0] }); m.body.p = [0, a * .06, 0]; };
const wave = (m, t) => pose_(m, { sR: [-2.8, 0, -.3 + Math.sin(t * 14) * .3], eR: [-.3, 0, 0] });
const peek = m => pose_(m, { sL: [-1.25, 0, -.05], sR: [-1.25, 0, .05], eL: [-.7, 0, 0], eR: [-.7, 0, 0] });
// ---------- timing ----------
const T_TURN = .05, T_CUF1 = WD.taking - .05, T_C2 = WD.cop6 + .1, T_FREE = WD.arresting - .15, T_CUF2 = WD.arresting + .1, T_BILL = WD.ten - .1, T_KEEP = WD.kept, T_CUF3 = WD.second10 + .05;
const T_DRV = P[11] + .25, T_BACK = WD.got - .05;
// ---------- intro: walking -x, the wallet falls out of the hole, he stops, turns around ----------
const TI0 = P[14] - T_END, T_HOLE = WD.fucking3 - T_END + .05, T_STOP = -.6, VW = 1.3;
const xWalk = t => WAL[0] + (T_HOLE - t) * VW;
function intro(t) { const h = hero; let f = 'grin';
  if (t < T_STOP) { h.root.p = [xWalk(t), 0, ZW]; h.root.r = [0, -Math.PI / 2 + .25, 0]; walkPose(h, t, 9, .8); h.head.r = [0, .45, Math.sin(t * 9) * .1]; f = Math.sin(t * 3) > .5 ? 'closed' : 'grin';
    if (t < T_HOLE) setWal(wp(h.body, [.13, 1.02, -.2]), [Math.PI / 2, -Math.PI / 2, 0]); else { const u = clamp((t - T_HOLE) / .3); const a = [xWalk(T_HOLE) + .13 * 0, 1.02, ZW + .2]; setWal([lerp(a[0], WAL[0], u), lerp(a[1], WAL[1], u * u), lerp(a[2], WAL[2], u)], [lerp(Math.PI / 2, 0, u), u * 3, 0]); } }
  else { const x0 = xWalk(T_STOP); setWal(WAL, [0, 3, 0]); h.root.p = [x0, 0, ZW]; let yaw = -Math.PI / 2 + .25; f = 'neutral';
    if (t > T_TURN) { const u = clamp((t - T_TURN) / .35); yaw = lerp(-Math.PI / 2 + .25, Math.PI / 2 - .3, eout(u)); f = 'neutral'; }
    if (t > WD.wallet0 - .05) { f = 'wide'; pose_(h, { sR: [-1.4, 0, -.3], eR: [0, 0, 0] }); h.head.r = [.35, 0, 0]; }
    if (t > WD.wallet0 + .3) { const u = clamp((t - WD.wallet0 - .3) / .5); h.root.p = [lerp(x0, WAL[0] - .75, eio(u)), Math.sin(u * Math.PI * 3) * .05, ZW]; if (u < 1) walkPose(h, t, 12, .6); h.body.r = [.45 * u, 0, 0]; h.head.r = [.5, 0, 0]; pose_(h, { sR: [-1.0, 0, -.2], eR: [0, 0, 0] }); }
    h.root.r = [0, yaw, 0]; }
  return f; }
function hideAll() { for (const m of [hero, cop, cop2]) { resetPose(m); m.root.visible = false; } hero.root.visible = true; hero.hat.visible = true; hero.hat.p = HAT0.slice(); puffs.forEach(p => p.visible = false); STRK.forEach(s => s.visible = false);
  WL.visible = false; BILL.visible = false; CF.forEach(c => { c.a.visible = c.b.visible = c.ch.visible = false; }); DON.visible = false; hero.phone.visible = false;
  pcar.root.visible = true; setPcar(PCP, Math.PI / 2, 0); }
function stage(t) { const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); core(t); for (const m of [hero, cop, cop2]) if (m.root.visible) applyNoodle(m, t); core(t); for (const m of [hero, cop, cop2]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
function core(t) { late = []; const i = ph(t); hideAll(); const h = hero; let face = 'neutral';
  // cop 1 by the police car until he drives away
  if (i >= 1 && i <= 10) { cop.root.visible = true; cop.root.p = C1.slice(); cop.root.r = [0, Math.PI + .55, 0]; }
  if (i === 0 || i >= 12) pcar.root.visible = false;
  if (i === 0) face = intro(t);
  // L1: keeping it? FUCKING theft!
  if (i === 1) { h.root.p = [WAL[0] - .75, 0, ZW]; h.root.r = [0, Math.PI / 2 - .5, 0]; DON.visible = true; pose_(cop, { sR: [-1.3 + Math.sin(t * 3) * .2, 0, -.2], eR: [-1.0, 0, 0] }); setFace(cop, 'neutral'); const tp = P[1] + .35;
    if (t < tp) { setWal(WAL, [0, 3, 0]); h.body.r = [.5, 0, 0]; h.head.r = [.5, 0, 0]; pose_(h, { sR: [-.6, 0, -.1], eR: [0, 0, 0] }); face = 'wide'; }
    else { holdOut(h); h.body.r = [-.25, 0, 0]; const shk = t > WD.fucking1 - .1 ? 1 : .3; h.root.p = [WAL[0] - .75 - (t > WD.fucking1 ? .3 : 0), Math.abs(Math.sin(t * 25)) * .15 * shk, ZW]; setWal(hand(h, 1), [Math.sin(t * 40) * .4 * shk, 0, 0]);
      face = t > WD.fucking1 - .1 ? (Math.sin(t * 22) > 0 ? 'scream' : 'wide') : 'worry'; if (t > WD.fucking1 - .1) { pose_(h, { sL: [-2.6 + Math.sin(t * 25) * .4, 0, .7], eL: [-.5, 0, 0] }); h.wob = .5; h.head.r = [0, .3, 0]; } } }
  // L2: runs it to the police
  if (i === 2) { DON.visible = true; pose_(cop, { sR: [-1.3 + Math.sin(t * 3) * .2, 0, -.2], eR: [-1.0, 0, 0] }); setFace(cop, 'neutral'); const ts = pend(2) - .35, u = clamp((t - P[2] - .1) / (ts - P[2] - .1));
    if (t < ts) { h.root.p = [lerp(WAL[0] - .75, HSP[0], u), 0, lerp(ZW, HSP[2], u)]; h.root.r = [0, Math.PI / 2, 0]; wheelRun(h, t, 60, .45); pose_(h, { sR: [-2.9, 0, -.2], eR: [0, 0, 0] }); face = 'grin'; setWal(hand(h, 1)); late.push(() => stream(t, A3(h.root.p, [-.3, 1.3, 0]), [-1, 0, 0], 4, 0, 16, .8, 2, .5)); dust(t, h.root.p, 8, 16); }
    else { h.root.p = HSP.slice(); h.root.r = [0, Math.PI - .7, 0]; holdOut(h); face = 'grin'; setWal(hand(h, 1)); cop.root.r = [0, -.9 - Math.PI / 2, 0]; setFace(cop, 'wide'); burst(ts, t, HSP, [.85, .8, .72], 0, 8, .6, .4); } }
  // L3-L4: the cop opens it. It was his own wallet.
  if (i === 3 || i === 4) { h.root.p = HSP.slice(); h.root.r = [0, Math.PI - .7, 0]; peek(cop); const op = clamp((t - P[3] - .3) / .3); setWal(wp(cop.armR.end, [-.12, -.1, .12]), [-1.2, Math.PI + .55, 0], op); setFace(cop, 'squint'); face = 'neutral'; pose_(h, { sL: [.1, 0, .9], eL: [-1.6, 0, 0], sR: [.1, 0, -.9], eR: [-1.6, 0, 0] }); }
  if (i === 4) { const sw = Math.sin((t - P[4]) * 7); cop.head.r = [0, sw > 0 ? -.7 : 0, 0]; setFace(cop, sw > 0 ? 'wide' : 'squint'); face = t > WD.own ? 'wide' : 'neutral'; h.head.r = [0, 0, Math.sin(t * 5) * .15]; }
  // L5: turns himself in -> cuffed. CRIME #1
  if (i === 5) { h.root.p = HSP.slice(); h.root.r = [0, Math.PI - .9, 0]; setWal(wp(cop.armL.end, [0, -.1, .05]), [-1.2, Math.PI + .55, 0], 0); pose_(cop, { sL: [-.3, 0, .2], eL: [-.3, 0, 0] });
    if (t < T_CUF1) { wristsOut(h, t); h.root.p = A3(HSP, [0, Math.abs(Math.sin(t * 14)) * .25, 0]); face = Math.sin(t * 10) > 0 ? 'grin' : 'talk'; shrug(cop, t); setFace(cop, 'squint'); }
    else { cuffedFront(h); face = 'grin'; const d = t - T_CUF1; pose_(cop, { sR: [-1.2, 0, .3], eR: [-.6, 0, 0] }); setFace(cop, 'worry'); if (d < .15) { wristsOut(h, t); } late.push(() => setCuff(CF[0], hand(h, -1), hand(h, 1))); } }
  // L6: reports the cop (phone) -> cop2 sprints in, frees him, cuffs cop1. CRIME #2
  if (i === 6) { h.root.p = HSP.slice(); h.root.r = [0, Math.PI - .5, 0]; setWal(wp(cop.armL.end, [0, -.1, .05]), [-1.2, Math.PI + .55, 0], 0); cop2.root.visible = true;
    if (t < T_FREE) { pose_(h, { sL: [-.2, 0, 1.0], eL: [-2.2, 0, 0], sR: [-.2, 0, -1.0], eR: [-2.2, 0, 0] }); hero.phone.visible = true; face = Math.sin(t * 12) > 0 ? 'talk' : 'neutral'; h.head.r = [0, 0, .2]; late.push(() => setCuff(CF[0], hand(h, -1), hand(h, 1))); }
    else { const d = t - T_FREE; pose_(h, { sL: [-2.7, 0, .5], sR: [-2.7, 0, -.5] }); face = 'grin'; h.root.p = A3(HSP, [0, Math.abs(Math.sin(d * 10)) * .3, 0]); if (d < .35) { const a = hand(h, -1); const u = d / .35; late.push(() => setCuff(CF[0], A3(a, [u * 1.2, u * 1.5 - u * u * 2.5, -u * .5]), A3(a, [u * 1.5, u * 1.6 - u * u * 2.5, -u * .3]))); } }
    if (t < T_C2) { const u = clamp((t - P[6]) / (T_C2 - P[6])); cop2.root.p = [lerp(-24, C2[0], u), 0, lerp(-.6, C2[2], u)]; cop2.root.r = [0, Math.PI / 2, 0]; wheelRun(cop2, t, 80, .75); setFace(cop2, 'squint'); late.push(() => stream(t, A3(cop2.root.p, [-.5, 1.3, 0]), [-1, 0, 0], 5, 0, 20, .9, 2.5, .55)); dust(t, cop2.root.p, 8, 16); }
    else { const d = t - T_C2; cop2.root.p = C2.slice(); cop2.root.r = [-.25 * Math.exp(-d * 6) * Math.cos(d * 20), Math.PI + .6 - lerp(1.6, 0, clamp(d / .3)), 0]; setFace(cop2, 'squint'); burst(T_C2, t, C2, [.85, .8, .72], 0, 8, .8, .5); if (t > T_FREE - .2) pose_(cop2, { sR: [-1.4, 0, .2], eR: [-.4, 0, 0] }); }
    if (t < T_CUF2) { shrug(cop, t * .5); setFace(cop, t > T_C2 ? 'wide' : 'squint'); } else { cuffedFront(cop); setFace(cop, 'wide'); cop.root.r = [0, Math.PI + .9, 0]; late.push(() => setCuff(CF[1], hand(cop, -1), hand(cop, 1))); } }
  if (i >= 7 && i <= 10) { cop.root.visible = true; cuffedFront(cop); cop.root.r = [0, Math.PI + .9, 0]; late.push(() => setCuff(CF[1], hand(cop, -1), hand(cop, 1))); cop2.root.visible = true; cop2.root.p = C2.slice(); cop2.root.r = [0, Math.PI + .6, 0]; h.root.p = HSP.slice(); h.root.r = [0, Math.PI - .5, 0]; setFace(cop, 'squint'); }
  // L7: cop2 checks the wallet
  if (i === 7) { peek(cop2); const op = clamp((t - P[7] - .3) / .3); setWal(wp(cop2.armR.end, [-.12, -.1, .12]), [-1.2, cop2.root.r[1], 0], op); setFace(cop2, 'squint'); cop2.head.r = [.35, 0, 0]; face = 'neutral'; pose_(h, { sL: [.1, 0, .9], eL: [-1.6, 0, 0] }); }
  // L8: ten FUCKING dollars
  if (i === 8) { setWal(wp(cop2.armL.end, [0, -.12, .06]), [-1.2, cop2.root.r[1], 0], 1); pose_(cop2, { sL: [-1.2, 0, -.1], eL: [-.4, 0, 0] }); setFace(cop2, 'neutral');
    if (t > T_BILL) { const u = clamp((t - T_BILL) / .3); pose_(cop2, { sR: [lerp(-1.2, -2.3, eout(u)), 0, lerp(-.2, -.7, u)], eR: [0, 0, 0] }); BILL.visible = true; BILL.p = wp(cop2.armR.end, [0, .02, .08]); BILL.r = [Math.sin(t * 18) * .25, cop2.root.r[1], Math.sin(t * 13) * .2]; setFace(cop2, t > WD.fucking2 - .1 ? (Math.sin(t * 20) > 0 ? 'scream' : 'wideup') : 'wideup'); cop2.root.p = A3(C2, [0, t > WD.fucking2 ? Math.abs(Math.sin(t * 14)) * .35 : 0, 0]); }
    face = t > WD.fucking2 ? 'wide' : 'neutral'; setFace(cop, t > WD.fucking2 ? 'wide' : 'squint'); }
  // L9: he kept them. CRIME #3
  if (i === 9) { setWal(wp(cop2.armL.end, [0, -.12, .06]), [-1.2, cop2.root.r[1], 0], 1); pose_(cop2, { sL: [-1.0, 0, -.1], eL: [-.4, 0, 0] }); const u = clamp((t - P[9]) / .5); pose_(cop2, { sR: [lerp(-2.3, .3, eout(u)), 0, lerp(-.7, -.15, u)], eR: [lerp(0, -.3, u), 0, 0] });
    if (u < 1) { BILL.visible = true; BILL.p = wp(cop2.armR.end, [0, .02, .08]); BILL.r = [0, cop2.root.r[1], 0]; } cop2.head.r = [0, .9, 0]; setFace(cop2, Math.sin(t * 3) > 0 ? 'closed' : 'grin'); cop2.root.r = [0, Math.PI + .6 + Math.sin(t * 4) * .15, 0];
    face = t > WD.actual - .1 ? 'squint' : 'wide'; if (t > WD.actual - .1) pose_(h, { sR: [-1.55, 0, -.4], eR: [0, 0, 0] }); setFace(cop, 'wide'); cop.head.r = [0, -.6, 0]; }
  // L10: the first cop (cuffed) arrests the second cop
  if (i === 10) { setWal(wp(cop2.armL.end, [0, -.12, .06]), [-1.2, cop2.root.r[1], 0], 0); face = 'grin'; const u = clamp((t - P[10] - .2) / .5);
    cop.root.p = lerp3(C1, A3(C2, [-.85, 0, .15]), eout(u)); cop.root.r = [0, Math.PI / 2 + .3, 0]; pose_(cop, { sL: [-1.4, 0, -.3], sR: [-1.4, 0, .3], eL: [-.2, 0, 0], eR: [-.2, 0, 0] }); setFace(cop, 'squint');
    if (t > T_CUF3) { cuffedFront(cop2); setFace(cop2, 'wide'); late.push(() => setCuff(CF[2], hand(cop, 1), hand(cop2, -1))); cop2.root.p = A3(C2, [n1(t * 30) * .05, 0, 0]); setFace(cop, 'grin'); } else { pose_(cop2, { sR: [.3, 0, -.15] }); setFace(cop2, 'worry'); }
    h.root.p = A3(HSP, [0, Math.abs(Math.sin(t * 8)) * .1, 0]); pose_(h, { sL: [-2.6, 0, .5], eL: [-.3, 0, 0] }); }
  // L11: they drive each other to jail
  if (i === 11) { const d = Math.max(0, t - T_DRV); const x = PCP[0] + d * d * 6 + d * 2, z = PCP[2] + Math.sin(d * 7) * .9 * clamp(d * 2); const yaw = Math.PI / 2 + Math.cos(d * 7) * .45 * clamp(d * 2);
    setPcar([x, 0, z], yaw, t, 1); for (const [m, s] of [[cop, CSEAT], [cop2, CSEAT2]]) { m.root.visible = true; m.root.p = wp(s); m.root.r = pcar.root.r.slice(); sitPose(m); }
    pose_(cop, { sL: [-1.25, 0, .15], sR: [-1.25, 0, -.15], eL: [-.4, 0, 0], eR: [-.4, 0, 0] }); pose_(cop2, { sL: [-1.25, 0, .4], sR: [-2.6, 0, -.3], eL: [-.4, 0, 0] }); setFace(cop, 'squint'); setFace(cop2, 'grin');
    late.push(() => { setCuff(CF[1], hand(cop, -1), hand(cop, 1)); setCuff(CF[2], hand(cop, 1), hand(cop2, -1)); }); setWal(wp(cop2.armR.end, [0, -.08, .06]), [0, 0, 0], 0);
    h.root.p = HSP.slice(); h.root.r = [0, Math.PI / 2 - .9, 0]; wave(h, t); face = 'grin'; }
  // L12: the wallet comes flying back (bonk)
  if (i === 12) { h.root.p = HSP.slice(); h.root.r = [0, .35, 0]; const t0 = P[12] + .1, tb = T_BACK + .25, d = t - t0; const a = [24, 2.5, 3.5], hd = wp(h.head, [0, .9, 0]);
    if (t < tb) { const u = clamp(d / (tb - t0)); setWal([lerp(a[0], hd[0], u), lerp(a[1], hd[1], u) + Math.sin(u * Math.PI) * 3, lerp(a[2], hd[2], u)], [u * 20, u * 9, 0]); face = 'up'; h.head.r = [-.3, 0, 0]; }
    else { const u = clamp((t - tb) / .3); setWal(lerp3(hd, hand(h, 1), eout(u)), [0, 0, 0]); pose_(h, { sR: [-1.4, 0, -.2], eR: [-.3, 0, 0] }); face = u < 1 ? 'dizzy' : 'grin'; if (t - tb < .15) h.root.p = A3(HSP, [0, -.1, 0]); } }
  // L13: kisses it, puts it in his back pocket
  if (i === 13) { h.root.p = HC2.slice(); const tp = WD.pocket - .1;
    if (t < tp) { h.root.r = [0, .6, 0]; pose_(h, { sR: [-2.0, 0, .3], eR: [-1.9, 0, 0] }); setWal(hand(h, 1)); face = Math.sin(t * 10) > 0 ? 'closed' : 'sip'; }
    else { const u = clamp((t - tp) / .4); h.root.r = [0, lerp(.6, -Math.PI / 2 + 1.3, u), 0]; pose_(h, { sR: [lerp(-2.0, .7, u), 0, -.2], eR: [lerp(-1.9, -.5, u), 0, 0] }); face = 'grin'; if (u < .8) setWal(hand(h, 1)); else setWal(wp(h.body, [.13, 1.02, -.2]), [Math.PI / 2, -Math.PI / 2, 0]); if (u >= 1) { const pa = Math.sin(t * 16); pose_(h, { sR: [.5 + pa * .2, 0, -.25] }); } } }
  if (i === 14) face = intro(t - T_END);
  setFace(h, face); }
