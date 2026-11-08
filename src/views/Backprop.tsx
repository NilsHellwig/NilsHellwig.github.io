"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Brain, Lightning } from "@phosphor-icons/react";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import NetworkDiagram, { type Flow } from "../components/backprop/NetworkDiagram";
import Walkthrough from "../components/backprop/Walkthrough";
import ChainRule from "../components/backprop/ChainRule";
import DescentDemo from "../components/backprop/DescentDemo";
import Playground from "../components/backprop/Playground";
import { NeuronAnatomy, XorCard } from "../components/backprop/NeuronAnatomy";
import { Glossary, SymbolsButton } from "../components/backprop/Glossary";
import { STEPS, type StepCtx } from "../components/backprop/steps";
import {
  F,
  Legend,
  Prose,
  Section,
  itemVariants,
  sectionVariants,
} from "../components/backprop/ui";
import { DEFAULT_SEED, XOR, applyGrads, backward, forward, initNet } from "../lib/nn";

const DEMO_LR = 0.5;

const stepNo = (key: string) => STEPS.findIndex((s) => s.key === key) + 1;

/** The hero network breathes: a forward wave, then a backward wave, forever. */
const HeroNetwork: React.FC<{ ctx: StepCtx }> = ({ ctx }) => {
  const [flow, setFlow] = useState<Flow>("forward");
  useEffect(() => {
    const t = setInterval(() => setFlow((f) => (f === "forward" ? "backward" : "forward")), 3300);
    return () => clearInterval(t);
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
          {backward ? "← backward: blame flows back" : "forward: numbers flow in →"}
        </motion.span>
        <span className="hidden text-xs text-zinc-400 sm:inline">hover any neuron or wire</span>
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

const ROADMAP = [
  {
    n: "1",
    title: "Guess",
    text: "Feed an example in and let the network make a guess.",
    tone: "bg-sky-500",
  },
  {
    n: "2",
    title: "Score",
    text: "Measure how wrong the guess was with a single penalty number.",
    tone: "bg-zinc-500",
  },
  {
    n: "3",
    title: "Blame",
    text: "Walk backwards and work out how much each weight caused the mistake.",
    tone: "bg-amber-500",
  },
  {
    n: "4",
    title: "Adjust",
    text: "Turn every weight a little in the direction that reduces the penalty.",
    tone: "bg-emerald-500",
  },
];

/** The whole algorithm in four plain-language steps, plus an everyday analogy. */
const Roadmap: React.FC = () => (
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
            <span className="font-semibold text-zinc-900 dark:text-white">{r.title}</span>
            {i < ROADMAP.length - 1 && (
              <span className="ml-auto hidden text-zinc-300 dark:text-zinc-600 lg:inline">→</span>
            )}
          </div>
          <p className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">{r.text}</p>
        </div>
      ))}
    </div>
    <p className="mt-3 text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
      Think of a mixing desk with 13 knobs and a song that sounds wrong. Backpropagation tells you,
      for every knob at once, which way to turn it and how much it matters. Then you repeat until
      the song sounds right.
    </p>
  </motion.div>
);

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

const Backprop: React.FC = () => {
  const net = useMemo(() => initNet(DEFAULT_SEED), []);
  const [sampleIdx, setSampleIdx] = useState(2);

  const ctx: StepCtx = useMemo(() => {
    const sample = XOR[sampleIdx];
    const c = forward(net, sample.x);
    const g = backward(net, c, sample.y);
    return { net, sample, c, g, next: applyGrads(net, g, DEMO_LR), lr: DEMO_LR };
  }, [net, sampleIdx]);

  return (
    <div className="pb-8">
      {/* ------------------------------------------------------------ hero */}
      <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
        <motion.div variants={itemVariants} className="mb-4 flex items-center gap-2">
          <span className="chip">
            <Brain size={12} weight="fill" /> Interactive explainer
          </span>
          <span className="chip">~15 min</span>
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
        >
          Backpropagation, visualized.
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg"
        >
          How does a neural network learn from its mistakes? We take a tiny network with just{" "}
          <b>13 numbers</b> inside, follow one example through it, and work out exactly how each
          number should change. No math background needed: every symbol is explained right where it
          shows up, and the <b>Symbols</b> button in the corner is always there if you forget one.
        </motion.p>
        <motion.div variants={itemVariants} className="mt-6 mb-8 flex flex-wrap gap-2">
          <a href="#network" className="btn-primary">
            <ArrowDown size={14} weight="bold" /> Start the walkthrough
          </a>
          <a href="#playground" className="btn">
            <Lightning size={14} weight="fill" /> Skip to the playground
          </a>
        </motion.div>
        <HeroNetwork ctx={ctx} />
        <Roadmap />
      </motion.div>

      {/* ------------------------------------------------------------ 01 network */}
      <Section id="network" className="mb-20">
        <PageHeader
          number="01"
          title="The network"
          subtitle="Two inputs, three hidden neurons, one output"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            A neural network is built from <b>neurons</b>. A neuron takes in a few numbers,
            multiplies each one by its own <b>weight</b> (how much it cares about that input), adds
            a <b>bias</b> (a fixed nudge), and pushes the result through a squashing curve. On this
            page every neuron is drawn as a small card, and its weights are the little bars: bars
            going up are positive weights, bars going down are negative.
          </p>
          <p>Play with one:</p>
        </Prose>
        <NeuronAnatomy />
        <Prose className="mt-10 mb-6">
          <p>
            Our network has to learn <b>XOR</b>. It&apos;s tiny, but it can&apos;t be solved without
            a hidden layer, so it&apos;s the perfect test.
          </p>
        </Prose>
        <XorCard />
        <Prose className="mt-6">
          <p>
            In total the network has <F>3 × 2</F> hidden weights + <F>3</F> hidden biases + <F>3</F>{" "}
            output weights + <F>1</F> output bias = <b>13 parameters</b>. They all start random.
            Training means: find 13 numbers that make the network say the right thing for all four
            rows.
          </p>
          <p>
            Here are all the symbols you&apos;ll meet. No need to memorize them: they&apos;re
            explained again where they appear, and the <b>Symbols</b> button (bottom right) brings
            this list back at any time.
          </p>
        </Prose>
        <Glossary />
      </Section>

      {/* ------------------------------------------------------------ 02 forward */}
      <Section id="forward" className="mb-20">
        <PageHeader
          number="02"
          title="Forward pass"
          subtitle="From inputs to a prediction"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            Before the network can learn, it has to make a guess. Click through the steps with{" "}
            <b>Next</b>. Every number is real and computed live. Switch the example at the top right
            to follow a different row of XOR.
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
          title="Measuring the error"
          subtitle="One number that says how wrong we are"
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
          title="Backward pass"
          subtitle="Handing out the blame, layer by layer"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            Now the network knows <i>that</i> it was wrong. Next it has to find out{" "}
            <i>which knobs</i> caused the mistake, and which way to turn them. It does this by
            walking backwards from the penalty and handing each neuron its share of the blame. Watch
            the amber pulses travel from right to left.
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
          title="Why it works: the chain rule"
          subtitle="The one idea behind the backward pass"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            In the backward pass we kept <i>multiplying</i> things: error × weight × steepness ×
            input. Why multiply? Think of gears: if gear A turns gear B <b>2×</b> as fast, and B
            turns C <b>3×</b> as fast, then A turns C <b>2 × 3 = 6×</b> as fast.
          </p>
          <p>
            A weight deep inside the network works the same way. It only reaches the penalty through
            a chain of steps, and its total effect is the product of the effects of each link. Pick
            a weight and watch the chain build up:
          </p>
        </Prose>
        <ChainRule ctx={ctx} />
      </Section>

      {/* ------------------------------------------------------------ 06 update */}
      <Section id="update" className="mb-20">
        <PageHeader
          number="06"
          title="Gradient descent"
          subtitle="Using the gradients to actually learn"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            Imagine the penalty as a landscape of hills and valleys, and we want to get to the
            bottom. A gradient tells us which way is <i>uphill</i>, so we step the other way. Here
            is that idea for one single weight:
          </p>
        </Prose>
        <DescentDemo net={net} />
        <Prose className="mt-10 mb-6">
          <p>And here is the same step for all 13 knobs at once:</p>
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
          title="Playground"
          subtitle="Now let it train"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            Training is just steps 1 to 10 on repeat. Hit <b>Train</b> and watch the weight bars
            move, the loss drop, and the network&apos;s picture of the input space bend until both
            1-corners sit in one shade and both 0-corners in the other.
          </p>
        </Prose>
        <Playground />
      </Section>

      {/* ------------------------------------------------------------ recap */}
      <Section className="mb-8">
        <PageHeader number="08" title="Recap" variants={itemVariants} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Takeaway n="01" title="Forward: make a guess">
            Each neuron multiplies its inputs by its weights, adds them up plus a bias, and squashes
            the result. Layer by layer this turns the inputs into a guess.
          </Takeaway>
          <Takeaway n="02" title="Loss: score the guess">
            A single penalty number measures how wrong the guess is. Learning means making this
            number small.
          </Takeaway>
          <Takeaway n="03" title="Backward: share the blame">
            Starting from the penalty, an error signal is passed backwards through each layer. A
            weight&apos;s blame (gradient) = its neuron&apos;s error signal × the input on its wire.
          </Takeaway>
          <Takeaway n="04" title="Update: step downhill">
            Every weight is turned a little in the direction that lowers the penalty. Repeat
            hundreds or thousands of times. That&apos;s how all modern neural networks learn, from
            this toy to LLMs.
          </Takeaway>
        </div>
      </Section>

      <Footer />
      <SymbolsButton />
    </div>
  );
};

export default Backprop;
