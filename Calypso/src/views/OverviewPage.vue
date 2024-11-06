<template>
  <div class="overview-container">

    <!-- Title and Announcement Bar -->
    <div class="container-fluid title-bar">
      <div class="row align-items-center">
        <div class="col-12 text-end">
          <!-- Announcement bar with static and scrolling text -->
          <div class="announcement-bar" @click="openMessageModal">
            <!-- Left 20% Blue Section for Announcement Label -->
            <div class="announcement-label">
              Announcements
            </div>

            <!-- Right 80% Static Background with Scrolling Text -->
            <div class="scrolling-container">
              <div class="scrolling-text">
                {{ latestAnnouncement }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal for announcements -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Announcements</h2>
        <span class="modal-close" @click="closeModal">&times;</span>

        <!-- Display announcements or "No news currently" if empty -->
        <div class="messages-container">
          <div v-if="messages.length === 0" class="no-news">
            No news currently
          </div>
          <div v-for="(message, index) in messages" :key="index" class="message-item">
            <div class="message-details">
              <p>{{ message.message }}</p>
              <small>{{ message.time }}</small>
            </div>
            <!-- Add delete button aligned to the right -->
            <button class="delete-button" @click="removeMessage(index)">Delete</button>
          </div>
        </div>

        <!-- Input field and save button at the bottom -->
        <div class="message-input-section">
          <input v-model="newMessage" placeholder="Enter your message" class="input-field" />
          <button @click="saveMessage">Save Message</button>
        </div>
      </div>
    </div>


    <!-- Map Hierarchy Moved to the Top -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="map-hierarchy">
            <div class="map-content">
              <div class="image-container">
                <img src="@/assets/V3/B05V3.png" alt="ITE East Floor Plan" class="img-fluid w-100">

                <!-- Manually Positioned Boxes on Top of the Image -->
                <div class="box" id="box1" @click="goToPageBox('box1')">Box 1</div>
                <div class="box" id="box2" @click="goToPageBox('box2')">Box 2</div>
                <div class="box" id="box3" @click="goToPageBox('box3')">Box 3</div>
                <div class="box" id="box4" @click="goToPageBox('box4')">Box 4</div>
                <div class="box" id="box5" @click="goToPageBox('box5')">Box 5</div>
                <div class="box" id="box6" @click="goToPageBox('box6')">Box 6</div>
                <div class="box" id="box7" @click="goToPageBox('box7')">Box 7</div>
                <div class="box" id="box8" @click="goToPageBox('box8')">Box 8</div>
                <div class="box" id="box9" @click="goToPageBox('box9')">Box 9</div>
                <div class="box" id="box10" @click="goToPageBox('box10')">Box 10</div>
                <div class="box" id="box11" @click="goToPageBox('box11')">Box 11</div>
                <div class="box" id="box12" @click="goToPageBox('box12')">Box 12</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="summary-be">
      <h3>System Healthcheck</h3>
      <div class="summary-content">
        <div class="progress-bars">
          <div v-for="(progress, index) in progressData" :key="index" class="progress-bar-container">
            <CircularProgressBar :percentage="progress.value" :label="progress.label" />
          </div>
        </div>
      </div>
    </div> -->

    <!-- Subsystems Section -->
    <div class="subsystems-container">
      <div class="subsystems-title">
        <h2>ROOMS</h2>
      </div>
      <div class="subsystems-content">
        <div v-for="(subsystem, index) in displayedSubsystems" :key="index" class="subsystem-card">
          <div class="subsystem-header">
            <!-- Title and Room Number -->
            <span class="subsystem-title">{{ subsystem.name }}</span>
            <div class="subsystem-info">
              <span class="subsystem-room">{{ subsystem.room }}</span>
              <!-- Dynamic status icon -->
              <div class="face-display" style="display: flex; align-items: center;">
                <i :class="getOverallFaceClass(subsystem)"></i>
              </div>
            </div>
          </div>
          <button class="go-button" @click="goToPage(subsystem.link)">Go</button>
        </div>
      </div>
    </div>


    <div class="additional-cards">
      <div class="additional-card auto-scroll-feed">
        <h4>Alarm & Notification</h4>
        <router-link to="/alarms-notifications" class="view-all-link">View All</router-link>
        <div class="feed-wrapper">
          <div class="feed-content">
            <div v-if="feedData.length === 0" class="no-feed">
              No feed to display
            </div>
            <div v-else v-for="(feed, index) in feedData" :key="index" class="feed-item">
              <p>{{ feed.message }}</p>
              <small>{{ feed.timestamp }}</small>
            </div>
          </div>
        </div>
      </div>
      <div class="additional-card quick-links">
        <h4>Fault Call / Ticket</h4>
        <router-link to="/quick-links" class="view-all-link">View All</router-link>
        <div class="links-content">
          <!-- Table Headers -->
          <div class="fault-row fault-header">
            <span class="fault-column">ID</span>
            <span class="fault-column">Description</span>
            <span class="fault-column">Status</span>
          </div>
          <!-- Iterate over the faults and render each one -->
          <div v-for="(fault, index) in faults" :key="index" :class="['fault-row', getFaultClass(fault.latest_status)]">
            <span class="fault-column">{{ fault.fault_number }}</span>
            <span class="fault-column">{{ fault.trade_name }}</span>
            <span class="fault-column">{{ fault.latest_status ? fault.latest_status : 'Pending' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import SemiCircleProgressBar from '@/components/SemiCircleProgressBar.vue';
// import CircularProgressBar from '@/components/CircularProgressBar.vue';
import axios from 'axios';

export default {
  name: 'OverviewPage',
  components: {
    // SemiCircleProgressBar,
    // CircularProgressBar,
  },
  data() {
    return {
      sensorData: {},
      announcementIndex: 0, // Add this to track the current announcement index
      semsData: [], // Store SEMS sensor data
      allSEMSSensorsWorking: false, // Flag to indicate if all SEMS sensors are working
      spcsData: [], // Store SPCS sensor data
      allSPCSSensorsWorking: false, // Flag to indicate if all SPCS sensors are working
      swsData: [], // Store Smart Washroom sensor data
      allSWSSensorsWorking: false, // Flag to indicate if all SWS sensors are working
      atData: [], // Store Asset Tagging sensor data
      allATSensorsWorking: false, // Flag to indicate if all AT sensors are working
      bmsData: [], // Store BMS sensor data
      allBMSSensorsWorking: false, // Flag to indicate if all sensors are working
      fasSensors: [], // Store FAS sensor data
      allSensorsWorking: false, // Flag to indicate if all sensors are working
      newMessage: '', // Holds the input message
      messages: [], // Stores messages
      isModalVisible: false, // Controls modal visibility
      selectedTitle: '', // Holds the title of the clicked room
      selectedArea: null,
      currentPage: 0, // Index for the current page of sub-systems
      currentFireAlarmIndex: 0,
      currentIAQDeviceIndex: 0,
      currentPowerMeterIndex: 0,
      currentWaterMeterIndex: 0,
      currentSmartLandscapeIndex: 0,
      currentSmartToiletIndex: 0,
      currentBMSIndex: 0,
      currentSmartPestControlIndex: 0,
      currentSmartSecurityIndex: 0,
      currentSmartLightingIndex: 0,
      currentHybridAirIndex: 0,
      faults: [], // Store fault data
      progressData: [
        { label: 'Air Quality', value: 100 },
        { label: 'Device Operational', value: 100 },
      ],
      subsystemData: [
        { name: 'Command Centre (Area E)', type: 'semi-circle', operational: 100, link: '/integrated-operation-centre', room: '01', deviceId: '24e124710d480176' },
        { name: 'HOT Room', type: 'semi-circle', operational: 100, link: '/ice-room', room: '02', deviceId: '24e124710d480413' },
        { name: 'Transport Room (Area F)', type: 'semi-circle', operational: 100, link: '/smart-vertical-transport-room', room: '03', deviceId: '24e124710d480081' },
        { name: 'Horizontal Transport Room', type: 'semi-circle', operational: 100, link: '/vertical-transport-room', room: '04', deviceId: '24e124710d481996' },
        { name: 'WSH Room', type: 'semi-circle', operational: 100, link: '/wsh-room', room: '05', deviceId: '24e124710d480413' },
        { name: 'Thinking Centre', type: 'semi-circle', operational: 100, link: '/collaborative-design-centre-07', room: '07', deviceId: '24e124710d482090' },
        { name: 'Thinking Centre', type: 'semi-circle', operational: 100, link: '/collaborative-design-centre-08', room: '08', deviceId: '24e124710d482388' },
        { name: 'Thinking Centre', type: 'semi-circle', operational: 100, link: '/collaborative-design-centre-09', room: '09', deviceId: '24e124710d482648' },
        { name: 'Smart Washroom', type: 'semi-circle', operational: 100, link: '/smart-washroom-room', room: 'Washroom', deviceId: null },
        { name: 'Smart Landscape', type: 'semi-circle', operational: 100, link: '/smart-landscape-room', room: 'Landscape', deviceId: null },
      ],

      fireAlarms: [
        { name: 'Fire Alarm System Overview', operational: 100 },
        { name: 'SAP-1', status: 'Online', lastUpdated: '2024-05-29 14:30:00' },
        { name: 'SAP-2', status: 'Offline', lastUpdated: '2024-05-29 14:20:00' },
        { name: 'SAP-3', status: 'Online', lastUpdated: '2024-05-29 14:25:00' },
        { name: 'SAP-4', status: 'Online', lastUpdated: '2024-05-29 14:15:00' },
        { name: 'SAP-5', status: 'Online', lastUpdated: '2024-05-29 14:35:00' },
        { name: 'SAP-6', status: 'Online', lastUpdated: '2024-05-29 14:10:00' },
      ],
      iaqDevices: [
        { name: 'Smart Air Quality System Overview', operational: 100 },
        { name: 'Device 1', status: 'Online', avgTemp: 23.0, avgHumidity: 65.0, avgPressure: 1009.0, avgCO2: 440.0 },
        { name: 'Device 2', status: 'Online', avgTemp: 24.0, avgHumidity: 64.0, avgPressure: 1008.0, avgCO2: 450.0 },
      ],
      powerMeters: [
        { name: 'Smart Energy Management System Overview', operational: 100 },
        { name: 'Power Meter 1', status: 'Online', avgKwh: 59.13, totalKwh: 531.67 },
        { name: 'Power Meter 2', status: 'Online', avgKwh: 60.00, totalKwh: 600.00 },
      ],
      waterMeters: [
        { name: 'Asset Tagging System Overview', operational: 100 },
        { name: 'Water Meter 1', status: 'Online', avgFlowRate: 12.18, avgUsage: 420.0, avgPressure: 100.5, avgTemperature: 20.32 },
        { name: 'Water Meter 2', status: 'Online', avgFlowRate: 13.00, avgUsage: 430.0, avgPressure: 101.0, avgTemperature: 21.00 },
      ],
      smartLandscape: [
        { name: 'Smart Landscape Overview', operational: 100 },
        { name: 'Landscape-1', status: 'Online', lastUpdated: '2024-05-29 14:30:00' },
        { name: 'Landscape-2', status: 'Offline', lastUpdated: '2024-05-29 14:20:00' },
        { name: 'Landscape-3', status: 'Online', lastUpdated: '2024-05-29 14:25:00' },
        { name: 'Landscape-4', status: 'Online', lastUpdated: '2024-05-29 14:15:00' },
      ],
      smartToilet: [
        { name: 'Smart Washroom System Overview', operational: 100 },
        { name: 'Toilet-1', status: 'Online', lastUpdated: '2024-05-29 14:30:00' },
        { name: 'Toilet-2', status: 'Offline', lastUpdated: '2024-05-29 14:20:00' },
        { name: 'Toilet-3', status: 'Online', lastUpdated: '2024-05-29 14:25:00' },
        { name: 'Toilet-4', status: 'Online', lastUpdated: '2024-05-29 14:15:00' },
      ],
      bms: [
        { name: 'Building Management System (JCS) Overview', operational: 100 },
        { name: 'BMS-1', connection: 'OK', value: '27.03 °C', date: '06/23/2024 5:06:39 PM' },
        { name: 'BMS-2', connection: 'N/A', value: 'N/A', date: '06/23/2024 5:06:39 PM' },
        { name: 'BMS-3', connection: 'OK', value: '27.77 °C', date: '06/23/2024 5:06:39 PM' },
      ],
      smartPestControl: [
        { name: 'Smart Pest Control System Overview', operational: 100 },
        { name: 'Pest-1', status: 'Online', lastUpdated: '2024-05-29 14:30:00' },
        { name: 'Pest-2', status: 'Offline', lastUpdated: '2024-05-29 14:20:00' },
        { name: 'Pest-3', status: 'Online', lastUpdated: '2024-05-29 14:25:00' },
        { name: 'Pest-4', status: 'Online', lastUpdated: '2024-05-29 14:15:00' },
        { name: 'Pest-5', status: 'Online', lastUpdated: '2024-05-29 14:35:00' },
        { name: 'Pest-6', status: 'Online', lastUpdated: '2024-05-29 14:10:00' },
      ],
      smartSecurity: [
        { name: 'Smart Security System Overview', operational: 100 },
        { name: 'Security-1', status: 'Online', lastUpdated: '2024-05-29 14:30:00' },
        { name: 'Security-2', status: 'Offline', lastUpdated: '2024-05-29 14:20:00' },
        { name: 'Security-3', status: 'Online', lastUpdated: '2024-05-29 14:25:00' },
        { name: 'Security-4', status: 'Online', lastUpdated: '2024-05-29 14:15:00' },
        { name: 'Security-5', status: 'Online', lastUpdated: '2024-05-29 14:35:00' },
        { name: 'Security-6', status: 'Online', lastUpdated: '2024-05-29 14:10:00' },
      ],
      smartLighting: [
        { name: 'Smart Lighting System Overview', operational: 100 },
        { name: 'Lighting-1', status: 'Online', lastUpdated: '2024-05-29 14:30:00' },
        { name: 'Lighting-2', status: 'Offline', lastUpdated: '2024-05-29 14:20:00' },
        { name: 'Lighting-3', status: 'Online', lastUpdated: '2024-05-29 14:25:00' },
        { name: 'Lighting-4', status: 'Online', lastUpdated: '2024-05-29 14:15:00' },
      ],
      hybridAir: [
        { name: 'Hybrid Air System Overview', operational: 100 },
        { name: 'Air-1', status: 'Online', lastUpdated: '2024-05-29 14:30:00' },
        { name: 'Air-2', status: 'Offline', lastUpdated: '2024-05-29 14:20:00' },
        { name: 'Air-3', status: 'Online', lastUpdated: '2024-05-29 14:25:00' },
        { name: 'Air-4', status: 'Online', lastUpdated: '2024-05-29 14:15:00' },
      ],
      feedData: [
        { message: 'Fire Alarm SAP-2 is offline.', time: '2024-06-22 14:30:00' },
        { message: 'AHU-1 temperature record high: 28°C.', time: '2024-06-22 13:45:00' },
        { message: 'IAQ Device 1 CO2 level high: 800 ppm.', time: '2024-06-22 12:00:00' },
        { message: 'Water Meter 1 usage high: 500 L.', time: '2024-06-22 11:15:00' },
        { message: 'Power Meter 2 voltage low: 210V.', time: '2024-06-22 10:30:00' },
      ],
      quickLinks: [
        { label: '#0010 – Asset Missing [Clear]', status: 'clear' },
        { label: '#0012 – Toilet Leakage', status: 'leakage' },
        { label: '#0013 – Aircon Dusty [Clear]', status: 'clear' }
      ],
    };
  },
  computed: {
    // Get the current announcement based on the index
    latestAnnouncement() {
      if (this.messages.length > 0) {
        return this.messages[this.announcementIndex].message;
      }
      return null; // Return null if no messages exist
    },
    displayedSubsystems() {
      // Display 4 subsystems per page
      const start = this.currentPage * 10;
      return this.subsystemData.slice(start, start + 10);
    },
    totalPages() {
      return Math.ceil(this.subsystemData.length / 5);
    }
  },
  mounted() {
    this.loadMessages();  // Load stored messages on component mount
    this.fetchFASData();  // Fetch the FAS data when the component mounts
    this.startAnnouncementLoop(); // Start the announcement loop
    this.fetchSensorData();
  },
  methods: {
    loadAlerts() {
      const storedAlerts = JSON.parse(localStorage.getItem('alerts')) || [];
      this.feedData = storedAlerts;
    },
    async fetchSensorData() {
      try {
        const response = await axios.get('https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/sheet/IAQ');
        this.sensorData = response.data;
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    },
    getOverallFaceClass(subsystem) {
      const roomID = this.getRoomID(subsystem.room);
      const data = this.sensorData[roomID];

      if (data) {
        const thresholds = {
          co2: { goodLimit: 1000, badLimit: 1500 },
          temperature: { goodLimit: 25.5, badLimit: 27.5 },
          humidity: { goodLimit: 70, badLimit: 71 },
          pm2_5: { goodLimit: 35, badLimit: 75 },
          pm10: { goodLimit: 100, badLimit: 150 }
        };

        let worstClass = 'fas fa-smile modal-face-icon'; // Default to happy

        for (const [key, limits] of Object.entries(thresholds)) {
          if (data[key] >= limits.goodLimit && data[key] < limits.badLimit) {
            worstClass = 'fas fa-meh text-warning modal-face-icon'; // Update to neutral if within bad range
          }
          if (data[key] >= limits.badLimit) {
            worstClass = 'fas fa-frown text-danger modal-face-icon'; // Update to sad if beyond bad limit
          }
        }

        return worstClass;
      }

      return 'fas fa-smile modal-face-icon'; // Default when no data is available
    },
    getRoomID(room) {
      const roomMap = {
        'B05-11': '24e124710d480176',
        'B05-12': '24e124710d480413',
        'B05-07': '24e124710d482090',
        'B05-08': '24e124710d482388',
        'B05-09': '24e124710d482648',
        'B05-13/14': '24e124710d480081',
        'B05-15/16': '24e124710d481996',
        'B05-18': '24e124710d480413',
      };
      return roomMap[room] || null;
    },
    // Remove a message at a specific index
    removeMessage(index) {
      this.messages.splice(index, 1);
      localStorage.setItem('announcements', JSON.stringify(this.messages));
    },
    async fetchSEMSData() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/api/Mqtt/data/latest');
        const data = await response.json();

        // Log the fetched data
        console.log('Fetched SEMS Data:', data);

        // Store the fetched data in the component's state
        this.semsData = data;

        // Check if all SEMS sensors are working
        this.checkSEMSSensors();
      } catch (error) {
        console.error('Error fetching SEMS data:', error);
      }
    },
    checkSEMSSensors() {
      // Check if any sensor has an empty meterSN
      const faultySensor = this.semsData.some(sensor => {
        return !sensor.meterSN; // If meterSN is empty or undefined, it's considered faulty
      });

      // If there are no faulty sensors, set the flag to true
      this.allSEMSSensorsWorking = !faultySensor;
    },
    async fetchSPCSData() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/sheet/Magnetic');
        const data = await response.json();

        console.log('Fetched SPCS Data:', data); // Log the fetched data

        // Store the fetched data (use Object.values to convert the object into an array)
        this.spcsData = Object.values(data);

        this.checkSPCSSensors(); // Call the method to check sensor status
      } catch (error) {
        console.error('Error fetching SPCS data:', error);
      }
    },

    checkSPCSSensors() {
      console.log('SPCS Sensor Data:', this.spcsData); // Log the sensor data for debugging

      const faultySensor = this.spcsData.some(sensor => {
        const battery = parseInt(sensor.battery); // Ensure battery is parsed as an integer
        console.log(`Checking battery for ${sensor.deviceName}: ${battery}`); // Log the battery value
        return battery === 0; // Check if the battery is 0
      });

      this.allSPCSSensorsWorking = !faultySensor; // Set the status based on sensor battery levels
      console.log('All SPCS Sensors Working:', this.allSPCSSensorsWorking); // Log the final result
    },
    async fetchSWSData() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/toilet');
        const data = await response.json();

        console.log('Fetched SWS Data:', data); // Log the fetched SWS data

        // Store the fetched data
        this.swsData = Object.values(data);

        // Check battery levels for each sensor
        this.checkSWSSensors();
      } catch (error) {
        console.error('Error fetching SWS data:', error);
      }
    },
    checkSWSSensors() {
      console.log('Checking SWS Sensors:', this.swsData);

      // Ensure battery is checked as a number, not a string
      const faultySensor = this.swsData.some(sensor => {
        console.log(`Sensor ${sensor.deviceName} has battery ${sensor.battery}`);
        return parseInt(sensor.battery) === 0; // Convert battery to number to avoid issues
      });

      console.log('Faulty Sensor:', faultySensor);

      // Set the status based on whether any faulty sensor is found
      this.allSWSSensorsWorking = !faultySensor;
    },
    async fetchATData() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/api/AssetTagging/data');
        const data = await response.json();

        console.log('Fetched AT Data:', data); // Log the fetched AT data

        // Ensure the data exists and has a 'data' array
        if (data && Array.isArray(data.data)) {
          this.atData = data.data;
        } else {
          console.warn('No valid AT data found.');
          this.atData = [];
        }

        this.checkATSensors(); // Check if all AT sensors have valid readings
      } catch (error) {
        console.error('Error fetching AT data:', error);
      }
    },

    checkATSensors() {
      console.log('Checking AT Sensors:', this.atData); // Log the AT sensor data

      // Ensure atData is an array before proceeding
      if (!Array.isArray(this.atData) || this.atData.length === 0) {
        this.allATSensorsWorking = false; // Assume sensors are faulty if none are available
        return;
      }

      const faultySensor = this.atData.some(sensor => {
        console.log('Checking AT sensor:', sensor); // Log each sensor being checked
        // Check if any sensor has an invalid RSSI or battery voltage
        return sensor.batt_vol < 2900;
      });

      console.log('Faulty Sensor:', faultySensor); // Log whether a faulty sensor was found

      // If there are no faulty sensors, set the flag to true
      this.allATSensorsWorking = !faultySensor;
    },
    async fetchBMSData() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/all/east/latest/data');
        const data = await response.json();

        console.log('Fetched BMS Data:', data); // Log the fetched BMS data

        // Ensure the data is an array
        if (Array.isArray(data)) {
          this.bmsData = data;
        } else {
          console.warn('No valid BMS data found.');
          this.bmsData = [];
        }

        this.checkBMSSensors(); // Check if all BMS sensors have valid readings
      } catch (error) {
        console.error('Error fetching BMS data:', error);
      }
    },

    checkBMSSensors() {
      console.log('Checking BMS Sensors:', this.bmsData); // Log the BMS sensor data

      // Ensure bmsData is an array before proceeding
      if (!Array.isArray(this.bmsData) || this.bmsData.length === 0) {
        this.allBMSSensorsWorking = false; // Assume sensors are faulty if none are available
        return;
      }

      const faultySensor = this.bmsData.some(sensor => {
        console.log('Checking BMS sensor:', sensor); // Log each sensor being checked
        // Check if any sensor has an invalid status or a null/invalid value
        return sensor.status !== 'OK' || sensor.value === null || sensor.value === undefined || sensor.value === 0;
      });

      console.log('Faulty Sensor:', faultySensor); // Log whether a faulty sensor was found

      // If there are no faulty sensors, set the flag to true
      this.allBMSSensorsWorking = !faultySensor;
    },
    async fetchFASData() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/api/FireAlarm/data/latest');
        const data = await response.json();

        console.log('Fetched FAS Data:', data); // Log the entire API response

        // Ensure that sensors exist and are an array
        if (data && Array.isArray(data.sensors)) {
          this.fasSensors = data.sensors;
        } else {
          console.warn('No valid sensor data found.');
          this.fasSensors = []; // Set to an empty array if no valid sensors
        }

        this.checkAllSensors(); // Check if all sensors have valid readings
      } catch (error) {
        console.error('Error fetching FAS data:', error);
      }
    },
    checkAllSensors() {
      console.log('FAS Sensors:', this.fasSensors); // Log the fetched sensor data
      const faultySensor = this.fasSensors.some(sensor => {
        console.log('Checking sensor:', sensor); // Log each sensor being checked
        return sensor.status === null || sensor.status === '' || (sensor.status !== 'ON' && sensor.status !== 'OFF');
      });
      console.log('Faulty Sensor:', faultySensor); // Log whether a faulty sensor was found

      this.allSensorsWorking = !faultySensor;
    },
    openMessageModal() {
      console.log('Opening Modal'); // Add this for debugging
      this.isModalVisible = true;
    },
    // Save the message along with the current time
    // Save the message along with the current time
    saveMessage() {
      if (this.newMessage.trim() !== '') {
        const messageObj = {
          message: this.newMessage,
          time: new Date().toLocaleString(),
        };

        // Save the message to messages array
        this.messages.push(messageObj);

        // Save the messages array to localStorage
        localStorage.setItem('announcements', JSON.stringify(this.messages));

        // Clear the input field after saving
        this.newMessage = '';
      }
    },

    // Method to load messages from localStorage
    loadMessages() {
      const storedMessages = localStorage.getItem('announcements');
      if (storedMessages) {
        this.messages = JSON.parse(storedMessages);
      }
    },

    // Method to start looping through the announcements
    startAnnouncementLoop() {
      setInterval(() => {
        if (this.messages.length > 1) {
          this.announcementIndex = (this.announcementIndex + 1) % this.messages.length; // Cycle through the messages
        }
      }, 10000); // Change every 5 seconds, you can adjust the time
    },

    goToPageBox(box) {
      switch (box) {
        case 'box1':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=92', '_blank');
          break;
        case 'box2':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=107', '_blank');
          break;
        case 'box3':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=94', '_blank');
          break;
        case 'box5':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=93', '_blank');
          break;
        case 'box6':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=91', '_blank');
          break;
        case 'box7':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=99', '_blank');
          break;
        case 'box8':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=98', '_blank');
          break;
        case 'box9':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=97', '_blank');
          break;
        case 'box10':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=95', '_blank');
          break;
        case 'box11':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=96', '_blank');
          break;
        case 'box12':
          window.open('https://visualizer-lite-html.vercel.app/?site=23&levels=106', '_blank');
          break;
        default:
          console.log('No action for this box.');
          break;
      }
    },
    goToPage(link) {
      this.$router.push(link);
    },
    showModal(title) {
      this.selectedTitle = title;
      this.isModalVisible = true;
    },
    // Function to close the modal
    closeModal() {
      this.isModalVisible = false;
    },
    scrollLeft() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    },
    scrollRight() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
      }
    },
    prevItem(subsystemName) {
      switch (subsystemName) {
        case 'Fire Alarm System Overview':
          if (this.currentFireAlarmIndex > 0) {
            this.currentFireAlarmIndex--;
          }
          break;
        case 'Smart Air Quality System Overview':
          if (this.currentIAQDeviceIndex > 0) {
            this.currentIAQDeviceIndex--;
          }
          break;
        case 'Smart Energy Management System Overview':
          if (this.currentPowerMeterIndex > 0) {
            this.currentPowerMeterIndex--;
          }
          break;
        case 'Asset Tagging System Overview':
          if (this.currentWaterMeterIndex > 0) {
            this.currentWaterMeterIndex--;
          }
          break;
        case 'Smart Landscape Overview':
          if (this.currentSmartLandscapeIndex > 0) {
            this.currentSmartLandscapeIndex--;
          }
          break;
        case 'Smart Washroom System Overview':
          if (this.currentSmartToiletIndex > 0) {
            this.currentSmartToiletIndex--;
          }
          break;
        case 'Building Management System (JCS) Overview':
          if (this.currentBMSIndex > 0) {
            this.currentBMSIndex--;
          }
          break;
        case 'Smart Pest Control System Overview':
          if (this.currentSmartPestControlIndex > 0) {
            this.currentSmartPestControlIndex--;
          }
          break;
        case 'Smart Security System Overview':
          if (this.currentSmartSecurityIndex > 0) {
            this.currentSmartSecurityIndex--;
          }
          break;
        case 'Smart Lighting System Overview':
          if (this.currentSmartLightingIndex > 0) {
            this.currentSmartLightingIndex--;
          }
          break;
        case 'Hybrid Air System Overview':
          if (this.currentHybridAirIndex > 0) {
            this.currentHybridAirIndex--;
          }
          break;
      }
    },
    nextItem(subsystemName) {
      switch (subsystemName) {
        case 'Fire Alarm System Overview':
          if (this.currentFireAlarmIndex < this.fireAlarms.length - 1) {
            this.currentFireAlarmIndex++;
          }
          break;
        case 'Smart Air Quality System Overview':
          if (this.currentIAQDeviceIndex < this.iaqDevices.length - 1) {
            this.currentIAQDeviceIndex++;
          }
          break;
        case 'Smart Energy Management System Overview':
          if (this.currentPowerMeterIndex < this.powerMeters.length - 1) {
            this.currentPowerMeterIndex++;
          }
          break;
        case 'Asset Tagging System Overview':
          if (this.currentWaterMeterIndex < this.waterMeters.length - 1) {
            this.currentWaterMeterIndex++;
          }
          break;
        case 'Smart Landscape Overview':
          if (this.currentSmartLandscapeIndex < this.smartLandscape.length - 1) {
            this.currentSmartLandscapeIndex++;
          }
          break;
        case 'Smart Washroom System Overview':
          if (this.currentSmartToiletIndex < this.smartToilet.length - 1) {
            this.currentSmartToiletIndex++;
          }
          break;
        case 'Building Management System (JCS) Overview':
          if (this.currentBMSIndex < this.bms.length - 1) {
            this.currentBMSIndex++;
          }
          break;
        case 'Smart Pest Control System Overview':
          if (this.currentSmartPestControlIndex < this.smartPestControl.length - 1) {
            this.currentSmartPestControlIndex++;
          }
          break;
        case 'Smart Security System Overview':
          if (this.currentSmartSecurityIndex < this.smartSecurity.length - 1) {
            this.currentSmartSecurityIndex++;
          }
          break;
        case 'Smart Lighting System Overview':
          if (this.currentSmartLightingIndex < this.smartLighting.length - 1) {
            this.currentSmartLightingIndex++;
          }
          break;
        case 'Hybrid Air System Overview':
          if (this.currentHybridAirIndex < this.hybridAir.length - 1) {
            this.currentHybridAirIndex++;
          }
          break;
      }
    },
    canPrevItem(subsystemName) {
      switch (subsystemName) {
        case 'Fire Alarm System Overview':
          return this.currentFireAlarmIndex > 0;
        case 'Smart Air Quality System Overview':
          return this.currentIAQDeviceIndex > 0;
        case 'Smart Energy Management System Overview':
          return this.currentPowerMeterIndex > 0;
        case 'Asset Tagging System Overview':
          return this.currentWaterMeterIndex > 0;
        case 'Smart Landscape Overview':
          return this.currentSmartLandscapeIndex > 0;
        case 'Smart Washroom System Overview':
          return this.currentSmartToiletIndex > 0;
        case 'Building Management System (JCS) Overview':
          return this.currentBMSIndex > 0;
        case 'Smart Pest Control System Overview':
          return this.currentSmartPestControlIndex > 0;
        case 'Smart Security System Overview':
          return this.currentSmartSecurityIndex > 0;
        case 'Smart Lighting System Overview':
          return this.currentSmartLightingIndex > 0;
        case 'Hybrid Air System Overview':
          return this.currentHybridAirIndex > 0;
        default:
          return false;
      }
    },
    canNextItem(subsystemName) {
      switch (subsystemName) {
        case 'Fire Alarm System Overview':
          return this.currentFireAlarmIndex < this.fireAlarms.length - 1;
        case 'Smart Air Quality System Overview':
          return this.currentIAQDeviceIndex < this.iaqDevices.length - 1;
        case 'Smart Energy Management System Overview':
          return this.currentPowerMeterIndex < this.powerMeters.length - 1;
        case 'Asset Tagging System Overview':
          return this.currentWaterMeterIndex < this.waterMeters.length - 1;
        case 'Smart Landscape Overview':
          return this.currentSmartLandscapeIndex < this.smartLandscape.length - 1;
        case 'Smart Washroom System Overview':
          return this.currentSmartToiletIndex < this.smartToilet.length - 1;
        case 'Building Management System (JCS) Overview':
          return this.currentBMSIndex < this.bms.length - 1;
        case 'Smart Pest Control System Overview':
          return this.currentSmartPestControlIndex < this.smartPestControl.length - 1;
        case 'Smart Security System Overview':
          return this.currentSmartSecurityIndex < this.smartSecurity.length - 1;
        case 'Smart Lighting System Overview':
          return this.currentSmartLightingIndex < this.smartLighting.length - 1;
        case 'Hybrid Air System Overview':
          return this.currentHybridAirIndex < this.hybridAir.length - 1;
        default:
          return false;
      }
    },
    getCurrentIndex(subsystemName) {
      switch (subsystemName) {
        case 'Fire Alarm System Overview':
          return this.currentFireAlarmIndex;
        case 'Smart Air Quality System Overview':
          return this.currentIAQDeviceIndex;
        case 'Smart Energy Management System Overview':
          return this.currentPowerMeterIndex;
        case 'Asset Tagging System Overview':
          return this.currentWaterMeterIndex;
        case 'Smart Landscape Overview':
          return this.currentSmartLandscapeIndex;
        case 'Smart Washroom System Overview':
          return this.currentSmartToiletIndex;
        case 'Building Management System (JCS) Overview':
          return this.currentBMSIndex;
        case 'Smart Pest Control System Overview':
          return this.currentSmartPestControlIndex;
        case 'Smart Security System Overview':
          return this.currentSmartSecurityIndex;
        case 'Smart Lighting System Overview':
          return this.currentSmartLightingIndex;
        case 'Hybrid Air System Overview':
          return this.currentHybridAirIndex;
        default:
          return 0;
      }
    },
    getTotalPages(subsystemName) {
      switch (subsystemName) {
        case 'Fire Alarm System Overview':
          return this.fireAlarms.length;
        case 'Smart Air Quality System Overview':
          return this.iaqDevices.length;
        case 'Smart Energy Management System Overview':
          return this.powerMeters.length;
        case 'Asset Tagging System Overview':
          return this.waterMeters.length;
        case 'Smart Landscape Overview':
          return this.smartLandscape.length;
        case 'Smart Washroom System Overview':
          return this.smartToilet.length;
        case 'Building Management System (JCS) Overview':
          return this.bms.length;
        case 'Smart Pest Control System Overview':
          return this.smartPestControl.length;
        case 'Smart Security System Overview':
          return this.smartSecurity.length;
        case 'Smart Lighting System Overview':
          return this.smartLighting.length;
        case 'Hybrid Air System Overview':
          return this.hybridAir.length;
        default:
          return 1;
      }
    },
    async fetchFaults() {
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/api/Faults');
        const data = await response.json();
        console.log('Fetched Faults Data:', data); // Check fetched data
        this.faults = data.slice(0, 5); // Only take the first 5 items
      } catch (error) {
        console.error('Error fetching faults:', error);
      }
    },
    getFaultClass(status) {
      console.log(status);
      if (status === 'work_completed') {
        return 'work_completed'; // Green background
      } else if (status === 'site_reached') {
        return 'site_reached'; // Yellow background
      } else {
        return 'pending'; // Red background
      }
    },
  },
  created() {
    this.fetchFaults(); // Fetch fault data when the component is created
    this.fetchBMSData(); // Fetch BMS data when the component is created
    this.fetchATData(); // Fetch AT data when the component is created
    this.fetchSWSData(); // Fetch SWS data when the component is created
    this.fetchSPCSData(); // Fetch SPCS data when the component is created
    this.fetchSEMSData();
    this.loadAlerts(); // Load alerts from local storage when the component is created
  },
};
</script>

<style scoped>
/* CSS code remains the same */
.additional-card.quick-links {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid #d3d3d3;
  /* Updated border color */
}

.links-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* Adjust the gap between buttons as needed */
  margin-top: 10px;
  /* Add margin to separate the title and content */
  width: 100%;
  /* Ensure it fills the available width */
}

.quick-link-item {
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}

/* Completed status - green background */
.quick-link-item.completed {
  background-color: #90ee90;
  /* Light green */
  color: black;
}

/* Pending status - orange background */
.quick-link-item.pending {
  background-color: #ff9900;
  /* Orange */
  color: white;
}


.quick-link-item.clear {
  background-color: #90ee90;
  /* Green background for clear status */
  color: black;
}

.quick-link-item.leakage {
  background-color: #ff4c4c;
  /* Red background for leakage status */
  color: yellow;
}

.view-all-link {
  position: absolute;
  top: 25px;
  right: 20px;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}

.view-all-link:hover {
  color: #0056b3;
}

.summary-be {
  grid-area: summary-be;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #d3d3d3;
  /* Updated border color */
}

.progress-bars {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.progress-bar-container {
  flex: 1;
  min-width: 100px;
}

.map-hierarchy {
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  border: 2px solid #d3d3d3;
  /* Make sure it takes up full width */
  width: 100%;
}

.additional-cards {
  display: flex;
  justify-content: space-between;
  padding-top: 1%;
  gap: 20px;
  /* Responsive behavior */
}


.additional-card {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid #d3d3d3;
  /* Updated border color */
}

.additional-card.auto-scroll-feed {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Ensures content stays within the card */
  flex: 1;
  /* Takes up remaining space */
  width: 100%;
  /* Ensure it fills the available width */
}

.feed-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden;
  /* Ensures content stays within the card */
  margin-top: 10px;
  /* Add margin to separate the title and content */
  width: 100%;
  /* Ensure it fills the available width */
}

.feed-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  animation: scroll 30s linear infinite;
  width: 100%;
  /* Ensure it fills the available width */
}

.feed-item {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
  /* Ensure it fills the available width */
  box-sizing: border-box;
  /* Include padding and border in the element's total width and height */
}

@keyframes scroll {
  0% {
    transform: translateY(0%);
  }

  100% {
    transform: translateY(calc(-100% - 10px));
    /* Adjust this value to ensure correct scrolling distance */
  }
}

.quick-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.quick-link-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.quick-link-button:last-child {
  margin-bottom: 0;
}

.summary-subsystems {
  grid-area: summary-subsystems;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #d3d3d3;
  /* Updated border color */
  position: relative;
  /* Make the parent div the positioning context */
}

.map-content img {
  width: 100%;
  /* Ensures the image scales responsively */
  height: auto;
}

.summary-content,
.map-content,
.subsystems-content {
  display: flex;
  flex-direction: column;
}

.subsystems-container {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #d3d3d3;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-top: 3%;
  padding-bottom: 3%;
  white-space: nowrap;
}

.subsystems-content {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  /* 5 columns */
  grid-template-rows: repeat(2, auto);
  /* 2 rows */
  gap: 1rem;
  /* Space between cards */
  padding: 2rem;
  width: 100%;
  justify-content: center;
}


.subsystem-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.scroll-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 24px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.scroll-button.left {
  left: 0px;
}

.scroll-button.right {
  right: 0px;
}


.subsystem-card h4 {
  color: white;
  text-align: center;
  line-height: 1.3;
  /* Adjust line height for better spacing */
  height: 3em;
  /* Ensures the title takes up enough space for two lines */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: normal;
  word-break: break-word;
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-footer {
  color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.card-footer .card-pagination {
  display: flex;
  align-items: center;
}

.card-footer .card-pagination button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 18px;
}

.card-footer .card-pagination p {
  margin: 0 5px;
}

.semi-circle-progress {
  margin: 20px 0;
}

.status-dot {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 5px;
}

.status-online {
  background-color: green;
}

.status-offline {
  background-color: red;
}

.see-more {
  color: black;
  text-decoration: none;
}

.see-more:hover {
  text-decoration: underline;
}

/* Page Indicators Positioned at the Bottom */
.page-indicators {
  position: absolute;
  bottom: 10px;
  width: 100%;
  text-align: center;
}

.page-indicators span {
  font-size: 24px;
  color: #ccc;
  margin: 0 5px;
}

.page-indicators span.active {
  color: #007bff;
}

.view-all-link {
  position: absolute;
  top: 25px;
  right: 20px;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}

.view-all-link:hover {
  color: #0056b3;
}

/* Styles for the Title Bar */
.title-bar {
  padding: 20px 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0;
  text-align: center;
}

@media (max-width: 1024px) {
  .subsystems-content {
    grid-template-columns: repeat(2, 1fr);
    /* 2 columns for tablets */
  }
}

@media (max-width: 768px) {
  .subsystems-content {
    grid-template-columns: repeat(1, 1fr);
    /* 1 column for mobile */
  }


  .additional-cards {
    flex-direction: column;
    align-items: center;
  }

  .subsystems-content {
    grid-template-columns: repeat(1, 1fr);
  }

  .title-bar .row {
    flex-direction: column;
    align-items: center;
  }

  .title,
  .announcement-bar {
    text-align: center;
    margin-bottom: 10px;
  }
}

.fault-item {
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  margin-bottom: 10px;
  color: black;
  /* Default color for text */
}

.site_reached {
  background-color: yellow;
  color: black;
  /* Adjust text color for better readability on yellow background */
}


.work-completed {
  background-color: lightgreen;
  color: black;
}

.pending {
  background-color: red;
}

.fault-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-radius: 5px;
}

.fault-column {
  flex: 1;
  padding: 0 10px;
  text-align: left;
  /* Adjust as needed */
}

.fault-header {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.image-container {
  position: relative;
  width: 100%;
  height: auto;
}

/* Absolute positioning for boxes on the image */
.box {
  position: absolute;
  /* Slightly transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  width: 100px;
  /* Adjust width */
  height: 100px;
  /* Adjust height */
  opacity: 0;
  cursor: pointer;
  background-color: grey;
}

/* General layout styles */
.overview-container {
  padding: 20px;
}

.title-bar {
  padding: 20px 0;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.map-hierarchy {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #d3d3d3;
}

/* Modal Overlay Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal Content Styling */
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 50vw;
  max-width: 600px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60vh;
  color: black;
  /* Ensure text is black */
}

.message-item p {
  color: black;
  /* Ensure message text is black */
}

.message-item small {
  color: black;
  /* Ensure timestamp is black */
}

.input-field {
  color: black;
  /* Ensure input text is black */
}


.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.modal-close:hover {
  color: red;
}

/* Messages container for displaying stored messages */
.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  /* Add margin so messages aren't too close to the button */
  text-align: center;
  /* Center the 'No news currently' text */
}

.message-item p {
  margin: 0;
}

.message-item small {
  color: #888;
  font-size: 0.8rem;
}

.no-news {
  color: #888;
  font-size: 1.2rem;
  font-style: italic;
  margin-top: 20px;
}

/* Input section for new message */
.message-input-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  /* Ensure spacing between messages and input */
}

.input-field {
  flex-grow: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  display: block;
  /* Ensure it's a block-level element */
  margin-top: 10px;
  /* Add margin for separation */
}

button:hover {
  background-color: #0056b3;
}


/* Positioning for each box - Washroom*/
#box1 {
  top: 63%;
  left: 6%;
  width: 10%;
  height: 23%;
}

#box2 {
  top: 39%;
  left: 13%;
  width: 11%;
  height: 18%;
}

#box3 {
  top: 19%;
  left: 11%;
  width: 11%;
  height: 20%;
}

#box4 {
  top: 19%;
  left: 22%;
  width: 6%;
  height: 18%;
}

#box5 {
  top: 19%;
  left: 28%;
  width: 15%;
  height: 11%;
}

#box6 {
  top: 42%;
  left: 29%;
  width: 27%;
  height: 9%;
}

#box7 {
  top: 54%;
  left: 25%;
  width: 11%;
  height: 24%;
}

#box8 {
  top: 52%;
  left: 36%;
  width: 9%;
  height: 24%;
}

#box9 {
  top: 51%;
  left: 45%;
  width: 10%;
  height: 23%;
}

#box10 {
  top: 16%;
  left: 43%;
  width: 17%;
  height: 12%;
}

#box11 {
  top: 17%;
  left: 67%;
  width: 8%;
  height: 13%;
}

#box12 {
  top: 28%;
  left: 33%;
  width: 43%;
  height: 13%;
}

/* Close Button Styling */
.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
}

.modal-close:hover {
  color: #ff0000;
  /* Red when hovered over */
}

.subsystem-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.subsystem-title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.subsystems-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
}

.subsystems-title {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.subsystems-title h2 {
  font-size: 24px;
  color: white;
  font-weight: bold;
}

.subsystem-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}


.subsystem-room {
  font-size: 0.9rem;
  margin-bottom: 5px;
  text-align: center;
  color: white;
}

.status-icon {
  font-size: 2rem;
  margin-top: 5px;
}

.subsystem-title {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.subsystem-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.subsystem-info i {
  font-size: 2rem;
  /* Adjust the size of the smiley */
  color: limegreen;
}


.go-button {
  background-color: #ff9955;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
}

.go-button:hover {
  background-color: #e17e45;
}


.message-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.message-details {
  flex-grow: 1;
}

.delete-button {
  background-color: #ff4c4c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #ff0000;
}

.announcement-bar {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  overflow: hidden;
}

.announcement-label {
  width: 25%;
  background-color: #3f48cc;
  /* Blue color */
  color: white;
  font-weight: bold;
  padding: 10px;
  text-align: center;
  font-size: 16px;
}

/* Replace these styles in your existing CSS */
.scrolling-container {
  width: 74%;
  background-color: rgba(255, 255, 255, 0.1);
  /* Semi-transparent static background */
  padding: 10px;
  position: relative;
  overflow: hidden;
}

.scrolling-text {
  white-space: nowrap;
  display: inline-block;
  position: relative;
  animation: scroll-text 10s linear infinite;
  /* Adjusted the animation duration */
  color: white;
  font-size: 16px;
}

/* Animation keyframes */
@-moz-keyframes my-animation {
  from {
    -moz-transform: translateX(100%);
  }

  to {
    -moz-transform: translateX(-100%);
  }
}

@-webkit-keyframes my-animation {
  from {
    -webkit-transform: translateX(100%);
  }

  to {
    -webkit-transform: translateX(-100%);
  }
}

@keyframes my-animation {
  from {
    -moz-transform: translateX(100%);
    -webkit-transform: translateX(100%);
    transform: translateX(100%);
  }

  to {
    -moz-transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
    transform: translateX(-100%);
  }
}

/* Keyframes for smooth scrolling */
@keyframes scroll-text {
  0% {
    transform: translateX(100%);
    /* Start off-screen to the right */
  }

  100% {
    transform: translateX(-100%);
    /* Move off-screen to the left */
  }
}

.scrolling-text::after {
  content: ' ';
  padding-left: 100%;
  /* Adds space after the text for smooth looping */
}



/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 50vw;
  max-width: 600px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60vh;
  color: black;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.message-item {
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.input-field {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  flex-grow: 1;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.fas.fa-smile {
  color: #90ee90;
  /* Light green */
}
</style>
