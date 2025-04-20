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
            title="Power Usage Today"
            :value="powerUsageToday"
            description="Power Today"
            link="/energy-management/historical-data"
          >
            <template #icon>
              <i class="fas fa-bolt"></i>
            </template>
          </DashboardCard>
  
          <DashboardCard
            color="#42abb7"
            title="Power Usage This Month"
            :value="totalPowerUsageThisMonth"
            description="Power Usage This Month"
            link="/energy-management/historical-data"
          >
            <template #icon>
              <i class="fas fa-calendar-alt"></i>
            </template>
          </DashboardCard>
  
          <DashboardCard
            color="#00484a"
            title="Device Power Usage (Highest)"
            :value="highestDevicePowerUsage"
            description="Highest Power Consumption"
            link="/energy-management/dataLog"
          >
            <template #icon>
              <i class="fas fa-plug"></i>
            </template>
          </DashboardCard>
  
          <DashboardCard
            color="#245d75"
            title="Power Efficiency"
            :value="powerEfficiencyStatus"
            description="Valid Until 30 June 2025"
          >
            <template #icon>
              <i class="fas fa-leaf"></i>
            </template>
          </DashboardCard>
        </div>
  
        <!-- Middle Row -->
        <div class="middle-row">
          <div class="card floorplan">
            <FloorplanComponent :selectedImage="selectedImage" />
          </div>
  
          <div class="card power-usage-hourly">
            <h3>Power Usage Hourly for the Day</h3>
            <div class="chart-wrapper">
              <PowerHourlyChart :data="hourlyChartData" />
            </div>
            <button class="add-button">+</button>
          </div>
        </div>
  
        <!-- Bottom Row -->
        <div class="bottom-row">
          <div class="card power-usage-daily">
            <h3>Power Usage Daily, over 7 days</h3>
            <div class="chart-wrapper">
              <PowerDailyChart :data="dailyChartData" />
            </div>
            <button class="add-button">+</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import DashboardCard from "@/components/DashboardCard.vue";
  import PowerHourlyChart from "../components/PowerHourlyChart.vue";
  import PowerDailyChart from "../components/PowerDailyChart.vue";
  import FloorplanComponent from '@/components/FloorplanComponent.vue';
  
  export default {
    components: {
      DashboardCard,
      PowerHourlyChart,
      PowerDailyChart,
      FloorplanComponent,
    },
    data() {
      return {
        // Hardcoded values
        powerUsageToday: '45.50 kWh',
        totalPowerUsageThisMonth: '980.75 kWh',
        highestDevicePowerUsage: '12.30 kWh',
        powerEfficiencyStatus: 'Normal',
        selectedImage: 'Floorplan.jpg',
  
        // Hourly chart sample data
        hourlyChartData: [
          { label: '00:00', value: 2.5 },
          { label: '02:00', value: 3.1 },
          { label: '04:00', value: 1.8 },
          { label: '06:00', value: 4.0 },
          { label: '08:00', value: 6.7 },
          { label: '10:00', value: 7.2 },
          { label: '12:00', value: 8.5 },
          { label: '14:00', value: 7.9 },
          { label: '16:00', value: 6.4 },
          { label: '18:00', value: 5.8 },
          { label: '20:00', value: 4.3 },
          { label: '22:00', value: 3.7 }
        ],
  
        // Daily chart sample data
        dailyChartData: [
          { label: '2025-04-12', value: 120.5 },
          { label: '2025-04-13', value: 115.3 },
          { label: '2025-04-14', value: 130.2 },
          { label: '2025-04-15', value: 125.0 },
          { label: '2025-04-16', value: 140.8 },
          { label: '2025-04-17', value: 135.4 },
          { label: '2025-04-18', value: 128.9 }
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .dashboard-view { display: flex; flex-direction: column; gap: 20px;     padding-top: 5%;}
  .top-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .middle-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .bottom-row { display: flex; gap: 20px; }
  .card { background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; text-align: center; color: #4a4a4a; position: relative; }
  .add-button { position: absolute; top: 10px; right: 10px; background-color: #f43f5e; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 18px; cursor: pointer; }
  .add-button:hover { background-color: #e11d48; }
  .floorplan { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .chart-wrapper { width: 100%; height: auto; display: flex; align-items: center; justify-content: center; }
  .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .dashboard-title { font-size: 24px; font-weight: bold; color: #1f2937; }
  .breadcrumb { display: flex; align-items: center; font-size: 14px; color: #1f2937; }
  .breadcrumb-item { color: #4b5563; }
  .breadcrumb-item.active { color: #111827; font-weight: 600; }
  .breadcrumb-separator { margin: 0 8px; }
  </style>
  