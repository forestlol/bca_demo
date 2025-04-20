<template>
  <div class="automation-overview-container">
    <div class="top-section">
      <!-- Floor Plan Section -->
      <div class="floor-plan-container">
        <div class="floor-plan-header">
          <h3>Lights & Aircon</h3>
          <div class="status-indicators">
            <div class="status">
              <span class="dot green"></span> Optimized
            </div>
            <div class="status">
              <span class="dot blue"></span> Partially Optimized
            </div>
            <div class="status">
              <span class="dot red"></span> Not Optimized
            </div>
          </div>
        </div>
        <div class="floor-plan-tabs">
          <button :class="{ active: activeTab === 'deviceInfo' }" @click="activeTab = 'deviceInfo'">
            Device Information
          </button>
          <button :class="{ active: activeTab === 'activityHeatMap' }" @click="activeTab = 'activityHeatMap'">
            Activity Data Heat Map
          </button>
        </div>
        <div class="floor-plan-content">
          <div v-if="activeTab === 'deviceInfo'" class="floorplan-wrapper">
            <FloorplanComponent />
          </div>
          <div v-if="activeTab === 'activityHeatMap'" class="floorplan-wrapper">
            <HeatmapComponent />
          </div>
        </div>
      </div>

      <!-- Optimization and Control Tabs -->
      <div class="optimization-control-tabs">
        <div class="tabs">
          <button :class="{ active: activeControlTab === 'optimization' }" @click="activeControlTab = 'optimization'">
            Optimization
          </button>
          <button :class="{ active: activeControlTab === 'control' }" @click="activeControlTab = 'control'">
            Control
          </button>
        </div>
        <div class="control-content">
          <div v-if="activeControlTab === 'optimization'" class="grid-container expanded-grid">
            <div class="optimization-card">
              <div class="card-header">
                <i class="fas fa-chart-line"></i>
                <span>Estimated Energy Savings</span>
              </div>
              <div class="card-content">
                <div class="metric-value">- kWh</div>
                <div class="metric-subtitle">Monthly Savings</div>
              </div>
            </div>
            <div class="optimization-card">
              <div class="card-header">
                <i class="fas fa-cogs"></i>
                <span>Conditional Logic</span>
              </div>
              <div class="card-content">
                <div class="metric-value">-</div>
                <div class="metric-subtitle">Active Rules</div>
              </div>
            </div>
            <div class="optimization-card">
              <div class="card-header">
                <i class="fas fa-clock"></i>
                <span>Schedule</span>
              </div>
              <div class="card-content">
                <div class="metric-value">-</div>
                <div class="metric-subtitle">Active Schedules</div>
              </div>
            </div>
            <div class="optimization-card">
              <div class="card-header">
                <i class="fas fa-percentage"></i>
                <span>Device Optimized</span>
              </div>
              <div class="card-content">
                <div class="metric-value">-%</div>
                <div class="metric-subtitle">Current Optimization</div>
              </div>
            </div>
          </div>
          <div v-if="activeControlTab === 'control'" class="grid-container expanded-grid">
            <div class="control-card full-width">
              <div class="card-header">
                <i class="fas fa-microchip"></i>
                <span>FCU Selection</span>
              </div>
              <div class="card-content">
                <select v-model="selectedFcu" @change="handleFcuChange" class="fcu-select">
                  <option value="">Select FCU</option>
                  <option v-for="fcu in fcuOptions" :key="fcu" :value="fcu">{{ fcu }}</option>
                </select>
              </div>
            </div>
            <div class="control-card">
              <div class="card-header">
                <i class="fas fa-thermometer-half"></i>
                <span>Set Temperature</span>
              </div>
              <div class="card-content">
                <div class="temperature-control">
                  <div class="temp-input-container">
                    <input type="number" v-model="setTemperature" min="16" max="30" step="1" class="temp-input"
                      placeholder="-">
                    <span class="temp-unit-label">°C</span>
                  </div>
                  <button @click="storeTemperatureCommand" class="set-btn">Set</button>
                </div>
              </div>
            </div>
            <div class="control-card">
              <div class="card-header">
                <i class="fas fa-sliders-h"></i>
                <span>Control Mode</span>
              </div>
              <div class="card-content">
                <div class="mode-switches">
                  <button v-for="mode in modes" :key="mode" :class="['mode-btn', { active: currentMode === mode }]"
                    @click="setMode(mode)">
                    {{ mode }}
                  </button>
                </div>
              </div>
            </div>
            <div class="control-card">
              <div class="card-header">
                <i class="fas fa-power-off"></i>
                <span>Drive On/Off</span>
              </div>
              <div class="card-content">
                <div class="drive-control">
                  <button :class="['drive-btn', { active: driveStatus }]" @click="toggleDrive">
                    {{ driveStatus ? 'ON' : 'OFF' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="control-card">
              <div class="card-header">
                <i class="fas fa-temperature-low"></i>
                <span>Room Temperature</span>
              </div>
              <div class="card-content">
                <div class="room-temp">
                  <div class="digital-display">
                    <span class="temp-value">{{ currentTemperature || '--' }}</span>
                    <span class="temp-unit">°C</span>
                  </div>
                  <div class="temp-status">{{ getTemperatureStatus(currentTemperature) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logs Section -->
    <div class="logs-section">
      <div class="logs-container">
        <div class="logs-header">
          <h3>Schedule Command Logs</h3>
          <router-link to="/automation-management/scheduleCommand" class="view-more-button">
            View More
          </router-link>
        </div>
        <table class="logs-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Command Type</th>
              <th>State</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="scheduleLogs.length === 0">
              <td colspan="4" class="no-data">No Data available</td>
            </tr>
            <tr v-else v-for="(log, index) in scheduleLogs" :key="index">
              <td>{{ log.date }}</td>
              <td>{{ log.commandType }}</td>
              <td :class="{ 'green-text': log.state === 'ON', 'red-text': log.state === 'OFF' }">
                {{ log.state }}
              </td>
              <td>
                <span :class="{ 'green-text': log.status === 'Success', 'red-text': log.status === 'Unsuccessful' }">
                  {{ log.status === 'Success' ? '✅' : '❌' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="logs-container">
        <div class="logs-header">
          <h3>Conditional Command Logs</h3>
          <router-link to="/automation-management/conditionalCommand" class="view-more-button">
            Conditional Logic
          </router-link>
          
          <router-link to="/automation-management/conditionalCommand" class="view-more-button">
            View More
          </router-link>
        </div>

        <table class="logs-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Command Type</th>
              <th>State</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in conditionalLogs" :key="index">
              <td>{{ log.date }}</td>
              <td>{{ log.commandType }}</td>
              <td :class="{ 'green-text': log.state === 'ON', 'red-text': log.state === 'OFF' }">
                {{ log.state }}
              </td>
              <td>
                <span :class="{ 'green-text': log.status === 'Success', 'red-text': log.status === 'Unsuccessful' }">
                  {{ log.status === 'Success' ? '✅' : '❌' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import FloorplanComponent from "@/components/AutomationFloorplanComponent.vue";
import HeatmapComponent from "@/components/AutomationHeatmapComponent.vue";

export default {
  name: 'AutomationOverview',
  components: {
    FloorplanComponent,
    HeatmapComponent,
  },
  data() {
    return {
      // tabs
      activeTab: "deviceInfo",
      activeControlTab: "optimization",

      // control panel state
      selectedFcu: 'FCU 4',
      setTemperature: 22,
      currentTemperature: 24,
      currentMode: 'Cooling',
      driveStatus: true,

      // optimization metrics (hard‑coded)
      energySavings: 245,         // kWh
      conditionalRules: 8,        // active rules
      scheduleCount: 12,          // schedules
      optimizationPercentage: 85, // %

      // FCU options (hard‑coded)
      fcuOptions: [
        'FCU 4','FCU 5','FCU 6','FCU 7','FCU 8',
        'FCU 9','FCU 10','FCU 11','FCU 12','FCU 13'
      ],

      // logs (hard‑coded examples)
      scheduleLogs: [
        { date: "2025-04-15", commandType: "Set temperature", state: "22°C", status: "Success" },
        { date: "2025-04-14", commandType: "Toggle Drive",   state: "OFF",  status: "Success" },
        { date: "2025-04-13", commandType: "Mode Switch",    state: "Heating", status: "Success" }
      ],
      conditionalLogs: [
        { date: "2025-04-12", commandType: "Adjust Temp",    state: "OFF",     status: "Unsuccessful" },
        { date: "2025-04-11", commandType: "Mode Switch",    state: "ON",      status: "Success"        },
        { date: "2025-04-10", commandType: "Turn Off",       state: "OFF",     status: "Unsuccessful" }
      ]
    };
  },
  methods: {
    // no-op stubs since everything is hard‑coded
    handleFcuChange() {},
    storeTemperatureCommand() {},
    setMode(mode) {
      this.currentMode = mode;
    },
    toggleDrive() {
      this.driveStatus = !this.driveStatus;
    },
    getTemperatureStatus(temp) {
      if (temp <= 20) return 'Cool';
      if (temp <= 24) return 'Warm';
      return 'Hot';
    }
  }
};
</script>


<style scoped>
.automation-overview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  color: black;
  padding-top: 5%;
}

.top-section {
  display: flex;
  gap: 20px;
}

.floor-plan-container {
  flex: 2;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: black;
  border-radius: 10px;
  padding: 20px;
}

.floor-plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicators {
  display: flex;
  gap: 10px;
}

.status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.green {
  background-color: green;
}

.blue {
  background-color: blue;
}

.red {
  background-color: red;
}

.floor-plan-tabs {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.floor-plan-tabs button {
  flex: 1;
  padding: 10px;
  background-color: #333;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.floor-plan-tabs button.active {
  background-color: #007bff;
}

.optimization-control-tabs {
  flex: 1;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  background-color: #333;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.tabs button.active {
  background-color: #007bff;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.expanded-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  margin: 0;
}

.optimization-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 160px;
  transition: transform 0.2s ease;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.card-header i,
.control-card .card-header i {
  font-size: 14px;
  color: #2196F3;
}

.card-header span,
.control-card .card-header span {
  font-size: 13px;
  color: #333;
  font-weight: normal;
}

.optimization-card .card-header,
.control-card .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.optimization-card,
.control-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 160px;
  transition: transform 0.2s ease;
  overflow: hidden;
}

.card-content {
  padding: 20px 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  color: #2196F3;
  margin-bottom: 8px;
}

.metric-subtitle {
  font-size: 12px;
  color: #666;
}

.control-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.temperature-control {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.temp-input-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px 8px;
}

.temp-input {
  width: 32px;
  border: none;
  padding: 4px 0;
  text-align: right;
  font-size: 16px;
  color: #333;
  -moz-appearance: textfield;
}

.temp-input::-webkit-outer-spin-button,
.temp-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.temp-unit-label {
  color: #666;
  font-size: 14px;
  margin-left: 2px;
  user-select: none;
}

.temp-input:focus {
  outline: none;
}

.temp-input-container:focus-within {
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.set-btn {
  padding: 8px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.set-btn:hover {
  background-color: #45a049;
}

.mode-switches {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  padding: 0 10px;
}

.mode-btn {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background-color: #e9e9e9;
}

.mode-btn.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.mode-btn.active:hover {
  background-color: #1976D2;
}

.drive-control {
  text-align: center;
  width: 100%;
}

.drive-btn {
  padding: 12px 40px;
  border: 2px solid #f44336;
  border-radius: 6px;
  background-color: white;
  color: #f44336;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.drive-btn:hover {
  background-color: #ffebee;
}

.drive-btn.active {
  background-color: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.drive-btn.active:hover {
  background-color: #43A047;
}

.logs-section {
  display: flex;
  gap: 20px;
}

.logs-container {
  flex: 1;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: black;
  border-radius: 10px;
  padding: 20px;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.logs-table th,
.logs-table td {
  border: 1px solid #e4e4e4;
  padding: 10px;
  text-align: left;
}

.logs-table th {
  background-color: #e4e4e4;
}

.logs-table tr:nth-child(even) {
  background-color: #e4e4e4;
}

.icon {
  font-size: 2em;
  margin-bottom: 10px;
  color: #007bff;
}

.floor-plan-placeholder img {
  width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
  background-color: #333;
  display: block;
}

.green-text {
  color: green;
  font-weight: bold;
}

.red-text {
  color: red;
  font-weight: bold;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.view-more-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  text-align: center;
  font-size: 14px;
}

.view-more-button:hover {
  background-color: #0056b3;
}

.temperature-control {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.room-temp {
  margin-top: 15px;
  text-align: center;
  padding: 15px;
  border-radius: 8px;
}

.digital-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  font-family: 'Digital', monospace;
  margin-bottom: 5px;
}

.temp-value {
  font-size: 48px;
  font-weight: bold;
  color: #00a8ff;
  text-shadow: 0 0 10px rgba(0, 168, 255, 0.5);
}

.temp-unit {
  font-size: 24px;
  color: #00a8ff;
  margin-left: 5px;
}

.temp-status {
  color: #6c8caa;
  font-size: 14px;
  margin-top: 5px;
}

.card-icon {
  width: 32px;
  height: 32px;
  background-color: #f0f7ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 16px;
  color: #2196F3;
}

.text-primary {
  color: #2196F3;
}

.fcu-select {
  width: 100%;
  max-width: 300px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.fcu-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.control-card.full-width {
  grid-column: 1 / -1;
}

@font-face {
  font-family: 'Digital';
  src: url('https://fonts.cdnfonts.com/css/ds-digital') format('woff2');
}
</style>
