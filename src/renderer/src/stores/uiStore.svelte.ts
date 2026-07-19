let toastTimer: ReturnType<typeof setTimeout>

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

class UiStore {
  currentView = $state<ViewId>('dashboard')
  prevView = $state<ViewId>('dashboard')
  sidebarCollapsed = $state(false)
  selectedMatch = $state<any>(null)
  selectedHeroId = $state<number | null>(null)
  compactMode = $state(false)
  animatedCharts = $state(true)
  settingsTab = $state<string>('sg')

  toast = $state({ show: false, msg: '', type: '' })

  showToast(msg: string, type = 'ok') {
    this.toast = { show: true, msg, type }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      this.toast.show = false
    }, 2600)
  }

  gotoView(view: ViewId, settingsTab?: string) {
    this.prevView = this.currentView
    this.currentView = view
    this.selectedMatch = null
    this.selectedHeroId = null
    if (settingsTab) this.settingsTab = settingsTab
    else this.settingsTab = 'sg'
  }

  openMatchDetail(match: any) {
    this.prevView = this.currentView
    this.selectedMatch = match
    this.currentView = 'match-detail'
  }

  openHeroDetail(heroId: number) {
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
  'hero-detail': 'Hero Detail'
}
