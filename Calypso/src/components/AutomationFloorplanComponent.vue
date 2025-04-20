<template>
  <div class="heatmap-container">
    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Floorplan - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img src="@/assets/Floorplan.jpg" alt="Floorplan" class="floorplan-image" />

      <!-- Static Circles -->
      <div v-for="(circle, index) in circles" :key="'static-' + circle.id" class="circle-container" :style="{
        top: circle.y + '%',
        left: circle.x + '%',
      }" @mouseenter="showValue(index, $event)" @mouseleave="hideValue">
        <div class="circle" :style="{
          borderColor: getRingColor(circle.temperature),
          backgroundColor: getRingBackgroundColor(circle.temperature)
        }"></div>
      </div>

      <!-- Dynamic Circles -->
      <div v-for="(circle, index) in dynamicCircles" :key="'dynamic-' + circle.id" class="circle-container" :style="{
        top: circle.y + '%',
        left: circle.x + '%',
      }" @mouseenter="showDynamicTooltip(index, $event)" @mouseleave="hideTooltip">
        <div class="circle" :style="{ borderColor: circle.onoffstate === 'ON' ? '#00FF00' : '#FF0000' }"></div>
      </div>

      <!-- Tooltip -->
      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
        <div class="tooltip-header">
          <span>{{ tooltip.title }}</span>
        </div>
        <div class="tooltip-content">
          <p v-if="tooltip.dailyUsage !== undefined">Usage (Daily): {{ tooltip.dailyUsage }} kWh</p>
          <p v-if="tooltip.onoffstate !== undefined">On/Off State: {{ tooltip.onoffstate }}</p>
          <p v-if="tooltip.signalstrength !== undefined">Signal Strength: {{ tooltip.signalstrength }}</p>
          <p v-if="tooltip.temperature !== undefined">Current Temperature: {{ tooltip.temperature }}°C</p>
          <p v-if="tooltip.setpoint !== undefined">Set Temperature: {{ tooltip.setpoint }}°C</p>
          <p v-if="tooltip.sensorlightstate !== undefined">Light State: {{ tooltip.sensorlightstate }}</p>
          <p v-if="tooltip.totalActivities !== undefined">Total Activities: {{ tooltip.totalActivities }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'HeatmapOverview',
  data() {
    return {
      selectedFloor: 'GE Canteen',
      // Hard‑coded static circles
      circles: [
        { id: 1,  x: 83,   y: 62,   title: 'Meter 1',  dailyUsage: 12.34, temperature: 21, setpoint: 24 },
        { id: 2,  x: 83,   y: 33,   title: 'Meter 2',  dailyUsage: 23.45, temperature: 22, setpoint: 23 },
        { id: 3,  x: 68.5, y: 62,   title: 'Meter 3',  dailyUsage: 34.56, temperature: 23, setpoint: 22 },
        { id: 4,  x: 68.5, y: 33,   title: 'Meter 4',  dailyUsage: 45.67, temperature: 24, setpoint: 21 },
        { id: 5,  x: 53,   y: 62,   title: 'Meter 5',  dailyUsage: 56.78, temperature: 25, setpoint: 20 },
        { id: 6,  x: 53,   y: 33,   title: 'Meter 6',  dailyUsage: 67.89, temperature: 26, setpoint: 22 },
        { id: 7,  x: 37,   y: 62,   title: 'Meter 7',  dailyUsage: 78.90, temperature: 27, setpoint: 23 },
        { id: 8,  x: 37,   y: 33,   title: 'Meter 8',  dailyUsage: 89.01, temperature: 28, setpoint: 24 },
        { id: 9,  x: 22,   y: 62,   title: 'Meter 9',  dailyUsage: 90.12, temperature: 29, setpoint: 25 },
        { id: 10, x: 22,   y: 33,   title: 'Meter 10', dailyUsage: 10.23, temperature: 20, setpoint: 22 }
      ],
      
      // Tooltip state
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: '',
        dailyUsage: null,
        temperature: null,
        setpoint: null,
        onoffstate: null,
        signalstrength: null,
        sensorlightstate: null,
        totalActivities: null
      }
    };
  },
  methods: {
    // Ring border color by temperature
    getRingColor(temp) {
      if (temp <= 20) return '#00FF00';
      if (temp <= 23) return '#0000FF';
      return '#FF0000';
    },
    // Ring fill color by temperature
    getRingBackgroundColor(temp) {
      if (temp <= 20) return 'rgba(0,255,0,0.2)';
      if (temp <= 23) return 'rgba(0,0,255,0.2)';
      return 'rgba(255,0,0,0.2)';
    },
    // Show tooltip for static circles
    showValue(idx, evt) {
      const c = this.circles[idx];
      this.tooltip = {
        visible: true,
        x: evt.clientX + 10,
        y: evt.clientY + 10,
        title: c.title,
        dailyUsage: c.dailyUsage,
        temperature: c.temperature,
        setpoint: c.setpoint
      };
    },
    // Show tooltip for dynamic circles
    showDynamicTooltip(idx, evt) {
      const c = this.dynamicCircles[idx];
      this.tooltip = {
        visible: true,
        x: evt.clientX + 10,
        y: evt.clientY + 10,
        title: c.title,
        onoffstate: c.onoffstate,
        signalstrength: c.signalstrength,
        sensorlightstate: c.sensorlightstate,
        totalActivities: c.totalActivities
      };
    },
    // Hide both tooltips
    hideValue() { this.tooltip.visible = false; },
    hideTooltip() { this.tooltip.visible = false; }
  }
};
</script>


<style scoped>
.heatmap-container {
  border: 2px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f1f1f1;
  border-bottom: 1px solid #ddd;
}

.toolbar-item {
  margin: 5px;
}

.heatmap-title-bar {
  background-color: rgba(184, 184, 184, 0.1);
  color: black;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
}

.heatmap-floorplan {
  position: relative;
  width: 100%;
  height: auto;
}

.floorplan-image {
  display: block;
  width: 100%;
  height: auto;
}

.circle-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.circle {
  width: 20px;
  height: 20px;
  border: 2px solid;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.circle-container:hover .circle {
  transform: scale(1.1);
  box-shadow: 0 0 15px currentColor;
}

.view-button {
  background-color: #f0f0f0;
  color: #333;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  margin-top: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.circle-container:hover .view-button {
  opacity: 1;
}

.value-tooltip {
  position: fixed;
  background-color: white;
  color: black;
  padding: 0;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.tooltip-header {
  background-color: #ff9800;
  color: white;
  padding: 8px 12px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  font-weight: bold;
}

.tooltip-content {
  padding: 8px 12px;
}

.tooltip-content p {
  margin: 4px 0;
  color: #333;
}
</style>
