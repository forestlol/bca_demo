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
                type: "line",
                data: {
                    labels: this.data.map((item) => item.time),
                    datasets: [
                        {
                            label: "Usage",
                            data: this.data.map((item) => item.value),
                            borderColor: "#36A2EB",
                            fill: true,
                            tension: 0.4,
                        },
                    ],
                },
            });
        },
        updateChart() {
            if (this.chart) {
                this.chart.data.labels = this.data.map((item) => item.time);
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
