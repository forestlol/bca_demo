<template>
  <div>
    <!-- Tabs Navigation (Centered) -->
    <nav class="tabs">
      <button :class="{ active: activeTab === 'floorplan' }" @click="activeTab = 'floorplan'" type="button">
        Floorplan
      </button>
      <button :class="{ active: activeTab === 'devices' }" @click="activeTab = 'devices'" type="button">
        Devices
      </button>
    </nav>

    <!-- Floorplan Tab Content -->
    <div v-if="activeTab === 'floorplan'" class="heatmap-container">
      <div class="heatmap-title-bar">
        Water Meter Pin Location
      </div>
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
      <div class="devices-header">
        <h2>
          Total Water Consumption: {{ totalWaterConsumption }} m³
          <br>
          Total Daily Consumption: {{ totalDailyConsumption }} m³
          <br>
          Total Monthly Consumption: {{ totalMonthlyConsumption }} m³
        </h2>
      </div>

      <div v-if="loadingDevices" class="loading">
        Loading devices...
      </div>
      <div v-else>
        <section v-for="(devices, category) in categorizedDevices" :key="category" class="category">
          <h3>{{ category }}</h3>
          <div class="grid-container">
            <!-- For Other Devices, render the combined card if available -->
            <template v-if="category === 'Other Devices'">
              <div v-if="combinedMain6" class="grid-item">
                <div class="summary">
                  <h4>{{ combinedMain6.device_name }}</h4>
                  <p>
                    Total Consumption:
                    <strong>{{ combinedMain6.totalConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Daily):
                    <strong>{{ combinedMain6.dailyConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Monthly):
                    <strong>{{ combinedMain6.monthlyConsumption }} m³</strong>
                  </p>
                </div>
              </div>
              <!-- Render the rest of Other Devices that are not part of the combined group -->
              <div
                v-for="device in devices.filter(d => !['8254812307000003', '8254812211000171', '8254812211000172'].includes(d.dev_eui))"
                :key="device.id" class="grid-item">
                <div class="summary">
                  <h4>{{ device.device_name }}</h4>
                  <p>Dev EUI: {{ device.dev_eui }}</p>
                  <p>
                    Total Consumption:
                    <strong>{{ device.totalConsumption || "0.00" }} m³</strong>
                  </p>
                  <p>Consumption (Daily):
                    <strong>{{ device.dailyConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Monthly):
                    <strong>{{ device.monthlyConsumption }} m³</strong>
                  </p>
                </div>
              </div>
            </template>
            <!-- For other categories, render as before -->
            <template v-else>
              <div v-for="device in devices" :key="device.id" class="grid-item">
                <div class="summary">
                  <h4>{{ device.device_name }}</h4>
                  <p>Dev EUI: {{ device.dev_eui }}</p>
                  <p>
                    Total Consumption:
                    <strong>{{ device.totalConsumption || "0.00" }} m³</strong>
                  </p>
                  <p>Consumption (Daily):
                    <strong>{{ device.dailyConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Monthly):
                    <strong>{{ device.monthlyConsumption }} m³</strong>
                  </p>
                </div>
              </div>
            </template>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";
import axios from "axios";

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
        { id: 21, x: 0, y: 0, title: "", deviceName: "", meterReading: 0 }
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        deviceName: "",
        meterReading: 0
      },
      devices: [],
      loadingDevices: false
    };
  },
  computed: {
    combinedMain6() {
      // Define the dev_eui values for the three devices.
      const combinedEUIs = [
        "8254812307000003", // Kitchen
        "8254812211000171", // Main 4
        "8254812211000172"  // Main 6
      ];
      // Filter your devices array for those in the combined group.
      const devicesToCombine = this.devices.filter(device =>
        combinedEUIs.includes(device.dev_eui)
      );

      // Sum up the consumption values (ensure you parse the strings as numbers).
      const totalConsumption = devicesToCombine.reduce((sum, device) =>
        sum + (parseFloat(device.totalConsumption) || 0), 0);
      const dailyConsumption = devicesToCombine.reduce((sum, device) =>
        sum + (parseFloat(device.dailyConsumption) || 0), 0);
      const monthlyConsumption = devicesToCombine.reduce((sum, device) =>
        sum + (parseFloat(device.monthlyConsumption) || 0), 0);

      // Return the combined object with your desired card title ("Main 6")
      return {
        device_name: "Main 6",
        totalConsumption: totalConsumption.toFixed(2),
        dailyConsumption: dailyConsumption.toFixed(2),
        monthlyConsumption: monthlyConsumption.toFixed(2)
      };
    },
    waterMapImage() {
      return require("@/assets/WaterMap.png");
    },
    totalWaterConsumption() {
      return this.devices
        .reduce((sum, device) => sum + (parseFloat(device.totalConsumption) || 0), 0)
        .toFixed(2);
    },
    currentMonthDate() {
      const now = new Date();
      return now.toLocaleString("en-US", { month: "long", year: "numeric" });
    },
    totalDailyConsumption() {
      // Ensure devices array exists.
      if (!this.devices || !this.devices.length) return "0.00";

      // Sum the dailyConsumption values (ignoring non-numeric "N/A" values)
      const total = this.devices.reduce((sum, device) => {
        // Parse the dailyConsumption value (if not available or invalid, use 0)
        const value = parseFloat(device.dailyConsumption);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      // Return the total formatted to 2 decimals.
      return total.toFixed(2);
    },
    totalMonthlyConsumption() {
      if (!this.devices || !this.devices.length) return "0.00";

      const total = this.devices.reduce((sum, device) => {
        const value = parseFloat(device.monthlyConsumption);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      return total.toFixed(2);
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
      this.totalWaterConsumption = this.devices
        .reduce((sum, device) => sum + (parseFloat(device.totalConsumption) || 0), 0)
        .toFixed(2);
      this.$forceUpdate();
    },
    async fetchWaterMeterData() {
      try {
        const response = await fetch("/WaterMeterData.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const deviceReadings = {};
        const predefinedCoordinates = [
          { x: 10, y: 10 },
          { x: 54.5, y: 46 },
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
          { x: 65.5, y: 71 }
        ];

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          if (jsonData.length <= 1) return;

          jsonData.slice(1).forEach((row) => {
            const [DeviceName, ReadingMeterTimeRaw, MeterReading] = [
              row[1],
              row[10],
              parseFloat(row[16]) || 0
            ];

            const ReadingMeterTime = ReadingMeterTimeRaw
              ? new Date(ReadingMeterTimeRaw)
              : null;
            if (!ReadingMeterTime || isNaN(ReadingMeterTime.getTime())) return;

            const readingDate = ReadingMeterTime.toISOString().split("T")[0];

            if (!deviceReadings[sheetName]) {
              deviceReadings[sheetName] = {};
            }
            if (!deviceReadings[sheetName][DeviceName]) {
              deviceReadings[sheetName][DeviceName] = {};
            }
            deviceReadings[sheetName][DeviceName][readingDate] = MeterReading;
          });
        });

        this.circles = Object.entries(deviceReadings).flatMap(
          ([sheetName, devices], deviceIndex) => {
            return Object.entries(devices).map(([DeviceName, readings]) => {
              const sortedDates = Object.keys(readings).sort(
                (a, b) => new Date(a) - new Date(b)
              );
              const latestDate = sortedDates[sortedDates.length - 1];
              const latestReading = readings[latestDate] || 0;
              const coordinates =
                predefinedCoordinates[deviceIndex] || { x: 0, y: 0 };

              return {
                id: this.circles.length + 1,
                x: coordinates.x,
                y: coordinates.y,
                title: sheetName,
                deviceName: DeviceName,
                meterReading: latestReading
              };
            });
          }
        );

        console.log("Processed circles:", this.circles);
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
        title: circle.title,
        deviceName: circle.deviceName,
        meterReading: circle.meterReading.toFixed(2)
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    fetchDevicesData() {
      this.loadingDevices = true;
      this.devices = Object.values(this.categorizedDevices).flat();
      console.log("Fetching data for devices:", this.devices);

      // First, fetch metrics for all devices
      Promise.all(
        this.devices.map((device) => this.fetchMetricsForDevice(device))
      )
        .then(() => {
          console.log("All device metrics fetched successfully.");
          Promise.all(this.devices.map(device => this.fetchDailyConsumption(device)))
            .then(() => {
              console.log("Daily consumption values have been updated for all devices.");
              // Optionally, update any component data or charts on the frontend.
            })
            .catch((error) => {
              console.error("Error fetching daily consumption for one or more devices:", error);
            });
          // After loading devices, update monthly consumption for each device:
          Promise.all(this.devices.map(device => this.fetchMonthlyConsumption(device)))
            .then(() => {
              console.log("Monthly consumption values updated for all devices.");
            })
            .catch((error) => {
              console.error("Error updating monthly consumption for one or more devices:", error);
            });

        })
        .then(() => {
          // Optionally update highest consumption device here...
          let highestDevice = { name: "N/A", value: 0 };
          this.devices.forEach((device) => {
            const consumption = parseFloat(device.totalConsumption) || 0;
            if (consumption > highestDevice.value) {
              highestDevice = { name: device.device_name, value: consumption };
            }
          });
          this.highestConsumptionDevice = highestDevice.name;
          this.highestConsumptionValue = highestDevice.value.toFixed(2);

          this.loadingDevices = false;
        })
        .catch((error) => {
          console.error("Error fetching device metrics or consumption differences:", error);
          this.loadingDevices = false;
        });
    },

    fetchMetricsForDevice(device) {
      return axios
        .get("https://b513-119-234-9-157.ngrok-free.app/api/total_consumption", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        })
        .then((response) => {
          console.log(`RAW Response for Total Consumption:`, response.data);

          // Check that the response contains an array of total_consumption data.
          if (
            !response.data ||
            !response.data.total_consumption ||
            !Array.isArray(response.data.total_consumption)
          ) {
            console.warn("Invalid response format for total consumption:", response.data);
            return;
          }

          // Find the matching device by comparing dev_eui.
          const matchedDevice = response.data.total_consumption.find(
            (item) => item.dev_eui === device.dev_eui
          );

          if (matchedDevice) {
            // Update the device's totalConsumption using the value from the API.
            device.totalConsumption = parseFloat(matchedDevice.total_consumption).toFixed(2);

            // Optionally update the device name if needed.
            device.device_name = matchedDevice.device_name;

            // Optionally update the highest consumption device if this device's consumption is higher.
            const deviceConsumption = parseFloat(device.totalConsumption) || 0;
            const currentHighest = parseFloat(this.highestConsumptionValue) || 0;
            if (deviceConsumption > currentHighest) {
              this.highestConsumptionValue = device.totalConsumption;
              this.highestConsumptionDevice = device.dev_eui;
            }
          } else {
            console.warn(`No total consumption data found for device dev_eui: ${device.dev_eui}`);
          }
        })
        .catch((error) => {
          console.error(`Error fetching total consumption for device ${device.dev_eui}:`, error);
        });
    },
    // Add this function inside the methods section of your Vue component.
    fetchDailyConsumption(device) {
      // Compute yesterday's date in YYYY-MM-DD format.
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0]; // e.g., "2025-02-06"

      return axios
        .get(`https://b513-119-234-9-157.ngrok-free.app/api/daily_usage/${device.id}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        })
        .then((response) => {
          console.log(`RAW Daily Usage Response for Device ${device.id}:`, response.data);

          if (
            response.data &&
            response.data.daily_usage &&
            Array.isArray(response.data.daily_usage)
          ) {
            // Find the record for yesterday.
            const yesterdayData = response.data.daily_usage.find(
              (entry) => entry.timestamp === yesterdayStr
            );

            if (yesterdayData && yesterdayData.dailyWaterUsage !== undefined) {
              device.dailyConsumption = parseFloat(yesterdayData.dailyWaterUsage).toFixed(2);
            } else {
              console.warn(
                `No daily usage data found for ${yesterdayStr} for device ${device.id}`,
                response.data.daily_usage
              );
              device.dailyConsumption = "N/A";
            }
          } else {
            console.warn(`Invalid daily usage response for device ${device.id}:`, response.data);
            device.dailyConsumption = "N/A";
          }
          return device.dailyConsumption;
        })
        .catch((error) => {
          console.error(`Error fetching daily usage for device ${device.id}:`, error);
          device.dailyConsumption = "N/A";
          return device.dailyConsumption;
        });
    },
    fetchMonthlyConsumption(device) {
      return axios
        .get(`https://b513-119-234-9-157.ngrok-free.app/api/daily_usage/${device.id}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        })
        .then((response) => {
          console.log(`RAW Daily Usage Response for monthly consumption for Device ${device.id}:`, response.data);

          if (
            response.data &&
            response.data.daily_usage &&
            Array.isArray(response.data.daily_usage)
          ) {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // Note: 0-indexed (0 = January)

            // Filter the daily_usage records for those in the current month
            const monthlyRecords = response.data.daily_usage.filter((entry) => {
              const entryDate = new Date(entry.timestamp);
              return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
            });

            // Sum the dailyWaterUsage values for these records
            const monthlySum = monthlyRecords.reduce((sum, entry) => {
              return sum + (parseFloat(entry.dailyWaterUsage) || 0);
            }, 0);

            // Update the device object (formatted to 2 decimals)
            device.monthlyConsumption = monthlySum.toFixed(2);
          } else {
            console.warn(`Invalid monthly usage response for device ${device.id}:`, response.data);
            device.monthlyConsumption = "N/A";
          }
          return device.monthlyConsumption;
        })
        .catch((error) => {
          console.error(`Error fetching monthly usage for device ${device.id}:`, error);
          device.monthlyConsumption = "N/A";
          return device.monthlyConsumption;
        });
    }

  },
  mounted() {
    this.fetchWaterMeterData();
    this.fetchDevicesData();
    Promise.all(this.devices.map(device => this.fetchDailyConsumption(device)))
      .then(() => {
        console.log("Daily consumption values updated for all devices.");
      });
  }
};
</script>

<style scoped>
/* Centered Tabs Navigation */
.tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

.tabs button {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: border-bottom 0.3s, font-weight 0.3s;
}

.tabs button.active {
  border-bottom: 2px solid black;
  font-weight: bold;
}

/* Floorplan & Tooltip Styles */
.heatmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
}

.heatmap-title-bar {
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}

.heatmap-floorplan {
  position: relative;
}

.floorplan-image {
  width: 100%;
  display: block;
}

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
}

.value-tooltip {
  position: fixed;
  background: #000;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}

/* Devices Tab Styles */
.devices-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
}

.devices-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
}

.devices-header h2 {
  margin: 0;
  font-size: 20px;
}

.devices-header p {
  margin: 0;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.category {
  margin-bottom: 30px;
}

.category h3 {
  font-size: 18px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}


/* Device Card (Box) with Hover Interaction */
.grid-item {
  position: relative;
  overflow: hidden;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 4px;
  transition: box-shadow 0.3s ease;
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary {
  transition: opacity 0.3s ease;
}

.detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 10px;
  box-sizing: border-box;
}

.grid-item:hover .detail-overlay {
  opacity: 1;
}

.grid-item h4 {
  margin: 0 0 10px;
  font-size: 16px;
}

.grid-item p {
  margin: 5px 0;
  font-size: 14px;
}
</style>
