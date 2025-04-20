<template>
  <div class="heatmap-container">
    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Floorplan - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img src="@/assets/Floorplan2.jpg" alt="Floorplan" class="floorplan-image" />
      <div v-for="(circle, index) in circles" :key="circle.id" class="circle" :style="{
        top: circle.y + '%',
        left: circle.x + '%',
        width: (circle.size || 20) + 'px',
        height: (circle.size || 20) + 'px',
        borderColor: circle.color || 'lightgreen'
      }" @mouseenter="showValue(index, $event)" @mouseleave="hideValue"></div>
      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
        <h5>{{ tooltip.title }}</h5>
        <p>Usage (Daily): {{ tooltip.dailyUsage }} kWh</p>
        <p>Activities: {{ tooltip.activityCount }}</p>
        <p>State: {{ tooltip.onoffState === 1 ? 'On' : 'Off' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FloorplanHeatmap',
  data() {
    return {
      selectedFloor: "GE Canteen",
      circles: [
        { id: 1, x: 79, y: 46, title: "Zone 1", dailyUsage: 15.2, activityCount: 5, onoffState: 1, color: "green", size: 24 },
        { id: 2, x: 64, y: 46, title: "Zone 2", dailyUsage:  8.7, activityCount: 2, onoffState: 0, color: "blue",  size: 20 },
        { id: 3, x: 48, y: 46, title: "Zone 3", dailyUsage: 22.5, activityCount: 9, onoffState: 1, color: "orange",size: 32 },
        { id: 4, x: 32, y: 46, title: "Zone 4", dailyUsage:  0.0, activityCount: 0, onoffState: 0, color: "blue",  size: 20 },
        { id: 5, x: 17, y: 46, title: "Zone 5", dailyUsage: 30.1, activityCount:12, onoffState: 1, color: "red",   size: 40 }
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        dailyUsage: 0,
        activityCount: 0,
        onoffState: 0
      }
    };
  },
  methods: {
    showValue(index, event) {
      const c = this.circles[index];
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY + 10,
        title: c.title,
        dailyUsage: c.dailyUsage,
        activityCount: c.activityCount,
        onoffState: c.onoffState
      };
    },
    hideValue() {
      this.tooltip.visible = false;
    }
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

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: transparent;
  border: 2px solid lightgreen;
  border-radius: 50%;
  cursor: pointer;
}

.value-tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 10;
  text-align: left;
  pointer-events: none;
  white-space: nowrap;
}
</style>
