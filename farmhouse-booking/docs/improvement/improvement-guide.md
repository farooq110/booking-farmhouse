# Elixir Arena — Improvement Guide

> Concrete ideas for extending and improving the site after the initial
> launch. Ordered by impact-to-effort ratio.

## Tier 1 — High impact, low effort

### 1.1. Replace placeholders with real assets

Every `<VideoSlot />` and `<MediaSlot />` currently renders a branded
gradient placeholder. Drop in your CDN URLs:

```tsx
// Hero background loop — 8-12 second cinematic, muted, looped
<VideoSlot src="https://cdn.elixirarena.com/hero.mp4" poster="/poster.jpg" />

// Gallery images — high-res, optimized JPG/WebP
<MediaSlot src="https://cdn.elixirarena.com/pool-dusk.jpg" alt="…" />

// Video carousel cells
<VideoCarouselCell src="https://cdn.elixirarena.com/pavilion.mp4" label="…" />
```

Recommended assets:
- Hero: 1920×1080, H.264, < 5 MB, 8–12 seconds, looped seamlessly
- Gallery: 1200×1500 portrait, 1200×800 landscape, WebP preferred
- Carousel: 1280×720, 6–10 seconds per clip

### 1.2. Wire the enquiry form to a real backend

`src/components/forms/AvailabilityForm.tsx` currently logs the submission and
shows a success toast. To wire it to an API:

1. Replace the `setTimeout` in `onSubmit` with a `fetch`:

```tsx
const onSubmit = async (data: AvailabilityFormValues) => {
  const res = await fetch("/api/enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Submission failed");
  toast.success("Your enquiry has reached our concierge.");
  setSubmitted(true);
  reset();
};
```

2. Add an API route (Next.js: `src/app/api/enquiry/route.ts`, Vite: a
   serverless function on Vercel / a small Express endpoint on EC2).

3. Validate on the server with the same zod schema:
   `import { availabilitySchema } from "@/lib/validation/schemas";`

### 1.3. Add Open Graph image + favicon

The layout has OG metadata but no image. Create a 1200×630 branded cover
image and drop it at `public/og.jpg` (Next.js) and `frontend/public/og.jpg`
(Vite). Then:

```tsx
// Next.js layout.tsx
openGraph: {
  images: [{ url: "/og.jpg", width: 1200, height: 630 }],
}
```

```html
<!-- Vite index.html -->
<meta property="og:image" content="/og.jpg" />
```

## Tier 2 — Medium impact, medium effort

### 2.1. Replace the procedural Monstera leaf with a real GLB model

If you want ultra-realism (PBR textures, subsurface scattering on the leaf),
swap the procedural geometry for a `.glb`:

1. Drop the model into `public/models/monstera.glb`
2. Replace `MonsteraLeaf.tsx`'s `useMemo(buildMonsteraLeaf, [])` with:

```tsx
import { useGLTF } from "@react-three/drei";
const { scene } = useGLTF("/models/monstera.glb");
// use <primitive object={scene} /> instead of <mesh>
```

3. Preload with `useGLTF.preload("/models/monstera.glb")` in the layout.

Everything else (scroll journey, worker math, reduced-motion fallback) keeps
working unchanged.

### 2.2. Add a sticky nav with smooth-scroll anchors

Right now the only way to navigate is scrolling. Add a slim sticky nav at the
top with anchor links to each section:

```tsx
<nav className="fixed top-0 z-50 …">
  <a href="#estate">Estate</a>
  <a href="#experience">Experience</a>
  <a href="#gallery">Gallery</a>
  <a href="#location">Location</a>
  <button onClick={openEnquiry}>Check Availability</button>
</nav>
```

The browser's `scroll-behavior: smooth` (set in `globals.css`) handles the
animated scroll.

### 2.3. Add structured data (JSON-LD) for SEO

Help Google understand the property by adding `LodgingBusiness` schema:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: "Elixir Arena",
      description: "Private luxury farmhouse sanctuary…",
      address: { /* … */ },
      geo: { /* … */ },
      starRating: { "@type": "Rating", "ratingValue": "5" },
    }),
  }}
/>
```

### 2.4. Add a sitemap and robots.txt

For the Next.js app:

```ts
// src/app/sitemap.ts
export default function sitemap() {
  return [{ url: "https://elixirarena.com", lastModified: new Date() }];
}
```

For the Vite app, generate a static `public/sitemap.xml` and
`public/robots.txt` as part of the build script.

## Tier 3 — High impact, high effort

### 3.1. Replace the GSAP adapter with the Web Animations API

GSAP is excellent but adds ~70 kB gzipped. If you want to drop the
dependency, implement `IAnimationEngine` using the native Web Animations API
(`element.animate()`). Touch only `src/lib/animation/gsapAdapter.ts` —
consumers stay identical.

### 3.2. Add a real availability calendar

The current form collects preferred dates but doesn't show real
availability. Options:

- **Cheap**: Embed a Calendly / TidyCal iframe in the form dialog
- **Custom**: Build a calendar with `react-day-picker` (already installed),
  backed by an iCal feed from your booking system

### 3.3. Add light/dark theme switching

The site is currently dark-only. To add a light variant:

1. Add `next-themes` (Next.js) or a custom toggle (Vite)
2. Define light tokens in a `:root.light { … }` block in `globals.css`
3. The 3D leaf's materials will need re-tuning for the lighter background —
   consider using `MeshPhysicalMaterial` with `transmission` for glass-like
   refraction

### 3.4. Add a 3D parallax on scroll for the gallery images

Each gallery `<figure>` could have a subtle parallax — image moves slower
than the scroll, creating depth. Implement with `ScrollTrigger`:

```ts
engine.scrollTrigger(figure, {
  onUpdate: ({ progress }) => {
    gsap.set(img, { y: progress * 60 });
  }
});
```

## Performance — things to watch

| Metric | Current | Target | How |
|--------|---------|--------|-----|
| LCP | ~1.5s | < 1.2s | Lazy-load 3D scene (done) + use poster image for hero video |
| CLS | 0 | 0 | Already zero — all slots have aspect-ratio |
| TBT | ~150ms | < 100ms | Worker offloads scroll math (done) |
| Bundle (gzip) | ~430 kB | < 350 kB | Tree-shake `@react-three/drei` — only import `Float` and `Environment` |

## Accessibility — things to add

- **Skip-to-content link** — first focusable element, visible on focus
- **Section navigation landmark** — wrap sections in `<nav aria-label="Sections">`
- **Live region for the form** — announce success/error to screen readers
- **Keyboard shortcut for the enquiry dialog** — `?` opens it from anywhere

## What NOT to add

- ❌ A pricing table — explicitly forbidden in the brief
- ❌ An autoplaying audio track — kills conversion
- ❌ A chatbot widget — dilutes the luxury tone
- ❌ Pop-up newsletter capture — same reason
