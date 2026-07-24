#!/usr/bin/env bash
# Mirror source files from the Next.js preview into the Vite app.
# - Strips `"use client"` directives (no-op in Vite)
# - Mirrors @/ alias imports as-is (Vite resolves them via tsconfig paths)

set -euo pipefail

SRC="/home/z/my-project/src"
DST="/home/z/my-project/frontend/src"

FILES=(
  "types/animation.ts"
  "types/api.ts"
  "lib/animation/gsapAdapter.ts"
  "lib/animation/scrollSequence.ts"
  "lib/animation/scrollMathClient.ts"
  "lib/api/client.ts"
  "lib/validation/schemas.ts"
  "lib/hooks/useReducedMotion.ts"
  "lib/hooks/useIsMobile.ts"
  "lib/three/windmillGeometry.ts"
  "lib/utils.ts"
  "workers/scrollMath.worker.ts"
  "components/three/Windmill.tsx"
  "components/three/HeroBackgroundWindmill.tsx"
  "components/sections/SiteHeader.tsx"
  "components/sections/Hero.tsx"
  "components/sections/Estate.tsx"
  "components/sections/Facilities.tsx"
  "components/sections/Gallery.tsx"
  "components/sections/VideoGallery.tsx"
  "components/sections/Location.tsx"
  "components/sections/EnquireNow.tsx"
  "components/sections/Footer.tsx"
  "components/forms/GuestEnquiryForm.tsx"
  "components/ui/luxury-primitives.tsx"
  "components/ui/media-slot.tsx"
  "components/ui/video-slot.tsx"
  "components/ui/lightbox.tsx"
  "components/ui/dialog.tsx"
  "components/ui/input.tsx"
  "components/ui/textarea.tsx"
  "components/ui/label.tsx"
  "components/ui/checkbox.tsx"
  "components/ui/select.tsx"
  "components/ui/radio-group.tsx"
  "components/ui/sonner.tsx"
  "data/media.ts"
)

# Remove old files no longer mirrored
rm -f "$DST/components/three/MonsteraLeaf.tsx" \
      "$DST/components/three/MonsteraScene.tsx" \
      "$DST/components/three/WindmillScene.tsx" \
      "$DST/lib/three/monsteraGeometry.ts" \
      "$DST/components/forms/AvailabilityForm.tsx" \
      "$DST/components/forms/FarmhouseListingForm.tsx" \
      "$DST/components/sections/ListYourFarmhouse.tsx"

for rel in "${FILES[@]}"; do
  src_file="$SRC/$rel"
  dst_file="$DST/$rel"
  if [[ ! -f "$src_file" ]]; then
    echo "SKIP (missing): $rel"
    continue
  fi
  mkdir -p "$(dirname "$dst_file")"
  sed '1{/^"use client";$/d;}' "$src_file" > "$dst_file"
  sed -i '/^"use client";$/d' "$dst_file"
  echo "OK: $rel"
done

echo "Mirror complete."
