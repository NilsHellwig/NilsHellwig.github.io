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
import { BigIdea, F, GRAD, MathBox, MoreMath, N } from "./ui";

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
const dir = (g: number) => (g > 1e-6 ? "turn down ↓" : g < -1e-6 ? "turn up ↑" : "stay");

/** Small table: one row per neuron / weight, with the arithmetic spelled out. */
const Rows: React.FC<{
  caption?: string;
  rows: { label: React.ReactNode; calc: React.ReactNode; result: React.ReactNode }[];
}> = ({ caption, rows }) => (
  <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
    {caption && (
      <div className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-500">
        {caption}
      </div>
    )}
    <div className="overflow-x-auto no-scrollbar">
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
  </div>
);

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-lg border-l-2 border-zinc-300 bg-zinc-50 px-3 py-2 text-[13px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
    {children}
  </p>
);

export const STEPS: Step[] = [
  // ---------------------------------------------------------------- forward
  {
    key: "input",
    phase: "forward",
    title: "Feed in one example",
    body: ({ sample }) => (
      <>
        <p>
          We take one row of the XOR table. The network gets two numbers as input,{" "}
          <F>x₁ = {sample.x[0]}</F> and <F>x₂ = {sample.x[1]}</F>, and the correct answer is{" "}
          <F>y = {sample.y}</F>.
        </p>
        <p>
          All the weights start out random, so the network&apos;s first answer is basically a guess.
          Let&apos;s follow these two numbers through the network.
        </p>
        <BigIdea>x is what goes in, y is what should come out.</BigIdea>
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
    title: "Each hidden neuron computes a score",
    body: ({ net, c }) => (
      <>
        <p>
          Every hidden neuron has two <b>weights</b> (the two bars on its card), one for each input.
          A weight says <i>how much the neuron listens</i> to that input. The neuron:
        </p>
        <ol className="ml-5 list-decimal space-y-0.5">
          <li>multiplies each input by its weight,</li>
          <li>adds the results up,</li>
          <li>
            adds its <b>bias</b> (the lighter third bar), a fixed nudge of its own.
          </li>
        </ol>
        <p>
          The result is the neuron&apos;s raw <b>score</b>, called <F>z</F>.
        </p>
        <MathBox
          legend={[
            ["z", "the neuron's score"],
            ["x₁, x₂", "the two inputs"],
            ["w₁, w₂", "the neuron's two weights"],
            ["b", "the neuron's bias"],
          ]}
        >
          z = w₁ × x₁ + w₂ × x₂ + b
        </MathBox>
        <Rows
          caption="With the real numbers (weight × input + … + bias)"
          rows={[0, 1, 2].map((j) => ({
            label: `h${S[j + 1]}`,
            calc: `${p(net.W1[j][0])}×${c.x[0]} + ${p(net.W1[j][1])}×${c.x[1]} + ${p(net.b1[j])}`,
            result: <N>{n(c.z1[j])}</N>,
          }))}
        />
        <Hint>If an input is 0, its weight has no effect: anything × 0 = 0.</Hint>
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
    title: "…and squashes it",
    body: ({ c }) => (
      <>
        <p>
          Next, each neuron runs its score through a <b>squashing curve</b> called <F>tanh</F> (see
          the plot). Large positive scores come out close to <b>+1</b>, large negative scores close
          to <b>−1</b>, and scores near 0 stay roughly the same.
        </p>
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_1.1fr]">
          <Rows
            caption="score → squashed"
            rows={[0, 1, 2].map((j) => ({
              label: `h${S[j + 1]}`,
              calc: `${n(c.z1[j])} →`,
              result: <N>{n(c.h[j])}</N>,
            }))}
          />
          <FunctionPlot
            fn={Math.tanh}
            x={[-3, 3]}
            y={[-1, 1]}
            xLabel="score z"
            yLabel="output h"
            points={c.z1.map((z, j) => ({ x: z, label: `h${S[j + 1]}` }))}
          />
        </div>
        <p>
          The squashed value is called <F>h</F>, and it&apos;s what the neuron passes on.
        </p>
        <BigIdea>
          Why bend at all? Without the curve, the network could only ever draw straight lines, and
          XOR needs a curvy boundary.
        </BigIdea>
      </>
    ),
    diagram: () => ({ focus: HIDDEN_KEYS, display: { hidden: "h", out: "none" } }),
  },
  {
    key: "out",
    phase: "forward",
    title: "The output neuron makes the guess",
    body: ({ net, c }) => (
      <>
        <p>
          The output neuron does exactly the same thing, except its inputs are the three hidden
          values <F>h₁, h₂, h₃</F>. It has its own weights (we call them <F>v</F> to tell them
          apart) and its own bias <F>c</F>.
        </p>
        <p>
          Its squashing curve is the <b>sigmoid</b> <F>σ</F>, which squeezes the score into the
          range 0 to 1. So we can read the result as confidence: <N>{n(c.yHat)}</N> means “I&apos;m{" "}
          {Math.round(c.yHat * 100)}% sure the answer is 1”.
        </p>
        <MathBox
          legend={[
            ["v₁, v₂, v₃, c", "the output neuron's weights and bias"],
            ["σ (sigma)", "squashing curve that outputs 0 … 1"],
            ["ŷ (“y-hat”)", "the network's guess for y"],
          ]}
        >
          score = v₁ × h₁ + v₂ × h₂ + v₃ × h₃ + c &nbsp;&nbsp;→&nbsp;&nbsp; ŷ = σ(score)
        </MathBox>
        <Rows
          rows={[
            {
              label: "score",
              calc: net.W2.map((v, j) => `${p(v)}×${p(c.h[j])}`).join(" + ") + ` + ${p(net.b2)}`,
              result: <N>{n(c.z2)}</N>,
            },
            { label: "guess ŷ", calc: `σ(${n(c.z2)})`, result: <N>{n(c.yHat)}</N> },
          ]}
        />
        <MoreMath>
          <p>
            The sigmoid is{" "}
            <F>
              σ(z) = 1 / (1 + e<sup>−z</sup>)
            </F>
            . A score of 0 gives exactly 0.5, big positive scores approach 1, big negative scores
            approach 0.
          </p>
        </MoreMath>
        <BigIdea>
          That was the <b>forward pass</b>: numbers flow from left to right, layer by layer, until a
          guess comes out.
        </BigIdea>
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
    title: "Score the guess with a penalty",
    body: ({ sample, c }) => {
      const y = sample.y;
      const L = bce(c.yHat, y);
      const examples = y === 1 ? [0.99, 0.8, 0.5, 0.2, 0.01] : [0.01, 0.2, 0.5, 0.8, 0.99];
      return (
        <>
          <p>
            The network guessed <N>{n(c.yHat)}</N>, but the right answer is <N>{y}</N>. To learn, it
            first needs one number that says <i>how bad</i> this guess was. That number is called
            the <b>loss</b> <F>L</F>, a kind of penalty:
          </p>
          <ul className="ml-5 list-disc space-y-0.5">
            <li>right and confident → penalty close to 0</li>
            <li>unsure (around 0.5) → medium penalty</li>
            <li>wrong and confident → huge penalty</li>
          </ul>
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1.1fr_1fr]">
            <FunctionPlot
              fn={(v) => bce(v, y)}
              x={[0, 1]}
              y={[0, 4]}
              xLabel="guess ŷ"
              yLabel={`penalty if the answer is ${y}`}
              points={[{ x: c.yHat, label: `our guess: ${n(L)}`, color: GRAD }]}
            />
            <Rows
              caption={`answer is ${y}`}
              rows={examples.map((g) => ({
                label: `guess ${g}`,
                calc: "→",
                result: <N>{n(bce(g, y))}</N>,
              }))}
            />
          </div>
          <BigIdea>
            Our penalty right now: <b>{n(L, 2)}</b>. Learning means changing the weights so that
            this number shrinks.
          </BigIdea>
          <MoreMath>
            <p>
              The curve is called <b>cross-entropy</b>. When the answer is 1 the penalty is{" "}
              <F>L = −log(ŷ)</F>, and when it is 0 it is <F>L = −log(1 − ŷ)</F>. Both combined:{" "}
              <F>L = −[y·log(ŷ) + (1 − y)·log(1 − ŷ)]</F>. You don&apos;t need the formula, just the
              shape: the more wrong the guess, the steeper the curve.
            </p>
          </MoreMath>
        </>
      );
    },
    diagram: () => ({ focus: ["out", "eL", "loss"], display: { loss: true } }),
  },

  // ---------------------------------------------------------------- backward
  {
    key: "delta2",
    phase: "backward",
    title: "Start at the end: how wrong was the output?",
    body: ({ sample, c, g }) => (
      <>
        <p>
          Now comes the actual learning. For <b>every single weight</b> we want to know:
        </p>
        <BigIdea>
          If I turn this knob up a tiny bit, does the penalty go up or down, and by how much?
        </BigIdea>
        <p>
          That answer is called the weight&apos;s <b>gradient</b>. Backpropagation computes all
          gradients by walking the network <b>backwards</b>, from the penalty to the inputs.
        </p>
        <p>
          First stop: the output neuron. Its <b>error signal</b> (written <F>δ</F>, the Greek letter
          “delta”) is wonderfully simple: <i>guess minus answer</i>.
        </p>
        <MathBox
          legend={[
            ["δ", "error signal of the output neuron"],
            ["ŷ", "the guess"],
            ["y", "the correct answer"],
          ]}
        >
          δ = ŷ − y = {n(c.yHat)} − {sample.y} = <N tone="grad">{n(g.delta2, 2)}</N>
        </MathBox>
        <Hint>
          {g.delta2 < 0
            ? "Negative δ: the guess is too low, so the output's score should go up."
            : "Positive δ: the guess is too high, so the output's score should go down."}{" "}
          The bigger |δ|, the bigger the mistake.
        </Hint>
        <MoreMath>
          <p>
            Strictly speaking, δ is the gradient of the loss with respect to the output&apos;s
            score: <F>δ = ∂L/∂z</F> (read: “how L reacts to z”). It only comes out as the simple{" "}
            <F>ŷ − y</F> because the sigmoid and the cross-entropy penalty fit together so nicely.
            That&apos;s exactly why this pair is so popular.
          </p>
        </MoreMath>
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
    title: "Which output weights are to blame?",
    body: ({ c, g }) => (
      <>
        <p>
          Take the weight <F>v₁</F>, which connects hidden neuron h₁ to the output. How much did it
          contribute to the mistake? Two things matter:
        </p>
        <ul className="ml-5 list-disc space-y-0.5">
          <li>
            how big the error is (<F>δ</F>),
          </li>
          <li>
            how much signal came through that wire (<F>h₁</F>). If nothing came through, the weight
            couldn&apos;t have caused anything.
          </li>
        </ul>
        <MathBox
          legend={[
            ["gradient of v₁", "how the penalty reacts when v₁ is turned up"],
            ["δ", "output's error signal (previous step)"],
            ["h₁", "the value that came in through this wire"],
          ]}
        >
          gradient of v₁ = δ × h₁
        </MathBox>
        <Rows
          caption="error × signal on the wire = gradient → what to do"
          rows={[0, 1, 2].map((j) => ({
            label: `v${S[j + 1]}`,
            calc: `${p(g.delta2)}×${p(c.h[j])} = ${n(g.dW2[j], 3)}`,
            result: (
              <span className="text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                {dir(g.dW2[j])}
              </span>
            ),
          }))}
        />
        <Hint>
          Rule of thumb: a <b>positive</b> gradient means “turning this knob up makes things worse”,
          so we will turn it <b>down</b>, and vice versa. The amber arrows on the output card show
          exactly that.
        </Hint>
        <MoreMath>
          <p>
            Mathematicians write the gradient of v₁ as <F>∂L/∂v₁</F>. The curly ∂ just means “a tiny
            change in”, so it reads: “tiny change in L, caused by a tiny change in v₁”.
          </p>
        </MoreMath>
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
    title: "Pass the blame back to the hidden neurons",
    body: ({ net, c, g }) => (
      <>
        <p>Now each hidden neuron gets its own error signal. Two ideas:</p>
        <p>
          <b>1. Blame travels along the wire.</b> Neuron h₁ only affects the output through the
          weight <F>v₁</F>. A big weight means a big influence, and so a big share of the blame:{" "}
          <F>δ × v₁</F>.
        </p>
        <p>
          <b>2. The squashing curve can dampen it.</b> If the neuron sits on a flat part of its tanh
          curve (output close to +1 or −1), nudging its score barely changes anything, so it gets
          little blame. On the steep middle part it gets the full share. The steepness of tanh at
          that point is <F>1 − h²</F>.
        </p>
        <FunctionPlot
          fn={Math.tanh}
          x={[-3, 3]}
          y={[-1, 1]}
          xLabel="score z"
          yLabel="tanh: dashed line = steepness at h₁"
          tangent
          width={340}
          height={130}
          points={[{ x: c.z1[0], label: `h₁, steepness ${n(1 - c.h[0] ** 2)}` }]}
        />
        <MathBox
          legend={[
            ["δ₁", "error signal of hidden neuron h₁"],
            ["δ × v₁", "blame arriving along the wire"],
            ["1 − h₁²", "steepness of tanh: 1 in the middle, near 0 at the flat ends"],
          ]}
        >
          δ₁ = δ × v₁ × (1 − h₁²)
        </MathBox>
        <Rows
          caption="error × wire weight × steepness"
          rows={[0, 1, 2].map((j) => ({
            label: `δ${S[j + 1]}`,
            calc: `${p(g.delta2)}×${p(net.W2[j])}×${n(1 - c.h[j] ** 2)}`,
            result: <N tone="grad">{n(g.delta1[j], 3)}</N>,
          }))}
        />
        <Hint>
          Notice we keep <b>multiplying</b> effects along the path. Why that works is explained in
          the next section (the chain rule).
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
    title: "Which hidden weights are to blame?",
    body: ({ c, g }) => (
      <>
        <p>
          Same rule as for the output weights, one layer further back:{" "}
          <i>the neuron&apos;s error signal × the input on that wire</i>. Same for the bias, which
          you can think of as a wire whose input is always 1.
        </p>
        <MathBox
          legend={[
            ["δⱼ", "error signal of hidden neuron j (previous step)"],
            ["xᵢ", "input number i"],
          ]}
        >
          gradient of wⱼᵢ = δⱼ × xᵢ &nbsp;&nbsp;&nbsp; gradient of bⱼ = δⱼ
        </MathBox>
        <Rows
          caption="gradients: weight 1, weight 2, bias"
          rows={[0, 1, 2].map((j) => ({
            label: `h${S[j + 1]}`,
            calc: `δ${S[j + 1]} = ${n(g.delta1[j], 3)}`,
            result: (
              <span className="font-mono text-[12px]">
                <N tone="grad">{n(g.dW1[j][0], 3)}</N>, <N tone="grad">{n(g.dW1[j][1], 3)}</N>,{" "}
                <N tone="grad">{n(g.db1[j], 3)}</N>
              </span>
            ),
          }))}
        />
        {(c.x[0] === 0 || c.x[1] === 0) && (
          <Hint>
            See the zeros? Those weights belong to an input that was <b>0</b>. They had no influence
            on this guess, so they get no blame.
          </Hint>
        )}
        <BigIdea>
          Done! One pass forward and one pass backward gave us a gradient for <b>all 13</b> knobs in
          the network.
        </BigIdea>
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
    title: "Turn every knob a little",
    body: ({ net, next, g, sample, lr, c }) => {
      const after = forward(next, sample.x);
      const before = bce(c.yHat, sample.y);
      const afterL = bce(after.yHat, sample.y);
      return (
        <>
          <p>
            Each gradient says which way makes the penalty <i>bigger</i>. So we nudge every weight a
            little in the <b>opposite</b> direction. How big the nudge is, is set by the{" "}
            <b>learning rate</b> <F>η = {lr}</F> (Greek “eta”).
          </p>
          <MathBox
            legend={[
              ["η", "learning rate: the step size"],
              ["−", "minus, because we go against the gradient"],
            ]}
          >
            new weight = old weight − η × gradient
          </MathBox>
          <Rows
            caption="three examples"
            rows={[
              {
                label: "v₁",
                calc: `${n(net.W2[0], 3)} − ${lr}×${p(g.dW2[0], 3)}`,
                result: <N>{n(next.W2[0], 3)}</N>,
              },
              {
                label: "w₁₁",
                calc: `${n(net.W1[0][0], 3)} − ${lr}×${p(g.dW1[0][0], 3)}`,
                result: <N>{n(next.W1[0][0], 3)}</N>,
              },
              {
                label: "c",
                calc: `${n(net.b2, 3)} − ${lr}×${p(g.db2, 3)}`,
                result: <N>{n(next.b2, 3)}</N>,
              },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="eyebrow mb-1">before</div>
              <div className="text-[13px]">
                guess <N>{n(c.yHat, 2)}</N> · penalty <N>{n(before, 2)}</N>
              </div>
            </div>
            <div className="rounded-lg border border-zinc-900 p-3 dark:border-zinc-200">
              <div className="eyebrow mb-1">after one step</div>
              <div className="text-[13px]">
                guess <N>{n(after.yHat, 2)}</N> · penalty <N>{n(afterL, 2)}</N>
              </div>
            </div>
          </div>
          <BigIdea>
            The guess moved towards the correct answer {sample.y}. Repeat this for all four
            examples, a few hundred times, and the network has learned XOR.
          </BigIdea>
          <Hint>Dashed outlines in the diagram: the old weights. Filled bars: the new ones.</Hint>
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
