<script lang="ts">
  import { playerStore } from '../stores/playerStore.svelte'
  import { uiStore } from '../stores/uiStore.svelte'
  import { getHero, getHeroByName, getHeroImgUrl } from '../utils/heroMap'
  import {
    formatDuration,
    formatGameMode,
    formatTimeAgo,
    formatRole,
    getLaneOutcome
  } from '../utils/matchHelper'
  import LoadingSpinner from '../lib/ui/LoadingSpinner.svelte'
  import ToolTip from '../lib/ui/ToolTip.svelte'
  import type { Match } from '../types'

  const ROLE_OPTIONS = ['All Roles', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support']

  let selectedHero = $state('All Heroes')
  let selectedResult = $state('All Results')
  let selectedMode = $state('All Modes')
  let selectedRole = $state('All Roles')

  let allMatches = $state<Match[]>([])
  let loading = $state(false)
  let isLoadingMore = $state(false)
  let error = $state<string | null>(null)
  let loadedCount = $state(0)

  let totalMatches = $derived(playerStore.playerStats?.matchCount ?? 0)
  let hasMore = $derived(loadedCount < totalMatches)

  let filteredMatches = $derived.by(() => {
    return allMatches.filter((m) => {
      if (selectedHero !== 'All Heroes' && m.hero !== selectedHero) return false
      if (selectedResult === 'Wins Only' && m.outcome !== 'win') return false
      if (selectedResult === 'Losses Only' && m.outcome !== 'loss') return false
      return true
    })
  })

  let heroes = $derived([...new Set(allMatches.map((m) => m.hero))])

  async function fetchChunk(skip: number): Promise<Match[]> {
    const steamId = playerStore.steamId
    if (!steamId) return []

    const options: Record<string, unknown> = { take: 20, skip }
    if (selectedRole !== 'All Roles') {
      const roleMap: Record<string, string> = {
        Carry: 'POSITION_1',
        Mid: 'POSITION_2',
        Offlane: 'POSITION_3',
        'Soft Support': 'POSITION_4',
        'Hard Support': 'POSITION_5'
      }
      options.positionIds = roleMap[selectedRole]
    }
    if (selectedMode === 'Ranked') options.lobbyTypeIds = [7]
    else if (selectedMode === 'Turbo') options.gameModeIds = [23]
    else if (selectedMode === 'Normal') options.lobbyTypeIds = [0]

    const result = await window.api.fetchAllMatches(steamId, options)
    if (result && typeof result === 'object' && 'err' in result) {
      throw new Error((result as { err: string }).err)
    }
    const rawMatches = (result as any)?.player?.matches
    if (!Array.isArray(rawMatches)) throw new Error('Unexpected response from server.')
    return mapMatches(rawMatches, result)
  }

  async function fetchInitial() {
    const steamId = playerStore.steamId
    if (!steamId) return
    allMatches = []
    loadedCount = 0
    loading = true
    error = null
    try {
      const chunk = await fetchChunk(0)
      allMatches = chunk
      loadedCount = chunk.length
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load matches.'
    } finally {
      loading = false
    }
  }

  async function loadMore() {
    if (isLoadingMore || !hasMore) return
    isLoadingMore = true
    try {
      const chunk = await fetchChunk(loadedCount)
      allMatches = [...allMatches, ...chunk]
      loadedCount += chunk.length
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load more matches.'
    } finally {
      isLoadingMore = false
    }
  }

  function mapMatches(rawMatches: any[], raw: unknown): Match[] {
    return rawMatches.map((match: any) => {
      const playerData = match.players?.[0] ?? {}
      const hero = playerData.heroId ? getHero(playerData.heroId) : null
      const items = ['item0Id', 'item1Id', 'item2Id', 'item3Id', 'item4Id', 'item5Id']
        .map((slot) => playerData[slot])
        .filter(Boolean)
        .map((id: number) => `item-asset://images/${id}.png`)

      return {
        id: match.id,
        hero: hero?.localized_name ?? `Hero #${playerData.heroId}`,
        heroId: playerData.heroId,
        outcome: playerData.isVictory ? 'win' : 'loss',
        didRadiantWin: match.didRadiantWin,
        midLaneOutcome: match.midLaneOutcome,
        bottomLaneOutcome: match.bottomLaneOutcome,
        topLaneOutcome: match.topLaneOutcome,
        mode: formatGameMode(match.gameMode),
        role:
          selectedRole !== 'All Roles'
            ? selectedRole
            : formatRole(playerData.position, playerData.lane),
        k: playerData.kills ?? 0,
        d: playerData.deaths ?? 0,
        a: playerData.assists ?? 0,
        gpm: playerData.goldPerMinute ?? 0,
        xpm: 0,
        dur: formatDuration(match.durationSeconds ?? 0),
        ago: formatTimeAgo(match.endDateTime),
        lane: playerData.lane ?? 'Unknown',
        rank: 0,
        items
      } as Match
    })
  }


  function getHeroSrc(heroName: string): string {
     const h = getHeroByName(heroName)
     return h ? getHeroImgUrl(h.img) : ''
  }
  $effect(() => {
    ;(selectedMode, selectedRole, playerStore.steamId)
    if (playerStore.steamId) fetchInitial()
  })
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex items-center gap-1.5 mb-4 bg-s1 border border-bd rounded-lg p-2.5">
    <select bind:value={selectedHero} class="sel-pill">
      <option>All Heroes</option>
      {#each heroes as h}<option>{h}</option>{/each}
    </select>
    <select bind:value={selectedResult} class="sel-pill">
      <option>All Results</option><option>Wins Only</option><option>Losses Only</option>
    </select>
    <select bind:value={selectedMode} class="sel-pill">
      <option>All Modes</option><option>Normal</option><option>Ranked</option><option>Turbo</option>
    </select>
    <select bind:value={selectedRole} class="sel-pill">
      <option>All Roles</option>
      {#each ROLE_OPTIONS as r}{#if r !== 'All Roles'}<option>{r}</option>{/if}{/each}
    </select>
    <div class="flex-1"></div>
    <span class="text-xs text-tx3 font-semibold tabular-nums"
      >{filteredMatches.length} / {totalMatches} matches</span
    >
  </div>

  {#if loading && allMatches.length === 0}
    <LoadingSpinner text="Loading matches…" />
  {:else if error && allMatches.length === 0}
    <div class="flex flex-col items-center justify-center gap-3 py-16 text-sm">
      <span class="text-rd">{error}</span>
      <button
        class="sel-pill px-3 py-1 text-sm font-semibold cursor-pointer hover:bg-s3"
        onclick={fetchInitial}>Retry</button
      >
    </div>
  {:else if filteredMatches.length === 0}
    <div class="flex items-center justify-center py-16 text-sm text-tx3">No matches found.</div>
  {:else}
    <div class="overflow-x-auto" class:opacity-50={loading}>
      <div class="flex flex-col gap-[7px] min-w-0">
        {#each filteredMatches as m (m.id)}
          <div
            class="flex items-center gap-4 bg-s1 border border-bd rounded-lg p-[14px_18px] cursor-pointer transition-all hover:border-bd2 hover:bg-s2"
            onclick={() => uiStore.openMatchDetail(m)}
          >
            <div class="w-16 h-14 rounded-lg bg-s2 shrink-0 overflow-hidden">
              {#if m.heroId}
                <img
                  src={`hero-asset://images/${m.heroId}.png`}
                  alt={m.hero}
                  class="w-full h-full object-cover"
                  onerror={(e) =>
                    ((e.currentTarget as HTMLImageElement).src = '/placeholder-hero.png')}
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-xs text-tx3">?</div>
              {/if}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <ToolTip text={m.outcome === 'win' ? 'Win' : 'Loss'}>
                  <span
                    class="flex items-center justify-center w-[26px] h-[26px] rounded-full text-sm font-extrabold shrink-0 leading-none {m.outcome ===
                    'win'
                      ? 'text-gr bg-grb'
                      : 'text-rd bg-rdb'}"
                  >
                    {m.outcome === 'win' ? 'W' : 'L'}
                  </span>
                </ToolTip>
                {#if getLaneOutcome(m)}
                  <ToolTip
                    text={getLaneOutcome(m) === 'won'
                      ? 'Lane won'
                      : getLaneOutcome(m) === 'tie'
                        ? 'Lane tied'
                        : 'Lane lost'}
                  >
                    <span
                      class="flex items-center justify-center w-[14px] h-[14px] rounded-[3px] text-[10px] font-extrabold leading-none shrink-0
                        {getLaneOutcome(m) === 'won'
                        ? 'text-gr bg-grb'
                        : getLaneOutcome(m) === 'tie'
                          ? 'text-gd bg-gdb'
                          : 'text-rd bg-rdb'}"
                    >
                      {getLaneOutcome(m) === 'won' ? '+' : getLaneOutcome(m) === 'tie' ? '~' : '−'}
                    </span>
                  </ToolTip>
                {/if}
                <span class="text-sm font-bold truncate">{m.hero ?? 'Unknown'}</span>
                <span
                  class="text-xxs text-tx3 uppercase tracking-wide px-1.5 py-[1px] rounded bg-s2 shrink-0"
                  >{m.role ?? 'Unknown'}</span
                >
              </div>
              <div class="text-xs text-tx3 mt-[2px]">{m.mode ?? 'Unknown'}</div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              {#if m.items?.length}
                {#each m.items.slice(0, 6) as item}
                  {#if item}
                    <div class="w-[30px] h-[30px] rounded bg-s2 overflow-hidden">
                      <img src={item} alt="" class="w-full h-full object-cover" />
                    </div>
                  {/if}
                {/each}
              {/if}
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div
                class="text-sm font-semibold w-[52px] text-center text-tx2 font-mono font-tabular leading-tight"
              >
                {m.k ?? 0}/{m.d ?? 0}/{m.a ?? 0}
                <span
                  class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]"
                  >KDA</span
                >
              </div>
              <div
                class="text-sm font-semibold w-[40px] text-center text-tx2 font-mono font-tabular leading-tight"
              >
                {m.gpm ?? 0}
                <span
                  class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]"
                  >GPM</span
                >
              </div>
              <div
                class="text-sm font-semibold w-[52px] text-center text-tx2 font-mono font-tabular leading-tight"
              >
                {m.dur ?? '0:00'}
                <span
                  class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]"
                  >Duration</span
                >
              </div>
            </div>
            <div class="text-xs text-tx3 w-[78px] text-right shrink-0">{m.ago ?? ''}</div>
            <div class="text-tx3 text-lg transition-colors shrink-0 hover:text-pu2">›</div>
          </div>
        {/each}
      </div>
    </div>
    {#if hasMore}
      <div class="flex justify-center mt-4 pb-2">
        <button
          class="sel-pill px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-s3 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={isLoadingMore}
          onclick={loadMore}
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      </div>
    {/if}
  {/if}
</div>
