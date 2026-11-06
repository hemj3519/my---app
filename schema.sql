-- NeonDB에서 직접 실행하거나, Vercel Postgres Query 탭에서 실행하세요.

-- 분석 결과 로그 테이블
CREATE TABLE IF NOT EXISTS analyses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname   TEXT        NOT NULL,
  summary    TEXT        NOT NULL,
  features   JSONB       NOT NULL,
  lucky_item TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses (created_at DESC);

-- 방명록 테이블
CREATE TABLE IF NOT EXISTS guestbook (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT        NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 20),
  message      TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 100),
  nickname     TEXT        NOT NULL,
  lucky_item   TEXT        NOT NULL,
  is_hidden    BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guestbook_created_at_idx ON guestbook (created_at DESC) WHERE NOT is_hidden;
