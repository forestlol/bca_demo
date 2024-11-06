<template>
    <div class="circle-progress-container">
      <svg viewBox="0 0 36 36" class="circular-chart blue">
        <path class="circle-bg"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path class="circle"
          :stroke-dasharray="percentage + ', 100'"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20.35" class="percentage-text">{{ percentage }}%</text>
      </svg>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WaterLevelIndicator',
    props: {
      percentage: {
        type: Number,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .circle-progress-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 187px;
  }
  
  .circular-chart {
    display: block;
    max-width: 80%;
    max-height: 80%;
  }
  
  .circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3.8;
  }
  
  .circle {
    fill: none;
    stroke-width: 4;
    stroke-linecap: round;
    animation: progress 1s ease-out forwards;
  }
  
  .blue .circle {
    stroke: #007bff;
  }
  
  .percentage-text {
    fill: #007bff;
    font-size: 0.5em;
    text-anchor: middle;
  }
  
  .circle-progress-label .label-text {
    font-size: 14px;
    font-weight: bold;
    color: #000;
    text-align: center;
  }
  
  @keyframes progress {
    0% {
      stroke-dasharray: 0 100;
    }
  }
  </style>
  