<template>
    <div class="chart-container">
        <canvas ref="dailyChart"></canvas>
    </div>
</template>

<script>
import { Chart } from "chart.js/auto";

export default {
    props: ["data"], // Accepts the processed daily data as a prop
    mounted() {
        this.createChart(); // Create the chart when the component is mounted
    },
    watch: {
        data(newData) {
            this.updateChart(newData); // Update the chart whenever the data changes
        },
    },
    methods: {
        createChart() {
            this.chart = new Chart(this.$refs.dailyChart, {
                type: "line", // Use a line chart for daily data
                data: {
                    labels: this.data.map((item) => item.label), // Daily labels
                    datasets: [
                        {
                            label: "Power Usage (kWh)",
                            data: this.data.map((item) => item.value), // Daily power usage values
                            borderColor: "rgba(54, 162, 235, 0.8)",
                            backgroundColor: "rgba(54, 162, 235, 0.3)",
                            fill: true, // Fill the area under the line
                            tension: 0.4, // Smooth the curve
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Power Usage (kWh)",
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Days",
                            },
                        },
                    },
                },
            });
        },
        updateChart(newData) {
            if (this.chart) {
                this.chart.data.labels = newData.map((item) => item.label);
                this.chart.data.datasets[0].data = newData.map((item) => item.value);
                this.chart.update();
            }
        },
    },
    beforeUnmount() {
        if (this.chart) {
            this.chart.destroy(); // Destroy the chart instance to avoid memory leaks
        }
    },
};
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: auto;
    position: relative; /* Required for Chart.js responsiveness */
}
</style>
