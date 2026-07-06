<script lang="ts">
  import { MATCHES, type MockMatch } from '../utils/mockData'
  import { getHeroByName, getHeroImgUrl } from '../utils/heroMap'

  interface Props {
    openMatchDetail: (match: MockMatch) => void
  }
  let { openMatchDetail }: Props = $props()

  let selectedHero = $state('All Heroes')
  let selectedResult = $state('All Results')
  let selectedMode = $state('All Modes')
  let selectedRole = $state('All Roles')

  let filteredMatches = $derived.by(() => {
    return MATCHES.filter(m => {
      if (selectedHero !== 'All Heroes' && m.hero !== selectedHero) return false
      if (selectedResult === 'Wins Only' && m.outcome !== 'win') return false
      if (selectedResult === 'Losses Only' && m.outcome !== 'loss') return false
      if (selectedMode !== 'All Modes' && m.mode !== selectedMode) return false
      if (selectedRole !== 'All Roles' && m.role !== selectedRole) return false
      return true
    })
  })

  let heroes = $derived([...new Set(MATCHES.map(m => m.hero))])
  let modes = $derived([...new Set(MATCHES.map(m => m.mode))])
  let roles = $derived([...new Set(MATCHES.map(m => m.role))])

  function getHeroSrc(heroName: string): string {
    const h = getHeroByName(heroName)
    return h ? getHeroImgUrl(h.icon) : ''
  }
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- FILTER BAR -->
  <div class="flex items-center gap-2.5 mb-4">
    <select bind:value={selectedHero} class="bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-sm text-tx2 outline-none cursor-pointer hover:border-zinc-700/80 focus:border-zinc-600/80">
      <option>All Heroes</option>
      {#each heroes as h}
        <option>{h}</option>
      {/each}
    </select>
    <select bind:value={selectedResult} class="bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-sm text-tx2 outline-none cursor-pointer hover:border-zinc-700/80 focus:border-zinc-600/80">
      <option>All Results</option>
      <option>Wins Only</option>
      <option>Losses Only</option>
    </select>
    <select bind:value={selectedMode} class="bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-sm text-tx2 outline-none cursor-pointer hover:border-zinc-700/80 focus:border-zinc-600/80">
      <option>All Modes</option>
      {#each modes as mo}
        <option>{mo}</option>
      {/each}
    </select>
    <select bind:value={selectedRole} class="bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-sm text-tx2 outline-none cursor-pointer hover:border-zinc-700/80 focus:border-zinc-600/80">
      <option>All Roles</option>
      {#each roles as r}
        <option>{r}</option>
      {/each}
    </select>
    <div class="flex-1"></div>
    <span class="text-sm text-tx3">{filteredMatches.length} matches shown</span>
  </div>

  <!-- MATCHES LIST -->
  <div class="flex flex-col gap-[7px]">
    {#each filteredMatches as m}
      <div
        class="flex items-center gap-3 bg-s1 border border-bd rounded-lg p-[10px_14px] cursor-pointer transition-all hover:border-bd2 hover:bg-s2 hover:translate-x-0.5 {m.outcome === 'win' ? 'bg-emerald-500/[0.03] border-emerald-500/10' : 'bg-rose-500/[0.03] border-rose-500/10'}"
        onclick={() => openMatchDetail(m)}
      >
        <!-- Hero Portrait -->
        <img
          src={getHeroSrc(m.hero)}
          alt={m.hero}
          class="w-12 h-12 rounded-lg bg-s2 shrink-0 object-cover"
        />

        <!-- Outcome Circle + Hero Name + Role -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span
              class="flex items-center justify-center w-[22px] h-[22px] rounded-full text-xs font-extrabold shrink-0 leading-none {m.outcome === 'win' ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15'}"
            >
              {m.outcome === 'win' ? 'W' : 'L'}
            </span>
            <span class="text-sm font-bold truncate">{m.hero}</span>
            <span class="text-xxs text-tx3 uppercase tracking-wide px-1.5 py-[1px] rounded bg-zinc-800/60 shrink-0">{m.role}</span>
          </div>
          <div class="text-xs text-tx3 mt-[2px]">{m.mode}</div>
        </div>

        <!-- Items Strip -->
        <div class="flex items-center gap-[3px] shrink-0">
          {#each m.items as item, i}
            {#if item && i < 6}
              <span class="w-[22px] h-[22px] flex items-center justify-center text-xs bg-s2 rounded">{item}</span>
            {/if}
          {/each}
        </div>

        <!-- Stats Block -->
        <div class="flex items-center gap-4 shrink-0">
          <div class="text-sm font-semibold w-[52px] text-center text-tx2 font-mono font-tabular leading-tight">
            {m.k}/{m.d}/{m.a}
            <span class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]">KDA</span>
          </div>
          <div class="text-sm font-semibold w-[40px] text-center text-tx2 font-mono font-tabular leading-tight">
            {m.gpm}
            <span class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]">GPM</span>
          </div>
          <div class="text-sm font-semibold w-[52px] text-center text-tx2 font-mono font-tabular leading-tight">
            {m.dur}
            <span class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]">Duration</span>
          </div>
        </div>

        <!-- Ago + Arrow -->
        <div class="text-xs text-tx3 w-[78px] text-right shrink-0">{m.ago}</div>
        <div class="text-tx3 text-lg transition-colors shrink-0 hover:text-pu2">›</div>
      </div>
    {/each}
  </div>
</div>
