<template>
  <div>
    <!-- Tabs Navigation (Centered) -->
    <nav class="tabs">
      <button :class="{ active: activeTab === 'floorplan' }" @click="activeTab = 'floorplan'" type="button">
        Floorplan
      </button>
      <button :class="{ active: activeTab === 'devices' }" @click="activeTab = 'devices'" type="button">
        Devices
      </button>
    </nav>

    <!-- Floorplan Tab Content -->
    <div v-if="activeTab === 'floorplan'" class="heatmap-container">
      <div class="heatmap-title-bar">
        Water Meter Pin Location
      </div>
      <div class="heatmap-floorplan">
        <img :src="waterMapImage" alt="Floorplan" class="floorplan-image" />
        <!-- Circles for meters -->
        <div v-for="circle in circles" :key="circle.id" class="circle"
          :style="{ top: circle.y + '%', left: circle.x + '%' }" @mouseenter="showTooltip(circle, $event)"
          @mouseleave="hideTooltip"></div>
        <!-- Tooltip -->
        <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
          <p><strong>{{ tooltip.title }}</strong></p>
          <p>Device: {{ tooltip.deviceName }}</p>
          <p>Meter Reading: {{ tooltip.meterReading }} m³</p>
        </div>
      </div>
    </div>

    <!-- Devices Tab Content -->
    <div v-if="activeTab === 'devices'" class="devices-container">
      <div class="devices-header">
        <h2>
          Total Water Consumption: {{ totalWaterConsumption }} m³
          <br>
          Total Daily Consumption: {{ totalDailyConsumption }} m³
          <br>
          Total Monthly Consumption: {{ totalMonthlyConsumption }} m³
        </h2>
      </div>

      <div v-if="loadingDevices" class="loading">
        Loading devices...
      </div>
      <div v-else>
        <section v-for="(devices, category) in categorizedDevices" :key="category" class="category">
          <h3>{{ category }}</h3>
          <div class="grid-container">
            <!-- For Other Devices, render the combined card if available -->
            <template v-if="category === 'Other Devices'">
              <div v-if="combinedMain6" class="grid-item">
                <div class="summary">
                  <h4>{{ combinedMain6.device_name }}</h4>
                  <p>
                    Total Consumption:
                    <strong>{{ combinedMain6.totalConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Daily):
                    <strong>{{ combinedMain6.dailyConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Monthly):
                    <strong>{{ combinedMain6.monthlyConsumption }} m³</strong>
                  </p>
                </div>
              </div>
              <!-- Render the rest of Other Devices that are not part of the combined group -->
              <div
                v-for="device in devices.filter(d => !['8254812307000003', '8254812211000171', '8254812211000172'].includes(d.dev_eui))"
                :key="device.id" class="grid-item">
                <div class="summary">
                  <h4>{{ device.device_name }}</h4>
                  <p>Dev EUI: {{ device.dev_eui }}</p>
                  <p>
                    Total Consumption:
                    <strong>{{ device.totalConsumption || "0.00" }} m³</strong>
                  </p>
                  <p>Consumption (Daily):
                    <strong>{{ device.dailyConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Monthly):
                    <strong>{{ device.monthlyConsumption }} m³</strong>
                  </p>
                </div>
              </div>
            </template>
            <!-- For other categories, render as before -->
            <template v-else>
              <div v-for="device in devices" :key="device.id" class="grid-item">
                <div class="summary">
                  <h4>{{ device.device_name }}</h4>
                  <p>Dev EUI: {{ device.dev_eui }}</p>
                  <p>
                    Total Consumption:
                    <strong>{{ device.totalConsumption || "0.00" }} m³</strong>
                  </p>
                  <p>Consumption (Daily):
                    <strong>{{ device.dailyConsumption }} m³</strong>
                  </p>
                  <p>Consumption (Monthly):
                    <strong>{{ device.monthlyConsumption }} m³</strong>
                  </p>
                </div>
              </div>
            </template>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'floorplan',
      // Hard‑coded pin locations + readings
      circles: [
        { id: 1, x: 10, y: 10, title: 'Meter 1', deviceName: 'Meter 1', meterReading: 10.5 },
        { id: 2, x: 30, y: 20, title: 'Meter 2', deviceName: 'Meter 2', meterReading: 20.5 },
        { id: 3, x: 50, y: 40, title: 'Meter 3', deviceName: 'Meter 3', meterReading: 30.5 },
        { id: 4, x: 70, y: 60, title: 'Meter 4', deviceName: 'Meter 4', meterReading: 40.5 },
        { id: 5, x: 20, y: 80, title: 'Meter 5', deviceName: 'Meter 5', meterReading: 50.5 }
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: '',
        deviceName: '',
        meterReading: 0
      },
      // Hard‑coded devices grouped into categories
      categorizedDevices: {
        'Zone A': [
          { id: 1, dev_eui: 'EUI1', device_name: 'Meter 1', totalConsumption: 100, dailyConsumption: 10, monthlyConsumption: 50 },
          { id: 2, dev_eui: 'EUI2', device_name: 'Meter 2', totalConsumption: 200, dailyConsumption: 20, monthlyConsumption: 100 }
        ],
        'Zone B': [
          { id: 3, dev_eui: 'EUI3', device_name: 'Meter 3', totalConsumption: 300, dailyConsumption: 30, monthlyConsumption: 150 },
          { id: 4, dev_eui: 'EUI4', device_name: 'Meter 4', totalConsumption: 400, dailyConsumption: 40, monthlyConsumption: 200 }
        ],
        'Other Devices': [
          // these first three get combined into the “Combined Meter” card
          { id: 6, dev_eui: 'EUI1', device_name: 'Meter 1', totalConsumption: 100, dailyConsumption: 10, monthlyConsumption: 50 },
          { id: 7, dev_eui: 'EUI2', device_name: 'Meter 2', totalConsumption: 200, dailyConsumption: 20, monthlyConsumption: 100 },
          { id: 8, dev_eui: 'EUI3', device_name: 'Meter 3', totalConsumption: 300, dailyConsumption: 30, monthlyConsumption: 150 },
          // any others just render normally
          { id: 5, dev_eui: 'EUI5', device_name: 'Meter 5', totalConsumption: 500, dailyConsumption: 50, monthlyConsumption: 250 }
        ]
      }
    };
  },
  computed: {
    // flat list of all devices
    devices() {
      return Object.values(this.categorizedDevices).flat();
    },
    // combine the first three in 'Other Devices' into one card
    combinedMain6() {
      const toCombine = ['EUI1', 'EUI2', 'EUI3'];
      const group = this.devices.filter(d => toCombine.includes(d.dev_eui));
      if (!group.length) return null;
      return {
        device_name: 'Combined Meter',
        totalConsumption: group.reduce((s, d) => s + d.totalConsumption, 0).toFixed(2),
        dailyConsumption:    group.reduce((s, d) => s + d.dailyConsumption, 0).toFixed(2),
        monthlyConsumption:  group.reduce((s, d) => s + d.monthlyConsumption, 0).toFixed(2)
      };
    },
    totalWaterConsumption() {
      return this.devices
        .reduce((s, d) => s + d.totalConsumption, 0)
        .toFixed(2);
    },
    totalDailyConsumption() {
      return this.devices
        .reduce((s, d) => s + d.dailyConsumption, 0)
        .toFixed(2);
    },
    totalMonthlyConsumption() {
      return this.devices
        .reduce((s, d) => s + d.monthlyConsumption, 0)
        .toFixed(2);
    },
    waterMapImage() {
      return require('@/assets/WaterMap.png');
    }
  },
  methods: {
    showTooltip(circle, event) {
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY + 10,
        title: circle.title,
        deviceName: circle.deviceName,
        meterReading: circle.meterReading.toFixed(2)
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    }
  }
};
</script>



<style scoped>
/* Centered Tabs Navigation */
.tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
  padding-top: 5%;
}

.tabs button {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: border-bottom 0.3s, font-weight 0.3s;
}

.tabs button.active {
  border-bottom: 2px solid black;
  font-weight: bold;
}

/* Floorplan & Tooltip Styles */
.heatmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
}

.heatmap-title-bar {
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}

.heatmap-floorplan {
  position: relative;
}

.floorplan-image {
  width: 100%;
  display: block;
}

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
}

.value-tooltip {
  position: fixed;
  background: #000;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}

/* Devices Tab Styles */
.devices-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
}

.devices-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
}

.devices-header h2 {
  margin: 0;
  font-size: 20px;
}

.devices-header p {
  margin: 0;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.category {
  margin-bottom: 30px;
}

.category h3 {
  font-size: 18px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}


/* Device Card (Box) with Hover Interaction */
.grid-item {
  position: relative;
  overflow: hidden;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 4px;
  transition: box-shadow 0.3s ease;
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary {
  transition: opacity 0.3s ease;
}

.detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 10px;
  box-sizing: border-box;
}

.grid-item:hover .detail-overlay {
  opacity: 1;
}

.grid-item h4 {
  margin: 0 0 10px;
  font-size: 16px;
}

.grid-item p {
  margin: 5px 0;
  font-size: 14px;
}
</style>
