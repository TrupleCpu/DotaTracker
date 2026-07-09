<script lang="ts">
  import { playerStore } from '../lib/playStore.svelte'

  let searchQuery = $state('')
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

  let sortedAndFiltered = $derived.by(() => {
    let list = playerStore.allTeammates.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    list.sort((a, b) => {
      const valA = a[sortBy as keyof typeof a] as number
      const valB = b[sortBy as keyof typeof b] as number
      return (valA - valB) * sortDir
    })
    return list
  })
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex items-center gap-1.5 mb-3 bg-s1 border border-bd rounded-lg p-2.5">
    <div class="relative max-w-xs flex-1">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search teammates…"
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

    <select bind:value={sortBy} class="sel-pill">
      <option value="matches">Sort: Matches</option>
      <option value="winrate">Sort: Win Rate</option>
      <option value="name">Sort: Name</option>
    </select>

    <div class="flex-1"></div>
    <span class="text-xs text-tx3 font-semibold tabular-nums">{sortedAndFiltered.length} teammates</span>
  </div>

  <div class="card p-0 overflow-x-auto">
    <table class="w-full border-collapse min-w-0">
      <thead>
        <tr class="border-b border-bd">
          <th
            class="text-left p-[9px_14px] text-xs font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('name')}>Player</th
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
        </tr>
      </thead>
      <tbody>
        {#each sortedAndFiltered as t (t.steamAccountId)}
          <tr class="border-b border-bd last:border-b-0 group">
            <td class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02]">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-md bg-s4 border border-bd flex items-center justify-center text-xs shrink-0 overflow-hidden"
                >
                  {#if t.avatar}
                    <img src={t.avatar} alt={t.name} class="w-full h-full object-cover" />
                  {:else}
                    <span class="text-tx3 text-xs font-bold">{t.name.slice(0, 2).toUpperCase()}</span>
                  {/if}
                </div>
                <strong>{t.name}</strong>
              </div>
            </td>
            <td class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02]"
              ><strong>{t.matches}</strong></td
            >
            <td class="p-[10px_14px] text-sm vertical-middle group-hover:bg-white/[0.02]">
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-[10px] shrink-0 {t.winrate >= 60
                  ? 'bg-grb text-gr'
                  : t.winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}">{t.winrate}%</span
              >
              <div class="h-1 bg-s3 rounded-sm overflow-hidden mt-1.25">
                <div
                  class="h-full rounded-sm"
                  style="width: {t.winrate}%; background: {t.winrate >= 60
                    ? 'var(--color-gr)'
                    : t.winrate >= 50
                      ? 'var(--color-gd)'
                      : 'var(--color-rd)'}"
                ></div>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
