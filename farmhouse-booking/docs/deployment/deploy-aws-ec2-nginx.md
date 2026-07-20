# Deploy Elixir Arena to AWS EC2 (with nginx)

> Step-by-step guide for self-hosting the Vite build on an AWS EC2 instance,
> fronted by nginx. Use this when you want full control over the host,
> logging, and routing — for example, to host the marketing site on the
> same instance as a separate booking API.

## Architecture

```
┌─────────────┐     443      ┌──────────┐     static     ┌──────────────┐
│  Browser    │ ───────────► │  nginx   │ ─────────────► │ /var/www/    │
│             │ ◄─────────── │  (TLS)   │ ◄───────────── │ elixir-arena │
└─────────────┘              └──────────┘                └──────────────┘
```

nginx serves the static `dist/` files and terminates TLS. No Node.js process
is needed for the marketing site itself.

## Prerequisites

- An AWS account with permission to launch EC2 instances
- A registered domain name (e.g. `elixirarena.com`) with DNS access
- SSH key pair in your AWS region (`.pem` file)

## Step 1 — Launch the EC2 instance

1. AWS Console → **EC2 → Launch instance**
2. Configure:

   | Setting | Value |
   |---------|-------|
   | Name | `elixir-arena-prod` |
   | AMI | **Ubuntu Server 24.04 LTS** (64-bit x86) |
   | Instance type | `t3.micro` (free tier) or `t3.small` for production |
   | Key pair | *your existing key pair* |
   | VPC | Default |
   | Auto-assign public IP | **Enable** |
   | Storage | 8 GB gp3 (more than enough) |

3. **Network settings** → Security group → Create new:

   | Type | Port | Source | Why |
   |------|------|--------|-----|
   | SSH | 22 | *your IP only* | Admin access |
   | HTTP | 80 | `0.0.0.0/0` | Lets Encrypt HTTP-01 challenge |
   | HTTPS | 443 | `0.0.0.0/0` | Production traffic |

4. Click **Launch instance**. Wait ~60 seconds for it to boot.

5. Note the **Public IPv4 DNS** (e.g. `ec2-12-34-56-78.us-east-1.compute.amazonaws.com`).

## Step 2 — Point your domain at the instance

At your DNS provider, create an **A record**:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` (or `www`) | `<your-EC2-public-IP>` | 300 |

Wait 5–10 minutes for DNS to propagate. Verify:

```bash
dig +short elixirarena.com
# should print your EC2 public IP
```

## Step 3 — SSH into the instance

```bash
chmod 400 ~/path/to/your-key.pem
ssh -i ~/path/to/your-key.pem ubuntu@elixirarena.com
```

## Step 4 — Install system dependencies

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install nginx + certbot (for Let's Encrypt TLS)
sudo apt install -y nginx certbot python3-certbot-nginx

# Install Bun (for building the Vite app)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version   # should print 1.1.x or higher
```

## Step 5 — Pull the code & build

```bash
# Clone the repo
cd ~
git clone https://github.com/<you>/elixir-arena.git
cd elixir-arena/frontend

# Install deps & build
bun install
bun run build
# Output lands in ~/elixir-arena/frontend/dist/
```

## Step 6 — Deploy the build to /var/www

```bash
sudo mkdir -p /var/www/elixir-arena
sudo cp -r ~/elixir-arena/frontend/dist/* /var/www/elixir-arena/
sudo chown -R www-data:www-data /var/www/elixir-arena
```

## Step 7 — Configure nginx

Create `/etc/nginx/sites-available/elixir-arena`:

```bash
sudo tee /etc/nginx/sites-available/elixir-arena > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name elixirarena.com www.elixirarena.com;

    root /var/www/elixir-arena;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;

    # Long-cache hashed assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback — every unknown route hits index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF
```

Enable the site & disable the default:

```bash
sudo ln -sf /etc/nginx/sites-available/elixir-arena /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t        # syntax check
sudo systemctl reload nginx
```

Visit <http://elixirarena.com> — you should see the site over HTTP.

## Step 8 — Add HTTPS with Let's Encrypt

```bash
sudo certbot --nginx -d elixirarena.com -d www.elixirarena.com
```

certbot will:
- Ask for your email (for expiry reminders)
- Ask you to agree to the TOS
- Issue a certificate
- Automatically edit the nginx config to listen on 443 with TLS
- Set up auto-renewal via systemd timer

Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

Visit <https://elixirarena.com> — you should see the site over HTTPS with a
valid certificate.

## Step 9 — Set up auto-deploy on git push (optional)

Create a deploy script on the server:

```bash
sudo tee /usr/local/bin/deploy-elixir-arena > /dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd /home/ubuntu/elixir-arena
git pull
cd frontend
bun install --frozen-lockfile
bun run build
sudo rsync -a --delete dist/ /var/www/elixir-arena/
sudo systemctl reload nginx
echo "Deploy complete: $(date)"
EOF
sudo chmod +x /usr/local/bin/deploy-elixir-arena
```

Add a GitHub webhook that calls this script via a small webhook receiver,
or use GitHub Actions to SSH in and run it (see
`.github/workflows/ci-cd.yml` for an example).

## Step 10 — Hardening checklist

- [ ] Disable SSH password auth: `sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config && sudo systemctl restart ssh`
- [ ] Set up unattended-upgrades: `sudo apt install -y unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades`
- [ ] Enable the UFW firewall: `sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable`
- [ ] Set up fail2ban: `sudo apt install -y fail2ban`
- [ ] Add a non-root deploy user (optional but recommended for production)

## Step 11 — Monitoring

Quick & free monitoring options:

```bash
# nginx access log
sudo tail -f /var/log/nginx/access.log

# nginx error log
sudo tail -f /var/log/nginx/error.log

# system load
htop
```

For production, consider:
- **AWS CloudWatch** — built-in, captures EC2 metrics
- **Uptime Robot** — free external uptime monitor (pings your URL every 5 min)
- **Sentry** — error tracking for the frontend JS

## Updating the site

When you push a new version to GitHub:

```bash
ssh ubuntu@elixirarena.com
deploy-elixir-arena
```

Or, if you set up the GitHub Actions workflow in `.github/workflows/ci-cd.yml`,
it will deploy automatically on push to `main`.

## Cost Estimate

| Resource | Cost (us-east-1) |
|----------|------------------|
| t3.micro EC2 (free tier) | $0 for 12 months, then ~$8/mo |
| t3.small EC2 (production) | ~$16/mo |
| 8 GB EBS gp3 | ~$0.60/mo |
| Route 53 hosted zone | $0.50/mo per zone |
| Bandwidth (first 100 GB/mo) | Free, then $0.09/GB |
| **Total** | **~$17/mo** for a small production setup |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ssh: connect to host port 22: Connection refused` | Security group not allowing your IP on port 22 |
| Site loads over HTTP but not HTTPS | Run `sudo certbot --nginx` again |
| 502 Bad Gateway | nginx is up but `/var/www/elixir-arena/index.html` is missing — re-run the build |
| Fonts not loading | Check `~/elixir-arena/frontend/index.html` has the Google Fonts `<link>` |
| 3D leaf not rendering | Check browser console — WebGL may be blocked; or `dist/assets/` is missing |
| `bun: command not found` after SSH | Run `source ~/.bashrc` or log out and back in |

## Rollback

If a deploy breaks the site:

```bash
# Find the last working build in git history
cd /home/ubuntu/elixir-arena
git log --oneline -10
git checkout <last-working-commit>
cd frontend && bun run build
sudo rsync -a --delete dist/ /var/www/elixir-arena/
sudo systemctl reload nginx
```

## Next Steps

- Read [`deploy-aws-ec2-no-nginx.md`](./deploy-aws-ec2-no-nginx.md) for a
  minimal alternative that serves the static files directly with a tiny Node
  process.
- Read [`../improvement/improvement-guide.md`](../improvement/improvement-guide.md)
  for performance & SEO improvements.
