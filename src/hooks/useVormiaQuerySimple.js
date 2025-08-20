import { useMutation } from "@tanstack/react-query";
import { getGlobalVormiaClient } from "../client/createVormiaClient";
import {
  logErrorForDebug,
  logSuccessForDebug,
  getDebugConfig,
} from "../utils/enhancedErrorHandler.js";
import {
  showSuccessNotification,
  showErrorNotification,
  createNotificationHtml,
} from "../components/NotificationPanel.jsx";
import {
  createErrorDebugHtml,
  createDebugInfo,
} from "../components/ErrorDebugPanel.jsx";

/**
 * Simple query hook for testing and flexible API calls
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='POST'] - HTTP method
 * @param {Object} [options.headers] - Custom headers
 * @param {boolean} [options.showDebug] - Override debug panel visibility
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Mutation result with enhanced utilities
 */
export function useVormiaQuerySimple({
  endpoint,
  method = "POST",
  showDebug = null,
  onSuccess,
  onError,
  ...options
}) {
  // Get debug configuration
  const debugConfig = getDebugConfig();
  const shouldShowDebug = showDebug !== null ? showDebug : debugConfig.enabled;
  const shouldShowDebugPanel = shouldShowDebug;

  const client = getGlobalVormiaClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const config = {
          method,
          url: endpoint,
          data,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
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
      showSuccessNotification(
        data?.data?.message || "Operation completed successfully",
        "Success"
      );

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
      showErrorNotification(
        error.response?.message ||
          error.response?.response?.data?.message ||
          "An error occurred. Please try again.",
        "Error"
      );

      // Call custom error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...options,
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
    getDebugHtml: (response) => {
      if (!shouldShowDebugPanel) return "";
      const debugInfo = createDebugInfo(response);
      return createErrorDebugHtml(debugInfo);
    },

    // Show success notification
    showSuccessNotification: (message, title = "Success") => {
      showSuccessNotification(message, title);
    },

    // Show error notification
    showErrorNotification: (message, title = "Error") => {
      showErrorNotification(message, title);
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
}
