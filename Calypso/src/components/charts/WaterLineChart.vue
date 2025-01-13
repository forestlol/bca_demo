<template>
    <div class="chart-container">
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
        baselineData: Array, // Accept baseline data as a prop
        showBaseline: Boolean, // Accept a flag for showing baseline
        type: {
            type: String,
            default: "line", // Default to line chart
        },
    },
    mounted() {
        this.renderChart();
    },
    watch: {
        data: "renderChart",
        labels: "renderChart",
        baselineData: "renderChart",
        type: "renderChart", // Watch for changes in chart type
    },
    methods: {
        renderChart() {
            if (this.chart) this.chart.destroy();

            const datasets = [
                {
                    label: "Water Consumption", // Correct label
                    data: this.data,
                    borderColor: "#007bff",
                    backgroundColor: this.type === "bar" ? "rgba(0, 123, 255, 0.8)" : "rgba(0, 123, 255, 0.2)",
                    pointBackgroundColor: "#007bff",
                    fill: this.type !== "bar",
                    tension: 0.4, // Smooth lines
                    borderWidth: 2,
                    pointRadius: this.type === "bar" ? 0 : 3,
                },
            ];

            // Add baseline dataset if `showBaseline` is true
            if (this.showBaseline && this.baselineData && this.baselineData.length > 0) {
                datasets.push({
                    label: "Baseline",
                    data: this.baselineData,
                    borderColor: "red", // Baseline color
                    borderDash: [5, 5], // Dashed line
                    fill: false,
                    tension: 0.1,
                });
            }

            this.chart = new Chart(this.$refs.chart, {
                type: this.type, // Use the chart type dynamically
                data: {
                    labels: this.labels, // Labels for x-axis
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
                                text: "Water Usage", // Update Y-axis label
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

        this.chart = new Chart(this.$refs.chart, {
            type: this.type,
            data: {
                labels: this.labels,
                datasets: this.data,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                },
            },
        });
    },
};
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 400px;
    margin: 0 auto;
    position: relative;
}
</style>
