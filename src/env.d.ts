/// <reference types="vite/client" />

import type { CursorPositionPayload } from '../electron/preload'

declare global {
  interface Window {
    cursorCatAPI: {
      onCursorPosition: (
        callback: (payload: CursorPositionPayload) => void
      ) => () => void
      getCatWindowSize: () => Promise<number>
    }
  }
}
