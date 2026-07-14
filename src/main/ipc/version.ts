import { app, ipcMain } from 'electron'

export function registerVersionHandlers(): void {
  ipcMain.handle('get-app-version', () => app.getVersion())
}
