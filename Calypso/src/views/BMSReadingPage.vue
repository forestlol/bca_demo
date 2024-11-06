<template>
  <div class="container">
    <h2 class="text-center mb-4">Building Management System</h2>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentView === 'bms' }" @click="toggleView('bms')">BMS</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentView === 'groupings' }"
          @click="toggleView('groupings')">Groupings</a>
      </li>
    </ul>
    <div v-if="currentView === 'bms'" class="tab-content">
      <div class="image-container">
        <img src="@/assets/BMS.jpg" alt="Chiller Plant Room" class="background-image">
        <div v-for="(position, sensorName) in sensorPositions" :key="sensorName" class="sensor-value" :style="position"
          :class="{ slantedNegative: isSlantedNegative(sensorName), slantedPositive: isSlantedPositive(sensorName) }">
          {{ getValue(sensorName) }}
        </div>
      </div>
    </div>
    <div v-if="currentView === 'groupings'" class="group-sensors">
      <div v-for="(group) in filteredGroups" :key="group._id" class="mb-4">
        <h3>{{ group.name }}</h3>
        <div class="sensor-list">
          <div v-for="(id, index) in group.group" :key="id" class="sensor-item">
            <h5>{{ group.item_name[index] || 'Data Unavailable' }}</h5>
            <p>
              <span :class="['status-label', getStatusClass(findLatestDataById(id).status)]">
                Connection: {{ findLatestDataById(id).status || 'N/A' }}
              </span>
            </p>
            <p>
              <span v-if="shouldShowStatus(findLatestDataById(id).name || '')"
                :class="['status-label', getActiveClass(id)]">
                Status: {{ getActiveValue(id) || 'N/A' }}
              </span>
            </p>
            <p>Value: {{ formatValue(getPresentValue(id)) }} {{ group.units[index] || '' }}</p>
            <p>Last Updated: {{ formatDate(findLatestDataById(id).dateTime) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as CacheManager from '@/CacheManager.js';

export default {
  data() {
    return {
      currentView: 'bms',
      groups: [],
      loading: true,
      error: null,
      latestData: [],
      refreshInterval: null,
      search: '',
      sensorPositions: {
        'NCE-02/Energy.DATA.CHW-FLOW-RT': { top: '77.625%', left: '16.33%' },
        'NCE-02/Programming.AGILENT.CH-CHWR-TP': { top: '79.625%', left: '32.25%' },
        'NCE-02/Programming.AGILENT.CH-CHWS-TP': { top: '75.375%', left: '34.25%' },
        'NCE-02/Programming.AGILENT.CH-CWS-TP': { top: '37%', left: '56.5%' },
        'NCE-02/FCB.Local Application.OA-T': { top: '12.375%', left: '50.25%' },
        'NCE-02/FCB.Local Application.OA-H': { top: '16.875%', left: '50.25%' },
        'NCE-02/FCB.Local Application.CT-TEMP': { top: '25.5%', left: '41.5%' },
        'NCE-02/Energy.DATA.SYS-EFF': { top: '22.875%', left: '85.83%' },
        'NCE-02/Energy.DATA.HEAT-BALANCE': { top: '22.875%', left: '94.25%' },
        'NCE-02/Energy.DATA.TOT-CLG-KW': { top: '22.875%', left: '68.5%' },
        'NCE-02/Energy.DATA.TOT-ELEC-KW': { top: '22.875%', left: '77.33%' },
        'NCE-02/Programming.AGILENT.CH-CWR-TP': { top: '36.5%', left: '43.8%' },
        'NCE-02/FCB.Local Application.CDW FLOWRATE': { top: '42%', left: '45.5%' },
        'NAE35-01/Field Bus MSTP1.FAC-6.VALVE': { top: '63.375%', left: '68.5%' },
        'NAE35-01/Field Bus MSTP1.FAC-6.AHU CHW-F': { top: '71.66%', left: '59.75%' },
        'NAE35-01/Field Bus MSTP1.FAC-6.SAT': { top: '53.5%', left: '88.3%' },
        'STOP 1': { top: '54.5%', left: '50.3%' },
        'STOP 2': { top: '60.5%', left: '88.5%' },
        'STOP 3': { top: '86.375%', left: '84.8%' },
        'STOP 4': { top: '51.625%', left: '28.3%' },
        'STOP 5': { top: '24.375%', left: '17.7%' },
        'STOP 6': { top: '89%', left: '8.6%' },
        'OFF 1': { top: '64.5%', left: '88.5%' },
        'OFF 2': { top: '58.625%', left: '50.2%' },
        'OFF 3': { top: '55.5%', left: '28.08%' },
        'OFF 4': { top: '28.375%', left: '17.7%' },
        'OFF 5': { top: '93.125%', left: '8.5%' },
        'ALARM': { top: '93%', left: '82.08%' }
      },
      lastUpdated: ''
    };
  },
  async created() {
    if (CacheManager.getItem('bms') != null) {
      this.latestData = CacheManager.getItem('bms');
      await this.fetchLatestData();
      await this.fetchData();
    } else {
      await this.fetchLatestData();
      await this.fetchData();
    }
    this.setRefreshInterval();
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  computed: {
    filteredGroups() {
      const searchTerm = this.search.toLowerCase();
      return this.groups.filter(group => group.name.toLowerCase().includes(searchTerm));
    }
  },
  methods: {
    toggleView(view) {
      this.currentView = view;
    },
    setRefreshInterval() {
      this.refreshInterval = setInterval(() => {
        this.fetchLatestData();
      }, 120000);
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/east/bms/groups');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let textData = await response.text();
        textData = textData.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        const data = JSON.parse(textData);
        this.groups = data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchLatestData() {
      this.loading = true;
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/all/east/latest/data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let textData = await response.text();
        textData = textData.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        textData = textData.replace(/ISODate\("([^"]+)"\)/g, '"$1"');
        const data = JSON.parse(textData);
        this.latestData = data.map(item => ({
          ...item,
          dateTime: this.adjustTimeZone(item.dateTime)
        }));

        CacheManager.setItem('bms', this.latestData);
        this.updateLastUpdatedTime();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    findLatestDataById(objectId) {
      const filteredData = this.latestData.filter(data => data.objectId === objectId);
      return filteredData.length > 0 ? filteredData[filteredData.length - 1] : {};
    },
    toggleGroupCommand(group, event) {
      const command = event.target.checked ? 0 : 1;
      group.group.forEach(id => {
        const data = this.findLatestDataById(id);
        if (data) {
          data.value = command;
        }
      });
    },
    getActiveValue(id) {
      const latestData = this.findLatestDataById(id);
      if (latestData.name && latestData.name.includes('Status')) {
        return latestData.value >= 1 ? 'On' : 'Off';
      } else if (latestData.name && latestData.name.includes('_GD')) {
        return latestData.value >= 1 ? 'Close' : 'Open';
      } else if (latestData.name && latestData.name.includes('_SD')) {
        return latestData.value >= 1 ? 'Close' : 'Open';
      }
      return 'Active';
    },
    getPresentValue(id) {
      const latestData = this.findLatestDataById(id);
      return latestData.value;
    },
    shouldShowStatus(name) {
      return name && (name.includes('Status') || name.includes('_GD') || name.includes('_SD'));
    },
    getStatusClass(status) {
      return status === 'OK' ? 'ok' : 'not-ok';
    },
    getActiveClass(id) {
      const activeValue = this.getActiveValue(id);
      return activeValue === 'On' || activeValue === 'Open' ? 'ok' : 'not-ok';
    },
    formatValue(value) {
      const numValue = Number(value);
      return isNaN(numValue) ? 'N/A' : numValue.toFixed(1);
    },
    formatDate(dateTime) {
      if (!dateTime) return 'N/A';
      const date = new Date(dateTime);
      date.setHours(date.getHours() + 8); // Adjust for timezone difference
      return date.toISOString().replace('T', ' ').substr(0, 19);
    },
    adjustTimeZone(dateTime) {
      const date = new Date(dateTime);
      date.setHours(date.getHours() + 8); // Adjust for timezone difference
      return date.toISOString();
    },
    getValue(sensorName) {
      // Handle hardcoded sensors
      const hardcodedValues = {
        'STOP 1': 'Stop',
        'STOP 2': 'Stop',
        'STOP 3': 'Stop',
        'STOP 4': 'Stop',
        'STOP 5': 'Stop',
        'STOP 6': 'Stop',
        'OFF 1': 'Off',
        'OFF 2': 'Off',
        'OFF 3': 'Off',
        'OFF 4': 'Off',
        'OFF 5': 'Off',
        'ALARM': 'Alarm'
      };

      if (hardcodedValues[sensorName]) {
        return hardcodedValues[sensorName];
      }

      const sensorData = this.latestData.find(data => data.name === sensorName);
      if (sensorData) {
        console.log(`Sensor ${sensorName} found with value: ${sensorData.value}`);
        return `${this.formatValue(sensorData.value)} ${sensorData.unit || ''}`;
      } else {
        console.log(`Sensor ${sensorName} not found.`);
        return 'N/A';
      }
    },
    isSlantedNegative(sensorName) {
      return [
        'NCE-02/Energy.DATA.CHW-FLOW-RT',
        'NCE-02/Programming.AGILENT.CH-CHWR-TP'
      ].includes(sensorName);
    },
    isSlantedPositive(sensorName) {
      return [
        'NCE-02/Programming.AGILENT.CH-CHWR-TP',
        'NCE-02/Programming.AGILENT.CH-CHWS-TP'
      ].includes(sensorName);
    },
    updateLastUpdatedTime() {
      const now = new Date();
      now.setHours(now.getHours() + 8); // Adjust for timezone difference
      this.lastUpdated = now.toISOString().replace('T', ' ').substr(0, 19);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.nav-tabs .nav-item {
  margin-right: 5px;
}

.nav-tabs .nav-link {
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-tabs .nav-link.active {
  background-color: #007bff;
  color: white;
}

.image-container {
  position: relative;
  width: 100%; /* Ensure the image container is 100% of the parent */
}

.background-image {
  width: 100%;
  height: auto; /* Maintain aspect ratio */
}

.sensor-value {
  position: absolute;
  padding: 5px;
  border-radius: 3px;
  font-weight: bold;
  transform: translate(-50%, -50%); /* Center the sensor value on the position */
  color:black;
}


.slantedNegative {
  transform: rotate(-20deg);
}

.slantedPositive {
  transform: rotate(20deg);
}

.group-sensors {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sensor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.sensor-item {
  border: 1px solid lightgrey;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 18rem;
}

.status-label {
  display: inline-block;
  padding: 0.25em 0.6em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.ok {
  color: #fff;
  background-color: #28a745;
}

.not-ok {
  color: #fff;
  background-color: #dc3545;
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

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.grid-item {
  border: 1px solid lightgrey;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.last-updated {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 3px;
  font-weight: bold;
}
</style>
