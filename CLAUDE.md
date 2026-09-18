# RouteMapper

A capstone/training project built with AI assistance, intended to demonstrate
full-stack development ability. The app finds the most efficient route to visit
4-6 addresses, built with React + Vite (client) and Node.js + Express (server).

## Project structure

```
routemapper/
  client/     React + Vite + Tailwind frontend
  server/     Node.js + Express API backend
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
- `VITE_API_BASE` -- Backend base URL (default: `http://localhost:3001`)

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

Production domain: morrislabs.app (SSL certs already obtained and ready to wire in)

## API key strategy

Two separate Google API keys -- this is Google's recommended split:

- **Browser key**: HTTP-referrer restricted to `localhost:5173/*` and `morrislabs.app/*`.
  Restricted to Maps JavaScript API only. Loaded in the client to render the map.
- **Server key**: IP-restricted to `127.0.0.1` (add production server IP when deploying).
  Restricted to Directions API, Places API, Distance Matrix API. Never sent to the browser.

All substantive API calls (routing, autocomplete) go through the Express backend.
The browser key is only used to load the map tile renderer.

## Root dev command

From the repo root, `npm run dev` starts both server and client via `concurrently`.
Run `npm run install:all` once after cloning to install both workspaces.
