<script lang="ts">
  import { MATCHES, type MockMatch } from '../utils/mockData'
  import { getHeroByName, getHeroImgUrl } from '../utils/heroMap'
  import CarryIcon from '../assets/role-icons/carry.svg'
  import MidIcon from '../assets/role-icons/mid.svg'
  import OfflaneIcon from '../assets/role-icons/offlane.svg'
  import SoftSuppIcon from '../assets/role-icons/soft_support.svg'

  interface Props {
    openMatchDetail: (match: MockMatch) => void
    initialRole?: string | null
  }
  let { openMatchDetail, initialRole }: Props = $props()

  let selectedRole = $state<string | null>(initialRole ?? null)

  const roleMeta: Record<string, { icon: string; color: string }> = {
    Core: { icon: CarryIcon, color: 'text-gr' },
    Mid: { icon: MidIcon, color: 'text-bl' },
    Offlane: { icon: OfflaneIcon, color: 'text-gd' },
    Support: { icon: SoftSuppIcon, color: 'text-rn' }
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
      return {
        id,
        matches: ms,
        wins,
        losses: total - wins,
        total,
        wr,
        avgKda: `${avgK.toFixed(1)}/${avgD.toFixed(1)}/${avgA.toFixed(1)}`,
        avgGpm
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
  <div class="grid grid-cols-4 gap-3 mb-5">
    {#each roleData as role}
      {@const meta = roleMeta[role.id]}
      <button
        class="bg-s1 border rounded-lg p-4 flex flex-col items-center gap-2.5 cursor-pointer transition-all hover:border-bd2 hover:bg-s2 {selectedRole === role.id ? 'border-pu ring-1 ring-pu' : 'border-bd'}"
        onclick={() => selectedRole = selectedRole === role.id ? null : role.id}
      >
        <img src={meta.icon} alt={role.id} class="w-8 h-8 shrink-0 {meta.color}" />
        <span class="text-xs font-bold text-tx2 uppercase tracking-[0.5px]">{role.id}</span>
        <span class="text-2xl font-extrabold tabular-nums leading-none {role.wr >= 50 ? 'text-gr' : 'text-rd'}">{role.wr}%</span>
        <div class="w-full h-1.5 bg-s3 rounded-full overflow-hidden">
          <div class="h-full rounded-full {meta.color.replace('text', 'bg')}" style="width: {role.wr}%"></div>
        </div>
        <div class="text-xs text-tx2 text-center leading-snug">
          <span class="font-semibold text-tx tabular-nums">{role.total}</span>g
          <span class="text-tx3 mx-1">·</span>
          <span class="tabular-nums">{role.avgKda}</span> KDA
          <span class="text-tx3 mx-1">·</span>
          <span class="tabular-nums">{role.avgGpm}</span> GPM
        </div>
      </button>
    {/each}
  </div>

  {#if selectedRole && selectedRoleData}
    <div class="bg-s1 border border-bd rounded-lg overflow-hidden">
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-bd">
        <span class="text-xs font-bold uppercase tracking-[0.6px] text-tx2">Games as {selectedRole}</span>
        <span class="text-xs text-tx3 font-semibold tabular-nums">{selectedRoleData.total} matches</span>
      </div>
      <div class="flex flex-col p-2.5 gap-1.5">
        {#each filteredMatches as m}
          <div
            class="flex items-center gap-2.5 bg-s2 border border-bd rounded-lg p-[7px_10px] cursor-pointer transition-all hover:border-bd2 hover:bg-s3"
            onclick={() => openMatchDetail(m)}
          >
            <img src={getHeroSrc(m.hero)} alt={m.hero} class="w-9 h-9 rounded bg-s3 shrink-0 object-cover" />
            <span class="flex items-center justify-center w-[18px] h-[18px] rounded-full text-xxs font-extrabold shrink-0 leading-none {m.outcome === 'win' ? 'text-gr bg-grb' : 'text-rd bg-rdb'}">
              {m.outcome === 'win' ? 'W' : 'L'}
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold truncate text-tx">{m.hero}</div>
              <div class="text-xxs text-tx3">{m.mode}</div>
            </div>
            <div class="flex items-center gap-2.5 shrink-0">
              <div class="text-xs font-semibold text-tx2 font-mono tabular-nums leading-tight text-right w-[48px]">
                {m.k}/{m.d}/{m.a}
              </div>
              <div class="text-xs font-semibold text-tx2 font-mono tabular-nums text-right w-[32px]">
                {m.gpm}
              </div>
              <div class="text-xs text-tx3 font-mono tabular-nums text-right w-[40px]">
                {m.dur}
              </div>
            </div>
            <div class="text-xxs text-tx3 w-[56px] text-right shrink-0">{m.ago}</div>
            <div class="text-tx3 text-sm shrink-0 hover:text-pu2">›</div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center py-16 text-tx3">
      <svg class="w-8 h-8 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      <span class="text-xs font-medium">Click a role to see match details</span>
    </div>
  {/if}
</div>