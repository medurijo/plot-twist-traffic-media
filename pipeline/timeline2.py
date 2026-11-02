"""timeline for an episode dir: gaps come from script.json segments ("gap")"""
import json, os, sys
EP = os.path.abspath(sys.argv[1])
sc = json.load(open(os.path.join(EP, "script.json")))
gaps = {s["id"]: s.get("gap", 0.45) for s in sc["segments"]}
tim = json.load(open(os.path.join(EP, "audio/timings.json")))
t = 0.4; segs = {}
for s in tim:
    segs[s["id"]] = {"start": round(t, 3), "end": round(t + s["dur"], 3),
                     "words": [{"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in s["words"]]}
    t += s["dur"] + gaps[s["id"]]
json.dump({"total": round(t, 3), "segs": segs, "meta": sc.get("meta", {})}, open(os.path.join(EP, "timeline.json"), "w"), indent=1)
print("total", round(t, 2))
for k, v in segs.items(): print(k, v["start"], v["end"], " ".join(f"{w['w']}@{w['s']}" for w in v["words"]))
