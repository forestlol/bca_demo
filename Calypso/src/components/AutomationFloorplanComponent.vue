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
        { id: 1, x: 83, y: 62, title: "FCU 4", meterId: "24061901790001", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 2, x: 83, y: 33, title: "FCU 5", meterId: "24060404690001", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 3, x: 68.5, y: 62, title: "FCU 6", meterId: "24112209220002", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 4, x: 68.5, y: 33, title: "FCU 7", meterId: "24060410030002", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 5, x: 53, y: 62, title: "FCU 8", meterId: "24112209220006", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 6, x: 53, y: 33, title: "FCU 9", meterId: "24060404690002", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 7, x: 37, y: 62, title: "FCU 10", meterId: "24060410030003", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 8, x: 37, y: 33, title: "FCU 11", meterId: "24060410030004", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 9, x: 22, y: 62, title: "FCU 12", meterId: "24112209220003", dailyUsage: 0, temperature: null, setpoint: null },
        { id: 10, x: 22, y: 33, title: "FCU 13", meterId: "24112209220005", dailyUsage: 0, temperature: null, setpoint: null },
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        dailyUsage: 0,
        temperature: null,
        setpoint: null,
      },
      temperatureRefreshInterval: null,
      temperatures: {},
      devices: [], // To store the fetched device list
      dynamicCircles: [], // Initialize dynamic circles
      sensorlightstate: "",
    };
  },
  mounted() {
    this.fetchDeviceList();
    this.fetchActivities();
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
    async fetchDeviceList() {
      const apiUrl = "https://b59a-111-65-75-129.ngrok-free.app/api/GetOverviewList";
      const params = {
        endpoint: "GetOverviewList",
        page: 1,
        pageSize: 20,
        MacID: "0",
        DeviceID: "0",
        keyword: "",
      };

      try {
        const response = await axios.post(apiUrl, params, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.code === 1) {
          console.log("Device List:", response.data.data);
          this.devices = response.data.data;

          // Fetch activities for all DeviceIDs
          const activityRequests = this.devices.map((device) => this.fetchActivities(device.DeviceID));
          const activities = await Promise.all(activityRequests);

          // Map devices and activities to dynamicCircles
          this.dynamicCircles = this.devices.map((device, index) => {
            const sensorlightstate = parseInt(device.State?.sensorlightstate, 10); // Convert to integer
            let sensorlightStateText = "Unknown";

            // Map numeric sensor light state to text
            switch (sensorlightstate) {
              case 0:
                sensorlightStateText = "Auto OFF";
                break;
              case 1:
                sensorlightStateText = "Sensor Mode";
                break;
              case 2:
                sensorlightStateText = "Busy Mode";
                break;
              case 3:
                sensorlightStateText = "Silent Mode";
                break;
              default:
                sensorlightStateText = "Unknown";
            }

            // Find activities for the current device
            const deviceActivities = activities.find((activity) => activity.DeviceID === device.DeviceID) || {};

            return {
              id: `dynamic-${index + 1}`,
              x: 15.5 + index * 15, // Spread circles horizontally
              y: 50 + Math.floor(index / 5) * 20, // Stack circles vertically
              title: device.Alias || `Zone ${index + 1}`,
              onoffstate: device.State?.onoffstate === 0 ? "ON" : "OFF",
              signalstrength: device.State?.signalstrength || "Unknown",
              sensorlightstate: sensorlightStateText,
              totalActivities: deviceActivities.totalActivities || 0,
            };
          });

          console.log("Dynamic Circles with Activities:", this.dynamicCircles);
        } else {
          console.error("API Error:", response.data.msg || "Failed to fetch devices.");
        }
      } catch (err) {
        console.error("An error occurred while fetching devices:", err);
      }
    },

    async fetchActivities(DeviceID) {
      const apiUrl = "https://b59a-111-65-75-129.ngrok-free.app/api/GetMinuteTrend";
      const params = {
        endpoint: "GetMinuteTrend",
        page: 1,
        pageSize: 20,
        MacID: "0",
        DeviceID: DeviceID,
        keyword: "",
      };

      try {
        const response = await axios.post(apiUrl, params, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.code === 1) {
          const data = response.data.data;

          // Calculate total activities by summing up the lengths of xData arrays
          const totalActivities =
            (data?.xData1?.length || 0) +
            (data?.xData2?.length || 0) +
            (data?.xData3?.length || 0) +
            (data?.xData4?.length || 0);

          return {
            DeviceID: DeviceID,
            totalActivities: totalActivities,
          };
        } else {
          console.error(`API Error for DeviceID ${DeviceID}:`, response.data.msg || "Failed to fetch activities.");
          return { DeviceID: DeviceID, totalActivities: 0 };
        }
      } catch (err) {
        console.error(`Error fetching activities for DeviceID ${DeviceID}:`, err);
        return { DeviceID: DeviceID, totalActivities: 0 };
      }
    },

    showDynamicTooltip(index, event) {
      const circle = this.dynamicCircles[index];
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY + 10,
        title: circle.title,
        onoffstate: circle.onoffstate,
        signalstrength: circle.signalstrength,
        sensorlightstate: circle.sensorlightstate, // Add sensorlightstate to tooltip
        totalActivities: circle.totalActivities, // Add total activities to tooltip
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
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
        const response = await axios.get('https://ge-aircon.ngrok.app/trigger_read_all', {
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });

        const data = response.data;
        const tempValues = {};
        const setpointValues = {};

        const portToFcu = {
          'COM5': 'FCU 4',
          'COM6': 'FCU 5',
          'COM7': 'FCU 6',
          'COM8': 'FCU 7',
          'COM9': 'FCU 8',
          'COM11' : 'FCU 10',
          'COM10': 'FCU 9',
          'COM12' : 'FCU 11',
          'COM13' : 'FCU 12',
          'COM14' : 'FCU 13'
        };

        data.forEach(item => {
          if (item && item.data && Array.isArray(item.data) && portToFcu[item.port]) {
            const temperatureData = item.data.find(d => d.address === 8);
            const setpointData = item.data.find(d => d.address === 1);

            const temperature = temperatureData ? temperatureData.value : null;
            const setpoint = setpointData ? setpointData.value : null;

            tempValues[item.port] = temperature;
            setpointValues[item.port] = setpoint;
          }
        });

        // Update the temperatures object with both current temp and setpoint
        Object.keys(portToFcu).forEach(port => {
          const fcu = portToFcu[port];
          this.temperatures[fcu] = {
            current: tempValues[port],
            setpoint: setpointValues[port]
          };
        });

      } catch (error) {
        console.error('Error fetching temperature data:', error);
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
      const fcuData = this.temperatures[circle.title] || {};
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY + 10,
        title: circle.title,
        dailyUsage: circle.dailyUsage,
        temperature: fcuData.current,
        setpoint: fcuData.setpoint,
      };
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
