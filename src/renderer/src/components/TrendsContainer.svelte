<script lang="ts"></script>

<div class="trends-wrapper" role="region" aria-label="Performance trends over recent matches">
  <div class="trend-panel-card">
    <h5 class="trend-title-meta">GPM trend — last 10 matches vs your rolling avg</h5>
    <div class="vector-surface-container" role="img" aria-label="GPM trend line chart showing performance over 10 matches">
      <svg viewBox="0 0 600 120" class="vector-surface-canvas" preserveAspectRatio="none">
        <!-- Grid line -->
        <line
          x1="0"
          y1="65"
          x2="600"
          y2="65"
          stroke="var(--border-divider)"
          stroke-dasharray="4,4"
          stroke-width="1.5"
          opacity="0.5"
        />
        <!-- Trend line -->
        <path
          d="M 0 30 L 85 60 L 170 80 L 255 72 L 340 25 L 425 35 L 510 75 L 600 45"
          fill="none"
          stroke="var(--accent-primary)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- End point indicator -->
        <circle cx="600" cy="45" r="4" fill="var(--accent-primary)" />
      </svg>
    </div>
    <div class="trend-legends-row" role="list" aria-label="Chart legend">
      <div class="legend-item" role="listitem">
        <span class="indicator-bar solid-primary" aria-hidden="true"></span>
        <span>Your GPM</span>
      </div>
      <div class="legend-item" role="listitem">
        <span class="indicator-bar dashed-muted" aria-hidden="true"></span>
        <span>Your avg (505)</span>
      </div>
    </div>
  </div>

  <div class="trend-panel-card">
    <h5 class="trend-title-meta">LH/min trend</h5>
    <div class="vector-surface-container" role="img" aria-label="LH/min trend line chart showing last farm performance">
      <svg viewBox="0 0 600 100" class="vector-surface-canvas" preserveAspectRatio="none">
        <!-- Grid line -->
        <line
          x1="0"
          y1="50"
          x2="600"
          y2="50"
          stroke="var(--border-divider)"
          stroke-dasharray="4,4"
          stroke-width="1.5"
          opacity="0.5"
        />
        <!-- Trend line -->
        <path
          d="M 0 50 L 85 50 L 170 75 L 255 45 L 340 45 L 425 62 L 510 25 L 600 60"
          fill="none"
          stroke="var(--accent-warning)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- End point indicator -->
        <circle cx="600" cy="60" r="4" fill="var(--accent-warning)" />
      </svg>
    </div>
    <div class="trend-legends-row" role="list" aria-label="Chart legend">
      <div class="legend-item" role="listitem">
        <span class="indicator-bar solid-warning" aria-hidden="true"></span>
        <span>Your LH/min</span>
      </div>
    </div>
  </div>
</div>

<style>
  .trends-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .trend-panel-card {
    background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(23, 27, 38, 0.8) 100%);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-5);
  }

  .trend-title-meta {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-4) 0;
    font-weight: var(--font-medium);
    line-height: 1.4;
  }

  .vector-surface-container {
    width: 100%;
    height: auto;
    position: relative;
    padding: var(--space-1) 0;
  }

  .vector-surface-canvas {
    width: 100%;
    height: 90px;
    overflow: visible;
  }

  .trend-legends-row {
    display: flex;
    gap: var(--space-4);
    margin-top: var(--space-3);
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .indicator-bar {
    width: 16px;
    height: 3px;
    display: inline-block;
    border-radius: var(--radius-sm);
  }

  .solid-primary {
    background-color: var(--accent-primary);
  }

  .solid-warning {
    background-color: var(--accent-warning);
  }

  .dashed-muted {
    border-top: 2px dashed var(--border-divider);
  }
</style>