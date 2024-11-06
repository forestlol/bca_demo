<template>
    <div class="datetime-weather">
      <div class="datetime">
        <p>{{ formattedDate }}</p>
        <p>{{ formattedTime }}</p>
      </div>
      <div class="weather">
        <p>{{ weather.location }}</p>
        <p>{{ weather.temperature }}°C</p>
        <p>{{ weather.description }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        currentDate: new Date(),
        weather: {
          location: 'Singapore',
          temperature: 30,
          description: 'Sunny',
        },
      };
    },
    computed: {
      formattedDate() {
        return this.currentDate.toLocaleDateString();
      },
      formattedTime() {
        return this.currentDate.toLocaleTimeString();
      },
    },
    mounted() {
      setInterval(() => {
        this.currentDate = new Date();
      }, 1000);
      this.fetchWeather();
    },
    methods: {
      fetchWeather() {
        // Add logic to fetch weather data from an API
        // For simplicity, this example uses static data
        this.weather = {
          location: 'Singapore',
          temperature: 30,
          description: 'Sunny',
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .datetime-weather {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid #d3d3d3;
    margin-top: 20px;
  }
  .datetime p,
  .weather p {
    margin: 0;
    font-size: 16px;
  }
  .weather {
    text-align: right;
  }
  </style>
  