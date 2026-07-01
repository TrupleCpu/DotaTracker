export const TOP_HEROES_FIELDS = `
  heroesGroupBy: matchesGroupBy(request: $heroesGroupByRequest) {
    ... on MatchGroupByHeroType {
      heroId
      matchCount
      winCount
      avgGoldPerMinute
      avgExperiencePerMinute
      lastMatchDateTime
      avgAssists
      avgKills
      avgDeaths
      __typename
    }
    __typename
  }
  heroesPerformanceGroupBy: matchesGroupBy(request: $heroesPerformanceGroupByRequest) {
    ... on MatchGroupByHeroPerformanceType {
      heroId
      position
      matchCount
      winCount
      __typename
    }
    __typename
  }
  dotaPlus @skip(if: $skipDotaPlus) {
    heroId
    level
    __typename
  }
  ...PlayedHeroesAndGameVersionsFragment
`

export const PLAYED_HEROES_FRAGMENT_DEF = `
  fragment PlayedHeroesAndGameVersionsFragment on PlayerType {
    playedHeroes: matchesGroupBy(
      request: {groupBy: HERO, playerList: SINGLE, take: 1000000}
    ) @skip(if: $skipPlayedHeroes) {
      ... on MatchGroupByHeroType {
        heroId
        __typename
      }
      __typename
    }
    __typename
  }
`
