import { useState } from 'react';

function LegItem({ leg, index }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-md border border-[--ml-border] bg-[--ml-surface]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[--ml-accent-fg] text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="text-[--ml-ink]">
            {leg.distanceText} · {leg.durationText}
          </span>
        </span>
        <span className="text-[--ml-muted]">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ol className="space-y-1 border-t border-[--ml-border] px-3 py-2 text-xs text-[--ml-muted]">
          {leg.steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[--ml-muted]">{i + 1}.</span>
              <span
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: s.instructionHtml }}
              />
              <span className="shrink-0 text-[--ml-muted]">{s.distanceText}</span>
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
      <h2 className="text-sm font-semibold text-[--ml-ink]">Turn-by-turn</h2>
      <ul className="mt-2 space-y-2">
        {route.legs.map((leg, i) => (
          <LegItem key={i} leg={leg} index={i} />
        ))}
      </ul>
    </div>
  );
}
