export const GET_HERO_MATCHUPS = `
  query HeroDraftStats($heroId: Short!, $bracketBasicIds: [RankBracketBasicEnum], $matchLimit: Int, $take: Int) {
    heroStats {
      heroVsHeroMatchup(
        heroId: $heroId
        bracketBasicIds: $bracketBasicIds
        matchLimit: $matchLimit
        take: $take
      ) {
        disadvantage {
          vs {
            heroId2
            matchCount
            winRateHeroId1
            winRateHeroId2
            winsAverage
            synergy
          }
        }
      }
    }
  }
`

export const GET_LANE_OUTCOMES = `
  query HeroLaneOutcome($heroId: Short!, $isWith: Boolean!) {
    heroStats {
      laneOutcome(heroId: $heroId, isWith: $isWith) {
        heroId1
        heroId2
        position
        winCount
        matchCount
      }
    }
  }
`

export const GET_DRAFT_WIN_RATES = `
  query GetDraftWinRates($heroIds: [Short!]) {
    heroStats {
      winMonth(heroIds: $heroIds) {
        heroId
        winCount
        matchCount
      }
    }
  }
`
