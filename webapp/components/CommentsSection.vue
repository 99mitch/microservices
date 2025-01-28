<template>
  <div class="mt-4">
    <h2 class="text-h6 mb-4">Comments</h2>
    <v-form v-if="authStore.isAuthenticated" @submit.prevent="addComment" class="mb-4">
      <v-textarea
        v-model="newComment"
        label="Add a comment"
        rows="3"
      ></v-textarea>
      <v-btn type="submit" color="primary">Comment</v-btn>
    </v-form>
    <v-list>
      <v-list-item v-for="comment in comments" :key="comment.id">
        <v-list-item-title>{{ comment.user.username }}</v-list-item-title>
        <v-list-item-subtitle>{{ formatDate(comment.createdAt) }}</v-list-item-subtitle>
        <v-list-item-text>{{ comment.content }}</v-list-item-text>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
const props = defineProps({
  videoId: {
    type: String,
    required: true
  }
})

const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const comments = ref([])
const newComment = ref('')

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const fetchComments = async () => {
  try {
    const response = await $axios.get(`/videos/${props.videoId}/comments`)
    comments.value = response.data
  } catch (error) {
    console.error('Error fetching comments:', error)
  }
}

const addComment = async () => {
  try {
    await $axios.post(`/videos/${props.videoId}/comments`, {
      content: newComment.value
    })
    newComment.value = ''
    await fetchComments()
  } catch (error) {
    console.error('Error adding comment:', error)
  }
}

onMounted(fetchComments)
</script>