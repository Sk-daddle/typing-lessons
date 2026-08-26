"use client";

import { FINGERS, KB_ROWS } from "@/lib/keyboard";

const LEGEND: { finger: string; varName: string }[] = [
  { finger: "pinky", varName: "--f-pinky" },
  { finger: "ring", varName: "--f-ring" },
  { finger: "middle", varName: "--f-mid" },
  { finger: "pointer", varName: "--f-index" },
  { finger: "thumb", varName: "--f-thumb" },
];

export function OnscreenKeyboard({
  highlight,
}: {
  highlight: { base: string; shift: "ShiftL" | "ShiftR" | null } | null;
}) {
  const isHit = (k: string) => highlight !== null && (k === highlight.base || k === highlight.shift);
  return (
    <div>
      <div className="kb mt-6">
        {KB_ROWS.map((row, ri) => (
          <div className="kb-row" key={ri}>
            {row.map((K) => (
              <div
                key={K.k}
                className={`kb-key f-${FINGERS[K.k] ?? "thumb"} ${K.cls ?? ""} ${K.bump ? "bump" : ""} ${isHit(K.k) ? "hit" : ""}`}
              >
                {K.label ?? K.k}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        {LEGEND.map((l) => (
          <span key={l.finger} className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-3.5 rounded-[5px]"
              style={{ background: `var(${l.varName})` }}
            />
            {l.finger}
          </span>
        ))}
      </div>
    </div>
  );
}
