<template>
    <div class="logs-container">
        <!-- Existing Conditional Command Logs Table -->
        <h3 class="logs-header">Conditional Command Logs</h3>
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
                <tr v-for="(log, index) in logs" :key="index">
                    <td>{{ log.date }}</td>
                    <td>{{ log.commandType }}</td>
                    <td :class="{ 'green-text': log.state === 'ON', 'red-text': log.state === 'OFF' }">
                        {{ log.state }}
                    </td>
                    <td>
                        <span :class="{
                            'green-text': log.status === 'Success',
                            'red-text': log.status === 'Unsuccessful'
                        }">
                            {{ log.status === 'Success' ? '✅' : '❌' }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <br>
    <div class="logs-container">
        <!-- New Conditional Logic Table -->
        <h3 class="logs-header" style="margin-top: 30px;">Conditional Logic</h3>
        <table class="logs-table">
            <thead>
                <tr>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Operational Settings</th>
                    <th>Mode</th>
                    <th>Period</th>
                    <th>Timing</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in conditionalLogicData" :key="index">
                    <td>{{ item.device }}</td>
                    <td>{{ item.location }}</td>
                    <td>{{ item.operationalSettings }}</td>
                    <!-- Use a fallback of '-' if mode/timing is empty or missing -->
                    <td>{{ item.mode || '-' }}</td>
                    <td>{{ item.period || '-' }}</td>
                    <td>{{ item.timing || '-' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script>
export default {
    data() {
        return {
            logs: [
                { date: "2024-12-03", commandType: "Adjust Temp", state: "OFF", status: "Unsuccessful" },
                { date: "2024-12-03", commandType: "Mode Switch", state: "ON", status: "Success" },
                { date: "2024-12-03", commandType: "Turn Off", state: "OFF", status: "Unsuccessful" },
            ],
            // New data for Conditional Logic
            conditionalLogicData: [
                {
                    device: "Aircon",
                    location: "Canteen",
                    operationalSettings: "Automatic Switch Mode - Set Temp 24 Degree",
                    mode: "Sensor Mode",
                    period: "Weekday",
                    timing: "All Day",
                },
                {
                    device: "Aircon",
                    location: "Canteen",
                    operationalSettings: "Set Temp 22 Degree - Sensor Mode (Minimal Activity)",
                    mode: "Sensor Mode",
                    period: "Weekday",
                    timing: "All Day",
                },
                {
                    device: "Aircon",
                    location: "Canteen",
                    operationalSettings: "Set Temp 24 Degree - Silent Mode (no activity half zones for more than 20mins)",
                    mode: "Silent Mode",
                    period: "Weekday",
                    timing: "All Day",
                },
                {
                    device: "Aircon",
                    location: "Canteen",
                    operationalSettings: "Set Temp 19 Degree - Busy Mode (1 aircon at a time)",
                    mode: "Busy Mode",
                    period: "Weekday",
                    timing: "All Day",
                },
                {
                    device: "Aircon",
                    location: "Canteen",
                    operationalSettings: "Set Temp 24 Degree - Sensor Mode (Minimal Activity)",
                    mode: "Sensor Mode",
                    period: "Weekend",
                    timing: "All Day",
                },
                {
                    device: "Aircon",
                    location: "Canteen",
                    operationalSettings: "Set Temp 22 Degree - Busy Mode",
                    mode: "Busy Mode",
                    period: "Weekend",
                    timing: "All Day",
                },
                {
                    device: "Lighting",
                    location: "Canteen",
                    operationalSettings: "Automatic Switch Mode - On/Off, Lights remain on for 30 mins if activity detected",
                    mode: "",
                    period: "Weekday",
                    timing: "0800-1700",
                },
                {
                    device: "Lighting",
                    location: "Canteen",
                    operationalSettings: "Lights remain on for 10 mins if activity detected",
                    mode: "",
                    period: "Weekday",
                    timing: "1701-0759",
                },
                {
                    device: "Lighting",
                    location: "Canteen",
                    operationalSettings: "Automatic Switch Mode - On/Off, Lights remain on for 10 mins if activity detected",
                    mode: "",
                    period: "Weekend",
                    timing: "All Day",
                },
                {
                    device: "Lighting",
                    location: "Canteen",
                    operationalSettings: "If no activity for more than 10 minutes, lights will turn off for the zone",
                    mode: "",
                    period: "Weekend",
                    timing: "",
                },
            ],
        };
    },
};

</script>
<style scoped>
.logs-container {
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    color: black;
    border-radius: 10px;
    padding: 20px;
}

.logs-header {
    font-size: 18px;
    margin-bottom: 15px;
    font-weight: bold;
}

.logs-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
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

.green-text {
    color: green;
    font-weight: bold;
}

.red-text {
    color: red;
    font-weight: bold;
}
</style>
