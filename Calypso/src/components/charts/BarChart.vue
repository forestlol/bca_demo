<template>
    <div class="chart-container">
        <canvas ref="chart"></canvas>
    </div>
</template>

<script>
import { Chart } from "chart.js/auto";

export default {
    props: ["data"],
    watch: {
        data: {
            handler() {
                this.updateChart();
            },
            deep: true, // Watch deeply for changes in nested properties
        },
    },
    mounted() {
        this.renderChart();
    },
    methods: {
        renderChart() {
            this.chart = new Chart(this.$refs.chart, {
                type: "bar",
                data: {
                    labels: this.data.map((item) => item.label),
                    datasets: [
                        {
                            label: "Value",
                            data: this.data.map((item) => item.value),
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },
        updateChart() {
            if (this.chart) {
                this.chart.data.labels = this.data.map((item) => item.label);
                this.chart.data.datasets[0].data = this.data.map((item) => item.value);
                this.chart.update(); // Update the chart instance
            }
        },
    },
    beforeUnmount() {
        if (this.chart) {
            this.chart.destroy(); // Cleanup the chart instance
        }
    },
};
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 300px; /* Set the height to suit your layout */
    width: 100%;
}
</style>
