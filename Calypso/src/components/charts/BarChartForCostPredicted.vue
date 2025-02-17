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
            deep: true,
        },
    },
    mounted() {
        this.renderChart();
    },
    methods: {
        renderChart() {
            // Build arrays from the data prop
            const labels = this.data.map((item) => item.label);
            const dataValues = this.data.map((item) => item.value);

            this.chart = new Chart(this.$refs.chart, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Cost ($)",
                            data: dataValues,
                            // Store the full data objects for use in the tooltip callback.
                            customData: this.data,
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const dataset = context.dataset;
                                    const index = context.dataIndex;
                                    const item = dataset.customData ? dataset.customData[index] : {};
                                    // Display the label, cost, and kWh usage
                                    return `${item.label}: $${item.cost} (${item.usage} kWh)`;
                                },
                            },
                        },
                    },
                },
            });
        },
        updateChart() {
            if (this.chart) {
                // Update labels and dataset values
                this.chart.data.labels = this.data.map((item) => item.label);
                this.chart.data.datasets[0].data = this.data.map((item) => item.value);
                // Also update our custom tooltip data
                this.chart.data.datasets[0].customData = this.data;
                this.chart.update();
            }
        },
    },
    beforeUnmount() {
        if (this.chart) {
            this.chart.destroy();
        }
    },
};
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 300px;
    /* Adjust height as needed */
    width: 100%;
}
</style>