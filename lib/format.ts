import type { MetricKey, TimeRange } from "./sensors";
import { METRICS } from "./thresholds";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const clockFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

const weekdayTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  hour: "numeric",
});

const alertOtherDayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

const tooltipWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatMetricValue(metric: MetricKey, value: number): string {
  const { decimals } = METRICS[metric];
  if (decimals === 0) {
    return Math.round(value).toLocaleString("en-US");
  }
  return value.toFixed(decimals);
}

export function formatAxisValue(metric: MetricKey, value: number): string {
  return METRICS[metric].decimals === 0
    ? Math.round(value).toLocaleString("en-US")
    : String(value);
}

export function formatAxisTime(timestamp: number, range: TimeRange): string {
  if (range === "7d") return weekdayTimeFormatter.format(timestamp);
  return timeFormatter.format(timestamp);
}

export function formatTooltipTime(
  timestamp: number,
  range: TimeRange,
): string {
  if (range === "7d") return tooltipWeekdayFormatter.format(timestamp);
  return timeFormatter.format(timestamp);
}

export function formatClock(timestamp: number): string {
  return clockFormatter.format(timestamp);
}

export function formatAlertTime(timestamp: number): string {
  const now = new Date();
  const then = new Date(timestamp);
  const sameDay =
    now.getFullYear() === then.getFullYear() &&
    now.getMonth() === then.getMonth() &&
    now.getDate() === then.getDate();

  return sameDay
    ? timeFormatter.format(timestamp)
    : alertOtherDayFormatter.format(timestamp);
}
