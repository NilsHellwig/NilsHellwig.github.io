"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LECTURES } from "../data/lectures";
import Lecture from "../components/Lecture";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Lectures: React.FC = () => {
  const [activeTerm, setActiveTerm] = useState<string>("All");

  const terms = useMemo(() => {
    const unique = Array.from(new Set(LECTURES.map((l) => l.term)));
    return ["All", ...unique];
  }, []);

  const getTermCount = (term: string) =>
    term === "All" ? LECTURES.length : LECTURES.filter((l) => l.term === term).length;

  const filteredLectures = useMemo(
    () => (activeTerm === "All" ? LECTURES : LECTURES.filter((l) => l.term === activeTerm)),
    [activeTerm],
  );

  return (
    <motion.div className="pb-8" initial="hidden" animate="visible" variants={containerVariants}>
      <PageHeader
        number="01"
        title="Lectures"
        subtitle="University courses and teaching materials"
        variants={itemVariants}
      />

      {/* Term filter */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
        {terms.map((term) => (
          <button
            key={term}
            onClick={() => setActiveTerm(term)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border-[0.5px]
              ${
                activeTerm === term
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
          >
            {term}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums
                ${activeTerm === term ? "bg-white/20 dark:bg-zinc-900/20" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"}`}
            >
              {getTermCount(term)}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Lectures list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTerm}
          className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          {filteredLectures.map((lecture, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Lecture lecture={lecture} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
};

export default Lectures;
