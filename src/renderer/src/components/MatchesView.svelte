<script lang="ts">
  import type { MockMatch } from '../utils/mockData'
  import { getHeroByName, getHero, getHeroImgUrl } from '../utils/heroMap'
  import { playerStore } from '../lib/playStore.svelte'
  import { formatDuration, formatGameMode, formatTimeAgo, formatRole } from '../utils/matchHelper'
  import itemsData from '../../../main/data/items.json'

  const ROLE_OPTIONS = ['All Roles', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support']
  const MODE_OPTIONS = ['All Modes', 'Normal', 'Ranked', 'Turbo']

  interface Props {
    openMatchDetail: (match: MockMatch) => void
  }
  let { openMatchDetail }: Props = $props()

  let selectedHero = $state('All Heroes')
  let selectedResult = $state('All Results')
  let selectedMode = $state('All Modes')
  let selectedRole = $state('All Roles')

  let allMatches = $state<MockMatch[]>([])
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

  const itemMap = new Map<number, string>()
  for (const val of Object.values(itemsData) as Array<{ id: number; img: string }>) {
    if (val.id != null && val.img) {
      itemMap.set(val.id, val.img.replace('item-assets/', ''))
    }
  }

  function getItemImgUrl(itemId: number): string {
    const filename = itemMap.get(itemId)
    return filename ? `item-asset://${filename}` : ''
  }

  function getHeroSrc(heroName: string): string {
    const h = getHeroByName(heroName)
    return h ? getHeroImgUrl(h.img) : ''
  }

  function buildOptions(skip: number = 0): Record<string, unknown> {
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

    if (selectedMode === 'Ranked') {
      options.lobbyTypeIds = [7]
    } else if (selectedMode === 'Turbo') {
      options.gameModeIds = [23]
    } else if (selectedMode === 'Normal') {
      options.lobbyTypeIds = [0]
    }

    return options
  }

  async function fetchChunk(skip: number): Promise<MockMatch[]> {
    const steamId = playerStore.steamId
    if (!steamId) return []

    const result = await window.api.fetchAllMatches(steamId, buildOptions(skip))

    if (result && typeof result === 'object' && 'err' in result) {
      throw new Error((result as { err: string }).err)
    }

    const rawMatches = (result as any)?.player?.matches
    if (!Array.isArray(rawMatches)) {
      throw new Error('Unexpected response from server.')
    }

    return mapMatches(result)
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

  function mapMatches(raw: unknown): MockMatch[] {
    const rawMatches = (raw as any)?.player?.matches ?? []

    return rawMatches.map((match: any): MockMatch => {
      const playerData = match.players?.[0] ?? {}
      const hero = getHero(playerData.heroId)
      const items = [
        playerData.item0Id,
        playerData.item1Id,
        playerData.item2Id,
        playerData.item3Id,
        playerData.item4Id,
        playerData.item5Id
      ]
        .filter(Boolean)
        .map((id: number) => getItemImgUrl(id))

      return {
        id: match.id,
        icon: '',
        hero: hero?.localized_name ?? `Hero #${playerData.heroId}`,
        outcome: playerData.isVictory ? 'win' : 'loss',
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
        lh: '0/0',
        nw: '0',
        level: 0,
        dur: formatDuration(match.durationSeconds ?? 0),
        ago: formatTimeAgo(match.endDateTime),
        items
      }
    })
  }

  $effect(() => {
    ;(selectedMode, selectedRole, playerStore.steamId)
    if (playerStore.steamId) {
      fetchInitial()
    }
  })
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex items-center gap-1.5 mb-4 bg-s1 border border-bd rounded-lg p-2.5">
    <select bind:value={selectedHero} class="sel-pill">
      <option>All Heroes</option>
      {#each heroes as h}
        <option>{h}</option>
      {/each}
    </select>
    <select bind:value={selectedResult} class="sel-pill">
      <option>All Results</option>
      <option>Wins Only</option>
      <option>Losses Only</option>
    </select>
    <select bind:value={selectedMode} class="sel-pill">
      <option>All Modes</option>
      {#each MODE_OPTIONS as mo}
        {#if mo !== 'All Modes'}
          <option>{mo}</option>
        {/if}
      {/each}
    </select>
    <select bind:value={selectedRole} class="sel-pill">
      <option>All Roles</option>
      {#each ROLE_OPTIONS as r}
        {#if r !== 'All Roles'}
          <option>{r}</option>
        {/if}
      {/each}
    </select>
    <div class="flex-1"></div>
    <span class="text-xs text-tx3 font-semibold tabular-nums"
      >{filteredMatches.length} / {totalMatches} matches</span
    >
  </div>

  {#if loading && allMatches.length === 0}
    <div class="flex items-center justify-center py-16 text-sm text-tx3">Loading matches…</div>
  {:else if error && allMatches.length === 0}
    <div class="flex flex-col items-center justify-center gap-3 py-16 text-sm">
      <span class="text-rd">{error}</span>
      <button
        class="sel-pill px-3 py-1 text-sm font-semibold cursor-pointer hover:bg-s3"
        onclick={() => fetchInitial()}>Retry</button
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
            onclick={() => openMatchDetail(m)}
          >
            <div class="w-16 h-14 rounded-lg bg-s2 shrink-0 overflow-hidden">
              <img
                src={getHeroSrc(m.hero)}
                alt={m.hero}
                class="w-full h-full object-cover"
                onerror={(e) => {
                  e.currentTarget.src = '/placeholder-hero.png'
                }}
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span
                  class="flex items-center justify-center w-[26px] h-[26px] rounded-full text-sm font-extrabold shrink-0 leading-none {m.outcome ===
                  'win'
                    ? 'text-gr bg-grb'
                    : 'text-rd bg-rdb'}"
                >
                  {m.outcome === 'win' ? 'W' : 'L'}
                </span>
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
                {#each m.items as item, i}
                  {#if item && i < 6}
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
