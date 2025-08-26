import { useAuthStore } from '../stores/useAuthStore'

/**
 * Vue.js Route Guard Component Factory
 * Creates a route guard component for Vue 3 Composition API
 */
export function createVormiaRouteGuardVue() {
  return {
    name: 'VormiaRouteGuard',
    props: {
      roles: {
        type: Array,
        default: () => []
      },
      permissions: {
        type: Array,
        default: () => []
      },
      redirectTo: {
        type: String,
        default: ''
      },
      fallback: {
        type: [String, Object],
        default: null
      },
      loadingComponent: {
        type: [String, Object],
        default: null
      },
      validate: {
        type: Function,
        default: null
      },
      requireAll: {
        type: Boolean,
        default: true
      },
      onUnauthorized: {
        type: Function,
        default: null
      },
      strict: {
        type: Boolean,
        default: true
      },
      redirectMode: {
        type: String,
        default: 'replace', // 'replace' or 'push'
        validator: (value) => ['replace', 'push'].includes(value)
      }
    },
    emits: ['unauthorized', 'authorized'],
    setup(props, { emit, slots }) {
      const authStore = useAuthStore()
      
      // Check if user has required roles
      const hasRequiredRoles = () => {
        if (!props.roles || props.roles.length === 0) return true
        
        if (props.requireAll) {
          // User must have ALL required roles
          return props.roles.every(role => authStore.hasRole(role))
        } else {
          // User must have ANY of the required roles
          return props.roles.some(role => authStore.hasRole(role))
        }
      }
      
      // Check if user has required permissions
      const hasRequiredPermissions = () => {
        if (!props.permissions || props.permissions.length === 0) return true
        
        if (props.requireAll) {
          // User must have ALL required permissions
          return props.permissions.every(permission => authStore.hasPermission(permission))
        } else {
          // User must have ANY of the required permissions
          return props.permissions.some(permission => authStore.hasPermission(permission))
        }
      }
      
      // Custom validation
      const customValidation = () => {
        if (!props.validate) return true
        return props.validate(authStore.user)
      }
      
      // Determine access
      const determineAccess = () => {
        // If not strict mode, allow unauthenticated users
        if (!props.strict && !authStore.isAuthenticated) return true
        
        // Check authentication
        if (!authStore.isAuthenticated) return false
        
        // Check roles
        if (!hasRequiredRoles()) return false
        
        // Check permissions
        if (!hasRequiredPermissions()) return false
        
        // Check custom validation
        if (!customValidation()) return false
        
        return true
      }
      
      // Handle unauthorized access
      const handleUnauthorized = () => {
        emit('unauthorized', {
          user: authStore.user,
          roles: props.roles,
          permissions: props.permissions,
          reason: 'access_denied'
        })
        
        if (props.onUnauthorized) {
          props.onUnauthorized({
            user: authStore.user,
            roles: props.roles,
            permissions: props.permissions
          })
        }
        
        // Redirect if specified
        if (props.redirectTo) {
          setTimeout(() => {
            if (props.redirectMode === 'push') {
              window.history.pushState(null, '', props.redirectTo)
            } else {
              window.history.replaceState(null, '', props.redirectTo)
            }
          }, 100)
        }
      }
      
      // Check access and emit events
      const checkAccess = () => {
        const access = determineAccess()
        
        if (access) {
          emit('authorized', {
            user: authStore.user,
            roles: props.roles,
            permissions: props.permissions
          })
        } else {
          handleUnauthorized()
        }
        
        return access
      }
      
      // Return the component template and logic
      return {
        authStore,
        determineAccess,
        checkAccess,
        hasRequiredRoles,
        hasRequiredPermissions,
        customValidation
      }
    },
    template: `
      <div>
        <!-- Loading state -->
        <div v-if="authStore.isLoading">
          <slot name="loading">
            <div class="vormia-loading">Loading...</div>
          </slot>
        </div>

        <!-- Access granted - render children -->
        <div v-else-if="determineAccess()">
          <slot />
        </div>

        <!-- Access denied - show fallback or redirect -->
        <div v-else>
          <slot name="fallback" v-if="$slots.fallback">
            <slot name="fallback" />
          </slot>
          <div v-else-if="redirectTo" class="vormia-redirect">
            Redirecting to {{ redirectTo }}...
          </div>
          <div v-else class="vormia-access-denied">
            Access Denied
          </div>
        </div>
      </div>
    `,
    mounted() {
      // Initial access check
      this.checkAccess()
    },
    watch: {
      'authStore.isAuthenticated'() {
        this.checkAccess()
      },
      'authStore.user'() {
        this.checkAccess()
      }
    }
  }
}

// Export the factory function
export default createVormiaRouteGuardVue
