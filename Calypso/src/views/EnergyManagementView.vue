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
                <DashboardCard color="#625a9b" title="Power Usage Today" :value="powerUsageToday.toFixed(2) + ' kWh'"
                    description="Power Today">
                    <template #icon>
                        <i class="fas fa-bolt"></i>
                    </template>
                </DashboardCard>
                <DashboardCard color="#42abb7" title="Power Usage This Month" :value="totalPowerUsageThisMonth + ' kWh'"
                    description="Power Usage This Month">
                    <template #icon>
                        <i class="fas fa-calendar-alt"></i>
                    </template>
                </DashboardCard>
                <DashboardCard color="#00484a" title="Device Power Usage (Highest)" :value="highestPowerUsage"
                    description="Highest Power Consumption">
                    <template #icon>
                        <i class="fas fa-plug"></i>
                    </template>
                </DashboardCard>


                <DashboardCard color="#245d75" title="Power Efficiency" value="Normal"
                    description="Valid Until 30 June 2025">
                    <template #icon>
                        <i class="fas fa-leaf"></i>
                    </template>
                </DashboardCard>
            </div>

            <!-- Middle Row -->
            <div class="middle-row">
                <div class="card floorplan">
                    <h3>Select Location</h3>
                    <select v-model="selectedImage" @change="changeFloorplan">
                        <option v-for="option in floorplanOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <img :src="require(`@/assets/${selectedImage}`)" :alt="selectedImage" class="floorplan-img" />
                </div>
                <div class="card power-usage-hourly">
                    <h3>Power Usage Hourly for the Day</h3>
                    <div class="chart-wrapper">
                        <PowerHourlyChart :data="hourlyChartData" />
                    </div>
                    <button class="add-button" @click="navigateToPage('/energy-management/hourly')">+</button>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="bottom-row">
                <div class="card power-usage-daily">
                    <h3>Power Usage Daily, over 7 days</h3>
                    <div class="chart-wrapper">
                        <PowerDailyChart :data="dailyChartData" />
                    </div>
                    <button class="add-button" @click="navigateToPage('/energy-management/daily')">+</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import * as XLSX from "xlsx";
import DashboardCard from "@/components/DashboardCard.vue";
import PowerHourlyChart from "../components/PowerHourlyChart.vue";
import PowerDailyChart from "../components/PowerDailyChart.vue";

export default {
    components: {
        DashboardCard,
        PowerHourlyChart,
        PowerDailyChart,
    },
    data() {
        return {
            powerUsageToday: 0, // Initialize as a number
            totalPowerUsageThisMonth: 0, // Initialize as a number
            highestPowerUsage: "0 kWh", // Default as a string if it's a string
            totalGateways: 0,
            hourlyChartData: [], // Hourly chart data
            dailyChartData: [], // Daily chart data
            intervalId: null, // For periodic data fetching
            floorplanOptions: [
                { label: "B05-11/12", value: "B05-11-12.png" },
                { label: "B05-13/14", value: "B05-13-14.png" },
                { label: "Landscape", value: "B05-Landscape.png" },
            ],
            selectedImage: "B05-Landscape.png", // Default image
        };
    },
    methods: {
        fetchData() {
            const filePath = "/assets/Simulated Data.xlsx";

            fetch(filePath)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then((arrayBuffer) => {
                    const workbook = XLSX.read(arrayBuffer, { type: "array" });
                    const sheet = workbook.Sheets["Compiled"];
                    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    const headers = sheetData[0]; // Header row (dates)
                    const timeColumn = sheetData.slice(1); // Data rows (time + values)

                    const today = new Date();
                    const currentMonth = String(today.getMonth() + 1).padStart(2, "0"); // 2-digit month
                    const currentYear = String(today.getFullYear()); // Current year
                    const todayDate = today.toISOString().slice(0, 10); // Format YYYY-MM-DD

                    let powerUsageToday = 0;
                    let powerUsageThisMonth = 0;
                    let highestPowerUsage = { value: 0, date: "", time: "" }; // For the 3rd card

                    timeColumn.forEach((row) => {
                        headers.slice(1).forEach((header, index) => {
                            let date;
                            if (typeof header === "number") {
                                const parsedDate = XLSX.SSF.parse_date_code(header);
                                date = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
                            } else {
                                date = new Date(header);
                            }

                            const currentDate = date.toISOString().slice(0, 10); // Extract date in YYYY-MM-DD format
                            const value = parseFloat(row[index + 1] || 0); // Current value

                            // Check if the date matches today
                            if (currentDate === todayDate) {
                                powerUsageToday += value; // Accumulate today's power usage
                            }

                            // Check if the date matches the current month and year
                            if (currentDate.startsWith(`${currentYear}-${currentMonth}`)) {
                                powerUsageThisMonth += value; // Accumulate this month's power usage
                            }

                            // Track the highest power usage
                            if (value > highestPowerUsage.value) {
                                const timeFraction = row[0]; // Time fraction (e.g., 0.5 = 12:00 PM)
                                const excelTimeToJS = (fraction) => {
                                    const totalSeconds = Math.round(fraction * 24 * 60 * 60);
                                    const hours = Math.floor(totalSeconds / 3600);
                                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                                    return `${hours.toString().padStart(2, "0")}:${minutes
                                        .toString()
                                        .padStart(2, "0")}`;
                                };
                                const time = excelTimeToJS(timeFraction); // Convert to hh:mm

                                highestPowerUsage = {
                                    value,
                                    date: currentDate,
                                    time,
                                };
                            }
                        });
                    });

                    // Update the card values
                    this.powerUsageToday = parseFloat(powerUsageToday.toFixed(2));
                    this.totalPowerUsageThisMonth = parseFloat(powerUsageThisMonth.toFixed(2));
                    this.highestPowerUsage = `${highestPowerUsage.value.toFixed(
                        2
                    )} kWh`;

                    console.log("Power Usage Today:", this.powerUsageToday);
                    console.log("Power Usage This Month:", this.totalPowerUsageThisMonth);
                    console.log("Highest Power Usage:", this.highestPowerUsage);
                })
                .catch((error) => {
                    console.error("Error reading Excel file:", error);
                });
        },
        navigateToPage(path) {
            // Navigate to the specified path
            this.$router.push(path);
        },
        processHourlyData(data) {
            const hourlyData = Array(24).fill(0); // Initialize 24 hours with 0

            data.forEach((entry) => {
                if (!entry || !entry.datatime) return;

                // Extract the hour from the "datatime" field
                const hour = parseInt(entry.datatime.substring(8, 10)); // Hour (00 to 23)

                // Add the EPI value to the respective hour
                hourlyData[hour] += entry.EPI || 0;
            });

            // Format the data for the chart
            return hourlyData.map((value, index) => ({
                label: `${index}:00`,
                value: parseFloat(value.toFixed(2)), // Round to 2 decimals
            }));
        },
        processDailyData(data) {
            const dailyData = {};

            // Step 1: Aggregate data by date
            data.forEach((entry) => {
                if (entry && entry.datatime) {
                    const date = entry.datatime.substring(0, 8); // Extract date in YYYYMMDD format
                    dailyData[date] = (dailyData[date] || 0) + (entry.EPI || 0);
                }
            });

            console.log("Daily Data Aggregation:", dailyData); // Debugging log

            // Step 2: Generate a 7-day range
            const now = new Date();
            const last7Days = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
                last7Days.unshift(formattedDate); // Add to the beginning of the array
            }

            console.log("Last 7 Days:", last7Days);

            // Step 3: Prepare the data for the chart
            return last7Days.map((date) => ({
                label: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`, // Format YYYY-MM-DD
                value: parseFloat((dailyData[date] || 0).toFixed(2)), // Use aggregated value or 0 for missing dates
            }));
        },
        changeFloorplan() {
            console.log(`Floorplan changed to: ${this.selectedImage}`);
        },
        fetchChartData() {
            const filePath = "/assets/Simulated Data.xlsx";

            fetch(filePath)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then((arrayBuffer) => {
                    const workbook = XLSX.read(arrayBuffer, { type: "array" });
                    const sheet = workbook.Sheets["Compiled"];
                    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    const headers = sheetData[0]; // Header row (dates)
                    const timeColumn = sheetData.slice(1); // Data rows (time + values)

                    // Get today's date
                    const today = new Date();
                    const todayDate = today.toISOString().slice(0, 10);

                    // Calculate hourly data for today
                    const hourlyData = Array(24).fill(0); // Initialize 24-hour array
                    timeColumn.forEach((row) => {
                        const timeFraction = row[0]; // Time column (fraction)
                        const hour = Math.floor(timeFraction * 24); // Extract the hour (0-23)
                        headers.slice(1).forEach((header, index) => {
                            let date;
                            if (typeof header === "number") {
                                const parsedDate = XLSX.SSF.parse_date_code(header);
                                date = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
                            } else {
                                date = new Date(header);
                            }

                            const currentDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
                            if (currentDate === todayDate) {
                                const value = parseFloat(row[index + 1] || 0);
                                hourlyData[hour] += value; // Add value to the respective hour
                            }
                        });
                    });

                    // Format data for hourly chart
                    this.hourlyChartData = hourlyData.map((value, index) => ({
                        label: `${String(index).padStart(2, "0")}:00`,
                        value: parseFloat(value.toFixed(2)),
                    }));

                    // Calculate daily data for the last 7 days
                    const dailyData = {};
                    const last7Days = Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(today);
                        date.setDate(today.getDate() - i);
                        const formattedDate = `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                        return formattedDate;
                    });

                    timeColumn.forEach((row) => {
                        headers.slice(1).forEach((header, index) => {
                            let date;
                            if (typeof header === "number") {
                                const parsedDate = XLSX.SSF.parse_date_code(header);
                                date = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
                            } else {
                                date = new Date(header);
                            }

                            const currentDate = date.toISOString().slice(0, 10);
                            const value = parseFloat(row[index + 1] || 0);

                            if (last7Days.includes(currentDate)) {
                                if (!dailyData[currentDate]) {
                                    dailyData[currentDate] = 0;
                                }
                                dailyData[currentDate] += value; // Accumulate daily usage
                            }
                        });
                    });

                    // Format data for daily chart
                    this.dailyChartData = last7Days.map((date) => ({
                        label: date,
                        value: parseFloat((dailyData[date] || 0).toFixed(2)),
                    }));

                    console.log("Hourly Chart Data:", this.hourlyChartData);
                    console.log("Daily Chart Data:", this.dailyChartData);
                })
                .catch((error) => {
                    console.error("Error reading Excel file:", error);
                });
        },
    },
    mounted() {
        // Fetch data immediately
        this.fetchData();
        this.fetchChartData();
        // Set an interval to fetch data every 5 minutes
        this.intervalId = setInterval(() => {
            this.fetchData();
        }, 5 * 60 * 1000); // 5 minutes in milliseconds
    },
    beforeUnmount() {
        // Clear the interval when the component is unmounted
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    },
};
</script>


<style scoped>
/* Styles from your initial implementation */
.dashboard-view {
    padding: 5%;
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
</style>