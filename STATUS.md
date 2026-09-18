# Status

active plan: plan-routemapper.md
current step: Phase 4 -- Fuel estimate (not started)

## Done

- Google Cloud: Maps JS, Places (New), Directions, Distance Matrix enabled
- Two API keys created; server key includes dev machine IP
- Domain morrislabs.app + SSL certs ready
- Phase 1: Express + ESM server (health, autocomplete, route)
- Phase 2: Vite + React + Tailwind + @vis.gl/react-google-maps scaffold
- Phase 3: Core UI wired end-to-end
  - AddressInput with debounced autocomplete + session token
  - AddressCardList (2-6 stops, add/remove)
  - OptionsPanel (travel mode, round trip, avoid tolls/highways/ferries)
  - "Find route" -> POST /api/route
  - MapPanel: decoded polyline via imperative Polyline, per-stop AdvancedMarkers, fitBounds
  - ResultsPanel: totals + ordered stops
  - Server now returns per-leg startLocation/endLocation

## Next

Phase 4 -- Fuel estimate:
- FuelEstimator component: MPG + gas price inputs
- Computes gallons and cost from totalMiles
- Slot into sidebar under ResultsPanel

## Blockers / decisions pending

- Add production server IP to server-key restriction before deploy.
- Visual verification (Chrome extension not connected in this session).
