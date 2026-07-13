<script lang="ts">
  import CarryIcon from '../../assets/role-icons/carry.svg'
  import MidIcon from '../../assets/role-icons/mid.svg'
  import OfflaneIcon from '../../assets/role-icons/offlane.svg'
  import SoftSuppIcon from '../../assets/role-icons/soft_support.svg'
  import HardSuppIcon from '../../assets/role-icons/hard_support.svg'

  let {
    lane,
    size = 'w-5 h-5',
    className = ''
  }: { lane: string; size?: string; className?: string } = $props()

  let src = $derived(
    (
      {
        SAFE_LANE: CarryIcon,
        MID_LANE: MidIcon,
        OFF_LANE: OfflaneIcon,
        LIGHT_SUPPORT: SoftSuppIcon,
        HARD_SUPPORT: HardSuppIcon
      } as Record<string, string>
    )[lane] ?? null
  )
</script>

{#if src}
  <img {src} alt={lane} class="{size} opacity-70 {className}" />
{/if}
