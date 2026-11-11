
import type { Reading } from "@/lib/sensors";

// Temporary storage for ESP32 sensor readings.
const sensorReadings: Reading[] = [];

const MAX_READINGS = 10000;

// Save a new sensor reading.
export function saveSensorReading(reading: Reading): void {
  sensorReadings.push(reading);

  // Prevent unlimited memory usage.
  if (sensorReadings.length > MAX_READINGS) {
    sensorReadings.shift();
  }
}

// Get all stored sensor readings.
export function getSensorReadings(): Reading[] {
  return [...sensorReadings];
}

// Get the most recent sensor reading.
export function getLatestSensorReading(): Reading | null {
  if (sensorReadings.length === 0) {
    return null;
  }

  return sensorReadings[sensorReadings.length - 1];
}
