import { fetchFromStratz } from '../stratz/client'
import { HERO_ITEM_PURCHASES_QUERY } from '../stratz/graphql/queries/heroItemPurchases'
import { getHeroTimingsCache, setHeroTimingsCache, getMostPlayedPosition } from '../db/matchesRepo'

const CACHE_TTL_SEC = 86400
const BRACKET_IDS = ['LEGEND_ANCIENT']

export interface HeroTimingItem {
  itemId: number
  avgTimeMin: number
  winRate: number
  matchCount: number
}

interface PurchaseBucket {
  itemId: number
  time: number
  matchCount: number
  winCount: number
  winsAverage: number
}

export async function getHeroTimings(
  heroId: number,
  steamId: number
): Promise<{ items: HeroTimingItem[]; position: string | null }> {
  const position = getMostPlayedPosition(steamId, heroId)
  const bracketKey = BRACKET_IDS.join(',')

  const cached = getHeroTimingsCache(heroId, bracketKey, position)
  const now = Math.floor(Date.now() / 1000)

  if (cached && now - cached.fetched_at < CACHE_TTL_SEC) {
    return { items: JSON.parse(cached.data_json), position }
  }

  const variables: Record<string, any> = {
    heroId,
    bracketBasicIds: BRACKET_IDS
  }
  if (position) {
    variables.positionIds = [position]
  }

  const data = await fetchFromStratz(HERO_ITEM_PURCHASES_QUERY, variables)
  const raw: PurchaseBucket[] = data?.heroStats?.itemFullPurchase || []

  const bucketsByItem = new Map<number, PurchaseBucket[]>()
  for (const b of raw) {
    if (!b.itemId || b.matchCount === 0) continue
    const arr = bucketsByItem.get(b.itemId)
    if (arr) arr.push(b)
    else bucketsByItem.set(b.itemId, [b])
  }

  const items: HeroTimingItem[] = []
  for (const [, buckets] of bucketsByItem) {
    let totalMatchCount = 0
    let totalWinCount = 0
    let weightedTimeSum = 0

    for (const b of buckets) {
      totalMatchCount += b.matchCount
      totalWinCount += b.winCount
      weightedTimeSum += b.time * b.matchCount
    }

    items.push({
      itemId: buckets[0].itemId,
      avgTimeMin: Math.round((weightedTimeSum / totalMatchCount) * 100) / 100,
      winRate: totalMatchCount > 0 ? totalWinCount / totalMatchCount : 0,
      matchCount: totalMatchCount
    })
  }

  items.sort((a, b) => b.matchCount - a.matchCount)

  setHeroTimingsCache(heroId, bracketKey, position, JSON.stringify(items))
  return { items, position }
}
