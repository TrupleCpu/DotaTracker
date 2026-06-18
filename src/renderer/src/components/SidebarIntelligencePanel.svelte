<script lang="ts"></script>

<div class="sidebar-intel-panel" role="region" aria-label="Coach intelligence and goals">
  <!-- Overlay Preview -->
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
        <span class="value">
          6.7 <span class="trend text-success">▲ 10%</span>
        </span>
      </div>
      <div class="hud-metric-row">
        <span class="label">GPM</span>
        <span class="value">
          532 <span class="trend text-success">▲ 5%</span>
        </span>
      </div>
      <div class="hud-metric-row">
        <span class="label">Deaths</span>
        <span class="value">
          1 <span class="trend text-success">▼ 50%</span>
        </span>
      </div>
    </div>
  </div>

  <!-- Active Goals -->
  <div class="intel-block">
    <h4 class="pane-section-title">Active Goals</h4>

    <div class="goal-node-card">
      <div class="goal-node-row">
        <p class="goal-node-text">Increase vision score +15% over 10 matches</p>
      </div>
      <div class="progress-meta-row">
        <div class="bar-track" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100">
          <div class="bar-fill warning-fill" style="width: 60%"></div>
        </div>
        <span class="streak-tag">🔥 3d</span>
      </div>
      <span class="counter-label">6/10</span>
    </div>

    <div class="goal-node-card">
      <div class="goal-node-row">
        <p class="goal-node-text">Maintain 55%+ lane equilibrium as mid</p>
      </div>
      <div class="progress-meta-row">
        <div class="bar-track" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100">
          <div class="bar-fill success-fill" style="width: 80%"></div>
        </div>
        <span class="streak-tag">🔥 5d</span>
      </div>
      <span class="counter-label">8/10</span>
    </div>

    <div class="goal-node-card">
      <div class="goal-node-row">
        <p class="goal-node-text">Reduce deaths to under 5 per game</p>
      </div>
      <div class="progress-meta-row">
        <div class="bar-track" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
          <div class="bar-fill warning-fill" style="width: 40%"></div>
        </div>
        <span class="streak-tag">🔥 1d</span>
      </div>
      <span class="counter-label">4/10</span>
    </div>
  </div>

  <!-- Hero Mastery -->
  <div class="intel-block">
    <h4 class="pane-section-title">Hero Mastery</h4>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder" aria-hidden="true">INV</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Invoker</span>
          <span class="pct-lbl">65%</span>
        </div>
        <span class="tier-lbl">Intermediate</span>
        <div class="mastery-bar-track" role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
          <div class="mastery-bar-fill warning-fill" style="width: 65%"></div>
        </div>
      </div>
    </div>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder" aria-hidden="true">LIN</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Lina</span>
          <span class="pct-lbl">30%</span>
        </div>
        <span class="tier-lbl">Novice</span>
        <div class="mastery-bar-track" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">
          <div class="mastery-bar-fill warning-fill" style="width: 30%"></div>
        </div>
      </div>
    </div>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder" aria-hidden="true">SS</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Storm Spirit</span>
          <span class="pct-lbl">88%</span>
        </div>
        <span class="tier-lbl">Advanced</span>
        <div class="mastery-bar-track" role="progressbar" aria-valuenow="88" aria-valuemin="0" aria-valuemax="100">
          <div class="mastery-bar-fill primary-fill" style="width: 88%"></div>
        </div>
      </div>
    </div>

    <div class="mastery-hero-item">
      <div class="hero-avatar-placeholder" aria-hidden="true">PCK</div>
      <div class="mastery-core-info">
        <div class="mastery-meta-header">
          <span class="hero-title-lbl">Puck</span>
          <span class="pct-lbl">20%</span>
        </div>
        <span class="tier-lbl">Novice</span>
        <div class="mastery-bar-track" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
          <div class="mastery-bar-fill success-fill" style="width: 20%"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .sidebar-intel-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .pane-section-title {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 var(--space-3) 0;
    font-weight: var(--font-bold);
  }

  /* HUD Preview Box */
  .hud-preview-box {
    background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(23, 27, 38, 0.8) 100%);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .hud-header-meta {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .hud-progress-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }

  .hud-bar-track {
    height: 4px;
    background-color: var(--bg-mute);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .hud-bar-track .fill.filled {
    background-color: var(--accent-warning);
    width: 100%;
    height: 100%;
  }

  .hud-metric-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-sm);
  }

  .hud-metric-row .label {
    color: var(--text-tertiary);
  }

  .hud-metric-row .value {
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  .hud-metric-row .trend {
    font-size: var(--text-xs);
    margin-left: var(--space-1);
    font-family: var(--font-mono);
  }

  /* Goal Cards */
  .goal-node-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    margin-bottom: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    transition: border-color var(--transition-fast);
  }

  .goal-node-card:hover {
    border-color: var(--border-strong);
  }

  .goal-node-row {
    margin: 0;
  }

  .goal-node-text {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .progress-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .bar-track {
    flex: 1;
    height: 6px;
    background-color: var(--bg-mute);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: var(--radius-sm);
    transition: width var(--transition-slow);
  }

  .success-fill {
    background: linear-gradient(90deg, var(--accent-success) 0%, #16a34a 100%);
    box-shadow: 0 0 8px var(--accent-success-glow);
  }

  .warning-fill {
    background: linear-gradient(90deg, var(--accent-warning) 0%, #d97706 100%);
    box-shadow: 0 0 8px var(--accent-warning-glow);
  }

  .primary-fill {
    background: linear-gradient(90deg, var(--accent-primary) 0%, #5b4fc9 100%);
    box-shadow: 0 0 8px rgba(107, 90, 224, 0.4);
  }

  .streak-tag {
    font-size: var(--text-xs);
    color: var(--accent-warning);
    font-weight: var(--font-semibold);
  }

  .counter-label {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-family: var(--font-mono);
  }

  /* Hero Mastery Items */
  .mastery-hero-item {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    margin-bottom: var(--space-3);
  }

  .hero-avatar-placeholder {
    width: 40px;
    height: 40px;
    background: var(--bg-mute);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    color: var(--text-tertiary);
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
  }

  .pct-lbl {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-family: var(--font-mono);
  }

  .tier-lbl {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .mastery-bar-track {
    height: 4px;
    background: var(--bg-mute);
    border-radius: var(--radius-sm);
    margin-top: var(--space-1);
    overflow: hidden;
  }

  .mastery-bar-fill {
    height: 100%;
    transition: width var(--transition-slow);
  }

  /* Utility classes */
  .text-success {
    color: var(--accent-success);
  }
</style>