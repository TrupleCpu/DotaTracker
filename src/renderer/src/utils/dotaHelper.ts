import type { DotaItem } from '../types/dota'

export function normalizeItems(itemsDataRaw: unknown): Record<string, DotaItem> {
  const itemsData: Record<string, DotaItem> = {}

  if (Array.isArray(itemsDataRaw)) {
    itemsDataRaw.forEach((item: DotaItem) => {
      itemsData[item.id.toString()] = item
    })
  } else if (itemsDataRaw && typeof itemsDataRaw === 'object') {
    Object.values(itemsDataRaw as Record<string, DotaItem>).forEach((item) => {
      if (item && item.id) {
        itemsData[item.id.toString()] = item
      }
    })
  }

  return itemsData
}

export function getHeroImageUrl(imageRelativePath: string): string {
  if (!imageRelativePath) {
    return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/unknown.png'
  }
  const cleanPath = imageRelativePath.endsWith('?')
    ? imageRelativePath.slice(0, -1)
    : imageRelativePath

  return `https://cdn.cloudflare.steamstatic.com${cleanPath}`
}

export function getItemImageUrl(
  itemId: number | undefined,
  itemsData: Record<string, DotaItem>
): string {
  if (!itemId) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="30" viewBox="0 0 42 30"><rect width="42" height="30" fill="%2314151f"/></svg>'
  }

  const matchedItem = itemsData[itemId.toString()]
  if (matchedItem?.img) {
    if (matchedItem.img.startsWith('http')) return matchedItem.img
    const cleanImgPath = matchedItem.img.startsWith('/') ? matchedItem.img : `/${matchedItem.img}`
    return `https://cdn.cloudflare.steamstatic.com${cleanImgPath}`
  }

  if (matchedItem?.name) {
    const cleanName = matchedItem.name.replace('item_', '')
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${cleanName}.png`
  }

  return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/unknown.png'
}

export function isVictory(playerSlot: number, randiantWin: boolean): boolean {
  return playerSlot < 128 === randiantWin
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '0:00'
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}
