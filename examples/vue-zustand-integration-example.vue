<template>
  <div class="vue-vormia-example">
    <h1>Vue.js + VormiaQueryJS + Zustand</h1>
    
    <!-- Authentication Status -->
    <div class="auth-status">
      <h2>Authentication Status</h2>
      <p>Logged in: {{ isAuthenticated ? 'Yes' : 'No' }}</p>
      <p v-if="user">User: {{ user.name }} ({{ user.email }})</p>
      <p>Roles: {{ roles.join(', ') || 'None' }}</p>
      <p>Permissions: {{ permissions.join(', ') || 'None' }}</p>
    </div>

    <!-- Login Form -->
    <div v-if="!isAuthenticated" class="login-form">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label>Email:</label>
          <input v-model="loginForm.email" type="email" required />
        </div>
        <div>
          <label>Password:</label>
          <input v-model="loginForm.password" type="password" required />
        </div>
        <div>
          <label>
            <input v-model="loginForm.rememberMe" type="checkbox" />
            Remember Me
          </label>
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>

    <!-- Logout Button -->
    <div v-if="isAuthenticated" class="logout-section">
      <button @click="handleLogout">Logout</button>
    </div>

    <!-- Route Protection Examples -->
    <div class="route-examples">
      <h2>Route Protection Examples</h2>
      
      <!-- Admin Only Content -->
      <VormiaRouteGuard 
        :roles="['admin']" 
        @authorized="handleAuthorized"
        @unauthorized="handleUnauthorized"
      >
        <div class="admin-content">
          <h3>Admin Dashboard</h3>
          <p>This content is only visible to admins.</p>
          <button @click="adminAction">Admin Action</button>
        </div>
      </VormiaRouteGuard>

      <!-- Moderator or Admin Content -->
      <VormiaRouteGuard 
        :roles="['admin', 'moderator']" 
        :requireAll="false"
        @authorized="handleAuthorized"
        @unauthorized="handleUnauthorized"
      >
        <div class="moderator-content">
          <h3>Moderator Panel</h3>
          <p>This content is visible to moderators and admins.</p>
          <button @click="moderatorAction">Moderator Action</button>
        </div>
      </VormiaRouteGuard>

      <!-- Permission-based Content -->
      <VormiaRouteGuard 
        :permissions="['manage_users']"
        @authorized="handleAuthorized"
        @unauthorized="handleUnauthorized"
      >
        <div class="permission-content">
          <h3>User Management</h3>
          <p>This content requires 'manage_users' permission.</p>
          <button @click="userManagementAction">Manage Users</button>
        </div>
      </VormiaRouteGuard>

      <!-- Custom Validation -->
      <VormiaRouteGuard 
        :validate="validatePremiumUser"
        @authorized="handleAuthorized"
        @unauthorized="handleUnauthorized"
      >
        <div class="premium-content">
          <h3>Premium Features</h3>
          <p>This content is only for premium users.</p>
          <button @click="premiumAction">Premium Action</button>
        </div>
      </VormiaRouteGuard>
    </div>

    <!-- User Preferences -->
    <div v-if="isAuthenticated" class="user-preferences">
      <h2>User Preferences</h2>
      <div>
        <label>Theme:</label>
        <select v-model="selectedTheme" @change="updateTheme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      <div>
        <label>Notifications:</label>
        <input 
          v-model="notificationsEnabled" 
          type="checkbox" 
          @change="updateNotifications"
        />
      </div>
    </div>

    <!-- Form Data Persistence -->
    <div class="form-persistence">
      <h2>Form Data Persistence</h2>
      <form @submit.prevent="saveFormData">
        <div>
          <label>Name:</label>
          <input v-model="formData.name" type="text" />
        </div>
        <div>
          <label>Email:</label>
          <input v-model="formData.email" type="email" />
        </div>
        <div>
          <label>Message:</label>
          <textarea v-model="formData.message"></textarea>
        </div>
        <button type="submit">Save Form Data</button>
        <button type="button" @click="loadFormData">Load Form Data</button>
        <button type="button" @click="clearFormData">Clear Form Data</button>
      </form>
    </div>

    <!-- Cache Management -->
    <div class="cache-management">
      <h2>Cache Management</h2>
      <button @click="clearCache">Clear Cache</button>
      <button @click="getCacheStats">Get Cache Stats</button>
      <div v-if="cacheStats">
        <p>Cache Items: {{ cacheStats.itemCount }}</p>
        <p>Cache Size: {{ cacheStats.totalSize }} bytes</p>
        <p>Hit Rate: {{ cacheStats.hitRate }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createVormiaRouteGuardVue } from 'vormiaqueryjs/vue'
import { useVrmAuthEnhancedVue } from 'vormiaqueryjs/vue'

// Create the route guard component
const VormiaRouteGuard = createVormiaRouteGuardVue()

// Enhanced authentication hook
const auth = useVrmAuthEnhancedVue()

// Reactive state
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const formData = reactive({
  name: '',
  email: '',
  message: ''
})

const selectedTheme = ref('light')
const notificationsEnabled = ref(true)
const cacheStats = ref(null)

// Computed properties from auth hook
const isAuthenticated = auth.isAuthenticated
const user = auth.user
const roles = auth.roles
const permissions = auth.permissions
const isLoading = auth.isLoading

// Methods
const handleLogin = async () => {
  const result = await auth.login(loginForm)
  if (result.success) {
    console.log('Login successful:', result.user)
    // Reset form
    loginForm.email = ''
    loginForm.password = ''
    loginForm.rememberMe = false
  } else {
    console.error('Login failed:', result.error)
  }
}

const handleLogout = async () => {
  const result = await auth.logout()
  if (result.success) {
    console.log('Logout successful')
  } else {
    console.error('Logout failed:', result.error)
  }
}

const handleAuthorized = (data) => {
  console.log('Access granted:', data)
}

const handleUnauthorized = (data) => {
  console.log('Access denied:', data)
}

const adminAction = () => {
  console.log('Admin action executed')
}

const moderatorAction = () => {
  console.log('Moderator action executed')
}

const userManagementAction = () => {
  console.log('User management action executed')
}

const premiumAction = () => {
  console.log('Premium action executed')
}

const validatePremiumUser = (user) => {
  return user && user.subscription === 'premium'
}

const updateTheme = (event) => {
  const theme = event.target.value
  auth.setUserPreference('theme', theme)
  console.log('Theme updated:', theme)
}

const updateNotifications = (event) => {
  const enabled = event.target.checked
  auth.setUserPreference('notifications', enabled)
  console.log('Notifications updated:', enabled)
}

const saveFormData = () => {
  auth.saveFormData('contact-form', formData)
  console.log('Form data saved')
}

const loadFormData = () => {
  const saved = auth.loadFormData('contact-form')
  if (saved) {
    Object.assign(formData, saved)
    console.log('Form data loaded')
  }
}

const clearFormData = () => {
  auth.clearFormData('contact-form')
  Object.assign(formData, { name: '', email: '', message: '' })
  console.log('Form data cleared')
}

const clearCache = () => {
  // This would use the cache store directly
  console.log('Cache cleared')
}

const getCacheStats = () => {
  // This would use the cache store directly
  cacheStats.value = {
    itemCount: 25,
    totalSize: 1024000,
    hitRate: 85
  }
}

// Load saved preferences on mount
onMounted(() => {
  const savedTheme = auth.getUserPreference('theme', 'light')
  const savedNotifications = auth.getUserPreference('notifications', true)
  
  selectedTheme.value = savedTheme
  notificationsEnabled.value = savedNotifications
  
  // Load saved form data
  const savedFormData = auth.loadFormData('contact-form')
  if (savedFormData) {
    Object.assign(formData, savedFormData)
  }
})
</script>

<style scoped>
.vue-vormia-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.auth-status, .login-form, .route-examples, .user-preferences, .form-persistence, .cache-management {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h1, h2, h3 {
  color: #333;
}

form div {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input, select, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.admin-content, .moderator-content, .permission-content, .premium-content {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.admin-content {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.moderator-content {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
}

.permission-content {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
}

.premium-content {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
</style>
