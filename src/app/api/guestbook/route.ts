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

export interface GuestbookPage {
  items: GuestbookEntry[];
  nextCursor: string | null;
}

export const PAGE_SIZE = 20;

// GET /api/guestbook?cursor={ISO}&limit={n} — 커서 기반 페이지네이션
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10), 50);
  const fetch = limit + 1;

  try {
    const rows = cursor
      ? (await sql`
          SELECT id, display_name, message, nickname, lucky_item, created_at
          FROM guestbook
          WHERE NOT is_hidden AND created_at < ${cursor}::timestamptz
          ORDER BY created_at DESC
          LIMIT ${fetch}
        `) as GuestbookEntry[]
      : (await sql`
          SELECT id, display_name, message, nickname, lucky_item, created_at
          FROM guestbook
          WHERE NOT is_hidden
          ORDER BY created_at DESC
          LIMIT ${fetch}
        `) as GuestbookEntry[];

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;
    return NextResponse.json({ items, nextCursor } satisfies GuestbookPage);
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
