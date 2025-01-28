<template>
  <div class="video-player">
    <video
      :src="video.url"
      controls
      class="w-100"
    ></video>
  </div>
</template>

<script setup>
const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})
</script>
