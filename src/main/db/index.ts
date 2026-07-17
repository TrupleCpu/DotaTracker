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

    CREATE TABLE IF NOT EXISTS sync_state (
      steam_id INTEGER PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'idle',
      cursor_skip INTEGER NOT NULL DEFAULT 0,
      synced_count INTEGER NOT NULL DEFAULT 0,
      total_count INTEGER NOT NULL DEFAULT 0,
      last_synced_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS hero_timings_cache (
      hero_id INTEGER NOT NULL,
      bracket_ids TEXT NOT NULL,
      position_id TEXT,
      data_json TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      PRIMARY KEY (hero_id, bracket_ids, position_id)
    );
    DROP TABLE IF EXISTS global_timings_cache;
    DROP TABLE IF EXISTS personal_timings;

    CREATE TABLE IF NOT EXISTS player_cache (
      steam_id INTEGER PRIMARY KEY,
      data_json TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );
  `)
}
