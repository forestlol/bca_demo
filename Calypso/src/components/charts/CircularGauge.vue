<template>
    <div class="chart-container">
        <canvas ref="chart"></canvas>
    </div>
</template>

<script>
import { Chart } from "chart.js/auto";

export default {
    props: ["data"],
    mounted() {
        console.log("Energy Intensity Data for CircularGauge:", this.data);
        new Chart(this.$refs.chart, {
            type: "doughnut",
            data: {
                labels: ["Used", "Remaining"],
                datasets: [
                    {
                        data: [this.data, 100 - this.data],
                        backgroundColor: ["#36A2EB", "#E5E5E5"],
                    },
                ],
            },
            options: {
                cutout: "90%",
            },
        });
    },
};
</script>