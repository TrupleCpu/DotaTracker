import { app, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { createControlWindow } from '../windows/controlWindow'
import { state } from '../state'

let tray: Tray | null = null

export function createTray(): void {
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Control Panel', click: (): void => createControlWindow() },
    { type: 'separator' },
    {
      label: 'Quit',
      click: (): void => {
        state.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('AncientEye')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    createControlWindow()
  })
}

export function hasTray(): boolean {
  return tray !== null
}

app.on('will-quit', () => {
  tray?.destroy()
})
