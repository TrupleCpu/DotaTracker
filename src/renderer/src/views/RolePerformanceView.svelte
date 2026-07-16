<script lang="ts">
  import { playerStore, heroMap } from '../stores/playerStore.svelte'
  import { getHeroByName, getHeroImgUrl } from '../utils/heroMap'
  import { formatRole } from '../utils/matchHelper'
  import { uiStore } from '../stores/uiStore.svelte'
  import WinLossBadge from '../lib/dota/WinLossBadge.svelte'
  import type { Match } from '../types'

  interface Props {
    initialRole?: string | null
  }
  let { initialRole }: Props = $props()

  let selectedRole = $state<string | null>(initialRole ?? null)

  let roleStats = $derived.by(() => {
    const groups: Record<string, { matches: Match[] }> = {}
    for (const m of playerStore.detailedMatches) {
      const label = formatRole(null, m.lane)
      if (!groups[label]) groups[label] = { matches: [] }
      groups[label].matches.push(m)
    }
    return Object.entries(groups).map(([id, v]) => {
      const wins = v.matches.filter((m) => m.outcome === 'win').length
      const total = v.matches.length
      const avgK = total > 0 ? v.matches.reduce((s, m) => s + m.k, 0) / total : 0
      const avgD = total > 0 ? v.matches.reduce((s, m) => s + m.d, 0) / total : 0
      const avgA = total > 0 ? v.matches.reduce((s, m) => s + m.a, 0) / total : 0
      const avgGpm = total > 0 ? Math.round(v.matches.reduce((s, m) => s + m.gpm, 0) / total) : 0
      return {
        id,
        matches: v.matches,
        wins,
        losses: total - wins,
        total,
        wr: total > 0 ? Math.round((wins / total) * 100) : 0,
        avgKda: `${avgK.toFixed(1)}/${avgD.toFixed(1)}/${avgA.toFixed(1)}`,
        avgGpm
      }
    })
  })

  let selectedRoleData = $derived(roleStats.find((r) => r.id === selectedRole) ?? null)
  let filteredMatches = $derived(selectedRoleData?.matches ?? [])

  const roleMeta: Record<string, { color: string }> = {
    Carry: { color: 'text-gr' },
    Mid: { color: 'text-bl' },
    Offlane: { color: 'text-gd' },
    'Soft Support': { color: 'text-rn' },
    'Hard Support': { color: 'text-rn' }
  }

  function getHeroSrc(heroName: string): string {
    const h = getHeroByName(heroName)
    return h ? getHeroImgUrl(h.icon) : ''
  }
</script>

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  <div class="grid grid-cols-5 gap-3 mb-5">
    {#each roleStats as role}
      {@const meta = roleMeta[role.id] ?? { color: 'text-pu2' }}
      <button
        class="bg-s1 border rounded-lg p-4 flex flex-col items-center gap-2.5 cursor-pointer transition-all hover:border-bd2 hover:bg-s2 {selectedRole ===
        role.id
          ? 'border-pu ring-1 ring-pu'
          : 'border-bd'}"
        onclick={() => (selectedRole = selectedRole === role.id ? null : role.id)}
      >
        <span class="text-xs font-bold text-tx2 uppercase tracking-[0.5px]">{role.id}</span>
        <span
          class="text-2xl font-extrabold tabular-nums leading-none {role.wr >= 50
            ? 'text-gr'
            : 'text-rd'}">{role.wr}%</span
        >
        <div class="w-full h-1.5 bg-s3 rounded-full overflow-hidden">
          <div class="h-full rounded-full {meta.color}" style="width: {role.wr}%"></div>
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
        <span class="text-xs font-bold uppercase tracking-[0.6px] text-tx2"
          >Games as {selectedRole}</span
        >
        <span class="text-xs text-tx3 font-semibold tabular-nums"
          >{selectedRoleData.total} matches</span
        >
      </div>
      <div class="flex flex-col p-2.5 gap-1.5">
        {#each filteredMatches as m}
          <div
            class="flex items-center gap-2.5 bg-s2 border border-bd rounded-lg p-[7px_10px] cursor-pointer transition-all hover:border-bd2 hover:bg-s3"
            onclick={() => uiStore.openMatchDetail(m)}
          >
            <div class="w-9 h-9 rounded bg-s3 shrink-0 overflow-hidden">
              <img
                src={getHeroSrc(m.heroName ?? '')}
                alt={m.heroName}
                class="w-full h-full object-cover"
              />
            </div>
            <WinLossBadge outcome={m.outcome} size="w-[18px] h-[18px]" />
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold truncate text-tx">{m.heroName}</div>
              <div class="text-xxs text-tx3">{m.mode}</div>
            </div>
            <div class="flex items-center gap-2.5 shrink-0">
              <div
                class="text-xs font-semibold text-tx2 font-mono tabular-nums leading-tight text-right w-[48px]"
              >
                {m.k}/{m.d}/{m.a}
              </div>
              <div
                class="text-xs font-semibold text-tx2 font-mono tabular-nums text-right w-[32px]"
              >
                {m.gpm}
              </div>
              <div class="text-xs text-tx3 font-mono tabular-nums text-right w-[40px]">{m.dur}</div>
            </div>
            <div class="text-xxs text-tx3 w-[56px] text-right shrink-0">{m.timeAgo}</div>
            <div class="text-tx3 text-sm shrink-0 hover:text-pu2">›</div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center py-16 text-tx3">
      <svg
        class="w-8 h-8 mb-3 opacity-30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        ><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg
      >
      <span class="text-xs font-medium">Click a role to see match details</span>
    </div>
  {/if}
</div>
