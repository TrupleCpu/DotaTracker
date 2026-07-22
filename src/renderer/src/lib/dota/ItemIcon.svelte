<script lang="ts">
  let {
    itemId,
    size = 'w-[30px] h-[30px]',
    className = ''
  }: { itemId: number; size?: string; className?: string } = $props()

  import itemsData from '../../../../main/data/items.json'
  import { SvelteMap } from 'svelte/reactivity'

  const itemMap = new SvelteMap<number, string>()
  for (const val of Object.values(itemsData) as Array<{ id: number; img: string }>) {
    if (val.id != null && val.img) {
      itemMap.set(val.id, val.img.replace('item-assets/', ''))
    }
  }

  let src = $derived.by(() => {
    const filename = itemMap.get(itemId)
    return filename ? `item-asset://${filename}` : ''
  })
</script>

{#if src}
  <div class="{size} rounded bg-s2 overflow-hidden {className}">
    <img {src} alt="" class="w-full h-full object-cover" />
  </div>
{/if}
