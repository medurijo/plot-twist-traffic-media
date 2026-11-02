#!/bin/bash
# finalize4.sh EPDIR OUTNAME part1 part2 ...  (concat via filter -> clean timestamps)
set -e
cd /home/claude/fahrschule/$1/out; OUT=$2; shift 2
IN=(); F=""; i=0; for p in "$@"; do IN+=(-i $p); F="$F[$i:v]"; i=$((i+1)); done
ffmpeg -v error -y "${IN[@]}" -filter_complex "${F}concat=n=$i:v=1:a=0,fps=30,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset veryfast -crf 12 joined.mp4
ffmpeg -v error -y -i joined.mp4 -c:v libx264 -preset medium -b:v 3200k -pass 1 -passlogfile p2 -an -f null /dev/null
ffmpeg -v error -y -i joined.mp4 -i ../audio/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -b:v 3200k -pass 2 -passlogfile p2 -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $OUT
ls -la $OUT; ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT
