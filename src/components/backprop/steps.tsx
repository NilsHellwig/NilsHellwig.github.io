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
import ParamVector, { flattenGrads, flattenNet } from "./ParamVector";
import { BigIdea, F, GRAD, MathBox, MoreMath, N } from "./ui";
import type { Lang, Tr } from "../explainer/i18n";

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
  title: Tr<string>;
  body: (ctx: StepCtx, lang: Lang) => React.ReactNode;
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
const dir = (g: number, lang: Lang) =>
  lang === "de"
    ? g > 1e-6
      ? "kleiner drehen ↓"
      : g < -1e-6
        ? "größer drehen ↑"
        : "so lassen"
    : g > 1e-6
      ? "turn down ↓"
      : g < -1e-6
        ? "turn up ↑"
        : "stay";

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
    title: { en: "Feed in one example", de: "Ein Beispiel hineingeben" },
    body: ({ sample }, lang) =>
      lang === "de" ? (
        <>
          <p>
            Wir nehmen eine Zeile der XOR-Tabelle. Das Netz bekommt zwei Zahlen als Eingabe,{" "}
            <F>x₁ = {sample.x[0]}</F> und <F>x₂ = {sample.x[1]}</F>, und die richtige Antwort ist{" "}
            <F>y = {sample.y}</F>.
          </p>
          <p>
            Alle Gewichte sind am Anfang zufällig, deshalb ist die erste Antwort des Netzes im
            Grunde geraten. Verfolgen wir diese zwei Zahlen durch das Netz.
          </p>
          <BigIdea>x ist, was hineingeht. y ist, was herauskommen sollte.</BigIdea>
        </>
      ) : (
        <>
          <p>
            We take one row of the XOR table. The network gets two numbers as input,{" "}
            <F>x₁ = {sample.x[0]}</F> and <F>x₂ = {sample.x[1]}</F>, and the correct answer is{" "}
            <F>y = {sample.y}</F>.
          </p>
          <p>
            All the weights start out random, so the network&apos;s first answer is basically a
            guess. Let&apos;s follow these two numbers through the network.
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
    title: {
      en: "Each hidden neuron computes a score",
      de: "Jedes versteckte Neuron berechnet eine Punktzahl",
    },
    body: ({ net, c }, lang) => {
      const de = lang === "de";
      return (
        <>
          {de ? (
            <>
              <p>
                Jedes versteckte Neuron trägt einen <b>Vektor</b> mit drei Zahlen auf seiner Karte:{" "}
                <F>[w₁ w₂ │ b]</F>. Die ersten beiden sind <b>Gewichte</b>, eins pro Eingabe. Ein
                Gewicht sagt, <i>wie stark das Neuron auf diese Eingabe hört</i>. Das Neuron:
              </p>
              <ol className="ml-5 list-decimal space-y-0.5">
                <li>multipliziert jede Eingabe mit ihrem Gewicht,</li>
                <li>addiert die Ergebnisse,</li>
                <li>
                  addiert seinen <b>Bias</b> (die dritte Zahl hinter dem Strich), einen festen
                  Schubs.
                </li>
              </ol>
              <p>
                Das Ergebnis ist die rohe <b>Punktzahl</b> des Neurons, genannt <F>z</F>.
              </p>
            </>
          ) : (
            <>
              <p>
                Every hidden neuron carries a <b>vector</b> of three numbers on its card:{" "}
                <F>[w₁ w₂ │ b]</F>. The first two are <b>weights</b>, one for each input. A weight
                says <i>how much the neuron listens</i> to that input. The neuron:
              </p>
              <ol className="ml-5 list-decimal space-y-0.5">
                <li>multiplies each input by its weight,</li>
                <li>adds the results up,</li>
                <li>
                  adds its <b>bias</b> (the third number, behind the divider), a fixed nudge of its
                  own.
                </li>
              </ol>
              <p>
                The result is the neuron&apos;s raw <b>score</b>, called <F>z</F>.
              </p>
            </>
          )}
          <MathBox
            legend={
              de
                ? [
                    ["z", "die Punktzahl des Neurons"],
                    ["x₁, x₂", "die zwei Eingaben"],
                    ["w₁, w₂", "die zwei Gewichte des Neurons"],
                    ["b", "der Bias des Neurons"],
                  ]
                : [
                    ["z", "the neuron's score"],
                    ["x₁, x₂", "the two inputs"],
                    ["w₁, w₂", "the neuron's two weights"],
                    ["b", "the neuron's bias"],
                  ]
            }
          >
            z = w₁ × x₁ + w₂ × x₂ + b
          </MathBox>
          <Rows
            caption={
              de
                ? "Mit den echten Zahlen (Gewicht × Eingabe + … + Bias)"
                : "With the real numbers (weight × input + … + bias)"
            }
            rows={[0, 1, 2].map((j) => ({
              label: `h${S[j + 1]}`,
              calc: `${p(net.W1[j][0])}×${c.x[0]} + ${p(net.W1[j][1])}×${c.x[1]} + ${p(net.b1[j])}`,
              result: <N>{n(c.z1[j])}</N>,
            }))}
          />
          <Hint>
            {de
              ? "Ist eine Eingabe 0, hat ihr Gewicht keine Wirkung: alles × 0 = 0."
              : "If an input is 0, its weight has no effect: anything × 0 = 0."}
          </Hint>
        </>
      );
    },
    diagram: () => ({
      focus: ["x1", "x2", ...W_KEYS, ...HIDDEN_KEYS],
      flow: "forward",
      display: { hidden: "z", out: "none" },
    }),
  },
  {
    key: "h",
    phase: "forward",
    title: { en: "…and squashes it", de: "…und staucht sie" },
    body: ({ c }, lang) => {
      const de = lang === "de";
      return (
        <>
          {de ? (
            <p>
              Als Nächstes schickt jedes Neuron seine Punktzahl durch eine <b>Stauchkurve</b> namens{" "}
              <F>tanh</F> (siehe Plot). Große positive Punktzahlen landen nahe <b>+1</b>, große
              negative nahe <b>−1</b>, und Werte um 0 bleiben ungefähr gleich.
            </p>
          ) : (
            <p>
              Next, each neuron runs its score through a <b>squashing curve</b> called <F>tanh</F>{" "}
              (see the plot). Large positive scores come out close to <b>+1</b>, large negative
              scores close to <b>−1</b>, and scores near 0 stay roughly the same.
            </p>
          )}
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_1.1fr]">
            <Rows
              caption={de ? "Punktzahl → gestaucht" : "score → squashed"}
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
              xLabel={de ? "Punktzahl z" : "score z"}
              yLabel={de ? "Ausgabe h" : "output h"}
              points={c.z1.map((z, j) => ({ x: z, label: `h${S[j + 1]}` }))}
            />
          </div>
          {de ? (
            <>
              <p>
                Der gestauchte Wert heißt <F>h</F>. Ihn gibt das Neuron weiter.
              </p>
              <BigIdea>
                Warum überhaupt biegen? Ohne die Kurve könnte das Netz nur gerade Linien ziehen, und
                XOR braucht eine gebogene Grenze.
              </BigIdea>
            </>
          ) : (
            <>
              <p>
                The squashed value is called <F>h</F>, and it&apos;s what the neuron passes on.
              </p>
              <BigIdea>
                Why bend at all? Without the curve, the network could only ever draw straight lines,
                and XOR needs a curvy boundary.
              </BigIdea>
            </>
          )}
        </>
      );
    },
    diagram: () => ({ focus: HIDDEN_KEYS, display: { hidden: "h", out: "none" } }),
  },
  {
    key: "out",
    phase: "forward",
    title: { en: "The output neuron makes the guess", de: "Das Ausgangsneuron schätzt" },
    body: ({ net, c }, lang) => {
      const de = lang === "de";
      const pct = Math.round(c.yHat * 100);
      return (
        <>
          {de ? (
            <>
              <p>
                Das Ausgangsneuron macht genau dasselbe, nur sind seine Eingaben die drei
                versteckten Werte <F>h₁, h₂, h₃</F>. Sein Vektor ist <F>[v₁ v₂ v₃ │ c]</F>: eigene
                Gewichte (wir nennen sie <F>v</F>, um sie zu unterscheiden) und ein eigener Bias{" "}
                <F>c</F>.
              </p>
              <p>
                Seine Stauchkurve ist das <b>Sigmoid</b> <F>σ</F>, das die Punktzahl in den Bereich
                0 bis 1 drückt. So können wir das Ergebnis als Zuversicht lesen: <N>{n(c.yHat)}</N>{" "}
                heißt „Ich bin mir zu {pct}% sicher, dass die Antwort 1 ist“.
              </p>
            </>
          ) : (
            <>
              <p>
                The output neuron does exactly the same thing, except its inputs are the three
                hidden values <F>h₁, h₂, h₃</F>. Its vector is <F>[v₁ v₂ v₃ │ c]</F>: its own
                weights (we call them <F>v</F> to tell them apart) and its own bias <F>c</F>.
              </p>
              <p>
                Its squashing curve is the <b>sigmoid</b> <F>σ</F>, which squeezes the score into
                the range 0 to 1. So we can read the result as confidence: <N>{n(c.yHat)}</N> means
                “I&apos;m {pct}% sure the answer is 1”.
              </p>
            </>
          )}
          <MathBox
            legend={
              de
                ? [
                    ["v₁, v₂, v₃, c", "Gewichte und Bias des Ausgangsneurons"],
                    ["σ (Sigma)", "Stauchkurve, die 0 … 1 ausgibt"],
                    ["ŷ („y-Dach“)", "die Schätzung des Netzes für y"],
                  ]
                : [
                    ["v₁, v₂, v₃, c", "the output neuron's weights and bias"],
                    ["σ (sigma)", "squashing curve that outputs 0 … 1"],
                    ["ŷ (“y-hat”)", "the network's guess for y"],
                  ]
            }
          >
            {de ? "Punktzahl" : "score"} = v₁ × h₁ + v₂ × h₂ + v₃ × h₃ + c &nbsp;&nbsp;→&nbsp;&nbsp;
            ŷ = σ({de ? "Punktzahl" : "score"})
          </MathBox>
          <Rows
            rows={[
              {
                label: de ? "Punktzahl" : "score",
                calc: net.W2.map((v, j) => `${p(v)}×${p(c.h[j])}`).join(" + ") + ` + ${p(net.b2)}`,
                result: <N>{n(c.z2)}</N>,
              },
              {
                label: de ? "Schätzung ŷ" : "guess ŷ",
                calc: `σ(${n(c.z2)})`,
                result: <N>{n(c.yHat)}</N>,
              },
            ]}
          />
          <MoreMath>
            <p>
              {de ? "Das Sigmoid ist " : "The sigmoid is "}
              <F>
                σ(z) = 1 / (1 + e<sup>−z</sup>)
              </F>
              .{" "}
              {de
                ? "Eine Punktzahl von 0 ergibt genau 0.5, große positive Werte nähern sich 1, große negative nähern sich 0."
                : "A score of 0 gives exactly 0.5, big positive scores approach 1, big negative scores approach 0."}
            </p>
          </MoreMath>
          <BigIdea>
            {de ? (
              <>
                Das war der <b>Vorwärtsdurchlauf</b>: Zahlen fließen von links nach rechts, Schicht
                für Schicht, bis eine Schätzung herauskommt.
              </>
            ) : (
              <>
                That was the <b>forward pass</b>: numbers flow from left to right, layer by layer,
                until a guess comes out.
              </>
            )}
          </BigIdea>
        </>
      );
    },
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
    title: { en: "Score the guess with a penalty", de: "Die Schätzung mit einer Strafe bewerten" },
    body: ({ sample, c }, lang) => {
      const de = lang === "de";
      const y = sample.y;
      const L = bce(c.yHat, y);
      const examples = y === 1 ? [0.99, 0.8, 0.5, 0.2, 0.01] : [0.01, 0.2, 0.5, 0.8, 0.99];
      return (
        <>
          {de ? (
            <>
              <p>
                Das Netz hat <N>{n(c.yHat)}</N> geschätzt, aber die richtige Antwort ist <N>{y}</N>.
                Um zu lernen, braucht es zuerst eine Zahl, die sagt, <i>wie schlecht</i> diese
                Schätzung war. Diese Zahl heißt <b>Loss</b> <F>L</F>, eine Art Strafe:
              </p>
              <ul className="ml-5 list-disc space-y-0.5">
                <li>richtig und selbstsicher → Strafe nahe 0</li>
                <li>unsicher (um 0.5) → mittlere Strafe</li>
                <li>falsch und selbstsicher → riesige Strafe</li>
              </ul>
            </>
          ) : (
            <>
              <p>
                The network guessed <N>{n(c.yHat)}</N>, but the right answer is <N>{y}</N>. To
                learn, it first needs one number that says <i>how bad</i> this guess was. That
                number is called the <b>loss</b> <F>L</F>, a kind of penalty:
              </p>
              <ul className="ml-5 list-disc space-y-0.5">
                <li>right and confident → penalty close to 0</li>
                <li>unsure (around 0.5) → medium penalty</li>
                <li>wrong and confident → huge penalty</li>
              </ul>
            </>
          )}
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1.1fr_1fr]">
            <FunctionPlot
              fn={(v) => bce(v, y)}
              x={[0, 1]}
              y={[0, 4]}
              xLabel={de ? "Schätzung ŷ" : "guess ŷ"}
              yLabel={de ? `Strafe, wenn die Antwort ${y} ist` : `penalty if the answer is ${y}`}
              points={[
                {
                  x: c.yHat,
                  label: `${de ? "unsere Schätzung" : "our guess"}: ${n(L)}`,
                  color: GRAD,
                },
              ]}
            />
            <Rows
              caption={de ? `Antwort ist ${y}` : `answer is ${y}`}
              rows={examples.map((g) => ({
                label: `${de ? "Schätzung" : "guess"} ${g}`,
                calc: "→",
                result: <N>{n(bce(g, y))}</N>,
              }))}
            />
          </div>
          <BigIdea>
            {de ? (
              <>
                Unsere Strafe gerade: <b>{n(L, 2)}</b>. Lernen heißt, die Gewichte so zu ändern,
                dass diese Zahl schrumpft.
              </>
            ) : (
              <>
                Our penalty right now: <b>{n(L, 2)}</b>. Learning means changing the weights so that
                this number shrinks.
              </>
            )}
          </BigIdea>
          <MoreMath>
            {de ? (
              <p>
                Die Kurve heißt <b>Kreuzentropie</b> (cross-entropy). Ist die Antwort 1, ist die
                Strafe <F>L = −log(ŷ)</F>, ist sie 0, dann <F>L = −log(1 − ŷ)</F>. Beides zusammen:{" "}
                <F>L = −[y·log(ŷ) + (1 − y)·log(1 − ŷ)]</F>. Die Formel braucht man nicht, nur die
                Form: Je falscher die Schätzung, desto steiler die Kurve.
              </p>
            ) : (
              <p>
                The curve is called <b>cross-entropy</b>. When the answer is 1 the penalty is{" "}
                <F>L = −log(ŷ)</F>, and when it is 0 it is <F>L = −log(1 − ŷ)</F>. Both combined:{" "}
                <F>L = −[y·log(ŷ) + (1 − y)·log(1 − ŷ)]</F>. You don&apos;t need the formula, just
                the shape: the more wrong the guess, the steeper the curve.
              </p>
            )}
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
    title: {
      en: "Start at the end: how wrong was the output?",
      de: "Hinten anfangen: Wie falsch lag der Ausgang?",
    },
    body: ({ sample, c, g }, lang) => {
      const de = lang === "de";
      return (
        <>
          {de ? (
            <>
              <p>
                Jetzt kommt das eigentliche Lernen. Für <b>jedes einzelne Gewicht</b> wollen wir
                wissen:
              </p>
              <BigIdea>
                Wenn ich diesen Regler ein winziges Stück aufdrehe: Steigt oder sinkt die Strafe,
                und wie stark?
              </BigIdea>
              <p>
                Diese Antwort heißt der <b>Gradient</b> des Gewichts. Backpropagation berechnet alle
                Gradienten, indem sie das Netz <b>rückwärts</b> durchläuft, von der Strafe zu den
                Eingaben.
              </p>
              <p>
                Erste Station: das Ausgangsneuron. Sein <b>Fehlersignal</b> (geschrieben <F>δ</F>,
                der griechische Buchstabe „Delta“) ist wunderbar einfach:{" "}
                <i>Schätzung minus Antwort</i>.
              </p>
            </>
          ) : (
            <>
              <p>
                Now comes the actual learning. For <b>every single weight</b> we want to know:
              </p>
              <BigIdea>
                If I turn this knob up a tiny bit, does the penalty go up or down, and by how much?
              </BigIdea>
              <p>
                That answer is called the weight&apos;s <b>gradient</b>. Backpropagation computes
                all gradients by walking the network <b>backwards</b>, from the penalty to the
                inputs.
              </p>
              <p>
                First stop: the output neuron. Its <b>error signal</b> (written <F>δ</F>, the Greek
                letter “delta”) is wonderfully simple: <i>guess minus answer</i>.
              </p>
            </>
          )}
          <MathBox
            legend={
              de
                ? [
                    ["δ", "Fehlersignal des Ausgangsneurons"],
                    ["ŷ", "die Schätzung"],
                    ["y", "die richtige Antwort"],
                  ]
                : [
                    ["δ", "error signal of the output neuron"],
                    ["ŷ", "the guess"],
                    ["y", "the correct answer"],
                  ]
            }
          >
            δ = ŷ − y = {n(c.yHat)} − {sample.y} = <N tone="grad">{n(g.delta2, 2)}</N>
          </MathBox>
          <Hint>
            {de
              ? g.delta2 < 0
                ? "Negatives δ: Die Schätzung ist zu niedrig, also sollte die Punktzahl des Ausgangs steigen."
                : "Positives δ: Die Schätzung ist zu hoch, also sollte die Punktzahl des Ausgangs sinken."
              : g.delta2 < 0
                ? "Negative δ: the guess is too low, so the output's score should go up."
                : "Positive δ: the guess is too high, so the output's score should go down."}{" "}
            {de
              ? "Je größer |δ|, desto größer der Fehler."
              : "The bigger |δ|, the bigger the mistake."}
          </Hint>
          <MoreMath>
            {de ? (
              <p>
                Genau genommen ist δ der Gradient des Loss bezüglich der Punktzahl des Ausgangs:{" "}
                <F>δ = ∂L/∂z</F> (lies: „wie L auf z reagiert“). Dass es so schlicht als{" "}
                <F>ŷ − y</F> herauskommt, liegt daran, dass Sigmoid und Kreuzentropie so gut
                zusammenpassen. Genau deshalb ist dieses Paar so beliebt.
              </p>
            ) : (
              <p>
                Strictly speaking, δ is the gradient of the loss with respect to the output&apos;s
                score: <F>δ = ∂L/∂z</F> (read: “how L reacts to z”). It only comes out as the simple{" "}
                <F>ŷ − y</F> because the sigmoid and the cross-entropy penalty fit together so
                nicely. That&apos;s exactly why this pair is so popular.
              </p>
            )}
          </MoreMath>
        </>
      );
    },
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
    title: { en: "Which output weights are to blame?", de: "Welche Ausgangsgewichte sind schuld?" },
    body: ({ c, g }, lang) => {
      const de = lang === "de";
      return (
        <>
          {de ? (
            <>
              <p>
                Nimm das Gewicht <F>v₁</F>, das das versteckte Neuron h₁ mit dem Ausgang verbindet.
                Wie viel hat es zum Fehler beigetragen? Zwei Dinge zählen:
              </p>
              <ul className="ml-5 list-disc space-y-0.5">
                <li>
                  wie groß der Fehler ist (<F>δ</F>),
                </li>
                <li>
                  wie viel Signal durch diese Leitung kam (<F>h₁</F>). Kam nichts durch, konnte das
                  Gewicht auch nichts anrichten.
                </li>
              </ul>
            </>
          ) : (
            <>
              <p>
                Take the weight <F>v₁</F>, which connects hidden neuron h₁ to the output. How much
                did it contribute to the mistake? Two things matter:
              </p>
              <ul className="ml-5 list-disc space-y-0.5">
                <li>
                  how big the error is (<F>δ</F>),
                </li>
                <li>
                  how much signal came through that wire (<F>h₁</F>). If nothing came through, the
                  weight couldn&apos;t have caused anything.
                </li>
              </ul>
            </>
          )}
          <MathBox
            legend={
              de
                ? [
                    ["Gradient von v₁", "wie die Strafe reagiert, wenn man v₁ aufdreht"],
                    ["δ", "Fehlersignal des Ausgangs (letzter Schritt)"],
                    ["h₁", "der Wert, der durch diese Leitung kam"],
                  ]
                : [
                    ["gradient of v₁", "how the penalty reacts when v₁ is turned up"],
                    ["δ", "output's error signal (previous step)"],
                    ["h₁", "the value that came in through this wire"],
                  ]
            }
          >
            {de ? "Gradient von v₁" : "gradient of v₁"} = δ × h₁
          </MathBox>
          <Rows
            caption={
              de
                ? "Fehler × Signal auf der Leitung = Gradient → was tun"
                : "error × signal on the wire = gradient → what to do"
            }
            rows={[0, 1, 2].map((j) => ({
              label: `v${S[j + 1]}`,
              calc: `${p(g.delta2)}×${p(c.h[j])} = ${n(g.dW2[j], 3)}`,
              result: (
                <span className="text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                  {dir(g.dW2[j], lang)}
                </span>
              ),
            }))}
          />
          <Hint>
            {de ? (
              <>
                Faustregel: Ein <b>positiver</b> Gradient heißt „Aufdrehen macht es schlimmer“, also
                drehen wir den Regler <b>herunter</b>, und umgekehrt. Die kleinen Pfeile unter dem
                Vektor der Ausgangskarte zeigen genau das.
              </>
            ) : (
              <>
                Rule of thumb: a <b>positive</b> gradient means “turning this knob up makes things
                worse”, so we will turn it <b>down</b>, and vice versa. The small amber arrows under
                the output card&apos;s vector show exactly that.
              </>
            )}
          </Hint>
          <MoreMath>
            {de ? (
              <p>
                Mathematiker schreiben den Gradienten von v₁ als <F>∂L/∂v₁</F>. Das geschwungene ∂
                heißt nur „eine winzige Änderung von“, also: „winzige Änderung von L, verursacht
                durch eine winzige Änderung von v₁“.
              </p>
            ) : (
              <p>
                Mathematicians write the gradient of v₁ as <F>∂L/∂v₁</F>. The curly ∂ just means “a
                tiny change in”, so it reads: “tiny change in L, caused by a tiny change in v₁”.
              </p>
            )}
          </MoreMath>
        </>
      );
    },
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
    title: {
      en: "Pass the blame back to the hidden neurons",
      de: "Die Schuld an die versteckten Neuronen weiterreichen",
    },
    body: ({ net, c, g }, lang) => {
      const de = lang === "de";
      return (
        <>
          {de ? (
            <>
              <p>Jetzt bekommt jedes versteckte Neuron sein eigenes Fehlersignal. Zwei Ideen:</p>
              <p>
                <b>1. Schuld wandert entlang der Leitung.</b> Neuron h₁ beeinflusst den Ausgang nur
                über das Gewicht <F>v₁</F>. Großes Gewicht heißt großer Einfluss und damit ein
                großer Anteil an der Schuld: <F>δ × v₁</F>.
              </p>
              <p>
                <b>2. Die Stauchkurve kann sie dämpfen.</b> Sitzt das Neuron auf einem flachen Teil
                seiner tanh-Kurve (Ausgabe nahe +1 oder −1), ändert ein Schubs an seiner Punktzahl
                kaum etwas, also bekommt es wenig Schuld. Im steilen Mittelteil bekommt es den
                vollen Anteil. Die Steilheit von tanh an dieser Stelle ist <F>1 − h²</F>.
              </p>
            </>
          ) : (
            <>
              <p>Now each hidden neuron gets its own error signal. Two ideas:</p>
              <p>
                <b>1. Blame travels along the wire.</b> Neuron h₁ only affects the output through
                the weight <F>v₁</F>. A big weight means a big influence, and so a big share of the
                blame: <F>δ × v₁</F>.
              </p>
              <p>
                <b>2. The squashing curve can dampen it.</b> If the neuron sits on a flat part of
                its tanh curve (output close to +1 or −1), nudging its score barely changes
                anything, so it gets little blame. On the steep middle part it gets the full share.
                The steepness of tanh at that point is <F>1 − h²</F>.
              </p>
            </>
          )}
          <FunctionPlot
            fn={Math.tanh}
            x={[-3, 3]}
            y={[-1, 1]}
            xLabel={de ? "Punktzahl z" : "score z"}
            yLabel={
              de ? "tanh: gestrichelt = Steilheit bei h₁" : "tanh: dashed line = steepness at h₁"
            }
            tangent
            width={340}
            height={130}
            points={[
              {
                x: c.z1[0],
                label: `h₁, ${de ? "Steilheit" : "steepness"} ${n(1 - c.h[0] ** 2)}`,
              },
            ]}
          />
          <MathBox
            legend={
              de
                ? [
                    ["δ₁", "Fehlersignal des versteckten Neurons h₁"],
                    ["δ × v₁", "Schuld, die über die Leitung ankommt"],
                    ["1 − h₁²", "Steilheit von tanh: 1 in der Mitte, fast 0 an den flachen Enden"],
                  ]
                : [
                    ["δ₁", "error signal of hidden neuron h₁"],
                    ["δ × v₁", "blame arriving along the wire"],
                    ["1 − h₁²", "steepness of tanh: 1 in the middle, near 0 at the flat ends"],
                  ]
            }
          >
            δ₁ = δ × v₁ × (1 − h₁²)
          </MathBox>
          <Rows
            caption={
              de ? "Fehler × Leitungsgewicht × Steilheit" : "error × wire weight × steepness"
            }
            rows={[0, 1, 2].map((j) => ({
              label: `δ${S[j + 1]}`,
              calc: `${p(g.delta2)}×${p(net.W2[j])}×${n(1 - c.h[j] ** 2)}`,
              result: <N tone="grad">{n(g.delta1[j], 3)}</N>,
            }))}
          />
          <Hint>
            {de ? (
              <>
                Wir <b>multiplizieren</b> also die Effekte entlang des Weges. Warum das
                funktioniert, erklärt der nächste Abschnitt (die Kettenregel).
              </>
            ) : (
              <>
                Notice we keep <b>multiplying</b> effects along the path. Why that works is
                explained in the next section (the chain rule).
              </>
            )}
          </Hint>
        </>
      );
    },
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
    title: {
      en: "Which hidden weights are to blame?",
      de: "Welche versteckten Gewichte sind schuld?",
    },
    body: ({ c, g }, lang) => {
      const de = lang === "de";
      return (
        <>
          {de ? (
            <p>
              Dieselbe Regel wie bei den Ausgangsgewichten, eine Schicht weiter hinten:{" "}
              <i>Fehlersignal des Neurons × Eingabe auf dieser Leitung</i>. Genauso für den Bias,
              den man sich als Leitung vorstellen kann, deren Eingabe immer 1 ist.
            </p>
          ) : (
            <p>
              Same rule as for the output weights, one layer further back:{" "}
              <i>the neuron&apos;s error signal × the input on that wire</i>. Same for the bias,
              which you can think of as a wire whose input is always 1.
            </p>
          )}
          <MathBox
            legend={
              de
                ? [
                    ["δⱼ", "Fehlersignal des versteckten Neurons j (letzter Schritt)"],
                    ["xᵢ", "Eingabe Nummer i"],
                  ]
                : [
                    ["δⱼ", "error signal of hidden neuron j (previous step)"],
                    ["xᵢ", "input number i"],
                  ]
            }
          >
            {de ? "Gradient von" : "gradient of"} wⱼᵢ = δⱼ × xᵢ &nbsp;&nbsp;&nbsp;{" "}
            {de ? "Gradient von" : "gradient of"} bⱼ = δⱼ
          </MathBox>
          <Rows
            caption={
              de ? "Gradienten: Gewicht 1, Gewicht 2, Bias" : "gradients: weight 1, weight 2, bias"
            }
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
              {de ? (
                <>
                  Siehst du die Nullen? Diese Gewichte gehören zu einer Eingabe, die <b>0</b> war.
                  Sie hatten keinen Einfluss auf diese Schätzung, also bekommen sie keine Schuld.
                </>
              ) : (
                <>
                  See the zeros? Those weights belong to an input that was <b>0</b>. They had no
                  influence on this guess, so they get no blame.
                </>
              )}
            </Hint>
          )}
          <ParamVector
            groups={flattenGrads(g)}
            tone="grad"
            digits={2}
            title={
              de
                ? "Alle 13 Gradienten als ein Vektor: der Gradientenvektor"
                : "All 13 gradients as one vector: the gradient vector"
            }
          />
          <BigIdea>
            {de ? (
              <>
                Fertig! Ein Durchlauf vorwärts und einer rückwärts liefern einen Gradienten für{" "}
                <b>alle 13</b> Regler im Netz.
              </>
            ) : (
              <>
                Done! One pass forward and one pass backward gave us a gradient for <b>all 13</b>{" "}
                knobs in the network.
              </>
            )}
          </BigIdea>
        </>
      );
    },
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
    title: { en: "Turn every knob a little", de: "Jeden Regler ein bisschen drehen" },
    body: ({ net, next, g, sample, lr, c }, lang) => {
      const de = lang === "de";
      const after = forward(next, sample.x);
      const before = bce(c.yHat, sample.y);
      const afterL = bce(after.yHat, sample.y);
      return (
        <>
          {de ? (
            <p>
              Jeder Gradient sagt, in welche Richtung die Strafe <i>größer</i> wird. Also schubsen
              wir jedes Gewicht ein kleines Stück in die <b>entgegengesetzte</b> Richtung. Wie groß
              der Schubs ist, bestimmt die <b>Lernrate</b> <F>η = {lr}</F> (griechisch „Eta“).
            </p>
          ) : (
            <p>
              Each gradient says which way makes the penalty <i>bigger</i>. So we nudge every weight
              a little in the <b>opposite</b> direction. How big the nudge is, is set by the{" "}
              <b>learning rate</b> <F>η = {lr}</F> (Greek “eta”).
            </p>
          )}
          <MathBox
            legend={
              de
                ? [
                    ["η", "Lernrate: die Schrittgröße"],
                    ["−", "minus, weil wir gegen den Gradienten gehen"],
                  ]
                : [
                    ["η", "learning rate: the step size"],
                    ["−", "minus, because we go against the gradient"],
                  ]
            }
          >
            {de
              ? "neues Gewicht = altes Gewicht − η × Gradient"
              : "new weight = old weight − η × gradient"}
          </MathBox>
          <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <ParamVector
              groups={flattenNet(net)}
              title={de ? "vorher: alle 13 Parameter" : "before: all 13 parameters"}
            />
            <div className="text-center text-[12px] font-semibold text-zinc-400">
              − {lr} ×{" "}
              <span className="text-amber-600 dark:text-amber-400">
                {de ? "Gradientenvektor" : "gradient vector"}
              </span>{" "}
              =
            </div>
            <ParamVector
              groups={flattenNet(next)}
              compare={flattenNet(net)}
              title={de ? "nachher (geändert = grün hinterlegt)" : "after (changed = green)"}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="eyebrow mb-1">{de ? "vorher" : "before"}</div>
              <div className="text-[13px]">
                {de ? "Schätzung" : "guess"} <N>{n(c.yHat, 2)}</N> · {de ? "Strafe" : "penalty"}{" "}
                <N>{n(before, 2)}</N>
              </div>
            </div>
            <div className="rounded-lg border border-zinc-900 p-3 dark:border-zinc-200">
              <div className="eyebrow mb-1">{de ? "nach einem Schritt" : "after one step"}</div>
              <div className="text-[13px]">
                {de ? "Schätzung" : "guess"} <N>{n(after.yHat, 2)}</N> · {de ? "Strafe" : "penalty"}{" "}
                <N>{n(afterL, 2)}</N>
              </div>
            </div>
          </div>
          <BigIdea>
            {de
              ? `Die Schätzung hat sich in Richtung der richtigen Antwort ${sample.y} bewegt. Wiederhole das für alle vier Beispiele, ein paar hundert Mal, und das Netz hat XOR gelernt.`
              : `The guess moved towards the correct answer ${sample.y}. Repeat this for all four examples, a few hundred times, and the network has learned XOR.`}
          </BigIdea>
          <Hint>
            {de
              ? "Im Diagramm: Durchgestrichene Zahlen unter jedem Vektor sind die alten Werte, die großen Zahlen die neuen."
              : "In the diagram: the struck-through numbers under each vector are the old values, the big numbers the new ones."}
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
