import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  
  actions: {
    setUser(user) {
      this.user = user
    },
    
    setToken(token) {
      this.token = token
    },
    
    setError(error) {
      this.error = error
    },
    
    startLoading() {
      this.loading = true
      this.error = null
    },
    
    stopLoading() {
      this.loading = false
    },
    
    logout() {
      this.user = null
      this.token = null
      this.error = null
    },
    
    async login(credentials) {
      this.startLoading()
      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.post('/auth/login', credentials)
        this.setToken(response.data.token)
        this.setUser(response.data.user)
        return true
      } catch (error) {
        const { handleError } = useErrorHandler()
        const result = handleError(error, 'Login failed')
        this.setError(result.message)
        return false
      } finally {
        this.stopLoading()
      }
    }
  },
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  }
})