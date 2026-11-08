"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

// Shared colour language for the backprop page:
//   positive weight → sky, negative weight → rose, gradient / blame → amber.
export const POS = "#0ea5e9"; // sky-500
export const NEG = "#f43f5e"; // rose-500
export const GRAD = "#f59e0b"; // amber-500

export const signColor = (v: number) => (v >= 0 ? POS : NEG);

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 20, staggerChildren: 0.08 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 20 } },
};

/** A page section that animates in once it scrolls into view. */
export const Section: React.FC<{ id?: string; children: React.ReactNode; className?: string }> = ({
  id,
  children,
  className = "",
}) => (
  <motion.section
    id={id}
    className={`scroll-mt-32 ${className}`}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    variants={sectionVariants}
  >
    {children}
  </motion.section>
);

export const Prose: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <motion.div
    variants={itemVariants}
    className={`space-y-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-3xl ${className}`}
  >
    {children}
  </motion.div>
);

/** Inline formula: math in Inter, so subscripts and symbols render cleanly. */
export const F: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={`whitespace-nowrap rounded-md bg-zinc-100 px-1.5 py-0.5 text-[0.92em] font-medium text-zinc-800 dark:bg-zinc-700/60 dark:text-zinc-100 ${className}`}
  >
    {children}
  </span>
);

/** Block formula line. */
export const FormulaBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`overflow-x-auto no-scrollbar rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 ${className}`}
  >
    {children}
  </div>
);

/** A number in mono, optionally coloured. */
export const N: React.FC<{
  children: React.ReactNode;
  tone?: "grad" | "pos" | "neg" | "plain";
}> = ({ children, tone = "plain" }) => {
  const cls =
    tone === "grad"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "pos"
        ? "text-sky-600 dark:text-sky-400"
        : tone === "neg"
          ? "text-rose-600 dark:text-rose-400"
          : "text-zinc-900 dark:text-white";
  return <span className={`font-mono tabular-nums font-semibold ${cls}`}>{children}</span>;
};

export const Legend: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 ${className}`}
  >
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: POS }} /> positive weight
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: NEG }} /> negative weight
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: GRAD }} /> gradient (blame)
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-[3px] w-5 rounded-full bg-zinc-400" /> thicker = larger |w|
    </span>
  </div>
);

export const Slider: React.FC<{
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: string;
}> = ({ label, value, min, max, step, onChange, display }) => (
  <label className="flex flex-col gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
    <span className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-mono tabular-nums text-zinc-900 dark:text-white">
        {display ?? value}
      </span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bp-range w-full"
    />
  </label>
);

export const Segmented = <T extends string | number>({
  options,
  value,
  onChange,
  render,
  className = "",
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  render?: (v: T) => React.ReactNode;
  className?: string;
}) => {
  const id = React.useId();
  return (
    <div
      className={`inline-flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 ${className}`}
    >
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={String(o)}
            onClick={() => onChange(o)}
            className={`relative h-7 cursor-pointer rounded-md px-2.5 text-xs font-semibold transition-colors ${
              active
                ? "text-white dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-md bg-zinc-900 dark:bg-zinc-100"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{render ? render(o) : String(o)}</span>
          </button>
        );
      })}
    </div>
  );
};
