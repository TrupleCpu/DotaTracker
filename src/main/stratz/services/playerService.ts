import { fetchFromStratz } from '../client'
import { PLAYER_DASHBOARD_QUERY } from '../graphql/queries/playerDashboard'

export async function getPlayerData(steamId: number) {
  const data = await fetchFromStratz(PLAYER_DASHBOARD_QUERY, {
    steamId,
    take: 1000,
    peersRequest: {
      playerTeammateSort: 'WITH',
      matchGroupOrderBy: 'MATCH_COUNT',
      orderBy: 'DESC',
      matchLimitMin: 10,
      skip: 0,
      take: 1000
    }
  })
  console.log(JSON.stringify(data, null, 2))
  return data
}
