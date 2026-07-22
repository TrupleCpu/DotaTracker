export interface RawMatchPlayer {
  heroId: number
  isVictory: boolean
  imp: number
  kills: number
  deaths: number
  assists: number
  lane: string
  position?: string
  award?: string | null
  partyId?: number
  goldPerMinute?: number
  item0Id?: number
  item1Id?: number
  item2Id?: number
  item3Id?: number
  item4Id?: number
  item5Id?: number
  neutral0Id?: number
  steamAccountId?: number
  role?: string
  level?: number
  isRadiant?: boolean
}

export interface RawRecentMatch {
  id: number
  durationSeconds: number
  gameMode: string
  endDateTime: number
  statsDateTime?: number
  actualRank?: number
  didRadiantWin: boolean
  midLaneOutcome?: string
  bottomLaneOutcome?: string
  topLaneOutcome?: string
  targetPlayer: RawMatchPlayer[]
  allPlayers: { partyId: number }[]
}

export interface HeroGroupByEntry {
  heroId: number
  matchCount: number
  winCount: number
  avgGoldPerMinute: number
  avgExperiencePerMinute: number
  lastMatchDateTime: number
  avgAssists: number
  avgKills: number
  avgDeaths: number
}

export interface HeroPerformanceEntry {
  heroId: number
  position: string
  matchCount: number
  winCount: number
}

export interface PeerEntry {
  matchCount: number
  winCount: number
  lastMatchDateTime: number
  steamAccount: {
    id: number
    name: string
    avatar?: string
  }
}

export interface PlayerDashboardResponse {
  player: {
    steamAccount: {
      name: string
      avatar: string
      seasonRank: number
    }
    matchCount: number
    winCount: number
    performance: {
      killsAverage: number
      deathsAverage: number
      assistsAverage: number
      gpmAverage: number
      xpmAverage: number
    }
    recentMatches: RawRecentMatch[]
    heroesGroupBy: HeroGroupByEntry[]
    heroesPerformanceGroupBy: HeroPerformanceEntry[]
    playedHeroes?: { heroId: number }[]
  }
  stratz: {
    page: {
      player: {
        peers: PeerEntry[]
      }
    }
  }
}

export interface RawMatch {
  id: number
  durationSeconds: number
  gameMode: string
  endDateTime: number
  statsDateTime?: number
  actualRank?: number
  didRadiantWin?: boolean
  midLaneOutcome?: string
  bottomLaneOutcome?: string
  topLaneOutcome?: string
  players: RawMatchPlayer[]
}

export interface RawHeroMatch {
  id: number
  rank: number
  lobbyType: string
  gameMode: string
  endDateTime: number
  durationSeconds: number
  bottomLaneOutcome?: string
  midLaneOutcome?: string
  topLaneOutcome?: string
  allPlayers: { partyId: number }[]
  league?: { id: number; displayName: string } | null
  pickBans?: { heroId: number; isCaptain: boolean }[]
  players: RawMatchPlayer[]
}

export interface MatchesResponse {
  player: {
    matchCount?: number
    matches: RawMatch[]
  }
}

export interface HeroMatchesResponse {
  player: {
    matches: RawHeroMatch[]
  }
}

export interface HeroPerformanceStat {
  heroId: number
  position: string
  matchCount: number
  winCount: number
}
