<script lang="ts">
  import { playerStore, heroMap } from '../lib/playStore.svelte'
  import { getHeroImgUrl } from '../utils/heroMap'

  let searchQuery = $state('')
  let selectedRole = $state('All Roles')
  let sortBy = $state('matches')
  let sortDir = $state(-1)

  function toggleSort(field: string) {
    if (sortBy === field) {
      sortDir = -sortDir
    } else {
      sortBy = field
      sortDir = -1
    }
  }

  let toast = $state({ show: false, msg: '', type: '' })
  let toastTimer: any

  function showToast(msg: string, type = 'ok') {
    toast = { show: true, msg, type }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.show = false
    }, 2600)
  }

  let heroList = $derived.by(() => {
    return playerStore.allHeroStats.map((h: any) => {
      const hero = heroMap.get(h.heroId)
      const winrate = h.matchCount > 0 ? +((h.winCount / h.matchCount) * 100).toFixed(1) : 0
      const kda = h.avgDeaths > 0 ? +((h.avgKills + h.avgAssists) / h.avgDeaths).toFixed(1) : h.avgKills + h.avgAssists
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
      const valA = a[sortBy as keyof typeof a]
      const valB = b[sortBy as keyof typeof b]
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * sortDir
      }
      return String(valA).localeCompare(String(valB)) * sortDir
    })

    return list
  })

  let unplayedHeroes = $derived.by(() => {
    const playedIds = new Set(playerStore.allHeroStats.map((h: any) => h.heroId))
    return [...heroMap.values()].filter((h) => !playedIds.has(h.id))
  })
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex items-center gap-1.5 mb-3 bg-s1 border border-bd rounded-lg p-2.5">
    <div class="relative max-w-xs flex-1">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search heroes…"
        class="w-full bg-s2 border border-bd rounded-[5px] text-tx2 p-[5px_10px_5px_26px] text-xs font-semibold outline-hidden focus:border-pu transition-colors placeholder:text-tx3"
      />
      <svg
        class="absolute left-[8px] top-1/2 -translate-y-1/2"
        width="12" height="12" viewBox="0 0 16 16" fill="var(--color-tx3)"
      >
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
      </svg>
    </div>

    <div class="w-px h-5 bg-bd shrink-0"></div>

    <select bind:value={selectedRole} class="sel-pill">
      <option>All Roles</option>
      <option>Carry</option>
      <option>Mid</option>
      <option>Offlane</option>
      <option>Soft Support</option>
      <option>Hard Support</option>
    </select>

    <select bind:value={sortBy} class="sel-pill">
      <option value="matches">Sort: Matches</option>
      <option value="winrate">Sort: Win Rate</option>
      <option value="kda">Sort: KDA</option>
      <option value="gpm">Sort: GPM</option>
    </select>

    <div class="flex-1"></div>
    <span class="text-xs text-tx3 font-semibold tabular-nums">{sortedAndFilteredHeroes.length} heroes</span>
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
            onclick={() => showToast(`${h.name} hero detail — coming soon`, 'ok')}
          >
            <td class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02]">
              <div class="flex items-center gap-2.5">
                  <div
                    class="w-10 h-10 rounded bg-s2 border border-bd/40 flex items-center justify-center shrink-0 overflow-hidden"
                  >
                  {#if h.icon}
                    <img src={getHeroImgUrl(h.icon)} alt={h.name} class="w-full h-full object-cover" />
                  {/if}
                </div>
                <strong>{h.name}</strong>
              </div>
            </td>
            <td class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02]"
              ><strong>{h.matches}</strong></td
            >
            <td class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02]">
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-[10px] shrink-0 {h.winrate >= 60
                  ? 'bg-grb text-gr'
                  : h.winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}">{h.winrate}%</span
              >
              <div class="h-1 bg-s3 rounded-sm overflow-hidden mt-1.25">
                <div
                  class="h-full rounded-sm"
                  style="width: {h.winrate}%; background: {h.winrate >= 60
                    ? 'var(--color-gr)'
                    : h.winrate >= 50
                      ? 'var(--color-gd)'
                      : 'var(--color-rd)'}"
                ></div>
              </div>
            </td>
            <td
              class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02] font-mono font-bold text-pu2 font-tabular"
              >{h.kda}</td
            >
            <td
              class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02] font-mono font-bold text-gd font-tabular"
              >{h.gpm}</td
            >
            <td class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02]"
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
          <div
            class="w-10 h-10 rounded bg-s2 border border-bd/40 overflow-hidden"
          >
            <img
              src={getHeroImgUrl(hero.icon)}
              alt={hero.localized_name}
              class="w-full h-full object-contain opacity-60 p-0.5"
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

{#if toast.show}
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
{/if}
