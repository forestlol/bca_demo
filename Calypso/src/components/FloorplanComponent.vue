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
          <option>GE Canteen</option>
          <option>Floor 2</option>
          <option>Floor 3</option>
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
      Heatmap Distribution Chart - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img src="@/assets/Floorplan.jpg" alt="Floorplan" class="floorplan-image" />
      <div v-for="(circle, index) in circles" :key="circle.id" class="circle"
        :style="{ top: circle.y + '%', left: circle.x + '%' }" @mouseenter="showValue(index, $event)"
        @mouseleave="hideValue"></div>
      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
        <h5>{{ tooltip.title }}</h5>
        <p>Usage (Daily): {{ tooltip.dailyUsage }} kWh</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    return {
      autoRefresh: false,
      selectedFloor: "GE Canteen",
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
  mounted() {
    this.fetchComparisonData(); // Trigger fetch on page load
  },
  methods: {
    fetchComparisonData() {
      const meterSNs = [
        "24112209220004", "24060404690001", "24060410030004",
        "24061901790001", "24060410030003", "24060410030002",
        "24060404690002", "24112209220002", "24112209220003",
        "24112209220006", "24112209220005"
      ];

      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(0, 0, 0, 0); // Start of today
      const endTime = new Date(now); // Current time today

      axios.get("https://geibms.com/message_history")
        .then((response) => {
          const rawData = response.data.message_history;

          // Filter and process data for each meterSN
          const aggregatedDataBySensor = {};

          meterSNs.forEach((meterSN) => {
            const sensorData = rawData
              .filter((entry) => {
                const entryTime = this.parseCustomDatetime(entry.datatime);
                return (
                  entry.meterSN === meterSN &&
                  entryTime >= startTime &&
                  entryTime <= endTime
                );
              })
              .sort((a, b) => new Date(a.datatime) - new Date(b.datatime)) // Sort data chronologically
              .map((entry) => {
                const time = this.parseCustomDatetime(entry.datatime);
                return { time, value: parseFloat(entry.EPI) };
              });

            // Calculate today's usage
            let dailyUsage = 0;
            for (let i = 1; i < sensorData.length; i++) {
              const current = sensorData[i].value;
              const previous = sensorData[i - 1].value;
              let difference = current - previous;

              // Ignore outliers
              if (difference < -50 || difference > 50) {
                difference = 0;
              }

              // Special transformation for Lighting Meter
              if (meterSN === "24112209220004") {
                difference = (difference / 10) * 48;
              }

              dailyUsage += Math.abs(difference);
            }

            aggregatedDataBySensor[meterSN] = dailyUsage.toFixed(2); // Store the aggregated daily usage
          });

          // Update circle data with daily usage values
          this.circles.forEach((circle) => {
            const meterUsage = aggregatedDataBySensor[circle.meterId];
            circle.dailyUsage = meterUsage ? meterUsage : "0.00"; // Default to 0.00 if no data
          });

          console.log("Updated Circle Data for Today:", this.circles);
        })
        .catch((error) => console.error("Error fetching comparison data:", error));
    },

    calculateDailyUsage(data) {
      console.log(data);
      const sortedData = data.sort((a, b) => new Date(a.datatime) - new Date(b.datatime));

      let dailyUsage = 0;
      for (let i = 1; i < sortedData.length; i++) {
        const current = parseFloat(sortedData[i].EPI);
        const previous = parseFloat(sortedData[i - 1].EPI);
        if (!isNaN(current) && !isNaN(previous)) {
          dailyUsage += current - previous > 0 ? current - previous : 0; // Avoid negative values
        }
      }
      return dailyUsage.toFixed(2); // Return daily usage in kWh
    },
    parseCustomDatetime(datetime) {
      const year = parseInt(datetime.slice(0, 4), 10);
      const month = parseInt(datetime.slice(4, 6), 10) - 1; // Months are 0-indexed
      const day = parseInt(datetime.slice(6, 8), 10);
      const hours = parseInt(datetime.slice(8, 10), 10);
      const minutes = parseInt(datetime.slice(10, 12), 10);
      const seconds = parseInt(datetime.slice(12, 14), 10);
      return new Date(year, month, day, hours, minutes, seconds);
    },
    showValue(index, event) {
      this.tooltip.visible = true;
      this.tooltip.x = event.clientX + 15; // Offset for visibility
      this.tooltip.y = event.clientY + 15;
      this.tooltip.title = this.circles[index].title;
      this.tooltip.dailyUsage = this.circles[index].dailyUsage;
    },
    hideValue() {
      this.tooltip.visible = false;
    },
  },
};

</script>
<style scoped>
.heatmap-container {
  padding-top: 65px;
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
