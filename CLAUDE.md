# RouteMapper

A capstone/training project built with AI assistance, intended to demonstrate
full-stack development ability. The app finds the most efficient route to visit
2-25 addresses (Google Directions API's own waypoint limit), built with
React + Vite (client) and Node.js + Express (server).

## Project structure

```
routemapper/
  client/     React + Vite + Tailwind frontend
  server/     Node.js + Express API backend
  deploy/     nginx and systemd configs, versioned from the live EC2 instance
```

## Tech stack

- **Frontend**: React 18, Vite, Tailwind CSS, @vis.gl/react-google-maps
- **Backend**: Node.js (ESM), Express 4
- **APIs**: Google Maps JavaScript API (browser), Directions API + Places API (server)

## Environment variables

`server/.env`:
- `GOOGLE_SERVER_KEY` -- Google API key restricted to Directions, Places, Distance Matrix
- `PORT` -- Express server port (default: 3001)

`client/.env`:
- `VITE_GOOGLE_MAPS_BROWSER_KEY` -- Google API key restricted to Maps JavaScript API
- `VITE_API_BASE` -- Leave empty in dev. Requests to `/api/*` stay relative and go
  through the Vite dev proxy (`vite.config.js`), which forwards to the Express
  server. This matters when the client is reached via a port-forwarded or remote
  host, where a hardcoded `http://localhost:3001` would resolve on the viewer's
  machine instead of the dev box. Set to an absolute URL only for a production
  build served separately from the API.

## Backend endpoints

- `POST /api/route` -- takes addresses + options, returns optimized route
- `GET /api/autocomplete` -- proxies Places Autocomplete
- `GET /api/health` -- liveness check

## Development

```bash
# Terminal 1 -- backend
cd server && npm run dev

# Terminal 2 -- frontend
cd client && npm run dev
```

Live at https://morrislabs.app/routemapper/ -- see `DEPLOYMENT.md` for the
full deployment architecture, decisions, and the debugging notes from
standing it up.

## API key strategy

Two separate Google API keys -- this is Google's recommended split:

- **Browser key**: HTTP-referrer restricted. Restricted to Maps JavaScript
  API only. Loaded in the client to render the map. Website restrictions:
  `localhost:5173/*`, `morrislabs.app/*`, `*.morrislabs.app/*` -- a leading
  `*.` matches subdomains only, not the apex domain, so both entries are
  required to cover `morrislabs.app` itself and any subdomain.
- **Server key**: IP-restricted to `127.0.0.1` (local dev) and the production
  EC2 instance's Elastic IP (see internal deployment notes, not published
  here). Restricted to Directions API, Places API, Distance Matrix API.
  Never sent to the browser.

All substantive API calls (routing, autocomplete) go through the Express backend.
The browser key is only used to load the map tile renderer.

## Root dev command

From the repo root, `npm run dev` starts both server and client via `concurrently`.
Run `npm run install:all` once after cloning to install both workspaces.
