    <template>
        <div class="chart-container">
            <canvas ref="hourlyChart"></canvas>
        </div>
    </template>

<script>
import { Chart } from "chart.js/auto";

export default {
    props: ["data"],
    mounted() {
        console.log("Daily Chart Data:", this.data); // Log the processed data
        this.createChart();
    },
    watch: {
        data(newData) {
            this.updateChart(newData);
        },
    },
    methods: {
        createChart() {
            this.chart = new Chart(this.$refs.hourlyChart, {
                type: "bar",
                data: {
                    labels: this.data.map((item) => item.label),
                    datasets: [
                        {
                            label: "Water Meter Usage (m³)",
                            data: this.data.map((item) => item.value),
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
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
            this.chart.destroy();
        }
    },
};
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: auto;
    position: relative;
}
</style>
