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
