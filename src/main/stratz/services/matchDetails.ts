import { fetchFromStratz } from '../client'
import { MATCH_DETAILS_QUERY } from '../graphql/queries/matchDetails'
import { getLocalMatchById, insertMatch } from '../../db/matchesRepo'
import { loadConfig } from '../../config'

export async function getMatchDetails(matchId: number | string) {
  const numId = Number(matchId)
  const config = loadConfig()
  if (config.autoSyncMatches) {
    const cached = getLocalMatchById(numId)
    if (cached && (cached.players?.length ?? 0) >= 10) {
      return { match: cached }
    }
  }

  const data = await fetchFromStratz(MATCH_DETAILS_QUERY, {
    matchId
  })

  if (config.autoSyncMatches && data?.match) {
    const match = data.match
    const steamId = match.players?.[0]?.steamAccountId
    if (steamId) {
      insertMatch(match, steamId)
    }
  }

  return data
}
