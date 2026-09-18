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

- [ ] Loading states and error handling
- [ ] Mobile-responsive layout
- [ ] Turn-by-turn directions accordion per leg
- [ ] "Share route" URL encoding (optional)

### Phase 6: Deployment

- [ ] Production build and reverse proxy config for morrislabs.app
- [ ] SSL cert wiring
- [ ] Smoke test in production

## Key decisions (recorded)

- Two API keys: browser key (Maps JS only) + server key (Directions, Places, Distance Matrix)
- Google Directions API `optimizeWaypoints: true` handles TSP for 4-6 stops
- Fuel estimate is client-side math; no third-party fuel price API
- Styling: Tailwind CSS
- ESM throughout (both client and server)
