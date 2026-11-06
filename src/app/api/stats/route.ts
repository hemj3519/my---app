import { NextResponse } from "next/server";
import sql from "@/lib/db";

// 1분 ISR 캐시
export const revalidate = 60;

export interface NicknameRank {
  nickname: string;
  cnt: number;
}

export interface StatsResponse {
  totalAnalyses: number;
  totalGuestbook: number;
  topNicknames: NicknameRank[];
}

// GET /api/stats — 분석 횟수 + 방명록 수 + 인기 별명 TOP 5
export async function GET() {
  try {
    const [countRow] = (await sql`
      SELECT
        (SELECT COUNT(*) FROM analyses)::int AS "totalAnalyses",
        (SELECT COUNT(*) FROM guestbook WHERE NOT is_hidden)::int AS "totalGuestbook"
    `) as { totalAnalyses: number; totalGuestbook: number }[];

    const topNicknames = (await sql`
      SELECT nickname, COUNT(*)::int AS cnt
      FROM analyses
      GROUP BY nickname
      ORDER BY cnt DESC
      LIMIT 5
    `) as NicknameRank[];

    return NextResponse.json({
      totalAnalyses: countRow.totalAnalyses,
      totalGuestbook: countRow.totalGuestbook,
      topNicknames,
    } satisfies StatsResponse);
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
