<script lang="ts">
  import ToolTip from '../ui/ToolTip.svelte'
  import TopCoreIcon from '../../assets/award/topCore.svg'
  import TopSuppIcon from '../../assets/award/topSupp.svg'
  import MvpIcon from '../../assets/award/mvp.svg'

  let { award, className = '' }: { award: string | null | undefined; className?: string } = $props()

  let src = $derived(
    ({ TOP_CORE: TopCoreIcon, TOP_SUPPORT: TopSuppIcon, MVP: MvpIcon } as Record<string, string>)[
      award ?? ''
    ] ?? null
  )

  let label = $derived(
    ({ TOP_CORE: 'Top Core', TOP_SUPPORT: 'Top Support', MVP: 'MVP' } as Record<string, string>)[
      award ?? ''
    ] ?? ''
  )
</script>

{#if src}
  <ToolTip text={label}>
    <img {src} alt={award ?? ''} class="w-5 h-5 opacity-70 {className}" />
  </ToolTip>
{/if}
