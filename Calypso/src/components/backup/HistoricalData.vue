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
                    <option value="24061901790001">FCU 4</option>
                    <option value="24060404690001">FCU 5</option>
                    <option value="24112209220002">FCU 6</option>
                    <option value="24060410030002">FCU 7</option>
                    <option value="24112209220006">FCU 8</option>
                    <option value="24060404690002">FCU 9</option>
                    <option value="24060410030003">FCU 10</option>
                    <option value="24060410030004">FCU 11</option>
                    <option value="24112209220003">FCU 12</option>
                    <option value="24112209220005">FCU 13</option>
                    <option value="24112209220004">Overall Lighting</option>
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
import * as XLSX from "xlsx";
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
        fetchComparisonData() {
            let meterSNs = [];
            if (this.selectedType === 'FCU') {
                meterSNs = [
                    "24061901790001", // FCU 4
                    "24060404690001", // FCU 5
                    "24112209220002", // FCU 6
                    "24060410030002", // FCU 7
                    "24112209220006", // FCU 8
                    "24060404690002", // FCU 9
                    "24060410030003", // FCU 10
                    "24060410030004", // FCU 11
                    "24112209220003", // FCU 12
                    "24112209220005"  // FCU 13
                ];
            } else if (this.selectedType === 'Lighting') {
                meterSNs = ["24112209220004"]; // Only Overall Lighting
            } else {
                // If 'all' is selected, include all meters
                meterSNs = [
                    "24061901790001", // FCU 4
                    "24060404690001", // FCU 5
                    "24112209220002", // FCU 6
                    "24060410030002", // FCU 7
                    "24112209220006", // FCU 8
                    "24060404690002", // FCU 9
                    "24060410030003", // FCU 10
                    "24060410030004", // FCU 11
                    "24112209220003", // FCU 12
                    "24112209220005", // FCU 13
                    "24112209220004"  // Overall Lighting
                ];
            }

            // If a specific meter is selected, only use that one
            if (this.selectedMeterSN !== 'all') {
                meterSNs = [this.selectedMeterSN];
            }

            // Mapping of meterSN to their corresponding names
            const meterSNToName = {
                "24061901790001": "FCU 4",
                "24060404690001": "FCU 5",
                "24112209220002": "FCU 6",
                "24060410030002": "FCU 7",
                "24112209220006": "FCU 8",
                "24060404690002": "FCU 9",
                "24060410030003": "FCU 10",
                "24060410030004": "FCU 11",
                "24112209220003": "FCU 12",
                "24112209220005": "FCU 13",
                "24112209220004": "Overall Lighting"
            };

            // Handle default startDate and endDate if not provided
            const now = new Date();
            const defaultStartDate = this.startDate ? new Date(this.startDate) : new Date(now.setDate(now.getDate() - 3)); // Default to 3 days ago
            const defaultEndDate = this.endDate ? new Date(this.endDate) : new Date(); // Default to today

            // Ensure the end date includes the entire day
            defaultEndDate.setHours(23, 59, 59, 999);

            console.log("Default Start Date:", defaultStartDate);
            console.log("Default End Date:", defaultEndDate);

            axios.get("https://geibms.com/message_history")
                .then((response) => {
                    const rawData = response.data.message_history;
                    const aggregatedDataBySensor = {};

                    meterSNs.forEach((meterSN) => {
                        const sensorData = rawData
                            .filter((entry) => {
                                const entryTime = this.parseCustomDatetime(entry.datatime);

                                // Filter by meterSN and ensure the entry is within the specified date range
                                return (
                                    entry.meterSN === meterSN &&
                                    entryTime >= defaultStartDate &&
                                    entryTime <= defaultEndDate
                                );
                            })
                            .map((entry) => {
                                const entryTime = this.parseCustomDatetime(entry.datatime);

                                // Align times based on selected time range
                                if (this.selectedTimeRange === "Hourly") {
                                    entryTime.setMinutes(0, 0, 0);
                                } else if (this.selectedTimeRange === "Daily") {
                                    entryTime.setHours(0, 0, 0, 0);
                                }

                                return {
                                    time: entryTime.toISOString(),
                                    value: entry.EPI,
                                };
                            })
                            .sort((a, b) => new Date(a.time) - new Date(b.time));

                        const aggregatedData = {};
                        sensorData.forEach((entry, index, array) => {
                            if (index === 0) return;

                            const previous = array[index - 1];
                            let difference = entry.value - previous.value;

                            if (difference < -50 || difference > 50) {
                                difference = 0;
                            }

                            if (meterSN === "24112209220004") {
                                difference = (difference / 10) * 48;
                            }

                            const timeKey = entry.time;
                            if (!aggregatedData[timeKey]) {
                                aggregatedData[timeKey] = 0;
                            }
                            aggregatedData[timeKey] += Math.abs(difference);
                        });

                        aggregatedDataBySensor[meterSN] = aggregatedData;
                    });

                    const chartData = [];
                    const uniqueLabels = new Set();

                    Object.entries(aggregatedDataBySensor).forEach(([sensor, aggregatedData]) => {
                        const dataPoints = Object.entries(aggregatedData).map(([time, value]) => {
                            uniqueLabels.add(time);
                            return { time, value };
                        });

                        const name = meterSNToName[sensor] || sensor; // Replace meterSN with name
                        chartData.push({
                            label: name,
                            data: dataPoints.map((point) => point.value),
                        });
                    });

                    const sortedLabels = Array.from(uniqueLabels)
                        .sort((a, b) => new Date(a) - new Date(b))
                        .map((label) => {
                            const date = new Date(label);
                            if (this.selectedTimeRange === "Hourly") {
                                return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            } else if (this.selectedTimeRange === "Daily") {
                                return date.toLocaleDateString();
                            }
                            return label;
                        });

                    this.comparisonChartLabels = sortedLabels;
                    this.comparisonChartData = chartData;

                    console.log("Comparison Chart Data with Names:", this.comparisonChartData);
                    console.log("Comparison Chart Labels:", this.comparisonChartLabels);

                    this.renderComparisonChart();
                })
                .catch((error) => console.error("Error fetching comparison data:", error));
        },

        renderComparisonChart() {
            if (!this.comparisonChartData || this.comparisonChartData.length === 0) {
                console.error("Comparison Chart Data is empty.");
                return;
            }

            // Mapping of meterSN to human-readable names
            const meterSNToName = {
                "24061901790001": "FCU 4",
                "24060404690001": "FCU 5",
                "24112209220002": "FCU 6",
                "24060410030002": "FCU 7",
                "24112209220006": "FCU 8",
                "24060404690002": "FCU 9",
                "24060410030003": "FCU 10",
                "24060410030004": "FCU 11",
                "24112209220003": "FCU 12",
                "24112209220005": "FCU 13",
                "24112209220004": "Overall Lighting"
            };

            // Transform dataset labels from meterSN to names
            const datasets = this.comparisonChartData.map((dataset) => ({
                label: meterSNToName[dataset.label] || dataset.label, // Replace meterSN with name if available
                data: this.comparisonChartLabels.map((label, index) => dataset.data[index] || 0), // Fill missing values with 0
                borderColor: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
                backgroundColor: "rgba(0, 0, 0, 0)", // Transparent
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
            }));

            this.chartLabels = this.comparisonChartLabels;
            this.chartData = datasets;

            // Render chart
            this.$refs.chartComponent.renderChart(this.chartLabels, this.chartData);
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
            //this.fetchComparisonData();
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

            // If no valid cache, proceed with fetching and processing data
            const labels = [];
            const data = [];
            let meterSNs = [];
            if (this.selectedType === 'FCU') {
                meterSNs = [
                    "24061901790001", // FCU 4
                    "24060404690001", // FCU 5
                    "24112209220002", // FCU 6
                    "24060410030002", // FCU 7
                    "24112209220006", // FCU 8
                    "24060404690002", // FCU 9
                    "24060410030003", // FCU 10
                    "24060410030004", // FCU 11
                    "24112209220003", // FCU 12
                    "24112209220005"  // FCU 13
                ];
            } else if (this.selectedType === 'Lighting') {
                meterSNs = ["24112209220004"]; // Only Overall Lighting
            } else {
                meterSNs = [
                    "24061901790001", // FCU 4
                    "24060404690001", // FCU 5
                    "24112209220002", // FCU 6
                    "24060410030002", // FCU 7
                    "24112209220006", // FCU 8
                    "24060404690002", // FCU 9
                    "24060410030003", // FCU 10
                    "24060410030004", // FCU 11
                    "24112209220003", // FCU 12
                    "24112209220005", // FCU 13
                    "24112209220004"  // Overall Lighting
                ];
            }

            if (this.selectedMeterSN !== 'all') {
                meterSNs = [this.selectedMeterSN];
            }

            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let defaultStartDate;
            let defaultEndDate = new Date(now);

            if (!startDate || !endDate) {
                if (this.selectedTimeRange === "5-min" || this.selectedTimeRange === "Hourly") {
                    defaultStartDate = new Date(yesterday);
                } else if (this.selectedTimeRange === "Daily") {
                    defaultStartDate = new Date(now);
                    defaultStartDate.setDate(now.getDate() - 4);
                } else if (this.selectedTimeRange === "Monthly") {
                    defaultStartDate = firstDayOfMonth;
                }
            }

            const startDateObj = startDate ? new Date(startDate) : defaultStartDate;
            const endDateObj = endDate ? new Date(endDate) : defaultEndDate;

            if (endDate) {
                endDateObj.setHours(23, 59, 59, 999);
            }

            const fetchExcelData = async () => {
                try {
                    const response = await fetch('/BCAPowerMeter3.xlsx');
                    const arrayBuffer = await response.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'binary' });

                    // Debugging: Check sheet names and content
                    console.log('Workbook:', workbook);

                    const sheetName = workbook.SheetNames[0]; // Get the first sheet
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    console.log('Parsed Excel Data:', jsonData);

                    // Transform the data based on your column order
                    const excelData = jsonData.slice(1).map((row) => ({
                        datatime: row[0], // Datetime column
                        meterSN: row[2],  // MeterSN column
                        EPI: row[3],     // EPI column
                    }));

                    console.log('Transformed Excel Data:', excelData);

                    return excelData;
                } catch (error) {
                    console.error('Error loading Excel data:', error);
                    return [];
                }
            };


            try {
                const apiDataPromise = axios.get("https://geibms.com/message_history");
                const excelDataPromise = fetchExcelData();

                const [apiResponse, excelData] = await Promise.all([apiDataPromise, excelDataPromise]);
                const apiData = apiResponse.data.message_history;

                const combinedData = [...excelData, ...apiData];

                const filteredData = combinedData.filter((entry) => {
                    const entryDate = new Date(
                        `${entry.datatime.slice(0, 4)}-${entry.datatime.slice(4, 6)}-${entry.datatime.slice(6, 8)}T${entry.datatime.slice(8, 10)}:${entry.datatime.slice(10, 12)}`
                    );

                    return (
                        entryDate >= startDateObj &&
                        entryDate <= endDateObj &&
                        (this.selectedMeterSN === "all" || entry.meterSN === this.selectedMeterSN)
                    );
                });

                if (filteredData.length === 0) {
                    console.warn("No data available for the selected meterSN or date range.");
                    this.chartLabels = [];
                    this.chartData = [];
                    this.updateChart();
                    return;
                }

                const differencesBySensor = {};
                const aggregatedData = {};

                meterSNs.forEach((meterSN) => {
                    const sensorData = filteredData
                        .filter((entry) => entry.meterSN === meterSN)
                        .sort((a, b) => new Date(b.datatime) - new Date(a.datatime))
                        .map((entry) => {
                            const time = new Date(
                                `${entry.datatime.slice(0, 4)}-${entry.datatime.slice(4, 6)}-${entry.datatime.slice(6, 8)}T${entry.datatime.slice(8, 10)}:${entry.datatime.slice(10, 12)}`
                            );

                            const alignedTime = `${time.getFullYear()}-${(time.getMonth() + 1)
                                .toString()
                                .padStart(2, "0")}-${time
                                    .getDate()
                                    .toString()
                                    .padStart(2, "0")} ${time
                                        .getHours()
                                        .toString()
                                        .padStart(2, "0")}:${Math.floor(time.getMinutes() / 5) * 5
                                            .toString()
                                            .padStart(2, "0")}`;

                            return { ...entry, alignedTime, value: entry.EPI };
                        });

                    differencesBySensor[meterSN] = sensorData.map((entry, index) => {
                        let difference = 0;

                        if (index === sensorData.length - 1) {
                            const previous = sensorData[index - 1];
                            if (previous) {
                                difference = previous.value - entry.value;
                            }
                        } else {
                            const next = sensorData[index + 1];
                            difference = entry.value - next.value;
                        }

                        if (difference < -50 || difference > 50) {
                            difference = 0;
                        }

                        if (meterSN === "24112209220004") {
                            difference = (difference / 10) * 48;
                        }

                        return { time: entry.alignedTime, value: Math.abs(difference) };
                    });
                });

                Object.keys(differencesBySensor).forEach((sensor) => {
                    differencesBySensor[sensor].forEach((entry) => {
                        const key = entry.time;
                        if (!aggregatedData[key]) {
                            aggregatedData[key] = 0;
                        }
                        aggregatedData[key] += entry.value;
                    });
                });

                if (this.selectedTimeRange === "Monthly") {
                    const monthlyData = {};
                    const sortedKeys = Object.keys(aggregatedData).sort(
                        (a, b) => new Date(a) - new Date(b)
                    );

                    sortedKeys.forEach((key) => {
                        const time = new Date(key.replace(" ", "T"));
                        if (time >= firstDayOfMonth && time <= now) {
                            const monthlyKey = `${time.getFullYear()}-${(time.getMonth() + 1)
                                .toString()
                                .padStart(2, "0")}`;

                            if (!monthlyData[monthlyKey]) {
                                monthlyData[monthlyKey] = 0;
                            }
                            monthlyData[monthlyKey] += aggregatedData[key];
                        }
                    });

                    Object.keys(monthlyData).forEach((key) => {
                        labels.push(key);
                        data.push(monthlyData[key]);
                    });
                }

                if (this.selectedTimeRange === "Daily") {
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
                    Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b)).forEach((key) => {
                        labels.push(key);
                        data.push(dailyData[key]);
                    });
                }

                else if (this.selectedTimeRange === "Hourly") {
                    const hourlyData = {};
                    Object.keys(aggregatedData).forEach((key) => {
                        const time = new Date(key);
                        const hourKey = `${time.getFullYear()}-${(time.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}-${time
                                .getDate()
                                .toString()
                                .padStart(2, "0")} ${time
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}:00`;
                        if (!hourlyData[hourKey]) {
                            hourlyData[hourKey] = 0;
                        }
                        hourlyData[hourKey] += aggregatedData[key];
                    });
                    Object.keys(hourlyData).sort((a, b) => new Date(a) - new Date(b)).forEach((key) => {
                        labels.push(key);
                        data.push(hourlyData[key]);
                    });
                }

                else if (this.selectedTimeRange === "5-min") {
                    const fiveMinKeys = Object.keys(aggregatedData).sort(
                        (a, b) => new Date(a) - new Date(b)
                    );
                    fiveMinKeys.forEach((key) => {
                        labels.push(key);
                        data.push(aggregatedData[key]);
                    });
                }

                this.chartLabels = labels;
                this.chartData = data;

                // Cache the data and expiration timestamp
                localStorage.setItem(cacheKey, JSON.stringify({ labels, data }));
                localStorage.setItem(cacheExpirationKey, new Date().getTime() + 60 * 60 * 1000); // Cache expires in 1 hour

                this.updateChart();
            } catch (error) {
                console.error("Error processing chart data:", error);
            }
        },
        updateChart() {
            // Explicitly update the chart component
            this.$refs.chartComponent.renderChart();
        },
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