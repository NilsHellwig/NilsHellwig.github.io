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
          number should change. No magic, just multiplication and a little calculus.
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
            A neural network is built from <b>neurons</b>. A neuron receives some numbers, weighs
            each one with its own <b>weight</b>, adds a <b>bias</b>, and bends the result through an
            activation function. On this page every neuron is drawn as a small card with its weight
            vector as a mini bar chart: bars up are positive weights, bars down are negative.
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
        </Prose>
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
            Before the network can learn, it has to make a guess. Click through the steps. Every
            number is real and computed live. Switch the example at the top right to follow a
            different row of XOR.
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

      {/* ------------------------------------------------------------ 04 chain rule */}
      <Section id="chain-rule" className="mb-20">
        <PageHeader
          number="04"
          title="The chain rule"
          subtitle="The one idea backprop is built on"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            We want to know how the loss changes when we wiggle one weight deep inside the network.
            That weight doesn&apos;t touch the loss directly. It changes a sum, which changes an
            activation, which changes the output, which changes the loss.
          </p>
          <p>
            Think of gears: if gear A turns gear B <b>2×</b> as fast, and B turns C <b>3×</b> as
            fast, then A turns C <b>2 × 3 = 6×</b> as fast. Derivatives along a chain multiply the
            same way.
          </p>
        </Prose>
        <ChainRule ctx={ctx} />
      </Section>

      {/* ------------------------------------------------------------ 05 backward */}
      <Section id="backward" className="mb-20">
        <PageHeader
          number="05"
          title="Backward pass"
          subtitle="Handing out the blame, layer by layer"
          variants={itemVariants}
        />
        <Prose className="mb-6">
          <p>
            Now the actual algorithm. Instead of writing a long chain for every weight, we walk
            backwards once and pass an error signal <F>δ</F> from layer to layer. Watch the amber
            pulses travel right to left.
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
            A gradient tells us which direction is <i>uphill</i> for the loss. To get better we walk
            the other way. Here is that idea for one single weight:
          </p>
        </Prose>
        <DescentDemo net={net} />
        <Prose className="mt-10 mb-6">
          <p>And here is the same step applied to all 13 parameters at once:</p>
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
            Each neuron takes a weighted sum of its inputs plus a bias and squashes it. Layer by
            layer this turns inputs into a prediction.
          </Takeaway>
          <Takeaway n="02" title="Loss: score the guess">
            A single number measures how wrong the prediction is. Learning means making this number
            small.
          </Takeaway>
          <Takeaway n="03" title="Backward: share the blame">
            Starting from the loss, the chain rule passes an error signal δ back through each layer.
            Each weight&apos;s gradient is its neuron&apos;s δ times the input on its wire.
          </Takeaway>
          <Takeaway n="04" title="Update: step downhill">
            Every weight moves a little against its gradient: w ← w − η·∂L/∂w. Repeat thousands of
            times. That&apos;s how all modern neural networks learn, from this toy to LLMs.
          </Takeaway>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default Backprop;
