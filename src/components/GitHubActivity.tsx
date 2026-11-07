"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GithubLogo } from "@phosphor-icons/react";

// Contribution heatmap for the last year, drawn in the site's monochrome style.
// Data comes from a public, CORS-enabled proxy of GitHub's contribution calendar.

const USER = "NilsHellwig";
const API = `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`;

interface Day {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_CLASS = [
  "bg-zinc-900/[0.06] dark:bg-white/[0.06]",
  "bg-zinc-900/25 dark:bg-white/25",
  "bg-zinc-900/45 dark:bg-white/45",
  "bg-zinc-900/70 dark:bg-white/70",
  "bg-zinc-900 dark:bg-white",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);

const formatDay = (iso: string) =>
  parse(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const stats = (days: Day[]) => {
  let longest = 0;
  let run = 0;
  let best: Day | null = null;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    if (!best || d.count > best.count) best = d;
  }
  // Today may simply not have commits yet, so the current streak may end yesterday.
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  const total = days.reduce((s, d) => s + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;
  return { total, longest, current, best, active };
};

const GitHubActivity: React.FC = () => {
  const [days, setDays] = useState<Day[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<Day | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(API, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json: { contributions: Day[] }) => {
        const today = new Date().toISOString().slice(0, 10);
        setDays(json.contributions.filter((d) => d.date <= today));
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) {
          console.warn("GitHub activity unavailable", e);
          setFailed(true);
        }
      });
    return () => ctrl.abort();
  }, []);

  // Columns of weeks (Sunday first), padded so the first column starts on a Sunday.
  const { weeks, monthLabels } = useMemo(() => {
    if (!days?.length) return { weeks: [] as (Day | null)[][], monthLabels: [] as string[] };
    const cells: (Day | null)[] = [
      ...Array<null>(parse(days[0].date).getUTCDay()).fill(null),
      ...days,
    ];
    const weeks: (Day | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const labels: string[] = [];
    let lastMonth = -1;
    let lastLabelAt = -10;
    weeks.forEach((w, wi) => {
      const first = w.find(Boolean);
      const m = first ? parse(first.date).getUTCMonth() : lastMonth;
      // Label the first week of each month, unless the previous label is too close.
      if (m !== lastMonth && wi - lastLabelAt >= 3) {
        labels.push(MONTHS[m]);
        lastLabelAt = wi;
      } else labels.push("");
      lastMonth = m;
    });
    return { weeks, monthLabels: labels };
  }, [days]);

  const s = useMemo(() => (days ? stats(days) : null), [days]);

  const statItems = s
    ? [
        { label: "Contributions", value: s.total.toLocaleString("en-US") },
        { label: "Active days", value: s.active.toString() },
        { label: "Longest streak", value: `${s.longest} days` },
        { label: "Current streak", value: `${s.current} days` },
      ]
    : [];

  return (
    <div className="relative overflow-hidden border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-5 pt-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            GitHub Activity · last 12 months
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 min-h-5 tabular-nums">
            {hover ? (
              <>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {hover.count} {hover.count === 1 ? "contribution" : "contributions"}
                </span>{" "}
                on {formatDay(hover.date)}
              </>
            ) : s?.best ? (
              <>
                Busiest day:{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {s.best.count} contributions
                </span>{" "}
                on {formatDay(s.best.date)}
              </>
            ) : failed ? (
              "Live data is currently unavailable."
            ) : (
              "Loading contributions…"
            )}
          </p>
        </div>
        <a
          href={`https://github.com/${USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <GithubLogo size={14} weight="fill" />
          @{USER}
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mx-5 mt-4 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700">
        {(statItems.length ? statItems : Array.from({ length: 4 }, () => null)).map((item, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 px-3 py-2.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {item?.label ?? " "}
            </p>
            <p className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white tabular-nums">
              {item?.value ?? (
                <span className="inline-block w-12 h-4 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse" />
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto px-5 pt-5 pb-4 [scrollbar-width:thin]" dir="rtl">
        <div dir="ltr" className="min-w-[640px]">
          <div
            className="grid gap-[3px] mb-1.5"
            style={{ gridTemplateColumns: `repeat(${weeks.length || 53}, minmax(0, 1fr))` }}
          >
            {(weeks.length ? monthLabels : Array<string>(53).fill("")).map((m, i) => (
              <span
                key={i}
                className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap overflow-visible h-3 leading-3"
              >
                {m}
              </span>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${weeks.length || 53}, minmax(0, 1fr))` }}
            onMouseLeave={() => setHover(null)}
          >
            {(weeks.length ? weeks : Array.from({ length: 53 }, () => Array<null>(7).fill(null))).map(
              (week, wi) => (
                <div key={wi} className="grid grid-rows-7 gap-[3px]">
                  {Array.from({ length: 7 }, (_, di) => {
                    const d = week[di] ?? null;
                    if (!days) {
                      return (
                        <span
                          key={di}
                          className="aspect-square rounded-[3px] bg-zinc-900/[0.05] dark:bg-white/[0.05] animate-pulse"
                        />
                      );
                    }
                    if (!d) return <span key={di} className="aspect-square" />;
                    return (
                      <span
                        key={di}
                        onMouseEnter={() => setHover(d)}
                        aria-label={`${d.count} contributions on ${d.date}`}
                        className={`gh-cell aspect-square rounded-[3px] transition-transform duration-150 hover:scale-[1.35] hover:ring-2 hover:ring-zinc-900/20 dark:hover:ring-white/30 ${LEVEL_CLASS[d.level]}`}
                        style={{ animationDelay: `${wi * 14 + di * 10}ms` }}
                      />
                    );
                  })}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 px-5 pb-4 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
        Less
        {LEVEL_CLASS.map((c, i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-[3px] ${c}`} />
        ))}
        More
      </div>
    </div>
  );
};

export default GitHubActivity;
