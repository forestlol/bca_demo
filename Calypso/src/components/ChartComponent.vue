<template>
  <div class="chart-container">
    <canvas id="myChart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'ChartComponent',
  mounted() {
    const xValues = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    const yValues = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];

    new Chart("myChart", {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          label: 'Energy Consumption',
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgba(0,0,255,0.1)",
          data: yValues
        }]
      },
      options: {
        legend: { display: true },
        scales: {
          y: {
            min: 6,
            max: 16
          }
        }
      }
    });
  }
};
</script>

<style scoped>
.chart-container {
  background-color: white;
  width: 100%;
  padding: 20px;
  box-sizing: border-box; /* Ensure padding does not affect total width */
}
canvas {
  width: 100% !important;
  height: auto !important;
}
</style>
