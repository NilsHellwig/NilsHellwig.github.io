"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { REVIEWING, SUPERVISION, TALKS } from "../data/service";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";

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

const TABLE_GRID = "sm:grid-cols-[minmax(0,1fr)_8.5rem_10rem_6.5rem] sm:gap-x-6";

const Service: React.FC = () => {
  return (
    <motion.div className="pb-8" initial="hidden" animate="visible" variants={containerVariants}>
      <PageHeader
        number="01"
        title="Reviewing"
        subtitle="Peer review for conferences, workshops, and journals in NLP and AI"
        variants={itemVariants}
      />

      <motion.div variants={containerVariants} className="mb-12" role="table">
        <div
          role="row"
          className={`hidden sm:grid ${TABLE_GRID} pb-2 border-b border-zinc-200 dark:border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500`}
        >
          <span role="columnheader">Venue</span>
          <span role="columnheader">Role</span>
          <span role="columnheader">Type</span>
          <span role="columnheader">Cycle</span>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {REVIEWING.map((entry) => (
            <motion.div
              key={`${entry.venue}-${entry.cycle}`}
              role="row"
              variants={itemVariants}
              className={`flex flex-col gap-1 sm:grid ${TABLE_GRID} sm:items-baseline py-4`}
            >
              <span role="cell">
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-zinc-900 dark:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
                >
                  {entry.venue}
                </a>
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400">
                Reviewer
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400">
                {entry.type}
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
                {entry.cycle}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <PageHeader
        number="02"
        title="Talks"
        subtitle="Invited and conference talks about my research"
        variants={itemVariants}
      />

      <motion.div variants={containerVariants} className="mb-12" role="table">
        <div
          role="row"
          className={`hidden sm:grid ${TABLE_GRID} pb-2 border-b border-zinc-200 dark:border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500`}
        >
          <span role="columnheader">Title</span>
          <span role="columnheader">Type</span>
          <span role="columnheader">Event</span>
          <span role="columnheader">Date</span>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {TALKS.map((talk) => (
            <motion.div
              key={talk.title}
              role="row"
              variants={itemVariants}
              className={`flex flex-col gap-1 sm:grid ${TABLE_GRID} sm:items-baseline py-4`}
            >
              <span role="cell">
                {talk.url ? (
                  <a
                    href={talk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-zinc-900 dark:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
                  >
                    {talk.title}
                  </a>
                ) : (
                  <span className="font-semibold text-zinc-900 dark:text-white">{talk.title}</span>
                )}
                {talk.subtitle && (
                  <span className="block text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {talk.subtitle}
                  </span>
                )}
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400">
                {talk.type}
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400">
                {talk.event}
                <span className="block text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {talk.host}
                </span>
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
                {talk.date}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <PageHeader
        number="03"
        title="Thesis Supervision"
        subtitle="Bachelor's and master's theses I supervised at the University of Regensburg"
        variants={itemVariants}
      />

      <motion.div variants={containerVariants} className="mb-12" role="table">
        <div
          role="row"
          className={`hidden sm:grid ${TABLE_GRID} pb-2 border-b border-zinc-200 dark:border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500`}
        >
          <span role="columnheader">Title</span>
          <span role="columnheader">Type</span>
          <span role="columnheader">Student</span>
          <span role="columnheader">Published</span>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {SUPERVISION.map((entry) => (
            <motion.div
              key={entry.title}
              role="row"
              variants={itemVariants}
              className={`flex flex-col gap-1 sm:grid ${TABLE_GRID} sm:items-baseline py-4`}
            >
              <span role="cell" className="font-semibold text-zinc-900 dark:text-white">
                {entry.title}
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400">
                {entry.type}
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400">
                {entry.student}
              </span>
              <span role="cell" className="text-sm text-zinc-500 dark:text-zinc-400">
                {entry.publishedIn ? (
                  <>
                    <a
                      href={entry.publishedIn.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
                    >
                      {entry.publishedIn.venue}
                    </a>
                    {entry.publishedIn.note && (
                      <span className="block text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {entry.publishedIn.note}
                      </span>
                    )}
                  </>
                ) : (
                  <span aria-label="not published">–</span>
                )}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Footer />
    </motion.div>
  );
};

export default Service;
