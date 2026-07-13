export interface Hero {
  id: number
  localized_name: string
  img: string
  icon: string
  primary_attr: string
  attack_type: string
}

export interface Match {
  id: number
  hero: string
  heroId?: number
  heroImg?: string
  heroName?: string
  outcome: 'win' | 'loss'
  previousOutcome?: 'win' | 'loss'
  mode: string
  k: number
  d: number
  a: number
  gpm: number
  xpm: number
  dur: string
  timeAgo?: string
  ago?: string
  lane: string
  role?: string
  rank: number
  mmrChange?: number
  impactValue?: number
  partyCount?: number
  award?: string | null
  items?: string[]
  level?: number
  lh?: string
  nw?: string
  midLaneOutcome?: string
  bottomLaneOutcome?: string
  topLaneOutcome?: string
  didRadiantWin?: boolean
  position?: string
}

export interface PlayerStats {
  matchCount: number
  winCount: number
  killsAverage: number
  deathsAverage: number
  assistsAverage: number
  gpmAverage: number
  xpmAverage: number
  rank: number
  name: string
  avatar: string
}

export interface Teammate {
  steamAccountId: number
  name: string
  avatar: string | null
  matches: number
  winrate: number
}

export interface HeroStat {
  heroId: number
  matchCount: number
  winCount: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgGoldPerMinute: number
}

export interface DraftHero {
  id: number
  key: string
  name: string
  confidence: number
}

export interface DraftState {
  Radiant: (DraftHero | null)[]
  Dire: (DraftHero | null)[]
}
