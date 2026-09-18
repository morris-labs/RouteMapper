import { APIProvider, Map } from '@vis.gl/react-google-maps';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY;

// Center on the continental US until we have a real route to fit.
const defaultCenter = { lat: 39.8283, lng: -98.5795 };

export default function App() {
  return (
    <APIProvider apiKey={apiKey}>
      <div className="flex h-full">
        <aside className="w-96 shrink-0 border-r border-slate-200 bg-white p-4 overflow-y-auto">
          <h1 className="text-xl font-semibold text-slate-900">RouteMapper</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter 4-6 addresses to plan the most efficient route.
          </p>
          <div className="mt-6 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Address inputs go here (Phase 3).
          </div>
        </aside>
        <main className="flex-1">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={4}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
          />
        </main>
      </div>
    </APIProvider>
  );
}
