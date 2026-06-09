<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { DetailedMatchData, Hero, DotaItem, MatchPlayerPerf } from '../types/dota'
  import { formatDuration } from '../utils/dotaHelper'
  import PlayerRow from './PlayerRow.svelte'
  import FocusedPlayerPane from './FocusedPlayerPane.svelte'

  export let selectedMatch: DetailedMatchData
  export let heroMap: Map<number, Hero>
  export let itemsData: Record<string, DotaItem>

  let focusedPlayer: MatchPlayerPerf | null = null
  const dispatch = createEventDispatcher<{ back: null }>()

  $: radiantPlayers = selectedMatch.players.filter((p) => p.player_slot < 128)
  $: direPlayers = selectedMatch.players.filter((p) => p.player_slot >= 128)
</script>

<div class="detail-view-container">
  <button class="back-btn" on:click={() => dispatch('back')}> ← Return to Match History </button>

  <div class="match-meta-header card">
    <div class="outcome-banner {selectedMatch.radiant_win ? 'radiant-victory' : 'dire-victory'}">
      <h4>{selectedMatch.radiant_win ? 'RADIANT VICTORY' : 'DIRE VICTORY'}</h4>
      <span class="match-id-stamp">
        ID: {selectedMatch.match_id} • Duration: {formatDuration(selectedMatch.duration)}
      </span>
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
        {#each radiantPlayers as player (player.player_slot)}
          <PlayerRow
            {player}
            {heroMap}
            isFocused={focusedPlayer?.player_slot === player.player_slot}
            on:click={() => (focusedPlayer = player)}
          />
        {/each}
      </div>

      <h4 class="team-header red-text">Dire Team</h4>
      <div class="stats-grid-table card">
        {#each direPlayers as player (player.player_slot)}
          <PlayerRow
            {player}
            {heroMap}
            isFocused={focusedPlayer?.player_slot === player.player_slot}
            on:click={() => (focusedPlayer = player)}
          />
        {/each}
      </div>
    </div>

    <div class="focused-inspect-pane">
      <FocusedPlayerPane
        {focusedPlayer}
        {heroMap}
        {itemsData}
        matchDuration={selectedMatch.duration}
      />
    </div>
  </div>
</div>

<style>
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
