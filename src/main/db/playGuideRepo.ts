import { db } from './index'

export interface PlayGuideSlot {
  slotIndex: number
  itemId: number
  targetMinute: number
  targetSecond?: number
  phase?: string
}

export interface PlayGuide {
  heroId: number
  slots: PlayGuideSlot[]
  updatedAt: number
}

export function savePlayGuide(heroId: number, slots: PlayGuideSlot[]): void {
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO play_guides (hero_id, slots_json, updated_at)
      VALUES (?, ?, ?)
    `)
    stmt.run(heroId, JSON.stringify(slots), Math.floor(Date.now() / 1000))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('no such table')) {
      db.exec(`CREATE TABLE IF NOT EXISTS play_guides (
        hero_id INTEGER PRIMARY KEY,
        slots_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`)
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO play_guides (hero_id, slots_json, updated_at)
        VALUES (?, ?, ?)
      `)
      stmt.run(heroId, JSON.stringify(slots), Math.floor(Date.now() / 1000))
    } else {
      throw err
    }
  }
}

export function getPlayGuide(heroId: number): PlayGuide | null {
  const stmt = db.prepare('SELECT * FROM play_guides WHERE hero_id = ?')
  const row = stmt.get(heroId) as
    | { hero_id: number; slots_json: string; updated_at: number }
    | undefined
  if (!row) return null
  return {
    heroId: row.hero_id,
    slots: JSON.parse(row.slots_json) as PlayGuideSlot[],
    updatedAt: row.updated_at
  }
}
