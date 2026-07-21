import { POSITION_LABELS, LANE_ROLE_LABELS } from './roleMap'

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatTimeAgo(unixSeconds: number | null): string {
  if (!unixSeconds) return 'Unknown'
  const diff = Math.floor(Date.now() / 1000) - unixSeconds
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}wk ago`
}

export function formatGameMode(mode: string): string {
  const map: Record<string, string> = {
    ALL_PICK_RANKED: 'Ranked',
    TURBO: 'Turbo',
    ALL_PICK: 'Normal'
  }
  return map[mode] ?? mode
}

export function getLaneOutcome(match: {
  lane: string
  outcome: 'win' | 'loss'
  didRadiantWin?: boolean
  midLaneOutcome?: string
  bottomLaneOutcome?: string
  topLaneOutcome?: string
}): 'won' | 'lost' | 'tie' | null {
  const { lane, outcome, didRadiantWin, midLaneOutcome, bottomLaneOutcome, topLaneOutcome } = match
  if (!lane || didRadiantWin === undefined) return null

  const playerIsRadiant = (outcome === 'win') === didRadiantWin

  let laneOutcome: string | undefined
  if (lane === 'MID_LANE') {
    laneOutcome = midLaneOutcome
  } else if (lane === 'SAFE_LANE') {
    laneOutcome = playerIsRadiant ? bottomLaneOutcome : topLaneOutcome
  } else if (lane === 'OFF_LANE') {
    laneOutcome = playerIsRadiant ? topLaneOutcome : bottomLaneOutcome
  } else {
    return null
  }

  if (!laneOutcome) return null
  if (laneOutcome === 'TIE') return 'tie'
  return laneOutcome.includes(playerIsRadiant ? 'RADIANT' : 'DIRE') ? 'won' : 'lost'
}

export function formatRole(role: string | null, lane?: string | null): string {
  if (role) {
    return POSITION_LABELS[role] ?? 'Unknown'
  }
  if (lane) {
    return LANE_ROLE_LABELS[lane] ?? 'Unknown'
  }
  return 'Unknown'
}


