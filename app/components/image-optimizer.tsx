"use client";

import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import Image from "next/image";
import { startTransition, useEffect, useRef, useState } from "react";
import UPNG from "upng-js";

type OutputFormat = "original" | "image/webp";
type ItemStatus = "pending" | "processing" | "done" | "error";

type ImageRecord = {
  compressedFile?: File;
  compressedSize?: number;
  compressedUrl?: string;
  dimensions: { height: number; width: number };
  error?: string;
  id: string;
  name: string;
  originalFile: File;
  originalSize: number;
  originalUrl: string;
  outputType?: string;
  reductionPercent?: number;
  status: ItemStatus;
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const DEFAULT_QUALITY = 76;
const DEFAULT_MAX_DIMENSION = 2200;

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unit;

  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function clampQuality(value: number) {
  return Math.min(95, Math.max(25, value));
}

function getTargetDimensions(width: number, height: number, maxDimension: number) {
  const limit = Math.max(320, maxDimension);
  const largestSide = Math.max(width, height);

  if (largestSide <= limit) {
    return { height, width };
  }

  const scale = limit / largestSide;

  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

function replaceExtension(filename: string, nextExtension: string) {
  return filename.replace(/\.[^.]+$/, "") + nextExtension;
}

async function getImageDimensions(file: File) {
  const bitmap = await createImageBitmap(file);
  const dimensions = { height: bitmap.height, width: bitmap.width };
  bitmap.close();
  return dimensions;
}

async function drawImageToCanvas(
  file: File,
  maxDimension: number,
): Promise<{
  context: CanvasRenderingContext2D;
  height: number;
  width: number;
}> {
  const bitmap = await createImageBitmap(file);
  const { height, width } = getTargetDimensions(bitmap.width, bitmap.height, maxDimension);
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    bitmap.close();
    throw new Error("Canvas rendering is unavailable in this browser.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return { context, height, width };
}

async function compressPng(file: File, quality: number, maxDimension: number) {
  const { context, height, width } = await drawImageToCanvas(file, maxDimension);
  const imageData = context.getImageData(0, 0, width, height);
  const paletteSize = Math.max(16, Math.round((quality / 100) * 256));
  const encoded = UPNG.encode([imageData.data.buffer], width, height, paletteSize);

  return new File([encoded], replaceExtension(file.name, ".png"), {
    type: "image/png",
  });
}

async function compressRaster(
  file: File,
  quality: number,
  maxDimension: number,
  outputFormat: OutputFormat,
) {
  const targetType = outputFormat === "image/webp" ? "image/webp" : file.type;

  return imageCompression(file, {
    alwaysKeepResolution: false,
    fileType: targetType,
    initialQuality: quality / 100,
    maxWidthOrHeight: maxDimension,
    preserveExif: false,
    useWebWorker: true,
  });
}

async function compressFile(
  file: File,
  quality: number,
  maxDimension: number,
  outputFormat: OutputFormat,
) {
  if (outputFormat !== "image/webp" && file.type === "image/png") {
    return compressPng(file, quality, maxDimension);
  }

  return compressRaster(file, quality, maxDimension, outputFormat);
}

function downloadBlob(file: Blob, filename: string) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function formatOutputType(type?: string) {
  if (!type) {
    return "--";
  }

  return type.replace("image/", "").toUpperCase();
}

export default function ImageOptimizer() {
  const [items, setItems] = useState<ImageRecord[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [maxDimension, setMaxDimension] = useState(DEFAULT_MAX_DIMENSION);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [warning, setWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of objectUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const totalOriginal = items.reduce((sum, item) => sum + item.originalSize, 0);
  const totalCompressed = items.reduce(
    (sum, item) => sum + (item.compressedSize ?? item.originalSize),
    0,
  );
  const finishedItems = items.filter((item) => item.status === "done").length;
  const totalSavings =
    totalOriginal > 0 ? Math.max(0, ((totalOriginal - totalCompressed) / totalOriginal) * 100) : 0;

  async function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const supported = incoming.filter((file) => ACCEPTED_TYPES.includes(file.type));
    const rejectedCount = incoming.length - supported.length;

    if (rejectedCount > 0) {
      setWarning("Only PNG, JPG, and WebP images can be optimized right now.");
    } else {
      setWarning(null);
    }

    if (supported.length === 0) {
      return;
    }

    const prepared = await Promise.all(
      supported.map(async (file) => {
        const originalUrl = URL.createObjectURL(file);
        const dimensions = await getImageDimensions(file);

        objectUrlsRef.current.push(originalUrl);

        return {
          dimensions,
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          originalFile: file,
          originalSize: file.size,
          originalUrl,
          status: "pending" as const,
        };
      }),
    );

    startTransition(() => {
      setItems((current) => [...current, ...prepared]);
    });
  }

  async function runCompression() {
    if (items.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setWarning(null);

    try {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];

        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  error: undefined,
                  status: "processing",
                }
              : entry,
          ),
        );

        try {
          const compressed = await compressFile(
            item.originalFile,
            clampQuality(quality),
            maxDimension,
            outputFormat,
          );
          const compressedUrl = URL.createObjectURL(compressed);
          const nextName =
            outputFormat === "image/webp"
              ? replaceExtension(item.name, ".webp")
              : compressed.name || item.name;

          objectUrlsRef.current.push(compressedUrl);

          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    compressedFile: new File([compressed], nextName, {
                      type: compressed.type || entry.originalFile.type,
                    }),
                    compressedSize: compressed.size,
                    compressedUrl,
                    outputType: compressed.type || entry.originalFile.type,
                    reductionPercent: Math.max(
                      0,
                      ((entry.originalSize - compressed.size) / entry.originalSize) * 100,
                    ),
                    status: "done",
                  }
                : entry,
            ),
          );
        } catch (error) {
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    error:
                      error instanceof Error
                        ? error.message
                        : "This image could not be optimized.",
                    status: "error",
                  }
                : entry,
            ),
          );
        }

        setProgress(Math.round(((index + 1) / items.length) * 100));
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function resetWorkspace() {
    for (const url of objectUrlsRef.current) {
      URL.revokeObjectURL(url);
    }

    objectUrlsRef.current = [];
    setItems([]);
    setProgress(0);
    setWarning(null);
  }

  async function downloadAllAsZip() {
    const ready = items.filter((item) => item.compressedFile);

    if (ready.length === 0) {
      return;
    }

    const zip = new JSZip();

    for (const item of ready) {
      zip.file(item.compressedFile!.name, item.compressedFile!);
    }

    const archive = await zip.generateAsync({ type: "blob" });
    downloadBlob(archive, "optimized-images.zip");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="rounded-[1.75rem] border border-white/70 bg-white/82 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Controls
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Tune the output
            </h2>
          </div>

          <label className="block space-y-3 rounded-[1.4rem] border border-slate-200/70 bg-slate-50/85 p-4">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Compression strength</span>
              <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-900">
                {quality}%
              </span>
            </div>
            <input
              className="w-full accent-sky-600"
              max={95}
              min={25}
              onChange={(event) => setQuality(Number(event.target.value))}
              type="range"
              value={quality}
            />
            <p className="text-sm leading-6 text-slate-500">Lower = smaller files</p>
          </label>

          <label className="block space-y-3 rounded-[1.4rem] border border-slate-200/70 bg-slate-50/85 p-4">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Max dimension</span>
              <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-900">
                {maxDimension}px
              </span>
            </div>
            <input
              className="w-full accent-sky-600"
              max={3840}
              min={640}
              onChange={(event) => setMaxDimension(Number(event.target.value))}
              step={80}
              type="range"
              value={maxDimension}
            />
            <p className="text-sm leading-6 text-slate-500">Resize before export</p>
          </label>

          <fieldset className="space-y-3 rounded-[1.4rem] border border-slate-200/70 bg-slate-50/85 p-4">
            <legend className="text-sm text-slate-700">Output format</legend>
            <div className="grid gap-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  checked={outputFormat === "original"}
                  className="mt-1 accent-sky-600"
                  name="output-format"
                  onChange={() => setOutputFormat("original")}
                  type="radio"
                />
                <span>
                  <span className="block font-medium text-slate-900">
                    Keep original format
                  </span>
                  <span className="block text-sm leading-6 text-slate-500">
                    Same file type
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  checked={outputFormat === "image/webp"}
                  className="mt-1 accent-sky-600"
                  name="output-format"
                  onChange={() => setOutputFormat("image/webp")}
                  type="radio"
                />
                <span>
                  <span className="block font-medium text-slate-900">
                    Convert to WebP
                  </span>
                  <span className="block text-sm leading-6 text-slate-500">
                    Smaller web output
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <div className="rounded-[1.5rem] bg-[linear-gradient(155deg,#0f172a_0%,#172554_100%)] p-5 text-slate-50">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">
              Session stats
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <p className="text-3xl font-semibold">{items.length}</p>
                <p className="text-sm text-slate-400">images loaded</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{formatBytes(totalOriginal)}</p>
                <p className="text-sm text-slate-400">original total</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{totalSavings.toFixed(0)}%</p>
                <p className="text-sm text-slate-400">average reduction</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <section
          className={`rounded-[1.75rem] border border-dashed p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] transition ${
            isDragging
              ? "border-sky-500 bg-sky-50/90"
              : "border-slate-300 bg-white/82 backdrop-blur"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void addFiles(event.dataTransfer.files);
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                Upload zone
              </p>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Drop images here
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                PNG, JPG, WebP
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                  No upload needed
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                  Batch compression
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                  ZIP export
                </span>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/85 p-4">
              <p className="text-sm font-medium text-slate-900">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  Choose images
                </button>
                <button
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  onClick={resetWorkspace}
                  type="button"
                >
                  Start over
                </button>
              </div>
            </div>
          </div>

          <input
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            multiple
            onChange={(event) => {
              if (event.target.files) {
                void addFiles(event.target.files);
              }
              event.target.value = "";
            }}
            ref={inputRef}
            type="file"
          />

          {warning ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {warning}
            </p>
          ) : null}

          <div className="mt-6 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/90 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
                  <p className="mt-1 text-base font-medium text-slate-900">
                    {isProcessing
                      ? `Optimizing ${progress}%`
                      : finishedItems > 0
                        ? `${finishedItems} ready`
                        : "Waiting"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Original</p>
                  <p className="mt-1 text-base font-medium text-slate-900">
                    {formatBytes(totalOriginal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Saved</p>
                  <p className="mt-1 text-base font-medium text-emerald-700">
                    {totalSavings.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
                  disabled={items.length === 0 || isProcessing}
                  onClick={() => void runCompression()}
                  type="button"
                >
                  {isProcessing ? "Compressing..." : "Compress images"}
                </button>
                <button
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!items.some((item) => item.compressedFile)}
                  onClick={() => void downloadAllAsZip()}
                  type="button"
                >
                  Download ZIP
                </button>
              </div>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {items.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/70 bg-white/78 p-12 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-lg font-medium text-slate-900">
                Your results will appear here.
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Add images to begin.
              </p>
            </div>
          ) : null}

          {items.map((item) => (
            <article
              className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/84 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur"
              key={item.id}
            >
              <div className="flex flex-col gap-5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.dimensions.width} x {item.dimensions.height} px
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        item.status === "done"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "error"
                            ? "bg-rose-100 text-rose-700"
                            : item.status === "processing"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                    <button
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!item.compressedFile}
                      onClick={() =>
                        item.compressedFile
                          ? downloadBlob(item.compressedFile, item.compressedFile.name)
                          : undefined
                      }
                      type="button"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Original</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {formatBytes(item.originalSize)}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Optimized</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {item.compressedSize ? formatBytes(item.compressedSize) : "--"}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Reduction</p>
                    <p className="mt-1 text-base font-semibold text-emerald-700">
                      {item.reductionPercent !== undefined
                        ? `${item.reductionPercent.toFixed(0)}%`
                        : "--"}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Format</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {formatOutputType(item.outputType)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-3">
                    <p className="mb-3 text-sm font-medium text-slate-600">Original</p>
                    <Image
                      alt={`Original preview for ${item.name}`}
                      className="h-64 w-full rounded-[1.1rem] object-cover"
                      height={item.dimensions.height}
                      unoptimized
                      src={item.originalUrl}
                      width={item.dimensions.width}
                    />
                  </div>

                  <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,#0f172a_0%,#16233d_100%)] p-3 text-white">
                    <p className="mb-3 text-sm font-medium text-slate-300">Optimized</p>
                    {item.compressedUrl ? (
                      <Image
                        alt={`Optimized preview for ${item.name}`}
                        className="h-64 w-full rounded-[1.1rem] object-cover"
                        height={item.dimensions.height}
                        unoptimized
                        src={item.compressedUrl}
                        width={item.dimensions.width}
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/5 text-sm text-slate-300">
                        {item.status === "processing"
                          ? "Compression in progress..."
                          : item.status === "error"
                            ? item.error
                            : "Run compression to generate the optimized preview."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}
