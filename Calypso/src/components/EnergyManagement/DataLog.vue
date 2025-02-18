<template>
    <div class="data-log-container">
      <h2 class="text-center">Data Log</h2>
      <!-- Options Bar -->
      <div class="options-bar">
        <div class="option">
          <label for="location-sort">Sort Location:</label>
          <select id="location-sort" v-model="sortLocation">
            <option>All Locations</option>
            <option>GE Canteen</option>
          </select>
        </div>
        <div class="option">
          <label for="power-usage-sort">Sort Most Power Usage Over:</label>
          <select id="power-usage-sort" v-model="sortUsage">
            <option>All</option>
            <option>Day</option>
            <option>Month</option>
          </select>
        </div>
        <div class="option">
          <label for="live-status">Live Status:</label>
          <select id="live-status" v-model="liveStatus">
            <option>All</option>
            <option>Online</option>
            <option>Offline</option>
          </select>
        </div>
      </div>
      <!-- Table 1: Accumulative Data -->
      <div class="table-container">
        <h3>Accumulative Data</h3>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Device</th>
              <th>Type</th>
              <th>Location</th>
              <th>Accumulative Today (kWh)</th>
              <th>Accumulative This Month (kWh)</th>
              <th>Power Meter Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(device, index) in filteredDevices" :key="index">
              <td>{{ device.name }}</td>
              <td>{{ device.type }}</td>
              <td>{{ device.location }}</td>
              <td>{{ device.accToday }}</td>
              <td>{{ device.accMonth }}</td>
              <td>{{ device.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Table 2: Device Fault Log -->
      <div class="table-container mt-5">
        <h3>Device Fault Log</h3>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Location</th>
              <th>Time</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="faultLogs.length === 0">
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr v-else v-for="(fault, index) in faultLogs" :key="index">
              <td>{{ fault.name }}</td>
              <td>{{ fault.status }}</td>
              <td>{{ fault.location }}</td>
              <td>{{ fault.time }}</td>
              <td>{{ fault.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "DataLog",
    data() {
      return {
        sortLocation: "All Locations",
        sortUsage: "All",
        liveStatus: "All",
        devices: [], // Holds data for the first table
        faultLogs: [
          {
            name: "",
            status: "",
            location: "",
            time: "",
            date: "",
          },
        ], // Example fault log
      };
    },
    computed: {
      filteredDevices() {
        // Start with a copy of devices
        let filtered = [...this.devices];
  
        // Filter by location if a specific location is selected.
        if (this.sortLocation !== "All Locations") {
          filtered = filtered.filter(
            (device) => device.location === this.sortLocation
          );
        }
  
        // Filter by live status.
        if (this.liveStatus !== "All") {
          if (this.liveStatus === "Online") {
            // Consider devices with statuses other than "Not Working" or "No Data" as online.
            filtered = filtered.filter(
              (device) =>
                device.status !== "Not Working" && device.status !== "No Data"
            );
          } else if (this.liveStatus === "Offline") {
            filtered = filtered.filter(
              (device) =>
                device.status === "Not Working" || device.status === "No Data"
            );
          }
        }
  
        // Sort based on power usage selection.
        if (this.sortUsage === "Day") {
          filtered.sort(
            (a, b) => parseFloat(b.accToday) - parseFloat(a.accToday)
          );
        } else if (this.sortUsage === "Month") {
          filtered.sort(
            (a, b) => parseFloat(b.accMonth) - parseFloat(a.accMonth)
          );
        }
  
        return filtered;
      },
    },
    methods: {
      fetchAccumulativeData() {
        const meterMap = {
          "24061901790001": "FCU 4",
          "24060404690001": "FCU 5",
          "24112209220002": "FCU 6",
          "24060410030002": "FCU 7",
          "24112209220006": "FCU 8",
          "24060404690002": "FCU 9",
          "24060410030003": "FCU 10",
          "24060410030004": "FCU 11",
          "24112209220003": "FCU 12",
          "24112209220005": "FCU 13",
          "24112209220004": "Overall Lighting",
        };
  
        // A simple mapping for device locations (adjust as needed)
        const locationMap = {
          "FCU 4": "GE Canteen",
          "FCU 5": "GE Canteen",
          "FCU 6": "GE Canteen",
          "FCU 7": "GE Canteen",
          "FCU 8": "GE Canteen",
          "FCU 9": "GE Canteen",
          "FCU 10": "GE Canteen",
          "FCU 11": "GE Canteen",
          "FCU 12": "GE Canteen",
          "FCU 13": "GE Canteen",
          "Overall Lighting": "GE Canteen",
        };
  
        const meterSNs = Object.keys(meterMap);
  
        axios
          .get("https://geibms.com/message_history")
          .then((response) => {
            const rawData = response.data.message_history;
            const now = new Date();
            // Today's date in YYYYMMDD (e.g., "20241203")
            const todayStr = now.toISOString().slice(0, 10).replace(/-/g, "");
            // Current month in YYYYMM (e.g., "202412")
            const monthStr = now.toISOString().slice(0, 7).replace(/-/g, "");
  
            const devicesData = meterSNs.map((meterSN) => {
              const meterName = meterMap[meterSN];
              // Filter data for the current meter
              let meterData = rawData.filter(
                (entry) => entry.meterSN === meterSN
              );
  
              // Sort the meterData by the 'datatime' property (assuming a comparable string format)
              meterData.sort((a, b) => a.datatime.localeCompare(b.datatime));
  
              // --- Daily consumption ---
              const todayRecords = meterData.filter((entry) =>
                entry.datatime.startsWith(todayStr)
              );
              let accToday = 0;
              if (todayRecords.length > 0) {
                const firstToday = todayRecords[0];
                const lastToday = todayRecords[todayRecords.length - 1];
                accToday =
                  parseFloat(lastToday.EPI) - parseFloat(firstToday.EPI);
              }
  
              // --- Monthly consumption ---
              const monthRecords = meterData.filter((entry) =>
                entry.datatime.startsWith(monthStr)
              );
              let accMonth = 0;
              if (monthRecords.length > 0) {
                const firstMonth = monthRecords[0];
                const lastMonth = monthRecords[monthRecords.length - 1];
                accMonth =
                  parseFloat(lastMonth.EPI) - parseFloat(firstMonth.EPI);
              }
  
              return {
                name: meterName,
                location: locationMap[meterName] || "Unknown",
                type: meterData.length > 0 ? meterData[0].type : "Unknown",
                accToday: accToday.toFixed(2),
                accMonth: accMonth.toFixed(2),
                status:
                  meterData.length > 0 ? meterData[0].meterStatus : "No Data",
              };
            });
  
            // Update devices array for table display
            this.devices = devicesData;
            console.log("Devices Data:", this.devices);
  
            // Build the faultLogs array: if a device's status is "Not Working", log a fault entry.
            const faultLogs = devicesData
              .filter((device) => device.status === "Not Working")
              .map((device) => ({
                name: device.name,
                status: device.status,
                location: device.location, // Using the device's location
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
              }));
  
            // Set faultLogs: if no faults are found, this array will be empty.
            this.faultLogs = faultLogs;
            console.log("Fault Logs:", this.faultLogs);
          })
          .catch((error) =>
            console.error("Error fetching accumulative data:", error)
          );
      },
    },
    mounted() {
      this.fetchAccumulativeData();
    },
  };
  </script>
  
  <style scoped>
  .data-log-container {
    padding: 20px;
    margin: 0 auto;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 10px;
  }
  
  h2 {
    margin-bottom: 20px;
  }
  
  h3 {
    margin-top: 20px;
  }
  
  .table-container {
    margin-bottom: 20px;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .table th,
  .table td {
    text-align: left;
    padding: 10px;
    border: 1px solid #ddd;
  }
  
  .table th {
    background-color: #f1f1f1;
    font-weight: bold;
  }
  
  .table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .options-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f4f4f4;
    padding: 10px 20px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }
  
  .option {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .option label {
    font-weight: bold;
  }
  
  .live-status {
    font-weight: bold;
    color: green;
  }
  </style>
  