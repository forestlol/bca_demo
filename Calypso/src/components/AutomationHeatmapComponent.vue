<template>
  <div class="heatmap-container">
    <!-- Title Bar -->
    <div class="heatmap-title-bar">
      Floorplan - <span class="subtitle">{{ selectedFloor }}</span>
    </div>

    <!-- Floorplan Section -->
    <div class="heatmap-floorplan">
      <img src="@/assets/Floorplan2.jpg" alt="Floorplan" class="floorplan-image" />
      <div v-for="(circle, index) in circles" :key="circle.id" class="circle" :style="{
        top: circle.y + '%',
        left: circle.x + '%',
        width: (circle.size || 20) + 'px',
        height: (circle.size || 20) + 'px',
        borderColor: circle.color || 'lightgreen'
      }" @mouseenter="showValue(index, $event)" @mouseleave="hideValue"></div>
      <div v-if="tooltip.visible" class="value-tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
        <h5>{{ tooltip.title }}</h5>
        <p>Usage (Daily): {{ tooltip.dailyUsage }} kWh</p>
        <p>Activities: {{ tooltip.activityCount }}</p>
        <p>State: {{ tooltip.onoffState === 1 ? 'On' : 'Off' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      selectedFloor: "GE Canteen",
      circles: [
        {
          id: 1,
          x: 79,
          y: 46,
          title: "Zone 1",
          deviceID: "0004ED01000018F5",
          dailyUsage: 0,
          activityCount: 0,
          onoffState: 0,
          updated: false  // Added flag: false means not updated yet.
        },
        {
          id: 2,
          x: 64,
          y: 46,
          title: "Zone 2",
          deviceID: "0004ED01000018E5",
          dailyUsage: 0,
          activityCount: 0,
          onoffState: 0,
          updated: false
        },
        {
          id: 3,
          x: 48,
          y: 46,
          title: "Zone 3",
          deviceID: "0004ED0100001866",
          dailyUsage: 0,
          activityCount: 0,
          onoffState: 0,
          updated: false
        },
        {
          id: 4,
          x: 32,
          y: 46,
          title: "Zone 4",
          deviceID: "0004ED0100001678",
          dailyUsage: 0,
          activityCount: 0,
          onoffState: 0,
          updated: false
        },
        {
          id: 5,
          x: 17,
          y: 46,
          title: "Zone 5",
          deviceID: "0004ED01000018FE",
          dailyUsage: 0,
          activityCount: 0,
          onoffState: 0,
          updated: false
        },
      ],
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        title: "",
        dailyUsage: 0,
        activityCount: 0,
        onoffState: 0, // Add tooltip state as well.
      },
    };
  },
  methods: {
    async fetchAndUpdateCircles() {
      // Loop over each circle in your circles array.
      for (const circle of this.circles) {
        // If the circle has already been updated, skip further fetching.
        if (circle.updated) continue;
        // Prepare form data per the API requirements.
        const formData = new URLSearchParams();
        formData.append("deviceID", circle.deviceID);

        try {
          // Use postWithRetry to handle token errors.
          const response = await this.postWithRetry(
            "https://ge-lumani.ngrok.app/api/GetMinuteTrend",
            formData,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );
          console.log(`Response for device ${circle.deviceID}:`, response.data);
          if (response.data.code === 1 && response.data.data) {
            const data = response.data.data;
            const totalUsage = data.yData.reduce((sum, val) => sum + parseFloat(val || 0), 0);
            const activityCount = data.yData2.reduce((count, val) => count + (parseFloat(val) !== 0 ? 1 : 0), 0);
            circle.dailyUsage = totalUsage.toFixed(1);
            circle.activityCount = activityCount;
            if (activityCount === 0) {
              circle.color = "blue"; // Minimal activity → blue
              circle.size = 20;
            } else if (activityCount < 100) {
              circle.color = "orange"; // Some activity → orange
              circle.size = 20 + (activityCount / 100) * 20;
            } else {
              circle.color = "red"; // Busy mode → red
              circle.size = Math.min(20 + ((activityCount - 100) / 100) * 20 + 40, 80);
            }
            // Mark this circle as updated.
            circle.updated = true;
          } else {
            console.error(`Unexpected API response for device ${circle.deviceID}:`, response.data);
          }
        } catch (error) {
          console.error(`Error fetching data for device ${circle.deviceID}:`, error);
        }
      }
    },
    async fetchOverviewList() {
      // Prepare form data with MacID=0.
      const formData = new URLSearchParams();
      formData.append("MacID", "0");

      try {
        const response = await axios.post(
          "https://ge-lumani.ngrok.app/api/GetOverviewList",
          formData,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        console.log("Overview List Response:", response.data);
        if (response.data.code === 1 && Array.isArray(response.data.data)) {
          response.data.data.forEach(zone => {
            // Find matching circle by DeviceID.
            const matchingCircle = this.circles.find(c => c.deviceID === zone.DeviceID);
            if (matchingCircle && zone.State) {
              matchingCircle.onoffState = Number(zone.State.onoffstate);
              console.log(`Zone ${matchingCircle.title} updated to ${matchingCircle.onoffState === 1 ? "ON" : "OFF"}`);
            }
          });
        } else {
          console.error("Unexpected Overview List response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching overview list:", error);
      }
    },
    async postWithRetry(url, data, config) {
      let retryCount = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const response = await axios.post(url, data, config);
          return response;
        } catch (error) {
          let errStr = "";
          if (error.response && error.response.data) {
            errStr = error.response.data.error || error.response.data.msg || "";
          }
          if (errStr.includes("Incorrect token") || errStr.includes("validation failed")) {
            console.warn("Token error detected, retrying in 1 second...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retryCount++;
            if (retryCount >= 15) {
              console.error("Maximum retries reached for token error. Aborting.");
              throw error;
            }
            continue;
          } else {
            throw error;
          }
        }
      }
    },
    // Use a recursive update loop if you need to refresh periodically.
    async updateCirclesLoop() {
      await this.fetchAndUpdateCircles();
      await this.fetchOverviewList();
      // Schedule next update after 5 minutes (adjust as needed)
      setTimeout(() => {
        this.updateCirclesLoop();
      }, 5000);
    },
    showValue(index, event) {
      const circle = this.circles[index];
      this.tooltip.visible = true;
      this.tooltip.x = event.clientX + 15;
      this.tooltip.y = event.clientY + 15;
      this.tooltip.title = circle.title;
      this.tooltip.dailyUsage = circle.dailyUsage;
      this.tooltip.activityCount = circle.activityCount;
      this.tooltip.onoffState = circle.onoffState;
    },
    hideValue() {
      this.tooltip.visible = false;
    }
  },
  mounted() {
    // Start the update loop.
    this.updateCirclesLoop();
  }
};
</script>

<style scoped>
.heatmap-container {
  border: 2px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.heatmap-title-bar {
  background-color: rgba(184, 184, 184, 0.1);
  color: black;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
}

.heatmap-floorplan {
  position: relative;
  width: 100%;
  height: auto;
}

.floorplan-image {
  display: block;
  width: 100%;
  height: auto;
}

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: transparent;
  border: 2px solid lightgreen;
  border-radius: 50%;
  cursor: pointer;
}

.value-tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 10;
  text-align: left;
  pointer-events: none;
  white-space: nowrap;
}
</style>
