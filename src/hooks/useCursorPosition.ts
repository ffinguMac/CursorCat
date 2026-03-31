import { useState, useEffect, useRef, useCallback } from 'react'
import type { CursorPositionPayload } from '../../electron/preload'
import { calculateSpeed, transition, type CatState, type Point } from '../animation/stateMachine'

export type CursorState = {
  x:               number
  y:               number
  speed:           number
  catState:        CatState
  msSinceMovement: number
  facingLeft:      boolean  // 이동 방향 (수평 flip용)
}

export function useCursorPosition(): CursorState {
  const [cursorState, setCursorState] = useState<CursorState>({
    x:               0,
    y:               0,
    speed:           0,
    catState:        'idle',
    msSinceMovement: 0,
    facingLeft:      false,
  })

  // 콜백 내에서 사용하지만 re-render를 트리거하지 않아야 하는 값들
  const prevPointRef       = useRef<Point | null>(null)
  const lastMovedAtRef     = useRef<number>(Date.now())
  const currentCatStateRef = useRef<CatState>('idle')
  const lastXRef           = useRef<number>(0)

  const handleCursorPosition = useCallback((payload: CursorPositionPayload) => {
    const curr: Point = { x: payload.x, y: payload.y, timestamp: payload.timestamp }

    const speed = prevPointRef.current
      ? calculateSpeed(prevPointRef.current, curr)
      : 0

    if (speed > 0) lastMovedAtRef.current = payload.timestamp

    const msSinceMovement = payload.timestamp - lastMovedAtRef.current

    const { nextState } = transition({
      currentState:    currentCatStateRef.current,
      speed,
      msSinceMovement,
    })

    // 이동 방향 감지 (facingLeft: 왼쪽으로 이동 중)
    const dx = payload.x - lastXRef.current
    const facingLeft = dx < 0

    currentCatStateRef.current = nextState
    prevPointRef.current       = curr
    lastXRef.current           = payload.x

    setCursorState({
      x: payload.x,
      y: payload.y,
      speed,
      catState: nextState,
      msSinceMovement,
      facingLeft: speed > 0 ? facingLeft : cursorState.facingLeft,
    })
  }, [cursorState.facingLeft])

  useEffect(() => {
    // Electron 환경이 아닐 때(브라우저 개발) 안전하게 처리
    if (!window.cursorCatAPI) return

    const unsubscribe = window.cursorCatAPI.onCursorPosition(handleCursorPosition)
    return unsubscribe
  }, [handleCursorPosition])

  return cursorState
}
