import { PLAYER_STATS_FRAGMENT } from '../fragments/playerStats'
import { RECENT_MATCHES_FRAGMENT } from '../fragments/matchHistory'
import { PEERS_FRAGMENT } from '../fragments/peers'
import { TOP_HEROES_FIELDS, PLAYED_HEROES_FRAGMENT_DEF } from '../fragments/topHeroes'

export const PLAYER_DASHBOARD_QUERY = `
query PlayerDashboard(
  $steamId: Long!
  $peersRequest: PlayerTeammatesGroupByRequestType!
  $heroesGroupByRequest: PlayerMatchesGroupByRequestType!
  $heroesPerformanceGroupByRequest: PlayerMatchesGroupByRequestType!
  $skipPlayedHeroes: Boolean!
  $skipDotaPlus: Boolean!
) {
  player(steamAccountId: $steamId) {
    ${PLAYER_STATS_FRAGMENT}
    ${RECENT_MATCHES_FRAGMENT}
    ${TOP_HEROES_FIELDS}
  }

  ${PEERS_FRAGMENT}
}

${PLAYED_HEROES_FRAGMENT_DEF}
`
