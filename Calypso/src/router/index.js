import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import EnergyManagementView from "../views/EnergyManagementView.vue";
import HistoricalData from "@/components/EnergyManagement/HistoricalData.vue";
import WaterHistoricalData from "@/components/WaterManagement/HistoricalData.vue";
import EnergyManagementFloorplan from "@/views/EnergyManagementFloorplan.vue";
import WaterManagementFloorplan from "@/views/WaterManagementFloorplan.vue";
import DataLog from "@/components/EnergyManagement/DataLog.vue";
import waterDataLog from "@/components/WaterManagement/DataLog.vue"; 
import WaterManagementView from "@/views/WaterManagementView.vue";
import automationOverview from "@/views/AutomationOverview.vue";
import FaultCalling from "@/views/FaultCalling.vue";
import ScheduledCommand from "@/views/ScheduledCommand.vue";
import ConditionalCommand from "@/views/ConditionalCommand.vue";
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
    path: "/water-management",
    name: "WaterManagementView",
    component: WaterManagementView, // Energy Management with dynamic chart selection
  },
  {
    path: "/energy-management/historical-data",
    name: "HistoricalData",
    component: HistoricalData, // Energy Management with dynamic chart selection
  },
  {
    path: "/energy-management/deviceFloorplan",
    name: "EnergyManagementFloorplan",
    component: EnergyManagementFloorplan, // Energy Management with dynamic chart selection
  },
  {
    path: "/water-management/deviceFloorplan",
    name: "WaterManagementFloorplan",
    component: WaterManagementFloorplan, // Energy Management with dynamic chart selection
  },
  {
    path: "/energy-management/dataLog",
    name: "DataLog",
    component: DataLog, // Energy Management with dynamic chart selection
  },
  {
    path: "/water-management/historical-data",
    name: "WaterHistoricalData",
    component: WaterHistoricalData, // Energy Management with dynamic chart selection
  },
  {
    path: "/water-management/dataLog",
    name: "waterDataLog",
    component: waterDataLog, // Energy Management with dynamic chart selection
  },
  {
    path: "/automation-management",
    name: "automationOverview",
    component: automationOverview, // Energy Management with dynamic chart selection
  },
  {
    path: "/automation-management/fault-calling",
    name: "FaultCalling",
    component: FaultCalling, // Energy Management with dynamic chart selection
  },
  {
    path: "/automation-management/scheduleCommand",
    name: "ScheduledCommand",
    component: ScheduledCommand, // Energy Management with dynamic chart selection
  },
  {
    path: "/automation-management/conditionalCommand",
    name: "ConditionalCommand",
    component: ConditionalCommand, // Energy Management with dynamic chart selection
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
