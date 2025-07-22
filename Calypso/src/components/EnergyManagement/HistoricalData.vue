<template>
  <div class="daily-chart-container">
    <h2>Power Meter Readings</h2>

    <div class="filters">
      <div class="filters-left">
        <select v-model="selectedGateway">
          <option value="all">All Gateways</option>
          <option value="24052003410033">GE Canteen</option>
        </select>
        <select v-model="selectedType">
          <option value="all">All Types</option>
          <option value="FCU">VRF Aircon</option>
          <option value="Lighting">Lighting</option>
        </select>
        <select v-model="selectedMeterSN">
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
        <input type="date" v-model="startDate" />
        <input type="date" v-model="endDate" />
        <div class="toggle-buttons">
          <button v-for="range in timeRanges" :key="range" :class="{ active: selectedTimeRange === range }"
            @click="switchRange(range)">
            {{ range }}
          </button>
        </div>
      </div>
      <div class="filters-right">
        <button class="comparison-button" @click="toggleComparisonMode">
          {{ isComparisonMode ? 'Normal Chart' : 'Comparison Chart' }}
        </button>
        <button class="settings-button" @click="toggleModal">
          Settings <span class="settings-icon">&#9881;</span>
        </button>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="chart-section">
      <!-- Normal Chart -->
      <div v-if="!isComparisonMode" class="chart-container">
        <PowerLineChart :key="'normal-' + chartType + '-' + selectedTimeRange" :labels="chartLabels" :data="chartData"
          :type="chartType" />
        <div class="chart-toggle">
          <button :class="{ active: chartType === 'line' }" @click="switchType('line')">
            Line
          </button>
          <button :class="{ active: chartType === 'bar' }" @click="switchType('bar')">
            Bar
          </button>
        </div>
      </div>

      <!-- Comparison Chart -->
      <div v-else class="chart-container">
        <h3>Comparison Chart</h3>
        <PowerLineChart2 :key="'compare-' + chartType + '-' + selectedTimeRange" :labels="comparisonChartLabels"
          :data="comparisonChartData" :type="chartType" />
        <div class="chart-toggle">
          <button :class="{ active: chartType === 'line' }" @click="switchType('line')">
            Line
          </button>
          <button :class="{ active: chartType === 'bar' }" @click="switchType('bar')">
            Bar
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettingsModal" class="modal-overlay">
      <div class="modal">
        <h3>Settings</h3>
        <label>
          Baseline Power:
          <input type="number" v-model.number="baselinePower" />
        </label>
        <label>
          <input type="checkbox" v-model="showBaselineLine" />
          Show Baseline
        </label>
        <label>
          <input type="checkbox" v-model="showHistoricalLine" />
          Show Historical
        </label>
        <button @click="applySettings">Apply</button>
        <button @click="toggleModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import PowerLineChart from '@/components/charts/PowerLineChart.vue'
import PowerLineChart2 from '@/components/charts/PowerLineChart2.vue'

export default {
  components: { PowerLineChart, PowerLineChart2 },
  data() {
    return {
      isComparisonMode: false,
      showSettingsModal: false,
      selectedGateway: 'all',
      selectedType: 'all',
      selectedMeterSN: 'all',
      startDate: '2025-04-12',
      endDate: '2025-04-18',
      timeRanges: ['Hourly', 'Daily', 'Monthly'],
      selectedTimeRange: 'Daily',
      chartType: 'line',
      chartLabels: [],
      chartData: [],
      comparisonChartLabels: [],
      comparisonChartData: [],
      baselinePower: 100,
      showBaselineLine: true,
      showHistoricalLine: true,
    };
  },
  created() {
    this.loadStaticData();
  },
  methods: {
    switchRange(range) {
      this.selectedTimeRange = range;
      this.loadStaticData();
    },
    switchType(type) {
      this.chartType = type;
      // Force Vue to re-mount chart with new :key
    },
    toggleComparisonMode() {
      this.isComparisonMode = !this.isComparisonMode;
      this.loadStaticData();
    },
    toggleModal() {
      this.showSettingsModal = !this.showSettingsModal;
    },
    applySettings() {
      this.showSettingsModal = false;
      this.loadStaticData();
    },
    loadStaticData() {
      // Demo/fake data, replace with your own logic as needed
      const hourly = [
        { label: '00:00', value: 5 },
        { label: '06:00', value: 8 },
        { label: '12:00', value: 12 },
        { label: '18:00', value: 9 },
      ];
      const daily = [
        { label: '2025-04-12', value: 100 },
        { label: '2025-04-13', value: 110 },
        { label: '2025-04-14', value: 95 },
        { label: '2025-04-15', value: 120 },
        { label: '2025-04-16', value: 115 },
        { label: '2025-04-17', value: 130 },
        { label: '2025-04-18', value: 125 },
      ];
      const monthly = [
        { label: '2025-01', value: 3200 },
        { label: '2025-02', value: 3100 },
        { label: '2025-03', value: 3300 },
        { label: '2025-04', value: 3400 },
      ];
      let set = this.selectedTimeRange === 'Hourly'
        ? hourly
        : this.selectedTimeRange === 'Daily'
          ? daily
          : monthly;

      this.chartLabels = set.map(d => d.label);
      this.chartData = set.map(d => d.value);

      // For comparison chart (two series):
      this.comparisonChartLabels = [...this.chartLabels];
      this.comparisonChartData = [
        { label: 'Dataset A', data: [...this.chartData] },
        { label: 'Dataset B', data: this.chartData.map(v => v * 0.9) }
      ];
    }
  }
};
</script>

<style scoped>
.daily-chart-container {
  padding: 24px 24px 24px 24px;
  background: #f9f9f9;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-width: 1400px;
  margin: 5% auto;
}

.filters {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 28px;
  margin-bottom: 32px;
}

.filters-left {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  align-items: center;
}

.filters-left select,
.filters-left input[type="date"] {
  padding: 11px 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 1rem;
  min-width: 170px;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-shadow: 0 2px 6px 0 #f5f5f5;
}

.filters-left select:focus,
.filters-left input[type="date"]:focus {
  border-color: #007bff;
  box-shadow: 0 2px 10px 0 #e6f0ff;
}

.toggle-buttons {
  display: flex;
  gap: 12px;
  margin-left: 18px;
}

.toggle-buttons button {
  padding: 9px 22px;
  border: none;
  border-radius: 7px;
  background: #f4f8fb;
  color: #333;
  font-weight: 500;
  transition: background 0.18s, color 0.18s;
  cursor: pointer;
  font-size: 1rem;
}

.toggle-buttons button.active {
  background: #007bff;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 3px 8px #e6e6ff;
}

.filters-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comparison-button,
.settings-button {
  padding: 9px 20px;
  border: none;
  border-radius: 7px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 2px 10px 0 #e0f7ea;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comparison-button {
  background: #27c97a;
}

.comparison-button:hover {
  background: #179d5a;
}

.settings-button {
  background: #007bff;
}

.settings-button:hover {
  background: #0056b3;
}

.settings-icon {
  font-size: 17px;
}

.chart-section {
  background: #fff;
  border-radius: 12px;
  padding: 28px 18px 20px 18px;
  position: relative;
  box-shadow: 0 3px 18px #f1f3f6;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  overflow: hidden;
}

.chart-container>canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
}

.chart-toggle {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 7px;
  z-index: 2;
}

.chart-toggle button {
  padding: 6px 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #e7eaf0;
  color: #2b2b2b;
  font-weight: 500;
  transition: background 0.18s, color 0.18s;
  font-size: 0.98rem;
}

.chart-toggle button.active {
  background: #007bff;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: #fff;
  padding: 26px 20px 18px 20px;
  border-radius: 12px;
  width: 340px;
  text-align: left;
  box-shadow: 0 4px 22px rgba(0, 0, 0, 0.13);
}

.modal label {
  display: block;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #2b2b2b;
}

.modal input[type="number"] {
  width: 100%;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1.3px solid #ccc;
  margin-top: 6px;
  font-size: 1rem;
}

.modal button {
  margin-top: 14px;
  margin-right: 9px;
  padding: 8px 17px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #007bff;
  color: #fff;
  transition: background 0.15s;
}

.modal button:last-child {
  background: #e0e0e0;
  color: #333;
}

.modal button:last-child:hover {
  background: #bababa;
}

/* Responsive */
@media (max-width: 1100px) {
  .filters {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .filters-left {
    gap: 12px;
    flex-wrap: wrap;
  }

  .filters-right {
    justify-content: flex-end;
  }
}
</style>
