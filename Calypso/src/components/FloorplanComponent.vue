<template>
  <div class="heatmap-container">
    <!-- Toolbar Section -->
    <div class="toolbar">
      <div class="toolbar-item">
        <label>
          <input type="checkbox" v-model="autoRefresh" disabled />
          Auto refresh
        </label>
      </div>

      <div class="toolbar-item">
        <label for="floor-selection">Choose Floor:</label>
        <select id="floor-selection" v-model="selectedFloor" disabled>
          <option>Location A</option>
        </select>
      </div>

      <!-- Static Start/End dates -->
      <div class="toolbar-item">
        <label for="start-date">Start Date:</label>
        <input type="date" id="start-date" v-model="startDate" disabled />
      </div>
      <div class="toolbar-item">
        <label for="end-date">End Date:</label>
        <input type="date" id="end-date" v-model="endDate" disabled />
      </div>
    </div>

    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Heatmap Distribution Chart - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img src="@/assets/Floorplan.jpg" alt="Floorplan" class="floorplan-image" />
      <div
        v-for="(circle, index) in circles"
        :key="circle.id"
        class="circle"
        :style="{ top: circle.y + '%', left: circle.x + '%' , borderColor: getColorForUsage(circle.dailyUsage) }"
        @mouseenter="showValue(index, $event)"
        @mouseleave="hideValue"
      ></div>

      <div
        v-if="tooltip.visible"
        class="value-tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        <h5>{{ tooltip.title }}</h5>
        <p>Usage (Daily): {{ tooltip.dailyUsage }} kWh</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      autoRefresh: false,
      selectedFloor: 'Location A',
      startDate: '2025-04-18',
      endDate: '2025-04-18',
      circles: [
        { id: 1, x: 82, y: 60, title: 'Meter 1', dailyUsage: 12.3 },
        { id: 2, x: 82, y: 31, title: 'Meter 2', dailyUsage: 8.7 },
        { id: 3, x: 68, y: 60, title: 'Meter 3', dailyUsage: 0.0 },
        { id: 4, x: 68, y: 31, title: 'Meter 4', dailyUsage: 10.2 },
        { id: 5, x: 52, y: 60, title: 'Meter 5', dailyUsage: 15.4 },
        { id: 6, x: 52, y: 31, title: 'Meter 6', dailyUsage: 9.8 },
        { id: 7, x: 37, y: 60, title: 'Meter 7', dailyUsage: 7.6 },
        { id: 8, x: 37, y: 31, title: 'Meter 8', dailyUsage: 5.1 },
        { id: 9, x: 21, y: 60, title: 'Meter 9', dailyUsage: 11.0 },
        { id: 10, x: 21, y: 31, title: 'Meter 10', dailyUsage: 14.2 }
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: '',
        dailyUsage: 0
      }
    };
  },
  methods: {
    // Determine circle color by usage: high usage red, low usage green, mid yellow
    getColorForUsage(value) {
      if (value >= 12) return 'red';
      if (value <= 5) return 'green';
      return 'yellow';
    },
    showValue(index, event) {
      this.tooltip.visible = true;
      this.tooltip.x = event.clientX + 10;
      this.tooltip.y = event.clientY + 10;
      this.tooltip.title = this.circles[index].title;
      this.tooltip.dailyUsage = this.circles[index].dailyUsage;
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
  background-color: #f9f9f9;
  max-width: 1200px;
  margin: 20px auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding-top: 5%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f1f1f1;
  border-bottom: 1px solid #ddd;
}

.toolbar-item label {
  margin-right: 8px;
}

.heatmap-title-bar {
  background-color: rgba(184, 184, 184, 0.1);
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
}

.heatmap-floorplan {
  position: relative;
}

.floorplan-image {
  width: 100%;
  height: auto;
  display: block;
}

.circle {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid yellow;
  border-radius: 50%;
  cursor: pointer;
}

.value-tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
}
</style>