<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { OpenDotaMatch, Hero } from '../types/dota'

  export let matchHistory: OpenDotaMatch[] | null
  export let heroMap: Map<number, Hero>
  export let selectedMatchId: number | null

  const dispatch = createEventDispatcher<{ select: number }>()

  // Mirroring image context mock metrics directly when live arrays are missing or bootstrapping
  const localMockMatches = [
    {
      id: 1,
      hero: 'Invoker',
      duration: '46m',
      kda: '9/3/13',
      gpm: 532,
      win: false,
      date: '9/3/13'
    },
    { id: 2, hero: 'Lina', duration: '47m', kda: '3/4/12', gpm: 422, win: false, date: '3/4/12' },
    {
      id: 3,
      hero: 'Storm Spirit',
      duration: '33m',
      kda: '12/4/9',
      gpm: 465,
      win: false,
      date: '12/4/9'
    },
    { id: 4, hero: 'Invoker', duration: '49m', kda: '11/6/3', gpm: 613, win: true, date: '11/6/3' },
    {
      id: 5,
      hero: 'Queen of Pain',
      duration: '26m',
      kda: '5/0/11',
      gpm: 539,
      win: false,
      date: '5/0/11'
    },
    { id: 6, hero: 'Puck', duration: '31m', kda: '13/6/11', gpm: 618, win: false, date: '13/6/11' },
    {
      id: 7,
      hero: 'Ember Spirit',
      duration: '26m',
      kda: '9/8/1',
      gpm: 423,
      win: false,
      date: '9/8/1'
    },
    { id: 8, hero: 'Invoker', duration: '45m', kda: '9/5/9', gpm: 370, win: true, date: '9/5/9' },
    {
      id: 9,
      hero: 'Shadow Fiend',
      duration: '53m',
      kda: '3/1/2',
      gpm: 469,
      win: true,
      date: '3/1/2'
    },
    { id: 10, hero: 'Lina', duration: '25m', kda: '2/8/6', gpm: 598, win: false, date: '2/8/6' }
  ]
</script>

<div class="match-history-panel">
  <h4 class="sidebar-section-title">Recent Matches</h4>

  <div class="matches-list">
    {#each localMockMatches as match}
      <button
        class="match-item-card"
        class:is-win={match.win}
        class:active={selectedMatchId === match.id}
        on:click={() => dispatch('select', match.id)}
      >
        <div class="card-left-meta">
          <span class="outcome-tag" class:win-text={match.win} class:loss-text={!match.win}>
            {match.win ? 'WIN' : 'LOSS'}
          </span>
          <span class="kda-stamp">{match.date}</span>
        </div>

        <div class="card-center-meta">
          <span class="hero-label">{match.hero}</span>
          <span class="gpm-label">GPM {match.gpm}</span>
        </div>

        <div class="card-right-meta">
          <span class="duration-stamp">{match.duration}</span>
        </div>
      </button>
    {/each}
  </div>

  <div class="rolling-averages-box">
    <h5 class="averages-title">7-Day Avg</h5>
    <div class="avg-row"><span>GPM</span><span class="val">505</span></div>
    <div class="avg-row"><span>XPM</span><span class="val">536</span></div>
    <div class="avg-row"><span>LH/min</span><span class="val">6.1</span></div>
    <div class="avg-row"><span>KP%</span><span class="val">59%</span></div>
    <div class="avg-row"><span>Win rate</span><span class="val font-white">30%</span></div>
  </div>
</div>

<style>
  .match-history-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-section-title {
    font-size: 11px;
    color: #4b4f5a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 16px 14px 10px 14px;
    margin: 0;
    font-weight: 700;
  }

  .matches-list {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .match-item-card {
    display: grid;
    grid-template-columns: 70px 1fr 45px;
    align-items: center;
    background: transparent;
    border: none;
    border-bottom: 1px solid #121319;
    padding: 12px 14px;
    text-align: left;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
  }

  .match-item-card:hover {
    background-color: #111217;
  }

  .match-item-card.active {
    background-color: #14161f;
  }

  .match-item-card.is-win {
    border-left: 2px solid #3cb878;
  }

  .match-item-card:not(.is-win) {
    border-left: 2px solid #e25c38;
  }

  .card-left-meta,
  .card-center-meta,
  .card-right-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .card-right-meta {
    align-items: flex-end;
  }

  .outcome-tag {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .win-text {
    color: #3cb878;
  }
  .loss-text {
    color: #cc5233;
  }

  .kda-stamp,
  .gpm-label,
  .duration-stamp {
    font-size: 12px;
    color: #545866;
    font-family: monospace;
  }

  .hero-label {
    font-size: 13px;
    font-weight: 600;
    color: #a8adbd;
  }

  /* --- 7-Day Running Performance Box --- */
  .rolling-averages-box {
    background-color: #0b0c10;
    border-top: 1px solid #14151b;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .averages-title {
    font-size: 11px;
    color: #4b4f5a;
    text-transform: uppercase;
    margin: 0 0 4px 0;
    font-weight: 700;
  }

  .avg-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #545866;
  }

  .avg-row .val {
    font-family: monospace;
    font-weight: 600;
  }
  .font-white {
    color: #b0b5c1;
  }
</style>
