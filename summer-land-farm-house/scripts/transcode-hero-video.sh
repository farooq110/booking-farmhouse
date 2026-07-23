#!/usr/bin/env bash
# Transcodes the portrait hero-cover.mp4 (720x1280, 9:16, 13 MB) into:
#   hero-cover-portrait.mp4 — 540x960 H.264, yuv420p, faststart, NO AUDIO
#
# STRATEGY CHANGE (per user request "show as possible as all video"):
#   Previous approach cropped the portrait video to a 16:9 horizontal
#   slice, throwing away 68% of the vertical content. The user wants
#   the full video visible.
#
#   New approach: keep the portrait video AS-IS (9:16 aspect ratio),
#   just downscale it for size. The browser then uses a "blurred
#   background fill" CSS pattern to display it on landscape screens:
#     - Background layer: same video scaled to cover the screen, blurred
#     - Foreground layer: same video at natural aspect ratio, centered
#   No content is cropped.
#
# SIZE BUDGET: 3-6 MB.
#   - Source is 720x1280 @ 1.8 Mbps = 13 MB
#   - Downscaling to 540x960 (0.5625× the pixels) lets us hit ~4 MB
#     at ~600 kbps with no quality loss vs source (the source is only
#     720px wide, so 540 is barely a downscale).
#   - Two-pass VBR hits the target size precisely.
#
# AUDIO: removed (-an). The hero video is muted anyway.
set -euo pipefail

SRC="/home/z/my-project/public/videos/hero-cover.mp4"
OUT_PORTRAIT="/home/z/my-project/public/videos/hero-cover-portrait.mp4"
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC" | head -1)
TARGET_MB=4
TARGET_KBPS=$(awk -v mb="$TARGET_MB" -v d="$DURATION" 'BEGIN{printf "%d", (mb*1024*1024*8/d)/1000}')

echo "==> Source: $SRC ($(du -h "$SRC" | cut -f1))"
echo "    Duration: ${DURATION}s"
echo "    Target: ${TARGET_MB} MB → ${TARGET_KBPS} kbps average bitrate"
echo "    Strategy: keep full 9:16 portrait (no crop), downscale to 540x960"

# ── Pass 1: analyse, no output. ──
echo "==> Pass 1/2: analysing..."
ffmpeg -y -hide_banner -loglevel warning -i "$SRC" \
  -vf "scale=540:960:flags=lanczos,setsar=1" \
  -c:v libx264 -profile:v high -level:v 4.0 -preset medium \
  -b:v "${TARGET_KBPS}k" -maxrate "$((TARGET_KBPS * 2))k" -bufsize "$((TARGET_KBPS * 2))k" \
  -pix_fmt yuv420p \
  -an \
  -pass 1 -passlogfile /tmp/hero-x264-pass \
  -f mp4 /dev/null

# ── Pass 2: encode. ──
echo "==> Pass 2/2: encoding..."
ffmpeg -y -hide_banner -loglevel warning -i "$SRC" \
  -vf "scale=540:960:flags=lanczos,setsar=1" \
  -c:v libx264 -profile:v high -level:v 4.0 -preset slow \
  -b:v "${TARGET_KBPS}k" -maxrate "$((TARGET_KBPS * 2))k" -bufsize "$((TARGET_KBPS * 2))k" \
  -pix_fmt yuv420p \
  -an \
  -pass 2 -passlogfile /tmp/hero-x264-pass \
  -movflags +faststart \
  "$OUT_PORTRAIT"

rm -f /tmp/hero-x264-pass-*.log /tmp/hero-x264-pass-*.log.mbtree 2>/dev/null || true

# Also remove the obsolete landscape file — we no longer use it.
rm -f /home/z/my-project/public/videos/hero-cover-landscape.mp4 2>/dev/null || true

echo ""
echo "==> Verifying output..."
ffprobe -v error -show_format -show_streams -of json "$OUT_PORTRAIT" | python3 -c "
import json, sys
d = json.load(sys.stdin)
s = d['streams'][0]
f = d['format']
w, h = int(s['width']), int(s['height'])
size_mb = int(f['size']) / (1024*1024)
print(f'  Output: {w}x{h} (ratio {w/h:.3f}, portrait 9:16 = {9/16:.3f})')
print(f'  Codec: {s[\"codec_name\"]} ({s.get(\"profile\",\"?\")}), no audio')
print(f'  Bitrate: {int(s.get(\"bit_rate\",0))/1000:.0f} kbps')
print(f'  Size: {size_mb:.2f} MB')
in_budget = 3 <= size_mb <= 6
print(f'  Size budget (3-6 MB): {\"OK\" if in_budget else \"OUT OF BUDGET\"}')
is_portrait = abs(w/h - 9/16) < 0.01
print(f'  Aspect ratio: {\"OK — full portrait 9:16\" if is_portrait else \"WRONG\"}')
"
echo ""
echo "    → $OUT_PORTRAIT ($(du -h "$OUT_PORTRAIT" | cut -f1))"
echo ""
echo "==> Files in public/videos/:"
ls -lh /home/z/my-project/public/videos/