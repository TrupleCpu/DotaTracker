let toastTimer: ReturnType<typeof setTimeout>

import type { MatchSummary } from '../types/matchDetail'

export type ViewId =
  | 'dashboard'
  | 'matches'
  | 'heroes'
  | 'analysis'
  | 'roles'
  | 'teammates'
  | 'settings'
  | 'match-detail'
  | 'hero-detail'
  | 'play-guide'

const TAB_VIEWS: ViewId[] = [
  'dashboard',
  'matches',
  'heroes',
  'analysis',
  'roles',
  'teammates',
  'settings',
  'play-guide'
]

class UiStore {
  currentView = $state<ViewId>('dashboard')
  prevView = $state<ViewId>('dashboard')
  activeTab = $state<ViewId>('dashboard')
  sidebarCollapsed = $state(false)
  selectedMatch = $state<MatchSummary | null>(null)
  selectedHeroId = $state<number | null>(null)
  compactMode = $state(false)
  animatedCharts = $state(true)
  settingsTab = $state<string>('sg')

  toast = $state({ show: false, msg: '', type: '' })

  showToast(msg: string, type = 'ok'): void {
    this.toast = { show: true, msg, type }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      this.toast.show = false
    }, 2600)
  }

  gotoView(view: ViewId, settingsTab?: string): void {
    this.prevView = this.currentView
    this.currentView = view
    if (TAB_VIEWS.includes(view)) this.activeTab = view
    if (settingsTab) this.settingsTab = settingsTab
    else this.settingsTab = 'sg'
  }

  openMatchDetail(match: MatchSummary): void {
    this.prevView = this.currentView
    this.selectedMatch = match
    this.currentView = 'match-detail'
  }

  openHeroDetail(heroId: number): void {
    this.prevView = this.currentView
    this.selectedHeroId = heroId
    this.currentView = 'hero-detail'
  }
}

export const uiStore = new UiStore()

export const VIEW_TITLES: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  matches: 'Matches',

  heroes: 'Heroes',
  analysis: 'Analysis',
  roles: 'Role Performance',
  settings: 'Settings',
  teammates: 'Teammates',
  'match-detail': 'Match Detail',
  'hero-detail': 'Hero Detail',
  'play-guide': 'Play Guide'
}
