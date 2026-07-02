import { fetchFromStratz } from '../client'
import { PLAYER_DASHBOARD_QUERY } from '../graphql/queries/playerDashboard'

export async function getPlayerData(steamId: number | string) {
  const data = await fetchFromStratz(PLAYER_DASHBOARD_QUERY, {
    steamId,
    peersRequest: {
      playerTeammateSort: 'WITH',
      matchGroupOrderBy: 'MATCH_COUNT',
      orderBy: 'DESC',
      matchLimitMin: 10,
      skip: 0,
      take: 1000
    },
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
  console.log(JSON.stringify(data.player.name, null, 2))
  return data
}
