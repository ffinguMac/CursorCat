import { app, BrowserWindow, screen, Tray, Menu, nativeImage, ipcMain } from 'electron'
import path from 'path'

// ── 상수 ─────────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 16        // ~60fps 폴링
const CAT_WINDOW_SIZE  = 176       // 고양이 스프라이트 바운딩 박스 (px)

// ── 상태 ─────────────────────────────────────────────────────────────────────
let overlayWindow: BrowserWindow | null = null
let tray:          Tray          | null = null
let trackingTimer: ReturnType<typeof setInterval> | null = null

// ── 오버레이 창 생성 ─────────────────────────────────────────────────────────
function createOverlayWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width:  CAT_WINDOW_SIZE,
    height: CAT_WINDOW_SIZE * 2,
    x: 0,
    y: 0,

    // 투명 오버레이 설정
    transparent:   true,
    frame:         false,
    hasShadow:     false,
    alwaysOnTop:   true,
    skipTaskbar:   true,
    focusable:     false,
    resizable:     false,
    show:          false,   // 로드 완료 후 표시해서 flash 방지

    webPreferences: {
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  })

  // 완전히 클릭 통과 — forward: true 로 하위 창에도 이벤트 전달 (Windows)
  win.setIgnoreMouseEvents(true, { forward: true })

  // 로드 완료 후 창 표시 (flash 방지)
  win.webContents.on('did-finish-load', () => {
    win.show()
    win.webContents.openDevTools({ mode: 'detach' })
  })

  // 렌더러 로드
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return win
}

// ── 커서 추적 루프 ───────────────────────────────────────────────────────────
function startTracking(win: BrowserWindow): void {
  if (trackingTimer) clearInterval(trackingTimer)

  trackingTimer = setInterval(() => {
    if (win.isDestroyed()) return

    const { x, y } = screen.getCursorScreenPoint()

    // 창 자체를 커서 중심으로 이동 (CSS 이중 오프셋 방지)
    const winX = x - CAT_WINDOW_SIZE / 2
    const winY = y - CAT_WINDOW_SIZE / 2
    win.setPosition(winX, winY, false)

    // 렌더러에 커서 좌표 전달 (상태머신용)
    win.webContents.send('cursor-position', {
      x,
      y,
      windowX:   winX,
      windowY:   winY,
      timestamp: Date.now(),
    })
  }, POLL_INTERVAL_MS)
}

function stopTracking(): void {
  if (trackingTimer) {
    clearInterval(trackingTimer)
    trackingTimer = null
  }
}

// ── 시스템 트레이 ────────────────────────────────────────────────────────────
function createTray(win: BrowserWindow): Tray {
  const icon = nativeImage.createEmpty()
  const t = new Tray(icon)

  t.setToolTip('CursorCat')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show Cat',
      click: () => { win.show(); startTracking(win) },
    },
    {
      label: 'Hide Cat',
      click: () => { win.hide(); stopTracking() },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => { app.quit() },
    },
  ])

  t.setContextMenu(menu)
  return t
}

// ── 앱 라이프사이클 ──────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // ── IPC 핸들러 ─────────────────────────────────────────────────────────────
  ipcMain.handle('get-cat-window-size', () => CAT_WINDOW_SIZE)
  // Linux Wayland 경고
  if (process.platform === 'linux' && process.env['WAYLAND_DISPLAY']) {
    console.warn('CursorCat: Wayland 환경에서는 커서 추적이 제한될 수 있습니다.')
  }

  overlayWindow = createOverlayWindow()
  tray          = createTray(overlayWindow)
  startTracking(overlayWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      overlayWindow = createOverlayWindow()
      startTracking(overlayWindow)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  stopTracking()
})
