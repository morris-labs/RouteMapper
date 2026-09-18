import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchAutocomplete } from '../lib/api.js';
import { useDebounced } from '../hooks/useDebounced.js';

// Generates a fresh session token per input instance so Google's per-session
// billing correctly groups keystrokes with the eventual selection.
// `crypto.randomUUID` requires a secure context, so fall back on plain http.
function newSessionToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AddressInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value ?? '');
  const [predictions, setPredictions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const [sessionToken, setSessionToken] = useState(newSessionToken);
  const debounced = useDebounced(query, 250);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  // Tracks the last text a prediction was selected for, so the effect below
  // can skip re-querying immediately after a selection without needing
  // `value` to stay lazy -- `onChange` now fires on every keystroke, so
  // comparing against `value` directly would suppress fetching on ordinary
  // typing too, since the parent updates in lockstep.
  const lastSelectedRef = useRef(value ?? '');
  // The value emitted to onChange can be a `place_id:...` reference (not
  // human-readable), which must not overwrite the visible query text -- so
  // only resync from `value` when it changed for a reason other than this
  // instance's own emission (external reset, initial mount, etc).
  const lastEmittedRef = useRef(value ?? '');

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    setQuery(value ?? '');
    lastEmittedRef.current = value ?? '';
  }, [value]);

  useEffect(() => {
    if (!debounced || debounced === lastSelectedRef.current) {
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
  }, [debounced, sessionToken]);

  useEffect(() => {
    function handleDocClick(e) {
      const insideWrapper = wrapperRef.current?.contains(e.target);
      const insideMenu = menuRef.current?.contains(e.target);
      if (!insideWrapper && !insideMenu) setOpen(false);
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // The dropdown portals to document.body so an ancestor with overflow-y-auto
  // (the sidebar) can't clip it; keep its position synced to the input while open.
  useLayoutEffect(() => {
    if (!open || !inputRef.current) return undefined;
    function updateRect() {
      setMenuRect(inputRef.current.getBoundingClientRect());
    }
    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open]);

  function selectPrediction(p) {
    // Directions accepts `place_id:ID` directly as an address, no separate
    // Place Details call needed -- more precise than re-geocoding free text.
    const address = p.placeId ? `place_id:${p.placeId}` : p.description;
    setQuery(p.description);
    lastSelectedRef.current = p.description;
    lastEmittedRef.current = address;
    setPredictions([]);
    setOpen(false);
    onChange(address);
    // A session ends once a prediction is used; start a fresh one so the
    // next search groups its own keystrokes for Google's billing.
    setSessionToken(newSessionToken());
  }

  const showMenu = open && (predictions.length > 0 || loading) && menuRect;

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          lastEmittedRef.current = e.target.value;
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? 'Enter an address'}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {showMenu &&
        createPortal(
          <ul
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuRect.bottom + 4,
              left: menuRect.left,
              width: menuRect.width,
            }}
            className="z-50 max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
          >
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
          </ul>,
          document.body,
        )}
    </div>
  );
}
