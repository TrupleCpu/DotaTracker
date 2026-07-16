<script lang="ts">
  import { playerStore } from '../stores/playerStore.svelte'
  import SearchInput from '../lib/ui/SearchInput.svelte'
  import WinrateBadge from '../lib/ui/WinrateBadge.svelte'
  import ProgressBar from '../lib/ui/ProgressBar.svelte'

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

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  <div class="flex items-center gap-1.5 mb-3 bg-s1 border border-bd rounded-lg p-2.5">
    <SearchInput value={searchQuery} placeholder="Search teammates…" />
    <div class="w-px h-5 bg-bd shrink-0"></div>
    <select bind:value={sortBy} class="sel-pill">
      <option value="matches">Sort: Matches</option>
      <option value="winrate">Sort: Win Rate</option>
      <option value="name">Sort: Name</option>
    </select>
    <div class="flex-1"></div>
    <span class="text-xs text-tx3 font-semibold tabular-nums"
      >{sortedAndFiltered.length} teammates</span
    >
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
            <td class="p-[10px_14px] text-sm group-hover:bg-white/[0.02]">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-md bg-s4 border border-bd flex items-center justify-center text-xs shrink-0 overflow-hidden"
                >
                  {#if t.avatar}
                    <img src={t.avatar} alt={t.name} class="w-full h-full object-cover" />
                  {:else}
                    <span class="text-tx3 text-xs font-bold"
                      >{t.name.slice(0, 2).toUpperCase()}</span
                    >
                  {/if}
                </div>
                <strong>{t.name}</strong>
              </div>
            </td>
            <td class="p-[10px_14px] text-sm group-hover:bg-white/[0.02]"
              ><strong>{t.matches}</strong></td
            >
            <td class="p-[10px_14px] text-sm group-hover:bg-white/[0.02]">
              <WinrateBadge value={t.winrate} />
              <ProgressBar
                value={t.winrate}
                color={t.winrate >= 60
                  ? 'var(--color-gr)'
                  : t.winrate >= 50
                    ? 'var(--color-gd)'
                    : 'var(--color-rd)'}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
