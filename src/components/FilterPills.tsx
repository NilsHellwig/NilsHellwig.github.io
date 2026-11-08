"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

interface FilterPillsProps {
  options: string[];
  active: string;
  onChange: (option: string) => void;
  getCount: (option: string) => number;
  variants?: Variants;
  className?: string;
}

/** Row of filter pills with counts, shared by Projects, Publications and Lectures. */
const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  active,
  onChange,
  getCount,
  variants,
  className = "",
}) => (
  <motion.div variants={variants} className={`flex flex-wrap gap-2 ${className}`}>
    {options.map((option) => {
      const isActive = active === option;
      return (
        <button
          key={option}
          onClick={() => onChange(option)}
          aria-pressed={isActive}
          className={`inline-flex h-8 items-center gap-2 rounded-full border pl-3.5 pr-2 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
            isActive
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
              : "bg-white dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/70 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {option}
          <span
            className={`min-w-5 rounded-full px-1.5 py-px text-[11px] tabular-nums text-center ${
              isActive
                ? "bg-white/20 dark:bg-zinc-900/15"
                : "bg-zinc-100 dark:bg-zinc-700/70 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {getCount(option)}
          </span>
        </button>
      );
    })}
  </motion.div>
);

export default FilterPills;
