"use client";
import { useRef, useState } from "react";
import type { AnalysisResult } from "@/types/result";
import { buildShareText } from "@/lib/share";
import Stamp from "@/components/Stamp";
import Toast from "@/components/Toast";

type GuestbookState = "idle" | "form" | "submitting" | "done";

interface Props {
  result: AnalysisResult;
  previewUrl: string | null;
  onReset: () => void;
}

export default function ScreenResult({ result, previewUrl, onReset }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [gbState, setGbState] = useState<GuestbookState>("idle");
  const [gbName, setGbName] = useState("");
  const [gbMsg, setGbMsg] = useState("");

  const shareText = buildShareText(result);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // 사용자가 공유 취소 — 클립보드 폴백으로 넘어가지 않음
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setToast("결과가 복사되었소! 원하는 곳에 붙여넣으시오.");
    } catch {
      setToast("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
    }
  };

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      await document.fonts.ready;
      // html-to-image를 동적으로 불러와 번들 크기 최소화
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "gwansang-result.png";
      link.href = dataUrl;
      link.click();
      setToast("이미지가 저장되었소이다! 갤러리를 확인해 주시오.");
    } catch {
      setToast("이미지 저장에 실패했습니다. 스크린샷으로 대신하세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleGuestbookSubmit = async () => {
    if (gbState === "submitting") return;
    setGbState("submitting");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: gbName,
          message: gbMsg,
          nickname: result.nickname,
          lucky_item: result.luckyItem,
        }),
      });
      if (res.status === 429) {
        setGbState("form");
        setToast("방명록은 한 시간에 세 번까지만 허하오.");
        return;
      }
      if (!res.ok) throw new Error();
      setGbState("done");
      setToast("방명록에 아로새겨졌소이다! 📜");
    } catch {
      setGbState("form");
      setToast("기록에 실패했소이다. 다시 시도해 보시오.");
    }
  };

  return (
    <>
      <div className="flex flex-col pt-6 gap-4">
        {/* 부적 카드 — id는 PNG 저장 타겟 */}
        <div
          id="talisman-card"
          ref={cardRef}
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

          {/* 서비스명 */}
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
                <span
                  aria-hidden="true"
                  style={{ color: "var(--vermilion)", fontSize: "0.75rem", marginTop: "2px", flexShrink: 0 }}
                >
                  ◆
                </span>
                <p
                  className="font-batang"
                  style={{ fontSize: "0.875rem", color: "var(--ink-muk)", lineHeight: 1.65 }}
                >
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

        {/* 버튼 영역 (카드 밖 — PNG 저장에 포함 안 됨) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
          <button
            className="btn-primary"
            onClick={handleShare}
            aria-label="결과 공유하기"
          >
            💬 결과 공유하기
          </button>
          <button
            className="btn-secondary"
            onClick={handleSave}
            disabled={saving}
            aria-label="결과 이미지로 저장하기"
          >
            {saving ? "저장 중..." : "💾 이미지로 저장"}
          </button>

          {/* 방명록 */}
          {gbState === "idle" && (
            <button
              className="btn-secondary"
              onClick={() => setGbState("form")}
              aria-label="방명록 남기기"
            >
              📜 방명록에 남기기
            </button>
          )}

          {(gbState === "form" || gbState === "submitting") && (
            <div
              className="font-batang"
              style={{
                border: "1px solid var(--gold-trim)",
                borderRadius: "6px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "var(--parchment, #fdf6e3)",
              }}
            >
              <p style={{ fontSize: "0.8125rem", color: "var(--muted-text)", textAlign: "center" }}>
                📜 방명록에 한 말씀 남기시오
              </p>
              <input
                type="text"
                id="gb-name"
                aria-label="방명록 이름 (최대 20자)"
                placeholder="이름 (최대 20자)"
                maxLength={20}
                value={gbName}
                onChange={(e) => setGbName(e.target.value)}
                disabled={gbState === "submitting"}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "0.9rem",
                  border: "1px solid var(--gold-trim)",
                  borderRadius: "4px",
                  background: "transparent",
                  color: "var(--ink-muk)",
                  fontFamily: "inherit",
                }}
              />
              <textarea
                id="gb-message"
                aria-label="방명록 한마디 (최대 100자)"
                placeholder="한마디 (최대 100자)"
                maxLength={100}
                rows={3}
                value={gbMsg}
                onChange={(e) => setGbMsg(e.target.value)}
                disabled={gbState === "submitting"}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "0.9rem",
                  border: "1px solid var(--gold-trim)",
                  borderRadius: "4px",
                  background: "transparent",
                  color: "var(--ink-muk)",
                  fontFamily: "inherit",
                  resize: "none",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-primary"
                  onClick={handleGuestbookSubmit}
                  disabled={gbState === "submitting" || gbName.trim().length < 1 || gbMsg.trim().length < 1}
                  style={{ flex: 1 }}
                >
                  {gbState === "submitting" ? "새기는 중..." : "새기기"}
                </button>
                <button
                  className="btn-text"
                  onClick={() => setGbState("idle")}
                  disabled={gbState === "submitting"}
                  style={{ flex: 1 }}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {gbState === "done" && (
            <p
              className="font-batang"
              style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--muted-text)" }}
            >
              📜 방명록에 기록되었소이다
              <a
                href="/guestbook"
                style={{ display: "block", marginTop: "4px", color: "var(--vermilion)", fontSize: "0.8125rem" }}
              >
                방명록 보러 가기 →
              </a>
            </p>
          )}

          <button
            className="btn-text"
            onClick={onReset}
            aria-label="처음으로 돌아가 다시 검사하기"
          >
            🔄 다시 검사하기
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
