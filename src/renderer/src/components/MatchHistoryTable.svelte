<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { OpenDotaMatch, Hero } from '../types/dota'

  export let matchHistory: OpenDotaMatch[] | null
  export let heroMap: Map<number, Hero>
  export let selectedMatchId: number | null

  const dispatch = createEventDispatcher<{ select: number }>()

  // Mock data for UI development (mirroring image context)
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

<div class="match-history-panel" role="region" aria-label="Recent match history">
  <h4 class="sidebar-section-title" id="match-history-title">Recent Matches</h4>

  <div class="matches-list" role="listbox" aria-labelledby="match-history-title">
    {#each localMockMatches as match}
      <button
        class="match-item-card"
        class:is-win={match.win}
        class:is-loss={!match.win}
        class:active={selectedMatchId === match.id}
        on:click={() => dispatch('select', match.id)}
        role="option"
        aria-selected={selectedMatchId === match.id}
        aria-label="{match.hero}, {match.win ? 'Victory' : 'Defeat'}, {match.kda}, GPM {match.gpm}"
      >
        <div class="card-left-meta">
          <span class="outcome-tag" class:win-text={match.win} class:loss-text={!match.win}>
            {match.win ? 'VICTORY' : 'DEFEAT'}
          </span>
          <span class="kda-stamp">{match.kda}</span>
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
    <div class="avg-row">
      <span>GPM</span>
      <span class="val font-tabular">505</span>
    </div>
    <div class="avg-row">
      <span>XPM</span>
      <span class="val font-tabular">536</span>
    </div>
    <div class="avg-row">
      <span>LH/min</span>
      <span class="val font-tabular">6.1</span>
    </div>
    <div class="avg-row">
      <span>KP%</span>
      <span class="val font-tabular">59%</span>
    </div>
    <div class="avg-row">
      <span>Win rate</span>
      <span class="val text-primary font-tabular">30%</span>
    </div>
  </div>
</div>

<style>
  .match-history-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-section-title {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--space-4) var(--space-4) var(--space-3) var(--space-4);
    margin: 0;
    font-weight: var(--font-bold);
  }

  .matches-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
  }

  .match-item-card {
    display: grid;
    grid-template-columns: 80px 1fr 50px;
    align-items: center;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-divider);
    padding: var(--space-4);
    text-align: left;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    transition:
      background-color var(--transition-fast),
      border-left-color var(--transition-fast);
    position: relative;
  }

  .match-item-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-danger);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .match-item-card.is-win::before {
    background: var(--accent-success);
  }

  .match-item-card.is-loss::before {
    background: var(--accent-danger);
  }

  .match-item-card:hover::before,
  .match-item-card.active::before {
    opacity: 1;
  }

  .match-item-card:hover {
    background: linear-gradient(90deg, var(--bg-elevated) 0%, transparent 100%);
  }

  .match-item-card.active {
    background: var(--bg-inset);
  }

  .card-left-meta,
  .card-center-meta,
  .card-right-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .card-right-meta {
    align-items: flex-end;
  }

  .outcome-tag {
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    letter-spacing: 0.05em;
  }

  .win-text {
    color: var(--accent-success);
  }

  .loss-text {
    color: var(--accent-danger);
  }

  .kda-stamp,
  .gpm-label,
  .duration-stamp {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-family: var(--font-mono);
  }

  .hero-label {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
  }

  /* Rolling averages box */
  .rolling-averages-box {
    background-color: var(--bg-sidebar);
    border-top: 1px solid var(--border-divider);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .averages-title {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    margin: 0 0 var(--space-1) 0;
    font-weight: var(--font-bold);
    letter-spacing: 0.05em;
  }

  .avg-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .avg-row .val {
    font-family: var(--font-mono);
    font-weight: var(--font-semibold);
  }

  .text-primary {
    color: var(--text-primary);
  }

  .font-tabular {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }
</style>
