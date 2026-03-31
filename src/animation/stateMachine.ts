// ── 상태 정의 ─────────────────────────────────────────────────────────────────
export type CatState = 'idle' | 'walk' | 'run' | 'sleep'

// 속도 임계값 (pixels/second)
const SPEED_WALK_THRESHOLD = 50
const SPEED_RUN_THRESHOLD  = 300
const SLEEP_TIMEOUT_MS     = 5000

// ── 전환 테이블 ──────────────────────────────────────────────────────────────
//
//  idle  ──(speed ≥ WALK)──► walk
//  idle  ──(timeout)────────► sleep
//  sleep ──(any movement)───► idle
//  walk  ──(speed ≥ RUN)────► run
//  walk  ──(speed < WALK)───► idle
//  run   ──(speed < RUN)────► walk
//  run   ──(speed < WALK)───► idle  (급정지 시 walk 스킵)

// ── 공개 타입 ─────────────────────────────────────────────────────────────────
export type StateMachineInput = {
  currentState:    CatState
  speed:           number   // pixels/second
  msSinceMovement: number   // 마지막 움직임으로부터 경과 ms
}

export type StateMachineOutput = {
  nextState:     CatState
  didTransition: boolean
}

// ── 순수 전환 함수 ────────────────────────────────────────────────────────────
export function transition(input: StateMachineInput): StateMachineOutput {
  const { currentState, speed, msSinceMovement } = input
  let nextState: CatState = currentState

  switch (currentState) {
    case 'sleep':
      if (speed > 0) nextState = 'idle'
      break

    case 'idle':
      if (msSinceMovement >= SLEEP_TIMEOUT_MS) {
        nextState = 'sleep'
      } else if (speed >= SPEED_RUN_THRESHOLD) {
        nextState = 'run'
      } else if (speed >= SPEED_WALK_THRESHOLD) {
        nextState = 'walk'
      }
      break

    case 'walk':
      if (speed >= SPEED_RUN_THRESHOLD) {
        nextState = 'run'
      } else if (speed < SPEED_WALK_THRESHOLD) {
        nextState = 'idle'
      }
      break

    case 'run':
      if (speed < SPEED_WALK_THRESHOLD) {
        nextState = 'idle'  // 급정지 — walk 중간 상태 스킵
      } else if (speed < SPEED_RUN_THRESHOLD) {
        nextState = 'walk'
      }
      break
  }

  return { nextState, didTransition: nextState !== currentState }
}

// ── 속도 계산 유틸리티 ────────────────────────────────────────────────────────
export type Point = { x: number; y: number; timestamp: number }

export function calculateSpeed(prev: Point, curr: Point): number {
  const dx = curr.x - prev.x
  const dy = curr.y - prev.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const dtSeconds = Math.max((curr.timestamp - prev.timestamp) / 1000, 0.001)
  return distance / dtSeconds
}
