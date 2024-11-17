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
            <PowerLineChart :data="chartData" :labels="chartLabels" />
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
        const oneDayAgo = new Date();
        oneDayAgo.setDate(today.getDate() - 1);

        return {
            gateways: [],
            types: [],
            devices: [],
            selectedGateway: "all",
            selectedType: "all",
            selectedDevice: "all",
            startDate: oneDayAgo.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
            timeRanges: ["5-min", "Hourly", "Daily", "Monthly"],
            selectedTimeRange: "5-min", // Default to 5-minute intervals
            chartData: [],
            chartLabels: [],
        };
    },
    methods: {
        fetchDropdownData() {
            axios
                .get("http://157.230.240.216:5000/message_history")
                .then((response) => {
                    const data = response.data.message_history;
                    this.populateDropdowns(data);
                })
                .catch((error) => console.error("Error fetching dropdown data:", error));
        },
        fetchData() {
            const params = {
                gateway: this.selectedGateway,
                type: this.selectedType,
                device: this.selectedDevice,
                startDate: this.startDate,
                endDate: this.endDate,
                timeRange: this.selectedTimeRange,
            };

            axios
                .get("http://157.230.240.216:5000/message_history", { params })
                .then((response) => {
                    this.processChartData(response.data.message_history);
                })
                .catch((error) => console.error("Error fetching data:", error));
        },
        populateDropdowns(data) {
            this.gateways = [...new Set(data.map((entry) => entry.gwSN))];
            this.types = [...new Set(data.map((entry) => entry.type))];
            this.devices = [...new Set(data.map((entry) => entry.device))];
        },
        processChartData(data) {
            const is5Min = this.selectedTimeRange === "5-min";
            const isHourly = this.selectedTimeRange === "Hourly";
            const isDaily = this.selectedTimeRange === "Daily";
            const isMonthly = this.selectedTimeRange === "Monthly";

            // Filter data based on the selected date range
            const filteredData = data.filter((entry) => {
                const entryDate = new Date(
                    `${entry.datatime.slice(0, 4)}-${entry.datatime.slice(4, 6)}-${entry.datatime.slice(6, 8)}`
                );
                const startDateObj = new Date(this.startDate);
                const endDateObj = new Date(this.endDate);

                return entryDate >= startDateObj && entryDate <= endDateObj;
            });

            const aggregatedData = filteredData.reduce((acc, entry) => {
                const dateTimeStr = entry.datatime;

                // Extract components from the custom `datatime` format
                const year = dateTimeStr.slice(0, 4);
                const month = dateTimeStr.slice(4, 6);
                const day = dateTimeStr.slice(6, 8);
                const hour = dateTimeStr.slice(8, 10);
                const minute = dateTimeStr.slice(10, 12);

                // Format the key based on the selected time range
                const key = is5Min
                    ? `${year}-${month}-${day} ${hour}:${Math.floor(minute / 5) * 5}` // 5-minute interval format
                    : isHourly
                        ? `${year}-${month}-${day} ${hour}:00` // Hourly format
                        : isDaily
                            ? `${year}-${month}-${day}` // Daily format
                            : isMonthly
                                ? `${year}-${month}` // Monthly format
                                : `${year}-${month}-${day}`; // Default to daily

                if (!acc[key]) {
                    acc[key] = { key, totalPower: 0 };
                }

                // Sum up the power values
                acc[key].totalPower += entry.EPE || 0;
                return acc;
            }, {});

            let finalData;
            if (isDaily) {
                // Ensure all dates in the past 7 days are represented
                const now = new Date();
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(now.getDate() - i);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                }).reverse(); // Reverse to ensure ascending order

                // Ensure all dates are represented
                finalData = last7Days.map((date) => {
                    return aggregatedData[date] || { key: date, totalPower: 0 };
                });
            } else if (isMonthly) {
                // Ensure all months in the selected date range are represented
                const startDateObj = new Date(this.startDate);
                const endDateObj = new Date(this.endDate);

                const monthsInRange = [];
                while (startDateObj <= endDateObj) {
                    const year = startDateObj.getFullYear();
                    const month = String(startDateObj.getMonth() + 1).padStart(2, "0");
                    monthsInRange.push(`${year}-${month}`);
                    startDateObj.setMonth(startDateObj.getMonth() + 1); // Move to the next month
                }

                finalData = monthsInRange.map((month) => {
                    return aggregatedData[month] || { key: month, totalPower: 0 };
                });
            } else {
                // For other ranges, use the aggregated data directly
                finalData = Object.values(aggregatedData);
            }

            // Populate chart labels and data
            this.chartLabels = finalData.map((entry) => entry.key);
            this.chartData = finalData.map((entry) => entry.totalPower);

            console.log("Filtered Data:", filteredData);
            console.log("Final Chart Labels:", this.chartLabels);
            console.log("Final Chart Data:", this.chartData);
        }
    },
    mounted() {
        this.fetchDropdownData();
        this.fetchData();
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