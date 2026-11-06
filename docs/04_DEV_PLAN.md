# 🛠️ 개발 계획서 (04_DEV_PLAN.md)

> **상태: 운영 중 (2026-11-06 업데이트)**
> 기준 문서: `01_IDEA.md` · `02_PRD.md` · `03_UI_FLOW.md` · `DESIGN.md`
> 기술 스택 확정: **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + NeonDB + Vercel Hobby**
> 현재 위치: **12단계 완료** — DB 개선 (페이지네이션·통계·관리API·도배방지)
> 운영 URL: **https://my-app-sandy-seven.vercel.app/**

---

## 1. 기술 스택

| 구분 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js 16 (App Router)** | 프론트 + API 프록시를 한 프로젝트에서 처리 |
| 언어 | **TypeScript 5** | 결과 JSON 타입 안전성 |
| 스타일 | **Tailwind CSS 4** | CSS 변수 기반 색 토큰, 다크모드 |
| 글꼴 | **`next/font/google`** | Nanum Brush Script / Gowun Batang / Noto Sans KR |
| AI | **Google Gemini API (무료 티어)** | `@google/genai` SDK, 결제 수단 미연결 필수 |
| 이미지 축소 | **브라우저 Canvas API** | 라이브러리 없음, 긴 변 1024px·JPEG 변환 |
| 결과 이미지 저장 | **html-to-image** | 부적 카드 PNG 변환, 서버 전송 없음 |
| 공유 | **`navigator.share` + 클립보드 폴백** | 브라우저 기본 기능 |
| DB | **NeonDB (Serverless PostgreSQL)** | `@neondatabase/serverless` 드라이버, 무료 플랜 |
| 호스팅 | **Vercel Hobby (무료)** | GitHub 푸시마다 자동 배포 |
| 소스 관리 | **Git + GitHub (비공개)** | Vercel 자동 배포 연동 |

### 1.1 폴더 구조

```
my-app/
├─ docs/                        # 기획 문서
├─ schema.sql                   # DB 테이블 정의 (analyses, guestbook)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx             # 글꼴 로딩, 오방색 띠, 공통 틀
│  │  ├─ page.tsx               # 단일 페이지 (S1 → S2 → S3 상태 전환)
│  │  ├─ globals.css            # 색 토큰(라이트/다크), 애니메이션, 한지 질감
│  │  ├─ guestbook/
│  │  │  └─ page.tsx            # 방명록 목록 페이지 (ISR 30초)
│  │  └─ api/
│  │     ├─ analyze/
│  │     │  └─ route.ts         # Gemini 프록시 + 분석 결과 DB 저장
│  │     ├─ guestbook/
│  │     │  ├─ route.ts         # GET(커서 페이지네이션) / POST(작성+도배방지) 방명록 API
│  │     │  └─ [id]/
│  │     │     └─ route.ts      # PATCH(숨김처리, ADMIN_SECRET 인증)
│  │     └─ stats/
│  │        └─ route.ts         # GET /api/stats — 분석·방명록 카운트
│  ├─ components/
│  │  ├─ ObangsaekStripe.tsx    # 오방색 띠 (공통)
│  │  ├─ Stamp.tsx              # 붉은 도장 컴포넌트
│  │  ├─ Toast.tsx              # 부적 쪽지 토스트
│  │  ├─ ScreenMain.tsx         # S1 메인 & 업로드
│  │  ├─ ScreenLoading.tsx      # S2 분석 로딩
│  │  ├─ ScreenResult.tsx       # S3 결과 & 공유 & 방명록 폼
│  │  └─ GuestbookList.tsx      # 방명록 목록 클라이언트 컴포넌트 (더 보기)
│  ├─ lib/
│  │  ├─ db.ts                  # NeonDB 연결 모듈
│  │  ├─ image.ts               # 사진 검사·Canvas 축소
│  │  ├─ prompt.ts              # Gemini 프롬프트
│  │  ├─ messages.ts            # 에러·로딩 문구 모음
│  │  └─ share.ts               # 공유 텍스트 생성·클립보드 복사
│  └─ types/
│     └─ result.ts              # AnalysisResult 타입 정의
├─ .env.local                   # GEMINI_API_KEY + DATABASE_URL (git 제외)
└─ package.json
```

### 1.2 화면 상태 머신

```
idle(S1-a) ──사진선택──→ preview(S1-b) ──관상보기──→ loading(S2) ──성공──→ result(S3)
    ↑              ↑                                       │
    └──다시시도──── └──────────────── error(S1-c) ←─────────┘

result(S3) ──방명록남기기──→ /guestbook (별도 페이지)
```

### 1.3 API 계약

```
POST /api/analyze
  Body: { image: string }  // base64 JPEG, 긴 변 ≤ 1024px
  200: { nickname, summary, features: [{part, comment}×4], luckyItem }
  4xx/5xx: { error: "NO_FACE" | "QUOTA" | "FAILED" }
  부작용: analyses 테이블에 결과 저장 (non-blocking)

GET /api/guestbook?cursor={ISO}&limit={n}
  200: { items: GuestbookEntry[], nextCursor: string | null }
       cursor 없음 → 첫 페이지 (기본 20건), cursor 있음 → 해당 시각 이전

POST /api/guestbook
  Body: { display_name, message, nickname, lucky_item }
  201: GuestbookEntry
  400: { error: "FAILED" }   // 유효성 검증 실패
  429: { error: "TOO_MANY" } // 1시간 내 3건 초과 (IP 해시 기준)

PATCH /api/guestbook/[id]
  Header: x-admin-secret: {ADMIN_SECRET}
  Body: { is_hidden: boolean }
  200: { id, is_hidden }
  401: 인증 실패 / 404: 항목 없음

GET /api/stats
  200: { totalAnalyses: number, totalGuestbook: number }
  캐시: revalidate 60초
```

### 1.4 DB 스키마

```sql
-- 분석 결과 로그
CREATE TABLE analyses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname   TEXT NOT NULL,
  summary    TEXT NOT NULL,
  features   JSONB NOT NULL,
  lucky_item TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 방명록
CREATE TABLE guestbook (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 20),
  message      TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 100),
  nickname     TEXT NOT NULL,  -- AI 별명 (자동)
  lucky_item   TEXT NOT NULL,  -- 행운 아이템 (자동)
  is_hidden    BOOLEAN NOT NULL DEFAULT false,
  ip_hash      TEXT,           -- SHA-256 해시 IP (도배 방지용, 원본 미저장)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 2. 단계별 개발 계획

> `[x]` = 완료 / `[ ]` = 미완료

---

### 0단계: 사전 준비 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 0-1 | Google AI Studio에서 Gemini API 키 발급 (결제 수단 **미연결** 필수) | [x] |
| 0-2 | GitHub 계정 준비, 비공개 저장소 생성 (`hemj3519/my---app`) | [x] |
| 0-3 | Vercel 계정 가입 (GitHub로 로그인) | [x] |
| 0-4 | Gemini API 약관 확인: 무료 티어 데이터 처리 범위, 18세 미만 제한 | [ ] |

---

### 1단계: 환경 구축 & 첫 배포 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 1-1 | `.env.local` 파일 생성 후 `GEMINI_API_KEY` 입력 | [x] |
| 1-2 | `.gitignore`에 `.env.local` 포함 여부 확인 | [x] |
| 1-3 | `git init` → 커밋 → GitHub 저장소 푸시 | [x] |
| 1-4 | Vercel에서 GitHub 저장소 연결 → 첫 자동 배포 실행 | [x] |
| 1-5 | Vercel 환경변수 `GEMINI_API_KEY` 등록 (Production + Preview) | [x] |
| 1-6 | `page.tsx` 구현 | [x] |

---

### 2단계: 디자인 기반 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 2-1 | `globals.css` 색 토큰 10종, 다크모드 분리 | [x] |
| 2-2 | 한지 배경 질감 CSS | [x] |
| 2-3 | `next/font/google` 글꼴 3종 연결 | [x] |
| 2-4 | 애니메이션 키프레임 7종 정의 | [x] |
| 2-5 | `prefers-reduced-motion` 미디어쿼리 | [x] |
| 2-6 | `ObangsaekStripe.tsx` | [x] |
| 2-7 | 버튼 3종 CSS 클래스 | [x] |
| 2-8 | `Stamp.tsx` | [x] |
| 2-9 | `Toast.tsx` | [x] |

---

### 3단계: S1 메인 & 업로드 화면 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 3-1 | `ScreenMain.tsx` — S1-a 레이아웃 | [x] |
| 3-2 | 드롭 영역, 클릭 시 파일 선택 | [x] |
| 3-3 | 카메라·파일 선택·드래그 앤 드롭 | [x] |
| 3-4 | 드래그 중 배경 전환 + shake 애니메이션 | [x] |
| 3-5 | `lib/image.ts` — 형식·용량 검사 | [x] |
| 3-6 | S1-b — 미리보기 + 버튼 | [x] |
| 3-7 | S1-c — 에러 안내창 5종 | [x] |
| 3-8 | Canvas 이미지 축소 함수 | [x] |
| 3-9 | 하단 고지 3종 | [x] |

---

### 4단계: S2 로딩 · S3 결과 화면 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 4-1 | `types/result.ts` — `AnalysisResult` 타입 | [x] |
| 4-2 | `page.tsx` — 상태 머신 로직 | [x] |
| 4-3 | `ScreenLoading.tsx` — 오방색 링, 방울, 멘트 롤링 | [x] |
| 4-4 | `ScreenResult.tsx` — 부적 카드 | [x] |
| 4-5 | 카드 unfold 애니메이션 | [x] |
| 4-6 | 버튼 3종 (공유/저장/다시하기) | [x] |

---

### 5단계: Gemini 프록시 API ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 5-1 | `npm install @google/genai` v2.32.0 | [x] |
| 5-2 | `lib/prompt.ts` — 현학적 B급 페르소나 프롬프트 | [x] |
| 5-3 | `app/api/analyze/route.ts` — POST 핸들러 | [x] |
| 5-4 | 모델: `gemini-1.5-flash` (무료 티어 멀티모달) | [x] |
| 5-5 | JSON 출력 강제, 파싱 실패 → `FAILED` | [x] |
| 5-6 | 에러 매핑: 429→`QUOTA`, 타임아웃→`FAILED`, 얼굴없음→`NO_FACE` | [x] |
| 5-7 | API 키 환경변수 보관, 로그 노출 금지 | [x] |
| 5-8 | `maxDuration = 30` (Vercel Hobby 한도) | [x] |

---

### 6단계: 프론트–API 연결 & 에러 처리 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 6-1 | "관상 보기" → 이미지 축소 → `POST /api/analyze` | [x] |
| 6-2 | 실제 API 응답으로 S3 렌더링 | [x] |
| 6-3 | 에러 5종 문구 연결 | [x] |
| 6-4 | 클라이언트 타임아웃 25초 (`AbortController`) | [x] |
| 6-5 | 로딩 중 중복 요청 방지 | [x] |
| 6-6 | "다시 검사하기" 완전 초기화 | [x] |

---

### 7단계: 공유 · 이미지 저장 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 7-1 | `npm install html-to-image` v1.11.13 | [x] |
| 7-2 | `lib/share.ts` — 공유 텍스트 생성 | [x] |
| 7-3 | `navigator.share` + 클립보드 폴백 | [x] |
| 7-4 | `toPng(pixelRatio:2)` → 다운로드 | [x] |
| 7-5 | 카드 영역만 캡처 (버튼·Toast 제외) | [x] |

---

### 8단계: 품질 점검

| # | 항목 | 기준 | 완료 |
|---|---|---|---|
| 8-1 | 분석 성공률 | 정면 얼굴 10장 중 9장 이상 | [ ] |
| 8-2 | 톤 기준 | 결과 10건 중 외모 비하 0건 | [ ] |
| 8-3 | 응답 속도 | 10초 이내 (모바일 회선) | [ ] |
| 8-4 | 화면 호환 | 작은 폰 / 큰 폰 / PC / 라이트·다크 | [ ] |
| 8-5 | 접근성 | WCAG AA 대비, 키보드 조작, aria-label | [ ] |
| 8-6 | 고지 문구 | 메인·결과 화면 고지 3종 모두 표시 | [ ] |

---

### 9단계: 운영 배포 ✅ 완료

> 운영 URL: **https://my-app-sandy-seven.vercel.app/**

| # | 작업 | 완료 |
|---|---|---|
| 9-1 | Vercel 환경변수 `GEMINI_API_KEY` (Production) 등록 | [x] |
| 9-2 | Google 프로젝트에 결제 수단 미연결 재확인 | [ ] 확인 필요 |
| 9-3 | Vercel Hobby 무료 플랜 확인 | [x] |
| 9-4 | 운영 주소에서 실기기 테스트 | [ ] |
| 9-5 | 공유 텍스트의 서비스 주소 — 배포 URL 자동 반영 확인 | [x] |
| 9-6 | `05_RELEASE_LOG.md` v0.1.0 기록 | [x] |

---

### 10단계: NeonDB 연동 & 방명록 ✅ 완료 (2026-11-06)

| # | 작업 | 완료 |
|---|---|---|
| 10-1 | Vercel CLI, Neon CLI 설치 및 로그인 | [x] |
| 10-2 | NeonDB 프로젝트 생성 (`summer-heart-09242347`, 싱가포르) | [x] |
| 10-3 | `npm install @neondatabase/serverless` v1.2.0 | [x] |
| 10-4 | `src/lib/db.ts` — NeonDB 연결 모듈 | [x] |
| 10-5 | `analyses` 테이블 생성 + 인덱스 | [x] |
| 10-6 | `guestbook` 테이블 생성 + 인덱스 (is_hidden 부분 인덱스) | [x] |
| 10-7 | `schema.sql` — 전체 스키마 정의 파일 | [x] |
| 10-8 | `app/api/analyze/route.ts` — 분석 완료 후 `analyses` 저장 (non-blocking) | [x] |
| 10-9 | `app/api/guestbook/route.ts` — GET(목록)/POST(작성) | [x] |
| 10-10 | `ScreenResult.tsx` — "방명록에 남기기" 버튼 + 인라인 폼 | [x] |
| 10-11 | `app/guestbook/page.tsx` — 방명록 목록 페이지 (ISR 30초) | [x] |
| 10-12 | Vercel 환경변수 `DATABASE_URL` 등록 (Production + Preview) | [x] |
| 10-13 | `.env.local.example` — `DATABASE_URL` 항목 추가 | [x] |
| 10-14 | `05_RELEASE_LOG.md` v0.2.0 기록 | [x] |

**검증:**
- NeonDB 대시보드에서 `analyses`, `guestbook` 테이블 존재 확인
- 분석 완료 후 방명록 폼 작성 → `/guestbook`에서 확인
- DB 저장 실패 시에도 분석 결과 정상 반환 확인 (non-blocking)
- Vercel 배포 후 `DATABASE_URL` 환경변수 주입 확인

---

### 11단계: DB Phase 1 — 페이지네이션 & 통계 API ✅ 완료 (2026-11-06)

| # | 작업 | 완료 |
|---|---|---|
| 11-1 | `GET /api/guestbook` 커서 기반 페이지네이션 (`?cursor=&limit=`) | [x] |
| 11-2 | 응답 형식 변경: `GuestbookEntry[]` → `{ items, nextCursor }` | [x] |
| 11-3 | `GuestbookList.tsx` 클라이언트 컴포넌트 (더 보기 버튼) | [x] |
| 11-4 | `guestbook/page.tsx` 전체 건수 표시 + GuestbookList 연동 | [x] |
| 11-5 | `GET /api/stats` 신규 엔드포인트 (revalidate 60초) | [x] |

---

### 12단계: DB Phase 2 — 숨김 API & 도배 방지 ✅ 완료 (2026-11-06)

| # | 작업 | 완료 |
|---|---|---|
| 12-1 | `PATCH /api/guestbook/[id]` 관리자 숨김 처리 API | [x] |
| 12-2 | `x-admin-secret` 헤더 인증 (환경변수 `ADMIN_SECRET` 대조) | [x] |
| 12-3 | `guestbook` 테이블 `ip_hash TEXT` 컬럼 추가 (마이그레이션) | [x] |
| 12-4 | `guestbook_ip_hash_idx` 인덱스 추가 | [x] |
| 12-5 | `POST /api/guestbook` SHA-256 IP 해시 저장 + 1시간 3건 초과 시 429 | [x] |
| 12-6 | `ScreenResult.tsx` 429 응답 B급 안내 메시지 처리 | [x] |

---

## 3. 단계 의존 관계

```
0단계 (사전 준비)
    └→ 1단계 (환경 구축)
           └→ 2단계 (디자인 기반)
                  └→ 3단계 (S1 화면)
                  └→ 4단계 (S2·S3 화면)     → 6단계 (연결) → 7단계 (공유/저장) → 8단계 (점검) → 9단계 (배포) → 10단계 (DB+방명록)
                  └→ 5단계 (Gemini API)
```

---

## 4. 위험 요소 & 대응

| 위험 | 대응 |
|---|---|
| Gemini 무료 한도 소진 | 결제 수단 미연결 → 비용 0원, 요청 거절 → `QUOTA` 문구 안내 |
| NeonDB 무료 한도 초과 | 0.5GB 스토리지, 월 190시간 컴퓨팅 — 개인 프로젝트 범위에서 충분. 초과 시 scale-to-zero 자동 대응 |
| Vercel 함수 실행 시간 초과 | 1024px JPEG 축소, `maxDuration = 30` 설정 |
| iOS Safari에서 PNG 글꼴 깨짐 | `document.fonts.ready` 대기 |
| AI 톤 기준 위반 (외모 평가) | 프롬프트에 금지 명시 + 8단계 테스트 |
| API 키 / DB 연결 문자열 유출 | 서버 환경변수에만 보관, `.env.local` git 제외 |
| 방명록 스팸/욕설 | IP 해시 기반 도배방지 (1시간 3건), `PATCH /api/guestbook/[id]` ADMIN_SECRET 관리 |

---

## 5. 현재 상태 체크

```
[x] Next.js 16 + TypeScript + Tailwind 4 설치 완료
[x] 폴더 뼈대 생성 완료
[x] .env.local 생성 — GEMINI_API_KEY + DATABASE_URL 등록 완료
[x] GitHub 연결 — hemj3519/my---app 푸시 완료
[x] 디자인 기반 (2단계) 완료
[x] 화면 구현 (3~4단계) — S1·S2·S3 완료
[x] Gemini API (5단계) — /api/analyze 엔드포인트 완료
[x] 프론트-API 연결 (6단계) — 실제 호출·에러 처리 완료
[x] 공유·저장 (7단계) — navigator.share + html-to-image 완료
[ ] 품질 점검 (8단계) — 운영 환경 실기기 테스트 필요
[x] Vercel 배포 (9단계) — https://my-app-sandy-seven.vercel.app/
[x] NeonDB + 방명록 (10단계) — 완료 (2026-11-06)
    - analyses 테이블: 분석 결과 자동 저장
    - guestbook 테이블: 방명록 선택 저장
    - /api/guestbook: GET/POST 완료
    - /guestbook: 목록 페이지 완료
[x] DB Phase 1 (11단계) — 완료 (2026-11-06)
    - GET /api/guestbook: 커서 기반 페이지네이션 (20건씩, 더 보기)
    - GET /api/stats: 분석 횟수 + 방명록 수 (1분 캐시)
    - GuestbookList.tsx: 클라이언트 컴포넌트
[x] DB Phase 2 (12단계) — 완료 (2026-11-06)
    - PATCH /api/guestbook/[id]: 숨김 처리 (ADMIN_SECRET 인증)
    - guestbook.ip_hash 컬럼 + 인덱스 추가 (마이그레이션)
    - POST /api/guestbook: 1시간 3건 도배 방지 (SHA-256 IP 해시)
    - ScreenResult: 429 응답 B급 안내 메시지
```
