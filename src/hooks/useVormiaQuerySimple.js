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
 * Simple query hook for testing and flexible API calls
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='POST'] - HTTP method
 * @param {Object} [options.headers] - Custom headers
 * @param {Object} [options.enableNotifications] - Override notification settings
 * @param {boolean} [options.showDebug] - Override debug panel visibility
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Mutation result with enhanced utilities
 */
export const useVormiaQuerySimple = (options) => {
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = "POST",
    headers = {},
    enableNotifications,
    showDebug,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  // Determine if debug should be shown (respects VITE_VORMIA_DEBUG)
  const shouldShowDebugPanel = showDebug !== undefined ? showDebug : shouldShowDebug();

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const config = {
          method,
          url: endpoint,
          data,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        };

        const response = await client.request(config);
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
      if (enableNotifications?.toast !== false) {
        const message = data?.data?.message || "Operation completed successfully";
        showSuccessNotification(message, "Success");
      }

      // Call custom success handler
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
      if (enableNotifications?.toast !== false) {
        const message = error.response?.message || error.response?.response?.data?.message || "An error occurred. Please try again.";
        showErrorNotification(message, "Error");
      }

      // Call custom error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });

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
      if (enableNotifications?.toast !== false) {
        showSuccessNotification(message, title);
      }
    },

    // Show error notification
    showErrorNotification: (message, title = "Error") => {
      if (enableNotifications?.toast !== false) {
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
