<template>
    <aside :class="['app-sidebar', { collapsed }]">
        <!-- Logo Section -->
        <div class="logo-section">
            <img src="@/assets/cavill_logo.png" alt="Logo" class="logo" />
        </div>

        <!-- Menu -->
        <nav>
            <div class="menu-section">
                <span class="menu-title" v-if="!collapsed">Menu</span>
                <ul class="menu">
                    <li class="menu-item">
                        <router-link to="/" class="menu-link">
                            <i class="fas fa-home"></i>
                            <span v-if="!collapsed">Homepage</span>
                        </router-link>
                    </li>
                </ul>
            </div>

            <div class="menu-section">
                <span class="menu-title" v-if="!collapsed">Management</span>
                <ul class="menu">
                    <!-- Energy Management Dropdown -->
                    <li class="menu-item dropdown">
                        <div class="menu-link" @click="toggleDropdown('energyManagement')">
                            <i class="fas fa-bolt"></i>
                            <span v-if="!collapsed">Energy Management</span>
                            <i class="fas fa-chevron-down dropdown-icon"
                                :class="{ rotated: dropdowns.energyManagement }" v-if="!collapsed"></i>
                        </div>
                        <ul v-if="dropdowns.energyManagement && !collapsed" class="submenu">
                            <li>
                                <router-link to="/energy-management" class="menu-link">
                                    Overview
                                </router-link>
                            </li>
                            <li>
                                <router-link to="/energy-management/5-minutes" class="menu-link">
                                    5 Minutes Chart
                                </router-link>
                            </li>
                            <li>
                                <router-link to="/energy-management/hourly" class="menu-link">
                                    Hourly Chart
                                </router-link>
                            </li>
                            <li>
                                <router-link to="/energy-management/daily" class="menu-link">
                                    Daily Chart
                                </router-link>
                            </li>
                            <li>
                                <router-link to="/energy-management/monthly" class="menu-link">
                                    Monthly Chart
                                </router-link>
                            </li>
                            <li>
                                <router-link to="/energy-management/deviceFloorplan" class="menu-link">
                                    Device Floorplan
                                </router-link>
                            </li>
                        </ul>
                    </li>

                    <!-- Automation Management -->
                    <li class="menu-item">
                        <router-link to="/automation-management" class="menu-link">
                            <i class="fas fa-cog"></i>
                            <span v-if="!collapsed">Automation Management</span>
                        </router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </aside>
</template>
<script>
export default {
    props: {
        collapsed: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            dropdowns: {
                energyManagement: false, // State for Energy Management dropdown
            },
        };
    },
    methods: {
        toggleDropdown(section) {
            this.dropdowns[section] = !this.dropdowns[section];
        },
    },
};
</script>
<style scoped>
/* Sidebar */
.app-sidebar {
    width: 250px;
    background-color: #1e293b;
    height: 100%;
    position: fixed;
    left: 0;
    transition: width 0.3s;
    overflow: hidden;
}

.app-sidebar.collapsed {
    width: 80px;
    /* Collapsed width */
}

/* Logo Section */
.logo-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-bottom: 1px solid #334155;
}

.logo {
    height: 40px;
}

/* Menu Section */
.menu-section {
    margin-top: 10px;
    padding: 0;
}

.menu-title {
    font-size: 12px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 10px;
    display: block;
    padding-left: 20px;
    /* Align with menu items */
}

/* Menu */
.menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu-item {
    padding: 10px 0;
}

.menu-link {
    text-decoration: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: left;
    padding: 10px 18px;
    transition: background 0.3s, justify-content 0.3s, padding 0.3s;
    /* Smooth alignment transition */
    border-radius: 4px;
}

.app-sidebar.collapsed .menu-link {
    justify-content: center;
    /* Center icons in collapsed state */
    padding: 10px 0;
    /* Remove side padding */
}

.menu-link i {
    font-size: 20px;
    /* Slightly larger icon size for better visibility */
}

.menu-link span {
    margin-left: 10px;
}

.menu-link:hover {
    background: #334155;
}

/* Dropdown */
.dropdown-icon {
    margin-left: auto;
    transition: transform 0.3s;
}

.dropdown-icon.rotated {
    transform: rotate(180deg);
}

.submenu {
    list-style: none;
    padding: 0 20px;
    margin: 5px 0;
}

.submenu li {
    margin: 5px 0;
}

.submenu li a {
    text-decoration: none;
    color: #cbd5e1;
    font-size: 14px;
}

.submenu li a:hover {
    color: white;
}

.menu-link.router-link-active {
    background: #334155;
    color: #ffffff;
    /* Highlight text */
    font-weight: bold;
    /* Optional: Make active links bold */
}

.menu-link.router-link-exact-active {
    background: #475569;
    color: #ffffff;
    font-weight: bold;
}
</style>
