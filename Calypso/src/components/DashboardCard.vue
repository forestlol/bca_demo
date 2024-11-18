<template>
    <div class="dashboard-card" :style="{ backgroundColor: color }">
        <div class="card-content">
            <!-- Big Icon on the Left -->
            <div class="icon-container">
                <slot name="icon"></slot>
            </div>

            <!-- Readings and Writings on the Right -->
            <div class="text-container">
                <h3 class="card-value">{{ value }}</h3>
                <p class="card-title">{{ title }}</p>
                <p class="card-description">{{ description }}</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="card-footer">
            <button class="view-more" @click="navigateToLink">{{ linkText }}</button>
            <i class="fas fa-chevron-right footer-arrow"></i>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        color: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        value: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: false, // Optional, in case some cards don't need links
        },
        linkText: {
            type: String,
            default: "VIEW MORE", // Default text for the button
        },
    },
    methods: {
        navigateToLink() {
            if (this.link) {
                this.$router.push(this.link); // Use Vue Router to navigate
            }
        },
    },
};
</script>


<style scoped>
.dashboard-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    border-radius: 8px;
    color: white;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    width: 100%; /* Ensures cards stretch evenly */
    height: 150px; /* Adjust height for consistency */
}

.dashboard-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
}

/* Icon Styling */
.icon-container {
    font-size: 50px;
    flex-shrink: 0;
}

/* Text Styling */
.text-container {
    text-align: right;
    margin-left: 15px;
    flex-grow: 1;
}

.card-value {
    font-size: 32px;
    font-weight: bold;
    margin: 0;
}

.card-title {
    font-size: 16px;
    margin: 5px 0;
}

.card-description {
    font-size: 12px;
    margin: 0;
    opacity: 0.8;
}

/* Footer Styling */
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
}

.view-more {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    text-transform: uppercase;
}

.view-more:hover {
    color: white;
    text-decoration: underline;
}

.footer-arrow {
    font-size: 16px;
    opacity: 0.8;
}
</style>
