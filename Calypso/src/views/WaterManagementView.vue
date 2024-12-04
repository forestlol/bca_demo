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
            aggregatedData: {},
            differencesBySensor: {}, // Initialize as an empty object
            isDataLoaded: false, // Loading flag
            highestPowerUsage: "0 kWh", // Default as a string if it's a string
            totalGateways: 0,
            hourlyChartData: [], // Hourly chart data
            dailyChartData: [], // Daily chart data
            intervalId: null, // For periodic data fetching
            floorplanOptions: [
                { label: "GE Canteen", value: "Floorplan.jpg" },
            ],
            selectedImage: "Floorplan.jpg", // Default image
        };
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
</style>