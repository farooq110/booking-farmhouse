<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

Single source of truth for any AI agent working in this repository.

Recognized by **Next.js 16.2**'s built-in AI agent tooling (https://nextjs.org/blog/next-16-2-ai).

## Project: Country Farm — booking-farmhouse
Next.js 16.2 + React 19 + Tailwind 4 + Three.js / R3F + GSAP + shadcn/ui.

## Architecture rules (do not break)
1. Single source of truth for every third-party concern:
   - gsap -> src/lib/animation/gsapAdapter.ts
   - three / R3F -> src/lib/three/windmillGeometry.ts
   - zod -> src/lib/validation/schemas.ts
   - react-hook-form -> src/components/forms/GuestEnquiryForm.tsx
   - next/font -> src/lib/fonts.ts (ALL fonts loaded here only)
   - next/image -> src/lib/images.tsx (ALL images via <OptimizedImage>)
   - View Transitions API -> src/lib/transitions.ts
2. All per-frame / heavy math runs in Web Workers:
   - Scroll math: src/workers/scrollMath.worker.ts
   - Geometry build: src/workers/windmillGeometry.worker.ts (Transferable typed arrays)
3. API client is the only fetch boundary: src/lib/api/client.ts (never throws — result-based)
4. Booking date field rejects past dates (HTML min + Zod refine)
5. Themed loader shows until first paint hydrated
6. Plain <img> is FORBIDDEN for raster images
7. Plain <link> to Google Fonts is FORBIDDEN (use next/font via @/lib/fonts)

## Commands
- Install deps: bun install
- Dev server: bun run dev -> http://localhost:3000
- Production build: bun run build
- Start booking API: cd ../api && PORT=5000 node dist/main-memory.js

## Forbidden
- Don't install typescript@7 (incompatible with Next 16.2 build worker). Use ~5.9.
- Don't upgrade prisma to v7, react-day-picker to v10, recharts to v3, react-resizable-panels to v4.
- Don't use <img> for raster images.
- Don't load Google Fonts via <link>.
- Don't call document.startViewTransition() directly.
<!-- END:nextjs-agent-rules -->
