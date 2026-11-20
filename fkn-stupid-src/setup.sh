#!/bin/bash
# Restores the FKN STUPID 3D pipeline into /home/claude (paths are hardcoded there).
# usage: bash fkn-stupid-src/setup.sh   (run from the media repo root)
set -e
SRC=$(cd "$(dirname "$0")" && pwd)
mkdir -p /home/claude/tools /home/claude/stills
cp -n $SRC/tools/* /home/claude/tools/ 2>/dev/null || true
chmod +x /home/claude/tools/*.sh
for d in $SRC/ep*; do e=$(basename $d); [ -d /home/claude/$e ] || { mkdir -p /home/claude/$e/out; cp -r $d/. /home/claude/$e/; chmod +x /home/claude/$e/sheet.sh; }; done
python3 -c "import numpy, scipy, PIL" 2>/dev/null || pip install --break-system-packages -q numpy scipy pillow
ls /usr/share/fonts/opentype/inter/InterDisplay-Black.otf >/dev/null 2>&1 || (apt-get install -y -q fonts-inter >/dev/null 2>&1 || echo "WARN: Inter font missing")
fc-list | grep -q "Courier 10 Pitch" || (apt-get install -y -q xfonts-scalable gsfonts >/dev/null 2>&1 || echo "WARN: Courier 10 Pitch missing")
which ffmpeg >/dev/null || (apt-get install -y -q ffmpeg >/dev/null 2>&1)
node -e "require('playwright')" 2>/dev/null || echo "WARN: playwright not found (it should be preinstalled)"
echo "FKN STUPID pipeline ready in /home/claude (episodes: $(ls -d /home/claude/ep* | xargs -n1 basename | tr '\n' ' '))"
