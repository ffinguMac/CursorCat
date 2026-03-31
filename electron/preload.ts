import { contextBridge, ipcRenderer } from 'electron'

export type CursorPositionPayload = {
  x: number
  y: number
  windowX: number
  windowY: number
  timestamp: number
}

type UnsubscribeFn = () => void

contextBridge.exposeInMainWorld('cursorCatAPI', {
  /**
   * 커서 위치 업데이트 구독. cleanup용 unsubscribe 함수를 반환한다.
   */
  onCursorPosition: (
    callback: (payload: CursorPositionPayload) => void
  ): UnsubscribeFn => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: CursorPositionPayload
    ) => callback(payload)

    ipcRenderer.on('cursor-position', handler)

    return () => ipcRenderer.removeListener('cursor-position', handler)
  },

  /**
   * 고양이 창 크기(px) 조회
   */
  getCatWindowSize: (): Promise<number> =>
    ipcRenderer.invoke('get-cat-window-size'),
})
