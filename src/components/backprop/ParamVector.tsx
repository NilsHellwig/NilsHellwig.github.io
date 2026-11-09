"use client";

import React from "react";
import { type Grads, type Net, fmt } from "../../lib/nn";
import { NEG, POS } from "./ui";
import { useT } from "../explainer/i18n";

const SUB = ["₀", "₁", "₂", "₃"];

interface Entry {
  label: string;
  value: number;
}

/** The whole network as one list of 13 numbers, grouped by neuron. */
export const flattenNet = (net: Net): Entry[][] => [
  ...[0, 1, 2].map((j) => [
    { label: `w${SUB[j + 1]}${SUB[1]}`, value: net.W1[j][0] },
    { label: `w${SUB[j + 1]}${SUB[2]}`, value: net.W1[j][1] },
    { label: `b${SUB[j + 1]}`, value: net.b1[j] },
  ]),
  [...net.W2.map((v, j) => ({ label: `v${SUB[j + 1]}`, value: v })), { label: "c", value: net.b2 }],
];

export const flattenGrads = (g: Grads): Entry[][] => [
  ...[0, 1, 2].map((j) => [
    { label: `w${SUB[j + 1]}${SUB[1]}`, value: g.dW1[j][0] },
    { label: `w${SUB[j + 1]}${SUB[2]}`, value: g.dW1[j][1] },
    { label: `b${SUB[j + 1]}`, value: g.db1[j] },
  ]),
  [...g.dW2.map((v, j) => ({ label: `v${SUB[j + 1]}`, value: v })), { label: "c", value: g.db2 }],
];

/**
 * A long vector in bracket notation: [ w₁₁ w₁₂ b₁ │ w₂₁ … │ v₁ v₂ v₃ c ].
 * `tone="grad"` paints the numbers amber (a gradient vector).
 */
const ParamVector: React.FC<{
  groups: Entry[][];
  tone?: "sign" | "grad";
  digits?: number;
  title?: React.ReactNode;
  /** Highlight entries that differ from these (e.g. before an update). */
  compare?: Entry[][];
}> = ({ groups, tone = "sign", digits = 2, title, compare }) => {
  const t = useT();
  const groupName = (gi: number) =>
    gi < 3 ? `h${SUB[gi + 1]}` : t({ en: "output", de: "Ausgang" });
  return (
    <div>
      {title && <div className="eyebrow mb-1.5 !text-[10px]">{title}</div>}
      <div className="flex items-stretch gap-1">
        <span className="w-1.5 shrink-0 rounded-l border-y-2 border-l-2 border-zinc-400 dark:border-zinc-500" />
        <div className="flex min-w-0 flex-1 flex-wrap items-stretch gap-x-1 gap-y-2 py-1">
          {groups.map((g, gi) => (
            <div
              key={gi}
              className={`flex flex-col ${gi > 0 ? "border-l border-dashed border-zinc-300 pl-1.5 dark:border-zinc-600" : ""}`}
            >
              <span className="mb-0.5 text-[10px] font-semibold tracking-wide text-zinc-400 dark:text-zinc-500">
                {groupName(gi)}
              </span>
              <div className="flex gap-1">
                {g.map((e, ei) => {
                  const changed = compare && Math.abs(compare[gi][ei].value - e.value) > 5e-4;
                  const color = tone === "grad" ? undefined : e.value >= 0 ? POS : NEG;
                  return (
                    <span
                      key={ei}
                      className={`flex min-w-[2.6rem] flex-col items-center rounded px-0.5 ${changed ? "bg-emerald-500/10" : ""}`}
                    >
                      <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500">
                        {e.label}
                      </span>
                      <span
                        className={`font-mono text-[12px] font-semibold tabular-nums ${tone === "grad" ? "text-amber-600 dark:text-amber-400" : ""}`}
                        style={color ? { color } : undefined}
                      >
                        {fmt(e.value, digits)}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <span className="w-1.5 shrink-0 rounded-r border-y-2 border-r-2 border-zinc-400 dark:border-zinc-500" />
      </div>
    </div>
  );
};

export default ParamVector;
