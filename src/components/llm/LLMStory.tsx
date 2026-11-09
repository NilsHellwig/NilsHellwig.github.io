"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowCounterClockwise, DiceFive, Pause, Play, Shuffle } from "@phosphor-icons/react";
import {
  type M,
  type TinyGPT,
  T_,
  cloneModel,
  countParams,
  createTrainer,
  datasetLoss,
  forward,
  initTinyGPT,
  readout,
  softmaxRow,
  toSequences,
} from "../../lib/tinygpt";
import { fmt } from "../../lib/nn";
import { Slider } from "../backprop/ui";
import { type Lang, type Tr, useLang, useT } from "../explainer/i18n";
import { MINI_CORPUS } from "./corpus";
import WEIGHTS from "./tinygpt-weights.json";

// The whole /llm explainer as one horizontal story: a real, tiny transformer computed live,
// read from left to right. Explanations sit on the arrows between the steps; hovering any
// result number shows how it was computed; the training panel retrains the very model
// that every step shows.

const TRAINED = WEIGHTS as unknown as Record<Lang, TinyGPT>;

const PRESETS: Record<Lang, string[]> = {
  en: ["the cat eats", "the dog eats", "the cat runs", "the dog runs"],
  de: ["die katze frisst", "der hund frisst", "die katze rennt", "der hund rennt"],
};

type Cell = number | null;
interface Focus {
  id: string;
  i: number;
  j: number;
  rect: DOMRect;
}
interface Hl {
  row?: number;
  col?: number;
  cells?: [number, number][];
}

const short = (v: number) => fmt(v, 1).replace(/^(−?)0\./, "$1.");
const n2 = (v: number) => fmt(v, 2);

// ---------------------------------------------------------------- matrix

const Mat: React.FC<{
  id: string;
  title?: React.ReactNode;
  data: Cell[][];
  rows?: string[];
  cols?: string[];
  heat?: boolean;
  hl?: Hl;
  focus: Focus | null;
  interactive?: boolean;
  onFocus?: (f: Focus | null, pin?: boolean) => void;
  anchor?: (el: HTMLDivElement | null) => void;
}> = ({ id, title, data, rows, cols, heat, hl, focus, interactive, onFocus, anchor }) => {
  const max = Math.max(1e-6, ...data.flat().map((v) => (v === null ? 0 : Math.abs(v))));
  const involved = !!focus && (!!hl || focus.id === id);
  const lit = (i: number, j: number) =>
    (focus && focus.id === id && focus.i === i && focus.j === j) ||
    (hl && (hl.row === i || hl.col === j || hl.cells?.some(([a, b]) => a === i && b === j)));
  return (
    <div ref={anchor} className="shrink-0">
      {title && (
        <div className="mb-1 flex items-baseline gap-1.5 whitespace-nowrap text-[12px] font-bold text-zinc-800 dark:text-zinc-100">
          {title}
          <span className="font-mono text-[10px] font-semibold text-zinc-400">
            {data.length}×{data[0].length}
          </span>
        </div>
      )}
      <table className="border-separate border-spacing-[2px] text-[11px]">
        {cols && (
          <thead>
            <tr>
              {rows && <th />}
              {cols.map((c, j) => (
                <th
                  key={j}
                  className="relative h-12 w-[38px] max-w-[38px] min-w-[38px] p-0 font-medium text-zinc-400"
                >
                  <span className="absolute bottom-1 left-[18px] origin-bottom-left -rotate-60 whitespace-nowrap">
                    {c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              {rows && (
                <td className="whitespace-nowrap pr-1.5 text-right font-semibold text-zinc-500 dark:text-zinc-400">
                  {rows[i]}
                </td>
              )}
              {r.map((v, j) => {
                if (v === null)
                  return (
                    <td key={j}>
                      <div className="h-[22px] w-[38px] rounded bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(161,161,170,0.35)_2px,rgba(161,161,170,0.35)_3px)]" />
                    </td>
                  );
                const a = heat ? v : Math.abs(v) / max;
                const bg = heat
                  ? `rgba(245,158,11,${0.06 + a * 0.8})`
                  : v >= 0
                    ? `rgba(14,165,233,${0.06 + a * 0.55})`
                    : `rgba(244,63,94,${0.06 + a * 0.55})`;
                const on = lit(i, j);
                const me = focus && focus.id === id && focus.i === i && focus.j === j;
                const fire = (e: React.SyntheticEvent<HTMLDivElement>, pin?: boolean) =>
                  onFocus?.({ id, i, j, rect: e.currentTarget.getBoundingClientRect() }, pin);
                return (
                  <td key={j}>
                    <div
                      onMouseEnter={interactive ? (e) => fire(e) : undefined}
                      onMouseLeave={interactive ? () => onFocus?.(null) : undefined}
                      onClick={interactive ? (e) => fire(e, true) : undefined}
                      className={`flex h-[22px] w-[38px] items-center justify-center rounded font-mono tabular-nums text-zinc-800 transition-opacity dark:text-zinc-100 ${
                        interactive ? "cursor-pointer" : ""
                      } ${me ? "ring-2 ring-zinc-900 dark:ring-white" : on ? "ring-2 ring-amber-500" : ""} ${
                        involved && !on ? "opacity-25" : ""
                      }`}
                      style={{ background: bg }}
                    >
                      {heat ? `${Math.round(v * 100)}%` : short(v)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ---------------------------------------------------------------- flow pieces

/** The operation between two results: label, a couple of sentences, operand matrices, arrow. */
const Step: React.FC<{
  n: number;
  op: React.ReactNode;
  children?: React.ReactNode;
  operand?: React.ReactNode;
  wide?: boolean;
}> = ({ n, op, children, operand, wide }) => (
  <div className="flex shrink-0 items-start gap-2 self-start px-2 pt-5">
    <div className={`flex flex-col gap-1.5 ${wide ? "w-[240px]" : "w-[190px]"}`}>
      <div className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {n}
        </span>
        <span className="font-mono text-[12px] font-bold text-zinc-900 dark:text-white">{op}</span>
      </div>
      <div className="text-[12.5px] leading-snug text-zinc-600 dark:text-zinc-300">{children}</div>
      <svg
        width="100%"
        height="12"
        viewBox="0 0 190 12"
        preserveAspectRatio="none"
        className="text-zinc-300 dark:text-zinc-600"
      >
        <path
          d="M2 6 H182 M176 1 L184 6 L176 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    {operand && <div className="flex flex-col gap-2">{operand}</div>}
  </div>
);

/** A box in the flow. */
const Box: React.FC<{
  children: React.ReactNode;
  tone?: "plain" | "out" | "intro";
  className?: string;
}> = ({ children, tone = "plain", className = "" }) => (
  <div
    className={`flex shrink-0 flex-col gap-2 self-start rounded-xl border p-3 ${
      tone === "out"
        ? "border-sky-500/40 bg-sky-500/[0.05]"
        : tone === "intro"
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/70"
    } ${className}`}
  >
    {children}
  </div>
);

/** A chapter label sitting above the flow, so the strip reads like a book. */
const Chapter: React.FC<{ label: string; reg: (el: HTMLDivElement | null) => void }> = ({
  label,
  reg,
}) => (
  <div ref={reg} className="flex shrink-0 flex-col items-center self-stretch px-3">
    <span className="whitespace-nowrap rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
      {label}
    </span>
    <div className="mt-1 w-px flex-1 bg-gradient-to-b from-zinc-300 to-transparent dark:from-zinc-600" />
  </div>
);

const TopWords: React.FC<{
  m: TinyGPT;
  p: number[];
  k?: number;
  title?: string;
  mark?: number;
}> = ({ m, p, k = 3, title, mark }) => {
  const top = p
    .map((v, i) => ({ w: m.vocab[i], v, i }))
    .sort((a, b) => b.v - a.v)
    .slice(0, k);
  return (
    <div className="w-[210px]">
      {title && (
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {title}
        </div>
      )}
      {top.map((x) => (
        <div key={x.w} className="flex items-center gap-1.5 text-[11.5px]">
          <span
            className={`w-14 truncate text-right font-mono font-semibold ${mark === x.i ? "text-amber-600 dark:text-amber-400" : "text-zinc-800 dark:text-zinc-100"}`}
          >
            {x.w}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-700">
            <div
              className={`h-full rounded ${mark === x.i ? "bg-amber-500" : "bg-sky-500"}`}
              style={{ width: `${x.v * 100}%` }}
            />
          </div>
          <span className="w-8 text-right font-mono text-[10.5px] tabular-nums text-zinc-500">
            {Math.round(x.v * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- the calculation card

/** Row × column, written as aligned pairs, their products and the sum. */
const DotCard: React.FC<{
  heading: React.ReactNode;
  aLabel: string;
  bLabel: string;
  a: number[];
  b: number[];
  bias?: number;
  div?: number;
  relu?: boolean;
  result: number;
}> = ({ heading, aLabel, bLabel, a, b, bias, div, relu, result }) => {
  const prods = a.map((v, k) => v * b[k]);
  const sum = prods.reduce((s, v) => s + v, 0);
  const withBias = bias !== undefined ? sum + bias : sum;
  const divided = div !== undefined ? withBias / div : withBias;
  return (
    <div>
      <div className="mb-2 text-[12px] text-zinc-300">{heading}</div>
      <table className="border-separate border-spacing-x-1 font-mono text-[11.5px] tabular-nums">
        <tbody>
          <tr>
            <td className="pr-2 text-right font-sans text-[10.5px] text-zinc-400">{aLabel}</td>
            {a.map((v, k) => (
              <td key={k} className="rounded bg-sky-500/25 px-1.5 py-0.5 text-right">
                {n2(v)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="pr-2 text-right font-sans text-[10.5px] text-zinc-400">× {bLabel}</td>
            {b.map((v, k) => (
              <td key={k} className="rounded bg-amber-500/25 px-1.5 py-0.5 text-right">
                {n2(v)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="pr-2 text-right font-sans text-[10.5px] text-zinc-400">=</td>
            {prods.map((v, k) => (
              <td key={k} className="border-t border-zinc-600 px-1.5 pt-1 text-right text-white">
                {n2(v)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="mt-2 font-mono text-[12px] leading-relaxed text-zinc-200">
        {prods.map((v, k) => (k > 0 && v < 0 ? `(${n2(v)})` : n2(v))).join(" + ")} = {n2(sum)}
        {bias !== undefined && (
          <>
            {" "}
            · + bias {n2(bias)} = {n2(withBias)}
          </>
        )}
        {div !== undefined && (
          <>
            {" "}
            · ÷ {n2(div)} = {n2(divided)}
          </>
        )}
        {relu && <> · ReLU → {n2(Math.max(0, divided))}</>}
        <span className="ml-2 rounded bg-white px-1.5 font-bold text-zinc-900">{n2(result)}</span>
      </div>
    </div>
  );
};

const Card: React.FC<{ rect: DOMRect; children: React.ReactNode }> = ({ rect, children }) => {
  const w = Math.min(430, window.innerWidth - 16);
  const left = Math.min(Math.max(rect.left + rect.width / 2 - w / 2, 8), window.innerWidth - w - 8);
  const below = rect.bottom < window.innerHeight * 0.55;
  return createPortal(
    <div
      className="pointer-events-none fixed z-[60] rounded-xl bg-zinc-900 p-3 text-zinc-100 shadow-2xl ring-1 ring-zinc-700"
      style={{
        width: w,
        left,
        top: below ? rect.bottom + 8 : undefined,
        bottom: below ? undefined : window.innerHeight - rect.top + 8,
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

const LossCurve: React.FC<{ history: number[] }> = ({ history }) => {
  const W = 220;
  const H = 70;
  if (history.length < 2)
    return <div className="h-[70px] w-[220px] rounded bg-zinc-50 dark:bg-zinc-900/60" />;
  const max = Math.max(...history, 0.5);
  const d = history
    .map(
      (v, i) =>
        `${i ? "L" : "M"}${((i / (history.length - 1)) * W).toFixed(1)},${(H - 2 - (v / max) * (H - 6)).toFixed(1)}`,
    )
    .join("");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[70px] w-[220px] rounded bg-zinc-50 dark:bg-zinc-900/60"
      preserveAspectRatio="none"
    >
      <path
        d={d}
        fill="none"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        className="stroke-zinc-900 dark:stroke-zinc-100"
      />
    </svg>
  );
};

// ---------------------------------------------------------------- main

const CHAPTERS = [
  "idea",
  "tokens",
  "vectors",
  "attention",
  "mlp",
  "output",
  "sampling",
  "training",
  "scale",
  "end",
] as const;
type ChapterId = (typeof CHAPTERS)[number];
const CHAPTER_LABEL: Record<ChapterId, Tr<string>> = {
  idea: { en: "The idea", de: "Die Idee" },
  tokens: { en: "Tokens", de: "Tokens" },
  vectors: { en: "Vectors", de: "Vektoren" },
  attention: { en: "Attention", de: "Attention" },
  mlp: { en: "MLP", de: "MLP" },
  output: { en: "Output", de: "Ausgabe" },
  sampling: { en: "Rolling the dice", de: "Würfeln" },
  training: { en: "Training", de: "Training" },
  scale: { en: "Scale", de: "Größe" },
  end: { en: "Summary", de: "Fazit" },
};

const LLMStory: React.FC = () => {
  const { lang } = useLang();
  const t = useT();
  const de = lang === "de";
  const T = (en: React.ReactNode, deText: React.ReactNode) => (de ? deText : en);

  // the model, live-trainable
  const modelRef = useRef<TinyGPT>(cloneModel(TRAINED.en));
  const [version, setVersion] = useState(0);
  const [modelLang, setModelLang] = useState<Lang>("en");
  const [history, setHistory] = useState<number[]>([]);
  const [training, setTraining] = useState(false);
  const trainerRef = useRef<ReturnType<typeof createTrainer> | null>(null);

  const [words, setWords] = useState<string[]>(PRESETS.en[0].split(" "));
  const [temp, setTemp] = useState(1);
  const [picked, setPicked] = useState<number | null>(null);
  const [focus, setFocusState] = useState<Focus | null>(null);
  const [pinned, setPinned] = useState(false);

  if (modelLang !== lang) {
    modelRef.current = cloneModel(TRAINED[lang]);
    trainerRef.current = null;
    setModelLang(lang);
    setWords(PRESETS[lang][0].split(" "));
    setHistory([]);
    setTraining(false);
    setPicked(null);
    setFocusState(null);
    setPinned(false);
  }
  const m = modelRef.current;
  const seqs = useMemo(() => toSequences(m, MINI_CORPUS[lang]), [m, lang]);

  const onFocus = (f: Focus | null, pin?: boolean) => {
    if (pin) {
      const same =
        !!focus && !!f && focus.id === f.id && focus.i === f.i && focus.j === f.j && pinned;
      setFocusState(same ? null : f);
      setPinned(!same);
      return;
    }
    if (pinned) return;
    setFocusState(f);
  };

  const valid = words.every((w) => m.vocab.includes(w)) ? words : PRESETS[lang][0].split(" ");
  const ids = [".", ...valid].map((w) => m.vocab.indexOf(w)).slice(0, m.T);
  const key = ids.join(",");
  const tr = useMemo(() => forward(m, ids), [m, key, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const last = ids.length - 1;
  const lt = tr.layers[0];
  const W = m.layers[0];
  const rows = ids.map((id, i) => (i === 0 ? t({ en: "start", de: "Start" }) : m.vocab[id]));
  const logits = tr.logits[last];
  const probs = softmaxRow(logits);
  const probsT =
    temp < 0.02
      ? probs.map((_, i) => (i === probs.indexOf(Math.max(...probs)) ? 1 : 0))
      : softmaxRow(logits.map((v) => v / temp));
  const nextWord = m.vocab[probs.indexOf(Math.max(...probs))];
  const sqrtD = Math.sqrt(m.d);
  const wr = (k: number) => Array.from({ length: k }, (_, i) => String(i + 1));
  const col = (A: M, c: number) => A.map((r) => r[c]);
  const KT = T_(lt.K);
  const att = lt.A[last];
  const attTop = att.indexOf(Math.max(...att));
  const loss = useMemo(() => datasetLoss(m, seqs), [m, seqs, version]);
  const full = ids.length >= m.T;

  // ---- live training
  useEffect(() => {
    if (!training) return;
    const id = setInterval(() => {
      if (!trainerRef.current) trainerRef.current = createTrainer(modelRef.current, seqs, 0.02);
      const losses: number[] = [];
      for (let k = 0; k < 8; k++) losses.push(trainerRef.current.step());
      setHistory((h) => [...h, ...losses]);
      setVersion((v) => v + 1);
      if (trainerRef.current.steps >= 1200) setTraining(false);
    }, 40);
    return () => clearInterval(id);
  }, [training, seqs]);

  const randomize = () => {
    const fresh = initTinyGPT(m.vocab, m.d, m.h, m.T, 1, Math.floor(Math.random() * 1e6));
    Object.assign(modelRef.current, fresh);
    trainerRef.current = null;
    setHistory([datasetLoss(modelRef.current, seqs)]);
    setTraining(false);
    setVersion((v) => v + 1);
  };
  const restore = () => {
    Object.assign(modelRef.current, cloneModel(TRAINED[lang]));
    trainerRef.current = null;
    setHistory([]);
    setTraining(false);
    setVersion((v) => v + 1);
  };

  const sample = () => {
    const r = Math.random();
    let acc = 0;
    let idx = probsT.length - 1;
    for (let i = 0; i < probsT.length; i++) {
      acc += probsT[i];
      if (r < acc) {
        idx = i;
        break;
      }
    }
    setPicked(idx);
  };
  const append = () => {
    if (picked === null) return;
    const w = m.vocab[picked];
    if (w !== "." && !full) setWords((ws) => [...ws, w]);
    setPicked(null);
    setFocusState(null);
    setPinned(false);
  };
  const choose = (p: string) => {
    setWords(p.split(" "));
    setPicked(null);
    setFocusState(null);
    setPinned(false);
  };

  // ---- highlights and the calculation card for the focused cell
  const hl: Record<string, Hl> = {};
  let card: React.ReactNode = null;
  if (focus && focus.i < ids.length) {
    const { id, i, j } = focus;
    const cellName = (name: string) => `${name}[${rows[i]}, ${j + 1}]`;
    const rowOf = (name: string) =>
      t({ en: `row “${rows[i]}” of ${name}`, de: `Zeile „${rows[i]}“ von ${name}` });
    const colOf = (name: string) =>
      t({ en: `column ${j + 1} of ${name}`, de: `Spalte ${j + 1} von ${name}` });
    const sumLine = (a: number, b: number, la: string, lb: string, r: number) => (
      <div className="font-mono text-[12px]">
        {la} {n2(a)} + {lb} {n2(b)} ={" "}
        <span className="rounded bg-white px-1.5 font-bold text-zinc-900">{n2(r)}</span>
      </div>
    );
    if (id === "X0") {
      hl.tok = { cells: [[i, j]] };
      hl.P = { cells: [[i, j]] };
      card = sumLine(tr.tokE[i][j], tr.pos[i][j], "E", "P", tr.X0[i][j]);
    } else if (id === "Q" || id === "K" || id === "V") {
      const Wm = id === "Q" ? W.Wq : id === "K" ? W.Wk : W.Wv;
      const R = id === "Q" ? lt.Q : id === "K" ? lt.K : lt.V;
      hl.X0 = { row: i };
      hl[`W${id}`] = { col: j };
      card = (
        <DotCard
          heading={
            <>
              {cellName(id)} = {rowOf("X")} · {colOf(`W_${id}`)}
            </>
          }
          aLabel="X"
          bLabel={`W_${id}`}
          a={tr.X0[i]}
          b={col(Wm, j)}
          result={R[i][j]}
        />
      );
    } else if (id === "S") {
      hl.Q = { row: i };
      hl.KT = { col: j };
      card = (
        <DotCard
          heading={
            <>
              „{rows[i]}“ → „{rows[j]}“: {rowOf("Q")} ·{" "}
              {t({ en: `column “${rows[j]}” of Kᵀ`, de: `Spalte „${rows[j]}“ von Kᵀ` })}, ÷ √{m.d}
            </>
          }
          aLabel="Q"
          bLabel="Kᵀ"
          a={lt.Q[i]}
          b={col(KT, j)}
          div={sqrtD}
          result={lt.S[i][j] as number}
        />
      );
    } else if (id === "A") {
      hl.S = { row: i };
      const vs = lt.S[i].slice(0, i + 1) as number[];
      const mx = Math.max(...vs);
      const ex = vs.map((v) => Math.exp(v - mx));
      const sum = ex.reduce((a, b) => a + b, 0);
      card = (
        <div>
          <div className="mb-2 text-[12px] text-zinc-300">
            {t({
              en: `Softmax of row “${rows[i]}”: e^score, then ÷ the row total`,
              de: `Softmax der Zeile „${rows[i]}“: e^Punktzahl, dann ÷ Zeilensumme`,
            })}
          </div>
          <table className="border-separate border-spacing-x-1 font-mono text-[11.5px] tabular-nums">
            <tbody>
              <tr>
                <td className="pr-2 text-right font-sans text-[10.5px] text-zinc-400">
                  {t({ en: "score", de: "Punktz." })}
                </td>
                {vs.map((v, k) => (
                  <td
                    key={k}
                    className={`rounded px-1.5 py-0.5 text-right ${k === j ? "bg-amber-500/40" : "bg-zinc-700"}`}
                  >
                    {n2(v)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="pr-2 text-right font-sans text-[10.5px] text-zinc-400">e^…</td>
                {ex.map((v, k) => (
                  <td key={k} className="px-1.5 py-0.5 text-right">
                    {n2(v)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="pr-2 text-right font-sans text-[10.5px] text-zinc-400">
                  ÷ {n2(sum)}
                </td>
                {ex.map((v, k) => (
                  <td
                    key={k}
                    className={`border-t border-zinc-600 px-1.5 pt-1 text-right ${k === j ? "font-bold text-amber-300" : ""}`}
                  >
                    {Math.round((v / sum) * 100)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="mt-1 text-[10.5px] text-zinc-500">
            {t({
              en: "e^… is taken after subtracting the row's largest score; the percentages are the same.",
              de: "e^… nach Abzug der größten Punktzahl der Zeile; die Prozente sind dieselben.",
            })}
          </div>
        </div>
      );
    } else if (id === "Z") {
      hl.A = { row: i };
      hl.V = { col: j };
      card = (
        <DotCard
          heading={
            <>
              {cellName(t({ en: "mix", de: "Mischung" }))} ={" "}
              {rowOf(t({ en: "attention", de: "Aufmerksamkeit" }))} · {colOf("V")}
            </>
          }
          aLabel="%"
          bLabel="V"
          a={lt.A[i].slice(0, i + 1)}
          b={col(lt.V, j).slice(0, i + 1)}
          result={lt.Z[i][j]}
        />
      );
    } else if (id === "O") {
      hl.Z = { row: i };
      hl.Wo = { col: j };
      card = (
        <DotCard
          heading={
            <>
              {cellName("Update")} = {rowOf(t({ en: "mix", de: "Mischung" }))} · {colOf("W_O")}
            </>
          }
          aLabel={t({ en: "mix", de: "Misch." })}
          bLabel="W_O"
          a={lt.Z[i]}
          b={col(W.Wo, j)}
          result={lt.O[i][j]}
        />
      );
    } else if (id === "Xa") {
      hl.X0 = { cells: [[i, j]] };
      hl.O = { cells: [[i, j]] };
      card = sumLine(lt.Xin[i][j], lt.O[i][j], "X", "Update", lt.Xa[i][j]);
    } else if (id === "H") {
      hl.Xa = { row: i };
      hl.W1 = { col: j };
      hl.b1 = { col: j };
      card = (
        <DotCard
          heading={
            <>
              {cellName("h")} = {rowOf("X")} · {colOf("W₁")} + b₁, ReLU
            </>
          }
          aLabel="X"
          bLabel="W₁"
          a={lt.Xa[i]}
          b={col(W.W1, j)}
          bias={W.b1[0][j]}
          relu
          result={lt.H[i][j]}
        />
      );
    } else if (id === "Mo") {
      hl.H = { row: i };
      hl.W2 = { col: j };
      hl.b2 = { col: j };
      card = (
        <DotCard
          heading={
            <>
              {cellName("MLP")} = {rowOf("h")} · {colOf("W₂")} + b₂
            </>
          }
          aLabel="h"
          bLabel="W₂"
          a={lt.H[i]}
          b={col(W.W2, j)}
          bias={W.b2[0][j]}
          result={lt.Mo[i][j]}
        />
      );
    } else if (id === "Xout") {
      hl.Xa = { cells: [[i, j]] };
      hl.Mo = { cells: [[i, j]] };
      card = sumLine(lt.Xa[i][j], lt.Mo[i][j], "X", "MLP", lt.Xout[i][j]);
    } else if (id === "logits") {
      hl.Xout = { row: last };
      hl.Wu = { col: j };
      hl.bu = { col: j };
      card = (
        <DotCard
          heading={
            <>
              {t({ en: "score for", de: "Punktzahl für" })} „{m.vocab[j]}“ ={" "}
              {t({
                en: `last row of X · column “${m.vocab[j]}” of W_U + b`,
                de: `letzte Zeile von X · Spalte „${m.vocab[j]}“ von W_U + b`,
              })}
            </>
          }
          aLabel="X"
          bLabel="W_U"
          a={lt.Xout[last]}
          b={col(m.Wu, j)}
          bias={m.bu[0][j]}
          result={logits[j]}
        />
      );
    }
  }
  const mp = (id: string, interactive = false) => ({ id, focus, hl: hl[id], interactive, onFocus });

  // ---- arcs for inputs that come from further back, and chapter anchors (measured from the DOM)
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<Record<string, HTMLDivElement | null>>({});
  const reg = (k: string) => (el: HTMLDivElement | null) => {
    anchors.current[k] = el;
  };
  const [arcs, setArcs] = useState<{ x1: number; x2: number; y: number; label: string }[]>([]);
  const [activeChapter, setActiveChapter] = useState<ChapterId>("idea");
  const [progress, setProgress] = useState(0);
  const arcSpec = useMemo(
    () => [
      {
        from: "X0",
        to: "Xa",
        label: t({ en: "X (unchanged copy)", de: "X (unveränderte Kopie)" }),
      },
      { from: "V", to: "Zop", label: "V" },
      { from: "Xa", to: "Xout", label: "X" },
      {
        from: "appendBtn",
        to: "wordsBox",
        label: t({
          en: "append the word and run everything again",
          de: "Wort anhängen, alles neu rechnen",
        }),
      },
    ],
    [t],
  );
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const base = track.getBoundingClientRect();
      const out = arcSpec.flatMap((a, k) => {
        const f = anchors.current[a.from];
        const to = anchors.current[a.to];
        if (!f || !to) return [];
        const fr = f.getBoundingClientRect();
        const tor = to.getBoundingClientRect();
        return [
          {
            x1: fr.left - base.left + fr.width / 2,
            x2: tor.left - base.left + tor.width / 2,
            y: k === 3 ? 16 : 52 - (k % 2) * 14,
            label: a.label,
          },
        ];
      });
      setArcs(out);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [arcSpec, key, lang]);

  // Track scroll: drop the hover card, update chapter indicator.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setFocusState(null);
      setPinned(false);
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      const mid = el.scrollLeft + el.clientWidth * 0.35;
      let cur: ChapterId = "idea";
      for (const c of CHAPTERS) {
        const a = anchors.current[`ch-${c}`];
        if (a && a.offsetLeft <= mid) cur = c;
      }
      setActiveChapter(cur);
    };
    const onWheel = (e: WheelEvent) => {
      // Vertical wheel scrolls the story sideways until it reaches an end.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY > 0 && el.scrollLeft < max - 1) || (e.deltaY < 0 && el.scrollLeft > 0)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    const onWin = () => {
      setFocusState(null);
      setPinned(false);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onWin, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onWin);
    };
  }, []);
  const goTo = (c: ChapterId) => {
    const el = scrollRef.current;
    const a = anchors.current[`ch-${c}`];
    if (el && a) el.scrollTo({ left: a.offsetLeft - 24, behavior: "smooth" });
  };

  const scaleRows = [
    { name: t({ en: "this model", de: "dieses Modell" }), n: countParams(m) },
    { name: "GPT-2 (2019)", n: 1.5e9 },
    { name: "GPT-3 (2020)", n: 175e9 },
  ];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      {/* chapter bar */}
      <div className="sticky top-24 z-10 mx-auto max-w-[1400px] px-4">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white/90 p-1.5 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90">
          {CHAPTERS.map((c, k) => (
            <button
              key={c}
              onClick={() => goTo(c)}
              className={`h-7 shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2.5 text-[12px] font-semibold transition-colors ${
                activeChapter === c
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
            >
              <span className="mr-1 font-mono text-[10px] opacity-60">{k + 1}</span>
              {t(CHAPTER_LABEL[c])}
            </button>
          ))}
          <div className="ml-auto hidden h-1.5 w-32 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 sm:block">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-amber-500 to-emerald-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-3 overflow-x-auto px-4 pb-6 sm:px-8"
        style={{ scrollbarWidth: "thin" }}
      >
        <div ref={trackRef} className="relative flex w-max items-start pt-16">
          <svg className="pointer-events-none absolute left-0 top-0 h-16 w-full overflow-visible">
            {arcs.map((a, k) => {
              const back = a.x2 < a.x1;
              const L = Math.min(a.x1, a.x2);
              return (
                <g key={k}>
                  <path
                    d={`M ${a.x1} 64 V ${a.y + 8} Q ${a.x1} ${a.y} ${a.x1 + (back ? -8 : 8)} ${a.y} H ${a.x2 + (back ? 8 : -8)} Q ${a.x2} ${a.y} ${a.x2} ${a.y + 8} V 62`}
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    className={back ? "stroke-sky-500" : "stroke-zinc-400 dark:stroke-zinc-500"}
                  />
                  <path
                    d={`M ${a.x2 - 4} 57 L ${a.x2} 63 L ${a.x2 + 4} 57`}
                    fill="none"
                    strokeWidth={1.5}
                    className={back ? "stroke-sky-500" : "stroke-zinc-400 dark:stroke-zinc-500"}
                  />
                  <text
                    x={L + 12}
                    y={a.y - 3}
                    fontSize={10.5}
                    fontWeight={700}
                    className={
                      back ? "fill-sky-600 dark:fill-sky-400" : "fill-zinc-500 dark:fill-zinc-400"
                    }
                  >
                    {a.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* ------------------------------------------------ 1 the idea */}
          <Chapter label={t(CHAPTER_LABEL.idea)} reg={reg("ch-idea")} />
          <Box tone="intro" className="w-[300px]">
            <div className="text-[18px] font-bold leading-tight">
              {T(
                <>An LLM answers one question: what comes next?</>,
                <>Ein LLM beantwortet eine einzige Frage: Was kommt als Nächstes?</>,
              )}
            </div>
            <p className="text-[13px] leading-snug opacity-80">
              {T(
                <>
                  It reads the text so far and gives every possible next word a probability. One
                  word is picked and appended, and the question is asked again. A long chat answer
                  is this loop, hundreds of times. Scroll right to follow one pass through a real,
                  tiny model, computed live in your browser.
                </>,
                <>
                  Es liest den bisherigen Text und gibt jedem möglichen nächsten Wort eine
                  Wahrscheinlichkeit. Ein Wort wird gewählt und angehängt, dann wird wieder gefragt.
                  Eine lange Chat-Antwort ist diese Schleife, hunderte Male. Scroll nach rechts und
                  verfolge einen Durchlauf durch ein echtes, winziges Modell, live in deinem Browser
                  gerechnet.
                </>,
              )}
            </p>
          </Box>
          <Step n={1} op={t({ en: "pick a text", de: "Text wählen" })}>
            {T(
              <>
                The model learned from 8 tiny sentences about a cat and a dog. Pick a start; later
                you can append words.
              </>,
              <>
                Das Modell hat aus 8 Mini-Sätzen über eine Katze und einen Hund gelernt. Wähle einen
                Anfang; später kannst du Wörter anhängen.
              </>,
            )}
          </Step>
          <div ref={reg("wordsBox")} className="shrink-0 self-start">
            <Box>
              <div className="text-[12px] font-bold text-zinc-800 dark:text-zinc-100">
                {t({ en: "Text", de: "Text" })}
              </div>
              <div className="flex flex-col gap-1">
                {PRESETS[lang].map((p) => (
                  <button
                    key={p}
                    onClick={() => choose(p)}
                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-left text-[13px] font-semibold ${
                      valid.join(" ").startsWith(p)
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="mt-1 text-[15px] text-zinc-900 dark:text-white">
                {valid.join(" ")} <b className="text-sky-600 dark:text-sky-400">→ ?</b>
              </div>
            </Box>
          </div>

          {/* ------------------------------------------------ 2 tokens */}
          <Chapter label={t(CHAPTER_LABEL.tokens)} reg={reg("ch-tokens")} />
          <Step n={2} op={t({ en: "split into tokens", de: "in Tokens zerlegen" })} wide>
            {T(
              <>
                The text is cut into <b>tokens</b>, and each gets a number (ID). Here every word is
                a token. Real models also cut rare words into pieces, e.g.{" "}
                <span className="font-mono">un|believ|able</span>, and know 50,000 to 200,000
                tokens. A start marker goes in front.
              </>,
              <>
                Der Text wird in <b>Tokens</b> zerlegt, jedes bekommt eine Nummer (ID). Hier ist
                jedes Wort ein Token. Echte Modelle zerlegen seltene Wörter zusätzlich in Stücke, z.
                B. <span className="font-mono">un|glaub|lich</span>, und kennen 50.000 bis 200.000
                Tokens. Vorn steht eine Startmarke.
              </>,
            )}
          </Step>
          <Box>
            <div className="text-[12px] font-bold text-zinc-800 dark:text-zinc-100">Tokens</div>
            <div className="flex flex-col gap-[2px]">
              {ids.map((id, i) => (
                <div key={i} className="flex h-[22px] items-center gap-1.5 text-[11.5px]">
                  <span className="w-14 text-right font-semibold text-zinc-600 dark:text-zinc-300">
                    {rows[i]}
                  </span>
                  <span className="rounded bg-zinc-100 px-1 font-mono text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300">
                    #{id}
                  </span>
                </div>
              ))}
            </div>
          </Box>

          {/* ------------------------------------------------ 3 vectors */}
          <Chapter label={t(CHAPTER_LABEL.vectors)} reg={reg("ch-vectors")} />
          <Step n={3} op={t({ en: "look up in E", de: "in E nachschlagen" })}>
            {T(
              <>
                Each token ID picks one row of the embedding matrix E ({m.vocab.length} words ×{" "}
                {m.d} numbers): the token&apos;s <b>vector</b>. Training puts words that are used
                alike close together. Real models use thousands of numbers per token.
              </>,
              <>
                Jede Token-ID wählt eine Zeile der Embedding-Matrix E ({m.vocab.length} Wörter ×{" "}
                {m.d} Zahlen): den <b>Vektor</b> des Tokens. Das Training legt Wörter, die ähnlich
                benutzt werden, nah zusammen. Echte Modelle nutzen Tausende Zahlen pro Token.
              </>,
            )}
          </Step>
          <Box>
            <Mat
              {...mp("tok")}
              title={t({ en: "rows of E", de: "Zeilen aus E" })}
              data={tr.tokE}
              rows={rows}
            />
          </Box>
          <Step
            n={4}
            op="+ P"
            operand={
              <Mat
                {...mp("P")}
                title={t({ en: "position P", de: "Position P" })}
                data={tr.pos}
                rows={rows.map((_, i) => `${i}`)}
              />
            }
          >
            {T(
              <>
                So the model knows the order, a vector for each position (0, 1, 2, …) is added. The
                result X has one row per token.
              </>,
              <>
                Damit das Modell die Reihenfolge kennt, wird pro Position (0, 1, 2, …) ein Vektor
                addiert. Das Ergebnis X hat eine Zeile pro Token.
              </>,
            )}
          </Step>
          <Box>
            <Mat {...mp("X0", true)} anchor={reg("X0")} title="X" data={tr.X0} rows={rows} />
            <TopWords
              m={m}
              p={readout(m, tr.X0[last])}
              title={t({ en: "would predict already", de: "würde schon sagen" })}
            />
            <p className="w-[210px] text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {T(
                <>Only from “{rows[last]}” itself, without looking at the other words.</>,
                <>Nur aus „{rows[last]}“ selbst, ohne auf die anderen Wörter zu schauen.</>,
              )}
            </p>
          </Box>

          {/* ------------------------------------------------ 4 attention */}
          <Chapter label={t(CHAPTER_LABEL.attention)} reg={reg("ch-attention")} />
          <Step n={5} op="× W_Q, W_K, W_V" wide>
            {T(
              <>
                Now the words get to look at each other. Three weight matrices turn every row of X
                into three vectors: <b>Q</b> what am I looking for, <b>K</b> what can I be found by,{" "}
                <b>V</b> what do I hand over. Each number = a row of X times a column of W. Hover
                over any number.
              </>,
              <>
                Jetzt dürfen sich die Wörter gegenseitig anschauen. Drei Gewichtsmatrizen machen aus
                jeder Zeile von X drei Vektoren: <b>Q</b> wonach suche ich, <b>K</b> woran erkennt
                man mich, <b>V</b> was gebe ich weiter. Jede Zahl = eine Zeile von X mal eine Spalte
                von W. Fahr über eine Zahl.
              </>,
            )}
          </Step>
          <div className="flex shrink-0 flex-col gap-3 self-start">
            {(["Q", "K", "V"] as const).map((x) => {
              const Wm = x === "Q" ? W.Wq : x === "K" ? W.Wk : W.Wv;
              const R = x === "Q" ? lt.Q : x === "K" ? lt.K : lt.V;
              return (
                <div key={x} className="flex items-center gap-2">
                  <Mat {...mp(`W${x}`)} title={`W_${x}`} data={Wm} rows={wr(m.d)} />
                  <span className="text-lg font-bold text-zinc-400">→</span>
                  <Box>
                    <Mat
                      {...mp(x, true)}
                      anchor={x === "V" ? reg("V") : undefined}
                      title={x}
                      data={R}
                      rows={rows}
                    />
                  </Box>
                </div>
              );
            })}
          </div>
          <Step
            n={6}
            op={`Q · Kᵀ ÷ √${m.d}`}
            operand={
              <Mat
                {...mp("KT")}
                title={t({ en: "Kᵀ (K flipped)", de: "Kᵀ (K gekippt)" })}
                data={KT}
                rows={wr(m.d)}
                cols={rows}
              />
            }
          >
            {T(
              <>
                Compare every query with every key. Kᵀ is K flipped, so each column is one
                token&apos;s key. Then ÷ √{m.d} = {fmt(sqrtD, 0)}. Striped: the future, not allowed.
              </>,
              <>
                Jede Query mit jedem Key vergleichen. Kᵀ ist K gekippt, sodass jede Spalte der Key
                eines Tokens ist. Dann ÷ √{m.d} = {fmt(sqrtD, 0)}. Gestreift: die Zukunft, nicht
                erlaubt.
              </>,
            )}
          </Step>
          <Box>
            <Mat
              {...mp("S", true)}
              title={t({ en: "scores", de: "Punktzahlen" })}
              data={lt.S}
              rows={rows}
              cols={rows}
            />
          </Box>
          <Step n={7} op="softmax">
            {T(
              <>
                Each row becomes percentages that add up to 100%. “{rows[last]}” pays{" "}
                {Math.round(att[attTop] * 100)}% attention to “{rows[attTop]}”.
              </>,
              <>
                Jede Zeile wird zu Prozenten, die zusammen 100% ergeben. „{rows[last]}“ achtet zu{" "}
                {Math.round(att[attTop] * 100)}% auf „{rows[attTop]}“.
              </>,
            )}
          </Step>
          <Box>
            <Mat
              {...mp("A", true)}
              title={t({ en: "attention", de: "Aufmerksamkeit" })}
              data={lt.A.map((r, a) => r.map((v, b) => (b <= a ? v : null)))}
              rows={rows}
              cols={rows}
              heat
            />
          </Box>
          <div ref={reg("Zop")} className="shrink-0 self-start">
            <Step n={8} op="× V">
              {T(
                <>
                  Each token takes the value rows (arc from V), weighted with its percentages, and
                  adds them up.
                </>,
                <>
                  Jedes Token nimmt die Value-Zeilen (Bogen von V), gewichtet mit seinen Prozenten,
                  und addiert sie.
                </>,
              )}
            </Step>
          </div>
          <Box>
            <Mat
              {...mp("Z", true)}
              title={t({ en: "mix", de: "Mischung" })}
              data={lt.Z}
              rows={rows}
            />
          </Box>
          <Step
            n={9}
            op="× W_O"
            operand={<Mat {...mp("Wo")} title="W_O" data={W.Wo} rows={wr(m.d)} />}
          >
            {T(
              <>One more weight matrix turns the mix into an update.</>,
              <>Eine weitere Gewichtsmatrix macht aus der Mischung ein Update.</>,
            )}
          </Step>
          <Box>
            <Mat {...mp("O", true)} title="Update" data={lt.O} rows={rows} />
          </Box>
          <Step n={10} op="+ X">
            {T(
              <>
                The update is added to the original X (arc). Adding, not replacing: nothing X knew
                is lost.
              </>,
              <>
                Das Update wird zum ursprünglichen X addiert (Bogen). Addieren statt ersetzen:
                Nichts, was X wusste, geht verloren.
              </>,
            )}
          </Step>
          <Box>
            <Mat
              {...mp("Xa", true)}
              anchor={reg("Xa")}
              title={t({ en: "new X", de: "neues X" })}
              data={lt.Xa}
              rows={rows}
            />
          </Box>

          {/* ------------------------------------------------ 5 mlp */}
          <Chapter label={t(CHAPTER_LABEL.mlp)} reg={reg("ch-mlp")} />
          <Step
            n={11}
            op="× W₁ + b₁, ReLU"
            operand={
              <>
                <Mat {...mp("W1")} title="W₁" data={W.W1} rows={wr(m.d)} />
                <Mat {...mp("b1")} title="b₁" data={W.b1} />
              </>
            }
          >
            {T(
              <>
                Each row on its own goes through a small neural network: {m.d} numbers become {m.h},
                ReLU sets negatives to 0. The same kind of network as on the{" "}
                <a href="/backprop" className="font-semibold underline">
                  backprop page
                </a>
                .
              </>,
              <>
                Jede Zeile läuft für sich durch ein kleines neuronales Netz: Aus {m.d} Zahlen werden{" "}
                {m.h}, ReLU setzt Negative auf 0. Dieselbe Art Netz wie auf der{" "}
                <a href="/backprop" className="font-semibold underline">
                  Backprop-Seite
                </a>
                .
              </>,
            )}
          </Step>
          <Box>
            <Mat {...mp("H", true)} title="h" data={lt.H} rows={rows} />
          </Box>
          <Step
            n={12}
            op="× W₂ + b₂"
            operand={
              <>
                <Mat {...mp("W2")} title="W₂" data={W.W2} rows={wr(m.h)} />
                <Mat {...mp("b2")} title="b₂" data={W.b2} />
              </>
            }
          >
            {T(<>Back to {m.d} numbers per row.</>, <>Zurück auf {m.d} Zahlen pro Zeile.</>)}
          </Step>
          <Box>
            <Mat {...mp("Mo", true)} title="MLP" data={lt.Mo} rows={rows} />
          </Box>
          <Step n={13} op="+ X">
            {T(
              <>
                Added to X again (arc). Attention + MLP = one layer. Big models stack 12 to 100 such
                layers, each with its own matrices.
              </>,
              <>
                Wieder zu X addiert (Bogen). Attention + MLP = eine Schicht. Große Modelle stapeln
                12 bis 100 solcher Schichten, jede mit eigenen Matrizen.
              </>,
            )}
          </Step>
          <Box>
            <Mat
              {...mp("Xout", true)}
              anchor={reg("Xout")}
              title={t({ en: "X after the layer", de: "X nach der Schicht" })}
              data={lt.Xout}
              rows={rows}
            />
            <TopWords
              m={m}
              p={readout(m, lt.Xout[last])}
              title={t({ en: "would predict now", de: "würde jetzt sagen" })}
            />
            <p className="w-[210px] text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {T(
                <>
                  Now with context: “{rows[last]}” has looked at “{rows[attTop]}”.
                </>,
                <>
                  Jetzt mit Kontext: „{rows[last]}“ hat auf „{rows[attTop]}“ geschaut.
                </>,
              )}
            </p>
          </Box>

          {/* ------------------------------------------------ 6 output */}
          <Chapter label={t(CHAPTER_LABEL.output)} reg={reg("ch-output")} />
          <Step
            n={14}
            op={t({ en: "last row × W_U + b", de: "letzte Zeile × W_U + b" })}
            operand={
              <>
                <Mat {...mp("Wu")} title="W_U" data={m.Wu} rows={wr(m.d)} cols={m.vocab} />
                <Mat {...mp("bu")} title="b" data={m.bu} />
              </>
            }
          >
            {T(
              <>
                Only the last row matters for the next word. W_U has one column per word: one score
                (logit) per word.
              </>,
              <>
                Für das nächste Wort zählt nur die letzte Zeile. W_U hat eine Spalte pro Wort: eine
                Punktzahl (Logit) pro Wort.
              </>,
            )}
          </Step>
          <Box>
            <Mat
              {...mp("logits", true)}
              title={t({ en: "score per word", de: "Punktzahl pro Wort" })}
              data={[logits]}
              rows={[rows[last]]}
              cols={m.vocab}
            />
          </Box>
          <Step n={15} op="softmax">
            {T(
              <>Scores become probabilities (same softmax as in step 7).</>,
              <>Aus Punktzahlen werden Wahrscheinlichkeiten (derselbe Softmax wie in Schritt 7).</>,
            )}
          </Step>
          <Box tone="out">
            <TopWords m={m} p={probs} k={5} title={t({ en: "next word", de: "nächstes Wort" })} />
          </Box>

          {/* ------------------------------------------------ 7 sampling */}
          <Chapter label={t(CHAPTER_LABEL.sampling)} reg={reg("ch-sampling")} />
          <Step n={16} op={t({ en: "roll a weighted die", de: "gewichtet würfeln" })} wide>
            {T(
              <>
                The model doesn&apos;t choose, it rolls a die weighted by the probabilities.{" "}
                <b>Temperature</b> changes the die: 0 = always the top word, high = surprising words
                get a chance. That&apos;s why the same question can get different answers.
              </>,
              <>
                Das Modell wählt nicht, es würfelt mit einem nach den Wahrscheinlichkeiten
                gewichteten Würfel. <b>Temperatur</b> verändert den Würfel: 0 = immer das Top-Wort,
                hoch = überraschende Wörter bekommen eine Chance. Darum gibt dieselbe Frage manchmal
                verschiedene Antworten.
              </>,
            )}
          </Step>
          <Box className="w-[260px]">
            <Slider
              label={t({ en: "temperature", de: "Temperatur" })}
              value={temp}
              min={0}
              max={2}
              step={0.05}
              onChange={setTemp}
              display={temp === 0 ? "0" : temp.toFixed(2)}
            />
            <TopWords m={m} p={probsT} k={5} mark={picked ?? undefined} />
            <div className="flex flex-wrap gap-1.5">
              <button className="btn !h-8 !px-2.5 !text-xs" onClick={sample}>
                <DiceFive size={14} weight="bold" /> {t({ en: "roll", de: "würfeln" })}
              </button>
              <div ref={reg("appendBtn")}>
                <button
                  className="btn-primary !h-8 !px-2.5 !text-xs disabled:opacity-40"
                  onClick={append}
                  disabled={picked === null || full}
                >
                  {picked === null
                    ? t({ en: "append", de: "anhängen" })
                    : m.vocab[picked] === "."
                      ? t({ en: "“.” = end", de: "„.“ = Ende" })
                      : `+ ${m.vocab[picked]}`}
                </button>
              </div>
            </div>
            <p className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {full
                ? t({
                    en: "This tiny model only reads up to 6 tokens.",
                    de: "Dieses winzige Modell liest höchstens 6 Tokens.",
                  })
                : T(
                    <>
                      Appending puts the word into the text at the very start (blue arc) and every
                      step is recomputed.
                    </>,
                    <>
                      Anhängen schreibt das Wort in den Text ganz am Anfang (blauer Bogen), und
                      jeder Schritt wird neu gerechnet.
                    </>,
                  )}
            </p>
          </Box>

          {/* ------------------------------------------------ 8 training */}
          <Chapter label={t(CHAPTER_LABEL.training)} reg={reg("ch-training")} />
          <Step
            n={17}
            op={t({ en: "where do the numbers come from?", de: "woher kommen die Zahlen?" })}
            wide
          >
            {T(
              <>
                From training. For every word in the training sentences, the model predicts the next
                one; the penalty (loss) is <span className="font-mono">−log(p)</span> of the word
                that really came. Backpropagation then nudges all {countParams(m)} numbers so the
                penalty shrinks. Try it: scramble the weights, then train. Every matrix on this
                strip changes along.
              </>,
              <>
                Aus dem Training. Für jedes Wort der Trainingssätze sagt das Modell das nächste
                voraus; die Strafe (Loss) ist <span className="font-mono">−log(p)</span> des Wortes,
                das wirklich kam. Backpropagation schubst dann alle {countParams(m)} Zahlen so, dass
                die Strafe sinkt. Probier es: Gewichte durcheinanderwürfeln, dann trainieren. Jede
                Matrix in diesem Band ändert sich mit.
              </>,
            )}
          </Step>
          <Box className="w-[280px]">
            <div className="text-[12px] font-bold text-zinc-800 dark:text-zinc-100">
              {t({ en: "Training data", de: "Trainingsdaten" })}
            </div>
            <div className="whitespace-nowrap font-mono text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
              {MINI_CORPUS[lang].split("\n").map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-zinc-500">loss</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {fmt(loss, 3)}
              </span>
            </div>
            <LossCurve history={history} />
            <div className="flex flex-wrap gap-1.5">
              <button className="btn !h-8 !px-2.5 !text-xs" onClick={randomize}>
                <Shuffle size={14} weight="bold" />{" "}
                {t({ en: "random weights", de: "Zufallsgewichte" })}
              </button>
              <button
                className="btn-primary !h-8 !px-2.5 !text-xs"
                onClick={() => setTraining((v) => !v)}
              >
                {training ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}{" "}
                {training ? "Pause" : t({ en: "train", de: "trainieren" })}
              </button>
              <button
                className="btn !h-8 !px-2.5 !text-xs"
                onClick={restore}
                aria-label={t({ en: "restore", de: "zurücksetzen" })}
              >
                <ArrowCounterClockwise size={14} weight="bold" />
              </button>
            </div>
            <p className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {T(
                <>
                  Scroll back left while it trains: the vectors, attention and predictions all
                  change.
                </>,
                <>
                  Scroll beim Trainieren zurück nach links: Vektoren, Aufmerksamkeit und Vorhersagen
                  ändern sich.
                </>,
              )}
            </p>
          </Box>

          {/* ------------------------------------------------ 9 scale */}
          <Chapter label={t(CHAPTER_LABEL.scale)} reg={reg("ch-scale")} />
          <Step n={18} op={t({ en: "same recipe, bigger", de: "dasselbe Rezept, größer" })} wide>
            {T(
              <>
                Real LLMs are exactly this, scaled up: vectors of thousands of numbers, dozens of
                layers with several attention heads each, a vocabulary of ~100,000 tokens, trained
                on trillions of words. Afterwards they are fine-tuned on example conversations and
                human feedback to become helpful assistants.
              </>,
              <>
                Echte LLMs sind genau das, nur größer: Vektoren aus Tausenden Zahlen, Dutzende
                Schichten mit je mehreren Attention-Köpfen, ein Vokabular von ~100.000 Tokens,
                trainiert auf Billionen Wörtern. Danach werden sie auf Beispielgesprächen und
                menschlichem Feedback nachtrainiert, damit hilfreiche Assistenten daraus werden.
              </>,
            )}
          </Step>
          <Box className="w-[300px]">
            <div className="text-[12px] font-bold text-zinc-800 dark:text-zinc-100">
              {t({ en: "Parameters (log scale)", de: "Parameter (logarithmisch)" })}
            </div>
            {scaleRows.map((r, k) => (
              <div key={r.name}>
                <div className="flex justify-between text-[11.5px]">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">{r.name}</span>
                  <span className="font-mono text-zinc-500">
                    {r.n >= 1e9
                      ? `${(r.n / 1e9).toLocaleString(de ? "de-DE" : "en-US")} ${de ? "Mrd." : "bn"}`
                      : r.n.toLocaleString(de ? "de-DE" : "en-US")}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-700">
                  <div
                    className={`h-full rounded ${k === 0 ? "bg-sky-500" : "bg-zinc-900 dark:bg-zinc-100"}`}
                    style={{ width: `${(Math.log10(r.n) / 12) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {T(
                <>
                  Today&apos;s frontier models are larger still; most companies no longer publish
                  exact numbers.
                </>,
                <>
                  Heutige Spitzenmodelle sind noch größer; die meisten Firmen veröffentlichen keine
                  genauen Zahlen mehr.
                </>,
              )}
            </p>
          </Box>

          {/* ------------------------------------------------ 10 end */}
          <Chapter label={t(CHAPTER_LABEL.end)} reg={reg("ch-end")} />
          <Box tone="intro" className="mr-8 w-[320px]">
            <div className="text-[18px] font-bold leading-tight">
              {T(<>That&apos;s all an LLM is.</>, <>Mehr ist ein LLM nicht.</>)}
            </div>
            <ol className="ml-4 list-decimal space-y-1 text-[13px] leading-snug opacity-85">
              {de ? (
                <>
                  <li>Text → Tokens → eine Tabelle aus Vektoren.</li>
                  <li>
                    Schichten aus Attention (Wörter schauen einander an) und MLP, alles
                    Matrixmultiplikationen.
                  </li>
                  <li>
                    Letzte Zeile → Wahrscheinlichkeit für jedes Wort → würfeln, anhängen,
                    wiederholen.
                  </li>
                  <li>Alle Zahlen kommen aus Training mit Backpropagation.</li>
                </>
              ) : (
                <>
                  <li>Text → tokens → a table of vectors.</li>
                  <li>
                    Layers of attention (words look at each other) and MLP, all matrix
                    multiplications.
                  </li>
                  <li>Last row → a probability for every word → roll, append, repeat.</li>
                  <li>All the numbers come from training with backpropagation.</li>
                </>
              )}
            </ol>
            <a href="/backprop" className="mt-1 text-[13px] font-semibold underline">
              {t({ en: "How backpropagation works →", de: "Wie Backpropagation funktioniert →" })}
            </a>
          </Box>
        </div>
      </div>

      {focus && card && <Card rect={focus.rect}>{card}</Card>}
    </div>
  );
};

export default LLMStory;
