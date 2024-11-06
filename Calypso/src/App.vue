<template>
  <div id="app">
    <Sidebar @update:expanded="isSidebarExpanded = $event" />
    <div :class="['main-content', { 'sidebar-expanded': isSidebarExpanded }]">
      
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';


export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      isSidebarExpanded: false,
    };
  },
};
</script>

<style>
.mt3 {
  margin-top: 0rem !important;
}

.main-content {
  flex: 1;
  transition: margin-left 0.3s;
  margin-left: 60px; /* Default sidebar width */
}

.main-content.sidebar-expanded {
  margin-left: 200px; /* Expanded sidebar width */
}
</style>
