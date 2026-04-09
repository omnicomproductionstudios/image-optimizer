import ImageOptimizer from "@/app/components/image-optimizer";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_16px_50px_rgba(18,38,63,0.08)] backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div>
              <p className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-sm font-bold uppercase tracking-[0.34em] text-transparent sm:text-base">
                Mahesh Bhatt
              </p>
              <p className="mt-1 text-sm text-slate-600">Frontend Developer</p>
            </div>
            <div className="flex justify-start lg:justify-center">
              <a
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
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
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                PNG
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                JPG
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                WebP
              </span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-[0_26px_70px_rgba(18,38,63,0.1)] backdrop-blur md:p-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              Clean, local, zero-upload compression
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                Compress images. Keep the quality.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                PNG, JPG, and WebP. No upload required.
              </p>
            </div>
          </div>
        </section>

        <ImageOptimizer />
      </div>
    </main>
  );
}
