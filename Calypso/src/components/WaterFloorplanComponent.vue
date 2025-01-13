<template>
  <div class="heatmap-container">
    <!-- Toolbar Section -->
    <div class="toolbar">
      <div class="toolbar-item">
        <label>
          <input type="checkbox" v-model="autoRefresh" />
          Auto refresh
        </label>
      </div>
      <div class="toolbar-item">
        <label for="floor-selection">Choose Floor:</label>
        <select id="floor-selection" v-model="selectedFloor">
          <option>-</option>
        </select>
      </div>
      <div class="toolbar-item">
        <label>Statistical time:</label>
        <input type="datetime-local" v-model="startDateTime" />
        <span>to</span>
        <input type="datetime-local" v-model="endDateTime" />
      </div>
      <div class="toolbar-item">
        <button @click="fetchComparisonData">🔍 Search</button>
      </div>
    </div>

    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Water Meter Pin Location - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img :src="waterMapImage" alt="Floorplan" class="floorplan-image" />
    </div>
  </div>
</template>

<script>

export default {
  data() {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    return {
      autoRefresh: false,
      selectedFloor: "-",
      startDateTime: yesterday.toISOString().slice(0, 16),
      endDateTime: now.toISOString().slice(0, 16),
      circles: [
        { id: 1, x: 82, y: 60, title: "FCU 4", meterId: "24061901790001", dailyUsage: 0 },
        { id: 2, x: 82, y: 31, title: "FCU 5", meterId: "24060404690001", dailyUsage: 0 },
        { id: 3, x: 68, y: 60, title: "FCU 6", meterId: "24112209220002", dailyUsage: 0 },
        { id: 4, x: 68, y: 31, title: "FCU 7", meterId: "24060410030002", dailyUsage: 0 },
        { id: 5, x: 52, y: 60, title: "FCU 8", meterId: "24112209220006", dailyUsage: 0 },
        { id: 6, x: 52, y: 31, title: "FCU 9", meterId: "24060404690002", dailyUsage: 0 },
        { id: 7, x: 37, y: 60, title: "FCU 10", meterId: "24060410030003", dailyUsage: 0 },
        { id: 8, x: 37, y: 31, title: "FCU 11", meterId: "24060410030004", dailyUsage: 0 },
        { id: 9, x: 21, y: 60, title: "FCU 12", meterId: "24112209220003", dailyUsage: 0 },
        { id: 10, x: 21, y: 31, title: "FCU 13", meterId: "24112209220005", dailyUsage: 0 },
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        dailyUsage: 0,
      },
    };
  },
  computed: {
    waterMapImage() {
      return require("@/assets/WaterMap.png");
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

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: transparent;
  border: 2px solid yellow;
  border-radius: 50%;
  cursor: pointer;
}

.value-tooltip {
  position: fixed;
  /* Make tooltip follow the mouse */
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 10;
  text-align: left;
  pointer-events: none;
  /* Prevent tooltip from interfering with mouse events */
  white-space: nowrap;
}
</style>
