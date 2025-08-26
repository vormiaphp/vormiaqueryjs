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
import { useAuthStore } from "../stores/useAuthStore.js";
import { useCacheStore } from "../stores/useCacheStore.js";
import { useStorageStore } from "../stores/useStorageStore.js";

/**
 * Enhanced authentication hook with Zustand integration
 * Provides comprehensive user management, permissions, and role checking
 * @returns {Object} Enhanced authentication and authorization utilities
 */
export const useVrmAuthEnhanced = () => {
  const client = getGlobalVormiaClient();

  // Get auth state from Zustand store
  const {
    token,
    refreshToken,
    user,
    isAuthenticated,
    isLoading,
    permissions,
    roles,
    setToken,
    setUser,
    login: storeLogin,
    logout: storeLogout,
    hasPermission,
    hasRole,
    isTokenExpired,
    shouldRefreshToken,
  } = useAuthStore();

  // Get cache and storage stores
  const { setCache, getCache, invalidateCache } = useCacheStore();
  const { setUserPreference, getUserPreference, setFormData, getFormData } =
    useStorageStore();

  // Enhanced login function
  const login = async (credentials, options = {}) => {
    const {
      endpoint = "/api/auth/login",
      storeUserData = true,
      cacheUserData = true,
      rememberMe = false,
      onSuccess,
      onError,
    } = options;

    try {
      const response = await client.post(endpoint, credentials);

      if (response.data?.token) {
        const {
          token,
          user: userData,
          refreshToken: refresh,
          expiresIn,
        } = response.data;

        // Calculate token expiry
        const expiry = expiresIn ? Date.now() + expiresIn * 1000 : null;

        // Store in Zustand store
        storeLogin(token, userData, refresh, expiry);

        // Cache user data if enabled
        if (cacheUserData && userData) {
          setCache(`user:${userData.id || "current"}`, userData, {
            ttl: 3600000, // 1 hour
            priority: "high",
            tags: ["user", "auth"],
          });
        }

        // Store user preferences if enabled
        if (storeUserData && userData?.preferences) {
          Object.entries(userData.preferences).forEach(([key, value]) => {
            setUserPreference(key, value);
          });
        }

        // Store form data for remember me
        if (rememberMe && credentials) {
          setFormData("login_credentials", credentials);
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      }

      throw new Error("No token received from login");
    } catch (error) {
      // Call error callback
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

  // Enhanced logout function
  const logout = async (options = {}) => {
    const {
      endpoint = "/api/auth/logout",
      clearCache = true,
      clearStorage = true,
      onSuccess,
      onError,
    } = options;

    try {
      // Call logout endpoint if specified
      if (endpoint) {
        await client.post(endpoint);
      }

      // Clear Zustand store
      storeLogout();

      // Clear cache if enabled
      if (clearCache) {
        invalidateCache("user");
        invalidateCache("auth");
      }

      // Clear storage if enabled
      if (clearStorage) {
        // Clear sensitive user data
        setFormData("login_credentials", null);
        setUserPreference("lastLogin", null);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Even if logout fails, clear local state
      storeLogout();

      // Call error callback
      if (onError) {
        onError(error);
      }

      // Don't throw error for logout failures
      console.warn("Logout failed but local state cleared:", error);
    }
  };

  // Token refresh function
  const refreshAuthToken = async () => {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await client.post("/api/auth/refresh", {
        refresh_token: refreshToken,
      });

      if (response.data?.token) {
        const { token: newToken, expiresIn } = response.data;
        const expiry = expiresIn ? Date.now() + expiresIn * 1000 : null;

        setToken(newToken, refreshToken, expiry);
        return newToken;
      }

      throw new Error("Token refresh failed");
    } catch (error) {
      // If refresh fails, logout user
      logout({ endpoint: null });
      throw error;
    }
  };

  // Auto-refresh token if needed
  const ensureValidToken = async () => {
    if (shouldRefreshToken()) {
      try {
        await refreshAuthToken();
      } catch (error) {
        // If refresh fails, logout user
        logout({ endpoint: null });
        throw error;
      }
    }
    return token;
  };

  // Enhanced user data management
  const updateUser = async (userData, options = {}) => {
    const {
      endpoint = "/api/auth/profile",
      updateStore = true,
      updateCache = true,
      onSuccess,
      onError,
    } = options;

    try {
      const response = await client.put(endpoint, userData);

      if (response.data?.user) {
        const updatedUser = response.data.user;

        // Update Zustand store
        if (updateStore) {
          setUser(updatedUser);
        }

        // Update cache
        if (updateCache) {
          setCache(`user:${updatedUser.id || "current"}`, updatedUser, {
            ttl: 3600000,
            priority: "high",
            tags: ["user", "auth"],
          });
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(updatedUser);
        }

        return updatedUser;
      }

      throw new Error("Failed to update user");
    } catch (error) {
      // Call error callback
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

  // Enhanced permission checking with caching
  const checkPermission = (permission, options = {}) => {
    const { useCache = true, cacheKey = `perm:${permission}` } = options;

    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const result = hasPermission(permission);

    if (useCache) {
      setCache(cacheKey, result, {
        ttl: 300000, // 5 minutes
        priority: "normal",
        tags: ["permissions"],
      });
    }

    return result;
  };

  // Enhanced role checking with caching
  const checkRole = (role, options = {}) => {
    const { useCache = true, cacheKey = `role:${role}` } = options;

    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const result = hasRole(role);

    if (useCache) {
      setCache(cacheKey, result, {
        ttl: 300000, // 5 minutes
        priority: "normal",
        tags: ["roles"],
      });
    }

    return result;
  };

  // User preferences management
  const setUserPreference = (key, value) => {
    useStorageStore.getState().setUserPreference(key, value);
  };

  const getUserPreference = (key, defaultValue = null) => {
    return useStorageStore.getState().getUserPreference(key, defaultValue);
  };

  // Form data persistence
  const saveFormData = (formId, data) => {
    setFormData(formId, data);
  };

  const loadFormData = (formId) => {
    return getFormData(formId);
  };

  // Session management
  const getSessionInfo = () => {
    return {
      isAuthenticated,
      token: token ? "***" + token.slice(-4) : null,
      user: user
        ? { ...user, email: user.email ? "***" + user.email.slice(-4) : null }
        : null,
      permissions: permissions.length,
      roles: roles.length,
      tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
      isTokenExpired: isTokenExpired(),
    };
  };

  // Return enhanced auth interface
  return {
    // Basic auth state
    isAuthenticated,
    isLoading,
    user,
    token,

    // Auth methods
    login,
    logout,
    refreshAuthToken,
    ensureValidToken,
    updateUser,

    // Permission and role checking
    hasPermission: checkPermission,
    hasRole: checkRole,
    permissions,
    roles,

    // Enhanced utilities
    setUserPreference,
    getUserPreference,
    saveFormData,
    loadFormData,
    getSessionInfo,

    // Token utilities
    isTokenExpired,
    shouldRefreshToken,

    // Store methods (for advanced usage)
    setToken,
    setUser,

    // Legacy compatibility
    isAuthenticated: () => isAuthenticated,
    getUser: () => user,
    setUser: (userData) => setUser(userData),
    clearUser: () => storeLogout(),
  };
};

export default useVrmAuthEnhanced;
