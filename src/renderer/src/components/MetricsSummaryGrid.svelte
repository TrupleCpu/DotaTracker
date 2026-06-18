<script lang="ts"></script>

<div class="metrics-dashboard-grid" role="region" aria-label="Key performance metrics">
  <div class="metric-intel-box">
    <span class="intel-title">GPM</span>
    <div class="intel-value-wrapper">
      <span class="intel-main-value font-tabular">532</span>
    </div>
    <div class="intel-trend positive" aria-live="polite">
      <span class="trend-icon" aria-hidden="true">▲</span>
      <span class="trend-text">5% <span class="trend-label">vs avg</span></span>
    </div>
  </div>

  <div class="metric-intel-box">
    <span class="intel-title">XPM</span>
    <div class="intel-value-wrapper">
      <span class="intel-main-value font-tabular">632</span>
    </div>
    <div class="intel-trend positive" aria-live="polite">
      <span class="trend-icon" aria-hidden="true">▲</span>
      <span class="trend-text">18% <span class="trend-label">vs avg</span></span>
    </div>
  </div>

  <div class="metric-intel-box">
    <span class="intel-title">LH/min</span>
    <div class="intel-value-wrapper">
      <span class="intel-main-value font-tabular">5.5</span>
    </div>
    <div class="intel-trend negative" aria-live="polite">
      <span class="trend-icon" aria-hidden="true">▼</span>
      <span class="trend-text">10% <span class="trend-label">vs avg</span></span>
    </div>
  </div>

  <div class="metric-intel-box">
    <span class="intel-title">KP%</span>
    <div class="intel-value-wrapper">
      <span class="intel-main-value font-tabular">57%</span>
    </div>
    <div class="intel-trend negative" aria-live="polite">
      <span class="trend-icon" aria-hidden="true">▼</span>
      <span class="trend-text">3% <span class="trend-label">vs avg</span></span>
    </div>
  </div>
</div>

<style>
  .metrics-dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }

  .metric-intel-box {
    background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(23, 27, 38, 0.8) 100%);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .metric-intel-box:hover {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-sm);
  }

  .intel-title {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .intel-value-wrapper {
    padding: var(--space-1) 0;
  }

  .intel-main-value {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    font-family: var(--font-mono);
    letter-spacing: -0.02em;
  }

  .intel-trend {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    margin-top: var(--space-1);
  }

  .intel-trend.positive {
    color: var(--accent-success);
  }

  .intel-trend.negative {
    color: var(--accent-danger);
  }

  .trend-icon {
    font-size: 10px;
    font-weight: var(--font-bold);
  }

  .trend-label {
    color: var(--text-tertiary);
    font-weight: var(--font-normal);
  }

  .font-tabular {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }
</style>