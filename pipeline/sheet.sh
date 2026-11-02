#!/bin/bash
# usage: sheet.sh EPDIR out.jpg t1,t2,...
cd /home/claude/fahrschule
PAGE=$1/scene.html STILLS=$1/stills timeout 900 python3 render.py stills $3 2>&1 | grep -E "PAGEERROR|console|still" | grep -v favicon | grep -v "404" | head -20
args=(); for t in ${3//,/ }; do args+=(-i "$1/stills/t$(printf %06.2f $t).jpg"); done
n=$(echo $3 | tr ',' '\n' | wc -l)
ffmpeg -v error -y "${args[@]}" -filter_complex "hstack=$n,scale=$((n*300)):-1" $2
