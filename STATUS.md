# Status

active plan: plan-routemapper.md
current step: Phase 6 -- Deployment (blocked pending decisions)

## Done

- Google Cloud: Maps JS, Places (New), Directions, Distance Matrix enabled
- Two API keys created; server key includes dev machine IP
- Domain morrislabs.app + SSL certs ready
- Phase 1: Express + ESM server (health, autocomplete, route)
- Phase 2: Vite + React + Tailwind + @vis.gl/react-google-maps scaffold
- Phase 3: Core UI wired end-to-end
- Phase 4: FuelEstimator (MPG + price -> gallons, cost)
- Phase 5: Polish
  - Turn-by-turn DirectionsAccordion per leg
  - Mobile-responsive layout (sidebar collapses under md)
  - Share URL: encoded planner state, copy-link button
  - Loading and error states already covered in Phase 3

- Post-Phase-5 bug fixes:
  - AddressInput autocomplete dropdown was clipped by the sidebar's
    `overflow-y-auto`; now portals to `document.body`, positioned via
    `getBoundingClientRect` on the input.
  - Client API calls used an absolute `VITE_API_BASE=http://localhost:3001`,
    bypassing the Vite dev proxy. Broke autocomplete once the client was
    reached via port forwarding, since the viewer's browser resolves
    "localhost" to their own machine. `VITE_API_BASE` is now empty in dev;
    requests stay relative and route through the Vite proxy.

## Next

Deployed live on AWS EC2 + nginx at `morrislabs.app/routemapper/` (subpath,
not domain root -- no landing page exists, and the current cert doesn't cover
a subdomain). Verified working via raw IP + SNI (`--resolve`); real domain
still needs DNS.

- Instance `routemapper`: Amazon Linux 2023, t3.micro, Elastic IP 18.216.32.164
- SSH: `ssh -i ~/.ssh/routemapper-key.pem ec2-user@18.216.32.164`
- App at `/opt/routemapper`; Express under systemd (`routemapper.service`,
  enabled on boot); nginx config at `/etc/nginx/conf.d/routemapper.conf`
- Certs at `/etc/nginx/ssl/` (600 privkey, 644 fullchain, root:root)
- DNS was already set (A @ -> 18.216.32.164, CNAME www -> morrislabs.app);
  Google server-key IP allowlist updated. https://morrislabs.app/routemapper/
  confirmed live, cert fully trusted (ssl_verify_result: 0).
- Fixed: `/routemapper` (no trailing slash) 404'd -- didn't match the
  `/routemapper/` prefix location. Added an explicit 301 redirect.
- Fixed: map failed to load (`RefererNotAllowedMapError`) -- the browser
  key's `*.morrislabs.app/*` referrer entry only covers subdomains, not the
  apex domain the app is actually served from. Added `morrislabs.app/*` as
  its own entry.
- `deploy/nginx/routemapper.conf` and `deploy/systemd/routemapper.service`
  now versioned in the repo (pulled from the live instance) so the deployed
  config isn't only living on the box.
- `DEPLOYMENT.md` added: architecture, key decisions, and every bug hit
  during the deploy, written up for a reviewer (not just session notes).

## Blockers / decisions pending

None -- app is live at https://morrislabs.app/routemapper/
