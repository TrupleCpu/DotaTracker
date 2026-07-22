<script lang="ts">
  import { onMount } from 'svelte'
  import heroesData from '../../../main/data/heroes.json'
  import ItemBrowser from '../lib/dota/ItemBrowser.svelte'
  import GuideSlot from '../lib/dota/GuideSlot.svelte'
  import { uiStore } from '../stores/uiStore.svelte'

  interface HeroEntry {
    id: number
    localized_name: string
    icon: string
  }

  interface SlotData {
    itemId: number
    targetMinute: number
    targetSecond: number
  }

  const SLOT_COUNT = 10
  const heroes: HeroEntry[] = (heroesData as HeroEntry[]).sort((a, b) =>
    a.localized_name.localeCompare(b.localized_name)
  )

  let selectedHeroId = $state<number | null>(null)
  const selectedHero = $derived(heroes.find((h) => h.id === selectedHeroId))
  let slots = $state<SlotData[]>(
    [...Array(SLOT_COUNT)].map(() => ({ itemId: 0, targetMinute: 0, targetSecond: 0 }))
  )
  let isSaving = $state(false)
  let isLoading = $state(false)

  onMount(() => {
    if (heroes.length > 0 && heroes[0]?.id) {
      loadGuideForHero(heroes[0].id)
    }
  })

  async function loadGuideForHero(heroId: number | null): Promise<void> {
    selectedHeroId = heroId
    if (!heroId) return
    isLoading = true
    try {
      const guide: unknown = await window.api.getPlayGuide(heroId)
      if (guide && (guide as { slots: SlotData[] }).slots) {
        const loaded = (guide as { slots: SlotData[] }).slots
        slots = [...Array(SLOT_COUNT)].map((_, i) => ({
          itemId: loaded[i]?.itemId ?? 0,
          targetMinute: loaded[i]?.targetMinute ?? 0,
          targetSecond: loaded[i]?.targetSecond ?? 0
        }))
      } else {
        slots = [...Array(SLOT_COUNT)].map(() => ({ itemId: 0, targetMinute: 0, targetSecond: 0 }))
      }
    } catch {
      slots = [...Array(SLOT_COUNT)].map(() => ({ itemId: 0, targetMinute: 0, targetSecond: 0 }))
    } finally {
      isLoading = false
    }
  }

  async function handleSave(): Promise<void> {
    if (!selectedHeroId) return
    isSaving = true
    try {
      const filled = slots
        .map((s, i) => ({
          slotIndex: i,
          itemId: s.itemId,
          targetMinute: s.targetMinute,
          targetSecond: s.targetSecond
        }))
        .filter((s) => s.itemId !== 0)
      await window.api.savePlayGuide(selectedHeroId, filled)
      uiStore.showToast('Guide saved')
    } catch (err) {
      console.error('Failed to save guide:', err)
      uiStore.showToast('Failed to save guide', 'err')
    } finally {
      isSaving = false
    }
  }

  async function handleReset(): Promise<void> {
    if (!selectedHeroId) return
    await loadGuideForHero(selectedHeroId)
  }

  function handleHeroSelect(e: Event): void {
    const target = e.target as HTMLSelectElement
    const id = target.value ? Number(target.value) : null
    loadGuideForHero(id)
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center justify-between px-4 py-2.5 border-b border-bd shrink-0">
    <div class="flex items-center gap-3">
      <h2 class="text-sm font-bold text-tx">Play Guide</h2>
      <div class="flex items-center gap-2">
        <select
          value={selectedHeroId ?? ''}
          onchange={handleHeroSelect}
          class="bg-s2 border border-bd rounded px-2 py-1 text-xs text-tx outline-none focus:border-pu/50"
        >
          <option value="" disabled>Select hero...</option>
          {#each heroes as hero (hero.id)}
            <option value={hero.id}>{hero.localized_name}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="flex items-center gap-2">
      {#if isLoading}
        <span class="text-xs text-tx3">Loading...</span>
      {/if}
      <button
        onclick={handleReset}
        disabled={!selectedHeroId || isLoading}
        class="px-3 py-1.5 rounded text-xs font-semibold bg-s2 border border-bd text-tx2 hover:text-tx hover:bg-s3 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
      >
        Reset
      </button>
      <button
        onclick={handleSave}
        disabled={!selectedHeroId || isSaving || isLoading}
        class="px-3 py-1.5 rounded text-xs font-semibold bg-pu text-white hover:bg-pu2 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  </div>

  <div class="flex flex-1 overflow-hidden">
    <div class="w-65 shrink-0 border-r border-bd">
      <ItemBrowser />
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      {#if !selectedHeroId}
        <div class="flex items-center justify-center h-full text-xs text-tx3">
          Select a hero to start building a guide
        </div>
      {:else if selectedHero}
        <div class="flex gap-6">
          <div class="flex flex-col items-center shrink-0 w-35 pt-2">
            <img
              src="hero-model://{selectedHero.id}.png"
              alt={selectedHero.localized_name}
              class="w-full h-auto rounded-lg"
            />
            <span class="text-sm font-bold text-tx mt-2 text-center"
              >{selectedHero.localized_name}</span
            >
          </div>
          <div class="grid grid-cols-4 gap-4 flex-1">
            {#each slots as slot, i (i)}
              <GuideSlot
                slotIndex={i}
                bind:itemId={slot.itemId}
                bind:targetMinute={slot.targetMinute}
                bind:targetSecond={slot.targetSecond}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
