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
 * Basic query hook (no authentication required)
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.params] - Query parameters
 * @param {Object} [options.data] - Request body
 * @param {Object} [options.headers] - Custom headers
 * @param {boolean} [options.showDebug] - Override debug panel visibility
 * @returns {Object} Query result with enhanced utilities
 */
export function useVormiaQuery({
  endpoint,
  method = "GET",
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

  const { params, data, headers = {}, ...queryOptions } = options;

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
      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Query failed");
    }
  };

  const query = useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
  });

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
      showSuccessNotification(message, title);
    },

    // Show error notification
    showErrorNotification: (message, title = "Error") => {
      showErrorNotification(message, title);
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
}
