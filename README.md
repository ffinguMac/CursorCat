# CursorCat

마우스 커서를 따라다니는 데스크탑 고양이 앱입니다.

## 기능

- 마우스 커서를 실시간으로 추적하는 고양이 캐릭터
- 커서 속도에 따라 자동으로 바뀌는 행동 상태
  - **idle** — 가만히 숨쉬기
  - **walk** — 느리게 이동 시 걷기
  - **run** — 빠르게 이동 시 달리기
  - **sleep** — 5초 이상 정지 시 잠들기
- 투명 오버레이 창 (항상 최상위, 클릭 통과)
- 시스템 트레이에서 표시/숨기기/종료

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 데스크탑 런타임 | Electron |
| UI | React + TypeScript |
| 번들러 | electron-vite |
| 애니메이션 | CSS keyframe + requestAnimationFrame |

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 프로젝트 구조

```
electron/
├── main.ts        # 투명 오버레이 창, 커서 추적, 시스템 트레이
└── preload.ts     # IPC 브릿지 (contextBridge)

src/
├── animation/
│   ├── stateMachine.ts    # idle/walk/run/sleep 상태 전환 로직
│   └── spriteAnimator.ts  # requestAnimationFrame 기반 프레임 관리
├── hooks/
│   └── useCursorPosition.ts  # 커서 위치 구독 및 상태머신 연동
└── components/
    └── Cat.tsx            # SVG 고양이 컴포넌트 + CSS 애니메이션
```
