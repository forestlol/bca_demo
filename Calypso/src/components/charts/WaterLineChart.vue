<template>
    <canvas ref="canvas"></canvas>
</template>

<script>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default {
    name: 'WaterLineChart',
    props: {
        labels: Array,
        data: Array,
        type: { type: String, default: 'line' },
        baselineData: { type: Array, default: () => [] },
        showBaseline: { type: Boolean, default: false },
        yLabel: { type: String, default: '' }
    },
    data() {
        return { chart: null }
    },
    mounted() {
        this.renderChart()
    },
    beforeUnmount() {
        if (this.chart) {
            this.chart.destroy()
            this.chart = null
        }
    },
    watch: {
        labels: 'renderChart',
        data: 'renderChart',
        baselineData: 'renderChart',
        showBaseline: 'renderChart',
        type: 'renderChart',
        yLabel: 'renderChart'
    },
    methods: {
        renderChart() {
            // Destroy previous chart safely
            if (this.chart) {
                this.chart.destroy()
                this.chart = null
            }
            // Only render if canvas exists!
            const ctx = this.$refs.canvas && this.$refs.canvas.getContext('2d')
            if (!ctx) return

            // Prepare datasets
            const datasets = [
                {
                    label: 'Usage',
                    data: this.data,
                    fill: false,
                    borderWidth: 2,
                },
                ...(this.showBaseline && this.baselineData.length
                    ? [{
                        label: 'Baseline',
                        data: this.baselineData,
                        fill: false,
                        borderDash: [5, 5],
                        borderWidth: 2,
                    }]
                    : [])
            ]
            this.chart = new Chart(ctx, {
                type: this.type,
                data: {
                    labels: this.labels,
                    datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            ticks: {
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 0,
                                color: '#444'
                            },
                            grid: { display: false }
                        },
                        y: {
                            display: true,
                            title: {
                                display: !!this.yLabel,
                                text: this.yLabel
                            }
                        }
                    }
                }
            })
        }
    }
}
</script>

<style scoped>
canvas {
    width: 100% !important;
    height: 100% !important;
}
</style>
