<template>
  <div class="container mt-5 bordered-container">
    <h2 class="text-center mb-4">Fire Alarm System</h2>
    <div class="view-switcher">
      <button @click="toggleView('relation')" :class="{ 'active': currentView === 'relation' }">Schematic</button>
      <button @click="toggleView('devices')" :class="{ 'active': currentView === 'devices' }">Zones</button>
    </div>

    <div v-if="currentView === 'relation'" class="map-container">
      <!-- Fire Command Center Image (fire-alarm-finder.png) -->
      <div class="fire-command-center"
        :style="{ top: fireCommandCenterPosition.top, left: fireCommandCenterPosition.left }">
        <img src="@/assets/fire-alarm-finder.png" alt="Fire Command Center" class="fire-command-center-image" />
      </div>

      <!-- Fire Alarm Images with SAP Labels and Zones (Hover to show status) -->
      <div v-for="(alarm, index) in alarms" :key="index" class="fire-alarm-container"
        :style="{ top: fireAlarmPositions[index]?.top, left: fireAlarmPositions[index]?.left }"
        @mouseenter="onHover(index)" @mouseleave="onLeave(index)">
        <!-- Fire Alarm Image -->
        <img src="@/assets/fire-alarm.png" alt="Fire Alarm" class="fire-alarm-image" />

        <!-- SAP Label and Zone Information -->
        <div class="fire-alarm-labels">
          <p class="sap-label">SAP-{{ index + 1 }}</p>
          <p class="zone-label">Zone {{ index + 1 }}</p>
        </div>

        <!-- Show Zone Status on Hover -->
        <transition name="fade">
          <div v-if="hoveredZone === index" class="zone-status-popup">
            <p><strong>Zone {{ index + 1 }}</strong></p>
            <p>Status: <span :class="alarm.status === 'Online' ? 'text-success' : 'text-danger'">{{ alarm.status || 'N/A' }}</span></p>
            <p>Last Updated: {{ alarm.dateTimeRecorded || 'N/A' }}</p>
          </div>
        </transition>
      </div>

      <img src="@/assets/ite_firealarm_relations.png" alt="Floor Plan" class="map-image">

      <!-- Alarm Statuses -->
      <div v-for="(alarm, index) in sortedAlarms" :key="index" class="alarm-status" :style="alarmPositions[index]"
        @mouseenter="onHover(index)" @mouseleave="onLeave(index)"
        :class="{ 'highlight': hoveredAlarm === index }">
        <span :class="{ 'online': alarm.status === 'ON', 'offline': alarm.status === 'OFF' }"></span>
      </div>
    </div>

    <div v-if="currentView === 'devices'" class="devices-grid">
      <div v-for="(alarm, index) in sortedAlarms" :key="index"
        :class="['device-item', { 'highlight': hoveredAlarm === index }]" @mouseenter="onHover(index)"
        @mouseleave="onLeave(index)">
        <h5>{{ alarm.name }}</h5>
        <p>
          Status:
          <span :class="{ 'text-success': alarm.status === 'OFF', 'text-danger': alarm.status === 'ON' }">
            {{ alarm.status === 'ON' ? 'Offline' : 'Online' }}
          </span>
        </p>
        <p>Last Updated: {{ alarm.dateTimeRecorded }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FireAlarmSystem',
  data() {
    return {
      currentView: 'relation',
      hoveredAlarm: null,
      hoveredZone: null,
      alarms: [],
      fireCommandCenterPosition: {
        top: '9%',
        left: '12.5%',
      },
      fireAlarmPositions: [
        { top: '9%', left: '73.3%' },
        { top: '9%', left: '52.5%' },
        { top: '9%', left: '31%' },
        { top: '56%', left: '73.3%' },
        { top: '56%', left: '52.5%' },
        { top: '56%', left: '31%' },
      ],
      alarmPositions: [
        { top: '41.1%', left: '84.2%' },
        { top: '41.1%', left: '63.3%' },
        { top: '41.1%', left: '42.3%' },
        { top: '87.9%', left: '84.2%' },
        { top: '87.9%', left: '63.3%' },
        { top: '87.9%', left: '42.3%' },
      ],
    };
  },
  async created() {
    await this.fetchAlarms();
  },
  computed: {
    sortedAlarms() {
      return this.alarms.slice().sort((a, b) => {
        const zoneA = parseInt(a.name.split(' ')[1]);
        const zoneB = parseInt(b.name.split(' ')[1]);
        return zoneA - zoneB;
      });
    },
  },
  methods: {
    toggleView(view) {
      this.currentView = view;
    },
    async fetchAlarms() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/api/FireAlarm/data/latest');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.alarms = data;
      } catch (error) {
        console.error('Error fetching alarms:', error);
      }
    },
    onHover(index) {
      this.hoveredZone = index;
      this.hoveredAlarm = index;
    },
    onLeave(index) {
      if (this.hoveredZone === index) this.hoveredZone = null;
      if (this.hoveredAlarm === index) this.hoveredAlarm = null;
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.view-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.view-switcher button {
  background-color: #f8f9fa;
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.view-switcher button.active {
  background-color: #007bff;
  color: white;
}

.map-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border: 1px solid lightgrey;
  border-radius: 5px;
}

.map-image {
  width: 100%;
  height: auto;
}

.fire-command-center {
  position: absolute;
  /* Allow positioning of the fire-alarm-finder */
}

.fire-command-center-image {
  width: 73%;
  /* Adjust the size of the fire command center image */
}

.fire-alarm-container {
  position: absolute;
  /* Position for each fire alarm and its labels */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.fire-alarm-image {
  width: 50%;
  /* Adjust size of the fire alarm image */
}

.fire-alarm-labels {
  margin-top: 5px;
}

.sap-label {
  font-weight: bold;
  font-size: 1rem;
  margin: 0;
}

.zone-label {
  font-size: 0.875rem;
  margin: 0;
}

.zone-status-popup {
  position: absolute;
  top: 100%;
  /* Adjust so it appears below the fire alarm */
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  padding: 10px;
  background-color: black;
  color: white;
  border: 1px solid lightgray;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 10;
}

.alarm-status {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 1px solid black;
}

.alarm-status span {
  display: block;
  width: 100%;
  height: 100%;
}

.online {
  background-color: red;
  border-radius: 2px;
  border: 1px solid black;
}

.offline {
  background-color: green;
  border-radius: 2px;
  border: 1px solid black;
}

.text-danger {
  color: #dc3545 !important;
}

.text-success {
  color: #28a745 !important;
}

.highlight {
  border: 2px solid #00BCD4;
  border-radius: 2px;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.device-item {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid lightgrey;
  transition: transform 0.3s, box-shadow 0.3s;
}

.device-item:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.device-item h5 {
  margin-bottom: 10px;
  font-size: 1.25rem;
  font-weight: bold;
  color: #007bff;
}
</style>
