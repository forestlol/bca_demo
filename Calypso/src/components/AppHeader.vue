<template>
    <header :class="['app-header', { collapsed }]">
        <!-- Hamburger Menu -->
        <button class="hamburger-menu" @click="$emit('toggle-sidebar')">
            <i class="fas" :class="[collapsed ? 'fa-bars' : 'fa-bars']"></i>
        </button>

        <!-- Search Icon and Input -->
        <div class="search-bar">
            <button class="search-icon" @click="toggleSearch">
                <i class="fas fa-search"></i>
            </button>
            <input v-if="showSearch" type="text" placeholder="Search..." class="search-input" @blur="toggleSearch" />
        </div>

        <!-- Header Right -->
        <div class="header-right">
            <!-- Full Screen Toggle -->
            <button class="header-icon" @click="toggleFullScreen">
                <i class="fas fa-expand"></i>
            </button>

            <!-- Dark/Light Mode Toggle -->
            <button class="header-icon" @click="toggleTheme">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>

            <!-- User Icon -->
            <button class="header-icon user-icon">
                <i class="fas fa-user"></i>
            </button>
        </div>
    </header>
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
            isDarkMode: false, // Track theme state
            showSearch: false, // Toggle visibility of the search input
        };
    },
    methods: {
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            document.body.classList.toggle("dark-mode", this.isDarkMode);
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
        toggleSearch() {
            this.showSearch = !this.showSearch;
        },
    },
};
</script>



<style scoped>
.app-header {
    height: 60px;
    background-color: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
    padding: 0 20px;
    display: flex;
    align-items: center;
    position: fixed;
    top: 0;
    left: 250px;
    /* Default sidebar width */
    width: calc(100% - 250px);
    z-index: 10;
    transition: left 0.3s, width 0.3s;
    /* Smooth transition */
}

.app-header.collapsed {
    left: 80px;
    /* Adjust for collapsed sidebar */
    width: calc(100% - 80px);
}

/* Hamburger Menu */
.hamburger-menu {
    background: none;
    border: none;
    color: #1e293b;
    font-size: 24px;
    cursor: pointer;
    margin-right: 20px;
}

.hamburger-menu i {
    font-size: 24px;
}

/* Move Right-Aligned Items to the Far Right */
.header-right {
    margin-left: auto;
    /* Pushes the right-aligned items to the right */
    display: flex;
    align-items: center;
    gap: 15px;
    /* Space between icons */
}

.search-icon {
    background: none;
    border: none;
    font-size: 18px;
    color: #4b5563;
    cursor: pointer;
}

.search-icon:hover {
    color: #1f2937;
}

.search-input {
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    width: 200px;
    outline: none;
    transition: all 0.3s ease-in-out;
}

.search-input:focus {
    border-color: #4b5563;
}

.header-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: #4b5563;
    transition: color 0.3s;
}

.header-icon:hover {
    color: #1f2937;
}

/* User Icon Specific Style */
.user-icon {
    font-size: 20px;
}

:root {
    /* Light Mode */
    --header-bg-color: #f1f5f9;
    --header-text-color: #1e293b;
    --header-border-color: #e2e8f0;
    --header-icon-color: #4b5563;
    --header-icon-hover-color: #1f2937;

    --sidebar-bg-color: #1e293b;
    --sidebar-text-color: #fff;
    --sidebar-hover-color: #334155;

    --main-bg-color: #f8f9fa;
    --main-text-color: #1e293b;
}

body.dark-mode {
    /* Dark Mode */
    --header-bg-color: #1e293b;
    --header-text-color: #f1f5f9;
    --header-border-color: #334155;
    --header-icon-color: #9ca3af;
    --header-icon-hover-color: #e5e7eb;

    --sidebar-bg-color: #0f172a;
    --sidebar-text-color: #9ca3af;
    --sidebar-hover-color: #1e293b;

    --main-bg-color: #111827;
    --main-text-color: #e5e7eb;
}
</style>