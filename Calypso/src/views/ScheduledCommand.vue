<template>
    <div class="logs-container">
        <div class="logs-header">
            <h3>Schedule Command Logs</h3>
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
</template>

<script>
export default {
    data() {
        return {
            scheduleLogs: [] // Initialize as an empty array
        };
    },
    mounted() {
        console.log('Mounted: Retrieving command logs...');
        this.retrieveCommandLogs(); // Call the method to retrieve logs
    },
    methods: {
        retrieveCommandLogs() {
            const logs = JSON.parse(localStorage.getItem('commandLogs')) || [];
            console.log('Retrieved logs:', logs);
            this.scheduleLogs = logs; // Set the retrieved logs to the data property
        }
    }
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