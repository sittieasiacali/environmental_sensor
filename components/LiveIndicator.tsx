"use client";

import { formatClock } from "@/lib/format";

type ConnectionStatus = "loading" | "ready" | "error";

interface LiveIndicatorProps {
  status: ConnectionStatus;
  lastUpdated: number | null;
}

const STATUS_COPY: Record<
  ConnectionStatus,
  { label: string; dot: string; text: string }
> = {
  loading: {
    label: "Connecting",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  ready: {
    label: "Live",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  error: {
    label: "Offline",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-400",
  },
};

export function LiveIndicator({ status, lastUpdated }: LiveIndicatorProps) {
  const copy = STATUS_COPY[status];

  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
      aria-live="polite"
    >
      <span className="relative flex size-2" aria-hidden="true">
        {status === "ready" ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
        ) : null}
        <span
          className={`relative inline-flex size-2 rounded-full ${copy.dot}`}
        />
      </span>
      <span className={`font-semibold ${copy.text}`}>{copy.label}</span>
      <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">
        ·
      </span>
      <span className="text-zinc-500 dark:text-zinc-400">
        {lastUpdated
          ? `Last updated ${formatClock(lastUpdated)}`
          : "Waiting for data"}
      </span>
      <span className="hidden text-zinc-400 sm:inline dark:text-zinc-500">
        · 5s refresh
      </span>
    </div>
  );
}
