<template>
  <div class="container-fluid mt-5">
    <h2 class="text-center mb-4">Smart Pest Control System</h2>
    <div class="row">
      <div class="col-md-6">
        <div class="relation-section">
          <h4 class="livecam-title">
            Livecam
            <!-- Button to start/resume session, only visible if session is not active -->
            <button v-if="!sessionActive" @click="startOrResumeSession"
              class="btn btn-primary floating-livecam-button-icon">
              <i class="fas fa-plus"></i>
            </button>

            <!-- Timer display, only visible if session is active -->
            <div v-if="sessionActive" class="timer-display">{{ timer }}</div>

          </h4>
          <div class="sensor-detection-diagram position-relative" style="height:88%">

            <!-- Show message if session has not started yet -->
            <div v-if="!hyperbeamSessionStarted" class="no-session-text">
              Session has not started yet.
            </div>

            <!-- Display iframe only after session has started -->
            <iframe v-if="hyperbeamSessionStarted" id="hyperbeamIframe" allow="autoplay"
              style="border: 0; width:100%; height:100%" src=""></iframe>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="map-section">
          <h4>Floorplan</h4>
          <div class="map-container">
            <img src="@/assets/V3/B05-11-12_full_pest.png" alt="Map View" class="map-image">

            <!-- Magnetic Sensors -->
            <div v-for="sensor in magneticSensors" :key="sensor.devEUI" class="magnetic-sensor-icon"
              :style="{ top: sensor.top, left: sensor.left, width: '24px', height: '24px', backgroundColor: 'transparent' }"
              @mouseover="showSensorInfo(sensor)" @mouseleave="hideSensorInfo(sensor)">
              <div class="sensor-info" v-if="sensor.showInfo">
                <h5>Magnetic Sensor</h5>
                <p>Status: {{ sensor.magnet_status === '1' ? 'Open' : 'Closed' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-2">
      <div class="col-md-3" v-for="device in devices" :key="device.id">
        <div class="device-status-card">
          <h5>{{ device.name }}</h5>
          <p class="status"
            :class="{ 'text-success': device.status === 'Activated', 'text-danger': device.status !== 'Activated' }">{{
              device.status }}</p>
        </div>
      </div>
    </div>

    <!-- Condition Dropdown -->
    <div class="row mt-4 condition-dropdown">
      <div class="col-12 text-center">
        <select id="conditionSelect" v-model="selectedCondition" class="form-select" @change="updateCondition">
          <option v-for="(condition, index) in conditions" :key="index" :value="condition">
            {{ condition }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal"></div>
    <div v-if="showModal" class="modal d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Adjust Conditions</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="condition-input">
              <label>PIR Sensor</label>
              <select v-model="pirSensorStatus" class="form-control">
                <option value="Detected">Detected</option>
                <option value="Not Detected">Not Detected</option>
              </select>
            </div>
            <div class="condition-input">
              <label>Magnetic Lock</label>
              <select v-model="magneticLockStatus" class="form-control">
                <option value="On">On</option>
                <option value="Off">Off</option>
              </select>
            </div>
            <div class="condition-input">
              <label>Camera</label>
              <select v-model="cameraStatus" class="form-control">
                <option value="On">On</option>
                <option value="Off">Off</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
            <button type="button" class="btn btn-primary" @click="saveConditions">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SmartPestControlSystem',
  data() {
    return {
      devices: [
        { id: 1, name: 'Magnetic Lock', status: 'Activated' },
        { id: 2, name: 'PIR Sensor', status: 'Activated' },
        { id: 3, name: 'Camera', status: 'Activated' },
        { id: 4, name: 'Rat Trap', status: 'Activated' },
      ],
      showModal: false,
      pirSensorStatus: 'Detected',
      magneticLockStatus: 'On',
      cameraStatus: 'On',
      magneticSensors: [],
      conditions: [
        'Conditions',
        'If PIR sensor motion detected, then magnetic lock turn on, camera turn on',
        'If PIR sensor motion detected, then camera turn on',
        'If rat trap triggered, then alert sound',
      ],
      selectedCondition: '',
      displayedCondition: '',
      hyperbeamSessionStarted: false, // New flag to track if Hyperbeam session is started
      sessionActive: false,           // Flag to indicate if a session is active
      timer: '',                      // Holds the timer display string
      sessionDuration: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      sessionStarted: false,

    };
  },
  computed: {
    isBothSensorsClosed() {
      return this.magneticSensors.some(sensor => sensor.magnet_status === '0');
      //push
    }
  },
  methods: {
    checkAndLogMagneticSensorStatus() {
      const closedSensor = this.magneticSensors.find(sensor => sensor.magnet_status === '0');
      if (closedSensor) {
        const currentTime = new Date().getTime();
        const storedAlerts = JSON.parse(localStorage.getItem('alerts')) || [];

        // Check if a recent alert for the same message exists within the last 5 minutes
        const recentAlert = storedAlerts.find(alert =>
          alert.message.includes('Magnetic Sensor is Closed') &&
          currentTime - new Date(alert.timestamp).getTime() < 5 * 60 * 1000
        );

        if (!recentAlert) {
          const alertMessage = `Magnetic Sensor is Closed. Time: ${new Date().toLocaleString()}`;
          storedAlerts.push({ message: alertMessage, timestamp: new Date().toLocaleString() });
          localStorage.setItem('alerts', JSON.stringify(storedAlerts));
          console.log('Alert added to local storage:', alertMessage);
        } else {
          console.log('Recent alert already exists, not adding a new one.');
        }
      }
    },
    async startOrResumeSession() {
      try {
        const session = await this.checkExistingSession();

        if (session && this.isSessionValid(session.timestamp)) {
          // If a valid session exists, resume it
          console.log('Resuming existing session');
          this.sessionActive = true;
          this.hyperbeamSessionStarted = true;

          // Resume the session using the existing embedUrl
          this.$nextTick(() => {
            this.startHyperbeamSession(session.embedUrl);
          });

          // Calculate remaining time and start the countdown
          const remainingTime = this.sessionDuration - (new Date().getTime() - session.timestamp);
          this.startCountdown(remainingTime); // Start countdown from remaining time
        } else {
          // No valid session found, manually start a new session when the button is clicked
          await this.startNewSession();

          // Start the timer from 2 hours (7200000 milliseconds)
          this.startCountdown(this.sessionDuration); // Start countdown for 2 hours
        }

        // Set sessionActive to true to hide the button and show the timer
        this.sessionActive = true;

      } catch (error) {
        console.error('Error starting or resuming session:', error);
      }
    },
    startCountdown(duration) {
      let remainingTime = duration;

      const countdownInterval = setInterval(() => {
        if (remainingTime <= 0) {
          clearInterval(countdownInterval);
          this.timer = 'Session Expired';
          this.sessionActive = false; // Session inactive when expired
        } else {
          const hours = Math.floor(remainingTime / (1000 * 60 * 60));
          const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

          // Update the reactive timer variable
          this.timer = `${hours}h ${minutes}m ${seconds}s remaining`;

          // Subtract 1 second (1000 milliseconds) from remaining time
          remainingTime -= 1000;
        }
      }, 1000); // Update every second
    },
    embedHyperbeamIframe(embedUrl) {
      const iframe = document.getElementById('hyperbeamIframe');
      if (iframe) {
        iframe.src = embedUrl;  // Set the session URL to the iframe src
        console.log('Hyperbeam session started or resumed:', embedUrl);
      } else {
        console.error('Unable to find the iframe.');
      }
    },
    // Function to check if there is an existing session
    async checkExistingSession() {
      try {
        const savedGistId = sessionStorage.getItem('gistId');

        if (!savedGistId) {
          console.log('No Gist ID found. No existing session.');
          return null;
        }

        const response = await axios.get(`https://api.github.com/gists/${savedGistId}`, {
          headers: {
            Authorization: `Bearer ${process.env.VUE_APP_GITHUB_TOKEN}`, // Access token from .env
          },
        });

        const content = response.data.files['session.txt'].content;
        const [embedUrl, timestamp] = content.split('\n');
        this.hyperbeamSessionStarted = true;
        console.log('Existing session found:', { embedUrl, timestamp });

        const parsedTimestamp = parseInt(timestamp, 10);
        this.updateTimer(parsedTimestamp); // Update the timer display for existing session

        return { embedUrl, timestamp: parsedTimestamp };
      } catch (error) {
        console.error('Error checking existing session:', error);
        return null;
      }
    },

    // Function to start a new session when the user clicks the button
    async startNewSession() {
      try {
        console.log('Creating a new session');
        const hyperbeamResponse = await axios.post('https://cctv.rshare.io/create-session');
        const embedUrl = hyperbeamResponse.data.embed_url;
        const timestamp = new Date().getTime();

        // Store the session details
        await this.storeSessionData(embedUrl, timestamp);

        // Mark session as started and active
        this.sessionActive = true;
        this.hyperbeamSessionStarted = true;

        // Set the iframe src with the new session URL
        this.$nextTick(() => {
          this.startHyperbeamSession(embedUrl);
        });
      } catch (error) {
        console.error('Error starting a new session:', error);
      }
    },

    // Function to store session data (gist)
    async storeSessionData(embedUrl, timestamp) {
      try {
        const savedGistId = sessionStorage.getItem('gistId');

        // If there's no saved Gist ID, create a new one
        if (!savedGistId) {
          const gistResponse = await axios.post(
            'https://api.github.com/gists',
            {
              description: 'Session Start Status',
              public: false,
              files: {
                'session.txt': {
                  content: `${embedUrl}\n${timestamp}`,
                },
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.VUE_APP_GITHUB_TOKEN}`, // Access token from .env
              },
            }
          );

          const newGistId = gistResponse.data.id;
          sessionStorage.setItem('gistId', newGistId);
          console.log('New Gist ID stored in sessionStorage:', newGistId);
        } else {
          console.log('Valid session already exists, no need to update.');
        }
      } catch (error) {
        console.error('Error storing session data:', error);
      }
    },

    isSessionValid(timestamp) {
      const currentTime = new Date().getTime();
      return currentTime - timestamp < this.sessionDuration;
    },

    updateTimer(storedTimestamp) {
      const interval = setInterval(() => {
        const currentTime = new Date().getTime(); // Get the current time
        const elapsedTime = currentTime - storedTimestamp; // Calculate how much time has passed since the session started
        const remainingTime = this.sessionDuration - elapsedTime; // Subtract elapsed time from total session duration

        if (remainingTime <= 0) {
          clearInterval(interval);
          this.timer = 'Session Expired'; // Display session expired message
          this.sessionActive = false; // Mark session as inactive
        } else {
          const hours = Math.floor(remainingTime / 3600000); // Convert remaining time to hours
          const minutes = Math.floor((remainingTime % 3600000) / 60000); // Convert remaining time to minutes
          const seconds = Math.floor((remainingTime % 60000) / 1000); // Convert remaining time to seconds
          this.timer = `${hours}h ${minutes}m ${seconds}s remaining`; // Update the timer display
        }
      }, 1000); // Update the timer every second
    },

    // Call this at the end of fetching sensor data
    async fetchMagneticSensorData() {
      try {
        const response = await axios.get('https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/sheet/Magnetic');
        const data = response.data;

        this.magneticSensors = [
          {
            ...data['24e124141e151801'],
            top: '19%',
            left: '63%',
            showInfo: false
          },
          {
            ...data['24e124141e151546'],
            top: '19%',
            left: '66.2%',
            showInfo: false
          }
        ];

        this.updateDeviceStatuses();

        // Check and log the magnetic sensor status
        this.checkAndLogMagneticSensorStatus();
      } catch (error) {
        console.error('Error fetching magnetic sensor data:', error);
      }
    },
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    saveConditions() {
      alert(`PIR Sensor: ${this.pirSensorStatus}, Magnetic Lock: ${this.magneticLockStatus}, Camera: ${this.cameraStatus}`);
      this.closeModal();
    },
    updateCondition() {
      this.displayedCondition = this.selectedCondition;
    },
    showSensorInfo(sensor) {
      sensor.showInfo = true;
    },
    hideSensorInfo(sensor) {
      sensor.showInfo = false;
    },
    // Function to create and start a Hyperbeam session
    // Update the Axios POST request to point to the actual server
    async startHyperbeamSession(embedUrl = null) {
      try {
        // If no embedUrl is provided, create a new session
        if (!embedUrl) {
          const response = await axios.post('https://cctv.rshare.io/create-session');
          embedUrl = response.data.embed_url;
          const timestamp = new Date().getTime();

          // Store the session details in Gist (only for new sessions)
          await this.storeSessionData(embedUrl, timestamp);

          // Update the session timer and mark session as active
          this.sessionActive = true;
          this.hyperbeamSessionStarted = true;
        }

        // Dynamically set iframe source after session starts or resumes
        this.$nextTick(() => {
          const iframe = document.getElementById('hyperbeamIframe');
          if (iframe) {
            iframe.src = embedUrl;  // Set the session URL to the iframe src
            console.log('Hyperbeam session started or resumed:', embedUrl);
          } else {
            console.error('Unable to find the iframe.');
          }
        });
      } catch (error) {
        console.error('Error starting or resuming session:', error);
      }
    },
    updateDeviceStatuses() {
      // If both magnetic sensors are open
      if (this.magneticSensors.every(sensor => sensor.magnet_status === '1')) {
        // Update relevant devices to "Not Activated"
        this.devices = this.devices.map(device => {
          if (device.name === 'Magnetic Lock' || device.name === 'Camera' || device.name === 'Rat Trap') {
            return { ...device, status: 'Activated' };
          }
          return device; // Keep PIR Sensor unchanged
        });
      } else if (this.magneticSensors.some(sensor => sensor.magnet_status === '0')) {
        // If at least one magnetic sensor is closed
        this.devices = this.devices.map(device => {
          if (device.name === 'Magnetic Lock' || device.name === 'Camera' || device.name === 'Rat Trap') {
            return { ...device, status: 'Not Activated' };
          }
          return device; // Keep PIR Sensor unchanged
        });
      }
    },
    startDataRefresh() {
      setInterval(async () => {
        await this.fetchMagneticSensorData();
        console.log('refreshing magnetic sensor data...');
      }, 15000); // Refresh data every 15 seconds
    }
  },
  mounted() {
    this.checkExistingSession();
    this.fetchMagneticSensorData();
    this.startDataRefresh();

    if (this.conditions.length > 0) {
      this.selectedCondition = this.conditions[0];
      this.updateCondition();
    }
  },
};
</script>

<style scoped>
.container-fluid {
  width: 100%;
  height: 100vh;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
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
}

.magnetic-sensor-icon {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  width: 24px;
  height: 24px;
  background-color: transparent;
  /* No icon, but clickable area remains */
}

.sensor-info {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  border-radius: 3px;
  text-align: center;
  white-space: nowrap;
  z-index: 10;
}


.icon-image {
  width: 24px;
  height: 24px;
}

.device-status-card {
  background-color: rgba(255, 255, 255, 0.1);
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

.modal-header,
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px 20px;
}

.modal-footer {
  padding-top: 10px;
}

.btn-close {
  border: none;
  background: none;
}

.condition-input {
  margin-bottom: 10px;
}

.no-livecam-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  color: red;
  text-align: center;
}

.no-session-text {
  font-size: 1.5rem;
  color: red;
  text-align: center;
  margin-top: 20px;
}

.floating-livecam-button {
  position: absolute;
  bottom: 10px;
  /* Distance from the bottom of the livecam div */
  right: 10px;
  /* Distance from the right of the livecam div */
  z-index: 10;
  /* Make sure it is above other content inside the livecam div */
}

/* Adjust button position relative to the Livecam title */
.livecam-title {
  position: relative;
  justify-content: space-between;
  align-items: center;
}

.floating-livecam-button-icon:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* Style for the + button */
.floating-livecam-button-icon {
  position: absolute;
  top: 10px;
  /* Position at the top-right corner */
  right: 10px;
  z-index: 10;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: none;
  cursor: pointer;
}

/* Timer display style, in the same spot as the button */
.timer-display {
  position: absolute;
  top: 0px;
  /* Same position as the button */
  right: 0px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 10;
  text-align: center;
}
</style>
