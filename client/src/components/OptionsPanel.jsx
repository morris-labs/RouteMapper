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
    <div className="space-y-3 rounded-md border border-[--ml-border] bg-[--ml-surface] p-3 text-sm">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[--ml-muted]">
          Travel mode
        </label>
        <select
          value={options.travelMode}
          onChange={(e) => setOptions({ ...options, travelMode: e.target.value })}
          className="mt-1 w-full rounded-md border border-[--ml-border] bg-[--ml-surface] px-2 py-1.5 text-sm text-[--ml-ink]"
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
          className="h-4 w-4 rounded border-[--ml-border] text-[--ml-accent-fg] focus:ring-[--ml-accent-fg]"
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
              className="h-4 w-4 rounded border-[--ml-border] text-[--ml-accent-fg] focus:ring-[--ml-accent-fg]"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
