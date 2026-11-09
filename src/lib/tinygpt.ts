// A complete, tiny GPT-style transformer, written out by hand so the /llm page can show
// every matrix of a real forward pass.
//
//   X₀ = E[token] + P[position]                      (n × d)
//   per layer:
//     Q = X·W_Q,  K = X·W_K,  V = X·W_V               (n × d)
//     A = softmax(Q·Kᵀ / √d, causal mask)             (n × n)
//     X ← X + (A·V)·W_O                               attention, added to the residual stream
//     X ← X + ReLU(X·W₁ + b₁)·W₂ + b₂                 MLP, added to the residual stream
//   logits = X·W_U + b_U                              (n × vocab)
//
// Simplifications compared to real models: one attention head per layer and no layer
// normalisation. Everything else is the real thing, just very small.

export type M = number[][];

export interface Layer {
  Wq: M;
  Wk: M;
  Wv: M;
  Wo: M;
  W1: M;
  b1: M; // 1 × h
  W2: M;
  b2: M; // 1 × d
}

export interface TinyGPT {
  vocab: string[];
  d: number;
  h: number;
  T: number;
  E: M; // vocab × d
  P: M; // T × d
  layers: Layer[];
  Wu: M; // d × vocab
  bu: M; // 1 × vocab
}

// ---------------------------------------------------------------- small linear algebra

export const zeros = (r: number, c: number): M => Array.from({ length: r }, () => Array(c).fill(0));
export const matmul = (A: M, B: M): M => {
  const n = A.length;
  const k = B.length;
  const m = B[0].length;
  const C = zeros(n, m);
  for (let i = 0; i < n; i++)
    for (let p = 0; p < k; p++) {
      const a = A[i][p];
      if (a === 0) continue;
      const Bp = B[p];
      const Ci = C[i];
      for (let j = 0; j < m; j++) Ci[j] += a * Bp[j];
    }
  return C;
};
export const T_ = (A: M): M => A[0].map((_, j) => A.map((r) => r[j]));
const add = (A: M, B: M): M => A.map((r, i) => r.map((v, j) => v + B[i][j]));
const addRow = (A: M, b: M): M => A.map((r) => r.map((v, j) => v + b[0][j]));
const sumRows = (A: M): M => [A[0].map((_, j) => A.reduce((s, r) => s + r[j], 0))];

export const softmaxRow = (r: number[]) => {
  const max = Math.max(...r);
  const e = r.map((v) => Math.exp(v - max));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
};

const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------------------------------------------------------------- model

export const initTinyGPT = (
  vocab: string[],
  d = 8,
  h = 16,
  T = 10,
  nLayers = 2,
  seed = 1,
): TinyGPT => {
  const r = rng(seed);
  const g = () => {
    // Box-Muller normal
    const u = Math.max(r(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  };
  const rand = (rows: number, cols: number, s: number) =>
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => g() * s));
  const V = vocab.length;
  return {
    vocab,
    d,
    h,
    T,
    E: rand(V, d, 0.5),
    P: rand(T, d, 0.2),
    layers: Array.from({ length: nLayers }, () => ({
      Wq: rand(d, d, 1 / Math.sqrt(d)),
      Wk: rand(d, d, 1 / Math.sqrt(d)),
      Wv: rand(d, d, 1 / Math.sqrt(d)),
      Wo: rand(d, d, 0.5 / Math.sqrt(d)),
      W1: rand(d, h, 1 / Math.sqrt(d)),
      b1: zeros(1, h),
      W2: rand(h, d, 0.5 / Math.sqrt(h)),
      b2: zeros(1, d),
    })),
    Wu: rand(d, V, 1 / Math.sqrt(d)),
    bu: zeros(1, V),
  };
};

export interface LayerTrace {
  Xin: M;
  Q: M;
  K: M;
  V: M;
  S: (number | null)[][]; // scaled scores, null = masked (future)
  A: M; // attention weights (0 for masked)
  Z: M; // A·V
  O: M; // Z·W_O
  Xa: M; // after attention
  Hpre: M;
  H: M; // after ReLU
  Mo: M; // MLP output
  Xout: M; // after MLP
}

export interface Trace {
  ids: number[];
  tokE: M; // the looked-up rows of E
  pos: M; // the rows of P
  X0: M;
  layers: LayerTrace[];
  logits: M;
}

export const forward = (m: TinyGPT, ids: number[]): Trace => {
  const n = ids.length;
  const tokE = ids.map((id) => [...m.E[id]]);
  const pos = ids.map((_, i) => [...m.P[i]]);
  let X = add(tokE, pos);
  const X0 = X;
  const scale = 1 / Math.sqrt(m.d);
  const layers: LayerTrace[] = [];
  for (const L of m.layers) {
    const Q = matmul(X, L.Wq);
    const K = matmul(X, L.Wk);
    const V = matmul(X, L.Wv);
    const S = Q.map((qi, i) =>
      K.map((kj, j) => (j <= i ? qi.reduce((s, v, t) => s + v * kj[t], 0) * scale : null)),
    );
    const A = S.map((row, i) => {
      const p = softmaxRow(row.slice(0, i + 1) as number[]);
      return row.map((_, j) => (j <= i ? p[j] : 0));
    });
    const Z = matmul(A, V);
    const O = matmul(Z, L.Wo);
    const Xa = add(X, O);
    const Hpre = addRow(matmul(Xa, L.W1), L.b1);
    const H = Hpre.map((r) => r.map((v) => (v > 0 ? v : 0)));
    const Mo = addRow(matmul(H, L.W2), L.b2);
    const Xout = add(Xa, Mo);
    layers.push({ Xin: X, Q, K, V, S, A, Z, O, Xa, Hpre, H, Mo, Xout });
    X = Xout;
  }
  const logits = addRow(matmul(X, m.Wu), m.bu);
  return { ids, tokE, pos, X0, layers, logits };
};

/** "Logit lens": what the model would predict if we stopped at this point of the stream. */
export const readout = (m: TinyGPT, x: number[]) => softmaxRow(addRow(matmul([x], m.Wu), m.bu)[0]);

// ---------------------------------------------------------------- training

type Grads = TinyGPT;

const zerosLike = (m: TinyGPT): Grads => {
  const z = (A: M) => zeros(A.length, A[0].length);
  return {
    ...m,
    E: z(m.E),
    P: z(m.P),
    layers: m.layers.map((L) => ({
      Wq: z(L.Wq),
      Wk: z(L.Wk),
      Wv: z(L.Wv),
      Wo: z(L.Wo),
      W1: z(L.W1),
      b1: z(L.b1),
      W2: z(L.W2),
      b2: z(L.b2),
    })),
    Wu: z(m.Wu),
    bu: z(m.bu),
  };
};

const acc = (G: M, D: M) => {
  for (let i = 0; i < G.length; i++) for (let j = 0; j < G[0].length; j++) G[i][j] += D[i][j];
};

/** Loss and gradients for one sequence; predicts ids[i+1] from ids[0..i]. */
const backward = (m: TinyGPT, ids: number[], G: Grads, weight: number) => {
  const inp = ids.slice(0, -1);
  const tgt = ids.slice(1);
  const tr = forward(m, inp);
  const n = inp.length;
  let loss = 0;
  const dLogits = tr.logits.map((row, i) => {
    const p = softmaxRow(row);
    loss -= Math.log(p[tgt[i]] + 1e-12);
    return p.map((v, j) => (v - (j === tgt[i] ? 1 : 0)) * weight);
  });
  const XL = tr.layers.length ? tr.layers[tr.layers.length - 1].Xout : tr.X0;
  acc(G.Wu, matmul(T_(XL), dLogits));
  acc(G.bu, sumRows(dLogits));
  let dX = matmul(dLogits, T_(m.Wu));
  const scale = 1 / Math.sqrt(m.d);
  for (let l = m.layers.length - 1; l >= 0; l--) {
    const L = m.layers[l];
    const t = tr.layers[l];
    const g = G.layers[l];
    // MLP
    const dM = dX;
    acc(g.W2, matmul(T_(t.H), dM));
    acc(g.b2, sumRows(dM));
    const dH = matmul(dM, T_(L.W2));
    const dHpre = dH.map((r, i) => r.map((v, j) => (t.Hpre[i][j] > 0 ? v : 0)));
    acc(g.W1, matmul(T_(t.Xa), dHpre));
    acc(g.b1, sumRows(dHpre));
    const dXa = add(dX, matmul(dHpre, T_(L.W1)));
    // attention
    const dO = dXa;
    acc(g.Wo, matmul(T_(t.Z), dO));
    const dZ = matmul(dO, T_(L.Wo));
    const dA = matmul(dZ, T_(t.V));
    const dV = matmul(T_(t.A), dZ);
    const dS = t.A.map((a, i) => {
      let dot = 0;
      for (let j = 0; j <= i; j++) dot += a[j] * dA[i][j];
      return a.map((aij, j) => (j <= i ? aij * (dA[i][j] - dot) * scale : 0));
    });
    const dQ = matmul(dS, t.K);
    const dK = matmul(T_(dS), t.Q);
    acc(g.Wq, matmul(T_(t.Xin), dQ));
    acc(g.Wk, matmul(T_(t.Xin), dK));
    acc(g.Wv, matmul(T_(t.Xin), dV));
    dX = add(dXa, add(matmul(dQ, T_(L.Wq)), add(matmul(dK, T_(L.Wk)), matmul(dV, T_(L.Wv)))));
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m.d; j++) {
      G.E[inp[i]][j] += dX[i][j];
      G.P[i][j] += dX[i][j];
    }
  return loss;
};

const allParams = (m: TinyGPT): M[] => [
  m.E,
  m.P,
  ...m.layers.flatMap((L) => [L.Wq, L.Wk, L.Wv, L.Wo, L.W1, L.b1, L.W2, L.b2]),
  m.Wu,
  m.bu,
];

export const countParams = (m: TinyGPT) =>
  allParams(m).reduce((s, A) => s + A.length * A[0].length, 0);

/** Average next-token loss over a set of token sequences. */
export const datasetLoss = (m: TinyGPT, seqs: number[][]) => {
  let total = 0;
  let count = 0;
  for (const ids of seqs) {
    const tr = forward(m, ids.slice(0, -1));
    tr.logits.forEach((row, i) => {
      total -= Math.log(softmaxRow(row)[ids[i + 1]] + 1e-12);
      count++;
    });
  }
  return total / count;
};

/** Full-batch Adam that can be stepped a little at a time (for live training on the page). */
export const createTrainer = (m: TinyGPT, seqs: number[][], lr = 0.01) => {
  const params = allParams(m);
  const mom = params.map((A) => zeros(A.length, A[0].length));
  const vel = params.map((A) => zeros(A.length, A[0].length));
  const count = seqs.reduce((s, q) => s + q.length - 1, 0);
  const b1 = 0.9;
  const b2 = 0.999;
  let step = 0;
  return {
    get steps() {
      return step;
    },
    /** One gradient step; returns the loss before the step. */
    step() {
      step++;
      const G = zerosLike(m);
      let loss = 0;
      for (const ids of seqs) loss += backward(m, ids, G, 1 / count);
      const grads = allParams(G);
      params.forEach((A, k) => {
        const g = grads[k];
        for (let i = 0; i < A.length; i++)
          for (let j = 0; j < A[0].length; j++) {
            mom[k][i][j] = b1 * mom[k][i][j] + (1 - b1) * g[i][j];
            vel[k][i][j] = b2 * vel[k][i][j] + (1 - b2) * g[i][j] ** 2;
            const mh = mom[k][i][j] / (1 - b1 ** step);
            const vh = vel[k][i][j] / (1 - b2 ** step);
            A[i][j] -= (lr * mh) / (Math.sqrt(vh) + 1e-8);
          }
      });
      return loss / count;
    },
  };
};

/** Train for a fixed number of steps. Mutates and returns the model. */
export const train = (
  m: TinyGPT,
  seqs: number[][],
  steps: number,
  lr = 0.01,
  onStep?: (step: number, loss: number) => void,
) => {
  const tr = createTrainer(m, seqs, lr);
  for (let k = 1; k <= steps; k++) onStep?.(k, tr.step());
  return m;
};

/** Sentences → token id sequences, each wrapped in the "." start/end marker. */
export const toSequences = (m: TinyGPT, text: string) =>
  text
    .toLowerCase()
    .split("\n")
    .map((l) => l.trim().split(/\s+/).filter(Boolean))
    .filter((s) => s.length)
    .map((s) => [".", ...s].map((w) => m.vocab.indexOf(w)));

/** A deep copy, so live training never touches the shipped weights. */
export const cloneModel = (m: TinyGPT): TinyGPT => JSON.parse(JSON.stringify(m));

/** Internal: exposed for the gradient check in the training script. */
export const _backwardForCheck = (m: TinyGPT, ids: number[]) => {
  const G = zerosLike(m);
  const loss = backward(m, ids, G, 1);
  return { loss, G };
};
