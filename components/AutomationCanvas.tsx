"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

const particles = [
  { left: "8%", top: "18%", size: 8, delay: 0 },
  { left: "18%", top: "78%", size: 5, delay: 1.2 },
  { left: "34%", top: "30%", size: 7, delay: 0.45 },
  { left: "52%", top: "72%", size: 9, delay: 1.8 },
  { left: "70%", top: "22%", size: 5, delay: 0.9 },
  { left: "86%", top: "64%", size: 7, delay: 1.45 },
];

export default function AutomationCanvas() {
  const reduced = useReducedMotion();

  return (
    <div className="automation-canvas" aria-hidden="true">
      <div className="mesh mesh-one" />
      <div className="mesh mesh-two" />
      <div className="mesh mesh-three" />
      <svg className="signal-lines" viewBox="0 0 1000 720" preserveAspectRatio="none">
        <path d="M20 560 C220 420 255 210 455 310 S750 510 980 210" />
        <path d="M80 160 C260 320 425 120 620 210 S770 430 940 350" />
        <path d="M160 670 C330 530 470 520 610 610 S830 670 960 520" />
      </svg>
      {particles.map((particle) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className="signal-dot-shell"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          } as CSSProperties}
        >
          <motion.span
            className="signal-dot"
            animate={reduced ? {} : { y: [0, -18, 0], opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
            transition={{ duration: 5.5, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      ))}
    </div>
  );
}
