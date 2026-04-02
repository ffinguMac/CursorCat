// Clears ELECTRON_RUN_AS_NODE so Electron runs as a proper app (not Node.js mode).
// This env var is set by VS Code / Claude Code and breaks the Electron main process.
delete process.env.ELECTRON_RUN_AS_NODE

const { spawn } = require('child_process')
const path = require('path')

const evBin = path.resolve(__dirname, '../node_modules/electron-vite/bin/electron-vite.js')
const child = spawn('node', [evBin, 'dev'], {
  stdio: 'inherit',
  env: process.env,
  shell: false,
})
child.on('close', code => process.exit(code ?? 0))
