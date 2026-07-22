import { fetchFromStratz } from '../client'
import { PLAYER_DASHBOARD_QUERY } from '../graphql/queries/playerDashboard'
import { getPlayerCache, setPlayerCache } from '../../db/matchesRepo'

export async function getPlayerData(steamId: number | string, forceRefresh = false): Promise<unknown> {
  const numId = Number(steamId)

  if (!forceRefresh) {
    const cached = getPlayerCache(numId)
    if (cached) {
      return cached.data
    }
  }

  const data = await fetchFromStratz(PLAYER_DASHBOARD_QUERY, {
    steamId,
    peersRequest: {
      playerTeammateSort: 'WITH',
      matchGroupOrderBy: 'MATCH_COUNT',
      orderBy: 'DESC',
      matchLimitMin: 10,
      skip: 0,
      take: 10000
    },
    take: 10000,
    heroesGroupByRequest: {
      groupBy: 'HERO',
      playerList: 'SINGLE',
      skip: 0,
      take: 10000
    },
    heroesPerformanceGroupByRequest: {
      groupBy: 'HERO_PERFORMANCE',
      playerList: 'SINGLE',
      skip: 0,
      take: 10000
    },
    skipPlayedHeroes: false,
    skipDotaPlus: false
  })

  if (data) {
    setPlayerCache(numId, data)
  }

  return data
}
