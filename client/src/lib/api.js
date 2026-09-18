// Thin fetch wrappers for the RouteMapper API. In dev, calls go through the
// Vite proxy; in production, `VITE_API_BASE` is baked into the build.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

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
