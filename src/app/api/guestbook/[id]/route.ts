import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// PATCH /api/guestbook/[id] — 방명록 숨김 처리 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 503 });
  }
  if (request.headers.get("x-admin-secret") !== adminSecret) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 400 });
  }

  const { is_hidden } = body as Record<string, unknown>;
  if (typeof is_hidden !== "boolean") {
    return NextResponse.json({ error: "FAILED" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const rows = (await sql`
      UPDATE guestbook
      SET is_hidden = ${is_hidden}
      WHERE id = ${id}
      RETURNING id, is_hidden
    `) as { id: string; is_hidden: boolean }[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
