export interface Hero {
  id: number;
  localized_name: string;
  img: string;
}

export interface DotaItem {
  id: number;
  name: string;
  localized_name: string;
  img?: string;
}

export interface OpenDotaMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface BenchmarkValue {
  raw: number;
  pct: number;
}

export interface MatchPlayerPerf {
  player_slot: number;
  hero_id: number;
  personaname: string;
  kills: number;
  deaths: number;
  assists: number;
  gold_per_min: number;
  xp_per_min: number;
  hero_damage: number;
  tower_damage: number;
  net_worth?: number;
  level?: number;
  item_0?: number;
  item_1?: number;
  item_2?: number;
  item_3?: number;
  item_4?: number;
  item_5?: number;
  item_neutral?: number;
  benchmarks?: {
    gold_per_min?: BenchmarkValue;
    xp_per_min?: BenchmarkValue;
    hero_damage_per_min?: BenchmarkValue;
    last_hits_per_min?: BenchmarkValue;
  };
}

export interface DetailedMatchData {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  radiant_score: number;
  dire_score: number;
  players: MatchPlayerPerf[];
}