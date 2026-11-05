"use client";
import { useState, useCallback } from "react";
import type { AppScreen, AnalysisResult, ErrorCode } from "@/types/result";
import { validateImage, resizeToJpeg } from "@/lib/image";
import ObangsaekStripe from "@/components/ObangsaekStripe";
import ScreenMain from "@/components/ScreenMain";
import ScreenLoading from "@/components/ScreenLoading";
import ScreenResult from "@/components/ScreenResult";

const CLIENT_TIMEOUT_MS = 25000;

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
      setPreviewUrl(URL.createObjectURL(file));
      setImageFile(file);
      setScreen("preview");
    },
    [previewUrl]
  );

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || screen === "loading") return;
    setScreen("loading");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      const base64 = await resizeToJpeg(imageFile);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = (await res.json()) as Partial<AnalysisResult> & {
        error?: string;
      };

      if (!res.ok || data.error) {
        const code = (data.error ?? "FAILED") as ErrorCode;
        setErrorCode(code);
        setScreen("error");
        return;
      }

      setResult(data as AnalysisResult);
      setScreen("result");
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout =
        err instanceof Error &&
        (err.name === "AbortError" || err.name === "TimeoutError");
      setErrorCode(isTimeout ? "FAILED" : "FAILED");
      setScreen("error");
    }
  }, [imageFile, screen]);

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
