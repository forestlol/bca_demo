<template>
  <div class="additional-card quick-links">
    <h4>Fault Call / Ticket</h4>
    <div class="links-content">
      <div class="column-titles">
        <span class="column-title">ID</span>
        <span class="column-title">Description</span>
        <span class="column-title">Status</span>
        <span class="column-title">Created At</span>
        <span class="column-title">Site Name</span>
      </div>
      <div
        v-for="(link, index) in quickLinks"
        :key="index"
        :class="['quick-link-item', getRowClass(link.latest_status)]"
      >
        <span class="column">{{ link.fault_number }}</span>
        <span class="column">{{ link.type_name }}</span>
        <span class="column">{{ link.latest_status ? link.latest_status : 'Pending' }}</span>
        <span class="column">{{ formatDate(link.created_at) }}</span>
        <span class="column">{{ link.sites_name.join(', ') }}</span>
      </div>
    </div>
  </div>
  <div class="filler-div"></div> <!-- Empty div to fill up the space -->
</template>

<script>
export default {
  name: 'FaultCallTicket',
  data() {
    return {
      quickLinks: [], // Data will be fetched from API
    };
  },
  created() {
    this.fetchFaultData();
  },
  methods: {
    async fetchFaultData() {
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/api/Faults');
        const data = await response.json();
        this.quickLinks = data; // Assign the data from the API
      } catch (error) {
        console.error('Error fetching fault data:', error);
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return date.toLocaleString(); // Format the date to a more readable string
    },
    getRowClass(status) {
      if (status === 'work_completed') {
        return 'work_completed'; // Green background
      } else if(status === "site_reached")
        return 'site_reached'
      else {
        return 'pending'; // Orange background
      }
    },
  },
};
</script>

<style scoped>
.filler-div {
  flex-grow: 1; /* Allows it to grow and fill the available space */
  margin: 0; /* Ensures no margin is added */
  padding: 5%; /* Ensures no padding is added */
  border: none; /* Ensures no border is added */
}

.additional-card.quick-links {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%; /* Ensure the card takes full height */
  border: none; /* Remove border to eliminate the white border */
  margin-bottom: 0; /* Ensure no margin at the bottom */
}

.links-content {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Adjust the gap between buttons as needed */
  margin-top: 10px; /* Add margin to separate the title and content */
  width: 100%; /* Ensure it fills the available width */
  overflow-y: auto; /* Enable vertical scrolling if content overflows */
  flex-grow: 1; /* Allow it to grow to fill the available space */
  border: none; /* Remove border if any */
  padding-bottom: 0; /* Remove any bottom padding */
}

.column-titles {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px; /* Add padding for a cleaner look */
  border-radius: 5px; /* Rounded corners for the header */
}

.column-title {
  flex: 1;
  text-align: center;
}

.quick-link-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%; /* Ensure it fills the available width */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  text-align: center; /* Align text to the center */
  font-size: 12px; /* Smaller font size */
  margin-bottom: 0; /* Ensure no margin at the bottom */
  border: none; /* Remove border to eliminate the white border */
}

.quick-link-item .column {
  flex: 1;
}

.quick-link-item.work_completed {
  background-color: #90ee90; /* Green background for completed status */
  color: black;
}

.quick-link-item.pending {
  background-color: red; /* Orange background for pending status */
  color: white;
}

.quick-link-item.site_reached {
  background-color: yellow; /* Orange background for pending status */
  color: black;
}

.view-all-link {
  position: absolute;
  top: 25px;
  right: 20px;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 0; /* Ensure no margin at the bottom */
}

.view-all-link:hover {
  color: #0056b3;
}

/* Container and layout styling */
.additional-cards {
  grid-area: additional-cards;
  display: flex;
  justify-content: flex-end; /* Aligns items to the right */
  gap: 20px;
  height: 250px;
}

.additional-card {
  background: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: none; /* Remove border to eliminate the white border */
}

.additional-card.auto-scroll-feed {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Ensures content stays within the card */
  flex: 1; /* Takes up remaining space */
  width: 100%; /* Ensure it fills the available width */
}

.feed-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden; /* Ensures content stays within the card */
  margin-top: 10px; /* Add margin to separate the title and content */
  width: 100%; /* Ensure it fills the available width */
}

.feed-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  width: 100%; /* Ensure it fills the available width */
  padding-bottom: 0; /* Ensure no padding at the bottom */
  margin-bottom: 0; /* Ensure no margin at the bottom */
}

.feed-item {
  background: rgb(231, 231, 231);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 0; /* Ensure no margin at the bottom */
  width: 100%; /* Ensure it fills the available width */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

@keyframes scroll {
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(calc(-100% - 10px)); /* Adjust this value to ensure correct scrolling distance */
  }
}

.quick-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.quick-link-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.quick-link-button:last-child {
  margin-bottom: 0;
}
</style>
