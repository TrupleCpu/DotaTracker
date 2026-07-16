<script lang="ts">
  import { onMount } from 'svelte'
  import { playerStore, heroMap } from '../stores/playerStore.svelte'
  import { getHeroImgUrl } from '../utils/heroMap'
  import { rankToString } from '../utils/rankMap'
  import ToolTip from '../lib/ui/ToolTip.svelte'
  import { formatRole, getLaneOutcome } from '../utils/matchHelper'
  import { uiStore } from '../stores/uiStore.svelte'
  import HeroIcon from '../lib/dota/HeroIcon.svelte'
  import LaneIcon from '../lib/dota/LaneIcon.svelte'
  import WinLossBadge from '../lib/dota/WinLossBadge.svelte'
  import AwardBadge from '../lib/dota/AwardBadge.svelte'
  import ImpactBar from '../lib/dota/ImpactBar.svelte'
  import RankBadge from '../lib/dota/RankBadge.svelte'
  import { getCachedSessionReview, setCachedSessionReview } from '../lib/cache/llmCache'

  const rankImages = import.meta.glob('../assets/ranks/*.png', { eager: true, import: 'default' })

  let rolesViewInitialRole = $state<string | null>(null)

  function openRolesView(role: string) {
    rolesViewInitialRole = role
    uiStore.gotoView('roles')
  }

  function impTooltip(value: number): string {
    const imp = value ?? 0
    const label = imp >= 50 ? 'High performance' : imp >= 20 ? 'Good performance' : imp >= 0 ? 'Average performance' : imp <= -50 ? 'Poor performance' : imp <= -20 ? 'Low performance' : 'Below average'
    return label + ' (Impact: ' + (imp >= 0 ? '+' : '') + imp + ')'
  }

  let roleData = $derived(
    playerStore.roleDistribution.length > 0
      ? playerStore.roleDistribution
      : [
          { id: 'Core', label: 'Core', hex: '#22C55E', wr: 0, games: 0 },
          { id: 'Mid', label: 'Mid', hex: '#3B82F6', wr: 0, games: 0 },
          { id: 'Offlane', label: 'Offlane', hex: '#EAB308', wr: 0, games: 0 },
          { id: 'Support', label: 'Support', hex: '#EC4899', wr: 0, games: 0 }
        ]
  )

  let sessionReview = $state<any | null>(null)
  let sessionReviewLoading = $state(false)
  let sessionReviewError = $state<string | null>(null)
  let llmConfigured = $state(false)

  $effect(() => {
    window.api.getLlmConfig().then((cfg) => {
      llmConfigured = cfg.configured
    })
  })

  $effect(() => {
    if (!llmConfigured || playerStore.detailedMatches.length === 0) {
      sessionReview = null
      return
    }
    const matches = playerStore.detailedMatches.slice(0, 20).map((m) => ({
      heroName: m.heroName || `Hero #${m.heroId}`,
      position: m.lane || '',
      kills: m.k,
      deaths: m.d,
      assists: m.a,
      gpm: m.gpm,
      outcome: m.outcome
    }))
    const cached = getCachedSessionReview(matches)
    if (cached) {
      sessionReview = cached
      return
    }
    sessionReview = null
    sessionReviewLoading = true
    sessionReviewError = null
    window.api.generateSessionReview(matches).then((result: any) => {
      if (result?.err) {
        sessionReviewError = result.err
        sessionReview = null
      } else {
        sessionReview = result
        setCachedSessionReview(matches, result)
        sessionReviewError = null
      }
    }).catch((e: any) => {
      sessionReviewError = e?.message ?? 'Failed to generate session review'
    }).finally(() => {
      sessionReviewLoading = false
    })
  })

  onMount(() => {
    playerStore.loadProfile()
  })

  function getHeroModelUrl(heroId: number): string | null {
    return heroId ? `hero-model://${heroId}.png` : null
  }

  function getRankImage(rank: number): string {
    let r =
      rank === 10 ||
      rank === 20 ||
      rank === 30 ||
      rank === 40 ||
      rank === 50 ||
      rank === 60 ||
      rank === 70
        ? rank + 1
        : rank
    return rankImages[`../assets/ranks/${r}.png`] as string
  }

  function laneLabel(lane: string): string {
    return (
      (
        {
          SAFE_LANE: 'Safe Lane (Carry)',
          MID_LANE: 'Mid Lane',
          OFF_LANE: 'Off Lane',
          LIGHT_SUPPORT: 'Soft Support',
          HARD_SUPPORT: 'Hard Support'
        } as Record<string, string>
      )[lane] ?? lane
    )
  }
</script>

<div class="flex-1 overflow-y-auto overflow-x-hidden p-4 select-none">
  <div class="flex flex-col gap-4 mb-4">
    <div class="grid lg:grid-cols-2 grid-cols-1 gap-4">
      <div class="card p-4 flex flex-col justify-center gap-3 rounded-md">
        <div class="flex justify-between items-baseline">
          <div class="text-xl">
            <span class="text-gd font-bold"
              >{playerStore.playerStats
                ? playerStore.playerStats.matchCount.toLocaleString()
                : '—'}</span
            >
            <span class="text-tx font-semibold ml-1">Matches</span>
          </div>
          <div class="text-sm text-tx2">First Match: Apr 19, 2019</div>
        </div>
        <div class="flex gap-[3px] h-[8px] w-full">
          {#each Array(24) as _}<div class="flex-1 bg-gd rounded-[1px]"></div>{/each}
        </div>
      </div>
      <div class="card p-4 flex flex-col justify-center gap-3 rounded-md">
        <div class="flex justify-between items-baseline">
          <div class="text-xl">
            <span class="text-gr font-bold"
              >{playerStore?.playerStats
                ? (
                    (playerStore?.playerStats.winCount / playerStore?.playerStats.matchCount) *
                    100
                  ).toFixed(2) + '%'
                : '—'}</span
            >
            <span class="text-tx font-semibold ml-1">Win Rate</span>
          </div>
          <div class="text-base">
            <span class="text-gr">{playerStore.playerStats?.winCount}</span>
            <span class="text-tx2 mx-1">-</span>
            <span class="text-rd"
              >{playerStore.playerStats
                ? playerStore.playerStats.matchCount - playerStore.playerStats.winCount
                : '-'}</span
            >
          </div>
        </div>
        <div class="flex h-[8px] w-full bg-black/40 rounded-sm overflow-hidden gap-[2px]">
          <div
            class="bg-gr h-full"
            style="width: {playerStore.playerStats
              ? (playerStore.playerStats.winCount / playerStore.playerStats.matchCount) * 100
              : 0}%"
          ></div>
          <div class="bg-s4 h-full flex-1"></div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
      <div class="card p-4 flex flex-col justify-center gap-2.5 rounded-md">
        <div class="flex justify-between items-baseline">
          <div class="text-lg">
            <span class="text-pu2 font-bold"
              >{playerStore.playerStats
                ? (
                    (playerStore.playerStats.killsAverage +
                      playerStore.playerStats.assistsAverage) /
                    Math.max(1, playerStore.playerStats.deathsAverage)
                  ).toFixed(2)
                : '—'}</span
            >
            <span class="text-tx2 text-base ml-1">KDA Ratio</span>
          </div>
          <div class="text-sm font-mono text-tx2 font-tabular">
            {playerStore.playerStats?.killsAverage}<span class="text-rd mx-0.5"
              >/ {playerStore.playerStats?.deathsAverage}/</span
            >{playerStore.playerStats?.assistsAverage}
          </div>
        </div>
        <div class="flex h-[6px] w-full bg-black/40 rounded-sm overflow-hidden gap-[1px]">
          {#if playerStore.playerStats}
            {@const total =
              playerStore.playerStats.killsAverage +
              playerStore.playerStats.deathsAverage +
              playerStore.playerStats.assistsAverage}
            <div
              class="bg-gr h-full"
              style="width: {(playerStore.playerStats.killsAverage / total) * 100}%"
            ></div>
            <div
              class="bg-rd h-full"
              style="width: {(playerStore.playerStats.deathsAverage / total) * 100}%"
            ></div>
            <div class="bg-bl h-full flex-1"></div>
          {/if}
        </div>
      </div>
      <div class="card p-4 flex flex-col justify-center gap-2.5 rounded-md">
        <div class="flex justify-between items-baseline">
          <div class="text-lg">
            <span class="text-gd font-bold">{playerStore.playerStats?.gpmAverage}</span><span
              class="text-tx2 text-base ml-1">Avg GPM</span
            >
          </div>
          <div class="text-sm font-mono text-tx2 font-tabular">
            <span class="text-bl">{playerStore.playerStats?.xpmAverage}</span> XPM
          </div>
        </div>
        <div class="flex h-[6px] w-full bg-black/40 rounded-sm overflow-hidden gap-[1px]">
          {#if playerStore.playerStats}
            {@const total = playerStore.playerStats.gpmAverage + playerStore.playerStats.xpmAverage}
            <div
              class="bg-gd h-full"
              style="width: {(playerStore.playerStats.gpmAverage / total) * 100}%"
            ></div>
            <div class="bg-bl h-full flex-1"></div>
          {/if}
        </div>
      </div>
      <div
        class="card flex items-center justify-center overflow-hidden p-1.5 h-full min-h-[70px] rounded-md"
      >
        {#if playerStore.playerStats?.rank}
          <img
            src={getRankImage(playerStore.playerStats.rank)}
            alt="Rank badge"
            class="h-[65px] object-contain drop-shadow-xl"
          />
        {:else}
          <div class="text-tx3 text-xs">Unranked</div>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-1 mb-4">
    {#each [{ left: roleData[0], right: roleData[1] }, { left: roleData[2], right: roleData[3] }] as row}
      <div class="flex items-center">
        <button
          class="flex-1 flex items-center gap-2 min-w-0 cursor-pointer transition-opacity hover:opacity-70"
          onclick={() => openRolesView(row.left.id)}
        >
          <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background: {row.left.hex}"></span>
          <span class="text-xs font-bold text-tx3 w-[48px] shrink-0">{row.left.label}</span>
          <div class="flex-1 h-[8px] bg-s3 rounded-sm overflow-hidden min-w-[60px]">
            <div
              class="h-full rounded-sm"
              style="width: {row.left.wr}%; background: {row.left.hex}"
            ></div>
          </div>
          <span
            class="text-xs font-extrabold tabular-nums w-[32px] text-right shrink-0 {row.left.wr >=
            50
              ? 'text-gr'
              : 'text-rd'}">{row.left.wr}%</span
          >
          <span class="text-xxs text-tx3 tabular-nums w-[28px] text-right shrink-0"
            >{row.left.games}</span
          >
        </button>
        <div class="w-px h-[18px] bg-bd mx-2 shrink-0"></div>
        <button
          class="flex-1 flex items-center gap-2 min-w-0 cursor-pointer transition-opacity hover:opacity-70"
          onclick={() => openRolesView(row.right.id)}
        >
          <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background: {row.right.hex}"
          ></span>
          <span class="text-xs font-bold text-tx3 w-[48px] shrink-0">{row.right.label}</span>
          <div class="flex-1 h-[8px] bg-s3 rounded-sm overflow-hidden min-w-[60px]">
            <div
              class="h-full rounded-sm"
              style="width: {row.right.wr}%; background: {row.right.hex}"
            ></div>
          </div>
          <span
            class="text-xs font-extrabold tabular-nums w-[32px] text-right shrink-0 {row.right.wr >=
            50
              ? 'text-gr'
              : 'text-rd'}">{row.right.wr}%</span
          >
          <span class="text-xxs text-tx3 tabular-nums w-[28px] text-right shrink-0"
            >{row.right.games}</span
          >
        </button>
      </div>
    {/each}
  </div>

  <div class="grid lg:grid-cols-[3fr_2fr] grid-cols-1 gap-4">
    <div class="flex flex-col gap-4">
      <div class="card overflow-x-auto">
        <div class="flex items-center justify-between px-3 py-2.5 border-b border-bd">
          <span class="text-xs font-extrabold uppercase tracking-wider text-tx"
            >Detailed Match History</span
          >
          <span
            class="text-xs font-bold text-pu2 hover:text-pu cursor-pointer transition-colors"
            onclick={() => uiStore.gotoView('matches')}>View all →</span
          >
        </div>
        <div class="flex flex-col min-w-0">
          {#if playerStore.isLoading}
            <div class="flex items-center justify-center py-10">
              <span class="text-sm text-tx3 animate-pulse">Loading matches…</span>
            </div>
          {:else if playerStore.error}
            <div class="flex items-center justify-center py-10">
              <span class="text-sm text-rd">{playerStore.error}</span>
            </div>
          {:else if playerStore.detailedMatches.length === 0}
            <div class="flex items-center justify-center py-10">
              <span class="text-sm text-tx3">No matches found.</span>
            </div>
          {:else}
            {#each playerStore.detailedMatches as m (m.id)}
              <div
                class="flex items-center gap-4 py-2 px-3 border-b border-bd last:border-b-0 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onclick={() => uiStore.openMatchDetail(m)}
              >
                <HeroIcon
                  heroId={m.heroId}
                  heroName={m.heroName}
                  img={m.heroImg}
                  size="w-[55px] h-[31px]"
                />
                <ToolTip text={laneLabel(m.lane)}>
                  <LaneIcon lane={m.lane} />
                </ToolTip>
                <div class="flex-1 flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5">
                    <WinLossBadge
                      outcome={m.outcome}
                      laneOutcome={getLaneOutcome(m)}
                      size="w-[18px] h-[18px]"
                    />
                    {#if m.previousOutcome}
                      <div
                        class="w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-extrabold {m.previousOutcome ===
                        'win'
                          ? 'bg-grb text-gr'
                          : 'bg-rdb text-rd'}"
                      >
                        {m.previousOutcome === 'win' ? 'W' : 'L'}
                      </div>
                    {/if}
                    <div class="text-xs text-tx2 font-bold uppercase truncate">{m.mode}</div>
                  </div>
                </div>
                <div
                  class="text-sm text-tx2 font-mono font-medium font-tabular w-[80px] text-center shrink-0"
                >
                  {m.k} / {m.d} / {m.a}
                </div>
                <div
                  class="text-sm font-bold font-mono font-tabular w-[40px] text-right shrink-0 {m.impactValue !==
                    undefined && m.impactValue >= 0
                    ? 'text-gr'
                    : 'text-rd'}"
                >
                  {m.impactValue}
                </div>
                {#if m.impactValue !== undefined}
                  <ImpactBar value={m.impactValue} />
                {/if}
                <div class="w-[20px] h-[20px] shrink-0 flex items-center justify-center">
                  <AwardBadge award={m.award} />
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <div class="w-[16px] h-[16px] shrink-0 flex items-center justify-center text-xs">
                    👤
                  </div>
                  <div class="text-xs text-tx2 w-[16px] text-center shrink-0">
                    {m.partyCount ?? 0}
                  </div>
                  <RankBadge rank={m.rank} />
                </div>
                <div class="text-tx3 text-right flex flex-col w-[80px] shrink-0 ml-auto">
                  <div class="text-sm font-medium font-mono font-tabular leading-tight">
                    {m.dur}
                  </div>
                  <div class="text-xs text-tx2 leading-tight uppercase font-medium">
                    {m.timeAgo}
                  </div>
                </div>
                <div class="text-tx3 text-lg ml-1 transition-colors hover:text-pu2 shrink-0">›</div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <div class="bg-s1 border border-bd rounded-md p-4 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-md bg-pub flex items-center justify-center text-lg shrink-0">
            🤖
          </div>
          <div>
            <div class="text-base font-bold">AI Coach Session Review</div>
            <div class="text-xs text-tx2 mt-0.5">
              Based on your last {Math.min(playerStore.detailedMatches.length, 20)} matches
            </div>
          </div>
        </div>

        {#if !llmConfigured}
          <div class="text-sm text-tx2 leading-relaxed text-center py-4 text-zinc-500">
            Connect an AI provider in Settings to unlock session reviews.
          </div>
        {:else if sessionReviewLoading}
          <div class="animate-pulse space-y-2">
            <div class="h-4 bg-zinc-800 rounded w-3/4"></div>
            <div class="h-3 bg-zinc-800 rounded w-full"></div>
            <div class="h-3 bg-zinc-800 rounded w-2/3"></div>
            <div class="h-3 bg-zinc-800 rounded w-1/2"></div>
          </div>
        {:else if sessionReviewError}
          <div class="text-sm text-rose-400 leading-relaxed">{sessionReviewError}</div>
        {:else if sessionReview}
          <div class="text-sm text-tx2 leading-relaxed mb-3">
            {sessionReview.summary}
          </div>
          {#if sessionReview.patterns?.length > 0}
            <div class="text-xs font-bold text-tx3 uppercase tracking-[0.5px] mb-1.5">Patterns</div>
            <ul class="text-sm text-tx2 space-y-1 mb-3">
              {#each sessionReview.patterns as pattern}
                <li class="flex items-start gap-2">
                  <span class="text-gd mt-0.5">•</span>
                  <span>{pattern}</span>
                </li>
              {/each}
            </ul>
          {/if}
          {#if sessionReview.recommendations?.length > 0}
            <div class="text-xs font-bold text-tx3 uppercase tracking-[0.5px] mb-1.5">Recommendations</div>
            <ul class="text-sm text-tx2 space-y-1">
              {#each sessionReview.recommendations as rec}
                <li class="flex items-start gap-2">
                  <span class="text-pu mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>
    </div>

    <div class="flex flex-col gap-4">
      {#if playerStore.detailedMatches.length > 0}
        {@const m = playerStore.detailedMatches[0]}
        <div
          class="card p-3 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
          onclick={() => uiStore.openMatchDetail(m)}
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-tx3">Recent Match</span>
          </div>
          <div
            class="w-full h-64 rounded-md border border-bd overflow-hidden mb-3 flex items-center justify-center"
          >
            {#if m.heroId}
              <img
                src={getHeroModelUrl(m.heroId)}
                alt={m.heroName}
                class="w-full h-full object-contain"
              />
            {:else}
              <span class="text-tx3 text-sm">?</span>
            {/if}
          </div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-base font-bold text-tx truncate">{m.heroName}</div>
            <WinLossBadge outcome={m.outcome} laneOutcome={getLaneOutcome(m)} size="w-6 h-6" />
          </div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              {#if m.lane}
                <div class="relative group">
                  <LaneIcon lane={m.lane} size="w-4 h-4" />
                  <div
                    class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap rounded-md bg-s4 border border-bd2 px-2 py-1 text-xs font-semibold text-tx opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 ease-out z-50 shadow-lg"
                  >
                    {laneLabel(m.lane)}
                  </div>
                </div>
              {/if}
              <span class="text-xs text-tx2 font-semibold">{laneLabel(m.lane).split(' (')[0]}</span>
            </div>
            <div class="text-sm font-mono font-medium text-tx2 font-tabular">
              {m.k}<span class="text-tx3">/</span>{m.d}<span class="text-tx3">/</span>{m.a}
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-tx2 mb-3">
            <span class="font-bold uppercase">{m.mode}</span>
            <span class="font-mono font-tabular">{m.dur}</span>
            <span>{m.timeAgo}</span>
          </div>
          <div class="flex items-center justify-between">
            <RankBadge rank={m.rank} size="w-5 h-5" />
            <div class="flex items-center gap-2">
              <AwardBadge award={m.award} />
              <div class="flex items-center gap-1">
                <ToolTip text={impTooltip(m.impactValue ?? 0)}>
                  <div class="w-12 h-1.5 rounded-full bg-black/40 border border-bd overflow-hidden">
                    <div
                      class="h-full {m.impactValue !== undefined && m.impactValue >= 50
                        ? 'bg-purple-500'
                        : m.impactValue !== undefined && m.impactValue >= 20
                          ? 'bg-purple-400'
                          : 'bg-purple-300'} rounded-full"
                      style="width: {Math.min(Math.abs(m.impactValue ?? 0), 100)}%"
                    ></div>
                  </div>
                </ToolTip>
                <span
                  class="text-xs font-bold font-mono font-tabular {(m.impactValue ?? 0) >= 0
                    ? 'text-gr'
                    : 'text-rd'}">{m.impactValue}</span
                >
              </div>
            </div>
          </div>
        </div>
      {:else if playerStore.isLoading}
        <div class="card p-3 flex items-center justify-center py-10">
          <span class="text-sm text-tx3 animate-pulse">Loading match…</span>
        </div>
      {:else}
        <div class="card p-3 flex items-center justify-center py-10">
          <span class="text-sm text-tx3">No matches found.</span>
        </div>
      {/if}

      <div class="card p-4">
        <div class="flex items-center justify-between pb-3 border-b border-bd/40 mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-tx3">Recent Teammates</span>
          <span
            class="text-xs text-pu2 font-semibold cursor-pointer hover:text-pu transition-colors"
            onclick={() => uiStore.gotoView('teammates')}>View all →</span
          >
        </div>
        <div class="flex flex-col gap-2">
          {#each playerStore.recentTeammates as t (t.name)}
            <div
              class="flex items-center gap-3 p-2 bg-s2/40 hover:bg-s2/80 rounded-md border-l-2 border-l-bd/40 transition-all cursor-pointer min-w-0"
              onclick={() => uiStore.gotoView('teammates')}
            >
              <div
                class="w-11 h-11 rounded-md bg-s4 border border-bd flex items-center justify-center text-xl shrink-0 overflow-hidden"
              >
                {#if t.avatar}
                  <img src={t.avatar} alt={t.name} class="w-full h-full object-cover" />
                {:else}
                  <span class="text-tx3 text-xs font-bold">{t.name.slice(0, 2).toUpperCase()}</span>
                {/if}
              </div>
              <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                <div class="text-xs font-bold text-tx truncate">{t.name}</div>
                <div class="text-xs text-tx3 font-semibold uppercase tracking-wide truncate">
                  {t.matches} matches together
                </div>
              </div>
              <span
                class="text-xs font-extrabold px-2 py-0.5 rounded-full tracking-wide shrink-0 {t.winrate >=
                60
                  ? 'bg-grb text-gr'
                  : t.winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}">{t.winrate}%</span
              >
              <div
                class="text-tx3 text-sm font-semibold pl-1 transition-colors hover:text-pu2 shrink-0"
              >
                ›
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center justify-between pb-3 border-b border-bd/40 mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-tx3">Most Played Heroes</span
          >
          <span
            class="text-xs text-pu2 font-semibold cursor-pointer hover:text-pu transition-colors"
            onclick={() => uiStore.gotoView('heroes')}>View all →</span
          >
        </div>
        <div class="flex flex-col gap-2">
          {#each playerStore.topHeroes as h (h.heroId)}
            {@const hero = heroMap.get(h.heroId)}
            {@const winrate =
              h.matchCount > 0 ? parseFloat(((h.winCount / h.matchCount) * 100).toFixed(1)) : 0}
            <div
              class="flex items-center gap-3 p-1.5 hover:bg-s2/40 rounded-md border border-transparent hover:border-bd/30 transition-all cursor-pointer"
              onclick={() => uiStore.gotoView('heroes')}
            >
              <HeroIcon
                heroId={h.heroId}
                img={hero?.icon ? `hero-asset://${hero.icon.replace(/^hero-assets\//, '')}` : null}
                size="w-10 h-10"
              />
              <div class="text-xs font-bold text-tx flex-1 truncate">
                {hero?.localized_name ?? `Hero #${h.heroId}`}
              </div>
              <div class="text-xs text-tx3 font-mono font-medium font-tabular w-10 text-right">
                {h.matchCount}
              </div>
              <span
                class="text-xs font-extrabold px-2 py-0.5 rounded-full tracking-wide shrink-0 {winrate >=
                60
                  ? 'bg-grb text-gr'
                  : winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}">{winrate}%</span
              >
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
