import { fetchFromStratz } from '../client'
import { FETCH_MATCH_QUERY } from '../graphql/queries/fetchMatches'

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

  const request: Record<string, unknown> = { take, skip }
  if (gameModeIds) request.gameModeIds = gameModeIds
  if (lobbyTypeIds) request.lobbyTypeIds = lobbyTypeIds
  if (bracketIds) request.bracketIds = bracketIds
  if (positionIds) request.positionIds = positionIds
  if (isParty !== undefined) request.isParty = isParty

  const data = await fetchFromStratz(FETCH_MATCH_QUERY, {
    steamAccountId,
    request
  })
  return data
}
