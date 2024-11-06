<template>
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <div>{{ message }}</div>
      <div>
        <small>{{ countdown }} seconds remaining</small>
      </div>
      <button type="button" class="btn-close" @click="closeNotification" aria-label="Close"></button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: String,
      countdownTime: {
        type: Number,
        default: 60, // default countdown time
      },
    },
    data() {
      return {
        countdown: this.countdownTime,
      };
    },
    methods: {
      closeNotification() {
        this.$emit("close");
      },
      startCountdown() {
        const interval = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(interval);
            this.closeNotification();
          }
        }, 1000);
      },
    },
    mounted() {
      this.startCountdown();
    },
  };
  </script>
  
  <style scoped>
  .alert {
    margin-bottom: 10px;
  }
  </style>
  