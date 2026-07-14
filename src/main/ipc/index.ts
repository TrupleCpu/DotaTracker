import { registerOverlayHandlers } from './overlay'
import { registerMatchHandlers } from './matches'
import { registerConfigHandlers } from './config'
import { registerWindowControlHandlers } from './windowControls'
import { registerSteamHandlers } from './steam'
import { registerDraftHandlers } from './draft'

export function registerIpcHandlers(): void {
  registerOverlayHandlers()
  registerMatchHandlers()
  registerConfigHandlers()
  registerWindowControlHandlers()
  registerSteamHandlers()
  registerDraftHandlers()
}