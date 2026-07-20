import { ipcMain } from 'electron'
import { getBenchmarksData } from '../benchmarkCache'

export function registerBenchmarkHandlers(): void {
  ipcMain.handle('get-benchmarks', async () => {
    return getBenchmarksData()
  })
}
