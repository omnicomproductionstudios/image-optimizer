import ImageOptimizer from "@/app/components/image-optimizer";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[1.8rem] border border-white/80 bg-white/82 px-5 py-4 shadow-[0_18px_60px_rgba(18,38,63,0.08)] backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[0.8rem] bg-[linear-gradient(160deg,#020617_0%,#0f172a_100%)] text-sm font-bold uppercase tracking-[0.22em] text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
                MB
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-950 sm:text-xl">
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
                  xmlns="http://www.w3.org/2000/svg"
                  xmlSpace="preserve"
                  width={20}
                  height={20}
                  viewBox="0 0 382 382"
                >
                  <path
                    d="M347.445 0H34.555C15.471 0 0 15.471 0 34.555v312.889C0 366.529 15.471 382 34.555 382h312.889C366.529 382 382 366.529 382 347.444V34.555C382 15.471 366.529 0 347.445 0zM118.207 329.844c0 5.554-4.502 10.056-10.056 10.056H65.345c-5.554 0-10.056-4.502-10.056-10.056V150.403c0-5.554 4.502-10.056 10.056-10.056h42.806c5.554 0 10.056 4.502 10.056 10.056v179.441zM86.748 123.432c-22.459 0-40.666-18.207-40.666-40.666S64.289 42.1 86.748 42.1s40.666 18.207 40.666 40.666-18.206 40.666-40.666 40.666zM341.91 330.654a9.247 9.247 0 0 1-9.246 9.246H286.73a9.247 9.247 0 0 1-9.246-9.246v-84.168c0-12.556 3.683-55.021-32.813-55.021-28.309 0-34.051 29.066-35.204 42.11v97.079a9.246 9.246 0 0 1-9.246 9.246h-44.426a9.247 9.247 0 0 1-9.246-9.246V149.593a9.247 9.247 0 0 1 9.246-9.246h44.426a9.247 9.247 0 0 1 9.246 9.246v15.655c10.497-15.753 26.097-27.912 59.312-27.912 73.552 0 73.131 68.716 73.131 106.472v86.846z"
                    style={{
                      fill: "#0077b7",
                    }}
                  />
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
