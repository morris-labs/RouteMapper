# RouteMapper

A full-stack web app that finds the most efficient route across a set of
addresses. Built as a capstone project to demonstrate full-stack development
ability, with AI assistance throughout.

**Live**: [morrislabs.app/routemapper](https://morrislabs.app/routemapper/)

## Features

- Address autocomplete for 2-25 stops (Google Directions API's waypoint
  limit), backed by the Google Places API
- Route optimization via the Google Directions API's waypoint optimizer
- Map view with the optimized route and numbered stop markers
- Turn-by-turn directions per leg
- Route options: avoid tolls, avoid highways, avoid ferries, round trip,
  travel mode
- Fuel cost estimate from your vehicle's MPG and a local gas price
- Shareable route URLs that open in the web app or the Android app
- Mobile-responsive web layout
- Native Android app (`mobile/`) built with Kotlin + Jetpack Compose

## Tech stack

- **Web frontend**: React 18, Vite, Tailwind CSS, `@vis.gl/react-google-maps`
- **Android app**: Kotlin, Jetpack Compose, `maps-compose`, OkHttp
- **Backend**: Node.js (ESM), Express 4 (shared by both clients)
- **APIs**: Google Maps JavaScript API (browser), Maps SDK for Android,
  Directions API + Places API (server)
- **Deployment**: AWS EC2, nginx, systemd -- see [`DEPLOYMENT.md`](DEPLOYMENT.md)

## Architecture

Two Google API keys, split per Google's own recommendation: a
browser-restricted key that only loads map tiles, and a server-restricted
key that Express uses for every real API call (autocomplete, routing). The
server key never reaches the browser.

```
routemapper/
  client/   React + Vite + Tailwind frontend
  server/   Node.js + Express API backend
  mobile/   Native Android app (Kotlin + Jetpack Compose)
  deploy/   nginx and systemd configs from the live instance
```

## Getting started

Requires Node 22 and a Google Cloud project with the Maps JavaScript,
Places, Directions, and Distance Matrix APIs enabled. The Android app
additionally requires the Maps SDK for Android enabled and a separate
Android-restricted API key placed in `mobile/local.properties` as
`ANDROID_MAPS_KEY`.

```bash
npm run install:all
```

Copy each `.env.example` to `.env` and fill in your own API keys:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Then, from the repo root:

```bash
npm run dev
```

This starts the Express API on port 3001 and the Vite dev server on port
5173. See [`CLAUDE.md`](CLAUDE.md) for the full environment variable
reference and API key restriction strategy.

## Deployment

The app runs live on a single AWS EC2 instance behind nginx.
[`DEPLOYMENT.md`](DEPLOYMENT.md) covers the architecture, the reasoning
behind each infrastructure decision, and a full writeup of the bugs found
and fixed while standing it up.

## License

MIT -- see [`LICENSE`](LICENSE).
