import { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import AddressCardList from './components/AddressCardList.jsx';
import OptionsPanel from './components/OptionsPanel.jsx';
import MapPanel from './components/MapPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import FuelEstimator from './components/FuelEstimator.jsx';
import DirectionsAccordion from './components/DirectionsAccordion.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { fetchRoute } from './lib/api.js';
import { decodeState, encodeState } from './lib/shareUrl.js';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY;
const DEFAULT_OPTIONS = { travelMode: 'driving', roundTrip: false, avoid: [] };

function loadInitialState() {
  if (typeof window === 'undefined') return { addresses: ['', '', '', ''], options: DEFAULT_OPTIONS };
  const decoded = decodeState(window.location.search);
  if (decoded.addresses.length >= 2) {
    return { addresses: decoded.addresses, options: { ...DEFAULT_OPTIONS, ...decoded.options } };
  }
  return { addresses: ['', '', '', ''], options: DEFAULT_OPTIONS };
}

export default function App() {
  const [initial] = useState(loadInitialState);
  const [addresses, setAddresses] = useState(initial.addresses);
  const [options, setOptions] = useState(initial.options);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const startAddr = addresses[0]?.trim() ?? '';
  const endAddr = addresses[addresses.length - 1]?.trim() ?? '';
  const middleAddrs = addresses.slice(1, -1).map((a) => a.trim()).filter(Boolean);

  // For URL sync: encode all non-empty addresses preserving their positions.
  const filled = [startAddr, ...middleAddrs, ...(endAddr ? [endAddr] : [])];

  // Round-trip needs start + at least one waypoint; one-way needs start + end or
  // at least one middle stop (the last filled stop becomes the destination).
  const hasRoute = startAddr.length > 0 && (
    options.roundTrip ? middleAddrs.length > 0 : endAddr.length > 0 || middleAddrs.length > 0
  );
  const canSubmit = hasRoute && !loading;

  // Keep the URL in sync with planner state so the current view is shareable.
  useEffect(() => {
    const qs = encodeState({ addresses: filled, options });
    const next = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [filled.join('|'), options]);

  async function onFindRoute() {
    setLoading(true);
    setError(null);
    try {
      const apiAddresses = options.roundTrip
      ? [startAddr, ...middleAddrs]
      : endAddr
        ? [startAddr, ...middleAddrs, endAddr]
        : [startAddr, ...middleAddrs];

    const result = await fetchRoute({
        addresses: apiAddresses,
        roundTrip: options.roundTrip,
        travelMode: options.travelMode,
        avoid: options.avoid,
      });
      setRoute(result);
      setSidebarOpen(false);
    } catch (err) {
      setError(err.message);
      setRoute(null);
    } finally {
      setLoading(false);
    }
  }

  async function onCopyShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard failures; the URL is visible in the address bar.
    }
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header currentApp="routemapper" />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div className="absolute inset-0 flex flex-col md:flex-row">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute right-3 top-3 z-20 rounded-md bg-[--ml-surface] px-3 py-1.5 text-sm font-medium text-[--ml-ink] shadow ring-1 ring-[--ml-border] md:hidden"
        >
          {sidebarOpen ? 'Close' : 'Plan route'}
        </button>

        <aside
          className={`${sidebarOpen ? 'block' : 'hidden'} h-full w-full shrink-0 overflow-y-auto border-r border-[--ml-border] bg-[--ml-sidebar] p-4 md:block md:w-96`}
        >
          <h1 className="text-xl font-semibold text-[--ml-ink]" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>RouteMapper</h1>
          <p className="mt-1 text-sm text-[--ml-muted]">
            Enter 2-25 stops to find the most efficient route.
          </p>

          <div className="mt-4">
            <AddressCardList addresses={addresses} setAddresses={setAddresses} roundTrip={options.roundTrip} />
          </div>

          <div className="mt-4">
            <OptionsPanel options={options} setOptions={setOptions} />
          </div>

          <button
            type="button"
            onClick={onFindRoute}
            disabled={!canSubmit}
            className="mt-4 w-full rounded-md bg-[--ml-accent-fg] py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Finding route…' : 'Find route'}
          </button>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {route && (
            <div className="mt-4 space-y-3">
              <ResultsPanel route={route} />
              {options.travelMode === 'driving' && (
                <FuelEstimator totalMiles={route.totalDistanceMiles} />
              )}
              <button
                type="button"
                onClick={onCopyShare}
                className="w-full rounded-md border border-[--ml-border] bg-[--ml-surface] py-1.5 text-sm text-[--ml-muted] hover:bg-[--ml-ground]"
              >
                {copied ? 'Link copied' : 'Copy share link'}
              </button>
              <DirectionsAccordion route={route} />
            </div>
          )}
        </aside>
        <main className="h-full flex-1">
          <MapPanel route={route} />
        </main>
      </div>
      </div>
      <Footer />
      </div>
    </APIProvider>
  );
}
