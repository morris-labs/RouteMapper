import AddressInput from './AddressInput.jsx';

const MIN_STOPS = 2;
const MAX_STOPS = 6;

export default function AddressCardList({ addresses, setAddresses }) {
  function updateAt(i, next) {
    setAddresses(addresses.map((a, idx) => (idx === i ? next : a)));
  }

  function removeAt(i) {
    if (addresses.length <= MIN_STOPS) return;
    setAddresses(addresses.filter((_, idx) => idx !== i));
  }

  function addStop() {
    if (addresses.length >= MAX_STOPS) return;
    setAddresses([...addresses, '']);
  }

  return (
    <div className="space-y-2">
      {addresses.map((addr, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {i + 1}
          </div>
          <div className="flex-1">
            <AddressInput
              value={addr}
              onChange={(next) => updateAt(i, next)}
              placeholder={i === 0 ? 'Start address' : `Stop ${i + 1}`}
            />
          </div>
          <button
            type="button"
            onClick={() => removeAt(i)}
            disabled={addresses.length <= MIN_STOPS}
            className="mt-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
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
        className="w-full rounded-md border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add stop ({addresses.length}/{MAX_STOPS})
      </button>
    </div>
  );
}
