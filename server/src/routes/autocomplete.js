import { Router } from 'express';

const router = Router();

// Proxies Places API (New) Autocomplete so the server key stays out of the browser.
// Docs: https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
router.get('/', async (req, res, next) => {
  const input = String(req.query.input ?? '').trim();
  if (!input) {
    res.status(400).json({ error: 'missing_input', message: 'Pass ?input=...' });
    return;
  }

  const body = { input, includedPrimaryTypes: ['street_address', 'premise', 'subpremise'] };
  if (req.query.sessiontoken) body.sessionToken = String(req.query.sessiontoken);

  try {
    const upstream = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_SERVER_KEY,
      },
      body: JSON.stringify(body),
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
    next(err);
  }
});

export default router;
