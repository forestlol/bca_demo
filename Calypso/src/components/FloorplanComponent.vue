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
        </select>
      </div>

      <!-- NEW: Start/End date pickers -->
      <div class="toolbar-item">
        <label for="start-date">Start Date:</label>
        <input type="date" id="start-date" v-model="startDate" />
      </div>
      <div class="toolbar-item">
        <label for="end-date">End Date:</label>
        <input type="date" id="end-date" v-model="endDate" />
      </div>

      <!-- Button to trigger data fetch
      <div class="toolbar-item">
        <button @click="fetchComparisonData">Refresh</button>
      </div> -->
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

      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
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
      startDate: "", // <-- new
      endDate: "",   // <-- new
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
      fcuToPort: {
        "FCU 4": "COM5",
        "FCU 5": "COM6",
        "FCU 6": "COM7",
        "FCU 7": "COM8",
        "FCU 8": "COM9",
        "FCU 9": "COM10",
        "FCU 10": "COM6", // Duplicated from FCU 6
        "FCU 11": "COM7", // Duplicated from FCU 7
        "FCU 12": "COM8", // Duplicated from FCU 8
        "FCU 13": "COM9"  // Duplicated from FCU 9
      }
    };
  },
  mounted() {
    this.fetchComparisonData(); // Trigger fetch on page load
    this.fetchAllTemperatureData();
    // Optionally, set up auto refresh if enabled:
    if (this.autoRefresh) {
      setInterval(() => {
        this.fetchAllTemperatureData();
      }, 60000); // refresh every minute
    }
  },
  methods: {
    fetchAllTemperatureData() {
      // Fetch temperature data for all FCUs from the aircon API.
      axios
        .get("https://ge-aircon.ngrok.app/trigger_read_all", {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        })
        .then((response) => {
          const data = response.data;
          if (!Array.isArray(data)) {
            console.error("Unexpected response format:", data);
            return;
          }
          // For each FCU circle, match using the fcuToPort mapping.
          this.circles.forEach((circle) => {
            const port = this.fcuToPort[circle.title];
            if (!port) return;
            // Find the FCU data corresponding to this port.
            const fcuData = data.find((item) => item.port === port);
            if (fcuData && Array.isArray(fcuData.data)) {
              // Assume the temperature reading is at address 8.
              const tempData = fcuData.data.find((d) => d.address === 8);
              if (tempData) {
                circle.temperature = tempData.value;
              } else {
                console.warn(`No temperature data (address 8) for ${circle.title}`);
              }
            } else {
              console.warn(`No data found for port ${port} (${circle.title})`);
            }
          });
          console.log("Updated circles with temperature:", this.circles);
        })
        .catch((error) => {
          console.error("Error fetching temperature data:", error);
        });
    },
    // This method returns a color based on the temperature value.
    // Temperatures ≥26°C return red, ≤22°C return green, and in between return yellow.
    getColorForTemperature(temp) {
      if (temp == null || isNaN(temp)) return "gray";
      if (temp >= 26) return "red";
      if (temp <= 22) return "green";
      return "yellow";
    },
    fetchComparisonData() {
      // Create base URL
      let url = "https://geibms.com/message_history";

      // If the user picked both startDate and endDate, append query params
      if (this.startDate && this.endDate) {
        // Convert "YYYY-MM-DD" -> "YYYYMMDD"
        const startParam = this.startDate.replace(/-/g, "");
        const endParam = this.endDate.replace(/-/g, "");
        url += `?start=${startParam}&end=${endParam}`;
      }

      // Now fetch data from this (possibly modified) URL
      axios
        .get(url)
        .then((response) => {
          const rawData = response.data.message_history;

          // Filter and process data for each meterSN
          const meterSNs = [
            "24112209220004", "24060404690001", "24060410030004",
            "24061901790001", "24060410030003", "24060410030002",
            "24060404690002", "24112209220002", "24112209220003",
            "24112209220006", "24112209220005"
          ];

          const now = new Date();
          const startTime = new Date(now);
          startTime.setHours(0, 0, 0, 0);
          const endTime = new Date(now);

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
              .sort((a, b) => new Date(a.datatime) - new Date(b.datatime))
              .map((entry) => {
                const time = this.parseCustomDatetime(entry.datatime);
                return { time, value: parseFloat(entry.EPI) };
              });

            // Calculate today's usage
            let dailyUsage = 0;
            for (let i = 1; i < sensorData.length; i++) {
              let difference = sensorData[i].value - sensorData[i - 1].value;

              // Ignore outliers
              if (difference < -50 || difference > 50) {
                difference = 0;
              }

              // Example transformation for a special meter
              if (meterSN === "24112209220004") {
                difference = (difference / 10) * 48;
              }

              dailyUsage += Math.abs(difference);
            }

            aggregatedDataBySensor[meterSN] = dailyUsage.toFixed(2);
          });

          // Update circle data with daily usage
          this.circles.forEach((circle) => {
            const meterUsage = aggregatedDataBySensor[circle.meterId];
            circle.dailyUsage = meterUsage ? meterUsage : "0.00";
          });

          console.log("Updated Circle Data:", this.circles);
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
      this.tooltip.temperature = this.circles[index].temperature;
    },
    hideValue() {
      this.tooltip.visible = false;
    },
  },
  watch: {
    startDate() {
      this.fetchComparisonData();
    },
    // Watch endDate changes
    endDate() {
      this.fetchComparisonData();
    },
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
  display: flex;
  align-items: center;
}

.toolbar-item label {
  margin-right: 5px;
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
  width: 102%;
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
