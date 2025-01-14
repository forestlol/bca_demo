<template>
  <div class="heatmap-container">
    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Water Meter Pin Location
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img :src="waterMapImage" alt="Floorplan" class="floorplan-image" />
      <!-- Circles for meters -->
      <div v-for="circle in circles" :key="circle.id" class="circle"
        :style="{ top: circle.y + '%', left: circle.x + '%' }" @mouseenter="showTooltip(circle)"
        @mouseleave="hideTooltip"></div>
      <!-- Tooltip -->
      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
        <p><strong>{{ tooltip.title }}</strong></p> <!-- Sheet Name -->
        <p>Device: {{ tooltip.deviceName }}</p> <!-- Device Name -->
        <p>Meter Reading: {{ tooltip.meterReading }} m³</p> <!-- Meter Reading -->
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  data() {
    return {
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
        meterReading: 0,
      },
    };
  },
  computed: {
    waterMapImage() {
      return require("@/assets/WaterMap.png");
    },
  },
  methods: {
    async fetchWaterMeterData() {
      try {
        const response = await fetch("/WaterMeterData.xlsx"); // Replace with the actual path
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const deviceReadings = {};
        const predefinedCoordinates = [
          { x: 10, y: 10 }, // Predefined coordinates for meter 1
          { x: 54.5, y: 46 }, // Predefined coordinates for meter 2
          { x: 60, y: 52 }, // done
          { x: 26.5, y: 82 }, // done
          { x: 50, y: 20 }, // done
          { x: 62.5, y: 20 }, // done
          { x: 56, y: 20 }, // done
          { x: 43, y: 20 }, // done
          { x: 69, y: 66 }, // done
          { x: 17, y: 47 }, // done
          { x: 63, y: 31 }, // done
          { x: 36, y: 20 }, // done
          { x: 68, y: 36 }, // done
          { x: 63, y: 27 }, // done
          { x: 42.5, y: 33 }, // done
          { x: 64, y: 74 }, // done
          { x: 20, y: 32 }, // done
          { x: 15, y: 75 }, // done
          { x: 23, y: 64 }, // done
          { x: 22.5, y: 52 }, // done
          { x: 65.5, y: 71 }, // done
        ];

        // Process each sheet (tab) in the workbook
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Skip if the sheet has no rows
          if (jsonData.length <= 1) {
            console.warn(`Skipping empty sheet: ${sheetName}`);
            return;
          }

          // Process the data row by row
          jsonData.slice(1).forEach((row, rowIndex) => {
            const [DeviceName, ReadingMeterTimeRaw, MeterReading] = [
              row[1], // Device Name
              row[10], // Reading Meter Time
              parseFloat(row[16]) || 0, // Meter Reading
            ];

            // Validate ReadingMeterTime
            const ReadingMeterTime = ReadingMeterTimeRaw ? new Date(ReadingMeterTimeRaw) : null;
            if (!ReadingMeterTime || isNaN(ReadingMeterTime.getTime())) {
              console.warn(`Skipping invalid date in sheet ${sheetName}, row ${rowIndex + 1}: ${ReadingMeterTimeRaw}`);
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
            deviceReadings[sheetName][DeviceName][readingDate] = MeterReading;
          });
        });

        // Generate circles data for all devices
        this.circles = Object.entries(deviceReadings).flatMap(([sheetName, devices], deviceIndex) => {
          return Object.entries(devices).map(([DeviceName, readings]) => {
            const sortedDates = Object.keys(readings).sort((a, b) => new Date(a) - new Date(b));
            const latestDate = sortedDates[sortedDates.length - 1];
            const latestReading = readings[latestDate] || 0;

            // Use predefined coordinates based on the index
            const coordinates = predefinedCoordinates[deviceIndex] || { x: 0, y: 0 };

            return {
              id: this.circles.length + 1,
              x: coordinates.x,
              y: coordinates.y,
              title: sheetName, // Use sheet name as the title
              deviceName: DeviceName, // Add device name
              meterReading: latestReading, // Use the latest reading
            };
          });
        });

        console.log("Processed circles with sheet titles and latest readings:", this.circles);
      } catch (error) {
        console.error("Error reading WaterMeterData.xlsx:", error);
      }
    },
    showTooltip(circle) {
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
  },
  mounted() {
    this.fetchWaterMeterData();
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

/* Tooltip styling */
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
