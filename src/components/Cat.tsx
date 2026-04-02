import { useRef, useEffect } from 'react'
import { SpriteAnimator } from '../animation/spriteAnimator'
import { useCursorPosition } from '../hooks/useCursorPosition'
import type { CatState } from '../animation/stateMachine'
import styles from './Cat.module.css'
import waronPng from '../assets/waron.png'

// ── 스프라이트 시트 상수 ─────────────────────────────────────────────────────
const FRAME_W  = 176
const FRAME_H  = 256
const SCALE    = 0.5
const SHEET_W  = 1408
const SHEET_H  = 768

const STATE_ROW: Record<CatState, number> = {
  idle:  0,
  walk:  1,
  run:   2,
  sleep: 0,
}

// ── Cat 루트 컴포넌트 ────────────────────────────────────────────────────────
export function Cat() {
  const { catState, facingLeft } = useCursorPosition()
  const animatorRef = useRef<SpriteAnimator | null>(null)
  const spriteRef   = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const animator = new SpriteAnimator((frame, state) => {
      if (!spriteRef.current) return
      const row = STATE_ROW[state]
      const col = state === 'sleep' ? 0 : frame
      const x   = -(col * FRAME_W * SCALE)
      const y   = -(row * FRAME_H * SCALE)
      spriteRef.current.style.backgroundPosition = `${x}px ${y}px`
    })
    animatorRef.current = animator
    animator.start()
    return () => animator.stop()
  }, [])

  useEffect(() => {
    animatorRef.current?.setState(catState)
  }, [catState])

  const flipClass = facingLeft ? styles.facingLeft : ''

  return (
    <div className={`${styles.cat} ${flipClass}`} aria-hidden="true">
      <div
        ref={spriteRef}
        style={{
          width:              FRAME_W * SCALE,
          height:             FRAME_H * SCALE,
          backgroundImage:    `url(${waronPng})`,
          backgroundSize:     `${SHEET_W * SCALE}px ${SHEET_H * SCALE}px`,
          backgroundRepeat:   'no-repeat',
          backgroundPosition: '0px 0px',
          imageRendering:     'pixelated',
        }}
      />
    </div>
  )
}
