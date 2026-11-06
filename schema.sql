-- NeonDB에서 직접 실행하거나, Vercel Postgres Query 탭에서 실행하세요.
-- 분석 결과 저장 테이블

CREATE TABLE IF NOT EXISTS analyses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname   TEXT        NOT NULL,
  summary    TEXT        NOT NULL,
  features   JSONB       NOT NULL,
  lucky_item TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 최신순 조회 인덱스
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses (created_at DESC);
