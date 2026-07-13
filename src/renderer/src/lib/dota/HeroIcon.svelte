<script lang="ts">
  import { getHero, getHeroImgUrl } from '../../utils/heroMap'

  let {
    heroId,
    heroName,
    img,
    size = 'w-10 h-10',
    className = ''
  }: {
    heroId?: number | null
    heroName?: string | null
    img?: string | null
    size?: string
    className?: string
  } = $props()

  let src = $derived(
    img
      ? img.startsWith('hero-asset://')
        ? img
        : `hero-asset://${img.replace(/^hero-assets\//, '')}`
      : heroId
        ? (() => {
            const h = getHero(heroId)
            return h ? getHeroImgUrl(h.icon) : ''
          })()
        : ''
  )
  let alt = $derived(heroName ?? 'hero')
</script>

{#if src}
  <div class="{size} rounded bg-s2 border border-bd/40 overflow-hidden shrink-0 {className}">
    <img {src} {alt} class="w-full h-full object-cover object-top" />
  </div>
{:else}
  <div
    class="{size} rounded bg-s2 border border-bd/40 flex items-center justify-center text-xs text-tx3 shrink-0 {className}"
  >
    ?
  </div>
{/if}
