import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import AddressCardList from './components/AddressCardList.jsx';
import OptionsPanel from './components/OptionsPanel.jsx';
import MapPanel from './components/MapPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import { fetchRoute } from './lib/api.js';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY;

const INITIAL_OPTIONS = { travelMode: 'driving', roundTrip: false, avoid: [] };

export default function App() {
  const [addresses, setAddresses] = useState(['', '', '']);
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filled = addresses.map((a) => a.trim()).filter(Boolean);
  const canSubmit = filled.length >= 2 && !loading;

  async function onFindRoute() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRoute({
        addresses: filled,
        roundTrip: options.roundTrip,
        travelMode: options.travelMode,
        avoid: options.avoid,
      });
      setRoute(result);
    } catch (err) {
      setError(err.message);
      setRoute(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="flex h-full">
        <aside className="w-96 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
          <h1 className="text-xl font-semibold text-slate-900">RouteMapper</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter 2-6 stops to find the most efficient route.
          </p>

          <div className="mt-4">
            <AddressCardList addresses={addresses} setAddresses={setAddresses} />
          </div>

          <div className="mt-4">
            <OptionsPanel options={options} setOptions={setOptions} />
          </div>

          <button
            type="button"
            onClick={onFindRoute}
            disabled={!canSubmit}
            className="mt-4 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Finding route…' : 'Find route'}
          </button>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {route && (
            <div className="mt-4">
              <ResultsPanel route={route} />
            </div>
          )}
        </aside>
        <main className="flex-1">
          <MapPanel route={route} />
        </main>
      </div>
    </APIProvider>
  );
}
