"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type Cache, type Grads, type Net, fmt, fmtSigned, loss as bce } from "../../lib/nn";
import WeightVector from "./WeightVector";
import { GRAD, signColor } from "./ui";

export type Flow = "forward" | "backward" | null;

export interface DiagramDisplay {
  inputs?: boolean;
  hidden?: "none" | "z" | "h";
  out?: "none" | "z" | "yhat";
  loss?: boolean;
  deltaOut?: boolean;
  hiddenBlame?: "none" | "dH" | "delta";
  gradTicks?: "none" | "out" | "all";
}

interface NetworkDiagramProps {
  net: Net;
  cache?: Cache;
  grads?: Grads;
  target?: number;
  /** Keys of the elements to highlight; everything else is dimmed. */
  focus?: string[];
  flow?: Flow;
  display?: DiagramDisplay;
  /** Previous parameters, shown as dashed outlines in the weight bars. */
  ghost?: Net;
  interactive?: boolean;
  className?: string;
}

export const HIDDEN_KEYS = ["h1", "h2", "h3"];
export const W_KEYS = ["w11", "w12", "w21", "w22", "w31", "w32"];
export const V_KEYS = ["v1", "v2", "v3"];

const SUB = ["₀", "₁", "₂", "₃"];

// ---------- geometry ---------------------------------------------------------

interface Node {
  cx: number;
  cy: number;
  w: number;
  h: number;
  round?: boolean;
}

const useVertical = () => {
  const [vertical, setVertical] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setVertical(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return vertical;
};

const makeLayout = (vertical: boolean) => {
  const nodes: Record<string, Node> = vertical
    ? {
        x1: { cx: 150, cy: 46, w: 54, h: 54, round: true },
        x2: { cx: 310, cy: 46, w: 54, h: 54, round: true },
        h1: { cx: 77, cy: 220, w: 142, h: 98 },
        h2: { cx: 230, cy: 220, w: 142, h: 98 },
        h3: { cx: 383, cy: 220, w: 142, h: 98 },
        out: { cx: 230, cy: 400, w: 172, h: 104 },
        loss: { cx: 230, cy: 552, w: 66, h: 66, round: true },
      }
    : {
        x1: { cx: 40, cy: 130, w: 56, h: 56, round: true },
        x2: { cx: 40, cy: 270, w: 56, h: 56, round: true },
        h1: { cx: 268, cy: 64, w: 164, h: 98 },
        h2: { cx: 268, cy: 200, w: 164, h: 98 },
        h3: { cx: 268, cy: 336, w: 164, h: 98 },
        out: { cx: 520, cy: 200, w: 174, h: 106 },
        loss: { cx: 678, cy: 200, w: 68, h: 68, round: true },
      };
  const outPt = (k: string) => {
    const n = nodes[k];
    return vertical ? { x: n.cx, y: n.cy + n.h / 2 } : { x: n.cx + n.w / 2, y: n.cy };
  };
  const inPt = (k: string) => {
    const n = nodes[k];
    return vertical ? { x: n.cx, y: n.cy - n.h / 2 } : { x: n.cx - n.w / 2, y: n.cy };
  };
  return { nodes, outPt, inPt, vb: vertical ? "0 0 460 590" : "0 0 720 400", vertical };
};

interface Edge {
  key: string;
  from: string;
  to: string;
  w: number;
  layer: 0 | 1 | 2;
}

// ---------- pulses -----------------------------------------------------------

const Pulse: React.FC<{
  a: { x: number; y: number };
  b: { x: number; y: number };
  color: string;
  delay: number;
  dur: number;
  cycle: number;
}> = ({ a, b, color, delay, dur, cycle }) => {
  const at = (t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const pts = [0, 0.12, 0.88, 1].map(at);
  return (
    <motion.circle
      r={4.5}
      fill={color}
      initial={{ opacity: 0, cx: a.x, cy: a.y }}
      animate={{
        cx: pts.map((p) => p.x),
        cy: pts.map((p) => p.y),
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: dur,
        times: [0, 0.12, 0.88, 1],
        ease: "linear",
        delay,
        repeat: Infinity,
        repeatDelay: cycle - dur,
      }}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    />
  );
};

// ---------- main component ---------------------------------------------------

const NetworkDiagram: React.FC<NetworkDiagramProps> = ({
  net,
  cache,
  grads,
  target,
  focus,
  flow = null,
  display = {},
  ghost,
  interactive = true,
  className = "",
}) => {
  const vertical = useVertical();
  const L = useMemo(() => makeLayout(vertical), [vertical]);
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);

  const {
    inputs = !!cache,
    hidden = cache ? "h" : "none",
    out = cache ? "yhat" : "none",
    loss: showLoss = false,
    deltaOut = false,
    hiddenBlame = "none",
    gradTicks = "none",
  } = display;

  const edges: Edge[] = useMemo(() => {
    const e: Edge[] = [];
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 2; i++)
        e.push({
          key: `w${j + 1}${i + 1}`,
          from: `x${i + 1}`,
          to: `h${j + 1}`,
          w: net.W1[j][i],
          layer: 0,
        });
    for (let j = 0; j < 3; j++)
      e.push({ key: `v${j + 1}`, from: `h${j + 1}`, to: "out", w: net.W2[j], layer: 1 });
    return e;
  }, [net]);

  const dim = (k: string) => (focus && !focus.includes(k) ? 0.22 : 1);
  const isFocused = (k: string) => !!focus && focus.includes(k);

  const lossVal = cache && target !== undefined ? bce(cache.yHat, target) : undefined;

  // Pulses travel layer by layer: a wave through the network.
  const DUR = 0.9;
  const CYCLE = DUR * 3 + 0.6;
  const pulseDelay = (layer: number) => (flow === "forward" ? layer * DUR : (2 - layer) * DUR);
  const pulseEdges = flow && !reduce ? edges.filter((e) => !focus || focus.includes(e.key)) : [];
  const lossEdgeActive = !!flow && !reduce && (!focus || focus.includes("eL"));

  // ---------- tooltips ----------
  const info = (k: string): React.ReactNode => {
    const j = Number(k[1]) - 1;
    if (k.startsWith("x")) {
      const i = Number(k[1]) - 1;
      return (
        <>
          <b>Input x{SUB[i + 1]}</b>
          {cache ? <> = {fmt(cache.x[i], 0)}</> : null}
          <div className="opacity-70">Raw data, passed on to every hidden neuron.</div>
        </>
      );
    }
    if (k.startsWith("h")) {
      return (
        <>
          <b>Hidden neuron h{SUB[j + 1]}</b>
          <div>
            w = ({fmt(net.W1[j][0])}, {fmt(net.W1[j][1])}), b = {fmt(net.b1[j])}
          </div>
          {cache && (
            <div>
              z = w·x + b = {fmt(cache.z1[j], 3)}, h = tanh(z) = {fmt(cache.h[j], 3)}
            </div>
          )}
          {grads && (
            <div className="text-amber-300">
              blame ∂L/∂h = {fmt(grads.dH[j], 3)}, δ = {fmt(grads.delta1[j], 3)}
            </div>
          )}
        </>
      );
    }
    if (k === "out") {
      return (
        <>
          <b>Output neuron</b>
          <div>
            v = ({net.W2.map((v) => fmt(v)).join(", ")}), c = {fmt(net.b2)}
          </div>
          {cache && (
            <div>
              z = v·h + c = {fmt(cache.z2, 3)}, ŷ = σ(z) = {fmt(cache.yHat, 3)}
            </div>
          )}
          {grads && <div className="text-amber-300">δ = ŷ − y = {fmt(grads.delta2, 3)}</div>}
        </>
      );
    }
    if (k === "loss") {
      return (
        <>
          <b>Loss</b>
          {lossVal !== undefined && <> = {fmt(lossVal, 3)}</>}
          <div className="opacity-70">How wrong the prediction is. Smaller is better.</div>
        </>
      );
    }
    if (k.startsWith("w")) {
      const i = Number(k[2]) - 1;
      return (
        <>
          <b>
            Weight w{SUB[j + 1]}
            {SUB[i + 1]}
          </b>{" "}
          = {fmt(net.W1[j][i], 3)}
          <div className="opacity-70">
            x{SUB[i + 1]} → h{SUB[j + 1]}
          </div>
          {grads && <div className="text-amber-300">∂L/∂w = δ·x = {fmt(grads.dW1[j][i], 4)}</div>}
        </>
      );
    }
    if (k.startsWith("v")) {
      return (
        <>
          <b>Weight v{SUB[j + 1]}</b> = {fmt(net.W2[j], 3)}
          <div className="opacity-70">h{SUB[j + 1]} → output</div>
          {grads && <div className="text-amber-300">∂L/∂v = δ·h = {fmt(grads.dW2[j], 4)}</div>}
        </>
      );
    }
    return null;
  };

  const anchorOf = (k: string) => {
    const e = edges.find((x) => x.key === k);
    if (e) {
      const a = L.outPt(e.from);
      const b = L.inPt(e.to);
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, h: 0 };
    }
    const n = L.nodes[k];
    return { x: n.cx, y: n.cy, h: n.h / 2 };
  };

  const [vbW, vbH] = L.vb.split(" ").slice(2).map(Number);
  const hoverProps = (k: string) =>
    interactive
      ? {
          onMouseEnter: () => setHover(k),
          onMouseLeave: () => setHover((h) => (h === k ? null : h)),
          onClick: () => setHover((h) => (h === k ? null : k)),
          style: { cursor: "pointer" },
        }
      : {};

  // ---------- render ----------
  const lossA = L.outPt("out");
  const lossB = L.inPt("loss");
  const backwardFocus = flow === "backward";

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={L.vb}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Neural network diagram"
      >
        {/* edges */}
        {edges.map((e) => {
          const a = L.outPt(e.from);
          const b = L.inPt(e.to);
          const width = 1 + 4 * Math.min(Math.abs(e.w) / 2.5, 1);
          const amber = backwardFocus && isFocused(e.key);
          return (
            <g key={e.key} opacity={dim(e.key)} {...hoverProps(e.key)}>
              <motion.line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                initial={false}
                animate={{ strokeWidth: width, stroke: amber ? GRAD : signColor(e.w) }}
                transition={{ duration: 0.4 }}
                strokeOpacity={hover === e.key ? 1 : 0.55}
                strokeLinecap="round"
              />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={14} />
            </g>
          );
        })}
        <line
          x1={lossA.x}
          y1={lossA.y}
          x2={lossB.x}
          y2={lossB.y}
          opacity={dim("eL")}
          className="stroke-zinc-300 dark:stroke-zinc-600"
          strokeWidth={2}
          strokeDasharray="4 4"
        />

        {/* pulses */}
        {pulseEdges.map((e) => {
          const a = L.outPt(e.from);
          const b = L.inPt(e.to);
          const fwd = flow === "forward";
          return (
            <Pulse
              key={`${flow}-${e.key}-${vertical}`}
              a={fwd ? a : b}
              b={fwd ? b : a}
              color={fwd ? signColor(e.w) : GRAD}
              delay={pulseDelay(e.layer)}
              dur={DUR}
              cycle={CYCLE}
            />
          );
        })}
        {lossEdgeActive && (
          <Pulse
            key={`${flow}-loss-${vertical}`}
            a={flow === "forward" ? lossA : lossB}
            b={flow === "forward" ? lossB : lossA}
            color={flow === "forward" ? "#71717a" : GRAD}
            delay={pulseDelay(2)}
            dur={DUR}
            cycle={CYCLE}
          />
        )}

        {/* input nodes */}
        {[0, 1].map((i) => {
          const k = `x${i + 1}`;
          const n = L.nodes[k];
          return (
            <g key={k} opacity={dim(k)} {...hoverProps(k)}>
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.w / 2}
                className={`fill-white dark:fill-zinc-800 ${isFocused(k) ? "stroke-zinc-900 dark:stroke-zinc-100" : "stroke-zinc-300 dark:stroke-zinc-600"}`}
                strokeWidth={isFocused(k) ? 2 : 1.5}
              />
              <text
                x={n.cx}
                y={n.cy - (inputs && cache ? 6 : -4)}
                textAnchor="middle"
                fontSize={13}
                className="fill-zinc-500 dark:fill-zinc-400"
                fontWeight={600}
              >
                x{SUB[i + 1]}
              </text>
              {inputs && cache && (
                <text
                  x={n.cx}
                  y={n.cy + 13}
                  textAnchor="middle"
                  fontSize={18}
                  fontWeight={700}
                  className="fill-zinc-900 dark:fill-white font-mono"
                >
                  {fmt(cache.x[i], 0)}
                </text>
              )}
            </g>
          );
        })}

        {/* hidden + output cards */}
        {[...HIDDEN_KEYS, "out"].map((k) => {
          const n = L.nodes[k];
          const isOut = k === "out";
          const j = isOut ? -1 : Number(k[1]) - 1;
          const x0 = n.cx - n.w / 2;
          const y0 = n.cy - n.h / 2;
          const values = isOut ? [...net.W2, net.b2] : [...net.W1[j], net.b1[j]];
          const ghostVals = ghost
            ? isOut
              ? [...ghost.W2, ghost.b2]
              : [...ghost.W1[j], ghost.b1[j]]
            : undefined;
          const showTicks = grads && (gradTicks === "all" || (gradTicks === "out" && isOut));
          const gradVals = showTicks
            ? isOut
              ? [...grads!.dW2, grads!.db2]
              : [...grads!.dW1[j], grads!.db1[j]]
            : undefined;
          const labels = isOut ? ["v₁", "v₂", "v₃", "c"] : ["w₁", "w₂", "b"];

          let value: string | null = null;
          let caption = "";
          if (cache) {
            if (isOut && out === "z") {
              value = fmt(cache.z2, 2);
              caption = "z";
            } else if (isOut && out === "yhat") {
              value = fmt(cache.yHat, 2);
              caption = "ŷ";
            } else if (!isOut && hidden === "z") {
              value = fmt(cache.z1[j], 2);
              caption = "z";
            } else if (!isOut && hidden === "h") {
              value = fmt(cache.h[j], 2);
              caption = "h";
            }
          }

          let badge: string | null = null;
          if (grads && isOut && deltaOut) badge = `δ ${fmtSigned(grads.delta2, 2)}`;
          if (grads && !isOut && hiddenBlame === "dH") badge = `∂L/∂h ${fmtSigned(grads.dH[j], 2)}`;
          if (grads && !isOut && hiddenBlame === "delta")
            badge = `δ ${fmtSigned(grads.delta1[j], 3)}`;

          const focused = isFocused(k);
          const amber = focused && backwardFocus;
          return (
            <g key={k} opacity={dim(k)} {...hoverProps(k)}>
              <rect
                x={x0}
                y={y0}
                width={n.w}
                height={n.h}
                rx={12}
                className={`fill-white dark:fill-zinc-800 ${
                  amber
                    ? "stroke-amber-500"
                    : focused
                      ? "stroke-zinc-900 dark:stroke-zinc-100"
                      : "stroke-zinc-200 dark:stroke-zinc-700"
                }`}
                strokeWidth={focused ? 2 : 1.25}
              />
              <text
                x={x0 + 12}
                y={y0 + 24}
                fontSize={15}
                fontWeight={700}
                className="fill-zinc-900 dark:fill-white"
              >
                {isOut ? "output" : `h${SUB[j + 1]}`}
              </text>
              {value !== null && (
                <text
                  x={x0 + n.w - 12}
                  y={y0 + 25}
                  textAnchor="end"
                  className="font-mono"
                  fontSize={18}
                  fontWeight={700}
                >
                  <tspan
                    className="fill-zinc-400 dark:fill-zinc-500"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {caption}{" "}
                  </tspan>
                  <tspan className="fill-zinc-900 dark:fill-white">{value}</tspan>
                </text>
              )}
              <WeightVector
                values={values}
                ghost={ghostVals}
                grad={gradVals}
                x={x0 + 14}
                y={y0 + 36}
                half={isOut ? 19 : 17}
                labels={labels}
              />
              <text
                x={x0 + n.w - 12}
                y={y0 + n.h - 10}
                textAnchor="end"
                fontSize={11}
                fontWeight={600}
                className="fill-zinc-400 dark:fill-zinc-500"
              >
                {isOut ? "sigmoid σ" : "tanh"}
              </text>
              <AnimatePresence>
                {badge && (
                  <motion.g
                    key={badge.split(" ")[0]}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <rect
                      x={x0 + n.w - (badge.length * 7.9 + 14) + 8}
                      y={y0 - 13}
                      width={badge.length * 7.9 + 14}
                      height={24}
                      rx={12}
                      fill={GRAD}
                    />
                    <text
                      x={x0 + n.w - (badge.length * 7.9 + 14) / 2 + 8}
                      y={y0 + 3}
                      textAnchor="middle"
                      fontSize={13}
                      fontWeight={700}
                      className="font-mono"
                      fill="#18181b"
                    >
                      {badge}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* loss node */}
        {(() => {
          const n = L.nodes.loss;
          const focused = isFocused("loss");
          return (
            <g opacity={dim("loss")} {...hoverProps("loss")}>
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.w / 2}
                className={`${
                  focused && backwardFocus
                    ? "stroke-amber-500"
                    : focused
                      ? "stroke-zinc-900 dark:stroke-zinc-100"
                      : "stroke-zinc-300 dark:stroke-zinc-600"
                } fill-zinc-50 dark:fill-zinc-900`}
                strokeWidth={focused ? 2 : 1.5}
                strokeDasharray={showLoss ? undefined : "4 4"}
              />
              <text
                x={n.cx}
                y={n.cy - (showLoss && lossVal !== undefined ? 5 : -5)}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                className="fill-zinc-500 dark:fill-zinc-400"
              >
                loss
              </text>
              {showLoss && lossVal !== undefined && (
                <text
                  x={n.cx}
                  y={n.cy + 14}
                  textAnchor="middle"
                  fontSize={17}
                  fontWeight={700}
                  className="fill-zinc-900 dark:fill-white font-mono"
                >
                  {fmt(lossVal, 2)}
                </text>
              )}
              {target !== undefined && (
                <text
                  x={n.cx}
                  y={n.cy + n.h / 2 + 18}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  className="fill-zinc-500 dark:fill-zinc-400"
                >
                  target y = {target}
                </text>
              )}
            </g>
          );
        })()}
      </svg>

      {/* tooltip */}
      <AnimatePresence>
        {interactive &&
          hover &&
          (() => {
            const a = anchorOf(hover);
            const above = a.y > vbH * 0.55;
            const left = Math.min(Math.max((a.x / vbW) * 100, 18), 82);
            return (
              <motion.div
                key={hover}
                initial={{ opacity: 0, y: above ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute z-10 w-max max-w-[260px] -translate-x-1/2 rounded-lg bg-zinc-900/95 px-3 py-2 text-[11.5px] leading-relaxed text-zinc-100 shadow-lg dark:bg-zinc-950/95 dark:ring-1 dark:ring-zinc-700"
                style={{
                  left: `${left}%`,
                  top: above ? undefined : `${((a.y + a.h + 8) / vbH) * 100}%`,
                  bottom: above ? `${100 - ((a.y - a.h - 8) / vbH) * 100}%` : undefined,
                }}
              >
                {info(hover)}
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
};

export default NetworkDiagram;
