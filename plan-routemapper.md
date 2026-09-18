# Plan: RouteMapper

## Goal

Build a capstone web app demonstrating AI-assisted development. Users enter 4-6
addresses, the app finds the most efficient driving route, and displays it on a
Google Map with drive time, fuel estimates, and routing options.

## Phases

### Phase 1: Server scaffold

- [x] Initialize `server/` with Express + ESM
- [x] Install dependencies: express, cors (dotenv replaced by `node --env-file`; global `fetch`)
- [x] Implement `GET /api/health`
- [x] Implement `GET /api/autocomplete` (proxies Places API New)
- [x] Implement `POST /api/route` (calls Directions API, returns optimized route)
- [x] Verify all endpoints with curl

### Phase 2: Client scaffold

- [x] Initialize `client/` with Vite + React
- [x] Install and configure Tailwind CSS
- [x] Install @vis.gl/react-google-maps
- [x] Set up Vite proxy for API calls in dev
- [x] Create base App layout (sidebar + map panel)

### Phase 3: Core features

- [x] AddressInput component with autocomplete (debounced, calls `/api/autocomplete`)
- [x] AddressCard list (4-6 slots, add/remove)
- [x] OptionsPanel: avoid tolls/highways/ferries, round trip toggle, travel mode
- [x] "Find Route" button wires up `POST /api/route`
- [x] MapPanel renders route polyline + numbered markers
- [x] ResultsPanel: ordered stop list, total time and distance

### Phase 4: Fuel estimate

- [x] FuelEstimator component: MPG input + gas price input
- [x] Calculates `(totalMiles / mpg) * gasPrice`
- [x] Displays gallons used + estimated cost

### Phase 5: Polish

- [x] Loading states and error handling
- [x] Mobile-responsive layout
- [x] Turn-by-turn directions accordion per leg
- [x] "Share route" URL encoding (optional)

### Phase 6: Deployment (AWS EC2 + nginx)

- [x] EC2 instance `routemapper`: Amazon Linux 2023, t3.micro, Elastic IP 18.216.32.164
- [x] Security group: 22 (my IP), 80, 443
- [x] Node 22 + nginx + git installed via dnf/NodeSource
- [x] App deployed to `/opt/routemapper` (git archive -> scp -> extract)
- [x] `server/.env` and `client/.env` copied over (not in git)
- [x] SSL cert chain built and verified (leaf + intermediate + cross-signed
      root), staged at `/etc/nginx/ssl/` (600 privkey, 644 fullchain, root:root)
- [x] Express running under systemd (`routemapper.service`), enabled on boot
- [x] nginx: HTTP->HTTPS redirect, serves `client/dist` static build,
      reverse-proxies `/api/*` to `127.0.0.1:3001`, `conf.d/routemapper.conf`
- [x] Smoke test via raw IP + SNI (`--resolve morrislabs.app:443:<ip>`):
      static site 200, `/api/health` OK, cert CN matches domain
- [x] Deployed under `morrislabs.app/routemapper/`, not the domain root (no
      landing page exists yet). Existing cert only covers `morrislabs.app` +
      `www.morrislabs.app` (no SAN/wildcard for subdomains), so a subdomain
      would have needed a new cert -- subpath works with the cert on hand.
      - `client/vite.config.js`: `base: '/routemapper/'` for prod builds only
        (dev server keeps `/` at localhost:5173)
      - `client/src/lib/api.js`: `API_BASE` falls back to `import.meta.env.BASE_URL`
        instead of `''`, since a leading-slash fetch path resolves from the
        domain root regardless of the page's own base path
      - nginx: `/` 302s to `/routemapper/`; `/routemapper/api/` proxies to
        Express `/api/` (prefix stripped); `/routemapper/` serves `client/dist`
        via `alias` with SPA fallback to `/routemapper/index.html`
      - Verified: root redirect, static assets, API health under subpath, and
        SPA fallback on a deep path all return correctly
- [ ] Add EC2 Elastic IP to Google server-key IP allowlist (currently blocks
      live autocomplete/route calls -- confirmed via 403 from Places API)
- [ ] Point morrislabs.app DNS A record at 18.216.32.164
- [ ] Re-test through the real domain once DNS + key restriction are live
- [ ] known item, not blocking: client's `esbuild`/vite dev-server-only
      vulnerability (npm audit) -- irrelevant to the production build, low
      priority breaking upgrade

## Key decisions (recorded)

- Two API keys: browser key (Maps JS only) + server key (Directions, Places, Distance Matrix)
- Google Directions API `optimizeWaypoints: true` handles TSP for 4-6 stops
- Fuel estimate is client-side math; no third-party fuel price API
- Styling: Tailwind CSS
- ESM throughout (both client and server)
