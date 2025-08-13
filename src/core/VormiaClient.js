import axios from "axios";

// Environment variable fallbacks (browser-compatible)
const DEFAULT_CONFIG = {
  VORMIA_API_URL: import.meta.env.VITE_VORMIA_API_URL || "",
  VORMIA_AUTH_TOKEN_KEY:
    import.meta.env.VITE_VORMIA_AUTH_TOKEN_KEY || "auth_token",
  VORMIA_TIMEOUT: import.meta.env.VITE_VORMIA_TIMEOUT
    ? parseInt(import.meta.env.VITE_VORMIA_TIMEOUT, 10)
    : 30000,
  VORMIA_WITH_CREDENTIALS:
    import.meta.env.VITE_VORMIA_WITH_CREDENTIALS === "true" || false,
};

export class VormiaError extends Error {
  constructor(message, status, response, code) {
    super(message);
    this.name = "VormiaError";
    this.status = status;
    this.response = response;
    this.code = code;
  }
}

export class VormiaClient {
  constructor(config = {}) {
    // Start with default config from environment variables
    const defaultConfig = {
      baseURL: DEFAULT_CONFIG.VORMIA_API_URL || "",
      authTokenKey: DEFAULT_CONFIG.VORMIA_AUTH_TOKEN_KEY,
      withCredentials: DEFAULT_CONFIG.VORMIA_WITH_CREDENTIALS,
      timeout: DEFAULT_CONFIG.VORMIA_TIMEOUT,
    };

    // Merge with user-provided config (user config takes precedence)
    this.config = { ...defaultConfig, ...config };

    // Validate required configuration
    if (!this.config.baseURL) {
      console.warn(
        "VormiaClient: No baseURL provided. Please set VORMIA_API_URL in your .env file or pass baseURL in the config."
      );
    }

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        ...this.config.headers,
      },
      withCredentials: this.config.withCredentials,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Handle unauthorized
          if (this.config.onUnauthenticated) {
            this.config.onUnauthenticated();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Core HTTP methods
  async request(config) {
    try {
      const response = await this.axiosInstance.request(config);
      return response;
    } catch (error) {
      const status = error.response?.status;
      const response = error.response?.data;
      const message = error.message || "Request failed";
      throw new VormiaError(message, status, response, error.code);
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

  delete(url, config) {
    return this.request({ ...config, method: "DELETE", url });
  }

  patch(url, data, config) {
    return this.request({ ...config, method: "PATCH", url, data });
  }

  // Auth methods
  setAuthToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.config.authTokenKey, token);
    }
  }

  clearAuthToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.config.authTokenKey);
    }
  }

  getAuthToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.config.authTokenKey);
    }
    return null;
  }
}

// Global instance management
let globalClient = null;

export function createVormiaClient(config) {
  globalClient = new VormiaClient(config);
  return globalClient;
}

export function getGlobalVormiaClient() {
  if (!globalClient) {
    throw new Error(
      "VormiaClient has not been initialized. Call createVormiaClient first."
    );
  }
  return globalClient;
}

export function setGlobalVormiaClient(client) {
  globalClient = client;
}
