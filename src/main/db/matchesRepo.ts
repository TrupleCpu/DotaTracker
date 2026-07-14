import { db } from './index'

export function insertMatch(match: any, steamId: number) {
  // Defensive check: match must have players and a duration
  if (!match || !match.players || match.players.length === 0) return;
  
  // Try to find the player that matches steamId (if not, use the first one as fallback, although Stratz usually filters to the player requested)
  const p = match.players.find((player: any) => player.steamAccountId === steamId) || match.players[0]

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO matches (match_id, steam_account_id, hero_id, is_win, duration_seconds, start_date_time, json_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    match.id, 
    steamId, 
    p.heroId, 
    p.isVictory ? 1 : 0, 
    match.durationSeconds, 
    match.endDateTime, 
    JSON.stringify(match)
  )
}

export function getLocalMatches(steamId: number, limit = 50, skip = 0) {
  const stmt = db.prepare('SELECT json_data FROM matches WHERE steam_account_id = ? ORDER BY start_date_time DESC LIMIT ? OFFSET ?')
  const rows = stmt.all(steamId, limit, skip)
  return rows.map((r: any) => JSON.parse(r.json_data))
}

export function countLocalMatches(steamId: number) {
  const stmt = db.prepare('SELECT COUNT(*) as c FROM matches WHERE steam_account_id = ?')
  const row = stmt.get(steamId) as { c: number }
  return row.c
}
