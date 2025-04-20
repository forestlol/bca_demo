<template>
    <div class="daily-chart-container">
        <h2>Water Meter Usage (m³)</h2>

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
                    <option value="FCU">Water Meter</option>
                </select>

                <select v-model="selectedMeterSN" @change="fetchData">
                    <option value="all">All Meters</option>
                    <option v-for="sheet in sheetNames" :key="sheet" :value="sheet">
                        {{ sheet }}
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
                    :baseline-data="baselineData" :show-baseline="showBaselineLine" :type="chartType" />
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
import PowerLineChart from '@/components/charts/WaterLineChart.vue';
import PowerLineChart2 from '@/components/charts/PowerLineChart2.vue';

export default {
  components: { PowerLineChart, PowerLineChart2 },
  data() {
    return {
      // Filters (unused with hardcoded values)
      gateways: [{ label: 'GE Canteen', value: '24052003410033' }],
      selectedGateway: 'all',
      selectedType: 'all',
      meters: ['Meter 1', 'Meter 2', 'Meter 3'],
      selectedMeterSN: 'all',
      startDate: null,
      endDate: null,

      // Chart modes
      isComparisonMode: false,
      chartType: 'line',
      comparisonType: 'line',

      // Data
      timeRanges: ['Daily', 'Monthly'],
      selectedTimeRange: 'Daily',
      chartLabels: [],
      chartData: [],
      comparisonChartData: [],

      // Baseline
      showBaselineLine: false,
      baselinePower: null,
      baselineData: [],

      // Settings modal
      showSettingsModal: false,
    };
  },
  methods: {
    toggleComparisonMode() {
      this.isComparisonMode = !this.isComparisonMode;
      if (this.isComparisonMode) this.updateComparison();
      else this.updateChart();
    },
    toggleModal() {
      this.showSettingsModal = !this.showSettingsModal;
    },
    applySettings() {
      this.showBaselineLine = !!this.baselinePower;
      this.baselineData = this.showBaselineLine
        ? this.chartLabels.map(() => this.baselinePower)
        : [];
      this.toggleModal();
    },
    updateChart() {
      if (this.selectedTimeRange === 'Daily') {
        this.chartLabels = [
          '2025-04-11',
          '2025-04-12',
          '2025-04-13',
          '2025-04-14',
          '2025-04-15',
          '2025-04-16',
          '2025-04-17',
        ];
        this.chartData = [10, 12, 11, 14, 13, 15, 16];
      } else {
        this.chartLabels = ['2025-02', '2025-03', '2025-04'];
        this.chartData = [300, 320, 310];
      }
      this.baselineData = this.showBaselineLine
        ? this.chartLabels.map(() => this.baselinePower)
        : [];
      this.$refs.chartComponent.renderChart(this.chartLabels, this.chartData);
    },
    updateComparison() {
      // hardcoded comparison datasets
      this.comparisonChartData = [
        { label: 'Meter 1', data: [8, 9, 7] },
        { label: 'Meter 2', data: [11, 10, 13] },
      ];
      this.$refs.comparisonChart.renderChart(this.chartLabels, this.comparisonChartData);
    },
  },
  mounted() {
    this.updateChart();
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