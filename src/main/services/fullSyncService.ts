import { fetchFromStratz } from '../stratz/client'
import { FETCH_MATCH_QUERY } from '../stratz/graphql/queries/fetchMatches'
import { insertMatchBatch, upsertSyncState, getSyncState } from '../db/matchesRepo'
import { state } from '../state'
import type { RawMatch } from '../../renderer/src/types/api'
import type { Match } from '../db/matchesRepo'

interface FetchMatchesResponse {
  player?: {
    matches?: RawMatch[]
    matchCount?: number
  }
}

const BATCH_SIZE = 100
const PARALLEL_CALLS = 3
const BATCH_DELAY_MS = 3000

let isSyncing = false

function emit(channel: string, data: unknown): void {
  state.mainWindow?.webContents.send(channel, data)
}

export async function startFullSync(steamId: number): Promise<void> {
  if (isSyncing) return
  isSyncing = true

  try {
    const existing = getSyncState(steamId)
    let cursor = existing?.cursor_skip ?? 0
    let totalCount = existing?.total_count ?? 0
    let syncedCount = existing?.synced_count ?? 0

    if (existing?.status === 'complete') {
      cursor = 0
      syncedCount = 0
      totalCount = 0
    }

    upsertSyncState({
      steam_id: steamId,
      status: 'syncing',
      cursor_skip: cursor,
      synced_count: syncedCount,
      total_count: totalCount,
      last_synced_at: Math.floor(Date.now() / 1000)
    })

    emit('sync-progress', { synced: syncedCount, total: totalCount, status: 'syncing' })

    while (true) {
      const batchPromises: Promise<unknown>[] = []
      for (let i = 0; i < PARALLEL_CALLS; i++) {
        const skip = cursor + i * BATCH_SIZE
        batchPromises.push(
          fetchFromStratz(FETCH_MATCH_QUERY, {
            steamAccountId: steamId,
            request: { take: BATCH_SIZE, skip }
          }).catch((err) => {
            console.error('[FullSync] batch error at skip', skip, err)
            return null
          })
        )
      }

      const results = await Promise.all(batchPromises)

      let allEmpty = true
      for (const raw of results) {
        const data = raw as FetchMatchesResponse | null
        if (!data?.player?.matches) continue
        const matches: RawMatch[] = data.player.matches
        if (matches.length === 0) continue
        allEmpty = false
        syncedCount += insertMatchBatch(matches as Match[], steamId)
      }

      if (allEmpty) break

      const firstResult = results[0] as FetchMatchesResponse | null | undefined
      if (totalCount === 0 && firstResult?.player?.matchCount) {
        totalCount = firstResult.player.matchCount
      }

      cursor += PARALLEL_CALLS * BATCH_SIZE

      upsertSyncState({
        steam_id: steamId,
        status: 'syncing',
        cursor_skip: cursor,
        synced_count: syncedCount,
        total_count: totalCount,
        last_synced_at: Math.floor(Date.now() / 1000)
      })

      emit('sync-progress', { synced: syncedCount, total: totalCount, status: 'syncing' })

      await sleep(BATCH_DELAY_MS)
    }

    const finalTotal = totalCount || syncedCount

    upsertSyncState({
      steam_id: steamId,
      status: 'complete',
      cursor_skip: 0,
      synced_count: syncedCount,
      total_count: finalTotal,
      last_synced_at: Math.floor(Date.now() / 1000)
    })

    emit('sync-progress', { synced: syncedCount, total: finalTotal, status: 'complete' })
    emit('sync-complete', { synced: syncedCount, total: finalTotal })
  } catch (err) {
    console.error('[FullSync] error:', err)
    upsertSyncState({
      steam_id: steamId,
      status: 'error',
      cursor_skip: 0,
      synced_count: 0,
      total_count: 0,
      last_synced_at: Math.floor(Date.now() / 1000)
    })
    emit('sync-progress', { synced: 0, total: 0, status: 'error' })
  } finally {
    isSyncing = false
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
