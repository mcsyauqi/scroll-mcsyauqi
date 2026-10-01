#!/bin/sh
# sh tools/vsheet.sh out.jpg id...  -> one row per clip: frames at 0s, 4s, end (visual QA)
out=$1; shift; files=""
for id in "$@"; do
  for t in 0 4 7.8; do ffmpeg -v error -y -ss $t -i work/raw/$id.mp4 -frames:v 1 work/qa/f_${id}_$t.png; files="$files work/qa/f_${id}_$t.png"; done
done
py tools/sheet.py $out $files
