import { PLAYER_STATS_FRAGMENT } from '../fragments/playerStats'
import { RECENT_MATCHES_FRAGMENT } from '../fragments/matchHistory'
import { PEERS_FRAGMENT } from '../fragments/peers'

export const PLAYER_DASHBOARD_QUERY = `
query PlayerDashboard($steamId: Long!, $peersRequest: PlayerTeammatesGroupByRequestType!) {
  player(steamAccountId: $steamId) {
    ${PLAYER_STATS_FRAGMENT}
    ${RECENT_MATCHES_FRAGMENT}
  }

  ${PEERS_FRAGMENT}
}
`
