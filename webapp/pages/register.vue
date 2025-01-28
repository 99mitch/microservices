<template>
  <v-card class="mx-auto mt-10" max-width="400">
    <v-card-title class="text-h5">Register</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleRegister">
        <v-text-field
          v-model="username"
          label="Username"
          required
        ></v-text-field>
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          required
        ></v-text-field>
        <v-text-field
          v-model="pseudo"
          label="pseudo"
          type="pseudo"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          required
        ></v-text-field>
        <v-btn type="submit" color="primary" block class="mt-4">Register</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const username = ref('')
const email = ref('')
const pseudo = ref('')
const password = ref('')

const handleRegister = async () => {
  try {
    const response = await $axios.post('/user', {
      username: username.value,
      email: email.value,
      pseudo: pseudo.value,
      password: password.value
    })
    authStore.setToken(response.data.token)
    authStore.setUser(response.data.user)
    navigateTo('/')
  } catch (error) {
    console.error('Registration failed:', error)
  }
}
</script>