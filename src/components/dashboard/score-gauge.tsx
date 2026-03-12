"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { getScoreColor, getScoreLabel } from "@/lib/constants";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 280 }: ScoreGaugeProps) {
  const spring = useSpring(0, { duration: 2000, bounce: 0.1 });
  const rotation = useTransform(spring, [0, 100], [-90, 90]);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    spring.set(score);
  }, [spring, score]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplayScore(Math.round(v)));
    return unsub;
  }, [spring]);

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const center = size / 2;
  const radius = (size - 40) / 2;
  const strokeWidth = 18;

  // Semi-circle arc
  const startAngle = -180;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);

  const bgArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;

  // Calculate filled arc endpoint
  const fillAngle = startAngle + (totalAngle * score) / 100;
  const fillEnd = polarToCartesian(fillAngle);
  const largeArc = fillAngle - startAngle > 180 ? 1 : 0;
  const fillArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg
          width={size}
          height={size / 2 + 40}
          viewBox={`0 ${center - radius - 30} ${size} ${radius + 60}`}
          className="overflow-visible"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="33%" stopColor="#F59E0B" />
              <stop offset="66%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d={bgArc}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-muted/30"
          />

          {/* Filled arc */}
          <motion.path
            d={fillArc}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </svg>

        {/* Score text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-2"
          style={{ height: size / 2 + 40 }}
        >
          <motion.span
            className="text-6xl font-bold tabular-nums"
            style={{ color }}
          >
            {displayScore}
          </motion.span>
          <span className="text-sm font-medium text-muted-foreground mt-1">
            SEO Score
          </span>
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-2 px-4 py-1.5 rounded-full text-sm font-medium"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </motion.div>
    </div>
  );
}
