<script lang="ts">
  import { playerStore, heroMap } from '../stores/playerStore.svelte'
  import { getHeroImgUrl } from '../utils/heroMap'
  import SearchInput from '../lib/ui/SearchInput.svelte'
  import WinrateBadge from '../lib/ui/WinrateBadge.svelte'
  import ProgressBar from '../lib/ui/ProgressBar.svelte'
  import Toast from '../lib/ui/Toast.svelte'
  import { uiStore } from '../stores/uiStore.svelte'
  import type { HeroGroupByEntry } from '../types/api'

  let searchQuery = $state('')
  let selectedRole = $state('All Roles')
  type HeroListEntry = {
    id: number
    icon: string
    name: string
    matches: number
    winrate: number
    kda: number
    gpm: number
    role: string
  }

  let sortBy = $state<keyof HeroListEntry>('matches')
  let sortDir = $state(-1)

  function toggleSort(field: keyof HeroListEntry): void {
    if (sortBy === field) sortDir = -sortDir
    else {
      sortBy = field
      sortDir = -1
    }
  }

  let heroList = $derived.by(() => {
    return playerStore.allHeroStats.map((h: HeroGroupByEntry) => {
      const hero = heroMap.get(h.heroId)
      const winrate = h.matchCount > 0 ? +((h.winCount / h.matchCount) * 100).toFixed(1) : 0
      const kda =
        h.avgDeaths > 0
          ? +((h.avgKills + h.avgAssists) / h.avgDeaths).toFixed(1)
          : h.avgKills + h.avgAssists
      return {
        id: h.heroId,
        icon: hero?.img ?? '',
        name: hero?.localized_name ?? `Hero #${h.heroId}`,
        matches: h.matchCount,
        winrate,
        kda,
        gpm: h.avgGoldPerMinute ?? 0,
        role: playerStore.heroRoleMap.get(h.heroId) ?? 'Unknown'
      }
    })
  })

  let sortedAndFilteredHeroes = $derived.by(() => {
    let list = heroList.filter((h) => {
      const matchQuery = h.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchRole = selectedRole === 'All Roles' || h.role === selectedRole
      return matchQuery && matchRole
    })
    list.sort((a, b) => {
      const valA = a[sortBy]
      const valB = b[sortBy]
      if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * sortDir
      return String(valA).localeCompare(String(valB)) * sortDir
    })
    return list
  })

  let unplayedHeroes = $derived.by(() => {
    const playedIds = new Set(playerStore.allHeroStats.map((h: HeroGroupByEntry) => h.heroId))
    return [...heroMap.values()].filter((h) => !playedIds.has(h.id))
  })
</script>

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  <div class="flex items-center gap-1.5 mb-3 bg-s1 border border-bd rounded-lg p-2.5">
    <SearchInput value={searchQuery} placeholder="Search heroes…" />
    <div class="w-px h-5 bg-bd shrink-0"></div>
    <select bind:value={selectedRole} class="sel-pill">
      <option>All Roles</option>
      <option>Carry</option><option>Mid</option><option>Offlane</option><option>Soft Support</option
      ><option>Hard Support</option>
    </select>
    <select bind:value={sortBy} class="sel-pill">
      <option value="matches">Sort: Matches</option>
      <option value="winrate">Sort: Win Rate</option>
      <option value="kda">Sort: KDA</option>
      <option value="gpm">Sort: GPM</option>
    </select>
    <div class="flex-1"></div>
    <span class="text-xs text-tx3 font-semibold tabular-nums"
      >{sortedAndFilteredHeroes.length} heroes</span
    >
  </div>

  <div class="card p-0 overflow-x-auto">
    <table class="w-full border-collapse min-w-0">
      <thead>
        <tr class="border-b border-bd">
          <th
            class="text-left p-[9px_14px] text-xs font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('name')}>Hero</th
          >
          <th
            class="text-left p-[9px_14px] text-xs font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('matches')}
            >Matches {sortBy === 'matches' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-xs font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('winrate')}
            >Win Rate {sortBy === 'winrate' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-xs font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('kda')}
            >KDA {sortBy === 'kda' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-xs font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('gpm')}
            >GPM {sortBy === 'gpm' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-xs font-bold text-tx3 uppercase tracking-[0.7px] whitespace-nowrap"
            >Role</th
          >
        </tr>
      </thead>
      <tbody>
        {#each sortedAndFilteredHeroes as h (h.id)}
          <tr
            class="border-b border-bd last:border-b-0 group cursor-pointer"
            onclick={() => uiStore.openHeroDetail(h.id)}
          >
            <td class="p-[10px_14px] text-sm group-hover:bg-white/2">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded bg-s2 border border-bd/40 overflow-hidden shrink-0">
                  {#if h.icon}
                    <img
                      src={getHeroImgUrl(h.icon)}
                      alt={h.name}
                      class="w-full h-full object-cover"
                    />
                  {/if}
                </div>
                <strong>{h.name}</strong>
              </div>
            </td>
            <td class="p-[10px_14px] text-sm group-hover:bg-white/2"
              ><strong>{h.matches}</strong></td
            >
            <td class="p-[10px_14px] text-sm group-hover:bg-white/2">
              <WinrateBadge value={h.winrate} />
              <ProgressBar
                value={h.winrate}
                color={h.winrate >= 60
                  ? 'var(--color-gr)'
                  : h.winrate >= 50
                    ? 'var(--color-gd)'
                    : 'var(--color-rd)'}
              />
            </td>
            <td
              class="p-[10px_14px] text-sm group-hover:bg-white/2 font-mono font-bold text-pu2 font-tabular"
              >{h.kda}</td
            >
            <td
              class="p-[10px_14px] text-sm group-hover:bg-white/2 font-mono font-bold text-gd font-tabular"
              >{h.gpm}</td
            >
            <td class="p-[10px_14px] text-sm group-hover:bg-white/2"
              ><span class="badge">{h.role}</span></td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if unplayedHeroes.length > 0}
    <div class="card p-4 mt-3">
      <div
        class="text-xs font-bold uppercase tracking-wider text-tx3 pb-3 border-b border-bd/40 mb-3"
      >
        Unplayed Heroes ({unplayedHeroes.length})
      </div>
      <div class="flex flex-wrap gap-1.5">
        {#each unplayedHeroes as hero (hero.id)}
          <div class="w-10 h-10 rounded bg-s2 border border-bd/40 overflow-hidden">
            <img
              src={getHeroImgUrl(hero.img)}
              alt={hero.localized_name}
              class="w-full h-full object-contain opacity-60 p-0.5"
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<Toast />
