"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { fmt } from "../../lib/nn";
import FunctionPlot from "./FunctionPlot";
import WeightVector from "./WeightVector";
import { F, N, Segmented, Slider, itemVariants, signColor } from "./ui";

/** One neuron you can play with: weights, bias, inputs → weighted sum → tanh. */
export const NeuronAnatomy: React.FC = () => {
  const [w1, setW1] = useState(1.2);
  const [w2, setW2] = useState(-0.8);
  const [b, setB] = useState(0.3);
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(1);
  const z = w1 * x1 + w2 * x2 + b;
  const h = Math.tanh(z);

  return (
    <motion.div
      variants={itemVariants}
      className="card grid grid-cols-1 overflow-hidden md:grid-cols-[1fr_1fr]"
    >
      <div className="border-b border-zinc-100 p-4 dark:border-zinc-700/60 md:border-b-0 md:border-r sm:p-6">
        <div className="eyebrow mb-3">One neuron, up close</div>
        <svg viewBox="0 0 380 150" className="w-full h-auto">
          {/* inputs */}
          {[x1, x2].map((x, i) => (
            <g key={i}>
              <line
                x1={46}
                y1={40 + i * 70}
                x2={150}
                y2={75}
                stroke={signColor(i === 0 ? w1 : w2)}
                strokeWidth={1 + 4 * Math.min(Math.abs(i === 0 ? w1 : w2) / 2.5, 1)}
                strokeOpacity={0.6}
              />
              <circle
                cx={30}
                cy={40 + i * 70}
                r={18}
                className="fill-white stroke-zinc-300 dark:fill-zinc-800 dark:stroke-zinc-600"
                strokeWidth={1.5}
              />
              <text
                x={30}
                y={45 + i * 70}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                className="font-mono fill-zinc-900 dark:fill-white"
              >
                {x}
              </text>
              <text
                x={30}
                y={i === 0 ? 14 : 136}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                className="fill-zinc-400"
              >
                x{i === 0 ? "₁" : "₂"}
              </text>
            </g>
          ))}
          {/* neuron body */}
          <rect
            x={150}
            y={30}
            width={130}
            height={90}
            rx={14}
            className="fill-white stroke-zinc-900 dark:fill-zinc-800 dark:stroke-zinc-100"
            strokeWidth={1.5}
          />
          <text
            x={162}
            y={50}
            fontSize={11}
            fontWeight={700}
            className="fill-zinc-900 dark:fill-white"
          >
            weights
          </text>
          <WeightVector values={[w1, w2, b]} x={166} y={60} half={18} labels={["w₁", "w₂", "b"]} />
          <text x={268} y={72} textAnchor="end" fontSize={10} className="fill-zinc-400">
            Σ
          </text>
          <text
            x={268}
            y={88}
            textAnchor="end"
            fontSize={13}
            fontWeight={700}
            className="font-mono fill-zinc-900 dark:fill-white"
          >
            {fmt(z)}
          </text>
          <text
            x={268}
            y={110}
            textAnchor="end"
            fontSize={10}
            fontWeight={600}
            className="fill-zinc-400"
          >
            tanh
          </text>
          {/* output */}
          <line x1={280} y1={75} x2={322} y2={75} className="stroke-zinc-400" strokeWidth={2} />
          <circle cx={344} cy={75} r={22} className="fill-zinc-900 dark:fill-white" />
          <text
            x={344}
            y={80}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            className="font-mono fill-white dark:fill-zinc-900"
          >
            {fmt(h)}
          </text>
          <text
            x={344}
            y={115}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            className="fill-zinc-400"
          >
            h
          </text>
        </svg>

        <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-2.5 text-[13.5px] dark:bg-zinc-900/60">
          <div className="text-zinc-600 dark:text-zinc-300">
            z = w₁x₁ + w₂x₂ + b = {fmt(w1)}·{x1} + {fmt(w2)}·{x2} + {fmt(b)} = <N>{fmt(z)}</N>
          </div>
          <div className="mt-1 text-zinc-600 dark:text-zinc-300">
            h = tanh(z) = <N>{fmt(h)}</N>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">x₁</span>
            <Segmented options={[0, 1]} value={x1} onChange={setX1} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">x₂</span>
            <Segmented options={[0, 1]} value={x2} onChange={setX2} />
          </div>
        </div>
        <Slider
          label="weight w₁"
          value={w1}
          min={-2.5}
          max={2.5}
          step={0.1}
          onChange={setW1}
          display={fmt(w1)}
        />
        <Slider
          label="weight w₂"
          value={w2}
          min={-2.5}
          max={2.5}
          step={0.1}
          onChange={setW2}
          display={fmt(w2)}
        />
        <Slider
          label="bias b"
          value={b}
          min={-2.5}
          max={2.5}
          step={0.1}
          onChange={setB}
          display={fmt(b)}
        />
        <FunctionPlot
          fn={Math.tanh}
          x={[-4, 4]}
          y={[-1, 1]}
          yLabel="h = tanh(z)"
          width={380}
          height={190}
          points={[{ x: z, label: "h" }]}
        />
        <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
          The neuron&apos;s whole “personality” is its weight vector <F>(w₁, w₂)</F> and bias{" "}
          <F>b</F>. Learning means finding good values for them.
        </p>
      </div>
    </motion.div>
  );
};

/** XOR in a nutshell: the truth table and why one straight line can't split it. */
export const XorCard: React.FC = () => (
  <motion.div
    variants={itemVariants}
    className="card grid grid-cols-1 gap-6 p-4 sm:grid-cols-[auto_1fr] sm:p-6"
  >
    <table className="text-sm">
      <thead>
        <tr className="text-zinc-400">
          <th className="px-3 pb-2 text-left font-semibold">x₁</th>
          <th className="px-3 pb-2 text-left font-semibold">x₂</th>
          <th className="px-3 pb-2 text-left font-semibold">y</th>
        </tr>
      </thead>
      <tbody className="font-mono">
        {[
          [0, 0, 0],
          [0, 1, 1],
          [1, 0, 1],
          [1, 1, 0],
        ].map((r) => (
          <tr key={r.join()} className="border-t border-zinc-100 dark:border-zinc-700/60">
            <td className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">{r[0]}</td>
            <td className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">{r[1]}</td>
            <td className="px-3 py-1.5 font-bold text-zinc-900 dark:text-white">{r[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <svg viewBox="0 0 140 140" className="w-[140px] shrink-0 self-center">
        <rect
          x={4}
          y={4}
          width={132}
          height={132}
          rx={10}
          className="fill-zinc-50 dark:fill-zinc-900/60"
        />
        {[
          [0, 0, 0],
          [0, 1, 1],
          [1, 0, 1],
          [1, 1, 0],
        ].map(([a, c, y]) => (
          <circle
            key={`${a}${c}`}
            cx={30 + a * 80}
            cy={110 - c * 80}
            r={11}
            strokeWidth={2.5}
            className={
              y
                ? "fill-zinc-900 stroke-zinc-900 dark:fill-white dark:stroke-white"
                : "fill-white stroke-zinc-900 dark:fill-zinc-900 dark:stroke-white"
            }
          />
        ))}
        <motion.line
          x1={10}
          x2={130}
          stroke="#f43f5e"
          strokeWidth={2}
          strokeDasharray="5 4"
          animate={{ y1: [20, 130, 70, 20], y2: [120, 10, 70, 120] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <p className="text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
        <b>XOR</b> (“exclusive or”) outputs 1 when exactly one input is 1. Try to separate the
        filled dots from the hollow ones with a single straight line: it&apos;s impossible. A single
        neuron can only draw one line, so we need a <b>hidden layer</b> whose neurons each draw a
        line, and an output neuron that combines them. That&apos;s why XOR is the classic first test
        for backprop.
      </p>
    </div>
  </motion.div>
);
