import { ipcMain } from 'electron'
import { getHeroBenchmarks } from '../benchmarkCache'

export function registerBenchmarkHandlers(): void {
  ipcMain.handle('get-benchmarks', async (_e, heroId: number) => {
    return getHeroBenchmarks(heroId)
  })
}
