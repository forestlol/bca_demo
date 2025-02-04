<template>
  <div>
    <!-- Tabs Navigation -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'floorplan' }" @click="activeTab = 'floorplan'">
        Floorplan
      </button>
      <button :class="{ active: activeTab === 'devices' }" @click="activeTab = 'devices'">
        Devices
      </button>
    </div>

    <!-- Floorplan Tab Content -->
    <div v-if="activeTab === 'floorplan'" class="heatmap-container">
      <!-- Title Bar -->
      <div class="heatmap-title-bar">
        Water Meter Pin Location
      </div>

      <!-- Floorplan Section -->
      <div class="heatmap-floorplan">
        <img :src="waterMapImage" alt="Floorplan" class="floorplan-image" />
        <!-- Circles for meters -->
        <div v-for="circle in circles" :key="circle.id" class="circle"
          :style="{ top: circle.y + '%', left: circle.x + '%' }" @mouseenter="showTooltip(circle, $event)"
          @mouseleave="hideTooltip"></div>
        <!-- Tooltip -->
        <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
          <p><strong>{{ tooltip.title }}</strong></p>
          <p>Device: {{ tooltip.deviceName }}</p>
          <p>Meter Reading: {{ tooltip.meterReading }} m³</p>
        </div>
      </div>
    </div>

    <!-- Devices Tab Content -->
    <div v-if="activeTab === 'devices'" class="devices-container">
      <h2>Total Water Consumption: {{ totalWaterConsumption }} m³</h2>
      <h2>This Month: {{ currentDate }}</h2>

      <div v-if="loadingDevices" class="loading">
        Loading devices...
      </div>

      <div v-for="(devices, category) in categorizedDevices" :key="category" class="category">
        <h3>{{ category }}</h3>
        <div class="grid-container">
          <div v-for="device in devices" :key="device.id" class="grid-item">
            <strong>{{ device.device_name }}</strong>
            <p>Dev EUI: {{ device.dev_eui }}</p>
            <p>Total Consumption: <strong>{{ device.totalConsumption || "0.00" }} m³</strong></p>
          </div>
        </div>
      </div>

    </div>


  </div>
</template>

<script>
import * as XLSX from "xlsx";
import axios from "axios"; // Ensure axios is imported

export default {
  data() {
    return {

      currentDate: new Date().toLocaleDateString(),
      categorizedDevices: {
        "Cooling Tower": [
          { id: 1, dev_eui: "8254812403000465", device_name: "Cooling Tower 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 2, dev_eui: "8254812403000462", device_name: "Cooling Tower 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 3, dev_eui: "8254812403000482", device_name: "Cooling Tower 3", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 4, dev_eui: "8254812403000447", device_name: "Cooling Tower 4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 5, dev_eui: "8254812403000653", device_name: "Cooling Tower 5", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
        ],
        "Female Toilet": [
          { id: 6, dev_eui: "8254812403000643", device_name: "Female Toilet 4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 7, dev_eui: "8254812312000003", device_name: "Female Toilet 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 12, dev_eui: "8254812403000644", device_name: "Female Toilet 3", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
        ],
        "Male Toilet": [
          { id: 8, dev_eui: "8254812403000652", device_name: "Male Toilet 5", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 9, dev_eui: "8254812312000004", device_name: "Male Toilet 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 18, dev_eui: "8254812403000659", device_name: "Male Toilet 6", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 28, dev_eui: "8254812307000002", device_name: "Male Toilet 7", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 25, dev_eui: "8254812211000169", device_name: "Male Toilet 8", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
        ],
        "FPI": [
          { id: 10, dev_eui: "8254812403000632", device_name: "FPI-8", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 13, dev_eui: "8254812307000010", device_name: "FPI-6", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 14, dev_eui: "8254812403000528", device_name: "FPI-2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 15, dev_eui: "8254812403000578", device_name: "FPI-4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 16, dev_eui: "8254812307000004", device_name: "FPI-10", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 19, dev_eui: "8254812401000105", device_name: "FPI-5", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 20, dev_eui: "8254812307000005", device_name: "FPI-7", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 21, dev_eui: "8254812307000007", device_name: "FPI-9", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
        ],
        "Steam Clean": [
          { id: 11, dev_eui: "8254812211000168", device_name: "Steam Clean 3", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 17, dev_eui: "8254812403000432", device_name: "Steam Clean 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
        ],
        "Scrubber": [
          { id: 26, dev_eui: "8254812307000008", device_name: "Scrubber 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 27, dev_eui: "8254812307000014", device_name: "Scrubber 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
        ],
        "Other Devices": [
          { id: 22, dev_eui: "8254812401000104", device_name: "Salt Bath", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 23, dev_eui: "8254812307000009", device_name: "Chemical Line 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 24, dev_eui: "8254812307000003", device_name: "Kitchen", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 29, dev_eui: "8254812211000171", device_name: "Main 4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
          { id: 30, dev_eui: "8254812211000172", device_name: "Main 6", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
        ]
      },
      activeTab: "floorplan",
      circles: [
        { id: 1, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 2, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 3, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 4, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 5, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 6, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 7, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 8, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 9, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 10, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 11, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 12, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 13, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 14, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 15, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 16, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 17, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 18, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 19, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 20, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
        { id: 21, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 },
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        deviceName: "",
        meterReading: 0,
      },
      devices: [],
      loadingDevices: false,
    };
  },
  computed: {
    waterMapImage() {
      return require("@/assets/WaterMap.png");
    },
    totalWaterConsumption() {
      return this.devices.reduce((sum, device) => sum + (parseFloat(device.totalConsumption) || 0), 0).toFixed(2);
    },
    currentMonthDate() {
      const now = new Date();
      return now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }
  },
  watch: {
    devices: {
      deep: true,
      handler(newDevices) {
        console.log("Updated device data:", newDevices);
      }
    }
  },
  methods: {
    updateTotalWaterConsumption() {
      this.totalWaterConsumption = this.devices.reduce((sum, device) => sum + (parseFloat(device.totalConsumption) || 0), 0).toFixed(2);
      this.$forceUpdate();
    },
    async fetchWaterMeterData() {
      try {
        const response = await fetch("/WaterMeterData.xlsx"); // Replace with the actual path if needed
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const deviceReadings = {};
        const predefinedCoordinates = [
          { x: 10, y: 10 }, // Predefined coordinates for meter 1
          { x: 54.5, y: 46 }, // Predefined coordinates for meter 2
          { x: 60, y: 52 },
          { x: 26.5, y: 82 },
          { x: 50, y: 20 },
          { x: 62.5, y: 20 },
          { x: 56, y: 20 },
          { x: 43, y: 20 },
          { x: 69, y: 66 },
          { x: 17, y: 47 },
          { x: 63, y: 31 },
          { x: 36, y: 20 },
          { x: 68, y: 36 },
          { x: 63, y: 27 },
          { x: 42.5, y: 33 },
          { x: 64, y: 74 },
          { x: 20, y: 32 },
          { x: 15, y: 75 },
          { x: 23, y: 64 },
          { x: 22.5, y: 52 },
          { x: 65.5, y: 71 },
        ];

        // Process each sheet (tab) in the workbook
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Skip if the sheet has no rows
          if (jsonData.length <= 1) {
            return;
          }

          // Process the data row by row
          jsonData.slice(1).forEach((row) => {
            const [DeviceName, ReadingMeterTimeRaw, MeterReading] = [
              row[1], // Device Name
              row[10], // Reading Meter Time
              parseFloat(row[16]) || 0, // Meter Reading
            ];

            // Validate ReadingMeterTime
            const ReadingMeterTime = ReadingMeterTimeRaw
              ? new Date(ReadingMeterTimeRaw)
              : null;
            if (!ReadingMeterTime || isNaN(ReadingMeterTime.getTime())) {
              return;
            }

            const readingDate = ReadingMeterTime.toISOString().split("T")[0];

            // Organize readings by device
            if (!deviceReadings[sheetName]) {
              deviceReadings[sheetName] = {};
            }
            if (!deviceReadings[sheetName][DeviceName]) {
              deviceReadings[sheetName][DeviceName] = {};
            }
            deviceReadings[sheetName][DeviceName][readingDate] =
              MeterReading;
          });
        });

        // Generate circles data for all devices
        this.circles = Object.entries(deviceReadings).flatMap(
          ([sheetName, devices], deviceIndex) => {
            return Object.entries(devices).map(([DeviceName, readings]) => {
              const sortedDates = Object.keys(readings).sort(
                (a, b) => new Date(a) - new Date(b)
              );
              const latestDate = sortedDates[sortedDates.length - 1];
              const latestReading = readings[latestDate] || 0;

              // Use predefined coordinates based on the index
              const coordinates =
                predefinedCoordinates[deviceIndex] || { x: 0, y: 0 };

              return {
                id: this.circles.length + 1,
                x: coordinates.x,
                y: coordinates.y,
                title: sheetName, // Use sheet name as the title
                deviceName: DeviceName, // Add device name
                meterReading: latestReading, // Use the latest reading
              };
            });
          }
        );

        console.log(
          "Processed circles with sheet titles and latest readings:",
          this.circles
        );
      } catch (error) {
        console.error("Error reading WaterMeterData.xlsx:", error);
      }
    },
    showTooltip(circle, event) {
      const tooltipX = event.clientX + 10;
      const tooltipY = event.clientY + 10;

      this.tooltip = {
        visible: true,
        x: tooltipX,
        y: tooltipY,
        title: circle.title, // Sheet name
        deviceName: circle.deviceName, // Device name
        meterReading: circle.meterReading.toFixed(2), // Meter reading
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    fetchDevicesData() {
      this.loadingDevices = true;

      // Flatten categorized devices into a reactive array
      this.devices = Object.values(this.categorizedDevices).flat();

      console.log("Fetching data for devices:", this.devices);

      Promise.all(this.devices.map(device => this.fetchMetricsForDevice(device)))
        .then(() => {
          console.log("All device metrics fetched successfully.");
          this.loadingDevices = false;
        })
        .catch((error) => {
          console.error("Error fetching device metrics:", error);
          this.loadingDevices = false;
        });
    },
    fetchMetricsForDevice(device) {
      axios
        .get(`https://cb1a-119-234-9-157.ngrok-free.app/api/device_data/${device.id}`, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        })
        .then((response) => {
          console.log(`RAW Response for Device ${device.id}:`, response.data);

          // ✅ Ensure response contains 'data' and is an array
          if (!response.data || !response.data.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
            console.warn(`Invalid response format for device ${device.id}:`, response.data);
            return;
          }

          // ✅ Store ALL readings
          const readings = response.data.data.map(entry => ({
            meterReading: entry.meterReading || "N/A",
            measureMode: entry.measureMode || "N/A",
            batteryVoltage: entry.batteryVoltage || "N/A",
            valveStatus: entry.valveStatus || "N/A",
            timestamp: entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "N/A"
          }));

          // ✅ Assign all readings to the device (Reactively)
          Object.assign(device, {
            readings,  // Store multiple readings
            totalConsumption: readings.reduce((sum, entry) => sum + (parseFloat(entry.meterReading) || 0), 0).toFixed(2)
          });

          // ✅ Update total for all devices
          this.updateTotalWaterConsumption();
        })
        .catch((error) => {
          console.error(`Error fetching metrics for device ${device.id}:`, error);
        });
    }
  },
  mounted() {
    this.fetchWaterMeterData();
    // Fetch devices (and their metrics) once the component is mounted.
    this.fetchDevicesData();
  },
};
</script>

<style scoped>
/* Tabs Styles */
.tabs {
  display: flex;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  cursor: pointer;
  background-color: #f1f1f1;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 16px;
  transition: background-color 0.2s, border-bottom 0.2s;
}

.tabs button:hover {
  background-color: #e2e2e2;
}

.tabs button.active {
  border-bottom: 2px solid #007bff;
  font-weight: bold;
  background-color: #fff;
}

/* Floorplan & Tooltip Styles (existing) */
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

/* Devices Tab Styles */
.devices-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.device-card {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #fff;
}

.loading {
  text-align: center;
  font-size: 16px;
  padding: 20px;
}

.category {
  margin-bottom: 30px;
  text-align: center;
}

h3 {
  font-size: 24px;
  font-weight: bold;
  color: #1a237e;
  /* Dark blue to highlight the category */
  text-transform: uppercase;
  border-bottom: 3px solid #1e293b;
  display: inline-block;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* Ensures 3 columns */
  gap: 20px;
  /* More spacing between items */
  padding: 20px;
}

.grid-item {
  background: linear-gradient(145deg, #ffffff, #e3e3e3);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  border: 2px solid #1e293b;
}

.grid-item:hover {
  transform: scale(1.05);
  box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.2);
}

strong {
  font-size: 18px;
  color: #1e293b;
  /* Slightly darker blue for better contrast */
}

p {
  font-size: 14px;
  color: #424242;
  margin-top: 5px;
}

.header-container {
  text-align: center;
  background-color: #f1f1f1;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.header-container h2,
.header-container h4 {
  margin: 5px;
  color: #1a237e;
}

.highlight {
  color: #ff5722;
  font-weight: bold;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* 3 columns */
  gap: 20px;
  padding: 20px;
}

.grid-item {
  background: #ffffff;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  border: 2px solid #1e293b;
}

.grid-item:hover {
  transform: scale(1.05);
  box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.2);
}

.timestamp {
  font-size: 12px;
  color: gray;
  margin-top: 5px;
}
</style>
