import type { CatState } from './stateMachine'

// ── 상태별 애니메이션 설정 ───────────────────────────────────────────────────
export type AnimationConfig = {
  fps:        number
  frameCount: number
  loop:       boolean
}

export const ANIMATION_CONFIGS: Record<CatState, AnimationConfig> = {
  idle:  { fps: 4,  frameCount: 2, loop: true },
  walk:  { fps: 8,  frameCount: 4, loop: true },
  run:   { fps: 16, frameCount: 4, loop: true },
  sleep: { fps: 2,  frameCount: 2, loop: true },
}

// ── SpriteAnimator ──────────────────────────────────────────────────────────
// requestAnimationFrame 기반 프레임 티커.
// React 컴포넌트는 useRef로 인스턴스를 유지하고
// onFrame 콜백에서 frameIndex와 state를 받아 렌더링에 활용한다.
export class SpriteAnimator {
  private state:         CatState       = 'idle'
  private config:        AnimationConfig
  private frameIndex:    number         = 0
  private lastFrameTime: number         = 0
  private rafHandle:     number         = 0
  private onFrame:       (frame: number, state: CatState) => void

  constructor(onFrame: (frame: number, state: CatState) => void) {
    this.onFrame = onFrame
    this.config  = ANIMATION_CONFIGS['idle']
  }

  setState(newState: CatState): void {
    if (newState === this.state) return
    this.state      = newState
    this.config     = ANIMATION_CONFIGS[newState]
    this.frameIndex = 0  // 상태 변경 시 프레임 리셋
  }

  start(): void {
    this.lastFrameTime = performance.now()
    this.rafHandle = requestAnimationFrame(this.tick)
  }

  stop(): void {
    cancelAnimationFrame(this.rafHandle)
  }

  private tick = (now: number): void => {
    const frameDuration  = 1000 / this.config.fps
    const elapsed        = now - this.lastFrameTime

    if (elapsed >= frameDuration) {
      const framesAdvanced = Math.floor(elapsed / frameDuration)
      this.lastFrameTime   = now - (elapsed % frameDuration)

      if (this.config.loop) {
        this.frameIndex = (this.frameIndex + framesAdvanced) % this.config.frameCount
      } else {
        this.frameIndex = Math.min(
          this.frameIndex + framesAdvanced,
          this.config.frameCount - 1
        )
      }

      this.onFrame(this.frameIndex, this.state)
    }

    this.rafHandle = requestAnimationFrame(this.tick)
  }
}
