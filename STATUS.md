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
- Remaining before it's fully live:
  - Add 18.216.32.164 to the Google server-key IP allowlist (confirmed
    blocking live API calls with a 403 right now)
  - Point morrislabs.app's DNS A record at 18.216.32.164
  - Re-test through the real domain once both land

## Blockers / decisions pending

- Google server-key IP allowlist (see above).
- DNS A record (see above).
