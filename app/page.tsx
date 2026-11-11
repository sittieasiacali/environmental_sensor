import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden"
      >
        <div className="absolute -top-48 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute top-24 right-[-120px] h-[320px] w-[320px] rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute top-40 left-[-120px] h-[280px] w-[280px] rounded-full bg-violet-400/[0.07] blur-3xl dark:bg-violet-500/10" />
      </div>

      <main className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Dashboard />
      </main>
    </div>
  );
}
