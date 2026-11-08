"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowCounterClockwise,
  CheckCircle,
  Pause,
  Play,
  Shuffle,
  SkipForward,
} from "@phosphor-icons/react";
import {
  DEFAULT_SEED,
  type Grads,
  type Net,
  XOR,
  batchGrads,
  forward,
  initNet,
  trainEpoch,
  fmt,
} from "../../lib/nn";
import NetworkDiagram from "./NetworkDiagram";
import DecisionBoundary from "./DecisionBoundary";
import { Legend, N, Slider, itemVariants } from "./ui";

const LossCurve: React.FC<{ history: number[] }> = ({ history }) => {
  const W = 300;
  const H = 90;
  const d = useMemo(() => {
    if (history.length < 2) return "";
    const max = Math.max(history[0], 0.75);
    const n = history.length;
    const stride = Math.max(1, Math.floor(n / 240));
    let s = "";
    for (let i = 0; i < n; i += stride) {
      const x = (i / (n - 1)) * W;
      const y = H - (Math.min(history[i], max) / max) * (H - 4) - 2;
      s += `${s ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    const last = history[n - 1];
    s += `L${W},${(H - (Math.min(last, max) / max) * (H - 4) - 2).toFixed(1)}`;
    return s;
  }, [history]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[90px] w-full" preserveAspectRatio="none">
      <line x1={0} x2={W} y1={H - 2} y2={H - 2} className="stroke-zinc-200 dark:stroke-zinc-700" />
      {d && (
        <>
          <path
            d={`${d}L${W},${H}L0,${H}Z`}
            className="fill-zinc-900/[0.06] dark:fill-white/[0.06]"
          />
          <path
            d={d}
            fill="none"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="stroke-zinc-900 dark:stroke-zinc-100"
          />
        </>
      )}
    </svg>
  );
};

const Playground: React.FC = () => {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [net, setNet] = useState<Net>(() => initNet(DEFAULT_SEED));
  const [grads, setGrads] = useState<Grads>(() => batchGrads(initNet(DEFAULT_SEED), XOR).grads);
  const [history, setHistory] = useState<number[]>([]);
  const [epoch, setEpoch] = useState(0);
  const [solvedAt, setSolvedAt] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [lr, setLr] = useState(0.3);
  const [speed, setSpeed] = useState(1);
  const [sel, setSel] = useState(2);

  // Mutable mirrors so the animation loop doesn't depend on React re-renders.
  const st = useRef({
    net,
    history: [] as number[],
    epoch: 0,
    solvedAt: null as number | null,
    lr,
    speed,
  });
  st.current.lr = lr;
  st.current.speed = speed;

  const isSolved = (n: Net) => XOR.every((s) => (forward(n, s.x).yHat > 0.5 ? 1 : 0) === s.y);

  const advance = (epochs: number) => {
    const s = st.current;
    for (let k = 0; k < epochs; k++) {
      const r = trainEpoch(s.net, XOR, s.lr);
      s.history.push(r.loss);
      s.net = r.net;
      s.epoch += 1;
      if (s.solvedAt === null && isSolved(s.net)) s.solvedAt = s.epoch;
    }
    if (s.history.length > 20000) s.history = s.history.filter((_, i) => i % 2 === 0);
    setNet(s.net);
    setGrads(batchGrads(s.net, XOR).grads);
    setHistory([...s.history]);
    setEpoch(s.epoch);
    setSolvedAt(s.solvedAt);
  };

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      advance(st.current.speed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const reset = (newSeed: number) => {
    const n = initNet(newSeed);
    st.current = { ...st.current, net: n, history: [], epoch: 0, solvedAt: null };
    setSeed(newSeed);
    setNet(n);
    setGrads(batchGrads(n, XOR).grads);
    setHistory([]);
    setEpoch(0);
    setSolvedAt(null);
    setPlaying(false);
  };

  const currentLoss = history.length ? history[history.length - 1] : batchGrads(net, XOR).loss;
  const cache = forward(net, XOR[sel].x);

  return (
    <motion.div variants={itemVariants} className="card overflow-hidden">
      {/* controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-700/60 sm:px-5">
        <button
          className="btn-primary w-[92px] justify-center"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
          {playing ? "Pause" : "Train"}
        </button>
        <button className="btn" onClick={() => advance(1)} disabled={playing}>
          <SkipForward size={14} weight="bold" /> 1 epoch
        </button>
        <button className="btn" onClick={() => reset(DEFAULT_SEED)}>
          <ArrowCounterClockwise size={14} weight="bold" /> Reset
        </button>
        <button className="btn" onClick={() => reset(Math.floor(Math.random() * 1e6))}>
          <Shuffle size={14} weight="bold" /> New random weights
        </button>
        <div className="ml-auto flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            epoch <N>{epoch}</N>
          </span>
          <span>
            loss <N>{fmt(currentLoss, 3)}</N>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
        {/* live network */}
        <div className="border-b border-zinc-100 p-3 dark:border-zinc-700/60 sm:p-5 lg:border-b-0 lg:border-r">
          <NetworkDiagram
            net={net}
            cache={cache}
            grads={grads}
            target={XOR[sel].y}
            flow={playing ? "backward" : null}
            display={{ loss: true, gradTicks: "all" }}
          />
          <Legend className="mt-3 justify-center" />
          <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Showing the values for example ({XOR[sel].x.join(", ")}). Click a corner of the map to
            switch. Amber arrows: which way each weight is about to be turned.
          </p>
        </div>

        {/* boundary + loss */}
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">What the network believes</span>
              <AnimatePresence>
                {solvedAt !== null && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="chip !bg-emerald-500/15 !text-emerald-700 dark:!text-emerald-400"
                  >
                    <CheckCircle size={12} weight="fill" /> XOR solved at epoch {solvedAt}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="mx-auto max-w-[320px]">
              <DecisionBoundary net={net} selected={sel} onSelect={setSel} />
            </div>
          </div>
          <div>
            <span className="eyebrow">Loss over time</span>
            <div className="mt-1 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900/60">
              <LossCurve history={history} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Slider
              label="step size (learning rate η)"
              value={lr}
              min={0.05}
              max={3}
              step={0.05}
              onChange={setLr}
              display={lr.toFixed(2)}
            />
            <Slider
              label="speed"
              value={speed}
              min={1}
              max={30}
              step={1}
              onChange={setSpeed}
              display={`${speed} epoch${speed > 1 ? "s" : ""}/frame`}
            />
          </div>
          <p className="text-[12.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            One <b>epoch</b> = one round of guess, score, blame and adjust over all four examples.
            The map shows the network&apos;s answer for every possible input: one shade means “0”,
            the other “1”. Some random starts get stuck in a valley that isn&apos;t the lowest one
            (a <i>local minimum</i>): hit <i>New random weights</i> and try again. Seed{" "}
            <span className="font-mono">{seed}</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Playground;
