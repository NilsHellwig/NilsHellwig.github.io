"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { fmt } from "../../lib/nn";
import NetworkDiagram from "./NetworkDiagram";
import type { StepCtx } from "./steps";
import { N, Segmented, itemVariants } from "./ui";

const S = ["₀", "₁", "₂", "₃"];

/**
 * The chain rule as a row of "local slopes" that multiply up, one link at a time,
 * for a weight the reader picks.
 */
const ChainRule: React.FC<{ ctx: StepCtx }> = ({ ctx }) => {
  const { net, c, sample } = ctx;
  const [j, setJ] = useState(0);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-120px" });

  const y = sample.y;
  const dLdy = -y / c.yHat + (1 - y) / (1 - c.yHat);
  const factors = [
    {
      label: "∂L/∂ŷ",
      what: "loss vs. prediction",
      formula: y === 1 ? "−1/ŷ" : "1/(1−ŷ)",
      value: dLdy,
    },
    {
      label: "∂ŷ/∂z",
      what: "through the sigmoid",
      formula: "ŷ(1−ŷ)",
      value: c.yHat * (1 - c.yHat),
    },
    {
      label: `∂z/∂h${S[j + 1]}`,
      what: "along the weight",
      formula: `v${S[j + 1]}`,
      value: net.W2[j],
    },
    {
      label: `∂h${S[j + 1]}/∂z${S[j + 1]}`,
      what: "through tanh",
      formula: `1−h${S[j + 1]}²`,
      value: 1 - c.h[j] ** 2,
    },
    {
      label: `∂z${S[j + 1]}/∂w${S[j + 1]}${S[i + 1]}`,
      what: "the input on the wire",
      formula: `x${S[i + 1]}`,
      value: c.x[i],
    },
  ];
  const partial = factors.slice(0, shown).reduce((a, f) => a * f.value, 1);

  // Reveal the chain one link at a time while it is on screen.
  useEffect(() => {
    if (!inView) return;
    if (shown >= factors.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : 900);
    return () => clearTimeout(t);
  }, [inView, shown, factors.length]);

  // Restart when the chosen weight or example changes.
  useEffect(() => setShown(0), [j, i, sample]);

  // How many links must be revealed before each element on the path lights up.
  const threshold: Record<string, number> = {
    loss: 0,
    eL: 0,
    out: 1,
    [`v${j + 1}`]: 3,
    [`h${j + 1}`]: 4,
    [`w${j + 1}${i + 1}`]: 5,
    [`x${i + 1}`]: 5,
  };
  const focus = Object.keys(threshold).filter((k) => shown >= threshold[k]);

  return (
    <motion.div variants={itemVariants} className="card overflow-hidden" ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-700/60 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">Pick a weight</span>
          <Segmented
            options={[0, 1, 2]}
            value={j}
            onChange={setJ}
            render={(v) => `neuron h${S[v + 1]}`}
          />
          <Segmented
            options={[0, 1]}
            value={i}
            onChange={setI}
            render={(v) => `input x${S[v + 1]}`}
          />
        </div>
        <button className="btn" onClick={() => setShown(0)}>
          <ArrowCounterClockwise size={14} weight="bold" /> Replay
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
        <div className="border-b border-zinc-100 p-3 dark:border-zinc-700/60 sm:p-5 lg:border-b-0 lg:border-r">
          <NetworkDiagram
            net={net}
            cache={c}
            target={y}
            focus={focus}
            flow="backward"
            display={{ loss: true }}
            interactive={false}
          />
        </div>

        <div className="p-4 sm:p-6">
          <p className="mb-4 text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            The weight{" "}
            <b>
              w{S[j + 1]}
              {S[i + 1]}
            </b>{" "}
            influences the loss only through a chain of steps. The chain rule says: the total effect
            is the <b>product of the local slopes</b> along that chain. Read it right to left, like
            the blame travels.
          </p>

          <div className="flex flex-wrap items-stretch gap-1.5">
            {factors.map((f, k) => {
              const on = k < shown;
              return (
                <React.Fragment key={k}>
                  {k > 0 && (
                    <span className="self-center text-sm font-bold text-zinc-300 dark:text-zinc-600">
                      ×
                    </span>
                  )}
                  <motion.div
                    animate={{
                      opacity: on ? 1 : 0.35,
                      scale: k === shown - 1 ? [1, 1.06, 1] : 1,
                    }}
                    transition={{ duration: 0.45 }}
                    className={`min-w-[86px] flex-1 rounded-lg border px-2.5 py-2 ${
                      on
                        ? "border-amber-400/70 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
                    }`}
                  >
                    <div className="text-[12.5px] font-semibold text-zinc-900 dark:text-white">
                      {f.label}
                    </div>
                    <div className="text-[10.5px] text-zinc-500 dark:text-zinc-400">{f.what}</div>
                    <div className="mt-1 flex items-baseline justify-between gap-1 text-[11px]">
                      <span className="text-zinc-500 dark:text-zinc-400">{f.formula}</span>
                      <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
                        {on ? fmt(f.value, 3) : "?"}
                      </span>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-zinc-900 px-4 py-3 text-zinc-100 dark:bg-zinc-950 dark:ring-1 dark:ring-zinc-700">
            <span className="text-sm font-semibold">
              ∂L/∂w{S[j + 1]}
              {S[i + 1]} =
            </span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${shown}-${j}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="font-mono text-lg font-bold tabular-nums text-amber-400"
              >
                {shown === 0 ? "…" : fmt(partial, 4)}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-zinc-400">
              {shown < factors.length
                ? `${shown} of ${factors.length} links multiplied`
                : "same number backprop computed as δ·x"}
            </span>
          </div>

          <p className="mt-4 text-[13px] text-zinc-500 dark:text-zinc-400">
            Notice the first two links: <N>{fmt(factors[0].value, 3)}</N> ×{" "}
            <N>{fmt(factors[1].value, 3)}</N> = <N tone="grad">{fmt(ctx.g.delta2, 3)}</N>, which is
            exactly δ = ŷ − y. Backprop never multiplies the whole chain from scratch for every
            weight. It computes each shared prefix <b>once</b> (the δ&apos;s) and reuses it. That
            reuse is the whole trick, and why it scales to networks with billions of weights.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChainRule;
