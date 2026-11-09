#!/usr/bin/env bash
# Rebuild the /second hero loops from the source trailer:
#   public/assets/website/videos/playtalk-hero.mp4           1920×1080 (desktop / landscape)
#   public/assets/website/videos/playtalk-hero-portrait.mp4  608×1080 centre crop (phones)
# plus first-frame stills and branded posters in public/assets/website/images/.
# Cut 7.0–21.85s (before the original title cards) → crossfade → PlayTalk end card
# (slow push-in, logo then title) → crossfade back to the first frame for a seamless loop.
# Needs: chromium, ffmpeg. Edit end-card.html to change the brand card.
set -euo pipefail
cd "$(dirname "$0")"
ROOT=../..
SRC=${1:?Pass the path to the archived original ug4547u5ink.mp4}
SRC=$(realpath "$SRC")
VID=$ROOT/public/assets/website/videos
IMG=$ROOT/public/assets/website/images
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

ffmpeg -v error -y -ss 10 -i "$SRC" -frames:v 1 "$TMP/bg.png"
ffmpeg -v error -y -ss 7.0 -i "$SRC" -frames:v 1 "$TMP/first.png"

# build <variant> <width> <height> <crop filter> <output suffix>
build() {
  local v=$1 w=$2 h=$3 crop=$4 suffix=$5
  for n in 1 2; do
    chromium --headless --no-sandbox --hide-scrollbars --allow-file-access-from-files \
      --default-background-color=00000000 --window-size="$w,$h" \
      --screenshot="$TMP/$v$n.png" "file://$PWD/end-card.html?$v#$n" 2>/dev/null
  done
  local out="$VID/playtalk-hero$suffix.mp4"
  ffmpeg -v error -y \
    -ss 7.0 -t 14.85 -i "$SRC" \
    -loop 1 -t 6 -i "$TMP/bg.png" \
    -loop 1 -t 6 -i "$TMP/${v}1.png" -loop 1 -t 6 -i "$TMP/${v}2.png" \
    -loop 1 -t 0.8 -i "$TMP/first.png" \
    -filter_complex "\
[0:v]fps=30,$crop,setsar=1,format=yuv420p[a];\
[1:v]fps=30,$crop,scale='trunc($w*(1+0.05*t/6)/2)*2':-2:eval=frame,crop=$w:$h,setsar=1,format=rgba[bg];\
[2:v]fps=30,format=rgba,fade=in:st=0.5:d=0.6:alpha=1[l1];\
[3:v]fps=30,format=rgba,fade=in:st=1.0:d=0.6:alpha=1[l2];\
[bg][l1]overlay=x=0:y='max(0,40-80*max(0,t-0.5))':eval=frame[b1];\
[b1][l2]overlay=x=0:y='max(0,40-80*max(0,t-1.0))':eval=frame,format=yuv420p,setsar=1[b];\
[4:v]fps=30,$crop,setsar=1,format=yuv420p[c];\
[a][b]xfade=transition=fade:duration=0.7:offset=14.15[ab];\
[ab][c]xfade=transition=fade:duration=0.7:offset=19.45,format=yuv420p[out]" \
    -map "[out]" -an -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -movflags +faststart "$out"
  local sw=$(( w > 1000 ? 1600 : w ))
  ffmpeg -v error -y -ss 17.5 -i "$out" -frames:v 1 -vf "scale=$sw:-2" -c:v libwebp -quality 80 "$IMG/playtalk-hero-poster$suffix.webp"
  ffmpeg -v error -y -ss 0 -i "$out" -frames:v 1 -vf "scale=$sw:-2" -c:v libwebp -quality 78 "$IMG/playtalk-hero-first$suffix.webp"
  echo "built $out"
}

build wide 1920 1080 "scale=1920:1080" ""
build tall 608 1080 "scale=1920:1080,crop=608:1080:656:0" "-portrait"
