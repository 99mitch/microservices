<template>
  <div>
    <h1 class="text-h4 mb-4">Popular Videos</h1>
    <v-row>
      <v-col v-for="video in videos" :key="video.id" cols="12" sm="6" md="4" lg="3">
        <VideoCard :video="video" />
      </v-col>
    </v-row>
    <v-alert
      v-if="error"
      type="error"
      class="mt-4"
    >
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<script setup>
const { $axios } = useNuxtApp()
const { handleError } = useErrorHandler()

const videos = ref([])
const error = ref(false)
const errorMessage = ref('')

const fetchVideos = async () => {
  try {
    const response = await $axios.get('/videos')
    console.log(response.data)
    videos.value = response.data.videos
    
  } catch (err) {
    const result = handleError(err, 'Error fetching videos')
    error.value = result.error
    errorMessage.value = result.message
  }
}

onMounted(fetchVideos)
</script>