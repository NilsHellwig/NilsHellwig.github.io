"use client";

import React, { useMemo, useState } from "react";
import { PUBLICATIONS } from "../data/publications";
import { ArrowSquareOut, FilePdf, Medal } from "@phosphor-icons/react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import FilterPills from "../components/FilterPills";

const DOMAIN_STYLES: Record<string, { color: string; text: string; bg: string; hover: string }> = {
  "aclanthology.org": {
    color: "#ef4444",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    hover: "hover:bg-red-100 dark:hover:bg-red-900/40",
  },
  "sciencedirect.com": {
    color: "#f97316",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900/40",
  },
  "lrec.elra.info": {
    color: "#8b5cf6",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    hover: "hover:bg-violet-100 dark:hover:bg-violet-900/40",
  },
  "springer.com": {
    color: "#f59e0b",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    hover: "hover:bg-amber-100 dark:hover:bg-amber-900/40",
  },
  "ncbi.nlm.nih.gov": {
    color: "#14b8a6",
    text: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    hover: "hover:bg-teal-100 dark:hover:bg-teal-900/40",
  },
};

const fallbackDomain = {
  color: "#a1a1aa",
  text: "text-zinc-600 dark:text-zinc-400",
  bg: "bg-zinc-100 dark:bg-zinc-700",
  hover: "hover:bg-zinc-200 dark:hover:bg-zinc-600",
};

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1,
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Publications: React.FC = () => {
  const [activeYear, setActiveYear] = useState<string>("All");

  const years = useMemo(() => {
    const unique = Array.from(new Set(PUBLICATIONS.map((p) => String(p.year)))).sort(
      (a, b) => Number(b) - Number(a),
    );
    return ["All", ...unique];
  }, []);

  const getYearCount = (year: string) =>
    year === "All"
      ? PUBLICATIONS.length
      : PUBLICATIONS.filter((p) => String(p.year) === year).length;

  const filteredPublications = useMemo(
    () =>
      activeYear === "All"
        ? PUBLICATIONS
        : PUBLICATIONS.filter((p) => String(p.year) === activeYear),
    [activeYear],
  );

  return (
    <motion.div className="pb-8" initial="hidden" animate="visible" variants={containerVariants}>
      <PageHeader
        number="01"
        title="Publications"
        subtitle="Research in NLP, Computational Linguistics, and Sentiment Analysis. Code and data for each publication are publicly available on GitHub and referenced in the respective papers."
        variants={itemVariants}
      />

      {/* Year filter */}
      <FilterPills
        options={years}
        active={activeYear}
        onChange={setActiveYear}
        getCount={getYearCount}
        variants={itemVariants}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeYear}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          {filteredPublications.map((publication, index) => {
            const domain = DOMAIN_STYLES[publication.tooltipUrl] ?? fallbackDomain;

            return (
              <motion.div
                key={publication.name}
                variants={itemVariants}
                className="card overflow-hidden flex flex-col"
              >
                {/* Domain-colored top strip */}
                <div className="h-1 shrink-0" style={{ backgroundColor: domain.color }} />

                <div className="p-5 flex flex-col flex-1">
                  {/* Meta: source badge + year */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`chip font-semibold ${domain.bg} ${domain.text}`}>
                      {publication.tooltipUrl}
                    </span>
                    {publication.year && (
                      <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {publication.year}
                      </span>
                    )}
                    {publication.award && (
                      <span className="chip font-semibold bg-gradient-to-r from-slate-300 via-zinc-300 to-slate-400 dark:from-slate-500 dark:via-zinc-500 dark:to-slate-600 text-zinc-800 dark:text-zinc-50 shadow-xs">
                        <Medal size={12} weight="fill" />
                        {publication.award}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-white leading-snug mb-2">
                    {publication.name}
                  </h3>

                  {/* Conference */}
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-1">
                    {publication.conference}
                    {publication.pages && `, pp. ${publication.pages}`}
                  </p>

                  {/* Authors */}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {publication.authors}
                  </p>

                  {/* Footer buttons, pinned to bottom */}
                  <div className="mt-auto pt-4">
                    <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-700/70">
                      <a
                        href={publication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-colors duration-150 ${domain.bg} ${domain.hover} ${domain.text}`}
                      >
                        <ArrowSquareOut size={12} weight="bold" />
                        View
                      </a>
                      {publication.pdfUrl && (
                        <a
                          href={publication.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                        >
                          <FilePdf size={12} weight="bold" />
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </motion.div>
  );
};

export default Publications;
