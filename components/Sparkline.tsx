"use client";

import { useId } from "react";

interface SparklineProps {
  values: number[];
  color: string;
  className?: string;
}

export function Sparkline({ values, color, className }: SparklineProps) {
  const rawId = useId();
  const gradientId = `spark-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  if (values.length < 2) {
    return (
      <div
        className={className}
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(to top, ${color}14, transparent)`,
        }}
      />
    );
  }

  const width = 200;
  const height = 40;
  const padding = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y =
      height - padding - ((value - min) / span) * (height - padding * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M0,${height} L${points
    .map(([x, y]) => `${x},${y}`)
    .join(" L")} L${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
