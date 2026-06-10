<script lang="ts"></script>

<div class="metrics-dashboard-grid">
  <div class="metric-intel-box">
    <span class="intel-title">GPM</span>
    <span class="intel-main-value">532</span>
    <span class="intel-comparison text-green font-monospace"
      >▲ 5% <span class="text-muted">vs your avg</span></span
    >
  </div>

  <div class="metric-intel-box">
    <span class="intel-title">XPM</span>
    <span class="intel-main-value">632</span>
    <span class="intel-comparison text-green font-monospace"
      >▲ 18% <span class="text-muted">vs your avg</span></span
    >
  </div>

  <div class="metric-intel-box">
    <span class="intel-title">LH/min</span>
    <span class="intel-main-value">5.5</span>
    <span class="intel-comparison text-red font-monospace"
      >▼ 10% <span class="text-muted">vs your avg</span></span
    >
  </div>

  <div class="metric-intel-box">
    <span class="intel-title">KP%</span>
    <span class="intel-main-value">57%</span>
    <span class="intel-comparison text-red font-monospace"
      >▼ 3% <span class="text-muted">vs your avg</span></span
    >
  </div>
</div>

<style>
  .metrics-dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .metric-intel-box {
    background-color: #111217;
    border: 1px solid #1a1c24;
    border-radius: 4px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .intel-title {
    font-size: 11px;
    color: #535763;
    font-weight: 600;
  }

  .intel-main-value {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    font-family: monospace, system-ui;
  }

  .intel-comparison {
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .font-monospace {
    font-family: monospace;
  }
  .text-green {
    color: #3cb878;
  }
  .text-red {
    color: #cc5233;
  }
  .text-muted {
    color: #535763;
    font-weight: 400;
  }
</style>
