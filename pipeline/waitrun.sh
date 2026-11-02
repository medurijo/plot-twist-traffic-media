#!/bin/bash
# keeps 2 runners alive while jobs.txt has content or until STOP file exists
cd /home/claude/fahrschule; START=$(date +%s)
while [ ! -f STOP ] && [ $(( $(date +%s) - START )) -lt 6900 ]; do
  if [ -s jobs.txt ]; then bash runner.sh 8991 & bash runner.sh 8992 & wait; else sleep 20; fi
done
