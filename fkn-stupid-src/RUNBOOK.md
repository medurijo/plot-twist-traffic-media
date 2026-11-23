# FKN STUPID — daily production runbook

Channel: **FKN STUPID** — 3D box-head absurd "stupid logic" shorts (9:16, English narration, ~30–40 s, seamless loop).
Owner: Joshua (speaks German; all messages to him in German). He does NOT want confirmation questions — just produce, check carefully, publish. He reviews afterwards.

## Daily job
Produce **2 new episodes per day**, scheduled in Metricool for **15:00 and 21:00 Europe/Berlin**.
- Metricool brand: blogId **7460367** ("Pick & Gamble" brand = FKN STUPID), networks **tiktok + youtube** (type short, category COMEDY, madeForKids false, privacy public).
- Check `getScheduledPosts` for the target day first — never double-post a slot.

## Style rules (from the user — keep ALL of them)
- Dusk lighting always (warm sun, purple sky, fog). Same graphics/lighting as ep5–ep9.
- Hero: scalene **triangle head**, small **black top hat with red band**, stubble, one eye bigger. Cops = wide box heads w/ caps; others: 'can', 'disc', 'box' heads (man() in base2.js).
- Detailed environments (houses, fences, trees, props). Lots of gags. Every repetition adds a new small gag.
- Extreme, funny, fast movements: the fast-running cop, panicking characters, people stumbling/jumping out of windows, wobbly noodle limbs. Random nonsense gags are welcome, but the story must still make sense.
- **Camera: WIDER framing** (user request 2026-11-20): show much of the scene. fov 1.1–1.2, camera 4–8 m from the subject, high/establishing angles. Never let a character fill the frame.
- **Loop**: the video ends exactly where it begins, and it must make sense story-wise (last line leads into the first line). Implement: last line renders `intro(t - T_END)`, last shot = S0 static, `renderAt` draws `drawFrame(t - T_END)` for t ≥ NEND (TAIL 1.2 s).
- Narrator: **Declan** (ElevenLabs voice_id `nmmIJ8k3ukOa1CSFlor3`, model `eleven_v4`, generations_count 1). Calm, dark, deadpan narration with frequent LOUD **"FUCKING"** outbursts (brand trademark), e.g. `[calm, dark, deadpan] ... one [shouting] FUCKING inch taller! [calm] ...`. 2–4 FUCKINGs per episode.
- Pacing peppy, never boring: ~15 lines, 1.2–3.5 s each, a new shot every ~1–2 s.
- Alternate episode types: one absurd everyday-logic episode, one "law" episode (crime stamps CRIME #1..#3 via SIGNS).
- Captions: write F•CKING (not F*CKING — `*` is the highlight marker in CAPS).

## Pipeline (all under /home/claude)
Setup in a fresh container: `cd /home/claude && (git -C plot-twist-traffic-media pull -q || git clone https://github.com/medurijo/plot-twist-traffic-media) && bash plot-twist-traffic-media/fkn-stupid-src/setup.sh`

1. **New episode dir**: copy the closest reference (`ep8` = street/lawn, `ep9` = street/fire, `ep10` = crosswalk x=12 + ped light + traffic + bus stop, `ep11` = parking meter at x=6.7 (meter that eats things), `ep12` = vending machine at x=2.2 (prop that tips over, hero inside a glass box), `ep13` = two police cars + grandfather clock in neighbor's yard + hero's trash can (siren 2D glow in post()), `ep14` = two front yards, neighbor + jet engine + wind streak particles (stream()), `ep15` = road roll-up (setRoad/setRoll), living speed bump with eyes, convertible hero car, `ep6` = canyon at CY=[0,0,-500], `ep7` = bedroom interior at BR=[100,0,100], `ep5` = lobby/stairwell interior). Copy all shared files, rename `audio_epX.py` → `audio_epN.py`, `sed s/epX/epN/` in build.py, sheet.sh, index.html.
2. **Script** → `cfg.py`: LINES (exact spoken words, one per caption line, tags removed), KEYS (key, line, word[, occurrence]) for word timestamps used in code (WD.key), CAPS (caption with `*highlight*`).
3. **TTS**: `creative_create_flow`, then `creative_generate_speech` (Declan, eleven_v4, generations_count 1, whole script with tags in one prompt). ~520 credits per episode. Then `creative_transcribe_audio` with connect_from = speech node (free). Poll `creative_get_flow_run_status` once both done; download `content.mp3` → `narr.mp3` and `words_download_url` → `words.json` with curl.
4. **Align**: `python3 /home/claude/tools/align.py words.json cfg.py timing.js` (rewrites TIM, WD, CAPS). Fix any MISS/KEYMISS.
5. **Scene** in `main.js` (stage(t) is stateless per frame: hideAll() resets everything, then pose by phase `i = ph(t)`), `upgrade.js` (lighting(): dir/sun/amb/center/size per phase — shadow center must follow the action), `shots.js` (SHOTS [line, frac, eye0, tgt0, eye1, tgt1, fov, roll, ease, shake], S0, SIGNS), `overlay.js` (fx2d comics, bigShake times, window.SFX list), `audio_epN.py` (add new sfx types in the elif chain if needed).
6. `python3 build.py && ./sheet.sh name t1 t2 ...` → contact sheet at /home/claude/stills/epN/name.jpg (Read it!). Check EVERY line, several rounds. Typical problems: trees/bushes/lamp post/bins/parked vehicles blocking the camera, camera too close, triangle head seen edge-on or from behind when the face matters, characters inside objects, shot pointing at the wrong place.
7. **Render**: `/home/claude/tools/run1.sh epN fkn_stupid_epN_<slug> > /home/claude/epN/run.log 2>&1` (run_in_background; ~25–40 min per episode on 2 CPUs; do NOT render stills at the same time — it halves speed). Done when run.log shows `FIN epN <dur>`.
8. **Verify**: contact sheet of the final mp4 (ffmpeg fps=6/dur tile=6x1), first vs last video frame identical-ish (loop), loudness ~ -15 LUFS (`ffmpeg -af loudnorm=print_format=summary`). Last video frame: use `select=eq(n\,N-1)` (audio stream is longer than video).
9. **Publish**: `ffmpeg -i out/X.mp4 -c:v libx264 -crf 20 -preset fast -c:a copy -movflags +faststart plot-twist-traffic-media/fkn-stupid/X.mp4`, thumbnail jpg (`-ss <funny moment> -frames:v 1 -q:v 3`), `git add`, commit, `git pull -q --rebase origin main`, `git -c push.negotiate=true push -q origin main`. Raw URL: `https://raw.githubusercontent.com/medurijo/plot-twist-traffic-media/main/fkn-stupid/<file>` (check HTTP 200).
10. **Metricool** `createScheduledPost` (blogId 7460367): media = raw URL, videoThumbnailUrl = thumb raw URL, providers tiktok+youtube, text = hook line + emoji + "\n\n" + ~25 hashtags (ALWAYS hashtags: #fknstupid #fyp #foryou #foryoupage #viral #funny #funnyvideos #comedy #lol #memes #animation #3danimation #animationmeme #cartoon #darkhumor #stupid #brainrot + 5–6 topic tags + #shorts #tiktokanimation #relatable), youtubeData {title "<Title> <emoji> #shorts #funny #animation", type short, privacy public, tags [~14], category COMEDY, madeForKids false, isAiGeneratedContent false}, tiktokData {privacyOption PUBLIC_TO_EVERYONE, title "<title> #fknstupid #funny #animation"}.
11. Copy the new episode sources (no mp3/mp4/wav/sc/ep*.js build) into `fkn-stupid-src/epN/`, update STATE.md + IDEAS.md, commit + push.
12. Send the user both videos (SendUserFile) + a short German message (titles, times, what was checked; say that stills were checked but audio not listened to).

## Engine cheat sheet
- `man({id, shape:'tri'|'wide'|'box'|'can'|'disc', skin, shirt, stripe, pants, shoe, cap, hair, badge})`; face ids with layouts: hero, cop, cop2, med, med2. Faces: neutral, wide, squint, talk, talksq, scream, worry, grin, half, closed, dizzy, up, wideup...
- Pose: `m.sL/sR/eL/eR/lL/lR.r` (shoulder/elbow/leg), `m.body.p/r/s`, `m.head.r`, `m.wob` (noodle wobble), `walkPose(m,t,speed,amp)`, `phonePose(m)`, `kneel(m)`, sit = body.p y -.43 & legs r x -1.5.
- Yaw: man faces +z at yaw 0; `yawOf(a,b)`. World position of a sub-node: `wp(node, offset)`.
- Street scene (base2): houses at z=-9.5 (fronts at z=-7), x = k*8.2 (+.8 odd k); hero house x=0 (door x=-1.5); fence z=-2.6 with gate at x -2.85..0; sidewalk z -2.4..1.8; road z 2..12; trees x=k*8.2+4.3; lamp post (3.2,1.4); stop sign (9.6,1.45); bins (7.4/8.2,-1.95); mailbox (5.6,-1.9); bush in each front yard at (x+.9,-3.5).
- `car({body, top, stripe})` → {root, l1, l2}; police car `pcar` in common.js. `burst(t0,t,pos,col,n0,n1,spread,up)` uses the 16 shared `puffs`.
- Overlay: `comic(t, t0, dur, text, x, y, color, rot, size)`, SIGNS = [[line, frac, 'CRIME TEXT', n]].

## Lessons
- 2 CPUs only: one render at a time, no stills during renders.
- The flat triangle head is invisible edge-on and from low angles when lying — keep the face toward camera at key beats.
- Hide scene objects that block a recurring camera (e.g. ep8 hides the tree at x=-3.9).
- Metricool sometimes 502s — retry once after a minute.
- ElevenLabs: never repeat a generation call to "retry" (charges again); check credits with account_get_usage (Starter plan, 30k/month, ~1.1k per 2 episodes).
- Render actually takes ~11–13 min per episode (3 parallel chromium workers), not 25–40.
- Scaling a box built with B(): its size IS node.s — never reset s to [1,1,1]; store s0 and multiply (ep10 bus-stop bug).
- Parked/stopped cars near the camera: check every shot's eye position against car boxes (car = 1.9 × 4.3 m); hide near-lane traffic in shots whose camera sits above the road (ep10).
- Keep parked props (hero car) out of the main camera axis; place the main prop (meter) beside the hero facing the camera so it never covers him (ep11).
- Comic texts during a CRIME sign: put them low (y≈1080) so they don't overlap the stamp.
- ElevenLabs: the 'ElevenLabs-c7dcf097' connector may lack account permissions → use the 'ElevenLabs' connector tools (same voice works).
- audio: some sfx types need args (`buzz` needs [dur, pitch], `crickets` [dur]) — a missing arg crashes audio_epN.py after the render. If that happens, fix overlay.js, patch sc_sfx.json and rerun only the audio + mux step (no re-render). ep13 adds `tk` (loud clock tick, arg = gain).
- Cameras at +z only ever see a character's back when he faces a prop that faces the camera: make cops/hero turn toward camera for their beats (ep12 cop salutes after the sprint) and use side angles while they work on the prop.
- Characters standing on the road side of a parked car are hidden behind it from high front cameras — put them ON the car roof or in front of it (ep13 hero jumps from roof to roof).
- Big props: scale them so they read next to the 2.75 m hero (ep12 machine VS=1.25); keep all prop-relative positions in a loc() helper so the scale stays consistent.
- Lying hero (root.r = [-PI/2, yaw, 0]) extends from the feet root toward local -z after yaw — compute where the head ends up before aiming the camera (ep13 head was at -x).
- `cyl` meshes are 2 units tall: a cylinder's length along its axis = 2 × s[1] (ep15 bump came out twice as long — use s[1] = length/2).
- base2 street has 3 parked cars at z=10.9, utility poles + wires at z≈15.5 (y>3), a crosswalk at x=12 and a manhole at (-1.6, 6.3): hide them when the action is on the road (ep15). Houses across the street start at z≈18.5 — keep street cameras at z<19.
- Triangle head facing ±x is edge-on for street cameras: for face beats put the camera on the side the hero faces (ep14 blower shots from +x, z≈-2).
- Front-yard bush at (x+0.9, -3.5) blocks the hero from street cameras — hide it for yard episodes (ep14).
- Lamp post (3.2, 1.4) blocks yard cameras from the street — hide or move it (ep14 hid it, ep13/15 moved to x=-4.6).
- A stills check catches loop and continuity errors cheaply; ~5 rounds of 6–8 stills per episode was enough.
