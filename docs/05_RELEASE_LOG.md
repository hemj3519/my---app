# 🚀 배포 및 변경 기록 (05_RELEASE_LOG.md)

이 문서는 프로젝트 배포 정보와 버전별 변경 사항을 기록하는 문서입니다.

---

## 1. 배포 환경 정보

| 항목 | 내용 |
|---|---|
| 운영 URL | https://my-app-sandy-seven.vercel.app/ |
| 호스팅 | Vercel Hobby (무료 플랜) |
| DB | NeonDB 무료 플랜 — `summer-heart-09242347` (ap-southeast-1, 싱가포르) |
| 소스 저장소 | https://github.com/hemj3519/my---app (비공개) |
| 자동 배포 | main 브랜치 push → Vercel 자동 빌드·배포 |
| 환경변수 | `GEMINI_API_KEY` (Production + Preview), `DATABASE_URL` (Production + Preview) |

---

## 2. 버전별 릴리즈 노트

### v0.4.0 (2026-11-06)

**주요 내용: DB Phase 3 & 접근성 개선 — 배포 직전 완료**

- `GET /api/cron/cleanup` 신규 — Vercel Cron Job (매월 1일, 90일 초과 analyses 삭제)
- `vercel.json` 추가 — cron 스케줄 설정
- `GET /api/stats` 확장 — `topNicknames: NicknameRank[]` TOP 5 추가
- 드롭존 키보드 접근성: `tabIndex`, Enter/Space 키 핸들러 추가
- 방명록 폼 입력 필드 `aria-label` 추가 (이름·한마디)
- 8-6 고지 문구 코드 확인 완료 (메인 3종, 결과 면책 ✅)
- 환경변수 `CRON_SECRET` Vercel 등록 필요 (Cron Job 인증용)

**커밋:** `(이번 커밋)`

---

### v0.3.0 (2026-11-06)

**주요 내용: DB 개선 — 페이지네이션·통계·숨김API·도배방지**

- `GET /api/guestbook` 커서 기반 페이지네이션 (기본 20건, `?cursor=&limit=` 지원)
- `GuestbookList.tsx` 클라이언트 컴포넌트 — "더 보기" 버튼으로 추가 로드
- `/guestbook` 페이지 — 전체 건수 표시, GuestbookList 연동
- `GET /api/stats` 신규 — `{ totalAnalyses, totalGuestbook }`, 1분 ISR 캐시
- `PATCH /api/guestbook/[id]` 신규 — 관리자 숨김 처리 (`x-admin-secret` 헤더 인증)
- `guestbook` 테이블 `ip_hash TEXT` 컬럼 + 인덱스 추가 (NeonDB 마이그레이션 완료)
- `POST /api/guestbook` — SHA-256 IP 해시 저장, 1시간 내 3건 초과 시 429
- `ScreenResult.tsx` — 429 응답 시 B급 안내 메시지 처리

**커밋:** `8ba13ab` (Phase 1 페이지네이션·통계), `09d405b` (Phase 2 숨김·도배방지)

---

### v0.2.0 (2026-11-06)

**주요 내용: NeonDB 연동 & 방명록 기능 추가**

- NeonDB 프로젝트 생성 (싱가포르 리전, 무료 플랜)
- `analyses` 테이블: 분석 결과 자동 저장 (non-blocking)
- `guestbook` 테이블: display_name, message, nickname, lucky_item, is_hidden
- `GET /api/guestbook`: 최신 50건 목록 조회
- `POST /api/guestbook`: 방명록 작성 (유효성 검증, DB CHECK 제약)
- `ScreenResult`: "📜 방명록에 남기기" 버튼 + 인라인 폼 추가
- `/guestbook`: 방명록 목록 페이지 (ISR 30초, 앱 B급 톤 유지)
- Vercel 환경변수 `DATABASE_URL` Production + Preview 등록
- DB 정책 변경: Zero-DB → 이미지 비저장 유지 + 방명록 텍스트 선택 저장

**커밋:** `fa504fb` (NeonDB 연동), `a5398c2` (방명록 기능)

---

### v0.1.0 (2026-11-05)

**주요 내용: 초기 릴리즈**

- Next.js 16 + TypeScript + Tailwind CSS 4 기반 프로젝트
- Google Gemini API (`gemini-1.5-flash`) 연동, 얼굴 관상 분석
- 무속·점집 패러디 B급 밈 디자인 (오방색·한지·부적·붓글씨)
- 화면 3개: 메인/업로드 → 로딩 (오방색 링·방울·멘트 롤링) → 결과 (부적 카드)
- 텍스트 공유 (`navigator.share`) + 결과 이미지 저장 (`html-to-image`)
- 에러 5종 처리 (형식, 용량, 얼굴 없음, 쿼터 초과, 실패)
- Zero-DB 정책 (이미지·결과 미저장)
- Vercel Hobby 무료 배포

**커밋:** `3bbe3f7`, `18e1dda`, `203d2ae`
