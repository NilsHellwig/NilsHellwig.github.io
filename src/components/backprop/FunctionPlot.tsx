"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface FunctionPlotProps {
  fn: (x: number) => number;
  x: [number, number];
  y: [number, number];
  points?: { x: number; label?: string; color?: string }[];
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  /** Draw the tangent line at the first point (shows a slope). */
  tangent?: boolean;
  className?: string;
}

/** Minimal function plot in the site's monochrome style. */
const FunctionPlot: React.FC<FunctionPlotProps> = ({
  fn,
  x: [x0, x1],
  y: [y0, y1],
  points = [],
  xLabel,
  yLabel,
  width = 260,
  height = 140,
  tangent = false,
  className = "",
}) => {
  const pad = { l: 26, r: 10, t: 10, b: 22 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const sx = (v: number) => pad.l + ((v - x0) / (x1 - x0)) * W;
  const sy = (v: number) => pad.t + (1 - (Math.min(Math.max(v, y0), y1) - y0) / (y1 - y0)) * H;

  const path = useMemo(() => {
    const n = 120;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const xv = x0 + ((x1 - x0) * i) / n;
      d += `${i ? "L" : "M"}${sx(xv).toFixed(1)},${sy(fn(xv)).toFixed(1)}`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, x0, x1, y0, y1, width, height]);

  const tan = (() => {
    if (!tangent || !points[0]) return null;
    const p = points[0].x;
    const h = 1e-4;
    const m = (fn(p + h) - fn(p - h)) / (2 * h);
    const dx = (x1 - x0) * 0.22;
    return { a: { x: p - dx, y: fn(p) - m * dx }, b: { x: p + dx, y: fn(p) + m * dx } };
  })();

  const zeroY = y0 < 0 && y1 > 0 ? sy(0) : null;
  const zeroX = x0 < 0 && x1 > 0 ? sx(0) : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto ${className}`}>
      <rect
        x={pad.l}
        y={pad.t}
        width={W}
        height={H}
        rx={6}
        className="fill-zinc-50 dark:fill-zinc-900/60"
      />
      {zeroY !== null && (
        <line
          x1={pad.l}
          x2={pad.l + W}
          y1={zeroY}
          y2={zeroY}
          className="stroke-zinc-200 dark:stroke-zinc-700"
        />
      )}
      {zeroX !== null && (
        <line
          x1={zeroX}
          x2={zeroX}
          y1={pad.t}
          y2={pad.t + H}
          className="stroke-zinc-200 dark:stroke-zinc-700"
        />
      )}
      <path d={path} fill="none" strokeWidth={2} className="stroke-zinc-800 dark:stroke-zinc-200" />
      {tan && (
        <line
          x1={sx(tan.a.x)}
          y1={sy(tan.a.y)}
          x2={sx(tan.b.x)}
          y2={sy(tan.b.y)}
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
      )}
      {points.map((p, i) => (
        <g key={i}>
          <motion.circle
            initial={false}
            animate={{ cx: sx(p.x), cy: sy(fn(p.x)) }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            r={4.5}
            fill={p.color ?? "#18181b"}
            className={p.color ? "" : "dark:fill-white"}
            stroke="white"
            strokeWidth={1.5}
          />
          {p.label && (
            <motion.text
              initial={false}
              animate={{ x: sx(p.x) + 7, y: sy(fn(p.x)) - 7 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              fontSize={10}
              fontWeight={700}
              className="fill-zinc-700 dark:fill-zinc-200"
            >
              {p.label}
            </motion.text>
          )}
        </g>
      ))}
      {/* axis ticks */}
      <text x={pad.l} y={height - 6} fontSize={9} className="fill-zinc-400">
        {x0}
      </text>
      <text x={pad.l + W} y={height - 6} fontSize={9} textAnchor="end" className="fill-zinc-400">
        {x1}
      </text>
      <text x={pad.l - 4} y={pad.t + 8} fontSize={9} textAnchor="end" className="fill-zinc-400">
        {y1}
      </text>
      <text x={pad.l - 4} y={pad.t + H} fontSize={9} textAnchor="end" className="fill-zinc-400">
        {y0}
      </text>
      {xLabel && (
        <text
          x={pad.l + W / 2}
          y={height - 6}
          fontSize={10}
          fontWeight={600}
          textAnchor="middle"
          className="fill-zinc-500 dark:fill-zinc-400"
        >
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={pad.l + 6}
          y={pad.t + 14}
          fontSize={10}
          fontWeight={600}
          className="fill-zinc-500 dark:fill-zinc-400"
        >
          {yLabel}
        </text>
      )}
    </svg>
  );
};

export default FunctionPlot;
