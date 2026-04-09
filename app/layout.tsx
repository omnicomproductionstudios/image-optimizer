import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelPress | Client-Side Image Optimizer",
  description:
    "Compress PNG, JPG, and WebP images locally in the browser with previews, resizing, and ZIP export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
