# Elixir Arena

> A single-page marketing website for **Elixir Arena**, a luxury farmhouse
> rental service. Built around a signature 3D Monstera leaf that travels
> with the user as they scroll — engineered to feel like an exclusive,
> premium, serene retreat brand, not a generic SaaS landing page.

![Hero preview](https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=70)

---

## ✨ What's inside

- **React 19 + TypeScript + Tailwind CSS 4** — modern, type-safe, zero-config styling
- **React Three Fiber** — a procedural Monstera leaf rendered entirely from math (no `.glb` files)
- **GSAP + ScrollTrigger** — the leaf travels down the page, "dipping" at each new section
- **Web Worker** — all per-frame scroll math runs off the main thread for buttery 60 FPS
- **React Hook Form + Zod** — fully typed, accessible availability enquiry form
- **`prefers-reduced-motion` support** — gracefully degrades to a gently spinning static leaf
- **Loose coupling everywhere** — every third-party library sits behind an internal interface

## 📁 Repository layout

```
elixir-arena/
├── src/                      # Next.js 16 preview app (live at localhost:3000)
├── frontend/                 # Vite + React 19 production build (deploy this)
├── docs/                     # All markdown documentation
│   ├── architecture/         # How the codebase is structured
│   ├── setup/                # Local dev setup guide
│   ├── improvement/          # Ideas for extending the site
│   └── deployment/           # Vercel + AWS EC2 (with/without nginx)
├── scripts/                  # Tooling (mirror-to-vite.sh, etc.)
└── .github/workflows/        # CI/CD pipeline
```

## 🚀 Quick start

```bash
# Install dependencies (root — Next.js preview)
bun install

# Run the Next.js preview (hot reload)
bun run dev
# → http://localhost:3000

# OR run the Vite production app
cd frontend && bun install && bun run dev
# → http://localhost:5173
```

Both apps produce an **identical visual result**. The Next.js app is the
sandbox-friendly preview; the Vite app is the framework-standard build you
deploy.

## 📖 Documentation

| Doc | What it covers |
|-----|----------------|
| [Architecture](./docs/architecture/architecture.md) | Codebase structure, loose-coupling strategy, the 3D pipeline |
| [Setup guide](./docs/setup/setup-guide.md) | Step-by-step local setup for new developers |
| [Improvement guide](./docs/improvement/improvement-guide.md) | Concrete ideas for extending the site post-launch |
| [Deploy to Vercel](./docs/deployment/deploy-vercel.md) | One-click Vercel deployment guide |
| [Deploy to AWS EC2 (with nginx)](./docs/deployment/deploy-aws-ec2-nginx.md) | Self-hosted with nginx + Let's Encrypt |
| [Deploy to AWS EC2 (without nginx)](./docs/deployment/deploy-aws-ec2-no-nginx.md) | Minimal Caddy + Node static server |

## 🎨 Design system

| Token | OKLCH | Role |
|-------|-------|------|
| `--bg` | `oklch(0.18 0.012 145)` | Rich charcoal-earth background |
| `--fg` | `oklch(0.96 0.005 95)` | Chalk-white body text |
| `--primary` | `oklch(0.78 0.13 80)` | Sun-kissed amber gold (CTAs, accents) |
| `--moss` | `oklch(0.45 0.04 145)` | Deep moss green (section dividers) |
| `--amber-soft` | `oklch(0.86 0.08 80)` | Hover-state gold |

Typography: **Cormorant Garamond** (display headings) + **Inter** (body).

## 🧩 Tech stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 16 (preview) + Vite 6 (production) | Next.js for sandbox preview, Vite for the real build |
| Language | TypeScript 5 (strict) | Type safety across the full stack |
| Styling | Tailwind CSS 4 | Utility-first, no CSS-in-JS runtime |
| 3D | three.js + @react-three/fiber | Declarative R3F scene graph |
| Animation | GSAP + ScrollTrigger | Battle-tested scroll-jacking |
| Forms | React Hook Form + Zod | Schema-first validation |
| UI primitives | shadcn/ui (Radix) | Accessible, unstyled, ownable |
| Bundler | Vite 6 + Turbopack | HMR in dev, optimised rollup in prod |

## 🔌 Loose-coupling map

Every third-party library sits behind one internal file. To swap any of
them, edit only that file — consumers never import the library directly.

| Library | Abstraction file |
|---------|------------------|
| `gsap` | `src/lib/animation/gsapAdapter.ts` |
| `three` / R3F | `src/lib/three/monsteraGeometry.ts` |
| `zod` | `src/lib/validation/schemas.ts` |
| `react-hook-form` | `src/components/forms/AvailabilityForm.tsx` |
| `sonner` | `src/components/ui/sonner.tsx` |

## 🛠️ Useful scripts

```bash
# Development
bun run dev                           # Next.js preview on :3000
cd frontend && bun run dev            # Vite app on :5173

# Quality
bun run lint                          # ESLint on Next.js preview
cd frontend && bun run typecheck      # tsc --noEmit on Vite app
cd frontend && bun run build          # Production build → frontend/dist/

# Tooling
./scripts/mirror-to-vite.sh           # Sync src/ → frontend/src/ after edits
```

## 📦 Deployment quick reference

| Target | Guide |
|--------|-------|
| Vercel | [`docs/deployment/deploy-vercel.md`](./docs/deployment/deploy-vercel.md) |
| AWS EC2 + nginx | [`docs/deployment/deploy-aws-ec2-nginx.md`](./docs/deployment/deploy-aws-ec2-nginx.md) |
| AWS EC2 + Caddy (no nginx) | [`docs/deployment/deploy-aws-ec2-no-nginx.md`](./docs/deployment/deploy-aws-ec2-no-nginx.md) |

CI/CD: [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml) —
lints, type-checks, builds, and optionally deploys to EC2 and/or Vercel
on push to `main` (enable by setting the appropriate repo variables &
secrets).

## ♿ Accessibility

- `prefers-reduced-motion` honored at three layers (CSS, hook, 3D component)
- All interactive elements have visible focus rings
- Form errors are announced via `role="alert"`
- The 3D canvas is `aria-hidden` and `pointer-events: none`

## 📄 License

Proprietary — © Elixir Arena. All rights reserved.
