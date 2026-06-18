<script lang="ts">
  import { MATCHES, type MockMatch } from '../utils/mockData'

  interface Props {
    openMatchDetail: (match: MockMatch) => void
  }
  let { openMatchDetail }: Props = $props()

  let selectedHero = $state('All Heroes')
  let selectedResult = $state('All Results')
  let selectedMode = $state('All Modes')

  let filteredMatches = $derived.by(() => {
    return MATCHES.filter(m => {
      if (selectedHero !== 'All Heroes' && m.hero !== selectedHero) return false
      if (selectedResult === 'Wins Only' && m.outcome !== 'win') return false
      if (selectedResult === 'Losses Only' && m.outcome !== 'loss') return false
      if (selectedMode !== 'All Modes' && m.mode !== selectedMode) return false
      return true
    })
  })
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- FILTER BAR -->
  <div class="flex items-center gap-2.5 mb-4">
    <select bind:value={selectedHero} class="sel bg-s1">
      <option>All Heroes</option>
      <option>Pudge</option>
      <option>Shadow Fiend</option>
      <option>Ember Spirit</option>
      <option>Lion</option>
    </select>
    <select bind:value={selectedResult} class="sel bg-s1">
      <option>All Results</option>
      <option>Wins Only</option>
      <option>Losses Only</option>
    </select>
    <select bind:value={selectedMode} class="sel bg-s1">
      <option>All Modes</option>
      <option>All Pick</option>
      <option>Ranked</option>
    </select>
    <div class="flex-1"></div>
    <span class="text-[11.5px] text-tx3">{filteredMatches.length} matches shown</span>
  </div>

  <!-- MATCHES LIST -->
  <div class="flex flex-col gap-[7px]">
    {#each filteredMatches as m}
      <div
        class="bg-s1 border border-bd rounded-lg p-[12px_16px] flex items-center gap-3.5 cursor-pointer transition-all hover:border-bd2 hover:bg-s2 hover:translate-x-0.5 border-l-[2.5px] {m.outcome === 'win' ? 'border-l-gr' : 'border-l-rd'}"
        onclick={() => openMatchDetail(m)}
      >
        <div class="w-[42px] h-[42px] rounded-lg flex items-center justify-center text-[21px] bg-s2 shrink-0">{m.icon}</div>
        <div class="text-[13.5px] font-extrabold w-11 {m.outcome === 'win' ? 'text-gr' : 'text-rd'}">
          {m.outcome === 'win' ? 'Win' : 'Loss'}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-bold truncate">{m.hero}</div>
          <div class="text-[10.5px] text-tx2 mt-0.5">{m.mode}</div>
        </div>
        <div class="text-[12.5px] font-semibold w-15 text-center text-tx2 font-mono">
          {m.k}/{m.d}/{m.a}
          <span class="block text-[9.5px] font-medium text-tx3 mt-0.5 font-inter uppercase tracking-[0.4px]">KDA</span>
        </div>
        <div class="text-[12.5px] font-semibold w-15 text-center text-tx2 font-mono">
          {m.gpm}
          <span class="block text-[9.5px] font-medium text-tx3 mt-0.5 font-inter uppercase tracking-[0.4px]">GPM</span>
        </div>
        <div class="text-[12.5px] font-semibold w-15 text-center text-tx2 font-mono">
          {m.dur}
          <span class="block text-[9.5px] font-medium text-tx3 mt-0.5 font-inter uppercase tracking-[0.4px]">Duration</span>
        </div>
        <div class="text-[11px] text-tx3 w-[90px] text-right">{m.ago}</div>
        <div class="text-tx3 text-[16px] transition-colors shrink-0 hover:text-pu2">›</div>
      </div>
    {/each}
  </div>
</div>
