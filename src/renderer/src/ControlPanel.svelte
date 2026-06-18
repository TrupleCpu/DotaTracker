<script lang="ts">
  import { HEROES, MATCHES, type MockMatch } from './utils/mockData'
  import LoginScreen from './components/LoginScreen.svelte'

  // Views
  import DashboardView from './components/DashboardView.svelte'
  import MatchesView from './components/MatchesView.svelte'
  import CoachView from './components/CoachView.svelte'
  import HeroesView from './components/HeroesView.svelte'
  import TrendsView from './components/TrendsView.svelte'
  import DraftView from './components/DraftView.svelte'
  import CompareView from './components/CompareView.svelte'
  import SettingsView from './components/SettingsView.svelte'
  import RedesignMatchDetailView from './components/RedesignMatchDetailView.svelte'

  type WindowApi = {
    fetchMatchHistory: (steamId: string) => Promise<any>
    getLocalSteamId: () => Promise<{ steamId: string | null; error?: string }>
  }
  const api = window.api as unknown as WindowApi

  // State
  let steamId = $state<string | null>(null)
  let isLoading = $state(false)
  let errorMessage = $state('')
  let currentView = $state('dashboard')
  let prevView = $state('dashboard')
  let selectedMatch = $state<MockMatch | null>(null)

  // Toast
  let toast = $state({ show: false, msg: '', type: '' })
  let toastTimer: any

  function showToast(msg: string, type = 'ok') {
    toast = { show: true, msg, type }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.show = false
    }, 2600)
  }

  const VIEW_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    matches: 'Matches',
    coach: 'AI Coach',
    heroes: 'Heroes',
    trends: 'Trends',
    draft: 'Draft Analyzer',
    compare: 'Compare',
    settings: 'Settings'
  }

  async function handleSteamLogin(): Promise<void> {
    try {
      isLoading = true
      errorMessage = ''
      const response = await api.getLocalSteamId()
      if (response.steamId) {
        steamId = response.steamId
      } else {
        errorMessage = response.error || 'Active Steam profile not found.'
      }
    } catch {
      errorMessage = 'An unexpected error occurred during profile sync.'
    } finally {
      isLoading = false
    }
  }

  function gotoView(view: string) {
    prevView = currentView
    currentView = view
    selectedMatch = null
  }

  function openMatchDetail(match: MockMatch) {
    prevView = currentView
    selectedMatch = match
    currentView = 'match-detail'
  }

  function disconnect(): void {
    steamId = null
    currentView = 'dashboard'
    errorMessage = ''
  }

  function doRefresh(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement
    const orig = btn.textContent
    btn.textContent = '⏳ Syncing…'
    btn.disabled = true
    showToast('Fetching latest matches…', 'ok')
    setTimeout(() => {
      btn.textContent = orig
      btn.disabled = false
      showToast('All data up to date ✓', 'ok')
    }, 1800)
  }
</script>

{#if !steamId}
  <LoginScreen {handleSteamLogin} {isLoading} {errorMessage} />
{:else}
  <div class="flex flex-col h-screen overflow-hidden bg-bg text-tx font-inter">
    <!-- TITLEBAR -->
    <div class="titlebar">
      <div class="titlebar-dots">
        <div
          class="tdot red"
          onclick={() => showToast('Close window', 'ok')}
          role="button"
          tabindex="0"
        ></div>
        <div
          class="tdot yellow"
          onclick={() => showToast('Minimize window', 'ok')}
          role="button"
          tabindex="0"
        ></div>
        <div
          class="tdot green"
          onclick={() => showToast('Maximize window', 'ok')}
          role="button"
          tabindex="0"
        ></div>
      </div>
      <div class="titlebar-title">Dota Coach</div>
      <div class="titlebar-right">
        <span class="text-[10px] text-tx3">v2.4.1</span>
      </div>
    </div>

    <!-- APP SHELL -->
    <div class="flex flex-1 overflow-hidden">
      <!-- SIDEBAR -->
      <aside class="w-[200px] shrink-0 bg-sb border-r border-bd flex flex-col">
        <div class="flex items-center gap-[10px] p-[14px_14px_12px] border-b border-bd">
          <div
            class="w-8 h-8 bg-pu rounded-lg flex items-center justify-center text-base shrink-0 shadow-[0_0_0_3px_rgba(123,92,240,0.22)]"
          >
            ⚔️
          </div>
          <div>
            <div class="text-[12.5px] font-extrabold tracking-[0.2px] leading-[1.15]">
              DOTA COACH
            </div>
            <div class="text-[9px] text-tx3 tracking-[0.9px] uppercase mt-0.5">
              Analyze · Improve · Win
            </div>
          </div>
        </div>

        <nav class="flex-1 py-2 overflow-y-auto">
          <div class="text-[9px] font-bold text-tx3 uppercase tracking-[1.1px] p-[10px_14px_4px]">
            Main
          </div>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'dashboard'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('dashboard')}
          >
            {#if currentView === 'dashboard'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">▦</span> Dashboard
          </button>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'matches'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('matches')}
          >
            {#if currentView === 'matches'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">🎮</span> Matches
            <span
              class="ml-auto bg-pu text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg min-w-[16px] text-center"
              >30</span
            >
          </button>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'coach'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('coach')}
          >
            {#if currentView === 'coach'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">🤖</span> AI Coach
          </button>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'heroes'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('heroes')}
          >
            {#if currentView === 'heroes'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">🛡</span> Heroes
          </button>

          <div class="text-[9px] font-bold text-tx3 uppercase tracking-[1.1px] p-[10px_14px_4px]">
            Analysis
          </div>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'trends'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('trends')}
          >
            {#if currentView === 'trends'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">📈</span> Trends
          </button>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'draft'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('draft')}
          >
            {#if currentView === 'draft'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">⚡</span> Draft Analyzer
          </button>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'compare'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('compare')}
          >
            {#if currentView === 'compare'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">⚖</span> Compare
          </button>

          <div class="text-[9px] font-bold text-tx3 uppercase tracking-[1.1px] p-[10px_14px_4px]">
            Account
          </div>
          <button
            class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative {currentView ===
            'settings'
              ? 'text-tx bg-pub'
              : 'text-tx2 hover:text-tx hover:bg-white/5'}"
            onclick={() => gotoView('settings')}
          >
            {#if currentView === 'settings'}<div
                class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"
              ></div>{/if}
            <span class="w-4 text-center text-[13px] opacity-80">⚙</span> Settings
          </button>
        </nav>

        <div class="border-t border-bd p-[10px]">
          <div
            class="flex items-center gap-[7px] bg-grb border border-gr/20 rounded-lg px-2.5 py-1.5 mb-2"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-gr animate-pulse"></div>
            <span class="text-[10.5px] text-gr font-bold">Live</span>
            <span class="text-[10px] text-tx2 ml-auto">Synced 2m ago</span>
          </div>
          <div
            class="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-s2 transition-colors"
            onclick={() => showToast('Profile settings')}
          >
            <div
              class="w-[30px] h-[30px] rounded-full bg-linear-to-br from-pu to-[#4f46e5] flex items-center justify-center text-[13px] font-extrabold shrink-0"
            >
              A
            </div>
            <div>
              <div class="text-[12px] font-bold leading-tight">Anthron Player</div>
              <div class="text-[10px] text-tx2">2,450 MMR · Archon III</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <!-- TOPBAR -->
        <div class="flex items-center px-[18px] h-[46px] border-b border-bd gap-2.5 shrink-0 bg-sb">
          <div class="flex items-center gap-1.5 text-[13px] font-semibold text-tx2">
            {#if currentView === 'match-detail'}
              <button
                class="cursor-pointer hover:text-tx transition-colors bg-transparent border-none p-0 text-inherit"
                onclick={() => gotoView(prevView)}>{VIEW_TITLES[prevView] || prevView}</button
              >
              <span class="text-tx3 text-[11px]">›</span>
              <span class="text-tx cursor-default">Match — {selectedMatch?.hero}</span>
            {:else}
              <span class="text-tx cursor-default">{VIEW_TITLES[currentView]}</span>
            {/if}
          </div>
          <div class="flex-1"></div>
          {#if currentView !== 'match-detail'}
            <div class="flex items-center gap-2">
              <select class="sel"
                ><option>All Pick</option><option>Ranked</option><option>Turbo</option><option
                  >Captain's Mode</option
                ></select
              >
              <select class="sel"
                ><option>Last 30 Matches</option><option>Last 7 Days</option><option
                  >Last 60 Days</option
                ><option>All Time</option></select
              >
              <button class="btn-pri" onclick={doRefresh}>↻ Refresh</button>
            </div>
          {/if}
        </div>

        <!-- VIEW CONTAINER -->
        <div class="flex-1 overflow-hidden flex flex-col bg-bg">
          {#if currentView === 'dashboard'}
            <DashboardView {openMatchDetail} {gotoView} />
          {:else if currentView === 'matches'}
            <MatchesView {openMatchDetail} />
          {:else if currentView === 'coach'}
            <CoachView />
          {:else if currentView === 'heroes'}
            <HeroesView />
          {:else if currentView === 'trends'}
            <TrendsView />
          {:else if currentView === 'draft'}
            <DraftView />
          {:else if currentView === 'compare'}
            <CompareView />
          {:else if currentView === 'settings'}
            <SettingsView />
          {:else if currentView === 'match-detail' && selectedMatch}
            <RedesignMatchDetailView match={selectedMatch} />
          {/if}
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div
      id="toast"
      class="fixed bottom-5 right-5 bg-s4 border border-bd2 rounded-lg px-[15px] py-[9px] text-[12.5px] font-semibold text-tx z-[9999] transition-all duration-200 pointer-events-none min-w-[160px] {toast.show
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-2'} {toast.type === 'ok'
        ? 'border-gr text-gr'
        : toast.type === 'err'
          ? 'border-rd text-rd'
          : ''}"
    >
      {toast.msg}
    </div>
  </div>
{/if}
