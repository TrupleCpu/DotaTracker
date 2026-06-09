<script lang="ts">
  import type { MatchPlayerPerf, Hero, DotaItem } from '../types/dota'
  import { getHeroImageUrl, getItemImageUrl } from '../utils/dotaHelper'

  export let focusedPlayer: MatchPlayerPerf | null
  export let heroMap: Map<number, Hero>
  export let itemsData: Record<string, DotaItem>
  export let matchDuration: number

  $: hero = focusedPlayer
    ? heroMap.get(focusedPlayer.hero_id) || {
        id: focusedPlayer.hero_id,
        localized_name: `Hero ${focusedPlayer.hero_id}`,
        img: ''
      }
    : null
  $: dmgPerMin = focusedPlayer ? Math.round(focusedPlayer.hero_damage / (matchDuration / 60)) : 0
</script>

{#if focusedPlayer && hero}
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
          {focusedPlayer.personaname || 'Anonymous Player'} • Level {focusedPlayer.level || '?'}
        </p>
      </div>
    </div>

    <div class="inspect-content">
      <div class="metric-group-title">INVENTORY CONFIGURATION</div>
      <div class="items-grid-wrapper">
        <div class="main-items-grid">
          <img
            src={getItemImageUrl(focusedPlayer.item_0, itemsData)}
            alt="Slot 0"
            class="item-socket"
          />
          <img
            src={getItemImageUrl(focusedPlayer.item_1, itemsData)}
            alt="Slot 1"
            class="item-socket"
          />
          <img
            src={getItemImageUrl(focusedPlayer.item_2, itemsData)}
            alt="Slot 2"
            class="item-socket"
          />
          <img
            src={getItemImageUrl(focusedPlayer.item_3, itemsData)}
            alt="Slot 3"
            class="item-socket"
          />
          <img
            src={getItemImageUrl(focusedPlayer.item_4, itemsData)}
            alt="Slot 4"
            class="item-socket"
          />
          <img
            src={getItemImageUrl(focusedPlayer.item_5, itemsData)}
            alt="Slot 5"
            class="item-socket"
          />
        </div>
        <div class="neutral-socket-container">
          <small>NEUTRAL</small>
          <img
            src={getItemImageUrl(focusedPlayer.item_neutral, itemsData)}
            alt="Neutral"
            class="item-socket neutral"
          />
        </div>
      </div>

      <div class="metric-group-title" style="margin-top: 24px;">PERFORMANCE PERCENTILES</div>
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
                style="width: {(focusedPlayer.benchmarks.gold_per_min?.pct ?? 0) * 100}%"
              ></div>
            </div>
            <span class="pct-marker"
              >{Math.round((focusedPlayer.benchmarks.gold_per_min?.pct ?? 0) * 100)}%</span
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
                style="width: {(focusedPlayer.benchmarks.xp_per_min?.pct ?? 0) * 100}%"
              ></div>
            </div>
            <span class="pct-marker"
              >{Math.round((focusedPlayer.benchmarks.xp_per_min?.pct ?? 0) * 100)}%</span
            >
          </div>

          <div class="benchmark-bar-row">
            <div class="benchmark-label">
              <span>Damage / Min</span>
              <span class="raw-val">{dmgPerMin}</span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                style="width: {(focusedPlayer.benchmarks.hero_damage_per_min?.pct ?? 0) * 100}%"
              ></div>
            </div>
            <span class="pct-marker"
              >{Math.round((focusedPlayer.benchmarks.hero_damage_per_min?.pct ?? 0) * 100)}%</span
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
      stroke-width="2"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
    <p>
      Select any player row from either faction to inspect builds, execution percentiles, and
      telemetry.
    </p>
  </div>
{/if}

<style>
  .card {
    background: #1c1e2d;
    border-radius: 8px;
    border: 1px solid #2a2d42;
    overflow: hidden;
  }
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
  .animate-fade {
    animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
