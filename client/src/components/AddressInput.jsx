import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAutocomplete } from '../lib/api.js';
import { useDebounced } from '../hooks/useDebounced.js';

// Generates a fresh session token per input instance so Google's per-session
// billing correctly groups keystrokes with the eventual selection.
function newSessionToken() {
  return crypto.randomUUID();
}

export default function AddressInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value ?? '');
  const [predictions, setPredictions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionToken = useMemo(newSessionToken, []);
  const debounced = useDebounced(query, 250);
  const wrapperRef = useRef(null);

  useEffect(() => setQuery(value ?? ''), [value]);

  useEffect(() => {
    if (!debounced || debounced === value) {
      setPredictions([]);
      return undefined;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetchAutocomplete(debounced, sessionToken, ctrl.signal)
      .then((data) => setPredictions(data.predictions ?? []))
      .catch((err) => {
        if (err.name !== 'AbortError') setPredictions([]);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [debounced, sessionToken, value]);

  useEffect(() => {
    function handleDocClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  function selectPrediction(p) {
    setQuery(p.description);
    setPredictions([]);
    setOpen(false);
    onChange(p.description);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? 'Enter an address'}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {open && (predictions.length > 0 || loading) && (
        <ul className="absolute left-0 right-0 z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {loading && predictions.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">Searching…</li>
          )}
          {predictions.map((p) => (
            <li
              key={p.placeId}
              onMouseDown={(e) => {
                e.preventDefault();
                selectPrediction(p);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-50"
            >
              <div className="font-medium text-slate-900">{p.primaryText || p.description}</div>
              {p.secondaryText && (
                <div className="text-xs text-slate-500">{p.secondaryText}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
