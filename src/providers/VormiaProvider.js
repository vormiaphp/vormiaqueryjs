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
 * @param {string} [props.config.publicKey] - Public key for encryption (optional)
 * @param {string} [props.config.privateKey] - Private key for encryption (optional)
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
 *     <VormiaProvider config={{ baseURL: 'https://api.example.com' }}>
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
      console.log("VormiaProvider: Client initialized successfully");
    } catch (error) {
      console.error("VormiaProvider: Failed to initialize client:", error);
    }
  }, [config]);

  return children;
};

export default VormiaProvider;
