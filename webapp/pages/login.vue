<template>
  <v-card class="mx-auto mt-10" max-width="400">
    <v-card-title class="text-h5">Login</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="username"
          label="username"
          type="username"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          required
        ></v-text-field>
        <v-btn type="submit" color="primary" block class="mt-4">Login</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    // Create a FormData object to send data in form-data format
    const formData = new FormData()
    formData.append('username', username.value)
    formData.append('password', password.value)

    // Send the request with Axios
    const response = await $axios.post('/auth', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Handle the response
    authStore.setToken(response.data.token)
    authStore.setUser(response.data.user)
    navigateTo('/')
  } catch (error) {
    console.error('Login failed:', error.response?.data || error)
  }
}

</script>