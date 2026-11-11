"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Cloud,
  Droplets,
  Minus,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import { formatMetricValue } from "@/lib/format";
import type { MetricKey, Reading } from "@/lib/sensors";
import { METRICS, STATUS_META } from "@/lib/thresholds";
import { Sparkline } from "./Sparkline";

export interface Trend {
  delta: number;
  direction: "up" | "down" | "steady";
}

interface StatCardProps {
  metric: MetricKey;
  reading: Reading | null;
  history: Reading[];
  min: number | null;
  max: number | null;
  trend: Trend | null;
  rangeLabel: string;
}

const METRIC_ICONS: Record<MetricKey, LucideIcon> = {
  temperature: Thermometer,
  humidity: Droplets,
  co2: Cloud,
};

const TREND_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  steady: Minus,
} as const;

export function StatCard({
  metric,
  reading,
  history,
  min,
  max,
  trend,
  rangeLabel,
}: StatCardProps) {
  const definition = METRICS[metric];
  const Icon = METRIC_ICONS[metric];
  const value = reading ? reading[metric] : null;
  const status = value === null ? "good" : definition.getStatus(value);
  const statusMeta = STATUS_META[status];
  const statusLabel =
    value === null ? "No data" : definition.getStatusLabel(value);
  const TrendIcon = trend ? TREND_ICONS[trend.direction] : Minus;
  const historyValues = history.slice(-40).map((item) => item[metric]);

  const trendLabel = !trend
    ? "No trend"
    : trend.direction === "steady"
      ? "Steady"
      : `${trend.delta > 0 ? "+" : "−"}${formatMetricValue(
          metric,
          Math.abs(trend.delta),
        )}`;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
      aria-label={`${definition.label}: ${
        value === null
          ? "no data"
          : `${formatMetricValue(metric, value)} ${definition.unit}, ${statusLabel}`
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${statusMeta.bar}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-xl ${definition.iconTile}`}
          >
            <Icon className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
              {definition.label}
            </h3>
            <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
              {definition.unit}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusMeta.badge}`}
        >
          <span
            className={`size-1.5 rounded-full ${statusMeta.dot}`}
            aria-hidden="true"
          />
          {statusLabel}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="font-mono text-[2.35rem] leading-none font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-white">
          {value === null ? "—" : formatMetricValue(metric, value)}
          <span className="ml-1.5 align-baseline text-sm font-normal tracking-normal text-zinc-400 dark:text-zinc-500">
            {definition.unit}
          </span>
        </p>

        <div className="text-right">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium tabular-nums text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300"
            title="Change compared with 5 minutes ago"
          >
            <TrendIcon className="size-3" strokeWidth={2} aria-hidden="true" />
            {trendLabel}
          </span>
          <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
            vs 5 min
          </p>
        </div>
      </div>

      <Sparkline
        values={historyValues}
        color={definition.color}
        className="mt-4 h-10 w-full"
      />

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-[11px] text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
        <span className="whitespace-nowrap">
          Min{" "}
          <span className="font-mono font-medium text-zinc-700 tabular-nums dark:text-zinc-200">
            {min === null ? "—" : formatMetricValue(metric, min)}
          </span>
        </span>
        <span className="whitespace-nowrap">
          Max{" "}
          <span className="font-mono font-medium text-zinc-700 tabular-nums dark:text-zinc-200">
            {max === null ? "—" : formatMetricValue(metric, max)}
          </span>
        </span>
        <span className="truncate text-zinc-400 dark:text-zinc-500">
          {rangeLabel}
        </span>
      </div>
    </article>
  );
}
