import type { Metadata } from "next";
import type { GuestbookEntry } from "@/app/api/guestbook/route";
import { PAGE_SIZE } from "@/app/api/guestbook/route";
import sql from "@/lib/db";
import ObangsaekStripe from "@/components/ObangsaekStripe";
import GuestbookList from "@/components/GuestbookList";

export const metadata: Metadata = {
  title: "방명록 — 킹받는 AI 관상소",
  description: "관상소를 다녀간 이들의 흔적",
};

// 30초마다 재검증 (ISR)
export const revalidate = 30;

async function getInitialEntries(): Promise<{
  items: GuestbookEntry[];
  nextCursor: string | null;
  total: number;
}> {
  try {
    const [countRow, ...ignore] = (await sql`
      SELECT COUNT(*) AS cnt FROM guestbook WHERE NOT is_hidden
    `) as [{ cnt: string }];
    void ignore;
    const total = parseInt(countRow.cnt, 10);

    const rows = (await sql`
      SELECT id, display_name, message, nickname, lucky_item, created_at
      FROM guestbook
      WHERE NOT is_hidden
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE + 1}
    `) as GuestbookEntry[];

    const hasMore = rows.length > PAGE_SIZE;
    const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;
    return { items, nextCursor, total };
  } catch {
    return { items: [], nextCursor: null, total: 0 };
  }
}

export default async function GuestbookPage() {
  const { items, nextCursor, total } = await getInitialEntries();

  return (
    <>
      <ObangsaekStripe />
      <main
        style={{
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
          padding: "24px 16px 64px",
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <a
            href="/"
            className="font-batang"
            style={{ fontSize: "0.8125rem", color: "var(--muted-text)", display: "block", marginBottom: "12px" }}
          >
            ← 관상소로 돌아가기
          </a>
          <h1
            className="font-brush"
            style={{ fontSize: "2rem", color: "var(--vermilion)", lineHeight: 1.2 }}
          >
            방명록
          </h1>
          <p
            className="font-batang"
            style={{ fontSize: "0.875rem", color: "var(--muted-text)", marginTop: "6px" }}
          >
            관상소를 다녀간 이들의 흔적 · {total}건
          </p>
        </div>

        {/* 목록 (클라이언트 컴포넌트 — 더 보기 지원) */}
        <GuestbookList initialItems={items} initialNextCursor={nextCursor} />
      </main>
    </>
  );
}
