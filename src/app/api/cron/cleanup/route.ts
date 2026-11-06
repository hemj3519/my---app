import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// Vercel Cron Job — 매월 1일 00:00 UTC 실행 (vercel.json 참조)
// Vercel이 자동으로 Authorization: Bearer <CRON_SECRET> 헤더를 붙여 호출함
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const result = (await sql`
      DELETE FROM analyses
      WHERE created_at < now() - interval '90 days'
      RETURNING id
    `) as { id: string }[];

    return NextResponse.json({
      deleted: result.length,
      message: `${result.length}건의 오래된 분석 로그를 삭제했습니다.`,
    });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
