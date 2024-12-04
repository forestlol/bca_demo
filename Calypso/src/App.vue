<template>
  <div id="app">
    <!-- Header -->
    <AppHeader @toggle-sidebar="toggleSidebar" :collapsed="sidebarCollapsed" />

    <!-- Sidebar and Main Content -->
    <div class="layout">
      <AppSidebar :collapsed="sidebarCollapsed" />
      <main class="main-content" :class="{ collapsed: sidebarCollapsed }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import AppSidebar from "./components/AppSidebar.vue";
import AppHeader from "./components/AppHeader.vue";

export default {
  components: {
    AppSidebar,
    AppHeader,
  },
  data() {
    return {
      sidebarCollapsed: false, // State for sidebar collapse/expand
    };
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed; // Toggle sidebar state
    },
  },
};
</script>

<style>
/* Main content */
.main-content {
  flex-grow: 1;
  margin-left: 250px; /* Default sidebar width */
  padding: 20px;
  transition: margin-left 0.3s;
  background-color: #f5f7fa;
  padding-top: 7%;
}

.main-content.collapsed {
  margin-left: 80px; /* Adjust when the sidebar is collapsed */
}
</style>
