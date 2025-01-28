<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        <nuxt-link to="/" class="text-decoration-none">VideoStream</nuxt-link>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/search" prepend-icon="mdi-magnify">Search</v-btn>
      <template v-if="authStore.isAuthenticated">
        <v-btn to="/upload" prepend-icon="mdi-upload">Upload</v-btn>
        <v-btn to="/profile" prepend-icon="mdi-account">Profile</v-btn>
        <v-btn @click="logout" prepend-icon="mdi-logout">Logout</v-btn>
      </template>
      <template v-else>
        <v-btn to="/login" prepend-icon="mdi-login">Login</v-btn>
        <v-btn to="/register" prepend-icon="mdi-account-plus">Register</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }} VideoStream</span>
    </v-footer>
  </v-app>
</template>

<script setup>
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  navigateTo('/login')
}
</script>