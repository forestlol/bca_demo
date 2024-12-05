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
            <FloorplanComponent />
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
              <i class="fas fa-chart-line icon"></i>
              <h4>Estimated Energy Savings</h4>
              <p>Details or Metrics</p>
            </div>
            <div class="optimization-card">
              <i class="fas fa-cogs icon"></i>
              <h4>Conditional Logic</h4>
              <p>Details or Configuration</p>
            </div>
            <div class="optimization-card">
              <i class="fas fa-clock icon"></i>
              <h4>Schedule</h4>
              <p>Details or Configuration</p>
            </div>
            <div class="optimization-card">
              <i class="fas fa-percentage icon"></i>
              <h4>% Device Optimized</h4>
              <p>Optimization Metrics</p>
            </div>
          </div>
          <div v-if="activeControlTab === 'control'" class="grid-container expanded-grid">
            <div class="control-card">
              <i class="fas fa-thermometer-half icon"></i>
              <h4>Set Temperature</h4>
              <p>Adjust Temperature</p>
            </div>
            <div class="control-card">
              <i class="fas fa-sliders-h icon"></i>
              <h4>Control Mode</h4>
              <p>Switch Modes</p>
            </div>
            <div class="control-card">
              <i class="fas fa-power-off icon"></i>
              <h4>Drive On/Off</h4>
              <p>Toggle Power</p>
            </div>
            <div class="control-card">
              <i class="fas fa-temperature-low icon"></i>
              <h4>Room Temperature</h4>
              <p>Read Current Temperature</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logs Section -->
    <div class="logs-section">
      <div class="logs-container">
        <h3>Schedule Command Logs</h3>
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
            <tr v-for="(log, index) in scheduleLogs" :key="index">
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
        <h3>Conditional Command Logs</h3>
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
import FloorplanComponent from "@/components/AutomationFloorplanComponent.vue"; // Update path as needed

export default {
  components: {
    FloorplanComponent,
  },
  data() {
    return {
      activeTab: "deviceInfo",
      activeControlTab: "optimization",
      floorplanImage: require("@/assets/Floorplan.jpg"),
      scheduleLogs: [
        { date: "2024-12-03", commandType: "Turn On", state: "ON", status: "Success" },
        { date: "2024-12-03", commandType: "Turn Off", state: "OFF", status: "Unsuccessful" },
        { date: "2024-12-03", commandType: "Set Temp", state: "ON", status: "Success" },
      ],
      conditionalLogs: [
        { date: "2024-12-03", commandType: "Adjust Temp", state: "OFF", status: "Unsuccessful" },
        { date: "2024-12-03", commandType: "Mode Switch", state: "ON", status: "Success" },
        { date: "2024-12-03", commandType: "Turn Off", state: "OFF", status: "Unsuccessful" },
      ],
    };
  },
};
</script>

<style scoped>
.automation-overview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  color: white;
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
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 30px;
  /* Increased gap for spacing */
}

.optimization-card,
.control-card {
  padding: 20px;
  /* Larger padding for better spacing */
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  /* More rounded corners */
  color: black;
  text-align: center;
  font-size: 1em;
  /* Slightly larger font for visibility */
}

.optimization-card .icon,
.control-card .icon {
  font-size: 1em;
  /* Larger icon size */
  margin-bottom: 15px;
  color: #007bff;
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
</style>
