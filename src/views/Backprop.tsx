"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Brain, Lightning } from "@phosphor-icons/react";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import NetworkDiagram, { type Flow } from "../components/backprop/NetworkDiagram";
import Walkthrough from "../components/backprop/Walkthrough";
import ChainRule from "../components/backprop/ChainRule";
import DescentDemo from "../components/backprop/DescentDemo";
import Playground from "../components/backprop/Playground";
import ParamVector, { flattenNet } from "../components/backprop/ParamVector";
import { NeuronAnatomy, XorCard } from "../components/backprop/NeuronAnatomy";
import { BACKPROP_SYMBOLS, Glossary, SymbolsButton } from "../components/backprop/Glossary";
import { STEPS, type StepCtx } from "../components/backprop/steps";
import {
  F,
  Legend,
  Prose,
  Section,
  itemVariants,
  sectionVariants,
} from "../components/backprop/ui";
import ProgressRail from "../components/explainer/ProgressRail";
import { LangProvider, LangToggle, type Tr, useLang, useT } from "../components/explainer/i18n";
import { DEFAULT_SEED, XOR, applyGrads, backward, forward, initNet } from "../lib/nn";

const DEMO_LR = 0.5;

const stepNo = (key: string) => STEPS.findIndex((s) => s.key === key) + 1;

/** The hero network breathes: a forward wave, then a backward wave, forever. */
const HeroNetwork: React.FC<{ ctx: StepCtx }> = ({ ctx }) => {
  const t = useT();
  const [flow, setFlow] = useState<Flow>("forward");
  useEffect(() => {
    const id = setInterval(() => setFlow((f) => (f === "forward" ? "backward" : "forward")), 3300);
    return () => clearInterval(id);
  }, []);
  const backward = flow === "backward";
  return (
    <motion.div variants={itemVariants} className="card relative overflow-hidden p-3 sm:p-6">
      <div className="mb-2 flex items-center justify-between px-1">
        <motion.span
          key={String(flow)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`chip ${backward ? "!bg-amber-500/15 !text-amber-700 dark:!text-amber-400" : "!bg-sky-500/15 !text-sky-700 dark:!text-sky-400"}`}
        >
          {backward
            ? t({ en: "← backward: blame flows back", de: "← rückwärts: Schuld fließt zurück" })
            : t({ en: "forward: numbers flow in →", de: "vorwärts: Zahlen fließen hinein →" })}
        </motion.span>
        <span className="hidden text-xs text-zinc-400 sm:inline">
          {t({ en: "hover any neuron or wire", de: "fahr über ein Neuron oder eine Leitung" })}
        </span>
      </div>
      <NetworkDiagram
        net={ctx.net}
        cache={ctx.c}
        grads={ctx.g}
        target={ctx.sample.y}
        flow={flow}
        display={{
          loss: true,
          deltaOut: backward,
          hiddenBlame: backward ? "delta" : "none",
          gradTicks: backward ? "all" : "none",
        }}
      />
      <Legend className="mt-3 justify-center" />
    </motion.div>
  );
};

const ROADMAP: { n: string; title: Tr<string>; text: Tr<string>; tone: string }[] = [
  {
    n: "1",
    title: { en: "Guess", de: "Schätzen" },
    text: {
      en: "Feed an example in and let the network make a guess.",
      de: "Ein Beispiel hineingeben und das Netz raten lassen.",
    },
    tone: "bg-sky-500",
  },
  {
    n: "2",
    title: { en: "Score", de: "Bewerten" },
    text: {
      en: "Measure how wrong the guess was with a single penalty number.",
      de: "Mit einer einzigen Strafzahl messen, wie falsch die Schätzung war.",
    },
    tone: "bg-zinc-500",
  },
  {
    n: "3",
    title: { en: "Blame", de: "Schuld verteilen" },
    text: {
      en: "Walk backwards and work out how much each weight caused the mistake.",
      de: "Rückwärts gehen und herausfinden, wie viel jedes Gewicht zum Fehler beigetragen hat.",
    },
    tone: "bg-amber-500",
  },
  {
    n: "4",
    title: { en: "Adjust", de: "Anpassen" },
    text: {
      en: "Turn every weight a little in the direction that reduces the penalty.",
      de: "Jedes Gewicht ein bisschen in die Richtung drehen, die die Strafe senkt.",
    },
    tone: "bg-emerald-500",
  },
];

/** The whole algorithm in four plain-language steps, plus an everyday analogy. */
const Roadmap: React.FC = () => {
  const t = useT();
  return (
    <motion.div variants={itemVariants} className="mt-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ROADMAP.map((r, i) => (
          <div key={r.n} className="card relative p-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${r.tone}`}
              >
                {r.n}
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white">{t(r.title)}</span>
              {i < ROADMAP.length - 1 && (
                <span className="ml-auto hidden text-zinc-300 dark:text-zinc-600 lg:inline">→</span>
              )}
            </div>
            <p className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">{t(r.text)}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        {t({
          en: "Think of a mixing desk with 13 knobs and a song that sounds wrong. Backpropagation tells you, for every knob at once, which way to turn it and how much it matters. Then you repeat until the song sounds right.",
          de: "Stell dir ein Mischpult mit 13 Reglern vor und einen Song, der falsch klingt. Backpropagation sagt dir für jeden Regler gleichzeitig, in welche Richtung du ihn drehen musst und wie wichtig er ist. Das wiederholst du, bis der Song richtig klingt.",
        })}
      </p>
    </motion.div>
  );
};

const Takeaway: React.FC<{ n: string; title: string; children: React.ReactNode }> = ({
  n,
  title,
  children,
}) => (
  <motion.div variants={itemVariants} className="card p-5">
    <div className="mb-1 font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500">{n}</div>
    <h3 className="mb-1.5 font-semibold text-zinc-900 dark:text-white">{title}</h3>
    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{children}</p>
  </motion.div>
);

const BackpropContent: React.FC = () => {
  const { lang } = useLang();
  const t = useT();
  const de = lang === "de";
  const net = useMemo(() => initNet(DEFAULT_SEED), []);
  const [sampleIdx, setSampleIdx] = useState(2);

  const ctx: StepCtx = useMemo(() => {
    const sample = XOR[sampleIdx];
    const c = forward(net, sample.x);
    const g = backward(net, c, sample.y);
    return { net, sample, c, g, next: applyGrads(net, g, DEMO_LR), lr: DEMO_LR };
  }, [net, sampleIdx]);

  const rail = useMemo(
    () => [
      { id: "network", label: t({ en: "01 The network", de: "01 Das Netz" }) },
      { id: "forward", label: t({ en: "02 Guess", de: "02 Schätzen" }), tone: "bg-sky-500" },
      { id: "loss", label: t({ en: "03 Score", de: "03 Bewerten" }), tone: "bg-zinc-500" },
      { id: "backward", label: t({ en: "04 Blame", de: "04 Schuld" }), tone: "bg-amber-500" },
      {
        id: "chain-rule",
        label: t({ en: "05 Chain rule", de: "05 Kettenregel" }),
        tone: "bg-amber-500",
      },
      { id: "update", label: t({ en: "06 Adjust", de: "06 Anpassen" }), tone: "bg-emerald-500" },
      { id: "playground", label: t({ en: "07 Playground", de: "07 Spielwiese" }) },
      { id: "recap", label: t({ en: "08 Recap", de: "08 Zusammenfassung" }) },
    ],
    [t],
  );

  return (
    <div className="pb-8">
      <ProgressRail items={rail} />

      {/* ------------------------------------------------------------ hero */}
      <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
        <motion.div variants={itemVariants} className="mb-4 flex items-center gap-2">
          <span className="chip">
            <Brain size={12} weight="fill" />{" "}
            {t({ en: "Interactive explainer", de: "Interaktive Erklärung" })}
          </span>
          <span className="chip">~15 min</span>
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
        >
          {t({ en: "Backpropagation, visualized.", de: "Backpropagation, sichtbar gemacht." })}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg"
        >
          {de ? (
            <>
              Wie lernt ein neuronales Netz aus seinen Fehlern? Wir nehmen ein winziges Netz mit nur{" "}
              <b>13 Zahlen</b> darin, verfolgen ein Beispiel hindurch und rechnen genau aus, wie
              sich jede Zahl ändern sollte. Kein Mathe-Vorwissen nötig: Jedes Symbol wird dort
              erklärt, wo es auftaucht, und der Button <b>Symbole</b> unten rechts hilft, wenn du
              eins vergisst.
            </>
          ) : (
            <>
              How does a neural network learn from its mistakes? We take a tiny network with just{" "}
              <b>13 numbers</b> inside, follow one example through it, and work out exactly how each
              number should change. No math background needed: every symbol is explained right where
              it shows up, and the <b>Symbols</b> button in the corner is always there if you forget
              one.
            </>
          )}
        </motion.p>
        <motion.div variants={itemVariants} className="mt-6 mb-8 flex flex-wrap gap-2">
          <a href="#network" className="btn-primary">
            <ArrowDown size={14} weight="bold" />{" "}
            {t({ en: "Start the walkthrough", de: "Rundgang starten" })}
          </a>
          <a href="#playground" className="btn">
            <Lightning size={14} weight="fill" />{" "}
            {t({ en: "Skip to the playground", de: "Direkt zur Spielwiese" })}
          </a>
        </motion.div>
        <HeroNetwork ctx={ctx} />
        <Roadmap />
      </motion.div>

      {/* ------------------------------------------------------------ 01 network */}
      <Section id="network" className="mb-20">
        <PageHeader
          number="01"
          title={t({ en: "The network", de: "Das Netz" })}
          subtitle={t({
            en: "Two inputs, three hidden neurons, one output",
            de: "Zwei Eingaben, drei versteckte Neuronen, ein Ausgang",
          })}
          variants={itemVariants}
        />
        <Prose className="mb-6">
          {de ? (
            <>
              <p>
                Ein neuronales Netz besteht aus <b>Neuronen</b>. Ein Neuron nimmt ein paar Zahlen
                entgegen, multipliziert jede mit ihrem eigenen <b>Gewicht</b> (wie wichtig ihm diese
                Eingabe ist), addiert einen <b>Bias</b> (einen festen Schubs) und schickt das
                Ergebnis durch eine Stauchkurve.
              </p>
              <p>
                Auf dieser Seite ist jedes Neuron eine kleine Karte, und seine Gewichte stehen als{" "}
                <b>Vektor</b> darauf. Ein Vektor ist einfach eine{" "}
                <b>Liste von Zahlen in Klammern</b>, etwa <F>[1.20 −0.80 │ 0.30]</F>: zuerst die
                Gewichte, hinter dem Strich der Bias. Blaue Zahlen sind positiv, rote negativ.
                Probier eins aus:
              </p>
            </>
          ) : (
            <>
              <p>
                A neural network is built from <b>neurons</b>. A neuron takes in a few numbers,
                multiplies each one by its own <b>weight</b> (how much it cares about that input),
                adds a <b>bias</b> (a fixed nudge), and pushes the result through a squashing curve.
              </p>
              <p>
                On this page every neuron is drawn as a small card, and its weights are written on
                it as a <b>vector</b>. A vector is just a <b>list of numbers in brackets</b>, like{" "}
                <F>[1.20 −0.80 │ 0.30]</F>: first the weights, then, behind the divider, the bias.
                Blue numbers are positive, red ones negative. Play with one:
              </p>
            </>
          )}
        </Prose>
        <NeuronAnatomy />
        <Prose className="mt-10 mb-6">
          <p>
            {de ? (
              <>
                Unser Netz soll <b>XOR</b> lernen. Das ist winzig, lässt sich aber ohne versteckte
                Schicht nicht lösen und ist damit der perfekte Test.
              </>
            ) : (
              <>
                Our network has to learn <b>XOR</b>. It&apos;s tiny, but it can&apos;t be solved
                without a hidden layer, so it&apos;s the perfect test.
              </>
            )}
          </p>
        </Prose>
        <XorCard />
        <Prose className="mt-6 mb-4">
          <p>
            {de ? (
              <>
                Insgesamt hat das Netz <F>3 × 2</F> versteckte Gewichte + <F>3</F> versteckte Biases
                + <F>3</F> Ausgangsgewichte + <F>1</F> Ausgangsbias = <b>13 Parameter</b>. Schreibt
                man alle hintereinander, ist das ganze Netz ein einziger Vektor mit 13 Zahlen. Am
                Anfang sind sie zufällig. Training heißt: 13 Zahlen finden, mit denen das Netz für
                alle vier Zeilen das Richtige sagt.
              </>
            ) : (
              <>
                In total the network has <F>3 × 2</F> hidden weights + <F>3</F> hidden biases +{" "}
                <F>3</F> output weights + <F>1</F> output bias = <b>13 parameters</b>. Write them
                all in a row and the whole network is a single vector of 13 numbers. They all start
                random. Training means: find 13 numbers that make the network say the right thing
                for all four rows.
              </>
            )}
          </p>
        </Prose>
        <motion.div variants={itemVariants} className="card mb-6 p-4 sm:p-5">
          <ParamVector
            groups={flattenNet(net)}
            title={t({
              en: "The whole network as one vector (random start values)",
              de: "Das ganze Netz als ein Vektor (zufällige Startwerte)",
            })}
          />
          <p className="mt-3 text-[12.5px] text-zinc-500 dark:text-zinc-400">
            {t({
              en: "An LLM like ChatGPT is exactly this, just with billions of numbers instead of 13.",
              de: "Ein LLM wie ChatGPT ist genau das, nur mit Milliarden Zahlen statt 13.",
            })}{" "}
            <a href="/llm" className="font-semibold text-zinc-900 underline dark:text-white">
              {t({ en: "How LLMs work →", de: "Wie LLMs funktionieren →" })}
            </a>
          </p>
        </motion.div>
        <Prose className="mb-6">
          <p>
            {de
              ? "Hier sind alle Symbole, die dir begegnen. Auswendig lernen ist nicht nötig: Sie werden dort erklärt, wo sie auftauchen, und der Button Symbole (unten rechts) holt diese Liste jederzeit zurück."
              : "Here are all the symbols you'll meet. No need to memorize them: they're explained again where they appear, and the Symbols button (bottom right) brings this list back at any time."}
          </p>
        </Prose>
        <Glossary symbols={BACKPROP_SYMBOLS} />
      </Section>

      {/* ------------------------------------------------------------ 02 forward */}
      <Section id="forward" className="mb-20">
        <PageHeader
          number="02"
          title={t({ en: "Forward pass", de: "Vorwärtsdurchlauf" })}
          subtitle={t({
            en: "From inputs to a prediction",
            de: "Von den Eingaben zur Vorhersage",
          })}
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            {de ? (
              <>
                Bevor das Netz lernen kann, muss es raten. Klick dich mit <b>Weiter</b> durch die
                Schritte. Jede Zahl ist echt und wird live berechnet.
              </>
            ) : (
              <>
                Before the network can learn, it has to make a guess. Click through the steps with{" "}
                <b>Next</b>. Every number is real and computed live.
              </>
            )}
          </p>
        </Prose>
        <Walkthrough
          stepKeys={["input", "z1", "h", "out"]}
          ctx={ctx}
          sampleIdx={sampleIdx}
          onSampleChange={setSampleIdx}
          startNumber={stepNo("input")}
        />
      </Section>

      {/* ------------------------------------------------------------ 03 loss */}
      <Section id="loss" className="mb-20">
        <PageHeader
          number="03"
          title={t({ en: "Measuring the error", de: "Den Fehler messen" })}
          subtitle={t({
            en: "One number that says how wrong we are",
            de: "Eine Zahl, die sagt, wie falsch wir liegen",
          })}
          variants={itemVariants}
        />
        <Walkthrough
          stepKeys={["loss"]}
          ctx={ctx}
          sampleIdx={sampleIdx}
          onSampleChange={setSampleIdx}
          startNumber={stepNo("loss")}
        />
      </Section>

      {/* ------------------------------------------------------------ 04 backward */}
      <Section id="backward" className="mb-20">
        <PageHeader
          number="04"
          title={t({ en: "Backward pass", de: "Rückwärtsdurchlauf" })}
          subtitle={t({
            en: "Handing out the blame, layer by layer",
            de: "Die Schuld verteilen, Schicht für Schicht",
          })}
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            {de ? (
              <>
                Jetzt weiß das Netz, <i>dass</i> es falsch lag. Als Nächstes muss es herausfinden,{" "}
                <i>welche Regler</i> den Fehler verursacht haben und in welche Richtung sie gedreht
                werden müssen. Dazu läuft es von der Strafe aus rückwärts und gibt jedem Neuron
                seinen Anteil an der Schuld. Achte auf die gelben Impulse, die von rechts nach links
                wandern.
              </>
            ) : (
              <>
                Now the network knows <i>that</i> it was wrong. Next it has to find out{" "}
                <i>which knobs</i> caused the mistake, and which way to turn them. It does this by
                walking backwards from the penalty and handing each neuron its share of the blame.
                Watch the amber pulses travel from right to left.
              </>
            )}
          </p>
        </Prose>
        <Walkthrough
          stepKeys={["delta2", "dv", "dH", "dw"]}
          ctx={ctx}
          sampleIdx={sampleIdx}
          onSampleChange={setSampleIdx}
          startNumber={stepNo("delta2")}
        />
      </Section>

      {/* ------------------------------------------------------------ 05 chain rule */}
      <Section id="chain-rule" className="mb-20">
        <PageHeader
          number="05"
          title={t({ en: "Why it works: the chain rule", de: "Warum es klappt: die Kettenregel" })}
          subtitle={t({
            en: "The one idea behind the backward pass",
            de: "Die eine Idee hinter dem Rückwärtsdurchlauf",
          })}
          variants={itemVariants}
        />
        <Prose className="mb-6">
          {de ? (
            <>
              <p>
                Im Rückwärtsdurchlauf haben wir ständig <i>multipliziert</i>: Fehler × Gewicht ×
                Steilheit × Eingabe. Warum multiplizieren? Denk an Zahnräder: Dreht Rad A das Rad B{" "}
                <b>2×</b> so schnell und B das Rad C <b>3×</b> so schnell, dann dreht A das Rad C{" "}
                <b>2 × 3 = 6×</b> so schnell.
              </p>
              <p>
                Ein Gewicht tief im Netz funktioniert genauso. Es erreicht die Strafe nur über eine
                Kette von Schritten, und seine Gesamtwirkung ist das Produkt der Wirkungen jedes
                Glieds. Wähle ein Gewicht und schau zu, wie die Kette entsteht:
              </p>
            </>
          ) : (
            <>
              <p>
                In the backward pass we kept <i>multiplying</i> things: error × weight × steepness ×
                input. Why multiply? Think of gears: if gear A turns gear B <b>2×</b> as fast, and B
                turns C <b>3×</b> as fast, then A turns C <b>2 × 3 = 6×</b> as fast.
              </p>
              <p>
                A weight deep inside the network works the same way. It only reaches the penalty
                through a chain of steps, and its total effect is the product of the effects of each
                link. Pick a weight and watch the chain build up:
              </p>
            </>
          )}
        </Prose>
        <ChainRule ctx={ctx} />
      </Section>

      {/* ------------------------------------------------------------ 06 update */}
      <Section id="update" className="mb-20">
        <PageHeader
          number="06"
          title={t({ en: "Gradient descent", de: "Gradientenabstieg" })}
          subtitle={t({
            en: "Using the gradients to actually learn",
            de: "Mit den Gradienten tatsächlich lernen",
          })}
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            {de ? (
              <>
                Stell dir die Strafe als Landschaft aus Hügeln und Tälern vor, und wir wollen ganz
                nach unten. Ein Gradient sagt uns, wo es <i>bergauf</i> geht, also gehen wir in die
                andere Richtung. Hier ist diese Idee für ein einzelnes Gewicht:
              </>
            ) : (
              <>
                Imagine the penalty as a landscape of hills and valleys, and we want to get to the
                bottom. A gradient tells us which way is <i>uphill</i>, so we step the other way.
                Here is that idea for one single weight:
              </>
            )}
          </p>
        </Prose>
        <DescentDemo net={net} />
        <Prose className="mt-10 mb-6">
          <p>
            {de
              ? "Und hier derselbe Schritt für alle 13 Regler auf einmal:"
              : "And here is the same step for all 13 knobs at once:"}
          </p>
        </Prose>
        <Walkthrough
          stepKeys={["update"]}
          ctx={ctx}
          sampleIdx={sampleIdx}
          onSampleChange={setSampleIdx}
          startNumber={stepNo("update")}
        />
      </Section>

      {/* ------------------------------------------------------------ 07 playground */}
      <Section id="playground" className="mb-20">
        <PageHeader
          number="07"
          title={t({ en: "Playground", de: "Spielwiese" })}
          subtitle={t({ en: "Now let it train", de: "Jetzt trainieren lassen" })}
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            {de ? (
              <>
                Training sind einfach die Schritte 1 bis 10 in Dauerschleife. Drück auf{" "}
                <b>Trainieren</b> und schau zu, wie sich die Zahlen in den Vektoren ändern, der Loss
                sinkt und das Bild des Netzes vom Eingaberaum sich biegt, bis beide 1-Ecken in einem
                Farbton liegen und beide 0-Ecken im anderen.
              </>
            ) : (
              <>
                Training is just steps 1 to 10 on repeat. Hit <b>Train</b> and watch the numbers in
                the vectors change, the loss drop, and the network&apos;s picture of the input space
                bend until both 1-corners sit in one shade and both 0-corners in the other.
              </>
            )}
          </p>
        </Prose>
        <Playground />
      </Section>

      {/* ------------------------------------------------------------ recap */}
      <Section id="recap" className="mb-8">
        <PageHeader
          number="08"
          title={t({ en: "Recap", de: "Zusammenfassung" })}
          variants={itemVariants}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Takeaway n="01" title={t({ en: "Forward: make a guess", de: "Vorwärts: schätzen" })}>
            {t({
              en: "Each neuron multiplies its inputs by its weights, adds them up plus a bias, and squashes the result. Layer by layer this turns the inputs into a guess.",
              de: "Jedes Neuron multipliziert seine Eingaben mit seinen Gewichten, addiert alles plus Bias und staucht das Ergebnis. Schicht für Schicht wird so aus den Eingaben eine Schätzung.",
            })}
          </Takeaway>
          <Takeaway
            n="02"
            title={t({ en: "Loss: score the guess", de: "Loss: die Schätzung bewerten" })}
          >
            {t({
              en: "A single penalty number measures how wrong the guess is. Learning means making this number small.",
              de: "Eine einzige Strafzahl misst, wie falsch die Schätzung ist. Lernen heißt, diese Zahl klein zu machen.",
            })}
          </Takeaway>
          <Takeaway
            n="03"
            title={t({ en: "Backward: share the blame", de: "Rückwärts: Schuld verteilen" })}
          >
            {t({
              en: "Starting from the penalty, an error signal is passed backwards through each layer. A weight's blame (gradient) = its neuron's error signal × the input on its wire.",
              de: "Von der Strafe aus wird ein Fehlersignal rückwärts durch jede Schicht gereicht. Die Schuld eines Gewichts (Gradient) = Fehlersignal seines Neurons × Eingabe auf seiner Leitung.",
            })}
          </Takeaway>
          <Takeaway n="04" title={t({ en: "Update: step downhill", de: "Update: bergab gehen" })}>
            {t({
              en: "Every weight is turned a little in the direction that lowers the penalty. Repeat hundreds or thousands of times. That's how all modern neural networks learn, from this toy to LLMs.",
              de: "Jedes Gewicht wird ein bisschen in die Richtung gedreht, die die Strafe senkt. Das hunderte oder tausende Male wiederholen. So lernen alle modernen neuronalen Netze, von diesem Spielzeug bis zu LLMs.",
            })}
          </Takeaway>
        </div>
        <motion.a
          variants={itemVariants}
          href="/llm"
          className="card group mt-6 flex items-center justify-between gap-4 p-5 transition-colors hover:border-zinc-400 dark:hover:border-zinc-500"
        >
          <div>
            <div className="eyebrow mb-1">
              {t({ en: "Next explainer", de: "Nächste Erklärung" })}
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white">
              {t({
                en: "How large language models work",
                de: "Wie große Sprachmodelle funktionieren",
              })}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {t({
                en: "Tokens, vectors, attention, and the same learning trick at a giant scale.",
                de: "Tokens, Vektoren, Attention und derselbe Lerntrick im riesigen Maßstab.",
              })}
            </div>
          </div>
          <ArrowRight
            size={22}
            weight="bold"
            className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-white"
          />
        </motion.a>
      </Section>

      <Footer />
      <LangToggle />
      <SymbolsButton symbols={BACKPROP_SYMBOLS} />
    </div>
  );
};

const Backprop: React.FC = () => (
  <LangProvider>
    <BackpropContent />
  </LangProvider>
);

export default Backprop;
