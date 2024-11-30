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
        baselineData: {
            type: Array,
            default: () => [], // Baseline values
        },
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
                    label: "Power Usage (kWh)",
                    data: this.data,
                    borderColor: "#007bff",
                    backgroundColor: this.type === "bar" ? "rgba(0, 123, 255, 0.8)" : "rgba(0, 123, 255, 0.2)",
                    pointBackgroundColor: "#007bff",
                    fill: this.type !== "bar",
                    tension: 0,
                    borderWidth: 2,
                    pointRadius: this.type === "bar" ? 0 : 3,
                },
            ];

            if (this.baselineData.length > 0) {
                datasets.push({
                    label: "Baseline",
                    data: this.baselineData,
                    borderColor: "#ff0000",
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                });
            }

            this.chart = new Chart(this.$refs.chart, {
                type: this.type, // Use the chart type dynamically
                data: {
                    labels: this.labels,
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
.chart-container {
    width: 100%;
    height: 400px;
    margin: 0 auto;
    position: relative;
}
</style>
