<template>
  <div class="progress-circle">
    <svg viewBox="0 0 36 36">
      <path
        class="circle-bg"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        class="circle"
        :stroke-dasharray="percentage + ', 100'"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text x="18" y="20.35" class="percentage">{{ percentage }}%</text>
    </svg>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'CircularProgressBar',
  props: {
    percentage: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.progress-circle {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px; /* Add some margin for spacing */
}

svg {
  width: 100px;
  height: 100px;
}

.circle-bg {
  fill: none;
  stroke: #eeeeee;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #007bff;
  stroke-width: 2.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease 0s;
}

.percentage {
  fill: #007bff;
  font-size: 0.5em; /* Adjust the size as needed */
  text-anchor: middle;
}

.label {
  margin-top: 10px;
  text-align: center;
  font-size: 1em; /* Adjust the size as needed */
  white-space: nowrap; /* Ensure the text doesn't wrap */
}
</style>
