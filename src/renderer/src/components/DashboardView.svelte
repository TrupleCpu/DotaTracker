<script lang="ts">
  import { onMount } from 'svelte'
  import { HEROES } from '../utils/mockData'
  import MidIcon from '../assets/role-icons/mid.svg'
  import CarryIcon from '../assets/role-icons/carry.svg'
  import OfflaneIcon from '../assets/role-icons/offlane.svg'
  import SoftSuppIcon from '../assets/role-icons/soft_support.svg'
  import HardSuppIcon from '../assets/role-icons/hard_support.svg'
  import TopCoreIcon from '../assets/award/topCore.svg'
  import TopSuppIcon from '../assets/award/topSupp.svg'
  import MvpIcon from '../assets/award/mvp.svg'

  import heroesData from '../../../main/data/heroes.json'
  const rankImages = import.meta.glob('../assets/ranks/*.png', {
    eager: true,
    import: 'default'
  })

  function getRankImage(rank: number): string {
    if (
      rank === 10 ||
      rank === 20 ||
      rank === 30 ||
      rank === 40 ||
      rank === 50 ||
      rank === 60 ||
      rank === 70
    ) {
      rank += 1
    }
    return rankImages[`../assets/ranks/${rank}.png`] as string
  }
  interface HeroData {
    id: number
    localized_name: string
    img: string
    icon: string
    primary_attr: string
    roles: string[]
  }

  interface StratzMatch {
    id: number
    heroId: number
    heroName: string
    heroImg: string
    outcome: 'win' | 'loss'
    previousOutcome: 'win' | 'loss'
    k: number
    d: number
    a: number
    mode: string
    dur: string
    timeAgo: string
    mmrChange: number
    impactValue: number
    partyCount: number
    lane: string
    rank: number
  }

  interface Props {
    openMatchDetail: (match: any) => void
    gotoView: (view: string) => void
  }
  let { openMatchDetail, gotoView }: Props = $props()

  const heroMap = new Map<number, HeroData>((heroesData as HeroData[]).map((h) => [h.id, h]))

  function getHeroImgUrl(path: string): string {
    return `https://cdn.cloudflare.steamstatic.com${path}`
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function formatTimeAgo(unixSeconds: number | null): string {
    if (!unixSeconds) return 'Unknown'
    const diff = Math.floor(Date.now() / 1000) - unixSeconds
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return `${Math.floor(diff / 604800)}wk ago`
  }

  function formatGameMode(mode: string): string {
    const map: Record<string, string> = {
      ALL_PICK_RANKED: 'Ranked',
      TURBO: 'Turbo',
      ALL_PICK: 'Normal',
      CAPTAINS_MODE: 'CM',
      RANDOM_DRAFT: 'Random',
      SINGLE_DRAFT: 'Single'
    }
    return map[mode] ?? mode
  }

  let detailedMatches = $state<StratzMatch[]>([])
  let isLoadingMatches = $state(true)
  let matchError = $state('')
  let playerStats = $state<{
    matchCount: number
    winCount: number
    killsAverage: number
    deathsAverage: number
    assistsAverage: number
    gpmAverage: number
    xpmAverage: number
    rank: number
  } | null>(null)

  let recentTeammates = $state<
    {
      steamAccountId: number
      name: string
      avatar: string | null // will be null for now
      matches: number
      winrate: number
    }[]
  >([])

 
  onMount(async () => {
    try {
      const res = await window.api.getLocalSteamId()

      if (!res?.steamId) {
        matchError = 'Could not resolve Steam ID.'
        return
      }

      // 'raw' contains { player: {...}, stratz: {...} }
      const raw = await window.api.fetchPlayerData(res.steamId)

      if (raw?.error) {
        matchError = raw.error
        return
      }

      // 1. Map Player Profile & Recent Matches
      const perf = raw.player.performance
      playerStats = {
        matchCount: raw.player.matchCount,
        winCount: raw.player.winCount,
        killsAverage: perf.killsAverage,
        deathsAverage: perf.deathsAverage,
        assistsAverage: perf.assistsAverage,
        gpmAverage: perf.gpmAverage,
        xpmAverage: perf.xpmAverage,
        rank: raw.player.steamAccount?.seasonRank ?? 0
      }

      // 2. Map Recent Matches Array Safely
      detailedMatches = (raw.player.recentMatches ?? []).map((m: any, i: number) => {
        const player = m.targetPlayer?.[0]
        const hero = heroMap.get(player?.heroId)
        const isWin = player?.isVictory ?? false
        const imp = player?.imp ?? 0

        const partyCount = player?.partyId
          ? m.allPlayers?.filter((p: any) => p.partyId === player.partyId).length
          : 0

        return {
          id: m.id,
          heroId: player?.heroId,
          heroName: hero?.localized_name ?? `Hero #${player?.heroId}`,
          heroImg: hero ? getHeroImgUrl(hero.img) : null,
          outcome: isWin ? 'win' : 'loss',
          previousOutcome: i % 2 === 0 ? 'win' : 'loss',
          k: player?.kills ?? 0,
          d: player?.deaths ?? 0,
          a: player?.assists ?? 0,
          mode: formatGameMode(m.gameMode),
          dur: formatDuration(m.durationSeconds ?? 0),
          timeAgo: formatTimeAgo(m.statsDateTime ?? m.endDateTime),
          lane: player?.lane ?? 'Unknown',
          rank: m.rank ?? 0,
          mmrChange: isWin ? 25 : -25,
          impactValue: imp,
          partyCount,
          award: player?.award ?? null
        }
      })

      // 3. Map Teammates From the 'stratz' Nested Payload
      // This completely replaces your old manual "allMatches" loop!
      const rawPeers = raw.stratz?.page?.player?.peers ?? []

      recentTeammates = rawPeers
        .map((p: any) => {
          const totalGames = p.matchCount ?? 1
          const totalWins = p.winCount ?? 0
          return {
            steamAccountId: p.steamAccount?.id,
            name: p.steamAccount?.name ?? 'Unknown',
            avatar: p.steamAccount?.avatar ?? null, // Stratz provides an avatar field here if requested
            matches: totalGames,
            winrate: parseFloat(((totalWins / totalGames) * 100).toFixed(1))
          }
        })
        .sort((a, b) => b.matches - a.matches)
        .slice(1, 6)

      console.log('✅ loaded matches:', detailedMatches.length)
    } catch (err) {
      console.error('Failed to load match history:', err)
      matchError = 'Failed to load matches.'
    } finally {
      isLoadingMatches = false
    }
  })

  function toLaneIcon(lane: string): string | null {
    switch (lane) {
      case 'SAFE_LANE':
        return CarryIcon
      case 'MID_LANE':
        return MidIcon
      case 'OFF_LANE':
        return OfflaneIcon
      case 'LIGHT_SUPPORT':
        return SoftSuppIcon
      case 'HARD_SUPPORT':
        return HardSuppIcon
      default:
        return null
    }
  }

  function toAwardIcon(award: string): string | null {
    switch (award) {
      case 'TOP_CORE':
        return TopCoreIcon
      case 'TOP_SUPPORT':
        return TopSuppIcon
      case 'MVP':
        return MvpIcon
      default:
        return null
    }
  }

  function impactColor(value: number): string {
    if (value >= 50) return 'bg-purple-500'
    if (value >= 20) return 'bg-purple-400'
    if (value >= 0) return 'bg-purple-300'

    if (value <= -50) return 'bg-gray-400/60'
    if (value <= -20) return 'bg-gray-400/40'
    return 'bg-gray-400/25'
  }
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex flex-col gap-4 mb-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="card p-4 flex flex-col justify-center gap-3">
        <div class="flex justify-between items-baseline">
          <div class="text-[17px]">
            <span class="text-[#EAB308] font-bold">{playerStats?.matchCount}</span>
            <span class="text-tx font-semibold ml-1">Matches</span>
          </div>
          <div class="text-[11.5px] text-tx2">First Match: Apr 19, 2019</div>
        </div>
        <div class="flex gap-[3px] h-[8px] w-full">
          {#each Array(24) as _}
            <div class="flex-1 bg-[#EAB308] rounded-[1px]"></div>
          {/each}
        </div>
      </div>

      <div class="card p-4 flex flex-col justify-center gap-3">
        <div class="flex justify-between items-baseline">
          <div class="text-[17px]">
            <span class="text-gr font-bold"
              >{playerStats
                ? ((playerStats.winCount / playerStats.matchCount) * 100).toFixed(2) + '%'
                : '—'}
            </span>
            <span class="text-tx font-semibold ml-1">Win Rate</span>
          </div>
          <div class="text-[12.5px]">
            <span class="text-gr">{playerStats?.winCount}</span>
            <span class="text-tx2 mx-1">-</span>
            <span class="text-rd"
              >{playerStats ? playerStats.matchCount - playerStats.winCount : '-'}</span
            >
          </div>
        </div>
        <div class="flex h-[8px] w-full bg-black/40 rounded-sm overflow-hidden gap-[2px]">
          <div
            class="bg-gr h-full"
            style="width: {playerStats
              ? (playerStats.winCount / playerStats.matchCount) * 100
              : 0}%"
          ></div>
          <div class="bg-[#333] h-full flex-1"></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="card p-4 flex flex-col justify-center gap-2.5">
        <div class="flex justify-between items-baseline">
          <div class="text-[15px]">
            <span class="text-pu2 font-bold">
              {playerStats
                ? (
                    (playerStats.killsAverage + playerStats.assistsAverage) /
                    Math.max(1, playerStats.deathsAverage)
                  ).toFixed(2)
                : '—'}</span
            >
            <span class="text-tx2 text-[13px] ml-1">KDA Ratio</span>
          </div>
          <div class="text-[12px] font-mono text-tx2">
            {playerStats?.killsAverage}
            <span class="text-rd mx-0.5">/ {playerStats?.deathsAverage}/</span>
            {playerStats?.assistsAverage}
          </div>
        </div>
        <div class="flex h-[6px] w-full bg-black/40 rounded-sm overflow-hidden gap-[1px]">
          {#if playerStats}
            {@const total =
              playerStats.killsAverage + playerStats.deathsAverage + playerStats.assistsAverage}
            <div
              class="bg-gr h-full"
              style="width: {(playerStats.killsAverage / total) * 100}%"
            ></div>
            <div
              class="bg-rd h-full"
              style="width: {(playerStats.deathsAverage / total) * 100}%"
            ></div>
            <div class="bg-bl h-full flex-1"></div>
          {/if}
        </div>
      </div>

      <div class="card p-4 flex flex-col justify-center gap-2.5">
        <div class="flex justify-between items-baseline">
          <div class="text-[15px]">
            <span class="text-gd font-bold">{playerStats?.gpmAverage}</span>
            <span class="text-tx2 text-[13px] ml-1">Avg GPM</span>
          </div>
          <div class="text-[12px] font-mono text-tx2">
            <span class="text-bl">{playerStats?.xpmAverage}</span> XPM
          </div>
        </div>
        <div class="flex h-[6px] w-full bg-black/40 rounded-sm overflow-hidden gap-[1px]">
          {#if playerStats}
            {@const total = playerStats.gpmAverage + playerStats.xpmAverage}
            <div
              class="bg-gd h-full"
              style="width: {(playerStats.gpmAverage / total) * 100}%"
            ></div>
            <div class="bg-bl h-full flex-1"></div>
          {/if}
        </div>
      </div>

      <div class="card flex items-center justify-center overflow-hidden p-1.5 h-full min-h-[70px]">
        {#if playerStats?.rank}
          <img
            src={getRankImage(playerStats.rank)}
            alt="Rank badge"
            class="h-[65px] object-contain drop-shadow-xl"
          />
        {:else}
          <div class="text-tx3 text-[11px]">Unranked</div>
        {/if}
      </div>
    </div>
  </div>

  <div class="grid grid-cols-[3fr_2fr] gap-4">
    <div class="flex flex-col gap-4">
      <div class="card overflow-hidden">
        <div class="card-hd">
          <span class="card-ttl">Detailed Match History</span>
          <span class="card-lnk" onclick={() => gotoView('matches')}>View all →</span>
        </div>

        <div class="flex flex-col">
          {#if isLoadingMatches}
            <div class="flex items-center justify-center py-10">
              <span class="text-[12px] text-tx3 animate-pulse">Loading matches…</span>
            </div>
          {:else if matchError}
            <div class="flex items-center justify-center py-10">
              <span class="text-[12px] text-rd">{matchError}</span>
            </div>
          {:else if detailedMatches.length === 0}
            <div class="flex items-center justify-center py-10">
              <span class="text-[12px] text-tx3">No matches found.</span>
            </div>
          {:else}
            {#each detailedMatches as m (m.id)}
              <div
                class="flex items-center gap-4 py-2 px-3 border-b border-bd last:border-b-0 cursor-pointer hover:bg-white/5 transition-colors"
                onclick={() => openMatchDetail(m)}
              >
                <!-- Hero portrait -->
                <div class="w-[55px] h-[31px] rounded-[4px] bg-s4 shrink-0 overflow-hidden">
                  {#if m.heroImg}
                    <img
                      src={m.heroImg}
                      alt={m.heroName}
                      class="w-full h-full object-cover object-top"
                    />
                  {:else}
                    <div
                      class="w-full h-full flex items-center justify-center text-[11px] text-tx3"
                    >
                      ?
                    </div>
                  {/if}
                </div>

                <!-- Lane icon -->
                <div
                  class="w-[24px] h-[24px] shrink-0 flex items-center justify-center text-[11px] text-tx3 font-bold"
                >
                  <img src={toLaneIcon(m.lane)} alt={m.lane} class="w-5 h-5 opacity-70" />
                </div>

                <!-- W/L badges + mode -->
                <div class="flex-1 flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5">
                    <div
                      class="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-extrabold
                        {m.outcome === 'win' ? 'bg-gr text-black' : 'bg-rd text-black'}"
                    >
                      {m.outcome === 'win' ? 'W' : 'L'}
                    </div>
                    <div
                      class="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-extrabold
                        {m.previousOutcome === 'win' ? 'bg-grb text-gr' : 'bg-rdb text-rd'}"
                    >
                      {m.previousOutcome === 'win' ? 'W' : 'L'}
                    </div>
                    <div class="text-[10px] text-tx2 font-bold uppercase truncate">
                      {m.mode}
                    </div>
                  </div>
                </div>

                <!-- KDA -->
                <div
                  class="text-[12px] text-tx2 font-mono font-medium w-[80px] text-center shrink-0"
                >
                  {m.k} / {m.d} / {m.a}
                </div>

                <!-- MMR delta -->
                <div
                  class="text-[12px] font-bold w-[40px] text-right shrink-0
                    {m.mmrChange >= 0 ? 'text-gr' : 'text-rd'}"
                >
                  {m.impactValue}
                </div>

                <!-- Impact bar -->
                <div
                  class="relative w-[100px] h-[6px] rounded-[3px] bg-black-500/20 overflow-hidden shrink-0"
                >
                  <div class="absolute left-1/2 top-0 h-full w-[1px] bg-gray-400"></div>

                  {#if m.impactValue >= 0}
                    <div
                      class={`absolute left-1/2 top-0 h-full ${impactColor(m.impactValue)}`}
                      style="width: {m.impactValue / 2}%"
                    ></div>
                  {:else}
                    <div
                      class={`absolute right-1/2 top-0 h-full ${impactColor(m.impactValue)}`}
                      style="width: {Math.abs(m.impactValue) / 2}%"
                    ></div>
                  {/if}
                </div>
                <div class="w-[20px] h-[20px] shrink-0 flex items-center justify-center">
                  {#if m.award && toAwardIcon(m.award)}
                    <img src={toAwardIcon(m.award)} alt={m.award} class="w-5 h-5 opacity-70" />
                  {/if}
                </div>

                <!-- Party count -->
                <div class="flex items-center gap-1 shrink-0">
                  <div
                    class="w-[16px] h-[16px] shrink-0 flex items-center justify-center text-[11px]"
                  >
                    👤
                  </div>
                  <div class="text-[11px] text-tx2 w-[16px] text-center shrink-0">
                    {m.partyCount}
                  </div>
                  <div
                    class="w-[20px] h-[20px] rounded-full bg-s3 flex items-center justify-center shrink-0 overflow-hidden"
                  >
                    <img src={getRankImage(m.rank)} alt={m.rank} />
                  </div>
                </div>

                <!-- Duration + time ago -->
                <div class="text-tx3 text-right flex flex-col w-[80px] shrink-0 ml-auto">
                  <div class="text-[11.5px] font-medium leading-tight">{m.dur}</div>
                  <div class="text-[10px] text-tx2 leading-tight uppercase font-medium">
                    {m.timeAgo}
                  </div>
                </div>

                <div class="text-tx3 text-[16px] ml-1 transition-colors hover:text-pu2 shrink-0">
                  ›
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- AI Coach card (unchanged) -->
      <div
        class="bg-linear-to-r from-[rgba(123,92,240,0.14)] to-[rgba(56,189,248,0.05)] border border-[#7B5CF0]/30 rounded-xl p-4"
      >
        <div class="flex items-center gap-[11px] mb-[11px]">
          <div
            class="w-10 h-10 rounded-full bg-linear-to-br from-pu to-[#4f46e5] flex items-center justify-center text-[19px] border-2 border-pu2 shrink-0"
          >
            🤖
          </div>
          <div>
            <div class="text-[13px] font-bold">AI Coach Summary</div>
            <div class="text-[10px] text-tx2 mt-0.5">
              Based on your last 30 matches · Updated 2m ago
            </div>
          </div>
        </div>
        <div class="text-[12px] text-tx2 line-height-[1.75]">
          Your hook accuracy improved to <strong class="text-gr">38%</strong> this week — above
          average for your bracket. You're leaving ~15 CS per game in lane. Teams win
          <strong class="text-gr">72%</strong> of games where you secure Aegis. Prioritize Roshan control
          every game.
        </div>
        <div
          class="flex items-center gap-[14px] bg-black/20 rounded-lg p-[10px_13px] mt-3 border border-bd"
        >
          <div class="font-mono text-[30px] font-bold text-gr leading-none">7.8</div>
          <div>
            <div class="text-[11.5px] font-bold text-tx">Overall Rating</div>
            <div class="text-gd text-[13px] tracking-[2px] mt-0.5">★★★★☆</div>
          </div>
          <div class="ml-auto">
            <span class="card-lnk" onclick={() => gotoView('coach')}>Full analysis →</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <!-- Recent Teammates (unchanged) -->
      <div class="card p-4">
        <div class="flex items-center justify-between pb-3 border-b border-bd/40 mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-tx3">Recent Teammates</span>
          <span
            class="text-[11px] text-pu hover:underline cursor-pointer"
            onclick={() => gotoView('teammates')}
          >
            View all →
          </span>
        </div>
        <div class="flex flex-col gap-2">
          {#each recentTeammates as t (t.name)}
            <div
              class="flex items-center gap-3 p-2 bg-s2/40 hover:bg-s2/80 rounded-lg border-l-2 border-l-bd/40 transition-all cursor-pointer min-w-0"
              onclick={() => gotoView('teammates')}
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
                <div class="text-[10px] text-tx3 font-semibold uppercase tracking-wide truncate">
                  {t.matches} matches together
                </div>
              </div>
              <span
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide shrink-0
                  {t.winrate >= 60
                  ? 'bg-grb text-gr'
                  : t.winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}"
              >
                {t.winrate}%
              </span>
              <div
                class="text-tx3 text-sm font-semibold pl-1 transition-colors hover:text-pu2 shrink-0"
              >
                ›
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Most Played Heroes (unchanged) -->
      <div class="card p-4">
        <div class="flex items-center justify-between pb-3 border-b border-bd/40 mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-tx3">Most Played Heroes</span
          >
          <span
            class="text-[11px] text-pu hover:underline cursor-pointer"
            onclick={() => gotoView('heroes')}
          >
            View all →
          </span>
        </div>
        <div class="flex flex-col gap-2">
          {#each HEROES.slice(0, 5) as h (h.id)}
            <div
              class="flex items-center gap-3 p-1.5 hover:bg-s2/40 rounded-lg border border-transparent hover:border-bd/30 transition-all cursor-pointer"
              onclick={() => gotoView('heroes')}
            >
              <div
                class="w-10 h-10 rounded bg-s2 border border-bd/40 flex items-center justify-center text-lg shrink-0"
              >
                {h.icon}
              </div>
              <div class="text-xs font-bold text-tx flex-1 truncate">{h.name}</div>
              <div class="text-[11px] text-tx3 font-mono font-medium w-10 text-right">
                {h.matches}g
              </div>
              <span
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide shrink-0
                  {h.winrate >= 60
                  ? 'bg-grb text-gr'
                  : h.winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}"
              >
                {h.winrate}%
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
