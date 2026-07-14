import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

const dbPath = path.join(app.getPath('userData'), 'dota_cache.sqlite')
export const db = new Database(dbPath)

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      match_id INTEGER PRIMARY KEY,
      steam_account_id INTEGER,
      hero_id INTEGER,
      is_win BOOLEAN,
      duration_seconds INTEGER,
      start_date_time INTEGER,
      json_data TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_steam_account ON matches(steam_account_id);
  `)
}
