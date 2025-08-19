import { useQuery } from "@tanstack/react-query";
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
 * Basic VormiaQuery hook (no authentication required)
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.params] - Query parameters
 * @param {Object} [options.data] - Request body
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {Object} [options.enableNotifications] - Notification configuration
 * @param {boolean} [options.showDebug] - Whether to show debug panel
 * @param {Object} [options.retry] - Retry configuration
 * @param {number} [options.cacheTime] - Cache time in milliseconds
 * @param {number} [options.staleTime] - Stale time in milliseconds
 * @returns {Object} Query result with additional utilities
 */
export const useVormiaQuery = (options) => {
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = "GET",
    params,
    data,
    headers = {},
    transform,
    enableNotifications,
    showDebug,
    retry = 3,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
    ...queryOptions
  } = options;

  // Get global configuration
  const globalConfig =
    typeof window !== "undefined" ? window.__VORMIA_CONFIG__ : {};

  // Determine if debug should be shown
  const shouldShowDebugPanel =
    showDebug !== undefined ? showDebug : shouldShowDebug();

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

      if (transform && typeof transform === "function") {
        return {
          ...response,
          data: transform(response.data),
        };
      }

      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Query failed");
    }
  };

  const query = useQuery({
    queryKey,
    queryFn,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error.status >= 400 && error.status < 500) return false;
      return failureCount < retry;
    },
    cacheTime,
    staleTime,
    ...queryOptions,
  });

  // Enhanced return object with additional utilities
  return {
    ...query,

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
    logForDebug: (response, label = "Query Response") => {
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
