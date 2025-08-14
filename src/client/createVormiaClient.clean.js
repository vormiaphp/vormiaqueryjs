import { VormiaError } from './utils/VormiaError';

// Default sensitive keys that should be filtered from responses in error/debug
const DEFAULT_SENSITIVE_KEYS = [
  'access_token',
  'token',
  'token_type',
  'verification_token',
  'password',
  'password_confirmation',
  'api_key',
  'secret',
  'private_key',
  'authorization',
];

/**
 * Deeply filters an object to remove sensitive keys
 * @param {Object} obj - The object to filter
 * @param {Array<string>} sensitiveKeys - Keys to filter out
 * @returns {Object} Filtered object
 */
const filterSensitiveData = (obj, sensitiveKeys = []) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => filterSensitiveData(item, sensitiveKeys));
  }
  
  // Handle objects
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Skip sensitive keys
    if (sensitiveKeys.includes(key)) {
      return acc;
    }
    
    // Recursively filter object values
    if (value && typeof value === 'object') {
      acc[key] = filterSensitiveData(value, sensitiveKeys);
    } else {
      acc[key] = value;
    }
    
    return acc;
  }, {});
};

// Helper function to convert headers to HeadersInit
const toHeadersInit = (headers) => {
  const result = {};
  if (!headers) return result;

  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = value.join(",");
    } else if (value !== undefined) {
      result[key] = value;
    }
  });

  return result;
};

// Create a simple HTTP client that matches our VormiaInstance interface
const createHttpClient = (baseConfig) => {
  const client = {
    request: async (config) => {
      // Fix URL construction to properly handle baseURL with existing path
      let fullUrl;
      if (config.url) {
        if (config.url.startsWith('http')) {
          // Absolute URL, use as is
          fullUrl = config.url;
        } else {
          // Relative URL, concatenate with baseURL
          const baseURL = config.baseURL || baseConfig.baseURL;
          if (baseURL.endsWith('/') && config.url.startsWith('/')) {
            // Remove trailing slash from baseURL to avoid double slashes
            fullUrl = baseURL.slice(0, -1) + config.url;
          } else if (!baseURL.endsWith('/') && !config.url.startsWith('/')) {
            // Add slash between baseURL and url
            fullUrl = baseURL + '/' + config.url;
          } else {
            // One of them already has a slash, just concatenate
            fullUrl = baseURL + config.url;
          }
        }
      } else {
        fullUrl = "";
      }
      
      const headers = toHeadersInit({
        "Content-Type": "application/json",
        Accept: "application/json",
        ...baseConfig.headers,
        ...config.headers,
      });

      try {
        const response = await fetch(fullUrl, {
          method: config.method || "GET",
          headers,
          body: config.data ? JSON.stringify(config.data) : undefined,
          credentials:
            config.withCredentials || baseConfig.withCredentials
              ? "include"
              : "same-origin",
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          throw new VormiaError({
            message: 'Invalid JSON response from server',
            code: 'INVALID_JSON',
            status: response.status
          });
        }

        // Process successful response
        if (response.ok) {
          // Return a clean response with direct access to data
          const result = {
            ...responseData,
            // Direct access to data for convenience
            ...(responseData.data ? { ...responseData.data } : {})
          };
          
          // Add debug info if enabled
          if (baseConfig.includeDebugInfo && responseData.debug) {
            result.debug = responseData.debug;
          }
          
          return {
            data: result,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            config,
            originalData: responseData // Keep original data structure
          };
        }
        
        // Handle error response
        // Prepare error data with sensitive information filtered out
        const errorData = {
          message: responseData.message || `Request failed with status ${response.status}`,
          status: response.status,
          response: {
            data: baseConfig.filterSensitiveData 
              ? filterSensitiveData(responseData, baseConfig.sensitiveKeys)
              : responseData,
            status: response.status,
            statusText: response.statusText,
            headers: {},
          },
          debug: baseConfig.includeDebugInfo && responseData.debug
            ? {
                ...responseData.debug,
                // Filter sensitive data from debug info
                ...(responseData.debug.trace && {
                  trace: responseData.debug.trace.map(trace => ({
                    ...trace,
                    // Filter sensitive data from file paths
                    file: trace.file ? 
                      trace.file.replace(/\/(?:[^\/]*\/)*([^\/]+\/)/g, '***/') : 
                      trace.file
                  }))
                })
              }
            : undefined
        };
        
        throw new VormiaError(errorData);
      } catch (error) {
        // If it's already a VormiaError, just rethrow it
        if (error instanceof VormiaError) {
          throw error;
        }
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          throw new VormiaError({
            message: 'Network error: Unable to connect to the server',
            code: 'NETWORK_ERROR',
            status: 0
          });
        }
        
        // For other errors, wrap them in a VormiaError
        throw new VormiaError({
          message: error.message || 'An unknown error occurred',
          code: error.code || 'UNKNOWN_ERROR',
          status: error.status || 0,
          response: error.response,
          stack: error.stack
        });
      }
    },
  };

  // Add HTTP methods
  const methods = ["get", "delete", "head", "options"];
  methods.forEach((method) => {
    client[method] = (url, config = {}) =>
      client.request({ ...config, method: method.toUpperCase(), url });
  });

  const methodsWithData = ["post", "put", "patch"];
  methodsWithData.forEach((method) => {
    client[method] = (url, data, config = {}) =>
      client.request({
        ...config,
        method: method.toUpperCase(),
        url,
        data,
      });
  });

  return client;
};

class VormiaClient {
  constructor(config) {
    const isProduction = typeof process !== 'undefined' && 
                        process.env && 
                        process.env.NODE_ENV === 'production';

    this.config = {
      authTokenKey: "auth_token",
      withCredentials: false,
      timeout: 30000,
      // Sensitive keys to filter from debug/error responses
      sensitiveKeys: [...DEFAULT_SENSITIVE_KEYS],
      // Whether to filter sensitive data from debug/error responses
      filterSensitiveData: true,
      // Whether to include debug info in responses
      includeDebugInfo: !isProduction,
      ...config,
    };
    
    // Merge any additional sensitive keys
    if (config?.sensitiveKeys) {
      this.config.sensitiveKeys = [
        ...new Set([...DEFAULT_SENSITIVE_KEYS, ...config.sensitiveKeys])
      ];
    }

    this.http = createHttpClient({
      baseURL: this.config.baseURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...this.config.headers,
      },
      withCredentials: this.config.withCredentials,
      timeout: this.config.timeout,
      sensitiveKeys: this.config.sensitiveKeys,
      filterSensitiveData: this.config.filterSensitiveData,
      includeDebugInfo: this.config.includeDebugInfo
    });
  }

  // Simplified interceptor-like functionality
  handleRequest(config) {
    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  }

  handleUnauthorized() {
    this.removeAuthToken();
    // You might want to add a global event or callback here
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vormia:unauthorized'));
    }
  }

  getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.config.authTokenKey);
  }

  setAuthToken(token) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.config.authTokenKey, token);
  }

  removeAuthToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.config.authTokenKey);
  }

  // Main request method
  async request(config) {
    try {
      const processedConfig = this.handleRequest(config);
      const response = await this.http.request(processedConfig);
      return response;
    } catch (error) {
      if (error.status === 401) {
        this.handleUnauthorized();
      }
      throw error;
    }
  }

  // HTTP methods
  get(url, config) {
    return this.request({ ...config, method: 'GET', url });
  }

  post(url, data, config) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  put(url, data, config) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  patch(url, data, config) {
    return this.request({ ...config, method: 'PATCH', url, data });
  }

  delete(url, config) {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

// Create and export the client factory function
const createVormiaClient = (config) => {
  return new VormiaClient(config);
};

// Global client instance
let globalClient = null;

const setGlobalVormiaClient = (client) => {
  globalClient = client;
};

const getGlobalVormiaClient = () => {
  if (!globalClient) {
    throw new Error('Global Vormia client has not been initialized. Call setGlobalVormiaClient() first.');
  }
  return globalClient;
};

export { VormiaClient, createVormiaClient, setGlobalVormiaClient, getGlobalVormiaClient };
