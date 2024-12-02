<template>
    <div class="heatmap-container">
      <!-- Toolbar Section -->
      <div class="toolbar">
        <div class="toolbar-item">
          <label>
            <input type="checkbox" v-model="autoRefresh" />
            Auto refresh
          </label>
        </div>
        <div class="toolbar-item">
          <label for="floor-selection">Choose Floor:</label>
          <select id="floor-selection" v-model="selectedFloor">
            <option>Floor 1</option>
            <option>Floor 2</option>
            <option>Floor 3</option>
          </select>
        </div>
        <div class="toolbar-item">
          <label>Statistical time:</label>
          <input type="datetime-local" v-model="startDateTime" />
          <span>to</span>
          <input type="datetime-local" v-model="endDateTime" />
        </div>
        <div class="toolbar-item">
          <button @click="searchData">🔍 Search</button>
        </div>
      </div>
  
      <!-- Title Bar -->
      <div class="heatmap-title-bar">
        Heatmap Distribution Chart <span class="subtitle">Floor 1</span>
      </div>
  
      <!-- Floorplan Section -->
      <div class="heatmap-floorplan">
        <img src="@/assets/Floorplan.jpg" alt="Floorplan" class="floorplan-image" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        autoRefresh: false,
        selectedFloor: "Floor 1",
        startDateTime: "-",
        endDateTime: "-",
      };
    },
    methods: {
      searchData() {
        console.log("Search clicked");
        console.log("Auto Refresh:", this.autoRefresh);
        console.log("Selected Floor:", this.selectedFloor);
        console.log("Statistical Time:", this.startDateTime, "to", this.endDateTime);
        // Add your search functionality logic here
      },
    },
  };
  </script>
  
  <style scoped>
  .heatmap-container {
    padding-top:65px;
    border: 2px solid #ddd;
    border-radius: 10px;
    overflow: hidden;
    background-color: #f9f9f9;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #f1f1f1;
    border-bottom: 1px solid #ddd;
  }
  
  .toolbar-item {
    margin: 5px;
  }
  
  .toolbar-item label {
    margin-right: 10px;
  }
  
  .toolbar-item input[type="datetime-local"] {
    padding: 5px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .toolbar-item select {
    padding: 5px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .toolbar-item button {
    padding: 5px 15px;
    font-size: 14px;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .toolbar-item button:hover {
    background-color: #0056b3;
  }
  
  .heatmap-title-bar {
    background-color: rgba(184, 184, 184, 0.1);
    color: black;
    padding: 10px 20px;
    font-size: 18px;
    font-weight: bold;
    text-align: left;
  }
  
  .subtitle {
    font-size: 14px;
    color: black;
    margin-left: 5px;
  }
  
  .heatmap-floorplan {
    position: relative;
    width: 100%;
    height: auto;
    overflow: hidden;
  }
  
  .floorplan-image {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
  </style>
  