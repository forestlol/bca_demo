<template>
    <div>
        <canvas id="barChart"></canvas>
    </div>
</template>

<script>
import {
    Chart,
    BarController,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

// Register required components
Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default {
    name: "ProjectStatisticsChart",
    mounted() {
        // Initialize the bar chart
        const ctx = document.getElementById("barChart").getContext("2d");
        new Chart(ctx, {
            type: "bar", // Specify chart type
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [
                    {
                        label: "Projects",
                        data: [65, 59, 80, 81, 56, 55, 40],
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Working Hours",
                        data: [28, 48, 40, 19, 86, 27, 90],
                        backgroundColor: "rgba(153, 102, 255, 0.2)",
                        borderColor: "rgba(153, 102, 255, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                    },
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    },
};
</script>