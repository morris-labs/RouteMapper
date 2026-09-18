function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours} hr ${minutes} min`;
}

export default function ResultsPanel({ route }) {
  if (!route) return null;
  const miles = route.totalDistanceMiles.toFixed(1);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-900">Optimized route</h2>
      <div className="mt-1 flex gap-4 text-sm text-slate-600">
        <span><strong className="text-slate-900">{miles}</strong> mi</span>
        <span><strong className="text-slate-900">{formatDuration(route.totalDurationSeconds)}</strong> drive</span>
      </div>
      <ol className="mt-3 space-y-1 text-sm">
        {route.orderedStops.map((stop, i) => (
          <li key={i} className="flex gap-2">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <span className="text-slate-700">{stop}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
