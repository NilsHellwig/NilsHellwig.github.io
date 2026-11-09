"use client";

import React from "react";
import { motion } from "framer-motion";
import { fmt } from "../../lib/nn";
import { GRAD, signColor } from "./ui";

interface WeightVectorProps {
  /** Weights followed by the bias as the last entry. */
  values: number[];
  /** Top-left corner and width of the drawing area (height is about 50). */
  x: number;
  y: number;
  width: number;
  /** Name tags above the entries, e.g. ["w₁", "w₂", "b"]. */
  labels?: string[];
  /** Previous values, shown struck through underneath (used for the update step). */
  ghost?: number[];
  /** Gradient per entry; an amber arrow shows which way the update will push. */
  grad?: number[];
}

/**
 * A neuron's weights written as a vector, i.e. a list of numbers in brackets:
 *   w₁    w₂    b
 * [ 1.20 −0.80 │ 0.30 ]
 * Blue = positive, red = negative; the bias is set apart by a thin divider.
 */
const WeightVector: React.FC<WeightVectorProps> = ({
  values,
  x,
  y,
  width,
  labels,
  ghost,
  grad,
}) => {
  const n = values.length;
  const pad = 8;
  const sw = (width - 2 * pad) / n;
  const cx = (i: number) => x + pad + sw * (i + 0.5);
  const digits = sw >= 40 ? 2 : 1;
  const strs = values.map((v) => fmt(v, digits));
  const maxLen = Math.max(...strs.map((s) => s.length), 4);
  const fontSize = Math.min(13, sw / (maxLen * 0.78));
  const top = y + 14;
  const bot = y + 37;
  const right = x + width;

  return (
    <g>
      {/* brackets */}
      <path
        d={`M ${x + 5} ${top} L ${x + 1} ${top} L ${x + 1} ${bot} L ${x + 5} ${bot}`}
        fill="none"
        strokeWidth={1.5}
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
      <path
        d={`M ${right - 5} ${top} L ${right - 1} ${top} L ${right - 1} ${bot} L ${right - 5} ${bot}`}
        fill="none"
        strokeWidth={1.5}
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
      {/* divider before the bias */}
      <line
        x1={x + pad + sw * (n - 1)}
        x2={x + pad + sw * (n - 1)}
        y1={top + 4}
        y2={bot - 4}
        strokeDasharray="2 2"
        className="stroke-zinc-300 dark:stroke-zinc-600"
      />
      {values.map((v, i) => {
        const isBias = i === n - 1;
        const g = grad?.[i];
        const showGrad = g !== undefined && Math.abs(g) > 1e-4;
        const showGhost = ghost && Math.abs(ghost[i] - v) > 5e-4;
        return (
          <g key={i}>
            {labels && (
              <text
                x={cx(i)}
                y={y + 9}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight={600}
                className="fill-zinc-400 dark:fill-zinc-500"
              >
                {labels[i]}
              </text>
            )}
            <motion.text
              x={cx(i)}
              y={y + 30}
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight={700}
              className="font-mono tabular-nums"
              initial={false}
              animate={{ fill: signColor(v) }}
              opacity={isBias ? 0.75 : 1}
            >
              {strs[i]}
            </motion.text>
            {showGhost && (
              <motion.text
                key={strs[i]}
                x={cx(i) - (showGrad ? 5 : 0)}
                y={y + 47}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                className="font-mono fill-zinc-400 dark:fill-zinc-500"
                textDecoration="line-through"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fmt(ghost![i], digits)}
              </motion.text>
            )}
            {showGrad && <GradArrow cx={cx(i) + (showGhost ? 14 : 0)} cy={y + 44} g={g!} />}
          </g>
        );
      })}
    </g>
  );
};

/**
 * Small amber arrow: the direction gradient descent will move this weight
 * (against the gradient). Longer arrow = bigger gradient.
 */
const GradArrow: React.FC<{ cx: number; cy: number; g: number }> = ({ cx, cy, g }) => {
  const up = g < 0; // negative gradient → the weight will grow
  const len = 4 + Math.min(Math.abs(g) * 14, 6);
  const y1 = cy + (up ? len / 2 : -len / 2);
  const y2 = cy + (up ? -len / 2 : len / 2);
  const d = up ? 3 : -3;
  return (
    <g>
      <line x1={cx} x2={cx} y1={y1} y2={y2} stroke={GRAD} strokeWidth={2} strokeLinecap="round" />
      <path
        d={`M ${cx - 3} ${y2 + d} L ${cx} ${y2} L ${cx + 3} ${y2 + d}`}
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
