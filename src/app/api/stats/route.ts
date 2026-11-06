import { NextResponse } from "next/server";
import sql from "@/lib/db";

// 1분 ISR 캐시
export const revalidate = 60;

export interface StatsResponse {
  totalAnalyses: number;
  totalGuestbook: number;
}

// GET /api/stats — 분석 횟수 + 방명록 수
export async function GET() {
  try {
    const [row] = (await sql`
      SELECT
        (SELECT COUNT(*) FROM analyses)::int AS "totalAnalyses",
        (SELECT COUNT(*) FROM guestbook WHERE NOT is_hidden)::int AS "totalGuestbook"
    `) as [{ totalAnalyses: number; totalGuestbook: number }];
    return NextResponse.json({
      totalAnalyses: row.totalAnalyses,
      totalGuestbook: row.totalGuestbook,
    } satisfies StatsResponse);
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
