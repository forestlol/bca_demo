<template>
    <div class="data-log-container">
        <h2 class="text-center">Data Log</h2>
        <!-- Options Bar -->
        <div class="options-bar">
            <div class="option">
                <label for="location-sort">Sort Location:</label>
                <select id="location-sort">
                    <option>All Locations</option>
                    <option>Location A</option>
                    <option>Location B</option>
                    <option>Location C</option>
                </select>
            </div>
            <div class="option">
                <label for="power-usage-sort">Sort Most Power Usage Over:</label>
                <select id="power-usage-sort">
                    <option>All</option>
                    <option>Day</option>
                    <option>Month</option>
                </select>
            </div>
            <div class="option">
                <label for="live-status">Live Status:</label>
                <select id="live-status">
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
                    <tr>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
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
                    <tr>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name: "DataLog",
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
</style>
