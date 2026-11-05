"use client";
import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "@/lib/messages";

interface Props {
  previewUrl: string | null;
}

export default function ScreenLoading({ previewUrl }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
      setAnimKey((k) => k + 1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 gap-6"
      style={{ paddingTop: "2rem", paddingBottom: "2rem", position: "relative" }}
    >
      {/* 촛불빛 가장자리 */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(181,48,42,0.18) 100%)",
          animation: "candle-flicker 1.8s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* 오방색 링 + 사진 */}
      <div style={{ position: "relative", width: "132px", height: "132px", zIndex: 1 }}>
        <div
          className="ring-five"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden="true"
        />
        <div
          style={{
            position: "absolute",
            inset: "8px",
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: "var(--surface-card)",
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="분석 중인 사진"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
              }}
            >
              🔮
            </div>
          )}
        </div>
      </div>

      {/* 방울 */}
      <span
        aria-hidden="true"
        style={{
          fontSize: "2rem",
          display: "inline-block",
          transformOrigin: "top center",
          animation: "bell-shake 0.8s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🔔
      </span>

      {/* 로딩 멘트 */}
      <p
        key={animKey}
        className="font-brush"
        style={{
          fontSize: "1.125rem",
          color: "var(--ink-muk)",
          textAlign: "center",
          lineHeight: 1.5,
          animation: "ink-appear 0.5s ease forwards",
          zIndex: 1,
          padding: "0 8px",
        }}
      >
        {LOADING_MESSAGES[msgIdx]}
      </p>

      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--muted-text)",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        잠시만 기다려 주시오
      </p>
    </div>
  );
}
