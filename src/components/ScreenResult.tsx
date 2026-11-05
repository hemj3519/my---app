"use client";
import { useState } from "react";
import type { AnalysisResult } from "@/types/result";
import Stamp from "@/components/Stamp";
import Toast from "@/components/Toast";

interface Props {
  result: AnalysisResult;
  previewUrl: string | null;
  onReset: () => void;
}

export default function ScreenResult({ result, previewUrl, onReset }: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const shareText = [
    "[킹받는 AI 관상소] 나의 관상 판독 결과",
    `「${result.nickname}」`,
    result.summary,
    `🍀 행운의 아이템: ${result.luckyItem}`,
  ].join("\n");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // 공유 취소 — 무시
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setToast("결과가 복사되었소! 원하는 곳에 붙여넣으시오.");
      } catch {
        setToast("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
      }
    }
  };

  const handleSave = () => {
    // 7단계에서 html-to-image로 구현 예정
    setToast("이미지 저장은 7단계에서 구현됩니다!");
  };

  return (
    <>
      <div className="flex flex-col pt-6 gap-4">
        {/* 부적 카드 */}
        <div
          id="talisman-card"
          className="talisman-card"
          style={{
            padding: "20px 16px",
            animation: "unfold-card 0.6s cubic-bezier(0.4,0,0.2,1) forwards",
          }}
        >
          {/* 위 금선 */}
          <div
            aria-hidden="true"
            style={{ height: "1px", background: "var(--gold-trim)", margin: "0 0 14px" }}
          />

          {/* 서비스명 소제목 */}
          <p
            className="font-brush"
            style={{
              fontSize: "0.9rem",
              color: "var(--vermilion)",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            킹받는 AI 관상소
          </p>

          {/* 사진 썸네일 */}
          {previewUrl && (
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "4px",
                overflow: "hidden",
                margin: "0 auto 14px",
                border: "1px solid var(--gold-trim)",
              }}
            >
              <img
                src={previewUrl}
                alt="분석된 사진"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {/* 별명 + 도장 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <h2
              className="font-brush"
              style={{
                fontSize: "1.5rem",
                color: "var(--vermilion)",
                lineHeight: 1.3,
                textAlign: "center",
              }}
            >
              「{result.nickname}」
            </h2>
            <Stamp text="킹받" shape="circle" rotation={10} />
          </div>

          {/* 한줄평 */}
          <p
            className="font-batang"
            style={{
              fontSize: "0.9375rem",
              color: "var(--ink-muk)",
              lineHeight: 1.75,
              marginBottom: "14px",
            }}
          >
            {result.summary}
          </p>

          {/* 부위별 관상평 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
            {result.features.map((f) => (
              <div key={f.part} style={{ display: "flex", gap: "6px" }}>
                <span aria-hidden="true" style={{ color: "var(--vermilion)", fontSize: "0.75rem", marginTop: "2px", flexShrink: 0 }}>◆</span>
                <p className="font-batang" style={{ fontSize: "0.875rem", color: "var(--ink-muk)", lineHeight: 1.65 }}>
                  <strong>{f.part}</strong>: {f.comment}
                </p>
              </div>
            ))}
          </div>

          {/* 별자리 구분선 */}
          <div
            aria-hidden="true"
            style={{
              textAlign: "center",
              color: "var(--gold-trim)",
              fontSize: "0.6rem",
              letterSpacing: "6px",
              marginBottom: "10px",
            }}
          >
            ✦ · · · ✦ · · · ✦
          </div>

          {/* 행운의 아이템 */}
          <p
            className="font-batang"
            style={{ fontSize: "0.9375rem", color: "var(--ink-muk)", marginBottom: "14px" }}
          >
            🍀 <strong>행운의 아이템</strong>: {result.luckyItem}
          </p>

          {/* 면책 문구 */}
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--muted-text)",
              textAlign: "center",
              lineHeight: 1.5,
              opacity: 0.7,
            }}
          >
            본 결과는 AI가 지어낸 재미용 허구입니다.
          </p>

          {/* 아래 금선 */}
          <div
            aria-hidden="true"
            style={{ height: "1px", background: "var(--gold-trim)", margin: "14px 0 0" }}
          />
        </div>

        {/* 버튼 영역 (카드 밖) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
          <button className="btn-primary" onClick={handleShare} aria-label="결과 공유하기">
            💬 결과 공유하기
          </button>
          <button className="btn-secondary" onClick={handleSave} aria-label="결과 이미지로 저장하기">
            💾 이미지로 저장
          </button>
          <button className="btn-text" onClick={onReset} aria-label="처음으로 돌아가 다시 검사하기">
            🔄 다시 검사하기
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
