<template>
  <div>
    <h1 class="text-h4 mb-4">Profile</h1>
    <v-row>
      <!-- Profile Update Form -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Update Profile</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="updateProfile">
              <v-text-field
                v-model="profile.username"
                label="Username"
              ></v-text-field>
              <v-text-field
                v-model="profile.email"
                label="Email"
                type="email"
              ></v-text-field>
              <v-text-field
                v-model="profile.password"
                label="type your new password"
                type="password"
                placeholder="Password"
              ></v-text-field>
              <v-btn type="submit" color="primary">Save Changes</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- User Videos List -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>My Videos</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item :key="video.id" v-for="video in userVideos">
                <!-- Link only wraps around text -->
                <v-list-item-content>
                  <v-list-item-title>
                    <router-link :to="`/video/${video.id}`" class="text-decoration-none">
                      {{ video.name }}
                    </router-link>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ video.views }} views • {{ formatDate(video.created_at) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <!-- Delete button is outside the link -->
                <template v-slot:append>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click.stop="deleteVideo(video.id)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>

        </v-card>
      </v-col>
    </v-row>
  </div>
</template>


<script setup>
const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const router = useRouter()

const profile = ref({
  username: '',
  email: '',
  password: ''
})
const userVideos = ref([])
console.log(authStore.user);

onMounted(async () => {
  if (authStore.user) {
    profile.value = { ...authStore.user }
    await fetchUserVideos()
  }
})

const updateProfile = async () => {
  try {
    const response = await $axios.put(`/user/${authStore.user.id}`, profile.value)
    authStore.setUser(response.data)

    console.log(authStore.user);
    
    await sendUpdateEmail(authStore.user.data.email)
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}

const sendUpdateEmail = async (email) => {
  try {
    await $fetch('http://localhost:3002/send-mail', {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json', // Ensure the content type is set to JSON
      },
      body: {
        email, // Pass the email dynamically
        type: 'passwordReset', // Replace with "profileUpdate" if you added the new type in your Mailer service
      },
    })
    console.log('Profile update email sent successfully!')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}


const fetchUserVideos = async () => {
  try {
    const response = await $axios.get(`/user/${authStore.user.id}/videos`)
    userVideos.value = response.data.data.videos    
  } catch (error) {
    console.error('Error fetching user videos:', error)
  }
}

const deleteVideo = async (videoId) => {
  try {
    await $axios.delete(`/video/${videoId}`)
    await fetchUserVideos()
  } catch (error) {
    console.error('Error deleting video:', error)
  }
}

const getVideoThumbnail = (source) => {
  return source || '/placeholder-thumbnail.jpg'
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>
