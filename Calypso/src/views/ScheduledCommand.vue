<template>
    <div class="logs-container">
        <!-- Back Button -->
        <button class="back-btn" @click="$router.back()">
            <i class="fas fa-arrow-left"></i>
            Back
        </button>
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
                        <span
                            :class="{ 'green-text': log.status === 'Success', 'red-text': log.status === 'Unsuccessful' }">
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
    margin-top: 70px;
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

.back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    padding: 7px 18px;
    margin-bottom: 18px;
    cursor: pointer;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: background 0.2s;
}

.back-btn:hover {
    background: #0056b3;
}

.back-btn i {
    font-size: 16px;
}
</style>