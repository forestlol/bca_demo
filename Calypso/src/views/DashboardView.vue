<template>
    <div class="dashboard-container">
        <!-- Header Row -->
        <div class="header-row">
            <!-- Title on the Left -->
            <h2 class="dashboard-title">Home</h2>

            <!-- Breadcrumbs on the Right -->
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Cavill</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-item">Menu</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-item active">Home</span>
            </nav>
        </div>
        <!-- Time Period Selection -->
        <div class="time-selector">
            <button v-for="option in timeOptions" :key="option"
                :class="['time-button', { active: selectedTime === option }]" @click="selectedTime = option">
                {{ option }}
            </button>
        </div>

        <!-- Cards Section -->
        <div class="cards-grid">
            <div class="special-cards-container">
                <!-- Total Power Usage -->
                <div class="special-card">
                    <div class="special-card-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="special-card-content">
                        <h3>Total Power Usage</h3>
                        <p class="value">{{ totalPowerUsage }} kWh</p>
                    </div>
                </div>

                <!-- Automation Efficiency -->
                <div class="special-card">
                    <div class="special-card-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="special-card-content">
                        <h3>Automation Efficiency</h3>
                        <p class="value">{{ automationEfficiency }}%</p>
                    </div>
                </div>
            </div>
            <!-- Cost Predicted -->
            <div class="chart-card">
                <h3 class="chart-title">Cost Predicted</h3>
                <DonutChart :key="selectedTime" :data="costPredictedData[selectedTime]" />
            </div>

            <!-- Change in Cost -->
            <div class="chart-card">
                <h3 class="chart-title">Change in Cost</h3>
                <BarChart :key="selectedTime + 'change'" :data="changeInCostData[selectedTime]" />
            </div>

            <!-- Usage Estimate -->
            <div class="chart-card">
                <h3 class="chart-title">Usage Estimate</h3>
                <LineChart :key="selectedTime + 'usage'" :data="usageEstimateData[selectedTime]" />
            </div>

            <!-- Active Appliances -->
            <div class="chart-card">
                <h3 class="chart-title">Active Appliances</h3>
                <BarChart :key="selectedTime + 'active'" :data="activeAppliancesData[selectedTime]" />
            </div>

            <!-- Energy Intensity -->
            <div class="chart-card">
                <h3 class="chart-title">Energy Intensity</h3>
                <CircularGauge v-if="energyIntensityData[selectedTime] > 0" :data="energyIntensityData[selectedTime]" />
            </div>

            <!-- Carbon Footprint -->
            <div class="chart-card">
                <h3 class="chart-title">Carbon Footprint</h3>
                <BarChart v-if="carbonFootprintData[selectedTime]?.length" :data="carbonFootprintData[selectedTime]" />
            </div>
        </div>
    </div>
</template>

<script>
import * as XLSX from "xlsx";
import DonutChart from "@/components/charts/DonutChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import LineChart from "@/components/charts/LineChart.vue";
import CircularGauge from "@/components/charts/CircularGauge.vue";

export default {
    components: { DonutChart, BarChart, LineChart, CircularGauge },
    data() {
        return {
            timeOptions: ["Today", "Month", "Year"],
            selectedTime: "Today",
            totalPowerUsage: 0,
            automationEfficiency: 0,
            costPredictedData: { Today: {}, Month: {}, Year: {} },
            changeInCostData: { Today: [], Month: [], Year: [] },
            usageEstimateData: { Today: [], Month: [], Year: [] },
            activeAppliancesData: { Today: [], Month: [], Year: [] },
            energyIntensityData: { Today: 0, Month: 0, Year: 0 },
            carbonFootprintData: { Today: [], Month: [], Year: [] },
        };
    },
    methods: {
        fetchExcelData() {
            const filePath = "/assets/Simulated Data.xlsx";
            fetch(filePath)
                .then((response) => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.arrayBuffer();
                })
                .then((arrayBuffer) => {
                    const workbook = XLSX.read(arrayBuffer, { type: "array" });
                    const sheet = workbook.Sheets["Compiled"];
                    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    this.processExcelData(sheetData);
                })
                .catch((error) => {
                    console.error("Error reading Excel file:", error);
                });
        },
        processExcelData(sheetData) {
            const headers = sheetData[0]; // Header row (dates)
            const timeColumn = sheetData.slice(1); // Data rows (time + values)

            const today = new Date();
            const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
            const todayDate = today.toISOString().slice(0, 10);

            let powerUsageToday = 0;
            let powerUsageThisMonth = 0;

            const hourlyData = Array(24).fill(0);
            const dailyData = {};
            const deviceUsage = {};
            let totalActivities = 0; // Initialize for Automation Efficiency
            let completedActivities = 0; // Initialize for Automation Efficiency

            timeColumn.forEach((row, rowIndex) => {
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
                    const hour = date.getHours();

                    // Calculate Power Usage
                    if (currentDate === todayDate) powerUsageToday += value;
                    if (currentDate.startsWith(currentMonth)) powerUsageThisMonth += value;

                    // Hourly Data
                    hourlyData[hour] += value;

                    // Daily Data
                    if (!dailyData[currentDate]) dailyData[currentDate] = 0;
                    dailyData[currentDate] += value;

                    // Device Usage
                    const device = `Device ${index + 1}`;
                    if (!deviceUsage[device]) deviceUsage[device] = 0;
                    deviceUsage[device] += value;

                    // Example: Increment Activities for Automation Efficiency
                    if (rowIndex % 2 === 0) {
                        totalActivities++;
                        completedActivities += Math.random() > 0.1 ? 1 : 0; // Simulate ~90% completion
                    }
                });
            });

            // Highest Device Usage
            const highestDevice = Object.entries(deviceUsage).reduce(
                (max, [device, value]) => (value > max.value ? { device, value } : max),
                { device: null, value: 0 }
            );

            // Update Data for Charts
            this.totalPowerUsage = parseFloat(powerUsageToday.toFixed(2));
            this.automationEfficiency = totalActivities
                ? parseFloat(((completedActivities / totalActivities) * 100).toFixed(2))
                : 0; // Avoid division by zero

            this.costPredictedData.Today = this.calculateCostPredicted(powerUsageToday);
            this.changeInCostData.Today = this.calculateChangeInCost([powerUsageToday, powerUsageThisMonth]);
            this.usageEstimateData.Today = this.calculateUsageEstimate(powerUsageToday);
            this.activeAppliancesData.Today = this.calculateActiveAppliances(deviceUsage);
            this.energyIntensityData.Today = this.calculateEnergyIntensity(powerUsageToday, 1000); // Example area
            this.carbonFootprintData.Today = this.calculateCarbonFootprint(powerUsageToday);

            this.hourlyChartData = hourlyData.map((value, index) => ({
                label: `${index}:00`,
                value: parseFloat(value.toFixed(2)),
            }));

            this.dailyChartData = Object.entries(dailyData)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .map(([date, value]) => ({
                    label: date,
                    value: parseFloat(value.toFixed(2)),
                }));

            console.log("Highest Device:", highestDevice);
            console.log("Hourly Data:", this.hourlyChartData);
            console.log("Daily Data:", this.dailyChartData);
        },
        calculateCostPredicted(totalUsage) {
            const electricityRate = 0.15; // Example rate
            const gasRate = 0.08; // Example rate
            const gasUsage = totalUsage * 0.2; // Example assumption
            return {
                electricity: parseFloat((totalUsage * electricityRate).toFixed(2)),
                gas: parseFloat((gasUsage * gasRate).toFixed(2)),
            };
        },
        calculateChangeInCost([todayUsage, monthUsage]) {
            const electricityRate = 0.15;
            return [
                { label: "Today", value: parseFloat((todayUsage * electricityRate).toFixed(2)) },
                { label: "This Month", value: parseFloat((monthUsage * electricityRate).toFixed(2)) },
            ];
        },
        calculateUsageEstimate(totalUsage) {
            const hoursElapsed = new Date().getHours();
            const averageUsage = totalUsage / hoursElapsed;
            return [
                { time: "Till Now", value: parseFloat(totalUsage.toFixed(2)) },
                { time: "Predicted", value: parseFloat((averageUsage * 24).toFixed(2)) },
            ];
        },
        calculateActiveAppliances(deviceUsage) {
            return Object.entries(deviceUsage).map(([device, value]) => ({
                label: device,
                value: parseFloat(value.toFixed(2)),
            }));
        },
        calculateEnergyIntensity(totalUsage, totalArea) {
            return parseFloat((totalUsage / totalArea).toFixed(2)); // kWh per square meter
        },
        calculateCarbonFootprint(totalUsage) {
            const emissionFactor = 0.5; // kg CO2 per kWh
            const greenEnergyFactor = 0.3; // 30% green energy
            return [
                { label: "Emission", value: parseFloat((totalUsage * emissionFactor).toFixed(2)) },
                { label: "Green Energy", value: parseFloat((totalUsage * greenEnergyFactor).toFixed(2)) },
            ];
        },
    },
    mounted() {
        this.fetchExcelData();
    },
};
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
    background: #f5f7fa;
}

.time-selector {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 20px;
}

.time-button {
    background: #ffffff;
    border: 1px solid #ccc;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.time-button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.card {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}


/* Header Row */
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    margin-top: 3%;
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

.special-cards-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.special-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 20px 30px;
    background: linear-gradient(135deg, #1e293b, #304a75);
    color: #ffffff;
    border-radius: 10px;
    border: none;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: left;
    flex: 1;
}

.special-card-icon {
    font-size: 40px;
    margin-right: 20px;
}

.special-card-content h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.special-card-content .value {
    margin-top: 5px;
    font-size: 24px;
    font-weight: bold;
}

.chart-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Centers the chart horizontally */
    justify-content: center;
    /* Centers the chart vertically */
    position: relative;
    background: #ffffff;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}


.chart-title {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
}
</style>
