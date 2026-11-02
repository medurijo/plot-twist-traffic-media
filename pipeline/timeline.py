"""Place voice segments on a timeline -> timeline.json (used by the 3D page and the audio mix)."""
import json, os
BASE = os.path.dirname(os.path.abspath(__file__))
tim = json.load(open(os.path.join(BASE, "audio/timings.json")))
GAP_AFTER = {"hook1": 0.35, "hook2": 0.9, "wrong1": 0.5, "wrong2": 0.45, "wrong3": 0.5,
             "wrong4": 1.0, "right1": 0.3, "right2": 1.6, "right3": 2.6, "right4": 0.5,
             "right5": 0.5, "right6": 1.6, "right7": 1.3, "outro": 1.2}
t = 0.4
segs = {}
for s in tim:
    segs[s["id"]] = {"start": round(t, 3), "end": round(t + s["dur"], 3),
                     "words": [{"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in s["words"]]}
    t += s["dur"] + GAP_AFTER[s["id"]]
json.dump({"total": round(t, 3), "segs": segs}, open(os.path.join(BASE, "timeline.json"), "w"), indent=1)
print("total", round(t, 2))
for k, v in segs.items():
    print(k, v["start"], v["end"])
