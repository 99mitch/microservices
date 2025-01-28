<template>
  <div>
    <h1 class="text-h4 mb-4">Upload Video</h1>
    <v-form @submit.prevent="handleUpload">
      <!-- Title Input -->
      <v-text-field
        v-model="name"
        label="Title"
        required
      ></v-text-field>

      <!-- Video File Input -->
      <v-file-input
        v-model="videoFile"
        label="Video File"
        accept="video/*"
        required
      ></v-file-input>

      <!-- Submit Button -->
      <v-btn type="submit" color="primary" :loading="uploading">Upload</v-btn>
    </v-form>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { $axios } = useNuxtApp()
const router = useRouter()

const name = ref('')
const videoFile = ref(null)
const uploading = ref(false)
const authStore = useAuthStore()


const handleUpload = async () => {
  try {
    uploading.value = true

    // Create FormData for the request payload
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('file', videoFile.value)

    // Get the user ID dynamically or hardcode it for now (e.g., 1)
    const userId = authStore.user.id

    // Make the API call
    await $axios.post(`/user/${userId}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Navigate to the desired route after upload
    router.push('/')
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    uploading.value = false
  }
}
</script>
