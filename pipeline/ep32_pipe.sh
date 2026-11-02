#!/bin/bash
cd /home/claude/fahrschule
while pgrep -f "bash waitrun.sh" >/dev/null || pgrep -f "runner.sh" >/dev/null; do sleep 30; done
# requeue missing/truncated pieces
python3 - <<'PY'
import subprocess,os
T=66.86;n=14;need=[]
q=open('jobs.txt').read()
for i in range(n):
    f=f'ep32/out/p{i:02d}.ts'; a,b=T*i/n,T*(i+1)/n; exp=round((b-a)*30)
    ok=False
    if os.path.exists(f):
        r=subprocess.run(['ffprobe','-v','error','-count_packets','-select_streams','v:0','-show_entries','stream=nb_read_packets','-of','csv=p=0',f],capture_output=True,text=True).stdout.strip()
        ok=r.isdigit() and int(r)>=exp-1
    if not ok and f'ep32 p{i:02d} ' not in q:
        if os.path.exists(f): os.remove(f)
        need.append(f'ep32 p{i:02d} {a:.3f} {b:.3f}\n')
open('jobs.txt','a').write(''.join(need)); print('requeued',len(need))
PY
rm -f STOP
[ -s jobs.txt ] && bash waitrun.sh > waitrun21.log 2>&1
for i in $(seq -w 0 13); do echo -n "$i:$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 ep32/out/p$i.ts | head -1) "; done; echo
bash finalize4.sh ep32 PlotTwistTraffic_Q29_Treadmill.mp4 $(for i in $(seq -w 0 13); do echo -n "p$i.ts "; done)
