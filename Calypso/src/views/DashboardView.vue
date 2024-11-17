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
            <div class="card">
                <h3>Cost Predicted</h3>
                <DonutChart :key="selectedTime" :data="costPredictedData[selectedTime]" />
            </div>

            <!-- Change in Cost -->
            <div class="card">
                <h3>Change in Cost</h3>
                <BarChart :key="selectedTime + 'change'" :data="changeInCostData[selectedTime]" />
            </div>

            <!-- Usage Estimate -->
            <div class="card">
                <h3>Usage Estimate</h3>
                <LineChart :key="selectedTime + 'usage'" :data="usageEstimateData[selectedTime]" />
            </div>

            <!-- Active Appliances -->
            <div class="card">
                <h3>Active Appliances</h3>
                <BarChart :key="selectedTime + 'change'" :data="activeAppliancesData[selectedTime]" />
            </div>

            <!-- Energy Intensity -->
            <div class="card">
                <h3>Energy Intensity</h3>
                <CircularGauge v-if="energyIntensityData[selectedTime] > 0" :data="energyIntensityData[selectedTime]" />
            </div>

            <!-- Carbon Footprint -->
            <div class="card">
                <h3>Carbon Footprint</h3>
                <BarChart v-if="carbonFootprintData[selectedTime]?.length" :data="carbonFootprintData[selectedTime]" />
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import DonutChart from "@/components/charts/DonutChart.vue"; // Donut Chart Component
import BarChart from "@/components/charts/BarChart.vue";   // Bar Chart Component
import LineChart from "@/components/charts/LineChart.vue"; // Line Chart Component
import CircularGauge from "@/components/charts/CircularGauge.vue"; // Circular Gauge Component

export default {
    components: { DonutChart, BarChart, LineChart, CircularGauge },
    data() {
        return {
            timeOptions: ["Today", "Month", "Year"],
            selectedTime: "Today",

            // Initialize data properties with default values
            costPredictedData: {
                Today: { electricity: 0, gas: 0 },
                Month: { electricity: 0, gas: 0 },
                Year: { electricity: 0, gas: 0 },
            },
            changeInCostData: {
                Today: [],
                Month: [],
                Year: [],
            },
            usageEstimateData: {
                Today: [],
                Month: [],
                Year: [],
            },
            activeAppliancesData: {
                Today: [],
                Month: [],
                Year: [],
            },
            energyIntensityData: {
                Today: 0,
                Month: 0,
                Year: 0,
            },
            carbonFootprintData: {
                Today: [],
                Month: [],
                Year: [],
            },
        };
    },
    methods: {
        fetchData() {
            axios.get("http://157.230.240.216:5000/message_history").then((response) => {
                const data = response.data.message_history;

                // Calculate Total Power Usage
                this.totalPowerUsage = this.calculateTotalPowerUsage(data);
                console.log("Total Power Usage:", this.totalPowerUsage);

                // Calculate Automation Efficiency
                this.automationEfficiency = this.calculateAutomationEfficiency(data);
                console.log("Automation Efficiency - Activities:", this.automationEfficiency);

                // Update other data as before
                this.costPredictedData = {
                    ...this.costPredictedData,
                    Today: this.calculateCostPredicted(data),
                };

                this.changeInCostData = {
                    ...this.changeInCostData,
                    Today: this.calculateChangeInCost(data, []), // Mock previous day data
                };

                this.usageEstimateData = {
                    ...this.usageEstimateData,
                    Today: this.calculateUsageEstimate(data),
                };

                this.activeAppliancesData = {
                    ...this.activeAppliancesData,
                    Today: this.calculateActiveAppliances(data),
                };

                this.energyIntensityData = {
                    ...this.energyIntensityData,
                    Today: this.calculateEnergyIntensity(data, 1000),
                };

                this.carbonFootprintData = {
                    ...this.carbonFootprintData,
                    Today: this.calculateCarbonFootprint(data),
                };
            });
        },

        calculateTotalPowerUsage(data) {
            return data.reduce((sum, entry) => sum + (entry.EPI || 0), 0).toFixed(2);
        },


        calculateAutomationEfficiency(data) {
            const totalActivities = data.reduce((sum, entry) => sum + (entry.totalActivities || 0), 0);
            const completedActivities = data.reduce((sum, entry) => sum + (entry.completedActivities || 0), 0);

            if (totalActivities === 0) return 0; // Avoid division by zero
            return ((completedActivities / totalActivities) * 100).toFixed(2); // Efficiency as a percentage
        },


        calculateCostPredicted(data) {
            console.log("Data for Cost Predicted:", data); // Log input data
            const electricityRate = 0.15; // Cost per kWh
            const gasRate = 0.08; // Cost per kWh
            const electricityUsage = data.reduce((sum, entry) => sum + (entry.EPI || 0), 0);
            console.log("Electricity Usage:", electricityUsage); // Log calculated usage
            const gasUsage = electricityUsage * 0.2; // Example assumption
            console.log("Gas Usage:", gasUsage); // Log calculated gas usage

            return {
                electricity: parseFloat((electricityUsage * electricityRate).toFixed(2)),
                gas: parseFloat((gasUsage * gasRate).toFixed(2)),
            };
        },

        calculateChangeInCost(currentData, previousData) {
            const electricityRate = 0.15;
            const currentCost = currentData.reduce((sum, entry) => sum + (entry.EPI || 0), 0) * electricityRate;
            const previousCost = previousData.reduce((sum, entry) => sum + (entry.EPI || 0), 0) * electricityRate;

            return [
                { label: "Yesterday", value: previousCost.toFixed(2) },
                { label: "Today", value: currentCost.toFixed(2) },
            ];
        },

        calculateUsageEstimate(data) {
            if (!data.length) return [];
            const totalUsage = data.reduce((sum, entry) => sum + (entry.EPI || 0), 0);
            const hoursElapsed = new Date().getHours();
            const averageUsage = totalUsage / hoursElapsed;

            return [
                { time: "Till Now", value: totalUsage.toFixed(2) },
                { time: "Predicted", value: (averageUsage * 24).toFixed(2) },
            ];
        },

        calculateActiveAppliances(data) {
            const appliances = {
                "Heating & AC": 0,
                "EV Charge": 0,
                "Plug Loads": 0,
                "Refrigeration": 0,
            };

            data.forEach((entry) => {
                if (entry.deviceType in appliances) {
                    appliances[entry.deviceType] += entry.EPI || 0;
                }
            });

            return Object.entries(appliances).map(([label, value]) => ({
                label,
                value: parseFloat(value.toFixed(2)),
            }));
        },

        calculateEnergyIntensity(data, totalArea) {
            const totalUsage = data.reduce((sum, entry) => sum + (entry.EPI || 0), 0);
            return parseFloat((totalUsage / totalArea).toFixed(2)); // kWh per square foot
        },

        calculateCarbonFootprint(data) {
            const totalUsage = data.reduce((sum, entry) => sum + (entry.EPI || 0), 0);
            const emissionFactor = 0.5; // kg CO2 per kWh
            const greenEnergyFactor = 0.3; // Example: 30% of energy is green

            return [
                { label: "Emission", value: parseFloat((totalUsage * emissionFactor).toFixed(2)) },
                { label: "Green Energy", value: parseFloat((totalUsage * greenEnergyFactor).toFixed(2)) },
            ];
        },
    },
    mounted() {
        this.fetchData();
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
    background: #ffffff;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
    background: linear-gradient(135deg, #007bff, #00c6ff);
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
</style>
