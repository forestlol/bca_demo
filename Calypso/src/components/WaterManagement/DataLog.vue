<template>
    <div class="data-log-container">
        <h2 class="text-center">Device Consumption Data</h2>

        <!-- Options Bar -->
        <div class="options-bar">
            <div class="option">
                <label for="location-sort">Sort Location:</label>
                <select id="location-sort" v-model="selectedLocation">
                    <option value="">All Locations</option>
                    <option v-for="loc in uniqueLocations" :key="loc" :value="loc">{{ loc }}</option>
                </select>
            </div>
            <div class="option">
                <label for="power-usage-sort">Sort Most Power Usage Over:</label>
                <select id="power-usage-sort" v-model="powerUsageSortPeriod">
                    <option value="all">All</option>
                    <option value="daily">Day</option>
                    <option value="monthly">Month</option>
                </select>
            </div>
        </div>

        <!-- Data Table -->
        <div class="table-container">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Dev EUI</th>
                        <th>Category</th>
                        <!-- Conditionally show columns based on powerUsageSortPeriod -->
                        <th v-if="powerUsageSortPeriod === 'all'">Total Consumption (m³)</th>
                        <th v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'daily'">Daily Consumption
                            (m³)</th>
                        <th v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'monthly'">Monthly
                            Consumption (m³)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="device in allSortedDevices" :key="device.id">
                        <td>{{ device.device_name }}</td>
                        <td>{{ device.dev_eui || "N/A" }}</td>
                        <td>{{ device.category || getCategory(device) }}</td>
                        <td v-if="powerUsageSortPeriod === 'all'">{{ device.totalConsumption || "0.00" }} m³</td>
                        <td v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'daily'">{{
                            device.dailyConsumption }} m³</td>
                        <td v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'monthly'">{{
                            device.monthlyConsumption }} m³</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- New Device Fault Log Table -->
        <div class="device-fault-log-container" v-if="faultDevices.length">
            <h2 class="text-center">Device Fault Log</h2>
            <div class="table-container">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Device</th>
                            <th>Dev EUI</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="device in faultDevices" :key="device.id">
                            <td>{{ device.device_name }}</td>
                            <td>{{ device.dev_eui }}</td>
                            <td>{{ device.category || getCategory(device) }}</td>
                            <td>Fault</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
export default {
    name: "DataLog",
    data() {
        return {
            selectedLocation: "",           // For filtering by device name (location)
            powerUsageSortPeriod: "all", // "all", "daily", or "monthly"
            sortColumn: 'device_name', // default sort column
            sortOrder: 'asc', // can be 'asc' or 'desc'
            devices: [], // This will be populated by your fetchDevicesData method.
            categorizedDevices: {
                "Cooling Tower": [
                    { id: 1, dev_eui: "8254812403000465", device_name: "Cooling Tower 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 2, dev_eui: "8254812403000462", device_name: "Cooling Tower 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 3, dev_eui: "8254812403000482", device_name: "Cooling Tower 3", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 4, dev_eui: "8254812403000447", device_name: "Cooling Tower 4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 5, dev_eui: "8254812403000653", device_name: "Cooling Tower 5", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
                ],
                "Female Toilet": [
                    { id: 6, dev_eui: "8254812403000643", device_name: "Female Toilet 4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 7, dev_eui: "8254812312000003", device_name: "Female Toilet 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 12, dev_eui: "8254812403000644", device_name: "Female Toilet 3", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
                ],
                "Male Toilet": [
                    { id: 8, dev_eui: "8254812403000652", device_name: "Male Toilet 5", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 9, dev_eui: "8254812312000004", device_name: "Male Toilet 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 18, dev_eui: "8254812403000659", device_name: "Male Toilet 6", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 28, dev_eui: "8254812307000002", device_name: "Male Toilet 7", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 25, dev_eui: "8254812211000169", device_name: "Male Toilet 8", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
                ],
                "FPI": [
                    { id: 10, dev_eui: "8254812403000632", device_name: "FPI-8", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 13, dev_eui: "8254812307000010", device_name: "FPI-6", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 14, dev_eui: "8254812403000528", device_name: "FPI-2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 15, dev_eui: "8254812403000578", device_name: "FPI-4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 16, dev_eui: "8254812307000004", device_name: "FPI-10", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 19, dev_eui: "8254812401000105", device_name: "FPI-5", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 20, dev_eui: "8254812307000005", device_name: "FPI-7", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 21, dev_eui: "8254812307000007", device_name: "FPI-9", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
                ],
                "Steam Clean": [
                    { id: 11, dev_eui: "8254812211000168", device_name: "Steam Clean 3", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 17, dev_eui: "8254812403000432", device_name: "Steam Clean 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
                ],
                "Scrubber": [
                    { id: 26, dev_eui: "8254812307000008", device_name: "Scrubber 2", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 27, dev_eui: "8254812307000014", device_name: "Scrubber 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
                ],
                "Other Devices": [
                    { id: 22, dev_eui: "8254812401000104", device_name: "Salt Bath", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 23, dev_eui: "8254812307000009", device_name: "Chemical Line 1", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 24, dev_eui: "8254812307000003", device_name: "Kitchen", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 29, dev_eui: "8254812211000171", device_name: "Main 4", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" },
                    { id: 30, dev_eui: "8254812211000172", device_name: "Main 6", meterReading: "N/A", batteryVoltage: "N/A", measureMode: "N/A", valveStatus: "N/A" }
                ]
            },
            loadingDevices: false
        };
    },
    computed: {
        faultDevices() {
            const combinedEUIs = ["8254812307000003", "8254812211000171", "8254812211000172"];
            return this.devices.filter(device => {
                // Exclude devices that are part of the combined Main 6 group
                if (combinedEUIs.includes(device.dev_eui)) {
                    return false;
                }
                const total = parseFloat(device.totalConsumption) || 0;
                const daily = parseFloat(device.dailyConsumption) || 0;
                const monthly = parseFloat(device.monthlyConsumption) || 0;
                return total === 0 && daily === 0 && monthly === 0;
            });
        },
        uniqueLocations() {
            const combinedEUIs = ["8254812307000003", "8254812211000171", "8254812211000172"];
            // For each device, if it's in the combined group, return "Main 6"
            const locations = this.devices.map(device => {
                return combinedEUIs.includes(device.dev_eui)
                    ? "Main 6"
                    : device.device_name;
            });
            // Return only unique values
            return [...new Set(locations)];
        },
        filteredDevices() {
            const combinedEUIs = ["8254812307000003", "8254812211000171", "8254812211000172"];
            if (!this.selectedLocation) return this.devices;
            return this.devices.filter(device => {
                // Map devices in the combined group to "Main 6" for filtering
                const location = combinedEUIs.includes(device.dev_eui)
                    ? "Main 6"
                    : device.device_name;
                return location === this.selectedLocation;
            });
        },
        combinedMain6() {
            const combinedEUIs = [
                "8254812307000003", // Kitchen
                "8254812211000171", // Main 4
                "8254812211000172"  // Main 6
            ];
            const devicesToCombine = this.devices.filter(device =>
                combinedEUIs.includes(device.dev_eui)
            );
            if (!devicesToCombine.length) return null;
            const totalConsumption = devicesToCombine.reduce(
                (sum, device) => sum + (parseFloat(device.totalConsumption) || 0), 0
            );
            const dailyConsumption = devicesToCombine.reduce(
                (sum, device) => sum + (parseFloat(device.dailyConsumption) || 0), 0
            );
            const monthlyConsumption = devicesToCombine.reduce(
                (sum, device) => sum + (parseFloat(device.monthlyConsumption) || 0), 0
            );
            return {
                device_name: "Main 6",
                totalConsumption: totalConsumption.toFixed(2),
                dailyConsumption: dailyConsumption.toFixed(2),
                monthlyConsumption: monthlyConsumption.toFixed(2)
            };
        },
        totalWaterConsumption() {
            return this.devices.reduce(
                (sum, device) => sum + (parseFloat(device.totalConsumption) || 0), 0
            ).toFixed(2);
        },
        totalDailyConsumption() {
            return this.devices.reduce(
                (sum, device) => sum + (parseFloat(device.dailyConsumption) || 0), 0
            ).toFixed(2);
        },
        totalMonthlyConsumption() {
            return this.devices.reduce(
                (sum, device) => sum + (parseFloat(device.monthlyConsumption) || 0), 0
            ).toFixed(2);
        },
        allSortedDevices() {
            let arr = [];
            const combinedEUIs = ["8254812307000003", "8254812211000171", "8254812211000172"];
            // Only add the combined row if no location filter is applied or if the filter is "Main 6"
            if ((!this.selectedLocation || this.selectedLocation === "Main 6") && this.combinedMain6) {
                arr.push({
                    id: "combined",
                    device_name: this.combinedMain6.device_name,
                    dev_eui: "8254812211000172", // Show Main 6's dev_eui
                    category: "Other Devices",
                    totalConsumption: this.combinedMain6.totalConsumption,
                    dailyConsumption: this.combinedMain6.dailyConsumption,
                    monthlyConsumption: this.combinedMain6.monthlyConsumption
                });
            }
            // Append all other devices (those not in the combined group)
            arr = arr.concat(
                this.filteredDevices.filter(device => !combinedEUIs.includes(device.dev_eui))
            );

            // Determine which consumption field to sort by
            let sortKey = "totalConsumption";
            if (this.powerUsageSortPeriod === "daily") {
                sortKey = "dailyConsumption";
            } else if (this.powerUsageSortPeriod === "monthly") {
                sortKey = "monthlyConsumption";
            }
            // Sort in descending order (most consumption first)
            arr.sort((a, b) => (parseFloat(b[sortKey]) || 0) - (parseFloat(a[sortKey]) || 0));
            return arr;
        }

    },
    methods: {
        changeSort(column) {
            if (this.sortColumn === column) {
                // Toggle the order if the same column is clicked again
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortOrder = 'asc';
            }
        },
        toggleSort() {
            this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        },
        getCategory(device) {
            // Look up the category from your categorizedDevices data.
            for (const [category, devices] of Object.entries(this.categorizedDevices)) {
                if (devices.some(d => d.dev_eui === device.dev_eui)) {
                    return category;
                }
            }
            return "Unknown";
        },
        fetchDevicesData() {
            this.loadingDevices = true;
            // Flatten your categorizedDevices into this.devices
            this.devices = Object.values(this.categorizedDevices).flat();
            // Then call your methods to update metrics:
            Promise.all(
                this.devices.map((device) => this.fetchMetricsForDevice(device))
            )
                .then(() => {
                    return Promise.all(this.devices.map(device => this.fetchDailyConsumption(device)));
                })
                .then(() => {
                    return Promise.all(this.devices.map(device => this.fetchMonthlyConsumption(device)));
                })
                .then(() => {
                    this.loadingDevices = false;
                })
                .catch((error) => {
                    console.error("Error fetching device data:", error);
                    this.loadingDevices = false;
                });
        },
        fetchMetricsForDevice(device) {
            return axios
                .get("https://b513-119-234-9-157.ngrok-free.app/api/total_consumption", {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    }
                })
                .then((response) => {
                    console.log(`RAW Response for Total Consumption:`, response.data);

                    // Check that the response contains an array of total_consumption data.
                    if (
                        !response.data ||
                        !response.data.total_consumption ||
                        !Array.isArray(response.data.total_consumption)
                    ) {
                        console.warn("Invalid response format for total consumption:", response.data);
                        return;
                    }

                    // Find the matching device by comparing dev_eui.
                    const matchedDevice = response.data.total_consumption.find(
                        (item) => item.dev_eui === device.dev_eui
                    );

                    if (matchedDevice) {
                        // Update the device's totalConsumption using the value from the API.
                        device.totalConsumption = parseFloat(matchedDevice.total_consumption).toFixed(2);

                        // Optionally update the device name if needed.
                        device.device_name = matchedDevice.device_name;

                        // Optionally update the highest consumption device if this device's consumption is higher.
                        const deviceConsumption = parseFloat(device.totalConsumption) || 0;
                        const currentHighest = parseFloat(this.highestConsumptionValue) || 0;
                        if (deviceConsumption > currentHighest) {
                            this.highestConsumptionValue = device.totalConsumption;
                            this.highestConsumptionDevice = device.dev_eui;
                        }
                    } else {
                        console.warn(`No total consumption data found for device dev_eui: ${device.dev_eui}`);
                    }
                })
                .catch((error) => {
                    console.error(`Error fetching total consumption for device ${device.dev_eui}:`, error);
                });
        },
        // Add this function inside the methods section of your Vue component.
        fetchDailyConsumption(device) {
            // Compute yesterday's date in YYYY-MM-DD format.
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0]; // e.g., "2025-02-06"

            return axios
                .get(`https://b513-119-234-9-157.ngrok-free.app/api/daily_usage/${device.id}`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    }
                })
                .then((response) => {
                    console.log(`RAW Daily Usage Response for Device ${device.id}:`, response.data);

                    if (
                        response.data &&
                        response.data.daily_usage &&
                        Array.isArray(response.data.daily_usage)
                    ) {
                        // Find the record for yesterday.
                        const yesterdayData = response.data.daily_usage.find(
                            (entry) => entry.timestamp === yesterdayStr
                        );

                        if (yesterdayData && yesterdayData.dailyWaterUsage !== undefined) {
                            device.dailyConsumption = parseFloat(yesterdayData.dailyWaterUsage).toFixed(2);
                        } else {
                            console.warn(
                                `No daily usage data found for ${yesterdayStr} for device ${device.id}`,
                                response.data.daily_usage
                            );
                            device.dailyConsumption = "0";
                        }
                    } else {
                        console.warn(`Invalid daily usage response for device ${device.id}:`, response.data);
                        device.dailyConsumption = "0";
                    }
                    return device.dailyConsumption;
                })
                .catch((error) => {
                    console.error(`Error fetching daily usage for device ${device.id}:`, error);
                    device.dailyConsumption = "0";
                    return device.dailyConsumption;
                });
        },
        fetchMonthlyConsumption(device) {
            return axios
                .get(`https://b513-119-234-9-157.ngrok-free.app/api/daily_usage/${device.id}`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    }
                })
                .then((response) => {
                    console.log(`RAW Daily Usage Response for monthly consumption for Device ${device.id}:`, response.data);

                    if (
                        response.data &&
                        response.data.daily_usage &&
                        Array.isArray(response.data.daily_usage)
                    ) {
                        const now = new Date();
                        const currentYear = now.getFullYear();
                        const currentMonth = now.getMonth(); // Note: 0-indexed (0 = January)

                        // Filter the daily_usage records for those in the current month
                        const monthlyRecords = response.data.daily_usage.filter((entry) => {
                            const entryDate = new Date(entry.timestamp);
                            return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
                        });

                        // Sum the dailyWaterUsage values for these records
                        const monthlySum = monthlyRecords.reduce((sum, entry) => {
                            return sum + (parseFloat(entry.dailyWaterUsage) || 0);
                        }, 0);

                        // Update the device object (formatted to 2 decimals)
                        device.monthlyConsumption = monthlySum.toFixed(2);
                    } else {
                        console.warn(`Invalid monthly usage response for device ${device.id}:`, response.data);
                        device.monthlyConsumption = "N/A";
                    }
                    return device.monthlyConsumption;
                })
                .catch((error) => {
                    console.error(`Error fetching monthly usage for device ${device.id}:`, error);
                    device.monthlyConsumption = "N/A";
                    return device.monthlyConsumption;
                });
        }
    },
    mounted() {
        this.fetchDevicesData();
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
}

.text-center {
    text-align: center;
}

.summary-header {
    text-align: center;
    margin-bottom: 20px;
}

.summary-header p {
    margin: 5px 0;
    font-size: 16px;
    font-weight: bold;
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