export const RECENT_MATCHES_FRAGMENT = `
recentMatches: matches(request: { take: 7 }) {
  id
  durationSeconds
  gameMode
  endDateTime
  statsDateTime
  
  # 1. Fetch just YOUR player data using the targetPlayer filter
  targetPlayer: players(steamAccountId: $steamId) {
    heroId
    isVictory
    imp
    kills
    deaths
    assists
    lane
    award
    partyId
  }
  
  # 2. Fetch all players in the match so you can calculate party counts
  allPlayers: players {
    partyId
  }
}
`