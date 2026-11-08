"use client";

import React from "react";
import {
  type Cache,
  type Grads,
  type Net,
  type Sample,
  fmt,
  forward,
  loss as bce,
} from "../../lib/nn";
import type { DiagramDisplay, Flow } from "./NetworkDiagram";
import { HIDDEN_KEYS, V_KEYS, W_KEYS } from "./NetworkDiagram";
import FunctionPlot from "./FunctionPlot";
import { F, FormulaBlock, GRAD, N } from "./ui";

export interface StepCtx {
  net: Net;
  sample: Sample;
  c: Cache;
  g: Grads;
  next: Net;
  lr: number;
}

export interface Step {
  key: string;
  phase: "forward" | "loss" | "backward" | "update";
  title: string;
  body: (ctx: StepCtx) => React.ReactNode;
  diagram: (ctx: StepCtx) => {
    focus?: string[];
    flow?: Flow;
    display?: DiagramDisplay;
    ghost?: Net;
    net?: Net;
    showGrads?: boolean;
  };
}

const S = ["₀", "₁", "₂", "₃"];
const n = (v: number, d = 2) => fmt(v, d);
/** Number in parentheses when negative, so products read clearly. */
const p = (v: number, d = 2) => (v < 0 ? `(${fmt(v, d)})` : fmt(v, d));

/** Three-row table, one row per hidden neuron. */
const NeuronRows: React.FC<{
  rows: { label: React.ReactNode; calc: React.ReactNode; result: React.ReactNode }[];
}> = ({ rows }) => (
  <div className="overflow-x-auto no-scrollbar rounded-lg border border-zinc-200 dark:border-zinc-700">
    <table className="w-full text-[13px]">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-700/60">
            <td className="whitespace-nowrap py-2 pl-3 pr-2 font-semibold text-zinc-900 dark:text-white">
              {r.label}
            </td>
            <td className="whitespace-nowrap px-2 py-2 font-mono text-[12px] text-zinc-500 dark:text-zinc-400">
              {r.calc}
            </td>
            <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right">{r.result}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-lg border-l-2 border-zinc-300 bg-zinc-50 px-3 py-2 text-[13px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
    {children}
  </p>
);

const ALL = ["x1", "x2", ...W_KEYS, ...HIDDEN_KEYS, ...V_KEYS, "out", "eL", "loss"];

export const STEPS: Step[] = [
  // ---------------------------------------------------------------- forward
  {
    key: "input",
    phase: "forward",
    title: "Feed in one example",
    body: ({ sample }) => (
      <>
        <p>
          We pick one row of the XOR table. The network sees the two inputs{" "}
          <F>
            x = ({sample.x[0]}, {sample.x[1]})
          </F>{" "}
          and should answer <F>y = {sample.y}</F>.
        </p>
        <p>
          Right now the weights are random, so its answer will be a guess. Watch what it does with
          these numbers.
        </p>
      </>
    ),
    diagram: () => ({
      focus: ["x1", "x2"],
      display: { inputs: true, hidden: "none", out: "none" },
    }),
  },
  {
    key: "z1",
    phase: "forward",
    title: "Every hidden neuron takes a weighted sum",
    body: ({ net, c }) => (
      <>
        <p>
          Each hidden neuron owns a tiny weight vector <F>wⱼ</F> (the two bars) and a bias <F>bⱼ</F>{" "}
          (the lighter bar). It multiplies each input by its weight, adds everything up, and adds
          the bias:
        </p>
        <FormulaBlock>zⱼ = wⱼ₁·x₁ + wⱼ₂·x₂ + bⱼ</FormulaBlock>
        <NeuronRows
          rows={[0, 1, 2].map((j) => ({
            label: `z${S[j + 1]}`,
            calc: `${p(net.W1[j][0])}·${c.x[0]} + ${p(net.W1[j][1])}·${c.x[1]} + ${p(net.b1[j])}`,
            result: <N>{n(c.z1[j])}</N>,
          }))}
        />
        <Hint>
          That is just a dot product: how much does the input point in the neuron&apos;s favourite
          direction?
        </Hint>
      </>
    ),
    diagram: () => ({
      focus: ["x1", "x2", ...W_KEYS, ...HIDDEN_KEYS],
      flow: "forward",
      display: { hidden: "z", out: "none" },
    }),
  },
  {
    key: "h",
    phase: "forward",
    title: "…and squashes it with tanh",
    body: ({ c }) => (
      <>
        <p>
          A sum alone is a straight line, and stacking straight lines only gives another straight
          line. So every neuron bends its sum through an <b>activation function</b>. Ours is{" "}
          <F>tanh</F>, which squashes any number into the range −1 … 1.
        </p>
        <FormulaBlock>hⱼ = tanh(zⱼ)</FormulaBlock>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.1fr] items-center">
          <NeuronRows
            rows={[0, 1, 2].map((j) => ({
              label: `h${S[j + 1]}`,
              calc: `tanh(${n(c.z1[j])})`,
              result: <N>{n(c.h[j])}</N>,
            }))}
          />
          <FunctionPlot
            fn={Math.tanh}
            x={[-3, 3]}
            y={[-1, 1]}
            yLabel="tanh(z)"
            points={c.z1.map((z, j) => ({ x: z, label: `h${S[j + 1]}` }))}
          />
        </div>
      </>
    ),
    diagram: () => ({ focus: HIDDEN_KEYS, display: { hidden: "h", out: "none" } }),
  },
  {
    key: "out",
    phase: "forward",
    title: "The output neuron does the same",
    body: ({ net, c }) => (
      <>
        <p>
          The output neuron treats the three hidden values as <i>its</i> inputs. Weighted sum with
          its own vector <F>v</F> and bias <F>c</F>, then a <b>sigmoid</b> <F>σ</F> squashes the
          result into 0 … 1, so we can read it as “how sure am I that the answer is 1?”.
        </p>
        <FormulaBlock>
          z = v₁h₁ + v₂h₂ + v₃h₃ + c &nbsp;→&nbsp; ŷ = σ(z) = 1 / (1 + e<sup>−z</sup>)
        </FormulaBlock>
        <NeuronRows
          rows={[
            {
              label: "z",
              calc: net.W2.map((v, j) => `${p(v)}·${p(c.h[j])}`).join(" + ") + ` + ${p(net.b2)}`,
              result: <N>{n(c.z2)}</N>,
            },
            { label: "ŷ", calc: `σ(${n(c.z2)})`, result: <N>{n(c.yHat)}</N> },
          ]}
        />
        <Hint>
          That&apos;s the whole <b>forward pass</b>: numbers flow left to right, layer by layer.
        </Hint>
      </>
    ),
    diagram: () => ({
      focus: [...HIDDEN_KEYS, ...V_KEYS, "out"],
      flow: "forward",
      display: { hidden: "h", out: "yhat" },
    }),
  },

  // ---------------------------------------------------------------- loss
  {
    key: "loss",
    phase: "loss",
    title: "Score the guess with a loss",
    body: ({ sample, c }) => {
      const y = sample.y;
      const L = bce(c.yHat, y);
      return (
        <>
          <p>
            The network said <N>{n(c.yHat)}</N>, the truth is <N>{y}</N>. To learn, we need a single
            number that says <i>how wrong</i> that is: the <b>loss</b>. We use binary cross-entropy:
          </p>
          <FormulaBlock>L = −[ y·log(ŷ) + (1 − y)·log(1 − ŷ) ]</FormulaBlock>
          <p>
            With <F>y = {y}</F> only one half survives:{" "}
            <F>
              L = −log({y === 1 ? "ŷ" : "1 − ŷ"}) = −log({n(y === 1 ? c.yHat : 1 - c.yHat)}) ={" "}
              {n(L, 3)}
            </F>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.1fr_1fr] items-center">
            <FunctionPlot
              fn={(v) => bce(v, y)}
              x={[0, 1]}
              y={[0, 4]}
              xLabel="prediction ŷ"
              yLabel={`loss when y = ${y}`}
              points={[{ x: c.yHat, label: `L = ${n(L)}`, color: GRAD }]}
            />
            <Hint>
              A perfect answer costs 0. A confident wrong answer costs a lot, and the curve gets
              steeper the more wrong we are. That steepness is exactly what we&apos;ll follow.
            </Hint>
          </div>
        </>
      );
    },
    diagram: () => ({ focus: ["out", "eL", "loss"], display: { loss: true } }),
  },

  // ---------------------------------------------------------------- backward
  {
    key: "delta2",
    phase: "backward",
    title: "Start at the end: the output error",
    body: ({ sample, c, g }) => (
      <>
        <p>
          Backpropagation asks, for every single weight:{" "}
          <i>if I nudged you a little, how would the loss change?</i> That rate of change is the{" "}
          <b>gradient</b> <F>∂L/∂w</F>. We compute it from the back to the front.
        </p>
        <p>
          First stop: the output neuron&apos;s sum <F>z</F>. Sigmoid and cross-entropy were picked
          because together their derivative collapses into something beautifully simple:
        </p>
        <FormulaBlock>
          δ = ∂L/∂z = ŷ − y = {n(c.yHat)} − {sample.y} = <N tone="grad">{n(g.delta2, 3)}</N>
        </FormulaBlock>
        <Hint>
          {g.delta2 < 0
            ? "Negative δ: the output is too small. Increasing z would lower the loss."
            : "Positive δ: the output is too large. Decreasing z would lower the loss."}{" "}
          We call this error signal <b>δ (delta)</b>, the neuron&apos;s share of the blame.
        </Hint>
      </>
    ),
    diagram: () => ({
      focus: ["out", "eL", "loss"],
      flow: "backward",
      display: { loss: true, deltaOut: true },
      showGrads: true,
    }),
  },
  {
    key: "dv",
    phase: "backward",
    title: "Gradients of the output weights",
    body: ({ c, g }) => (
      <>
        <p>
          The weight <F>vⱼ</F> scales the signal <F>hⱼ</F> on its way into <F>z</F>. So its gradient
          is simply <i>error × what came in through that wire</i>:
        </p>
        <FormulaBlock>∂L/∂vⱼ = δ · hⱼ &nbsp;&nbsp;&nbsp; ∂L/∂c = δ</FormulaBlock>
        <NeuronRows
          rows={[
            ...[0, 1, 2].map((j) => ({
              label: `∂L/∂v${S[j + 1]}`,
              calc: `${p(g.delta2)}·${p(c.h[j])}`,
              result: <N tone="grad">{n(g.dW2[j], 3)}</N>,
            })),
            { label: "∂L/∂c", calc: "δ", result: <N tone="grad">{n(g.db2, 3)}</N> },
          ]}
        />
        <Hint>
          The amber arrows on the output&apos;s bars show which way each weight <i>should</i> move
          (opposite to its gradient).
        </Hint>
      </>
    ),
    diagram: () => ({
      focus: [...HIDDEN_KEYS, ...V_KEYS, "out"],
      flow: "backward",
      display: { deltaOut: true, gradTicks: "out" },
      showGrads: true,
    }),
  },
  {
    key: "dH",
    phase: "backward",
    title: "Pass the blame back to the hidden layer",
    body: ({ net, c, g }) => (
      <>
        <p>
          How much is each hidden neuron to blame? Its output <F>hⱼ</F> reached the error through
          the weight <F>vⱼ</F>, so it inherits <F>δ · vⱼ</F>. A big weight means a big share of the
          blame.
        </p>
        <p>
          Then we step back through its tanh. The slope of tanh is <F>1 − h²</F>: when the neuron is
          saturated (h near ±1) the slope is almost 0 and very little blame gets through.
        </p>
        <FormulaBlock>δⱼ = (δ · vⱼ) · (1 − hⱼ²)</FormulaBlock>
        <NeuronRows
          rows={[0, 1, 2].map((j) => ({
            label: `δ${S[j + 1]}`,
            calc: `${p(g.delta2)}·${p(net.W2[j])}·(1 − ${p(c.h[j])}²)`,
            result: <N tone="grad">{n(g.delta1[j], 3)}</N>,
          }))}
        />
        <Hint>
          This is the chain rule in action: multiply the local slopes along the path from the loss
          back to the neuron.
        </Hint>
      </>
    ),
    diagram: () => ({
      focus: [...HIDDEN_KEYS, ...V_KEYS, "out"],
      flow: "backward",
      display: { deltaOut: true, hiddenBlame: "delta" },
      showGrads: true,
    }),
  },
  {
    key: "dw",
    phase: "backward",
    title: "Gradients of the hidden weights",
    body: ({ c, g }) => (
      <>
        <p>Same rule as before, one layer earlier: error of the neuron × input on that wire.</p>
        <FormulaBlock>∂L/∂wⱼᵢ = δⱼ · xᵢ &nbsp;&nbsp;&nbsp; ∂L/∂bⱼ = δⱼ</FormulaBlock>
        <NeuronRows
          rows={[0, 1, 2].map((j) => ({
            label: `h${S[j + 1]}`,
            calc: `w: ${p(g.delta1[j], 3)}·${c.x[0]}, ${p(g.delta1[j], 3)}·${c.x[1]}`,
            result: (
              <span className="font-mono text-[12px]">
                <N tone="grad">{n(g.dW1[j][0], 3)}</N>, <N tone="grad">{n(g.dW1[j][1], 3)}</N>
                <span className="text-zinc-400"> · b </span>
                <N tone="grad">{n(g.db1[j], 3)}</N>
              </span>
            ),
          }))}
        />
        {(c.x[0] === 0 || c.x[1] === 0) && (
          <Hint>
            Notice: a weight whose input was <b>0</b> gets a gradient of 0. It had no influence on
            this prediction, so it gets no blame.
          </Hint>
        )}
        <Hint>
          Done: one forward pass and one backward pass gave us a gradient for <b>all 13</b>{" "}
          parameters, at roughly the cost of running the network twice.
        </Hint>
      </>
    ),
    diagram: () => ({
      focus: ["x1", "x2", ...W_KEYS, ...HIDDEN_KEYS],
      flow: "backward",
      display: { hiddenBlame: "delta", gradTicks: "all" },
      showGrads: true,
    }),
  },

  // ---------------------------------------------------------------- update
  {
    key: "update",
    phase: "update",
    title: "Nudge every weight downhill",
    body: ({ net, next, g, sample, lr, c }) => {
      const after = forward(next, sample.x);
      const before = bce(c.yHat, sample.y);
      const afterL = bce(after.yHat, sample.y);
      return (
        <>
          <p>
            The gradient points uphill (towards more loss). So we step a little in the{" "}
            <i>opposite</i> direction. How big the step is, is set by the <b>learning rate</b>{" "}
            <F>η = {lr}</F>:
          </p>
          <FormulaBlock>w ← w − η · ∂L/∂w</FormulaBlock>
          <NeuronRows
            rows={[
              {
                label: "v₁",
                calc: `${n(net.W2[0], 3)} − ${lr}·${p(g.dW2[0], 3)}`,
                result: <N>{n(next.W2[0], 3)}</N>,
              },
              {
                label: "w₁₁",
                calc: `${n(net.W1[0][0], 3)} − ${lr}·${p(g.dW1[0][0], 3)}`,
                result: <N>{n(next.W1[0][0], 3)}</N>,
              },
              {
                label: "c",
                calc: `${n(net.b2, 3)} − ${lr}·${p(g.db2, 3)}`,
                result: <N>{n(next.b2, 3)}</N>,
              },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="eyebrow mb-1">before</div>
              <div className="text-[13px]">
                ŷ = <N>{n(c.yHat, 3)}</N> · L = <N>{n(before, 3)}</N>
              </div>
            </div>
            <div className="rounded-lg border border-zinc-900 p-3 dark:border-zinc-200">
              <div className="eyebrow mb-1">after one step</div>
              <div className="text-[13px]">
                ŷ = <N>{n(after.yHat, 3)}</N> · L = <N>{n(afterL, 3)}</N>
              </div>
            </div>
          </div>
          <Hint>
            The dashed outlines show the old weights. The prediction moved towards the target{" "}
            {sample.y}. Repeat this for all examples, many times, and the network learns XOR.
          </Hint>
        </>
      );
    },
    diagram: ({ net, next }) => ({
      net: next,
      ghost: net,
      flow: "forward",
      display: { hidden: "h", out: "yhat", loss: true },
    }),
  },
];

export const ALL_KEYS = ALL;
