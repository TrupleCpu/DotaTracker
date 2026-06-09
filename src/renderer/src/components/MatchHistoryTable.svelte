<script lang="ts">
  import type { OpenDotaMatch, Hero } from '../types/dota'
  import { getHeroImageUrl, isVictory, formatDuration } from '../utils/dotaHelper'

  export let matchHistory: OpenDotaMatch[] | null
  export let isDetailsLoading: boolean
  export let heroMap: Map<number, Hero>
  export let inspectMatchDetails: (matchId: number) => Promise<void>

  function getHeroData(heroId: number): Hero {
    return heroMap.get(heroId) || { id: heroId, localized_name: `Hero ${heroId}`, img: '' }
  }
</script>

{#if isDetailsLoading}
  <div class="loading-state">
    <div class="spinner-large"></div>
    <p>Analyzing parsing matrices and timelines via OpenDota...</p>
  </div>
{:else}
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
      {#each matchHistory || [] as match (match.match_id)}
        {@const hero = getHeroData(match.hero_id)}
        {@const won = isVictory(match.player_slot, match.radiant_win)}
        <div class="dotabuff-row {won ? 'row-win' : 'row-loss'}">
          <div class="col-hero hero-cell">
            <img src={getHeroImageUrl(hero.img)} alt={hero.localized_name} class="hero-portrait" />
            <span class="hero-name">{hero.localized_name}</span>
          </div>
          <div class="col-result">
            <span class="outcome-badge {won ? 'text-win' : 'text-loss'}">
              {won ? 'Won Match' : 'Lost Match'}
            </span>
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
            <button class="inspect-btn" on:click={() => inspectMatchDetails(match.match_id)}>
              View Analysis
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
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
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #64748b;
  }
  .spinner-large {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #10b981;
    animation: spin 0.8s linear infinite;
    margin-bottom: 12px;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
