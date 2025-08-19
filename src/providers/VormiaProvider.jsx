import React, { useEffect, useState } from "react";
import { createVormiaClient, setGlobalVormiaClient } from "../client/createVormiaClient";

/**
 * VormiaProvider - Simple configuration provider for VormiaQueryJS
 * Only handles essential configuration like baseURL
 * Feature flags are controlled by environment variables
 */
export const VormiaProvider = ({ children, config }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Create and set global client
      const client = createVormiaClient({
        baseURL: config.baseURL,
        timeout: config.timeout || 30000,
        withCredentials: config.withCredentials || false,
        authTokenKey: config.authTokenKey || "vormia_auth_token",
      });

      setGlobalVormiaClient(client);

      // Store minimal configuration for hooks to access
      if (typeof window !== "undefined") {
        window.__VORMIA_CONFIG__ = {
          baseURL: config.baseURL,
          timeout: config.timeout || 30000,
          withCredentials: config.withCredentials || false,
          authTokenKey: config.authTokenKey || "vormia_auth_token",
        };
      }

      console.log("VormiaProvider: Client initialized successfully with baseURL:", config.baseURL);
      setIsInitialized(true);
    } catch (err) {
      console.error("VormiaProvider: Failed to initialize client:", err);
      setError(err.message);
    }
  }, [config]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold">VormiaQuery Initialization Failed</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-800 text-sm">Initializing VormiaQuery...</p>
      </div>
    );
  }

  return children;
};
