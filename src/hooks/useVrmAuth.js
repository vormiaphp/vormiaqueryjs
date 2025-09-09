import { useQuery, useMutation } from "@tanstack/react-query";
import { getGlobalVormiaClient } from "../client/createVormiaClient";
import { transformFormData } from "../utils/formDataTransformer.js";
import {
  logErrorForDebug,
  logSuccessForDebug,
} from "../utils/enhancedErrorHandler.js";
import {
  showSuccessNotification,
  showErrorNotification,
  createNotificationHtml,
} from "../components/NotificationPanel.jsx";
import {
  createErrorDebugHtml,
  shouldShowDebug,
  createDebugInfo,
} from "../components/ErrorDebugPanel.jsx";

/**
 * Hook for authenticated queries
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.params] - Query parameters
 * @param {Object} [options.data] - Request body
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {boolean} [options.storeToken=true] - Whether to store the auth token
 * @returns {Object} Query result
 */
export const useVormiaQueryAuth = (options) => {
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = "GET",
    params,
    data,
    headers = {},
    transform,
    storeToken = true,
    ...queryOptions
  } = options;

  const queryKey = [endpoint, method, params, data];

  const queryFn = async () => {
    try {
      const config = {
        method,
        url: endpoint,
        params: method === "GET" ? params : undefined,
        data: method !== "GET" ? data : undefined,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      const response = await client.request(config);

      // Store token if present in response
      if (storeToken && response.data?.access_token) {
        client.setAuthToken(response.data.access_token);
      }

      if (transform && typeof transform === "function") {
        return {
          ...response,
          data: transform(response.data),
        };
      }

      return response;
    } catch (error) {
      // Clear token on 401
      if (error.status === 401) {
        client.removeAuthToken();
      }
      throw error instanceof Error
        ? error
        : new Error("Authentication query failed");
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    retry: (failureCount, error) => {
      // Don't retry on 401
      if (error.status === 401) return false;
      return failureCount < 3; // Retry up to 3 times
    },
    ...queryOptions,
  });
};

/**
 * Authenticated mutation hook with form data transformation
 * @param {Object} options - Mutation options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='POST'] - HTTP method
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Response transformation function
 * @param {boolean} [options.storeToken=true] - Whether to store auth token
 * @param {Function} [options.onLoginSuccess] - Login success callback
 * @param {Object} [options.formdata] - Form data transformation config
 * @param {boolean} [options.manualTransformation=false] - Skip auto transformation
 * @param {boolean} [options.showDebug] - Override debug panel visibility
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Mutation result with enhanced utilities
 */
export const useVormiaQueryAuthMutation = (options) => {
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = "POST",
    headers = {},
    transform,
    storeToken = true,
    onLoginSuccess,
    formdata,
    manualTransformation = false,
    showDebug = null,
    errorLabel = "Mutation Error", // Allow custom error label
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  // Determine if debug should be shown (respects VITE_VORMIA_DEBUG)
  const shouldShowDebugPanel =
    showDebug !== null ? showDebug : shouldShowDebug();

  const mutation = useMutation({
    mutationFn: async (variables) => {
      let requestData = variables;

      // Apply form data transformation if configured
      if (!manualTransformation && formdata) {
        requestData = transformFormData(variables, formdata);
      }

      const config = {
        method,
        url: endpoint,
        data: requestData,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      const response = await client.request(config);

      // Store token if present in response
      if (storeToken && response.data?.access_token) {
        client.setAuthToken(response.data.access_token);
      }

      if (transform && typeof transform === "function") {
        return {
          ...response,
          data: transform(response.data),
        };
      }

      return response;
    },
    onSuccess: (data, variables, context) => {
      // Log success for debugging
      if (shouldShowDebugPanel) {
        logSuccessForDebug(data, "Mutation Success");
      }

      // Show success notification
      if (data?.message) {
        showSuccessNotification(data.message, "Success");
      }

      // Call custom success handler
      if (onSuccess) {
        onSuccess(data, variables, context);
      }

      // Handle login success - store user data automatically
      if (data.data?.access_token) {
        // Store user data in localStorage for useVormiaAuth
        const userData = {
          ...data.data,
          token: data.data.access_token, // Store access_token as token for compatibility
          roles: data.data.user_roles || [],
          permissions: data.data.user_permissions || [],
        };

        // Debug: Log the user data being stored
        console.log("🔐 Storing user data:", userData);

        // Store in localStorage
        try {
          localStorage.setItem("vormia_user_data", JSON.stringify(userData));
        } catch (error) {
          console.warn("Failed to store user data:", error);
        }

        // Call custom login success handler
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      }
    },
    onError: (error, variables, context) => {
      // Log for debugging
      if (shouldShowDebugPanel) {
        logErrorForDebug(error, errorLabel);
      }

      // Show error notification
      if (error.response?.message || error.response?.response?.data?.message) {
        const message =
          error.response?.message || error.response?.response?.data?.message;
        showErrorNotification(message, "Error");
      }

      // Call custom error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });

  // Authentication methods
  const login = async (credentials) => {
    return mutation.mutateAsync(credentials);
  };

  const logout = () => {
    client.removeAuthToken();
    mutation.reset();

    // Clear user data from localStorage
    try {
      localStorage.removeItem("vormia_user_data");
    } catch (error) {
      console.warn("Failed to clear user data:", error);
    }
  };

  const isAuthenticated = () => {
    return !!client.getAuthToken();
  };

  return {
    ...mutation,
    login,
    logout,
    isAuthenticated,

    // Form data transformation utilities
    transformFormData: (data) => {
      if (!manualTransformation && formdata) {
        return transformFormData(data, formdata);
      }
      return data;
    },

    // Update formdata configuration
    updateFormdata: (newFormdata) => {
      if (formdata) {
        Object.assign(formdata, newFormdata);
      }
    },

    // Get notification HTML (framework agnostic)
    getNotificationHtml: (type, title, message) => {
      const notification = {
        type,
        title,
        message,
        key: `${type}-${Date.now()}`,
      };
      return createNotificationHtml(notification);
    },

    // Get debug panel HTML (framework agnostic)
    getDebugHtml: (response) => {
      if (!shouldShowDebugPanel) return "";
      const debugInfo = createDebugInfo(response);
      return createErrorDebugHtml(debugInfo);
    },
  };
};

/**
 * Hook for checking authentication status
 * @returns {Object} Authentication status
 */
export const useAuthStatus = () => {
  const client = getGlobalVormiaClient();
  const isAuthenticated = !!client.getAuthToken();

  return {
    isAuthenticated,
    isLoading: false,
  };
};

/**
 * Enhanced authentication and authorization hook
 * Provides comprehensive user management, permissions, and role checking
 * @returns {Object} Authentication and authorization utilities
 */
export const useVormiaAuth = () => {
  const client = getGlobalVormiaClient();

  // Get user data from token or stored user info
  const getUser = () => {
    try {
      const token = client.getAuthToken();
      if (!token) {
        console.log("🔐 No auth token found");
        return null;
      }

      // Try to get user from localStorage
      const userData = localStorage.getItem("vormia_user_data");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("🔐 Retrieved user data:", parsedUser);
        return parsedUser;
      }

      // If no stored user data, return basic token info
      console.log("🔐 No stored user data, returning basic token info");
      return { token: !!token };
    } catch (error) {
      console.warn("Failed to get user data:", error);
      return null;
    }
  };

  // Store user data (call this after successful login)
  const setUser = (userData) => {
    try {
      console.log("🔐 setUser called with:", userData);
      localStorage.setItem("vormia_user_data", JSON.stringify(userData));
      console.log("🔐 User data stored successfully");
      
      // Verify storage
      const stored = localStorage.getItem("vormia_user_data");
      console.log("🔐 Verification - stored data:", stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.warn("Failed to store user data:", error);
    }
  };

  // Clear user data (call this on logout)
  const clearUser = () => {
    try {
      localStorage.removeItem("vormia_user_data");
    } catch (error) {
      console.warn("Failed to clear user data:", error);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    const user = getUser();
    if (!user || !user.permissions) return false;

    if (Array.isArray(permission)) {
      // Check if user has ALL permissions in the array
      return permission.every((perm) => user.permissions.includes(perm));
    }

    return user.permissions.includes(permission);
  };

  // Check if user has ANY of the specified permissions
  const hasAnyPermission = (permissions) => {
    const user = getUser();
    if (!user || !user.permissions) return false;

    return permissions.some((permission) =>
      user.permissions.includes(permission)
    );
  };

  // Check if user has a specific role
  const isUser = (role) => {
    const user = getUser();
    if (!user || !user.roles) return false;

    if (Array.isArray(role)) {
      // Check if user has ANY of the specified roles
      return role.some((r) => user.roles.includes(r));
    }

    return user.roles.includes(role);
  };

  // Check if user has ALL of the specified roles
  const hasAllRoles = (roles) => {
    const user = getUser();
    if (!user || !user.roles) return false;

    return roles.every((role) => user.roles.includes(role));
  };

  // Get user's permissions
  const getPermissions = () => {
    const user = getUser();
    return user?.permissions || [];
  };

  // Get user's roles
  const getRoles = () => {
    const user = getUser();
    return user?.roles || [];
  };

  // Check if user is admin (common role name)
  const isAdmin = () => {
    return isUser([
      "admin",
      "Admin",
      "ADMIN",
      "administrator",
      "Administrator",
    ]);
  };

  // Check if user is moderator
  const isModerator = () => {
    return isUser(["moderator", "Moderator", "MODERATOR", "mod", "Mod"]);
  };

  // Check if user is super user
  const isSuperUser = () => {
    return isUser([
      "superuser",
      "SuperUser",
      "SUPER_USER",
      "super_user",
      "super",
    ]);
  };

  // Check if user can access a specific resource
  const canAccess = (resource, action = "view") => {
    const permission = `${action}_${resource}`;
    return hasPermission(permission);
  };

  // Check if user can perform CRUD operations
  const canCreate = (resource) => canAccess(resource, "create");
  const canRead = (resource) => canAccess(resource, "view");
  const canUpdate = (resource) => canAccess(resource, "edit");
  const canDelete = (resource) => canAccess(resource, "delete");

  // Check if user can manage other users
  const canManageUsers = () => {
    return (
      hasPermission(["manage_users", "user_management", "admin_users"]) ||
      isAdmin() ||
      isSuperUser()
    );
  };

  // Check if user can view reports
  const canViewReports = () => {
    return (
      hasPermission(["view_reports", "report_access", "reports_view"]) ||
      isAdmin() ||
      isModerator()
    );
  };

  // Check if user can add users
  const canAddUsers = () => {
    return (
      hasPermission(["add_users", "create_users", "user_creation"]) ||
      isAdmin() ||
      isSuperUser()
    );
  };

  // Test function to debug auth issues
  const testAuth = () => {
    console.log("🔐 === AUTH DEBUG TEST ===");
    console.log("🔐 Client token:", client.getAuthToken());
    console.log("🔐 LocalStorage raw:", localStorage.getItem("vormia_user_data"));
    console.log("🔐 getUser() result:", getUser());
    console.log("🔐 isAuthenticated():", !!client.getAuthToken());
    console.log("🔐 === END AUTH DEBUG ===");
  };

  return {
    // Basic auth
    isAuthenticated: () => !!client.getAuthToken(),
    getUser,
    setUser,
    clearUser,
    testAuth, // Add test function

    // Permission checking
    hasPermission,
    hasAnyPermission,
    getPermissions,

    // Role checking
    isUser,
    hasAllRoles,
    getRoles,
    isAdmin,
    isModerator,
    isSuperUser,

    // Resource access
    canAccess,
    canCreate,
    canRead,
    canUpdate,
    canDelete,

    // Common permission checks
    canManageUsers,
    canViewReports,
    canAddUsers,
  };
};
