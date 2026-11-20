#!/bin/bash
e=$1; name=$2; cd /home/claude/$e || exit 1
rm -rf sc && (PAGE=index.html SD=sc node render3d.js 0 3 > ra.log 2>&1 & PAGE=index.html SD=sc node render3d.js 1 4 > rb.log 2>&1 & PAGE=index.html SD=sc node render3d.js 2 5 > rc.log 2>&1 & wait)
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy silent.mp4 && python3 audio_$e.py sc_sfx.json final.wav | tail -1 && \
ffmpeg -v error -y -i silent.mp4 -i final.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/$name.mp4 && echo "FIN $e $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$name.mp4)"
