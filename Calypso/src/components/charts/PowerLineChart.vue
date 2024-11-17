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
    },
    mounted() {
        this.renderChart();
    },
    watch: {
        data: "renderChart",
        labels: "renderChart",
    },
    methods: {
        renderChart() {
            // Destroy any previous chart instance to prevent duplication
            if (this.chart) this.chart.destroy();

            this.chart = new Chart(this.$refs.chart, {
                type: "line",
                data: {
                    labels: this.labels, // X-axis labels (e.g., dates)
                    datasets: [
                        {
                            label: "Power Usage (kWh)",
                            data: this.data, // Y-axis values (e.g., power readings)
                            borderColor: "#007bff",
                            backgroundColor: "rgba(0, 123, 255, 0.2)",
                            pointBackgroundColor: "#007bff",
                            fill: true,
                            tension: 0.4,
                        },
                    ],
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
                                autoSkip: true, // Automatically skip labels to avoid clutter
                                maxRotation: 45, // Maximum label rotation angle
                                minRotation: 0, // Minimum label rotation angle
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
        // Clean up chart instance to avoid memory leaks
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