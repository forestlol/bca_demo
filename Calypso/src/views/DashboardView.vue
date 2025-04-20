<template>
    <div class="dashboard-container">
      <!-- Header Row -->
      <div class="header-row">
        <!-- Title on the Left -->
        <h2 class="dashboard-title">Home</h2>
  
        <!-- Breadcrumbs on the Right -->
        <nav class="breadcrumb">
          <span class="breadcrumb-item">Cavill</span>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-item">Menu</span>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-item active">Home</span>
        </nav>
      </div>
  
      <!-- Time Period Selection -->
      <div class="time-selector">
        <button
          v-for="option in timeOptions"
          :key="option"
          :class="['time-button', { active: selectedTime === option }]"
          @click="selectedTime = option"
        >
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
              <p>Current Month: <strong>{{ currentMonthPowerUsage }} kWh</strong></p>
              <h3>Analytics</h3>
              <p>2 Months Ago: <strong>{{ twoMonthsAgoPowerUsage }} kWh</strong></p>
              <p>Last Month: <strong>{{ lastMonthPowerUsage }} kWh</strong></p>
              <p>
                Variance:
                <strong>{{ Math.abs(monthToMonthVariance.absolute) }} kWh</strong>
                (
                <span
                  :class="{
                    'variance-green': monthToMonthVariance.percentage < 0,
                    'variance-red': monthToMonthVariance.percentage > 0
                  }"
                >
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
                <strong
                  :class="{
                    'variance-green': efficiencyVariance < 0,
                    'variance-red': efficiencyVariance > 0
                  }"
                >
                  {{ efficiencyVariance < 0 ? '' : '+' }}{{ Math.abs(efficiencyVariance).toFixed(2) }}%
                </strong>
              </p>
            </div>
          </div>
        </div>
  
        <!-- Change in Cost -->
        <div class="chart-card">
          <h3 class="chart-title">Cost Predicted</h3>
          <BarChartForCostPredicted
            :key="selectedTime + 'change'"
            :data="changeInCostData[selectedTime]"
          />
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
  import BarChart from "@/components/charts/BarChart.vue";
  import LineChart from "@/components/charts/LineChart.vue";
  import BarChartForCostPredicted from "@/components/charts/BarChartForCostPredicted.vue";
  
  export default {
    components: { BarChart, LineChart, BarChartForCostPredicted },
    data() {
      return {
        timeOptions: ["Today", "Month", "Year"],
        selectedTime: "Month",
  
        // Hardcoded metrics
        twoMonthsAgoPowerUsage: 950,
        lastMonthPowerUsage: 1100,
        currentMonthPowerUsage: 1050,
        costRate: 0.28,
        fixedOptimisedPowerUsage: 4000,
  
        // Hardcoded chart data
        changeInCostData: {
          Today: [
            { label: "Morning", usage: 10, cost: 2.8, value: 2.8 },
            { label: "Afternoon", usage: 15, cost: 4.2, value: 4.2 },
            { label: "Evening", usage: 12, cost: 3.36, value: 3.36 }
          ],
          Month: [
            { label: "2 Months Ago", usage: 950, cost: 266, value: 266 },
            { label: "Last Month", usage: 1100, cost: 308, value: 308 },
            { label: "Current Month", usage: 1050, cost: 294, value: 294 }
          ],
          Year: [
            { label: "Q1", usage: 3000, cost: 840, value: 840 },
            { label: "Q2", usage: 3200, cost: 896, value: 896 },
            { label: "Q3", usage: 3100, cost: 868, value: 868 }
          ]
        },
  
        // Changed key from 'time' to 'label' for LineChart compatibility
        usageEstimateData: {
          Today: [
            { label: "Till Now", value: 37 },
            { label: "Predicted End", value: 88 }
          ],
          Month: [
            { label: "Mar 2025", value: 1100 },
            { label: "Apr 2025", value: 1050 }
          ],
          Year: [
            { label: "2024", value: 12500 },
            { label: "2025", value: 11800 }
          ]
        },
  
        activeAppliancesData: {
          Today: [
            { label: "Device A", value: 8 },
            { label: "Device B", value: 5 },
            { label: "Device C", value: 12 }
          ],
          Month: [
            { label: "FCU 4", value: 220 },
            { label: "FCU 5", value: 180 },
            { label: "LIGHTING", value: 130 }
          ],
          Year: [
            { label: "FCU 7", value: 310 },
            { label: "FCU 8", value: 285 },
            { label: "LIGHTING", value: 520 }
          ]
        }
      };
    },
    computed: {
      monthToMonthVariance() {
        const absolute = this.lastMonthPowerUsage - this.twoMonthsAgoPowerUsage;
        const percentage = (absolute / this.twoMonthsAgoPowerUsage) * 100;
        return { absolute: parseFloat(absolute.toFixed(2)), percentage: parseFloat(percentage.toFixed(2)) };
      },
      efficiencyVariance() {
        return ((this.fixedOptimisedPowerUsage - this.lastMonthPowerUsage) / this.fixedOptimisedPowerUsage) * 100;
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard-container { padding: 20px; background: #f5f7fa;     padding-top: 5%;}
  .time-selector { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px; }
  .time-button { background: #fff; border: 1px solid #ccc; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
  .time-button.active { background: #007bff; color: #fff; border-color: #007bff; }
  .cards-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
  .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom:20px; }
  .dashboard-title { font-size:24px; font-weight:bold; color:#1f2937; }
  .breadcrumb { display:flex; align-items:center; font-size:14px; color:#1f2937; }
  .breadcrumb-item { color:#4b5563; }
  .breadcrumb-item.active { color:#111827; font-weight:600; }
  .breadcrumb-separator { margin:0 8px; }
  .special-cards-container { display:flex; gap:20px; }
  .special-card { display:flex; align-items:center; padding:20px; background:linear-gradient(135deg,#1e293b,#304a75); color:#fff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.2); }
  .special-card-icon { font-size:40px; margin-right:20px; }
  .special-card-content h3 { margin:0; font-size:18px; }
  .chart-card { position:relative; background:#fff; padding:20px; border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.1); display:flex; flex-direction:column; align-items:center; }
  .chart-title { position:absolute; top:10px; left:10px; font-size:16px; font-weight:bold; color:#333; }
  .chart-card canvas { width:100% !important; height:auto !important; }
  .variance-green { color: lightgreen; }
  .variance-red { color: #FF7F7F; }
  </style>
  