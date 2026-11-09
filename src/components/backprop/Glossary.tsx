"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, X } from "@phosphor-icons/react";
import { itemVariants } from "./ui";
import { type Tr, useT } from "../explainer/i18n";

export interface GlossaryEntry {
  sym: string;
  name: Tr<string>;
  meaning: Tr<string>;
}

export const BACKPROP_SYMBOLS: GlossaryEntry[] = [
  {
    sym: "[ … ]",
    name: { en: "vector", de: "Vektor" },
    meaning: {
      en: "Just a list of numbers in brackets. Each neuron keeps its weights and bias in one: [w₁ w₂ │ b].",
      de: "Einfach eine Liste von Zahlen in Klammern. Jedes Neuron speichert seine Gewichte und seinen Bias darin: [w₁ w₂ │ b].",
    },
  },
  {
    sym: "x₁, x₂",
    name: { en: "inputs", de: "Eingaben" },
    meaning: {
      en: "The two numbers we feed in (each 0 or 1 here).",
      de: "Die zwei Zahlen, die wir hineingeben (hier jeweils 0 oder 1).",
    },
  },
  {
    sym: "y",
    name: { en: "answer", de: "Antwort" },
    meaning: {
      en: "The correct answer for this example: what the network should say.",
      de: "Die richtige Antwort für dieses Beispiel: was das Netz sagen sollte.",
    },
  },
  {
    sym: "w, v",
    name: { en: "weights", de: "Gewichte" },
    meaning: {
      en: "Adjustable knobs. A weight says how strongly a neuron listens to one of its inputs. Positive = pushes up, negative = pulls down. w belongs to the hidden neurons, v to the output.",
      de: "Einstellbare Regler. Ein Gewicht sagt, wie stark ein Neuron auf eine seiner Eingaben hört. Positiv = drückt nach oben, negativ = zieht nach unten. w gehört zu den versteckten Neuronen, v zum Ausgang.",
    },
  },
  {
    sym: "b, c",
    name: { en: "bias", de: "Bias" },
    meaning: {
      en: "One extra knob per neuron: a fixed nudge added to its score, regardless of the input.",
      de: "Ein zusätzlicher Regler pro Neuron: ein fester Schubs, der immer zur Punktzahl addiert wird, egal was hereinkommt.",
    },
  },
  {
    sym: "θ",
    name: { en: "parameters", de: "Parameter" },
    meaning: {
      en: "All weights and biases together. Our network has 13 of them. Training = finding good values for all of them.",
      de: "Alle Gewichte und Biases zusammen. Unser Netz hat 13 davon. Training = für alle gute Werte finden.",
    },
  },
  {
    sym: "z",
    name: { en: "score", de: "Punktzahl" },
    meaning: {
      en: "A neuron's raw score: every input times its weight, all added up, plus the bias.",
      de: "Die rohe Punktzahl eines Neurons: jede Eingabe mal ihr Gewicht, alles addiert, plus Bias.",
    },
  },
  {
    sym: "tanh",
    name: { en: "squashing curve", de: "Stauchkurve" },
    meaning: {
      en: "Turns a hidden neuron's score into a value between −1 and +1.",
      de: "Macht aus der Punktzahl eines versteckten Neurons einen Wert zwischen −1 und +1.",
    },
  },
  {
    sym: "h",
    name: { en: "hidden output", de: "versteckte Ausgabe" },
    meaning: {
      en: "What a hidden neuron passes on after squashing its score.",
      de: "Was ein verstecktes Neuron weitergibt, nachdem es seine Punktzahl gestaucht hat.",
    },
  },
  {
    sym: "σ",
    name: { en: "sigmoid", de: "Sigmoid" },
    meaning: {
      en: "The output's squashing curve (Greek letter “sigma”). It turns the score into a value between 0 and 1.",
      de: "Die Stauchkurve des Ausgangs (griechisch „Sigma“). Sie macht aus der Punktzahl einen Wert zwischen 0 und 1.",
    },
  },
  {
    sym: "ŷ",
    name: { en: "guess", de: "Schätzung" },
    meaning: {
      en: "The network's prediction (“y-hat”). The hat means “estimate of y”.",
      de: "Die Vorhersage des Netzes („y-Dach“). Das Dach bedeutet „Schätzung für y“.",
    },
  },
  {
    sym: "L",
    name: { en: "loss", de: "Loss (Strafe)" },
    meaning: {
      en: "A penalty for the guess: 0 if it is perfect, large if it is confidently wrong.",
      de: "Eine Strafe für die Schätzung: 0, wenn sie perfekt ist, groß, wenn sie selbstsicher falsch ist.",
    },
  },
  {
    sym: "δ",
    name: { en: "error signal", de: "Fehlersignal" },
    meaning: {
      en: "Greek “delta”. A neuron's share of the blame: how much, and in which direction, its score should change.",
      de: "Griechisch „Delta“. Der Schuldanteil eines Neurons: wie stark und in welche Richtung sich seine Punktzahl ändern sollte.",
    },
  },
  {
    sym: "∂L/∂w",
    name: { en: "gradient", de: "Gradient" },
    meaning: {
      en: "Read: “how the loss reacts to w”. If you turn knob w up a tiny bit, does the loss go up (+) or down (−), and how strongly?",
      de: "Lies: „wie der Loss auf w reagiert“. Wenn man Regler w ein winziges Stück aufdreht: steigt der Loss (+) oder sinkt er (−), und wie stark?",
    },
  },
  {
    sym: "η",
    name: { en: "learning rate", de: "Lernrate" },
    meaning: {
      en: "Greek “eta”. How big a step each weight takes when we update it.",
      de: "Griechisch „Eta“. Wie groß der Schritt ist, den jedes Gewicht beim Aktualisieren macht.",
    },
  },
  {
    sym: "· and ×",
    name: { en: "multiply", de: "mal" },
    meaning: { en: "Both just mean multiplication.", de: "Beides heißt einfach „mal“." },
  },
  {
    sym: "₁ ₂ ₃",
    name: { en: "small numbers", de: "kleine Zahlen" },
    meaning: {
      en: "Just name tags. h₂ is “hidden neuron number 2”, w₁₂ is “neuron 1's weight for input 2”.",
      de: "Nur Namensschilder. h₂ ist „verstecktes Neuron Nummer 2“, w₁₂ ist „Gewicht von Neuron 1 für Eingabe 2“.",
    },
  },
];

const SymbolCard: React.FC<GlossaryEntry> = ({ sym, name, meaning }) => {
  const t = useT();
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/70">
      <div className="flex h-9 min-w-[3.25rem] shrink-0 items-center justify-center rounded-md bg-zinc-100 px-1.5 text-[14px] font-bold text-zinc-900 dark:bg-zinc-700/70 dark:text-white">
        {sym}
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-zinc-900 dark:text-white">{t(name)}</div>
        <div className="text-[12.5px] leading-snug text-zinc-500 dark:text-zinc-400">
          {t(meaning)}
        </div>
      </div>
    </div>
  );
};

/** Inline cheat sheet of every symbol / term used on the page. */
export const Glossary: React.FC<{ symbols: GlossaryEntry[] }> = ({ symbols }) => (
  <motion.div
    variants={itemVariants}
    className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
  >
    {symbols.map((s) => (
      <SymbolCard key={s.sym} {...s} />
    ))}
  </motion.div>
);

/** Floating button that opens the cheat sheet from anywhere on the page. */
export const SymbolsButton: React.FC<{ symbols: GlossaryEntry[]; label?: Tr<string> }> = ({
  symbols,
  label = { en: "Symbols", de: "Symbole" },
}) => {
  const t = useT();
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
        <BookOpenText size={16} weight="bold" /> {t(label)}
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
              aria-label={t({ en: "Cheat sheet", de: "Spickzettel" })}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-x-3 bottom-3 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[440px]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">
                    {t({ en: "Cheat sheet", de: "Spickzettel" })}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t({
                      en: "Every symbol and term on this page, in plain words.",
                      de: "Jedes Symbol und jeder Begriff dieser Seite, in einfachen Worten.",
                    })}
                  </div>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => setOpen(false)}
                  aria-label={t({ en: "Close", de: "Schließen" })}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {symbols.map((s) => (
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
