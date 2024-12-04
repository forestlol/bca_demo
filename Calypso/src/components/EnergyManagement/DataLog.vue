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
                    <option>Location B</option>
                    <option>Location C</option>
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
                        <th>Accumulative Today (kWh)</th>
                        <th>Accumulative This Month (kWh)</th>
                        <th>Power Meter Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(device, index) in devices" :key="index">
                        <td>{{ device.name }}</td>
                        <td>{{ device.type }}</td>
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
                    <tr v-for="(fault, index) in faultLogs" :key="index">
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
                    name: "FCU 5",
                    status: "Not Working",
                    location: "Room A",
                    time: "10:30 AM",
                    date: "2024-12-03",
                },
            ], // Example fault log
        };
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

            const meterSNs = Object.keys(meterMap);

            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            yesterday.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);

            const startOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            );

            axios
                .get("https://geibms.com/message_history")
                .then((response) => {
                    const rawData = response.data.message_history;

                    console.log("Raw Data:", rawData);

                    const devicesData = meterSNs.map((meterSN) => {
                        const meterName = meterMap[meterSN];

                        const meterData = rawData.filter((entry) => entry.meterSN === meterSN);

                        console.log(`Data for ${meterName}:`, meterData);

                        const todayTimestamp = meterData.find((entry) =>
                            entry.datatime.startsWith(
                                now.toISOString().slice(0, 13).replace(/[-:T]/g, "")
                            )
                        );

                        const yesterdayTimestamp = meterData.find((entry) =>
                            entry.datatime.startsWith(
                                yesterday.toISOString().slice(0, 13).replace(/[-:T]/g, "")
                            )
                        );

                        const startOfMonthTimestamp = meterData.find((entry) =>
                            entry.datatime.startsWith(
                                startOfMonth.toISOString().slice(0, 13).replace(/[-:T]/g, "")
                            )
                        );

                        console.log(`Today (${meterName}):`, todayTimestamp);
                        console.log(`Yesterday (${meterName}):`, yesterdayTimestamp);
                        console.log(`Start of Month (${meterName}):`, startOfMonthTimestamp);

                        const accToday =
                            todayTimestamp && yesterdayTimestamp
                                ? parseFloat(todayTimestamp.EPI) -
                                parseFloat(yesterdayTimestamp.EPI)
                                : 0;

                        const accMonth =
                            todayTimestamp && startOfMonthTimestamp
                                ? parseFloat(todayTimestamp.EPI) -
                                parseFloat(startOfMonthTimestamp.EPI)
                                : 0;

                        console.log(`Accumulated Today for ${meterName}: ${accToday}`);
                        console.log(`Accumulated Month for ${meterName}: ${accMonth}`);

                        return {
                            name: meterName,
                            type: meterData.length > 0 ? meterData[0].type : "Unknown",
                            accToday: accToday.toFixed(2),
                            accMonth: accMonth.toFixed(2),
                            status: meterData.length > 0 ? meterData[0].meterStatus : "No Data",
                        };
                    });

                    this.devices = devicesData;
                    console.log("Devices Data:", this.devices);
                })
                .catch((error) => console.error("Error fetching accumulative data:", error));
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