<template>
  <div class="heatmap-container">
    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Floorplan - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img src="@/assets/Floorplan.jpg" alt="Floorplan" class="floorplan-image" />
      <div v-for="(circle, index) in circles" :key="circle.id" class="circle-container"
        :style="{ 
          top: circle.y + '%', 
          left: circle.x + '%',
        }"
        @mouseenter="showValue(index, $event)"
        @mouseleave="hideValue">
        <div class="circle" :style="{ 
          borderColor: getRingColor(circle.temperature),
          backgroundColor: getRingBackgroundColor(circle.temperature)
        }"></div>
      </div>
      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
        <div class="tooltip-header">
          <span>Binding device: {{ tooltip.title }}</span>
        </div>
        <div class="tooltip-content">
          <p>Usage (Daily): {{ tooltip.dailyUsage }} kWh</p>
          <p>Status: {{ getStatus(tooltip.temperature) }}</p>
          <p>Temperature: {{ tooltip.temperature }}°C</p>
        </div>
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
        { id: 1, x: 83, y: 62, title: "FCU 4", meterId: "24061901790001", dailyUsage: 0, temperature: null },
        { id: 2, x: 83, y: 33, title: "FCU 5", meterId: "24060404690001", dailyUsage: 0, temperature: null },
        { id: 3, x: 68.5, y: 62, title: "FCU 6", meterId: "24112209220002", dailyUsage: 0, temperature: null },
        { id: 4, x: 68.5, y: 33, title: "FCU 7", meterId: "24060410030002", dailyUsage: 0, temperature: null },
        { id: 5, x: 53, y: 62, title: "FCU 8", meterId: "24112209220006", dailyUsage: 0, temperature: null },
        { id: 6, x: 53, y: 33, title: "FCU 9", meterId: "24060404690002", dailyUsage: 0, temperature: null },
        { id: 7, x: 37, y: 62, title: "FCU 10", meterId: "24060410030003", dailyUsage: 0, temperature: null },
        { id: 8, x: 37, y: 33, title: "FCU 11", meterId: "24060410030004", dailyUsage: 0, temperature: null },
        { id: 9, x: 22, y: 62, title: "FCU 12", meterId: "24112209220003", dailyUsage: 0, temperature: null },
        { id: 10, x: 22, y: 33, title: "FCU 13", meterId: "24112209220005", dailyUsage: 0, temperature: null },
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        dailyUsage: 0,
        temperature: null,
      },
      temperatureRefreshInterval: null,
    };
  },
  mounted() {
    this.fetchComparisonData(); // Trigger fetch on page load
    this.fetchTemperatureData(); // Fetch initial temperature data
    
    // Set up interval to refresh temperature data every 30 seconds
    this.temperatureRefreshInterval = setInterval(() => {
      this.fetchTemperatureData();
    }, 30000);
  },
  beforeUnmount() {
    // Clear the interval when component is destroyed
    if (this.temperatureRefreshInterval) {
      clearInterval(this.temperatureRefreshInterval);
    }
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
    async fetchTemperatureData() {
      try {
        const response = await axios.get('https://helping-fish-current.ngrok-free.app/trigger_read_all', {
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        let data = response.data;
        console.log('API Response:', data);
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array response from API, received:', typeof data);
          return;
        }
        
        // Map COM ports to FCU numbers
        const portToFcu = {
          'COM5': 'FCU 4',
          'COM6': 'FCU 5',
          'COM7': 'FCU 6',
          'COM8': 'FCU 7',
          'COM9': 'FCU 8',
          'COM10': 'FCU 9'
        };

        // Store temperature values for duplication
        const tempValues = {};

        // First pass: get temperature values from original FCUs
        data.forEach(item => {
          if (item && item.data && Array.isArray(item.data) && portToFcu[item.port]) {
            const temperatureData = item.data.find(d => d.address === 8);
            const temperature = temperatureData ? temperatureData.value : null;
            tempValues[item.port] = temperature;
          }
        });

        // Map duplicated values
        const duplicateMapping = {
          'FCU 10': tempValues['COM6'], // Use COM6's value
          'FCU 11': tempValues['COM7'], // Use COM7's value
          'FCU 12': tempValues['COM8'], // Use COM8's value
          'FCU 13': tempValues['COM9']  // Use COM9's value
        };

        // Update temperatures for original FCUs
        this.circles.forEach(circle => {
          if (portToFcu[Object.keys(portToFcu).find(key => portToFcu[key] === circle.title)]) {
            // Original FCUs (4-9)
            const port = Object.keys(portToFcu).find(key => portToFcu[key] === circle.title);
            circle.temperature = tempValues[port];
          } else if (duplicateMapping[circle.title]) {
            // Duplicated FCUs (10-13)
            circle.temperature = duplicateMapping[circle.title];
          }
        });

      } catch (error) {
        console.error('Error fetching temperature data:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
      }
    },
    getRingColor(temperature) {
      if (temperature === null) return '#808080'; // Gray for no data
      
      // Optimization status colors
      if (temperature <= 20) return '#00FF00'; // Green for Optimized
      if (temperature <= 23) return '#0000FF'; // Blue for Partially Optimized
      return '#FF0000'; // Red for Not Optimized
    },
    getRingBackgroundColor(temperature) {
      if (temperature === null) return 'rgba(128, 128, 128, 0.2)'; // Gray for no data
      
      // Optimization status colors with transparency
      if (temperature <= 20) return 'rgba(0, 255, 0, 0.2)'; // Green for Optimized
      if (temperature <= 23) return 'rgba(0, 0, 255, 0.2)'; // Blue for Partially Optimized
      return 'rgba(255, 0, 0, 0.2)'; // Red for Not Optimized
    },
    getStatus(temperature) {
      if (temperature === null) return 'No Data';
      if (temperature <= 20) return 'Optimized';
      if (temperature <= 23) return 'Partially Optimized';
      return 'Not Optimized';
    },
    showValue(index, event) {
      const circle = this.circles[index];
      this.tooltip.visible = true;
      this.tooltip.x = event.clientX + 10;
      this.tooltip.y = event.clientY + 10;
      this.tooltip.title = circle.title;
      this.tooltip.dailyUsage = circle.dailyUsage;
      this.tooltip.temperature = circle.temperature;
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
