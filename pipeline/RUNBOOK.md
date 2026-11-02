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
- Realistic, everyday driving situation (petrol station, crossroads, parking, merging…) with
  ONE element replaced by something crazy. First ~2 s must look like a normal driving-tip video.
- Wrong AND right way: very fantastical and creative, with escalation that makes sense in the
  story (rocket car into the circus tent; police tortoise chasing you for 7 years while a tree
  grows through your car). The right way is also absurd and charming (handstand on the pump to
  cure hiccups, strawberry on a fishing rod = turbo tortoise). No dry rule lessons.
- User praised Q32 fire-breather and Q33 tortoise as the quality bar. Q31 bears was "not
  creative enough" – avoid plain/predictable solutions.
- Characters with personality, payoff gags, a clear funny final image.
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
