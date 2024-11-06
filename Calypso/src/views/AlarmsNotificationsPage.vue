<template>
  <div class="container-fluid mt-5">
    <h2 class="text-center mb-4">Alarms & Notifications</h2>
    <div class="alarm-notification-list">
      <div v-if="feedData.length === 0" class="feed-item">
        <p>No alerts to display.</p>
      </div>
      <div v-for="(feed, index) in feedData" :key="index" class="feed-item">
        <p>{{ feed.message }}</p>
        <small>{{ feed.time }}</small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
name: 'AlarmsNotificationsPage',
data() {
  return {
    feedData: [],
  };
},
mounted() {
  // Load alerts from local storage
  const storedAlerts = JSON.parse(localStorage.getItem('alerts')) || [];
  this.feedData = storedAlerts;
},
};
</script>

<style scoped>
.container-fluid {
  max-width: 1200px;
  min-height: 100vh; /* Ensures the container covers the full viewport height */
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.alarm-notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.alarm-notification-list::-webkit-scrollbar {
  width: 8px;
}
.alarm-notification-list::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}
.alarm-notification-list::-webkit-scrollbar-thumb {
  background-color: lightgrey;
  border-radius: 5px;
  border: 2px solid #f8f9fa;
}
.feed-item {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.feed-item:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.feed-item p {
  margin-bottom: 5px;
  font-size: 1rem;
  color: white;
}
.feed-item small {
  font-size: 0.875rem;
  color: white;
}
</style>
