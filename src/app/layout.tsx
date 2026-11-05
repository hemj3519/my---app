import type { Metadata } from "next";
import { Nanum_Brush_Script, Gowun_Batang, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const nanumBrush = Nanum_Brush_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-nanum-brush",
});

const gowunBatang = Gowun_Batang({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-gowun-batang",
});

const notoSansKR = Noto_Sans_KR({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "킹받는 AI 관상소",
  description: "사진 한 장이면 10초 만에 관상 판독",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`h-full antialiased ${nanumBrush.variable} ${gowunBatang.variable} ${notoSansKR.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {/* 별자리 배경 패턴 */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle, var(--star-silver) 0.5px, transparent 0.5px),
              radial-gradient(circle, var(--star-silver) 0.5px, transparent 0.5px)
            `,
            backgroundSize: "60px 60px, 90px 90px",
            backgroundPosition: "0 0, 30px 30px",
            opacity: 0.06,
            zIndex: 0,
          }}
        />
        <div className="relative flex-1 flex flex-col" style={{ zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
