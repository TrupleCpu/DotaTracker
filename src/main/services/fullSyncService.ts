import { fetchFromStratz } from '../stratz/client'
import { FETCH_MATCH_QUERY } from '../stratz/graphql/queries/fetchMatches'
import { insertMatchBatch, upsertSyncState, getSyncState, countLocalMatches } from '../db/matchesRepo'
import { state } from '../state'

const BATCH_SIZE = 100
const PARALLEL_CALLS = 7
const BATCH_DELAY_MS = 1500

let isSyncing = false

function emit(channel: string, data: unknown) {
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
      const localCount = countLocalMatches(steamId)
      if (localCount >= totalCount) {
        isSyncing = false
        return
      }
      cursor = 0
      syncedCount = 0
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
      const batchPromises: Promise<any>[] = []
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
      for (const data of results) {
        if (!data?.player?.matches) continue
        const matches: any[] = data.player.matches
        if (matches.length === 0) continue
        allEmpty = false
        syncedCount += insertMatchBatch(matches, steamId)
      }

      if (allEmpty) break

      if (totalCount === 0 && results[0]?.player?.matchCount) {
        totalCount = results[0].player.matchCount
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
