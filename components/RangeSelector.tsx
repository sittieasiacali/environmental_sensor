"use client";

import { RANGE_CONFIG, TIME_RANGES, type TimeRange } from "@/lib/sensors";

interface RangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Time range"
      className="flex w-full items-center gap-1 rounded-xl border border-zinc-200/80 bg-white/80 p-1 shadow-sm backdrop-blur sm:w-auto dark:border-white/10 dark:bg-white/5"
    >
      {TIME_RANGES.map((range) => {
        const active = range === value;
        return (
          <button
            key={range}
            type="button"
            onClick={() => onChange(range)}
            aria-pressed={active}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:flex-none ${
              active
                ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <span className="sm:hidden">{RANGE_CONFIG[range].shortLabel}</span>
            <span className="hidden sm:inline">{RANGE_CONFIG[range].label}</span>
          </button>
        );
      })}
    </div>
  );
}
