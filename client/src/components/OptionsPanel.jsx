const TRAVEL_MODES = [
  { value: 'driving', label: 'Driving' },
  { value: 'walking', label: 'Walking' },
  { value: 'bicycling', label: 'Bicycling' },
  { value: 'transit', label: 'Transit' },
];

const AVOID_OPTIONS = [
  { value: 'tolls', label: 'Avoid tolls' },
  { value: 'highways', label: 'Avoid highways' },
  { value: 'ferries', label: 'Avoid ferries' },
];

export default function OptionsPanel({ options, setOptions }) {
  function toggleAvoid(value) {
    const set = new Set(options.avoid);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    setOptions({ ...options, avoid: [...set] });
  }

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3 text-sm">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
          Travel mode
        </label>
        <select
          value={options.travelMode}
          onChange={(e) => setOptions({ ...options, travelMode: e.target.value })}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
        >
          {TRAVEL_MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={options.roundTrip}
          onChange={(e) => setOptions({ ...options, roundTrip: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span>Return to start (round trip)</span>
      </label>

      <div className="space-y-1">
        {AVOID_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.avoid.includes(opt.value)}
              onChange={() => toggleAvoid(opt.value)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
