
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Reading, ReadingsResponse, TimeRange } from "@/lib/sensors";

type FetchStatus = "loading" | "ready" | "error";

interface ReadingsState {
  range: TimeRange | null;
  readings: Reading[];
  status: FetchStatus;
  error: string | null;
  lastUpdated: number | null;
}

const REFRESH_INTERVAL_MS = 2_000;

const initialState: ReadingsState = {
  range: null,
  readings: [],
  status: "loading",
  error: null,
  lastUpdated: null,
};

/**
 * Poll the readings API every two seconds.
 * Keeps the last successful data visible when a refresh fails,
 * and ignores responses from a stale range.
 */
export function useReadings(range: TimeRange) {
  const [state, setState] = useState<ReadingsState>(initialState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const retry = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let disposed = false;
    let inFlight = false;
    const controller = new AbortController();

    async function load(isInitial: boolean) {
      if (inFlight || disposed) return;

      inFlight = true;

      if (!isInitial) {
        setIsRefreshing(true);
      }

      try {
        const response = await fetch(`/api/readings?range=${range}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          let message = `Sensor service returned ${response.status}.`;

          try {
            const body = (await response.json()) as {
              error?: unknown;
            };

            if (typeof body.error === "string") {
              message = body.error;
            }
          } catch {
            // Keep the status-based message when the body is not JSON.
          }

          throw new Error(message);
        }

        const payload = (await response.json()) as ReadingsResponse;

        if (!Array.isArray(payload.readings)) {
          throw new Error(
            "Sensor service returned an unexpected payload."
          );
        }

        if (disposed) return;

        setState({
          range,
          readings: payload.readings,
          status: "ready",
          error: null,
          lastUpdated: payload.generatedAt ?? Date.now(),
        });
      } catch (error) {
        if (disposed || controller.signal.aborted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Unable to reach the sensor service.";

        setState((previous) => {
          const sameRange = previous.range === range;

          return {
            range,
            readings: sameRange ? previous.readings : [],
            status: "error",
            error: message,
            lastUpdated: sameRange ? previous.lastUpdated : null,
          };
        });
      } finally {
        if (!disposed) {
          setIsRefreshing(false);
        }

        inFlight = false;
      }
    }

    void load(true);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load(false);
      }
    }, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void load(false);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      disposed = true;
      controller.abort();
      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [range, retryToken]);

  const matchesRange = state.range === range;

  return {
    readings: matchesRange ? state.readings : [],
    status: matchesRange
      ? state.status
      : ("loading" as FetchStatus),
    error: matchesRange ? state.error : null,
    lastUpdated: matchesRange ? state.lastUpdated : null,
    isRefreshing,
    retry,
  };
}
