// Thin fetch wrappers for the RouteMapper API. A leading-slash fetch path
// always resolves from the domain root, not the page's own base path, so
// fall back to Vite's BASE_URL (e.g. /routemapper/ in production) rather
// than an empty string -- otherwise API calls miss the deployed subpath.
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.BASE_URL.replace(/\/$/, '');

async function request(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export function fetchAutocomplete(input, sessionToken, signal) {
  const params = new URLSearchParams({ input });
  if (sessionToken) params.set('sessiontoken', sessionToken);
  return request(`/api/autocomplete?${params}`, { signal });
}

export function fetchRoute({ addresses, roundTrip, travelMode, avoid }) {
  return request('/api/route', {
    method: 'POST',
    body: JSON.stringify({ addresses, roundTrip, travelMode, avoid }),
  });
}
