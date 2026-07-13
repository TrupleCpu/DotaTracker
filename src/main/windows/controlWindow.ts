import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { state } from '../state'

export const CONTROL_WIDTH = 1200
export const CONTROL_HEIGHT = 900

export function createControlWindow(): void {
  if (state.controlWindow && !state.controlWindow.isDestroyed()) {
    state.controlWindow.show()
    state.controlWindow.focus()
    return
  }

  const win = new BrowserWindow({
    width: CONTROL_WIDTH,
    height: CONTROL_HEIGHT,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.once('ready-to-show', () => win.show())

  win.on('close', (event) => {
    if (!state.isQuitting) {
      event.preventDefault()
      win.hide()
    }
  })

  win.on('closed', () => {
    state.controlWindow = null
  })

  const devURL = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devURL) {
    win.loadURL(`${devURL}?view=control`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { query: { view: 'control' } })
  }

  state.controlWindow = win
}
