<template>
  <v-card :to="'/video/' + video.id" class="video-card">
    <v-img :src="video.thumbnail" height="200" cover></v-img>
    <v-card-subtitle class="text-truncate">{{ video.name }}</v-card-subtitle>
    <v-card-text>
      <div class="mt-1">{{ formatViews(video.views) }} views</div>
    </v-card-text>
  </v-card>
</template>


<script setup>
const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const formatViews = (views) => {
  return new Intl.NumberFormat().format(views)
}
</script>