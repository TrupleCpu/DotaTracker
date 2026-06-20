<script lang="ts">
  export let size = 80
</script>

<div class="eye-container" style="width: {size}px; height: {size}px;">
  <svg
    viewBox="0 0 100 100"
    class="eye-svg"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Outer concentric tracking ring (slow CCW rotation) -->
    <circle
      cx="50"
      cy="50"
      r="44"
      fill="none"
      stroke="var(--color-tx3)"
      stroke-width="1"
      stroke-dasharray="4 8"
      class="ring-outer"
    />

    <!-- Technical bracket crosshairs (static) -->
    <path
      d="M 50,5 L 50,12 M 50,88 L 50,95 M 5,50 L 12,50 M 88,50 L 95,50"
      stroke="var(--color-tx3)"
      stroke-width="1.5"
      stroke-linecap="round"
      opacity="0.6"
    />

    <!-- Inner telemetry ring (fast CW rotation) -->
    <circle
      cx="50"
      cy="50"
      r="32"
      fill="none"
      stroke="var(--color-tx2)"
      stroke-width="1"
      stroke-dasharray="16 6 4 6"
      class="ring-inner"
      opacity="0.8"
    />

    <!-- Outer Eye Outline (bracket style, subtle glow) -->
    <path
      d="M 22,50 C 32,32 68,32 78,50 C 68,68 32,68 22,50 Z"
      fill="none"
      stroke="var(--color-tx)"
      stroke-width="1.5"
      stroke-linecap="round"
      class="eye-lid"
    />

    <!-- Inner Pupil outline -->
    <circle
      cx="50"
      cy="50"
      r="16"
      fill="none"
      stroke="var(--color-tx2)"
      stroke-width="1"
      stroke-dasharray="3 3"
      opacity="0.7"
    />

    <!-- Core Glowing Iris (Pulsing center) -->
    <circle
      cx="50"
      cy="50"
      r="10"
      fill="url(#irisGrad)"
      class="eye-iris"
    />

    <defs>
      <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--color-tx)" stop-opacity="1" />
        <stop offset="60%" stop-color="var(--color-tx2)" stop-opacity="0.8" />
        <stop offset="100%" stop-color="var(--color-bg)" stop-opacity="0" />
      </radialGradient>
    </defs>
  </svg>
</div>

<style>
  .eye-container {
    display: inline-block;
    position: relative;
    cursor: pointer;
  }

  .eye-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /* Outer ring spinning counter-clockwise */
  .ring-outer {
    transform-origin: center;
    animation: rotateCCW 20s linear infinite;
  }

  /* Inner ring spinning clockwise */
  .ring-inner {
    transform-origin: center;
    animation: rotateCW 12s linear infinite;
  }

  /* Eye iris breathing animation */
  .eye-iris {
    transform-origin: center;
    animation: breathe 3s ease-in-out infinite;
    filter: drop-shadow(0 0 4px var(--color-tx));
    transition: filter 0.3s ease, fill 0.3s ease;
  }

  .eye-lid {
    transition: stroke-width 0.3s ease, filter 0.3s ease;
  }

  /* Hover interactive state */
  .eye-container:hover .eye-iris {
    animation: hyperBreathe 1s ease-in-out infinite;
    filter: drop-shadow(0 0 10px var(--color-gr)) drop-shadow(0 0 20px rgba(34, 197, 94, 0.4));
  }

  .eye-container:hover .eye-lid {
    stroke-width: 2px;
    filter: drop-shadow(0 0 3px var(--color-tx));
  }

  .eye-container:hover .ring-outer {
    animation-duration: 6s;
  }

  .eye-container:hover .ring-inner {
    animation-duration: 3s;
  }

  @keyframes rotateCW {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotateCCW {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }

  @keyframes breathe {
    0%, 100% {
      transform: scale(0.95);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
  }

  @keyframes hyperBreathe {
    0%, 100% {
      transform: scale(1.0);
      opacity: 0.9;
    }
    50% {
      transform: scale(1.3);
      opacity: 1;
    }
  }
</style>
