"use client";

import React, { useEffect, useRef } from "react";
import { type Net, XOR, forward } from "../../lib/nn";
import { useTheme } from "../../context/ThemeContext";

const RES = 56;

/**
 * What the network currently believes for every point of the input square:
 * dark = "1", light = "0". The four XOR examples sit in the corners.
 */
const DecisionBoundary: React.FC<{
  net: Net;
  selected?: number;
  onSelect?: (i: number) => void;
}> = ({ net, selected, onSelect }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(RES, RES);
    const dark = theme === "dark";
    // light: zinc-50 → zinc-900; dark: zinc-900 → zinc-100
    const lo = dark ? [24, 24, 27] : [250, 250, 250];
    const hi = dark ? [228, 228, 231] : [24, 24, 27];
    for (let py = 0; py < RES; py++) {
      for (let px = 0; px < RES; px++) {
        // Slightly beyond [0,1] so the corner points are not on the edge.
        const x1 = -0.25 + (px / (RES - 1)) * 1.5;
        const x2 = 1.25 - (py / (RES - 1)) * 1.5;
        const y = forward(net, [x1, x2]).yHat;
        // Sharpen the transition a bit so the boundary reads clearly.
        const t = 1 / (1 + Math.exp(-(y - 0.5) * 9));
        const k = (py * RES + px) * 4;
        img.data[k] = lo[0] + (hi[0] - lo[0]) * t;
        img.data[k + 1] = lo[1] + (hi[1] - lo[1]) * t;
        img.data[k + 2] = lo[2] + (hi[2] - lo[2]) * t;
        img.data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [net, theme]);

  const pos = (v: number) => `${((v + 0.25) / 1.5) * 100}%`;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <canvas
        ref={ref}
        width={RES}
        height={RES}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: "auto" }}
      />
      {XOR.map((s, i) => {
        const yHat = forward(net, s.x).yHat;
        const correct = (yHat > 0.5 ? 1 : 0) === s.y;
        return (
          <button
            key={i}
            onClick={() => onSelect?.(i)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: pos(s.x[0]), top: `calc(100% - ${pos(s.x[1])})` }}
            aria-label={`Example (${s.x.join(",")}) target ${s.y}`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold shadow-md transition-transform ${
                s.y === 1
                  ? "border-white bg-zinc-900 text-white dark:border-zinc-900 dark:bg-white dark:text-zinc-900"
                  : "border-zinc-900 bg-white text-zinc-900 dark:border-white dark:bg-zinc-900 dark:text-white"
              } ${selected === i ? "scale-125 ring-2 ring-amber-500 ring-offset-1" : ""}`}
            >
              {s.y}
            </span>
            <span
              className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded px-1 text-[10px] font-mono font-semibold ${
                correct ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"
              }`}
            >
              ŷ {yHat.toFixed(2)}
            </span>
          </button>
        );
      })}
      <span className="absolute bottom-1.5 right-2 text-[10px] font-semibold text-zinc-400">
        x₁ →
      </span>
      <span className="absolute left-2 top-1.5 text-[10px] font-semibold text-zinc-400">↑ x₂</span>
    </div>
  );
};

export default DecisionBoundary;
