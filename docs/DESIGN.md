# 🔮 디자인 시스템 문서 (DESIGN.md)

이 문서는 `03_UI_FLOW.md` 4장(2026-11-03 확정)과 `02_PRD.md` 3.4(톤 기준)을 바탕으로,  
**"구현에 바로 쓸 수 있는 단일 디자인 기준 문서"** 로 작성합니다.  
화면 흐름 자체는 `03_UI_FLOW.md`를 따르며, 이 문서는 그 위에 입힐 **컨셉 · 색 · 글꼴 · 버튼 · 장식 · 모션**을 다룹니다.

> **상태: 초안 (2026-11-05)**  
> 기준 문서: `01_IDEA.md` · `02_PRD.md` · `03_UI_FLOW.md` 4장  
> `[가안]` = `03_UI_FLOW.md` 5장에 미확정으로 남아있는 항목. 이 문서는 새 결정을 내리지 않고 기존 확정 사항만 구체화합니다.

---

## 1. 디자인 컨셉

### 한 줄 컨셉

> **"별자리가 걸린 동네 용한 점집 간판 — B급 밈 버전"**

무당집·점집의 시각 기호(부적, 오방색, 한지, 붓글씨, 촛불)에  
점술·별자리(성좌 패턴, 점괘 기호, 수정구슬, 타로 별 모티프)를 얹어  
웃음을 유발하는 B급 패러디 미학을 구현합니다.

### 세 가지 레이어

| 레이어 | 주요 소재 | 역할 |
|---|---|---|
| **점집 간판** | 오방색 띠, 한지 배경, 붓글씨 현판, 도장(낙관) | 서비스 "틀"의 정체성 |
| **별자리·점술** | 별 점선 패턴, ✦ · ★ · ◈ 기호, 황도 12궁 힌트 | 신비감·점술 분위기 강화 |
| **병맛·밈** | 현학적 오타쿠 용어, B급 색감 충돌, 과장된 도장 | 웃기고 가볍게 만드는 장치 |

### 지켜야 할 선 (가드레일)

| 금지 | 이유 |
|---|---|
| 귀신·해골 등 공포 요소 | 서비스 목적은 "재미", 무섭지 않아야 함 |
| 卍, 십자가 등 실제 종교 상징 | 특정 종교·신앙과 혼동 방지 |
| 실제 무속 신앙 비하, 저주·액운 협박 문구 | 패러디 소재일 뿐, 신앙 비하 아님 |
| 외모(잘생김/못생김, 체형, 피부, 나이, 인종, 성별) 평가를 암시하는 장식 | 콘텐츠 기준과 동일 — "운세·상황 밈"에만 집중 |

---

## 2. 화면별 디자인 메타포

| 화면 | 메타포 | 핵심 모티프 |
|---|---|---|
| 공통 헤더 | 점집 간판 "틀" | 오방색 띠, 별 점선 |
| S1 메인 & 업로드 | 점집 접수대 + 수정구슬 받침대 | 붓글씨 현판, 도장, 주홍 점선 드롭존, 별자리 꺾쇠 |
| S2 분석 로딩 | 굿판 · 점괘 보는 순간 | 오방색 회전 링, 별자리 궤도, 방울, 촛불빛 |
| S3 결과 & 공유 | 완성된 부적 한 장 | 이중 테두리 부적 카드, 금별 ✦ 글머리, 도장 |
| S1-c 에러 | 흉(凶)패 점괘 | 주홍 "흉" 도장, 한지 안내창 |

이 서비스는 1페이지 구조이므로, 모든 화면이 "한 장의 부적 위에서 별자리가 움직이는" 느낌을 유지합니다.

### 2.1 공통 — 오방색 띠

- 위치: 모든 화면 최상단, `height: 7px`
- 구성: 청(#2C4A7A) · 적(#B5302A) · 황(#F2CC5B) · 백(#F3E9D7) · 흑(#1E1A16) 순, 각 20%
- CSS: `background: linear-gradient(to right, #2C4A7A 0% 20%, #B5302A 20% 40%, #F2CC5B 40% 60%, #F3E9D7 60% 80%, #1E1A16 80% 100%)`

### 2.2 공통 — 별 점선 배경 패턴

- 한지 배경 위에 CSS `radial-gradient` 소규모 별 점들을 뿌려 성좌 느낌을 낸다.
- 불투명도 `0.06`(라이트) / `0.12`(다크) — 존재감은 있지만 본문 읽기를 방해하지 않는 수준.
- 이미지 파일 없이 CSS `background-image` 조합만 사용.

```css
/* 별 점선 패턴 예시 */
background-image:
  radial-gradient(circle, #C9972E 1px, transparent 1px),
  radial-gradient(circle, #C9972E 1px, transparent 1px);
background-size: 60px 60px, 90px 90px;
background-position: 0 0, 30px 30px;
opacity: 0.06;
```

---

## 3. 색상 시스템

0원 원칙(`02_PRD.md` 3.5)에 따라 모든 색은 CSS 값으로만 정의하며, 색상 이미지 파일은 쓰지 않습니다.

### 3.1 색상 토큰

| 토큰명 | 역할 | Light | Dark ("한밤의 굿판") |
|---|---|---|---|
| `--bg-hanji` | 페이지 배경 (한지) | `#F3E9D7` | `#15110E` |
| `--ink-muk` | 기본 글자 (먹) | `#1E1A16` | `#F1E6D2` |
| `--vermilion` | 주 버튼 · 강조 · 도장 (주홍) | `#B5302A` | `#D9483E` |
| `--talisman-yellow` | 결과 카드 배경 (부적 황) | `#F2CC5B` | `#3A2F12` |
| `--gold-trim` | 테두리 장식 (금테) | `#C9972E` | `#E2B24A` |
| `--blue-accent` | 보조 강조 (청) | `#2C4A7A` | `#6F93CF` |
| `--green-accent` | 보조 강조 (녹) | `#3C7A58` | `#6DB38C` |
| `--star-silver` | 별자리 점선 · 별 기호 (은빛) | `#A89F8C` | `#C8B89A` |
| `--surface-card` | 카드 표면 (한지보다 약간 진함) | `#EDE0C4` | `#1E180F` |
| `--muted-text` | 고지·면책 보조 글자 | `#6B5F4E` | `#9B8C74` |

### 3.2 사용 원칙

- **주홍 ↔ 금테 조합**이 이 서비스의 시그니처 색. 주요 강조점마다 이 두 색이 함께 나온다.
- **부적 황**은 결과 카드 배경에만 사용 — 남용하면 "경고 색"처럼 읽힌다.
- **별 은빛(star-silver)**은 별자리 패턴, ✦ 기호에만 사용.
- 명암 대비: WCAG AA 이상 (`--ink-muk` on `--bg-hanji` ≈ 12:1 ✓).
- 다크모드에서도 역할(배경/글자/강조)은 그대로 — 값만 바꾸는 "같은 점집, 밤 버전".

---

## 4. 타이포그래피

Google Fonts 무료 글꼴만 사용 (`02_PRD.md` 3.5, 유료 글꼴 배제).

### 4.1 글꼴 정의

| 역할 | 글꼴 | 느낌 | 적용 위치 |
|---|---|---|---|
| 제목 · 칭호 · 로딩 멘트 | **Nanum Brush Script** | 붓글씨 | 서비스명/현판, 결과 `nickname`, S2 로딩 멘트 |
| 한줄평 · 부위별 관상평 | **Gowun Batang** | 고문헌 바탕체 | 결과 `summary`, `features` 항목 |
| 안내 · 고지 · 버튼 | **Noto Sans KR** | 가독성 우선 | 버튼 라벨, 하단 고지, 에러 문구, 토스트 |

### 4.2 타입 스케일

| 용도 | 글꼴 | 크기 | 행간 | 굵기 |
|---|---|---|---|---|
| 서비스명 (현판 제목) | Nanum Brush Script | `2.25rem` (36px) | `1.2` | 400 |
| 결과 별명 `nickname` | Nanum Brush Script | `1.75rem` (28px) | `1.3` | 400 |
| 로딩 멘트 | Nanum Brush Script | `1.25rem` (20px) | `1.4` | 400 |
| 한줄평 `summary` | Gowun Batang | `1rem` (16px) | `1.75` | 400 |
| 부위별 평 `features` | Gowun Batang | `0.9375rem` (15px) | `1.6` | 400 |
| 버튼 라벨 | Noto Sans KR | `1rem` (16px) | `1` | 500 |
| 안내 · 고지 | Noto Sans KR | `0.8125rem` (13px) | `1.6` | 400 |
| 면책 문구 | Noto Sans KR | `0.75rem` (12px) | `1.5` | 400 |

### 4.3 주의사항

- 붓글씨/바탕체는 긴 안내문이나 법적 고지에 쓰지 않는다 — 가독성 저하.
- 결과 PNG 저장 전 `document.fonts.ready` 대기로 글꼴 깨짐 방지.

---

## 5. 버튼 시스템

모든 버튼 `min-height: 48px` (터치 영역 확보). 모서리는 `border-radius: 4px` — 알약(full-round) 모양 금지.

### 5.1 주 버튼 `{주}`

적용: 🔮 관상 보기 · 💬 결과 공유하기 · (에러창) 다시 시도

```css
.btn-primary {
  background: var(--vermilion);        /* #B5302A */
  color: var(--bg-hanji);              /* #F3E9D7 */
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 4px;
  padding: 0 24px;
  min-height: 48px;

  /* 금테 이중 테두리 (현판·부적 느낌) */
  outline: 2px solid var(--gold-trim); /* #C9972E */
  outline-offset: 2px;
  border: 1px solid rgba(201, 151, 46, 0.5);

  transition: transform 80ms, box-shadow 80ms, outline-color 150ms;
}
.btn-primary:hover {
  outline-color: #E2B24A;              /* 금테 발광 */
  box-shadow: 0 0 10px 2px rgba(201, 151, 46, 0.4);
}
.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
```

### 5.2 보조 버튼 `{보}`

적용: 📷 카메라 · 🖼 앨범/파일 · 💾 이미지 저장 · 다른 사진 고르기

```css
.btn-secondary {
  background: var(--bg-hanji);         /* #F3E9D7 */
  color: var(--ink-muk);               /* #1E1A16 */
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  border-radius: 4px;
  padding: 0 20px;
  min-height: 48px;
  border: 2px solid var(--ink-muk);

  transition: background 100ms;
}
.btn-secondary:active,
.btn-secondary:focus-visible {
  background: var(--talisman-yellow);  /* 누르면 부적 황 */
}
```

### 5.3 텍스트 버튼 `{텍}`

적용: 🔄 다시 검사하기

```css
.btn-text {
  background: transparent;
  color: var(--ink-muk);
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9375rem;
  text-decoration: underline;
  text-underline-offset: 3px;
  min-height: 48px;
  padding: 0 8px;
  border: none;
}
```

### 5.4 버튼 접근성

- 모든 버튼에 `aria-label` 명시 (이모지 포함 버튼은 aria-label로 대체 텍스트 제공).
- `:focus-visible` 스타일을 별도로 정의해 키보드 포커스 표시.

---

## 6. 장식 요소

### 6.1 도장 (낙관)

CSS로만 그리는 사각/원형 도장. 이미지 파일 없음.

| 위치 | 모양 | 글자 | CSS 비고 |
|---|---|---|---|
| 메인 제목 옆 | 정사각형 | 세로 "관상" `[가안]` | `border: 2px solid var(--vermilion)`, `transform: rotate(-6deg)` |
| 결과 칭호 옆 | 원형 | "킹받" `[가안]` | `border-radius: 50%`, `opacity: 0.85`, `transform: rotate(10deg)` |
| 에러 안내창 | 원형 | "흉(凶)" `[가안]` | 느낌표 아이콘 대신 사용, `transform: rotate(-8deg)` |

```css
/* 도장 공통 */
.stamp {
  font-family: 'Gowun Batang', serif;
  color: var(--vermilion);
  border-color: var(--vermilion);
  padding: 4px 6px;
  font-size: 0.75rem;
  line-height: 1;
  writing-mode: vertical-rl;         /* 세로쓰기 (사각 도장) */
  user-select: none;
  pointer-events: none;
}
```

### 6.2 부적 카드 (S3 결과 영역)

```
┌══════════════════════════════┐  ← 금색 위 가는 선 (1px, --gold-trim)
║  주홍 이중 테두리              ║  ← border: 2px solid --vermilion
║  부적 황 배경                  ║     + inner shadow로 이중 느낌
║                               ║
║  [썸네일]  「nickname」(킹받)  ║
║  summary 텍스트               ║
║  ◆ 이마: ...                  ║  ← --vermilion 마름모 ◆
║  ◆ 눈 : ...                   ║
║  - - - - - - - - - - - - -   ║  ← 1px dashed --gold-trim
║  ✦ 행운의 아이템: ...          ║  ← --star-silver ✦
║  면책 문구 (opacity 0.5)       ║
└══════════════════════════════┘  ← 금색 아래 가는 선
```

```css
.talisman-card {
  background: var(--talisman-yellow);
  border: 2px solid var(--vermilion);
  box-shadow:
    inset 0 0 0 4px var(--talisman-yellow),
    inset 0 0 0 6px var(--vermilion);     /* 이중 테두리 효과 */
  border-radius: 2px;
  padding: 20px 16px;
}
/* 위아래 금선 */
.talisman-card::before,
.talisman-card::after {
  content: '';
  display: block;
  height: 1px;
  background: var(--gold-trim);
  margin: 0 -16px;
}
```

### 6.3 드롭 영역 (S1)

별자리 꺾쇠 장식으로 "우주의 접수대" 느낌을 연출합니다.

```css
.drop-zone {
  border: 2px dashed var(--vermilion);
  border-radius: 4px;
  position: relative;
  transition: background 150ms;
}
/* 네 모서리 금색 L자 꺾쇠 (별자리 연결선 느낌) */
.drop-zone::before {
  content: '✦';
  position: absolute;
  top: -10px; left: -10px;
  color: var(--gold-trim);
  font-size: 1.25rem;
}
/* 드래그 중 */
.drop-zone.drag-over {
  background: rgba(242, 204, 91, 0.3);   /* talisman-yellow 30% */
  animation: shake 0.3s ease;
}
```

### 6.4 별자리 구분선

부적 카드 내부 행운의 아이템 위 구분선 — 별 기호로 별자리 느낌.

```css
.star-divider {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--gold-trim);
  font-size: 0.6rem;
  letter-spacing: 4px;
}
/* 렌더링: ✦ · · · ✦ · · · ✦ */
```

### 6.5 토스트 (복사 완료 알림)

```css
.toast {
  background: var(--talisman-yellow);
  border: 1px solid var(--vermilion);
  border-radius: 4px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.875rem;
  padding: 10px 16px;
  animation: fadeInUp 200ms, fadeOut 200ms 2.5s forwards;
}
```

---

## 7. 모션 & 인터랙션

`prefers-reduced-motion: reduce` 환경에서는 모든 애니메이션을 비활성화합니다.

### 7.1 키프레임 목록

```css
/* S1 드롭 흔들림 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* S2 오방색 링 회전 */
@keyframes spin-ring {
  to { transform: rotate(360deg); }
}
/* 적용: animation: spin-ring 2s linear infinite */

/* S2 방울 흔들림 */
@keyframes bell-shake {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-12deg); }
  60% { transform: rotate(8deg); }
  80% { transform: rotate(-5deg); }
}
/* 적용: animation: bell-shake 0.8s ease infinite */

/* S2 멘트 먹 번짐 전환 */
@keyframes ink-appear {
  from { opacity: 0; filter: blur(4px); }
  to   { opacity: 1; filter: blur(0px); }
}
/* 적용: animation: ink-appear 0.5s ease */

/* S2 가장자리 촛불빛 */
@keyframes candle-flicker {
  0%, 100% { opacity: 0.3; }
  50%       { opacity: 0.5; }
}
/* box-shadow: inset 0 0 60px 20px rgba(181,48,42,0.2) */
/* animation: candle-flicker 1.8s ease-in-out infinite */

/* S3 부적 카드 펼쳐짐 */
@keyframes unfold-card {
  from {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
  }
  to {
    clip-path: inset(0 0 0% 0);
    opacity: 1;
  }
}
/* 적용: animation: unfold-card 0.6s cubic-bezier(0.4, 0, 0.2, 1) */

/* 별 반짝임 (별자리 패턴 선택 적용) */
@keyframes star-twinkle {
  0%, 100% { opacity: 0.06; }
  50%       { opacity: 0.14; }
}
```

### 7.2 위치별 요약

| 위치 | 연출 | 지속 |
|---|---|---|
| S1 드롭 영역 | 드래그 중 배경 부적 황 전환 + 흔들림 | 즉시 반응 |
| S2 오방색 링 | `conic-gradient` 5색 링 회전 | 계속 반복 |
| S2 방울 🔔 | 좌우 딸랑딸랑 흔들림 | 계속 반복 |
| S2 로딩 멘트 | 먹 번지듯 blur→선명, 1.5초 간격 | 반복 전환 |
| S2 촛불빛 | 가장자리 `radial-gradient` 붉은 빛 깜빡임 | 계속 반복 |
| S2 별자리 패턴 | 배경 별 미세 반짝임 | 계속 반복 |
| S3 카드 | 위→아래로 펼쳐짐 (0.6s) | 1회 |
| PNG 저장 | 애니메이션 완료 후 정지 상태 캡처 | — |
| 버튼 공통 | 누름 눌림 + 주 버튼 금테 발광 | 즉시 반응 |

---

## 8. 오방색 링 (S2 로딩)

```css
.ring-five-elements {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #2C4A7A   0%  20%,   /* 청 */
    #B5302A  20%  40%,   /* 적 */
    #F2CC5B  40%  60%,   /* 황 */
    #F3E9D7  60%  80%,   /* 백 */
    #1E1A16  80% 100%    /* 흑 */
  );
  animation: spin-ring 2s linear infinite;
  /* 가운데 사진 썸네일 원형 클리핑과 함께 사용 */
  mask: radial-gradient(farthest-side, transparent 70%, black 72%);
  -webkit-mask: radial-gradient(farthest-side, transparent 70%, black 72%);
}
```

---

## 9. 다크모드 — "한밤의 굿판"

다크모드는 별도 컨셉이 아니라 **같은 점집을 밤에 보는 느낌**입니다.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-hanji:        #15110E;
    --ink-muk:         #F1E6D2;
    --vermilion:       #D9483E;
    --talisman-yellow: #3A2F12;
    --gold-trim:       #E2B24A;
    --blue-accent:     #6F93CF;
    --green-accent:    #6DB38C;
    --star-silver:     #C8B89A;
    --surface-card:    #1E180F;
    --muted-text:      #9B8C74;
  }
}
```

- 촛불빛 연출(S2)은 다크에서 대비를 약간 더 강하게 — `opacity: 0.4~0.6` (라이트보다 +0.1).
- 별자리 패턴 불투명도 `0.12` (라이트 `0.06`의 2배).
- 글자·배경 대비 WCAG AA 이상 유지.

---

## 10. 레이아웃 & 간격

### 10.1 컨테이너

- 모바일 우선, 세로 화면 기준.
- PC: `max-width: 420px`, `margin: 0 auto`.
- 좌우 여백: `padding: 0 16px`.

### 10.2 간격 토큰

| 토큰 | 값 | 사용처 |
|---|---|---|
| `--space-xs` | `4px` | 아이콘 ↔ 텍스트 |
| `--space-sm` | `8px` | 인라인 요소 간격 |
| `--space-md` | `16px` | 섹션 내 여백 |
| `--space-lg` | `24px` | 주요 섹션 간격 |
| `--space-xl` | `40px` | 화면 최상단/하단 |

### 10.3 Z-index 레이어

| 레이어 | z-index | 내용 |
|---|---|---|
| 배경 별자리 패턴 | 0 | CSS 패턴 |
| 콘텐츠 | 1 | 모든 화면 콘텐츠 |
| 토스트 | 100 | 복사 완료 알림 |
| 에러 안내창 | 200 | S1-c 모달 |

---

## 11. 접근성 체크리스트

- [ ] 모든 버튼·입력에 `aria-label` 명시
- [ ] 모든 버튼 `min-height: 48px` (터치 영역)
- [ ] `prefers-reduced-motion: reduce` 시 애니메이션 전부 비활성화
- [ ] 명암 대비 WCAG AA 이상 (라이트 · 다크 각각 검증)
- [ ] 장식(도장·테두리·꺾쇠·별)이 본문 가독성을 방해하지 않는 수준 유지
- [ ] 결과 PNG 저장 전 `document.fonts.ready` 대기

---

## 12. 미확정 사항 (03_UI_FLOW.md 5장과 연동)

이 문서가 새 결정을 내리는 곳이 아닙니다. 아래 항목은 `03_UI_FLOW.md` 5장에서 확정되면 이 문서도 함께 갱신합니다.

| 항목 | 가안 값 | UI_FLOW 질문 번호 |
|---|---|---|
| 도장 글자 ("관상" / "킹받" / "흉") | 가안대로 | Q13 |
| 버튼 이름 무속 톤 전환 여부 | 현재 이름 유지 | Q12 |
| 서비스명 확정 | "킹받는 AI 관상소" | Q1 |

---

## 13. 참고 문서

| 문서 | 담당 내용 |
|---|---|
| `01_IDEA.md` | 핵심 가치, 금지 사항 원칙 |
| `02_PRD.md` 3.4 | 톤 기준, 현학적 B급, 외모 비하 금지 |
| `02_PRD.md` 3.5 | 0원 원칙 (유료 리소스 배제) |
| `03_UI_FLOW.md` 1~3장 | 화면 구조 · 와이어프레임 · 사용자 흐름 |
| `03_UI_FLOW.md` 4장 | 디자인 톤앤매너 원본 — 이 문서의 1차 출처 |
