<script lang="ts">
  import { onMount } from 'svelte'
  import { uiStore } from '../stores/uiStore.svelte'
  import { playerStore, heroMap } from '../stores/playerStore.svelte'
  import { getHeroImgUrl } from '../utils/heroMap'
  import { formatRole } from '../utils/matchHelper'
  import LoadingSpinner from '../lib/ui/LoadingSpinner.svelte'
  import ProgressBar from '../lib/ui/ProgressBar.svelte'
  import type { HeroGroupByEntry } from '../types/api'

  let winRate = $derived.by(() => {
    const s = playerStore.playerStats
    if (!s?.matchCount) return 0
    return +((s.winCount / s.matchCount) * 100).toFixed(1)
  })

  let avgKda = $derived.by(() => {
    const s = playerStore.playerStats
    if (!s) return '0.0'
    const d = s.deathsAverage || 1
    return ((s.killsAverage + s.assistsAverage) / d).toFixed(1)
  })

  let roleStats = $derived.by(() => {
    const groups: Record<string, { matches: number; wins: number }> = {}
    for (const p of playerStore.heroPerformanceStats) {
      const label = formatRole(p.position)
      if (!groups[label]) groups[label] = { matches: 0, wins: 0 }
      groups[label].matches += p.matchCount
      groups[label].wins += p.winCount
    }
    return Object.entries(groups)
      .map(([label, v]) => ({
        label,
        matches: v.matches,
        winrate: v.matches > 0 ? +((v.wins / v.matches) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.matches - a.matches)
  })

  const DONUT_COLORS = [
    'var(--color-pu2)',
    'var(--color-gr)',
    'var(--color-gd)',
    'var(--color-bl)',
    'var(--color-rd)'
  ]

  let chartReady = $state(false)

  onMount(() => {
    if (uiStore.animatedCharts) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chartReady = true
        })
      })
    } else {
      chartReady = true
    }
  })

  let roleDonutSegments = $derived.by(() => {
    const total = roleStats.reduce((s, r) => s + r.matches, 0) || 1
    let cumulative = 0
    return roleStats.map((r, i) => {
      const startAngle = cumulative
      const fraction = r.matches / total
      cumulative += fraction * 360
      return { ...r, fraction, startAngle, color: DONUT_COLORS[i % DONUT_COLORS.length] }
    })
  })

  let partyStats = $derived.by(() => {
    const groups: Record<
      number,
      { matches: number; wins: number; k: number; d: number; a: number }
    > = {}
    for (const m of playerStore.detailedMatches) {
      const size = m.partyCount || 1
      if (!groups[size]) groups[size] = { matches: 0, wins: 0, k: 0, d: 0, a: 0 }
      groups[size].matches++
      if (m.outcome === 'win') groups[size].wins++
      groups[size].k += m.k
      groups[size].d += m.d
      groups[size].a += m.a
    }
    return Object.entries(groups)
      .map(([size, v]) => ({
        label: Number(size) === 1 ? 'Solo' : `${size}-stack`,
        size: Number(size),
        matches: v.matches,
        winrate: +((v.wins / v.matches) * 100).toFixed(1),
        kda: v.d > 0 ? +((v.k + v.a) / v.d).toFixed(1) : v.k + v.a
      }))
      .sort((a, b) => a.size - b.size)
  })

  let bestHeroes = $derived.by(() =>
    [...playerStore.allHeroStats]
      .filter((h: HeroGroupByEntry) => h.matchCount >= 10)
      .sort((a: HeroGroupByEntry, b: HeroGroupByEntry) => b.winCount / b.matchCount - a.winCount / a.matchCount)
      .slice(0, 5)
      .map((h: HeroGroupByEntry) => ({
        heroId: h.heroId,
        name: heroMap.get(h.heroId)?.localized_name ?? `Hero #${h.heroId}`,
        img: heroMap.get(h.heroId)?.img ?? '',
        matches: h.matchCount,
        winrate: +((h.winCount / h.matchCount) * 100).toFixed(1)
      }))
  )

  let worstHeroes = $derived.by(() =>
    [...playerStore.allHeroStats]
      .filter((h: HeroGroupByEntry) => h.matchCount >= 10)
      .sort((a: HeroGroupByEntry, b: HeroGroupByEntry) => a.winCount / a.matchCount - b.winCount / b.matchCount)
      .slice(0, 5)
      .map((h: HeroGroupByEntry) => ({ ...(bestHeroes.find((bh: HeroGroupByEntry) => bh.heroId === h.heroId) ?? {}), ...h }))
      .map((h: HeroGroupByEntry) => ({
        heroId: h.heroId,
        name: heroMap.get(h.heroId)?.localized_name ?? `Hero #${h.heroId}`,
        img: heroMap.get(h.heroId)?.img ?? '',
        matches: h.matchCount,
        winrate: +((h.winCount / h.matchCount) * 100).toFixed(1)
      }))
  )

  let laneStats = $derived.by(() => {
    const groups: Record<
      string,
      { matches: number; wins: number; k: number; d: number; a: number }
    > = {}
    for (const m of playerStore.detailedMatches) {
      const lane = formatRole(null, m.lane) || 'Unknown'
      if (!groups[lane]) groups[lane] = { matches: 0, wins: 0, k: 0, d: 0, a: 0 }
      groups[lane].matches++
      if (m.outcome === 'win') groups[lane].wins++
      groups[lane].k += m.k
      groups[lane].d += m.d
      groups[lane].a += m.a
    }
    return Object.entries(groups)
      .map(([lane, v]) => ({
        lane,
        matches: v.matches,
        wins: v.wins,
        winrate: +((v.wins / v.matches) * 100).toFixed(1),
        kda: v.d > 0 ? +((v.k + v.a) / v.d).toFixed(1) : v.k + v.a
      }))
      .sort((a, b) => b.matches - a.matches)
  })
</script>

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  {#if playerStore.isLoading}
    <LoadingSpinner text="Loading analysis…" />
  {:else if !playerStore.playerStats}
    <div class="flex items-center justify-center py-20">
      <span class="text-sm text-tx3">No data available.</span>
    </div>
  {:else}
    <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mb-4">
      <div class="card p-4">
        <div class="text-xxs font-bold text-tx3 uppercase tracking-[0.7px] mb-1">Win Rate</div>
        <div
          class="text-2xl font-extrabold tabular-nums {winRate >= 55
            ? 'text-gr'
            : winRate >= 48
              ? 'text-gd'
              : 'text-rd'}"
        >
          {winRate}%
        </div>
        <div class="text-xs text-tx2 mt-1">
          {playerStore.playerStats?.matchCount ?? 0} total matches ({playerStore.playerStats
            ?.winCount ?? 0}W / {(playerStore.playerStats?.matchCount ?? 0) -
            (playerStore.playerStats?.winCount ?? 0)}L)
        </div>
      </div>
      <div class="card p-4">
        <div class="text-xxs font-bold text-tx3 uppercase tracking-[0.7px] mb-1">Avg KDA / GPM</div>
        <div class="text-2xl font-extrabold text-pu2 tabular-nums">{avgKda} KDA</div>
        <div class="text-xs text-tx2 mt-1">
          {playerStore.playerStats?.gpmAverage ?? 0} GPM &middot; {playerStore.playerStats
            ?.xpmAverage ?? 0} XPM
        </div>
      </div>
      <div class="card p-4">
        <div class="text-xxs font-bold text-tx3 uppercase tracking-[0.7px] mb-1">Hero Pool</div>
        <div class="text-2xl font-extrabold text-gr tabular-nums">
          {playerStore.allHeroStats.length}
        </div>
        <div class="text-xs text-tx2 mt-1">
          {#if roleStats.length > 0}Most played: {roleStats[0].label} ({roleStats[0].matches} games){/if}
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-4">
      <div class="card p-4">
        <div class="card-hd"><span class="card-ttl">Win Rate by Role</span></div>
        <div class="flex items-start gap-4 pt-1">
          <div class="shrink-0">
            <svg
              class={uiStore.animatedCharts ? 'chart-animate' : ''}
              width="130"
              height="130"
              viewBox="0 0 130 130"
            >
              <circle
                cx="65"
                cy="65"
                r="52"
                fill="none"
                stroke="var(--color-s3)"
                stroke-width="22"
              />
              {#each roleDonutSegments as seg (seg.label)}
                {@const r = 52}{@const c = 2 * Math.PI * r}{@const dash =
                  seg.fraction * c}{@const rot = seg.startAngle - 90}
                <circle
                  cx="65"
                  cy="65"
                  {r}
                  fill="none"
                  stroke={seg.color}
                  stroke-width="22"
                  stroke-dasharray={chartReady ? `${dash} ${c - dash}` : `0 ${c}`}
                  transform="rotate({rot} 65 65)"
                  stroke-linecap="butt"
                />
              {/each}
              <text
                x="65"
                y="56"
                text-anchor="middle"
                fill="var(--color-tx)"
                font-size="18"
                font-weight="800"
                dominant-baseline="middle">{roleStats.reduce((s, r) => s + r.matches, 0)}</text
              >
              <text
                x="65"
                y="79"
                text-anchor="middle"
                fill="var(--color-tx3)"
                font-size="10"
                font-weight="600"
                dominant-baseline="middle">games</text
              >
            </svg>
          </div>
          <div class="flex-1 min-w-0 flex flex-col gap-[9px]">
            {#each roleStats as r, i (i)}
              {@const color =
                r.winrate >= 55
                  ? 'var(--color-gr)'
                  : r.winrate >= 48
                    ? 'var(--color-gd)'
                    : 'var(--color-rd)'}
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-tx">{r.label}</span>
                  <span class="text-sm font-bold" style="color: {color}">{r.winrate}%</span>
                </div>
                <ProgressBar value={r.winrate} {color} />
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="card-hd"><span class="card-ttl">Party Analysis</span></div>
        <div class="pt-1">
          {#if partyStats.length === 0}
            <div class="text-xs text-tx3 py-4 text-center">No match data available</div>
          {:else}
            {#each partyStats as p, i (i)}
              <div class="flex items-center gap-3 py-1.5 border-b border-bd last:border-b-0">
                <span class="text-xs font-bold text-tx2 w-16 shrink-0 tabular-nums">{p.label}</span>
                <div class="flex-1 h-[6px] bg-s3 rounded-sm overflow-hidden">
                  <div
                    class="h-full rounded-sm"
                    style="width: {p.winrate}%; background: {p.winrate >= 55
                      ? 'var(--color-gr)'
                      : p.winrate >= 48
                        ? 'var(--color-gd)'
                        : 'var(--color-rd)'}"
                  ></div>
                </div>
                <span
                  class="text-xs font-bold w-10 text-right tabular-nums {p.winrate >= 55
                    ? 'text-gr'
                    : p.winrate >= 48
                      ? 'text-gd'
                      : 'text-rd'}">{p.winrate}%</span
                >
                <span class="text-xxs text-tx3 w-10 text-right tabular-nums">{p.matches}</span>
                <span class="text-xxs text-tx3 w-14 text-right tabular-nums">{p.kda} KDA</span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-4">
      <div class="card p-4">
        <div class="card-hd"><span class="card-ttl">Best Heroes</span></div>
        <div class="flex flex-col gap-1.5 pt-1">
          {#each bestHeroes as h (h.heroId)}
            {@const color = h.winrate >= 60 ? 'var(--color-gr)' : 'var(--color-gd)'}
            <div class="flex items-center gap-2.5 py-1 border-b border-bd last:border-b-0">
              <div class="w-8 h-8 rounded bg-s2 border border-bd/40 overflow-hidden shrink-0">
                <img
                  src={getHeroImgUrl(h.img)}
                  alt={h.name}
                  class="w-full h-full object-cover object-top"
                />
              </div>
              <span class="text-xs font-semibold text-tx flex-1 truncate">{h.name}</span>
              <div class="flex-1 h-[6px] bg-s3 rounded-sm overflow-hidden max-w-[100px]">
                <div
                  class="h-full rounded-sm"
                  style="background: {color}; width: {h.winrate}%"
                ></div>
              </div>
              <span class="text-xs font-bold w-10 text-right tabular-nums" style="color: {color}"
                >{h.winrate}%</span
              >
              <span class="text-xxs text-tx3 w-12 text-right tabular-nums">{h.matches}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="card p-4">
        <div class="card-hd"><span class="card-ttl">Worst Heroes</span></div>
        <div class="flex flex-col gap-1.5 pt-1">
          {#each worstHeroes as h (h.heroId)}
            {@const color = h.winrate >= 50 ? 'var(--color-gd)' : 'var(--color-rd)'}
            <div class="flex items-center gap-2.5 py-1 border-b border-bd last:border-b-0">
              <div class="w-8 h-8 rounded bg-s2 border border-bd/40 overflow-hidden shrink-0">
                <img
                  src={getHeroImgUrl(h.img)}
                  alt={h.name}
                  class="w-full h-full object-cover object-top"
                />
              </div>
              <span class="text-xs font-semibold text-tx flex-1 truncate">{h.name}</span>
              <div class="flex-1 h-[6px] bg-s3 rounded-sm overflow-hidden max-w-[100px]">
                <div
                  class="h-full rounded-sm"
                  style="background: {color}; width: {h.winrate}%"
                ></div>
              </div>
              <span class="text-xs font-bold w-10 text-right tabular-nums" style="color: {color}"
                >{h.winrate}%</span
              >
              <span class="text-xxs text-tx3 w-12 text-right tabular-nums">{h.matches}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="card-hd">
        <span class="card-ttl"
          >Lane Performance <span class="text-tx3 font-normal text-xxs"
            >(last {playerStore.detailedMatches.length} matches)</span
          ></span
        >
      </div>
      {#if laneStats.length === 0}
        <div class="text-xs text-tx3 py-4 text-center">No match data available</div>
      {:else}
        <div class="flex flex-col gap-2 pt-1">
          {#each laneStats as l, i (i)}
            {@const color =
              l.winrate >= 55
                ? 'var(--color-gr)'
                : l.winrate >= 48
                  ? 'var(--color-gd)'
                  : 'var(--color-rd)'}
            <div class="flex items-center gap-3 py-1.5 border-b border-bd last:border-b-0">
              <span class="text-xs font-bold text-tx w-24 shrink-0">{l.lane}</span>
              <span class="text-xxs text-tx3 w-12 shrink-0 tabular-nums">{l.matches}</span>
              <ProgressBar value={l.winrate} {color} />
              <span class="text-xs font-bold w-10 text-right tabular-nums" style="color: {color}"
                >{l.winrate}%</span
              >
              <span class="text-xxs text-tx3 w-14 text-right tabular-nums">{l.kda} KDA</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
