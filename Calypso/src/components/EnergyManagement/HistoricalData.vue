<template>
    <div class="daily-chart-container">
      <h2>Power Meter Readings</h2>
  
      <!-- Filters Section (Static) -->
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
            <button
              v-for="range in timeRanges"
              :key="range"
              :class="{ active: selectedTimeRange === range }"
              @click="selectedTimeRange = range"
            >
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
        <div v-if="!isComparisonMode" class="chart-container">
          <PowerLineChart
            :data="chartData"
            :labels="chartLabels"
            :type="chartType"
          />
          <div class="chart-toggle">
            <button :class="{ active: chartType === 'line' }" @click="chartType = 'line'">Line</button>
            <button :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'">Bar</button>
          </div>
        </div>
        <div v-if="isComparisonMode" class="chart-container">
          <h3>Comparison Chart</h3>
          <PowerLineChart2
            :data="comparisonChartData"
            :labels="comparisonChartLabels"
            type="line"
          />
          <div class="chart-toggle">
            <button :class="{ active: chartType === 'line' }" @click="chartType = 'line'">Line</button>
            <button :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'">Bar</button>
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
          <label><input type="checkbox" v-model="showBaselineLine" /> Show Baseline</label>
          <label><input type="checkbox" v-model="showHistoricalLine" /> Show Historical</label>
          <button @click="applySettings">Apply</button>
          <button @click="toggleModal">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import PowerLineChart from '@/components/charts/PowerLineChart.vue';
  import PowerLineChart2 from '@/components/charts/PowerLineChart2.vue';
  
  export default {
    components: { PowerLineChart, PowerLineChart2 },
    data() {
      return {
        // Static filter state
        isComparisonMode: false,
        showSettingsModal: false,
        selectedGateway: 'all',
        selectedType: 'all',
        selectedMeterSN: 'all',
        startDate: '2025-04-12',
        endDate: '2025-04-18',
        timeRanges: ['Hourly', 'Daily', 'Monthly'],
        selectedTimeRange: 'Daily',
  
        // Static chart configuration
        chartType: 'line',
        chartLabels: [],
        chartData: [],
        comparisonChartLabels: [],
        comparisonChartData: [],
  
        // Settings
        baselinePower: 100,
        showBaselineLine: true,
        showHistoricalLine: true,
      };
    },
    created() {
      this.loadStaticData();
    },
    methods: {
      loadStaticData() {
        // Hardcoded data sets
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
  
        if (this.selectedTimeRange === 'Hourly') {
          this.chartLabels = hourly.map(d => d.label);
          this.chartData = hourly.map(d => d.value);
        } else if (this.selectedTimeRange === 'Daily') {
          this.chartLabels = daily.map(d => d.label);
          this.chartData = daily.map(d => d.value);
        } else {
          this.chartLabels = monthly.map(d => d.label);
          this.chartData = monthly.map(d => d.value);
        }
  
        // For comparison, just duplicate
        this.comparisonChartLabels = this.chartLabels;
        this.comparisonChartData = [
          { label: 'Dataset A', data: this.chartData },
          { label: 'Dataset B', data: this.chartData.map(v => v * 0.9) },
        ];
      },
      toggleComparisonMode() {
        this.isComparisonMode = !this.isComparisonMode;
      },
      toggleModal() {
        this.showSettingsModal = !this.showSettingsModal;
      },
      applySettings() {
        // Re-apply baseline/historical toggles
        this.showSettingsModal = false;
      }
    },
    watch: {
      selectedTimeRange() {
        this.loadStaticData();
      }
    }
  };
  </script>
  
  <style scoped>
  .daily-chart-container { padding: 20px; background: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);     padding-top: 5%;}
  .filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
  .filters-left, .filters-right { display: flex; gap: 10px; }
  .toggle-buttons button { padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; }
  .toggle-buttons button.active { background: #007bff; color: #fff; }
  .comparison-button { background: #28a745; color: #fff; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; }
  .settings-button { background: #007bff; color: #fff; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; }
  .chart-section { background: #fff; border-radius: 10px; padding: 20px; position: relative; height: 400px; }
  .chart-toggle { position: absolute; top: 10px; right: 10px; display: flex; gap: 5px; }
  .chart-toggle button { padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; }
  .chart-toggle button.active { background: #007bff; color: #fff; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
  .modal { background: #fff; padding: 20px; border-radius: 10px; width: 280px; }
  </style>
  