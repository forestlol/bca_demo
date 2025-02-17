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
                        <h3>Power Usage Overview</h3>
                        <br>
                        <p>Current Month: <strong>{{ currentMonthPowerUsage }} kWh</strong></p>
                        <br>
                        <h3>Analytics</h3>
                        <br>
                        <p>2 Months Ago: <strong>{{ twoMonthsAgoPowerUsage }} kWh</strong></p>
                        <p>Last Month: <strong>{{ lastMonthPowerUsage }} kWh</strong></p>
                        <!-- New line for Current Month -->


                        <!-- Variance uses Math.abs for both absolute & percentage -->
                        <p>
                            Variance:
                            <strong>{{ Math.abs(monthToMonthVariance.absolute) }} kWh</strong>
                            (
                            <span :class="{
                                'variance-green': monthToMonthVariance.percentage < 0,
                                'variance-red': monthToMonthVariance.percentage > 0
                            }">
                                {{ Math.abs(monthToMonthVariance.percentage) }}%
                            </span>
                            )
                        </p>
                    </div>
                </div>

                <!-- Automation Efficiency -->
                <div class="special-card">
                    <div class="special-card-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="special-card-content">
                        <h3>Automation Efficiency</h3>
                        <br>
                        <p>
                            Estimated Optimised Power Usage:
                            <strong>{{ fixedOptimisedPowerUsage }} kWh</strong>
                        </p>
                        <p>
                            Estimated Cost:
                            <strong>$ {{ (fixedOptimisedPowerUsage * costRate).toFixed(2) }}</strong>
                        </p>
                        <p>
                            Last Month kWh:
                            <strong>{{ lastMonthPowerUsage }} kWh</strong>
                        </p>
                        <p>
                            Efficiency Variance:
                            <strong :class="{
                                'variance-green': efficiencyVariance < 0,
                                'variance-red': efficiencyVariance > 0
                            }">
                                {{ efficiencyVariance < 0 ? '' : '+' }}{{ Math.abs(efficiencyVariance).toFixed(3) }}%
                                    </strong>
                        </p>
                    </div>
                </div>


            </div>
            <!-- Change in Cost -->
            <div class="chart-card">
                <h3 class="chart-title">Cost Predicted</h3>
                <BarChartForCostPredicted :key="selectedTime + 'change'" :data="changeInCostData[selectedTime]" />
                <!-- 2 months ago kwh vs last month kwh vs this month kwh -->
                <!-- optimize  -->
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
        </div>
    </div>
</template>

<script>
import * as XLSX from "xlsx";
import BarChart from "@/components/charts/BarChart.vue";
import LineChart from "@/components/charts/LineChart.vue";
import BarChartForCostPredicted from "@/components/charts/BarChartForCostPredicted.vue";
import axios from "axios";

export default {
    components: { BarChart, LineChart, BarChartForCostPredicted },
    data() {
        return {
            timeOptions: ["Today", "Month", "Year"],
            selectedTime: "Month",
            totalPowerUsage: 0,
            automationEfficiency: 0, // Example value (could be dynamic later)
            fixedOptimisedPowerUsage: 4000, // Fixed estimated optimised power usage (in kWh)
            costRate: 0.28, // Cost rate in dollars per kWh
            lastMonthPowerUsage: 0, // This will be updated via fetchMonthlyChartData
            costPredictedData: { Today: {}, Month: {}, Year: {} },
            changeInCostData: { Today: [], Month: [], Year: [] },
            usageEstimateData: { Today: [], Month: [], Year: [] },
            activeAppliancesData: { Today: [], Month: [], Year: [] },
            energyIntensityData: { Today: 0, Month: 0, Year: 0 },
            carbonFootprintData: { Today: [], Month: [], Year: [] },
            twoMonthsAgoPowerUsage: 0,
            currentMonthPowerUsage: 0,
            lastMonthAutomationEfficiency: 0,
            twoMonthsAgoAutomationEfficiency: 0,
        };
    },
    computed: {
        efficiencyVariance() {
            const fixed = this.fixedOptimisedPowerUsage;
            if (fixed) {
                return ((fixed - this.lastMonthPowerUsage) / fixed) * 100;
            }
            return 0;
        },
        // Computed property to calculate month-to-month variance
        monthToMonthVariance() {
            if (this.twoMonthsAgoPowerUsage > 0) {
                const absolute = this.lastMonthPowerUsage - this.twoMonthsAgoPowerUsage;
                const percentage = (absolute / this.twoMonthsAgoPowerUsage) * 100;
                return {
                    absolute: parseFloat(absolute.toFixed(2)),
                    percentage: parseFloat(percentage.toFixed(2))
                };
            }
            return { absolute: 0, percentage: 0 };
        },
        estimatedOptimisedPowerUsage() {
            const reductionFactor = 1 - ((100 - this.automationEfficiency) / 100 * 0.1);
            return (this.totalPowerUsage * reductionFactor).toFixed(2);
        },
        estimatedOptimisedCost() {
            return (this.estimatedOptimisedPowerUsage * this.costRate).toFixed(2);
        },
        automationEfficiencyVariance() {
            return this.lastMonthAutomationEfficiency - this.twoMonthsAgoAutomationEfficiency;
        },
    },
    methods: {
        async fetchActiveAppliancesMonthlyData() {
            try {
                // Define the sensors you want to compare
                const sensors = [
                    "FCU 4", "FCU 5", "FCU 6", "FCU 7", "FCU 8",
                    "FCU 9", "FCU 10", "FCU 11", "FCU 12", "FCU 13", "LIGHTING"
                ];

                // Set up your Google Sheets API configuration
                const spreadsheetId = "17r_D5R-YOVhlv8aq2eYAedfV0Xk1BOTBt_-XXcc6MW0";
                const apiKey = "AIzaSyCpfklZ6Co5YWR--V46w8MurzjucSXuauc";

                // Build the batch URL for all sensor ranges. Each sensor name is used as a range.
                const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?key=${apiKey}&ranges=${sensors
                    .map((sensor) => encodeURIComponent(sensor))
                    .join("&ranges=")}`;

                const response = await axios.get(url);
                const valueRanges = response.data.valueRanges;
                console.log("Raw valueRanges:", valueRanges);

                if (!valueRanges || valueRanges.length === 0) {
                    console.warn("No sensor data found in the Google Sheet.");
                    return;
                }

                // Get the current month and year
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth(); // 0-indexed

                // Process each sensor's data
                const sensorMonthlyValues = valueRanges.map((rangeData, index) => {
                    const sensorName = sensors[index];

                    // If there's no data or it's just headers, return 0
                    if (!rangeData.values || rangeData.values.length < 2) {
                        return { sensor: sensorName, value: 0 };
                    }

                    // Skip the first row (headers): ["Datetime", "MeterSN", "Daily_kWh", "Hourly_kWh"]
                    const rows = rangeData.values.slice(1);

                    // We'll store one daily_kWh reading per day (the first one we see)
                    const dailyValues = {};

                    rows.forEach((row) => {
                        // row[0] => Datetime (e.g. "2024-12-01 00:00:00")
                        // row[1] => MeterSN (not needed here)
                        // row[2] => daily_kWh
                        // row[3] => hourly_kWh (not needed here)
                        const dateStr = row[0];
                        const dailyKwh = parseFloat(row[3]) || 0; // Use the third column for daily_kWh
                        const date = new Date(dateStr);

                        if (
                            date.getFullYear() === currentYear &&
                            date.getMonth() === currentMonth
                        ) {
                            // Use only the date portion (e.g. "2024-12-01") as the key
                            const dayKey = date.toISOString().split("T")[0];

                            // If we haven't stored a reading for this day yet, store it now
                            // This effectively "skips" subsequent rows on the same day
                            if (dailyValues[dayKey] === undefined) {
                                dailyValues[dayKey] = dailyKwh;
                            }
                        }
                    });

                    // Sum up the daily values for this sensor
                    const totalMonthly = Object.values(dailyValues).reduce(
                        (acc, val) => acc + val,
                        0
                    );

                    return {
                        sensor: sensorName,
                        value: parseFloat(totalMonthly.toFixed(2)),
                    };
                });

                // Map the results into the format expected by your BarChart:
                // An array of objects with `label` and `value`
                const barChartData = sensorMonthlyValues.map((item) => ({
                    label: item.sensor,
                    value: item.value,
                }));

                // Update the activeAppliancesData for the "Month" option
                this.activeAppliancesData.Month = barChartData;
                console.log("Active Appliances Monthly Data:", barChartData);
            } catch (error) {
                console.error("Error fetching active appliances monthly data:", error);
            }
        },
        async fetchMonthlyChartData() {
            try {
                const spreadsheetId = "17r_D5R-YOVhlv8aq2eYAedfV0Xk1BOTBt_-XXcc6MW0";
                const apiKey = "AIzaSyCpfklZ6Co5YWR--V46w8MurzjucSXuauc";
                const range = "Total_Daily_kWh";
                const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

                const response = await axios.get(url);
                const sheetData = response.data.values;
                if (!sheetData || sheetData.length < 2) {
                    console.warn("No data found in the Google Sheet.");
                    return;
                }

                // Skip header row
                const rows = sheetData.slice(1);

                // 1) Aggregate daily usage by month (formatted as "YYYY-MM")
                const monthlyAggregation = {};
                rows.forEach((row) => {
                    const dateStr = row[0]; // Date column
                    const usage = parseFloat(row[1]) || 0; // Daily kWh usage
                    const date = new Date(dateStr);
                    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}`;
                    if (!monthlyAggregation[monthKey]) {
                        monthlyAggregation[monthKey] = 0;
                    }
                    monthlyAggregation[monthKey] += usage;
                });

                // 2) Sort the months chronologically and map to an array
                const sortedMonths = Object.keys(monthlyAggregation).sort(
                    (a, b) => new Date(a) - new Date(b)
                );
                const monthlyData = sortedMonths.map((monthKey) => ({
                    time: monthKey,
                    value: parseFloat(monthlyAggregation[monthKey].toFixed(2)),
                }));

                // Save monthly data for usage estimate charts (if needed)
                this.usageEstimateData.Month = monthlyData;

                // 3) Identify the current month key (YYYY-MM)
                const now = new Date();
                const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

                // 4) Get current month usage (it might be incomplete)
                const currentMonthData = monthlyData.find((m) => m.time === currentMonthKey);
                this.currentMonthPowerUsage = currentMonthData ? currentMonthData.value : 0;
                // Use current month's usage as the total power usage (adjust if needed)
                this.totalPowerUsage = this.currentMonthPowerUsage;

                // 5) Filter out the current month to get the last two *completed* months
                const completedMonths = monthlyData.filter((m) => m.time !== currentMonthKey);

                if (completedMonths.length >= 2) {
                    const lastMonthData = completedMonths[completedMonths.length - 1];
                    const twoMonthsAgoData = completedMonths[completedMonths.length - 2];
                    this.lastMonthPowerUsage = lastMonthData.value;
                    this.twoMonthsAgoPowerUsage = twoMonthsAgoData.value;
                } else if (completedMonths.length === 1) {
                    this.lastMonthPowerUsage = completedMonths[0].value;
                    this.twoMonthsAgoPowerUsage = 0;
                } else {
                    this.lastMonthPowerUsage = 0;
                    this.twoMonthsAgoPowerUsage = 0;
                }

                // 6) Derive automation efficiency percentages.
                // For example, assume that a baseline of 1000 kWh represents optimal usage (100% efficiency).
                // Lower usage means higher efficiency. (This formula is arbitrary—adjust as needed.)
                const baseline = 1000;
                this.lastMonthAutomationEfficiency = this.lastMonthPowerUsage
                    ? parseFloat((((baseline - this.lastMonthPowerUsage) / baseline) * 100).toFixed(2))
                    : 0;
                this.twoMonthsAgoAutomationEfficiency = this.twoMonthsAgoPowerUsage
                    ? parseFloat((((baseline - this.twoMonthsAgoPowerUsage) / baseline) * 100).toFixed(2))
                    : 0;
                // For current automation efficiency, we use last month's efficiency as an example.
                this.automationEfficiency = this.lastMonthAutomationEfficiency;

                // 7) Update the cost predicted chart data using the cost rate ($0.28 per kWh)
                this.changeInCostData.Month = [
                    {
                        label: "2 Months Ago",
                        usage: this.twoMonthsAgoPowerUsage,
                        cost: parseFloat((this.twoMonthsAgoPowerUsage * this.costRate).toFixed(2)),
                        value: parseFloat((this.twoMonthsAgoPowerUsage * this.costRate).toFixed(2)),
                    },
                    {
                        label: "Last Month",
                        usage: this.lastMonthPowerUsage,
                        cost: parseFloat((this.lastMonthPowerUsage * this.costRate).toFixed(2)),
                        value: parseFloat((this.lastMonthPowerUsage * this.costRate).toFixed(2)),
                    },
                    {
                        label: "Current Month",
                        usage: this.currentMonthPowerUsage,
                        cost: parseFloat((this.currentMonthPowerUsage * this.costRate).toFixed(2)),
                        value: parseFloat((this.currentMonthPowerUsage * this.costRate).toFixed(2)),
                    },
                ];
            } catch (error) {
                console.error("Error fetching monthly chart data:", error);
            }
        },
        // fetchExcelData() {
        //     const filePath = "/assets/Simulated Data.xlsx";
        //     fetch(filePath)
        //         .then((response) => {
        //             if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        //             return response.arrayBuffer();
        //         })
        //         .then((arrayBuffer) => {
        //             const workbook = XLSX.read(arrayBuffer, { type: "array" });
        //             const sheet = workbook.Sheets["Compiled"];
        //             const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        //             this.processExcelData(sheetData);
        //         })
        //         .catch((error) => {
        //             console.error("Error reading Excel file:", error);
        //         });
        // },
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
        // calculateUsageEstimate(totalUsage) {
        //     const hoursElapsed = new Date().getHours();
        //     const averageUsage = totalUsage / hoursElapsed;
        //     return [
        //         { time: "Till Now", value: parseFloat(totalUsage.toFixed(2)) },
        //         { time: "Predicted", value: parseFloat((averageUsage * 24).toFixed(2)) },
        //     ];
        // },
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
        // this.fetchExcelData();
        this.fetchMonthlyChartData();
        this.fetchActiveAppliancesMonthlyData();
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
    grid-template-columns: repeat(2, 1fr);
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
    padding: 20px 15px;
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

.chart-card canvas {
    flex-grow: 1;
    /* Makes the canvas/chart fill the available space */
    width: 100% !important;
    /* Ensures it stretches to the container width */
    height: auto !important;
    /* Ensures proportional scaling */
}

.variance-green {
    color: lightgreen;
}

.variance-red {
    color: #FF7F7F;
}
</style>
