import ImageOptimizer from "@/app/components/image-optimizer";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[1.8rem] border border-white/80 bg-white/82 px-5 py-4 shadow-[0_18px_60px_rgba(18,38,63,0.08)] backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(160deg,#020617_0%,#0f172a_100%)] text-sm font-bold uppercase tracking-[0.22em] text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
                MB
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-[0.14em] text-slate-950 sm:text-xl">
                  MAHESH BHATT
                </p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                  Frontend Developer
                </p>
              </div>
            </div>
            <div className="flex justify-start lg:justify-center">
              <a
                className="inline-flex items-center gap-2 rounded-full border border-[#0A66C2]/18 bg-[linear-gradient(180deg,#F4FAFF_0%,#E8F3FF_100%)] px-4 py-2 text-sm font-semibold text-[#0A66C2] shadow-[0_8px_20px_rgba(10,102,194,0.08)] transition hover:border-[#0A66C2]/35 hover:bg-[#DCEEFF]"
                href="https://www.linkedin.com/in/mahesh-bhatt-developer"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.48 1h.02C3.87 1 4.98 2.12 4.98 3.5ZM.5 8h4V24h-4V8ZM8 8h3.83v2.19h.05c.53-1.01 1.84-2.19 3.79-2.19 4.05 0 4.8 2.67 4.8 6.13V24h-4v-7.01c0-1.67-.03-3.82-2.33-3.82-2.33 0-2.69 1.82-2.69 3.7V24H8V8Z" />
                </svg>
                Connect with me
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 lg:justify-end">
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-2">
                PNG
              </span>
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-2">
                JPG
              </span>
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-2">
                WebP
              </span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/82 p-7 shadow-[0_28px_70px_rgba(18,38,63,0.1)] backdrop-blur md:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-700">
              Clean, local, zero-upload compression
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
                Compress images. Keep the quality.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                PNG, JPG, and WebP. No upload required.
              </p>
            </div>
            <div className="h-px w-full max-w-3xl bg-gradient-to-r from-sky-200 via-slate-200 to-transparent" />
          </div>
        </section>

        <ImageOptimizer />
      </div>
    </main>
  );
}
