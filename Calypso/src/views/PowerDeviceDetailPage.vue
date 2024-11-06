<template>
    <div class="container mt-5" v-if="device">
      <h2>{{ device.name }} Details</h2>
      <div class="card custom-card">
        <div class="card-body">
          <h5 class="card-title">{{ device.name }}</h5>
          <p class="card-text">kWh: {{ device.kwh }}</p>
          <p class="card-text">Voltage: {{ device.voltage }} V</p>
          <p class="card-text">Current: {{ device.current }} A</p>
          <p class="card-text">Power Factor: {{ device.powerFactor }}</p>
          <!-- Add more device-specific details here -->
        </div>
      </div>
      <router-link to="/power-meter-reading" class="btn btn-primary mt-3">Back to Power Meter Readings</router-link>
    </div>
    <div v-else class="container mt-5">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="alert alert-danger">Error loading device details: {{ error }}</div>
      <router-link to="/power-meter-reading" class="btn btn-primary mt-3">Back to Power Meter Readings</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PowerDeviceDetailPage',
    props: ['id'],
    data() {
      return {
        device: null,
        loading: true,
        error: null,
      };
    },
    mounted() {
      const deviceId = this.id;
      // Simulate a data fetch
      setTimeout(() => {
        // Hardcoded data for the demo
        const devices = [
          { id: 1, name: 'Device 1', kwh: 123.45, voltage: 220, current: 10, powerFactor: 0.95 },
          { id: 2, name: 'Device 2', kwh: 67.89, voltage: 220, current: 8, powerFactor: 0.9 },
          { id: 3, name: 'Device 3', kwh: 45.67, voltage: 220, current: 5, powerFactor: 0.85 },
          { id: 4, name: 'Device 4', kwh: 89.12, voltage: 220, current: 12, powerFactor: 0.92 },
          { id: 5, name: 'Device 5', kwh: 23.45, voltage: 220, current: 4, powerFactor: 0.87 },
          { id: 6, name: 'Device 6', kwh: 78.90, voltage: 220, current: 9, powerFactor: 0.93 },
          { id: 7, name: 'Device 7', kwh: 56.78, voltage: 220, current: 7, powerFactor: 0.88 },
          { id: 8, name: 'Device 8', kwh: 34.56, voltage: 220, current: 6, powerFactor: 0.86 },
          { id: 9, name: 'Device 9', kwh: 12.34, voltage: 220, current: 3, powerFactor: 0.89 },
        ];
        this.device = devices.find(d => d.id === Number(deviceId));
        this.loading = false;
        if (!this.device) {
          this.error = 'Device not found';
        }
      }, 1000); // Simulate a 1-second delay
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
  }
  .custom-card {
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  </style>
  