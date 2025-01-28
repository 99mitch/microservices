<template>
  <div>
    <!-- Video Details -->
    <div v-if="selectedVideo">
      <button @click="clearSelection">Back to All Videos</button>
      <div class="video-container">
        <video
          :src="getVideoUrl(selectedVideo.source)"
          controls
          class="w-100"
          @play="incrementViews(selectedVideo.id)"
        ></video>
        <v-card class="video-details mt-4">
          <v-card-title>{{ selectedVideo.name }}</v-card-title>
          <v-card-subtitle>
            {{ selectedVideo.views }} views • {{ formatDate(selectedVideo.created_at) }}
          </v-card-subtitle>
          <v-card-text>
            <p>{{ selectedVideo.description }}</p>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- List of Videos -->
    <div v-else>
      <h1>All Videos</h1>
      <v-list>
        <v-list-item
          v-for="video in videos"
          :key="video.id"
          @click="navigateToVideo(video.id)"
          class="video-list-item"
        >
          <v-list-item-title>{{ video.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>




<script setup>
const { $axios } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const videos = ref([])
const selectedVideo = ref(null)

const fetchVideos = async () => {
  try {
    const response = await $axios.get('/videos')
    videos.value = response.data.videos

    const videoId = route.params.id
    if (videoId) {
      selectVideoById(parseInt(videoId))
    }
  } catch (error) {
    console.error('Error fetching videos:', error)
  }
}

const selectVideoById = (id) => {
  const video = videos.value.find((video) => video.id === id)
  if (video) {
    selectedVideo.value = video
    console.log('Selected video by ID:', video)
  } else {
    console.error('Video not found for ID:', id)
  }
}

const navigateToVideo = (id) => {
  router.push(`/videos/${id}`)
}

const clearSelection = () => {
  selectedVideo.value = null
  router.push('/')
}

const getVideoUrl = (source) => {
  const backendBaseUrl = "http://localhost:8000"
  console.log(`${backendBaseUrl}/${source}`);
  
  return `${backendBaseUrl}/${source}`
}

const incrementViews = async (id) => {
  try {
    await $axios.post(`/videos/${id}/views`)
    console.log('Video views incremented')
  } catch (error) {
    console.error('Error incrementing video views:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  fetchVideos()
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      selectVideoById(parseInt(newId))
    } else {
      selectedVideo.value = null
    }
  }
)
</script>


