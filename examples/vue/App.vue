<script setup>
import { useVormiaQuery } from "vormiaqueryjs/adapters/vue";

const { data, error, isLoading } = useVormiaQuery({
  endpoint: "/categories",
  method: "GET",
});
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold text-center mb-8">
      VormiaQueryJS Vue Example
    </h1>

    <!-- Notification Display -->
    <div v-if="notification" class="notification-panel">
      <div :class="getNotificationClasses()" class="p-4 border rounded-lg">
        <div class="flex items-center">
          <span class="text-lg mr-3">{{ getNotificationIcon() }}</span>
          <div class="flex-1">
            <h3 v-if="notification.title" class="font-semibold text-sm">{{ notification.title }}</h3>
            <p class="text-sm">{{ notification.message }}</p>
          </div>
          <button @click="closeNotification" class="ml-3 hover:opacity-70 transition-opacity">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Registration Form -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-6">User Registration</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Enter your full name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div v-if="fieldErrors.name" class="mt-2">
            <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-white">{{ fieldErrors.name }}</p>
                <button @click="clearFieldError('name')" class="ml-auto text-white hover:text-gray-200">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="Enter your email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div v-if="fieldErrors.email" class="mt-2">
            <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-white">{{ fieldErrors.email }}</p>
                <button @click="clearFieldError('email')" class="ml-auto text-white hover:text-gray-200">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="Enter your password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div v-if="fieldErrors.password" class="mt-2">
            <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-white">{{ fieldErrors.password }}</p>
                <button @click="clearFieldError('password')" class="ml-auto text-white hover:text-gray-200">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <!-- General Error Display -->
      <div v-if="generalError" class="mt-4">
        <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-white flex-1">{{ generalError }}</p>
            <button @click="clearGeneralError" class="text-red-400 hover:text-red-600">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Information -->
    <div class="bg-gray-50 p-4 rounded-lg">
      <h3 class="font-semibold mb-2">Form Status</h3>
      <div class="space-y-1 text-sm text-gray-600">
        <p>Loading: {{ isLoading ? 'Yes' : 'No' }}</p>
        <p>Has Data: {{ hasData ? 'Yes' : 'No' }}</p>
        <p>Has Error: {{ hasError ? 'Yes' : 'No' }}</p>
        <p>Field Errors: {{ Object.keys(fieldErrors).length }}</p>
        <p>General Error: {{ generalError ? 'Yes' : 'No' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VormiaQueryJSVueExample',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      fieldErrors: {},
      generalError: '',
      notification: null,
      isLoading: false,
      hasData: false,
      hasError: false
    }
  },
  mounted() {
    // Show welcome notification
    this.showNotification('success', 'Welcome to VormiaQueryJS Vue Example!', 'System Ready')
  },
  methods: {
    async handleSubmit() {
      // Clear previous errors
      this.fieldErrors = {}
      this.generalError = ''
      this.isLoading = true

      try {
        // Simulate API call with form data transformation
        const transformedData = this.transformFormData(this.formData)
        
        // Simulate API response
        await this.simulateApiCall(transformedData)
        
        // Success
        this.showNotification('success', 'Account created successfully!', 'Success')
        this.hasData = true
        this.hasError = false
        
        // Reset form
        this.formData = { name: '', email: '', password: '', confirmPassword: '' }
        
      } catch (error) {
        // Error
        this.showNotification('error', error.message || 'Registration failed', 'Error')
        this.hasError = true
        this.hasData = false
        
        // Handle field errors if available
        if (error.fieldErrors) {
          this.fieldErrors = error.fieldErrors
          this.generalError = ''
        } else {
          this.generalError = error.message || 'Registration failed'
          this.fieldErrors = {}
        }
      } finally {
        this.isLoading = false
      }
    },

    transformFormData(formData) {
      // Simulate the form data transformation that VormiaQueryJS does
      return {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword, // Renamed
        terms: true, // Added
        source: 'web' // Added
        // confirmPassword removed
      }
    },

    async simulateApiCall(data) {
      // Simulate API call with random success/failure
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            // Success
            resolve({ success: true, data })
          } else {
            // Error - simulate validation errors
            reject({
              message: 'Validation failed',
              fieldErrors: {
                name: ['Name must be at least 2 characters'],
                email: ['Email format is invalid'],
                password: ['Password is too weak']
              }
            })
          }
        }, 1000)
      })
    },

    showNotification(type, message, title = '') {
      this.notification = { type, message, title }
    },

    closeNotification() {
      this.notification = null
    },

    clearFieldError(field) {
      this.$set(this.fieldErrors, field, '')
    },

    clearGeneralError() {
      this.generalError = ''
    },

    getNotificationClasses() {
      const baseClasses = 'border rounded-lg'
      switch (this.notification.type) {
        case 'success':
          return `${baseClasses} bg-green-50 border-green-200 text-green-800`
        case 'error':
          return `${baseClasses} bg-red-500 border-red-200 text-white`
        case 'warning':
          return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800`
        case 'info':
          return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`
        default:
          return `${baseClasses} bg-gray-50 border-gray-200 text-gray-800`
      }
    },

    getNotificationIcon() {
      switch (this.notification.type) {
        case 'success': return '✅'
        case 'error': return '❌'
        case 'warning': return '⚠️'
        case 'info': return 'ℹ️'
        default: return '📢'
      }
    }
  }
}
</script>

<style scoped>
.notification-panel {
  position: sticky;
  top: 0;
  z-index: 50;
}
</style>
