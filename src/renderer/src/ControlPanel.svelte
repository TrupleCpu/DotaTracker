<script lang="ts">
  import { onMount } from 'svelte'
  import heroesDataRaw from '../../main/data/heroes.json'
  import itemsDataRaw from '../../main/data/items.json'

  // --- TYPE SCHEMAS ---
  interface Hero {
    id: number
    localized_name: string
    img: string
  }

  interface DotaItem {
    id: number
    name: string
    localized_name: string
    img?: string
  }

  interface OpenDotaMatch {
    match_id: number
    player_slot: number
    radiant_win: boolean
    duration: number
    hero_id: number
    kills: number
    deaths: number
    assists: number
  }

  interface BenchmarkValue {
    raw: number
    pct: number
  }

  interface MatchPlayerPerf {
    player_slot: number
    hero_id: number
    personaname: string
    kills: number
    deaths: number
    assists: number
    gold_per_min: number
    xp_per_min: number
    hero_damage: number
    tower_damage: number
    net_worth?: number
    level?: number
    item_0?: number
    item_1?: number
    item_2?: number
    item_3?: number
    item_4?: number
    item_5?: number
    item_neutral?: number
    benchmarks?: {
      gold_per_min?: BenchmarkValue
      xp_per_min?: BenchmarkValue
      hero_damage_per_min?: BenchmarkValue
      last_hits_per_min?: BenchmarkValue
    }
  }

  interface DetailedMatchData {
    match_id: number
    radiant_win: boolean
    duration: number
    radiant_score: number
    dire_score: number
    players: MatchPlayerPerf[]
  }

  const heroesData = heroesDataRaw as Hero[]

  // Normalizing items data map from array or dictionary structures safely
  let itemsData: Record<string, DotaItem> = {}
  if (Array.isArray(itemsDataRaw)) {
    itemsDataRaw.forEach((item: DotaItem) => {
      itemsData[item.id.toString()] = item
    })
  } else {
    Object.values(itemsDataRaw as Record<string, DotaItem>).forEach((item) => {
      if (item && item.id) {
        itemsData[item.id.toString()] = item
      }
    })
  }

  // --- COMPONENT STATE ---
  let steamId: string | null = null
  let isLoading: boolean = false
  let isDetailsLoading: boolean = false
  let errorMessage: string = ''

  let matchHistory: OpenDotaMatch[] | null = null
  let isOverlayEnabled: boolean = true

  // Drill-down Detail State Engine
  let selectedMatch: DetailedMatchData | null = null
  let focusedPlayer: MatchPlayerPerf | null = null

  const heroMap = new Map<number, Hero>()

  async function toggleOverlay(): Promise<void> {
    isOverlayEnabled = !isOverlayEnabled
    isOverlayEnabled = await window.api.setOverlayState(isOverlayEnabled)
  }

  onMount(async () => {
    heroesData.forEach((hero) => heroMap.set(hero.id, hero))

    try {
      const activeConfig = await window.api.getConfig()
      isOverlayEnabled = activeConfig?.overlayEnabled ?? (await window.api.getOverlayStatus())
    } catch (err) {
      console.error('State sync regression:', err)
    }

    window.api.onOverlayStatus((visible: boolean) => {
      isOverlayEnabled = visible
    })
  })

  async function handleSteamLogin(): Promise<void> {
    try {
      isLoading = true
      errorMessage = ''
      const response = await window.api.getLocalSteamId()

      if (response.steamId) {
        steamId = response.steamId
        await fetchHistory()
      } else {
        errorMessage = response.error || 'Active Steam profile not found.'
      }
    } catch (err) {
      errorMessage = 'An unexpected error occurred during profile sync.'
    } finally {
      isLoading = false
    }
  }

  async function fetchHistory(): Promise<void> {
    if (!steamId) return
    const result = await window.api.fetchMatchHistory(steamId)
    if (result && !('error' in (result as any))) {
      matchHistory = result as OpenDotaMatch[]
    } else {
      errorMessage = (result as any)?.error || 'Failed to retrieve history.'
    }
  }

  async function inspectMatchDetails(matchId: number): Promise<void> {
    try {
      isDetailsLoading = true
      errorMessage = ''
      focusedPlayer = null // Wipe any stale data panel states
      const result = await window.api.fetchMatchDetails(matchId)

      if (result && !('error' in (result as any))) {
        selectedMatch = result as DetailedMatchData
      } else {
        errorMessage = (result as any)?.error || 'Failed to resolve match breakdown metrics.'
      }
    } catch (err) {
      errorMessage = 'Could not load match data structures.'
    } finally {
      isDetailsLoading = false
    }
  }

  function getHeroData(heroId: number): Hero {
    return heroMap.get(heroId) || { id: heroId, localized_name: `Hero ${heroId}`, img: '' }
  }

  function getHeroImageUrl(imgRelativePath: string): string {
    if (!imgRelativePath)
      return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/unknown.png'
    const cleanPath = imgRelativePath.endsWith('?') ? imgRelativePath.slice(0, -1) : imgRelativePath
    return `https://cdn.cloudflare.steamstatic.com${cleanPath}`
  }

  function getItemImageUrl(itemId: number | undefined): string {
    // Inline asset stub injection for empty slots to preserve structural layouts without round-trips
    if (!itemId) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="30" viewBox="0 0 42 30"><rect width="42" height="30" fill="%2314151f"/></svg>'
    }

    const matchedItem = itemsData[itemId.toString()]

    if (matchedItem?.img) {
      if (matchedItem.img.startsWith('http')) return matchedItem.img
      const cleanImgPath = matchedItem.img.startsWith('/') ? matchedItem.img : `/${matchedItem.img}`
      return `https://cdn.cloudflare.steamstatic.com${cleanImgPath}`
    }

    if (matchedItem?.name) {
      const cleanName = matchedItem.name.replace('item_', '')
      return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${cleanName}.png`
    }

    return 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/unknown.png'
  }

  function isVictory(playerSlot: number, radiantWin: boolean): boolean {
    return playerSlot < 128 === radiantWin
  }

  function formatDuration(seconds: number): string {
    if (!seconds) return '0:00'
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  function handleSelectPlayer(player: MatchPlayerPerf) {
    focusedPlayer = player
  }
</script>

{#if !steamId}
  <div class="login-screen">
    <div class="login-card">
      <div class="logo-area"><span class="logo-accent">DOTA 2</span> TRACKER</div>
      <p class="subtitle">Sync your local client instance to audit real-time statistics.</p>

      <button on:click={handleSteamLogin} disabled={isLoading} class="steam-sync-btn">
        {#if isLoading}
          <div class="spinner"></div>
          <span>READING LOCAL CONFIGS...</span>
        {:else}
          <img
            src="https://community.akamai.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
            alt="Sign In"
          />
        {/if}
      </button>

      {#if errorMessage}<div class="error-banner">{errorMessage}</div>{/if}
    </div>
  </div>
{:else}
  <div class="dashboard-layout">
    <header class="navbar">
      <div class="profile-meta">
        <div class="status-indicator"></div>
        <span>Syncing Account: <code class="uid">{steamId}</code></span>
      </div>
      <div class="nav-actions">
        <button
          on:click={toggleOverlay}
          class="toggle-btn {isOverlayEnabled ? 'active' : 'inactive'}"
        >
          {isOverlayEnabled ? 'Overlay ON' : 'Overlay OFF'}
        </button>
        <button
          on:click={() => {
            steamId = null
            matchHistory = null
            selectedMatch = null
            focusedPlayer = null
            errorMessage = ''
          }}
          class="nav-disconnect-btn"
        >
          Disconnect Account
        </button>
      </div>
    </header>

    <main class="content-body">
      {#if errorMessage}
        <div class="error-banner" style="margin-bottom: 15px;">{errorMessage}</div>
      {/if}

      {#if selectedMatch}
        <div class="detail-view-container">
          <button
            class="back-btn"
            on:click={() => {
              selectedMatch = null
              focusedPlayer = null
            }}>← Return to Match History</button
          >

          <div class="match-meta-header card">
            <div
              class="outcome-banner {selectedMatch.radiant_win
                ? 'radiant-victory'
                : 'dire-victory'}"
            >
              <h4>{selectedMatch.radiant_win ? 'RADIANT VICTORY' : 'DIRE VICTORY'}</h4>
              <span class="match-id-stamp"
                >ID: {selectedMatch.match_id} • Duration: {formatDuration(
                  selectedMatch.duration
                )}</span
              >
            </div>
            <div class="score-board">
              <span class="score green">{selectedMatch.radiant_score ?? 0}</span>
              <span class="vs-divider">VS</span>
              <span class="score red">{selectedMatch.dire_score ?? 0}</span>
            </div>
          </div>

          <div class="workspace-grid">
            <div class="teams-pane">
              <h4 class="team-header green-text">Radiant Team</h4>
              <div class="stats-grid-table card">
                {#each selectedMatch.players.filter((p) => p.player_slot < 128) as player}
                  {@const hero = getHeroData(player.hero_id)}
                  <div
                    class="grid-player-row interactive-row {focusedPlayer?.player_slot ===
                    player.player_slot
                      ? 'row-focused'
                      : ''}"
                    on:click={() => handleSelectPlayer(player)}
                  >
                    <img
                      src={getHeroImageUrl(hero.img)}
                      alt={hero.localized_name}
                      class="mini-portrait"
                    />
                    <span class="player-name">{player.personaname || 'Anonymous'}</span>
                    <span class="kda-text">{player.kills}/{player.deaths}/{player.assists}</span>
                    <span class="economy-text"><small>GPM:</small> {player.gold_per_min}</span>
                    <span class="dmg-text"
                      ><small>DMG:</small> {(player.hero_damage / 1000).toFixed(1)}k</span
                    >
                  </div>
                {/each}
              </div>

              <h4 class="team-header red-text">Dire Team</h4>
              <div class="stats-grid-table card">
                {#each selectedMatch.players.filter((p) => p.player_slot >= 128) as player}
                  {@const hero = getHeroData(player.hero_id)}
                  <div
                    class="grid-player-row interactive-row {focusedPlayer?.player_slot ===
                    player.player_slot
                      ? 'row-focused'
                      : ''}"
                    on:click={() => handleSelectPlayer(player)}
                  >
                    <img
                      src={getHeroImageUrl(hero.img)}
                      alt={hero.localized_name}
                      class="mini-portrait"
                    />
                    <span class="player-name">{player.personaname || 'Anonymous'}</span>
                    <span class="kda-text">{player.kills}/{player.deaths}/{player.assists}</span>
                    <span class="economy-text"><small>GPM:</small> {player.gold_per_min}</span>
                    <span class="dmg-text"
                      ><small>DMG:</small> {(player.hero_damage / 1000).toFixed(1)}k</span
                    >
                  </div>
                {/each}
              </div>
            </div>

            <div class="focused-inspect-pane">
              {#if focusedPlayer}
                {@const hero = getHeroData(focusedPlayer.hero_id)}
                <div class="inspect-sticky-card card animate-fade">
                  <div class="inspect-hero-banner">
                    <img
                      src={getHeroImageUrl(hero.img)}
                      alt={hero.localized_name}
                      class="inspect-large-portrait"
                    />
                    <div class="inspect-hero-meta">
                      <h3>{hero.localized_name}</h3>
                      <p>
                        {focusedPlayer.personaname || 'Anonymous Player'} • Level {focusedPlayer.level ||
                          '?'}
                      </p>
                    </div>
                  </div>

                  <div class="inspect-content">
                    <div class="metric-group-title">INVENTORY CONFIGURATION</div>
                    <div class="items-grid-wrapper">
                      <div class="main-items-grid">
                        <img
                          src={getItemImageUrl(focusedPlayer.item_0)}
                          alt="Item Slot 0"
                          class="item-socket"
                        />
                        <img
                          src={getItemImageUrl(focusedPlayer.item_1)}
                          alt="Item Slot 1"
                          class="item-socket"
                        />
                        <img
                          src={getItemImageUrl(focusedPlayer.item_2)}
                          alt="Item Slot 2"
                          class="item-socket"
                        />
                        <img
                          src={getItemImageUrl(focusedPlayer.item_3)}
                          alt="Item Slot 3"
                          class="item-socket"
                        />
                        <img
                          src={getItemImageUrl(focusedPlayer.item_4)}
                          alt="Item Slot 4"
                          class="item-socket"
                        />
                        <img
                          src={getItemImageUrl(focusedPlayer.item_5)}
                          alt="Item Slot 5"
                          class="item-socket"
                        />
                      </div>
                      <div class="neutral-socket-container">
                        <small>NEUTRAL</small>
                        <img
                          src={getItemImageUrl(focusedPlayer.item_neutral)}
                          alt="Neutral Asset"
                          class="item-socket neutral"
                        />
                      </div>
                    </div>

                    <div class="metric-group-title" style="margin-top: 24px;">
                      PERFORMANCE PERCENTILES
                    </div>
                    <div class="benchmarks-container">
                      {#if focusedPlayer.benchmarks}
                        <div class="benchmark-bar-row">
                          <div class="benchmark-label">
                            <span>Gold / Min</span>
                            <span class="raw-val">{focusedPlayer.gold_per_min}</span>
                          </div>
                          <div class="progress-track">
                            <div
                              class="progress-fill emerald"
                              style="width: {(focusedPlayer.benchmarks.gold_per_min?.pct ?? 0) *
                                100}%"
                            ></div>
                          </div>
                          <span class="pct-marker"
                            >{Math.round(
                              (focusedPlayer.benchmarks.gold_per_min?.pct ?? 0) * 100
                            )}%</span
                          >
                        </div>

                        <div class="benchmark-bar-row">
                          <div class="benchmark-label">
                            <span>XP / Min</span>
                            <span class="raw-val">{focusedPlayer.xp_per_min}</span>
                          </div>
                          <div class="progress-track">
                            <div
                              class="progress-fill emerald"
                              style="width: {(focusedPlayer.benchmarks.xp_per_min?.pct ?? 0) *
                                100}%"
                            ></div>
                          </div>
                          <span class="pct-marker"
                            >{Math.round(
                              (focusedPlayer.benchmarks.xp_per_min?.pct ?? 0) * 100
                            )}%</span
                          >
                        </div>

                        <div class="benchmark-bar-row">
                          <div class="benchmark-label">
                            <span>Damage / Min</span>
                            <span class="raw-val"
                              >{Math.round(
                                focusedPlayer.hero_damage / (selectedMatch.duration / 60)
                              )}</span
                            >
                          </div>
                          <div class="progress-track">
                            <div
                              class="progress-fill"
                              style="width: {(focusedPlayer.benchmarks.hero_damage_per_min?.pct ??
                                0) * 100}%"
                            ></div>
                          </div>
                          <span class="pct-marker"
                            >{Math.round(
                              (focusedPlayer.benchmarks.hero_damage_per_min?.pct ?? 0) * 100
                            )}%</span
                          >
                        </div>
                      {:else}
                        <p class="fallback-note">
                          Historical data benchmarks are unavailable for this match parse.
                        </p>
                      {/if}
                    </div>

                    <div class="sub-stats-layout">
                      <div class="stat-box">
                        <small>NET WORTH</small>
                        <span>${focusedPlayer.net_worth?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div class="stat-box">
                        <small>TOWER DMG</small>
                        <span>{focusedPlayer.tower_damage?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              {:else}
                <div class="inspect-placeholder card">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg
                  >
                  <p>
                    Select any player row from either faction to inspect builds, execution
                    percentiles, and telemetry.
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {:else if isDetailsLoading}
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Analyzing parsing matrices and timelines via OpenDota...</p>
        </div>
      {:else if matchHistory}
        <div class="section-header">
          <h3>Recent Match Performance</h3>
          <span class="source-tag">Live Engine Connection verified</span>
        </div>

        <div class="dotabuff-table">
          <div class="table-header-row">
            <div class="col-hero">HERO</div>
            <div class="col-result">RESULT</div>
            <div class="col-duration">DURATION</div>
            <div class="col-kda">KDA</div>
            <div class="col-action">ANALYTICS</div>
          </div>

          <div class="table-body">
            {#each matchHistory as match (match.match_id)}
              {@const hero = getHeroData(match.hero_id)}
              {@const won = isVictory(match.player_slot, match.radiant_win)}
              <div class="dotabuff-row {won ? 'row-win' : 'row-loss'}">
                <div class="col-hero hero-cell">
                  <img
                    src={getHeroImageUrl(hero.img)}
                    alt={hero.localized_name}
                    class="hero-portrait"
                  />
                  <span class="hero-name">{hero.localized_name}</span>
                </div>
                <div class="col-result">
                  <span class="outcome-badge {won ? 'text-win' : 'text-loss'}"
                    >{won ? 'Won Match' : 'Lost Match'}</span
                  >
                </div>
                <div class="col-duration duration-text">{formatDuration(match.duration)}</div>
                <div class="col-kda kda-block">
                  <div class="kda-values">
                    <span class="k">{match.kills}</span>/<span class="d">{match.deaths}</span>/<span
                      class="a">{match.assists}</span
                    >
                  </div>
                </div>
                <div class="col-action">
                  <button class="inspect-btn" on:click={() => inspectMatchDetails(match.match_id)}
                    >View Analysis</button
                  >
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Compiling historical match indices...</p>
        </div>
      {/if}
    </main>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    background: #0f1015;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* --- LOGIN SYSTEM LAYOUT --- */
  .login-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: radial-gradient(circle at center, #1b1c24 0%, #0f1015 100%);
    padding: 20px;
    box-sizing: border-box;
  }
  .login-card {
    text-align: center;
    background: #15161e;
    padding: 40px 30px;
    border-radius: 12px;
    border: 1px solid #262837;
    max-width: 360px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  .logo-area {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #ffffff;
    margin-bottom: 10px;
  }
  .logo-accent {
    color: #10b981;
  }
  .subtitle {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 30px;
  }
  .steam-sync-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition:
      transform 0.2s,
      opacity 0.2s;
  }
  .steam-sync-btn:hover {
    transform: scale(1.02);
  }
  .steam-sync-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-banner {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    color: #fca5a5;
    padding: 10px;
    border-radius: 6px;
    font-size: 12px;
    text-align: center;
  }

  /* --- DASHBOARD SYSTEM HOOKS --- */
  .dashboard-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #14151f;
    color: #e2e8f0;
  }
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1c1e2d;
    padding: 12px 20px;
    border-bottom: 1px solid #2a2d42;
  }
  .profile-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #94a3b8;
  }
  .status-indicator {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
  }
  .uid {
    background: #0f1015;
    padding: 3px 6px;
    border-radius: 4px;
    color: #a7f3d0;
    font-family: monospace;
  }
  .nav-actions {
    display: flex;
    gap: 10px;
  }

  .toggle-btn {
    border: none;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .toggle-btn.active {
    background: #10b981;
    color: #0f1015;
  }
  .toggle-btn.inactive {
    background: #475569;
    color: #e2e8f0;
  }

  .nav-disconnect-btn {
    background: #2d3149;
    color: #94a3b8;
    border: none;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
  }
  .nav-disconnect-btn:hover {
    background: #ef4444;
    color: #ffffff;
  }

  .content-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    box-sizing: border-box;
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .section-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
  }
  .source-tag {
    font-size: 11px;
    color: #64748b;
    background: #1e293b;
    padding: 2px 8px;
    border-radius: 10px;
  }

  /* --- DATA TABLES ROW HOOKS --- */
  .dotabuff-table {
    background: #1c1e2d;
    border-radius: 8px;
    border: 1px solid #2a2d42;
    overflow: hidden;
  }
  .table-header-row {
    display: flex;
    background: #24273a;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #2a2d42;
  }
  .dotabuff-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    font-size: 14px;
    border-bottom: 1px solid #222435;
    transition: background-color 0.15s;
  }
  .dotabuff-row:hover {
    background: #222538;
  }

  .col-hero {
    flex: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 160px;
  }
  .col-result {
    flex: 1.2;
  }
  .col-duration {
    flex: 1;
  }
  .col-kda {
    flex: 1.5;
  }
  .col-action {
    flex: 1;
    text-align: right;
  }

  .hero-portrait {
    width: 48px;
    height: 27px;
    object-fit: cover;
    border-radius: 4px;
    background: #0f1015;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  .hero-name {
    font-weight: 600;
    color: #ffffff;
  }

  .row-win {
    border-left: 4px solid #10b981;
  }
  .row-loss {
    border-left: 4px solid #ef4444;
  }
  .text-win {
    color: #10b981;
    font-weight: 700;
  }
  .text-loss {
    color: #ef4444;
    font-weight: 700;
  }

  .kda-values {
    font-weight: 600;
    color: #cbd5e1;
  }
  .kda-values .k {
    color: #ffffff;
  }
  .kda-values .d {
    color: #fca5a5;
  }
  .kda-values .a {
    color: #cbd5e1;
  }
  .duration-text {
    color: #94a3b8;
    font-family: monospace;
  }

  .inspect-btn {
    background: #1e293b;
    border: 1px solid #334155;
    color: #f1f5f9;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .inspect-btn:hover {
    background: #10b981;
    color: #0f1015;
    border-color: #10b981;
  }

  /* --- DRILL DOWN PANEL STYLES --- */
  .detail-view-container {
    animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .back-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    padding: 0;
    margin-bottom: 16px;
  }
  .back-btn:hover {
    color: #ffffff;
  }

  .card {
    background: #1c1e2d;
    border-radius: 8px;
    border: 1px solid #2a2d42;
    overflow: hidden;
  }
  .match-meta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    margin-bottom: 20px;
  }

  .outcome-banner h4 {
    margin: 0 0 4px 0;
    font-size: 18px;
    letter-spacing: 1px;
  }
  .radiant-victory h4 {
    color: #10b981;
  }
  .dire-victory h4 {
    color: #ef4444;
  }
  .match-id-stamp {
    font-size: 11px;
    color: #64748b;
    font-family: monospace;
  }

  .score-board {
    display: flex;
    align-items: center;
    gap: 15px;
    font-family: monospace;
    font-size: 24px;
    font-weight: 800;
  }
  .score.green {
    color: #10b981;
  }
  .score.red {
    color: #ef4444;
  }
  .vs-divider {
    font-size: 12px;
    color: #475569;
  }

  .team-header {
    margin: 20px 0 8px 4px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .green-text {
    color: #10b981;
  }
  .red-text {
    color: #ef4444;
  }

  .stats-grid-table {
    display: flex;
    flex-direction: column;
    background: #1c1e2d;
  }
  .grid-player-row {
    display: grid;
    grid-template-columns: 40px 1fr 80px 100px 80px;
    align-items: center;
    padding: 10px 14px;
    font-size: 12px;
    border-bottom: 1px solid #222435;
  }
  .grid-player-row:last-child {
    border-bottom: none;
  }

  .interactive-row {
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .interactive-row:hover {
    background: #242739;
  }
  .row-focused {
    background: #222538;
    border-left: 3px solid #10b981;
  }

  .mini-portrait {
    width: 32px;
    height: 18px;
    object-fit: cover;
    border-radius: 2px;
    background: #0f1015;
  }
  .player-name {
    font-weight: 600;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 10px;
  }
  .kda-text {
    font-family: monospace;
    color: #cbd5e1;
    font-weight: 600;
  }
  .economy-text,
  .dmg-text {
    color: #94a3b8;
  }
  .economy-text small,
  .dmg-text small {
    color: #475569;
    font-weight: 700;
  }

  /* --- ASYMMETRIC WORKSPACE GRID --- */
  .workspace-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 20px;
    align-items: start;
  }
  .focused-inspect-pane {
    position: sticky;
    top: 20px;
  }

  .inspect-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    text-align: center;
    color: #475569;
    border: 1px dashed #334155;
    background: transparent;
  }
  .inspect-placeholder svg {
    margin-bottom: 12px;
    color: #334155;
  }
  .inspect-placeholder p {
    font-size: 12px;
    line-height: 1.6;
    max-width: 280px;
    margin: 0;
  }

  /* --- INSPECT CARD SYSTEM --- */
  .inspect-sticky-card {
    background: #1c1e2d;
    border: 1px solid #2a2d42;
  }
  .inspect-hero-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(90deg, #24273a 0%, #1c1e2d 100%);
    border-bottom: 1px solid #2a2d42;
  }
  .inspect-large-portrait {
    width: 80px;
    height: 45px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  }
  .inspect-hero-meta h3 {
    margin: 0 0 2px 0;
    font-size: 16px;
    color: #fff;
  }
  .inspect-hero-meta p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
  .inspect-content {
    padding: 20px;
  }
  .metric-group-title {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #475569;
    margin-bottom: 12px;
  }

  /* Item Grid Layout Layout */
  .items-grid-wrapper {
    display: flex;
    gap: 14px;
    background: #14151f;
    padding: 12px;
    border-radius: 6px;
  }
  .main-items-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    flex: 1;
  }
  .neutral-socket-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #24273a;
    padding-left: 14px;
    gap: 4px;
  }
  .neutral-socket-container small {
    font-size: 8px;
    color: #475569;
    font-weight: 700;
  }
  .item-socket {
    width: 100%;
    max-width: 54px;
    aspect-ratio: 42 / 30;
    object-fit: cover;
    background: #1c1e2d;
    border-radius: 3px;
    border: 1px solid #24273a;
  }
  .item-socket.neutral {
    border-radius: 50%;
    aspect-ratio: 1;
    max-width: 36px;
  }

  /* Performance Percentile Metrics */
  .benchmarks-container {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .benchmark-bar-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .benchmark-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #cbd5e1;
  }
  .benchmark-label .raw-val {
    font-family: monospace;
    font-weight: 700;
    color: #fff;
  }
  .progress-track {
    height: 6px;
    background: #14151f;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  .progress-fill {
    height: 100%;
    background: #3b82f6;
    border-radius: 3px;
  }
  .progress-fill.emerald {
    background: #10b981;
  }
  .pct-marker {
    align-self: flex-end;
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    margin-top: 2px;
  }
  .fallback-note {
    font-size: 11px;
    color: #475569;
    margin: 0;
  }

  .sub-stats-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 20px;
  }
  .stat-box {
    background: #14151f;
    padding: 10px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .stat-box small {
    font-size: 9px;
    color: #475569;
    font-weight: 700;
  }
  .stat-box span {
    font-size: 14px;
    font-weight: 700;
    color: #e2e8f0;
    font-family: monospace;
  }

  /* --- SYSTEM ANIMATION ENGINE --- */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #64748b;
  }
  .spinner,
  .spinner-large {
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #ffffff;
    animation: spin 0.8s linear infinite;
  }
  .spinner {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 8px;
    vertical-align: middle;
  }
  .spinner-large {
    width: 32px;
    height: 32px;
    border-top-color: #10b981;
    margin-bottom: 12px;
  }

  .animate-fade {
    animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
