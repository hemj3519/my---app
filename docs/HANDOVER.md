# 📌 인계 및 진행 상황 (HANDOVER.md)

이 문서는 매 작업 세션을 시작할 때 현재 상태를 파악하고, 다음 할 일을 확인하는 기준 문서입니다.

---

## 1. 현재 진행 단계

| 단계 | 문서 | 상태 |
|---|---|---|
| 아이디어 정의 | `01_IDEA.md` | ✅ 완료 (2026-11-03, DB 정책 수정 2026-11-06) |
| 제품 요구사항 | `02_PRD.md` | ✅ 완료 (2026-11-03, 방명록 F-6 추가 2026-11-06) |
| 화면 및 흐름 설계 | `03_UI_FLOW.md` | ✅ 완료 |
| 개발 계획 | `04_DEV_PLAN.md` | ✅ 13단계 완료 (배포 직전) |
| 개발 (1~13단계) | — | ✅ 완료 |
| 배포 | `05_RELEASE_LOG.md` | ✅ v0.4.0 (배포 직전) |
| DB 구현 계획 | `06_DB_PLAN.md` | ✅ Phase 1·2·3 완료 |

---

## 2. 현재 운영 상태

| 항목 | 내용 |
|---|---|
| 운영 URL | https://my-app-sandy-seven.vercel.app/ |
| 최신 버전 | v0.4.0 (2026-11-06, 배포 직전) |
| DB | NeonDB `summer-heart-09242347` (싱가포르) |
| 테이블 | `analyses` (분석 로그), `guestbook` (방명록, ip_hash 컬럼 포함) |
| 방명록 URL | /guestbook |
| 통계 API | GET /api/stats |
| 관리 API | PATCH /api/guestbook/[id] (x-admin-secret 헤더 필요) |

---

## 3. 최근 작업 내역

**2026-11-06 (v0.4.0 — DB Phase 3 & 접근성):**
- `GET /api/cron/cleanup` Vercel Cron Job (매월 1일, 90일 초과 삭제)
- `vercel.json` cron 스케줄 추가
- `GET /api/stats` topNicknames TOP 5 추가
- 드롭존 키보드 접근성 (tabIndex, Enter/Space)
- 방명록 폼 aria-label 추가
- 8-5·8-6 접근성·고지 문구 코드 완료

**2026-11-06 (v0.3.0 — DB Phase 1·2):**
- `GET /api/guestbook` 커서 기반 페이지네이션 (20건씩, 더 보기)
- `GET /api/stats` 신규 (분석 횟수 + 방명록 수, 1분 캐시)
- `PATCH /api/guestbook/[id]` 관리자 숨김 처리 API (ADMIN_SECRET)
- `guestbook.ip_hash` 컬럼 + 인덱스 추가, 1시간 3건 도배방지
- `GuestbookList.tsx` 클라이언트 컴포넌트 신규
- `ScreenResult`: 429 응답 안내 메시지 추가
- `docs/06_DB_PLAN.md` DB 구현 계획서 작성

**2026-11-06 (v0.2.0 — NeonDB + 방명록):**
- NeonDB + Vercel CLI 연동 완료
- `analyses` 테이블: 분석 결과 자동 저장 (non-blocking)
- `guestbook` 테이블: 방명록 B안 구현
  - 필드: display_name(20자), message(100자), nickname(AI 자동), lucky_item(AI 자동), is_hidden
- `GET/POST /api/guestbook` API 구현
- `ScreenResult`: "방명록에 남기기" 인라인 폼
- `/guestbook`: 목록 페이지 (ISR 30초)

**2026-11-05:**
- v0.1.0 초기 릴리즈 (Gemini 연동, 화면 3개, 공유/저장)

**2026-11-03:**
- 기획 문서 전체 작성 및 승인 (`01_IDEA.md`, `02_PRD.md`, `03_UI_FLOW.md`)

---

## 4. 다음 작업 (Next Action)

### 미완료 항목

- [ ] **8단계 품질 점검**: 운영 환경 실기기 테스트 (분석 성공률, 톤, 속도, 호환성)
- [ ] **9-2**: Google 프로젝트 결제 수단 미연결 재확인 (0원 원칙)
- [ ] **9-7**: 지인 5명 이상 공유 → 반응 확인

### 남은 항목 (사람이 직접 해야 하는 것)

- [ ] **8-1~8-4 품질 점검**: 운영 URL에서 실기기 직접 테스트 (분석 성공률, 톤, 속도, 화면 호환)
- [ ] **9-2**: Google 프로젝트 결제 수단 미연결 재확인
- [ ] **CRON_SECRET**: Vercel 환경변수에 임의 비밀값 등록 (Cron Job 인증용)

> 코드로 구현 가능한 모든 개발 항목은 완료되었습니다.

---

## 5. 핵심 정책 요약

| 정책 | 내용 |
|---|---|
| 이미지 저장 | ❌ 우리 서버 미저장. Gemini 전송 후 즉시 폐기 |
| 방명록 저장 | ✅ 사용자 선택 시 텍스트만 저장 (사진 미포함) |
| 운영비 | 0원 (Gemini 무료 티어, NeonDB 무료, Vercel 무료) |
| 결제 수단 | Gemini 프로젝트에 미연결 필수 |
| 디자인 톤 | 무속·점집 패러디 B급 밈. 기준: `03_UI_FLOW.md` 4장 |
| 대상 연령 | 만 18세 이상 |
