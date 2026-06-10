<script lang="ts"></script>

<div class="sidebar-intel-panel">
  <div class="intel-block">
    <h4 class="pane-section-title">Overlay Preview</h4>
    <div class="hud-preview-box">
      <div class="hud-header-meta">In-game HUD · Early phase</div>

      <div class="hud-progress-container">
        <div class="hud-bar-track active"><div class="fill filled"></div></div>
        <div class="hud-bar-track"><div class="fill"></div></div>
        <div class="hud-bar-track"><div class="fill"></div></div>
      </div>

      <div class="hud-metric-row">
        <span class="label">LH/min</span>
        <span class="value font-white">6.7 <span class="trend text-green">▲ 10%</span></span>
      </div>
      <div class="hud-metric-row">
        <span class="label">GPM</span>
        <span class="value font-white">532 <span class="trend text-green">▲ 5%</span></span>
      </div>
      <div class="hud-metric-row">
        <span class="label">Deaths</span>
        <span class="value font-white">1 <span class="trend text-green">▼ 50%</span></span>
      </div>
    </div>
  </div>

  <div class="intel-block">
    <h4 class="pane-section-title">Active Goals</h4>

    <div class="goal-node-card">
      <div class="goal-node-row">
        <p class="goal-node-text">Increase vision score +15% over 10 matches</p>
      </div>
      <div class="progress-meta-row">
        <div class="bar-track"><div class="bar-fill orange-fill" style="width: 60%"></div></div>
        <span class="streak-tag">🔥 3d</span>
      </div>
      <span class="counter-label">6/10</span>
    </div>

    <div class="goal-node-card">
      <div class="goal-node-row">
        <p class="goal-node-text">Maintain 55%+ lane equilibrium as mid</p>
      </div>
      <div class="progress-meta-row">
        <div class="bar-track"><div class="bar-fill green-fill" style="width: 80%"></div></div>
        <span class="streak-tag">🔥 5d</span>
      </div>
      <span class="counter-label">8/10</span>
    </div>

    <div class="goal-node-card">
      <div class="goal-node-row">
        <p class="goal-node-text">Reduce deaths to under 5 per game</p>
      </div>
      <div class="progress-meta-row">
        <div class="bar-track"><div class="bar-fill yellow-fill" style="width: 40%"></div></div>
        <span class="streak-tag">🔥 1d</span>
      </div>
      <span class="counter-label">4/10</span>
    </div>
  </div>

  <div class="intel-block">
    <h4 class="pane-section-title">Hero Mastery</h4>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder">INV</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Invoker</span>
          <span class="pct-lbl">65%</span>
        </div>
        <span class="tier-lbl">Intermediate</span>
        <div class="mastery-bar-track">
          <div class="mastery-bar-fill orange-fill" style="width: 65%"></div>
        </div>
      </div>
    </div>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder">LIN</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Lina</span>
          <span class="pct-lbl">30%</span>
        </div>
        <span class="tier-lbl">Novice</span>
        <div class="mastery-bar-track">
          <div class="mastery-bar-fill yellow-fill" style="width: 30%"></div>
        </div>
      </div>
    </div>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder">SS</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Storm Spirit</span>
          <span class="pct-lbl">88%</span>
        </div>
        <span class="tier-lbl">Advanced</span>
        <div class="mastery-bar-track">
          <div class="mastery-bar-fill purple-fill" style="width: 88%"></div>
        </div>
      </div>
    </div>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder">PCK</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Puck</span>
          <span class="pct-lbl">20%</span>
        </div>
        <span class="tier-lbl">Novice</span>
        <div class="mastery-bar-track">
          <div class="mastery-bar-fill green-fill" style="width: 20%"></div>
        </div>
      </div>
    </div>
  </div>
</div>
a

<style>
  .sidebar-intel-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .pane-section-title {
    font-size: 11px;
    color: #4b4f5a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px 0;
    font-weight: 700;
  }

  /* --- HUD Live Mini Preview Box --- */
  .hud-preview-box {
    background-color: #111217;
    border: 1px solid #1a1c24;
    border-radius: 4px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hud-header-meta {
    font-size: 12px;
    color: #4b4f5a;
  }

  .hud-progress-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .hud-bar-track {
    height: 3px;
    background-color: #1a1c24;
    border-radius: 1px;
    overflow: hidden;
  }

  .hud-bar-track .fill.filled {
    background-color: #cc5233;
    width: 100%;
    height: 100%;
  }

  .hud-metric-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .hud-metric-row .label {
    color: #545866;
  }
  .hud-metric-row .trend {
    font-size: 11px;
    margin-left: 4px;
    font-family: monospace;
  }

  /* --- Active Practice Objectives Nodes --- */
  .goal-node-card {
    background-color: #111217;
    border: 1px solid #1a1c24;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .goal-node-text {
    margin: 0;
    font-size: 13px;
    color: #a8adbd;
    line-height: 1.4;
  }

  .progress-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .bar-track {
    flex: 1;
    height: 4px;
    background-color: #1a1c24;
    border-radius: 2px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 2px;
  }
  .orange-fill {
    background-color: #cc5233;
  }
  .green-fill {
    background-color: #3cb878;
  }
  .yellow-fill {
    background-color: #dfa43b;
  }
  .purple-fill {
    background-color: #6f42c1;
  }

  .streak-tag {
    font-size: 11px;
    color: #dfa43b;
    font-weight: 600;
  }

  .counter-label {
    font-size: 11px;
    color: #4b4f5a;
    font-family: monospace;
  }

  /* --- Hero Progression Gauges --- */
  .mastery-hero-item {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 14px;
  }

  .hero-avatar-placeholder {
    width: 32px;
    height: 32px;
    background-color: #1a1c24;
    border: 1px solid #262936;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #545866;
    flex-shrink: 0;
  }

  .mastery-core-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mastery-meta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hero-title-lbl {
    font-size: 13px;
    font-weight: 600;
    color: #b0b5c1;
  }

  .pct-lbl {
    font-size: 11px;
    color: #545866;
    font-family: monospace;
  }

  .tier-lbl {
    font-size: 11px;
    color: #4b4f5a;
  }

  .mastery-bar-track {
    height: 3px;
    background-color: #1a1c24;
    border-radius: 1.5px;
    margin-top: 4px;
    overflow: hidden;
  }
  .mastery-bar-fill {
    height: 100%;
  }

  .font-white {
    color: #ffffff;
  }
  .text-green {
    color: #3cb878;
  }
</style>
