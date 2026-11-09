// Trains the tiny transformer shown on /llm and writes its weights to
// src/components/llm/tinygpt-weights.json. Run with:  node scripts/train-tinygpt.mjs
// (Node ≥ 23 runs the imported .ts files directly.)

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MINI_CORPUS } from "../src/components/llm/corpus.ts";
import {
  _backwardForCheck,
  countParams,
  datasetLoss,
  initTinyGPT,
  train,
} from "../src/lib/tinygpt.ts";

const END = ".";

const prepare = (text) => {
  const sentences = text
    .toLowerCase()
    .split("\n")
    .map((l) => l.trim().split(/\s+/).filter(Boolean))
    .filter((s) => s.length);
  const words = [...new Set(sentences.flat())].sort((a, b) =>
    a === END ? -1 : b === END ? 1 : a.localeCompare(b),
  );
  const index = new Map(words.map((w, i) => [w, i]));
  // Every sentence starts with "." (start marker) and ends with "." (end marker).
  const seqs = sentences.map((s) => [END, ...s].map((w) => index.get(w)));
  return { words, seqs };
};

// ---- gradient check on a fresh model
{
  const { words, seqs } = prepare(MINI_CORPUS.en);
  const m = initTinyGPT(words, 8, 16, 10, 2, 3);
  const ids = seqs[4];
  const { G } = _backwardForCheck(m, ids);
  const lossOf = () => _backwardForCheck(m, ids).loss;
  let worst = 0;
  const probes = [
    ["E", m.E, G.E, ids[2], 3],
    ["P", m.P, G.P, 2, 5],
    ["Wq0", m.layers[0].Wq, G.layers[0].Wq, 1, 2],
    ["Wk1", m.layers[1].Wk, G.layers[1].Wk, 4, 6],
    ["Wv0", m.layers[0].Wv, G.layers[0].Wv, 7, 0],
    ["Wo1", m.layers[1].Wo, G.layers[1].Wo, 3, 3],
    ["W1_0", m.layers[0].W1, G.layers[0].W1, 2, 9],
    ["b1_1", m.layers[1].b1, G.layers[1].b1, 0, 4],
    ["W2_1", m.layers[1].W2, G.layers[1].W2, 5, 1],
    ["Wu", m.Wu, G.Wu, 6, ids[3]],
  ];
  for (const [name, A, GA, i, j] of probes) {
    const eps = 1e-5;
    const orig = A[i][j];
    A[i][j] = orig + eps;
    const lp = lossOf();
    A[i][j] = orig - eps;
    const lm = lossOf();
    A[i][j] = orig;
    const num = (lp - lm) / (2 * eps);
    const rel = Math.abs(num - GA[i][j]) / Math.max(1e-8, Math.abs(num) + Math.abs(GA[i][j]));
    worst = Math.max(worst, rel);
    console.log(
      `grad check ${name.padEnd(5)} numeric ${num.toFixed(6)} analytic ${GA[i][j].toFixed(6)} rel ${rel.toExponential(1)}`,
    );
  }
  if (worst > 1e-4) throw new Error("gradient check failed");
}

// ---- train one model per language
const out = {};
for (const lang of ["en", "de"]) {
  const { words, seqs } = prepare(MINI_CORPUS[lang]);
  // Deliberately tiny so every matrix fits on screen: vectors of 4, one layer.
  const m = initTinyGPT(words, 4, 8, 6, 1, 7);
  console.log(
    `${lang}: vocab ${words.length}, ${seqs.length} sentences, ${countParams(m)} parameters`,
  );
  train(m, seqs, 3000, 0.02, (step, loss) => {
    if (step % 500 === 0 || step === 1) console.log(`  step ${step}  loss ${loss.toFixed(3)}`);
  });
  console.log(`  final loss ${datasetLoss(m, seqs).toFixed(3)}`);
  const r = (A) => A.map((row) => row.map((v) => Math.round(v * 1000) / 1000));
  out[lang] = {
    vocab: m.vocab,
    d: m.d,
    h: m.h,
    T: m.T,
    E: r(m.E),
    P: r(m.P),
    layers: m.layers.map((L) => Object.fromEntries(Object.entries(L).map(([k, v]) => [k, r(v)]))),
    Wu: r(m.Wu),
    bu: r(m.bu),
  };
}

const target = fileURLToPath(
  new URL("../src/components/llm/tinygpt-weights.json", import.meta.url),
);
writeFileSync(target, JSON.stringify(out));
console.log("wrote", target);
