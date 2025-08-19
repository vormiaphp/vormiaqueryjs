import { useMutation } from "@tanstack/react-query";
import { getGlobalVormiaClient } from "../client/createVormiaClient";
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
 * Simple VormiaQuery hook for testing and maximum flexibility
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} options.method - HTTP method (GET, POST, PATCH, PUT, DELETE)
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {Object} [options.enableNotifications] - Notification configuration
 * @param {boolean} [options.showDebug] - Whether to show debug panel
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Mutation result with additional utilities
 */
export const useVormiaQuerySimple = (options) => {
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method,
    headers = {},
    transform,
    enableNotifications,
    showDebug,
    onSuccess,
    onError,
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
        const config = {
          method: method.toUpperCase(),
          url: endpoint,
          params: method.toUpperCase() === "GET" ? variables : undefined,
          data: method.toUpperCase() !== "GET" ? variables : undefined,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        };

        const response = await client.request(config);

        if (transform && typeof transform === "function") {
          return {
            ...response,
            data: transform(response.data),
          };
        }

        return response;
      } catch (error) {
        throw error instanceof Error ? error : new Error("Request failed");
      }
    },
    onSuccess: (data, variables, context) => {
      // Log success for debugging
      if (shouldShowDebugPanel) {
        logSuccessForDebug(data, "Simple Query Success");
      }

      // Show success notification if enabled
      const notificationConfig =
        enableNotifications || globalConfig.enableNotifications;
      if (notificationConfig?.toast) {
        const message =
          data?.data?.message || "Operation completed successfully";
        showSuccessNotification(message, "Success");
      }

      // Call original onSuccess callback
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Log for debugging
      if (shouldShowDebugPanel) {
        logErrorForDebug(error, "Simple Query Error");
      }

      // Show error notification if enabled
      const notificationConfig =
        enableNotifications || globalConfig.enableNotifications;
      if (notificationConfig?.toast) {
        const message =
          error.response?.message ||
          error.response?.response?.data?.message ||
          "An error occurred. Please try again.";
        showErrorNotification(message, "Error");
      }

      // Call original onError callback
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });

  // Enhanced return object with additional utilities
  return {
    ...mutation,

    // Execute the query
    execute: (data = null) => {
      return mutation.mutate(data);
    },

    // Execute the query asynchronously
    executeAsync: (data = null) => {
      return mutation.mutateAsync(data);
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

    // Show success notification
    showSuccessNotification: (message, title = "Success") => {
      const notificationConfig =
        enableNotifications || globalConfig.enableNotifications;
      if (notificationConfig?.toast) {
        showSuccessNotification(message, title);
      }
    },

    // Show error notification
    showErrorNotification: (message, title = "Error") => {
      const notificationConfig =
        enableNotifications || globalConfig.enableNotifications;
      if (notificationConfig?.toast) {
        showErrorNotification(message, title);
      }
    },

    // Log for debugging
    logForDebug: (response, label = "Simple Query Response") => {
      if (shouldShowDebugPanel) {
        if (response.error) {
          logErrorForDebug(response.error, label);
        } else {
          logSuccessForDebug(response, label);
        }
      }
    },
  };
};
