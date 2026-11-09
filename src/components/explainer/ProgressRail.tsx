"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export interface RailItem {
  id: string;
  label: string;
  /** Tailwind background class for the active dot. */
  tone?: string;
}

/**
 * Orientation aid for long explainers: a thin reading-progress bar at the very top,
 * and (on wide screens) a column of section dots on the left that tracks where you are.
 */
const ProgressRail: React.FC<{ items: RailItem[] }> = ({ items }) => {
  const [active, setActive] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        // The section crossing the upper third of the viewport is the current one.
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);

  const activeIdx = items.findIndex((it) => it.id === active);

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-40 h-[3px] origin-left bg-gradient-to-r from-sky-500 via-amber-500 to-emerald-500"
        style={{ scaleX }}
      />
      <nav
        aria-label="Sections"
        className="fixed top-1/2 left-4 z-20 hidden -translate-y-1/2 flex-col gap-2.5 xl:flex"
      >
        {items.map((it, i) => {
          const on = it.id === active;
          const done = activeIdx >= 0 && i < activeIdx;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="group relative flex items-center"
              aria-label={it.label}
            >
              <motion.span
                animate={{ width: on ? 12 : 8, height: on ? 12 : 8 }}
                className={`block rounded-full transition-colors ${
                  on
                    ? (it.tone ?? "bg-zinc-900 dark:bg-zinc-100")
                    : done
                      ? "bg-zinc-400 dark:bg-zinc-500"
                      : "bg-zinc-300 group-hover:bg-zinc-400 dark:bg-zinc-700"
                }`}
              />
              <span
                className={`pointer-events-none absolute left-5 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900`}
              >
                {it.label}
              </span>
            </a>
          );
        })}
      </nav>
    </>
  );
};

export default ProgressRail;
