# Deploy D-Victoria Elite to AWS EC2 (without nginx)

> Minimal-deploys alternative to the nginx guide. Uses a tiny Node.js static
> file server behind Caddy, which auto-provisions TLS certificates. Use this
> when you want HTTPS without hand-editing nginx configs, or when you want
> to serve the marketing site and a Node API from the same instance.

## Architecture

```
┌─────────────┐     443      ┌──────────┐     reverse     ┌──────────────┐
│  Browser    │ ───────────► │  Caddy   │ ──────────────► │ Node static  │
│             │ ◄─────────── │  (TLS)   │ ◄────────────── │ :3000        │
└─────────────┘              └──────────┘                 └──────────────┘
```

Caddy handles TLS termination and reverse-proxies to a small Node server
that serves the Vite `dist/` folder. No nginx, no certbot, no manual
certificate renewal — Caddy does it all automatically.

## Why this instead of nginx?

| Concern | nginx + certbot | Caddy |
|---------|-----------------|-------|
| Config complexity | moderate | minimal |
| TLS provisioning | manual `certbot` | automatic on first request |
| TLS renewal | systemd timer | automatic, in-process |
| Process model | nginx + separate certbot | single Caddy binary |
| Best for | teams already running nginx | solo devs / greenfield deploys |

If you already know nginx, the [nginx guide](./deploy-aws-ec2-nginx.md) is
fine. If you don't, this guide is simpler.

## Prerequisites

- An AWS account with EC2 launch permission
- A registered domain name with DNS access
- An SSH key pair

## Step 1 — Launch the EC2 instance

Same as the nginx guide. Quick recap:

- AMI: **Ubuntu Server 24.04 LTS**
- Instance type: `t3.micro` (free tier) or `t3.small` (production)
- Security group: allow 22 (SSH), 80 (HTTP), 443 (HTTPS) from anywhere
- Public IP: enabled
- Storage: 8 GB gp3

Note the **Public IPv4 DNS** after launch.

## Step 2 — Point your domain at the instance

Add an **A record** at your DNS provider:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` | `<your-EC2-public-IP>` | 300 |

Verify propagation:

```bash
dig +short elixirarena.com
```

## Step 3 — SSH into the instance

```bash
chmod 400 ~/path/to/your-key.pem
ssh -i ~/path/to/your-key.pem ubuntu@elixirarena.com
```

## Step 4 — Install Bun + Caddy

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Bun (for building the Vite app)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Caddy (official Ubuntu repo)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

Verify:

```bash
bun --version    # 1.1.x or higher
caddy version    # 2.x
```

## Step 5 — Pull the code & build

```bash
cd ~
git clone https://github.com/<you>/elixir-arena.git
cd elixir-arena/frontend
bun install
bun run build
# Output: ~/elixir-arena/frontend/dist/
```

## Step 6 — Install a tiny static file server

We'll use `sirv-cli` — a 50-line static file server with built-in gzip and
SPA fallback. It runs as a systemd service.

```bash
# Install globally with bun
bun add -g sirv-cli

# Verify
sirv --help
```

## Step 7 — Create a systemd service for the static server

```bash
sudo tee /etc/systemd/system/elixir-arena.service > /dev/null <<'EOF'
[Unit]
Description=D-Victoria Elite static file server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/elixir-arena/frontend/dist
ExecStart=/home/ubuntu/.bun/bin/sirv . --port 3000 --single --gzip --brotli
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now elixir-arena
sudo systemctl status elixir-arena
```

The `--single` flag is the SPA fallback — any unknown route returns
`index.html`. `--gzip --brotli` enable compression.

Verify locally:

```bash
curl -I http://localhost:3000
# HTTP/1.1 200 OK
```

## Step 8 — Configure Caddy

Replace `/etc/caddy/Caddyfile`:

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
elixirarena.com, www.elixirarena.com {
    encode zstd gzip

    header {
        # Security headers
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        # Long-cache hashed assets
        /assets/* {
            Cache-Control "public, max-age=31536000, immutable"
        }
    }

    reverse_proxy localhost:3000
}
EOF
```

Reload Caddy:

```bash
sudo systemctl reload caddy
sudo systemctl status caddy
```

Caddy will:
- Listen on ports 80 and 443
- Provision a Let's Encrypt certificate on the first request
- Auto-renew the certificate every 60 days
- Reverse-proxy all requests to localhost:3000

Visit <https://elixirarena.com> — the site should load with a valid cert
after ~30 seconds (first request triggers cert issuance).

## Step 9 — Verify

```bash
# Caddy logs
sudo journalctl -u caddy -f

# Static server logs
sudo journalctl -u elixir-arena -f

# External check
curl -I https://elixirarena.com
# HTTP/2 200
# server: Caddy
# strict-transport-security: max-age=31536000; includeSubDomains
```

## Step 10 — Set up auto-deploy (optional)

Create a deploy script:

```bash
sudo tee /usr/local/bin/deploy-elixir-arena > /dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd /home/ubuntu/elixir-arena
git pull
cd frontend
bun install --frozen-lockfile
bun run build
sudo rsync -a --delete dist/ /home/ubuntu/elixir-arena/frontend/dist/
sudo systemctl restart elixir-arena
echo "Deploy complete: $(date)"
EOF
sudo chmod +x /usr/local/bin/deploy-elixir-arena
```

Run `deploy-elixir-arena` whenever you want to ship a new version, or wire
it up to GitHub Actions (see `.github/workflows/ci-cd.yml`).

## Step 11 — Hardening

Same checklist as the nginx guide:

```bash
# Disable SSH password auth
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Auto security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# UFW firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# fail2ban
sudo apt install -y fail2ban
```

## Updating the site

```bash
ssh ubuntu@elixirarena.com
deploy-elixir-arena
```

## Rollback

```bash
cd /home/ubuntu/elixir-arena
git log --oneline -10
git checkout <last-working-commit>
cd frontend && bun run build
sudo rsync -a --delete dist/ /home/ubuntu/elixir-arena/frontend/dist/
sudo systemctl restart elixir-arena
```

## Cost

Same as the nginx guide — ~$17/mo for a small production setup. Caddy
itself is free.

## Comparison: when to pick which

| Choose nginx if… | Choose Caddy if… |
|-------------------|-------------------|
| You already run nginx elsewhere | You want zero-config HTTPS |
| You need complex routing rules | You have a simple reverse-proxy need |
| Your team knows nginx | You're a solo dev or small team |
| You serve many virtual hosts | You serve 1–3 sites |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Caddy can't get a certificate | DNS not pointing at the instance yet — wait 5 min, then `sudo systemctl restart caddy` |
| 502 from Caddy | Static server is down — `sudo systemctl status elixir-arena` |
| Site loads but no styles | Build didn't include the CSS — re-run `bun run build` |
| Browser shows old version | Cached assets — `sudo systemctl restart elixir-arena`, hard-refresh browser |
| `sirv: command not found` | Re-install with `bun add -g sirv-cli` |
| Port 3000 not listening | Check `sudo journalctl -u elixir-arena -n 50` for crash logs |

## Next Steps

- Read [`deploy-vercel.md`](./deploy-vercel.md) for a fully-managed
  alternative (no servers to maintain).
- Read [`../improvement/improvement-guide.md`](../improvement/improvement-guide.md)
  for performance and SEO improvements.
