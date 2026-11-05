"use client";
import { useState, useCallback } from "react";
import type { AppScreen, AnalysisResult, ErrorCode } from "@/types/result";
import { validateImage } from "@/lib/image";
import ObangsaekStripe from "@/components/ObangsaekStripe";
import ScreenMain from "@/components/ScreenMain";
import ScreenLoading from "@/components/ScreenLoading";
import ScreenResult from "@/components/ScreenResult";

// 4단계 목업 데이터 — 5·6단계에서 실제 Gemini API 응답으로 교체
const MOCK_RESULT: AnalysisResult = {
  nickname: "야근에 영혼 팔린 방구석 전략가",
  summary:
    "천정(天庭)이 넓으니 이는 『마의상법』에 이르길 '회의 시간에 딴생각하는 자의 상'이라. 그러나 그 딴생각이 실은 천하를 품은 묘수임을 세상이 아직 모를 뿐.",
  features: [
    {
      part: "이마",
      comment:
        "광대한 초원과 같아 아이디어가 무한히 펼쳐지나, 실행에 옮기면 왜인지 흐지부지되는 운.",
    },
    {
      part: "눈",
      comment:
        "흑염룡의 기운이 서려 카리스마 넘치나, 월요일 오전만은 예외라 졸린 눈이 됨.",
    },
    {
      part: "코",
      comment:
        "재물운이 콧대에 깃들었으나 배달앱 장바구니에서 모두 새어 나가는 상.",
    },
    {
      part: "입",
      comment:
        "말실수운이 충만하나 본인만 모름. 주변인들은 이미 알고 있음.",
    },
  ],
  luckyItem: "다 식은 믹스커피",
};

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);

  const handleFileSelected = useCallback(
    (file: File) => {
      const validation = validateImage(file);
      if (!validation.ok) {
        setErrorCode(validation.error);
        setScreen("error");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImageFile(file);
      setScreen("preview");
    },
    [previewUrl]
  );

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;
    setScreen("loading");
    // 4단계: 목업 딜레이 3초 (5·6단계에서 실제 API 호출로 교체)
    await new Promise((r) => setTimeout(r, 3000));
    setResult(MOCK_RESULT);
    setScreen("result");
  }, [imageFile]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageFile(null);
    setResult(null);
    setErrorCode(null);
    setScreen("idle");
  }, [previewUrl]);

  const handleErrorDismiss = useCallback(() => {
    setErrorCode(null);
    setScreen("idle");
  }, []);

  return (
    <>
      <ObangsaekStripe />
      <main
        className="flex-1 flex flex-col max-w-[420px] w-full mx-auto px-4 pb-8"
        style={{ minHeight: "calc(100dvh - 7px)" }}
      >
        {(screen === "idle" || screen === "preview" || screen === "error") && (
          <ScreenMain
            screen={screen}
            previewUrl={previewUrl}
            errorCode={errorCode}
            onFileSelected={handleFileSelected}
            onAnalyze={handleAnalyze}
            onChangePhoto={handleReset}
            onErrorDismiss={handleErrorDismiss}
          />
        )}
        {screen === "loading" && <ScreenLoading previewUrl={previewUrl} />}
        {screen === "result" && result && (
          <ScreenResult
            result={result}
            previewUrl={previewUrl}
            onReset={handleReset}
          />
        )}
      </main>
    </>
  );
}
