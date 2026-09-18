# Status

active plan: plan-routemapper.md
current step: Phase 3 -- Core features (not started)

## Done

- Google Cloud: Maps JS, Places (New), Directions, Distance Matrix enabled
- Two API keys created; server key includes dev machine IP
- Domain morrislabs.app + SSL certs ready
- Phase 1: Express + ESM server with /api/health,
  /api/autocomplete (Places API New), /api/route (Directions +
  optimizeWaypoints). Smoke-tested with curl.
- Phase 2: Vite + React client with Tailwind and @vis.gl/react-google-maps.
  Base sidebar + map layout. Vite proxy `/api/*` -> :3001 verified.
  `npm run build` clean; `npm run dev` from repo root starts both stacks.

## Next

Phase 3 -- Core features:
- AddressInput with debounced autocomplete
- AddressCard list (4-6 slots, add/remove)
- OptionsPanel (avoid tolls/highways/ferries, round trip, travel mode)
- "Find Route" button wires POST /api/route
- MapPanel renders polyline + numbered markers
- ResultsPanel: ordered stops + totals

## Blockers / decisions pending

- Add production server IP to server-key restriction before deploy.
- Visual verification of Phase 2 map render was skipped (Chrome
  extension not connected); user to eyeball or reconnect extension.
