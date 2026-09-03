import { useId } from "react";

/**
 * A small "ⓘ" info button that reveals an explanation in a native popover,
 * positioned next to the button via CSS anchor positioning — no JS
 * measuring/positioning code needed. Both are current browser platform
 * features (not a library):
 *   - Popover API: the `popover` attribute + `popovertarget` trigger.
 *   - CSS anchor positioning: `anchor-name` / `position-anchor` / `position-area`.
 * Anchor positioning is Chrome/Edge only today, so it's applied inside
 * `@supports (position-anchor: --a)` — everywhere else the popover still
 * opens, just centered via the platform's default popover placement
 * instead of tethered to the button.
 */
export function InfoTooltip({ term, children }: { term: string; children: React.ReactNode }) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9-]/g, "");
  const popoverId = `info-tooltip-${safeId}`;
  const anchorName = `--info-anchor-${safeId}`;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        popoverTarget={popoverId}
        aria-label={`Qué significa "${term}"`}
        style={{ anchorName } as React.CSSProperties}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold leading-none text-slate-300 hover:bg-sky-600 hover:text-white"
      >
        i
      </button>
      <div
        id={popoverId}
        popover="auto"
        style={{ positionAnchor: anchorName } as React.CSSProperties}
        className="info-tooltip-popover m-0 max-w-[260px] rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs leading-relaxed text-slate-300 shadow-xl"
      >
        <p className="mb-1 font-semibold text-slate-100">{term}</p>
        {children}
      </div>
    </span>
  );
}
