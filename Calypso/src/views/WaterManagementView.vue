<template>
    <div class="dashboard-container">
      <div class="dashboard-view">
        <!-- Header Row -->
        <div class="header-row">
          <h2 class="dashboard-title">Dashboard</h2>
          <nav class="breadcrumb">
            <span class="breadcrumb-item">Cavill</span>
            <span class="breadcrumb-separator">&gt;</span>
            <span class="breadcrumb-item">Management</span>
            <span class="breadcrumb-separator">&gt;</span>
            <span class="breadcrumb-item active">Dashboard</span>
          </nav>
        </div>
  
        <!-- Top Cards -->
        <div class="top-cards">
          <DashboardCard
            color="#625a9b"
            title="Water Consumption Today (m³)"
            :value="waterConsumptionToday"
            description="Total consumption today"
          >
            <template #icon>
              <i class="fas fa-tint"></i>
            </template>
          </DashboardCard>
  
          <DashboardCard
            color="#42abb7"
            title="Water Consumption This Month (m³)"
            :value="waterConsumptionMonthly"
            description="Total consumption this month"
          >
            <template #icon>
              <i class="fas fa-calendar-alt"></i>
            </template>
          </DashboardCard>
  
          <DashboardCard
            color="#00484a"
            title="Highest Consumption Device"
            :value="`${highestConsumptionValue} m³`"
            :description="`Device: ${highestConsumptionDevice}`"
            link="/water-management/deviceFloorplan"
          >
            <template #icon>
              <i class="fas fa-plug"></i>
            </template>
          </DashboardCard>
  
          <DashboardCard color="#245d75" title="Devices All Operational" value="Normal">
            <template #icon>
              <i class="fas fa-leaf"></i>
            </template>
          </DashboardCard>
        </div>
  
        <!-- Middle Row -->
        <div class="middle-row">
          <div class="card floorplan">
            <div class="floorplan-header">
              <h3>Select Location</h3>
              <button class="add-button" @click="navigateToFloorplan">+</button>
            </div>
            <select v-model="selectedImage">
              <option
                v-for="option in floorplanOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <img :src="require(`@/assets/${selectedImage}`)" class="floorplan-img" />
          </div>
  
          <div class="card power-usage-hourly">
            <h3>Water Meter Usage for the Day (m³)</h3>
            <div class="chart-wrapper">
              <PowerHourlyChart :data="hourlyChartData" />
            </div>
            <button class="add-button" @click="navigateToChart">+</button>
          </div>
        </div>
  
        <!-- Bottom Row -->
        <div class="bottom-row">
          <div class="card power-usage-daily">
            <h3>Water Meter Usage, Over 7 Days (m³)</h3>
            <div class="chart-wrapper">
              <PowerDailyChart :data="dailyChartData" />
            </div>
            <button class="add-button" @click="navigateToChart">+</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import DashboardCard from '@/components/DashboardCard.vue';
  import PowerHourlyChart from '../components/WaterHourlyChart.vue';
  import PowerDailyChart from '../components/WaterDailyChart.vue';
  
  export default {
    components: { DashboardCard, PowerHourlyChart, PowerDailyChart },
    data() {
      return {
        // Static metrics
        waterConsumptionToday: '45.32',
        waterConsumptionMonthly: '1023.75',
        highestConsumptionDevice: 'Meter 3',
        highestConsumptionValue: '120.50',
        
        // Floorplan selector
        floorplanOptions: [
          { label: 'Water Meter Pin Location', value: 'WaterMap.png' }
        ],
        selectedImage: 'WaterMap.png',
  
        // Hardcoded chart data
        hourlyChartData: [
          { label: '00:00', value: 2.1 },
          { label: '04:00', value: 3.5 },
          { label: '08:00', value: 5.0 },
          { label: '12:00', value: 6.8 },
          { label: '16:00', value: 5.4 },
          { label: '20:00', value: 4.2 }
        ],
        dailyChartData: [
          { label: '2025-04-12', value: 110.2 },
          { label: '2025-04-13', value: 115.7 },
          { label: '2025-04-14', value: 98.4 },
          { label: '2025-04-15', value: 130.1 },
          { label: '2025-04-16', value: 125.3 },
          { label: '2025-04-17', value: 140.8 },
          { label: '2025-04-18', value: 120.5 }
        ]
      };
    },
    methods: {
      navigateToFloorplan() {
        this.$router.push('/water-management/deviceFloorplan');
      },
      navigateToChart() {
        this.$router.push('/water-management/historical-data');
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard-view { display: flex; flex-direction: column; gap: 20px;     padding-top: 5%;}
  .top-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .middle-row { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
  .bottom-row { display: flex; gap: 20px; }
  .card { background:#f5f5f5; border:1px solid #e0e0e0; border-radius:8px; padding:20px; position:relative; }
  .add-button { position:absolute; top:10px; right:10px; background:#f43f5e; color:#fff; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer; }
  .add-button:hover { background:#e11d48; }
  .floorplan-img { width:100%; height:auto; border:1px solid #e5e7eb; border-radius:8px; }
  .chart-wrapper { width:100%; height:auto; display:flex; align-items:center; justify-content:center; }
  .header-row, .breadcrumb { display:flex; align-items:center; justify-content:space-between; }
  .dashboard-title { font-size:24px; font-weight:bold; }
  .breadcrumb-item, .breadcrumb-separator { margin:0 8px; }
  </style>
  