"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LECTURES } from "../data/lectures";
import Lecture from "../components/Lecture";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import FilterPills from "../components/FilterPills";

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
      <FilterPills
        options={terms}
        active={activeTerm}
        onChange={setActiveTerm}
        getCount={getTermCount}
        variants={itemVariants}
        className="mb-6"
      />

      {/* Lectures list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTerm}
          className="flex flex-col gap-5"
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
