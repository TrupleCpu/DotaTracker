export interface AbilityEvent {
  abilityId: number
  time: number
  level: number
  isTalent?: boolean
  abilityType?: {
    id: number
    name: string
    isTalent: boolean
  }
}

export interface ItemPurchaseEvent {
  itemId: number
  time: number
}

export interface KillEvent {
  time: number
  gold: number
  xp: number
  positionX: number
  positionY: number
}

export interface DeathEvent {
  time: number
  goldLost: number
  xpFed: number
  positionX: number
  positionY: number
}

export interface AssistEvent {
  time: number
  gold: number
  xp: number
  positionX: number
  positionY: number
}

export interface WardEvent {
  time: number
  type: number
  positionX: number
  positionY: number
}

export interface RuneEvent {
  time: number
  rune: string
  action: string
  gold?: number
  positionX: number
  positionY: number
}

export interface CreepLocation {
  id: number
  count: number
  xp: number
}

export interface PlayerStatsDetailed {
  deniesPerMinute: number[]
  impPerMinute: number[]
  itemPurchases: ItemPurchaseEvent[]
  farmDistributionReport: {
    creepLocation: CreepLocation[]
  }
  networthPerMinute: number[]
  killEvents: KillEvent[]
  deathEvents: DeathEvent[]
  assistEvents: AssistEvent[]
  heroDamagePerMinute: number[]
  heroDamageReceivedPerMinute: number[]
  campStack: number
  wards: WardEvent[]
  healPerMinute: number[]
  towerDamagePerMinute: number[]
  runes: RuneEvent[]
}

export interface MatchPlayerDetailed {
  steamAccountId: number
  heroId: number
  isVictory: boolean
  imp: number
  kills: number
  deaths: number
  assists: number
  experiencePerMinute: number
  level: number
  position: string
  lane: string
  item0Id: number
  item1Id: number
  item2Id: number
  item3Id: number
  item4Id: number
  item5Id: number
  backpack0Id: number
  backpack1Id: number
  backpack2Id: number
  neutral0Id: number
  goldPerMinute: number
  networth: number
  abilities: AbilityEvent[]
  stats: PlayerStatsDetailed
}

export interface DetailedMatchResponse {
  match: {
    gameMode: string
    radiantNetworthLeads: number[]
    radiantExperienceLeads: number[]
    players: MatchPlayerDetailed[]
  } | null
}

export interface MatchSummary {
  id: number
  hero?: string
  heroName?: string
}

export type Team = 'radiant' | 'dire'
export type StructureType = 'tower' | 'ancient' | 'barracks'

export interface ItemData {
  id: number
  dname: string
  img: string
  cost: number
  created: boolean
}

export interface AbilityHeroEntry {
  abilityId: number
  isTalent?: boolean
  abilityType?: {
    id: number
    name: string
    isTalent: boolean
  }
  time: number
  level: number
}

export interface HeroTimingItem {
  itemId: number
  avgTimeMin: number
  winRate: number
  matchCount: number
}
