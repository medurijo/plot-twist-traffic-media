// usage: node still.js out_dir t1 t2 ...  -> renders stills (scaled contact sheet done separately)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'index.html'));
  await p.waitForFunction('window.ready === true', null, { timeout: 20000 });
  await p.evaluate(() => document.fonts.ready);
  for (const t of ts) {
    const s = Date.now();
    await p.evaluate(t => window.renderAt(t), parseFloat(t));
    await p.screenshot({ path: `${out}/s_${t}.jpg`, type: 'jpeg', quality: 85 });
    console.log(t, Date.now() - s, 'ms');
  }
  await b.close();
})();
