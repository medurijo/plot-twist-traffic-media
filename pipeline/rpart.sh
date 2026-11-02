#!/bin/bash
# rpart.sh EP NAME T0 T1 PORT
cd /home/claude/fahrschule && PORT=$5 PAGE=$1/scene.html python3 render.py video $1/out/$2.mp4 30 $3 $4 > $1/out/$2.log 2>&1
