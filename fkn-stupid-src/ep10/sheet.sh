#!/bin/bash
# usage: ./sheet.sh name t1 t2 ...
n=$1; shift; S=${SHEETDIR:-/home/claude/stills}/ep10/$n; rm -rf $S; mkdir -p $S
PAGE=index.html node still3d.js $S "$@" 2>&1 | grep -v " ms$"
in=""; c=0; for t in "$@"; do in="$in -i $S/s_$t.jpg"; c=$((c+1)); done
ffmpeg -v error -y $in -filter_complex "hstack=$c,scale=$((c*330)):-1" $S/../$n.jpg
