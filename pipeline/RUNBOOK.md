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
