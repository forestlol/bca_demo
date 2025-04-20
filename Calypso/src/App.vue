<template>
  <div id="app">
    <!-- LOGIN LAYOUT -->
    <div v-if="isLoginPage" class="login-only">
      <router-view/>
    </div>

    <!-- APP LAYOUT -->
    <div v-else class="app-layout">
      <AppHeader @toggle-sidebar="toggleSidebar" :collapsed="sidebarCollapsed" />

      <div class="layout">
        <AppSidebar :collapsed="sidebarCollapsed" />

        <main class="main-content" :class="{ collapsed: sidebarCollapsed }">
          <router-view/>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";
import AppHeader  from "@/components/AppHeader.vue";

export default {
  components: { AppSidebar, AppHeader },
  data() {
    return {
      sidebarCollapsed: false
    };
  },
  computed: {
    isLoginPage() {
      // assuming your login route is named "Login"
      return this.$route.name === "Login";
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }
};
</script>

<style>
/* login-only just needs to fill the screen */
.login-only {
  height: 100vh;
}

/* your normal app layout */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout {
  display: flex;
  flex-grow: 1;
}

.main-content {
  padding-top: 5%;
  flex-grow: 1;
  margin-left: 250px;
  padding: 20px;
  transition: margin-left 0.3s;
  background-color: #f5f7fa;
}

.main-content.collapsed {
  margin-left: 80px;
}
</style>
