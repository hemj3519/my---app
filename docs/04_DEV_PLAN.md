# 🛠️ 개발 계획서 (04_DEV_PLAN.md)

> **상태: 진행 중 (2026-11-05 업데이트)**  
> 기준 문서: `01_IDEA.md` · `02_PRD.md` · `03_UI_FLOW.md` · `DESIGN.md`  
> 기술 스택 확정: **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Vercel Hobby**  
> 현재 위치: **8단계 (품질 점검)** — 1~7단계 개발 완료, GitHub 푸시 완료, Vercel 배포 대기

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
| DB | **없음** | Zero-DB 정책 (`02_PRD.md` 3.1) |
| 호스팅 | **Vercel Hobby (무료)** | GitHub 푸시마다 자동 배포 |
| 소스 관리 | **Git + GitHub (비공개)** | Vercel 자동 배포 연동 |

### 1.1 폴더 구조

```
my-app/
├─ docs/                        # 기획 문서 (변경 없음)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx             # 글꼴 로딩, 오방색 띠, 공통 틀
│  │  ├─ page.tsx               # 단일 페이지 (S1 → S2 → S3 상태 전환)
│  │  ├─ globals.css            # 색 토큰(라이트/다크), 애니메이션, 한지 질감
│  │  └─ api/
│  │     └─ analyze/
│  │        └─ route.ts         # Gemini 프록시 (서버에서만 실행)
│  ├─ components/
│  │  ├─ ObangsaekStripe.tsx    # 오방색 띠 (공통)
│  │  ├─ Stamp.tsx              # 붉은 도장 컴포넌트
│  │  ├─ Toast.tsx              # 부적 쪽지 토스트
│  │  ├─ ScreenMain.tsx         # S1 메인 & 업로드
│  │  ├─ ScreenLoading.tsx      # S2 분석 로딩
│  │  └─ ScreenResult.tsx       # S3 결과 & 공유
│  ├─ lib/
│  │  ├─ image.ts               # 사진 검사·Canvas 축소
│  │  ├─ prompt.ts              # Gemini 프롬프트
│  │  ├─ messages.ts            # 에러·로딩 문구 모음
│  │  └─ share.ts               # 공유 텍스트 생성·클립보드 복사
│  └─ types/
│     └─ result.ts              # AnalysisResult 타입 정의
├─ .env.local                   # GEMINI_API_KEY (git 제외)
└─ package.json
```

### 1.2 화면 상태 머신

```
idle(S1-a) ──사진선택──→ preview(S1-b) ──관상보기──→ loading(S2) ──성공──→ result(S3)
    ↑              ↑                                       │
    └──다시시도──── └──────────────── error(S1-c) ←─────────┘
                                      (5가지 에러 문구)
```

### 1.3 API 계약

```
POST /api/analyze
  Body: { image: string }  // base64 JPEG, 긴 변 ≤ 1024px

200: { nickname: string, summary: string,
       features: { part: string, comment: string }[],
       luckyItem: string }

4xx/5xx: { error: "NO_FACE" | "QUOTA" | "FAILED" }
```

---

## 2. 단계별 개발 계획

> 한 단계 완료 후 검증을 직접 확인하고 다음 단계로 진행합니다.  
> `[x]` = 완료 / `[ ]` = 미완료

---

### 0단계: 사전 준비 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 0-1 | Google AI Studio에서 Gemini API 키 발급 (결제 수단 **미연결** 필수) | [x] |
| 0-2 | GitHub 계정 준비, 비공개 저장소 생성 (`hemj3519/my---app`) | [x] |
| 0-3 | Vercel 계정 가입 (GitHub로 로그인) | [ ] |
| 0-4 | Gemini API 약관 확인: 무료 티어 데이터 처리 범위, 18세 미만 제한 | [ ] |

**주의**: API 키는 채팅·문서·GitHub 커밋에 절대 붙여넣지 않습니다.

---

### 1단계: 환경 구축 & 첫 배포 ✅ 완료 (Vercel 연결 제외)

| # | 작업 | 완료 |
|---|---|---|
| 1-1 | `.env.local` 파일 생성 후 `GEMINI_API_KEY=...` 입력 | [x] API 키 등록 완료 |
| 1-2 | `.gitignore`에 `.env.local` 포함 여부 확인 | [x] `.env*` 패턴으로 보호 확인 |
| 1-3 | `git init` → 커밋 → GitHub 저장소 푸시 | [x] `hemj3519/my---app` 푸시 완료 |
| 1-4 | Vercel에서 GitHub 저장소 연결 → 첫 자동 배포 실행 | [ ] **9단계에서 진행** |
| 1-5 | Vercel 프로젝트 설정에서 환경변수 `GEMINI_API_KEY` 등록 (Production + Preview) | [ ] **9단계에서 진행** |
| 1-6 | `page.tsx` 구현 | [x] 전체 상태 머신 구현 완료 |

**검증:**
- `npm run dev` → `http://localhost:3000` 페이지 뜸
- Vercel이 준 `*.vercel.app` URL에서 같은 페이지 뜸
- GitHub 저장소에 `.env.local` 파일이 **없음**
- Vercel 프로젝트 설정 → Environment Variables에 키가 있음

---

### 2단계: 디자인 기반 — 색·글꼴·공통 컴포넌트 ✅ 완료

기준: `DESIGN.md` 3~9장

| # | 작업 | 완료 |
|---|---|---|
| 2-1 | `globals.css`에 색 토큰 10종 CSS 변수로 정의, 다크모드(`prefers-color-scheme`) 분리 | [x] |
| 2-2 | 한지 배경 질감 CSS (`radial-gradient` 노이즈, 별자리 점선 패턴) | [x] |
| 2-3 | `next/font/google`으로 글꼴 3종 연결, `layout.tsx`에 적용 | [x] |
| 2-4 | `globals.css`에 애니메이션 키프레임 7종 정의 (`DESIGN.md` 7장) | [x] |
| 2-5 | `prefers-reduced-motion` 미디어쿼리로 애니메이션 전체 off | [x] |
| 2-6 | `ObangsaekStripe.tsx` — 오방색 띠 컴포넌트 | [x] |
| 2-7 | 버튼 3종 CSS 클래스 정의 (`btn-primary`, `btn-secondary`, `btn-text`) | [x] |
| 2-8 | `Stamp.tsx` — CSS 도장 컴포넌트 (글자·모양·기울임 props) | [x] |
| 2-9 | `Toast.tsx` — 부적 쪽지 토스트 컴포넌트 (2~3초 자동 소멸) | [x] |
| 2-10 | 임시 디자인 확인 페이지에 위 요소 나열 (개발 중만 사용) | [x] |

**검증:**
- 붓글씨 / 바탕체 / 고딕 세 글꼴이 각각 다르게 보임
- 버튼 3종이 `DESIGN.md` 5장 스펙대로 보이고, 클릭 시 눌림 효과
- 다크모드 토글 시 색이 "한밤의 굿판" 버전으로 바뀜
- "움직임 줄이기" 설정 활성화 시 애니메이션 멈춤

---

### 3단계: S1 메인 & 업로드 화면 ✅ 완료

기준: `03_UI_FLOW.md` 3.1 / `02_PRD.md` F-1, 3.1~3.3

| # | 작업 | 완료 |
|---|---|---|
| 3-1 | `ScreenMain.tsx` — S1-a 레이아웃: 오방색 띠, 현판 제목 + 도장, 소개 문구 | [x] |
| 3-2 | 드롭 영역: 주홍 점선 테두리 + 금색 ✦ 꺾쇠, 클릭 시 파일 선택 열림 | [x] |
| 3-3 | 카메라 버튼 (`capture="environment"`), 파일 선택 버튼, 드래그 앤 드롭 | [x] |
| 3-4 | 드래그 중 배경 부적 황 전환 + `shake` 애니메이션 | [x] |
| 3-5 | `lib/image.ts` — 형식 검사(jpg/png/webp), 10MB 초과 검사, 읽기 실패 감지 | [x] |
| 3-6 | S1-b — 미리보기 + "관상 보기" / "다른 사진 고르기" 버튼 | [x] |
| 3-7 | S1-c — 에러 안내창 (한지 + 주홍 테두리 + "흉" 도장), 에러 5종 문구 연결 | [x] |
| 3-8 | `lib/image.ts` — Canvas로 긴 변 1024px·JPEG 축소 함수 | [x] |
| 3-9 | 하단 고지 3종: Gemini 전송 안내 / 18세 이상 / 재미용 허구 | [x] |

**에러 문구 매핑 (`lib/messages.ts`):**

| 에러 | 문구 |
|---|---|
| 형식 오류·읽기 실패 | "이 사진은 너무 고귀한 포맷이라 소인이 읽지 못하옵니다. 카메라로 바로 찍어 주시옵소서!" |
| 10MB 초과 | "사진이 너무 무거워 관상가의 팔이 부러졌습니다. 10MB 이하로 올려주세요!" |
| 얼굴 미인식 (NO_FACE) | "이것은 사람이 아니거나 외계인입니다. 정면 얼굴을 다시 찍어주세요!" |
| 분석 실패·시간 초과 | "관상신(神)께서 잠시 자리를 비우셨습니다. 잠시 후 다시 시도해 주세요." |
| 무료 사용량 초과 | "오늘 관상소 기운이 모두 소진되었습니다. 내일 다시 찾아주시오." |

**검증:**
- PC에서 사진 끌어다 놓기 → 미리보기 표시, 드래그 중 배경 노랗게 흔들림
- `.gif` / `.pdf` 올리기 → 형식 에러 문구
- 10MB 초과 사진 → 용량 에러 문구
- 휴대폰에서 "카메라로 찍기" → 카메라 실행, 찍은 사진 미리보기 표시
- 개발자도구에서 축소 결과가 약 1024px · JPEG인지 확인

---

### 4단계: S2 로딩 · S3 결과 화면 ✅ 완료

기준: `03_UI_FLOW.md` 3.2~3.3 / `DESIGN.md` 6~8장

| # | 작업 | 완료 |
|---|---|---|
| 4-1 | `types/result.ts` — `AnalysisResult` 타입 정의 | [x] |
| 4-2 | `page.tsx` — 상태 머신 로직 (`idle` → `preview` → `loading` → `result` / `error`) | [x] |
| 4-3 | 가짜 결과 데이터 상수 정의 (nickname / summary / features / luckyItem 샘플) | [x] |
| 4-4 | `ScreenLoading.tsx` — 오방색 회전 링 (`conic-gradient` + mask), 🔔 방울 흔들림 | [x] |
| 4-5 | 로딩 멘트 8개 1.5초 간격 롤링, `ink-appear` 먹 번짐 전환 | [x] |
| 4-6 | 촛불빛 가장자리 깜빡임 (`candle-flicker`) | [x] |
| 4-7 | `ScreenResult.tsx` — 부적 카드: 이중 테두리, 썸네일, nickname, summary | [x] |
| 4-8 | 부위별 관상평 (◆ 마름모 글머리), 별자리 구분선, luckyItem, 면책 문구 | [x] |
| 4-9 | 카드 `unfold-card` 펼쳐짐 애니메이션 (0.6초) | [x] |
| 4-10 | 버튼 3종: "결과 공유하기" / "이미지로 저장" / "다시 검사하기" | [x] |
| 4-11 | 모바일 한 화면 안에 칭호~행운의 아이템 들어오는지 확인 (PRD F-4) | [ ] 8단계 실기기 테스트 필요 |

**로딩 멘트 목록 (`lib/messages.ts`):**
1. "『마의상법』 제3권 미간편 대조 중..."
2. "눈빛 속 숨겨진 흑염룡의 기운 판독 중..."
3. "조선 팔도 관상가 협회에 자문 요청 중..."
4. "천정(天庭)에 깃든 월요병 지수 산출 중..."
5. "콧대에 흐르는 재물운의 유속 측정 중..."
6. "『상리형진』 각주의 각주까지 뒤지는 중..."
7. "입꼬리에 숨은 말실수운 감정 중..."
8. "관상가가 안경을 고쳐 쓰는 중..."

**검증:**
- 가짜 결과로 S1 → S2 → S3 완전히 이어짐
- 로딩 멘트 바뀌고 링·방울 움직임
- 휴대폰 화면에서 스크롤 없이 부적 카드 핵심 한 화면에 들어옴
- 아주 긴 nickname/summary를 넣어도 레이아웃 깨지지 않음
- 다크모드에서도 읽힘

---

### 5단계: Gemini 프록시 API (서버) ✅ 완료

기준: `02_PRD.md` F-2, 3.1, 3.4, 3.5

| # | 작업 | 완료 |
|---|---|---|
| 5-1 | `npm install @google/genai` | [x] v2.32.0 설치 |
| 5-2 | `lib/prompt.ts` — 현학적 B급 페르소나 프롬프트 작성 | [x] |
| 5-3 | `app/api/analyze/route.ts` — POST 핸들러: base64 → Gemini 호출 → JSON 파싱 → 반환 | [x] |
| 5-4 | 모델 선택: `gemini-1.5-flash` (무료 티어 멀티모달) | [x] |
| 5-5 | JSON 출력 강제 (`responseMimeType: "application/json"`), 파싱 실패 → `FAILED` | [x] |
| 5-6 | 에러 매핑: HTTP 429 → `QUOTA`, 타임아웃·기타 → `FAILED`, 얼굴 없음 → `NO_FACE` | [x] |
| 5-7 | API 키 `process.env.GEMINI_API_KEY?.trim()` — 응답·로그 절대 노출 금지 | [x] |
| 5-8 | 이미지·결과 저장·로그 없음 (Zero-DB) | [x] |
| 5-9 | `maxDuration = 30` 설정 (Vercel Hobby 한도) | [x] |

**프롬프트 핵심 지시사항 (`lib/prompt.ts`):**
```
- 얼굴이 보이지 않으면 JSON: {"error":"NO_FACE"} 만 반환
- 외모(잘생김/못생김, 체형, 피부, 나이, 인종, 성별) 절대 평가 금지
- 오직 "운세·상황 밈"으로만 풀이
- 고문헌 용어 + 현대 밈을 섞은 현학적 B급 톤
- 결과는 항상 유쾌한 덕담·반전으로 마무리
- 반환 형식: { nickname, summary, features: [{part,comment}×4], luckyItem }
```

**검증:**
- `curl -X POST /api/analyze` + 정면 얼굴 사진 → JSON 4항목 정상 응답
- 풍경·동물 사진 → `{"error":"NO_FACE"}`
- 잘못된 API 키 → `FAILED` (키가 응답에 노출 안 됨)
- 서버 로그에 이미지 데이터 없음
- 응답 10초 이내 체감

---

### 6단계: 프론트–API 연결 & 에러 처리 ✅ 완료

| # | 작업 | 완료 |
|---|---|---|
| 6-1 | `ScreenMain.tsx`의 "관상 보기" 클릭 → 이미지 축소 → `POST /api/analyze` 전송 | [x] |
| 6-2 | 가짜 데이터 제거, 실제 API 응답으로 S3 렌더링 | [x] |
| 6-3 | 에러 5종 문구 (`lib/messages.ts`) → S1-c 안내창 연결 | [x] |
| 6-4 | 클라이언트 타임아웃 설정 (25초, `AbortController`) | [x] |
| 6-5 | 로딩 중 중복 요청 방지 (`screen === "loading"` 가드) | [x] |
| 6-6 | "다시 검사하기" 클릭 시 사진·결과·상태 완전 초기화 | [x] |

**검증:**
- 정면 사진 → 실제 관상 결과 카드 뜸
- 물건 사진 → "외계인" 문구
- 오프라인 상태 → "관상신 자리 비움" 문구
- 로딩 중 버튼 연타해도 요청 한 번만 감
- 다시 검사하기 후 이전 사진이 남아있지 않음

---

### 7단계: 공유 · 이미지 저장 ✅ 완료 (실기기 테스트 제외)

기준: `02_PRD.md` F-5 / `03_UI_FLOW.md` 3.3

| # | 작업 | 완료 |
|---|---|---|
| 7-1 | `npm install html-to-image` | [x] v1.11.13 설치 |
| 7-2 | `lib/share.ts` — 공유 텍스트 생성 (nickname + summary + luckyItem + 서비스 주소) | [x] |
| 7-3 | "결과 공유하기": `navigator.share` 지원 시 공유 창, 미지원 시 클립보드 복사 + Toast | [x] |
| 7-4 | "이미지로 저장": `document.fonts.ready` 대기 → `toPng(pixelRatio:2)` → 다운로드 | [x] |
| 7-5 | 카드 영역(`cardRef`)만 캡처 — 버튼·Toast PNG에 찍히지 않음 | [x] |
| 7-6 | iOS Safari / 안드로이드 Chrome에서 공유·저장 실기기 테스트 | [ ] **8단계에서 진행** |

**공유 텍스트 형식:**
```
[킹받는 AI 관상소] 나의 관상 판독 결과
「{nickname}」
{summary}
🍀 행운의 아이템: {luckyItem}
너도 해보기 👉 {서비스URL}
```

**검증:**
- 휴대폰: 공유 창에 카카오톡이 뜨고, 보낸 메시지 내용이 위 형식대로 옴
- PC: 복사 Toast 뜨고 붙여넣기 됨
- 저장된 PNG에 붓글씨·바탕체가 화면과 똑같이 나옴 (고딕으로 바뀌지 않음)
- 버튼·Toast가 PNG에 찍혀 나오지 않음

---

### 8단계: 품질 점검 (성공 지표 검증) ← **현재 단계**

기준: `02_PRD.md` 5장

| # | 항목 | 기준 | 완료 |
|---|---|---|---|
| 8-1 | 분석 성공률 | 정면 얼굴 10장 중 9장 이상 성공 | [ ] |
| 8-2 | 톤 기준 | 결과 10건 중 외모 비하 0건 | [ ] |
| 8-3 | 응답 속도 | 업로드→결과 10초 이내 (모바일 회선) | [ ] |
| 8-4 | 화면 호환 | 작은 폰 / 큰 폰 / PC 좁은 폭 / 라이트·다크 | [ ] |
| 8-5 | 접근성 | WCAG AA 대비, 키보드 조작, 버튼 aria-label | [ ] |
| 8-6 | 고지 문구 | 메인·결과 화면 고지 3종 모두 표시 | [ ] |
| 8-7 | 금지 요소 | 공포 요소·종교 상징·유료 소재·Analytics 없음 | [ ] |

**8-2 실패 시**: 프롬프트 금지 지시 강화 → 재테스트

---

### 9단계: 운영 배포 & 릴리즈

| # | 작업 | 완료 |
|---|---|---|
| 9-1 | Vercel 환경변수(Production)에 키 올바르게 등록 확인, 코드·저장소에 키 없음 최종 점검 | [ ] |
| 9-2 | Google 프로젝트에 결제 수단 미연결 재확인 (0원 원칙) | [ ] |
| 9-3 | Vercel Hobby 무료 플랜 확인 | [ ] |
| 9-4 | 운영 주소에서 전 과정 실기기 테스트 (휴대폰 카메라 포함) | [ ] |
| 9-5 | 공유 텍스트의 서비스 주소를 실제 배포 URL로 반영 | [ ] |
| 9-6 | `05_RELEASE_LOG.md`에 배포 주소·플랫폼·v0.1.0 기록 | [ ] |
| 9-7 | 지인 5명 이상 공유 → 반응 확인 (성공 지표) | [ ] |

**검증:**
- 운영 URL을 휴대폰에서 열어 처음부터 끝까지 완주
- Vercel / Google Cloud 청구 화면 0원

---

## 3. 단계 의존 관계

```
0단계 (사전 준비)
    └→ 1단계 (환경 구축 & 첫 배포)
           └→ 2단계 (디자인 기반)
                  └→ 3단계 (S1 화면) ──────────────────┐
                  └→ 4단계 (S2·S3, 가짜 데이터) ────────┼→ 6단계 (연결) → 7단계 (공유/저장) → 8단계 (점검) → 9단계 (배포)
                  └→ 5단계 (Gemini API 서버) ───────────┘
```

> 3·4·5단계는 서로 독립적 — 막히는 경우 순서를 바꿔도 됩니다.

---

## 4. 위험 요소 & 대응

| 위험 | 대응 |
|---|---|
| Gemini 무료 한도 소진 | 결제 수단 미연결 → 비용 0원, 요청 거절 → `QUOTA` 문구로 안내 |
| Vercel 함수 실행 시간 초과 | 1024px JPEG 축소로 사진 크기 제한, `maxDuration` 설정 |
| iOS Safari에서 PNG 글꼴 깨짐 | `document.fonts.ready` 대기, 7단계 실기기 테스트 |
| AI 톤 기준 위반 (외모 평가) | 프롬프트에 금지 명시 + 8단계 10건 테스트 |
| API 키 유출 | 서버 환경변수에만 보관, `.env.local` git 제외 |
| OneDrive가 `node_modules` 동기화 | 프로젝트 폴더를 `C:\dev\my-app` 등 OneDrive 밖으로 이동 권장 |

---

## 5. 현재 상태 체크

```
[x] Next.js 16 + TypeScript + Tailwind 4 설치 완료
[x] 폴더 뼈대 생성 완료 (components/, lib/, types/, api/analyze/)
[x] .env.local 생성 — Gemini API 키 등록 완료
[x] GitHub 연결 — hemj3519/my---app 푸시 완료 (커밋 203d2ae)
[x] 디자인 기반 (2단계) — 색 토큰·글꼴·컴포넌트 완료
[x] 화면 구현 (3~4단계) — S1·S2·S3 화면 완료
[x] Gemini API (5단계) — /api/analyze 엔드포인트 완료
[x] 프론트-API 연결 (6단계) — 실제 호출·에러 처리 완료
[x] 공유·저장 (7단계) — navigator.share + html-to-image 완료
[ ] 품질 점검 (8단계) ← 현재 단계
[ ] Vercel 배포 (9단계)
```
