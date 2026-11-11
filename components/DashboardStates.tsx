import { Activity, RefreshCw, WifiOff } from "lucide-react";
import { formatClock } from "@/lib/format";

const retryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-[#070b09]";

export function DashboardSkeleton() {
  return (
    <div
      className="mt-6 space-y-4"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading sensor readings…</span>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-zinc-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 animate-pulse rounded-xl bg-zinc-200/80 motion-reduce:animate-none dark:bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-zinc-200/80 motion-reduce:animate-none dark:bg-white/10" />
                  <div className="h-2.5 w-8 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.06]" />
                </div>
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.06]" />
            </div>
            <div className="mt-6 h-9 w-32 animate-pulse rounded-lg bg-zinc-200/80 motion-reduce:animate-none dark:bg-white/10" />
            <div className="mt-5 h-10 w-full animate-pulse rounded-lg bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.05]" />
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.05]" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 animate-pulse rounded-xl bg-zinc-200/80 motion-reduce:animate-none dark:bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-zinc-200/80 motion-reduce:animate-none dark:bg-white/10" />
                    <div className="h-2.5 w-32 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.06]" />
                  </div>
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.06]" />
              </div>
              <div className="mt-5 h-[210px] animate-pulse rounded-xl bg-zinc-100/80 motion-reduce:animate-none sm:h-[235px] dark:bg-white/[0.04]" />
            </div>
          ))}
        </div>

        <div className="h-[420px] rounded-2xl border border-zinc-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="size-9 animate-pulse rounded-xl bg-zinc-200/80 motion-reduce:animate-none dark:bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-zinc-200/80 motion-reduce:animate-none dark:bg-white/10" />
              <div className="h-2.5 w-40 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.06]" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-zinc-100 motion-reduce:animate-none dark:bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string | null;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white/80 px-6 py-12 text-center shadow-sm backdrop-blur sm:py-16 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
        <WifiOff className="size-6" strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
        Can&apos;t reach the sensor service
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {message ?? "Something went wrong while loading readings."}
      </p>
      <button type="button" onClick={onRetry} className={`${retryButton} mt-6`}>
        <RefreshCw className="size-4" strokeWidth={2} />
        Try again
      </button>
    </div>
  );
}

interface EmptyStateProps {
  onRefresh: () => void;
}

export function EmptyState({ onRefresh }: EmptyStateProps) {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white/80 px-6 py-12 text-center shadow-sm backdrop-blur sm:py-16 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
        <Activity className="size-6" strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
        No readings for this range
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        The sensor service returned an empty series. Check the connection or try
        another time range.
      </p>
      <button
        type="button"
        onClick={onRefresh}
        className={`${retryButton} mt-6`}
      >
        <RefreshCw className="size-4" strokeWidth={2} />
        Refresh
      </button>
    </div>
  );
}

interface StaleBannerProps {
  message: string | null;
  lastUpdated: number | null;
  onRetry: () => void;
}

export function StaleBanner({
  message,
  lastUpdated,
  onRetry,
}: StaleBannerProps) {
  return (
    <div
      role="alert"
      title={message ?? undefined}
      className="mt-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm sm:flex-row sm:items-center dark:border-rose-500/20 dark:bg-rose-500/10"
    >
      <WifiOff
        className="size-4 shrink-0 text-rose-600 dark:text-rose-400"
        strokeWidth={2}
      />
      <p className="flex-1 text-rose-800 dark:text-rose-200">
        Connection lost. Showing the last readings
        {lastUpdated ? ` from ${formatClock(lastUpdated)}` : ""}.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 sm:self-auto dark:text-rose-300 dark:hover:bg-rose-500/10"
      >
        <RefreshCw className="size-3.5" strokeWidth={2} />
        Retry
      </button>
    </div>
  );
}
