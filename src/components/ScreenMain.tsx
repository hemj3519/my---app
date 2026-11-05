"use client";
import { useRef, useState, useCallback } from "react";
import type { AppScreen, ErrorCode } from "@/types/result";
import { ERROR_MESSAGES } from "@/lib/messages";
import Stamp from "@/components/Stamp";

interface Props {
  screen: AppScreen;
  previewUrl: string | null;
  errorCode: ErrorCode | null;
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
  onChangePhoto: () => void;
  onErrorDismiss: () => void;
}

export default function ScreenMain({
  screen,
  previewUrl,
  errorCode,
  onFileSelected,
  onAnalyze,
  onChangePhoto,
  onErrorDismiss,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) onFileSelected(files[0]);
    },
    [onFileSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col pt-6 gap-4">
      {/* 현판 헤더 */}
      <div
        style={{
          borderTop: "1px solid var(--gold-trim)",
          borderBottom: "1px solid var(--gold-trim)",
          padding: "10px 0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "4px",
        }}
      >
        <h1
          className="font-brush"
          style={{ fontSize: "2rem", lineHeight: 1.2, color: "var(--ink-muk)", flexGrow: 1 }}
        >
          킹받는 AI 관상소
        </h1>
        <Stamp text="관상" shape="square" rotation={-6} />
      </div>

      {/* S1-b 미리보기 */}
      {screen === "preview" && previewUrl ? (
        <>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted-text)",
              textAlign: "center",
            }}
          >
            사진 한 장이면 10초 만에 관상 판독
          </p>
          <div
            style={{
              borderRadius: "4px",
              overflow: "hidden",
              border: "1px solid var(--gold-trim)",
              aspectRatio: "1",
              maxHeight: "320px",
            }}
          >
            <img
              src={previewUrl}
              alt="선택한 사진 미리보기"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            <button className="btn-primary" onClick={onAnalyze} aria-label="관상 보기 — 분석 시작">
              🔮 관상 보기
            </button>
            <button className="btn-secondary" onClick={onChangePhoto} aria-label="다른 사진 고르기">
              다른 사진 고르기
            </button>
          </div>

          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted-text)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            본인 사진 또는 당사자에게 허락받은 사진만 올려주세요
          </p>
        </>
      ) : (
        /* S1-a 처음 화면 */
        <>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted-text)",
              textAlign: "center",
            }}
          >
            사진 한 장이면 10초 만에 관상 판독
          </p>

          {/* 드롭 영역 */}
          <div
            className={`drop-zone ${isDragging ? "drag-over" : ""}`}
            role="region"
            aria-label="사진 업로드 영역 — 사진을 끌어다 놓거나 버튼을 눌러주세요"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              minHeight: "160px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "24px 16px",
            }}
          >
            {/* 모서리 별 꺾쇠 */}
            {(["topLeft", "topRight", "bottomLeft", "bottomRight"] as const).map((pos) => (
              <span
                key={pos}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  color: "var(--gold-trim)",
                  fontSize: "1.1rem",
                  ...{
                    topLeft:     { top: "-8px",  left: "-8px"  },
                    topRight:    { top: "-8px",  right: "-8px" },
                    bottomLeft:  { bottom: "-8px", left: "-8px" },
                    bottomRight: { bottom: "-8px", right: "-8px" },
                  }[pos],
                }}
              >
                ✦
              </span>
            ))}
            <span style={{ fontSize: "2.5rem" }} aria-hidden="true">🔮</span>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-text)", textAlign: "center" }}>
              사진을 여기에 끌어다 놓으세요
            </p>
          </div>

          {/* 파일 선택 input (숨김) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {/* 카메라 input (숨김) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              className="btn-secondary"
              onClick={() => cameraInputRef.current?.click()}
              aria-label="카메라로 찍기"
            >
              📷 카메라로 찍기
            </button>
            <button
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              aria-label="앨범이나 파일에서 사진 고르기"
            >
              🖼 앨범 / 파일에서 고르기
            </button>
          </div>

          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted-text)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            본인 사진 또는 당사자에게 허락받은 사진만 올려주세요
            <br />
            jpg · png · webp / 10MB 이하
          </p>
        </>
      )}

      {/* 하단 고지 3종 */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px dashed var(--gold-trim)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <p style={{ fontSize: "0.75rem", color: "var(--muted-text)", lineHeight: 1.6 }}>
          사진은 저희 서버에 저장되지 않아요. 다만 분석을 위해 Google Gemini로 전송되며,
          Google의 정책에 따라 처리될 수 있어요.
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-text)" }}>
          만 18세 이상 이용 가능
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-text)" }}>
          본 결과는 AI가 지어낸 재미용 허구이며, 실제 성격·운세와 무관합니다.
        </p>
      </div>

      {/* S1-c 에러 모달 */}
      {screen === "error" && errorCode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="에러 안내"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 200,
          }}
          onClick={onErrorDismiss}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-hanji)",
              border: "2px solid var(--vermilion)",
              borderRadius: "4px",
              padding: "24px 20px",
              maxWidth: "340px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Stamp text="흉(凶)" shape="circle" rotation={-8} size="md" />
            <p
              className="font-batang"
              style={{
                fontSize: "0.9375rem",
                color: "var(--ink-muk)",
                lineHeight: 1.75,
                textAlign: "center",
              }}
            >
              {ERROR_MESSAGES[errorCode]}
            </p>
            <button
              className="btn-primary"
              onClick={onErrorDismiss}
              aria-label="다시 시도하기"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
