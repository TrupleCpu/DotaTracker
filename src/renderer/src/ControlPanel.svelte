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
  import AppLogo from './assets/logo/AppLogo.png'
  import {
    LayoutDashboard,
    Gamepad2,
    Bot,
    Shield,
    ChartNoAxesCombined,
    Zap,
    Scale,
    Settings,
    Minus,
    Square,
    X
  } from '@lucide/svelte'
  import type { AnyMxRecord } from 'node:dns'

  const navSections = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'matches', label: 'Matches', icon: Gamepad2, badge: 30 },
        { id: 'coach', label: 'AI Coach', icon: Bot },
        { id: 'heroes', label: 'Heroes', icon: Shield }
      ]
    },
    {
      heading: 'Analysis',
      items: [
        { id: 'trends', label: 'Trends', icon: ChartNoAxesCombined },
        { id: 'draft', label: 'Draft Analyzer', icon: Zap },
        { id: 'compare', label: 'Compare', icon: Scale }
      ]
    },
    {
      heading: 'Account',
      items: [{ id: 'settings', label: 'Settings', icon: Settings }]
    }
  ]

  // State
  let steamId = $state<string | null>(null)
  let isLoading = $state(false)
  let errorMessage = $state('')
  let currentView = $state('dashboard')
  let prevView = $state('dashboard')
  let selectedMatch = $state<MockMatch | null>(null)

  // Toast
  let toast = $state({ show: false, msg: '', type: '' })
  let toastTimer: AnyMxRecord

  function showToast(msg: string, type = 'ok'): void {
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
      // ✅ FIXED: Look directly at the safe window.api global wrapper
      const response = await window.api.getLocalSteamId()
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

  function gotoView(view: string): void {
    prevView = currentView
    currentView = view
    selectedMatch = null
  }

  function openMatchDetail(match: MockMatch): void {
    prevView = currentView
    selectedMatch = match
    currentView = 'match-detail'
  }

  function doRefresh(e: MouseEvent): void {
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
    <div class="titlebar">
      <div class="flex items-center gap-2.5">
        <div class="w-6 h-6 rounded flex items-center justify-center shrink-0">
          <img src={AppLogo} alt="Logo" class="w-5 h-5" />
        </div>
        <div class="titlebar-title">Ancient Eye</div>
      </div>
      <div class="flex-1"></div>
      <div class="titlebar-right">
        <span class="text-[10px] text-tx3 mr-2">v2.4.1</span>
        <div class="win-controls">
          <button class="win-btn" onclick={() => window.api.minimizeWindow()} aria-label="Minimize">
            <Minus size={13} strokeWidth={1.5} />
          </button>

          <button class="win-btn" onclick={() => window.api.maximizeWindow()} aria-label="Maximize">
            <Square size={11} strokeWidth={2} />
          </button>

          <button
            class="win-btn win-close"
            onclick={() => window.api.closeWindow()}
            aria-label="Close"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <aside class="w-50 shrink-0 bg-sb border-r border-bd flex flex-col">
        <div class="flex items-center gap-2.5 p-[14px_14px_12px] border-b border-bd">
          <div class="w-14 h-14 rounded-lg flex items-center justify-center text-base shrink-0">
            <img src={AppLogo} alt="Logo" class="w-14 h-14" />
          </div>
          <div>
            <div class="text-[10px] font-extrabold tracking-[0.2px] leading-[1.15]">ANCIENTEYE</div>
            <div class="text-[6px] text-tx3 tracking-[0.9px] uppercase mt-0.5">
              Analyze &middot; Improve &middot; Win
            </div>
          </div>
        </div>

        <nav class="flex-1 py-2 overflow-y-auto">
          <div class="text-[9px] font-bold text-tx3 uppercase tracking-[1.1px] p-[10px_14px_4px]">
            Main
          </div>
          {#each navSections as section (section.heading)}
            {#if section.heading}
              <div
                class="text-[9px] font-bold text-tx3 uppercase tracking-[1.1px] p-[10px_14px_4px]"
              >
                {section.heading}
              </div>
            {/if}

            {#each section.items as { id, label, icon: Icon } (id)}
              {@const active = currentView === id}
              <button
                class="w-full text-left flex items-center gap-[9px] px-[13px] py-[7px] text-[12.5px] font-medium transition-all cursor-pointer relative
                  {active ? 'text-tx bg-pub' : 'text-tx2 hover:text-tx hover:bg-white/5'}"
                onclick={() => gotoView(id)}
              >
                {#if active}
                  <div class="absolute left-0 top-0 bottom-0 w-[2.5px] bg-pu rounded-r-[2px]"></div>
                {/if}
                <span class="w-4 text-center opacity-80"><Icon size={14} /></span>
                {label}
              </button>
            {/each}
          {/each}
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

      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
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
              <select class="sel">
                <option>All Pick</option>
                <option>Ranked</option>
                <option>Turbo</option>
                <option>Captain's Mode</option>
              </select>
              <select class="sel">
                <option>Last 30 Matches</option>
                <option>Last 7 Days</option>
                <option>Last 60 Days</option>
                <option>All Time</option>
              </select>
              <button class="btn-pri" onclick={doRefresh}>↻ Refresh</button>
            </div>
          {/if}
        </div>

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

<style>
  /* Titlebar framework rules */
  .titlebar {
    height: 38px;
    background: var(--color-sb);
    border-bottom: 1px solid var(--color-bd);
    display: flex;
    align-items: center;
    padding-left: 12px;
    flex-shrink: 0;
    -webkit-app-region: drag;
    user-select: none;
  }

  .titlebar-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-tx2);
    letter-spacing: 0.2px;
  }

  .titlebar-right {
    display: flex;
    align-items: center;
    height: 100%;
    -webkit-app-region: no-drag;
  }

  /* Custom Form & Interactive Elements */
  .sel {
    background: var(--color-s2);
    border: 1px solid var(--color-bd);
    color: var(--color-tx2);
    padding: 5px 24px 5px 10px;
    border-radius: 7px;
    font-size: 11.5px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5'%3E%3Cpath d='M0 0l4.5 5L9 0z' fill='%23a1a1aa'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color 0.1s;
    cursor: pointer;
  }
  .sel:hover {
    border-color: var(--color-bd2);
  }

  .btn-pri {
    background: var(--color-pu);
    color: var(--color-bg);
    border: none;
    border-radius: 7px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: opacity 0.1s;
    letter-spacing: 0.1px;
    white-space: nowrap;
    cursor: pointer;
  }
  .btn-pri:hover {
    opacity: 0.85;
  }
  .btn-pri:active {
    opacity: 0.7;
  }

  /* Desktop Windows Frame System Controls */
  .win-controls {
    display: flex;
    height: 100%;
  }

  .win-btn {
    width: 46px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--color-tx2);
    cursor: pointer;
    transition:
      background 0.1s,
      color 0.1s;
    font-size: 11px;
  }
  .win-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--color-tx);
  }

  .win-close:hover {
    background: #c42b1c;
    color: #fff;
  }
  .win-close:active {
    background: #b22318;
  }

  .win-icon {
    pointer-events: none;
  }
</style>
