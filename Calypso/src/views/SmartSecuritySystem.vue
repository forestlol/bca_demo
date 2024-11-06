<template>
  <div class="container-fluid mt-5">
    <h2 class="text-center mb-4">Smart Security System</h2>
    <div class="row">
      <div class="col-md-6">
        <div class="relation-section">
          <h4>Sensor Detection</h4>
          <div class="sensor-detection-diagram">
            <img src="@/assets/Untitled.png" alt="Relation View" class="relation-image">
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="map-section">
          <h4>Floorplan</h4>
          <div 
            class="map-container"
            @mousedown="startPan"
            @mousemove="pan"
            @mouseup="endPan"
            @mouseleave="endPan"
            @wheel="onWheel"
          >
            <img 
              src="@/assets/Untitled.png" 
              alt="Map View" 
              class="map-image"
              :style="{ transform: `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)` }"
            >
            <div class="zoom-controls">
              <button class="btn btn-secondary" @click="zoomIn">+</button>
              <button class="btn btn-secondary" @click="zoomOut">-</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-3" v-for="device in devices" :key="device.id">
        <div class="device-status-card">
          <h5>{{ device.name }}</h5>
          <p class="status" :class="{'text-success': device.isOnline, 'text-danger': !device.isOnline}">
            {{ device.isOnline ? 'Online' : 'Offline' }}
          </p>
          <p>Type: {{ device.type }}</p>
          <p>Last Updated: {{ device.lastUpdated }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmartSecuritySystem',
  data() {
    return {
      devices: [
        { id: 1, name: 'CCTV Camera 1', type: 'CCTV Camera', isOnline: true, lastUpdated: '2024-05-29 14:30:00' },
        { id: 2, name: 'CCTV Camera 2', type: 'CCTV Camera', isOnline: true, lastUpdated: '2024-05-29 14:30:00' },
        { id: 3, name: 'Motion Sensor 1', type: 'Motion Sensor', isOnline: true, lastUpdated: '2024-05-29 14:30:00' },
        { id: 4, name: 'Motion Sensor 2', type: 'Motion Sensor', isOnline: true, lastUpdated: '2024-05-29 14:30:00' }
      ],
      zoomLevel: 1,
      translateX: 0,
      translateY: 0,
      isPanning: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      animationFrame: null,
    };
  },
  methods: {
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
    },
    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1);
    },
    onWheel(event) {
      event.preventDefault();
      const delta = Math.sign(event.deltaY) * -0.1;
      this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, 1), 2);
    },
    startPan(event) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    },
    pan(event) {
      if (!this.isPanning) return;

      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;

      this.lastX = event.clientX;
      this.lastY = event.clientY;

      this.translateX += dx / this.zoomLevel;
      this.translateY += dy / this.zoomLevel;

      if (!this.animationFrame) {
        this.animationFrame = requestAnimationFrame(this.updatePan);
      }
    },
    updatePan() {
      this.$forceUpdate();
      this.animationFrame = null;
    },
    endPan() {
      this.isPanning = false;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    },
    navigateTo3DLandscape() {
      window.location.href = 'https://your-3d-landscape-url.com';
    },
  },
};
</script>

<style scoped>
.container-fluid {
  width: 100%;
  padding: 2rem;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
}

.row {
  display: flex;
  justify-content: space-between;
}

.relation-section, .map-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 100%;
}

.relation-image, .map-image {
  width: 100%;
  height: auto;
  transition: transform 0.1s ease-out;
}

.map-container {
  overflow: hidden;
  height: 100%;
  position: relative;
  cursor: grab;
}

.map-container:active {
  cursor: grabbing;
}

.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
}

.zoom-controls .btn {
  margin: 2px 0;
}

.device-status-card {
  background-color: #e9f7fd;
  padding: 15px;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.device-status-card h5 {
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.device-status-card .status {
  font-size: 1.5rem;
  font-weight: bold;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.link-button {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.link-button .btn {
  padding: 10px 20px;
  font-size: 1.25rem;
}
</style>
