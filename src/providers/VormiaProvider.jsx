import React, { useEffect } from "react";
import {
  createVormiaClient,
  setGlobalVormiaClient,
} from "../client/createVormiaClient.js";

/**
 * VormiaProvider - A React provider component for VormiaQueryJS
 * Automatically initializes the VormiaClient and makes it available globally
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.config - Configuration object for VormiaClient
 * @param {string} props.config.baseURL - Base URL for API requests
 * @param {Object} [props.config.defaultFormdata] - Default form data transformation configuration
 * @param {Object} [props.config.enableNotifications] - Notification system configuration
 * @param {boolean} [props.config.enableDebugPanel] - Whether to enable debug panel
 * @param {string} [props.config.debugEnvVar] - Environment variable name for debug mode
 * @param {number} [props.config.notificationDuration] - Default notification duration
 * @param {number} [props.config.timeout] - Request timeout in milliseconds (optional)
 * @param {boolean} [props.config.withCredentials] - Whether to include credentials (optional)
 * @param {string} [props.config.authTokenKey] - Key for storing auth token (optional)
 *
 * @example
 * ```jsx
 * import { VormiaProvider } from 'vormiaqueryjs';
 *
 * function App() {
 *   return (
 *     <VormiaProvider config={{ 
 *       baseURL: 'https://api.example.com',
 *       defaultFormdata: {
 *         confirmPassword: "password_confirmation",
 *         add: { terms: true },
 *         remove: ["confirmPassword"]
 *       },
 *       enableNotifications: { toast: true, panel: true },
 *       enableDebugPanel: true,
 *       debugEnvVar: "VITE_VORMIA_DEBUG"
 *     }}>
 *       <YourApp />
 *     </VormiaProvider>
 *   );
 * }
 * ```
 */
export const VormiaProvider = ({ children, config }) => {
  useEffect(() => {
    if (!config || !config.baseURL) {
      console.warn("VormiaProvider: baseURL is required in config");
      return;
    }

    try {
      const client = createVormiaClient(config);
      setGlobalVormiaClient(client);
      
      // Store global configuration for hooks to access
      if (typeof window !== 'undefined') {
        window.__VORMIA_CONFIG__ = {
          baseURL: config.baseURL,
          defaultFormdata: config.defaultFormdata || {
            rename: {
              confirmPassword: "password_confirmation"
            },
            add: {
              terms: true
            },
            remove: ["confirmPassword"]
          },
          enableNotifications: config.enableNotifications || {
            toast: true,
            panel: true
          },
          enableDebugPanel: config.enableDebugPanel !== false,
          debugEnvVar: config.debugEnvVar || "VITE_VORMIA_DEBUG",
          notificationDuration: config.notificationDuration || 5000,
          timeout: config.timeout,
          withCredentials: config.withCredentials,
          authTokenKey: config.authTokenKey
        };
      }
      
      console.log("VormiaProvider: Client initialized successfully with configuration:", window.__VORMIA_CONFIG__);
    } catch (error) {
      console.error("VormiaProvider: Failed to initialize client:", error);
    }
  }, [config]);

  return children;
};

export default VormiaProvider;
