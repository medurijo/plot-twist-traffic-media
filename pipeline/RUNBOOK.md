# Plot Twist Traffic – daily production runbook

Owner: Joshua (medurijo, joshua.meduri@gmail.com). He speaks German; videos are English.
Standing instruction (2 Nov 2026): **every day 2 videos, posted at 15:30 and 18:00 Europe/Berlin,
fully automatic, no confirmation needed.** He checks occasionally and will take a video down
or complain if it is bad. Quality and creativity matter more than speed.

## 0. Restore the pipeline (fresh container)
```bash
cd /home/claude && git clone https://github.com/medurijo/plot-twist-traffic-media && \
  bash plot-twist-traffic-media/pipeline/setup.sh
```
Everything runs in `/home/claude/fahrschule` (paths are hardcoded). Episode folders `epNN/`
(episode folder number = Q number + 5, e.g. Q33 = ep38). `ep36`–`ep38` are full reference
episodes – copy the structure of the closest one.

## 1. Decide what to make
1. Read `STATE.md` (last Q number, the episode announced in the last outro, history).
2. Check Metricool (blogId **7402363**) with `getScheduledPosts` for the target day: if a
   15:30 or 18:00 slot is already filled, skip that slot (never double-post).
3. Look at performance: `getAnalyticsDataByMetrics` for youtube/tiktok/facebook over the last
   ~14 days (views, likes, comments, avg watch time). Note in `STATE.md` which topics/hook
   styles do best and lean toward them. Don't copy – find new situations in that spirit.
4. The first video of the day is ALWAYS the one announced in the previous outro.
   The second comes from `IDEAS.md` (bottom list, in order), skipping anything that would give
   two of the same category in a row (e.g. never two parking episodes back to back).
   If the list runs out, invent new ones in the same style and append them to IDEAS.md.

## 2. Creative direction (user feedback, binding)
- Format: 9:16 1080×1920, ~60–70 s, Kokoro voice **bm_george**, English.
- Structure: hook → WRONG way → rewind → RIGHT WAY → "Exam passed" → outro announcing next episode.
- **STYLE SWITCH (user, 3 Nov 2026): from Q34 on, back to the OLD opening style** (like Q29
  treadmill ep32, Q28 fashion photographer ep31, Q30 dominoes ep33 and everything before).
  The opening must NOT look like a driving-school lesson / driving-tip video: no "DRIVING TIP: …"
  pill, no junction/rule diagram cards, no explaining the rule in hook1. Instead: one short,
  punchy everyday line, then straight into the twist. Examples:
  ep32 hook1 "You're driving to work. Foot on the gas. But somehow, you're not moving." /
  hook2 "The road is a giant treadmill. What do you do?"; ep31 "There's a speed camera ahead.
  But this one is a little different." / "It's a fashion photographer. What do you do?".
  Mystery/reveal hooks welcome. HUD pills only for the gag (like ep32: "ROAD: GIANT TREADMILL").
- Keep using the NEW ideas list (everyday situations with ONE crazy element: knight in blind
  spot, crocodile kerb, parrot STOP/GO man, …) – only the presentation goes back to old style.
  Q32 (ep37) / Q33 (ep38) are references for creativity of the wrong/right ways, NOT for the opening;
  use pipeline/ep32 + pipeline/ep31 openings as the opening reference.
- Wrong AND right way: very fantastical and creative, with escalation that makes sense in the
  story (rocket car into the circus tent; police tortoise chasing you for 7 years while a tree
  grows through your car). The right way is also absurd and charming (handstand on the pump to
  cure hiccups, strawberry on a fishing rod = turbo tortoise). No dry rule lessons.
- User praised Q32 fire-breather and Q33 tortoise as the quality bar. Q31 bears was "not
  creative enough" – avoid plain/predictable solutions.
- Characters with personality, payoff gags, a clear funny final image.
- **GRAPHICS (3 Nov 2026, user wants beautiful light & ambience):** every new episode sets
  `"gfx": true` in script.json `meta` (enables GFX mode in common.js: 2D gradient sky that keeps the
  per-scene background colour, low warm golden sun with long shadows, half-res GTAO ambient occlusion,
  colour grading + vignette). Tune per scene with `meta.gfxopt` (e.g. `{"sunDir":[110,60,80],
  "sunCol":"#ffd9a8","contrast":1.13,"vignette":0.26}`); night/indoor scenes can pick a different
  sunDir/colour. Choose a lighting mood that fits the story (golden afternoon, sunset, blue hour…).
  Bloom is OFF on purpose (it breaks the transparent sky). Renders take ~2x longer (~90 min/episode),
  so queue both episodes early. Check stills: shadows must not hide faces/gags.
  **User (3 Nov): "nachher ist besser, aber achte darauf, dass dadurch nicht wichtige Details untergehen."**
  In EVERY stills round explicitly check: faces/eyes, props of the gag (ticket, strawberry, nozzle…),
  HUD-relevant objects and the hero car are clearly lit and readable – not swallowed by house/tortoise
  shadows, AO darkening or the vignette. Fixes: raise fill (`gfxopt.hemi` 0.7–0.9), rotate `sunDir` so
  the key subject faces the sun, lower `vignette`, add a small local PointLight on the subject, or
  move the camera. Readability beats mood.
- SFX must NEVER cover the narrator. Camera smooth and wide, subject always readable; no
  flicker, no objects blocking shots (check pillars/hedges/houses in stills).

- **CONTENT SWITCH (user, 18 Nov 2026): too many animals lately.** Go back to the spirit of the early episodes
  (black hole in the roundabout, the other lane full of tanks, tsunami on the on-ramp, meteorite over the jam, UFO beams up
  the car ahead, lava on the road): crazy EVENTS that happen on the road, absurd but with a touch of realism.
  Default = event/object/weather/vehicle twist, NOT an animal. An animal episode is allowed only occasionally
  (at most ~1 in 4), never two in a row. Old-style one-line twist opening (see above) stays.

## 3. Build an episode (commands from /home/claude/fahrschule)
1. `mkdir epNN && cp ep38/scene.html epNN/` ; write `epNN/script.json`
   (meta q + next[2 lines], segments hook1,hook2,wrong1-4,right1-7,outro; cues
   `[seg, word, lib, gain, offset]`; beds `[kind, from, to, gain]`). Copy format from ep37/ep38.
   wrong4 = "Exam failed.", right1 = "Here's how you do it properly.", right7 = "Exam passed.",
   outro = "Next exam question: <next>. Follow, so you don't miss it."
2. `python3 tts.py epNN && python3 timeline2.py epNN && python3 mix_ep.py epNN`
3. Write `epNN/scene.js` (Three.js r160 + common.js helpers: WT, S, TOTAL, tRew0, makeCar,
   placeCar, applyCam, pill, floatText, project, canvasTex, makeLandscape, roundedPath, pathAt,
   hemi, sun, SKY; camera keys with `cut(t0,f)` so cameras hold before cuts). Start from the
   most similar reference scene.
4. Stills check (MANDATORY, several rounds): `bash sheet.sh epNN /tmp/a.jpg 1,3,6,...` and look
   at every frame with Read. Fix framing, blocking objects, clipping, HUD overlaps, legibility.
5. Render: put 13 jobs in jobs.txt: `epNN pNN t0 t1` splitting [0,TOTAL] into 13 equal parts
   (`flock jobs.lock -c 'cat >> jobs.txt'`), `rm -f STOP`, then run `bash waitrun.sh` in the
   background (2 runners; ~45–60 min per episode). Both episodes can be queued together.
6. `bash finalize4.sh epNN PlotTwistTraffic_QNN_Name.mp4 p00.ts … p12.ts`, then a contact sheet
   (`ffmpeg -i out.mp4 -vf "fps=1/3,scale=180:-1,tile=8x3" -frames:v 1 sheet.jpg`) and Read it.
7. Thumbnail: still with `CLEAN=1` (no HUD), then from `thumbs/`:
   `python3 -c "import make_thumb as m; m.make(src, out, ['TOP LINE','LINE 2'], [], (cx,cy,r), 'TAG', '#e33')"`
   (see existing calls in git history / thumbnails for style: big 2-line caption + red ring).

## 4. Publish (no confirmation needed)
1. Copy video to `plot-twist-traffic-media/videos/`, thumbnail to `thumbs/`; commit as
   `medurijo <joshua.meduri@gmail.com>` with trailers
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (+ the session line) and push.
2. Metricool `createScheduledPost`, blogId 7402363, date `YYYY-MM-DDT15:30:00+01:00`
   (+02:00 in summer), publicationDate `{dateTime, timezone:"Europe/Berlin"}`, autoPublish true,
   media `https://raw.githubusercontent.com/medurijo/plot-twist-traffic-media/<SHA>/videos/<file>.mp4`,
   videoThumbnailUrl same pattern for thumbs/<file>.jpg,
   providers youtube + tiktok + facebook:
   - youtubeData {title, type:"short", privacy:"public", category:"COMEDY", madeForKids:false, isAiGeneratedContent:false}
   - tiktokData {title, privacyOption:"PUBLIC_TO_EVERYONE", isAigc:true}
   - facebookData {type:"REEL"}
   - text: `Driving test question #N: <situation>. What do you do?\n\nWould you have passed? Comment your answer 👇\n\n#plottwisttraffic #drivingtest #drivingschool #<topic> #funny #animation #shorts`
   - YT title style: `Fire-Breather With HICCUPS?! 🔥 Driving Test Question #32`
   (curl of raw.githubusercontent from the container gives 403 via proxy – Metricool fetches fine.)
3. Update `STATE.md` (history line per episode, next announced, perf notes) and IDEAS.md; push.
4. Send the user a short German message (video + thumbnail via SendUserFile, one line each:
   what it is and when it posts). Never wait for an answer.

## 5. If something goes wrong
- Only one episode finished in time → schedule it, report the other.
- Never post a broken video (black frames, missing audio, wrong length). Check with ffprobe + sheet.

## 6. Lessons (Nov 3 run)
- `WT(seg, word)` matches by prefix: "you" hits "your" first -> use `WT(seg, 'you', 1)`.
- TTS word timings can be badly off after a comma (ep40 right3); check `audio/timings.json` vs the wav envelope and fix by hand, then rerun timeline2 + mix.
- 9:16 frame is narrow (horizontal half-FOV ~11.6°): put the camera roughly in line with subject pairs (behind/above), not beside them.
- Static props near camera paths (oncoming cars, parked cars at the gap ends) block shots – leave room for the camera.
- mix_ep.py now has `fanfare`, `clang`, `chomp`, `burp` cues and a `gallop` bed.

## 7. Lessons (Nov 5 run)
- Per-shot FOV: return `[pos, look, fov]` from camera keys and set `camera.fov` in update (ep41 telephoto "digger POV" shot uses fov 6–9).
- InstancedMesh whose instances move far from the origin must have `frustumCulled = false` (flying melons were invisible).
- Slopes: build the world in a tilted `hill` group (ep42) and convert camera keys with `hill.localToWorld`; vertical props go in an `upright()` sub-group.
- Emissive traffic-light lamps: pure colours, intensity 1.0, `toneMapped:false` – higher values clip to orange/white.
- Two renders + stills on 2 CPUs: ~10–12 min per pair of 5 s parts; waitrun.sh stops after ~115 min, relaunch it if jobs remain.

## 8. Lessons (Nov 6 run, ep43/ep44)
- World state that is a pure function of t (ep43 duck ring) jumps at the rewind end (state(REW_TARGET) -> state(right1.start)): hide it with a camera `cut(tRew1, …)`.
- Never put the camera inside a car: the roof's underside is visible (dark band). Shoot close-ups from outside, 3/4 front.
- `bubble()` in ep43/ep44 clamps its x so long texts don't leave the frame – copy that version.
- mix_ep.py has a new `jingle` cue (ice-cream-van tune). ep44 has a monotone-cubic `mono()` helper for smooth keyed motion and a vertex-animated flood plane.
- Telephoto shots (fov 13–18) are great for following one small character (hat duckling) or showing something far away.

## 9. Lessons (Nov 9 run, ep45/ep46)
- Tentacles / giraffe neck: tube along a cubic Bezier rebuilt every frame (`makeTent`/`buildTent` in ep45, `buildNeck` in ep46) + per-arm pose schedule `[t0, pose, blend]` blending control points. Very flexible for arms reaching into windows, scrubbing, lifting a car.
- Hide a reveal behind a prop: ep45 "SUPER SHINE 3000" housing with portholes (canvas texture with destination-out holes + alphaTest) for the eyes, flies off at the reveal.
- Hero-car glass is nearly black: anything dark on it (window gap) is invisible -> lighten `bodyG.children[1].material` for that car and add a HUD arrow.
- Decals on the windscreen: offset >= 0.085 along the normal (glass bevel), and check orientation (setFromUnitVectors may flip the image -> rotateZ(PI)).
- Sign boxes/posts at portal frames sit right in camera lines: check every cut for posts/signs between camera and subject (ep45 front/back signs, ep46 deck edges).
- Stills while two renders run take ~3x longer (sheet.sh can exceed the 2 min tool timeout -> pass a longer timeout).

## 10. Lessons (Nov 10 run, ep47/ep48)
- `WT()` prefix traps again: 'drive' hits 'drivers', "It's" hits "it's" earlier in the line, 'And' hits ', and' mid-sentence -> grep every WT word against timeline.json and pass k.
- Fixing word timings in audio/timings.json by word text also hits repeated words ('the') – fix by index.
- Instanced crowd with per-part local matrices (ep47 `PARTS`: body/head/leg groups, head pitch via neck pivot, legs swing + tuck) works well for 100 animals; sleeping = eye-white y-scale + pupils 0.
- Co-rotating ring layout with a hole lets the car squeeze into a moving flock (ep47 `A_CAR`).
- Chain body on a spiral (ep48 `SPIR`, Archimedean spiral by arc length) = a creature curling into a rolling wheel; car as axle, roll = -dist/R.
- Under-belly camera along the track axis (ep48 x=13, z=0) gives a great "tunnel of legs" shot.
- Rainbow car: swap body material to a gradient canvas map (+ emissiveMap) and scroll `offset.x`.
- Thumbnail with the subject high in frame: shift the still down (stretch top sky rows) before make_thumb so the headline does not cover the face.

## 11. Lessons (Nov 11 run, ep49/ep50)
- GTAO renders sprites (fire/smoke) as full quads -> dark blocky squares. Fix per scene: `import { aoPass }` and override `aoPass.overrideVisibility` to also hide `o.isSprite` / `o.userData.noAO` objects (see ep49/ep50 top).
- Additive fire sprites wash out to white on the transparent-sky GFX render: use normal blending.
- Shape with a hole that touches the outer edge fails to triangulate: build arches/portals as one outline (ep49 facade).
- Eyelid hemispheres: iris/pupil/highlight must stay inside the lid radius or they poke through closed lids.
- Wipers on the windscreen: group oriented with setFromUnitVectors(z, glassNormal); local +y then points into the bonnet, so sweep with negative rotation.z. Hero glass lightened (`bodyG.children[1]`) so light-grey wipers read.
- WT word timings were off again for long multi-sentence lines; `python3 align_timings.py epNN seg1,seg2` re-aligns words to silence gaps by syllable rate (skips if fewer gaps than phrases -> fix by hand) – check every segment with commas against the wav envelope.
- Renders ~6-8 s/frame with stills running in parallel: ~2 h per episode. A watchdog loop that relaunches waitrun.sh while jobs remain avoids stalls.

## 12. Lessons (Nov 12 run, ep51/ep52)
- Big character heads need room: 9:16 close-ups at < 6 m crop everything. Scale the head (`hd.scale` 0.82 in ep51) and keep the head 7–9 m from the camera; check the gag prop (paper hat, cone) is fully in frame.
- Eyes that scale up must move the pupil/highlight with them (`E.p.position = c0 + (p0 - c0) * scale`), otherwise the white swallows the pupil.
- Hiding a character before the reveal: push the whole body group back behind a wall (ep51 `emerge`) or behind a billboard (ep52 elephant only has head/ears/trunk, body never modelled).
- Canvas text on an extruded/box side reads mirrored from the other side: keep text only on a plane you orient to the camera (ep51 TO GO flag rotation.y = 2.5 for a +x/-z camera).
- Thin CircleGeometry nostrils/decals: always set their scale (unscaled radius-1 discs showed up as huge black shapes).
- Low cameras + a billboard in front of a character hide the eyes: put the camera above the occluder's top edge.
- `TubeGeometry` drawRange grows a ketchup squiggle; custom bezier tube with per-u radius function (ep52 `buildTrunk`) gives squeeze pinch, travelling gulps and a trumpet flare.
- Render speed this run: ~5.7 s/frame with 2 runners (~13 min per 4.6 s part each) -> ~2 h per episode; schedule the first finished episode right away.

## 13. Lessons (Nov 13 run, ep53/ep54)
- Winter scene without makeLandscape (ep53): own snow plane, snowy pine cones (3 stacked instanced cones, white top), snow mounds, `hemi.groundColor` bluish, `scene.fog` pale; falling snow = THREE.Points around the camera, positions a pure function of t (hidden from AO automatically).
- Character that falls apart: build parts as separate top-level groups (ep53 LB/LM/LH) and compute their world positions per frame -> easy to separate, roll (axis = up x dir, angle = dist / r) and reassemble on something else.
- River without terrain cuts (ep54): opaque water plane at ground level + rock lines on the banks; a giant can stand "in" it (everything below the water plane is hidden) and rise up for the reveal (root y from -7.6 to -1.3).
- makeLandscape trees get very close behind the set: pass a generous `avoid` box.
- Distant/static props cast long thin shadows when they "sink" under the water: hide them (ep54 club).
- Render with stills running in parallel is ~3x slower (first ep53 parts took ~40 min each); do stills before queueing or accept the delay.

## 14. Lessons (Nov 14 run, ep55/ep56)
- `mkdir -p epNN/out` BEFORE queueing jobs – without it every job fails instantly and is still marked done.
- `watchdog.sh` (in pipeline/) relaunches waitrun.sh while jobs.txt has content: `nohup bash watchdog.sh &` once after queueing.
- Removing files with a glob after `cd` is blocked by the safety check – just let re-renders overwrite `out/pNN.ts`.
- Body as one vertex-coloured tube along a posed spine (ep55 walrus `buildBody`: lying <-> upright bezier blend, belly colour from the cross-section angle, roll by rotating the parent group about the spine axis) – head kept as a separate world group.
- Half-sphere eyelids: Rx(+a) turns the +y cap towards +z (closed), negative = open. Pupils must stay inside the lid radius.
- Car paint pattern: replace the body/roof geometry UVs with a planar projection (ep56 `uv = (x+1)/12`) and swap the body material (striped car).
- Kids/band/elephant walking over the car: walker y = car height profile across x; squash = hero.scale.
- mix_ep.py: new `notes` (piano run) and `gallop1` cues.

## 15. Lessons (Nov 16 run, ep58/ep59)
- Previous run lost its Q53 sources (only the thumbnail was committed) -> ALWAYS commit epNN sources to pipeline/ right after the stills are approved, before rendering.
- The checkout can be a detached HEAD: `git checkout main && git pull` before committing.
- Goat (ep58): character inside a box = body hidden in the machine, head pokes out of a dark hatch decal (neck intersects the solid face, reads as a hole); roll-up shutter = flap scale.y -> 0; jump out through a hinged lid.
- "Eaten" car parts: hide the original mesh and fly a clone (copy matrixWorld) into the mouth while shrinking -> no need to walk the character to every part.
- Driver visible through windows: make the hero glass transparent (opacity ~0.42, depthWrite false, noAO).
- Head pose: NECK.rotation.z tilts the neck forward (negative), HEAD.rotation.z positive = nose UP; for "nose on the button" use a negative head pitch.
- Penguins (ep59): 202 instanced penguins, per-part local matrices (incl. animated flippers/feet), base matrix Euler 'YZX' (roll, yaw, -pitch) -> pitch PI/2 = belly slide; per-instance colour via setColorAt (grey baby).
- Column of walkers moving through a static camera: check the camera is never inside the column at ANY time of the shot (the "very slowly" camera ended up inside the parade).
- Marching to the beat: drive the waddle phase from the march bed tempo (60/132 s per step) so picture and sound match.

## 16. Lessons (Nov 17 run, ep60/ep61)
- Kokoro sometimes runs a comma phrase together ("You glide in, sideways") or stretches "Whee!" – align_timings.py then mis-assigns words. Always print the 50 ms envelope (`#`/`.` string) of segments with exclamations and fix by hand by index.
- WT prefix trap again: 'drive' matched "drivers" (ep61) – also check mix cues in script.json, they use the same prefix match.
- Snail (ep60): body = vertex-coloured tube along a fixed bezier spine with y clamped to 0 (flat foot); shell = logarithmic-spiral tube (R = R0·e^(-kθ), tube radius 0.45R) in the local YZ plane; "lay flat" = rotate the shell 90° about the forward axis.
- Slime trail: ribbon mesh along a Catmull-Rom path, revealed with setDrawRange; must be DoubleSide (winding faced down -> culled, invisible).
- Night scene (ep61): dark-blue scene.background + gfx sky, emissive window textures (emissiveMap), a few PointLights only near the action, moon = MeshBasic circle with fog:false, stars = Points. Glowing eyes = MeshBasic iris (toneMapped false) + small PointLight in front – keep it weak (~7) or it tints the whole face.
- Eyelid hemisphere (cap along +y) for eyes looking -z: open = rotation.x +0.62π (cap folds back into the head), closed = -0.5π.
- "Reveal by light": darken the creature materials (lerp colour to near-black) until the reveal word, then flicker a street lamp on.
- Gantry posts / lamp poles / sign poles keep ending up in the foreground: for every camera key check the line camera->subject against all vertical props.

## 17. Lessons (Nov 18 run, ep62/ep63)
- Render cost: instanced wheat tufts (9000 bundles of 9 cones + 9 spheres) doubled the frame time (~20 s/frame under load). Keep instanced foliage low-poly (3-seg cones, 4x3 spheres, < ~1M tris total) and time one still per scene (`render.py stills`) before queueing: target <= 5 s/frame single.
- Tornado (ep62): 3 nested LatheGeometry funnels r(y)=2+0.11y+0.0062y^2 with alpha streak canvas textures, vertexColors brown->grey, transparent, depthWrite false, noAO; debris = Points (size scaled with the tornado scale), dust skirt = sprites; spin angle from an integrated rate table (spinTable) so it can slow down smoothly. Inside-the-tornado shot: switch the funnel materials to BackSide and put the camera outside, co-rotating with the passengers.
- Live crop circle: 2048 canvas field texture redrawn from t each frame (base copy + polyline up to the current path parameter).
- Object glued to a rotating part (car on the windmill sail): world matrix = part.matrixWorld * fixed local matrix, decompose into the car.
- Drawbridge (ep63): leaf = pivot group at the hinge, car placed with leaf.matrixWorld * translation; the deck top faces the hinge side when raised (camera must be on the hinge side to see the car, the other side shows the underside).
- Town quays with house rows: cameras over the water or above roof height, otherwise they end up inside houses. Ship cameras that move with the ship also need z inside the river.
- floatText helper argument order: (text, x, y, t, a, b, size, color, rot) – a wrapper with swapped size/colour silently draws nothing.
- Long tool sleeps can get the container's background jobs killed (exit 137): after any interruption check done.txt vs jobs and requeue the missing parts (half-written .ts files are simply overwritten).
- Metricool createScheduledPost can return 502: check getScheduledPosts for that slot before retrying, to never double-post.

## 18. Lessons (Nov 19 run, ep64/ep65)
- `git pull` failed on a detached HEAD in the fresh container: `git checkout main && git pull origin main` first, then setup.sh.
- mix_ep.py `meta.concert` now also takes a LIST of ranges (`[["hook2","Music","wrong4"],["right2","Hazard","right7"]]`) = funky 118 bpm band (disco) in several parts; drive visual beats from the same clock: beat = (t - (WT(seg,word) - 0.05)) / (60/118).
- Disco look (ep64): blue-hour background, lamp discs MeshBasic toneMapped:false + small additive halo (keep opacity <= 0.2 or they wash the lamp out), rotating coloured SpotLights from the head, mirror-ball dots = InstancedMesh of flat circles on the ground (polygonOffset, fog:false, frustumCulled=false).
- Hero headlights/indicators are hard to read in daylight or from behind: add additive blob sprites / small additive discs on the lamps when they flash (ep64 blHaloM, ep65 flares; keep them small, 0.2-0.75 m).
- roundedPath radius r rounds the corner r metres BEFORE the corner on each leg: a "straight" stretch ends r m earlier than the corner point (ep65 lorry was still on the curve) -> put the corner far enough away and keep stop positions on the true straight.
- Big box props (a 9 m house) block everything in 9:16: for flights/landings go wide and high (camera 35+ m away); for the inside of a building, hide roof + ceiling and shoot a top-down "dollhouse" view – very readable (ep65 drive-through).
- A cab/vehicle with a visible driver must be hollow (floor, roof, back, sides + transparent windscreen); a solid box hides the driver.
- Character facing: check which way the face points vs. the camera for every shot (grandma first showed her back); arm sideways reach = rotation.z on the shoulder pivot.

## 19. Lessons (Nov 20 run, ep66/ep67)
- Another routine (FKN STUPID channel) pushes to the same repo: always `git pull --rebase origin main` right before `git push`.
- Rolling road (ep67): one strip mesh (top/bottom/2 edges) rebuilt every frame from a contact parameter sc: s < sc flat, s > sc on an Archimedean spiral (core radius 3.2, thickness 0.3, r(phi) = r0 + th*phi/2pi, arc length solved with the quadratic); sc < 0 = rigid free roll (rotate about the centre by D/Yc, move +z). Top surface faces INWARD (like a real carpet roll), so a car can loop on the inner core surface (pitch = psi). Index winding (a, b, c, b, d, c) for an upward-facing top; underside with BackSide.
- Swapping the top material when the roll unrolls (asphalt -> red carpet) is invisible because the top faces inward while rolled.
- Town crossing (ep66): houses at x = +-14 swallowed several wide cameras (camera inside a house = flat orange/blank frame). Put wide cameras on the road axis or above roof height.
- Crowd lines along a road: the camera must look ALONG the line from beyond the subject (crowd at the frame sides), not from inside the crowd.
- sheet.sh fails with a single timestamp (hstack=1) – read the still file directly.

- Waiting for renders: identical tool commands can return a cached result (no real sleep) – vary the command text each time. `sleep` sometimes returned instantly; `python3 -c "import time; time.sleep(240)"` works. A wait of ~300 s got killed (exit 137) together with the runners and the watchdog: keep waits <= 240 s, then check done.txt and requeue the parts that were running.

## 20. Lessons (Nov 21 run, ep68/ep69)
- Real hole in the ground (ep68 sinkhole): STENCIL. `composer.reset(new WebGLRenderTarget(W,H,{type:HalfFloat,samples:4,stencilBuffer:true}))`; opening disc (colorWrite false, stencil Replace, renderOrder 1) -> interior walls + bottom (stencil Equal, depthTest false, depthWrite true, renderOrder 2) -> everything that can be inside the hole renderOrder 3. Objects below ground outside the opening stay hidden by the ground. Mark the stencil meshes noAO. Grow it by scaling the group in x/z (jagged unit outline).
- Separate far-away sets in the same scene work well for "teleport" gags: an underground shaft at x=900 (BackSide MeshBasic tube, strata -> lava texture, camera inside), Australia at x=2600 (own desert plane beyond the landscape, own sky colour per frame).
- Traffic light as a character: horizontal lamp housing on a mast arm reads like a face (red+yellow lamps = eyes): angry eyebrows / sunglasses on the lamps.
- Long curved motorway (ep69): ribbon mesh along roundedPath (DoubleSide, else culled), lateral offset frame(s,d) with right = (cos h, -sin h); landscape avoid = distance to path samples.
- Night/eclipse lighting: darken sun + hemi by E, background lerp to navy, a big soft PointLight above the hero (range 70, ~380) so the road reads; additive sprites for car lamps; a dark green strip appears where a small fill light hits the grass – keep fills wide.
- Sky objects "at infinity": position them relative to the hero (not the camera) so fall/landing animations stay deterministic. Telephoto fov 14 for a 4.7 deg moon.
- Moon face: closed eyes need a visible lid arc (torus) – a squashed eye alone is invisible.
- mix_ep.py cues take an optional 6th element = word index for repeated words (["wrong2","Red","crack",0.25,0,1]).
- Stills render ~2 s/frame without renders running; ep68/ep69 render ~3.5-4.5 s/frame with 2 runners.

## 21. Lessons (Nov 22 run, ep70/ep71)
- Kokoro crams a spoken countdown ("Three. Two. One.") into ~1 s. Fix: insert silence into audio/<seg>.wav at the word boundaries (20 ms envelope) and shift the word timings in audio/timings.json (small pad script: insert zeros at t, shift words with s >= t, dur += pad), then rerun timeline2 + mix.
- A far-away set (space at x=6000: earth sphere, black dome, stars with fog:false) is visible from the main set when the camera looks that way (black curve in the sky): toggle those objects' visible only while the camera is there.
- GFX 2D sky gradient turns the horizon brownish on a black background: for space use a BackSide MeshBasic black dome around the set.
- Smoke sprites near the camera wash the frame white: fade sprites by distance to the camera position (use the cam(t) position, the camera is only placed at the end of update).
- Contrail drawing: TubeGeometry along a sampled polyline (custom Curve with arc length) + setDrawRange(0, segments * radial * 6); a heart = 16sin^3 / 13cos-5cos2-2cos3-cos4 in a vertical plane facing the viewer.
- Suspension bridge (ep71): towers + parabola main cables + instanced hangers; cameras outside x = +-7.6 see hangers in front of the subject -> keep cameras inside the cable planes or drop a few hangers near the action.
- Gull side kick: from the front its flat wings read like aircraft wings through the car -> shoot 3/4 side so the head and eyes read; when eyes scale up, move the pupils outward with them.

## 22. Lessons (Nov 23 run, ep72/ep73)
- An explainer-style TEST of Q67 (ElevenLabs voice) was found in pipeline/ep72 – it was never adopted in this runbook, so the run made the standard version and moved the test to pipeline/ep72_test_explainer. Only switch style when RUNBOOK/STATE says so.
- Jet (ep72, from the test): fuselage livery windows don't read; add flat window strips (PlaneGeometry 24x0.62 at local x=±2.13, y=0.55, MeshBasic) and swap the strip texture (faces / clapping hands, toggled at 7 Hz) for an applause gag. Text on a cylinder texture is mirrored on one side – leave it out.
- Car riding on a moving vehicle: compute the roof point with the vehicle pose (Ry(h)·Rx(pitch) by hand, `pl2w`) and blend from the ground pose with a sin arc for the hop.
- Living crash barrier (ep73): ribbon of 64 points rebuilt per frame (width axis = up projected off the tangent, DoubleSide); states: rest on posts / quadratic Bezier lift across the road / V to the car nose (stretch) / damped spring after the snap / skipping rope (offset R·(−cos φ, sin φ) in y-z, φ from mono keys so the rope is at the bottom exactly when each car is mid-hop). Googly eyes = group.lookAt(camera), hemisphere lid rotation.x (−1.3 open, 0 bored).
- Spoken "Hop. Hop. Hop." came out 0.27 s apart; padded silence so they land on the 118 bpm beat (0.5 s) of the concert music.
- 9:16 framing: when a shot must show the car AND something far away, put the camera on the line from the far object through the car (behind the car) and look at the far object.

## 23. Lessons (Nov 24 run, ep74/ep75)
- Renders were fast this run (~1.2 s/frame per runner, 13 parts of ~157 frames ≈ 3.5 min each) – stills ~1-2 s.
- Fog wall (ep74): ~150 SpriteMaterial puffs (toneMapped false, colour graded grey at the bottom -> white at the top, renderOrder 2) in front of a soft-topped MeshBasic plane (depthWrite false) that hides whatever is behind it; things "emerge" by crossing the plane. A close-up of the fog is just a white frame – show the wall from behind the car instead. Fog "rolls away": fade opacity, scale up, push -z.
- makeCar({antenna:true}) puts a 1.4 m aerial with a red ball right in the middle of every chase shot – build a thin 1 m aerial yourself.
- Flat ShapeGeometry wings mirrored with scale(-1) render black (inverted normals): mirror by rotating the mesh rotation.y = PI instead. Wings must lie in the plane facing the camera (XY) to read from the front.
- Arm aiming helper (ep74 aimArm): shoulder world pos -> direction -> into the parent's local frame -> quaternion.setFromUnitVectors(down, d); sword as a child of the arm at the hand.
- Golf-ball car (ep75): clone body/roof geometry and set box-projected UVs (pick the projection by the dominant normal axis), MeshStandard with a dimple canvas as map + bumpMap (bumpScale 6), lerp colour red -> white.
- Wipers on the hero windscreen: base group with basis (x, up-the-glass, glass normal (0,0.645,-0.764)) at (x, 1.0, -1.13) + 0.09 along the normal; arm along local +x, sweep = rotation.z 0.06..1.5. Gloves on the tips read great.
- Falling instanced objects (hail): per-instance cycle (period P, phase from hash) re-randomised per cycle via hash(i, n); field centre follows the action; hide instances near the hero and handle hits with separate "special" meshes.
- Banner/plane text wider than the 9:16 frame gets cut: keep signs <= ~10 m at 25 m distance.

## 24. Lessons (Nov 25 run, ep76/ep77)
- Fresh container: the checkout was a detached HEAD again and `git pull` failed -> `git fetch && git checkout main && git pull` before setup.sh.
- Convoy frame (ep76): everything that drives together is placed relative to CZ(t) = Z0 - V*t; cameras `Cv` (convoy), `Ct` (transporter), `Ch` (hero). Keeps keyframing simple at 18 m/s; keep |z| < 750 (makeLandscape extent).
- Telescopic ramp (ep76): hinge group with rotation.x = theta (Rx maps +z to (0,-sin,cos)), 3 plates offset k*(L-plate)/2, L = 2.58/sin(theta) so the tip slides along the road like a tongue.
- Hollow cab + open side window: driver with an arm cylinder from shoulder to a hand target (wave, pinch nose, hold a spray can). Cab mirrors in front of the cab block the driver's face from front-left cameras -> drop that mirror.
- Text on a cylinder (spray can): use a 1024-wide canvas and keep the text in the middle ~40 % so it faces the camera; rotate the can (Ry(a) maps -z to (-sin a, 0, -cos a)).
- Heightfield world (ep77): one HG(x,z) function for terrain, road ribbon, canopy, vehicles (pitch from slopePitch). Wheat field = canopy mesh at HG+1.05 (2 m grid, holes for road/strip/barn) + a fine strip mesh (0.35 m) whose vertices drop to stubble behind the combine header -> a corridor cut in real time; skirt walls along the road edges.
- Objects rolling through the canopy sink into it: lift them over the wheat (bounce).
- Barn with cows: the lintel above the door hides the inside from high cameras -> tall door opening, camera ~3.4 m above the floor.

## 25. Lessons (Nov 26 run, ep78/ep79)
- Fresh container again: detached HEAD + missing fahrschule -> `git checkout main && git pull` then setup.sh (works).
- Crane carrying the car (ep78): crane state (slew a, trolley r, attach height) from mono keys; pendulum swing angle from the numerical slew rate (craneState(t±0.05)), car up-axis aligned with the cable; hook block group = car-local (follows the car while attached). For a straight carry over a queue: lerp a world point and convert to (angOf, radOf).
- Wide crane cameras above jib height see the lattice jib right through the frame: keep the camera below the jib (y < JY) or slew the jib away after the drop.
- Binocular POV: telephoto camera from just in front of the cab glass (fov ~4.5) + HUD mask (black rect with two circle holes, fill 'evenodd').
- Text on a canvas sign: pass maxWidth to fillText so long lines never get clipped.
- A traffic light seen from behind needs lamps on both faces (and the halo sprite on the camera side).
- Ferry (ep79): ferry group origin = stern centre at deck level, ramp = hinge group (rotation.x = -theta raises the +z tip); car placed with setFromParent(obj, parentGroup, x, y, z, h) (parent.matrixWorld * local). Turning ferry: integrate a heading table (PSI) along distance D so it sails along its bow; dolphins/splash as ferry children so "across the ramp" stays local.
- A table under an awning: the landing car would pass through the awning – keep the landing zone open from above.
- Renders this run: ~1.5 s/frame/runner while stills ran in parallel.
