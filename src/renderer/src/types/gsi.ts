export interface GSIUIStatePlayer {
  gold: number
  net_worth: number
  kills: number
  deaths: number
  assists: number
  gpm: number
  xpm: number
  lh: number
  denies: number
  team: string
}

export interface GSIUIStateHero {
  id: number | null
  name: string
  health: number
  max_health: number
  mana: number
  max_mana: number
  level: number
  alive: boolean
  respawn_seconds: number
}

export interface GSIUIStateItems {
  inventory: string[]
  inventory_ids: number[]
  backpack: string[]
  teleport: string
  neutral: string
}

export interface GSIUIState {
  clock: number
  game_state: string
  roshan: string
  player?: GSIUIStatePlayer
  hero?: GSIUIStateHero
  items?: GSIUIStateItems
}
