import { registerOverlayHandlers } from './overlay'
import { registerMatchHandlers } from './matches'
import { registerConfigHandlers } from './config'
import { registerWindowControlHandlers } from './windowControls'
import { registerSteamHandlers } from './steam'
import { registerVersionHandlers } from './version'
import { registerCoachingHandlers } from './coaching'
import { registerPlayGuideHandlers } from './playGuide'
import { registerGuideNotificationHandlers } from './guideNotification'
import { registerBenchmarkHandlers } from './benchmarks'

export function registerIpcHandlers(): void {
  registerOverlayHandlers()
  registerMatchHandlers()
  registerConfigHandlers()
  registerWindowControlHandlers()
  registerSteamHandlers()
  registerVersionHandlers()
  registerCoachingHandlers()
  registerPlayGuideHandlers()
  registerGuideNotificationHandlers()
  registerBenchmarkHandlers()
}