<template>
  <div class="container-fluid mt-5">
    <h2 class="text-center mb-4">System Overview</h2>
    <div class="view-switcher mb-4 text-center">
      <button @click="currentView = 'indoorAirQuality'" :class="{ 'active': currentView === 'indoorAirQuality' }">Indoor Air Quality System</button>
      <button @click="currentView = 'hybridAircon'" :class="{ 'active': currentView === 'hybridAircon' }">Hybrid Aircon System</button>
    </div>
    <div v-if="currentView === 'indoorAirQuality'" class="indoor-air-quality-section">
      <h4 class="text-center">Indoor Air Quality System</h4>
      <div class="row">
        <div class="col-md-6">
          <div class="relation-section">
            <h4>Sensor Detection</h4>
            <div class="sensor-detection-diagram">
              <div class="image-container">
                <img src="@/assets/IAQ Pic.jpg" alt="Relation View" class="relation-image">
                <div v-for="box in boxes" :key="box.id" class="clickable-box" @click="changeImage(box.id)" :style="{ top: box.top, left: box.left }"></div>
                <div v-for="sensor in sensors" :key="sensor.id" class="sensor-data" :style="{ top: sensor.top, left: sensor.left }">
                  <div class="sensor-row">
                    <p>CO2: {{ sensor.co2 }} ppm &nbsp; &nbsp; &nbsp; <i class="fas fa-smile smiley-green"></i></p>
                  </div>
                  <div class="sensor-row">
                    <p>PPM: {{ sensor.ppm }}</p>
                    <p>Temp: {{ sensor.temperature }}°C</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="map-section">
            <h4>Floorplan</h4>
            <div class="map-container" @mousedown="startPan" @mousemove="pan" @mouseup="endPan" @mouseleave="endPan" @wheel="onWheel">
              <img :src="currentImage" alt="Map View" class="map-image" :style="{ transform: `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)` }">
              <div class="zoom-controls">
                <button class="btn btn-secondary" @click="zoomIn">+</button>
                <button class="btn btn-secondary" @click="zoomOut">-</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentView === 'hybridAircon'" class="hybrid-aircon-section">
      <h4 class="text-center">Hybrid Aircon System</h4>
      <div class="row">
        <div class="col-md-6">
          <div class="relation-section">
            <h4>Sensor Detection</h4>
            <div class="sensor-detection-diagram">
              <img src="@/assets/Hybrid Aircon Algo.png" alt="Relation View" class="relation-image">
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-md-3" v-for="device in devices" :key="device.id">
          <div class="device-status-card">
            <h5>{{ device.name }}</h5>
            <p class="status" :class="{ 'text-success': device.isOnline, 'text-danger': !device.isOnline }">{{ device.isOnline ? 'Online' : 'Offline' }}</p>
            <p>Type: {{ device.type }}</p>
          </div>
        </div>
      </div>
      <div class="condition mt-4 text-center">
        <p>If Indoor Air Quality Sensor on acceptable CO2 Level, Motorized Dampener turned off and Fresh Air Fan turn off, else both turned on.</p>
      </div>
      <div class="switch-buttons mt-4 text-center">
        <button @click="setAllSwitches(true)" class="btn btn-primary">ON ALL BUTTON</button>
        <button @click="setAllSwitches(false)" class="btn btn-danger">OFF ALL BUTTON</button>
        <button v-for="n in 8" :key="n" @click="toggleSwitch(n)" :class="{ 'btn-success': switchStates[n - 1], 'btn-secondary': !switchStates[n - 1] }" class="btn">SWITCH {{ n }} {{ switchStates[n - 1] ? 'ON' : 'OFF' }}</button>
      </div>
      <div class="aircon-buttons mt-4 text-center">
        <button @click="setAirconState(true, 1)" class="btn btn-primary">ON Aircon 1</button>
        <button @click="setAirconState(false, 1)" class="btn btn-danger">OFF Aircon 1</button>
        <button @click="setAirconState(true, 2)" class="btn btn-primary">ON Aircon 2</button>
        <button @click="setAirconState(false, 2)" class="btn btn-danger">OFF Aircon 2</button>
        <button @click="setAirconState(true, 3)" class="btn btn-primary">ON Aircon 3</button>
        <button @click="setAirconState(false, 3)" class="btn btn-danger">OFF Aircon 3</button>
        <button @click="setAirconState(true, 4)" class="btn btn-primary">ON Aircon 4</button>
        <button @click="setAirconState(false, 4)" class="btn btn-danger">OFF Aircon 4</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Floorplan1 from '@/assets/Sub System and Icons/V2/B05-07_Smart_IAQ_systems_V2.jpg';
import Floorplan2 from '@/assets/Sub System and Icons/V2/B05-08_Smart_IAQ_system_V2.jpg';
import Floorplan3 from '@/assets/Sub System and Icons/V2/B05-09_Smart_IAQ_System_V2.jpg';
import Floorplan4 from '@/assets/Sub System and Icons/V2/B05-11-12_Hybrid Aircon System.jpg';
import Floorplan5 from '@/assets/Sub System and Icons/V2/B05 13-14_IAQ system.jpg';
import Floorplan6 from '@/assets/Sub System and Icons/V2/B05 15-16_ IAQ_system.jpg';
import Floorplan7 from '@/assets/Sub System and Icons/V2/B05-18_Smart_IAQ_system.jpg';

export default {
  name: 'SystemOverview',
  data() {
    return {
      currentView: 'indoorAirQuality',
      currentImage: Floorplan4,
      selectedFloorplan: 1,
      floorplans: [
        { id: 1, name: '11', image: Floorplan4 },
        { id: 2, name: '12', image: Floorplan4 },
        { id: 3, name: '13/14', image: Floorplan5 },
        { id: 4, name: '15/16', image: Floorplan6 },
        { id: 5, name: '18', image: Floorplan7 },
        { id: 6, name: '7', image: Floorplan1 },
        { id: 7, name: '8', image: Floorplan2 },
        { id: 8, name: '9', image: Floorplan3 }
      ],
      sensors: [
        { id: 1, name: 'B05-11', co2: 400, temperature: 22, ppm: 800, top: '39%', left: '11.4%' },
        { id: 2, name: 'B05-12', co2: 410, temperature: 23, ppm: 810, top: '39%', left: '32%' },
        { id: 3, name: 'B05-13/14', co2: 420, temperature: 24, ppm: 820, top: '39%', left: '53%' },
        { id: 4, name: 'B05-15/16', co2: 430, temperature: 25, ppm: 830, top: '39%', left: '73.5%' },
        { id: 5, name: 'B05-18', co2: 440, temperature: 26, ppm: 840, top: '86%', left: '11.4%' },
        { id: 6, name: 'B05-07', co2: 450, temperature: 27, ppm: 850, top: '86%', left: '32%' },
        { id: 7, name: 'B05-08', co2: 460, temperature: 28, ppm: 860, top: '86%', left: '53%' },
        { id: 8, name: 'B05-09', co2: 470, temperature: 29, ppm: 870, top: '86%', left: '73.5%' }
      ],
      boxes: [
        { id: 1, top: '26%', left: '19%' },
        { id: 2, top: '26%', left: '40%' },
        { id: 3, top: '26%', left: '61%' },
        { id: 4, top: '26%', left: '81%' },
        { id: 5, top: '74%', left: '19%' },
        { id: 6, top: '74%', left: '40%' },
        { id: 7, top: '74%', left: '61%' },
        { id: 8, top: '74%', left: '81%' }
      ],
      devices: [
        { id: 1, name: 'Indoor Air Quality Sensor', type: 'Indoor Air Quality Sensor', isOnline: true, lastUpdated: '2024-05-29 14:30:00' },
        { id: 3, name: 'Air-Con System', type: 'Air-Con System', isOnline: true, lastUpdated: '2024-05-29 14:30:00' },
        { id: 6, name: 'Motorized Dampener', type: 'Motorized Dampener', isOnline: true, lastUpdated: '2024-05-29 14:30:00' },
        { id: 8, name: 'Fresh Air Fan', type: 'Fresh Air Fan', isOnline: true, lastUpdated: '2024-05-29 14:30:00' }
      ],
      zoomLevel: 1,
      translateX: 0,
      translateY: 0,
      isPanning: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      animationFrame: null,
      switchStates: [0, 0, 0, 0, 0, 0, 0, 0], // Initial switch states (all off)
      airconData: [], // Data for aircon icons
      airconBoxes: [
        { top: '20%', left: '20%' },
        { top: '40%', left: '40%' },
        { top: '60%', left: '60%' },
        { top: '80%', left: '80%' }
      ], // Positions for aircon boxes
      tooltip: {
        visible: false,
        top: '0px',
        left: '0px'
      }
    };
  },
  mounted() {
    this.fetchAirconData();
  },
  methods: {
    async fetchAirconData() {
      try {
        const response = await axios.get('https://aircon-api.rshare.io/aircon/read/1');
        this.airconData = response.data.registers;
      } catch (error) {
        console.error('Error fetching aircon data:', error);
      }
    },
    showTooltip(index, event) {
      console.log('Hovering on box:', index);
      this.tooltip.visible = true;
      this.tooltip.top = `${event.clientY + 10}px`;
      this.tooltip.left = `${event.clientX + 10}px`;
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
    },
    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1);
    },
    onWheel(event) {
      event.preventDefault();
      const delta = Math.sign(event.deltaY) * -0.1;
      this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, 1), 2);
    },
    startPan(event) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    },
    pan(event) {
      if (!this.isPanning) return;

      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;

      this.lastX = event.clientX;
      this.lastY = event.clientY;

      this.translateX += dx / this.zoomLevel;
      this.translateY += dy / this.zoomLevel;

      if (!this.animationFrame) {
        this.animationFrame = requestAnimationFrame(this.updatePan);
      }
    },
    updatePan() {
      this.$forceUpdate();
      this.animationFrame = null;
    },
    endPan() {
      this.isPanning = false;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    },
    getCurrentFloorplanImage(id) {
      const floorplan = this.floorplans.find(fp => fp.id === id);
      return floorplan ? floorplan.image : '';
    },
    async sendSwitchCommand(deviceEUI, switchStates) {
      try {
        await axios.post('https://hammerhead-app-kva7n.ondigitalocean.app/command/ws558', {
          deviceEui: deviceEUI,
          switchStates: switchStates
        });
        console.log('Switch command sent successfully');
        console.log('Current switch states:', switchStates);
      } catch (error) {
        console.error('Error sending switch command:', error);
      }
    },
    async sendAirconCommand(state, airconId) {
      try {
        await axios.post(`https://aircon-api.rshare.io/aircon/1`, {
          state: state ? 'on' : 'off'
        });
        console.log(`Aircon ${airconId} turned ${state ? 'on' : 'off'} successfully`);
      } catch (error) {
        console.error(`Error turning aircon ${airconId} ${state ? 'on' : 'off'}:`, error);
      }
    },
    setAllSwitches(state) {
      const switchStates = Array(8).fill(state ? 1 : 0);
      this.switchStates = switchStates;
      this.sendSwitchCommand("24E124756E049153", switchStates);
    },
    toggleSwitch(index) {
      // Toggle the specified switch state
      this.switchStates = this.switchStates.map((state, idx) => (idx === index - 1 ? (state ? 0 : 1) : state));
      this.sendSwitchCommand("24E124756E049153", this.switchStates);
    },
    setAirconState(state, airconId) {
      this.sendAirconCommand(state, airconId);
    },
    changeImage(boxId) {
      const floorplan = this.floorplans.find(fp => fp.id === boxId);
      if (floorplan) {
        this.currentImage = floorplan.image;
      }
    }
  }
};
</script>

<style scoped>
.container-fluid {
  width: 100%;
  padding: 2rem;
  margin-bottom: 5rem;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
}

.view-switcher button {
  background-color: #f8f9fa;
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.view-switcher button.active {
  background-color: #007bff;
  color: white;
}

.row {
  display: flex;
  justify-content: space-between;
}

.relation-section,
.map-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 100%;
}

.relation-image,
.map-image {
  width: 100%;
  height: auto;
  transition: transform 0.1s ease-out;
}

.map-container {
  overflow: hidden;
  height: 100%;
  position: relative;
  cursor: grab;
}

.map-container:active {
  cursor: grabbing;
}

.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
}

.zoom-controls .btn {
  margin: 2px 0;
}

.condition p {
  font-size: 1.2rem;
  font-weight: bold;
}

.device-status-card {
  background-color: #e9f7fd;
  padding: 15px;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.device-status-card h5 {
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.device-status-card .status {
  font-size: 1.5rem;
  font-weight: bold;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.hybrid-aircon-section .row {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  /* Full height of the parent container */
}

.hybrid-aircon-section .relation-section {
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.image-container {
  position: relative;
}

.system-image {
  width: 100%;
  height: auto;
}

.sensor-data {
  position: absolute;
  padding: 10px;
  color: black;
  border-radius: 5px;
  text-align: left;
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
}

.sensor-row {
  display: flex;
  justify-content: space-between;
}

.sensor-data p {
  margin: 0;
}

.happy-face i {
  font-size: 1.5rem;
  color: #28a745;
}

.smiley-green {
  font-size: 1rem;
  color: #28a745;
  /* Green color for the smiley face */
}

.switch-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.switch-buttons button {
  min-width: 100px;
}

.aircon-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.aircon-buttons button {
  min-width: 150px;
}

.clickable-box {
  width: 155px;
  height: 209px;
  cursor: pointer;
  position: absolute;
  transform: translate(-50%, -50%);
}

.aircon-box {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: rgba(0, 123, 255, 0.5);
  border: 1px solid #007bff;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  pointer-events: none;
  white-space: nowrap;
}
</style>
