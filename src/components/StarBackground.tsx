"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

// Twinkling monochrome star field with the occasional shooting star, drawn on one canvas.
// Stars are bucketed by opacity so each frame needs only a few dozen fill calls.

const BUCKETS = 32;
const METEOR_TRAIL = 28;

const FG = { light: "24,24,27", dark: "244,244,245" };

interface Meteor {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  next: number;
}

interface StarBackgroundProps {
  subtle?: boolean; // dimmed variant for content pages
}

const StarBackground: React.FC<StarBackgroundProps> = ({ subtle = false }) => {
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
    const start = performance.now();
    let last = start;
    let raf = 0;

    let W = 0;
    let H = 0;
    let count = 0;
    let sx = new Float32Array(0);
    let sy = new Float32Array(0);
    let size = new Float32Array(0);
    let ink = new Float32Array(0);
    let phase = new Float32Array(0);
    let speed = new Float32Array(0);

    const meteor: Meteor = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      age: 0,
      life: 0,
      next: 1.5 + Math.random() * 3,
    };

    let styleTheme = "";
    let styles: string[] = [];
    const paths: Path2D[] = [];

    const setup = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      count = Math.round(Math.min(900, Math.max(150, (W * H) / 3200)));
      sx = new Float32Array(count);
      sy = new Float32Array(count);
      size = new Float32Array(count);
      ink = new Float32Array(count);
      phase = new Float32Array(count);
      speed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        sx[i] = Math.random() * W;
        // Slightly denser towards the top of the viewport.
        sy[i] = H * Math.pow(Math.random(), 1.3);
        const bright = Math.random() < 0.08;
        size[i] = bright ? 1.6 + Math.random() * 0.8 : 0.7 + Math.random() * 0.8;
        ink[i] = bright ? 0.55 + Math.random() * 0.35 : 0.12 + Math.random() * 0.45;
        phase[i] = Math.random() * Math.PI * 2;
        speed[i] = 0.4 + Math.random() * 1.2;
      }
    };

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = dt * 60;
      const dark = themeRef.current === "dark";

      if (styleTheme !== themeRef.current) {
        styleTheme = themeRef.current;
        const fg = dark ? FG.dark : FG.light;
        styles = Array.from(
          { length: BUCKETS },
          (_, b) => `rgba(${fg},${((b + 0.5) / BUCKETS).toFixed(3)})`,
        );
      }

      for (let b = 0; b < BUCKETS; b++) paths[b] = new Path2D();
      const dot = (x: number, y: number, s: number, a: number) => {
        if (a < 1 / BUCKETS) return;
        const b = Math.min(BUCKETS - 1, (a * BUCKETS) | 0);
        paths[b].rect(x - s / 2, y - s / 2, s, s);
      };

      // Light mode draws dark dots on a light page, which reads heavier, so tone them down.
      const themeInk = dark ? 1 : 0.6;
      for (let i = 0; i < count; i++) {
        const tw = reducedMotion ? 1 : 0.55 + 0.45 * Math.sin(t * speed[i] + phase[i]);
        dot(sx[i], sy[i], size[i], ink[i] * tw * themeInk);
      }

      if (!reducedMotion) {
        if (!meteor.active && t > meteor.next) {
          const angle = (18 + Math.random() * 20) * (Math.PI / 180);
          const v = 9 + Math.random() * 6;
          const dir = Math.random() < 0.5 ? -1 : 1;
          Object.assign(meteor, {
            active: true,
            x: W * (0.1 + Math.random() * 0.8),
            y: H * (0.03 + Math.random() * 0.4),
            vx: Math.cos(angle) * v * dir,
            vy: Math.sin(angle) * v,
            age: 0,
            life: 0.8 + Math.random() * 0.5,
          });
        }
        if (meteor.active) {
          meteor.age += dt;
          meteor.x += meteor.vx * f;
          meteor.y += meteor.vy * f;
          const fade = Math.sin(Math.PI * Math.min(1, meteor.age / meteor.life));
          for (let k = 0; k < METEOR_TRAIL; k++) {
            dot(
              meteor.x - meteor.vx * k * 0.9,
              meteor.y - meteor.vy * k * 0.9,
              1.7 - k * 0.035,
              0.95 * (1 - k / METEOR_TRAIL) * fade * themeInk,
            );
          }
          if (meteor.age > meteor.life) {
            meteor.active = false;
            meteor.next = t + 3 + Math.random() * 7;
          }
        }
      }

      ctx.clearRect(0, 0, W, H);
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = styles[b];
        ctx.fill(paths[b]);
      }
    };

    const loop = (now: number) => {
      frame(now);
      raf = requestAnimationFrame(loop);
    };

    setup();
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
        if (window.innerWidth === W && Math.abs(window.innerHeight - H) < 140) return;
        setup();
        if (reducedMotion) frame(performance.now());
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      redrawRef.current = () => {};
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 w-screen h-screen pointer-events-none ${subtle ? "opacity-40" : ""}`}
      style={{ zIndex: -1 }}
    />
  );
};

export default StarBackground;
