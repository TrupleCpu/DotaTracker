<script lang="ts">
  import { onMount } from 'svelte'
  import LoginScreen from './components/LoginScreen.svelte'
  import { playerStore } from './stores/playerStore.svelte'
  import { uiStore, VIEW_TITLES } from './stores/uiStore.svelte'
  import type { ViewId } from './stores/uiStore.svelte'
  import { rankToString } from './utils/rankMap'
  import Toast from './lib/ui/Toast.svelte'
  import AppLogo from './assets/logo/AppLogo.png'
  import {
    LayoutDashboard,
    Gamepad2,
    Shield,
    ChartNoAxesCombined,
    Settings,
    BookOpen,
    Minus,
    Square,
    X
  } from '@lucide/svelte'

  import DashboardView from './views/DashboardView.svelte'
  import MatchesView from './views/MatchesView.svelte'
  import HeroesView from './views/HeroesView.svelte'
  import AnalysisView from './views/AnalysisView.svelte'

  import RolePerformanceView from './views/RolePerformanceView.svelte'
  import TeammatesView from './views/TeammatesView.svelte'
  import SettingsView from './views/SettingsView.svelte'
  import MatchDetailView from './views/match-detail/MatchDetailView.svelte'
  import HeroDetailView from './views/HeroDetailView.svelte'
  import PlayGuideView from './views/PlayGuideView.svelte'

  import TokenPrompt from './components/TokenPrompt.svelte'

  const navSections = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'matches', label: 'Matches', icon: Gamepad2, badge: 30 },
        { id: 'heroes', label: 'Heroes', icon: Shield }
      ]
    },
    {
      heading: 'Analysis',
      items: [{ id: 'analysis', label: 'Analysis', icon: ChartNoAxesCombined }]
    },
    {
      heading: 'Tools',
      items: [{ id: 'play-guide', label: 'Play Guide', icon: BookOpen }]
    },
    { heading: 'Account', items: [{ id: 'settings', label: 'Settings', icon: Settings }] }
  ]

  let steamId = $state<string | null>(null)
  let isLoading = $state(false)
  let errorMessage = $state('')
  let hasToken = $state(false)
  let checkingToken = $state(true)
  let appVersion = $state('')

  onMount(async () => {
    try {
      const token = await window.api.getStratzToken()
      hasToken = !!token
      appVersion = await window.api.getAppVersion()
      if (hasToken) {
        await handleSteamLogin()
      }
    } catch {
      hasToken = false
    } finally {
      checkingToken = false
    }
  })

  async function handleSteamLogin(): Promise<void> {
    try {
      isLoading = true
      errorMessage = ''
      const response = await window.api.getLocalSteamId()
      if (response.steamId) {
        steamId = response.steamId
        window.api.triggerStartupSync(steamId)
        setTimeout(() => {
          window.api.startFullSync(Number(steamId))
        }, 1000)
      } else {
        errorMessage = response.error || 'Active Steam profile not found.'
      }
    } catch {
      errorMessage = 'An unexpected error occurred during profile sync.'
    } finally {
      isLoading = false
    }
  }

  let rolesViewInitialRole = $state<string | null>(null)
</script>

{#if checkingToken}
  <div class="flex items-center justify-center min-h-screen bg-bg text-tx text-sm font-semibold">
    Loading...
  </div>
{:else if !hasToken}
  <TokenPrompt onSaved={() => (hasToken = true)} />
{:else if !steamId}
  <LoginScreen {handleSteamLogin} {isLoading} {errorMessage} />
{:else}
  <div
    class="flex flex-col h-screen overflow-hidden bg-bg text-tx font-inter"
    data-compact={uiStore.compactMode ? '' : undefined}
    class:no-animate={!uiStore.animatedCharts}
  >
    <div class="titlebar">
      <div class="flex items-center gap-2.5">
        <div class="w-6 h-6 rounded flex items-center justify-center shrink-0">
          <img src={AppLogo} alt="Logo" class="w-5 h-5" />
        </div>
        <div class="titlebar-title">Ancient Eye</div>
      </div>
      <div class="flex-1"></div>
      <div class="titlebar-right">
        <span class="text-xs text-tx3 mr-2">v{appVersion}</span>
        <div class="win-controls">
          <button class="win-btn" onclick={() => window.api.minimizeWindow()} aria-label="Minimize"
            ><Minus size={13} strokeWidth={1.5} /></button
          >
          <button class="win-btn" onclick={() => window.api.maximizeWindow()} aria-label="Maximize"
            ><Square size={11} strokeWidth={2} /></button
          >
          <button
            class="win-btn win-close"
            onclick={() => window.api.closeWindow()}
            aria-label="Close"><X size={14} strokeWidth={1.5} /></button
          >
        </div>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <aside
        class="shrink-0 bg-sb border-r border-bd flex flex-col transition-all duration-200 overflow-x-hidden"
        class:w-56={!uiStore.sidebarCollapsed}
        class:w-16={uiStore.sidebarCollapsed}
      >
        <div
          class="flex items-center gap-3 p-[14px_12px] border-b border-bd"
          class:justify-center={uiStore.sidebarCollapsed}
        >
          <div
            class="rounded-lg flex items-center justify-center text-base shrink-0"
            class:w-12={!uiStore.sidebarCollapsed}
            class:h-12={!uiStore.sidebarCollapsed}
            class:w-10={uiStore.sidebarCollapsed}
            class:h-10={uiStore.sidebarCollapsed}
          >
            <img
              src={AppLogo}
              alt="Logo"
              class:w-12={!uiStore.sidebarCollapsed}
              class:h-12={!uiStore.sidebarCollapsed}
              class:w-10={uiStore.sidebarCollapsed}
              class:h-10={uiStore.sidebarCollapsed}
            />
          </div>
          <div class:hidden={uiStore.sidebarCollapsed}>
            <div class="text-[11px] font-extrabold tracking-[0.3px] leading-none text-tx">
              ANCIENTEYE
            </div>
            <div class="text-[7px] text-tx3 tracking-[0.8px] uppercase mt-1 font-medium">
              Analyze &middot; Improve &middot; Win
            </div>
          </div>
        </div>
        <nav class="flex-1 py-2 overflow-y-auto overflow-x-hidden">
          {#each navSections as section (section.heading)}
            {#if section.heading}
              <div
                class="text-xs font-bold text-tx3 uppercase tracking-[1.1px] px-3.5 pt-2.5 pb-1.5"
                class:hidden={uiStore.sidebarCollapsed}
              >
                {section.heading}
              </div>
            {/if}
            {#each section.items as { id, label, icon: Icon } (id)}
              {@const active = uiStore.activeTab === id}
              <button
                class="w-full flex items-center gap-3 px-3 py-2 text-lg font-semibold transition-all cursor-pointer relative
                {active ? 'text-tx bg-pub shadow-sm' : 'text-tx2 hover:text-tx hover:bg-white/4'}
                {uiStore.sidebarCollapsed ? 'justify-center' : 'text-left'}"
                onclick={() => uiStore.gotoView(id as ViewId)}
              >
                {#if active}<div class="absolute left-0 top-0 bottom-0 w-1 bg-pu"></div>{/if}
                <span class="w-5 text-center {active ? 'text-pu2' : 'text-tx3'}"
                  ><Icon size={16} /></span
                >
                <span class:hidden={uiStore.sidebarCollapsed}>{label}</span>
              </button>
            {/each}
          {/each}
        </nav>
        {#if playerStore.playerStats}
          <div class="border-t border-bd p-2">
            <button
              type="button"
              class="w-full text-left flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-s2 transition-colors focus-visible:outline-2 focus-visible:outline-pub"
              class:justify-center={uiStore.sidebarCollapsed}
              onclick={() => uiStore.showToast('Profile settings')}
            >
              <div
                class="w-9 h-9 flex items-center justify-center text-base font-extrabold shrink-0 rounded-full overflow-hidden ring-2 ring-pub"
              >
                <img
                  class="w-full h-full object-cover"
                  src={playerStore.playerStats?.avatar}
                  alt={playerStore.playerStats?.name ?? 'Player avatar'}
                />
              </div>
              <div class="min-w-0 flex-1" class:hidden={uiStore.sidebarCollapsed}>
                <div class="text-base font-bold leading-tight truncate text-tx">
                  {playerStore.playerStats?.name}
                </div>
                <div class="text-xs text-tx3 font-semibold uppercase tracking-wide">
                  {playerStore.playerStats && rankToString(playerStore.playerStats?.rank)}
                </div>
              </div>
            </button>
          </div>
        {:else}
          <div class="text-xs text-tx3 p-2.5" class:hidden={uiStore.sidebarCollapsed}>
            Loading profile...
          </div>
        {/if}
      </aside>

      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <div class="flex items-center gap-2 px-4 h-11 border-b border-bd shrink-0 bg-sb">
          <button
            onclick={() => (uiStore.sidebarCollapsed = !uiStore.sidebarCollapsed)}
            aria-label={uiStore.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            class="shrink-0 w-6.5 h-6.5 flex flex-col items-center justify-center gap-0.75 cursor-pointer hover:bg-white/5 rounded transition-colors"
          >
            <span class="w-3.5 h-0.5 bg-tx3 rounded-full"></span>
            <span class="w-3.5 h-0.5 bg-tx3 rounded-full"></span>
            <span class="w-3.5 h-0.5 bg-tx3 rounded-full"></span>
          </button>
          <div class="flex items-center gap-1.5 text-sm font-semibold text-tx3">
            {#if uiStore.currentView === 'match-detail'}
              <button
                class="cursor-pointer hover:text-tx transition-colors bg-transparent border-none p-0 text-inherit text-xs"
                onclick={() =>
                  uiStore.gotoView(
                    uiStore.prevView === 'hero-detail' ? 'heroes' : uiStore.prevView
                  )}
                >{uiStore.prevView === 'hero-detail'
                  ? 'Heroes'
                  : VIEW_TITLES[uiStore.prevView] || uiStore.prevView}</button
              >
              <span class="text-tx3 text-[10px]">/</span>
              <span class="text-tx text-sm"
                >Match — {uiStore.selectedMatch?.hero || uiStore.selectedMatch?.heroName}</span
              >
            {:else if uiStore.currentView === 'hero-detail'}
              <button
                class="cursor-pointer hover:text-tx transition-colors bg-transparent border-none p-0 text-inherit text-xs"
                onclick={() => uiStore.gotoView('heroes')}>Heroes</button
              >
              <span class="text-tx3 text-[10px]">/</span>
              <span class="text-tx text-sm">Hero Matches</span>
            {:else}
              <span class="text-tx text-sm font-bold">{VIEW_TITLES[uiStore.currentView]}</span>
            {/if}
          </div>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col bg-bg">
          {#if uiStore.currentView === 'dashboard'}
            <DashboardView />
          {:else if uiStore.currentView === 'matches'}
            <MatchesView />
          {:else if uiStore.currentView === 'heroes'}
            <HeroesView />
          {:else if uiStore.currentView === 'analysis'}
            <AnalysisView />
          {:else if uiStore.currentView === 'roles'}
            <RolePerformanceView initialRole={rolesViewInitialRole} />
          {:else if uiStore.currentView === 'teammates'}
            <TeammatesView />
          {:else if uiStore.currentView === 'settings'}
            <SettingsView />
          {:else if uiStore.currentView === 'match-detail' && uiStore.selectedMatch}
            <MatchDetailView match={uiStore.selectedMatch} />
          {:else if uiStore.currentView === 'hero-detail' && uiStore.selectedHeroId}
            <HeroDetailView heroId={uiStore.selectedHeroId} />
          {:else if uiStore.currentView === 'play-guide'}
            <PlayGuideView />
          {/if}
        </div>
      </div>
    </div>

    <Toast />
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
</style>
