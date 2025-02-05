<template>
    <div class="dashboard-container">
        <div class="dashboard-view">
            <!-- Header Row -->
            <div class="header-row">
                <!-- Title on the Left -->
                <h2 class="dashboard-title">Dashboard</h2>

                <!-- Breadcrumbs on the Right -->
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Cavill</span>
                    <span class="breadcrumb-separator">></span>
                    <span class="breadcrumb-item">Management</span>
                    <span class="breadcrumb-separator">></span>
                    <span class="breadcrumb-item active">Dashboard</span>
                </nav>
            </div>
            <!-- Top Cards -->
            <div class="top-cards">
                <DashboardCard color="#625a9b" title="Water Consumption (m³)" :value="waterConsumptionToday"
                    description="Total consumption today">
                    <template #icon>
                        <i class="fas fa-tint"></i>
                    </template>
                </DashboardCard>

                <DashboardCard color="#42abb7" title="Water Consumption (m³)" :value="waterConsumptionMonthly"
                    description="Total consumption this month">
                    <template #icon>
                        <i class="fas fa-calendar-alt"></i>
                    </template>
                </DashboardCard>

                <DashboardCard color="#00484a" title="Highest Consumption Device" :value="`${highestConsumptionValue} m³`"
                    :description="`Device: ${highestConsumptionDevice}`" link="/water-management/deviceFloorplan">
                    <template #icon>
                        <i class="fas fa-plug"></i>
                    </template>
                </DashboardCard>

                <DashboardCard color="#245d75" title="Devices All Operational" value="Normal">
                    <template #icon>
                        <i class="fas fa-leaf"></i>
                    </template>
                </DashboardCard>
            </div>

            <!-- Middle Row -->
            <div class="middle-row">
                <div class="card floorplan">
                    <div class="floorplan-header">
                        <h3>Select Location</h3>
                        <button class="add-button" @click="navigateToFloorplan()">+</button>
                    </div>
                    <select v-model="selectedImage" @change="changeFloorplan">
                        <option v-for="option in floorplanOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <img :src="require(`@/assets/${selectedImage}`)" :alt="selectedImage" class="floorplan-img" />
                </div>

                <div class="card power-usage-hourly">
                    <h3>Water Meter Usage (m³) for the Day</h3>
                    <div class="chart-wrapper">
                        <PowerHourlyChart :data="hourlyChartData" />
                    </div>
                    <button class="add-button" @click="navigateToChart()">+</button>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="bottom-row">
                <div class="card power-usage-daily">
                    <h3>Water Meter Usage (m³), over 7 days</h3>
                    <div class="chart-wrapper">
                        <PowerDailyChart :data="dailyChartData" />
                    </div>
                    <button class="add-button" @click="navigateToChart()">+</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import * as XLSX from "xlsx";
import axios from "axios";
import DashboardCard from "@/components/DashboardCard.vue";
import PowerHourlyChart from "../components/WaterHourlyChart.vue";
import PowerDailyChart from "../components/WaterDailyChart.vue";

export default {
    components: {
        DashboardCard,
        PowerHourlyChart,
        PowerDailyChart,
    },
    data() {
        return {
            highestConsumptionDevice: "N/A",
            highestConsumptionValue: "0.00",
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
            aggregatedData: {},
            differencesBySensor: {}, // Initialize as an empty object
            isDataLoaded: false, // Loading flag
            highestPowerUsage: "0 kWh", // Default as a string if it's a string
            totalGateways: 0,
            hourlyChartData: [], // Hourly chart data
            dailyChartData: [], // Daily chart data
            intervalId: null, // For periodic data fetching
            floorplanOptions: [
                { label: "Water Meter Pin Location", value: "WaterMap.png" },
            ],
            selectedImage: "WaterMap.png", // Default image
            devices: [],
            loadingDevices: false,
        };
    },
    methods: {
        navigateToFloorplan() {
            this.$router.push("/water-management/historical-data"); // Replace with your actual route
        },
        navigateToChart() {
            this.$router.push("/water-management/historical-data"); // Replace with your actual route
        },
        async loadWaterMeterData() {
            try {
                const response = await fetch("/WaterMeterData.xlsx"); // Adjust path
                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: "binary" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                this.processWaterMeterData(data);
            } catch (error) {
                console.error("Error loading Water Meter Data:", error);
            }
        },
        processWaterMeterData(data) {
            const today = new Date().toISOString().split("T")[0];
            const currentMonth = new Date().getMonth();
            let totalToday = 0;
            let totalMonthly = 0;
            let highestDevice = { name: "N/A", value: 0 };

            const dailyData = {};
            const monthlyData = {};
            const deviceReadings = {};

            data.slice(1).forEach((row) => {
                const [DeviceName, ReadingMeterTimeRaw, MeterReading] = [
                    row[1],
                    row[10], // Raw date from Excel
                    parseFloat(row[16]) || 0,
                ];

                // Validate the date
                const ReadingMeterTime = ReadingMeterTimeRaw ? new Date(ReadingMeterTimeRaw) : null;
                if (!ReadingMeterTime || isNaN(ReadingMeterTime.getTime())) {
                    console.warn(`Skipping invalid date: ${ReadingMeterTimeRaw}`);
                    return;
                }

                const readingDate = ReadingMeterTime.toISOString().split("T")[0];

                // Track device readings by date
                if (!deviceReadings[DeviceName]) {
                    deviceReadings[DeviceName] = {};
                }
                deviceReadings[DeviceName][readingDate] = MeterReading;

                // Aggregate Daily and Monthly Totals
                if (readingDate === today) {
                    totalToday += MeterReading;
                }
                if (ReadingMeterTime.getMonth() === currentMonth) {
                    totalMonthly += MeterReading;
                }

                // Aggregate daily data for the chart
                if (!dailyData[readingDate]) dailyData[readingDate] = 0;
                dailyData[readingDate] += MeterReading;

                // Aggregate monthly data for the chart
                const monthKey = `${ReadingMeterTime.getFullYear()}-${(ReadingMeterTime.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}`;
                if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
                monthlyData[monthKey] += MeterReading;
            });

            // Calculate highest consumption device based on differences
            Object.entries(deviceReadings).forEach(([device, readings]) => {
                const sortedDates = Object.keys(readings).sort((a, b) => new Date(a) - new Date(b));
                const latestReading = readings[sortedDates[sortedDates.length - 1]];
                const previousReading = readings[sortedDates[sortedDates.length - 2]] || 0;
                const consumption = latestReading - previousReading;

                if (consumption > highestDevice.value) {
                    highestDevice = { name: device, value: consumption };
                }
            });

            // (Optional) Prepare chart data...
            // ... your code for dailyChartData and monthlyChartData

            // Update component data
            this.waterConsumptionToday = totalToday.toFixed(2);
            this.waterConsumptionMonthly = totalMonthly.toFixed(2);

            // **Update both highest consumption device and value**
            this.highestConsumptionDevice = highestDevice.name;
            this.highestConsumptionValue = highestDevice.value.toFixed(2);
        },


        fetchDevicesData() {
            this.loadingDevices = true;
            this.devices = Object.values(this.categorizedDevices).flat();

            console.log("Fetching data for devices:", this.devices);

            Promise.all(
                this.devices.map((device) => this.fetchMetricsForDevice(device))
            )
                .then(() => {
                    console.log("All device metrics fetched successfully.");
                    this.loadingDevices = false;

                    // Calculate the highest consumption device based on the totalConsumption property
                    let highestDevice = { name: "N/A", value: 0 };
                    this.devices.forEach((device) => {
                        // Parse totalConsumption as a float (if it's "N/A", fallback to 0)
                        const consumption = parseFloat(device.totalConsumption) || 0;
                        if (consumption > highestDevice.value) {
                            highestDevice = { name: device.device_name, value: consumption };
                        }
                    });

                    // Update data properties for the DashboardCard
                    this.highestConsumptionDevice = highestDevice.name;
                    this.highestConsumptionValue = highestDevice.value.toFixed(2);
                })
                .catch((error) => {
                    console.error("Error fetching device metrics:", error);
                    this.loadingDevices = false;
                });
        },
        fetchMetricsForDevice(device) {
            axios
                .get(`https://b513-119-234-9-157.ngrok-free.app/api/device_data/${device.id}`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    }
                })
                .then((response) => {
                    console.log(`RAW Response for Device ${device.id}:`, response.data);

                    if (
                        !response.data ||
                        !response.data.data ||
                        !Array.isArray(response.data.data) ||
                        response.data.data.length === 0
                    ) {
                        console.warn(
                            `Invalid response format for device ${device.id}:`,
                            response.data
                        );
                        return;
                    }

                    const readings = response.data.data.map((entry) => ({
                        meterReading: entry.meterReading ?? "N/A",
                        measureMode: entry.measureMode ?? "N/A",
                        batteryVoltage: entry.batteryVoltage ?? "N/A",
                        valveStatus: entry.valveStatus ?? "N/A",
                        timestamp: entry.timestamp
                            ? new Date(entry.timestamp).toLocaleString()
                            : "N/A"
                    }));

                    Object.assign(device, {
                        readings,
                        totalConsumption: readings
                            .reduce((sum, entry) => sum + (parseFloat(entry.meterReading) || 0), 0)
                            .toFixed(2)
                    });

                    // Compare and update the highest consumption if this device has a higher value
                    const deviceConsumption = parseFloat(device.totalConsumption) || 0;
                    const currentHighest = parseFloat(this.highestConsumptionValue) || 0;
                    if (deviceConsumption > currentHighest) {
                        this.highestConsumptionValue = device.totalConsumption;
                        this.highestConsumptionDevice = device.dev_eui;
                    }
                })
                .catch((error) => {
                    console.error(`Error fetching metrics for device ${device.id}:`, error);
                });
        }

    },
    mounted() {
        this.loadWaterMeterData();
        this.fetchDevicesData(); // Make sure to call this to load the devices and metrics!
    },
};
</script>


<style scoped>
/* Styles from your initial implementation */
.dashboard-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.top-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.middle-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.bottom-row {
    display: flex;
    gap: 20px;
}

.card {
    background-color: #f5f5f5;
    /* Light gray background for monotone */
    border: 1px solid #e0e0e0;
    /* Subtle border */
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* Light shadow for depth */
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: #4a4a4a;
    /* Neutral text color */
}

.card h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #3a3a3a;
    /* Slightly darker text for headers */
}

.card .description {
    font-size: 14px;
    margin-top: 5px;
    color: #6a6a6a;
    /* Slightly lighter text for descriptions */
}

.card .value {
    font-size: 20px;
    font-weight: bold;
    margin-top: 10px;
    color: #2a2a2a;
    /* Primary value in darker gray */
}

.add-button {
    background-color: #d1d1d1;
    /* Neutral button color */
    color: #4a4a4a;
    /* Button text in monotone */
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 18px;
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 10px;
}

.add-button:hover {
    background-color: #b0b0b0;
    /* Slightly darker on hover */
}

.add-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #f43f5e;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 18px;
    cursor: pointer;
}

.add-button:hover {
    background-color: #e11d48;
}

.floorplan {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.floorplan-img {
    width: 100%;
    height: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.power-usage-hourly,
.power-usage-daily {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin: 0 auto;
    /* Center the chart within the card */
    /* Prevent overflow issues */
}

.chart-wrapper {
    margin: 0 auto;
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

select {
    padding: 10px;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    margin-bottom: 15px;
}

/* Breadcrumb */
.breadcrumb {
    display: flex;
    align-items: center;
    font-size: 14px;
    margin-bottom: 20px;
    color: #1f2937;
}

.breadcrumb-item {
    font-weight: 400;
    color: #4b5563;
}

.breadcrumb-item.active {
    font-weight: 600;
    color: #111827;
}

.breadcrumb-separator {
    margin: 0 8px;
    color: #6b7280;
}

/* Dashboard Container */
.dashboard-container {
    padding: 20px;
    background-color: #f9fafb;
    min-height: 100vh;
}

/* Header Row */
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

/* Dashboard Title */
.dashboard-title {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin: 0;
}

/* Breadcrumb */
.breadcrumb {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #1f2937;
}

.breadcrumb-item {
    font-weight: 400;
    color: #4b5563;
}

.breadcrumb-item.active {
    font-weight: 600;
    color: #111827;
}

.breadcrumb-separator {
    margin: 0 8px;
    color: #6b7280;
}

.view-more-button {
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    position: absolute;
    top: 10px;
    right: 10px;
}

.view-more-button:hover {
    background-color: #1d4ed8;
}
</style>