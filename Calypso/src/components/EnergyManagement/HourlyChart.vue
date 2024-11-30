<template>
    <div class="daily-chart-container">
        <h2>Power Meter Readings</h2>

        <!-- Filters Section -->
        <div class="filters">
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

            <input type="date" v-model="startDate" @change="fetchData" />
            <input type="date" v-model="endDate" @change="fetchData" />


            <div class="toggle-buttons">
                <button v-for="range in timeRanges" :key="range" :class="{ active: selectedTimeRange === range }"
                    @click="selectedTimeRange = range; fetchData()">
                    {{ range }}
                </button>
            </div>
        </div>

        <!-- Chart Section -->
        <div class="chart-section">
            <PowerLineChart ref="chartComponent" :data="chartData" :labels="chartLabels" />
        </div>
    </div>
</template>

<script>
import * as XLSX from "xlsx";
import axios from "axios";
import PowerLineChart from "@/components/charts/PowerLineChart.vue";

export default {
    components: { PowerLineChart },
    data() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        return {
            gateways: [],
            types: [],
            devices: [],
            selectedGateway: "all",
            selectedType: "all",
            selectedDevice: "all",
            startDate: yesterday.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
            chartLabels: [],
            chartData: [],
            timeRanges: ["5-min", "Hourly", "Daily", "Monthly"],
            selectedTimeRange: "Hourly", // Default to 5-minute intervals
            excelData: [], // To store the parsed Excel data
        };
    },
    methods: {
        fetchDropdownData() {
            axios
                .get("https://geibms.com/message_history")
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
            this.processChartData(this.startDate, this.endDate);
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
        processChartData(selectedStartDate, selectedEndDate) {
            const labels = [];
            const data = [];

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

                    // Convert selected dates to Date objects
                    const startDateTime = new Date(`${selectedStartDate}T00:00:00`);
                    let endDateTime = new Date(`${selectedEndDate}T23:59:59`);

                    const now = new Date(); // Current system date and time

                    // Adjust `endDateTime` if the selected end date is today
                    if (selectedEndDate === now.toISOString().slice(0, 10)) {
                        endDateTime = new Date(now); // Set endDateTime to now
                    }

                    console.log("Start DateTime:", startDateTime);
                    console.log("End DateTime:", endDateTime);
                    console.log("Current Time (Now):", now);

                    const parsedData = [];
                    const hourlyData = {}; // To store aggregated hourly data
                    const dailyData = {}; // To store aggregated daily data
                    const monthlyData = {}; // To store aggregated monthly data

                    timeColumn.forEach((row) => {
                        const timeValue = row[0]; // Time column (Excel time fraction)
                        const excelTimeToJS = (timeFraction) => {
                            const totalSeconds = Math.round(timeFraction * 24 * 60 * 60);
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            return `${hours.toString().padStart(2, "0")}:${minutes
                                .toString()
                                .padStart(2, "0")}`;
                        };

                        const time = excelTimeToJS(timeValue); // Convert Excel time fraction to hh:mm

                        headers.slice(1).forEach((header, index) => {
                            let date;
                            if (typeof header === "number") {
                                const parsedDate = XLSX.SSF.parse_date_code(header);
                                date = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
                            } else {
                                date = new Date(header);
                            }

                            const currentDateTime = new Date(`${date.toISOString().slice(0, 10)}T${time}`);

                            if (
                                currentDateTime >= startDateTime &&
                                currentDateTime <= now
                            ) {
                                const timestamp = `${date.toISOString().slice(0, 10)} ${time}`;
                                const value = parseFloat(row[index + 1] || 0);

                                if (this.selectedTimeRange === "5-min") {
                                    parsedData.push({ timestamp, value });

                                    // Log timestamps being added for today
                                    if (selectedEndDate === now.toISOString().slice(0, 10)) {
                                        console.log(`Adding for today: ${currentDateTime.toISOString()}, Value: ${value}`);
                                    }
                                } else if (this.selectedTimeRange === "Hourly") {
                                    const hourKey = `${date.toISOString().slice(0, 10)} ${time.split(":")[0]}:00`;

                                    if (!hourlyData[hourKey]) {
                                        hourlyData[hourKey] = { total: 0, count: 0 };
                                    }
                                    hourlyData[hourKey].total += value;
                                    hourlyData[hourKey].count += 1;
                                } else if (this.selectedTimeRange === "Daily") {
                                    const dayKey = date.toISOString().slice(0, 10);

                                    if (!dailyData[dayKey]) {
                                        dailyData[dayKey] = 0;
                                    }
                                    dailyData[dayKey] += value;
                                } else if (this.selectedTimeRange === "Monthly") {
                                    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

                                    if (!monthlyData[monthKey]) {
                                        monthlyData[monthKey] = 0;
                                    }
                                    monthlyData[monthKey] += value;
                                }
                            }
                        });
                    });

                    if (this.selectedTimeRange === "5-min") {
                        // Sort the parsed data by timestamp
                        parsedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                        parsedData.forEach((entry) => {
                            labels.push(entry.timestamp);
                            data.push(entry.value);
                        });
                    } else if (this.selectedTimeRange === "Hourly") {
                        // Process hourly data
                        const sortedHourlyKeys = Object.keys(hourlyData).sort(
                            (a, b) => new Date(a) - new Date(b)
                        );

                        sortedHourlyKeys.forEach((key) => {
                            labels.push(key);
                            data.push(
                                parseFloat((hourlyData[key].total / hourlyData[key].count).toFixed(2))
                            );
                        });
                    } else if (this.selectedTimeRange === "Daily") {
                        // Process daily data
                        const sortedDailyKeys = Object.keys(dailyData).sort(
                            (a, b) => new Date(a) - new Date(b)
                        );

                        sortedDailyKeys.forEach((key) => {
                            labels.push(key);
                            data.push(dailyData[key]); // Total sum for the day
                        });
                    } else if (this.selectedTimeRange === "Monthly") {
                        // Process monthly data
                        const sortedMonthlyKeys = Object.keys(monthlyData).sort(
                            (a, b) => new Date(a) - new Date(b)
                        );

                        sortedMonthlyKeys.forEach((key) => {
                            labels.push(key);
                            data.push(monthlyData[key]); // Total sum for the month
                        });
                    }

                    this.chartLabels = labels;
                    this.chartData = data;

                    this.updateChart(); // Refresh the chart
                })
                .catch((error) => {
                    console.error("Error reading Excel file:", error);
                });
        },
        updateChart() {
            // Explicitly update the chart component after data changes
            this.$refs.chartComponent.renderChart(); // Ensure you have a ref set on your chart component
        },
    },
    mounted() {
        this.fetchDropdownData();
        this.fetchData();
        this.processChartData(this.startDate, this.endDate);
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
</style>