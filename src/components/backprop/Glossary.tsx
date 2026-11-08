"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, X } from "@phosphor-icons/react";
import { itemVariants } from "./ui";

export const SYMBOLS: { sym: string; name: string; meaning: string }[] = [
  { sym: "x₁, x₂", name: "inputs", meaning: "The two numbers we feed in (each 0 or 1 here)." },
  {
    sym: "y",
    name: "answer",
    meaning: "The correct answer for this example: what the network should say.",
  },
  {
    sym: "w, v",
    name: "weights",
    meaning:
      "Adjustable knobs. A weight says how strongly a neuron listens to one of its inputs. Positive = pushes up, negative = pulls down. w belongs to the hidden neurons, v to the output.",
  },
  {
    sym: "b, c",
    name: "bias",
    meaning:
      "One extra knob per neuron: a fixed nudge added to its score, regardless of the input.",
  },
  {
    sym: "z",
    name: "score",
    meaning: "A neuron's raw score: every input times its weight, all added up, plus the bias.",
  },
  {
    sym: "tanh",
    name: "squashing curve",
    meaning: "Turns a hidden neuron's score into a value between −1 and +1.",
  },
  {
    sym: "h",
    name: "hidden output",
    meaning: "What a hidden neuron passes on after squashing its score.",
  },
  {
    sym: "σ",
    name: "sigmoid",
    meaning:
      "The output's squashing curve (Greek letter “sigma”). It turns the score into a value between 0 and 1.",
  },
  {
    sym: "ŷ",
    name: "guess",
    meaning: "The network's prediction (“y-hat”). The hat means “estimate of y”.",
  },
  {
    sym: "L",
    name: "loss",
    meaning: "A penalty for the guess: 0 if it is perfect, large if it is confidently wrong.",
  },
  {
    sym: "δ",
    name: "error signal",
    meaning:
      "Greek “delta”. A neuron's share of the blame: how much, and in which direction, its score should change.",
  },
  {
    sym: "∂L/∂w",
    name: "gradient",
    meaning:
      "Read: “how the loss reacts to w”. If you turn knob w up a tiny bit, does the loss go up (+) or down (−), and how strongly?",
  },
  {
    sym: "η",
    name: "learning rate",
    meaning: "Greek “eta”. How big a step each weight takes when we update it.",
  },
  {
    sym: "· and ×",
    name: "multiply",
    meaning: "Both just mean multiplication.",
  },
  {
    sym: "₁ ₂ ₃",
    name: "small numbers",
    meaning:
      "Just name tags. h₂ is “hidden neuron number 2”, w₁₂ is “neuron 1's weight for input 2”.",
  },
];

const SymbolCard: React.FC<(typeof SYMBOLS)[number]> = ({ sym, name, meaning }) => (
  <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/70">
    <div className="flex h-9 min-w-[3.25rem] shrink-0 items-center justify-center rounded-md bg-zinc-100 px-1.5 text-[14px] font-bold text-zinc-900 dark:bg-zinc-700/70 dark:text-white">
      {sym}
    </div>
    <div className="min-w-0">
      <div className="text-[13px] font-semibold text-zinc-900 dark:text-white">{name}</div>
      <div className="text-[12.5px] leading-snug text-zinc-500 dark:text-zinc-400">{meaning}</div>
    </div>
  </div>
);

/** Inline cheat sheet of every symbol used on the page. */
export const Glossary: React.FC = () => (
  <motion.div
    variants={itemVariants}
    className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
  >
    {SYMBOLS.map((s) => (
      <SymbolCard key={s.sym} {...s} />
    ))}
  </motion.div>
);

/** Floating button that opens the cheat sheet from anywhere on the page. */
export const SymbolsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white shadow-lg hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        <BookOpenText size={16} weight="bold" /> Symbols
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-zinc-900/30 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Symbol cheat sheet"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-x-3 bottom-3 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[440px]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">Symbol cheat sheet</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Every letter on this page, in plain words.
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {SYMBOLS.map((s) => (
                  <SymbolCard key={s.sym} {...s} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
