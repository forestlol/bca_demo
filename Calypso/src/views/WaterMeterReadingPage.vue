<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Water Meter Reading</h2>
    <div class="row">
      <div class="col-md-3">
        <h4 class="section-title">Water Meters</h4>
        <div class="device-list">
          <div
            v-for="(reading, index) in waterReadings"
            :key="index"
            :class="['device-item', { 'highlight': hoveredDevice === index }]"
            @mouseenter="hoveredDevice = index"
            @mouseleave="hoveredDevice = null"
          >
            <h5>{{ reading.device }}</h5>
            <p><strong>Water Flow Rate:</strong> {{ reading.flowRate }} L/min</p>
            <p><strong>Water Usage:</strong> {{ reading.usage }} L</p>
            <p><strong>Pressure:</strong> {{ reading.pressure }} kPa</p>
            <p><strong>Temperature:</strong> {{ reading.temperature }} °C</p>
          </div>
        </div>
      </div>
      <div class="col-md-9">
        <div class="view-switcher">
          <button @click="toggleView('relation')" :class="{'active': currentView === 'relation'}">Relation</button>
          <button @click="toggleView('floorplan')" :class="{'active': currentView === 'floorplan'}">Floorplan</button>
        </div>
        <div class="view-container" v-if="currentView === 'relation'">
          <p>Relation view content goes here.</p>
          <!-- Replace the p tag above with the actual image tag when you have the image -->
        </div>
        <div class="view-container" v-if="currentView === 'floorplan'">
          <p>Floorplan view content goes here.</p>
          <!-- Replace the p tag above with the actual image tag when you have the image -->
        </div>
        <div class="link-button">
          <button @click="navigateTo3DLandscape" class="btn btn-primary">Go to 3D Landscape</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'WaterMeterReading',
  data() {
    return {
      currentView: 'relation',
      hoveredDevice: null,
      waterReadings: [
        {
          device: 'Water Meter 1',
          flowRate: 12.5,
          usage: 450,
          pressure: 101,
          temperature: 20.5,
        },
        {
          device: 'Water Meter 2',
          flowRate: 10.3,
          usage: 300,
          pressure: 99,
          temperature: 21.0,
        },
        {
          device: 'Water Meter 3',
          flowRate: 14.8,
          usage: 520,
          pressure: 102,
          temperature: 19.8,
        },
        {
          device: 'Water Meter 4',
          flowRate: 11.1,
          usage: 410,
          pressure: 100,
          temperature: 20.0,
        },
      ],
    };
  },
  methods: {
    toggleView(view) {
      this.currentView = view;
    },
    navigateTo3DLandscape() {
      window.location.href = "https://your-3d-landscape-url.com";
    },
  },
};
</script>
<style scoped>
.container {
  max-width: 1200px;
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
</style>
