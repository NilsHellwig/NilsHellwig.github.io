"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain } from "@phosphor-icons/react";
import Footer from "../components/Footer";
import { SymbolsButton } from "../components/backprop/Glossary";
import { itemVariants, sectionVariants } from "../components/backprop/ui";
import { LangProvider, LangToggle, useT } from "../components/explainer/i18n";
import LLMStory from "../components/llm/LLMStory";
import { LLM_SYMBOLS } from "../components/llm/symbols";

const LLMContent: React.FC = () => {
  const t = useT();
  return (
    <div className="pb-8">
      <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="mb-6">
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
          {t({ en: "How LLMs work, visualized.", de: "Wie LLMs funktionieren, sichtbar gemacht." })}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-4 flex max-w-2xl items-center gap-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg"
        >
          {t({
            en: "One real, tiny language model, from the first word to the next one. Read it from left to right.",
            de: "Ein echtes, winziges Sprachmodell, vom ersten Wort bis zum nächsten. Von links nach rechts lesen.",
          })}
          <ArrowRight size={18} weight="bold" className="shrink-0 text-zinc-400" />
        </motion.p>
      </motion.div>

      <LLMStory />

      <Footer />
      <LangToggle />
      <SymbolsButton symbols={LLM_SYMBOLS} label={{ en: "Terms", de: "Begriffe" }} />
    </div>
  );
};

const LLM: React.FC = () => (
  <LangProvider>
    <LLMContent />
  </LangProvider>
);

export default LLM;
