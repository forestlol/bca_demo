<template>
  <div class="app-container">
    <div class="sidebar" :class="{ 'expanded': isExpanded }">
      <div class="sidebar-header">
        <router-link to="/">
          <img :class="{ 'collapsed-logo': !isExpanded, 'expanded-logo': isExpanded }" src="@/assets/cavill_logo.png"
            alt="ITE Logo" class="logo-image">
        </router-link>
      </div>
      <ul class="sidebar-nav">
        <li class="nav-item">
          <router-link class="nav-link" to="/" exact>
            <i :class="['fas', 'fa-home', { 'active-icon': $route.path === '/' }]"></i>
            <span class="nav-text">Home</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/bms-reading">
            <i :class="['fas', 'fa-building', { 'active-icon': $route.path === '/bms-reading' }]"></i>
            <span class="nav-text">Building Management System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/fire-alarm-system">
            <img :src="FASIcon" alt="Fire Alarm System" class="icon-image"
              :class="{ 'active-icon': $route.path === '/fire-alarm-system' }">
            <span class="nav-text">Fire Alarm System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/smart-landscape-system">
            <i :class="['fas', 'fa-seedling', { 'active-icon': $route.path === '/smart-landscape-system' }]"></i>
            <span class="nav-text">Smart Landscape System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/smart-toilet-system">
            <i :class="['fas', 'fa-toilet', { 'active-icon': $route.path === '/smart-toilet-system' }]"></i>
            <span class="nav-text">Smart Wash Room System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/smart-pest-control-system">
            <i :class="['fas', 'fa-bug', { 'active-icon': $route.path === '/smart-pest-control-system' }]"></i>
            <span class="nav-text">Smart Pest Control System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/power-meter-reading">
            <i :class="['fas', 'fa-bolt', { 'active-icon': $route.path === '/power-meter-reading' }]"></i>
            <span class="nav-text">Smart Energy Management System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/asset-tagging-system">
            <i :class="['fas', 'fa-tags', { 'active-icon': $route.path === '/asset-tagging-system' }]"></i>
            <span class="nav-text">Asset Tagging System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/smart-lighting-system">
            <i :class="['fas', 'fa-lightbulb', { 'active-icon': $route.path === '/smart-lighting-system' }]"></i>
            <span class="nav-text">Smart Lighting System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/indoor-air-quality">
            <img :src="airFlowIcon" alt="Indoor Air Quality System" class="icon-image"
              :class="{ 'active-icon': $route.path === '/indoor-air-quality' }">
            <span class="nav-text">Indoor Air Quality System</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/hybrid-aircon">
            <img :src="airconIcon" alt="Hybrid Aircon System" class="icon-image"
              :class="{ 'active-icon': $route.path === '/hybrid-aircon' }">
            <span class="nav-text">Hybrid Aircon System</span>
          </router-link>
        </li>
      </ul>



      <button class="toggle-button" @click="toggleSidebar">
        <i :class="isExpanded ? 'fas fa-angle-left' : 'fas fa-angle-right'"></i>
      </button>
    </div>
    <div class="main-content" :class="{ 'shifted': isExpanded }">
      <div class="navbar">
        <div class="navbar-left">
          <span>{{ currentDate }}</span>
          <span>Calypso</span>
          <div class="location-weather">
            <span>Singapore</span>
            <span>{{ weather }} <img v-if="weatherIcon" :src="weatherIcon" alt="Weather Icon"
                class="weather-icon" /></span>
          </div>
        </div>
        <!-- Centered Text -->
        <div class="navbar-center">
          <span>Calypso</span>
        </div>
        <div class="navbar-right">
          <a href="http://52.237.90.38:82/" target="_blank" class="topbar-button control-tower-button">
            Control Tower
          </a>
          <span>{{ userName }}</span>
          <i class="fas fa-user"></i>
        </div>
      </div>
      <!-- Main content goes here -->
      <div class="content">
        <!-- Example content area -->
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import FASIcon from '@/assets/FAS-icon.png'; // Assuming this is the correct path
import airFlowIcon from '@/assets/air-flow.png';
import airconIcon from '@/assets/aircon.png';

export default {
  name: 'AppSidebar',
  data() {
    return {
      isExpanded: true, // Sidebar is expanded by default
      currentDate: '',
      weather: 'Fetching weather...',
      weatherIcon: null,
      userName: 'User',
      FASIcon, // Assigning the imported icon to be used in the template
      airFlowIcon,
      airconIcon,
    };
  },
  mounted() {
    this.updateDateTime();
    this.fetchWeather();
    setInterval(this.updateDateTime, 1000); // Update every second
  },
  methods: {
    toggleSidebar() {
      this.isExpanded = !this.isExpanded;
    },
    updateDateTime() {
      const date = new Date();
      this.currentDate = date.toLocaleString();
    },
    async fetchWeather() {
      try {
        const apiKey = 'b17e981c1815d9059a2c15e3bea2b02b';
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Singapore&appid=${apiKey}&units=metric`);
        const temp = response.data.main.temp;
        const description = response.data.weather[0].description;
        const icon = response.data.weather[0].icon;
        this.weather = `${temp}°C, ${description}`;
        this.weatherIcon = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
  }
};
</script>

<style scoped>
.location-weather {
  display: flex;
  flex-direction: column;
  /* gap: 5px; */
  font-size: 0.7rem;
  color: white;
}

.weather-icon {
  width: 40px;
  height: 40px;
  vertical-align: middle;
  /* Align the icon with the text */
}

.app-container {
  display: flex;
  background-image: url('@/assets/background.jpg');
}

.sidebar {
  width: 200px;
  transition: width 0.3s;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.1);
  /* Transparent sidebar */
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 2px solid rgba(255, 255, 255, 0.2);
  /* Transparent border */
  z-index: 1000;
}

.sidebar:not(.expanded) {
  width: 60px;
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 100%;
  flex-direction: column;
  margin: 14px;
}


.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.nav-item {
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  color: white;
  /* Default white text */
  text-decoration: none;
  background-color: transparent;
  /* Transparent background */
  transition: background-color 0.3s, color 0.3s;
  justify-content: flex-start;
  padding-left: 20px;
}

/* Collapsed sidebar adjustments */
.sidebar:not(.expanded) .nav-link {
  justify-content: center;
  padding-left: 0;
}

/* Default icon and text color */
.nav-link i,
.nav-link .icon-image {
  margin-right: 10px;
  color: white;
  /* Default icon color */
  filter: brightness(0) saturate(100%) invert(100%);
  /* Default image icon as white */
}

.icon-image {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  object-fit: contain;
}

/* Hover effect for links */
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  /* Lighter hover effect */
  color: white;
  /* White text on hover */
}

/* Active state: Blue icon, white text */
.nav-link.active .nav-text,
.nav-link.active i,
.nav-link.active .icon-image {
  color: white;
  /* White text for active link */
  /* Blue color for active image icon */
}

.active-icon {
  color: #007bff !important;
  /* Force blue color for active FontAwesome icons */
}

.sidebar-nav .nav-item .nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  /* Light background when active */
  color: lightblue;
  /* White text when active */
}

/* Text visibility in collapsed sidebar */
.nav-text {
  display: inline;
}

.sidebar:not(.expanded) .nav-text {
  display: none;
}

.sidebar:not(.expanded) .nav-link i,
.sidebar:not(.expanded) .nav-link .icon-image {
  margin-right: 0;
}

/* Toggle button styling */
.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-top: auto;
  margin-bottom: 10px;
  padding: 10px;
  color: white;
  /* White text */
}

.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s;
  margin-left: 200px;
  /* Adjusted for expanded sidebar width */
  background-color: rgba(0, 0, 0, 0.1);
  /* Transparent main content */
  color: white;
  /* White text in the content */
}

.sidebar:not(.expanded)~.main-content {
  margin-left: 60px;
  /* Adjusted for collapsed sidebar width */
}

.navbar {
  height: 8%;
  background-color: rgba(0, 0, 100, 0.8);
  /* Transparent navbar */
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  /* Transparent border */
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 200px);
  /* Adjusted for expanded sidebar width */
  transition: width 0.3s;
  position: fixed;
  top: 0;
  left: 200px;
  /* Adjusted for expanded sidebar width */
  z-index: 999;
  color: white;
  /* White text in the navbar */
}

.sidebar:not(.expanded)~.main-content .navbar {
  width: calc(100% - 60px);
  /* Adjusted for collapsed sidebar width */
  left: 60px;
  /* Adjusted for collapsed sidebar width */
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  /* White text */
}

.navbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  /* White text */
}

.weather-icon {
  width: 40px;
  height: 40px;
}

.content {
  /* Added padding-top to account for the fixed navbar */
  padding-top: 5%;
  /* Add margin-top to avoid overlapping with the navbar */
  transition: margin-left 0.3s;
  color: white;
  padding-bottom: 3%
    /* White text in the content area */
}

.sidebar:not(.expanded)~.main-content .content {
  margin-left: 60px;
  /* Adjusted for collapsed sidebar width */
}

/* General topbar button styling */
.topbar-button {
  background-color: rgba(255, 255, 255, 0.1);
  /* Transparent button */
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
  font-size: 14px;
}

.topbar-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  /* Slightly more visible on hover */
}

.control-tower-button {
  background-color: rgba(52, 58, 64, 0.7);
  /* Darker transparent background for Control Tower button */
}

.control-tower-button:hover {
  background-color: rgba(29, 33, 36, 0.7);
  /* Darker hover effect */
}

/* Styles for the ITE logo */
.logo-image {
  width: 60px;
  /* Set ITE logo to 60px */
  height: auto;
  transition: all 0.3s ease;
}

/* Sidebar and other styles remain unchanged */
/* Styles for the Cavill logo */
.cavill-logo {
  position: absolute;
  bottom: 60px;
  /* Place it just above the collapse button */
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  /* Set Cavill logo to 45px */
  height: auto;
  transition: all 0.3s ease;
}

.collapsed-logo {
  max-width: 40px;
  /* Smaller size when collapsed */
  height: auto;
  margin: 0 auto;
  display: block;
}

.expanded-logo {
  max-width: 80px;
  /* Full size when expanded */
  height: auto;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  /* Collapse button at the bottom */
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  color: white;
}

.app-container {
  display: flex;
  background: linear-gradient(to right, #0d47a1, #1565c0);
}

/* Adjusted logo-container styles */
.logo-container {
  display: flex;
  justify-content: center;
  /* Centers logos horizontally */
  align-items: center;
  /* Centers logos vertically */
  gap: 20px;
  /* Space between logos */
  width: 100%;
  /* Use full width of the container */
  position: absolute;
  bottom: 60px;
  /* Adjust this value if needed */
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

/* Ensure both logos have the same style */
.logo-image {
  width: 40px;
  /* Adjust the size as needed */
  height: auto;
  transition: all 0.3s ease;
  object-fit: contain;
  /* Ensures image fits nicely */
}

/* Adjust the logo-container when the sidebar is collapsed */
.sidebar:not(.expanded) .logo-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* Align logos towards the bottom */
  align-items: center;
  height: 100%;
  /* Take the full height of the sidebar */
  padding-bottom: 20px;
  /* Adjust padding to position the top logo correctly */
  position: relative;
  gap: 15px;
  /* Gap between the top and bottom logos */
}

/* Adjust the logo when the sidebar is collapsed */
.sidebar:not(.expanded) .logo-image {
  margin: 0;
  align-self: center;
  width: 40px;
  /* Ensure consistent size */
}


/* Adjust logo-container when sidebar is expanded */
.sidebar.expanded .logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  position: absolute;
  bottom: 60px;
  /* Place them above the collapse button */
  left: 50%;
  transform: translateX(-50%);
  width: auto;
}

/* Style for the Willowglen logo to make it bigger */
.willowglen-logo {
  width: 100px;
  /* Increase size as needed */
  max-width: 100px;
  /* Adjust maximum size as needed */
  height: auto;
  transition: all 0.3s ease;
}

/* When sidebar is collapsed */
.sidebar:not(.expanded) .willowglen-logo {
  width: 55px;
  /* Adjust size when collapsed */
}

/* When sidebar is expanded */
.sidebar.expanded .willowglen-logo {
  width: 100px;
  /* Adjust size when expanded */
}
</style>
