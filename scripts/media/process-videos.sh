#!/bin/bash
# Cut each Weekend One clip into: a 6s muted loop (tile), the full clip at 720p with sound (lightbox), and a poster.
FF=/Users/williametundijr/Documents/Codex/2026-11-01/prepare-this-event-footage-as-a/work/bin/ffmpeg
SRC="/Users/williametundijr/Desktop/Secret - Weekend One - Media/Video Clips"
OUT="$HOME/Claude/cx-gallery-media/october-30-2026/videos"
CUTS="$1"   # tsv: clip<TAB>start
while IFS=$'\t' read i start; do
  in="$SRC/10-30-26_@Kuna-IHaveASecret-Halloween-$i.mp4"
  id=$(printf '%02d' $i)
  $FF -nostdin -hide_banner -loglevel error -y -ss "$start" -t 6 -i "$in" -an -vf "scale=540:960:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 25 -profile:v high -movflags +faststart "$OUT/v$id-loop.mp4"
  $FF -nostdin -hide_banner -loglevel error -y -i "$in" -vf "scale=720:1280:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 24 -maxrate 3500k -bufsize 7000k -profile:v high -c:a aac -b:a 128k -movflags +faststart "$OUT/v$id-full.mp4"
  $FF -nostdin -hide_banner -loglevel error -y -ss "$start" -i "$in" -frames:v 1 -vf "scale=540:960:flags=lanczos" -q:v 4 "$OUT/v$id-poster.jpg"
  echo "clip $i done"
done < "$CUTS"
echo DONE
