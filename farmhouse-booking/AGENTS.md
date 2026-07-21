<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

Single source of truth for any AI agent working in this repository.

## Project: Country Farm — booking-farmhouse

Next.js 16.2 + React 19 + Tailwind 4 + Three.js / R3F + GSAP + shadcn/ui.

## Architecture rules (do not break)

1. Single source of truth for every third-party concern:
   - `gsap` -> `src/lib/animation/gsapAdapter.ts`
   - `three` / R3F -> `src/lib/three/windmillGeometry.ts`
   - `zod` -> `src/lib/validation/schemas.ts`
   - `react-hook-form` -> `src/components/forms/GuestEnquiryForm.tsx`
   - `next/font` -> `src/lib/fonts.ts` (ALL fonts loaded here only)
   - `next/image` -> `src/lib/images.tsx` (ALL images via `<OptimizedImage>`)
   - View Transitions API -> `src/lib/transitions.ts`
2. All per-frame / heavy math runs in Web Workers:
   - Scroll math: `src/workers/scrollMath.worker.ts`
   - Geometry build: `src/workers/windmillGeometry.worker.ts` (Transferable typed arrays)
3. API client is the only fetch boundary: `src/lib/api/client.ts`
4. Booking date field rejects past dates (HTML min + Zod refine)
5. Themed loader shows until first paint hydrated
6. Plain `<img>` is FORBIDDEN for raster images
7. Plain `<link>` to Google Fonts is FORBIDDEN (use next/font via @/lib/fonts)

## Commands

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Dev server | `bun run dev` -> http://localhost:3000 |
| Production build | `bun run build` |
| Start booking API | `cd ../api && PORT=5000 node dist/main-memory.js` |

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | yes (Prisma) | - | SQLite path |
| `NEXT_PUBLIC_API_BASE_URL` | no | `""` | Booking API base URL |
| `NEXT_PUBLIC_DEFAULT_SERVICE_ID` | no | `""` | Service ObjectId |
| `NEXT_PUBLIC_FARMHOUSE_PHONE` | no | `+9203111227717` | Phone |
| `NEXT_PUBLIC_FARMHOUSE_EMAIL` | no | `hello@countryfarm.pk` | Email |
| `NEXT_PUBLIC_FARMHOUSE_ADDRESS` | no | Karachi address | Address |

## Forbidden actions

- Do NOT install `typescript@7` (incompatible with Next 16.2 build worker). Use `~5.9`.
- Do NOT upgrade `prisma` to v7 without migrating to `prisma.config.ts`.
- Do NOT upgrade `react-day-picker` to v10 without rewriting calendar.tsx.
- Do NOT upgrade `recharts` to v3 without rewriting chart.tsx.
- Do NOT upgrade `react-resizable-panels` to v4 without rewriting resizable.tsx.
- Do NOT use `<img>` for raster images.
- Do NOT load Google Fonts via `<link>`.
- Do NOT call `document.startViewTransition()` directly.
<!-- END:nextjs-agent-rules -->
