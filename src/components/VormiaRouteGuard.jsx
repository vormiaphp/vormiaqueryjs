import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore.js';

/**
 * VormiaRouteGuard - Declarative route protection component
 * Provides role-based and permission-based access control
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render when authorized
 * @param {string[]|string} [props.roles] - Required roles (user must have ANY of these)
 * @param {string[]|string} [props.permissions] - Required permissions (user must have ALL of these by default)
 * @param {string} [props.redirectTo] - Route to redirect to when unauthorized
 * @param {React.ReactNode} [props.fallback] - Component to render when unauthorized (alternative to redirect)
 * @param {React.ReactNode} [props.loadingComponent] - Component to render while checking auth
 * @param {Function} [props.validate] - Custom validation function
 * @param {boolean} [props.requireAll] - Whether user must have ALL permissions (default: true for permissions, false for roles)
 * @param {Function} [props.onUnauthorized] - Callback when access is denied
 * @param {boolean} [props.strict] - Whether to strictly check auth state (default: true)
 * @param {string} [props.redirectMode] - 'push' or 'replace' for navigation (default: 'push')
 */
const VormiaRouteGuard = ({
  children,
  roles,
  permissions,
  redirectTo,
  fallback,
  loadingComponent,
  validate,
  requireAll = null, // Will be set based on prop type if not specified
  onUnauthorized,
  strict = true,
  redirectMode = 'push'
}) => {
  // Get auth state from Zustand store
  const {
    isAuthenticated,
    user,
    isLoading,
    hasPermission,
    hasRole,
    isTokenExpired
  } = useAuthStore();
  
  // Local state for component
  const [localLoading, setLocalLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  
  // Determine requireAll behavior based on prop types
  const effectiveRequireAll = requireAll !== null ? requireAll : 
    (permissions ? true : false); // Default: true for permissions, false for roles
  
  // Check authorization
  useEffect(() => {
    const checkAuthorization = async () => {
      setLocalLoading(true);
      
      try {
        let authorized = false;
        
        // If strict mode is enabled, user must be authenticated
        if (strict && !isAuthenticated) {
          authorized = false;
        } else if (!strict && !isAuthenticated) {
          // In non-strict mode, allow unauthenticated users
          authorized = true;
        } else {
          // Check custom validation first
          if (validate && typeof validate === 'function') {
            authorized = validate(user);
          } else {
            authorized = true;
          }
          
          // Check roles if specified
          if (authorized && roles) {
            if (effectiveRequireAll) {
              // User must have ALL specified roles
              authorized = hasAllRoles(roles);
            } else {
              // User must have ANY of the specified roles
              authorized = hasRole(roles);
            }
          }
          
          // Check permissions if specified
          if (authorized && permissions) {
            if (effectiveRequireAll) {
              // User must have ALL specified permissions
              authorized = hasPermission(permissions);
            } else {
              // User must have ANY of the specified permissions
              authorized = hasAnyPermission(permissions);
            }
          }
        }
        
        setIsAuthorized(authorized);
        
        // Call onUnauthorized callback if access is denied
        if (!authorized && onUnauthorized && typeof onUnauthorized === 'function') {
          onUnauthorized(user);
        }
        
        // Handle redirect if specified and unauthorized
        if (!authorized && redirectTo && typeof window !== 'undefined') {
          handleRedirect(redirectTo, redirectMode);
        }
        
      } catch (error) {
        console.error('VormiaRouteGuard authorization check failed:', error);
        setIsAuthorized(false);
      } finally {
        setLocalLoading(false);
        setHasChecked(true);
      }
    };
    
    // Check authorization when dependencies change
    checkAuthorization();
  }, [
    isAuthenticated,
    user,
    roles,
    permissions,
    validate,
    effectiveRequireAll,
    redirectTo,
    redirectMode,
    onUnauthorized,
    strict,
    hasPermission,
    hasRole
  ]);
  
  // Helper functions for role and permission checking
  const hasAllRoles = (roleArray) => {
    if (!Array.isArray(roleArray)) {
      roleArray = [roleArray];
    }
    return roleArray.every(role => hasRole(role));
  };
  
  const hasAnyPermission = (permissionArray) => {
    if (!Array.isArray(permissionArray)) {
      permissionArray = [permissionArray];
    }
    return permissionArray.some(permission => hasPermission(permission));
  };
  
  // Handle navigation
  const handleRedirect = (path, mode) => {
    if (typeof window !== 'undefined' && window.history) {
      if (mode === 'replace') {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
      
      // Trigger navigation event for SPA routers
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  
  // Show loading component while checking auth
  if (isLoading || localLoading) {
    return loadingComponent || (
      <div className="vormia-guard-loading">
        <div className="vormia-guard-spinner"></div>
        <span>Checking authorization...</span>
      </div>
    );
  }
  
  // Show fallback component if unauthorized and no redirect
  if (!isAuthorized && fallback && !redirectTo) {
    return fallback;
  }
  
  // Show nothing if unauthorized and redirecting
  if (!isAuthorized && redirectTo) {
    return null;
  }
  
  // Render children if authorized
  if (isAuthorized) {
    return children;
  }
  
  // Default unauthorized state (should not reach here in normal flow)
  return null;
};

/**
 * Higher-order component version of VormiaRouteGuard
 * Useful for wrapping components with route protection
 */
export const withVormiaGuard = (Component, guardProps) => {
  const WrappedComponent = (props) => (
    <VormiaRouteGuard {...guardProps}>
      <Component {...props} />
    </VormiaRouteGuard>
  );
  
  WrappedComponent.displayName = `withVormiaGuard(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook version of VormiaRouteGuard
 * Returns authorization status and can be used for conditional rendering
 */
export const useVormiaGuard = (guardProps) => {
  const {
    roles,
    permissions,
    validate,
    requireAll = null,
    strict = true
  } = guardProps || {};
  
  const {
    isAuthenticated,
    user,
    isLoading,
    hasPermission,
    hasRole
  } = useAuthStore();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      let authorized = true;
      
      if (strict && !isAuthenticated) {
        authorized = false;
      } else if (validate && typeof validate === 'function') {
        authorized = validate(user);
      }
      
      if (authorized && roles) {
        const effectiveRequireAll = requireAll !== null ? requireAll : false;
        if (effectiveRequireAll) {
          authorized = Array.isArray(roles) ? 
            roles.every(role => hasRole(role)) : 
            hasRole(roles);
        } else {
          authorized = Array.isArray(roles) ? 
            roles.some(role => hasRole(role)) : 
            hasRole(roles);
        }
      }
      
      if (authorized && permissions) {
        const effectiveRequireAll = requireAll !== null ? requireAll : true;
        if (effectiveRequireAll) {
          authorized = Array.isArray(permissions) ? 
            permissions.every(perm => hasPermission(perm)) : 
            hasPermission(permissions);
        } else {
          authorized = Array.isArray(permissions) ? 
            permissions.some(perm => hasPermission(perm)) : 
            hasPermission(permissions);
        }
      }
      
      setIsAuthorized(authorized);
    };
    
    checkAuth();
  }, [
    isAuthenticated,
    user,
    roles,
    permissions,
    validate,
    requireAll,
    strict,
    hasPermission,
    hasRole
  ]);
  
  return {
    isAuthorized,
    isLoading,
    user,
    isAuthenticated
  };
};

export default VormiaRouteGuard;
