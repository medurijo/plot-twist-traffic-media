#!/bin/bash
# usage: finalize.sh EPDIR PARTA PARTB OUTNAME   (parts relative to EPDIR/out)
set -e
cd /home/claude/fahrschule/$1/out
printf "file '%s'\nfile '%s'\n" $2 $3 > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy joined.mp4
ffmpeg -v error -y -i joined.mp4 -c:v libx264 -preset medium -b:v 3200k -pass 1 -passlogfile p2 -an -f null /dev/null
ffmpeg -v error -y -i joined.mp4 -i ../audio/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -b:v 3200k -pass 2 -passlogfile p2 -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $4
ls -la $4; ffprobe -v error -show_entries format=duration -of csv=p=0 $4
