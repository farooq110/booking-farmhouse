# Deploy D-Victoria Elite to Vercel

> Step-by-step guide for deploying the Vite + React 19 production build to
> Vercel. The Next.js preview is **not** what we deploy — Vercel will build
> and serve the `frontend/` Vite app.

## Why Vercel?

- Zero-config Vite deployment
- Global Edge Network (fast TTFB worldwide)
- Automatic HTTPS
- Preview deployments for every pull request
- Free tier covers this project's traffic easily

## Prerequisites

- A Vercel account (sign up at <https://vercel.com> — free)
- The project pushed to GitHub / GitLab / Bitbucket
- Vercel CLI (optional, for command-line deploys):

  ```bash
  npm i -g vercel
  vercel login
  ```

## Method A — Deploy via the Vercel Dashboard (recommended)

1. **Push to GitHub** — make sure your repo is on GitHub. If not:

   ```bash
   git remote add origin git@github.com:<you>/elixir-arena.git
   git push -u origin main
   ```

2. **Import the project** — go to <https://vercel.com/new> and click
   "Import Git Repository". Pick your `elixir-arena` repo.

3. **Configure the build** — Vercel will auto-detect Next.js at the repo
   root. We want it to build the Vite app in `frontend/` instead. Set these
   overrides in the import dialog:

   | Field | Value |
   |-------|-------|
   | Framework Preset | **Vite** |
   | Root Directory | `frontend` |
   | Build Command | `bun run build` *(auto-detected)* |
   | Output Directory | `dist` *(auto-detected)* |
   | Install Command | `bun install` *(auto-detected)* |

4. **Click Deploy**. Vercel will:
   - Install Bun
   - Run `bun install` in `frontend/`
   - Run `bun run build`
   - Upload `frontend/dist/` to the Edge Network
   - Issue an SSL certificate
   - Give you a `https://elixir-arena-<random>.vercel.app` URL

5. **Add a custom domain** (optional):
   - Go to Project Settings → Domains
   - Add `elixirarena.com` (or your domain)
   - Add the supplied `A` / `CNAME` records at your DNS provider
   - Vercel issues the SSL cert automatically once DNS propagates

## Method B — Deploy via the Vercel CLI

If you prefer the terminal:

```bash
cd frontend
vercel            # first deploy — Vercel asks a few questions
```

When prompted:

| Question | Answer |
|----------|--------|
| Set up and deploy? | `Y` |
| Which scope? | *your account* |
| Link to existing project? | `N` |
| Project name? | `elixir-arena` |
| In which directory is your code located? | `./` (you're already in `frontend/`) |
| Want to modify settings? | `N` (defaults are correct for Vite) |

Vercel deploys to a preview URL. To promote to production:

```bash
vercel --prod
```

## Adding a `vercel.json` (optional, for SPA routing)

Vite builds a single-page app — there's only one `index.html`. If you add
client-side routes later, add a rewrite rule so deep links always hit
`index.html`:

Create `frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

The `Cache-Control` header tells browsers to cache hashed asset files for a
year (safe because Vite hashes filenames on every build).

## Environment Variables

If you wire the form to a backend (see `docs/improvement/improvement-guide.md`
section 1.2), add the endpoint as an env var:

```bash
# via CLI
vercel env add VITE_API_URL production
# paste your API URL when prompted

# or via Dashboard: Project Settings → Environment Variables
```

Read it in code:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

## Preview Deployments

Every push to a non-`main` branch (and every pull request) gets its own
preview deployment with a unique URL. Share the URL with stakeholders to
review changes before merging.

## Custom Build Step (if you need one)

If you add a pre-build script (e.g. fetching CMS content), edit
`frontend/package.json`:

```json
{
  "scripts": {
    "prebuild": "node scripts/fetch-content.js",
    "build": "tsc -b && vite build"
  }
}
```

Vercel runs `prebuild` automatically before `build`.

## Rollbacks

Vercel keeps every deployment. To roll back:

1. Dashboard → Project → Deployments
2. Find the last-known-good deployment
3. Click the `⋯` menu → **Promote to Production**

Or via CLI:

```bash
vercel promote <deployment-url>
```

## Cost

- **Hobby plan** (free): sufficient for this site up to ~100k visits/month
- **Pro plan** ($20/mo): needed for commercial use, team collaboration,
  longer function durations

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails with `tsc: command not found` | Vercel uses Bun — make sure `typescript` is in `devDependencies` (it is) |
| Blank page after deploy | Check the build output — `dist/index.html` must exist |
| 404 on refresh | Add the SPA rewrite in `vercel.json` (above) |
| Fonts not loading | Make sure the Google Fonts `<link>` is in `index.html` (it is) |
| Large 3D chunk warning | Safe to ignore — Three.js is lazy-loaded via `React.lazy` |

## Next Steps

- Connect a custom domain (see Method A step 5)
- Set up analytics: Vercel Analytics is one-click in the Dashboard
- Read [`deploy-aws-ec2-nginx.md`](./deploy-aws-ec2-nginx.md) for a
  self-hosted alternative
