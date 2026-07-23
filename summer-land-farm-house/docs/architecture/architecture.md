# Summer Land Farm House — Project Architecture

> A single-page marketing site for a luxury farmhouse rental, built around a
> signature 3D Monstera leaf that travels with the user as they scroll.

## High-Level Layout

```
elixir-arena/
├── src/                      # Next.js 16 preview app (App Router)
│   ├── app/                  # Root layout, page, global CSS
│   ├── components/
│   │   ├── sections/         # 7 page sections (Hero, Estate, …, Footer)
│   │   ├── three/            # R3F canvas + procedural Monstera leaf
│   │   ├── forms/            # AvailabilityForm (RHF + zod)
│   │   ├── providers/        # Reserved for future context providers
│   │   └── ui/               # shadcn/ui primitives + luxury primitives
│   ├── lib/
│   │   ├── animation/        # GSAP adapter, scroll sequence, worker client
│   │   ├── hooks/            # useReducedMotion, useIsMobile
│   │   ├── three/            # Procedural Monstera geometry
│   │   ├── validation/       # zod schemas (single source of truth)
│   │   └── utils.ts          # cn() class merge
│   ├── workers/              # Web worker for scroll-math (off-main-thread)
│   └── types/                # Shared framework-agnostic types
│
├── frontend/                 # Vite + React 19 production build (same UI)
│   └── src/                  # Mirror of `src/` above, minus Next.js specifics
│
├── docs/                     # All markdown docs live here
│   ├── architecture/         # This file
│   ├── setup/                # Local setup guide
│   ├── improvement/          # Future improvement ideas
│   └── deployment/           # Vercel + AWS EC2 (with and without nginx)
│
├── scripts/                  # Tooling (mirror-to-vite.sh, etc.)
├── .github/workflows/        # GitHub Actions CI/CD
└── README.md                 # Top-level overview
```

## Why Two Apps?

| App | Tech | Purpose |
|-----|------|---------|
| `/` (root) | Next.js 16 | Live preview for review — the platform already runs `bun run dev` |
| `frontend/` | Vite + React 19 | The real, framework-standard deliverable per the brief |

Both share **the same component source** (mirrored via `scripts/mirror-to-vite.sh`).
The visual output is identical. The Vite build is the one you ship to EC2 / Vercel.

## Loose Coupling Strategy

Every third-party library sits behind an internal interface. Swapping it out
means editing a single file — never touching consumers.

| Concern | Library | Abstraction file | Replace with… |
|---------|---------|-------------------|---------------|
| Animation engine | `gsap` | `src/lib/animation/gsapAdapter.ts` | Motion One, WAAPI |
| 3D rendering | `three` / R3F | `src/lib/three/monsteraGeometry.ts` | babylon.js, raw WebGL |
| Form validation | `zod` | `src/lib/validation/schemas.ts` | valibot, yup |
| Form state | `react-hook-form` | `src/components/forms/AvailabilityForm.tsx` | Formik, Conform |
| UI primitives | shadcn/ui (Radix) | `src/components/ui/*` | Mantine, Park UI |
| Toasts | `sonner` | `src/components/ui/sonner.tsx` | react-hot-toast |

Consumers import from the abstraction, never from the library:

```ts
// ❌ Bad — couples consumer to GSAP
import gsap from "gsap";

// ✅ Good — goes through the adapter
import { getAnimationEngine } from "@/lib/animation/gsapAdapter";
const engine = getAnimationEngine();
engine.onScrollProgress(el, ({ progress }) => { ... });
```

## The 3D Pipeline

The signature visual is a procedural Monstera leaf (no `.glb` files) that
travels through the page as the user scrolls. The pipeline is split into
small, single-purpose modules:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ scrollSequence  │ →   │ gsapAdapter      │ →   │ scrollMathClient│
│ (keyframes)     │     │ (onScrollProgress│     │ (hook: posts to │
│                 │     │  per section)    │     │  worker)        │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                  ┌───────▼────────┐
                                                  │ scrollMath     │
                                                  │ .worker.ts     │
                                                  │ (off-main-thr) │
                                                  └───────┬────────┘
                                                          │
                                                  ┌───────▼────────┐
                                                  │ MonsteraLeaf   │
                                                  │ (R3F mesh)     │
                                                  └────────────────┘
```

**Why a worker?** Each frame requires interpolating between two keyframes,
applying a bell-curve dip easing, and computing a velocity-driven tilt. Doing
that on the main thread (60 times per second) eats into scroll FPS. Moving it
to a worker keeps the main thread free for React + DOM.

**Why a keyframe table?** Adding a new section means adding one entry to
`SCENE_KEYFRAMES` in `scrollSequence.ts`. No animation code to touch.

## Accessibility Strategy

- `prefers-reduced-motion: reduce` is honored at three layers:
  1. CSS `@media` rule (kills all transitions/animations globally)
  2. `useReducedMotion()` hook ( disables scroll-jacking )
  3. `<MonsteraLeaf reduced />` (static placement, gentle spin only)
- All interactive elements have visible focus rings (`:focus-visible` rule in
  `globals.css`).
- Form fields use `aria-invalid` and `<p role="alert">` for error messaging.
- The 3D canvas is `aria-hidden="true"` and `pointer-events: none` so it never
  traps focus or steals clicks.

## Performance Budget

| Asset | Budget | Actual (Vite build) |
|-------|--------|---------------------|
| Three.js chunk | < 1.2 MB | 1.15 MB |
| App chunk (gzip) | < 150 kB | 108 kB |
| CSS (gzip) | < 15 kB | 9 kB |
| Worker chunk | < 5 kB | 0.7 kB |

The Three.js chunk is heavy but is **lazy-loaded** — the initial HTML + CSS +
app JS paint the page immediately, and the 3D leaf fades in once the chunk
loads (~200 ms on broadband).

## Mobile vs Desktop

The 3D canvas amplitude scales down on mobile (`amplitude = 0.55` when
`max-width: 768px`) to prevent the leaf from overlapping narrow column text.
Mouse parallax is disabled on touch devices.
