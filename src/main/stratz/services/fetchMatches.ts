import { fetchFromStratz } from '../client'
import { FETCH_MATCH_QUERY } from '../graphql/queries/fetchMatches'
import { getLocalMatches, getLocalHeroMatches, insertMatchBatch } from '../../db/matchesRepo'
import { loadConfig } from '../../config'

const CACHE_TTL_MS = 5 * 60 * 1000
const lastFetchMap = new Map<number, number>()

export interface FetchMatchesOptions {
  take?: number
  skip?: number
  gameModeIds?: number[] | string[]
  lobbyTypeIds?: number[]
  bracketIds?: number[]
  positionIds?: string[]
  isParty?: boolean
}

export async function fetchMatches(
  steamAccountId: number | string,
  options: FetchMatchesOptions = {}
) {
  const {
    take = 20,
    skip = 0,
    gameModeIds,
    lobbyTypeIds,
    bracketIds,
    positionIds,
    isParty
  } = options

  const hasComplexFilters = gameModeIds || lobbyTypeIds || bracketIds || positionIds || isParty !== undefined
  const config = loadConfig()
  const numId = Number(steamAccountId)

  if (config.autoSyncMatches && !hasComplexFilters) {
    const localMatches = getLocalMatches(numId, take, skip)

    if (localMatches.length > 0) {
      if (skip === 0) {
        const lastFetch = lastFetchMap.get(numId)
        const isFresh = lastFetch && (Date.now() - lastFetch) < CACHE_TTL_MS
        if (isFresh) return { player: { matches: localMatches } }
      } else {
        return { player: { matches: localMatches } }
      }
    }
  }

  const request: Record<string, unknown> = { take, skip }
  if (gameModeIds) request.gameModeIds = gameModeIds
  if (lobbyTypeIds) request.lobbyTypeIds = lobbyTypeIds
  if (bracketIds) request.bracketIds = bracketIds
  if (positionIds) request.positionIds = positionIds
  if (isParty !== undefined) request.isParty = isParty

  const data = await fetchFromStratz(FETCH_MATCH_QUERY, {
    steamAccountId,
    request
  }) as { player?: { matches?: import('../../../renderer/src/types/api').RawMatch[] } }

  if (config.autoSyncMatches && !hasComplexFilters && data?.player?.matches) {
    insertMatchBatch(data.player.matches as any, numId)
  }

  if (skip === 0) lastFetchMap.set(numId, Date.now())

  return data
}

import { FETCH_HERO_MATCHES_QUERY } from '../graphql/queries/fetchHeroMatches'

export async function fetchHeroMatches(
  steamAccountId: number | string,
  heroId: number,
  skip: number = 0,
  take: number = 20
) {
  const config = loadConfig()
  const numId = Number(steamAccountId)

  if (config.autoSyncMatches) {
    const localMatches = getLocalHeroMatches(numId, heroId, take, skip)

    if (localMatches.length > 0) {
      if (skip === 0) {
        const lastFetch = lastFetchMap.get(numId)
        const isFresh = lastFetch && (Date.now() - lastFetch) < CACHE_TTL_MS
        if (isFresh) return { player: { matches: localMatches } }
      } else {
        return { player: { matches: localMatches } }
      }
    }
  }

  const request: Record<string, unknown> = { heroIds: [heroId], skip, take }

  const data = await fetchFromStratz(FETCH_HERO_MATCHES_QUERY, {
    steamId: numId,
    request
  }) as { player?: { matches?: import('../../../renderer/src/types/api').RawMatch[] } }

  if (config.autoSyncMatches && data?.player?.matches) {
    insertMatchBatch(data.player.matches as any, numId)
  }

  if (skip === 0) lastFetchMap.set(numId, Date.now())

  return data
}
