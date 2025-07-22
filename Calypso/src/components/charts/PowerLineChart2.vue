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

            const datasets = this.data.map((dataset) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color for each dataset
                backgroundColor: "rgba(0, 0, 0, 0)", // Transparent background
                fill: false,
                tension: 0,
                borderWidth: 2,
                pointRadius: 3,
            }));

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
                            display: true,
                            title: {
                                display: true,
                                text: 'Time / Date',
                                color: '#333',
                                font: { size: 16, weight: 'bold' }
                            },
                            ticks: {
                                autoSkip: false,
                                maxRotation: 30, // or 0 for no tilt
                                minRotation: 0,
                                color: '#222',
                                font: { size: 13, weight: 'bold' },
                                padding: 10, // adds more space from axis line
                            },
                            grid: { display: false }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Power Usage (kWh)',
                                color: '#333',
                                font: { size: 14 }
                            },
                            ticks: {
                                color: '#222',
                                font: { size: 12 },
                            }
                        }
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
