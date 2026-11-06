# 🗄️ DB 구현 계획서 (06_DB_PLAN.md)

> **작성일: 2026-11-06**
> **기준 문서**: `02_PRD.md` · `04_DEV_PLAN.md`
> **DB**: NeonDB (Serverless PostgreSQL) — 프로젝트 `summer-heart-09242347`, 싱가포르 리전

---

## 1. 개요

### 1.1 DB 도입 배경

초기 Zero-DB 정책에서 아래 두 가지 목적으로 DB를 도입함:

| 목적 | 테이블 | 저장 주체 | 사용자 인지 여부 |
|---|---|---|---|
| 분석 사용량 로그 | `analyses` | 서버 자동 | 미인지 (서비스 운영용) |
| 방명록 (공개 게시판) | `guestbook` | 사용자 선택 | 인지 (동의 후 작성) |

> **불변 정책**: 얼굴 사진은 어떤 테이블에도 저장하지 않는다.

### 1.2 운영 환경

```
Vercel (서버리스 함수)
    └→ @neondatabase/serverless (HTTP 드라이버)
           └→ NeonDB (Serverless PostgreSQL 18.6)
                  └─ analyses 테이블
                  └─ guestbook 테이블
```

---

## 2. DB 스키마

### 2.1 ERD

```
┌─────────────────────────────────────┐
│            analyses                 │
├─────────────────────────────────────┤
│ id          UUID  PK                │
│ nickname    TEXT  NOT NULL          │
│ summary     TEXT  NOT NULL          │
│ features    JSONB NOT NULL          │
│ lucky_item  TEXT  NOT NULL          │
│ created_at  TIMESTAMPTZ NOT NULL    │
└─────────────────────────────────────┘
         (관계 없음 — 독립 로그)

┌─────────────────────────────────────┐
│            guestbook                │
├─────────────────────────────────────┤
│ id           UUID  PK               │
│ display_name TEXT  NOT NULL         │
│              CHECK (1~20자)         │
│ message      TEXT  NOT NULL         │
│              CHECK (1~100자)        │
│ nickname     TEXT  NOT NULL         │  ← AI 별명 (자동)
│ lucky_item   TEXT  NOT NULL         │  ← 행운 아이템 (자동)
│ is_hidden    BOOL  DEFAULT false    │  ← 관리용 숨김
│ ip_hash      TEXT                   │  ← SHA-256 IP 해시 (도배방지)
│ created_at   TIMESTAMPTZ NOT NULL   │
└─────────────────────────────────────┘
```

> 두 테이블은 외래 키 관계 없음.
> 방명록 작성 시점의 AI 결과값이 그대로 복사 저장됨 (분석 로그와 연결 불필요).

### 2.2 전체 DDL (schema.sql)

```sql
-- 분석 결과 로그
CREATE TABLE IF NOT EXISTS analyses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname   TEXT        NOT NULL,
  summary    TEXT        NOT NULL,
  features   JSONB       NOT NULL,
  lucky_item TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx
  ON analyses (created_at DESC);

-- 방명록
CREATE TABLE IF NOT EXISTS guestbook (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT        NOT NULL
                           CHECK (char_length(display_name) BETWEEN 1 AND 20),
  message      TEXT        NOT NULL
                           CHECK (char_length(message) BETWEEN 1 AND 100),
  nickname     TEXT        NOT NULL,
  lucky_item   TEXT        NOT NULL,
  is_hidden    BOOLEAN     NOT NULL DEFAULT false,
  ip_hash      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guestbook_ip_hash_idx
  ON guestbook (ip_hash, created_at DESC);
-- is_hidden = false 인 행만 인덱싱 (공개 목록 조회 최적화)
CREATE INDEX IF NOT EXISTS guestbook_created_at_idx
  ON guestbook (created_at DESC)
  WHERE NOT is_hidden;
```

---

## 3. 현재 구현 상태

### 3.1 완료 항목

| # | 항목 | 위치 | 상태 |
|---|---|---|---|
| 1 | NeonDB 프로젝트 생성 | NeonDB 대시보드 | ✅ |
| 2 | `DATABASE_URL` Vercel 환경변수 등록 | Vercel Production + Preview | ✅ |
| 3 | `src/lib/db.ts` — 연결 모듈 | 코드 | ✅ |
| 4 | `analyses` 테이블 생성 + 인덱스 | NeonDB | ✅ |
| 5 | `guestbook` 테이블 생성 + 인덱스 | NeonDB | ✅ |
| 6 | `POST /api/analyze` → analyses 저장 (non-blocking) | 코드 | ✅ |
| 7 | `GET /api/guestbook` — 커서 기반 페이지네이션 (20건) | 코드 | ✅ |
| 8 | `POST /api/guestbook` — 작성 + 유효성 검증 + 도배방지 | 코드 | ✅ |
| 9 | `ScreenResult` — 방명록 인라인 폼 + 429 안내 | 코드 | ✅ |
| 10 | `/guestbook` — 목록 페이지 (ISR 30초, 더 보기) | 코드 | ✅ |
| 11 | `GET /api/stats` — 분석 횟수 + 방명록 수 | 코드 | ✅ |
| 12 | `PATCH /api/guestbook/[id]` — 숨김 처리 (ADMIN_SECRET) | 코드 | ✅ |
| 13 | `guestbook.ip_hash` 컬럼 + 인덱스 (NeonDB 반영) | DB | ✅ |

### 3.2 현재 구현의 제약사항 (Phase 1·2 완료 후 갱신)

| 제약 | 내용 | 영향도 |
|---|---|---|
| ~~방명록 고정 LIMIT 50~~ | ~~51번째 이후 항목 조회 불가~~ | ✅ Phase 1 — 커서 페이지네이션으로 해결 |
| ~~is_hidden 수동 불가~~ | ~~DB 직접 접근으로만 숨김 처리 가능~~ | ✅ Phase 2 — PATCH API + ADMIN_SECRET |
| ~~도배 방지 없음~~ | ~~동일인이 무제한 작성 가능~~ | ✅ Phase 2 — ip_hash + 1시간 3건 제한 |
| ~~통계 API 없음~~ | ~~분석 횟수 등 확인 불가~~ | ✅ Phase 1 — GET /api/stats |
| ~~analyses 보존 기간 미정~~ | ~~데이터 무한 누적~~ | ✅ Phase 3 — Vercel Cron Job 월 1회 90일 삭제 |

---

## 4. 구현 계획

### Phase 1 — 핵심 완성 ✅ 완료 (2026-11-06)

#### 4-1. 방명록 커서 기반 페이지네이션

**목적**: 방명록이 50건 이상 쌓일 때 전체 조회 가능

**변경 대상**: `GET /api/guestbook`

```
현재: GET /api/guestbook
      → 최신 50건 고정

변경: GET /api/guestbook?cursor={created_at}&limit={n}
      cursor 없음 → 첫 페이지 (최신 20건)
      cursor 있음 → 해당 시각 이전 20건
      응답: { items: GuestbookEntry[], nextCursor: string | null }
```

**SQL 패턴**:
```sql
SELECT id, display_name, message, nickname, lucky_item, created_at
FROM guestbook
WHERE NOT is_hidden
  AND ($cursor::timestamptz IS NULL OR created_at < $cursor)
ORDER BY created_at DESC
LIMIT 21;  -- 21개 조회 후 21번째 있으면 nextCursor 반환
```

**UI**: `/guestbook` 페이지 하단 "더 보기" 버튼

---

#### 4-2. 통계 API

**목적**: 메인 화면 또는 방명록 페이지에 "지금까지 N명이 관상을 봤소이다" 표시

**신규**: `GET /api/stats`

```
응답: {
  totalAnalyses: number,   -- analyses 테이블 COUNT
  totalGuestbook: number   -- guestbook WHERE NOT is_hidden COUNT
}
```

**캐시 전략**: `revalidate = 60` (1분 ISR) 또는 Vercel Edge Cache

---

### Phase 2 — 운영 편의 ✅ 완료 (2026-11-06)

#### 4-3. 방명록 숨김 처리 API

**목적**: 욕설·스팸 발생 시 코드 없이 처리

**신규**: `PATCH /api/guestbook/[id]`

```
Body: { is_hidden: true }
인증: 환경변수 ADMIN_SECRET 헤더 대조
응답 200: { id, is_hidden }
```

> ADMIN_SECRET은 Vercel 환경변수로 관리. UI 없이 curl/Postman으로 운영.

---

#### 4-4. 도배 방지 (Soft Rate Limit)

**목적**: 동일 클라이언트의 과도한 방명록 작성 제한

**방식**: DB에 `ip_hash TEXT` 컬럼 추가 + 애플리케이션 레벨 체크

```sql
ALTER TABLE guestbook ADD COLUMN ip_hash TEXT;
CREATE INDEX guestbook_ip_hash_idx ON guestbook (ip_hash, created_at DESC);
```

**체크 로직** (`POST /api/guestbook`):
```
같은 ip_hash로 최근 1시간 내 3건 이상 → 429 Too Many Requests
```

> IP는 해시 처리(`SHA-256`) 후 저장 — 원본 IP 미저장 (개인정보 보호).

---

### Phase 3 — 선택 개선 ✅ 완료 (2026-11-06)

#### 4-5. analyses 보존 기간 정책

**목적**: 무료 플랜 0.5GB 한도 관리

**방안**: NeonDB의 pg_cron 또는 Vercel Cron Job으로 90일 이상 된 analyses 삭제

```sql
-- 90일 이상 된 로그 삭제 (월 1회 실행)
DELETE FROM analyses WHERE created_at < now() - interval '90 days';
```

---

#### 4-6. 인기 별명 통계

**목적**: "가장 많이 나온 AI 별명 TOP 5" 등 재미 콘텐츠

**쿼리 예시**:
```sql
SELECT nickname, COUNT(*) as cnt
FROM analyses
GROUP BY nickname
ORDER BY cnt DESC
LIMIT 5;
```

---

## 5. API 명세 전체

### 5.1 현재 구현 (v0.2.0)

| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/analyze` | 얼굴 분석 + analyses 자동 저장 | 없음 |
| GET | `/api/guestbook` | 방명록 최신 50건 조회 | 없음 |
| POST | `/api/guestbook` | 방명록 작성 | 없음 |

### 5.2 계획 (Phase 1~2)

| 메서드 | 경로 | 설명 | 인증 | Phase |
|---|---|---|---|---|
| GET | `/api/guestbook?cursor=&limit=` | 커서 기반 페이지네이션 | 없음 | 1 |
| GET | `/api/stats` | 분석 횟수 + 방명록 수 | 없음 | 1 |
| PATCH | `/api/guestbook/[id]` | 방명록 숨김 처리 | ADMIN_SECRET | 2 |

---

## 6. 데이터 흐름

```
사용자 행동                    서버                          DB
─────────────────────────────────────────────────────────────────────
사진 업로드 → 분석 요청
                         POST /api/analyze
                         ├→ Gemini API 호출
                         ├→ 결과 반환 (사용자에게) ─────────────────▶ (즉시)
                         └→ analyses INSERT          ──────────────▶ (non-blocking, 실패 무시)

분석 결과 확인 후
"방명록에 남기기" 선택
  이름 + 한마디 입력
  제출
                         POST /api/guestbook
                         ├→ 유효성 검증
                         ├→ guestbook INSERT         ──────────────▶ (동기, 실패 시 오류 반환)
                         └→ 201 반환 (사용자에게)

/guestbook 접속
                         GET /api/guestbook (또는 서버 컴포넌트 직접 쿼리)
                         └→ guestbook SELECT (is_hidden=false, 최신 50건)
                                                     ◀──────────────
```

---

## 7. 환경변수 목록

| 변수명 | 용도 | 등록 위치 |
|---|---|---|
| `DATABASE_URL` | NeonDB 연결 문자열 | Vercel Production + Preview + `.env.local` |
| `GEMINI_API_KEY` | Gemini API 인증 | Vercel Production + Preview + `.env.local` |
| `ADMIN_SECRET` | 방명록 관리 API 인증 (Phase 2) | Vercel Production + `.env.local` |

---

## 8. 구현 우선순위 로드맵

```
현재 (v0.2.0) ──→ Phase 1 ──→ Phase 2 ──→ Phase 3
   ✅ 완료          4-1 페이지네이션     4-3 숨김 API     4-5 데이터 정리
                   4-2 통계 API         4-4 도배방지      4-6 인기 통계
```

| Phase | 예상 작업량 | 조건 |
|---|---|---|
| Phase 1 | 소 (API 수정 + UI 1개) | 방명록 50건 도달 전에 |
| Phase 2 | 소~중 (API 2개 + 스키마 변경) | 스팸 발생 시 또는 사전 적용 |
| Phase 3 | 소 (Cron 1개 + 쿼리 1개) | analyses 행이 수만 건 이상 될 때 |
