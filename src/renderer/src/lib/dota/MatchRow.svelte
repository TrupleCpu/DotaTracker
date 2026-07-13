<script lang="ts">
  import type { Match } from '../../types'
  import HeroIcon from './HeroIcon.svelte'
  import LaneIcon from './LaneIcon.svelte'
  import WinLossBadge from './WinLossBadge.svelte'
  import AwardBadge from './AwardBadge.svelte'
  import ImpactBar from './ImpactBar.svelte'
  import RankBadge from './RankBadge.svelte'
  import { formatRole, getLaneOutcome } from '../../utils/matchHelper'

  let {
    match,
    onClick,
    compact = false
  }: { match: Match; onClick: () => void; compact?: boolean } = $props()
</script>

<div
  class="flex items-center gap-4 py-2 px-3 border-b border-bd last:border-b-0 cursor-pointer hover:bg-white/[0.03] transition-colors"
  role="button"
  tabindex="0"
  onclick={onClick}
  onkeydown={(e) => e.key === 'Enter' && onClick()}
>
  <HeroIcon
    heroId={match.heroId}
    heroName={match.heroName}
    img={match.heroImg}
    size="w-[55px] h-[31px]"
  />

  <div class="relative group w-[24px] h-[24px] shrink-0 flex items-center justify-center">
    <LaneIcon lane={match.lane} size="w-5 h-5" />
    <div
      class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
        whitespace-nowrap rounded-md bg-s4 border border-bd2 px-2 py-1 text-xs font-semibold text-tx
        opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
        transition-all duration-100 ease-out z-50 shadow-lg"
    >
      {formatRole(null, match.lane)}
    </div>
  </div>

  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-1.5">
      <WinLossBadge outcome={match.outcome} laneOutcome={getLaneOutcome(match)} size="w-[18px] h-[18px]" />
      {#if match.previousOutcome}
        <div
          class="w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-extrabold
            {match.previousOutcome === 'win' ? 'bg-grb text-gr' : 'bg-rdb text-rd'}"
        >
          {match.previousOutcome === 'win' ? 'W' : 'L'}
        </div>
      {/if}
      <div class="text-xs text-tx2 font-bold uppercase truncate">{match.mode}</div>
    </div>
  </div>

  <div class="text-sm text-tx2 font-mono font-medium font-tabular w-[80px] text-center shrink-0">
    {match.k} / {match.d} / {match.a}
  </div>

  {#if match.impactValue !== undefined}
    <div
      class="text-sm font-bold font-mono font-tabular w-[40px] text-right shrink-0 {match.impactValue >=
      0
        ? 'text-gr'
        : 'text-rd'}"
    >
      {match.impactValue}
    </div>
    <ImpactBar value={match.impactValue} />
  {/if}

  <div class="w-[20px] h-[20px] shrink-0 flex items-center justify-center">
    <AwardBadge award={match.award} />
  </div>

  <div class="flex items-center gap-1 shrink-0">
    <div class="w-[16px] h-[16px] shrink-0 flex items-center justify-center text-xs">👤</div>
    <div class="text-xs text-tx2 w-[16px] text-center shrink-0">{match.partyCount ?? 0}</div>
    <RankBadge rank={match.rank} />
  </div>

  <div class="text-tx3 text-right flex flex-col w-[80px] shrink-0 ml-auto">
    <div class="text-sm font-medium font-mono font-tabular leading-tight">{match.dur}</div>
    <div class="text-xs text-tx2 leading-tight uppercase font-medium">{match.timeAgo}</div>
  </div>

  <div class="text-tx3 text-lg ml-1 transition-colors hover:text-pu2 shrink-0">›</div>
</div>
