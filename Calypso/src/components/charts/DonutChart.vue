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
                type: "doughnut",
                data: {
                    labels: ["Electricity", "Gas"],
                    datasets: [
                        {
                            data: [this.data.electricity, this.data.gas],
                            backgroundColor: ["#36A2EB", "#FF6384"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    cutout: "70%", // Adjust cutout for the doughnut
                },
            });
        },
        updateChart() {
            if (this.chart) {
                this.chart.data.datasets[0].data = [this.data.electricity, this.data.gas];
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
}
</style>
