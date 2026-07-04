<script lang="ts">
  import { type MockMatch } from '../utils/mockData'
  import detailedMatchData from '../utils/detailedMatches.json'
  import itemsData from '../../../main/data/items.json'
  import { getHero } from '../utils/heroMap.ts'
  import MinimapImage from '../assets/minimap_geometry_current.png'

  interface Props {
    match: any
  }
  let { match }: Props = $props()

  // ──────────────────────────────────────────────────────────────────────
  // NOTE ON SCOPE
  // This component only surfaces fields that actually exist in
  // detailedMatches.json: itemPurchases, farmDistributionReport,
  // networthPerMinute, killEvents, deathEvents, heroDamagePerMinute,
  // heroDamageReceivedPerMinute, campStack, wards, healPerMinute,
  // towerDamagePerMinute, runes. There is no match-level object (no
  // matchId/duration/rank/partySize/mmr), no per-minute XP series, no
  // Roshan/tower-kill/smoke events, no ward-destroy timestamps, and no
  // gold/xp-per-kill or buyback data. Anything that would require those
  // is intentionally left out rather than approximated.
  //
  // GOAL: "How can we improve through stats" — the Insights tab is the
  // primary surface of this component. Every other tab (Map, Economy,
  // Combat, Timeline) exists to let the person drill into *evidence* for
  // a finding raised in Insights, not the other way around. Anywhere we
  // show a number that isn't directly from the data (e.g. estimated gold
  // lost while dead), it is explicitly labeled as an estimate.
  // ──────────────────────────────────────────────────────────────────────

  let activeSubTab = $state('insights')

  const detailedMatch = detailedMatchData.data.match
  const players = detailedMatch.players

  let selectedPlayerIndex = $state(3)
  const focusedPlayer = $derived(players[selectedPlayerIndex])
  const heroInfo = $derived(getHero(focusedPlayer.heroId))

  function getHeroImgUrl(img: string): string {
    return `hero-asset://${img.replace(/^hero-assets\//, '')}`
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────
  const subTabOrder = ['insights', 'map', 'economy', 'combat', 'timeline']

  function handleKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return

    if (e.key === 'ArrowLeft') {
      selectedPlayerIndex = (selectedPlayerIndex - 1 + players.length) % players.length
    } else if (e.key === 'ArrowRight') {
      selectedPlayerIndex = (selectedPlayerIndex + 1) % players.length
    } else if (e.key >= '1' && e.key <= '5') {
      activeSubTab = subTabOrder[parseInt(e.key) - 1]
    } else if (e.key === ' ' && activeSubTab === 'map') {
      e.preventDefault()
      togglePlayback()
    }
  }

  // ── Copy coaching summary ────────────────────────────────────────────
  let copyFeedback = $state(false)

  function copyCoachingSummary() {
    const hero = heroInfo?.localized_name || `Hero ${focusedPlayer.heroId}`
    const lines: string[] = [
      `DotaTracker Match Review — ${hero} (${roleShortLabel(focusedPlayer.position)}, ${focusedPlayer.isVictory ? 'Win' : 'Loss'})`,
      `Grade: ${performanceGrade.grade} — ${performanceGrade.label}`,
      `Stats: ${focusedPlayer.kills}/${focusedPlayer.deaths}/${focusedPlayer.assists} KDA | ${focusedPlayer.goldPerMinute} GPM | ${focusedPlayer.networth.toLocaleString()} Net Worth`,
      ''
    ]

    for (const check of coachingChecklist) {
      lines.push(`  ${check.done ? '✓' : '✗'} ${check.title}: ${check.desc}`)
    }
    lines.push('')

    if (biggestGap) {
      lines.push(`Biggest gap: ${biggestGap.label} — ${Math.round(Math.abs(biggestGap.pct))}% ${biggestGap.pct < 0 ? 'behind' : 'ahead'} vs. ${enemyMirrorHero?.localized_name || 'enemy mirror'}`)
    }
    if (deathClusters.length > 0) {
      lines.push(`Death clusters: ${deathClusters.map((c) => `${c.count}x ${c.landmark}`).join(', ')}`)
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      copyFeedback = true
      setTimeout(() => (copyFeedback = false), 2000)
    })
  }

  $effect(() => {
    const heroNameStr = match.hero || match.heroName || ''
    const userPlayerIdx = players.findIndex((p) => {
      const hero = getHero(p.heroId)
      return hero?.localized_name.toLowerCase() === heroNameStr.toLowerCase()
    })

    const isUserRadiant = userPlayerIdx !== -1 ? userPlayerIdx < 5 : true
    const carryIdx = players.findIndex((p, idx) => {
      const isRadiant = idx < 5
      return p.position === 'POSITION_1' && isRadiant === isUserRadiant
    })

    if (userPlayerIdx !== -1) {
      selectedPlayerIndex = userPlayerIdx
    } else if (carryIdx !== -1) {
      selectedPlayerIndex = carryIdx
    }

    expandedCheckIndex = 0
    cursorTime = null
  })

  const performanceGrade = $derived.by(() => {
    const gpm = focusedPlayer.goldPerMinute
    const deaths = focusedPlayer.deaths
    const kills = focusedPlayer.kills
    const assists = focusedPlayer.assists
    const kda = (kills + assists) / Math.max(deaths, 1)
    const isCore = ['POSITION_1', 'POSITION_2', 'POSITION_3'].includes(focusedPlayer.position)

    if (isCore) {
      if (gpm >= 750 && kda >= 6.0 && deaths <= 2) return { grade: 'A+', color: 'text-gr', label: 'Godlike Carry' }
      if (gpm >= 650 && kda >= 4.0 && deaths <= 4) return { grade: 'A', color: 'text-gr', label: 'Excellent Carry' }
      if (gpm >= 550 && kda >= 3.0 && deaths <= 6) return { grade: 'B+', color: 'text-tx', label: 'Solid Carry' }
      if (gpm >= 450 && kda >= 2.0) return { grade: 'B', color: 'text-tx2', label: 'Average Carry' }
      if (gpm >= 400) return { grade: 'C', color: 'text-gd', label: 'Struggling Carry' }
      return { grade: 'D', color: 'text-rd', label: 'Underperformed' }
    } else {
      if (kda >= 5.0 && deaths <= 4) return { grade: 'A+', color: 'text-gr', label: 'Elite Support' }
      if (kda >= 3.5 && deaths <= 6) return { grade: 'A', color: 'text-gr', label: 'Excellent Support' }
      if (kda >= 2.5 && deaths <= 8) return { grade: 'B+', color: 'text-tx', label: 'Active Support' }
      if (kda >= 1.8) return { grade: 'B', color: 'text-tx2', label: 'Standard Support' }
      return { grade: 'C', color: 'text-rd', label: 'High Exposure Support' }
    }
  })

  function isYou(heroId: number): boolean {
    const hero = getHero(heroId)
    const heroNameStr = match.hero || match.heroName || ''
    return hero?.localized_name.toLowerCase() === heroNameStr.toLowerCase()
  }

  // ── Item resolution ─────────────────────────────────────────────────
  interface ItemInfo {
    id: number
    dname: string
    img: string
    cost: number
  }

  const itemMap = new Map<number, ItemInfo>()
  for (const [key, value] of Object.entries(itemsData)) {
    const val = value as any
    if (val && typeof val.id === 'number') {
      itemMap.set(val.id, { id: val.id, dname: val.dname || key, img: val.img, cost: val.cost || 0 })
    }
  }

  function getItem(id: number | null | undefined): ItemInfo | null {
    if (id == null) return null
    return itemMap.get(id) ?? null
  }

  function getItemImgUrl(img: string): string {
    return `item-asset://${img.replace(/^item-assets\//, '')}`
  }

  // Best-effort purchase time for a given inventory item id. Only reliable
  // when the id is unique in itemPurchases (true for tier-3+ items); for
  // duplicated consumable ids this falls back to the latest matching entry.
  function getPurchaseTime(itemId: number | null | undefined): number | null {
    if (itemId == null) return null
    const matches = (focusedPlayer.stats.itemPurchases || []).filter((p: any) => p.itemId === itemId)
    if (matches.length === 0) return null
    return matches[matches.length - 1].time
  }

  const inventoryIds = $derived([
    focusedPlayer.item0Id,
    focusedPlayer.item1Id,
    focusedPlayer.item2Id,
    focusedPlayer.item3Id,
    focusedPlayer.item4Id,
    focusedPlayer.item5Id
  ])

  const backpackIds = $derived([focusedPlayer.backpack0Id, focusedPlayer.backpack1Id, focusedPlayer.backpack2Id])
  const neutralId = $derived(focusedPlayer.neutral0Id)
  const neutralItem = $derived(getItem(neutralId))

  // ── Shared timeline cursor (drives Map / Economy / Combat / Timeline) ─
  let cursorTime = $state<number | null>(null)

  // ── Map state ────────────────────────────────────────────────────────
  let showKills = $state(true)
  let showDeaths = $state(true)
  let showObserverWards = $state(true)
  let showSentryWards = $state(true)
  let showRunes = $state(true)
  let showStructures = $state(true)
  let heatmapMode = $state(false)

  // Match duration is not present in the JSON; derive an upper bound from
  // the longest available per-minute series so the scrubber never clips data.
  const matchDurationSeconds = $derived.by(() => {
    const lens = players.map((p) => (p.stats.networthPerMinute || []).length)
    const maxLen = Math.max(1, ...lens)
    return maxLen * 60
  })

  let timeSliderValue = $state(0)
  $effect(() => {
    timeSliderValue = matchDurationSeconds
  })

  // ── Phase filter state (Map tab) ────────────────────────────────────
  type MatchPhase = 'all' | 'laning' | 'midgame' | 'late'
  let activePhase = $state<MatchPhase>('all')

  const phaseRanges: Record<MatchPhase, { label: string; min: number; max: number }> = {
    all: { label: 'All', min: 0, max: Infinity },
    laning: { label: 'Laning (0-10m)', min: 0, max: 600 },
    midgame: { label: 'Mid (10-25m)', min: 600, max: 1500 },
    late: { label: 'Late (25m+)', min: 1500, max: Infinity }
  }

  function setPhase(phase: MatchPhase) {
    activePhase = phase
    const range = phaseRanges[phase]
    if (phase === 'all') {
      timeSliderValue = matchDurationSeconds
    } else {
      timeSliderValue = range.max === Infinity ? matchDurationSeconds : range.max
    }
  }

  // ── Map playback animation ──────────────────────────────────────────
  let playbackPlaying = $state(false)
  let playbackSpeed = $state(2)
  let playbackRafId: number | null = null
  let lastPlaybackTick = $state(0)

  function togglePlayback() {
    if (playbackPlaying) {
      stopPlayback()
    } else {
      startPlayback()
    }
  }

  function startPlayback() {
    if (timeSliderValue >= matchDurationSeconds) {
      timeSliderValue = 0
    }
    playbackPlaying = true
    lastPlaybackTick = performance.now()
    playbackRafId = requestAnimationFrame(playbackTick)
  }

  function stopPlayback() {
    playbackPlaying = false
    if (playbackRafId !== null) {
      cancelAnimationFrame(playbackRafId)
      playbackRafId = null
    }
  }

  function playbackTick(now: number) {
    if (!playbackPlaying) return
    const elapsed = now - lastPlaybackTick
    const advanceSec = (elapsed / 1000) * playbackSpeed * 60 // seconds per real second at speed
    timeSliderValue = Math.min(matchDurationSeconds, timeSliderValue + advanceSec)
    lastPlaybackTick = now

    if (timeSliderValue >= matchDurationSeconds) {
      stopPlayback()
      return
    }
    playbackRafId = requestAnimationFrame(playbackTick)
  }

  function setPlaybackSpeed(speed: number) {
    playbackSpeed = speed
  }

  // Stop playback when user manually scrubs
  function onScrub() {
    if (playbackPlaying) stopPlayback()
  }

  function formatSpeedLabel(speed: number): string {
    return `${speed}×`
  }

  interface MapEvent {
    type: 'kill' | 'death' | 'ward_obs' | 'ward_sent' | 'rune'
    time: number
    x: number
    y: number
    heroName: string
    heroIcon: string
    details: string
    landmark: string
    color: string
    char: string
  }

  function scaleCoordinateX(val: number): number {
    return Math.max(0, Math.min(100, 0.65176 * val - 36.33))
  }
  function scaleCoordinateY(val: number): number {
    return Math.max(0, Math.min(100, 131.51 - 0.65176 * val))
  }

  // Stratz path constants
  const PATHS_BARRACKS = `<path fill-rule="evenodd" clip-rule="evenodd" d="M21.2176 5.19449C21.2176 4.03469 20.2774 3.09448 19.1176 3.09448H4.88199C3.72219 3.09448 2.78198 4.03469 2.78198 5.19449V18.8109C2.78198 19.9707 3.72219 20.9109 4.88199 20.9109H19.1176C20.2774 20.9109 21.2176 19.9707 21.2176 18.8109V5.19449ZM4.88199 5.19449V18.8109V5.19449Z" fill="#0A0A0A"></path><path d="M19.1183 5.198H4.88281V18.8145H19.1183V5.198Z" fill="currentColor"></path><path d="M19.1183 14.5554H4.88281V18.8138H19.1183V14.5554Z" fill="black" fill-opacity="0.26"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12.0005 9.87743L4.88281 5.198V14.5565L12.0005 9.87743Z" fill="black" fill-opacity="0.04"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12.0009 9.87718L19.1187 5.19775V14.5562L12.0009 9.87718Z" fill="black" fill-opacity="0.26"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12.0009 9.87646L19.1187 14.5555H4.88321L12.0009 9.87646Z" fill="black" fill-opacity="0.14"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12.0009 9.87646L19.1187 5.1974H4.88321L12.0009 9.87646Z" fill="black" fill-opacity="0.44"></path><path d="M17.6399 3.09448H6.3584V13.5816H17.6399V3.09448Z" fill="#0A0A0A"></path><path d="M16.6973 3.09448H7.29883V12.9666H16.6973V3.09448Z" fill="currentColor"></path><path d="M16.6973 10.6086H7.29883V12.9643H16.6973V10.6086Z" fill="black" fill-opacity="0.26"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.9981 5.45363L7.29883 3.09448V10.611L11.9981 5.45363Z" fill="black" fill-opacity="0.04"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.999 5.45363L16.6982 3.09448V10.611L11.999 5.45363Z" fill="black" fill-opacity="0.26"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.999 5.45703L16.6982 10.6144H7.29979L11.999 5.45703Z" fill="black" fill-opacity="0.14"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.999 5.45703L16.6982 3.09788H7.29979L11.999 5.45703Z" fill="black" fill-opacity="0.44"></path>`
  const PATHS_TOWER_DIAGONAL = `<path fill-rule="evenodd" clip-rule="evenodd" d="M5.1054 6.33923V6.22583C5.1054 5.58503 5.3982 4.97903 5.9004 4.58063L10.6866 0.785028C11.451 0.178428 12.5322 0.178428 13.2966 0.785028L18.0828 4.58063C18.585 4.97903 18.8778 5.58503 18.8778 6.22583V6.33923L21.6882 8.56823C22.1904 8.96663 22.4832 9.57263 22.4832 10.2134V14.966C22.4832 15.6098 22.188 16.2176 21.6822 16.616L13.2906 23.2226C12.5286 23.8226 11.4546 23.8226 10.6926 23.2226L2.301 16.616C1.7952 16.2176 1.5 15.6098 1.5 14.966V10.2134C1.5 9.57263 1.7928 8.96663 2.295 8.56823L5.1054 6.33923Z" fill="#0A0A0A"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M20.3865 10.2136V14.9662L11.9949 21.5728L3.60327 14.9662V10.2136L11.9949 3.55835L20.3865 10.2136Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.9939 17.3636L20.3859 10.2139V14.9663L11.9939 21.5729V17.3636Z" fill="black" fill-opacity="0.33"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.60327 10.2139L11.9953 17.3636V21.5729L3.60327 14.9663V10.2139Z" fill="black" fill-opacity="0.18"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.60327 10.2136L11.9953 7.08887V17.3638L3.60327 10.2136Z" fill="black" fill-opacity="0.05"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.60327 10.2137L11.9953 7.08898V3.55835L3.60327 10.2137Z" fill="black" fill-opacity="0.32"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M20.3859 10.2137L11.9939 7.08898V3.55835L20.3859 10.2137Z" fill="black" fill-opacity="0.39"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M20.3859 10.2136L11.9939 7.08887V17.3638L20.3859 10.2136Z" fill="black" fill-opacity="0.32"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.99 2.00854L17.6007 6.12763V9.17575L11.99 13.9808L6.39233 9.17575V6.12763L11.99 2.00854Z" fill="#0A0A0A"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.9965 2.68408L17.0558 6.27592V8.97269L11.9965 13.1239L6.93726 8.97269V6.27592L11.9965 2.68408Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.9941 10.5865L17.0534 6.27612V8.97289L11.9941 13.1241V10.5865Z" fill="black" fill-opacity="0.33"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.93726 6.27612L11.9965 10.5865V13.1241L6.93726 8.97289V6.27612Z" fill="black" fill-opacity="0.18"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.93726 6.27591L11.9965 4.35718V10.5865L6.93726 6.27591Z" fill="black" fill-opacity="0.05"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.93726 6.27587L11.9965 4.35714V2.68433L6.93726 6.27587Z" fill="black" fill-opacity="0.32"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.0534 6.27587L11.9941 4.35714V2.68433L17.0534 6.27587Z" fill="black" fill-opacity="0.39"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.0534 6.27591L11.9941 4.35718V10.5865L17.0534 6.27591Z" fill="black" fill-opacity="0.32"></path>`
  const PATHS_TOWER_SIDE = `<path fill-rule="evenodd" clip-rule="evenodd" d="M21.6369 4.45327C21.6369 3.29347 20.6967 2.35327 19.5369 2.35327H4.46255C3.30275 2.35327 2.36255 3.29347 2.36255 4.45327V19.5277C2.36255 20.6875 3.30275 21.6277 4.46255 21.6277H19.5369C20.6967 21.6277 21.6369 20.6875 21.6369 19.5277V4.45327Z" fill="#0A0A0A"></path><path d="M19.5378 4.45654H4.46338V19.531H19.5378V4.45654Z" fill="currentColor"></path><path d="M19.5378 13.5085H4.46338V19.527H19.5378V13.5085Z" fill="black" fill-opacity="0.17"></path>`
  const PATHS_ANCIENT = `<path fill-rule="evenodd" clip-rule="evenodd" d="M6.90865 5.41854L11.1278 1.19874C11.522 0.805137 12.056 0.58374 12.6128 0.58374H13.6556C14.8154 0.58374 15.7556 1.52394 15.7556 2.68374V4.56654H16.5092C17.066 4.56654 17.6 4.78794 17.9942 5.18154L19.3958 6.58374C19.79 6.97734 20.0108 7.51194 20.0108 8.06874V8.98134C20.7044 9.32394 21.1814 10.0379 21.1814 10.8641V15.8868C21.1814 16.4436 20.96 16.9776 20.5664 17.3718L15.1406 22.797C14.7362 23.2014 14.1848 23.4234 13.6136 23.412L11.2118 23.364C10.6694 23.3532 10.1522 23.1324 9.76885 22.749L3.58885 16.5689C3.19465 16.1747 2.97325 15.6408 2.97325 15.084V13.5593C2.97325 13.0025 3.19465 12.4685 3.58885 12.0749L3.92545 11.7378L3.43165 11.2445C3.03805 10.8509 2.81665 10.3163 2.81665 9.75954V8.82295C2.81665 8.26555 3.03805 7.73154 3.43165 7.33794L4.73665 6.03354C5.13025 5.63934 5.66425 5.41854 6.22105 5.41854H6.90865Z" fill="#0A0A0A"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.2547 21.2678L13.6565 21.3158L19.0823 15.89V10.8674H18.6575L17.9117 11.6132L17.1665 10.8674L17.9117 10.1216V8.07202L16.5101 6.66981H15.5855L14.1839 8.07202L13.6565 8.04922V2.68701H12.6137L7.77948 7.52181H6.22188L4.91748 8.82622V9.76282L6.32928 11.1746V12.308L5.07408 13.5632V15.0872L11.2547 21.2678Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.49348 13.1438L6.32928 12.308V11.1746L4.91748 9.76281V8.82621L6.32928 9.43341L7.28508 10.1216L7.98708 11.1746L8.65548 10.4642L8.99508 8.43261L13.6565 2.68701V8.04921L14.1839 8.07201L15.5855 6.66981H16.5101L17.9117 8.07201V10.1216L17.1659 10.8674L17.9117 11.6132L18.6575 10.8674H19.0817V15.89L13.6565 21.3158L11.2547 21.2678L5.07408 15.0872V13.979L6.32928 14.1686L7.98708 14.7836L7.77408 12.7832L6.65268 12.9812L5.49348 13.1438ZM13.6013 14.7836L10.5827 12.9812L9.53208 14.3672V15.5534L10.5827 17.0252L13.6013 14.7836Z" fill="black" fill-opacity="0.27"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M14.6267 16.2352L14.9783 13.867L17.6567 12.3736L18.6569 11.998H19.0811V15.8866L13.6559 21.3124L11.5661 21.2704L9.53149 18.5056L10.2041 16.492L10.5821 17.0218L12.7859 19.975H13.0775L14.6267 16.2352ZM11.9993 13.4062L10.5821 11.998V9.75943L13.6559 6.36523V8.04583L13.0775 10.1182L15.1973 9.75943L17.3645 7.52203L17.9111 8.06863V10.1182L17.1653 10.864L14.9783 12.3736L14.6363 11.6098H13.6559L11.9993 13.4062Z" fill="black" fill-opacity="0.28"></path>`

  interface StaticStructure {
    name: string
    x: number
    y: number
    rawX: number
    rawY: number
    w: number
    h: number
    team: 'radiant' | 'dire' | 'neutral'
    type: 'tower' | 'ancient' | 'barracks'
    content: string
  }

  const rawStructures = [
    { name: 'Radiant Ancient', x: 29, y: 202, w: 16.06, h: 16.06, team: 'radiant', type: 'ancient', content: PATHS_ANCIENT },
    { name: 'Radiant T1 Top Tower', x: 25, y: 93, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Radiant T2 Top Tower', x: 25, y: 135, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Radiant T3 Top Tower', x: 21, y: 174, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Radiant T1 Mid Tower', x: 98, y: 143, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Radiant T2 Mid Tower', x: 71, y: 164, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Radiant T3 Mid Tower', x: 51, y: 184, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Radiant T1 Bot Tower', x: 197, y: 214, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Radiant T2 Bot Tower', x: 116, y: 217, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Radiant T3 Bot Tower', x: 62, y: 215, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Radiant T4 Top Tower', x: 34, y: 195, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Radiant T4 Bot Tower', x: 40, y: 201, w: 12.05, h: 12.05, team: 'radiant', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Radiant Top Melee Rax', x: 18, y: 181, w: 10.04, h: 10.04, team: 'radiant', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Radiant Top Ranged Rax', x: 26, y: 181, w: 10.04, h: 10.04, team: 'radiant', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Radiant Mid Melee Rax', x: 46, y: 187, w: 10.04, h: 10.04, team: 'radiant', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Radiant Mid Ranged Rax', x: 52, y: 192, w: 10.04, h: 10.04, team: 'radiant', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Radiant Bot Melee Rax', x: 58, y: 212, w: 10.04, h: 10.04, team: 'radiant', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Radiant Bot Ranged Rax', x: 58, y: 220, w: 10.04, h: 10.04, team: 'radiant', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Dire Ancient', x: 204, y: 43, w: 16.06, h: 16.06, team: 'dire', type: 'ancient', content: PATHS_ANCIENT },
    { name: 'Dire T1 Top Tower', x: 50, y: 29, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Dire T2 Top Tower', x: 120, y: 29, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Dire T3 Top Tower', x: 176, y: 33, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Dire T1 Mid Tower', x: 130, y: 111, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Dire T2 Mid Tower', x: 160, y: 89, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Dire T3 Mid Tower', x: 187, y: 64, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Dire T1 Bot Tower', x: 218, y: 156, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Dire T2 Bot Tower', x: 220, y: 116, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Dire T3 Bot Tower', x: 218, y: 76, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_SIDE },
    { name: 'Dire T4 Top Tower', x: 196, y: 48, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Dire T4 Bot Tower', x: 202, y: 53, w: 12.05, h: 12.05, team: 'dire', type: 'tower', content: PATHS_TOWER_DIAGONAL },
    { name: 'Dire Top Melee Rax', x: 183, y: 31, w: 10.04, h: 10.04, team: 'dire', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Dire Top Ranged Rax', x: 183, y: 39, w: 10.04, h: 10.04, team: 'dire', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Dire Mid Melee Rax', x: 189, y: 58, w: 10.04, h: 10.04, team: 'dire', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Dire Mid Ranged Rax', x: 195, y: 64, w: 10.04, h: 10.04, team: 'dire', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Dire Bot Melee Rax', x: 215, y: 71, w: 10.04, h: 10.04, team: 'dire', type: 'barracks', content: PATHS_BARRACKS },
    { name: 'Dire Bot Ranged Rax', x: 224, y: 71, w: 10.04, h: 10.04, team: 'dire', type: 'barracks', content: PATHS_BARRACKS }
  ]

  const staticStructures: StaticStructure[] = rawStructures.map((s) => ({
    name: s.name,
    x: ((s.x + s.w / 2) / 255) * 100,
    y: ((s.y + s.h / 2) / 255) * 100,
    rawX: s.x,
    rawY: s.y,
    w: s.w,
    h: s.h,
    team: s.team as any,
    type: s.type as any,
    content: s.content
  }))

  // Geometric nearest-landmark lookup — real coordinates, no guessing.
  function nearestLandmark(xPct: number, yPct: number): string {
    let best: StaticStructure | null = null
    let bestDist = Infinity
    for (const s of staticStructures) {
      const d = Math.hypot(s.x - xPct, s.y - yPct)
      if (d < bestDist) {
        bestDist = d
        best = s
      }
    }
    if (!best) return 'Unknown area'
    return bestDist < 22 ? `near ${best.name}` : `mid-lane area (near ${best.name})`
  }

  const focusedPlayerEvents = $derived.by(() => {
    const list: MapEvent[] = []
    const p = focusedPlayer
    const hero = getHero(p.heroId)
    const hName = hero?.localized_name || `Hero ${p.heroId}`
    const hIcon = hero ? getHeroImgUrl(hero.icon) : ''

    ;(p.stats.killEvents || []).forEach((e: any) => {
      const x = scaleCoordinateX(e.positionX)
      const y = scaleCoordinateY(e.positionY)
      list.push({
        type: 'kill',
        time: e.time,
        x,
        y,
        heroName: hName,
        heroIcon: hIcon,
        details: `${hName} scored a kill`,
        landmark: nearestLandmark(x, y),
        color: 'var(--color-gr)',
        char: '+'
      })
    })
    ;(p.stats.deathEvents || []).forEach((e: any) => {
      const x = scaleCoordinateX(e.positionX)
      const y = scaleCoordinateY(e.positionY)
      list.push({
        type: 'death',
        time: e.time,
        x,
        y,
        heroName: hName,
        heroIcon: hIcon,
        details: `${hName} died`,
        landmark: nearestLandmark(x, y),
        color: 'var(--color-rd)',
        char: '×'
      })
    })
    ;(p.stats.wards || []).forEach((e: any) => {
      const isObs = e.type === 1
      const x = scaleCoordinateX(e.positionX)
      const y = scaleCoordinateY(e.positionY)
      list.push({
        type: isObs ? 'ward_obs' : 'ward_sent',
        time: e.time,
        x,
        y,
        heroName: hName,
        heroIcon: hIcon,
        details: `${hName} placed ${isObs ? 'an Observer' : 'a Sentry'} Ward`,
        landmark: nearestLandmark(x, y),
        color: isObs ? 'var(--color-gd)' : 'var(--color-bl)',
        char: isObs ? '★' : '✚'
      })
    })
    ;(p.stats.runes || []).forEach((e: any) => {
      if (e.action !== 'PICKUP') return
      const x = scaleCoordinateX(e.positionX)
      const y = scaleCoordinateY(e.positionY)
      list.push({
        type: 'rune',
        time: e.time,
        x,
        y,
        heroName: hName,
        heroIcon: hIcon,
        details: `${hName} grabbed ${e.rune} Rune`,
        landmark: nearestLandmark(x, y),
        color: 'var(--color-pu)',
        char: '♦'
      })
    })

    return list.sort((a, b) => a.time - b.time)
  })

  const visibleEvents = $derived.by(() => {
    return focusedPlayerEvents.filter((ev) => {
      if (timeSliderValue === 0 && ev.time >= 0) return false
      if (ev.time > timeSliderValue) return false
      if (ev.type === 'kill' && !showKills) return false
      if (ev.type === 'death' && !showDeaths) return false
      if (ev.type === 'ward_obs' && !showObserverWards) return false
      if (ev.type === 'ward_sent' && !showSentryWards) return false
      if (ev.type === 'rune' && !showRunes) return false
      return true
    })
  })

  const visionSummary = $derived.by(() => {
    const wards = focusedPlayer.stats.wards || []
    const observers = wards.filter((w: any) => w.type === 1).length
    const sentries = wards.filter((w: any) => w.type === 0).length
    return { observers, sentries, total: wards.length }
  })

  // Ward timing bucket — when vision is placed matters more than the raw
  // count. Early game (< 10:00) is when carries are most exposed, so a
  // support drawing all wards late is a coachable pattern the count alone
  // hides.
  const wardTimingSummary = $derived.by(() => {
    const wards = focusedPlayer.stats.wards || []
    const early = wards.filter((w: any) => w.time < 600).length
    const mid = wards.filter((w: any) => w.time >= 600 && w.time < 1500).length
    const late = wards.filter((w: any) => w.time >= 1500).length
    return { early, mid, late, total: wards.length }
  })

  let tooltipEvent = $state<MapEvent | null>(null)
  let tooltipStyle = $state('')

  function showTooltip(ev: MapEvent) {
    tooltipEvent = ev
    cursorTime = ev.time
    const left = (ev.x / 100) * 300
    const top = (ev.y / 100) * 300 - 32
    tooltipStyle = `left: ${left}px; top: ${top}px;`
  }

  function showStructureTooltip(struct: StaticStructure) {
    tooltipEvent = {
      type: 'rune',
      time: 0,
      x: struct.x,
      y: struct.y,
      heroName: '',
      heroIcon: '',
      details: struct.name,
      landmark: '',
      color: struct.team === 'radiant' ? '#22c55e' : struct.team === 'dire' ? '#ef4444' : '#eab308',
      char: struct.type === 'tower' ? '🏰' : '🛡️'
    }
    const left = (struct.x / 100) * 300
    const top = (struct.y / 100) * 300 - 32
    tooltipStyle = `left: ${left}px; top: ${top}px;`
  }

  function hideTooltip() {
    tooltipEvent = null
  }

  function formatTime(sec: number): string {
    const isNeg = sec < 0
    const absSec = Math.abs(sec)
    const m = Math.floor(absSec / 60)
    const s = Math.floor(absSec % 60)
    return `${isNeg ? '-' : ''}${m}:${s.toString().padStart(2, '0')}`
  }

  function formatPosition(pos: string): string {
    switch (pos) {
      case 'POSITION_1': return 'Carry (Pos 1)'
      case 'POSITION_2': return 'Mid (Pos 2)'
      case 'POSITION_3': return 'Offlane (Pos 3)'
      case 'POSITION_4': return 'Soft Support (Pos 4)'
      case 'POSITION_5': return 'Hard Support (Pos 5)'
      default: return pos.replace('POSITION_', 'Pos ')
    }
  }

  // Short form used for the role-mirrored comparison ("Enemy Carry",
  // "Enemy Offlane", "Enemy Hard Support", ...).
  function roleShortLabel(pos: string): string {
    switch (pos) {
      case 'POSITION_1': return 'Carry'
      case 'POSITION_2': return 'Mid'
      case 'POSITION_3': return 'Offlane'
      case 'POSITION_4': return 'Soft Support'
      case 'POSITION_5': return 'Hard Support'
      default: return pos.replace('POSITION_', 'Pos ')
    }
  }

  function getFarmLocationName(id: number): string {
    switch (id) {
      case 1: return 'Radiant Bot (Safe Lane)'
      case 2: return 'Mid Lane'
      case 3: return 'Radiant Top (Off Lane)'
      case 4: return 'Radiant Main Jungle'
      case 5: return 'Radiant Ancient Triangle'
      case 6: return 'Dire Main Jungle'
      case 7: return 'Dire Ancient Triangle'
      case 8: return 'Radiant Ancients'
      case 9: return 'Dire Ancients'
      case 10: return 'River / Rosh Pit'
      default: return `Lane/Camp ID ${id}`
    }
  }

  // Expected farm share heuristic per role for jungle vs. lane distribution
  function expectedFarmShare(farmName: string, position: string): number {
    const isJungle = farmName.includes('Jungle') || farmName.includes('Triangle') || farmName.includes('Ancients')
    const isRiver = farmName.includes('River') || farmName.includes('Rosh')
    const corePositions = ['POSITION_1', 'POSITION_2']

    if (isRiver) return 5
    if (corePositions.includes(position)) {
      return isJungle ? 30 : 60
    }
    if (position === 'POSITION_3') {
      return isJungle ? 45 : 40
    }
    return isJungle ? 20 : 15 // supports
  }

  function farmInsightNote(): string {
    const pos = focusedPlayer.position
    const list = focusedPlayer.stats.farmDistributionReport?.creepLocation || []
    const totalXP = list.reduce((sum: number, c: any) => sum + (c.xp || 0), 0)
    if (totalXP === 0) return 'No creep data recorded.'

    let jungleXP = 0
    list.forEach((c: any) => {
      const name = getFarmLocationName(c.id)
      if (!name.includes('Lane') && !name.includes('River') && !name.includes('Rosh')) {
        jungleXP += c.xp || 0
      }
    })
    const junglePct = totalXP > 0 ? Math.round((jungleXP / totalXP) * 100) : 0
    const corePositions = ['POSITION_1', 'POSITION_2']

    if (corePositions.includes(pos)) {
      if (junglePct > 50) return `Careful: ${junglePct}% jungle farm. Core heroes should prioritize lane creeps (higher gold/xp per creep) over jungle camps when safe. Heavy jungle reliance before 14m often leaves lane pressure open for the enemy.`
      if (junglePct > 35) return `Solid balance — ${junglePct}% jungle vs. ${100 - junglePct}% lane. Lane creeps give more gold; press lanes before rotating into jungle stacks.`
      return `Great lane priority — ${100 - junglePct}% lane farm. Lane creeps yield the highest gold/min; keeping lane pressure up is the right call.`
    }
    if (pos === 'POSITION_3') {
      if (junglePct > 70) return `Heavy jungle focus (${junglePct}%). Offlaners should split farm between lane pressure and jungle stacks. Less lane time means less disruption of the enemy carry.`
      return `Good farm split — ~${100 - junglePct}% lane / ~${junglePct}% jungle. Offlane benefits from both pressure and stacking.`
    }
    if (junglePct > 40) return `Support with high jungle share (${junglePct}%). Farm priority should stay with cores — consider spending more time warding, stacking, or roaming for ganks.`
    return `Support farm looks appropriate — low overall, mostly incidental.`
  }

  // Rough "expected" farm-source share by role, used only to give the
  // farm-distribution report a benchmark to compare against instead of a
  // bare list of locations. These are heuristics, not ground truth, and
  // are labeled as such in the UI.
  function expectedFarmNote(position: string): string {
    switch (position) {
      case 'POSITION_1':
        return 'Carries typically want the bulk of early farm from their safe lane and own jungle — heavy time in the enemy jungle before items come online usually means lost safety, not extra value.'
      case 'POSITION_2':
        return 'Mid heroes should draw most farm from the mid lane itself plus quick rotations into nearby jungle camps between waves.'
      case 'POSITION_3':
        return 'Offlaners typically split farm between their lane and jungle stacks, picking up whatever the safe-lane carry doesn\u2019t need.'
      default:
        return 'Supports usually farm far less by design — a large share of creep farm here often means less time spent warding, stacking, or setting up kills for the team.'
    }
  }

  // ── Reusable per-minute chart builder (Economy tab) ─────────────────
  type EconomyMetric = 'networth' | 'heroDamage' | 'damageTaken' | 'healing' | 'towerDamage'

  const metricConfig: Record<EconomyMetric, { label: string; unit: string; color: string; cumulative: boolean }> = {
    networth: { label: 'Net Worth', unit: 'g', color: 'var(--color-gr)', cumulative: false },
    heroDamage: { label: 'Hero Damage', unit: '', color: 'var(--color-rd)', cumulative: true },
    damageTaken: { label: 'Damage Taken', unit: '', color: 'var(--color-gd)', cumulative: false },
    healing: { label: 'Healing', unit: '', color: '#34d399', cumulative: true },
    towerDamage: { label: 'Tower Damage', unit: '', color: '#38bdf8', cumulative: true }
  }

  let selectedMetric = $state<EconomyMetric>('networth')

  function seriesFor(player: any, metric: EconomyMetric): number[] {
    const stats = player.stats
    switch (metric) {
      case 'networth': return stats.networthPerMinute || []
      case 'heroDamage': return cumulativeSum(stats.heroDamagePerMinute || [])
      case 'damageTaken': return stats.heroDamageReceivedPerMinute || []
      case 'healing': return cumulativeSum(stats.healPerMinute || [])
      case 'towerDamage': return cumulativeSum(stats.towerDamagePerMinute || [])
    }
  }

  function cumulativeSum(arr: number[]): number[] {
    let running = 0
    return arr.map((v) => (running += v))
  }

  function buildLinePath(data: number[], maxVal: number): { line: string; area: string } {
    if (data.length === 0) return { line: '', area: '' }
    const points = data.map((val, idx) => {
      const x = 30 + (idx / Math.max(1, data.length - 1)) * 450
      const y = 100 - (val / Math.max(1, maxVal)) * 90
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    const line = `M ${points.join(' L ')}`
    const area = `M 30,100 L ${points.join(' L ')} L 480,100 Z`
    return { line, area }
  }

  // Role-mirrored comparison: carry vs carry, mid vs mid, offlane vs
  // offlane, soft support vs soft support, hard support vs hard support —
  // whichever position the focused player is, on the opposing team. This
  // is the only fair baseline available (no match history exists), so it
  // is promoted from "just a chart overlay" to the backbone of the
  // Insights tab below.
  const enemyMirrorPlayer = $derived.by(() => {
    const isRadiant = selectedPlayerIndex < 5
    const idx = players.findIndex((p, i) => {
      const pIsRadiant = i < 5
      return p.position === focusedPlayer.position && pIsRadiant !== isRadiant
    })
    return idx !== -1 ? players[idx] : null
  })

  const enemyMirrorHero = $derived(enemyMirrorPlayer ? getHero(enemyMirrorPlayer.heroId) : null)
  const enemyMirrorRoleLabel = $derived(`Enemy ${roleShortLabel(focusedPlayer.position)}`)

  const focusSeries = $derived(seriesFor(focusedPlayer, selectedMetric))
  const enemySeries = $derived(enemyMirrorPlayer ? seriesFor(enemyMirrorPlayer, selectedMetric) : [])
  const chartMax = $derived(Math.max(1, ...focusSeries, ...enemySeries))
  const focusChartPaths = $derived(buildLinePath(focusSeries, chartMax))
  const enemyChartPaths = $derived(buildLinePath(enemySeries, chartMax))
  const networthLead = $derived(enemyMirrorPlayer ? focusedPlayer.networth - enemyMirrorPlayer.networth : 0)

  // ── Game snapshot — one-glance summary card ──────────────────────────
  interface GameSnapshot {
    roleSummary: string
    outcomeQuality: string
    topStats: { label: string; value: string; color: string }[]
    gradeLabel: string
  }

  const gameSnapshot = $derived.by((): GameSnapshot => {
    const roleMap: Record<string, string> = {
      POSITION_1: 'As Carry, your job is to farm efficiently, survive early ganks, and dominate late-game teamfights with item advantage.',
      POSITION_2: 'As Mid, your job is to win the lane, rotate for ganks, and set the tempo for your team through the mid-game.',
      POSITION_3: 'As Offlane, your job is to disrupt enemy farm, create space, and initiate key teamfights.',
      POSITION_4: 'As Soft Support, your job is to roam, set up ganks, stack camps, and secure vision in contested areas.',
      POSITION_5: 'As Hard Support, your job is to protect your carry in lane, ward defensively, and enable your cores to farm safely.'
    }

    const outcomeQuality = focusedPlayer.isVictory
      ? `${heroInfo?.localized_name || 'Your hero'} helped secure victory.`
      : `Defeat — review survival patterns and farm timing to avoid similar losses.`

    const topStats: { label: string; value: string; color: string }[] = [
      { label: 'GPM', value: focusedPlayer.goldPerMinute.toString(), color: focusedPlayer.goldPerMinute >= 550 ? 'text-emerald-400' : 'text-amber-400' },
      { label: 'KDA', value: kdaText, color: kdaVal >= 3 ? 'text-emerald-400' : 'text-rose-400' },
      { label: 'Deaths', value: focusedPlayer.deaths.toString(), color: focusedPlayer.deaths <= 4 ? 'text-emerald-400' : 'text-rose-400' }
    ]

    return {
      roleSummary: roleMap[focusedPlayer.position] || 'Focus on your role-specific responsibilities.',
      outcomeQuality,
      topStats,
      gradeLabel: performanceGrade.label
    }
  })

  const kdaVal = $derived((focusedPlayer.kills + focusedPlayer.assists) / Math.max(focusedPlayer.deaths, 1))

  // ── Actionable advice generator per mirror gap ───────────────────────
  function gapAdvice(gap: MirrorGap, enemyHeroName: string): string {
    const hero = heroInfo?.localized_name || 'You'
    switch (gap.key) {
      case 'goldPerMinute':
        if (gap.pct < 0) return `${hero} earned ${gap.pct >= 0 ? '+' : ''}${Math.round(gap.pct)}% less gold/min than ${enemyHeroName}. Prioritize lane creeps (higher gold yield) over inefficient jungle rotations, and avoid deaths that pause farm for ~45s each.`
        return `${hero} out-earned ${enemyHeroName} by ${Math.round(gap.pct)}% in gold/min — strong farm efficiency. Keep hitting lane timings before rotating.`
      case 'experiencePerMinute':
        if (gap.pct < 0) return `${hero} trailed ${enemyHeroName} in XPM by ${Math.abs(Math.round(gap.pct))}%. Missing wisdom runes or dying early slows level curve; check rune pickup timestamps in Timeline.`
        return `${hero} had ${Math.round(gap.pct)}% more XPM than ${enemyHeroName} — good XP acceleration.`
      case 'networth':
        if (gap.pct < 0) return `Net worth gap of ${Math.abs(Math.round(gap.pct))}% behind ${enemyHeroName}. Each death costs ~200-400g from lost farm + feed bounty; review your death map to tighten survival.`
        return `+${Math.round(gap.pct)}% net worth lead over ${enemyHeroName} — your item advantage translated well.`
      case 'deaths':
        if (gap.pct < 0) return `${hero} died ${Math.abs(Math.round(gap.pct))}% more than ${enemyHeroName}. Repeated death locations indicate positioning issues — click Map tab to review where you were caught.`
        return `${hero} died ${Math.abs(Math.round(gap.pct))}% less than ${enemyHeroName} — excellent survival.`
      case 'kills':
        if (gap.pct < 0) return `${hero} scored ${Math.abs(Math.round(gap.pct))}% fewer kills than ${enemyHeroName}. Consider earlier item timing to spike your kill potential, or rotate onto vulnerable lanes more aggressively.`
        return `${hero} secured ${Math.round(gap.pct)}% more kills than ${enemyHeroName} — strong kill pressure.`
      default:
        return ''
    }
  }

  // ── Ranked mirror-comparison gaps (Insights) ────────────────────────
  // Every gap is expressed as "you vs. your role counterpart," ranked by
  // the size of the relative gap so the biggest lever surfaces first
  // instead of a fixed, arbitrarily-ordered checklist.
  interface MirrorGap {
    key: string
    label: string
    mine: number
    theirs: number
    diff: number
    pct: number
    goodIfPositive: boolean
    format: (n: number) => string
    advice: string
  }

  const mirrorGaps = $derived.by((): MirrorGap[] => {
    if (!enemyMirrorPlayer) return []
    const defs: { key: string; label: string; goodIfPositive: boolean; format: (n: number) => string }[] = [
      { key: 'goldPerMinute', label: 'Gold Per Minute', goodIfPositive: true, format: (n) => Math.round(n).toString() },
      { key: 'experiencePerMinute', label: 'Experience Per Minute', goodIfPositive: true, format: (n) => Math.round(n).toString() },
      { key: 'networth', label: 'Net Worth', goodIfPositive: true, format: (n) => `${Math.round(n).toLocaleString()}g` },
      { key: 'deaths', label: 'Deaths', goodIfPositive: false, format: (n) => Math.round(n).toString() },
      { key: 'kills', label: 'Kills', goodIfPositive: true, format: (n) => Math.round(n).toString() }
    ]

    const enemyName = enemyMirrorHero?.localized_name || enemyMirrorRoleLabel
    return defs
      .map((d) => {
        const mine = focusedPlayer[d.key] ?? 0
        const theirs = enemyMirrorPlayer[d.key] ?? 0
        const rawDiff = mine - theirs
        const diff = d.goodIfPositive ? rawDiff : -rawDiff
        const base = Math.abs(theirs) > 0 ? Math.abs(theirs) : Math.abs(mine) || 1
        const pct = (diff / base) * 100
        const gap: MirrorGap = { ...d, mine, theirs, diff, pct, advice: '' }
        gap.advice = gapAdvice(gap, enemyName)
        return gap
      })
      .sort((a, b) => a.pct - b.pct)
  })

  const biggestGap = $derived(mirrorGaps.length > 0 ? mirrorGaps[0] : null)
  const strongestEdge = $derived(mirrorGaps.length > 0 ? mirrorGaps[mirrorGaps.length - 1] : null)

  // Interactive chart hover state — drives the floating tooltip, the
  // snapped cursor dot, and the shared cursorTime used elsewhere.
  let hoverIdx = $state<number | null>(null)

  function chartHover(e: MouseEvent, svgEl: SVGSVGElement, data: number[]) {
    const rect = svgEl.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * 500
    const minuteIdx = Math.max(0, Math.min(data.length - 1, Math.round(((relX - 30) / 450) * (data.length - 1))))
    hoverIdx = minuteIdx
    cursorTime = minuteIdx * 60
  }

  function chartLeave() {
    hoverIdx = null
    cursorTime = null
  }

  // Value/position of the hover point, in the chart's own 0–500 / 0–120
  // viewBox space, so the tooltip and the snapped dot line up exactly
  // with the rendered path.
  const hoverValue = $derived(hoverIdx !== null ? focusSeries[hoverIdx] ?? null : null)
  const hoverCx = $derived(hoverIdx !== null ? 30 + (hoverIdx / Math.max(1, focusSeries.length - 1)) * 450 : 0)
  const hoverCy = $derived(hoverValue !== null ? 100 - (hoverValue / Math.max(1, chartMax)) * 90 : 0)

  // Delta vs. the previous minute — real, derived straight from the series.
  const hoverDelta = $derived(
    hoverIdx !== null && hoverIdx > 0 && focusSeries[hoverIdx] != null && focusSeries[hoverIdx - 1] != null
      ? focusSeries[hoverIdx] - focusSeries[hoverIdx - 1]
      : null
  )

  // Cumulative kills/deaths up to the hovered minute — computed from the
  // real killEvents/deathEvents timestamps, not fabricated.
  const hoverKills = $derived.by(() => {
    if (hoverIdx === null) return focusedPlayer.kills
    return (focusedPlayer.stats.killEvents || []).filter((k: any) => k.time <= hoverIdx! * 60).length
  })
  const hoverDeaths = $derived.by(() => {
    if (hoverIdx === null) return focusedPlayer.deaths
    return (focusedPlayer.stats.deathEvents || []).filter((k: any) => k.time <= hoverIdx! * 60).length
  })

  // A handful of evenly-spaced hero-portrait markers along the focus line.
  const heroMarkerIndices = $derived.by(() => {
    const len = focusSeries.length
    if (len < 2) return []
    const stops = [0.22, 0.5, 0.78]
    return stops.map((s) => Math.round(s * (len - 1)))
  })

  // Level ring on the side of the Economy chart — Dota hero levels cap at 30.
  const levelRingFraction = $derived(Math.min(1, focusedPlayer.level / 30))

  // ── Item purchase markers for networth chart ────────────────────────
  // Items costing ≥1000g get a vertical mark so you can see when each
  // power spike landed relative to the networth curve.
  interface ItemChartMarker {
    minuteIdx: number
    time: number
    itemId: number
    name: string
    cost: number
    imgUrl: string
  }

  const itemChartMarkers = $derived.by((): ItemChartMarker[] => {
    const purchases = (focusedPlayer.stats.itemPurchases || [])
      .filter((p: any) => {
        const item = getItem(p.itemId)
        return item && item.cost >= 1000 && p.time >= 0
      })
      .sort((a: any, b: any) => a.time - b.time)

    return purchases.map((p: any) => {
      const item = getItem(p.itemId)!
      return {
        minuteIdx: Math.round(p.time / 60),
        time: p.time,
        itemId: p.itemId,
        name: item.dname,
        cost: item.cost,
        imgUrl: getItemImgUrl(item.img)
      }
    })
  })

  // ── Alive/dead GPM ───────────────────────────────────────────────────
  // Shows how much farm efficiency death downtime costs. Estimated from
  // deathEvents respawn intervals + 45s walking-back time.
  const aliveEfficiency = $derived.by(() => {
    const deathEvents = focusedPlayer.stats.deathEvents || []
    const networth = focusedPlayer.networth

    let deadSeconds = 0
    for (const d of deathEvents) {
      const respawnSec = Math.min(100, 10 + d.time / 30)
      deadSeconds += respawnSec + 45
    }

    const matchSec = (focusedPlayer.stats.networthPerMinute || []).length * 60
    const aliveSec = Math.max(1, matchSec - deadSeconds)
    const aliveGPM = Math.round((networth / aliveSec) * 60)
    const totalGPM = focusedPlayer.goldPerMinute

    return {
      deadSeconds,
      aliveSec,
      aliveGPM,
      totalGPM,
      efficiencyLoss: totalGPM > 0 ? Math.round(((aliveGPM - totalGPM) / totalGPM) * 100) : 0
    }
  })

  const farmDistributionList = $derived.by(() => {
    const list = focusedPlayer.stats.farmDistributionReport?.creepLocation || []
    const totalXP = list.reduce((sum: number, c: any) => sum + (c.xp || 0), 0)
    return list
      .map((c: any) => ({
        name: getFarmLocationName(c.id),
        count: c.count,
        percent: totalXP > 0 ? Math.round(((c.xp || 0) / totalXP) * 100) : 0
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
  })

  interface GameplayMilestone {
    name: string
    time: number
    status: 'ontime' | 'delayed' | 'late'
    statusText: string
    color: string
    itemIcon: string
  }

  function buildMilestone(itemId: number, name: string, thresholds: [number, number]): GameplayMilestone | null {
    const timing = focusedPlayer.stats.itemPurchases?.find((p: any) => p.itemId === itemId)
    if (!timing) return null
    const minutes = timing.time / 60
    let status: 'ontime' | 'delayed' | 'late' = 'ontime'
    let statusText = `Excellent (Under ${thresholds[0]}m)`
    let color = 'text-gr'
    if (minutes > thresholds[1]) {
      status = 'late'
      statusText = `Late (Over ${thresholds[1]}m)`
      color = 'text-rd'
    } else if (minutes > thresholds[0]) {
      status = 'delayed'
      statusText = `Delayed (${thresholds[0]}m–${thresholds[1]}m)`
      color = 'text-gd'
    }
    return { name, time: timing.time, status, statusText, color, itemIcon: getItemImgUrl(`item-assets/images/${itemId}.png`) }
  }

  // Hero-specific power-spike items (only meaningful for a handful of
  // heroes/positions) plus two role-general milestones — first item back
  // and boots timing — so every player gets at least one timing data
  // point instead of an empty state.
  const gameplayMilestones = $derived.by(() => {
    const heroSpecific = [
      buildMilestone(145, 'Battle Fury Timing', [15, 18]),
      buildMilestone(147, 'Manta Style Timing', [22, 26]),
      buildMilestone(208, 'Abyssal Blade Timing', [35, 38])
    ].filter((m): m is GameplayMilestone => m !== null)

    const purchases = (focusedPlayer.stats.itemPurchases || []).slice().sort((a: any, b: any) => a.time - b.time)
    const general: GameplayMilestone[] = []

    // Boots line (any tier) — first boots purchased, role-agnostic.
    const bootIds = new Set([1, 63, 64, 65, 68, 145, 617]) // common boot upgrade lines present in most item tables
    const bootsPurchase = purchases.find((p: any) => bootIds.has(p.itemId))
    if (bootsPurchase) {
      const minutes = bootsPurchase.time / 60
      const isCore = ['POSITION_1', 'POSITION_2', 'POSITION_3'].includes(focusedPlayer.position)
      const thresholds: [number, number] = isCore ? [7, 10] : [8, 12]
      const item = getItem(bootsPurchase.itemId)
      let color = 'text-gr'
      let statusText = `Excellent (Under ${thresholds[0]}m)`
      let status: 'ontime' | 'delayed' | 'late' = 'ontime'
      if (minutes > thresholds[1]) {
        status = 'late'; statusText = `Late (Over ${thresholds[1]}m)`; color = 'text-rd'
      } else if (minutes > thresholds[0]) {
        status = 'delayed'; statusText = `Delayed (${thresholds[0]}m–${thresholds[1]}m)`; color = 'text-gd'
      }
      general.push({
        name: 'First Boots Timing',
        time: bootsPurchase.time,
        status,
        statusText,
        color,
        itemIcon: item ? getItemImgUrl(item.img) : ''
      })
    }

    // First meaningful item (cost >= 1000) — a role-agnostic proxy for
    // "how long before your first real power spike."
    const firstBig = purchases.find((p: any) => {
      const item = getItem(p.itemId)
      return item && item.cost >= 1000
    })
    if (firstBig) {
      const minutes = firstBig.time / 60
      const isCore = ['POSITION_1', 'POSITION_2', 'POSITION_3'].includes(focusedPlayer.position)
      const thresholds: [number, number] = isCore ? [12, 18] : [15, 22]
      const item = getItem(firstBig.itemId)
      let color = 'text-gr'
      let statusText = `Excellent (Under ${thresholds[0]}m)`
      let status: 'ontime' | 'delayed' | 'late' = 'ontime'
      if (minutes > thresholds[1]) {
        status = 'late'; statusText = `Late (Over ${thresholds[1]}m)`; color = 'text-rd'
      } else if (minutes > thresholds[0]) {
        status = 'delayed'; statusText = `Delayed (${thresholds[0]}m–${thresholds[1]}m)`; color = 'text-gd'
      }
      general.push({
        name: 'First Power Item Timing',
        time: firstBig.time,
        status,
        statusText,
        color,
        itemIcon: item ? getItemImgUrl(item.img) : ''
      })
    }

    return [...heroSpecific, ...general]
  })

  // ── Death clustering (Insights + Combat) ────────────────────────────
  // Groups deaths by nearest landmark so a repeated pattern ("died near
  // the same tower 3 times") surfaces instead of a flat, unclustered log.
  interface DeathCluster {
    landmark: string
    count: number
    times: number[]
  }

  const deathClusters = $derived.by((): DeathCluster[] => {
    const byLandmark = new Map<string, number[]>()
    for (const ev of focusedPlayerEvents) {
      if (ev.type !== 'death') continue
      const list = byLandmark.get(ev.landmark) || []
      list.push(ev.time)
      byLandmark.set(ev.landmark, list)
    }
    return [...byLandmark.entries()]
      .map(([landmark, times]) => ({ landmark, count: times.length, times }))
      .filter((c) => c.count >= 2)
      .sort((a, b) => b.count - a.count)
  })

  const coachingChecklist = $derived.by(() => {
    const list: { title: string; desc: string; target: string; done: boolean; color: string; tabLink?: string }[] = []
    const pos = focusedPlayer.position
    const isCore = ['POSITION_1', 'POSITION_2', 'POSITION_3'].includes(pos)
    const gpm = focusedPlayer.goldPerMinute
    const deaths = focusedPlayer.deaths

    // 1) GPM — role-aware thresholds with graduated targets
    const gpmTargets = isCore
      ? { done: 700, target: 550, hint: (t: number) => `Target: 650+ GPM. At ${gpm}, aim for ${t}+ next game by hitting lane creeps more often.` }
      : { done: 450, target: 300, hint: (t: number) => `Target: 400+ GPM for supports. At ${gpm}, aim for ${t}+ next game through bounties, assists, and tower pushes.` }

    if (gpm >= gpmTargets.done) {
      list.push({ title: 'Farming Velocity', desc: `Strong — ${gpm} GPM exceeds benchmarks for ${roleShortLabel(pos)}. Maintain lane pressure and stack-clearing pattern.`, target: '', done: true, color: 'border-emerald-500/25 bg-emerald-950/15 text-emerald-400' })
    } else {
      const nextTarget = Math.max(gpmTargets.target, gpm + 50)
      list.push({ title: 'Farming Velocity', desc: `At ${gpm} GPM, you're below ${roleShortLabel(pos)} benchmarks. ${gpmTargets.hint(nextTarget)}`, target: `→ ${nextTarget} GPM`, done: false, color: 'border-rose-500/25 bg-rose-950/15 text-rose-300' })
    }

    // 2) Survivability
    const deathThresholds = isCore ? { done: 3, target: 6 } : { done: 4, target: 7 }
    if (deaths <= deathThresholds.done) {
      list.push({ title: 'Survival & Position', desc: `${deaths} deaths — excellent positioning. Keep your current map awareness.`, target: '', done: true, color: 'border-emerald-500/25 bg-emerald-950/15 text-emerald-400' })
    } else {
      list.push({ title: 'Survival & Position', desc: `${deaths} deaths — each one costs farm time and feeds opponents. Review the Map tab to see repeated danger zones.`, target: `→ ≤${deathThresholds.done} deaths`, done: false, color: 'border-rose-500/25 bg-rose-950/15 text-rose-300', tabLink: 'map' })
    }

    // 3) Item timing — first meaningful item (≥1000g cost)
    const purchases = (focusedPlayer.stats.itemPurchases || []).slice().sort((a: any, b: any) => a.time - b.time)
    const firstBig = purchases.find((p: any) => {
      const item = getItem(p.itemId)
      return item && item.cost >= 1000
    })
    if (firstBig) {
      const item = getItem(firstBig.itemId)!
      const minutes = firstBig.time / 60
      const timingTargets = isCore && (pos === 'POSITION_1' || pos === 'POSITION_2')
        ? { done: 12, target: 18 }
        : { done: 15, target: 22 }

      if (minutes <= timingTargets.done) {
        list.push({ title: 'First Power Item Timing', desc: `Outstanding — ${item.dname} secured at ${formatTime(firstBig.time)}, ~${Math.round(timingTargets.done - minutes)} min ahead of benchmark.`, target: '', done: true, color: 'border-emerald-500/25 bg-emerald-950/15 text-emerald-400' })
      } else if (minutes <= timingTargets.target) {
        list.push({ title: 'First Power Item Timing', desc: `${item.dname} at ${formatTime(firstBig.time)} is on-pace. Next game, aim to shave 1-2 min off by avoiding early deaths and securing bounty runes.`, target: `→ ≤${timingTargets.done}m`, done: false, color: 'border-amber-500/25 bg-amber-950/15 text-amber-300' })
      } else {
        list.push({ title: 'First Power Item Timing', desc: `${item.dname} at ${formatTime(firstBig.time)} is ${Math.round(minutes - timingTargets.target)} min late. Focus on safe CS in lane before 10m; each early death delays your power spike significantly.`, target: `→ ≤${timingTargets.target}m`, done: false, color: 'border-rose-500/25 bg-rose-950/15 text-rose-300' })
      }
    }

    // 4) Core Checklist — fight participation for carries
    const totalDamage = (focusedPlayer.stats.heroDamagePerMinute || []).reduce((a: number, b: number) => a + b, 0)
    if (isCore) {
      const dmgPerKill = focusedPlayer.kills > 0 ? Math.round(totalDamage / focusedPlayer.kills) : totalDamage
      const dmgOk = totalDamage >= (focusedPlayer.isVictory ? 18000 : 15000)
      if (dmgOk) {
        list.push({ title: 'Teamfight Output', desc: `${totalDamage.toLocaleString()} hero damage (~${dmgPerKill.toLocaleString()} per kill) — you turned net worth into fight impact.`, target: '', done: true, color: 'border-emerald-500/25 bg-emerald-950/15 text-emerald-400' })
      } else {
        list.push({ title: 'Teamfight Output', desc: `${totalDamage.toLocaleString()} hero damage is low for a ${roleShortLabel(pos)}. With your net worth, consider joining fights when your key item is online.`, target: '→ Join 2+ more teamfights at item spike', done: false, color: 'border-rose-500/25 bg-rose-950/15 text-rose-300' })
      }
    } else {
      // 4) Support Checklist — vision & utility
      const wards = focusedPlayer.stats.wards || []
      const earlyWards = wards.filter((w: any) => w.time < 600).length
      const totalWards = wards.length
      const wardsOk = totalWards >= 15 && earlyWards >= 4

      if (wardsOk) {
        list.push({ title: 'Vision Coverage', desc: `${totalWards} wards placed (${earlyWards} early) — strong vision game protecting your cores' farm windows.`, target: '', done: true, color: 'border-emerald-500/25 bg-emerald-950/15 text-emerald-400' })
      } else if (totalWards >= 8) {
        list.push({ title: 'Vision Coverage', desc: `${totalWards} wards total but only ${earlyWards} before 10:00. Early wards protect carries during their most vulnerable farm phase; front-load at least 4.`, target: '→ ≥4 early wards next game', done: false, color: 'border-amber-500/25 bg-amber-950/15 text-amber-300', tabLink: 'map' })
      } else {
        list.push({ title: 'Vision Coverage', desc: `Only ${totalWards} wards total (${earlyWards} early). As ${roleShortLabel(pos)}, wards are your primary contribution to map control.`, target: `→ ≥${totalWards >= 6 ? 12 : 8} wards`, done: false, color: 'border-rose-500/25 bg-rose-950/15 text-rose-300', tabLink: 'map' })
      }
    }

    return list
  })

  let expandedCheckIndex = $state<number | null>(0)
  function toggleCheckIndex(idx: number) {
    expandedCheckIndex = expandedCheckIndex === idx ? null : idx
  }

  const kdaText = $derived(((focusedPlayer.kills + focusedPlayer.assists) / Math.max(focusedPlayer.deaths, 1)).toFixed(2))

  // ── Combat tab: kill / death feed ───────────────────────────────────
  const combatFeed = $derived.by(() => {
    return focusedPlayerEvents
      .filter((e) => e.type === 'kill' || e.type === 'death')
      .sort((a, b) => a.time - b.time)
  })

  // ── Timeline tab: unified real events ───────────────────────────────
  type TimelineKind = 'kill' | 'death' | 'ward' | 'rune' | 'item'
  interface TimelineEntry {
    kind: TimelineKind
    time: number
    label: string
    sub: string
    color: string
    icon: string
  }

  type TimelinePhase = 'early' | 'midgame' | 'late'
  interface TimelinePhaseGroup {
    id: TimelinePhase
    label: string
    rangeLabel: string
    min: number
    max: number
    entries: TimelineEntry[]
  }

  let tlShowKills = $state(true)
  let tlShowDeaths = $state(true)
  let tlShowWards = $state(true)
  let tlShowRunes = $state(true)
  let tlShowItems = $state(true)

  // Persist timeline filters to localStorage
  const TL_FILTER_KEY = 'dotatracker_timeline_filters'
  $effect(() => {
    const filters = { kills: tlShowKills, deaths: tlShowDeaths, wards: tlShowWards, runes: tlShowRunes, items: tlShowItems }
    localStorage.setItem(TL_FILTER_KEY, JSON.stringify(filters))
  })
  $effect(() => {
    try {
      const saved = localStorage.getItem(TL_FILTER_KEY)
      if (saved) {
        const filters = JSON.parse(saved)
        tlShowKills = filters.kills ?? true
        tlShowDeaths = filters.deaths ?? true
        tlShowWards = filters.wards ?? true
        tlShowRunes = filters.runes ?? true
        tlShowItems = filters.items ?? true
      }
    } catch { /* ignore corrupt localStorage */ }
  })

  const timelinePhaseGroups = $derived.by((): TimelinePhaseGroup[] => {
    const groups: TimelinePhaseGroup[] = [
      { id: 'early', label: 'Early Game', rangeLabel: '0–10m', min: 0, max: 600, entries: [] },
      { id: 'midgame', label: 'Mid Game', rangeLabel: '10–25m', min: 600, max: 1500, entries: [] },
      { id: 'late', label: 'Late Game', rangeLabel: '25m+', min: 1500, max: Infinity, entries: [] }
    ]

    const entries = timelineEntries
    for (const entry of entries) {
      const group = groups.find((g) => entry.time >= g.min && entry.time < g.max)
      if (group) group.entries.push(entry)
    }

    return groups.filter((g) => g.entries.length > 0)
  })

  const timelineEntries = $derived.by(() => {
    const entries: TimelineEntry[] = []

    for (const ev of combatFeed) {
      entries.push({
        kind: ev.type as TimelineKind,
        time: ev.time,
        label: ev.type === 'kill' ? 'Scored a kill' : 'Died',
        sub: ev.landmark,
        color: ev.color,
        icon: ev.char
      })
    }

    ;(focusedPlayer.stats.wards || []).forEach((w: any) => {
      const isObs = w.type === 1
      entries.push({
        kind: 'ward',
        time: w.time,
        label: `Placed ${isObs ? 'Observer' : 'Sentry'} Ward`,
        sub: nearestLandmark(scaleCoordinateX(w.positionX), scaleCoordinateY(w.positionY)),
        color: isObs ? 'var(--color-gd)' : 'var(--color-bl)',
        icon: isObs ? '★' : '✚'
      })
    })

    ;(focusedPlayer.stats.runes || []).forEach((r: any) => {
      entries.push({
        kind: 'rune',
        time: r.time,
        label: `${r.rune.charAt(0) + r.rune.slice(1).toLowerCase()} Rune — ${r.action === 'BOTTLE' ? 'bottled' : 'picked up'}`,
        sub: '',
        color: 'var(--color-pu)',
        icon: '♦'
      })
    })

    ;(focusedPlayer.stats.itemPurchases || []).forEach((p: any) => {
      const item = getItem(p.itemId)
      if (!item || item.cost < 500) return // keep the feed readable: only meaningful purchases
      entries.push({
        kind: 'item',
        time: p.time,
        label: `Purchased ${item.dname}`,
        sub: `${item.cost.toLocaleString()}g`,
        color: '#a1a1aa',
        icon: '🛒'
      })
    })

    return entries
      .filter((e) => {
        if (e.kind === 'kill' && !tlShowKills) return false
        if (e.kind === 'death' && !tlShowDeaths) return false
        if (e.kind === 'ward' && !tlShowWards) return false
        if (e.kind === 'rune' && !tlShowRunes) return false
        if (e.kind === 'item' && !tlShowItems) return false
        return true
      })
      .sort((a, b) => a.time - b.time)
  })
</script>

<div class="flex-1 overflow-hidden flex flex-col select-none bg-black" onkeydown={handleKeydown} tabindex="-1">
  <!-- HEADER -->
  <div class="bg-black border-b border-zinc-800/60 p-4 flex items-center justify-between shrink-0 gap-4">
    <div class="flex items-center gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xxs text-zinc-500 uppercase tracking-wider font-extrabold" for="player-select">Coaching Focus</label>
        <select
          id="player-select"
          bind:value={selectedPlayerIndex}
          class="sel bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 text-tx font-bold py-1 px-2.5 rounded text-base cursor-pointer focus:outline-none focus:border-zinc-500 transition-colors"
        >
          {#each players as p, idx}
            {@const hero = getHero(p.heroId)}
            {@const kdaStr = `${p.kills}/${p.deaths}/${p.assists}`}
            {@const roleLabel = p.position === 'POSITION_1' ? 'P1' : p.position === 'POSITION_2' ? 'P2' : p.position === 'POSITION_3' ? 'P3' : p.position === 'POSITION_4' ? 'P4' : 'P5'}
            <option value={idx}>
              {hero?.localized_name || `Hero ${p.heroId}`} — {roleLabel} | {kdaStr} | {p.goldPerMinute}GPM
            </option>
          {/each}
        </select>
      </div>

      <div class="h-8 w-px bg-zinc-800/60"></div>

      <div class="w-12 h-12 rounded-lg overflow-hidden border {focusedPlayer.isVictory ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'} transition-transform hover:scale-105">
        {#if heroInfo}
          <img src={getHeroImgUrl(heroInfo.icon)} class="w-full h-full object-cover" alt={heroInfo.localized_name} />
        {/if}
      </div>

      <div>
        <div class="font-extrabold text-lg flex items-center gap-2">
          <span class="text-white">{heroInfo?.localized_name || 'Solo Carry'}</span>
          {#if isYou(focusedPlayer.heroId)}
            <span class="text-xxs bg-white/10 border border-white/20 text-white px-1.5 py-0.25 rounded font-bold uppercase tracking-wider">YOU</span>
          {/if}
          <span class="text-xxs px-1.5 py-0.25 rounded font-bold uppercase tracking-wider {focusedPlayer.isVictory ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'}">
            {focusedPlayer.isVictory ? 'Victory' : 'Defeat'}
          </span>
        </div>
        <div class="text-xs text-zinc-400 font-mono uppercase tracking-[0.2px] mt-0.5">
          {formatPosition(focusedPlayer.position)}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="hidden lg:flex gap-3 font-mono text-center">
        <div class="bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-1.5">
          <div class="text-base font-bold font-tabular text-white">{focusedPlayer.goldPerMinute}</div>
          <div class="text-xxs text-zinc-500 uppercase tracking-[0.4px]">GPM</div>
        </div>
        <div class="bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-1.5">
          <div class="text-base font-bold font-tabular text-white">{focusedPlayer.experiencePerMinute}</div>
          <div class="text-xxs text-zinc-500 uppercase tracking-[0.4px]">XPM</div>
        </div>
        <div class="bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-1.5">
          <div class="text-base font-bold font-tabular text-amber-400">{focusedPlayer.networth.toLocaleString()}</div>
          <div class="text-xxs text-zinc-500 uppercase tracking-[0.4px]">Net Worth</div>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-zinc-950 border border-zinc-800/80 p-2 px-3 rounded-lg">
        <div class="flex flex-col text-right">
          <span class="text-xxs text-zinc-500 font-extrabold uppercase tracking-[0.6px]">Game Grade</span>
          <span class="text-xs text-zinc-300 font-semibold truncate max-w-[120px]">{performanceGrade.label}</span>
        </div>
        <div class="text-4xl font-black leading-none font-mono tracking-tighter font-tabular {performanceGrade.color} select-none">{performanceGrade.grade}</div>
      </div>

      <button
        class="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-600/80 text-xs font-bold text-zinc-400 hover:text-white rounded-lg px-3 py-2 cursor-pointer transition-all"
        onclick={copyCoachingSummary}
        title="Copy coaching summary to clipboard"
      >
        {#if copyFeedback}
          <span class="text-emerald-400">✓ Copied</span>
        {:else}
          <span>📋 Copy Summary</span>
        {/if}
      </button>

      <div class="hidden sm:flex gap-4 font-mono text-center">
        <div>
          <div class="text-xl font-bold font-tabular text-emerald-400">{focusedPlayer.kills}</div>
          <div class="text-xxs text-zinc-500 uppercase tracking-[0.4px] mt-0.5">Kills</div>
        </div>
        <div>
          <div class="text-xl font-bold font-tabular text-rose-500">{focusedPlayer.deaths}</div>
          <div class="text-xxs text-zinc-500 uppercase tracking-[0.4px] mt-0.5">Deaths</div>
        </div>
        <div>
          <div class="text-xl font-bold font-tabular text-cyan-400">{focusedPlayer.assists}</div>
          <div class="text-xxs text-zinc-500 uppercase tracking-[0.4px] mt-0.5">Assists</div>
        </div>
      </div>
    </div>
  </div>

  <!-- INVENTORY STRIP -->
  <div class="flex items-center gap-4 px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-950/40 shrink-0 overflow-x-auto">
    <span class="text-xxs font-extrabold uppercase tracking-wider text-zinc-500 shrink-0">Loadout</span>
    <div class="flex gap-1.5 shrink-0">
      {#each inventoryIds as itemId}
        {@const item = getItem(itemId)}
        {@const purchaseTime = getPurchaseTime(itemId)}
        <div class="w-11 h-8 rounded bg-zinc-900 border border-zinc-800 overflow-hidden relative group cursor-help transition-all hover:border-zinc-500 hover:-translate-y-0.5">
          {#if item}
            <img src={getItemImgUrl(item.img)} alt={item.dname} class="w-full h-full object-cover" />
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col bg-zinc-950 border border-zinc-800 text-zinc-200 p-[4px_8px] rounded text-xs z-20 whitespace-nowrap shadow-xl">
              <span class="font-bold">{item.dname}</span>
              {#if purchaseTime !== null}
                <span class="text-zinc-500 font-mono">Purchased {formatTime(purchaseTime)}</span>
              {/if}
            </div>
          {:else}
            <div class="w-full h-full bg-zinc-950/20 border border-dashed border-zinc-800/80"></div>
          {/if}
        </div>
      {/each}
    </div>
    <div class="h-6 w-px bg-zinc-800/60 shrink-0"></div>
    <div class="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative group cursor-help flex items-center justify-center shrink-0">
      {#if neutralItem}
        <img src={getItemImgUrl(neutralItem.img)} alt={neutralItem.dname} class="w-[85%] h-[85%] rounded-full object-cover" />
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950 border border-zinc-800 text-zinc-200 p-[4px_8px] rounded text-xs z-20 whitespace-nowrap shadow-xl">{neutralItem.dname}</div>
      {:else}
        <div class="w-full h-full rounded-full bg-zinc-950/20 border border-dashed border-zinc-800/80"></div>
      {/if}
    </div>
    <div class="flex gap-1.5 shrink-0">
      {#each backpackIds as itemId}
        {@const item = getItem(itemId)}
        <div class="w-9 h-6 rounded bg-zinc-900 border border-zinc-800 overflow-hidden relative group cursor-help transition-all hover:border-zinc-500">
          {#if item}
            <img src={getItemImgUrl(item.img)} alt={item.dname} class="w-full h-full object-cover grayscale opacity-70" />
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950 border border-zinc-800 text-zinc-200 p-[4px_8px] rounded text-xs z-20 whitespace-nowrap shadow-xl">{item.dname}</div>
          {:else}
            <div class="w-full h-full bg-zinc-950/20 border border-dashed border-zinc-800/80"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- SUBTABS — Insights first: this is the "how do I improve" answer,
       everything else is supporting evidence you drill into from here. -->
  <div class="flex gap-2 border-b border-zinc-800/60 p-2.5 shrink-0 bg-black">
    {#each [
      { id: 'insights', label: '🎓 Insights' },
      { id: 'map', label: '🗺️ Map' },
      { id: 'economy', label: '📈 Economy' },
      { id: 'combat', label: '⚔️ Combat' },
      { id: 'timeline', label: '🕒 Timeline' }
    ] as tab}
      <button
        class="p-[6px_12px] text-sm font-bold rounded-md transition-all cursor-pointer border flex items-center gap-1.5 {activeSubTab === tab.id
          ? 'bg-zinc-800 border-zinc-700 text-white shadow-inner shadow-black/30'
          : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'}"
        onclick={() => (activeSubTab = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- BODY -->
  <div class="flex-1 overflow-y-auto bg-black">
    {#if activeSubTab === 'insights'}
      <div class="p-5 flex flex-col gap-5">
        {#if enemyMirrorPlayer && enemyMirrorHero}
          <!-- Game Snapshot — one-glance role & outcome summary -->
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-1">Game Snapshot</div>
                <div class="text-sm text-zinc-300 leading-relaxed">{gameSnapshot.roleSummary}</div>
              </div>
              <div class="shrink-0 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <div class="flex flex-col text-right">
                  <span class="text-xxs text-zinc-500 font-extrabold uppercase tracking-[0.6px]">Outcome</span>
                  <span class="text-xs font-semibold {focusedPlayer.isVictory ? 'text-emerald-400' : 'text-rose-400'}">
                    {focusedPlayer.isVictory ? 'Victory' : 'Defeat'}
                  </span>
                </div>
                <div class="font-mono text-2xl font-black {performanceGrade.color} w-14 text-center">{performanceGrade.grade}</div>
              </div>
            </div>
            <div class="text-xs text-zinc-500 italic">{gameSnapshot.outcomeQuality}</div>
            <div class="grid grid-cols-3 gap-2 pt-1">
              {#each gameSnapshot.topStats as stat}
                <div class="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-center">
                  <div class="text-sm font-extrabold font-tabular {stat.color}">{stat.value}</div>
                  <div class="text-xxs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              {/each}
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px]">Biggest Lever — vs. {enemyMirrorRoleLabel}</div>
            <div class="text-xs text-zinc-500 leading-relaxed">
              Compared minute-for-minute against the only fair baseline in this match: {enemyMirrorHero.localized_name}, the enemy player at the same role. Ranked by size of gap, worst first.
            </div>
          </div>

          {#if biggestGap}
            <div class="bg-zinc-950/60 border {biggestGap.pct < 0 ? 'border-rose-500/25' : 'border-emerald-500/25'} rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{biggestGap.pct < 0 ? '⚠️' : '✅'}</span>
                  <div>
                    <div class="text-sm font-extrabold text-white">{biggestGap.label}</div>
                    <div class="text-xs text-zinc-400 mt-0.5">
                      You: <span class="font-mono font-bold text-zinc-200">{biggestGap.format(biggestGap.mine)}</span>
                      &nbsp;·&nbsp; {enemyMirrorRoleLabel}: <span class="font-mono font-bold text-zinc-200">{biggestGap.format(biggestGap.theirs)}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div class="font-mono text-xl font-black {biggestGap.pct < 0 ? 'text-rose-400' : 'text-emerald-400'}">{biggestGap.pct >= 0 ? '+' : ''}{Math.round(biggestGap.pct)}%</div>
                  <div class="text-xxs text-zinc-500 uppercase tracking-wider">vs. mirror</div>
                </div>
              </div>
              <div class="border-t border-zinc-800/40 pt-2 flex items-start gap-2">
                <span class="text-xs text-zinc-300 leading-relaxed flex-1">{biggestGap.advice}</span>
                {#if biggestGap.pct < 0}
                  <button class="shrink-0 text-[9px] font-bold text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded px-2 py-0.5 cursor-pointer transition-colors"
                    onclick={() => { activeSubTab = 'map'; cursorTime = null }}>Review Map</button>
                {/if}
              </div>
            </div>
          {/if}

          <div class="grid grid-cols-1 gap-2">
            {#each mirrorGaps as gap}
              <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3.5 py-2.5 flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-zinc-300">{gap.label}</span>
                  <div class="flex items-center gap-2 font-mono text-xs">
                    <span class="text-zinc-500">{gap.format(gap.mine)} vs {gap.format(gap.theirs)}</span>
                    <span class="font-extrabold {gap.pct < 0 ? 'text-rose-400' : 'text-emerald-400'}">{gap.pct >= 0 ? '+' : ''}{Math.round(gap.pct)}%</span>
                  </div>
                </div>
                <div class="text-[10.5px] text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-1.5">{gap.advice}</div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="bg-zinc-950/40 border border-zinc-800/60 border-dashed rounded-xl p-6 text-center text-zinc-500 font-medium">
            No opposing player at the same role was found to compare against.
          </div>
        {/if}

        {#if farmDistributionList.length > 0}
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Farm Distribution Insight</div>
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div class="grid grid-cols-1 gap-2">
              {#each farmDistributionList.slice(0, 3) as farm}
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-zinc-200 truncate">{farm.name}</span>
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div class="h-full rounded-full" class:bg-emerald-500={farm.percent >= expectedFarmShare(farm.name, focusedPlayer.position)} class:bg-amber-400={farm.percent < expectedFarmShare(farm.name, focusedPlayer.position)} style="width: {Math.min(farm.percent, 100)}%"></div>
                    </div>
                    <span class="font-mono text-xs text-zinc-400">{farm.percent}%</span>
                  </div>
                </div>
              {/each}
            </div>
            <div class="text-[10.5px] text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-2">{farmInsightNote()}</div>
          </div>
        {/if}

        {#if deathClusters.length > 0}
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Repeated Death Pattern</div>
          <div class="flex flex-col gap-2">
            {#each deathClusters as cluster}
              <button
                class="flex items-center justify-between gap-3 bg-zinc-950/60 border border-rose-500/20 rounded-lg px-3.5 py-2.5 text-left hover:bg-zinc-900 transition-colors"
                onclick={() => { activeSubTab = 'map'; cursorTime = cluster.times[0] }}
              >
                <span class="text-xs text-zinc-300">
                  Died <span class="font-extrabold text-rose-400">{cluster.count} times</span> {cluster.landmark}
                </span>
                <span class="font-mono text-xxs text-zinc-500 shrink-0">{cluster.times.map((t) => formatTime(t)).join(', ')}</span>
              </button>
            {/each}
          </div>
        {/if}

        {#if !['POSITION_1', 'POSITION_2', 'POSITION_3'].includes(focusedPlayer.position) && wardTimingSummary.total > 0}
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Vision Timing</div>
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div class="text-xs text-zinc-400 leading-relaxed">
              Early vision (before 10:00) is what protects your team's core farm; late vision mostly just confirms fights already in motion.
            </div>
            <div class="grid grid-cols-3 gap-2 text-center mt-1">
              <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                <div class="font-mono text-lg font-extrabold {wardTimingSummary.early / wardTimingSummary.total < 0.3 ? 'text-rose-400' : 'text-emerald-400'}">{wardTimingSummary.early}</div>
                <div class="text-xxs text-zinc-500 uppercase tracking-wider">Early (0–10m)</div>
              </div>
              <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                <div class="font-mono text-lg font-extrabold text-zinc-300">{wardTimingSummary.mid}</div>
                <div class="text-xxs text-zinc-500 uppercase tracking-wider">Mid (10–25m)</div>
              </div>
              <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                <div class="font-mono text-lg font-extrabold text-zinc-300">{wardTimingSummary.late}</div>
                <div class="text-xxs text-zinc-500 uppercase tracking-wider">Late (25m+)</div>
              </div>
            </div>
            {#if wardTimingSummary.early / wardTimingSummary.total < 0.3}
              <div class="text-xs text-rose-300 mt-1">Under a third of your wards went down in the first 10 minutes — consider front-loading vision before your laners are exposed.</div>
            {/if}
          </div>
        {/if}

        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Item Timing Milestones</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {#each gameplayMilestones as milestone}
            <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div class="flex items-center gap-3">
                <img src={milestone.itemIcon} class="w-11 h-8 rounded border border-zinc-800 object-cover" alt="" />
                <div>
                  <div class="text-[12.5px] font-bold text-white">{milestone.name}</div>
                  <div class="text-[10.5px] font-mono text-tx2">Secured at: {formatTime(milestone.time)}</div>
                </div>
              </div>
              <div class="border-t border-zinc-800/60 pt-2.5 flex items-center justify-between text-[11px]">
                <span class="text-zinc-500 uppercase tracking-wider font-extrabold">Evaluation</span>
                <span class="font-bold {milestone.color}">{milestone.statusText}</span>
              </div>
            </div>
          {/each}
          {#if gameplayMilestones.length === 0}
            <div class="col-span-3 bg-zinc-950/40 border border-zinc-800/60 border-dashed rounded-xl p-6 text-center text-zinc-500 font-medium">
              No item purchase timing information logged for this hero.
            </div>
          {/if}
        </div>

        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Coaching Checklist</div>
        <div class="flex flex-col gap-3">
          {#each coachingChecklist as check, idx}
            <div class="flex flex-col border rounded-xl {check.color} transition-all duration-200 cursor-pointer hover:shadow-sm" onclick={() => toggleCheckIndex(idx)}>
              <div class="flex items-center justify-between p-3.5 select-none font-bold">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="text-[16px] shrink-0">{check.done ? '✅' : '❌'}</span>
                  <span class="text-[13px] font-extrabold truncate">{check.title}</span>
                  {#if !check.done && check.target}
                    <span class="text-[10px] font-extrabold text-zinc-400 bg-zinc-900/80 border border-zinc-800 rounded px-2 py-0.25 shrink-0">{check.target}</span>
                  {/if}
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  {#if check.tabLink}
                    <button class="text-[9px] font-bold text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded px-2 py-0.5 cursor-pointer transition-colors"
                      onclick={(e) => { e.stopPropagation(); activeSubTab = check.tabLink!; cursorTime = null }}>View</button>
                  {/if}
                  <span class="text-[10px] text-zinc-500 transition-transform duration-200 {expandedCheckIndex === idx ? 'rotate-180' : ''}">▼</span>
                </div>
              </div>
              {#if expandedCheckIndex === idx}
                <div class="px-3.5 pb-3.5 text-[11.5px] leading-relaxed text-zinc-300 border-t border-zinc-800/30 pt-2.5 font-normal">{check.desc}</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {:else if activeSubTab === 'map'}
      <div class="p-5 flex flex-col gap-5">
        <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-tx2 uppercase tracking-[0.5px]">Position Telemetry</span>
                <div class="flex gap-1 ml-1">
                  {#each ['all', 'laning', 'midgame', 'late'] as phaseId}
                    {@const phase = phaseRanges[phaseId as MatchPhase]}
                    <button
                      class="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border transition-all cursor-pointer {activePhase === phaseId
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}"
                      onclick={() => setPhase(phaseId as MatchPhase)}
                    >{phase.label.slice(0, phase.label.indexOf('(') > 0 ? phase.label.indexOf('(') : undefined).trim() || phase.label}</button>
                  {/each}
                </div>
              </div>
              <label class="flex items-center gap-1.5 text-xxs font-semibold text-zinc-400 cursor-pointer hover:text-white">
                <input type="checkbox" bind:checked={heatmapMode} class="rounded border-zinc-800 bg-zinc-950" />
                Heatmap
              </label>
            </div>

            <div class="relative w-[300px] h-[300px] border border-bd rounded-lg overflow-hidden bg-sb/90 flex items-center justify-center select-none shadow-lg" onmouseleave={hideTooltip}>
              <img src={MinimapImage} alt="Dota 2 Calibrated Minimap" class="w-full h-full object-contain opacity-95" />

              <svg viewBox="0 0 255 255" class="absolute inset-0 w-full h-full">
                {#if heatmapMode}
                  <defs>
                    {#each visibleEvents as ev, i}
                      <radialGradient id={`heat-${i}`}>
                        <stop offset="0%" stop-color={ev.color} stop-opacity="0.55" />
                        <stop offset="100%" stop-color={ev.color} stop-opacity="0" />
                      </radialGradient>
                    {/each}
                  </defs>
                  {#each visibleEvents as ev, i}
                    <circle cx={(ev.x / 100) * 255} cy={(ev.y / 100) * 255} r="16" fill={`url(#heat-${i})`} />
                  {/each}
                {/if}

                {#if showStructures}
                  {#each staticStructures as struct}
                    <svg
                      x={struct.rawX}
                      y={struct.rawY}
                      width={struct.w}
                      height={struct.h}
                      viewBox="0 0 24 24"
                      color={struct.team === 'radiant' ? '#22c55e' : struct.team === 'dire' ? '#ef4444' : '#eab308'}
                      class="transition-all duration-100 hover:brightness-150 hover:scale-115 origin-center cursor-help z-0 [&_*]:pointer-events-none"
                      onmouseenter={() => showStructureTooltip(struct)}
                      role="img"
                      tabindex="0"
                    >
                      {@html struct.content}
                    </svg>
                  {/each}
                {/if}

                {#if !heatmapMode}
                  {#each visibleEvents as ev}
                    {@const svgX = (ev.x / 100) * 255}
                    {@const svgY = (ev.y / 100) * 255}
                    {@const isCursor = cursorTime !== null && Math.abs(ev.time - cursorTime) < 15}

                    {#if ev.type === 'death'}
                      <rect x={svgX - 3.5} y={svgY - 3.5} width="7" height="7" fill={ev.color} stroke={isCursor ? '#fff' : 'black'} stroke-width={isCursor ? 1.5 : 0.75} class="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-[1.5px] marker" onmouseenter={() => showTooltip(ev)} />
                    {:else if ev.type === 'rune'}
                      <polygon points="{svgX},{svgY - 4.5} {svgX + 4.5},{svgY} {svgX},{svgY + 4.5} {svgX - 4.5},{svgY}" fill={ev.color} stroke={isCursor ? '#fff' : 'black'} stroke-width={isCursor ? 1.5 : 0.75} class="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-[1.5px] marker" onmouseenter={() => showTooltip(ev)} />
                    {:else}
                      <circle cx={svgX} cy={svgY} r="4" fill={ev.color} stroke={isCursor ? '#fff' : 'black'} stroke-width={isCursor ? 1.5 : 0.75} class="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-[1.5px] marker" onmouseenter={() => showTooltip(ev)} />
                    {/if}
                  {/each}
                {/if}
              </svg>

              {#if tooltipEvent}
                <div class="absolute bg-s4 border border-bd2 text-tx p-[5px_8px] rounded shadow-lg text-xs pointer-events-none z-50 whitespace-nowrap -translate-x-1/2 flex items-center gap-1.5 font-sans animate-fade-in" style={tooltipStyle}>
                  {#if tooltipEvent.heroIcon}
                    <img src={tooltipEvent.heroIcon} class="w-4 h-4 rounded-full" alt="" />
                  {/if}
                  <div class="flex flex-col">
                    <span class="font-bold">{tooltipEvent.details}</span>
                    {#if tooltipEvent.landmark}
                      <span class="text-xxs text-tx2">{tooltipEvent.landmark}</span>
                    {/if}
                    {#if tooltipEvent.time > 0}
                      <span class="text-xxs text-tx2 font-mono">Time: {formatTime(tooltipEvent.time)}</span>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>

            <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
              <div class="flex flex-col gap-1">
                <div class="flex justify-between items-center text-xs text-zinc-400 font-semibold">
                  <div class="flex items-center gap-2">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-md border cursor-pointer transition-all {playbackPlaying
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-600'}"
                      onclick={togglePlayback}
                      title={playbackPlaying ? 'Pause (Space)' : 'Play (Space)'}
                    >
                      {#if playbackPlaying}
                        <svg viewBox="0 0 12 12" class="w-3 h-3 fill-current"><rect x="2" y="1" width="3" height="10" rx="0.5"/><rect x="7" y="1" width="3" height="10" rx="0.5"/></svg>
                      {:else}
                        <svg viewBox="0 0 12 12" class="w-3 h-3 fill-current"><polygon points="1.5,0 11.5,6 1.5,12"/></svg>
                      {/if}
                    </button>
                    <div class="flex gap-1">
                      {#each [2, 4, 8] as speed}
                        <button
                          class="text-[9px] font-bold border rounded px-1.5 py-0.5 cursor-pointer transition-all {playbackSpeed === speed
                            ? 'bg-zinc-800 border-zinc-700 text-white'
                            : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-500 hover:text-white hover:border-zinc-600'}"
                          onclick={() => { setPlaybackSpeed(speed); if (playbackPlaying) { stopPlayback(); startPlayback() } }}
                        >{formatSpeedLabel(speed)}</button>
                      {/each}
                    </div>
                  </div>
                  <span class="font-mono text-zinc-200 font-bold">{formatTime(timeSliderValue)} / {formatTime(matchDurationSeconds)}</span>
                </div>
                <input type="range" min="0" max={matchDurationSeconds} bind:value={timeSliderValue} oninput={onScrub} class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200" />
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1.5 text-xs font-semibold text-zinc-400 border-t border-zinc-800/60 pt-2.5">
                <label class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" bind:checked={showKills} class="rounded border-zinc-800 bg-zinc-950" /><span>🟢 Kills (+)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" bind:checked={showDeaths} class="rounded border-zinc-800 bg-zinc-950" /><span>🔴 Deaths (×)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" bind:checked={showObserverWards} class="rounded border-zinc-800 bg-zinc-950" /><span>🟡 Observers (★)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" bind:checked={showSentryWards} class="rounded border-zinc-800 bg-zinc-950" /><span>🔵 Sentries (✚)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" bind:checked={showRunes} class="rounded border-zinc-800 bg-zinc-950" /><span>🟣 Runes (♦)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" bind:checked={showStructures} class="rounded border-zinc-800 bg-zinc-950" /><span>🏰 Structures</span>
                </label>
              </div>
            </div>

            <!-- Vision summary (real counts only — no destroyed/lifetime/score) -->
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2">
                <div class="font-mono text-lg font-extrabold text-amber-400">{visionSummary.observers}</div>
                <div class="text-xxs text-zinc-500 uppercase tracking-wider">Observers</div>
              </div>
              <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2">
                <div class="font-mono text-lg font-extrabold text-sky-400">{visionSummary.sentries}</div>
                <div class="text-xxs text-zinc-500 uppercase tracking-wider">Sentries</div>
              </div>
              <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2">
                <div class="font-mono text-lg font-extrabold text-white">{visionSummary.total}</div>
                <div class="text-xxs text-zinc-500 uppercase tracking-wider">Total Wards</div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div class="text-xs font-bold text-zinc-400 uppercase tracking-[0.5px]">Farm distribution report</div>
            <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <span class="text-sm text-zinc-400 leading-relaxed">
                {expectedFarmNote(focusedPlayer.position)}
              </span>
              <div class="flex flex-col gap-2.5 mt-2">
                {#each farmDistributionList as farm, idx}
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between text-sm font-bold">
                      <span class="text-zinc-200">{farm.name}</span>
                      <span class="text-zinc-400">{farm.count} creeps ({farm.percent}%)</span>
                    </div>
                    <div class="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-300" class:bg-amber-400={idx === 0} class:bg-zinc-700={idx > 0} style="width: {farm.percent}%"></div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <div class="text-xs font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Recent Events</div>
            <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-2 max-h-[260px] overflow-y-auto flex flex-col gap-1">
              {#each visibleEvents.slice(-14).reverse() as ev}
                <button
                  class="flex items-center justify-between gap-2 text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors text-sm"
                  onmouseenter={() => (cursorTime = ev.time)}
                >
                  <span class="flex items-center gap-2 min-w-0">
                    <span class="w-4 text-center shrink-0" style="color:{ev.color}">{ev.char}</span>
                    <span class="text-zinc-300 truncate">{ev.details}</span>
                  </span>
                  <span class="font-mono text-zinc-500 shrink-0">{formatTime(ev.time)}</span>
                </button>
              {:else}
                <div class="text-center text-zinc-600 text-sm py-4">No events in range yet.</div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {:else if activeSubTab === 'economy'}
      <div class="p-5 flex flex-col gap-5">
        <div class="flex flex-wrap gap-2">
          {#each Object.entries(metricConfig) as [key, cfg]}
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all {selectedMetric === key
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'}"
              onclick={() => (selectedMetric = key as EconomyMetric)}
            >
              {cfg.label}
            </button>
          {/each}
        </div>

        <div class="flex gap-4 items-stretch">
          <!-- Interactive chart card -->
          <div class="relative flex-1 border border-zinc-800/60 rounded-xl bg-zinc-950/60 p-4 shadow-sm overflow-visible">
            <div class="flex items-center justify-between text-sm font-bold text-zinc-400 mb-2">
              <span>{metricConfig[selectedMetric].label} Over Time</span>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-emerald-400">🟢 You ({heroInfo?.localized_name}): {focusSeries.at(-1)?.toLocaleString() ?? 0}{metricConfig[selectedMetric].unit}</span>
                {#if enemyMirrorPlayer && enemyMirrorHero}
                  <span class="text-rose-500">🔴 {enemyMirrorRoleLabel} ({enemyMirrorHero.localized_name}): {enemySeries.at(-1)?.toLocaleString() ?? 0}{metricConfig[selectedMetric].unit}</span>
                {/if}
              </div>
            </div>

            <svg
              viewBox="0 0 500 120"
              class="w-full h-auto mt-2 overflow-visible cursor-crosshair"
              onmousemove={(e) => chartHover(e, e.currentTarget as SVGSVGElement, focusSeries)}
              onmouseleave={chartLeave}
            >
              <defs>
                <linearGradient id="metricgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color={metricConfig[selectedMetric].color} stop-opacity=".22" />
                  <stop offset="100%" stop-color={metricConfig[selectedMetric].color} stop-opacity="0" />
                </linearGradient>
                {#each heroMarkerIndices as _, i}
                  <clipPath id={`hero-clip-${i}`}><circle cx="0" cy="0" r="6.5" /></clipPath>
                {/each}
              </defs>

              <line x1="30" y1="10" x2="480" y2="10" stroke="rgba(255,255,255,.03)" stroke-width="1" />
              <line x1="30" y1="55" x2="480" y2="55" stroke="rgba(255,255,255,.05)" stroke-width="1" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,.1)" stroke-width="1" />

              <text x="5" y="14" fill="#4A5270" font-size="8" font-family="monospace">{Math.round(chartMax).toLocaleString()}</text>
              <text x="5" y="58" fill="#4A5270" font-size="8" font-family="monospace">{Math.round(chartMax / 2).toLocaleString()}</text>
              <text x="5" y="103" fill="#4A5270" font-size="8" font-family="monospace">0</text>

              {#if focusChartPaths.line}
                <path d={focusChartPaths.area} fill="url(#metricgrad)" />
                <path d={focusChartPaths.line} fill="none" stroke={metricConfig[selectedMetric].color} stroke-width="2" />
              {/if}
              {#if enemyChartPaths.line}
                <path d={enemyChartPaths.line} fill="none" stroke="var(--color-rd)" stroke-width="1.5" stroke-dasharray="3,3" />
              {/if}

              <!-- Hero-portrait markers sampled along the focus line -->
              {#if heroInfo}
                {#each heroMarkerIndices as idx, i}
                  {@const mx = 30 + (idx / Math.max(1, focusSeries.length - 1)) * 450}
                  {@const my = 100 - ((focusSeries[idx] ?? 0) / Math.max(1, chartMax)) * 90}
                  <g transform="translate({mx},{my})" class="pointer-events-none">
                    <circle r="7.5" fill="black" opacity="0.5" />
                    <image
                      href={getHeroImgUrl(heroInfo.icon)}
                      x="-6.5"
                      y="-6.5"
                      width="13"
                      height="13"
                      clip-path={`url(#hero-clip-${i})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <circle r="6.5" fill="none" stroke={metricConfig[selectedMetric].color} stroke-width="1" />
                  </g>
                {/each}
              {/if}

              {#if selectedMetric === 'networth' && focusSeries.length > 0}
                {#each itemChartMarkers as marker}
                  {@const ix = 30 + (marker.minuteIdx / Math.max(1, focusSeries.length - 1)) * 450}
                  <line x1={ix} y1="5" x2={ix} y2="105" stroke="var(--color-pu2)" stroke-opacity="0.08" stroke-width="0.5" stroke-dasharray="2,2" />
                  <image href={marker.imgUrl} x={ix - 3.5} y="0" width="7" height="5" preserveAspectRatio="xMidYMid meet" class="pointer-events-none" />
                {/each}
              {/if}

              {#if hoverIdx !== null}
                <line x1={hoverCx} y1="5" x2={hoverCx} y2="105" stroke="#fff" stroke-opacity="0.25" stroke-width="1" />
                <circle cx={hoverCx} cy={hoverCy} r="4.5" fill="black" />
                <circle cx={hoverCx} cy={hoverCy} r="4.5" fill="none" stroke={metricConfig[selectedMetric].color} stroke-width="2" />
                <circle cx={hoverCx} cy={hoverCy} r="1.6" fill="#fff" />
              {/if}

              <text x="30" y="115" fill="#4A5270" font-size="7.5" text-anchor="middle">0:00</text>
              <text x="255" y="115" fill="#4A5270" font-size="7.5" text-anchor="middle">{formatTime(Math.round((focusSeries.length / 2) * 60))}</text>
              <text x="480" y="115" fill="#4A5270" font-size="7.5" text-anchor="middle">{formatTime(focusSeries.length * 60)}</text>
            </svg>

            <!-- Floating tooltip card, positioned from the same viewBox coords as the dot -->
            {#if hoverIdx !== null && hoverValue !== null}
              {@const leftPct = (hoverCx / 500) * 100}
              {@const topPct = (hoverCy / 120) * 100}
              <div
                class="absolute z-30 pointer-events-none bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl px-3.5 py-3 min-w-[168px] -translate-x-1/2 animate-fade-in"
                style="left: {leftPct}%; top: {Math.max(topPct - 6, 4)}%; transform: translate(-50%, -100%);"
              >
                <div class="text-sm font-extrabold text-white mb-2">
                  {metricConfig[selectedMetric].label} @ {formatTime(hoverIdx * 60)}
                </div>
                <div class="flex flex-col gap-1.5 text-xs">
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-zinc-400">Value</span>
                    <span class="font-mono font-bold" style="color:{metricConfig[selectedMetric].color}">
                      {hoverValue.toLocaleString()}{metricConfig[selectedMetric].unit}
                    </span>
                  </div>
                  {#if hoverDelta !== null}
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-zinc-400">Δ this minute</span>
                      <span class="font-mono font-bold {hoverDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}">{hoverDelta >= 0 ? '+' : ''}{hoverDelta.toLocaleString()}</span>
                    </div>
                  {/if}
                  <div class="flex items-center justify-between gap-4 border-t border-zinc-800/60 pt-1.5 mt-0.5">
                    <span class="text-zinc-400 flex items-center gap-1">🟢 Kills so far</span>
                    <span class="font-mono font-bold text-emerald-400">{hoverKills}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-zinc-400 flex items-center gap-1">🔴 Deaths so far</span>
                    <span class="font-mono font-bold text-rose-400">{hoverDeaths}</span>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Side gauge: hero level ring, honest to real data -->
          <div class="hidden sm:flex flex-col items-center justify-center gap-1.5 w-[92px] shrink-0 border border-zinc-800/60 rounded-xl bg-zinc-950/60 p-3 shadow-sm">
            <div class="relative w-14 h-14">
              <svg viewBox="0 0 56 56" class="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="var(--color-gr)"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-dasharray={2 * Math.PI * 24}
                  stroke-dashoffset={2 * Math.PI * 24 * (1 - levelRingFraction)}
                  class="transition-all duration-500"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                {#if heroInfo}
                  <img src={getHeroImgUrl(heroInfo.icon)} alt="" class="w-8 h-8 rounded-full object-cover border border-zinc-800" />
                {/if}
              </div>
            </div>
            <div class="font-mono text-sm font-extrabold text-white leading-none">{focusedPlayer.level}</div>
            <div class="text-xxs text-zinc-500 uppercase tracking-wider">Level</div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3.5 shadow-sm">
            <div class="text-[9.5px] text-zinc-500 font-extrabold uppercase tracking-wider mb-1">GPM / XPM</div>
            <div class="font-mono text-[16px] font-extrabold text-white">{focusedPlayer.goldPerMinute} / {focusedPlayer.experiencePerMinute}</div>
          </div>
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3.5 shadow-sm">
            <div class="text-[9.5px] text-zinc-500 font-extrabold uppercase tracking-wider mb-1">Net Worth Lead</div>
            <div class="font-mono text-[16px] font-extrabold {networthLead >= 0 ? 'text-emerald-400' : 'text-rose-500'}">{networthLead >= 0 ? '+' : ''}{networthLead.toLocaleString()}g</div>
          </div>
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3.5 shadow-sm">
            <div class="text-[9.5px] text-zinc-500 font-extrabold uppercase tracking-wider mb-1">Alive GPM / Dead</div>
            <div class="font-mono text-[16px] font-extrabold">
              <span class="text-emerald-400">{aliveEfficiency.aliveGPM}</span>
              <span class="text-zinc-600 text-sm"> / </span>
              <span class="text-rose-400">{aliveEfficiency.deadSeconds > 0 ? '−' + Math.round(aliveEfficiency.deadSeconds / 60) + 'm' : '0m'}</span>
            </div>
          </div>
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3.5 shadow-sm">
            <div class="text-[9.5px] text-zinc-500 font-extrabold uppercase tracking-wider mb-1">KDA Ratio</div>
            <div class="font-mono text-[16px] font-extrabold text-white">{kdaText}</div>
          </div>
        </div>
      </div>
    {:else if activeSubTab === 'combat'}
      <div class="p-5 flex flex-col gap-5">
        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px]">Kill / Death Feed</div>
        <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-2 flex flex-col gap-1">
          {#each combatFeed as ev}
            <button
              class="flex items-center justify-between gap-3 text-left px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors border-l-2"
              style="border-color:{ev.color}"
              onmouseenter={() => (cursorTime = ev.time)}
            >
              <span class="flex items-center gap-2.5 min-w-0">
                <span class="text-[15px]" style="color:{ev.color}">{ev.char}</span>
                <span class="flex flex-col min-w-0">
                  <span class="text-[12px] font-bold text-zinc-200">{ev.details}</span>
                  <span class="text-[10px] text-zinc-500 truncate">{ev.landmark}</span>
                </span>
              </span>
              <span class="font-mono text-[11px] text-zinc-400 shrink-0">{formatTime(ev.time)}</span>
            </button>
          {:else}
            <div class="text-center text-zinc-600 text-[11px] py-6">No kill or death events recorded.</div>
          {/each}
        </div>

        {#if deathClusters.length > 0}
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Death Clusters</div>
          <div class="flex flex-col gap-2">
            {#each deathClusters as cluster}
              <div class="flex items-center justify-between gap-3 bg-zinc-950/60 border border-rose-500/20 rounded-lg px-3.5 py-2.5">
                <span class="text-xs text-zinc-300">
                  <span class="font-extrabold text-rose-400">{cluster.count}×</span> {cluster.landmark}
                </span>
                <span class="font-mono text-xxs text-zinc-500">{cluster.times.map((t) => formatTime(t)).join(', ')}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if focusedPlayer.stats.deathEvents && focusedPlayer.stats.deathEvents.length > 0}
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Death Timeline</div>
          <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 shadow-sm">
            <div class="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Match duration with alive (green) and dead (red) segments. Each death pauses farm for ~respawn + return travel.
            </div>
            <svg viewBox="0 0 500 32" class="w-full h-auto">
              <rect x="0" y="12" width="500" height="8" rx="4" fill="var(--color-gr)" fill-opacity="0.25" />
              {#each focusedPlayer.stats.deathEvents as death, idx}
                {@const startPct = (death.time / matchDurationSeconds) * 500}
                {@const respawnSec = Math.min(100, 10 + death.time / 30)}
                {@const endPct = Math.min(500, ((death.time + respawnSec) / matchDurationSeconds) * 500)}
                {@const width = Math.max(3, endPct - startPct)}
                <rect x={startPct} y="12" width={width} height="8" rx="2" fill="var(--color-rd)" fill-opacity="0.8" class="cursor-help hover:fill-opacity-100 transition-opacity">
                  <title>Death #{idx + 1} at {formatTime(death.time)} — respawn {Math.round(respawnSec)}s</title>
                </rect>
              {/each}
              <text x="2" y="30" fill="var(--color-tx3)" font-size="7" font-family="monospace">0:00</text>
              <text x="250" y="30" fill="var(--color-tx3)" font-size="7" font-family="monospace" text-anchor="middle">{formatTime(Math.round(matchDurationSeconds / 2))}</text>
              <text x="498" y="30" fill="var(--color-tx3)" font-size="7" font-family="monospace" text-anchor="end">{formatTime(matchDurationSeconds)}</text>
            </svg>
          </div>
        {/if}

        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px] mt-2">Farming downtime (Deaths log)</div>
        <div class="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
          <div class="text-[11.5px] text-zinc-400 leading-relaxed mb-1">
            Deaths are the biggest set-back for carries. You lose reliable gold, feed enemies, and stop accumulating Net Worth. Gold-lost figures below are a rough <span class="italic">estimate</span> based on typical respawn timers, not a value logged by the match itself.
          </div>
          {#if focusedPlayer.stats.deathEvents && focusedPlayer.stats.deathEvents.length > 0}
            <div class="flex flex-col gap-2">
              {#each focusedPlayer.stats.deathEvents as death, idx}
                {@const respawnSec = Math.min(100, 10 + death.time / 30)}
                <div class="flex items-center justify-between text-[11.5px] p-2.5 px-3.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span class="font-mono text-zinc-400">Death #{idx + 1} at {formatTime(death.time)}</span>
                  <span class="text-rose-400 font-bold">Est. farm lost: ~{Math.round(respawnSec * 10).toLocaleString()} gold ({Math.round(respawnSec)}s dead)</span>
                </div>
              {/each}
            </div>
          {:else}
            <div class="p-4 text-center text-emerald-400 font-bold bg-emerald-950/15 border border-emerald-500/20 rounded-xl">
              Outstanding! Zero deaths logged. You maintained maximum farming efficiency.
            </div>
          {/if}
        </div>
      </div>
    {:else if activeSubTab === 'timeline'}
      <div class="p-5 flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5px]">Match Timeline</div>
          <div class="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-semibold text-zinc-400">
            <label class="flex items-center gap-1.5 cursor-pointer hover:text-white"><input type="checkbox" bind:checked={tlShowKills} class="rounded border-zinc-800 bg-zinc-950" />🟢 Kills</label>
            <label class="flex items-center gap-1.5 cursor-pointer hover:text-white"><input type="checkbox" bind:checked={tlShowDeaths} class="rounded border-zinc-800 bg-zinc-950" />🔴 Deaths</label>
            <label class="flex items-center gap-1.5 cursor-pointer hover:text-white"><input type="checkbox" bind:checked={tlShowWards} class="rounded border-zinc-800 bg-zinc-950" />🟡 Wards</label>
            <label class="flex items-center gap-1.5 cursor-pointer hover:text-white"><input type="checkbox" bind:checked={tlShowRunes} class="rounded border-zinc-800 bg-zinc-950" />🟣 Runes</label>
            <label class="flex items-center gap-1.5 cursor-pointer hover:text-white"><input type="checkbox" bind:checked={tlShowItems} class="rounded border-zinc-800 bg-zinc-950" />🛒 Items ≥500g</label>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          {#each timelinePhaseGroups as group}
            <div class="flex flex-col">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.5px]">{group.label}</span>
                <span class="text-[9px] font-mono text-zinc-600">{group.rangeLabel}</span>
                <span class="text-[9px] text-zinc-600">· {group.entries.length} events</span>
              </div>
              <div class="relative pl-5">
                <div class="absolute left-[7px] top-1 bottom-1 w-px bg-zinc-800"></div>
                {#each group.entries as entry}
                  <button
                    class="relative flex items-start gap-3 py-1.5 text-left group"
                    onmouseenter={() => (cursorTime = entry.time)}
                  >
                    <span class="absolute -left-5 top-2.5 w-2.5 h-2.5 rounded-full border-2 border-black shrink-0" style="background:{entry.color}"></span>
                    <span class="font-mono text-[10.5px] text-zinc-500 w-12 shrink-0 pt-0.5">{formatTime(entry.time)}</span>
                    <span class="flex flex-col min-w-0 group-hover:translate-x-0.5 transition-transform">
                      <span class="text-[12px] font-bold text-zinc-200">{entry.icon} {entry.label}</span>
                      {#if entry.sub}
                        <span class="text-[10px] text-zinc-500 truncate">{entry.sub}</span>
                      {/if}
                    </span>
                  </button>
                {:else}
                  <div class="text-center text-zinc-600 text-[11px] py-3">No events in this phase.</div>
                {/each}
              </div>
            </div>
          {:else}
            <div class="text-center text-zinc-600 text-[11px] py-8">No events match the current filters.</div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :root {
    --color-gr: #22c55e;
    --color-rd: #ef4444;
    --color-bl: #3b82f6;
    --color-gd: #eab308;
    --color-pu: #a855f7;
  }

  .marker {
    transition: opacity 0.25s ease-in-out, transform 0.2s ease;
  }

  input[type='range']::-webkit-slider-thumb {
    height: 10px;
    width: 10px;
    border-radius: 9999px;
    background: var(--color-pu);
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -3px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 5px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  .animate-fade-in {
    animation: fadeIn 0.15s ease-out forwards;
  }
</style>
