/**
 * Sensor data service.
 *
 * This is the only place the dashboard talks to for readings. To connect a
 * real sensor (MQTT, ESP32 HTTP post, Supabase, ...), replace the body of
 * `getReadings` below. Keep the `Reading` shape and the UI keeps working.
 */

export type MetricKey = "temperature" | "humidity" | "co2";

export type TimeRange = "1h" | "24h" | "7d";

export const TIME_RANGES: readonly TimeRange[] = ["1h", "24h", "7d"];

export interface Reading {
  /** Unix epoch milliseconds. */
  timestamp: number;
  /** Degrees Celsius. */
  temperature: number;
  /** Relative humidity, percent. */
  humidity: number;
  /** Carbon dioxide, parts per million. */
  co2: number;
}

export interface ReadingsResponse {
  range: TimeRange;
  readings: Reading[];
  /** Unix epoch milliseconds when the response was produced. */
  generatedAt: number;
  source: "mock" | "sensor";
}

export interface RangeConfig {
  label: string;
  shortLabel: string;
  description: string;
  durationMs: number;
  /** Spacing between historical samples. */
  stepMs: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const RANGE_CONFIG: Record<TimeRange, RangeConfig> = {
  "1h": {
    label: "Last hour",
    shortLabel: "1h",
    description: "past hour",
    durationMs: HOUR,
    stepMs: MINUTE,
  },
  "24h": {
    label: "24 hours",
    shortLabel: "24h",
    description: "past 24 hours",
    durationMs: DAY,
    stepMs: 5 * MINUTE,
  },
  "7d": {
    label: "7 days",
    shortLabel: "7d",
    description: "past 7 days",
    durationMs: 7 * DAY,
    stepMs: 30 * MINUTE,
  },
};

export function isTimeRange(value: string | null | undefined): value is TimeRange {
  return value === "1h" || value === "24h" || value === "7d";
}

/** Mock data is deterministic for a given timestamp, so refreshes drift smoothly. */
export const DATA_SOURCE: ReadingsResponse["source"] = "mock";

const EPOCH = Date.UTC(2024, 0, 1);

function minutesAt(timestamp: number): number {
  return (timestamp - EPOCH) / MINUTE;
}

function hash01(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

/** Value noise in [0, 1): smooth, deterministic, and continuous between samples. */
function smoothNoise(t: number, periodMinutes: number, seed: number): number {
  const position = t / periodMinutes;
  const index = Math.floor(position);
  const fraction = position - index;
  // Smoothstep interpolation removes the hard corners of linear interpolation.
  const eased = fraction * fraction * (3 - 2 * fraction);
  const a = hash01(index * 1.618 + seed * 97.13);
  const b = hash01((index + 1) * 1.618 + seed * 97.13);
  return a + (b - a) * eased;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function temperatureAt(timestamp: number): number {
  const t = minutesAt(timestamp);
  const value =
    24.6 +
    1.35 * Math.sin(t / 260 + 0.4) +
    0.75 * Math.sin(t / 43 + 1.1) +
    0.5 * (smoothNoise(t, 13, 1) - 0.5) * 2;

  return round(clamp(value, 22, 28), 1);
}

function humidityAt(timestamp: number): number {
  const t = minutesAt(timestamp);
  const value =
    51.5 +
    7.5 * Math.sin(t / 310 + 2.1) +
    3.8 * Math.sin(t / 57 + 0.5) +
    1.5 * (smoothNoise(t, 17, 3) - 0.5) * 2;

  return round(clamp(value, 40, 65), 1);
}

/**
 * Occasional occupancy-style CO2 spikes. Each ~47 minute window has a chance
 * of containing a smooth bump, so spikes appear in every time range without
 * making the baseline jump around.
 */
function co2SpikeAt(timestamp: number): number {
  const t = minutesAt(timestamp);
  const windowMinutes = 47;
  const windowIndex = Math.floor(t / windowMinutes);
  let total = 0;

  for (let index = windowIndex - 1; index <= windowIndex + 1; index += 1) {
    const chance = hash01(index * 1.7 + 11.3);
    if (chance < 0.45) continue;

    const center =
      (index + 0.25 + 0.5 * hash01(index * 2.3 + 5.1)) * windowMinutes;
    const amplitude = 420 + 560 * hash01(index * 3.1 + 7.7);
    const width = 5 + 5 * hash01(index * 4.7 + 2.9);
    const distance = t - center;

    total += amplitude * Math.exp(-(distance * distance) / (2 * width * width));
  }

  return total;
}

function co2At(timestamp: number): number {
  const t = minutesAt(timestamp);
  const baseline =
    610 +
    165 * Math.sin(t / 340 + 0.9) +
    85 * Math.sin(t / 53 + 2.4) +
    35 * (smoothNoise(t, 19, 7) - 0.5) * 2;

  return Math.round(clamp(baseline + co2SpikeAt(timestamp), 400, 1500));
}

function readingAt(timestamp: number): Reading {
  return {
    timestamp,
    temperature: temperatureAt(timestamp),
    humidity: humidityAt(timestamp),
    co2: co2At(timestamp),
  };
}

function buildTimestamps(range: TimeRange, now: number): number[] {
  const { durationMs, stepMs } = RANGE_CONFIG[range];
  const timestamps: number[] = [];

  for (let timestamp = now; timestamp >= now - durationMs; timestamp -= stepMs) {
    timestamps.push(timestamp);
  }

  // The 7 day view is coarse (30 min). Add a detailed final hour so the
  // "current vs 5 minutes ago" trend has an exact reference point and the
  // right edge of the chart shows recent movement.
  if (stepMs > 5 * MINUTE) {
    for (let timestamp = now - HOUR; timestamp < now; timestamp += 5 * MINUTE) {
      timestamps.push(timestamp);
    }
  }

  return Array.from(new Set(timestamps)).sort((a, b) => a - b);
}

/**
 * Return readings for the selected range, oldest first.
 *
 * Swap this implementation for a database or MQTT-backed query later. The
 * function is async on purpose so a network/database call can slot in without
 * changing any component.
 */
export async function getReadings(range: TimeRange): Promise<Reading[]> {
  const now = Date.now();
  return buildTimestamps(range, now).map(readingAt);
}
