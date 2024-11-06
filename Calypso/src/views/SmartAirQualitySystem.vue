<template>
  <div class="container-fluid mt-5">
    <h2 class="text-center mb-4">Smart Air Quality System</h2>
    <div class="view-switcher">
      <button @click="toggleView('relation')" :class="{'active': currentView === 'relation'}">Relation</button>
      <button @click="toggleView('floorplan')" :class="{'active': currentView === 'floorplan'}">Floorplan</button>
      <button @click="toggleView('devices')" :class="{'active': currentView === 'devices'}">Devices</button>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="view-container" v-if="currentView === 'relation'">
          <p>Relation view content goes here.</p>
          <!-- Replace the p tag above with the actual image tag when you have the image -->
        </div>
        
        <div class="view-container" v-if="currentView === 'floorplan'">
          <p>Floorplan view content goes here.</p>
          <!-- Replace the p tag above with the actual image tag when you have the image -->
        </div>
        
        <div class="devices-grid" v-if="currentView === 'devices'">
          <div
            v-for="device in devices"
            :key="device.id"
            :class="['device-item', { 'highlight': hoveredDevice === device.id }]"
            @mouseenter="hoveredDevice = device.id"
            @mouseleave="hoveredDevice = null"
          >
            <h5>{{ device.name }}</h5>
            <p>kWh: {{ device.kwh }}</p>
            <p>Voltage: {{ device.voltage }}</p>
            <p>Current: {{ device.current }}</p>
            <p>Power Factor: {{ device.powerFactor }}</p>
            <button @click="viewDetails(device.id)" class="btn btn-primary mt-auto">View Details</button>
          </div>
        </div>
        
        <div class="link-button" v-if="currentView !== 'devices'">
          <button @click="navigateTo3DLandscape" class="btn btn-primary">Go to 3D Landscape</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PowerMeterReadingPage',
  data() {
    return {
      currentView: 'relation',
      hoveredDevice: null,
      devices: [
        { id: 1, name: 'Device 1', kwh: 123.45, voltage: 220, current: 10, powerFactor: 0.95 },
        { id: 2, name: 'Device 2', kwh: 67.89, voltage: 220, current: 8, powerFactor: 0.9 },
        { id: 3, name: 'Device 3', kwh: 45.67, voltage: 220, current: 5, powerFactor: 0.85 },
        { id: 4, name: 'Device 4', kwh: 89.12, voltage: 220, current: 12, powerFactor: 0.92 },
        { id: 5, name: 'Device 5', kwh: 23.45, voltage: 220, current: 4, powerFactor: 0.87 },
        { id: 6, name: 'Device 6', kwh: 78.90, voltage: 220, current: 9, powerFactor: 0.93 },
        { id: 7, name: 'Device 7', kwh: 56.78, voltage: 220, current: 7, powerFactor: 0.88 },
        { id: 8, name: 'Device 8', kwh: 34.56, voltage: 220, current: 6, powerFactor: 0.86 },
        { id: 9, name: 'Device 9', kwh: 12.34, voltage: 220, current: 3, powerFactor: 0.89 },
      ],
    };
  },
  methods: {
    viewDetails(deviceId) {
      this.$router.push({ name: 'PowerDeviceDetail', params: { id: deviceId } });
    },
    toggleView(view) {
      this.currentView = view;
    },
    navigateTo3DLandscape() {
      window.location.href = "https://visualizer-lite-html.vercel.app/?site=23&levels=94";
    },
  },
};
</script>

<style scoped>
.container-fluid {
  max-width: 1200px;
  min-height: 100vh; /* Ensures the container covers the full viewport height */
}
.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.device-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 80vh;
  overflow-y: auto;
}
.device-list::-webkit-scrollbar {
  width: 8px;
}
.device-list::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 5px;
}
.device-list::-webkit-scrollbar-thumb {
  background-color: lightgrey;
  border-radius: 5px;
  border: 2px solid #f8f9fa;
}
.device-item {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.device-item:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.device-item h5 {
  margin-bottom: 10px;
  font-size: 1.25rem;
  font-weight: bold;
  color: #007bff;
}
.view-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.view-switcher button {
  background-color: #f8f9fa;
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}
.view-switcher button.active {
  background-color: #007bff;
  color: white;
}
.view-container {
  position: relative;
  display: flex;
  flex-direction: column; /* Ensures the content stacks vertically */
  justify-content: center;
  align-items: center;
  height: 500px; /* Adjust as needed */
  background-color: #f8f9fa;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.link-button {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 10px;
}
.highlight {
  border: 2px solid #00BCD4;
  border-radius: 5px;
}
.devices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
</style>
