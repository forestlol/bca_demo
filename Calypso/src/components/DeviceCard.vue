<template>
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ device.name }}</h5>
        <p class="card-text">kWh Reading: {{ device.kwh }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DeviceCard',
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
  