<template>
    <div class="login-page">
      <div class="login-card">
        <h2>Welcome Back</h2>
        <form @submit.prevent="onSubmit">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            placeholder="cavill@biz"
            required
          />
  
          <label for="password">Password</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            placeholder="••••••••"
            required
          />
  
          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2'
  
  export default {
    name: 'LoginPage',
    data() {
      return {
        credentials: {
          email: '',
          password: ''
        }
      }
    },
    methods: {
      async onSubmit() {
        const { email, password } = this.credentials
  
        if (email === 'cavill@biz' && password === 'Cavill123') {
          await Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: `Welcome back!`,
            timer: 1500,
            showConfirmButton: false,
            background: '#f4f6f8'
          })
          this.$router.push('/')
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Credentials',
            text: 'Please check your email and password.',
            confirmButtonColor: '#2196f3'
          })
        }
      }
    }
  }
  </script>
  
  
  <style scoped>
  .login-page {
    display: flex;
    height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: #f4f6f8;
    font-family: "Helvetica Neue", Arial, sans-serif;
  }
  
  .login-card {
    background: white;
    padding: 2.5rem 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 360px;
    text-align: center;
  }
  
  .login-card h2 {
    margin-bottom: 1.5rem;
    color: #1f2a38;
  }
  
  .login-card form {
    display: flex;
    flex-direction: column;
  }
  
  .login-card label {
    text-align: left;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
    color: #333;
  }
  
  .login-card input {
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
    border: 1px solid #ccd0d5;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .login-card input:focus {
    outline: none;
    border-color: #2196f3;
  }
  
  .login-card button {
    padding: 0.75rem;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .login-card button:hover {
    background: #1976d2;
  }
  </style>
  