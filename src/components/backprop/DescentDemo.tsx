"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowCounterClockwise, Footprints, Play } from "@phosphor-icons/react";
import { type Net, XOR, cloneNet, datasetLoss, fmt } from "../../lib/nn";
import FunctionPlot from "./FunctionPlot";
import { F, GRAD, N, Slider, itemVariants } from "./ui";
import { useLang } from "../explainer/i18n";

/**
 * Gradient descent on a single weight: the loss as a function of v₁ (all other
 * weights frozen), with a ball that rolls downhill one step at a time.
 */
const DescentDemo: React.FC<{ net: Net }> = ({ net }) => {
  const start = -4.5;
  const [w, setW] = useState(start);
  const [lr, setLr] = useState(3);
  const [steps, setSteps] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const de = useLang().lang === "de";

  const f = useMemo(() => {
    const n = cloneNet(net);
    return (v: number) => {
      n.W2[0] = v;
      return datasetLoss(n, XOR);
    };
  }, [net]);

  const slope = (v: number) => (f(v + 1e-4) - f(v - 1e-4)) / 2e-4;
  const g = slope(w);
  const [yMin, yMax] = useMemo(() => {
    const ys = Array.from({ length: 41 }, (_, k) => f(-5 + k * 0.25));
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.08;
    return [Number((lo - pad).toFixed(2)), Number((hi + pad).toFixed(2))];
  }, [f]);

  const step = useCallback(() => {
    setPrev(w);
    setW((cur) => Math.min(Math.max(cur - lr * slope(cur), -5), 5));
    setSteps((s) => s + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, lr, f]);

  const reset = () => {
    setW(start);
    setPrev(null);
    setSteps(0);
  };

  return (
    <motion.div
      variants={itemVariants}
      className="card grid grid-cols-1 overflow-hidden md:grid-cols-[1.3fr_1fr]"
    >
      <div className="border-b border-zinc-100 p-4 dark:border-zinc-700/60 md:border-b-0 md:border-r sm:p-5">
        <FunctionPlot
          fn={f}
          x={[-5, 5]}
          y={[yMin, yMax]}
          width={420}
          height={220}
          xLabel={de ? "Wert des Gewichts v₁" : "value of weight v₁"}
          yLabel={de ? "Loss (Strafe)" : "loss (penalty)"}
          tangent
          points={[
            { x: w, label: `v₁ = ${fmt(w)}`, color: GRAD },
            ...(prev !== null ? [{ x: prev, color: "#a1a1aa" }] : []),
          ]}
        />
      </div>
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <p className="text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          {de ? (
            <>
              Halte alle Gewichte fest außer <F>v₁</F> und probiere jeden Wert aus, den es annehmen
              könnte. Die Kurve zeigt die Strafe für jeden Wert. Der Gradient ist einfach die{" "}
              <span style={{ color: GRAD }} className="font-semibold">
                Steigung
              </span>{" "}
              dieser Kurve dort, wo die Kugel liegt. Negative Steigung: Bergab geht es nach rechts.
              Positive: nach links. Also gehen wir immer gegen die Steigung.
            </>
          ) : (
            <>
              Keep all weights fixed except <F>v₁</F>, and try every value it could take. The curve
              shows the penalty for each value. The gradient is simply the{" "}
              <span style={{ color: GRAD }} className="font-semibold">
                slope
              </span>{" "}
              (steepness) of this curve where the ball is. Negative slope: downhill is to the right.
              Positive: downhill is to the left. So we always step against the slope.
            </>
          )}
        </p>
        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900/60">
            <div className="eyebrow mb-0.5">{de ? "Steigung = Gradient" : "slope = gradient"}</div>
            <N tone="grad">{fmt(g, 3)}</N>
          </div>
          <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900/60">
            <div className="eyebrow mb-0.5">{de ? "Strafe · Schritte" : "penalty · steps"}</div>
            <N>{fmt(f(w), 3)}</N> <span className="text-zinc-400">·</span> <N>{steps}</N>
          </div>
        </div>
        <Slider
          label={de ? "Schrittgröße (Lernrate η)" : "step size (learning rate η)"}
          value={lr}
          min={0.25}
          max={20}
          step={0.25}
          onChange={setLr}
          display={lr.toFixed(2)}
        />
        <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
          {lr > 10
            ? de
              ? "Sehr große Schritte: Die Kugel springt über das Tal und hüpft hin und her."
              : "Very large steps: the ball jumps over the valley and bounces around."
            : lr < 1.5
              ? de
                ? "Kleine Schritte: sicher, aber man braucht viele davon."
                : "Small steps: safe, but it takes many of them."
              : de
                ? "Nächster Schritt: neues v₁ = v₁ − Schrittgröße × Steigung."
                : "Next step: new v₁ = v₁ − step size × slope."}
        </p>
        <div className="mt-auto flex gap-2">
          <button className="btn-primary" onClick={step}>
            <Footprints size={14} weight="bold" /> {de ? "Ein Schritt" : "Take a step"}
          </button>
          <button
            className="btn"
            onClick={() => {
              let cur = w;
              for (let k = 0; k < 10; k++) cur = Math.min(Math.max(cur - lr * slope(cur), -5), 5);
              setPrev(w);
              setW(cur);
              setSteps((s) => s + 10);
            }}
          >
            <Play size={14} weight="bold" /> {de ? "10 Schritte" : "10 steps"}
          </button>
          <button className="btn" onClick={reset} aria-label="Reset">
            <ArrowCounterClockwise size={14} weight="bold" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DescentDemo;
