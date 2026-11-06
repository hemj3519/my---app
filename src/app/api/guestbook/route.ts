import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export interface GuestbookEntry {
  id: string;
  display_name: string;
  message: string;
  nickname: string;
  lucky_item: string;
  created_at: string;
}

// GET /api/guestbook — 최신 50건 조회
export async function GET() {
  try {
    const rows = (await sql`
      SELECT id, display_name, message, nickname, lucky_item, created_at
      FROM guestbook
      WHERE NOT is_hidden
      ORDER BY created_at DESC
      LIMIT 50
    `) as GuestbookEntry[];
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}

// POST /api/guestbook — 방명록 작성
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 400 });
  }

  const { display_name, message, nickname, lucky_item } = body as Record<string, unknown>;

  if (
    typeof display_name !== "string" || display_name.trim().length < 1 || display_name.trim().length > 20 ||
    typeof message !== "string" || message.trim().length < 1 || message.trim().length > 100 ||
    typeof nickname !== "string" || !nickname ||
    typeof lucky_item !== "string" || !lucky_item
  ) {
    return NextResponse.json({ error: "FAILED" }, { status: 400 });
  }

  try {
    const [row] = (await sql`
      INSERT INTO guestbook (display_name, message, nickname, lucky_item)
      VALUES (${display_name.trim()}, ${message.trim()}, ${nickname}, ${lucky_item})
      RETURNING id, display_name, message, nickname, lucky_item, created_at
    `) as GuestbookEntry[];
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
