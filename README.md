# Atmos — Environmental Monitoring Dashboard

A responsive, mobile-first dashboard for temperature, humidity, and CO₂. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Recharts.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![Stack](https://img.shields.io/badge/TypeScript-5-blue) ![Stack](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Stack](https://img.shields.io/badge/Recharts-3-8b5cf6)

## Features

- Three live stat cards with current value, status colour, 5-minute trend, range min/max, and a sparkline.
- Three synchronised time-series charts with shared hover tooltips and threshold bands.
- Time range selector: last hour, 24 hours, and 7 days.
- Auto-refresh every 5 seconds with a live/offline indicator and last-updated timestamp.
- Alerts panel that detects threshold breaches in the selected range.
- Light/dark mode toggle, persisted in `localStorage`, with no flash on load.
- Loading skeletons, empty state, stale-data banner, and retryable error state.
- Mock data layer that is deterministic and smoothly drifting, so refreshes look live.

## Getting started

Requires **Node.js 20.9+** and npm.

```bash
cd env-monitor
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the development server   |
| `npm run build` | Create a production build      |
| `npm run start` | Serve the production build     |
| `npm run lint`  | Run ESLint                     |

## How it fits together

```
Browser (poll every 5s)
  └─ useReadings hook
       └─ GET /api/readings?range=1h
            └─ lib/sensors.ts → getReadings(range)
                 └─ mock generator (swap this for a real source)
```

The UI only depends on the JSON contract from the API, not on the mock generator. That keeps the data source swappable.

### API

```http
GET /api/readings?range=1h
```

Valid ranges: `1h`, `24h`, `7d` (defaults to `1h`). Responses are sent with `Cache-Control: no-store`.

```json
{
  "range": "1h",
  "readings": [
    {
      "timestamp": 1762700000000,
      "temperature": 24.6,
      "humidity": 51.4,
      "co2": 742
    }
  ],
  "generatedAt": 1762700000000,
  "source": "mock"
}
```

- `timestamp` and `generatedAt` are Unix epoch milliseconds.
- `readings` are ordered oldest → newest.
- `source` is `"mock"` or `"sensor"`.

### Project structure

```
env-monitor/
├── app/
│   ├── api/readings/route.ts     # GET /api/readings?range=...
│   ├── globals.css               # Tailwind, theme tokens, chart colours
│   ├── layout.tsx                # Fonts, metadata, no-flash theme script
│   └── page.tsx                  # Page shell and background
├── components/
│   ├── AlertsPanel.tsx           # Recent threshold breaches
│   ├── Dashboard.tsx             # Client-side dashboard orchestration
│   ├── DashboardStates.tsx       # Skeleton, empty, error, stale banner
│   ├── LiveIndicator.tsx         # Live/offline + last updated
│   ├── MetricChart.tsx           # Recharts area chart per metric
│   ├── RangeSelector.tsx         # 1h / 24h / 7d control
│   ├── Sparkline.tsx             # Lightweight inline SVG sparkline
│   ├── StatCard.tsx              # Current value, status, trend, min/max
│   └── ThemeToggle.tsx           # Light/dark toggle
├── hooks/
│   └── useReadings.ts            # Polling, abort handling, retry, stale data
├── lib/
│   ├── format.ts                 # Number and time formatting
│   ├── sensors.ts                # Data types + mock getReadings(range)
│   └── thresholds.ts             # Status rules, alerts, metric metadata
└── README.md
```

## Threshold rules

| Metric      | Green           | Yellow                   | Orange         | Red              |
| ----------- | --------------- | ------------------------ | -------------- | ---------------- |
| CO₂         | `< 800 ppm`     | `800–1,200 ppm`          | `1,200–2,000`  | `> 2,000 ppm`    |
| Humidity    | `30–60%`        | outside `30–60%`         | —              | `< 20%` / `> 70%` |
| Temperature | `20–26 °C`      | `18–20` / `26–30 °C`     | —              | outside `18–30 °C` |

Alerts are emitted when a metric enters (or escalates into) a breach. A 20-minute cooldown per metric prevents noisy flapping alerts. The panel shows the eight most recent breaches in the selected range.

## Connecting a real sensor

All sensor access goes through **`lib/sensors.ts` → `getReadings(range)`**. Replace its body, keep the `Reading[]` return shape, and the rest of the dashboard keeps working.

```ts
// lib/sensors.ts
export async function getReadings(range: TimeRange): Promise<Reading[]> {
  // 1. Query your database / sensor API for the selected range.
  // 2. Map rows to { timestamp, temperature, humidity, co2 }.
  // 3. Return oldest → newest.
}
```

Also change `DATA_SOURCE` to `"sensor"` so the API reports the new source.

### Option A — Supabase (or any SQL database)

Store one row per sample. Use the **service role key only on the server** (this file is imported by a Route Handler, never by a client component).

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export async function getReadings(range: TimeRange): Promise<Reading[]> {
  const { durationMs } = RANGE_CONFIG[range];
  const since = new Date(Date.now() - durationMs).toISOString();

  const { data, error } = await supabase
    .from("readings")
    .select("timestamp, temperature, humidity, co2")
    .gte("timestamp", since)
    .order("timestamp", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    timestamp: new Date(row.timestamp).getTime(),
    temperature: Number(row.temperature),
    humidity: Number(row.humidity),
    co2: Number(row.co2),
  }));
}
```

Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.

### Option B — ESP32 / Arduino HTTP POST

Add an ingest route that accepts samples and writes them to your database. Protect it with a shared secret.

```ts
// app/api/ingest/route.ts
export async function POST(request: Request) {
  if (request.headers.get("x-api-key") !== process.env.SENSOR_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    temperature: number;
    humidity: number;
    co2: number;
  };

  // Insert { ...body, timestamp: new Date() } into your database here.

  return Response.json({ ok: true }, { status: 201 });
}
```

The device can then send:

```http
POST /api/ingest
Content-Type: application/json
x-api-key: <SENSOR_API_KEY>

{"temperature":24.6,"humidity":51.2,"co2":780}
```

Then implement `getReadings` to read those stored rows.

### Option C — MQTT

Don't keep a long-lived MQTT connection inside a Next.js request handler. Run a small collector (Node.js, Python, or a broker integration) that subscribes to your topic and writes samples to a database. Point `getReadings` at that database, exactly like Option A.

```
ESP32 → MQTT broker → collector → database → getReadings() → /api/readings
```

### Keep the contract

If you change the storage or transport, preserve:

- `timestamp` in epoch milliseconds,
- numeric `temperature`, `humidity`, and `co2`,
- ascending timestamp order,
- the `Reading[]` return type.

The API route, hook, cards, charts, and alerts all rely only on that.

## Notes

- The mock generator is deterministic for a given wall-clock time. Values drift smoothly between polls, CO₂ has occasional occupancy-style spikes, and a 7-day view includes a finer-grained final hour.
- The dark/light preference is stored under the `theme` key in `localStorage`; without a saved value it follows the OS preference.
- Charts use Recharts `syncId`, so hovering any chart shows the same timestamp on the other two.
