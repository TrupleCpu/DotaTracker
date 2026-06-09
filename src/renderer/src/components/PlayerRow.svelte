<script lang="ts">
  import type { MatchPlayerPerf, Hero } from '../types/dota'
  import { getHeroImageUrl } from '../utils/dotaHelper'

  export let player: MatchPlayerPerf
  export let heroMap: Map<number, Hero>
  export let isFocused: boolean

  $: hero = heroMap.get(player.hero_id) || {
    id: player.hero_id,
    localized_name: `Hero ${player.hero_id}`,
    img: ''
  }
</script>

<button
  type="button"
  class="grid-player-row interactive-row {isFocused ? 'row-focused' : ''}"
  on:click
>
  <img src={getHeroImageUrl(hero.img)} alt={hero.localized_name} class="mini-portrait" />
  <span class="player-name">{player.personaname || 'Anonymous'}</span>
  <span class="kda-text">{player.kills}/{player.deaths}/{player.assists}</span>
  <span class="economy-text"><small>GPM:</small> {player.gold_per_min}</span>
  <span class="dmg-text"><small>DMG:</small> {(player.hero_damage / 1000).toFixed(1)}k</span>
</button>

<style>
  .grid-player-row {
    display: grid;
    grid-template-columns: 40px 1fr 80px 100px 80px;
    align-items: center;
    padding: 10px 14px;
    font-size: 12px;
    border-bottom: 1px solid #222435;

    /* Reset button default agent styles to look exactly like the previous layout div */
    background: transparent;
    border-top: none;
    border-right: none;
    border-left: none;
    text-align: left;
    font-family: inherit;
    width: 100%;
    color: inherit;
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
</style>
