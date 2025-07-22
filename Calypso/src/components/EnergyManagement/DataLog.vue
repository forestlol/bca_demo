<template>
  <div class="data-log-container">
    <h2 class="text-center">Data Log</h2>

    <!-- Options Bar -->
    <div class="options-bar">
      <div class="option">
        <label for="location-sort">Sort Location:</label>
        <select id="location-sort" v-model="sortLocation">
          <option>All Locations</option>
          <option v-for="loc in locations" :key="loc">{{ loc }}</option>
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
          <tr v-for="(device, idx) in filteredDevices" :key="idx">
            <td>{{ device.name }}</td>
            <td>{{ device.type }}</td>
            <td>{{ device.location }}</td>
            <td>{{ device.accToday }}</td>
            <td>{{ device.accMonth }}</td>
            <!-- Online green, others red -->
            <td :class="device.status === 'Online' ? 'status-online' : 'status-offline'">
              {{ device.status }}
            </td>
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
            <td colspan="5" class="text-center">No faults logged</td>
          </tr>
          <tr v-else v-for="(fault, idx) in faultLogs" :key="idx">
            <td>{{ fault.name }}</td>
            <!-- always red -->
            <td class="status-offline">{{ fault.status }}</td>
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
export default {
  name: 'DataLog',
  data() {
    return {
      sortLocation: 'All Locations',
      sortUsage: 'All',
      liveStatus: 'All',
      devices: [
        // Location A
        { name: 'Meter 1', type: 'VRF Aircon', location: 'Location A', accToday: '12.50', accMonth: '320.75', status: 'Online' },
        { name: 'Meter 2', type: 'VRF Aircon', location: 'Location A', accToday: '10.20', accMonth: '300.40', status: 'Online' },
        { name: 'Meter 3', type: 'VRF Aircon', location: 'Location A', accToday: '0.00', accMonth: '0.00', status: 'No Data' },
        { name: 'Meter 4', type: 'Lighting', location: 'Location A', accToday: '45.80', accMonth: '1200.50', status: 'Online' },
        // Location B
        { name: 'Meter 5', type: 'Chiller', location: 'Location B', accToday: '30.10', accMonth: '850.30', status: 'Online' },
        { name: 'Meter 6', type: 'Elevator', location: 'Location B', accToday: '5.00', accMonth: '150.00', status: 'Offline' },
        { name: 'Meter 7', type: 'Lighting', location: 'Location B', accToday: '22.45', accMonth: '600.20', status: 'Online' },
        // Location C
        { name: 'Meter 8', type: 'Pump', location: 'Location C', accToday: '18.75', accMonth: '500.00', status: 'Online' },
        { name: 'Meter 9', type: 'UPS', location: 'Location C', accToday: '8.90', accMonth: '240.60', status: 'No Data' },
        { name: 'Meter 10', type: 'Lighting', location: 'Location C', accToday: '50.00', accMonth: '1300.80', status: 'Online' }
      ],
      faultLogs: [
        { name: 'Meter 3', status: 'Not Working', location: 'Location A', time: '14:35', date: '2025-04-18' },
        { name: 'Meter 6', status: 'Offline', location: 'Location B', time: '09:12', date: '2025-07-01' },
        { name: 'Meter 9', status: 'No Data', location: 'Location C', time: '11:45', date: '2025-06-20' }
      ]
    };
  },
  computed: {
    locations() {
      return [...new Set(this.devices.map(d => d.location))];
    },
    filteredDevices() {
      let flt = [...this.devices];
      if (this.sortLocation !== 'All Locations') {
        flt = flt.filter(d => d.location === this.sortLocation);
      }
      if (this.liveStatus !== 'All') {
        flt = this.liveStatus === 'Online'
          ? flt.filter(d => d.status === 'Online')
          : flt.filter(d => d.status !== 'Online');
      }
      if (this.sortUsage === 'Day') {
        flt.sort((a, b) => parseFloat(b.accToday) - parseFloat(a.accToday));
      } else if (this.sortUsage === 'Month') {
        flt.sort((a, b) => parseFloat(b.accMonth) - parseFloat(a.accMonth));
      }
      return flt;
    }
  }
};
</script>

<style scoped>
.data-log-container {
  padding: 20px;
  margin: 5% auto;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.text-center {
  text-align: center;
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

/* Formatter classes */
.status-online {
  color: green;
}

.status-offline {
  color: red;
}
</style>
