export const FETCH_MATCH_QUERY = `
  query GetMatches($steamAccountId: Long!, $request: PlayerMatchesRequestType!) {
    player(steamAccountId: $steamAccountId) {
      matches(request: $request) {
        id
        durationSeconds
        gameMode
        endDateTime
        statsDateTime
        actualRank
        players(steamAccountId: $steamAccountId) {
          heroId
          isVictory
          imp
          kills
          deaths
          assists
          lane
          position
          award
          partyId
          goldPerMinute
          item0Id
          item1Id
          item2Id
          item3Id
          item4Id
          item5Id
          neutral0Id
        }
      }
    }
  }
`