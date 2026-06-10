<script lang="ts">
  import { onMount } from 'svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import type { Hero, OpenDotaMatch, DetailedMatchData } from './types/dota'
  import { normalizeItems, isVictory } from './utils/dotaHelper'

  import heroesDataRaw from '../../main/data/heroes.json'
  import itemsDataRaw from '../../main/data/items.json'

  import LoginScreen from './components/LoginScreen.svelte'
  import DashboardHeader from './components/DashboardHeader.svelte'
  import MatchHistoryTable from './components/MatchHistoryTable.svelte'
  import MetricsSummaryGrid from './components/MetricsSummaryGrid.svelte'
  import TrendsContainer from './components/TrendsContainer.svelte'
  import SidebarIntelligencePanel from './components/SidebarIntelligencePanel.svelte'

  type WindowApi = typeof window.api & {
    fetchMatchDetails: (matchId: number) => Promise<DetailedMatchData | { error: string }>
    getLocalSteamId: () => Promise<{ steamId: string | null; error?: string }>
  }
  const api = window.api as WindowApi

  const heroesData = heroesDataRaw as Hero[]
  const itemsData = normalizeItems(itemsDataRaw)
  const heroMap = new SvelteMap<number, Hero>()
  heroesData.forEach((hero) => heroMap.set(hero.id, hero))

  // Initialized to null so the app correctly defaults to the Login screen
  let steamId: string | null = null
  let isLoading = false
  let isDetailsLoading = false
  let errorMessage = ''
  let matchHistory: OpenDotaMatch[] | null = null
  let selectedMatchId: number | null = null

  let timelineFilter: 'early' | 'mid' | 'late' = 'early'

  async function handleSteamLogin(): Promise<void> {
    try {
      isLoading = true
      errorMessage = ''
      const response = await api.getLocalSteamId()
      if (response.steamId) {
        steamId = response.steamId
        await fetchHistory()
      } else {
        errorMessage = response.error || 'Active Steam profile not found.'
      }
    } catch {
      errorMessage = 'An unexpected error occurred during profile sync.'
    } finally {
      isLoading = false
    }
  }

  async function fetchHistory(): Promise<void> {
    if (!steamId) return
    const result = await window.api.fetchMatchHistory(steamId)
    if (result && !('error' in (result as object))) {
      matchHistory = result as OpenDotaMatch[]
    } else {
      errorMessage = (result as { error?: string })?.error || 'Failed to retrieve history.'
    }
  }

  function disconnect(): void {
    steamId = null
    matchHistory = null
    selectedMatchId = null
    errorMessage = ''
  }
</script>

{#if !steamId}
  <LoginScreen {handleSteamLogin} {isLoading} {errorMessage} />
{:else}
  <div class="app-container">
    <header class="app-top-bar">
      <div class="left-meta">
        <div class="hero-dropdown-trigger">
          <span class="status-dot orange"></span>
          <span class="hero-name">Invoker</span>
          <span class="role-text">Mid · Pos 2</span>
        </div>

        <div class="timeline-filters">
          <button
            class="filter-tab"
            class:active={timelineFilter === 'early'}
            on:click={() => (timelineFilter = 'early')}>Early (0–10)</button
          >
          <button
            class="filter-tab"
            class:active={timelineFilter === 'mid'}
            on:click={() => (timelineFilter = 'mid')}>Mid (10–25)</button
          >
          <button
            class="filter-tab"
            class:active={timelineFilter === 'late'}
            on:click={() => (timelineFilter = 'late')}>Late (25+)</button
          >
        </div>
      </div>

      <div class="right-meta">
        <div class="mmr-badge">MMR <span class="value">3,840</span></div>
        <button class="overlay-indicator active" on:click={disconnect}>
          <span class="indicator-dot"></span> Overlay: ON
        </button>
      </div>
    </header>

    <div class="dashboard-viewport">
      <aside class="left-viewport-pane">
        <MatchHistoryTable
          {matchHistory}
          {heroMap}
          {selectedMatchId}
          on:select={(e) => (selectedMatchId = e.detail)}
        />
      </aside>

      <main class="center-viewport-pane">
        <MetricsSummaryGrid />
        <TrendsContainer />

        <div class="weakness-section">
          <h4 class="pane-title">Top weakness patterns</h4>
          <div class="pattern-card error">
            <div class="pattern-header">
              <span class="marker-dot red"></span>
              <p class="pattern-desc">KP% drops ~30% when behind 500+ net worth</p>
            </div>
            <button class="action-link text-orange">Practice catch-up drill</button>
          </div>

          <div class="pattern-card warning">
            <div class="pattern-header">
              <span class="marker-dot yellow"></span>
              <p class="pattern-desc">LH/min drops in late game (avg 6.1 → ~4.8)</p>
            </div>
            <button class="action-link text-orange">Practice siege timing</button>
          </div>

          <div class="pattern-card error">
            <div class="pattern-header">
              <span class="marker-dot red"></span>
              <p class="pattern-desc">Death spikes when enemy has Blink (4/5 games)</p>
            </div>
            <button class="action-link text-orange">TP + positioning drill</button>
          </div>
        </div>
      </main>

      <aside class="right-viewport-pane">
        <SidebarIntelligencePanel />
      </aside>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    background-color: #0b0c10;
    color: #9499a6;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    user-select: none;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
    background-color: #0b0c10;
  }

  /* --- Top Nav Custom Menu Bars --- */
  .app-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #111217;
    padding: 10px 16px;
    border-bottom: 1px solid #1a1c24;
    height: 54px;
    box-sizing: border-box;
  }

  .left-meta,
  .right-meta {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .hero-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #181922;
    border: 1px solid #262936;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
  }

  .hero-name {
    color: #ffffff;
    font-weight: 600;
  }

  .role-text {
    color: #626673;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .status-dot.orange {
    background: #e25c38;
    box-shadow: 0 0 6px #e25c38;
  }

  .timeline-filters {
    display: flex;
    background: #15161d;
    padding: 2px;
    border-radius: 4px;
    border: 1px solid #20222e;
  }

  .filter-tab {
    background: transparent;
    border: none;
    color: #626673;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  .filter-tab.active {
    background: #231b1d;
    color: #e25c38;
    border: 1px solid #4a231f;
  }

  .mmr-badge {
    font-size: 13px;
    color: #626673;
    font-weight: 500;
  }

  .mmr-badge .value {
    color: #dfa43b;
    font-weight: 700;
    margin-left: 4px;
  }

  .overlay-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #14231f;
    border: 1px solid #1f3a2b;
    color: #3cb878;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }

  .indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3cb878;
  }

  /* --- Dashboard Columns Structural Systems --- */
  .dashboard-viewport {
    display: grid;
    grid-template-columns: 240px 1fr 280px;
    flex: 1;
    overflow: hidden;
  }

  .left-viewport-pane {
    border-right: 1px solid #14151b;
    background-color: #0b0c10;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .center-viewport-pane {
    background-color: #0e0f14;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .right-viewport-pane {
    border-left: 1px solid #14151b;
    background-color: #0b0c10;
    padding: 16px;
    overflow-y: auto;
  }

  /* --- Top Weakness Diagnostics Architecture --- */
  .pane-title {
    font-size: 12px;
    color: #535763;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px 0;
    font-weight: 700;
  }

  .weakness-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pattern-card {
    background: #111217;
    border: 1px solid #1a1c24;
    border-radius: 4px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pattern-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .marker-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }
  .marker-dot.red {
    background: #e25c38;
  }
  .marker-dot.yellow {
    background: #dfa43b;
  }

  .pattern-desc {
    margin: 0;
    font-size: 13px;
    color: #b0b5c1;
    line-height: 1.4;
  }

  .action-link {
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    text-decoration: underline;
  }
  .text-orange {
    color: #cc5233;
  }
  .action-link:hover {
    color: #e25c38;
  }
</style>
