import type { MetricKey, Reading } from "./sensors";

export type StatusLevel = "good" | "warning" | "elevated" | "critical";
export type Severity = Exclude<StatusLevel, "good">;

export interface StatusMeta {
  /** Short generic label, used for alert severity. */
  label: string;
  badge: string;
  dot: string;
  bar: string;
  soft: string;
  text: string;
  hex: string;
}

export const STATUS_META: Record<StatusLevel, StatusMeta> = {
  good: {
    label: "Good",
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
    bar: "from-emerald-400 to-teal-500",
    soft: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    hex: "#10b981",
  },
  warning: {
    label: "Watch",
    badge:
      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20",
    dot: "bg-amber-500",
    bar: "from-amber-400 to-yellow-500",
    soft: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    hex: "#f59e0b",
  },
  elevated: {
    label: "High",
    badge:
      "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20",
    dot: "bg-orange-500",
    bar: "from-orange-400 to-orange-600",
    soft: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    hex: "#f97316",
  },
  critical: {
    label: "Critical",
    badge:
      "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20",
    dot: "bg-rose-500",
    bar: "from-rose-400 to-red-600",
    soft: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    hex: "#ef4444",
  },
};

export interface AlertRule {
  severity: Severity;
  test: (value: number) => boolean;
  message: string;
}

export interface ChartBand {
  from: number;
  to: number;
  color: string;
}

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  unit: string;
  decimals: number;
  /** Hex colour used by Recharts and the sparkline. */
  color: string;
  iconTile: string;
  chartDomain: [number, number];
  axisTicks: number[];
  bands: ChartBand[];
  hint: string;
  alertRules: AlertRule[];
  getStatus: (value: number) => StatusLevel;
  getStatusLabel: (value: number) => string;
}

function temperatureStatus(value: number): StatusLevel {
  if (value >= 20 && value <= 26) return "good";
  if (value >= 18 && value <= 30) return "warning";
  return "critical";
}

function humidityStatus(value: number): StatusLevel {
  if (value < 20 || value > 70) return "critical";
  if (value >= 30 && value <= 60) return "good";
  return "warning";
}

function co2Status(value: number): StatusLevel {
  if (value < 800) return "good";
  if (value <= 1200) return "warning";
  if (value <= 2000) return "elevated";
  return "critical";
}

export const METRICS: Record<MetricKey, MetricDefinition> = {
  temperature: {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    decimals: 1,
    color: "#f97316",
    iconTile:
      "bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
    chartDomain: [16, 32],
    axisTicks: [16, 20, 24, 28, 32],
    bands: [
      { from: 20, to: 26, color: STATUS_META.good.hex },
      { from: 18, to: 20, color: STATUS_META.warning.hex },
      { from: 26, to: 30, color: STATUS_META.warning.hex },
    ],
    hint: "Comfort range 20–26 °C",
    alertRules: [
      {
        severity: "critical",
        test: (value) => value < 18,
        message: "Temperature fell below 18 °C",
      },
      {
        severity: "critical",
        test: (value) => value > 30,
        message: "Temperature exceeded 30 °C",
      },
      {
        severity: "warning",
        test: (value) => value < 20,
        message: "Temperature fell below 20 °C",
      },
      {
        severity: "warning",
        test: (value) => value > 26,
        message: "Temperature exceeded 26 °C",
      },
    ],
    getStatus: temperatureStatus,
    getStatusLabel: (value) => {
      const status = temperatureStatus(value);
      if (status === "good") return "Comfortable";
      if (status === "warning") return value < 20 ? "Cool" : "Warm";
      return value < 18 ? "Cold" : "Hot";
    },
  },
  humidity: {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    decimals: 1,
    color: "#0ea5e9",
    iconTile:
      "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
    chartDomain: [0, 100],
    axisTicks: [0, 25, 50, 75, 100],
    bands: [
      { from: 30, to: 60, color: STATUS_META.good.hex },
      { from: 20, to: 30, color: STATUS_META.warning.hex },
      { from: 60, to: 70, color: STATUS_META.warning.hex },
    ],
    hint: "Comfort range 30–60%",
    alertRules: [
      {
        severity: "critical",
        test: (value) => value < 20,
        message: "Humidity fell below 20%",
      },
      {
        severity: "critical",
        test: (value) => value > 70,
        message: "Humidity exceeded 70%",
      },
      {
        severity: "warning",
        test: (value) => value < 30,
        message: "Humidity fell below 30%",
      },
      {
        severity: "warning",
        test: (value) => value > 60,
        message: "Humidity exceeded 60%",
      },
    ],
    getStatus: humidityStatus,
    getStatusLabel: (value) => {
      const status = humidityStatus(value);
      if (status === "good") return "Comfortable";
      if (status === "warning") return value < 30 ? "Dry" : "Humid";
      return value < 20 ? "Very dry" : "Very humid";
    },
  },
  co2: {
    key: "co2",
    label: "CO₂",
    unit: "ppm",
    decimals: 0,
    color: "#8b5cf6",
    iconTile:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
    chartDomain: [300, 1600],
    axisTicks: [400, 800, 1200, 1600],
    bands: [
      { from: 300, to: 800, color: STATUS_META.good.hex },
      { from: 800, to: 1200, color: STATUS_META.warning.hex },
      { from: 1200, to: 1600, color: STATUS_META.elevated.hex },
    ],
    hint: "Alert above 1,200 ppm",
    alertRules: [
      {
        severity: "critical",
        test: (value) => value > 2000,
        message: "CO₂ exceeded 2,000 ppm",
      },
      {
        severity: "elevated",
        test: (value) => value > 1200,
        message: "CO₂ exceeded 1,200 ppm",
      },
    ],
    getStatus: co2Status,
    getStatusLabel: (value) => {
      const status = co2Status(value);
      if (status === "good") return "Good";
      if (status === "warning") return "Moderate";
      if (status === "elevated") return "High";
      return "Critical";
    },
  },
};

export const METRIC_KEYS: readonly MetricKey[] = [
  "temperature",
  "humidity",
  "co2",
];

export interface Alert {
  id: string;
  metric: MetricKey;
  severity: Severity;
  message: string;
  timestamp: number;
  value: number;
}

const SEVERITY_RANK: Record<Severity, number> = {
  warning: 1,
  elevated: 2,
  critical: 3,
};

/** Suppress repeat alerts while a metric flaps around a threshold. */
const ALERT_COOLDOWN_MS = 20 * 60_000;

/**
 * Walk the series and emit an alert when a metric enters (or escalates into)
 * a breach. Only the most severe matching rule fires for a sample.
 */
export function detectAlerts(readings: Reading[], limit = 8): Alert[] {
  const alerts: Alert[] = [];
  const previousSeverity = new Map<MetricKey, Severity | null>();
  const lastAlertAt = new Map<MetricKey, number>();

  for (const reading of readings) {
    for (const metric of METRIC_KEYS) {
      const definition = METRICS[metric];
      const value = reading[metric];

      const breached = definition.alertRules
        .filter((rule) => rule.test(value))
        .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])[0];

      if (!breached) {
        previousSeverity.set(metric, null);
        continue;
      }

      const previous = previousSeverity.get(metric) ?? null;
      const escalated =
        previous === null ||
        SEVERITY_RANK[breached.severity] > SEVERITY_RANK[previous];
      const cooledDown =
        reading.timestamp - (lastAlertAt.get(metric) ?? -Infinity) >=
        ALERT_COOLDOWN_MS;

      if (escalated && cooledDown) {
        alerts.push({
          id: `${metric}-${breached.severity}-${reading.timestamp}`,
          metric,
          severity: breached.severity,
          message: breached.message,
          timestamp: reading.timestamp,
          value,
        });
        lastAlertAt.set(metric, reading.timestamp);
      }

      previousSeverity.set(metric, breached.severity);
    }
  }

  return alerts.reverse().slice(0, limit);
}

export function findReadingNear(
  readings: Reading[],
  timestamp: number,
): Reading | null {
  let closest: Reading | null = null;
  let closestDistance = Infinity;

  for (const reading of readings) {
    const distance = Math.abs(reading.timestamp - timestamp);
    if (distance < closestDistance) {
      closest = reading;
      closestDistance = distance;
    }
  }

  return closest;
}
