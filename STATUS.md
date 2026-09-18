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

## Next

Phase 6 -- Deployment. Needs input before proceeding:
- Target host: this box, another VPS, or a container?
- Reverse proxy: nginx, Caddy, or something else?
- SSL cert file locations
- Whether to push live or just stage a deploy bundle

## Blockers / decisions pending

- Add production server IP to server-key restriction before deploy.
- Deployment target details above.
