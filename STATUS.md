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

Deployment target changed: hosting on AWS instead of this box. Phase 6 plan
needs to be reworked for AWS -- service choice (EC2 vs. ECS/Fargate vs.
Elastic Beanstalk vs. Amplify+Lambda), reverse proxy/SSL approach, and whether
morrislabs.app DNS points there.

## Blockers / decisions pending

- AWS hosting approach not yet chosen (see Next).
- Add production server IP to server-key restriction before deploy.
