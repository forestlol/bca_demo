<template>
    <canvas id="monthlyTarget"></canvas>
</template>

<script>
import { Chart } from "chart.js";

export default {
    name: "MonthlyTargetChart",
    mounted() {
        new Chart(document.getElementById("monthlyTarget"), {
            type: "doughnut",
            data: {
                labels: ["Pending", "Done"],
                datasets: [
                    {
                        data: [31.1, 68.9],
                        backgroundColor: ["#f6ad55", "#48bb78"],
                    },
                ],
            },
        });
    },
};
</script>