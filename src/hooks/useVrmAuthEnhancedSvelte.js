import { writable, derived, onMount } from 'svelte/store'
import { useAuthStore } from '../stores/useAuthStore'
import { useCacheStore } from '../stores/useCacheStore'
import { useStorageStore } from '../stores/useStorageStore'

/**
 * Enhanced authentication hook for Svelte
 * Provides advanced authentication features with Zustand stores
 */
export function useVrmAuthEnhancedSvelte() {
  // Get stores
  const authStore = useAuthStore()
  const cacheStore = useCacheStore()
  const storageStore = useStorageStore()

  // Create Svelte stores
  const isInitialized = writable(false)
  const lastActivity = writable(Date.now())

  // Derived stores from Zustand
  const isAuthenticated = derived(authStore, ($store) => $store?.isAuthenticated ?? false)
  const user = derived(authStore, ($store) => $store?.user ?? null)
  const token = derived(authStore, ($store) => $store?.token ?? null)
  const isLoading = derived(authStore, ($store) => $store?.isLoading ?? false)
  const isOffline = derived(authStore, ($store) => $store?.isOffline ?? false)
  const permissions = derived(authStore, ($store) => $store?.permissions ?? [])
  const roles = derived(authStore, ($store) => $store?.roles ?? [])

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
    const currentToken = authStore.token
    if (!currentToken) return false
    
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
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      token: authStore.token,
      lastActivity: lastActivity,
      isOffline: authStore.isOffline,
      permissions: authStore.permissions,
      roles: authStore.roles
    }
  }

  const updateLastActivity = () => {
    lastActivity.set(Date.now())
    storageStore.setData('last-activity', Date.now())
  }

  // Initialize
  const initialize = () => {
    // Restore last activity
    const savedActivity = storageStore.getData('last-activity')
    if (savedActivity) {
      lastActivity.set(savedActivity)
    }
    
    // Check token validity
    if (authStore.isAuthenticated) {
      ensureValidToken()
    }
    
    isInitialized.set(true)
  }

  // Auto-initialize
  onMount(() => {
    initialize()
  })

  return {
    // Svelte stores
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
export default useVrmAuthEnhancedSvelte
