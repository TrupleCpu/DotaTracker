let toastTimer: ReturnType<typeof setTimeout>

class UiStore {
  currentView = $state('dashboard')
  prevView = $state('dashboard')
  sidebarCollapsed = $state(false)
  selectedMatch = $state<any>(null)
  compactMode = $state(false)
  animatedCharts = $state(true)

  toast = $state({ show: false, msg: '', type: '' })

  showToast(msg: string, type = 'ok') {
    this.toast = { show: true, msg, type }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      this.toast.show = false
    }, 2600)
  }

  gotoView(view: string) {
    this.prevView = this.currentView
    this.currentView = view
    this.selectedMatch = null
  }

  openMatchDetail(match: any) {
    this.prevView = this.currentView
    this.selectedMatch = match
    this.currentView = 'match-detail'
  }
}

export const uiStore = new UiStore()

export const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  matches: 'Matches',

  heroes: 'Heroes',
  analysis: 'Analysis',
  draft: 'Draft Analyzer',
  roles: 'Role Performance',
  settings: 'Settings',
  teammates: 'Teammates'
}
