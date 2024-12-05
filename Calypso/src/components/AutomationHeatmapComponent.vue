<template>
  <div class="heatmap-container">
    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Floorplan - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img src="@/assets/Floorplan2.jpg" alt="Floorplan" class="floorplan-image" />
      <div v-for="(circle, index) in circles" :key="circle.id" class="circle"
        :style="{ top: circle.y + '%', left: circle.x + '%' }" @mouseenter="showValue(index, $event)"
        @mouseleave="hideValue"></div>
      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
        <h5>{{ tooltip.title }}</h5>
        <p>Usage (Daily): {{ tooltip.dailyUsage }} kWh</p>
        <p>Activities: {{ tooltip.activityCount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFloor: "GE Canteen",
      circles: [
        { id: 1, x: 79, y: 46, title: "Area 1", meterId: "24061901790001", dailyUsage: 12.3, activityCount: 18 },
        { id: 2, x: 64, y: 46, title: "Area 2", meterId: "24060404690001", dailyUsage: 9.8, activityCount: 25 },
        { id: 3, x: 48, y: 46, title: "Area 3", meterId: "24112209220002", dailyUsage: 7.6, activityCount: 13 },
        { id: 4, x: 32, y: 46, title: "Area 4", meterId: "24060410030002", dailyUsage: 14.2, activityCount: 30 },
        { id: 5, x: 17, y: 46, title: "Area 5", meterId: "24112209220006", dailyUsage: 10.4, activityCount: 22 },
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        dailyUsage: 0,
        activityCount: 0,
      },
    };
  },
  methods: {
    showValue(index, event) {
      const circle = this.circles[index];
      this.tooltip.visible = true;
      this.tooltip.x = event.clientX + 15; // Offset for visibility
      this.tooltip.y = event.clientY + 15;
      this.tooltip.title = circle.title;
      this.tooltip.dailyUsage = circle.dailyUsage;
      this.tooltip.activityCount = circle.activityCount;
    },
    hideValue() {
      this.tooltip.visible = false;
    },
  },
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
