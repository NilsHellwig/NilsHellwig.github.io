// A tiny 2 → 3 → 1 neural network, written out by hand so every number
// on the /backprop page comes from the same transparent math.
//
//   hidden neuron j:  z_j = w_j · x + b_j,   h_j = tanh(z_j)
//   output neuron:    z   = v · h + c,       ŷ   = σ(z)
//   loss (BCE):       L   = −[y·log ŷ + (1−y)·log(1−ŷ)]

export type Vec = number[];

export interface Net {
  /** Hidden weights, one 2-vector per hidden neuron (3 × 2). */
  W1: number[][];
  /** Hidden biases (3). */
  b1: Vec;
  /** Output weights v (3). */
  W2: Vec;
  /** Output bias c. */
  b2: number;
}

export interface Sample {
  x: Vec;
  y: number;
}

export interface Cache {
  x: Vec;
  z1: Vec;
  h: Vec;
  z2: number;
  yHat: number;
}

export interface Grads {
  dW1: number[][];
  db1: Vec;
  dW2: Vec;
  db2: number;
  /** ∂L/∂z at the output (= ŷ − y). */
  delta2: number;
  /** ∂L/∂h_j, the blame arriving at each hidden neuron's output. */
  dH: Vec;
  /** ∂L/∂z_j for each hidden neuron. */
  delta1: Vec;
}

export const XOR: Sample[] = [
  { x: [0, 0], y: 0 },
  { x: [0, 1], y: 1 },
  { x: [1, 0], y: 1 },
  { x: [1, 1], y: 0 },
];

export const HIDDEN = 3;
export const INPUTS = 2;

const EPS = 1e-12;

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Small deterministic PRNG so the guided story always shows the same numbers. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const DEFAULT_SEED = 7;

export const initNet = (seed: number = DEFAULT_SEED): Net => {
  const rand = mulberry32(seed);
  const u = (s: number) => (rand() * 2 - 1) * s;
  return {
    W1: Array.from({ length: HIDDEN }, () => [u(1.2), u(1.2)]),
    b1: Array.from({ length: HIDDEN }, () => u(0.5)),
    W2: Array.from({ length: HIDDEN }, () => u(1.2)),
    b2: u(0.3),
  };
};

export const cloneNet = (n: Net): Net => ({
  W1: n.W1.map((r) => [...r]),
  b1: [...n.b1],
  W2: [...n.W2],
  b2: n.b2,
});

export const forward = (net: Net, x: Vec): Cache => {
  const z1 = net.W1.map((w, j) => w[0] * x[0] + w[1] * x[1] + net.b1[j]);
  const h = z1.map(Math.tanh);
  const z2 = net.W2.reduce((s, v, j) => s + v * h[j], net.b2);
  return { x, z1, h, z2, yHat: sigmoid(z2) };
};

export const loss = (yHat: number, y: number) =>
  -(y * Math.log(yHat + EPS) + (1 - y) * Math.log(1 - yHat + EPS));

export const backward = (net: Net, c: Cache, y: number): Grads => {
  // Sigmoid + cross-entropy collapse into a beautifully simple output error.
  const delta2 = c.yHat - y;
  const dW2 = c.h.map((hj) => delta2 * hj);
  const db2 = delta2;
  // Blame flows back along each output weight …
  const dH = net.W2.map((v) => delta2 * v);
  // … and through tanh, whose slope is 1 − h².
  const delta1 = dH.map((d, j) => d * (1 - c.h[j] * c.h[j]));
  const dW1 = delta1.map((d) => [d * c.x[0], d * c.x[1]]);
  const db1 = [...delta1];
  return { dW1, db1, dW2, db2, delta2, dH, delta1 };
};

export const applyGrads = (net: Net, g: Grads, lr: number): Net => ({
  W1: net.W1.map((w, j) => w.map((wi, i) => wi - lr * g.dW1[j][i])),
  b1: net.b1.map((b, j) => b - lr * g.db1[j]),
  W2: net.W2.map((v, j) => v - lr * g.dW2[j]),
  b2: net.b2 - lr * g.db2,
});

const zeroGrads = (): Grads => ({
  dW1: Array.from({ length: HIDDEN }, () => [0, 0]),
  db1: Array(HIDDEN).fill(0),
  dW2: Array(HIDDEN).fill(0),
  db2: 0,
  delta2: 0,
  dH: Array(HIDDEN).fill(0),
  delta1: Array(HIDDEN).fill(0),
});

/** Average gradient and loss over a dataset (full batch). */
export const batchGrads = (net: Net, data: Sample[]): { grads: Grads; loss: number } => {
  const acc = zeroGrads();
  let total = 0;
  for (const s of data) {
    const c = forward(net, s.x);
    total += loss(c.yHat, s.y);
    const g = backward(net, c, s.y);
    for (let j = 0; j < HIDDEN; j++) {
      acc.dW1[j][0] += g.dW1[j][0];
      acc.dW1[j][1] += g.dW1[j][1];
      acc.db1[j] += g.db1[j];
      acc.dW2[j] += g.dW2[j];
      acc.dH[j] += g.dH[j];
      acc.delta1[j] += g.delta1[j];
    }
    acc.db2 += g.db2;
    acc.delta2 += g.delta2;
  }
  const n = data.length;
  const scale = (v: number) => v / n;
  return {
    grads: {
      dW1: acc.dW1.map((r) => r.map(scale)),
      db1: acc.db1.map(scale),
      dW2: acc.dW2.map(scale),
      db2: scale(acc.db2),
      delta2: scale(acc.delta2),
      dH: acc.dH.map(scale),
      delta1: acc.delta1.map(scale),
    },
    loss: total / n,
  };
};

export const datasetLoss = (net: Net, data: Sample[]) =>
  data.reduce((s, d) => s + loss(forward(net, d.x).yHat, d.y), 0) / data.length;

/** One epoch of full-batch gradient descent. Returns the new net and the loss before the step. */
export const trainEpoch = (net: Net, data: Sample[], lr: number) => {
  const { grads, loss: l } = batchGrads(net, data);
  return { net: applyGrads(net, grads, lr), loss: l, grads };
};

/** Format a number for display with a fixed number of decimals and a real minus sign. */
export const fmt = (n: number, d = 2) => {
  const s = (Math.abs(n) < 0.5 * 10 ** -d ? 0 : n).toFixed(d);
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
};

/** Like fmt, but always shows the sign. */
export const fmtSigned = (n: number, d = 2) => {
  const s = fmt(n, d);
  return s.startsWith("−") || Number(s) === 0 ? s : `+${s}`;
};
