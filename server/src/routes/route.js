import { Router } from 'express';

const router = Router();

const TRAVEL_MODES = new Set(['driving', 'walking', 'bicycling', 'transit']);

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
  if (!TRAVEL_MODES.has(travelMode)) {
    res.status(400).json({ error: 'bad_request', message: `travelMode must be one of ${[...TRAVEL_MODES].join(', ')}` });
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
    const upstream = await fetch(url);
    const data = await upstream.json();
    if (data.status !== 'OK') {
      res.status(502).json({ error: 'directions_error', status: data.status, message: data.error_message });
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
        instructionHtml: s.html_instructions,
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
    next(err);
  }
});

export default router;
