import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'

const DEV_URL = 'http://localhost:3000'
const POLL_INTERVAL = 500
const TIMEOUT = 30_000

let devServer: ChildProcess | null = null

const isServerRunning = async () => {
  try {
    await fetch(DEV_URL)
    return true
  } catch {
    return false
  }
}

const waitForServer = async () => {
  const start = Date.now()
  while (Date.now() - start < TIMEOUT) {
    if (await isServerRunning()) return
    await new Promise((r) => setTimeout(r, POLL_INTERVAL))
  }
  throw new Error(`Dev server did not start within ${TIMEOUT / 1000}s`)
}

export const setup = async () => {
  if (await isServerRunning()) {
    console.log('Dev server already running on port 3000')
    return
  }

  console.log('Starting dev server...')
  devServer = spawn('bun', ['run', 'dev'], {
    stdio: 'ignore',
    detached: true,
  })

  await waitForServer()
  console.log('Dev server is ready')
}

export const teardown = () => {
  if (devServer?.pid) {
    process.kill(-devServer.pid, 'SIGTERM')
    devServer = null
  }
}
