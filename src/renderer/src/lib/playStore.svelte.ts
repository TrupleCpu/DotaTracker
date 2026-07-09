import heroesData from '../../../main/data/heroes.json'
import { formatDuration, formatGameMode, formatTimeAgo } from '../utils/matchHelper'
interface HeroData {
  id: number
  name: string
  localized_name: string
  img: string
}

interface StratzMatch {
  id: number
  heroId: number
  heroName: string
  heroImg: string
  outcome: 'win' | 'loss'
  previousOutcome: 'win' | 'loss'
  k: number
  d: number
  a: number
  mode: string
  dur: string
  timeAgo: string
  mmrChange: number
  impactValue: number
  partyCount: number
  lane: string
  rank: number
}

interface RecentTeammates {
  steamAccountId: number
  name: string
  avatar: string | null
  matches: number
  winrate: number
}

// interface PlayerStats {
//   matchCount: number
//   winCount: number
//   killsAverage: number
//   deathsAverage: number
//   assistsAverage: number
//   gpmAverage: number
//   xpmAverage: number
//   rank: number
// }

export const heroMap = new Map<number, HeroData>((heroesData as HeroData[]).map((h) => [h.id, h]))

class PlayerStore {
  detailedMatches = $state<StratzMatch[]>([])
  isLoading = $state(false)
  error = $state('')
  playerStats = $state<any>(null)
  allTeammates = $state<RecentTeammates[]>([])
  recentTeammates = $derived(this.allTeammates.slice(0, 5))
  allHeroStats = $state<any[]>([])
  topHeroes = $derived(this.allHeroStats.slice(0, 5))
  heroRoleMap = $state<Map<number, string>>(new Map())
  heroPerformanceStats = $state<any[]>([])
  hasLoaded = $state(false)
  steamId = $state<number | null>(null)

  async loadProfile(forceRefersh = false) {
    if (this.hasLoaded && !forceRefersh) return

    this.isLoading = true
    this.error = ''

    try {
      const res = await window.api.getLocalSteamId()
      this.steamId = res?.steamId ?? null
      if (!this.steamId) {
        this.error = 'Could not resolve Steam ID.'
        return
      }

      const raw = await window.api.fetchPlayerData(res.steamId)
      if (raw?.error) {
        this.error = raw.error
        return
      }

      const heroStats = raw.player.heroesGroupBy ?? []

      const simpleAvg = (key: string) => {
        const val =
          heroStats.length > 0
            ? heroStats.reduce((sum: number, h: any) => sum + h[key], 0) / heroStats.length
            : 0
        return Math.floor(val)
      }

      this.playerStats = {
        matchCount: raw.player.matchCount,
        winCount: raw.player.winCount,
        killsAverage: simpleAvg('avgKills'),
        deathsAverage: simpleAvg('avgDeaths'),
        assistsAverage: simpleAvg('avgAssists'),
        gpmAverage: simpleAvg('avgGoldPerMinute'),
        xpmAverage: simpleAvg('avgExperiencePerMinute'),
        rank: raw.player.steamAccount?.seasonRank ?? 0,
        name: raw.player.steamAccount?.name ?? '',
        avatar: raw.player?.steamAccount?.avatar ?? ''
      }

      this.detailedMatches = (raw.player.recentMatches ?? []).map((m: any, i: number) => {
        const player = m.targetPlayer?.[0]
        const hero = heroMap.get(player?.heroId)

        const partyCount = player?.partyId
          ? m.allPlayers?.filter((p: any) => p.partyId === player.partyId).length
          : 0

        return {
          id: m.id,
          heroId: player?.heroId,
          heroName: hero?.localized_name ?? `Hero #${player?.heroId}`,
          heroImg: hero ? `hero-asset://${hero.img.replace(/^hero-assets\//, '')}` : null,
          outcome: player?.isVictory ? 'win' : 'loss',
          k: player?.kills ?? 0,
          d: player?.deaths ?? 0,
          a: player?.assists ?? 0,
          mode: formatGameMode(m.gameMode),
          dur: formatDuration(m.durationSeconds ?? 0),
          timeAgo: formatTimeAgo(m.statsDateTime ?? m.endDateTime),
          lane: player?.lane ?? 'Unknown',
          rank: m.actualRank ?? 0,
          mmrChange: player?.isVictory ? 25 : -25,
          impactValue: player?.imp ?? 0,
          partyCount,
          award: player?.award ?? null
        }
      })

      this.allTeammates = (raw?.stratz?.page?.player?.peers ?? [])
        .map((p: any) => ({
          steamAccountId: p.steamAccount?.id ?? 0,
          name: p.steamAccount?.name ?? 'Unknown',
          avatar: p.steamAccount?.avatar ?? null,
          matches: p.matchCount ?? 1,
          winrate: parseFloat((((p.winCount ?? 0) / (p.matchCount ?? 1)) * 100).toFixed(1))
        }))
        .sort((a: any, b: any) => b.matches - a.matches)
        .slice(1)

      this.allHeroStats = (raw.player.heroesGroupBy ?? [])
        .filter((h: any) => h.matchCount > 0)
        .sort((a: any, b: any) => b.matchCount - a.matchCount)

      const POSITION_LABELS: Record<string, string> = {
        POSITION_1: 'Carry',
        POSITION_2: 'Mid',
        POSITION_3: 'Offlane',
        POSITION_4: 'Soft Support',
        POSITION_5: 'Hard Support'
      }
      const perfCounts: Record<number, Record<string, number>> = {}
      for (const p of raw.player.heroesPerformanceGroupBy ?? []) {
        if (!perfCounts[p.heroId]) perfCounts[p.heroId] = {}
        perfCounts[p.heroId][p.position] = (perfCounts[p.heroId][p.position] ?? 0) + p.matchCount
      }
      const roleMap = new Map<number, string>()
      for (const [heroId, positions] of Object.entries(perfCounts)) {
        const bestPos = Object.entries(positions).sort((a, b) => b[1] - a[1])[0][0]
        roleMap.set(Number(heroId), POSITION_LABELS[bestPos] ?? bestPos)
      }
      this.heroRoleMap = roleMap
      this.heroPerformanceStats = raw.player.heroesPerformanceGroupBy ?? []

      this.hasLoaded = true
    } catch (err) {
      console.error('Failed to load match history:', err)
      this.error = 'Failed to load matches.'
    } finally {
      this.isLoading = false
    }
  }
}

export const playerStore = new PlayerStore()
