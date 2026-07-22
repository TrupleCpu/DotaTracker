interface PlayGuideSlot {
  slotIndex: number
  itemId: number
  targetMinute: number
  targetSecond?: number
  phase?: string
}

interface GuideAcquiredInfo {
  acquiredAtClock: number
  targetMinute: number
  name: string
}

import type { GSIUIState } from '../types/gsi'
import itemsData from '../../../main/data/items.json'

function lookupItemImg(itemId: number): string | null {
  for (const val of Object.values(itemsData)) {
    const v = val as Record<string, unknown>
    if (v?.id === itemId) {
      const img = ((v.img as string) ?? '').replace('item-assets/', '')
      return img || null
    }
  }
  return null
}

function lookupItemName(itemId: number): string | null {
  for (const val of Object.values(itemsData)) {
    const v = val as Record<string, unknown>
    if (v?.id === itemId && typeof v.dname === 'string') {
      return v.dname
    }
  }
  return null
}

class OverlayStore {
  gpm = $state(0)
  xpm = $state(0)
  kills = $state(0)
  clock = $state(0)

  benchmarks = $state<Record<string, unknown> | null>(null)

  currentHeroId = $state<number | null>(null)
  guideSlots = $state<PlayGuideSlot[]>([])
  prevInventoryIds = $state<number[]>([])
  acquiredItems = $state<Map<number, GuideAcquiredInfo>>(new Map())
  lastClock = $state(0)

  minutes = $derived(this.clock > 0 ? this.clock / 60 : 0)
  kpm_calc = $derived(this.minutes > 0 ? this.kills / this.minutes : 0)

  gpm_percentile = $derived(this.calcPercentile('gold_per_min', this.gpm))
  xpm_percentile = $derived(this.calcPercentile('xp_per_min', this.xpm))
  kpm_percentile = $derived(this.calcPercentile('kills_per_min', this.kpm_calc))

  gpm_diff = $derived(this.calcDiff('gold_per_min', this.gpm))
  xpm_diff = $derived(this.calcDiff('xp_per_min', this.xpm))
  kpm_diff = $derived(this.calcDiff('kills_per_min', this.kpm_calc))

  gpm_status = $derived(this.gpm_diff >= 0 ? 'up' : 'down')
  xpm_status = $derived(this.xpm_diff >= 0 ? 'up' : 'down')
  kpm_status = $derived(this.kpm_diff >= 0 ? 'up' : 'down')

  gpm_label = $derived(this.getLabel(this.gpm_diff))
  xpm_label = $derived(this.getLabel(this.xpm_diff))
  kpm_label = $derived(this.getLabel(this.kpm_diff))

  setGuideSlots(slots: PlayGuideSlot[]): void {
    this.guideSlots = slots
    this.prevInventoryIds = []
    this.acquiredItems = new Map()
  }

  updateFromGsi(data: GSIUIState): void {
    if (data.player) {
      this.gpm = data.player.gpm ?? 0
      this.xpm = data.player.xpm ?? 0
      this.kills = data.player.kills ?? 0
    }
    if (data.hero) {
      if (data.hero.id != null) {
        this.currentHeroId = data.hero.id
        this.loadBenchmarks(data.hero.id)
      }
    }
    if (typeof data.clock === 'number') {
      const newClock = data.clock
      const isNewGame =
        (this.lastClock > 60 && (newClock <= 5 || newClock < this.lastClock - 30))
        || (this.prevInventoryIds.length > 0 && newClock === 0)
      if (isNewGame) {
        this.prevInventoryIds = []
        this.acquiredItems = new Map()
      }
      this.lastClock = this.clock
      this.clock = newClock
    }
    if (data.items?.inventory_ids) {
      this.detectNewAcquisitions(data.items.inventory_ids, data.items.inventory ?? [])
    }
  }

  private detectNewAcquisitions(currentIds: number[], names: string[]): void {
    if (this.prevInventoryIds.length === 0) {
      this.prevInventoryIds = [...currentIds]
      return
    }

    for (let i = 0; i < currentIds.length; i++) {
      const id = currentIds[i]
      if (id === 0) continue
      if (!this.prevInventoryIds.includes(id) && !this.acquiredItems.has(id)) {
        const guideSlot = this.guideSlots.find((s) => s.itemId === id)
        if (guideSlot) {
          const targetSec = guideSlot.targetMinute * 60 + (guideSlot.targetSecond ?? 0)
          const diffSeconds = this.clock - targetSec
          const displayName = lookupItemName(id) || names[i] || `Item #${id}`
          this.acquiredItems.set(id, {
            acquiredAtClock: this.clock,
            targetMinute: guideSlot.targetMinute,
            name: displayName
          })
          this.showNotification(displayName, guideSlot.targetMinute, this.clock, diffSeconds)
          window.api.showGuideNotification({
            itemName: displayName,
            itemImg: lookupItemImg(id),
            targetMinute: guideSlot.targetMinute,
            acquiredAtClock: this.clock,
            diffSeconds
          })
        }
      }
    }

    this.prevInventoryIds = [...currentIds]
  }

  async loadBenchmarks(heroId: number): Promise<void> {
    try {
      this.benchmarks = (await window.api.getBenchmarks(heroId)) as Record<string, unknown>
    } catch (err) {
      console.error('[Benchmark] Failed to load:', err)
    }
  }

  private calcPercentile(stat: string, value: number): string {
    if (!this.benchmarks) return '—'
    const buckets = ((this.benchmarks as Record<string, unknown>)?.result as Record<string, Array<{ percentile: number; value: number }>> | undefined)?.[stat]
    if (!buckets || !buckets.length) return '—'
    let label = 'P0'
    for (const b of buckets) {
      if (value >= b.value) label = `P${Math.round(b.percentile * 100)}`; else break
    }
    return label
  }

  private getMedian(stat: string): number {
    if (!this.benchmarks) return 0
    const buckets = ((this.benchmarks as Record<string, unknown>)?.result as Record<string, Array<{ percentile: number; value: number }>> | undefined)?.[stat]
    return buckets?.find((b) => b.percentile === 0.5)?.value ?? 0
  }

  private calcDiff(stat: string, value: number): number {
    const median = this.getMedian(stat)
    if (median <= 0) return 0
    return ((value - median) / median) * 100
  }

  private getLabel(diff: number): string {
    if (diff > 20) return 'High'
    if (diff > 0) return 'Above'
    if (diff > -20) return 'Avg'
    return 'Low'
  }

  private showNotification(_itemName: string, _targetMinute: number, _acquiredAtClock: number, _diffSeconds: number): void {
  }

  isItemAcquired(itemId: number): boolean {
    return this.acquiredItems.has(itemId)
  }

  getAcquiredInfo(itemId: number): GuideAcquiredInfo | undefined {
    return this.acquiredItems.get(itemId)
  }
}

export const overlayStore = new OverlayStore()
