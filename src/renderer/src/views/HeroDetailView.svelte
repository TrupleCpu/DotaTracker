<script lang="ts">
  import { playerStore } from '../stores/playerStore.svelte'
  import { uiStore } from '../stores/uiStore.svelte'
  import { getHero, getHeroImgUrl } from '../utils/heroMap'
  import { formatDuration, formatGameMode, formatTimeAgo, formatRole } from '../utils/matchHelper'
  import LoadingSpinner from '../lib/ui/LoadingSpinner.svelte'
  import ToolTip from '../lib/ui/ToolTip.svelte'
  import type { RawHeroMatch, RawMatchPlayer } from '../types/api'
  import type { Match, HeroStat } from '../types'

  let { heroId } = $props<{ heroId: number }>()

  let allMatches = $state<Match[]>([])
  let loading = $state(false)
  let isLoadingMore = $state(false)
  let error = $state<string | null>(null)
  let loadedCount = $state(0)

  let heroData = $derived(getHero(heroId))

  // Find the aggregate stats for this hero from playerStore
  let heroStats = $derived.by(() => {
    return (
      playerStore.allHeroStats.find((h: HeroStat) => h.heroId === heroId) || {
        matchCount: 0,
        winCount: 0,
        avgKills: 0,
        avgDeaths: 0,
        avgAssists: 0
      }
    )
  })

  let winrate = $derived(
    heroStats.matchCount > 0 ? ((heroStats.winCount / heroStats.matchCount) * 100).toFixed(1) : '0'
  )
  let kda = $derived(
    heroStats.avgDeaths > 0
      ? ((heroStats.avgKills + heroStats.avgAssists) / heroStats.avgDeaths).toFixed(1)
      : (heroStats.avgKills + heroStats.avgAssists).toFixed(1)
  )

  let hasMore = $derived(loadedCount < heroStats.matchCount)

  async function fetchChunk(skip: number): Promise<Match[]> {
    const steamId = playerStore.steamId
    if (!steamId) return []

    const result = await window.api.fetchHeroMatches(steamId.toString(), heroId, skip, 20)
    if (result && typeof result === 'object' && 'err' in result) {
      throw new Error((result as { err: string }).err)
    }
    const rawMatches = (result as { player?: { matches?: RawHeroMatch[] } })?.player?.matches
    if (!Array.isArray(rawMatches)) throw new Error('Unexpected response from server.')
    return mapMatches(rawMatches)
  }

  async function fetchInitial(): Promise<void> {
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

  function getLaneOutcome(m: RawHeroMatch & RawMatchPlayer): string | null {
    if (!m.lane) return null
    if (m.lane === 'POSITION_1' || m.lane === 'POSITION_5') {
      return m.isRadiant ? m.bottomLaneOutcome : m.topLaneOutcome
    }
    if (m.lane === 'POSITION_3' || m.lane === 'POSITION_4') {
      return m.isRadiant ? m.topLaneOutcome : m.bottomLaneOutcome
    }
    if (m.lane === 'POSITION_2') return m.midLaneOutcome
    return null
  }

  function mapMatches(rawMatches: RawHeroMatch[]): Match[] {
    return rawMatches.map((match: RawHeroMatch) => {
      const playerData = (match.players?.[0] ?? {}) as Partial<RawMatchPlayer>
      const items = ['item0Id', 'item1Id', 'item2Id', 'item3Id', 'item4Id', 'item5Id']
        .map((slot) => playerData[slot])
        .filter(Boolean)
        .map((id: number) => `item-asset://images/${id}.png`)

      const outcomeStr = getLaneOutcome({ ...match, ...playerData } as RawHeroMatch &
        RawMatchPlayer)
      let laneResult = null
      if (outcomeStr === 'WON' || outcomeStr === 'STOMPED') laneResult = 'won'
      else if (outcomeStr === 'LOST' || outcomeStr === 'STOMPED_AGAINST') laneResult = 'lost'
      else if (outcomeStr === 'DRAW') laneResult = 'tie'

      const hero = playerData.heroId ? getHero(playerData.heroId) : null

      return {
        id: match.id,
        hero: hero?.localized_name ?? `Hero #${playerData.heroId}`,
        outcome: playerData.isVictory ? 'win' : 'loss',
        laneResult,
        mode: formatGameMode(match.gameMode),
        role: formatRole(playerData.position, playerData.lane),
        k: playerData.kills ?? 0,
        d: playerData.deaths ?? 0,
        a: playerData.assists ?? 0,
        gpm: match.durationSeconds ? Math.floor(playerData.goldPerMinute ?? 0) : 0,
        xpm: 0,
        lane: playerData.lane ?? '',
        dur: formatDuration(match.durationSeconds ?? 0),
        ago: formatTimeAgo(match.endDateTime),
        items,
        ...match // keep raw match data for MatchDetailView
      }
    })
  }

  $effect(() => {
    // Re-fetch when heroId changes
    if (heroId) fetchInitial()
  })
</script>

<div class="flex flex-col h-full overflow-hidden select-none">
  <div class="shrink-0 p-4 border-b border-bd bg-s1">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 rounded-lg bg-s2 border border-bd/40 overflow-hidden shrink-0">
        {#if heroData?.img}
          <img
            src={getHeroImgUrl(heroData.img)}
            alt={heroData.localized_name}
            class="w-full h-full object-cover"
          />
        {/if}
      </div>
      <div>
        <div class="text-xl font-bold text-tx">{heroData?.localized_name ?? 'Unknown Hero'}</div>
        <div class="flex items-center gap-3 mt-1 text-sm">
          <div>
            <span class="text-tx3">Matches:</span>
            <span class="font-bold text-tx2">{heroStats.matchCount}</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-tx3"></div>
          <div>
            <span class="text-tx3">Win Rate:</span>
            <span class="font-bold text-tx2 {Number(winrate) >= 50 ? 'text-gr' : 'text-rd'}"
              >{winrate}%</span
            >
          </div>
          <div class="w-1 h-1 rounded-full bg-tx3"></div>
          <div>
            <span class="text-tx3">KDA:</span> <span class="font-bold text-pu2">{kda}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-bg">
    {#if loading && allMatches.length === 0}
      <LoadingSpinner text="Loading hero matches…" />
    {:else if error && allMatches.length === 0}
      <div class="flex flex-col items-center justify-center gap-3 py-16 text-sm">
        <span class="text-rd">{error}</span>
        <button
          class="sel-pill px-3 py-1 text-sm font-semibold cursor-pointer hover:bg-s3"
          onclick={fetchInitial}>Retry</button
        >
      </div>
    {:else if allMatches.length === 0}
      <div class="flex items-center justify-center py-16 text-sm text-tx3">No matches found.</div>
    {:else}
      <div class="flex flex-col gap-1.75 min-w-0" class:opacity-50={loading}>
        {#each allMatches as m (m.id)}
          <div
            class="flex items-center gap-4 bg-s1 border border-bd rounded-lg p-[14px_18px] cursor-pointer transition-all hover:border-bd2 hover:bg-s2"
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && uiStore.openMatchDetail(m)}
            onclick={() => uiStore.openMatchDetail(m)}
          >
            <div class="min-w-0 flex-1 pl-1">
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
                {#if m.laneResult}
                  <ToolTip
                    text={m.laneResult === 'won'
                      ? 'Lane won'
                      : m.laneResult === 'tie'
                        ? 'Lane tied'
                        : 'Lane lost'}
                  >
                    <span
                      class="flex items-center justify-center w-3.5 h-3.5 rounded-[3px] text-[10px] font-extrabold leading-none shrink-0 {m.laneResult ===
                      'won'
                        ? 'text-gr bg-grb'
                        : m.laneResult === 'tie'
                          ? 'text-gd bg-gdb'
                          : 'text-rd bg-rdb'}"
                    >
                      {m.laneResult === 'won' ? '+' : m.laneResult === 'tie' ? '~' : '−'}
                    </span>
                  </ToolTip>
                {/if}
                <span class="text-sm font-bold truncate">{m.role ?? 'Unknown'}</span>
                <span
                  class="text-xxs text-tx3 uppercase tracking-wide px-1.5 py-px rounded bg-s2 shrink-0"
                  >{m.mode ?? 'Unknown'}</span
                >
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              {#if m.items?.length}
                {#each m.items.slice(0, 6) as item (item)}
                  <div class="w-7.5 h-7.5 rounded bg-s2 overflow-hidden border border-bd/40">
                    <img src={item} alt="" class="w-full h-full object-cover" />
                  </div>
                {/each}
              {/if}
            </div>

            <div class="flex items-center gap-4 shrink-0 px-2">
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
</div>
