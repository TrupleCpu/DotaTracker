import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { join } from 'path'
import { app } from 'electron'
import fs from 'fs'
import { state } from '../state'

let draftEngineProcess: ChildProcessWithoutNullStreams | null = null

export function getDraftEnginePath(): string {
  const binDir = app.isPackaged
    ? join(process.resourcesPath, 'bin')
    : join(app.getAppPath(), 'src/main/bin')
  return join(binDir, 'main.exe')
}

export function startDraftEngine(): void {
  if (draftEngineProcess) return

  const exePath = getDraftEnginePath()

  if (!fs.existsSync(exePath)) {
    console.error('main.exe not found at', exePath)
    return
  }

  draftEngineProcess = spawn(exePath, ['--json'], {
    cwd: join(exePath, '..')
  })

  let stdoutBuffer = ''

  draftEngineProcess.stdout.on('data', (chunk: Buffer) => {
    stdoutBuffer += chunk.toString()
    const lines = stdoutBuffer.split('\n')
    stdoutBuffer = lines.pop() || '' // keep incomplete trailing line in buffer

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      try {
        const draftState = JSON.parse(line)
        state.mainWindow?.webContents.send('draft-update', draftState)
        state.controlWindow?.webContents.send('draft-update', draftState)
      } catch {
        console.log('[main.exe stdout log]', line)
      }
    }
  })

  draftEngineProcess.stderr.on('data', (chunk: Buffer) => {
    console.error('[main.exe stderr]', chunk.toString().trim())
  })

  draftEngineProcess.on('exit', (code) => {
    console.log('[main.exe] exited with code', code)
    draftEngineProcess = null
  })
}

export function stopDraftEngine(): void {
  draftEngineProcess?.kill()
  draftEngineProcess = null
}
