<script lang="ts">
  import itemsData from '../../../../main/data/items.json'

  interface ItemEntry {
    key: string
    id: number
    dname: string
    cost: number
    img: string
    created: boolean
    qual: string
  }

  let search = $state('')
  let showAll = $state(false)

  const allItems: ItemEntry[] = []
  for (const [key, val] of Object.entries(itemsData)) {
    const v = val as Record<string, unknown>
    if (v && typeof v === 'object' && 'id' in v && v.id && v.dname) {
      allItems.push({
        key,
        id: v.id as number,
        dname: v.dname as string,
        cost: (v.cost as number) ?? 0,
        img: ((v.img as string) ?? '').replace('item-assets/', ''),
        created: (v.created as boolean) ?? false,
        qual: (v.qual as string) ?? ''
      })
    }
  }

  const filtered = $derived(
    allItems.filter((item) => {
      if (!showAll && !item.created) return false
      if (search && !item.dname.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  )

  function handleDragStart(e: DragEvent, itemId: number): void {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', String(itemId))
      e.dataTransfer.effectAllowed = 'copy'
    }
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-bd shrink-0">
    <input
      type="text"
      placeholder="Search items..."
      bind:value={search}
      class="flex-1 bg-s2 border border-bd rounded px-2.5 py-1.5 text-xs text-tx outline-none placeholder:text-tx3 focus:border-pu/50"
    />
    <label class="flex items-center gap-1.5 text-xs text-tx2 cursor-pointer shrink-0">
      <input type="checkbox" bind:checked={showAll} class="accent-pu" />
      All
    </label>
  </div>

  <div class="flex-1 overflow-y-auto p-2">
    <div class="grid grid-cols-4 gap-1.5">
      {#each filtered as item (item.id)}
        <div
          draggable="true"
          ondragstart={(e) => handleDragStart(e, item.id)}
          role="button"
          tabindex="0"
          class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-s2 border border-bd/40 cursor-grab active:cursor-grabbing hover:bg-s3 hover:border-pu/30 transition-colors"
          title="{item.dname} ({item.cost}g)"
        >
          <div class="w-9 h-9 rounded overflow-hidden bg-s1">
            <img
              src="item-asset://{item.img}"
              alt={item.dname}
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <span class="text-[8px] text-tx2 leading-tight text-center truncate w-full"
            >{item.dname}</span
          >
          <span class="text-[7px] text-tx3 font-mono">{item.cost}g</span>
        </div>
      {/each}
    </div>
    {#if filtered.length === 0}
      <div class="flex items-center justify-center h-full text-xs text-tx3">No items found</div>
    {/if}
  </div>
</div>

<style>
  input[type='checkbox'] {
    width: 12px;
    height: 12px;
  }
</style>
