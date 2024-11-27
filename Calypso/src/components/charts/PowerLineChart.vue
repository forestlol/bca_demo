<template>
    <div class="line-chart-container">
        <canvas ref="chart"></canvas>
    </div>
</template>

<script>
import { Chart } from "chart.js/auto";

export default {
    props: {
        data: {
            type: Array,
            required: true,
        },
        labels: {
            type: Array,
            required: true,
        },
        baselineData: {
            type: Array,
            default: () => [], // Baseline values
        },
    },
    mounted() {
        this.renderChart();
    },
    watch: {
        data: "renderChart",
        labels: "renderChart",
        baselineData: "renderChart", // Watch for changes in baselineData
    },
    methods: {
        renderChart() {
            // Destroy any previous chart instance to prevent duplication
            if (this.chart) this.chart.destroy();

            const datasets = [
                {
                    label: "Power Usage (kWh)",
                    data: this.data, // Main data
                    borderColor: "#007bff",
                    backgroundColor: "rgba(0, 123, 255, 0.2)",
                    pointBackgroundColor: "#007bff",
                    fill: true,
                    tension: 0, // Make lines sharp instead of cursive
                    borderWidth: 2, // Adjust line thickness
                    pointRadius: 3, // Optional: Adjust the size of points
                },
            ];

            // Add baseline dataset if baselineData exists
            if (this.baselineData.length > 0) {
                datasets.push({
                    label: "Baseline",
                    data: this.baselineData, // Baseline data
                    borderColor: "#ff0000", // Red for baseline
                    borderWidth: 1, // Thinner line for baseline
                    borderDash: [5, 5], // Dashed line
                    fill: false, // No fill for baseline
                    pointRadius: 0, // Remove points
                    pointStyle: "line", // Ensure a continuous line
                });
            }

            this.chart = new Chart(this.$refs.chart, {
                type: "line",
                data: {
                    labels: this.labels, // X-axis labels
                    datasets,
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                autoSkip: true,
                                maxRotation: 45,
                                minRotation: 0,
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Power Usage (kWh)",
                            },
                            beginAtZero: true,
                        },
                    },
                },
            });
        },
    },
    beforeUnmount() {
        if (this.chart) this.chart.destroy();
    },
};
</script>

<style scoped>
.line-chart-container {
    width: 100%;
    height: 400px;
    margin: 0 auto;
    position: relative;
}
</style>
