import { useRef, useState } from 'react';
import AddressInput from './AddressInput.jsx';

const MAX_STOPS = 25; // Google Directions API's own waypoint limit

export default function AddressCardList({ addresses, setAddresses, roundTrip }) {
  // `addresses` is plain strings, keyed by position, so removing a row
  // above another shifts every index below it -- a React key of `i` would
  // then reuse that AddressInput instance for a different logical row and
  // carry over its stale local state. These ids stay stable per row instead.
  // Safe because this component is the only place `addresses` grows/shrinks
  // after mount; the lazy initializer covers state restored from a share URL.
  const nextIdRef = useRef(0);
  const [ids, setIds] = useState(() => addresses.map(() => nextIdRef.current++));

  const lastIdx = addresses.length - 1;

  function updateAt(i, next) {
    setAddresses(addresses.map((a, idx) => (idx === i ? next : a)));
  }

  function removeAt(i) {
    // Start (0) and end (lastIdx) are pinned; only middle stops are removable.
    if (i === 0 || i === lastIdx) return;
    setAddresses(addresses.filter((_, idx) => idx !== i));
    setIds((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addStop() {
    if (addresses.length >= MAX_STOPS) return;
    // Insert before the end slot so end stays last.
    const insertAt = lastIdx;
    setAddresses([...addresses.slice(0, insertAt), '', addresses[insertAt]]);
    setIds((prev) => [...prev.slice(0, insertAt), nextIdRef.current++, prev[insertAt]]);
  }

  return (
    <div className="space-y-2">
      {addresses.map((addr, i) => {
        const isStart = i === 0;
        const isEnd = i === lastIdx;
        const isPinned = isStart || isEnd;
        const badgeLabel = isStart ? 'S' : isEnd ? 'E' : i;
        const badgeColor = isStart ? 'bg-green-600' : isEnd ? 'bg-orange-500' : 'bg-blue-600';

        return (
          <div key={ids[i]} className="flex items-start gap-2">
            <div className={`mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${badgeColor} text-xs font-semibold text-white`}>
              {badgeLabel}
            </div>
            <div className="flex-1">
              {isEnd && roundTrip ? (
                <input
                  type="text"
                  value={addresses[0] || ''}
                  disabled
                  placeholder="Returns to start"
                  className="w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 shadow-sm"
                />
              ) : (
                <AddressInput
                  value={addr}
                  onChange={(next) => updateAt(i, next)}
                  placeholder={
                    isStart ? 'Starting address' :
                    isEnd   ? 'Ending address (optional)' :
                              `Stop ${i + 1}`
                  }
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => removeAt(i)}
              disabled={isPinned}
              className="mt-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-0"
              aria-label={`Remove stop ${i + 1}`}
            >
              ×
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addStop}
        disabled={addresses.length >= MAX_STOPS}
        className="w-full rounded-md border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add stop ({addresses.length - 2}/{MAX_STOPS - 2})
      </button>
    </div>
  );
}
