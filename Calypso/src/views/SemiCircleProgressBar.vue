<template>
    <div class="semi-circle-container">
      <canvas ref="semiCircleCanvas" width="200" height="100"></canvas>
      <div class="semi-circle-label">
        <span class="percentage"><br><br>{{ percentage.toFixed(2) }}%</span><br>
        <span class="label-text">Operational</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SemiCircleProgressBar',
    props: {
      percentage: {
        type: Number,
        required: true
      }
    },
    mounted() {
      this.drawSemiCircle();
    },
    watch: {
      percentage() {
        this.drawSemiCircle();
      }
    },
    methods: {
      drawSemiCircle() {
        const canvas = this.$refs.semiCircleCanvas;
        const ctx = canvas.getContext('2d');
        const startAngle = Math.PI;
        const endAngle = startAngle + Math.PI;
        const radius = 90;
        const centerX = canvas.width / 2;
        const centerY = canvas.height;
        const lineWidth = 10;
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#e0e0e0";
        ctx.stroke();
  
        // Progress arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + (this.percentage / 100) * Math.PI);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#007bff";
        ctx.stroke();
      }
    }
  };
  </script>
  
  <style scoped>
  .semi-circle-container {
    position: relative;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .semi-circle-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  
  .semi-circle-label .percentage {
    font-size: 20px;
    font-weight: bold;
  }
  
  .semi-circle-label .label-text {
    font-size: 14px;
  }
  </style>
  