"use client";

import { useMemo, useState } from "react";
import { Leaf } from "lucide-react";
import {
  RANGE_CONFIG,
  type MetricKey,
  type TimeRange,
} from "@/lib/sensors";
import {
  METRIC_KEYS,
  detectAlerts,
  findReadingNear,
} from "@/lib/thresholds";
import { AlertsPanel } from "./AlertsPanel";
import {
  DashboardSkeleton,
  EmptyState,
  ErrorState,
  StaleBanner,
} from "./DashboardStates";
import { LiveIndicator } from "./LiveIndicator";
import { MetricChart } from "./MetricChart";
import { RangeSelector } from "./RangeSelector";
import { StatCard, type Trend } from "./StatCard";
import { ThemeToggle } from "./ThemeToggle";
import { useReadings } from "@/hooks/useReadings";

interface MetricStat {
  min: number | null;
  max: number | null;
  trend: Trend | null;
}

const TREND_THRESHOLDS: Record<MetricKey, number> = {
  temperature: 0.1,
  humidity: 0.5,
  co2: 10,
};

export function Dashboard() {
  const [range, setRange] = useState<TimeRange>("1h");
  const { readings, status, error, lastUpdated, retry } = useReadings(range);

  const latest = readings.length ? readings[readings.length - 1] : null;

  const stats = useMemo(() => {
    const result = {} as Record<MetricKey, MetricStat>;

    for (const metric of METRIC_KEYS) {
      if (!latest) {
        result[metric] = { min: null, max: null, trend: null };
        continue;
      }

      let min: number | null = null;
      let max: number | null = null;
      for (const reading of readings) {
        const value = reading[metric];
        min = min === null ? value : Math.min(min, value);
        max = max === null ? value : Math.max(max, value);
      }

      const previous = findReadingNear(
        readings,
        latest.timestamp - 5 * 60_000,
      );
      let trend: Trend | null = null;

      if (previous && previous.timestamp !== latest.timestamp) {
        const delta = latest[metric] - previous[metric];
        const threshold = TREND_THRESHOLDS[metric];
        const direction =
          Math.abs(delta) < threshold
            ? "steady"
            : delta > 0
              ? "up"
              : "down";
        trend = { delta, direction };
      }

      result[metric] = { min, max, trend };
    }

    return result;
  }, [readings, latest]);

  const alerts = useMemo(() => detectAlerts(readings), [readings]);

  const timeDomain = useMemo<[number, number]>(() => {
    if (!readings.length) return [0, 0];
    return [readings[0].timestamp, readings[readings.length - 1].timestamp];
  }, [readings]);

  const rangeConfig = RANGE_CONFIG[range];
  const hasData = readings.length > 0;

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <Leaf className="size-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              Atmos
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Environmental monitor
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
            Live environment
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[2rem] dark:text-white">
            Today&apos;s conditions
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
            Temperature, humidity, and CO₂ at a glance — refreshed every 5
            seconds.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2.5 sm:items-end">
          <RangeSelector value={range} onChange={setRange} />
          <LiveIndicator status={status} lastUpdated={lastUpdated} />
        </div>
      </div>

      {status === "error" && hasData ? (
        <StaleBanner
          message={error}
          lastUpdated={lastUpdated}
          onRetry={retry}
        />
      ) : null}

      {status === "loading" && !hasData ? (
        <DashboardSkeleton />
      ) : status === "error" && !hasData ? (
        <ErrorState message={error} onRetry={retry} />
      ) : !hasData ? (
        <EmptyState onRefresh={retry} />
      ) : (
        <>
          <section
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Current conditions"
          >
            {METRIC_KEYS.map((metric) => (
              <StatCard
                key={metric}
                metric={metric}
                reading={latest}
                history={readings}
                min={stats[metric].min}
                max={stats[metric].max}
                trend={stats[metric].trend}
                rangeLabel={rangeConfig.description}
              />
            ))}
          </section>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <section className="space-y-4" aria-label="Metric history">
              {METRIC_KEYS.map((metric) => (
                <MetricChart
                  key={metric}
                  metric={metric}
                  readings={readings}
                  range={range}
                  timeDomain={timeDomain}
                />
              ))}
            </section>

            <AlertsPanel alerts={alerts} rangeLabel={rangeConfig.description} />
          </div>
        </>
      )}

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/70 pt-5 text-[11px] text-zinc-400 dark:border-white/10 dark:text-zinc-500">
        <p>
          Mock sensor feed
          {hasData ? ` · ${readings.length} samples · ${rangeConfig.label}` : ""}
        </p>
        <p>Next.js · Tailwind CSS · Recharts</p>
      </footer>
    </>
  );
}
