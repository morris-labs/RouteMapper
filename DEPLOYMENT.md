# Deployment

RouteMapper runs on a single AWS EC2 instance behind nginx, live at
[morrislabs.app/routemapper/](https://morrislabs.app/routemapper/).

## Architecture

```
Browser
  |  HTTPS (morrislabs.app)
  v
nginx (TLS termination, reverse proxy)
  |-- /routemapper/         static files from client/dist (React build)
  |-- /routemapper/api/*    proxied to Express on 127.0.0.1:3001
  |
Express (systemd service, auto-restarts on crash or reboot)
  |
  v
Google Maps Platform (Directions, Places, Distance Matrix APIs)
```

- **Instance**: `routemapper`, Amazon Linux 2023, `t3.micro`, Elastic IP `18.216.32.164`
- **Reverse proxy**: nginx, config versioned at `deploy/nginx/routemapper.conf`
- **App process**: Node 22 running Express under systemd, unit versioned at
  `deploy/systemd/routemapper.service`
- **App location on the instance**: `/opt/routemapper`
- **DNS**: GoDaddy, `A @ -> 18.216.32.164`, `CNAME www -> morrislabs.app`
- **TLS**: GoDaddy-issued certificate for `morrislabs.app` and `www.morrislabs.app`

## Key decisions

**EC2 + nginx over ECS, Elastic Beanstalk, or Lambda.** A single instance
keeps the AWS surface area small and demonstrable end-to-end: provisioning,
OS-level configuration, a reverse proxy, and a process manager, without a
VPC/ALB/container pipeline the app's traffic doesn't need.

**Deployed under a subpath (`/routemapper/`), not a subdomain.** The
existing certificate's Subject Alternative Names cover only `morrislabs.app`
and `www.morrislabs.app` -- no wildcard or subdomain entry. A subdomain like
`routemapper.morrislabs.app` would have needed a new certificate from
GoDaddy before anything could go live. The subpath works with the
certificate already on hand, at the cost of a Vite `base` config and an
nginx location block that strips the prefix before proxying to Express.

**Two Google API keys.** A browser key (HTTP-referrer restricted, Maps
JavaScript API only) loads the map tiles; a server key (IP-restricted,
Directions/Places/Distance Matrix) handles every real API call from Express.
The server key never reaches the browser. See `CLAUDE.md` for the full
rationale.

## Problems found and fixed during deployment

**Certificate chain concatenation.** GoDaddy's intermediate and cross-signed
root certificate files didn't end in a trailing newline. A plain `cat` to
build the fullchain glued `-----END CERTIFICATE----------BEGIN
CERTIFICATE-----` together with no line break, corrupting the second cert's
PEM boundary. `openssl verify` caught it immediately; the fix was
concatenating with explicit newlines between files, then re-verifying
against the root CA before deploying.

**Autocomplete dropdown clipped by the sidebar.** The address suggestion
list was position-`absolute` inside a sidebar with `overflow-y-auto`. For
stops lower in the list, the dropdown rendered and then got clipped by the
scroll container's bounds -- it looked like it flashed and vanished. Fixed
by portaling the dropdown to `document.body` with `position: fixed`,
computed from the input's live bounding rect, which escapes the ancestor's
overflow entirely.

**API calls broke under port forwarding.** The client called an absolute
`VITE_API_BASE=http://localhost:3001` for every API request, bypassing the
Vite dev proxy entirely. That worked fine on the same machine, but once the
dev server was reachable through port forwarding, "localhost" in the
requesting browser resolved to the *viewer's own machine*, not the dev box --
autocomplete calls failed to connect, and the failed fetch made the dropdown
flash and disappear again, for an unrelated reason from the bug above. Fixed
by leaving `VITE_API_BASE` empty so requests stay relative and route through
the proxy (dev) or through nginx (production), regardless of what host
served the page.

**Wrong SSH username.** The instance is Amazon Linux 2023, whose default
login is `ec2-user`, not `ubuntu`. `ssh ubuntu@<ip>` failed with a generic
"Permission denied (publickey)," which looks identical to an actual key
mismatch. Confirming the key pair's fingerprint with `ssh-keygen -lf` first,
then testing `ec2-user`, resolved it in one step instead of chasing a false
key-mismatch lead.

**`sudo` glob expansion.** `sudo chown root:root /etc/nginx/ssl/*.pem`
failed silently-ish (a literal "no such file" for a path containing an
unexpanded `*`) because the glob is expanded by the *calling* shell, as
`ec2-user`, before `sudo` ever runs -- and `ec2-user` couldn't read that
`700`-permission directory to expand it. Fixed by wrapping the whole
pipeline in `sudo bash -c '...'` so the glob expands under root.

**Subpath trailing-slash 404.** `morrislabs.app/routemapper` (no trailing
slash) didn't match the `/routemapper/` nginx location block at all --
prefix locations require the request URI to literally start with the
location string, and a shorter string can never match a longer one. Browser
address-bar autocomplete and manual typing both regularly produce the
no-slash form. Fixed with an explicit `location = /routemapper { return 301
/routemapper/; }`.

**Browser key referrer wildcard didn't cover the apex domain.** The Maps
JavaScript API key's referrer allowlist had `*.morrislabs.app/*` but not
`morrislabs.app/*`. In Google's referrer-restriction syntax, a leading
`*.` matches subdomains only -- it does not also match the bare apex
domain. The app is served at `https://morrislabs.app/routemapper/`, with no
subdomain, so every map load failed with `RefererNotAllowedMapError` until
`morrislabs.app/*` was added as its own, separate entry alongside the
wildcard.

## Deploying a change

No CI/CD pipeline exists; deploys are manual and intentional:

```bash
# From the repo root, package tracked source (skips node_modules, .env, certs)
git archive --format=tar HEAD | gzip > /tmp/routemapper.tar.gz

# Ship it
scp -i ~/.ssh/routemapper-key.pem /tmp/routemapper.tar.gz ec2-user@18.216.32.164:/tmp/
ssh -i ~/.ssh/routemapper-key.pem ec2-user@18.216.32.164 \
  "tar -xzf /tmp/routemapper.tar.gz -C /opt/routemapper && rm /tmp/routemapper.tar.gz"

# Rebuild the client, restart the API
ssh -i ~/.ssh/routemapper-key.pem ec2-user@18.216.32.164 \
  "cd /opt/routemapper/client && npm run build && sudo systemctl restart routemapper"
```

`.env` files and the SSL certificate/key aren't in git (see `.gitignore`);
they're already in place on the instance and only need updating if their
values change.

## Known, non-blocking items

- `npm audit` flags an `esbuild`/Vite vulnerability that only affects the
  Vite *dev server* accepting requests from arbitrary origins. It doesn't
  affect the production build nginx serves. Fixing it means a breaking
  Vite 5 -> 8 upgrade, not worth doing before a deadline for a dev-only issue.
- SELinux on the instance is in permissive mode, not enforcing. Fine for a
  demo; a production hardening pass would set it to enforcing and configure
  the relevant booleans/contexts instead of leaving it permissive.
