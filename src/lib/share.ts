import type { AnalysisResult } from "@/types/result";

export function buildShareText(result: AnalysisResult): string {
  const serviceUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const lines = [
    "[킹받는 AI 관상소] 나의 관상 판독 결과",
    `「${result.nickname}」`,
    result.summary,
    `🍀 행운의 아이템: ${result.luckyItem}`,
  ];

  if (serviceUrl) {
    lines.push(`너도 해보기 👉 ${serviceUrl}`);
  }

  return lines.join("\n");
}
