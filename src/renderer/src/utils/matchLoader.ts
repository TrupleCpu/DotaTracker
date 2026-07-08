import type { MockMatch } from './mockData'
import matchesData from './matches.json'
import itemsData from '../../../main/data/items.json'
import { getHero } from './heroMap'

interface ItemEntry {
  id: number
  dname: string
  img: string
}

const itemMap = new Map<number, { name: string; img: string }>()
for (const val of Object.values(itemsData)) {
  const entry = val as ItemEntry
  if (entry.id != null) {
    itemMap.set(entry.id, {
      name: entry.dname ?? `Item #${entry.id}`,
      img: entry.img ?? ''
    })
  }
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function fmtTimeAgo(unixSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}wk ago`
}

function fmtMode(mode: string): string {
  const map: Record<string, string> = {
    ALL_PICK_RANKED: 'Ranked',
    TURBO: 'Turbo',
    ALL_PICK: 'Normal'
  }
  return map[mode] ?? mode
}

function fmtLane(lane: string | null): string {
  const map: Record<string, string> = {
    SAFE_LANE: 'Safe Lane',
    MID_LANE: 'Mid',
    OFF_LANE: 'Offlane'
  }
  return lane ? (map[lane] ?? lane) : 'Unknown'
}

function getItemImg(id: number | null): string {
  if (!id) return ''
  const item = itemMap.get(id)
  if (!item || !item.img) return ''
  const filename = item.img.replace('item-assets/', '')
  return `item-asset://${filename}`
}

const rawMatches = matchesData.data.player.matches

export const MATCHES: MockMatch[] = rawMatches.map((m: any) => {
  const p = m.players[0]
  const hero = p ? getHero(p.heroId) : null

  const itemSlots = ['item0Id', 'item1Id', 'item2Id', 'item3Id', 'item4Id', 'item5Id', 'neutral0Id', '', '']
  const items = itemSlots.map((slot: string) => {
    if (!slot) return ''
    const id: number | null = p?.[slot]
    return getItemImg(id)
  })

  return {
    id: m.id,
    icon: '',
    hero: hero?.localized_name ?? (p ? `Hero #${p.heroId}` : 'Unknown'),
    outcome: p?.isVictory ? 'win' : 'loss',
    mode: fmtMode(m.gameMode),
    k: p?.kills ?? 0,
    d: p?.deaths ?? 0,
    a: p?.assists ?? 0,
    gpm: p?.goldPerMinute ?? 0,
    xpm: 0,
    lh: '0/0',
    nw: '0',
    dur: fmtDuration(m.durationSeconds ?? 0),
    ago: p ? fmtTimeAgo(m.endDateTime) : '',
    role: p ? fmtLane(p.lane) : 'Unknown',
    level: 0,
    items
  }
})

export function getTotalMatches(): number {
  return rawMatches.length
}
