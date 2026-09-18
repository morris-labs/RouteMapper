// Encodes the current planner state into a query string, and reads it back.
// Kept small so the URL stays shareable in chat and SMS.
export function encodeState({ addresses, options }) {
  const params = new URLSearchParams();
  addresses.forEach((a) => {
    if (a) params.append('a', a);
  });
  if (options.travelMode && options.travelMode !== 'driving') {
    params.set('mode', options.travelMode);
  }
  if (options.roundTrip) params.set('rt', '1');
  if (options.avoid?.length) params.set('avoid', options.avoid.join(','));
  return params.toString();
}

export function decodeState(search) {
  const params = new URLSearchParams(search);
  const addresses = params.getAll('a');
  const options = {
    travelMode: params.get('mode') || 'driving',
    roundTrip: params.get('rt') === '1',
    avoid: (params.get('avoid') || '').split(',').filter(Boolean),
  };
  return { addresses, options };
}
