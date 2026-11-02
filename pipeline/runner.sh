#!/bin/bash
# runner.sh PORT : pops jobs from jobs.txt, renders each to .ts, stops after ~95 min
P=$1
cd /home/claude/fahrschule; START=$(date +%s)
while [ $(( $(date +%s) - START )) -lt 5700 ]; do
  JOB=$(flock jobs.lock -c 'head -n1 jobs.txt; sed -i 1d jobs.txt')
  [ -z "$JOB" ] && exit 0
  set -- $JOB
  PORT=$P PAGE=$1/scene.html python3 render.py video $1/out/$2.ts 30 $3 $4 > $1/out/$2.log 2>&1 || echo "FAIL $JOB" >> failed.txt
  echo "done $JOB" >> done.txt
done
