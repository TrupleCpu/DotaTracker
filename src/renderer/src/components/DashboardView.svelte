<script lang="ts">
  import { onMount } from 'svelte'
  import { playerStore, heroMap } from '../lib/playStore.svelte'

  import MidIcon from '../assets/role-icons/mid.svg'
  import CarryIcon from '../assets/role-icons/carry.svg'
  import OfflaneIcon from '../assets/role-icons/offlane.svg'
  import SoftSuppIcon from '../assets/role-icons/soft_support.svg'
  import HardSuppIcon from '../assets/role-icons/hard_support.svg'
  import TopCoreIcon from '../assets/award/topCore.svg'
  import TopSuppIcon from '../assets/award/topSupp.svg'
  import MvpIcon from '../assets/award/mvp.svg'

  const rankImages = import.meta.glob('../assets/ranks/*.png', { eager: true, import: 'default' })

  interface Props {
    openMatchDetail: (match: any) => void
    gotoView: (view: string) => void
  }
  let { openMatchDetail, gotoView }: Props = $props()

  onMount(() => {
    playerStore.loadProfile()
  })
  function getHeroImgUrl(img: string): string {
    return `hero-asset://${img.replace(/^hero-assets\//, '')}`
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

  function toLaneIcon(lane: string): string | null {
    return (
      {
        SAFE_LANE: CarryIcon,
        MID_LANE: MidIcon,
        OFF_LANE: OfflaneIcon,
        LIGHT_SUPPORT: SoftSuppIcon,
        HARD_SUPPORT: HardSuppIcon
      }[lane] ?? null
    )
  }

  function toAwardIcon(award: string): string | null {
    return { TOP_CORE: TopCoreIcon, TOP_SUPPORT: TopSuppIcon, MVP: MvpIcon }[award] ?? null
  }

  function impactColor(value: number): string {
    if (value >= 50) return 'bg-purple-500'
    if (value >= 20) return 'bg-purple-400'
    if (value >= 0) return 'bg-purple-300'
    return value <= -50 ? 'bg-gray-400/60' : value <= -20 ? 'bg-gray-400/40' : 'bg-gray-400/25'
  }

  function laneLabel(lane: string): string {
    return (
      {
        SAFE_LANE: 'Safe Lane (Carry)',
        MID_LANE: 'Mid Lane',
        OFF_LANE: 'Off Lane',
        LIGHT_SUPPORT: 'Soft Support',
        HARD_SUPPORT: 'Hard Support'
      }[lane] ?? lane
    )
  }
</script>

<div class="flex-1 overflow-y-auto p-4 select-none">
  <div class="flex flex-col gap-4 mb-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="card p-4 flex flex-col justify-center gap-3">
        <div class="flex justify-between items-baseline">
          <div class="text-[17px]">
            <span class="text-[#EAB308] font-bold"
              >{playerStore.playerStats
                ? playerStore.playerStats.matchCount.toLocaleString()
                : '—'}</span
            >
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
              >{playerStore?.playerStats
                ? (
                    (playerStore?.playerStats.winCount / playerStore?.playerStats.matchCount) *
                    100
                  ).toFixed(2) + '%'
                : '—'}
            </span>
            <span class="text-tx font-semibold ml-1">Win Rate</span>
          </div>
          <div class="text-[12.5px]">
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
          <div class="bg-[#333] h-full flex-1"></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="card p-4 flex flex-col justify-center gap-2.5">
        <div class="flex justify-between items-baseline">
          <div class="text-[15px]">
            <span class="text-pu2 font-bold">
              {playerStore.playerStats
                ? (
                    (playerStore.playerStats.killsAverage +
                      playerStore.playerStats.assistsAverage) /
                    Math.max(1, playerStore.playerStats.deathsAverage)
                  ).toFixed(2)
                : '—'}</span
            >
            <span class="text-tx2 text-[13px] ml-1">KDA Ratio</span>
          </div>
          <div class="text-[12px] font-mono text-tx2">
            {playerStore.playerStats?.killsAverage}
            <span class="text-rd mx-0.5">/ {playerStore.playerStats?.deathsAverage}/</span>
            {playerStore.playerStats?.assistsAverage}
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

      <div class="card p-4 flex flex-col justify-center gap-2.5">
        <div class="flex justify-between items-baseline">
          <div class="text-[15px]">
            <span class="text-gd font-bold">{playerStore.playerStats?.gpmAverage}</span>
            <span class="text-tx2 text-[13px] ml-1">Avg GPM</span>
          </div>
          <div class="text-[12px] font-mono text-tx2">
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

      <div class="card flex items-center justify-center overflow-hidden p-1.5 h-full min-h-[70px]">
        {#if playerStore.playerStats?.rank}
          <img
            src={getRankImage(playerStore.playerStats.rank)}
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
          {#if playerStore.isLoading}
            <div class="flex items-center justify-center py-10">
              <span class="text-[12px] text-tx3 animate-pulse">Loading matches…</span>
            </div>
          {:else if playerStore.error}
            <div class="flex items-center justify-center py-10">
              <span class="text-[12px] text-rd">{playerStore.error}</span>
            </div>
          {:else if playerStore.detailedMatches.length === 0}
            <div class="flex items-center justify-center py-10">
              <span class="text-[12px] text-tx3">No matches found.</span>
            </div>
          {:else}
            {#each playerStore.detailedMatches as m (m.id)}
              <div
                class="flex items-center gap-4 py-2 px-3 border-b border-bd last:border-b-0 cursor-pointer hover:bg-white/5 transition-colors"
                onclick={() => openMatchDetail(m)}
              >
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

                <div
                  class="relative group w-[24px] h-[24px] shrink-0 flex items-center justify-center text-[11px] text-tx3 font-bold"
                >
                  <img src={toLaneIcon(m.lane)} alt={m.lane} class="w-5 h-5 opacity-70" />

                  <div
                    class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
      whitespace-nowrap rounded-md bg-s4 border border-bd2 px-2 py-1 text-[10px] font-semibold text-tx
      opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
      transition-all duration-100 ease-out z-50 shadow-lg"
                  >
                    {laneLabel(m.lane)}
                    <div
                      class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bd2"
                    ></div>
                  </div>
                </div>

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

                <div
                  class="text-[12px] text-tx2 font-mono font-medium w-[80px] text-center shrink-0"
                >
                  {m.k} / {m.d} / {m.a}
                </div>

                <div
                  class="text-[12px] font-bold w-[40px] text-right shrink-0
                    {m.mmrChange >= 0 ? 'text-gr' : 'text-rd'}"
                >
                  {m.impactValue}
                </div>

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
          {#each playerStore.recentTeammates as t (t.name)}
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
          {#each playerStore.topHeroes as h (h.heroId)}
            {@const hero = heroMap.get(h.heroId)}
            {@const winrate =
              h.matchCount > 0 ? parseFloat(((h.winCount / h.matchCount) * 100).toFixed(1)) : 0}
            <div
              class="flex items-center gap-3 p-1.5 hover:bg-s2/40 rounded-lg border border-transparent hover:border-bd/30 transition-all cursor-pointer"
              onclick={() => gotoView('heroes')}
            >
              <div
                class="w-10 h-10 rounded bg-s2 border border-bd/40 flex items-center justify-center text-lg shrink-0 overflow-hidden"
              >
                {#if hero}
                  <img
                    src={getHeroImgUrl(hero.icon)}
                    alt={hero.localized_name}
                    class="w-full h-full object-cover"
                  />
                {:else}
                  ?
                {/if}
              </div>
              <div class="text-xs font-bold text-tx flex-1 truncate">
                {hero?.localized_name ?? `Hero #${h.heroId}`}
              </div>
              <div class="text-[11px] text-tx3 font-mono font-medium w-10 text-right">
                {h.matchCount}g
              </div>
              <span
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide shrink-0
          {winrate >= 60
                  ? 'bg-grb text-gr'
                  : winrate >= 50
                    ? 'bg-gdb text-gd'
                    : 'bg-rdb text-rd'}"
              >
                {winrate}%
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
