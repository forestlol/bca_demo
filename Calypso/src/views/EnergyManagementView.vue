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
                <DashboardCard color="#625a9b" title="Power Usage Today" :value="powerUsageToday"
                    description="Power Today" link="/energy-management/historical-data">
                    <template #icon>
                        <i class="fas fa-bolt"></i>
                    </template>
                </DashboardCard>

                <DashboardCard color="#42abb7" title="Power Usage This Month" :value="totalPowerUsageThisMonth"
                    description="Power Usage This Month" link="/energy-management/historical-data">
                    <template #icon>
                        <i class="fas fa-calendar-alt"></i>
                    </template>
                </DashboardCard>

                <DashboardCard color="#00484a" title="Device Power Usage (Highest)" :value="highestDevicePowerUsage"
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
                    <button class="add-button" @click="navigateToPage('/energy-management/historical-data')">+</button>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="bottom-row">
                <div class="card power-usage-daily">
                    <h3>Power Usage Daily, over 7 days</h3>
                    <div class="chart-wrapper">
                        <PowerDailyChart :data="dailyChartData" />
                    </div>
                    <button class="add-button" @click="navigateToPage('/energy-management/historical-data')">+</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import * as XLSX from "xlsx";
import axios from "axios";
import DashboardCard from "@/components/DashboardCard.vue";
import PowerHourlyChart from "../components/PowerHourlyChart.vue";
import PowerDailyChart from "../components/PowerDailyChart.vue";

export default {
    components: {
        DashboardCard,
        PowerHourlyChart,
        PowerDailyChart,
    },
    computed: {
        powerUsageToday() {
            if (!this.hourlyChartData || this.hourlyChartData.length === 0) {
                return "0.00 kWh"; // Default value if no data
            }

            const totalToday = this.hourlyChartData.reduce((sum, entry) => sum + entry.value, 0);
            return `${totalToday.toFixed(2)} kWh`; // Format to 2 decimal places
        },
        highestDevicePowerUsage() {
            if (!this.differencesBySensor || Object.keys(this.differencesBySensor).length === 0) {
                return "0.00 kWh"; // Default value if no data
            }

            let highestDevice = { sensor: "", value: 0 };
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0); // Midnight of today

            // Iterate through each sensor's differences
            Object.entries(this.differencesBySensor).forEach(([sensor, differences]) => {
                const totalValueForToday = differences.reduce((total, { time, value }) => {
                    const entryTime = new Date(time);
                    if (entryTime >= todayStart) {
                        return total + value; // Add up values for today only
                    }
                    return total;
                }, 0);

                // Update the highest device if the current sensor's total is greater
                if (totalValueForToday > highestDevice.value) {
                    highestDevice = { sensor, value: totalValueForToday };
                }
            });

            return `${highestDevice.value.toFixed(2)} kWh`;
        },
        totalPowerUsageThisMonth() {
            if (!this.aggregatedData || Object.keys(this.aggregatedData).length === 0) {
                return "0.00"; // Default value if no data
            }

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            let totalPower = 0;

            // Sum up all values in aggregatedData for the current month, ignoring NaN
            Object.entries(this.aggregatedData).forEach(([time, value]) => {
                const entryDate = new Date(time);
                if (
                    entryDate.getMonth() === currentMonth &&
                    entryDate.getFullYear() === currentYear &&
                    !isNaN(value) // Ensure value is a valid number
                ) {
                    totalPower += value;
                }
            });

            return `${totalPower.toFixed(2)} kWh`; // Format to 2 decimal places
        },
    },
    data() {
        return {
            aggregatedData: {},
            differencesBySensor: {}, // Initialize as an empty object
            isDataLoaded: false, // Loading flag
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
            this.processChartData();
        },
        processChartData() {
            const meterSNs = ["24112209220004", "24060404690001", "24060410030004", "24061901790001", "24060410030003", "24060410030002", "24060404690002", "24112209220002", "24112209220003", "24112209220006", "24112209220005"];
            // excluded 24112209220004, to be added again
            const now = new Date();
            const startTime = new Date(now);
            startTime.setDate(now.getDate() - 1); // Start time: yesterday
            startTime.setHours(23, 59, 59, 0); // Set start time to 17:00
            const endTime = new Date(now);
            endTime.setHours(17, 0, 0, 0); // Set end time to today 17:00

            axios
                .get("https://geibms.com/message_history")
                .then((response) => {
                    const rawData = response.data.message_history;
                    const aggregatedData = {};

                    // Filter data by meterSNs
                    const filteredData = rawData.filter((entry) => meterSNs.includes(entry.meterSN));

                    const differencesBySensor = {};

                    // Calculate differences by sensor
                    meterSNs.forEach((meterSN) => {
                        const sensorData = filteredData
                            .filter((entry) => entry.meterSN === meterSN)
                            .sort((a, b) => new Date(b.datatime) - new Date(a.datatime)) // Sort from latest to earliest
                            .map((entry) => {
                                const time = new Date(
                                    `${entry.datatime.slice(0, 4)}-${entry.datatime.slice(4, 6)}-${entry.datatime.slice(6, 8)}T${entry.datatime.slice(8, 10)}:${entry.datatime.slice(10, 12)}`
                                );

                                // Align time for consistent grouping
                                const alignedTime = `${time.getFullYear()}-${(time.getMonth() + 1)
                                    .toString()
                                    .padStart(2, "0")}-${time
                                        .getDate()
                                        .toString()
                                        .padStart(2, "0")} ${time
                                            .getHours()
                                            .toString()
                                            .padStart(2, "0")}:00`;
                                return { ...entry, alignedTime };
                            });

                        differencesBySensor[meterSN] = sensorData.map((entry, index) => {
                            let difference = 0;

                            if (index === sensorData.length - 1) {
                                // Compare the last data point with the previous one
                                const previous = sensorData[index - 1];
                                if (previous) {
                                    difference = previous.EPI - entry.EPI;
                                }
                            } else {
                                // Compare current entry with the next one
                                const next = sensorData[index + 1];
                                difference = entry.EPI - next.EPI;
                            }

                            // Filter out differences beyond the threshold (-50 to 50)
                            if (difference < -50 || difference > 50) {
                                difference = 0; // Ignore outliers
                            }

                            // Apply transformation for meter "24112209220004"
                            if (meterSN === "24112209220004") {
                                difference = (difference / 10) * 48;
                            }

                            return { time: entry.alignedTime, value: Math.abs(difference) };
                        });
                    });

                    this.differencesBySensor = differencesBySensor; // Store differencesBySensor in data
                    console.log("Differences by Sensor:", differencesBySensor);

                    // Aggregate data
                    Object.keys(differencesBySensor).forEach((sensor) => {
                        differencesBySensor[sensor].forEach((entry) => {
                            const key = entry.time;
                            if (!aggregatedData[key]) {
                                aggregatedData[key] = 0;
                            }
                            aggregatedData[key] += entry.value;
                        });
                    });

                    this.aggregatedData = aggregatedData; // Store the aggregated data
                    console.log("Aggregated Data:", aggregatedData);

                    // Process hourly data for today (from 00:00 to 23:00)
                    const hourlyData = Array(24).fill(0); // 24-hour data
                    const hourlyLabels = [];
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0); // Start of today (00:00)
                    const todayEnd = new Date();
                    todayEnd.setHours(23, 59, 59, 999); // End of today (23:59:59)

                    Object.keys(aggregatedData).forEach((key) => {
                        const time = new Date(key);
                        if (time >= todayStart && time <= todayEnd) {
                            const hourIndex = time.getHours(); // Extract the hour as an index
                            hourlyData[hourIndex] += aggregatedData[key];
                        }
                    });

                    // Generate labels and format the hourly chart data
                    for (let i = 0; i < 24; i++) {
                        const label = `${String(i).padStart(2, "0")}:00`; // Format as "HH:00"
                        hourlyLabels.push(label);
                    }

                    this.hourlyChartData = hourlyLabels.map((label, index) => ({
                        label,
                        value: parseFloat(hourlyData[index].toFixed(2)),
                    }));

                    console.log("Filtered Hourly Chart Data (Today 00:00 to 23:00):", this.hourlyChartData);


                    // Generate daily data for the last 7 days excluding today
                    const dailyData = {};
                    Object.keys(aggregatedData).forEach((key) => {
                        const time = new Date(key);
                        const dailyKey = `${time.getFullYear()}-${(time.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}-${time
                                .getDate()
                                .toString()
                                .padStart(2, "0")}`;
                        if (!dailyData[dailyKey]) {
                            dailyData[dailyKey] = 0;
                        }
                        dailyData[dailyKey] += aggregatedData[key];
                    });

                    const dailyLabels = [];
                    const dailyChartData = [];
                    const today = new Date();
                    const last7Days = [];

                    // Compute the last 7 days excluding today
                    for (let i = 1; i <= 7; i++) {
                        const date = new Date(today);
                        date.setDate(today.getDate() - i); // Subtract i days
                        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}-${date
                                .getDate()
                                .toString()
                                .padStart(2, "0")}`;
                        last7Days.push(formattedDate);
                    }

                    // Filter data for the last 7 days
                    last7Days.reverse(); // Ensure the order is from oldest to most recent
                    last7Days.forEach((date) => {
                        if (dailyData[date] !== undefined) {
                            dailyLabels.push(date);
                            const value = parseFloat(dailyData[date].toFixed(2));
                            if (!isNaN(value)) { // Ignore NaN values
                                dailyChartData.push(value);
                            }
                        }
                    });

                    console.log("Daily Chart Data:", dailyChartData);

                    // Store daily chart data for rendering
                    this.dailyChartData = dailyLabels.map((label, index) => ({
                        label,
                        value: dailyChartData[index],
                    })).filter(data => !isNaN(data.value)); // Ensure no NaN values in final data

                    console.log("Filtered Last 7 Days Chart Data (Excluding Today):", this.dailyChartData);
                })
                .catch((error) => {
                    console.error("Error fetching data from API:", error);
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

                    const now = new Date(); // Current time
                    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
                    const last7Days = Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(now);
                        date.setDate(now.getDate() - i);
                        return date.toISOString().slice(0, 10); // YYYY-MM-DD format
                    });

                    // Initialize arrays for hourly and daily data
                    const hourlyData = Array(24).fill(0); // 24-hour data
                    const dailyData = {};

                    // Process each row in the sheet
                    timeColumn.forEach((row, rowIndex) => {
                        const timeFraction = row[0]; // First column contains time as a fraction of a day
                        if (typeof timeFraction !== "number") {
                            console.warn(`Invalid time format in row ${rowIndex}:`, timeFraction);
                            return;
                        }

                        // Convert fractional time (e.g., 0.5 for 12:00 PM) to hours and minutes
                        const totalMinutes = Math.round(timeFraction * 24 * 60);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;

                        // Process each date header (B, C, D, etc.)
                        headers.slice(1).forEach((header, index) => {
                            let date;
                            if (typeof header === "number") {
                                const parsedDate = XLSX.SSF.parse_date_code(header);
                                date = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
                            } else {
                                date = new Date(header);
                            }

                            // Combine the date from the header and the time from column A
                            const rowTime = new Date(date);
                            rowTime.setHours(hours, minutes, 0, 0);

                            const value = parseFloat(row[index + 1] || 0);

                            // Accumulate hourly data for the past 24 hours
                            if (rowTime >= past24Hours && rowTime <= now) {
                                const hoursDifference = Math.floor((rowTime - past24Hours) / (1000 * 60 * 60)); // Difference in hours
                                const hourIndex = hoursDifference;
                                hourlyData[hourIndex] += value;

                                console.log(
                                    `Row ${rowIndex}: Adding value ${value} to hour ${hourIndex} (${rowTime})`
                                );
                            }

                            // Accumulate daily totals for the last 7 days
                            const dateKey = rowTime.toISOString().slice(0, 10); // Extract YYYY-MM-DD
                            if (last7Days.includes(dateKey)) {
                                if (!dailyData[dateKey]) {
                                    dailyData[dateKey] = 0;
                                }
                                dailyData[dateKey] += value;
                            }
                        });
                    });

                    // Format hourly data for the chart
                    this.hourlyChartData = hourlyData.map((value, index) => {
                        const hour = new Date(past24Hours);
                        hour.setHours(past24Hours.getHours() + index);
                        const formattedLabel = `${String(hour.getHours()).padStart(2, "0")}:00`;
                        return {
                            label: formattedLabel,
                            value: parseFloat(value.toFixed(2)), // Round to 2 decimal places
                        };
                    });

                    // Format daily data for the chart
                    this.dailyChartData = last7Days.reverse().map((date) => ({
                        label: date,
                        value: parseFloat((dailyData[date] || 0).toFixed(2)), // Use aggregated value or 0 for missing dates
                    })).filter(entry => !isNaN(entry.value)); // Remove entries where value is NaN

                    // Debugging output
                    console.log("Hourly Chart Data:", this.hourlyChartData);
                    console.log("Daily Chart Data:", this.dailyChartData);
                })
                .catch((error) => {
                    console.error("Error reading Excel file:", error);
                });
        }

    },
    mounted() {
        this.processChartData(); // Fetch and process the data when the component mounts
        // Fetch data immediately
        this.fetchData();
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