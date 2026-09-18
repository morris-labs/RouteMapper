import { Router } from 'express';

const router = Router();

const TRAVEL_MODES = new Set(['driving', 'walking', 'bicycling', 'transit']);
const AVOID_OPTIONS = new Set(['tolls', 'highways', 'ferries']);
const MAX_ADDRESS_LENGTH = 200;

// Directions statuses caused by the request itself, not an upstream/config
// failure -- these become 400s with a message the user can act on.
const USER_ERROR_STATUSES = {
  ZERO_RESULTS: 'No route could be found between those stops.',
  NOT_FOUND: 'At least one address could not be located.',
  INVALID_REQUEST: 'The route request was invalid.',
  MAX_WAYPOINTS_EXCEEDED: 'Too many stops for a single route.',
};

function isValidAddress(a) {
  return typeof a === 'string' && a.trim().length > 0 && a.length <= MAX_ADDRESS_LENGTH && !a.includes('|');
}

// Directions instructions come from Google, not user input, but the client
// renders them with dangerouslySetInnerHTML -- strip anything outside this
// small allowlist (and any attributes on what's left) before it goes out.
const ALLOWED_INSTRUCTION_TAGS = new Set(['b', 'div', 'wbr']);

function sanitizeInstructionHtml(html) {
  return String(html ?? '').replace(/<\/?([a-zA-Z0-9]+)[^>]*>/g, (match, tag) => {
    const name = tag.toLowerCase();
    if (!ALLOWED_INSTRUCTION_TAGS.has(name)) return '';
    if (match.startsWith('</')) return `</${name}>`;
    if (match.endsWith('/>')) return `<${name}/>`;
    return `<${name}>`;
  });
}

// Body:
//   {
//     addresses: string[],      // 2-25 stops; first is origin, last is destination
//     roundTrip?: boolean,      // if true, destination = origin
//     travelMode?: string,      // driving (default) | walking | bicycling | transit
//     avoid?: string[]          // any of: tolls, highways, ferries
//   }
router.post('/', async (req, res, next) => {
  const { addresses, roundTrip = false, travelMode = 'driving', avoid = [] } = req.body ?? {};

  if (!Array.isArray(addresses) || addresses.length < 2) {
    res.status(400).json({ error: 'bad_request', message: 'addresses must be an array of 2+ stops' });
    return;
  }
  if (addresses.length > 25) {
    res.status(400).json({ error: 'bad_request', message: 'addresses may not exceed 25 stops' });
    return;
  }
  if (!addresses.every(isValidAddress)) {
    res.status(400).json({ error: 'bad_request', message: `each address must be a non-empty string, at most ${MAX_ADDRESS_LENGTH} characters, and not contain "|"` });
    return;
  }
  if (!TRAVEL_MODES.has(travelMode)) {
    res.status(400).json({ error: 'bad_request', message: `travelMode must be one of ${[...TRAVEL_MODES].join(', ')}` });
    return;
  }
  if (!Array.isArray(avoid) || !avoid.every((a) => AVOID_OPTIONS.has(a))) {
    res.status(400).json({ error: 'bad_request', message: `avoid must be an array containing only: ${[...AVOID_OPTIONS].join(', ')}` });
    return;
  }

  const origin = addresses[0];
  const destination = roundTrip ? addresses[0] : addresses[addresses.length - 1];
  const middle = roundTrip ? addresses.slice(1) : addresses.slice(1, -1);

  const params = new URLSearchParams({
    origin,
    destination,
    mode: travelMode,
    key: process.env.GOOGLE_SERVER_KEY,
  });
  if (middle.length > 0) {
    params.set('waypoints', `optimize:true|${middle.join('|')}`);
  }
  if (avoid.length > 0) {
    params.set('avoid', avoid.join('|'));
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?${params}`;

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await upstream.json();
    if (data.status !== 'OK') {
      const userMessage = USER_ERROR_STATUSES[data.status];
      if (userMessage) {
        res.status(400).json({ error: 'bad_request', status: data.status, message: userMessage });
        return;
      }
      res.status(502).json({ error: 'directions_error', status: data.status, message: data.error_message ?? 'The Directions API request failed.' });
      return;
    }

    const route = data.routes[0];
    const legs = route.legs.map((leg) => ({
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      startLocation: leg.start_location,
      endLocation: leg.end_location,
      distanceMeters: leg.distance.value,
      distanceText: leg.distance.text,
      durationSeconds: leg.duration.value,
      durationText: leg.duration.text,
      steps: leg.steps.map((s) => ({
        instructionHtml: sanitizeInstructionHtml(s.html_instructions),
        distanceText: s.distance.text,
        durationText: s.duration.text,
      })),
    }));

    const optimizedOrder = [origin, ...(route.waypoint_order ?? []).map((i) => middle[i]), destination];
    const totalDistanceMeters = legs.reduce((n, l) => n + l.distanceMeters, 0);
    const totalDurationSeconds = legs.reduce((n, l) => n + l.durationSeconds, 0);

    res.json({
      orderedStops: optimizedOrder,
      waypointOrder: route.waypoint_order ?? [],
      legs,
      totalDistanceMeters,
      totalDistanceMiles: totalDistanceMeters / 1609.344,
      totalDurationSeconds,
      overviewPolyline: route.overview_polyline?.points ?? null,
      bounds: route.bounds ?? null,
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      res.status(504).json({ error: 'upstream_timeout', message: 'The Directions API did not respond in time.' });
      return;
    }
    next(err);
  }
});

export default router;
