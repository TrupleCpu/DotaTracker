const PREFIX = 'dt_llm_'
const TTL = 30 * 60 * 1000

interface CacheEntry<T> {
  data: T
  ts: number
}

function hash(input: unknown): string {
  const s = JSON.stringify(input)
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.ts > TTL) {
      localStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function set<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, ts: Date.now() }
  try {
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    /* quota exceeded, ignore */
  }
}

export function getCachedSessionReview(matches: unknown[]): unknown | null {
  return get(`${PREFIX}sr_${hash(matches)}`)
}

export function setCachedSessionReview(matches: unknown[], data: unknown): void {
  set(`${PREFIX}sr_${hash(matches)}`, data)
}

export function getCachedCoaching(matchId: number | string, playerIndex: number, ctx: unknown): unknown | null {
  return get(`${PREFIX}mc_${matchId}_${playerIndex}_${hash(ctx)}`)
}

export function setCachedCoaching(matchId: number | string, playerIndex: number, ctx: unknown, data: unknown): void {
  set(`${PREFIX}mc_${matchId}_${playerIndex}_${hash(ctx)}`, data)
}

export function invalidateAll(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(PREFIX)) keys.push(k)
  }
  keys.forEach((k) => localStorage.removeItem(k))
}
