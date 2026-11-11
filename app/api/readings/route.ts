
import {
  getReadings,
  isTimeRange,
  RANGE_CONFIG,
} from "@/lib/sensors";

import {
  getSensorReadings,
  saveSensorReading,
} from "@/lib/sensor-store";

// =====================================
// GET: Retrieve sensor readings
// =====================================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedRange = searchParams.get("range");

  if (requestedRange !== null && !isTimeRange(requestedRange)) {
    return Response.json(
      { error: "Invalid time range. Use 1h, 24h, or 7d." },
      { status: 400 },
    );
  }

  const range = requestedRange ?? "1h";

  try {
    const cutoff = Date.now() - RANGE_CONFIG[range].durationMs;

    const storedReadings = getSensorReadings()
      .filter((reading) => reading.timestamp >= cutoff)
      .sort((a, b) => a.timestamp - b.timestamp);

    // Use ESP32 readings when available.
    // Otherwise, retain the existing mock dashboard data.
    const hasSensorData = storedReadings.length > 0;

    const readings = hasSensorData
      ? storedReadings
      : await getReadings(range);

    return Response.json(
      {
        range,
        readings,
        generatedAt: Date.now(),
        source: hasSensorData ? "sensor" : "mock",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load sensor readings:", error);

    return Response.json(
      { error: "Unable to load sensor readings." },
      { status: 500 },
    );
  }
}

// =====================================
// POST: Receive ESP32 sensor readings
// =====================================

export async function POST(request: Request) {
  // Check API authentication.
  const expectedToken = process.env.SENSOR_API_TOKEN;
  const providedToken = request.headers.get("x-api-key");

  if (!expectedToken) {
    return Response.json(
      { error: "Sensor API token is not configured." },
      { status: 503 },
    );
  }

  if (!providedToken || providedToken !== expectedToken) {
    return Response.json(
      { error: "Unauthorized sensor request." },
      { status: 401 },
    );
  }

  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return Response.json(
        { error: "Invalid sensor data." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const { temperature, humidity, co2 } = data;

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof co2 !== "number" ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(humidity) ||
      !Number.isFinite(co2) ||
      temperature < -40 ||
      temperature > 80 ||
      humidity < 0 ||
      humidity > 100 ||
      co2 < 0 ||
      co2 > 10000
    ) {
      return Response.json(
        { error: "Invalid temperature, humidity, or CO2 values." },
        { status: 400 },
      );
    }

    const reading = {
      timestamp: Date.now(),
      temperature,
      humidity,
      co2,
    };

    saveSensorReading(reading);

    return Response.json(
      {
        message: "Sensor reading received successfully.",
        reading,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to receive sensor reading:", error);

    return Response.json(
      { error: "Unable to process sensor reading." },
      { status: 400 },
    );
  }
}
