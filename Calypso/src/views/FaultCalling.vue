<template>
  <div class="fault-calling-container">
    <!-- Back Button -->
    <router-link to="/automation-management" class="back-button">
      <i class="fas fa-arrow-left"></i> Back
    </router-link>

    <!-- Top Section -->
    <div class="top-section">
      <h3 class="title">Device Fault Log (To Set in Settings)</h3>
      <button class="download-button" @click="downloadSpreadsheet">Download Spreadsheet</button>
    </div>

    <!-- Fault Log Table -->
    <table class="fault-log-table">
      <thead>
        <tr>
          <th>Meter Name</th>
          <th>Description</th>
          <th>Location</th>
          <th>Status</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(fault, index) in faultLogs" :key="index">
          <td>{{ fault.meterName }}</td>
          <td>{{ fault.description }}</td>
          <td>{{ fault.location }}</td>
          <td :class="{ 'green-text': fault.status === 'Resolved', 'red-text': fault.status === 'Unresolved' }">
            {{ fault.status }}
          </td>
          <td>{{ fault.time }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Conditional Logic Section -->
    <div class="conditional-logic-section">
      <h4>Conditional Logic for Alerts</h4>
      <p>Select how to receive alerts:</p>
      <div class="logic-options">
        <label>
          <input type="checkbox" v-model="alertMethods.email" />
          Send Email
        </label>
        <label>
          <input type="checkbox" v-model="alertMethods.call" />
          Make Call
        </label>
        <label>
          <input type="checkbox" v-model="alertMethods.whatsapp" />
          Send WhatsApp
        </label>
      </div>
      <button @click="saveAlertSettings">Save Alert Settings</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      faultLogs: [
        {
          meterName: "Meter 1",
          description: "Overheating detected",
          location: "Room A",
          status: "Unresolved",
          time: "2024-12-05 14:30",
        },
        {
          meterName: "Meter 3",
          description: "Low power supply",
          location: "Room B",
          status: "Resolved",
          time: "2024-12-05 12:15",
        },
        {
          meterName: "Lighting Meter",
          description: "Connection error",
          location: "Main Hall",
          status: "Unresolved",
          time: "2024-12-05 10:00",
        },
      ],
      alertMethods: {
        email: false,
        call: false,
        whatsapp: false,
      },
    };
  },
  methods: {
    downloadSpreadsheet() {
      // Functionality to generate and download spreadsheet
      alert("Spreadsheet download triggered!");
    },
    saveAlertSettings() {
      const selectedMethods = Object.keys(this.alertMethods)
        .filter((key) => this.alertMethods[key])
        .map((method) => method.charAt(0).toUpperCase() + method.slice(1));
      if (selectedMethods.length === 0) {
        alert("No alert method selected. Please choose at least one.");
      } else {
        alert(`Alert settings saved: ${selectedMethods.join(", ")}`);
      }
    },
  },
};
</script>

<style scoped>
.fault-calling-container {
  padding: 20px;
  background-color: #f5f5f5;
  color: black;
  border-radius: 10px;
  padding-top: 5%;
}

.back-button {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 16px;
  text-decoration: none;
  color: #007bff;
}

.back-button i {
  margin-right: 5px;
}

.back-button:hover {
  color: #0056b3;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.download-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.download-button:hover {
  background-color: #0056b3;
}

.fault-log-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.fault-log-table th,
.fault-log-table td {
  border: 1px solid #444;
  padding: 10px;
  text-align: left;
}

.fault-log-table th {
  background-color: #cecece;
  font-weight: bold;
}

.fault-log-table tr:nth-child(even) {
  background-color: #cecece;
}

.green-text {
  color: green;
  font-weight: bold;
}

.red-text {
  color: red;
  font-weight: bold;
}

.conditional-logic-section {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-top: 20px;
}

.logic-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.logic-options label {
  font-weight: bold;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #0056b3;
}
</style>
