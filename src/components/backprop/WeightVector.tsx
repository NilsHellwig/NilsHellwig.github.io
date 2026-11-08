"use client";

import React from "react";
import { motion } from "framer-motion";
import { GRAD, signColor } from "./ui";

interface WeightVectorProps {
  /** Weights followed by the bias as the last entry. */
  values: number[];
  /** Top-left corner of the drawing area. */
  x: number;
  y: number;
  barW?: number;
  gap?: number;
  /** Half the total height: a weight of size `scale` reaches this far from the baseline. */
  half?: number;
  scale?: number;
  /** Previous values, drawn as dashed outlines (used for the update step). */
  ghost?: number[];
  /** Gradient per entry; an amber tick shows the direction the update will push. */
  grad?: number[];
  gradScale?: number;
  labels?: string[];
}

/** A neuron's weight vector as a tiny bar chart: up = positive, down = negative. */
const WeightVector: React.FC<WeightVectorProps> = ({
  values,
  x,
  y,
  barW = 13,
  gap = 6,
  half = 14,
  scale = 2,
  ghost,
  grad,
  gradScale = 4,
  labels,
}) => {
  const base = y + half;
  const n = values.length;
  // The bias sits slightly apart from the real weights.
  const bx = (i: number) => x + i * (barW + gap) + (i === n - 1 ? 4 : 0);
  const height = (v: number) => (Math.min(Math.abs(v), scale) / scale) * half;
  const width = bx(n - 1) + barW - x;

  return (
    <g>
      <line
        x1={x - 3}
        x2={x + width + 3}
        y1={base}
        y2={base}
        className="stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth={1}
      />
      {values.map((v, i) => {
        const h = Math.max(height(v), 1);
        const isBias = i === n - 1;
        return (
          <g key={i}>
            {ghost && (
              <rect
                x={bx(i)}
                width={barW}
                y={ghost[i] >= 0 ? base - height(ghost[i]) : base}
                height={Math.max(height(ghost[i]), 1)}
                rx={2}
                fill="none"
                strokeDasharray="2 2"
                className="stroke-zinc-400 dark:stroke-zinc-500"
                strokeWidth={1}
              />
            )}
            <motion.rect
              x={bx(i)}
              width={barW}
              rx={2}
              initial={false}
              animate={{ y: v >= 0 ? base - h : base, height: h, fill: signColor(v) }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              opacity={isBias ? 0.55 : 0.95}
            />
            {grad && Math.abs(grad[i]) > 1e-4 && (
              <GradTick
                cx={bx(i) + barW / 2}
                from={v >= 0 ? base - h : base + h}
                dir={-Math.sign(grad[i])}
                len={Math.min(Math.abs(grad[i]) * gradScale * half, half * 0.9) + 3}
              />
            )}
            {labels && (
              <text
                x={bx(i) + barW / 2}
                y={base + half + 10}
                textAnchor="middle"
                className="fill-zinc-400 dark:fill-zinc-500"
                fontSize={9.5}
              >
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** Small amber arrow pointing in the direction gradient descent will move a weight. */
const GradTick: React.FC<{ cx: number; from: number; dir: number; len: number }> = ({
  cx,
  from,
  dir,
  len,
}) => {
  // dir = +1 means the weight will grow (arrow points up in SVG space).
  const y2 = from - dir * len;
  return (
    <g>
      <line x1={cx} x2={cx} y1={from} y2={y2} stroke={GRAD} strokeWidth={2} strokeLinecap="round" />
      <path
        d={`M ${cx - 3} ${y2 + dir * 3} L ${cx} ${y2} L ${cx + 3} ${y2 + dir * 3}`}
        fill="none"
        stroke={GRAD}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

export default WeightVector;
