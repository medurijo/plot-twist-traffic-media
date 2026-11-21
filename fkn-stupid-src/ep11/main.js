// =====================================================================
//  EP11 "THE PARKING METER" — it wanted more. He fed it everything.
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
const HP = [5.75, 0, 1.15], MP = [6.7, 0, 1.45]; const HY = .55, MY = .22, MS = 1.3;
// ---------- meter ----------
function pmTex(name, l1, col, l2) { texC(name, 256, 150, (x, w, h) => { x.fillStyle = '#10131a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(80,255,140,.06)'; for (let y = 0; y < h; y += 6) x.fillRect(0, y, w, 2);
  x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 ${l1.length > 6 ? 54 : 74}px "Inter Display"`; x.fillText(l1, w / 2, l2 ? 62 : 78); if (l2) { x.font = '700 26px "Courier 10 Pitch"'; x.fillText(l2, w / 2, 118); } }); }
pmTex('pm_exp', 'EXPIRED', '#ff4a3a'); pmTex('pm_dots', '. . .', '#9affb8'); pmTex('pm_yum', 'YUM.', '#9affb8', '+1 MIN'); pmTex('pm_more', 'MORE.', '#ffd23a'); pmTex('pm_2090', '2090', '#9affb8', 'PAID UNTIL'); pmTex('pm_burp', 'BURP', '#ffd23a'); pmTex('pm_blank', '', '#000');
const MT = new Node(); MT.p = MP.slice(); MT.r = [0, MY, 0]; MT.add(B('#6a6e78', [0, .55, 0], [.09, 1.1, .09], { out: .015, spec: .6 })); MT.add(B('#4a4d55', [0, .03, 0], [.3, .06, .3], { out: .01 }));
const MH = new Node(null, null, [0, 1.35, 0]); MT.add(MH);
MH.add(B('#3d4250', [0, 0, 0], [.38, .5, .3], { out: .012, spec: .5, rim: .2 })); MH.add(new Node('cyl', { c: hex('#b9bdc8'), out: .01, spec: 1, rim: .3 }, [0, .25, 0], [.38, .12, .3])); MH.add(B('#b9bdc8', [0, -.26, 0], [.3, .06, .24], { out: .01, spec: 1 }));
const DSP = []; const MOUTH = []; for (const sd of [1, -1]) { const f = new Node(null, null, [0, 0, 0], null, [0, sd > 0 ? 0 : Math.PI, 0]); MH.add(f);
  f.add(B('#9aa0ae', [0, .09, .152], [.32, .2, .01], { out: 0, spec: .8 })); const d = new Node('quad', { c: [1, 1, 1], tex: 'pm_dots', em: .9, spec: 0, rim: 0, out: 0, noShadow: 1 }, [0, .09, .159], [.28, .165, 1]); f.add(d); DSP.push(d);
  const mo = new Node(null, null, [0, -.12, .153]); mo.add(B('#120a0c', [0, 0, 0], [.2, .035, .012], { out: 0 })); const teeth = []; for (let k = 0; k < 4; k++) { const tt = B('#f4f1e8', [-.075 + k * .05, .0, .008], [.035, .03, .01], { out: 0 }); mo.add(tt); teeth.push(tt); }
  f.add(mo); MOUTH.push({ mo, teeth }); for (const ex of [-.1, .1]) f.add(B('#1b1b20', [ex, .22, .152], [.04, .04, .01], { out: 0 })); }
scene.add(MT);
function meter(t, bulge, open = 0, tex = 'pm_dots', wob = 0) { const b = bulge; const bb = b * MS; MH.s = [bb * (1 + Math.sin(t * 9) * wob * .06), bb * (1 - Math.sin(t * 9) * wob * .05), bb]; MH.p = [0, 1.1 + .25 * bb, 0]; MH.r = [Math.sin(t * 7) * wob * .1, 0, Math.sin(t * 5) * wob * .12];
  DSP.forEach(d => d.mat.tex = tex); MOUTH.forEach(m => { m.mo.children[0].s = [.2, .035 + open * .13, .012]; m.teeth.forEach((tt, k) => { tt.visible = open > .15; tt.p = [-.075 + k * .05, (k % 2 ? -1 : 1) * open * .055, .008]; }); }); }
const slotW = () => wp(MOUTH[0].mo, [0, 0, .05]);
// ---------- props ----------
const hcar = car({ body: '#4f8a5b', top: '#4f8a5b' }); hcar.l1.visible = hcar.l2.visible = false; hcar.root.p = [10.9, 0, 3.05]; hcar.root.r = [0, -Math.PI / 2, 0]; scene.add(hcar.root);
texC('tix', 128, 160, (x, w, h) => { x.fillStyle = '#fbf6e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8302c'; x.fillRect(0, 0, w, 30); x.fillStyle = '#1b1b20'; x.font = '700 18px "Courier 10 Pitch"'; for (let k = 0; k < 6; k++) x.fillRect(12, 46 + k * 18, 60 + hsh(k, 3) * 40, 5); });
const pad = new Node(null, null, [0, -.14, .07]); pad.add(B('#fbf6e6', [0, 0, 0], [.16, .2, .03], { out: .006 })); pad.add(B('#d8302c', [0, .09, 0], [.165, .03, .035], { out: 0 })); cop.armR.end.add(pad);
const coin = new Node('cyl', { c: hex('#f0c44a'), spec: 1, rim: .3, out: .004 }, [0, 0, 0], [.09, .02, .09], [Math.PI / 2, 0, 0]); scene.add(coin);
const wallet = new Node(); wallet.add(B('#6b4a2a', [0, 0, 0], [.2, .14, .05], { out: .006 })); wallet.add(B('#7cc06a', [0, .08, 0], [.15, .05, .03], { out: 0 })); scene.add(wallet);
const SH = []; for (let k = 0; k < 2; k++) { const s = B('#e9e4d4', [0, 0, 0], [.22, .1, .38], { out: .01 }); scene.add(s); SH.push(s); }
const SOCK = [hero.legL, hero.legR].map(l => { const s = B('#d8302c', [0, .03, .05], [.15, .09, .3], { out: .01 }); l.end.add(s); s.add(B('#f0cdb4', [0, .02, .15], [.06, .05, .02], { out: 0 })); return s; });
const SHOE = [hero.legL.end.children[0], hero.legR.end.children[0]];
// ---------- partner ----------
for (const [k, v] of Object.entries({ scream: { e: 'wide', m: 'open' }, grin: { m: 'grin' }, dizzy: { e: 'closed', m: 'o' }, up: { ly: -1.2 } })) faceTex('cop2_' + k, LAY.cop2, v);
const cop2 = man({ id: 'cop2', shape: 'wide', neck: .22, seed: 37, skin: SK.hero, shirt: '#3d5a80', pants: '#2b3a55', shoe: '#1d1d22', cap: '#2b3a55', badge: 1, pocket: '#31496b' }); scene.add(cop2.root);
let tod = t => ({ k: .42 }); let lighting = t => ({});
// ---------- timing ----------
const T_UP = (P[13] - T_END) + .5, T_EXP = WD.expired, T_COIN = WD.coin - .3, T_WAL = WD.fucking1 - .35, T_CH1 = WD.fucking1 + .05, T_SH = P[4] + .1, T_PCA = P[5] + .05, T_GRAB = P[6] + .1, T_EAT1 = WD.cop2 - .1, T_RUN = WD.partner - .25, T_GRAB2 = P[8] + .05, T_EAT2 = WD.too - .2, T_LIFT = P[9] + .1, T_EAT3 = WD.fucking2 + .05, T_YES = WD.fucking3 - .05, T_BURP = WD.burped + .1;
const COPP = [4.6, 0, 1.6], PCP = [-1.8, 0, 3.05];
// bulge by time
function bulge(t) { const i = ph(t); if (t < 0 || i === 13 || (i === 12 && t > T_BURP)) { if (i === 12) return 1 + 2.2 * Math.exp(-(t - T_BURP) * 9); return 1; }
  let b = 1; const step = (t0, to) => { if (t > t0) b = lerp(b, to, eback(clamp((t - t0) / .35))); }; step(T_CH1, 1.15); step(T_SH + 1.0, 1.28); step(T_EAT1 + .55, 1.65); step(T_EAT2 + .45, 2.05); step(T_EAT3 + .6, 3.1); return b; }
// ---------- intro / loop (t < 0 = last line) ----------
function idle(h) { pose_(h, { sL: [-.15, 0, .15], sR: [-.15, 0, -.15] }); }
function sitGround(h, t) { h.body.p = [0, -.62, 0]; h.body.r = [-.25, 0, 0]; h.lL.r = [-1.35, 0, -.2]; h.lR.r = [-1.25, 0, .2]; h.lL.k = h.lR.k = .4; pose_(h, { sL: [.4, 0, .6], sR: [.4, 0, -.6] }); }
function intro(t) { const h = hero; let face = 'neutral'; h.root.p = HP.slice(); h.root.r = [0, HY, 0]; let tex = t < T_EXP ? 'pm_dots' : (Math.sin(t * 9) > -.3 ? 'pm_exp' : 'pm_blank');
  if (t < T_UP) { h.root.p = A3(HP, [-.5, 0, -.3]); sitGround(h, t); face = 'dizzy'; h.head.r = [Math.sin(t * 5) * .1, 0, Math.sin(t * 4) * .15]; meter(t, 1, 0, 'pm_dots'); return face; }
  if (t < T_UP + .5) { const a = eio(clamp((t - T_UP) / .5)); h.root.p = lerp3(A3(HP, [-.5, 0, -.3]), HP, a); h.body.p = [0, -.62 * (1 - a), 0]; walkPose(h, t, 10, .4); face = 'squint'; meter(t, 1, 0, 'pm_dots'); return face; }
  idle(h); face = t < T_EXP ? 'neutral' : 'wide'; h.head.r = [.1, 0, 0]; if (t > T_EXP) { h.body.r = [-.08, 0, 0]; } meter(t, 1, 0, tex); return face; }
function hideAll() { for (const m of [hero, cop, cop2]) { resetPose(m); m.root.visible = false; m.root.s = [1, 1, 1]; m.body.s = [1, 1, 1]; m.body.r = [0, 0, 0]; } hero.root.visible = true; puffs.forEach(p => p.visible = false);
  coin.visible = wallet.visible = false; wallet.s = [1, 1, 1]; SH.forEach(s => s.visible = false); SOCK.forEach(s => s.visible = false); SHOE.forEach(s => s.visible = true); pad.visible = false; pcar.root.visible = false; pcar.root.s = [1, 1, 1]; hcar.root.visible = true; if (cop.cap) cop.cap.visible = true; }
function carLights(c, t) { c.l1.mat.em = Math.sin(t * 18) > 0 ? 1 : .2; c.l2.mat.em = Math.sin(t * 18) <= 0 ? 1 : .2; }
const shrinkTo = (p0, u) => lerp3(p0, slotW(), u);
function stage(t) { late = []; const i = ph(t); hideAll(); const L = lighting(t); skyUpdate(t, L); lookUpdate(t, L); const h = hero; let face = 'neutral';
  const B_ = bulge(t); meter(t, B_, 0, 'pm_dots', 0); let open = 0, tex = 'pm_dots', mwob = 0; h.root.p = HP.slice(); h.root.r = [0, HY, 0];
  const shoesOff = (i >= 5 && i <= 11) || (i === 4 && t > T_SH + .35) || (i === 12 && t < T_BURP + .6); if (shoesOff) { SHOE.forEach(s => s.visible = false); SOCK.forEach(s => s.visible = true); }
  if ((i >= 6 && i <= 11) || (i === 5 && t > T_PCA)) { pcar.root.visible = !(i === 9 && t > T_EAT3 + .55) && i < 10; if (pcar.root.visible) { pcar.root.p = PCP.slice(); pcar.root.r = [0, -Math.PI / 2, 0]; carLights(pcar, t); } }
  if (i === 5) { const u = eout(clamp((t - T_PCA) / .6)); pcar.root.p = [lerp(-30, PCP[0], u), 0, PCP[2]]; }
  // characters
  if (i === 0) { face = intro(t); late.push(() => meter(t, 1, 0, t < T_EXP ? 'pm_dots' : (Math.sin(t * 9) > -.3 ? 'pm_exp' : 'pm_blank'))); }
  if (i === 1) { tex = 'pm_exp'; const d = t - T_COIN; idle(h); face = 'squint'; if (d > -.4) { pose_(h, { sR: [-1.45, 0, -.15], eR: [-.25, 0, 0] }); coin.visible = d < .45; late.push(() => { const hp = wp(hero.armR.end, [0, -.1, .06]); coin.p = d < 0 ? hp : lerp3(hp, slotW(), clamp(d / .4)); coin.r = [Math.PI / 2, t * 8, 0]; }); }
    if (d > .4) { tex = 'pm_yum'; open = Math.max(0, Math.sin((d - .4) * 14)) * .6 * (d < 1 ? 1 : 0); face = 'grin'; idle(h); } }
  if (i === 2) { tex = Math.sin(t * 10) > -.2 ? 'pm_more' : 'pm_blank'; idle(h); face = 'wide'; open = .3 + Math.abs(Math.sin(t * 8)) * .5; mwob = 1; h.body.r = [-.12, 0, 0]; h.head.r = [-.05, 0, 0]; }
  if (i === 3) { tex = 'pm_more'; const d = t - T_WAL; if (d < 0) { idle(h); pose_(h, { sR: [-1.2, 0, -.2], eR: [-.6, 0, 0] }); face = 'squint'; wallet.visible = true; late.push(() => { wallet.p = wp(hero.armR.end, [0, -.12, .05]); wallet.r = [0, HY, 0]; }); open = .35; }
    else { open = d < .4 ? .9 : Math.max(0, Math.sin(d * 12)) * .5 * (d < 1.2 ? 1 : 0); wallet.visible = d < .3; if (wallet.visible) late.push(() => { wallet.p = lerp3(wp(hero.armR.end, [0, -.12, .05]), slotW(), clamp(d / .3)); wallet.s = [1 - d * 2.5, 1 - d * 2.5, 1]; });
      argue(h, t, 1.5, 2); face = Math.sin(t * 22) > 0 ? 'scream' : 'talksq'; h.root.p[1] = Math.abs(Math.sin(t * 11)) * .35; h.wob = .5; tex = d > .5 ? 'pm_yum' : 'pm_more'; mwob = d < 1 ? 1.4 : .3; } }
  if (i === 4) { tex = 'pm_more'; open = .25 + Math.abs(Math.sin(t * 8)) * .3; mwob = .6; const d = t - T_SH;
    if (d < .35) { face = 'squint'; h.root.p[1] = Math.abs(Math.sin(t * 14)) * .2; h.lL.r = [-1.6, 0, 0]; h.lL.k = 1.6; pose_(h, { sR: [-.4, 0, .3], eR: [-1.5, 0, 0] }); }
    else { idle(h); face = 'grin'; for (let k = 0; k < 2; k++) { const e = d - .35 - k * .35; SH[k].visible = e < .35; if (SH[k].visible) { const hp = A3(HP, [.1 + k * .1, .9, .1]); const a = clamp(e / .35); late.push(() => { SH[k].p = lerp3(hp, slotW(), a); SH[k].p[1] += Math.sin(a * Math.PI) * .4; SH[k].r = [t * 9, k, t * 6]; const s = 1 - a * .8; SH[k].s = [.22 * s, .1 * s, .38 * s]; }); }
        if (e > 0 && e < .35) { pose_(h, { sR: [-1.5, 0, -.15], eR: [-.2, 0, 0] }); open = .9; } } } }
  if (i === 5) { tex = 'pm_more'; open = .2; idle(h); face = 'neutral'; const d = t - T_PCA - .6; cop.root.visible = d > 0; if (d > 0) { const a = clamp(d / .7); cop.root.p = lerp3([PCP[0] + .2, 0, 2.0], COPP, a); cop.root.r = [0, a < 1 ? Math.PI / 2 : yawOf(COPP, HP), 0]; if (a < 1) walkPose(cop, t, 9, .6); else { pad.visible = true; pose_(cop, { sR: [-1.3, 0, -.1], eR: [-.7, 0, 0], sL: [-1.0, 0, .4], eL: [-1.2 + Math.sin(t * 30) * .3, 0, 0] }); } setFace(cop, a < 1 ? 'squint' : 'talksq'); h.head.r = [0, -.6, 0]; face = 'half'; } }
  if (i === 6) { tex = 'pm_more'; const d = t - T_GRAB, e = t - T_EAT1; cop.root.visible = e < .55; setFace(cop, 'scream'); cop.wob = .6;
    if (d < .35) { const a = eout(clamp(d / .35)); cop.root.p = lerp3(COPP, A3(HP, [0, 2.3, 0]), a); cop.root.r = [lerp(0, -Math.PI / 2, a), yawOf(COPP, HP), 0]; pose_(h, { sL: [-2.8, 0, .5], sR: [-2.8, 0, -.5] }); face = 'grin'; runPose(cop, t, 30); pose_(cop, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); }
    else if (e < 0) { cop.root.p = A3(HP, [0, 2.3 + Math.sin(t * 20) * .05, 0]); cop.root.r = [-Math.PI / 2, HY + Math.PI / 2, 0]; runPose(cop, t, 30); pose_(cop, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); pose_(h, { sL: [-2.8, 0, .5], sR: [-2.8, 0, -.5] }); face = 'grin'; open = .5; }
    else { const a = clamp(e / .5); open = 1; mwob = 1.5; late.push(() => { cop.root.p = lerp3(A3(HP, [0, 2.3, 0]), slotW(), eio(a)); cop.root.r = [-Math.PI / 2 - a * .4, HY, 0]; const s = 1 - a * .95; cop.root.s = [s * (1 - a * .5), s, s * (1 - a * .5)]; }); runPose(cop, t, 40); pose_(h, { sL: [-1.5, 0, .3], sR: [-1.5, 0, -.3] }); face = 'grin'; if (e > .55) { tex = 'pm_yum'; open = Math.max(0, Math.sin(e * 14)) * .5; idle(h); } } }
  if (i === 7) { tex = 'pm_more'; open = .25 + Math.abs(Math.sin(t * 9)) * .3; mwob = .5; idle(h); face = 'half'; h.head.r = [0, -.9, 0]; const d = t - T_RUN; cop2.root.visible = d > 0;
    if (d > 0) { const a = clamp(d / .45); cop2.root.p = [lerp(-26, COPP[0], eout(a)), 0, COPP[2]]; cop2.root.r = [0, Math.PI / 2, 0]; if (a < .85) { runPose(cop2, t, 46); pose_(cop2, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); setFace(cop2, 'scream'); cop2.wob = .7; } else { cop2.root.r = [0, Math.PI / 2, -.12]; cop2.body.r = [-.35, 0, 0]; pose_(cop2, { sL: [-1.6, 0, .9], sR: [-1.6, 0, -.9] }); setFace(cop2, 'wide'); } burst(T_RUN + .35, t, A3(COPP, [-.6, .15, 0]), [.85, .8, .72], 0, 16, 1.4, 1.0); } }
  if (i === 8) { tex = 'pm_more'; const d = t - T_GRAB2, e = t - T_EAT2; cop2.root.visible = e < .5; setFace(cop2, 'scream'); cop2.wob = .6;
    if (e < 0) { const a = eout(clamp(d / .3)); cop2.root.p = lerp3(COPP, A3(HP, [0, 2.3, 0]), a); cop2.root.r = [-Math.PI / 2 * a, Math.PI / 2, 0]; runPose(cop2, t, 34); pose_(cop2, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); pose_(h, { sL: [-2.8, 0, .5], sR: [-2.8, 0, -.5] }); face = 'grin'; open = .6; }
    else { const a = clamp(e / .45); open = 1; mwob = 1.5; late.push(() => { cop2.root.p = lerp3(A3(HP, [0, 2.3, 0]), slotW(), eio(a)); cop2.root.r = [-Math.PI / 2 - a * .4, HY, 0]; const s = 1 - a * .95; cop2.root.s = [s * (1 - a * .5), s, s * (1 - a * .5)]; }); runPose(cop2, t, 40); idle(h); face = 'grin'; if (e > .5) { tex = 'pm_yum'; open = Math.max(0, Math.sin(e * 14)) * .5; } } }
  if (i === 9) { tex = 'pm_more'; mwob = .8; const d = t - T_LIFT, e = t - T_EAT3; open = .5 + Math.abs(Math.sin(t * 7)) * .4;
    if (e < 0) { const a = eout(clamp(d / .5)); pcar.root.p = lerp3(PCP, A3(HP, [-.2, 2.4, 0]), a); pcar.root.r = [0, -Math.PI / 2 + a * .3, Math.sin(t * 6) * .05 * a]; pose_(h, { sL: [-2.9, 0, .45], sR: [-2.9, 0, -.45] }); h.body.p = [0, -.1 - Math.abs(Math.sin(t * 16)) * .05, 0]; h.root.p[0] += Math.sin(t * 40) * .02; face = 'talksq'; h.wob = .2; }
    else { const a = clamp(e / .55); open = 1; mwob = 2; late.push(() => { pcar.root.p = lerp3(A3(HP, [-.2, 2.4, 0]), slotW(), eio(a)); const s = 1 - a * .95; pcar.root.s = [s * (1 - a * .6), s * (1 - a * .6), s * (1 + a)]; pcar.root.r = [0, MY + Math.PI / 2 * 0 + a * 3, 0]; });
      argue(h, t, 1.5, 4); face = Math.sin(t * 22) > 0 ? 'scream' : 'grin'; h.root.p[1] = Math.abs(Math.sin(t * 11)) * .35; h.wob = .5; if (e > .6) { tex = 'pm_yum'; open = Math.max(0, Math.sin(e * 12)) * .7; } } }
  if (i === 10) { tex = Math.sin(t * 6) > -.6 ? 'pm_2090' : 'pm_blank'; mwob = .25; idle(h); face = 'grin'; h.root.p = A3(HP, [-.35, 0, -.2]); pose_(h, { sR: [-.8, 0, -.9], eR: [-1.2, 0, 0], sL: [-.2, 0, .2] }); h.body.r = [0, 0, .08]; }
  if (i === 11) { tex = 'pm_2090'; mwob = .25; h.root.p = A3(HP, [-.35, 0, -.2]); if (t < T_YES) { idle(h); face = 'grin'; pose_(h, { sL: [-.1, 0, .9], eL: [-1.6, 0, 0], sR: [-.1, 0, -.9], eR: [-1.6, 0, 0] }); h.body.r = [-.12, 0, 0]; }
    else { pose_(h, { sL: [-2.9, 0, .6 + Math.sin(t * 25) * .3], sR: [-2.9, 0, -.6 - Math.sin(t * 25) * .3] }); h.root.p[1] = Math.abs(Math.sin(t * 9)) * .7; h.root.r = [0, HY + (t - T_YES) * 9, 0]; face = Math.sin(t * 20) > 0 ? 'scream' : 'grin'; h.wob = .5; burst(T_YES, t, A3(HP, [0, 2, 0]), [1, .85, .35], 0, 16, 2.2, 3); } }
  if (i === 12) { const d = t - T_BURP; tex = d < 0 ? 'pm_2090' : 'pm_burp'; mwob = d < 0 ? 1.2 : .6; open = d < 0 ? .2 : clamp(1.2 - d * .8);
    if (d < 0) { idle(h); face = 'worry'; h.root.p = A3(HP, [-.35, 0, -.2]); h.head.r = [0, 0, Math.sin(t * 6) * .1]; }
    else { const a = clamp(d / .3); h.root.p = lerp3(A3(HP, [-.35, 0, -.2]), A3(HP, [-.5, 0, -.3]), a); if (a < 1) { pose_(h, { sL: [-2.6, 0, .8], sR: [-2.6, 0, -.8] }); h.body.r = [-.6 * a, 0, 0]; face = 'scream'; } else { sitGround(h, t); face = 'dizzy'; }
      const sp = slotW(); pcar.root.visible = d < 1.4; if (pcar.root.visible) { pcar.root.p = [sp[0] - d * 9, sp[1] + d * 14 - d * d * 4, sp[2] - d * 10]; pcar.root.r = [d * 7, d * 4, d * 5]; const s = Math.min(1, .1 + d * 3); pcar.root.s = [s, s, s]; }
      cop.root.visible = d < 1.2; if (cop.root.visible) { cop.root.p = [sp[0] + d * 7, sp[1] + d * 9 - d * d * 4, sp[2] - d * 5]; cop.root.r = [d * 9, 0, d * 6]; const s = Math.min(1, .1 + d * 3); cop.root.s = [s, s, s]; setFace(cop, 'scream'); pose_(cop, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); cop.wob = .8; }
      cop2.root.visible = d > .08 && d < 1.3; if (cop2.root.visible) { const e = d - .08; cop2.root.p = [sp[0] - e * 4, sp[1] + e * 11 - e * e * 4, sp[2] - e * 9]; cop2.root.r = [-e * 8, e * 3, 0]; const s = Math.min(1, .1 + e * 3); cop2.root.s = [s, s, s]; setFace(cop2, 'scream'); pose_(cop2, { sL: [-2.8, 0, .7], sR: [-2.8, 0, -.7] }); cop2.wob = .8; }
      wallet.visible = d < .7; if (wallet.visible) { wallet.p = lerp3(sp, A3(HP, [-.2, .05, .3]), clamp(d / .7)); wallet.p[1] += Math.sin(clamp(d / .7) * Math.PI) * 1.2; wallet.r = [d * 10, 0, d * 6]; }
      SH.forEach((s, k) => { s.visible = d < .6; if (s.visible) { const tg = wp(k ? hero.legR.end : hero.legL.end, [0, .03, .07]); const a2 = clamp(d / .6); s.p = lerp3(sp, tg, a2); s.p[1] += Math.sin(a2 * Math.PI) * 1.4; s.r = [d * 12, k, 0]; s.s = [.22, .1, .38]; } });
      burst(T_BURP, t, sp, [.7, .9, .6], 0, 16, 1.8, 1.5); } }
  if (i === 13) face = intro(t - T_END);
  if (i >= 1 && i <= 12) late.unshift(() => meter(t, B_, open, tex, mwob));
  setFace(h, face); for (const m of [hero, cop, cop2]) if (m.root.visible) applyNoodle(m, t); late.forEach(f => f()); return L; }
