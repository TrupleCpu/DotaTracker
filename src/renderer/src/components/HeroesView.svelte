<script lang="ts">
  import { HEROES } from '../utils/mockData'

  let searchQuery = $state('')
  let selectedRole = $state('All Roles')
  let sortBy = $state('matches')
  let sortDir = $state(-1) // -1 for desc, 1 for asc

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

  let sortedAndFilteredHeroes = $derived.by(() => {
    let list = HEROES.filter((h) => {
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
      return 0
    })

    return list
  })
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- TOOLBAR -->
  <div class="flex items-center gap-2.5 mb-3">
    <div class="relative w-[210px]">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search heroes…"
        class="bg-s1 border border-bd rounded-lg color-tx p-[7px_10px_7px_30px] text-[12px] w-full outline-hidden focus:border-pu transition-colors placeholder:text-tx3"
      />
      <div class="absolute left-[9px] top-1/2 -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          fill="#4A5270"
          viewBox="0 0 16 16"
        >
          <path
            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"
          />
        </svg>
      </div>
    </div>

    <select bind:value={selectedRole} class="sel bg-s1">
      <option>All Roles</option>
      <option>Core</option>
      <option>Support</option>
      <option>Mid</option>
      <option>Offlane</option>
    </select>

    <select bind:value={sortBy} class="sel bg-s1">
      <option value="matches">Sort: Matches</option>
      <option value="winrate">Sort: Win Rate</option>
      <option value="kda">Sort: KDA</option>
      <option value="gpm">Sort: GPM</option>
    </select>

    <div class="flex-1"></div>
    <span class="text-[11.5px] text-tx3">{sortedAndFilteredHeroes.length} heroes</span>
  </div>

  <!-- TABLE -->
  <div class="card p-0 overflow-hidden">
    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b border-bd">
          <th
            class="text-left p-[9px_14px] text-[10px] font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('name')}>Hero</th
          >
          <th
            class="text-left p-[9px_14px] text-[10px] font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('matches')}
            >Matches {sortBy === 'matches' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-[10px] font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('winrate')}
            >Win Rate {sortBy === 'winrate' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-[10px] font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('kda')}
            >KDA {sortBy === 'kda' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-[10px] font-bold text-tx3 uppercase tracking-[0.7px] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-tx2"
            onclick={() => toggleSort('gpm')}
            >GPM {sortBy === 'gpm' ? (sortDir === -1 ? '↓' : '↑') : ''}</th
          >
          <th
            class="text-left p-[9px_14px] text-[10px] font-bold text-tx3 uppercase tracking-[0.7px] whitespace-nowrap"
            >Role</th
          >
        </tr>
      </thead>
      <tbody>
        {#each sortedAndFilteredHeroes as h}
          <tr
            class="border-b border-bd last:border-b-0 group cursor-pointer"
            onclick={() => showToast(`${h.name} hero detail — coming soon`, 'ok')}
          >
            <td class="p-[10px_14px] text-[12.5px] vertical-middle group-hover:bg-white/[0.018]">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-sm bg-s2 flex items-center justify-center text-[16px] shrink-0"
                >
                  {h.icon}
                </div>
                <strong>{h.name}</strong>
              </div>
            </td>
            <td class="p-[10px_14px] text-[12.5px] vertical-middle group-hover:bg-white/[0.018]"
              ><strong>{h.matches}</strong></td
            >
            <td class="p-[10px_14px] text-[12.5px] vertical-middle group-hover:bg-white/[0.018]">
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-[10px] shrink-0 {h.winrate >= 60
                  ? 'bg-grb text-gr'
                  : h.winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}">{h.winrate}%</span
              >
              <div class="h-1 bg-s3 rounded-sm overflow-hidden mt-1.25 max-w-[84px]">
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
              class="p-[10px_14px] text-[12.5px] vertical-middle group-hover:bg-white/[0.018] font-mono text-[13px] font-bold text-pu2"
              >{h.kda}</td
            >
            <td
              class="p-[10px_14px] text-[12.5px] vertical-middle group-hover:bg-white/[0.018] font-mono text-[13px] font-bold text-gd"
              >{h.gpm}</td
            >
            <td class="p-[10px_14px] text-[12.5px] vertical-middle group-hover:bg-white/[0.018]"
              ><span class="badge">{h.role}</span></td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if toast.show}
  <div
    id="toast"
    class="fixed bottom-5 right-5 bg-s4 border border-bd2 rounded-lg px-[15px] py-[9px] text-[12.5px] font-semibold text-tx z-[9999] transition-all duration-200 pointer-events-none min-w-[160px] {toast.show
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
