<script lang="ts">
  import ToolTip from '../ui/ToolTip.svelte'

  let {
    outcome,
    laneOutcome,
    size = 'w-[26px] h-[26px]',
    className = ''
  }: {
    outcome: 'win' | 'loss'
    laneOutcome?: 'won' | 'lost' | 'tie' | null
    size?: string
    className?: string
  } = $props()
</script>

<div class="flex items-center gap-1 shrink-0">
  <ToolTip text={outcome === 'win' ? 'Win' : 'Loss'}>
    <div
      class="flex items-center justify-center rounded-full text-sm font-extrabold leading-none
        {outcome === 'win' ? 'text-gr bg-grb' : 'text-rd bg-rdb'} {size} {className}"
    >
      {outcome === 'win' ? 'W' : 'L'}
    </div>
  </ToolTip>
  {#if laneOutcome}
    <ToolTip
      text={laneOutcome === 'won' ? 'Lane won' : laneOutcome === 'tie' ? 'Lane tied' : 'Lane lost'}
    >
      <div
        class="flex items-center justify-center rounded-[3px] text-[10px] font-extrabold leading-none
          w-3.5 h-3.5
          {laneOutcome === 'won'
          ? 'text-gr bg-grb'
          : laneOutcome === 'tie'
            ? 'text-gd bg-gdb'
            : 'text-rd bg-rdb'}"
      >
        {laneOutcome === 'won' ? '+' : laneOutcome === 'tie' ? '~' : '−'}
      </div>
    </ToolTip>
  {/if}
</div>
