<template>
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ device.name }}</h5>
        <p class="card-text">Temperature: {{ device.temperature }} °C</p>
        <p class="card-text">Humidity: {{ device.humidity }} %</p>
        <p class="card-text">Air Pressure: {{ device.pressure }} hPa</p>
        <p class="card-text">Carbon Footprint: {{ device.co2 }} ppm</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'IAQDeviceCard',
    props: {
      device: {
        type: Object,
        required: true,
      },
    },
  };
  </script>
  
  <style scoped>
  .card {
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .card-body {
    padding: 15px;
  }
  </style>
  