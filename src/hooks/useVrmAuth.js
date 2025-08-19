import { useQuery, useMutation } from "@tanstack/react-query";
import { getGlobalVormiaClient } from "../client/createVormiaClient";
import {
  transformFormData,
  mergeFormdataConfig,
} from "../utils/formDataTransformer.js";
import {
  handleApiError,
  handleFieldErrors,
  handleGeneralError,
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
      if (storeToken && response.data?.token) {
        client.setAuthToken(response.data.token);
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
 * Hook for authentication mutations (login, register, etc.)
 * @param {Object} options - Mutation options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='POST'] - HTTP method
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {boolean} [options.storeToken=true] - Whether to store the auth token
 * @param {Function} [options.onLoginSuccess] - Callback on successful login
 * @param {Object} [options.formdata] - Form data transformation configuration
 * @param {boolean} [options.manualTransformation=false] - Whether to use manual transformation
 * @param {Object} [options.enableNotifications] - Notification configuration
 * @param {boolean} [options.showDebug] - Whether to show debug panel
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Mutation result and auth utilities
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
    onSuccess,
    onError,
    formdata,
    manualTransformation = false,
    enableNotifications,
    showDebug,
    ...mutationOptions
  } = options;

  // Get global configuration
  const globalConfig =
    typeof window !== "undefined" ? window.__VORMIA_CONFIG__ : {};

  // Determine if debug should be shown
  const shouldShowDebugPanel =
    showDebug !== undefined ? showDebug : shouldShowDebug();

  const mutation = useMutation({
    mutationFn: async (variables) => {
      try {
        let requestData = variables;

        // Handle form data transformation unless manual transformation is requested
        if (!manualTransformation && formdata) {
          // Merge global and local formdata configurations
          const mergedFormdata = mergeFormdataConfig(
            globalConfig.defaultFormdata,
            formdata
          );
          requestData = transformFormData(variables, mergedFormdata);
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
        if (storeToken && response.data?.token) {
          client.setAuthToken(response.data.token);
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
          : new Error("Authentication failed");
      }
    },
    onSuccess: (data, variables, context) => {
      // Log success for debugging
      if (shouldShowDebugPanel) {
        logSuccessForDebug(data, "Mutation Success");
      }

      // Show success notification if enabled
      const notificationConfig =
        enableNotifications || globalConfig.enableNotifications;
      if (notificationConfig?.toast || notificationConfig?.panel) {
        const message =
          data?.data?.message || "Operation completed successfully";
        if (notificationConfig.toast) {
          showSuccessNotification(message, "Success");
        }
      }

      // Call original onSuccess callback
      if (onSuccess) {
        onSuccess(data, variables, context);
      }

      if (onLoginSuccess && data.data?.token) {
        onLoginSuccess(data);
      }
    },
    onError: (error, variables, context) => {
      // Get clean error info
      const errorInfo = handleApiError(error);

      // Log for debugging
      if (shouldShowDebugPanel) {
        logErrorForDebug(error, "Mutation Error");
      }

      // Show error notification if enabled
      const notificationConfig =
        enableNotifications || globalConfig.enableNotifications;
      if (notificationConfig?.toast || notificationConfig?.panel) {
        const message =
          error.response?.message ||
          error.response?.response?.data?.message ||
          "An error occurred. Please try again.";
        if (notificationConfig.toast) {
          showErrorNotification(message, "Error");
        }
      }

      // Call original onError callback
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });

  // Login helper
  const login = async (credentials) => {
    return mutation.mutateAsync(credentials);
  };

  // Logout helper
  const logout = () => {
    client.removeAuthToken();
  };

  // Check if user is authenticated
  const isAuthenticated = !!client.getAuthToken();

  // Enhanced return object with additional utilities
  return {
    ...mutation,
    login,
    logout,
    isAuthenticated,

    // Form data transformation utilities
    transformFormData: (data) => {
      if (!manualTransformation && formdata) {
        const mergedFormdata = mergeFormdataConfig(
          globalConfig.defaultFormdata,
          formdata
        );
        return transformFormData(data, mergedFormdata);
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
    getDebugHtml: (response, isSuccess = true) => {
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
