import { useAuthStore } from '../stores/useAuthStore'

/**
 * Svelte Route Guard Component Factory
 * Creates a route guard component for Svelte
 */
export function createVormiaRouteGuardSvelte() {
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
    setup(props, { dispatch }) {
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
        // Dispatch custom event
        dispatch('unauthorized', {
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
      
      // Check access and dispatch events
      const checkAccess = () => {
        const access = determineAccess()
        
        if (access) {
          dispatch('authorized', {
            user: authStore.user,
            roles: props.roles,
            permissions: props.permissions
          })
        } else {
          handleUnauthorized()
        }
        
        return access
      }
      
      // Return the component logic
      return {
        authStore,
        determineAccess,
        checkAccess,
        hasRequiredRoles,
        hasRequiredPermissions,
        customValidation
      }
    },
    // Svelte component structure
    component: {
      // This would be used in a Svelte component
      // The actual implementation would be in the Svelte component file
    }
  }
}

// Export the factory function
export default createVormiaRouteGuardSvelte
