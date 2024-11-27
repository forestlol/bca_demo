<template>
    <div class="daily-chart-container">
        <h2>Power Meter Readings</h2>

        <!-- Filters Section -->
        <div class="filters">
            <div class="filters-left">
                <select v-model="selectedGateway" @change="fetchData">
                    <option value="all">All Gateways</option>
                    <option v-for="gateway in gateways" :key="gateway" :value="gateway">
                        {{ gateway }}
                    </option>
                </select>

                <select v-model="selectedType" @change="fetchData">
                    <option value="all">All Types</option>
                    <option v-for="type in types" :key="type" :value="type">
                        {{ type }}
                    </option>
                </select>

                <select v-model="selectedDevice" @change="fetchData">
                    <option value="all">All Devices</option>
                    <option v-for="device in devices" :key="device" :value="device">
                        {{ device }}
                    </option>
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
                <button class="settings-button" @click="toggleModal">
                    Settings <span class="settings-icon">&#9881;</span>
                </button>

            </div>
        </div>

        <!-- Chart Section -->
        <div class="chart-section">
            <PowerLineChart ref="chartComponent" :data="chartData" :labels="chartLabels" :baselineData="baselineData" />

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

export default {
    components: { PowerLineChart },
    data() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        return {
            showSettingsModal: false,
            gateways: [],
            types: [],
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
            this.computeBaselineData(); // Recompute the baseline for the new time range
        },
    },
    methods: {
        toggleModal() {
            this.showSettingsModal = !this.showSettingsModal;
        },
        fetchDropdownData() {
            axios
                .get("http://157.230.240.216:5000/message_history")
                .then((response) => {
                    const data = response.data.message_history;
                    this.populateDropdowns(data);
                })
                .catch((error) => console.error("Error fetching dropdown data:", error));
        },
        // fetchData() {
        //     const params = {
        //         gateway: this.selectedGateway,
        //         type: this.selectedType,
        //         device: this.selectedDevice,
        //         startDate: this.startDate,
        //         endDate: this.endDate,
        //         timeRange: this.selectedTimeRange,
        //     };

        //     axios
        //         .get("http://157.230.240.216:5000/message_history", { params })
        //         .then((response) => {
        //             this.processChartData(response.data.message_history);
        //         })
        //         .catch((error) => console.error("Error fetching data:", error));
        // },

        fetchData() {
            // If startDate or endDate is null, set defaults
            this.processChartData();
            this.computeBaselineData(); // Recompute baseline after data is fetched
        },
        populateDropdowns(data) {
            this.gateways = [...new Set(data.map((entry) => entry.gwSN))];

            // Modify types: replace "data" with "Individual Devices"
            this.types = [...new Set(data.map((entry) => entry.type === "data" ? "Individual Devices" : entry.type))];

            this.devices = [...new Set(data.map((entry) => entry.device))];

            // Ensure "VRF AIRCON" is included in the types
            if (!this.types.includes("VRF AIRCON")) {
                this.types.push("VRF AIRCON");
            }
        },

        // processChartData(data) {
        //     const is5Min = this.selectedTimeRange === "5-min";
        //     const isHourly = this.selectedTimeRange === "Hourly";
        //     const isDaily = this.selectedTimeRange === "Daily";
        //     const isMonthly = this.selectedTimeRange === "Monthly";

        //     // Filter data based on the selected date range
        //     const filteredData = data.filter((entry) => {
        //         const entryDate = new Date(
        //             `${entry.datatime.slice(0, 4)}-${entry.datatime.slice(4, 6)}-${entry.datatime.slice(6, 8)} ${entry.datatime.slice(8, 10)}:${entry.datatime.slice(10, 12)}`
        //         );
        //         const startDateObj = new Date(this.startDate);
        //         const endDateObj = new Date(this.endDate);

        //         return entryDate >= startDateObj && entryDate <= endDateObj;
        //     });

        //     const aggregatedData = filteredData.reduce((acc, entry) => {
        //         const dateTimeStr = entry.datatime;

        //         // Extract components from the custom `datatime` format
        //         const year = dateTimeStr.slice(0, 4);
        //         const month = dateTimeStr.slice(4, 6);
        //         const day = dateTimeStr.slice(6, 8);
        //         const hour = dateTimeStr.slice(8, 10);
        //         const minute = dateTimeStr.slice(10, 12);

        //         // Format the key based on the selected time range
        //         const key = is5Min
        //             ? `${year}-${month}-${day} ${hour}:${Math.floor(minute / 5) * 5}` // 5-minute interval format
        //             : isHourly
        //                 ? `${year}-${month}-${day} ${hour}:00` // Hourly format
        //                 : isDaily
        //                     ? `${year}-${month}-${day}` // Daily format
        //                     : isMonthly
        //                         ? `${year}-${month}` // Monthly format
        //                         : `${year}-${month}-${day}`; // Default to daily

        //         if (!acc[key]) {
        //             acc[key] = { key, totalPower: 0 };
        //         }

        //         // Sum up the power values
        //         acc[key].totalPower += entry.EPE || 0;
        //         return acc;
        //     }, {});

        //     // Calculate differences
        //     const sortedKeys = Object.keys(aggregatedData).sort((a, b) => new Date(a) - new Date(b));
        //     const differences = sortedKeys.map((key, index) => {
        //         if (index === 0) return { key, powerChange: 0 }; // No previous value for the first interval
        //         const currentPower = aggregatedData[key].totalPower;
        //         const previousPower = aggregatedData[sortedKeys[index - 1]].totalPower;
        //         return { key, powerChange: currentPower - previousPower };
        //     });

        //     // Populate chart labels and data
        //     this.chartLabels = differences.map((entry) => entry.key);
        //     this.chartData = differences.map((entry) => entry.powerChange);

        //     console.log(`${this.selectedTimeRange} Differences:`, differences);
        // },
        onDateChange() {
            // Call processChartData when the date range changes
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
        processChartData(startDate = this.startDate, endDate = this.endDate) {
            const labels = [];
            const data = [];
            // const meterSNs = ["24060410030004", "24061901790001", "24060410030003", "24060404690001", "24060410030002", "24060404690002"];
            const meterSNs = ["24060410030004", "24061901790001", "24060410030003"];
            // Set default start and end dates if not provided
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1); // Last 24 hours
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month

            let defaultStartDate;
            let defaultEndDate = new Date(now); // Default endDate is 'now'

            console.log("Selected start date: " + startDate);
            console.log("Selected end date: " + endDate);
            if (!startDate || !endDate) {
                if (this.selectedTimeRange === "5-min" || this.selectedTimeRange === "Hourly") {
                    defaultStartDate = new Date(yesterday); // Last 24 hours
                } else if (this.selectedTimeRange === "Daily") {
                    defaultStartDate = new Date(now);
                    defaultStartDate.setDate(now.getDate() - 4); // Last 4 days
                } else if (this.selectedTimeRange === "Monthly") {
                    defaultStartDate = firstDayOfMonth; // Start of the current month
                }
            }

            const startDateObj = startDate ? new Date(startDate) : defaultStartDate;
            const endDateObj = endDate ? new Date(endDate) : defaultEndDate;

            // Adjust endDateObj to include the end of the selected day
            if (endDate) {
                endDateObj.setHours(23, 59, 59, 999);
            }

            axios
                .get("http://157.230.240.216:5000/message_history")
                .then((response) => {
                    const rawData = response.data.message_history;

                    // Filter data for the selected date range
                    const filteredData = rawData.filter((entry) => {
                        const entryDate = new Date(
                            `${entry.datatime.slice(0, 4)}-${entry.datatime.slice(4, 6)}-${entry.datatime.slice(6, 8)}T${entry.datatime.slice(8, 10)}:${entry.datatime.slice(10, 12)}`
                        );
                        return entryDate >= startDateObj && entryDate <= endDateObj;
                    });

                    const differencesBySensor = {};
                    const aggregatedData = {};

                    // Group data by meterSN and calculate differences
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
                                            .padStart(2, "0")}:${Math.floor(time.getMinutes() / 5) * 5
                                                .toString()
                                                .padStart(2, "0")}`;
                                return { ...entry, alignedTime };
                            });

                        differencesBySensor[meterSN] = sensorData.map((entry, index) => {
                            if (index === sensorData.length - 1) {
                                // Compare the last data point with the previous one
                                const previous = sensorData[index - 1];
                                if (previous) {
                                    const difference = previous.EPI - entry.EPI;
                                    return { time: entry.alignedTime, value: Math.abs(difference) };
                                }
                                return { time: entry.alignedTime, value: 0 };
                            }
                            // Compare current entry with the next one
                            const next = sensorData[index + 1];
                            const difference = entry.EPI - next.EPI;

                            // Filter out differences beyond the threshold (-50 to 50)
                            if (difference >= -50 && difference <= 50) {
                                return { time: entry.alignedTime, value: Math.abs(difference) };
                            }
                            return { time: entry.alignedTime, value: 0 };
                        });
                    });

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

                    console.log("Aggregated Data:", aggregatedData);

                    // Logic for Monthly
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

                        console.log("Monthly Data:", monthlyData);

                        // Since you have only one month's data, simply push the result
                        Object.keys(monthlyData).forEach((key) => {
                            labels.push(key);
                            data.push(monthlyData[key]);
                        });
                    }

                    // Existing logic for Daily
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

                    // Logic for Hourly
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
                        console.log(data)
                    }

                    // Logic for 5-Minute
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

                    // Refresh the chart
                    this.updateChart();
                })
                .catch((error) => {
                    console.error("Error fetching data from API:", error);
                });
        },
        updateChart() {
            // Explicitly update the chart component
            this.$refs.chartComponent.renderChart();
        },
    },
    mounted() {
        this.fetchDropdownData();
        this.fetchData();
        this.processChartData(this.startDate, this.endDate);
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
    padding-top: 5%;
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
</style>