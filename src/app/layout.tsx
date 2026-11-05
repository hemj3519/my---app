import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "킹받는 AI 관상소 (가칭)",
  description: "사진 한 장이면 10초 만에 관상 판독",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
