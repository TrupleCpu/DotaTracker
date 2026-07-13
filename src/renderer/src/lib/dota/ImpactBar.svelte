<script lang="ts">
  import ToolTip from '../ui/ToolTip.svelte'

  let { value = 0, className = '' }: { value?: number; className?: string } = $props()

  let barColor = $derived(
    value >= 50
      ? 'bg-purple-500'
      : value >= 20
        ? 'bg-purple-400'
        : value >= 0
          ? 'bg-purple-300'
          : value <= -50
            ? 'bg-gray-400/60'
            : value <= -20
              ? 'bg-gray-400/40'
              : 'bg-gray-400/25'
  )

  let barWidth = $derived(Math.min(Math.abs(value) / 2, 100))
  let barSide = $derived(value >= 0 ? 'left-1/2' : 'right-1/2')
  let perfLabel = $derived(
    value >= 50
      ? 'High performance'
      : value >= 20
        ? 'Good performance'
        : value >= 0
          ? 'Average performance'
          : value <= -50
            ? 'Poor performance'
            : value <= -20
              ? 'Low performance'
              : 'Below average'
  )
  let tooltipText = $derived(`${perfLabel} (Impact: ${value >= 0 ? '+' : ''}${value})`)
</script>

<ToolTip text={tooltipText}>
  <div
    class="relative w-[100px] h-[6px] rounded-[3px] bg-black/20 border border-bd overflow-hidden shrink-0 {className}"
  >
    <div class="absolute left-1/2 top-0 h-full w-[1px] bg-gray-400"></div>
    <div class="absolute top-0 {barSide} h-full {barColor}" style="width: {barWidth}%"></div>
  </div>
</ToolTip>
