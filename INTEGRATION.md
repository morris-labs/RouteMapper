# RouteMapper: integration reference

This file gives another agent enough context to build a second app that
ties into RouteMapper, without reading the full codebase. RouteMapper finds
the most efficient driving route across a set of stops and returns the
optimized order, leg-by-leg directions, and route totals.

**Live API base**: `https://morrislabs.app/routemapper/api`
**Source**: this repo, `server/src/routes/`
**Deeper context**: `CLAUDE.md` (dev setup, env vars), `DEPLOYMENT.md`
(architecture, infrastructure)

## Access

No authentication is required or implemented. CORS is fully open
(`cors()` with no origin restriction), so any origin can call the API
directly from a browser. There's no rate limiting on top of Express --
the real ceiling is whatever quota is set on the underlying Google Cloud
API key.

## Endpoints

### `POST /api/route`

Computes an optimized route across 2-25 stops -- 25 is Google's Directions
API waypoint limit, and both this endpoint and RouteMapper's own frontend
use the full range. Nothing here assumes a smaller cap.

Request body:

```jsonc
{
  "addresses": ["string", "..."],  // required, 2-25 stops; first = origin, last = destination
  "roundTrip": false,               // optional; if true, destination becomes addresses[0]
  "travelMode": "driving",          // optional; driving | walking | bicycling | transit
  "avoid": []                       // optional; any of: "tolls", "highways", "ferries"
}
```

Addresses can be free-text strings (geocoded by Google) or anything the
Directions API accepts as an origin/destination/waypoint, including
`place_id:...` values from the `/api/autocomplete` response below.

Success response (`200`):

```jsonc
{
  "orderedStops": ["string", "..."],   // addresses, reordered for the optimal route
  "waypointOrder": [0, 2, 1],          // Google's raw optimized index order for the middle stops
  "legs": [
    {
      "startAddress": "string",
      "endAddress": "string",
      "startLocation": { "lat": 0, "lng": 0 },
      "endLocation": { "lat": 0, "lng": 0 },
      "distanceMeters": 0,
      "distanceText": "string",
      "durationSeconds": 0,
      "durationText": "string",
      "steps": [
        { "instructionHtml": "string", "distanceText": "string", "durationText": "string" }
      ]
    }
  ],
  "totalDistanceMeters": 0,
  "totalDistanceMiles": 0,
  "totalDurationSeconds": 0,
  "overviewPolyline": "encoded polyline string, or null",
  "bounds": { "northeast": { "lat": 0, "lng": 0 }, "southwest": { "lat": 0, "lng": 0 } }
}
```

Error responses: `400` for a bad request body (message explains which
validation failed), `502` if the upstream Directions API call fails
(`status` carries Google's own status code).

### `GET /api/autocomplete?input=<text>&sessiontoken=<optional>`

Proxies Google Places Autocomplete (New), restricted to
`street_address`, `premise`, and `subpremise` types. `sessiontoken` is
optional but recommended if you're building a keystroke-by-keystroke
search box -- it groups a user's autocomplete requests with their eventual
selection for Google's billing.

Response (`200`):

```jsonc
{
  "predictions": [
    {
      "description": "string",     // full formatted address
      "placeId": "string",         // pass to Directions as an address if you want an exact place
      "primaryText": "string",     // e.g. street address
      "secondaryText": "string"    // e.g. city, state
    }
  ]
}
```

### `GET /api/health`

Liveness check. Returns `{ "status": "ok", "uptime": <seconds> }`.

## Things a second app should know

- **Origin/destination ordering**: the route optimizer only reorders the
  *middle* stops. `addresses[0]` is always the origin and
  `addresses[addresses.length - 1]` is always the destination (unless
  `roundTrip` is set, in which case the destination is forced back to
  `addresses[0]`). If your app wants a fully free ordering, pick which
  stop is "first" deliberately.
- **No persistence**: RouteMapper doesn't store routes, users, or history
  anywhere. Every request is stateless; nothing here to sync against.
- **No webhook/event surface**: this is a plain request/response API, not
  something you can subscribe to.
- **Server key usage**: every call to `/api/route` and `/api/autocomplete`
  spends quota on RouteMapper's own Google Cloud server key. High-volume
  integration should get its own key rather than routing through this
  instance's Express server.
