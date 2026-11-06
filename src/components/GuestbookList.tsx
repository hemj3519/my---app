"use client";
import { useState } from "react";
import type { GuestbookEntry } from "@/app/api/guestbook/route";

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

interface Props {
  initialItems: GuestbookEntry[];
  initialNextCursor: string | null;
}

export default function GuestbookList({ initialItems, initialNextCursor }: Props) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/guestbook?cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) return;
      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((entry) => (
          <div key={entry.id} className="talisman-card" style={{ padding: "14px 16px" }}>
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
            <p
              className="font-brush"
              style={{ fontSize: "1rem", color: "var(--vermilion)", marginBottom: "6px" }}
            >
              「{entry.nickname}」
            </p>
            <p
              className="font-batang"
              style={{ fontSize: "0.9rem", color: "var(--ink-muk)", lineHeight: 1.65, marginBottom: "8px" }}
            >
              {entry.message}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-text)" }}>
              🍀 {entry.lucky_item}
            </p>
          </div>
        ))}
      </div>

      {nextCursor && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={loadMore}
            disabled={loading}
            className="font-batang"
            style={{
              padding: "10px 28px",
              background: "transparent",
              border: "1px solid var(--vermilion)",
              color: "var(--vermilion)",
              borderRadius: "4px",
              fontSize: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "불러오는 중..." : "방명록 더 보기"}
          </button>
        </div>
      )}
    </>
  );
}
