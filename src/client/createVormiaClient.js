import { VormiaError } from './utils/VormiaError';

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

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
          // Create a VormiaError with detailed information
          const errorData = {
            message: responseData.message || `Request failed with status ${response.status}`,
            status: response.status,
            response: {
              data: responseData,
              status: response.status,
              statusText: response.statusText,
              headers: {},
            },
            debug: responseData.debug
          };
          
          throw new VormiaError(errorData);
        }

        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config,
        };
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
        
        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
          throw new VormiaError({
            message: 'Invalid JSON response from server',
            code: 'INVALID_JSON',
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
    this.config = {
      authTokenKey: "auth_token",
      withCredentials: false,
      timeout: 30000,

      ...config,
    };

    this.http = createHttpClient({
      baseURL: this.config.baseURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...this.config.headers,
      },
      withCredentials: this.config.withCredentials,
      timeout: this.config.timeout,
    });
  }

  // Simplified interceptor-like functionality
  async handleRequest(config) {
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
    if (this.config.onUnauthenticated) {
      this.config.onUnauthenticated();
    }
  }

  getAuthToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.config.authTokenKey);
    }
    return null;
  }

  setAuthToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.config.authTokenKey, token);
    }
  }

  removeAuthToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.config.authTokenKey);
    }
  }

  async request(config) {
    try {
      const processedConfig = await this.handleRequest({
        ...config,
        headers: {
          ...this.config.headers,
          ...config.headers,
        },
      });

      const response = await this.http.request(processedConfig);
      return response;
    } catch (error) {
      if (error.status === 401) {
        this.handleUnauthorized();
      }
      throw error;
    }
  }

  get(url, config) {
    return this.request({ ...config, method: "GET", url });
  }

  post(url, data, config) {
    return this.request({ ...config, method: "POST", url, data });
  }

  put(url, data, config) {
    return this.request({ ...config, method: "PUT", url, data });
  }

  patch(url, data, config) {
    return this.request({ ...config, method: "PATCH", url, data });
  }

  delete(url, config) {
    return this.request({ ...config, method: "DELETE", url });
  }
}

// Create and export the client factory function
export function createVormiaClient(config) {
  return new VormiaClient(config);
}

// Global client instance
let globalClient = null;

export function setGlobalVormiaClient(client) {
  globalClient = client;
}

export function getGlobalVormiaClient() {
  if (!globalClient) {
    throw new Error(
      "Vormia client not initialized. Call createVormiaClient first."
    );
  }
  return globalClient;
}

export { VormiaClient };
