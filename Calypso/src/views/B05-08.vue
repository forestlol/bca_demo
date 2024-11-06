<template>
    <div class="container">
        <h2 class="text-center mb-4">COLLABORATIVE DESIGN CENTRE [B05-08]</h2>

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
            <div class="col-lg-6 section-container chart-container">
                <div class="chart-box">
                    <h3 class="section-title">KWH Daily Consumption</h3>
                    <canvas id="kwhChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Second Row: Floorplan and Console Control -->
        <div class="row mt-4">
            <!-- Floorplan Section - 80% width -->
            <div class="col-lg-8 section-container">
                <h3 class="section-title">Room Layout</h3>
                <div class="floorplan-container">
                    <div class="floorplan-image-container">
                        <img :src="floorplanImage" alt="Floorplan for B05-13/14" class="floorplan-image" />

                        <!-- Status Dots on Floorplan -->
                        <div v-for="(sensor, index) in currentSensors" :key="index" class="status-dot"
                            :class="sensor.isOnline ? 'online' : 'offline'"
                            :style="{ top: sensor.top, left: sensor.left }">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Console Control Section - 20% width -->
            <div class="col-lg-4 section-container">
                <h3 class="section-title">Control Panel</h3>
                <div class="console-box">
                    <h4>All On/Off Control</h4>
                    <label class="switch">
                        <input type="checkbox" v-model="allOn">
                        <span class="slider round"></span>
                    </label>
                    <span>{{ allOn ? 'ALL Lights ON' : 'ALL Lights OFF' }}</span>

                    <!-- Sliders for Individual Sensors (positioned here under the "ALL ON/OFF" control) -->
                    <div class="sensor-list">
                        <div v-for="(sensor, index) in currentSensors" :key="index" class="sensor-control">
                            <span :style="{ color: sensor.isOnline ? 'lightgreen' : 'white' }">{{ sensor.name }} ({{
                                sensor.isOnline ? 'Lights On' : 'Lights Off' }})</span>
                            <label class="switch">
                                <input type="checkbox" v-model="sensor.isOnline"
                                    @change="setZoneState(sensor.isOnline, sensor)" />
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import axios from 'axios';
import {
    Chart,
    BarController,
    LineController,
    BarElement,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

export default {
    data() {
        return {
            sensorData: {
                co2: null,
                temperature: null,
                humidity: null,
                pm2_5: null,
                pm10: null
            },
            currentSensors: [
                { top: '29%', left: '66%', name: 'Row 1', isOnline: false, lastUpdated: '2024-05-29 14:30:00', deviceEUI: '24E124782D131508' },
                { top: '18%', left: '64%', name: 'Row 2', isOnline: false, lastUpdated: '2024-05-29 14:30:00', deviceEUI: '24E124782D131142' },
                { top: '18%', left: '59%', name: 'Row 3', isOnline: false, lastUpdated: '2024-05-29 14:30:00', deviceEUI: '24E124782D131803' },
                { top: '18%', left: '53%', name: 'Row 4', isOnline: false, lastUpdated: '2024-05-29 14:30:00', deviceEUI: '24E124782D131818' },
                { top: '18%', left: '47%', name: 'Row 5', isOnline: false, lastUpdated: '2024-05-29 14:30:00', deviceEUI: '24E124782D131201' },
                { top: '18%', left: '41%', name: 'Row 6', isOnline: false, lastUpdated: '2024-05-29 14:30:00', deviceEUI: '24E124782D131779' }
            ],
            allOn: false,
            floorplanImage: require('@/assets/Sub System and Icons/V2/B05-08_empty_light.png')
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
        async fetchSensorData() {
            try {
                const response = await axios.get('https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/sheet/IAQ');
                const data = response.data['24e124710d482388']; // Fetch data by device ID

                this.sensorData.co2 = data.co2;
                this.sensorData.temperature = data.temperature;
                this.sensorData.humidity = data.humidity;
                this.sensorData.pm2_5 = data.pm2_5;
                this.sensorData.pm10 = data.pm10;
            } catch (error) {
                console.error('Error fetching sensor data:', error);
            }
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
        generateChart() {
            // Registering the required components
            Chart.register(BarController, LineController, BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

            const ctx = document.getElementById('kwhChart').getContext('2d');

            // Sample data for the last 7 days
            const last7DaysData = [32, 33, 33, 40, 38, 38, 33]; // Example KWH consumption for the last 7 days
            const differences = last7DaysData.map((value, index, array) => {
                if (index === 0) return 0; // No difference for the first day
                return value - array[index - 1];
            });

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'], // Labels for the last 7 days
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
                            yAxisID: 'differenceAxis', // Separate axis for differences
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
                                drawOnChartArea: false // Prevent grid lines from overlapping with the main chart
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
                                color: 'white' // Set legend text color to white
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tooltip background
                            titleColor: 'white', // Set tooltip title color to white
                            bodyColor: 'white'  // Set tooltip body text color to white
                        }
                    }
                }
            });
        },
        async sendSwitchCommand(deviceEUI, switchStates) {
            const sensor = this.currentSensors.find(s => s.deviceEUI === deviceEUI);
            if (sensor) {
                sensor.isOnline = switchStates.every(state => state === 1);
            }
            try {
                console.log('Sending switch command to device:', deviceEUI, 'with states:', switchStates);

                const response = await axios.post('', {
                    deviceEui: deviceEUI,
                    switchStates: switchStates
                });

                console.log('Received response from server:', response.data);

                if (response && response.data) {
                    const sensor = this.currentSensors.find(s => s.deviceEUI === deviceEUI);
                    if (sensor) {
                        sensor.isOnline = switchStates.every(state => state === 1);
                    }
                } else {
                    console.log('Switch command sent but no data returned from server');
                }
            } catch (error) {
                console.log('Error sending switch command:', error);
            }
        },
        async toggleAllDevices() {
            const switchStates = this.allOn ? [1, 1, 1] : [0, 0, 0];  // Example with 3 switches for ON/OFF
            for (const sensor of this.currentSensors) {
                await this.sendSwitchCommand(sensor.deviceEUI, switchStates);
            }
        },
        async setZoneState(state, sensor) {
            const switchStates = state ? [1, 1, 1] : [0, 0, 0];  // Example with 3 switches for ON/OFF
            await this.sendSwitchCommand(sensor.deviceEUI, switchStates);
        }
    },
    mounted() {
        this.fetchSensorData(); // Fetch sensor data when the component is mounted
        this.generateChart(); // Generate the 7-day bar and line chart
    },
    watch: {
        allOn() {
            this.toggleAllDevices();
        }
    }
};
</script>


<style scoped>
.container {
    width: 100%;
    padding: 20px;
}

.text-center {
    text-align: center;
}

.section-container {
    margin-bottom: 30px;
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
    position: relative;
    /* Make the container relative for absolute positioning inside */
    text-align: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
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

.chart-box,
.console-box {
    border-radius: 5px;
    padding: 15px;
    text-align: center;
}

.chart-box {
    height: 300px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}

.text-success {
    color: green;
}

.text-danger {
    color: red;
}

.row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.section-container {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 20px;
    margin-bottom: 30px;
    flex: 1;
}

/* Container for Console Control */
.console-box {
    border-radius: 5px;
    padding: 15px;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
}

/* Styling for the Sensor List inside the console box */
.sensor-list {
    margin-top: 20px;
    /* Ensure the list appears below the All ON/OFF toggle */
}

/* Flexbox for sensor control */
.sensor-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

/* Styling for the individual switch controls */
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
    height: 12px;
    width: 12px;
    left: 4px;
    bottom: 4px;
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

.status-dot {
    position: absolute;
    /* Absolutely position the status dots based on the top/left of the sensors */
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.online {
    background-color: green;
}

.offline {
    background-color: red;
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
</style>
