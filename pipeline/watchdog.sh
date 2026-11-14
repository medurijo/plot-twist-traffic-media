#!/bin/bash
cd /home/claude/fahrschule
while true; do
  if ! pgrep -f waitrun.sh >/dev/null; then
    if [ -s jobs.txt ]; then nohup bash waitrun.sh >> waitrun.log 2>&1 & else exit 0; fi
  fi
  sleep 60
done
