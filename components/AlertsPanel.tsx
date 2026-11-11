"use client";

import { BellRing, ShieldCheck, TriangleAlert } from "lucide-react";
import { formatAlertTime, formatMetricValue } from "@/lib/format";
import { METRICS, STATUS_META, type Alert } from "@/lib/thresholds";

interface AlertsPanelProps {
  alerts: Alert[];
  rangeLabel: string;
}

export function AlertsPanel({ alerts, rangeLabel }: AlertsPanelProps) {
  return (
    <aside
      className="rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur xl:sticky xl:top-6 dark:border-white/10 dark:bg-white/[0.04]"
      aria-labelledby="alerts-heading"
    >
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 p-4 sm:p-5 dark:border-white/[0.06]">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
            <BellRing className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="alerts-heading"
                className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100"
              >
                Alerts
              </h2>
              {alerts.length > 0 ? (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                  {alerts.length}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
              Threshold breaches in the {rangeLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[560px] overflow-y-auto p-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <ShieldCheck className="size-5" strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">
              All clear
            </p>
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              No threshold breaches in this time range.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => {
              const definition = METRICS[alert.metric];
              const severity = STATUS_META[alert.severity];

              return (
                <li
                  key={alert.id}
                  className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${severity.soft} ${severity.text}`}
                    >
                      <TriangleAlert
                        className="size-3.5"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] leading-snug font-medium text-zinc-800 dark:text-zinc-100">
                          {alert.message}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${severity.badge}`}
                        >
                          {severity.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {formatAlertTime(alert.timestamp)}
                        <span
                          className="mx-1 text-zinc-300 dark:text-zinc-600"
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        {definition.label}{" "}
                        <span className="font-mono tabular-nums">
                          {formatMetricValue(alert.metric, alert.value)}{" "}
                          {definition.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-zinc-100 px-4 py-3 text-[10px] text-zinc-400 sm:px-5 dark:border-white/[0.06] dark:text-zinc-500">
        Monitoring temperature, humidity, and CO₂ thresholds.
      </div>
    </aside>
  );
}
