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
                <DashboardCard color="green" title="Power Usage Today" :value="powerUsageToday.toFixed(2) + ' kWh'"
                    description="Power Today">
                    <template #icon>
                        <i class="fas fa-chart-bar"></i>
                    </template>
                </DashboardCard>
                <DashboardCard color="blue" title="Power Usage This Month" :value="totalActivities + ' Activities'"
                    description="Activities This Month">
                    <template #icon>
                        <i class="fas fa-users"></i>
                    </template>
                </DashboardCard>
                <DashboardCard color="purple" title="Total Gateways" :value="totalGateways + ' Gateway(s)'"
                    description="Unique Gateways in Use">
                    <template #icon>
                        <i class="fas fa-network-wired"></i>
                    </template>
                </DashboardCard>

                <DashboardCard color="orange" title="Power Efficiency" value="Normal"
                    description="Valid Until 30 June 2025">
                    <template #icon>
                        <i class="fas fa-shopping-cart"></i>
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
    data() {
        return {
            powerUsageToday: 0, // Total power usage today
            totalActivities: 0, // Count of all activities
            totalGateways: 0, // Count of unique gateways
            hourlyChartData: [], // Hourly chart data
            dailyChartData: [], // Daily chart data
            intervalId: null, // For periodic data fetching

            // Floorplan dropdown options
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
            axios
                .get("http://157.230.240.216:5000/message_history")
                .then((response) => {
                    const data = response.data.message_history;
                    console.log("API Data:", data); // Debugging log

                    // Get the current month and year
                    const now = new Date();
                    const currentMonth = String(now.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
                    const currentYear = String(now.getFullYear());

                    // Filter entries for the current month and year
                    const activitiesThisMonth = data.filter((entry) => {
                        if (!entry || !entry.datatime) return false; // Skip invalid entries

                        const entryYear = entry.datatime.substring(0, 4); // Extract year
                        const entryMonth = entry.datatime.substring(4, 6); // Extract month

                        return entryYear === currentYear && entryMonth === currentMonth; // Match year and month
                    });

                    // Set total activities for the current month
                    this.totalActivities = activitiesThisMonth.length;
                    console.log("Total Activities This Month:", this.totalActivities);

                    // Power Usage Today
                    const today = new Date().toISOString().slice(0, 10); // Get today's date
                    this.powerUsageToday = data
                        .filter((entry) => entry.datatime.startsWith(today.replace(/-/g, "")))
                        .reduce((sum, entry) => sum + (entry.EPI || 0), 0);

                    // Unique Gateways
                    const gateways = new Set(data.map((entry) => entry.GwSN));
                    this.totalGateways = gateways.size;

                    // Process data for charts
                    this.hourlyChartData = this.processHourlyData(data);
                    this.dailyChartData = this.processDailyData(data);
                })
                .catch((error) => {
                    console.error("Failed to fetch data:", error);
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
    },
    mounted() {
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
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0;
    /* Remove padding for the chart to fit edge to edge */
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    /* Center content vertically */
    justify-content: center;
    /* Center content horizontally */
    overflow: hidden;
    /* Prevent overflow */
    height: 100%;
    /* Allow the card to scale with the content */
    margin: 0 auto;
    /* Center the card */
}

.card h3 {
    margin: 0 0 15px;
    font-size: 16px;
    font-weight: bold;
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