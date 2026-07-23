# The Green Valley — Setup Guide

> Step-by-step instructions for a developer joining the project. By the end
> of this guide you will have both the Next.js preview and the Vite
> production app running locally.

## 1. Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Node.js | ≥ 20 LTS | Required by Vite 6 / Next.js 16 |
| Bun | ≥ 1.1 | Package manager + script runner (faster than npm/yarn) |
| Git | ≥ 2.40 | Version control |

Install Bun (if you don't have it):

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify:

```bash
node --version   # v20.x or higher
bun --version    # 1.1.x or higher
git --version    # 2.40.x or higher
```

## 2. Clone & Install

```bash
git clone <your-repo-url> elixir-arena
cd elixir-arena

# Install Next.js preview deps (root)
bun install

# Install Vite production app deps
cd frontend
bun install
cd ..
```

## 3. Run the Next.js Preview

The Next.js app lives at the project root. It's the easiest way to see the
site — Hot Module Replacement (HMR) is enabled, so changes appear instantly.

```bash
bun run dev
```

Open <http://localhost:3000>. You should see:

- Deep charcoal/moss background
- Cormorant Garamond display headline
- The 3D Monstera leaf slowly spinning in the hero
- All seven sections rendering top-to-bottom

## 4. Run the Vite Production App

The Vite app lives in `frontend/`. It's the framework-standard build you'll
deploy to Vercel / AWS EC2.

```bash
cd frontend
bun run dev
```

Open <http://localhost:5173>. The visual result is **identical** to the
Next.js preview.

## 5. Verify the Build

Before opening a pull request, verify both apps build cleanly:

```bash
# Next.js preview
bun run lint

# Vite production build
cd frontend
bun run build       # produces frontend/dist/
bun run preview     # serve the production build on http://localhost:4173
```

## 6. Project Structure Tour

Read [`docs/architecture/architecture.md`](../architecture/architecture.md)
for the full breakdown. The short version:

- `src/` — Next.js preview (root)
- `frontend/src/` — Vite production app (mirror of `src/`)
- `docs/` — all markdown docs
- `scripts/` — tooling
- `.github/workflows/` — CI/CD

## 7. How to Make Changes

### Change a section's copy

1. Open `src/components/sections/<SectionName>.tsx`
2. Edit the JSX or the constants at the top of the file
3. Run `scripts/mirror-to-vite.sh` to sync the change into the Vite app:

```bash
./scripts/mirror-to-vite.sh
```

### Tweak the 3D leaf's journey

Open `src/lib/animation/scrollSequence.ts` and edit the `SCENE_KEYFRAMES`
array. Each entry controls where the leaf floats as the user scrolls through
that section:

```ts
{ sectionId: "estate", x: -0.22, y: -0.02, z: 0.5, dip: 0.06, rotationOffset: Math.PI * 0.25, scale: 0.85 }
```

- `x`, `y` — viewport-relative position (0 = center, ±0.5 = edge)
- `z` — depth (negative = further from camera)
- `dip` — how pronounced the "bounce" is when entering the section
- `rotationOffset` — extra rotation added to the continuous spin
- `scale` — leaf size multiplier

Re-run the mirror script after editing.

### Add a real video / image asset

Each media slot has a `src` prop. Drop in your CDN URL:

```tsx
<VideoSlot src="https://cdn.yourbrand.com/hero-loop.mp4" />
<MediaSlot src="https://cdn.yourbrand.com/estate-pool.jpg" alt="Infinity pool at dusk" />
```

The slots gracefully fall back to branded gradient placeholders when `src`
is omitted, so the page always looks polished in development.

### Change the colour palette

All colour tokens live in `src/app/globals.css` under `:root`. Edit the
OKLCH values — both the Next.js and Vite apps read from the same tokens.

```css
:root {
  --bg: oklch(0.18 0.012 145);      /* background */
  --primary: oklch(0.78 0.13 80);   /* amber gold accent */
  --moss: oklch(0.45 0.04 145);     /* moss green */
  /* … */
}
```

Mirror to Vite: copy the `:root { … }` block into
`frontend/src/index.css`.

## 8. Common Issues

| Symptom | Fix |
|---------|-----|
| `Cannot find module 'three'` | Run `bun install` in the project root |
| 3D leaf not visible | Check browser console — WebGL may be disabled |
| Form dialog doesn't open | The 3D canvas must have `pointer-events: none` (it does by default) |
| `Worker is not defined` | The worker client falls back to inline computation — safe to ignore |
| Hot reload stuck | Hard refresh the browser (Cmd+Shift+R / Ctrl+Shift+R) |

## 9. Next Steps

- Read [`docs/improvement/improvement-guide.md`](../improvement/improvement-guide.md)
  for ideas on how to extend the site.
- Read [`docs/deployment/deploy-vercel.md`](../deployment/deploy-vercel.md)
  to ship the Vite build to Vercel.
- Read [`docs/deployment/deploy-aws-ec2-nginx.md`](../deployment/deploy-aws-ec2-nginx.md)
  for AWS EC2 + nginx deployment.
