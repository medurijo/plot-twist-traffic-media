import asyncio, base64, subprocess, sys, os, time, http.server, threading, functools
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8765"))
def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=BASE)
    h.log_message = lambda *a: None
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), h).serve_forever()
threading.Thread(target=serve, daemon=True).start()

async def main():
    mode = sys.argv[1]  # 'stills' t1,t2,...  or 'video' out.mp4 [fps] [t0] [t1]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome" if os.path.exists("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") else None,
            args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        pg.on("console", lambda m: print("console:", m.text) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: print("PAGEERROR", e))
        await pg.goto(f"http://127.0.0.1:{PORT}/" + os.environ.get("PAGE", "scene.html"))
        await pg.wait_for_function("window.ready === true", timeout=120000)
        total = await pg.evaluate("window.TOTAL")
        if mode == "stills":
            SD = os.path.join(BASE, os.environ.get("STILLS", "stills")); os.makedirs(SD, exist_ok=True)
            for ts in sys.argv[2].split(","):
                t0 = time.time()
                d = await pg.evaluate(f"window.renderAt({float(ts)}, 0.97, {str(os.environ.get('CLEAN','0')=='1').lower()})")
                open(os.path.join(SD, f"t{float(ts):06.2f}.jpg"), "wb").write(base64.b64decode(d.split(",")[1]))
                print("still", ts, round(time.time() - t0, 2), "s")
        else:
            outp = sys.argv[2]; fps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
            ta = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
            tb = float(sys.argv[5]) if len(sys.argv) > 5 else total
            n = int(round((tb - ta) * fps))
            ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "mjpeg", "-i", "-",
                                   "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", outp], stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(n):
                d = await pg.evaluate(f"window.renderAt({ta + i / fps}, 0.95)")
                ff.stdin.write(base64.b64decode(d.split(",")[1]))
                if i % 60 == 0: print(f"frame {i}/{n} {round(time.time()-t0)}s", flush=True)
            ff.stdin.close(); ff.wait()
            print("done", outp, round(time.time() - t0), "s")
        await b.close()
asyncio.run(main())
