#!/bin/bash
# Resize the Weekend One photo album into 2048 / 1280 / 640 JPEGs + a dims manifest.
SRC="/Users/williametundijr/Desktop/Secret - Weekend One - Media/Photo Album"
OUT="$HOME/Claude/cx-gallery-media/october-30-2026/photos"
MAN="$HOME/Claude/cx-gallery-media/october-30-2026/photos.tsv"
: > "$MAN"
n=0
ls "$SRC" | grep -i '\.jpg$' | sort | while read f; do
  n=$((n+1)); id=$(printf '%03d' $n)
  sips -Z 2048 -s format jpeg -s formatOptions 82 "$SRC/$f" --out "$OUT/$id-2048.jpg" >/dev/null 2>&1
  sips -Z 1280 -s format jpeg -s formatOptions 78 "$OUT/$id-2048.jpg" --out "$OUT/$id-1280.jpg" >/dev/null 2>&1
  sips -Z 640 -s format jpeg -s formatOptions 75 "$OUT/$id-1280.jpg" --out "$OUT/$id-640.jpg" >/dev/null 2>&1
  w=$(sips -g pixelWidth "$OUT/$id-2048.jpg" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$OUT/$id-2048.jpg" | awk '/pixelHeight/{print $2}')
  printf '%s\t%s\t%s\t%s\n' "$id" "$w" "$h" "$f" >> "$MAN"
done
echo DONE
