import { useEffect } from "react";
import {
  createVormiaClient,
  setGlobalVormiaClient,
} from "../client/createVormiaClient.js";

/**
 * useVormiaConfig - A React hook for dynamic VormiaClient configuration
 * Useful when you need to change configuration at runtime or prefer hooks over providers
 *
 * @param {Object} config - Configuration object for VormiaClient
 * @param {string} config.baseURL - Base URL for API requests
 * @param {string} [config.publicKey] - Public key for encryption (optional)
 * @param {string} [config.privateKey] - Private key for encryption (optional)
 * @param {number} [config.timeout] - Request timeout in milliseconds (optional)
 * @param {boolean} [config.withCredentials] - Whether to include credentials (optional)
 * @param {string} [config.authTokenKey] - Key for storing auth token (optional)
 *
 * @example
 * ```jsx
 * import { useVormiaConfig } from 'vormiaqueryjs';
 *
 * function App() {
 *   const [apiUrl, setApiUrl] = useState('https://api.example.com');
 *
 *   useVormiaConfig({ baseURL: apiUrl });
 *
 *   return (
 *     <div>
 *       <button onClick={() => setApiUrl('https://api2.example.com')}>
 *         Switch API
 *       </button>
 *       <YourApp />
 *     </div>
 *   );
 * }
 * ```
 */
export const useVormiaConfig = (config) => {
  useEffect(() => {
    if (!config || !config.baseURL) {
      console.warn("useVormiaConfig: baseURL is required in config");
      return;
    }

    try {
      const client = createVormiaClient(config);
      setGlobalVormiaClient(client);
      console.log("useVormiaConfig: Client initialized successfully");
    } catch (error) {
      console.error("useVormiaConfig: Failed to initialize client:", error);
    }
  }, [config]);
};

export default useVormiaConfig;
