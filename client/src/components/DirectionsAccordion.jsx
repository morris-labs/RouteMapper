import { useState } from 'react';

function LegItem({ leg, index }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-md border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="text-slate-700">
            {leg.distanceText} · {leg.durationText}
          </span>
        </span>
        <span className="text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ol className="space-y-1 border-t border-slate-100 px-3 py-2 text-xs text-slate-600">
          {leg.steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-slate-400">{i + 1}.</span>
              <span
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: s.instructionHtml }}
              />
              <span className="shrink-0 text-slate-400">{s.distanceText}</span>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

export default function DirectionsAccordion({ route }) {
  if (!route?.legs?.length) return null;
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900">Turn-by-turn</h2>
      <ul className="mt-2 space-y-2">
        {route.legs.map((leg, i) => (
          <LegItem key={i} leg={leg} index={i} />
        ))}
      </ul>
    </div>
  );
}
