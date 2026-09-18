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

- [x] Live at https://morrislabs.app/routemapper/. Full architecture,
      decisions, and every bug hit along the way are in `DEPLOYMENT.md` --
      not duplicated here to avoid this file and that one drifting apart.

## Status: v1 complete

All six phases are done and the app is live. This file is a record of how
v1 was built, kept for reference -- it's not an active work queue anymore.
Day-to-day state lives in `STATUS.md`; anything not blocking is tracked
there (e.g. a known dev-only `npm audit` item) rather than reopened here.

A sister app is planned next, meant to tie into this one -- see
`INTEGRATION.md` for the API surface and context a second agent needs to
build against it. If that work grows into its own multi-step effort, it
gets its own `plan-<slug>.md` rather than reopening this one.

## Key decisions (recorded)

- Two API keys: browser key (Maps JS only) + server key (Directions, Places, Distance Matrix)
- Google Directions API `optimizeWaypoints: true` handles TSP for 4-6 stops
- Fuel estimate is client-side math; no third-party fuel price API
- Styling: Tailwind CSS
- ESM throughout (both client and server)
- Deployed under a subpath (`/routemapper/`), not a subdomain -- see
  `DEPLOYMENT.md` for why
