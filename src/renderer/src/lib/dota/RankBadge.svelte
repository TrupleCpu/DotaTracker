<script lang="ts">
  import ToolTip from '../ui/ToolTip.svelte'
  import { rankToString } from '../../utils/rankMap'

  const rankImages = import.meta.glob<{ default: string }>('../../assets/ranks/*.png', {
    eager: true,
    import: 'default'
  })

  let {
    rank,
    size = 'w-5 h-5',
    className = ''
  }: { rank: number; size?: string; className?: string } = $props()

  let src = $derived.by(() => {
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
    return rankImages[`../../assets/ranks/${r}.png`] as string
  })
</script>

{#if src}
  <ToolTip text={rankToString(rank)}>
    <div
      class="{size} rounded flex items-center justify-center shrink-0 overflow-hidden {className}"
    >
      <img {src} alt="rank {rank}" class="w-full h-full object-contain" />
    </div>
  </ToolTip>
{/if}
