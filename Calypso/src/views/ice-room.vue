<template>
    <div class="container">
        <h2 class="text-center mb-4">HOT ROOM</h2>

        <!-- First Row: Sensor Data and Chart -->
        <div class="row">
            <!-- Sensor Data Section -->
            <div class="col-lg-6 section-container">
                <h3 class="section-title">Sensor Data</h3>
                <div class="sensor-grid">
                    <div class="sensor-box">
                        <p><b>CO2:</b></p>
                        <p>{{ sensorData.co2 }} ppm</p>
                        <div class="face-indicator">
                            <div class="face-display" style="display: flex; align-items: center;">
                                <i :class="getFaceClass(sensorData.co2, 'co2')" class="face-icon"></i>
                                <span style="margin-left: 8px;">
                                    <span v-if="getFaceClass(sensorData.co2, 'co2').includes('fa-smile')">Ideal</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.co2, 'co2').includes('fa-meh')">Average</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.co2, 'co2').includes('fa-frown')">Unsatisfactory</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="sensor-box">
                        <p><b>Temperature:</b></p>
                        <p>{{ sensorData.temperature }}°C</p>
                        <div class="face-indicator">
                            <div class="face-display" style="display: flex; align-items: center;">
                                <i :class="getFaceClass(sensorData.temperature, 'temperature')" class="face-icon"></i>
                                <span style="margin-left: 8px;">
                                    <span
                                        v-if="getFaceClass(sensorData.temperature, 'temperature').includes('fa-smile')">Ideal</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.temperature, 'temperature').includes('fa-meh')">Average</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.temperature, 'temperature').includes('fa-frown')">Unsatisfactory</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="sensor-box">
                        <p><b>Humidity:</b></p>
                        <p>{{ sensorData.humidity }}%</p>
                        <div class="face-indicator">
                            <div class="face-display" style="display: flex; align-items: center;">
                                <i :class="getFaceClass(sensorData.temperature, 'temperature')" class="face-icon"></i>
                                <span style="margin-left: 8px;">
                                    <span
                                        v-if="getFaceClass(sensorData.temperature, 'temperature').includes('fa-smile')">Ideal</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.temperature, 'temperature').includes('fa-meh')">Average</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.temperature, 'temperature').includes('fa-frown')">Unsatisfactory</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="sensor-box">
                        <p><b>PM2.5:</b></p>
                        <p>{{ sensorData.pm2_5 }} µg/m³</p>
                        <div class="face-indicator">
                            <div class="face-display" style="display: flex; align-items: center;">
                                <i :class="getFaceClass(sensorData.pm2_5, 'pm2_5')" class="face-icon"></i>
                                <span style="margin-left: 8px;">
                                    <span
                                        v-if="getFaceClass(sensorData.pm2_5, 'pm2_5').includes('fa-smile')">Ideal</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.pm2_5, 'pm2_5').includes('fa-meh')">Average</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.pm2_5, 'pm2_5').includes('fa-frown')">Unsatisfactory</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="sensor-box">
                        <p><b>PM10:</b></p>
                        <p>{{ sensorData.pm10 }} µg/m³</p>
                        <div class="face-indicator">
                            <div class="face-display" style="display: flex; align-items: center;">
                                <i :class="getFaceClass(sensorData.pm10, 'pm10')" class="face-icon"></i>
                                <span style="margin-left: 8px;">
                                    <span v-if="getFaceClass(sensorData.pm10, 'pm10').includes('fa-smile')">Ideal</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.pm10, 'pm10').includes('fa-meh')">Average</span>
                                    <span
                                        v-else-if="getFaceClass(sensorData.pm10, 'pm10').includes('fa-frown')">Unsatisfactory</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <!-- Button to open new window -->
                    <div class="button-box">
                        <button class="btn btn-primary float-right" @click="openPopupWindow">Best
                            Guidelines</button>
                    </div>
                </div>
            </div>

            <!-- Chart Section -->
            <div class="col-lg-6 section-container chart-container" style="width: 48%;">
                <div class="chart-box">
                    <h3 class="section-title">KWH Daily Consumption</h3>
                    <canvas id="kwhChart"></canvas> <!-- Bar Chart will be drawn here -->
                </div>
            </div>


        </div>

        <!-- Second Row: Floorplan and Console Control -->
        <div class="row mt-4">
            <!-- Floorplan Section - 80% width -->
            <div class="col-lg-8 section-container" style="width: 64%;">
                <h3 class="section-title">Room Layout</h3>
                <div class="floorplan-container position-relative">
                    <div class="floorplan-image-container">
                        <img :src="floorplanImage" alt="Floorplan for B05-11" class="floorplan-image" />
                    </div>

                    <!-- Status dots for zone sensors -->
                    <div v-for="(sensor, index) in zoneSensors" :key="index"
                        :style="{ top: sensor.top, left: sensor.left, position: 'absolute', transform: 'translate(-50%, -50%)' }">
                        <span class="status-dot" :class="sensor.isOnline ? 'online' : 'offline'"></span>
                    </div>

                    <!-- Status dots for toggle devices (MDU and FCU) -->
                    <div v-for="(device, index) in toggleDevices" :key="index"
                        :style="{ top: device.top, left: device.left, position: 'absolute', transform: 'translate(-50%, -50%)' }">
                        <span class="status-dot" :class="device.isOnline ? 'online' : 'offline'"></span>
                    </div>
                    <div v-for="fan in fans" :key="fan.id" class="status-dot-floorplan"
                        :style="{ top: fan.top, left: fan.left }">
                        <span class="status-dot" :class="fan.isOn ? 'online' : 'offline'"></span>
                    </div>

                </div>
            </div>

            <!-- Console Control Section - 20% width -->
            <div class="col-lg-4 section-container">
                <h3 class="section-title">Console Control</h3>
                <div class="console-box">
                    <!-- ALL ON/OFF Toggle for Zones -->
                    <div class="toggle-switch all-on-control mb-4">
                        <label class="switch">
                            <input type="checkbox" v-model="allOnZones" @change="toggleAllDevices" />
                            <span class="slider round"></span>
                        </label>
                        <span>{{ allOnZones ? 'ALL Lights ON' : 'ALL Lights OFF' }}</span>
                    </div>

                    <!-- Zone 5 to Zone 8 Controls -->
                    <div v-for="(sensor, index) in zoneSensors" :key="index"
                        class="sensor-control mb-3 d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <span :style="{ color: sensor.isOnline ? 'lightgreen' : 'white' }">
                                {{ sensor.name }} ({{ sensor.isOnline ? 'Lights On' : 'Lights Off' }})
                            </span>
                        </div>
                        <button class="btn btn-primary" @click="toggleModal(sensor)">
                            Control
                        </button>
                    </div>

                    <!-- ALL ON/OFF Toggle for FCUs -->
                    <div class="toggle-switch all-on-control mb-4">
                        <label class="switch">
                            <input type="checkbox" v-model="allOnFCU" @change="toggleAllFCU" />
                            <span class="slider round"></span>
                        </label>
                        <span>{{ allOnFCU ? 'Turn All FCUs ON' : 'Turn All FCUs OFF' }}</span>
                    </div>

                    <!-- ALL ON/OFF Toggle for MDUs -->
                    <div class="toggle-switch all-on-control mb-4">
                        <label class="switch">
                            <input type="checkbox" v-model="allOnMDU" @change="toggleAllMDU"
                                :disabled="isTogglingMDU" />
                            <span class="slider round"></span>
                        </label>
                        <span>{{ allOnMDU ? 'Turn All MDUs OPEN' : 'Turn All MDUs CLOSED' }}</span>
                    </div>



                    <div v-for="device in toggleDevices" :key="device.name" class="toggle-switch mb-3">
                        <div class="d-flex align-items-center justify-content-between">
                            <span>{{ device.name }}</span>
                            <!-- Disable switch while API request is pending -->
                            <label class="switch">
                                <input type="checkbox" :checked="device.isOnline" @change="toggleDeviceState(device)"
                                    :disabled="device.name.startsWith('FCU') ? isTogglingFCU : isTogglingMDU" />
                                <span class="slider round"></span>
                            </label>
                        </div>
                        <!-- Display ON when device isOnline, else OFF -->
                        <span>{{ device.isOnline ? 'ON' : 'OFF' }}</span>
                    </div>


                    <!-- FAF1 Control -->
                    <div class="toggle-switch mb-4">
                        <span><b>Fresh Air Fan 3 (FAF3)</b></span>
                        <label class="switch">
                            <input type="checkbox" v-model="fans[0].isOn" @change="controlFAF1(fans[0].isOn)">
                            <span class="slider round"></span>
                        </label>
                        <span>{{ fans[0].isOn ? 'ON' : 'OFF' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Dialog -->
        <div v-if="showModal && currentSensor" class="modal d-block">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ modalTitle }} Controls</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <!-- On/Off Buttons -->
                        <label><b>Lights: {{ currentSensor.isOnline ? 'ON' : 'OFF' }}</b></label><br>
                        <label class="switch">
                            <input type="checkbox" v-model="currentSensor.isOnline"
                                @change="setZoneState(currentSensor.isOnline, currentSensor)">
                            <span class="slider round"></span>
                        </label>

                        <!-- Sliders for B05-11/12 -->
                        <div v-if="selectedImage === 'B05-11-12_full_empty.png'" class="zone-control">
                            <label>Color Temperature (Level 1): {{ currentSensor.level1 }}</label>
                            <input type="range" v-model="currentSensor.level1" min="0" max="100" step="100" />
                            <br>
                            <label>Dimming (Level 2): {{ currentSensor.level2 }}</label>
                            <input type="range" v-model="currentSensor.level2" min="0" max="100" />

                            <!-- Set Button -->
                            <button @click="closeModal()" class="btn btn-success mt-3">Set</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Chart, BarController, LineController, BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';


export default {
    data() {
        return {
            isTogglingMDU: false,  // Disable flag for MDU toggle switch during API call
            isTogglingFCU: false,  // Disable flag for MDU toggle switch during API call
            sensorData: {
                co2: null,
                temperature: null,
                humidity: null,
                pm2_5: null,
                pm10: null,
            },
            floorplanImage: require('@/assets/Sub System and Icons/V2/B05-12_full2.png'),
            selectedImage: 'B05-11-12_full_empty.png', // Example default image
            allOnFCU: false,  // Controls all FCU units (initially set to true)
            allOnMDU: false,  // Controls all MDU units (initially set to true)
            allOnZones: false,
            fans: [
                { id: 1, name: 'Fresh Air Fan 2 (FAF2)', deviceEUI: '24E124756E049153', isOn: false, top: '50%', left: '62%' },
            ],
            zoneSensors: [
                { top: '23%', left: '61.5%', name: 'Zone 1', isOnline: false, deviceEUI: '0004ED0100001720' }, // Initially ON
                { top: '23%', left: '53.5%', name: 'Zone 2', isOnline: false, deviceEUI: '0004ED0100001713' }, // Initially ON
                { top: '23%', left: '45.5%', name: 'Zone 3', isOnline: false, deviceEUI: '0004ED010000166B' }, // Initially ON
                { top: '51%', left: '45.5%', name: 'Zone 4', isOnline: false, deviceEUI: '0004ED0100001704' }  // Initially ON
            ],
            toggleDevices: [
                { name: 'MCD 4', isOnline: false, deviceEUI: '24E124756E049153', top: '55%', left: '68%' },  // Initially ON
                { name: 'FCU 2-1', isOnline: false, airconIndex: 1, top: '69%', left: '42%' },               // Initially ON
                { name: 'FCU 2-2', isOnline: false, airconIndex: 2, top: '69%', left: '56%' }                // Initially ON
            ],
            showModal: false,
            modalTitle: '',
            currentSensor: null,
        };
    },
    methods: {
        openPopupWindow() {
            // Open a new window with specific dimensions
            const newWindow = window.open('', '_blank', 'width=800,height=500');
            newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Best Guidelines</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h3, h4 {
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .note {
            font-size: 0.9rem;
            font-style: italic;
            color: #555;
            margin-top: -10px;
          }
        </style>
      </head>
      <body>
        <h3>Best Guidelines</h3>
        <div>
          <h4>Table 1: Guideline Maximum Concentration for Specific Indoor Air Contaminants</h4>
          <table>
            <thead>
              <tr>
                <th>Parameters</th>
                <th>Average Time</th>
                <th>Limit for Acceptance</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Carbon dioxide</td>
                <td>8 hours</td>
                <td>1800 / 1000</td>
                <td>mg/m3 / ppm</td>
              </tr>
              <tr>
                <td>Carbon monoxide</td>
                <td>8 hours</td>
                <td>10 / 9</td>
                <td>mg/m3 / ppm</td>
              </tr>
              <tr>
                <td>Formaldehyde</td>
                <td>8 hours</td>
                <td>120 / 0.1</td>
                <td>mg/m3 / ppm</td>
              </tr>
              <tr>
                <td>Ozone</td>
                <td>8 hours</td>
                <td>100 / 0.05</td>
                <td>mg/m3 / ppm</td>
              </tr>
              <!-- Additional row to show the ppm information -->
              <tr>
                <td colspan="4" class="note">ppm – part per million (measurement of concentration) 1 ppm = 1 mg/l</td>
              </tr>
            </tbody>
          </table>

          <h4>Table 2: Recommended Maximum Concentrations for Specific Classes of Contaminants</h4>
          <table>
            <thead>
              <tr>
                <th>Parameters</th>
                <th>Limit for Acceptable Indoor Air Quality</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Suspended particulate matter*</td>
                <td>150</td>
                <td>mg/m3 / ppm</td>
              </tr>
              <tr>
                <td>Volatile organic compounds</td>
                <td>3</td>
                <td>ppm</td>
              </tr>
              <tr>
                <td>Total bacteria counts</td>
                <td>500</td>
                <td>CFU**/m3</td>
              </tr>
              <tr>
                <td>Total fungal counts</td>
                <td>500</td>
                <td>CFU/m3</td>
              </tr>
              <!-- Footnote for Table 2 -->
              <tr>
                <td colspan="3" class="note">* Respirable particles with aerodynamic diameters less than 10 μm.<br>** Colony-forming units</td>
              </tr>
            </tbody>
          </table>

          <h4>Table 3: Guideline Values for Specific Physical Parameters</h4>
          <table>
            <thead>
              <tr>
                <th>Parameters</th>
                <th>Range for Acceptable Indoor Air Quality</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Air temperature</td>
                <td>22.5 - 25.5</td>
                <td>°C</td>
              </tr>
              <tr>
                <td>Relative humidity</td>
                <td>&lt; 70</td>
                <td>%</td>
              </tr>
              <tr>
                <td>Air movement*</td>
                <td>&lt; 0.25</td>
                <td>m/s</td>
              </tr>
              <!-- Footnote for Table 3 -->
              <tr>
                <td colspan="3" class="note">* At workstation within occupied zone.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
        },
        // Function to control Fresh Air Fan 2 (FAF2)
        async controlFAF1(turnOn) {
            const payload = {
                deviceEui: '24E124756E049153', // EUI for FAF2
                switchStates: turnOn ? [1, 0, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, 0, 0]
            };

            try {
                const response = await axios.post('', payload);
                console.log(`FAF2 turned ${turnOn ? 'ON' : 'OFF'}`, response.data);

                // Update the FAF2 state
                this.fans[0].isOn = turnOn;
            } catch (error) {
                console.error(`Error turning FAF2 ${turnOn ? 'ON' : 'OFF'}:`, error);
            }
        },
        getToggleState(device) {
            return device.name.startsWith('FCU') ? this.allOnFCU : this.allOnMDU;
        },
        setToggleState(device, value) {
            if (device.name.startsWith('FCU')) {
                this.allOnFCU = value;
            } else {
                this.allOnMDU = value;
            }
        },
        setZoneState(state, sensor) {
            // Implement the logic to update the sensor's state here
            sensor.isOnline = state;
            console.log(`${sensor.name} is now ${state ? 'ON' : 'OFF'}`);
        },
        getFaceClass(value, type) {
            let goodLimit, badLimit;

            switch (type) {
                case 'co2':
                    goodLimit = 1000;
                    badLimit = 1500;
                    break;
                case 'temperature':
                    goodLimit = 25.5; // Acceptable range is 22.5°C to 25.5°C
                    badLimit = 27.5;
                    break;
                case 'humidity':
                    goodLimit = 70; // Acceptable range is < 70%
                    badLimit = 71;
                    break;
                case 'pm2_5':
                    goodLimit = 35; // Acceptable range < 35 µg/m³
                    badLimit = 75;
                    break;
                case 'pm10':
                    goodLimit = 100; // Acceptable range < 100 µg/m³
                    badLimit = 150;
                    break;
                default:
                    goodLimit = 0;
                    badLimit = 0;
            }

            if (value < goodLimit) {
                return 'fas fa-smile modal-face-icon'; // Green smiley face for good values
            } else if (value >= goodLimit && value < badLimit) {
                return 'fas fa-meh text-warning modal-face-icon'; // Orange neutral face for moderate values
            } else {
                return 'fas fa-frown text-danger modal-face-icon'; // Red frown face for bad values
            }
        },
        async fetchSensorData() {
            try {
                const response = await axios.get('https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/sheet/IAQ');
                const data = response.data['24e124710d480413'];
                this.sensorData.co2 = data.co2;
                this.sensorData.temperature = data.temperature;
                this.sensorData.humidity = data.humidity;
                this.sensorData.pm2_5 = data.pm2_5;
                this.sensorData.pm10 = data.pm10;
            } catch (error) {
                console.error('Error fetching sensor data:', error);
            }
        },
        async toggleAllDevices() {
            this.zoneSensors.forEach(sensor => sensor.isOnline = this.allOnZones);
            const apiUrl = this.allOnZones ? `` : ``;
            const deviceIds = this.zoneSensors.reduce((acc, sensor, index) => {
                acc[`deviceId${index + 1}`] = sensor.deviceEUI;
                return acc;
            }, {});

            try {
                await axios.post(apiUrl, deviceIds);
                this.zoneSensors.forEach(sensor => sensor.isOnline = !this.allOnZones);
                this.allOnZones = !this.allOnZones;
            } catch (error) {
                console.error('Error setting all devices state:', error);
            }
        },
        async toggleAllFCU() {
            console.log('Toggling all FCUs');
            this.isTogglingFCU = true;  // Disable the UI toggle switch for FCUs

            const apiUrl = ``;
            const state = this.allOnFCU ? 'on' : 'off';

            // Update only FCU states
            this.toggleDevices.forEach(device => {
                if (device.name.startsWith('FCU')) {
                    device.isOnline = this.allOnFCU;  // Update FCU's online status
                    console.log(`FCU ${device.name} is now ${this.allOnFCU ? 'ON' : 'OFF'}`);
                }
            });

            try {
                console.log(`Sending request to ${apiUrl} with state: ${state}`);
                const response = await axios.post(apiUrl, { state });
                console.log('Response from FCU API:', response.data);

                // Update only FCU states
                this.toggleDevices.forEach(device => {
                    if (device.name.startsWith('FCU')) {
                        device.isOnline = this.allOnFCU;  // Update FCU's online status
                        console.log(`FCU ${device.name} is now ${this.allOnFCU ? 'ON' : 'OFF'}`);
                    }
                });
            } catch (error) {
                console.error('Error toggling all FCUs:', error);
            } finally {
                this.isTogglingFCU = false;  // Re-enable the UI toggle switch
            }
        },
        async toggleAllMDU() {
            console.log('Toggling all MDUs');
            this.isTogglingMDU = true;  // Disable the toggle switch for MDUs

            const devices = this.toggleDevices.filter(device => device.name.startsWith('MCD'));
            const newState = this.allOnMDU;  // Determine new state (should only affect MDUs)

            for (const device of devices) {
                console.log(`Toggling MDU ${device.name} to ${newState ? 'ON' : 'OFF'}`);

                // Toggle each MDU individually and wait for the result
                await this.toggleSensor(device, newState);

                // After the API call is successful, update the MDU's online status
                device.isOnline = newState;
                console.log(`MDU ${device.name} is now ${newState ? 'ON' : 'OFF'}`);
            }
            try {
                // Loop through each MDU and make the API call to toggle its state
                for (const device of devices) {
                    console.log(`Toggling MDU ${device.name} to ${newState ? 'ON' : 'OFF'}`);

                    // Toggle each MDU individually and wait for the result
                    await this.toggleSensor(device, newState);

                    // After the API call is successful, update the MDU's online status
                    device.isOnline = newState;
                    console.log(`MDU ${device.name} is now ${newState ? 'ON' : 'OFF'}`);
                }

                // If all toggles are successful, update the allOnMDU state
                this.allOnMDU = newState;

            } catch (error) {
                // Log the error and potentially show a message to the user
                console.error('Error toggling all MDUs:', error);
            } finally {
                // Re-enable the toggle switch after the API call completes
                this.isTogglingMDU = false;
            }
        },
        async toggleDeviceState(device) {
            // Log the name and state of the device
            console.log(`${device.name} is being turned ${device.isOnline ? 'OFF' : 'ON'}`);

            if (device.name.startsWith('FCU')) {
                // Toggle aircon state for FCU
                await this.sendAirconState(!device.isOnline, device.airconIndex);
            } else if (device.name.startsWith('MCD')) {
                // Toggle MDU sensor state
                await this.toggleSensor(device, !device.isOnline);
            }

            // Update the device's online state after the toggle action
            device.isOnline = !device.isOnline;

            // Log the new status
            console.log(`${device.name} is now ${device.isOnline ? 'ON' : 'OFF'}`);
        },
        // Function to control the aircon (FCU)
        async sendAirconState(state, airconIndex) {
            const apiUrl = `${airconIndex + 2}`;
            const payload = { state: state ? 'on' : 'off' };
            // If FCU is being turned ON, turn OFF all MDUs
            if (state) {
                console.log('Aircon is ON, turning off all MDUs...');
                await this.toggleAllMDU(false);  // Pass false to turn off all MDUs
            }
            try {
                // Send request to toggle the aircon state
                await axios.post(apiUrl, payload);
                console.log(`FCU ${airconIndex + 2} turned ${state ? 'ON' : 'OFF'}`);

                // If FCU is being turned ON, turn OFF all MDUs
                if (state) {
                    console.log('Aircon is ON, turning off all MDUs...');
                    await this.toggleAllMDU(false);  // Pass false to turn off all MDUs
                }
            } catch (error) {
                console.error(`Error turning aircon ${airconIndex + 2} ${state ? 'on' : 'off'}:`, error);
            }
        },
        // Function to control MDU
        async toggleSensor(sensor, state) {
            const switchStates = state ? [1, 1, 1, 1, 1, 1, 1, 1] : [0, 0, 0, 0, 0, 0, 0, 0];  // Toggle on or off

            try {
                // Make the API call to toggle the MDU sensor state
                await axios.post('', {
                    deviceEui: sensor.deviceEUI,
                    switchStates
                });

                console.log(`MDU ${sensor.name} turned ${state ? 'ON' : 'OFF'}`);
            } catch (error) {
                console.error(`Error toggling sensor ${sensor.name}:`, error);
            }
        },
        generateChart() {
            // Register the required components for Bar and Line charts
            Chart.register(BarController, LineController, BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

            const ctx = document.getElementById('kwhChart').getContext('2d');

            // Data for the last 7 days
            const last7DaysData = [32, 35, 38, 31, 34, 31, 39]; // Example KWH consumption for the last 7 days
            const differences = last7DaysData.map((value, index, array) => {
                if (index === 0) return 0; // No difference for the first day
                return value - array[index - 1];
            });

            new Chart(ctx, {
                type: 'bar', // Bar chart for KWH Consumption
                data: {
                    labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
                    datasets: [
                        {
                            label: 'KWH Consumption',
                            data: last7DaysData,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            type: 'bar',
                        },
                        {
                            label: 'Difference Between Days',
                            data: differences,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderWidth: 2,
                            fill: false,
                            type: 'line',
                            yAxisID: 'differenceAxis',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'KWH',
                                color: 'white'
                            },
                            ticks: {
                                color: 'white'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        differenceAxis: {
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Difference (KWH)',
                                color: 'white'
                            },
                            ticks: {
                                color: 'white'
                            },
                            grid: {
                                drawOnChartArea: false // Prevent grid lines from overlapping
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Days',
                                color: 'white'
                            },
                            ticks: {
                                color: 'white'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            titleColor: 'white',
                            bodyColor: 'white'
                        }
                    }
                }
            });
        },
        toggleModal(sensor) {
            this.currentSensor = sensor || { isOnline: false, level1: 0, level2: 0 }; // Fallback to a default object if sensor is undefined
            this.modalTitle = sensor?.name || 'Unknown Sensor';
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        }
    },
    mounted() {
        this.fetchSensorData();
        this.generateChart();
    }
};
</script>

<style scoped>
/* Common styles */
.container {
    width: 100%;
    padding: 20px;
}

.text-center {
    text-align: center;
}

.section-container {
    margin-bottom: 30px;
    margin-right: 1%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.section-title {
    text-align: center;
    margin-bottom: 20px;
    color: white;
    font-weight: bold;
}

.sensor-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding-bottom: 10%;
}

.sensor-box {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 15px;
    text-align: center;
}

.face-indicator {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.face-icon {
    font-size: 1.5rem;
}

.floorplan-container {
    text-align: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    position: relative;
}

.floorplan-image-container {
    width: 100%;
    height: auto;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 10px;
    display: flex;
    justify-content: center;
}

.floorplan-image {
    width: 100%;
    border-radius: 5px;
}

.chart-box {
    height: 350px;
    /* Adjust height if needed */
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}


/* Console Control Styles */
.console-box {
    border-radius: 5px;
    padding: 15px;
    text-align: center;
}

.toggle-switch {
    display: flex;
    align-items: center;
    gap: 10px;
}

.switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
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
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 4px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: green;
}

input:checked+.slider:before {
    transform: translateX(14px);
}

/* Status dot styles for the floorplan */
.status-dot {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    position: absolute;
    z-index: 10;
}

.online {
    background-color: green;
}

.offline {
    background-color: red;
}

.console-box .sensor-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.all-on-control {
    display: flex;
    align-items: center;
    gap: 10px;
}

.modal-content {
    color: black;
}

/* Status dot styles */
.status-dot-floorplan {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    z-index: 10;
}

.online {
    background-color: green;
}

.offline {
    background-color: red;
}

/* Slider styles */
.switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
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
    content: '';
    height: 14px;
    width: 14px;
    left: 4px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: green;
}

input:checked+.slider:before {
    transform: translateX(14px);
}

@media (min-width: 1400px) {

    .container,
    .container-lg,
    .container-md,
    .container-sm,
    .container-xl,
    .container-xxl {
        max-width: 99%;
    }
}

.button-box {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.fas.fa-smile {
    color: #90ee90;
    /* Light green */
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
    color: black;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1050;
    width: 500px;
}
</style>
