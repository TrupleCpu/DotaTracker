<script lang="ts">
  import { onMount } from 'svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import type { Hero, OpenDotaMatch, DetailedMatchData } from './types/dota'
  import { normalizeItems } from './utils/dotaHelper'

  import heroesDataRaw from '../../main/data/heroes.json'
  import itemsDataRaw from '../../main/data/items.json'

  import LoginScreen from './components/LoginScreen.svelte'
  import DashboardHeader from './components/DashboardHeader.svelte'
  import MatchHistoryTable from './components/MatchHistoryTable.svelte'
  import MatchDetailView from './components/MatchDetailView.svelte'

  type WindowApi = typeof window.api & {
    setOverlayState: (enabled: boolean) => Promise<boolean>
    fetchMatchDetails: (matchId: number) => Promise<DetailedMatchData | { error: string }>
    getLocalSteamId: () => Promise<{ steamId: string | null; error?: string }> // ← typed response
  }
  const api = window.api as WindowApi

  const heroesData = heroesDataRaw as Hero[]
  const itemsData = normalizeItems(itemsDataRaw)
  const heroMap = new SvelteMap<number, Hero>()
  heroesData.forEach((hero) => heroMap.set(hero.id, hero))

  let steamId: string | null = null
  let isLoading = false
  let isDetailsLoading = false
  let errorMessage = ''
  let matchHistory: OpenDotaMatch[] | null = null
  let isOverlayEnabled = true
  let selectedMatch: DetailedMatchData | null = null

  async function toggleOverlay(): Promise<void> {
    isOverlayEnabled = !isOverlayEnabled
    isOverlayEnabled = await api.setOverlayState(isOverlayEnabled)
  }

  onMount(async () => {
    try {
      const activeConfig = await window.api.getConfig()
      isOverlayEnabled = activeConfig?.overlayEnabled ?? (await window.api.getOverlayStatus())
    } catch {
      console.error('State sync regression')
    }
    window.api.onOverlayStatus((visible: boolean) => {
      isOverlayEnabled = visible
    })
  })

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

  async function inspectMatchDetails(matchId: number): Promise<void> {
    try {
      isDetailsLoading = true
      errorMessage = ''
      const result = await api.fetchMatchDetails(matchId) // ← typed, no unknown

      if ('error' in result) {
        errorMessage = result.error || 'Failed to resolve match breakdown metrics.'
      } else {
        selectedMatch = result
      }
    } catch {
      errorMessage = 'Could not load match data structures.'
    } finally {
      isDetailsLoading = false
    }
  }

  function disconnect(): void {
    steamId = null
    matchHistory = null
    selectedMatch = null
    errorMessage = ''
  }
</script>

{#if !steamId}
  <LoginScreen {handleSteamLogin} {isLoading} {errorMessage} />
{:else}
  <div class="dashboard-layout">
    <DashboardHeader {steamId} {isOverlayEnabled} {toggleOverlay} on:disconnect={disconnect} />

    <main class="content-body">
      {#if errorMessage}
        <div class="error-banner" style="margin-bottom: 15px;">{errorMessage}</div>
      {/if}

      {#if selectedMatch}
        <MatchDetailView
          {selectedMatch}
          {heroMap}
          {itemsData}
          on:back={() => (selectedMatch = null)}
        />
      {:else}
        <MatchHistoryTable {matchHistory} {isDetailsLoading} {heroMap} {inspectMatchDetails} />
      {/if}
    </main>
  </div>
{/if}
