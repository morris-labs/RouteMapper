import { Router } from 'express';

const router = Router();

// Proxies Places API (New) Autocomplete so the server key stays out of the browser.
// Accepts GET (web app) and POST (Android app -- keeps the typed address out of access logs).
// Docs: https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
router.all('/', async (req, res, next) => {
  const input = String(
    (req.method === 'POST' ? req.body?.input : req.query.input) ?? ''
  ).trim();
  if (!input) {
    res.status(400).json({ error: 'missing_input', message: 'Pass ?input=... or {input} in body.' });
    return;
  }

  const sessiontoken = req.method === 'POST' ? req.body?.sessiontoken : req.query.sessiontoken;
  const body = { input, includedPrimaryTypes: ['street_address', 'premise', 'subpremise'] };
  if (sessiontoken) body.sessionToken = String(sessiontoken);

  try {
    const upstream = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_SERVER_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(502).json({ error: 'places_error', status: upstream.status, message: data.error?.message ?? 'Places API error' });
      return;
    }
    res.json({
      predictions: (data.suggestions ?? [])
        .filter((s) => s.placePrediction)
        .map((s) => ({
          description: s.placePrediction.text?.text ?? '',
          placeId: s.placePrediction.placeId,
          primaryText: s.placePrediction.structuredFormat?.mainText?.text ?? '',
          secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
        })),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      res.status(504).json({ error: 'upstream_timeout', message: 'The Places API did not respond in time.' });
      return;
    }
    next(err);
  }
});

export default router;
