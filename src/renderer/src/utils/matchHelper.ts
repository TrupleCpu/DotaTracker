import MidIcon from '../assets/role-icons/mid.svg'
import CarryIcon from '../assets/role-icons/carry.svg'
import OfflaneIcon from '../assets/role-icons/offlane.svg'
import SoftSuppIcon from '../assets/role-icons/soft_support.svg'
import HardSuppIcon from '../assets/role-icons/hard_support.svg'

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

export function formatRole(role: string | null, lane?: string | null): string {
  if (role) {
    const map: Record<string, string> = {
      POSITION_1: 'Carry',
      POSITION_2: 'Mid',
      POSITION_3: 'Offlane',
      POSITION_4: 'Soft Support',
      POSITION_5: 'Hard Support'
    }
    return map[role] ?? 'Unknown'
  }
  if (lane) {
    const laneMap: Record<string, string> = {
      SAFE_LANE: 'Carry',
      MID_LANE: 'Mid',
      OFF_LANE: 'Offlane',
      LIGHT_SUPPORT: 'Soft Support',
      HARD_SUPPORT: 'Hard Support'
    }
    return laneMap[lane] ?? 'Unknown'
  }
  return 'Unknown'
}

export function toLaneIcon(lane: string): string | null {
  return (
    {
      SAFE_LANE: CarryIcon,
      MID_LANE: MidIcon,
      OFF_LANE: OfflaneIcon,
      LIGHT_SUPPORT: SoftSuppIcon,
      HARD_SUPPORT: HardSuppIcon
    }[lane] ?? null
  )
}
