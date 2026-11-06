import type { Metadata } from "next";
import type { GuestbookEntry } from "@/app/api/guestbook/route";
import sql from "@/lib/db";
import ObangsaekStripe from "@/components/ObangsaekStripe";

export const metadata: Metadata = {
  title: "방명록 — 킹받는 AI 관상소",
  description: "관상소를 다녀간 이들의 흔적",
};

// 30초마다 재검증 (ISR)
export const revalidate = 30;

async function getEntries(): Promise<GuestbookEntry[]> {
  try {
    return (await sql`
      SELECT id, display_name, message, nickname, lucky_item, created_at
      FROM guestbook
      WHERE NOT is_hidden
      ORDER BY created_at DESC
      LIMIT 50
    `) as GuestbookEntry[];
  } catch {
    return [];
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default async function GuestbookPage() {
  const entries = await getEntries();

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
            관상소를 다녀간 이들의 흔적 · {entries.length}건
          </p>
        </div>

        {/* 목록 */}
        {entries.length === 0 ? (
          <div
            className="font-batang"
            style={{
              textAlign: "center",
              color: "var(--muted-text)",
              padding: "48px 0",
              fontSize: "0.9375rem",
            }}
          >
            아직 방명록에 아무도 없소이다.
            <br />
            <a href="/" style={{ color: "var(--vermilion)", marginTop: "8px", display: "inline-block" }}>
              첫 번째로 관상을 보러 가시오 →
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="talisman-card"
                style={{ padding: "14px 16px" }}
              >
                {/* 상단: 이름 + 시각 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    className="font-batang"
                    style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--ink-muk)" }}
                  >
                    {entry.display_name}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted-text)" }}>
                    {timeAgo(entry.created_at)}
                  </span>
                </div>

                {/* AI 별명 */}
                <p
                  className="font-brush"
                  style={{ fontSize: "1rem", color: "var(--vermilion)", marginBottom: "6px" }}
                >
                  「{entry.nickname}」
                </p>

                {/* 한마디 */}
                <p
                  className="font-batang"
                  style={{ fontSize: "0.9rem", color: "var(--ink-muk)", lineHeight: 1.65, marginBottom: "8px" }}
                >
                  {entry.message}
                </p>

                {/* 행운 아이템 */}
                <p style={{ fontSize: "0.75rem", color: "var(--muted-text)" }}>
                  🍀 {entry.lucky_item}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
