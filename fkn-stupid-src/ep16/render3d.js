// node render.js sceneIdx...   renders scenes to scenes/sNN.mp4 (30fps) via ffmpeg pipe
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn } = require('child_process');
(async () => { const idx = process.argv.slice(2).map(Number); const SD = process.env.SD || 'scenes'; fs.mkdirSync(SD, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'whatif.html')); await p.waitForFunction('window.ready===true'); await p.evaluate(() => document.fonts.ready);
  const info = await p.evaluate(() => ({ S: window.SEGS, I: window.T_INTRO, O: window.T_OUT, E: window.T_END, sfx: window.SFX }));
  fs.writeFileSync(SD + '_sfx.json', JSON.stringify(info));
  const bounds = [0, ...info.S, info.O, info.E];
  for (const i of idx) { const f0 = Math.round(bounds[i] * 30), f1 = Math.round(bounds[i + 1] * 30); const tmp = `${SD}/s${String(i).padStart(2, '0')}.tmp.mp4`;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-tune', 'animation', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', '30', tmp]);
    for (let f = f0; f < f1; f++) { const d = await p.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', .97); }, f / 30);
      const buf = Buffer.from(d.split(',')[1], 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 72 === 0) console.log('scene', i, 'frame', f, '/', f1); }
    ff.stdin.end(); const code = await new Promise(r => ff.on('close', r)); if (code === 0) fs.renameSync(tmp, tmp.replace('.tmp', '')); console.log('scene', i, 'done', code); }
  await b.close(); })();
