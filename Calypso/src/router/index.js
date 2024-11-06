import { createRouter, createWebHistory } from 'vue-router';
import OverviewPage from '@/views/OverviewPage.vue';
import WaterMeterReadingPage from '@/views/WaterMeterReadingPage.vue';
import BMSReadingPage from '@/views/BMSReadingPage.vue';
import FireAlarmSystem from '@/views/FireAlarmSystem.vue';
import PowerMeterReadingPage from '@/views/PowerMeterReadingPage.vue';
import PowerDeviceDetailPage from '@/views/PowerDeviceDetailPage.vue';
import SmartLandscapeSystem from '@/views/SmartLandscapeSystem.vue';
import SmartToiletSystem from '@/views/SmartToiletSystem.vue';
import SmartPestControlSystem from '@/views/SmartPestControlSystem.vue';
import SmartSecuritySystem from '@/views/SmartSecuritySystem.vue';
import SmartAirQualitySystem from '@/views/SmartAirQualitySystem.vue';
import AssetTaggingSystem from '@/views/AssetTaggingSystem.vue';
import SmartLightingSystem from '@/views/SmartLightingSystem.vue';
import AlarmsNotificationsPage from '@/views/AlarmsNotificationsPage.vue';
import FaultCallTicket from '@/views/FaultCallTicket.vue';
import IndoorAirQuality from '@/views/IndoorAirQuality.vue';
import HybridAircon from '@/views/HybridAircon.vue';
import B051314 from '@/views/B05-13-14.vue';
import B051516 from '@/views/B05-15-16.vue';
import B0507 from '@/views/B05-07.vue';
import B0508 from '@/views/B05-08.vue';
import B0509 from '@/views/B05-09.vue'; 
import B05Washroom from '@/views/B05-Washroom.vue'; 
import ppvcTrainingRoom from '@/views/ppvc-training-room.vue';
import liftEscalatorTrainingRoom from '@/views/lift-escalator-training-room.vue';
import B05SmartLandscape from '@/views/B05-smart-landscape.vue';
import integratedOperationCentre from '@/views/integrated-operation-centre.vue';
import iceRoom from '@/views/ice-room.vue';
import B0518 from '@/views/B05-18.vue';

const routes = [
  {
    path: '/',
    name: 'OverviewPage',
    component: OverviewPage,
  },
  {
    path: '/power-meter-reading',
    name: 'PowerMeterReading',
    component: PowerMeterReadingPage,
  },
  {
    path: '/power-meter-reading/:id',
    name: 'PowerDeviceDetail',
    component: PowerDeviceDetailPage,
    props: true,
  },
  {
    path: '/water-meter-reading',
    name: 'WaterMeterReadingPage',
    component: WaterMeterReadingPage,
  },
  {
    path: '/bms-reading',
    name: 'BMSReadingPage',
    component: BMSReadingPage,
  },
  {
    path: '/fire-alarm-system',
    name: 'FireAlarmReadingPage',
    component: FireAlarmSystem,
  },
  {
    path: '/smart-landscape-system',
    name: 'SmartLandscapeSystem',
    component: SmartLandscapeSystem
  },
  {
    path: '/smart-toilet-system',
    name: 'SmartToiletSystem',
    component: SmartToiletSystem
  },
  {
    path: '/smart-pest-control-system',
    name: 'SmartPestControlSystem',
    component: SmartPestControlSystem
  },
  {
    path: '/smart-security-system',
    name: 'SmartSecuritySystem',
    component: SmartSecuritySystem
  },
  {
    path: '/smart-air-quality-system',
    name: 'SmartAirQualitySystem',
    component: SmartAirQualitySystem
  },
  {
    path: '/asset-tagging-system',
    name: 'AssetTaggingSystem',
    component: AssetTaggingSystem
  },
  {
    path: '/Smart-lighting-system',
    name: 'SmartLightingSystem',
    component: SmartLightingSystem
  },
  // {
  //   path: '/hybrid-aircon-system',
  //   name: 'HybridAirconSystem',
  //   component: HybridAirconSystem
  // },
  {
    path: '/indoor-air-quality',
    name: 'IndoorAirQuality',
    component: IndoorAirQuality
  },
  {
    path: '/hybrid-aircon',
    name: 'HybridAircon',
    component: HybridAircon
  },
  {
    path: '/alarms-notifications',
    name: 'AlarmsNotifications',
    component: AlarmsNotificationsPage,
  },
  {
    path: '/quick-links',
    name: 'QuickLinks',
    component: FaultCallTicket,
  },
  {
    path: '/smart-vertical-transport-room',
    name: 'B051314',
    component: B051314,
  },
  {
    path: '/vertical-transport-room',
    name: 'B051516',
    component: B051516,
  },
  {
    path: '/collaborative-design-centre-07',
    name: 'B0507',
    component: B0507,
  },
  {
    path: '/collaborative-design-centre-08',
    name: 'B0508',
    component: B0508,
  },
  {
    path: '/collaborative-design-centre-09',
    name: 'B0509',
    component: B0509,
  },
  {
    path: '/smart-washroom-room',
    name: 'B05Washroom',
    component: B05Washroom,
  },
  {
    path: '/ppvc-training-zone',
    name: ppvcTrainingRoom,
    component: ppvcTrainingRoom,
  },
  {
    path: '/lift-escalator-training-zone',
    name: liftEscalatorTrainingRoom,
    component: liftEscalatorTrainingRoom
  },
  {
    path: '/smart-landscape-room',
    name: B05SmartLandscape,
    component: B05SmartLandscape
  },
  {
    path: '/integrated-operation-centre',
    name: integratedOperationCentre,
    component: integratedOperationCentre
  },
  {
    path: '/ice-room',
    name: iceRoom,
    component: iceRoom
  },
  {
    path: '/wsh-room',
    name: B0518,
    component: B0518
  }
];


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
