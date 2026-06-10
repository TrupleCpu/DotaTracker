<script lang="ts"></script>

<div class="trends-wrapper">
  <div class="trend-panel-card">
    <h5 class="trend-title-meta">GPM trend — last 10 matches vs your rolling avg</h5>
    <div class="vector-surface-container">
      <svg viewBox="0 0 600 120" class="vector-surface-canvas" preserveAspectRatio="none">
        <line
          x1="0"
          y1="65"
          x2="600"
          y2="65"
          stroke="#222533"
          stroke-dasharray="4,4"
          stroke-width="1.5"
        />
        <path
          d="M 0 30 L 85 60 L 170 80 L 255 72 L 340 25 L 425 35 L 510 75 L 600 45"
          fill="none"
          stroke="#cc5233"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="600" cy="45" r="3" fill="#cc5233" />
      </svg>
    </div>
    <div class="trend-legends-row">
      <div class="legend-item"><span class="indicator-bar solid-orange"></span> Your GPM</div>
      <div class="legend-item"><span class="indicator-bar dashed-gray"></span> Your avg (505)</div>
    </div>
  </div>

  <div class="trend-panel-card">
    <h5 class="trend-title-meta">LH/min trend</h5>
    <div class="vector-surface-container">
      <svg viewBox="0 0 600 100" class="vector-surface-canvas" preserveAspectRatio="none">
        <line
          x1="0"
          y1="50"
          x2="600"
          y2="50"
          stroke="#222533"
          stroke-dasharray="4,4"
          stroke-width="1.5"
        />
        <path
          d="M 0 50 L 85 50 L 170 75 L 255 45 L 340 45 L 425 62 L 510 25 L 600 60"
          fill="none"
          stroke="#6f42c1"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="600" cy="60" r="3" fill="#6f42c1" />
      </svg>
    </div>
  </div>
</div>

<style>
  .trends-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .trend-panel-card {
    background-color: #111217;
    border: 1px solid #1a1c24;
    border-radius: 4px;
    padding: 16px;
  }

  .trend-title-meta {
    font-size: 13px;
    color: #888d9c;
    margin: 0 0 16px 0;
    font-weight: 500;
  }

  .vector-surface-container {
    width: 100%;
    height: auto;
    position: relative;
    padding: 4px 0;
  }

  .vector-surface-canvas {
    width: 100%;
    height: 90px;
    overflow: visible;
  }

  .trend-legends-row {
    display: flex;
    gap: 16px;
    margin-top: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #535763;
  }

  .indicator-bar {
    width: 12px;
    height: 2px;
    display: inline-block;
  }
  .solid-orange {
    background-color: #cc5233;
  }
  .dashed-gray {
    border-top: 2px dashed #222533;
  }
</style>
