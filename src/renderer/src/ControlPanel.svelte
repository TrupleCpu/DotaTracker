<script lang="ts">
  import LoginScreen from './components/LoginScreen.svelte'
  import { playerStore } from './lib/playStore.svelte'
  import { rankToString } from './utils/rankMap'
  // Views
  import DashboardView from './components/DashboardView.svelte'
  import MatchesView from './components/MatchesView.svelte'
  import CoachView from './components/CoachView.svelte'
  import HeroesView from './components/HeroesView.svelte'
  import AnalysisView from './components/AnalysisView.svelte'
  import DraftView from './components/DraftView.svelte'
  import RolePerformanceView from './components/RolePerformanceView.svelte'
  import TeammatesView from './components/TeammatesView.svelte'
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

    Settings,
    Minus,
    Square,
    X
  } from '@lucide/svelte'
  import type { AnyMxRecord } from 'node:dns'
  import { onMount } from 'svelte'

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
        { id: 'analysis', label: 'Analysis', icon: ChartNoAxesCombined },
        { id: 'draft', label: 'Draft Analyzer', icon: Zap }
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
  let selectedMatch = $state<any>(null)
  let sidebarCollapsed = $state(false)

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
    analysis: 'Analysis',
    draft: 'Draft Analyzer',
    roles: 'Role Performance',
    settings: 'Settings',
    teammates: 'Teammates'
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

  let rolesViewInitialRole = $state<string | null>(null)

  function openRolesView(role: string): void {
    rolesViewInitialRole = role
    prevView = currentView
    currentView = 'roles'
  }

  function openMatchDetail(match: any): void {
    prevView = currentView
    selectedMatch = match
    currentView = 'match-detail'
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
        <span class="text-xs text-tx3 mr-2">v2.4.1</span>
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
      <aside
        class="shrink-0 bg-sb border-r border-bd flex flex-col transition-all duration-200 overflow-hidden"
        class:w-50={!sidebarCollapsed}
        class:w-14={sidebarCollapsed}
      >
        <div class="flex items-center gap-2.5 p-[16px_14px] border-b border-bd" class:justify-center={sidebarCollapsed}>
          <div class="w-[44px] h-[44px] rounded-lg flex items-center justify-center text-base shrink-0">
            <img src={AppLogo} alt="Logo" class="w-[44px] h-[44px]" />
          </div>
          <div class:hidden={sidebarCollapsed}>
            <div class="text-[11px] font-extrabold tracking-[0.3px] leading-none text-tx">ANCIENTEYE</div>
            <div class="text-[7px] text-tx3 tracking-[0.8px] uppercase mt-1 font-medium">
              Analyze &middot; Improve &middot; Win
            </div>
          </div>
        </div>

        <nav class="flex-1 py-1.5 overflow-y-auto">
          {#each navSections as section (section.heading)}
            {#if section.heading}
              <div
                class="text-xxs font-bold text-tx3 uppercase tracking-[1.1px] px-[14px] pt-[9px] pb-[4px]"
                class:hidden={sidebarCollapsed}
              >
                {section.heading}
              </div>
            {/if}

            {#each section.items as { id, label, icon: Icon } (id)}
              {@const active = currentView === id}
              <button
                class="w-full flex items-center gap-[9px] px-[13px] py-[7px] text-sm font-semibold transition-all cursor-pointer relative
                  {active ? 'text-tx bg-pub shadow-sm' : 'text-tx2 hover:text-tx hover:bg-white/[0.04]'}
                  {sidebarCollapsed ? 'justify-center' : 'text-left'}"
                onclick={() => gotoView(id)}
              >
                {#if active}
                  <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-pu"></div>
                {/if}
                <span class="w-4 text-center {active ? 'text-pu2' : 'text-tx3'}"><Icon size={14} /></span>
                <span class:hidden={sidebarCollapsed}>{label}</span>
              </button>
            {/each}
          {/each}
        </nav>

        {#if playerStore.playerStats}
          <div class="border-t border-bd p-[10px]">
            <div
              class="flex items-center gap-2.5 p-[10px] rounded-lg cursor-pointer hover:bg-s2 transition-colors"
              class:justify-center={sidebarCollapsed}
              onclick={() => showToast('Profile settings')}
            >
              <div
                class="w-[32px] h-[32px] flex items-center justify-center text-base font-extrabold shrink-0 rounded-full overflow-hidden ring-2 ring-pub"
              >
                <img
                  class="w-full h-full object-cover"
                  src={playerStore.playerStats?.avatar}
                  alt={playerStore.playerStats?.name}
                />
              </div>
              <div class="min-w-0 flex-1" class:hidden={sidebarCollapsed}>
                <div class="text-sm font-bold leading-tight truncate text-tx">
                  {playerStore.playerStats?.name}
                </div>
                <div class="text-[10px] text-tx3 font-semibold uppercase tracking-wide">
                  {playerStore.playerStats && rankToString(playerStore.playerStats?.rank)}
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="text-[11px] text-tx3 p-[14px]" class:hidden={sidebarCollapsed}>Loading profile...</div>
        {/if}
      </aside>

      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <div class="flex items-center gap-2 px-4 h-[44px] border-b border-bd shrink-0 bg-sb">
          <button
            onclick={() => sidebarCollapsed = !sidebarCollapsed}
            class="shrink-0 w-[26px] h-[26px] flex flex-col items-center justify-center gap-[3px] cursor-pointer hover:bg-white/[0.05] rounded transition-colors"
          >
            <span class="w-3.5 h-[2px] bg-tx3 rounded-full"></span>
            <span class="w-3.5 h-[2px] bg-tx3 rounded-full"></span>
            <span class="w-3.5 h-[2px] bg-tx3 rounded-full"></span>
          </button>
          <div class="flex items-center gap-1.5 text-sm font-semibold text-tx3">
            {#if currentView === 'match-detail'}
              <button
                class="cursor-pointer hover:text-tx transition-colors bg-transparent border-none p-0 text-inherit text-xs"
                onclick={() => gotoView(prevView)}>{VIEW_TITLES[prevView] || prevView}</button
              >
              <span class="text-tx3 text-[10px]">/</span>
              <span class="text-tx text-sm">Match — {selectedMatch?.hero || selectedMatch?.heroName}</span>
            {:else}
              <span class="text-tx text-sm font-bold">{VIEW_TITLES[currentView]}</span>
            {/if}
          </div>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col bg-bg">
          {#if currentView === 'dashboard'}
            <DashboardView {openMatchDetail} {gotoView} {openRolesView} />
          {:else if currentView === 'matches'}
            <MatchesView {openMatchDetail} />
          {:else if currentView === 'coach'}
            <CoachView />
          {:else if currentView === 'heroes'}
            <HeroesView />
          {:else if currentView === 'analysis'}
            <AnalysisView />
          {:else if currentView === 'draft'}
            <DraftView />
          {:else if currentView === 'roles'}
            <RolePerformanceView {openMatchDetail} initialRole={rolesViewInitialRole} />
          {:else if currentView === 'teammates'}
            <TeammatesView />
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
      class="fixed bottom-5 right-5 bg-s4 border border-bd rounded-lg px-4 py-2.5 text-sm font-semibold text-tx z-[9999] transition-all duration-200 pointer-events-none min-w-[140px] shadow-md {toast.show
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
    font-size: var(--text-sm);
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
    background: var(--color-s1);
    border: 1px solid var(--color-bd);
    color: var(--color-tx2);
    padding: 5px 24px 5px 10px;
    border-radius: 6px;
    font-size: var(--text-xs);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5'%3E%3Cpath d='M0 0l4.5 5L9 0z' fill='%239898b0'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color 0.1s;
    cursor: pointer;
  }
  .sel:hover {
    border-color: var(--color-bd2);
  }
  .sel:focus {
    border-color: var(--color-pu);
    outline: none;
  }

  .btn-pri {
    background: var(--color-pu);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 6px 14px;
    font-size: var(--text-xs);
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
    color: var(--color-tx3);
    cursor: pointer;
    transition: background 0.1s;
    font-size: var(--text-xs);
  }
  .win-btn:hover {
    background: var(--color-s3);
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
