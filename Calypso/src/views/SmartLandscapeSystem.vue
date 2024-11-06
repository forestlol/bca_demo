<template>
  <div class="container-fluid mt-5">
    <h2 class="text-center mb-4">Smart Landscape System</h2>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs justify-content-center" id="myTab" role="tablist">
      <!-- <li class="nav-item" role="presentation">
        <button class="nav-link active" id="layout-tab" data-bs-toggle="tab" data-bs-target="#layout" type="button"
          role="tab" aria-controls="layout" aria-selected="true">Layout</button>
      </li> -->
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button"
          role="tab" aria-controls="overview" aria-selected="true">Overview</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="schematic-tab" data-bs-toggle="tab" data-bs-target="#schematic" type="button"
          role="tab" aria-controls="schematic" aria-selected="false">Schematic</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="sensors-tab" data-bs-toggle="tab" data-bs-target="#sensors" type="button"
          role="tab" aria-controls="sensors" aria-selected="false">Sensors</button>
      </li>
    </ul>


    <!-- Tab Content -->
    <div class="tab-content" id="myTabContent">
      <!-- Layout Tab -->
      <!-- <div class="tab-pane fade show active" id="layout" role="tabpanel" aria-labelledby="layout-tab">
        <div class="map-section position-relative">
          <h4>Floorplan View</h4>
          <div class="map-container position-relative">
            <img src="@/assets/Sub System and Icons/V2/smart Landscape system_full.png" alt="Map View" class="map-image">
          </div>
        </div>
      </div> -->
      <!-- Overview Tab -->
      <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
        <div class="row">
          <div class="col-md-12">
            <div class="map-section position-relative">
              <h4>Floorplan View</h4>
              <div class="map-container position-relative">
                <img src="@/assets/Sub System and Icons/V2/smart Landscape system_full.png" alt="Map View"
                  class="map-image">

                <!-- Toggle Switches for MAIN PUMP, ALL VALVES, DOSAGE PUMP -->
                <div class="toggle-switch-container vertical-toggle">
                  <!-- MAIN PUMP -->
                  <div class="toggle-switch">
                    <input type="checkbox" id="mainPumpToggle" v-model="isMainPumpOn" @change="toggleMainPump">
                    <label for="mainPumpToggle">{{ isMainPumpOn ? 'MAIN PUMP OFF' : 'MAIN PUMP ON' }}</label>
                  </div>

                  <!-- ALL VALVES -->
                  <div class="toggle-switch">
                    <input type="checkbox" id="allValvesToggle" v-model="areAllValvesOn" @change="toggleAllValves">
                    <label for="allValvesToggle">{{ areAllValvesOn ? 'ALL VALVES OFF' : 'ALL VALVES ON' }}</label>
                  </div>

                  <!-- DOSAGE PUMP -->
                  <div class="toggle-switch">
                    <input type="checkbox" id="dosagePumpToggle" v-model="isDosagePumpOn" @change="toggleDosagePump">
                    <label for="dosagePumpToggle">{{ isDosagePumpOn ? 'DOSAGE PUMP OFF' : 'DOSAGE PUMP ON' }}</label>
                  </div>
                </div>


                <!-- Icons for devices -->
                <div v-for="(icon, index) in icons" :key="index" class="icon-container"
                  :style="{ top: icon.y + '%', left: icon.x + '%', position: 'absolute', transform: 'translate(-50%, -50%)' }"
                  @click="openIconModal(icon)">
                  <img :src="icon.src" alt="Icon" class="icon-image">
                  <div :class="['status-dot', icon.isOn ? 'online' : 'offline']"></div>
                  <span class="switch-number"></span> <!-- Display switchNumber -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
          <div class="d-flex justify-content-between mt-4">
            <div class="device-status-card text-center" v-for="device in devices" :key="device.id">
              <h5>{{ device.name }}</h5>
              <p class="status" :class="{ 'text-success': device.isOnline, 'text-danger': !device.isOnline }">
                {{ device.isOnline ? 'Online' : 'Offline' }}
              </p>
            </div>
          </div>
        </div>

        <div class="condition mt-4 text-center border-condition">
          <div class="row mt-4 condition-dropdown">
            <div class="col-12 text-center">
              <select id="conditionSelect" v-model="selectedCondition" class="form-select" @change="updateCondition">
                <option v-for="(condition, index) in conditions" :key="index" :value="condition">
                  {{ condition }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Schematic Tab -->
      <div class="tab-pane fade" id="schematic" role="tabpanel" aria-labelledby="schematic-tab">
        <div class="relation-section">
          <h4>Relation View</h4>
          <div class="relation-view-container">
            <div class="relation-view position-relative">
              <img src="@/assets/Smart Landscape Schematic.jpg" alt="Relation View" class="relation-image">
              <div v-for="(point, index) in relationPoints" :key="index"
                :style="{ top: point.y + '%', left: point.x + '%', position: 'absolute', transform: 'translate(-50%, -50%)' }"
                @mouseenter="point.type !== 'Valve' && showValue(index, $event)"
                @mouseleave="point.type !== 'Valve' && hideValue()"
                :class="['relation-point', { 'point-label-break': point.type === 'break', 'active': isAllOn }]">
                <template v-if="point.type === 'sensor'">
                  <span class="point-number">{{ point.number }}</span>
                </template>
                <template v-else>
                  <span class="point-label">{{ formatLabel(point.label) }}</span>
                  <!-- Add the status dot for the valve based on its status -->
                  <div v-if="point.type === 'Valve'"
                    :class="['status-dot', point.status === 'On' ? 'online' : 'offline']"></div>
                </template>

                <span v-if="hoveredIndex === index && point.type !== 'Valve'" class="value-tooltip">
                  <h5>{{ point.type === 'sensor' ? `Sensor ${point.number}` : point.label }}</h5>
                  <template v-if="point.type === 'sensor'">
                    <p>Temperature: {{ point.data.temperature }}°C</p>
                    <p>Soil Moisture: {{ point.data.soilMoisture }}%</p>
                    <p>pH Level: {{ point.data.pH }}</p>
                    <p>Electrical Conductivity (EC): {{ point.data.ec }} µS/cm</p>
                    <p>Nitrogen (N): {{ point.data.n }} mg/L</p>
                    <p>Phosphorus (P): {{ point.data.p }} mg/L</p>
                    <p>Potassium (K): {{ point.data.k }} mg/L</p>
                  </template>
                </span>
              </div>
            </div>
            <div class="adjust-button-container">
              <button @click="openConditionModal" class="btn btn-primary">Adjust Condition</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sensors Tab -->
      <div class="tab-pane fade" id="sensors" role="tabpanel" aria-labelledby="sensors-tab">
        <div class="row mt-4">
          <div class="col-md-4" v-for="(sensor, index) in sensors" :key="index">
            <div class="card mb-4">
              <div class="card-header">
                Sensor {{ sensor.number }}
              </div>
              <div class="card-body">
                <p><strong>Temperature:</strong> {{ sensor.data.temperature }}°C</p>
                <p><strong>Soil Moisture:</strong> {{ sensor.data.soilMoisture }}%</p>
                <p><strong>pH Level:</strong> {{ sensor.data.pH }}</p>
                <p><strong>Electrical Conductivity (EC):</strong> {{ sensor.data.ec }} µS/cm</p>
                <p><strong>Nitrogen (N):</strong> {{ sensor.data.n }} mg/L</p>
                <p><strong>Phosphorus (P):</strong> {{ sensor.data.p }} mg/L</p>
                <p><strong>Potassium (K):</strong> {{ sensor.data.k }} mg/L</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals and Buttons -->
    <div v-if="showConditionModal" class="modal-overlay" @click="closeConditionModal"></div>
    <div v-if="showConditionModal" class="modal d-block" style="z-index: 1050;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header justify-content-center">
            <h5 class="modal-title">Set pH Threshold</h5>
            <button type="button" class="btn-close position-absolute top-0 end-0"
              @click="closeConditionModal">&times;</button>
          </div>
          <div class="modal-body text-center">
            <form @submit.prevent="saveThreshold">
              <div class="mb-3">
                <label for="phThresholdInput" class="form-label">pH Threshold</label>
                <input type="number" step="0.1" class="form-control" id="phThresholdInput" v-model="phThreshold"
                  placeholder="Enter pH threshold" required />
              </div>
              <button type="submit" class="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showIconModal" class="modal-overlay" @click="closeIconModal"></div>
    <div v-if="showIconModal" class="modal d-block" style="z-index: 1050;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header justify-content-center">
            <h5 class="modal-title">{{ activeIcon?.name }}</h5>
            <button type="button" class="btn-close position-absolute top-0 end-0"
              @click="closeIconModal">&times;</button>
          </div>
          <div class="modal-body text-center">
            <label class="switch">
              <input type="checkbox" v-model="activeIcon.isOn"
                @change="toggleSwitchInModal(activeIcon.isOn, activeIcon)">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Valve Simulation Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="closeScheduleModal"></div>
    <div v-if="showScheduleModal" class="modal d-block" style="z-index: 1050;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header justify-content-center">
            <h5 class="modal-title">Scheduled Valve Simulation</h5>
            <button type="button" class="btn-close position-absolute top-0 end-0"
              @click="closeScheduleModal">&times;</button>
          </div>
          <div class="modal-body">
            <p>Scheduled Times:</p>
            <ul>
              <li v-for="(schedule, index) in scheduleTimes" :key="index">
                {{ schedule.time }} - {{ schedule.duration }} minutes
              </li>
            </ul>
            <button @click="testValveOperation" class="btn btn-primary">Test Valve Operation Now</button>
          </div>
        </div>
      </div>
    </div>

    <div class="link-button mt-4">
      <!-- <button @click="navigateTo3DLandscape" class="btn btn-primary">Go to 3D Landscape</button> -->
      <button @click="openScheduleModal" class="btn btn-secondary ml-2">Schedule Valve Simulation</button>
    </div>

    <!-- Notification Container -->
    <div class="notification-container">
      <countdown-notification v-for="notification in notifications" :key="notification.id"
        :message="notification.message" :countdown-time="notification.countdown"
        @close="removeNotification(notification.id)" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CountdownNotification from "@/components/CountdownNotification.vue";
import mainPumpIcon from '@/assets/main-pump-icon.png';
import dosagePumpIcon from '@/assets/dosage-pump-icon.png';
import planterPotIcon from '@/assets/planter-pot-icon.png';

export default {
  components: {
    CountdownNotification,
  },
  data() {
    return {
      isMainPumpOn: false,    // New variable for Main Pump status
      areAllValvesOn: false,  // New variable for All Valves status
      isDosagePumpOn: false,  // New variable for Dosage Pump status
      switchStatesOutdoor1: Array(8).fill(false), // Switches 1-8
      switchStatesOutdoor2: Array(8).fill(false), // Switches 9-16
      switchStatesOutdoor3: Array(3).fill(false), // Switches 17-19
      devices: [
        { id: 1, name: '7 in 1 Sensor', isOnline: true },
        { id: 2, name: 'Rainfall Sensor', isOnline: true },
        { id: 3, name: 'Lux Sensor', isOnline: true },
        { id: 4, name: 'Water Level Sensor', isOnline: true },
        { id: 5, name: 'Main Pump', isOnline: true },
        { id: 6, name: 'Dosing Pump', isOnline: true },
        { id: 7, name: 'Solenoid Valve', isOnline: true },
      ],
      conditions: [
        "Conditions",
        "If 7 in 1 Sensor, Rainfall Sensor, Lux Sensor, Water Level Sensor Threshold met, Main pump turn on, Dosing pump turn on when Threshold met and turn on Solenoid Valve.",
        "If Rainfall Sensor detects rain, Main pump turns off, Dosing pump turns off, and Solenoid Valve turns off.",
        "If Lux Sensor detects low light, Main pump turns on, Dosing pump turns on, and Solenoid Valve opens."
      ],
      selectedCondition: "Conditions",
      relationPoints: [
        { number: 1, type: 'sensor', x: 13, y: 30, data: { temperature: 25, soilMoisture: 60, pH: 6.8, ec: 1.2, n: 20, p: 5, k: 10, batteryVoltage: 3.5 }, status: 'Off' },
        { number: 2, type: 'sensor', x: 17, y: 30, data: { temperature: 26, soilMoisture: 65, pH: 6.7, ec: 1.3, n: 21, p: 6, k: 11, batteryVoltage: 3.6 }, status: 'Off' },
        { number: 3, type: 'sensor', x: 21.6, y: 30, data: { temperature: 27, soilMoisture: 70, pH: 6.9, ec: 1.4, n: 22, p: 7, k: 12, batteryVoltage: 3.7 }, status: 'Off' },
        { number: 4, type: 'sensor', x: 26, y: 30, data: { temperature: 28, soilMoisture: 75, pH: 7.0, ec: 1.5, n: 23, p: 8, k: 13, batteryVoltage: 3.8 }, status: 'Off' },
        { number: 5, type: 'sensor', x: 31, y: 30, data: { temperature: 29, soilMoisture: 80, pH: 7.1, ec: 1.6, n: 24, p: 9, k: 14, batteryVoltage: 3.9 }, status: 'Off' },
        { number: 6, type: 'sensor', x: 13, y: 40, data: { temperature: 30, soilMoisture: 85, pH: 7.2, ec: 1.7, n: 25, p: 10, k: 15, batteryVoltage: 4.0 }, status: 'Off' },
        { number: 7, type: 'sensor', x: 17, y: 40, data: { temperature: 31, soilMoisture: 90, pH: 7.3, ec: 1.8, n: 26, p: 11, k: 16, batteryVoltage: 4.1 }, status: 'Off' },
        { number: 8, type: 'sensor', x: 21.5, y: 40, data: { temperature: 32, soilMoisture: 95, pH: 7.4, ec: 1.9, n: 27, p: 12, k: 17, batteryVoltage: 4.2 }, status: 'Off' },
        { number: 9, type: 'sensor', x: 26, y: 40, data: { temperature: 33, soilMoisture: 60, pH: 6.5, ec: 2.0, n: 28, p: 13, k: 18, batteryVoltage: 4.3 }, status: 'Off' },
        { number: 10, type: 'sensor', x: 31, y: 40, data: { temperature: 34, soilMoisture: 65, pH: 6.6, ec: 2.1, n: 29, p: 14, k: 19, batteryVoltage: 4.4 }, status: 'Off' },
        { number: 11, type: 'sensor', x: 13, y: 50, data: { temperature: 35, soilMoisture: 70, pH: 6.7, ec: 2.2, n: 30, p: 15, k: 20, batteryVoltage: 4.5 }, status: 'Off' },
        { number: 12, type: 'sensor', x: 17, y: 50, data: { temperature: 36, soilMoisture: 75, pH: 6.8, ec: 2.3, n: 31, p: 16, k: 21, batteryVoltage: 4.6 }, status: 'Off' },
        { number: 13, type: 'sensor', x: 21.6, y: 50, data: { temperature: 37, soilMoisture: 80, pH: 6.9, ec: 2.4, n: 32, p: 17, k: 22, batteryVoltage: 4.7 }, status: 'Off' },
        { number: 14, type: 'sensor', x: 26, y: 50, data: { temperature: 38, soilMoisture: 85, pH: 7.0, ec: 2.5, n: 33, p: 18, k: 23, batteryVoltage: 4.8 }, status: 'Off' },
        { number: 15, type: 'sensor', x: 31, y: 50, data: { temperature: 39, soilMoisture: 90, pH: 7.1, ec: 2.6, n: 34, p: 19, k: 24, batteryVoltage: 4.9 }, status: 'Off' },
        { number: 16, type: 'sensor', x: 13, y: 60, data: { temperature: 40, soilMoisture: 95, pH: 7.2, ec: 2.7, n: 35, p: 20, k: 25, batteryVoltage: 5.0 }, status: 'Off' },
        { number: 17, type: 'sensor', x: 17, y: 60, data: { temperature: 41, soilMoisture: 60, pH: 7.3, ec: 2.8, n: 36, p: 21, k: 26, batteryVoltage: 5.1 }, status: 'Off' },
      ],
      hoveredIndex: null,
      tooltipX: 0,
      tooltipY: 0,
      showConditionModal: false,
      showIconModal: false,
      phThreshold: parseFloat(localStorage.getItem('phThreshold')) || 6.5, // Default to 6.5
      activeIcon: null,
      showScheduleModal: false,
      scheduleTimes: [
        { time: '7:00 AM', duration: 20 },
        { time: '1:00 PM', duration: 20 }
      ],
      icons: [
        { x: 91, y: 21, src: mainPumpIcon, name: 'Main Pump', switchNumber: 1, isOn: false },
        { x: 87.5, y: 16.6, src: dosagePumpIcon, name: 'Dosage Pump', switchNumber: 19, isOn: false },
        { x: 97, y: 30.5, src: planterPotIcon, name: 'Planter Pot 1', switchNumber: 2, isOn: false },
        { x: 95, y: 38.5, src: planterPotIcon, name: 'Planter Pot 2', switchNumber: 3, isOn: false },
        { x: 89, y: 51, src: planterPotIcon, name: 'Planter Pot 3', switchNumber: 4, isOn: false },
        { x: 88.5, y: 33, src: planterPotIcon, name: 'Planter Pot 4', switchNumber: 5, isOn: false },
        { x: 77, y: 46, src: planterPotIcon, name: 'Planter Pot 5', switchNumber: 6, isOn: false },
        { x: 77, y: 63, src: planterPotIcon, name: 'Planter Pot 6', switchNumber: 7, isOn: false },
        { x: 69.3, y: 64, src: planterPotIcon, name: 'Planter Pot 7', switchNumber: 8, isOn: false },
        { x: 28.5, y: 54, src: planterPotIcon, name: 'Planter Pot 8', switchNumber: 9, isOn: false },
        { x: 17.5, y: 34, src: planterPotIcon, name: 'Planter Pot 9', switchNumber: 10, isOn: false },
        { x: 18, y: 59, src: planterPotIcon, name: 'Planter Pot 10', switchNumber: 11, isOn: false },
        { x: 6.6, y: 63, src: planterPotIcon, name: 'Planter Pot 11', switchNumber: 12, isOn: false },
        { x: 7.4, y: 35.3, src: planterPotIcon, name: 'Planter Pot 12', switchNumber: 13, isOn: false },
        { x: 1.5, y: 32, src: planterPotIcon, name: 'Planter Pot 13', switchNumber: 14, isOn: false },
        { x: 19.5, y: 14.5, src: planterPotIcon, name: 'Planter Pot 14', switchNumber: 15, isOn: false },
        { x: 34, y: 17.3, src: planterPotIcon, name: 'Planter Pot 15', switchNumber: 16, isOn: false },
        { x: 56, y: 18, src: planterPotIcon, name: 'Planter Pot 16', switchNumber: 17, isOn: false },
        { x: 76.5, y: 18, src: planterPotIcon, name: 'Planter Pot 17', switchNumber: 18, isOn: false },
      ],
      sensors: [],
      isAllOn1: false, // Track if "ALL ON 1" is active or not
      isAllOn2: false, // Track if "ALL ON 2" is active or not
      isAllOn3: false, // Track if "ALL ON 3" is active or not
      notifications: [], // Notifications array
    };
  },
  methods: {
    openScheduleModal() {
      this.showScheduleModal = true;
    },
    closeScheduleModal() {
      this.showScheduleModal = false;
    },
    async fetchSensorData() {
      try {
        const response = await axios.get(
          'https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/outdoor'
        );

        const sensorData = [
          response.data['aaaa202406140017'],
          response.data['aaaa202406140009'],
          response.data['aaaa202406140005'],
          response.data['aaaa202406140006'],
          response.data['aaaa202406140007'],
          response.data['aaaa202406140008'],
          response.data['aaaa202406140010'],
          response.data['aaaa202406140011'],
          response.data['aaaa202406140012'],
          response.data['aaaa202406140015'],
          response.data['aaaa202406140004'],
          response.data['aaaa202406140001'],
          response.data['aaaa202406140002'],
        ];

        // Adding 4 more duplicated data points to match 20 sensors
        for (let i = 0; i < 4; i++) {
          sensorData.push(sensorData[i]);
        }

        this.relationPoints = sensorData.map((sensor, index) => ({
          number: index + 1,
          type: 'sensor',
          data: {
            temperature: sensor.Temperature,
            soilMoisture: sensor.SoilMoisture,
            pH: sensor.pH,
            ec: sensor.EC,
            n: sensor.N,
            p: sensor.P,
            k: sensor.K,
            batteryVoltage: sensor.BatteryVoltage,
          },
        }));

        // Populate the sensors array for the Sensors tab
        this.sensors = this.relationPoints.map((point) => ({
          number: point.number,
          data: point.data,
        }));

        // Include the Solenoid Valves and other static relation points
        const solenoidValves = [
          { label: '1', type: 'Valve', x: 51, y: 53, status: 'Off' },
          { label: '2', type: 'Valve', x: 72.6, y: 41, status: 'Off' },
          { label: '3', type: 'Valve', x: 76, y: 41, status: 'Off' },
          { label: '4', type: 'Valve', x: 79.7, y: 41, status: 'Off' },
          { label: '5', type: 'Valve', x: 83.5, y: 41, status: 'Off' },
          { label: '6', type: 'Valve', x: 86.9, y: 41, status: 'Off' },
          { label: '7', type: 'Valve', x: 72.6, y: 53, status: 'Off' },
          { label: '8', type: 'Valve', x: 76, y: 53, status: 'Off' },
          { label: '9', type: 'Valve', x: 79.7, y: 53, status: 'Off' },
          { label: '10', type: 'Valve', x: 83.5, y: 53, status: 'Off' },
          { label: '11', type: 'Valve', x: 86.9, y: 53, status: 'Off' },
          { label: '12', type: 'Valve', x: 72.6, y: 63, status: 'Off' },
          { label: '13', type: 'Valve', x: 76, y: 63, status: 'Off' },
          { label: '14', type: 'Valve', x: 79.7, y: 63, status: 'Off' },
          { label: '15', type: 'Valve', x: 83.5, y: 63, status: 'Off' },
          { label: '16', type: 'Valve', x: 86.9, y: 63, status: 'Off' },
          { label: '17', type: 'Valve', x: 72.6, y: 73.5, status: 'Off' },
          { label: '18', type: 'Valve', x: 76, y: 73.5, status: 'Off' },
          { label: '19', type: 'Valve', x: 62.3, y: 19, status: 'Off' },
        ];

        const additionalPoints = [
          { label: 'Rainfall Sensor', type: 'reading', x: 15.4, y: 77, reading: '10 mm' },
          { label: 'Lux Sensor', type: 'reading', x: 24.5, y: 77, reading: '1500 lux' },
          { label: 'Water Level Sensor', type: 'reading', x: 34, y: 77, reading: '75%' },
          { label: '7-in-1 Sensor (Readings/Threshold)', type: 'title', x: 18.5, y: 10 },
          { label: '(Readings/ Threshold)', x: 15.5, y: 85, type: 'break' },
          { label: '(Readings/ Threshold)', x: 24.5, y: 85, type: 'break' },
          { label: '(Readings/ Threshold)', x: 34, y: 85, type: 'break' },
          { label: 'ON/OFF', type: 'title', x: 48.5, y: 48 },
          { label: 'ON/OFF, (Readings/Threshold)', type: 'title', x: 61.5, y: 11 },
          { label: 'Solenoid Valve ON/OFF', type: 'title', x: 68, y: 37 },
        ];

        this.relationPoints.push(...solenoidValves, ...additionalPoints);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    },
    saveThreshold() {
      localStorage.setItem('phThreshold', this.phThreshold);
      console.log('Threshold saved:', this.phThreshold);
      this.closeConditionModal(); // Close the modal after saving
    },
    showValue(index, event) {
      const containerRect = event.currentTarget.getBoundingClientRect();
      const pointRect = event.target.getBoundingClientRect();
      this.tooltipX = pointRect.x + pointRect.width / 2 - containerRect.x;
      this.tooltipY = pointRect.y - containerRect.y - 10; // Adjust for positioning above the point
      this.hoveredIndex = index;
    },
    openConditionModal() {
      this.showConditionModal = true;
    },
    closeConditionModal() {
      this.showConditionModal = false;
    },
    openIconModal(icon) {
      this.activeIcon = icon;
      this.showIconModal = true;
    },
    closeIconModal() {
      this.showIconModal = false;
    },
    hideValue() {
      this.hoveredIndex = null;
    },
    navigateTo3DLandscape() {
      window.location.href = 'https://visualizer-lite-html.vercel.app/?site=23&levels=91';
    },
    formatLabel(label) {
      if (label === 'Main Pump') {
        return label;
      }
      return label.replace(' ', '\n');
    },
    async sendSwitchCommand(deviceEUI, switchStates) {
      const url = ``;
      const payload = {
        deviceEui: deviceEUI,
        switchStates: switchStates.map((state) => (state ? 1 : 0)), // Convert boolean to 1 or 0
      };

      console.log('Preparing to send payload:', payload);

      try {
        const response = await axios.post(url, payload);
        console.log('Switch command sent successfully:', response.data);
      } catch (error) {
        console.error('Error sending switch command:', error);
      }
    },
    toggleMainPump() {
      // Toggle Main Pump (Switch 1 on device 24e124756e049564)
      this.setAllSwitches(this.isMainPumpOn, '24e124756e049564', 1, 1);
    },
    toggleAllValves() {
      // Toggle All Valves (Switches 2-18 across three devices)
      this.setAllSwitches(this.areAllValvesOn, '24e124756e049564', 2, 8);
      this.setAllSwitches(this.areAllValvesOn, '24e124756e049516', 9, 16);
      this.setAllSwitches(this.areAllValvesOn, '24E124756E049454', 17, 18);
    },
    toggleDosagePump() {
      // Toggle Dosage Pump (Switch 19 on device 24E124756E049454)
      this.setAllSwitches(this.isDosagePumpOn, '24E124756E049454', 19, 19);
    },


    setAllSwitches(state, deviceEUI, startSwitch, endSwitch) {
      let switchStates = [];

      if (deviceEUI === '24e124756e049564') {
        // Ensure the array is always of size 8
        this.switchStatesOutdoor1 = this.switchStatesOutdoor1.map((_, index) =>
          index + 1 >= startSwitch && index + 1 <= endSwitch ? state : this.switchStatesOutdoor1[index]
        );
        switchStates = this.switchStatesOutdoor1;
      } else if (deviceEUI === '24e124756e049516') {
        // Ensure the array is always of size 8
        this.switchStatesOutdoor2 = this.switchStatesOutdoor2.map((_, index) =>
          index + 9 >= startSwitch && index + 9 <= endSwitch ? state : this.switchStatesOutdoor2[index]
        );
        switchStates = this.switchStatesOutdoor2;
      } else if (deviceEUI === '24E124756E049454') {
        // Ensure the array is always of size 8
        this.switchStatesOutdoor3 = this.switchStatesOutdoor3.map((_, index) =>
          index + 17 >= startSwitch && index + 17 <= endSwitch ? state : this.switchStatesOutdoor3[index]
        );
        switchStates = this.switchStatesOutdoor3;
      }

      // Send the switch command, ensuring the array length is 8
      this.sendSwitchCommand(deviceEUI, this.ensureArraySize(switchStates, 8));

      // Update the icon statuses based on the range of switches
      this.icons.forEach(icon => {
        if (icon.switchNumber >= startSwitch && icon.switchNumber <= endSwitch) {
          icon.isOn = state;
        }
      });

      // Update the status of Solenoid Valves in relationPoints
      this.relationPoints.forEach(point => {
        if (point.type === 'Valve' && point.label >= startSwitch && point.label <= endSwitch) {
          point.status = state ? 'On' : 'Off';
        }
      });
    },

    ensureArraySize(array, size) {
      if (array.length === size) {
        return array;  // Already the correct size
      } else if (array.length < size) {
        // Pad with false (or any other default value) to make the array size 8
        return [...array, ...Array(size - array.length).fill(false)];
      } else {
        // Trim the array to size 8
        return array.slice(0, size);
      }
    },

    toggleSwitchInModal(state, icon) {
      icon.isOn = state; // Toggle the state of the icon in the modal

      // Send the switch command based on the icon's new state
      let switchStates;
      let deviceEUI;

      if (icon.switchNumber <= 8) {
        deviceEUI = '24e124756e049564';
        this.switchStatesOutdoor1[icon.switchNumber - 1] = state;
        switchStates = this.switchStatesOutdoor1;
      } else if (icon.switchNumber <= 16) {
        deviceEUI = '24e124756e049516';
        this.switchStatesOutdoor2[icon.switchNumber - 9] = state;
        switchStates = this.switchStatesOutdoor2;
      } else if (icon.switchNumber <= 19) {
        deviceEUI = '24E124756E049454';
        this.switchStatesOutdoor3[icon.switchNumber - 17] = state;
        switchStates = this.switchStatesOutdoor3;
      }

      this.sendSwitchCommand(deviceEUI, switchStates);
      console.log(`Switch ${icon.switchNumber} toggled to ${state ? 'ON' : 'OFF'}`);

      // Sync status in relationPoints
      this.relationPoints.forEach((point) => {
        if (point.type === 'Valve' && point.label === icon.switchNumber.toString()) {
          point.status = state ? 'On' : 'Off';
        }
      });

      this.closeIconModal(); // Close the modal after toggling the switch
    },
    testValveOperation() {
      // This method simulates turning on all valves for 20 minutes
      console.log('Starting test valve operation...');

      this.setAllSwitches(true, '24e124756e049564', 1, 8);
      this.setAllSwitches(true, '24e124756e049516', 9, 16);
      this.setAllSwitches(true, '24E124756E049454', 17, 19);

      setTimeout(() => {
        console.log('Turning off all valves after 20 minutes...');
        this.setAllSwitches(false, '24e124756e049564', 1, 8);
        this.setAllSwitches(false, '24e124756e049516', 9, 16);
        this.setAllSwitches(false, '24E124756E049454', 17, 19);
      }, 20 * 60 * 1000); // 20 minutes in milliseconds
    },
    // Function to check pH values and trigger notifications
    async checkThreshold() {
      const threshold = parseFloat(localStorage.getItem('phThreshold')) || 6.5;
      const belowThresholdSensors = this.relationPoints.filter(point => point.type === 'sensor' && point.data.pH < threshold);

      if (belowThresholdSensors.length > 0) {
        belowThresholdSensors.forEach(sensor => {
          this.addNotification(`Sensor ${sensor.number} has pH below ${threshold}`);
        });
      }
    },
    // Function to add a notification with a countdown timer
    addNotification(message) {
      const notificationId = Date.now();
      this.notifications.push({
        id: notificationId,
        message,
        countdown: 60,  // 60 seconds countdown
      });
    },
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
  },
  mounted() {
    this.fetchSensorData(); // Fetch sensor data on mount

    // Schedule automatic valve operation at 7AM and 1PM
    const scheduleTimes = [
      { hour: 7, minute: 0 },
      { hour: 13, minute: 0 },
    ];

    scheduleTimes.forEach((schedule) => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(schedule.hour, schedule.minute, 0, 0);

      if (targetTime < now) {
        targetTime.setDate(targetTime.getDate() + 1); // Set to next day if the time has passed
      }

      const timeUntilOperation = targetTime.getTime() - now.getTime();
      setTimeout(() => {
        this.testValveOperation();
      }, timeUntilOperation);
    });

    // Start checking the threshold every 5 minutes
    setInterval(() => {
      this.checkThreshold();
    }, 5 * 60 * 1000); // Every 5 minutes
  },
};
</script>


<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked+.slider {
  background-color: green;
}

input:checked+.slider:before {
  transform: translateX(26px);
}

body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.link-button {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.link-button .btn {
  margin-right: 20px;
  /* Adds spacing between buttons */
  padding: 10px 20px;
  font-size: 1.25rem;
}


.container-fluid {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0;
}

.row {
  display: flex;
  justify-content: space-between;
}

.relation-section,
.map-section {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 100%;
}

.relation-view-container {
  position: relative;
  color: black;
}

.relation-image,
.map-image {
  width: 100%;
  height: auto;
  transition: transform 0.1s ease-out;
}

.relation-point {
  padding: 21px;
  /* border-radius: 50%; */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  /* background-color: grey; */
  font-weight: bold;
  position: relative;
  /* visibility: hidden; */
  color: transparent;
}

.point-number {
  font-size: 0.75rem;
  text-align: center;
}

.point-label {
  font-size: 0.6rem;
  white-space: pre-line;
  text-align: center;
  visibility: hidden;
}

.point-label-break {
  font-size: 0.5rem;
  text-align: center;
  white-space: pre-wrap;
}

.value-tooltip {
  position: absolute;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  white-space: nowrap;
  font-size: 12px;
}

.adjust-button-container {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.map-container {
  overflow: hidden;
  height: 100%;
  position: relative;
}

.icon-container {
  position: relative;
  cursor: pointer;
}

.icon-image {
  width: 24px;
  height: 24px;
  visibility: hidden;
}

.switch-number {
  position: absolute;
  bottom: -20px;
  /* Position it below the icon */
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  /* background-color: #fff; */
  padding: 2px 5px;
  border-radius: 3px;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  white-space: nowrap;
}

.status-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.online {
  background-color: green;
  border: solid white 0.5px;
}

.offline {
  background-color: red;
  border: solid white 0.5px;
}

.device-status-card {
  width: 15%;
  /* Adjust width to your needs */
  margin: 0 10px;
  /* Add margin to space out the cards */
  padding: 10px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.device-status-card h5 {
  font-size: 1.15rem;
  margin-bottom: 5px;
}

.device-status-card .status {
  font-size: 1.25rem;
  font-weight: bold;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

/* Centering Tabs */
.nav-tabs {
  justify-content: center;
}

/* Modal z-index handling */
.modal {
  z-index: 1050;
}

/* Modal and Buttons */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal.d-block {
  display: block;
}

.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  width: 500px;
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.modal-header .btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body .btn {
  margin: 10px;
}

/* Positioning Buttons on Floorplan */
.outdoor-buttons.top-left {
  top: 10px;
  left: 10px;
}

.outdoor-buttons.top-right {
  top: 10px;
  right: 10px;
}

.outdoor-buttons.bottom-left {
  bottom: 45px;
  left: 10px;
}

.outdoor-buttons {
  display: flex;
  flex-direction: column;
}

/* Toggle Switch Styles */
.toggle-switch-container {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: left;
  flex-direction: column;
  /* Align vertically */
}

.toggle-switch {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  /* Add spacing between the toggles */
}

.toggle-switch input[type="checkbox"] {
  width: 40px;
  height: 20px;
  appearance: none;
  background: #ddd;
  border-radius: 20px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-switch input[type="checkbox"]:checked {
  background: green;
}

.toggle-switch input[type="checkbox"]:before {
  content: '';
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 1px;
  transition: transform 0.3s ease;
}

.toggle-switch input[type="checkbox"]:checked:before {
  transform: translateX(20px);
}

.toggle-switch label {
  margin-left: 10px;
  font-size: 1rem;
  cursor: pointer;
}

/* Adding border to the condition text */
.border-condition {
  padding: 10px;
  border-radius: 5px;
}

/* Notification Styles */
.notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  z-index: 1060;
}

.card mb-4 {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-content {
  color: black;
}
</style>
