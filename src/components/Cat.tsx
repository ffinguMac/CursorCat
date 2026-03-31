import { useRef, useEffect } from 'react'
import { SpriteAnimator } from '../animation/spriteAnimator'
import { useCursorPosition } from '../hooks/useCursorPosition'
import type { CatState } from '../animation/stateMachine'
import styles from './Cat.module.css'

// ── Cat 루트 컴포넌트 ────────────────────────────────────────────────────────
export function Cat() {
  const { catState, facingLeft } = useCursorPosition()
  const animatorRef = useRef<SpriteAnimator | null>(null)

  // 애니메이터 초기화 (마운트 시 1회)
  useEffect(() => {
    const animator = new SpriteAnimator((_frame, _state) => {
      // 현재는 CSS 애니메이션으로 처리하므로 콜백 내용 불필요.
      // 스프라이트 시트 도입 시 여기서 frameIndex로 background-position 변경.
    })
    animatorRef.current = animator
    animator.start()
    return () => animator.stop()
  }, [])

  // 상태머신 전환 → 애니메이터 동기화
  useEffect(() => {
    animatorRef.current?.setState(catState)
  }, [catState])

  const stateClass  = styles[`cat--${catState}` as keyof typeof styles] ?? ''
  const flipClass   = facingLeft ? styles.facingLeft : ''

  return (
    <div
      className={`${styles.cat} ${stateClass} ${flipClass}`}
      aria-hidden="true"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <CatSVG state={catState} />
      {catState === 'sleep' && <SleepIndicator />}
    </div>
  )
}

// ── SVG 고양이 (외부 이미지 없이 순수 SVG 프리미티브) ────────────────────────
function CatSVG({ state }: { state: CatState }) {
  const eyesClosed = state === 'sleep'
  const tailActive = state === 'walk' || state === 'run'

  return (
    <svg
      viewBox="0 0 64 64"
      width="96"
      height="96"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 몸통 */}
      <ellipse cx="32" cy="43" rx="20" ry="14" fill="#F4A460" />

      {/* 머리 */}
      <circle cx="32" cy="22" r="16" fill="#F4A460" />

      {/* 왼쪽 귀 */}
      <polygon points="16,12 11,1 23,8" fill="#F4A460" />
      <polygon points="17,11 13,4 22,9" fill="#FFB6C1" />

      {/* 오른쪽 귀 */}
      <polygon points="48,12 53,1 41,8" fill="#F4A460" />
      <polygon points="47,11 51,4 42,9" fill="#FFB6C1" />

      {/* 눈 */}
      {eyesClosed ? (
        <>
          <line x1="24" y1="22" x2="30" y2="22" stroke="#5C3317" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="22" x2="40" y2="22" stroke="#5C3317" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="27" cy="22" r="3" fill="#3D2B1F" />
          <circle cx="37" cy="22" r="3" fill="#3D2B1F" />
          {/* 눈 하이라이트 */}
          <circle cx="28" cy="21" r="1" fill="white" />
          <circle cx="38" cy="21" r="1" fill="white" />
        </>
      )}

      {/* 코 */}
      <polygon points="32,27 30,29 34,29" fill="#FF9999" />

      {/* 입 */}
      <path d="M 30 29 Q 32 32 34 29" fill="none" stroke="#5C3317" strokeWidth="1" strokeLinecap="round" />

      {/* 왼쪽 수염 */}
      <line x1="14" y1="27" x2="28" y2="28" stroke="#999" strokeWidth="1" />
      <line x1="13" y1="30" x2="28" y2="30" stroke="#999" strokeWidth="1" />

      {/* 오른쪽 수염 */}
      <line x1="36" y1="28" x2="50" y2="27" stroke="#999" strokeWidth="1" />
      <line x1="36" y1="30" x2="51" y2="30" stroke="#999" strokeWidth="1" />

      {/* 꼬리 */}
      <path
        d="M 50 50 Q 63 40 58 27"
        fill="none"
        stroke="#F4A460"
        strokeWidth="5"
        strokeLinecap="round"
        className={tailActive ? styles['tail--active'] : styles['tail--idle']}
      />

      {/* 다리 */}
      <rect x="17" y="53" width="8" height="9" rx="3" fill="#E8956D"
        className={styles['leg--left']} />
      <rect x="27" y="53" width="8" height="9" rx="3" fill="#E8956D" />
      <rect x="37" y="53" width="8" height="9" rx="3" fill="#E8956D"
        className={styles['leg--right']} />
    </svg>
  )
}

// ── ZZZ 수면 표시 ─────────────────────────────────────────────────────────────
function SleepIndicator() {
  return (
    <div className={styles['sleep-zzz']} aria-hidden="true">
      <span>z</span>
      <span>z</span>
      <span>Z</span>
    </div>
  )
}
