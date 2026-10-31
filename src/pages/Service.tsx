import React from "react";
import { motion } from "framer-motion";
import { REVIEWING } from "../data/service";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Service: React.FC = () => {
  return (
    <motion.div className="pb-8" initial="hidden" animate="visible" variants={containerVariants}>
      <PageHeader
        number="01"
        title="Reviewing"
        subtitle="Peer review for conferences, workshops, and journals in NLP and AI"
        variants={itemVariants}
      />

      <motion.ul
        className="divide-y divide-zinc-200 dark:divide-zinc-700 mb-12"
        variants={containerVariants}
      >
        {REVIEWING.map((entry) => (
          <motion.li
            key={`${entry.venue}-${entry.cycle}`}
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-4"
          >
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-900 dark:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
            >
              {entry.venue}
            </a>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
              Reviewer · {entry.type} · {entry.cycle}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <Footer />
    </motion.div>
  );
};

export default Service;
