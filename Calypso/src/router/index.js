import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import EnergyManagementView from "../views/EnergyManagementView.vue";
import MonthlyChart from "@/components/EnergyManagement/MonthlyChart.vue";
import DailyChart from "@/components/EnergyManagement/DailyChart.vue";
import HourlyChart from "@/components/EnergyManagement/HourlyChart.vue";
import HistoricalData from "@/components/EnergyManagement/HistoricalData.vue";
import EnergyManagementFloorplan from "@/views/EnergyManagementFloorplan.vue";
// import AutomationManagementView from "../views/AutomationManagementView.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: DashboardView, // Main Dashboard View
  },
  {
    path: "/energy-management",
    name: "EnergyManagement",
    component: EnergyManagementView, // Energy Management with dynamic chart selection
  },
  {
    path: "/energy-management/monthly",
    name: "MonthlyChart",
    component: MonthlyChart, // Energy Management with dynamic chart selection
  },
  {
    path: "/energy-management/daily",
    name: "DailyChart",
    component: DailyChart, // Energy Management with dynamic chart selection
  },
  {
    path: "/energy-management/hourly",
    name: "HourlyChart",
    component: HourlyChart, // Energy Management with dynamic chart selection
  },
  {
    path: "/energy-management/historical-data",
    name: "HistoricalData",
    component: HistoricalData, // Energy Management with dynamic chart selection
  },{
    path: "/energy-management/deviceFloorplan",
    name: "EnergyManagementFloorplan",
    component: EnergyManagementFloorplan, // Energy Management with dynamic chart selection
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
