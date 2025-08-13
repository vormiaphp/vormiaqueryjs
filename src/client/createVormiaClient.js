/* global process */

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
      const fullUrl = config.url
        ? new URL(config.url, config.baseURL || baseConfig.baseURL).toString()
        : "";
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
          throw new Error(
            JSON.stringify({
              message: responseData.message || "Request failed",
              status: response.status,
              response: {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: {},
              },
            })
          );
        }

        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config,
        };
      } catch (error) {
        let errorData;
        try {
          errorData = JSON.parse(error.message);
        } catch {
          errorData = {
            message: error.message,
            status: 0,
            response: {
              data: { message: error.message },
              status: 0,
              statusText: "",
              headers: {},
            },
          };
        }

        const errorObj = new Error(errorData.message);
        errorObj.status = errorData.status;
        errorObj.response = errorData.response;
        throw errorObj;
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
