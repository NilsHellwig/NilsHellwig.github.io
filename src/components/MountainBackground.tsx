import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

// Procedurally generated, endlessly scrolling mountain panorama made of monochrome particles.
// Rendered on a single canvas; particles are bucketed by opacity so each frame
// only needs a few dozen fill calls regardless of the particle count.

interface Layer {
  base: number; // ridge baseline as a fraction of the viewport height
  amp: number; // peak height relative to the reference size
  scale: number; // horizontal noise frequency
  ridged: number; // 0 = rolling hills, 1 = sharp alpine ridges
  valley: number; // how much the centre is lowered to keep the hero text readable
  ink: number;
  size: number;
  spread: number; // how far particles reach below the crest
  depth: number; // parallax strength, also scales the scroll speed
  weight: number; // share of the particle budget
}

const LAYERS: Layer[] = [
  {
    base: 0.6,
    amp: 0.36,
    scale: 2.2,
    ridged: 1,
    valley: 0.65,
    ink: 0.4,
    size: 1,
    spread: 0.06,
    depth: 0.12,
    weight: 0.24,
  },
  {
    base: 0.68,
    amp: 0.27,
    scale: 3,
    ridged: 0.85,
    valley: 0.5,
    ink: 0.5,
    size: 1.15,
    spread: 0.07,
    depth: 0.28,
    weight: 0.22,
  },
  {
    base: 0.77,
    amp: 0.2,
    scale: 3.8,
    ridged: 0.6,
    valley: 0.35,
    ink: 0.6,
    size: 1.3,
    spread: 0.08,
    depth: 0.48,
    weight: 0.2,
  },
  {
    base: 0.87,
    amp: 0.15,
    scale: 4.6,
    ridged: 0.35,
    valley: 0.15,
    ink: 0.72,
    size: 1.5,
    spread: 0.09,
    depth: 0.72,
    weight: 0.18,
  },
  {
    base: 0.98,
    amp: 0.11,
    scale: 5.5,
    ridged: 0.15,
    valley: 0,
    ink: 0.85,
    size: 1.75,
    spread: 0.11,
    depth: 1,
    weight: 0.16,
  },
];

const MARGIN = 80;
const WRAP = MARGIN * 0.6; // particles leaving this far past the left edge re-enter on the right
const LUT_STEP = 2;
const SCROLL_SPEED = 16; // px/s of the nearest range; farther ranges scale with depth
const BUCKETS = 40;
const POINTER_RADIUS = 120;
const DRIFT_POOL = 360;
const METEOR_TRAIL = 28;

const KIND_MOUNTAIN = 0;
const KIND_ORB = 1;
const KIND_STAR = 2;

const FG = { light: "24,24,27", dark: "244,244,245" };

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const makeNoise = (rand: () => number) => {
  const values = new Float32Array(256);
  for (let i = 0; i < 256; i++) values[i] = rand();
  return (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    const a = values[i & 255];
    return a + (values[(i + 1) & 255] - a) * u;
  };
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Screen-space ridge lookup, sampled every LUT_STEP pixels from -MARGIN.
const ridgeAt = (ridge: Float32Array, x: number) => {
  const f = (x + MARGIN) / LUT_STEP;
  const i = Math.max(0, Math.min(ridge.length - 2, Math.floor(f)));
  const t = Math.min(1, Math.max(0, f - i));
  return ridge[i] + (ridge[i + 1] - ridge[i]) * t;
};

const buildScene = (W: number, H: number, seed: number, intro: boolean) => {
  const rand = mulberry32(seed);
  const noise = makeNoise(rand);
  const ref = Math.min(H, W * 0.85);
  const valleyCenter = 0.5 + (rand() - 0.5) * 0.12;
  const span = W + 2 * WRAP;

  const fbm = (li: number, u: number) => {
    const layer = LAYERS[li];
    let sum = 0;
    let amp = 0.5;
    let freq = layer.scale;
    let norm = 0;
    for (let o = 0; o < 6; o++) {
      const n = noise(u * freq + li * 37.7 + o * 11.3);
      const r = 1 - Math.abs(2 * n - 1);
      sum += (layer.ridged * r * r + (1 - layer.ridged) * n) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return sum / norm;
  };

  // Sample a long stretch of terrain once to normalise heights to [0, 1].
  const ranges = LAYERS.map((_, li) => {
    let min = Infinity;
    let max = -Infinity;
    for (let u = 0; u < 60; u += 0.01) {
      const h = fbm(li, u);
      min = Math.min(min, h);
      max = Math.max(max, h);
    }
    return { min, scale: 1 / (max - min || 1) };
  });

  const envelope = new Float32Array(Math.ceil((W + 2 * MARGIN) / LUT_STEP) + 2);
  for (let i = 0; i < envelope.length; i++) {
    const u = (i * LUT_STEP - MARGIN) / W;
    envelope[i] = 0.4 + 0.6 * smoothstep(0.05, 0.8, Math.abs(u - valleyCenter) * 2);
  }
  const ridges = LAYERS.map(() => new Float32Array(envelope.length));
  const shift = new Float32Array(LAYERS.length);

  // Recompute every ridge for the current scroll position.
  const updateRidges = (scrollTime: number) => {
    LAYERS.forEach((layer, li) => {
      shift[li] = scrollTime * SCROLL_SPEED * layer.depth;
      const ridge = ridges[li];
      const { min, scale } = ranges[li];
      for (let i = 0; i < ridge.length; i++) {
        const h = Math.min(
          1,
          Math.max(0, (fbm(li, (i * LUT_STEP - MARGIN + shift[li]) / W) - min) * scale),
        );
        const valley = 1 + (envelope[i] - 1) * layer.valley;
        ridge[i] = H * layer.base - ref * layer.amp * h * valley;
      }
    });
  };

  const kind: number[] = [];
  const layerOf: number[] = [];
  const hx: number[] = [];
  const hy: number[] = [];
  const born: number[] = [];
  const orbR: number[] = [];
  const orbA: number[] = [];
  const orbW: number[] = [];

  const add = (k: number, li: number, x: number, y: number, b: number) => {
    kind.push(k);
    layerOf.push(li);
    hx.push(x);
    hy.push(y);
    born.push(intro ? b : -10);
    orbR.push(0);
    orbA.push(0);
    orbW.push(0);
  };

  // Mountains: hx is the particle's world x; its height is resolved against the ridge every frame.
  const mountainCount = Math.round(Math.min(15000, Math.max(3000, (W * H) / 75)));
  LAYERS.forEach((layer, li) => {
    const target = Math.round(mountainCount * layer.weight);
    for (let k = 0; k < target; k++) {
      const x = -WRAP + rand() * span;
      add(KIND_MOUNTAIN, li, x, 0, 0.2 + li * 0.22 + ((x + WRAP) / span) * 0.9 + rand() * 0.35);
    }
  });

  // Halftone orb: concentric rings that slowly counter-rotate.
  const orbRadius = Math.min(W, H) * 0.085;
  const orbX = W * 0.78;
  const orbY = H * 0.34;
  const spacing = Math.max(4, orbRadius / 14);
  for (let r = spacing * 0.5; r < orbRadius * 1.9; r += spacing) {
    const n = Math.max(1, Math.round((2 * Math.PI * r) / spacing));
    const keep =
      r <= orbRadius ? 0.85 : 0.55 * Math.pow(1 - (r - orbRadius) / (orbRadius * 0.9), 1.5);
    const w = (rand() < 0.5 ? -1 : 1) * (0.03 + rand() * 0.07);
    for (let k = 0; k < n; k++) {
      if (rand() > keep) continue;
      add(KIND_ORB, -1, orbX, orbY, 0.1 + rand() * 0.6);
      const idx = kind.length - 1;
      orbR[idx] = r;
      orbA[idx] = (k / n) * Math.PI * 2;
      orbW[idx] = w;
    }
  }

  // Stars (only drawn in dark mode), denser towards the top; peaks passing by hide them.
  const starCount = Math.round((W * H) / 6500);
  for (let k = 0; k < starCount; k++) {
    add(KIND_STAR, -1, rand() * W, H * LAYERS[0].base * Math.pow(rand(), 1.6), rand() * 1.5);
  }

  const count = kind.length;
  const scene = {
    W,
    H,
    ref,
    span,
    noise,
    ridges,
    shift,
    updateRidges,
    count,
    kind: Uint8Array.from(kind),
    layerOf: Int8Array.from(layerOf),
    hx: Float32Array.from(hx),
    hy: Float32Array.from(hy),
    depthBelow: new Float32Array(count),
    ink: new Float32Array(count),
    size: new Float32Array(count),
    born: Float32Array.from(born),
    orbR: Float32Array.from(orbR),
    orbA: Float32Array.from(orbA),
    orbW: Float32Array.from(orbW),
    orbX,
    orbY,
    orbRadius,
    px: new Float32Array(count),
    py: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    phase: new Float32Array(count),
    fog: buildFog(W, H, ref, Math.round(mountainCount * 0.04)),
  };

  updateRidges(0);
  for (let i = 0; i < count; i++) {
    const k = scene.kind[i];
    if (k === KIND_MOUNTAIN) rollMountain(scene, i);
    else if (k === KIND_STAR) {
      scene.ink[i] = 0.15 + rand() * 0.5;
      scene.size[i] = 0.8 + rand() * 0.8;
    } else scene.size[i] = 1.1;
    const homeY =
      k === KIND_MOUNTAIN ? ridgeAt(ridges[scene.layerOf[i]], scene.hx[i]) : scene.hy[i];
    scene.px[i] = intro && k !== KIND_STAR ? rand() * W : scene.hx[i];
    scene.py[i] = intro && k !== KIND_STAR ? rand() * H : homeY + scene.depthBelow[i];
    scene.phase[i] = rand() * Math.PI * 2;
  }
  return scene;
};

// Mist bands lying in front of layers 2 and 4.
const buildFog = (W: number, H: number, ref: number, perBand: number) => {
  const bands = [2, 4];
  const count = perBand * bands.length;
  const fog = {
    count,
    layer: new Uint8Array(count),
    x: new Float32Array(count),
    y: new Float32Array(count),
    speed: new Float32Array(count),
    size: new Float32Array(count),
    ink: new Float32Array(count),
  };
  bands.forEach((li, band) => {
    const centre = H * LAYERS[li].base - ref * LAYERS[li].amp * 0.35;
    for (let k = 0; k < perBand; k++) {
      const i = band * perBand + k;
      const gauss = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      fog.layer[i] = li;
      fog.x[i] = -MARGIN + Math.random() * (W + 2 * MARGIN);
      fog.y[i] = centre + gauss * H * 0.035;
      fog.speed[i] = 0.08 + Math.random() * 0.22;
      fog.size[i] = 1.4 + Math.random() * 1.2;
      fog.ink[i] = 0.06 + Math.random() * 0.12;
    }
  });
  return fog;
};

type Scene = ReturnType<typeof buildScene>;

// Give a mountain particle a fresh place below the crest: dense along the ridge line, sparse further down.
const rollMountain = (
  s: Pick<Scene, "H" | "layerOf" | "depthBelow" | "ink" | "size">,
  i: number,
) => {
  const layer = LAYERS[s.layerOf[i]];
  const crest = Math.random() < 0.16;
  const d = crest ? Math.random() * 1.4 : -Math.log(1 - Math.random()) * s.H * layer.spread;
  s.depthBelow[i] = d;
  s.ink[i] =
    layer.ink * (0.3 + 0.7 * Math.exp(-d / (s.H * layer.spread * 1.4))) * (crest ? 1.35 : 1);
  s.size[i] = layer.size * (0.75 + Math.random() * 0.5);
};

const MountainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seed = Math.floor(Math.random() * 1e9);
    const start = performance.now();
    let last = start;
    let raf = 0;
    let scene: Scene;

    const pointer = { x: -9999, y: -9999, sx: 0, sy: 0, active: false };
    const ripples: { x: number; y: number; t: number }[] = [];
    const meteor = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      age: 0,
      life: 0,
      next: 5 + Math.random() * 6,
    };
    const drift = {
      x: new Float32Array(DRIFT_POOL),
      y: new Float32Array(DRIFT_POOL),
      vx: new Float32Array(DRIFT_POOL),
      vy: new Float32Array(DRIFT_POOL),
      age: new Float32Array(DRIFT_POOL),
      life: new Float32Array(DRIFT_POOL),
      layer: new Uint8Array(DRIFT_POOL),
      cursor: 0,
    };
    const peaks: { layer: number; x: number; y: number }[] = [];
    let peaksAt = -1;
    const offX = new Float32Array(LAYERS.length);
    const offY = new Float32Array(LAYERS.length);

    // Per-frame dot buffers, counting-sorted into opacity buckets before drawing.
    let cap = 0;
    let dotX = new Float32Array(0);
    let dotY = new Float32Array(0);
    let dotS = new Float32Array(0);
    let dotB = new Uint8Array(0);
    let order = new Int32Array(0);
    const counts = new Int32Array(BUCKETS + 1);
    const cursors = new Int32Array(BUCKETS);
    let n = 0;

    let styleTheme = "";
    let styles: string[] = [];

    const setup = (intro: boolean) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = buildScene(W, H, seed, intro && !reducedMotion);
      cap = scene.count + scene.fog.count + DRIFT_POOL + METEOR_TRAIL;
      dotX = new Float32Array(cap);
      dotY = new Float32Array(cap);
      dotS = new Float32Array(cap);
      dotB = new Uint8Array(cap);
      order = new Int32Array(cap);
      peaksAt = -1;
    };

    const push = (x: number, y: number, s: number, a: number) => {
      if (a < 1 / BUCKETS || n >= cap || x < -4 || y < -4 || x > scene.W + 4 || y > scene.H + 4)
        return;
      dotX[n] = x;
      dotY[n] = y;
      dotS[n] = s;
      dotB[n] = Math.min(BUCKETS - 1, (a * BUCKETS) | 0);
      n++;
    };

    // Height of a layer's ridge as currently displayed (scroll + parallax offset applied).
    const shownRidge = (li: number, x: number) =>
      ridgeAt(scene.ridges[li], x - offX[li]) + offY[li];

    // Prominent peaks of the back ranges emit spindrift when the wind picks up.
    const findPeaks = () => {
      peaks.length = 0;
      const win = Math.round(30 / LUT_STEP);
      for (let li = 0; li < 2; li++) {
        const r = scene.ridges[li];
        const threshold = scene.H * LAYERS[li].base - scene.ref * LAYERS[li].amp * 0.5;
        for (let i = win; i < r.length - win; i++) {
          if (r[i] > threshold) continue;
          let isPeak = true;
          for (let k = 1; k <= win && isPeak; k++) isPeak = r[i - k] >= r[i] && r[i + k] >= r[i];
          if (isPeak) peaks.push({ layer: li, x: i * LUT_STEP - MARGIN, y: r[i] });
        }
      }
    };

    const frame = (now: number) => {
      const s = scene;
      const { W, H } = s;
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = reducedMotion ? 0 : dt * 60;
      const damp = Math.pow(0.86, f);
      const dark = themeRef.current === "dark";

      if (styleTheme !== themeRef.current) {
        styleTheme = themeRef.current;
        const fg = dark ? FG.dark : FG.light;
        styles = Array.from(
          { length: BUCKETS },
          (_, b) => `rgba(${fg},${((b + 0.5) / BUCKETS).toFixed(3)})`,
        );
      }

      s.updateRidges(reducedMotion ? 0 : t);
      if (t - peaksAt > 0.4) {
        findPeaks();
        peaksAt = t;
      }

      // Smoothed pointer drives the parallax.
      pointer.sx +=
        ((pointer.active ? pointer.x / W - 0.5 : 0) - pointer.sx) * Math.min(1, 0.05 * f);
      pointer.sy +=
        ((pointer.active ? pointer.y / H - 0.5 : 0) - pointer.sy) * Math.min(1, 0.05 * f);
      LAYERS.forEach((layer, li) => {
        offX[li] = -pointer.sx * 40 * layer.depth;
        offY[li] = -pointer.sy * 14 * layer.depth;
      });
      const backX = -pointer.sx * 40 * 0.05;
      const backY = -pointer.sy * 14 * 0.05;

      // A pulse of light sweeps across the range every few seconds.
      const sweepT = (t % 11) / 4.2;
      const sweepX =
        !reducedMotion && sweepT <= 1 ? -0.25 * W + 1.5 * W * smoothstep(0, 1, sweepT) : -1e9;
      const sweepW = W * 0.1;

      while (ripples.length && t - ripples[0].t > 1.4) ripples.shift();
      const usePointer = pointer.active && !reducedMotion;
      const R2 = POINTER_RADIUS * POINTER_RADIUS;
      const { kind, layerOf, hx, hy, px, py, vx, vy, born, phase } = s;
      n = 0;

      for (let i = 0; i < s.count; i++) {
        const k = kind[i];
        const age = t - born[i];

        if (k === KIND_STAR) {
          if (!dark || age < 0) continue;
          const x = hx[i] + backX;
          const y = hy[i] + backY;
          if (y > shownRidge(0, x) - 2) continue;
          const tw = 0.55 + 0.45 * Math.sin(t * (0.6 + phase[i] * 0.4) + phase[i] * 7);
          push(x, y, s.size[i], s.ink[i] * tw * Math.min(1, age));
          continue;
        }

        const li = layerOf[i];
        let homeX: number;
        let homeY: number;
        let baseInk: number;
        let jitter: number;
        let ox: number;
        let oy: number;
        if (k === KIND_ORB) {
          const r = s.orbR[i] * (1 + 0.02 * Math.sin(t * 0.8 - s.orbR[i] * 0.05));
          const a = s.orbA[i] + t * s.orbW[i];
          homeX = s.orbX + Math.cos(a) * r;
          homeY = s.orbY + Math.sin(a) * r;
          const rn = s.orbR[i] / s.orbRadius;
          const halo = 0.25 * Math.pow(Math.max(0, 1 - (rn - 1) / 0.9), 2);
          baseInk = dark
            ? rn <= 1
              ? 0.12 + 0.5 * Math.sqrt(1 - rn * rn) + (rn > 0.9 ? 0.2 : 0)
              : halo
            : rn <= 1
              ? 0.06 + 0.5 * Math.pow(rn, 4)
              : halo;
          jitter = 0.3;
          ox = backX;
          oy = backY;
        } else {
          homeX = hx[i] - s.shift[li];
          if (homeX < -WRAP) {
            // Scrolled out on the left: re-enter on the right on fresh terrain.
            hx[i] += s.span;
            px[i] += s.span;
            homeX += s.span;
            rollMountain(s, i);
          }
          const ridge = s.ridges[li];
          const d = s.depthBelow[i];
          homeY = ridgeAt(ridge, homeX) + d;
          const e = 3 + d * 0.5;
          const slope = (ridgeAt(ridge, homeX + e) - ridgeAt(ridge, homeX - e)) / (2 * e);
          const light = Math.max(-1, Math.min(1, -slope * 1.6));
          baseInk = s.ink[i] * (dark ? 1 + 0.45 * light : 1 - 0.35 * light);
          jitter = 0.4 + LAYERS[li].depth * 0.8;
          ox = offX[li];
          oy = offY[li];
        }

        const ph = phase[i];
        const sweepD = (homeX - sweepX) / sweepW;
        const sweep = Math.exp(-sweepD * sweepD);
        const tx = homeX + ox + Math.sin(t * 0.9 + ph) * jitter;
        const ty = homeY + oy + Math.cos(t * 0.7 + ph * 1.3) * jitter - sweep * 3;

        const stiffness = age < 0 ? 0 : 0.05 * Math.min(1, age / 0.9);
        let ax = (tx - px[i]) * stiffness;
        let ay = (ty - py[i]) * stiffness;
        if (age < 0) {
          ax += (Math.random() - 0.5) * 0.05;
          ay += (Math.random() - 0.5) * 0.05 - 0.002;
        }

        let glow = 0;
        if (usePointer) {
          const dx = px[i] - pointer.x;
          const dy = py[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const p = 1 - d / POINTER_RADIUS;
            ax += (dx / d) * p * p * 3;
            ay += (dy / d) * p * p * 3;
            glow = p;
          }
        }
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          const rAge = t - rip.t;
          const dx = px[i] - rip.x;
          const dy = py[i] - rip.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const band = 1 - Math.abs(d - rAge * 650) / 70;
          if (band > 0) {
            const p = band * (1 - rAge / 1.4);
            ax += (dx / d) * p * 5;
            ay += (dy / d) * p * 5;
            glow = Math.max(glow, p);
          }
        }

        vx[i] = (vx[i] + ax * f) * damp;
        vy[i] = (vy[i] + ay * f) * damp;
        px[i] += vx[i] * f;
        py[i] += vy[i] * f;

        // Hidden behind a nearer range (or, for the orb, behind the farthest one).
        if (k === KIND_ORB) {
          if (py[i] > shownRidge(0, px[i]) - 1) continue;
        } else {
          const shownX = homeX + ox;
          const shownY = homeY + oy;
          let hidden = false;
          for (let j = li + 1; j < LAYERS.length && !hidden; j++) {
            hidden = shownY > shownRidge(j, shownX) + 10;
          }
          if (hidden) continue;
        }

        let a =
          baseInk *
          (0.88 + 0.12 * Math.sin(t * 1.7 + ph * 3)) *
          (1 + glow * 1.3) *
          (1 + sweep * 0.9);
        if (age < 0) a *= 0.25;
        push(px[i], py[i], s.size[i], a);
      }

      // Mist drifts with its range plus a little extra wind.
      const fogFade = reducedMotion ? 1 : smoothstep(1.5, 3.5, t);
      const fog = s.fog;
      for (let i = 0; i < fog.count; i++) {
        const li = fog.layer[i];
        fog.x[i] -= ((SCROLL_SPEED * LAYERS[li].depth) / 60 + fog.speed[i] * 0.5) * f;
        if (fog.x[i] < -MARGIN) fog.x[i] += W + 2 * MARGIN;
        const x = fog.x[i] + offX[li];
        const y = fog.y[i] + offY[li] + (s.noise(fog.x[i] * 0.004 + t * 0.1 + li * 9) - 0.5) * 40;
        if (y > shownRidge(li, x) + 6) continue;
        push(x, y, fog.size[i], fog.ink[i] * fogFade);
      }

      // Spindrift blown off the peaks during gusts
      if (!reducedMotion && t > 3 && peaks.length) {
        const gust = smoothstep(0.5, 0.85, s.noise(t * 0.12 + 400));
        let spawn = gust * 5 * f;
        while (spawn > 0 && (spawn >= 1 || Math.random() < spawn)) {
          spawn -= 1;
          const peak = peaks[(Math.random() * peaks.length) | 0];
          const j = drift.cursor;
          drift.cursor = (drift.cursor + 1) % DRIFT_POOL;
          drift.x[j] = peak.x + (Math.random() - 0.5) * 10;
          drift.y[j] = peak.y + Math.random() * 4;
          drift.vx[j] = 0.5 + Math.random() * 1.1;
          drift.vy[j] = -0.25 + Math.random() * 0.3;
          drift.age[j] = 0;
          drift.life[j] = 1.8 + Math.random() * 2.5;
          drift.layer[j] = peak.layer;
        }
      }
      for (let j = 0; j < DRIFT_POOL; j++) {
        if (drift.life[j] <= 0) continue;
        drift.age[j] += dt;
        if (drift.age[j] >= drift.life[j]) {
          drift.life[j] = 0;
          continue;
        }
        const li = drift.layer[j];
        drift.vx[j] += 0.012 * f;
        drift.vy[j] =
          (drift.vy[j] + (s.noise(drift.x[j] * 0.02 + t * 0.8 + j) - 0.5) * 0.08 * f) *
          Math.pow(0.985, f);
        drift.x[j] += (drift.vx[j] - (SCROLL_SPEED * LAYERS[li].depth) / 60) * f;
        drift.y[j] += drift.vy[j] * f;
        const a = LAYERS[li].ink * 1.1 * Math.sin((Math.PI * drift.age[j]) / drift.life[j]);
        push(drift.x[j] + offX[li], drift.y[j] + offY[li], 1, a);
      }

      // Occasional shooting star in dark mode
      if (dark && !reducedMotion) {
        if (!meteor.active && t > meteor.next) {
          const angle = (20 + Math.random() * 15) * (Math.PI / 180);
          const speed = 9 + Math.random() * 5;
          Object.assign(meteor, {
            active: true,
            x: W * (0.1 + Math.random() * 0.7),
            y: H * (0.05 + Math.random() * 0.25),
            vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1),
            vy: Math.sin(angle) * speed,
            age: 0,
            life: 0.9,
          });
        }
        if (meteor.active) {
          meteor.age += dt;
          meteor.x += meteor.vx * f;
          meteor.y += meteor.vy * f;
          const fade = Math.sin(Math.PI * Math.min(1, meteor.age / meteor.life));
          for (let k = 0; k < METEOR_TRAIL; k++) {
            const x = meteor.x - meteor.vx * k * 0.9;
            const y = meteor.y - meteor.vy * k * 0.9;
            if (y > shownRidge(0, x)) continue;
            push(x, y, 1.6 - k * 0.03, 0.9 * (1 - k / METEOR_TRAIL) * fade);
          }
          if (meteor.age > meteor.life) {
            meteor.active = false;
            meteor.next = t + 5 + Math.random() * 9;
          }
        }
      }

      // Draw: one path per opacity bucket
      ctx.clearRect(0, 0, W, H);
      counts.fill(0);
      for (let i = 0; i < n; i++) counts[dotB[i] + 1]++;
      for (let b = 0; b < BUCKETS; b++) {
        counts[b + 1] += counts[b];
        cursors[b] = counts[b];
      }
      for (let i = 0; i < n; i++) order[cursors[dotB[i]]++] = i;
      for (let b = 0; b < BUCKETS; b++) {
        if (counts[b + 1] === counts[b]) continue;
        ctx.fillStyle = styles[b];
        ctx.beginPath();
        for (let j = counts[b]; j < counts[b + 1]; j++) {
          const i = order[j];
          const sz = dotS[i];
          ctx.rect(dotX[i] - sz / 2, dotY[i] - sz / 2, sz, sz);
        }
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      frame(now);
      raf = requestAnimationFrame(loop);
    };

    setup(true);
    if (reducedMotion) {
      frame(performance.now());
      redrawRef.current = () => frame(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        // Ignore small height changes such as mobile browser bars collapsing.
        if (window.innerWidth === scene.W && Math.abs(window.innerHeight - scene.H) < 140) return;
        setup(false);
        if (reducedMotion) frame(performance.now());
      }, 200);
    };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") pointer.active = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      onPointerMove(e);
      if (!reducedMotion) {
        ripples.push({ x: e.clientX, y: e.clientY, t: (performance.now() - start) / 1000 });
        if (ripples.length > 4) ripples.shift();
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerLeave);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      redrawRef.current = () => {};
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerLeave);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default MountainBackground;
