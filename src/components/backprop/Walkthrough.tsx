"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { XOR, forward } from "../../lib/nn";
import NetworkDiagram from "./NetworkDiagram";
import { STEPS, type StepCtx } from "./steps";
import { Legend, Segmented, itemVariants } from "./ui";

interface WalkthroughProps {
  stepKeys: string[];
  ctx: StepCtx;
  sampleIdx: number;
  onSampleChange: (i: number) => void;
  /** Offset for the step numbers, so numbering continues across sections. */
  startNumber: number;
}

const PHASE_LABEL = {
  forward: "Forward pass",
  loss: "Loss",
  backward: "Backward pass",
  update: "Update",
} as const;

const PHASE_DOT = {
  forward: "bg-sky-500",
  loss: "bg-zinc-500",
  backward: "bg-amber-500",
  update: "bg-emerald-500",
} as const;

export const SamplePicker: React.FC<{ value: number; onChange: (i: number) => void }> = ({
  value,
  onChange,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="eyebrow">Example</span>
    <Segmented
      options={[0, 1, 2, 3]}
      value={value}
      onChange={onChange}
      render={(i) => (
        <span className="font-mono">
          ({XOR[i].x.join(",")})→{XOR[i].y}
        </span>
      )}
    />
  </div>
);

const Walkthrough: React.FC<WalkthroughProps> = ({
  stepKeys,
  ctx,
  sampleIdx,
  onSampleChange,
  startNumber,
}) => {
  const steps = useMemo(() => STEPS.filter((s) => stepKeys.includes(s.key)), [stepKeys]);
  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  const d = step.diagram(ctx);
  const net = d.net ?? ctx.net;
  const cache = d.net ? forward(d.net, ctx.sample.x) : ctx.c;
  const multi = steps.length > 1;

  const go = (delta: number) => setIdx((i) => Math.min(Math.max(i + delta, 0), steps.length - 1));

  return (
    <motion.div
      variants={itemVariants}
      className="card overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-700/60 sm:px-5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${PHASE_DOT[step.phase]}`} />
          <span className="eyebrow">{PHASE_LABEL[step.phase]}</span>
        </div>
        <SamplePicker value={sampleIdx} onChange={onSampleChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr]">
        {/* diagram */}
        <div className="border-b border-zinc-100 p-3 dark:border-zinc-700/60 sm:p-5 lg:border-b-0 lg:border-r">
          <NetworkDiagram
            net={net}
            cache={cache}
            grads={d.showGrads ? ctx.g : undefined}
            target={ctx.sample.y}
            focus={d.focus}
            flow={d.flow}
            display={d.display}
            ghost={d.ghost}
          />
          <Legend className="mt-3 justify-center" />
        </div>

        {/* explanation */}
        <div className="flex flex-col p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              className="flex-1"
            >
              <div className="mb-3 flex items-baseline gap-2">
                <span className="shrink-0 font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
                  step {startNumber + idx}/{STEPS.length}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                  {step.title}
                </h3>
              </div>
              <div className="space-y-3 text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {step.body(ctx)}
              </div>
            </motion.div>
          </AnimatePresence>

          {multi && (
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-700/60">
              <button
                className="btn disabled:opacity-40"
                onClick={() => go(-1)}
                disabled={idx === 0}
              >
                <ArrowLeft size={14} weight="bold" /> Back
              </button>
              <div className="flex items-center gap-1.5">
                {steps.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setIdx(i)}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    className="group cursor-pointer p-1"
                  >
                    <motion.span
                      className={`block h-1.5 rounded-full transition-colors ${
                        i === idx
                          ? "bg-zinc-900 dark:bg-zinc-100"
                          : "bg-zinc-300 group-hover:bg-zinc-400 dark:bg-zinc-600"
                      }`}
                      animate={{ width: i === idx ? 22 : 6 }}
                    />
                  </button>
                ))}
              </div>
              <button
                className="btn-primary disabled:opacity-40"
                onClick={() => go(1)}
                disabled={idx === steps.length - 1}
              >
                Next <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Walkthrough;
