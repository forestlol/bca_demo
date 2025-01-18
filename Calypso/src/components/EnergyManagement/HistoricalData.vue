<template>
    <div class="daily-chart-container">
        <h2>Power Meter Readings</h2>

        <!-- Filters Section -->
        <div class="filters">
            <div class="filters-left">
                <select v-model="selectedGateway" @change="fetchData">
                    <option value="all">All Gateways</option>
                    <option v-for="gateway in gateways" :key="gateway.value" :value="gateway.value">
                        {{ gateway.label }}
                    </option>
                </select>


                <select v-model="selectedType" @change="fetchData">
                    <option value="all">All Types</option>
                    <option value="FCU">VRF Aircon</option>
                    <option value="Lighting">Lighting</option>
                </select>

                <select v-model="selectedMeterSN" @change="fetchData">
                    <option value="all">All Meters</option>
                    <option value="FCU 4">FCU 4</option>
                    <option value="FCU 5">FCU 5</option>
                    <option value="FCU 6">FCU 6</option>
                    <option value="FCU 7">FCU 7</option>
                    <option value="FCU 8">FCU 8</option>
                    <option value="FCU 9">FCU 9</option>
                    <option value="FCU 10">FCU 10</option>
                    <option value="FCU 11">FCU 11</option>
                    <option value="FCU 12">FCU 12</option>
                    <option value="FCU 13">FCU 13</option>
                    <option value="LIGHTING">Overall Lighting</option>
                </select>

                <input type="date" v-model="startDate" @change="onDateChange" placeholder="Choose Date" />
                <input type="date" v-model="endDate" @change="onDateChange" placeholder="Choose Date" />


                <div class="toggle-buttons">
                    <button v-for="range in timeRanges" :key="range" :class="{ active: selectedTimeRange === range }"
                        @click="selectedTimeRange = range; fetchData()">
                        {{ range }}
                    </button>
                </div>
            </div>
            <div class="filters-right">
                <!-- Add Comparison Chart Button -->
                <button class="comparison-button" @click="toggleComparisonMode">
                    {{ isComparisonMode ? "Switch to Normal Chart" : "Switch to Comparison Chart" }}
                </button>

                <button class="settings-button" @click="toggleModal">
                    Settings <span class="settings-icon">&#9881;</span>
                </button>

            </div>
        </div>


        <div class="chart-section">
            <div v-if="!isComparisonMode" class="chart-container">
                <PowerLineChart ref="chartComponent" :data="chartData" :labels="chartLabels"
                    :baselineData="baselineData" :type="chartType" />
                <!-- Toggle Buttons in the Top-Right Corner of the Chart -->
                <div class="chart-toggle">
                    <button :class="{ active: chartType === 'line' }" @click="chartType = 'line'">Line</button>
                    <button :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'">Bar</button>
                </div>
            </div>
            <div v-if="isComparisonMode" class="chart-container">
                <h3>Comparison Chart</h3>
                <PowerLineChart2 ref="comparisonChart" :data="comparisonChartData" :labels="comparisonChartLabels"
                    :type="'line'" />
                <div class="chart-toggle">
                    <button :class="{ active: chartType === 'line' }" @click="chartType = 'line'">Line</button>
                    <button :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'">Bar</button>
                </div>
            </div>
        </div>


    </div>

    <!-- Modal -->
    <div v-if="showSettingsModal" class="modal-overlay">
        <div class="modal">
            <h3>Settings</h3>
            <p>Customize your settings below:</p>

            <div>
                <label>
                    Baseline Power:
                    <input type="number" v-model.number="baselinePower" placeholder="Enter baseline value" />
                </label>
            </div>

            <div>
                <div>
                    <label>
                        <input type="checkbox" v-model="showBaselineLine" />
                        Show Baseline Line
                    </label>
                </div>
            </div>

            <div>
                <label>
                    <input type="checkbox" v-model="showHistoricalLine" />
                    Show Historical Line
                </label>
            </div>

            <button @click="applySettings">Apply</button>
            <button @click="toggleModal">Close</button>
        </div>
    </div>


</template>

<script>
import axios from "axios";
import PowerLineChart from "@/components/charts/PowerLineChart.vue";
import PowerLineChart2 from "@/components/charts/PowerLineChart2.vue";

export default {
    components: { PowerLineChart, PowerLineChart2 },
    data() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        return {
            isComparisonMode: false, // Track if comparison mode is active
            comparisonChartData: [], // Store data for comparison chart
            selectedMeterSN: "all", // Default to "all" meters
            chartType: "line", // Default to line chart
            showSettingsModal: false,
            gateways: [],
            types: ['FCU', 'Lighting'],
            devices: [],
            selectedGateway: "all",
            selectedType: "all",
            selectedDevice: "all",
            // startDate: yesterday.toISOString().split("T")[0],
            // endDate: today.toISOString().split("T")[0],
            startDate: null,
            endDate: null,
            chartLabels: [],
            chartData: [],
            baselinePower: null, // Current baseline value
            baselineData: [], // Array for baseline line data
            lastFiveMinBaseline: 0, // Store the last baseline for 5-min
            baselineSettings: { // Store baseline settings for each time range
                "5-min": { value: null, visible: false }, // Default settings for 5-min
                "Hourly": { value: null, visible: false }, // Default settings for Hourly
                "Daily": { value: null, visible: false }, // Default settings for Daily
                "Monthly": { value: null, visible: false }, // Default settings for Monthly
            },
            timeRanges: ["Hourly", "Daily", "Monthly"],
            selectedTimeRange: "Hourly", // Default to 5-minute intervals
            excelData: [], // To store the parsed Excel data
        };
    },
    watch: {
        selectedTimeRange() {
            if (this.isComparisonMode) {
                // If comparison mode is on, fetch comparison data
                this.fetchComparisonData();
                this.computeBaselineData(); // Recompute the baseline for the new time range
            } else {
                // Otherwise, process normal chart data
                this.processChartData(this.startDate, this.endDate);
                this.computeBaselineData(); // Recompute the baseline for the new time range
            }
        },
    },
    methods: {
        parseCustomDatetime(datetime) {
            const year = parseInt(datetime.slice(0, 4), 10);
            const month = parseInt(datetime.slice(4, 6), 10) - 1; // Months are 0-indexed
            const day = parseInt(datetime.slice(6, 8), 10);
            const hours = parseInt(datetime.slice(8, 10), 10);
            const minutes = parseInt(datetime.slice(10, 12), 10);
            const seconds = parseInt(datetime.slice(12, 14), 10);
            return new Date(year, month, day, hours, minutes, seconds);
        },
        // Toggle Comparison Mode
        toggleComparisonMode() {
            this.isComparisonMode = !this.isComparisonMode;
            if (this.isComparisonMode) {
                this.fetchComparisonData(); // Fetch and render comparison data
            } else {
                this.fetchData(); // Fetch and render normal data
            }
        },
        async fetchComparisonData() {
            const meterSNs = this.getMeterRanges(); // Get meter ranges dynamically
            const spreadsheetId = "17r_D5R-YOVhlv8aq2eYAedfV0Xk1BOTBt_-XXcc6MW0";
            const apiKey = "AIzaSyCpfklZ6Co5YWR--V46w8MurzjucSXuauc";
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?key=${apiKey}&ranges=${meterSNs
                .map((sn) => encodeURIComponent(sn))
                .join("&ranges=")}`;

            let startDateObj, endDateObj;

            // Determine the default date range based on the selected time range
            if (this.selectedTimeRange === "Monthly") {
                startDateObj = new Date(2024, 10, 31); // Defaults to December 1, 2024
            } else {
                startDateObj = new Date(this.startDate || new Date());
            }

            endDateObj = new Date(this.endDate || new Date());
            endDateObj.setHours(23, 59, 59, 999);

            try {
                const response = await axios.get(url);
                const rawData = response.data.valueRanges;

                // Parse Google Sheets data
                const parsedData = this.parseGoogleSheetsComparisonData(rawData, meterSNs);

                // Apply date filtering
                const filteredData = this.filterDataByDateRange(parsedData, startDateObj, endDateObj);

                // Handle transformations based on the selected time range
                if (this.selectedTimeRange === "Hourly") {
                    const hourlyData = this.transformDailyToHourly(filteredData);
                    this.formatComparisonChartData(hourlyData);
                } else if (this.selectedTimeRange === "Daily") {
                    const dailyData = this.aggregateDailyData(filteredData);
                    this.formatComparisonChartData(dailyData);
                } else if (this.selectedTimeRange === "Monthly") {
                    const monthlyData = this.aggregateMonthlyData(filteredData);
                    this.formatComparisonChartData(monthlyData);
                } else {
                    const differenceData = this.computeDifferences(filteredData);
                    this.formatComparisonChartData(differenceData);
                }
            } catch (error) {
                console.error("Error fetching comparison data:", error);
            }
        },

        aggregateMonthlyData(filteredData) {
            const monthlyData = {};

            Object.keys(filteredData).forEach((meterSN) => {
                const meterData = filteredData[meterSN];
                const monthlyMeterData = {};

                meterData.forEach((entry) => {
                    const entryDate = new Date(entry.time);
                    const monthKey = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}`; // Format as "YYYY-MM"

                    if (!monthlyMeterData[monthKey]) {
                        monthlyMeterData[monthKey] = 0;
                    }

                    monthlyMeterData[monthKey] += entry.value; // Sum values for the same month
                });

                // Convert aggregated monthly data into an array of objects
                monthlyData[meterSN] = Object.entries(monthlyMeterData).map(([month, value]) => ({
                    time: month,
                    value,
                }));
            });

            console.log("Monthly Aggregated Data by Meter:", monthlyData); // Log aggregated monthly data
            return monthlyData;
        },

        aggregateDailyData(filteredData) {
            const dailyData = {};

            Object.keys(filteredData).forEach((meterSN) => {
                const meterData = filteredData[meterSN];
                const dailyMeterData = {};

                meterData.forEach((entry) => {
                    const entryDate = new Date(entry.time);
                    const dayKey = entryDate.toISOString().split("T")[0]; // Extract the date part (e.g., "2025-01-03")

                    if (!dailyMeterData[dayKey]) {
                        dailyMeterData[dayKey] = 0;
                    }

                    dailyMeterData[dayKey] += entry.value; // Sum values for the same day
                });

                // Convert aggregated daily data into an array of objects
                dailyData[meterSN] = Object.entries(dailyMeterData).map(([date, value]) => ({
                    time: date,
                    value,
                }));
            });

            console.log("Daily Aggregated Data by Meter:", dailyData); // Log aggregated daily data
            return dailyData;
        },

        filterDataByDateRange(parsedData, startDateObj, endDateObj) {
            const filteredData = {};

            Object.keys(parsedData).forEach((meterSN) => {
                const meterData = parsedData[meterSN];
                filteredData[meterSN] = meterData.filter(({ time }) => {
                    const entryDate = new Date(time);
                    return entryDate >= startDateObj && entryDate <= endDateObj;
                });
            });

            console.log("Filtered Data by Date Range:", filteredData);
            return filteredData;
        },

        transformDailyToHourly(filteredData) {
            const hourlyData = {};

            Object.keys(filteredData).forEach((meterSN) => {
                const meterData = filteredData[meterSN];
                const hourlyMeterData = [];

                meterData.forEach((entry) => {
                    const entryDate = new Date(entry.time);

                    // Divide daily value into 24 equal parts
                    const hourlyValue = entry.value / 24;

                    for (let hour = 0; hour < 24; hour++) {
                        const hourDate = new Date(entryDate);
                        hourDate.setHours(hour);

                        hourlyMeterData.push({
                            time: hourDate.toISOString(),
                            value: hourlyValue,
                        });
                    }
                });

                hourlyData[meterSN] = hourlyMeterData;
            });

            console.log("Hourly Data After Date Filtering:", hourlyData);
            return hourlyData;
        },

        getMeterRanges() {
            if (this.selectedType === "FCU") {
                return [
                    "FCU 4", "FCU 5", "FCU 6", "FCU 7", "FCU 8",
                    "FCU 9", "FCU 10", "FCU 11", "FCU 12", "FCU 13"
                ];
            } else if (this.selectedType === "Lighting") {
                return ["LIGHTING"];
            } else if (this.selectedMeterSN === "all") {
                return [
                    "FCU 4", "FCU 5", "FCU 6", "FCU 7", "FCU 8",
                    "FCU 9", "FCU 10", "FCU 11", "FCU 12", "FCU 13", "LIGHTING"
                ];
            } else {
                return [this.selectedMeterSN];
            }
        },

        parseGoogleSheetsComparisonData(rawData, meterSNs) {
            const parsedData = {};

            rawData.forEach((sheet, index) => {
                const rows = sheet.values.slice(1); // Skip header row
                const meterSN = meterSNs[index]; // Map the range back to the meterSN

                console.log(`Processing data for meter: ${meterSN}`, rows); // Log raw rows for each meter

                rows.forEach((row) => {
                    const time = row[0]; // Time column
                    const value = parseFloat(row[3]) || 0; // Energy consumption value

                    if (!parsedData[meterSN]) {
                        parsedData[meterSN] = [];
                    }

                    parsedData[meterSN].push({ time, value });
                });
            });

            console.log("Parsed Data by Meter:", parsedData); // Log parsed data by meter
            return parsedData;
        },

        computeDifferences(parsedData) {
            const differences = {};

            Object.keys(parsedData).forEach((meterSN) => {
                const meterData = parsedData[meterSN];
                const meterDifferences = [];

                console.log(`Computing differences for ${meterSN}:`, meterData); // Log each meter's data

                meterData.forEach((entry, index) => {
                    if (index === 0) return; // Skip the first entry as there’s no previous value to compare

                    const previousValue = meterData[index - 1].value;
                    const difference = entry.value - previousValue;

                    meterDifferences.push({
                        time: entry.time,
                        difference: Math.abs(difference), // Ensure positive differences
                    });
                });

                differences[meterSN] = meterDifferences;
            });

            console.log("Differences by Meter:", differences); // Log computed differences
            return differences;
        },

        formatComparisonChartData(differenceData) {
            const labels = new Set();
            const datasets = [];

            Object.keys(differenceData).forEach((meterSN) => {
                const meterDifferences = differenceData[meterSN];
                const dataset = { label: meterSN, data: [] };

                meterDifferences.forEach(({ time, value }) => {
                    labels.add(time);
                    dataset.data.push(value);
                });

                datasets.push({
                    label: meterSN, // Meter name as dataset label
                    data: dataset.data, // Values for the chart
                    borderColor: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
                    backgroundColor: "rgba(0, 0, 0, 0)", // Transparent
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                });
            });

            const sortedLabels = Array.from(labels).sort((a, b) => new Date(a) - new Date(b));

            // Remove 'T' and 'Z' from the labels
            this.chartLabels = sortedLabels.map((label) => {
                const date = new Date(label);
                return date.toISOString().replace('T', ' ').replace('Z', '');
            });

            this.comparisonChartLabels = this.chartLabels;
            this.comparisonChartData = datasets;

            console.log("Formatted Chart Labels:", this.comparisonChartLabels);
            console.log("Formatted Chart Data:", this.comparisonChartData);

            this.renderComparisonChart();
        },

        renderComparisonChart() {
            this.$nextTick(() => {
                if (!this.$refs.comparisonChart) {
                    console.error("Comparison chart reference is null.");
                    return;
                }

                if (this.comparisonChartLabels && this.comparisonChartData.length > 0) {
                    this.$refs.comparisonChart.renderChart(this.comparisonChartLabels, this.comparisonChartData);
                } else {
                    console.warn("No data available to render the comparison chart.");
                }
            });
        },

        toggleModal() {
            this.showSettingsModal = !this.showSettingsModal;
        },
        fetchDropdownData() {
            axios
                .get("https://geibms.com/message_history")
                .then((response) => {
                    const data = response.data.message_history;
                    this.populateDropdowns(data);
                })
                .catch((error) => console.error("Error fetching dropdown data:", error));
        },
        fetchData() {
            // If startDate or endDate is null, set defaults
            this.computeBaselineData(); // Recompute baseline after data is fetched
            this.fetchComparisonData();
            this.processChartData(this.startDate, this.endDate);
        },
        populateDropdowns(data) {
            // Create a set of gateways with label as "GE Canteen" and value as gwSN
            this.gateways = [
                { label: "GE Canteen", value: "24052003410033" }, // Map "GE Canteen" to the gwSN
            ];

            // Modify types: replace "data" with "Individual Devices"
            this.types = [
                ...new Set(
                    data.map((entry) =>
                        entry.type === "data" ? "Individual Devices" : entry.type
                    )
                ),
            ];

            this.devices = [...new Set(data.map((entry) => entry.device))];

            // Ensure "VRF AIRCON" is included in the types
            if (!this.types.includes("VRF AIRCON")) {
                this.types.push("VRF AIRCON");
            }

            // Ensure "LIGHTING" is included in the types
            if (!this.types.includes("LIGHTING")) {
                this.types.push("LIGHTING");
            }
        },
        onDateChange() {
            // Call processChartData when the date range changes
            this.fetchComparisonData();
            this.processChartData(this.startDate, this.endDate);
        },
        computeBaselineData() {
            // Load the baseline settings for the new time range
            const settings = this.baselineSettings[this.selectedTimeRange] || { value: null, visible: false };
            this.baselinePower = settings.value;
            this.showBaselineLine = settings.visible;

            // Compute the baseline data only if the baseline is set to visible
            if (this.showBaselineLine && this.baselinePower !== null) {
                this.baselineData = this.chartLabels.map(() => this.baselinePower);
            } else {
                this.baselineData = [];
            }
        },
        applySettings() {
            // Save the baseline settings for the selected time range
            if (this.selectedTimeRange) {
                this.baselineSettings[this.selectedTimeRange] = {
                    value: this.baselinePower,
                    visible: this.showBaselineLine,
                };
            }

            // Recompute the baseline data based on the updated settings
            this.computeBaselineData();

            // Close the modal
            this.toggleModal();
        },
        async processChartData(startDate = this.startDate, endDate = this.endDate) {
            const cacheKey = `chartData_${this.selectedMeterSN}_${this.selectedTimeRange}_${startDate}_${endDate}`;
            const cacheExpirationKey = `${cacheKey}_expiration`;

            // Check if cached data exists and is still valid
            const cachedData = localStorage.getItem(cacheKey);
            const cacheExpiration = localStorage.getItem(cacheExpirationKey);

            if (cachedData && cacheExpiration && new Date() < new Date(cacheExpiration)) {
                console.log("Using cached data for chart.");
                const { labels, data } = JSON.parse(cachedData);
                this.chartLabels = labels;
                this.chartData = data;
                this.updateChart();
                return;
            }

            const labels = [];
            const data = [];
            let meterSNs = [];

            if (this.selectedType === "FCU") {
                meterSNs = [
                    "FCU 4", "FCU 5", "FCU 6", "FCU 7", "FCU 8",
                    "FCU 9", "FCU 10", "FCU 11", "FCU 12", "FCU 13"
                ];
            } else if (this.selectedType === "Lighting") {
                meterSNs = ["LIGHTING"];
            } else if (this.selectedMeterSN === "all" && this.selectedTimeRange === "Monthly") {
                meterSNs = ["Total_Daily_kWh"]; // Use Total_Daily_KWh tab for monthly aggregation
            } else if (this.selectedMeterSN === "all") {
                meterSNs = [
                    "FCU 4", "FCU 5", "FCU 6", "FCU 7", "FCU 8",
                    "FCU 9", "FCU 10", "FCU 11", "FCU 12", "FCU 13", "LIGHTING"
                ];
            } else {
                meterSNs = [this.selectedMeterSN];
            }

            let startDateObj;

            if (this.selectedTimeRange === "Monthly") {
                startDateObj = new Date(2024, 10, 31); // 31st November 2024 (auto-corrects to December 1st, 2024)
            } else {
                startDateObj = new Date(startDate || new Date());
            }

            const endDateObj = new Date(endDate || new Date());
            endDateObj.setHours(24, 59, 59, 999);



            const fetchGoogleSheetsData = async () => {
                try {
                    const spreadsheetId = "17r_D5R-YOVhlv8aq2eYAedfV0Xk1BOTBt_-XXcc6MW0";
                    const apiKey = "AIzaSyCpfklZ6Co5YWR--V46w8MurzjucSXuauc";
                    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?key=${apiKey}&ranges=${meterSNs
                        .map((sn) => encodeURIComponent(sn))
                        .join("&ranges=")}`;

                    const response = await axios.get(url);
                    const rawData = response.data.valueRanges;

                    let parsedData = [];
                    rawData.forEach((sheet) => {
                        const rows = sheet.values.slice(1); // Skip header row
                        for (const row of rows) {
                            // Stop reading further if an empty row is encountered
                            if (row.every((cell) => cell === "" || cell === undefined)) {
                                break;
                            }

                            // Handle the "Total_Daily_KWh" tab differently
                            if (meterSNs.includes("Total_Daily_kWh")) {
                                parsedData.push({
                                    time: row[0], // Time column
                                    daily_kWh: parseFloat(row[1]) || 0, // Daily_kWh
                                    hourly_kWh: parseFloat(row[2]) || 0, // Hourly_kWh
                                });
                            } else {
                                // Handle other tabs with the general structure
                                parsedData.push({
                                    time: row[0], // Time column
                                    meterSN: sheet.range.split("!")[0], // Extract tab name
                                    daily_kWh: parseFloat(row[3]) || 0, // Daily_kWh
                                });
                            }
                        }
                    });

                    console.log("Parsed Google Sheets Data:", parsedData);
                    return parsedData;
                } catch (error) {
                    console.error("Error fetching Google Sheets data:", error);
                    return [];
                }
            };

            try {
                const googleSheetsData = await fetchGoogleSheetsData();

                // Filter data by date range
                const filteredData = googleSheetsData.filter((entry) => {
                    const entryDate = new Date(entry.time);
                    return entryDate >= startDateObj && entryDate <= endDateObj;
                });

                console.log("Filtered data after date filtering:", filteredData);

                // Validate filtered data to remove invalid entries
                const validFilteredData = filteredData.filter((entry) => entry.time && !isNaN(new Date(entry.time)));
                console.log("Valid filtered data:", validFilteredData);

                if (validFilteredData.length === 0) {
                    console.warn("No valid data available for the selected meterSN or date range.");
                    this.chartLabels = [];
                    this.chartData = [];
                    this.updateChart();
                    return;
                }

                // Continue processing with validFilteredData
                if (this.selectedTimeRange === "Daily") {
                    if (this.selectedMeterSN === "all") {
                        const aggregatedData = {};
                        validFilteredData.forEach((entry) => {
                            const dateKey = entry.time.split(" ")[0];
                            if (!aggregatedData[dateKey]) {
                                aggregatedData[dateKey] = 0;
                            }
                            aggregatedData[dateKey] += entry.daily_kWh || 0;
                        });

                        Object.keys(aggregatedData)
                            .sort((a, b) => new Date(a) - new Date(b))
                            .forEach((key) => {
                                labels.push(key);
                                data.push(aggregatedData[key]);
                            });
                    } else {
                        validFilteredData
                            .sort((a, b) => new Date(a.time) - new Date(b.time))
                            .forEach((entry) => {
                                labels.push(entry.time);
                                data.push(entry.daily_kWh);
                            });
                    }
                } else if (this.selectedTimeRange === "Hourly") {
                    const hourlyData = {};

                    // Divide daily_kWh by 24 and aggregate hourly data
                    filteredData.forEach((entry) => {
                        const entryDate = new Date(entry.time);

                        for (let hour = 0; hour < 24; hour++) {
                            const hourKey = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1)
                                .toString()
                                .padStart(2, "0")}-${entryDate.getDate().toString().padStart(2, "0")} ${hour
                                    .toString()
                                    .padStart(2, "0")}:00`;

                            if (!hourlyData[hourKey]) {
                                hourlyData[hourKey] = 0;
                            }
                            hourlyData[hourKey] += entry.daily_kWh / 24; // Divide by 24 for hourly data
                        }
                    });

                    // Sort and limit to the range
                    Object.keys(hourlyData)
                        .sort((a, b) => new Date(a) - new Date(b))
                        .forEach((key) => {
                            if (labels.length < 24) {
                                labels.push(key);
                                data.push(hourlyData[key]);
                            }
                        });
                } else if (this.selectedTimeRange === "Monthly") {
                    const monthlyData = {};

                    // Get the start date for three months ago and the end of the current month
                    const currentDate = new Date();
                    const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
                    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                    console.log("Start of range:", startMonth);
                    console.log("End of range:", endMonth);

                    validFilteredData.forEach((entry) => {
                        const entryDate = new Date(entry.time);

                        if (entryDate >= startMonth && entryDate <= endMonth) {
                            const monthKey = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1).toString().padStart(2, "0")}`;
                            if (!monthlyData[monthKey]) {
                                monthlyData[monthKey] = 0;
                            }
                            monthlyData[monthKey] += entry.daily_kWh || 0;
                        }
                    });

                    console.log("Filtered and aggregated monthly data:", monthlyData);

                    Object.keys(monthlyData)
                        .sort((a, b) => new Date(a) - new Date(b))
                        .forEach((key) => {
                            labels.push(key);
                            data.push(monthlyData[key]);
                        });

                    console.log("Monthly labels:", labels);
                    console.log("Monthly data:", data);
                }

                // Cache the data and expiration timestamp
                localStorage.setItem(cacheKey, JSON.stringify({ labels, data }));
                localStorage.setItem(cacheExpirationKey, new Date().getTime() + 60 * 60 * 1000);

                this.chartLabels = labels;
                this.chartData = data;
                this.updateChart();
            } catch (error) {
                console.error("Error processing chart data:", error);
            }
        },
        updateChart() {
            this.$nextTick(() => {
                if (this.$refs.chartComponent) {
                    this.$refs.chartComponent.renderChart(this.chartLabels, this.chartData);
                } else {
                    console.error("Chart component reference is null.");
                }
            });
        }
    },
    mounted() {
        this.fetchDropdownData();
        this.fetchData();
    },
    beforeUnmount() {
        if (this.chart) this.chart.destroy();
    },
};
</script>


<style scoped>
.daily-chart-container {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.filters select,
.filters input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
}

.toggle-buttons button {
    padding: 10px 20px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
}

.toggle-buttons button.active {
    background-color: #007bff;
    color: white;
}

.chart-section {
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding-bottom: 50px;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    /* Dim background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width: 300px;
    text-align: center;
    position: relative;
    z-index: 10000;
    display: block !important;
    /* Ensure it's visible */
    visibility: visible !important;
    /* Ensure visibility */
    height: auto;
    /* Ensure it has a height */
}


.settings-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.settings-button {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    gap: 5px;
}

.settings-button .settings-icon {
    font-size: 16px;
}

.settings-button:hover {
    background-color: #0056b3;
}

.filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
    gap: 10px;
}

.filters-left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.filters-right {
    display: flex;
    align-items: center;
}

.settings-button {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    gap: 5px;
}

.settings-button .settings-icon {
    font-size: 16px;
}

.settings-button:hover {
    background-color: #0056b3;
}

.modal label {
    display: block;
    margin-bottom: 10px;
    font-size: 14px;
}

.modal input[type="checkbox"] {
    margin-right: 10px;
}

.chart-container {
    position: relative;
    /* Ensures the toggle buttons are positioned relative to the chart */
    width: 100%;
    height: 400px;
    background-color: white;
    border-radius: 10px;
}

.chart-toggle {
    position: absolute;
    top: 0px;
    right: 10px;
    display: flex;
    gap: 5px;
    z-index: 10;
    /* Ensure the toggle buttons appear above the chart */
}

.chart-toggle button {
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    background-color: #f0f0f0;
    font-size: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease;
}

.chart-toggle button.active {
    background-color: #007bff;
    color: white;
}

.chart-toggle button:hover {
    background-color: #0056b3;
    color: white;
}

.filters-right .comparison-button {
    padding: 10px 15px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 10px;
}

.filters-right .comparison-button:hover {
    background-color: #218838;
}
</style>