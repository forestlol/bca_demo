<template>
    <div class="semi-circle-container">
        <canvas ref="semiCircleCanvas" width="200" height="100"></canvas>
        <div class="semi-circle-label">
            <span class="percentage"><br>{{ percentage }}%</span><br>
            <span class="label-text">Operational</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "SemiCircleProgressBar",
    props: {
        percentage: {
            type: Number,
            required: true
        },
        label: {
            type: String,
            default: ''
        }
    },
    mounted() {
        this.drawSemiCircle();
    },
    methods: {
        drawSemiCircle() {
            const canvas = this.$refs.semiCircleCanvas;
            const ctx = canvas.getContext("2d");
            const startAngle = Math.PI;
            const endAngle = startAngle + Math.PI;
            const radius = 90;
            const centerX = canvas.width / 2;
            const centerY = canvas.height;
            const lineWidth = 10;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background arc
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = "#007bff";
            ctx.stroke();

            // Progress arc
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + (this.percentage / 100) * Math.PI);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = "#007bff";
            ctx.stroke();
        }
    },
    watch: {
        percentage() {
            this.drawSemiCircle();
        }
    }
};
</script>

<style scoped>
.semi-circle-progress-bar {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 100px;
}

.semi-circle-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    font-weight: bold;
    color: black;
    text-align: center;
}

.semi-circle-label .percentage {
  font-size: 25px;
  font-weight: bold;
}

.semi-circle-label .label-text {
  font-size: 16px;
}
</style>