"use client";

import {
  Cloud,
  Droplets,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import {
  formatAxisTime,
  formatAxisValue,
  formatMetricValue,
  formatTooltipTime,
} from "@/lib/format";
import type { MetricKey, Reading, TimeRange } from "@/lib/sensors";
import { METRICS, STATUS_META } from "@/lib/thresholds";

interface MetricChartProps {
  metric: MetricKey;
  readings: Reading[];
  range: TimeRange;
  timeDomain: [number, number];
}

const METRIC_ICONS: Record<MetricKey, LucideIcon> = {
  temperature: Thermometer,
  humidity: Droplets,
  co2: Cloud,
};

function ChartTooltip({
  active,
  payload,
  label,
  metric,
  range,
}: Partial<TooltipContentProps<number, string>> & {
  metric: MetricKey;
  range: TimeRange;
}) {
  if (!active || !payload?.length) return null;

  const rawValue = payload[0]?.value;
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
  const timestamp = typeof label === "number" ? label : Number(label);
  if (!Number.isFinite(value) || !Number.isFinite(timestamp)) return null;

  const definition = METRICS[metric];

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white/95 px-3 py-2 shadow-xl backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
      <p className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
        {formatTooltipTime(timestamp, range)}
      </p>
      <p className="mt-1 flex items-baseline gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
        <span
          className="size-1.5 translate-y-[-1px] rounded-full"
          style={{ backgroundColor: definition.color }}
          aria-hidden="true"
        />
        <span className="font-mono tabular-nums">
          {formatMetricValue(metric, value)}
        </span>
        <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
          {definition.unit}
        </span>
      </p>
    </div>
  );
}

export function MetricChart({
  metric,
  readings,
  range,
  timeDomain,
}: MetricChartProps) {
  const definition = METRICS[metric];
  const Icon = METRIC_ICONS[metric];
  const latest = readings.length ? readings[readings.length - 1] : null;
  const value = latest ? latest[metric] : null;
  const status =
    value === null ? "good" : definition.getStatus(value);
  const statusMeta = STATUS_META[status];
  const statusLabel =
    value === null ? "No data" : definition.getStatusLabel(value);

  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-xl ${definition.iconTile}`}
          >
            <Icon className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
              {definition.label}
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
              {definition.hint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <p className="font-mono text-lg font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-white">
            {value === null ? "—" : formatMetricValue(metric, value)}
            <span className="ml-1 text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
              {definition.unit}
            </span>
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.badge}`}
          >
            <span
              className={`size-1.5 rounded-full ${statusMeta.dot}`}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="mt-4 h-[210px] w-full sm:h-[235px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 640, height: 235 }}
        >
          <AreaChart
            data={readings}
            syncId="environment-metrics"
            accessibilityLayer
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`chart-${metric}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={definition.color}
                  stopOpacity={0.22}
                />
                <stop
                  offset="100%"
                  stopColor={definition.color}
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--chart-grid)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={timeDomain}
              tickFormatter={(value: number) =>
                formatAxisTime(Number(value), range)
              }
              tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={36}
            />

            <YAxis
              domain={definition.chartDomain}
              ticks={definition.axisTicks}
              tickFormatter={(value: number) =>
                formatAxisValue(metric, Number(value))
              }
              tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={44}
            />

            {definition.bands.map((band) => (
              <ReferenceArea
                key={`${band.from}-${band.to}`}
                y1={band.from}
                y2={band.to}
                fill={band.color}
                fillOpacity={0.055}
                stroke="none"
              />
            ))}

            {metric === "co2" ? (
              <>
                <ReferenceLine
                  y={800}
                  stroke={STATUS_META.warning.hex}
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={1200}
                  stroke={STATUS_META.elevated.hex}
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                />
              </>
            ) : null}

            <Tooltip
              content={<ChartTooltip metric={metric} range={range} />}
              cursor={{
                stroke: "var(--chart-cursor)",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
              isAnimationActive={false}
              wrapperStyle={{ outline: "none" }}
            />

            <Area
              type="monotone"
              dataKey={metric}
              name={definition.label}
              stroke={definition.color}
              strokeWidth={2}
              fill={`url(#chart-${metric})`}
              dot={false}
              activeDot={{
                r: 3.5,
                strokeWidth: 0,
                fill: definition.color,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
