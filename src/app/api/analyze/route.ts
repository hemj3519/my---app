import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "@/lib/prompt";
import type { AnalysisResult } from "@/types/result";

// Vercel Hobby 플랜 최대 실행 시간 (초)
export const maxDuration = 30;

function extractJson(raw: string): string {
  // 모델이 마크다운 코드블록으로 감쌌을 경우 제거
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export async function POST(request: NextRequest) {
  // 1. API 키 확인
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }

  // 2. 요청 본문 파싱
  let image: string;
  try {
    const body = (await request.json()) as { image?: unknown };
    if (typeof body.image !== "string" || !body.image) throw new Error();
    image = body.image;
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 400 });
  }

  // 3. Gemini 호출
  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // 무료 티어 멀티모달 모델
      contents: [
        {
          role: "user",
          parts: [
            { text: buildPrompt() },
            { inlineData: { mimeType: "image/jpeg", data: image } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text ?? "";
    if (!rawText) {
      return NextResponse.json({ error: "FAILED" }, { status: 500 });
    }

    // 4. JSON 파싱
    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(rawText));
    } catch {
      return NextResponse.json({ error: "FAILED" }, { status: 500 });
    }

    // 5. NO_FACE 판별
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "error" in parsed
    ) {
      const { error } = parsed as { error: string };
      return NextResponse.json(
        { error: error === "NO_FACE" ? "NO_FACE" : "FAILED" },
        { status: error === "NO_FACE" ? 422 : 500 }
      );
    }

    // 6. 결과 형식 검증
    const r = parsed as Partial<AnalysisResult>;
    if (
      typeof r.nickname !== "string" ||
      typeof r.summary !== "string" ||
      !Array.isArray(r.features) ||
      r.features.length < 4 ||
      typeof r.luckyItem !== "string"
    ) {
      return NextResponse.json({ error: "FAILED" }, { status: 500 });
    }

    // 7. 정상 반환 (이미지·결과 저장 없음 — Zero-DB)
    const result: AnalysisResult = {
      nickname: r.nickname,
      summary: r.summary,
      features: r.features.slice(0, 4),
      luckyItem: r.luckyItem,
    };
    return NextResponse.json(result);
  } catch (err: unknown) {
    // 무료 사용량 초과 (HTTP 429)
    const status =
      typeof err === "object" && err !== null && "status" in err
        ? (err as { status: number }).status
        : undefined;
    if (status === 429) {
      return NextResponse.json({ error: "QUOTA" }, { status: 429 });
    }
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
