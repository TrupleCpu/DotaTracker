<script lang="ts">
  import { MATCHES, type MockMatch } from '../utils/mockData'
  import { getHeroByName, getHeroImgUrl } from '../utils/heroMap'
  import CarryIcon from '../assets/role-icons/carry.svg'
  import MidIcon from '../assets/role-icons/mid.svg'
  import OfflaneIcon from '../assets/role-icons/offlane.svg'
  import SoftSuppIcon from '../assets/role-icons/soft_support.svg'

  interface Props {
    openMatchDetail: (match: MockMatch) => void
  }
  let { openMatchDetail }: Props = $props()

  let selectedRole = $state<string | null>(null)

  const roleMeta: Record<string, { icon: string; color: string; bar: string }> = {
    Core: { icon: CarryIcon, color: 'text-emerald-400', bar: 'bg-emerald-500' },
    Mid: { icon: MidIcon, color: 'text-blue-400', bar: 'bg-blue-500' },
    Offlane: { icon: OfflaneIcon, color: 'text-amber-400', bar: 'bg-amber-500' },
    Support: { icon: SoftSuppIcon, color: 'text-purple-400', bar: 'bg-purple-500' }
  }

  let roleData = $derived.by(() => {
    const ids = ['Core', 'Mid', 'Offlane', 'Support']
    return ids.map((id) => {
      const ms = MATCHES.filter((m) => m.role === id)
      const wins = ms.filter((m) => m.outcome === 'win').length
      const total = ms.length
      const wr = total > 0 ? Math.round((wins / total) * 100) : 0
      const avgK = total > 0 ? ms.reduce((s, m) => s + m.k, 0) / total : 0
      const avgD = total > 0 ? ms.reduce((s, m) => s + m.d, 0) / total : 0
      const avgA = total > 0 ? ms.reduce((s, m) => s + m.a, 0) / total : 0
      const avgGpm = total > 0 ? Math.round(ms.reduce((s, m) => s + m.gpm, 0) / total) : 0
      const heroCounts = new Map<string, number>()
      ms.forEach((m) => heroCounts.set(m.hero, (heroCounts.get(m.hero) || 0) + 1))
      const bestHero = [...heroCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '\u2014'
      return {
        id,
        matches: ms,
        wins,
        losses: total - wins,
        total,
        wr,
        avgKda: `${avgK.toFixed(1)}/${avgD.toFixed(1)}/${avgA.toFixed(1)}`,
        avgGpm,
        bestHero
      }
    })
  })

  let selectedRoleData = $derived(roleData.find((r) => r.id === selectedRole) ?? null)
  let filteredMatches = $derived(selectedRoleData?.matches ?? [])

  function getHeroSrc(heroName: string): string {
    const h = getHeroByName(heroName)
    return h ? getHeroImgUrl(h.icon) : ''
  }
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <!-- Role Cards -->
  <div class="grid grid-cols-4 gap-3 mb-5">
    {#each roleData as role}
      {@const meta = roleMeta[role.id]}
      <button
        class="bg-s1 border rounded-xl p-3.5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-bd2 hover:bg-s2 {selectedRole === role.id ? 'border-zinc-500/50 ring-1 ring-zinc-500/30' : 'border-bd'}"
        onclick={() => selectedRole = selectedRole === role.id ? null : role.id}
      >
        <img src={meta.icon} alt={role.id} class="w-9 h-9 shrink-0 {meta.color}" />
        <span class="text-sm font-bold text-tx">{role.id}</span>
        <div class="flex items-center gap-1 text-xs text-tx2">
          <span class="font-semibold text-tx">{role.total}</span>
          <span>games</span>
        </div>
        <div class="w-full flex flex-col gap-0.5">
          <div class="flex justify-between text-xs">
            <span class="font-bold {role.wr >= 50 ? 'text-gr' : 'text-rd'}">{role.wr}%</span>
            <span class="text-tx3">{role.wins}W {role.losses}L</span>
          </div>
          <div class="h-1.5 bg-s3 rounded-full overflow-hidden">
            <div class="h-full rounded-full {meta.bar}" style="width: {role.wr}%"></div>
          </div>
        </div>
        <div class="flex flex-col items-center gap-0.5 text-xs">
          <span class="text-tx2">KDA</span>
          <span class="font-semibold font-mono text-tx tabular-nums">{role.avgKda}</span>
        </div>
        <div class="flex flex-col items-center gap-0.5 text-xs">
          <span class="text-tx2">GPM</span>
          <span class="font-semibold font-mono text-tx tabular-nums">{role.avgGpm}</span>
        </div>
        <div class="flex flex-col items-center gap-0.5 text-xs">
          <span class="text-tx2">Best</span>
          <span class="font-semibold text-tx text-center">{role.bestHero}</span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Detail Section -->
  {#if selectedRole && selectedRoleData}
    <div class="card overflow-hidden">
      <div class="card-hd">
        <span class="card-ttl">Games as {selectedRole}</span>
        <span class="text-sm text-tx3">{selectedRoleData.total} matches</span>
      </div>
      <div class="flex flex-col gap-[5px] p-3">
        {#each filteredMatches as m}
          <div
            class="flex items-center gap-2.5 bg-s1 border border-bd rounded-lg p-[8px_12px] cursor-pointer transition-all hover:border-bd2 hover:bg-s2 {m.outcome === 'win' ? 'bg-emerald-500/[0.02] border-emerald-500/10' : 'bg-rose-500/[0.02] border-rose-500/10'}"
            onclick={() => openMatchDetail(m)}
          >
            <img src={getHeroSrc(m.hero)} alt={m.hero} class="w-10 h-10 rounded-lg bg-s2 shrink-0 object-cover" />
            <span class="flex items-center justify-center w-5 h-5 rounded-full text-xxs font-extrabold shrink-0 leading-none {m.outcome === 'win' ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15'}">
              {m.outcome === 'win' ? 'W' : 'L'}
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-bold truncate">{m.hero}</div>
              <div class="text-xs text-tx3">{m.mode}</div>
            </div>
            <div class="flex items-center gap-[2px] shrink-0">
              {#each m.items as item, i}
                {#if item && i < 6}
                  <span class="w-[20px] h-[20px] flex items-center justify-center text-xs bg-s2 rounded-sm">{item}</span>
                {/if}
              {/each}
            </div>
            <div class="flex items-center gap-2.5 shrink-0">
              <div class="text-xs font-semibold w-[48px] text-center text-tx2 font-mono tabular-nums leading-tight">
                {m.k}/{m.d}/{m.a}
                <span class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]">KDA</span>
              </div>
              <div class="text-xs font-semibold w-[36px] text-center text-tx2 font-mono tabular-nums leading-tight">
                {m.gpm}
                <span class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]">GPM</span>
              </div>
              <div class="text-xs font-semibold w-[48px] text-center text-tx2 font-mono tabular-nums leading-tight">
                {m.dur}
                <span class="block text-xxs font-medium text-tx3 mt-[1px] font-sans uppercase tracking-[0.4px]">Duration</span>
              </div>
            </div>
            <div class="text-xs text-tx3 w-[68px] text-right shrink-0">{m.ago}</div>
            <div class="text-tx3 text-base transition-colors shrink-0 hover:text-pu2">\u203A</div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center py-16 text-tx3">
      <svg class="w-10 h-10 mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      <span class="text-sm font-medium">Select a role above to see match details</span>
    </div>
  {/if}
</div>
