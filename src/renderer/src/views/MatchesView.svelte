<script lang="ts">
  import { onMount } from 'svelte'
  import { playerStore } from '../stores/playerStore.svelte'
  import { uiStore } from '../stores/uiStore.svelte'
  import { getHero } from '../utils/heroMap'
  import {
    formatDuration,
    formatGameMode,
    formatTimeAgo,
    formatRole,
    getLaneOutcome
  } from '../utils/matchHelper'
  import ToolTip from '../lib/ui/ToolTip.svelte'
  import Skeleton from '../lib/ui/Skeleton.svelte'
  import LaneIcon from '../lib/dota/LaneIcon.svelte'
  import type { Match } from '../types'
  import type { RawMatch, RawMatchPlayer } from '../types/api'
  import { ROLE_OPTIONS } from '../utils/roleMap'

  let selectedHero = $state('All Heroes')
  let selectedResult = $state('All Results')
  let selectedMode = $state('All Modes')
  let selectedRole = $state('All Roles')

  let allMatches = $state<Match[]>([])
  let loading = $state(false)
  let isLoadingMore = $state(false)
  let error = $state<string | null>(null)
  let loadedCount = $state(0)
  let fetchGen = $state(0)

  let totalMatches = $derived(playerStore.playerStats?.matchCount ?? 0)
  let hasMore = $derived(loadedCount < totalMatches)

  let filteredMatches = $derived.by(() => {
    return allMatches.filter((m) => {
      if (selectedHero !== 'All Heroes' && m.hero !== selectedHero) return false
      if (selectedResult === 'Wins Only' && m.outcome !== 'win') return false
      if (selectedResult === 'Losses Only' && m.outcome !== 'loss') return false
      if (selectedMode !== 'All Modes' && m.mode !== selectedMode) return false
      if (selectedRole !== 'All Roles' && m.role !== selectedRole) return false
      return true
    })
  })

  let heroes = $derived([...new Set(allMatches.map((m) => m.hero))])

  async function fetchChunk(skip: number): Promise<Match[]> {
    const steamId = playerStore.steamId
    if (!steamId) return []

    const options = { take: 20, skip }

    const result = await window.api.fetchAllMatches(String(steamId), options)
    if (result && typeof result === 'object' && 'err' in result) {
      throw new Error((result as { err: string }).err)
    }
    const rawMatches = (result as { player?: { matches?: RawMatch[] } })?.player?.matches
    if (!Array.isArray(rawMatches)) throw new Error('Unexpected response from server.')
    return mapMatches(rawMatches)
  }

  async function fetchInitial(): Promise<void> {
    const gen = ++fetchGen
    const steamId = playerStore.steamId
    if (!steamId) return
    allMatches = []
    loadedCount = 0
    loading = true
    error = null
    try {
      const chunk = await fetchChunk(0)
      if (gen !== fetchGen) return
      allMatches = chunk
      loadedCount = chunk.length
    } catch (err) {
      if (gen !== fetchGen) return
      error = err instanceof Error ? err.message : 'Failed to load matches.'
    } finally {
      if (gen === fetchGen) loading = false
    }
  }

  async function loadMore(): Promise<void> {
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

  function mapMatches(rawMatches: RawMatch[]): Match[] {
    return rawMatches.map((match: RawMatch) => {
      const playerData = match.players?.[0] ?? ({} as RawMatchPlayer)
      const hero = playerData.heroId ? getHero(playerData.heroId) : null
      const items = ['item0Id', 'item1Id', 'item2Id', 'item3Id', 'item4Id', 'item5Id']
        .map((slot) => playerData[slot as keyof RawMatchPlayer])
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
      }
    })
  }

  onMount(() => {
    fetchInitial()

    const unsub = window.api.onSyncComplete(() => {
      fetchInitial()
    })
    return () => {
      ++fetchGen
      unsub()
    }
  })
</script>

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  <div class="flex items-center gap-1.5 mb-4 bg-s1 border border-bd rounded-lg p-2.5">
    <select bind:value={selectedHero} class="sel-pill">
      <option>All Heroes</option>
      {#each heroes as h (h)}<option>{h}</option>{/each}
    </select>
    <select bind:value={selectedResult} class="sel-pill">
      <option>All Results</option><option>Wins Only</option><option>Losses Only</option>
    </select>
    <select bind:value={selectedMode} class="sel-pill">
      <option>All Modes</option><option>Normal</option><option>Ranked</option><option>Turbo</option>
    </select>
    <select bind:value={selectedRole} class="sel-pill">
      <option>All Roles</option>
      {#each ROLE_OPTIONS as r (r)}{#if r !== 'All Roles'}<option>{r}</option>{/if}{/each}
    </select>
    <div class="flex-1"></div>
    <span class="text-xs text-tx3 font-semibold tabular-nums"
      >{filteredMatches.length} / {totalMatches} matches</span
    >
  </div>

  {#if loading && allMatches.length === 0}
    <div class="flex flex-col gap-1.75 px-0">
      {#each { length: 6 } as _, i (i)}
        <div class="flex items-center gap-4 bg-s1 border border-bd rounded-lg p-[14px_18px]">
          <Skeleton width="64px" height="56px" />
          <div class="flex-1 space-y-2">
            <Skeleton width="50%" height="16px" />
            <Skeleton width="30%" height="12px" />
          </div>
          <div class="flex gap-1.5">
            {#each { length: 3 } as _, i (i)}
              <Skeleton width="30px" height="30px" />
            {/each}
          </div>
          <div class="flex items-center gap-4">
            <Skeleton width="52px" height="36px" />
            <Skeleton width="40px" height="36px" />
            <Skeleton width="52px" height="36px" />
          </div>
          <Skeleton width="78px" height="14px" />
          <Skeleton width="16px" height="16px" />
        </div>
      {/each}
    </div>
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
      <div class="flex flex-col gap-1.75 min-w-0">
        {#each filteredMatches as m (m.id)}
          <div
            class="flex items-center gap-4 bg-s1 border border-bd rounded-lg p-[14px_18px] cursor-pointer transition-all hover:border-bd2 hover:bg-s2"
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && uiStore.openMatchDetail(m)}
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
                    class="flex items-center justify-center w-6.5 h-6.5 rounded-full text-sm font-extrabold shrink-0 leading-none {m.outcome ===
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
                      class="flex items-center justify-center w-3.5 h-3.5 rounded-[3px] text-[10px] font-extrabold leading-none shrink-0
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
                <ToolTip text={m.role ?? 'Unknown'}>
                  <LaneIcon lane={m.lane} size="w-5 h-5" />
                </ToolTip>
              </div>
              <div class="text-xs text-tx3 mt-0.5">{m.mode ?? 'Unknown'}</div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              {#if m.items?.length}
                {#each m.items.slice(0, 6) as item, i (i)}
                  {#if item}
                    <div class="w-7.5 h-7.5 rounded bg-s2 overflow-hidden">
                      <img src={item} alt="" class="w-full h-full object-cover" />
                    </div>
                  {/if}
                {/each}
              {/if}
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div
                class="text-sm font-semibold w-13 text-center text-tx2 font-mono font-tabular leading-tight"
              >
                {m.k ?? 0}/{m.d ?? 0}/{m.a ?? 0}
                <span
                  class="block text-xxs font-medium text-tx3 mt-px font-sans uppercase tracking-[0.4px]"
                  >KDA</span
                >
              </div>
              <div
                class="text-sm font-semibold w-10 text-center text-tx2 font-mono font-tabular leading-tight"
              >
                {m.gpm ?? 0}
                <span
                  class="block text-xxs font-medium text-tx3 mt-px font-sans uppercase tracking-[0.4px]"
                  >GPM</span
                >
              </div>
              <div
                class="text-sm font-semibold w-13 text-center text-tx2 font-mono font-tabular leading-tight"
              >
                {m.dur ?? '0:00'}
                <span
                  class="block text-xxs font-medium text-tx3 mt-px font-sans uppercase tracking-[0.4px]"
                  >Duration</span
                >
              </div>
            </div>
            <div class="text-xs text-tx3 w-19.5 text-right shrink-0">{m.ago ?? ''}</div>
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
