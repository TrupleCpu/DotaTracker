import { BrowserWindow } from 'electron'
import { loadConfig } from './config'

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export const state = {
  mainWindow: null as BrowserWindow | null,
  controlWindow: null as BrowserWindow | null,
  config: loadConfig(),
  isQuitting: false,
  overlayBounds: null as Bounds | null
}
