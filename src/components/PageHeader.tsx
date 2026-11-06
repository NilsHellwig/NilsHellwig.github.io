"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface PageHeaderProps {
  number: string;
  title: string;
  subtitle?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  variants?: Variants;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  number,
  title,
  subtitle,
  as: Heading = "h2",
  variants,
  className = "mb-6 mt-10",
}) => {
  return (
    <motion.div
      variants={variants}
      className={`border-b border-zinc-200 dark:border-zinc-700 pb-3 ${className}`}
    >
      <div className="flex items-baseline gap-2.5">
        <span className="text-base sm:text-lg font-mono font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
          {number}
        </span>
        <Heading className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {title}
        </Heading>
      </div>
      {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">{subtitle}</p>}
    </motion.div>
  );
};

export default PageHeader;
