import { computed, ref, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useCacheStore } from '../stores/useCacheStore'
import { useStorageStore } from '../stores/useStorageStore'

/**
 * Enhanced authentication hook for Vue.js
 * Provides advanced authentication features with Zustand stores
 */
export function useVrmAuthEnhancedVue() {
  // Get stores
  const authStore = useAuthStore()
  const cacheStore = useCacheStore()
  const storageStore = useStorageStore()

  // Reactive state
  const isInitialized = ref(false)
  const lastActivity = ref(Date.now())

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const token = computed(() => authStore.token)
  const isLoading = computed(() => authStore.isLoading)
  const isOffline = computed(() => authStore.isOffline)
  const permissions = computed(() => authStore.permissions)
  const roles = computed(() => authStore.roles)

  // Enhanced authentication methods
  const login = async (credentials) => {
    try {
      authStore.setLoading(true)
      
      // Simulate API call (replace with actual API)
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      // Handle 204 responses (no content)
      if (response.status === 204) {
        return { success: true, message: "Operation completed successfully" };
      }
      
      const data = await response.json()
      
      // Store authentication data
      authStore.login(
        data.token,
        data.user,
        data.refreshToken,
        data.expiresAt
      )
      
      // Cache user data
      cacheStore.setCache('user-data', data.user, {
        tags: ['user', 'auth'],
        maxAge: 3600000 // 1 hour
      })
      
      // Save login preferences
      storageStore.setUserPreference('lastLogin', new Date().toISOString())
      storageStore.setUserPreference('rememberMe', credentials.rememberMe || false)
      
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    } finally {
      authStore.setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear auth state
      authStore.logout()
      
      // Clear cached user data
      cacheStore.invalidateByTags(['user', 'auth'])
      
      // Clear sensitive storage
      storageStore.removeData('user-session')
      storageStore.removeData('temp-tokens')
      
      // Update preferences
      storageStore.setUserPreference('lastLogout', new Date().toISOString())
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const refreshAuthToken = async () => {
    try {
      if (!authStore.refreshToken) {
        throw new Error('No refresh token available')
      }
      
      authStore.setLoading(true)
      
      // Simulate token refresh (replace with actual API)
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: authStore.refreshToken })
      })
      
      if (!response.ok) {
        throw new Error('Token refresh failed')
      }
      
      const data = await response.json()
      
      // Update tokens
      authStore.setToken(data.token, data.refreshToken, data.expiresAt)
      
      return { success: true, token: data.token }
    } catch (error) {
      console.error('Token refresh error:', error)
      // Force logout on refresh failure
      await logout()
      return { success: false, error: error.message }
    } finally {
      authStore.setLoading(false)
    }
  }

  const ensureValidToken = async () => {
    if (!token.value) return false
    
    if (authStore.isTokenExpired()) {
      if (authStore.shouldRefreshToken()) {
        const result = await refreshAuthToken()
        return result.success
      } else {
        // Token expired and can't refresh
        await logout()
        return false
      }
    }
    
    return true
  }

  const updateUser = (userData) => {
    authStore.setUser(userData)
    
    // Update cached user data
    cacheStore.setCache('user-data', userData, {
      tags: ['user', 'auth'],
      maxAge: 3600000
    })
    
    // Save to storage
    storageStore.setData('user-profile', userData)
  }

  // Enhanced permission and role checking with caching
  const hasPermission = (permission) => {
    const cacheKey = `permission-${permission}`
    const cached = cacheStore.getCache(cacheKey)
    
    if (cached !== null) {
      return cached
    }
    
    const result = authStore.hasPermission(permission)
    cacheStore.setCache(cacheKey, result, { maxAge: 300000 }) // 5 minutes
    
    return result
  }

  const hasRole = (role) => {
    const cacheKey = `role-${role}`
    const cached = cacheStore.getCache(cacheKey)
    
    if (cached !== null) {
      return cached
    }
    
    const result = authStore.hasRole(role)
    cacheStore.setCache(cacheKey, result, { maxAge: 300000 }) // 5 minutes
    
    return result
  }

  // User preferences and form data management
  const setUserPreference = (key, value) => {
    storageStore.setUserPreference(key, value)
  }

  const getUserPreference = (key, defaultValue = null) => {
    return storageStore.getUserPreference(key) ?? defaultValue
  }

  const saveFormData = (formKey, data) => {
    storageStore.saveFormData(formKey, data)
  }

  const loadFormData = (formKey) => {
    return storageStore.loadFormData(formKey)
  }

  const clearFormData = (formKey) => {
    storageStore.clearFormData(formKey)
  }

  // Session management
  const getSessionInfo = () => {
    return {
      isAuthenticated: isAuthenticated.value,
      user: user.value,
      token: token.value,
      lastActivity: lastActivity.value,
      isOffline: isOffline.value,
      permissions: permissions.value,
      roles: roles.value
    }
  }

  const updateLastActivity = () => {
    lastActivity.value = Date.now()
    storageStore.setData('last-activity', lastActivity.value)
  }

  // Activity tracking
  watch(isAuthenticated, (authenticated) => {
    if (authenticated) {
      updateLastActivity()
    }
  })

  // Initialize
  const initialize = () => {
    if (isInitialized.value) return
    
    // Restore last activity
    const savedActivity = storageStore.getData('last-activity')
    if (savedActivity) {
      lastActivity.value = savedActivity
    }
    
    // Check token validity
    if (isAuthenticated.value) {
      ensureValidToken()
    }
    
    isInitialized.value = true
  }

  // Auto-initialize
  onMounted(() => {
    initialize()
  })

  return {
    // State
    isAuthenticated,
    user,
    token,
    isLoading,
    isOffline,
    permissions,
    roles,
    isInitialized,
    lastActivity,
    
    // Authentication methods
    login,
    logout,
    refreshAuthToken,
    ensureValidToken,
    updateUser,
    
    // Permission and role checking
    hasPermission,
    hasRole,
    
    // User preferences and form data
    setUserPreference,
    getUserPreference,
    saveFormData,
    loadFormData,
    clearFormData,
    
    // Session management
    getSessionInfo,
    updateLastActivity,
    
    // Initialization
    initialize
  }
}

// Export the hook
export default useVrmAuthEnhancedVue
