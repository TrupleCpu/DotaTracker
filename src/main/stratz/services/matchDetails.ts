import { fetchFromStratz } from '../client'
import { MATCH_DETAILS_QUERY } from '../graphql/queries/matchDetails'
import { getLocalMatchById, insertMatch } from '../../db/matchesRepo'
import type { Match } from '../../db/matchesRepo'
import { loadConfig } from '../../config'

export async function getMatchDetails(matchId: number | string): Promise<unknown> {
  const numId = Number(matchId)
  const config = loadConfig()
  if (config.autoSyncMatches) {
    const cached = getLocalMatchById(numId)
    if (cached && (cached.players?.length ?? 0) >= 10) {
      const hasDetailFields = (cached.players as unknown as Record<string, unknown>[]).some(
        (p) => p != null && 'abilities' in p
      )
      if (hasDetailFields) {
        const hasEventFields = (cached.players as unknown as Record<string, unknown>[]).some(
          (p) => {
            const stats = p?.stats as Record<string, unknown> | undefined
            const deaths = stats?.deathEvents as Record<string, unknown>[] | undefined
            if (!deaths || deaths.length === 0) return true
            return deaths.some((d) => 'attacker' in d || 'killer' in d)
          }
        )
        if (hasEventFields) {
          return { match: cached }
        }
      }
    }
  }

  const data = (await fetchFromStratz(MATCH_DETAILS_QUERY, {
    matchId
  })) as { match?: import('../../../renderer/src/types/api').RawMatch }

  if (config.autoSyncMatches && data?.match) {
    const match = data.match
    const steamId = match.players?.[0]?.steamAccountId
    if (steamId) {
      insertMatch(match as Match, steamId)
    }
  }
  return data
}
