"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { fmt } from "../../lib/nn";
import NetworkDiagram from "./NetworkDiagram";
import type { StepCtx } from "./steps";
import { F, MoreMath, N, Segmented, itemVariants } from "./ui";

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
  const H = `h${S[j + 1]}`;
  const W = `w${S[j + 1]}${S[i + 1]}`;
  const factors = [
    {
      label: "guess → penalty",
      what: "how strongly the penalty reacts to the guess",
      sym: "∂L/∂ŷ",
      value: dLdy,
    },
    {
      label: "score → guess",
      what: "steepness of the sigmoid curve",
      sym: "∂ŷ/∂z",
      value: c.yHat * (1 - c.yHat),
    },
    {
      label: `${H} → score`,
      what: `the wire weight v${S[j + 1]}`,
      sym: `∂z/∂${H}`,
      value: net.W2[j],
    },
    {
      label: `${H}'s score → ${H}`,
      what: "steepness of the tanh curve",
      sym: `∂${H}/∂z${S[j + 1]}`,
      value: 1 - c.h[j] ** 2,
    },
    {
      label: `${W} → ${H}'s score`,
      what: `the input x${S[i + 1]} on that wire`,
      sym: `∂z${S[j + 1]}/∂${W}`,
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
          <div className="mb-4 space-y-2 text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            <p>
              The weight <b>{W}</b> sits deep inside the network and can&apos;t touch the penalty
              directly. Its effect travels along a chain:
            </p>
            <p className="rounded-lg bg-zinc-50 px-3 py-2 text-[13px] font-medium text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
              {W} → {H}&apos;s score → {H} → output score → guess → penalty
            </p>
            <p>
              For each link we ask:{" "}
              <i>if the left side moves a little, how much does the right side move?</i> Then we
              multiply all those numbers. Read the boxes from left to right, starting at the
              penalty, the way the blame travels backwards.
            </p>
          </div>

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
                    className={`min-w-[118px] flex-1 rounded-lg border px-2.5 py-2 ${
                      on
                        ? "border-amber-400/70 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
                    }`}
                  >
                    <div className="text-[12.5px] font-semibold text-zinc-900 dark:text-white">
                      {f.label}
                    </div>
                    <div className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                      {f.what}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-1 text-[11px]">
                      <span className="text-zinc-400 dark:text-zinc-500">{f.sym}</span>
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
            <span className="text-sm font-semibold">effect of {W} on the penalty =</span>
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
                : "this is the gradient of " + W + ", the same number as in step 9"}
            </span>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            The trick that makes backprop fast: the first two boxes together (
            <N>{fmt(factors[0].value, 3)}</N> × <N>{fmt(factors[1].value, 3)}</N> ={" "}
            <N tone="grad">{fmt(ctx.g.delta2, 3)}</N>) are the same for <i>every</i> weight. That is
            exactly the output&apos;s error signal δ from step 6. Backprop computes such shared
            pieces only <b>once</b> and reuses them. That&apos;s why it works even for networks with
            billions of weights.
          </p>
          <div className="mt-3">
            <MoreMath title="For the curious: the notation">
              <p>
                A “how much does B move when A moves a little” number is called a <b>derivative</b>,
                written <F>∂B/∂A</F>. The curly ∂ means “a tiny change in”. The small gray labels in
                the boxes are these derivatives, and the chain rule says:
              </p>
              <p>
                <F>
                  ∂L/∂{W} = ∂L/∂ŷ × ∂ŷ/∂z × ∂z/∂{H} × ∂{H}/∂z{S[j + 1]} × ∂z{S[j + 1]}/∂{W}
                </F>
              </p>
              <p>It looks like the fractions “cancel out”, which is a handy way to remember it.</p>
            </MoreMath>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChainRule;
