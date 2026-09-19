import { useRef, useState } from 'react';
import AddressInput from './AddressInput.jsx';

const MAX_STOPS = 25;

export default function AddressCardList({ addresses, setAddresses, roundTrip }) {
  const nextIdRef = useRef(0);
  const [ids, setIds] = useState(() => addresses.map(() => nextIdRef.current++));

  const lastIdx = addresses.length - 1;
  const middleAddresses = addresses.slice(1, -1);

  function updateAt(i, next) {
    setAddresses(addresses.map((a, idx) => (idx === i ? next : a)));
  }

  function removeAt(i) {
    if (i === 0 || i === lastIdx) return;
    setAddresses(addresses.filter((_, idx) => idx !== i));
    setIds((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addStop() {
    if (addresses.length >= MAX_STOPS) return;
    setAddresses([...addresses.slice(0, lastIdx), '', addresses[lastIdx]]);
    setIds((prev) => [...prev.slice(0, lastIdx), nextIdRef.current++, prev[lastIdx]]);
  }

  const badge = (label, color) => (
    <div className={`mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${color}`}>
      {label}
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Origin — always pinned first */}
      <div key={ids[0]} className="flex items-start gap-2">
        {badge('S', 'bg-green-600')}   {/* green = semantic start color, intentional */}
        <div className="flex-1">
          <AddressInput
            value={addresses[0]}
            onChange={(v) => updateAt(0, v)}
            placeholder="Starting address"
          />
        </div>
        <div className="mt-1 w-7" />
      </div>

      {/* Destination — always pinned second; locked to origin when round trip is on */}
      <div key={ids[lastIdx]} className="flex items-start gap-2">
        {badge('E', 'bg-orange-500')}
        <div className="flex-1">
          {roundTrip ? (
            <input
              type="text"
              value={addresses[0] || ''}
              disabled
              placeholder="Returns to start"
              className="w-full cursor-not-allowed rounded-md border border-[--ml-border] bg-[--ml-ground] px-3 py-2 text-sm text-[--ml-muted] shadow-sm"
            />
          ) : (
            <AddressInput
              value={addresses[lastIdx]}
              onChange={(v) => updateAt(lastIdx, v)}
              placeholder="Ending address (optional)"
            />
          )}
        </div>
        <div className="mt-1 w-7" />
      </div>

      {/* Other stops section */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-[--ml-muted]">Other stops</span>
        <span className="text-xs text-[--ml-muted]">{middleAddresses.length} of {MAX_STOPS - 2}</span>
      </div>

      {middleAddresses.map((addr, i) => (
        <div key={ids[i + 1]} className="flex items-start gap-2">
          {badge(i + 1, 'bg-[--ml-accent-fg]')}
          <div className="flex-1">
            <AddressInput
              value={addr}
              onChange={(v) => updateAt(i + 1, v)}
              placeholder={`Stop ${i + 1}`}
            />
          </div>
          <button
            type="button"
            onClick={() => removeAt(i + 1)}
            className="mt-1 rounded p-1 text-[--ml-muted] hover:bg-[--ml-ground] hover:text-red-600"
            aria-label={`Remove stop ${i + 1}`}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addStop}
        disabled={addresses.length >= MAX_STOPS}
        className="w-full rounded-md border border-dashed border-[--ml-border] py-2 text-sm text-[--ml-muted] hover:border-[--ml-accent-fg] hover:text-[--ml-accent-fg] disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add stop
      </button>
    </div>
  );
}
