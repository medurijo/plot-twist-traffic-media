#!/bin/bash
# Restores the Plot Twist Traffic pipeline into /home/claude/fahrschule (paths are hardcoded there).
# usage: bash pipeline/setup.sh   (run from the media repo root)
set -e
SRC=$(cd "$(dirname "$0")" && pwd)
F=/home/claude/fahrschule
mkdir -p $F
if [ ! -f $F/common.js ]; then cp -r $SRC/. $F/; fi
cd $F
[ -f tts/kokoro-v1.0.onnx ] || curl -sSL -o tts/kokoro-v1.0.onnx \
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f tts/voices-v1.0.bin ] || curl -sSL -o tts/voices-v1.0.bin \
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
chmod +x vendor/espeak-install/bin/* 2>/dev/null || true
python3 -c "import numpy, scipy, onnxruntime, PIL, playwright" 2>/dev/null || \
  pip install --break-system-packages -q numpy scipy onnxruntime pillow
ls /usr/share/fonts/opentype/inter/InterDisplay-Black.otf >/dev/null 2>&1 || \
  (apt-get install -y -q fonts-inter >/dev/null 2>&1 || echo "WARN: Inter font missing")
which ffmpeg >/dev/null || (apt-get install -y -q ffmpeg >/dev/null 2>&1)
rm -f STOP; touch jobs.txt jobs.lock
echo "pipeline ready in $F"
