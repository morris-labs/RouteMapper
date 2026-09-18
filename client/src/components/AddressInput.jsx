import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  const sessionToken = useMemo(newSessionToken, []);
  const debounced = useDebounced(query, 250);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

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
    setQuery(p.description);
    setPredictions([]);
    setOpen(false);
    onChange(p.description);
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
