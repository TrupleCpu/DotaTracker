export const FETCH_HERO_MATCHES_QUERY = `
  query PlayerMatchesSummary($request: PlayerMatchesRequestType!, $steamId: Long!) {
    player(steamAccountId: $steamId) {
      steamAccountId
      matches(request: $request) {
        ...MatchRowSummary
        players(steamAccountId: $steamId) {
          ...MatchRowSummaryPlayer
          __typename
        }
        __typename
      }
      __typename
    }
  }

  fragment MatchRowBase on MatchType {
    id
    rank
    lobbyType
    gameMode
    endDateTime
    durationSeconds
    allPlayers: players {
      partyId
      __typename
    }
    league {
      id
      displayName
      __typename
    }
    __typename
  }

  fragment MatchRowBasePlayer on MatchPlayerType {
    steamAccountId
    heroId
    role
    lane
    level
    isVictory
    isRadiant
    partyId
    __typename
  }

  fragment MatchRowSummary on MatchType {
    ...MatchRowBase
    bottomLaneOutcome
    midLaneOutcome
    topLaneOutcome
    pickBans {
      heroId
      isCaptain
      __typename
    }
    __typename
  }

  fragment MatchRowSummaryPlayer on MatchPlayerType {
    ...MatchRowBasePlayer
    imp
    award
    kills
    deaths
    assists
    goldPerMinute
    item0Id
    item1Id
    item2Id
    item3Id
    item4Id
    item5Id
    __typename
  }
`
