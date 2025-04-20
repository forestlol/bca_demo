<template>
  <div class="data-log-container">
    <h2 class="text-center">Data Log</h2>

    <!-- Options Bar -->
    <div class="options-bar">
      <div class="option">
        <label for="location-sort">Sort Location:</label>
        <select id="location-sort" v-model="sortLocation">
          <option>All Locations</option>
          <option>Location A</option>
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
            <td colspan="5" class="text-center">No faults logged</td>
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
export default {
  name: 'DataLog',
  data() {
    return {
      sortLocation: 'All Locations',
      sortUsage: 'All',
      liveStatus: 'All',
      devices: [
        { name: 'Meter 1', type: 'VRF Aircon', location: 'Location A', accToday: '12.50', accMonth: '320.75', status: 'Online' },
        { name: 'Meter 2', type: 'VRF Aircon', location: 'Location A', accToday: '10.20', accMonth: '300.40', status: 'Online' },
        { name: 'Meter 3', type: 'VRF Aircon', location: 'Location A', accToday: '0.00', accMonth: '0.00', status: 'No Data' },
        { name: 'Meter 4', type: 'Lighting',   location: 'Location A', accToday: '45.80', accMonth: '1200.50', status: 'Online' }
      ],
      faultLogs: [
        { name: 'Meter 3', status: 'Not Working', location: 'Location A', time: '14:35', date: '2025-04-18' }
      ]
    };
  },
  computed: {
    filteredDevices() {
      let filtered = [...this.devices];

      if (this.sortLocation !== 'All Locations') {
        filtered = filtered.filter(d => d.location === this.sortLocation);
      }
      if (this.liveStatus !== 'All') {
        if (this.liveStatus === 'Online') {
          filtered = filtered.filter(d => d.status === 'Online');
        } else {
          filtered = filtered.filter(d => d.status !== 'Online');
        }
      }
      if (this.sortUsage === 'Day') {
        filtered.sort((a, b) => parseFloat(b.accToday) - parseFloat(a.accToday));
      } else if (this.sortUsage === 'Month') {
        filtered.sort((a, b) => parseFloat(b.accMonth) - parseFloat(a.accMonth));
      }
      return filtered;
    }
  }
};
</script>

<style scoped>
.data-log-container {
  padding: 20px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding-top: 5%;
}

.text-center { text-align: center; }

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
</style>