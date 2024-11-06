<template>
  <div class="container-fluid mt-5">
    <h2 class="text-center mb-4">Smart Washroom System</h2>
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="map-section position-relative">
          <!-- Row to display occupancy info (4 parts) and floorplan (8 parts) side by side -->
          <div class="row">
            <!-- Occupancy Info section (4 parts) -->
            <div class="col-md-2">
              <div class="people-counter-info">
                <div class="male-counter-box">
                  <h5>Occupancy (Male Toilet)</h5>
                  <p>{{ icons[1].periodIn - icons[1].periodOut }} Pax</p>
                </div>
                <div class="female-counter-box mt-4">
                  <h5>Occupancy (Female Toilet)</h5>
                  <p>{{ icons[0].periodIn - icons[0].periodOut }} Pax</p>
                </div>
                <div class="female-counter-box mt-4">
                  <h5>Water Flow Measurement</h5>
                  <p>-</p>
                </div>
              </div>
            </div>

            <!-- Floorplan section (8 parts) -->
            <div class="col-md-10">
              <div class="map-container">
                <img src="@/assets/Sub System and Icons/V2/smart washroom_full1.png" alt="Map View" class="map-image">
                <!-- Multiple Icons on the Floorplan -->
                <div v-for="(icon, index) in icons" :key="index" class="icon-container"
                  :style="{ top: icon.top, left: icon.left }" @mouseenter="showValue(index, $event)"
                  @mouseleave="hideValue">
                  <div v-if="icon.pulsating" class="pulsate-ring"></div> <!-- Motion ring -->
                  <img :src="icon.src" alt="Sensor Icon" class="icon-image">
                  <!-- Tooltip should only show when hoveredIndex matches -->
                  <div v-if="hoveredIndex === index" class="value-tooltip"
                    :style="{ top: `${tooltipY}px`, left: `${tooltipX}px` }">
                    <h5>{{ icon.label }}</h5>
                    <template v-if="icon.type === 'People Counter'">
                      <p>Period In: {{ icon.periodIn }}</p>
                      <p>Period Out: {{ icon.periodOut }}</p>
                    </template>
                    <template v-else-if="icon.type === 'Odor Sensor'">
                      <p>Battery: {{ icon.battery }}%</p>
                      <p>Ammonia Level: {{ icon.nh3 }} ppm</p>
                      <p>Hydrogen Sulfide Level: {{ icon.h2s }} ppm</p>
                      <p>Temperature: {{ icon.temperature }}°C</p>
                      <p>Humidity: {{ icon.humidity }}%</p>
                    </template>
                  </div>
                </div>

                <!-- Button to Set Threshold at Bottom Right of Floorplan -->
                <div class="threshold-button">
                  <button @click="openThresholdModal" class="btn btn-primary">Set Threshold</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart section below the floorplan -->
          <div class="row mt-4">
            <div class="col-md-12 chart-container">
              <h5>Daily Water Consumption</h5>
              <canvas id="waterChart" style="max-height: 400px;"></canvas> <!-- Set max height -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal to Set Threshold -->
    <div v-if="showThresholdModal" class="modal-overlay" @click="closeThresholdModal"></div>
    <div v-if="showThresholdModal" class="modal d-block" style="z-index: 1050;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header justify-content-center">
            <h5 class="modal-title">Set People Counter Threshold</h5>
            <button type="button" class="btn-close position-absolute top-0 end-0"
              @click="closeThresholdModal">&times;</button>
          </div>
          <div class="modal-body text-center">
            <form @submit.prevent="saveThreshold">
              <div class="mb-3">
                <label for="thresholdInput" class="form-label">Threshold</label>
                <input type="number" min="1" step="1" class="form-control" id="thresholdInput" v-model="threshold"
                  placeholder="Enter threshold" required />
              </div>
              <button type="submit" class="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts Display -->
    <div class="overview-alerts mt-4">
      <ul>
        <li v-for="alert in getStoredAlerts()" :key="alert.timestamp">
          {{ alert.timestamp }} - {{ alert.message }}
        </li>
      </ul>
    </div>
  </div>
</template>



<script>
import axios from 'axios';
import peopleCounterIcon from '@/assets/peopleCounter.png';
import odorIcon from '@/assets/Odor.png';
import waterMeterIcon from '@/assets/water-meter-sensor.png';
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
  name: 'SmartWashroomSystem',
  data() {
    return {
      hoveredIndex: null,
      tooltipX: 0,
      tooltipY: 0,
      threshold: parseInt(localStorage.getItem('peopleCounterThreshold')) || 20, // Default threshold is 20
      showThresholdModal: false, // Modal visibility for setting threshold
      icons: [
        { top: '51%', left: '66%', src: peopleCounterIcon, label: 'People Counter', type: 'People Counter', periodIn: 0, periodOut: 0, oldPeriodIn: 0, oldPeriodOut: 0, pulsating: false },
        { top: '40.6%', left: '44%', src: peopleCounterIcon, label: 'People Counter', type: 'People Counter', periodIn: 0, periodOut: 0, oldPeriodIn: 0, oldPeriodOut: 0, pulsating: false },
        { top: '37.6%', left: '64.7%', src: odorIcon, label: 'Bathroom Odor Detector', type: 'Odor Sensor', battery: 0, nh3: 0, h2s: 0, temperature: 0, humidity: 0 },
        { top: '36%', left: '18%', src: odorIcon, label: 'Bathroom Odor Detector', type: 'Odor Sensor', battery: 0, nh3: 0, h2s: 0, temperature: 0, humidity: 0 },
        { top: '46%', left: '51.5%', src: waterMeterIcon, label: 'Water Meter', type: 'Water Meter', waterFlow: 15, waterConsumption: 1200 },
      ],
      notifications: [], // Store notifications in the state
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/toilet');
        const data = response.data;

        console.log('API Response:', data); // Log the API response to check the data

        // Update the People Counters and trigger animation
        this.updateCounterData(0, data['24e124716d496395']);
        this.updateCounterData(1, data['24e124716d496118']);

        // Update the first Odor Sensor
        const odorData1 = data['24e124798d482591'];
        this.updateOdorData(2, odorData1);

        // Update the second Odor Sensor
        const odorData2 = data['24e124798d482365'];
        this.updateOdorData(3, odorData2);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    updateCounterData(index, newData) {
      const icon = this.icons[index];
      const oldIn = icon.oldPeriodIn;
      const oldOut = icon.oldPeriodOut;
      const newIn = parseInt(newData.period_in, 10) || 0; // Ensure conversion to integer
      const newOut = parseInt(newData.period_out, 10) || 0; // Ensure conversion to integer

      console.log(`People Counter ${index + 1} - In: ${newIn}, Out: ${newOut}`); // Log the new values

      icon.periodIn = newIn;
      icon.periodOut = newOut;

      // Trigger pulsating animation if counts have increased
      if (newIn > oldIn || newOut > oldOut) {
        icon.pulsating = true;
        setTimeout(() => {
          icon.pulsating = false;
        }, 2000); // End pulsating after 2 seconds
      }

      // Store the new values as old values for the next comparison
      icon.oldPeriodIn = newIn;
      icon.oldPeriodOut = newOut;

      // Check if the number of people IN exceeds the threshold and send an alert
      if (newIn > this.threshold) {
        this.sendAlert(`People Counter ${index + 1} exceeded the threshold with ${newIn} people.`);
      }
    },
    sendAlert(message) {
      // Send a notification and store it in the state and local storage
      const timestamp = new Date().toLocaleString();
      const alert = { message, timestamp };

      // Add the alert to the notifications array
      this.notifications.push(alert);

      // Save the alert to local storage
      const storedAlerts = JSON.parse(localStorage.getItem('alerts')) || [];
      storedAlerts.push(alert);
      localStorage.setItem('alerts', JSON.stringify(storedAlerts));

      console.log('Alert sent:', message);
    },
    updateOdorData(index, newData) {
      const icon = this.icons[index];
      icon.battery = newData.battery || 0;
      icon.nh3 = newData.nh3 || 0;
      icon.h2s = newData.h2s || 0;
      icon.temperature = newData.temperature || 0;
      icon.humidity = newData.humidity || 0;
    },
    showValue(index, event) {
      const containerRect = event.currentTarget.getBoundingClientRect();
      const pointRect = event.target.getBoundingClientRect();
      this.tooltipX = pointRect.x + pointRect.width / 2 - containerRect.x;
      this.tooltipY = pointRect.y - containerRect.y - 10;
      this.hoveredIndex = index;
    },
    hideValue() {
      this.hoveredIndex = null;
    },
    openThresholdModal() {
      this.showThresholdModal = true;
    },
    closeThresholdModal() {
      this.showThresholdModal = false;
    },
    saveThreshold() {
      // Save the threshold to local storage and close the modal
      localStorage.setItem('peopleCounterThreshold', this.threshold);
      console.log('Threshold saved:', this.threshold);
      this.closeThresholdModal();
    },
    getStoredAlerts() {
      return JSON.parse(localStorage.getItem('alerts')) || [];
    },
    generateChart() {
      Chart.register(BarController, LineController, BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

      const ctx = document.getElementById('waterChart').getContext('2d');
      const last7DaysData = [0, 0, 0, 0, 0, 0, 0]; // Example data
      const differences = last7DaysData.map((value, index, array) => (index === 0 ? 0 : value - array[index - 1]));

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
          datasets: [
            {
              label: 'Water Consumption (liters)',
              data: last7DaysData,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              type: 'bar',
              yAxisID: 'y' // Assign to the left Y-axis
            },
            {
              label: 'Difference Between Days',
              data: differences,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2,
              fill: false,
              type: 'line',
              yAxisID: 'differenceAxis' // Assign to the right Y-axis
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Liters', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            differenceAxis: {
              position: 'right',
              beginAtZero: true,
              title: { display: true, text: 'Difference (Liters)', color: 'white' },
              ticks: { color: 'white' },
              grid: { drawOnChartArea: false } // Ensure grid lines don't overlap
            },
            x: {
              title: { display: true, text: 'Days', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          },
          plugins: {
            legend: { labels: { color: 'white' } },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: 'white',
              bodyColor: 'white'
            }
          }
        }
      });
    }
  },
  mounted() {
    this.fetchData();
    this.generateChart(); // Ensure chart is generated after DOM update
  }
};
</script>

<style scoped>
.container-fluid {
  width: 100%;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
}

.row {
  display: flex;
  justify-content: space-between;
}

.map-section {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 100%;
}

.map-image {
  width: 100%;
  height: auto;
}

.map-container {
  overflow: hidden;
  height: 100%;
  position: relative;
  cursor: default;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Icon Container */
.icon-container {
  position: absolute;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 1000;
}

.icon-image {
  width: 100%;
  height: 100%;
  visibility: hidden;
}

/* Tooltip for Sensor Value */
.value-tooltip {
  position: absolute;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  white-space: nowrap;
  font-size: 18px;
}

/* Button to Set Threshold */
.threshold-button {
  position: absolute;
  bottom: 30px;
  right: 10px;
}

/* Pulsating Ring */
@keyframes pulsate {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.pulsate-ring {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 123, 255, 0.5);
  border-radius: 50%;
  top: -8px;
  left: -8px;
  z-index: 999;
  animation: pulsate 1s ease-out infinite;
  pointer-events: none;
}

/* Modal and overlay styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
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
  width: 400px;
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

.modal-title {
  color: black;
}

.map-container {
  overflow: hidden;
  height: 100%;
  position: relative;
  cursor: default;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Container for people counters placed on the left side */
.people-counter-info {
  margin-right: 10px;
  /* Space between the counter boxes and the floorplan */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.male-counter-box,
.female-counter-box {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 150px;
  /* Adjust the width as needed */
}

.male-counter-box h5,
.female-counter-box h5 {
  margin-bottom: 10px;
  font-weight: bold;
}
</style>
