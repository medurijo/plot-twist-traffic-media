// Minimal WebGL2 3D engine: meshes, scene graph, soft shadow mapping, toon-ish glossy shading.
'use strict';
const M4 = {
  ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s;
    }
    return o;
  },
  persp(fovy, asp, n, f) {
    const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
    m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m;
  },
  ortho(l, r, b, t, n, f) {
    const m = M4.ident();
    m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n);
    m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); return m;
  },
  lookAt(e, c, up) {
    let z = norm(sub(e, c)), x = norm(cross(up, z)), y = cross(z, x);
    const m = M4.ident();
    m[0] = x[0]; m[4] = x[1]; m[8] = x[2];
    m[1] = y[0]; m[5] = y[1]; m[9] = y[2];
    m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
    m[12] = -dot(x, e); m[13] = -dot(y, e); m[14] = -dot(z, e); return m;
  },
  trs(p, r, s) { // T * Ry * Rx * Rz * S
    const cy = Math.cos(r[1]), sy = Math.sin(r[1]), cx = Math.cos(r[0]), sx = Math.sin(r[0]), cz = Math.cos(r[2]), sz = Math.sin(r[2]);
    // R = Ry*Rx*Rz
    const r00 = cy * cz + sy * sx * sz, r01 = -cy * sz + sy * sx * cz, r02 = sy * cx;
    const r10 = cx * sz, r11 = cx * cz, r12 = -sx;
    const r20 = -sy * cz + cy * sx * sz, r21 = sy * sz + cy * sx * cz, r22 = cy * cx;
    const m = new Float32Array(16);
    m[0] = r00 * s[0]; m[1] = r10 * s[0]; m[2] = r20 * s[0];
    m[4] = r01 * s[1]; m[5] = r11 * s[1]; m[6] = r21 * s[1];
    m[8] = r02 * s[2]; m[9] = r12 * s[2]; m[10] = r22 * s[2];
    m[12] = p[0]; m[13] = p[1]; m[14] = p[2]; m[15] = 1; return m;
  },
  normalMat(m) { // inverse transpose of upper 3x3
    const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C || 1e-9, id = 1 / det;
    return new Float32Array([
      A * id, B * id, C * id,
      -(b * i - c * h) * id, (a * i - c * g) * id, -(a * h - b * g) * id,
      (b * f - c * e) * id, -(a * f - c * d) * id, (a * e - b * d) * id]);
  },
  apply(m, v) { const x = v[0], y = v[1], z = v[2];
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];
    return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, (m[2] * x + m[6] * y + m[10] * z + m[14]) / w]; }
};
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function scl(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

// ---------- geometry ----------
const Geo = {
  sphere(seg = 32, ring = 20) {
    const P = [], N = [], I = [];
    for (let j = 0; j <= ring; j++) { const v = j / ring, th = v * Math.PI;
      for (let i = 0; i <= seg; i++) { const u = i / seg, ph = u * Math.PI * 2;
        const x = Math.sin(th) * Math.sin(ph), y = Math.cos(th), z = Math.sin(th) * Math.cos(ph);
        P.push(x, y, z); N.push(x, y, z); } }
    for (let j = 0; j < ring; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1;
      I.push(a, b, a + 1, b, b + 1, a + 1); }
    return { P, N, I };
  },
  lathe(prof, seg = 28) { // prof: [[r,y],...] bottom to top
    const P = [], N = [], I = []; const n = prof.length;
    for (let j = 0; j < n; j++) {
      const p0 = prof[Math.max(0, j - 1)], p1 = prof[Math.min(n - 1, j + 1)];
      let dr = p1[0] - p0[0], dy = p1[1] - p0[1]; const l = Math.hypot(dr, dy) || 1; // tangent
      const nr = dy / l, ny = -dr / l;
      for (let i = 0; i <= seg; i++) { const ph = i / seg * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph);
        P.push(prof[j][0] * s, prof[j][1], prof[j][0] * c); N.push(nr * s, ny, nr * c); } }
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1;
      I.push(a, a + 1, b, b, a + 1, b + 1); }
    return { P, N, I };
  },
  capsule(r, h, seg = 24) { // along Y, total height h+2r, centered
    const prof = []; const k = 8;
    for (let i = 0; i <= k; i++) { const a = -Math.PI / 2 + i / k * Math.PI / 2; prof.push([Math.cos(a) * r + 1e-4, -h / 2 + Math.sin(a) * r]); }
    for (let i = 0; i <= k; i++) { const a = i / k * Math.PI / 2; prof.push([Math.cos(a) * r + 1e-4, h / 2 + Math.sin(a) * r]); }
    return Geo.lathe(prof, seg);
  },
  cyl(rt, rb, h, seg = 28) { // capped
    return Geo.lathe([[1e-4, 0], [rb, 0], [rb, 0.0001], [rt, h - 0.0001], [rt, h], [1e-4, h]], seg);
  },
  box() {
    const P = [], N = [], I = [];
    const f = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    f.forEach(n => {
      const u = n[1] ? [1, 0, 0] : [0, 1, 0], v = cross(n, u); const b = P.length / 3;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, c]) => {
        P.push((n[0] + u[0] * a + v[0] * c) * .5, (n[1] + u[1] * a + v[1] * c) * .5, (n[2] + u[2] * a + v[2] * c) * .5); N.push(...n); });
      I.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    return { P, N, I };
  },
  torus(R, r, seg = 40, ring = 14) {
    const P = [], N = [], I = [];
    for (let j = 0; j <= ring; j++) { const v = j / ring * Math.PI * 2;
      for (let i = 0; i <= seg; i++) { const u = i / seg * Math.PI * 2;
        const cx = Math.cos(u), sx = Math.sin(u);
        P.push((R + r * Math.cos(v)) * cx, r * Math.sin(v), (R + r * Math.cos(v)) * sx);
        N.push(Math.cos(v) * cx, Math.sin(v), Math.cos(v) * sx); } }
    for (let j = 0; j < ring; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1; I.push(a, a + 1, b, b, a + 1, b + 1); }
    return { P, N, I };
  },
  cone(seg = 24) { return Geo.lathe([[1e-4, 0], [1, 0], [1, 1e-4], [1e-4, 1]], seg); },
  arc(R, r, a0, a1, seg = 24, ring = 10) { // tube along an arc in the XY plane
    const P = [], N = [], I = [];
    for (let j = 0; j <= ring; j++) { const v = j / ring * Math.PI * 2;
      for (let i = 0; i <= seg; i++) { const u = a0 + (a1 - a0) * i / seg; const cx = Math.cos(u), sy = Math.sin(u);
        P.push((R + r * Math.cos(v)) * cx, (R + r * Math.cos(v)) * sy, r * Math.sin(v)); N.push(Math.cos(v) * cx, Math.cos(v) * sy, Math.sin(v)); } }
    for (let j = 0; j < ring; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1; I.push(a, a + 1, b, b, a + 1, b + 1); }
    // caps as small spheres are added by the caller
    return { P, N, I };
  },
  plane() { return { P: [-.5, 0, -.5, .5, 0, -.5, .5, 0, .5, -.5, 0, .5], N: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], I: [0, 2, 1, 0, 3, 2] }; },
  bolt() { // flat lightning bolt shape (extruded), in XY
    const pts = [[0.05, 1], [-0.35, 0.05], [-0.02, 0.05], [-0.12, -1], [0.35, 0.15], [0.02, 0.15], [0.2, 1]];
    const P = [], N = [], I = []; const d = 0.08;
    // fan front/back (convex-ish decomposition by triangles)
    const tris = [[0, 1, 2], [0, 2, 5], [0, 5, 6], [2, 3, 4], [2, 4, 5]];
    [d, -d].forEach((z, k) => { const b = P.length / 3; pts.forEach(p => { P.push(p[0], p[1], z); N.push(0, 0, k ? -1 : 1); });
      tris.forEach(t => k ? I.push(b + t[0], b + t[2], b + t[1]) : I.push(b + t[0], b + t[1], b + t[2])); });
    for (let i = 0; i < pts.length; i++) { const a = pts[i], c = pts[(i + 1) % pts.length]; const n = norm([c[1] - a[1], -(c[0] - a[0]), 0]); const b = P.length / 3;
      P.push(a[0], a[1], d, c[0], c[1], d, c[0], c[1], -d, a[0], a[1], -d); for (let k = 0; k < 4; k++) N.push(...n); I.push(b, b + 2, b + 1, b, b + 3, b + 2); }
    return { P, N, I };
  }
};

// ---------- renderer ----------
class Renderer {
  constructor(canvas) {
    const gl = this.gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true });
    this.W = canvas.width; this.H = canvas.height;
    const vs = `#version 300 es
      in vec3 aP; in vec3 aN; uniform mat4 uM, uVP, uLVP; uniform mat3 uNM;
      out vec3 vW; out vec3 vN; out vec4 vL; out vec3 vLP;
      void main(){ vec4 w=uM*vec4(aP,1.); vLP=aP; vW=w.xyz; vN=uNM*aN; vL=uLVP*w; gl_Position=uVP*w; }`;
    const fs = `#version 300 es
      precision highp float; precision highp sampler2DShadow;
      in vec3 vW; in vec3 vN; in vec4 vL; in vec3 vLP; out vec4 o; uniform sampler2D uTex; uniform float uTexOn; uniform vec3 uSun, uAmb; uniform float uOut; uniform vec3 uFogC; uniform vec3 uFogD;
      uniform vec3 uC, uC2, uEye, uL; uniform float uSpec, uShine, uRim, uEm, uA, uPS; uniform int uPat;
      uniform sampler2DShadow uSh; uniform float uShOn;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N;
        vec3 base=uC; float alpha=uA;
        if(uPat==1){ vec2 q=floor(vW.xz/uPS); base=mix(uC,uC2,mod(q.x+q.y,2.)); }
        else if(uPat==2){ float pl=floor(vW.x/0.13); float n=hash(vec2(pl,floor(vW.z/1.7+hash(vec2(pl,1.))*3.)));
          base=uC*(0.9+0.14*n); float edge=smoothstep(0.0,0.008,abs(fract(vW.x/0.13)-0.5)-0.488); base*=1.-0.18*edge; }
        else if(uPat==3){ float d=length(vW.xz-uC2.xz); alpha=uA*smoothstep(uPS,0.,d)*smoothstep(uPS,uPS*0.2,d); }
        else if(uPat==4){ float s=step(0.5,fract(vW.y*4.)); base=mix(uC,uC2,s); }
        else if(uPat==5){ float s=step(0.5,fract((vLP.x+0.5)*uPS)); base=mix(uC,uC2,s); }
        else if(uPat==6){ vec2 uvq=vW.xz/uPS; vec2 q=fract(uvq); vec2 fw=fwidth(uvq)*1.2; vec2 aa=smoothstep(vec2(0.035)-fw,vec2(0.035)+fw,q); float e=aa.x*aa.y; e=mix(e,0.93,clamp(max(fw.x,fw.y)*7.,0.,1.)); base=mix(uC2,uC,e); }
        else if(uPat==8){ base=mix(uC,uC2,smoothstep(0.07,0.55,vLP.y)); }
        else if(uPat==7){ vec2 q=fract(vec2(vLP.x+vLP.z, vLP.y)*uPS+0.5); float e=step(0.06,q.x)*step(0.06,q.y); base=mix(uC2,uC,e); }
        if(uTexOn>0.5){ vec4 tx=texture(uTex, vec2(vLP.x+0.5, 0.5-vLP.y)); base=mix(base,tx.rgb,tx.a); }
        vec3 Lc=normalize(uL);
        float sh=1.;
        if(uShOn>0.5){ vec3 lp=vL.xyz/vL.w*0.5+0.5; float b=0.0018; sh=0.;
          vec2 ts=vec2(1./2048.);
          for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++) sh+=texture(uSh,vec3(lp.xy+vec2(x,y)*ts*1.5, lp.z-b));
          sh/=9.; if(lp.x<0.||lp.x>1.||lp.y<0.||lp.y>1.) sh=1.; }
        float nd=dot(N,Lc); float diff=smoothstep(-0.05,0.35,nd)*0.7+max(nd,0.)*0.3;
        diff*=sh;
        vec3 V=normalize(uEye-vW); vec3 H=normalize(Lc+V);
        vec3 hemi=mix(vec3(0.58,0.52,0.62),vec3(0.93,0.96,1.08),N.y*0.5+0.5)*uAmb;
        vec3 col=base*(hemi*0.62+uSun*diff*0.72);
        if(uOut>0.){ vec3 a3=abs(vLP); float mx=max(a3.x,max(a3.y,a3.z)); float md=a3.x+a3.y+a3.z-mx-min(a3.x,min(a3.y,a3.z)); float w=fwidth(md)*1.5+uOut; col*=mix(1.0,0.22,smoothstep(0.5-w,0.5-w*0.45,md)); }
        float sp=pow(max(dot(N,H),0.),uShine)*uSpec*(0.35+0.65*sh);
        float rim=pow(1.-max(dot(N,V),0.),3.)*uRim;
        col+=vec3(sp)+vec3(rim)*mix(vec3(1.),base,0.4);
        col=mix(col,base,uEm);
        if(uEm<0.99){ float fd=length(uEye-vW); col=mix(col,uFogC,smoothstep(uFogD.x,uFogD.y,fd)*uFogD.z); }
        col=col/(1.+col*0.18); col=pow(max(col,0.),vec3(0.95));
        if(uPat==3) col=uC;
        o=vec4(col,alpha);
      }`;
    const svs = `#version 300 es
      in vec3 aP; uniform mat4 uM, uLVP; void main(){ gl_Position=uLVP*uM*vec4(aP,1.); }`;
    const sfs = `#version 300 es
      precision highp float; out vec4 o; void main(){ o=vec4(1.); }`;
    this.prog = this.mkProg(vs, fs); this.sprog = this.mkProg(svs, sfs);
    this.U = {}; ['uM', 'uVP', 'uLVP', 'uNM', 'uC', 'uC2', 'uEye', 'uL', 'uSpec', 'uShine', 'uRim', 'uEm', 'uA', 'uPS', 'uPat', 'uSh', 'uShOn', 'uTex', 'uTexOn', 'uSun', 'uAmb', 'uOut', 'uFogC', 'uFogD'].forEach(n => this.U[n] = gl.getUniformLocation(this.prog, n));
    this.SU = { uM: gl.getUniformLocation(this.sprog, 'uM'), uLVP: gl.getUniformLocation(this.sprog, 'uLVP') };
    // shadow map
    const S = this.SS = 2048;
    this.shTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.shTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, S, S);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shTex, 0);
    gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.meshes = {}; this.texs = {};
  }
  tex(name, canvas) { const gl = this.gl; let t = this.texs[name]; if (!t) { t = this.texs[name] = gl.createTexture(); } gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.activeTexture(gl.TEXTURE0); }
  mkProg(v, f) { const gl = this.gl; const p = gl.createProgram();
    [[gl.VERTEX_SHADER, v], [gl.FRAGMENT_SHADER, f]].forEach(([t, s]) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
    gl.bindAttribLocation(p, 0, 'aP'); gl.bindAttribLocation(p, 1, 'aN'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  mesh(name, g) { const gl = this.gl; const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const b1 = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b1); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.P), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const b2 = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b2); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.N), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(g.I), gl.STATIC_DRAW);
    gl.bindVertexArray(null); return this.meshes[name] = { vao, n: g.I.length }; }
  collect(node, parentM, out) {
    if (!node.visible) return;
    const m = M4.mul(parentM, M4.trs(node.p, node.r, node.s)); node.world = m;
    if (node.mesh) out.push(node);
    for (const c of node.children) this.collect(c, m, out);
  }
  render(root, cam, light) {
    const gl = this.gl; const list = []; this.collect(root, M4.ident(), list);
    const opaque = list.filter(n => n.mat.a >= 1 && n.mat.pat !== 3), trans = list.filter(n => !(n.mat.a >= 1 && n.mat.pat !== 3));
    // shadow pass
    const L = norm(light.dir); const c = light.center;
    const lv = M4.lookAt(add(c, scl(L, 40)), c, Math.abs(L[1]) > 0.99 ? [0, 0, 1] : [0, 1, 0]);
    const lp = M4.ortho(-light.size, light.size, -light.size, light.size, 1, 90);
    const LVP = M4.mul(lp, lv);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo); gl.viewport(0, 0, this.SS, this.SS);
    gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE); gl.cullFace(gl.FRONT);
    gl.useProgram(this.sprog); gl.uniformMatrix4fv(this.SU.uLVP, false, LVP);
    for (const n of (window.NOSHADOW ? [] : opaque)) { if (n.mat.noShadow) continue; gl.uniformMatrix4fv(this.SU.uM, false, n.world); const me = this.meshes[n.mesh]; gl.bindVertexArray(me.vao); gl.drawElements(gl.TRIANGLES, me.n, gl.UNSIGNED_INT, 0); }
    gl.cullFace(gl.BACK); gl.disable(gl.CULL_FACE);
    // main pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.W, this.H);
    gl.clearColor(...cam.bg, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const VP = M4.mul(M4.persp(cam.fov, this.W / this.H, 0.08, 300), M4.lookAt(cam.eye, cam.target, cam.up || [0, 1, 0])); this.VP = VP;
    gl.useProgram(this.prog); const U = this.U;
    gl.uniformMatrix4fv(U.uVP, false, VP); gl.uniformMatrix4fv(U.uLVP, false, LVP); gl.uniform3fv(U.uEye, cam.eye); gl.uniform3fv(U.uL, L);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.shTex); gl.uniform1i(U.uSh, 0); gl.uniform1i(U.uTex, 1); gl.uniform3fv(U.uSun, light.sun || [1.05, 1.0, 0.92]); gl.uniform3fv(U.uFogC, light.fogC || [0, 0, 0]); gl.uniform3fv(U.uFogD, light.fogD || [1000, 2000, 0]); gl.uniform3fv(U.uAmb, light.amb || [1, 1, 1]);
    const draw = n => { const m = n.mat;
      gl.uniformMatrix4fv(U.uM, false, n.world); gl.uniformMatrix3fv(U.uNM, false, M4.normalMat(n.world));
      gl.uniform3fv(U.uC, m.c); gl.uniform3fv(U.uC2, m.c2 || m.c); gl.uniform1f(U.uSpec, m.spec ?? 0.15); gl.uniform1f(U.uShine, m.shine ?? 20);
      gl.uniform1f(U.uRim, m.rim ?? 0.1); gl.uniform1f(U.uEm, m.em ?? 0); gl.uniform1f(U.uA, m.a ?? 1); gl.uniform1f(U.uPS, m.ps ?? 1); gl.uniform1i(U.uPat, m.pat || 0);
      gl.uniform1f(U.uShOn, m.noRecv ? 0 : 1); gl.uniform1f(U.uOut, m.out ?? 0); if (m.tex && this.texs[m.tex]) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.texs[m.tex]); gl.activeTexture(gl.TEXTURE0); gl.uniform1f(U.uTexOn, 1); } else gl.uniform1f(U.uTexOn, 0);
      const me = this.meshes[n.mesh]; gl.bindVertexArray(me.vao); gl.drawElements(gl.TRIANGLES, me.n, gl.UNSIGNED_INT, 0); };
    const ce = cam.eye; const dist = n => { const w = n.world; const dx = w[12] - ce[0], dy = w[13] - ce[1], dz = w[14] - ce[2]; return dx * dx + dy * dy + dz * dz; };
    const isBig = n => n.mesh === 'box' && n.s[0] * n.s[2] > 6; const big = opaque.filter(isBig), rest = opaque.filter(n => !isBig(n));
    rest.sort((a, b) => dist(a) - dist(b));
    gl.disable(gl.BLEND); rest.forEach(draw); big.forEach(draw);
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE); gl.depthMask(false);
    trans.forEach(draw); gl.depthMask(true);
  }
  project(p) { const v = M4.apply(this.VP, p); const k = 1080 / this.W; return [(v[0] * 0.5 + 0.5) * this.W * k, (1 - (v[1] * 0.5 + 0.5)) * this.H * k]; }
}
class Node {
  constructor(mesh, mat, p, s, r) { this.mesh = mesh || null; this.mat = Object.assign({ c: [1, 1, 1], a: 1 }, mat || {});
    this.p = p || [0, 0, 0]; this.s = s || [1, 1, 1]; this.r = r || [0, 0, 0]; this.children = []; this.visible = true; }
  add(...c) { this.children.push(...c); return this; }
}
